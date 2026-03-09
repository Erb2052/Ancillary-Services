import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllLocations,
  getActiveLocations,
  getLocationBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLocationProducts,
  getEnabledProductsForLocation,
  assignProductToLocation,
  toggleLocationProduct,
  removeProductFromLocation,
  getAssignedProductIds,
} from "./db";
import { createCheckoutSession } from "./stripe";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Locations (public — patient-facing) ─────────────────────────────────
  locations: router({
    /** List all active locations for the patient location selector */
    listActive: publicProcedure.query(async () => {
      return getActiveLocations();
    }),

    /** Get products available at a specific location (by location ID) */
    getProducts: publicProcedure
      .input(z.object({ locationId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getEnabledProductsForLocation(input.locationId);
      }),
  }),

  // ─── Admin — Locations ───────────────────────────────────────────────────
  adminLocations: router({
    list: adminProcedure.query(async () => {
      return getAllLocations();
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(128),
          city: z.string().max(64).optional(),
          state: z.string().max(64).optional(),
          slug: z
            .string()
            .min(1)
            .max(64)
            .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return createLocation(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(1).max(128).optional(),
          city: z.string().max(64).optional(),
          state: z.string().max(64).optional(),
          slug: z
            .string()
            .min(1)
            .max(64)
            .regex(/^[a-z0-9-]+$/)
            .optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateLocation(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteLocation(input.id);
        return { success: true };
      }),

    /** Get all products assigned to a location with their enabled status */
    getLocationProducts: adminProcedure
      .input(z.object({ locationId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getLocationProducts(input.locationId);
      }),

    /** Assign an existing product to a location */
    assignProduct: adminProcedure
      .input(
        z.object({
          locationId: z.number().int().positive(),
          productId: z.number().int().positive(),
          sortOrder: z.number().int().default(0),
        })
      )
      .mutation(async ({ input }) => {
        await assignProductToLocation(input.locationId, input.productId, input.sortOrder);
        return { success: true };
      }),

    /** Toggle a product on/off for a location */
    toggleProduct: adminProcedure
      .input(
        z.object({
          locationProductId: z.number().int().positive(),
          isEnabled: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        await toggleLocationProduct(input.locationProductId, input.isEnabled);
        return { success: true };
      }),

    /** Remove a product assignment from a location */
    removeProduct: adminProcedure
      .input(z.object({ locationProductId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await removeProductFromLocation(input.locationProductId);
        return { success: true };
      }),

    /** Get product IDs already assigned to a location (for the assign modal) */
    getAssignedProductIds: adminProcedure
      .input(z.object({ locationId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getAssignedProductIds(input.locationId);
      }),
  }),

  // ─── Admin — Products (master catalog) ───────────────────────────────────
  adminProducts: router({
    list: adminProcedure.query(async () => {
      return getAllProducts();
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(256),
          description: z.string().max(512).optional(),
          details: z.string().optional(),
          price: z.number().int().min(0),
          category: z.string().max(64).optional(),
          lucideIcon: z.string().max(64).default("FlaskConical"),
          stripePriceId: z.string().min(1).max(128),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        return createProduct(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(1).max(256).optional(),
          description: z.string().max(512).optional(),
          details: z.string().optional(),
          price: z.number().int().min(0).optional(),
          category: z.string().max(64).optional(),
          lucideIcon: z.string().max(64).optional(),
          stripePriceId: z.string().min(1).max(128).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateProduct(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ─── Stripe Checkout ─────────────────────────────────────────────────────
  stripe: router({
    /**
     * Create a Stripe Checkout Session for selected products.
     * productIds: array of product IDs from the database.
     * origin: the frontend origin URL (e.g. https://yoursite.com) for redirect URLs.
     */
    createCheckoutSession: publicProcedure
      .input(
        z.object({
          productIds: z.array(z.number().int().positive()).min(1),
          origin: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        // Fetch the selected products from the DB to get their stripePriceIds
        const allProducts = await getAllProducts();
        const selected = allProducts.filter((p) => input.productIds.includes(p.id));

        if (selected.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No valid products selected" });
        }

        // Check for placeholder Price IDs
        const hasPlaceholder = selected.some((p) => p.stripePriceId.startsWith("price_REPLACE_"));
        if (hasPlaceholder) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "One or more products have placeholder Stripe Price IDs. Please update them in the admin panel before accepting payments.",
          });
        }

        const lineItems = selected.map((p) => ({
          price: p.stripePriceId,
          quantity: 1,
        }));

        const session = await createCheckoutSession({
          lineItems,
          successUrl: `${input.origin}/success`,
          cancelUrl: `${input.origin}/cancel`,
        });

        return { url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
