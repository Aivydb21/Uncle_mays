#!/usr/bin/env python3
"""
sync-paperclip-context.py — Sync the canonical CLAUDE.md into the COMPANY-CONTEXT.md
of every "old-style" Paperclip agent that has one (currently CEO, CTO, CFO, COO, IR).

Why this exists:
- The 5 older Paperclip agents (created before the AGENTS.md-only refactor) read a separate
  COMPANY-CONTEXT.md file that drifted from CLAUDE.md over time.
- On 2026-04-11 we manually re-synced them and added a top-of-file agent roster header.
- This script automates that sync for the next time CLAUDE.md is updated, so the agents
  do not silently fall behind again.

Usage:
    python scripts/sync-paperclip-context.py            # sync, prints what changed
    python scripts/sync-paperclip-context.py --dry-run  # show what would change

What it does:
1. Reads ~/Desktop/business/CLAUDE.md (the source of truth).
2. Wraps it with a header containing the current agent roster + the "CMO is vacant"
   reminder so agents do not regenerate stale tasks.
3. Writes the result to each shared agent's COMPANY-CONTEXT.md.
4. For the CTO agent specifically, appends a "Website Technical Stack" section that the
   CTO needs but other agents don't.
5. Backs up the previous COMPANY-CONTEXT.md to `<file>.bak-<YYYYMMDD>` before overwriting.

This script does NOT touch:
- HEARTBEAT.md, PROCESSES.md, TOOLS.md, AGENTS.md (different files, different lifecycles)
- The new-style agents (CRO, CIO, RevOps, Advertising Creative) which don't have a separate
  COMPANY-CONTEXT.md file - their context lives in AGENTS.md.

If you add or remove agents, update AGENTS_SHARED below.
"""

import os
import re
import shutil
import sys
from datetime import datetime

# --- Config ---
COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef"
PAPERCLIP_BASE = os.path.expanduser(
    f"~/.paperclip/instances/default/companies/{COMPANY_ID}/agents"
)
CLAUDE_MD = os.path.expanduser("~/Desktop/business/CLAUDE.md")

# Old-style agents that have a separate COMPANY-CONTEXT.md file
AGENTS_SHARED = [
    ("204674de-ee80-43d7-9930-bd81b1737d1f", "CEO"),
    ("906e449e-6340-4f79-a946-524f1e471506", "Investor Relations"),
    ("bfcf59d8-ca78-4306-872f-4e5a53f5c650", "CFO"),
    ("ed268a60-d566-4750-8ad0-8dfe79b27212", "COO"),
]

# --- Role-specific stripping ---
# Sections marked with HTML comment blocks in CLAUDE.md can be stripped per-role.
# This keeps each agent's COMPANY-CONTEXT.md to only what they need.

TRIGGER_DEV_PATTERN = re.compile(
    r"<!-- TRIGGER\.DEV basic START -->.*?<!-- TRIGGER\.DEV basic END -->",
    re.DOTALL,
)

# Python code block patterns for APIs that only certain agents need.
# These are stripped from agents that don't use them.
FIRECRAWL_PYTHON_PATTERN = re.compile(
    r"### Python Usage \(for scripts\)\n\n```python\nimport json, os, urllib\.request\n\nconfig = json\.load\(open\(os\.path\.expanduser\(\"~/.claude/firecrawl.*?```\n",
    re.DOTALL,
)
META_PYTHON_PATTERN = re.compile(
    r"### Python Usage\n\n```python\nimport json, os, urllib\.request\n\nconfig = json\.load\(open\(os\.path\.expanduser\(\"~/.claude/meta.*?```\n",
    re.DOTALL,
)
GOOGLE_ADS_PYTHON_PATTERN = re.compile(
    r"### Python Usage\n\n```python\nimport json, os, urllib\.request, urllib\.parse\n\nconfig = json\.load\(open\(os\.path\.expanduser\(\"~/.claude/google-ads.*?```\n",
    re.DOTALL,
)
CANVA_PYTHON_PATTERN = re.compile(
    r"### Python Usage\n\n```python\nimport json, os, urllib\.request, base64\n\nconfig = json\.load\(open\(os\.path\.expanduser\(\"~/.claude/canva.*?```\n",
    re.DOTALL,
)

def strip_triggerdev(content):
    return TRIGGER_DEV_PATTERN.sub("", content)

def strip_api_python_blocks(content):
    """Remove Python code blocks for Firecrawl, Meta, Google Ads, Canva."""
    content = FIRECRAWL_PYTHON_PATTERN.sub("", content)
    content = META_PYTHON_PATTERN.sub("", content)
    content = GOOGLE_ADS_PYTHON_PATTERN.sub("", content)
    content = CANVA_PYTHON_PATTERN.sub("", content)
    return content

# Strip functions per agent role (applied AFTER building new_base)
# CEO: full context (needs everything for strategic decisions)
# IR:  full context (owns all outreach + Apollo + LinkedIn)
# CFO: remove Trigger.dev + API Python code blocks (finance, not engineering)
# COO: remove Trigger.dev + API Python code blocks (operations, not engineering/outreach)
AGENT_STRIP_FNS = {
    "CEO": [],                                          # keep all
    "Investor Relations": [],                           # keep all
    "CFO": [strip_triggerdev, strip_api_python_blocks], # no code examples needed
    "COO": [strip_triggerdev, strip_api_python_blocks], # no code examples needed
    # CTO handled separately (gets extra section appended)
}

# CTO gets a custom version with the Website Technical Stack section appended
CTO_ID = "3f827c01-38a9-435b-826c-64192188a8cb"

# --- Header (rewrites are safe; this is regenerated on every sync) ---
def build_header(date_str):
    return f"""# COMPANY-CONTEXT.md — Uncle May's Produce

> **THIS FILE IS KEPT IN SYNC WITH `~/Desktop/business/CLAUDE.md`** (the source of truth).
> Last synced: {date_str}. Do not edit this file directly. Edit `CLAUDE.md` and re-run
> `python ~/Desktop/business/scripts/sync-paperclip-context.py`.
>
> READ THIS FULLY. This is the complete operational context for Uncle May's Produce. Your
> job is to move it forward, not to re-plan setup that is already done.

---

## Current Agent Roster (updated {date_str})

The live Paperclip roster has **9 agents**. Use this to pick the right owner when creating
or handing off work:

| Agent | Role | Reports To | Owns |
|-------|------|------------|------|
| CEO | Chief Executive Officer | (board) | Strategy, prioritization, hiring, cross-functional coordination |
| CTO | Chief Technology Officer | CEO | Website, infrastructure, data platform, POS, APIs |
| CFO | Chief Financial Officer | CEO | Capital raise, SBA, budgets, financial projections |
| COO | Chief Operating Officer | CEO | Store build-out, vendors, staffing, SOPs |
| CIO | Chief Information Officer | CEO | Internal systems, integrations, automation, IT ops |
| CRO | Chief Revenue Officer | CEO | Revenue growth, customer acquisition, conversion, pricing promotions |
| RevOps | Revenue Operations Manager | CRO | Analytics, Stripe/GA4 data pulls, dashboards, A/B test execution |
| Advertising Creative | Creative Lead | CRO | **ALL** creative: ads, social posts, newsletter content, landing page copy, brand voice, variant sets, virality |
| Investor Relations | IR | CFO | Apollo campaigns, LinkedIn outreach, investor CRM, pipeline management |

**Key roster notes (since 2026-04-11):**
- **CMO role is VACANT.** The CMO agent was fired. The Advertising Creative agent was
  hired same day under CRO as the marketing/creative replacement. Do NOT reference "CMO"
  as an agent to coordinate with or @mention. For marketing/content/newsletter/brand work,
  coordinate with **Advertising Creative** (reports to CRO). For pricing architecture and
  product assortment decisions, escalate to the **board** (CEO + founders).
- Tara Weymon is still the human CMO on the founding leadership team (Unilever/P&G
  background) and appears on investor materials. She is a human team member, not an
  agent, and not callable in Paperclip workflows.
- Previous duplicate agents (old IR, old CMOs) have been cleaned up. On-disk dirs for
  terminated agents were removed.
- All 9 agents have `adapterConfig.cwd` set to `C:\\Users\\Anthony\\Desktop\\business`
  so relative paths in their instructions resolve correctly. Without this, references
  like `investor-outreach/scripts/daily-report.sh` lead nowhere.

---

"""


CTO_EXTRA = """

### Website Technical Stack (CTO-specific)
- **Repo:** `https://github.com/Aivydb21/Uncle_mays.git` (local: `~/Desktop/um_website`)
- **Framework:** Next.js 15.1.0 (TypeScript, Tailwind CSS, Radix UI)
- **Checkout flow:** "Order Now" buttons redirect to Stripe Payment Links (not embedded checkout)
- **Payment Links:**
  - Starter ($35): `https://buy.stripe.com/14AfZh2IT0sces75l29Zm03`
  - Family ($65): `https://buy.stripe.com/4gM7sL2ITej2gAf3cU9Zm07`
  - Community ($95): `https://buy.stripe.com/5kQ28r0AL6QA83J4gY9Zm06`
- **Meta Pixel:** `2276705169443313` (hardcoded in layout.tsx)
- **GA4:** `G-QWY5HRLX12`
- **API Routes (require SSR):** `/api/checkout`, `/api/webhook`, `/api/capture-email`, `/api/order-details`
"""

CTO_INSERT_MARKER = "- **Note:** Requires SSR deployment (Vercel, not static export) for the API route to be reachable"


def main():
    dry_run = "--dry-run" in sys.argv
    date_str = datetime.now().strftime("%Y-%m-%d")
    backup_suffix = f".bak-{datetime.now().strftime('%Y%m%d')}"

    if not os.path.exists(CLAUDE_MD):
        print(f"ERROR: source CLAUDE.md not found at {CLAUDE_MD}", file=sys.stderr)
        sys.exit(1)

    with open(CLAUDE_MD, "r", encoding="utf-8") as f:
        claude_md = f.read()

    new_base = build_header(date_str) + claude_md

    targets = list(AGENTS_SHARED)
    cto_path = os.path.join(PAPERCLIP_BASE, CTO_ID, "instructions", "COMPANY-CONTEXT.md")

    print(f"sync-paperclip-context.py  |  {'DRY RUN' if dry_run else 'WRITING'}")
    print(f"  source: {CLAUDE_MD}  ({len(claude_md)} bytes)")
    print()

    # Shared agents
    for aid, name in targets:
        path = os.path.join(PAPERCLIP_BASE, aid, "instructions", "COMPANY-CONTEXT.md")
        if not os.path.exists(path):
            print(f"  [skip] {name:25} no COMPANY-CONTEXT.md at {path}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            current = f.read()
        # Apply role-specific strips
        role_content = new_base
        for strip_fn in AGENT_STRIP_FNS.get(name, []):
            role_content = strip_fn(role_content)
        if current == role_content:
            print(f"  [unchanged] {name:25} ({len(current)} bytes)")
            continue
        if dry_run:
            print(f"  [would-write] {name:25} {len(current)} -> {len(role_content)} bytes  (stripped {len(new_base)-len(role_content)} bytes)")
            continue
        shutil.copy(path, path + backup_suffix)
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(role_content)
        print(f"  [written] {name:25} {len(current)} -> {len(role_content)} bytes  (stripped {len(new_base)-len(role_content)} bytes, backup: {backup_suffix})")

    # CTO version with extra section (Trigger.dev stays — CTO needs it)
    if CTO_INSERT_MARKER in new_base:
        cto_content = new_base.replace(CTO_INSERT_MARKER, CTO_INSERT_MARKER + CTO_EXTRA)
    else:
        cto_content = new_base + CTO_EXTRA
    # Strip API Python code blocks irrelevant to CTO (Firecrawl, Meta, Google Ads, Canva)
    cto_content = strip_api_python_blocks(cto_content)
    if os.path.exists(cto_path):
        with open(cto_path, "r", encoding="utf-8") as f:
            cto_current = f.read()
        if cto_current == cto_content:
            print(f"  [unchanged] {'CTO':25} ({len(cto_current)} bytes)")
        elif dry_run:
            print(f"  [would-write] {'CTO':25} {len(cto_current)} -> {len(cto_content)} bytes")
        else:
            shutil.copy(cto_path, cto_path + backup_suffix)
            with open(cto_path, "w", encoding="utf-8", newline="") as f:
                f.write(cto_content)
            print(f"  [written] {'CTO':25} {len(cto_current)} -> {len(cto_content)} bytes (backup: {backup_suffix})")
    else:
        print(f"  [skip] CTO no COMPANY-CONTEXT.md at {cto_path}")

    print()
    print("Done. Agents pick up the new context on their next heartbeat (typically within 6h).")


if __name__ == "__main__":
    main()
