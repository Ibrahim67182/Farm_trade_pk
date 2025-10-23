ALTER TABLE `commodityRates` ADD `commodityName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `commodityRates` ADD CONSTRAINT `commodityRates_commodityId_unique` UNIQUE(`commodityId`);