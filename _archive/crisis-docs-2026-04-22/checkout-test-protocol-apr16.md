# Checkout Test Protocol — Post-Hotfix Verification
**Date:** April 16, 2026  
**Hotfix:** Commit `36fc0ec` (replaced calendar widget with dropdown)  
**Tester:** CRO/Board/RevOps  
**Purpose:** Verify checkout flow works end-to-end after CTO's emergency fix

---

## Critical Context

**Before hotfix (Apr 9-16):**
- 27 checkout sessions started
- 0 completed purchases
- **100% abandon rate**
- Root cause: Broken delivery calendar widget (not collecting dates/addresses)

**After hotfix (Apr 16, 19:01):**
- Calendar widget → Simple dropdown
- Fixed BOTH flows (one-time + subscription)
- Needs verification on desktop + mobile

---

## Test Protocol

### Desktop Test (Chrome/Edge)

1. **Navigate to checkout**
   - URL: `https://unclemays.com/checkout/starter-box`
   - Or: `https://unclemays.com/subscribe/community-box`

2. **Delivery step**
   - [ ] Delivery date dropdown appears (NOT broken calendar)
   - [ ] Can select a date from dropdown
   - [ ] Address autocomplete works (Google Places)
   - [ ] Phone number field accepts input
   - [ ] "Continue to Payment" button enabled after form complete

3. **Payment step**
   - [ ] Stripe payment form loads
   - [ ] Can enter test card: `4242 4242 4242 4242` / any future date / any 3-digit CVC
   - [ ] Promo code field visible
   - [ ] Can apply `FREESHIP` promo ($10 off shows)
   - [ ] "Complete Purchase" button enabled

4. **Purchase completion**
   - [ ] Stripe processes payment
   - [ ] Redirects to order success page
   - [ ] Order appears in Stripe dashboard
   - [ ] Confirmation email sent (check spam)

### Mobile Test (iPhone/Android)

5. **Navigate to checkout** (same URLs as desktop)

6. **Delivery step (mobile)**
   - [ ] Dropdown works on mobile browser (NOT calendar)
   - [ ] Address autocomplete works
   - [ ] Form fields sized correctly for mobile
   - [ ] No horizontal scrolling required

7. **Payment step (mobile)**
   - [ ] Stripe mobile payment form loads
   - [ ] Can complete payment with test card
   - [ ] FREESHIP promo works

8. **Completion (mobile)**
   - [ ] Redirects to success page
   - [ ] Order in Stripe

---

## Tracking Verification

### Meta Pixel (Check Browser Console)

9. **On checkout page:**
   - [ ] `fbq('track', 'ViewContent')` fires
   - [ ] Console shows: `[Facebook Pixel] ViewContent`

10. **On order success page:**
    - [ ] `fbq('track', 'Purchase')` fires
    - [ ] Purchase value included in event

### GA4 (Check Network Tab → `collect?v=2`)

11. **On checkout:**
    - [ ] `page_view` event sent to GA4

12. **On purchase:**
    - [ ] `purchase` event sent to GA4
    - [ ] Transaction ID, value, currency included

### Google Ads (Server-side, check logs)

13. **After purchase:**
    - [ ] Stripe webhook fires (`checkout.session.completed`)
    - [ ] Trigger.dev task `upload-google-ads-conversion` invoked
    - [ ] Conversion appears in Google Ads dashboard (within 24h)

---

## Pass/Fail Criteria

**PASS if:**
- ✅ Desktop checkout completes end-to-end
- ✅ Mobile checkout completes end-to-end
- ✅ Delivery date dropdown works (no calendar errors)
- ✅ Address, phone, payment all collect correctly
- ✅ Order appears in Stripe
- ✅ Meta Pixel ViewContent + Purchase fire
- ✅ GA4 purchase event fires

**FAIL if:**
- ❌ Any step errors/blocks completion
- ❌ Delivery date dropdown broken
- ❌ Payment form doesn't load
- ❌ Tracking events don't fire
- ❌ Order doesn't appear in Stripe

---

## If Test Fails

**DO NOT launch paid ads tomorrow (Apr 17).**

1. Screenshot the error
2. Note which step failed (delivery/payment/tracking)
3. Escalate to CTO immediately
4. Hold launch until fix deployed and re-tested

---

## If Test Passes

**Green light for launch:**

1. ✅ Mark [UNC-337](/UNC/issues/UNC-337) complete
2. ✅ Activate Meta campaigns at 9am Apr 17 ($2K budget)
3. ✅ Activate Google Performance Max at 9am Apr 17 ($1K budget)
4. ✅ Monitor first 4 hours (CTR, CPC, checkout sessions, conversions)
5. ✅ Report to CRO by 1pm Apr 17

---

## Test Checklist Summary

**Desktop:**
- [ ] Checkout URL loads
- [ ] Delivery dropdown works
- [ ] Address/phone collect
- [ ] Payment form loads
- [ ] FREESHIP promo applies
- [ ] Purchase completes
- [ ] Order in Stripe
- [ ] Tracking fires

**Mobile:**
- [ ] Checkout URL loads
- [ ] Delivery dropdown works (mobile)
- [ ] Payment form works (mobile)
- [ ] Purchase completes
- [ ] Order in Stripe

**Total tests:** 16 checkboxes  
**Required pass rate:** 16/16 (100%)

---

**Next step:** CRO/board executes this protocol tonight (Apr 16, 7-11pm) and reports results before 9am launch decision.
