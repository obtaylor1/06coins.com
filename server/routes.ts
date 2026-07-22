import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated, isAdmin } from "./auth.js";
import type Stripe from "stripe";
import QRCode from "qrcode";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { db } from "../db/index.js";
import { and, desc, eq, sql } from "drizzle-orm";
import { activityLogs, certificates, customers, inventory as inventoryTable, inventoryAdjustments, notifications, orders as ordersTable, storeSettings } from "../shared/schema.js";
import { loadStripeRuntime, removeStripeCredentials, saveStripeCredentials, stripeStatus } from "./services/stripeConfig.js";

// Server-side product catalog (price authority)
// SECURITY: This is the source of truth for all product pricing
const PRODUCT_CATALOG = new Map([
  ['coin120year', { name: '120-Year Anniversary Commemorative Coin — 4" Premium Edition', price: 39.06, type: 'main-coin' }],
  ['jewelset7', { name: 'Complete 7-Jewel Collector\'s Set — 3" Coins', price: 120.06, type: 'jewel-set' }],
  ['jewel_callis', { name: 'Callis — The Philosopher', price: 19.06, type: 'jewel-coin' }],
  ['jewel_chapman', { name: 'Chapman — The Educator', price: 19.06, type: 'jewel-coin' }],
  ['jewel_jones', { name: 'Jones — The Organizer', price: 19.06, type: 'jewel-coin' }],
  ['jewel_kelley', { name: 'Kelley — The Engineer', price: 19.06, type: 'jewel-coin' }],
  ['jewel_murray', { name: 'Murray — The Scholar', price: 19.06, type: 'jewel-coin' }],
  ['jewel_ogle', { name: 'Ogle — The Visionary', price: 19.06, type: 'jewel-coin' }],
  ['jewel_tandy', { name: 'Tandy — The Architect', price: 19.06, type: 'jewel-coin' }],
]);

const MAX_ITEM_QUANTITY = 99;
const checkoutItemSchema = z.object({
  id: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
});
const checkoutRequestSchema = z.union([
  z.object({ cartItems: z.array(checkoutItemSchema).min(1).max(PRODUCT_CATALOG.size) }),
  z.object({ quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY) }),
]);
const finalizeOrderSchema = z.object({
  paymentIntentId: z.string().trim().min(1),
});

type CheckoutItem = z.infer<typeof checkoutItemSchema>;

function mergeCheckoutItems(items: CheckoutItem[]): CheckoutItem[] {
  const quantities = new Map<string, number>();
  for (const item of items) {
    const nextQuantity = (quantities.get(item.id) ?? 0) + item.quantity;
    if (nextQuantity > MAX_ITEM_QUANTITY) {
      throw new Error(`Quantity for ${item.id} exceeds the per-product limit`);
    }
    quantities.set(item.id, nextQuantity);
  }
  return Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
}

function calculateOrderAmount(items: CheckoutItem[]): number {
  return items.reduce((total, item) => {
    const product = PRODUCT_CATALOG.get(item.id);
    if (!product) throw new Error(`Invalid product: ${item.id}`);
    return total + Math.round(product.price * 100) * item.quantity;
  }, 0);
}

function isPaidOrder(order: { status: string }): boolean {
  return ['processing', 'shipped', 'delivered', 'completed'].includes(order.status);
}

class FulfillmentError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

async function dispatchOrderNotifications(paymentIntentId: string) {
  const order = await storage.getOrderByPaymentIntent(paymentIntentId);
  if (!order) return;

  if (order.customerEmail) {
    import('./services/emailService.js').then(({ sendOrderConfirmationEmail }) =>
      sendOrderConfirmationEmail(order)
    ).catch((error: unknown) => console.error('[EMAIL] Order confirmation failed:', error));
  }

}

async function fulfillPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
) {
  if (paymentIntent.status !== 'succeeded') {
    throw new FulfillmentError(`Payment not succeeded (${paymentIntent.status})`);
  }
  if (paymentIntent.currency !== 'usd') {
    throw new FulfillmentError('Unsupported payment currency');
  }

  const existingOrder = await storage.getOrderByPaymentIntent(paymentIntent.id);
  if (existingOrder) {
    const mainCoinInventory = await storage.getInventoryByProductId('coin120year');
    const existingCertificates = await db.select({ serialNumber: certificates.serialNumber }).from(certificates).where(eq(certificates.orderId, existingOrder.id));
    return {
      remainingStock: mainCoinInventory?.remainingStock ?? 0,
      alreadyProcessed: true,
      certificates: existingCertificates,
    };
  }

  let metadataItems: unknown;
  try {
    metadataItems = JSON.parse(paymentIntent.metadata?.items ?? '');
  } catch {
    throw new FulfillmentError('Payment is missing valid order details');
  }
  const parsedItems = z.array(checkoutItemSchema)
    .min(1)
    .max(PRODUCT_CATALOG.size)
    .safeParse(metadataItems);
  if (!parsedItems.success) {
    throw new FulfillmentError('Payment contains invalid order details');
  }

  const items = mergeCheckoutItems(parsedItems.data);
  const expectedAmount = calculateOrderAmount(items);
  if (paymentIntent.amount !== expectedAmount) {
    throw new FulfillmentError('Payment amount does not match order details');
  }

  const paymentMethod = typeof paymentIntent.payment_method === 'object'
    ? paymentIntent.payment_method
    : null;
  const metadata = paymentIntent.metadata || {};
  const cartItems = items.map((item) => {
    const product = PRODUCT_CATALOG.get(item.id)!;
    return {
      id: item.id,
      name: product.name,
      quantity: item.quantity,
      price: Math.round(product.price * 100),
    };
  });

  const customerEmail = paymentIntent.receipt_email || paymentMethod?.billing_details.email || null;
  const customerName = paymentIntent.shipping?.name || paymentMethod?.billing_details.name || 'Unknown Customer';
  let customerId: string | null = null;
  if (customerEmail) {
    const names = customerName.trim().split(/\s+/);
    await db.insert(customers).values({
      email: customerEmail.toLowerCase(),
      firstName: names[0] || null,
      lastName: names.slice(1).join(' ') || null,
      phone: paymentIntent.shipping?.phone || null,
      defaultAddress: paymentIntent.shipping?.address || null,
      status: 'active',
      source: 'order',
    }).onDuplicateKeyUpdate({
      set: { phone: paymentIntent.shipping?.phone || null, defaultAddress: paymentIntent.shipping?.address || null, updatedAt: new Date() },
    });
    const [customer] = await db.select().from(customers).where(eq(customers.email, customerEmail.toLowerCase())).limit(1);
    customerId = customer.id;
  }

  try {
    const result = await storage.executeInventoryTransaction(items, {
      stripePaymentIntentId: paymentIntent.id,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: paymentIntent.amount,
      status: 'processing',
      customerId,
      customerName,
      customerEmail,
      customerPhone: paymentIntent.shipping?.phone || null,
      shippingAddress: paymentIntent.shipping?.address || null,
      cartItems,
      emailConfirmationSent: 0,
    });

    const mainCoinUpdate = result.updatedInventories.find((item) => item.productId === 'coin120year');
    void dispatchOrderNotifications(paymentIntent.id);

    return {
      remainingStock: mainCoinUpdate?.remainingStock ?? 0,
      updatedInventories: result.updatedInventories,
      certificates: result.certificates.map(({ serialNumber }) => ({ serialNumber })),
    };
  } catch (error) {
    const concurrentlyCreatedOrder = await storage.getOrderByPaymentIntent(paymentIntent.id);
    if (concurrentlyCreatedOrder) {
      const mainCoinInventory = await storage.getInventoryByProductId('coin120year');
      return {
        remainingStock: mainCoinInventory?.remainingStock ?? 0,
        alreadyProcessed: true,
      };
    }
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      throw new FulfillmentError(
        'Stock was exhausted after payment. Contact support for resolution.',
        409,
      );
    }
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware
  setupAuth(app);

  app.get("/api/health", async (_req, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json({ status: "ok", database: "connected" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({ status: "degraded", database: "unavailable" });
    }
  });

  const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

  // Initialize all products inventory on server startup
  try {
    await storage.initializeAllProducts();
    console.log('✅ Product inventory initialized successfully');
  } catch (error) {
    console.error('⚠️ Error initializing inventory:', error);
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, isAdmin, (_req, res) => res.json(res.locals.adminUser));

  app.get('/api/payments/config', async (_req, res) => {
    const runtime = await loadStripeRuntime();
    if (!runtime) return res.status(503).json({ configured: false, message: 'Payments are not configured' });
    res.set('Cache-Control', 'no-store');
    res.json({ configured: true, publishableKey: runtime.publishableKey, mode: runtime.mode });
  });

  app.get('/api/admin/stripe/status', isAuthenticated, isAdmin, async (req, res) => {
    const runtime = await loadStripeRuntime();
    const origin = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    if (!runtime) return res.json({ ...stripeStatus(null), webhookUrl: `${origin}/api/webhooks/stripe` });
    try {
      const account = await runtime.client.accounts.retrieve();
      res.json({ ...stripeStatus(runtime), ready: Boolean(account.charges_enabled && account.details_submitted && runtime.webhookSecret), apiConnected: true, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, detailsSubmitted: account.details_submitted, webhookUrl: `${origin}/api/webhooks/stripe` });
    } catch {
      res.json({ ...stripeStatus(runtime), ready: false, apiConnected: false, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false, webhookUrl: `${origin}/api/webhooks/stripe` });
    }
  });

  app.put('/api/admin/stripe/credentials', isAuthenticated, isAdmin, async (req, res) => {
    const parsed = z.object({ publishableKey: z.string().trim().min(20).max(300), secretKey: z.string().trim().min(20).max(300), webhookSecret: z.string().trim().min(16).max(300) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Enter all three Stripe credentials' });
    try {
      const status = await saveStripeCredentials(parsed.data, res.locals.adminUser.id);
      await db.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: 'integration.stripe_configured', entityType: 'integration', entityId: 'stripe', details: { mode: status.mode, accountId: status.accountId } });
      res.json(status);
    } catch (error) {
      const message = error instanceof Error && !/api key|authentication/i.test(error.message) ? error.message : 'Stripe rejected these credentials. Check the key mode and try again.';
      res.status(400).json({ message });
    }
  });

  app.delete('/api/admin/stripe/credentials', isAuthenticated, isAdmin, async (_req, res) => {
    await removeStripeCredentials();
    await db.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: 'integration.stripe_disconnected', entityType: 'integration', entityId: 'stripe', details: {} });
    res.json({ removed: true });
  });

  const serialSchema = z.string().trim().toUpperCase().regex(/^1906-LE-\d{6}$/);
  const publicCertificateRecord = (certificate: typeof certificates.$inferSelect) => {
    const nameParts = (certificate.purchaserName || '').trim().split(/\s+/).filter(Boolean);
    const suffixes = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv']);
    const surname = [...nameParts].reverse().find(part => !suffixes.has(part.toLowerCase()));
    const purchaser = nameParts.length
      ? `${nameParts[0]}${surname && surname !== nameParts[0] ? ` ${surname[0]}.` : ''}`
      : 'Private collector';
    return {
      serialNumber: certificate.serialNumber,
      editionNumber: certificate.editionNumber,
      editionSize: certificate.editionSize,
      edition: '1906 Limited Edition',
      status: certificate.status,
      diameter: certificate.diameter,
      finish: certificate.finish,
      material: certificate.material,
      issuedAt: certificate.issuedAt,
      purchaser,
      certificate: certificate.status === 'active' ? 'Active' : certificate.status,
    };
  };

  // Public authenticity lookup. Full customer details are never returned here.
  app.get('/api/certificates/verify/:serial', async (req, res) => {
    const parsed = serialSchema.safeParse(req.params.serial);
    if (!parsed.success) return res.status(400).json({ message: 'Enter a serial in the format 1906-LE-000127' });
    const [certificate] = await db.select().from(certificates).where(eq(certificates.serialNumber, parsed.data)).limit(1);
    if (!certificate) return res.status(404).json({ message: 'No authenticity record matches this serial number' });
    await db.update(certificates).set({
      verificationCount: sql`${certificates.verificationCount} + 1`,
      lastVerifiedAt: new Date(),
    }).where(eq(certificates.id, certificate.id));
    res.set('Cache-Control', 'no-store');
    res.json(publicCertificateRecord(certificate));
  });

  // A real scannable QR that always opens the single verification page.
  app.get('/api/certificates/:serial/qr.svg', async (req, res) => {
    const parsed = serialSchema.safeParse(req.params.serial);
    if (!parsed.success) return res.status(400).send('Invalid serial number');
    const [certificate] = await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.serialNumber, parsed.data)).limit(1);
    if (!certificate) return res.status(404).send('Certificate not found');
    const origin = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const verificationUrl = `${origin}/verify?serial=${encodeURIComponent(parsed.data)}`;
    const svg = await QRCode.toString(verificationUrl, { type: 'svg', errorCorrectionLevel: 'H', margin: 2, color: { dark: '#17130b', light: '#f3ead1' } });
    res.type('image/svg+xml').set('Cache-Control', 'public, max-age=86400').send(svg);
  });
  
  // Get current inventory for main coin (used by header stock counter)
  app.get("/api/inventory", async (req, res) => {
    try {
      // MySQL is the transactional source of truth for authoritative stock.
      const inventory = await storage.getInventoryByProductId('coin120year');
      
      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      
      res.json({
        remainingStock: inventory.remainingStock,
        productName: inventory.productName,
        lastUpdated: inventory.lastUpdated,
      });
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ message: "Error fetching inventory: " + error.message });
    }
  });

  // Get all inventory (all products)
  app.get("/api/inventory/all", async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      res.json(inventory);
    } catch (error: any) {
      console.error('Error fetching all inventory:', error);
      res.status(500).json({ message: "Error fetching all inventory: " + error.message });
    }
  });

  // Get inventory for specific product
  app.get("/api/inventory/:productId", async (req, res) => {
    try {
      const inventory = await storage.getInventoryByProductId(req.params.productId);
      
      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found for product" });
      }
      
      res.json(inventory);
    } catch (error: any) {
      console.error('Error fetching product inventory:', error);
      res.status(500).json({ message: "Error fetching product inventory: " + error.message });
    }
  });

  // Legacy endpoint removed - use /api/admin/inventory instead (protected)

  // Decrement inventory after payment verified
  // SECURITY: Verifies Stripe payment succeeded before decrementing
  app.post("/api/inventory/decrement", checkoutLimiter, async (req, res) => {
    const stripeRuntime = await loadStripeRuntime();
    if (!stripeRuntime) {
      return res.status(503).json({ message: "Payment system unavailable" });
    }

    try {
      const parsedRequest = finalizeOrderSchema.safeParse(req.body);
      if (!parsedRequest.success) {
        return res.status(400).json({ message: "Invalid order finalization request" });
      }
      const { paymentIntentId } = parsedRequest.data;

      const paymentIntent = await stripeRuntime.client.paymentIntents.retrieve(paymentIntentId, {
        expand: ['payment_method'],
      });
      const result = await fulfillPaymentIntent(paymentIntent);
      res.json(result);
    } catch (error: any) {
      console.error('Error decrementing inventory:', error);
      const status = error instanceof FulfillmentError ? error.status : 500;
      res.status(status).json({
        message: status === 500 ? "Unable to finalize the order" : error.message,
      });
    }
  });

  // Stripe payment intent creation - reference: javascript_stripe blueprint
  app.post("/api/create-payment-intent", checkoutLimiter, async (req, res) => {
    const stripeRuntime = await loadStripeRuntime();
    if (!stripeRuntime) {
      return res.status(503).json({ 
        message: "Payment processing is currently unavailable. Please contact support." 
      });
    }

    try {
      const parsedRequest = checkoutRequestSchema.safeParse(req.body);
      if (!parsedRequest.success) {
        return res.status(400).json({ message: "Invalid checkout request" });
      }

      let metadataItems: CheckoutItem[];
      if ('cartItems' in parsedRequest.data) {
        try {
          metadataItems = mergeCheckoutItems(parsedRequest.data.cartItems);
        } catch (error) {
          return res.status(400).json({ message: (error as Error).message });
        }
        // New cart system: Calculate total from SERVER-SIDE catalog
        // SECURITY: Never trust client prices - use server catalog
        for (const item of metadataItems) {
          const catalogProduct = PRODUCT_CATALOG.get(item.id);
          if (!catalogProduct) {
            return res.status(400).json({ 
              message: `Invalid product: ${item.id}`,
            });
          }
          
          // Check inventory for each product
          const inventory = await storage.getInventoryByProductId(item.id);
          if (!inventory || inventory.remainingStock < item.quantity) {
            return res.status(400).json({ 
              message: `Insufficient stock for ${catalogProduct.name}`,
              productId: item.id,
              availableStock: inventory?.remainingStock || 0,
              requestedQuantity: item.quantity,
            });
          }
        }
      } else {
        // Legacy single quantity system
        const quantity = parsedRequest.data.quantity;
        metadataItems = [{ id: 'coin120year', quantity }];
        
        // Check inventory for main coin
        const inventory = await storage.getInventoryByProductId('coin120year');
        if (!inventory || inventory.remainingStock < quantity) {
          return res.status(400).json({ 
            message: "Insufficient stock available",
            remainingStock: inventory?.remainingStock || 0,
          });
        }
      }

      const amount = calculateOrderAmount(metadataItems);

      const paymentIntent = await stripeRuntime.client.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          items: JSON.stringify(metadataItems),
          totalItems: metadataItems.reduce((sum, item) => sum + item.quantity, 0).toString(),
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ message: "Unable to initialize checkout" });
    }
  });

  app.post("/api/webhooks/stripe", async (req, res) => {
    const stripeRuntime = await loadStripeRuntime();
    if (!stripeRuntime) {
      return res.status(503).json({ message: "Stripe webhook is not configured" });
    }
    const signature = req.get('stripe-signature');
    if (!signature || !Buffer.isBuffer(req.rawBody)) {
      return res.status(400).json({ message: "Invalid webhook request" });
    }

    try {
      const event = stripeRuntime.client.webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeRuntime.webhookSecret,
      );
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = await stripeRuntime.client.paymentIntents.retrieve(event.data.object.id, {
          expand: ['payment_method'],
        });
        await fulfillPaymentIntent(paymentIntent);
      }
      res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook processing failed:', error);
      res.status(400).json({ message: "Webhook processing failed" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.patch("/api/admin/inventory", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const parsed = z.object({ productId: z.string().min(1), remainingStock: z.number().int().min(0).max(1_000_000), reason: z.string().min(2).max(100).default("Manual count correction"), notes: z.string().max(1000).optional(), referenceNumber: z.string().max(100).optional() }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Valid product, quantity, and adjustment reason are required" });
      const { productId, remainingStock, reason, notes, referenceNumber } = parsed.data;
      const previous = await storage.getInventoryByProductId(productId);
      if (!previous) return res.status(404).json({ message: "Product not found" });
      const updatedInventory = await db.transaction(async tx => {
        await tx.update(inventoryTable).set({ remainingStock, lastUpdated: new Date() }).where(eq(inventoryTable.productId, productId));
        const [updated] = await tx.select().from(inventoryTable).where(eq(inventoryTable.productId, productId)).limit(1);
        await tx.insert(inventoryAdjustments).values({ productId, previousQuantity: previous.remainingStock, quantityChange: remainingStock - previous.remainingStock, newQuantity: remainingStock, reason, notes, referenceNumber, createdBy: res.locals.adminUser.id });
        await tx.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: "inventory.adjusted", entityType: "product", entityId: productId, details: { previous: previous.remainingStock, next: remainingStock, reason } });
        return updated;
      });
      
      res.json({
        productId: updatedInventory.productId,
        remainingStock: updatedInventory.remainingStock,
        lastUpdated: updatedInventory.lastUpdated,
      });
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ message: "Error updating inventory: " + error.message });
    }
  });

  // Admin analytics endpoint
  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const allInventory = await storage.getAllInventory();
      
      const paidOrders = orders.filter(isPaidOrder);
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCoinsSold = paidOrders.reduce((sum, order) => sum + order.quantity, 0);
      
      // Get main coin inventory for header display
      const mainCoinInventory = allInventory.find(inv => inv.productId === 'coin120year');
      const initialStock = mainCoinInventory?.initialStock || 1906;
      const remainingStock = mainCoinInventory?.remainingStock || 0;
      
      // Calculate profit based on actual costs
      // 4" coin: Cost $8.50, Selling $39.06 → Profit $30.56
      // 3" coin: Cost $3.30, Selling $19.06 → Profit $15.76
      // Jewel set (7 × 3" coins): Cost $23.10 (7 × $3.30), Selling $120.06 → Profit $96.96
      const COST_4_INCH = 8.50;
      const COST_3_INCH = 3.30;
      const COST_JEWEL_SET = 3.30 * 7; // $23.10
      const PROFIT_4_INCH = 39.06 - COST_4_INCH; // $30.56
      const PROFIT_3_INCH = 19.06 - COST_3_INCH; // $15.76
      const PROFIT_JEWEL_SET = 120.06 - COST_JEWEL_SET; // $96.96
      
      // Calculate total profit by iterating through order items
      let totalProfit = 0;
      paidOrders.forEach(order => {
        if (order.cartItems && Array.isArray(order.cartItems)) {
          order.cartItems.forEach((item: any) => {
            if (item.id === 'coin120year') {
              totalProfit += item.quantity * PROFIT_4_INCH * 100; // in cents
            } else if (item.id === 'jewelset7') {
              // Jewel set: 7 coins sold as a bundle
              totalProfit += item.quantity * PROFIT_JEWEL_SET * 100; // in cents
            } else if (item.id?.startsWith('jewel_')) {
              // Individual jewel coins
              totalProfit += item.quantity * PROFIT_3_INCH * 100; // in cents
            }
          });
        }
      });
      
      res.json({
        totalOrders: paidOrders.length,
        totalRevenue, // in cents
        totalCoinsSold,
        totalProfit, // in cents
        initialStock,
        remainingStock,
        soldPercentage: ((totalCoinsSold / initialStock) * 100).toFixed(1),
        allInventory, // Include all product inventory for admin
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: "Error fetching analytics: " + error.message });
    }
  });


  // Admin sales chart data endpoint (last 30 days)
  app.get("/api/admin/sales-chart", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const paidOrders = orders.filter(isPaidOrder);
      
      // Generate last 30 days
      const days = 30;
      const now = new Date();
      const salesByDay = new Map<string, { revenue: number; units: number }>();
      
      // Initialize all days with zero
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        salesByDay.set(dateStr, { revenue: 0, units: 0 });
      }
      
      // Aggregate orders by day
      paidOrders.forEach(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (salesByDay.has(orderDate)) {
          const day = salesByDay.get(orderDate)!;
          day.revenue += order.totalAmount;
          day.units += order.quantity;
        }
      });
      
      // Convert to array format for chart
      const chartData = Array.from(salesByDay.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue / 100, // Convert cents to dollars
        units: data.units,
      }));
      
      res.json(chartData);
    } catch (error: any) {
      console.error('Error fetching sales chart data:', error);
      res.status(500).json({ message: "Error fetching sales chart data: " + error.message });
    }
  });

  // Complete report service. Monetary values are returned in cents so exports
  // preserve exact accounting values and the client controls presentation.
  app.get('/api/admin/reports/:type', isAuthenticated, isAdmin, async (req, res) => {
    const reportType = z.enum(['sales', 'profitability', 'orders', 'products', 'inventory', 'customers', 'taxes', 'shipping', 'staff-activity']).safeParse(req.params.type);
    const period = z.enum(['7', '30', '90', 'all']).safeParse(String(req.query.period || '30'));
    if (!reportType.success || !period.success) return res.status(400).json({ message: 'Invalid report type or period' });

    const now = new Date();
    const start = period.data === 'all' ? null : new Date(now.getTime() - Number(period.data) * 86_400_000);
    const allOrders = await storage.getAllOrders();
    const periodOrders = allOrders.filter(order => !start || new Date(order.createdAt) >= start);
    const paidOrders = periodOrders.filter(isPaidOrder);
    const allInventory = await storage.getAllInventory();
    const money = (value: number) => Math.round(value);
    const itemCost = (id: string) => id === 'coin120year' ? 850 : id === 'jewelset7' ? 2310 : id.startsWith('jewel_') ? 330 : 0;
    const itemRows = paidOrders.flatMap(order => Array.isArray(order.cartItems) ? (order.cartItems as any[]).map(item => ({ ...item, order })) : []);
    const revenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const units = paidOrders.reduce((sum, order) => sum + order.quantity, 0);
    const cost = itemRows.reduce((sum, item) => sum + itemCost(item.id) * Number(item.quantity || 0), 0);
    const base = { type: reportType.data, period: period.data, generatedAt: now, note: null as string | null, metrics: [] as any[], columns: [] as any[], rows: [] as any[], chart: null as any };

    if (reportType.data === 'sales') {
      const days = period.data === 'all' ? Math.max(1, Math.ceil((now.getTime() - Math.min(...paidOrders.map(order => new Date(order.createdAt).getTime()), now.getTime())) / 86_400_000) + 1) : Number(period.data);
      const byDay = new Map<string, { date: string; revenue: number; orders: number; units: number }>();
      for (let i = Math.min(days, 3660) - 1; i >= 0; i--) { const date = new Date(now); date.setDate(date.getDate() - i); const key = date.toISOString().slice(0, 10); byDay.set(key, { date: key, revenue: 0, orders: 0, units: 0 }); }
      paidOrders.forEach(order => { const row = byDay.get(new Date(order.createdAt).toISOString().slice(0, 10)); if (row) { row.revenue += order.totalAmount; row.orders += 1; row.units += order.quantity; } });
      base.metrics = [{ label: 'Revenue', value: revenue, format: 'money' }, { label: 'Paid orders', value: paidOrders.length, format: 'number' }, { label: 'Units sold', value: units, format: 'number' }, { label: 'Average order value', value: paidOrders.length ? money(revenue / paidOrders.length) : 0, format: 'money' }];
      base.columns = [{ key: 'date', label: 'Date' }, { key: 'revenue', label: 'Revenue', format: 'money' }, { key: 'orders', label: 'Orders' }, { key: 'units', label: 'Units' }];
      base.rows = Array.from(byDay.values()); base.chart = { key: 'revenue', label: 'Revenue', format: 'money' };
    } else if (reportType.data === 'profitability') {
      const grouped = new Map<string, any>(); itemRows.forEach(item => { const row = grouped.get(item.id) || { product: item.name, units: 0, revenue: 0, cost: 0, grossProfit: 0, margin: 0 }; row.units += item.quantity; row.revenue += item.price * item.quantity; row.cost += itemCost(item.id) * item.quantity; row.grossProfit = row.revenue - row.cost; row.margin = row.revenue ? Number(((row.grossProfit / row.revenue) * 100).toFixed(1)) : 0; grouped.set(item.id, row); });
      base.metrics = [{ label: 'Revenue', value: revenue, format: 'money' }, { label: 'Product cost', value: cost, format: 'money' }, { label: 'Gross profit', value: revenue - cost, format: 'money' }, { label: 'Gross margin', value: revenue ? Number((((revenue - cost) / revenue) * 100).toFixed(1)) : 0, format: 'percent' }];
      base.columns = [{ key: 'product', label: 'Product' }, { key: 'units', label: 'Units' }, { key: 'revenue', label: 'Revenue', format: 'money' }, { key: 'cost', label: 'Product cost', format: 'money' }, { key: 'grossProfit', label: 'Gross profit', format: 'money' }, { key: 'margin', label: 'Margin', format: 'percent' }];
      base.rows = Array.from(grouped.values()).sort((a, b) => b.grossProfit - a.grossProfit); base.chart = { key: 'grossProfit', nameKey: 'product', label: 'Gross profit', format: 'money' }; base.note = 'Gross profit uses the product costs configured by 06 Coins and excludes payment fees, taxes, refunds, and shipping expense.';
    } else if (reportType.data === 'orders') {
      base.metrics = [{ label: 'All orders', value: periodOrders.length, format: 'number' }, { label: 'Paid', value: paidOrders.length, format: 'number' }, { label: 'Awaiting shipment', value: periodOrders.filter(order => order.fulfillmentStatus === 'unfulfilled' && isPaidOrder(order)).length, format: 'number' }, { label: 'Cancelled / failed', value: periodOrders.filter(order => ['cancelled', 'failed'].includes(order.status)).length, format: 'number' }];
      base.columns = [{ key: 'order', label: 'Order' }, { key: 'date', label: 'Date' }, { key: 'customer', label: 'Customer' }, { key: 'payment', label: 'Payment' }, { key: 'fulfillment', label: 'Fulfillment' }, { key: 'delivery', label: 'Delivery' }, { key: 'total', label: 'Total', format: 'money' }];
      base.rows = periodOrders.map(order => ({ order: order.id, date: order.createdAt, customer: order.customerName || 'Unknown', payment: order.paymentStatus, fulfillment: order.fulfillmentStatus, delivery: order.deliveryStatus, total: order.totalAmount }));
    } else if (reportType.data === 'products') {
      const grouped = new Map<string, any>(); itemRows.forEach(item => { const row = grouped.get(item.id) || { sku: item.id, product: item.name, units: 0, orders: 0, revenue: 0 }; row.units += item.quantity; row.orders += 1; row.revenue += item.price * item.quantity; grouped.set(item.id, row); });
      base.metrics = [{ label: 'Products sold', value: grouped.size, format: 'number' }, { label: 'Units sold', value: units, format: 'number' }, { label: 'Product revenue', value: revenue, format: 'money' }, { label: 'Top product', value: Array.from(grouped.values()).sort((a, b) => b.units - a.units)[0]?.product || '—', format: 'text' }];
      base.columns = [{ key: 'product', label: 'Product' }, { key: 'sku', label: 'SKU' }, { key: 'units', label: 'Units' }, { key: 'orders', label: 'Order lines' }, { key: 'revenue', label: 'Revenue', format: 'money' }];
      base.rows = Array.from(grouped.values()).sort((a, b) => b.units - a.units); base.chart = { key: 'units', nameKey: 'product', label: 'Units sold', format: 'number' };
    } else if (reportType.data === 'inventory') {
      base.metrics = [{ label: 'Products', value: allInventory.length, format: 'number' }, { label: 'Units available', value: allInventory.reduce((sum, item) => sum + item.remainingStock, 0), format: 'number' }, { label: 'Low stock', value: allInventory.filter(item => item.remainingStock > 0 && item.remainingStock <= item.reorderThreshold).length, format: 'number' }, { label: 'Out of stock', value: allInventory.filter(item => item.remainingStock === 0).length, format: 'number' }];
      base.columns = [{ key: 'product', label: 'Product' }, { key: 'sku', label: 'SKU' }, { key: 'available', label: 'Available' }, { key: 'initial', label: 'Initial' }, { key: 'sold', label: 'Sold' }, { key: 'reorder', label: 'Reorder point' }, { key: 'status', label: 'Status' }];
      base.rows = allInventory.map(item => ({ product: item.productName, sku: item.sku || item.productId, available: item.remainingStock, initial: item.initialStock, sold: item.initialStock - item.remainingStock, reorder: item.reorderThreshold, status: item.remainingStock === 0 ? 'Out of stock' : item.remainingStock <= item.reorderThreshold ? 'Low stock' : 'Healthy' })); base.chart = { key: 'available', nameKey: 'product', label: 'Available', format: 'number' }; base.note = 'Inventory is a current snapshot and is not restricted by the selected order date range.';
    } else if (reportType.data === 'customers') {
      const grouped = new Map<string, any>(); paidOrders.forEach(order => { const key = (order.customerEmail || order.customerName || order.id).toLowerCase(); const row = grouped.get(key) || { customer: order.customerName || 'Unknown', email: order.customerEmail || '—', orders: 0, units: 0, spent: 0, lastOrder: order.createdAt }; row.orders += 1; row.units += order.quantity; row.spent += order.totalAmount; if (new Date(order.createdAt) > new Date(row.lastOrder)) row.lastOrder = order.createdAt; grouped.set(key, row); });
      const rows = Array.from(grouped.values()).sort((a, b) => b.spent - a.spent); base.metrics = [{ label: 'Purchasing customers', value: rows.length, format: 'number' }, { label: 'Returning customers', value: rows.filter(row => row.orders > 1).length, format: 'number' }, { label: 'Customer revenue', value: revenue, format: 'money' }, { label: 'Average customer value', value: rows.length ? money(revenue / rows.length) : 0, format: 'money' }];
      base.columns = [{ key: 'customer', label: 'Customer' }, { key: 'email', label: 'Email' }, { key: 'orders', label: 'Orders' }, { key: 'units', label: 'Units' }, { key: 'spent', label: 'Total spent', format: 'money' }, { key: 'lastOrder', label: 'Last order', format: 'date' }]; base.rows = rows; base.chart = { key: 'spent', nameKey: 'customer', label: 'Total spent', format: 'money' };
    } else if (reportType.data === 'taxes') {
      base.metrics = [{ label: 'Recorded tax', value: 0, format: 'money' }, { label: 'Orders with tax data', value: 0, format: 'number' }, { label: 'Paid order revenue', value: revenue, format: 'money' }, { label: 'Data status', value: 'Not configured', format: 'text' }];
      base.columns = [{ key: 'jurisdiction', label: 'Jurisdiction' }, { key: 'orders', label: 'Orders' }, { key: 'taxableSales', label: 'Recorded taxable sales', format: 'money' }, { key: 'taxCollected', label: 'Tax collected', format: 'money' }]; base.rows = [{ jurisdiction: 'No tax data recorded', orders: 0, taxableSales: 0, taxCollected: 0 }]; base.note = 'Stripe tax amounts are not currently stored on orders. Connect Stripe Tax and persist its transaction breakdown before using this report for filing.';
    } else if (reportType.data === 'shipping') {
      const shipped = periodOrders.filter(order => order.shippedAt); const delivered = periodOrders.filter(order => order.deliveredAt); const avgHours = shipped.length ? shipped.reduce((sum, order) => sum + (new Date(order.shippedAt!).getTime() - new Date(order.createdAt).getTime()) / 3_600_000, 0) / shipped.length : 0;
      base.metrics = [{ label: 'Awaiting shipment', value: paidOrders.filter(order => !order.shippedAt).length, format: 'number' }, { label: 'Shipped', value: shipped.length, format: 'number' }, { label: 'Delivered', value: delivered.length, format: 'number' }, { label: 'Average fulfillment', value: Number(avgHours.toFixed(1)), format: 'hours' }];
      base.columns = [{ key: 'order', label: 'Order' }, { key: 'customer', label: 'Customer' }, { key: 'carrier', label: 'Carrier' }, { key: 'tracking', label: 'Tracking' }, { key: 'status', label: 'Delivery status' }, { key: 'ordered', label: 'Ordered', format: 'date' }, { key: 'shipped', label: 'Shipped', format: 'date' }, { key: 'delivered', label: 'Delivered', format: 'date' }];
      base.rows = paidOrders.map(order => ({ order: order.id, customer: order.customerName || 'Unknown', carrier: order.carrier || '—', tracking: order.trackingNumber || '—', status: order.deliveryStatus, ordered: order.createdAt, shipped: order.shippedAt, delivered: order.deliveredAt }));
    } else {
      const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)); const filtered = logs.filter(log => !start || new Date(log.createdAt) >= start); const actors = new Set(filtered.map(log => log.actorId).filter(Boolean));
      base.metrics = [{ label: 'Recorded actions', value: filtered.length, format: 'number' }, { label: 'Active staff', value: actors.size, format: 'number' }, { label: 'Inventory changes', value: filtered.filter(log => log.action === 'inventory.adjusted').length, format: 'number' }, { label: 'Customer records added', value: filtered.filter(log => log.action === 'customer.created').length, format: 'number' }];
      base.columns = [{ key: 'date', label: 'Date', format: 'date' }, { key: 'staff', label: 'Staff ID' }, { key: 'action', label: 'Action' }, { key: 'recordType', label: 'Record type' }, { key: 'record', label: 'Record ID' }]; base.rows = filtered.map(log => ({ date: log.createdAt, staff: log.actorId || 'System', action: log.action, recordType: log.entityType, record: log.entityId || '—' })); base.note = 'Staff activity includes actions written to the immutable operations ledger.';
    }
    res.json(base);
  });

  // Admin product sales ranking endpoint
  app.get("/api/admin/product-sales", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // For now, we'll aggregate based on order quantity
      // In a real system, orders would have line items per product
      const allInventory = await storage.getAllInventory();
      
      // Calculate sold units per product
      const productSales = allInventory.map(inv => {
        const sold = inv.initialStock - inv.remainingStock;
        const totalUnits = allInventory.reduce((sum, i) => sum + (i.initialStock - i.remainingStock), 0);
        const percentage = totalUnits > 0 ? ((sold / totalUnits) * 100).toFixed(1) : '0.0';
        
        return {
          productId: inv.productId,
          productName: inv.productName,
          unitsSold: sold,
          percentage: parseFloat(percentage),
        };
      });
      
      // Sort by units sold descending
      productSales.sort((a, b) => b.unitsSold - a.unitsSold);
      
      res.json(productSales);
    } catch (error: any) {
      console.error('Error fetching product sales:', error);
      res.status(500).json({ message: "Error fetching product sales: " + error.message });
    }
  });

  // Admin all inventory endpoint
  app.get("/api/admin/all-inventory", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allInventory = await storage.getAllInventory();
      const orders = await storage.getAllOrders();
      const paidOrders = orders.filter(isPaidOrder);
      
      // Calculate average daily sales over last 30 days for each product
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentOrders = paidOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
      
      // For simplicity, we'll estimate based on total sold / days active
      const daysActive = Math.max(1, Math.ceil((now.getTime() - new Date(recentOrders[0]?.createdAt || now).getTime()) / (24 * 60 * 60 * 1000)));
      
      const enhancedInventory = allInventory.map(inv => {
        const sold = inv.initialStock - inv.remainingStock;
        const avgDailySales = sold / Math.max(daysActive, 1);
        const daysOfStock = avgDailySales > 0 ? Math.ceil(inv.remainingStock / avgDailySales) : 999;
        
        // Determine reorder level (10% of initial stock or 50, whichever is greater)
        const reorderLevel = Math.max(Math.ceil(inv.initialStock * 0.1), 50);
        
        let status = 'In Stock';
        if (inv.remainingStock === 0) {
          status = 'Out of Stock';
        } else if (inv.remainingStock <= reorderLevel || daysOfStock < 14) {
          status = 'Low Stock';
        }
        
        return {
          ...inv,
          sold,
          avgDailySales: parseFloat(avgDailySales.toFixed(2)),
          daysOfStock: daysOfStock === 999 ? null : daysOfStock,
          reorderLevel,
          status,
        };
      });
      
      res.json(enhancedInventory);
    } catch (error: any) {
      console.error('Error fetching all inventory:', error);
      res.status(500).json({ message: "Error fetching all inventory: " + error.message });
    }
  });

  // Admin endpoint to mark order as shipped (sends shipping confirmation email)
  app.patch("/api/admin/orders/:id/ship", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const shippingUpdate = z.object({
        trackingNumber: z.string().trim().min(1).max(100),
        carrier: z.enum(['USPS', 'FedEx', 'UPS', 'DHL', 'Other']),
      }).safeParse(req.body);
      if (!shippingUpdate.success) {
        return res.status(400).json({ message: "Valid tracking number and carrier are required" });
      }
      const { trackingNumber, carrier } = shippingUpdate.data;
      const orderId = req.params.id;

      const existingOrder = await storage.getOrder(orderId);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (!['processing', 'completed'].includes(existingOrder.status)) {
        return res.status(409).json({ message: `Order cannot be shipped from ${existingOrder.status} status` });
      }

      // Update order with shipping info
      const updatedOrder = await storage.updateOrder(orderId, {
        status: "shipped",
        fulfillmentStatus: "fulfilled",
        deliveryStatus: "in_transit",
        trackingNumber,
        carrier,
        shippedAt: new Date(),
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      await db.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: 'order.shipped', entityType: 'order', entityId: orderId, details: { carrier, trackingNumber } });

      // Send shipping confirmation email (async, don't block response)
      if (updatedOrder.customerEmail) {
        import('./services/emailService.js').then(({ sendShippingConfirmationEmail }) => {
          sendShippingConfirmationEmail(updatedOrder).catch((error: any) => {
            console.error('[EMAIL] Failed to send shipping confirmation:', error);
          });
        }).catch((error: any) => {
          console.error('[EMAIL] Failed to import email service:', error);
        });
      }
      
      res.json(updatedOrder);
    } catch (error: any) {
      console.error('Error marking order as shipped:', error);
      res.status(500).json({ message: "Error marking order as shipped: " + error.message });
    }
  });

  // Admin endpoint to mark order as delivered (sends delivery confirmation email)
  app.patch("/api/admin/orders/:id/deliver", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;

      const existingOrder = await storage.getOrder(orderId);
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (existingOrder.status !== 'shipped') {
        return res.status(409).json({ message: `Order cannot be delivered from ${existingOrder.status} status` });
      }

      // Update order status to delivered
      const updatedOrder = await storage.updateOrder(orderId, {
        status: "delivered",
        fulfillmentStatus: "fulfilled",
        deliveryStatus: "delivered",
        deliveredAt: new Date(),
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      await db.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: 'order.delivered', entityType: 'order', entityId: orderId, details: {} });

      // Send delivery confirmation email (async, don't block response)
      // This will also schedule thank you and review request emails
      if (updatedOrder.customerEmail) {
        import('./services/emailService.js').then(({ sendDeliveryConfirmationEmail }) => {
          sendDeliveryConfirmationEmail(updatedOrder).catch((error: any) => {
            console.error('[EMAIL] Failed to send delivery confirmation:', error);
          });
        }).catch((error: any) => {
          console.error('[EMAIL] Failed to import email service:', error);
        });
      }
      
      res.json(updatedOrder);
    } catch (error: any) {
      console.error('Error marking order as delivered:', error);
      res.status(500).json({ message: "Error marking order as delivered: " + error.message });
    }
  });

  // Contact form submission endpoint
  // POST /api/contact - Handle contact form submissions with spam protection and validation
  app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
      const { name, email, phone, chapter, subject, message, inquiryType, honeypot, timestamp, timeElapsed } = req.body;

      // Server-side honeypot check (spam protection)
      if (honeypot && honeypot.trim() !== '') {
        console.log('[SPAM] Honeypot field filled:', { honeypot });
        // Return success to not tip off bots, but don't actually process
        return res.json({ success: true, message: "Message received" });
      }

      // Server-side time-based spam check (form must take at least 3 seconds)
      if (timeElapsed && timeElapsed < 3000) {
        console.log('[SPAM] Form submitted too quickly:', { timeElapsed });
        // Return error to legitimate users who might have autofill
        return res.status(429).json({ 
          success: false, 
          message: "Please take a moment to review your message before submitting." 
        });
      }

      // Server-side validation for required fields
      const errors: { [key: string]: string } = {};

      if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.name = 'Full name is required';
      } else if (name.trim().length > 100) {
        errors.name = 'Full name must be 100 characters or fewer';
      }

      if (!email || typeof email !== 'string' || email.trim() === '') {
        errors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      } else if (email.trim().length > 254) {
        errors.email = 'Email address is too long';
      }

      if (!subject || typeof subject !== 'string' || subject.trim() === '') {
        errors.subject = 'Subject is required';
      } else if (subject.trim().length > 200) {
        errors.subject = 'Subject must be 200 characters or fewer';
      }

      if (!message || typeof message !== 'string' || message.trim() === '') {
        errors.message = 'Message is required';
      } else if (message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
      } else if (message.trim().length > 5000) {
        errors.message = 'Message must be 5,000 characters or fewer';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors,
          message: "Please correct the highlighted fields" 
        });
      }

      // Prepare contact form data
      const contactData = {
        name: name.trim(),
        email: email.trim(),
        phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : '',
        chapter: typeof chapter === 'string' ? chapter.trim().slice(0, 100) : '',
        subject: subject.trim(),
        message: message.trim(),
        inquiryType: typeof inquiryType === 'string' ? inquiryType.trim().slice(0, 50) : 'general',
      };

      console.log('[CONTACT] Accepted a validated contact form submission');

      // Send emails (async, don't block response)
      import('./services/emailService.js').then(({ sendInquiryReceivedEmail, sendInternalContactNotification }) => {
        // Send auto-reply to customer
        sendInquiryReceivedEmail(contactData).catch((error: any) => {
          console.error('[EMAIL] Failed to send contact auto-reply:', error);
        });
        
        // Send internal notification to admin
        sendInternalContactNotification(contactData).catch((error: any) => {
          console.error('[EMAIL] Failed to send internal contact notification:', error);
        });
      }).catch((error: any) => {
        console.error('[EMAIL] Failed to import email service:', error);
      });

      res.json({ 
        success: true, 
        message: "Thank you for your message. We'll respond as soon as possible." 
      });
    } catch (error: any) {
      console.error('Error processing contact form:', error);
      res.status(500).json({ 
        success: false, 
        message: "An error occurred while processing your message. Please try again later." 
      });
    }
  });

  // Scheduled email processing endpoint (called periodically via cron)
  // This endpoint processes thank you and review request emails that are due
  app.post("/api/admin/process-scheduled-emails", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log('[EMAIL] Processing scheduled emails...');
      
      const { processScheduledEmails } = await import('./services/emailService.js');
      await processScheduledEmails();
      
      res.json({ success: true, message: "Scheduled emails processed" });
    } catch (error: any) {
      console.error('Error processing scheduled emails:', error);
      res.status(500).json({ message: "Error processing scheduled emails: " + error.message });
    }
  });

  // Expanded private-office data services.
  app.get('/api/admin/certificates', isAuthenticated, isAdmin, async (_req, res) => {
    const records = await db.select().from(certificates).orderBy(desc(certificates.editionNumber));
    res.json(records.map(record => ({
      ...record,
      verificationUrl: `/verify?serial=${encodeURIComponent(record.serialNumber)}`,
      qrCodeUrl: `/api/certificates/${encodeURIComponent(record.serialNumber)}/qr.svg`,
    })));
  });

  app.get('/api/admin/certificates/:serial', isAuthenticated, isAdmin, async (req, res) => {
    const parsed = serialSchema.safeParse(req.params.serial);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid serial number' });
    const [record] = await db.select().from(certificates).where(eq(certificates.serialNumber, parsed.data)).limit(1);
    if (!record) return res.status(404).json({ message: 'Certificate not found' });
    const order = await storage.getOrder(record.orderId);
    res.json({ ...record, order });
  });

  app.get("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.get("/api/admin/customers", isAuthenticated, isAdmin, async (_req, res) => {
    const existingOrders = await storage.getAllOrders();
    for (const order of existingOrders) {
      if (!order.customerEmail) continue;
      const names = (order.customerName || "").trim().split(/\s+/);
      await db.insert(customers).values({
        email: order.customerEmail.toLowerCase(), firstName: names[0] || null,
        lastName: names.slice(1).join(" ") || null, phone: order.customerPhone,
        defaultAddress: order.shippingAddress, status: "active", source: "order",
      }).onDuplicateKeyUpdate({ set: { phone: order.customerPhone, defaultAddress: order.shippingAddress, updatedAt: new Date() } });
      const [customer] = await db.select().from(customers).where(eq(customers.email, order.customerEmail.toLowerCase())).limit(1);
      if (customer && order.customerId !== customer.id) {
        await db.update(ordersTable).set({ customerId: customer.id }).where(eq(ordersTable.id, order.id));
      }
    }
    const records = await db.select().from(customers).orderBy(desc(customers.updatedAt));
    const enriched = records.map(customer => {
      const related = existingOrders.filter(order => order.customerEmail?.toLowerCase() === customer.email.toLowerCase());
      return { ...customer, totalOrders: related.length, totalSpent: related.reduce((sum, order) => sum + order.totalAmount, 0), lastOrderAt: related[0]?.createdAt ?? null };
    });
    res.json(enriched);
  });

  app.post("/api/admin/customers", isAuthenticated, isAdmin, async (req, res) => {
    const parsed = z.object({ email: z.string().email().max(254), firstName: z.string().trim().max(100).optional(), lastName: z.string().trim().max(100).optional(), phone: z.string().trim().max(40).optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Enter a valid customer email" });
    const email = parsed.data.email.toLowerCase();
    if ((await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1)).length) return res.status(409).json({ message: "A customer with this email already exists" });
    const customerId = crypto.randomUUID();
    await db.insert(customers).values({ ...parsed.data, id: customerId, email, source: "admin" });
    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    await db.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: "customer.created", entityType: "customer", entityId: customer.id, details: { email: customer.email } });
    res.status(201).json(customer);
  });

  app.get("/api/admin/customers/:id", isAuthenticated, isAdmin, async (req, res) => {
    const [customer] = await db.select().from(customers).where(eq(customers.id, req.params.id)).limit(1);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    const relatedOrders = await db.select().from(ordersTable).where(eq(ordersTable.customerEmail, customer.email)).orderBy(desc(ordersTable.createdAt));
    res.json({ ...customer, orders: relatedOrders });
  });

  app.get("/api/admin/activity", isAuthenticated, isAdmin, async (_req, res) => {
    res.json(await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(100));
  });

  app.get("/api/admin/inventory/:productId", isAuthenticated, isAdmin, async (req, res) => {
    const product = await storage.getInventoryByProductId(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const adjustments = await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.productId, req.params.productId)).orderBy(desc(inventoryAdjustments.createdAt));
    res.json({ ...product, adjustments });
  });

  app.get("/api/admin/notifications", isAuthenticated, isAdmin, async (_req, res) => {
    const stored = await db.select().from(notifications).where(and(eq(notifications.dismissed, false))).orderBy(desc(notifications.createdAt));
    const allInventory = await storage.getAllInventory();
    const generated = allInventory.filter(item => item.remainingStock <= Math.max(50, item.initialStock * .1)).map(item => ({ id: `inventory-${item.id}`, type: "inventory", priority: item.remainingStock === 0 ? "critical" : "attention", message: `${item.productName} has ${item.remainingStock} available`, entityType: "product", entityId: item.productId, read: false, dismissed: false, assignedTo: null, createdAt: item.lastUpdated }));
    res.json([...stored, ...generated]);
  });

  app.patch("/api/admin/notifications/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    if (req.params.id.startsWith("inventory-")) return res.json({ updated: true });
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, req.params.id));
    const [updated] = await db.select().from(notifications).where(eq(notifications.id, req.params.id)).limit(1);
    res.json(updated);
  });

  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (_req, res) => {
    const settings = await db.select().from(storeSettings);
    res.json(settings.filter(setting => setting.key !== 'stripe_credentials'));
  });

  app.put("/api/admin/settings/:key", isAuthenticated, isAdmin, async (req, res) => {
    if (req.params.key === 'stripe_credentials') return res.status(403).json({ message: 'Use the protected Stripe configuration endpoint' });
    const parsed = z.object({ value: z.unknown() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid setting" });
    await db.insert(storeSettings).values({ key: req.params.key, value: parsed.data.value, updatedBy: res.locals.adminUser.id }).onDuplicateKeyUpdate({ set: { value: parsed.data.value, updatedBy: res.locals.adminUser.id, updatedAt: new Date() } });
    const [setting] = await db.select().from(storeSettings).where(eq(storeSettings.key, req.params.key)).limit(1);
    await db.insert(activityLogs).values({ actorId: res.locals.adminUser.id, action: "setting.updated", entityType: "setting", entityId: req.params.key });
    res.json(setting);
  });

  const httpServer = createServer(app);

  return httpServer;
}
