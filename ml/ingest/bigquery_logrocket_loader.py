"""Load LogRocket parquet snapshots to BigQuery.

Destination: project uncle-mays-automation
Datasets:
  logrocket_raw     — session-level metrics (from logrocket_sessions_*.parquet)
  logrocket_galileo — Galileo daily briefing answers (from logrocket_galileo_*.parquet)

Tables:
  logrocket_raw.sessions           — one row per session, trailing 2-day window
  logrocket_galileo.briefings      — one row per Galileo prompt answer, daily

Strategy:
  1. Merge all available snapshots (dedup by session_id / prompt_id+pulled_at).
  2. Create datasets if they do not exist.
  3. Write tables using WRITE_TRUNCATE (full replace on each run).
  4. BQ REST API — no external deps beyond google-auth + polars.

Auth: ~/.claude/ga-service-account.json
  Required roles: roles/bigquery.dataEditor on project uncle-mays-automation.

Usage:
  python -m ml.ingest.bigquery_logrocket_loader             # load all tables
  python -m ml.ingest.bigquery_logrocket_loader --dry-run   # validate, no writes
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
BQ_LOCATION = "US"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

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

# (dataset, table, glob, dedup_key)
LOGROCKET_TABLES: list[tuple[str, str, str, str]] = [
    ("logrocket_raw",     "sessions",  "logrocket_sessions_*.parquet",  "session_id"),
    ("logrocket_galileo", "briefings", "logrocket_galileo_*.parquet",   "prompt_id"),
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


def _bq_request(creds, url: str, body: dict | None = None, method: str | None = None) -> dict:
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


def _ensure_dataset(creds, dataset: str) -> None:
    url = f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets/{dataset}"
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
        "description": f"LogRocket data — {dataset}. Loaded by bigquery_logrocket_loader.py",
    }
    _bq_request(creds, f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets", body)
    print(f"[logrocket_loader] created dataset {BQ_PROJECT}.{dataset}")


def _dtype_to_bq(dtype_str: str) -> str:
    for prefix, bq_type in _DTYPE_MAP:
        if dtype_str.startswith(prefix):
            return bq_type
    return "STRING"


def _schema(df: pl.DataFrame) -> list[dict]:
    return [{"name": n, "type": _dtype_to_bq(str(t)), "mode": "NULLABLE"} for n, t in df.schema.items()]


def _to_ndjson(df: pl.DataFrame) -> bytes:
    lines = []
    for row in df.to_dicts():
        clean = {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in row.items() if v is not None}
        lines.append(json.dumps(clean, default=str))
    return "\n".join(lines).encode("utf-8")


def _load_table(creds, dataset: str, table: str, df: pl.DataFrame, dry_run: bool) -> None:
    """Upload df to BQ via multipart load job (WRITE_TRUNCATE)."""
    if df.is_empty():
        print(f"[logrocket_loader] {dataset}.{table}: 0 rows — skipping BQ write")
        return

    schema = _schema(df)
    job_body = {
        "configuration": {
            "load": {
                "destinationTable": {"projectId": BQ_PROJECT, "datasetId": dataset, "tableId": table},
                "schema": {"fields": schema},
                "sourceFormat": "NEWLINE_DELIMITED_JSON",
                "writeDisposition": "WRITE_TRUNCATE",
                "createDisposition": "CREATE_IF_NEEDED",
            }
        }
    }

    ndjson = _to_ndjson(df)
    print(f"[logrocket_loader] {dataset}.{table}: {len(df)} rows ({len(ndjson):,} bytes)")

    if dry_run:
        print(f"[logrocket_loader] DRY RUN — would write {len(df)} rows to {BQ_PROJECT}.{dataset}.{table}")
        return

    boundary = "logrocket_bq_boundary"
    meta_part = (
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
        + json.dumps(job_body)
        + "\r\n"
    )
    data_part = f"--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n"
    end_part = f"\r\n--{boundary}--"
    body = meta_part.encode() + data_part.encode() + ndjson + end_part.encode()

    upload_url = (
        f"https://www.googleapis.com/upload/bigquery/v2/projects/{BQ_PROJECT}"
        f"/jobs?uploadType=multipart"
    )
    req = urllib.request.Request(
        upload_url,
        data=body,
        headers={
            "Authorization": f"Bearer {_token(creds)}",
            "Content-Type": f"multipart/related; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        job = json.load(r)

    job_id = job["jobReference"]["jobId"]
    location = job.get("jobReference", {}).get("location", BQ_LOCATION)

    # Poll for completion
    for _ in range(60):
        time.sleep(2)
        status = _bq_request(
            creds,
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/jobs/{job_id}?location={location}",
        )
        state = status.get("status", {}).get("state")
        if state == "DONE":
            errs = status.get("status", {}).get("errors", [])
            if errs:
                raise RuntimeError(f"BQ job {job_id} errors: {errs}")
            print(f"[logrocket_loader] {dataset}.{table}: done (job {job_id})")
            return
    raise TimeoutError(f"BQ job {job_id} did not complete in 120s")


def _merge_parquets(glob: str, dedup_key: str) -> pl.DataFrame:
    """Merge all snapshots for a source, deduplicating by key (keep latest snapshot row)."""
    from ._common import DATA_RAW
    files = sorted(DATA_RAW.glob(glob))
    if not files:
        return pl.DataFrame()

    frames = []
    for f in files:
        try:
            df = pl.read_parquet(f)
            if not df.is_empty():
                df = df.with_columns(pl.lit(f.name).alias("_snapshot_file"))
                frames.append(df)
        except Exception as exc:
            print(f"[logrocket_loader] skip {f.name}: {exc}")

    if not frames:
        return pl.DataFrame()

    combined = pl.concat(frames, how="diagonal")
    if dedup_key in combined.columns:
        combined = (
            combined
            .sort("_snapshot_file", descending=True)
            .unique(subset=[dedup_key], keep="first")
        )
    combined = combined.drop("_snapshot_file", strict=False)
    return combined


def load_all(dry_run: bool = False) -> None:
    load_dotenv_if_present()
    creds = _creds()

    for dataset, table, glob, dedup_key in LOGROCKET_TABLES:
        _ensure_dataset(creds, dataset)
        df = _merge_parquets(glob, dedup_key)
        if df.is_empty():
            print(f"[logrocket_loader] {dataset}.{table}: no parquets found — skipping")
            continue
        _load_table(creds, dataset, table, df, dry_run)


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    load_all(dry_run=args.dry_run)
