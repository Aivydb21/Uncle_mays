"""Build and query the Stripe <-> GA4 conversion reconciliation view in BigQuery.

Destination: uncle-mays-automation.stripe_raw.v_conversion_reconciliation

The view left-joins every non-test succeeded Stripe payment_intent against
GA4 purchase events using ga_client_id (Stripe metadata) = user_pseudo_id
(GA4 BQ export).  Each row surfaces whether GA4 fired a purchase event for
a given Stripe order, enabling:
  - CTO: daily pixel-gap monitoring (GA4_MISSING vs GA4_MATCHED)
  - Decision Scientist: ground-truth conversion funnel and CAC by channel
  - Data team: CAPI calibration (Stripe is source-of-truth; pixel/CAPI are
    compared against it)

Usage:
  python -m ml.ingest.bigquery_conversion_reconciliation            # create/replace view + print summary
  python -m ml.ingest.bigquery_conversion_reconciliation --summary  # query existing view, print summary only
  python -m ml.ingest.bigquery_conversion_reconciliation --dry-run  # print SQL only

Auth: ~/.claude/ga-service-account.json
  Requires roles/bigquery.dataEditor on uncle-mays-automation (same SA used
  by bigquery_stripe_loader and bigquery_ga4).
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone

from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
BQ_DATASET = "stripe_raw"
VIEW_NAME = "v_conversion_reconciliation"
GA4_DATASET = "analytics_494626869"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

# View SQL — left-join Stripe succeeded payments against GA4 purchase events.
# ga_client_id (Stripe) matches user_pseudo_id (GA4) — both use the GA4 client
# ID format (e.g. "1234567890.1234567890").
VIEW_SQL = f"""
SELECT
  pi.payment_intent_id,
  pi.created_at                          AS stripe_created_at,
  pi.amount_cents / 100.0                AS stripe_amount_usd,
  pi.email                               AS stripe_email,
  pi.customer_name,
  pi.utm_source,
  pi.utm_medium,
  pi.utm_campaign,
  pi.ga_client_id                        AS stripe_ga_client_id,
  pi.fbclid                              AS stripe_fbclid,
  pi.gclid                               AS stripe_gclid,
  pi.fbc                                 AS stripe_fbc,
  pi.fbp                                 AS stripe_fbp,
  pi.promo_code,
  pi.fulfillment_mode,
  pi.shipping_city,
  pi.shipping_zip,

  ga4.user_pseudo_id                     AS ga4_user_pseudo_id,
  ga4.event_timestamp                    AS ga4_purchase_event_timestamp,
  ga4.transaction_id                     AS ga4_transaction_id,
  ga4.purchase_revenue_usd               AS ga4_purchase_revenue_usd,
  ga4.ga4_source                         AS ga4_source,
  ga4.ga4_medium                         AS ga4_medium,
  ga4.ga4_gclid                          AS ga4_gclid,

  CASE
    WHEN ga4.user_pseudo_id IS NOT NULL THEN 'GA4_MATCHED'
    ELSE 'GA4_MISSING'
  END                                    AS reconciliation_status,

  CASE
    WHEN pi.ga_client_id IS NULL THEN 'NO_GA_CLIENT_ID'
    WHEN ga4.user_pseudo_id IS NOT NULL THEN 'MATCHED'
    ELSE 'CLIENT_ID_NOT_IN_GA4'
  END                                    AS attribution_gap_reason

FROM `{BQ_PROJECT}.{BQ_DATASET}.payment_intents` pi

LEFT JOIN (
  SELECT
    user_pseudo_id,
    event_timestamp,
    ecommerce.transaction_id                          AS transaction_id,
    ecommerce.purchase_revenue_in_usd                 AS purchase_revenue_usd,
    collected_traffic_source.manual_source            AS ga4_source,
    collected_traffic_source.manual_medium            AS ga4_medium,
    collected_traffic_source.gclid                    AS ga4_gclid
  FROM `{BQ_PROJECT}.{GA4_DATASET}.events_*`
  WHERE event_name = 'purchase'
) ga4
  ON pi.ga_client_id = ga4.user_pseudo_id

WHERE pi.status = 'succeeded'
  AND pi.is_test = FALSE
"""

SUMMARY_SQL = f"""
SELECT
  reconciliation_status,
  attribution_gap_reason,
  COUNT(*)                        AS order_count,
  ROUND(SUM(stripe_amount_usd),2) AS total_usd,
  ROUND(AVG(stripe_amount_usd),2) AS avg_order_usd,
  COUNTIF(utm_source IS NOT NULL) AS orders_with_utm
FROM `{BQ_PROJECT}.{BQ_DATASET}.{VIEW_NAME}`
GROUP BY 1, 2
ORDER BY order_count DESC
"""


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


def _bq_request(
    creds: service_account.Credentials,
    url: str,
    body: dict | None = None,
    method: str | None = None,
) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    m = method or ("POST" if data else "GET")
    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=m)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"BQ HTTP {e.code}: {e.read().decode()[:400]}") from e


def _bq_query(creds: service_account.Credentials, sql: str) -> list[dict]:
    """Run a synchronous BQ query and return rows as list of dicts."""
    import urllib.parse

    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": "application/json",
    }
    body = json.dumps({"query": sql, "useLegacySql": False, "maxResults": 1000}).encode()
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/queries",
        data=body,
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        result = json.load(r)

    if result.get("errors"):
        raise RuntimeError(f"BQ query error: {result['errors']}")

    fields = [f["name"] for f in result.get("schema", {}).get("fields", [])]
    rows = []
    for row in result.get("rows", []) or []:
        rows.append({fields[i]: c.get("v") for i, c in enumerate(row["f"])})

    job_id = result.get("jobReference", {}).get("jobId")
    location = result.get("jobReference", {}).get("location", "US")
    page_token = result.get("pageToken")
    while page_token:
        params = urllib.parse.urlencode(
            {"pageToken": page_token, "maxResults": 1000, "location": location}
        )
        req2 = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/queries/{job_id}?{params}",
            headers={"Authorization": f"Bearer {_token(creds)}"},
        )
        with urllib.request.urlopen(req2, timeout=60) as r:
            more = json.load(r)
        for row in more.get("rows", []) or []:
            rows.append({fields[i]: c.get("v") for i, c in enumerate(row["f"])})
        page_token = more.get("pageToken")

    return rows


def create_view(creds: service_account.Credentials) -> None:
    """Create or replace stripe_raw.v_conversion_reconciliation in BigQuery."""
    url = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/datasets/{BQ_DATASET}/tables/{VIEW_NAME}"
    )
    body = {
        "tableReference": {
            "projectId": BQ_PROJECT,
            "datasetId": BQ_DATASET,
            "tableId": VIEW_NAME,
        },
        "view": {"query": VIEW_SQL, "useLegacySql": False},
        "description": (
            "Stripe <-> GA4 conversion reconciliation. "
            "Left-joins non-test succeeded Stripe payment_intents against GA4 purchase events "
            "on ga_client_id = user_pseudo_id. "
            "reconciliation_status: GA4_MATCHED | GA4_MISSING. "
            "Built by bigquery_conversion_reconciliation.py."
        ),
    }

    # Try insert first; if 409 (already exists), patch instead.
    insert_url = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/datasets/{BQ_DATASET}/tables"
    )
    try:
        _bq_request(creds, insert_url, body)
        print(f"[reconciliation] Created view {BQ_PROJECT}.{BQ_DATASET}.{VIEW_NAME}")
    except RuntimeError as e:
        if "409" in str(e) or "Already Exists" in str(e):
            # PATCH (update) existing view
            patch_url = (
                f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
                f"/datasets/{BQ_DATASET}/tables/{VIEW_NAME}"
            )
            _bq_request(creds, patch_url, body, method="PUT")
            print(f"[reconciliation] Replaced existing view {BQ_PROJECT}.{BQ_DATASET}.{VIEW_NAME}")
        else:
            raise


def print_summary(creds: service_account.Credentials) -> list[dict]:
    """Query the reconciliation view and print a markdown summary table."""
    print(f"\n[reconciliation] Querying {BQ_PROJECT}.{BQ_DATASET}.{VIEW_NAME} ...")
    rows = _bq_query(creds, SUMMARY_SQL)

    if not rows:
        print("No rows returned — view may be empty or stripe_raw.payment_intents has no succeeded rows.")
        return rows

    print(f"\n## Stripe <-> GA4 Conversion Reconciliation\n")
    print(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")
    print(f"| Status | Gap Reason | Orders | Revenue (USD) | AOV (USD) | Orders w/ UTM |")
    print(f"|--------|-----------|--------|--------------|-----------|---------------|")
    for r in rows:
        print(
            f"| {r['reconciliation_status']} | {r['attribution_gap_reason']} "
            f"| {r['order_count']} | ${r['total_usd']} | ${r['avg_order_usd']} "
            f"| {r['orders_with_utm']} |"
        )

    total_orders = sum(int(r["order_count"]) for r in rows)
    matched = sum(int(r["order_count"]) for r in rows if r["reconciliation_status"] == "GA4_MATCHED")
    missing = total_orders - matched
    print(
        f"\n**Summary:** {total_orders} real orders | "
        f"{matched} GA4-matched ({matched/max(total_orders,1)*100:.0f}%) | "
        f"{missing} GA4-missing ({missing/max(total_orders,1)*100:.0f}%)"
    )
    return rows


def run(dry_run: bool = False, summary_only: bool = False) -> None:
    load_dotenv_if_present()

    if dry_run:
        print("=== DRY RUN — VIEW SQL ===")
        print(VIEW_SQL)
        print("\n=== SUMMARY QUERY SQL ===")
        print(SUMMARY_SQL)
        return

    creds = _creds()

    if not summary_only:
        create_view(creds)

    print_summary(creds)


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    summary = "--summary" in sys.argv
    run(dry_run=dry, summary_only=summary)
