# Customer-Facing Facts — Uncle May's Produce

> **This is the single source of truth for everything a customer can see.**
> Website, emails, ads, Mailchimp campaigns, and agent-generated copy must match this doc.
> If any of these facts change, update this file FIRST, then propagate to every surface.

**Last updated:** 2026-04-22
**Owner:** Anthony Ivy

---

## Delivery

| Fact | Value |
|------|-------|
| Delivery day | **Wednesday, every week** |
| Delivery window | _TBD — confirm time window_ |
| Order cutoff | **Sunday 11:59 PM CT** — orders placed after cutoff ship the following Wednesday |
| Service area | Chicago (Hyde Park and city-wide) |
| Delivery fee | Free |
| Missed delivery policy | 100% freshness guarantee — full refund, no questions asked |

---

## Pricing — ONE AUTHORITATIVE TABLE

**No promo codes. No first-order discounts. Subscribe & Save = 10% off one-time price.**

| Box | One-Time | Subscription (10% off) | What's Inside |
|-----|----------|------------------------|---------------|
| **Starter Box** | $35 | $31.50/wk | ~8 servings seasonal produce, 12–15 lbs, for 1–2 people |
| **Family Box** | $65 | $58.50/wk | ~14–18 servings produce + dozen farm eggs + pasture-raised whole chicken, 22–26 lbs, for family of 4 |
| **Community Box** | $95 | $85.50/wk | ~20–24 servings heirloom/specialty produce + dozen farm eggs + choice of protein (chicken, pork, beef, or salmon), 30–35 lbs, great for sharing |

### Rules
- **No active promo codes.** `WELCOME20`, `LAUNCH20`, first-order $30, and any other discount are retired.
- **Subscribe & Save** is the only standing offer: exactly **10% off** the one-time price for a weekly recurring order.
- Subscription can be paused or cancelled anytime in the customer account portal (no fees, no phone call required).
- Additional proteins on the Community Box are paid add-ons (chicken $20, pork $18, beef $24, salmon $22).

---

## Brand Positioning

| Fact | Value |
|------|-------|
| Tagline | Cleaner than Whole Foods. Cheaper than Aldi. |
| Short description | Black-farmed seasonal produce, delivered to your Chicago door every Wednesday. |
| Who it's for | Chicago households (1–5 people) who want fresh, ethically sourced produce without a long-term commitment |
| Sourcing claim | Curated directly from Black farmers across the Midwest |
| Guarantee | 100% freshness guarantee — if it's off, full refund, no questions asked |

---

## Transactional Email Standards

| Fact | Value |
|------|-------|
| From name | Uncle May's Produce |
| From email | info@unclemays.com |
| Reply-to | info@unclemays.com |
| Phone (in-email) | (312) 972-2595 |
| Footer line | Uncle May's Produce · Hyde Park, Chicago, IL |
| Brand color (green) | #2d7a2d |
| Merge-tag defaults | `*\|FNAME\|default:friend*` (never "there") |

---

## Mailchimp

| Fact | Value |
|------|-------|
| Audience list ID | `2645503d11` |
| Active automations | Abandoned cart (to be activated), Welcome sequence (to be built) |
| Retired offers in copy | Remove all references to `WELCOME20`, `LAUNCH20`, "$30 first order" |

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

- ❌ "$30 first order" / "Starter Box from $30" / "First box from $30"
- ❌ "Thursday delivery" / "Thursday 2-6pm"
- ❌ "WELCOME20", "LAUNCH20", any promo code
- ❌ "Order by Thursday for Wednesday delivery" (impossible — Thursday is after Wednesday)
- ❌ "Now delivering in Hyde Park" alone (service area is Chicago-wide; Hyde Park is the flagship neighborhood)
