/**
 * Tests for the location-aware, DB-driven tRPC procedures.
 *
 * All DB helpers and the Stripe API are mocked so no real credentials
 * or database connection is required to run these tests.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getAllLocations: vi.fn(),
  getActiveLocations: vi.fn(),
  getLocationBySlug: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
  getAllProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getLocationProducts: vi.fn(),
  getEnabledProductsForLocation: vi.fn(),
  assignProductToLocation: vi.fn(),
  toggleLocationProduct: vi.fn(),
  removeProductFromLocation: vi.fn(),
  getAssignedProductIds: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// ─── Mock Stripe helper ───────────────────────────────────────────────────────
vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/pay/mock_session_123",
    id: "cs_test_mock",
  }),
}));

import * as db from "./db";
import * as stripeHelper from "./stripe";

// ─── Context factories ────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1, openId: "admin-user", email: "admin@fountainlife.com",
      name: "Admin User", loginMethod: "manus", role: "admin",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2, openId: "regular-user", email: "user@example.com",
      name: "Regular User", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Sample data ──────────────────────────────────────────────────────────────
const sampleProduct = {
  id: 1, name: "Early Cancer Detection Test",
  description: "Advanced multi-cancer screening", details: null,
  price: 99900, category: "Cancer Screening", lucideIcon: "ScanLine",
  stripePriceId: "price_real_123", isActive: true,
  createdAt: new Date(), updatedAt: new Date(),
};

const placeholderProduct = {
  ...sampleProduct, id: 2, name: "Placeholder Product",
  stripePriceId: "price_REPLACE_PLACEHOLDER",
};

const sampleLocation = {
  id: 1, name: "Fountain Life Orlando", city: "Orlando", state: "FL",
  slug: "orlando", isActive: true, createdAt: new Date(), updatedAt: new Date(),
};

// ─── locations.listActive ─────────────────────────────────────────────────────
describe("locations.listActive", () => {
  it("returns active locations for public users", async () => {
    vi.mocked(db.getActiveLocations).mockResolvedValue([sampleLocation]);
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.locations.listActive();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Fountain Life Orlando");
  });

  it("returns empty array when no locations exist", async () => {
    vi.mocked(db.getActiveLocations).mockResolvedValue([]);
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.locations.listActive();
    expect(result).toHaveLength(0);
  });
});

// ─── locations.getProducts ────────────────────────────────────────────────────
describe("locations.getProducts", () => {
  it("returns enabled products for a given location", async () => {
    vi.mocked(db.getEnabledProductsForLocation).mockResolvedValue([sampleProduct]);
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.locations.getProducts({ locationId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Early Cancer Detection Test");
  });

  it("rejects invalid locationId", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.locations.getProducts({ locationId: -1 })).rejects.toThrow();
  });
});

// ─── adminLocations — access control ─────────────────────────────────────────
describe("adminLocations — access control", () => {
  it("blocks unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.adminLocations.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("blocks non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.adminLocations.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admin users to list locations", async () => {
    vi.mocked(db.getAllLocations).mockResolvedValue([sampleLocation]);
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.adminLocations.list();
    expect(result).toHaveLength(1);
  });
});

// ─── adminLocations.create ────────────────────────────────────────────────────
describe("adminLocations.create", () => {
  it("creates a location as admin", async () => {
    vi.mocked(db.createLocation).mockResolvedValue(sampleLocation);
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.adminLocations.create({
      name: "Fountain Life Orlando", city: "Orlando", state: "FL", slug: "orlando",
    });
    expect(result?.name).toBe("Fountain Life Orlando");
    expect(db.createLocation).toHaveBeenCalledOnce();
  });

  it("rejects invalid slug characters", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(caller.adminLocations.create({
      name: "Bad Location", slug: "Bad Slug!",
    })).rejects.toThrow();
  });
});

// ─── adminProducts — access control ──────────────────────────────────────────
describe("adminProducts — access control", () => {
  it("blocks non-admin from creating products", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.adminProducts.create({
      name: "Test", price: 9900, stripePriceId: "price_abc",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ─── stripe.createCheckoutSession ────────────────────────────────────────────
describe("stripe.createCheckoutSession", () => {
  beforeEach(() => {
    vi.mocked(db.getAllProducts).mockResolvedValue([sampleProduct]);
  });

  it("creates a checkout session and returns a URL", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.stripe.createCheckoutSession({
      productIds: [1],
      origin: "https://example.com",
    });
    expect(result.url).toBe("https://checkout.stripe.com/pay/mock_session_123");
    expect(stripeHelper.createCheckoutSession).toHaveBeenCalledWith({
      lineItems: [{ price: "price_real_123", quantity: 1 }],
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });
  });

  it("throws BAD_REQUEST when no valid products are found", async () => {
    vi.mocked(db.getAllProducts).mockResolvedValue([]);
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.stripe.createCheckoutSession({
      productIds: [999],
      origin: "https://example.com",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST when a product has a placeholder Price ID", async () => {
    vi.mocked(db.getAllProducts).mockResolvedValue([placeholderProduct]);
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.stripe.createCheckoutSession({
      productIds: [2],
      origin: "https://example.com",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an empty productIds array", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.stripe.createCheckoutSession({
      productIds: [],
      origin: "https://example.com",
    })).rejects.toThrow();
  });

  it("rejects an invalid origin URL", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.stripe.createCheckoutSession({
      productIds: [1],
      origin: "not-a-valid-url",
    })).rejects.toThrow();
  });
});
