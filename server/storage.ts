import { type Inventory, type InsertInventory, type Order, type InsertOrder, type User, type UpsertUser, type SmsLog, type InsertSmsLog, type SmsSettings, type InsertSmsSettings, inventory as inventoryTable, orders as ordersTable, users as usersTable, smsLogs as smsLogsTable, smsSettings as smsSettingsTable } from "@shared/schema";
import { db } from "../db/index.js";
import { eq, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User methods (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inventory methods
  getInventoryByProductId(productId: string): Promise<Inventory | undefined>;
  getAllInventory(): Promise<Inventory[]>;
  updateInventoryStock(productId: string, remainingStock: number): Promise<Inventory>;
  atomicDecrementInventory(productId: string, quantity: number): Promise<{ success: boolean; inventory?: Inventory; error?: string }>;
  executeInventoryTransaction(items: Array<{ id: string; quantity: number }>, orderData: InsertOrder): Promise<{ updatedInventories: Array<{ productId: string; remainingStock: number; decremented: number }> }>;
  initializeInventory(inventory: InsertInventory): Promise<Inventory>;
  initializeAllProducts(): Promise<void>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  markEmailSent(id: string, emailType: 'confirmation' | 'shipping' | 'delivery' | 'thankYou' | 'review'): Promise<Order | undefined>;
  getOrdersNeedingScheduledEmails(): Promise<Order[]>;
  
  // SMS Log methods
  createSmsLog(log: InsertSmsLog): Promise<SmsLog>;
  getSmsLogsByOrder(orderId: string): Promise<SmsLog[]>;
  updateSmsLogStatus(id: number, status: string, errorMessage?: string): Promise<SmsLog | undefined>;
  getSmsAnalytics(): Promise<{
    totalSent: number;
    totalFailed: number;
    totalDelivered: number;
    totalOptedOut: number;
    successRate: string;
    transactionalCount: number;
    marketingCount: number;
    adminCount: number;
    recentSms: number;
    totalMessages: number;
  }>;
  
  // SMS Settings methods
  getSmsSettings(): Promise<SmsSettings[]>;
  getSmsSettingByKey(key: string): Promise<SmsSettings | undefined>;
  upsertSmsSettings(setting: InsertSmsSettings): Promise<SmsSettings>;
}

export class DbStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(usersTable)
      .values(userData)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  // Inventory operations
  async getInventoryByProductId(productId: string): Promise<Inventory | undefined> {
    const result = await db
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.productId, productId))
      .limit(1);
    return result[0];
  }

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventoryTable);
  }

  async updateInventoryStock(productId: string, remainingStock: number): Promise<Inventory> {
    const current = await this.getInventoryByProductId(productId);
    if (!current) {
      throw new Error(`Inventory not found for product: ${productId}`);
    }

    const result = await db
      .update(inventoryTable)
      .set({ 
        remainingStock,
        lastUpdated: new Date(),
      })
      .where(eq(inventoryTable.productId, productId))
      .returning();

    return result[0];
  }

  async atomicDecrementInventory(productId: string, quantity: number): Promise<{ success: boolean; inventory?: Inventory; error?: string }> {
    // ATOMIC: Update only if sufficient stock exists
    // Uses SQL WHERE clause to ensure atomicity at database level
    const result = await db
      .update(inventoryTable)
      .set({
        remainingStock: sql`${inventoryTable.remainingStock} - ${quantity}`,
        lastUpdated: new Date(),
      })
      .where(sql`${inventoryTable.productId} = ${productId} AND ${inventoryTable.remainingStock} >= ${quantity}`)
      .returning();

    if (result.length === 0) {
      // Update failed - either product not found or insufficient stock
      const current = await this.getInventoryByProductId(productId);
      if (!current) {
        return { success: false, error: `Product not found: ${productId}` };
      }
      return { 
        success: false, 
        inventory: current,
        error: `Insufficient stock: available=${current.remainingStock}, requested=${quantity}` 
      };
    }

    return { success: true, inventory: result[0] };
  }

  async executeInventoryTransaction(
    items: Array<{ id: string; quantity: number }>, 
    orderData: InsertOrder
  ): Promise<{ updatedInventories: Array<{ productId: string; remainingStock: number; decremented: number }> }> {
    // TRANSACTION: All-or-nothing inventory decrement + order creation
    // If any decrement fails, entire transaction is rolled back
    return await db.transaction(async (tx) => {
      const updatedInventories: Array<{ productId: string; remainingStock: number; decremented: number }> = [];
      
      // Atomically decrement each product
      for (const item of items) {
        const result = await tx
          .update(inventoryTable)
          .set({
            remainingStock: sql`${inventoryTable.remainingStock} - ${item.quantity}`,
            lastUpdated: new Date(),
          })
          .where(sql`${inventoryTable.productId} = ${item.id} AND ${inventoryTable.remainingStock} >= ${item.quantity}`)
          .returning();

        if (result.length === 0) {
          // Decrement failed - check why
          const current = await tx
            .select()
            .from(inventoryTable)
            .where(eq(inventoryTable.productId, item.id))
            .limit(1);

          if (current.length === 0) {
            throw new Error(`Product not found: ${item.id}`);
          }
          
          // Insufficient stock - this will trigger transaction rollback
          throw new Error(`Insufficient stock for ${item.id}: available=${current[0].remainingStock}, requested=${item.quantity}`);
        }

        updatedInventories.push({
          productId: item.id,
          remainingStock: result[0].remainingStock,
          decremented: item.quantity,
        });
      }

      // Create order only after all decrements succeed
      await tx
        .insert(ordersTable)
        .values(orderData);

      return { updatedInventories };
    });
  }

  async initializeInventory(insertInventory: InsertInventory): Promise<Inventory> {
    // CRITICAL: Only insert if product doesn't exist
    // DO NOT reset remainingStock on conflict - preserves live inventory
    const result = await db
      .insert(inventoryTable)
      .values(insertInventory)
      .onConflictDoNothing({ target: inventoryTable.productId })
      .returning();

    // If no rows returned, product already exists - return existing record
    if (result.length === 0) {
      const existing = await this.getInventoryByProductId(insertInventory.productId);
      if (!existing) {
        throw new Error(`Failed to initialize inventory for ${insertInventory.productId}`);
      }
      return existing;
    }

    return result[0];
  }

  async initializeAllProducts(): Promise<void> {
    const products = [
      { productId: "coin120year", productName: "120-Year Anniversary Commemorative Coin — 4\" Premium Edition", remainingStock: 1906, initialStock: 1906 },
      { productId: "jewelset7", productName: "Complete 7-Jewel Collector's Set — 3\" Coins", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_callis", productName: "Callis — The Philosopher", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_chapman", productName: "Chapman — The Educator", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_jones", productName: "Jones — The Organizer", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_kelley", productName: "Kelley — The Engineer", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_murray", productName: "Murray — The Scholar", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_ogle", productName: "Ogle — The Visionary", remainingStock: 5000, initialStock: 5000 },
      { productId: "jewel_tandy", productName: "Tandy — The Architect", remainingStock: 5000, initialStock: 5000 },
    ];

    for (const product of products) {
      await this.initializeInventory(product);
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db
      .insert(ordersTable)
      .values(insertOrder)
      .returning();

    return result[0];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);

    return result[0];
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const result = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db
      .update(ordersTable)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    return result[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db
      .update(ordersTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    return result[0];
  }

  async markEmailSent(id: string, emailType: 'confirmation' | 'shipping' | 'delivery' | 'thankYou' | 'review'): Promise<Order | undefined> {
    const fieldMap = {
      confirmation: 'emailConfirmationSent',
      shipping: 'emailShippingSent',
      delivery: 'emailDeliverySent',
      thankYou: 'emailThankYouSent',
      review: 'emailReviewSent',
    };

    const field = fieldMap[emailType];
    const result = await db
      .update(ordersTable)
      .set({ 
        [field]: 1,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    return result[0];
  }

  async getOrdersNeedingScheduledEmails(): Promise<Order[]> {
    const now = new Date();
    
    // Get orders where scheduled email time has passed and email hasn't been sent
    const result = await db
      .select()
      .from(ordersTable)
      .where(
        sql`(
          (${ordersTable.emailThankYouScheduledFor} IS NOT NULL 
           AND ${ordersTable.emailThankYouScheduledFor} <= ${now}
           AND ${ordersTable.emailThankYouSent} = 0
           AND ${ordersTable.customerEmail} IS NOT NULL)
          OR
          (${ordersTable.emailReviewScheduledFor} IS NOT NULL 
           AND ${ordersTable.emailReviewScheduledFor} <= ${now}
           AND ${ordersTable.emailReviewSent} = 0
           AND ${ordersTable.customerEmail} IS NOT NULL)
        )`
      );

    return result;
  }

  // SMS Log operations
  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const result = await db
      .insert(smsLogsTable)
      .values(log)
      .returning();
    return result[0];
  }

  async getSmsLogsByOrder(orderId: string): Promise<SmsLog[]> {
    return await db
      .select()
      .from(smsLogsTable)
      .where(eq(smsLogsTable.orderId, orderId))
      .orderBy(desc(smsLogsTable.createdAt));
  }

  async updateSmsLogStatus(id: number, status: string, errorMessage?: string): Promise<SmsLog | undefined> {
    const result = await db
      .update(smsLogsTable)
      .set({ 
        status,
        errorMessage: errorMessage || null,
      })
      .where(eq(smsLogsTable.id, id))
      .returning();
    return result[0];
  }

  async getSmsAnalytics() {
    // Efficient SQL aggregation for SMS analytics with COALESCE to handle empty table
    const result = await db
      .select({
        totalSent: sql<number>`COALESCE(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)`,
        totalFailed: sql<number>`COALESCE(COUNT(CASE WHEN status = 'failed' THEN 1 END), 0)`,
        totalDelivered: sql<number>`COALESCE(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0)`,
        totalOptedOut: sql<number>`COALESCE(COUNT(CASE WHEN status = 'opted_out' THEN 1 END), 0)`,
        totalMessages: sql<number>`COALESCE(COUNT(*), 0)`,
        transactionalCount: sql<number>`COALESCE(COUNT(CASE WHEN type = 'transactional' THEN 1 END), 0)`,
        marketingCount: sql<number>`COALESCE(COUNT(CASE WHEN type = 'marketing' THEN 1 END), 0)`,
        adminCount: sql<number>`COALESCE(COUNT(CASE WHEN type = 'admin' THEN 1 END), 0)`,
        recentSms: sql<number>`COALESCE(COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END), 0)`,
      })
      .from(smsLogsTable);

    const stats = result[0] || {
      totalSent: 0,
      totalFailed: 0,
      totalDelivered: 0,
      totalOptedOut: 0,
      totalMessages: 0,
      transactionalCount: 0,
      marketingCount: 0,
      adminCount: 0,
      recentSms: 0,
    };
    
    const totalAttempted = stats.totalSent + stats.totalFailed;
    const successRate = totalAttempted > 0 ? ((stats.totalSent / totalAttempted) * 100).toFixed(1) : '0.0';

    return {
      totalSent: stats.totalSent,
      totalFailed: stats.totalFailed,
      totalDelivered: stats.totalDelivered,
      totalOptedOut: stats.totalOptedOut,
      successRate,
      transactionalCount: stats.transactionalCount,
      marketingCount: stats.marketingCount,
      adminCount: stats.adminCount,
      recentSms: stats.recentSms,
      totalMessages: stats.totalMessages,
    };
  }

  // SMS Settings operations
  async getSmsSettings(): Promise<SmsSettings[]> {
    return await db.select().from(smsSettingsTable);
  }

  async getSmsSettingByKey(key: string): Promise<SmsSettings | undefined> {
    const result = await db
      .select()
      .from(smsSettingsTable)
      .where(eq(smsSettingsTable.key, key))
      .limit(1);
    return result[0];
  }

  async upsertSmsSettings(setting: InsertSmsSettings): Promise<SmsSettings> {
    const result = await db
      .insert(smsSettingsTable)
      .values(setting)
      .onConflictDoUpdate({
        target: smsSettingsTable.key,
        set: {
          value: setting.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
