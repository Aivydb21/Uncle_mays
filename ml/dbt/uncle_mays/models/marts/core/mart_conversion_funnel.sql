/*
  mart_conversion_funnel
  ----------------------
  Session-grain conversion funnel from first touch to purchase.

  Grain: one row per GA4 session (user_pseudo_id + ga_session_id).

  Purpose: Expose step-level drop-off rates so paid media, UX, and
  product decisions are grounded in where users actually leave — not guesses.

  Steps tracked:
    1. session_start      — baseline; every trackable session has this
    2. page_view          — any page viewed
    3. view_item          — product detail page viewed
    4. add_to_cart        — item added to cart
                           (reliable from 2026-05-06 onward; commit dea0488
                            fixed silent drops before this date)
    5. begin_checkout     — checkout initiated
                           (checkout CTA overlay fixed 2026-05-06; commit 3bb8909)
    6. purchase           — order completed (Stripe PI succeeded)

  Attribution: taken from the session_start event; falls back to the
  earliest event in the session if session_start is absent. Mirrors
  the last-touch session logic used by mart_order_attribution.

  Channel logic: identical to mart_order_attribution so that funnel
  step CVRs and order attribution denominators are consistent.

  Data quality note:
    - Filter to event_date >= '2026-05-06' for clean funnel analysis.
      Before this date, add_to_cart and begin_checkout events are
      under-counted due to tracking bugs fixed on that date.
    - Sessions without ga_session_id are excluded (cannot be keyed).
*/

{{ config(materialized='table') }}

with sessions_raw as (
    select *
    from {{ ref('stg_ga4_events') }}
    where ga_session_id is not null
      and user_pseudo_id is not null
),

-- Derive session-level attribution from the session_start event.
-- If session_start is missing, fall back to the first seen value
-- across all events in the session.
session_attribution as (
    select
        user_pseudo_id,
        ga_session_id,
        coalesce(
            min(case when event_name = 'session_start' then manual_source   end),
            min(manual_source)
        )                                                       as manual_source,
        coalesce(
            min(case when event_name = 'session_start' then manual_medium   end),
            min(manual_medium)
        )                                                       as manual_medium,
        coalesce(
            min(case when event_name = 'session_start' then manual_campaign end),
            min(manual_campaign)
        )                                                       as manual_campaign,
        coalesce(
            min(case when event_name = 'session_start' then traffic_source  end),
            min(traffic_source)
        )                                                       as traffic_source,
        coalesce(
            min(case when event_name = 'session_start' then traffic_medium  end),
            min(traffic_medium)
        )                                                       as traffic_medium,
        coalesce(
            min(case when event_name = 'session_start' then gclid           end),
            min(gclid)
        )                                                       as gclid,
        -- device and geo from session_start; if absent, any event will do
        coalesce(
            min(case when event_name = 'session_start' then device_category end),
            min(device_category)
        )                                                       as device_category,
        coalesce(
            min(case when event_name = 'session_start' then geo_country     end),
            min(geo_country)
        )                                                       as geo_country,
        coalesce(
            min(case when event_name = 'session_start' then geo_region      end),
            min(geo_region)
        )                                                       as geo_region,
        coalesce(
            min(case when event_name = 'session_start' then geo_city        end),
            min(geo_city)
        )                                                       as geo_city
    from sessions_raw
    group by 1, 2
),

-- Session-level funnel step flags and timestamps
session_funnel as (
    select
        user_pseudo_id,
        ga_session_id,
        min(event_date)                                                              as session_date,
        max(case when event_name = 'session_start'  then true else false end)        as has_session_start,
        max(case when event_name = 'page_view'      then true else false end)        as has_page_view,
        max(case when event_name = 'view_item'      then true else false end)        as has_view_item,
        max(case when event_name = 'add_to_cart'    then true else false end)        as has_add_to_cart,
        max(case when event_name = 'begin_checkout' then true else false end)        as has_begin_checkout,
        max(case when event_name = 'purchase'       then true else false end)        as has_purchase,
        -- First occurrence timestamp for each funnel step
        min(case when event_name = 'session_start'  then event_ts end)              as session_start_ts,
        min(case when event_name = 'view_item'      then event_ts end)              as view_item_ts,
        min(case when event_name = 'add_to_cart'    then event_ts end)              as add_to_cart_ts,
        min(case when event_name = 'begin_checkout' then event_ts end)              as begin_checkout_ts,
        min(case when event_name = 'purchase'       then event_ts end)              as purchase_ts,
        -- Ecommerce fields from purchase event
        max(case when event_name = 'purchase' then transaction_id           end)    as transaction_id,
        sum(case when event_name = 'purchase' then coalesce(purchase_revenue_usd, 0.0) else 0.0 end)
                                                                                    as purchase_revenue_usd
    from sessions_raw
    group by 1, 2
),

final as (
    select
        -- Session key (surrogate)
        concat(
            f.user_pseudo_id, '-',
            cast(f.ga_session_id as string)
        )                                                               as session_key,
        f.user_pseudo_id,
        f.ga_session_id,
        f.session_date,

        -- Device / geo (from session_start attribution cte)
        a.device_category,
        a.geo_country,
        a.geo_region,
        a.geo_city,

        -- Attribution (UTM preferred; traffic_source as fallback)
        coalesce(a.manual_source,   a.traffic_source)                   as source,
        coalesce(a.manual_medium,   a.traffic_medium)                   as medium,
        a.manual_campaign                                               as campaign,
        a.gclid,

        -- Channel (mirrors mart_order_attribution for consistency)
        case
            when a.gclid is not null
                then 'google_ads'
            when coalesce(a.manual_medium, a.traffic_medium) = 'email'
                then 'email'
            when coalesce(a.manual_source, a.traffic_source)
                    in ('instagram', 'facebook', 'meta', 'ig')
                then 'organic_social'
            when coalesce(a.manual_source, a.traffic_source) = 'google'
                then 'organic_search'
            when coalesce(a.manual_medium, a.traffic_medium) = 'referral'
                then 'referral'
            when coalesce(a.manual_source, a.traffic_source) is not null
                then 'other'
            else 'direct'
        end                                                             as channel,

        -- Funnel step flags
        f.has_session_start,
        f.has_page_view,
        f.has_view_item,
        f.has_add_to_cart,
        f.has_begin_checkout,
        f.has_purchase,

        -- Funnel step timestamps
        f.session_start_ts,
        f.view_item_ts,
        f.add_to_cart_ts,
        f.begin_checkout_ts,
        f.purchase_ts,

        -- Seconds from session_start to each step (null if step not reached)
        case when f.add_to_cart_ts is not null then
            cast(
                {% if target.type == 'bigquery' %}
                unix_seconds(f.add_to_cart_ts) - unix_seconds(f.session_start_ts)
                {% else %}
                epoch(f.add_to_cart_ts) - epoch(f.session_start_ts)
                {% endif %}
            as int64)
        end                                                             as secs_to_add_to_cart,

        case when f.begin_checkout_ts is not null then
            cast(
                {% if target.type == 'bigquery' %}
                unix_seconds(f.begin_checkout_ts) - unix_seconds(f.session_start_ts)
                {% else %}
                epoch(f.begin_checkout_ts) - epoch(f.session_start_ts)
                {% endif %}
            as int64)
        end                                                             as secs_to_begin_checkout,

        case when f.purchase_ts is not null then
            cast(
                {% if target.type == 'bigquery' %}
                unix_seconds(f.purchase_ts) - unix_seconds(f.session_start_ts)
                {% else %}
                epoch(f.purchase_ts) - epoch(f.session_start_ts)
                {% endif %}
            as int64)
        end                                                             as secs_to_purchase,

        -- Ecommerce
        f.transaction_id,
        f.purchase_revenue_usd
    from session_funnel f
    left join session_attribution a
        on f.user_pseudo_id = a.user_pseudo_id
        and f.ga_session_id = a.ga_session_id
)

select * from final
