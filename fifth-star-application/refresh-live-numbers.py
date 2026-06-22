#!/usr/bin/env python3
"""Pull interview-relevant live numbers for the Fifth Star COO final round.
Stripe (real-customer charges, founder/test filtered), active subs, GA4 funnel, catalog SKUs."""
import json, time, base64, urllib.request, urllib.parse
from datetime import datetime, timezone

def load(p):
    with open(p) as f:
        return json.load(f)

stripe = load('c:/Users/Anthony/.claude/stripe-config.json')
ga = load('c:/Users/Anthony/.claude/ga-config.json')
air = load('c:/Users/Anthony/.claude/airtable-config.json')

SK = stripe['api_key']
SURL = stripe['base_url']

# Internal/founder Stripe customers (excluded from all real-customer metrics)
INTERNAL_CUS = {
    'cus_ULANE7v2APnG42', 'cus_UN9KFkZFAKGnkF',
    'cus_UOeacOxSfcelAu', 'cus_UN8fJjvyuLyWTy',
}
INTERNAL_EMAIL_SUFFIX = '@unclemays.com'
INTERNAL_EMAILS = {'anthonypivy@gmail.com'}

LAUNCH = int(datetime(2026, 4, 30, tzinfo=timezone.utc).timestamp())
NOW = int(time.time())
D7 = NOW - 7 * 86400
D30 = NOW - 30 * 86400

def stripe_get(path, params=None):
    url = SURL + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    tok = base64.b64encode(f'{SK}:'.encode()).decode()
    req.add_header('Authorization', f'Basic {tok}')
    return json.loads(urllib.request.urlopen(req, timeout=30).read())

def is_internal(ch):
    if (ch.get('metadata') or {}).get('test_transaction') == 'true':
        return True
    if ch.get('customer') in INTERNAL_CUS:
        return True
    em = (ch.get('billing_details') or {}).get('email') or ch.get('receipt_email') or ''
    em = em.lower()
    if em.endswith(INTERNAL_EMAIL_SUFFIX) or em in INTERNAL_EMAILS:
        return True
    return False

# ---- Pull all charges since launch (paginated) ----
charges = []
params = {'limit': 100, 'created[gte]': LAUNCH}
while True:
    page = stripe_get('/charges', params)
    if 'error' in page:
        print('STRIPE ERROR:', page['error'].get('message'))
        break
    charges.extend(page['data'])
    if page.get('has_more') and page['data']:
        params = {'limit': 100, 'created[gte]': LAUNCH, 'starting_after': page['data'][-1]['id']}
    else:
        break

def summarize(rows, label):
    succ = [c for c in rows if c['status'] == 'succeeded']
    n = len(succ)
    gross = sum(c['amount'] for c in succ) / 100
    refunded = sum(c.get('amount_refunded', 0) for c in succ) / 100
    net = gross - refunded
    aov = gross / n if n else 0
    print(f'  {label:<28} orders={n:<4} gross=${gross:,.2f}  net=${net:,.2f}  AOV=${aov:,.2f}')

real = [c for c in charges if not is_internal(c)]
internal = [c for c in charges if is_internal(c)]
real_d30 = [c for c in real if c['created'] >= D30]
real_d7 = [c for c in real if c['created'] >= D7]

print('=' * 72)
print('STRIPE  (post-launch 2026-04-30 -> today  | real customers only)')
print('=' * 72)
summarize(real, 'All-time post-launch')
summarize(real_d30, 'Last 30 days')
summarize(real_d7, 'Last 7 days')
print(f'  [filtered out {len([c for c in internal if c["status"]=="succeeded"])} founder/test succeeded charges]')

# unique real paying customers
def cust_key(c):
    return c.get('customer') or ((c.get('billing_details') or {}).get('email') or c['id'])
uniq = {cust_key(c) for c in real if c['status'] == 'succeeded'}
print(f'  Unique real paying customers (post-launch): {len(uniq)}')

# repeat customers
from collections import Counter
cc = Counter(cust_key(c) for c in real if c['status'] == 'succeeded')
repeat = {k: v for k, v in cc.items() if v >= 2}
print(f'  Repeat customers (2+ paid orders): {len(repeat)}  -> orders each: {sorted(repeat.values(), reverse=True)}')

# ---- Subscriptions ----
subs = stripe_get('/subscriptions', {'status': 'active', 'limit': 100})
active_subs = subs.get('data', []) if 'error' not in subs else []
print(f'\n  Active subscriptions: {len(active_subs)}')
for s in active_subs:
    amt = sum(i['price']['unit_amount'] for i in s['items']['data']) / 100
    interval = s['items']['data'][0]['price']['recurring']['interval']
    print(f'    - {s["id"]}  ${amt:.2f}/{interval}  cust={s.get("customer")}')

# ---- Balance ----
bal = stripe_get('/balance')
if 'error' not in bal:
    avail = sum(b['amount'] for b in bal.get('available', [])) / 100
    pend = sum(b['amount'] for b in bal.get('pending', [])) / 100
    print(f'\n  Stripe balance: available=${avail:,.2f}  pending=${pend:,.2f}')

# ================= GA4 =================
print('\n' + '=' * 72)
print('GA4  (sessions + funnel)')
print('=' * 72)
try:
    tk = load(ga['oauth_token_path'])
    data = urllib.parse.urlencode({
        'client_id': tk['client_id'], 'client_secret': tk['client_secret'],
        'refresh_token': tk['refresh_token'], 'grant_type': 'refresh_token',
    }).encode()
    req = urllib.request.Request(tk['token_uri'], data=data)
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    GA_TOKEN = json.loads(urllib.request.urlopen(req, timeout=30).read())['access_token']
    GA_API = f"https://analyticsdata.googleapis.com/v1beta/{ga['property_id']}:runReport"

    def ga_report(body):
        req = urllib.request.Request(GA_API, data=json.dumps(body).encode())
        req.add_header('Authorization', f'Bearer {GA_TOKEN}')
        req.add_header('Content-Type', 'application/json')
        return json.loads(urllib.request.urlopen(req, timeout=30).read())

    for label, start in [('Last 7 days', '7daysAgo'), ('Last 30 days', '30daysAgo')]:
        r = ga_report({'dateRanges': [{'startDate': start, 'endDate': 'today'}],
                       'metrics': [{'name': 'sessions'}, {'name': 'totalUsers'}, {'name': 'screenPageViews'}]})
        if r.get('rows'):
            v = r['rows'][0]['metricValues']
            print(f'  {label:<14} sessions={int(v[0]["value"]):,}  users={int(v[1]["value"]):,}  pageviews={int(v[2]["value"]):,}')

    # funnel events last 7d + 30d
    for label, start in [('Last 7 days', '7daysAgo'), ('Last 30 days', '30daysAgo')]:
        r = ga_report({
            'dateRanges': [{'startDate': start, 'endDate': 'today'}],
            'dimensions': [{'name': 'eventName'}],
            'metrics': [{'name': 'eventCount'}],
            'dimensionFilter': {'orGroup': {'expressions': [
                {'filter': {'fieldName': 'eventName', 'stringFilter': {'value': v}}}
                for v in ['add_to_cart', 'begin_checkout', 'purchase', 'view_item', 'generate_lead']
            ]}},
        })
        ev = {row['dimensionValues'][0]['value']: int(row['metricValues'][0]['value']) for row in r.get('rows', [])}
        print(f'  Funnel {label}: ' + '  '.join(f'{k}={v}' for k, v in ev.items()) if ev else f'  Funnel {label}: (none)')

    # traffic sources last 30d
    r = ga_report({'dateRanges': [{'startDate': '30daysAgo', 'endDate': 'today'}],
                   'dimensions': [{'name': 'sessionDefaultChannelGroup'}],
                   'metrics': [{'name': 'sessions'}],
                   'orderBys': [{'metric': {'metricName': 'sessions'}, 'desc': True}], 'limit': 8})
    print('  Traffic mix (30d):', '  '.join(
        f'{row["dimensionValues"][0]["value"]}={int(row["metricValues"][0]["value"])}' for row in r.get('rows', [])))
except Exception as e:
    print('  GA4 ERROR:', str(e)[:200])

# ================= Airtable catalog =================
print('\n' + '=' * 72)
print('AIRTABLE  (live customer catalog SKUs)')
print('=' * 72)
try:
    base = air['bases']['contacts']  # appm6F6H9obydzAM2 holds the live Catalog table
    url = f"{air['base_url']}/{base}/Catalog?pageSize=100"
    recs, offset = [], None
    while True:
        u = url + (f'&offset={offset}' if offset else '')
        req = urllib.request.Request(u)
        req.add_header('Authorization', f"Bearer {air['api_key']}")
        d = json.loads(urllib.request.urlopen(req, timeout=30).read())
        recs.extend(d.get('records', []))
        offset = d.get('offset')
        if not offset:
            break
    total = len(recs)
    # try to detect an active/visible flag
    def active(r):
        f = r['fields']
        for key in ['Active', 'Visible', 'Published', 'In Stock', 'Status']:
            if key in f:
                val = f[key]
                if isinstance(val, bool):
                    return val
                if isinstance(val, str):
                    return val.lower() in ('active', 'live', 'published', 'in stock', 'yes', 'true')
        return None
    flags = [active(r) for r in recs]
    known = [x for x in flags if x is not None]
    if known:
        print(f'  Catalog records: {total} total  |  active-flagged: {sum(1 for x in known if x)}')
    else:
        print(f'  Catalog records: {total} total  (no active/visible flag field detected)')
except Exception as e:
    print('  AIRTABLE ERROR:', str(e)[:200])

print('\nGenerated:', datetime.now().strftime('%Y-%m-%d %H:%M'))
