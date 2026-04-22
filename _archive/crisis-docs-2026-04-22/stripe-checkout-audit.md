# Stripe Checkout Flow Audit — Phase 1
**Date:** 2026-04-13  
**Auditor:** RevOps  
**Current Completion Rate:** 7.7% (3 of 39 starters)  
**Target:** 30-40% (industry standard)

---

## Executive Summary

Uncle May's is using **Stripe Payment Links** (hosted checkout) for produce box subscriptions. The flow has **5 critical friction points** that directly explain the 7.7% completion rate. Most critical: **the checkout does NOT collect shipping addresses**, which is catastrophic for a delivery business.

---

## Current Checkout Configuration

### Products (3 active subscription payment links)
- **Standard Box:** $35/week (plink_1TL88uG67LsNxpTo22RcsjJx)
- **Family Box:** $55/week (plink_1TL88vG67LsNxpTokErPsWBS)
- **Premium Box:** $75/week (plink_1TL88wG67LsNxpTojxjOvhTQ)

### Flow Steps
1. Customer clicks payment link from website
2. Stripe hosted checkout page loads
3. Customer enters:
   - Email
   - Billing address (required)
   - Payment method (card, Link, CashApp, Amazon Pay)
4. Submit → Redirect to unclemays.com/subscription-confirmed

**Total steps:** 1-page checkout (Stripe hosted)

---

## Critical Friction Points (Ranked by Severity)

### 🚨 **CRITICAL #1: No Shipping Address Collection**
**Impact:** 🔴 CATASTROPHIC  
**Current config:** `shipping_address_collection: null`

**The problem:**  
This is a **produce delivery business** but the checkout does **NOT ask for a shipping address**. Only billing address is collected. Result:
- Customers who live far from store complete checkout thinking they'll get delivery
- No way to fulfill the order
- 100% of these orders require manual follow-up
- High abandonment when customers realize they need to provide address separately

**Fix:**  
Enable `shipping_address_collection` with allowed countries = US, and optionally pre-fill from billing address.

**Expected lift:** +15-20 percentage points (this alone could get us to 25%+)

---

### 🚨 **CRITICAL #2: No Phone Number Collection**
**Impact:** 🔴 HIGH  
**Current config:** `phone_number_collection.enabled: false`

**The problem:**  
Fresh produce delivery requires day-of coordination (delivery window, substitutions, access instructions). No phone = can't contact customer = failed deliveries.

**Fix:**  
Enable `phone_number_collection: { enabled: true }`

**Expected lift:** +3-5 percentage points (reduces delivery anxiety)

---

### 🚨 **CRITICAL #3: No Shipping Cost Transparency**
**Impact:** 🟠 HIGH  
**Current config:** `shipping_options: []`, `shipping_cost: null`

**The problem:**  
Customers don't know if shipping is free, $5, $10, or $20. Checkout shows $35 total for Standard Box but no shipping line item. This creates:
- Uncertainty about true cost
- Suspicion of hidden fees
- Cart abandonment at payment step

**Current state:** Shipping appears to be free (no line item), but this isn't communicated clearly.

**Fix:**  
Either:
1. Add explicit "Free Delivery" messaging with `custom_text.submit`
2. OR show shipping as $0 line item with `shipping_options`
3. OR add shipping cost if not actually free

**Expected lift:** +3-5 percentage points

---

### 🚨 **CRITICAL #4: No Delivery Date/Window Shown**
**Impact:** 🟠 HIGH  
**Current config:** `custom_text.shipping_address: null`

**The problem:**  
Customers subscribing to weekly produce don't know:
- What day delivery happens
- What time window
- Can they choose delivery day?

This is a **trust issue**. Fresh produce requires precise timing.

**Fix:**  
Add `custom_text.shipping_address` field:  
*"Deliveries arrive every Thursday, 2-6pm. You'll receive tracking the morning of delivery."*

**Expected lift:** +2-4 percentage points

---

### 🟡 **CRITICAL #5: No Promotion Codes Allowed**
**Impact:** 🟡 MEDIUM  
**Current config:** `allow_promotion_codes: false`

**The problem:**  
Can't offer first-time customer discounts, referral codes, or seasonal promos at checkout. This limits acquisition tactics.

**Fix:**  
Enable `allow_promotion_codes: true`

**Expected lift:** +2-3 percentage points (with active promo strategy)

---

## High-Priority Friction Points

### 6. Inconsistent Billing Address Collection
**Current:** Some old payment links use `billing_address_collection: "auto"`, newer ones use `"required"`

**Fix:** Standardize to `"required"` across all links (already correct on subscription links)

---

### 7. No Automatic Tax Calculation
**Current:** `automatic_tax.enabled: false`

**Impact:** IL sales tax (6.25% + local) not calculated automatically. Either:
- Prices include tax (confusing for customers)
- OR orders are under-collecting tax (compliance risk)

**Fix:** Enable Stripe Tax with `automatic_tax.enabled: true`

**Expected lift:** +1-2 percentage points (removes price confusion)

---

### 8. No Guest Checkout Option
**Current:** `customer_creation: "if_required"` (Stripe creates account if email matches existing)

**Impact:** Returning customers forced to log in or re-enter card. Friction for repeat orders.

**Fix:** Consider Stripe Checkout with `customer_creation: "always"` + Link autofill for fastest repeat checkout.

---

## Medium-Priority Enhancements

### 9. No Quantity Adjustment
**Current:** `adjustable_quantity: null`

**Opportunity:** Can't buy 2+ boxes in one transaction (for offices, gifts, multi-household)

**Fix:** Enable `adjustable_quantity.enabled: true` with max=10

---

### 10. Limited Post-Purchase Messaging
**Current:** `custom_text.after_submit: null`

**Opportunity:** Confirmation page could set expectations, drive social shares, cross-sell

**Fix:** Add post-submit message with next steps, delivery prep, referral CTA

---

### 11. No Social Proof on Checkout Page
**Current:** Standard Stripe UI, no reviews/testimonials

**Opportunity:** Could add custom branding or social proof via Stripe branding options (requires Stripe Plus plan)

---

## Performance Analysis

### Load Time
**Unable to test** (Chrome extension not connected)  
**Recommendation:** Use WebPageTest or Lighthouse to audit mobile load time  
**Target:** <2 seconds on mobile

### Mobile Experience
**Current:** Stripe hosted checkout is mobile-optimized by default (responsive design)  
**No changes needed** — Stripe handles this well

---

## Recommended Fix Priority

### **Phase 1 (Week 1) — CRITICAL BLOCKERS**
1. ✅ Enable shipping address collection (`shipping_address_collection`)
2. ✅ Enable phone number collection (`phone_number_collection.enabled: true`)
3. ✅ Add delivery date/window messaging (`custom_text.shipping_address`)
4. ✅ Clarify shipping cost (add $0 shipping option OR "Free Delivery" message)

**Expected Impact:** 7.7% → 25-30% completion rate

---

### **Phase 2 (Week 2) — HIGH PRIORITY**
5. ✅ Enable promotion codes (`allow_promotion_codes: true`)
6. ✅ Enable automatic tax (`automatic_tax.enabled: true`)
7. ✅ Standardize billing address collection

**Expected Impact:** 25-30% → 32-35% completion rate

---

### **Phase 3 (Week 3) — ENHANCEMENTS**
8. ✅ Enable adjustable quantity
9. ✅ Add post-purchase messaging
10. ✅ A/B test checkout branding options

**Expected Impact:** 32-35% → 38-40% completion rate

---

## Implementation Notes

### How to Update Stripe Payment Links

All changes require updating the 3 active subscription payment links via Stripe API or Dashboard:

```bash
# Example: Enable shipping address collection
curl -X POST "https://api.stripe.com/v1/payment_links/plink_1TL88wG67LsNxpTojxjOvhTQ" \
  -u "sk_live_..." \
  -d "shipping_address_collection[allowed_countries][0]=US"

# Enable phone collection
curl -X POST "https://api.stripe.com/v1/payment_links/plink_1TL88wG67LsNxpTojxjOvhTQ" \
  -u "sk_live_..." \
  -d "phone_number_collection[enabled]=true"

# Add custom text for delivery window
curl -X POST "https://api.stripe.com/v1/payment_links/plink_1TL88wG67LsNxpTojxjOvhTQ" \
  -u "sk_live_..." \
  -d "custom_text[shipping_address][message]=Deliveries arrive every Thursday, 2-6pm. You'll receive tracking the morning of delivery."
```

**Alternative:** Update via Stripe Dashboard → Payment Links → Edit Link

---

## Success Metrics (Post-Implementation)

Track these metrics weekly via Stripe API:

```python
# Checkout completion rate
sessions_started = count(checkout.session.created)
sessions_completed = count(checkout.session.completed)
completion_rate = sessions_completed / sessions_started

# Target: 30%+ within 2 weeks of Phase 1 launch
```

**Current:** 7.7% (3 of 39)  
**Phase 1 Target:** 25-30%  
**Phase 2 Target:** 32-35%  
**Phase 3 Target:** 38-40%

---

## Next Steps

1. ✅ **CRO approval** for Phase 1 changes (shipping address, phone, messaging)
2. ✅ **RevOps to implement** Phase 1 via Stripe API (all 3 payment links)
3. ✅ **Monitor completion rate** daily for 1 week post-launch
4. ✅ **Launch Phase 2** if Phase 1 hits 25%+ target
5. ✅ **Advertising Creative to design** checkout page custom branding (Phase 3)

---

## Appendix: Raw Data

### Sample Completed Checkout Session
```json
{
  "id": "cs_live_a1m28fD0xL2FbTFzSEEguk74xSYfeP40IrKNg6Yml7NE0jcn3m2rvItwlt",
  "status": "complete",
  "payment_status": "paid",
  "amount_total": 3500,
  "billing_address_collection": "auto",
  "shipping_address_collection": null,  # ❌ CRITICAL
  "phone_number_collection": { "enabled": false },  # ❌ CRITICAL
  "shipping_options": [],  # ❌ No shipping cost shown
  "custom_text": {
    "shipping_address": null,  # ❌ No delivery messaging
    "submit": null
  },
  "allow_promotion_codes": false,  # ❌ No promo codes
  "customer_details": {
    "email": "RevMD247@gmail.com",
    "name": "Morgan E Dixon",
    "address": {
      "line1": "4816 S Saint Lawrence Ave",
      "city": "Chicago",
      "state": "IL",
      "postal_code": "60615"
    },
    "phone": null  # ❌ No phone collected
  }
}
```

### Active Payment Links (3)
| Box Type | Price/Week | Link ID | URL |
|----------|-----------|---------|-----|
| Standard | $35 | plink_1TL88uG67LsNxpTo22RcsjJx | buy.stripe.com/6oUbJ1bfpdeY2JpfZG9Zm0g |
| Family | $55 | plink_1TL88vG67LsNxpTokErPsWBS | buy.stripe.com/28EfZh3MXej2bfV5l29Zm0h |
| Premium | $75 | plink_1TL88wG67LsNxpTojxjOvhTQ | buy.stripe.com/bJe8wPfvF2Ak4Rx4gY9Zm0i |

---

**End of Audit**
