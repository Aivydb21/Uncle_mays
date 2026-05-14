# Food Ecommerce Operators — US, Non-Shopify-Locked Shortlist

**Date:** 2026-05-11 (revised twice after CEO direction)
**Author:** Claude (research, requested by CEO)
**Filter:**
1. **Operators**, not auditors. They own the outcome end-to-end.
2. **US-based.**
3. **Not Shopify-locked.** We are on Next.js + embedded Stripe Elements and do not want a Shopify-only firm.
4. **Track record of taking food ecommerce sites to success.**

---

## The honest market read

Food-DTC ecommerce operators with strong portfolios live almost entirely on Shopify because that's where the food/bev volume is. The three filters above shrink the field hard. Three realistic paths exist:

1. **Stay on Next.js, hire a US headless-commerce shop with food/grocery experience.** Smaller pool, less deep portfolio proof.
2. **Hire a US food/bev specialist (Anatta, Barrel) and accept they will likely recommend headless Shopify** (Next.js stays as the frontend, Shopify takes over cart/checkout/subscriptions in the background). This is the Athletic Greens pattern.
3. **Hire a platform-flexible US shop (Bear Group) and have them work on the existing Next.js stack.** Most respectful of current architecture, smallest food/bev portfolio.

We have to pick a posture before the intro calls so the conversation is honest from the first minute.

---

## Context the partner inherits

- **Stack:** Next.js (App Router) on Vercel, Airtable-driven catalog, embedded Stripe Elements checkout.
- **Funnel pain:** 25% paid-session → /shop reach, 5.5% /shop → add-to-cart, 33% add-to-cart → purchase. Paid CVR ~0.46% vs. 2–4% food-DTC benchmark.
- **Standing order (2026-04-29):** marketing infra changes require board approval. Pure product/UX changes on non-ad-funnel surfaces do not.

---

## The shortlist (in recommended call order)

### 1. Barrel — NYC + LA + Philly + Toronto

The deepest US food/bev portfolio of any agency in this list. CPG-commerce specialists, not generalists.

- **Food/bev client roster (28+ named brands):** McCormick, Cabot Creamery, Sweet Loren's, Once Upon a Farm, Anthony's Goods, Khloud, Bobo's, Kite Hill, Austin Eastciders, Milton's, Stiller's Soda, Caffe Vita, Zatarain's, Cholula, Lawry's, Frank's RedHot, Oishii, Sprinter, BIOLYTE, MUSH, Real Good Foods, Teremana, Grazly, Thinsters, BHU Foods, PuraVida Foods, Delola, 818, ParmCrisps, Vermont Smoke & Cure.
- **Why they fit our brief:** they have actually built and run more food/bev DTC sites in the US than anyone else on this list. Founded 2006. Multi-office US presence. Practice is "CPG commerce," not "Shopify-only" — even though their marketing leans Shopify.
- **Open question for the call:** would they take on a Next.js + Stripe Elements engagement without a platform migration? Or do they have a headless/custom practice they don't advertise? Ask early so the rest of the call is honest.
- **URL:** https://www.barrelny.com/vertical/food-beverage

### 2. Anatta — Austin, TX

Closest US fit if we are willing to consider headless Shopify (Next.js front + Shopify back).

- **Proof of work — Four Sigmatic (2018–2024):** 6-year partnership, 3 site redesigns, 2 rebrands, 2 platform migrations, **240+ CRO tests deployed**, PWA build cut bounce rate 90%, email CVR +50%, data reporting accuracy +75%.
- **Other food/bev portfolio:** Athletic Greens (subscription growth + international + headless PWA since 2018), Trade Coffee (5,000+ SKUs migrated in 3–4 months).
- **Why they fit despite the "no Shopify" rule:** their Athletic Greens build is the exact headless pattern that lets us keep Next.js as the storefront while delegating cart/checkout/subscriptions to a battle-tested commerce backend. 100+ brands, $1B+ collective revenue. Shopify Platinum (top 0.1%).
- **Engagement model:** 90-day trial (one UX, one UI, one PM) → long-term retainer. Expected ask $50–120k for the trial, $25–50k/mo ongoing.
- **Caveat:** we are below their mid-market sweet spot ($25M–$500M ARR). The 90-day trial structure is designed for exactly this scenario but worth naming on the first call.
- **URL:** https://anatta.io/case-study/foursigmatic

### 3. Bear Group — Seattle, WA

The "respect your existing Next.js stack" option.

- **Platforms they actually ship on:** Adobe Commerce / Magento, Shopify, BigCommerce, custom. Genuinely platform-flexible — they are not the firm that will push a Shopify migration on day one.
- **Food/bev experience:** Torani (R. Torre & Co.) — large beverage syrup brand. Smaller food/bev portfolio than Barrel or Anatta.
- **Why they fit:** they will be the most willing of the three to work on our Next.js + Stripe Elements stack without proposing a re-platform. The trade-off is they have less accumulated food-DTC playbook than Barrel.
- **Use as:** sanity check on whether the other two are pushing platform changes for portfolio reasons rather than our reasons. If Bear Group says "your stack is fine, we'd do X to fix conversion," that's a meaningful data point.
- **URL:** https://www.beargroup.com/

---

## Honorable mention, lower confidence

- **1Center** — US headless/Next.js specialists. DTC portfolio is broad but light on food/bev specifically (Diamonds Direct, Pro Torque). Worth a call if Bear Group doesn't click. https://www.1center.co/headless-ecommerce-development-agency/
- **Thrive** — claims DTC food/bev/CPG specialty. Public material is thinner than Barrel's — verify scope and proof on the call before taking seriously.
- **Common Thread Collective** — US performance-marketing operator for DTC food/bev at $10M–$100M ARR. They fix paid-spend efficiency *once the site converts.* Not the right tool today; bookmark for after site CVR is fixed. https://commonthreadco.com/

---

## Deliberately cut

- **Swanky** — UK-based + Shopify-only.
- **Charle** — UK-based + Shopify-only.
- **Netalico** — Shopify-only.
- **Baymard, Jon MacDonald, Talia Wolf** — auditors / advisors, not operators.
- **Toptal / Upwork** — staff augmentation, not outcome-owning operators.

---

## Recommended next action

Book all three intro calls this week, in this order:

1. **Barrel** — open with: "We are a Next.js + Stripe Elements food DTC, sub-$25M, looking for an operator partner. Will you take this on without requiring a platform migration? What's the closest comparable in your portfolio?" Their answer to that question tells you whether this engagement is real.
2. **Anatta** — open with: "We've ruled out a Shopify migration but are open to the Athletic Greens headless pattern. Walk us through how that engagement was scoped and what the first 90 days looked like." The 90-day trial is the natural opening.
3. **Bear Group** — open with: "We want a partner who will work on our existing Next.js stack and ship CRO improvements. What does your first 60 days look like? What food/bev work have you shipped?" Use their answers as a calibration check against the other two.

After the three calls, decide:
- **Posture on platform:** stay on Next.js / headless Shopify / full Shopify migration.
- **Engagement shape:** 90-day trial / fixed-scope build / monthly retainer.
- **Budget commit.**

---

## Sources

- [Barrel — Food & Beverage practice](https://www.barrelny.com/vertical/food-beverage)
- [Barrel — About](https://www.barrelny.com/about)
- [Anatta — Four Sigmatic case study](https://anatta.io/case-study/foursigmatic)
- [Anatta — Athletic Greens case study](https://anatta.io/case-study/athleticgreens)
- [Anatta — Headless Commerce practice](https://anatta.io/services/headless-ecommerce)
- [Bear Group](https://www.beargroup.com/)
- [1Center — Headless Commerce](https://www.1center.co/headless-ecommerce-development-agency/)
- [Common Thread Collective](https://commonthreadco.com/)
- Internal: [analytics/cro-recommendation-unc-880.md](../analytics/cro-recommendation-unc-880.md)
