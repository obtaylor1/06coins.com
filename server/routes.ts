import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getInventoryFromFirestore, updateInventoryInFirestore } from "./firebase";

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

  // Update inventory (admin endpoint - should be protected in production)
  app.patch("/api/inventory", async (req, res) => {
    try {
      const { remainingStock } = req.body;
      
      if (typeof remainingStock !== 'number' || remainingStock < 0) {
        return res.status(400).json({ message: "Invalid stock quantity" });
      }
      
      // Update in local storage
      const updatedInventory = await storage.updateInventoryStock(remainingStock);
      
      // Sync to Firestore
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

  // Decrement inventory after successful purchase
  app.post("/api/inventory/decrement", async (req, res) => {
    try {
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
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
      const { amount, quantity } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Check inventory before creating payment intent
      const inventory = await storage.getInventory();
      if (!inventory || inventory.remainingStock < (quantity || 1)) {
        return res.status(400).json({ 
          message: "Insufficient stock available",
          remainingStock: inventory?.remainingStock || 0,
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          product: "APA 120th Anniversary Commemorative Coin",
          quantity: quantity || 1,
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

  const httpServer = createServer(app);

  return httpServer;
}
