"""
Weekly Stripe-to-QBO Sync
Run: python reports/quickbooks/qbo-weekly-sync.py [--dry-run]

Pulls Stripe charges + refunds for the past 7 days (or since last sync),
creates a consolidated weekly journal entry in QBO, and flags anomalies.

State file: reports/quickbooks/qbo-weekly-sync-state.json
  { "last_synced_through": "2026-06-06T00:00:00+00:00" }
"""
import json, sys, os, urllib.request, urllib.parse, base64, datetime, time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
DRY_RUN = '--dry-run' in sys.argv

CFG_PATH = 'C:/Users/Anthony/.claude/quickbooks-config.json'
AMAP_PATH = 'reports/quickbooks/qbo-accounts-map.json'
STATE_PATH = 'reports/quickbooks/qbo-weekly-sync-state.json'

SUPPRESS_EMAILS = {'anthony@unclemays.com', 'anthonypivy@gmail.com',
                   'info@unclemays.com', 'hello@unclemays.com',
                   'denise@unclemays.com', 'invest@unclemays.com',
                   'investmentrelations@unclemays.com'}

# ── Load configs ────────────────────────────────────────────────────────────
def load_cfg():
    return json.load(open(CFG_PATH, encoding='utf-8-sig'))

def save_cfg(c):
    with open(CFG_PATH, 'w', encoding='utf-8') as f:
        json.dump(c, f, indent=4)

c = load_cfg()
amap = json.load(open(AMAP_PATH, encoding='utf-8'))

# ── QBO token refresh ────────────────────────────────────────────────────────
def refresh_qbo_token():
    global c
    print('Refreshing QBO access token...')
    body = urllib.parse.urlencode({
        'grant_type': 'refresh_token',
        'refresh_token': c['refresh_token']
    }).encode()
    basic = base64.b64encode(f"{c['client_id']}:{c['client_secret']}".encode()).decode()
    req = urllib.request.Request(
        'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        data=body,
        headers={
            'Authorization': f'Basic {basic}',
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'curl/8.0',
        },
        method='POST'
    )
    d = json.loads(urllib.request.urlopen(req).read())
    if 'error' in d:
        raise RuntimeError(f"QBO token refresh failed: {d}")
    c['access_token'] = d['access_token']
    c['refresh_token'] = d['refresh_token']
    now = datetime.datetime.now(datetime.UTC)
    c['access_token_expires_at'] = (now + datetime.timedelta(seconds=int(d['expires_in']))).isoformat()
    c['refresh_token_updated_at'] = now.isoformat()
    save_cfg(c)
    print(f"  Token refreshed; expires {c['access_token_expires_at']}")

refresh_qbo_token()
c = load_cfg()

base_url = c['api_base_production'] if c.get('environment') == 'production' else c['api_base_sandbox']
realm = c['realm_id']

# ── QBO API call ─────────────────────────────────────────────────────────────
def qbo_call(method, path, body=None):
    url = f"{base_url}/v3/company/{realm}/{path}{'&' if '?' in path else '?'}minorversion=73"
    headers = {
        'Authorization': f"Bearer {c['access_token']}",
        'Accept': 'application/json',
        'User-Agent': 'curl/8.0',
    }
    data = None
    if body is not None:
        headers['Content-Type'] = 'application/json'
        data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        print(f'QBO HTTP {e.code} on {method} {path}:', e.read().decode()[:600])
        return None

def aref(name):
    if name not in amap:
        raise ValueError(f'Account not in map: {name}')
    return {'value': amap[name], 'name': name}

# ── Load sync state ───────────────────────────────────────────────────────────
now_utc = datetime.datetime.now(datetime.UTC)
if os.path.exists(STATE_PATH):
    state = json.load(open(STATE_PATH, encoding='utf-8'))
    last_synced_through = datetime.datetime.fromisoformat(state['last_synced_through'])
    print(f'Last sync through: {last_synced_through.isoformat()}')
else:
    # Default: go back 7 days on first run
    last_synced_through = now_utc - datetime.timedelta(days=7)
    print(f'No state file found; defaulting to 7 days ago: {last_synced_through.isoformat()}')

sync_window_start = int(last_synced_through.timestamp())
sync_window_end = int(now_utc.timestamp())

week_label = last_synced_through.strftime('%Y-%m-%d') + ' to ' + now_utc.strftime('%Y-%m-%d')
print(f'Syncing window: {week_label}')

# ── Stripe helpers ────────────────────────────────────────────────────────────
stripe_cfg = json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))
stripe_key = stripe_cfg['api_key']
stripe_auth = 'Basic ' + base64.b64encode(f'{stripe_key}:'.encode()).decode()

def stripe_get(path):
    url = f'https://api.stripe.com/v1/{path}'
    req = urllib.request.Request(url, headers={'Authorization': stripe_auth, 'User-Agent': 'curl/8.0'})
    return json.loads(urllib.request.urlopen(req).read())

def email_of(ch):
    return (
        ch.get('billing_details', {}).get('email') or
        ch.get('receipt_email') or
        ch.get('metadata', {}).get('customer_email') or ''
    ).lower()

# ── Pull Stripe charges in window ─────────────────────────────────────────────
print(f'\nPulling Stripe charges created after {sync_window_start} (unix ts)...')
all_charges = []
starting_after = None
for _ in range(20):
    qs = f'limit=100&created[gte]={sync_window_start}&created[lte]={sync_window_end}&expand[]=data.balance_transaction'
    if starting_after:
        qs += f'&starting_after={starting_after}'
    d = stripe_get(f'charges?{qs}')
    all_charges.extend(d['data'])
    if not d['has_more']:
        break
    starting_after = d['data'][-1]['id']
    time.sleep(0.2)

print(f'  Total charges pulled: {len(all_charges)}')

real_charges = [
    ch for ch in all_charges
    if ch.get('status') == 'succeeded'
    and ch.get('paid')
    and email_of(ch) not in SUPPRESS_EMAILS
    and not (ch.get('amount') == 51 and 'hems_insurer' in email_of(ch))
]
print(f'  Real customer charges: {len(real_charges)}')

# ── Pull Stripe refunds in window ─────────────────────────────────────────────
print(f'\nPulling Stripe refunds created after {sync_window_start}...')
all_refunds = []
starting_after = None
for _ in range(10):
    qs = f'limit=100&created[gte]={sync_window_start}&created[lte]={sync_window_end}'
    if starting_after:
        qs += f'&starting_after={starting_after}'
    d = stripe_get(f'refunds?{qs}')
    all_refunds.extend(d['data'])
    if not d['has_more']:
        break
    starting_after = d['data'][-1]['id']
    time.sleep(0.2)

print(f'  Total refunds pulled: {len(all_refunds)}')

# ── Tally totals ──────────────────────────────────────────────────────────────
gross_sales = sum(ch['amount'] for ch in real_charges) / 100
stripe_fees = sum(
    (ch.get('balance_transaction', {}) or {}).get('fee', 0) / 100
    if isinstance(ch.get('balance_transaction'), dict) else 0
    for ch in real_charges
)
total_refunds = sum(r['amount'] for r in all_refunds) / 100
net_to_bank = gross_sales - stripe_fees - total_refunds

print(f'\n=== Weekly Totals ({week_label}) ===')
print(f'  Gross sales:    ${gross_sales:>10,.2f}  ({len(real_charges)} charges)')
print(f'  Stripe fees:    ${stripe_fees:>10,.2f}')
print(f'  Refunds:        ${total_refunds:>10,.2f}  ({len(all_refunds)} refunds)')
print(f'  Net to bank:    ${net_to_bank:>10,.2f}')

# ── Anomaly detection ────────────────────────────────────────────────────────
anomalies = []
if gross_sales > 0 and total_refunds / gross_sales > 0.10:
    anomalies.append(f'HIGH REFUND RATE: {total_refunds/gross_sales*100:.1f}% (>{10}% threshold)')
for ch in real_charges:
    if ch['amount'] / 100 > 500:
        anomalies.append(f'Large charge: ${ch["amount"]/100:,.2f} id={ch["id"]} email={email_of(ch)}')
if len(real_charges) == 0 and last_synced_through < now_utc - datetime.timedelta(days=3):
    anomalies.append('ZERO charges in sync window - possible Stripe data gap')

if anomalies:
    print(f'\n=== ANOMALIES ({len(anomalies)}) ===')
    for a in anomalies:
        print(f'  ⚠  {a}')

# ── Skip QBO posting if nothing to book ──────────────────────────────────────
if gross_sales == 0 and total_refunds == 0:
    print('\nNothing to book in QBO this week.')
    # Still update state
    if not DRY_RUN:
        state = {'last_synced_through': now_utc.isoformat(), 'last_run': now_utc.isoformat()}
        with open(STATE_PATH, 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2)
        print(f'State updated: last_synced_through={now_utc.isoformat()}')
    sys.exit(0)

# ── Build QBO journal entry ──────────────────────────────────────────────────
# Pattern:
#   DEBIT  x4738 (bank)                     = net_to_bank
#   DEBIT  COGS, Payment Processing         = stripe_fees
#   DEBIT  COGS, Promotional Discounts      = total_refunds  (if any)
#   CREDIT Sales                            = gross_sales

bank_acct_key = [k for k in amap if 'x4738' in k][0]
txn_date = now_utc.strftime('%Y-%m-%d')

private_note = (
    f'Weekly Stripe sync: {week_label}. '
    f'{len(real_charges)} charges, gross ${gross_sales:,.2f} - '
    f'fees ${stripe_fees:,.2f} - refunds ${total_refunds:,.2f} = '
    f'net ${net_to_bank:,.2f}. '
    f'Auto-booked by Bookkeeper agent (UNC-1694).'
)

lines = []

# When net_to_bank > 0: DEBIT x4738 (payout deposited)
# When net_to_bank < 0: CREDIT x4738 (Stripe deducts from future payout -- e.g. fee on a full refund)
# Either way, debits = credits:
#   Debit side:  stripe_fees + total_refunds + max(net_to_bank, 0)
#   Credit side: gross_sales + max(-net_to_bank, 0)
#   Both equal gross_sales because:
#     net_to_bank = gross - fees - refunds
#     => fees + refunds + max(gross-fees-refunds, 0) = gross when positive (trivially)
#     => fees + refunds = gross + (fees+refunds-gross) when negative (trivially)

if net_to_bank > 0:
    lines.append({
        'Description': f'Stripe net payout {week_label}',
        'Amount': round(net_to_bank, 2),
        'DetailType': 'JournalEntryLineDetail',
        'JournalEntryLineDetail': {
            'PostingType': 'Debit',
            'AccountRef': {'value': amap[bank_acct_key], 'name': bank_acct_key},
        },
    })

if stripe_fees > 0:
    lines.append({
        'Description': f'Stripe processing fees {week_label}',
        'Amount': round(stripe_fees, 2),
        'DetailType': 'JournalEntryLineDetail',
        'JournalEntryLineDetail': {
            'PostingType': 'Debit',
            'AccountRef': aref('COGS, Payment Processing'),
        },
    })

if total_refunds > 0:
    lines.append({
        'Description': f'Stripe refunds issued {week_label}',
        'Amount': round(total_refunds, 2),
        'DetailType': 'JournalEntryLineDetail',
        'JournalEntryLineDetail': {
            'PostingType': 'Debit',
            'AccountRef': aref('COGS, Promotional Discounts'),
        },
    })

lines.append({
    'Description': f'Stripe gross sales {week_label}',
    'Amount': round(gross_sales, 2),
    'DetailType': 'JournalEntryLineDetail',
    'JournalEntryLineDetail': {
        'PostingType': 'Credit',
        'AccountRef': aref('Sales'),
    },
})

# If net_to_bank is negative, Stripe will deduct from future deposits -- credit x4738
if net_to_bank < 0:
    lines.append({
        'Description': f'Stripe fee on fully-refunded charge -- will be deducted from next payout',
        'Amount': round(-net_to_bank, 2),
        'DetailType': 'JournalEntryLineDetail',
        'JournalEntryLineDetail': {
            'PostingType': 'Credit',
            'AccountRef': {'value': amap[bank_acct_key], 'name': bank_acct_key},
        },
    })

je_body = {
    'TxnDate': txn_date,
    'PrivateNote': private_note,
    'Line': lines,
}

print(f'\n=== Journal Entry Preview ===')
print(f'  Date: {txn_date}')
for ln in lines:
    pt = ln['JournalEntryLineDetail']['PostingType']
    acct = ln['JournalEntryLineDetail']['AccountRef'].get('name', '?')
    amt = ln['Amount']
    print(f'  {pt:7}  {acct:40}  ${amt:>10,.2f}')
print(f'  Note: {private_note[:100]}...')

if DRY_RUN:
    print('\n[DRY RUN] Would post the above JE. Exiting without changes.')
    sys.exit(0)

# ── Post to QBO ───────────────────────────────────────────────────────────────
print(f'\nPosting journal entry to QBO...')
result = qbo_call('POST', 'journalentry', je_body)
if result and 'JournalEntry' in result:
    je_id = result['JournalEntry'].get('Id', '?')
    je_doc = result['JournalEntry'].get('DocNumber', '?')
    print(f'  SUCCESS: JE Id={je_id} DocNumber={je_doc}')
else:
    print(f'  FAILED to create journal entry.')
    sys.exit(1)

# ── Update state ──────────────────────────────────────────────────────────────
state = {
    'last_synced_through': now_utc.isoformat(),
    'last_run': now_utc.isoformat(),
    'last_je_id': je_id,
    'last_je_doc': je_doc,
}
with open(STATE_PATH, 'w', encoding='utf-8') as f:
    json.dump(state, f, indent=2)
print(f'State updated: last_synced_through={now_utc.isoformat()}')

# ── Pull updated P&L for verification ────────────────────────────────────────
print('\n=== Pulling QBO P&L (YTD) for verification ===')
start_of_year = f'{now_utc.year}-01-01'
pnl = qbo_call('GET', f'reports/ProfitAndLoss?start_date={start_of_year}&end_date={txn_date}')
if pnl:
    with open('reports/quickbooks/profit-and-loss.json', 'w', encoding='utf-8') as f:
        json.dump(pnl, f, indent=2)
    print('  P&L saved to reports/quickbooks/profit-and-loss.json')

# ── Print anomaly summary ─────────────────────────────────────────────────────
print('\n=== Sync Complete ===')
print(f'  JE posted: #{je_doc} (id={je_id})')
print(f'  Gross: ${gross_sales:,.2f}  Fees: ${stripe_fees:,.2f}  Refunds: ${total_refunds:,.2f}  Net: ${net_to_bank:,.2f}')
if anomalies:
    print(f'  ANOMALIES: {len(anomalies)} -- review required')
    for a in anomalies: print(f'    - {a}')
else:
    print('  No anomalies detected.')
