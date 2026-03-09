/**
 * ============================================================
 *  HEALTH ADD-ON SERVICES — PRODUCT CATALOG
 * ============================================================
 *
 *  HOW TO CONFIGURE YOUR STRIPE PRICE IDs:
 *  ----------------------------------------
 *  Each product below has a `stripePriceId` field.
 *  Every value that starts with "price_REPLACE_" is a PLACEHOLDER.
 *
 *  To find your real Price IDs:
 *    1. Log in to your Stripe Dashboard → https://dashboard.stripe.com
 *    2. Go to Products → find each product
 *    3. Click the product → copy the Price ID (starts with "price_")
 *    4. Replace the placeholder value below with your real Price ID
 *
 *  Example:
 *    stripePriceId: "price_REPLACE_EARLY_CANCER_DETECTION"
 *    → becomes →
 *    stripePriceId: "price_1ABC123def456XYZ"
 *
 *  The `price` field (in cents) is used for DISPLAY ONLY on the frontend.
 *  Stripe uses the `stripePriceId` for the actual charge amount.
 * ============================================================
 */

export interface HealthProduct {
  id: string;
  name: string;
  description: string;
  details: string;
  price: number; // Display price in USD cents (e.g. 29900 = $299.00)
  category: string;
  /** Lucide icon name — rendered as a React component in the UI */
  lucideIcon: string;
  // ⚠️  REPLACE THIS with your real Stripe Price ID from the Stripe Dashboard
  stripePriceId: string;
}

export const HEALTH_PRODUCTS: HealthProduct[] = [
  {
    id: "early-cancer-detection",
    name: "Early Cancer Detection Test",
    description: "Advanced multi-cancer early detection screening",
    details:
      "A comprehensive blood-based screening that analyzes circulating tumor DNA and protein biomarkers to detect signals associated with 50+ cancer types — often before symptoms appear.",
    price: 99900, // $999.00 — DISPLAY ONLY, actual charge set in Stripe
    category: "Cancer Screening",
    lucideIcon: "ScanLine",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Early Cancer Detection → copy Price ID
    stripePriceId: "price_REPLACE_EARLY_CANCER_DETECTION",
  },
  {
    id: "environmental-toxin-test",
    name: "Environmental Toxin Test",
    description: "Comprehensive environmental exposure and toxin panel",
    details:
      "Measures your body's burden of heavy metals, pesticides, plasticizers, and other environmental chemicals that can silently disrupt hormones, metabolism, and cellular health.",
    price: 49900, // $499.00 — DISPLAY ONLY
    category: "Toxicology",
    lucideIcon: "FlaskConical",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Environmental Toxin Test → copy Price ID
    stripePriceId: "price_REPLACE_ENVIRONMENTAL_TOXIN",
  },
  {
    id: "biological-age-test",
    name: "Biological Age Test",
    description: "Epigenetic clock and cellular aging analysis",
    details:
      "Uses DNA methylation patterns to calculate your true biological age at the cellular level — revealing how lifestyle, stress, and environment are accelerating or slowing your aging process.",
    price: 39900, // $399.00 — DISPLAY ONLY
    category: "Longevity",
    lucideIcon: "Timer",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Biological Age Test → copy Price ID
    stripePriceId: "price_REPLACE_BIOLOGICAL_AGE",
  },
  {
    id: "comprehensive-nutrition-profile",
    name: "Comprehensive Nutrition Profile",
    description: "Full-spectrum micronutrient and dietary analysis",
    details:
      "Evaluates over 40 vitamins, minerals, amino acids, and fatty acids to identify nutritional deficiencies and imbalances that impact energy, immunity, cognition, and overall wellness.",
    price: 34900, // $349.00 — DISPLAY ONLY
    category: "Nutrition",
    lucideIcon: "Leaf",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Comprehensive Nutrition Profile → copy Price ID
    stripePriceId: "price_REPLACE_NUTRITION_PROFILE",
  },
  {
    id: "nutrient-toxic-elements",
    name: "Nutrient & Toxic Elements Testing",
    description: "Essential mineral balance and toxic metal screening",
    details:
      "Simultaneously measures essential minerals (magnesium, zinc, selenium, copper) alongside toxic elements (lead, mercury, arsenic, cadmium) to give a complete picture of your elemental health.",
    price: 29900, // $299.00 — DISPLAY ONLY
    category: "Toxicology",
    lucideIcon: "TestTube",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Nutrient & Toxic Elements → copy Price ID
    stripePriceId: "price_REPLACE_NUTRIENT_TOXIC_ELEMENTS",
  },
  {
    id: "gut-microbiome-analysis",
    name: "Gut Microbiome Analysis",
    description: "Advanced gut flora diversity and health assessment",
    details:
      "Deep sequencing of your gut microbiome identifies bacterial diversity, beneficial and harmful species, and provides personalized recommendations for diet and probiotics to optimize digestive and immune health.",
    price: 44900, // $449.00 — DISPLAY ONLY
    category: "Gut Health",
    lucideIcon: "Activity",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Gut Microbiome Analysis → copy Price ID
    stripePriceId: "price_REPLACE_GUT_MICROBIOME",
  },
  {
    id: "hormone-optimization-panel",
    name: "Hormone Optimization Panel",
    description: "Comprehensive sex and stress hormone evaluation",
    details:
      "Measures testosterone, estrogen, progesterone, DHEA, cortisol, and thyroid hormones to identify imbalances that affect energy, mood, body composition, libido, and long-term vitality.",
    price: 37900, // $379.00 — DISPLAY ONLY
    category: "Hormones",
    lucideIcon: "Zap",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Hormone Optimization Panel → copy Price ID
    stripePriceId: "price_REPLACE_HORMONE_PANEL",
  },
  {
    id: "cardiovascular-risk-panel",
    name: "Advanced Cardiovascular Risk Panel",
    description: "Beyond-standard heart disease risk assessment",
    details:
      "Goes beyond basic cholesterol to measure ApoB, Lp(a), oxidized LDL, hs-CRP, homocysteine, and other advanced markers that predict cardiovascular risk decades before traditional tests.",
    price: 32900, // $329.00 — DISPLAY ONLY
    category: "Heart Health",
    lucideIcon: "HeartPulse",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Cardiovascular Risk Panel → copy Price ID
    stripePriceId: "price_REPLACE_CARDIOVASCULAR_PANEL",
  },
  {
    id: "cognitive-health-panel",
    name: "Cognitive Health & Brain Panel",
    description: "Neurological biomarkers and cognitive risk assessment",
    details:
      "Measures APOE genotype, BDNF, inflammatory markers, and metabolic factors linked to cognitive decline and neurodegenerative conditions, enabling proactive brain health strategies.",
    price: 54900, // $549.00 — DISPLAY ONLY
    category: "Brain Health",
    lucideIcon: "BrainCircuit",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Cognitive Health Panel → copy Price ID
    stripePriceId: "price_REPLACE_COGNITIVE_PANEL",
  },
  {
    id: "immune-function-panel",
    name: "Immune Function & Inflammation Panel",
    description: "Comprehensive immune system status and inflammatory load",
    details:
      "Evaluates immune cell populations, cytokine levels, autoimmune markers, and systemic inflammation to identify vulnerabilities, chronic activation, or suppression affecting your body's defense system.",
    price: 27900, // $279.00 — DISPLAY ONLY
    category: "Immune Health",
    lucideIcon: "ShieldCheck",
    // ⚠️  REPLACE: Go to Stripe Dashboard → Products → Immune Function Panel → copy Price ID
    stripePriceId: "price_REPLACE_IMMUNE_PANEL",
  },
];

export type ProductId = (typeof HEALTH_PRODUCTS)[number]["id"];
