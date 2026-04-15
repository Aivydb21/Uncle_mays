#!/usr/bin/env python3
"""
Strengthen the no-dash rule across all 10 Paperclip agents.

The IR agent has been violating the rule and putting em dashes / en dashes
into investor emails. The existing rule says "no em dashes" but the model
keeps producing them. This script:

1. Replaces the soft rule with an explicit Unicode-character-based rule
2. Adds a mandatory pre-send self-check requirement
3. Applies to all SOUL.md files in the company
"""

import os
import re

AGENTS_BASE = (
    "C:/Users/Anthony/.paperclip/instances/default/"
    "companies/4feca4d1-108b-4905-b16a-ed9538c6f9ef/agents"
)

# The new strict rule. Names the actual characters explicitly.
NEW_RULE = (
    "- **NEVER USE LONG DASHES (em dash, en dash, or any other dash variant). "
    "ZERO TOLERANCE.** The forbidden characters are em dash (\u2014, Unicode U+2014) "
    "and en dash (\u2013, Unicode U+2013). The ONLY acceptable dash character is the "
    "regular hyphen-minus (-, Unicode U+002D). Use commas, periods, colons, "
    "semicolons, parentheses, or hyphens instead. Before sending ANY email, comment, "
    "task description, or external communication, scan your draft for the characters "
    "\u2014 and \u2013 and remove them. If you find even one, you have violated the rule. "
    "This applies to ALL writing: emails, reports, comments, task descriptions, "
    "newsletters, social posts, investor materials, and internal documents. "
    "No exceptions."
)

# Both dash and asterisk bullet variants of the old rule
OLD_RULE_VARIANTS = [
    (
        "- **No em dashes.** Never use long dashes in any writing. "
        "Use commas, periods, or colons instead. This applies to emails, "
        "reports, comments, and all written output."
    ),
    (
        "* **No em dashes.** Never use long dashes in any writing. "
        "Use commas, periods, or colons instead. This applies to emails, "
        "reports, comments, and all written output."
    ),
]

# Build asterisk version of new rule for files using `*` bullets
NEW_RULE_ASTERISK = NEW_RULE.replace("- **", "* **", 1)


def update_file(path):
    """Update a SOUL.md file. Returns True if modified."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    content = content.replace(OLD_RULE_VARIANTS[0], NEW_RULE)
    content = content.replace(OLD_RULE_VARIANTS[1], NEW_RULE_ASTERISK)

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    print("=" * 60)
    print("  STRENGTHENING NO-DASH RULE ACROSS ALL AGENTS")
    print("=" * 60)

    updated = 0
    skipped = 0
    not_found = 0

    for agent_dir in os.listdir(AGENTS_BASE):
        soul_path = os.path.join(AGENTS_BASE, agent_dir, "instructions", "SOUL.md")
        if not os.path.exists(soul_path):
            continue

        if update_file(soul_path):
            print(f"  UPDATED: {agent_dir[:8]}/SOUL.md")
            updated += 1
        else:
            # Check if rule even exists in this file
            with open(soul_path, "r", encoding="utf-8") as f:
                if "No em dashes" in f.read():
                    print(f"  SKIPPED (already updated or different format): {agent_dir[:8]}/SOUL.md")
                    skipped += 1
                else:
                    print(f"  NOT FOUND (no dash rule): {agent_dir[:8]}/SOUL.md")
                    not_found += 1

    print()
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Not found: {not_found}")
    print("=" * 60)


if __name__ == "__main__":
    main()
