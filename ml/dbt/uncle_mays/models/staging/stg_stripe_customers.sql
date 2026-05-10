/*
  stg_stripe_customers
  --------------------
  One row per Stripe Customer. Customers are created at first
  checkout initiation, so this table includes both purchasers and
  non-converting visitors who left an email.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/stripe_customers_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by customer_id order by created_at desc) as _rn
    from source
)

select
    customer_id,
    created_at,
    email,
    email_hash,
    name                        as customer_name,
    phone,
    city                        as address_city,
    state                       as address_state,
    zip                         as zip_code,
    delinquent                  as is_delinquent,
    date_trunc('day', created_at)   as created_date,
    date_trunc('month', created_at) as created_month

from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `{{ var('stripe_dataset') }}.customers`
)

select
    customer_id,
    created_at,
    email,
    email_hash,
    name                        as customer_name,
    phone,
    city                        as address_city,
    state                       as address_state,
    zip                         as zip_code,
    delinquent                  as is_delinquent,
    date(created_at)                as created_date,
    date_trunc(created_at, month)   as created_month

from source

{% endif %}
