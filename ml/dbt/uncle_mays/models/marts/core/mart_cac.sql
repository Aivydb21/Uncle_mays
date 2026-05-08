/*
  mart_cac
  --------
  Customer Acquisition Cost by channel by week.

  Formula: CAC = total_ad_spend_dollars / new_customers_acquired
  where new_customers_acquired = orders with is_first_order = true

  Sources:
    - Ad spend: stg_meta_campaign_insights + stg_gads_campaign_insights
      Aggregated to weekly totals per platform (channel).
    - New customers: mart_order_attribution filtered to is_new_customer = true
      Grouped by order_week + channel.

  Data notes (2026-05-07):
    - Ad spend data available from 2026-04-24 onward (campaign launch).
    - Most historical orders lack UTM/click attribution → channel = 'direct'.
      Direct has $0 ad spend by definition → CAC = 0 (not undefined).
    - Google and Meta campaigns active as of the attribution-fix date
      (2026-05-03). Pre-fix orders show gclid/fbclid but no UTM.
    - ROAS = gross_revenue_dollars / ad_spend_dollars; NULL when spend = 0.

  Grain: one row per channel per order_week.
*/

{{ config(materialized='table') }}

-- Aggregate Meta Ads spend to weekly totals
with meta_weekly as (
    select
        date_trunc('week', report_date)          as spend_week,
        'meta_ads'                               as channel,
        sum(spend_usd)                           as spend_dollars
    from {{ ref('stg_meta_campaign_insights') }}
    group by 1, 2
),

-- Aggregate Google Ads spend to weekly totals
gads_weekly as (
    select
        date_trunc('week', report_date)          as spend_week,
        'google_ads'                             as channel,
        sum(spend_usd)                           as spend_dollars
    from {{ ref('stg_gads_campaign_insights') }}
    group by 1, 2
),

-- Combine all paid channels
all_spend as (
    select * from meta_weekly
    union all
    select * from gads_weekly
),

-- New customer acquisitions from attribution mart, weekly by channel
new_customer_acquisitions as (
    select
        order_week,
        channel,
        count(*)                                 as new_customers,
        sum(gross_revenue_dollars)               as new_customer_revenue_dollars
    from {{ ref('mart_order_attribution') }}
    where is_new_customer = true
    group by 1, 2
),

-- All-channel order stats (new + repeat) for ROAS denominator
all_channel_orders as (
    select
        order_week,
        channel,
        count(*)                                 as total_orders,
        sum(gross_revenue_dollars)               as total_revenue_dollars
    from {{ ref('mart_order_attribution') }}
    group by 1, 2
),

-- Build the full channel × week spine from both spend and orders
channel_weeks as (
    select distinct spend_week as week, channel from all_spend
    union
    select distinct order_week as week, channel from new_customer_acquisitions
),

combined as (
    select
        cw.week                                  as order_week,
        cw.channel,
        coalesce(s.spend_dollars, 0)             as ad_spend_dollars,
        coalesce(nca.new_customers, 0)           as new_customers,
        coalesce(nca.new_customer_revenue_dollars, 0) as new_customer_revenue_dollars,
        coalesce(ao.total_orders, 0)             as total_orders,
        coalesce(ao.total_revenue_dollars, 0)    as total_revenue_dollars
    from channel_weeks cw
    left join all_spend s
        on s.spend_week = cw.week
        and s.channel = cw.channel
    left join new_customer_acquisitions nca
        on nca.order_week = cw.week
        and nca.channel = cw.channel
    left join all_channel_orders ao
        on ao.order_week = cw.week
        and ao.channel = cw.channel
)

select
    order_week,
    channel,
    ad_spend_dollars,
    new_customers,
    new_customer_revenue_dollars,
    total_orders,
    total_revenue_dollars,
    -- CAC: spend / new customers; NULL when no new customers (avoid ÷0)
    case
        when new_customers > 0
        then round(ad_spend_dollars / new_customers, 2)
        else null
    end                                          as cac_dollars,
    -- ROAS: revenue / spend; NULL when no spend (avoid ÷0)
    case
        when ad_spend_dollars > 0
        then round(total_revenue_dollars / ad_spend_dollars, 2)
        else null
    end                                          as roas,
    -- New customer ROAS: value from first-time buyers only
    case
        when ad_spend_dollars > 0
        then round(new_customer_revenue_dollars / ad_spend_dollars, 2)
        else null
    end                                          as new_customer_roas

from combined
order by order_week desc, ad_spend_dollars desc
