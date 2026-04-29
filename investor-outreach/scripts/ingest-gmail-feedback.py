#!/usr/bin/env python3
"""
Layer 2 of the Customer Feedback Program: Gmail-label ingest.

Reads Gmail threads labelled `feedback-inbound` from anthony@unclemays.com
and writes one JSONL row per message to `data/feedback/feedback.jsonl`.
Idempotent — uses Gmail message IDs as the unique key, so re-running is safe.

Anthony applies the `feedback-inbound` label manually when triaging the
inbox; Resend-routed feedback rows (Source A/B/manual upload) all land as
emails into the same inbox via sendInternalAlert, so this single ingest
path picks up every channel.

Usage:
    python investor-outreach/scripts/ingest-gmail-feedback.py
    python investor-outreach/scripts/ingest-gmail-feedback.py --csv > out.csv
"""

from __future__ import annotations

import argparse
import base64
import csv
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

TOKEN_PATH = Path.home() / ".claude" / "gmail-oauth-token.json"
LABEL_NAME = "feedback-inbound"
STORE_PATH = Path("data/feedback/feedback.jsonl")
INDEX_PATH = Path("data/feedback/_seen-message-ids.json")


def get_access_token() -> str:
    tok = json.loads(TOKEN_PATH.read_text())
    data = urllib.parse.urlencode(
        {
            "client_id": tok["client_id"],
            "client_secret": tok["client_secret"],
            "refresh_token": tok["refresh_token"],
            "grant_type": "refresh_token",
        }
    ).encode()
    req = urllib.request.Request(tok["token_uri"], data=data)
    return json.loads(urllib.request.urlopen(req, timeout=30).read())["access_token"]


def gmail_get(path: str, access: str, params: dict | None = None) -> dict:
    qs = ""
    if params:
        qs = "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/{path}{qs}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access}"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def find_label_id(access: str, name: str) -> str | None:
    labels = gmail_get("labels", access).get("labels", [])
    for lab in labels:
        if lab.get("name", "").lower() == name.lower():
            return lab["id"]
    return None


def list_messages_for_label(access: str, label_id: str) -> list[str]:
    ids: list[str] = []
    page_token: str | None = None
    while True:
        params: dict = {"labelIds": label_id, "maxResults": 100}
        if page_token:
            params["pageToken"] = page_token
        data = gmail_get("messages", access, params)
        for m in data.get("messages", []) or []:
            ids.append(m["id"])
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return ids


def decode_part(part: dict) -> str:
    body = part.get("body", {})
    raw = body.get("data")
    if not raw:
        # Multipart: descend.
        out: list[str] = []
        for sub in part.get("parts", []) or []:
            out.append(decode_part(sub))
        return "\n".join(filter(None, out))
    raw = raw.replace("-", "+").replace("_", "/")
    pad = "=" * (-len(raw) % 4)
    try:
        return base64.b64decode(raw + pad).decode(errors="replace")
    except Exception:
        return ""


def header(headers: list[dict], name: str) -> str:
    for h in headers or []:
        if h.get("name", "").lower() == name.lower():
            return h.get("value", "")
    return ""


SOURCE_FROM_SUBJECT = re.compile(r"\[feedback:([^\]]+)\]")


def message_to_row(msg: dict) -> dict:
    payload = msg.get("payload", {}) or {}
    headers = payload.get("headers", []) or []
    subject = header(headers, "Subject")
    sender = header(headers, "From")
    to = header(headers, "To")
    date_hdr = header(headers, "Date")
    body = decode_part(payload).strip()

    # Try to extract source from the subject line ([feedback:...]) for rows
    # we generated ourselves via /api/feedback. Manual replies (abandon-reply)
    # won't match — default to abandon-reply.
    src_match = SOURCE_FROM_SUBJECT.search(subject)
    source = src_match.group(1) if src_match else "abandon-reply"

    # Extract structured fields from our own emails (Source: line, etc.).
    structured: dict[str, str] = {}
    for line in body.splitlines():
        m = re.match(r"^(Source|Channel|Product|Email|Session|Question|Notes):\s*(.+)$", line)
        if m:
            structured[m.group(1).lower()] = m.group(2).strip()
        if line.strip().lower() == "response:":
            break

    # Extract just the response payload (everything after a "Response:" line if present).
    if "\nResponse:\n" in body:
        raw_text = body.split("\nResponse:\n", 1)[1].strip()
    else:
        raw_text = body

    return {
        "id": msg.get("id"),
        "thread_id": msg.get("threadId"),
        "ts": int(msg.get("internalDate", 0)) // 1000,
        "ts_iso": datetime.fromtimestamp(
            int(msg.get("internalDate", 0)) / 1000, tz=timezone.utc
        ).isoformat(),
        "source": source,
        "channel": structured.get("channel") or ("email" if "@" in sender else "web"),
        "subject": subject,
        "from": sender,
        "to": to,
        "date_header": date_hdr,
        "customer_email": structured.get("email") or extract_email(sender),
        "product_slug": structured.get("product"),
        "session_id": structured.get("session"),
        "question": structured.get("question"),
        "notes": structured.get("notes"),
        "raw_text": raw_text[:8000],  # cap for sanity
    }


def extract_email(s: str) -> str | None:
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", s or "")
    return m.group(0) if m else None


def load_seen() -> set[str]:
    if not INDEX_PATH.exists():
        return set()
    try:
        return set(json.loads(INDEX_PATH.read_text()))
    except Exception:
        return set()


def save_seen(seen: set[str]) -> None:
    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    INDEX_PATH.write_text(json.dumps(sorted(seen)))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", action="store_true", help="Print existing JSONL as CSV to stdout, no Gmail call.")
    args = ap.parse_args()

    if args.csv:
        return dump_csv()

    access = get_access_token()
    label_id = find_label_id(access, LABEL_NAME)
    if not label_id:
        print(f"Label '{LABEL_NAME}' not found in Gmail. Apply it to threads first.", file=sys.stderr)
        return 1

    seen = load_seen()
    msg_ids = list_messages_for_label(access, label_id)
    print(f"Found {len(msg_ids)} messages with label {LABEL_NAME}; {len(seen)} previously ingested.")

    new_rows = 0
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with STORE_PATH.open("a", encoding="utf-8") as fp:
        for mid in msg_ids:
            if mid in seen:
                continue
            msg = gmail_get(f"messages/{mid}", access, {"format": "full"})
            row = message_to_row(msg)
            fp.write(json.dumps(row, ensure_ascii=False) + "\n")
            seen.add(mid)
            new_rows += 1

    save_seen(seen)
    print(f"Wrote {new_rows} new rows to {STORE_PATH}")
    return 0


def dump_csv() -> int:
    if not STORE_PATH.exists():
        print(f"No store at {STORE_PATH}", file=sys.stderr)
        return 1
    fields = [
        "id",
        "ts_iso",
        "source",
        "channel",
        "customer_email",
        "product_slug",
        "session_id",
        "question",
        "raw_text",
        "subject",
        "from",
    ]
    writer = csv.DictWriter(sys.stdout, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    with STORE_PATH.open("r", encoding="utf-8") as fp:
        for line in fp:
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            writer.writerow(row)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
