import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { getInventoryFromFirestore, updateInventoryInFirestore } from "./firebase.js";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth.js";
import Stripe from "stripe";

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

// Stripe integration - reference: javascript_stripe blueprint
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });
  console.log('Stripe initialized successfully');
} else {
  console.warn('Stripe secret key not provided. Payment features will be disabled.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware
  await setupAuth(app);

  // Initialize all products inventory on server startup
  try {
    await storage.initializeAllProducts();
    console.log('✅ Product inventory initialized successfully');
  } catch (error) {
    console.error('⚠️ Error initializing inventory:', error);
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get current inventory for main coin (used by header stock counter)
  app.get("/api/inventory", async (req, res) => {
    try {
      // Try to get from Firestore first (real-time source of truth)
      const firestoreStock = await getInventoryFromFirestore();
      
      if (firestoreStock !== null) {
        // Update local storage to match Firestore
        await storage.updateInventoryStock('coin120year', firestoreStock);
      }
      
      // Return main coin inventory from local storage (which is now synced)
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
  app.post("/api/inventory/decrement", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system unavailable" });
    }

    try {
      const { quantity, paymentIntentId, cartItems, customerPhone, smsOrderUpdatesOptIn, smsMarketingOptIn } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent required" });
      }

      // CRITICAL: Verify payment with Stripe before decrementing
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          message: "Payment not succeeded",
          status: paymentIntent.status 
        });
      }

      // Check if this payment was already processed (idempotency)
      const existingOrder = await storage.getOrderByPaymentIntent(paymentIntentId);
      if (existingOrder) {
        // Return main coin stock for legacy compatibility
        const mainCoinInventory = await storage.getInventoryByProductId('coin120year');
        return res.json({
          remainingStock: mainCoinInventory?.remainingStock ?? 0,
          alreadyProcessed: true,
        });
      }

      // Parse items from payment intent metadata
      let itemsToDecrement: Array<{id: string, quantity: number}> = [];
      let totalQuantity = 0;
      
      if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
        // New cart system
        itemsToDecrement = cartItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
        }));
        totalQuantity = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      } else if (quantity && quantity >= 1) {
        // Legacy single quantity system
        itemsToDecrement = [{ id: 'coin120year', quantity }];
        totalQuantity = quantity;
      } else {
        return res.status(400).json({ message: "Invalid request: provide either quantity or cartItems" });
      }

      // Verify total items matches payment metadata
      const paidItems = paymentIntent.metadata?.totalItems;
      if (paidItems && parseInt(paidItems) !== totalQuantity) {
        return res.status(400).json({ 
          message: "Item count mismatch",
          paidItems: parseInt(paidItems),
          requestedItems: totalQuantity
        });
      }

      // Prepare cart items for storage
      const cartItemsForStorage = cartItems && Array.isArray(cartItems) && cartItems.length > 0
        ? cartItems.map((item: any) => {
            const catalogProduct = PRODUCT_CATALOG.get(item.id);
            return {
              id: item.id,
              name: catalogProduct?.name || item.name,
              quantity: item.quantity,
              price: catalogProduct?.price ? Math.round(catalogProduct.price * 100) : 0, // Store in cents
            };
          })
        : [{
            id: 'coin120year',
            name: PRODUCT_CATALOG.get('coin120year')?.name || '120-Year Anniversary Coin',
            quantity: quantity,
            price: Math.round((PRODUCT_CATALOG.get('coin120year')?.price || 39.06) * 100),
          }];

      // Execute entire decrement + order creation in a database transaction
      // Ensures all-or-nothing: if any decrement fails, all are rolled back
      try {
        const result = await storage.executeInventoryTransaction(
          itemsToDecrement,
          {
            stripePaymentIntentId: paymentIntentId,
            quantity: totalQuantity,
            totalAmount: paymentIntent.amount,
            status: "processing", // Order needs to be shipped
            customerName: paymentIntent.shipping?.name || 'Unknown Customer',
            customerEmail: paymentIntent.receipt_email || null,
            customerPhone: customerPhone || null,
            shippingAddress: paymentIntent.shipping?.address || null,
            cartItems: cartItemsForStorage as any,
            emailConfirmationSent: 0, // Will be set to 1 after email sent
            smsOrderUpdatesOptIn: smsOrderUpdatesOptIn ?? 0,
            smsMarketingOptIn: smsMarketingOptIn ?? 0,
          }
        );

        // Get the created order to send confirmation email and SMS
        const order = await storage.getOrderByPaymentIntent(paymentIntentId);
        
        // Send order confirmation email (async, don't block response)
        if (order && order.customerEmail) {
          // Import dynamically to avoid blocking
          import('./services/emailService.js').then(({ sendOrderConfirmationEmail }) => {
            sendOrderConfirmationEmail(order).catch((error: any) => {
              console.error('[EMAIL] Failed to send order confirmation:', error);
            });
          }).catch((error: any) => {
            console.error('[EMAIL] Failed to import email service:', error);
          });
        }
        
        // Send order confirmation SMS (async, don't block response)
        if (order) {
          import('./services/smsTriggers.js').then(({ sendOrderConfirmationSms, sendAdminNewOrderAlert, sendAdminHighValueAlert }) => {
            sendOrderConfirmationSms(order).catch((error: any) => {
              console.error('[SMS] Failed to send order confirmation SMS:', error);
            });
            
            // Send admin alerts
            sendAdminNewOrderAlert(order).catch((error: any) => {
              console.error('[SMS] Failed to send admin new order alert:', error);
            });
            
            sendAdminHighValueAlert(order).catch((error: any) => {
              console.error('[SMS] Failed to send admin high-value alert:', error);
            });
          }).catch((error: any) => {
            console.error('[SMS] Failed to import SMS triggers:', error);
          });
        }

        // Sync main coin to Firestore (for header counter)
        const mainCoinUpdate = result.updatedInventories.find(inv => inv.productId === 'coin120year');
        if (mainCoinUpdate) {
          await updateInventoryInFirestore(mainCoinUpdate.remainingStock);
        }

        res.json({
          remainingStock: mainCoinUpdate?.remainingStock ?? 0,
          updatedInventories: result.updatedInventories,
        });
      } catch (error: any) {
        console.error('Error in inventory transaction:', error);
        
        // Check if it's an insufficient stock error
        if (error.message?.includes('Insufficient stock') || error.message?.includes('stock exhausted')) {
          return res.status(409).json({ 
            message: "Stock was exhausted by another order during processing. Your payment succeeded - please contact support for a refund.",
            paymentIntentId,
            error: error.message,
          });
        }
        
        // Other transaction errors
        return res.status(500).json({ 
          message: "Payment succeeded but inventory update failed. Contact support.",
          paymentIntentId,
          error: error.message,
        });
      }
    } catch (error: any) {
      console.error('Error decrementing inventory:', error);
      res.status(500).json({ message: "Error decrementing inventory: " + error.message });
    }
  });

  // Stripe payment intent creation - reference: javascript_stripe blueprint
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing is currently unavailable. Please contact support." 
      });
    }

    try {
      const { quantity, cartItems } = req.body;
      
      let totalAmount = 0;
      let metadataItems: any[] = [];
      
      if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
        // New cart system: Calculate total from SERVER-SIDE catalog
        // SECURITY: Never trust client prices - use server catalog
        for (const item of cartItems) {
          const catalogProduct = PRODUCT_CATALOG.get(item.id);
          if (!catalogProduct) {
            return res.status(400).json({ 
              message: `Invalid product: ${item.id}`,
            });
          }
          
          // Use SERVER price, not client price
          const serverPrice = catalogProduct.price;
          totalAmount += serverPrice * item.quantity;
          metadataItems.push({
            id: item.id,
            name: catalogProduct.name,
            quantity: item.quantity,
            price: serverPrice, // Server-controlled price
          });
          
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
      } else if (quantity && quantity >= 1) {
        // Legacy single quantity system
        const catalogProduct = PRODUCT_CATALOG.get('coin120year');
        if (!catalogProduct) {
          return res.status(500).json({ message: "Product catalog error" });
        }
        
        totalAmount = quantity * catalogProduct.price;
        metadataItems = [{ productId: 'coin120year', quantity, price: catalogProduct.price }];
        
        // Check inventory for main coin
        const inventory = await storage.getInventoryByProductId('coin120year');
        if (!inventory || inventory.remainingStock < quantity) {
          return res.status(400).json({ 
            message: "Insufficient stock available",
            remainingStock: inventory?.remainingStock || 0,
          });
        }
      } else {
        return res.status(400).json({ message: "Invalid request: provide either quantity or cartItems" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
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
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create order after payment intent
  app.post("/api/orders", async (req, res) => {
    try {
      const { stripePaymentIntentId, quantity, totalAmount } = req.body;
      
      if (!stripePaymentIntentId || !quantity || !totalAmount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const order = await storage.createOrder({
        stripePaymentIntentId,
        quantity,
        totalAmount: Math.round(totalAmount * 100), // Store in cents
        status: "pending",
      });

      res.json(order);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: "Error creating order: " + error.message });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: "Error fetching order: " + error.message });
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
      const { productId, remainingStock } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID required" });
      }
      
      if (typeof remainingStock !== 'number' || remainingStock < 0) {
        return res.status(400).json({ message: "Invalid stock quantity" });
      }
      
      const updatedInventory = await storage.updateInventoryStock(productId, remainingStock);
      
      // Sync main coin to Firestore (for header counter)
      if (productId === 'coin120year') {
        await updateInventoryInFirestore(remainingStock);
      }
      
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
      
      const completedOrders = orders.filter(o => o.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalCoinsSold = completedOrders.reduce((sum, order) => sum + order.quantity, 0);
      
      // Get main coin inventory for header display
      const mainCoinInventory = allInventory.find(inv => inv.productId === 'coin120year');
      const initialStock = mainCoinInventory?.initialStock || 1906;
      const remainingStock = mainCoinInventory?.remainingStock || 0;
      
      // Calculate profit based on actual costs
      // 4" coin: Cost $8.50, Selling $39.06 → Profit $30.56
      // 3" coin: Cost $3.30, Selling $19.06 → Profit $15.76
      const COST_4_INCH = 8.50;
      const COST_3_INCH = 3.30;
      const PROFIT_4_INCH = 39.06 - COST_4_INCH; // $30.56
      const PROFIT_3_INCH = 19.06 - COST_3_INCH; // $15.76
      
      // Calculate total profit by iterating through order items
      let totalProfit = 0;
      completedOrders.forEach(order => {
        if (order.cartItems && Array.isArray(order.cartItems)) {
          order.cartItems.forEach((item: any) => {
            if (item.id === 'coin120year') {
              totalProfit += item.quantity * PROFIT_4_INCH * 100; // in cents
            } else if (item.id?.startsWith('jewel_') || item.id === 'jewelset7') {
              // Jewel coins and jewel set use 3" coins
              totalProfit += item.quantity * PROFIT_3_INCH * 100; // in cents
            }
          });
        }
      });
      
      res.json({
        totalOrders: completedOrders.length,
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

  // SMS Management Routes
  app.get("/api/admin/sms/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Use SQL aggregation instead of loading all logs
      const analytics = await storage.getSmsAnalytics();
      
      res.json(analytics);
    } catch (error: any) {
      console.error('Error fetching SMS analytics:', error);
      res.status(500).json({ message: "Error fetching SMS analytics: " + error.message });
    }
  });

  // Order-specific SMS logs (secure, scoped to single order)
  app.get("/api/admin/sms/logs/:orderId", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const smsLogs = await storage.getSmsLogsByOrder(orderId);
      res.json(smsLogs);
    } catch (error: any) {
      console.error('Error fetching SMS logs for order:', error);
      res.status(500).json({ message: "Error fetching SMS logs: " + error.message });
    }
  });

  // Admin sales chart data endpoint (last 30 days)
  app.get("/api/admin/sales-chart", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const completedOrders = orders.filter(o => o.status === 'completed');
      
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
      completedOrders.forEach(order => {
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

  // Admin product sales ranking endpoint
  app.get("/api/admin/product-sales", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // For now, we'll aggregate based on order quantity
      // In a real system, orders would have line items per product
      const orders = await storage.getAllOrders();
      const completedOrders = orders.filter(o => o.status === 'completed');
      
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
      const completedOrders = orders.filter(o => o.status === 'completed');
      
      // Calculate average daily sales over last 30 days for each product
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentOrders = completedOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
      
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
      const { trackingNumber, carrier } = req.body;
      const orderId = req.params.id;

      if (!trackingNumber || !carrier) {
        return res.status(400).json({ message: "Tracking number and carrier are required" });
      }

      // Update order with shipping info
      const updatedOrder = await storage.updateOrder(orderId, {
        status: "shipped",
        trackingNumber,
        carrier,
        shippedAt: new Date(),
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

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
      
      // Send shipping confirmation SMS (async, don't block response)
      import('./services/smsTriggers.js').then(({ sendShippingConfirmationSms }) => {
        sendShippingConfirmationSms(updatedOrder).catch((error: any) => {
          console.error('[SMS] Failed to send shipping confirmation SMS:', error);
        });
      }).catch((error: any) => {
        console.error('[SMS] Failed to import SMS triggers:', error);
      });

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

      // Update order status to delivered
      const updatedOrder = await storage.updateOrder(orderId, {
        status: "delivered",
        deliveredAt: new Date(),
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

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
      
      // Send delivery confirmation SMS (async, don't block response)
      // This will also schedule thank you and review SMS
      import('./services/smsTriggers.js').then(({ sendDeliveryConfirmationSms }) => {
        sendDeliveryConfirmationSms(updatedOrder).catch((error: any) => {
          console.error('[SMS] Failed to send delivery confirmation SMS:', error);
        });
      }).catch((error: any) => {
        console.error('[SMS] Failed to import SMS triggers:', error);
      });

      res.json(updatedOrder);
    } catch (error: any) {
      console.error('Error marking order as delivered:', error);
      res.status(500).json({ message: "Error marking order as delivered: " + error.message });
    }
  });

  // Contact form submission endpoint
  // POST /api/contact - Handle contact form submissions with spam protection and validation
  app.post("/api/contact", async (req, res) => {
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

      if (!name || name.trim() === '') {
        errors.name = 'Full name is required';
      }

      if (!email || email.trim() === '') {
        errors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!subject || subject.trim() === '') {
        errors.subject = 'Subject is required';
      }

      if (!message || message.trim() === '') {
        errors.message = 'Message is required';
      } else if (message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
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
        phone: phone?.trim() || '',
        chapter: chapter?.trim() || '',
        subject: subject.trim(),
        message: message.trim(),
        inquiryType: inquiryType || 'general',
      };

      console.log('='.repeat(60));
      console.log('📧 NEW CONTACT FORM SUBMISSION');
      console.log('='.repeat(60));
      console.log('From:', contactData.name);
      console.log('Email:', contactData.email);
      console.log('Phone:', contactData.phone || 'Not provided');
      console.log('Chapter:', contactData.chapter || 'Not provided');
      console.log('Inquiry Type:', contactData.inquiryType);
      console.log('Subject:', contactData.subject);
      console.log('Message:', contactData.message);
      console.log('='.repeat(60));

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

  // Scheduled SMS processing endpoint (called periodically via cron)
  // This endpoint processes thank you and review request SMS that are due
  app.post("/api/admin/process-scheduled-sms", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log('[SMS] Processing scheduled SMS...');
      
      const { processScheduledSms } = await import('./services/smsTriggers.js');
      await processScheduledSms();
      
      res.json({ success: true, message: "Scheduled SMS processed" });
    } catch (error: any) {
      console.error('Error processing scheduled SMS:', error);
      res.status(500).json({ message: "Error processing scheduled SMS: " + error.message });
    }
  });

  // Twilio SMS webhook handler (for receiving STOP/opt-out messages)
  // This endpoint is called by Twilio when a customer replies to an SMS
  app.post("/api/webhooks/sms", async (req, res) => {
    try {
      const { From, Body } = req.body;
      
      console.log('[SMS WEBHOOK] Received message from:', From);
      console.log('[SMS WEBHOOK] Message body:', Body);
      
      // Check if message contains STOP, UNSUBSCRIBE, etc. (case insensitive)
      const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
      const messageBody = (Body || '').toLowerCase().trim();
      const isOptOut = optOutKeywords.some(keyword => messageBody.includes(keyword));
      
      if (isOptOut && From) {
        // Find all orders with this phone number and mark as opted out
        const orders = await storage.getAllOrders();
        const matchingOrders = orders.filter(order => {
          if (!order.customerPhone) return false;
          const normalizedOrderPhone = order.customerPhone.replace(/\D/g, '');
          const normalizedFromPhone = From.replace(/\D/g, '');
          return normalizedOrderPhone === normalizedFromPhone;
        });
        
        for (const order of matchingOrders) {
          await storage.updateOrder(order.id, {
            smsOrderUpdatesOptIn: 0,
            smsMarketingOptIn: 0,
            smsOptedOutAt: new Date(),
          });
        }
        
        console.log(`[SMS WEBHOOK] Opted out ${matchingOrders.length} orders for phone: ${From}`);
        
        // Send auto-reply confirming opt-out (if Twilio is configured)
        const { isSmsConfigured } = await import('./services/smsService.js');
        if (isSmsConfigured()) {
          const { sendSms } = await import('./services/smsService.js');
          await sendSms({
            to: From,
            body: 'You have been unsubscribed from Alpha Phi Alpha Coin Shop SMS. You will not receive further messages.',
            type: 'transactional',
          });
        }
      }
      
      // Respond with TwiML (required by Twilio)
      res.set('Content-Type', 'text/xml');
      res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    } catch (error: any) {
      console.error('Error processing SMS webhook:', error);
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
