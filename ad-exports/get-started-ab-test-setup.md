# `/get-started` A/B Test Setup — 2026-04-25

## Why this test exists

Per [funnel-reality-2026-04-24.md](./funnel-reality-2026-04-24.md), 97% of cold Meta visitors land on the checkout-summary page and bounce before the delivery step. The CRO hypothesis is that the summary page is too "buy-now" for cold traffic and needs a warming page in front of it. This test ships that warming page and splits ad traffic to measure the lift.

## What we're testing

| Variant | Landing URL |
|---|---|
| Control | `https://unclemays.com/#boxes` (current) |
| Treatment | `https://unclemays.com/get-started` (new) |

The treatment page leads with the FRESH10 promo, shows the Antoinette Woods testimonial above the fold, walks through "How it works," and only then surfaces the same `<Pricing />` component as the control. The CTA on the box card still sends users into `/checkout/[product]` or `/subscribe/[product]`, so the bottom of the funnel is unchanged — only the top is different.

## Meta Ads Manager setup

1. In Meta Ads Manager, open the **Subscription Launch Apr 2026** campaign.
2. Pick the top-performing ad set ("Don Video 5" or "Don Jhonsan 4" per the CRO report).
3. **Duplicate** it. Name the duplicate `<original> — get-started`.
4. On the original (control), set the Website URL to:
   ```
   https://unclemays.com/?utm_source=meta&utm_medium=paid&utm_campaign=sub-launch-apr26&utm_content=home-anchor#boxes
   ```
5. On the duplicate (treatment), set the Website URL to:
   ```
   https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=sub-launch-apr26&utm_content=get-started
   ```
6. Keep the creative, audience, placement, and bid identical between the two ad sets.
7. Split the existing ad-set budget 50/50 between control and treatment. Do not increase total spend — the test is about per-dollar conversion, not volume.

## What "winning" looks like

Per the Phase 4 statistical-significance discussion: at $20/day current spend with 0.16% CR, getting 25 purchases per variant for a real significance test would take months. So we use a faster interim metric.

**Primary interim metric** (decide in 2–4 weeks):
- `delivery_step_pageview_per_session` segmented by `utm_content` (`home-anchor` vs. `get-started`).
- A meaningful lift here means treatment is loading more people into the funnel mid-step. Promote the winner to all Meta ads, then measure the resulting full-funnel CR for 2 weeks at the new baseline.

**Secondary metrics:**
- Sessions per landing URL (sanity check that the split is even).
- Bounce rate per landing URL.
- Time on page per landing URL.

**True success metric** (only used for the final scaling decision):
- Stripe purchases per session, segmented by the same UTM. We want this to rise above 0.5% before any spend scale-up.

## How to read the results in GA4

In GA4 Explore, build a Free Form report:
- **Dimensions:** `Session source / medium`, `Session campaign`, `Session manual ad content` (this is the `utm_content` field), `Page path`.
- **Metrics:** `Sessions`, `Engaged sessions`, `Page views`, `Session conversion rate`.
- **Filter:** `Session campaign exactly matches "sub-launch-apr26"`.
- **Date range:** since A/B start.

Compare the two `utm_content` rows to see the per-variant funnel.

## When to stop the test

Stop the test on whichever comes first:
- 14 calendar days from launch, OR
- 500 sessions per variant, OR
- Treatment shows ≥ 50% lift in delivery-step pageviews per session with ≥ 200 sessions per variant (call it early in that case).

If treatment loses (<10% lift, or worse), kill the duplicate ad set and roll all traffic back to the control URL. Document why in this file.

## Artifacts

- New page: [src/app/get-started/page.tsx](../src/app/get-started/page.tsx)
- Page body: [src/app/get-started/GetStartedContent.tsx](../src/app/get-started/GetStartedContent.tsx)
- Reuses: [`<Pricing />`](../src/components/Pricing.tsx), [`TESTIMONIALS`](../src/lib/testimonials.ts)

## Open dependencies

1. The page renders correctly on iPhone Safari and Android Chrome — verify after deploy by opening `https://unclemays.com/get-started` on both.
2. Address autocomplete on the downstream delivery page is currently broken (env var `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is unset on Vercel) — fixing this before launching the A/B test will compound the funnel improvement.
3. Apple/Google Pay enabled at the payment step (already shipped 2026-04-24) — verify on a real device.
