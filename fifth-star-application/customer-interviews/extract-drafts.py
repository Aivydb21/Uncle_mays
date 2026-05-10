#!/usr/bin/env python3
"""Parse the recovery-email markdown files into draft-ready JSON.

Output: list of {file, to, subject, body_md, body_html} ready for Gmail draft API.
"""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "recovery-emails"
OUT = Path(__file__).resolve().parent / "drafts-payload.json"


def md_links_to_html(text: str) -> str:
    """Convert [label](url) markdown links to <a href=url>label</a>."""
    return re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        r'<a href="\2">\1</a>',
        text,
    )


def md_bold_to_html(text: str) -> str:
    return re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)


def md_blockquote_to_html(text: str) -> str:
    """> line  ->  <blockquote>line</blockquote> (single-line each)."""
    out_lines = []
    in_quote = False
    for line in text.split("\n"):
        if line.startswith("> "):
            if not in_quote:
                out_lines.append("<blockquote>")
                in_quote = True
            out_lines.append(line[2:])
        else:
            if in_quote:
                out_lines.append("</blockquote>")
                in_quote = False
            out_lines.append(line)
    if in_quote:
        out_lines.append("</blockquote>")
    return "\n".join(out_lines)


def md_to_html(text: str) -> str:
    text = md_blockquote_to_html(text)
    text = md_bold_to_html(text)
    text = md_links_to_html(text)

    # First pass: merge consecutive numbered-list paragraphs into one block.
    # We re-join with a sentinel so a "1. ...\n\n2. ..." pattern is treated as
    # a single ordered-list block, not two separate ones starting at 1.
    paragraphs = re.split(r"\n\n+", text.strip())
    merged: list[str] = []
    buf: list[str] = []
    def is_ol_para(p: str) -> bool:
        return bool(re.match(r"^\d+\.\s", p.strip()))
    for p in paragraphs:
        if is_ol_para(p):
            buf.append(p)
        else:
            if buf:
                merged.append("\n\n".join(buf))
                buf = []
            merged.append(p)
    if buf:
        merged.append("\n\n".join(buf))

    # Render each block.
    out: list[str] = []
    for chunk in merged:
        chunk = chunk.strip()
        if not chunk:
            continue
        if chunk.startswith("<blockquote>"):
            out.append(chunk)
        elif is_ol_para(chunk):
            items = re.findall(r"^\d+\.\s+(.*?)(?=\n\n\d+\.|\Z)", chunk, re.S | re.M)
            if items:
                lis = "\n".join(f"  <li>{i.strip().replace(chr(10), ' ')}</li>" for i in items)
                out.append(f"<ol>\n{lis}\n</ol>")
            else:
                out.append(f"<p>{chunk.replace(chr(10), '<br>')}</p>")
        else:
            out.append(f"<p>{chunk.replace(chr(10), '<br>')}</p>")
    return "\n\n".join(out)


def md_to_plain(text: str) -> str:
    """Strip markdown formatting for plain-text email body."""
    # [label](url) -> label (url)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    # **bold** -> bold
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    # blockquote markers > -> indent
    text = re.sub(r"^>\s?", "  ", text, flags=re.M)
    return text


def parse_email_file(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")

    # Find To, Subject in the header block
    to_m = re.search(r"^\*\*To:\*\*\s*(.+)$", text, re.M)
    subj_m = re.search(r"^\*\*Subject:\*\*\s*(.+)$", text, re.M)
    if not to_m or not subj_m:
        return None
    to = to_m.group(1).strip()
    subject = subj_m.group(1).strip()

    # Body is between the first --- after the header and the next ---
    # Header is the leading metadata block.
    parts = re.split(r"^---\s*$", text, flags=re.M)
    # parts[0] = title + metadata header
    # parts[1] = body
    # parts[2] = notes (skip)
    if len(parts) < 2:
        return None
    body_md = parts[1].strip()

    # Skip if To: is missing or contains "no email captured"
    if "no email" in to.lower() or "(" in to:
        # Lia's case — no email, manual handling
        return None

    return {
        "file": str(path.name),
        "to": to,
        "subject": subject,
        "body_plain": md_to_plain(body_md),
        "body_html": md_to_html(body_md),
    }


def main():
    drafts = []
    for f in sorted(ROOT.glob("*.md")):
        parsed = parse_email_file(f)
        if parsed:
            drafts.append(parsed)
        else:
            print(f"SKIP (no email or no body): {f.name}")
    OUT.write_text(json.dumps(drafts, indent=2), encoding="utf-8")
    print(f"\nWrote {len(drafts)} drafts to {OUT}")
    for d in drafts:
        print(f"  {d['file']:35s} -> {d['to']:35s} | {d['subject'][:60]}")


if __name__ == "__main__":
    main()
