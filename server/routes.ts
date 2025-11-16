import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { getInventoryFromFirestore, updateInventoryInFirestore } from "./firebase.js";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth.js";
import Stripe from "stripe";

// Server-side product catalog (price authority)
// SECURITY: This is the source of truth for all product pricing
const PRODUCT_CATALOG = new Map([
  ['coin120year', { name: '120-Year Anniversary Commemorative Coin — 4" Premium Edition', price: 50.06, type: 'main-coin' }],
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
      const { quantity, paymentIntentId, cartItems } = req.body;

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

      // Execute entire decrement + order creation in a database transaction
      // Ensures all-or-nothing: if any decrement fails, all are rolled back
      try {
        const result = await storage.executeInventoryTransaction(
          itemsToDecrement,
          {
            stripePaymentIntentId: paymentIntentId,
            quantity: totalQuantity,
            totalAmount: paymentIntent.amount,
            status: "completed",
            customerName: paymentIntent.shipping?.name || 'Unknown Customer',
            customerEmail: paymentIntent.receipt_email || null,
            shippingAddress: paymentIntent.shipping?.address || null,
          }
        );

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
      
      // Calculate profit (assuming $30 cost per coin = $20.06 profit per coin sold)
      const COST_PER_COIN = 30; // $30 cost basis
      const PRICE_PER_COIN = 50.06; // $50.06 selling price
      const PROFIT_PER_COIN = PRICE_PER_COIN - COST_PER_COIN;
      const totalProfit = totalCoinsSold * PROFIT_PER_COIN * 100; // in cents
      
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

  const httpServer = createServer(app);

  return httpServer;
}
