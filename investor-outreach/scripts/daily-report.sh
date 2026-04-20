#!/bin/bash
# Daily Report Script — Apollo + Stripe + Google Analytics + Mailchimp
# Run via: bash investor-outreach/scripts/daily-report.sh
# Or just tell Claude "daily report"

APOLLO_KEY=$(python3 -c "import json; print(json.load(open('c:/Users/Anthony/.claude/apollo-config.json'))['api_key'])")
APOLLO_URL="https://api.apollo.io/api/v1"

STRIPE_KEY=$(python3 -c "import json; print(json.load(open('c:/Users/Anthony/.claude/stripe-config.json'))['api_key'])")
STRIPE_URL="https://api.stripe.com/v1"

GA_PROPERTY=$(python3 -c "import json; print(json.load(open('c:/Users/Anthony/.claude/ga-config.json'))['property_id'])")
GA_TOKEN_PATH=$(python3 -c "import json; print(json.load(open('c:/Users/Anthony/.claude/ga-config.json'))['oauth_token_path'])")

FIRECRAWL_KEY=$(python3 -c "import json; print(json.load(open('c:/Users/Anthony/.claude/firecrawl-config.json'))['api_key'])" 2>/dev/null)
FIRECRAWL_URL="https://api.firecrawl.dev/v2"

echo "========================================"
echo "  DAILY REPORT - $(date +%Y-%m-%d)"
echo "========================================"

# ——————————————————————————————————————
# SECTION 1: EMAIL ACCOUNT HEALTH (Apollo)
# ——————————————————————————————————————
echo ""
echo "--- EMAIL ACCOUNT HEALTH ---"
curl -s "$APOLLO_URL/email_accounts" -H "X-Api-Key: $APOLLO_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
accounts = data.get('email_accounts', [])
print(f'{'Email':<40} {'Health':>7} {'Deliver':>8} {'Warmup':>10} {'Daily':>6} {'Campaigns':>10}')
print('-' * 85)
for a in accounts:
    email = a['email']
    health = a.get('deliverability_score', {}).get('domain_health_score', 0)
    deliver = a.get('deliverability_score', {}).get('deliverability_score', 0)
    warmup = a.get('mailwarming_status', 'off')
    if a.get('true_warmup_enabled'):
        warmup = f'on ({a.get(\"true_warmup_progress\", 0)}%)'
    daily = a.get('email_daily_threshold', 0)
    campaigns = a.get('active_campaigns_count', 0)
    print(f'{email:<40} {health:>7.1f} {deliver:>8.1f} {warmup:>10} {daily:>6} {campaigns:>10}')
"

# ——————————————————————————————————————
# SECTION 2: CAMPAIGN PERFORMANCE (Apollo)
# ——————————————————————————————————————
echo ""
echo "--- CAMPAIGN PERFORMANCE ---"
curl -s -X POST "$APOLLO_URL/emailer_campaigns/search" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $APOLLO_KEY" \
  -d '{"page": 1, "per_page": 20, "sort_by_key": "campaign_last_activity", "sort_ascending": false}' | python3 -c "
import json, sys
data = json.load(sys.stdin)
campaigns = [c for c in data.get('emailer_campaigns', []) if c.get('active')]
print(f'{'Campaign':<45} {'Active':>6} {'Sent':>5} {'Open':>5} {'Reply':>6} {'Bounce':>7}')
print('-' * 80)
for c in campaigns:
    name = c['name'][:44]
    active = 'Yes' if c['active'] else 'No'
    delivered = c.get('unique_delivered', 0) or 0
    opened = c.get('unique_opened', 0) or 0
    replied = c.get('unique_replied', 0) or 0
    bounced = c.get('unique_bounced', 0) or 0
    print(f'{name:<45} {active:>6} {delivered:>5} {opened:>5} {replied:>6} {bounced:>7}')
"

# ——————————————————————————————————————
# SECTION 2B: TIER 1 CAMPAIGN DETAIL
# ——————————————————————————————————————
TIER1_CAMPAIGN_ID="69d2a0b2c2e0c6000d1608d4"
echo ""
echo "--- TIER 1 CAMPAIGN: THESIS ALIGNED INVESTORS ---"
curl -s "$APOLLO_URL/emailer_campaigns/$TIER1_CAMPAIGN_ID" \
  -H "X-Api-Key: $APOLLO_KEY" \
  -H "User-Agent: curl/8.0" | python3 -c "
import json, sys
data = json.load(sys.stdin)
c = data.get('emailer_campaign', {})
steps = data.get('emailer_steps', [])

print(f'Status: {\"ACTIVE\" if c.get(\"active\") else \"INACTIVE\"}')
print(f'Daily limit: {c.get(\"max_emails_per_day\", \"N/A\")}')
print()

# Contact statuses
statuses = c.get('contact_statuses', {})
active = statuses.get('active', 0)
paused = statuses.get('paused', 0)
finished = statuses.get('finished', 0)
bounced = statuses.get('bounced', 0)
total = active + paused + finished + bounced
print(f'Contacts: {total} total')
print(f'  Active:   {active}')
print(f'  Paused:   {paused}')
print(f'  Finished: {finished} (replied or completed sequence)')
print(f'  Bounced:  {bounced}')
print()

# Overall metrics
delivered = c.get('unique_delivered', 0) or 0
opened = c.get('unique_opened', 0) or 0
replied = c.get('unique_replied', 0) or 0
bounced_ct = c.get('unique_bounced', 0) or 0
open_rate = c.get('open_rate', 0) or 0
reply_rate = c.get('reply_rate', 0) or 0

print(f'Performance:')
print(f'  Delivered: {delivered}  |  Opened: {opened} ({open_rate:.1%})  |  Replied: {replied} ({reply_rate:.1%})  |  Bounced: {bounced_ct}')
print()

# Per-step breakdown
if steps:
    print(f'{\"Step\":<8} {\"Day\":>4} {\"Active\":>7} {\"Paused\":>7} {\"Finished\":>9} {\"Bounced\":>8}')
    print('-' * 50)
    for s in steps:
        pos = s.get('position', '?')
        wait = s.get('wait_time', 0)
        counts = s.get('counts', {})
        print(f'Email {pos:<3} {wait:>4}d {counts.get(\"active\",0):>7} {counts.get(\"paused\",0):>7} {counts.get(\"finished\",0):>9} {counts.get(\"bounced\",0):>8}')
"

# ——————————————————————————————————————
# SECTION 2C: TIER 2 CAMPAIGNS DETAIL
# ——————————————————————————————————————
# Campaign IDs will be populated after create-tier2-campaigns.py --execute
TIER2A_CAMPAIGN_ID="69d7dc2bf18bda002233eb04"  # Tier 2A - Warm Investors (Denise)
TIER2B_CAMPAIGN_ID="69d7dc492a222a0019913520"  # Tier 2B - Warm Investors (Rosalind)
TIER2C_CAMPAIGN_ID="69d7dc68457595000d6b285d"  # Tier 2C - Warm Investors (Invest)
TIER2D_CAMPAIGN_ID="69d7dc86cfcc9800152117b7"  # Tier 2D - Warm Investors (TimJ)

if [ -n "$TIER2A_CAMPAIGN_ID" ]; then
echo ""
echo "--- TIER 2 CAMPAIGNS: WARM INVESTORS ---"

# Aggregate metrics across all 4 campaigns
python3 -c "
import json, sys, urllib.request

api_key = '$APOLLO_KEY'
base_url = '$APOLLO_URL'
campaign_ids = ['$TIER2A_CAMPAIGN_ID', '$TIER2B_CAMPAIGN_ID', '$TIER2C_CAMPAIGN_ID', '$TIER2D_CAMPAIGN_ID']
campaign_names = ['Tier 2A (Denise)', 'Tier 2B (Rosalind)', 'Tier 2C (Invest)', 'Tier 2D (TimJ)']

totals = {'delivered': 0, 'opened': 0, 'replied': 0, 'bounced': 0, 'active': 0, 'total': 0}

print(f\"{'Campaign':<28} {'Total':>6} {'Active':>7} {'Sent':>5} {'Open':>5} {'Reply':>6} {'Bounce':>7}\")
print('-' * 72)

for cid, cname in zip(campaign_ids, campaign_names):
    if not cid:
        continue
    try:
        req = urllib.request.Request(
            f'{base_url}/emailer_campaigns/{cid}',
            headers={'X-Api-Key': api_key, 'User-Agent': 'curl/8.0'}
        )
        resp = urllib.request.urlopen(req, timeout=15)
        data = json.loads(resp.read())
        c = data.get('emailer_campaign', {})

        statuses = c.get('contact_statuses', {})
        active = statuses.get('active', 0)
        finished = statuses.get('finished', 0)
        bounced = statuses.get('bounced', 0)
        total = active + statuses.get('paused', 0) + finished + bounced

        delivered = c.get('unique_delivered', 0) or 0
        opened = c.get('unique_opened', 0) or 0
        replied = c.get('unique_replied', 0) or 0
        bounced_ct = c.get('unique_bounced', 0) or 0

        totals['delivered'] += delivered
        totals['opened'] += opened
        totals['replied'] += replied
        totals['bounced'] += bounced_ct
        totals['active'] += active
        totals['total'] += total

        print(f'{cname:<28} {total:>6} {active:>7} {delivered:>5} {opened:>5} {replied:>6} {bounced_ct:>7}')

        # Bounce rate warning
        if delivered > 0:
            bounce_rate = bounced_ct / delivered
            if bounce_rate > 0.05:
                print(f'  *** KILLSWITCH: {cname} bounce rate {bounce_rate:.1%} exceeds 5%! PAUSE IMMEDIATELY ***')
            elif bounce_rate > 0.03:
                print(f'  ** WARNING: {cname} bounce rate {bounce_rate:.1%} approaching 5% threshold **')
    except Exception as e:
        print(f'{cname:<28} [error: {str(e)[:40]}]')

print('-' * 72)
d = totals['delivered']
o = totals['opened']
r = totals['replied']
b = totals['bounced']
open_pct = f'{o/d:.1%}' if d > 0 else 'N/A'
reply_pct = f'{r/d:.1%}' if d > 0 else 'N/A'
bounce_pct = f'{b/d:.1%}' if d > 0 else 'N/A'
print(f\"{'TIER 2 TOTAL':<28} {totals['total']:>6} {totals['active']:>7} {d:>5} {o:>5} {r:>6} {b:>7}\")
print(f'  Open: {open_pct}  |  Reply: {reply_pct}  |  Bounce: {bounce_pct}')
"
fi

# ——————————————————————————————————————
# SECTION 3: STRIPE — Balance & Recent Transactions
# ——————————————————————————————————————
echo ""
echo "--- STRIPE: BALANCE & TRANSACTIONS ---"
if [ "$STRIPE_KEY" = "REPLACE_WITH_YOUR_STRIPE_RESTRICTED_API_KEY" ]; then
  echo "[Stripe not configured — add API key to ~/.claude/stripe-config.json]"
else
  # Balance
  curl -s "$STRIPE_URL/balance" -u "$STRIPE_KEY:" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'error' in data:
    print(f'Error: {data[\"error\"][\"message\"]}')
    sys.exit(0)
print('Balance:')
for b in data.get('available', []):
    amt = b['amount'] / 100
    print(f'  Available: \${amt:,.2f} {b[\"currency\"].upper()}')
for b in data.get('pending', []):
    amt = b['amount'] / 100
    print(f'  Pending:   \${amt:,.2f} {b[\"currency\"].upper()}')
"

  # Recent charges (last 48 hours)
  # Note: -g disables curl URL globbing so the literal brackets in `created[gte]` are sent verbatim.
  # Without -g, curl swallows `[gte]` as a glob and returns an empty body, which crashes the JSON parser.
  SINCE=$(python3 -c "import time; print(int(time.time()) - 172800)")
  curl -gs "$STRIPE_URL/charges?limit=10&created[gte]=$SINCE" -u "$STRIPE_KEY:" | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
if 'error' in data:
    print(f'Error: {data[\"error\"][\"message\"]}')
    sys.exit(0)
charges = data.get('data', [])
if not charges:
    print('No transactions in the last 48 hours.')
else:
    total = sum(c['amount'] for c in charges if c['status'] == 'succeeded') / 100
    print(f'Last 48h revenue: \${total:,.2f} ({len(charges)} transaction(s))')
    print()
    print(f'{\"Date\":<20} {\"Amount\":>10} {\"Status\":<12} {\"Description\"}')
    print('-' * 70)
    for c in charges:
        dt = datetime.fromtimestamp(c['created']).strftime('%Y-%m-%d %H:%M')
        amt = c['amount'] / 100
        status = c['status']
        desc = (c.get('description') or c.get('statement_descriptor') or 'N/A')[:30]
        print(f'{dt:<20} \${amt:>9,.2f} {status:<12} {desc}')
"

  # Recent payouts
  curl -s "$STRIPE_URL/payouts?limit=3" -u "$STRIPE_KEY:" | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
if 'error' in data:
    sys.exit(0)
payouts = data.get('data', [])
if payouts:
    print()
    print('Recent Payouts:')
    for p in payouts:
        amt = p['amount'] / 100
        status = p['status']
        arrival = datetime.fromtimestamp(p['arrival_date']).strftime('%Y-%m-%d')
        print(f'  \${amt:,.2f} — {status} (arrival: {arrival})')
"
fi

# ——————————————————————————————————————
# SECTION 4: GOOGLE ANALYTICS — Full Funnel
# ——————————————————————————————————————
echo ""
echo "--- GOOGLE ANALYTICS: SITE TRAFFIC ---"
if [ "$GA_PROPERTY" = "REPLACE_WITH_GA4_PROPERTY_ID" ]; then
  echo "[Google Analytics not configured — add property ID to ~/.claude/ga-config.json]"
else
  # Get OAuth access token via refresh token
  GA_TOKEN=$(python3 -c "
import json, urllib.request, urllib.parse

token_path = '$GA_TOKEN_PATH'
try:
    with open(token_path) as f:
        tokens = json.load(f)
except FileNotFoundError:
    print('ERROR_NO_TOKEN')
    exit(0)

# Refresh the access token
data = urllib.parse.urlencode({
    'client_id': tokens['client_id'],
    'client_secret': tokens['client_secret'],
    'refresh_token': tokens['refresh_token'],
    'grant_type': 'refresh_token',
}).encode()
req = urllib.request.Request(tokens['token_uri'], data=data)
req.add_header('Content-Type', 'application/x-www-form-urlencoded')
resp = urllib.request.urlopen(req)
token = json.loads(resp.read())['access_token']
print(token)
" 2>/dev/null)

  if [ "$GA_TOKEN" = "ERROR_NO_TOKEN" ]; then
    echo "[GA OAuth token not found at $GA_TOKEN_PATH — run: python ~/.claude/ga-oauth-setup.py]"
  elif [ -z "$GA_TOKEN" ]; then
    echo "[Failed to authenticate with Google Analytics — re-run: python ~/.claude/ga-oauth-setup.py]"
  else
    GA_API="https://analyticsdata.googleapis.com/v1beta/$GA_PROPERTY:runReport"

    # Traffic Overview (last 24 hours)
    curl -s -X POST "$GA_API" \
      -H "Authorization: Bearer $GA_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "dateRanges": [{"startDate": "yesterday", "endDate": "today"}],
        "metrics": [
          {"name": "sessions"},
          {"name": "totalUsers"},
          {"name": "screenPageViews"}
        ]
      }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'error' in data:
    print(f'Error: {data[\"error\"][\"message\"]}')
    sys.exit(0)
rows = data.get('rows', [])
if rows:
    vals = rows[0]['metricValues']
    print(f'Traffic (last 24h):')
    print(f'  Sessions:     {int(vals[0][\"value\"]):,}')
    print(f'  Unique Users: {int(vals[1][\"value\"]):,}')
    print(f'  Page Views:   {int(vals[2][\"value\"]):,}')
else:
    print('No traffic data for the last 24 hours.')
"

    # Top Pages
    echo ""
    curl -s -X POST "$GA_API" \
      -H "Authorization: Bearer $GA_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "dateRanges": [{"startDate": "yesterday", "endDate": "today"}],
        "dimensions": [{"name": "pagePath"}],
        "metrics": [{"name": "screenPageViews"}],
        "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": true}],
        "limit": 10
      }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
rows = data.get('rows', [])
if rows:
    print('Top Pages:')
    print(f'{\"Page\":<50} {\"Views\":>6}')
    print('-' * 58)
    for r in rows:
        page = r['dimensionValues'][0]['value'][:49]
        views = int(r['metricValues'][0]['value'])
        print(f'{page:<50} {views:>6}')
"

    # Traffic Sources
    echo ""
    curl -s -X POST "$GA_API" \
      -H "Authorization: Bearer $GA_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "dateRanges": [{"startDate": "yesterday", "endDate": "today"}],
        "dimensions": [{"name": "sessionSource"}],
        "metrics": [{"name": "sessions"}],
        "orderBys": [{"metric": {"metricName": "sessions"}, "desc": true}],
        "limit": 10
      }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
rows = data.get('rows', [])
if rows:
    print('Traffic Sources:')
    print(f'{\"Source\":<40} {\"Sessions\":>8}')
    print('-' * 50)
    for r in rows:
        source = r['dimensionValues'][0]['value'][:39]
        sessions = int(r['metricValues'][0]['value'])
        print(f'{source:<40} {sessions:>8}')
"

    # Conversion Events
    echo ""
    curl -s -X POST "$GA_API" \
      -H "Authorization: Bearer $GA_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "dateRanges": [{"startDate": "yesterday", "endDate": "today"}],
        "dimensions": [{"name": "eventName"}],
        "metrics": [{"name": "eventCount"}],
        "dimensionFilter": {
          "orGroup": {
            "expressions": [
              {"filter": {"fieldName": "eventName", "stringFilter": {"matchType": "CONTAINS", "value": "purchase"}}},
              {"filter": {"fieldName": "eventName", "stringFilter": {"matchType": "CONTAINS", "value": "sign_up"}}},
              {"filter": {"fieldName": "eventName", "stringFilter": {"matchType": "CONTAINS", "value": "generate_lead"}}},
              {"filter": {"fieldName": "eventName", "stringFilter": {"matchType": "CONTAINS", "value": "begin_checkout"}}}
            ]
          }
        },
        "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": true}]
      }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
rows = data.get('rows', [])
if rows:
    print('Conversions:')
    print(f'{\"Event\":<40} {\"Count\":>6}')
    print('-' * 48)
    for r in rows:
        event = r['dimensionValues'][0]['value']
        count = int(r['metricValues'][0]['value'])
        print(f'{event:<40} {count:>6}')
else:
    print('No conversion events in the last 24 hours.')
"
  fi
fi

# ——————————————————————————————————————
# SECTION 5: MAILCHIMP — Newsletter Performance
# ——————————————————————————————————————
echo ""
echo "--- MAILCHIMP: NEWSLETTER ---"
MC_KEY=$(python3 -c "import json; print(json.load(open('c:/Users/Anthony/.claude/mailchimp-config.json'))['api_key'])" 2>/dev/null)
if [ -z "$MC_KEY" ]; then
  echo "[Mailchimp not configured — add API key to ~/.claude/mailchimp-config.json]"
else
  MC_DC=$(echo "$MC_KEY" | cut -d'-' -f2)
  MC_URL="https://${MC_DC}.api.mailchimp.com/3.0"

  # List stats
  curl -s "$MC_URL/lists/2645503d11" -u "anystring:$MC_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
stats = data.get('stats', {})
print(f'Audience: {data.get(\"name\", \"N/A\")}')
print(f'  Subscribers:  {stats.get(\"member_count\", 0)}')
print(f'  Unsubscribed: {stats.get(\"unsubscribe_count\", 0)}')
print(f'  Cleaned:      {stats.get(\"cleaned_count\", 0)}')
print(f'  Avg Open Rate:  {stats.get(\"open_rate\", 0):.1f}%')
print(f'  Avg Click Rate: {stats.get(\"click_rate\", 0):.1f}%')
print(f'  Campaigns Sent: {stats.get(\"campaign_count\", 0)}')
"

  # Recent campaigns with reports
  echo ""
  curl -s "$MC_URL/campaigns?count=5&sort_field=send_time&sort_dir=DESC" -u "anystring:$MC_KEY" | python3 -c "
import json, sys, urllib.request, base64

mc_key = '$MC_KEY'
mc_dc = mc_key.split('-')[1]
cred = base64.b64encode(f'anystring:{mc_key}'.encode()).decode()

data = json.load(sys.stdin)
campaigns = [c for c in data.get('campaigns', []) if c['status'] == 'sent']

if not campaigns:
    print('No sent campaigns.')
    sys.exit(0)

print(f'{\"Campaign\":<42} {\"Sent\":>5} {\"Opens\":>6} {\"Clicks\":>7} {\"Unsub\":>6} {\"Open%\":>6}')
print('-' * 75)
for c in campaigns[:5]:
    cid = c['id']
    title = c['settings']['title'][:41]
    try:
        req = urllib.request.Request(
            f'https://{mc_dc}.api.mailchimp.com/3.0/reports/{cid}',
            headers={'Authorization': f'Basic {cred}'}
        )
        r = json.loads(urllib.request.urlopen(req).read())
        sent = r.get('emails_sent', 0)
        opens = r.get('opens', {}).get('unique_opens', 0)
        clicks = r.get('clicks', {}).get('unique_clicks', 0)
        unsubs = r.get('unsubscribed', 0)
        open_pct = f'{(opens/sent*100):.1f}%' if sent > 0 else 'N/A'
        print(f'{title:<42} {sent:>5} {opens:>6} {clicks:>7} {unsubs:>6} {open_pct:>6}')
    except:
        print(f'{title:<42} [report unavailable]')
"
fi

# ——————————————————————————————————————
# SECTION 6: FIRECRAWL — Web Research Credits
# ——————————————————————————————————————
echo ""
echo "--- FIRECRAWL: WEB RESEARCH ---"
if [ -z "$FIRECRAWL_KEY" ]; then
  echo "[Firecrawl not configured — add API key to ~/.claude/firecrawl-config.json]"
else
  # Firecrawl v2 credit endpoint is /team/credit-usage (not /account, which 404s)
  curl -s "$FIRECRAWL_URL/team/credit-usage" \
    -H "Authorization: Bearer $FIRECRAWL_KEY" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if not data.get('success'):
    print(f'Error: {data.get(\"error\", \"Unknown error\")}')
    sys.exit(0)
d = data.get('data', {})
remaining = d.get('remainingCredits', 'N/A')
plan_credits = d.get('planCredits', 'N/A')
used = (plan_credits - remaining) if isinstance(remaining, int) and isinstance(plan_credits, int) else 'N/A'
print(f'Plan credits: {plan_credits}')
print(f'Credits used: {used} / {plan_credits}')
print(f'Remaining:    {remaining}')
if isinstance(remaining, int) and remaining < 50:
    print('WARNING: Low Firecrawl credits — consider upgrading plan')
" 2>/dev/null || echo "  [Could not reach Firecrawl API — check connection]"
fi

# ——————————————————————————————————————
# ACTION ITEMS
# ——————————————————————————————————————
echo ""
echo "--- ACTION ITEMS ---"
echo "1. Review any Tier 1 campaign replies and respond personally from anthony@unclemays.com"
echo "2. Check for bounces — remove bounced contacts from active sequence"
echo "3. Monitor open rate — if below 30% after 20+ sends, review subject lines"
echo "4. Attach teaser PDF to Email 1 if not already done"
echo "5. Use 'research [fund name]' to enrich any new high-priority contacts before drafting personalized outreach"
echo "========================================"
