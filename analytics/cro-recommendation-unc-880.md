# CRO Diagnosis: Ad Routing Issue Confirmed

**Issue:** [UNC-880](/UNC/issues/UNC-880)  
**Date:** 2026-05-05  
**Author:** CRO

## Root Cause

Meta ads route through **redirect pages** instead of landing directly on `/shop`. Users bounce at the redirect hop.

### Current Ad Landing Pages (from April 26 campaign)

**Cold traffic ads:**
- Destination: `/get-started?utm_content=cold-broad`
- Behavior: Server-side redirect → `/shop?promo=FRESH10&...`
- File: `src/app/get-started/page.tsx:17`

**Retargeting ads:**
- Destination: `/checkout/family?utm_content=retargeting&promo=FRESH10`
- Behavior: Next.js redirect → `/shop` (via `next.config.ts:20`)

**Legacy subscription campaign (paused):**
- Destination: `/products/weekly-produce-box`
- Behavior: Server-side redirect → `/shop` (via `src/app/products/weekly-produce-box/page.tsx:20`)

### Why This Causes 75% Drop-Off

1. **Redirect latency** — users see flash of loading/blank page before `/shop` renders
2. **Mobile experience** — 81.5% of traffic is mobile; redirects are jarring on mobile
3. **Ad scent loss** — user clicked a specific ad promise, lands on generic catalog after redirect
4. **Trust signal** — URL change during load feels like bait-and-switch

### Homepage CTA Audit

Homepage **does have** a clear CTA to `/shop`:
- Hero button: "Shop the catalog" → `/shop`
- Text: "$25 minimum. Use code FRESH10 for $10 off."
- Location: `src/components/Hero.tsx:68`

**Conclusion:** Homepage CTA is fine. The issue is that **paid ads aren't using it** — they route to redirect pages instead.

---

## Recommendation: Point Ads Directly to `/shop`

**Change Meta ad destination URLs from:**
```
https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad
```

**To:**
```
https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad&promo=FRESH10
```

### Benefits
- Eliminates redirect hop
- Users land directly on catalog
- Preserves UTM attribution
- Preserves promo code (explicitly in URL)
- Faster page load (no redirect latency)

### Expected Impact
- **Current:** 25.2% of paid sessions reach /shop (109/432)
- **Target:** 40–50% /shop reach rate
- **Reduction in drop-off:** From 75% to ~50%
- **Next bottleneck:** add_to_cart conversion (currently 6/109 = 5.5% of catalog visitors)

---

## Implementation Plan

### Phase 1: Board Approval (Required)

Per standing order 2026-04-29, Meta ad destination URL changes require board approval.

**Scope of change:**
- Update 8 ad creatives in campaign `120243766361490762` ("One-Time Box Launch - Apr 2026")
- Change only the destination URL; all other ad elements (creative, copy, targeting, budget) remain unchanged
- Preserve all UTM parameters for attribution tracking

### Phase 2: Update Ad Creatives

**Cold Broad ad set** (2 ads):
- Current: `/get-started?utm_content=cold-broad`
- New: `/shop?utm_content=cold-broad&promo=FRESH10`

**Cold Engagement Seeded ad set** (2 ads):
- Current: `/get-started?utm_content=engagement-seeded&promo=FRESH10`
- New: `/shop?utm_content=engagement-seeded&promo=FRESH10`

**Retargeting ad set** (2 ads):
- Current: `/checkout/family?utm_content=retargeting&promo=FRESH10`
- New: `/shop?utm_content=retargeting&promo=FRESH10`

**Cold LAL ad set** (2 ads, currently DISABLED):
- Update when/if reactivated
- New: `/shop?utm_content=cold-lookalike&promo=FRESH10`

**All UTM parameters to preserve:**
- `utm_source=meta`
- `utm_medium=paid`
- `utm_campaign=onetime-launch-apr26`
- `utm_content=<ad-set-specific>`

### Phase 3: Monitor Performance (7 days post-change)

**Primary metric:**
- Session Start → /shop page view rate
- Current: 25.2% (109/432)
- Target: 40%+

**Secondary metrics:**
- /shop → add_to_cart rate (current: 5.5%)
- add_to_cart → purchase rate (current: 33%)
- Overall paid CVR (current: 0.46%)

**Success criteria:**
- /shop reach rate improves to 40%+ within 7 days
- Paid CVR improves proportionally (0.46% → ~0.75%+)
- No degradation in downstream metrics (add_to_cart, purchase rates)

---

## File Citations

- `src/app/get-started/page.tsx:17` — redirect to /shop
- `next.config.ts:20-22` — /checkout/[product] redirects
- `src/components/Hero.tsx:68` — homepage CTA
- `ad-exports/onetime-launch-apr26/DEPLOYED-IDS.md:61-68` — current ad landing URLs
- `.meta-campaign-ids.json:109` — legacy subscription campaign (paused)

---

## Risk Assessment

**Low risk:**
- Change is isolated to destination URL only
- Redirects remain in place as fallback for old links
- UTM attribution preserved
- No changes to ad creative, copy, or targeting
- Easily reversible within Meta Ads Manager

**Rollback plan:**
- Revert destination URLs to `/get-started` in Meta Ads Manager
- Total rollback time: <5 minutes

---

## Next Actions

1. **CRO:** File board approval request via Paperclip
2. **Board:** Review and approve ad URL change
3. **CRO or Advertising Creative:** Execute URL updates in Meta Ads Manager
4. **RevOps:** Monitor funnel metrics daily for 7 days post-change
5. **CRO:** Report results and recommend next optimization (likely: /shop → add_to_cart conversion)
