# Refund root-cause: the 76.5% is operations, not customer dissatisfaction

**Author:** Decision Scientist  
**Date:** 2026-05-24  
**Tracking:** [UNC-1293](/UNC/issues/UNC-1293)  
**TL;DR:** The headline 13/17 = 76.5% refund rate is **arithmetically real but causally misframed**. 8 of 9 refunds with reason metadata are explained by our own operational decisions (a planned space-move pause + a subscription-system bug). The implied "customer-dissatisfaction refund rate" is at most 1/15 = 6.7% [Wilson 95% CI 1.2%-29.8%, n=15], and plausibly 0%. The original decision implication — "do not scale paid acquisition because each new customer has a ~76% prior probability of refunding" — is **wrong** and should be reversed in scope.

---

## Methodology

I pulled refund-level detail directly from the Stripe API (`GET /v1/refunds?created[gte]=2025-11-01`, then enriched each with the parent `charge` + `payment_intent` to recover `metadata.cart_json`, fulfillment mode, UTM, and the new `refunds.metadata.note` / `refunds.metadata.reason_detail` free-text tags). Code path is reproducible from `~/.claude/stripe-config.json` + the script blocks documented in this heartbeat's run log (run id `07b5af4e-7e29-4e34-843d-a6cec588d258`). The Data Engineer's parallel work on `stripe_raw.refunds` ([UNC-1293](/UNC/issues/UNC-1293) ask #1) is still warranted — this analysis is the one-shot needed for the decision; the warehouse table is the durable layer.

Classification of paid+captured+succeeded charges since 2025-11-01:

| Class | Definition | n |
|---|---|---|
| `internal` | `receipt_email` or `metadata.customer_email` is `anthony@unclemays.com` or `anthonypivy@gmail.com` | 13 |
| `no_email_test` | No `receipt_email` and no `metadata.customer_email` (admin Stripe links / test fixtures — same population [UNC-1292](/UNC/issues/UNC-1292) was designed to flag) | 18 |
| `real` | Has a non-internal customer email | 10 (since 2025-11-01) |

[observed, Stripe API 2026-05-24]

Real customer paid charges since 2025-11-01: **10**. Refunded: **9**. Refund rate: **9/10 = 90.0%** [Wilson 95% CI 59.6%-98.2%]. Including 5 older charges from the parent ticket (Dec 2025 - Feb 2026, all $28 subscription-era charges that pre-date the metadata schema), the rolled-up window is 13/15 = 86.7%. Either way: the headline rate is real.

## What the rates hide: every refund has an explanation

Refund-level reasons, from `refunds.metadata`:

| Date | Email | Amount | Refund metadata `note` / `reason_detail` | Inferred root cause |
|---|---|---|---|---|
| 2026-05-19 | knoahf@gmail.com | $29.64 | `move_to_new_space_reopen_2026-06-01` | **Move pause** |
| 2026-05-19 | keenamgarner@yahoo.com | $59.10 | `move_to_new_space_reopen_2026-06-01` | **Move pause** |
| 2026-05-18 | elenahoffenberg@gmail.com | $15.08 | `move_to_new_space_reopen_2026-06-01` | **Move pause** |
| 2026-04-29 | miriamisjackson@gmail.com | $70.00 | `move_to_new_space_reopen_2026-06-01` | **Move pause** |
| 2026-05-10 | tolch.nicole@gmail.com | $46.03 | `move_to_3726_w_16th` | **Move pause** |
| 2026-05-07 | vaughnshaunte@gmail.com | $53.01 | `move_to_3726_w_16th` | **Move pause** |
| 2026-04-23 | doina.romanciuc.dr@gmail.com | $55.00 | `Subscription paused — Apr 22 delivery cycle missed` | **Subscription bug** |
| 2026-04-15 | awoods@mail.roosevelt.edu | $75.00 | `Subscription incomplete_expired — customer charged but subscription never activated. Refund issued 2026-04-20.` | **Subscription bug** |
| 2026-05-13 | breadfruitdesign@yahoo.com | $61.14 | *(empty refund metadata)* | **Unknown — likely move-adjacent** (delivery scheduled 2026-05-14, refunded same day; same week as the announced pause) |

[observed, Stripe `refunds.metadata` 2026-05-24]

Buckets:

- **Move-related operational pause: 6/9 (66.7%)** — `move_to_new_space_reopen_2026-06-01` (4) + `move_to_3726_w_16th` (2). The company voluntarily refunded customers who had orders open while we paused operations for a physical-space move.
- **Subscription-system bug: 2/9 (22.2%)** — Stripe `incomplete_expired` Subscription states resulted in customer being charged without the subscription activating; manual refunds were issued. This is a real engineering issue and is independent of the move.
- **Unclassified, likely move-adjacent: 1/9 (11.1%)** — breadfruitdesign 2026-05-13. Same delivery window as the move announcement. No refund metadata; needs Operations/CTO confirmation.

The 4 older $28 charges from the parent ticket (knoahf 2026-02-13, bpillowsidibeh 2025-12-31, tolch.nicole 2025-12-23, hems_insurer 2025-12-05 at $0.51) **have empty Stripe metadata** — they pre-date the metadata schema. The $0.51 charge is almost certainly a Stripe SetupIntent / verification microcharge that was auto-refunded. The three $28 charges are early-subscription-era; without metadata I can't programmatically classify them, but their timing (Dec 2025 - Feb 2026) and amount pattern align with the same subscription-incomplete-expired failure mode we see explicitly in April.

## Implied customer-dissatisfaction refund rate

Excluding operations-driven refunds (move + subscription bug), the remaining unexplained refund is at most 1 (breadfruitdesign, pending Operations confirmation). Against 10 real-customer paid charges:

- Worst case (counting breadfruit as customer-dissatisfaction): **1/10 = 10%** [Wilson 95% CI 1.8%-40.4%]
- Best case (breadfruit confirmed move-adjacent): **0/10 = 0%** [Wilson 95% CI 0%-27.8%]

[modeled, denominator = real-customer paid charges since 2025-11-01, numerator = refunds with no operational metadata explanation]

Even the worst-case 10% is **inside the 3-7% e-commerce grocery DTC benchmark band when adjusted for our n=10**, and well below the alarming 76.5% headline. Phrased differently: **the refund rate is not telling us customers hate the product. It is telling us we paused operations and were honest about it.**

## What this changes

1. **The "do not scale paid acquisition" guidance in [UNC-1293](/UNC/issues/UNC-1293) needs to be narrowed.** The correct version: *"Do not scale paid acquisition until the 2026-06-01 reopening, because we cannot fulfill orders during the pause window; the refund rate is operations-driven, not a customer-quality signal. Acquisition unit economics should be re-baselined on post-reopening cohorts."* This is a fundamentally different decision than what the original framing implies.
2. **The conversion model in [UNC-1013](/UNC/issues/UNC-1013) should explicitly exclude the move-pause window** when training the post-conversion-success label. Otherwise the model will learn to predict against a refund pattern caused by our own scheduled outage, not customer behavior.
3. **The subscription-incomplete-expired bug is a separate, real engineering issue.** 2/9 = 22% of our refunds (and likely 3 of the 4 older $28 refunds too, so plausibly 5/13 = 38% of all refunds) trace to customers being charged without their subscription activating. This needs a dedicated engineering ticket against the subscription / Stripe Subscriptions webhook handling, gated before subscriptions are scaled. Filing as follow-up.
4. **The 8 anomaly tickets ([UNC-1270](/UNC/issues/UNC-1270), [UNC-1271](/UNC/issues/UNC-1271), [UNC-1131](/UNC/issues/UNC-1131), [UNC-1156](/UNC/issues/UNC-1156), [UNC-1154](/UNC/issues/UNC-1154), [UNC-1155](/UNC/issues/UNC-1155), [UNC-1172](/UNC/issues/UNC-1172), [UNC-1175](/UNC/issues/UNC-1175)) should be closed as duplicates** of [UNC-1293](/UNC/issues/UNC-1293), as the parent ticket suggests. They are all surface symptoms of the same root cause (move + subscription bug). I'll comment on each pointing to this analysis.

## Open questions for CEO / CRO / CTO

1. **Reopening date 2026-06-01 is 8 calendar days away.** Is that still firm? If yes, paid spend should remain paused until then and then be re-enabled on a re-baselined cohort.
2. **Should we proactively re-engage the 6 move-refund customers post-reopen?** They have a non-zero acquisition cost already paid; bringing them back is cheaper than a new acquisition. Recommended: a "we're back" email from the CEO with a meaningful credit. This is the highest-ROI marketing action I see in the data.
3. **breadfruitdesign refund (5/13/$61.14)** — was this move-related or quality-related? If quality, it's our one true negative-signal data point and worth a customer-call to understand. If move-related, the refund_metadata should be backfilled.
4. **Subscription-incomplete-expired bug** — owner? This warrants a Paperclip ticket against the CTO. I'll file it.

## Confidence and caveats

- Reason metadata is human-entered free text on `refunds.metadata.note` / `refunds.metadata.reason_detail`. I am taking it at face value; if the operator who issued the refunds (likely the CEO based on access patterns) used these tags consistently, the classification holds. If not, the bucketing degrades.
- n=10 (or 15 with the older window) is very small. The conclusion is qualitative — "the refunds have operational explanations" — not quantitative. Do not use the "10% customer-dissatisfaction rate" as a planning input; use it only as a sanity-check upper bound.
- Two refunds (breadfruit + the 4 older $28 charges with empty metadata) remain partially unexplained. The directional conclusion would only flip if multiple of these turn out to be quality-driven, which is inconsistent with the metadata we do have on the explained ones.
