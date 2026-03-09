# Health Add-On Services Funnel — TODO

- [x] Install Stripe npm package
- [x] Add STRIPE_SECRET_KEY placeholder (user to replace with real key)
- [x] Define all 10 health add-on products with names, descriptions, prices, and placeholder Stripe Price IDs in shared/products.ts
- [x] Build tRPC procedure: stripe.createCheckoutSession (creates Stripe Checkout with multiple line items)
- [x] Build tRPC procedure: stripe.getProducts (returns product catalog to frontend)
- [x] Build multi-step funnel UI (Step 1: Intro, Step 2: Product selection, Step 3: Cart review)
- [x] Product selection page with checkboxes and product cards
- [x] Cart summary page with selected items, prices, and total
- [x] Checkout button that calls backend and redirects to Stripe
- [x] Success page (/success) shown after Stripe payment completes
- [x] Cancel page (/cancel) shown when user cancels Stripe checkout
- [x] Responsive mobile-friendly layout across all pages
- [x] Clear placeholder markers and comments for Stripe secret key and price IDs
- [x] Write vitest tests for Stripe checkout session procedure (8 tests passing)
- [x] Save checkpoint
- [x] Replace emoji product icons with clean Lucide React icons in Fountain Life brand colors
