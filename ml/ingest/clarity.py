"""Pull Microsoft Clarity dwell + interaction metrics for key pages.

Clarity Data Export API:
  GET https://www.clarity.ms/export-data/api/v1/project-live-insights
  ?numOfDays=1..3
  &dimension1=URL
  Auth: Bearer <jwt> (the api_token in clarity-config.json)
  Rate limit: 10 calls/project/day — be sparing.

Each call returns aggregate metrics by URL. We pull a 3-day window covering
our key conversion-funnel pages and persist as parquet. Re-run weekly (well
under the 10/day limit).
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
import polars as pl

from ._common import load_dotenv_if_present, load_json_config, raw_path

# Pages that matter for the conversion funnel. Hosted-checkout pages first
# (where the bulk of historical traffic landed), then the new shop/checkout
# (will become the primary funnel post-cart-launch).
PAGES_OF_INTEREST = [
    "/",
    "/shop",
    "/checkout",
    "/checkout/family",
    "/checkout/starter",
    "/subscribe/family",
    "/subscribe/starter",
    "/order-success",
]


def extract(num_of_days: int = 3) -> Path:
    load_dotenv_if_present()
    cfg = load_json_config("CLARITY_CONFIG_PATH", "~/.claude/clarity-config.json")
    token = cfg["api_token"]
    base = cfg["base_url"].rstrip("/")

    headers = {"Authorization": f"Bearer {token}"}
    rows: list[dict] = []
    pulled_at = datetime.now(timezone.utc).isoformat()

    with httpx.Client(timeout=60.0, headers=headers) as cli:
        # One API call returns ALL URLs in the period; we then filter to
        # our pages of interest. Costs 1 of 10 daily calls.
        params = {"numOfDays": num_of_days, "dimension1": "URL"}
        r = cli.get(f"{base}/project-live-insights", params=params)
        if r.status_code != 200:
            body_snippet = r.text[:300] if r.text else "<empty body>"
            raise RuntimeError(
                f"[clarity] API returned {r.status_code}: {body_snippet}\n"
                "Not writing parquet — last-good file preserved for freshness check."
            )

        body = r.json()
        # Body is a list of metric objects, each with a `metricName` and an
        # `information` array of {URL, ...metric}. Flatten into one row per
        # (url, metric) and pivot at the join layer.
        for metric_obj in body:
            metric_name = metric_obj.get("metricName")
            for info in metric_obj.get("information", []) or []:
                url = info.get("URL") or info.get("Url") or info.get("url")
                if not url:
                    continue
                # Each metric has different value keys. Capture all numeric.
                vals = {
                    k: v
                    for k, v in info.items()
                    if k.lower() != "url"
                    and (isinstance(v, (int, float))
                         or (isinstance(v, str) and v.replace(".", "", 1).isdigit()))
                }
                rows.append(
                    {
                        "pulled_at": pulled_at,
                        "num_of_days": num_of_days,
                        "metric": metric_name,
                        "url": url,
                        **{f"v_{k}": _to_float(v) for k, v in vals.items()},
                    }
                )
        time.sleep(0.5)

    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"url": pl.Utf8})

    # Filter to pages of interest if any URLs match — keep all rows in raw
    # but log the funnel-page coverage.
    funnel_hits = 0
    if df.height > 0 and "url" in df.columns:
        funnel_hits = df.filter(
            pl.col("url").str.contains("/(shop|checkout|subscribe|order-success)|^/$|^https?://[^/]+/?$")
        ).height
    print(f"[clarity] {df.height} rows ({funnel_hits} match funnel pages)")

    out = raw_path("clarity_url_metrics")
    df.write_parquet(out)
    print(f"[clarity] -> {out}")
    return out


def _to_float(v):
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


if __name__ == "__main__":
    extract()
