#!/usr/bin/env python3
"""Pull failed Stripe PaymentIntents in the last 7 days, dedup by email,
write JSON for the feedback-email drafting step.

The site uses embedded Stripe Elements (PaymentElement), so a "failed
checkout" = a PaymentIntent whose status is anything other than `succeeded`
within the window (requires_payment_method, requires_confirmation,
requires_action, processing, canceled). We pull the email from receipt_email
first, then fall back to shipping.name + charges metadata.
"""
import json, os, urllib.request, urllib.parse, time, base64
from datetime import datetime, timezone

cfg = json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))
api = cfg['api_key']
base = cfg['base_url']

since = int(time.time()) - 7 * 86400

INTERNAL_EMAILS = {
    'anthony@unclemays.com', 'info@unclemays.com', 'invest@unclemays.com',
    'investmentrelations@unclemays.com', 'rosalind@unclemays.com',
    'denise@unclemays.com', 'timj@unclemays.com', 'anthonypivy@gmail.com',
}

def stripe_get(path, params=None):
    qs = '?' + urllib.parse.urlencode(params, doseq=True) if params else ''
    req = urllib.request.Request(base + path + qs)
    auth = base64.b64encode((api + ':').encode()).decode()
    req.add_header('Authorization', 'Basic ' + auth)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

intents = []
starting_after = None
while True:
    params = [('created[gte]', since), ('limit', 100)]
    if starting_after:
        params.append(('starting_after', starting_after))
    resp = stripe_get('/payment_intents', params)
    data = resp.get('data', [])
    intents.extend(data)
    if not resp.get('has_more') or not data:
        break
    starting_after = data[-1]['id']

print(f'Total PaymentIntents in window: {len(intents)}', flush=True)

statuses = {}
for pi in intents:
    statuses[pi.get('status')] = statuses.get(pi.get('status'), 0) + 1
print(f'Status breakdown: {statuses}', flush=True)

failed = []
for pi in intents:
    if pi.get('status') == 'succeeded':
        continue
    email = pi.get('receipt_email')
    shipping = pi.get('shipping') or {}
    name = shipping.get('name')
    phone = shipping.get('phone')

    # Try latest_charge for billing details
    if not email and pi.get('latest_charge'):
        try:
            charge = stripe_get(f"/charges/{pi['latest_charge']}")
            bd = charge.get('billing_details') or {}
            email = bd.get('email') or email
            name = bd.get('name') or name
            phone = bd.get('phone') or phone
        except Exception:
            pass

    if not email or email.lower() in INTERNAL_EMAILS:
        continue

    md = pi.get('metadata') or {}
    failed.append({
        'id': pi['id'],
        'email': email,
        'name': name,
        'phone': phone,
        'status': pi.get('status'),
        'amount': pi.get('amount'),
        'currency': pi.get('currency'),
        'created': pi.get('created'),
        'created_iso': datetime.fromtimestamp(pi.get('created'), tz=timezone.utc).isoformat(),
        'last_payment_error': (pi.get('last_payment_error') or {}).get('message'),
        'metadata': md,
        'description': pi.get('description'),
    })

by_email = {}
for f in sorted(failed, key=lambda x: x['created'], reverse=True):
    key = f['email'].lower()
    if key not in by_email:
        by_email[key] = f

print(f'Failed PaymentIntents: {len(failed)}', flush=True)
print(f'Unique emails:         {len(by_email)}', flush=True)

out = sorted(by_email.values(), key=lambda x: x['created'], reverse=True)
out_path = os.path.join(os.environ.get('TEMP', '.'), 'failed-checkouts-7d.json')
with open(out_path, 'w', encoding='utf-8') as fh:
    json.dump(out, fh, indent=2, default=str)
print(f'Saved: {out_path}', flush=True)

print()
print(f'{"Email":<40} {"Name":<22} {"Status":<28} {"Amount":<10}')
print('-' * 102)
for f in out:
    amt = f"${(f['amount'] or 0)/100:.2f}"
    nm = (f['name'] or '-')[:20]
    st = (f['status'] or '-')[:26]
    print(f"{f['email']:<40} {nm:<22} {st:<28} {amt:<10}")
