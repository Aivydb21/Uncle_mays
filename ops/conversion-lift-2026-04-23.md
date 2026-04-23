# Conversion Lift Playbook — 2026-04-23

Diagnostic from the 2026-04-23 performance audit showed site conversion at **0.21%** vs a 1.5–3.0% food-D2C benchmark. Most code-side fixes are already deployed. This doc tracks the remaining manual steps that must be done outside the repo.

---

## 1. Meta Ads Manager — change ad destinations (YOU)

**Problem:** `/checkout/family` was the #1 landing page last 30 days — 1,536 sessions, 65% bounce, **0 conversions**. Meta ads are deep-linking straight to a checkout form, so users never see hero, testimonials, or FAQ before being asked to pay.

**Fix:** swap every active ad's destination URL.

### Find the ads
1. Go to Meta Ads Manager → Ads tab
2. Filter: Delivery = Active
3. Sort by Spend (last 30 days), descending

### Swap URLs

| Current destination | New destination |
|---|---|
| `unclemays.com/checkout/family` | `unclemays.com/#boxes` (or `unclemays.com/subscribe/family` if the ad is a subscription pitch) |
| `unclemays.com/checkout/starter` | `unclemays.com/#boxes` (or `unclemays.com/subscribe/starter`) |
| `unclemays.com/checkout/community` | `unclemays.com/#boxes` (Community Box is retired) |
| Any `buy.stripe.com/...` link | `unclemays.com/#boxes` — the Payment Links still charge the legacy $35/$65/$95 prices |

**Preserve UTM params** on every swap. Example:
`https://unclemays.com/#boxes?utm_source=meta&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content=don_video_stories`

### Ads to prioritize (top 10 by spend, last 30d)
1. Sub Launch — IG Stories — Don Video  · $80.00
2. IG Stories Static 1 (Checkout)       · $72.87
3. Sub Launch — FB Feed — Don Jhonsan   · $59.31
4. IG Stories Video 1 (Checkout)        · $42.75
5. Fresh From Black Farmers — Main Ad   · $37.55
6. Sub Launch — IG Stories — Don Jhons  · $37.47
7. Retargeting — Don Video (Social Proof) · $28.32
8. FB Feed Video 1 (Checkout)           · $26.41
9. Sub Launch — FB Feed — Don Video 5   · $23.03
10. FB Feed Static 4 (Checkout)          · $19.33

Expected lift: redirecting these 10 to `/#boxes` or `/subscribe/{slug}` alone should move site conversion rate from 0.21% toward 0.6–1.0% on the same ad spend.

---

## 2. Mailchimp — activate the abandoned-cart journey (YOU)

**Status of audience:** 8 real Stripe customers were reimported on 2026-04-23 via `scripts/mailchimp-reimport-from-stripe.py`. Audience is no longer effectively empty.

**Remaining manual steps in the Mailchimp UI:**

### a. Activate the abandoned-cart journey
1. Mailchimp → Automations → Customer Journeys
2. Look for an existing "Abandoned cart" journey (it was drafted earlier but never activated). If missing, create one from the "Abandoned cart" template.
3. Starting point: Connected e-commerce store event → `abandoned cart`
4. Step 1 (send immediately): subject *"You left something in your cart"* — short reminder with a Subscribe & Save nudge
5. Step 2 (wait 24h, then send if still not purchased): subject *"Still thinking it over? Here's 10% off your first week"* — link the **FRESH10** promo
6. Step 3 (wait 3d, final): subject *"One more shot — fresh produce, Wednesday delivery"* — link to `/subscribe/family`
7. Activate.

### b. Build a welcome series for the re-imported Stripe customers
Most of them last bought weeks ago. One 3-email re-engagement:
- Day 0: *"What's in this week's box"* (showcase produce)
- Day 3: *"Meet Reggie at Pembroke Farm"* (farmer story)
- Day 7: *"Come back and save 10%"* (FRESH10 for their next one-time order)

Segment: `tag contains "stripe-customer"` AND `last order > 30 days ago`.

### c. Turn on Stripe → Mailchimp cart sync
The code in `src/lib/mailchimp.ts` already calls `createCart` on checkout-intent and `deleteCart` on webhook-completed. Verify in Mailchimp → Integrations → Stripe that the integration is connected and e-commerce events are flowing.

---

## 3. Verify purchase tracking is fixed (SHARED)

**Code side (deployed 2026-04-23):**
- Server-side GA4 Measurement Protocol now fires on `payment_intent.succeeded` for both one-time and subscription flows — previously it only fired on the legacy `checkout.session.completed` path, which almost no traffic uses.
- Client-side `gtag('event','purchase')` on `/order-success` now retries up to 8s to survive slow mobile gtag boot and 3DS redirects.
- Same retry pattern on Meta Pixel `Purchase` event.

**Required env vars on Vercel (check both Production + Preview):**
- `GA4_MEASUREMENT_ID` — set to the GA4 measurement ID (starts with `G-`)
- `GA4_API_SECRET` — generate at GA4 → Admin → Data Streams → Measurement Protocol API secrets
- `META_PIXEL_ID` — should be `2276705169443313`
- `META_ACCESS_TOKEN` — the Meta app's long-lived token
- `NEXT_PUBLIC_GOOGLE_ADS_ID` + `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` — for Google Ads conversion tracking on client

**After 48h:**
- Cross-check Stripe charges count vs GA4 Acquisitions → Key events → `purchase` count. Should be within 10% of each other. If still ≥50% gap, the server-side call is failing — check Vercel function logs for `[GA4] Tracking failed:` messages.

---

## 4. Legacy Stripe Payment Links — audit before re-enabling paid media

The `buy.stripe.com/...` Payment Links from the pre-April pricing era still exist in the Stripe dashboard at the legacy $35/$65/$95 prices. Anyone hitting them through a stale ad URL or saved link pays the old price.

### Audit
1. Stripe Dashboard → Payment Links
2. For each active link, decide:
   - **Deactivate** if you don't know where it's linked from (safe default)
   - **Edit → Line items → Price** and swap to a newly-created $40 or $70 Price (if you want the link to keep working)

---

## 5. Success metrics — check weekly

Baseline (2026-04-23): 3,762 sessions / 30d, 8 Stripe charges, 0.21% conversion rate, $2,715 revenue last 90d.

Target 30 days after all fixes:
- Conversion rate: 0.6%+ (3x baseline, achievable just from #1)
- GA4 purchase events: ≥90% of Stripe charge count (tracking fix)
- Meta CAPI Purchase events: ≥90% of Stripe charge count
- Mailchimp open rate on abandoned-cart recovery: 40%+
- Subscription conversions as % of total: climbing (currently 2 active of 56 attempts)
