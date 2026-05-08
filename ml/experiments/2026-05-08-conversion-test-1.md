# EXP-002: Mobile Payment Form Fix — Pre/Post Measurement

**Pre-registered**: 2026-05-08  
**Owner**: Decision Scientist  
**Status**: Running (fix deployed 2026-05-08, commit `62303b2`)  
**Paperclip**: [UNC-952](/UNC/issues/UNC-952)

---

## Background

Day 1 analysis (2026-05-08) identified 78% PaymentIntent abandonment over 7 days (2/9 PIs succeeded). All 7 abandoned PIs had `status = requires_payment_method` with `last_payment_error = null`, indicating customers reached the payment step but did not enter a card — consistent with a broken/invisible payment form. CTO diagnosed root cause as an auto-scroll race condition on mobile: the checkout page scrolled to the PaymentElement 100ms after `clientSecret` was set, before the Stripe Elements iframe finished mounting, resulting in a blank payment form. 88% of sessions are mobile. Fix: added `onReady` tracking so auto-scroll only triggers when Elements is fully interactive, plus a loading overlay.

---

## Hypothesis

**H1**: The mobile auto-scroll race condition was causing 78% of PI-stage customers to abandon without entering a payment method. Fixing the race condition will increase PI completion rate from 22% to ≥60%.

**H0**: PI completion rate ≤ 22% after fix (fix had no meaningful effect).

---

## Design

**Type**: Pre/post observational (no randomization — bug fix with clean deployment break)  
**Pre period**: 2026-05-01 to 2026-05-07 (7 days, n=9 PIs)  
**Post period**: 2026-05-08 onward (rolling 7-day windows)  
**Identification**: Sharp before/after at commit `62303b2` deployment date

**Note on non-randomization**: A/B test is not appropriate here — running a control group with a known broken payment form is not ethical and would cost revenue. Pre/post is the correct design.

---

## Primary Metric

**PI completion rate** = `succeeded` / (`succeeded` + `requires_payment_method`)

Pulled from Stripe API:
```python
GET /v1/payment_intents?limit=100&created[gte]={period_start}
completion_rate = count(status='succeeded') / count(status in ['succeeded', 'requires_payment_method'])
```

**Baseline** (pre-fix, May 1–7): 2/9 = **22.2%** [observed]

---

## Secondary Metrics

- Orders/week (Stripe `charges` succeeded count)
- Average order value (Stripe charges amount)
- Revenue/week

**Baseline**: 2 orders/week, $40.85 AOV, $81.71/week [observed]

---

## Sample Size

Two-proportion z-test (pre vs post):
- α = 0.05 (two-tailed), power = 0.80 (β = 0.20)
- H0: p = 0.22, H1: p = 0.60 (detecting 38pp lift)
- Formula: n = (z_α/2 + z_β)² × [p1(1-p1) + p2(1-p2)] / (p2-p1)²
- = (1.96 + 0.84)² × [0.22(0.78) + 0.60(0.40)] / (0.38)²
- = 7.84 × [0.1716 + 0.2400] / 0.1444
- = 7.84 × 0.4116 / 0.1444
- = **n = 23 PIs per period**

At ~9 PIs/week, that is approximately **3 weeks of post-period data** to achieve 80% power for a 22%→60% lift.

**Directional read (week 1)**: If post-fix completion rate ≥ 40%, fix is working as expected.

---

## Analysis Plan

1. **Week 1 check (2026-05-15)**: Pull Stripe PIs created since 2026-05-08. Compute completion rate. Report directional signal.
2. **Week 3 check (2026-05-29)**: Full significance test. Two-proportion z-test, p < 0.05 = statistically significant improvement.
3. **Confounders to note**:
   - Traffic volume changes (if ad spend changes, denominator changes)
   - Seasonal demand variation (Wednesday delivery cycle)
   - Any other code changes to checkout between now and analysis date

---

## Stop Conditions

| Condition | Action |
|---|---|
| Week-1 completion ≥ 40% | Fix confirmed working directionally; continue to week 3 |
| Week-2 completion < 35% | Escalate to CTO — fix may be incomplete or there is a second issue |
| Week-3 completion ≥ 60% with p < 0.05 | Close experiment as success; archive to `experiments/results/` |
| Week-3 completion ≥ 45% with p < 0.05 | Partial success; investigate residual abandonment |
| Week-3 completion unchanged (p > 0.05) | Fix had no effect; root cause was misdiagnosed; escalate |

---

## Expected Revenue Impact (Modeled)

| Scenario | PI completion | Orders/week | Revenue/week | Delta vs baseline |
|---|---|---|---|---|
| Baseline (pre-fix) | 22% | 2.0 | $81.71 | — |
| Conservative (45%) | 45% | 4.1 | $167 | +$85/week |
| Target (60%) | 60% | 5.4 | $221 | +$139/week |
| Optimistic (80%) | 80% | 7.2 | $294 | +$213/week |

All modeled; actual depends on PI volume holding at ~9/week.

---

## Results (to be filled)

| Period | PIs | Succeeded | Completion | Orders | Revenue |
|---|---|---|---|---|---|
| Pre (May 1–7) | 9 | 2 | 22.2% | 2 | $81.71 |
| Week 1 post (May 8–14) | TBD | TBD | TBD | TBD | TBD |
| Week 2 post (May 15–21) | TBD | TBD | TBD | TBD | TBD |
| Week 3 post (May 22–28) | TBD | TBD | TBD | TBD | TBD |
