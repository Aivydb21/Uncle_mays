/*
  rpt_cro_weekly
  --------------
  CRO weekly review: conversion, channel mix, AOV by traffic source,
  cart abandonment.

  One row per week.

  Columns:
    order_week              — ISO week (Monday)
    checkout_sessions       — total checkout sessions initiated
    paid_sessions           — sessions that converted to payment
    checkout_cvr_pct        — checkout conversion rate (paid / total sessions)
    abandoned_sessions      — sessions that expired without payment
    abandon_rate_pct        — abandon rate (expired / total)
    orders                  — completed orders
    new_customer_orders     — first-time buyer orders
    repeat_orders           — returning buyer orders
    aov                     — average order value all orders
    aov_new_customers       — AOV for first-time buyers
    aov_repeat_customers    — AOV for repeat buyers
    promo_order_pct         — % of orders using a promo code
    avg_promo_discount      — average promo discount per order (all orders, incl $0)
    top_channel             — channel with most orders this week
    direct_pct              — % of orders attributed to direct/unknown
    paid_pct                — % of orders attributed to paid (google+meta)
    delivery_pct            — % of orders with delivery fulfillment
*/

{{ config(materialized='table') }}

with sessions as (
    select
        date_trunc('week', created_at)           as order_week,
        count(*)                                  as checkout_sessions,
        sum(case when is_converted then 1 else 0 end) as paid_sessions,
        sum(case when is_abandoned  then 1 else 0 end) as abandoned_sessions
    from {{ ref('stg_stripe_checkout_sessions') }}
    group by 1
),

orders as (
    select
        order_week,
        count(*)                                  as orders,
        round(avg(gross_revenue_dollars), 2)       as aov,
        round(avg(case when is_first_order
            then gross_revenue_dollars end), 2)   as aov_new_customers,
        round(avg(case when not is_first_order
            then gross_revenue_dollars end), 2)   as aov_repeat_customers,
        sum(case when is_first_order then 1 else 0 end)       as new_customer_orders,
        sum(case when not is_first_order then 1 else 0 end)   as repeat_orders,
        sum(case when promo_code is not null then 1 else 0 end) as promo_orders,
        round(avg(promo_discount_dollars), 2)     as avg_promo_discount,
        -- Channel breakdown
        sum(case when channel in ('google_ads','meta_ads') then 1 else 0 end) as paid_orders,
        sum(case when channel = 'direct' then 1 else 0 end)                  as direct_orders,
        sum(case when fulfillment_mode = 'delivery' then 1 else 0 end)       as delivery_orders
    from {{ ref('mart_orders') }}
    group by 1
),

-- Top channel per week
channel_ranked as (
    select
        order_week,
        channel,
        count(*)                                  as channel_orders,
        row_number() over (
            partition by order_week
            order by count(*) desc
        )                                         as _rn
    from {{ ref('mart_orders') }}
    group by 1, 2
),

top_channels as (
    select order_week, channel as top_channel
    from channel_ranked
    where _rn = 1
),

combined as (
    select
        coalesce(s.order_week, o.order_week)                  as order_week,
        coalesce(s.checkout_sessions, 0)                      as checkout_sessions,
        coalesce(s.paid_sessions, 0)                          as paid_sessions,
        case when coalesce(s.checkout_sessions, 0) > 0
            then round(100.0 * s.paid_sessions / s.checkout_sessions, 2)
            else 0
        end                                                   as checkout_cvr_pct,
        coalesce(s.abandoned_sessions, 0)                     as abandoned_sessions,
        case when coalesce(s.checkout_sessions, 0) > 0
            then round(100.0 * s.abandoned_sessions / s.checkout_sessions, 2)
            else 0
        end                                                   as abandon_rate_pct,
        coalesce(o.orders, 0)                                 as orders,
        coalesce(o.new_customer_orders, 0)                    as new_customer_orders,
        coalesce(o.repeat_orders, 0)                          as repeat_orders,
        o.aov,
        o.aov_new_customers,
        o.aov_repeat_customers,
        case when coalesce(o.orders, 0) > 0
            then round(100.0 * coalesce(o.promo_orders, 0) / o.orders, 1)
            else 0
        end                                                   as promo_order_pct,
        coalesce(o.avg_promo_discount, 0)                     as avg_promo_discount,
        tc.top_channel,
        case when coalesce(o.orders, 0) > 0
            then round(100.0 * coalesce(o.direct_orders, 0) / o.orders, 1)
            else 0
        end                                                   as direct_pct,
        case when coalesce(o.orders, 0) > 0
            then round(100.0 * coalesce(o.paid_orders, 0) / o.orders, 1)
            else 0
        end                                                   as paid_pct,
        case when coalesce(o.orders, 0) > 0
            then round(100.0 * coalesce(o.delivery_orders, 0) / o.orders, 1)
            else 0
        end                                                   as delivery_pct
    from sessions s
    full outer join orders o using (order_week)
    left join top_channels tc
        on tc.order_week = coalesce(s.order_week, o.order_week)
)

select * from combined
order by order_week desc
