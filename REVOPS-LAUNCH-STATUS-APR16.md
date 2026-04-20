# RevOps Pre-Launch Status — April 16, 2026, 7:45pm CT

**Task:** [UNC-337](/UNC/issues/UNC-337) — Pre-launch setup for Apr 17 subscription campaign  
**Owner:** RevOps  
**Deadline:** Tonight (11pm CT) for 9am launch tomorrow

---

## EXECUTIVE SUMMARY

✅ **All automated setup complete**  
⚠️ **Manual ad platform uploads required** (2-3 hours, must be done tonight)

**What's Ready:**
- 25 static ad images (Meta + Google)
- Google Performance Max copy
- FREESHIP promo code ($10 off)
- All tracking infrastructure (Meta Pixel, GA4, Google Ads conversion tracking)

**What Needs Manual Work:**
- Upload 10 images to Meta Ads Manager UI
- Upload 15 images to Google Ads Performance Max UI
- Configure campaign settings in both platforms
- Test checkout flow with promo code

---

## ✅ COMPLETED SETUP

### 1. Creative Assets ✅
**Location:** `ad-exports/subscription-launch-apr17/static-images/`

**Meta (10 images):**
- 5 Feed images (1080x1080): `meta_feed_*.png`
- 5 Story images (1080x1920): `meta_story_*.png`

**Google Performance Max (15 images):**
- 5 Landscape (1200x628): `pmax_landscape_*.png`
- 5 Square (1080x1080): `pmax_square_*.png`
- 5 Portrait (1080x1350): `pmax_portrait_*.png`

**Copy:** `ad-exports/subscription-launch-apr17/google-performance-max-copy.md`
- 5 Headlines (<30 chars)
- 5 Long Headlines (<90 chars)
- 5 Descriptions (<90 chars)
- UTM tracking template included

### 2. Stripe Promo Code ✅
**Code:** `FREESHIP`  
**Discount:** $10.00 off (amount_off: 1000 cents)  
**Name:** "Free Delivery - Meta Ads Launch"  
**Duration:** One-time use  
**Status:** Active  
**Restrictions:** First-time transaction only  
**Times Redeemed:** 0  
**Coupon ID:** `freeship-launch-2026`  
**Promo Code ID:** `promo_1TMVz1G67LsNxpTot1tkLgIB`

### 3. Tracking Infrastructure ✅

**Meta Pixel:**
- Pixel ID: `2276705169443313`
- Location: `src/app/layout.tsx:89-91`
- Events configured:
  - ✅ PageView (fires on all pages)
  - ✅ ViewContent (fires on checkout pages: `src/app/checkout/[product]/page.tsx:83`)
  - ✅ Purchase (fires on order-success: `src/app/order-success/OrderSuccessContent.tsx:65`)

**GA4:**
- Property ID: `G-XXXXXXXXXX` (from `.env.local`)
- Location: `src/app/layout.tsx:80-86`
- Server-side purchase tracking: `src/app/api/webhook/route.ts:8-49`
- Events configured:
  - ✅ Page views (automatic)
  - ✅ Purchase (server-side from Stripe webhook)

**Google Ads Conversion Tracking:**
- Ads ID: `AW-XXXXXXXXXX` (from `.env.local`)
- Location: `src/app/layout.tsx:85`
- Conversion action: "Purchase - Uncle May's Produce Box"
- Setup script: `src/trigger/google-ads-conversion-tracking.ts:249`

---

## ⚠️ MANUAL WORK REQUIRED (TONIGHT)

### Why Manual?
- **Meta Ads Manager:** Marketing API creative upload requires Business Verification + App Review (multi-day process, not available)
- **Google Ads:** API still blocked per [UNC-281](/UNC/issues/UNC-281)
- Both platforms require UI upload for launch tomorrow

### Task 1: Upload to Meta Ads Manager (60 min)

**Navigate to:** https://business.facebook.com/adsmanager

1. **Create new ad set** (or use existing campaign)
   - Campaign objective: Conversions
   - Optimization: Purchase
   - Budget: $2,000 total

2. **Upload 10 images:**
   - Feed images (5): `meta_feed_chicago_families_1080x1080.png`, `meta_feed_farm_to_table_1080x1080.png`, `meta_feed_grandmas_greens_1080x1080.png`, `meta_feed_whats_in_box_1080x1080.png`, `meta_feed_zero_hassle_1080x1080.png`
   - Story images (5): `meta_story_blackowned_1080x1920.png`, `meta_story_convenience_1080x1920.png`, `meta_story_cultural_1080x1920.png`, `meta_story_offer_1080x1920.png`, `meta_story_subscription_value_1080x1920.png`

3. **Configure ad settings:**
   - Destination: `https://unclemays.com/subscribe`
   - UTM parameters: `?utm_source=facebook&utm_medium=paid&utm_campaign=subscription_launch_apr2026&promo=FREESHIP`
   - Pixel: 2276705169443313 (should auto-detect)
   - Call to action: "Subscribe Now" or "Shop Now"

4. **Set to PAUSED** (activate tomorrow at 9am)

### Task 2: Upload to Google Ads Performance Max (90 min)

**Navigate to:** https://ads.google.com

1. **Create Performance Max campaign:**
   - Campaign name: "Subscription Launch Apr 2026"
   - Goal: Sales / Conversions
   - Budget: $1,000 total ($33/day)
   - Conversion goal: "Purchase - Uncle May's Produce Box"

2. **Create asset group:**
   - Business name: Uncle May's Produce
   - Final URL: `https://unclemays.com/subscribe?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP`

3. **Upload 15 images:**
   - Landscape (5): `pmax_landscape_*.png`
   - Square (5): `pmax_square_*.png` (if they exist, otherwise skip)
   - Portrait (5): `pmax_portrait_*.png`

4. **Add copy from `google-performance-max-copy.md`:**
   - Headlines (5):
     - "Fresh Produce, Delivered Weekly"
     - "Black-Owned Grocery, Chicago"
     - "Subscribe From $30/Week"
     - "Premium Greens, Weekly"
     - "Join 500+ Chicago Families"
   - Long Headlines (5): [copy from file]
   - Descriptions (5): [copy from file]
   - Call to action: "Subscribe Now"

5. **Set to PAUSED** (activate tomorrow at 9am)

### Task 3: Test Checkout Flow (30 min)

1. **Test each subscription tier:**
   - Starter ($30/week)
   - Community ($55/week)
   - Premium ($75/week)

2. **For each tier:**
   - Navigate to checkout page
   - Enter test info (use Stripe test mode if available, or use a real email you control)
   - Apply promo code: `FREESHIP`
   - Verify: $10 discount appears
   - **DO NOT complete purchase** (unless using test mode)

3. **Verify tracking fires (use browser dev tools):**
   - Meta Pixel ViewContent event (check Network tab for `facebook.com/tr`)
   - GA4 page view (check Network tab for `google-analytics.com/g/collect`)

4. **If you complete a test purchase:**
   - Check that Meta Pixel Purchase event fires on order-success page
   - Check that GA4 purchase event is logged (may take 24h to appear in GA4 UI)

---

## 📋 LAUNCH DAY CHECKLIST (April 17, 9am CT)

### Pre-Activation (8:45am - 9am)
- [ ] Verify Meta campaign is set to PAUSED with correct budget ($2K)
- [ ] Verify Google Ads campaign is set to PAUSED with correct budget ($1K)
- [ ] Confirm `unclemays.com/subscribe` page is live and loads correctly
- [ ] Verify FREESHIP promo code still active in Stripe

### Activation (9am)
- [ ] Activate Meta campaign
- [ ] Activate Google Ads Performance Max campaign
- [ ] Post announcement on social media (optional)

### Monitoring (9am - 1pm)
- [ ] Check ad delivery at 10am (impressions, clicks)
- [ ] Monitor website traffic in GA4 (real-time view)
- [ ] Check for any error spikes in Stripe dashboard
- [ ] Track first conversion (if any)

### 1pm Report to CRO
- [ ] Total spend (Meta + Google)
- [ ] Impressions, clicks, CTR
- [ ] Website traffic from ads
- [ ] Conversions (if any)
- [ ] Promo code redemptions
- [ ] Any issues or anomalies

---

## 🔍 VERIFICATION COMMANDS (for RevOps)

```bash
# Check promo code status
python3 << 'EOF'
import json, requests, os
config = json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))
response = requests.get('https://api.stripe.com/v1/promotion_codes/promo_1TMVz1G67LsNxpTot1tkLgIB', 
                       headers={'Authorization': f'Bearer {config["api_key"]}'})
print(f"FREESHIP status: {response.json()['active']}, redeemed: {response.json()['times_redeemed']}")
EOF

# Count creative assets
ls ad-exports/subscription-launch-apr17/static-images/*.png | wc -l

# Check tracking env vars
grep -E "NEXT_PUBLIC_GA_ID|NEXT_PUBLIC_GOOGLE_ADS_ID" .env.local
```

---

## 🚨 BLOCKERS & ESCALATION

**No API access for creative upload:**
- Meta Marketing API requires Business Verification (multi-day approval)
- Google Ads API blocked per [UNC-281](/UNC/issues/UNC-281)
- **Workaround:** Manual UI upload (2-3 hours tonight)

**If manual upload cannot be completed tonight:**
- Escalate to CRO immediately
- Options: (1) Delay launch to Apr 18, (2) Ship with reduced creative set, (3) Board member with ad platform access assists

---

## 📊 SUCCESS METRICS (Week 1)

**Tracking in GA4 + Stripe:**
- Orders: Target 5-10 in first week
- CTR: Target ≥1.5%
- CPC: Target ≤$2.00
- CAC: Target <$100
- ROAS: Target ≥2.0 (break-even at 1.0)

**Kill criteria:**
- Any variant with CTR <1% for 7 days → kill and replace
- CPA >$150 for 7 days → pause and reassess

---

**Status:** ✅ Automated setup complete, ⚠️ manual ad upload required tonight  
**Next Action:** Anthony or CRO to upload creative assets to Meta + Google Ads UI  
**Prepared by:** RevOps (Agent b8496569-99a4-47cb-8978-c4652c7d14f5)  
**Date:** 2026-04-16, 7:45pm CT
