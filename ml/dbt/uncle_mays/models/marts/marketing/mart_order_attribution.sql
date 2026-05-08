/*
  mart_order_attribution
  ----------------------
  One row per completed order, enriched with the best-available
  session-level attribution from GA4 and Stripe payment metadata.

  **This is the canonical attribution table.** Every channel CAC and
  ROAS calculation in the company derives from this model.

  Attribution precedence (most to least reliable):
  1. Stripe PI metadata: utm_*, gclid, fbclid, fbc, fbp
     Captured at checkout initiation via JS → PaymentIntent.metadata.
     Available from 2026-05-03 onward (attribution fix).
  2. GA4 purchase event: traffic_source, manual_source/medium, gclid
     Joined via GA4 transaction_id = Stripe payment_intent_id.
     GA4 uses last-touch session attribution.
  3. Historical orders (pre-2026-05-03): attribution is null for
     most fields. Channel is derived from available signal (gclid,
     fbclid, utm_*). Direct/null → 'direct'.

  Grain: one row per payment_intent_id (succeeded, non-test).

  **Channel classification** (channel column):
    google_ads      → has_gclid = true
    meta_ads        → has_fbclid = true
    email           → utm_medium = 'email'
    organic_social  → utm_source in (instagram, facebook, meta)
    organic_search  → utm_source = 'google' AND NOT has_gclid
    direct          → no utm signal and no click id

  Note: ga_client_id is currently null in PI metadata (not yet wired
  to checkout flow as of 2026-05-07). GA4 join uses transaction_id
  instead. Once ga_client_id is wired, add a secondary join here.
*/

{{ config(materialized='table') }}

with orders as (
    select * from {{ ref('mart_orders') }}
),

-- GA4 purchase events carry transaction_id = Stripe payment_intent_id
-- and session-level attribution when Stripe PI metadata is null.
-- Deduplicate: GA4 parquet snapshots overlap — each purchase can appear
-- in multiple daily files. DISTINCT ON takes one row per transaction_id.
ga4_purchases as (
    select distinct on (transaction_id)
        transaction_id                           as payment_intent_id,
        user_pseudo_id,
        ga_session_id,
        ga_session_number,
        traffic_source                           as ga_traffic_source,
        traffic_medium                           as ga_traffic_medium,
        traffic_name                             as ga_traffic_name,
        manual_source                            as ga_manual_source,
        manual_medium                            as ga_manual_medium,
        manual_campaign                          as ga_manual_campaign,
        gclid                                    as ga_gclid,
        device_category,
        device_os,
        device_browser,
        geo_country,
        geo_region,
        geo_city,
        event_date                               as ga_event_date,
        event_ts                                 as ga_event_ts
    from {{ ref('stg_ga4_events') }}
    where event_name = 'purchase'
      and transaction_id is not null
    order by transaction_id, event_ts desc
),

attribution as (
    select
        o.payment_intent_id,
        o.ordered_at,
        o.order_date,
        o.order_week,
        o.order_month,

        -- Customer identity (privacy-safe)
        o.email_hash,
        o.customer_id,
        o.is_first_order                         as is_new_customer,

        -- Order value
        o.gross_revenue_dollars,
        o.subtotal_dollars,
        o.discount_dollars,
        o.promo_code,
        o.promo_discount_dollars,
        o.line_count,

        -- Stripe-native attribution (highest priority — populated post-2026-05-03)
        o.utm_source,
        o.utm_medium,
        o.utm_campaign,
        o.utm_content,
        o.utm_term,
        o.gclid,
        o.fbclid,
        o.fbc,
        o.fbp,
        o.has_gclid,
        o.has_fbclid,

        -- GA4 session attribution (populated when GA4 purchase event exists)
        g.user_pseudo_id,
        g.ga_session_id,
        -- Effective source: prefer Stripe PI (post-fix), fall back to GA4
        coalesce(o.utm_source, g.ga_manual_source, g.ga_traffic_source)   as effective_source,
        coalesce(o.utm_medium, g.ga_manual_medium, g.ga_traffic_medium)   as effective_medium,
        coalesce(o.utm_campaign, g.ga_manual_campaign, g.ga_traffic_name) as effective_campaign,
        coalesce(o.gclid, g.ga_gclid)                                     as effective_gclid,

        -- Channel (same logic as mart_orders, but uses effective_* fallbacks)
        case
            when coalesce(o.has_gclid, false) or g.ga_gclid is not null
                then 'google_ads'
            when coalesce(o.has_fbclid, false)
                then 'meta_ads'
            when coalesce(o.utm_medium, g.ga_manual_medium, g.ga_traffic_medium) = 'email'
                then 'email'
            when coalesce(o.utm_source, g.ga_manual_source, g.ga_traffic_source)
                    in ('instagram', 'facebook', 'meta', 'ig')
                then 'organic_social'
            when coalesce(o.utm_source, g.ga_manual_source, g.ga_traffic_source) = 'google'
                then 'organic_search'
            when coalesce(o.utm_medium, g.ga_manual_medium, g.ga_traffic_medium) = 'referral'
                then 'referral'
            else 'direct'
        end                                                                as channel,

        -- GA4 device & geo (when available)
        g.device_category,
        g.device_os,
        g.device_browser,
        g.geo_country,
        g.geo_region,
        g.geo_city,

        -- Checkout
        o.fulfillment_mode,
        o.shipping_city,
        o.shipping_state,
        o.shipping_zip,

        -- GA4 event presence flag
        g.payment_intent_id is not null          as has_ga4_event

    from orders o
    left join ga4_purchases g using (payment_intent_id)
)

select * from attribution
