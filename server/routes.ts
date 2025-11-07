import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { getInventoryFromFirestore, updateInventoryInFirestore } from "./firebase.js";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth.js";

// Stripe integration - reference: javascript_stripe blueprint
let stripe: any = null;
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
  console.log('Stripe initialized successfully');
} else {
  console.warn('Stripe secret key not provided. Payment features will be disabled.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware
  await setupAuth(app);

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
  
  // Get current inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      // Try to get from Firestore first (real-time source of truth)
      const firestoreStock = await getInventoryFromFirestore();
      
      if (firestoreStock !== null) {
        // Update local storage to match Firestore
        await storage.updateInventoryStock(firestoreStock);
      }
      
      // Return from local storage (which is now synced)
      const inventory = await storage.getInventory();
      
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

  // Legacy endpoint removed - use /api/admin/inventory instead (protected)

  // Decrement inventory after payment verified
  // SECURITY: Verifies Stripe payment succeeded before decrementing
  app.post("/api/inventory/decrement", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment system unavailable" });
    }

    try {
      const { quantity, paymentIntentId } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

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

      // SECURITY: Validate quantity and amount match payment intent
      const COIN_PRICE = 50; // Must match create-payment-intent
      const paidQuantity = parseInt(paymentIntent.metadata?.quantity || '0');
      const expectedAmount = quantity * COIN_PRICE * 100; // in cents
      
      if (paidQuantity !== quantity) {
        return res.status(400).json({ 
          message: "Quantity mismatch - payment was for different quantity",
          paidQuantity,
          requestedQuantity: quantity
        });
      }

      if (paymentIntent.amount !== expectedAmount) {
        return res.status(400).json({ 
          message: "Amount mismatch - payment amount doesn't match quantity",
          paidAmount: paymentIntent.amount / 100,
          expectedAmount: expectedAmount / 100
        });
      }

      // Check if this payment was already processed (idempotency)
      const existingOrder = await storage.getOrderByPaymentIntent(paymentIntentId);
      if (existingOrder) {
        return res.json({
          remainingStock: (await storage.getInventory())?.remainingStock ?? 0,
          alreadyProcessed: true,
        });
      }

      // Extract customer and shipping information from payment intent
      const customerName = paymentIntent.shipping?.name || 
                          paymentIntent.billing_details?.name || 
                          'Unknown Customer';
      const customerEmail = paymentIntent.receipt_email || 
                           paymentIntent.billing_details?.email || 
                           null;
      const shippingAddress = paymentIntent.shipping?.address || null;

      // Create order record FIRST for idempotency (before decrementing)
      await storage.createOrder({
        stripePaymentIntentId: paymentIntentId,
        quantity,
        totalAmount: paymentIntent.amount, // Use actual paid amount from Stripe
        status: "completed",
        customerName,
        customerEmail,
        shippingAddress,
      });
      
      const inventory = await storage.getInventory();
      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      
      const newStock = Math.max(0, inventory.remainingStock - quantity);
      
      // Update local storage
      const updatedInventory = await storage.updateInventoryStock(newStock);
      
      // Sync to Firestore
      await updateInventoryInFirestore(newStock);
      
      res.json({
        remainingStock: updatedInventory.remainingStock,
        decremented: inventory.remainingStock - newStock,
      });
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
      const { quantity } = req.body;
      const COIN_PRICE = 50; // Server-side price authority
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      // SECURITY: Calculate amount server-side (never trust client)
      const totalAmount = quantity * COIN_PRICE;

      // Check inventory before creating payment intent
      const inventory = await storage.getInventory();
      if (!inventory || inventory.remainingStock < quantity) {
        return res.status(400).json({ 
          message: "Insufficient stock available",
          remainingStock: inventory?.remainingStock || 0,
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          product: "APA 120th Anniversary Commemorative Coin",
          quantity: quantity.toString(),
          unitPrice: COIN_PRICE.toString(),
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
      const { remainingStock } = req.body;
      
      if (typeof remainingStock !== 'number' || remainingStock < 0) {
        return res.status(400).json({ message: "Invalid stock quantity" });
      }
      
      const updatedInventory = await storage.updateInventoryStock(remainingStock);
      await updateInventoryInFirestore(remainingStock);
      
      res.json({
        remainingStock: updatedInventory.remainingStock,
        lastUpdated: updatedInventory.lastUpdated,
      });
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ message: "Error updating inventory: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
