"""Pull Google Ads campaign-level daily performance via GAQL.

Joins to checkout attempts via:
  - utm_campaign  ↔  campaign.name
  - gclid presence in PI metadata indicates a Google Ads click

Per CLAUDE.md auth quirk: the MCC `6758950400` does NOT actually manage
`6015592923`. Query `6015592923` directly with NO `login-customer-id`
header (or set to 6015592923).
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
import polars as pl

from ._common import load_dotenv_if_present, load_json_config, raw_path


def _get_access_token(cfg: dict) -> str:
    r = httpx.post(
        cfg["oauth_token_url"],
        data={
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "refresh_token": cfg["refresh_token"],
            "grant_type": "refresh_token",
        },
        timeout=30.0,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def extract(start_date: str | None = None) -> Path:
    load_dotenv_if_present()
    start_date = start_date or os.environ.get("DATASET_START_DATE", "2026-04-24")
    cfg = load_json_config(
        "GOOGLE_ADS_CONFIG_PATH", "~/.claude/google-ads-config.json"
    )
    access_token = _get_access_token(cfg)

    customer_id = cfg["customer_id"]
    base = cfg["base_url"].rstrip("/")
    today = datetime.now(timezone.utc).date().isoformat()

    # GAQL: daily metrics per campaign in the date range.
    gaql = f"""
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          segments.date,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.ctr,
          metrics.average_cpc
        FROM campaign
        WHERE segments.date BETWEEN '{start_date}' AND '{today}'
    """

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": cfg["developer_token"],
        "Content-Type": "application/json",
        # Per CLAUDE.md: do NOT send login-customer-id; MCC doesn't manage
        # this account. Direct query against 6015592923 only.
    }

    rows = []
    page_token: str | None = None
    with httpx.Client(timeout=60.0, headers=headers) as cli:
        while True:
            body: dict = {"query": gaql}
            if page_token:
                body["pageToken"] = page_token
            r = cli.post(
                f"{base}/customers/{customer_id}/googleAds:search",
                json=body,
            )
            if r.status_code != 200:
                print(f"[google_ads] API returned {r.status_code}: {r.text[:300]}")
                break
            data = r.json()
            for item in data.get("results", []):
                camp = item.get("campaign") or {}
                seg = item.get("segments") or {}
                m = item.get("metrics") or {}
                rows.append(
                    {
                        "campaign_id": str(camp.get("id")) if camp.get("id") else None,
                        "campaign_name": camp.get("name"),
                        "campaign_status": camp.get("status"),
                        "channel_type": camp.get("advertisingChannelType"),
                        "date": seg.get("date"),
                        "impressions": _to_int(m.get("impressions")),
                        "clicks": _to_int(m.get("clicks")),
                        "cost_micros": _to_int(m.get("costMicros")),
                        "spend_usd": (
                            _to_int(m.get("costMicros")) / 1_000_000
                            if m.get("costMicros") is not None
                            else None
                        ),
                        "conversions": _to_float(m.get("conversions")),
                        "conversion_value": _to_float(m.get("conversionsValue")),
                        "ctr": _to_float(m.get("ctr")),
                        "average_cpc_usd": (
                            _to_int(m.get("averageCpc")) / 1_000_000
                            if m.get("averageCpc") is not None
                            else None
                        ),
                    }
                )
            page_token = data.get("nextPageToken")
            if not page_token:
                break
            time.sleep(0.2)

    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"campaign_id": pl.Utf8})
    out = raw_path("google_ads_campaign_insights")
    df.write_parquet(out)
    print(f"[google_ads.insights] {len(rows)} daily campaign rows -> {out}")
    return out


def _to_int(v):
    if v is None:
        return None
    try:
        return int(v)
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
