# EXP-002: Delivery Window Picker — Painted Door (Pre/Post Comparison)

**Status:** Pre-registered
**Pre-registration date:** 2026-05-09
**Approval required:** No — affects core product pages (Hero, Pricing, /shop) and checkout/subscribe delivery steps, which the standing order 2026-04-29 explicitly marks as freely touchable when the change is not part of an active ad funnel variant. This is a CRO/conversion experiment, not an ad-funnel test.
**Target start (T0):** 2026-05-09 (deploy timestamp)
**Target completion:** T0 + 14 days

---

## 1. Background and Motivation

Customer feedback (5+ comments captured via the feedback program in the last 30 days) indicates that the Sunday 11:59 PM CT cutoff → Wednesday-only delivery model is a friction point. People who miss the cutoff wait a full week before their next opportunity to receive produce. Several said they would "have ordered if I could pick a different day."

Anthony wants to test whether a polished every-day delivery experience — 3–4 selectable window slots per day, citywide, presented as if "fully operational" — meaningfully raises the purchase rate.

The change is operationally costly to deliver for real (driver routing, inventory pacing, Pembroke supply rhythm). Before committing, we want a demand-side read: do people actually want this enough to convert at a higher rate?

---

## 2. Hypothesis

**H₀:** The session→purchase rate after launching the every-day delivery picker is equal to the rate before launch.

**H₁ (directional):** The session→purchase rate is higher after launch than before.

**Operationalized:** Compare the 14-day session→purchase rate from T0−14 to T0 (control window) against T0 to T0+14 (treatment window).

---

## 3. Experiment Design

**Design:** Pre/post comparison, 100% rollout. No concurrent control.

**Painted door:** Customers see a polished day-strip + window-card scheduler covering the next 7 days with 4 windows each (8a–11a, 11a–2p, 2p–5p, 5p–8p). Their selection is captured and stored, but the underlying fulfillment remains Wednesday-only for now. A transactional confirmation email after purchase honestly notes "this week your box ships Wednesday; we've recorded your preference for future weeks."

**Affected surfaces:**
- `src/components/Hero.tsx` (homepage badge + headline)
- `src/components/DeadlineCountdown.tsx` (homepage cutoff banner)
- `src/components/Pricing.tsx` (CTAs + supporting copy)
- `src/app/shop/page.tsx` (top banner)
- `src/app/checkout/[product]/page.tsx` (one-time checkout step 1)
- `src/app/subscribe/[product]/delivery/page.tsx` (subscription delivery step)
- `src/app/checkout/[product]/delivery/page.tsx` (legacy checkout)
- `src/components/checkout/CheckoutClient.tsx` (delivery-mode picker)

**New components:**
- `src/lib/delivery-windows.ts` — shared window definitions + next-7-days helper
- `src/components/checkout/DeliveryScheduler.tsx` — Calendly/Instacart-style picker

**No randomization unit.** Every visitor in the post window sees the new UX.

---

## 4. Metrics

### Primary metric
**Session → purchase rate:** completed Stripe payments ÷ unique GA4 sessions, measured over the 14-day window.

- **Baseline (p₀):** to be measured from T0−14 to T0 GA4 + Stripe data.
- **Minimum detectable effect (MDE):** depends on observed n. With current ~415 sessions/week and ~1 purchase/week (~0.24% baseline), the post-window will produce ~830 sessions and ~2 purchases. This experiment is **likely underpowered** for a definitive statistical read; treat as directional. Plan in advance to either:
  1. Continue past 14 days if the directional signal is positive but underpowered, or
  2. Combine with secondary metrics (slot-pick rate, day-of-week distribution) to inform the ops decision.

### Secondary / exploratory metrics
1. **Slot-pick rate:** sessions that fired `delivery_scheduler_view` and went on to fire `delivery_slot_selected` ÷ sessions that fired `delivery_scheduler_view`. Indicates engagement with the new UX.
2. **Day-of-week preference distribution:** count of `delivery_slot_selected` events bucketed by `day_offset` parameter. Tells us whether real demand is for non-Wednesday days, or whether people would still pick Wednesday given the choice.
3. **Window-of-day preference distribution:** same, bucketed by `window_key` (morning, midday, afternoon, evening).
4. **Checkout completion rate by surface:** drop-off between `delivery_scheduler_view`, `delivery_slot_selected`, `begin_checkout`, and `purchase`.

### Guardrail metrics
1. **Refund / complaint rate:** any spike in customer complaints about delivery confusion (tracked via `feedback-inbound` Gmail label and Stripe disputes). Stop and roll back if >1 complaint per 5 orders specifically about delivery-day confusion.
2. **Order-confirmation email open rate:** must not drop more than 20% relative to baseline (would indicate the honest reveal is hurting trust signal).

---

## 5. Sample Size and Power

Acknowledged underpowered at current traffic. With the recent paid-ads pause (2026-05-09, see `notes/decision-pause-paid-ads-2026-05-09.md`), session volume will fall further during the post window, biasing this comparison toward null.

**No formal power calculation.** This is a directional read, not a confirmatory test. The analysis section below uses a two-proportion z-test for transparency but the result will be reported with appropriate uncertainty caveats regardless of significance.

---

## 6. Run Duration

| Milestone | Date |
|---|---|
| Pre-registration | 2026-05-09 |
| Deploy (T0) | 2026-05-09 (post-deploy) |
| Day-7 directional check (no decision) | 2026-05-16 |
| Day-14 readout | 2026-05-23 |
| Decision | 2026-05-24 |

---

## 7. Stop Conditions

### Early stop — harm
Roll back immediately if any of the following occur in the first 14 days:
1. >1 customer complaint per 5 orders specifically about delivery-day confusion (via `feedback-inbound` label or Stripe dispute).
2. Stripe dispute rate >2% in the post window (vs. ~0% baseline).
3. Order-confirmation email open rate drops >30% relative to the prior 14 days.

### Early stop — success
Do not stop early for positive results. Wait the minimum 14-day window to capture two weekly purchase cycles.

---

## 8. Pre-specified Analysis Plan

1. Pull GA4 sessions and Stripe `checkout.session.completed` + `payment_intent.succeeded` (filtered to non-renewal) for both windows (T0−14 to T0 and T0 to T0+14). Reuse `reports/bq_7day_pulse_v2.py` patterns.
2. Compute session→purchase rate for each window.
3. Two-proportion z-test: `scipy.stats.proportions_ztest([purchases_pre, purchases_post], [sessions_pre, sessions_post])`.
4. Report: rate pre, rate post, absolute and relative lift, 95% CI, p-value, observed n.
5. Pull `delivery_scheduler_view` and `delivery_slot_selected` GA4 events. Report slot-pick rate, day-of-week distribution, window-of-day distribution.
6. Confounds to disclose explicitly in the writeup:
   - Paid ads paused 2026-05-09 (memory `project_paid_ads_paused_2026-05-09.md`) — sessions will be lower-quality and lower-volume in the post window.
   - Seasonality (mid-May vs. early May).
   - Any other product or copy changes shipped during the post window (log them in this doc as they happen).
7. Decision rule:
   - **p < 0.05 and lift positive AND day-of-week distribution shows ≥30% non-Wednesday preference:** strong signal, escalate to ops planning for real every-day rollout.
   - **p ≥ 0.05 BUT day-of-week distribution shows ≥30% non-Wednesday preference:** directional signal worth exploring; extend the window or run a follow-up powered test.
   - **Day-of-week distribution shows <30% non-Wednesday preference:** demand for flexibility is weaker than feedback suggested; close the experiment, retain Wednesday-only ops.
   - **Lift negative:** roll back the painted door; investigate whether the honest reveal email or new UX itself is hurting trust.

---

## 9. Risks and Limitations

| Risk | Severity | Mitigation |
|---|---|---|
| Customers feel deceived by the painted door | High | Honest reveal email immediately on order success; no overpromise about future delivery dates |
| Pre/post comparison is confounded by ads pause and seasonality | High | Disclose explicitly; do not over-claim causal inference; use directional language |
| Underpowered for definitive read | High | Pre-specify directional language and lean on secondary metrics for the ops decision |
| Pickup mode (Airtable-backed slot picker) accidentally affected | Medium | Scope changes to `delivery` fulfillment mode only; explicit regression check in verification |
| `delivery_scheduler_view` / `delivery_slot_selected` events fail to fire | Medium | Verify in GA4 DebugView during the deploy verification step |

---

## 10. Data Sources and Infrastructure

| Source | How accessed | Metric |
|---|---|---|
| GA4 Sessions | `ml/ingest/` pipeline → `ga4_session_summary_*.parquet` and GA4 Reporting API | Sessions, scheduler view/click events |
| Stripe Charges | `ml/ingest/` pipeline → `stripe_charges_*.parquet` | Completed purchases |
| Resend logs | `resend.com/emails` UI (filter by `tags.preferred_window`) | Open rate of order-confirmation email |
| Customer feedback | Gmail `feedback-inbound` label, Stripe disputes | Complaint rate guardrail |

Pipeline re-run: `python ml/run_pipeline.py` at day 14.

---

## 11. Sign-off

| Role | Action required |
|---|---|
| Decision Scientist | Pre-registration authored ✓ |
| CEO | Approved scope (no board approval required per standing order check) ✓ |
| CTO / Engineering | Confirm GA4 events firing on deploy ✓ |
| Customer Service | Watch `feedback-inbound` for delivery-day confusion complaints during the post window |

*Pre-registered by Claude Code on 2026-05-09. No results exist at time of registration.*
