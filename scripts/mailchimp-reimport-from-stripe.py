"""Rebuild the Mailchimp audience from Stripe customers.

The Mailchimp audience was wiped during the 2026-04-10 lockdown lift and
never rebuilt — it's down to 9 members. Meanwhile Stripe has the real
customer list. This script pulls every Stripe customer with a valid
email, and upserts them into the Mailchimp audience so abandoned-cart
recovery and welcome automations have someone to send to.

Idempotent: Mailchimp's PUT members endpoint upserts by email hash, so
re-running does not create duplicates or reset unsubscribes.

Usage:
    python scripts/mailchimp-reimport-from-stripe.py           # dry run
    python scripts/mailchimp-reimport-from-stripe.py --write   # actually import
"""
import json, sys, base64, hashlib, urllib.request, urllib.error, urllib.parse
from pathlib import Path
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HOME = Path.home()
DRY_RUN = "--write" not in sys.argv

stripe_cfg = json.load(open(HOME / ".claude/stripe-config.json"))
mc_cfg = json.load(open(HOME / ".claude/mailchimp-config.json"))
STRIPE_KEY = stripe_cfg.get("api_key") or stripe_cfg.get("secret_key")
MC_KEY = mc_cfg["api_key"]
MC_BASE = mc_cfg.get("base_url", "https://us19.api.mailchimp.com/3.0")
LIST_ID = mc_cfg.get("list_id", "2645503d11")

def stripe_http(path):
    auth = "Basic " + base64.b64encode((STRIPE_KEY + ":").encode()).decode()
    req = urllib.request.Request(f"https://api.stripe.com/v1{path}", headers={"Authorization": auth})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def mc_put_member(email, first, last, tags):
    auth = "Basic " + base64.b64encode(f"x:{MC_KEY}".encode()).decode()
    hashed = hashlib.md5(email.lower().encode()).hexdigest()
    url = f"{MC_BASE}/lists/{LIST_ID}/members/{hashed}"
    body = {
        "email_address": email,
        "status_if_new": "subscribed",
        "merge_fields": {k: v for k, v in {"FNAME": first, "LNAME": last}.items() if v},
        "tags": tags,
    }
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, method="PUT", data=data,
        headers={"Authorization": auth, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.read().decode()[:200]}"

# 1. Pull all Stripe customers (paginate)
print("Fetching Stripe customers…")
customers = []
starting_after = None
while True:
    path = "/customers?limit=100" + (f"&starting_after={starting_after}" if starting_after else "")
    r = stripe_http(path)
    customers += r.get("data", [])
    if r.get("has_more") and customers:
        starting_after = customers[-1]["id"]
    else:
        break
    if len(customers) > 5000:
        break
print(f"  {len(customers)} Stripe customers")

# 2. Filter to customers with email, dedupe
by_email = {}
for c in customers:
    email = (c.get("email") or "").strip().lower()
    if not email or "@" not in email:
        continue
    if email in by_email:
        continue
    name = (c.get("name") or "").strip()
    parts = name.split(" ", 1) if name else ["", ""]
    first = parts[0] if parts else ""
    last = parts[1] if len(parts) > 1 else ""
    by_email[email] = {"email": email, "first": first, "last": last, "created": c.get("created")}

print(f"  {len(by_email)} unique email addresses")

# 3. Tag strategy: everyone gets "stripe-customer"; separate tags by recency
#    so Mailchimp automations can segment.
now = datetime.now().timestamp()
upserts = []
for email, rec in by_email.items():
    created = rec.get("created") or 0
    days_since = (now - created) / 86400 if created else 9999
    tags = ["stripe-customer"]
    if days_since <= 90:
        tags.append("customer-last-90d")
    if days_since <= 30:
        tags.append("customer-last-30d")
    upserts.append({**rec, "tags": tags})

# 4. Execute
print(f"\n{'DRY RUN' if DRY_RUN else 'WRITING'} — {len(upserts)} upserts")
if DRY_RUN:
    print("  Sample first 5:")
    for u in upserts[:5]:
        print(f"    {u['email']:<40} {u['first']} {u['last']:<20} tags={u['tags']}")
    print(f"\nRe-run with --write to push to Mailchimp.")
    sys.exit(0)

ok = 0
failed = []
for i, u in enumerate(upserts):
    if i % 25 == 0:
        print(f"  {i}/{len(upserts)}")
    result, err = mc_put_member(u["email"], u["first"], u["last"], u["tags"])
    if err:
        failed.append((u["email"], err))
    else:
        ok += 1

print(f"\nDone. {ok} upserted, {len(failed)} failed.")
for email, err in failed[:20]:
    print(f"  FAIL {email}: {err}")
