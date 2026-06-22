"""Build the session-to-conversion funnel mart + attribution fallback in BigQuery.

Destinations (BigQuery TABLES, not views — snapshots refreshed on each run):
  stripe_raw.mart_session_funnel       -- one row per (session, order|null)
  stripe_raw.mart_attribution_fallback -- subset: fallback-matched orders only

Join hierarchy (deterministic priority, documented per Decision Scientist request
2026-05-25 UNC-1326):
  1. ga_client_id_primary  — stripe.ga_client_id = ga4.user_pseudo_id
                              (exact match; no time constraint needed)
  2. fbclid_fallback        — stripe.fbclid = fbclid extracted from GA4 URL params
                              |delta_sec| <= TS_WINDOW_SEC
  3. fbc_fallback           — stripe.fbc = fbc from GA4 custom event param
                              |delta_sec| <= TS_WINDOW_SEC
  4. email_fallback         — stripe.email_hash = email_hash from GA4 custom param
                              |delta_sec| <= TS_WINDOW_SEC  (prevents spurious joins)
  5. unmatched              — session has no qualifying Stripe order

Deduplication strategy:
  - UNION ALL all four priority levels into one candidates CTE.
  - ROW_NUMBER per order (lowest priority first, then smallest |delta|) → one match per order.
  - ROW_NUMBER per session on surviving matches → one session per match.
  - Sessions not in any match → unmatched row.

New columns added 2026-05-28 (UNC-1398/UNC-1399, Decision Scientist sign-off):
  device_category   — GA4 device.category (mobile / tablet / desktop)
  geo_city          — GA4 geo.city
  geo_region        — GA4 geo.region
  utm_source        — collected_traffic_source.manual_source (session_start events)
  utm_medium        — collected_traffic_source.manual_medium
  utm_campaign      — collected_traffic_source.manual_campaign_name
  utm_term          — collected_traffic_source.manual_term
  utm_content       — collected_traffic_source.manual_content
  landing_page_path — first page_view URL path of the session (host stripped)

  PARTITION BY DATE(session_first_event_ts) also added in this build.

  PRE-2026-05-03 CAVEAT: ga_client_id / fbc capture was incomplete before the
  attribution fix (commit ~2026-05-03). UTM joins on pre-May-3 sessions are
  unreliable. Filter session_first_event_ts >= '2026-05-03' for trustworthy
  UTM attribution when querying this mart. See UNC-1398 for context.

Output is written to BQ tables (WRITE_TRUNCATE) so the mart is a point-in-time
snapshot. Re-run to refresh. Change LOOKBACK_DAYS and re-run to sensitivity-test.

Usage:
  python -m ml.ingest.bigquery_funnel_mart                # build both tables + summary
  python -m ml.ingest.bigquery_funnel_mart --dry-run      # print SQL only
  python -m ml.ingest.bigquery_funnel_mart --spot-check   # print 10 fallback match samples
  python -m ml.ingest.bigquery_funnel_mart --summary      # query existing tables, print summary

Auth: ~/.claude/ga-service-account.json
  Requires roles/bigquery.dataEditor on stripe_raw dataset.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
BQ_DATASET = "stripe_raw"
GA4_DATASET = "analytics_494626869"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

# ── Tunable parameters ─────────────────────────────────────────────────────────
# Sessions this many days prior to today are included in the mart.
# Re-run with LOOKBACK_DAYS=7 or LOOKBACK_DAYS=90 for sensitivity analysis.
LOOKBACK_DAYS: int = 30

# Maximum absolute timestamp delta (seconds) for fbclid / fbc / email fallback joins.
# 3600 = ±60 minutes (Decision Scientist requirement, UNC-1326).
# Prevents spurious matches: unbounded email joins on N=41 have non-trivial
# false-match probability on multi-purchase customers. [modeled]
TS_WINDOW_SEC: int = 3600
# ──────────────────────────────────────────────────────────────────────────────


# ---------------------------------------------------------------------------
# mart_session_funnel SQL
# DDL form (CREATE OR REPLACE TABLE) so PARTITION BY can be set/updated.
# ---------------------------------------------------------------------------
# Priority chain documented inline:
#   1. ga_client_id_primary  — exact, no time bound
#   2. fbclid_fallback        — ±TS_WINDOW_SEC
#   3. fbc_fallback           — ±TS_WINDOW_SEC
#   4. email_fallback         — ±TS_WINDOW_SEC (requires site to fire email_hash param)
#   5. unmatched
#
# Algorithm: UNION ALL all priority levels → ROW_NUMBER per order → ROW_NUMBER
# per session → LEFT JOIN unmatched sessions. Avoids NOT IN chains that exceed
# BQ view planning limits.
#
MART_SESSION_FUNNEL_SQL = f"""
-- ============================================================
-- PRE-2026-05-03 ATTRIBUTION CAVEAT
-- ga_client_id / fbc / UTM capture was incomplete before the
-- attribution fix shipped ~2026-05-03. Filter:
--   session_first_event_ts >= '2026-05-03'
-- for trustworthy UTM attribution joins. See UNC-1398.
-- ============================================================
-- mart_session_funnel
-- Generated by ml/ingest/bigquery_funnel_mart.py
-- Lookback: {LOOKBACK_DAYS}d | Fallback window: ±{TS_WINDOW_SEC}s
-- Priority: ga_client_id_primary(1) > fbclid(2) > fbc(3) > email_hash(4) > unmatched

CREATE OR REPLACE TABLE `{BQ_PROJECT}.{BQ_DATASET}.mart_session_funnel`
PARTITION BY DATE(session_first_event_ts)
OPTIONS(
  description = 'Session-level funnel mart. One row per (user_pseudo_id, ga_session_id). PARTITION BY DATE(session_first_event_ts). CAVEAT: ga_client_id / fbc / UTM capture was incomplete before 2026-05-03; filter session_first_event_ts >= DATE(2026,5,3) for trustworthy UTM attribution. See UNC-1398.'
)
AS

WITH

-- ── GA4 sessions: pre-flatten event params then aggregate per session ──────
ga4_events_flat AS (
  SELECT
    user_pseudo_id,
    CAST(
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')
    AS STRING)                                                          AS ga_session_id,
    event_timestamp,
    event_name,
    REGEXP_EXTRACT(
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
      r'[?&]fbclid=([^&]+)'
    )                                                                   AS event_fbclid,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'fbc')
                                                                        AS event_fbc,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'email_hash')
                                                                        AS event_email_hash,
    -- Device and geo (top-level struct fields in GA4 BQ export)
    device.category                                                     AS device_category,
    geo.city                                                            AS geo_city,
    geo.region                                                          AS geo_region,
    -- UTM attribution (collected_traffic_source populated on session_start events)
    collected_traffic_source.manual_source                              AS event_utm_source,
    collected_traffic_source.manual_medium                              AS event_utm_medium,
    collected_traffic_source.manual_campaign_name                       AS event_utm_campaign,
    collected_traffic_source.manual_term                                AS event_utm_term,
    collected_traffic_source.manual_content                             AS event_utm_content,
    -- Landing page candidate: page_location path on page_view events only
    CASE WHEN event_name = 'page_view' THEN
      REGEXP_EXTRACT(
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location'),
        r'^https?://[^/]+(/.+?)(?:[?#].*)?$'
      )
    END                                                                 AS page_path_candidate
  FROM `{BQ_PROJECT}.{GA4_DATASET}.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL {LOOKBACK_DAYS} DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
),

ga4_sessions AS (
  SELECT
    user_pseudo_id,
    ga_session_id,
    CONCAT(user_pseudo_id, '_', ga_session_id)    AS session_key,
    TIMESTAMP_MICROS(MIN(event_timestamp))         AS session_first_event_ts,
    TIMESTAMP_MICROS(MAX(event_timestamp))         AS session_last_event_ts,
    COUNTIF(event_name = 'page_view')      > 0     AS has_page_view,
    COUNTIF(event_name = 'view_item')      > 0     AS has_view_item,
    COUNTIF(event_name = 'add_to_cart')    > 0     AS has_add_to_cart,
    COUNTIF(event_name = 'begin_checkout') > 0     AS has_begin_checkout,
    COUNTIF(event_name = 'purchase')       > 0     AS has_purchase,
    MAX(event_fbclid)                              AS session_fbclid,
    MAX(event_fbc)                                 AS session_fbc,
    MAX(event_email_hash)                          AS session_email_hash,
    -- Device and geo (constant within a session; MAX picks any non-null)
    MAX(device_category)                           AS device_category,
    MAX(geo_city)                                  AS geo_city,
    MAX(geo_region)                                AS geo_region,
    -- UTM (from session_start events; MAX picks any non-null per session)
    MAX(event_utm_source)                          AS utm_source,
    MAX(event_utm_medium)                          AS utm_medium,
    MAX(event_utm_campaign)                        AS utm_campaign,
    MAX(event_utm_term)                            AS utm_term,
    MAX(event_utm_content)                         AS utm_content,
    -- Landing page: first page_view URL path in the session (lowest event_timestamp)
    ARRAY_AGG(
      page_path_candidate IGNORE NULLS
      ORDER BY event_timestamp
      LIMIT 1
    )[SAFE_OFFSET(0)]                              AS landing_page_path
  FROM ga4_events_flat
  GROUP BY user_pseudo_id, ga_session_id
),

-- ── Stripe non-test succeeded orders ─────────────────────────────────────
stripe_orders AS (
  SELECT
    payment_intent_id,
    created_at                      AS stripe_charge_ts,
    amount_cents,
    ga_client_id,
    fbclid                          AS order_fbclid,
    fbc                             AS order_fbc,
    email_hash                      AS order_email_hash
  FROM `{BQ_PROJECT}.{BQ_DATASET}.payment_intents`
  WHERE status  = 'succeeded'
    AND is_test = FALSE
),

-- ── All candidate matches across all four priority levels ─────────────────
-- UNION ALL avoids deep NOT IN subquery chains (BQ view planning limit).
-- Priority is encoded as an integer so ROW_NUMBER picks the best per order.
candidates AS (

  -- Priority 1: ga_client_id exact match (no time constraint)
  SELECT
    1                                                                   AS priority,
    'ga_client_id_primary'                                              AS match_method,
    s.session_key, s.user_pseudo_id, s.ga_session_id,
    s.session_first_event_ts, s.session_last_event_ts,
    s.has_page_view, s.has_view_item, s.has_add_to_cart,
    s.has_begin_checkout, s.has_purchase,
    s.session_fbclid, s.session_fbc, s.session_email_hash,
    s.device_category, s.geo_city, s.geo_region,
    s.utm_source, s.utm_medium, s.utm_campaign, s.utm_term, s.utm_content,
    s.landing_page_path,
    o.payment_intent_id, o.stripe_charge_ts, o.amount_cents,
    o.ga_client_id, o.order_fbclid, o.order_fbc, o.order_email_hash,
    TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND)
                                                                        AS match_ts_delta_sec
  FROM ga4_sessions s
  JOIN stripe_orders o ON s.user_pseudo_id = o.ga_client_id

  UNION ALL

  -- Priority 2: fbclid match ±TS_WINDOW_SEC
  SELECT
    2, 'fbclid_fallback',
    s.session_key, s.user_pseudo_id, s.ga_session_id,
    s.session_first_event_ts, s.session_last_event_ts,
    s.has_page_view, s.has_view_item, s.has_add_to_cart,
    s.has_begin_checkout, s.has_purchase,
    s.session_fbclid, s.session_fbc, s.session_email_hash,
    s.device_category, s.geo_city, s.geo_region,
    s.utm_source, s.utm_medium, s.utm_campaign, s.utm_term, s.utm_content,
    s.landing_page_path,
    o.payment_intent_id, o.stripe_charge_ts, o.amount_cents,
    o.ga_client_id, o.order_fbclid, o.order_fbc, o.order_email_hash,
    TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND)
  FROM ga4_sessions s
  JOIN stripe_orders o
    ON  s.session_fbclid IS NOT NULL
    AND s.session_fbclid = o.order_fbclid
    AND ABS(TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND))
        <= {TS_WINDOW_SEC}

  UNION ALL

  -- Priority 3: fbc match ±TS_WINDOW_SEC
  SELECT
    3, 'fbc_fallback',
    s.session_key, s.user_pseudo_id, s.ga_session_id,
    s.session_first_event_ts, s.session_last_event_ts,
    s.has_page_view, s.has_view_item, s.has_add_to_cart,
    s.has_begin_checkout, s.has_purchase,
    s.session_fbclid, s.session_fbc, s.session_email_hash,
    s.device_category, s.geo_city, s.geo_region,
    s.utm_source, s.utm_medium, s.utm_campaign, s.utm_term, s.utm_content,
    s.landing_page_path,
    o.payment_intent_id, o.stripe_charge_ts, o.amount_cents,
    o.ga_client_id, o.order_fbclid, o.order_fbc, o.order_email_hash,
    TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND)
  FROM ga4_sessions s
  JOIN stripe_orders o
    ON  s.session_fbc IS NOT NULL
    AND s.session_fbc = o.order_fbc
    AND ABS(TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND))
        <= {TS_WINDOW_SEC}

  UNION ALL

  -- Priority 4: email_hash match ±TS_WINDOW_SEC
  -- Requires site to fire GA4 custom event with email_hash param (e.g. generate_lead).
  -- If not instrumented, session_email_hash will always be NULL → zero matches here.
  SELECT
    4, 'email_fallback',
    s.session_key, s.user_pseudo_id, s.ga_session_id,
    s.session_first_event_ts, s.session_last_event_ts,
    s.has_page_view, s.has_view_item, s.has_add_to_cart,
    s.has_begin_checkout, s.has_purchase,
    s.session_fbclid, s.session_fbc, s.session_email_hash,
    s.device_category, s.geo_city, s.geo_region,
    s.utm_source, s.utm_medium, s.utm_campaign, s.utm_term, s.utm_content,
    s.landing_page_path,
    o.payment_intent_id, o.stripe_charge_ts, o.amount_cents,
    o.ga_client_id, o.order_fbclid, o.order_fbc, o.order_email_hash,
    TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND)
  FROM ga4_sessions s
  JOIN stripe_orders o
    ON  s.session_email_hash IS NOT NULL
    AND s.session_email_hash = o.order_email_hash
    AND ABS(TIMESTAMP_DIFF(o.stripe_charge_ts, s.session_last_event_ts, SECOND))
        <= {TS_WINDOW_SEC}
),

-- ── Dedup: one match per order (best priority, then smallest |delta|) ────
best_per_order AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY payment_intent_id
      ORDER BY priority, ABS(match_ts_delta_sec)
    ) AS order_rank
  FROM candidates
),
order_deduped AS (
  SELECT * EXCEPT(order_rank) FROM best_per_order WHERE order_rank = 1
),

-- ── Dedup: one match per session (in case same session matched multiple orders) ──
best_per_session AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY session_key
      ORDER BY priority, ABS(match_ts_delta_sec)
    ) AS session_rank
  FROM order_deduped
),
session_deduped AS (
  SELECT * EXCEPT(session_rank) FROM best_per_session WHERE session_rank = 1
),

-- ── Unmatched sessions ────────────────────────────────────────────────────
unmatched AS (
  SELECT
    s.session_key,
    s.user_pseudo_id,
    s.ga_session_id,
    s.session_first_event_ts,
    s.session_last_event_ts,
    s.has_page_view,
    s.has_view_item,
    s.has_add_to_cart,
    s.has_begin_checkout,
    s.has_purchase,
    s.session_fbclid,
    s.session_fbc,
    s.session_email_hash,
    s.device_category,
    s.geo_city,
    s.geo_region,
    s.utm_source,
    s.utm_medium,
    s.utm_campaign,
    s.utm_term,
    s.utm_content,
    s.landing_page_path,
    CAST(NULL AS STRING)    AS payment_intent_id,
    CAST(NULL AS TIMESTAMP) AS stripe_charge_ts,
    CAST(NULL AS INT64)     AS amount_cents,
    CAST(NULL AS STRING)    AS ga_client_id,
    CAST(NULL AS STRING)    AS order_fbclid,
    CAST(NULL AS STRING)    AS order_fbc,
    CAST(NULL AS STRING)    AS order_email_hash,
    'unmatched'             AS match_method,
    0                       AS priority,
    CAST(NULL AS INT64)     AS match_ts_delta_sec
  FROM ga4_sessions s
  LEFT JOIN session_deduped sd ON s.session_key = sd.session_key
  WHERE sd.session_key IS NULL
)

-- ── Final output ─────────────────────────────────────────────────────────
SELECT
  -- Session identity
  session_key,
  user_pseudo_id                                AS ga_client_id_from_ga4,
  ga_session_id,
  -- Attribution signals from GA4 session
  ga_client_id,
  session_fbclid                                AS fbclid,
  session_fbc                                   AS fbc,
  session_email_hash                            AS email_hash,
  -- Session timestamps
  session_first_event_ts,
  session_last_event_ts,
  -- Session context dimensions (new: UNC-1398/UNC-1399)
  device_category,
  geo_city,
  geo_region,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_term,
  utm_content,
  landing_page_path,
  -- Funnel stage (highest reached wins)
  CASE
    WHEN has_purchase       THEN 'purchase'
    WHEN has_begin_checkout THEN 'begin_checkout'
    WHEN has_add_to_cart    THEN 'add_to_cart'
    WHEN has_view_item      THEN 'view_item'
    WHEN has_page_view      THEN 'page_view'
    ELSE 'none'
  END                                           AS funnel_stage_reached,
  -- Order fields (NULL if unmatched)
  payment_intent_id,
  stripe_charge_ts,
  amount_cents,
  -- Match metadata
  match_method,
  match_ts_delta_sec                            AS match_timestamp_delta_seconds
FROM (
  SELECT
    session_key, user_pseudo_id, ga_session_id,
    session_first_event_ts, session_last_event_ts,
    has_page_view, has_view_item, has_add_to_cart, has_begin_checkout, has_purchase,
    session_fbclid, session_fbc, session_email_hash,
    device_category, geo_city, geo_region,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    landing_page_path,
    payment_intent_id, stripe_charge_ts, amount_cents,
    ga_client_id, order_fbclid, order_fbc, order_email_hash,
    match_method, priority, match_ts_delta_sec
  FROM session_deduped
  UNION ALL
  SELECT
    session_key, user_pseudo_id, ga_session_id,
    session_first_event_ts, session_last_event_ts,
    has_page_view, has_view_item, has_add_to_cart, has_begin_checkout, has_purchase,
    session_fbclid, session_fbc, session_email_hash,
    device_category, geo_city, geo_region,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    landing_page_path,
    payment_intent_id, stripe_charge_ts, amount_cents,
    ga_client_id, order_fbclid, order_fbc, order_email_hash,
    match_method, priority, match_ts_delta_sec
  FROM unmatched
)
"""

# ---------------------------------------------------------------------------
# mart_attribution_fallback SQL
# ---------------------------------------------------------------------------
MART_ATTRIBUTION_FALLBACK_SQL = f"""
-- mart_attribution_fallback
-- Orders matched via fallback (ga_client_id was null in Stripe).
-- Generated by ml/ingest/bigquery_funnel_mart.py

SELECT
  payment_intent_id,
  stripe_charge_ts,
  amount_cents / 100.0                  AS amount_usd,
  ga_client_id,
  match_method,
  match_timestamp_delta_seconds,
  session_key,
  ga_client_id_from_ga4,
  fbclid,
  fbc,
  email_hash,
  session_first_event_ts,
  session_last_event_ts,
  device_category,
  geo_city,
  geo_region,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_term,
  utm_content,
  landing_page_path,
  funnel_stage_reached
FROM `{BQ_PROJECT}.{BQ_DATASET}.mart_session_funnel`
WHERE match_method != 'ga_client_id_primary'
  AND payment_intent_id IS NOT NULL
ORDER BY stripe_charge_ts DESC
"""

SPOT_CHECK_SQL = f"""
SELECT
  payment_intent_id,
  match_method,
  match_timestamp_delta_seconds,
  amount_usd,
  stripe_charge_ts,
  session_first_event_ts,
  session_last_event_ts,
  funnel_stage_reached,
  device_category,
  utm_source,
  utm_medium,
  landing_page_path,
  fbclid,
  fbc,
  email_hash
FROM `{BQ_PROJECT}.{BQ_DATASET}.mart_attribution_fallback`
ORDER BY ABS(match_timestamp_delta_seconds)
LIMIT 10
"""

SUMMARY_SQL = f"""
SELECT
  match_method,
  COUNT(*)                                             AS session_count,
  COUNTIF(payment_intent_id IS NOT NULL)               AS orders_matched,
  ROUND(SUM(
    CASE WHEN payment_intent_id IS NOT NULL
         THEN amount_cents / 100.0 ELSE 0 END
  ), 2)                                                AS revenue_matched_usd
FROM `{BQ_PROJECT}.{BQ_DATASET}.mart_session_funnel`
GROUP BY 1
ORDER BY orders_matched DESC
"""

# Summary broken down by funnel stage — used by Decision Scientist for CRO analysis
FUNNEL_STAGE_SUMMARY_SQL = f"""
SELECT
  funnel_stage_reached,
  device_category,
  COALESCE(utm_source, '(direct)') AS utm_source,
  COUNT(*)                          AS session_count,
  COUNTIF(payment_intent_id IS NOT NULL) AS converted
FROM `{BQ_PROJECT}.{BQ_DATASET}.mart_session_funnel`
WHERE session_first_event_ts >= '2026-05-03'  -- pre-May-3 attribution is incomplete
GROUP BY 1, 2, 3
ORDER BY session_count DESC
LIMIT 50
"""


# ---------------------------------------------------------------------------
# BQ helpers
# ---------------------------------------------------------------------------

def _creds() -> service_account.Credentials:
    p = os.path.expanduser(SA_PATH)
    creds = service_account.Credentials.from_service_account_file(
        p, scopes=["https://www.googleapis.com/auth/bigquery"]
    )
    creds.refresh(Request())
    return creds


def _token(creds: service_account.Credentials) -> str:
    if not creds.valid:
        creds.refresh(Request())
    return creds.token


def _bq_request(creds, url: str, body: dict | None = None, method: str | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    m = method or ("POST" if data else "GET")
    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=m)
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"BQ HTTP {e.code}: {e.read().decode()[:800]}") from e


def _run_query_job(
    creds,
    sql: str,
    dest_table: str = None,
    write_disposition: str = "WRITE_TRUNCATE",
    ddl_mode: bool = False,
) -> tuple[str, str]:
    """Submit a BQ query job. Returns (job_id, location).

    When ddl_mode=True, the SQL is a DDL statement (CREATE OR REPLACE TABLE ...)
    that handles table creation itself — no destination table is set in the job config.
    """
    query_config: dict = {
        "query": sql,
        "useLegacySql": False,
    }
    if not ddl_mode and dest_table:
        query_config.update({
            "destinationTable": {
                "projectId": BQ_PROJECT,
                "datasetId": BQ_DATASET,
                "tableId": dest_table,
            },
            "writeDisposition": write_disposition,
            "createDisposition": "CREATE_IF_NEEDED",
            "allowLargeResults": True,
        })
    body = {"configuration": {"query": query_config}}
    url = f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/jobs"
    result = _bq_request(creds, url, body)
    job_id = result["jobReference"]["jobId"]
    location = result["jobReference"].get("location", "US")
    return job_id, location


def _wait_for_job(creds, job_id: str, location: str, poll_sec: float = 3.0) -> dict:
    """Poll a BQ job until it completes. Returns final job resource."""
    params = urllib.parse.urlencode({"location": location})
    url = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/jobs/{job_id}?{params}"
    )
    while True:
        result = _bq_request(creds, url)
        status = result.get("status", {})
        state = status.get("state", "UNKNOWN")
        if state == "DONE":
            errors = status.get("errors") or status.get("errorResult")
            if errors:
                raise RuntimeError(f"BQ job {job_id} failed: {json.dumps(errors)[:600]}")
            return result
        time.sleep(poll_sec)


def _bq_query(creds, sql: str) -> list[dict]:
    """Run a synchronous BQ query, return rows as list of dicts."""
    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": "application/json",
    }
    body = json.dumps({"query": sql, "useLegacySql": False, "maxResults": 2000}).encode()
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/queries",
        data=body, headers=headers,
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        result = json.load(r)
    if result.get("errors"):
        raise RuntimeError(f"BQ query error: {result['errors']}")
    fields = [f["name"] for f in result.get("schema", {}).get("fields", [])]
    rows = [{fields[i]: c.get("v") for i, c in enumerate(row["f"])}
            for row in result.get("rows", []) or []]

    job_id = result.get("jobReference", {}).get("jobId")
    location = result.get("jobReference", {}).get("location", "US")
    page_token = result.get("pageToken")
    while page_token:
        params = urllib.parse.urlencode(
            {"pageToken": page_token, "maxResults": 2000, "location": location}
        )
        req2 = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
            f"/queries/{job_id}?{params}",
            headers={"Authorization": f"Bearer {_token(creds)}"},
        )
        with urllib.request.urlopen(req2, timeout=60) as r:
            more = json.load(r)
        rows += [{fields[i]: c.get("v") for i, c in enumerate(row["f"])}
                 for row in more.get("rows", []) or []]
        page_token = more.get("pageToken")
    return rows


def build_table(creds, sql: str, dest_table: str, label: str, ddl_mode: bool = False) -> None:
    """Run a query job writing to dest_table (WRITE_TRUNCATE), or a DDL job."""
    if ddl_mode:
        print(f"[funnel_mart] Submitting {label} (DDL — table creation via CREATE OR REPLACE) ...")
    else:
        print(f"[funnel_mart] Submitting {label} -> {BQ_PROJECT}.{BQ_DATASET}.{dest_table} ...")
    job_id, location = _run_query_job(creds, sql, dest_table, ddl_mode=ddl_mode)
    print(f"[funnel_mart] Job {job_id} running ...")
    _wait_for_job(creds, job_id, location)
    print(f"[funnel_mart] {label} done")


def _drop_table_if_exists(creds, table_id: str) -> None:
    """Drop a BQ table if it exists (needed when changing partition spec).

    BQ DELETE returns 204 No Content on success and 404 if the table does not
    exist — neither body is JSON, so we bypass _bq_request here.
    """
    url = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/datasets/{BQ_DATASET}/tables/{table_id}"
    )
    req = urllib.request.Request(url, method="DELETE", headers={
        "Authorization": f"Bearer {_token(creds)}",
    })
    try:
        urllib.request.urlopen(req, timeout=30)
        print(f"[funnel_mart] Dropped existing table {BQ_DATASET}.{table_id} (partition spec change)")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            pass  # table did not exist — nothing to drop
        else:
            raise RuntimeError(f"BQ DELETE {table_id} failed {e.code}: {e.read().decode()[:400]}") from e


def create_tables(creds) -> None:
    # mart_session_funnel uses DDL (CREATE OR REPLACE TABLE ... PARTITION BY ...).
    # BQ rejects CREATE OR REPLACE if the existing table has a different (or no)
    # partition spec, so we drop first, then recreate with the new spec.
    _drop_table_if_exists(creds, "mart_session_funnel")
    build_table(creds, MART_SESSION_FUNNEL_SQL, "mart_session_funnel", "mart_session_funnel", ddl_mode=True)
    build_table(creds, MART_ATTRIBUTION_FALLBACK_SQL, "mart_attribution_fallback", "mart_attribution_fallback")


def print_summary(creds) -> None:
    print(f"\n## mart_session_funnel \u2014 Match Method Summary")
    print(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"Lookback: {LOOKBACK_DAYS}d | Fallback window: \u00b1{TS_WINDOW_SEC}s\n")
    rows = _bq_query(creds, SUMMARY_SQL)
    if not rows:
        print("No rows \u2014 tables may be empty.")
        return
    print("| match_method | sessions | orders_matched | revenue_usd |")
    print("|---|---|---|---|")
    total_orders = 0
    fallback_orders = 0
    for r in rows:
        orders = int(r["orders_matched"] or 0)
        total_orders += orders
        if r["match_method"] not in ("ga_client_id_primary", "unmatched"):
            fallback_orders += orders
        print(f"| {r['match_method']} | {r['session_count']} | {orders} | ${r['revenue_matched_usd'] or 0} |")
    primary = total_orders - fallback_orders
    print(
        f"\n**{total_orders} total matched orders** | "
        f"{primary} primary ({primary / max(total_orders, 1) * 100:.0f}%) | "
        f"{fallback_orders} fallback ({fallback_orders / max(total_orders, 1) * 100:.0f}%)"
    )


def print_spot_check(creds) -> None:
    """Print 10 fallback matches for Decision Scientist manual precision validation.

    Per UNC-1326 must-have #4: hand-validate before publishing 40-60% recovery claim.
    Check: are timestamps plausible (session before charge)? Does funnel stage make sense?
    Could this be a shared device or re-order from months ago?
    """
    print(f"\n## Spot-Check: 10 Fallback Matches (smallest |delta| first)")
    print(f"Validate manually before citing recovery rate. See UNC-1326 must-have #4.\n")
    rows = _bq_query(creds, SPOT_CHECK_SQL)
    if not rows:
        print("No fallback matches \u2014 all orders matched via ga_client_id, or no orders in lookback window.")
        return
    for i, r in enumerate(rows, 1):
        print(f"**{i}. {r['match_method']}** | pi={r['payment_intent_id']} | ${r['amount_usd']}")
        print(f"   stripe_charge:   {r['stripe_charge_ts']}")
        print(f"   session_first:   {r['session_first_event_ts']}")
        print(f"   session_last:    {r['session_last_event_ts']}")
        print(f"   delta_sec:       {r['match_timestamp_delta_seconds']} (pos = session before charge)")
        print(f"   funnel_stage:    {r['funnel_stage_reached']}")
        print(f"   device:          {r['device_category'] or '\u2014'}")
        print(f"   utm_source:      {r['utm_source'] or '\u2014'}")
        print(f"   utm_medium:      {r['utm_medium'] or '\u2014'}")
        print(f"   landing_page:    {r['landing_page_path'] or '\u2014'}")
        print(f"   fbclid:          {r['fbclid'] or '\u2014'}")
        print(f"   fbc:             {r['fbc'] or '\u2014'}")
        print(f"   email_hash:      {r['email_hash'] or '\u2014'}")
        print()
    print(f"{len(rows)} fallback rows. Hand-validate ALL before publishing recovery rate.")


def run(dry_run: bool = False, summary_only: bool = False, spot_check: bool = False) -> None:
    load_dotenv_if_present()

    if dry_run:
        print(f"=== DRY RUN ===")
        print(f"LOOKBACK_DAYS={LOOKBACK_DAYS} | TS_WINDOW_SEC={TS_WINDOW_SEC}")
        print("\n--- mart_session_funnel SQL (DDL, includes PARTITION BY) ---")
        print(MART_SESSION_FUNNEL_SQL)
        print("\n--- mart_attribution_fallback SQL ---")
        print(MART_ATTRIBUTION_FALLBACK_SQL)
        return

    creds = _creds()

    if not summary_only and not spot_check:
        create_tables(creds)

    if spot_check:
        print_spot_check(creds)
    else:
        print_summary(creds)


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    summary = "--summary" in sys.argv
    spot = "--spot-check" in sys.argv
    run(dry_run=dry, summary_only=summary, spot_check=spot)
