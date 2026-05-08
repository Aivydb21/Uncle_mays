# Uncle May's — Weekly Conversion Scorecard

**Template version**: 1.0 (2026-05-08)  
**Owner**: Decision Scientist  
**Cadence**: Updated every Monday; covers the prior 7-day window (Mon–Sun)  
**Data sources**: Stripe API (charges + payment_intents), GA4 BQ (`events_*`)

---

## Week of: [YYYY-MM-DD to YYYY-MM-DD]

### Top-Line Metrics

| Metric | This Week | Last Week | 4-Week Avg | Source |
|---|---|---|---|---|
| Orders | | | | Stripe charges succeeded |
| Revenue | | | | Stripe charges amount |
| AOV | | | | Revenue / Orders |
| Sessions | | | | GA4 session_start |
| End-to-end CVR | | | | Orders / Sessions |

---

### Funnel Breakdown

| Stage | n (unique) | Rate | vs Last Week | Source |
|---|---|---|---|---|
| Sessions | | — | | GA4 |
| /shop visitors | | % of sessions | | GA4 page_view |
| Add-to-cart | | % of shop visitors | | GA4 add_to_cart |
| Checkout page | | % of ATC users | | GA4 page_view |
| PaymentIntents created | | % of checkout | | Stripe |
| PI completed (succeeded) | | % of PIs | | Stripe |
| Orders | | % of PIs | | Stripe |

---

### Experiment Tracker

| Experiment | Status | Key Metric | Baseline | This Week | Signal |
|---|---|---|---|---|---|
| EXP-002: Mobile payment fix | Running | PI completion rate | 22.2% | | |

---

### Geographic Split (Top 5 Cities)

| City | Sessions | % of Total | In Service Area? |
|---|---|---|---|
| | | | |

---

### Device Split

| Device | Sessions | ATC Users | ATC Rate | PI Completion |
|---|---|---|---|---|
| Mobile | | | | |
| Desktop | | | | |

---

### Traffic Source Summary

| Source / Medium | Sessions | Shop Visits | ATC | Orders |
|---|---|---|---|---|
| | | | | |

---

### Flags (auto-fill each week)

- [ ] PI completion rate < 40% → escalate to CTO
- [ ] Out-of-area traffic > 40% of sessions → flag for ad targeting review (requires board approval to act)
- [ ] Bounce rate > 85% → flag for homepage CTA review
- [ ] Zero orders in 3+ consecutive days → escalate to CEO

---

### Notes / Anomalies

[Any unusual patterns, one-off events, or data quality issues this week]

---

## How to Update This Scorecard

Run the following Stripe + GA4 queries for the prior 7-day window and paste results into the table above:

**Stripe (Python)**:
```python
import urllib.request, base64, json, time

KEY = open('~/.claude/stripe-config.json').read()  # parse json
SINCE = int(time.time()) - 7*86400

auth = base64.b64encode((KEY + ':').encode()).decode()
# Charges
charges = GET /v1/charges?limit=100&created[gte]=SINCE
# PaymentIntents  
pis = GET /v1/payment_intents?limit=100&created[gte]=SINCE

orders = len([c for c in charges if c['status']=='succeeded'])
pi_completion = succeeded_pis / total_pis
```

**GA4 BQ (Python + google-auth)**:
```sql
SELECT
  event_name,
  COUNT(DISTINCT user_pseudo_id) as unique_users
FROM `uncle-mays-automation.analytics_494626869.events_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  AND event_name IN ('session_start', 'add_to_cart', 'begin_checkout', 'purchase')
GROUP BY 1
```

---

## Historical Record

| Week | Orders | Revenue | CVR | PI Completion | Sessions | Notes |
|---|---|---|---|---|---|---|
| 2026-05-01 to 2026-05-07 | 2 | $81.71 | 0.71% | 22.2% | 280 | Catalog launched May 3; payment bug identified + fixed May 8 |
