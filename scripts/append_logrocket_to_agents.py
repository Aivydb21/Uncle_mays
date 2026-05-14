"""
Append the LogRocket + Galileo clause to each active Paperclip AGENTS.md.

Per the approved plan (C:/Users/Anthony/.claude/plans/i-am-ready-to-dreamy-squirrel.md),
Phase 3 adds:
  - Galileo-first behavior rules (5)
  - Standing Order amendment for LogRocket-driven fixes
  - A per-role ownership block

The script is idempotent: if the LOGROCKET-CLAUSE-2026-05-14 marker is already
present, the file is skipped.

Run with:  python scripts/append_logrocket_to_agents.py
"""

from __future__ import annotations

from pathlib import Path
from textwrap import dedent

AGENTS_ROOT = Path(
    r"C:/Users/Anthony/.paperclip/instances/default/companies/"
    r"4feca4d1-108b-4905-b16a-ed9538c6f9ef/agents"
)

MARKER = "<!-- LOGROCKET-CLAUSE-2026-05-14 START -->"
MARKER_END = "<!-- LOGROCKET-CLAUSE-2026-05-14 END -->"

# Per the plan's ownership map. Each entry is (agent_id, role_label, role_block_key).
# role_block_key picks which per-role snippet is appended.
AGENTS: list[tuple[str, str, str]] = [
    ("204674de-ee80-43d7-9930-bd81b1737d1f", "CEO",                          "exec_consumer"),
    ("bfcf59d8-ca78-4306-872f-4e5a53f5c650", "CFO",                          "exec_consumer"),
    ("ed268a60-d566-4750-8ad0-8dfe79b27212", "COO",                          "exec_consumer"),
    ("0df6fe9a-9676-41e7-89e9-724d05272a51", "CRO",                          "cro_primary"),
    ("37601c50-6bdb-4ea2-9069-18b1655b13f6", "Growth & Conversion Operator", "cro_primary"),
    ("3f827c01-38a9-435b-826c-64192188a8cb", "CTO",                          "cto_technical"),
    ("38bcd8e4-2d20-46ec-8bf2-adb256ee5291", "CIO",                          "read_only"),
    ("327cac5c-888d-49da-b8a0-a3289ed8ae19", "CHRO",                         "read_only"),
    ("906e449e-6340-4f79-a946-524f1e471506", "Investor Relations",           "read_only"),
    ("4957e295-81ce-4d94-b34f-5255e25a401e", "Head of Business Development", "read_only"),
    ("9472ded7-f83a-490f-92c5-634200166881", "PR Director",                  "read_only"),
    ("db1f7f99-f939-453f-a37e-71b297adb8ac", "General Counsel",              "read_only"),
    ("bcc5eafe-97b9-4b89-8ed3-d33287a19f7b", "Advertising Creative",         "ad_creative_consumer"),
    ("b8496569-99a4-47cb-8978-c4652c7d14f5", "RevOps Manager",               "revops_executor"),
    ("2361e7bd-607b-4e4d-b699-944c020ca8a8", "Bookkeeper",                   "read_only"),
    ("0465e8d0-f9d8-42f3-ac83-9249a4a0fd6e", "Decision Scientist",           "ds_warehouse_owner"),
    ("b078d1d4-31c6-493e-a9d8-4ca31544ce6d", "Data Engineer",                "data_team"),
    ("f6c148fb-615e-4fcc-b440-18bc49d9029e", "Analytics Engineer",           "data_team"),
    ("c57979b2-0133-47d4-8f96-8cd6756415de", "ML Engineer",                  "data_team"),
]


ROLE_BLOCKS: dict[str, str] = {
    "cro_primary": dedent("""\
        **You are the primary owner of LogRocket-driven CRO work.**
        - Galileo's daily briefing lands in your inbox first. You decide which insights graduate to CEO-approval tasks for funnel changes.
        - You own funnel-stage drop-off triage, rage-click and dead-click recommendations, exit-intent patterns, and copy/UX prescriptions.
        - You do not run the queries yourself: invoke `galileo-on-demand` and quote the answer. The Decision Scientist quantifies revenue impact; you decide ship/no-ship.
        - You file `[LogRocket Funnel Fix]` Paperclip tasks for the CEO whenever Galileo's recommendation touches `/`, `/shop`, `/checkout/*`, `/order-success`, `/subscribe/*`, ad-landing variants, or analytics wiring. You never bypass the Standing Order, even when Galileo says it's urgent.
    """),

    "cto_technical": dedent("""\
        **You are the technical owner of LogRocket.**
        - You own SDK version, source-map upload, PII config (Stripe `PaymentElement`, address, email, phone masking), alert thresholds, and the health of MCP / REST / webhook integrations.
        - When Galileo flags a JS error, network failure, or performance regression, you triage. Non-funnel fixes auto-ship via PR with a Galileo session URL in the description. Funnel-touching fixes route through the Standing Order.
        - You consult Galileo before forming an engineering opinion on user-visible behavior. Galileo has watched every session; you have not.
        - You own the `galileo-incident-alert` task in `src/trigger/` and any future server-side LogRocket SDK integration.
    """),

    "ds_warehouse_owner": dedent("""\
        **You are the warehouse owner for Galileo's intelligence.**
        - You run the LogRocket → BigQuery pipeline: `ml/ingest/logrocket_galileo.py`, `ml/ingest/logrocket.py`, `ml/ingest/bigquery_logrocket_loader.py`, and the dbt staging + marts at `ml/dbt/uncle_mays/models/staging/stg_galileo_*.sql` and `models/marts/core/mart_galileo_insights_with_revenue.sql`.
        - **Your headline deliverable is dollarizing Galileo's words, not re-interpreting them.** If Galileo names a friction pattern, your job is to join it to `mart_orders` and return affected user count, revenue exposure, and conversion delta. You do not propose what the insight *means* — Galileo already said that.
        - New commands for you:
          - `"quantify galileo today"` — rank today's briefing insights by dollar impact.
          - `"galileo over time"` — recurrence counts for unresolved themes.
          - `"revenue at risk from open incidents"` — sum across open Galileo-diagnosed incidents.
        - The weekly CRO report (`rpt_cro_weekly`) carries Galileo's narrative as the body; you append only the revenue appendix.
    """),

    "data_team": dedent("""\
        **You support the Galileo → BigQuery pipeline that the Decision Scientist owns.**
        - Data Engineer: ingestion reliability (`ml/ingest/logrocket*.py`, parquet → BQ loader, schema evolution).
        - Analytics Engineer: dbt staging + marts under `models/staging/stg_galileo_*.sql` and `models/marts/core/mart_galileo_insights_with_revenue.sql`; freshness tests; the `is_internal_test()` filter.
        - ML Engineer: any future model that ingests Galileo session embeddings or scores users by predicted friction; for now, none — wait until volume exists.
        - You do not interpret what Galileo says. You make sure Galileo's words land in BigQuery cleanly and joinably, every day.
    """),

    "ad_creative_consumer": dedent("""\
        **You consume Galileo's read of ad-landing sessions to inform creative briefs.**
        - Before drafting a new variant, ask Galileo: "What do users from \\[paid Meta/Google\\] do in the first 30 seconds on the landing page? What confuses them? What works?"
        - Pull representative session URLs into the brief as evidence. Don't write "users probably want…" — quote what Galileo observed.
        - You still produce drafts only; CRO + CEO approve infrastructure changes per the Standing Order. Galileo's recommendation does not bypass approval.
    """),

    "revops_executor": dedent("""\
        **You are the data-and-execution arm of CRO; Galileo is one of your standing inputs.**
        - When CRO asks for "what's hurting conversion this week," your first action is a Galileo MCP query. Quote Galileo's answer before adding your own framing.
        - You verify Galileo's session counts and revenue claims against `stripe_raw` + `mart_orders` before they reach CEO-facing reports. If Galileo says "12% of sessions" and BigQuery says 4%, you surface the mismatch.
        - You consume `rpt_cro_weekly` (Galileo narrative + Decision Scientist revenue appendix) and translate it into the next week's experiment queue.
    """),

    "exec_consumer": dedent("""\
        **You read Galileo's conclusions as evidence; you do not run your own session-replay analysis.**
        - For any question about user behavior, prefer Galileo's MCP answer over heuristic or anecdotal claims.
        - When citing user behavior in board updates, investor memos, operational reviews, or budget reasoning, attach the Galileo query ID or session URL — same standard as every other external claim.
        - You do not need to read replays directly. The CRO + CTO + Decision Scientist are paid to do that. Lean on them and on Galileo.
    """),

    "read_only": dedent("""\
        **You are a read-only consumer of Galileo's intelligence.**
        - Cite session URLs or Galileo query IDs when referencing user behavior in your work (e.g. IR including "we watched X users struggle, fix shipped" anecdotes; PR using friction-pattern evidence to time announcements; Counsel reviewing privacy controls).
        - You do not own a LogRocket workflow. Pull what you need via `galileo-on-demand`; do not stand up parallel reporting.
    """),
}


SHARED_HEADER = dedent("""\
    {marker}

    ## LogRocket + Galileo AI — Standing Operating Procedure (added 2026-05-14)

    LogRocket is the central observability and product-intelligence layer for unclemays.com. Its Galileo AI watches every session, classifies frustration, summarizes flows, and explains *why* users do what they do. Galileo is the source of truth on user behavior. You do not re-derive its conclusions; you route, dollarize, and act on them.

    Tool access: LogRocket MCP server is registered as `logrocket` (auth via `~/.claude/logrocket-config.json`). The standard "ask Galileo" tool is the `galileo-on-demand` Trigger.dev task; for ambient feed, the Galileo daily briefing and weekly narrative ship to CRO as Paperclip tasks.

""")

ROLE_HEADER = "### Your role with LogRocket / Galileo\n\n"

SHARED_RULES = dedent("""\

    ### Rules every agent follows (no exceptions)

    1. **Galileo-first.** When the question is "what is happening with users / why are they doing X / what should we change," your first action is a Galileo MCP query. Form opinions *after* hearing Galileo, not before. Cite the query and session URLs.
    2. **Do not re-derive what Galileo already classified.** If Galileo named a frustration pattern, use that label. Do not invent parallel taxonomies.
    3. **BigQuery is the journal, not the lens.** Use BigQuery (`logrocket_galileo.*` and `logrocket_raw.*`) to join Galileo's conclusions with revenue, retention, ad spend. Do not use BigQuery to re-interpret raw LogRocket events when Galileo has an answer.
    4. **Citation.** Any external claim sourced from LogRocket cites the session URL, Galileo query ID, or insight ID — same standard as the existing "all external claims require citation" rule.
    5. **Disagreement protocol.** If your read of replay evidence conflicts with Galileo's conclusion, file a Paperclip task with both views and let the human resolve it. Do not silently overrule Galileo. Do not silently defer. Surface the disagreement.

    ### Standing Order amendment — LogRocket-driven fixes

    The existing Standing Order on marketing & advertising infrastructure (CLAUDE.md, effective 2026-04-29) is not relaxed by this section. It is extended with one explicit auto-ship lane:

    - **Non-funnel** issues Galileo flags (anything *not* on `/`, `/shop`, `/checkout/*`, `/order-success`, `/subscribe/*`, `/api/checkout`, `/api/webhook`, files in `src/components/checkout/`, `src/page-content/Index.tsx`, ad-landing variants, or analytics/pixel wiring): you may open and self-merge a fix PR with a LogRocket session link in the description.
    - **Funnel** issues (any of the above paths, plus any change a reasonable reader would view as touching ad funnel or conversion measurement): you must file a Paperclip task tagged `[LogRocket Funnel Fix]` with the proposed diff and at least one replay link as evidence, and wait for CEO approval per the existing Standing Order.

    {marker_end}
""")


def build_block(role_label: str, role_key: str) -> str:
    role_block = ROLE_HEADER + ROLE_BLOCKS[role_key]
    return (
        SHARED_HEADER.format(marker=MARKER)
        + role_block
        + SHARED_RULES.format(marker_end=MARKER_END)
    )


def main() -> None:
    appended = 0
    skipped = 0
    missing = 0
    for agent_id, role_label, role_key in AGENTS:
        path = AGENTS_ROOT / agent_id / "instructions" / "AGENTS.md"
        if not path.exists():
            print(f"MISSING  {agent_id}  ({role_label})")
            missing += 1
            continue
        text = path.read_text(encoding="utf-8")
        if MARKER in text:
            print(f"SKIP     {agent_id}  ({role_label}) — already has clause")
            skipped += 1
            continue
        block = build_block(role_label, role_key)
        with path.open("a", encoding="utf-8", newline="") as fh:
            if not text.endswith("\n"):
                fh.write("\n")
            fh.write("\n")
            fh.write(block)
        print(f"APPEND   {agent_id}  ({role_label}) — role_key={role_key}")
        appended += 1
    print(f"\nDone. appended={appended} skipped={skipped} missing={missing}")


if __name__ == "__main__":
    main()
