"""Assemble the labeled conversion-prediction dataset (v2 — full history).

Design changes from v1:

  - Spine is the union of Stripe Checkout Sessions + standalone PaymentIntents
    (PIs that aren't already attached to a CS). One row per attempt.
  - Pulls ALL Stripe history (no DATASET_START_DATE cutoff by default).
  - Drops internal/test traffic via the same suppression list the site uses
    for transactional sends. Anthony's @unclemays.com testing dominates raw
    Stripe — without this filter the model learns "looks like Anthony."
  - Keeps multi-attempt customers as separate rows and adds attempt-count
    features (1st try, 2nd try, etc.) so the model can learn "this is the
    customer's 3rd attempt today and the first 2 failed" as signal.

Label (Y):
  CS   status=complete & payment_status=paid      → 1
  CS   status=expired  & payment_status=unpaid    → 0
  PI   status=succeeded                            → 1
  PI   status=canceled                             → 0
  PI   status=requires_payment_method
       AND created_at <= now - ABANDON_WINDOW_DAYS → 0

Excluded:
  is_test=True (PI metadata)
  is_subscription_invoice=True on PIs (renewal flow — different model)
  Suppressed emails (any *@unclemays.com, anthonypivy@gmail.com, etc.)
  In-flight statuses (processing, requires_action, requires_confirmation)

Output:
  data/processed/conversion_v2_<utc>.parquet
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import polars as pl

from ml.ingest._common import (
    DATA_PROCESSED,
    latest_raw,
    load_dotenv_if_present,
    utc_now_iso,
)
from ml.ingest._suppression import is_suppressed
from ml.features._campaign_map import (
    canonicalize_gads_name,
    canonicalize_meta_name,
    canonicalize_stripe_slug,
)


def _read_latest(source: str) -> pl.DataFrame | None:
    p = latest_raw(source)
    if p is None:
        print(f"[build_dataset] WARN: no raw extract found for {source}")
        return None
    return pl.read_parquet(p)


def _suppressed_mask(df: pl.DataFrame, email_col: str = "email") -> pl.Series:
    """Return a boolean Series (same length as df) where True = suppressed.

    Important: rows with a NULL email are NOT suppressed. Those are real
    abandoned attempts where the customer left before entering email; they
    are valid negatives. Only rows whose explicit email matches an internal
    test address get dropped.
    """
    if email_col not in df.columns:
        return pl.Series([False] * df.height)

    def _check(e: str | None) -> bool:
        if e is None or (isinstance(e, str) and not e.strip()):
            return False
        return is_suppressed(e)

    return df[email_col].map_elements(_check, return_dtype=pl.Boolean)


def build() -> Path:
    load_dotenv_if_present()
    abandon_days = int(os.environ.get("ABANDON_WINDOW_DAYS", "1"))
    cutoff = datetime.now(timezone.utc) - timedelta(days=abandon_days)

    pi = _read_latest("stripe_payment_intents")
    cs = _read_latest("stripe_checkout_sessions")
    if pi is None or pi.height == 0 or cs is None:
        raise RuntimeError(
            "Stripe extracts missing. Run: python -c 'from ml.ingest import stripe; stripe.extract()'"
        )

    # ------------------------------------------------------------------
    # Build attempts spine: CSes (with child PI metadata folded in) +
    # standalone PIs (no parent CS).
    # ------------------------------------------------------------------
    cs_pi_ids: set[str] = set()
    if cs.height > 0 and "payment_intent_id" in cs.columns:
        cs_pi_ids = {
            x for x in cs["payment_intent_id"].to_list() if x is not None and x != ""
        }

    # CS rows -> attempts
    cs_rows: list[dict] = []
    if cs.height > 0:
        for r in cs.iter_rows(named=True):
            email = r.get("customer_email")
            status = r.get("status")
            pay_status = r.get("payment_status")
            if status == "complete" and pay_status == "paid":
                label = 1
            elif status == "expired" and pay_status == "unpaid":
                label = 0
            else:
                label = None
            if label is None:
                continue
            cs_rows.append(
                {
                    "attempt_id": r.get("checkout_session_id"),
                    "source": "checkout_session",
                    "created_at": r.get("created_at"),
                    "email": email,
                    "email_hash": r.get("email_hash"),
                    "customer_id": r.get("customer_id"),
                    "customer_name": r.get("customer_name"),
                    "amount_cents": r.get("amount_total_cents"),
                    "currency": r.get("currency"),
                    "shipping_city": r.get("shipping_city"),
                    "shipping_state": r.get("shipping_state"),
                    "shipping_zip": r.get("shipping_zip"),
                    "payment_intent_id": r.get("payment_intent_id"),
                    "metadata_product": r.get("metadata_product"),
                    "metadata_utm_source": r.get("metadata_utm_source"),
                    "metadata_utm_medium": r.get("metadata_utm_medium"),
                    "metadata_utm_campaign": r.get("metadata_utm_campaign"),
                    # CS metadata doesn't typically carry fbclid/gclid
                    "fbclid": None,
                    "gclid": None,
                    "fbc": None,
                    "fbp": None,
                    "label": label,
                }
            )

    pi_rows: list[dict] = []
    if pi.height > 0:
        for r in pi.iter_rows(named=True):
            pi_id = r.get("payment_intent_id")
            if pi_id in cs_pi_ids:
                continue  # CS owns this attempt
            if r.get("is_test"):
                continue
            if r.get("is_subscription_invoice"):
                continue
            status = r.get("status")
            created = r.get("created_at")
            if status == "succeeded":
                label = 1
            elif status == "canceled":
                label = 0
            elif status == "requires_payment_method" and created and created <= cutoff:
                label = 0
            else:
                label = None
            if label is None:
                continue
            pi_rows.append(
                {
                    "attempt_id": pi_id,
                    "source": "payment_intent",
                    "created_at": created,
                    "email": r.get("email"),
                    "email_hash": r.get("email_hash"),
                    "customer_id": r.get("customer_id"),
                    "customer_name": r.get("customer_name"),
                    "amount_cents": r.get("amount_cents"),
                    "currency": r.get("currency"),
                    "shipping_city": r.get("shipping_city"),
                    "shipping_state": r.get("shipping_state"),
                    "shipping_zip": r.get("shipping_zip"),
                    "payment_intent_id": pi_id,
                    "metadata_product": r.get("product"),
                    "metadata_utm_source": r.get("utm_source"),
                    "metadata_utm_medium": r.get("utm_medium"),
                    "metadata_utm_campaign": r.get("utm_campaign"),
                    "fbclid": r.get("fbclid"),
                    "gclid": r.get("gclid"),
                    "fbc": r.get("fbc"),
                    "fbp": r.get("fbp"),
                    "label": label,
                }
            )

    if not (cs_rows or pi_rows):
        raise RuntimeError("No labeled rows after filtering. Check Stripe extract.")

    spine = pl.from_dicts(cs_rows + pi_rows, infer_schema_length=None)
    print(
        f"[build_dataset] raw spine (pre-suppression): {spine.height}  "
        f"CSes:{len(cs_rows)}  PIs:{len(pi_rows)}"
    )

    # ------------------------------------------------------------------
    # Drop suppressed (test/internal) emails.
    # ------------------------------------------------------------------
    suppressed = _suppressed_mask(spine, "email").fill_null(False)
    n_suppressed = int(suppressed.sum() or 0)
    spine = spine.filter(~suppressed)
    print(f"[build_dataset] dropped {n_suppressed} suppressed (Anthony / *@unclemays.com / etc.)")
    print(
        f"[build_dataset] post-suppression: {spine.height}  "
        f"Y=1: {spine.filter(pl.col('label') == 1).height}  "
        f"Y=0: {spine.filter(pl.col('label') == 0).height}"
    )

    # ------------------------------------------------------------------
    # Attempt-count features per email_hash (cumulative within history).
    # ------------------------------------------------------------------
    spine = spine.sort(["email_hash", "created_at"])
    spine = spine.with_columns(
        attempt_n_lifetime=(
            pl.cum_count("attempt_id").over("email_hash")
        ),
        prior_successes_lifetime=(
            (pl.col("label") == 1)
            .cast(pl.Int32)
            .cum_sum()
            .over("email_hash")
            - (pl.col("label") == 1).cast(pl.Int32)
        ),
        prior_failures_lifetime=(
            (pl.col("label") == 0)
            .cast(pl.Int32)
            .cum_sum()
            .over("email_hash")
            - (pl.col("label") == 0).cast(pl.Int32)
        ),
    ).with_columns(
        is_first_attempt=pl.col("attempt_n_lifetime") == 1,
        prior_attempts_lifetime=pl.col("attempt_n_lifetime") - 1,
    )

    # Time since prior attempt (per email)
    spine = spine.with_columns(
        seconds_since_prior_attempt=(
            (pl.col("created_at") - pl.col("created_at").shift(1).over("email_hash"))
            .dt.total_seconds()
        )
    )

    # Time-of-day features
    spine = spine.with_columns(
        created_dow=pl.col("created_at").dt.weekday(),
        created_hour_utc=pl.col("created_at").dt.hour(),
    )

    # ------------------------------------------------------------------
    # Join enrichments (left joins; missing is OK for tree models).
    # ------------------------------------------------------------------
    cust = _read_latest("stripe_customers")
    chg = _read_latest("stripe_charges")
    mc = _read_latest("mailchimp_members")
    rs = _read_latest("resend_emails")
    apollo = _read_latest("apollo_contacts")
    ga4 = _read_latest("ga4_session_summary")
    cstore = _read_latest("checkout_store")

    # Stripe customer billing geo
    if cust is not None and cust.height > 0:
        cust_join = cust.select(
            [
                "customer_id",
                pl.col("created_at").alias("cust_created_at"),
                pl.col("city").alias("cust_city"),
                pl.col("state").alias("cust_state"),
                pl.col("zip").alias("cust_zip"),
                pl.col("delinquent").alias("cust_delinquent"),
            ]
        )
        spine = spine.join(cust_join, on="customer_id", how="left")

    # Charge outcome on the linked PI
    if chg is not None and chg.height > 0 and "payment_intent_id" in spine.columns:
        chg_join = chg.select(
            [
                "payment_intent_id",
                pl.col("status").alias("chg_status"),
                pl.col("failure_code").alias("chg_failure_code"),
                pl.col("failure_message").alias("chg_failure_message"),
                pl.col("outcome_network_status").alias("chg_network_status"),
                pl.col("outcome_risk_level").alias("chg_risk_level"),
                pl.col("outcome_seller_message").alias("chg_seller_message"),
            ]
        ).filter(pl.col("payment_intent_id").is_not_null())
        spine = spine.join(chg_join, on="payment_intent_id", how="left")

    # Mailchimp
    if mc is not None and mc.height > 0:
        mc_join = mc.select(
            [
                "email_hash",
                pl.col("status").alias("mc_status"),
                pl.col("member_rating").alias("mc_member_rating"),
                pl.col("avg_open_rate").alias("mc_avg_open_rate"),
                pl.col("avg_click_rate").alias("mc_avg_click_rate"),
                pl.col("tag_count").alias("mc_tag_count"),
            ]
        ).filter(pl.col("email_hash").is_not_null()).unique(subset=["email_hash"])
        spine = spine.join(mc_join, on="email_hash", how="left").with_columns(
            mc_in_audience=pl.col("mc_status").is_not_null(),
        )

    # Resend
    if rs is not None and rs.height > 0:
        rs_agg = (
            rs.rename({"to_hash": "email_hash"})
            .filter(pl.col("email_hash").is_not_null())
            .group_by("email_hash")
            .agg(
                resend_send_count=pl.len(),
                resend_unique_types=pl.col("tag_type").n_unique(),
            )
        )
        spine = spine.join(rs_agg, on="email_hash", how="left").with_columns(
            resend_send_count=pl.col("resend_send_count").fill_null(0),
            resend_unique_types=pl.col("resend_unique_types").fill_null(0),
        )

    # Apollo
    if apollo is not None and apollo.height > 0:
        ap_join = (
            apollo.select(
                [
                    "email_hash",
                    pl.col("title").alias("apollo_title"),
                    pl.col("seniority").alias("apollo_seniority"),
                    pl.col("org_industry").alias("apollo_org_industry"),
                ]
            )
            .filter(pl.col("email_hash").is_not_null())
            .unique(subset=["email_hash"])
        )
        spine = spine.join(ap_join, on="email_hash", how="left").with_columns(
            is_apollo_contact=pl.col("apollo_title").is_not_null(),
        )

    # GA4 join: two strategies, in priority order.
    #
    # 1. Match by ga_client_id <-> user_pseudo_id when the cookie was captured
    #    at checkout. This catches BROWSE-SESSION GA4 data (traffic source,
    #    pageviews, scrolls, form_starts) for both converters AND abandoners,
    #    which is what we actually need for prediction. Aggregates across all
    #    the customer's sessions (anonymous and identified) into one row.
    #
    # 2. Fall back to transaction_id <-> payment_intent_id for any remaining
    #    rows. Only catches purchases that fired the GA4 'purchase' event,
    #    which is why pre-2026-05-03 the join was 1/305.
    if ga4 is not None and ga4.height > 0:
        joined_via_client_id = False
        if "ga_client_id" in spine.columns and "user_pseudo_id" in ga4.columns:
            ga4_by_client = (
                ga4.filter(pl.col("user_pseudo_id").is_not_null())
                .group_by("user_pseudo_id")
                .agg(
                    pl.col("device_category").drop_nulls().first().alias("ga4_device_category"),
                    pl.col("device_browser").drop_nulls().first().alias("ga4_device_browser"),
                    pl.col("geo_city").drop_nulls().first().alias("ga4_geo_city"),
                    pl.col("first_traffic_source").drop_nulls().first().alias("ga4_traffic_source"),
                    pl.col("first_traffic_medium").drop_nulls().first().alias("ga4_traffic_medium"),
                    pl.col("event_count").cast(pl.Int64, strict=False).sum().alias("ga4_event_count"),
                    pl.col("pageviews").cast(pl.Int64, strict=False).sum().alias("ga4_pageviews"),
                    pl.col("scrolls").cast(pl.Int64, strict=False).sum().alias("ga4_scrolls"),
                    pl.col("form_starts").cast(pl.Int64, strict=False).sum().alias("ga4_form_starts"),
                )
                .rename({"user_pseudo_id": "ga_client_id"})
            )
            spine = spine.join(ga4_by_client, on="ga_client_id", how="left")
            joined_via_client_id = True

        # Fallback path: match by transaction_id for purchase rows that didn't
        # have a ga_client_id captured. Skip if columns already present from path 1.
        if "payment_intent_id" in spine.columns:
            ga4_tx = (
                ga4.filter(pl.col("transaction_id").is_not_null())
                .rename({"transaction_id": "payment_intent_id"})
                .select(
                    [
                        "payment_intent_id",
                        pl.col("device_category").alias("ga4_device_category_tx"),
                        pl.col("device_browser").alias("ga4_device_browser_tx"),
                        pl.col("geo_city").alias("ga4_geo_city_tx"),
                        pl.col("first_traffic_source").alias("ga4_traffic_source_tx"),
                        pl.col("first_traffic_medium").alias("ga4_traffic_medium_tx"),
                        pl.col("event_count").alias("ga4_event_count_tx"),
                        pl.col("pageviews").alias("ga4_pageviews_tx"),
                        pl.col("scrolls").alias("ga4_scrolls_tx"),
                        pl.col("form_starts").alias("ga4_form_starts_tx"),
                    ]
                )
                .unique(subset=["payment_intent_id"])
            )
            spine = spine.join(ga4_tx, on="payment_intent_id", how="left")

            if joined_via_client_id:
                # Coalesce client-id-matched values with transaction-matched
                # values so columns don't suffix-collide and downstream
                # feature code keeps working with the unsuffixed names.
                for col in [
                    "ga4_device_category", "ga4_device_browser", "ga4_geo_city",
                    "ga4_traffic_source", "ga4_traffic_medium",
                    "ga4_event_count", "ga4_pageviews", "ga4_scrolls", "ga4_form_starts",
                ]:
                    tx_col = f"{col}_tx"
                    if tx_col in spine.columns:
                        spine = spine.with_columns(
                            pl.coalesce([pl.col(col), pl.col(tx_col)]).alias(col)
                        ).drop(tx_col)
            else:
                # No client-id path ran; just rename _tx to canonical names.
                renames = {f"{c}_tx": c for c in [
                    "ga4_device_category", "ga4_device_browser", "ga4_geo_city",
                    "ga4_traffic_source", "ga4_traffic_medium",
                    "ga4_event_count", "ga4_pageviews", "ga4_scrolls", "ga4_form_starts",
                ] if f"{c}_tx" in spine.columns}
                if renames:
                    spine = spine.rename(renames)

        if "ga4_event_count" in spine.columns:
            spine = spine.with_columns(
                ga4_matched=pl.col("ga4_event_count").is_not_null(),
            )

    # Local checkout-store (cart breakdown + recovery flags) — only matches
    # the small post-2026-04-24 slice.
    if cstore is not None and cstore.height > 0 and "payment_intent_id" in spine.columns:
        cstore = cstore.with_columns(
            payment_intent_id=pl.col("payment_intent_id").cast(pl.Utf8, strict=False)
        )
        cstore_join = cstore.select(
            [
                "payment_intent_id",
                pl.col("cart_n_lines").alias("cs_cart_n_lines"),
                pl.col("cart_total_cents").alias("cs_cart_total_cents"),
                pl.col("fulfillment_mode").alias("cs_fulfillment_mode"),
                pl.col("recovery_email_0_sent_at").alias("cs_recovery0_at"),
                pl.col("recovery_email_3_sent_at").alias("cs_recovery3_at"),
                pl.col("sms_sent").alias("cs_sms_sent"),
            ]
        ).filter(pl.col("payment_intent_id").is_not_null())
        spine = spine.join(cstore_join, on="payment_intent_id", how="left")

    # ------------------------------------------------------------------
    # Expanded sources (added 2026-05-02)
    # ------------------------------------------------------------------

    # Census ACS demographics by ZIP (annual data; refresh once a year).
    census = _read_latest("census_acs_zip")
    if census is not None and census.height > 0:
        census_join = (
            census.select(
                [
                    pl.col("zip").alias("shipping_zip"),
                    pl.col("median_household_income").alias("zip_median_income"),
                    pl.col("total_population").alias("zip_population"),
                    pl.col("median_age").alias("zip_median_age"),
                    pl.col("median_household_size").alias("zip_household_size"),
                    pl.col("pct_black_households").alias("zip_pct_black"),
                    pl.col("pct_white_households").alias("zip_pct_white"),
                    pl.col("pct_hispanic_households").alias("zip_pct_hispanic"),
                ]
            )
            .unique(subset=["shipping_zip"])
        )
        if "shipping_zip" in spine.columns:
            spine = spine.with_columns(
                shipping_zip=pl.col("shipping_zip").cast(pl.Utf8, strict=False).str.slice(0, 5)
            )
        spine = spine.join(census_join, on="shipping_zip", how="left")

    # Translate Stripe utm_campaign -> canonical slug. Collapses legacy slug
    # duplicates (e.g. sub-launch-apr26 and subscription_launch_apr2026 both
    # map to meta-sub-launch-202604) so downstream joins land cleanly.
    if "metadata_utm_campaign" in spine.columns:
        spine = spine.with_columns(
            campaign_slug_canonical=pl.col("metadata_utm_campaign").map_elements(
                canonicalize_stripe_slug, return_dtype=pl.Utf8
            )
        )

    # Meta Ads — lifetime campaign rollups joined by canonical slug.
    meta_ins = _read_latest("meta_campaign_insights")
    if meta_ins is not None and meta_ins.height > 0:
        meta_with_slug = meta_ins.with_columns(
            campaign_slug_canonical=pl.col("campaign_name").map_elements(
                canonicalize_meta_name, return_dtype=pl.Utf8
            )
        ).filter(pl.col("campaign_slug_canonical").is_not_null())
        meta_agg = meta_with_slug.group_by("campaign_slug_canonical").agg(
            meta_lifetime_impressions=pl.col("impressions").sum(),
            meta_lifetime_clicks=pl.col("clicks").sum(),
            meta_lifetime_spend_usd=pl.col("spend_usd").sum(),
            meta_lifetime_purchases=pl.col("purchases").sum(),
            meta_lifetime_ctr_avg=pl.col("ctr").mean(),
            meta_lifetime_cpc_avg=pl.col("cpc").mean(),
        )
        spine = spine.join(
            meta_agg, on="campaign_slug_canonical", how="left"
        ).with_columns(
            has_meta_campaign_match=pl.col("meta_lifetime_impressions").is_not_null(),
        )
        if "fbclid" in spine.columns:
            spine = spine.with_columns(
                has_fbclid=pl.col("fbclid").is_not_null(),
            )

    # Google Ads — lifetime campaign rollups joined by canonical slug.
    gads_ins = _read_latest("google_ads_campaign_insights")
    if gads_ins is not None and gads_ins.height > 0:
        gads_with_slug = gads_ins.with_columns(
            campaign_slug_canonical=pl.col("campaign_name").map_elements(
                canonicalize_gads_name, return_dtype=pl.Utf8
            )
        ).filter(pl.col("campaign_slug_canonical").is_not_null())
        gads_agg = gads_with_slug.group_by("campaign_slug_canonical").agg(
            gads_lifetime_impressions=pl.col("impressions").sum(),
            gads_lifetime_clicks=pl.col("clicks").sum(),
            gads_lifetime_spend_usd=pl.col("spend_usd").sum(),
            gads_lifetime_conversions=pl.col("conversions").sum(),
            gads_lifetime_ctr_avg=pl.col("ctr").mean(),
            gads_lifetime_cpc_avg=pl.col("average_cpc_usd").mean(),
        )
        spine = spine.join(
            gads_agg, on="campaign_slug_canonical", how="left"
        ).with_columns(
            has_gads_campaign_match=pl.col("gads_lifetime_impressions").is_not_null(),
        )
        if "gclid" in spine.columns:
            spine = spine.with_columns(
                has_gclid=pl.col("gclid").is_not_null(),
            )

    # Microsoft Clarity — page-level dwell/scroll/rage-click metrics. Skipped
    # as a per-row feature for v2 because the page they checked out from is
    # noisy in the current data; raw parquet is still on disk for ad-hoc
    # exploration in the notebook.

    # ------------------------------------------------------------------
    # Persist
    # ------------------------------------------------------------------
    out = DATA_PROCESSED / f"conversion_v2_{utc_now_iso()}.parquet"
    spine.write_parquet(out)
    print(
        f"[build_dataset] wrote {spine.height} rows x {len(spine.columns)} cols -> {out}"
    )
    print(
        f"[build_dataset] final balance: "
        f"Y=1: {spine.filter(pl.col('label') == 1).height}  "
        f"Y=0: {spine.filter(pl.col('label') == 0).height}"
    )
    print(
        f"[build_dataset] unique customers: {spine['email_hash'].n_unique()}  "
        f"first-attempts: {spine.filter(pl.col('is_first_attempt')).height}"
    )
    return out


if __name__ == "__main__":
    build()
