# Product Mix Reset — $15K Operating Model

**Prepared:** 2026-05-23
**Owner:** Anthony Ivy
**Budget greenlit:** $15K (vs $240K midpoint of the original sourcing plan in [04-sourcing-roadmap.md](./04-sourcing-roadmap.md))
**Supersedes capital figures in:** [04-sourcing-roadmap.md](./04-sourcing-roadmap.md) — the wave structure, vendor lists, and category logic still hold; only the capital model changes.

---

## The model in one paragraph

Most new SKUs run **pre-sell / made-to-order**: customer orders → we batch a vendor PO → vendor ships to us → we stage → we deliver. Earliest delivery is `vendor lead time + 1 day for transit`. The cart drawer and the checkout calendar both show the customer that minimum date before they pay. A small subset of the highest-confidence SKUs gets **test stock** at the Hyde Park hub for the standard 1-2 day delivery promise. **Run A Way Buckers stays on a Wednesday-only cycle** until volume justifies more frequent runs; orders containing RAB perishables roll up to the next Wednesday.

The $15K splits across (a) test stock for shelf-stable items where we're confident demand exists, (b) sample purchases so we have product photos and taste-tested SKUs before listing, and (c) a small reserve for shipping, packaging, and the first vendor POs we float on Prepaid terms.

This model **prefers vendors with low lead time, low MOQ, drop-ship capable, and net-15 or better payment terms.** The vendor onboarding form ([07-vendor-onboarding-form.md](./07-vendor-onboarding-form.md)) collects exactly that data.

---

## $15K spend split

| Bucket | Amount | Purpose |
|---|---|---|
| Wave E test stock — Black-owned personal care | **$6,000** | 3-5 SKUs at 1-2 cases each. Shelf-stable, multi-month turn, 100% Black-owned. Best fit for test-stock model. |
| Wave A pantry test stock | **$3,000** | Dry beans, white rice, cornmeal at 1 case each. Shelf-stable. |
| Wave A spices/condiments test stock | **$2,000** | 1-2 hot sauce SKUs + 1-2 seasoning blends at 1 case each. |
| Samples + photography budget | **$1,500** | Pay-for-samples for ~10 vendors, plus AI / phone product photography. |
| Packaging + shipping supplies | **$1,000** | Branded poly mailers, packing slips, ice packs for the few perishable pre-sells we ship. |
| Reserve for Prepaid-terms vendor POs | **$1,500** | Float for vendors who only accept Prepaid until we've earned Net-15. |
| **Total** | **$15,000** | |

**Out of scope at $15K:**
- All Wave A perishable produce stocking (collards, mustard greens, okra at MOQ). RAB stays the produce backbone.
- All Wave A fresh meat stocking. Soul-food cuts wait until cashflow allows.
- All Wave B (universal staples — dairy, bread, year-round produce).
- All Wave C (snacks, beverages).
- All Wave D (frozen, prepared).

These are not abandoned, they are sequenced behind the test-stock cycle that earns the cash for them.

---

## The 3-4 day perishable rule

For any cart that includes a perishable from a Midwest farmer-vendor (specifically RAB today, and any future regional produce/meat partners we onboard):

- **Customer-facing rule:** earliest selectable delivery date is `today + max(leadTimeDays in cart) + 1 day for transit`.
- **Operator-facing rule:** RAB delivers Wednesdays. Orders with RAB SKUs placed by Sunday 11:59pm CT go on that Wednesday's pull list. Orders placed Mon-Sat for RAB SKUs roll to the following Wednesday.
- **Enforcement:** The calendar in [`src/components/checkout/DeliveryScheduler.tsx`](../../src/components/checkout/DeliveryScheduler.tsx) honors `minDayOffset` derived from `max(item.leadTimeDays) + 1` across the cart. No code in checkout enforces the Wednesday-of-the-week alignment yet — that is operator follow-up if RAB volume grows.

**Migration path:** As order volume on RAB items grows, increase the RAB pull cadence to twice weekly (Wed + Sat). When that holds for 4 weeks, drop the `leadTimeDays` on the RAB SKUs from 3-4 to 1-2.

---

## The pre-sell workflow, end-to-end

For each SKU in the made-to-order pool, here is what happens:

1. **Vendor onboarding (one-time).** Vendor fills out the form ([07-vendor-onboarding-form.md](./07-vendor-onboarding-form.md)). We review, request sample if applicable, photograph product, set up SKU.
2. **SKU listed in Airtable Catalog.** Operator sets `Supplier` link, `LeadTimeDays` (defaults to the supplier's row value), `Active = true`. Website picks it up within 5 minutes (catalog cache).
3. **Customer browses the shop page.** Sees the "Ships in N days" badge on the card. Knows what they're committing to before they add to cart.
4. **Customer adds to cart.** Cart drawer shows a banner: "Earliest delivery: <date>." No surprises.
5. **Customer checks out.** The calendar disables every date earlier than `today + max(leadTimeDays) + 1`. Customer picks a valid date and a delivery window.
6. **Order succeeds.** Stripe payment intent confirms. Order confirmation email fires (Resend). Customer is in the system.
7. **Operator places the vendor PO.** For weekly-batched vendors, this happens at the end of each batching window. For on-demand vendors, this happens within the same business day.
8. **Vendor fulfills and ships.** Vendor either drop-ships direct to the customer (`DropShipCapable = true` AND `ColdChainRequired = false`) or ships to our Hyde Park hub.
9. **Hub stages and Metrobi delivers.** When Metrobi is wired (separate workstream), automated status updates keep the customer informed.

**Where this can break:**
- Vendor misses lead time. Fallback: operator manually contacts customer, offers refund or reschedule. Track these incidents on the vendor's row (free text in `ScaleCapacityNotes` or a follow-up field).
- Vendor goes out of stock. Catalog `Active = false` flip removes the SKU from the shop within 5 minutes. Customers in flight get manual outreach.
- MOQ doesn't fit one customer's order. Operator decides: (a) buy at MOQ, hold excess as test stock; (b) batch orders weekly to hit MOQ across multiple customers; (c) negotiate split MOQ with vendor.

---

## First 5 vendors to invite (form-first batch)

Prioritized for the $15K budget. Wave E personal care leads because it's the best operational fit (shelf-stable, multi-month turn, 100% Black-owned, light working capital).

| # | Vendor | Wave | City/State | Why first |
|---|---|---|---|---|
| 1 | Pearson Farms | A (spices) + Wave D (prepared) | Wichita, KS | Multi-category, known operator. Highest signal value from a single onboarding. |
| 2 | Dr. Nettles Beauty | E | Mobile, AL | Established Black skin care, Suppliers DB tagged Personal Care. Shelf-stable, drop-ship friendly. |
| 3 | Cutino Sauce Co. | A (hot sauce) | (not listed) | Branded hot sauce. Lower MOQ likely. Cultural fit for the soul-food story. |
| 4 | Bossville Farms | E | Estill, SC | Suppliers DB Personal Care tagged. Lets us test a second personal-care brand in parallel. |
| 5 | Eden Place Farms | A (pantry + produce later) | Chicago, IL | Chicago-local. Lets us test the regional pantry side without a national freight conversation. |

Send these five the form first. Watch how the form works in practice. Adjust copy or fields. Then expand to the next ~45 in the [07-vendor-onboarding-form.md distribution list](./07-vendor-onboarding-form.md#first-batch-50-invitations).

---

## What this model gives up

Three trade-offs the CEO should be honest about:

1. **The catalog stays narrow longer.** At $240K we'd have 50+ new SKUs live within 8 weeks. At $15K we'll have maybe 10-15 new SKUs live in 8 weeks. The "broader weekly trip" story in customer-facts.md is on hold until cashflow earns the inventory. **No new ad creative against a "weekly basket" promise yet.**
2. **Customer experience varies by SKU.** Some items ship in 1-2 days; some in 5-7. This is a CRO risk. We mitigate with the badge + cart banner + calendar enforcement, but it's a real friction. Watch Galileo for confusion patterns.
3. **Working capital cycle is tight.** If a vendor demands Prepaid and we have 5 customers waiting on their order, our $1.5K reserve covers maybe 1-2 vendor POs. Net-15 terms are critical. Vendors that won't budge on Prepaid should be deprioritized for the launch wave.

---

## What changed in the website code today (2026-05-23)

- [src/lib/catalog/types.ts](../../src/lib/catalog/types.ts) — `CatalogItem.leadTimeDays`, `PricedLine.leadTimeDays`
- [src/lib/catalog/airtable.ts](../../src/lib/catalog/airtable.ts) — reads `LeadTimeDays` field, defaults to 0
- [src/lib/cart-pricing.ts](../../src/lib/cart-pricing.ts) — threads `leadTimeDays` into priced cart lines
- [src/components/shop/CatalogGrid.tsx](../../src/components/shop/CatalogGrid.tsx) — "Ships in N days" badge when leadTimeDays > 1
- [src/components/cart/CartDrawer.tsx](../../src/components/cart/CartDrawer.tsx) — earliest-delivery banner
- [src/components/checkout/DeliveryScheduler.tsx](../../src/components/checkout/DeliveryScheduler.tsx) — `minDayOffset` prop disables dates before the cart's lead-time floor
- [src/components/checkout/CheckoutClient.tsx](../../src/components/checkout/CheckoutClient.tsx) — passes `max(leadTimeDays) + 1` to the scheduler

Airtable:
- Suppliers got 10 new fields: `LeadTimeDays`, `PaymentTerms`, `DropShipCapable`, `OrderBatchingCadence`, `SampleAvailable`, `WholesalePricingNotes`, `ColdChainRequired`, `ScaleCapacityNotes`, `BlackOwnedSelfAttested`, `OnboardingStatus`
- Catalog got `LeadTimeDays` (per-SKU override). Earlier: `Supplier` link, `BlackOwnedSupplier` checkbox.

**Manual Airtable work still needed (MCP can't do these):**
- Add Category single-select options on Catalog: Vegetables, Fruit, Meat & Seafood, Dairy, Eggs, Bakery, Spices & Condiments, Snacks, Beverages, Frozen Foods, Prepared Foods, Personal Care, Hair Care.
- Add Unit single-select options on Catalog: jar, bottle, gallon, half_gallon, loaf, bag, can, box, tub, bar, tube.
- Build the Form view on Suppliers per [07-vendor-onboarding-form.md](./07-vendor-onboarding-form.md).
