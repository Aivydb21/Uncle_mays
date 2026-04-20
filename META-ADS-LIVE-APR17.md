# Meta Ads Campaign LIVE — April 17, 2026

**Status:** ✅ ACTIVE  
**Campaign ID:** 120243219649250762  
**Activated:** 2026-04-17 19:05 UTC  
**Daily Budget:** $67.00  
**Objective:** Conversions (PURCHASE events)

---

## ALL BLOCKERS CLEARED

### 1. ✅ Checkout Routing Fixed (CTO)
**Issue:** Primary CTAs routed to `/checkout/` (one-time) instead of `/subscribe/` (subscription)  
**Impact:** LTV assumption ($270 over 6 months) required subscription, but one-time would yield $10.38 LTV → negative ROAS

**Fix Implemented:**
- Updated Hero.tsx (line 87): `/checkout/${slug}` → `/subscribe/${slug}`
- Updated MobileCTA.tsx (lines 36, 43, 50): All 3 CTAs → `/subscribe/`
- Updated starter-box/page.tsx (line 22): `/checkout/starter` → `/subscribe/starter`

**Verification:**
- Subscription checkout creates Stripe subscription ✓ (subscribe-intent/route.ts line 104)
- Meta Pixel PURCHASE event fires on order success ✓ (OrderSuccessContent.tsx line 65)
- GA4 purchase tracking active (client + server-side) ✓

**Files Changed:** 3  
**Build Status:** ✅ Successful (Next.js production build completed)

---

### 2. ✅ Static Images Uploaded (CTO)
**Created:** 10 static image ads ready (Advertising Creative delivered Apr 16)  
**Uploaded:** All 10 images uploaded to Meta ad account via API

**Image Hashes:**
- meta_feed_chicago_families: 7aef798892a38251a52c4e3f72716993
- meta_feed_farm_to_table: 0261a48f479da33ca3b6ec06a43b8b45
- meta_feed_grandmas_greens: fdf532a181cd428ffd571067d6a43524
- meta_feed_whats_in_box: b30c99b43c0f6b32f3681fcced9a4156
- meta_feed_zero_hassle: 59d87187461d2c586186c1d4cf051a54
- meta_story_blackowned: 7a5f2fe6e5561b056bbc84bed977b033
- meta_story_convenience: eb13633d8989587a4af0de1e6541b94d
- meta_story_cultural: cbb8515ca47a9cd80be1480422d3b6cc
- meta_story_offer: 8e319a63d28cbf1550eac128797464c2
- meta_story_subscription_value: b9d3bbe9d8055cdd22ede5d6c1ef65a2

**Script:** `scripts/upload-meta-static-images.py`  
**Results:** `meta-static-images-uploaded.json`

---

### 3. ✅ Static Image Ads Created (CTO)
**Created:** 15 new ads (5 per ad set) using uploaded images  
**Total Campaign Ads:** 21 (6 videos + 15 static images)

**Ad Distribution:**
- Instagram Feed: 7 ads (2 videos + 5 static images)
- Instagram Stories: 7 ads (2 videos + 5 static images)
- Facebook Feed: 7 ads (2 videos + 5 static images)

**Ad Creative:**
- Primary Text: "Get farm-fresh produce boxes delivered to your door every week. Support local farmers and eat healthier. Join our community today!"
- Headline: "Fresh Produce Delivered Weekly"
- Description: "Fresh, locally-sourced produce from Chicago-area farms"
- CTA: SHOP_NOW
- Landing Page: unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026

**Script:** `scripts/create-meta-static-ads.py`  
**Results:** `meta-static-ads-created.json`

---

### 4. ✅ Budget Approved (Board)
**Approved:** 2026-04-17 via Paperclip wake comment  
**Amount:** $67/day (~$2,010/month for Month 1 test)  
**Projected CAC:** $101 (just above $100 target, acceptable for learning phase)  
**Projected Orders:** 20/month from Meta alone

---

### 5. ✅ Campaign Activated (CTO)
**Previous Status:** PAUSED  
**New Status:** ACTIVE  
**Activated:** 2026-04-17 19:05 UTC  
**Effective Status:** ACTIVE (confirmed via API)

**Script:** `scripts/activate-meta-campaign.py`

---

## CAMPAIGN CONFIGURATION SUMMARY

### Campaign
- **ID:** 120243219649250762
- **Name:** Subscription Launch Apr 2026
- **Objective:** OUTCOME_SALES (conversions)
- **Daily Budget:** $67.00 (CBO)
- **Optimization:** PURCHASE events (Meta Pixel 2276705169443313)
- **Status:** ACTIVE ✅

### Ad Sets (3 total)
1. **Instagram Feed** (120243219914430762)
   - Placement: Instagram Feed only
   - Targeting: Women 25-50, Hyde Park 5mi radius
   - Bid: $2.00 cap
   - Ads: 7 (2 videos + 5 static images)

2. **Instagram Stories** (120243219918030762)
   - Placement: Instagram Stories only
   - Targeting: Women 25-50, Hyde Park 5mi radius
   - Bid: $2.00 cap
   - Ads: 7 (2 videos + 5 static images)

3. **Facebook Feed** (120243219919870762)
   - Placement: Facebook Feed only
   - Targeting: Women 25-50, Hyde Park 5mi radius
   - Bid: $2.00 cap
   - Ads: 7 (2 videos + 5 static images)

### Targeting
- **Location:** Hyde Park, Chicago (41.7954, -87.5914) + 5 mile radius
- **Demographics:** Women 25-50
- **Audience Size:** ~50-75K (60-70% Black women in catchment)
- **Rationale:** Beachhead market strategy targeting affluent Black women in South Side Chicago neighborhoods (Hyde Park, Kenwood, Bronzeville, South Shore, Woodlawn)

### Conversion Tracking
- **Meta Pixel:** 2276705169443313
- **Conversion Event:** PURCHASE (fires client-side on order success page)
- **Attribution:** 7-day click, 1-day view (Meta default)
- **Additional Tracking:** GA4 purchase events (client + server-side)

---

## PERFORMANCE TARGETS

### Week 1 Success Metrics
- **CTR:** ≥1.5% (DTC subscription benchmark)
- **CPC:** ≤$2.00 (bid cap enforced)
- **CAC:** <$150 (Month 1 acceptable range; target $100 by Month 2)
- **Daily Conversions:** 0.66 avg (20 orders/month target)

### Kill Criteria
- Any ad with CTR <1% for 7 consecutive days → kill and replace
- CAC >$150 for 7+ days → pause and diagnose (creative fatigue, targeting issue, or landing page problem)
- Campaign-level bounce rate >5% → investigate contact list quality

### Creative Refresh Cadence
- **Week 1-2:** Test all 21 variants, identify top performers
- **Week 3:** Kill bottom 50%, ship 5-10 new UGC video variants (Advertising Creative)
- **Week 4+:** Ongoing 2-week refresh cycle

---

## NEXT STEPS (Post-Activation)

### Today (2026-04-17 EOD)
1. ✅ Campaign activated
2. ⏳ **CRO:** Monitor first 4 hours of delivery (check Ads Manager for spend, impressions, clicks)
3. ⏳ **RevOps:** Verify Meta Pixel events firing in Events Manager (ViewContent, InitiateCheckout, Purchase)
4. ⏳ **CRO:** Set up daily performance dashboard (Meta + Stripe + GA4)

### Tomorrow (2026-04-18 AM)
1. **CRO:** Daily review — spend, CTR, CPC, conversions, top/bottom ad performers
2. **RevOps:** Check for first conversion (expected within 24-48 hours)
3. **CRO + Advertising Creative:** Sync if creative fatigue signals appear early

### Week 1 (2026-04-17 to 2026-04-24)
1. **CRO:** Daily monitoring (no changes for first 3 days to let Meta's algorithm learn)
2. **RevOps:** Coordinate with Advertising Creative on Week 2 creative refresh
3. **CRO:** Weekly review meeting (Fridays) with Advertising Creative — decide which ads to kill, which creative to double down on

### Week 2+ (Optimization)
1. **CRO:** Add retargeting ad set for website visitors + cart abandoners ($15/day budget)
2. **CRO:** Test interest-layered targeting if CAC >$150 (organic food, Whole Foods, Black-owned businesses)
3. **Advertising Creative:** Ship 3-5 UGC video testimonials by 2026-04-25
4. **RevOps:** A/B test landing page CTA copy ("Start Subscription" vs "Get Your First Box")

---

## RISK MITIGATION

### Creative Fatigue (Week 2-3)
**Mitigation:** Advertising Creative has UGC video briefs ready. Week 2 refresh will add 5 new variants before fatigue impacts CTR.

### Targeting Too Broad
**Mitigation:** Hyde Park 5mi is narrow and demographic-aligned. If CAC spikes, add interest targeting overlay.

### Landing Page Conversion <2%
**Mitigation:** RevOps runs A/B tests on CTA copy and checkout flow. CTO already fixed subscription routing.

---

## SCRIPTS CREATED

All scripts saved in `scripts/`:
1. `upload-meta-static-images.py` — Upload 10 static images to Meta
2. `create-meta-static-ads.py` — Create 15 static image ads across 3 ad sets
3. `activate-meta-campaign.py` — Unpause campaign and verify status

All results saved as JSON:
- `meta-static-images-uploaded.json`
- `meta-static-ads-created.json`

---

## VIEW CAMPAIGN

**Meta Ads Manager:**  
https://business.facebook.com/adsmanager/manage/campaigns?act=814877604473301&selected_campaign_ids=120243219649250762

**Meta Events Manager (Pixel):**  
https://business.facebook.com/events_manager2/list/pixel/2276705169443313

---

## OWNERSHIP

- **Campaign Management:** CRO
- **Creative Refresh:** Advertising Creative
- **Conversion Tracking:** RevOps
- **Landing Page Optimization:** CTO + RevOps
- **Budget Approval:** Board

---

**Prepared by:** CTO (Agent 3f827c01-38a9-435b-826c-64192188a8cb)  
**Date:** 2026-04-17 19:05 UTC  
**Issue:** UNC-366  
**Status:** ✅ COMPLETE — Campaign is LIVE

---

🎯 **Campaign is running. First conversion expected within 24-48 hours.**
