# Code changes and relaunch plan, Phases 5 + 6 of product mix reset

**Prepared:** 2026-05-16
**Inputs:** [01-airtable-health-report.md](01-airtable-health-report.md), [02-consumption-research.md](02-consumption-research.md), [03-product-mix-recommendation.md](03-product-mix-recommendation.md), [04-sourcing-roadmap.md](04-sourcing-roadmap.md)
**Reader:** CEO Anthony Ivy, CTO
**Plan reference:** `C:\Users\Anthony\.claude\plans\i-realize-that-our-mellow-pnueli.md`

## TL;DR

**Phase 5 is a small batch of changes, NOT shipped today.** Each change is staged to land the day before its corresponding sourcing Wave lands SKUs in the Catalog table. Shipping code without inventory backing it surfaces empty category rails to the customer; shipping inventory without code keeps the new SKUs invisible. The two have to land together.

**Phase 6 is a checklist, not a code change.** The relaunch gate is operational, not technical: at least one new Wave live, at least 10 well-merchandised SKUs, LogRocket evidence of organic engagement, refreshed ad creative, refreshed landing pages, fresh board sign-off because the offer changed materially.

## Phase 5: code changes, staged

### 5.0 Pre-Wave-A (immediate, can ship now)

This batch has zero customer impact and can ship today.

**a. Airtable schema:** Add a `Black-owned` boolean field to the Suppliers table in base `appm6F6H9obydzAM2`. Owner: CTO or operator with Airtable schema access. Five-minute job. Populated during Phase 4 outreach. CEO-confirmed 2026-05-17 that this badge surfaces on the site for every qualifying SKU. No code change in the repo for the schema add itself; UI wiring comes in 5.2 / 5.3a.

**b. Update `customer-facts.md` reality-check section** (the source of truth other agents read). Add a note in the "Reality check" block explaining that:
- Catalog is currently 47 SKUs, narrow assortment.
- Product mix reset is in motion; expansion lands in waves over the next 8-14 weeks.
- Ad pause is in effect; do not draft new paid creative against the old assortment.

No type or Airtable schema change required for this; it is a docs update.

**c. Pin the Customer Acquisition / Ads agent off paid relaunch.** Update any Paperclip agent `AGENTS.md` that mentions paid spend to explicitly say "no paid relaunch without CEO sign-off; product mix reset in progress, reference UNC-1133." Owner: CTO.

### 5.1 Pre-Wave-A code stub (ship 1-2 days before Wave A SKUs land)

Goal: prepare the type system to accept new categories so that when Wave A SKUs land in Airtable they render without code dependency in the deployment loop.

**Files to modify:**

- [src/lib/catalog/types.ts](src/lib/catalog/types.ts), expand `CatalogCategory` union to add Wave A categories. Recommended starting set:

  ```ts
  export type CatalogCategory =
    | "Greens"
    | "Roots"
    | "Pantry"
    | "Protein"
    | "Microgreens"
    | "Meat & Seafood"
    | "Spices & Condiments";
  ```

  Why only these two: Wave A introduces smoked turkey neck, ham hock, oxtail, catfish (which logically fit a `Meat & Seafood` category distinct from the existing `Protein`), and hot sauce, seasoning blends, which fit `Spices & Condiments`. Black-eyed peas, white rice, and cornmeal fit the existing `Pantry`. Collard greens, okra, and additional sweet potato SKUs fit existing `Greens` and `Roots`.

  **Decision required:** keep `Protein` as a separate category from `Meat & Seafood`, or collapse them. Recommend keep separate for now because `Protein` is currently used for the operator's whole-animal cuts (pastured chicken, beef short rib, lamb chops, eggs) and `Meat & Seafood` will be used for further-processed and value-added items (smoked, fish fillet, ground). Customer-facing collapsed display can be done at the shop UI layer.

- [src/lib/catalog/airtable.ts](src/lib/catalog/airtable.ts), expand `VALID_CATEGORIES` to match the new type union.

- [src/lib/catalog/airtable.ts](src/lib/catalog/airtable.ts), expand `VALID_UNITS` to add likely new units: `gallon`, `bag`, `jar`, `bottle`, `loaf` (the last two for Wave B). For Wave A specifically: `jar`, `bottle`.

- **Airtable `Catalog` table single-select Category options** must mirror the type union, otherwise new rows added with the new category will be silently dropped by `mapRecord`. Add via Airtable UI:

  ```
  Meat & Seafood
  Spices & Condiments
  ```

- **No homepage or shop UI change yet.** The new categories will render under the existing Shop page once Wave A SKUs are added with the matching Category value. SortOrder field on each new SKU controls placement.

Verification: run `npx tsc --noEmit` after the type expand to confirm no compile errors propagate to consumers of `CatalogCategory`.

### 5.2 Pre-Wave-B (when Wave B SKUs are ready, target Week 4-6)

Add the universal-staple categories that need their own type entries. Recommended additions to `CatalogCategory`:

```ts
  | "Fruit"            // bananas, apples, berries, citrus
  | "Vegetables"       // tomatoes, onions, cucumber, peppers (distinct from Greens/Roots)
  | "Dairy"            // milk, cheese, yogurt, butter
  | "Eggs"             // standalone, eggs are not protein in shopper mental model
  | "Bakery"           // bread, pasta dry, cereal alt
```

Same `VALID_CATEGORIES`, `VALID_UNITS` expand. New units likely needed: `gallon`, `half_gallon`, `loaf`, `bag`, `can`, `box`, `tub`.

**Homepage `Index.tsx` and `customer-facts.md` update:** rewrite the hero copy from "Fresh produce, pantry, and protein" to something that reflects the broader weekly-trip offer. Suggested working line (CEO has final say):

> "Cleaner than Whole Foods. Cheaper than Aldi. Black-farmed staples plus the weekly basics, delivered every day in Chicago."

Update `customer-facts.md` *first* (single source of truth for other agents), then update `src/page-content/Index.tsx`.

**Shop page category navigation:** [src/app/shop/page.tsx](src/app/shop/page.tsx) likely renders categories from the Catalog itself, so no hard-coded list to update. Verify during the Wave B ship that empty categories (zero active SKUs) are hidden or labeled "Coming soon" rather than rendering as bare empty rails.

### 5.3 Pre-Wave-C (Week 6-8)

Add `CatalogCategory` entries:

```ts
  | "Snacks"
  | "Beverages"
```

Skip mass soda categories per Phase 3 recommendation; the `Beverages` category will hold fresh-pressed juice, sparkling water, etc.

### 5.3a Pre-Wave-E, Black-owned personal care (Week 6-10, parallel to Wave C)

Added 2026-05-17 per CEO decision.

Add `CatalogCategory` entries:

```ts
  | "Personal Care"
  | "Hair Care"
```

Decision needed: split `Personal Care` and `Hair Care` into two categories, or fold both under `Personal Care` with a Subcategory display? Recommend split because hair care has a distinct shopper journey (the customer searching for batana oil isn't browsing soap), and Subcategory is not currently a first-class type.

`VALID_UNITS` likely additions for Wave E: `bottle`, `jar`, `bar` (soap bar), `tube`.

**Black-owned badge wire-up:** This is the most important Phase 5 deliverable for Wave E. Implementation outline:

1. Airtable: Suppliers table gets a `Black-owned` boolean field (already noted in 5.0a).
2. Catalog table gets a new `SupplierId` field linking each SKU to a Suppliers row. Required for the badge to resolve from SKU to supplier.
3. [src/lib/catalog/types.ts](src/lib/catalog/types.ts), add `blackOwnedSupplier: boolean` to `CatalogItem`.
4. [src/lib/catalog/airtable.ts](src/lib/catalog/airtable.ts), `mapRecord` resolves the link and populates the field.
5. Add a small badge component, rendered on Shop card, Cart drawer line item, SKU detail page. Visual: small icon + "Black-owned supplier" label. Honest, not flashy.

This badge work is needed for Wave B's bananas-with-honesty story as much as for Wave E. Ship the badge with the Wave B code drop, then Wave E inherits it.

### 5.4 Pre-Wave-D (Week 10-14)

Add:

```ts
  | "Frozen Foods"
  | "Prepared Foods"  // heat-and-serve, distinct from restaurant prepared
```

`TaxCategory` already has `prepared` for items that legally count as prepared food; this is already wired in [src/lib/cart-pricing.ts](src/lib/cart-pricing.ts). Verify on the first prepared SKU.

**Cold-chain ops note:** the existing pastured-chicken + beef-short-rib cold chain is sufficient for Wave A. Wave D frozen requires either (a) a frozen-only delivery route, (b) a separately-insulated freezer pack in the existing delivery van, or (c) a third-party frozen logistics partner. Code-wise, no change; ops-wise, escalate to COO.

## Phase 6: relaunch checklist

Trigger to un-pause Meta + Google paid ads. Each box must be checked before the un-pause; CEO sign-off on the final memo.

### 6.1 Inventory readiness

- [ ] Wave A is live with all 11 Tier-1 SKUs in the Catalog table and `Active = true`.
- [ ] Each new SKU has a real photo (not placeholder), accurate price, accurate availableQty.
- [ ] Each new SKU passes the Wave A LogRocket session quality check (no broken images on mobile in-app browser, scroll depth into the Wave A rail confirmed).
- [ ] Wave B is **at least** 10 SKUs live with the same quality bar, OR the CEO has explicitly accepted relaunching against Wave-A-only.

### 6.2 Funnel readiness

- [ ] LogRocket session review for the past 5 organic days shows new-category interaction (add-to-cart events on Wave A heroes).
- [ ] Galileo daily briefing has not flagged a new frustration pattern caused by the broader assortment (e.g. category nav confusion, broken filter).
- [ ] [src/components/checkout/CheckoutClient.tsx](src/components/checkout/CheckoutClient.tsx) still handles mixed-category carts cleanly (no produce-only assumptions in pricing or fulfillment). Smoke-test a cart that mixes Greens + Meat & Seafood + Spices.
- [ ] Cart minimum threshold reviewed. Current `$30` or whatever the active minimum is may need adjustment to account for the higher AOV implied by a real weekly basket.

### 6.3 Creative readiness

- [ ] Advertising Creative has at least 3 new ad creative variants per platform (Meta, Google) that lead with the broader assortment, not produce.
- [ ] Landing pages that match the ad promise are live. No "produce delivery" landers behind a "soul-food basket" ad.
- [ ] Updated `customer-facts.md` and ad copy align. No retired claims from old promo cycles slipping in.

### 6.4 Governance

- [ ] CFO Jua and CRO reviewed the relaunch budget and confirmed it fits inside the previously-approved Meta and Google budgets. If budget is increasing, file a `request_board_approval` per the standing order (net-new spend rule).
- [ ] Even if budget is not increasing, **loop the board explicitly** for un-pause sign-off. The offering changed materially; this is not a routine campaign restart. Recommendation: a 1-pager memo posted in Paperclip linked from UNC-1133, before the un-pause API calls.
- [ ] Suppression list ([src/lib/email/suppression.ts](src/lib/email/suppression.ts) and [src/trigger/_email-suppression.ts](src/trigger/_email-suppression.ts)) checked. No new internal emails that should be filtered.

### 6.5 The un-pause itself

- [ ] Meta: PATCH `status=ACTIVE` on the 4 paused campaigns (or create new campaigns with new creative if the old ones don't fit). Verify via Graph API `/campaigns?fields=effective_status` post-un-pause.
- [ ] Google Ads: GAQL `UPDATE campaign SET status = ENABLED` on the 2 paused campaigns (or create new with new creative). Verify via search query post-un-pause.
- [ ] Update UNC-1133 with a completion comment quoting the un-pause spend baseline and the relaunch decision.
- [ ] Schedule a Day-7 review: did paid spend produce CVR > 1% (vs pre-pause 0.46% per [[ux-cro-consultants-2026-05-11]])? If not, pause again and investigate; the bottleneck is not the assortment.

### 6.6 Out of scope for relaunch

These are explicitly **not** required for relaunch:

- Wave C and Wave D do not have to be live for relaunch. They follow.
- Non-food (personal care, cleaning) does not have to be live for relaunch.
- Subscription Launch stays paused per [project_paid_ads_paused_2026-05-09](C:\Users\Anthony\.claude\projects\c--Users-Anthony-Desktop-um-website\memory\project_paid_ads_paused_2026-05-09.md). The painted-door EXP-002 test result drives that decision separately.

## Critical files quick-reference

For the next operator picking this up:

- [src/lib/catalog/types.ts](c:\Users\Anthony\Desktop\um_website\src\lib\catalog\types.ts), Type union for categories and units
- [src/lib/catalog/airtable.ts](c:\Users\Anthony\Desktop\um_website\src\lib\catalog\airtable.ts), `VALID_CATEGORIES` and `VALID_UNITS` whitelists, Airtable fetch + mapRecord
- [src/page-content/Index.tsx](c:\Users\Anthony\Desktop\um_website\src\page-content\Index.tsx), Homepage hero
- [src/app/shop/page.tsx](c:\Users\Anthony\Desktop\um_website\src\app\shop\page.tsx), Shop page (verify it doesn't hard-code category list)
- [customer-facts.md](c:\Users\Anthony\Desktop\um_website\customer-facts.md), Single source of truth for cross-agent copy
- [src/components/checkout/CheckoutClient.tsx](c:\Users\Anthony\Desktop\um_website\src\components\checkout\CheckoutClient.tsx), Cart + checkout (smoke-test mixed-category)
- Airtable base `appm6F6H9obydzAM2`, table `Catalog` (catalog SKUs) and table `Suppliers` (1,320 vendors)
- Paperclip issue UNC-1133, audit trail for the pause and un-pause

## Final note to the CEO

The full reset, from today through relaunch, is 8-14 weeks. The Phase 0 ad-pause stopped the bleed at $439/wk; that buys 70+ weeks of runway to do the offer right.

**CEO decisions locked 2026-05-17:**

- Wave B sells wholesale-distributed staples alongside Black-farmed specialty, with per-SKU "Black-owned" badge transparency.
- Specialty SKUs demoted off homepage, kept in a Specialty rail.
- Wave E added: Black-owned personal care (soaps, oils, batana hair oil, skin care, hair care). 100% Black-owned by brand thesis.
- Numerator paid pull deferred (no budget).
- Outreach is joint: Anthony + Zoe + Claude.

Next operator pickup: start Phase 4 outreach with the Wave A regional produce vendors (19 names listed in [04-sourcing-roadmap.md](04-sourcing-roadmap.md) section 1a). Parallel: ship the Airtable schema additions (Suppliers `Black-owned` field, Catalog `SupplierId` field) so the badge can resolve as Wave A SKUs land.
