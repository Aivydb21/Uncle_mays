"""7-day pulse, v2 with correct column names."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.error

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

START, END = "2026-05-02", "2026-05-08"
PRIOR_START, PRIOR_END = "2026-04-25", "2026-05-01"

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
        return [{fields[i]: c.get("v") for i, c in enumerate(r["f"])} for r in resp.get("rows", [])]
    except urllib.error.HTTPError as e:
        print(f"  [{label}] HTTP {e.code}: {e.read().decode()[:300]}")
        return []

def show(label, sql):
    print(f"\n=== {label} ===")
    for r in query(sql, label): print(" ", r)

show("STRIPE: revenue this week vs prior", f"""
SELECT
  CASE WHEN DATE(created_at) BETWEEN '{START}' AND '{END}' THEN 'this_week'
       WHEN DATE(created_at) BETWEEN '{PRIOR_START}' AND '{PRIOR_END}' THEN 'prior_week' END AS bucket,
  COUNT(*) AS n_charges,
  COUNTIF(status='succeeded' AND paid) AS n_succeeded,
  ROUND(SUM(IF(status='succeeded' AND paid, amount_cents, 0))/100.0, 2) AS gross_usd
FROM `{PROJECT}.stripe_raw.charges`
WHERE DATE(created_at) BETWEEN '{PRIOR_START}' AND '{END}'
GROUP BY bucket ORDER BY bucket
""")

show("STRIPE: daily revenue, last 7d", f"""
SELECT DATE(created_at) AS d,
  COUNTIF(status='succeeded' AND paid) AS n_succ,
  ROUND(SUM(IF(status='succeeded' AND paid, amount_cents, 0))/100.0, 2) AS gross_usd,
  COUNTIF(status='failed') AS n_failed
FROM `{PROJECT}.stripe_raw.charges`
WHERE DATE(created_at) BETWEEN '{START}' AND '{END}'
GROUP BY d ORDER BY d
""")

show("STRIPE: checkout sessions funnel, last 7d", f"""
SELECT mode, status, payment_status, COUNT(*) AS n,
       ROUND(SUM(amount_total_cents)/100.0, 2) AS total_usd
FROM `{PROJECT}.stripe_raw.checkout_sessions`
WHERE DATE(created_at) BETWEEN '{START}' AND '{END}'
GROUP BY mode, status, payment_status ORDER BY n DESC
""")

show("STRIPE: new vs returning, last 7d", f"""
WITH first_charge AS (
  SELECT customer_id, MIN(DATE(created_at)) AS first_d
  FROM `{PROJECT}.stripe_raw.charges`
  WHERE status='succeeded' AND paid AND customer_id IS NOT NULL
  GROUP BY customer_id
)
SELECT
  CASE WHEN fc.first_d BETWEEN '{START}' AND '{END}' THEN 'new' ELSE 'returning' END AS cohort,
  COUNT(DISTINCT c.customer_id) AS customers,
  COUNT(*) AS charges,
  ROUND(SUM(c.amount_cents)/100.0, 2) AS gross_usd
FROM `{PROJECT}.stripe_raw.charges` c
LEFT JOIN first_charge fc USING (customer_id)
WHERE c.status='succeeded' AND c.paid
  AND DATE(c.created_at) BETWEEN '{START}' AND '{END}'
GROUP BY cohort
""")

show("STRIPE: subscriptions by status (current)", f"""
SELECT status, COUNT(*) AS n, ROUND(AVG(price_amount_cents)/100.0, 2) AS avg_price_usd
FROM `{PROJECT}.stripe_raw.subscriptions` GROUP BY status ORDER BY n DESC
""")

show("STRIPE: active subscription details", f"""
SELECT subscription_id, customer_id, status, price_amount_cents/100.0 AS price_usd,
       price_interval, DATE(created_at) AS started, DATE(current_period_end) AS renews,
       cancel_at_period_end
FROM `{PROJECT}.stripe_raw.subscriptions`
WHERE status IN ('active','trialing','past_due')
ORDER BY created_at
""")

show("META ADS: this week vs prior", f"""
SELECT
  CASE WHEN PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}' THEN 'this_week'
       WHEN PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{PRIOR_START}' AND DATE '{PRIOR_END}' THEN 'prior_week' END AS bucket,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impr,
  SUM(clicks) AS clicks,
  SUM(add_to_cart) AS atc,
  SUM(initiate_checkout) AS ic,
  SUM(purchases) AS purch,
  ROUND(SUM(purchase_value_usd), 2) AS purch_value
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{PRIOR_START}' AND DATE '{END}'
GROUP BY bucket ORDER BY bucket
""")

show("META ADS: daily this week", f"""
SELECT date AS d,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impr, SUM(clicks) AS clicks,
  SUM(add_to_cart) AS atc, SUM(initiate_checkout) AS ic,
  SUM(purchases) AS purch, ROUND(SUM(purchase_value_usd), 2) AS purch_value,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS cpc
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}'
GROUP BY d ORDER BY d
""")

show("META ADS: top campaigns this week", f"""
SELECT campaign_name,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(clicks) AS clicks, SUM(impressions) AS impr,
  SUM(add_to_cart) AS atc, SUM(initiate_checkout) AS ic, SUM(purchases) AS purch,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS cpc
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}'
GROUP BY campaign_name ORDER BY spend DESC LIMIT 10
""")

show("GOOGLE ADS: this week vs prior", f"""
SELECT
  CASE WHEN PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}' THEN 'this_week'
       WHEN PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{PRIOR_START}' AND DATE '{PRIOR_END}' THEN 'prior_week' END AS bucket,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impr, SUM(clicks) AS clicks,
  ROUND(SUM(conversions), 2) AS conv,
  ROUND(SUM(conversion_value), 2) AS conv_value
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{PRIOR_START}' AND DATE '{END}'
GROUP BY bucket ORDER BY bucket
""")

show("GOOGLE ADS: daily this week", f"""
SELECT date AS d,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impr, SUM(clicks) AS clicks,
  ROUND(SUM(conversions), 2) AS conv,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS cpc
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}'
GROUP BY d ORDER BY d
""")

show("GOOGLE ADS: top campaigns this week", f"""
SELECT campaign_name, campaign_status, channel_type,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impr, SUM(clicks) AS clicks,
  ROUND(SUM(conversions), 2) AS conv,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS cpc
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}'
GROUP BY campaign_name, campaign_status, channel_type
ORDER BY spend DESC LIMIT 10
""")

show("BLENDED: paid spend vs revenue, this week", f"""
WITH meta AS (
  SELECT SUM(spend_usd) AS spend FROM `{PROJECT}.ads_raw.meta_campaign_insights`
  WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}'
), gads AS (
  SELECT SUM(spend_usd) AS spend FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
  WHERE PARSE_DATE('%Y-%m-%d', date) BETWEEN DATE '{START}' AND DATE '{END}'
), rev AS (
  SELECT SUM(IF(status='succeeded' AND paid, amount_cents, 0))/100.0 AS gross
  FROM `{PROJECT}.stripe_raw.charges`
  WHERE DATE(created_at) BETWEEN '{START}' AND '{END}'
)
SELECT ROUND(meta.spend,2) AS meta_spend, ROUND(gads.spend,2) AS gads_spend,
       ROUND(meta.spend + gads.spend, 2) AS total_paid_spend,
       ROUND(rev.gross, 2) AS gross_revenue,
       ROUND(SAFE_DIVIDE(rev.gross, meta.spend + gads.spend), 2) AS blended_roas
FROM meta, gads, rev
""")

print("\n=== DONE ===")
