"""Quick BigQuery exploration: datasets, table shapes, sample insights."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.parse

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

def query(sql: str):
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries",
        data=json.dumps({"query": sql, "useLegacySql": False, "timeoutMs": 30000}).encode(),
        headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"},
        method="POST",
    )
    return json.loads(urllib.request.urlopen(req).read())

def rows(resp):
    fields = [f["name"] for f in resp.get("schema", {}).get("fields", [])]
    out = []
    for r in resp.get("rows", []):
        out.append({fields[i]: c.get("v") for i, c in enumerate(r["f"])})
    return out

print("=== ALL DATASETS in", PROJECT, "===")
url = f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/datasets"
req = urllib.request.Request(url, headers={"Authorization": f"Bearer {creds.token}"})
ds = json.loads(urllib.request.urlopen(req).read())
for d in ds.get("datasets", []):
    did = d["datasetReference"]["datasetId"]
    # tables in this dataset
    turl = f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/datasets/{did}/tables"
    treq = urllib.request.Request(turl, headers={"Authorization": f"Bearer {creds.token}"})
    try:
        tt = json.loads(urllib.request.urlopen(treq).read())
        ts = tt.get("tables", [])
        print(f"  {did}: {len(ts)} tables -> {', '.join(t['tableReference']['tableId'] for t in ts)}")
    except Exception as e:
        print(f"  {did}: error {e}")

print()
print("=== STRIPE: charges date range, total revenue, top customers ===")
r = rows(query(f"""
SELECT
  MIN(DATE(TIMESTAMP_SECONDS(created))) AS first_charge,
  MAX(DATE(TIMESTAMP_SECONDS(created))) AS last_charge,
  COUNT(*) AS n_charges,
  SUM(CASE WHEN status='succeeded' AND paid THEN amount ELSE 0 END)/100.0 AS gross_succeeded_usd,
  SUM(CASE WHEN status='succeeded' AND paid THEN amount_refunded ELSE 0 END)/100.0 AS refunded_usd
FROM `{PROJECT}.stripe_raw.charges`
"""))
for row in r: print(" ", row)

print()
print("=== STRIPE: charges by status ===")
r = rows(query(f"SELECT status, COUNT(*) AS n, SUM(amount)/100.0 AS total_usd FROM `{PROJECT}.stripe_raw.charges` GROUP BY status ORDER BY n DESC"))
for row in r: print(" ", row)

print()
print("=== STRIPE: subscriptions by status ===")
r = rows(query(f"SELECT status, COUNT(*) AS n FROM `{PROJECT}.stripe_raw.subscriptions` GROUP BY status ORDER BY n DESC"))
for row in r: print(" ", row)

print()
print("=== STRIPE: checkout_sessions by status + payment_status ===")
r = rows(query(f"SELECT status, payment_status, COUNT(*) AS n FROM `{PROJECT}.stripe_raw.checkout_sessions` GROUP BY status, payment_status ORDER BY n DESC"))
for row in r: print(" ", row)

print()
print("=== ADS: Meta last 14 days summary ===")
r = rows(query(f"""
SELECT
  date_start,
  SUM(CAST(spend AS FLOAT64)) AS spend,
  SUM(CAST(impressions AS INT64)) AS impressions,
  SUM(CAST(clicks AS INT64)) AS clicks
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
GROUP BY date_start
ORDER BY date_start DESC
LIMIT 14
"""))
for row in r: print(" ", row)

print()
print("=== ADS: Google last 14 days summary ===")
r = rows(query(f"""
SELECT
  segments_date AS date,
  SUM(metrics_cost_micros)/1e6 AS spend,
  SUM(metrics_impressions) AS impressions,
  SUM(metrics_clicks) AS clicks,
  SUM(metrics_conversions) AS conversions
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
GROUP BY date
ORDER BY date DESC
LIMIT 14
"""))
for row in r: print(" ", row)
