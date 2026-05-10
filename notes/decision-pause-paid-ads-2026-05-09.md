# Decision: Pause All Paid Advertising

**Date:** 2026-05-09
**Decided by:** Anthony Ivy, CEO
**Status:** Decision recorded locally. Paperclip issue + board approval to be filed when API is restored (currently down — see `~/.paperclip/CEO-ACTION-REQUIRED-API-OUTAGE.md`).
**Standing order reference:** CLAUDE.md "Standing Order — Marketing & Advertising Infrastructure (effective 2026-04-29)"

---

## Decision

Pause all paid advertising (Meta + Google Ads) effective 2026-05-09. Set campaigns to **PAUSED** (not archived/deleted). Restart gated on inventory expansion and SKU-level food content production.

## Why

7-day pulse 2026-05-02 → 2026-05-08 (BigQuery, see [reports/bq_7day_pulse_v2.py](../reports/bq_7day_pulse_v2.py)):

- Paid spend: **$114.40** ($38.72 Meta, $75.68 Google)
- Total revenue: **$28.70** (one charge, returning customer, "direct" attribution)
- Ad-attributed purchases: **0**
- Blended ROAS: **0.25x**
- Google Ads 14-day record: 0 conversions across $200+ spend
- Meta CPC healthy ($0.23) but funnel not converting
- Subscriptions: 1 active (Doina, grandfathered $55/wk), 52 incomplete_expired, 14 canceled

Driving paid traffic to a thin catalog with a friction-heavy subscribe flow is burning money. Better use of the cycle: build inventory + content, then relaunch with something worth promoting.

## Scope — set to PAUSED

- Meta campaign: **"Catalog Sprint May 2026"**
- Google Ads campaign: **"Catalog Sprint May 2026"** (currently ENABLED, SEARCH)
- Google Ads campaign: **"Produce Box - Search Campaign"** (currently PAUSED — verify)

No new spend committed until restart approval.

## Untouched

- Newsletter (Mailchimp)
- Transactional email (Resend)
- Apollo investor outreach (Tier 1, Tier 2A–D, CRE/HNW)
- Organic social on owned accounts
- Pixel / CAPI / conversion tracking infrastructure (left in place for clean restart)

## Restart criteria

Flip campaigns from PAUSED back to ENABLED when **all** of the following are met:

1. Inventory expansion plan executed (SKU breadth meaningfully wider than current catalog)
2. Food-item content library exists — minimum 10 SKU-level posts/photos with associated copy
3. Subscribe flow audit complete: the 52 `incomplete_expired` signal is diagnosed and either fixed or the product offering is revised

Each restart still requires board approval per the standing order — same compliance path (Paperclip issue + approval) applies.

## Rollback (if pause needs to be reversed before restart criteria are met)

Set both campaigns from PAUSED back to ENABLED in Meta Ads Manager + Google Ads UI. No structural changes during pause, so this is reversible in minutes.

## Risks acknowledged

- Loss of paid traffic during pause (~470 sessions/wk currently coming via Meta + Google)
- Pixel/algorithm learning may reset if pause exceeds ~7–14 days
- Mitigation: organic, investor outreach, and newsletter continue unchanged

## Action items

- [ ] **Anthony / manual:** Pause "Catalog Sprint May 2026" in Meta Ads Manager
- [ ] **Anthony / manual:** Pause "Catalog Sprint May 2026" in Google Ads UI; verify "Produce Box - Search Campaign" is paused
- [ ] **Backfill:** Once Paperclip API is restored, file UNC issue + `request_board_approval` linking to this doc; close out as "decision already executed, retroactively logged for audit trail"
- [ ] **Next phase work** (separate threads): inventory expansion plan, SKU content production plan, subscribe flow audit
