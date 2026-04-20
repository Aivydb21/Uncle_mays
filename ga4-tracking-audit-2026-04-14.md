# GA4 E-commerce Tracking Audit - Uncle May's Produce

**Date:** 2026-04-14  
**Auditor:** RevOps  
**Task:** [UNC-269](/UNC/issues/UNC-269)  
**Website:** unclemays.com  
**Goal:** Ensure complete GA4 event tracking for customer acquisition campaigns

---

## Audit Status

🔴 **INCOMPLETE** - Website code access required for full audit

This document outlines the required GA4 implementation for e-commerce tracking. **A technical audit with code access or live browser inspection is needed to verify implementation status.**

---

## Required GA4 Events

### Core E-commerce Events

| Event | Trigger | Required Parameters | Status |
|-------|---------|---------------------|--------|
| `page_view` | Every page load | `page_location`, `page_title` | ❓ To verify |
| `view_item` | Product page view | `currency`, `value`, `items[]` | ❓ To verify |
| `add_to_cart` | Add to cart button click | `currency`, `value`, `items[]` | ❓ To verify |
| `begin_checkout` | Checkout page load | `currency`, `value`, `items[]` | ❓ To verify |
| `purchase` | Order confirmation | `transaction_id`, `value`, `currency`, `tax`, `shipping`, `items[]` | ❓ To verify |

### Enhanced E-commerce Parameters

**Items Array Structure:**
```javascript
items: [
  {
    item_id: "PRODUCE-BOX-001",           // SKU or product ID
    item_name: "Weekly Produce Box",      // Product name
    affiliation: "Uncle May's Produce",   // Store name
    price: 50.00,                          // Unit price
    quantity: 1,                           // Quantity
    item_category: "Produce Box",          // Category
    item_variant: "Standard"               // Size/variant if applicable
  }
]
```

**Transaction Parameters (purchase event only):**
```javascript
{
  transaction_id: "stripe_charge_id",     // Unique order ID from Stripe
  value: 50.00,                           // Total order value
  currency: "USD",                        // Currency code
  tax: 0.00,                              // Tax amount (if applicable)
  shipping: 0.00,                         // Shipping fee (if applicable)
  items: [...]                            // Items array as above
}
```

---

## UTM Campaign Tracking

### Required URL Parameters

All paid campaign URLs must include:
- `utm_source` (e.g., "facebook", "google", "instagram")
- `utm_medium` (e.g., "cpc", "social", "display")
- `utm_campaign` (e.g., "hyde-park-local", "produce-box-launch")
- `utm_content` (optional, for A/B testing variants)
- `utm_term` (optional, for keyword tracking)

**Example Campaign URL:**
```
https://unclemays.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=hyde-park-local&utm_content=variant-a
```

### GA4 Custom Dimensions (Recommended)

To properly attribute revenue to campaigns, set up these custom dimensions in GA4:

| Dimension Name | Scope | Parameter | Purpose |
|----------------|-------|-----------|---------|
| `campaign_source` | Event | `campaign_source` | Ad platform (Facebook, Google, etc.) |
| `campaign_name` | Event | `campaign_name` | Campaign identifier |
| `campaign_medium` | Event | `campaign_medium` | Channel type (cpc, social, etc.) |
| `promo_code` | Event | `promo_code` | Discount code used (e.g., NEIGHBOR20) |

---

## Implementation Checklist

### 1. GA4 Property Setup
- [ ] GA4 property created and configured
- [ ] Measurement ID (G-XXXXXXXXXX) obtained
- [ ] Property linked to Google Ads (if running Google Ads campaigns)
- [ ] E-commerce tracking enabled in GA4 settings

### 2. Tag Installation
- [ ] gtag.js or Google Tag Manager installed on all pages
- [ ] GA4 measurement ID configured in tag
- [ ] Tag firing verified on all key pages:
  - [ ] Homepage
  - [ ] Product page (if applicable)
  - [ ] Checkout page
  - [ ] Order confirmation page

### 3. Event Implementation
- [ ] `page_view` automatically tracked (default GA4 behavior)
- [ ] `add_to_cart` event fires when user clicks "Add to Cart" or "Buy Now"
- [ ] `begin_checkout` fires on checkout page load
- [ ] `purchase` fires on order confirmation with complete transaction data

### 4. Server-Side Purchase Tracking (Recommended)
For accuracy, the `purchase` event should be fired server-side after Stripe confirms payment:

**Stripe Webhook → GA4 Measurement Protocol**

```javascript
// In Stripe webhook handler (um_website/src/app/api/webhook/route.ts)
// After successful payment_intent.succeeded or checkout.session.completed

const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
const GA4_API_SECRET = 'your-api-secret';

fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`, {
  method: 'POST',
  body: JSON.stringify({
    client_id: customer_id_or_session_id,  // From Stripe session
    events: [{
      name: 'purchase',
      params: {
        transaction_id: charge.id,
        value: charge.amount / 100,
        currency: 'USD',
        tax: 0,
        shipping: 0,
        items: [{
          item_id: 'PRODUCE-BOX-001',
          item_name: 'Weekly Produce Box',
          price: charge.amount / 100,
          quantity: 1
        }]
      }
    }]
  })
});
```

**Why server-side?** Client-side tracking can be blocked by ad blockers, leading to underreported conversions. Server-side tracking from the Stripe webhook is 100% accurate.

### 5. UTM Parameter Preservation
- [ ] UTM parameters captured on landing page
- [ ] UTM parameters stored in session/cookie
- [ ] UTM parameters passed to Stripe checkout metadata
- [ ] UTM parameters included in GA4 purchase event

**Implementation:**
```javascript
// On page load, capture UTM params
const urlParams = new URLSearchParams(window.location.search);
const utmData = {
  utm_source: urlParams.get('utm_source'),
  utm_medium: urlParams.get('utm_medium'),
  utm_campaign: urlParams.get('utm_campaign'),
  utm_content: urlParams.get('utm_content'),
  utm_term: urlParams.get('utm_term')
};

// Store in session storage
sessionStorage.setItem('utm_data', JSON.stringify(utmData));

// When creating Stripe checkout, add to metadata
const checkoutSession = await stripe.checkout.sessions.create({
  // ... other params
  metadata: {
    campaign: utmData.utm_campaign || 'organic',
    source: utmData.utm_source || 'direct',
    medium: utmData.utm_medium || 'none'
  }
});
```

### 6. Testing & Verification
- [ ] Use GA4 DebugView to verify events in real-time
- [ ] Test full purchase flow with test payment
- [ ] Verify transaction appears in GA4 E-commerce reports within 24-48 hours
- [ ] Check that UTM parameters are captured correctly
- [ ] Verify promo code tracking (if applicable)

---

## Recommended GA4 Reports

Once tracking is implemented, set up these reports for campaign monitoring:

1. **Acquisition Overview**
   - Source/Medium performance
   - Campaign performance
   - Conversion rate by source

2. **E-commerce Purchases**
   - Revenue by source/medium
   - Revenue by campaign
   - Items purchased
   - Average order value

3. **Funnel Analysis**
   - Page view → Add to cart → Begin checkout → Purchase
   - Drop-off rates at each step

4. **Campaign Attribution**
   - First-click attribution (initial source)
   - Last-click attribution (final source before purchase)
   - Multi-touch attribution (if using GA4 data-driven attribution)

---

## Integration with Customer Acquisition Dashboard

Once GA4 tracking is verified, the data can be integrated into `scripts/customer-acquisition-dashboard.sh` via the GA4 Data API:

**Query Example:**
```javascript
// Get revenue by campaign (last 7 days)
POST https://analyticsdata.googleapis.com/v1beta/properties/GA4_PROPERTY_ID:runReport
{
  "dateRanges": [{ "startDate": "7daysAgo", "endDate": "today" }],
  "dimensions": [
    { "name": "sessionCampaignName" },
    { "name": "sessionSource" },
    { "name": "sessionMedium" }
  ],
  "metrics": [
    { "name": "purchaseRevenue" },
    { "name": "transactions" },
    { "name": "sessions" }
  ]
}
```

This will provide:
- Revenue by campaign
- Conversion rate by source
- Campaign ROI when combined with ad spend data from Meta/Google Ads

---

## Action Items

### Immediate (RevOps - this task)
- [x] Document GA4 tracking requirements
- [x] Create implementation checklist
- [ ] **BLOCKED:** Verify current implementation (requires website code access or live inspection)

### Next Steps (Requires CTO or Web Developer)
1. **Audit current implementation:**
   - Inspect unclemays.com page source for GA4 tag
   - Check Network tab for GA4 events firing
   - Use GA4 DebugView to see live events
   
2. **Implement missing events:**
   - Add event tracking code for `add_to_cart`, `begin_checkout`, `purchase`
   - Configure server-side purchase tracking via Stripe webhook
   
3. **Set up UTM preservation:**
   - Capture UTM params on landing page
   - Store in session/cookie
   - Pass to Stripe checkout metadata
   
4. **Test and verify:**
   - Complete test purchase flow
   - Verify all events fire correctly in GA4 DebugView
   - Confirm transaction data appears in GA4 reports

### Timeline
- **Audit + small fixes:** 1-2 hours
- **Full implementation (if starting from scratch):** 4-6 hours
- **Testing + verification:** 1-2 hours

---

## References

- [GA4 E-commerce Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GA4 Measurement Protocol (Server-Side Tracking)](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GTM E-commerce Tracking Guide](https://support.google.com/tagmanager/topic/6333310)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
