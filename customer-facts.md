# Customer-Facing Facts — Uncle May's Produce

> **This is the single source of truth for everything a customer can see.**
> Website, emails, ads, Mailchimp campaigns, and agent-generated copy must match this doc.
> If any of these facts change, update this file FIRST, then propagate to every surface.

**Last updated:** 2026-05-03 (catalog launch + right-sized portions)
**Owner:** Anthony Ivy

---

## Sourcing

Produce is supplied by our farmer partner **Run A Way Buckers Club (Pembroke, IL)**. Everything we ship is drawn from their weekly produce list: salad mix, kale, candy orange carrots, sweet potatoes, potatoes, broccoli, organic dry beans (black, pinto, kidney), pea shoots, and radishes. Proteins (whole pastured chicken thighs, grass-fed beef short ribs, lamb chops) come from the same partner.

**Do not claim** the box contains eggs, tomatoes, cucumbers, snap peas, strawberries, zucchini, beets, spring onions, rainbow chard, microgreens, collards, shishito peppers, eggplant, turnips, or any other produce not on RAB's current list. Adding those back requires onboarding a second supplier first.

---

## Delivery

| Fact | Value |
|------|-------|
| Delivery day | **Wednesday, every week** |
| Delivery window | **Wednesday 5pm–8pm CT** (after-work, so someone is home to receive) |
| Order cutoff | **Sunday 11:59 PM CT** — orders placed after cutoff ship the following Wednesday |
| Service area | **Chicagoland metro south** — south Chicago city ZIPs (606xx) plus south-suburban cluster (Calumet City, Dolton, Harvey, Markham, Hazel Crest, Homewood, Flossmoor, Lansing, South Holland, Matteson, Olympia Fields, Richton Park, Posen, Blue Island, Riverdale, Chicago Heights). Authoritative ZIP list: [`src/lib/service-area.ts`](./src/lib/service-area.ts). |
| Delivery fee | Free |
| Missed delivery policy | 100% freshness guarantee — full refund, no questions asked |

---

## Pricing — ONE AUTHORITATIVE TABLE

**Build-your-own catalog. No fixed boxes. $25 minimum cart. The customer adds individual items at right-sized portions and checks out one-time.**

Live SKU-by-SKU pricing is in Airtable (base `appm6F6H9obydzAM2`, table `Catalog`) and rendered live at `/shop`. The full per-SKU sizing rationale is in [`notes/catalog-right-sizing-2026-05-03.md`](./notes/catalog-right-sizing-2026-05-03.md). Headline anchors customers see:

| Category | Anchor item | Price | Portion |
|---|---|---|---|
| Greens | Asparagus | $2.50 | 1/4 lb (handful) |
| Greens | Tuscan kale, chard | $3.00 | 0.3 lb |
| Greens | Romaine, summer crisp | $3.00 | 5 oz head |
| Roots | Candy carrots | $1.50 | 0.5 lb |
| Roots | Sweet potato | $2.50 | 1 potato (~0.5 lb) |
| Microgreens | Pea shoots, purple radish | $5.00 | 1 oz clamshell |
| Pantry | Beans (1 lb) | $6.00–$6.65 | 1 lb bag |
| Pantry | Black turtle beans (sampler) | $3.50 | 1/2 lb bag |
| Protein | Lamb chops | $10.00 | 0.5 lb (pair) |
| Protein | Whole chicken (estimated) | $32.00 | ~4–5 lb bird |
| Protein | Beef short ribs (bone-in / boneless) | $8.50 / $12.50 | 1 lb pack |
| Protein | Farm-fresh eggs | $5.99 | dozen |

Typical first-time cart lands $30–$60 (produce + one protein). No upper limit.

### Rules

- **Build-your-own catalog only.** No fixed Spring Box / Full Harvest Box / Community Box. No subscription tier.
- **$25 minimum** cart. Customers under $25 see a "add a few more items to reach $25" gate at the cart drawer; checkout is blocked.
- **`FRESH10`** is the primary promo code: $10 off the first order ($25 minimum). Customer enters it in the cart drawer or on the checkout page; we do **not** auto-apply it from `?promo=` URL params anymore.
- **`FRESH30`** is the social-ask promo on `/ask` (35% off, capped). Both codes can coexist; they are separate Stripe coupons in `src/lib/promo.ts`.
- Customer-facing display rule: portion size is shown in the unit label on every catalog card (e.g. "$2.50 / 1/4 lb"). The customer-facing visual is the AI-generated portion photo at `/catalog/{sku}.jpg`.
- Doina has a **grandfathered $55/wk subscription** through Stripe directly. She is the only active subscription customer; we are not signing up new subscriptions until further notice.

---

## Brand Positioning

| Fact | Value |
|------|-------|
| Tagline | Cleaner than Whole Foods. Cheaper than Aldi. |
| Short description | Black-farmed seasonal produce, delivered across the Chicago metro area every Wednesday. |
| Who it's for | Chicago metro households (1–4 people, city + south suburbs) who want fresh, ethically sourced produce without a long-term commitment |
| Sourcing claim | Sourced directly from Run A Way Buckers Club (Pembroke, IL) and our growing network of Black farmer partners |
| Guarantee | 100% freshness guarantee — if it's off, full refund, no questions asked |

---

## Transactional Email Standards

> Transactional email is delivered by **Resend** (as of 2026-04-24). Mailchimp
> is newsletter-only. See [CLAUDE.md](./CLAUDE.md) "Resend API — Transactional email".

| Fact | Value |
|------|-------|
| From name | Uncle May's Produce |
| From email (transactional) | hello@unclemays.com (Resend) |
| From email (newsletter) | info@unclemays.com (Mailchimp) |
| Reply-to | info@unclemays.com |
| Phone (in-email) | (312) 972-2595 |
| Footer line | Uncle May's Produce · Hyde Park, Chicago, IL |
| Brand color (green) | #2d7a2d |
| Merge-tag defaults | `*\|FNAME\|default:friend*` (never "there") |

---

## Mailchimp — Newsletter ONLY

| Fact | Value |
|------|-------|
| Scope | Newsletter broadcasts only. Transactional email moved to Resend 2026-04-24. |
| Audience list ID | `2645503d11` |
| Active automations | None currently active in Mailchimp. Transactional sequences (abandoned cart, order confirmation, welcome) are Trigger.dev + Resend. |
| Retired offers in copy | Remove all references to `WELCOME20`, `LAUNCH20`, "$30 first order", "Community Box" |

---

## Website Cross-Check

Every claim on these pages must match this doc. Files marked DELETED were removed in the catalog launch and should not be referenced.

- `src/app/page.tsx` (home schema markup + hero)
- `src/components/Hero.tsx`
- `src/app/shop/page.tsx` (catalog grid)
- `src/components/shop/CatalogGrid.tsx` (catalog card layout + price/unit display)
- `src/app/checkout/page.tsx` + `src/components/checkout/CheckoutClient.tsx`
- `src/app/about/page.tsx`
- `src/page-content/Faq.tsx`
- `src/app/get-started/GetStartedContent.tsx`
- `src/app/api/checkout/intent/route.ts` (Stripe PaymentIntent build, metadata)
- `src/app/api/webhook/route.ts` (order-confirmation trigger)
- `src/trigger/order-confirmation.ts`
- `src/trigger/abandoned-checkout.ts`
- `src/trigger/stripe-abandoned-checkout.ts`
- `src/lib/promo.ts` (FRESH10, FRESH30 entries)
- DELETED: `src/lib/products.ts` (legacy fixed-box catalog)
- DELETED: `src/app/checkout/[product]/*` (legacy per-box checkout, now redirects to /shop)
- DELETED: `src/app/subscribe/[product]/*` (legacy subscription flow)
- DELETED: `src/app/starter-box/page.tsx` (legacy box landing page)
- DELETED: `src/components/Pricing.tsx` (legacy box pricing grid)

---

## Retired Claims (do NOT use anywhere)

- ❌ **Spring Box / Full Harvest Box / Community Box** and any fixed-box product names. The catalog model replaced all of these on 2026-04-30.
- ❌ Old box prices: $30, $36, $40, $50, $58.50, $63, $70, $85.50, $95.
- ❌ "Subscribe & Save" / "10% off subscription". No new subscriptions are being sold (Doina is grandfathered, see Pricing).
- ❌ "Choice of protein included" / "chicken included with the box" / any in-box protein claim. Protein is a separate catalog SKU.
- ❌ Old per-lb produce prices: $9.38/lb asparagus, $10/lb kale, $5.63/lb sweet potato, $39.38 whole chicken. These were deprecated when portions were right-sized 2026-05-03.
- ❌ Collards, tomatoes, cucumbers, strawberries, zucchini, snap peas, beets, spring onions, shishito peppers, eggplant, turnips, broccoli florets (not in current RAB supply). **Ramps and microgreens are now in the catalog** (added 2026-05-03), so the old "no ramps" rule is retired.
- ❌ `WELCOME20`, `LAUNCH20`, `FREESHIP`, "$30 first order" / "Starter Box from $30" / "First box from $30". Only `FRESH10` and `FRESH30` are live.
- ❌ Auto-applied promo codes via `?promo=CODE` URL params. The customer must type the code in the cart drawer or on /checkout.
- ❌ "Thursday delivery" / "Thursday 2–6pm" / "Order by Thursday for Wednesday delivery".
- ❌ "Now delivering in Hyde Park" alone (service area is Chicago-wide; Hyde Park is the flagship neighborhood).
