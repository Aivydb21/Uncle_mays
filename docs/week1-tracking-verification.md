# Week 1 Tracking Verification Checklist

**Campaign:** Subscription Launch (Apr 17-23, 2026)
**Owner:** RevOps
**Status:** PENDING CAMPAIGN LAUNCH

---

## Pre-Launch Verification (Before Ads Go Live)

### 1. API Authentication Status

| Service | Status | Issue | Fix Required |
|---------|--------|-------|--------------|
| **Stripe API** | ✅ WORKING | None | None |
| **Google Ads API** | ❌ BLOCKED | Permission denied (USER_PERMISSION_DENIED) | CRO to verify OAuth refresh token and customer_id permissions |
| **Meta Ads API** | ❌ BLOCKED | OAuth token expired (Error 190/460) | CRO to re-authenticate Meta Business account |
| **GA4 API** | ✅ WORKING | None | None |

**Action Required:**
- **CRO:** Re-authenticate Meta Ads Manager OAuth (5 minutes)
- **CRO:** Verify Google Ads API permissions for customer ID 6015592923

---

### 2. Meta Pixel Verification

**Once ads go live, verify Meta Pixel fires on:**

- [ ] **Ad Click** → Landing page load
  - Event: `PageView`
  - Test: Click Meta ad → Check Meta Events Manager for PageView event
  
- [ ] **Product Page View**
  - Event: `ViewContent`
  - Test: View /shop/produce-box → Check for ViewContent event with product details

- [ ] **Add to Cart**
  - Event: `AddToCart`
  - Test: Add produce box to cart → Check for AddToCart event

- [ ] **Checkout Start**
  - Event: `InitiateCheckout`
  - Test: Click "Checkout" → Check for InitiateCheckout event

- [ ] **Purchase Complete**
  - Event: `Purchase`
  - Test: Complete test order → Check for Purchase event with revenue/order_id

**How to verify:**
1. Open Meta Events Manager: https://business.facebook.com/events_manager2/
2. Select "Uncle May's Produce" Pixel
3. Click "Test Events" tab
4. Enter test browser session ID or use Chrome extension "Meta Pixel Helper"
5. Complete test checkout flow
6. Verify all 5 events fire in sequence

**Tools:**
- Meta Pixel Helper Chrome Extension: https://chrome.google.com/webstore/detail/meta-pixel-helper/
- Meta Events Manager: https://business.facebook.com/events_manager2/

---

### 3. GA4 Conversion Events

**Verify GA4 captures these events:**

- [ ] **page_view** (basic pageview tracking)
- [ ] **view_item** (product page views)
- [ ] **add_to_cart** (add produce box to cart)
- [ ] **begin_checkout** (checkout start)
- [ ] **purchase** (order complete with transaction_id, revenue, items)

**How to verify:**
1. Open GA4 Realtime report: https://analytics.google.com/analytics/web/#/p494626869/realtime
2. Complete test checkout flow
3. Verify events appear in Realtime → Event count by Event name
4. Click "purchase" event → Verify revenue, transaction_id, items populated

**GA4 Debugging:**
- Install GA4 DebugView Chrome Extension
- Enable debug mode: Add `?debug_mode=true` to URL
- Open GA4 DebugView: https://analytics.google.com/analytics/web/#/p494626869/debugview

---

### 4. UTM Parameter Verification

**Verify UTM tracking on ad links:**

| Platform | UTM Parameters Expected |
|----------|-------------------------|
| **Google Ads** | `utm_source=google&utm_medium=cpc&utm_campaign=subscription-launch-apr17&utm_content=[variant-id]` |
| **Meta Ads** | `utm_source=facebook&utm_medium=paid-social&utm_campaign=subscription-launch-apr17&utm_content=[variant-id]` |

**How to verify:**
1. Click ad link (or get preview URL from Advertising Creative)
2. Check URL in browser address bar → Verify UTM parameters present
3. Open GA4 Realtime → Traffic acquisition → Verify correct source/medium appears
4. Open browser Network tab → Find GA4 request → Verify UTM parameters captured

**If UTMs missing:**
- Alert Advertising Creative immediately
- Ads without UTMs = blind to performance by variant
- Fix before scaling spend

---

### 5. Promo Code Tracking (FREESHIP)

**Verify FREESHIP promo code redemptions appear in Stripe:**

- [ ] Complete test order with promo code "FREESHIP"
- [ ] Check Stripe Dashboard → Coupons → Verify redemption count incremented
- [ ] Check Stripe API → Verify charge has `metadata.promo_code = "FREESHIP"`

**API Verification:**
```bash
# Fetch recent charges and check for promo code metadata
curl https://api.stripe.com/v1/charges?limit=10 \
  -u sk_live_xxx: | grep -A 5 "promo_code"
```

**Dashboard tracking:**
- RevOps dashboard script (`scripts/week1-performance-dashboard.py`) pulls FREESHIP redemptions daily
- Appears in "Orders & Revenue" section of daily report

---

### 6. End-to-End Test Checklist

**Complete this test BEFORE scaling ad spend:**

1. [ ] Click Google Ad (or preview URL)
2. [ ] Land on unclemays.com → Verify Meta Pixel PageView fires
3. [ ] View product page → Verify GA4 `view_item` + Meta `ViewContent` fire
4. [ ] Add to cart → Verify GA4 `add_to_cart` + Meta `AddToCart` fire
5. [ ] Start checkout → Verify GA4 `begin_checkout` + Meta `InitiateCheckout` fire
6. [ ] Enter promo code "FREESHIP" → Verify discount applied
7. [ ] Complete purchase → Verify:
   - GA4 `purchase` event with revenue
   - Meta `Purchase` event with revenue
   - Stripe charge created
   - Stripe metadata includes `promo_code: "FREESHIP"`
   - Order confirmation email sent

**Test Order Details:**
- Use test card: `4242 4242 4242 4242` (Stripe test mode)
- Or use real card and refund immediately after test
- Record transaction_id for tracking verification

---

## Post-Launch Daily Checks (First 3 Days)

### Day 1 (Apr 17) - Launch Day

- [ ] Run dashboard script: `python scripts/week1-performance-dashboard.py 2026-04-17`
- [ ] Verify Google Ads spend > $0 (campaigns are active)
- [ ] Verify Meta Ads spend > $0 (campaigns are active)
- [ ] Check for any campaigns with >$50 spend, 0 conversions → Alert CRO
- [ ] Verify GA4 traffic spike matches ad spend (sessions should increase)
- [ ] Check Stripe for first order → Verify all tracking events captured correctly

### Day 2 (Apr 18)

- [ ] Run dashboard script for Apr 17 data
- [ ] Deliver first daily report to CRO by 9am CT
- [ ] Compare GA4 purchases vs Stripe charges (should match ±1)
- [ ] Check for low CTR variants (<1%) → Flag for kill
- [ ] Verify no broken ad links (404s in GA4 Landing Pages report)

### Day 3 (Apr 19)

- [ ] Run dashboard script for Apr 18 data
- [ ] Calculate 3-day blended CAC → Alert if >$150
- [ ] Identify top 3 performing variants by CTR
- [ ] Identify bottom 3 variants for potential kill
- [ ] Check Meta Events Manager for any Pixel errors

---

## Troubleshooting

### Meta Pixel Not Firing

**Symptoms:**
- No events in Meta Events Manager
- Ads show impressions/clicks but no conversions

**Fixes:**
1. Check Pixel ID is correct in website code
2. Verify Pixel Helper shows green checkmark on page load
3. Check browser console for JavaScript errors blocking Pixel
4. Verify ad blocker is disabled during test

**Emergency Fix:**
- Add Meta Pixel base code to `<head>` of all pages
- Deploy ASAP if missing

---

### GA4 Events Not Tracking

**Symptoms:**
- Realtime report shows 0 events
- DebugView shows no activity

**Fixes:**
1. Verify GA4 Measurement ID is correct (`G-XXXXXXXXXX`)
2. Check gtag.js script is loaded in `<head>`
3. Open browser console → Check for GA4 errors
4. Verify events are pushed to dataLayer correctly

**Emergency Fix:**
- Add server-side GA4 tracking to Stripe webhook (already implemented in `src/app/api/webhook/route.ts`)
- Will capture purchases even if client-side tracking fails

---

### Google Ads Conversions Not Recording

**Symptoms:**
- Ads show clicks but 0 conversions in Google Ads dashboard

**Fixes:**
1. Verify Google Ads conversion tracking tag is installed
2. Check conversion action is set to "Purchase" event from GA4 import
3. Verify GA4 → Google Ads linking is active
4. Check conversion action status (may take 24h to activate)

**Fallback:**
- Use GA4 attribution as source of truth
- Google Ads conversions may lag 24-48h on first import

---

### Stripe Orders Missing Promo Code

**Symptoms:**
- Orders appear in Stripe but `metadata.promo_code` is empty

**Fixes:**
1. Check checkout form passes `promo_code` to Stripe session metadata
2. Verify `checkout-store.ts` includes promo code in session creation
3. Add promo code field to checkout flow if missing

**Code Location:**
- `src/lib/checkout-store.ts` (Zustand store)
- `src/app/api/checkout/route.ts` (Stripe session creation)

---

## Dashboard Automation

**Manual Run (Daily, 9am CT):**
```bash
cd ~/Desktop/business
python scripts/week1-performance-dashboard.py $(date -d "yesterday" +%Y-%m-%d)
```

**Cron Setup (Optional):**
```bash
# Add to crontab: Run daily at 9am CT (3pm UTC)
0 15 * * * cd ~/Desktop/business && python scripts/week1-performance-dashboard.py $(date -d "yesterday" +\%Y-\%m-\%d) >> logs/dashboard-cron.log 2>&1
```

**Output Location:**
- Reports saved to: `reports/week1-daily/performance-report-YYYY-MM-DD.md`
- Copy to Paperclip issue comment or Slack #marketing channel

---

## Success Criteria

**Week 1 Tracking is VERIFIED when:**

✅ All 4 API endpoints return data (Stripe, Google Ads, Meta, GA4)  
✅ Meta Pixel fires all 5 conversion events in sequence  
✅ GA4 captures all 5 conversion events  
✅ Google Ads shows >0 conversions within 48h of launch  
✅ Stripe orders include promo code metadata  
✅ Daily dashboard runs without errors  
✅ First 3 daily reports delivered to CRO on time

**Red Flags (Stop Spending Immediately):**

🚨 Any campaign >$100 spend with 0 conversions (tracking is broken)  
🚨 GA4 purchases don't match Stripe orders (data integrity issue)  
🚨 Meta Pixel shows 0 events after 24h of ad spend  
🚨 Blended CAC >$200 (funnel is broken or targeting is wrong)

---

**Status:** Dashboard ready, API auth issues flagged, tracking verification pending campaign launch  
**Next:** CRO to fix Meta/Google Ads API auth, then Advertising Creative launches campaigns  
**Owner:** RevOps  
**Updated:** 2026-04-17
