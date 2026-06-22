"""Daily Financial Report - Uncle May's Produce
Runs every morning at 7am CT:
1. Refresh QBO token
2. Pull P&L + Balance Sheet from QBO
3. Pull Stripe balance/payouts/charges from prior 24h
4. Post any unbooked Stripe transactions to QBO as journal entries
5. Email summary to anthony@unclemays.com
6. Flag anomalies
"""
import json, sys, urllib.request, urllib.parse, urllib.error, base64, datetime, time, os, ssl
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CFG_PATH = 'C:/Users/Anthony/.claude/quickbooks-config.json'
AMAP_PATH = 'C:/Users/Anthony/Desktop/um_website/reports/quickbooks/qbo-accounts-map.json'
STRIPE_SECRET = os.environ.get('STRIPE_SECRET_KEY', '')
GMAIL_CLIENT_ID = os.environ.get('GMAIL_CLIENT_ID', '')
GMAIL_CLIENT_SECRET = os.environ.get('GMAIL_CLIENT_SECRET', '')
GMAIL_REFRESH_TOKEN = os.environ.get('GMAIL_REFRESH_TOKEN', '')

print("=== Uncle May's Produce Daily Financial Report ===")
print(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M CT')}")
print()

# ── QBO Config ──────────────────────────────────────────────────────────────
def load_cfg():
    return json.load(open(CFG_PATH, encoding='utf-8-sig'))

def save_cfg(c):
    with open(CFG_PATH, 'w', encoding='utf-8') as f:
        json.dump(c, f, indent=4)

c = load_cfg()
amap = json.load(open(AMAP_PATH, encoding='utf-8'))

# ── Step 1: Refresh QBO Token ────────────────────────────────────────────────
print("Step 1: Refreshing QBO access token...")
try:
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
            'User-Agent': 'curl/8.0'
        },
        method='POST'
    )
    d = json.loads(urllib.request.urlopen(req).read())
    c['access_token'] = d['access_token']
    c['refresh_token'] = d['refresh_token']
    now = datetime.datetime.now(datetime.timezone.utc)
    c['access_token_expires_at'] = (now + datetime.timedelta(seconds=int(d['expires_in']))).isoformat()
    c['refresh_token_updated_at'] = now.isoformat()
    save_cfg(c)
    print(f"  ✓ Token refreshed; expires {c['access_token_expires_at']}")
    qbo_token_status = "refreshed"
except Exception as e:
    print(f"  ✗ Token refresh failed: {e}")
    qbo_token_status = f"failed: {e}"

base = c['api_base_production']
realm = c['realm_id']

# ── QBO API Helper ────────────────────────────────────────────────────────────
def qbo_call(method, path, body=None):
    url = f"{base}/v3/company/{realm}/{path}{'&' if '?' in path else '?'}minorversion=73"
    headers = {
        'Authorization': f"Bearer {c['access_token']}",
        'Accept': 'application/json',
        'User-Agent': 'curl/8.0'
    }
    data = None
    if body is not None:
        headers['Content-Type'] = 'application/json'
        data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()[:500]
        print(f"  HTTP {e.code} on {method} {path}: {err_body}")
        return None

def aref(name):
    if name not in amap:
        raise ValueError(f'Account not in map: {name}')
    return {'value': amap[name], 'name': name}

# ── Step 2: Pull QBO P&L + Balance Sheet ────────────────────────────────────
print("Step 2: Pulling QBO reports...")
today = datetime.date.today()
mtd_start = today.replace(day=1).isoformat()
mtd_end = today.isoformat()

pnl = qbo_call('GET', f'reports/ProfitAndLoss?start_date={mtd_start}&end_date={mtd_end}')
bs = qbo_call('GET', f'reports/BalanceSheet?start_date=2026-01-01&end_date={mtd_end}')

def extract_summary_rows(rows):
    """Return flat list of (name, value) from QBO report rows."""
    results = []
    if not rows:
        return results
    for r in rows:
        h = r.get('Header')
        if h and 'ColData' in h:
            cd = h['ColData']
            name = cd[0].get('value', '') if cd else ''
        else:
            name = None
        if 'ColData' in r:
            cd = r['ColData']
            n = cd[0].get('value', '') if cd else ''
            v = cd[1].get('value', '') if len(cd) > 1 else ''
            if n.strip():
                results.append((n.strip(), v.strip()))
        if 'Rows' in r and r['Rows'] and 'Row' in r['Rows']:
            results.extend(extract_summary_rows(r['Rows']['Row']))
        s = r.get('Summary')
        if s and 'ColData' in s:
            cd = s['ColData']
            n = cd[0].get('value', '') if cd else ''
            v = cd[1].get('value', '') if len(cd) > 1 else ''
            if n.strip():
                results.append((f"  TOTAL: {n.strip()}", v.strip()))
    return results

def find_value(rows_list, key_substr):
    for n, v in rows_list:
        if key_substr.lower() in n.lower() and v:
            try:
                return float(v.replace(',', ''))
            except:
                pass
    return None

pnl_rows = []
bs_rows = []
revenue = 0.0
cogs = 0.0
gross_profit = 0.0
net_income = 0.0
bank_balance = 0.0
stripe_clearing = 0.0
total_assets = 0.0
net_equity = 0.0

if pnl:
    pnl_rows = extract_summary_rows(pnl.get('Rows', {}).get('Row', []))
    revenue_val = find_value(pnl_rows, 'Total Income')
    cogs_val = find_value(pnl_rows, 'Total Cost of Goods')
    if cogs_val is None:
        cogs_val = find_value(pnl_rows, 'Total COGS')
    gross_val = find_value(pnl_rows, 'Gross Profit')
    net_val = find_value(pnl_rows, 'Net Income')
    if revenue_val is not None: revenue = revenue_val
    if cogs_val is not None: cogs = cogs_val
    if gross_val is not None: gross_profit = gross_val
    if net_val is not None: net_income = net_val
    print(f"  ✓ P&L pulled: Revenue ${revenue:,.2f} | COGS ${cogs:,.2f} | Gross ${gross_profit:,.2f} | Net ${net_income:,.2f}")
else:
    print("  ✗ P&L pull failed")

if bs:
    bs_rows = extract_summary_rows(bs.get('Rows', {}).get('Row', []))
    bank_val = find_value(bs_rows, 'x4738')
    stripe_val = find_value(bs_rows, 'Stripe Clearing')
    assets_val = find_value(bs_rows, 'Total Assets')
    equity_val = find_value(bs_rows, "Total Stockholder")
    if equity_val is None:
        equity_val = find_value(bs_rows, 'Total Equity')
    if equity_val is None:
        equity_val = find_value(bs_rows, "Owner's Equity")
    if bank_val is not None: bank_balance = bank_val
    if stripe_val is not None: stripe_clearing = stripe_val
    if assets_val is not None: total_assets = assets_val
    if equity_val is not None: net_equity = equity_val
    print(f"  ✓ Balance Sheet pulled: Bank ${bank_balance:,.2f} | Stripe Clearing ${stripe_clearing:,.2f} | Assets ${total_assets:,.2f} | Equity ${net_equity:,.2f}")
else:
    print("  ✗ Balance Sheet pull failed")

# ── Step 3: Pull Stripe Data (last 24h) ──────────────────────────────────────
print("Step 3: Pulling Stripe data (last 24h)...")

def stripe_get(path):
    req = urllib.request.Request(
        f"https://api.stripe.com/v1/{path}",
        headers={'Authorization': f'Bearer {STRIPE_SECRET}', 'User-Agent': 'curl/8.0'}
    )
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        print(f"  Stripe HTTP {e.code} on {path}: {e.read().decode()[:300]}")
        return None

yesterday_ts = int((datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=24)).timestamp())

# Balance
stripe_balance_resp = stripe_get('balance')
stripe_available = 0.0
stripe_pending = 0.0
if stripe_balance_resp:
    for b in stripe_balance_resp.get('available', []):
        if b.get('currency') == 'usd':
            stripe_available = b['amount'] / 100
    for b in stripe_balance_resp.get('pending', []):
        if b.get('currency') == 'usd':
            stripe_pending = b['amount'] / 100
    print(f"  ✓ Stripe balance: Available ${stripe_available:,.2f} | Pending ${stripe_pending:,.2f}")
else:
    print("  ✗ Stripe balance pull failed")

# Charges (last 24h)
charges_resp = stripe_get(f'charges?created[gte]={yesterday_ts}&limit=100&expand[]=data.balance_transaction')
charges = []
total_gross_charges = 0.0
total_stripe_fees = 0.0
total_net_charges = 0.0
if charges_resp:
    charges = charges_resp.get('data', [])
    for ch in charges:
        if ch.get('status') == 'succeeded':
            gross = ch['amount'] / 100
            fee = 0.0
            net = 0.0
            bt = ch.get('balance_transaction')
            if isinstance(bt, dict):
                fee = bt.get('fee', 0) / 100
                net = bt.get('net', 0) / 100
            else:
                fee = round(gross * 0.029 + 0.30, 2)
                net = gross - fee
            total_gross_charges += gross
            total_stripe_fees += fee
            total_net_charges += net
    print(f"  ✓ Stripe charges: {len(charges)} charge(s) | Gross ${total_gross_charges:,.2f} | Fees ${total_stripe_fees:,.2f} | Net ${total_net_charges:,.2f}")
else:
    print("  ✗ Stripe charges pull failed")

# Payouts (last 24h)
payouts_resp = stripe_get(f'payouts?created[gte]={yesterday_ts}&limit=100')
payouts = []
total_payouts = 0.0
if payouts_resp:
    payouts = payouts_resp.get('data', [])
    for p in payouts:
        if p.get('status') == 'paid':
            total_payouts += p['amount'] / 100
    print(f"  ✓ Stripe payouts: {len(payouts)} payout(s) | Total ${total_payouts:,.2f}")
else:
    print("  ✗ Stripe payouts pull failed")

# Refunds (last 24h)
refunds_resp = stripe_get(f'refunds?created[gte]={yesterday_ts}&limit=100')
refunds = []
total_refunds = 0.0
if refunds_resp:
    refunds = refunds_resp.get('data', [])
    for r in refunds:
        total_refunds += r['amount'] / 100
    print(f"  ✓ Stripe refunds: {len(refunds)} refund(s) | Total ${total_refunds:,.2f}")
else:
    print("  ✗ Stripe refunds pull failed")

# ── Step 4: Post Unbooked Transactions to QBO ──────────────────────────────
print("Step 4: Posting unbooked transactions to QBO...")

journal_entries_posted = []
today_str = today.isoformat()

def post_je(date_str, memo, lines):
    body = {'TxnDate': date_str, 'PrivateNote': memo, 'Line': []}
    for amt, posting, acct, desc in lines:
        body['Line'].append({
            'Description': desc,
            'Amount': round(abs(amt), 2),
            'DetailType': 'JournalEntryLineDetail',
            'JournalEntryLineDetail': {
                'PostingType': posting,
                'AccountRef': aref(acct),
            }
        })
    r = qbo_call('POST', 'journalentry', body)
    if r and 'JournalEntry' in r:
        doc_num = r['JournalEntry'].get('DocNumber', '?')
        print(f"  ✓ Posted JE #{doc_num}: {memo}")
        journal_entries_posted.append({'doc': doc_num, 'memo': memo, 'amount': sum(abs(l[0]) for l in lines if l[1]=='Debit')})
        return r['JournalEntry']
    else:
        print(f"  ✗ Failed to post JE: {memo}")
        return None

# Check if today's Stripe charges need to be booked
# We check by querying recent JEs to avoid double-booking
recent_jes_resp = qbo_call('GET', f'query?query=select%20*%20from%20JournalEntry%20where%20TxnDate%20%3D%20%27{today_str}%27%20maxresults%2050')
existing_je_notes = []
if recent_jes_resp:
    for je_item in recent_jes_resp.get('QueryResponse', {}).get('JournalEntry', []):
        note = je_item.get('PrivateNote', '')
        if note:
            existing_je_notes.append(note.lower())

# Post charge JEs for successful charges not already booked
succeeded_charges = [ch for ch in charges if ch.get('status') == 'succeeded']
for ch in succeeded_charges:
    gross = ch['amount'] / 100
    bt = ch.get('balance_transaction')
    if isinstance(bt, dict):
        fee = bt.get('fee', 0) / 100
        net = bt.get('net', 0) / 100
    else:
        fee = round(gross * 0.029 + 0.30, 2)
        net = gross - fee

    customer = ch.get('billing_details', {}).get('name') or ch.get('customer') or ch.get('id', 'Unknown')
    memo_key = f"stripe charge {ch['id'][:12].lower()}"
    already_booked = any(memo_key in note for note in existing_je_notes)
    if already_booked:
        print(f"  — Already booked: {customer} ${gross:.2f}")
        continue

    charge_date = datetime.datetime.fromtimestamp(ch['created'], tz=datetime.timezone.utc).strftime('%Y-%m-%d')
    memo = f"Stripe charge {ch['id'][:16]} - {customer} ${gross:.2f} gross / ${fee:.2f} fee / ${net:.2f} net"
    lines = [
        (net,  'Debit',  'Stripe Clearing',       f"Net deposit to Stripe Clearing - {customer}"),
        (fee,  'Debit',  'Bank Service Charges',   f"Stripe processing fee - {customer}"),
        (gross,'Credit', 'Sales',                  f"Stripe sale - {customer}"),
    ]
    if gross > 0 and fee > 0:
        post_je(charge_date, memo, lines)

# Post payout JEs (Stripe Clearing -> Bank)
for p in payouts:
    if p.get('status') != 'paid':
        continue
    amount = p['amount'] / 100
    payout_date = datetime.datetime.fromtimestamp(p['arrival_date'], tz=datetime.timezone.utc).strftime('%Y-%m-%d')
    memo_key = f"stripe payout {p['id'][:12].lower()}"
    already_booked = any(memo_key in note for note in existing_je_notes)
    if already_booked:
        print(f"  — Already booked payout ${amount:.2f}")
        continue
    memo = f"Stripe payout {p['id'][:16]} - ${amount:.2f} to bank"
    lines = [
        (amount, 'Debit',  "x4738 - UNCLE MAY'S PRODUCE INC - 1", f"Stripe payout to bank"),
        (amount, 'Credit', 'Stripe Clearing',                       f"Clear Stripe payout from clearing"),
    ]
    if amount > 0:
        post_je(payout_date, memo, lines)

# Post refund JEs
for r in refunds:
    amount = r['amount'] / 100
    refund_date = datetime.datetime.fromtimestamp(r['created'], tz=datetime.timezone.utc).strftime('%Y-%m-%d')
    memo_key = f"stripe refund {r['id'][:12].lower()}"
    already_booked = any(memo_key in note for note in existing_je_notes)
    if already_booked:
        print(f"  — Already booked refund ${amount:.2f}")
        continue
    memo = f"Stripe refund {r['id'][:16]} - ${amount:.2f}"
    lines = [
        (amount, 'Debit',  'Sales',           f"Revenue reversal - Stripe refund"),
        (amount, 'Credit', 'Stripe Clearing', f"Stripe refund to customer"),
    ]
    if amount > 0:
        post_je(refund_date, memo, lines)

if not journal_entries_posted:
    print("  — No new transactions to book (all already booked or no activity)")

# ── Anomaly Detection ────────────────────────────────────────────────────────
print("Step 5: Checking for anomalies...")
anomalies = []

# 1. Stripe Clearing drift: QBO Stripe Clearing != Stripe available+pending
expected_clearing = stripe_available + stripe_pending
clearing_drift = stripe_clearing - expected_clearing
if abs(clearing_drift) > 10.0:
    anomalies.append({
        'type': 'stripe_clearing_drift',
        'severity': 'high',
        'detail': f"Stripe Clearing in QBO: ${stripe_clearing:,.2f} vs Stripe balance (avail+pend): ${expected_clearing:,.2f} | Drift: ${clearing_drift:,.2f}"
    })
    print(f"  ⚠ Stripe Clearing drift: ${clearing_drift:,.2f}")

# 2. Refund rate > 5% of revenue
if total_gross_charges > 0:
    refund_rate = total_refunds / total_gross_charges
    if refund_rate > 0.05:
        anomalies.append({
            'type': 'high_refund_rate',
            'severity': 'medium',
            'detail': f"Refund rate {refund_rate*100:.1f}% (${total_refunds:,.2f} refunds / ${total_gross_charges:,.2f} charges) exceeds 5% threshold"
        })
        print(f"  ⚠ High refund rate: {refund_rate*100:.1f}%")

# 3. Negative Stripe available balance
if stripe_available < 0:
    anomalies.append({
        'type': 'negative_stripe_balance',
        'severity': 'high',
        'detail': f"Stripe available balance is negative: ${stripe_available:,.2f}"
    })
    print(f"  ⚠ Negative Stripe balance: ${stripe_available:,.2f}")

if not anomalies:
    print("  ✓ No anomalies detected")

# ── Step 5: Email Summary ────────────────────────────────────────────────────
print("Step 6: Sending financial summary email...")

report_date = today.strftime('%B %d, %Y')

# Compose HTML email body
anomaly_html = ""
if anomalies:
    anomaly_html = "<h3 style='color:#c0392b'>⚠ Anomalies Detected</h3><ul>"
    for a in anomalies:
        anomaly_html += f"<li><strong>{a['type'].replace('_',' ').title()}</strong> [{a['severity']}]: {a['detail']}</li>"
    anomaly_html += "</ul>"

je_html = ""
if journal_entries_posted:
    je_html = "<h3>Journal Entries Posted Today</h3><ul>"
    for je in journal_entries_posted:
        je_html += f"<li>JE #{je['doc']}: {je['memo']}</li>"
    je_html += "</ul>"
else:
    je_html = "<p><em>No new journal entries needed (no unbooked activity).</em></p>"

html_body = f"""
<html><body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
<h1 style="color:#27ae60">Uncle May's Produce — Daily Financial Report</h1>
<h2>{report_date}</h2>

<h3>QuickBooks P&L — MTD ({mtd_start} to {mtd_end})</h3>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%">
<tr><td><strong>Revenue</strong></td><td style="text-align:right">${revenue:,.2f}</td></tr>
<tr><td><strong>COGS</strong></td><td style="text-align:right">${cogs:,.2f}</td></tr>
<tr><td><strong>Gross Profit</strong></td><td style="text-align:right">${gross_profit:,.2f}</td></tr>
<tr><td><strong>Net Income</strong></td><td style="text-align:right;color:{'red' if net_income < 0 else 'green'}">${net_income:,.2f}</td></tr>
</table>

<h3>QuickBooks Balance Sheet</h3>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%">
<tr><td><strong>Bank x4738</strong></td><td style="text-align:right">${bank_balance:,.2f}</td></tr>
<tr><td><strong>Stripe Clearing</strong></td><td style="text-align:right;color:{'red' if stripe_clearing < 0 else 'black'}">${stripe_clearing:,.2f}</td></tr>
<tr><td><strong>Total Assets</strong></td><td style="text-align:right">${total_assets:,.2f}</td></tr>
<tr><td><strong>Net Equity</strong></td><td style="text-align:right;color:{'red' if net_equity < 0 else 'green'}">${net_equity:,.2f}</td></tr>
</table>

<h3>Stripe Activity — Last 24 Hours</h3>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%">
<tr><td><strong>Available Balance</strong></td><td style="text-align:right">${stripe_available:,.2f}</td></tr>
<tr><td><strong>Pending Balance</strong></td><td style="text-align:right">${stripe_pending:,.2f}</td></tr>
<tr><td><strong>Charges (24h)</strong></td><td style="text-align:right">{len(succeeded_charges)} — ${total_gross_charges:,.2f} gross</td></tr>
<tr><td><strong>Stripe Fees (24h)</strong></td><td style="text-align:right">${total_stripe_fees:,.2f}</td></tr>
<tr><td><strong>Net to Clearing (24h)</strong></td><td style="text-align:right">${total_net_charges:,.2f}</td></tr>
<tr><td><strong>Payouts (24h)</strong></td><td style="text-align:right">{len(payouts)} — ${total_payouts:,.2f}</td></tr>
<tr><td><strong>Refunds (24h)</strong></td><td style="text-align:right">{len(refunds)} — ${total_refunds:,.2f}</td></tr>
</table>

{je_html}
{anomaly_html}

<p style="color:#888;font-size:12px">Generated by Bookkeeper agent at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} CT</p>
</body></html>
"""

# Get Gmail access token
def get_gmail_token():
    body = urllib.parse.urlencode({
        'client_id': GMAIL_CLIENT_ID,
        'client_secret': GMAIL_CLIENT_SECRET,
        'refresh_token': GMAIL_REFRESH_TOKEN,
        'grant_type': 'refresh_token'
    }).encode()
    req = urllib.request.Request(
        'https://oauth2.googleapis.com/token',
        data=body,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        method='POST'
    )
    resp = json.loads(urllib.request.urlopen(req).read())
    return resp.get('access_token')

def send_gmail(to, subject, html):
    token = get_gmail_token()
    if not token:
        raise Exception("Could not get Gmail token")

    import email.mime.text, email.mime.multipart
    msg = email.mime.multipart.MIMEMultipart('alternative')
    msg['To'] = to
    msg['From'] = 'anthony@unclemays.com'
    msg['Subject'] = subject
    msg.attach(email.mime.text.MIMEText(html, 'html'))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    body = json.dumps({'raw': raw}).encode()
    req = urllib.request.Request(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        data=body,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    resp = json.loads(urllib.request.urlopen(req).read())
    return resp.get('id')

email_status = "not sent"
try:
    subject = f"Uncle May's Produce Daily Financial Report — {report_date}"
    if anomalies:
        subject = f"⚠ {subject} [{len(anomalies)} anomaly/anomalies]"
    msg_id = send_gmail('anthony@unclemays.com', subject, html_body)
    print(f"  ✓ Email sent (Gmail message ID: {msg_id})")
    email_status = f"sent (id={msg_id})"
except Exception as e:
    print(f"  ✗ Email failed: {e}")
    email_status = f"failed: {e}"

# ── Summary ──────────────────────────────────────────────────────────────────
print()
print("=== SUMMARY ===")
print(f"QBO Token: {qbo_token_status}")
print(f"P&L: Revenue ${revenue:,.2f} | Net ${net_income:,.2f}")
print(f"Balance Sheet: Bank ${bank_balance:,.2f} | Stripe Clearing ${stripe_clearing:,.2f}")
print(f"Stripe (24h): {len(succeeded_charges)} charges ${total_gross_charges:,.2f} | {len(payouts)} payouts ${total_payouts:,.2f} | {len(refunds)} refunds ${total_refunds:,.2f}")
print(f"JEs Posted: {len(journal_entries_posted)}")
print(f"Anomalies: {len(anomalies)}")
print(f"Email: {email_status}")

# Output structured result for the heartbeat
RESULT = {
    "qbo_token": qbo_token_status,
    "pnl": {"revenue": revenue, "cogs": cogs, "gross_profit": gross_profit, "net_income": net_income},
    "balance_sheet": {"bank": bank_balance, "stripe_clearing": stripe_clearing, "total_assets": total_assets, "net_equity": net_equity},
    "stripe": {
        "available": stripe_available,
        "pending": stripe_pending,
        "charges_count": len(succeeded_charges),
        "charges_gross": total_gross_charges,
        "charges_fees": total_stripe_fees,
        "charges_net": total_net_charges,
        "payouts_count": len(payouts),
        "payouts_total": total_payouts,
        "refunds_count": len(refunds),
        "refunds_total": total_refunds
    },
    "journal_entries": journal_entries_posted,
    "anomalies": anomalies,
    "email_status": email_status
}

with open('/tmp/daily-report-result.json', 'w') as f:
    json.dump(RESULT, f, indent=2)

print()
print("Done. Result saved to /tmp/daily-report-result.json")
