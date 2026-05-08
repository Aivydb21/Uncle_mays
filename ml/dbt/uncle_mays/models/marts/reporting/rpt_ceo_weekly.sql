/*
  rpt_ceo_weekly
  --------------
  CEO weekly review: revenue, orders, CAC, and customer acquisition trend.
  One row per week.

  Surfaces directly in BigQuery for a Sheets/Looker/DataStudio pull.
  In dev, queryable from DuckDB at ml/data/uncle_mays_dev.duckdb.

  Columns:
    order_week          — ISO week (Monday)
    total_revenue       — gross revenue
    order_count         — completed orders
    new_customers       — first-time buyers
    repeat_customers    — returning buyers
    new_customer_pct    — % of orders from new customers
    aov                 — average order value
    rolling_aov_28d     — trailing 28-day AOV
    meta_spend          — Meta Ads spend
    google_spend        — Google Ads spend
    total_paid_spend    — combined paid spend
    meta_roas           — Meta ROAS (revenue / spend, all orders in channel)
    google_roas         — Google ROAS
    blended_cac         — total paid spend / total new customers
*/

{{ config(materialized='table') }}

with weekly_orders as (
    select
        order_week,
        count(*)                                              as order_count,
        round(sum(gross_revenue_dollars), 2)                  as total_revenue,
        round(avg(gross_revenue_dollars), 2)                  as aov,
        round(avg(rolling_aov_28d), 2)                        as rolling_aov_28d,
        sum(case when is_first_order then 1 else 0 end)       as new_customers,
        sum(case when not is_first_order then 1 else 0 end)   as repeat_customers
    from {{ ref('mart_orders') }}
    group by order_week
),

weekly_spend as (
    select
        order_week,
        round(sum(case when channel = 'meta_ads'   then ad_spend_dollars else 0 end), 2) as meta_spend,
        round(sum(case when channel = 'google_ads' then ad_spend_dollars else 0 end), 2) as google_spend,
        round(sum(ad_spend_dollars), 2)                       as total_paid_spend
    from {{ ref('mart_cac') }}
    where ad_spend_dollars > 0
    group by order_week
),

weekly_channel_revenue as (
    select
        order_week,
        round(sum(case when channel = 'meta_ads'   then gross_revenue_dollars else 0 end), 2) as meta_revenue,
        round(sum(case when channel = 'google_ads' then gross_revenue_dollars else 0 end), 2) as google_revenue
    from {{ ref('mart_order_attribution') }}
    group by order_week
),

combined as (
    select
        coalesce(wo.order_week, ws.order_week)                as order_week,
        coalesce(wo.order_count, 0)                           as order_count,
        coalesce(wo.total_revenue, 0)                         as total_revenue,
        coalesce(wo.aov, 0)                                   as aov,
        wo.rolling_aov_28d,
        coalesce(wo.new_customers, 0)                         as new_customers,
        coalesce(wo.repeat_customers, 0)                      as repeat_customers,
        case when coalesce(wo.order_count, 0) > 0
            then round(
                100.0 * coalesce(wo.new_customers, 0)
                / coalesce(wo.order_count, 0), 1)
            else 0
        end                                                   as new_customer_pct,
        coalesce(ws.meta_spend, 0)                            as meta_spend,
        coalesce(ws.google_spend, 0)                          as google_spend,
        coalesce(ws.total_paid_spend, 0)                      as total_paid_spend,
        -- ROAS: channel revenue / channel spend
        case when coalesce(ws.meta_spend, 0) > 0
            then round(coalesce(wcr.meta_revenue, 0) / ws.meta_spend, 2)
            else null
        end                                                   as meta_roas,
        case when coalesce(ws.google_spend, 0) > 0
            then round(coalesce(wcr.google_revenue, 0) / ws.google_spend, 2)
            else null
        end                                                   as google_roas,
        -- Blended CAC: total paid spend / all new customers (cross-channel)
        case when coalesce(wo.new_customers, 0) > 0 and coalesce(ws.total_paid_spend, 0) > 0
            then round(ws.total_paid_spend / wo.new_customers, 2)
            else null
        end                                                   as blended_cac
    from weekly_orders wo
    full outer join weekly_spend ws using (order_week)
    left join weekly_channel_revenue wcr
        on wcr.order_week = coalesce(wo.order_week, ws.order_week)
)

select * from combined
order by order_week desc
