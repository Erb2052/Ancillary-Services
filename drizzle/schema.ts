import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Locations ────────────────────────────────────────────────────────────────
/**
 * Each Fountain Life clinic location.
 * Admins can add/edit/delete locations from the admin panel.
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  city: varchar("city", { length: 64 }),
  state: varchar("state", { length: 64 }),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // e.g. "orlando", "dallas"
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
/**
 * Master product catalog. Products are created once here and then
 * assigned to one or more locations via location_products.
 *
 * stripePriceId: paste your real Stripe Price ID here from the Stripe Dashboard.
 * The price field is display-only (in USD cents). Stripe uses stripePriceId for
 * the actual charge.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: varchar("description", { length: 512 }),
  details: text("details"),
  /** Display price in USD cents — e.g. 29900 = $299.00. Display only. */
  price: int("price").notNull().default(0),
  category: varchar("category", { length: 64 }),
  lucideIcon: varchar("lucideIcon", { length: 64 }).default("FlaskConical"),
  /**
   * ⚠️  STRIPE PRICE ID — REPLACE with your real Price ID from Stripe Dashboard.
   * Stripe Dashboard → Products → [product] → copy Price ID (starts with price_)
   */
  stripePriceId: varchar("stripePriceId", { length: 128 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Location Products ────────────────────────────────────────────────────────
/**
 * Join table that controls which products are available at each location.
 * Admins toggle products on/off per location from the admin panel.
 * A product can be assigned to multiple locations simultaneously.
 */
export const locationProducts = mysqlTable("location_products", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  productId: int("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  /** Toggle a product on/off for this location without removing the assignment */
  isEnabled: boolean("isEnabled").default(true).notNull(),
  /** Display order within this location's product list */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocationProduct = typeof locationProducts.$inferSelect;
export type InsertLocationProduct = typeof locationProducts.$inferInsert;
