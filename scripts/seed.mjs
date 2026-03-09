/**
 * Seed script — populates the database with 5 Fountain Life locations
 * and 10 health add-on products, assigning all products to all locations.
 *
 * Run with: node scripts/seed.mjs
 *
 * Safe to re-run: uses INSERT IGNORE / ON DUPLICATE KEY UPDATE patterns.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL not set. Aborting seed.");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

// ─── Locations ────────────────────────────────────────────────────────────────
const LOCATIONS = [
  { name: "Fountain Life Orlando",   city: "Orlando",     state: "FL", slug: "orlando"    },
  { name: "Fountain Life Dallas",    city: "Dallas",      state: "TX", slug: "dallas"     },
  { name: "Fountain Life New York",  city: "New York",    state: "NY", slug: "new-york"   },
  { name: "Fountain Life Miami",     city: "Miami",       state: "FL", slug: "miami"      },
  { name: "Fountain Life Nashville", city: "Nashville",   state: "TN", slug: "nashville"  },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// ⚠️  REPLACE each stripePriceId with your real Stripe Price ID.
// Find them at: https://dashboard.stripe.com/products
const PRODUCTS = [
  {
    name: "Early Cancer Detection Test",
    description: "Advanced multi-cancer early detection screening using liquid biopsy technology.",
    details: "Detects signals from over 50 cancer types through a single blood draw. Recommended annually for comprehensive cancer surveillance.",
    price: 99900,
    category: "Cancer Screening",
    lucideIcon: "ScanLine",
    stripePriceId: "price_REPLACE_EARLY_CANCER_DETECTION", // ⚠️ REPLACE
  },
  {
    name: "Environmental Toxin Test",
    description: "Comprehensive screening for heavy metals, pesticides, and industrial chemicals.",
    details: "Measures exposure to over 200 environmental toxins including mercury, lead, arsenic, and common pesticides. Includes a personalized detox protocol.",
    price: 59900,
    category: "Toxicology",
    lucideIcon: "FlaskConical",
    stripePriceId: "price_REPLACE_ENVIRONMENTAL_TOXIN", // ⚠️ REPLACE
  },
  {
    name: "Biological Age Test",
    description: "Epigenetic clock analysis to measure your true biological age vs. chronological age.",
    details: "Uses DNA methylation patterns to calculate your biological age. Identifies lifestyle factors accelerating or decelerating aging at the cellular level.",
    price: 49900,
    category: "Longevity",
    lucideIcon: "Timer",
    stripePriceId: "price_REPLACE_BIOLOGICAL_AGE", // ⚠️ REPLACE
  },
  {
    name: "Comprehensive Nutrition Profile",
    description: "Full micronutrient analysis covering 40+ vitamins, minerals, and antioxidants.",
    details: "Identifies deficiencies and excesses across all major micronutrients. Includes personalized supplementation and dietary recommendations.",
    price: 39900,
    category: "Nutrition",
    lucideIcon: "Leaf",
    stripePriceId: "price_REPLACE_NUTRITION_PROFILE", // ⚠️ REPLACE
  },
  {
    name: "Nutrient & Toxic Elements Testing",
    description: "Simultaneous measurement of essential nutrients and toxic element levels.",
    details: "Evaluates 35 essential elements (zinc, magnesium, selenium, etc.) alongside 15 toxic elements. Provides a complete picture of your elemental health status.",
    price: 44900,
    category: "Nutrition",
    lucideIcon: "TestTube",
    stripePriceId: "price_REPLACE_NUTRIENT_TOXIC_ELEMENTS", // ⚠️ REPLACE
  },
  {
    name: "Gut Microbiome Analysis",
    description: "Deep sequencing of your gut microbiome to assess diversity and dysbiosis risk.",
    details: "Identifies over 500 bacterial species and their functional roles. Includes personalized probiotic and prebiotic recommendations.",
    price: 34900,
    category: "Gut Health",
    lucideIcon: "Activity",
    stripePriceId: "price_REPLACE_GUT_MICROBIOME", // ⚠️ REPLACE
  },
  {
    name: "Hormone Optimization Panel",
    description: "Comprehensive hormone analysis including sex hormones, thyroid, and adrenal markers.",
    details: "Measures 20+ hormones including testosterone, estrogen, progesterone, DHEA, cortisol, and full thyroid panel. Includes optimization consultation.",
    price: 54900,
    category: "Hormones",
    lucideIcon: "Zap",
    stripePriceId: "price_REPLACE_HORMONE_PANEL", // ⚠️ REPLACE
  },
  {
    name: "Advanced Cardiovascular Risk Panel",
    description: "Beyond standard lipids — ApoB, Lp(a), oxidized LDL, and inflammatory markers.",
    details: "Includes ApoB, ApoA1, Lp(a), oxidized LDL, hsCRP, homocysteine, fibrinogen, and advanced lipid particle sizing for precise cardiovascular risk stratification.",
    price: 49900,
    category: "Cardiovascular",
    lucideIcon: "HeartPulse",
    stripePriceId: "price_REPLACE_CARDIOVASCULAR_PANEL", // ⚠️ REPLACE
  },
  {
    name: "Cognitive Health & Brain Panel",
    description: "Early biomarker detection for cognitive decline risk and brain health optimization.",
    details: "Measures APOE genotype, amyloid beta ratios, BDNF, homocysteine, and inflammatory markers associated with neurodegeneration. Includes cognitive health recommendations.",
    price: 64900,
    category: "Cognitive Health",
    lucideIcon: "BrainCircuit",
    stripePriceId: "price_REPLACE_COGNITIVE_PANEL", // ⚠️ REPLACE
  },
  {
    name: "Immune Function & Inflammation Panel",
    description: "Comprehensive immune system assessment including NK cell activity and cytokine profiles.",
    details: "Evaluates innate and adaptive immune function, natural killer cell activity, key cytokines, and chronic inflammation markers. Ideal for immune optimization.",
    price: 44900,
    category: "Immune Health",
    lucideIcon: "ShieldCheck",
    stripePriceId: "price_REPLACE_IMMUNE_PANEL", // ⚠️ REPLACE
  },
];

console.log("🌱  Starting seed...\n");

// Insert locations
const locationIds = [];
for (const loc of LOCATIONS) {
  await connection.execute(
    `INSERT INTO locations (name, city, state, slug, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name=VALUES(name), city=VALUES(city), state=VALUES(state), updatedAt=NOW()`,
    [loc.name, loc.city, loc.state, loc.slug]
  );
  const [rows] = await connection.execute("SELECT id FROM locations WHERE slug = ?", [loc.slug]);
  locationIds.push(rows[0].id);
  console.log(`  ✅  Location: ${loc.name} (id=${rows[0].id})`);
}

// Insert products
const productIds = [];
for (const prod of PRODUCTS) {
  await connection.execute(
    `INSERT INTO products (name, description, details, price, category, lucideIcon, stripePriceId, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), updatedAt=NOW()`,
    [prod.name, prod.description, prod.details, prod.price, prod.category, prod.lucideIcon, prod.stripePriceId]
  );
  const [rows] = await connection.execute("SELECT id FROM products WHERE name = ?", [prod.name]);
  productIds.push(rows[0].id);
  console.log(`  ✅  Product: ${prod.name} (id=${rows[0].id})`);
}

// Assign all products to all locations
console.log("\n  Assigning products to locations...");
for (const locId of locationIds) {
  let sortOrder = 0;
  for (const prodId of productIds) {
    await connection.execute(
      `INSERT INTO location_products (locationId, productId, isEnabled, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, 1, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE updatedAt=NOW()`,
      [locId, prodId, sortOrder++]
    );
  }
}
console.log(`  ✅  All ${productIds.length} products assigned to all ${locationIds.length} locations.\n`);

await connection.end();
console.log("🎉  Seed complete!\n");
console.log("⚠️   NEXT STEP: Replace placeholder Stripe Price IDs in the admin panel.");
console.log("    Go to /admin → Products by Location → click the ⚠️ Placeholder badge to edit.\n");
