"""
UNC-879: Diagnose pre-/shop drop-off
Why do 75% of paid sessions never reach the catalog?

Three queries:
1. Landing page URL distribution by source/medium (Meta paid + all sources)
2. First page for sessions with no /shop page_view
3. Bounce analysis for homepage sessions that never navigate onward
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request

from google.auth.transport.requests import Request
from google.oauth2 import service_account

PROJECT = "uncle-mays-automation"
DATASET = "analytics_494626869"
# GA4 BQ export starts 2026-04-29; pull full window
START = "20260429"
END   = "20260510"  # inclusive upper bound

SA_PATH = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=["https://www.googleapis.com/auth/bigquery"]
)
creds.refresh(Request())


def bq_query(sql: str) -> list[dict]:
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json",
    }
    body = json.dumps({"query": sql, "useLegacySql": False, "maxResults": 5000}).encode()
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries",
        data=body,
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        first = json.load(r)
    if first.get("errors"):
        raise RuntimeError(f"BQ failed: {first['errors']}")
    fields = [f["name"] for f in first.get("schema", {}).get("fields", [])]
    rows = []
    for row in first.get("rows", []) or []:
        rows.append({fields[i]: c.get("v") for i, c in enumerate(row["f"])})

    job_ref = first.get("jobReference", {})
    job_id = job_ref.get("jobId")
    location = job_ref.get("location", "US")
    page_token = first.get("pageToken")
    while page_token:
        params = urllib.parse.urlencode({"pageToken": page_token, "maxResults": 5000, "location": location})
        req2 = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries/{job_id}?{params}",
            headers={"Authorization": f"Bearer {creds.token}"},
        )
        with urllib.request.urlopen(req2, timeout=180) as r:
            more = json.load(r)
        for row in more.get("rows", []) or []:
            rows.append({fields[i]: c.get("v") for i, c in enumerate(row["f"])})
        page_token = more.get("pageToken")
    return rows


# ──────────────────────────────────────────────────────────────────────────────
# Q1: Landing page distribution for Meta paid sessions (cpc / paidsocial)
# ──────────────────────────────────────────────────────────────────────────────
Q1 = f"""
WITH sessions AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value  FROM UNNEST(event_params) WHERE key='ga_session_id') AS ga_session_id,
    MIN(event_timestamp) AS session_start_us,
    ANY_VALUE(traffic_source.source)  AS ts_source,
    ANY_VALUE(traffic_source.medium)  AS ts_medium,
    ANY_VALUE(collected_traffic_source.manual_source)  AS cs_source,
    ANY_VALUE(collected_traffic_source.manual_medium)  AS cs_medium,
    ANY_VALUE(collected_traffic_source.manual_campaign_name) AS campaign,
    -- First page_view in the session
    ARRAY_AGG(
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location')
      IGNORE NULLS
      ORDER BY event_timestamp LIMIT 1
    )[SAFE_OFFSET(0)] AS landing_url
  FROM `{PROJECT}.{DATASET}.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '{START}' AND '{END}'
    AND event_name IN ('session_start','page_view','first_visit')
  GROUP BY user_pseudo_id, ga_session_id
)
SELECT
  -- normalise landing URL to path
  REGEXP_REPLACE(
    REGEXP_REPLACE(landing_url, r'^https?://[^/]+', ''),
    r'\?.*$', ''
  ) AS landing_path,
  ts_source,
  ts_medium,
  cs_source,
  cs_medium,
  campaign,
  COUNT(*) AS sessions
FROM sessions
WHERE TRUE
GROUP BY 1,2,3,4,5,6
ORDER BY sessions DESC
LIMIT 100
"""

# ──────────────────────────────────────────────────────────────────────────────
# Q2: For sessions that never hit /shop — what was the first page?
#     Break out by source/medium.
# ──────────────────────────────────────────────────────────────────────────────
Q2 = f"""
WITH events AS (
  SELECT
    user_pseudo_id,
    event_name,
    (SELECT value.int_value  FROM UNNEST(event_params) WHERE key='ga_session_id') AS ga_session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location') AS page_location,
    traffic_source.source AS ts_source,
    traffic_source.medium AS ts_medium,
    event_timestamp
  FROM `{PROJECT}.{DATASET}.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '{START}' AND '{END}'
),
sessions AS (
  SELECT
    user_pseudo_id,
    ga_session_id,
    ANY_VALUE(ts_source) AS ts_source,
    ANY_VALUE(ts_medium) AS ts_medium,
    COUNTIF(event_name='page_view') AS pv_count,
    COUNTIF(
      event_name='page_view'
      AND REGEXP_CONTAINS(page_location, r'/shop')
    ) AS shop_pvs,
    ARRAY_AGG(
      IF(event_name='page_view', page_location, NULL)
      IGNORE NULLS ORDER BY event_timestamp LIMIT 1
    )[SAFE_OFFSET(0)] AS first_pv_url
  FROM events
  GROUP BY user_pseudo_id, ga_session_id
)
SELECT
  REGEXP_REPLACE(
    REGEXP_REPLACE(first_pv_url, r'^https?://[^/]+', ''),
    r'\?.*$', ''
  ) AS first_page_path,
  ts_source,
  ts_medium,
  COUNT(*) AS sessions,
  COUNTIF(shop_pvs = 0) AS no_shop_sessions,
  COUNTIF(pv_count = 1) AS single_pv_sessions,
  ROUND(COUNTIF(shop_pvs = 0)/COUNT(*)*100, 1) AS pct_no_shop
FROM sessions
GROUP BY 1,2,3
ORDER BY sessions DESC
LIMIT 80
"""

# ──────────────────────────────────────────────────────────────────────────────
# Q3: For Meta paid sessions that landed on homepage (not /shop),
#     what did they do next? Page sequence.
# ──────────────────────────────────────────────────────────────────────────────
Q3 = f"""
WITH events AS (
  SELECT
    user_pseudo_id,
    event_name,
    (SELECT value.int_value  FROM UNNEST(event_params) WHERE key='ga_session_id') AS ga_session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location') AS page_location,
    traffic_source.source  AS ts_source,
    traffic_source.medium  AS ts_medium,
    event_timestamp,
    ROW_NUMBER() OVER (
      PARTITION BY user_pseudo_id,
                   (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id')
      ORDER BY event_timestamp
    ) AS ev_seq
  FROM `{PROJECT}.{DATASET}.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '{START}' AND '{END}'
    AND event_name = 'page_view'
),
meta_sessions AS (
  SELECT DISTINCT user_pseudo_id, ga_session_id
  FROM events
  WHERE (LOWER(ts_source) LIKE '%facebook%'
      OR LOWER(ts_source) LIKE '%instagram%'
      OR LOWER(ts_medium) IN ('cpc','paidsocial','paid social','social','paid_social'))
),
homepage_landers AS (
  SELECT e.user_pseudo_id, e.ga_session_id
  FROM events e
  JOIN meta_sessions m USING (user_pseudo_id, ga_session_id)
  WHERE e.ev_seq = 1
    AND REGEXP_REPLACE(REGEXP_REPLACE(e.page_location, r'^https?://[^/]+',''), r'\?.*$','')
        IN ('/', '', '/index', '/index.html')
),
page_seq AS (
  SELECT
    e.user_pseudo_id, e.ga_session_id, e.ev_seq,
    REGEXP_REPLACE(
      REGEXP_REPLACE(e.page_location, r'^https?://[^/]+',''),
      r'\?.*$',''
    ) AS path
  FROM events e
  JOIN homepage_landers h USING (user_pseudo_id, ga_session_id)
)
SELECT
  ev_seq AS page_number,
  path,
  COUNT(*) AS frequency
FROM page_seq
WHERE ev_seq <= 5
GROUP BY 1,2
ORDER BY 1,3 DESC
"""

print("=" * 70)
print("Q1: Landing page distribution by source/medium")
print("=" * 70)
rows1 = bq_query(Q1)
for r in rows1[:40]:
    print(r)

print()
print("=" * 70)
print("Q2: First page vs shop-reach rate, by source/medium")
print("=" * 70)
rows2 = bq_query(Q2)
for r in rows2[:40]:
    print(r)

print()
print("=" * 70)
print("Q3: Page sequence for Meta paid / homepage landers (pages 1-5)")
print("=" * 70)
rows3 = bq_query(Q3)
for r in rows3[:60]:
    print(r)
