# Paperclip board-approval request: pause + recalibrate paid marketing after catalog launch

> Draft for Anthony to file as a Paperclip approval request. Per the standing
> order on marketing/advertising changes, no agent (including Claude Code) may
> touch Meta Ads, Google Ads, Mailchimp campaign drafts, or attribution wiring
> without explicit board approval. This doc is the proposal text + impact +
> rollback plan to attach to the Paperclip issue.
>
> File via: `POST /api/companies/{companyId}/approvals` with
> `type: "request_board_approval"`, link to the Paperclip issue, and wait for
> resolution before any change ships.

---

## Summary

The catalog launch (2026-04-30) and right-sized portion pricing (2026-05-03)
materially changed every customer-facing surface:

- Fixed boxes (Spring / Full Harvest / Community) are gone. Build-your-own
  catalog with $25 minimum is the only path.
- Per-item pricing dropped meaningfully: asparagus $9.38 → $2.50 (1/4 lb),
  whole chicken $39.38 → $32 (estimated, per bird), short ribs from a 2.5 lb
  pack to per-lb at $8.50 / $12.50.
- Catalog now has 45 active SKUs with portion-size product photos.
- Average order value will likely drop short-term (smaller portions =
  lower entry point) while items-per-cart will rise.

Every active paid campaign was authored against the old pricing and box model.
The bidding algorithms on Meta and Google Ads are optimizing against historical
purchase values that are no longer representative.

## Proposed actions

### 1. Pause Meta ads for 24-48 hours
- Pause all active Meta campaigns (Tier 1 thesis-aligned consumer test, the
  one-time-launch-apr26 brief).
- Sweep all live creative for hard-coded prices, box names, "Full Harvest",
  "Spring Box", "Order $40", "Order $70". Replace with model-agnostic
  language: "Build your own from $25", "Fresh produce starting at $1.50".
- Reactivate at 50% of prior daily budget so the algorithm collects fresh
  signal at lower spend exposure.

### 2. Pause Google Ads for 24-48 hours
- Same sweep on Google Ads creative + Responsive Search Ads headlines.
- Resume at 50% daily budget cap until 50+ new-pricing conversions land.

### 3. Switch Meta campaign objective to Purchase Value
- Currently optimizing on Purchase Count. With smaller cart sizes, count
  optimization will drive higher volume of low-value carts.
- Switch to Purchase Value optimization so the algorithm targets shoppers
  most likely to fill larger carts.

### 4. Reset audience-segment thresholds
- Any custom audience segmented by past purchase value (e.g. "spent >$50")
  is now using stale thresholds. Reset segment definitions or pause until
  recalibrated.

### 5. Update Mailchimp newsletter audience copy
- The next newsletter draft must reference the catalog model, not boxes.
- Newsletter audience itself is fine (3 members post-cleanup); copy is the
  only thing to update.

### 6. Hold any new social-ask FRESH30 campaigns
- The /ask page funnel is unchanged but verify FRESH30 still applies under
  the new $25 minimum (it should, but eyeball one test cart end-to-end).

## Impact (what we expect)

- **CPA worse for ~7 days** as bidding recalibrates against the new pricing
  and conversion-event mix. Do not interpret as performance regression.
- **Cart abandonment may rise short-term** as customers acclimate to the
  build-your-own UX vs. the prior one-click box.
- **AOV down ~10–20% short-term**, items-per-cart up ~30–50% (more SKUs
  per checkout to hit $25).
- **CTR and add-to-cart should improve** because the per-item entry price
  is dramatically lower and visually communicated via portion photos.

## Rollback plan

- All changes above are reversible at the platform layer.
- If CPA at the 50% budget cap stays >40% above baseline after 14 days,
  revert Meta to Purchase Count optimization and re-evaluate creative.
- If the catalog-model creative underperforms by >25% vs. the old box
  creative for two consecutive weeks, run an A/B with the box creative
  pointing at /shop (test whether the lift was always in the box framing
  vs. the build-your-own framing).
- Newsletter copy is one campaign send; trivially revertable.

## Out of scope (not requested in this approval)

- Refactoring the abandoned-cart Trigger.dev sequences (already done in
  code by Claude Code, no marketing-platform touch).
- Landing page copy sweep (already done in code, no marketing-platform
  touch).
- Updating customer-facts.md (already done, internal doc only).

## Owner / executor

- **CEO (Anthony Ivy):** approval.
- **Advertising Creative Paperclip agent:** owns creative variant refresh
  on Meta and Google Ads.
- **CRO Paperclip agent:** owns budget caps and Purchase Value objective
  switch.
- **RevOps Paperclip agent:** owns audience segment threshold reset and
  conversion-tracking verification.

## Suggested timeline

| When | What |
|---|---|
| Day 0 (approval) | Pause Meta + Google Ads. Notify Advertising Creative + CRO. |
| Day 1 | Creative sweep ships. Mailchimp newsletter draft updated. |
| Day 2 | Resume Meta + Google Ads at 50% budget. Switch Meta objective to Purchase Value. |
| Day 7 | Mid-window review: new-pricing conversion count, CPA delta vs. baseline. |
| Day 14 | Decision point: ramp budget back to 100%, hold at 50%, or escalate creative refresh. |
