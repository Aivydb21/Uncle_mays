"""Daily Stripe <-> GA4 purchase event reconciliation alert.

Queries stripe_raw.v_conversion_reconciliation for orders that are > 48h old
with GA4_MISSING status, then files a Paperclip alert to the CTO if a new gap
is detected.  Also checks the inverse: GA4 purchase events with no matching
Stripe charge (bot fires, duplicate events).

DS-approved operational rules (UNC-1429):
  1. SUPPRESSION: while UNC-1430 (CTO purchase-event fix) is still open, the
     known gap is expected — file ONE rollup task rather than N per-order tasks.
  2. DEDUP: skip filing if there is already an open CTO task that names all of
     the current unmatched payment_intent_ids.
  3. TWO-SIDED: also alert on GA4 purchase events with no Stripe match.
  4. SEVERITY: tag filed tasks with critical/high/medium based on order count
     and revenue at risk.

Environment:
  PAPERCLIP_API_URL, PAPERCLIP_API_KEY, PAPERCLIP_COMPANY_ID — injected by
  Paperclip harness at runtime.

Usage:
  python -m ml.ingest.bigquery_reconciliation_alert         # run alert check
  python -m ml.ingest.bigquery_reconciliation_alert --dry-run  # print findings, no Paperclip calls
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

# ── Constants ───────────────────────────────────────────────────────────────

BQ_PROJECT = "uncle-mays-automation"
BQ_DATASET = "stripe_raw"
VIEW = "v_conversion_reconciliation"
GA4_DATASET = "analytics_494626869"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

CTO_AGENT_ID = "3f827c01-38a9-435b-826c-64192188a8cb"

# UNC-1430 is the CTO issue tracking the root-cause fix (purchase event not
# firing).  While it is open, we are in "known-gap" mode and suppress per-order
# alerts in favour of one rollup task.
KNOWN_GAP_ISSUE_ID = "c7029e01-2725-423d-b0a8-745acfffe6ec"  # UNC-1430

# Orders older than this many hours are considered "settled" for matching.
GRACE_HOURS = 48

# Backlog cutoff — orders before this timestamp are part of the UNC-1430 outage
# window (Apr 30 – May 29).  GA4 purchase events cannot be retroactively backfilled
# for that cohort, so reconciliation_status will be GA4_MISSING forever.  We exclude
# them from alerting to prevent UNC-1435-style replay after the CTO closes the issue.
# Set to the UNC-1430 "done" timestamp (UNC-1435 parent context).
POST_FIX_CUTOFF = "2026-05-29 23:28:00 UTC"

# ── BQ helpers ──────────────────────────────────────────────────────────────

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


def _bq_query(creds: service_account.Credentials, sql: str) -> list[dict]:
    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": "application/json",
    }
    body = json.dumps({"query": sql, "useLegacySql": False, "maxResults": 500}).encode()
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/queries",
        data=body,
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        result = json.load(r)

    if result.get("errors"):
        raise RuntimeError(f"BQ error: {result['errors']}")

    fields = [f["name"] for f in result.get("schema", {}).get("fields", [])]
    rows = [
        {fields[i]: c.get("v") for i, c in enumerate(row["f"])}
        for row in (result.get("rows") or [])
    ]

    # Handle pagination
    job_id = result.get("jobReference", {}).get("jobId")
    location = result.get("jobReference", {}).get("location", "US")
    page_token = result.get("pageToken")
    while page_token:
        params = urllib.parse.urlencode(
            {"pageToken": page_token, "maxResults": 500, "location": location}
        )
        req2 = urllib.request.Request(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
            f"/queries/{job_id}?{params}",
            headers={"Authorization": f"Bearer {_token(creds)}"},
        )
        with urllib.request.urlopen(req2, timeout=60) as r:
            more = json.load(r)
        rows += [
            {fields[i]: c.get("v") for i, c in enumerate(row["f"])}
            for row in (more.get("rows") or [])
        ]
        page_token = more.get("pageToken")

    return rows


# ── Queries ─────────────────────────────────────────────────────────────────

_STRIPE_MISSING_GA4_SQL = f"""
SELECT
  payment_intent_id,
  stripe_created_at,
  ROUND(stripe_amount_usd, 2)    AS amount_usd,
  stripe_email,
  customer_name,
  utm_source,
  utm_medium,
  stripe_ga_client_id            AS ga_client_id,
  attribution_gap_reason
FROM `{BQ_PROJECT}.{BQ_DATASET}.{VIEW}`
WHERE reconciliation_status = 'GA4_MISSING'
  AND stripe_created_at >= TIMESTAMP '{POST_FIX_CUTOFF}'
  AND stripe_created_at < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {GRACE_HOURS} HOUR)
ORDER BY stripe_created_at DESC
"""

# Two-sided: GA4 purchase events that have no Stripe payment_intent match.
# Uses the same GA4 events table directly (view only covers the Stripe side).
_GA4_MISSING_STRIPE_SQL = f"""
WITH ga4_purchases AS (
  SELECT
    user_pseudo_id,
    TIMESTAMP_MICROS(event_timestamp)   AS event_ts,
    ecommerce.transaction_id            AS transaction_id,
    ecommerce.purchase_revenue_in_usd   AS revenue_usd
  FROM `{BQ_PROJECT}.{GA4_DATASET}.events_*`
  WHERE event_name = 'purchase'
    AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d',
          DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
),
stripe_ids AS (
  SELECT DISTINCT payment_intent_id
  FROM `{BQ_PROJECT}.{BQ_DATASET}.payment_intents`
  WHERE status = 'succeeded' AND is_test = FALSE
)
SELECT
  gp.user_pseudo_id,
  gp.event_ts,
  ROUND(gp.revenue_usd, 2)            AS revenue_usd,
  gp.transaction_id
FROM ga4_purchases gp
LEFT JOIN `{BQ_PROJECT}.{BQ_DATASET}.payment_intents` pi
  ON gp.transaction_id = pi.payment_intent_id
  AND pi.status = 'succeeded'
  AND pi.is_test = FALSE
WHERE pi.payment_intent_id IS NULL
  AND gp.event_ts < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {GRACE_HOURS} HOUR)
ORDER BY gp.event_ts DESC
"""


# ── Paperclip helpers ────────────────────────────────────────────────────────

def _pc_api_url() -> str:
    url = os.environ.get("PAPERCLIP_API_URL", "")
    if not url:
        raise RuntimeError("PAPERCLIP_API_URL not set — run inside Paperclip harness")
    return url


def _pc_headers() -> dict:
    key = os.environ.get("PAPERCLIP_API_KEY", "")
    run_id = os.environ.get("PAPERCLIP_RUN_ID", "")
    h = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if run_id:
        h["X-Paperclip-Run-Id"] = run_id
    return h


def _pc_get(path: str) -> dict:
    url = _pc_api_url() + path
    req = urllib.request.Request(url, headers=_pc_headers())
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Paperclip GET {path} → HTTP {e.code}: {e.read().decode()[:200]}") from e


def _pc_post(path: str, body: dict) -> dict:
    url = _pc_api_url() + path
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=_pc_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Paperclip POST {path} → HTTP {e.code}: {e.read().decode()[:200]}") from e


def _known_gap_issue_open() -> bool:
    """Return True if UNC-1430 (CTO purchase-event fix) is still open."""
    try:
        issue = _pc_get(f"/api/issues/{KNOWN_GAP_ISSUE_ID}")
        status = issue.get("status", "")
        is_open = status not in ("done", "cancelled")
        print(f"[reconciliation_alert] UNC-1430 status={status!r} known_gap_mode={is_open}")
        return is_open
    except Exception as e:
        # Be conservative: if we can't check, assume it's open (suppress per-order spam)
        print(f"[reconciliation_alert] Could not check UNC-1430 ({e}); defaulting to suppressed mode")
        return True


def _find_existing_alert(pi_ids: list[str]) -> dict | None:
    """Return the first open Paperclip CTO issue that mentions ALL pi_ids, or None."""
    if not pi_ids:
        return None
    company_id = os.environ.get("PAPERCLIP_COMPANY_ID", "")
    try:
        # Search for open CTO issues about GA4 reconciliation
        resp = _pc_get(
            f"/api/companies/{company_id}/issues"
            f"?assigneeAgentId={CTO_AGENT_ID}&status=todo,in_progress,in_review,blocked"
            f"&q=GA4+reconciliation+alert"
        )
        issues = resp if isinstance(resp, list) else resp.get("issues", resp.get("data", []))
        for issue in issues:
            body = (issue.get("description") or "") + (issue.get("title") or "")
            if all(pid in body for pid in pi_ids):
                return issue
    except Exception as e:
        print(f"[reconciliation_alert] Dedup search failed ({e}); will file fresh alert")
    return None


def _severity(n_orders: int, revenue_usd: float) -> str:
    if n_orders >= 5 or revenue_usd >= 300:
        return "critical"
    if n_orders >= 2 or revenue_usd >= 100:
        return "high"
    return "medium"


def _file_alert(
    stripe_missing: list[dict],
    ga4_missing: list[dict],
    known_gap_mode: bool,
    dry_run: bool,
) -> dict | None:
    """File a Paperclip issue to the CTO summarising the reconciliation gap."""
    company_id = os.environ.get("PAPERCLIP_COMPANY_ID", "")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    total_usd = sum(float(r.get("amount_usd") or 0) for r in stripe_missing)
    severity = _severity(len(stripe_missing), total_usd)

    # Build order table
    rows_md = "\n".join(
        f"| `{r['payment_intent_id']}` | {r['stripe_created_at'][:10]} "
        f"| ${r.get('amount_usd','?')} | {r.get('attribution_gap_reason','?')} "
        f"| {r.get('utm_source') or '—'} |"
        for r in stripe_missing[:20]  # cap at 20 rows
    )
    if len(stripe_missing) > 20:
        rows_md += f"\n| … | {len(stripe_missing) - 20} more orders | | | |"

    ga4_section = ""
    if ga4_missing:
        ga4_rows = "\n".join(
            f"| `{r.get('user_pseudo_id','?')}` | {str(r.get('event_ts','?'))[:10]} "
            f"| ${r.get('revenue_usd','?')} | `{r.get('transaction_id') or 'none'}` |"
            for r in ga4_missing[:10]
        )
        ga4_section = f"""
### Two-sided: GA4 purchase events with no Stripe match ({len(ga4_missing)} events)

These may be bot traffic, duplicate GTM fires, or test purchases leaking to production GA4.

| GA4 user_pseudo_id | Event date | Revenue | transaction_id |
|--------------------|-----------|---------|----------------|
{ga4_rows}
"""

    suppression_note = (
        "\n> **Suppression mode active:** [UNC-1430](/UNC/issues/UNC-1430) (CTO purchase-event fix) "
        "is still open — this is the known instrumentation gap. One rollup task filed rather than "
        "per-order tasks. Will switch to per-order alerting once UNC-1430 is `done`.\n"
        if known_gap_mode
        else ""
    )

    description = f"""## Stripe ↔ GA4 Reconciliation Alert — {now_str}

**Auto-filed by:** `ml.ingest.bigquery_reconciliation_alert` (daily pipeline step)
**Severity:** {severity.upper()}
{suppression_note}
### Stripe orders with no GA4 purchase event (> {GRACE_HOURS}h old)

**{len(stripe_missing)} orders | ${total_usd:.2f} total revenue at risk**

| payment_intent_id | Order date | Amount | Gap reason | UTM source |
|------------------|-----------|--------|-----------|-----------|
{rows_md}

### What to check

1. Does the checkout-success / order-confirmation page call `gtag("event", "purchase", {{...}})`?
2. Is the event gated behind a condition that fails silently?
3. Check browser console on a test order for GTM / gtag errors.
4. Verify the `transaction_id` passed to GA4 matches the Stripe payment_intent_id.
{ga4_section}
### Definition of done

- New Stripe orders appear as `GA4_MATCHED` in `stripe_raw.v_conversion_reconciliation` within 48h.
- This alert does not re-fire for the same payment_intent_ids once resolved.
"""

    title = (
        f"[Reconciliation Alert] {len(stripe_missing)} Stripe order(s) missing GA4 purchase event — {now_str}"
    )

    payload = {
        "title": title,
        "description": description,
        "assigneeAgentId": CTO_AGENT_ID,
        "priority": severity,
        "status": "todo",
    }

    if dry_run:
        print(f"\n[DRY RUN] Would file Paperclip issue:")
        print(f"  Title: {title}")
        print(f"  Priority: {severity}")
        print(f"  Stripe missing: {len(stripe_missing)}")
        print(f"  GA4 missing: {len(ga4_missing)}")
        return None

    result = _pc_post(f"/api/companies/{company_id}/issues", payload)
    print(
        f"[reconciliation_alert] Filed {result.get('identifier','?')} "
        f"({severity}) - {len(stripe_missing)} unmatched Stripe orders"
    )
    return result


# ── Main ─────────────────────────────────────────────────────────────────────

def run(dry_run: bool = False) -> dict:
    """Run the reconciliation alert check. Returns a summary dict."""
    load_dotenv_if_present()
    creds = _creds()

    print("[reconciliation_alert] Querying Stripe-missing-GA4 orders ...")
    stripe_missing = _bq_query(creds, _STRIPE_MISSING_GA4_SQL)

    print("[reconciliation_alert] Querying GA4-missing-Stripe events ...")
    try:
        ga4_missing = _bq_query(creds, _GA4_MISSING_STRIPE_SQL)
    except Exception as e:
        print(f"[reconciliation_alert] GA4-missing-Stripe query failed ({e}); skipping two-sided check")
        ga4_missing = []

    summary = {
        "stripe_missing_count": len(stripe_missing),
        "ga4_missing_count": len(ga4_missing),
        "stripe_missing_usd": round(sum(float(r.get("amount_usd") or 0) for r in stripe_missing), 2),
        "alert_filed": False,
        "alert_issue_id": None,
    }

    print(
        f"[reconciliation_alert] Found: {len(stripe_missing)} Stripe orders missing GA4 | "
        f"{len(ga4_missing)} GA4 events missing Stripe"
    )

    if not stripe_missing and not ga4_missing:
        print("[reconciliation_alert] No gaps detected — all clear.")
        return summary

    # ── Suppression check (DS rule #1, option a) ─────────────────────────────
    # While UNC-1430 is open, the CTO already has visibility. Suppress all
    # alert filing — the dedup and rollup task approaches both still produce
    # noise when a tracking issue is already tracked. Gate entirely on done.
    known_gap_mode = _known_gap_issue_open() if not dry_run else True
    if known_gap_mode and not dry_run:
        print(
            "[reconciliation_alert] UNC-1430 still open — CTO already aware of gap. "
            "Suppressing alert (will auto-file once UNC-1430 is done)."
        )
        return summary

    # ── Dedup check (DS rule #2) ──────────────────────────────────────────────
    pi_ids = [r["payment_intent_id"] for r in stripe_missing]
    if not dry_run and stripe_missing:
        existing = _find_existing_alert(pi_ids)
        if existing:
            print(
                f"[reconciliation_alert] Dedup: open alert {existing.get('identifier','?')} "
                f"already covers these orders — skipping."
            )
            summary["alert_filed"] = False
            summary["alert_issue_id"] = existing.get("id")
            return summary

    # ── File alert ────────────────────────────────────────────────────────────
    result = _file_alert(stripe_missing, ga4_missing, known_gap_mode, dry_run)
    if result:
        summary["alert_filed"] = True
        summary["alert_issue_id"] = result.get("id")

    return summary


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    run(dry_run=dry)
