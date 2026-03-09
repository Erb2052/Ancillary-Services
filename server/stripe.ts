/**
 * ============================================================
 *  STRIPE INTEGRATION — SERVER-SIDE HELPER
 * ============================================================
 *
 *  ⚠️  STEP 1 — SET YOUR STRIPE SECRET KEY:
 *  ------------------------------------------
 *  This file reads STRIPE_SECRET_KEY from your environment.
 *
 *  To configure it:
 *    1. In the Manus project settings → Secrets, add:
 *         Key:   STRIPE_SECRET_KEY
 *         Value: sk_test_XXXXXXXXXXXX   (your test key)
 *                OR
 *                sk_live_XXXXXXXXXXXX   (your live key)
 *
 *    2. Your Stripe Secret Key is found at:
 *         https://dashboard.stripe.com/apikeys
 *         → "Secret key" (click "Reveal test key")
 *
 *  HIPAA NOTE: The secret key is stored as a server-side environment
 *  variable and is NEVER exposed to the browser or frontend code.
 * ============================================================
 */

import Stripe from "stripe";

// ⚠️  REPLACE THIS PLACEHOLDER with your real Stripe Secret Key.
// Set STRIPE_SECRET_KEY in your environment/secrets manager.
// DO NOT hardcode your real key here — use the environment variable.
const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ||
  "sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY"; // ← PLACEHOLDER

if (STRIPE_SECRET_KEY === "sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY") {
  console.warn(
    "\n⚠️  [Stripe] WARNING: Using placeholder Stripe secret key.\n" +
      "   Checkout sessions will NOT work until you set STRIPE_SECRET_KEY.\n" +
      "   Add it to your environment secrets (Manus Settings → Secrets).\n"
  );
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

export interface CheckoutSessionInput {
  lineItems: Array<{ price: string; quantity: number }>;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout Session with multiple line items.
 * Returns the full Stripe session object (use .url for redirect).
 */
export async function createCheckoutSession(input: CheckoutSessionInput) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: input.lineItems,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    billing_address_collection: "auto",
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session;
}
