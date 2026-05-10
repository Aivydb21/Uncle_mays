/*
  mart_customers
  --------------
  One row per customer (keyed on email_hash for privacy).
  Aggregates order history to compute LTV, repeat purchase rate,
  days between orders, and acquisition channel per customer.

  This is the authoritative source for:
    - Customer LTV (lifetime value)
    - Repeat purchase rate (retention)
    - Cohort analysis (first_order_month)
    - CAC attribution (which channel acquired this customer)
*/

{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('mart_orders') }}
),

customer_agg as (
    select
        email_hash,
        any_value(customer_email)                        as customer_email,
        any_value(customer_id)                           as customer_id,
        any_value(customer_name)                         as customer_name,
        any_value(shipping_city)                         as shipping_city,
        any_value(shipping_state)                        as shipping_state,
        any_value(shipping_zip)                          as shipping_zip,

        -- Acquisition (first order)
        min(ordered_at)                                  as first_order_at,
        date_trunc('month', min(ordered_at))             as acquisition_month,

        -- LTV
        count(*)                                         as total_orders,
        sum(gross_revenue_dollars)                       as ltv_dollars,
        avg(gross_revenue_dollars)                       as aov_dollars,
        max(ordered_at)                                  as last_order_at

    from orders
    group by email_hash
),

-- First-touch channel: one row per customer, earliest order
-- DISTINCT ON (DuckDB/Postgres) replaced with ROW_NUMBER for BQ compatibility
first_touch_ranked as (
    select
        email_hash,
        channel                                          as acquisition_channel,
        utm_source                                       as acquisition_utm_source,
        utm_campaign                                     as acquisition_utm_campaign,
        row_number() over (partition by email_hash order by ordered_at asc) as _rn
    from orders
),
first_touch as (
    select email_hash, acquisition_channel, acquisition_utm_source, acquisition_utm_campaign
    from first_touch_ranked
    where _rn = 1
)

select
    ca.email_hash,
    ca.customer_email,
    ca.customer_id,
    ca.customer_name,
    ca.shipping_city,
    ca.shipping_state,
    ca.shipping_zip,
    ca.first_order_at,
    ca.acquisition_month,
    ft.acquisition_channel,
    ft.acquisition_utm_source,
    ft.acquisition_utm_campaign,
    ca.total_orders,
    ca.ltv_dollars,
    ca.aov_dollars,
    ca.last_order_at,
    ca.total_orders > 1                                  as is_repeat_customer

from customer_agg ca
left join first_touch ft using (email_hash)
