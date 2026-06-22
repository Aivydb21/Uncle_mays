"""End-to-end refresh: pull every source, then rebuild the dataset.

  python -m ml.run_pipeline                # full refresh
  python -m ml.run_pipeline --skip-apollo  # skip the slow 3k-contact pull
  python -m ml.run_pipeline --skip-bq      # skip the BigQuery pull (saves API quota)
"""

from __future__ import annotations

import argparse
import os
import sys
import time
import traceback
from pathlib import Path

from ml.features import build_dataset
from ml.ingest import (
    apollo,
    airtable as airtable_ingest,
    bigquery_ads_loader,
    bigquery_crm_loader,
    bigquery_ga4,
    bigquery_logrocket_loader,
    bigquery_galileo_fix_tracking,
    bigquery_reconciliation_alert,
    bigquery_stripe_loader,
    census,
    checkout_store,
    google_ads,
    logrocket as logrocket_ingest,
    mailchimp,
    meta_ads,
    resend as resend_ingest,
    stripe as stripe_ingest,
)


_LOCK_FILE = Path(__file__).parent / "data" / ".pipeline.lock"


def _acquire_lock() -> None:
    """Abort if another pipeline instance is already running.

    Uses atomic O_CREAT|O_EXCL file creation — safe on Windows and Unix.
    Clears stale locks (process no longer running) before checking.
    """
    if _LOCK_FILE.exists():
        try:
            stale_pid = int(_LOCK_FILE.read_text().strip())
            # Check if that process is still alive
            try:
                os.kill(stale_pid, 0)
                # Process is alive — another pipeline is running
                print(
                    f"[run_pipeline] ABORT: another pipeline instance is running "
                    f"(PID {stale_pid}, lock={_LOCK_FILE}). "
                    "Concurrent Galileo calls cause hangs. Exiting."
                )
                sys.exit(1)
            except (ProcessLookupError, PermissionError):
                # Stale lock — process is gone, safe to remove
                print(f"[run_pipeline] removing stale lock (PID {stale_pid} is gone)")
                _LOCK_FILE.unlink(missing_ok=True)
        except (ValueError, OSError):
            _LOCK_FILE.unlink(missing_ok=True)

    try:
        fd = os.open(str(_LOCK_FILE), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
    except FileExistsError:
        print(
            f"[run_pipeline] ABORT: lock file appeared between check and create "
            f"({_LOCK_FILE}). Another run just started. Exiting."
        )
        sys.exit(1)


def _release_lock() -> None:
    _LOCK_FILE.unlink(missing_ok=True)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--skip-apollo", action="store_true")
    p.add_argument("--skip-bq", action="store_true")
    p.add_argument("--skip-mailchimp", action="store_true")
    p.add_argument("--skip-resend", action="store_true")
    p.add_argument("--skip-census", action="store_true")
    p.add_argument("--skip-meta-ads", action="store_true")
    p.add_argument("--skip-google-ads", action="store_true")
    p.add_argument("--skip-airtable", action="store_true")
    p.add_argument("--skip-logrocket", action="store_true",
                   help="Skip LogRocket + Galileo ingest (each prompt ~10 min)")
    p.add_argument("--skip-bq-load", action="store_true",
                   help="Skip loading parquets to BigQuery warehouse")
    args = p.parse_args()

    _acquire_lock()
    try:
        _run(args)
    finally:
        _release_lock()


def _run(args: argparse.Namespace) -> None:
    steps: list[tuple[str, callable]] = [
        ("checkout_store", checkout_store.extract),
        ("stripe", stripe_ingest.extract),
    ]
    if not args.skip_mailchimp:
        steps.append(("mailchimp", mailchimp.extract))
    if not args.skip_resend:
        steps.append(("resend", resend_ingest.extract))
    if not args.skip_apollo:
        steps.append(("apollo", apollo.extract))
    if not args.skip_bq:
        steps.append(("bigquery_ga4", bigquery_ga4.extract))
    if not args.skip_census:
        steps.append(("census", census.extract))
    if not args.skip_meta_ads:
        steps.append(("meta_ads", meta_ads.extract))
    if not args.skip_google_ads:
        steps.append(("google_ads", google_ads.extract))
    if not args.skip_airtable:
        steps.append(("airtable", airtable_ingest.extract))
    # LogRocket / Galileo: slow (each prompt ~10 min via MCP polling).
    # Excluded from fast/ad-hoc runs; include in daily pipeline explicitly.
    if not args.skip_logrocket:
        steps.append(("logrocket", lambda: logrocket_ingest.extract(session_summary=True)))

    for name, fn in steps:
        t0 = time.time()
        try:
            fn()
            print(f"[OK] {name} in {time.time() - t0:.1f}s")
        except Exception as e:
            print(f"[FAIL] {name}: {e}")
            traceback.print_exc()

    # --- BigQuery warehouse load (after parquets are fresh) ---
    if not args.skip_bq_load:
        print("\n--- loading to BigQuery warehouse ---")
        bq_steps = [
            ("bq_stripe_loader", bigquery_stripe_loader.load_all),
            ("bq_ads_loader", bigquery_ads_loader.load_all),
            ("bq_crm_loader", bigquery_crm_loader.load_all),
        ]
        if not args.skip_logrocket:
            bq_steps += [
                ("bq_logrocket_loader", bigquery_logrocket_loader.load_all),
                ("bq_galileo_fix_tracking", bigquery_galileo_fix_tracking.sync),
            ]
        for name, fn in bq_steps:
            t0 = time.time()
            try:
                fn()
                print(f"[OK] {name} in {time.time() - t0:.1f}s")
            except Exception as e:
                print(f"[FAIL] {name}: {e}")
                traceback.print_exc()

    print("\n--- building dataset ---")
    build_dataset.build()

    # --- Reconciliation alert (after BQ loads + dataset build) ---
    if not args.skip_bq_load:
        print("\n--- reconciliation alert ---")
        t0 = time.time()
        try:
            bigquery_reconciliation_alert.run()
            print(f"[OK] reconciliation_alert in {time.time() - t0:.1f}s")
        except Exception as e:
            print(f"[FAIL] reconciliation_alert: {e}")
            traceback.print_exc()


if __name__ == "__main__":
    main()
