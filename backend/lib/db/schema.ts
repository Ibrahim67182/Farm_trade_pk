import { mysqlTable, varchar, text, datetime, decimal, json, bigint } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

// 🧑‍💼 USER TABLE
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  googleId: varchar("googleId", { length: 255 }).unique(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

// 🌾 COMMODITY
export const commodities = mysqlTable("commodities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  unitType: varchar("unitType", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

// 🧾 SUPPLIER
export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

// 👥 CUSTOMER
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

// 💰 TRANSACTION
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  commodityId: varchar("commodityId", { length: 36 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  ratePerUnit: decimal("ratePerUnit", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  mannEquivalent: decimal("mannEquivalent", { precision: 10, scale: 2 }),
  supplierId: varchar("supplierId", { length: 36 }),
  customerId: varchar("customerId", { length: 36 }),
  notes: text("notes"),
  dateTime: datetime("dateTime").default(sql`CURRENT_TIMESTAMP`),
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

// 📦 INVENTORY
export const inventory = mysqlTable("inventory", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  commodityId: varchar("commodityId", { length: 36 }).unique().notNull(),
  totalQty: decimal("totalQty", { precision: 12, scale: 2 }).default("0"),
  lastUpdated: datetime("lastUpdated").default(sql`CURRENT_TIMESTAMP`),
});

// 💹 COMMODITY RATE
export const commodityRates = mysqlTable("commodityRates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  commodityId: varchar("commodityId", { length: 36 }).notNull(),
  pricePerUnit: decimal("pricePerUnit", { precision: 10, scale: 2 }).notNull(),
  fetchedAt: datetime("fetchedAt").default(sql`CURRENT_TIMESTAMP`),
});

// 🧾 AUDIT LOG
export const auditLogs = mysqlTable("auditLogs", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: varchar("userId", { length: 36 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 255 }).notNull(),
  entityId: varchar("entityId", { length: 36 }).notNull(),
  details: json("details"),
  timestamp: datetime("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

// 🔗 RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  auditLogs: many(auditLogs),
}));

export const commoditiesRelations = relations(commodities, ({ many, one }) => ({
  transactions: many(transactions),
  inventory: one(inventory),
  rates: many(commodityRates),
}));
