/*
  mart_channel_performance
  ------------------------
  Weekly channel-level aggregation of orders, revenue, and (where
  available) ad spend from Meta / Google Ads ingest.

  Used for:
    - CAC by channel (spend / new customers acquired)
    - ROAS (revenue / spend)

  NOTE: Ad spend join requires mart_ad_spend (TODO). Until that mart
  exists, spend columns are null and CAC/ROAS are not computable.
  Blocked on: loading Meta/Google Ads parquet to BigQuery.
*/

{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('mart_orders') }}
),

weekly_channel as (
    select
        order_week,
        channel,
        utm_source,
        utm_medium,
        utm_campaign,

        count(*)                                              as orders,
        count(distinct email_hash)                            as unique_customers,
        sum(gross_revenue_dollars)                            as gross_revenue_dollars,
        avg(gross_revenue_dollars)                            as aov_dollars,
        sum(case when is_first_order then 1 else 0 end)       as new_customers,
        sum(case when not is_first_order then 1 else 0 end)   as repeat_customers,
        count(case when promo_code is not null then 1 end)    as orders_with_promo,
        sum(promo_discount_dollars)                           as total_promo_discount_dollars,
        count(case when fulfillment_mode = 'delivery' then 1 end) as delivery_orders,
        count(case when fulfillment_mode = 'pickup' then 1 end)   as pickup_orders

    from orders
    group by 1, 2, 3, 4, 5
)

select
    order_week,
    channel,
    utm_source,
    utm_medium,
    utm_campaign,
    orders,
    unique_customers,
    gross_revenue_dollars,
    aov_dollars,
    new_customers,
    repeat_customers,
    orders_with_promo,
    total_promo_discount_dollars,
    delivery_orders,
    pickup_orders,
    -- Placeholders until mart_ad_spend is built
    cast(null as double)                                      as ad_spend_dollars,
    cast(null as double)                                      as cac_dollars,
    cast(null as double)                                      as roas

from weekly_channel
