"""BigQuery warehouse freshness monitor.

Queries INFORMATION_SCHEMA.TABLE_METADATA for each expected table across all
warehouse datasets, compares last-modified time to a 36-hour threshold, and
prints a markdown report. Exits non-zero if any table is stale or missing.

Datasets monitored:
  stripe_raw   — payment_intents, checkout_sessions, customers, charges,
                 subscriptions, invoices
  ads_raw      — meta_campaign_insights, google_ads_campaign_insights

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

# (dataset, table, friendly_name)
EXPECTED_TABLES: list[tuple[str, str, str]] = [
    ("stripe_raw", "payment_intents",   "Stripe PaymentIntents"),
    ("stripe_raw", "checkout_sessions", "Stripe CheckoutSessions"),
    ("stripe_raw", "customers",         "Stripe Customers"),
    ("stripe_raw", "charges",           "Stripe Charges"),
    ("stripe_raw", "subscriptions",     "Stripe Subscriptions"),
    ("stripe_raw", "invoices",          "Stripe Invoices"),
    ("ads_raw",    "meta_campaign_insights",         "Meta Ads Insights"),
    ("ads_raw",    "google_ads_campaign_insights",   "Google Ads Insights"),
]


class TableStatus(NamedTuple):
    dataset: str
    table: str
    friendly: str
    last_modified: datetime | None
    age_hours: float | None
    row_count: int | None
    status: str  # "OK" | "STALE" | "MISSING" | "ERROR"
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
        status = "STALE" if age_h > STALE_THRESHOLD_HOURS else "OK"
        return TableStatus(dataset, table, friendly, last_mod, age_h, row_count, status, None)
    except (TypeError, ValueError, KeyError) as e:
        return TableStatus(dataset, table, friendly, None, None, None, "ERROR", str(e))


def check_all(creds: service_account.Credentials | None = None) -> list[TableStatus]:
    load_dotenv_if_present()
    if creds is None:
        creds = _creds()
    now = datetime.now(timezone.utc)
    return [
        _check_table(creds, ds, tbl, friendly, now)
        for ds, tbl, friendly in EXPECTED_TABLES
    ]


def _markdown_report(statuses: list[TableStatus]) -> str:
    lines = [
        "## BigQuery Warehouse Freshness Report",
        f"\nGenerated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        f"Threshold: {STALE_THRESHOLD_HOURS:.0f}h\n",
        "| Table | Dataset | Last Modified (UTC) | Age (h) | Rows | Status |",
        "|-------|---------|--------------------|---------|----- |--------|",
    ]
    for s in statuses:
        ts = s.last_modified.strftime("%Y-%m-%d %H:%M") if s.last_modified else "—"
        age = f"{s.age_hours:.1f}" if s.age_hours is not None else "—"
        rows = str(s.row_count) if s.row_count is not None else "—"
        flag = s.status if s.status != "OK" else "ok"
        lines.append(f"| {s.friendly} | {s.dataset} | {ts} | {age} | {rows} | {flag} |")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="BQ warehouse freshness check")
    parser.add_argument("--json", dest="as_json", action="store_true")
    parser.add_argument("--alert", action="store_true",
                        help="Exit 1 if any table is stale or missing (for CI/cron)")
    args = parser.parse_args()

    statuses = check_all()
    violations = [s for s in statuses if s.status in ("STALE", "MISSING", "ERROR")]

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
        print(json.dumps({"results": out, "violations": len(violations)}, indent=2))
    else:
        print(_markdown_report(statuses))
        if violations:
            print()
            for v in violations:
                detail = f"age={v.age_hours:.1f}h" if v.age_hours is not None else (v.error or "no data")
                print(f"  {v.status}: {BQ_PROJECT}.{v.dataset}.{v.table} ({detail})")

    return 1 if (args.alert and violations) else 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
