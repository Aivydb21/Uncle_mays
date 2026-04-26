# One-Time Box Launch — Deployed Campaign Reference

**Status:** Created 2026-04-26, all in PAUSED state, awaiting Anthony to activate from Meta Ads Manager UI after final review.

## Meta — Campaign

**Campaign ID:** `120243766361490762`
**Name:** "One-Time Box Launch - Apr 2026"
**Objective:** OUTCOME_SALES
**Buying:** AUCTION
**Status:** PAUSED

## Meta — Ad Sets (3, all PAUSED)

| Ad Set | ID | Daily | Targeting | Audience |
|---|---|---|---|---|
| Cold Lookalike (DISABLED - rebuild seed first) | `120243766364840762` | $30 | (paused; do not activate) | LAL seed too small (~20 customer emails). Rebuild as engagement audience first. |
| Cold - Chicagoland Metro South 25-45 | `120243766365290762` | $15 | 33 service-area ZIPs (south Chicago city + south suburbs), age 25-45, both genders | (no custom audience) |
| Retargeting - Checkout Abandoners 30d | `120243766365650762` | $5 | Same 33 ZIPs | Checkout Abandoners 30d `120242831730990762` |

### Targeting refinement applied 2026-04-26 (post-deploy)

Original targeting was Chicago city + 25mi radius and age 25-55. Refined in two passes:

Pass 1 (early Apr 26): south-side Chicago ZIPs only (606xx), age 25-40, women only on Cold Broad. Cold Lookalike paused (seed too small).

Pass 2 (later Apr 26): expanded service area to full Chicagoland metro south — added the south suburbs (Calumet City, Dolton, Harvey, Markham, Hazel Crest, Homewood, Flossmoor, Lansing, South Holland, Matteson, Olympia Fields, Richton Park, Posen, Blue Island, Riverdale, Chicago Heights). Required a code change to expand the ZIP validator at the same time — see commit `a132a5f` introducing [`src/lib/service-area.ts`](../../src/lib/service-area.ts) as the single source of truth. Cold Broad widened to age 25-45 and both genders.

### To rebuild a strong cold ad set (do in Ads Manager UI, ~5 min)

The fastest path to a real warm-to-cold ad set is to create engagement custom audiences from the existing FB Page and Don video views, then either target them directly or use them as lookalike seeds:

1. **In Ads Manager → Audiences → Create → Custom Audience → Facebook Page**
   - Select "Uncle May's" page
   - Include: people who engaged with any post or ad
   - Retention: 180 days
   - Name: "FB Page Engagement (180d)"
2. **Create → Custom Audience → Video**
   - Select Don Jhonsan 4 (`1752439495721179`) and Don Video 5 (`2072553160256983`)
   - Include: people who watched at least 25%
   - Retention: 180 days
   - Name: "Don Video Viewers 25%+ (180d)"
3. **(Optional) Create → Custom Audience → Instagram Business Profile** — same pattern for IG engagers
4. Once those audiences are populated (typically 24-48h), either:
   - Use them directly as the targeting in a new ad set (warmer than cold, smaller volume), OR
   - Build 1% Lookalikes off them with Chicago location restriction (better lookalike seed than the customer email list because you'll have hundreds-to-thousands of engagers vs 20 customers)
5. Tell Claude the new audience IDs and I'll wire them into a fresh "Cold Lookalike (Engagement-seeded)" ad set with the same south-side geo + age 25-40 targeting.

All ad sets:
- billing_event=IMPRESSIONS, optimization_goal=OFFSITE_CONVERSIONS
- bid_strategy=LOWEST_COST_WITHOUT_CAP
- promoted_object pixel=2276705169443313, custom_event=PURCHASE
- targeting_automation.advantage_audience=0 (off, our targeting holds)
- start_time=now+10min so they're ready to flip

## Meta — Creatives (6 total, 2 videos × 3 landing destinations)

| Creative | ID | Video | Landing |
|---|---|---|---|
| OneTime - Cold LAL - Don Jhonsan 4 | `2115043712650640` | `1752439495721179` | `/get-started?utm_content=cold-lookalike` |
| OneTime - Cold LAL - Don Video 5 | `1482124910025625` | `2072553160256983` | `/get-started?utm_content=cold-lookalike` |
| OneTime - Cold Broad - Don Jhonsan 4 | `1316712163694921` | `1752439495721179` | `/get-started?utm_content=cold-broad` |
| OneTime - Cold Broad - Don Video 5 | `3120592748138275` | `2072553160256983` | `/get-started?utm_content=cold-broad` |
| OneTime - Retarget - Don Jhonsan 4 | `1473006714222124` | `1752439495721179` | `/checkout/family?utm_content=retargeting&promo=FRESH10` |
| OneTime - Retarget - Don Video 5 | `941299425463490` | `2072553160256983` | `/checkout/family?utm_content=retargeting&promo=FRESH10` |

All UTMs include: `utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26`

CTA: SHOP_NOW
All copy is em-dash-free, periods/commas/colons only.

## Meta — Ads (6 total, all PAUSED)

| Ad | ID | Ad Set |
|---|---|---|
| OneTime LAL - Don Jhonsan 4 | `120243766375490762` | Cold LAL |
| OneTime LAL - Don Video 5 | `120243766376170762` | Cold LAL |
| OneTime Broad - Don Jhonsan 4 | `120243766377060762` | Cold Broad |
| OneTime Broad - Don Video 5 | `120243766378270762` | Cold Broad |
| OneTime Retarget - Don Jhonsan 4 | `120243766379160762` | Retargeting |
| OneTime Retarget - Don Video 5 | `120243766380090762` | Retargeting |

## Google Ads — already live as of 2026-04-26

Updated as part of the same push. All in the existing "Produce Box - Search Campaign" (id `23759756599`):

- 3 new ENABLED responsive search ads with one-time copy:
  - Produce Delivery: ad `806894059175`
  - Local Intent: ad `806894059178`
  - Hyperlocal: ad `806894059181`
- 6 old RSAs paused (recoverable)
- 4 new campaign-level negative keywords: `subscription`, `free trial`, `cheap`, `wholesale`
- Bad keyword paused: `produce box subscription Chicago` (resource `customers/6015592923/adGroupCriteria/194132661806~2545932242637`)

## What Anthony needs to do before activating Meta

1. **Review each ad in Ads Manager** — preview on Story, Feed, and Reels placements to confirm video crops correctly
2. **Confirm targeting on the Broad ad set** — currently no interests set; may want to add Black-owned business / shop local interest clusters before going live
3. **Confirm budgets are right** — total $50/day caps as briefed
4. **Check Meta's policy review** — the new creatives need to pass automated review (typically <1 hour)
5. **Activate ad sets when ready** — flip campaign to ACTIVE, then each ad set, then each ad

Optional sanity: click each landing URL once to confirm the new homepage funnel renders correctly with the FRESH10 banner and one-time-default Pricing.

## Reverting if needed

Everything created here can be deleted via API or in the UI without affecting the prior Sub Launch campaign (which is still paused but intact). The 4 source videos are unchanged and still in use by the old Sub Launch creatives.
