import { type Certificate, type Inventory, type InsertInventory, type Order, type InsertOrder, type User, type UpsertUser, type SmsLog, type InsertSmsLog, type SmsSettings, type InsertSmsSettings, certificates as certificatesTable, inventory as inventoryTable, orders as ordersTable, users as usersTable, smsLogs as smsLogsTable, smsSettings as smsSettingsTable } from "@shared/schema";
import { db } from "../db/index.js";
import { eq, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User methods (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  hasAdmin(): Promise<boolean>;
  createAdmin(user: Pick<UpsertUser, 'email' | 'firstName' | 'lastName' | 'passwordHash'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inventory methods
  getInventoryByProductId(productId: string): Promise<Inventory | undefined>;
  getAllInventory(): Promise<Inventory[]>;
  updateInventoryStock(productId: string, remainingStock: number): Promise<Inventory>;
  atomicDecrementInventory(productId: string, quantity: number): Promise<{ success: boolean; inventory?: Inventory; error?: string }>;
  executeInventoryTransaction(items: Array<{ id: string; quantity: number }>, orderData: InsertOrder): Promise<{ updatedInventories: Array<{ productId: string; remainingStock: number; decremented: number }>; order: Order; certificates: Certificate[] }>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return result[0];
  }

  async hasAdmin(): Promise<boolean> {
    const result = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.isAdmin, 1)).limit(1);
    return result.length > 0;
  }

  async createAdmin(user: Pick<UpsertUser, 'email' | 'firstName' | 'lastName' | 'passwordHash'>): Promise<User> {
    const id = crypto.randomUUID();
    await db.insert(usersTable).values({ ...user, id, isAdmin: 1 });
    return (await this.getUser(id))!;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(usersTable)
      .values(userData)
      .onDuplicateKeyUpdate({
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      });
    return (await this.getUser(userData.id!))!;
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
      .where(eq(inventoryTable.productId, productId));

    return (await this.getInventoryByProductId(productId))!;
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
      .where(sql`${inventoryTable.productId} = ${productId} AND ${inventoryTable.remainingStock} >= ${quantity}`);

    if (result[0].affectedRows === 0) {
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

    return { success: true, inventory: (await this.getInventoryByProductId(productId))! };
  }

  async executeInventoryTransaction(
    items: Array<{ id: string; quantity: number }>, 
    orderData: InsertOrder
  ): Promise<{ updatedInventories: Array<{ productId: string; remainingStock: number; decremented: number }>; order: Order; certificates: Certificate[] }> {
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
          .where(sql`${inventoryTable.productId} = ${item.id} AND ${inventoryTable.remainingStock} >= ${item.quantity}`);

        if (result[0].affectedRows === 0) {
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
          remainingStock: (await tx.select().from(inventoryTable).where(eq(inventoryTable.productId, item.id)).limit(1))[0].remainingStock,
          decremented: item.quantity,
        });
      }

      // Create order only after all decrements succeed
      const orderId = crypto.randomUUID();
      await tx.insert(ordersTable).values({ ...orderData, id: orderId });
      const [order] = await tx.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);

      const limitedQuantity = items.find((item) => item.id === "coin120year")?.quantity ?? 0;
      const issuedCertificates: Certificate[] = [];
      if (limitedQuantity > 0) {
        // Serialize allocation so two simultaneous purchases can never receive
        // the same edition number.
        const [{ nextNumber }] = await tx
          .select({ nextNumber: sql<number>`COALESCE(MAX(${certificatesTable.editionNumber}), 0) + 1` })
          .from(certificatesTable);
        if (nextNumber + limitedQuantity - 1 > 1906) {
          throw new Error("The 1906 Limited Edition certificate registry is sold out");
        }
        for (let offset = 0; offset < limitedQuantity; offset += 1) {
          const editionNumber = nextNumber + offset;
          const certificateId = crypto.randomUUID();
          await tx.insert(certificatesTable).values({
            id: certificateId,
            serialNumber: `1906-LE-${String(editionNumber).padStart(6, "0")}`,
            editionNumber,
            orderId: order.id,
            customerId: order.customerId,
            purchaserName: order.customerName,
            purchaserEmail: order.customerEmail,
          });
          const [certificate] = await tx.select().from(certificatesTable).where(eq(certificatesTable.id, certificateId)).limit(1);
          issuedCertificates.push(certificate);
        }
      }

      return { updatedInventories, order, certificates: issuedCertificates };
    });
  }

  async initializeInventory(insertInventory: InsertInventory): Promise<Inventory> {
    // CRITICAL: Only insert if product doesn't exist
    // DO NOT reset remainingStock on conflict - preserves live inventory
    await db
      .insert(inventoryTable)
      .values(insertInventory)
      .onDuplicateKeyUpdate({ set: { productId: insertInventory.productId } });
    const existing = await this.getInventoryByProductId(insertInventory.productId);
    if (!existing) throw new Error(`Failed to initialize inventory for ${insertInventory.productId}`);
    return existing;
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
    const id = crypto.randomUUID();
    await db.insert(ordersTable).values({ ...insertOrder, id });
    return (await this.getOrder(id))!;
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
    await db
      .update(ordersTable)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id));
    return this.getOrder(id);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    await db
      .update(ordersTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id));
    return this.getOrder(id);
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
    await db
      .update(ordersTable)
      .set({ 
        [field]: 1,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id));
    return this.getOrder(id);
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
    const result = await db.insert(smsLogsTable).values(log).$returningId();
    return (await db.select().from(smsLogsTable).where(eq(smsLogsTable.id, result[0].id)).limit(1))[0];
  }

  async getSmsLogsByOrder(orderId: string): Promise<SmsLog[]> {
    return await db
      .select()
      .from(smsLogsTable)
      .where(eq(smsLogsTable.orderId, orderId))
      .orderBy(desc(smsLogsTable.createdAt));
  }

  async updateSmsLogStatus(id: number, status: string, errorMessage?: string): Promise<SmsLog | undefined> {
    await db
      .update(smsLogsTable)
      .set({ 
        status,
        errorMessage: errorMessage || null,
      })
      .where(eq(smsLogsTable.id, id));
    return (await db.select().from(smsLogsTable).where(eq(smsLogsTable.id, id)).limit(1))[0];
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
        recentSms: sql<number>`COALESCE(COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END), 0)`,
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
      .onDuplicateKeyUpdate({
        set: {
          value: setting.value,
          updatedAt: new Date(),
        },
      });
    return (await this.getSmsSettingByKey(setting.key))!;
  }
}

export const storage = new DbStorage();
