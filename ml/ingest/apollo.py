"""Pull Apollo contacts for join enrichment.

Apollo is primarily an investor-outreach DB but the same contacts may
overlap with Stripe customer emails. We pull the existing scored contact
list (`investor-outreach/scripts` previously generated this) and any
additional pages via the Apollo /contacts/search endpoint.

Since the catalog is 3,240 contacts and Cloudflare blocks default
Python UAs (per CLAUDE.md), we set a curl UA header.
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

PAGE_SIZE = 100
MAX_PAGES = 50  # cap at 5,000 contacts per pull


def extract() -> Path:
    load_dotenv_if_present()
    cfg = load_json_config("APOLLO_CONFIG_PATH", "~/.claude/apollo-config.json")
    api_key = cfg["api_key"]
    base = cfg["base_url"].rstrip("/")

    rows: list[dict] = []
    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json",
        "User-Agent": "curl/8.0",
    }
    with httpx.Client(timeout=60.0, headers=headers) as cli:
        for page in range(1, MAX_PAGES + 1):
            r = cli.post(
                f"{base}/contacts/search",
                json={"page": page, "per_page": PAGE_SIZE},
            )
            if r.status_code != 200:
                print(f"[apollo] page {page} returned {r.status_code}; stopping")
                break
            body = r.json()
            contacts = body.get("contacts") or []
            for c in contacts:
                org = c.get("organization") or {}
                rows.append(
                    {
                        "apollo_id": c.get("id"),
                        "email": c.get("email"),
                        "email_hash": hash_email(c.get("email")),
                        "first_name": c.get("first_name"),
                        "last_name": c.get("last_name"),
                        "title": c.get("title"),
                        "seniority": c.get("seniority"),
                        "city": c.get("city"),
                        "state": c.get("state"),
                        "country": c.get("country"),
                        "linkedin_url": c.get("linkedin_url"),
                        "org_name": org.get("name"),
                        "org_website": org.get("website_url"),
                        "org_industry": org.get("industry"),
                        "labels": ",".join(c.get("label_names") or []),
                    }
                )
            if len(contacts) < PAGE_SIZE:
                break
            time.sleep(0.3)

    df = pl.DataFrame(rows) if rows else pl.DataFrame(schema={"apollo_id": pl.Utf8})
    out = raw_path("apollo_contacts")
    df.write_parquet(out)
    print(f"[apollo.contacts] {len(rows)} -> {out}")
    return out


if __name__ == "__main__":
    extract()
