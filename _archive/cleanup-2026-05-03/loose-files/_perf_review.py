import json, os, urllib.request, urllib.parse, base64
from datetime import datetime, timezone, timedelta
from collections import Counter

now = datetime.now(timezone.utc)

def safe_get(url, headers=None, body=None, method="GET"):
    req = urllib.request.Request(url, data=body, method=method)
    for k,v in (headers or {}).items(): req.add_header(k,v)
    try:
        return json.loads(urllib.request.urlopen(req, timeout=30).read())
    except urllib.error.HTTPError as e:
        return {"_error": f"{e.code} {e.read().decode()[:200]}"}
    except Exception as e:
        return {"_error": str(e)[:200]}

# ============ GA4 ============
print("="*72); print("GA4 - last 7 days"); print("="*72)
GA_OAUTH = json.load(open(os.path.expanduser('~/.claude/ga-oauth-token.json')))
GA_CRED = json.load(open(os.path.expanduser('~/.claude/ga-oauth-credentials.json')))
GA_CFG = json.load(open(os.path.expanduser('~/.claude/ga-config.json')))
PROP = GA_CFG.get('property_id') or GA_CFG.get('propertyId') or ''
cred = GA_CRED.get('installed') or GA_CRED.get('web') or GA_CRED
data = urllib.parse.urlencode({
    'client_id': cred['client_id'], 'client_secret': cred['client_secret'],
    'refresh_token': GA_OAUTH['refresh_token'], 'grant_type': 'refresh_token',
}).encode()
tok_resp = safe_get('https://oauth2.googleapis.com/token', body=data, method='POST',
                    headers={'Content-Type':'application/x-www-form-urlencoded'})
tok = tok_resp.get('access_token')
if not tok:
    print("  GA OAuth failed:", tok_resp)
else:
    def gq(report):
        return safe_get(
            f'https://analyticsdata.googleapis.com/v1beta/properties/{PROP}:runReport',
            headers={'Authorization': f'Bearer {tok}', 'Content-Type':'application/json'},
            body=json.dumps(report).encode(), method='POST')

    r = gq({"dateRanges":[{"startDate":"7daysAgo","endDate":"today"}],
            "metrics":[{"name":"sessions"},{"name":"totalUsers"},{"name":"newUsers"},
                       {"name":"engagedSessions"},{"name":"averageSessionDuration"},
                       {"name":"bounceRate"},{"name":"screenPageViews"}]})
    if r.get('rows'):
        v = [m['value'] for m in r['rows'][0]['metricValues']]
        print(f"  sessions={int(v[0])} users={int(v[1])} new={int(v[2])} engaged={int(v[3])}")
        print(f"  avg_dur={float(v[4]):.0f}s bounce={float(v[5])*100:.1f}% pageviews={int(v[6])}")

    print("\n  traffic sources:")
    r = gq({"dateRanges":[{"startDate":"7daysAgo","endDate":"today"}],
            "dimensions":[{"name":"sessionDefaultChannelGroup"},{"name":"sessionSource"}],
            "metrics":[{"name":"sessions"},{"name":"bounceRate"}],
            "orderBys":[{"metric":{"metricName":"sessions"},"desc":True}],"limit":10})
    for row in (r.get('rows') or []):
        d = row['dimensionValues']; m = row['metricValues']
        print(f"    {d[0]['value']:18s} | {d[1]['value']:25s} | sess={m[0]['value']:>5s} | bounce={float(m[1]['value'])*100:.0f}%")

    print("\n  top landing pages:")
    r = gq({"dateRanges":[{"startDate":"7daysAgo","endDate":"today"}],
            "dimensions":[{"name":"landingPage"}],
            "metrics":[{"name":"sessions"},{"name":"bounceRate"},{"name":"engagedSessions"}],
            "orderBys":[{"metric":{"metricName":"sessions"},"desc":True}],"limit":12})
    for row in (r.get('rows') or []):
        path = row['dimensionValues'][0]['value'][:48]; m = row['metricValues']
        s=int(m[0]['value']); br=float(m[1]['value'])*100; eng=int(m[2]['value'])
        engr = (eng/s*100) if s else 0
        print(f"    {path:48s} | sess={s:>4d} | bounce={br:>4.0f}% | engagement={engr:>4.0f}%")

    print("\n  conversion events:")
    r = gq({"dateRanges":[{"startDate":"7daysAgo","endDate":"today"}],
            "dimensions":[{"name":"eventName"}],"metrics":[{"name":"eventCount"}],
            "dimensionFilter":{"filter":{"fieldName":"eventName","inListFilter":{
                "values":["purchase","add_to_cart","begin_checkout","generate_lead","view_item","page_view"]}}},
            "orderBys":[{"metric":{"metricName":"eventCount"},"desc":True}]})
    for row in (r.get('rows') or []):
        print(f"    {row['dimensionValues'][0]['value']:20s} | {row['metricValues'][0]['value']}")

# ============ STRIPE ============
print(); print("="*72); print("Stripe - lifetime + windows"); print("="*72)
SK = json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))['api_key']
auth = 'Basic '+base64.b64encode(f'{SK}:'.encode()).decode()
def sget(p): return safe_get(f'https://api.stripe.com/v1/{p}', headers={'Authorization': auth})

cutoff7 = int((now-timedelta(days=7)).timestamp())
cutoff30 = int((now-timedelta(days=30)).timestamp())

charges=[]; start=None
for _ in range(10):
    q='charges?limit=100' + (f'&starting_after={start}' if start else '')
    d=sget(q)
    if '_error' in d: print('  Stripe error:', d['_error']); break
    charges.extend(d.get('data',[]))
    if not d.get('has_more') or not d.get('data'): break
    start=d['data'][-1]['id']

succ=[c for c in charges if c.get('paid') and c.get('status')=='succeeded']
def stat(label, lst):
    n=len(lst); rev=sum(c['amount'] for c in lst)/100
    aov = (rev/n) if n else 0
    print(f"  {label}: orders={n} revenue=${rev:.2f} AOV=${aov:.2f}")
last7=[c for c in succ if c['created']>=cutoff7]
last30=[c for c in succ if c['created']>=cutoff30]
stat("last 7d ", last7); stat("last 30d", last30); stat("lifetime", succ)
subs = sget('subscriptions?status=active&limit=100')
print(f"  active subscriptions: {len(subs.get('data',[]))}")

# ============ META ADS ============
print(); print("="*72); print("Meta Ads - last 7 days + lifetime per campaign"); print("="*72)
MT=json.load(open(os.path.expanduser('~/.claude/meta-config.json')))['access_token']
ACCT="act_814877604473301"
ins7 = safe_get(f"https://graph.facebook.com/v21.0/{ACCT}/insights?fields=spend,impressions,clicks,inline_link_clicks,actions,cpc,ctr&date_preset=last_7d&access_token={MT}")
if ins7.get('data'):
    a=ins7['data'][0]
    print(f"  spend=${a.get('spend','0')} | imps={a.get('impressions','0')} | link_clicks={a.get('inline_link_clicks','0')} | CTR={a.get('ctr','0')}% | CPC=${a.get('cpc','0')}")
    actions = {x['action_type']:int(float(x['value'])) for x in a.get('actions',[])}
    for k in ['landing_page_view','add_to_cart','offsite_conversion.fb_pixel_add_to_cart','purchase','offsite_conversion.fb_pixel_purchase','initiate_checkout']:
        if k in actions: print(f"  {k}: {actions[k]}")
    spend7 = float(a.get('spend','0'))
else:
    spend7=0

print("\n  per-campaign lifetime:")
camps=safe_get(f"https://graph.facebook.com/v21.0/{ACCT}/campaigns?fields=id,name,effective_status&limit=20&access_token={MT}").get('data',[])
for c in camps:
    ins=safe_get(f"https://graph.facebook.com/v21.0/{c['id']}/insights?fields=spend,actions&date_preset=maximum&access_token={MT}").get('data',[])
    if not ins: continue
    a=ins[0]; actions={x['action_type']:int(float(x['value'])) for x in a.get('actions',[])}
    atc=actions.get('add_to_cart',0); ic=actions.get('initiate_checkout',0)
    purchase=actions.get('purchase',0)+actions.get('offsite_conversion.fb_pixel_purchase',0)
    print(f"    [{c['effective_status']:12s}] ${float(a['spend']):>7.2f} | IC={ic:>3d} | ATC={atc:>3d} | Buy={purchase} | {c['name']}")

# ============ MAILCHIMP ============
print(); print("="*72); print("Mailchimp + Resend"); print("="*72)
MC=json.load(open(os.path.expanduser('~/.claude/mailchimp-config.json')))['api_key']
mc=safe_get('https://us19.api.mailchimp.com/3.0/lists/2645503d11',
            headers={'Authorization':'Basic '+base64.b64encode(f'a:{MC}'.encode()).decode()})
print(f"  Mailchimp audience: {(mc.get('stats') or {}).get('member_count',0)} members")

RS=json.load(open(os.path.expanduser('~/.claude/resend-config.json')))['api_key']
em=safe_get('https://api.resend.com/emails?limit=100', headers={'Authorization':f'Bearer {RS}'})
emails=em.get('data',[])
last7e=[e for e in emails if datetime.fromisoformat(e['created_at'].replace('Z','+00:00'))>=now-timedelta(days=7)]
print(f"  Resend transactional last 7d: {len(last7e)} (of last 100 returned)")
tags=Counter()
for e in last7e:
    for t in (e.get('tags') or []):
        if t.get('name')=='type':
            tags[t.get('value','?')]+=1
for k,v in tags.most_common(): print(f"    {k}: {v}")

# ============ MICROSOFT CLARITY ============
print(); print("="*72); print("Microsoft Clarity - last 3 days (rate-limited, careful)"); print("="*72)
CL=json.load(open(os.path.expanduser('~/.claude/clarity-config.json')))
# Clarity export-data API: GET /project-live-insights
# Auth: Bearer token. Query params: numOfDays (1-3), dimension1, dimension2, dimension3
url=f"{CL['base_url']}/project-live-insights?numOfDays=3"
r=safe_get(url, headers={'Authorization': f"Bearer {CL['api_token']}"})
if '_error' in r:
    print(f"  Clarity error: {r['_error']}")
else:
    # Output is a list of metric blocks
    for block in r if isinstance(r,list) else [r]:
        metric=block.get('metricName','?')
        info=block.get('information',[])
        print(f"\n  {metric}:")
        for row in info[:15]:
            # rows look like {dimension1:..., metric: ...}
            keys=[k for k in row if k not in ('totalSessionCount','totalUsersCount','totalEventsCount')]
            vals=[(k,row[k]) for k in keys[:2]]
            mk=[k for k in row if 'Count' in k]
            mv=[(k,row[k]) for k in mk[:3]]
            print(f"    {vals} | {mv}")
print()
print("done.")
