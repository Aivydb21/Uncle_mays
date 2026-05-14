"""Final round: clean order-level + Google ads."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.error

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

INTERNAL_FILTER = """
  customer_id NOT IN (
    'cus_ULANE7v2APnG42', 'cus_UN9KFkZFAKGnkF',
    'cus_UOeacOxSfcelAu', 'cus_UN8fJjvyuLyWTy'
  )
  AND (customer_email IS NULL OR LOWER(customer_email) NOT LIKE '%@unclemays.com')
"""

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
        print(f"[{label}] {e.code}: {e.read().decode()[:400]}")
        return []

def show(label, sql):
    print(f"\n=== {label} ===")
    for r in q(sql, label): print(" ", r)

show("CLEAN order summary", f"""
SELECT COUNT(*) total_orders, ROUND(AVG(gross_revenue_dollars),2) aov,
       ROUND(APPROX_QUANTILES(gross_revenue_dollars,100)[OFFSET(50)],2) median_order,
       ROUND(SUM(gross_revenue_dollars),2) total_gross
FROM `uncle-mays-automation.uncle_mays_dbt_core.mart_orders`
WHERE {INTERNAL_FILTER}
""")

show("CLEAN order details", f"""
SELECT customer_name, shipping_city, ordered_at,
       ROUND(gross_revenue_dollars,2) revenue, channel, utm_source
FROM `uncle-mays-automation.uncle_mays_dbt_core.mart_orders`
WHERE {INTERNAL_FILTER}
ORDER BY ordered_at DESC
""")

show("Google ads lifetime", """
SELECT ROUND(SUM(spend_usd),2) spend, SUM(impressions) impressions,
       SUM(clicks) clicks, SUM(conversions) conversions,
       ROUND(SUM(conversion_value),2) conversion_value,
       ROUND(SAFE_DIVIDE(SUM(clicks),SUM(impressions))*100,2) ctr_pct,
       ROUND(SAFE_DIVIDE(SUM(spend_usd),SUM(clicks)),2) cpc
FROM `uncle-mays-automation.ads_raw.google_ads_campaign_insights`
""")

show("Meta campaign-level (lifetime)", """
SELECT campaign_name, ROUND(SUM(spend_usd),2) spend, SUM(impressions) imp,
       SUM(clicks) clicks, SUM(reach) reach, SUM(purchases) purchases
FROM `uncle-mays-automation.ads_raw.meta_campaign_insights`
GROUP BY campaign_name
ORDER BY spend DESC
""")
