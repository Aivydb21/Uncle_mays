"""Load the local site checkout-store JSON.

Note: production data is Vercel-ephemeral. This ingest only sees what's
been captured locally (dev sessions + any data backfilled by other tools).
For the comprehensive labeled dataset, Stripe is the primary spine and
this module is supplementary — it adds cart breakdown + recovery-email
flags for sessions that exist in both stores.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import polars as pl

from ._common import (
    DATA_RAW,
    ROOT,
    hash_email,
    load_dotenv_if_present,
    parse_iso,
    raw_path,
)

DEFAULT_PATH = ROOT.parent / "data" / "checkout-sessions.json"


def extract(path: str | Path | None = None) -> Path:
    load_dotenv_if_present()
    target = Path(
        path
        or os.environ.get("CHECKOUT_STORE_PATH")
        or DEFAULT_PATH
    ).resolve()
    if not target.exists():
        raise FileNotFoundError(f"checkout-sessions.json not found at {target}")

    raw = json.loads(target.read_text())
    sessions = raw.get("sessions", [])

    rows = []
    for s in sessions:
        addr = s.get("address") or {}
        cart = s.get("cart") or []
        rows.append(
            {
                "session_id": s.get("id"),
                "email": s.get("email"),
                "email_hash": hash_email(s.get("email")),
                "first_name": s.get("firstName"),
                "last_name": s.get("lastName"),
                "phone": s.get("phone"),
                "product": s.get("product"),
                "product_name": s.get("productName"),
                "price_dollars": s.get("price"),
                "address_street": addr.get("street"),
                "address_apt": addr.get("apt"),
                "address_city": addr.get("city"),
                "address_state": addr.get("state"),
                "address_zip": addr.get("zip"),
                "delivery_date": s.get("deliveryDate"),
                "delivery_window": s.get("deliveryWindow"),
                "delivery_notes": s.get("deliveryNotes"),
                "proteins": ",".join(s.get("proteins") or []) or None,
                "additional_proteins": ",".join(s.get("additionalProteins") or []) or None,
                "bean_choice": s.get("beanChoice"),
                "cart_n_lines": len(cart),
                "cart_total_cents": s.get("totalCents"),
                "cart_subtotal_cents": s.get("subtotalCents"),
                "cart_discount_cents": s.get("discountCents"),
                "cart_shipping_cents": s.get("shippingCents"),
                "cart_tax_cents": s.get("taxCents"),
                "fulfillment_mode": s.get("fulfillmentMode"),
                "pickup_slot_id": s.get("pickupSlotId"),
                "payment_intent_id": s.get("paymentIntentId"),
                "completed_at": parse_iso(s.get("completedAt")),
                "created_at": parse_iso(s.get("createdAt")),
                "updated_at": parse_iso(s.get("updatedAt")),
                "recovery_email_0_sent_at": parse_iso(s.get("recoveryEmail0SentAt")),
                "recovery_email_1_sent_at": parse_iso(s.get("recoveryEmail1SentAt")),
                "recovery_email_2_sent_at": parse_iso(s.get("recoveryEmail2SentAt")),
                "recovery_email_3_sent_at": parse_iso(s.get("recoveryEmail3SentAt")),
                "sms_sent": bool(s.get("smsConfirmationSent")),
                "sms_response": s.get("smsConfirmationResponse"),
            }
        )

    df = pl.DataFrame(rows) if rows else pl.DataFrame(schema={"session_id": pl.Utf8})
    out = raw_path("checkout_store")
    df.write_parquet(out)
    print(f"[checkout_store] {len(rows)} session(s) -> {out}")
    return out


if __name__ == "__main__":
    extract()
