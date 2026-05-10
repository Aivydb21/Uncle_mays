"""Load Stripe raw parquet snapshots to BigQuery.

Destination: project uncle-mays-automation, dataset stripe_raw
Tables:
  stripe_raw.payment_intents      -- from stripe_payment_intents_*.parquet
  stripe_raw.checkout_sessions    -- from stripe_checkout_sessions_*.parquet
  stripe_raw.customers            -- from stripe_customers_*.parquet
  stripe_raw.charges              -- from stripe_charges_*.parquet
  stripe_raw.subscriptions        -- from stripe_subscriptions_*.parquet
  stripe_raw.invoices             -- from stripe_invoices_*.parquet

Strategy:
  1. Merge all available snapshots for each source (dedup by primary key, keep latest snapshot row).
  2. Create dataset stripe_raw if it does not exist.
  3. Write tables using WRITE_TRUNCATE (full replace on each run).
  4. Use BQ multipart JSON load job (REST API — no external deps beyond google-auth).

Auth: ~/.claude/ga-service-account.json
  Required roles: roles/bigquery.dataEditor on project uncle-mays-automation.
  Grant if missing:
    gcloud projects add-iam-policy-binding uncle-mays-automation \\
      --member='serviceAccount:claude-ga-reader@uncle-mays-automation.iam.gserviceaccount.com' \\
      --role='roles/bigquery.dataEditor'

Usage:
  python -m ml.ingest.bigquery_stripe_loader             # load all tables
  python -m ml.ingest.bigquery_stripe_loader --dry-run   # validate without writing to BQ
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import polars as pl
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
BQ_DATASET = "stripe_raw"
BQ_LOCATION = "US"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

# Map Polars dtype string prefixes -> BQ type
# Polars Datetime variants look like "Datetime[μs, UTC]" so we use startswith.
_DTYPE_MAP: list[tuple[str, str]] = [
    ("Datetime", "TIMESTAMP"),
    ("Date", "DATE"),
    ("Int64", "INTEGER"),
    ("Int32", "INTEGER"),
    ("UInt64", "INTEGER"),
    ("UInt32", "INTEGER"),
    ("Float64", "FLOAT"),
    ("Float32", "FLOAT"),
    ("Boolean", "BOOLEAN"),
    ("String", "STRING"),
    ("Utf8", "STRING"),
]

# Table definitions: (bq_table_name, glob_prefix, primary_key_col)
STRIPE_TABLES: list[tuple[str, str, str]] = [
    ("payment_intents", "stripe_payment_intents_*.parquet", "payment_intent_id"),
    ("checkout_sessions", "stripe_checkout_sessions_*.parquet", "checkout_session_id"),
    ("customers", "stripe_customers_*.parquet", "customer_id"),
    ("charges", "stripe_charges_*.parquet", "charge_id"),
    ("subscriptions", "stripe_subscriptions_*.parquet", "subscription_id"),
    ("invoices", "stripe_invoices_*.parquet", "invoice_id"),
]


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


def _ensure_dataset(creds: service_account.Credentials) -> None:
    url = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/datasets/{BQ_DATASET}"
    )
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {_token(creds)}"})
    try:
        with urllib.request.urlopen(req, timeout=30):
            print(f"[stripe_loader] dataset {BQ_DATASET} already exists")
            return
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise RuntimeError(f"Dataset check failed: {e.read().decode()[:300]}") from e

    body = {
        "datasetReference": {"projectId": BQ_PROJECT, "datasetId": BQ_DATASET},
        "location": BQ_LOCATION,
        "description": (
            "Raw Stripe data (payment_intents, checkout_sessions, customers, "
            "charges, subscriptions, invoices) — loaded by bigquery_stripe_loader.py"
        ),
    }
    _bq_request(
        creds,
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets",
        body,
    )
    print(f"[stripe_loader] created dataset {BQ_PROJECT}.{BQ_DATASET}")


def _dtype_to_bq(dtype_str: str) -> str:
    for prefix, bq_type in _DTYPE_MAP:
        if dtype_str.startswith(prefix):
            return bq_type
    return "STRING"


def _polars_schema_to_bq(df: pl.DataFrame) -> list[dict]:
    return [
        {"name": name, "type": _dtype_to_bq(str(dtype)), "mode": "NULLABLE"}
        for name, dtype in df.schema.items()
    ]


def _df_to_newline_json(df: pl.DataFrame) -> bytes:
    """Serialize DataFrame to newline-delimited JSON for BQ load job.

    Datetime values are serialized to ISO 8601 strings (BQ TIMESTAMP accepts them).
    None values are dropped (BQ treats absent keys as NULL).
    """
    rows = df.to_dicts()
    lines = []
    for row in rows:
        clean: dict = {}
        for k, v in row.items():
            if v is None:
                continue
            if isinstance(v, datetime):
                clean[k] = v.isoformat()
            else:
                clean[k] = v
        lines.append(json.dumps(clean, default=str))
    return "\n".join(lines).encode("utf-8")


def _bq_load_job(
    creds: service_account.Credentials,
    table_id: str,
    df: pl.DataFrame,
) -> None:
    """Upload df to BQ via multipart load job (WRITE_TRUNCATE)."""
    schema_fields = _polars_schema_to_bq(df)
    ndjson_bytes = _df_to_newline_json(df)

    boundary = "stripe_bq_boundary_xyzzy"
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
        "Content-Type: application/json; charset=UTF-8\r\n\r\n"
        + meta_bytes.decode("utf-8")
        + f"\r\n--{boundary}\r\n"
        "Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + ndjson_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    url = (
        f"https://www.googleapis.com/upload/bigquery/v2/projects/{BQ_PROJECT}/jobs"
        "?uploadType=multipart"
    )
    headers = {
        "Authorization": f"Bearer {_token(creds)}",
        "Content-Type": f"multipart/related; boundary={boundary}",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        job = json.load(r)

    job_id = job["jobReference"]["jobId"]
    print(f"[stripe_loader] load job {job_id} submitted for {BQ_DATASET}.{table_id}")

    # Poll for completion (max 120s)
    for _ in range(60):
        time.sleep(2)
        status_url = (
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/jobs/{job_id}"
        )
        status_req = urllib.request.Request(
            status_url, headers={"Authorization": f"Bearer {_token(creds)}"}
        )
        with urllib.request.urlopen(status_req, timeout=30) as r:
            status = json.load(r)
        state = status.get("status", {}).get("state")
        if state == "DONE":
            errs = status.get("status", {}).get("errors") or []
            if errs:
                raise RuntimeError(f"Load job errors for {table_id}: {errs}")
            rows_loaded = status.get("statistics", {}).get("load", {}).get("outputRows", "?")
            print(f"[stripe_loader] {BQ_DATASET}.{table_id} loaded — {rows_loaded} rows")
            return
    raise TimeoutError(f"BQ load job {job_id} did not complete in 120s")


def _align_to_schema(df: pl.DataFrame, canonical: pl.Schema) -> pl.DataFrame:
    """Cast df columns to match canonical schema where types differ.

    Handles:
    - Null columns (no data in early snapshot) -> cast to canonical type
    - Type mismatches -> cast to canonical type (best-effort, falls back to String)
    - Missing columns -> add as null with canonical type
    - Extra columns -> kept (diagonal concat will align later)
    """
    casts = []
    for name, target_dtype in canonical.items():
        if name not in df.schema:
            casts.append(pl.lit(None).cast(target_dtype).alias(name))
        elif df.schema[name] != target_dtype:
            try:
                casts.append(pl.col(name).cast(target_dtype, strict=False).alias(name))
            except Exception:
                casts.append(pl.col(name).cast(pl.String, strict=False).alias(name))
    if casts:
        df = df.with_columns(casts)
    return df


def _merge_parquets(glob_pattern: str, primary_key: str) -> pl.DataFrame:
    """Merge all snapshot files. Dedup by primary key, keeping latest-snapshot row.

    Uses the latest snapshot's schema as canonical; casts older snapshots to match.
    """
    root = Path(__file__).resolve().parent.parent / "data" / "raw"
    files = sorted(root.glob(glob_pattern))
    if not files:
        raise FileNotFoundError(f"No parquet files matching {root / glob_pattern}")
    print(f"[stripe_loader] merging {len(files)} files for pattern {glob_pattern}")

    # Latest file has the most complete schema — use as canonical
    canonical_schema = pl.read_parquet(files[-1]).schema

    frames = []
    for f in files:
        df = pl.read_parquet(f)
        df = _align_to_schema(df, canonical_schema)
        ts_part = f.stem.rsplit("_", 1)[-1]  # e.g. 20260505T180819Z
        df = df.with_columns(pl.lit(ts_part).alias("_snapshot_ts"))
        frames.append(df)

    combined = pl.concat(frames, how="diagonal")  # diagonal handles any remaining new cols

    # Dedup: keep row with latest snapshot per primary key
    deduped = (
        combined.sort("_snapshot_ts", descending=True)
        .unique(subset=[primary_key], keep="first")
        .drop("_snapshot_ts")
        .sort(primary_key)
    )
    return deduped


def load_all(dry_run: bool = False) -> None:
    """Bootstrap all Stripe tables into BigQuery.

    dry_run=True validates parquet merge and prints schemas without touching BQ.
    """
    load_dotenv_if_present()
    creds = _creds()

    results: list[tuple[str, pl.DataFrame]] = []
    for bq_table, glob_pattern, pk in STRIPE_TABLES:
        try:
            df = _merge_parquets(glob_pattern, pk)
            results.append((bq_table, df))
            print(
                f"[stripe_loader] {bq_table}: {df.shape[0]} rows, {df.shape[1]} cols  "
                f"| pk={pk} | schema={dict(df.schema)}"
            )
        except FileNotFoundError as e:
            print(f"[stripe_loader] WARNING: {e} — skipping {bq_table}")

    if dry_run:
        print("\nDRY RUN — schemas and row counts validated. Skipping BQ write.")
        return

    _ensure_dataset(creds)
    for bq_table, df in results:
        _bq_load_job(creds, bq_table, df)

    print(f"\n[stripe_loader] All Stripe tables loaded to {BQ_PROJECT}.{BQ_DATASET}")
    for bq_table, _ in results:
        print(f"  {BQ_PROJECT}.{BQ_DATASET}.{bq_table}")


if __name__ == "__main__":
    import sys
    dry = "--dry-run" in sys.argv
    load_all(dry_run=dry)
