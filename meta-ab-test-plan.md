# Meta Ad A/B Test Plan — 15 Variant Deployment

## CRO Decision: Test Structure & Budget

**Test Duration:** 7 days (2026-04-14 to 2026-04-20)

**Budget Allocation:**
- **Current daily spend:** $7/day
- **Test budget:** $50/day ($350 total for 7 days)
- **Per-format allocation:** $16.67/day per format (Instagram Post, Facebook Ad, Story/Reel)
- **Per-variant spend:** $3.33/day per variant (5 variants per format)

**Targeting:**
- **Primary audience:** Black women, ages 25-35
- **Geographic:** Hyde Park Chicago + 10-mile radius (Bronzeville, Kenwood, South Loop, Woodlawn)
- **Income:** $50K+ household income
- **Interests:** Organic food, healthy living, local shopping, Black-owned businesses

**Success Metrics (7-day window):**
- **Primary:** Conversion rate (checkout completions / clicks)
- **Secondary:** CTR (click-through rate), CPC (cost per click), CPM (cost per 1000 impressions)
- **Target CPA:** <$15 per order (based on $50 AOV and 30% margin tolerance)

**Scale Decision Criteria:**
After 7 days, scale to $50/day on the winning variant IF:
- CTR >2.5% (industry benchmark for food/grocery ads)
- CPA <$15
- At least 5 conversions in test window (statistical significance threshold)

If no variant meets criteria, run a second test round with copy variations.

---

## Variant Hypothesis Ranking (Pre-Test)

Based on customer survey data (97% intent-to-shop, 89.6% would refer), my hypothesis for variant performance:

1. **Variant C (Social Proof)** — 89% referral stat is directly from our data; expected to resonate most
2. **Variant A (Direct Offer)** — $30 price point is clear value prop, low friction
3. **Variant E (Community)** — "For us, by us" aligns with brand positioning
4. **Variant D (Scarcity)** — FOMO can work but may feel artificial if inventory isn't actually limited
5. **Variant B (Curiosity)** — Engagement hook is weaker for direct-response conversion

**Post-test:** Compare actual performance to this ranking. If Social Proof underperforms, it signals messaging disconnect.

---

## RevOps Execution Checklist

**Technical Setup (delegate to RevOps):**
1. Export all 15 designs from Canva as PNG (1080x1080, 1200x628, 1080x1920)
2. Upload to Meta Ads Manager under ad account `act_814877604473301`
3. Create 3 ad sets (one per format: Instagram Post, Facebook Ad, Story/Reel)
4. Configure each ad set:
   - Budget: $16.67/day
   - Objective: Conversions (purchase)
   - Pixel: Uncle May's Stripe checkout conversion tracking
   - Placement: Automatic (but format-matched: Posts for Instagram/FB feed, Stories for vertical)
5. Create 5 ads per ad set (one per variant A/B/C/D/E)
6. Set UTM parameters for each variant:
   - `utm_source=meta`
   - `utm_medium=paid_social`
   - `utm_campaign=produce_box_ab_test`
   - `utm_content=[variant_id]` (e.g., `instagram_social_proof`, `facebook_direct_offer`)
7. Launch campaigns on 2026-04-14 at 9am CST
8. Set up daily reporting dashboard (GA4 + Meta Ads Manager)
   - Track: impressions, clicks, CTR, CPC, conversions, CPA per variant
   - Alert CRO if any variant hits <0.5% CTR or >$20 CPA after 48 hours (kill underperformers early)

**Budget Safety:**
- Set account-level daily spend cap at $55/day (buffer for overspend protection)
- Pause any variant that hits $25 CPA after 3 days (cut losses early)

---

## Post-Test Actions (CRO)

**Day 8 (2026-04-21):**
1. Review 7-day performance data from RevOps
2. Identify winning variant (highest conversion rate, lowest CPA)
3. Scale winner to $50/day if criteria met
4. Document learnings: which hook strategy worked best and why
5. Feed insights back to Advertising Creative for next creative sprint

**If test fails (no variant meets criteria):**
1. Analyze failure mode: low CTR (creative problem) or low conversion rate (landing page/offer problem)
2. If low CTR: request new creative variants from Advertising Creative with different hooks
3. If low conversion rate: escalate to CEO/Board for landing page optimization or offer adjustment
4. Do NOT scale spend until we have a proven winner

---

## Current Context

- **Baseline:** $7/day, ~3 orders/week (~$150/week revenue)
- **Goal:** 30 orders/week (~$1,500/week revenue)
- **Required lift:** 10x order volume
- **Ads role:** Primary customer acquisition channel until organic/referral scales

This test is the first step toward achieving the 30 orders/week goal. If we find a winning variant at $50/day, we'll project toward 100/week and beyond.
