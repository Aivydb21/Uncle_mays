# EXP-001: Meta Ad Creative A/B Test — Benefit-Focused vs. Awareness-Focused

**Status:** Pre-registered  
**Pre-registration date:** 2026-05-06  
**Linked issue:** UNC-901  
**Parent roadmap:** UNC-890  
**Approval required:** Yes — standing order 2026-04-29 (marketing/advertising changes require board approval before launch)  
**Target start:** 2026-05-12 (pending board approval)  
**Target completion:** 2026-05-19  

---

## 1. Background and Motivation

As of 2026-05-05, the business generates ~0.47 orders/week against a 30-order/week target. Meta advertising drives 62% of site sessions (415 sessions in the last 7 days) but yields very low conversion. The observed funnel:

| Stage | n | Rate |
|---|---|---|
| Sessions | 415 | — |
| Add to cart | 7 | 1.7% |
| Begin checkout | 0 | ~0% (GA4 tracking gap) |
| Purchase | 1 | 0.24% |

With ~17,900 Meta impressions over the last ~10 days (5.1% overall CTR), Meta is the only channel with enough volume for a properly powered experiment within a 1–2 week window. Email and on-site conversion tests require 40–80+ weeks to reach 80% power given current subscriber acquisition rates (~2/week) and order volume (~0.5/week).

The strongest hypothesis from observational data: current ad creatives are awareness-oriented (brand/product imagery); a benefit-focused creative that leads with the customer outcome ("fresh produce, scheduled pickup, no guesswork") may increase CTR and downstream landing page engagement.

---

## 2. Hypothesis

**H₀:** The CTR of a benefit-focused creative is equal to the CTR of the current awareness-focused creative.

**H₁ (directional):** The benefit-focused creative produces a higher CTR than the awareness-focused creative.

**Operationalized:** Subscribers shown the benefit-focused creative will click through to the site at a higher rate, measured by Meta-reported CTR (link clicks ÷ impressions) over a minimum 7-day run.

---

## 3. Experiment Design

**Design:** Parallel A/B test with equal budget allocation.  
**Randomization unit:** Ad impression (Meta audience-level random assignment via 50/50 budget split within a single ad set).  
**Arms:**
- **Control (A):** Current best-performing creative (baseline: "One-Time Box Launch" or "Catalog Sprint" variants, CTR ≈ 5.1–9.3%)
- **Treatment (B):** New benefit-focused creative. Copy leads with outcome: e.g., _"Fresh produce. Scheduled pickup. Just tell us your zip — done."_ Includes a clear single CTA ("Order by Sunday").

**Blinding:** Neither arm is visible to the analyst during the run (pre-specify not to pull intermediate results until the stopping criteria below are met).

---

## 4. Metrics

### Primary metric
**Meta CTR (link click-through rate):** link clicks ÷ impressions, reported by Meta campaign insights API.

- **Baseline (p₀):** 5.10% (observed across 17,912 impressions, 2026-04-24 to 2026-05-05)
- **Minimum detectable effect (MDE):** +1.5 percentage points absolute (p₁ = 6.60%), equivalent to a 29% relative lift

### Guardrail metrics
1. **Cost per click (CPC):** Treatment CPC must not exceed 1.5× control CPC. If the treatment drives cheaper impressions that wouldn't convert, CPC blowout surfaces this.
2. **Landing page bounce proxy:** GA4 session-level `event_count > 1` rate among Meta-sourced sessions. Must not decline by more than 20% relative vs. control.

### Secondary / exploratory (not decision-making)
- Add-to-cart rate among sessions originating from each arm (small n expected; directional only)
- Downstream order rate within 14 days of click (small n; not powered; log for future analysis)

---

## 5. Sample Size and Power

**Test type:** Two-proportion z-test, two-sided, α = 0.05, power = 1 − β = 0.80.

**Formula:** n = (z_{α/2} + z_β)² × [p₀(1−p₀) + p₁(1−p₁)] / (p₁−p₀)²

**Inputs:**
| Parameter | Value |
|---|---|
| p₀ (baseline CTR) | 0.051 |
| p₁ (expected treatment CTR) | 0.066 |
| δ (MDE absolute) | 0.015 |
| α | 0.05 (two-sided) |
| Power (1−β) | 0.80 |
| z_{α/2} | 1.960 |
| z_β | 0.842 |

**Required N per arm:** 2,835 impressions

```
n = (1.960 + 0.842)² × [0.051×0.949 + 0.066×0.934] / (0.015)²
  = 7.84 × [0.04840 + 0.06164] / 0.000225
  = 7.84 × 0.11004 / 0.000225
  = 7.84 × 489.07
  ≈ 2,835 per arm (5,670 total impressions)
```

**Current weekly impressions:** ~12,537 (from recent Meta data)  
**Impressions per arm per week (50/50 split):** ~6,268  
**Estimated days to reach N:** ~3.2 days  
**Minimum run duration:** **7 days** (regardless of N milestone, to capture full weekly seasonality — Sunday pre-order cycle is a key behavior driver)

---

## 6. Run Duration

| Milestone | Date |
|---|---|
| Board approval sought | 2026-05-07 |
| Experiment start | 2026-05-12 (Monday scan) |
| N milestone expected | 2026-05-15 |
| Minimum 7-day mark | 2026-05-19 |
| Analysis and readout | 2026-05-19 |

**Maximum run:** 14 days from start. If N is not reached by 2026-05-26 (e.g., due to budget constraints), analyze with observed N and report as underpowered.

---

## 7. Stop Conditions

### Early stop — harm
Stop the treatment arm immediately if **any** of the following occur:
1. Treatment CPC exceeds 2× control CPC on any 3 consecutive days
2. Treatment CTR falls below 2.0% (absolute floor) for 3 consecutive days, suggesting creative is actively hurting brand impression
3. Ad account flagged for policy violation related to treatment creative

### Early stop — success (not recommended before day 7)
Do **not** stop early for positive results. Wait the minimum 7-day window. The business operates on a weekly purchase cycle (order-by-Sunday for Wednesday delivery); stopping early would miss this structure.

### Sequential testing note
This experiment does **not** use alpha-spending or sequential testing methods. The analysis is a single read at day 7 (or day 14 if N is not reached). Do not inspect p-values before the scheduled readout date.

---

## 8. Pre-specified Analysis Plan

1. Pull final Meta CTR data via the `google_ads_campaign_insights` and `meta_campaign_insights` ingest pipelines at or after day 7
2. Compute CTR for each arm: clicks_arm / impressions_arm
3. Conduct two-proportion z-test: `scipy.stats.proportions_ztest([clicks_A, clicks_B], [impressions_A, impressions_B])`
4. Report: z-statistic, p-value, 95% CI on the difference in CTR (treatment − control)
5. Decision rule:
   - **p < 0.05 and direction is positive:** Adopt treatment creative. File EXP-001 as win. Brief board.
   - **p ≥ 0.05 or direction is negative:** Retain control. File EXP-001 as null/loss. Log learnings. Proceed to EXP-002.
6. Regardless of outcome: report secondary/exploratory metrics with appropriate uncertainty language; do not claim causal inference on add-to-cart or order rate.

---

## 9. Risks and Limitations

| Risk | Severity | Mitigation |
|---|---|---|
| Meta's audience-level randomization is not perfectly random | Medium | Accept as-is; Meta A/B split is the standard for ad testing at this scale |
| Weekly spend cap may prevent reaching N within 7 days | Medium | Pre-specify 14-day max; report with actual N if underpowered |
| Creative quality gap conflates "benefit-focused copy" with "better production quality" | Low | Use same image assets; change only headline and body copy |
| Standing order requires board approval before launch | High | Do not start experiment until approved; document approval in run log |
| Small downstream n (orders) means exploratory metrics are unreliable | Low (known) | Pre-specified as exploratory only; no decision made on these |

---

## 10. Data Sources and Infrastructure

| Source | How accessed | Metric |
|---|---|---|
| Meta Campaign Insights API | `ml/ingest/` pipeline → `meta_campaign_insights_*.parquet` | Impressions, clicks, CTR, CPC |
| GA4 Session Summary | `ml/ingest/` pipeline → `ga4_session_summary_*.parquet` | Landing page engagement, add-to-cart |
| Stripe Charges | `ml/ingest/` pipeline → `stripe_charges_*.parquet` | Downstream orders (exploratory) |

Pipeline re-run: `python ml/run_pipeline.py` (pulls fresh data at analysis date)

---

## 11. Candidate Future Experiments (not this document)

The following hypotheses are **not** part of EXP-001. They are logged here for the Monday scan backlog:

- **EXP-002:** Email welcome sequence length (3 vs. 5 emails). Underpowered at current enrollment rate (~2 subs/week; 82 weeks per arm needed). Revisit when list exceeds 200 subscribers.
- **EXP-003:** Checkout social proof (add customer testimonial or "X boxes sold this week" counter). Requires GA4 begin_checkout tracking to be fixed first (currently 0 recorded).
- **EXP-004:** Mobile landing page layout (hero image vs. product grid first). High relevance given 84% mobile share; requires Vercel split testing or Cloudflare Workers A/B.

---

## 12. Sign-off

| Role | Action required |
|---|---|
| Decision Scientist | Pre-registration authored ✓ |
| CEO / Board | Approve experiment launch (standing order 2026-04-29) |
| Advertising Creative | Produce benefit-focused creative variant |
| CTO / Engineering | Confirm Meta API polling is active for run dates |

*Pre-registered by Decision Scientist agent on 2026-05-06. No results exist at time of registration.*
