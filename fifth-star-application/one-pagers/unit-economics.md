# Unit Economics, Uncle May's Produce (Box Business)

**Date:** 2026-05-05
**Scope:** Build-your-own catalog launched 2026-04-30. Numbers below combine catalog-era observed AOV with prior fixed-box per-order economics where direct catalog data is too thin.

---

## Per-order P&L (target state)

| Line item | Cents | $ | Source |
|---|---|---|---|
| **Average order value (AOV)** | 9,000 | $90.00 | Stripe, 34 successful charges since launch, lifetime |
| **Cost of goods sold** | (5,400) | ($54.00) | 60% of AOV. Run A Way Buckers Club (Pembroke, IL) wholesale + protein landed cost |
| **Gross margin** | 3,600 | $36.00 | **40%** at AOV |
| Packaging (box, ice pack, paper) | (200) | ($2.00) | Estimate, single-supplier sourcing |
| Last-mile delivery (driver, fuel) | (700) | ($7.00) | Net of $7.99 customer delivery fee charged separately at $0.99 contribution |
| Stripe processing (2.9% + $0.30) | (290) | ($2.90) | At $90 AOV |
| Promo cost (FRESH10 amortized) | (300) | ($3.00) | $10 off ÷ assumed ~3.3x repeat lifetime, first-order absorbs full $10 |
| Trigger.dev / Resend / Vercel infra | (100) | ($1.00) | At ~100 orders/mo |
| **Contribution margin per order** | 2,010 | **$20.10** | **22% of AOV** |

**Variable cost = $69.90. CM/order = $20.10.**

---

## Three CAC scenarios

| Scenario | CAC | First-order payback | Notes |
|---|---|---|---|
| **Today (observed)** | ~$200 | ~10 orders to recover | $48.96 paid spend May 4, zero attributable conversions. Math is "blended ROAS 0.0 yesterday." Pre-fix infrastructure was the binding constraint. |
| **Target (60-day)** | $40 to $55 | First order net positive | Reasonable for Chicago hyperlocal Meta + Google after geo gates, negative-keyword list, and creative aligned to /shop landing. Anchored to industry benchmarks for consumer perishables in mid-tier markets. |
| **Required for venture-style payback** | <$25 | Payback in 1 order, profitable thereafter | Achievable only with strong organic / referral mix. Not Year-1 plausible. |

---

## Lifetime value (LTV), UNMEASURED

- Zero documented repeat-purchase cohorts in catalog era (5 days live).
- Doina's grandfathered $55/wk subscription is the only recurring revenue and is excluded from box-business LTV math (different product, different terms).
- Naive assumption per Fifth Star deck: 4 orders/customer over 6 months = $360 LTV at $90 AOV = $80.40 CM lifetime.
- **This is an assumption, not a measurement.** A primary use of fund capital is buying the time and traffic needed to measure actual cohort retention.

---

## Unit-economic gates for graduating to a Seed round

| Metric | Today | Gate value | Method |
|---|---|---|---|
| AOV | $90 | $75 to $100 (hold) | Stripe |
| Gross margin | claimed 40% | observed ≥35% | Per-order COGS audit |
| CAC | ~$200 (broken) | ≤$60 | Stripe metadata + Meta/Google spend |
| First-order payback | impossible at current CAC | ≤2 orders | CM × order # |
| 30-day repeat rate | unmeasured | ≥25% | Stripe customer cohort |
| LTV/CAC ratio | n/a | ≥3.0 | Computed from above |

**A reasonable founder commitment to Fifth Star:** "When 4 of 6 metrics in the gate table land in their ranges, I am back for a real Seed conversation."

---

## Honest commentary

- **AOV of $90 is real** and slightly above industry median for direct-to-consumer produce boxes (Misfits ~$60, Imperfect ~$45, Hungry Harvest ~$33 to $55). The premium is defensible: Black-farmer sourcing, hyperlocal protein, no national consolidation discount.
- **40% claimed gross margin is the parent-deck assumption.** Catalog-era per-order COGS hasn't been audited yet. A funded action item.
- **The CAC story is the live wound.** Without the deferred-analytics fix, the Pixel feedback loop to Meta was broken. The 2026-05-05 ship is what makes a $40 to $55 CAC even discussable. Pre-fix data is unreliable for forward planning.
- **LTV is the asymmetric upside.** Black grocery customers are notoriously sticky to merchants who reflect their food culture (cf. Restaurant Depot, Soul Vegetarian, Forty Acres Fresh Market). If catalog cohorts hold, LTV/CAC could be substantially better than the broader DTC produce category average. This is the bet worth funding.
