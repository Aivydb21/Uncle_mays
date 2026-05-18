"""Pull LogRocket session metrics and Galileo daily insights to parquet.

Sources:
  1. LogRocket Sessions API  — `/v1/{org}/{app}/sessions` — daily aggregates
  2. Galileo daily prompts   — call the same prompts as galileo-daily-briefing.ts
                               and persist answers to parquet for BQ journaling

Two output parquets (raw/):
  logrocket_sessions_<ts>.parquet    — one row per session in the trailing window
  logrocket_galileo_<ts>.parquet     — one row per Galileo prompt answer

Auth:
  Config: ~/.claude/logrocket-config.json
  PAT field is used for both the REST API and MCP (it is the same credential).
  REST header: Authorization: <api_token>  (token portion only, no "Bearer" prefix)
  MCP header:  Authorization: Bearer <full_pat>

BigQuery load:
  Sessions → logrocket_raw.sessions        (daily parquet rows)
  Galileo  → logrocket_galileo.briefings   (daily prompt answers, journaled)
  The bigquery_logrocket_loader.py (companion script) does the BQ write.

Usage:
  python -m ml.ingest.logrocket          # pull last 2 days (default)
  python -m ml.ingest.logrocket --days 7 # pull last 7 days
  python -m ml.ingest.logrocket --skip-galileo  # sessions only (faster)
"""

from __future__ import annotations

import argparse
import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import polars as pl

from ._common import load_dotenv_if_present, load_json_config, raw_path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
_CONFIG_ENV = "LOGROCKET_CONFIG_PATH"
_CONFIG_DEFAULT = "~/.claude/logrocket-config.json"

SESSIONS_WINDOW_DAYS = 2   # how many trailing days of sessions to pull
MAX_SESSIONS = 5000        # cap per pull (API paginates; this is our ceiling)

# Galileo daily prompts — mirrors _galileo-prompts.ts (keep in sync)
GALILEO_PROMPTS = [
    {
        "id": "daily.top_friction",
        "version": "2026-05-v1",
        "text": (
            "What are the top 3 friction points users encountered on unclemays.com "
            "in the last 24 hours? For each, include the affected page, what the "
            "user was trying to do, and whether it led to an exit."
        ),
    },
    {
        "id": "daily.checkout_drop",
        "version": "2026-05-v1",
        "text": (
            "How many users reached the checkout page in the last 24 hours and "
            "did not complete a purchase? What was the most common exit point "
            "in the checkout flow?"
        ),
    },
    {
        "id": "daily.revenue_sessions",
        "version": "2026-05-v1",
        "text": (
            "Summarize the sessions that resulted in a purchase in the last 24 "
            "hours. What traffic sources, devices, and pages did buyers touch "
            "most? Any notable patterns?"
        ),
    },
]

MCP_URL = "https://mcp.logrocket.com/mcp"
MAX_POLLS = 30
POLL_INTERVAL_S = 20


# ---------------------------------------------------------------------------
# LogRocket REST helpers
# ---------------------------------------------------------------------------

def _cfg() -> dict:
    return load_json_config(_CONFIG_ENV, _CONFIG_DEFAULT)


def _rest_headers(cfg: dict) -> dict:
    return {
        "Authorization": cfg["api_token"],
        "Content-Type": "application/json",
    }


def _get(url: str, headers: dict, params: dict | None = None, timeout: int = 30) -> dict:
    if params:
        import urllib.parse
        url = url + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"LogRocket API error {exc.code}: {exc.read().decode()[:300]}") from exc


def _pull_sessions(cfg: dict, window_days: int, max_rows: int) -> list[dict]:
    """Pull sessions from the last `window_days` days via LogRocket REST API.

    NOTE 2026-05-16 (UNC-1112): LogRocket does not publicly document a sessions
    list REST endpoint. The Galileo MCP (logrocket_galileo parquet) is the primary
    programmatic interface for querying session data. This function attempts to
    pull from the REST API and returns [] gracefully if the endpoint is unavailable.
    When LogRocket exposes an official sessions export API, update the URL here.

    Current attempt: GET {base_url}/{org}/{app}/sessions
    """
    base_url = cfg.get("base_url", "https://r.logrocket.io/v1")
    org = cfg["org_slug"]
    app = cfg["app_slug"]
    url = f"{base_url}/{org}/{app}/sessions"
    headers = _rest_headers(cfg)

    now_ms = int(time.time() * 1000)
    start_ms = now_ms - window_days * 24 * 3600 * 1000

    rows: list[dict] = []
    offset = 0
    page_size = 100

    while len(rows) < max_rows:
        params = {
            "start": start_ms,
            "end": now_ms,
            "count": page_size,
            "offset": offset,
        }
        try:
            data = _get(url, headers, params)
        except RuntimeError as exc:
            print(f"[logrocket.sessions] REST API unavailable (offset={offset}): {exc}")
            print("[logrocket.sessions] Primary session intelligence is via Galileo MCP — see logrocket_galileo parquet.")
            break

        sessions = data if isinstance(data, list) else data.get("sessions", [])
        if not sessions:
            break

        for s in sessions:
            rows.append({
                "session_id":       str(s.get("id") or s.get("sessionId") or ""),
                "user_id":          str(s.get("userID") or s.get("userId") or ""),
                "started_at_ms":    s.get("started") or s.get("startedAt") or s.get("createdAt"),
                "duration_ms":      s.get("duration") or s.get("durationMs"),
                "page_count":       s.get("pageCount") or s.get("numPages"),
                "error_count":      s.get("errorCount") or s.get("numErrors"),
                "rage_click_count": s.get("rageClickCount") or s.get("numRageClicks"),
                "first_url":        s.get("firstUrl") or s.get("url") or s.get("startUrl"),
                "os_name":          (s.get("os") or {}).get("name") if isinstance(s.get("os"), dict) else s.get("os"),
                "browser_name":     (s.get("browser") or {}).get("name") if isinstance(s.get("browser"), dict) else s.get("browser"),
                "country_code":     s.get("countryCode") or s.get("country"),
                "device_type":      s.get("deviceType") or s.get("device"),
                "is_identified":    bool(s.get("userId") or s.get("userID")),
                "pulled_at":        datetime.now(timezone.utc).isoformat(),
            })

        if len(sessions) < page_size:
            break  # last page
        offset += page_size

    return rows


# ---------------------------------------------------------------------------
# Galileo MCP helpers
# ---------------------------------------------------------------------------

def _mcp_call(pat: str, method: str, params: dict, request_id: int = 1) -> dict:
    body = json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}).encode()
    req = urllib.request.Request(
        MCP_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {pat}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        raw = r.read().decode()
    # Parse SSE or plain JSON
    envelope: dict = {}
    for line in raw.splitlines():
        if line.startswith("data:"):
            try:
                envelope = json.loads(line[5:].strip())
                break
            except json.JSONDecodeError:
                pass
    if not envelope:
        try:
            envelope = json.loads(raw)
        except json.JSONDecodeError:
            pass
    return envelope


def _ask_galileo(pat: str, query: str, prompt_id: str, prompt_version: str) -> dict:
    """Call Galileo MCP with polling. Returns answer dict."""
    started = time.time()

    envelope = _mcp_call(pat, "tools/call", {
        "name": "use_logrocket",
        "arguments": {"query": query},
    })

    result = (envelope.get("result") or {})
    status = result.get("status", "completed")
    chat_id = result.get("chatID")
    messages = result.get("messages", [])

    polls = 0
    while status == "thinking" and chat_id and polls < MAX_POLLS:
        time.sleep(POLL_INTERVAL_S)
        polls += 1
        envelope = _mcp_call(pat, "tools/call", {
            "name": "use_logrocket",
            "arguments": {"query": query, "chatID": chat_id, "pollForResult": True},
        })
        result = (envelope.get("result") or {})
        status = result.get("status", "completed")
        messages = result.get("messages", messages)

    # Extract text from last assistant message
    text = ""
    links: list[str] = []
    for msg in reversed(messages or []):
        content = msg.get("text") or msg.get("content") or ""
        if content:
            text = content
            break

    # Also check content array
    if not text:
        for item in (result.get("content") or []):
            if isinstance(item, dict) and item.get("type") == "text":
                text = item.get("text", "")
                break

    return {
        "prompt_id":      prompt_id,
        "prompt_version": prompt_version,
        "query":          query,
        "answer":         text,
        "status":         status,
        "chat_id":        chat_id or "",
        "duration_ms":    int((time.time() - started) * 1000),
        "pulled_at":      datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Public extract()
# ---------------------------------------------------------------------------

def extract(window_days: int = SESSIONS_WINDOW_DAYS, skip_galileo: bool = False) -> dict[str, Path]:
    """Pull LogRocket sessions + Galileo answers to parquet.

    Returns dict of table_name -> parquet path.
    """
    load_dotenv_if_present()
    cfg = _cfg()
    out: dict[str, Path] = {}

    # --- Sessions ---
    print(f"[logrocket.sessions] pulling last {window_days} days ...")
    session_rows = _pull_sessions(cfg, window_days, MAX_SESSIONS)
    if session_rows:
        df = pl.DataFrame(session_rows, infer_schema_length=len(session_rows))
    else:
        # Write empty placeholder so freshness check sees the file
        df = pl.DataFrame({
            "session_id": pl.Series([], dtype=pl.Utf8),
            "user_id": pl.Series([], dtype=pl.Utf8),
            "started_at_ms": pl.Series([], dtype=pl.Utf8),
            "duration_ms": pl.Series([], dtype=pl.Utf8),
            "page_count": pl.Series([], dtype=pl.Utf8),
            "error_count": pl.Series([], dtype=pl.Utf8),
            "rage_click_count": pl.Series([], dtype=pl.Utf8),
            "first_url": pl.Series([], dtype=pl.Utf8),
            "os_name": pl.Series([], dtype=pl.Utf8),
            "browser_name": pl.Series([], dtype=pl.Utf8),
            "country_code": pl.Series([], dtype=pl.Utf8),
            "device_type": pl.Series([], dtype=pl.Utf8),
            "is_identified": pl.Series([], dtype=pl.Boolean),
            "pulled_at": pl.Series([], dtype=pl.Utf8),
        })
        print(f"[logrocket.sessions] WARNING: 0 sessions returned (API may be filtering or returning different schema)")

    sessions_path = raw_path("logrocket_sessions")
    df.write_parquet(sessions_path)
    out["logrocket_sessions"] = sessions_path
    print(f"[logrocket.sessions] {len(session_rows)} rows -> {sessions_path}")

    # --- Galileo ---
    if skip_galileo:
        return out

    pat = cfg.get("pat", cfg.get("api_token", ""))
    if not pat:
        print("[logrocket.galileo] SKIP: no PAT in config")
        return out

    galileo_rows: list[dict] = []
    for prompt in GALILEO_PROMPTS:
        print(f"[logrocket.galileo] asking: {prompt['id']} ...")
        try:
            answer = _ask_galileo(pat, prompt["text"], prompt["id"], prompt["version"])
            galileo_rows.append(answer)
            print(f"[logrocket.galileo] {prompt['id']}: {answer['status']} ({answer['duration_ms']}ms)")
        except Exception as exc:
            print(f"[logrocket.galileo] {prompt['id']} FAILED: {exc}")
            galileo_rows.append({
                "prompt_id": prompt["id"],
                "prompt_version": prompt["version"],
                "query": prompt["text"],
                "answer": "",
                "status": "error",
                "chat_id": "",
                "duration_ms": 0,
                "pulled_at": datetime.now(timezone.utc).isoformat(),
            })

    galileo_df = pl.DataFrame(galileo_rows, infer_schema_length=len(galileo_rows)) if galileo_rows else pl.DataFrame()
    galileo_path = raw_path("logrocket_galileo")
    galileo_df.write_parquet(galileo_path)
    out["logrocket_galileo"] = galileo_path
    print(f"[logrocket.galileo] {len(galileo_rows)} prompts -> {galileo_path}")

    return out


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LogRocket + Galileo ingest")
    parser.add_argument("--days", type=int, default=SESSIONS_WINDOW_DAYS,
                        help="Trailing days of sessions to pull")
    parser.add_argument("--skip-galileo", action="store_true",
                        help="Skip Galileo prompts (sessions only)")
    args = parser.parse_args()
    extract(window_days=args.days, skip_galileo=args.skip_galileo)
