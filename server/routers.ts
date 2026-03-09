import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { HEALTH_PRODUCTS } from "../shared/products";
import { createCheckoutSession } from "./stripe";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /**
   * Product catalog — returns all 10 health add-on services.
   * Public procedure: no authentication required.
   */
  products: router({
    list: publicProcedure.query(() => {
      return HEALTH_PRODUCTS;
    }),
  }),

  /**
   * Stripe checkout — creates a Stripe Checkout Session with all selected products.
   *
   * ⚠️  REQUIRES: STRIPE_SECRET_KEY environment variable to be set.
   *     See server/stripe.ts for setup instructions.
   *
   * ⚠️  REQUIRES: Each product's stripePriceId in shared/products.ts must be
   *     replaced with your real Stripe Price IDs from the Stripe Dashboard.
   */
  stripe: router({
    createCheckoutSession: publicProcedure
      .input(
        z.object({
          /**
           * Array of product IDs the user has selected.
           * These must match the `id` field in shared/products.ts.
           */
          selectedProductIds: z
            .array(z.string())
            .min(1, "Please select at least one product"),
          /** The frontend origin (e.g. https://yoursite.com) used to build redirect URLs */
          origin: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        const { selectedProductIds, origin } = input;

        // Look up the selected products from the catalog
        const selectedProducts = HEALTH_PRODUCTS.filter((p) =>
          selectedProductIds.includes(p.id)
        );

        if (selectedProducts.length === 0) {
          throw new Error("No valid products found for the selected IDs.");
        }

        // Check for placeholder Price IDs — warn in dev, block in prod
        const placeholderProducts = selectedProducts.filter((p) =>
          p.stripePriceId.startsWith("price_REPLACE_")
        );
        if (placeholderProducts.length > 0) {
          const names = placeholderProducts.map((p) => p.name).join(", ");
          throw new Error(
            `⚠️  Stripe Price IDs are still placeholders for: ${names}. ` +
              `Please update stripePriceId values in shared/products.ts with your real Stripe Price IDs.`
          );
        }

        // Build line items for Stripe Checkout
        const lineItems = selectedProducts.map((product) => ({
          stripePriceId: product.stripePriceId,
          quantity: 1,
        }));

        // Build success and cancel redirect URLs
        const successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/cancel`;

        const checkoutUrl = await createCheckoutSession(
          lineItems,
          successUrl,
          cancelUrl
        );

        return { checkoutUrl };
      }),
  }),
});

export type AppRouter = typeof appRouter;
