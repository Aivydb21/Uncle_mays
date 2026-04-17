import json, os, urllib.request, base64

config_path = os.path.expanduser("~/.claude/stripe-config.json")
with open(config_path) as f:
    config = json.load(f)

API_KEY = config["api_key"]

# Get balance
auth = base64.b64encode(f"{API_KEY}:".encode()).decode()
req = urllib.request.Request(
    "https://api.stripe.com/v1/balance",
    headers={"Authorization": f"Basic {auth}"}
)
resp = urllib.request.urlopen(req, timeout=30)
balance = json.loads(resp.read())

print("=== Stripe Balance ===")
for b in balance.get('available', []):
    print(f"Available ({b['currency']}): ${b['amount']/100:.2f}")
for b in balance.get('pending', []):
    print(f"Pending ({b['currency']}): ${b['amount']/100:.2f}")

# Get recent charges (last 7 days)
req = urllib.request.Request(
    "https://api.stripe.com/v1/charges?limit=10",
    headers={"Authorization": f"Basic {auth}"}
)
resp = urllib.request.urlopen(req, timeout=30)
charges = json.loads(resp.read())

print(f"\n=== Recent Charges (last {len(charges.get('data', []))}) ===")
total = 0
for charge in charges.get('data', []):
    amount = charge['amount'] / 100
    created = charge['created']
    desc = charge.get('description', 'No description')
    status = charge.get('status')
    print(f"${amount:.2f} - {desc[:50]} ({status})")
    if status == 'succeeded':
        total += amount

print(f"\nTotal successful charges: ${total:.2f}")
