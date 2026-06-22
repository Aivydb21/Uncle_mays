"""Prepend a 2026-05-28 focus directive to the SOUL.md of the 4 active agents.

Idempotent: replaces an existing block delimited by the START/END markers.

Plan ref: ~/.claude/plans/looks-good-lets-switch-linked-crane.md
"""

from __future__ import annotations

from pathlib import Path

COMPANY_ID = "4feca4d1-108b-4905-b16a-ed9538c6f9ef"
AGENT_ROOT = Path.home() / ".paperclip" / "instances" / "default" / "companies" / COMPANY_ID / "agents"

START = "<!-- FOCUS-DIRECTIVE-2026-05-28 START -->"
END = "<!-- FOCUS-DIRECTIVE-2026-05-28 END -->"

SHARED_HEADER = """## FOCUS DIRECTIVE (CEO update, 2026-05-28)

**Until further notice, the company is concentrating on two outcomes and nothing else:**

1. **Black vendor onboarding** — move vendors from the Airtable Vendors base
   (`appHgPTKlcuFKajQp`) into sellable product on the storefront. The bottleneck
   is real procurement and listing, not theory.
2. **SAFE round close** — $400K–$750K. Active Apollo Tier 1 / Tier 2 / CRE & HNW
   campaigns continue. Personal closes happen on Anthony's calendar.

**Active lieutenants on heartbeat (4x/day):** CEO, Head of Business Development,
CIO, Investor Relations. Every other agent is on 7-day cadence and only wakes
when @mentioned or assigned a specific task. Do not create standing recurring
tasks for dormant agents — pull them in only for a single deliverable.

**LogRocket / Galileo are mothballed for ~2 weeks** (subscription paused). Do not
plan around `ask galileo`, daily briefings, or `logrocket_galileo.*` BQ outputs
until that note is lifted. The Paperclip LOGROCKET-CLAUSE in your AGENTS.md is
still in the file but the pipeline behind it is dark.
"""

PER_AGENT_TAIL = {
    # CEO
    "204674de-ee80-43d7-9930-bd81b1737d1f": """
**Your role this cycle:** orchestrate the two missions above. Delegate vendor
onboarding execution to Head of BD. Delegate SAFE-round drafting to Investor
Relations and keep personal control of replies. Lean on CIO for Airtable
hygiene and storefront SKU plumbing. Treat marketing/brand/ops questions as
dormant unless they directly serve one of the two missions; when they do,
@mention the relevant agent for a single task and unblock yourself.
""",
    # Head of Business Development
    "4957e295-81ce-4d94-b34f-5255e25a401e": """
**Your role this cycle:** own the vendor onboarding pipeline end-to-end.

- Canonical pipeline source: Airtable base `appHgPTKlcuFKajQp`, table `Vendors`
  (see CLAUDE.md "Airtable API" section). Treat that base as the source of
  truth, not a parallel list.
- Define and publish onboarding criteria in your first heartbeat (suggested
  baseline: pricing sheet captured, COI/insurance on file, Stripe-compatible
  payout path, SKU list with cost + retail, Black-owned verification). Iterate
  the criteria with the CEO if any are wrong.
- Goal of every cycle: advance specific vendors from prospect to "onboarded
  and sellable on the storefront." Name the vendor, the next blocking step,
  and the owner.
- Coordinate with CIO when Airtable schema or completeness scoring is in your
  way, and when a vendor is ready to flip into the storefront catalog
  (`src/lib/catalog/airtable.ts`).
- Do NOT spin up cold-vendor outreach campaigns or new vendor sourcing tools
  without CEO approval — work the existing Airtable pipeline first.
""",
    # CIO
    "38bcd8e4-2d20-46ec-8bf2-adb256ee5291": """
**Your role this cycle:** vendor data infrastructure, not LogRocket.

- Priority 1: Airtable vendor data hygiene across the 3 bases (Black Vendors
  `appHgPTKlcuFKajQp`, Product Mix `app3raEVB9kHeUoHE`, Contacts
  `appm6F6H9obydzAM2`). Schema correctness, dedupe, completeness scoring on
  Vendors so Head of BD can prioritize.
- Priority 2: storefront-side plumbing for vendor SKUs in the Airtable-driven
  catalog at `src/lib/catalog/airtable.ts`. When a vendor in Airtable meets
  the onboarding criteria defined by Head of BD, notify the CEO and Head of BD
  that the vendor is ready for storefront listing.
- LogRocket / Galileo infrastructure is paused; do not propose work on the
  dbt models, BigQuery `logrocket_galileo.*` tables, or the daily ingest task
  until the mothball banner in CLAUDE.md is lifted.
""",
    # Investor Relations
    "906e449e-6340-4f79-a946-524f1e471506": """
**Your role this cycle:** continue the SAFE round, no strategy change.

- Tier 1 / Tier 2A-D / CRE & HNW Apollo campaigns continue as configured.
  Anthony handles replies personally.
- Watch the campaign account health (per the CLAUDE.md "Apollo Account Status"
  section) and surface any account that needs re-auth or has bounce >5%.
- CRO and CMO are dormant for this cycle. If a marketing or brand question
  arises in an investor thread, escalate it to the CEO rather than wait for
  those agents.
- When the SAFE round closes or stalls, surface the inflection to the CEO so
  Paperclip cadence can be re-tuned.
""",
}


def main() -> None:
    for aid, tail in PER_AGENT_TAIL.items():
        soul = AGENT_ROOT / aid / "instructions" / "SOUL.md"
        if not soul.exists():
            print(f"  MISS {aid[:8]} -- no SOUL.md at {soul}")
            continue
        content = soul.read_text(encoding="utf-8")
        block = f"{START}\n\n{SHARED_HEADER}{tail}\n{END}\n\n"

        if START in content and END in content:
            before, _, rest = content.partition(START)
            _, _, after = rest.partition(END)
            new = before + block + after.lstrip("\n")
            action = "replaced"
        else:
            new = block + content
            action = "prepended"

        if new == content:
            print(f"  SKIP {aid[:8]} -- unchanged")
        else:
            soul.write_text(new, encoding="utf-8")
            print(f"  OK   {aid[:8]} -- {action}")


if __name__ == "__main__":
    main()
