# Meta Ad URL Updates — Execution Guide

**Issue:** [UNC-880](/UNC/issues/UNC-880)  
**Date:** 2026-05-06  
**Status:** ✅ Board approved  
**Campaign:** One-Time Box Launch - Apr 2026 (`120243766361490762`)

---

## Overview

Update 8 Meta ad creatives to point directly to `/shop` instead of redirect pages. This eliminates the redirect hop that causes 75% of paid traffic to bounce before reaching the catalog.

**Expected impact:** /shop reach rate from 25% → 40-50%

---

## URL Change Mapping

### Base URL Structure

**Current (redirect pages):**
```
https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=<content>
https://unclemays.com/checkout/family?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=<content>&promo=FRESH10
```

**New (direct to catalog):**
```
https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=<content>&promo=FRESH10
```

**Key changes:**
- Replace `/get-started` → `/shop`
- Replace `/checkout/family` → `/shop`
- Add `&promo=FRESH10` to all URLs (was missing on some)
- Preserve all UTM parameters

---

## Creative-by-Creative Updates

### 1. Cold LAL - Don Jhonsan 4
- **Creative ID:** `2115043712650640`
- **Current URL:** `https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-lookalike`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-lookalike&promo=FRESH10`

### 2. Cold LAL - Don Video 5
- **Creative ID:** `1482124910025625`
- **Current URL:** `https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-lookalike`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-lookalike&promo=FRESH10`

### 3. Cold Broad - Don Jhonsan 4
- **Creative ID:** `1316712163694921`
- **Current URL:** `https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad&promo=FRESH10`

### 4. Cold Broad - Don Video 5
- **Creative ID:** `3120592748138275`
- **Current URL:** `https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad&promo=FRESH10`

### 5. Retarget - Don Jhonsan 4
- **Creative ID:** `1473006714222124`
- **Current URL:** `https://unclemays.com/checkout/family?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=retargeting&promo=FRESH10`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=retargeting&promo=FRESH10`

### 6. Retarget - Don Video 5
- **Creative ID:** `941299425463490`
- **Current URL:** `https://unclemays.com/checkout/family?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=retargeting&promo=FRESH10`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=retargeting&promo=FRESH10`

### 7. Engagement Seeded - Don Jhonsan 4
- **Creative ID:** `1526609295754283`
- **Current URL:** `https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=engagement-seeded&promo=FRESH10`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=engagement-seeded&promo=FRESH10`

### 8. Engagement Seeded - Don Video 5
- **Creative ID:** `1699929914695409`
- **Current URL:** `https://unclemays.com/get-started?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=engagement-seeded&promo=FRESH10`
- **New URL:** `https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=engagement-seeded&promo=FRESH10`

---

## Execution Steps (Meta Ads Manager)

### Option 1: Via Meta Ads Manager UI

1. **Navigate to Campaign:**
   - Log in to Meta Ads Manager
   - Select Ad Account: `act_814877604473301`
   - Find campaign: "One-Time Box Launch - Apr 2026" (ID: `120243766361490762`)

2. **For each creative (8 total):**
   - Click on the ad creative ID
   - Edit the creative
   - Find the "Website URL" or "Destination URL" field
   - Replace with the new URL from the mapping above
   - **Verify UTM parameters are intact**
   - Save changes

3. **Verify updates:**
   - Click "Preview" on each updated ad
   - Test the destination URL in a browser
   - Confirm it lands directly on `/shop` (not `/get-started` or `/checkout/family`)
   - Confirm `promo=FRESH10` is in the URL bar

### Option 2: Via Meta Marketing API (faster)

If you have API access set up:

```bash
# Update creative destination URL
curl -X POST \
  "https://graph.facebook.com/v18.0/{CREATIVE_ID}" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d "object_story_spec={
    'link_data': {
      'link': 'NEW_URL_HERE'
    }
  }"
```

**Note:** You'll need to fetch the full creative spec first, update only the link field, and post back. See Meta Marketing API docs for full creative update syntax.

---

## Post-Update Checklist

- [ ] All 8 creatives updated with new URLs
- [ ] Each URL tested manually (opens directly to `/shop`)
- [ ] UTM parameters verified in browser URL bar
- [ ] `promo=FRESH10` present in all URLs
- [ ] No 404 errors or redirect loops
- [ ] Ad preview still shows correct video/copy
- [ ] Changes saved in Meta Ads Manager

---

## Monitoring Plan (7 Days)

**Primary metric:**
- **Session Start → /shop page view rate**
  - Baseline: 25.2% (109/432)
  - Target: 40%+
  - Check: GA4 or BigQuery funnel query

**Secondary metrics:**
- /shop → add_to_cart rate (baseline: 5.5%)
- add_to_cart → purchase rate (baseline: 33%)
- Overall paid CVR (baseline: 0.46%)

**Check daily for 7 days, then report results in:**
- New funnel analysis (similar to `analytics/funnel-step-analysis.py`)
- Comment on [UNC-880](/UNC/issues/UNC-880) with before/after comparison

---

## Rollback Plan

If /shop reach rate doesn't improve or gets worse:

1. **In Meta Ads Manager:**
   - Revert each creative back to original URLs (see "Current URL" above)
   - Save changes
   - Monitor for 24 hours

2. **Diagnose further:**
   - Check if redirects were actually the problem
   - Consider other hypotheses (page load speed, mobile UX, ad scent mismatch)
   - May need deeper CRO investigation

**Rollback time:** <5 minutes per creative (40 minutes total)

---

## Reference Documents

- **Original diagnosis:** `analytics/cro-recommendation-unc-880.md`
- **Current ad config:** `ad-exports/onetime-launch-apr26/DEPLOYED-IDS.md`
- **Campaign IDs:** `.meta-campaign-ids.json`
- **Board approval:** [UNC-880](/UNC/issues/UNC-880) (approved 2026-05-06)

---

## Contact

- **CRO Agent:** 0df6fe9a-9676-41e7-89e9-724d05272a51
- **Issue:** [UNC-880](/UNC/issues/UNC-880)
- **Approval Date:** 2026-05-06
- **Executor:** TBD (Marketing team or Advertising Creative agent)
