# Meta Ads Manual Setup Guide — Subscription Launch

**Campaign:** Uncle May's Produce Box Subscription  
**Budget:** $2,000/month ($67/day)  
**Launch:** April 17, 2026  
**Time required:** 20-30 minutes

---

## BEFORE YOU START

**What you need:**
- Access to Meta Ads Manager: https://business.facebook.com/adsmanager
- Ad account: `act_814877604473301` (Second Try)
- Meta Pixel ID: `2276705169443313` (should be pre-installed)
- Creative assets: `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/static-images/`

**Why manual setup:**
- Meta API access token is expired (error 2500)
- Manual setup is faster than re-authenticating API (20 min vs 30+ min)

---

## STEP 1: CREATE CAMPAIGN (5 min)

1. Go to Meta Ads Manager: https://business.facebook.com/adsmanager

2. Click **+ Create** button

3. Choose campaign objective:
   - Select **Sales** (formerly "Conversions")
   - Campaign name: `Subscription Launch - Apr 2026`
   - Click **Continue**

4. Campaign settings:
   - **Advantage campaign budget:** ON (this is CBO - Campaign Budget Optimization)
   - **Daily budget:** $67
   - **Bid strategy:** Lowest cost
   - **Campaign objective:** Maximize number of conversions
   - Click **Next**

---

## STEP 2: CREATE AD SET #1 — INSTAGRAM FEED (5 min)

**Ad Set Name:** `IG Feed - Women 25-35 - Hyde Park`

### Performance Goal
- **Conversion location:** Website
- **Pixel:** Uncle May's Produce (should auto-select if only one pixel)
- **Conversion event:** Purchase
- **Optimization:** Maximize number of conversions

### Budget & Schedule
- Leave blank (using campaign budget)
- **Start date:** Today (April 17)
- **End date:** None (ongoing)

### Audience
- **Custom audience:** None (cold traffic)
- **Location:** United States > Chicago, IL
  - Click "Drop pin" or "Radius"
  - Enter address: `5500 S Lake Park Ave, Chicago, IL 60637` (Hyde Park)
  - Radius: **25 miles**
  - Include: People living in this location
- **Age:** 25-35
- **Gender:** Women
- **Detailed targeting:**
  - Interests: `Healthy eating`, `Organic food`, `Whole Foods Market`, `Farmer's market`
  - Behaviors: `Engaged Shoppers`, `Online shoppers`
- **Languages:** Leave blank (English default)

**Estimated audience size:** Should show 500K-1M (good range for test)

### Placements
- **Placement:** Manual placements
- Deselect all EXCEPT:
  - ✅ Instagram > Feed

### Optimization & Delivery
- **Optimization for ad delivery:** Conversions
- **Conversion event:** Purchase
- **Cost control:** No cost cap (auto bid)
- **When you get charged:** Impressions
- **Delivery type:** Standard

Click **Next**

---

## STEP 3: CREATE ADS FOR INSTAGRAM FEED (5 min)

You'll create 5 ads in this ad set using the 5 Feed images.

### Ad #1: "What's in This Week's Box?"

**Ad name:** `IG Feed - Whats In Box`

**Identity:**
- Facebook Page: Uncle May's Produce
- Instagram account: @unclemaysproduce (if linked)

**Ad setup:**
- **Format:** Single image
- **Add media:** Upload `meta_feed_whats_in_box_1080x1080.png`

**Primary text:**
```
What's in this week's Community Box? Collard greens, okra, sweet potatoes, heirloom tomatoes, and fresh herbs. Restaurant-quality produce, delivered every Thursday to Hyde Park and across Chicago.

Subscribe from $30/week. Use code FREESHIP for $10 off your first box. 🥬🍠
```

**Headline:** `Fresh Produce Delivered Weekly`

**Description:** `Black-owned, Chicago-based, culturally specific`

**Call to action:** Shop Now

**Website URL:** 
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content=ig_feed_whats_in_box&promo=FREESHIP
```

**Display link:** `unclemays.com`

Click **Publish** (will save as draft, don't activate yet)

---

### Ad #2: "Chicago Families Trust Us"

**Ad name:** `IG Feed - Chicago Families`

**Primary text:**
```
Trusted by 500+ Chicago families. Fresh, culturally specific produce delivered to your door every Thursday. Collards, okra, yams, and more.

Black-owned. Hyde Park based. From $30/week. Use code FREESHIP for $10 off. 🌱
```

**Headline:** `Join 500+ Chicago Families`

**Description:** `Premium produce, zero grocery hassle`

**Call to action:** Shop Now

**Website URL:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content=ig_feed_chicago_families&promo=FREESHIP
```

**Media:** Upload `meta_feed_chicago_families_1080x1080.png`

---

### Ad #3: "Your Grandmother's Greens"

**Ad name:** `IG Feed - Grandmas Greens`

**Primary text:**
```
Your grandmother's greens, delivered to your door. Uncle May's sources restaurant-quality produce and delivers across Chicago every Thursday.

Subscribe from $30/week. Black-owned, culturally specific, always fresh. Use code FREESHIP for $10 off your first box. 🥬
```

**Headline:** `Grandma's Greens, Delivered`

**Description:** `Black-owned grocery, Chicago`

**Call to action:** Shop Now

**Website URL:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content=ig_feed_grandmas_greens&promo=FREESHIP
```

**Media:** Upload `meta_feed_grandmas_greens_1080x1080.png`

---

### Ad #4: "Farm to Table, Culture Forward"

**Ad name:** `IG Feed - Farm To Table`

**Primary text:**
```
Farm to table, culture forward. We source from Black farmers and deliver restaurant-quality produce across Chicago every Thursday.

Collards, okra, plantains, yams, and more. Subscribe from $30/week. Use code FREESHIP for $10 off. 🌾
```

**Headline:** `Supporting Black Farmers`

**Description:** `Fresh produce subscription, Chicago`

**Call to action:** Shop Now

**Website URL:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content=ig_feed_farm_to_table&promo=FREESHIP
```

**Media:** Upload `meta_feed_farm_to_table_1080x1080.png`

---

### Ad #5: "Premium Produce, Zero Hassle"

**Ad name:** `IG Feed - Zero Hassle`

**Primary text:**
```
Premium produce, zero grocery store hassle. Subscribe once, eat well every week. Delivered Thursday across Hyde Park and Chicago.

Black-owned, culturally specific, restaurant-quality. From $30/week. Use code FREESHIP for $10 off your first box. ✨
```

**Headline:** `Subscribe From $30/Week`

**Description:** `Skip the store, get the greens`

**Call to action:** Shop Now

**Website URL:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content=ig_feed_zero_hassle&promo=FREESHIP
```

**Media:** Upload `meta_feed_zero_hassle_1080x1080.png`

---

## STEP 4: CREATE AD SET #2 — INSTAGRAM STORIES (3 min)

**Duplicate the first ad set:**
1. In Ads Manager, hover over "IG Feed - Women 25-35 - Hyde Park" ad set
2. Click the checkbox, then click **Duplicate**
3. Rename to: `IG Stories - Women 25-35 - Hyde Park`

**Edit placements:**
1. Click into the duplicated ad set
2. Scroll to **Placements**
3. Deselect all EXCEPT:
   - ✅ Instagram > Stories

4. Save

**Duplicate and edit ads:**
1. Duplicate all 5 ads from the IG Feed ad set
2. Update each ad's media to use the Story versions (1080x1920):
   - `meta_story_subscription_value_1080x1920.png`
   - `meta_story_cultural_1080x1920.png`
   - `meta_story_blackowned_1080x1920.png`
   - `meta_story_offer_1080x1920.png`
   - `meta_story_convenience_1080x1920.png`

3. Update UTM parameter in each URL:
   - Change `utm_medium=paid_social` to `utm_medium=paid_social_stories`
   - Change `utm_content=ig_feed_*` to `utm_content=ig_stories_*`

**Keep primary text and headlines the same** (Meta will auto-truncate for Stories format).

---

## STEP 5: CREATE AD SET #3 — FACEBOOK FEED (3 min)

**Duplicate the IG Feed ad set again:**
1. Select "IG Feed - Women 25-35 - Hyde Park"
2. Click **Duplicate**
3. Rename to: `FB Feed - Women 25-35 - Hyde Park`

**Edit placements:**
1. Deselect all EXCEPT:
   - ✅ Facebook > Feed

2. Save

**Reuse the same 5 Feed ads** (1080x1080 images work for Facebook Feed too).

**Update UTM parameters** in all 5 ad URLs:
- Change `utm_source=facebook` → keep as is (it's Facebook)
- Change `utm_content=ig_feed_*` to `utm_content=fb_feed_*`

---

## STEP 6: VERIFY TRACKING (5 min)

### Check Meta Pixel

1. Go to **Events Manager:** https://business.facebook.com/events_manager2/

2. Select Pixel: `2276705169443313`

3. Click **Test Events**

4. Open your website in a new tab: https://unclemays.com

5. Navigate to checkout page (add a product to cart, go to checkout)

6. Check Events Manager > Test Events:
   - Should see `PageView` event fire
   - Should see `ViewContent` event fire (if on product page)
   - Should see `InitiateCheckout` event fire (if you click checkout)
   - Should see `Purchase` event fire (if you complete a test order)

**If events aren't firing:** Meta Pixel may not be installed. Check website code for Pixel snippet or contact CTO.

### Check GA4

1. Go to Google Analytics: https://analytics.google.com

2. Navigate to **Realtime** report

3. Click a test ad URL (copy one of the UTM-tagged URLs from above, paste in browser)

4. Check Realtime report:
   - Should see your session appear
   - Check **Traffic acquisition:** Should show `facebook / paid_social` or `facebook / paid_social_stories`
   - UTM campaign should show: `subscription_launch_apr2026`

**If UTM params aren't showing:** Double-check URL formatting (no spaces, proper `?` and `&` separators).

---

## STEP 7: REVIEW AND ACTIVATE (2 min)

### Campaign Structure Check

You should now have:
- ✅ 1 Campaign: "Subscription Launch - Apr 2026" ($67/day CBO)
- ✅ 3 Ad Sets:
  - IG Feed - Women 25-35 - Hyde Park (5 ads)
  - IG Stories - Women 25-35 - Hyde Park (5 ads)
  - FB Feed - Women 25-35 - Hyde Park (5 ads)
- ✅ 15 Total Ads (all with UTM tracking)

### Pre-Launch Checklist

- [ ] All 15 ads show "Active" or "In Review" status
- [ ] Campaign budget is $67/day
- [ ] All ad sets target Women 25-35 within 25 miles of Hyde Park
- [ ] All ads use conversion objective (Purchase)
- [ ] All URLs include UTM parameters and `promo=FREESHIP`
- [ ] Meta Pixel fires on checkout page
- [ ] Promo code `FREESHIP` works in Stripe checkout

### Activate Campaign

1. Go to Campaigns tab

2. Find "Subscription Launch - Apr 2026"

3. Toggle switch from **Paused** to **Active**

4. Confirm activation

**Campaigns will enter "Learning" phase** for the first 7 days (Meta's algorithm optimizes delivery). Expect fluctuating CPMs and CPCs during this period.

---

## STEP 8: MONITOR FIRST 4 HOURS (CRITICAL)

### What to Watch

**Hour 1:**
- Impressions should start appearing within 15-30 minutes
- Check for any delivery issues (red flags in Ads Manager)
- Verify at least 1-2 clicks per ad set

**Hour 2-4:**
- CTR should stabilize around 0.8-1.5% (initial range)
- CPC should be $1.50-$3.00 (will optimize down over time)
- Check GA4 for incoming traffic with proper UTM tags

### Red Flags (Stop Campaign If)

- **No impressions after 1 hour:** Check ad approval status, budget settings
- **CTR <0.5% across all ads after 4 hours:** Creative isn't resonating, pause and revise
- **CPC >$5.00 consistently:** Targeting too narrow or creative quality low
- **Bounce rate >80% in GA4:** Landing page mismatch or slow load times

### Dashboard to Build (RevOps Task)

Track daily:
- Spend by ad set
- Impressions, clicks, CTR by ad
- CPC by ad
- Conversions (purchases) by ad
- ROAS (6-month LTV = $1,264 blended)

---

## WEEK 1 OPTIMIZATION PLAN

### Days 1-3 (Learning Phase)
- Let Meta's algorithm optimize delivery
- Don't make changes unless red flags appear
- Monitor for ad disapprovals or policy violations

### Days 4-7 (Data Collection)
- Identify top 3 and bottom 3 performing ads (by CTR)
- Top 3: Increase budget allocation (Meta does this automatically with CBO)
- Bottom 3: Pause if CTR <1% for 3+ consecutive days

### Week 2 (Creative Refresh)
- Kill bottom 50% of ads (lowest CTR)
- Ship 5-10 new variants (compressed videos, new static images)
- Test new hooks based on Week 1 learnings

---

## TROUBLESHOOTING

### "Your ad wasn't approved"
**Reason:** Meta flagged for policy violation (common for new accounts or sensitive categories).

**Fix:**
1. Click "Request Review" in Ads Manager
2. Most disapprovals are false positives and get overturned within 24 hours
3. If consistently rejected: avoid words like "you," health claims, or before/after imagery

### "Not delivering" or "Learning Limited"
**Reason:** Not enough conversions to exit learning phase (need 50 conversions/week per ad set).

**Fix:**
1. Consolidate ad sets (combine IG Feed + Stories into one ad set with both placements)
2. Lower conversion event to "Add to Cart" or "Initiate Checkout" temporarily
3. Increase budget to $100/day to get more volume

### "High CPC" (>$3.00)
**Reason:** Audience too narrow, creative quality low, or high competition.

**Fix:**
1. Expand radius from 25 miles to 35 miles
2. Expand age range from 25-35 to 25-40
3. Test Advantage+ audience (let Meta auto-expand targeting)

### "Low CTR" (<0.8%)
**Reason:** Creative isn't scroll-stopping or offer isn't compelling.

**Fix:**
1. Test different hooks (urgency, social proof, curiosity)
2. Add video (compress current videos to <4MB and upload)
3. A/B test CTA buttons (Shop Now vs Learn More vs Subscribe)

---

## NEXT STEPS AFTER LAUNCH

### Tomorrow (April 18)
- **RevOps:** Pull first 24-hour performance report
- **CRO:** Review and identify any immediate issues (CTR, CPC, delivery)
- **Advertising Creative:** Begin video compression workflow for Week 2 refresh

### End of Week 1 (April 24)
- **CRO:** Weekly performance review with Advertising Creative
- **Decision:** Which 50% of ads to kill, which to double down on
- **RevOps:** Calculate Week 1 ROAS, CAC, conversion rate

### Week 2 (April 21-24)
- **Advertising Creative:** Upload compressed videos (3 new variants)
- **CRO:** Shift budget toward best-performing placements
- **RevOps:** Set up automated daily reports (Ads Manager API or manual export)

---

## FILES & RESOURCES

**Creative assets:**
- Static images: `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/static-images/`
- Videos (need compression): `C:/Users/Anthony/Desktop/business/ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/`

**Copy templates:**
- See ad copy blocks above (5 variants with different hooks)
- All copy follows brand voice: no em dashes, max 2 paragraphs, active voice

**UTM template:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=subscription_launch_apr2026&utm_content={ad_name}&promo=FREESHIP
```

**Performance targets:**
- CTR: ≥1.5%
- CPC: ≤$2.00
- CAC: <$100
- Week 1 orders: 15-20

---

**Prepared by:** CRO  
**Date:** 2026-04-17  
**Time required:** 20-30 minutes  
**Status:** READY TO EXECUTE
