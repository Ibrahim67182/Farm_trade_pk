CREATE TABLE `auditLogs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` varchar(36) NOT NULL,
	`action` varchar(255) NOT NULL,
	`entity` varchar(255) NOT NULL,
	`entityId` varchar(36) NOT NULL,
	`details` json,
	`timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commodities` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`unitType` varchar(50) NOT NULL,
	`description` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime,
	CONSTRAINT `commodities_id` PRIMARY KEY(`id`),
	CONSTRAINT `commodities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `commodityRates` (
	`id` varchar(36) NOT NULL,
	`commodityId` varchar(36) NOT NULL,
	`pricePerUnit` decimal(10,2) NOT NULL,
	`fetchedAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `commodityRates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` varchar(255),
	`email` varchar(255),
	`phone` varchar(50),
	`address` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` varchar(36) NOT NULL,
	`commodityId` varchar(36) NOT NULL,
	`totalQty` decimal(12,2) DEFAULT '0',
	`lastUpdated` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_commodityId_unique` UNIQUE(`commodityId`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` varchar(255),
	`email` varchar(255),
	`phone` varchar(50),
	`address` text,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(36) NOT NULL,
	`type` varchar(100) NOT NULL,
	`commodityId` varchar(36) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`ratePerUnit` decimal(10,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`mannEquivalent` decimal(10,2),
	`supplierId` varchar(36),
	`customerId` varchar(36),
	`notes` text,
	`dateTime` datetime DEFAULT CURRENT_TIMESTAMP,
	`createdBy` varchar(36) NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`googleId` varchar(255),
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_googleId_unique` UNIQUE(`googleId`)
);
