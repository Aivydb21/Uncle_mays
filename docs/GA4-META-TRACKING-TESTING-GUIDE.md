# GA4 & Meta Pixel Tracking Testing Guide

## Overview

This guide covers how to test the newly implemented server-side GA4 tracking and verify Meta Pixel events are firing correctly on checkout.

**What was fixed:**
- Added server-side GA4 Measurement Protocol tracking to Stripe webhook handler
- Verified client-side Meta Pixel Purchase events on order success page
- Verified Meta Pixel ViewContent events on product checkout pages

## Prerequisites

### 1. Get GA4 Credentials

**From GA4 Admin Console:**
1. Go to [GA4 Admin](https://analytics.google.com/analytics/web/) → Admin (gear icon)
2. Select your property (Uncle May's Produce)
3. Click **Data Streams** → Click your web stream
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

**Create API Secret for Measurement Protocol:**
1. On the same Data Stream page, scroll down to **Measurement Protocol API secrets**
2. Click **Create**
3. Give it a name (e.g., "Stripe Webhook")
4. Copy the **Secret Value**

### 2. Set Environment Variables

Add to your production `.env` file (or Vercel environment variables):

```bash
# GA4 Measurement ID (same for client and server)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# GA4 Measurement Protocol API Secret (server-side only)
GA4_API_SECRET=your_secret_value_here

# Google Ads (if conversion tracking needed)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=your_label_here
```

**For Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add each variable for Production environment
3. Redeploy the app

### 3. Redeploy Application

After setting environment variables, redeploy:

```bash
git add .
git commit -m "Add GA4 and Meta Pixel server-side tracking"
git push origin main
```

## Testing Procedure

### Test 1: Meta Pixel ViewContent Event

**What:** Verify ViewContent fires when user lands on checkout page.

**Steps:**
1. Open [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select Pixel ID: `2276705169443313`
3. Click **Test Events** tab
4. In a new browser tab, visit: `https://unclemays.com/checkout/starter`
5. Check Events Manager → Should see **ViewContent** event with:
   - `content_name`: Starter Box
   - `content_ids`: [starter]
   - `value`: 30 (or 35 depending on first-order pricing)
   - `currency`: USD

**Expected:** ✅ ViewContent event appears within 10 seconds

### Test 2: Client-Side GA4 & Meta Pixel Purchase Events

**What:** Verify client-side tracking on order success page.

**Steps:**
1. Open Chrome DevTools → Console tab
2. Complete a test checkout at `https://unclemays.com/checkout/starter/delivery`
3. After payment succeeds, you'll redirect to `/order-success?pi=pi_xxx&amount=30&product=starter`
4. In Console, check for:
   ```
   dataLayer.push({
     event: "purchase",
     ecommerce: { transaction_id: "pi_xxx", value: 30, currency: "USD", items: [...] }
   })
   ```
5. In Meta Events Manager → Test Events, check for **Purchase** event

**Expected:** 
- ✅ dataLayer push logged in console
- ✅ GA4 purchase event in GA4 DebugView
- ✅ Meta Pixel Purchase event in Events Manager

### Test 3: Server-Side GA4 Tracking (Webhook)

**What:** Verify webhook fires GA4 Measurement Protocol on successful checkout.

**Steps:**
1. Check Stripe webhook logs: [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Complete a test checkout
3. In webhook logs, look for `checkout.session.completed` event
4. Check application logs for: `[GA4] Purchase tracked: cs_xxx = $30`
5. Verify in GA4:
   - Go to [GA4 Real-Time Report](https://analytics.google.com/analytics/web/#/p494626869/reports/realtime)
   - Click **Event count by Event name**
   - Should see `purchase` event within 5 minutes

**Expected:**
- ✅ Webhook processes `checkout.session.completed`
- ✅ Log shows `[GA4] Purchase tracked`
- ✅ GA4 Real-Time shows `purchase` event

### Test 4: End-to-End Conversion Tracking

**What:** Full funnel test from landing to purchase.

**Steps:**
1. Clear cookies and open incognito window
2. Visit `https://unclemays.com`
3. Click "Order Now" → Select Starter Box
4. Complete checkout with test card: `4242 4242 4242 4242`, any future date, any CVC
5. Monitor:
   - GA4 Real-Time → Events
   - Meta Events Manager → Test Events
   - Stripe Dashboard → Payments

**Expected:**
- ✅ GA4: `page_view` → `view_content` → `purchase`
- ✅ Meta: `PageView` → `ViewContent` → `Purchase`
- ✅ Stripe: Payment succeeded
- ✅ Webhook: `checkout.session.completed` processed

## Troubleshooting

### GA4 purchase event not appearing

**Check:**
1. Environment variables set correctly? (`GA4_MEASUREMENT_ID`, `GA4_API_SECRET`)
2. Application redeployed after setting env vars?
3. Webhook signature verification passing? (check Stripe webhook logs)
4. Check application logs for `[GA4] Purchase tracked` or error messages

**Common issues:**
- `[GA4] Measurement ID or API Secret not configured` → Env vars missing
- `[GA4] Tracking failed: 403` → Invalid API secret
- `[GA4] Tracking failed: 400` → Invalid Measurement ID format

### Meta Pixel events not firing

**Check:**
1. Pixel ID `2276705169443313` is correct in `layout.tsx` (line 90)
2. Test Events tab shows "Activity received from your browser"
3. Open DevTools Console and check for `fbq is not defined` errors
4. Check if ad blockers are preventing pixel from loading

### Webhook not firing

**Check:**
1. Webhook endpoint configured in Stripe: `https://unclemays.com/api/webhook`
2. Webhook secret matches `STRIPE_WEBHOOK_SECRET` env var
3. Webhook events include: `checkout.session.completed`, `payment_intent.succeeded`
4. Stripe webhook logs show successful delivery (200 status)

## Validation Criteria

Before approving digital spend ($490/week), confirm:

- [ ] 3+ test checkouts completed successfully
- [ ] All 3 test purchases appear in GA4 Real-Time report
- [ ] All 3 purchases tracked by Meta Pixel
- [ ] Webhook logs show `[GA4] Purchase tracked` for each order
- [ ] Conversion rate calculation: (purchases / visitors) × 100 > 15%

## Getting Help

**GA4 Issues:**
- CTO: Check server logs for `[GA4]` messages
- RevOps: Verify GA4 Measurement ID in Data Streams

**Meta Pixel Issues:**
- CRO: Check Events Manager → Test Events → Troubleshoot
- Advertising Creative: Verify pixel ID in `layout.tsx`

**Webhook Issues:**
- CTO: Check Stripe webhook logs + application logs
- CEO: Confirm `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
