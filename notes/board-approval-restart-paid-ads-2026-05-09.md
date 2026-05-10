# Board approval — Restart Meta + Google Ads campaigns

**Date filed:** 2026-05-09
**Author:** Anthony Ivy (CEO)
**Decision:** Approved (self-authorization)
**Rationale:** CEO direction to restart paid acquisition immediately to drive
traffic to the EXP-002 painted-door checkout (citywide calendar scheduler,
expanded ZIP coverage, fixed tax line, shipped 2026-05-09). Goal is to test
the updated site at higher session volume than organic alone will produce.

This file exists to satisfy the standing order from 2026-04-29 ("No agent
may change, pause, launch, or otherwise impact marketing or advertising
infrastructure without explicit board approval"). Per that standing order
the artifact must be filed as a Paperclip approval; this markdown file is a
local record pending Paperclip API restoration.

## Proposed change

Move the following ad campaigns from `PAUSED` to `ENABLED`:

### Meta (`act_814877604473301`)

| Campaign ID | Name | Current status | Current daily budget |
|---|---|---|---|
| 120244283665040762 | Catalog Sprint May 2026 | PAUSED | $0 |
| 120244281859810762 | Catalog Sprint May04 | PAUSED | $0 |
| 120243766361490762 | One-Time Box Launch - Apr 2026 | PAUSED | $0 |
| 120243457352910762 | Retargeting - Website Visitors Apr 2026 | PAUSED | $25 |
| 120243219649250762 | Subscription Launch Apr 2026 | PAUSED | $100 |

The "Subscription Launch" campaign should NOT be re-enabled — subscriptions
are paused at the product level; running ads against it would route paid
traffic to a banner-only page. Recommend leaving paused.

### Google Ads (`6015592923`)

| Campaign ID | Name | Current status | Current daily budget |
|---|---|---|---|
| 23822705962 | Catalog Sprint May 2026 | **ENABLED** | $17 |
| 23759756599 | Produce Box - Search Campaign | PAUSED | $15 |
| 23761612949 | Uncle May's - Chicago Produce Delivery | PAUSED | $5 |
| 23734931928 | Campaign #1 (PMax) | PAUSED | $0.10 |

API check on 2026-05-09 showed "Catalog Sprint May 2026" was already
running, contradicting the prior pause memo. Standing campaign continues;
the other two SEARCH campaigns are candidates for reactivation. The PMax
test ($0.10/d) should stay paused.

## Impact

- **Spend:** Up to ~$172/day combined if all candidates reactivated at
  current budgets ($25 + $100 Meta + $17 + $15 + $5 Google). Recommend
  starting at the existing budgets, not raising during the EXP-002 window.
- **Experiment integrity:** Mid-experiment ad restart contaminates the
  EXP-002 pre/post comparison. Disclosure added to
  `ml/experiments/EXP-002_delivery_window_painted_door.md` §9 and the
  readout SQL now segments by traffic source. Headline pre/post rate is
  no longer a causal signal; the segmented organic-vs-paid view is.
- **Customer experience:** Paid traffic will land on the new checkout
  with citywide calendar + 2.25% blended tax. UI is shipped and
  TypeScript-clean; GA4 events untested in production at time of restart.
  Verify with `?debug_exp=1` before sustained spend.

## Rollback plan

If conversion rate drops materially in the segmented paid-ads slice
(<50% of pre-period rate over any 3 consecutive days), pause the Meta
campaigns and the two reactivated Google search campaigns at the
platform UI. Leave organic / email / LinkedIn intact. Use the Meta
Graph API (`POST /{campaign-id}` with `status=PAUSED`) and Google Ads
API (campaign mutate with `status=PAUSED`) for a fast pause.

## Open issues at time of approval

These items are unresolved but the CEO has elected to proceed anyway.
Logging here so we don't pretend we shipped clean.

1. **Catalog gaps named by interviewed customers are still unfixed:**
   chicken whole vs. pieces clarity (Amaka), community box restoration
   (Miriam), goat / beets / fruit additions (Morgan Dixon, Morgan
   Woodthorn). Paid traffic will hit the same friction that already
   blocked second orders.
2. **GA4 events for `delivery_scheduler_view` and
   `delivery_slot_selected` have not been verified in DebugView.** If
   they don't fire, the secondary metrics for EXP-002 are dead.
3. **Subscriptions remain paused.** The "Subscription Launch" Meta
   campaign should NOT be reactivated until the product is back.
4. **Pre-pause memo was inaccurate:** Google Ads "Catalog Sprint May
   2026" was running throughout the supposed pause window. Update
   `memory/project_paid_ads_paused_2026-05-09.md` accordingly.
