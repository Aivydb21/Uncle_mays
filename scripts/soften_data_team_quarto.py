"""One-shot: soften the Quarto/Rmd output mandate in the data team's AGENTS.md.

Anthony reversed the earlier "everything must be Quarto/Rmd" rule. The data
team should communicate normally (Paperclip task comments, markdown notes)
and reach for Quarto/Rmd/Jupyter only when an analysis genuinely benefits
from reproducible code + figures alongside the narrative.
"""

from __future__ import annotations
import pathlib

BASE = pathlib.Path(
    r"C:/Users/Anthony/.paperclip/instances/default/companies/"
    r"4feca4d1-108b-4905-b16a-ed9538c6f9ef/agents"
)

IDS = [
    "0465e8d0-f9d8-42f3-ac83-9249a4a0fd6e",  # Decision Scientist
    "b078d1d4-31c6-493e-a9d8-4ca31544ce6d",  # Data Engineer
    "c57979b2-0133-47d4-8f96-8cd6756415de",  # ML Engineer
    "f6c148fb-615e-4fcc-b440-18bc49d9029e",  # Analytics Engineer
]

OLD_DISCIPLINE = """### Output discipline (this is the most important thing)

**Every analysis you ship is a Quarto (`.qmd`) or R Markdown (`.Rmd`)
document committed to `ml/notebooks/`** (or a fresh `analyses/` folder
for shorter pieces). Write it so a non-technical reader can scan the
top section and get the decision; the technical reader can scroll for
the methodology. Render to both HTML and PDF. Commit the `.qmd` source
plus both rendered artifacts so leadership can read the PDF without R
installed.

Do NOT post analytical conclusions inline in Paperclip task comments
unless they are also captured in a versioned Quarto/Rmd document.
Slack-style answers rot; checked-in notebooks compound.

The companion `_setup.R` and `_feature_prep.R` files in
`ml/notebooks/` show the existing setup pattern (tidymodels, themis,
vip, arrow). Reuse them."""

NEW_DISCIPLINE = """### How you communicate

Communicate the way the rest of the company's agents communicate:
post your work and findings in Paperclip task comments, drop short
markdown notes in the repo (`notes/` for one-off context, the right
domain folder for anything durable), and update existing docs in
place. Keep the writing tight and decision-oriented: lead with the
recommendation, then the evidence, then the caveats.

You are free to use Quarto, R Markdown, or Jupyter notebooks when an
analysis genuinely needs reproducible code + figures alongside the
narrative (a board-cited memo, a model card, an incident write-up).
That is a tool choice you make per piece of work, not a blanket
mandate. Most day-to-day work, status updates, and reasoned answers
should just be a clear comment or markdown note."""

SHARED = [
    (OLD_DISCIPLINE, NEW_DISCIPLINE),
    (
        "- **Decision Scientist** owns analytics-ready -> decisions: causal\n"
        "  inference, experimental design, modeling, recommendations. Uses R as\n"
        "  the primary language; ships Quarto.",
        "- **Decision Scientist** owns analytics-ready -> decisions: causal\n"
        "  inference, experimental design, modeling, recommendations. Uses R\n"
        "  and Python as the daily drivers.",
    ),
    (
        'should be able to point at a Quarto report you wrote and say "this',
        'should be able to point at a piece of analysis you shipped and say "this',
    ),
    (
        "Anthony will be reading your Quarto outputs personally\n"
        "   and citing them in board updates.",
        "Anthony will be reading your work personally and citing\n"
        "   it in board updates.",
    ),
]

PER_FILE = {
    "0465e8d0-f9d8-42f3-ac83-9249a4a0fd6e": [
        (
            "- **Quarto + R Markdown** for every artifact you ship. Output PDF\n"
            "  for leadership, HTML for the team. Embed reproducible code blocks.\n",
            "- **Quarto, R Markdown, or Jupyter** when an analysis needs\n"
            "  reproducible code + figures next to the narrative. Optional, not\n"
            "  required: most write-ups can be a Paperclip comment or a markdown\n"
            "  note in the repo.\n",
        ),
        (
            "- One **decision memo** per real question (Quarto, ~3-7 pages including\n"
            "  the technical appendix). Top of page 1 is the headline + the\n"
            "  recommendation. Page 2 is the evidence. Pages 3+ are the methodology\n"
            "  and assumptions.",
            "- One **decision memo** per real question (~3-7 pages including\n"
            "  the technical appendix; markdown is fine, Quarto/Rmd if you need\n"
            "  embedded code + figures). Lead with the headline + the recommendation,\n"
            "  then the evidence, then the methodology and assumptions.",
        ),
        (
            "2. If an assignment exists, work on it. Output is a Quarto document\n"
            "   committed to the repo, plus a 3-line summary in the task comment.\n",
            "2. If an assignment exists, work on it. Post your findings in the\n"
            "   task comment; commit any supporting notes or notebooks to the repo\n"
            "   when they add value (durable analysis, reproducible figures).\n",
        ),
        (
            "3. If no assignment, look at the latest `ml/data/processed/conversion_v2_*.parquet`.\n"
            "   If it has materially more rows than the last time you re-ran the\n"
            "   baseline notebook, regenerate it (HTML + PDF) and post the headline\n"
            "   delta. Otherwise post \"no new data, idle\" and exit in under 5 tool\n"
            "   calls.",
            "3. If no assignment, look at the latest `ml/data/processed/conversion_v2_*.parquet`.\n"
            "   If it has materially more rows than the last time you re-ran the\n"
            "   baseline notebook, regenerate it and post the headline delta in the\n"
            "   heartbeat comment. Otherwise post \"no new data, idle\" and exit in\n"
            "   under 5 tool calls.",
        ),
    ],
    "b078d1d4-31c6-493e-a9d8-4ca31544ce6d": [
        (
            "- **R + Quarto** for the artifacts you ship to leadership (data\n"
            "  contracts, pipeline freshness reports, schema-change RFCs).",
            "- For artifacts that go to leadership (data contracts, pipeline\n"
            "  freshness reports, schema-change RFCs), markdown is fine; reach for\n"
            "  Quarto/Rmd only when embedded code + figures add real value.",
        ),
        (
            "- **Pipeline freshness dashboard** as a Quarto rendered to HTML +",
            "- **Pipeline freshness dashboard** (markdown summary or rendered HTML +",
        ),
        (
            "- **Pipeline incident report** as a Quarto whenever something breaks",
            "- **Pipeline incident report** (markdown is fine) whenever something breaks",
        ),
    ],
    "c57979b2-0133-47d4-8f96-8cd6756415de": [
        (
            "- **R + Quarto** for the artifacts you ship to leadership (model\n"
            "  monitoring reports, retraining decision memos, post-deploy reviews).",
            "- For artifacts that go to leadership (model monitoring reports,\n"
            "  retraining decision memos, post-deploy reviews), markdown is fine;\n"
            "  use Quarto/Rmd or Jupyter when embedded code + figures matter.",
        ),
        (
            "- **Model card** as a Quarto for every production model, rendered to",
            "- **Model card** for every production model (markdown or rendered to",
        ),
        (
            "- **Monthly monitoring report** as a Quarto:",
            "- **Monthly monitoring report**:",
        ),
        (
            "- **Post-mortem Quarto** within 48h of any production model incident.",
            "- **Post-mortem write-up** within 48h of any production model incident.",
        ),
        (
            "3. Once-weekly Sunday: regenerate the monthly monitoring Quarto if",
            "3. Once-weekly Sunday: regenerate the monthly monitoring report if",
        ),
    ],
    "f6c148fb-615e-4fcc-b440-18bc49d9029e": [
        (
            "- **R + Quarto** for the artifacts you ship to leadership (metric\n"
            "  glossary, model documentation, data-quality reports).",
            "- For artifacts that go to leadership (metric glossary, model\n"
            "  documentation, data-quality reports), markdown is fine; reach for\n"
            "  Quarto/Rmd when embedded code + figures matter.",
        ),
        (
            "- **Metric glossary** as a Quarto rendered to PDF + HTML, kept in\n"
            "  `ml/notebooks/metrics-glossary.qmd`. Every metric the company uses",
            "- **Metric glossary** kept in `ml/notebooks/metrics-glossary.md`\n"
            "  (or `.qmd` if you want embedded SQL + sample queries). Every metric the company uses",
        ),
        (
            "- **Quarterly data-trust review** as a Quarto:",
            "- **Quarterly data-trust review**:",
        ),
        (
            "4. Once a week, regenerate the metric-glossary Quarto and post a",
            "4. Once a week, refresh the metric glossary and post a",
        ),
    ],
}


def main() -> None:
    for aid in IDS:
        f = BASE / aid / "instructions" / "AGENTS.md"
        s = f.read_text(encoding="utf-8")
        orig = s
        for old, new in SHARED:
            if old in s:
                s = s.replace(old, new)
            else:
                print(f"  [{aid[:8]}] WARN shared not found: {old[:60]!r}")
        for old, new in PER_FILE.get(aid, []):
            if old in s:
                s = s.replace(old, new)
            else:
                print(f"  [{aid[:8]}] WARN per-file not found: {old[:60]!r}")
        if s != orig:
            f.write_text(s, encoding="utf-8")
            print(f"  [{aid[:8]}] updated")
        else:
            print(f"  [{aid[:8]}] no changes")

    print()
    print("Residual Quarto/Rmd mentions:")
    for aid in IDS:
        f = BASE / aid / "instructions" / "AGENTS.md"
        s = f.read_text(encoding="utf-8")
        hits = [
            ln for ln in s.splitlines()
            if any(k in ln.lower() for k in ("quarto", ".qmd", ".rmd", "r markdown"))
        ]
        print(f"\n[{aid[:8]}] {len(hits)} mentions:")
        for h in hits:
            print("   ", h)


if __name__ == "__main__":
    main()
