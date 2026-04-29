#!/usr/bin/env python3
"""
Layer 5 of the Customer Feedback Program: weekly digest.

Aggregates last 7 days from `data/feedback/feedback.jsonl` (rows must be
classified — run classify-feedback.py first) and either prints to stdout
(--dry-run) or sends to anthony@unclemays.com via Resend.

Recipients: anthony@unclemays.com only, by design (per program scope).

Usage:
    python investor-outreach/scripts/feedback-digest.py --dry-run
    python investor-outreach/scripts/feedback-digest.py
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

RESEND_CONFIG = Path.home() / ".claude" / "resend-config.json"
STORE_PATH = Path("data/feedback/feedback.jsonl")
RECIPIENT = "anthony@unclemays.com"


def load_rows() -> list[dict]:
    if not STORE_PATH.exists():
        return []
    rows: list[dict] = []
    with STORE_PATH.open("r", encoding="utf-8") as fp:
        for line in fp:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def in_window(row: dict, since_ts: int) -> bool:
    return int(row.get("ts") or 0) >= since_ts


def render(rows: list[dict], all_rows: list[dict], since_ts: int, prev_since_ts: int) -> tuple[str, str]:
    last7 = [r for r in rows if in_window(r, since_ts)]
    prev7 = [r for r in all_rows if in_window(r, prev_since_ts) and not in_window(r, since_ts)]

    by_source: Counter = Counter(r.get("source") or "unknown" for r in last7)
    themes: Counter = Counter()
    for r in last7:
        for t in r.get("themes") or []:
            themes[t] += 1
    sentiment: Counter = Counter(r.get("sentiment") or "unknown" for r in last7)
    sentiment_prev: Counter = Counter(r.get("sentiment") or "unknown" for r in prev7)

    actionable_rows = [r for r in last7 if r.get("actionable")]

    # Top quotes: prefer actionable + non-empty
    top_quotes: list[dict] = []
    for r in actionable_rows[:10]:
        q = (r.get("raw_text") or "").strip()
        if not q:
            continue
        top_quotes.append(
            {
                "text": q[:280] + ("…" if len(q) > 280 else ""),
                "source": r.get("source"),
                "themes": r.get("themes") or [],
                "email": r.get("customer_email"),
            }
        )

    week_label = datetime.fromtimestamp(since_ts, tz=timezone.utc).strftime("%Y-%m-%d")

    plain_lines: list[str] = []
    plain_lines.append(f"Customer Feedback Digest — week of {week_label}")
    plain_lines.append("=" * 60)
    plain_lines.append(f"Total responses: {len(last7)} (prev 7d: {len(prev7)})")
    plain_lines.append("")
    plain_lines.append("By source:")
    for s, n in by_source.most_common():
        plain_lines.append(f"  {s:24} {n}")
    plain_lines.append("")
    plain_lines.append("Top themes:")
    for t, n in themes.most_common(8):
        plain_lines.append(f"  {t:24} {n}")
    plain_lines.append("")
    plain_lines.append("Sentiment:")
    for s in ("positive", "neutral", "negative"):
        n = sentiment.get(s, 0)
        n_prev = sentiment_prev.get(s, 0)
        delta = n - n_prev
        plain_lines.append(f"  {s:10} {n:>3}  (Δ {delta:+d} vs prev 7d)")
    plain_lines.append("")
    plain_lines.append(f"Actionable items: {len(actionable_rows)}")
    plain_lines.append("")
    plain_lines.append("Top quotes (actionable):")
    if not top_quotes:
        plain_lines.append("  (none in window)")
    else:
        for q in top_quotes:
            plain_lines.append(
                f'  [{q["source"]}] themes={q["themes"]}'
                + (f' email={q["email"]}' if q["email"] else "")
            )
            plain_lines.append(f"    \"{q['text']}\"")
            plain_lines.append("")

    plain_lines.append("---")
    plain_lines.append("Run notes/feedback-program.md for cadence + ownership.")
    plain_text = "\n".join(plain_lines)

    # HTML version is just the plain text in a <pre> for portability.
    html = (
        '<div style="font-family:Georgia,serif;max-width:680px;margin:0 auto;padding:24px;">'
        f'<h2 style="margin-top:0;">Customer Feedback Digest — week of {week_label}</h2>'
        f'<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;font-size:13px;line-height:1.55;">'
        f"{escape_html(plain_text)}"
        f"</pre>"
        "</div>"
    )

    return plain_text, html


def escape_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def send_resend(plain: str, html: str, since_label: str) -> dict:
    cfg = json.loads(RESEND_CONFIG.read_text())
    api_key = cfg["api_key"]
    from_email = cfg.get("from_email") or "Uncle May's Produce <hello@unclemays.com>"
    reply_to = cfg.get("reply_to") or "info@unclemays.com"
    body = {
        "from": from_email,
        "to": [RECIPIENT],
        "subject": f"Customer Feedback Digest — week of {since_label}",
        "html": html,
        "text": plain,
        "reply_to": reply_to,
        "tags": [
            {"name": "type", "value": "feedback_digest"},
        ],
    }
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Print to stdout, do not send.")
    ap.add_argument("--days", type=int, default=7, help="Lookback window in days (default 7).")
    args = ap.parse_args()

    rows = load_rows()
    if not rows:
        print(f"No rows in {STORE_PATH}. Run ingest-gmail-feedback.py + classify-feedback.py first.")
        return 1

    now = int(time.time())
    since_ts = now - args.days * 86400
    prev_since_ts = now - 2 * args.days * 86400

    plain, html = render(rows, rows, since_ts, prev_since_ts)
    label = datetime.fromtimestamp(since_ts, tz=timezone.utc).strftime("%Y-%m-%d")

    if args.dry_run:
        print(plain)
        return 0

    result = send_resend(plain, html, label)
    print(f"Sent. Resend id: {result.get('id')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
