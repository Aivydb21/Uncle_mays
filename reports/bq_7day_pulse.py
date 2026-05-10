"""7-day company pulse: Stripe, GA4, Meta, Google Ads, dbt marts. Read-only."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.error

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

# Today is 2026-05-09. 7-day window: 2026-05-02 to 2026-05-08 inclusive.
START = "2026-05-02"
END   = "2026-05-08"
GA4_START = "20260502"
GA4_END   = "20260508"
PRIOR_START = "2026-04-25"
PRIOR_END   = "2026-05-01"

def query(sql, label=""):
    try:
        req = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries",
            data=json.dumps({"query": sql, "useLegacySql": False, "timeoutMs": 60000}).encode(),
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
        body = e.read().decode()[:400]
        print(f"  [{label}] HTTP {e.code}: {body}")
        return []
    except Exception as e:
        print(f"  [{label}] ERR: {e}")
        return []

def show(label, sql):
    print(f"\n=== {label} ===")
    for r in query(sql, label): print(" ", r)

print(f"WINDOW: {START} -> {END}  (prior week: {PRIOR_START} -> {PRIOR_END})")

# === STRIPE ===
show("Stripe revenue, this week vs prior", f"""
WITH base AS (
  SELECT DATE(TIMESTAMP_SECONDS(created)) AS d, status, paid, amount, amount_refunded
  FROM `{PROJECT}.stripe_raw.charges`
)
SELECT
  CASE WHEN d BETWEEN '{START}' AND '{END}' THEN 'this_week'
       WHEN d BETWEEN '{PRIOR_START}' AND '{PRIOR_END}' THEN 'prior_week' END AS bucket,
  COUNT(*) AS n_charges,
  COUNTIF(status='succeeded' AND paid) AS n_succeeded,
  ROUND(SUM(IF(status='succeeded' AND paid, amount, 0))/100.0, 2) AS gross_usd,
  ROUND(SUM(IF(status='succeeded' AND paid, amount_refunded, 0))/100.0, 2) AS refunded_usd
FROM base
WHERE d BETWEEN '{PRIOR_START}' AND '{END}'
GROUP BY bucket ORDER BY bucket
""")

show("Stripe daily revenue, last 7 days", f"""
SELECT
  DATE(TIMESTAMP_SECONDS(created)) AS d,
  COUNTIF(status='succeeded' AND paid) AS n,
  ROUND(SUM(IF(status='succeeded' AND paid, amount, 0))/100.0, 2) AS gross_usd
FROM `{PROJECT}.stripe_raw.charges`
WHERE DATE(TIMESTAMP_SECONDS(created)) BETWEEN '{START}' AND '{END}'
GROUP BY d ORDER BY d
""")

show("Stripe subscriptions by status, current", f"""
SELECT status, COUNT(*) AS n
FROM `{PROJECT}.stripe_raw.subscriptions`
GROUP BY status ORDER BY n DESC
""")

show("Stripe checkout sessions, last 7 days funnel", f"""
SELECT status, payment_status, COUNT(*) AS n
FROM `{PROJECT}.stripe_raw.checkout_sessions`
WHERE DATE(TIMESTAMP_SECONDS(created)) BETWEEN '{START}' AND '{END}'
GROUP BY status, payment_status ORDER BY n DESC
""")

show("Stripe new vs returning customers (last 7 days)", f"""
WITH first_charge AS (
  SELECT customer, MIN(DATE(TIMESTAMP_SECONDS(created))) AS first_d
  FROM `{PROJECT}.stripe_raw.charges`
  WHERE status='succeeded' AND paid
  GROUP BY customer
)
SELECT
  CASE WHEN fc.first_d BETWEEN '{START}' AND '{END}' THEN 'new' ELSE 'returning' END AS cohort,
  COUNT(DISTINCT c.customer) AS customers,
  COUNT(*) AS charges,
  ROUND(SUM(c.amount)/100.0, 2) AS gross_usd
FROM `{PROJECT}.stripe_raw.charges` c
LEFT JOIN first_charge fc ON fc.customer = c.customer
WHERE c.status='succeeded' AND c.paid
  AND DATE(TIMESTAMP_SECONDS(c.created)) BETWEEN '{START}' AND '{END}'
GROUP BY cohort
""")

# === META ADS ===
show("Meta ads, this week", f"""
SELECT
  date_start AS d,
  ROUND(SUM(CAST(spend AS FLOAT64)), 2) AS spend,
  SUM(CAST(impressions AS INT64)) AS impressions,
  SUM(CAST(clicks AS INT64)) AS clicks,
  ROUND(SAFE_DIVIDE(SUM(CAST(clicks AS INT64)), SUM(CAST(impressions AS INT64)))*100, 2) AS ctr_pct,
  ROUND(SAFE_DIVIDE(SUM(CAST(spend AS FLOAT64)), SUM(CAST(clicks AS INT64))), 2) AS cpc
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
WHERE date_start BETWEEN '{START}' AND '{END}'
GROUP BY d ORDER BY d
""")

show("Meta totals, this week vs prior", f"""
SELECT
  CASE WHEN date_start BETWEEN '{START}' AND '{END}' THEN 'this_week'
       WHEN date_start BETWEEN '{PRIOR_START}' AND '{PRIOR_END}' THEN 'prior_week' END AS bucket,
  ROUND(SUM(CAST(spend AS FLOAT64)), 2) AS spend,
  SUM(CAST(impressions AS INT64)) AS impressions,
  SUM(CAST(clicks AS INT64)) AS clicks
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
WHERE date_start BETWEEN '{PRIOR_START}' AND '{END}'
GROUP BY bucket ORDER BY bucket
""")

# === GOOGLE ADS ===
show("Google Ads, this week", f"""
SELECT
  segments_date AS d,
  ROUND(SUM(metrics_cost_micros)/1e6, 2) AS spend,
  SUM(metrics_impressions) AS impressions,
  SUM(metrics_clicks) AS clicks,
  ROUND(SUM(metrics_conversions), 2) AS conversions,
  ROUND(SAFE_DIVIDE(SUM(metrics_clicks), SUM(metrics_impressions))*100, 2) AS ctr_pct,
  ROUND(SAFE_DIVIDE(SUM(metrics_cost_micros)/1e6, SUM(metrics_clicks)), 2) AS cpc
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
WHERE segments_date BETWEEN '{START}' AND '{END}'
GROUP BY d ORDER BY d
""")

show("Google Ads totals, this week vs prior", f"""
SELECT
  CASE WHEN segments_date BETWEEN '{START}' AND '{END}' THEN 'this_week'
       WHEN segments_date BETWEEN '{PRIOR_START}' AND '{PRIOR_END}' THEN 'prior_week' END AS bucket,
  ROUND(SUM(metrics_cost_micros)/1e6, 2) AS spend,
  SUM(metrics_impressions) AS impressions,
  SUM(metrics_clicks) AS clicks,
  ROUND(SUM(metrics_conversions), 2) AS conversions
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
WHERE segments_date BETWEEN '{PRIOR_START}' AND '{END}'
GROUP BY bucket ORDER BY bucket
""")

# === GA4 ===
show("GA4 daily traffic, this week", f"""
SELECT
  PARSE_DATE('%Y%m%d', event_date) AS d,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNTIF(event_name='session_start') AS sessions,
  COUNTIF(event_name='page_view') AS pageviews,
  COUNTIF(event_name='begin_checkout') AS begin_checkout,
  COUNTIF(event_name='add_payment_info') AS add_payment_info,
  COUNTIF(event_name='purchase') AS purchases
FROM `{PROJECT}.analytics_494626869.events_*`
WHERE _TABLE_SUFFIX BETWEEN '{GA4_START}' AND '{GA4_END}'
GROUP BY d ORDER BY d
""")

show("GA4 traffic sources (last 7 days)", f"""
SELECT
  COALESCE(traffic_source.source, '(none)') AS source,
  COALESCE(traffic_source.medium, '(none)') AS medium,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNTIF(event_name='session_start') AS sessions,
  COUNTIF(event_name='purchase') AS purchases
FROM `{PROJECT}.analytics_494626869.events_*`
WHERE _TABLE_SUFFIX BETWEEN '{GA4_START}' AND '{GA4_END}'
GROUP BY source, medium ORDER BY users DESC LIMIT 15
""")

show("GA4 top pages (last 7 days)", f"""
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location') AS page,
  COUNT(*) AS pageviews,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM `{PROJECT}.analytics_494626869.events_*`
WHERE _TABLE_SUFFIX BETWEEN '{GA4_START}' AND '{GA4_END}'
  AND event_name='page_view'
GROUP BY page ORDER BY pageviews DESC LIMIT 12
""")

# === DBT MARTS ===
show("rpt_cro_weekly, latest 3", f"""
SELECT * FROM `{PROJECT}.uncle_mays_dbt_reporting.rpt_cro_weekly`
ORDER BY 1 DESC LIMIT 3
""")

show("rpt_ceo_weekly, latest 3", f"""
SELECT * FROM `{PROJECT}.uncle_mays_dbt_reporting.rpt_ceo_weekly`
ORDER BY 1 DESC LIMIT 3
""")

show("mart_channel_performance, last 7 days", f"""
SELECT * FROM `{PROJECT}.uncle_mays_dbt_marketing.mart_channel_performance`
ORDER BY 1 DESC LIMIT 10
""")

print("\n=== DONE ===")
