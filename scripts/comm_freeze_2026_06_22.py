"""Apply (or lift) a TEMPORARY company-wide communication freeze across all
Paperclip agents.

CEO directive 2026-06-22: no outbound external communication leaves the
organization (emails, campaigns, newsletter/broadcast, paid-ad launches,
organic social, any net-new outreach) without Anthony Ivy's explicit prior
approval. Automated customer-triggered transactional email keeps flowing.

Mechanism: a marked, reversible block prepended to the top of each agent's
SOUL.md and AGENTS.md, so it is the first instruction every agent reads on its
next heartbeat. Highest-priority, overrides conflicting "at-will" latitude for
the duration of the freeze.

Usage:
    python scripts/comm_freeze_2026_06_22.py          # apply / refresh (idempotent)
    python scripts/comm_freeze_2026_06_22.py --lift    # remove the block everywhere

Idempotent: re-running replaces an existing block delimited by the markers.
"""

from __future__ import annotations

import sys
from pathlib import Path

COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef"
AGENT_ROOT = (
    Path.home() / ".paperclip" / "instances" / "default" / "companies" / COMPANY_ID / "agents"
)

# Both high-salience instruction files get the block, wherever each exists.
TARGET_FILES = ("SOUL.md", "AGENTS.md")

START = "<!-- COMM-FREEZE-2026-06-22 START -->"
END = "<!-- COMM-FREEZE-2026-06-22 END -->"

BLOCK_BODY = """## 🛑 COMMUNICATION FREEZE — CEO directive, effective 2026-06-22 (TEMPORARY)

**Effective immediately and until the CEO (Anthony Ivy) lifts this notice, NO
outbound external communication leaves the organization without Anthony's
explicit prior approval.** For the duration of this freeze, this overrides every
standing "CRO-at-will", "auto-ship", or other send latitude elsewhere in your
instructions. When in doubt, treat it as frozen and ask. Silence is not approval.

**FROZEN — requires Anthony's approval before it goes out:**
- Any email to anyone outside the company: investor / BD / partner / vendor /
  press / customer outreach, cold or warm, first-touch or follow-up, via Apollo,
  Gmail, Resend, or any other path.
- Launching, activating, resuming, un-pausing, scheduling, or adding contacts to
  ANY Apollo campaign or sequence.
- Mailchimp newsletter or any broadcast / bulk send.
- Launching, activating, un-pausing, or raising spend on any Meta or Google Ads
  campaign; any audience push or new ad set that spends.
- Organic social posts on any owned account: Instagram (@unclemaysproduce),
  Facebook Page (755316477673748), LinkedIn company.
- SMS, push, or any other outbound messaging channel.
- Any net-new public-facing publication on behalf of Uncle May's.

**NOT frozen — continue normally:**
- Automated transactional customer emails triggered by the customer's own action:
  order confirmation, payment-failed, shipping, subscription lifecycle, and the
  already-built abandoned-checkout recovery flows (Resend / Trigger.dev). The
  freeze blocks *initiating new* outreach and *launching/activating* campaigns;
  it does not tear out live order-driven automation. If you think one of these
  automated flows should also pause, raise it to Anthony — do not disable it.
- All internal work: research, analysis, drafting, Paperclip-internal comments
  and task assignment, code, dbt, BigQuery.
- **Drafting is encouraged.** Queue finished emails, posts, campaigns, and
  sequences for Anthony's review so they ship the instant the freeze lifts.
  Prepare, don't send.

**To send something during the freeze:** post a Paperclip task to the CEO with
the exact content, recipient, and channel, and wait for explicit approval. No
approval, no send.

**This is temporary and will be lifted by the CEO.** Until then it is the
highest-priority instruction in this file.
"""


def block() -> str:
    return f"{START}\n\n{BLOCK_BODY}\n{END}\n\n"


def apply_to(path: Path) -> str:
    content = path.read_text(encoding="utf-8")
    new_block = block()
    if START in content and END in content:
        before, _, rest = content.partition(START)
        _, _, after = rest.partition(END)
        new = before + new_block + after.lstrip("\n")
        action = "refreshed"
    else:
        new = new_block + content
        action = "prepended"
    if new == content:
        return "unchanged"
    path.write_text(new, encoding="utf-8")
    return action


def lift_from(path: Path) -> str:
    content = path.read_text(encoding="utf-8")
    if START not in content or END not in content:
        return "absent"
    before, _, rest = content.partition(START)
    _, _, after = rest.partition(END)
    new = before + after.lstrip("\n")
    if new == content:
        return "absent"
    path.write_text(new, encoding="utf-8")
    return "lifted"


def main() -> None:
    lift = "--lift" in sys.argv[1:]
    if not AGENT_ROOT.exists():
        sys.exit(f"Agent root not found: {AGENT_ROOT}")

    touched = 0
    for agent_dir in sorted(p for p in AGENT_ROOT.iterdir() if p.is_dir()):
        for fname in TARGET_FILES:
            path = agent_dir / "instructions" / fname
            if not path.exists():
                continue
            result = (lift_from if lift else apply_to)(path)
            tag = "LIFT" if lift else "FREEZE"
            print(f"  {tag:6} {agent_dir.name[:8]} {fname:9} -> {result}")
            if result in ("prepended", "refreshed", "lifted"):
                touched += 1

    verb = "lifted from" if lift else "applied to"
    print(f"\nDone. Freeze block {verb} {touched} file(s).")


if __name__ == "__main__":
    main()
