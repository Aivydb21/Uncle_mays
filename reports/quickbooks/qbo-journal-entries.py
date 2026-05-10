"""Book opening journal entries for Uncle May's Produce QBO."""
import json,sys,urllib.request,urllib.parse,base64,datetime,time
sys.stdout.reconfigure(encoding='utf-8',errors='replace')

c=json.load(open('C:/Users/Anthony/.claude/quickbooks-config.json',encoding='utf-8-sig'))
amap=json.load(open('reports/quickbooks/qbo-accounts-map.json',encoding='utf-8'))
base=c['api_base_production']
realm=c['realm_id']

def call(method,path,body=None):
  url=f"{base}/v3/company/{realm}/{path}{'&' if '?' in path else '?'}minorversion=73"
  headers={'Authorization':f"Bearer {c['access_token']}",'Accept':'application/json','User-Agent':'curl/8.0'}
  data=None
  if body is not None:
    headers['Content-Type']='application/json'
    data=json.dumps(body).encode()
  r=urllib.request.Request(url,data=data,headers=headers,method=method)
  try:
    return json.loads(urllib.request.urlopen(r).read())
  except urllib.error.HTTPError as e:
    print(f'HTTP {e.code} on {method} {path}:', e.read().decode()[:500])
    return None

# Retry the missing Office account
if 'Office and Operating Supplies' not in amap:
  print('Creating missing Office account with corrected subtype...')
  r=call('POST','account',{'Name':'Office and Operating Supplies','AccountType':'Expense','AccountSubType':'OfficeGeneralAdministrativeExpenses'})
  if r and 'Account' in r:
    amap['Office and Operating Supplies']=r['Account']['Id']
    with open('reports/quickbooks/qbo-accounts-map.json','w',encoding='utf-8') as f: json.dump(amap,f,indent=2)
    print(f"  CREATED: Office and Operating Supplies (id={r['Account']['Id']})")

def aref(name):
  if name not in amap:
    raise ValueError(f'Account not in map: {name}')
  return {'value':amap[name],'name':name}

def je(date,memo,lines):
  body={'TxnDate':date,'PrivateNote':memo,'Line':[]}
  for amt,posting,acct,desc in lines:
    body['Line'].append({
      'Description':desc,
      'Amount':amt,
      'DetailType':'JournalEntryLineDetail',
      'JournalEntryLineDetail':{
        'PostingType':posting,  # 'Debit' or 'Credit'
        'AccountRef':aref(acct),
      }
    })
  r=call('POST','journalentry',body)
  if r and 'JournalEntry' in r:
    print(f"  CREATED JE {r['JournalEntry'].get('DocNumber','?')}: {memo}")
    return r['JournalEntry']
  else:
    print(f"  FAILED: {memo}")
    return None

print()
print('=== JE 1: Historical $25K grant (treated as Owner Contribution + Pre-Op Exp) ===')
je('2026-01-01','Historical $25K grant fully spent on pre-operating research, legal, formation costs (no detailed records preserved)',[
  (25000.00,'Debit','Pre-Operating Expenses','Pre-operating spend (research, legal, formation)'),
  (25000.00,'Credit','Owner Contribution, Anthony Ivy','$25K grant treated as owner contribution'),
])

print()
print('=== JE 2: LOC liability recognition (offsets Opening Balance Equity) ===')
je('2026-03-09','Recognize $11,000 drawn from Greenwood Archer Capital line of credit. Cash already reflected in x4738 opening balance import; this entry separates the liability from equity.',[
  (11000.00,'Debit','Opening Balance Equity','Reclassify $11K of OBE that was actually LOC-funded'),
  (11000.00,'Credit','Line of Credit, Greenwood Archer Capital','Greenwood Archer LOC drawn balance'),
])

print()
print('=== JE 3: Reclassify $10,750 transfers x4738->x8170 as Owner Distribution ===')
je('2026-04-15','Net of 23 transfers from x4738 business checking to x8170 Anthony personal checking, March-May 2026. Bank balance already reflects this outflow; this entry classifies it as Owner Distribution rather than expense or transfer.',[
  (10750.00,'Debit','Owner Distribution, Anthony Ivy','Net transfers to personal account, Mar-May 2026'),
  (10750.00,'Credit','Opening Balance Equity','Reclassify OBE as Owner Distribution'),
])

print()
print('=== JE 4: Business expenses paid from x8170 personal account ===')
je('2026-04-15','94 business transactions paid from x8170 personal checking, Mar 7 - May 6, 2026. Categorized from CSV. Treated as Owner Contribution since funds came partly from business transfers and partly from personal cash.',[
  (1436.80,'Debit','Software and Subscriptions','Mailchimp, OpenAI, Anthropic, Cursor, Airtable, Firecrawl, Calendly, Apollo, Slack, Zoom, Porkbun, Anytime Mailbox, DocuSign, Adobe, Midjourney, Gamma, LinkedIn'),
  (985.13,'Debit','Meta Ads','41 Facebook Ads charges Mar-May 2026'),
  (1305.49,'Debit','Contractor Fees','9 Upwork charges + Wise $350 international employee payment'),
  (229.80,'Debit','COGS, Produce','Reginald Stewart Zelle 2026-04-20 (Black farmer produce supply)'),
  (200.00,'Debit','Professional Fees','1871 CEC entrepreneurship membership 2026-04-23'),
  (131.20,'Debit','Google Ads','3 Google Ads charges Apr-May 2026'),
  (31.47,'Debit','Office and Operating Supplies','FedEx Office, USPS'),
  (4319.89,'Credit','Owner Contribution, Anthony Ivy','Business expenses paid from personal x8170 account'),
])

print()
print('=== Verify: pull P&L and Balance Sheet ===')
pnl=call('GET','reports/ProfitAndLoss?start_date=2026-01-01&end_date=2026-05-07')
bs=call('GET','reports/BalanceSheet?start_date=2026-01-01&end_date=2026-05-07')

with open('reports/quickbooks/profit-and-loss.json','w',encoding='utf-8') as f: json.dump(pnl,f,indent=2)
with open('reports/quickbooks/balance-sheet.json','w',encoding='utf-8') as f: json.dump(bs,f,indent=2)
print('Reports saved.')

def walk(rows,depth=0):
  if not rows: return
  for r in rows:
    if 'ColData' in r:
      cd=r['ColData']
      n=cd[0].get('value','') if cd else ''
      v=cd[1].get('value','') if len(cd)>1 else ''
      if n.strip() or v.strip():
        print('  '*depth + f'{n[:50]:50} {v:>15}')
    h=r.get('Header')
    if h and 'ColData' in h:
      cd=h['ColData']; n=cd[0].get('value','')
      print('  '*depth + f'[{n}]')
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
