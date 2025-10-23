ALTER TABLE `inventory` ADD `commodityName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory` ADD `commodityUnit` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory` ADD `totalQtyPurchased` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `inventory` ADD `totalQtySold` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `inventory` ADD `totalCurrentQty` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `inventory` ADD `totalCurrentAmount` decimal(14,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `inventory` ADD `transactionId` varchar(36);--> statement-breakpoint
ALTER TABLE `inventory` ADD `transactionType` varchar(50);--> statement-breakpoint
ALTER TABLE `transactions` ADD `commodityName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `commodityUnit` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory` DROP COLUMN `totalQty`;--> statement-breakpoint
ALTER TABLE `transactions` DROP COLUMN `unit`;