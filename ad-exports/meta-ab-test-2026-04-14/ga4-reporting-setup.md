# GA4 Reporting Dashboard for Meta A/B Test

**Campaign:** Produce Box A/B Test (2026-04-14 to 2026-04-20)  
**Purpose:** Track per-variant performance across 15 ad variants

---

## Custom Report Configuration

### Report Name
`Meta A/B Test — Produce Box (Apr 2026)`

### Date Range
2026-04-14 to 2026-04-20 (7 days)

### Dimensions
1. **Campaign Source** (`utm_source`) = `meta`
2. **Campaign Medium** (`utm_medium`) = `paid_social`
3. **Campaign Name** (`utm_campaign`) = `produce_box_ab_test`
4. **Campaign Content** (`utm_content`) — This breaks down by variant

### Metrics
1. **Sessions** — Total visits from ads
2. **Users** — Unique visitors
3. **Engaged Sessions** — Sessions with >10 sec engagement
4. **Engagement Rate** — % of sessions that were engaged
5. **Conversions** — `begin_checkout` or `purchase` events
6. **Conversion Rate** — Conversions / Sessions
7. **Average Engagement Time**
8. **Bounce Rate**

### Segments
Create segment: `Meta A/B Test Traffic`
- Filter: `utm_campaign = produce_box_ab_test`

---

## Expected UTM Content Values (15 variants)

### Instagram Post (1080x1080)
- `instagram_direct_offer`
- `instagram_curiosity`
- `instagram_social_proof`
- `instagram_scarcity`
- `instagram_community`

### Facebook Ad (1200x628)
- `facebook_direct_offer`
- `facebook_curiosity`
- `facebook_social_proof`
- `facebook_scarcity`
- `facebook_community`

### Story/Reel (1080x1920)
- `story_direct_offer`
- `story_curiosity`
- `story_social_proof`
- `story_scarcity`
- `story_community`

---

## Alert Rules (Manual Monitoring)

RevOps will check daily at 10am CST and alert CRO if:

### 48-Hour Check (2026-04-16)
- **Low CTR:** Any variant with <50 sessions AND <0.5% conversion rate → Flag for pause
- **High CPA:** Cross-reference with Meta Ads Manager spend data — if any variant >$20 CPA → Flag for pause

### 7-Day Final Report (2026-04-21)
Compare all variants:
1. **Conversion Rate** (primary metric)
2. **Cost Per Acquisition** (from Meta data)
3. **Engagement Rate** (secondary quality signal)

**Winner criteria:**
- Highest conversion rate
- CPA <$15
- At least 5 conversions (statistical significance)

---

## Daily Report Format

```
DAILY META A/B TEST REPORT — [Date]

Campaign Status: ACTIVE
Days Elapsed: X / 7
Total Spend: $XXX / $350

TOP PERFORMERS (by conversion rate):
1. [variant]: X sessions, Y conversions (Z% conversion rate)
2. [variant]: X sessions, Y conversions (Z% conversion rate)
3. [variant]: X sessions, Y conversions (Z% conversion rate)

UNDERPERFORMERS (flagged for review):
- [variant]: <0.5% CTR or >$20 CPA → RECOMMEND PAUSE

NEXT ACTIONS:
- [Action item 1]
- [Action item 2]
```

---

## Meta Ads Manager Data Pull

Daily, pull from Meta Ads Manager API:

```python
# Per-variant metrics from Meta
- Impressions
- Clicks
- CTR
- Spend
- CPM (cost per 1000 impressions)
- CPC (cost per click)
```

Cross-reference with GA4 conversion data to calculate:
- **CPA (Cost Per Acquisition)** = Spend / Conversions

---

## Python Script for Daily Report

Location: `~/Desktop/business/scripts/meta-ab-test-report.py`

Script will:
1. Pull GA4 data via Analytics Data API
2. Pull Meta Ads Manager data via Graph API
3. Merge by `utm_content` to variant mapping
4. Calculate CPA, conversion rate, CTR
5. Flag underperformers
6. Generate daily report markdown
7. Post to Paperclip task or email to CRO

---

## GA4 Setup Steps

1. **Create Custom Report**
   - Go to GA4 → Reports → Library → Create new report
   - Add dimensions: Campaign source, medium, name, content
   - Add metrics: Sessions, Users, Conversions, Engagement rate
   - Save as "Meta A/B Test — Apr 2026"

2. **Create Conversion Event (if not already)**
   - Go to GA4 → Configure → Events
   - Mark `purchase` as conversion event
   - Verify `begin_checkout` is also marked as conversion

3. **Verify Pixel Tracking**
   - Use Meta Pixel Helper Chrome extension
   - Visit unclemays.com and trigger checkout flow
   - Confirm `PageView` and `Purchase` events fire correctly

---

## Post-Campaign Analysis (Day 8)

On 2026-04-21, RevOps will deliver final report with:

1. **Winner Identification**
   - Format: [instagram/facebook/story]
   - Hook: [direct_offer/curiosity/social_proof/scarcity/community]
   - Performance: X% conversion rate, $Y CPA

2. **Scale Recommendation**
   - IF winner meets criteria (CPA <$15, CTR >2.5%, ≥5 conversions)
   - THEN recommend scaling to $50/day on single winning variant
   - ELSE recommend second test round with copy variations

3. **Learnings for Advertising Creative**
   - Which hook performed best and why
   - Which format had highest engagement
   - Audience insights from Meta reporting

---

## Reference

- **GA4 Property ID:** (from `~/.claude/ga-config.json`)
- **Meta Ad Account:** act_814877604473301
- **Campaign Period:** 2026-04-14 to 2026-04-20 (7 days)
- **Total Budget:** $350 ($50/day)

