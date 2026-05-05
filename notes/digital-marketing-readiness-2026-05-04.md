# Digital Marketing Readiness — Pre-Push Analysis
**Date:** 2026-05-04  
**Author:** Decision Scientist  
**Issue:** [UNC-780](/UNC/issues/UNC-780)  
**Status:** Findings complete — recommendations handed to CRO

---

## Headline

Infrastructure is mostly ready. Attribution chain was fixed 2026-05-03 and all 7 data pipelines are live. The main readiness gap is that the prior campaign ad creatives point to the old fixed-box landing pages (`/get-started`, `/ask`) while the site now runs a build-your-own catalog at `/shop`. Sending paid traffic into that mismatch is the primary cause of the 57.7% zero-engagement bounce rate. Blended ROAS on the Apr 26–May 1 test push was 0.60 — losing money. Fix the creative-destination mismatch before scaling.

---

## 1. Data Infrastructure Status

| System | Status | Notes |
|---|---|---|
| GA4 BigQuery export | Live | Daily sharded `events_*` tables in `uncle-mays-automation` |
| Stripe webhook | Live | Fires on checkout.session.completed, payment_intent.succeeded |
| Meta CAPI | Live | Fixed 2026-05-03 with UTM/fbclid/fbp flow to PaymentIntent metadata |
| Google Ads (GA4 import) | Live | Conversion import from GA4 configured |
| Clarity | Live | URL-level session + bot metrics, last pulled 2026-05-04 |
| Mailchimp | Seeded but empty | 3 members; must re-import from Stripe before sends |
| Resend | Live | Transactional email operational (order confirmation, abandoned cart) |

**Attribution chain:**  
As of 2026-05-03, UTM / gclid / fbclid / fbc / fbp / ga_client_id flows from URL → client storage → CheckoutClient → PaymentIntent metadata → Stripe ingest → ML feature parquet. **However**, match rate in the processed parquet remains low: only 4 of 305 [observed] checkout attempts carry UTM metadata, 3 carry fbclid, 4 carry gclid. This is a data quality gap that will improve as new paid sessions come through the fixed pipeline — historical sessions pre-fix are unattributable.

---

## 2. Traffic Quality (GA4, 293 sessions, last data pull 2026-05-04)

**Source mix [observed]:**
| Source | Sessions | % |
|---|---|---|
| Meta paid | 174 | 59.4% |
| Google CPC | 23 | 7.8% |
| Instagram/FB social | 47 | 16.0% |
| Direct | 29 | 9.9% |
| Organic search | 20 | 6.8% |

**Geography:** Chicago 211/293 = 72% [observed]. Good — this is the service area. Secondary cities: New York (4), Calumet City (4), Hazel Crest (5). Out-of-area traffic from non-deliverable cities is a budget drain; Chicago-only geo targeting should be enforced.

**Device:** 83% mobile [observed]. Ads and landing pages must be mobile-first.

---

## 3. Bounce / Engagement Quality

| Metric | Value | Notes |
|---|---|---|
| Single-page sessions | 200/293 = 68.3% [observed] | Extremely high |
| Zero-engagement (1pv + 0 scroll) | 169/293 = 57.7% [observed] | Strong bounce signal |
| Clarity bot sessions | 28/139 = 20.1% [observed] | See §4 |

**Zero-engagement by source [observed]:**  
- Meta paid: 110 zero-engage sessions out of 174 total (63%)
- Instagram/FB social: 18/47 (38%)
- Google: 13/23 (57%)

Interpretation: paid traffic is overwhelmingly bouncing after 1 page. The most likely cause is creative-destination mismatch — ads reference FRESH10 and the one-time box, but `/get-started` still renders the old fixed-box flow (or redirects to `/shop` without context). Customers arrive, see something unexpected, leave.

---

## 4. Bot Traffic

**Clarity [observed]:** 28/139 tracked sessions flagged as bots = 20.1% bot rate by page.

Worst pages:
| Page | Bot rate |
|---|---|
| /manage-subscription | 100% (1/1 — small N) |
| /ask | 50% (3/6) |
| /about | 50% (1/2) |
| /checkout/starter | 33% (1/3) |
| /shop | 20% (2/10) |
| /checkout/family | 17% (2/12) |
| /get-started | 14% (5/37) |

**GA4 suspicious signal [observed]:** 4 sessions with medium `bcbaebafe_dbeg` — this is a known bot/spam referral pattern. These sessions should be filtered from conversion rate calculations.

**Russia + India traffic [observed]:** 4 sessions (2 each). Low absolute number but consistent with scraper activity on the `/ask` social landing page.

**Recommendation:** Add a GA4 filter for the `bcbaebafe_dbeg` medium. Clarity is already catching the same volume; numbers reconcile. Reported CVR should exclude these sessions.

---

## 5. Funnel Performance

| Stage | Count | Source |
|---|---|---|
| GA4 sessions | 293 | GA4 [observed] |
| Add to cart | 1 (0.3%) | GA4 [observed] |
| Begin checkout | 0 (0.0%) | GA4 [observed] |
| Purchase (GA4) | 1 (0.3%) | GA4 [observed] |
| Checkout sessions (Stripe) | 303 | Stripe [observed] |
| Completed checkout (Stripe) | 18 (5.9%) | Stripe [observed] |
| Expired checkout (Stripe) | 285 (94.1%) | Stripe [observed] |

**Note on discrepancy:** GA4 shows 1 purchase event vs. Stripe 18 completed sessions. This is an attribution window mismatch — the GA4 export window covers recent sessions while Stripe captures all historical completions. The Stripe 5.9% checkout-completion rate is reasonable (industry median ~65% so this is low, but not alarming for a new flow). The real problem is the extremely low session-to-add-to-cart rate (0.3%).

**All-time revenue [observed]:**
- 34 Stripe succeeded charges, total $3,061.72 [observed]
- AOV: $90.05 [observed]
- Most active period: Jan 29–30 (10 orders = $2,000), Apr 20 (6 orders = $285)

---

## 6. Paid Media Performance (Apr 26–May 1)

### Meta — "One-Time Box Launch - Apr 2026"

| Date | Impressions | Clicks | Spend | CTR | CPC | Purchases | Value |
|---|---|---|---|---|---|---|---|
| Apr 26 | 4,593 | 109 | $40.65 | 2.4% | $0.37 | 0 | $0 |
| Apr 27 | 1,793 | 102 | $49.38 | 5.7% | $0.48 | 0 | $0 |
| Apr 28 | 769 | 77 | $24.60 | 10.0% | $0.32 | 1 | $82 |
| Apr 29 | 1,658 | 154 | $51.04 | 9.3% | $0.33 | 1 | $70 |
| Apr 30 | 1,537 | 140 | $40.91 | 9.1% | $0.29 | 0 | $0 |
| May 1 | 760 | 55 | $22.31 | 7.2% | $0.41 | 0 | $0 |

**Total Meta spend: $228.89 [observed] | Attributed revenue: $152 [observed] | ROAS: 0.66 [modeled]**

CTR improved over time (good — algorithm optimized). CPC volatile. Low purchase volume despite decent traffic.

### Google Ads — "Produce Box - Search Campaign"

| Period | Spend | Clicks | Conversions | CPC |
|---|---|---|---|---|
| Apr 24–May 3 (10 days) | $162.17 | 49 | 1 | $3.31 avg |

**Total Google spend: $162.17 [observed] | Attributed revenue: $82 [observed] | ROAS: 0.51 [modeled]**

CPC highly volatile ($1.09–$10.80/day). One conversion in 10 days with $162 spend = $162 CPA vs. $90 AOV. Running at a loss.

### Combined

**Total paid spend Apr 26–May 1: $391.06 [observed]**  
**Combined attributed revenue: $234 [observed]**  
**Blended ROAS: 0.60 [modeled]** (spending $1 to make $0.60)

At a 35% gross margin [assumed per CLAUDE.md], gross profit on $234 revenue = $81.90. Net paid contribution = $81.90 - $391.06 = **-$309 [modeled]** on this push.

---

## 7. Key Readiness Gaps Before New Push

**Critical:**
1. **Creative-destination mismatch.** Old ad creatives route to `/get-started` which was built for fixed boxes. The catalog is now at `/shop`. Either (a) update ad destination URLs to `/shop` or (b) rebuild `/get-started` as a catalog-aware entry point. This alone explains most of the 57.7% zero-engagement bounce.
2. **FRESH10 no longer auto-applied.** As of 2026-05-03, `?promo=FRESH10` URL param no longer auto-applies the code. Customers must type it in the cart drawer. All current ad creatives say "use code FRESH10" but many likely assumed it would be pre-filled. Update ad copy to explicitly say "enter code FRESH10 at checkout."
3. **Mailchimp audience is empty.** 3 members. Before any email retargeting push, re-import Stripe customers.

**Important:**
4. **Attribution historical gap.** Pre-2026-05-03 sessions won't match to paid campaigns. Use only post-fix data (2026-05-04 onward) to benchmark new push CVR.
5. **Out-of-area impressions.** Google and Meta are sending national impressions. Geo-constraint to Chicagoland will improve CPC and reduce wasted spend.
6. **Bot filter needed.** Exclude `bcbaebafe_dbeg` medium from GA4 CVR denominator. 20% bot rate means reported metrics are overstated by ~25% if bots are included.

---

## 8. Recommendations to CRO (filed as child issue)

See [UNC-781](/UNC/issues/UNC-781) for the full action list assigned to the CRO.

**Priority order:**
1. Fix ad destination URLs → `/shop` (or new catalog landing page)
2. Update all ad copy: "enter code FRESH10 at checkout" (not auto-applied)
3. Enforce Chicago metro geo on all paid campaigns
4. Pause Google Search until a new ad group targeting "fresh produce delivery Chicago" at $5–7 CPC cap is validated
5. Brief Advertising Creative on new catalog model so creative reflects actual product
6. Re-import Stripe customers to Mailchimp before any email blast
7. Target add-to-cart + begin_checkout as optimization signals (current campaign is optimizing on view_content)

---

## 9. Measurement Plan for New Push

**Primary KPI:** Session-to-checkout initiation rate (target: >3% from paid, current ~0.3%)  
**Secondary:** Checkout-to-purchase (current 5.9%, target >15%)  
**Guard rail:** Bot-adjusted CVR (filter `bcbaebafe_dbeg`, non-US traffic)  
**Attribution:** Verify fbclid/gclid population in processed parquet increases post-fix  
**Sample size:** At current ~30 paid clicks/day, need ~2 weeks to detect a 3x improvement in checkout initiation at 80% power (n~200 paid sessions per variant).  

Re-run this analysis after 7 days of the new campaign; update the conversion_v2 baseline notebook and post delta.
