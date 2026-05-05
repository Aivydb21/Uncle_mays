"""Test/internal email filter. Mirrors src/lib/email/suppression.ts so the
modeling pipeline excludes the same addresses the site excludes from
transactional sends. Anything matching here is dropped from the labeled
dataset before training.

Anthony's own test traffic (every @unclemays.com mailbox plus his personal
gmail) is the dominant noise in the historical Stripe data — without this
filter the model would learn "this looks like Anthony testing" instead of
"this is a customer who will convert."
"""

from __future__ import annotations

import os

SUPPRESSED_DOMAINS = {"unclemays.com"}

SUPPRESSED_EMAILS = {
    "anthonypivy@gmail.com",
}

# Allow extra addresses via env var (CSV).
_extra = os.environ.get("EMAIL_SUPPRESSION_LIST", "").strip()
if _extra:
    for addr in _extra.split(","):
        a = addr.strip().lower()
        if a:
            SUPPRESSED_EMAILS.add(a)


def is_suppressed(email: str | None) -> bool:
    if not email:
        return True
    norm = email.strip().lower()
    if not norm:
        return True
    if norm in SUPPRESSED_EMAILS:
        return True
    parts = norm.split("@")
    if len(parts) != 2:
        return True  # malformed
    return parts[1] in SUPPRESSED_DOMAINS
