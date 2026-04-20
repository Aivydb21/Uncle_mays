# Tracking Verification Checklist
**Task:** UNC-358  
**Time Required:** 15 minutes  
**When:** After ad campaigns go live (Google Ads + Meta)

---

## Why This Matters

If tracking doesn't work, you won't know:
- Which ads are driving sales
- What your actual CAC is
- Whether to scale or kill the campaign

**Do this verification BEFORE spending significant budget.**

---

## 1. Verify Meta Pixel Fires (5 min)

### Test Method: Click Your Own Ad

1. Go to Meta Ads Manager
2. Find one of your active ads
3. Click **Preview** (or view it on your own Facebook/Instagram feed if it's serving)
4. Click the ad to land on unclemays.com
5. Open **Chrome DevTools** (F12 or right-click > Inspect)
6. Go to **Console** tab
7. Type: `fbq('track', 'PageView')`
8. You should see: `PageView event sent` (or similar confirmation)

### Alternative: Use Meta Pixel Helper Extension

1. Install Chrome extension: [Meta Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&promo=FREESHIP
3. Click the Pixel Helper icon in your browser toolbar
4. You should see: **Uncle May's Pixel (ID: YOUR_PIXEL_ID)** with green checkmark
5. Event: **PageView** should be listed

### Expected Events to Fire

**On landing page:**
- `PageView` (fires immediately on page load)

**On product page:**
- `ViewContent` (fires when user views a subscription tier)

**On checkout:**
- `InitiateCheckout` (fires when user clicks "Subscribe")
- `AddPaymentInfo` (fires when user enters payment info in Stripe)

**On purchase:**
- `Purchase` (fires when Stripe checkout completes)

### What to Do If Pixel Doesn't Fire

1. Check if pixel is installed: View page source, search for `fbq('init'`
2. Check if pixel ID is correct (should match your Meta Ads account)
3. Verify pixel code is in the `<head>` section of the page
4. Coordinate with CTO to fix pixel installation

---

## 2. Verify GA4 Conversion Events (5 min)

### Test Method: Real-Time Reports

1. Go to https://analytics.google.com
2. Select Uncle May's Produce property
3. Go to **Reports > Real-time**
4. In another tab, visit: https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP
5. In GA4 Real-time report, you should see:
   - **1 active user** (you)
   - **Traffic source:** google / pmax
   - **Campaign:** subscription_launch_apr2026

### Expected Events in GA4

**On landing page:**
- `page_view`
- `session_start`

**On checkout:**
- `begin_checkout`
- `add_payment_info`

**On purchase:**
- `purchase` (with transaction_id, value, currency)

### What to Do If GA4 Doesn't Track

1. Check if GA4 tag is installed: View page source, search for `gtag('config', 'G-`
2. Verify measurement ID is correct (should start with `G-`)
3. Check if ad blockers are interfering (test in incognito mode)
4. Coordinate with RevOps or CTO to fix GA4 setup

---

## 3. Verify FREESHIP Promo Code Works (3 min)

### Test Method: Mock Checkout

1. Go to https://unclemays.com?promo=FREESHIP
2. Select a subscription tier (Starter, Community, or Premium)
3. Click **Subscribe** or **Checkout**
4. On Stripe checkout page, check if promo code is auto-applied
   - **OR:** If not auto-applied, manually enter `FREESHIP` in promo code field
5. Verify discount appears:
   - **Expected:** Free shipping ($X off) OR $X off first box
   - **Amount:** Check with CRO on exact promo terms

**Do NOT complete the purchase** (unless you want to actually subscribe).

### What to Do If Promo Code Doesn't Work

1. Check if promo code is created in Stripe dashboard
2. Verify promo code is active and not expired
3. Check usage limits (max redemptions, first-time customers only, etc.)
4. Coordinate with CRO or CTO to fix promo code setup

---

## 4. Verify UTM Parameters Flow to Stripe (2 min)

### Test Method: Inspect Checkout URL

1. Start a checkout session from: https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP
2. When you land on Stripe checkout page, check the URL
3. UTM parameters should be preserved in the URL OR passed to Stripe as metadata

**Why this matters:** If UTM parameters are lost, you can't attribute sales to specific campaigns.

### What to Do If UTMs Are Lost

1. Check if UTM parameters are passed to Stripe checkout session metadata
2. Verify Next.js page correctly forwards query params to Stripe API call
3. Coordinate with CTO to fix UTM parameter passing

---

## 5. End-to-End Test: Simulate a Full Conversion (Optional, 5 min)

### If You Want to Test the Full Funnel

1. Click a live ad (Google or Meta)
2. Land on unclemays.com with UTM parameters
3. Select a subscription tier
4. Proceed to Stripe checkout
5. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
6. Complete the purchase
7. Check:
   - **Meta Pixel:** `Purchase` event fires
   - **GA4:** `purchase` event appears in Real-time reports
   - **Stripe:** Test order appears in Stripe dashboard with correct metadata (UTM params)

**Note:** Only do this if you have Stripe test mode enabled. Do NOT use a real card unless you want to actually subscribe.

---

## Success Checklist

- [ ] Meta Pixel fires `PageView` on landing page
- [ ] Meta Pixel fires `ViewContent` on product page
- [ ] Meta Pixel fires `Purchase` on checkout completion
- [ ] GA4 tracks page_view with correct UTM parameters
- [ ] GA4 tracks `purchase` event on checkout completion
- [ ] FREESHIP promo code applies discount in Stripe checkout
- [ ] UTM parameters flow from ad click to Stripe metadata

---

## What to Do If Tracking Fails

**If Meta Pixel is broken:**
- Campaign will still run, but you won't see conversion data in Meta Ads Manager
- You can still measure performance via GA4 and Stripe

**If GA4 is broken:**
- You can still track conversions via Stripe and Meta Pixel
- RevOps won't have traffic source data for attribution

**If both are broken:**
- **STOP THE CAMPAIGN** until tracking is fixed
- You're flying blind and can't measure ROI

**If only promo code is broken:**
- Campaign can still run, but customer experience is broken (no free shipping)
- Fix this before scaling budget

---

## Contact for Help

**Tracking issues:** Slack the RevOps agent or CTO  
**Promo code issues:** Slack the CRO  
**Pixel/GA4 setup:** Coordinate with CTO  
**Urgent blockers:** Post in UNC-358 Paperclip thread

---

**Status:** Ready for verification after campaign launch  
**Next:** Monitor Week 1 performance (see `week1-performance-framework.md`)
