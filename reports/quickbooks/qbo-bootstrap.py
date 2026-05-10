"""Bootstrap Uncle May's Produce QuickBooks: COA + opening journal entries."""
import json,sys,urllib.request,urllib.parse,base64,datetime,time
sys.stdout.reconfigure(encoding='utf-8',errors='replace')

CFG_PATH='C:/Users/Anthony/.claude/quickbooks-config.json'
def load(): return json.load(open(CFG_PATH,encoding='utf-8-sig'))
def save(c):
  with open(CFG_PATH,'w',encoding='utf-8') as f:
    json.dump(c,f,indent=4)

c=load()
def refresh_token():
  global c
  print('Refreshing QBO access token...')
  body=urllib.parse.urlencode({'grant_type':'refresh_token','refresh_token':c['refresh_token']}).encode()
  basic=base64.b64encode(f"{c['client_id']}:{c['client_secret']}".encode()).decode()
  r=urllib.request.Request('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    data=body,headers={'Authorization':f'Basic {basic}','Accept':'application/json','Content-Type':'application/x-www-form-urlencoded','User-Agent':'curl/8.0'},method='POST')
  d=json.loads(urllib.request.urlopen(r).read())
  c['access_token']=d['access_token']
  c['refresh_token']=d['refresh_token']
  now=datetime.datetime.now(datetime.UTC)
  c['access_token_expires_at']=(now+datetime.timedelta(seconds=int(d['expires_in']))).isoformat()
  c['refresh_token_updated_at']=now.isoformat()
  save(c)
  print(f"  Token refreshed; expires {c['access_token_expires_at']}")

refresh_token()
base=c['api_base_production'] if c.get('environment')=='production' else c['api_base_sandbox']
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

# Get existing accounts to skip duplicates
existing=call('GET','query?query=select%20*%20from%20Account%20maxresults%20500')
existing_by_name={a['Name']:a['Id'] for a in existing.get('QueryResponse',{}).get('Account',[])}
print(f'Existing accounts: {len(existing_by_name)}')

# === Define COA ===
# (Name, AccountType, AccountSubType, [parent_name])
TOP=[
  ('Stripe Clearing','Other Current Asset','OtherCurrentAssets',None),
  ('Inventory','Other Current Asset','Inventory',None),
  ('Sales Tax Payable','Other Current Liability','SalesTaxPayable',None),
  ('Line of Credit, Greenwood Archer Capital','Other Current Liability','LineOfCredit',None),
  ('SBA Loan, Busey Bank','Long Term Liability','NotesPayable',None),
  ('Owner Contribution, Anthony Ivy','Equity','OwnersEquity',None),
  ('Owner Distribution, Anthony Ivy','Equity','OwnersEquity',None),
  ('SAFE Note Proceeds','Equity','OwnersEquity',None),
  ('Sales','Income','SalesOfProductIncome',None),
  ('COGS, Produce','Cost of Goods Sold','SuppliesMaterialsCogs',None),
  ('COGS, Protein','Cost of Goods Sold','SuppliesMaterialsCogs',None),
  ('COGS, Packaging','Cost of Goods Sold','SuppliesMaterialsCogs',None),
  ('COGS, Last-Mile Delivery','Cost of Goods Sold','ShippingFreightDeliveryCos',None),
  ('COGS, Payment Processing','Cost of Goods Sold','SuppliesMaterialsCogs',None),
  ('COGS, Promotional Discounts','Cost of Goods Sold','SuppliesMaterialsCogs',None),
  ('Pre-Operating Expenses','Expense','OtherMiscellaneousServiceCost',None),
  ('Advertising and Marketing','Expense','AdvertisingPromotional',None),
  ('Software and Subscriptions','Expense','DuesSubscriptions',None),
  ('Professional Fees','Expense','LegalProfessionalFees',None),
  ('Office and Operating Supplies','Expense','OfficeExpenses',None),
  ('Bank Service Charges','Expense','BankCharges',None),
  ('Insurance','Expense','Insurance',None),
  ('Travel and Meals','Expense','TravelMeals',None),
  ('Contractor Fees','Expense','LegalProfessionalFees',None),
  ('Interest Income','Other Income','InterestEarned',None),
  ('Interest Expense','Other Expense','OtherMiscellaneousExpense',None),
]
SUBS=[
  ('Meta Ads','Expense','AdvertisingPromotional','Advertising and Marketing'),
  ('Google Ads','Expense','AdvertisingPromotional','Advertising and Marketing'),
  ('Other Marketing','Expense','AdvertisingPromotional','Advertising and Marketing'),
  ('Interest Expense, Line of Credit','Other Expense','OtherMiscellaneousExpense','Interest Expense'),
]

print()
print('=== Creating top-level accounts ===')
for name,at,ast,parent in TOP:
  if name in existing_by_name:
    print(f'  SKIP (exists): {name}')
    continue
  body={'Name':name,'AccountType':at,'AccountSubType':ast}
  r=call('POST','account',body)
  if r and 'Account' in r:
    existing_by_name[name]=r['Account']['Id']
    print(f'  CREATED: {name} (id={r["Account"]["Id"]})')
  time.sleep(0.2)

print()
print('=== Creating sub-accounts ===')
for name,at,ast,parent_name in SUBS:
  if name in existing_by_name:
    print(f'  SKIP (exists): {name}')
    continue
  pid=existing_by_name.get(parent_name)
  if not pid:
    print(f'  ERROR: parent {parent_name} not found for {name}')
    continue
  body={'Name':name,'AccountType':at,'AccountSubType':ast,'SubAccount':True,'ParentRef':{'value':pid}}
  r=call('POST','account',body)
  if r and 'Account' in r:
    existing_by_name[name]=r['Account']['Id']
    print(f'  CREATED: {name} -> sub of {parent_name}')
  time.sleep(0.2)

print()
print(f'Total accounts now: {len(existing_by_name)}')

# Save the account map for next phase (journal entries)
with open('reports/quickbooks/qbo-accounts-map.json','w',encoding='utf-8') as f:
  json.dump(existing_by_name,f,indent=2)
print('Account ID map saved to reports/quickbooks/qbo-accounts-map.json')
