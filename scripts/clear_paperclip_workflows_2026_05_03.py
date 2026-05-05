"""Cancel all open Paperclip issues so the company starts fresh.

Per CEO directive 2026-05-03: cancel every issue that is not already
done or cancelled, post a reset comment on each, then exit. The
historical record (status=done) is preserved.

Reversible: each cancellation is a single PATCH and can be reverted by
PATCHing the status back. Issue ids are logged to
notes/workflow-reset-2026-05-03.md so you have a paper trail.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "http://127.0.0.1:3100/api"
COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef"
OPEN_STATUSES = ["blocked", "todo", "in_progress", "in_review", "backlog"]

LOG_PATH = Path(__file__).resolve().parents[1] / "notes" / "workflow-reset-2026-05-03.md"

CANCEL_NOTE = (
    "Cancelled as part of company-wide workflow reset (CEO directive "
    "2026-05-03). Catalog launch, attribution chain, and the data team "
    "hire all happened in the past week; the prior workflow was based "
    "on the fixed-box era. Anything still load-bearing should be "
    "re-filed by the responsible agent against the new state of the "
    "company."
)


def _http(method: str, path: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if body else {}
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else {}
    except urllib.error.HTTPError as e:
        return {"error": f"{e.code}: {e.read().decode()[:300]}"}


def list_issues(status: str) -> list[dict]:
    return _http("GET", f"/companies/{COMPANY_ID}/issues?status={status}&limit=2000") or []


def cancel(issue_id: str) -> bool:
    r = _http("PATCH", f"/issues/{issue_id}", {"status": "cancelled"})
    return "error" not in r


def comment(issue_id: str, body: str) -> bool:
    # Try the standard comment endpoint shape; quietly ignore if not supported.
    r = _http("POST", f"/issues/{issue_id}/comments", {"body": body})
    return "error" not in r


def main() -> None:
    started = datetime.now(timezone.utc)
    log_lines: list[str] = [
        f"# Workflow reset — {started.isoformat()}",
        "",
        "Cancelled all open Paperclip issues per CEO directive on 2026-05-03.",
        "Historical (done) and previously-cancelled issues left untouched.",
        "",
        "## Cancelled by status",
        "",
    ]
    total_cancelled = 0
    total_failed = 0
    cancelled_ids: list[tuple[str, str, str]] = []  # (status, id, title)

    for status in OPEN_STATUSES:
        issues = list_issues(status)
        log_lines.append(f"### {status} ({len(issues)})")
        log_lines.append("")
        if not issues:
            log_lines.append("(none)")
            log_lines.append("")
            print(f"{status}: 0 to cancel")
            continue
        ok = 0
        fail = 0
        for issue in issues:
            iid = issue["id"]
            title = (issue.get("title") or "")[:80]
            ident = issue.get("identifier") or iid[:8]
            if cancel(iid):
                comment(iid, CANCEL_NOTE)  # best-effort
                ok += 1
                cancelled_ids.append((status, iid, title))
                log_lines.append(f"- `{ident}` {title}")
            else:
                fail += 1
                log_lines.append(f"- FAIL `{ident}` {title}")
            time.sleep(0.02)  # gentle on the local API
        log_lines.append("")
        print(f"{status}: cancelled {ok}/{len(issues)}  (failures: {fail})")
        total_cancelled += ok
        total_failed += fail

    log_lines.append(f"## Total")
    log_lines.append(f"- cancelled: {total_cancelled}")
    log_lines.append(f"- failed:    {total_failed}")
    log_lines.append("")
    log_lines.append("Reversible: each cancellation is a single `PATCH /api/issues/<id>` ")
    log_lines.append("with `{\"status\": \"<original status>\"}`. Original statuses are ")
    log_lines.append("preserved by section header above.")

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text("\n".join(log_lines), encoding="utf-8")
    print(f"\nLog: {LOG_PATH}")
    print(f"Cancelled {total_cancelled} issues, {total_failed} failed.")


if __name__ == "__main__":
    main()
