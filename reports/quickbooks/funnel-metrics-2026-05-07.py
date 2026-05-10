import json,sys,urllib.request,urllib.parse,datetime,base64,os
sys.stdout.reconfigure(encoding='utf-8',errors='replace')

now=datetime.datetime.now(datetime.UTC)
ts_30=int((now-datetime.timedelta(days=30)).timestamp())
ts_7=int((now-datetime.timedelta(days=7)).timestamp())
ts_3=int((now-datetime.timedelta(days=3)).timestamp())

key=os.environ.get('STRIPE_SECRET_KEY') or json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))['api_key']
auth='Basic '+base64.b64encode(f'{key}:'.encode()).decode()
suppress={'anthony@unclemays.com','anthonypivy@gmail.com','info@unclemays.com'}

all_ch=[]; sk=None
for _ in range(20):
  url='https://api.stripe.com/v1/charges?limit=100'
  if sk: url+=f'&starting_after={sk}'
  d=json.loads(urllib.request.urlopen(urllib.request.Request(url,headers={'Authorization':auth,'User-Agent':'curl/8.0'})).read())
  all_ch+=d['data']
  if not d['has_more']: break
  sk=d['data'][-1]['id']

def email_of(c): return (c.get('billing_details',{}).get('email') or c.get('receipt_email') or c.get('metadata',{}).get('customer_email') or '').lower()

real=[c for c in all_ch if c.get('status')=='succeeded' and c.get('paid') and email_of(c) not in suppress]

emails_seen={}
for c in sorted(real,key=lambda x:x['created']):
  e=email_of(c)
  if e and e not in emails_seen:
    emails_seen[e]=c['created']

def stats(charges):
  amt=sum(c['amount']-(c.get('amount_refunded') or 0) for c in charges)/100
  emails={email_of(c) for c in charges}; emails.discard('')
  new=sum(1 for c in charges if email_of(c) and emails_seen.get(email_of(c))==c['created'])
  return len(charges),amt,len(emails),new

S={'Lifetime':stats(real),
   'Last 30 days':stats([c for c in real if c['created']>=ts_30]),
   'Last 7 days':stats([c for c in real if c['created']>=ts_7]),
   'Last 3 days':stats([c for c in real if c['created']>=ts_3])}

mc=json.load(open('C:/Users/Anthony/.claude/meta-config.json',encoding='utf-8-sig'))
def meta(preset):
  url=f"https://graph.facebook.com/v21.0/{mc['ad_account_id']}/insights?date_preset={preset}&fields=spend,impressions,clicks,actions&access_token={mc['access_token']}"
  r=json.loads(urllib.request.urlopen(url).read()).get('data',[{}])[0]
  acts={a['action_type']:int(a['value']) for a in r.get('actions',[])}
  return {'spend':float(r.get('spend',0)),'impressions':int(r.get('impressions',0)),'clicks':int(r.get('clicks',0)),
    'purchases':acts.get('purchase',0) or acts.get('offsite_conversion.fb_pixel_purchase',0),
    'atc':acts.get('add_to_cart',0),'ic':acts.get('initiate_checkout',0),'lpv':acts.get('landing_page_view',0)}
M={'Lifetime':meta('maximum'),'Last 30 days':meta('last_30d'),'Last 7 days':meta('last_7d'),'Last 3 days':meta('last_3d')}

gc=json.load(open('C:/Users/Anthony/.claude/google-ads-config.json',encoding='utf-8-sig'))
data=urllib.parse.urlencode({'client_id':gc['client_id'],'client_secret':gc['client_secret'],'refresh_token':gc['refresh_token'],'grant_type':'refresh_token'}).encode()
gtok=json.loads(urllib.request.urlopen('https://oauth2.googleapis.com/token',data=data).read())['access_token']

def google(start_d,end_d):
  q={'query':f"SELECT metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions FROM customer WHERE segments.date BETWEEN '{start_d}' AND '{end_d}'"}
  r=urllib.request.Request(f"https://googleads.googleapis.com/v22/customers/{gc['customer_id']}/googleAds:search",
    data=json.dumps(q).encode(),headers={'Authorization':f'Bearer {gtok}','developer-token':gc['developer_token'],'Content-Type':'application/json'},method='POST')
  try:
    d=json.loads(urllib.request.urlopen(r).read())
    sp=cl=im=co=0
    for x in d.get('results',[]):
      mm=x.get('metrics',{}); sp+=int(mm.get('costMicros',0))/1e6; cl+=int(mm.get('clicks',0)); im+=int(mm.get('impressions',0)); co+=float(mm.get('conversions',0))
    return {'spend':sp,'impressions':im,'clicks':cl,'conversions':co}
  except urllib.error.HTTPError:
    return {'spend':0,'impressions':0,'clicks':0,'conversions':0}

today=datetime.date.today()
G={'Lifetime':google('2024-01-01',str(today)),
   'Last 30 days':google(str(today-datetime.timedelta(days=30)),str(today)),
   'Last 7 days':google(str(today-datetime.timedelta(days=7)),str(today)),
   'Last 3 days':google(str(today-datetime.timedelta(days=3)),str(today))}

def sd(a,b): return a/b if b else 0
PERIODS=['Lifetime','Last 30 days','Last 7 days','Last 3 days']

print('='*72)
print(f"UNCLE MAY'S PRODUCE  PERFORMANCE METRICS  {now.strftime('%Y-%m-%d %H:%M UTC')}")
print('='*72)
print()
print('REVENUE & ORDERS (real customers, internal tests excluded)')
print(f'{"":20} {"Lifetime":>12} {"Last 30d":>12} {"Last 7d":>12} {"Last 3d":>12}')
print(f'{"Orders":20} {S["Lifetime"][0]:>12} {S["Last 30 days"][0]:>12} {S["Last 7 days"][0]:>12} {S["Last 3 days"][0]:>12}')
print(f'{"Revenue":20} ${S["Lifetime"][1]:>11,.2f} ${S["Last 30 days"][1]:>11,.2f} ${S["Last 7 days"][1]:>11,.2f} ${S["Last 3 days"][1]:>11,.2f}')
print(f'{"Unique customers":20} {S["Lifetime"][2]:>12} {S["Last 30 days"][2]:>12} {S["Last 7 days"][2]:>12} {S["Last 3 days"][2]:>12}')
print(f'{"NEW customers":20} {S["Lifetime"][3]:>12} {S["Last 30 days"][3]:>12} {S["Last 7 days"][3]:>12} {S["Last 3 days"][3]:>12}')
aov=[sd(S[k][1],S[k][0]) for k in PERIODS]
print(f'{"AOV":20} ${aov[0]:>11,.2f} ${aov[1]:>11,.2f} ${aov[2]:>11,.2f} ${aov[3]:>11,.2f}')
print()
print('PAID AD SPEND')
print(f'{"":20} {"Lifetime":>12} {"Last 30d":>12} {"Last 7d":>12} {"Last 3d":>12}')
print(f'{"Meta Ads":20} ${M["Lifetime"]["spend"]:>11,.2f} ${M["Last 30 days"]["spend"]:>11,.2f} ${M["Last 7 days"]["spend"]:>11,.2f} ${M["Last 3 days"]["spend"]:>11,.2f}')
print(f'{"Google Ads":20} ${G["Lifetime"]["spend"]:>11,.2f} ${G["Last 30 days"]["spend"]:>11,.2f} ${G["Last 7 days"]["spend"]:>11,.2f} ${G["Last 3 days"]["spend"]:>11,.2f}')
T=[M[k]['spend']+G[k]['spend'] for k in PERIODS]
print(f'{"TOTAL ad spend":20} ${T[0]:>11,.2f} ${T[1]:>11,.2f} ${T[2]:>11,.2f} ${T[3]:>11,.2f}')
print()
print('META FUNNEL (Pixel signal)')
print(f'{"":20} {"Lifetime":>12} {"Last 30d":>12} {"Last 7d":>12} {"Last 3d":>12}')
for k_label,pretty in [('impressions','Impressions'),('clicks','Clicks'),('lpv','Landing pg views'),('atc','Add to cart'),('ic','Init checkout'),('purchases','Pixel purchases')]:
  vals=[M[p][k_label] for p in PERIODS]
  print(f'{pretty:20} {vals[0]:>12,} {vals[1]:>12,} {vals[2]:>12,} {vals[3]:>12,}')
print()
print('CAC AND ROAS')
print(f'{"":20} {"Lifetime":>12} {"Last 30d":>12} {"Last 7d":>12} {"Last 3d":>12}')
nc=[S[k][3] for k in PERIODS]
cac=[sd(T[i],nc[i]) for i in range(4)]
revs=[S[k][1] for k in PERIODS]
roas=[sd(revs[i],T[i]) for i in range(4)]
print(f'{"NEW customers":20} {nc[0]:>12} {nc[1]:>12} {nc[2]:>12} {nc[3]:>12}')
print(f'{"Total ad spend":20} ${T[0]:>11,.2f} ${T[1]:>11,.2f} ${T[2]:>11,.2f} ${T[3]:>11,.2f}')
print(f'{"BLENDED CAC":20} ${cac[0]:>11,.2f} ${cac[1]:>11,.2f} ${cac[2]:>11,.2f} ${cac[3]:>11,.2f}')
print(f'{"BLENDED ROAS":20} {roas[0]:>11.2f}x {roas[1]:>11.2f}x {roas[2]:>11.2f}x {roas[3]:>11.2f}x')
