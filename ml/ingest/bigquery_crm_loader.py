"""Load CRM, Airtable, and Ops parquet snapshots to BigQuery.

Destination: project uncle-mays-automation
Datasets / tables:
  crm_raw.mailchimp_members      -- from mailchimp_members_*.parquet
  crm_raw.resend_emails          -- from resend_emails_*.parquet
  crm_raw.apollo_contacts        -- from apollo_contacts_*.parquet
  airtable_raw.catalog           -- from airtable_catalog_*.parquet
  airtable_raw.pickup_slots      -- from airtable_pickup_slots_*.parquet
  airtable_raw.suppliers         -- from airtable_suppliers_*.parquet
  ops_raw.checkout_store         -- from checkout_store_*.parquet
  ops_raw.census_acs_zip         -- from census_acs_zip_*.parquet

Strategy:
  1. Merge all available snapshots (dedup by primary key, keep latest snapshot row).
  2. Create each dataset if it does not exist.
  3. Write tables using WRITE_TRUNCATE (full replace on each run).
  4. Use BQ multipart JSON load job (REST API — no external deps beyond google-auth).
  5. Skip tables with zero rows (avoids schema-inference failures on empty files).

Auth: ~/.claude/ga-service-account.json
  Required roles: roles/bigquery.dataEditor on project uncle-mays-automation.

Usage:
  python -m ml.ingest.bigquery_crm_loader             # load all tables
  python -m ml.ingest.bigquery_crm_loader --dry-run   # validate without writing to BQ
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

import polars as pl
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
BQ_LOCATION = "US"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

# Polars dtype string prefix → BQ type (prefix match because Datetime has tz suffix)
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

# (bq_dataset, bq_table, glob_pattern, primary_key_col)
# primary_key_col used for dedup across snapshots; must be unique within a source.
TABLES: list[tuple[str, str, str, str]] = [
    # CRM
    ("crm_raw", "mailchimp_members", "mailchimp_members_*.parquet", "email_hash"),
    ("crm_raw", "resend_emails", "resend_emails_*.parquet", "email_id"),
    ("crm_raw", "apollo_contacts", "apollo_contacts_*.parquet", "apollo_id"),
    # Airtable
    ("airtable_raw", "catalog", "airtable_catalog_*.parquet", "airtable_id"),
    ("airtable_raw", "pickup_slots", "airtable_pickup_slots_*.parquet", "airtable_id"),
    ("airtable_raw", "suppliers", "airtable_suppliers_*.parquet", "airtable_id"),
    # Ops
    ("ops_raw", "checkout_store", "checkout_store_*.parquet", "session_id"),
    ("ops_raw", "census_acs_zip", "census_acs_zip_*.parquet", "zip"),
]

DATASET_DESCRIPTIONS: dict[str, str] = {
    "crm_raw": (
        "CRM data (Mailchimp members, Resend emails, Apollo contacts) "
        "— loaded by bigquery_crm_loader.py"
    ),
    "airtable_raw": (
        "Airtable operational data (catalog, pickup_slots, suppliers) "
        "— loaded by bigquery_crm_loader.py"
    ),
    "ops_raw": (
        "Ops data (checkout_store sessions, Census ACS zip demographics) "
        "— loaded by bigquery_crm_loader.py"
    ),
}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# BQ helpers
# ---------------------------------------------------------------------------

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


def _ensure_dataset(creds: service_account.Credentials, dataset: str) -> None:
    url = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/datasets/{dataset}"
    )
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {_token(creds)}"})
    try:
        with urllib.request.urlopen(req, timeout=30):
            return  # already exists
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise RuntimeError(f"Dataset check failed: {e.read().decode()[:300]}") from e

    body = {
        "datasetReference": {"projectId": BQ_PROJECT, "datasetId": dataset},
        "location": BQ_LOCATION,
        "description": DATASET_DESCRIPTIONS.get(dataset, f"{dataset} — loaded by bigquery_crm_loader.py"),
    }
    _bq_request(
        creds,
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets",
        body,
    )
    print(f"[crm_loader] created dataset {BQ_PROJECT}.{dataset}")


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
    rows = df.to_dicts()
    lines = []
    for row in rows:
        clean: dict = {}
        for k, v in row.items():
            if v is None:
                continue
            if isinstance(v, datetime):
                clean[k] = v.isoformat()
            elif isinstance(v, list):
                # Serialize arrays to JSON strings — BQ schema maps these to STRING
                clean[k] = json.dumps(v)
            else:
                clean[k] = v
        lines.append(json.dumps(clean, default=str))
    return "\n".join(lines).encode("utf-8")


def _bq_load_job(
    creds: service_account.Credentials,
    dataset: str,
    table_id: str,
    df: pl.DataFrame,
) -> None:
    schema_fields = _polars_schema_to_bq(df)
    ndjson_bytes = _df_to_newline_json(df)

    boundary = "crm_bq_boundary_xyzzy"
    metadata = {
        "configuration": {
            "load": {
                "destinationTable": {
                    "projectId": BQ_PROJECT,
                    "datasetId": dataset,
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
    print(f"[crm_loader] load job {job_id} submitted for {dataset}.{table_id}")

    # Poll for completion
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
                raise RuntimeError(f"Load job errors for {dataset}.{table_id}: {errs}")
            rows = status.get("statistics", {}).get("load", {}).get("outputRows", "?")
            print(f"[crm_loader] {dataset}.{table_id} loaded — {rows} rows")
            return
    raise TimeoutError(f"BQ load job {job_id} did not complete in 120s")


# ---------------------------------------------------------------------------
# Parquet merge
# ---------------------------------------------------------------------------

def _merge_parquets(glob_pattern: str, primary_key: str) -> pl.DataFrame:
    """Merge all snapshots. Dedup by primary_key, keep row from latest snapshot."""
    root = Path(__file__).resolve().parent.parent / "data" / "raw"
    files = sorted(root.glob(glob_pattern))
    if not files:
        raise FileNotFoundError(f"No parquet files matching {root / glob_pattern}")
    print(f"[crm_loader] merging {len(files)} files for {glob_pattern}")

    canonical_schema = pl.read_parquet(files[-1]).schema
    frames = []
    for f in files:
        df = pl.read_parquet(f)
        # Align columns to canonical schema to handle schema drift across snapshots
        for col, dtype in canonical_schema.items():
            if col not in df.columns:
                df = df.with_columns(pl.lit(None).cast(dtype).alias(col))
        df = df.select(list(canonical_schema.keys()))
        ts_part = f.stem.rsplit("_", 1)[-1]
        df = df.with_columns(pl.lit(ts_part).alias("_snapshot_ts"))
        frames.append(df)

    combined = pl.concat(frames, how="diagonal")

    if primary_key not in combined.columns:
        raise KeyError(f"Primary key '{primary_key}' not in schema: {list(combined.columns)}")

    deduped = (
        combined.sort("_snapshot_ts", descending=True)
        .unique(subset=[primary_key], keep="first")
        .drop("_snapshot_ts")
        .sort(primary_key)
    )
    return deduped


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def load_all(dry_run: bool = False) -> None:
    """Load all CRM/Airtable/Ops tables into BigQuery.

    dry_run=True validates parquet merges and prints schemas without touching BQ.
    """
    load_dotenv_if_present()
    creds = None if dry_run else _creds()

    # Collect results; skip tables with zero rows
    loaded: list[tuple[str, str, pl.DataFrame]] = []
    skipped: list[tuple[str, str, str]] = []

    for dataset, table_id, glob_pattern, pk in TABLES:
        try:
            df = _merge_parquets(glob_pattern, pk)
            if len(df) == 0:
                skipped.append((dataset, table_id, "0 rows after merge"))
                print(f"[crm_loader] SKIP {dataset}.{table_id} — 0 rows")
                continue
            loaded.append((dataset, table_id, df))
            print(
                f"[crm_loader] {dataset}.{table_id}: {df.shape[0]} rows, {df.shape[1]} cols"
                f" | pk={pk}"
            )
        except FileNotFoundError as e:
            skipped.append((dataset, table_id, str(e)))
            print(f"[crm_loader] SKIP {dataset}.{table_id} — {e}")

    if dry_run:
        print("\nDRY RUN — schemas and row counts validated. Skipping BQ write.")
        for ds, tbl, df in loaded:
            print(f"  {ds}.{tbl}: {dict(df.schema)}")
        return

    # Ensure all required datasets exist
    for dataset in DATASET_DESCRIPTIONS:
        _ensure_dataset(creds, dataset)

    # Load each table
    for dataset, table_id, df in loaded:
        _bq_load_job(creds, dataset, table_id, df)

    print(f"\n[crm_loader] Done. {len(loaded)} tables loaded, {len(skipped)} skipped.")
    for ds, tbl, df in loaded:
        print(f"  {BQ_PROJECT}.{ds}.{tbl} ({df.shape[0]} rows)")
    if skipped:
        print("Skipped:")
        for ds, tbl, reason in skipped:
            print(f"  {BQ_PROJECT}.{ds}.{tbl} — {reason}")


if __name__ == "__main__":
    import sys
    load_all(dry_run="--dry-run" in sys.argv)
