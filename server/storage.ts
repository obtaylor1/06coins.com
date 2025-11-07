import { type Inventory, type InsertInventory, type Order, type InsertOrder, type User, type UpsertUser, inventory as inventoryTable, orders as ordersTable, users as usersTable } from "@shared/schema";
import { db } from "../db/index.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inventory methods
  getInventory(): Promise<Inventory | undefined>;
  updateInventoryStock(remainingStock: number): Promise<Inventory>;
  initializeInventory(inventory: InsertInventory): Promise<Inventory>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
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
  async getInventory(): Promise<Inventory | undefined> {
    const result = await db.select().from(inventoryTable).limit(1);
    
    // If no inventory exists, initialize with default
    if (result.length === 0) {
      return await this.initializeInventory({
        productName: "APA 120th Anniversary Commemorative Coin (6-Inch)",
        remainingStock: 1906,
        initialStock: 1906,
      });
    }
    
    return result[0];
  }

  async updateInventoryStock(remainingStock: number): Promise<Inventory> {
    const current = await this.getInventory();
    if (!current) {
      throw new Error("Inventory not initialized");
    }

    const result = await db
      .update(inventoryTable)
      .set({ 
        remainingStock,
        lastUpdated: new Date(),
      })
      .where(eq(inventoryTable.id, current.id))
      .returning();

    return result[0];
  }

  async initializeInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const result = await db
      .insert(inventoryTable)
      .values(insertInventory)
      .returning();

    return result[0];
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
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();

    return result[0];
  }
}

export const storage = new DbStorage();
