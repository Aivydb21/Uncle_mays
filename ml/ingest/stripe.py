"""Pull Stripe data: PaymentIntents + Checkout Sessions + Customers.

This is the primary label spine for the conversion-prediction dataset.
Both classes (converted, abandoned-but-close) come from here:

  Positive: PaymentIntent.status == "succeeded"
            OR Checkout Session.status == "complete" with payment_status == "paid"

  Negative: Checkout Session.status == "expired" with payment_status == "unpaid"
            OR PaymentIntent.status in {"canceled", "requires_payment_method"}
                (and last update older than ABANDON_WINDOW_DAYS)

PI metadata captured by /api/checkout/intent carries cart, UTM, attribution,
and IP/UA fields used as features downstream.
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
import polars as pl

from ._common import (
    hash_email,
    load_dotenv_if_present,
    load_json_config,
    raw_path,
)

STRIPE_API = "https://api.stripe.com/v1"


def _client(secret: str) -> httpx.Client:
    return httpx.Client(
        base_url=STRIPE_API,
        auth=(secret, ""),
        timeout=httpx.Timeout(30.0),
        headers={"Stripe-Version": "2024-06-20"},
    )


def _list_all(
    client: httpx.Client,
    path: str,
    params: dict | None = None,
    limit_per_page: int = 100,
) -> list[dict]:
    out: list[dict] = []
    starting_after: str | None = None
    base = dict(params or {})
    base["limit"] = limit_per_page
    while True:
        if starting_after:
            base["starting_after"] = starting_after
        r = client.get(path, params=base)
        r.raise_for_status()
        body = r.json()
        page = body.get("data", [])
        out.extend(page)
        if not body.get("has_more") or not page:
            break
        starting_after = page[-1]["id"]
        time.sleep(0.1)
    return out


def _to_iso(epoch: int | None) -> datetime | None:
    if epoch is None:
        return None
    try:
        return datetime.fromtimestamp(int(epoch), tz=timezone.utc)
    except (TypeError, ValueError):
        return None


def _md(obj: dict, key: str) -> str | None:
    md = obj.get("metadata") or {}
    v = md.get(key)
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def _md_int(obj: dict, key: str) -> int | None:
    v = _md(obj, key)
    if v is None:
        return None
    try:
        return int(v)
    except ValueError:
        return None


def extract(start_date: str | None = None, all_history: bool = True) -> dict[str, Path]:
    """Pull PIs, Checkout Sessions, Customers, Charges, Subscriptions, Invoices.

    `all_history=True` (default) pulls everything Stripe has ever recorded.
    Pass `start_date=YYYY-MM-DD` to override and use a `created[gte]` filter.
    """
    load_dotenv_if_present()
    cfg = load_json_config("STRIPE_CONFIG_PATH", "~/.claude/stripe-config.json")
    secret = cfg.get("api_key") or cfg.get("secret_key")
    if not secret:
        raise ValueError("Stripe config missing api_key / secret_key")

    if all_history and start_date is None:
        start_epoch: int | None = None
    else:
        start_date = start_date or os.environ.get("DATASET_START_DATE", "2026-04-24")
        start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        start_epoch = int(start_dt.timestamp())

    out: dict[str, Path] = {}
    with _client(secret) as cli:
        out["stripe_payment_intents"] = _extract_payment_intents(cli, start_epoch)
        out["stripe_checkout_sessions"] = _extract_checkout_sessions(cli, start_epoch)
        out["stripe_customers"] = _extract_customers(cli, start_epoch)
        out["stripe_charges"] = _extract_charges(cli, start_epoch)
        out["stripe_subscriptions"] = _extract_subscriptions(cli)
        out["stripe_invoices"] = _extract_invoices(cli, start_epoch)
    return out


def _extract_payment_intents(cli: httpx.Client, start_epoch: int | None) -> Path:
    params = {"expand[]": "data.latest_charge"}
    if start_epoch is not None:
        params["created[gte]"] = start_epoch
    items = _list_all(cli, "/payment_intents", params=params)
    rows = []
    for pi in items:
        latest_charge = pi.get("latest_charge") or {}
        if isinstance(latest_charge, str):
            latest_charge = {}
        billing = (latest_charge.get("billing_details") or {}) if latest_charge else {}
        outcome = (latest_charge.get("outcome") or {}) if latest_charge else {}
        rows.append(
            {
                "payment_intent_id": pi.get("id"),
                "created_at": _to_iso(pi.get("created")),
                "status": pi.get("status"),
                "amount_cents": pi.get("amount"),
                "amount_received_cents": pi.get("amount_received"),
                "currency": pi.get("currency"),
                "customer_id": pi.get("customer"),
                "receipt_email": pi.get("receipt_email"),
                "metadata_email": _md(pi, "customer_email"),
                "email": pi.get("receipt_email") or _md(pi, "customer_email"),
                "email_hash": hash_email(
                    pi.get("receipt_email") or _md(pi, "customer_email")
                ),
                "customer_name": _md(pi, "customer_name"),
                "customer_phone": _md(pi, "customer_phone"),
                "product": _md(pi, "product"),
                "product_name": _md(pi, "productName"),
                "is_test": _md(pi, "is_test") == "true",
                "first_payment": _md(pi, "firstPayment") == "true",
                "fulfillment_mode": _md(pi, "fulfillment_mode"),
                "pickup_slot": _md(pi, "pickup_slot"),
                "line_count": _md_int(pi, "line_count"),
                "line_items_summary": _md(pi, "line_items_summary"),
                "cart_json": _md(pi, "cart_json"),
                "subtotal_cents_md": _md_int(pi, "subtotal_cents"),
                "discount_cents_md": _md_int(pi, "discount_cents"),
                "shipping_cents_md": _md_int(pi, "shipping_cents"),
                "tax_cents_md": _md_int(pi, "tax_cents"),
                "total_cents_md": _md_int(pi, "total_cents"),
                "promo_code": _md(pi, "promo_code"),
                "promo_discount_cents_md": _md_int(pi, "promo_discount_cents"),
                "shipping_street": _md(pi, "shipping_street"),
                "shipping_city": _md(pi, "shipping_city"),
                "shipping_state": _md(pi, "shipping_state"),
                "shipping_zip": _md(pi, "shipping_zip"),
                "utm_source": _md(pi, "utm_source"),
                "utm_medium": _md(pi, "utm_medium"),
                "utm_campaign": _md(pi, "utm_campaign"),
                "utm_content": _md(pi, "utm_content"),
                "utm_term": _md(pi, "utm_term"),
                "gclid": _md(pi, "gclid"),
                "fbclid": _md(pi, "fbclid"),
                "fbc": _md(pi, "fbc"),
                "fbp": _md(pi, "fbp"),
                "ga_client_id": _md(pi, "ga_client_id"),
                "client_ip": _md(pi, "client_ip"),
                "client_user_agent": _md(pi, "client_user_agent"),
                "checkout_session_local_id": _md(pi, "checkoutSessionId"),
                "billing_email": billing.get("email") if billing else None,
                "billing_name": billing.get("name") if billing else None,
                "card_brand": (
                    (latest_charge.get("payment_method_details") or {}).get("card") or {}
                ).get("brand")
                if latest_charge
                else None,
                "card_funding": (
                    (latest_charge.get("payment_method_details") or {}).get("card") or {}
                ).get("funding")
                if latest_charge
                else None,
                "outcome_network_status": outcome.get("network_status") if outcome else None,
                "outcome_risk_level": outcome.get("risk_level") if outcome else None,
                "outcome_seller_message": outcome.get("seller_message") if outcome else None,
                "invoice_id": pi.get("invoice"),
                "is_subscription_invoice": bool(pi.get("invoice")),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"payment_intent_id": pl.Utf8})
    out_path = raw_path("stripe_payment_intents")
    df.write_parquet(out_path)
    print(f"[stripe.payment_intents] {len(rows)} -> {out_path}")
    return out_path


def _extract_checkout_sessions(cli: httpx.Client, start_epoch: int | None) -> Path:
    params: dict = {}
    if start_epoch is not None:
        params["created[gte]"] = start_epoch
    items = _list_all(cli, "/checkout/sessions", params=params)
    rows = []
    for cs in items:
        details = cs.get("customer_details") or {}
        addr = details.get("address") or {}
        rows.append(
            {
                "checkout_session_id": cs.get("id"),
                "created_at": _to_iso(cs.get("created")),
                "expires_at": _to_iso(cs.get("expires_at")),
                "status": cs.get("status"),
                "payment_status": cs.get("payment_status"),
                "mode": cs.get("mode"),
                "amount_total_cents": cs.get("amount_total"),
                "amount_subtotal_cents": cs.get("amount_subtotal"),
                "currency": cs.get("currency"),
                "customer_id": cs.get("customer"),
                "customer_email": cs.get("customer_email") or details.get("email"),
                "email_hash": hash_email(
                    cs.get("customer_email") or details.get("email")
                ),
                "customer_name": details.get("name"),
                "customer_phone": details.get("phone"),
                "shipping_city": addr.get("city"),
                "shipping_state": addr.get("state"),
                "shipping_zip": addr.get("postal_code"),
                "payment_intent_id": cs.get("payment_intent"),
                "subscription_id": cs.get("subscription"),
                "client_reference_id": cs.get("client_reference_id"),
                "metadata_product": _md(cs, "product"),
                "metadata_utm_source": _md(cs, "utm_source"),
                "metadata_utm_medium": _md(cs, "utm_medium"),
                "metadata_utm_campaign": _md(cs, "utm_campaign"),
                "url": cs.get("url"),
                "after_expiration_recovery_url": (
                    ((cs.get("after_expiration") or {}).get("recovery") or {}).get("url")
                ),
                "after_expiration_recovery_active": (
                    ((cs.get("after_expiration") or {}).get("recovery") or {}).get(
                        "allow_promotion_codes"
                    )
                ),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"checkout_session_id": pl.Utf8})
    out_path = raw_path("stripe_checkout_sessions")
    df.write_parquet(out_path)
    print(f"[stripe.checkout_sessions] {len(rows)} -> {out_path}")
    return out_path


def _extract_customers(cli: httpx.Client, start_epoch: int | None) -> Path:
    params: dict = {}
    if start_epoch is not None:
        params["created[gte]"] = start_epoch
    items = _list_all(cli, "/customers", params=params)
    rows = []
    for c in items:
        addr = c.get("address") or {}
        rows.append(
            {
                "customer_id": c.get("id"),
                "created_at": _to_iso(c.get("created")),
                "email": c.get("email"),
                "email_hash": hash_email(c.get("email")),
                "name": c.get("name"),
                "phone": c.get("phone"),
                "city": addr.get("city"),
                "state": addr.get("state"),
                "zip": addr.get("postal_code"),
                "delinquent": c.get("delinquent"),
                "balance_cents": c.get("balance"),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"customer_id": pl.Utf8})
    out_path = raw_path("stripe_customers")
    df.write_parquet(out_path)
    print(f"[stripe.customers] {len(rows)} -> {out_path}")
    return out_path


def _extract_charges(cli: httpx.Client, start_epoch: int | None) -> Path:
    params: dict = {}
    if start_epoch is not None:
        params["created[gte]"] = start_epoch
    items = _list_all(cli, "/charges", params=params)
    rows = []
    for ch in items:
        outcome = ch.get("outcome") or {}
        rows.append(
            {
                "charge_id": ch.get("id"),
                "created_at": _to_iso(ch.get("created")),
                "amount_cents": ch.get("amount"),
                "currency": ch.get("currency"),
                "status": ch.get("status"),
                "paid": ch.get("paid"),
                "captured": ch.get("captured"),
                "refunded": ch.get("refunded"),
                "failure_code": ch.get("failure_code"),
                "failure_message": ch.get("failure_message"),
                "customer_id": ch.get("customer"),
                "payment_intent_id": ch.get("payment_intent"),
                "outcome_network_status": outcome.get("network_status"),
                "outcome_risk_level": outcome.get("risk_level"),
                "outcome_seller_message": outcome.get("seller_message"),
                "outcome_type": outcome.get("type"),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"charge_id": pl.Utf8})
    out_path = raw_path("stripe_charges")
    df.write_parquet(out_path)
    print(f"[stripe.charges] {len(rows)} -> {out_path}")
    return out_path


def _extract_subscriptions(cli: httpx.Client) -> Path:
    """Subscriptions don't filter cleanly by created[gte] vs status, so always
    pull all-history with status=all. Volume is small (~67 lifetime)."""
    items = _list_all(cli, "/subscriptions", params={"status": "all"})
    rows = []
    for sub in items:
        items_list = (sub.get("items") or {}).get("data") or []
        first_item = items_list[0] if items_list else {}
        price = first_item.get("price") or {}
        rows.append(
            {
                "subscription_id": sub.get("id"),
                "created_at": _to_iso(sub.get("created")),
                "status": sub.get("status"),
                "customer_id": sub.get("customer"),
                "current_period_start": _to_iso(sub.get("current_period_start")),
                "current_period_end": _to_iso(sub.get("current_period_end")),
                "cancel_at_period_end": sub.get("cancel_at_period_end"),
                "canceled_at": _to_iso(sub.get("canceled_at")),
                "ended_at": _to_iso(sub.get("ended_at")),
                "trial_end": _to_iso(sub.get("trial_end")),
                "price_id": price.get("id"),
                "price_amount_cents": price.get("unit_amount"),
                "price_interval": (price.get("recurring") or {}).get("interval"),
                "latest_invoice": sub.get("latest_invoice")
                if isinstance(sub.get("latest_invoice"), str)
                else (sub.get("latest_invoice") or {}).get("id"),
                "metadata_product": _md(sub, "product"),
                "metadata_utm_source": _md(sub, "utm_source"),
                "metadata_utm_campaign": _md(sub, "utm_campaign"),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"subscription_id": pl.Utf8})
    out_path = raw_path("stripe_subscriptions")
    df.write_parquet(out_path)
    print(f"[stripe.subscriptions] {len(rows)} -> {out_path}")
    return out_path


def _extract_invoices(cli: httpx.Client, start_epoch: int | None) -> Path:
    params: dict = {"limit": 100}
    if start_epoch is not None:
        params["created[gte]"] = start_epoch
    items = _list_all(cli, "/invoices", params=params)
    rows = []
    for inv in items:
        rows.append(
            {
                "invoice_id": inv.get("id"),
                "created_at": _to_iso(inv.get("created")),
                "status": inv.get("status"),
                "amount_due_cents": inv.get("amount_due"),
                "amount_paid_cents": inv.get("amount_paid"),
                "amount_remaining_cents": inv.get("amount_remaining"),
                "attempt_count": inv.get("attempt_count"),
                "attempted": inv.get("attempted"),
                "billing_reason": inv.get("billing_reason"),
                "collection_method": inv.get("collection_method"),
                "currency": inv.get("currency"),
                "customer_id": inv.get("customer"),
                "subscription_id": inv.get("subscription"),
                "payment_intent_id": inv.get("payment_intent"),
                "paid": inv.get("paid"),
                "period_start": _to_iso(inv.get("period_start")),
                "period_end": _to_iso(inv.get("period_end")),
                "next_payment_attempt": _to_iso(inv.get("next_payment_attempt")),
                "customer_email": inv.get("customer_email"),
                "email_hash": hash_email(inv.get("customer_email")),
            }
        )
    df = pl.from_dicts(rows, infer_schema_length=None) if rows else pl.DataFrame(schema={"invoice_id": pl.Utf8})
    out_path = raw_path("stripe_invoices")
    df.write_parquet(out_path)
    print(f"[stripe.invoices] {len(rows)} -> {out_path}")
    return out_path


if __name__ == "__main__":
    extract()
