DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `activity_logs` MODIFY COLUMN `action` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `activity_logs` MODIFY COLUMN `entity_type` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `activity_logs` MODIFY COLUMN `entity_id` varchar(255);--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `product_id` varchar(100) NOT NULL DEFAULT 'coin120year';--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `diameter` varchar(64) NOT NULL DEFAULT '4 inches';--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `finish` varchar(100) NOT NULL DEFAULT 'Antique gold';--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `material` varchar(255) NOT NULL DEFAULT 'Antique gold-tone alloy';--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'prospect';--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `customer_type` varchar(32) NOT NULL DEFAULT 'individual';--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `collector_tier` varchar(32) NOT NULL DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE `customers` MODIFY COLUMN `source` varchar(32) NOT NULL DEFAULT 'order';--> statement-breakpoint
ALTER TABLE `inventory` MODIFY COLUMN `product_id` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory` MODIFY COLUMN `sku` varchar(100);--> statement-breakpoint
ALTER TABLE `inventory_adjustments` MODIFY COLUMN `product_id` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `priority` varchar(32) NOT NULL DEFAULT 'informational';--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `entity_type` varchar(100);--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `entity_id` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `stripe_payment_intent_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `payment_status` varchar(32) NOT NULL DEFAULT 'paid';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `fulfillment_status` varchar(32) NOT NULL DEFAULT 'unfulfilled';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `delivery_status` varchar(32) NOT NULL DEFAULT 'not_shipped';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `sales_channel` varchar(32) NOT NULL DEFAULT 'online_store';--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `risk_level` varchar(32) NOT NULL DEFAULT 'low';--> statement-breakpoint
ALTER TABLE `sms_logs` MODIFY COLUMN `type` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `sms_logs` MODIFY COLUMN `template_name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `sms_logs` MODIFY COLUMN `status` varchar(32) NOT NULL DEFAULT 'sent';--> statement-breakpoint
ALTER TABLE `sms_settings` MODIFY COLUMN `key` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` MODIFY COLUMN `key` varchar(191) NOT NULL;