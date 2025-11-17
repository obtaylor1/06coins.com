import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: integer("is_admin").default(0).notNull(), // 0 = regular user, 1 = admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Inventory tracking for all products
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull().unique(),
  productName: text("product_name").notNull(),
  remainingStock: integer("remaining_stock").notNull(),
  initialStock: integer("initial_stock").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// Orders for coin purchases
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, completed, failed
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"), // Phone number for SMS
  shippingAddress: jsonb("shipping_address"), // { line1, line2, city, state, postal_code, country }
  cartItems: jsonb("cart_items"), // Array of {id, name, quantity, price} for each item ordered
  
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
  smsLog: jsonb("sms_log"), // Array of {type, timestamp, status, error} for admin visibility
  
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

// SMS Logs for admin tracking and monitoring
export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  type: text("type").notNull(), // transactional, marketing, admin
  templateName: text("template_name").notNull(), // orderConfirmation, shippingConfirmation, etc.
  orderId: varchar("order_id"), // nullable, reference to orders table
  customerName: text("customer_name"), // nullable, for display
  phone: text("phone").notNull(),
  status: text("status").notNull().default("sent"), // sent, delivered, failed, opted_out
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
export const smsSettings = pgTable("sms_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSmsSettingsSchema = createInsertSchema(smsSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSmsSettings = z.infer<typeof insertSmsSettingsSchema>;
export type SmsSettings = typeof smsSettings.$inferSelect;
