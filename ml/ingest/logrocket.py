"""Pull LogRocket session metrics and Galileo daily insights to parquet.

Sources:
  1. LogRocket Sessions API  — `/v1/{org}/{app}/sessions` — daily aggregates
                               NOTE: REST API returns 404 (UNC-1221). Use
                               --session-summary mode instead (Galileo-derived).
  2. Galileo daily prompts   — call the same prompts as galileo-daily-briefing.ts
                               and persist answers to parquet for BQ journaling
  3. Galileo session summary — --session-summary mode: 1 structured row per UTC
                               day in logrocket_raw.sessions for CVR reconciliation

Two output parquets (raw/):
  logrocket_sessions_<ts>.parquet    — one row per session (REST, if available) or
                                       one summary row per day (--session-summary)
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
  python -m ml.ingest.logrocket                     # pull last 2 days (default)
  python -m ml.ingest.logrocket --days 7            # pull last 7 days
  python -m ml.ingest.logrocket --skip-galileo      # sessions only (faster)
  python -m ml.ingest.logrocket --session-summary   # Galileo-derived daily summary
  python -m ml.ingest.logrocket --session-summary --days 7  # 7-day summary
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
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
# Wall-clock timeout for a single MCP HTTP call (socket timeout alone is
# insufficient because SSE keep-alives prevent the socket from going idle).
MCP_CALL_TIMEOUT_S = 90

# Session summary prompt — used by --session-summary mode (UNC-1221).
# Asks Galileo for one day's worth of structured session data since the
# LogRocket REST /sessions endpoint returns 404.
_SESSION_SUMMARY_PROMPT_TMPL = (
    "For unclemays.com on {date} (UTC), please provide the following numbers. "
    "Format each answer on its own line with a clear label so I can parse them:\n"
    "1. TOTAL_SESSIONS: total number of sessions recorded\n"
    "2. MOBILE_SESSIONS: sessions on mobile devices\n"
    "3. DESKTOP_SESSIONS: sessions on desktop/tablet devices\n"
    "4. HOME_SESSIONS: sessions where the entry page was the home page (/)\n"
    "5. SHOP_SESSIONS: sessions where the entry page was the shop page (/shop)\n"
    "6. CHECKOUT_SESSIONS: sessions where the entry page was the checkout page (/checkout)\n"
    "7. OTHER_SESSIONS: sessions with any other entry page\n"
    "8. FRUSTRATED_USERS: number of users classified as frustrated\n"
    "9. RAGE_CLICKS: total number of rage clicks recorded\n"
    "If data is unavailable for a specific field, write 0."
)

_INT_PATTERN = re.compile(r"(\d[\d,]*)")


def _parse_int(text: str, label: str) -> int | None:
    """Extract the integer following `label:` in text (case-insensitive)."""
    pattern = re.compile(rf"{re.escape(label)}\s*[:\-]?\s*(\d[\d,]*)", re.IGNORECASE)
    m = pattern.search(text)
    if m:
        return int(m.group(1).replace(",", ""))
    return None


def _build_session_summary_row(date_str: str, answer: str, chat_id: str) -> dict:
    """Parse Galileo's prose answer into a structured sessions row.

    All numeric fields default to None when Galileo does not provide them,
    so the dbt model can filter on `source = 'galileo_summary'` and handle
    nulls explicitly.

    The synthetic session_id = 'summary_YYYY-MM-DD' makes the row unique
    so bigquery_logrocket_loader.py dedup by session_id works correctly.
    """
    total = _parse_int(answer, "TOTAL_SESSIONS")
    mobile = _parse_int(answer, "MOBILE_SESSIONS")
    desktop = _parse_int(answer, "DESKTOP_SESSIONS")
    home = _parse_int(answer, "HOME_SESSIONS")
    shop = _parse_int(answer, "SHOP_SESSIONS")
    checkout = _parse_int(answer, "CHECKOUT_SESSIONS")
    other_pages = _parse_int(answer, "OTHER_SESSIONS")
    frustrated = _parse_int(answer, "FRUSTRATED_USERS")
    rage_clicks = _parse_int(answer, "RAGE_CLICKS")

    device_breakdown: dict = {}
    if mobile is not None:
        device_breakdown["mobile"] = mobile
    if desktop is not None:
        device_breakdown["desktop"] = desktop

    entry_page_breakdown: dict = {}
    if home is not None:
        entry_page_breakdown["/"] = home
    if shop is not None:
        entry_page_breakdown["/shop"] = shop
    if checkout is not None:
        entry_page_breakdown["/checkout"] = checkout
    if other_pages is not None:
        entry_page_breakdown["other"] = other_pages

    return {
        "session_id":              f"summary_{date_str}",
        "user_id":                 "",
        "started_at_ms":           date_str,       # date string, not ms epoch
        "duration_ms":             None,
        "page_count":              None,
        "error_count":             None,
        "rage_click_count":        str(rage_clicks) if rage_clicks is not None else None,
        "first_url":               None,
        "os_name":                 None,
        "browser_name":            None,
        "country_code":            None,
        "device_type":             None,
        "is_identified":           None,
        # Summary-specific fields
        "source":                  "galileo_summary",
        "summary_date":            date_str,
        "session_count":           total,
        "device_type_breakdown":   json.dumps(device_breakdown),
        "entry_page_breakdown":    json.dumps(entry_page_breakdown),
        "frustrated_user_count":   frustrated,
        "galileo_chat_id":         chat_id,
        "galileo_raw_answer":      answer,
        "pulled_at":               datetime.now(timezone.utc).isoformat(),
    }


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
    """Make a single Galileo MCP HTTP call with a hard wall-clock timeout.

    The socket-level timeout alone is insufficient for SSE streams: the server
    can keep the connection alive indefinitely with heartbeat bytes while
    "thinking", bypassing the per-read socket deadline.  We wrap the call in a
    thread so we can enforce a true wall-clock limit (MCP_CALL_TIMEOUT_S).
    """
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

    def _do_request() -> str:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read().decode()

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_do_request)
        try:
            raw = future.result(timeout=MCP_CALL_TIMEOUT_S)
        except concurrent.futures.TimeoutError:
            raise TimeoutError(
                f"Galileo MCP call timed out after {MCP_CALL_TIMEOUT_S}s "
                "(wall-clock; SSE keep-alive bypassed socket timeout)"
            )

    # Parse SSE or plain JSON — take the LAST data: line (MCP may emit multiple)
    envelope: dict = {}
    data_lines = [l[5:].strip() for l in raw.splitlines() if l.startswith("data:") and l[5:].strip()]
    if data_lines:
        try:
            envelope = json.loads(data_lines[-1])
        except json.JSONDecodeError:
            pass
    if not envelope:
        try:
            envelope = json.loads(raw)
        except json.JSONDecodeError:
            pass
    return envelope


def _parse_mcp_envelope(envelope: dict) -> tuple[str | None, str, list[str], list[dict]]:
    """Extract (chat_id, status, links, messages) from a Galileo MCP envelope.

    The MCP wraps the actual response as a JSON string inside
    result.content[].text — we must parse that inner JSON to get chatID,
    status, and the messages array.  This mirrors extractTextAndLinks +
    extractChatId + extractStatus in src/lib/galileo.ts.

    Returns (chat_id, status, links, messages) where:
      chat_id   — UUID string for follow-up poll calls, or None
      status    — "thinking" | "completed" | "error"
      links     — list of URLs found in message text
      messages  — list of raw message objects from inner JSON
    """
    result = envelope.get("result") or {}
    content = result.get("content") or []

    chat_id: str | None = result.get("chatID")
    status: str = "completed"
    messages: list[dict] = []
    raw_texts: list[str] = []

    for item in content:
        if not isinstance(item, dict) or item.get("type") != "text":
            continue
        raw_text = item.get("text", "")
        if not raw_text:
            continue
        # Try to parse the inner JSON envelope (the MCP's actual payload)
        try:
            inner = json.loads(raw_text)
        except (json.JSONDecodeError, TypeError):
            # Plain prose — treat as final answer text
            raw_texts.append(raw_text)
            continue

        # Extract chatID from inner JSON if not already found
        if not chat_id and inner.get("chatID"):
            chat_id = str(inner["chatID"])

        # Extract status
        inner_status = inner.get("status") or (inner.get("result") or {}).get("status")
        if inner_status in ("thinking", "completed", "error"):
            status = inner_status

        # Extract messages array (Galileo's actual content)
        inner_msgs = inner.get("messages") or (inner.get("result") or {}).get("messages") or []
        if isinstance(inner_msgs, list):
            messages.extend(inner_msgs)

    # Build final text from messages: Galileo's shape is
    #   { messageContent: "...", type: "system"|"assistant", isTerminalMessage: bool }
    # Use ALL messages for thinking state (partial progress), but for completed
    # prefer the last non-empty messageContent.
    text_parts: list[str] = []
    for msg in messages:
        if isinstance(msg, dict):
            body = msg.get("messageContent") or msg.get("text") or msg.get("content") or ""
            if body and isinstance(body, str):
                text_parts.append(body)
    if raw_texts:
        text_parts.extend(raw_texts)

    # Extract HTTP links from all text
    import re
    link_pattern = re.compile(r"https?://[^\s)\]]+")
    links: list[str] = []
    for t in text_parts:
        for url in link_pattern.findall(t):
            if url not in links:
                links.append(url)

    return chat_id, status, links, messages


def _ask_galileo(pat: str, query: str, prompt_id: str, prompt_version: str) -> dict:
    """Call Galileo MCP with polling. Returns answer dict with verbatim Galileo prose.

    Key fix (2026-05-19, UNC-1217): the MCP wraps its payload as a JSON string
    inside result.content[].text — we parse that inner JSON to get chatID +
    status + messages rather than reading the outer result dict directly.
    """
    started = time.time()

    envelope = _mcp_call(pat, "tools/call", {
        "name": "use_logrocket",
        "arguments": {"query": query},
    })

    if envelope.get("error"):
        err = envelope["error"]
        return {
            "prompt_id":      prompt_id,
            "prompt_version": prompt_version,
            "query":          query,
            "answer":         f"Galileo MCP error {err.get('code')}: {err.get('message')}",
            "status":         "error",
            "chat_id":        "",
            "duration_ms":    int((time.time() - started) * 1000),
            "pulled_at":      datetime.now(timezone.utc).isoformat(),
        }

    chat_id, status, links, messages = _parse_mcp_envelope(envelope)

    polls = 0
    while status == "thinking" and chat_id and polls < MAX_POLLS:
        time.sleep(POLL_INTERVAL_S)
        polls += 1
        print(f"[logrocket.galileo] {prompt_id}: poll {polls}/{MAX_POLLS} (chatID={chat_id[:8]}...)")
        poll_env = _mcp_call(pat, "tools/call", {
            "name": "use_logrocket",
            "arguments": {"query": query, "chatID": chat_id, "pollForResult": True},
        }, request_id=polls + 1)
        if poll_env.get("error"):
            break
        new_chat_id, new_status, new_links, new_messages = _parse_mcp_envelope(poll_env)
        if new_chat_id:
            chat_id = new_chat_id
        if new_status:
            status = new_status
        for lnk in new_links:
            if lnk not in links:
                links.append(lnk)
        if new_messages:
            messages = new_messages  # replace with latest full message list

    if status == "thinking":
        print(f"[logrocket.galileo] {prompt_id}: WARN still thinking after {polls} polls — saving partial answer")

    # Build the final answer: concatenate all messageContent strings, preserving
    # Galileo's verbatim prose (no paraphrasing per LOGROCKET-CLAUSE-2026-05-15).
    text_parts: list[str] = []
    for msg in messages:
        if isinstance(msg, dict):
            body = msg.get("messageContent") or msg.get("text") or msg.get("content") or ""
            if body and isinstance(body, str):
                text_parts.append(body.strip())
    answer = "\n\n".join(text_parts).strip() or "(Galileo returned an empty answer)"

    return {
        "prompt_id":      prompt_id,
        "prompt_version": prompt_version,
        "query":          query,
        "answer":         answer,
        "status":         status,
        "chat_id":        chat_id or "",
        "links":          json.dumps(links),
        "poll_count":     polls,
        "duration_ms":    int((time.time() - started) * 1000),
        "pulled_at":      datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Session summary (Galileo-derived, UNC-1221)
# ---------------------------------------------------------------------------

def _pull_session_summaries(pat: str, window_days: int) -> list[dict]:
    """Ask Galileo for 1 structured summary row per UTC calendar day.

    Each row has `source='galileo_summary'` and a synthetic
    `session_id='summary_YYYY-MM-DD'` so the bigquery_logrocket_loader
    dedup on session_id keeps exactly one row per day.
    """
    rows: list[dict] = []
    today = datetime.now(timezone.utc).date()
    for delta in range(window_days):
        target_date = today - timedelta(days=delta)
        date_str = target_date.isoformat()
        query = _SESSION_SUMMARY_PROMPT_TMPL.format(date=date_str)
        print(f"[logrocket.session_summary] querying Galileo for {date_str} ...")
        try:
            result = _ask_galileo(pat, query, f"session_summary.{date_str}", "2026-05-v1")
            row = _build_session_summary_row(date_str, result["answer"], result.get("chat_id", ""))
            rows.append(row)
            sc = row.get("session_count")
            print(f"[logrocket.session_summary] {date_str}: session_count={sc} status={result['status']}")
        except Exception as exc:
            print(f"[logrocket.session_summary] {date_str}: FAILED — {exc}")
            rows.append(_build_session_summary_row(date_str, f"ERROR: {exc}", ""))
    return rows


# ---------------------------------------------------------------------------
# Public extract()
# ---------------------------------------------------------------------------

def extract(window_days: int = SESSIONS_WINDOW_DAYS, skip_galileo: bool = False,
            session_summary: bool = True) -> dict[str, Path]:
    """Pull LogRocket sessions + Galileo answers to parquet.

    When session_summary=True, skips the REST API entirely and asks Galileo
    for 1 structured summary row per UTC day (UNC-1221 workaround).

    Returns dict of table_name -> parquet path.
    """
    load_dotenv_if_present()
    cfg = _cfg()
    pat = cfg.get("pat", cfg.get("api_token", ""))
    out: dict[str, Path] = {}

    # --- Sessions (REST or Galileo-derived summary) ---
    session_rows: list[dict] = []
    if session_summary:
        if not pat:
            print("[logrocket.session_summary] SKIP: no PAT in config")
        else:
            print(f"[logrocket.session_summary] building Galileo-derived summary for last {window_days} day(s) ...")
            session_rows = _pull_session_summaries(pat, window_days)
            print(f"[logrocket.session_summary] {len(session_rows)} summary row(s) built")
    else:
        print(f"[logrocket.sessions] pulling last {window_days} days via REST ...")
        session_rows = _pull_sessions(cfg, window_days, MAX_SESSIONS)
        if not session_rows:
            print("[logrocket.sessions] WARNING: 0 sessions returned (REST API 404 — use --session-summary instead)")

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

    sessions_path = raw_path("logrocket_sessions")
    df.write_parquet(sessions_path)
    out["logrocket_sessions"] = sessions_path
    print(f"[logrocket.sessions] {len(session_rows)} rows -> {sessions_path}")

    # --- Galileo ---
    if skip_galileo:
        return out

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
                "links": "[]",
                "poll_count": 0,
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
    parser.add_argument("--no-session-summary", dest="session_summary", action="store_false",
                        help=(
                            "Use REST API instead of Galileo-derived session summary. "
                            "NOTE: REST /sessions returns 404 (UNC-1221). Only use for "
                            "debugging. Default is Galileo-derived summary (--session-summary)."
                        ))
    parser.set_defaults(session_summary=True)
    args = parser.parse_args()
    extract(window_days=args.days, skip_galileo=args.skip_galileo,
            session_summary=args.session_summary)
