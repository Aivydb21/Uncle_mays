"""Pull Meta (Facebook/Instagram) Ads campaign-level daily performance.

Joins to checkout attempts via:
  - utm_campaign  ↔  Meta campaign name (when properly tagged in Meta)
  - fbclid presence in PI metadata indicates the click came from a Meta ad

We pull daily-grain metrics so the row-level join can pick up "ads that ran
on the day this checkout happened" context features (campaign spend that
day, CTR for the campaign in the trailing 7 days, etc.).
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
import polars as pl

from ._common import load_dotenv_if_present, load_json_config, raw_path


def _client(token: str, base_url: str) -> httpx.Client:
    return httpx.Client(
        base_url=base_url,
        params={"access_token": token},
        timeout=httpx.Timeout(60.0),
    )


def _list_paginated(cli: httpx.Client, path: str, params: dict | None = None) -> list[dict]:
    items: list[dict] = []
    next_url: str | None = path
    next_params: dict | None = dict(params or {})
    while next_url:
        if next_url == path:
            r = cli.get(path, params=next_params)
        else:
            # Meta returns absolute paging URLs that already include the token.
            r = cli.get(next_url, params=None)
        if r.status_code != 200:
            print(f"[meta_ads] {path} returned {r.status_code}: {r.text[:200]}")
            break
        body = r.json()
        items.extend(body.get("data", []))
        next_url = (body.get("paging") or {}).get("next")
        next_params = None
        time.sleep(0.2)
    return items


def extract(start_date: str | None = None) -> dict[str, Path]:
    load_dotenv_if_present()
    start_date = start_date or os.environ.get("DATASET_START_DATE", "2026-04-24")
    cfg = load_json_config("META_CONFIG_PATH", "~/.claude/meta-config.json")
    token = cfg["access_token"]
    base = cfg["base_url"].rstrip("/")
    ad_account = cfg["ad_account_id"]

    today = datetime.now(timezone.utc).date().isoformat()
    out: dict[str, Path] = {}
    with _client(token, base) as cli:
        out["meta_campaigns"] = _extract_campaigns(cli, ad_account)
        out["meta_campaign_insights"] = _extract_campaign_insights(
            cli, ad_account, start_date, today
        )
    return out


def _extract_campaigns(cli: httpx.Client, ad_account: str) -> Path:
    items = _list_paginated(
        cli,
        f"/{ad_account}/campaigns",
        params={
            "fields": "id,name,status,objective,buying_type,start_time,stop_time,created_time,updated_time",
            "limit": 100,
        },
    )
    rows = []
    for c in items:
        rows.append(
            {
                "campaign_id": c.get("id"),
                "name": c.get("name"),
                "status": c.get("status"),
                "objective": c.get("objective"),
                "buying_type": c.get("buying_type"),
                "start_time": c.get("start_time"),
                "stop_time": c.get("stop_time"),
                "created_time": c.get("created_time"),
                "updated_time": c.get("updated_time"),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"campaign_id": pl.Utf8})
    out_path = raw_path("meta_campaigns")
    df.write_parquet(out_path)
    print(f"[meta_ads.campaigns] {len(rows)} -> {out_path}")
    return out_path


def _extract_campaign_insights(
    cli: httpx.Client, ad_account: str, start_date: str, end_date: str
) -> Path:
    items = _list_paginated(
        cli,
        f"/{ad_account}/insights",
        params={
            "level": "campaign",
            "time_increment": "1",  # daily breakdown
            "time_range": f'{{"since":"{start_date}","until":"{end_date}"}}',
            "fields": "campaign_id,campaign_name,date_start,date_stop,impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,actions,action_values",
            "limit": 100,
        },
    )
    rows = []
    for r in items:
        actions = {a.get("action_type"): a.get("value") for a in (r.get("actions") or [])}
        action_values = {a.get("action_type"): a.get("value") for a in (r.get("action_values") or [])}
        rows.append(
            {
                "campaign_id": r.get("campaign_id"),
                "campaign_name": r.get("campaign_name"),
                "date": r.get("date_start"),
                "impressions": _to_int(r.get("impressions")),
                "clicks": _to_int(r.get("clicks")),
                "reach": _to_int(r.get("reach")),
                "frequency": _to_float(r.get("frequency")),
                "spend_usd": _to_float(r.get("spend")),
                "ctr": _to_float(r.get("ctr")),
                "cpc": _to_float(r.get("cpc")),
                "cpm": _to_float(r.get("cpm")),
                "purchases": _to_int(actions.get("purchase")),
                "purchase_value_usd": _to_float(action_values.get("purchase")),
                "initiate_checkout": _to_int(actions.get("initiate_checkout")),
                "add_to_cart": _to_int(actions.get("add_to_cart")),
                "view_content": _to_int(actions.get("view_content")),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"campaign_id": pl.Utf8})
    out_path = raw_path("meta_campaign_insights")
    df.write_parquet(out_path)
    print(f"[meta_ads.insights] {len(rows)} daily campaign rows -> {out_path}")
    return out_path


def _to_int(v):
    if v is None:
        return None
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def _to_float(v):
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


if __name__ == "__main__":
    extract()
