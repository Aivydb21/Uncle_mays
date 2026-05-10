"""End-to-end refresh: pull every source, then rebuild the dataset.

  python -m ml.run_pipeline                # full refresh
  python -m ml.run_pipeline --skip-apollo  # skip the slow 3k-contact pull
  python -m ml.run_pipeline --skip-bq      # skip the BigQuery pull (saves API quota)
"""

from __future__ import annotations

import argparse
import time
import traceback

from ml.features import build_dataset
from ml.ingest import (
    apollo,
    airtable as airtable_ingest,
    bigquery_ads_loader,
    bigquery_ga4,
    bigquery_stripe_loader,
    census,
    checkout_store,
    clarity,
    google_ads,
    mailchimp,
    meta_ads,
    resend as resend_ingest,
    stripe as stripe_ingest,
)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--skip-apollo", action="store_true")
    p.add_argument("--skip-bq", action="store_true")
    p.add_argument("--skip-mailchimp", action="store_true")
    p.add_argument("--skip-resend", action="store_true")
    p.add_argument("--skip-census", action="store_true")
    p.add_argument("--skip-meta-ads", action="store_true")
    p.add_argument("--skip-google-ads", action="store_true")
    p.add_argument("--skip-clarity", action="store_true")
    p.add_argument("--skip-airtable", action="store_true")
    p.add_argument("--skip-bq-load", action="store_true",
                   help="Skip loading parquets to BigQuery warehouse")
    args = p.parse_args()

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
    if not args.skip_clarity:
        steps.append(("clarity", clarity.extract))
    if not args.skip_airtable:
        steps.append(("airtable", airtable_ingest.extract))

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
        for name, fn in [
            ("bq_stripe_loader", bigquery_stripe_loader.load_all),
            ("bq_ads_loader", bigquery_ads_loader.load_all),
        ]:
            t0 = time.time()
            try:
                fn()
                print(f"[OK] {name} in {time.time() - t0:.1f}s")
            except Exception as e:
                print(f"[FAIL] {name}: {e}")
                traceback.print_exc()

    print("\n--- building dataset ---")
    build_dataset.build()


if __name__ == "__main__":
    main()
