"""Reorganize Paperclip agent cadence + push current-state context.

Per CEO directive 2026-05-03:
  - Pause low-priority agents (BD, CHRO, GC, CFO, IR, PR Director).
  - Stretch CRO/CTO direct reports + low-priority leadership to 7-day cadence.
  - CIO wakes every 3 days (workflow is outdated; minimal touch).
  - Keep CEO, CRO, CTO at 24-hour cadence.
  - Append CURRENT STATE preamble to every agent's AGENTS.md so the next
    wake reads the post-catalog-launch reality first.
  - Sync the same preamble into the legacy COMPANY-CONTEXT.md path via
    sync-paperclip-context.py separately (run that after this script).
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

# id -> action. action is one of: "pause", "stretch_7d", "stretch_3d", "keep_24h"
PLAN: dict[str, tuple[str, str]] = {
    # Paused (no help needed right now)
    "4957e295-81ce-4d94-b34f-5255e25a401e": ("pause", "Business Development"),
    "327cac5c-888d-49da-b8a0-a3289ed8ae19": ("pause", "CHRO"),
    "db1f7f99-f939-453f-a37e-71b297adb8ac": ("pause", "General Counsel"),
    "bfcf59d8-ca78-4306-872f-4e5a53f5c650": ("pause", "CFO"),
    "906e449e-6340-4f79-a946-524f1e471506": ("pause", "Investor Relations"),
    "9472ded7-f83a-490f-92c5-634200166881": ("pause", "PR Director"),
    # Stretch to 7 days (CRO/CTO direct reports + low-priority leadership)
    "b8496569-99a4-47cb-8978-c4652c7d14f5": ("stretch_7d", "RevOps"),
    "bcc5eafe-97b9-4b89-8ed3-d33287a19f7b": ("stretch_7d", "Advertising Creative"),
    "37601c50-6bdb-4ea2-9069-18b1655b13f6": ("stretch_7d", "Growth & Conversion"),
    "ed268a60-d566-4750-8ad0-8dfe79b27212": ("stretch_7d", "COO"),
    # CIO wakes every 3 days
    "38bcd8e4-2d20-46ec-8bf2-adb256ee5291": ("stretch_3d", "CIO"),
    # Keep at 24h cadence
    "204674de-ee80-43d7-9930-bd81b1737d1f": ("keep_24h", "CEO"),
    "0df6fe9a-9676-41e7-89e9-724d05272a51": ("keep_24h", "CRO"),
    "3f827c01-38a9-435b-826c-64192188a8cb": ("keep_24h", "CTO"),
}

INTERVALS = {
    "pause": 604800,       # 7 days as a safety net even though they're paused
    "stretch_7d": 604800,  # 7 days
    "stretch_3d": 259200,  # 3 days
    "keep_24h": 86400,     # 24 hours
}

PREAMBLE_HEADER = "## CURRENT STATE (CEO update, 2026-05-03)"
PREAMBLE_TEXT = """
**You have likely been out of the loop.** Anthony has been working with Claude Code
directly on the website for several weeks. The catalog launched, pricing was
right-sized, and a marketing-recalibration push is being prepped. Read the
following before you do anything else, because most of what you previously
believed about the funnel is now stale.

### Catalog launch (replaces the fixed-box era)
- Spring Box / Full Harvest Box / Community Box are **retired**. Build-your-own
  catalog at `/shop` is the only purchase path.
- 45 active SKUs in Airtable (`appm6F6H9obydzAM2` table `Catalog`), per-SKU
  portions right-sized for the typical household purchase
  (asparagus 1/4 lb $2.50, tuscan kale by the bunch $5, sweet potato per-each
  $2.50, lamb chops 0.5 lb $10, whole chicken estimated at $32, etc.). See
  `customer-facts.md` and `notes/catalog-right-sizing-2026-05-03.md`.
- $25 cart minimum. FRESH10 is the only customer-claimed promo; it no longer
  auto-applies from `?promo=` URL params (customer must type it).
- AI portion-photos for every SKU at `public/catalog/{sku}.jpg`, swapped in for
  real product shots when the farm shoot happens.

### What the website / data plumbing looks like now
- Wednesday delivery, Sunday 11:59 PM CT cutoff. Service area unchanged.
- Stripe PaymentIntent metadata now carries `utm_*`, `gclid`, `fbclid`, `fbc`,
  `fbp`, and `ga_client_id` — fixed 2026-05-03 (the data was being captured
  client-side but the checkout never forwarded it; ML notebook found 99%
  UTM-null and 1/305 GA4-joined rows). See `notes/utm-convention-2026-05-03.md`.
- Meta CAPI fires server-side from the Stripe webhook for Purchase events
  (5 wired surfaces total). See `notes/capi-verification-2026-05-03.md`.
- "Save my cart" email capture lives in the cart drawer; sends a Resend
  transactional with a deep link that restores the cart on click.
- Abandoned-cart Trigger.dev sequences rewritten for the catalog model
  (no more "boxes left this week", no in-email phone number).
- Doina is the only grandfathered subscription customer; no new
  subscriptions are being sold.

### Standing order (still in force)
**No agent may pause, launch, or modify Meta/Google Ads, Mailchimp campaigns,
promo codes, or attribution wiring without explicit board approval.** This
applies to YOU. Open a Paperclip board-approval issue first.

### Why your cadence dropped
Anthony is shifting focus to building a data team for the next phase. Most
agents have been over-active relative to the work that was actually moving.
Many "daily report" routines you have been running are based on the old
fixed-box model and are no longer load-bearing. **Retire them.** Specifically:
- Daily Mailchimp newsletter checks (audience is functionally empty until
  re-imported).
- Daily Apollo outreach status (Apollo campaigns are not the priority).
- Daily Google Ads / Meta Ads spend pulls (campaigns are paused pending
  recalibration).
- "Spring Box AOV" / "Full Harvest conversion" / box-mix reports.
- Anything tied to per-box weekly fulfillment counts.

If you are unsure whether one of your routines is still useful, post a single
status note asking the CEO and exit the heartbeat early. **Do not regenerate
stale work.**

### Active threads worth tracking
- Catalog cache key is at v6 (`catalog-internal-v7-no-spruce`). Active SKU
  count is 45.
- The marketing recalibration draft for board approval is at
  `bd/paperclip-drafts/2026-05-03-marketing-recalibration-after-catalog-launch.md`.
- The next big initiative is **building a data team**. If your role has any
  bearing on data engineering / analytics / pipeline / instrumentation,
  expect new tasking soon. Otherwise, stay quiet until you receive an
  explicit assignment.

---
"""

INSTRUCTIONS_HEADER_MARKER = "<!-- CURRENT-STATE-2026-05-03 START -->"
INSTRUCTIONS_FOOTER_MARKER = "<!-- CURRENT-STATE-2026-05-03 END -->"


def _http(method: str, path: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if body else {}
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": f"{e.code}: {e.read().decode()[:500]}"}


def patch_interval(agent_id: str, intervalSec: int) -> dict:
    return _http("PATCH", f"/agents/{agent_id}", {
        "runtimeConfig": {"heartbeat": {"intervalSec": intervalSec}},
    })


def pause(agent_id: str) -> dict:
    return _http("POST", f"/agents/{agent_id}/pause", {})


def unpause(agent_id: str) -> dict:
    # Endpoint is /resume, not /unpause (verified 2026-05-03).
    return _http("POST", f"/agents/{agent_id}/resume", {})


def append_preamble(agent_id: str) -> tuple[bool, str]:
    """Insert CURRENT STATE preamble at the top of AGENTS.md if not present."""
    p = AGENT_ROOT / agent_id / "instructions" / "AGENTS.md"
    if not p.exists():
        return False, f"no AGENTS.md at {p}"
    content = p.read_text(encoding="utf-8")
    block = (
        f"{INSTRUCTIONS_HEADER_MARKER}\n\n"
        f"{PREAMBLE_HEADER}\n{PREAMBLE_TEXT}\n"
        f"{INSTRUCTIONS_FOOTER_MARKER}\n\n"
    )
    if INSTRUCTIONS_HEADER_MARKER in content:
        # Replace existing block (idempotent)
        before, _, rest = content.partition(INSTRUCTIONS_HEADER_MARKER)
        _, _, after = rest.partition(INSTRUCTIONS_FOOTER_MARKER)
        new_content = before + block + after.lstrip("\n")
        action = "replaced"
    else:
        new_content = block + content
        action = "prepended"
    if new_content == content:
        return True, "unchanged"
    p.write_text(new_content, encoding="utf-8")
    return True, action


def main() -> None:
    print("=== Paperclip reorg 2026-05-03 ===\n")
    for agent_id, (action, name) in PLAN.items():
        interval = INTERVALS[action]
        print(f"-> {name:25} ({agent_id[:8]})  action={action:11} interval={interval}s")
        # 1. Set interval
        r = patch_interval(agent_id, interval)
        if "error" in r:
            print(f"     PATCH interval FAIL: {r['error']}")
            continue
        # 2. Apply pause/unpause as needed
        if action == "pause":
            pr = pause(agent_id)
            if "error" in pr:
                print(f"     PAUSE FAIL: {pr['error']}")
            else:
                print(f"     paused (status={pr.get('status')})")
        else:
            # Make sure not paused (CEO/CFO/CIO/CRO/CTO/Growth/IR were all paused)
            pr = unpause(agent_id)
            if "error" in pr:
                # 4xx if already not paused — fine
                pass
            else:
                print(f"     active (status={pr.get('status')})")
        # 3. Inject preamble
        ok, why = append_preamble(agent_id)
        print(f"     preamble: {why}")
        time.sleep(0.1)

    print("\nDone. Run sync-paperclip-context.py next to push CLAUDE.md to legacy COMPANY-CONTEXT.md files.")


if __name__ == "__main__":
    main()
