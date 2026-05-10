"""Load Meta Ads + Google Ads parquet snapshots to BigQuery.

Destination: project uncle-mays-automation, dataset ads_raw
Tables:
  ads_raw.meta_campaign_insights    -- from meta_campaign_insights_*.parquet
  ads_raw.google_ads_campaign_insights -- from google_ads_campaign_insights_*.parquet

Strategy:
  1. Merge all available snapshots for each source (dedup by date+campaign_id, keep latest).
  2. Create dataset ads_raw if it does not exist.
  3. Write tables using WRITE_TRUNCATE (full replace on each run).
  4. Use BQ Storage JSON load job (REST API, no external deps beyond google-auth).

Auth: ~/.claude/ga-service-account.json  (requires roles/bigquery.dataEditor on project).

PREREQUISITE (BLOCKED UNTIL DONE):
  Grant the service account write access before running:
    gcloud projects add-iam-policy-binding uncle-mays-automation \\
      --member='serviceAccount:claude-ga-reader@uncle-mays-automation.iam.gserviceaccount.com' \\
      --role='roles/bigquery.dataEditor'
  Or via GCP Console: IAM -> add member -> BigQuery Data Editor.
"""

from __future__ import annotations

import base64
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path

import polars as pl
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
BQ_DATASET = "ads_raw"
BQ_LOCATION = "US"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

# Polars dtype -> BQ type
_DTYPE_MAP: dict[str, str] = {
    "String": "STRING",
    "Utf8": "STRING",
    "Int64": "INTEGER",
    "Int32": "INTEGER",
    "Float64": "FLOAT",
    "Float32": "FLOAT",
    "Boolean": "BOOLEAN",
    "Date": "DATE",
    "Datetime": "TIMESTAMP",
}


def _creds() -> service_account.Credentials:
    p = os.path.expanduser(SA_PATH)
    creds = service_account.Credentials.from_service_account_file(
        p, scopes=["https://www.googleapis.com/auth/bigquery"]
    )
    creds.refresh(Request())
    return creds


def _headers(creds: service_account.Credentials) -> dict[str, str]:
    if not creds.valid:
        creds.refresh(Request())
    return {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": "application/json",
    }


def _bq_request(
    creds: service_account.Credentials,
    url: str,
    body: dict | None = None,
    method: str | None = None,
) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    m = method or ("POST" if data else "GET")
    req = urllib.request.Request(url, data=data, headers=_headers(creds), method=m)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"BQ HTTP {e.code}: {e.read().decode()[:400]}") from e


def _ensure_dataset(creds: service_account.Credentials) -> None:
    url = f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets/{BQ_DATASET}"
    req = urllib.request.Request(url, headers=_headers(creds))
    try:
        with urllib.request.urlopen(req, timeout=30):
            print(f"[bq_ads_loader] dataset {BQ_DATASET} already exists")
            return
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise RuntimeError(f"Dataset check failed: {e.read().decode()[:300]}") from e

    # Create dataset
    body = {
        "datasetReference": {"projectId": BQ_PROJECT, "datasetId": BQ_DATASET},
        "location": BQ_LOCATION,
        "description": "Raw ad spend from Meta Ads and Google Ads — loaded by bigquery_ads_loader.py",
    }
    _bq_request(
        creds,
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets",
        body,
    )
    print(f"[bq_ads_loader] created dataset {BQ_PROJECT}.{BQ_DATASET}")


def _polars_schema_to_bq(df: pl.DataFrame) -> list[dict]:
    fields = []
    for name, dtype in df.schema.items():
        bq_type = _DTYPE_MAP.get(str(dtype), "STRING")
        fields.append({"name": name, "type": bq_type, "mode": "NULLABLE"})
    return fields


def _df_to_newline_json(df: pl.DataFrame) -> bytes:
    """Serialize DataFrame to newline-delimited JSON bytes for BQ load job."""
    rows = df.to_dicts()
    lines = []
    for row in rows:
        # BQ load job wants None as absent key; serialize NaN/None cleanly
        clean = {k: v for k, v in row.items() if v is not None}
        lines.append(json.dumps(clean))
    return "\n".join(lines).encode("utf-8")


def _bq_load_job(
    creds: service_account.Credentials,
    table_id: str,
    df: pl.DataFrame,
) -> None:
    """Upload df to BQ via a load job (inline newline-JSON, WRITE_TRUNCATE)."""
    schema_fields = _polars_schema_to_bq(df)
    ndjson_bytes = _df_to_newline_json(df)

    # BQ multipart load: metadata part + data part
    boundary = "bq_load_boundary_xyzzy"
    metadata = {
        "configuration": {
            "load": {
                "destinationTable": {
                    "projectId": BQ_PROJECT,
                    "datasetId": BQ_DATASET,
                    "tableId": table_id,
                },
                "sourceFormat": "NEWLINE_DELIMITED_JSON",
                "writeDisposition": "WRITE_TRUNCATE",
                "schema": {"fields": schema_fields},
                "createDisposition": "CREATE_IF_NEEDED",
            }
        }
    }
    meta_bytes = json.dumps(metadata).encode("utf-8")

    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        + meta_bytes.decode("utf-8")
        + f"\r\n--{boundary}\r\n"
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + ndjson_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    url = (
        f"https://www.googleapis.com/upload/bigquery/v2/projects/{BQ_PROJECT}/jobs"
        "?uploadType=multipart"
    )
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "Content-Type": f"multipart/related; boundary={boundary}",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        job = json.load(r)

    job_id = job["jobReference"]["jobId"]
    print(f"[bq_ads_loader] load job {job_id} submitted for {BQ_DATASET}.{table_id}")

    # Poll for completion
    for _ in range(60):
        time.sleep(2)
        status_url = (
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/jobs/{job_id}"
        )
        status_req = urllib.request.Request(
            status_url, headers={"Authorization": f"Bearer {creds.token}"}
        )
        with urllib.request.urlopen(status_req, timeout=30) as r:
            status = json.load(r)
        state = status.get("status", {}).get("state")
        if state == "DONE":
            errs = status.get("status", {}).get("errors") or []
            if errs:
                raise RuntimeError(f"Load job errors: {errs}")
            stats = status.get("statistics", {}).get("load", {})
            rows = stats.get("outputRows", "?")
            print(f"[bq_ads_loader] {BQ_DATASET}.{table_id} loaded — {rows} rows")
            return
    raise TimeoutError(f"BQ load job {job_id} did not complete in 120s")


def _merge_parquets(pattern: str) -> pl.DataFrame:
    """Merge all snapshots matching pattern. Dedup by (date, campaign_id), keep latest row."""
    root = Path(__file__).resolve().parent.parent / "data" / "raw"
    files = sorted(root.glob(pattern))
    if not files:
        raise FileNotFoundError(f"No parquet files matching {root / pattern}")
    print(f"[bq_ads_loader] merging {len(files)} files: {[f.name for f in files]}")

    # Tag each file with its snapshot timestamp (encoded in filename)
    frames = []
    for f in files:
        df = pl.read_parquet(f)
        # Extract timestamp from filename e.g. meta_campaign_insights_20260502T183812Z.parquet
        ts_part = f.stem.rsplit("_", 1)[-1]  # e.g. 20260502T183812Z
        df = df.with_columns(pl.lit(ts_part).alias("_snapshot_ts"))
        frames.append(df)

    combined = pl.concat(frames)
    # Dedup: keep row with latest _snapshot_ts per (date, campaign_id)
    deduped = (
        combined.sort("_snapshot_ts", descending=True)
        .unique(subset=["date", "campaign_id"], keep="first")
        .drop("_snapshot_ts")
        .sort(["date", "campaign_id"])
    )
    return deduped


def load_meta(creds: service_account.Credentials) -> None:
    df = _merge_parquets("meta_campaign_insights_*.parquet")
    print(f"[bq_ads_loader] meta_campaign_insights: {df.shape[0]} rows, {df.shape[1]} cols")
    print(f"  schema: {dict(df.schema)}")
    _bq_load_job(creds, "meta_campaign_insights", df)


def load_google_ads(creds: service_account.Credentials) -> None:
    df = _merge_parquets("google_ads_campaign_insights_*.parquet")
    print(f"[bq_ads_loader] google_ads_campaign_insights: {df.shape[0]} rows, {df.shape[1]} cols")
    print(f"  schema: {dict(df.schema)}")
    _bq_load_job(creds, "google_ads_campaign_insights", df)


def load_all(dry_run: bool = False) -> None:
    """Entry point. Set dry_run=True to validate data without touching BQ."""
    load_dotenv_if_present()
    creds = _creds()

    # Validate parquet merge before touching BQ
    meta_df = _merge_parquets("meta_campaign_insights_*.parquet")
    gads_df = _merge_parquets("google_ads_campaign_insights_*.parquet")

    print(f"\n[dry_run={dry_run}] meta_campaign_insights: {meta_df.shape} rows x cols")
    print(f"[dry_run={dry_run}] google_ads_campaign_insights: {gads_df.shape} rows x cols")

    if dry_run:
        print("\nDRY RUN — schemas and row counts validated. Skipping BQ write.")
        print("Meta schema:   ", dict(meta_df.schema))
        print("Google schema: ", dict(gads_df.schema))
        return

    _ensure_dataset(creds)
    load_meta(creds)
    load_google_ads(creds)
    print("\n[bq_ads_loader] All tables loaded successfully.")
    print(f"  Tables: {BQ_PROJECT}.{BQ_DATASET}.meta_campaign_insights")
    print(f"          {BQ_PROJECT}.{BQ_DATASET}.google_ads_campaign_insights")


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    load_all(dry_run=dry)
