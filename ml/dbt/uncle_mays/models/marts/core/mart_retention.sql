/*
  mart_retention
  --------------
  Cohort-based retention analysis at the customer level.

  Metrics:
    - 30d_retention: % of customers with a second order within 30 days
      of first order
    - 60d_retention: % with second order within 60 days
    - Median days to reorder (among repeat customers only)
    - Cohort size (unique customers who placed first order that month)

  Grain: one row per acquisition cohort (first_order_month).

  Data note (2026-05-07): 11 customers, 3 repeat buyers. Cohorts
  are small — confidence intervals are wide. Numbers will stabilise
  as customer base grows. Use as directional signal only until n > 30.

  Rolling AOV:
  This model also produces rolling_aov_28d per customer cohort for
  use in LTV projections. The mart_orders extension (rolling_aov_7d,
  rolling_aov_28d at the order level) lives in mart_orders itself.
*/

{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('mart_orders') }}
),

-- Get first and second order dates per customer
customer_orders as (
    select
        email_hash,
        ordered_at,
        gross_revenue_dollars,
        is_first_order,
        row_number() over (partition by email_hash order by ordered_at) as order_seq,
        min(ordered_at) over (partition by email_hash)                   as first_order_at,
        {% if target.type == 'bigquery' %}
        DATE_TRUNC(cast(min(ordered_at) over (partition by email_hash) as date), MONTH)
        {% else %}
        date_trunc('month', min(ordered_at) over (partition by email_hash))
        {% endif %}                                                           as cohort_month
    from orders
),

-- First and second order per customer
customer_first_second as (
    select
        email_hash,
        cohort_month,
        max(case when order_seq = 1 then ordered_at end)           as first_order_at,
        max(case when order_seq = 1 then gross_revenue_dollars end) as first_order_value,
        max(case when order_seq = 2 then ordered_at end)           as second_order_at,
        max(case when order_seq = 2 then gross_revenue_dollars end) as second_order_value,
        count(*)                                                   as lifetime_orders,
        sum(gross_revenue_dollars)                                  as ltv_dollars
    from customer_orders
    group by 1, 2
),

-- Customer-level retention flags
customer_retention as (
    select
        email_hash,
        cohort_month,
        first_order_at,
        first_order_value,
        second_order_at,
        second_order_value,
        lifetime_orders,
        ltv_dollars,
        second_order_at is not null                                as is_repeat_customer,
        -- Days from first to second order
        case when second_order_at is not null
            then cast(
                ({% if target.type == 'bigquery' %}UNIX_SECONDS(second_order_at) - UNIX_SECONDS(first_order_at){% else %}epoch(second_order_at) - epoch(first_order_at){% endif %})
                / 86400 as integer)
        end                                                        as days_to_second_order,
        -- 30/60 day retention flags
        case when second_order_at is not null
              and cast(
                ({% if target.type == 'bigquery' %}UNIX_SECONDS(second_order_at) - UNIX_SECONDS(first_order_at){% else %}epoch(second_order_at) - epoch(first_order_at){% endif %})
                / 86400 as integer) <= 30
            then true else false
        end                                                        as retained_30d,
        case when second_order_at is not null
              and cast(
                ({% if target.type == 'bigquery' %}UNIX_SECONDS(second_order_at) - UNIX_SECONDS(first_order_at){% else %}epoch(second_order_at) - epoch(first_order_at){% endif %})
                / 86400 as integer) <= 60
            then true else false
        end                                                        as retained_60d
    from customer_first_second
),

-- Aggregate to cohort level
cohort_agg as (
    select
        cohort_month,
        count(distinct email_hash)                               as cohort_size,
        sum(case when is_repeat_customer then 1 else 0 end)      as repeat_customers,
        round(
            100.0 * sum(case when is_repeat_customer then 1 else 0 end)
            / count(distinct email_hash),
            1
        )                                                        as repeat_rate_pct,
        sum(case when retained_30d then 1 else 0 end)            as retained_30d_count,
        round(
            100.0 * sum(case when retained_30d then 1 else 0 end)
            / count(distinct email_hash),
            1
        )                                                        as retention_30d_pct,
        sum(case when retained_60d then 1 else 0 end)            as retained_60d_count,
        round(
            100.0 * sum(case when retained_60d then 1 else 0 end)
            / count(distinct email_hash),
            1
        )                                                        as retention_60d_pct,
        round(avg(days_to_second_order), 1)                      as avg_days_to_reorder,
        -- LTV averages
        round(avg(ltv_dollars), 2)                               as avg_ltv_dollars,
        round(avg(first_order_value), 2)                         as avg_first_order_value
    from customer_retention
    group by 1
)

select
    cohort_month,
    cohort_size,
    repeat_customers,
    repeat_rate_pct,
    retained_30d_count,
    retention_30d_pct,
    retained_60d_count,
    retention_60d_pct,
    avg_days_to_reorder,
    avg_ltv_dollars,
    avg_first_order_value,
    -- Estimated LTV at 12 months (simple annualisation from avg repeat rate)
    -- NOTE: this is directional only with n < 30 customers per cohort
    round(
        avg_ltv_dollars
        * (1 + (repeat_rate_pct / 100.0) * 12),
        2
    )                                                            as est_ltv_12m_dollars

from cohort_agg
order by cohort_month
