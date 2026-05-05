"""Pull Mailchimp audience members + their lifetime activity stats.

Per CLAUDE.md the audience is currently small (~3 members post-lockdown
reset 2026-04-10), but we capture the structure so the join works as
audience grows. Lifetime stats are inflated by the pre-2026-04-24
1-subscriber-transactional pattern; flag downstream.
"""

from __future__ import annotations

import time
from pathlib import Path

import httpx
import polars as pl

from ._common import (
    hash_email,
    load_dotenv_if_present,
    load_json_config,
    raw_path,
)

LIST_ID = "2645503d11"


def extract() -> Path:
    load_dotenv_if_present()
    cfg = load_json_config("MAILCHIMP_CONFIG_PATH", "~/.claude/mailchimp-config.json")
    api_key = cfg["api_key"]
    base = cfg["base_url"].rstrip("/")
    auth = ("anystring", api_key)

    rows: list[dict] = []
    offset = 0
    page_size = 200
    with httpx.Client(timeout=30.0, auth=auth) as cli:
        while True:
            r = cli.get(
                f"{base}/lists/{LIST_ID}/members",
                params={
                    "count": page_size,
                    "offset": offset,
                    "fields": (
                        "members.id,members.email_address,members.status,"
                        "members.timestamp_signup,members.timestamp_opt,members.last_changed,"
                        "members.member_rating,members.tags,members.stats,"
                        "members.email_client,members.location.country_code,members.location.region"
                    ),
                },
            )
            r.raise_for_status()
            body = r.json()
            members = body.get("members", [])
            for m in members:
                stats = m.get("stats") or {}
                location = m.get("location") or {}
                rows.append(
                    {
                        "email": m.get("email_address"),
                        "email_hash": hash_email(m.get("email_address")),
                        "status": m.get("status"),
                        "signup_ts": m.get("timestamp_signup") or None,
                        "opt_ts": m.get("timestamp_opt") or None,
                        "last_changed_ts": m.get("last_changed"),
                        "member_rating": m.get("member_rating"),
                        "tags": ",".join(t.get("name", "") for t in (m.get("tags") or [])),
                        "tag_count": len(m.get("tags") or []),
                        "avg_open_rate": stats.get("avg_open_rate"),
                        "avg_click_rate": stats.get("avg_click_rate"),
                        "country_code": location.get("country_code"),
                        "region": location.get("region"),
                    }
                )
            if len(members) < page_size:
                break
            offset += page_size
            time.sleep(0.2)

    df = pl.DataFrame(rows) if rows else pl.DataFrame(schema={"email": pl.Utf8})
    out = raw_path("mailchimp_members")
    df.write_parquet(out)
    print(f"[mailchimp.members] {len(rows)} -> {out}")
    return out


if __name__ == "__main__":
    extract()
