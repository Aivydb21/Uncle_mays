"""Verify Antoinette's true order count - charges/invoices/mart all together."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.error

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

def q(sql, label):
    try:
        req = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries",
            data=json.dumps({"query": sql, "useLegacySql": False, "timeoutMs": 60000}).encode(),
            headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"},
            method="POST",
        )
        resp = json.loads(urllib.request.urlopen(req).read())
        fields = [f["name"] for f in resp.get("schema", {}).get("fields", [])]
        return [{fields[i]: c.get("v") for i, c in enumerate(r["f"])} for r in resp.get("rows", [])]
    except urllib.error.HTTPError as e:
        print(f"[{label}] {e.code}: {e.read().decode()[:500]}")
        return []

def show(label, sql):
    print(f"\n=== {label} ===")
    for r in q(sql, label): print(" ", r)

ANTOINETTE = "cus_ULJyKTMGarnSZy"

# All Stripe charges for Antoinette
show("Antoinette charges", f"""
SELECT * FROM `uncle-mays-automation.stripe_raw.charges`
WHERE customer_id = '{ANTOINETTE}'
LIMIT 20
""")

# All Stripe invoices for Antoinette
show("Antoinette invoices", f"""
SELECT * FROM `uncle-mays-automation.stripe_raw.invoices`
WHERE customer_id = '{ANTOINETTE}'
LIMIT 20
""")

# mart_orders for Antoinette - no filter
show("Antoinette ALL mart_orders rows", f"""
SELECT payment_intent_id, ordered_at, customer_id, customer_email, customer_name,
       ROUND(gross_revenue_dollars,2) revenue, channel
FROM `uncle-mays-automation.uncle_mays_dbt_core.mart_orders`
WHERE customer_id = '{ANTOINETTE}'
   OR LOWER(customer_name) LIKE '%antoinette%'
   OR LOWER(customer_email) LIKE '%antoinette%'
ORDER BY ordered_at
""")

# Schema check
show("charges schema", """
SELECT column_name FROM `uncle-mays-automation.stripe_raw`.INFORMATION_SCHEMA.COLUMNS
WHERE table_name = 'charges' ORDER BY ordinal_position
""")
