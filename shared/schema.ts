import { randomUUID } from "node:crypto";
import { mysqlTable, text, varchar, int as integer, timestamp, json, index, serial, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  email: varchar("email", { length: 254 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 2048 }),
  passwordHash: text("password_hash"),
  isAdmin: integer("is_admin").default(0).notNull(), // 0 = regular user, 1 = admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  email: varchar("email", { length: 254 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 40 }),
  status: varchar("status", { length: 32 }).notNull().default("prospect"),
  customerType: varchar("customer_type", { length: 32 }).notNull().default("individual"),
  collectorTier: varchar("collector_tier", { length: 32 }).notNull().default("standard"),
  marketingEmail: boolean("marketing_email").notNull().default(false),
  tags: json("tags").notNull().default([]),
  notes: text("notes"),
  defaultAddress: json("default_address"),
  source: varchar("source", { length: 32 }).notNull().default("order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export type Customer = typeof customers.$inferSelect;

// Inventory tracking for all products
export const inventory = mysqlTable("inventory", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  productId: varchar("product_id", { length: 100 }).notNull().unique(),
  productName: text("product_name").notNull(),
  remainingStock: integer("remaining_stock").notNull(),
  initialStock: integer("initial_stock").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  sku: varchar("sku", { length: 100 }),
  reorderThreshold: integer("reorder_threshold").notNull().default(50),
  unitCost: integer("unit_cost").notNull().default(0),
  price: integer("price").notNull().default(0),
  metadata: json("metadata").notNull().default({}),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// Orders for coin purchases
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  quantity: integer("quantity").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending, processing, shipped, delivered, completed, failed
  customerId: varchar("customer_id", { length: 36 }),
  paymentStatus: varchar("payment_status", { length: 32 }).notNull().default("paid"),
  fulfillmentStatus: varchar("fulfillment_status", { length: 32 }).notNull().default("unfulfilled"),
  deliveryStatus: varchar("delivery_status", { length: 32 }).notNull().default("not_shipped"),
  salesChannel: varchar("sales_channel", { length: 32 }).notNull().default("online_store"),
  riskLevel: varchar("risk_level", { length: 32 }).notNull().default("low"),
  assignedTo: varchar("assigned_to", { length: 36 }),
  internalNotes: text("internal_notes"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"), // Phone number for SMS
  shippingAddress: json("shipping_address"), // { line1, line2, city, state, postal_code, country }
  cartItems: json("cart_items"), // Array of {id, name, quantity, price} for each item ordered
  
  // SMS opt-in preferences
  smsOrderUpdatesOptIn: integer("sms_order_updates_opt_in").default(0).notNull(), // 0 = no, 1 = yes
  smsMarketingOptIn: integer("sms_marketing_opt_in").default(0).notNull(), // 0 = no, 1 = yes
  smsOptedOutAt: timestamp("sms_opted_out_at"), // Timestamp when customer opted out
  
  // Shipping & delivery tracking
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"), // e.g., "USPS", "FedEx", "UPS"
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Email tracking (to prevent duplicate sends)
  emailConfirmationSent: integer("email_confirmation_sent").default(0).notNull(), // 0 = not sent, 1 = sent
  emailShippingSent: integer("email_shipping_sent").default(0).notNull(),
  emailDeliverySent: integer("email_delivery_sent").default(0).notNull(),
  emailThankYouSent: integer("email_thank_you_sent").default(0).notNull(),
  emailReviewSent: integer("email_review_sent").default(0).notNull(),
  emailThankYouScheduledFor: timestamp("email_thank_you_scheduled_for"), // 1-2 days after delivery
  emailReviewScheduledFor: timestamp("email_review_scheduled_for"), // 5-7 days after delivery
  
  // SMS tracking (to prevent duplicate sends and track delivery)
  smsConfirmationSent: integer("sms_confirmation_sent").default(0).notNull(),
  smsShippingSent: integer("sms_shipping_sent").default(0).notNull(),
  smsDeliverySent: integer("sms_delivery_sent").default(0).notNull(),
  smsThankYouSent: integer("sms_thank_you_sent").default(0).notNull(),
  smsReviewSent: integer("sms_review_sent").default(0).notNull(),
  smsProblemSent: integer("sms_problem_sent").default(0).notNull(),
  smsThankYouScheduledFor: timestamp("sms_thank_you_scheduled_for"), // 1-2 days after delivery
  smsReviewScheduledFor: timestamp("sms_review_scheduled_for"), // 5-7 days after delivery
  smsSentToday: integer("sms_sent_today").default(0).notNull(), // Rate limiting counter
  smsLastSentDate: text("sms_last_sent_date"), // Date string (YYYY-MM-DD) for rate limiting reset
  smsError: integer("sms_error").default(0).notNull(), // 0 = no error, 1 = error occurred
  smsLog: json("sms_log"), // Array of {type, timestamp, status, error} for admin visibility
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Authenticity registry for the 1,906 individually numbered limited-edition coins.
// Purchaser fields are retained as an immutable purchase snapshot; public APIs
// expose only a shortened display name.
export const certificates = mysqlTable("certificates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  serialNumber: varchar("serial_number", { length: 32 }).notNull().unique(),
  editionNumber: integer("edition_number").notNull().unique(),
  editionSize: integer("edition_size").notNull().default(1906),
  productId: varchar("product_id", { length: 100 }).notNull().default("coin120year"),
  orderId: varchar("order_id", { length: 36 }).notNull(),
  customerId: varchar("customer_id", { length: 36 }),
  purchaserName: text("purchaser_name"),
  purchaserEmail: text("purchaser_email"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  diameter: varchar("diameter", { length: 64 }).notNull().default("4 inches"),
  finish: varchar("finish", { length: 100 }).notNull().default("Antique gold"),
  material: varchar("material", { length: 255 }).notNull().default("Antique gold-tone alloy"),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  verificationCount: integer("verification_count").notNull().default(0),
  lastVerifiedAt: timestamp("last_verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("IDX_certificates_order").on(table.orderId)]);

export type Certificate = typeof certificates.$inferSelect;

export const inventoryAdjustments = mysqlTable("inventory_adjustments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  productId: varchar("product_id", { length: 100 }).notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  referenceNumber: text("reference_number"),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogs = mysqlTable("activity_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  actorId: varchar("actor_id", { length: 36 }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }),
  details: json("details").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(randomUUID),
  type: varchar("type", { length: 64 }).notNull(),
  priority: varchar("priority", { length: 32 }).notNull().default("informational"),
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id", { length: 255 }),
  read: boolean("read").notNull().default(false),
  dismissed: boolean("dismissed").notNull().default(false),
  assignedTo: varchar("assigned_to", { length: 36 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storeSettings = mysqlTable("store_settings", {
  key: varchar("key", { length: 191 }).primaryKey(),
  value: json("value").notNull(),
  updatedBy: varchar("updated_by", { length: 36 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// SMS Logs for admin tracking and monitoring
export const smsLogs = mysqlTable("sms_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  type: varchar("type", { length: 32 }).notNull(), // transactional, marketing, admin
  templateName: varchar("template_name", { length: 100 }).notNull(), // orderConfirmation, shippingConfirmation, etc.
  orderId: varchar("order_id", { length: 36 }), // nullable, reference to orders table
  customerName: text("customer_name"), // nullable, for display
  phone: text("phone").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("sent"), // sent, delivered, failed, opted_out
  providerMessageId: text("provider_message_id"), // Twilio SID
  errorMessage: text("error_message"), // nullable
  body: text("body").notNull(), // Full SMS text
});

export const insertSmsLogSchema = createInsertSchema(smsLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;
export type SmsLog = typeof smsLogs.$inferSelect;

// SMS Settings for admin configuration
export const smsSettings = mysqlTable("sms_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 191 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSmsSettingsSchema = createInsertSchema(smsSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSmsSettings = z.infer<typeof insertSmsSettingsSchema>;
export type SmsSettings = typeof smsSettings.$inferSelect;
