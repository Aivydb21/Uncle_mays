"""Refocus Paperclip on vendor onboarding + SAFE round (2026-05-28).

ACTIVE (4 agents, intervalSec=21600 = 4x/day, resumed):
  - CEO                            204674de-...
  - Head of Business Development   4957e295-...
  - CIO                            38bcd8e4-...
  - Investor Relations             906e449e-...

DORMANT (every other agent in the company, intervalSec=604800 = 7 days,
  resumed so on-demand wake still works via @mention or task assignment).

Plan ref: ~/.claude/plans/looks-good-lets-switch-linked-crane.md
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "http://127.0.0.1:3100/api"
COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef"
AGENT_ROOT = Path.home() / ".paperclip" / "instances" / "default" / "companies" / COMPANY_ID / "agents"

AUTH_FILE = Path.home() / ".paperclip" / "auth.json"
TOKEN = json.loads(AUTH_FILE.read_text())["credentials"]["http://localhost:3100"]["token"]
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

ACTIVE_INTERVAL = 21600    # 4x/day
DORMANT_INTERVAL = 604800  # 7 days safety net; on-demand wake still works

ACTIVE = {
    "204674de-ee80-43d7-9930-bd81b1737d1f": "CEO",
    "4957e295-81ce-4d94-b34f-5255e25a401e": "Head of Business Development",
    "38bcd8e4-2d20-46ec-8bf2-adb256ee5291": "CIO",
    "906e449e-6340-4f79-a946-524f1e471506": "Investor Relations",
}


def _http(method: str, path: str, body: dict | None = None) -> tuple[int, dict]:
    data = json.dumps(body).encode() if body else None
    headers = dict(HEADERS)
    if body:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read().decode()
            return r.status, (json.loads(txt) if txt else {})
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:300]}


def get_agent(agent_id: str) -> dict:
    code, body = _http("GET", f"/agents/{agent_id}")
    return body if code == 200 else {"error": body}


def set_interval(agent_id: str, sec: int) -> tuple[int, dict]:
    return _http("PATCH", f"/agents/{agent_id}", {
        "runtimeConfig": {"heartbeat": {"intervalSec": sec}},
    })


def resume(agent_id: str) -> tuple[int, dict]:
    return _http("POST", f"/agents/{agent_id}/resume", {})


def main() -> None:
    all_ids = sorted(p.name for p in AGENT_ROOT.iterdir() if p.is_dir())
    print(f"Found {len(all_ids)} agents under {AGENT_ROOT}\n")

    summary: list[tuple[str, str, int, str]] = []

    for aid in all_ids:
        name = ACTIVE.get(aid)
        is_active = name is not None
        target = ACTIVE_INTERVAL if is_active else DORMANT_INTERVAL
        label = name or "(dormant)"

        # Pull current to show before/after
        before = get_agent(aid)
        before_interval = (
            before.get("runtimeConfig", {}).get("heartbeat", {}).get("intervalSec")
            if isinstance(before, dict) else None
        )
        was_paused = bool(before.get("pausedAt"))

        code, body = set_interval(aid, target)
        ok = code == 200
        # Resume regardless (idempotent if not paused; required for both active and dormant
        # so dormant agents can still wake on @mention).
        rcode, rbody = resume(aid)

        status = "OK" if ok else f"FAIL {code}: {body.get('error', body)[:120]}"
        flag = "ACTIVE " if is_active else "dormant"
        print(f"  {flag} {aid[:8]} {label:32} {before_interval} -> {target}  {status}  (was_paused={was_paused})")
        summary.append((aid, label, target, status))
        time.sleep(0.05)

    print()
    actives = [s for s in summary if s[2] == ACTIVE_INTERVAL]
    dormants = [s for s in summary if s[2] == DORMANT_INTERVAL]
    print(f"Active ({len(actives)}): " + ", ".join(s[1] for s in actives))
    print(f"Dormant ({len(dormants)}): {len(dormants)} agents at {DORMANT_INTERVAL}s on-demand only")


if __name__ == "__main__":
    main()
