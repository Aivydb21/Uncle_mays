# Customer-Facing Facts — Uncle May's Produce

> **This is the single source of truth for everything a customer can see.**
> Website, emails, ads, Mailchimp campaigns, and agent-generated copy must match this doc.
> If any of these facts change, update this file FIRST, then propagate to every surface.

**Last updated:** 2026-04-23
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

**Two tiers. Proteins are optional paid add-ons — no protein is ever included in the base box price.**

| Box | One-Time | Subscription (10% off) | Who it's for | What's inside | Approx. weight |
|-----|----------|------------------------|--------------|----------------|----------------|
| **Spring Box** | $40 | $36/wk | 1–2 people | Salad mix, kale, candy carrots, sweet potatoes, potatoes, broccoli, organic black beans | About 6 lbs |
| **Full Harvest Box** | $70 | $63/wk | 3–4 people | Everything in the Spring Box, plus pea shoots, radishes, customer choice of bean (black, pinto, or kidney), and pasture-raised chicken thighs (included) | About 10 lbs |

### Protein Add-Ons (optional, available on every box)

Flat $12 each. 1 lb portions. Chicken is the featured option and is **already included** in the Full Harvest Box (chicken add-ons on Full Harvest are extra portions on top of the included one).

| Protein | Price |
|---------|-------|
| Pasture-Raised Chicken Thighs (featured, included with Full Harvest) | +$12 |
| Grass-Fed Beef Short Ribs | +$12 |
| Lamb Chops | +$12 |

**Customer-facing display rule:** do NOT show per-item weights on the website, in ad copy, or in customer emails. The "About X lbs" total weight is the only weight figure customers see. Internal docs (this file) keep weights for reference only. Per-item measurements were removed 2026-04-27 because they slowed checkout — customers paused to do math.

### Rules
- **Subscribe & Save** = exactly **10% off** the one-time price, same box every Wednesday.
- **`FRESH10`** is the only active promo code: $10 off the first box, one-time and subscription. Applied via `?promo=FRESH10` in the URL.
- Subscriptions can be paused or cancelled anytime in the customer account portal (no fees, no phone call).
- Community Box ($95) is **retired**. Do not mention it anywhere.

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

Every claim on these pages must match this doc:

- `src/app/page.tsx` (home — schema markup, hero, pricing)
- `src/components/Hero.tsx`
- `src/components/Pricing.tsx`
- `src/app/shop/page.tsx`
- `src/app/starter-box/page.tsx`
- `src/app/about/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/checkout/[product]/*`
- `src/app/subscribe/[product]/*`
- `src/lib/products.ts`
- `src/app/api/checkout/intent/route.ts`
- `src/trigger/order-confirmation.ts`
- `src/trigger/subscription-cancellation.ts`
- `src/trigger/abandoned-checkout.ts`
- `src/trigger/stripe-abandoned-checkout.ts`

---

## Retired Claims (do NOT use anywhere)

- ❌ "Community Box" / the $95 tier / "choice of protein included"
- ❌ "Whole chicken included" / "eggs included" / any in-box protein claim
- ❌ Collards, tomatoes, cucumbers, strawberries, zucchini, snap peas, beets, spring onions, shishito peppers, eggplant, turnips, ramps on shelf (not in current RAB supply)
- ❌ `WELCOME20`, `LAUNCH20`, "$30 first order" / "Starter Box from $30" / "First box from $30"
- ❌ "Thursday delivery" / "Thursday 2–6pm" / "Order by Thursday for Wednesday delivery"
- ❌ "Now delivering in Hyde Park" alone (service area is Chicago-wide; Hyde Park is the flagship neighborhood)
