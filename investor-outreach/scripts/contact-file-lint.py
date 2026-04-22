#!/usr/bin/env python3
"""
contact-file-lint.py — validate investor contact markdown files against the
schema documented in investor-outreach/contacts/README.md.

Usage:
    python investor-outreach/scripts/contact-file-lint.py
    python investor-outreach/scripts/contact-file-lint.py path/to/file.md

Exit code 0 = all files pass. Non-zero = at least one violation.
"""

from __future__ import annotations

import glob
import os
import re
import sys
from dataclasses import dataclass
from typing import Iterable

REQUIRED_FRONTMATTER = {
    "email", "name", "firm", "segment", "check_range", "geography",
    "first_touch", "last_touch", "status", "owner",
}
ALLOWED_SEGMENTS = {"S1", "S2", "S3", "S4", "S5", "S6"}
ALLOWED_STATUSES = {
    "active", "dormant", "in-dd", "committed", "passed", "do-not-contact",
}
REQUIRED_SECTIONS = [
    "## Thread Summary",
    "## Last Signal",
    "## Pending Ask",
    "## Objections Raised",
    "## Thesis Fit Notes",
    "## Touch Log",
    "## Next Action",
]
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

CONTACTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "contacts",
)
SKIP_FILES = {"_template.md", "README.md", "investor-crm.md", "apollo-investor-contacts.md"}


@dataclass
class Finding:
    path: str
    level: str  # "error" or "warn"
    message: str


def parse_frontmatter(text: str) -> dict | None:
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---", 4)
    if end == -1:
        return None
    block = text[4:end]
    out: dict[str, str] = {}
    for line in block.splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        out[key.strip()] = value.strip().strip('"').strip("'")
    return out


def lint_file(path: str) -> list[Finding]:
    findings: list[Finding] = []
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    fm = parse_frontmatter(text)
    if fm is None:
        findings.append(Finding(path, "error", "missing or malformed frontmatter block"))
        return findings

    missing = REQUIRED_FRONTMATTER - fm.keys()
    for key in sorted(missing):
        findings.append(Finding(path, "error", f"frontmatter missing required field: {key}"))

    email = fm.get("email", "")
    if email and not EMAIL_RE.match(email):
        findings.append(Finding(path, "error", f"invalid email format: {email}"))

    segment = fm.get("segment", "")
    if segment and segment not in ALLOWED_SEGMENTS:
        findings.append(Finding(path, "error", f"segment must be one of {sorted(ALLOWED_SEGMENTS)}, got {segment}"))

    status = fm.get("status", "")
    if status and status not in ALLOWED_STATUSES:
        findings.append(Finding(path, "error", f"status must be one of {sorted(ALLOWED_STATUSES)}, got {status}"))

    for key in ("first_touch", "last_touch"):
        v = fm.get(key, "")
        if v and not DATE_RE.match(v):
            findings.append(Finding(path, "error", f"{key} must be YYYY-MM-DD, got {v}"))

    if segment == "S4":
        warm_path_present = "warm_path" in fm and fm["warm_path"].strip() and fm["warm_path"].strip().lower() != "null"
        if not warm_path_present and fm.get("status", "") in {"active", "dormant"}:
            findings.append(Finding(path, "error", "S4 requires warm_path in frontmatter before activation"))

    for section in REQUIRED_SECTIONS:
        if section not in text:
            findings.append(Finding(path, "error", f"missing required section: {section}"))

    if "—" in text:
        findings.append(Finding(path, "warn", "em-dash found in file (brand rule: no em-dashes)"))

    return findings


def discover(paths: Iterable[str]) -> list[str]:
    if paths:
        return list(paths)
    pattern = os.path.join(CONTACTS_DIR, "*.md")
    return [p for p in sorted(glob.glob(pattern)) if os.path.basename(p) not in SKIP_FILES]


def main(argv: list[str]) -> int:
    files = discover(argv[1:])
    if not files:
        print("no contact files found to lint")
        return 0

    all_findings: list[Finding] = []
    for f in files:
        all_findings.extend(lint_file(f))

    errors = [x for x in all_findings if x.level == "error"]
    warnings = [x for x in all_findings if x.level == "warn"]

    for x in all_findings:
        print(f"[{x.level}] {x.path}: {x.message}")

    print(f"\nchecked {len(files)} file(s): {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
