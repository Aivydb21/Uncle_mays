"""Book Stripe revenue + first LOC interest payment."""
import json,sys,urllib.request,urllib.parse,base64,datetime,os
sys.stdout.reconfigure(encoding='utf-8',errors='replace')

c=json.load(open('C:/Users/Anthony/.claude/quickbooks-config.json',encoding='utf-8-sig'))
amap=json.load(open('reports/quickbooks/qbo-accounts-map.json',encoding='utf-8'))
base=c['api_base_production']; realm=c['realm_id']

def call(method,path,body=None):
  url=f"{base}/v3/company/{realm}/{path}{'&' if '?' in path else '?'}minorversion=73"
  headers={'Authorization':f"Bearer {c['access_token']}",'Accept':'application/json','User-Agent':'curl/8.0'}
  data=None
  if body is not None:
    headers['Content-Type']='application/json'
    data=json.dumps(body).encode()
  r=urllib.request.Request(url,data=data,headers=headers,method=method)
  try: return json.loads(urllib.request.urlopen(r).read())
  except urllib.error.HTTPError as e:
    print(f'HTTP {e.code} on {method} {path}:', e.read().decode()[:500]); return None

def aref(name): return {'value':amap[name],'name':name}

# === Pull Stripe charges with expanded balance_transaction for fees ===
key=os.environ.get('STRIPE_SECRET_KEY') or json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))['api_key']
auth='Basic '+base64.b64encode(f'{key}:'.encode()).decode()
suppress={'anthony@unclemays.com','anthonypivy@gmail.com','info@unclemays.com'}

all_ch=[]; sk=None
for _ in range(20):
  url='https://api.stripe.com/v1/charges?limit=100&expand[]=data.balance_transaction'
  if sk: url+=f'&starting_after={sk}'
  d=json.loads(urllib.request.urlopen(urllib.request.Request(url,headers={'Authorization':auth,'User-Agent':'curl/8.0'})).read())
  all_ch+=d['data']
  if not d['has_more']: break
  sk=d['data'][-1]['id']

def email_of(c): return (c.get('billing_details',{}).get('email') or c.get('receipt_email') or c.get('metadata',{}).get('customer_email') or '').lower()

real=[c for c in all_ch if c.get('status')=='succeeded' and c.get('paid') and email_of(c) not in suppress]

# Filter out the $0.51 hems_insurer probe order (not a real customer)
real=[c for c in real if not (c.get('amount')==51 and 'hems_insurer' in email_of(c))]

print(f'Real customer charges to book: {len(real)}')
gross_total=0; fee_total=0; net_total=0
by_month={}
for ch in real:
  amt=ch['amount']/100
  refunded=(ch.get('amount_refunded') or 0)/100
  bt=ch.get('balance_transaction') or {}
  fee=(bt.get('fee') or 0)/100 if isinstance(bt,dict) else 0
  net=amt-refunded-fee
  d=datetime.datetime.fromtimestamp(ch['created'],datetime.UTC).strftime('%Y-%m')
  by_month.setdefault(d,{'gross':0,'fee':0,'net':0,'count':0})
  by_month[d]['gross']+=amt-refunded
  by_month[d]['fee']+=fee
  by_month[d]['net']+=net
  by_month[d]['count']+=1
  gross_total+=amt-refunded
  fee_total+=fee
  net_total+=net

print(f'\nLifetime totals (real customers, internal tests + $0.51 probe excluded):')
print(f'  Gross Sales:         ${gross_total:>10,.2f}')
print(f'  Stripe Fees:         ${fee_total:>10,.2f}')
print(f'  Net to bank:         ${net_total:>10,.2f}')
print(f'\nBy month:')
for m in sorted(by_month):
  v=by_month[m]
  print(f'  {m}: {v["count"]:>3} charges  gross ${v["gross"]:>8,.2f}  fees ${v["fee"]:>6,.2f}  net ${v["net"]:>8,.2f}')

# === JE 5: Stripe revenue (one consolidated entry per month) ===
print()
print('=== JE 5: Stripe revenue (consolidated by month) ===')
for m in sorted(by_month):
  v=by_month[m]
  date=f'{m}-15'  # mid-month posting date
  body={'TxnDate':date,'PrivateNote':f'{v["count"]} Stripe charges in {m} (real customers; internal tests + probes excluded). Gross ${v["gross"]:,.2f} - fees ${v["fee"]:,.2f} = net ${v["net"]:,.2f} to x4738.','Line':[
    {'Description':f'Stripe net deposits {m}','Amount':round(v['net'],2),'DetailType':'JournalEntryLineDetail',
     'JournalEntryLineDetail':{'PostingType':'Debit','AccountRef':aref('Opening Balance Equity')}},
    {'Description':f'Stripe processing fees {m}','Amount':round(v['fee'],2),'DetailType':'JournalEntryLineDetail',
     'JournalEntryLineDetail':{'PostingType':'Debit','AccountRef':aref('COGS, Payment Processing')}},
    {'Description':f'Stripe gross sales {m}','Amount':round(v['gross'],2),'DetailType':'JournalEntryLineDetail',
     'JournalEntryLineDetail':{'PostingType':'Credit','AccountRef':aref('Sales')}},
  ]}
  r=call('POST','journalentry',body)
  if r and 'JournalEntry' in r: print(f'  CREATED: {m} (gross ${v["gross"]:,.2f}, fee ${v["fee"]:,.2f})')

# === JE 6: First LOC interest payment $78 (paid from x4738 today) ===
print()
print('=== JE 6: First LOC interest payment ===')
today=datetime.date.today().isoformat()
body={'TxnDate':today,'PrivateNote':'First interest payment on Greenwood Archer Capital line of credit. Paid from x4738 business checking.','Line':[
  {'Description':'LOC interest, May 2026','Amount':78.00,'DetailType':'JournalEntryLineDetail',
   'JournalEntryLineDetail':{'PostingType':'Debit','AccountRef':aref('Interest Expense, Line of Credit')}},
  {'Description':'LOC interest payment debit from x4738','Amount':78.00,'DetailType':'JournalEntryLineDetail',
   'JournalEntryLineDetail':{'PostingType':'Credit','AccountRef':{'value':[v for k,v in amap.items() if 'x4738' in k][0],'name':'x4738 - UNCLE MAY\'S PRODUCE INC - 1'}}},
]}
r=call('POST','journalentry',body)
if r and 'JournalEntry' in r: print(f'  CREATED: $78.00 LOC interest paid from x4738 ({today})')

# === Verify: pull P&L and Balance Sheet ===
print()
print('=== Pulling fresh P&L and Balance Sheet ===')
pnl=call('GET','reports/ProfitAndLoss?start_date=2026-01-01&end_date=2026-05-07')
bs=call('GET','reports/BalanceSheet?start_date=2026-01-01&end_date=2026-05-07')
with open('reports/quickbooks/profit-and-loss.json','w',encoding='utf-8') as f: json.dump(pnl,f,indent=2)
with open('reports/quickbooks/balance-sheet.json','w',encoding='utf-8') as f: json.dump(bs,f,indent=2)

def walk(rows,depth=0):
  if not rows: return
  for r in rows:
    if 'ColData' in r:
      cd=r['ColData']; n=cd[0].get('value','') if cd else ''; v=cd[1].get('value','') if len(cd)>1 else ''
      if n.strip() or v.strip(): print('  '*depth + f'{n[:50]:50} {v:>15}')
    h=r.get('Header')
    if h and 'ColData' in h:
      cd=h['ColData']; print('  '*depth + f'[{cd[0].get("value","")}]')
    if 'Rows' in r and r['Rows'] and 'Row' in r['Rows']: walk(r['Rows']['Row'],depth+1)
    s=r.get('Summary')
    if s and 'ColData' in s:
      cd=s['ColData']; n=cd[0].get('value',''); v=cd[1].get('value','') if len(cd)>1 else ''
      print('  '*depth + f'  Σ {n[:48]:48} {v:>15}')

print()
print('=== PROFIT AND LOSS YTD ===')
if pnl: walk(pnl.get('Rows',{}).get('Row',[]))
print()
print('=== BALANCE SHEET ===')
if bs: walk(bs.get('Rows',{}).get('Row',[]))
