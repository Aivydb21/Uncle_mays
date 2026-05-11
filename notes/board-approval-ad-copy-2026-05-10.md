# Board Approval Request — Ad Copy Refresh (every-day delivery + $20 min)

**Date:** 2026-05-10
**Requested by:** Anthony Ivy (CEO)
**Scope:** Meta + Google Ads creative copy only. No budget, audience, conversion, or pixel changes.
**Risk level:** Low (text-only edit; no spend change; rollback = revert text in-platform).

## Why

Two material discrepancies between live ad copy and the customer-facing site (`customer-facts.md` source of truth, updated 2026-05-10):

1. **Delivery cadence.** Site now promises "every day, citywide, pick your window at checkout." All 6 active ads (3 Meta + 3 Google RSA) still say "Wednesday delivery."
2. **Cart minimum.** Site enforces $20 minimum cart. All 6 active ads say "$25 minimum." Customers who arrive at the cart see $20 and the ad is wrong on a price-sensitive number.

Leaving these live keeps spending acquiring traffic against a promise the site no longer makes, then lands customers on a UI that contradicts what they were told they bought into.

## In-scope assets

### Meta (Ad Account `act_814877604473301`)

Campaign: **Catalog Sprint May 2026** (id `120244283665040762`, ACTIVE)

| Ad name | Ad id | Lines to change |
|---|---|---|
| Build Your Box - Catalog May 2026 | 120244283696610762 | body + video message |
| No Box Just What You Need - Catalog May 2026 | 120244283725520762 | body + video message |
| Hyde Park Hyperlocal - Catalog May 2026 | 120244283742560762 | body + video message |

### Google Ads (Customer `6015592923`)

Campaign: **Catalog Sprint May 2026** (id `23822705962`, ENABLED)

| Ad id | Lines to change |
|---|---|
| 807695662221 | RSA headlines + descriptions |
| 807729593686 | RSA headlines + descriptions |
| 807810018854 | RSA headlines + descriptions |

## Proposed copy

### Meta — Build Your Box (general)

**FROM:** "Build your order from Black-farmed produce. 45+ items: asparagus, kale, lamb chops, whole chicken, and more. $25 minimum. Delivered fresh every Wednesday. Enter code FRESH10 at checkout for $10 off your first order."

**TO:** "Build your order from Black-farmed produce. 45+ items: asparagus, kale, lamb chops, whole chicken, and more. $20 minimum. Delivered citywide, every day. Pick your window at checkout. Enter code FRESH10 for $10 off your first order."

### Meta — No Box Just What You Need

**FROM:** "No mystery box. No subscription. Just Black-farmed produce you choose yourself. Pick from 45+ items, asparagus, kale, lamb, chicken, and more. $25 minimum, delivered Wednesday. Enter FRESH10 at checkout for $10 off."

**TO:** "No mystery box. No subscription. Just Black-farmed produce you choose yourself. Pick from 45+ items, asparagus, kale, lamb, chicken, and more. $20 minimum, delivered citywide every day, pick your window. Enter FRESH10 for $10 off."

### Meta — Hyde Park Hyperlocal

**FROM:** "Hyde Park: Build your order from Black-owned farms. 45+ items from asparagus to whole chicken. $25 minimum, delivered Wednesday to your neighborhood. Enter code FRESH10 at checkout for $10 off your first order."

**TO:** "Chicago: Build your order from Black-owned farms. 45+ items from asparagus to whole chicken. $20 minimum, delivered citywide every day to your neighborhood. Pick your window at checkout. Enter code FRESH10 for $10 off your first order."

(Note: also widens audience framing from Hyde Park to Chicago, matching the citywide service area expansion. If you want to keep this ad set targeted at Hyde Park, leave the targeting as-is and only change the copy; Hyde Park is a real neighborhood the new "citywide" promise covers.)

### Google RSA — replacement headlines (use across all 3 RSAs)

Drop these (Wednesday + $25 + Hyde-Park-only framing):
- "$25 Min | Wednesday Delivery"
- "Delivered Fresh Wednesday"
- "Wed | Black-Owned Delivery"
- "45+ Items | $25 Minimum"
- "Wednesday Delivery to 60637"

Add these (every-day + $20 + citywide):
- "$20 Min | Daily Citywide Delivery"
- "Delivered Every Day, Citywide"
- "Pick Your Day & Window"
- "45+ Items | $20 Minimum"
- "Daily Delivery, Chicago Citywide"

### Google RSA — replacement descriptions (any ad referencing Wed or $25)

**FROM (representative):** "45+ items from Black farms. $25 min, Wed delivery. Code FRESH10 saves $10."
**TO:** "45+ items from Black farms. $20 min. Daily delivery citywide, pick your window. Code FRESH10 saves $10."

**FROM:** "No subscription. Pick asparagus, kale, lamb, chicken & more. Wed delivery."
**TO:** "No subscription. Pick asparagus, kale, lamb, chicken & more. Daily delivery citywide, pick your window."

**FROM:** "Chicago produce from Black farms. Choose items, $25 min. FRESH10 saves $10."
**TO:** "Chicago produce from Black farms. Choose items, $20 min. Daily citywide delivery. FRESH10 saves $10."

**FROM:** "Support Black farms. 45+ items, $25 min, Wed delivery, no subscription."
**TO:** "Support Black farms. 45+ items, $20 min, daily citywide delivery, no subscription."

(Any other description containing "Wed" or "$25" gets the same swap.)

## Out of scope (unchanged)

- Ad budgets, bidding strategy, audience targeting, schedules
- Conversion events, Pixel + CAPI config, GA4 events, UTM structure
- Landing pages
- Promo code (FRESH10 stays)

## Rollback plan

Each Meta ad creative is replaced via `POST /act_<id>/adcreatives` then `POST /<ad_id>` with the new `creative_id`. The previous creative IDs (4358967514324168, 926413267066716, 2022693005266829) remain in the account; rollback = re-attach the prior creative to the ad. Google RSAs are edited in-place; rollback = restore the prior headline/description set from this doc.

Total time to revert if metrics deteriorate: under 10 minutes per platform.

## Approval needed

CEO sign-off (Anthony Ivy) per the marketing standing order. Filing path:
`POST /api/companies/{companyId}/approvals` with `type: "request_board_approval"`, link to this doc + the Paperclip issue.
