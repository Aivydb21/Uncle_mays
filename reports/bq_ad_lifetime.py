"""Lifetime ad performance: total spend, impressions, clicks, CTR, CPC, by campaign."""
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
            data=json.dumps({"query": sql, "useLegacySql": False, "timeoutMs": 60000}).encode(),
            headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"},
            method="POST",
        )
        resp = json.loads(urllib.request.urlopen(req).read())
        fields = [f["name"] for f in resp.get("schema", {}).get("fields", [])]
        return [{fields[i]: c.get("v") for i, c in enumerate(r["f"])} for r in resp.get("rows", [])]
    except urllib.error.HTTPError as e:
        print(f"[{label}] HTTP {e.code}: {e.read().decode()[:300]}")
        return []

def show(label, sql):
    print(f"\n=== {label} ===")
    for r in query(sql, label): print(" ", r)

show("META: lifetime by campaign", f"""
SELECT campaign_name,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impressions,
  SUM(clicks) AS clicks,
  ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions))*100, 2) AS ctr_pct,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS cpc,
  ROUND(SAFE_DIVIDE(SUM(spend_usd)*1000, SUM(impressions)), 2) AS cpm,
  SUM(add_to_cart) AS atc, SUM(initiate_checkout) AS ic, SUM(purchases) AS purch,
  ROUND(SUM(purchase_value_usd), 2) AS purch_value,
  MIN(date) AS first_date, MAX(date) AS last_date
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
GROUP BY campaign_name
ORDER BY spend DESC
""")

show("META: lifetime totals", f"""
SELECT
  ROUND(SUM(spend_usd), 2) AS total_spend,
  SUM(impressions) AS total_impressions,
  SUM(clicks) AS total_clicks,
  ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions))*100, 2) AS overall_ctr_pct,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS overall_cpc,
  ROUND(SAFE_DIVIDE(SUM(spend_usd)*1000, SUM(impressions)), 2) AS overall_cpm,
  SUM(add_to_cart) AS total_atc, SUM(initiate_checkout) AS total_ic, SUM(purchases) AS total_purch
FROM `{PROJECT}.ads_raw.meta_campaign_insights`
""")

show("GOOGLE ADS: lifetime by campaign", f"""
SELECT campaign_name, campaign_status, channel_type,
  ROUND(SUM(spend_usd), 2) AS spend,
  SUM(impressions) AS impressions,
  SUM(clicks) AS clicks,
  ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions))*100, 2) AS ctr_pct,
  ROUND(SAFE_DIVIDE(SUM(spend_usd), SUM(clicks)), 2) AS cpc,
  ROUND(SUM(conversions), 2) AS conv,
  MIN(date) AS first_date, MAX(date) AS last_date
FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
GROUP BY campaign_name, campaign_status, channel_type
ORDER BY spend DESC
""")

show("BLENDED: paid lifetime", f"""
WITH meta AS (
  SELECT SUM(spend_usd) s, SUM(impressions) i, SUM(clicks) c
  FROM `{PROJECT}.ads_raw.meta_campaign_insights`
), gads AS (
  SELECT SUM(spend_usd) s, SUM(impressions) i, SUM(clicks) c
  FROM `{PROJECT}.ads_raw.google_ads_campaign_insights`
)
SELECT
  ROUND(meta.s,2) AS meta_spend, meta.i AS meta_impr, meta.c AS meta_clicks,
  ROUND(gads.s,2) AS gads_spend, gads.i AS gads_impr, gads.c AS gads_clicks,
  ROUND(meta.s+gads.s,2) AS total_spend,
  meta.i + gads.i AS total_impr,
  meta.c + gads.c AS total_clicks,
  ROUND(SAFE_DIVIDE(meta.c+gads.c, meta.i+gads.i)*100, 2) AS blended_ctr_pct,
  ROUND(SAFE_DIVIDE(meta.s+gads.s, meta.c+gads.c), 2) AS blended_cpc
FROM meta, gads
""")
