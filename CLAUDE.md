# Claude Code Guide — Health Add-On Services Funnel

This file helps Claude Code understand the project structure and the two things you need to configure before the app is live.

---

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + Express + tRPC 11
- **Payments:** Stripe Checkout (server-side session creation)
- **Database:** MySQL / TiDB via Drizzle ORM
- **Testing:** Vitest (8 tests, all passing)

---

## ⚠️ Two Files to Update Before Going Live

### 1. `server/stripe.ts` — Your Stripe Secret Key

Find this block and replace the placeholder:

```ts
const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ||
  "sk_test_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY"; // ← REPLACE THIS
```

**Best practice:** Set `STRIPE_SECRET_KEY` as an environment variable in your hosting platform rather than hardcoding it.

---

### 2. `shared/products.ts` — Your 10 Stripe Price IDs

Each product has a `stripePriceId` field. Replace every `price_REPLACE_*` value:

```ts
stripePriceId: "price_REPLACE_EARLY_CANCER_DETECTION"  // → your real price_xxx
stripePriceId: "price_REPLACE_ENVIRONMENTAL_TOXIN"     // → your real price_xxx
// ... (10 total, one per product)
```

You can also update `name`, `description`, `price` (display only, in cents), and `lucideIcon` (any name from https://lucide.dev/icons/) for each product.

---

## Key Files

| File | Purpose |
|---|---|
| `shared/products.ts` | All 10 product definitions + Stripe Price ID placeholders |
| `server/stripe.ts` | Stripe client init + checkout session creation |
| `server/routers.ts` | tRPC procedures: `products.list` and `stripe.createCheckoutSession` |
| `client/src/pages/Home.tsx` | 3-step funnel UI (Overview → Select → Cart) |
| `client/src/pages/Success.tsx` | Post-payment success page |
| `client/src/pages/Cancel.tsx` | Checkout cancelled page |
| `client/src/index.css` | Fountain Life brand CSS variables |

---

## Dev Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server (http://localhost:3000)
pnpm test          # Run all tests
pnpm build         # Production build
pnpm db:push       # Push schema changes to database
```

---

## Stripe Checkout Flow

1. User selects products on Step 2 and clicks "Proceed to Secure Checkout"
2. Frontend calls `trpc.stripe.createCheckoutSession` with selected product IDs
3. Backend creates a Stripe Checkout Session with all selected products as line items
4. User is redirected to Stripe's hosted checkout page
5. On success → redirected to `/success`; on cancel → redirected to `/cancel`
