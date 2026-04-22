# Week 1 Daily Dashboard - Quick Start Guide

## Running the Dashboard (Every Morning, 9am CT)

### Step 1: Run the Script

```bash
cd ~/Desktop/um_website
python scripts/week1-performance-dashboard.py
```

This generates a report for **yesterday's data** (default behavior).

**To generate a report for a specific date:**
```bash
python scripts/week1-performance-dashboard.py 2026-04-17
```

### Step 2: View the Report

Reports are saved to: `reports/week1-daily/performance-report-YYYY-MM-DD.md`

**Example:**
```bash
cat reports/week1-daily/performance-report-2026-04-17.md
```

### Step 3: Deliver to CRO

**Option A: Copy to Paperclip (Preferred)**
1. Copy report content
2. Post as comment on UNC-355 (parent campaign task)
3. Tag: `@CRO` for visibility

**Option B: Slack (Backup)**
1. Copy report content
2. Post to #marketing channel
3. Tag: `@Anthony` (CRO)

---

## What the Dashboard Shows

### Orders & Revenue
- Today's order count and revenue
- Average order value
- FREESHIP promo code redemptions
- Week 1 cumulative progress toward target (15-23 orders)
- Current run rate (orders/week)

### Paid Campaign Performance

**Google Ads:**
- Total spend vs budget ($30-40/day target)
- Impressions, clicks, CTR
- CPC (target: <$2.00)
- Conversions
- CAC (target: <$100)
- Top 3 campaigns by CTR

**Meta Ads:**
- Total spend vs budget ($60-70/day target)
- Impressions, clicks, CTR
- CPC (target: <$1.80)
- Conversions
- CAC (target: <$100)
- Top 3 campaigns by CTR

**Blended:**
- Total ad spend across all channels
- Total conversions
- Blended CAC (target: <$100)

### Website Traffic (GA4)
- Sessions, users, page views
- Checkout starts
- Purchases (GA4 event count)
- Conversion rate (target: >2%)

### Alerts
- Campaigns with >$50 spend, 0 conversions 🚨
- Variants with CTR <1% ⚠️
- Blended CAC >$100 ⚠️ or >$150 🚨
- Landing page conversion rate <1% ⚠️

### Recommendations
- **Kill:** Underperforming variants (high spend, zero conversions)
- **Double down:** Top performers (CTR >2%, converting)
- **Budget shifts:** Move budget toward better-performing channel
- **Landing page fixes:** If conversion rate is low

---

## Common Issues

### "API Error" Warnings in Report

**Meta Ads API Error (Error 190):**
- OAuth token expired
- **Fix:** CRO to re-authenticate Meta Business account
- **Impact:** Meta data unavailable in report until fixed

**Google Ads API Error (Permission Denied):**
- OAuth refresh token or customer_id permissions issue
- **Fix:** CRO to verify Google Ads API credentials
- **Impact:** Google Ads data unavailable in report until fixed

**Dashboard will still generate a report with whatever data is available.**

### "No Orders" Day 1

**Expected:**
- Day 1 (Apr 17) is launch day
- First orders may take 24-48h
- Report will show $0 revenue until first purchase

**Not Expected (Day 3+):**
- If 0 orders after 72h of ad spend → escalate to CRO immediately
- Likely tracking issue or funnel break

### Report Not Generating

**Check Python dependencies:**
```bash
pip install -r scripts/requirements-dashboard.txt
```

**Check API configs exist:**
```bash
ls ~/.claude/*-config.json
# Should show: stripe-config.json, google-ads-config.json, meta-config.json, ga-config.json
```

**Check for Python errors:**
```bash
python scripts/week1-performance-dashboard.py 2>&1 | grep -i error
```

---

## Week 1 Daily Schedule (Apr 17-23)

| Date | Day | Tasks |
|------|-----|-------|
| **Apr 17** | Day 1 | Launch day - verify tracking, monitor first 4 hours |
| **Apr 18** | Day 2 | Run dashboard for Apr 17, deliver first report by 9am CT |
| **Apr 19** | Day 3 | Run dashboard for Apr 18, calculate 3-day CAC |
| **Apr 20** | Day 4 | Run dashboard for Apr 19, identify top/bottom variants |
| **Apr 21** | Day 5 | Run dashboard for Apr 20, mid-week check-in with CRO |
| **Apr 22** | Day 6 | Run dashboard for Apr 21 |
| **Apr 23** | Day 7 | Run dashboard for Apr 22, prepare Week 1 summary report |

**Week 1 Summary Report (Apr 24):**
- Aggregate all 7 days
- Top 3 performing variants
- Bottom 50% to kill
- Budget allocation recommendation for Week 2
- Video vs static performance comparison

---

## Key Metrics Reference

| Metric | Target | Yellow Alert | Red Alert |
|--------|--------|--------------|-----------|
| **Weekly Orders** | 15-23 | <10 | <5 |
| **Blended CAC** | <$100 | $100-150 | >$150 |
| **Static CTR** | >1.5% | 1.0-1.5% | <1.0% |
| **Video CTR** | >1.8% | 1.2-1.8% | <1.2% |
| **Landing Page Conversion** | >2% | 1.0-2% | <1% |
| **CPC (Google)** | <$2.00 | $2-3 | >$3 |
| **CPC (Meta)** | <$1.80 | $1.80-2.50 | >$2.50 |

---

## Escalation

**Immediate Escalation to CRO:**
- Any campaign >$100 spend with 0 conversions
- Blended CAC >$200
- All variants CTR <1% for 3+ days
- GA4 purchases ≠ Stripe orders (tracking broken)

**Weekly Escalation to Board:**
- Week 1 orders <10
- Burn rate >$1,000 with <15 orders
- Tracking completely broken (no GA4/Pixel data)

---

**Owner:** RevOps  
**For Questions:** Tag @RevOps in Paperclip or ping in #marketing Slack  
**Last Updated:** 2026-04-17
