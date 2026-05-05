"""Pull Resend transactional email send history.

Resend's REST API exposes /emails (list) and /emails/{id} (detail).
We pull every send since DATASET_START_DATE, and per-email
status/opens/clicks/bounces aggregates.
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
import polars as pl

from ._common import (
    hash_email,
    load_dotenv_if_present,
    load_json_config,
    raw_path,
)


def extract(start_date: str | None = None) -> Path:
    load_dotenv_if_present()
    start_date = start_date or os.environ.get("DATASET_START_DATE", "2026-04-24")
    cfg = load_json_config("RESEND_CONFIG_PATH", "~/.claude/resend-config.json")
    api_key = cfg["api_key"]
    base = cfg["base_url"].rstrip("/")

    rows: list[dict] = []
    cursor: str | None = None
    with httpx.Client(
        timeout=30.0, headers={"Authorization": f"Bearer {api_key}"}
    ) as cli:
        while True:
            params: dict = {"limit": 100}
            if cursor:
                params["after"] = cursor
            r = cli.get(f"{base}/emails", params=params)
            if r.status_code == 404:
                # Older Resend keys may not have list permission; degrade.
                print("[resend.emails] /emails returned 404; skipping (key may lack list scope)")
                break
            r.raise_for_status()
            body = r.json()
            data = body.get("data") or []
            for e in data:
                created = e.get("created_at")
                if created and created < start_date:
                    cursor = None
                    data = []
                    break
                tags = {t.get("name"): t.get("value") for t in (e.get("tags") or [])}
                to_field = e.get("to") or []
                first_to = to_field[0] if isinstance(to_field, list) and to_field else None
                rows.append(
                    {
                        "email_id": e.get("id"),
                        "created_at": created,
                        "to": first_to,
                        "to_hash": hash_email(first_to),
                        "from": e.get("from"),
                        "subject": e.get("subject"),
                        "last_event": e.get("last_event"),
                        "tag_type": tags.get("type"),
                        "tag_session": tags.get("session"),
                        "tag_step": tags.get("step"),
                    }
                )
            if not body.get("has_more") or not data:
                break
            cursor = data[-1].get("id")
            time.sleep(0.15)

    df = pl.DataFrame(rows) if rows else pl.DataFrame(schema={"email_id": pl.Utf8})
    out = raw_path("resend_emails")
    df.write_parquet(out)
    print(f"[resend.emails] {len(rows)} -> {out}")
    return out


if __name__ == "__main__":
    extract()
