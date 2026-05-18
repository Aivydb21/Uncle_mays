"""
Refresh the LogRocket + Galileo clause AND the Marketing/Advertising Standing
Order across every active Paperclip AGENTS.md file (effective 2026-05-15).

Changes from the 2026-04-29 / 2026-05-14 versions:
  - LogRocket daily briefing now lands with the CTO, not the CRO.
  - CTO ships LogRocket-driven fixes (funnel + non-funnel) immediately, no
    CEO approval. Soft-notifies CRO when a fix touches marketing/ad surfaces.
  - CRO may change marketing/advertising at will. Board approval required
    only for net-new spend commitments.
  - Any agent may invoke `galileo-on-demand` directly for revenue-impact data.

The script is idempotent: it strips the previous 2026-05-14 LogRocket clause
(if present) and the previous 2026-04-29 Standing Order block (if present),
then appends the new 2026-05-15 blocks. Running it twice is a no-op after
the first run (the new marker is detected and the file is skipped).

Run with:  python scripts/refresh_logrocket_clause.py
"""

from __future__ import annotations

import re
from pathlib import Path
from textwrap import dedent

AGENTS_ROOT = Path(
    r"C:/Users/Anthony/.paperclip/instances/default/companies/"
    r"4feca4d1-108b-4905-b16a-ed9538c6f9ef/agents"
)

OLD_LR_MARKER_START = "<!-- LOGROCKET-CLAUSE-2026-05-14 START -->"
OLD_LR_MARKER_END = "<!-- LOGROCKET-CLAUSE-2026-05-14 END -->"

NEW_LR_MARKER_START = "<!-- LOGROCKET-CLAUSE-2026-05-15 START -->"
NEW_LR_MARKER_END = "<!-- LOGROCKET-CLAUSE-2026-05-15 END -->"

OLD_SO_MARKER_START = "<!-- STANDING-ORDER-2026-04-29 START -->"
OLD_SO_MARKER_END = "<!-- STANDING-ORDER-2026-04-29 END -->"

NEW_SO_MARKER_START = "<!-- STANDING-ORDER-2026-05-15 START -->"
NEW_SO_MARKER_END = "<!-- STANDING-ORDER-2026-05-15 END -->"

OLD_SO_HEADER = "## Standing Order — Marketing & Advertising Infrastructure (effective 2026-04-29)"

AGENTS: list[tuple[str, str, str]] = [
    ("204674de-ee80-43d7-9930-bd81b1737d1f", "CEO",                          "exec_consumer"),
    ("bfcf59d8-ca78-4306-872f-4e5a53f5c650", "CFO",                          "exec_consumer"),
    ("ed268a60-d566-4750-8ad0-8dfe79b27212", "COO",                          "exec_consumer"),
    ("0df6fe9a-9676-41e7-89e9-724d05272a51", "CRO",                          "cro_primary"),
    ("37601c50-6bdb-4ea2-9069-18b1655b13f6", "Growth & Conversion Operator", "cro_primary"),
    ("3f827c01-38a9-435b-826c-64192188a8cb", "CTO",                          "cto_primary"),
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


STANDING_ORDER_BLOCK = dedent(f"""\
    {NEW_SO_MARKER_START}

    ## Standing Order — Marketing & Advertising Infrastructure (effective 2026-05-15, supersedes 2026-04-29)

    **The CRO may change marketing and advertising infrastructure at will. Board approval (CEO: Anthony Ivy, agent id `204674de-ee80-43d7-9930-bd81b1737d1f`) is required only when the change is a net-new spend commitment.**

    **Requires board approval (net-new spend only):**
    - Raising an ad budget on Meta or Google Ads
    - Signing up for a new paid tool, SaaS subscription, or data product used for marketing
    - Committing to an agency, freelancer, or creative retainer
    - Any one-shot or recurring dollar outflow that didn't exist before

    Loop in CFO + Bookkeeper on the same board approval thread.

    **CRO-at-will (no approval, audit trail only):**
    - Campaign pause / launch / scheduling within an existing budget
    - Creative swaps, audience changes, ad copy edits, A/B test toggles
    - Mailchimp newsletter audience changes, campaign drafts, scheduled sends
    - Promo code creation / rotation within the existing Stripe coupon registry
    - Attribution wiring fixes (UTM parameters, Meta Pixel + CAPI, Google Ads conversion tracking, GA4 events) provided no new vendor is added
    - Marketing landing pages — both code and copy
    - Organic social posts on owned accounts (FB Page 755316477673748, Uncle May's IG, LinkedIn company)

    **Out of scope (always touch freely):**
    - Transactional emails (order confirmation, payment failed, shipping)
    - Core product pages (`/`, `/shop`, `/faq`, `/about`)
    - Investor / BD outreach via Apollo
    - Internal-only analytics dashboards

    **Audit trail:**
    1. For CRO-at-will changes, open a Paperclip issue describing the change, expected impact, and rollback path. No approval gate — but the trail is required.
    2. For net-new spend, open the Paperclip issue, then file a board approval via `POST /api/companies/{{companyId}}/approvals` with `type: "request_board_approval"`, link the issue, and wait for resolution before committing the spend.

    {NEW_SO_MARKER_END}
""")


ROLE_BLOCKS: dict[str, str] = {
    "cro_primary": dedent("""\
        **You own marketing and advertising infrastructure end-to-end and may change it at will.**
        - Copy, creative, audiences, pause / launch within existing budget, promo codes within the existing Stripe coupon registry, attribution wiring fixes (no new vendor), landing-page edits, newsletter sends, organic social — all CRO-at-will. Open a Paperclip issue for the audit trail. No board approval needed.
        - **Board approval is required only for net-new spend commitments:** raising an ad budget, signing up for a new paid tool / subscription / data product, committing to an agency or creative retainer. Loop in CFO + Bookkeeper on the same approval thread.
        - You no longer triage the Galileo daily briefing. The CTO does. When the CTO ships a LogRocket-driven fix that touches marketing/ad surfaces, they leave a one-line Paperclip comment for you. Flag a conflict if it lands on top of an active campaign; otherwise let it ride.
        - You may invoke `galileo-on-demand` directly whenever you want revenue-impact data on a flagged issue. No need to route through the Decision Scientist.
    """),

    "cto_primary": dedent("""\
        **You are the primary owner of LogRocket and the daily Galileo briefing.**
        - The daily briefing lands in your Paperclip inbox first. Triage every flagged issue, then ship.
        - **LogRocket-driven fixes auto-ship — funnel and non-funnel both.** Open and self-merge a PR with the Galileo session URL in the description. No CEO or board approval required.
        - When a fix touches marketing/ad surfaces (`/`, `/shop`, `/checkout/*`, `/order-success`, `/subscribe/*`, ad-landing variants, or analytics/pixel wiring), post a one-line Paperclip comment to the CRO so they can flag conflict with an active campaign. Ship in the same turn; the CRO can revert if it lands wrong. Do not wait for an ack.
        - You also own SDK version, source-map upload, PII config (Stripe `PaymentElement`, address, email, phone masking), alert thresholds, and the health of MCP / REST / webhook integrations. The `galileo-incident-alert` task in `src/trigger/` is yours.
        - You may invoke `galileo-on-demand` directly whenever you want revenue-impact data. No need to route through the Decision Scientist.
    """),

    "ds_warehouse_owner": dedent("""\
        **You are the warehouse owner for Galileo's intelligence.**
        - You run the LogRocket → BigQuery pipeline: `ml/ingest/logrocket_galileo.py`, `ml/ingest/logrocket.py`, `ml/ingest/bigquery_logrocket_loader.py`, and the dbt staging + marts at `ml/dbt/uncle_mays/models/staging/stg_galileo_*.sql` and `models/marts/core/mart_galileo_insights_with_revenue.sql`.
        - **Your headline deliverable is dollarizing Galileo's words, not re-interpreting them.** If Galileo names a friction pattern, your job is to join it to `mart_orders` and return affected user count, revenue exposure, and conversion delta. You do not propose what the insight *means* — Galileo already said that.
        - Other agents now invoke `galileo-on-demand` directly for ad-hoc revenue-impact queries; your role is the durable warehouse layer (recurring marts, weekly report appendix), not on-demand dollarization.
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
        - Before drafting a new variant, ask Galileo: "What do users from [paid Meta/Google] do in the first 30 seconds on the landing page? What confuses them? What works?"
        - Pull representative session URLs into the brief as evidence. Don't write "users probably want…" — quote what Galileo observed.
        - Creative deliverables flow to the CRO. The CRO owns marketing changes at will (no board approval for swaps within existing budget). You may invoke `galileo-on-demand` directly for revenue-impact context on a creative direction.
    """),

    "revops_executor": dedent("""\
        **You are the data-and-execution arm of CRO; Galileo is one of your standing inputs.**
        - When CRO asks for "what's hurting conversion this week," your first action is a Galileo MCP query. Quote Galileo's answer before adding your own framing.
        - You verify Galileo's session counts and revenue claims against `stripe_raw` + `mart_orders` before they reach CEO-facing reports. If Galileo says "12% of sessions" and BigQuery says 4%, you surface the mismatch.
        - You consume `rpt_cro_weekly` (Galileo narrative + Decision Scientist revenue appendix) and translate it into the next week's experiment queue.
        - You may invoke `galileo-on-demand` directly for revenue-impact data.
    """),

    "exec_consumer": dedent("""\
        **You read Galileo's conclusions as evidence; you do not run your own session-replay analysis.**
        - For any question about user behavior, prefer Galileo's MCP answer over heuristic or anecdotal claims.
        - When citing user behavior in board updates, investor memos, operational reviews, or budget reasoning, attach the Galileo query ID or session URL — same standard as every other external claim.
        - You do not need to read replays directly. The CTO (primary), CRO, and Decision Scientist are paid to do that. Lean on them and on Galileo.
    """),

    "read_only": dedent("""\
        **You are a read-only consumer of Galileo's intelligence.**
        - Cite session URLs or Galileo query IDs when referencing user behavior in your work (e.g. IR including "we watched X users struggle, fix shipped" anecdotes; PR using friction-pattern evidence to time announcements; Counsel reviewing privacy controls).
        - You do not own a LogRocket workflow. Pull what you need via `galileo-on-demand`; do not stand up parallel reporting.
    """),
}


SHARED_HEADER = dedent(f"""\
    {NEW_LR_MARKER_START}

    ## LogRocket + Galileo AI — Standing Operating Procedure (updated 2026-05-15, supersedes 2026-05-14)

    LogRocket is the central observability and product-intelligence layer for unclemays.com. Its Galileo AI watches every session, classifies frustration, summarizes flows, and explains *why* users do what they do. Galileo is the source of truth on user behavior. You do not re-derive its conclusions; you route, dollarize, and act on them.

    Tool access: LogRocket MCP server is registered as `logrocket` (auth via `~/.claude/logrocket-config.json`). The standard "ask Galileo" tool is the `galileo-on-demand` Trigger.dev task — **any agent may invoke it directly** for revenue-impact data; no need to route through the Decision Scientist. For ambient feed, the Galileo daily briefing and weekly narrative ship to the **CTO** as Paperclip tasks (changed 2026-05-15; previously routed to CRO).

""")

ROLE_HEADER = "### Your role with LogRocket / Galileo\n\n"

SHARED_RULES = dedent(f"""\

    ### Rules every agent follows (no exceptions)

    1. **Galileo-first.** When the question is "what is happening with users / why are they doing X / what should we change," your first action is a Galileo MCP query. Form opinions *after* hearing Galileo, not before. Cite the query and session URLs.
    2. **Do not re-derive what Galileo already classified.** If Galileo named a frustration pattern, use that label. Do not invent parallel taxonomies.
    3. **BigQuery is the journal, not the lens.** Use BigQuery (`logrocket_galileo.*` and `logrocket_raw.*`) to join Galileo's conclusions with revenue, retention, ad spend. Do not use BigQuery to re-interpret raw LogRocket events when Galileo has an answer.
    4. **Self-serve revenue impact.** Any agent may invoke `galileo-on-demand` directly to pull revenue-impact data on a flagged issue. Cite the query ID in your work product.
    5. **Citation.** Any external claim sourced from LogRocket cites the session URL, Galileo query ID, or insight ID — same standard as the existing "all external claims require citation" rule.
    6. **Disagreement protocol.** If your read of replay evidence conflicts with Galileo's conclusion, file a Paperclip task with both views and let the human resolve it. Do not silently overrule Galileo. Do not silently defer. Surface the disagreement.

    ### Auto-ship lane for LogRocket-driven fixes (effective 2026-05-15)

    The Marketing & Advertising Standing Order (above) does not gate LogRocket-driven fixes. CTO is the primary ship owner:

    - **All LogRocket-driven fixes auto-ship** — funnel and non-funnel both. Open and self-merge a PR with the Galileo session URL in the description. No CEO or board approval required.
    - **When the fix touches marketing/ad surfaces** (`/`, `/shop`, `/checkout/*`, `/order-success`, `/subscribe/*`, `/api/checkout`, `/api/webhook`, files in `src/components/checkout/`, `src/page-content/Index.tsx`, ad-landing variants, or analytics/pixel wiring), the CTO posts a one-line Paperclip comment to the CRO so they can flag conflict with an active campaign. Ship in the same turn; the CRO can revert if it lands wrong. Do not wait for an ack.

    {NEW_LR_MARKER_END}
""")


def build_block(role_label: str, role_key: str) -> str:
    role_block = ROLE_HEADER + ROLE_BLOCKS[role_key]
    return SHARED_HEADER + role_block + SHARED_RULES


def strip_old_logrocket_clause(text: str) -> str:
    """Strip 2026-05-14 LogRocket clause if present."""
    pattern = re.compile(
        re.escape(OLD_LR_MARKER_START) + r".*?" + re.escape(OLD_LR_MARKER_END),
        re.DOTALL,
    )
    new_text, count = pattern.subn("", text)
    if count:
        # Also strip trailing blank lines left over
        new_text = re.sub(r"\n{3,}\Z", "\n\n", new_text)
    return new_text


def strip_old_standing_order(text: str) -> str:
    """Strip the 2026-04-29 Standing Order block.

    The original was appended as plain markdown without explicit markers,
    starting with the OLD_SO_HEADER and running until either the OLD LogRocket
    marker (now stripped) or end-of-file. We detect the header and remove
    from the preceding `---` separator (if any) through the four numbered
    compliance steps.
    """
    if OLD_SO_HEADER not in text:
        return text

    # Find the header
    header_idx = text.find(OLD_SO_HEADER)

    # Walk back: include the immediately-preceding `\n---\n` separator if any
    block_start = header_idx
    preceding = text[:header_idx].rstrip()
    if preceding.endswith("---"):
        block_start = preceding.rfind("---")
        # Strip back any whitespace before the ---
        while block_start > 0 and text[block_start - 1] in "\n ":
            block_start -= 1

    # End of block: the 2026-04-29 version ended at numbered item 4 ("Do not ship autonomous code changes to fix it.")
    # We anchor on that closing sentence.
    end_anchor = "Do not ship autonomous code changes to fix it."
    end_idx = text.find(end_anchor, header_idx)
    if end_idx == -1:
        # Fallback: don't strip if we can't find a clean end
        return text
    block_end = end_idx + len(end_anchor)
    # Consume trailing newline(s)
    while block_end < len(text) and text[block_end] == "\n":
        block_end += 1

    return text[:block_start] + "\n" + text[block_end:]


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
        if NEW_LR_MARKER_START in text and NEW_SO_MARKER_START in text:
            print(f"SKIP     {agent_id}  ({role_label}) — already at 2026-05-15")
            skipped += 1
            continue

        text = strip_old_logrocket_clause(text)
        text = strip_old_standing_order(text)

        if not text.endswith("\n"):
            text += "\n"
        if not text.endswith("\n\n"):
            text += "\n"

        text += "---\n\n"
        text += STANDING_ORDER_BLOCK
        text += "\n"
        text += build_block(role_label, role_key)

        path.write_text(text, encoding="utf-8")
        print(f"REFRESH  {agent_id}  ({role_label}) — role_key={role_key}")
        appended += 1

    print(f"\nDone. appended={appended} skipped={skipped} missing={missing}")


if __name__ == "__main__":
    main()
