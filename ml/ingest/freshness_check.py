"""Pipeline freshness alert.

Reads the most recent parquet mtime for each source in ml/data/raw/,
compares against per-source max-age thresholds, prints a markdown table,
and exits non-zero if any source exceeds its threshold.

Usage:
    python3 -m ml.ingest.freshness_check          # normal check
    python3 -m ml.ingest.freshness_check --json   # machine-readable output
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from ml.ingest._common import DATA_RAW

# ---------------------------------------------------------------------------
# Per-source thresholds (hours)
# ---------------------------------------------------------------------------
# Groups: (glob_prefix, max_age_hours, cadence_note)
THRESHOLDS: list[tuple[str, float, str]] = [
    # GA4 — daily BQ export with 2h buffer
    ("ga4_events", 26, "daily +2h buffer"),
    ("ga4_session_summary", 26, "daily +2h buffer"),
    # Apollo — 2-day cadence with buffer
    # 48h nominal cadence + 12h buffer for timing drift and skip-day scheduling jitter
    # Raised from 54h → 60h (UNC-1069): 54h was too tight; daily runs with --skip-apollo
    # can land the file at T+48h+delay, reliably exceeding 54h.
    ("apollo_contacts", 60, "2-day cadence +12h buffer"),
    # Stripe — daily
    ("stripe_payment_intents", 26, "daily"),
    ("stripe_charges", 26, "daily"),
    ("stripe_customers", 26, "daily"),
    ("stripe_checkout_sessions", 26, "daily"),
    ("stripe_invoices", 26, "daily"),
    ("stripe_subscriptions", 26, "daily"),
    # Mailchimp — daily
    ("mailchimp_members", 26, "daily"),
    # Airtable — daily
    ("airtable_catalog", 26, "daily"),
    ("airtable_pickup_slots", 26, "daily"),
    ("airtable_suppliers", 26, "daily"),
    # Ads — daily
    ("google_ads_campaign_insights", 26, "daily"),
    ("meta_campaign_insights", 26, "daily"),
    ("meta_campaigns", 26, "daily"),
    # Resend — daily
    ("resend_emails", 26, "daily"),
    # Census ACS — weekly (8 days = 192h)
    ("census_acs_zip", 192, "weekly +1day buffer"),
    # LogRocket — daily (replaced Clarity 2026-05-18)
    ("logrocket_sessions", 26, "daily"),
]


_EMPTY_PARQUET_BYTES = 1024  # files under 1 KB have 0 useful rows


def _latest_mtime(prefix: str) -> tuple[datetime | None, bool]:
    """Return (mtime, is_empty) for the newest parquet matching the prefix.

    is_empty is True when the file exists but is smaller than the minimum
    meaningful size (i.e. it was written as an error placeholder).
    """
    files = sorted(DATA_RAW.glob(f"{prefix}_*.parquet"))
    if not files:
        return None, False
    latest = files[-1]
    mtime = datetime.fromtimestamp(latest.stat().st_mtime, tz=timezone.utc)
    is_empty = latest.stat().st_size < _EMPTY_PARQUET_BYTES
    return mtime, is_empty


def check_freshness() -> list[dict]:
    """Return a list of result dicts, one per source."""
    now = datetime.now(timezone.utc)
    results = []
    for prefix, max_age_h, note in THRESHOLDS:
        mtime, is_empty = _latest_mtime(prefix)
        if mtime is None:
            age_h = None
            status = "MISSING"
        elif is_empty:
            age_h = (now - mtime).total_seconds() / 3600
            status = "EMPTY"  # file written but contains 0 useful rows (API error)
        else:
            age_h = (now - mtime).total_seconds() / 3600
            status = "STALE" if age_h > max_age_h else "OK"
        results.append(
            {
                "source": prefix,
                "last_updated": mtime.isoformat() if mtime else None,
                "age_hours": round(age_h, 1) if age_h is not None else None,
                "threshold_hours": max_age_h,
                "cadence": note,
                "status": status,
            }
        )
    return results


def _markdown_table(results: list[dict]) -> str:
    header = "| Source | Last Updated (UTC) | Age (h) | Threshold (h) | Status |"
    sep    = "|--------|-------------------|---------|---------------|--------|"
    rows = []
    for r in results:
        ts = r["last_updated"][:16].replace("T", " ") if r["last_updated"] else "—"
        age = f"{r['age_hours']:.1f}" if r["age_hours"] is not None else "—"
        flag = {"STALE": "STALE", "MISSING": "MISSING", "EMPTY": "EMPTY"}.get(r["status"], "ok")
        rows.append(f"| {r['source']} | {ts} | {age} | {r['threshold_hours']} | {flag} |")
    return "\n".join([header, sep] + rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Pipeline freshness check")
    parser.add_argument("--json", dest="as_json", action="store_true",
                        help="Output machine-readable JSON instead of markdown")
    args = parser.parse_args()

    results = check_freshness()
    violations = [r for r in results if r["status"] in ("STALE", "MISSING", "EMPTY")]

    if args.as_json:
        print(json.dumps({"results": results, "violations": violations}, indent=2))
    else:
        print("## Pipeline Freshness Report")
        print(f"\nGenerated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n")
        print(_markdown_table(results))

        if violations:
            print()
            for v in violations:
                print(f"STALE: {v['source']} (age={v['age_hours']}h, threshold={v['threshold_hours']}h)")

    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
