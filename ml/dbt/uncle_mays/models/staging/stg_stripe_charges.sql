/*
  stg_stripe_charges
  ------------------
  One row per Stripe Charge. Source is the raw parquet ingest
  (stripe_charges_*.parquet). In dev, we read the latest file via
  DuckDB's read_parquet glob; in prod the table is loaded to BQ by
  the ingest pipeline.

  Key decisions:
  - amount_dollars = amount_cents / 100 (all money stored in cents upstream)
  - failed charges are included with is_paid = false so abandonment
    analysis can use this table
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/stripe_charges_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by charge_id order by created_at desc) as _rn
    from source
)

select
    charge_id,
    created_at,
    cast(amount_cents as double) / 100.0                  as amount_dollars,
    amount_cents,
    currency,
    status                                                 as charge_status,
    paid                                                   as is_paid,
    captured                                               as is_captured,
    refunded                                               as is_refunded,
    failure_code,
    failure_message,
    customer_id,
    payment_intent_id,
    outcome_network_status,
    outcome_risk_level,
    outcome_seller_message,
    outcome_type,
    case when paid = true and refunded = false then cast(amount_cents as double) / 100.0
         else 0.0
    end                                                    as net_revenue_dollars,
    date_trunc('day', created_at)                          as created_date,
    date_trunc('week', created_at)                         as created_week,
    date_trunc('month', created_at)                        as created_month

from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `{{ var('stripe_dataset') }}.stripe_charges`
)

select
    charge_id,
    created_at,
    amount_cents / 100.0                                   as amount_dollars,
    amount_cents,
    currency,
    status                                                 as charge_status,
    paid                                                   as is_paid,
    captured                                               as is_captured,
    refunded                                               as is_refunded,
    failure_code,
    failure_message,
    customer_id,
    payment_intent_id,
    outcome_network_status,
    outcome_risk_level,
    outcome_seller_message,
    outcome_type,
    case when paid = true and refunded = false then amount_cents / 100.0
         else 0.0
    end                                                    as net_revenue_dollars,
    date(created_at)                                       as created_date,
    date_trunc(created_at, week)                           as created_week,
    date_trunc(created_at, month)                          as created_month

from source

{% endif %}
