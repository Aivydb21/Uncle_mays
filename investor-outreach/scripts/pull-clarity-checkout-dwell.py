#!/usr/bin/env python3
"""
One-off Layer 0 calibration script for the Customer Feedback Program.

Pulls Microsoft Clarity export-API metrics for the last 3 days and writes
them to data/clarity-checkout-dwell-<YYYY-MM-DD>.json. The output is used
to calibrate the CheckoutExitSurvey trigger timing (Source A) so we don't
fire too early or too late.

Clarity's export API is rate-limited (10 calls/day per project, max 3 days
back) and returns aggregates, not per-session detail. If the aggregates are
not granular enough, fall back to manually watching ~10-15 recordings in
the Clarity UI and using the empirical median.
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

CONFIG_PATH = Path.home() / ".claude" / "clarity-config.json"
OUT_DIR = Path("data")
PAGES_OF_INTEREST = ("/checkout/family", "/checkout/starter")


def main() -> int:
    cfg = json.loads(CONFIG_PATH.read_text())
    token = cfg["api_token"]
    base = cfg["base_url"].rstrip("/")

    # Clarity export API: project-data with last N days
    # Dimensions of interest: URL, Browser, Device, Country, OS, Source, Channel.
    # We pull URL-segmented metrics and filter for our checkout paths.
    out: dict[str, object] = {
        "pulled_at": int(time.time()),
        "pages_of_interest": list(PAGES_OF_INTEREST),
        "results": {},
    }

    for days in (1, 2, 3):
        params = urllib.parse.urlencode(
            {
                "numOfDays": days,
                "dimension1": "URL",
            }
        )
        url = f"{base}/project-live-insights?{params}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": "uncle-mays-feedback-calibration/1.0",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            body = exc.read()[:500].decode(errors="replace")
            print(f"[{days}d] HTTP {exc.code}: {body}", file=sys.stderr)
            out["results"][f"{days}d"] = {"error": exc.code, "body": body}
            continue
        out["results"][f"{days}d"] = data

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    out_path = OUT_DIR / f"clarity-checkout-dwell-{today}.json"
    out_path.write_text(json.dumps(out, indent=2))
    print(f"Wrote {out_path}")

    # Surface a quick summary for the operator
    for window, payload in out["results"].items():
        if isinstance(payload, dict) and "error" in payload:
            print(f"  {window}: error {payload['error']}")
            continue
        if isinstance(payload, list):
            checkout_rows = []
            for item in payload:
                info = item.get("information") if isinstance(item, dict) else None
                if not info:
                    continue
                for row in info:
                    url = row.get("URL") or row.get("Url") or ""
                    if any(p in url for p in PAGES_OF_INTEREST):
                        checkout_rows.append((url, row))
            print(f"  {window}: {len(checkout_rows)} matching URL rows")
            for url, row in checkout_rows[:6]:
                keys = ", ".join(f"{k}={v}" for k, v in row.items() if k.lower() != "url")
                print(f"    {url:35} {keys}")
        else:
            print(f"  {window}: shape={type(payload).__name__}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
