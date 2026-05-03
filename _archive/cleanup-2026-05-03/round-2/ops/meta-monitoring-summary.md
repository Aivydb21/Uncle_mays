# Meta Campaign Daily Monitoring — Setup Complete ✅

**Issue:** UNC-380  
**Status:** DONE (completed 2026-04-18)  
**Owner:** RevOps  
**Timeline:** Delivered on schedule (deadline was 2026-04-19)

## What You'll See Tomorrow Morning (2026-04-19)

Your daily report email (arrives 8:00 AM Central) will now include a **Meta Ads** section with:

### Campaign Overview
- Campaign name: "Subscription Launch Apr 2026"
- Status (ACTIVE/PAUSED/etc.)
- Daily budget: $67.00

### 24-Hour Performance
- Spend
- Impressions & Reach
- Clicks
- **Initiated Checkouts** (primary KPI)
- CPA (cost per initiated checkout)
- ROAS (if purchases are firing)

### 7-Day Rolling Averages
- Spend per day
- Checkouts per day
- CPA (7-day average)
- ROAS (7-day average)

### Alerts (if any)
Yellow highlighted box with warnings:
- Campaign not ACTIVE
- No spend in last 24 hours
- CPA exceeds $20
- Underspending (<50% of daily budget)

### Quick Action
Direct link to Meta Ads Manager for immediate drill-down if issues arise.

## How It Works

### Automated Daily Report
1. **Trigger.dev task** runs every weekday at 8:00 AM Central
2. Hits Meta Marketing API to fetch campaign insights (24h + 7d)
3. Calculates CPA, ROAS, and checks alert thresholds
4. Generates HTML email with visual metrics cards
5. Sends to anthony@unclemays.com, peter@unclemays.com, joe.harwood@kellogg.northwestern.edu

### Manual Check Anytime
```bash
# Quick check from terminal
cd ~/Desktop/um_website
python3 investor-outreach/scripts/fetch-meta-campaign-stats.py

# Full daily report (all sections including Meta)
bash investor-outreach/scripts/daily-report.sh
```

## What to Watch For

### Green Light ✅
- Campaign status: ACTIVE
- Spend tracking to daily budget ($67)
- CPA below $15 (target) or at least below $20 (warning threshold)
- Steady checkout volume

### Yellow Light ⚠️
- CPA between $15-$20 (above target, below warning)
- Spend significantly under/over budget
- Low checkout volume despite healthy traffic

### Red Light 🚨
- Campaign paused or not ACTIVE
- No spend for 24+ hours (delivery issue)
- CPA above $20 (poor conversion or targeting)

## Alert Response Playbook

| Alert | Root Cause | What to Do |
|-------|-----------|------------|
| Campaign not ACTIVE | Paused by Facebook or manually | Check Ads Manager for policy violations or manual pause |
| No spend 24h+ | Learning phase, budget cap, or ad set paused | Review ad set status, increase budget if capped, check audience size |
| CPA > $20 | Poor landing page conversion, bad targeting, weak creative | Review GA4 checkout funnel, test new audience, refresh creative |
| Underspending | Low audience reach, high bid competition, ad fatigue | Expand audience, adjust bid strategy, rotate creative |

## Files Created/Modified

**New Files:**
- `investor-outreach/scripts/fetch-meta-campaign-stats.py` — Python helper for Meta API
- `ops/meta-campaign-monitoring.md` — Full monitoring documentation
- `ops/meta-monitoring-summary.md` — This file (setup summary)

**Modified Files:**
- `investor-outreach/scripts/daily-report.sh` — Added Meta section (lines 526-593)
- `src/trigger/daily-report.ts` — Added Meta functions and HTML section
- `CLAUDE.md` — Added Meta Campaign Daily Monitoring subsection

## Current Campaign Status (as of 2026-04-18, 9:00 AM)

Campaign launched yesterday (2026-04-17) and is showing as ACTIVE but no spend yet. This is normal for campaigns in learning phase or awaiting first ad delivery. By tomorrow morning's report, you should see:
- First spend data (if delivery started)
- Initial impressions and reach
- Early conversion signals (checkouts)

If tomorrow's report still shows $0 spend, that's when you'll want to investigate in Ads Manager.

## Next Steps

1. **Tomorrow (2026-04-19):** Receive first daily report with Meta section at 8:00 AM Central
2. **Monitor daily:** Check email alerts and metrics each morning
3. **Take action:** Click Ads Manager link if alerts trigger
4. **Optimize:** Use CPA and ROAS data to inform creative, targeting, and budget decisions

## Questions?

- **Documentation:** See `ops/meta-campaign-monitoring.md` for full details
- **API Reference:** `docs/meta-api-reference.md` has all Meta API endpoints and IDs
- **Test manually:** Run `python3 investor-outreach/scripts/fetch-meta-campaign-stats.py` anytime
- **Contact RevOps:** Post to UNC-380 if you need threshold adjustments or additional metrics

---

**Setup completed by:** RevOps agent (b8496569-99a4-47cb-8978-c4652c7d14f5)  
**Delivered:** 2026-04-18 (one day ahead of deadline)  
**First scheduled report:** 2026-04-19 at 8:00 AM Central
