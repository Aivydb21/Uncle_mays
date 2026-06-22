"""Sync Paperclip Galileo/LogRocket fix tickets → BigQuery logrocket_galileo.fix_tracking.

This enables the CTO (and any agent) to answer "is this issue already addressed?"
by running a single SQL query before triaging the daily Galileo briefing.

Output table: logrocket_galileo.fix_tracking
  One row per Paperclip issue that references a Galileo finding (identified
  by: title/description contains "galileo" | "logrocket" | a LogRocket session
  URL | a chatID in the known format).

The companion SQL view logrocket_galileo.briefings_with_fix_status joins this
table back to briefings on chat_id and session URL overlap so the CTO can see
fix status inline with every briefing row.

Usage:
  python -m ml.ingest.bigquery_galileo_fix_tracking             # sync + load
  python -m ml.ingest.bigquery_galileo_fix_tracking --dry-run   # validate only

Auth: PAPERCLIP_API_URL + PAPERCLIP_API_KEY env vars (or ~/.claude/paperclip-config.json)
      Google SA at ~/.claude/ga-service-account.json (BQ write).
"""

from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

import polars as pl
from google.auth.transport.requests import Request
from google.oauth2 import service_account

from ._common import load_dotenv_if_present

BQ_PROJECT = "uncle-mays-automation"
BQ_LOCATION = "US"
BQ_DATASET = "logrocket_galileo"
BQ_TABLE = "fix_tracking"
SA_PATH = os.environ.get("GA_SERVICE_ACCOUNT_PATH", "~/.claude/ga-service-account.json")

PAPERCLIP_API_URL = os.environ.get("PAPERCLIP_API_URL", "http://paperclip.taila8b3ff.ts.net:3100")
PAPERCLIP_API_KEY = os.environ.get("PAPERCLIP_API_KEY", "")
PAPERCLIP_COMPANY_ID = os.environ.get("PAPERCLIP_COMPANY_ID", "4feca4d1-108b-4905-b16a-ed9538c6f9ef")

# Regex for LogRocket session URLs and Galileo chatIDs
_SESSION_URL_RE = re.compile(r"https://app\.logrocket\.com/[^\s)\]\"']+")
_CHAT_ID_RE = re.compile(r"\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b")
_GALILEO_KEYWORDS = re.compile(r"\bgalileo\b|\blogrocket\b|\bsession url\b", re.IGNORECASE)

DTYPE_MAP: list[tuple[str, str]] = [
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


# ---------------------------------------------------------------------------
# Paperclip helpers
# ---------------------------------------------------------------------------

def _pc_headers() -> dict:
    key = PAPERCLIP_API_KEY or os.environ.get("PAPERCLIP_API_KEY", "")
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def _pc_get(path: str) -> dict:
    url = f"{PAPERCLIP_API_URL}/api/{path.lstrip('/')}"
    req = urllib.request.Request(url, headers=_pc_headers())
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def _fetch_galileo_issues(max_issues: int = 500) -> list[dict]:
    """Fetch Paperclip issues mentioning galileo or logrocket."""
    rows: list[dict] = []
    for query in ("galileo", "logrocket"):
        url = (
            f"companies/{PAPERCLIP_COMPANY_ID}/issues"
            f"?q={query}&status=todo,in_progress,in_review,done,blocked&per_page=100"
        )
        try:
            data = _pc_get(url)
        except Exception as exc:
            print(f"[fix_tracking] Paperclip query '{query}' failed: {exc}")
            continue
        issues_list = data if isinstance(data, list) else (data.get("issues") or [])
        for issue in issues_list:
            # Dedup: same issue may match both queries
            if not any(r["issue_identifier"] == issue.get("identifier") for r in rows):
                rows.append(_extract_issue_row(issue))
        if len(rows) >= max_issues:
            break
    return rows[:max_issues]


def _extract_issue_row(issue: dict) -> dict:
    """Convert a Paperclip issue object to a fix_tracking row."""
    identifier = issue.get("identifier", "")
    title = issue.get("title", "")
    status = issue.get("status", "unknown")
    created = issue.get("createdAt", "")
    updated = issue.get("updatedAt", "")

    # Scrape description + title for session URLs and chat IDs
    text = f"{title} {issue.get('description', '') or ''}"
    session_urls = _SESSION_URL_RE.findall(text)
    chat_ids = _CHAT_ID_RE.findall(text)

    # Friction fingerprint: lowercase key noun phrases (rough matching aid)
    words = re.findall(r"\b[a-z]{4,}\b", title.lower())
    stopwords = {"this", "that", "with", "from", "have", "been", "will", "were",
                 "they", "them", "when", "then", "into", "also", "some", "what",
                 "issue", "fix", "ship", "page", "user", "users", "checkout",
                 "galileo", "logrocket", "daily", "briefing", "session"}
    fingerprint_words = [w for w in words if w not in stopwords][:8]

    return {
        "issue_identifier":    identifier,
        "issue_title":         title,
        "issue_status":        status,
        "issue_url":           f"/UNC/issues/{identifier}",
        "chat_ids":            json.dumps(list(dict.fromkeys(chat_ids))),
        "session_urls":        json.dumps(list(dict.fromkeys(session_urls))),
        "friction_fingerprint": " ".join(fingerprint_words),
        "created_at":          created,
        "updated_at":          updated,
        "synced_at":           datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# BigQuery helpers (reuse pattern from bigquery_logrocket_loader.py)
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


def _bq_request(creds, url: str, body: dict | None = None, method: str | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    m = method or ("POST" if data else "GET")
    headers = {"Authorization": f"Bearer {_token(creds)}", "Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers, method=m)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"BQ HTTP {e.code}: {e.read().decode()[:400]}") from e


def _dtype_to_bq(dtype_str: str) -> str:
    for prefix, bq_type in DTYPE_MAP:
        if dtype_str.startswith(prefix):
            return bq_type
    return "STRING"


def _schema(df: pl.DataFrame) -> list[dict]:
    return [{"name": n, "type": _dtype_to_bq(str(t)), "mode": "NULLABLE"}
            for n, t in df.schema.items()]


def _to_ndjson(df: pl.DataFrame) -> bytes:
    lines = []
    for row in df.to_dicts():
        clean = {k: (v.isoformat() if isinstance(v, datetime) else v)
                 for k, v in row.items() if v is not None}
        lines.append(json.dumps(clean, default=str))
    return "\n".join(lines).encode("utf-8")


def _ensure_dataset(creds, dataset: str) -> None:
    url = f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets/{dataset}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {_token(creds)}"})
    try:
        with urllib.request.urlopen(req, timeout=30):
            return
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise RuntimeError(f"Dataset check failed: {e.read().decode()[:300]}") from e
    body = {
        "datasetReference": {"projectId": BQ_PROJECT, "datasetId": dataset},
        "location": BQ_LOCATION,
    }
    _bq_request(creds, f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}/datasets", body)


def _load_table(creds, dataset: str, table: str, df: pl.DataFrame, dry_run: bool) -> None:
    if df.is_empty():
        print(f"[fix_tracking] {dataset}.{table}: 0 rows — skipping")
        return
    schema = _schema(df)
    ndjson = _to_ndjson(df)
    print(f"[fix_tracking] {dataset}.{table}: {len(df)} rows ({len(ndjson):,} bytes)")
    if dry_run:
        print(f"[fix_tracking] DRY RUN — would write {len(df)} rows to {BQ_PROJECT}.{dataset}.{table}")
        return

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
    boundary = "fix_tracking_bq"
    meta_part = (
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
        + json.dumps(job_body) + "\r\n"
    )
    data_part = f"--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n"
    end_part = f"\r\n--{boundary}--"
    body = meta_part.encode() + data_part.encode() + ndjson + end_part.encode()

    upload_url = (
        f"https://www.googleapis.com/upload/bigquery/v2/projects/{BQ_PROJECT}"
        f"/jobs?uploadType=multipart"
    )
    req = urllib.request.Request(
        upload_url, data=body,
        headers={
            "Authorization": f"Bearer {_token(creds)}",
            "Content-Type": f"multipart/related; boundary={boundary}",
        }, method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        job = json.load(r)

    job_id = job["jobReference"]["jobId"]
    location = job.get("jobReference", {}).get("location", BQ_LOCATION)
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
            print(f"[fix_tracking] {dataset}.{table}: done (job {job_id})")
            return
    raise TimeoutError(f"BQ job {job_id} did not complete in 120s")


def _create_fix_tracking_view(creds, dry_run: bool) -> None:
    """Create or replace logrocket_galileo.briefings_with_fix_status view.

    Joins briefings to fix_tracking on chat_id overlap so the CTO can run
    "is this already addressed?" as a single SELECT.
    """
    view_sql = """
SELECT
  b.prompt_id,
  b.prompt_version,
  b.status        AS briefing_status,
  b._date_bucket  AS briefing_date,
  b.answer,
  b.chat_id,
  -- fix_tracking columns (NULL when no fix ticket found for this chat_id)
  ft.issue_identifier AS fix_ticket,
  ft.issue_title      AS fix_title,
  ft.issue_status     AS fix_status,
  ft.issue_url        AS fix_url,
  ft.friction_fingerprint,
  ft.synced_at        AS fix_synced_at,
  -- Convenience flag: TRUE when a fix ticket exists in a terminal state
  CASE
    WHEN ft.issue_status IN ('done', 'cancelled') THEN TRUE
    ELSE FALSE
  END AS is_fixed
FROM
  `uncle-mays-automation.logrocket_galileo.briefings` b
LEFT JOIN
  `uncle-mays-automation.logrocket_galileo.fix_tracking` ft
  ON (
    b.chat_id IS NOT NULL
    AND b.chat_id != ''
    AND REGEXP_CONTAINS(ft.chat_ids, CONCAT(r'\"', b.chat_id, r'\"'))
  )
ORDER BY b._date_bucket DESC, b.prompt_id
"""
    view_body = {
        "tableReference": {
            "projectId": BQ_PROJECT,
            "datasetId": BQ_DATASET,
            "tableId": "briefings_with_fix_status",
        },
        "view": {"query": view_sql, "useLegacySql": False},
        "description": (
            "Galileo daily briefing rows joined to Paperclip fix tickets. "
            "Use is_fixed=TRUE to skip briefing items already addressed. "
            "Refreshed daily by bigquery_galileo_fix_tracking.py. "
            "Created 2026-05-19 (UNC-1217)."
        ),
    }

    if dry_run:
        print("[fix_tracking] DRY RUN — would create/replace view briefings_with_fix_status")
        return

    # Try PATCH first (update), then POST (create)
    url_base = (
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{BQ_PROJECT}"
        f"/datasets/{BQ_DATASET}/tables"
    )
    url_patch = f"{url_base}/briefings_with_fix_status"
    try:
        _bq_request(creds, url_patch, view_body, method="PUT")
        print("[fix_tracking] view briefings_with_fix_status updated")
    except RuntimeError:
        try:
            _bq_request(creds, url_base, view_body, method="POST")
            print("[fix_tracking] view briefings_with_fix_status created")
        except RuntimeError as e:
            print(f"[fix_tracking] WARN: could not create view: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def sync(dry_run: bool = False) -> None:
    load_dotenv_if_present()
    print("[fix_tracking] fetching Galileo/LogRocket issues from Paperclip ...")
    rows = _fetch_galileo_issues()
    print(f"[fix_tracking] {len(rows)} issues found")

    if not rows:
        print("[fix_tracking] No issues found — check PAPERCLIP_API_KEY and PAPERCLIP_COMPANY_ID")
        return

    df = pl.DataFrame(rows, infer_schema_length=len(rows))
    # Drop _date_bucket if present (not applicable here; no date split needed)
    creds = _creds()
    _ensure_dataset(creds, BQ_DATASET)
    _load_table(creds, BQ_DATASET, BQ_TABLE, df, dry_run)
    _create_fix_tracking_view(creds, dry_run)
    print("[fix_tracking] done")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    sync(dry_run=args.dry_run)
