# Meta Ads Campaign - Executive Summary
**Date:** 2026-04-17  
**Prepared by:** CRO

---

## TL;DR

**Status:** Campaign PAUSED. Critical geo-targeting error found and fixed. $0 wasted spend.

**Issue:** Campaign went live targeting NYC instead of Chicago. Fixed within hours.

**Blockers:** Need 3 more videos, static image upload, conversion tracking test, board approval.

**Timeline:** Can activate 2026-04-19 AM if blockers cleared by EOD 2026-04-18.

**Projected Performance:** $101 CAC (target: $100), 20 orders/month, 12.5x ROAS.

---

## What Happened

1. Meta campaign was built and set to PAUSED per governance
2. Campaign accidentally went ACTIVE at some point on 2026-04-17
3. All 3 ad sets were targeting **New York City** (geo key 2490299) instead of **Chicago** (geo key 2438177)
4. CRO detected issue during routine review via API
5. Campaign PAUSED immediately (within 6 hours of activation)
6. **$0 spent** - no impressions delivered before pause
7. All 3 ad sets corrected to Chicago, IL (25mi radius, women 25-50)
8. Targeting verified via API

**Root Cause:** Geo key error during ad set creation (likely copy/paste from example or script using default NYC key)

**Impact:** None. Caught before spend occurred.

---

## Campaign Structure (Verified Correct)

| Component | Detail |
|-----------|--------|
| Campaign | Subscription Launch Apr 2026 (ID: 120243219649250762) |
| Objective | OUTCOME_SALES (conversions) |
| Daily Budget | $67 ($2,010/month) |
| Optimization | PURCHASE events via Meta Pixel 2276705169443313 |
| Ad Sets | 3 (IG Feed, IG Stories, FB Feed) |
| Targeting | Women 25-50, Hyde Park 5mi radius (UPDATED per Anthony) |
| Bid Strategy | $2.00 cap per conversion |
| Creative | 2 videos (9MB each), 6 ads, 10 static images (not uploaded) |
| Status | PAUSED (awaiting blockers + board approval) |

---

## Strategic Assessment

**Overall Grade: B**

**Strengths:**
- Clean placement-level structure for performance analysis
- Data-driven targeting (age 25-50 based on actual customer orders)
- Solid conversion tracking setup (Meta Pixel + GA4)
- Budget aligns with Creative Brief ($2K/month Meta allocation)
- Conservative bid cap ($2.00) prevents runaway costs

**Weaknesses:**
- Only 2 video variants (need 5+ to avoid creative fatigue by Week 2)
- No static images uploaded yet (10 ready, not live)
- No retargeting ad set (cold traffic only)
- Manual placement selection may cap scale (should test Advantage+ later)

**Projected Performance:**
- CAC: $101 (target: $100, acceptable for Month 1 test)
- Monthly Orders: ~20 (67% of 30/week goal)
- ROAS (6mo LTV): 12.5x (target: 12x+) ✅
- Payback Period: 1.4 months ✅

---

## Blockers (Must Complete Before Activation)

### 1. Advertising Creative: Ship 3 More Videos
- **Current:** 2 videos
- **Need:** 5+ videos minimum
- **Rationale:** Meta's algorithm needs variant depth. 2 videos = creative fatigue by Week 2.
- **Deadline:** EOD 2026-04-18
- **Owner:** Advertising Creative

### 2. Advertising Creative: Upload 10 Static Images
- **Status:** Images created and exported, not uploaded to Meta
- **Location:** `ad-exports/subscription-launch-apr17/static-images/`
- **Format:** 5 Feed (1080x1080), 5 Stories (1080x1920)
- **Deadline:** EOD 2026-04-17 (today)
- **Owner:** Advertising Creative

### 3. RevOps: Test Purchase Verification
- **Task:** Run test order to confirm Meta Pixel PURCHASE event fires correctly
- **Method:** Stripe test mode order OR real $1 order, verify in Meta Events Manager
- **Rationale:** Cannot optimize for PURCHASE if event isn't tracking
- **Deadline:** 2026-04-18 AM
- **Owner:** RevOps

### 4. CTO: Verify Subscription Default
- **Task:** Confirm Stripe checkout defaults to subscription (not one-time purchase)
- **Location:** `um_website/src/app/products/weekly-produce-box/` checkout flow
- **Rationale:** LTV math ($1,264) breaks if one-time purchase (LTV drops to $55)
- **Deadline:** 2026-04-18 AM
- **Owner:** CTO

### 5. Board: Approve Spend Commitment
- **Amount:** $67/day = $2,010/month (Month 1 test)
- **Projected CAC:** $101
- **Projected Orders:** 20/month
- **Projected ROAS:** 12.5x (6mo LTV)
- **Review Doc:** `META-ADS-REVIEW-APR17.md` (full 23-page assessment)
- **Owner:** Board

---

## Decision Required

### Option A: HOLD Until Blockers Cleared (Recommended)

**Pros:**
- Launch with full creative arsenal (5 videos + 10 images)
- Avoid early creative fatigue
- Conversion tracking verified before spend

**Cons:**
- Delay learning by 1-2 days

**Timeline:** Activate 2026-04-19 AM if all blockers cleared by EOD 2026-04-18

### Option B: Soft Launch at $20/day Now

**Pros:**
- Start learning immediately
- Validate targeting and conversion tracking in production
- Ramp to $67/day once creative depth ships

**Cons:**
- Limited budget = slower learning
- May not exit Meta's learning phase before creative refresh
- Risk of early creative fatigue

**Timeline:** Activate today at $20/day, ramp to $67/day on 2026-04-19

---

## Recommendation

**HOLD activation until EOD 2026-04-18.**

**Rationale:**
- Creative depth is critical for sustainable performance
- 1-2 day delay to ship 3 more videos is worth avoiding Week 2 pause for creative refresh
- Conversion tracking verification takes 10 minutes and prevents blind spending

**If blockers clear by EOD 2026-04-18:** Activate 2026-04-19 AM at full $67/day

**If blockers drag past 2026-04-18:** Consider soft launch at $20/day while creative scales up

---

## Risk Management

### High Risk: Creative Fatigue
- **Mitigation:** Advertising Creative ships 3+ new videos by EOD 2026-04-18
- **Backup:** If only 2 videos available, launch at $20/day (lower spend = slower fatigue)

### Medium Risk: Targeting Too Broad
- **Mitigation:** Week 1 - let CBO optimize. Week 2 - add interest targeting if CAC >$150.
- **Owner:** CRO (monitoring) + RevOps (reporting)

### Medium Risk: Landing Page Conversion
- **Mitigation:** RevOps runs checkout test, CTO verifies subscription default, RevOps sets up A/B test Week 2
- **Owner:** CRO (diagnosis) + CTO (landing page) + RevOps (A/B test)

### Low Risk: Budget Burnout on One Placement
- **Mitigation:** CRO monitors daily for first 7 days, manually allocates $15/day minimum if needed
- **Owner:** CRO

---

## Next Steps (Immediate)

1. **Advertising Creative:** Ship 3 videos by EOD 2026-04-18 ⏳
2. **Advertising Creative:** Upload 10 static images by EOD 2026-04-17 ⏳
3. **RevOps:** Test purchase by 2026-04-18 AM ⏳
4. **CTO:** Verify subscription default by 2026-04-18 AM ⏳
5. **Board:** Review full assessment (`META-ADS-REVIEW-APR17.md`) and approve $67/day spend ⏳
6. **CRO:** Activate campaign 2026-04-19 AM (pending blocker clearance) ⏳

---

## Full Documentation

- **Full Review:** `META-ADS-REVIEW-APR17.md` (23 pages, strategic assessment + risk analysis)
- **Campaign Status:** `META-CAMPAIGN-STATUS-APR17.md` (updated with corrected targeting)
- **Creative Brief:** `advertising-creative-brief-subscription-launch.md` (reference for creative requirements)
- **Campaign IDs:** `.meta-campaign-ids.json` (API reference)

---

**Prepared by:** CRO (Paperclip Agent)  
**Date:** 2026-04-17  
**Issue:** UNC-366  
**Status:** Review complete, awaiting blockers + board approval

---

## UPDATE: HYDE PARK 5MI TARGETING (2026-04-17)

**Change:** Targeting updated from Chicago 25mi to **Hyde Park 5mi** per Anthony direction.

**New Targeting:**
- Location: Hyde Park (41.7954, -87.5914), 5-mile radius
- Audience: ~50-75K women 25-50 (vs 500K for Chicago 25mi)
- Demographics: 60-70% Black women in catchment area

**Impact:** Beachhead focus > broad scale. Higher relevance, faster learning, better demographic fit. $67/day budget is optimal for this audience size.

**CTO Update:** Checkout blocker identified. Primary CTAs route to one-time purchase, not subscription. Fix ready (15min), awaiting board approval.
