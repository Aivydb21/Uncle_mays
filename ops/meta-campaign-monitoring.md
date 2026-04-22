# Meta Campaign Daily Monitoring

**Status:** ACTIVE (2026-04-18) — bid strategy fixed 2026-04-19 (UNC-398)
**Campaign:** Subscription Launch Apr 2026 (ID: `120243219649250762`)  
**Owner:** RevOps (UNC-380)

## Campaign Config (current as of 2026-04-19)

| Setting | Value |
|---------|-------|
| Bid strategy | `LOWEST_COST_WITHOUT_CAP` (was: `LOWEST_COST_WITH_BID_CAP` $2.00 — fixed UNC-398) |
| Optimization goal | `OFFSITE_CONVERSIONS` / `INITIATED_CHECKOUT` |
| Daily budget | $67 |
| Geo targeting | 10-mile radius Hyde Park (was: 5-mile — widened UNC-398) |
| Audience | Women 25-50 |

## Overview

Daily monitoring dashboard for Meta (Facebook/Instagram) ad campaigns, integrated into the existing daily report infrastructure. Tracks spend, conversions, and alerts on performance issues.

## Metrics Tracked

### 24-Hour Performance
- **Spend:** Total ad spend in last 24 hours
- **Impressions:** Number of times ads were shown
- **Reach:** Unique users who saw ads
- **Frequency:** Average times each user saw ads
- **Clicks:** Link clicks to landing page
- **Landing Page Views:** Users who loaded the landing page
- **Initiated Checkouts:** Primary KPI — users who started checkout
- **Purchases:** Completed orders (if pixel is firing)
- **CPA:** Cost per initiated checkout
- **ROAS:** Return on ad spend (if purchase events available)

### 7-Day Rolling Averages
- Spend per day
- Initiated checkouts per day
- CPA (7-day average)
- ROAS (7-day average)

## Alert Thresholds

| Condition | Severity | Action |
|-----------|----------|--------|
| Campaign status ≠ ACTIVE | CRITICAL | Check Ads Manager immediately |
| No spend for 24+ hours | WARNING | Verify campaign isn't paused or out of budget |
| CPA > $20 | WARNING | Review targeting, creative, or landing page |
| Underspending (<50% of daily budget) | WARNING | Check delivery issues in Ads Manager |

**Target metrics (from UNC-380):**
- Daily budget: $67
- Target CPA: <$15
- Campaign objective: Checkout conversions

## Infrastructure

### Bash Script (`investor-outreach/scripts/daily-report.sh`)
- **Meta section:** Lines 526-593
- **Python helper:** `investor-outreach/scripts/fetch-meta-campaign-stats.py`
- **Config:** `~/.claude/meta-config.json` (access token, ad account ID)
- **Output:** Terminal-formatted table with alerts

### Trigger.dev Task (`src/trigger/daily-report.ts`)
- **Schedule:** Daily at 8:00 AM Central (13:00 UTC), Monday-Friday
- **Functions:** `fetchMetaCampaignStats()`, `formatMetaStats()`
- **Env var:** `META_ACCESS_TOKEN` (from `meta-config.json`)
- **Output:** HTML email report with visual alerts

### Python Stats Fetcher (`investor-outreach/scripts/fetch-meta-campaign-stats.py`)
- **API:** Meta Marketing API v21.0
- **Endpoints:**
  - Campaign details: `/v21.0/{campaign_id}?fields=id,name,status,daily_budget,effective_status`
  - Campaign insights: `/v21.0/{campaign_id}/insights?fields=spend,impressions,reach,clicks,actions...`
- **Date presets:** `yesterday` (24h), `last_7d` (7d rolling)
- **Output:** JSON with campaign details, metrics, and alerts

## Usage

### Manual Testing
```bash
# Test Python stats fetcher directly
cd ~/Desktop/um_website
python3 investor-outreach/scripts/fetch-meta-campaign-stats.py

# Run full bash daily report
bash investor-outreach/scripts/daily-report.sh
```

### Trigger.dev Task
```bash
# Manual trigger (for testing)
npx trigger.dev@latest dev
# Then call task: send-daily-report-now
```

### Environment Variables (for Trigger.dev)
```bash
# In .env or Trigger.dev dashboard
META_ACCESS_TOKEN=<from ~/.claude/meta-config.json>
META_CAMPAIGN_ID=120243219649250762  # Hard-coded in task for now
```

## Maintenance

### When Campaign Changes
If the campaign ID changes (new campaign launched), update:
1. `investor-outreach/scripts/fetch-meta-campaign-stats.py` — Line 10: `CAMPAIGN_ID`
2. `src/trigger/daily-report.ts` — Line 503 & 625: `metaCampaignId`
3. This doc — Campaign ID in overview

### When Thresholds Change
If CPA target or daily budget changes, update:
1. `investor-outreach/scripts/fetch-meta-campaign-stats.py` — Lines 12-14: `TARGET_CPA`, `WARNING_CPA`, `DAILY_BUDGET`
2. `src/trigger/daily-report.ts` — Line 213: CPA threshold in `formatMetaStats()`
3. This doc — Alert thresholds table

### When Adding New Metrics
To add a new metric (e.g., cost per landing page view):
1. Add field to Meta API `fields` parameter in `fetchMetaCampaignStats()`
2. Extract value in `formatMetaStats()` or Python `format_report()`
3. Add to HTML or bash output section
4. Update this doc

## API Documentation

- **Meta Marketing API:** https://developers.facebook.com/docs/marketing-api/insights
- **Campaign insights fields:** https://developers.facebook.com/docs/marketing-api/insights/parameters/v21.0
- **Action types:** https://developers.facebook.com/docs/marketing-api/insights/action-breakdowns

## Troubleshooting

**Issue:** "No spend in last 24 hours" alert
- **Check:** Campaign status in Ads Manager (paused, learning phase, or out of budget)
- **Fix:** Resume campaign or increase budget if needed

**Issue:** "CPA > $20" alert
- **Check:** Landing page conversion rate, ad creative performance, audience targeting
- **Fix:** Pause underperforming ad sets, test new creative, refine audience

**Issue:** API error in daily report
- **Check:** Access token expiration (tokens typically expire after 60 days)
- **Fix:** Generate new access token in Meta Business Manager and update `~/.claude/meta-config.json`

**Issue:** Unicode error in bash output (Windows)
- **Root cause:** Windows terminal (cp1252) can't render emoji characters
- **Fix:** Already fixed — replaced emojis with ASCII `***` in alert output

## Related Issues

- **UNC-380:** Set up Meta campaign daily monitoring dashboard (this issue)
- **UNC-379:** Meta campaign is active (parent issue, campaign launch)
- **Goal UNC:** Lets sell 30 produce boxes per week (company goal)

## Change Log

- **2026-04-18:** Initial setup by RevOps agent
  - Created Python stats fetcher with 24h and 7d metrics
  - Integrated into bash daily report script
  - Integrated into Trigger.dev scheduled task
  - Added alert logic for no spend, high CPA, campaign status
  - Fixed Unicode emoji issue for Windows terminal compatibility
