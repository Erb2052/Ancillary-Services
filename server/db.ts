import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertLocation,
  InsertProduct,
  locationProducts,
  locations,
  products,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Locations ────────────────────────────────────────────────────────────────

export async function getAllLocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(locations).orderBy(asc(locations.name));
}

export async function getActiveLocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(locations).where(eq(locations.isActive, true)).orderBy(asc(locations.name));
}

export async function getLocationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(locations).where(eq(locations.slug, slug)).limit(1);
  return result[0] ?? undefined;
}

export async function createLocation(data: InsertLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(locations).values(data);
  const result = await db.select().from(locations).where(eq(locations.slug, data.slug)).limit(1);
  return result[0];
}

export async function updateLocation(id: number, data: Partial<InsertLocation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(locations).set(data).where(eq(locations.id, id));
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result[0];
}

export async function deleteLocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(locations).where(eq(locations.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(asc(products.name));
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  const inserted = await db.select().from(products).where(eq(products.id, (result as any).insertId)).limit(1);
  return inserted[0];
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Location Products ────────────────────────────────────────────────────────

/** Get all products assigned to a location (with enabled status) */
export async function getLocationProducts(locationId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      product: products,
      isEnabled: locationProducts.isEnabled,
      sortOrder: locationProducts.sortOrder,
      locationProductId: locationProducts.id,
    })
    .from(locationProducts)
    .innerJoin(products, eq(locationProducts.productId, products.id))
    .where(eq(locationProducts.locationId, locationId))
    .orderBy(asc(locationProducts.sortOrder), asc(products.name));
  return rows;
}

/** Get only ENABLED products for a location (patient-facing) */
export async function getEnabledProductsForLocation(locationId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ product: products, sortOrder: locationProducts.sortOrder })
    .from(locationProducts)
    .innerJoin(products, eq(locationProducts.productId, products.id))
    .where(
      and(
        eq(locationProducts.locationId, locationId),
        eq(locationProducts.isEnabled, true),
        eq(products.isActive, true)
      )
    )
    .orderBy(asc(locationProducts.sortOrder), asc(products.name));
  return rows.map((r) => r.product);
}

/** Assign a product to a location */
export async function assignProductToLocation(locationId: number, productId: number, sortOrder = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(locationProducts)
    .values({ locationId, productId, isEnabled: true, sortOrder })
    .onDuplicateKeyUpdate({ set: { isEnabled: true } });
}

/** Toggle a product's enabled state for a specific location */
export async function toggleLocationProduct(locationProductId: number, isEnabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(locationProducts).set({ isEnabled }).where(eq(locationProducts.id, locationProductId));
}

/** Remove a product assignment from a location */
export async function removeProductFromLocation(locationProductId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(locationProducts).where(eq(locationProducts.id, locationProductId));
}

/** Get all product IDs currently assigned to a location */
export async function getAssignedProductIds(locationId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ productId: locationProducts.productId })
    .from(locationProducts)
    .where(eq(locationProducts.locationId, locationId));
  return rows.map((r) => r.productId);
}
