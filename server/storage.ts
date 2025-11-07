import { type Inventory, type InsertInventory, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Inventory methods
  getInventory(): Promise<Inventory | undefined>;
  updateInventoryStock(remainingStock: number): Promise<Inventory>;
  initializeInventory(inventory: InsertInventory): Promise<Inventory>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private inventory: Inventory | undefined;
  private orders: Map<string, Order>;

  constructor() {
    this.orders = new Map();
    // Initialize with default inventory
    this.inventory = {
      id: randomUUID(),
      productName: "APA 120th Anniversary Commemorative Coin (6-Inch)",
      remainingStock: 406,
      initialStock: 406,
      lastUpdated: new Date(),
    };
  }

  async getInventory(): Promise<Inventory | undefined> {
    return this.inventory;
  }

  async updateInventoryStock(remainingStock: number): Promise<Inventory> {
    if (!this.inventory) {
      throw new Error("Inventory not initialized");
    }
    this.inventory = {
      ...this.inventory,
      remainingStock,
      lastUpdated: new Date(),
    };
    return this.inventory;
  }

  async initializeInventory(insertInventory: InsertInventory): Promise<Inventory> {
    this.inventory = {
      ...insertInventory,
      id: randomUUID(),
      lastUpdated: new Date(),
    };
    return this.inventory;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
