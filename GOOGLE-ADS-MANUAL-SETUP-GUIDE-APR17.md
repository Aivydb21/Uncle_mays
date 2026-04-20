# Google Ads Manual Setup Guide — Subscription Launch

**Campaign:** Uncle May's Produce Box Subscription  
**Budget:** $1,000/month total ($33/day split across 3 campaigns)  
**Launch:** April 17, 2026  
**Time required:** 15-20 minutes

---

## BEFORE YOU START

**What you need:**
- Access to Google Ads: https://ads.google.com
- Customer ID: `6015592923`
- Creative assets: `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/static-images/`
- Video assets: `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`
- Copy assets: `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/google-performance-max-copy.md`

**Why manual setup:**
- Google Ads API has 403 permission error (USER_PERMISSION_DENIED)
- Manual setup is faster than troubleshooting permissions (15 min vs 1+ hours)

---

## CAMPAIGN STRUCTURE

You'll create 3 campaigns:

1. **Performance Max** ($600/month, $20/day) — 70% of budget, automated
2. **Search** ($300/month, $10/day) — 30% of budget, high-intent keywords
3. **YouTube** ($100/month, $3/day) — 10% of budget, video ads (OPTIONAL if time allows)

---

## CAMPAIGN 1: PERFORMANCE MAX (10 min)

### Step 1: Create Campaign

1. Go to Google Ads: https://ads.google.com

2. Click **+ New Campaign**

3. **Campaign objective:** Sales

4. **Conversion goals:** Select "Purchase" (should auto-select if conversion tracking is set up)

5. **Campaign type:** Performance Max

6. **Campaign name:** `Subscription Launch - PMax - Apr 2026`

7. Click **Continue**

### Step 2: Campaign Settings

**Budget & bidding:**
- **Daily budget:** $20
- **Bidding:** Maximize conversions
- **Target CPA:** Leave blank initially (let Google learn)

**Campaign settings:**
- **Start date:** Today (April 17)
- **End date:** None (ongoing)
- **Ad schedule:** All days, all hours (24/7)

**Locations:**
- **Target:** United States > Illinois > Chicago
  - Or use radius: 25 miles from `5500 S Lake Park Ave, Chicago, IL 60637`

**Languages:** English

**Final URL expansion:** OFF (we want tight control on landing pages)

**Brand exclusions:** None

Click **Next**

### Step 3: Create Asset Group

**Asset group name:** `Subscription Launch - Apr 2026`

**Final URL:** 
```
https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP
```

**Display path:** `unclemays.com/produce-boxes` (optional, for vanity)

**Call-to-action:** Subscribe Now

---

### Step 4: Upload Images (15 images)

Click **+ Images**

Upload all 15 Performance Max images from `ad-exports/subscription-launch-apr17/static-images/`:

**Landscape (1200x628) — 5 images:**
- `pmax_landscape_hero_value_1200x628.png`
- `pmax_landscape_cultural_1200x628.png`
- `pmax_landscape_subscription_1200x628.png`
- `pmax_landscape_social_proof_1200x628.png`
- `pmax_landscape_offer_1200x628.png`

**Square (1080x1080) — 5 images:**
- `pmax_square_product_hero_1080x1080.png`
- `pmax_square_subscription_value_1080x1080.png`
- `pmax_square_cultural_1080x1080.png`
- `pmax_square_price_anchor_1080x1080.png`
- `pmax_square_blackowned_1080x1080.png`

**Portrait (1080x1350) — 5 images:**
- `pmax_portrait_mobile_hero_1080x1350.png`
- `pmax_portrait_value_stack_1080x1350.png`
- `pmax_portrait_cultural_pride_1080x1350.png`
- `pmax_portrait_offer_1080x1350.png`
- `pmax_portrait_subscription_simplicity_1080x1350.png`

**Google will automatically crop/resize** these images for different placements (Display, Gmail, Discover, YouTube, Search).

---

### Step 5: Upload Videos (OPTIONAL — 3 videos)

Click **+ Videos**

Upload all 3 videos from `ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`:
- `01- Don Johnson Sample.mp4`
- `Don Johnson Sample (a).mp4`
- `Don Johnson Sample (b).mp4`

**Note:** These videos are 29-82MB (under Google's 100MB limit, OK to upload).

If videos are too large or upload is slow, **SKIP FOR NOW** and add later.

---

### Step 6: Add Text Assets

**Headlines (short, max 30 chars) — Add all 5:**
1. `Fresh Produce, Delivered Weekly`
2. `Black-Owned Grocery, Chicago`
3. `Subscribe From $30/Week`
4. `Premium Greens, Weekly`
5. `Join 500+ Chicago Families`

**Long Headlines (max 90 chars) — Add all 5:**
1. `Subscribe to Chicago's #1 Produce Box for Black Families`
2. `Fresh Greens, Okra, Yams Delivered Every Week`
3. `Black-Owned, Chicago-Based, Culturally Specific Produce`
4. `From $30/Week, Cancel Anytime, First Box This Thursday`
5. `Premium Produce Subscription for Hyde Park Families`

**Descriptions (max 90 chars) — Add all 5:**
1. `Premium produce boxes for Black families. Greens, okra, yams, and more.`
2. `Subscription grocery from Black farmers. Delivered every Thursday.`
3. `Skip the store. Get restaurant-quality produce at home.`
4. `Started by a Chicago Booth grad, trusted by Hyde Park.`
5. `The produce box you've been looking for. Subscribe in 2 minutes.`

**Business name:** `Uncle May's Produce`

**Call-to-action:** Subscribe Now (already selected above)

---

### Step 7: Audience Signals (OPTIONAL)

Help Google's algorithm by providing signals about who to target:

**Demographics:**
- Age: 25-34, 35-44
- Gender: Female
- Parental status: Parent
- Household income: Top 30%

**Interests & behaviors:**
- Foodies
- Healthy Living Enthusiasts
- Organic & Natural Products
- Sustainability Advocates

**IMPORTANT:** These are signals, not hard targeting. Google will expand beyond these if it finds better converters.

Click **Next**

---

### Step 8: Review and Publish

**Pre-launch checklist:**
- [ ] Budget: $20/day
- [ ] 15 images uploaded
- [ ] 5 headlines, 5 long headlines, 5 descriptions added
- [ ] Final URL includes UTM parameters
- [ ] Call-to-action: Subscribe Now
- [ ] Campaign status: **Enabled** (toggle ON to start immediately)

Click **Publish Campaign**

**Performance Max will enter "Learning" phase** for 7-14 days. Expect volatile performance while Google optimizes.

---

## CAMPAIGN 2: SEARCH (5 min)

### Step 1: Create Search Campaign

1. Click **+ New Campaign**

2. **Objective:** Sales

3. **Campaign type:** Search

4. **Campaign name:** `Subscription Launch - Search - Apr 2026`

5. Click **Continue**

### Step 2: Campaign Settings

**Budget & bidding:**
- **Daily budget:** $10
- **Bidding:** Maximize conversions
- **Target CPA:** Leave blank

**Networks:**
- ✅ Google search
- ✅ Search partners
- ❌ Display Network (uncheck)

**Locations:** Chicago, IL (25 mile radius from Hyde Park)

**Languages:** English

**Start date:** Today

Click **Save and continue**

### Step 3: Create Ad Group #1 — Branded

**Ad group name:** `Branded - Uncle Mays`

**Keywords (Exact Match):**
```
[uncle may's produce]
[uncle mays produce]
[uncle may's chicago]
[uncle mays grocery]
```

**Match type:** Exact match (brackets = only show for these exact searches)

**Default bid:** $1.50 (Google will auto-optimize with Maximize Conversions)

### Step 4: Create Ad #1 — Branded

**Headline 1:** `Uncle May's Produce Box`  
**Headline 2:** `Black-Owned Grocery | Chicago`  
**Headline 3:** `Subscribe From $30/Week`

**Description 1:** `Fresh greens, okra, yams delivered every Thursday. Culturally specific produce for Black families. Subscribe in 2 minutes.`

**Description 2:** `Trusted by 500+ Chicago families. Use code FREESHIP for $10 off your first box. Cancel anytime.`

**Final URL:**
```
https://unclemays.com?utm_source=google&utm_medium=cpc&utm_campaign=subscription_launch_apr2026&utm_content=branded&promo=FREESHIP
```

**Display path:** `unclemays.com/subscribe`

Click **Done**

---

### Step 5: Create Ad Group #2 — Produce Box

**Ad group name:** `Produce Box Chicago`

**Keywords (Phrase Match):**
```
"produce box chicago"
"produce delivery chicago"
"fresh produce box"
"produce subscription chicago"
"weekly produce box"
```

**Match type:** Phrase match (quotes = show for searches containing these phrases)

**Default bid:** $2.00

### Step 6: Create Ad #2 — Produce Box

**Headline 1:** `Fresh Produce Box | Chicago`  
**Headline 2:** `Delivered Every Thursday`  
**Headline 3:** `From $30/Week | Black-Owned`

**Description 1:** `Subscribe to Chicago's #1 produce box for Black families. Greens, okra, yams, and more. Restaurant-quality, culturally specific.`

**Description 2:** `$10 off first box with code FREESHIP. Cancel anytime. Started by a Chicago Booth grad, trusted by Hyde Park.`

**Final URL:**
```
https://unclemays.com?utm_source=google&utm_medium=cpc&utm_campaign=subscription_launch_apr2026&utm_content=produce_box&promo=FREESHIP
```

**Display path:** `unclemays.com/produce-box`

---

### Step 7: Create Ad Group #3 — Black-Owned Grocery

**Ad group name:** `Black Owned Grocery Chicago`

**Keywords (Phrase Match):**
```
"black owned grocery chicago"
"black owned business chicago"
"african american grocery store"
"black farmers market chicago"
```

**Default bid:** $2.50 (expect higher competition for these terms)

### Step 8: Create Ad #3 — Black-Owned

**Headline 1:** `Black-Owned Grocery | Chicago`  
**Headline 2:** `Supporting Black Farmers`  
**Headline 3:** `Produce Delivered Weekly`

**Description 1:** `Uncle May's is Black-owned, Chicago-based, and sources from Black farmers. Subscribe for weekly produce delivery. $30-$75/week.`

**Description 2:** `For us, by us. Fresh greens, okra, yams, plantains. Use code FREESHIP for $10 off your first box.`

**Final URL:**
```
https://unclemays.com?utm_source=google&utm_medium=cpc&utm_campaign=subscription_launch_apr2026&utm_content=black_owned&promo=FREESHIP
```

**Display path:** `unclemays.com`

---

### Step 9: Negative Keywords

Add these negative keywords at the campaign level to avoid wasted spend:

```
-free
-cheap
-discount (unless we're running a promo)
-coupons
-DIY
-recipes
-"how to grow"
-wholesale
-bulk (we're not B2B yet)
-catering
```

**Why:** Prevents ads from showing for searches like "free produce box" or "wholesale produce chicago" which won't convert.

---

### Step 10: Review and Publish

**Search campaign structure:**
- ✅ 3 ad groups (Branded, Produce Box, Black-Owned Grocery)
- ✅ 3 ads (1 per ad group, 3 headlines + 2 descriptions each)
- ✅ ~12 keywords total (mix of exact and phrase match)
- ✅ Negative keywords set
- ✅ Budget: $10/day
- ✅ UTM tracking on all URLs

Click **Publish Campaign**

---

## CAMPAIGN 3: YOUTUBE (OPTIONAL — 5 min)

**Skip if short on time.** This is 10% of budget and can be added later.

### Step 1: Create Video Campaign

1. Click **+ New Campaign**

2. **Objective:** Sales

3. **Campaign type:** Video

4. **Campaign name:** `Subscription Launch - YouTube - Apr 2026`

5. **Budget:** $3/day

6. **Bidding:** Maximum CPV (cost per view)

7. **Locations:** Chicago, IL (25 mile radius)

8. **Languages:** English

9. Click **Continue**

### Step 2: Upload Videos

Upload all 3 videos from `ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`:
- `01- Don Johnson Sample.mp4` (76MB)
- `Don Johnson Sample (a).mp4` (29MB)
- `Don Johnson Sample (b).mp4` (82MB)

**Ad format:** In-stream skippable (plays before YouTube videos, viewer can skip after 5 seconds)

### Step 3: Add Ad Copy

**Headline:** `Fresh Produce Delivered | Chicago`

**Description:** `Subscribe to Uncle May's produce box. Black-owned, culturally specific. From $30/week.`

**Call-to-action:** Subscribe

**Final URL:**
```
https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=subscription_launch_apr2026&utm_content=youtube_skippable&promo=FREESHIP
```

### Step 4: Targeting

**Demographics:**
- Age: 25-44
- Gender: Female
- Parental status: Parent

**Interests:**
- Foodies
- Health & Fitness Buffs
- Green Living Enthusiasts

**Placements (OPTIONAL):**
- Target specific YouTube channels: Food Network, Bon Appétit, Tasty, cooking vlogs
- Or let Google auto-optimize (recommended for Week 1)

Click **Publish Campaign**

---

## POST-LAUNCH: VERIFY TRACKING (5 min)

### Check Google Ads Conversion Tracking

1. Go to **Tools & Settings** > **Measurement** > **Conversions**

2. Verify "Purchase" conversion action is set up:
   - Source: Website
   - Conversion name: Purchase
   - Value: Use transaction-specific value (Stripe will pass this)
   - Count: Every conversion

3. If not set up: Contact CTO to install Google Ads conversion tag on checkout confirmation page

### Check GA4 Integration

1. Go to **Tools & Settings** > **Linked accounts** > **Google Analytics**

2. Verify GA4 property is linked

3. Test UTM tracking:
   - Copy one of the final URLs from above
   - Paste in browser, load unclemays.com
   - Go to GA4 > Realtime > Traffic acquisition
   - Should see: `google / pmax` or `google / cpc` or `google / video`

### Test Promo Code

1. Go to unclemays.com

2. Add a subscription box to cart

3. Go to checkout

4. Enter promo code: `FREESHIP`

5. Verify $10 discount applies

**If promo code doesn't work:** Contact CTO/CFO to activate in Stripe.

---

## MONITORING & OPTIMIZATION (WEEK 1)

### Daily Checks (5 min/day)

1. Go to Google Ads > **Campaigns**

2. Check:
   - **Spend:** Are we at ~$33/day total? ($20 PMax + $10 Search + $3 YouTube)
   - **Impressions:** At least 500-1,000/day across all campaigns
   - **Clicks:** At least 10-20/day (CTR target: 1.5%+)
   - **Conversions:** 1-2 purchases in first week (will ramp up)

3. Check **Search Terms** report (Search campaign):
   - Are queries relevant? (e.g., "produce box chicago" = good, "free produce" = bad)
   - Add irrelevant terms to negative keywords

### Red Flags (Pause Campaign If)

- **No impressions after 2 hours:** Check campaign status, budget, targeting
- **CTR <0.5% after 48 hours:** Creative or targeting mismatch
- **CPC >$5.00 consistently:** Bidding too high, switch to Target CPA
- **No conversions after 1 week at $33/day:** Landing page issue, offer issue, or tracking broken

### Week 1 Benchmarks

**Performance Max:**
- Impressions: 10,000-15,000
- Clicks: 150-300 (1.5% CTR)
- CPC: $1.50-$2.50
- Conversions: 3-5 purchases
- CPA: $80-$120 (will improve in Week 2-3)

**Search:**
- Impressions: 500-1,000
- Clicks: 15-30 (2-3% CTR on branded, 1-2% on non-branded)
- CPC: $2.00-$4.00
- Conversions: 1-2 purchases

**YouTube:**
- Impressions: 50,000-100,000 (video ads get high impressions, low CTR)
- Views: 500-1,000
- CTR: 0.3-0.5% (normal for video)
- Conversions: 0-1 (video is top-of-funnel, expect assisted conversions)

---

## WEEK 2+ OPTIMIZATION

### After 7 Days (End of Learning Phase)

1. **Review Performance Max:**
   - Check Asset Group performance report
   - Identify top 5 and bottom 5 images by clicks/conversions
   - Remove bottom 5, add 5 new images (from Week 2 creative refresh)

2. **Review Search:**
   - Check Search Terms report
   - Add 5-10 new high-performing keywords
   - Add 10-15 new negative keywords
   - Pause underperforming ad groups (CTR <1%)

3. **Review YouTube (if running):**
   - Check Video performance
   - Pause lowest-performing video
   - Add 2 new videos (compressed versions from Meta folder)

### After 14 Days (Optimization Phase)

1. **Set Target CPA:**
   - Calculate actual CPA from Week 1-2 data
   - Set Target CPA at 80% of actual (e.g., if actual CPA = $120, set target = $96)
   - This tells Google to optimize toward lower cost per acquisition

2. **Reallocate Budget:**
   - If Performance Max is crushing it: Increase to $30/day, reduce Search to $5/day
   - If Search is crushing it: Increase to $15/day, keep PMax at $20/day
   - If both are strong: Scale total budget to $50/day, maintain 2:1 ratio

3. **Expand Targeting:**
   - Performance Max: Let Google auto-expand beyond Chicago (if performance is strong)
   - Search: Add Chicago suburbs, Milwaukee, Indianapolis (test expansion)

---

## TROUBLESHOOTING

### "Low search volume" on keywords
**Reason:** Not enough people search for this term.

**Fix:**
- Use Keyword Planner to find similar keywords with higher volume
- Switch from exact match `[keyword]` to phrase match `"keyword"`
- Consider if the keyword is worth keeping (might be too niche)

### "Below first page bid" warning
**Reason:** Your max bid is too low to show on page 1.

**Fix:**
- Increase max bid by $0.50-$1.00
- Or switch to Maximize Conversions (auto-bidding) and let Google handle it

### "Limited by budget"
**Reason:** Campaign could spend more but is hitting daily budget cap.

**Fix:**
- If performance is strong (CPA <$100): Increase budget by 20-30%
- If performance is weak (CPA >$150): Don't increase, optimize creative/targeting first

### "Not delivering" status
**Reason:** Campaign has issues preventing delivery.

**Fix:**
- Check campaign status (might be paused accidentally)
- Check billing (payment method declined?)
- Check ad disapprovals (policy violations)
- Check conversion tracking (if using "Maximize conversions" bid strategy, you need conversion tracking set up)

---

## FILES & RESOURCES

**Creative assets:**
- Static images (15 PMax): `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/static-images/pmax_*`
- Videos (3 for YouTube): `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`

**Copy assets:**
- Headlines, descriptions: `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/google-performance-max-copy.md`

**UTM templates:**
- Performance Max: `?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP`
- Search: `?utm_source=google&utm_medium=cpc&utm_campaign=subscription_launch_apr2026&utm_content={ad_group}&promo=FREESHIP`
- YouTube: `?utm_source=google&utm_medium=video&utm_campaign=subscription_launch_apr2026&utm_content=youtube_skippable&promo=FREESHIP`

**Performance targets:**
- CTR: ≥1.5% (PMax), ≥2% (Search branded), ≥1% (Search non-branded)
- CPC: ≤$2.50 (PMax), ≤$4.00 (Search)
- CPA: <$100
- Week 1 conversions: 3-7 purchases

---

## NEXT STEPS AFTER LAUNCH

### Today (April 17)
- **CRO:** Monitor first 4 hours (impressions, clicks, spend)
- **RevOps:** Verify GA4 tracking and UTM parameters
- **CTO:** Verify Google Ads conversion tag fires on checkout confirmation

### Tomorrow (April 18)
- **RevOps:** Pull first 24-hour performance report
- **CRO:** Identify any immediate issues (low CTR, high CPC, no impressions)

### End of Week 1 (April 24)
- **CRO + Advertising Creative:** Review performance, kill bottom 50% of assets
- **RevOps:** Calculate Week 1 CPA, ROAS, conversion rate
- **CRO:** Decide on Week 2 budget allocation

---

**Prepared by:** CRO  
**Date:** 2026-04-17  
**Time required:** 15-20 minutes  
**Status:** READY TO EXECUTE
