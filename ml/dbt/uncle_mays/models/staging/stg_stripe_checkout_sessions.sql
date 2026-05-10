/*
  stg_stripe_checkout_sessions
  -----------------------------
  One row per Stripe Checkout Session. This is the primary funnel
  table — every visitor who reaches /checkout creates a session, whether
  or not they pay.

  As of 2026-05-02: 303 sessions, 18 paid (5.9% checkout conversion).
  285 unpaid sessions represent abandoned checkouts.

  UTM / attribution columns are captured in session metadata (wired
  2026-05-03 per attribution fix). Columns will be null for sessions
  prior to that date.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/stripe_checkout_sessions_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by checkout_session_id order by created_at desc) as _rn
    from source
)

select
    checkout_session_id,
    created_at,
    expires_at,
    status                                                as session_status,
    payment_status,
    mode,
    cast(amount_total_cents as double) / 100.0            as amount_total_dollars,
    cast(amount_subtotal_cents as double) / 100.0         as amount_subtotal_dollars,
    amount_total_cents,
    amount_subtotal_cents,
    currency,
    -- customer_id can be ingested as INTEGER when all values are null; cast to VARCHAR
    try_cast(customer_id as varchar)                      as customer_id,
    customer_email,
    email_hash,
    customer_name,
    customer_phone,
    shipping_city,
    shipping_state,
    shipping_zip,
    payment_intent_id,
    -- metadata_utm_* can be ingested as INTEGER (all-null → DuckDB type inference)
    -- Cast to VARCHAR; will be null for pre-attribution-fix sessions
    try_cast(metadata_utm_source as varchar)              as metadata_utm_source,
    try_cast(metadata_utm_medium as varchar)              as metadata_utm_medium,
    try_cast(metadata_utm_campaign as varchar)            as metadata_utm_campaign,
    metadata_product,
    payment_status = 'paid'                               as is_converted,
    (payment_status = 'unpaid' and status = 'expired')    as is_abandoned,
    date_trunc('day', created_at)                         as created_date,
    date_trunc('week', created_at)                        as created_week,
    date_trunc('month', created_at)                       as created_month

from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `{{ var('stripe_dataset') }}.checkout_sessions`
)

select
    checkout_session_id,
    created_at,
    expires_at,
    status                                                as session_status,
    payment_status,
    mode,
    amount_total_cents / 100.0                            as amount_total_dollars,
    amount_subtotal_cents / 100.0                         as amount_subtotal_dollars,
    amount_total_cents,
    amount_subtotal_cents,
    currency,
    customer_id,
    customer_email,
    email_hash,
    customer_name,
    customer_phone,
    shipping_city,
    shipping_state,
    shipping_zip,
    payment_intent_id,
    subscription_id,
    client_reference_id,
    metadata_product,
    metadata_utm_source,
    metadata_utm_medium,
    metadata_utm_campaign,
    payment_status = 'paid'                               as is_converted,
    payment_status = 'unpaid' and status = 'expired'      as is_abandoned,
    date(created_at)                                      as created_date,
    date_trunc(created_at, week)                          as created_week,
    date_trunc(created_at, month)                         as created_month

from source

{% endif %}
