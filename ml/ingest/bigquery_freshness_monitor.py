"""BigQuery warehouse freshness monitor.

Queries INFORMATION_SCHEMA.TABLE_METADATA for each expected table across all
warehouse datasets, compares last-modified time to a 36-hour threshold, and
prints a markdown report. Exits non-zero if any table is stale or missing.

Also runs an attribution quality check against stripe_raw.payment_intents to
detect regressions in ga_client_id capture at checkout. See AttributionQuality
for threshold details and population definition.

Datasets monitored:
  stripe_raw    -- payment_intents, checkout_sessions, customers, charges,
                  subscriptions, invoices, v_conversion_reconciliation
  ads_raw       -- meta_campaign_insights, google_ads_campaign_insights
  crm_raw       -- mailchimp_members, apollo_contacts, resend_emails
  airtable_raw  -- catalog, pickup_slots, suppliers
  ops_raw       -- checkout_store, census_acs_zip
  logrocket_raw     -- sessions
  logrocket_galileo -- briefings
  uncle_mays_dbt_staging   -- all staging views (materialized as tables)
  uncle_mays_dbt_core      -- mart_cac, mart_conversion_funnel, mart_customers,
                              mart_orders, mart_retention
  uncle_mays_dbt_marketing -- mart_channel_performance, mart_order_attribution
  uncle_mays_dbt_reporting -- rpt_ceo_weekly, rpt_cro_weekly

Usage:
  python -m ml.ingest.bigquery_freshness_monitor          # markdown report
  python -m ml.ingest.bigquery_freshness_monitor --json   # machine-readable JSON
  python -m ml.ingest.bigquery_freshness_monitor --alert  # exit 1 if stale, for CI

Auth: ~/.claude/ga-service-account.json  (requires BigQuery read access).
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import NamedTuple

from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

STALE_THRESHOLD_HOURS = 36.0
# dbt models run daily; alert sooner so a single missed run is caught before
# leadership reads stale reports.
DBT_STALE_THRESHOLD_HOURS = 26.0

# (dataset, table, friendly_name)
EXPECTED_TABLES: list[tuple[str, str, str]] = [
    # stripe_raw -- payment data
    ("stripe_raw", "payment_intents",   "Stripe PaymentIntents"),
    ("stripe_raw", "checkout_sessions", "Stripe CheckoutSessions"),
    ("stripe_raw", "customers",         "Stripe Customers"),
    ("stripe_raw", "charges",           "Stripe Charges"),
    ("stripe_raw", "subscriptions",     "Stripe Subscriptions"),
    ("stripe_raw", "invoices",          "Stripe Invoices"),
    # ads_raw -- paid media
    ("ads_raw",    "meta_campaign_insights",       "Meta Ads Insights"),
    ("ads_raw",    "google_ads_campaign_insights", "Google Ads Insights"),
    # NOTE: v_conversion_reconciliation is a BQ view -- listed in VIEW_CHECKS below,
    # not here, because __TABLES__ always returns row_count=0 and last_modified_time
    # reflects the view definition redeployment, not underlying data freshness.
    # crm_raw -- CRM + email
    ("crm_raw",    "mailchimp_members",  "Mailchimp Members"),
    ("crm_raw",    "apollo_contacts",    "Apollo Contacts"),
    ("crm_raw",    "resend_emails",      "Resend Emails"),
    # airtable_raw -- catalog + ops
    ("airtable_raw", "catalog",        "Airtable Catalog"),
    ("airtable_raw", "pickup_slots",   "Airtable Pickup Slots"),
    ("airtable_raw", "suppliers",      "Airtable Suppliers"),
    # ops_raw -- internal ops
    ("ops_raw",    "checkout_store",   "Checkout Store Config"),
    ("ops_raw",    "census_acs_zip",   "Census ACS ZIP"),
    # logrocket_raw / logrocket_galileo -- session analytics
    ("logrocket_raw",     "sessions",   "LogRocket Sessions"),
    ("logrocket_galileo", "briefings",  "LogRocket Galileo Briefings"),
    # uncle_mays_dbt_staging -- staging layer (refreshed by daily dbt prod run)
    ("uncle_mays_dbt_staging", "stg_ga4_events",                "dbt stg_ga4_events"),
    ("uncle_mays_dbt_staging", "stg_stripe_payment_intents",    "dbt stg_stripe_payment_intents"),
    ("uncle_mays_dbt_staging", "stg_stripe_checkout_sessions",  "dbt stg_stripe_checkout_sessions"),
    ("uncle_mays_dbt_staging", "stg_stripe_charges",            "dbt stg_stripe_charges"),
    ("uncle_mays_dbt_staging", "stg_stripe_customers",          "dbt stg_stripe_customers"),
    ("uncle_mays_dbt_staging", "stg_gads_campaign_insights",    "dbt stg_gads_campaign_insights"),
    ("uncle_mays_dbt_staging", "stg_meta_campaign_insights",    "dbt stg_meta_campaign_insights"),
    # uncle_mays_dbt_core -- business-logic marts
    ("uncle_mays_dbt_core", "mart_orders",             "dbt mart_orders"),
    ("uncle_mays_dbt_core", "mart_customers",          "dbt mart_customers"),
    ("uncle_mays_dbt_core", "mart_conversion_funnel",  "dbt mart_conversion_funnel"),
    ("uncle_mays_dbt_core", "mart_cac",                "dbt mart_cac"),
    ("uncle_mays_dbt_core", "mart_retention",          "dbt mart_retention"),
    # uncle_mays_dbt_marketing -- channel performance
    ("uncle_mays_dbt_marketing", "mart_channel_performance", "dbt mart_channel_performance"),
    ("uncle_mays_dbt_marketing", "mart_order_attribution",   "dbt mart_order_attribution"),
    # uncle_mays_dbt_reporting -- leadership reports
    ("uncle_mays_dbt_reporting", "rpt_ceo_weekly", "dbt rpt_ceo_weekly"),
    ("uncle_mays_dbt_reporting", "rpt_cro_weekly", "dbt rpt_cro_weekly"),
]

# Views to check via a direct COUNT/MAX probe instead of __TABLES__.
# BQ views are non-materialized: __TABLES__ always returns row_count=0 and
# last_modified_time reflects the view *definition* redeployment, not data freshness.
# Each entry: (dataset, view, friendly_name, freshness_column)
VIEW_CHECKS: list[tuple[str, str, str, str]] = [
    ("stripe_raw", "v_conversion_reconciliation", "Stripe<->GA4 Reconciliation View", "stripe_created_at"),
]

# Tables whose staleness threshold differs from STALE_THRESHOLD_HOURS.
# Key: (dataset, table)  Value: threshold in hours
CUSTOM_THRESHOLDS: dict[tuple[str, str], float] = {
    ("uncle_mays_dbt_staging",   "stg_ga4_events"):               DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_staging",   "stg_stripe_payment_intents"):   DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_staging",   "stg_stripe_checkout_sessions"): DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_staging",   "stg_stripe_charges"):           DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_staging",   "stg_stripe_customers"):         DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_staging",   "stg_gads_campaign_insights"):   DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_staging",   "stg_meta_campaign_insights"):   DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_core",      "mart_orders"):                  DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_core",      "mart_customers"):               DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_core",      "mart_conversion_funnel"):       DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_core",      "mart_cac"):                     DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_core",      "mart_retention"):               DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_marketing", "mart_channel_performance"):     DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_marketing", "mart_order_attribution"):       DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_reporting", "rpt_ceo_weekly"):               DBT_STALE_THRESHOLD_HOURS,
    ("uncle_mays_dbt_reporting", "rpt_cro_weekly"):               DBT_STALE_THRESHOLD_HOURS,
}


class TableStatus(NamedTuple):
    dataset: str
    table: str
    friendly: str
    last_modified: datetime | None
    age_hours: float | None
    row_count: int | None
    status: str  # "OK" | "STALE" | "MISSING" | "ERROR"
    error: str | None


# ---------------------------------------------------------------------------
# Attribution quality check
#
# Population: stripe_raw.payment_intents WHERE
#   status = 'succeeded'
#   AND COALESCE(is_test, FALSE) = FALSE
#   AND COALESCE(is_internal_order, FALSE) = FALSE
#
# Alert tiers (approved by Decision Scientist 2026-05-29, UNC-1415):
#   Tier A (drift):       pct_null_14d > TIER_A_THRESHOLD_PCT AND n_14d >= MIN_N
#   Tier B (catastrophic): n_null_14d >= TIER_B_ABS_THRESHOLD (regardless of %)
#   insufficient_n:       n_14d < MIN_N -- report components but do not page
#
# Thresholds:
#   MIN_N = 15         -- Wilson 95% CI half-width ~25pp at p=0.3; recalibrate
#                        when weekly volume grows enough to lower this.
#   TIER_A_THRESHOLD_PCT = 50.0  -- provisional; post-fix baseline is ~33%.
#                                   Recalibrate after 30 non-internal succeeded
#                                   orders accumulate post-2026-05-03.
#   TIER_B_ABS_THRESHOLD = 10   -- absolute null count in 14d window; catches
#                                   total regression even at low volume.
# ---------------------------------------------------------------------------

ATTRIBUTION_MIN_N = 15
ATTRIBUTION_TIER_A_PCT = 50.0
ATTRIBUTION_TIER_B_ABS = 10

_ATTRIBUTION_SQL = f"""
SELECT
  -- 14-day window
  COUNTIF(created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY))
    AS n_14d,
  COUNTIF(
    created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY)
    AND ga_client_id IS NULL
  ) AS n_null_14d,
  -- 30-day window
  COUNTIF(created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY))
    AS n_30d,
  COUNTIF(
    created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    AND ga_client_id IS NULL
  ) AS n_null_30d
FROM `uncle-mays-automation.stripe_raw.payment_intents`
WHERE status = 'succeeded'
  AND COALESCE(is_test, FALSE) = FALSE
  AND COALESCE(is_internal_order, FALSE) = FALSE
"""


class AttributionQuality(NamedTuple):
    n_14d: int
    n_null_14d: int
    pct_null_14d: float | None   # None when n_14d == 0
    n_30d: int
    n_null_30d: int
    pct_null_30d: float | None   # None when n_30d == 0
    # "ok" | "tier_a" | "tier_b" | "tier_a_and_b" | "insufficient_n" | "error"
    state: str
    error: str | None


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


def _run_query(creds: service_account.Credentials, sql: str) -> list[dict]:
    """Run a synchronous BQ query and return rows as list of dicts."""
    url = f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/queries"
    body = {
        "query": sql,
        "useLegacySql": False,
        "timeoutMs": 30000,
        "location": "US",
    }
    data = json.dumps(body).encode()
    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            result = json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"BQ query HTTP {e.code}: {e.read().decode()[:400]}") from e

    if not result.get("jobComplete"):
        raise TimeoutError("BQ query did not complete in 30s")

    schema = result.get("schema", {}).get("fields", [])
    col_names = [f["name"] for f in schema]
    rows = []
    for row in result.get("rows", []):
        vals = [cell.get("v") for cell in row.get("f", [])]
        rows.append(dict(zip(col_names, vals)))
    return rows


def _check_table(
    creds: service_account.Credentials,
    dataset: str,
    table: str,
    friendly: str,
    now: datetime,
) -> TableStatus:
    threshold = CUSTOM_THRESHOLDS.get((dataset, table), STALE_THRESHOLD_HOURS)
    sql = f"""
    SELECT
      last_modified_time,
      row_count
    FROM `{BQ_PROJECT}.{dataset}.__TABLES__`
    WHERE table_id = '{table}'
    """
    try:
        rows = _run_query(creds, sql)
    except RuntimeError as e:
        err_str = str(e)
        # 404 means dataset doesn't exist yet
        if "404" in err_str or "notFound" in err_str.lower():
            return TableStatus(dataset, table, friendly, None, None, None, "MISSING", None)
        return TableStatus(dataset, table, friendly, None, None, None, "ERROR", err_str[:200])

    if not rows:
        return TableStatus(dataset, table, friendly, None, None, None, "MISSING", None)

    row = rows[0]
    # last_modified_time is epoch milliseconds as a string
    try:
        epoch_ms = int(row["last_modified_time"])
        last_mod = datetime.fromtimestamp(epoch_ms / 1000, tz=timezone.utc)
        age_h = (now - last_mod).total_seconds() / 3600
        row_count = int(row["row_count"]) if row.get("row_count") is not None else None
        status = "STALE" if age_h > threshold else "OK"
        return TableStatus(dataset, table, friendly, last_mod, age_h, row_count, status, None)
    except (TypeError, ValueError, KeyError) as e:
        return TableStatus(dataset, table, friendly, None, None, None, "ERROR", str(e))


def _check_view(
    creds: service_account.Credentials,
    dataset: str,
    view: str,
    friendly: str,
    freshness_column: str,
    now: datetime,
) -> TableStatus:
    """Probe a BQ view via COUNT/MAX to get real row count and data freshness.

    __TABLES__ is useless for views: row_count is always 0 and last_modified_time
    reflects the view DDL redeployment, not when the underlying data last changed.
    This probe SELECT queries the view directly.
    """
    threshold = CUSTOM_THRESHOLDS.get((dataset, view), STALE_THRESHOLD_HOURS)
    sql = f"""
    SELECT
      COUNT(*) AS rc,
      MAX(`{freshness_column}`) AS max_ts
    FROM `{BQ_PROJECT}.{dataset}.{view}`
    """
    try:
        rows = _run_query(creds, sql)
    except RuntimeError as e:
        err_str = str(e)
        if "404" in err_str or "notFound" in err_str.lower():
            return TableStatus(dataset, view, friendly, None, None, None, "MISSING", None)
        return TableStatus(dataset, view, friendly, None, None, None, "ERROR", err_str[:200])

    if not rows:
        return TableStatus(dataset, view, friendly, None, None, None, "MISSING", None)

    row = rows[0]
    try:
        row_count = int(row["rc"]) if row.get("rc") is not None else 0
        max_ts_raw = row.get("max_ts")
        if max_ts_raw is None:
            # View returned rows but freshness column is entirely NULL -- treat as stale
            return TableStatus(dataset, view, friendly, None, None, row_count, "STALE",
                               f"MAX({freshness_column}) is NULL across {row_count} rows")
        # BQ REST API returns TIMESTAMP as epoch-seconds string (may use scientific
        # notation, e.g. "1.781263313E9"). Try numeric parse first; fall back to
        # ISO string parse for any future format changes.
        ts_str = str(max_ts_raw)
        try:
            epoch_sec = float(ts_str)
            last_mod = datetime.fromtimestamp(epoch_sec, tz=timezone.utc)
        except ValueError:
            ts_str = ts_str.replace(" UTC", "+00:00").replace(" ", "T", 1)
            last_mod = datetime.fromisoformat(ts_str)
            if last_mod.tzinfo is None:
                last_mod = last_mod.replace(tzinfo=timezone.utc)
        age_h = (now - last_mod).total_seconds() / 3600
        status = "STALE" if age_h > threshold else "OK"
        return TableStatus(dataset, view, friendly, last_mod, age_h, row_count, status, None)
    except (TypeError, ValueError, KeyError) as e:
        return TableStatus(dataset, view, friendly, None, None, None, "ERROR", str(e))


def check_attribution_quality(
    creds: service_account.Credentials | None = None,
) -> AttributionQuality:
    """Query ga_client_id null rate from real succeeded Stripe payment_intents.

    Population: status='succeeded' AND is_test=FALSE AND is_internal_order=FALSE.
    Returns an AttributionQuality with 14d + 30d counts and a derived alert state.
    """
    load_dotenv_if_present()
    if creds is None:
        creds = _creds()
    try:
        rows = _run_query(creds, _ATTRIBUTION_SQL)
    except Exception as exc:
        return AttributionQuality(0, 0, None, 0, 0, None, "error", str(exc)[:300])

    if not rows:
        return AttributionQuality(0, 0, None, 0, 0, None, "error", "no rows returned")

    r = rows[0]

    def _int(v: object) -> int:
        return int(v) if v is not None else 0

    n_14d = _int(r.get("n_14d"))
    n_null_14d = _int(r.get("n_null_14d"))
    n_30d = _int(r.get("n_30d"))
    n_null_30d = _int(r.get("n_null_30d"))

    pct_14d = (n_null_14d / n_14d * 100) if n_14d > 0 else None
    pct_30d = (n_null_30d / n_30d * 100) if n_30d > 0 else None

    if n_14d < ATTRIBUTION_MIN_N:
        state = "insufficient_n"
    else:
        tier_a = pct_14d is not None and pct_14d > ATTRIBUTION_TIER_A_PCT
        tier_b = n_null_14d >= ATTRIBUTION_TIER_B_ABS
        if tier_a and tier_b:
            state = "tier_a_and_b"
        elif tier_a:
            state = "tier_a"
        elif tier_b:
            state = "tier_b"
        else:
            state = "ok"

    return AttributionQuality(n_14d, n_null_14d, pct_14d, n_30d, n_null_30d, pct_30d, state, None)


def check_all(creds: service_account.Credentials | None = None) -> list[TableStatus]:
    load_dotenv_if_present()
    if creds is None:
        creds = _creds()
    now = datetime.now(timezone.utc)
    table_statuses = [
        _check_table(creds, ds, tbl, friendly, now)
        for ds, tbl, friendly in EXPECTED_TABLES
    ]
    view_statuses = [
        _check_view(creds, ds, vw, friendly, freshness_col, now)
        for ds, vw, friendly, freshness_col in VIEW_CHECKS
    ]
    return table_statuses + view_statuses


def _markdown_report(
    statuses: list[TableStatus],
    attr: AttributionQuality | None = None,
) -> str:
    lines = [
        "## BigQuery Warehouse Freshness Report",
        f"\nGenerated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        f"Threshold: {STALE_THRESHOLD_HOURS:.0f}h\n",
        "| Table | Dataset | Last Modified (UTC) | Age (h) | Rows | Status |",
        "|-------|---------|--------------------|---------|----- |--------|",
    ]
    for s in statuses:
        ts = s.last_modified.strftime("%Y-%m-%d %H:%M") if s.last_modified else "--"
        age = f"{s.age_hours:.1f}" if s.age_hours is not None else "--"
        rows = str(s.row_count) if s.row_count is not None else "--"
        flag = s.status if s.status != "OK" else "ok"
        lines.append(f"| {s.friendly} | {s.dataset} | {ts} | {age} | {rows} | {flag} |")

    if attr is not None:
        pct14 = f"{attr.pct_null_14d:.1f}%" if attr.pct_null_14d is not None else "--"
        pct30 = f"{attr.pct_null_30d:.1f}%" if attr.pct_null_30d is not None else "--"
        state_flag = attr.state if attr.state != "ok" else "ok"
        if attr.state == "error":
            state_flag = f"ERROR: {attr.error}"

        lines += [
            "",
            "## Attribution Quality Check (ga_client_id capture)",
            "",
            f"Population: `stripe_raw.payment_intents` WHERE "
            f"`status='succeeded' AND is_test=FALSE AND is_internal_order=FALSE`",
            f"Thresholds: min_n={ATTRIBUTION_MIN_N} | "
            f"tier_a>{ATTRIBUTION_TIER_A_PCT:.0f}% | tier_b_abs>={ATTRIBUTION_TIER_B_ABS}",
            "",
            "| Window | n orders | n null ga_client_id | % null | State |",
            "|--------|----------|---------------------|--------|-------|",
            f"| 14d | {attr.n_14d} | {attr.n_null_14d} | {pct14} | {state_flag} |",
            f"| 30d | {attr.n_30d} | {attr.n_null_30d} | {pct30} | -- |",
        ]

        if attr.state == "insufficient_n":
            lines.append(
                f"\n> insufficient_n: only {attr.n_14d} orders in 14d window "
                f"(need >={ATTRIBUTION_MIN_N} to evaluate thresholds). "
                "No alert fired -- monitoring but not paging."
            )
        elif attr.state in ("tier_a", "tier_a_and_b"):
            lines.append(
                f"\n> **TIER A ALERT:** {pct14} null in 14d window exceeds "
                f"{ATTRIBUTION_TIER_A_PCT:.0f}% threshold (n={attr.n_14d} >= {ATTRIBUTION_MIN_N}). "
                "Investigate ga_client_id capture in checkout."
            )
        if attr.state in ("tier_b", "tier_a_and_b"):
            lines.append(
                f"\n> **TIER B ALERT:** {attr.n_null_14d} null ga_client_id orders in 14d window "
                f">= absolute threshold of {ATTRIBUTION_TIER_B_ABS}. "
                "Possible regression in cookie/tracking code path."
            )

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="BQ warehouse freshness check")
    parser.add_argument("--json", dest="as_json", action="store_true")
    parser.add_argument("--alert", action="store_true",
                        help="Exit 1 if any table is stale/missing or attribution alert fires (for CI/cron)")
    parser.add_argument("--no-attribution", action="store_true",
                        help="Skip the attribution quality check")
    args = parser.parse_args()

    creds = _creds()
    statuses = check_all(creds)
    attr = None if args.no_attribution else check_attribution_quality(creds)

    freshness_violations = [s for s in statuses if s.status in ("STALE", "MISSING", "ERROR")]
    attr_alert = attr is not None and attr.state in ("tier_a", "tier_b", "tier_a_and_b", "error")

    if args.as_json:
        out = [
            {
                "dataset": s.dataset,
                "table": s.table,
                "friendly": s.friendly,
                "last_modified": s.last_modified.isoformat() if s.last_modified else None,
                "age_hours": round(s.age_hours, 2) if s.age_hours is not None else None,
                "row_count": s.row_count,
                "status": s.status,
                "error": s.error,
            }
            for s in statuses
        ]
        attr_out = None
        if attr is not None:
            attr_out = {
                "n_14d": attr.n_14d,
                "n_null_14d": attr.n_null_14d,
                "pct_null_14d": round(attr.pct_null_14d, 2) if attr.pct_null_14d is not None else None,
                "n_30d": attr.n_30d,
                "n_null_30d": attr.n_null_30d,
                "pct_null_30d": round(attr.pct_null_30d, 2) if attr.pct_null_30d is not None else None,
                "state": attr.state,
                "error": attr.error,
            }
        print(json.dumps({
            "results": out,
            "freshness_violations": len(freshness_violations),
            "attribution": attr_out,
            "attribution_alert": attr_alert,
        }, indent=2))
    else:
        print(_markdown_report(statuses, attr))
        if freshness_violations:
            print()
            for v in freshness_violations:
                detail = f"age={v.age_hours:.1f}h" if v.age_hours is not None else (v.error or "no data")
                print(f"  {v.status}: {BQ_PROJECT}.{v.dataset}.{v.table} ({detail})")

    return 1 if (args.alert and (freshness_violations or attr_alert)) else 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
