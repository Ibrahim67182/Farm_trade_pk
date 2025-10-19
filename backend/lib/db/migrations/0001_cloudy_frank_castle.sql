ALTER TABLE `commodityRates` ADD `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory` ADD `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `userId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `userId` varchar(36) NOT NULL;