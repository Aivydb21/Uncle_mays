# Checkout Subscription Blocker Analysis — 2026-04-17

## 🚨 BLOCKER CONFIRMED: Checkout Defaults to One-Time, Not Subscription

**Status:** BLOCKS Meta Ads activation  
**Owner:** CTO  
**Reporter:** CRO (via UNC-366 blocker #4)  
**Severity:** Critical — LTV/CAC math assumes subscription, but primary CTAs route to one-time checkout

---

## Executive Summary

The Meta ads campaign projects $101 CAC based on a 6-month LTV assumption ($270). **This LTV requires customers to subscribe for weekly deliveries.** 

However, **the primary conversion paths on unclemays.com route to one-time checkout, not subscription checkout.**

- ❌ Hero CTAs (3 box buttons) → `/checkout/` (one-time)
- ❌ Mobile CTAs → `/checkout/` (one-time)  
- ❌ Starter Box page → `/checkout/` (one-time)
- ✅ Pricing section toggle → `/subscribe/` (subscription, **but defaults on**)

**Result:** The site has two parallel checkout flows, but the **primary CTAs bypass subscription** entirely.

---

## Technical Findings

### Two Checkout Flows Exist

| Flow | Path | Payment Intent | Default? |
|------|------|----------------|----------|
| **One-time** | `/checkout/[product]` | `stripe.paymentIntents.create()` | ✅ YES (Hero, Mobile CTA, product pages) |
| **Subscription** | `/subscribe/[product]` | `stripe.subscriptions.create()` + setup intent | ⚠️ NO (only Pricing section, buried below fold) |

### Primary CTAs Route to One-Time Checkout

**Hero.tsx (lines 85-87):**
```tsx
<Link href={`/checkout/${box.slug}`}>
  {/* Starter, Family, Community boxes */}
</Link>
```

**MobileCTA.tsx (lines 36-50):**
```tsx
<a href="/checkout/starter">Order Starter Box</a>
<a href="/checkout/family">Order Family Box</a>
<a href="/checkout/community">Order Community Box</a>
```

**starter-box/page.tsx (line 22):**
```tsx
<Link href="/checkout/starter">
```

### Pricing Section Defaults to Subscription (But Not Primary CTA)

**Pricing.tsx (lines 84, 97-101):**
```tsx
const [isSubscription, setIsSubscription] = useState(true); // ✅ Defaults ON

if (isSubscription) {
  router.push(`/subscribe/${plan.checkoutSlug}`); // ✅ Subscription flow
} else {
  router.push(`/checkout/${plan.checkoutSlug}`);  // One-time flow
}
```

**BUT:** The Pricing section is mid-page, below the fold. Hero and Mobile CTAs are the primary conversion paths.

### Payment Intent API Difference

**One-time checkout** (`/api/checkout/intent`):
- Creates `paymentIntent` only (lines 77-107)
- No recurring billing
- Customer pays $30-95 once

**Subscription checkout** (`/api/checkout/subscribe-intent`):
- Creates `subscription` + `paymentIntent` (lines 104-124)
- Recurring weekly billing
- Customer pays $27-85.50/week (10% discount)

---

## Impact on Meta Ads LTV/CAC Math

**CRO's projected CAC:** $101  
**CRO's LTV assumption:** $270 (6-month subscription, ~26 orders at $10.38 avg profit)

**If customers use one-time checkout:**
- LTV = $10.38 (single order profit)
- CAC = $101
- **ROAS = 0.1x** ❌ (campaign loses money)

**If customers use subscription checkout:**
- LTV = $270 (26 weeks avg retention)
- CAC = $101
- **ROAS = 2.7x** ✅ (12.5x over full LTV, per CRO)

**The math ONLY works if customers subscribe.**

---

## Root Cause

When the site was built, two checkout flows were created:
1. `/checkout/` for one-time purchases (original)
2. `/subscribe/` for subscriptions (added later)

The **Hero and Mobile CTAs were never updated** to route to `/subscribe/` by default. They still point to `/checkout/`.

Only the Pricing section (mid-page, below fold) routes to `/subscribe/` by default.

---

## Recommended Fixes (in priority order)

### Option 1: Update Primary CTAs to Route to Subscription (RECOMMENDED)

**Change:**
- Hero CTAs: `/checkout/${slug}` → `/subscribe/${slug}`
- Mobile CTAs: `/checkout/${slug}` → `/subscribe/${slug}`
- Starter Box page: `/checkout/starter` → `/subscribe/starter`

**Files to edit:**
- `src/components/Hero.tsx` (line 87)
- `src/components/MobileCTA.tsx` (lines 36, 43, 50)
- `src/app/starter-box/page.tsx` (line 22)

**Pros:**
- Simple 3-file change
- Aligns with Meta ads LTV assumption
- No UX changes (subscription flow already built)

**Cons:**
- Users who want one-time can still toggle in Pricing section
- Requires testing the subscription flow end-to-end

**Effort:** 15 minutes + QA

---

### Option 2: Add Subscription Toggle to Hero/Mobile CTAs

**Change:**
- Add a "Subscribe & Save" vs "One-Time" toggle above Hero CTAs
- Same pattern as Pricing section (lines 128-152)
- Default to "Subscribe & Save" (10% off messaging)

**Pros:**
- Gives users choice upfront
- Matches Pricing section UX

**Cons:**
- More complex (requires state management in Hero)
- Adds decision fatigue to primary CTA
- May reduce conversion rate

**Effort:** 1-2 hours + QA

---

### Option 3: Redirect `/checkout/` to `/subscribe/` (Nuclear Option)

**Change:**
- Deprecate `/checkout/` flow entirely
- Redirect all `/checkout/` routes to `/subscribe/`
- Remove one-time option (subscription only)

**Pros:**
- Forces subscription (simplest LTV model)
- No CTAs to update

**Cons:**
- Removes one-time purchase option (may hurt conversion)
- Requires board approval (business model change)

**Effort:** 30 minutes + board discussion

---

## Testing Requirements (for any option)

Before activating Meta ads, verify:

1. **Subscription checkout works end-to-end**
   - Place test order via `/subscribe/starter`
   - Confirm Stripe creates subscription + payment intent
   - Verify Meta Pixel PURCHASE event fires
   - Check GA4 records purchase with correct revenue

2. **Stripe subscription settings**
   - Confirm weekly billing cycle
   - Verify 10% discount price IDs exist in Stripe dashboard
   - Test subscription cancellation flow

3. **Email confirmation**
   - Order confirmation email sends
   - Subscription details included (next delivery date, cancellation link)

4. **Abandoned cart recovery**
   - Verify subscription checkouts trigger recovery emails if abandoned
   - Test recovery email links route back to `/subscribe/` not `/checkout/`

---

## Blocker Status

**BLOCKED:** Meta ads cannot activate until checkout defaults to subscription OR CRO recalculates LTV/CAC for one-time purchases.

**Recommendation:** Implement Option 1 (update primary CTAs) before 2026-04-18 AM deadline.

**Owner:** CTO (this issue)  
**Dependency:** RevOps must verify Pixel PURCHASE event for subscriptions (separate blocker)

---

## Next Steps

1. **CTO:** Choose fix option (recommend Option 1)
2. **CTO:** Implement fix
3. **CTO:** Run end-to-end test purchase via `/subscribe/starter`
4. **RevOps:** Verify Meta Pixel PURCHASE event fires on test
5. **CTO:** Comment on UNC-366 with "Blocker cleared" + test results
6. **Board:** Review and approve for activation

**ETA for fix:** 2026-04-17 EOD (today)
