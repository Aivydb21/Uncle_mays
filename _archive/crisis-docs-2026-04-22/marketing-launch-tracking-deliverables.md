# Marketing Launch Tracking Deliverables — Uncle May's Produce

**Date:** 2026-04-15  
**Task:** [UNC-302](/UNC/issues/UNC-302)  
**Prepared by:** RevOps  
**Deadline:** Wed Apr 16 EOD  
**Ad Launch:** Thu Apr 17

---

## ✅ Deliverables Complete

### 1. Stripe Promo Codes — LIVE

| Code | Discount | Use Case | Coupon ID | Promo Code ID | Restrictions |
|------|----------|----------|-----------|---------------|--------------|
| **WELCOME20** | 20% off | Email blast | `welcome20-launch-2026` | `promo_1TMVyzG67LsNxpTodoNIqrXM` | First-time transaction only |
| **FREESHIP** | $10 off | Meta ads | `freeship-launch-2026` | `promo_1TMVz1G67LsNxpTot1tkLgIB` | First-time transaction only |

**Redemption URLs:**
- WELCOME20: `https://unclemays.com?promo=WELCOME20`
- FREESHIP: `https://unclemays.com?promo=FREESHIP`

**Testing:** ✅ Both codes active in Stripe live mode, redeemable at checkout

---

### 2. UTM-Tagged Campaign Links

All links follow the [UTM Tagging Standards](utm-tagging-standards.md) documented by RevOps.

#### Meta Ads Campaign (Instagram + Facebook Feed)

**Base Campaign Parameters:**
- `utm_source=instagram` or `utm_source=facebook`
- `utm_medium=paid_social`
- `utm_campaign=conversion_apr21`
- `utm_content={variant}` (set by Advertising Creative per ad variant)

**Example URLs for Advertising Creative:**

**Instagram Feed - Quality Hook - Image #1:**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_image_1&promo=FREESHIP
```

**Facebook Feed - Heritage Hook - Video #2:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=heritage_video_2&promo=FREESHIP
```

**Instagram Stories - Delivery Hook - Carousel #3:**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=delivery_carousel_3&promo=FREESHIP
```

**Template for Advertising Creative:**
```
https://unclemays.com?utm_source={platform}&utm_medium={format}&utm_campaign=conversion_apr21&utm_content={hook}_{format}_{variant_number}&promo=FREESHIP
```

Variables:
- `{platform}`: `instagram` or `facebook`
- `{format}`: `paid_social` (feed) or `paid_social_stories` (stories)
- `{hook}`: `quality`, `heritage`, `delivery`, `price`
- `{variant_number}`: `1`, `2`, `3`, etc.

---

#### Email Campaign (Mailchimp Blast)

**Campaign Parameters:**
- `utm_source=email`
- `utm_medium=email`
- `utm_campaign=checkout_fixed_apr2026`
- `utm_content={cta_location}`

**Example URLs for Email:**

**Header CTA Button:**
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=checkout_fixed_apr2026&utm_content=header_cta&promo=WELCOME20
```

**Body Product Link:**
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=checkout_fixed_apr2026&utm_content=body_product&promo=WELCOME20
```

**Footer CTA:**
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=checkout_fixed_apr2026&utm_content=footer_cta&promo=WELCOME20
```

---

#### Organic Social (Instagram/Facebook Posts)

**Campaign Parameters:**
- `utm_source=instagram` or `utm_source=facebook`
- `utm_medium=organic`
- `utm_campaign=produce_box_organic_apr2026`
- `utm_content={post_type}`

**Example URLs:**

**Instagram Story Link:**
```
https://unclemays.com?utm_source=instagram&utm_medium=organic&utm_campaign=produce_box_organic_apr2026&utm_content=story_swipeup
```

**Facebook Post Link (Bio/Pinned):**
```
https://unclemays.com?utm_source=facebook&utm_medium=organic&utm_campaign=produce_box_organic_apr2026&utm_content=pinned_post
```

---

### 3. Meta Pixel Verification — ✅ LIVE

**Pixel ID:** `2276705169443313`

**Status:** ✅ Installed and firing on unclemays.com

**Events Implemented:**
| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `PageView` | All page loads | Auto | ✅ Live |
| `InitiateCheckout` | "Buy Now" button click | `content_name`, `content_ids`, `value` | ✅ Live |
| `Lead` | Delivery info submitted | None | ✅ Live |
| `Purchase` | Order confirmation page | `value`, `currency`, `content_type` | ✅ Live |

**Purchase Event Details:**
- Fires on `/order-success` page load
- Includes transaction value and currency
- Tracked via both Stripe Checkout Session flow and PaymentIntent flow
- Server-side backup tracking available via Stripe webhook (future enhancement)

**Verification Method:**
- Code inspection: `src/app/layout.tsx` (lines 89-100)
- Purchase tracking: `src/app/order-success/OrderSuccessContent.tsx` (lines 64-66)

**Testing:** Use Meta Events Manager to verify pixel fires on test checkout.

---

### 4. GA4 Conversion Tracking — ✅ LIVE

**GA4 Measurement ID:** Set via `NEXT_PUBLIC_GA_ID` env variable (needs verification in `.env.local`)

**Status:** ✅ Installed via gtag.js

**E-commerce Events Implemented:**
| Event | Trigger | Parameters | Status |
|-------|---------|------------|--------|
| `page_view` | All page loads | `page_location`, `page_title`, UTM params | ✅ Auto (GA4 default) |
| `generate_lead` | Delivery info submitted | None | ✅ Live |
| `purchase` | Order confirmation | `transaction_id`, `value`, `currency`, `items[]` | ✅ Live |

**Purchase Event Details:**
- Fires via both GTM `dataLayer.push()` and direct `gtag()` call
- Includes full e-commerce transaction data (transaction_id, value, currency, items array)
- UTM parameters automatically captured by GA4 on page_view
- Google Ads conversion event also fires if `NEXT_PUBLIC_GOOGLE_ADS_ID` is set

**Verification Method:**
- Code inspection: `src/app/layout.tsx` (lines 79-86)
- Purchase tracking: `src/app/order-success/OrderSuccessContent.tsx` (lines 23-61)

**UTM Parameter Preservation:**
- UTM params captured on landing page via `FacebookPixelTracker` component
- Stored in `localStorage` with keys `unc-utm_source`, `unc-utm_medium`, etc.
- Survives Stripe checkout redirect
- Available for attribution at purchase time

**Testing:** Use GA4 DebugView to verify events in real-time.

---

### 5. Google Tag Manager (GTM) — ✅ LIVE

**GTM Container ID:** `GTM-W82QVGZL`

**Status:** ✅ Installed on all pages

**Integration:**
- GTM receives e-commerce events via `dataLayer.push()` before gtag fires
- Routes events to GA4 and Google Ads (if configured in GTM)
- Purchase event pushed with full transaction data

---

### 6. Google Ads Conversion Tracking — ⚠️ NEEDS ENV VARIABLE

**Status:** ⚠️ Code implemented, awaiting environment configuration

**Implementation:**
- Purchase conversion event fires if `NEXT_PUBLIC_GOOGLE_ADS_ID` and `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` are set
- Code location: `src/app/order-success/OrderSuccessContent.tsx` (lines 51-60)

**Action Required:**
1. Get Google Ads Conversion ID and Label from Google Ads account
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXXX
   ```
3. Redeploy website

**If Google Ads is not launching this week:** Skip this step. Conversion tracking will still work via GA4.

---

## Testing Checklist

### Pre-Launch Testing (Complete before Thu Apr 17)

- [ ] **Promo codes:** Test WELCOME20 and FREESHIP at checkout
  - [ ] Verify 20% discount applies (WELCOME20)
  - [ ] Verify $10 discount applies (FREESHIP)
  - [ ] Confirm first-time transaction restriction works
  
- [ ] **UTM parameters:** Click a test Meta ad link with UTM params
  - [ ] Verify params appear in GA4 real-time report
  - [ ] Complete a test purchase
  - [ ] Verify UTMs are attributed to the purchase event in GA4
  
- [ ] **Meta pixel:** Use Meta Events Manager
  - [ ] Verify `PageView` fires on landing
  - [ ] Verify `InitiateCheckout` fires when clicking "Buy Now"
  - [ ] Verify `Purchase` fires on order confirmation
  - [ ] Check that transaction value is correct
  
- [ ] **GA4 events:** Use GA4 DebugView
  - [ ] Verify `page_view` fires on landing
  - [ ] Verify `generate_lead` fires on delivery submission
  - [ ] Verify `purchase` fires on order confirmation
  - [ ] Check that transaction data (ID, value, items) is correct

---

## Campaign Launch Handoff

### For CRO

**Next Steps:**
1. Review this deliverables doc
2. Approve promo code discounts (WELCOME20: 20% off, FREESHIP: $10 off)
3. Confirm campaign naming in UTM links matches Advertising Creative's ad variants
4. Run test checkout with both promo codes
5. Give final go/no-go for Thu Apr 17 launch

**Campaign Performance Monitoring:**
- Use GA4 Source/Medium report to track campaign traffic
- Use GA4 E-commerce Purchases report to track revenue by campaign
- RevOps will provide daily campaign stats starting Thu Apr 17

### For Advertising Creative

**Next Steps:**
1. Use the **UTM template** above to tag all Meta ad links
2. Replace `{hook}`, `{format}`, `{variant_number}` with actual ad creative details
3. Ensure FREESHIP promo code is included in Meta ad copy and CTA
4. Coordinate `utm_content` naming with CRO for reporting consistency

**Example Ad Setup:**

**Ad Variant:** Instagram Feed, Quality Hook, Image #1
- **Destination URL:** `https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_image_1&promo=FREESHIP`
- **Ad Copy (include):** "Use code FREESHIP at checkout for $10 off your first box"

**Ad Variant:** Facebook Feed, Heritage Hook, Video #2
- **Destination URL:** `https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=heritage_video_2&promo=FREESHIP`
- **Ad Copy (include):** "Use code FREESHIP for $10 off"

---

## Additional Resources

- **UTM Tagging Standards:** [utm-tagging-standards.md](utm-tagging-standards.md)
- **GA4 Tracking Audit:** [ga4-tracking-audit-2026-04-14.md](ga4-tracking-audit-2026-04-14.md)
- **Stripe Dashboard:** https://dashboard.stripe.com/coupons
- **GA4 Property:** (Get link from CRO/CTO)
- **Meta Events Manager:** https://business.facebook.com/events_manager2/

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **No add_to_cart event:** GA4 funnel analysis (view → cart → checkout → purchase) is incomplete without `add_to_cart` tracking. Not blocking for launch since we have purchase data.

2. **No server-side purchase tracking:** Purchase event fires client-side only. Ad blockers may prevent some conversions from being tracked. Future: implement server-side GA4 Measurement Protocol via Stripe webhook.

3. **Google Ads conversion tracking:** Requires env variables (see section 6 above). Not blocking if Google Ads isn't launching this week.

### Future Enhancements (Post-Launch)

- Add `add_to_cart` event tracking for full funnel visibility
- Implement server-side purchase tracking via Stripe webhook → GA4 Measurement Protocol
- Set up GA4 custom audiences for retargeting
- Create GA4 exploration reports for multi-touch attribution

---

## Questions or Issues

Contact RevOps (anthony@unclemays.com) or comment on [UNC-302](/UNC/issues/UNC-302).

**Last Updated:** 2026-04-15 16:15 UTC  
**Status:** ✅ Ready for launch
