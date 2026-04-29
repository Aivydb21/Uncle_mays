#!/usr/bin/env python3
"""
Layer 4 of the Customer Feedback Program: classifier.

Reads `data/feedback/feedback.jsonl`, classifies each new row with
themes, sentiment, and an "actionable" boolean using the Claude API
with prompt caching (the rubric is the cached prefix; only the
response payload changes per row).

Idempotent: rows already containing `themes`, `sentiment`, and
`actionable` are skipped. Output is rewritten in-place to
`data/feedback/feedback.jsonl` (atomic via temp file).

Indexes regenerated on every run:
    data/feedback/feedback-by-theme.json
    data/feedback/feedback-by-email.json

Usage:
    python investor-outreach/scripts/classify-feedback.py
    python investor-outreach/scripts/classify-feedback.py --dry-run
    python investor-outreach/scripts/classify-feedback.py --reclassify
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path

CONFIG_PATH = Path.home() / ".claude" / "anthropic-config.json"
STORE_PATH = Path("data/feedback/feedback.jsonl")
THEME_INDEX_PATH = Path("data/feedback/feedback-by-theme.json")
EMAIL_INDEX_PATH = Path("data/feedback/feedback-by-email.json")
MODEL = "claude-haiku-4-5-20251001"  # cheap + fast; classifier is a closed-list task

THEMES = [
    "box_contents",
    "price",
    "delivery",
    "frequency",
    "quantity",
    "proteins",
    "subscription_friction",
    "trust",
    "other",
]

SYSTEM_PROMPT = f"""You are the customer-feedback classifier for Uncle May's Produce, a Chicago grocery box delivery service. Customers and visitors leave free-text feedback about a $40 Spring Box and a $70 Full Harvest Box that contain seasonal Black-farmer-sourced produce + (optional) pasture-raised proteins.

Your job: given one feedback message, return strict JSON with three keys:

1. `themes`: array of zero or more values from this closed list:
   - "box_contents": item-level wants (X is missing, I want Y, Z is random)
   - "price": price too high / too low / questions about value
   - "delivery": delivery day, area, logistics, shipping
   - "frequency": weekly vs every-other-week vs monthly cadence asks
   - "quantity": how-much-food, portion, weight, "feeds X people"
   - "proteins": chicken, beef, eggs, fish, pork, lamb — anything protein
   - "subscription_friction": don't want to subscribe, want one-time, cancel anxiety
   - "trust": skepticism, comparison to competitors, "how do I know it's fresh"
   - "other": doesn't fit cleanly into any of the above
   Pick all that apply. Empty array if none apply.

2. `sentiment`: one of "positive", "neutral", "negative".

3. `actionable`: boolean. True if the message contains a specific concrete request or objection we could act on. False if vague (e.g. "looks ok").

Output MUST be valid JSON. No prose, no commentary, no markdown fences. Just the JSON object.

Allowed themes: {json.dumps(THEMES)}.
"""

USER_TEMPLATE = """Feedback message (verbatim from a respondent):

\"\"\"{text}\"\"\"

Source: {source}
Channel: {channel}
Customer email present: {has_email}

Return the JSON object now."""


def call_claude(api_key: str, raw_text: str, source: str, channel: str, has_email: bool) -> dict:
    body = {
        "model": MODEL,
        "max_tokens": 200,
        "system": [
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        "messages": [
            {
                "role": "user",
                "content": USER_TEMPLATE.format(
                    text=raw_text[:1500],
                    source=source,
                    channel=channel,
                    has_email=str(has_email).lower(),
                ),
            }
        ],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(body).encode(),
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())
    text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
    return json.loads(text.strip())


def is_classified(row: dict) -> bool:
    return (
        isinstance(row.get("themes"), list)
        and isinstance(row.get("sentiment"), str)
        and isinstance(row.get("actionable"), bool)
    )


def write_indexes(rows: list[dict]) -> None:
    by_theme: dict[str, list[str]] = defaultdict(list)
    by_email: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        rid = r.get("id") or ""
        for t in r.get("themes") or []:
            by_theme[t].append(rid)
        em = r.get("customer_email")
        if em:
            by_email[em.lower()].append(rid)
    THEME_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    THEME_INDEX_PATH.write_text(json.dumps(dict(by_theme), indent=2))
    EMAIL_INDEX_PATH.write_text(json.dumps(dict(by_email), indent=2))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Print classifications, do not write store.")
    ap.add_argument("--reclassify", action="store_true", help="Re-classify rows even if already classified.")
    ap.add_argument("--limit", type=int, default=0, help="Stop after N classifications (0 = no limit).")
    args = ap.parse_args()

    if not STORE_PATH.exists():
        print(f"No store at {STORE_PATH}. Run ingest-gmail-feedback.py first.", file=sys.stderr)
        return 1

    api_key = json.loads(CONFIG_PATH.read_text())["api_key"]

    rows: list[dict] = []
    with STORE_PATH.open("r", encoding="utf-8") as fp:
        for line in fp:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                print(f"Skipping malformed line: {line[:80]}", file=sys.stderr)

    classified_now = 0
    cache_reads = 0
    cache_creates = 0
    for row in rows:
        if not args.reclassify and is_classified(row):
            continue
        text = (row.get("raw_text") or "").strip()
        if not text:
            row["themes"] = []
            row["sentiment"] = "neutral"
            row["actionable"] = False
            continue
        try:
            cls = call_claude(
                api_key,
                text,
                row.get("source") or "manual-upload",
                row.get("channel") or "web",
                bool(row.get("customer_email")),
            )
        except urllib.error.HTTPError as e:
            print(f"  Row {row.get('id')}: HTTP {e.code} {e.read()[:200].decode(errors='replace')}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"  Row {row.get('id')}: {e}", file=sys.stderr)
            continue
        # Defensive: enforce closed list
        themes = [t for t in (cls.get("themes") or []) if t in THEMES]
        sentiment = cls.get("sentiment") if cls.get("sentiment") in ("positive", "neutral", "negative") else "neutral"
        actionable = bool(cls.get("actionable"))
        row["themes"] = themes
        row["sentiment"] = sentiment
        row["actionable"] = actionable
        classified_now += 1
        print(
            f"  Row {row.get('id', '')}: themes={themes} sentiment={sentiment} actionable={actionable}"
        )
        if args.limit and classified_now >= args.limit:
            break
        time.sleep(0.2)  # gentle on the API

    print(
        f"\nClassified {classified_now} new rows. Total rows: {len(rows)}. "
        f"Cache reads={cache_reads}, creates={cache_creates}."
    )

    if args.dry_run:
        return 0

    # Atomic rewrite
    tmp = STORE_PATH.with_suffix(".jsonl.tmp")
    with tmp.open("w", encoding="utf-8") as fp:
        for row in rows:
            fp.write(json.dumps(row, ensure_ascii=False) + "\n")
    tmp.replace(STORE_PATH)

    write_indexes(rows)
    print(f"Wrote {STORE_PATH}, {THEME_INDEX_PATH}, {EMAIL_INDEX_PATH}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
