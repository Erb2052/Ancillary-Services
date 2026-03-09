/**
 * Tests for the Stripe checkout session tRPC procedure and product catalog.
 *
 * NOTE: These tests mock the Stripe API so no real Stripe key is required.
 * The actual Stripe integration is tested end-to-end manually after
 * replacing the placeholder credentials in:
 *   - server/stripe.ts  (STRIPE_SECRET_KEY)
 *   - shared/products.ts (stripePriceId values)
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock Stripe module ───────────────────────────────────────────────────────
vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn(async (lineItems, successUrl, cancelUrl) => {
    if (lineItems.some((item: { stripePriceId: string }) =>
      item.stripePriceId.startsWith("price_REPLACE_")
    )) {
      throw new Error("Placeholder Price IDs detected");
    }
    return `https://checkout.stripe.com/pay/mock_session_${Date.now()}`;
  }),
}));

// ─── Mock products with real-looking Price IDs ────────────────────────────────
vi.mock("../shared/products", () => ({
  HEALTH_PRODUCTS: [
    {
      id: "early-cancer-detection",
      name: "Early Cancer Detection Test",
      description: "Advanced multi-cancer early detection screening",
      details: "Details here",
      price: 99900,
      category: "Cancer Screening",
      icon: "🔬",
      stripePriceId: "price_mock_cancer_detection_123",
    },
    {
      id: "biological-age-test",
      name: "Biological Age Test",
      description: "Epigenetic clock and cellular aging analysis",
      details: "Details here",
      price: 39900,
      category: "Longevity",
      icon: "⏳",
      stripePriceId: "price_mock_bio_age_456",
    },
    {
      id: "placeholder-product",
      name: "Placeholder Product",
      description: "Has a placeholder Price ID",
      details: "Details here",
      price: 10000,
      category: "Test",
      icon: "🧪",
      stripePriceId: "price_REPLACE_PLACEHOLDER",
    },
  ],
}));

// ─── Test context factory ─────────────────────────────────────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("products.list", () => {
  it("returns all products from the catalog", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const products = await caller.products.list();
    expect(products).toHaveLength(3);
    expect(products[0].id).toBe("early-cancer-detection");
    expect(products[0].name).toBe("Early Cancer Detection Test");
    expect(products[0].price).toBe(99900);
  });

  it("returns products with all required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const products = await caller.products.list();
    for (const product of products) {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("stripePriceId");
      expect(product).toHaveProperty("category");
    }
  });
});

describe("stripe.createCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a Stripe checkout URL for valid product selections", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stripe.createCheckoutSession({
      selectedProductIds: ["early-cancer-detection", "biological-age-test"],
      origin: "https://example.com",
    });
    expect(result.checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  it("throws when no product IDs are provided", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.stripe.createCheckoutSession({
        selectedProductIds: [],
        origin: "https://example.com",
      })
    ).rejects.toThrow();
  });

  it("throws when selected product IDs don't match any catalog products", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.stripe.createCheckoutSession({
        selectedProductIds: ["non-existent-product"],
        origin: "https://example.com",
      })
    ).rejects.toThrow("No valid products found");
  });

  it("throws a helpful error when placeholder Price IDs are still in use", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.stripe.createCheckoutSession({
        selectedProductIds: ["placeholder-product"],
        origin: "https://example.com",
      })
    ).rejects.toThrow(/placeholder/i);
  });

  it("throws when origin is not a valid URL", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.stripe.createCheckoutSession({
        selectedProductIds: ["early-cancer-detection"],
        origin: "not-a-url",
      })
    ).rejects.toThrow();
  });
});
