DROP TABLE `auditLogs`;--> statement-breakpoint
ALTER TABLE `commodityRates` ADD `salePricePerUnit` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `commodityRates` ADD `purchasePricePerUnit` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `commodityRates` DROP COLUMN `pricePerUnit`;