"""BQ exploration v2 — schema-aware queries against actual columns."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.error

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

def query(sql, label=""):
    try:
        req = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries",
            data=json.dumps({"query": sql, "useLegacySql": False, "timeoutMs": 30000}).encode(),
            headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"},
            method="POST",
        )
        resp = json.loads(urllib.request.urlopen(req).read())
        fields = [f["name"] for f in resp.get("schema", {}).get("fields", [])]
        rows = []
        for r in resp.get("rows", []):
            rows.append({fields[i]: c.get("v") for i, c in enumerate(r["f"])})
        return rows
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:300]
        print(f"  [{label}] HTTP {e.code}: {body}")
        return []

def show(label, sql):
    print(f"\n=== {label} ===")
    rs = query(sql, label)
    for r in rs: print(" ", r)

# --- schemas first ---
print("=== stripe_raw.charges columns ===")
for r in query("SELECT column_name, data_type FROM `uncle-mays-automation.stripe_raw.INFORMATION_SCHEMA.COLUMNS` WHERE table_name='charges' ORDER BY ordinal_position"):
    print(f"  {r['column_name']:30} {r['data_type']}")

print("\n=== ga4 events table sample columns ===")
for r in query("SELECT column_name, data_type FROM `uncle-mays-automation.analytics_494626869.INFORMATION_SCHEMA.COLUMNS` WHERE table_name='events_20260506' ORDER BY ordinal_position LIMIT 15"):
    print(f"  {r['column_name']:30} {r['data_type']}")

# --- dbt mart shapes ---
print("\n=== dbt mart_orders shape ===")
for r in query("SELECT column_name, data_type FROM `uncle-mays-automation.uncle_mays_dbt_core.INFORMATION_SCHEMA.COLUMNS` WHERE table_name='mart_orders' ORDER BY ordinal_position"):
    print(f"  {r['column_name']:30} {r['data_type']}")

# --- now the actual data ---
show("Stripe charges, top-line", """
SELECT
  COUNT(*) AS n_charges,
  COUNTIF(status='succeeded' AND paid) AS n_succeeded,
  ROUND(SUM(IF(status='succeeded' AND paid, amount, 0))/100.0, 2) AS gross_succeeded_usd,
  ROUND(SUM(IF(status='succeeded' AND paid, amount_refunded, 0))/100.0, 2) AS refunded_usd
FROM `uncle-mays-automation.stripe_raw.charges`
""")

show("Stripe subscriptions by status", "SELECT status, COUNT(*) AS n FROM `uncle-mays-automation.stripe_raw.subscriptions` GROUP BY status ORDER BY n DESC")

show("Stripe checkout_sessions funnel", """
SELECT status, payment_status, COUNT(*) AS n
FROM `uncle-mays-automation.stripe_raw.checkout_sessions`
GROUP BY status, payment_status ORDER BY n DESC
""")

show("dbt mart_orders, last 14 days", """
SELECT * FROM `uncle-mays-automation.uncle_mays_dbt_core.mart_orders` ORDER BY 1 DESC LIMIT 5
""")

show("dbt mart_retention, sample", "SELECT * FROM `uncle-mays-automation.uncle_mays_dbt_core.mart_retention` LIMIT 5")

show("dbt mart_channel_performance, sample", "SELECT * FROM `uncle-mays-automation.uncle_mays_dbt_marketing.mart_channel_performance` ORDER BY 1 DESC LIMIT 7")

show("dbt mart_order_attribution, sample", "SELECT * FROM `uncle-mays-automation.uncle_mays_dbt_marketing.mart_order_attribution` LIMIT 5")

show("dbt rpt_ceo_weekly, latest", "SELECT * FROM `uncle-mays-automation.uncle_mays_dbt_reporting.rpt_ceo_weekly` ORDER BY 1 DESC LIMIT 3")

show("dbt rpt_cro_weekly, latest", "SELECT * FROM `uncle-mays-automation.uncle_mays_dbt_reporting.rpt_cro_weekly` ORDER BY 1 DESC LIMIT 3")

show("GA4: total events last 8 days", """
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS day,
  COUNT(*) AS events,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `uncle-mays-automation.analytics_494626869.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260429' AND '20260506'
GROUP BY day ORDER BY day
""")

show("GA4: top event names last 8 days", """
SELECT event_name, COUNT(*) AS n
FROM `uncle-mays-automation.analytics_494626869.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260429' AND '20260506'
GROUP BY event_name ORDER BY n DESC LIMIT 15
""")
