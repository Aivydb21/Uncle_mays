# Uncle May's Produce — Line of Credit Payback Memo

**As of:** 2026-05-19
**Prepared for:** Anyone evaluating an incremental $10,000 draw on the Greenwood Archer Capital line of credit, the existing $11,000 outstanding balance, or a near-term bridge / SAFE check that would retire the LOC at close.
**Author:** CEO, with data pulled from Stripe, GA4, BigQuery, and QuickBooks Online.

---

## 1. Executive summary

Uncle May's Produce operates a citywide Chicago grocery delivery service while preparing to open a 10,000 sq ft flagship in Hyde Park. The flagship is the durable business; the current delivery operation is a paid demand-test that proves customer willingness-to-pay and informs assortment for the flagship.

The CEO is requesting an incremental **$10,000 draw** on an existing Greenwood Archer Capital line of credit to fund (a) inventory expansion to the top 30 SKUs most-purchased by Black households (sourced from product-mix research currently underway), and (b) vendor / farmer-story social content production. This memo models the payback economics, the order velocity required to service the debt safely, and the data-quality caveats that should temper any forecast.

**The math at a glance:**

| Item | Amount |
|---|---:|
| Existing LOC balance | $11,000 |
| Proposed incremental draw | $10,000 |
| Pro forma LOC balance | $21,000 |
| Rate (Greenwood Archer Capital) | ~10% APR |
| Current AOV (external customers, gross) | $50.75 |
| Stabilized gross margin assumption | 30% |
| Current order velocity | ~2 external orders/week |
| Target ramp (M1 → M5) | 5 → 12 → 20 → 35 → 50/wk |
| Break-even velocity (cash flow neutral, interest-only on $21K) | **~33 orders/week** |
| End-of-M5 cash position (interest-only servicing) | ~$13,168 |
| End-of-M5 LOC balance (interest-only servicing) | $21,000 |
| End-of-M5 net equity vs today (interest-only) | $2,832 worse |

**Recommendation in this memo:** Take the $10,000 draw. Service the full $21,000 LOC interest-only (~$175/month) during the 5-month ramp. Retire principal from the next SAFE close, not from operating cash, because amortizing principal during the ramp would starve the program the draw is funding.

---

## 2. Current financial position

Source: QuickBooks Online (production), Stripe live balance, refreshed 2026-05-19 16:28 UTC.

### 2.1 Balance sheet

| | Amount |
|---|---:|
| Chase x4738 operating cash | $5,994.58 |
| Stripe clearing | –$69.07 |
| Stripe available + pending | ~$95 |
| **Total liquid cash** | **~$6,090** |
| Accounts receivable | $0 |
| Accounts payable | $0 |
| **Line of Credit (Greenwood Archer Capital)** | **$11,000.00** |
| Total liabilities | $11,000.00 |
| **Equity** | **–$5,074.49** |

The business is technically book-insolvent (liabilities exceed assets by ~$5K) but has zero trade payables and no past-due receivables. The negative equity is entirely a function of pre-opening expenses incurred ($25,000 YTD) ahead of revenue generation at the flagship.

### 2.2 Profit & loss

**YTD (2026-01-01 → 2026-05-19):**

| | Amount |
|---|---:|
| Sales | $381.18 |
| COGS (produce + payment processing) | $405.51 |
| Gross profit | ($24.33) |
| Operating expenses | $29,092.79 |
| of which: pre-opening expenses | $25,000.00 |
| of which: software & subscriptions | $1,436.80 |
| of which: contractor fees | $1,305.49 |
| of which: Meta + Google ads | $1,116.33 |
| Interest expense (LOC) | $78.00 |
| **Net loss YTD** | **($29,195.12)** |

**Trailing 90 days (excludes the $25K pre-opening bucket), more representative of operating run rate:**

| | Amount |
|---|---:|
| Sales | $381.18 |
| COGS | $402.18 |
| Gross profit | ($21.00) |
| Operating expenses | $4,092.79 |
| Interest expense | $78.00 |
| **Net loss (90 days)** | **($4,191.79)** |
| **Implied monthly burn** | **~$1,400** |

Current gross margin is negative because per-unit produce cost has not been amortized over a meaningful order base. Top-30 expansion and farmer-direct sourcing are the explicit interventions to move gross margin to the 30% assumption used in this memo.

### 2.3 Source of cash YTD

| Source | Amount |
|---|---:|
| Owner contribution (Anthony Ivy) | $29,319.89 |
| Owner distribution back | ($10,750.00) |
| LOC draw (Greenwood Archer) | $11,000.00 |
| Net operating cash use | ($18,126.05) |
| **Ending cash** | **$5,994.58** |

---

## 3. Demand evidence: what we know about the funnel today

### 3.1 Traffic (28 days, 2026-04-22 → 2026-05-19)

Source: GA4 Data API, reconciled against the BigQuery raw GA4 export `analytics_494626869.events_*`. The two sources agree within 0.2% on sessions.

| Source | Sessions | Users | Purchases recorded |
|---|---:|---:|---:|
| GA4 Data API | 4,827 | 4,047 | 8 |
| BigQuery raw export (subset window 4/29–5/18) | 1,910 | 1,732 | 1 |
| GA4 Data API (same subset window) | 1,914 | 1,732 | 1 |

Weekly breakdown:

| Window | Sessions | GA-recorded purchases | Session CVR (per GA) |
|---|---:|---:|---:|
| 4/22 – 4/28 (wk1) | 2,719 | 6 | 0.22% |
| 4/29 – 5/05 (wk2) | 481 | 2 | 0.42% |
| 5/06 – 5/12 (wk3) | 790 | 0 | 0.00% |
| 5/13 – 5/19 (wk4) | 763 | 0 | 0.00% |

wk1 reflects a paid-traffic spike from the period preceding the 2026-05-09 paid-ads pause/restart cycle. The honest recent baseline is **~750 sessions/week**.

### 3.2 Stripe-confirmed orders (ground truth, last 28 days)

GA4 only captured 8 of 15 actual successful charges as purchase events; the remainder were not pixel-fired due to checkout-flow bugs that have since been resolved (UNC-1094, UNC-1202, UNC-1204, UNC-1211). **Stripe is the source of truth for actual revenue events.**

| Window | Successful charges | Refunded | Gross | Net retained |
|---|---:|---:|---:|---:|
| 4/22 – 4/28 (wk1) | 5 | 4 | $251.00 | $0.00 |
| 4/29 – 5/05 (wk2) | 3 | 1 | $170.70 | $142.00 |
| 5/06 – 5/12 (wk3) | 3 | 3 | $130.01 | $0.00 |
| 5/13 – 5/19 (wk4) | 4 | 1 | $164.96 | $103.82 |
| **28-day total** | **15** | **10** | **$716.67** | **$245.82** |

After excluding internal test charges (founder mailboxes) and the one grandfathered $55/wk subscription, **8 external customer charges occurred in the 28-day window**. Of those, 3 were refunded and 5 are retained, producing 5 net retained external customers in the period.

Weekly external-customer trend (the only weekly count that matters for forecasting):

| Window | External orders | Refunded | Net retained |
|---|---:|---:|---:|
| wk1 | 1 | 0 | 1 |
| wk2 | 1 | 0 | 1 |
| wk3 | 2 | 2 | 0 |
| wk4 (current week, 2 days remain) | 4 | 1 | 3 |

The most recent week is the strongest external-conversion week of the period, including two same-day orders on 2026-05-19, and is the first week with the FRESH10 / FRESH30 promo codes retired. This is a small but encouraging signal that demand exists at the regular price.

### 3.3 Average order value

| Metric | Value |
|---|---:|
| Gross AOV across 8 external customer orders (28d) | $50.75 |
| Range | $15.08 to $72.00 |
| Median | $52.06 |

The $50.75 figure is the gross AOV before refunds, used as the AOV in payback modeling.

### 3.4 Functional CVR

The honest functional CVR is the count of **external customer orders divided by sessions**, not the GA-recorded `purchase` count which under-counts due to the (now-fixed) pixel issue.

| Slice | Count | Sessions | CVR |
|---|---:|---:|---:|
| All Stripe successful charges | 15 | 4,827 | 0.31% |
| External customers only | 8 | 4,827 | 0.17% |
| External, net of refunds | 5 | 4,827 | 0.10% |

The most-conservative reading is **0.10% net-retained CVR**. The headline AOV-times-CVR figure used in payback modeling assumes 30% gross margin on gross AOV against gross order count; refunds are treated as a separate operational lever to be improved, not as a permanent denominator deduction.

---

## 4. Data quality caveats (mandatory disclosure)

A lender or investor should know which of our numbers are durable and which are still being repaired. As of 2026-05-19:

1. **GA4 pixel under-counts purchases by ~50%.** The Stripe-vs-GA gap (15 charges, 8 recorded) is driven by checkout-flow bugs fixed in May (UNC-1094, UNC-1202, UNC-1204, UNC-1211). The retry-up-to-8-times-at-1s-intervals fix on the order-success purchase pixel should close the gap going forward, but historical CVR figures from GA alone are unreliable.

2. **dbt mart layer in BigQuery is 13 days stale.** Source: `mart_conversion_funnel.session_date` maxes at 2026-05-06. Issue [UNC-1216](https://paperclip.ing/UNC/issues/UNC-1216) is open with RevOps to schedule a daily `dbt run --target prod`. Until this resolves, any analyst running the CRO or CEO weekly reports is reading half-month-old funnels.

3. **LogRocket programmatic recon is not yet wired.** `logrocket_raw` dataset in BigQuery contains zero tables. The Galileo daily briefing journal (`logrocket_galileo.briefings`) has stored only 4 rows from a single 2026-05-16 run, and those rows store intermediate "thinking" messages rather than final Galileo conclusions. Issues [UNC-1217](https://paperclip.ing/UNC/issues/UNC-1217) (Data Engineer, ship Phase 5 ingest + fix-tracking dedup) and [UNC-1220](https://paperclip.ing/UNC/issues/UNC-1220) (CTO, ship-today fix for the polling loop) are open.

4. **The 30% gross margin assumption is forward-looking, not historical.** Actual YTD gross margin is negative because per-unit COGS has not amortized over a meaningful order base. The 30% figure is the stabilized margin target after top-30 expansion and farmer-direct sourcing. CLAUDE.md cites a 35% target at flagship-store scale; this memo uses the more conservative 30% interim figure.

5. **The wk1 GA4 traffic spike is not the baseline.** 2,719 sessions in 4/22–4/28 reflected a paid-ads spike before the 2026-05-09 pause cycle. The honest current baseline is ~750 sessions/week.

---

## 5. The expansion thesis

### 5.1 What the $10,000 funds

| Bucket | Estimated allocation | Purpose |
|---|---:|---|
| Inventory | ~$7,000 | Stock the top 30 SKUs most-purchased by Black households per the product-mix research underway (memory: product-mix reset 2026-05-16) |
| Social content production | ~$3,000 | Vendor and farmer-story content (organic and paid) tying the assortment expansion to a content program |

### 5.2 Why these two interventions are coupled

The current 47-SKU catalog (in Airtable `appm6F6H9obydzAM2 / Catalog`) does not include the staples that drive grocery-purchase frequency for the target customer. Assortment gap is the dominant suspect for the 0.17% session CVR — visitors land, scan the catalog, see no eggs / bananas / cooking oil / staples, and leave.

Top-30 expansion closes the assortment gap. Farmer-story content closes a separate gap (cold paid traffic landing on a product page with no narrative). The CVR lever and the trust lever have to fire together; isolating one or the other has not moved the number in prior tests.

### 5.3 Order ramp assumption used in this memo

The CEO's stated trajectory:

| Month | Orders / week (target) |
|---|---:|
| M1 | 5 |
| M2 | 12 |
| M3 | 20 |
| M4 | 35 |
| M5 | 50 |

This implies 528 orders over 5 months, generating $26,809 in revenue at the current $50.75 AOV, and $8,043 in gross profit at the 30% assumed margin.

---

## 6. Payback model

### 6.1 Scenario A: amortize the new $10,000 over 5 months, leave the existing $11,000 rolling interest-only

| Component | Monthly |
|---|---:|
| $10,000 amortizing principal + interest @ 10% APR over 5 months | $2,051 |
| $11,000 existing balance interest-only @ 10% APR | $92 |
| Operating expense (current $1,400 baseline + ongoing social) | $2,000 |
| **Total monthly cash requirement** | **$4,143** |

Monthly cash flow trace, starting from $16,000 (today's $6,000 cash + the $10,000 LOC draw):

| Month | Gross profit (30% GM) | Cash need | Net | Running cash |
|---|---:|---:|---:|---:|
| Start | — | — | — | $16,000 |
| M1 | $330 | $4,143 | ($3,813) | $12,187 |
| M2 | $791 | $4,143 | ($3,352) | $8,835 |
| M3 | $1,319 | $4,143 | ($2,824) | $6,011 |
| M4 | $2,307 | $4,143 | ($1,836) | $4,175 |
| M5 | $3,296 | $4,143 | ($847) | **$3,328** |

End state: $10K draw fully amortized; $11K balance still rolling interest-only; cash ~$3,328; doing 50 orders/week.

### 6.2 Scenario B (recommended): interest-only on the full $21,000, retire principal at SAFE close

| Component | Monthly |
|---|---:|
| $21,000 interest-only @ 10% APR | $175 |
| Operating expense | $2,000 |
| **Total monthly cash requirement** | **$2,175** |

Monthly cash flow trace:

| Month | Gross profit (30% GM) | Cash need | Net | Running cash |
|---|---:|---:|---:|---:|
| Start | — | — | — | $16,000 |
| M1 | $330 | $2,175 | ($1,845) | $14,155 |
| M2 | $791 | $2,175 | ($1,384) | $12,771 |
| M3 | $1,319 | $2,175 | ($857) | $11,914 |
| M4 | $2,307 | $2,175 | $132 | $12,046 |
| M5 | $3,296 | $2,175 | $1,121 | **$13,168** |

End state: $21K LOC still outstanding; cash ~$13,168; cash flow flipped positive in M4; LOC retired from the next SAFE close.

### 6.3 Net comparison at end of M5

| Scenario | Cash | LOC owed | Net equity delta vs today |
|---|---:|---:|---:|
| Today | $6,000 | $11,000 | baseline |
| Scenario A (amortize) | $3,328 | $11,000 | ($2,672) |
| Scenario B (interest-only) | $13,168 | $21,000 | ($2,832) |

The end-of-period net equity position is nearly identical in the two scenarios (within $160 of each other). The decisive difference is the **mid-period cash trough**: Scenario A drains cash to $3,328 in M5, leaving zero cushion for a missed ramp month; Scenario B holds $11,914 even at its low point in M3, which is the cushion that lets the program absorb a one-month slip without dying.

---

## 7. Break-even and CVR mechanics

### 7.1 Break-even order count

Break-even = monthly cash need ÷ (AOV × GM):

| Scenario | Monthly cash need | At $50.75 AOV / 30% GM | Orders / month | **Orders / week** |
|---|---:|---:|---:|---:|
| Interest-only $21K | $2,175 | $15.23 contribution | 143 | **~33** |
| Amortize $10K + roll $11K | $4,143 | $15.23 contribution | 272 | **~63** |

The interest-only break-even of ~33 orders/week falls between the stated M3 (20/wk) and M4 (35/wk) targets, which is the realistic crossover point in the ramp.

### 7.2 CVR required at current traffic

At the honest recent baseline of ~750 sessions/week:

| Milestone | Orders/week | CVR required | Multiple of current 0.17% |
|---|---:|---:|---:|
| M1 | 5 | 0.67% | 4× |
| M2 | 12 | 1.60% | 9× |
| M3 | 20 | 2.67% | 16× |
| **Break-even (interest-only)** | **33** | **4.40%** | **26×** |
| M5 | 50 | 6.67% | 39× |

The 4.40% CVR at flat traffic is at the high end of grocery delivery industry benchmarks (typical range: 1–3% ecommerce, 3–5% warm-traffic grocery). It is not realistic to hit purely by CVR optimization on the current 750 sessions/week.

### 7.3 The realistic balanced path

Both traffic and CVR have to move:

| Path | Sessions/wk | CVR | Orders/wk |
|---|---:|---:|---:|
| Pure CVR lift (constant traffic) | 750 | 4.40% | 33 |
| Pure traffic growth (constant CVR) | 19,400 | 0.17% | 33 |
| **Balanced (realistic)** | **1,500** | **2.20%** | **33** |
| Balanced (stretch) | 2,000 | 1.65% | 33 |

Pure traffic growth is mathematically possible but not affordable at $2K/month operating expense. Pure CVR optimization assumes a product fix that single-handedly outperforms industry benchmarks, which is implausible. The balanced path is the only one consistent with the program economics.

### 7.4 What the top-30 + farmer story program must deliver to hit break-even by M4

| Lever | M0 baseline | M4 target | What drives it |
|---|---:|---:|---|
| Weekly sessions | 750 | 1,500 | Farmer-story content (organic + paid amplification), warmer creative |
| Session CVR | 0.17% | 2.20% | Top-30 SKU expansion closes the assortment-gap problem |
| AOV | $50.75 | $50–60 | Held roughly flat; some upside from cross-category bundling |
| **Orders / week** | **~2** | **~33** | Break-even |

Both levers must fire. A traffic-only or CVR-only delivery does not reach the break-even bar.

---

## 8. Risk-managed tripwires

The model is forward-looking and contains compounding assumptions. The CEO has agreed to the following hard tripwires for this program. Any investor or lender reviewing this memo should expect these to be enforced:

| Checkpoint | Hard threshold | Action if breached |
|---|---|---|
| End of M2 | Below 8 orders/wk | Pause incremental ad / content spend; re-evaluate before further LOC use |
| End of M3 | Below 1,000 sessions/wk OR below 1.2% CVR | Pause paid; Galileo deep-dive on funnel; no further draws |
| Hit 33 orders/wk sustained | — | Begin sweeping operating surplus toward LOC paydown automatically |
| Refund rate above 50% on external orders | — | Stop new ad spend; root-cause refund reasons before scaling |
| SAFE close timing | If not closed by end of M5 | Convert to a conservation posture (target 5 orders/wk floor on existing demand, cut content spend) |

The refund-rate tripwire is included because of the historical pattern: 10 of 15 succeeded charges in the trailing 28 days were refunded. Even excluding internal-test refunds, 3 of 8 external-customer charges were refunded (37.5%). This pattern needs to compress to a healthy single-digit percentage for the unit economics in this memo to be reliable.

---

## 9. Open questions a check-writer should ask

1. **What is the actual Greenwood Archer Capital rate, draw cap, and minimum-payment schedule?** This memo assumes 10% APR and interest-only optionality; both should be confirmed in writing before relying on the Scenario B path.
2. **What is the SAFE close timeline?** The Scenario B exit plan assumes the SAFE retires the $21K LOC at close. Slippage materially changes the recommended posture.
3. **What is the actual landed-cost margin on the proposed top-30 SKU list?** The 30% gross margin is an assumption pending Airtable `app3raEVB9kHeUoHE` (Product Mix) sourcing-cost validation. A direct margin computation per SKU is an open data-engineering ask.
4. **What is Anthony's remaining personal contribution capacity?** YTD owner contributions are $29,320; a quantified remaining capacity bounds the worst-case bridge if SAFE close slips.
5. **What happens to the dbt mart freshness and LogRocket observability gaps?** Open issues UNC-1216, UNC-1217, and UNC-1220 must close before the M2 and M3 tripwire checks can be performed reliably. If those slip, the tripwires become harder to enforce because the underlying data is stale.

---

## 10. Appendix: raw data referenced

### A.1 Stripe successful charges, last 28 days (gross)

| Date | Amount | Refunded | Email/Description |
|---|---:|---:|---|
| 2026-04-22 | $30.00 | $30.00 | anthonypivy@gmail.com (internal test) |
| 2026-04-22 | $55.00 | $55.00 | anthonypivy@gmail.com (internal test) |
| 2026-04-22 | $75.00 | $75.00 | anthonypivy@gmail.com (internal test) |
| 2026-04-23 | $55.00 | $55.00 | doina.romanciuc.dr@gmail.com (grandfathered $55/wk sub) |
| 2026-04-26 | $36.00 | $36.00 | anthony@unclemays.com (internal test) |
| 2026-04-28 | $72.00 | $0.00 | awoods@mail.roosevelt.edu |
| 2026-04-30 | $70.00 | $0.00 | miriamisjackson@gmail.com |
| 2026-05-03 | $28.70 | $28.70 | anthony@unclemays.com (internal test) |
| 2026-05-07 | $53.01 | $53.01 | vaughnshaunte@gmail.com |
| 2026-05-10 | $30.97 | $30.97 | anthony@unclemays.com (internal test) |
| 2026-05-10 | $46.03 | $46.03 | tolch.nicole@gmail.com |
| 2026-05-13 | $61.14 | $61.14 | BREADFRUITDESIGN@YAHOO.COM |
| 2026-05-18 | $15.08 | $0.00 | elenahoffenberg@gmail.com |
| 2026-05-19 | $59.10 | $0.00 | keenamgarner@yahoo.com |
| 2026-05-19 | $29.64 | $0.00 | knoahf@gmail.com |
| **Totals** | **$716.67** | **$470.85** | Net retained: **$245.82** |

### A.2 GA4 sessions, last 28 days, weekly

| Window | Sessions | Users | GA-recorded purchases |
|---|---:|---:|---:|
| 2026-04-22 – 2026-04-28 | 2,719 | — | 6 |
| 2026-04-29 – 2026-05-05 | 481 | — | 2 |
| 2026-05-06 – 2026-05-12 | 790 | — | 0 |
| 2026-05-13 – 2026-05-19 | 763 | — | 0 |
| **Total (28d)** | **4,827** | **4,047** | **8** |

### A.3 Sources

- **Stripe Charges API:** live restricted key at `~/.claude/stripe-config.json`, queried 2026-05-19 16:28 UTC.
- **GA4 Data API:** OAuth token at `~/.claude/ga-oauth-token.json`, property `properties/494626869`.
- **BigQuery raw GA4 export:** `analytics_494626869.events_*`, service account `claude-ga-reader@uncle-mays-automation.iam.gserviceaccount.com`.
- **QuickBooks Online:** OAuth at `~/.claude/quickbooks-config.json`, realm `9341457028491148`, refreshed 2026-05-19.
- **Customer-facing source of truth:** [`customer-facts.md`](../../customer-facts.md) in this repo.
- **Open Paperclip issues referenced:** UNC-1216 (dbt mart refresh), UNC-1217 (LogRocket Phase 5 ingest), UNC-1220 (Galileo polling fix).

---

**End of memo.**
