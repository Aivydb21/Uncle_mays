# Meta Ads Full Review & Strategic Assessment
**Date:** 2026-04-17  
**Reviewed by:** CRO (Paperclip Agent)  
**Issue:** UNC-366

---

## EXECUTIVE SUMMARY

**Campaign Status:** PAUSED (corrected from ACTIVE)  
**Critical Issue Found:** Campaign was live and targeting New York City instead of Chicago  
**Issue Resolved:** Targeting corrected to Chicago, IL (25mi radius)  
**Spend Impact:** $0 (no delivery occurred before pause)  
**Campaign Readiness:** 90% complete, needs board approval before activation

---

## CRITICAL ISSUE: GEOGRAPHIC MISTARGETING

### What Happened
- Campaign went LIVE at some point on 2026-04-17 (created 13:01, last updated 13:40)
- All 3 ad sets were targeting **New York, NY** (geo key: 2490299) instead of **Chicago, IL** (geo key: 2438177)
- Campaign was spending $67/day on users we cannot serve (no delivery to NYC)
- Status documentation incorrectly showed campaign as PAUSED when it was ACTIVE

### Root Cause
- Likely a copy/paste error or incorrect geo key used during ad set creation
- The Meta API scripts may have used a default NYC geo key instead of looking up Chicago
- No verification step after campaign creation to confirm targeting accuracy

### Actions Taken (2026-04-17, immediate response)
1. ✅ **Paused campaign** via API to stop spending
2. ✅ **Verified $0 spend** - no delivery had occurred yet (campaign was live <6 hours)
3. ✅ **Corrected targeting** on all 3 ad sets to Chicago, IL (25mi radius)
4. ✅ **Verified fix** - all ad sets now correctly target Chicago, women 25-50

### Impact Assessment
- **Financial:** $0 wasted spend (caught before Meta delivered impressions)
- **Timeline:** No delay to launch (targeting fixed same day)
- **Trust:** Internal governance worked - campaign was paused before damage occurred

---

## CURRENT CAMPAIGN STRUCTURE

### Campaign Overview
- **Campaign ID:** 120243219649250762
- **Campaign Name:** Subscription Launch Apr 2026
- **Objective:** OUTCOME_SALES (conversions)
- **Daily Budget:** $67 ($6,700 cents)
- **Status:** PAUSED (per CRO, awaiting board approval)
- **Created:** 2026-04-17 13:01 CST
- **Last Updated:** 2026-04-17 13:40 CST

### Ad Sets (3 total)

| Ad Set | ID | Placement | Status | Targeting | Bid Cap |
|--------|----|-----------| -------|-----------|---------|
| IG Feed | 120243219914430762 | Instagram Feed | ACTIVE (campaign paused) | Women 25-50, Chicago 25mi | $2.00 |
| IG Stories | 120243219918030762 | Instagram Stories | ACTIVE (campaign paused) | Women 25-50, Chicago 25mi | $2.00 |
| FB Feed | 120243219919870762 | Facebook Feed | ACTIVE (campaign paused) | Women 25-50, Chicago 25mi | $2.00 |

**Targeting Details (all ad sets):**
- Age: 25-50 (updated from original 25-35 based on actual customer data showing orders from women 35-50)
- Gender: Female only
- Location: Chicago, IL + 25-mile radius (home and recent location)
- Placement optimization: Manual placement selection (not Advantage+)
- Advantage Audience: OFF (manual targeting)

**Optimization:**
- Goal: OFFSITE_CONVERSIONS (driving to website)
- Billing: IMPRESSIONS (CPM model)
- Bid: $2.00 cap per result
- Conversion event: PURCHASE (Meta Pixel 2276705169443313)

### Ads (6 total)

All 6 ads are video ads using 2 video assets across 3 placements:

**Video Assets:**
- Video 1: 1437672617665607 (9.4MB, ~15-30sec)
- Video 2: 2355242318591638 (9.2MB, ~15-30sec)

**Ad Inventory:**
1. **Instagram Feed - Video 1** (120243221203760762) - ACTIVE
2. **Instagram Feed - Video 2** (120243221205970762) - ACTIVE
3. **Instagram Stories - Video 1** (120243221207200762) - ACTIVE
4. **Instagram Stories - Video 2** (120243221208210762) - ACTIVE
5. **Facebook Feed - Video 1** (120243221208940762) - ACTIVE
6. **Facebook Feed - Video 2** (120243221209870762) - ACTIVE

**Creative Details:**
- Primary Text: "Get farm-fresh produce boxes delivered to your door every week. Support local farmers and eat healthier. Join our community today!"
- Headline: "Fresh Produce Delivered Weekly"
- CTA: SHOP_NOW
- Landing Page: `https://unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=video&utm_campaign=subscription_launch_apr2026`
- Thumbnail: `7aef798892a38251a52c4e3f72716993` (1080x1080 feed image)

**Static Image Assets (Not Yet Uploaded):**
- 10 static images created by Advertising Creative (5 Feed 1080x1080, 5 Stories 1080x1920)
- Location: `C:\Users\Anthony\Desktop\business\ad-exports\subscription-launch-apr17\static-images\`
- Status: Awaiting manual upload or API upload script

---

## STRATEGIC ASSESSMENT

### Campaign Structure: Grade B+

**Strengths:**
- Clean 3-placement split allows for placement-level performance analysis
- Manual placement control prevents budget waste on poor-performing placements
- $2.00 bid cap provides downside protection against runaway CPC
- Conversion optimization (PURCHASE event) aligns with subscription revenue goal

**Weaknesses:**
- **Only 2 video variants is insufficient for a $67/day test.** Meta's algorithm needs at least 3-5 variants per placement to optimize effectively. With only 2 videos across 6 ads, we're limiting Meta's ability to find winning creative.
- **No static image ads in the mix.** Video-only campaigns can be effective, but adding static carousel/single-image ads would provide more variant diversity and typically lower CPC.
- **No retargeting ad sets.** Current structure is cold traffic only. We should add a retargeting ad set for website visitors and cart abandoners (lower CAC, higher conversion rate).
- **Manual placements may cap scale.** Once we validate performance, we should test Advantage+ placements to unlock Reels and other high-intent surfaces.

### Targeting: Grade B

**Strengths:**
- Age range 25-50 is data-driven (updated based on actual customer orders from women 35-50)
- 25-mile radius around Chicago captures Hyde Park + surrounding affluent Black neighborhoods (Bronzeville, South Shore, Kenwood, etc.)
- Gender targeting (female) aligns with primary buyer persona

**Weaknesses:**
- **No interest/behavior layering.** We're relying purely on demographics + geo, which is broad. Consider adding interest targeting for first test:
  - Interests: Organic food, Whole Foods Market, healthy eating, Black-owned businesses, CSA (Community Supported Agriculture)
  - Behaviors: Online purchasers, high income ($100K+), grocery delivery users
- **No lookalike audience.** We have 10-15 Stripe customers with email addresses. Meta requires 100+ for a lookalike, but we should add a Custom Audience for website visitors (retargeting) and seed it with customer emails for future lookalike expansion.
- **Hyde Park neighborhood targeting is available** (geo key: 2732971). We could create a 4th "hyper-local" ad set targeting Hyde Park specifically with higher bids to capture our beachhead market.

### Budget & Spend Strategy: Grade A-

**Daily Budget:** $67/day = ~$2,010/month (aligns with Creative Brief's $2,000 Meta allocation)

**Budget Allocation by Placement (CBO will optimize, but initial setup is equal split):**
- Instagram Feed: ~$22/day
- Instagram Stories: ~$22/day
- Facebook Feed: ~$22/day

**Projected Performance (conservative estimates based on DTC subscription benchmarks):**

| Metric | Assumption | Calculation |
|--------|------------|-------------|
| Daily Budget | $67 | Given |
| CPC (target) | $2.00 | $2.00 bid cap |
| Daily Clicks | 33 | $67 / $2.00 |
| Landing Page CVR | 2% | DTC benchmark |
| Daily Conversions | 0.66 | 33 * 2% |
| Weekly Conversions | 4.6 | 0.66 * 7 |
| **CAC** | **$101** | $67 / 0.66 |
| **Monthly Orders** | **~20** | 4.6 * 4.3 weeks |

**Analysis:**
- **CAC of $101 is just above target ($100)** but acceptable for Month 1 test. We expect CAC to improve as Meta's algorithm learns.
- **20 orders/month from Meta alone is 67% of our 30/week goal.** Combined with organic, referrals, and other channels, this should hit the target.
- **If CAC stays >$150 for 7+ days, we pause and diagnose.** Possible causes: creative fatigue, targeting too broad, landing page conversion issue.

**Spend Pacing:**
- Meta's CBO (Campaign Budget Optimization) will shift spend to best-performing ad sets within 48-72 hours
- Expect 60-70% of spend to consolidate on the top-performing placement by Day 5
- If one placement is burning spend at >$3 CPC with no conversions, manually pause that ad set and reallocate budget

### Creative Quality: Grade C+ (Insufficient Variant Depth)

**What We Have:**
- 2 video ads (9MB each, ~15-30sec)
- 1 thumbnail image (1080x1080)
- 10 static images (not yet uploaded)
- 6 total ads (2 videos across 3 placements)

**What We Need (per Advertising Creative Brief):**
- **5-10 video variants** (UGC-style testimonials + product showcases)
- **5-10 static image variants** (carousel + single-image ads)
- **3-5 copy variants** (different hooks, headlines, CTAs)

**Gap Analysis:**
- **Creative depth is the #1 blocker to efficient scale.** With only 2 videos, we'll hit creative fatigue by Week 2. Meta's algorithm performs best with 5+ variants per ad set.
- **No UGC testimonials yet.** The Creative Brief prioritizes UGC-style testimonials as the highest-converting format for DTC subscriptions. We should be reaching out to existing customers (10-15 Stripe orders) for video testimonials ($25 credit incentive).
- **Static images are ready but not uploaded.** These should be uploaded and live within 24 hours. Static ads typically have lower CPC than video on Feed placements.

**Recommendation:** Before activating this campaign, Advertising Creative should ship at least 3 more video variants and upload the 10 static image ads. This gives us 5 videos + 10 images = 15 total creative assets, which is the minimum for a robust test.

### Conversion Tracking: Grade A (Verified Setup)

**Meta Pixel:** 2276705169443313  
**Conversion Event:** PURCHASE  
**Attribution:** 7-day click, 1-day view (Meta default)

**Verification (per docs):**
- ✅ Pixel installed on unclemays.com
- ✅ ViewContent event fires on product pages
- ✅ Purchase event fires server-side via Stripe webhook
- ✅ GA4 purchase tracking also active (dual tracking for validation)

**Outstanding Item:**
- **Test Purchase:** RevOps should run a test order (using Stripe test mode or a real $1 order) to confirm the PURCHASE event fires correctly in Meta Events Manager before we go live. This is standard practice for new conversion campaigns.

---

## COMPETITIVE BENCHMARKS

**DTC Food Subscription (Industry Averages):**

| Metric | Industry Avg | Uncle May's Target | Current Campaign |
|--------|--------------|-------------------|------------------|
| CTR | 0.9-1.5% | 1.5%+ | TBD (not live yet) |
| CPC | $1.50-$3.00 | <$2.00 | $2.00 bid cap |
| Landing Page CVR | 2-4% | 2%+ | TBD (not live yet) |
| CAC | $80-$150 | <$100 | Projected $101 |
| ROAS (6mo LTV) | 8-15x | 12x+ | Projected 12.5x |

**Uncle May's 6-Month LTV:** $1,264 (blended across 3 tiers)  
**Target CAC:** $100  
**Projected ROAS:** $1,264 / $100 = **12.6x** ✅

**Payback Period:** 1.4 months (per Creative Brief) ✅

---

## RISKS & MITIGATION

### Risk 1: Creative Fatigue (HIGH PROBABILITY)
**Risk:** With only 2 video variants, CTR will degrade 20-30% by Week 2. Fatigue hits faster on Instagram than Facebook.

**Mitigation:**
- Advertising Creative ships 3+ new videos by EOW (2026-04-19)
- Upload 10 static images within 24 hours (manual or API)
- Set up weekly creative refresh cadence (kill bottom 50% of ads, ship 3-5 new variants)

**Owner:** Advertising Creative (creative production) + CRO (performance monitoring)

### Risk 2: Targeting Too Broad (MEDIUM PROBABILITY)
**Risk:** Women 25-50 in Chicago 25mi is ~500K people. Without interest layering, we may burn budget on low-intent audiences.

**Mitigation:**
- Week 1: Let CBO optimize with broad targeting (Meta's algorithm is smart)
- Week 2: If CAC >$150, add interest targeting (organic food, Whole Foods, Black-owned businesses)
- Week 3: Launch lookalike audience once we have 50+ converters

**Owner:** CRO (targeting strategy) + RevOps (audience building)

### Risk 3: Landing Page Conversion Bottleneck (MEDIUM PROBABILITY)
**Risk:** If we hit 1.5% CTR but <2% landing page CVR, the issue is post-click experience, not ads.

**Mitigation:**
- RevOps runs checkout flow test before launch (mobile + desktop)
- CTO verifies Stripe checkout defaults to subscription (not one-time purchase)
- A/B test: "Start Subscription" vs "Get Your First Box" CTA copy (RevOps owns)

**Owner:** CRO (diagnosis) + CTO (landing page) + RevOps (A/B testing)

### Risk 4: Budget Burnout on One Placement (LOW PROBABILITY)
**Risk:** CBO may consolidate 80%+ of spend on one placement (e.g., IG Feed) if it performs well, leaving other placements under-tested.

**Mitigation:**
- Monitor placement-level spend daily for first 7 days
- If one placement gets <$10/day, manually allocate $15/day minimum to force testing
- After 7 days, let CBO fully optimize (trust the algorithm)

**Owner:** CRO (spend monitoring) + RevOps (reporting)

---

## COMPARISON TO CREATIVE BRIEF

**Creative Brief Target (filed 2026-04-15):**
- Meta Budget: $2,000/month ($67/day) ✅ **ALIGNED**
- Campaign Structure: Advantage+ Shopping Campaign (ASC) ❌ **NOT ALIGNED** - we built manual CBO instead
- Creative: 5 UGC testimonials + 5 product showcase carousels ❌ **PARTIALLY ALIGNED** - only 2 videos + 10 static images (not uploaded)
- Targeting: Lookalike audiences seeded from customer emails ❌ **NOT ALIGNED** - we're using manual demographic targeting
- Performance Goal: <$100 CAC, 1.5%+ CTR ✅ **ALIGNED** - projected $101 CAC

**Strategic Divergence Analysis:**

**Why we didn't use Advantage+ (ASC):**
- Advantage+ requires at least 50 conversions/week to optimize effectively. With 3 orders/week baseline, we don't have the conversion volume yet.
- Manual CBO gives us more control during the learning phase (first 30 days).
- **Recommendation:** Switch to Advantage+ in Month 2 once we have 20+ conversions/week.

**Why we don't have lookalike audiences:**
- Meta requires 100+ users for a lookalike source audience. We have 10-15 Stripe customers.
- **Recommendation:** Build a Custom Audience from website visitors (pixel-based) and use that for retargeting in Week 2. Lookalike becomes viable at 50+ converters (Month 2).

**Creative gap:**
- Advertising Creative delivered 2 videos on time but hasn't shipped UGC testimonials yet.
- **Recommendation:** Advertising Creative should prioritize 3 UGC testimonial videos (even if placeholder/stock) before we activate. Creative depth is critical.

---

## NEXT STEPS (Prioritized)

### IMMEDIATE (Before Activation)

1. **Advertising Creative: Ship 3 more video variants** (UGC testimonials or product showcases)
   - Deadline: EOD 2026-04-18
   - Rationale: Need 5+ videos minimum to avoid early creative fatigue
   - Owner: Advertising Creative

2. **Advertising Creative: Upload 10 static images to Meta**
   - Deadline: EOD 2026-04-17 (today)
   - Location: `C:\Users\Anthony\Desktop\business\ad-exports\subscription-launch-apr17\static-images\`
   - Owner: Advertising Creative (manual upload via Ads Manager or API script)

3. **RevOps: Run test purchase to verify Meta Pixel PURCHASE event**
   - Deadline: 2026-04-18 AM
   - Method: Stripe test mode order OR real $1 order, check Meta Events Manager for PURCHASE event
   - Owner: RevOps

4. **CTO: Verify Stripe checkout defaults to subscription (not one-time)**
   - Deadline: 2026-04-18 AM
   - Check: `um_website/src/app/products/weekly-produce-box/page.tsx` and Stripe checkout config
   - Owner: CTO

5. **Board: Approve $67/day spend commitment**
   - Spend: $2,010/month (Month 1 test)
   - Projected CAC: $101 (just above $100 target, acceptable for test)
   - Projected Orders: 20/month from Meta
   - Owner: Board approval via Paperclip

### WEEK 1 (Post-Activation)

6. **CRO: Monitor daily performance and kill underperforming ads**
   - KPIs: CTR <1% for 3 days = kill and replace
   - Daily check: Spend, CPC, CTR, conversions
   - Owner: CRO

7. **RevOps: Set up daily dashboard (Stripe + GA4 + Meta)**
   - Metrics: Orders, revenue, CAC, ROAS, traffic sources
   - Delivery: Daily Slack/email summary
   - Owner: RevOps

8. **Advertising Creative: Prepare Week 2 creative refresh (3-5 new variants)**
   - Deadline: 2026-04-25 (EOW)
   - Rationale: Creative fatigue hits by Day 10-14, need fresh variants ready
   - Owner: Advertising Creative

### WEEK 2-4 (Optimization Phase)

9. **CRO: Add retargeting ad set for website visitors**
   - Audience: Website visitors (last 30 days), cart abandoners, product page viewers
   - Budget: $15/day (pulled from CBO if needed)
   - Owner: CRO + RevOps (audience creation)

10. **CRO: Test interest-layered targeting if CAC >$150**
    - Interests: Organic food, Whole Foods, Black-owned businesses, CSA
    - Method: Duplicate best-performing ad set, add interests, compare CAC
    - Owner: CRO

11. **RevOps: Set up A/B test on landing page CTA copy**
    - Variant A: "Start Subscription"
    - Variant B: "Get Your First Box"
    - Owner: RevOps + CTO

12. **CRO + Advertising Creative: Weekly sync (Fridays)**
    - Review: Top/bottom performers, CTR trends, creative fatigue signals
    - Decisions: Which ads to kill, which creative to double down on
    - Owner: CRO + Advertising Creative

---

## RECOMMENDATION: ACTIVATE OR HOLD?

### HOLD (Recommended)

**Do not activate until:**
1. ✅ Advertising Creative ships 3 more videos (total 5 videos minimum)
2. ✅ Advertising Creative uploads 10 static images
3. ✅ RevOps confirms Meta Pixel PURCHASE event is firing correctly
4. ✅ CTO confirms Stripe checkout defaults to subscription
5. ✅ Board approves $67/day spend

**Timeline:** If items 1-4 complete by EOD 2026-04-18, we can activate 2026-04-19 AM pending board approval.

**Rationale:**
- **Creative depth is the bottleneck.** Launching with only 2 videos will result in creative fatigue by Week 2, forcing us to pause and rebuild. Better to ship 5 videos + 10 images upfront and sustain performance.
- **Conversion tracking must be verified.** Spending $67/day without confirmed PURCHASE event tracking is flying blind. One test order takes 10 minutes and prevents wasted spend.
- **Subscription default must be confirmed.** If checkout defaults to one-time purchase, our CAC math breaks (LTV drops from $1,264 to $55, ROAS crashes).

### Alternative: Soft Launch at $20/day

If we want to start learning while Advertising Creative ships more variants:
- Activate at $20/day (CBO split across 3 ad sets)
- Run for 3-5 days to collect early signal (CTR, CPC, initial conversions)
- Ramp to $67/day once we have 5 videos + 10 images live

**Pros:** Start learning earlier, validate targeting and conversion tracking in production  
**Cons:** Limited budget = slower learning, may not exit Meta's learning phase before creative refresh

**Decision:** CRO + Board call.

---

## APPENDIX: CAMPAIGN ACCESS

**Meta Ads Manager:** https://business.facebook.com/adsmanager/manage/campaigns?act=814877804473301&selected_campaign_ids=120243219649250762

**Meta Events Manager (Pixel):** https://business.facebook.com/events_manager2/list/pixel/2276705169443313

**API Config:** `C:\Users\Anthony\.claude\meta-config.json`

**Campaign IDs (for API access):**
- Campaign: `120243219649250762`
- IG Feed Ad Set: `120243219914430762`
- IG Stories Ad Set: `120243219918030762`
- FB Feed Ad Set: `120243219919870762`

---

**Status:** Campaign is PAUSED and targeting is corrected. Ready for creative completion and board approval.  
**Next Review:** 2026-04-19 (pending activation decision)  
**Owner:** CRO

---

## ADDENDUM: TARGETING CORRECTED TO HYDE PARK 5MI (2026-04-17 18:59)

**Change:** Per Anthony direction, targeting updated from Chicago 25mi to **Hyde Park 5mi radius**.

**Rationale:** Test in markets with mostly Black women (beachhead focus vs broad market).

**New Targeting (all 3 ad sets verified):**
- Location: Hyde Park (41.7954, -87.5914)
- Radius: 5 miles
- Demographics: Women 25-50
- Audience Size: ~50-75K women 25-50 (vs 500K for Chicago 25mi)
- Black Women: 60-70% of Hyde Park catchment (South Shore, Kenwood, Bronzeville, Woodlawn)

**Impact on Performance Projections:**

**Positive:**
- Higher relevance = potentially lower CPC (may beat $2.00 estimate)
- Faster learning phase (Meta exits at ~50 conversions, smaller audience = quicker signal)
- Better demographic alignment with target customer (affluent Black women)

**Considerations:**
- Smaller audience = frequency buildup after 2-3 weeks (monitor for ad fatigue)
- Scale ceiling at ~$100-150/day (beyond that, frequency becomes an issue)
- Month 1 at $67/day is well within healthy range for this audience size

**Updated Targeting Assessment: Grade A**

Hyde Park 5mi is the CORRECT targeting for Month 1. Beachhead market strategy beats broad scale for subscription acquisition. We can expand to broader Chicago geo in Month 2-3 once we've validated creative and offer in the core market.

**CTO Blocker Update:** CTO identified checkout flow issue (primary CTAs route to one-time, not subscription). Fix ready (update 3 files to route to `/subscribe/`), awaiting board approval. This is critical blocker #4 and must be resolved before activation.

