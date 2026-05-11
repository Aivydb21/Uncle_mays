/*
  stg_stripe_payment_intents
  ---------------------------
  One row per Stripe PaymentIntent. Payment intents carry the full
  attribution metadata (UTM, fbclid, gclid, fbc, fbp) wired to the
  checkout flow as of 2026-05-03. Also contains full cart breakdown
  (line items, promo codes, fulfillment mode).

  141 rows as of 2026-05-02 ingest (includes test + non-succeeded PIs).
  33 succeeded non-test PIs = completed orders.

  Column names sourced directly from ml/ingest/stripe.py output schema.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/stripe_payment_intents_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by payment_intent_id order by created_at desc) as _rn
    from source
)

select
    payment_intent_id,
    created_at,
    cast(amount_cents as double) / 100.0           as amount_dollars,
    cast(amount_received_cents as double) / 100.0  as amount_received_dollars,
    amount_cents,
    amount_received_cents,
    currency,
    status                                         as pi_status,
    status = 'succeeded'                           as is_succeeded,
    is_test,
    first_payment                                  as is_first_payment,
    customer_id,
    email,
    -- Derive email_hash if not present (older orders pre-dating hash in ingest)
    -- Formula matches ml/ingest/_common.py: sha256(lower(trim(email)))[:24]
    coalesce(
        email_hash,
        case when email is not null
             then left(sha256(lower(trim(email))), 24)
        end
    )                                                   as email_hash,
    metadata_email,
    customer_name,
    customer_phone,
    -- Cart / order details (cast VARCHAR columns — DuckDB infers INTEGER for all-null columns)
    product,
    try_cast(product_name as varchar)                          as product_name,
    try_cast(fulfillment_mode as varchar)                      as fulfillment_mode,
    try_cast(pickup_slot as varchar)                           as pickup_slot,
    try_cast(line_count as bigint)                             as line_count,
    try_cast(line_items_summary as varchar)                    as line_items_summary,
    try_cast(cart_json as varchar)                             as cart_json,
    cast(coalesce(subtotal_cents_md, 0) as double) / 100.0      as subtotal_dollars,
    cast(coalesce(discount_cents_md, 0) as double) / 100.0      as discount_dollars,
    cast(coalesce(shipping_cents_md, 0) as double) / 100.0      as shipping_dollars,
    cast(coalesce(tax_cents_md, 0) as double) / 100.0           as tax_dollars,
    cast(coalesce(total_cents_md, 0) as double) / 100.0         as total_dollars,
    promo_code,
    cast(coalesce(promo_discount_cents_md, 0) as double) / 100.0 as promo_discount_dollars,
    -- Shipping
    shipping_street,
    shipping_city,
    shipping_state,
    shipping_zip,
    -- Attribution (populated from 2026-05-03 onward)
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    gclid,
    fbclid,
    fbc,
    fbp,
    -- Derived attribution flags
    (gclid is not null and length(gclid) > 0)      as has_gclid,
    (fbclid is not null and length(fbclid) > 0)    as has_fbclid,
    -- Payment method info
    card_brand,
    card_funding,
    outcome_network_status,
    outcome_risk_level,
    is_subscription_invoice,
    invoice_id,
    date_trunc('day', created_at)                  as created_date,
    date_trunc('week', created_at)                 as created_week,
    date_trunc('month', created_at)                as created_month

from deduped
where _rn = 1
  and not ({{ is_internal_test('customer_id', 'email') }})

{% else %}

with source as (
    select *
    from `{{ var('stripe_dataset') }}.payment_intents`
)

select
    payment_intent_id,
    created_at,
    amount_cents / 100.0                           as amount_dollars,
    amount_received_cents / 100.0                  as amount_received_dollars,
    amount_cents,
    amount_received_cents,
    currency,
    status                                         as pi_status,
    status = 'succeeded'                           as is_succeeded,
    is_test,
    first_payment                                  as is_first_payment,
    customer_id,
    email,
    email_hash,
    metadata_email,
    customer_name,
    customer_phone,
    product,
    product_name,
    fulfillment_mode,
    pickup_slot,
    line_count,
    line_items_summary,
    cart_json,
    coalesce(subtotal_cents_md, 0) / 100.0          as subtotal_dollars,
    coalesce(discount_cents_md, 0) / 100.0          as discount_dollars,
    coalesce(shipping_cents_md, 0) / 100.0          as shipping_dollars,
    coalesce(tax_cents_md, 0) / 100.0               as tax_dollars,
    coalesce(total_cents_md, 0) / 100.0             as total_dollars,
    promo_code,
    coalesce(promo_discount_cents_md, 0) / 100.0    as promo_discount_dollars,
    shipping_street,
    shipping_city,
    shipping_state,
    shipping_zip,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    gclid,
    fbclid,
    fbc,
    fbp,
    gclid is not null and length(gclid) > 0        as has_gclid,
    fbclid is not null and length(fbclid) > 0      as has_fbclid,
    card_brand,
    card_funding,
    outcome_network_status,
    outcome_risk_level,
    is_subscription_invoice,
    invoice_id,
    date(created_at)                               as created_date,
    date_trunc(created_at, week)                   as created_week,
    date_trunc(created_at, month)                  as created_month

from source
where not ({{ is_internal_test('customer_id', 'email') }})

{% endif %}
