"""Pull and flatten GA4 BigQuery export tables.

The export started 2026-04-29; tables are sharded daily as
`events_YYYYMMDD`. We pull the whole window since DATASET_START_DATE
(or whatever overlaps), flatten event_params + user_properties +
nested ecommerce.items, and write one row per event.

Auth: reuses the existing ~/.claude/ga-service-account.json (the same
service account that already has GA4 read access — also has BigQuery
read on its parent project `uncle-mays-automation`).
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import polars as pl
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present, raw_path

DEFAULT_PROJECT = "uncle-mays-automation"
DEFAULT_DATASET = "analytics_494626869"
SCOPES = ["https://www.googleapis.com/auth/bigquery"]


def _credentials():
    sa_path = os.path.expanduser(
        os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")
    )
    creds = service_account.Credentials.from_service_account_file(sa_path, scopes=SCOPES)
    creds.refresh(Request())
    return creds


def _bq_query(creds, project: str, sql: str) -> list[dict]:
    """Run a BigQuery query and paginate results back to a list of row dicts."""
    import urllib.error
    import urllib.parse
    import urllib.request

    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json",
    }
    body = json.dumps(
        {"query": sql, "useLegacySql": False, "maxResults": 5000}
    ).encode()
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{project}/queries",
        data=body,
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        first = json.load(r)
    if first.get("errors"):
        raise RuntimeError(f"BQ query failed: {first['errors']}")
    fields = [f["name"] for f in first.get("schema", {}).get("fields", [])]
    rows: list[dict] = []
    for r in first.get("rows", []) or []:
        rows.append({fields[i]: c.get("v") for i, c in enumerate(r["f"])})

    job_ref = first.get("jobReference") or {}
    job_id = job_ref.get("jobId")
    location = job_ref.get("location", "US")
    page_token = first.get("pageToken")
    while page_token:
        params = urllib.parse.urlencode(
            {"pageToken": page_token, "maxResults": 5000, "location": location}
        )
        req2 = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{project}/queries/{job_id}?{params}",
            headers={"Authorization": f"Bearer {creds.token}"},
        )
        with urllib.request.urlopen(req2, timeout=180) as r:
            more = json.load(r)
        for row in more.get("rows", []) or []:
            rows.append({fields[i]: c.get("v") for i, c in enumerate(row["f"])})
        page_token = more.get("pageToken")
    return rows


def extract(start_date: str | None = None) -> dict[str, Path]:
    """Pull events from BQ since start_date (YYYY-MM-DD).

    Returns dict of source -> parquet path. Two outputs:
      - ga4_events: one row per event (flattened)
      - ga4_session_summary: one row per session (aggregated)
    """
    load_dotenv_if_present()
    start_date = start_date or os.environ.get("DATASET_START_DATE", "2026-04-24")
    project = os.environ.get("BQ_PROJECT_ID", DEFAULT_PROJECT)
    dataset = os.environ.get("BQ_DATASET", DEFAULT_DATASET)

    creds = _credentials()

    start_compact = start_date.replace("-", "")
    today_compact = datetime.now(timezone.utc).strftime("%Y%m%d")

    out: dict[str, Path] = {}
    out["ga4_events"] = _extract_events(creds, project, dataset, start_compact, today_compact)
    out["ga4_session_summary"] = _extract_session_summary(
        creds, project, dataset, start_compact, today_compact
    )
    return out


def _extract_events(
    creds, project: str, dataset: str, start_compact: str, end_compact: str
) -> Path:
    sql = f"""
    SELECT
      event_date,
      event_timestamp,
      event_name,
      user_pseudo_id,
      user_id,
      stream_id,
      platform,
      device.category AS device_category,
      device.operating_system AS device_os,
      device.web_info.browser AS device_browser,
      device.mobile_brand_name AS device_brand,
      geo.country AS geo_country,
      geo.region AS geo_region,
      geo.city AS geo_city,
      geo.metro AS geo_metro,
      traffic_source.source AS traffic_source,
      traffic_source.medium AS traffic_medium,
      traffic_source.name AS traffic_name,
      collected_traffic_source.manual_source AS manual_source,
      collected_traffic_source.manual_medium AS manual_medium,
      collected_traffic_source.manual_campaign_name AS manual_campaign,
      collected_traffic_source.manual_content AS manual_content,
      collected_traffic_source.manual_term AS manual_term,
      collected_traffic_source.gclid AS gclid,
      session_traffic_source_last_click.manual_campaign.campaign_name AS session_campaign,
      ecommerce.transaction_id AS transaction_id,
      ecommerce.purchase_revenue_in_usd AS purchase_revenue_usd,
      ecommerce.unique_items AS unique_items,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location') AS page_location,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_referrer') AS page_referrer,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_title') AS page_title,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id') AS ga_session_id,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_number') AS ga_session_number,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key='engagement_time_msec') AS engagement_time_msec,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key='entrances') AS is_entrance,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='form_id') AS form_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='form_name') AS form_name,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='link_url') AS link_url,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='item_id') AS item_id,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='item_name') AS item_name,
      (SELECT value.double_value FROM UNNEST(event_params) WHERE key='value') AS event_value,
      (SELECT value.string_value FROM UNNEST(event_params) WHERE key='currency') AS currency,
      (SELECT value.int_value FROM UNNEST(event_params) WHERE key='quantity') AS quantity
    FROM `{project}.{dataset}.events_*`
    WHERE _TABLE_SUFFIX BETWEEN '{start_compact}' AND '{end_compact}'
    ORDER BY event_timestamp
    """
    rows = _bq_query(creds, project, sql)
    df = _rows_to_string_df(rows, schema_default={"event_name": pl.Utf8})
    out_path = raw_path("ga4_events")
    df.write_parquet(out_path)
    print(f"[bigquery_ga4.events] {len(rows)} rows -> {out_path}")
    return out_path


def _extract_session_summary(
    creds, project: str, dataset: str, start_compact: str, end_compact: str
) -> Path:
    sql = f"""
    WITH base AS (
      SELECT
        user_pseudo_id,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key='ga_session_id') AS ga_session_id,
        event_timestamp,
        event_name,
        device.category AS device_category,
        device.operating_system AS device_os,
        device.web_info.browser AS device_browser,
        geo.country AS geo_country,
        geo.region AS geo_region,
        geo.city AS geo_city,
        traffic_source.source AS first_traffic_source,
        traffic_source.medium AS first_traffic_medium,
        collected_traffic_source.manual_source AS manual_source,
        collected_traffic_source.manual_medium AS manual_medium,
        collected_traffic_source.manual_campaign_name AS manual_campaign,
        collected_traffic_source.gclid AS gclid,
        ecommerce.transaction_id AS transaction_id,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key='page_location') AS page_location
      FROM `{project}.{dataset}.events_*`
      WHERE _TABLE_SUFFIX BETWEEN '{start_compact}' AND '{end_compact}'
    )
    SELECT
      user_pseudo_id,
      ga_session_id,
      MIN(event_timestamp) AS session_start_us,
      MAX(event_timestamp) AS session_end_us,
      ANY_VALUE(device_category) AS device_category,
      ANY_VALUE(device_os) AS device_os,
      ANY_VALUE(device_browser) AS device_browser,
      ANY_VALUE(geo_country) AS geo_country,
      ANY_VALUE(geo_region) AS geo_region,
      ANY_VALUE(geo_city) AS geo_city,
      ANY_VALUE(first_traffic_source) AS first_traffic_source,
      ANY_VALUE(first_traffic_medium) AS first_traffic_medium,
      ANY_VALUE(manual_source) AS manual_source,
      ANY_VALUE(manual_medium) AS manual_medium,
      ANY_VALUE(manual_campaign) AS manual_campaign,
      ANY_VALUE(gclid) AS gclid,
      ANY_VALUE(transaction_id) AS transaction_id,
      COUNT(*) AS event_count,
      COUNTIF(event_name='page_view') AS pageviews,
      COUNTIF(event_name='scroll') AS scrolls,
      COUNTIF(event_name='select_item') AS select_items,
      COUNTIF(event_name='form_start') AS form_starts,
      COUNTIF(event_name='generate_lead') AS generate_leads,
      COUNTIF(event_name='add_to_cart') AS add_to_cart_events,
      COUNTIF(event_name='begin_checkout') AS begin_checkout_events,
      COUNTIF(event_name='purchase') AS purchase_events,
      ARRAY_AGG(page_location IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_page_location,
      ARRAY_AGG(page_location IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS last_page_location
    FROM base
    GROUP BY user_pseudo_id, ga_session_id
    """
    rows = _bq_query(creds, project, sql)
    df = _rows_to_string_df(rows, schema_default={"user_pseudo_id": pl.Utf8})
    out_path = raw_path("ga4_session_summary")
    df.write_parquet(out_path)
    print(f"[bigquery_ga4.session_summary] {len(rows)} sessions -> {out_path}")
    return out_path


def _rows_to_string_df(
    rows: list[dict], schema_default: dict | None = None
) -> pl.DataFrame:
    """BQ REST returns every value as a string (or null). Persist as Utf8 to
    avoid polars schema-inference flakiness on sparse columns. Casting to
    proper types is the features layer's job."""
    if not rows:
        return pl.DataFrame(schema=schema_default or {"_": pl.Utf8})
    keys = list(rows[0].keys())
    schema = {k: pl.Utf8 for k in keys}
    normalized = [
        {k: (str(r[k]) if r.get(k) is not None else None) for k in keys}
        for r in rows
    ]
    return pl.DataFrame(normalized, schema=schema)


if __name__ == "__main__":
    extract()
