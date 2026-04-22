#!/usr/bin/env python3
"""
build-contact-file.py — construct or refresh an investor contact markdown
file from a Gmail thread + optional seed metadata.

Wraps the thread parsing logic from analyze-gmail-followups.py. Intended to
be invoked by the IR agent (or the dormant-thread-revival Trigger.dev task)
whenever a contact file is missing or stale.

Usage:
    python investor-outreach/scripts/build-contact-file.py --email <email> [--segment S3] [--firm "Example Capital"]
    python investor-outreach/scripts/build-contact-file.py --from-thread-id <gmail-thread-id> --email <email>
    python investor-outreach/scripts/build-contact-file.py --bulk-from-crm  # backfill from investor-crm.md

Outputs: investor-outreach/contacts/{email-slug}.md (created or updated)
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import sys
from dataclasses import dataclass, field
from typing import Iterable

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTACTS_DIR = os.path.join(ROOT, "contacts")
SCRIPTS_DIR = os.path.join(ROOT, "scripts")

SEGMENT_DEFAULTS = {
    "S1": ("$50K-$250K", "Cold sequence + warm-intro mining"),
    "S2": ("$25K-$100K", "Brand-voice sequence"),
    "S3": ("$25K-$500K", "Warm, thesis-led"),
    "S4": ("$25K-$250K", "Warm intros only"),
    "S5": ("$25K-$100K", "Syndicate-gated"),
    "S6": ("$10K-$250K", "Application"),
}


def slugify_email(email: str) -> str:
    return email.lower().replace("@", "-").replace(".", "-")


@dataclass
class ThreadExtract:
    subject: str = ""
    first_touch: str = ""
    last_touch: str = ""
    last_inbound_quote: str = ""
    last_inbound_date: str = ""
    last_outbound_quote: str = ""
    last_outbound_date: str = ""
    pending_ask: str = ""
    objections: list[str] = field(default_factory=list)
    touch_log: list[dict] = field(default_factory=list)
    summary_seed: str = ""


def load_thread_extract(email: str, thread_id: str | None) -> ThreadExtract | None:
    """Pull thread data using analyze-gmail-followups helpers. Returns None if Gmail isn't reachable."""
    try:
        sys.path.insert(0, SCRIPTS_DIR)
        import analyze_gmail_followups as agf  # type: ignore
    except Exception:
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "analyze_gmail_followups",
                os.path.join(SCRIPTS_DIR, "analyze-gmail-followups.py"),
            )
            if spec is None or spec.loader is None:
                return None
            agf = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(agf)  # type: ignore
        except Exception as exc:
            print(f"could not import analyze-gmail-followups helpers: {exc}", file=sys.stderr)
            return None

    extractor = getattr(agf, "extract_thread_for_contact", None)
    if extractor is None:
        print("analyze-gmail-followups.py does not expose extract_thread_for_contact(); "
              "returning empty extract so a stub file can be built", file=sys.stderr)
        return ThreadExtract()

    try:
        data = extractor(email=email, thread_id=thread_id)
    except Exception as exc:
        print(f"thread extraction failed for {email}: {exc}", file=sys.stderr)
        return ThreadExtract()

    te = ThreadExtract()
    te.subject = data.get("subject", "")
    te.first_touch = data.get("first_touch", "")
    te.last_touch = data.get("last_touch", "")
    te.last_inbound_quote = data.get("last_inbound_quote", "")[:300]
    te.last_inbound_date = data.get("last_inbound_date", "")
    te.last_outbound_quote = data.get("last_outbound_quote", "")[:300]
    te.last_outbound_date = data.get("last_outbound_date", "")
    te.pending_ask = data.get("pending_ask", "")
    te.objections = data.get("objections", [])
    te.touch_log = data.get("touch_log", [])
    te.summary_seed = data.get("summary_seed", "")
    return te


def render_contact_file(
    *,
    email: str,
    name: str,
    firm: str,
    segment: str,
    check_range: str,
    geography: str,
    status: str,
    first_touch: str,
    last_touch: str,
    owner: str,
    linkedin_url: str,
    phone: str,
    extract: ThreadExtract,
) -> str:
    last_signal_block = ""
    if extract.last_inbound_quote:
        last_signal_block = (
            f'"{extract.last_inbound_quote}" '
            f"— inbound {extract.last_inbound_date}"
        )
    elif extract.last_outbound_quote:
        last_signal_block = (
            f'"{extract.last_outbound_quote}" '
            f"— outbound {extract.last_outbound_date}"
        )
    else:
        last_signal_block = "No prior thread signal extracted."

    objections_lines = "\n".join(
        f"- {o}" for o in extract.objections
    ) or "- none recorded"

    touch_log_rows = "\n".join(
        f"| {row.get('date','?')} | {row.get('channel','email')} | {row.get('direction','?')} | "
        f"{row.get('summary','').strip()} | {row.get('next_step','').strip()} |"
        for row in extract.touch_log
    ) or "| — | — | — | — | — |"

    summary = extract.summary_seed or "Summary not yet written. Update on next touch."
    pending = extract.pending_ask or "null"

    return f"""---
email: {email}
name: {name}
firm: {firm}
segment: {segment}
check_range: "{check_range}"
geography: {geography}
first_touch: {first_touch}
last_touch: {last_touch}
status: {status}
owner: {owner}
linkedin_url: {linkedin_url}
phone: {phone}
---

## Thread Summary
{summary}

## Last Signal
{last_signal_block}

## Pending Ask
{pending}

## Objections Raised
{objections_lines}

## Thesis Fit Notes
To be populated (Firecrawl fund-page pull or prior-conversation notes).

## Touch Log
| Date | Channel | Direction | Summary | Next step |
| ---- | ------- | --------- | ------- | --------- |
{touch_log_rows}

## Next Action
To be set.
"""


def write_contact(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def bulk_from_crm() -> int:
    crm_path = os.path.join(CONTACTS_DIR, "investor-crm.md")
    if not os.path.exists(crm_path):
        print("investor-crm.md not found; nothing to backfill", file=sys.stderr)
        return 1
    with open(crm_path, "r", encoding="utf-8") as f:
        crm = f.read()
    emails = set(re.findall(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}", crm))
    if not emails:
        print("no emails discovered in investor-crm.md", file=sys.stderr)
        return 1
    today = dt.date.today().isoformat()
    built = 0
    for email in sorted(emails):
        path = os.path.join(CONTACTS_DIR, slugify_email(email) + ".md")
        if os.path.exists(path):
            continue
        extract = load_thread_extract(email, None) or ThreadExtract()
        content = render_contact_file(
            email=email,
            name=email.split("@")[0].replace(".", " ").title(),
            firm="Unknown",
            segment="S1",
            check_range=SEGMENT_DEFAULTS["S1"][0],
            geography="National",
            status="dormant",
            first_touch=extract.first_touch or today,
            last_touch=extract.last_touch or today,
            owner="anthony@unclemays.com",
            linkedin_url="",
            phone="",
            extract=extract,
        )
        write_contact(path, content)
        built += 1
    print(f"built {built} new contact file(s); {len(emails) - built} already existed")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--email")
    ap.add_argument("--name", default="")
    ap.add_argument("--firm", default="Unknown")
    ap.add_argument("--segment", default="S1", choices=list(SEGMENT_DEFAULTS.keys()))
    ap.add_argument("--check-range", default="")
    ap.add_argument("--geography", default="National")
    ap.add_argument("--status", default="dormant")
    ap.add_argument("--first-touch", default="")
    ap.add_argument("--last-touch", default="")
    ap.add_argument("--owner", default="anthony@unclemays.com")
    ap.add_argument("--linkedin-url", default="")
    ap.add_argument("--phone", default="")
    ap.add_argument("--from-thread-id", default=None)
    ap.add_argument("--bulk-from-crm", action="store_true")
    args = ap.parse_args()

    if args.bulk_from_crm:
        return bulk_from_crm()

    if not args.email:
        ap.error("--email is required unless --bulk-from-crm is set")

    today = dt.date.today().isoformat()
    extract = load_thread_extract(args.email, args.from_thread_id) or ThreadExtract()
    check_range = args.check_range or SEGMENT_DEFAULTS[args.segment][0]
    name = args.name or args.email.split("@")[0].replace(".", " ").title()

    content = render_contact_file(
        email=args.email,
        name=name,
        firm=args.firm,
        segment=args.segment,
        check_range=check_range,
        geography=args.geography,
        status=args.status,
        first_touch=args.first_touch or extract.first_touch or today,
        last_touch=args.last_touch or extract.last_touch or today,
        owner=args.owner,
        linkedin_url=args.linkedin_url,
        phone=args.phone,
        extract=extract,
    )
    path = os.path.join(CONTACTS_DIR, slugify_email(args.email) + ".md")
    write_contact(path, content)
    print(path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
