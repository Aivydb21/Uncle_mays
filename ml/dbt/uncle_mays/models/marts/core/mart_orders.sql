/*
  mart_orders
  -----------
  One row per completed order (PaymentIntent.status = 'succeeded').
  This is the revenue fact table — the authoritative source for:
    - AOV (average order value)
    - Weekly / monthly revenue
    - Retention / repeat purchase analysis
    - Attribution reporting (which channel drove each sale)

  Grain: one row per payment_intent_id where is_succeeded = true.
  Join key to checkout sessions: payment_intent_id.

  Data note (2026-05-02): 33 succeeded PIs, 5 unique customers.
  84.8% of orders are from repeat customers (2 high-frequency buyers
  with 18 and 9 orders respectively).
*/

{{ config(materialized='table') }}

with pi as (
    select * from {{ ref('stg_stripe_payment_intents') }}
    where is_succeeded = true
      and (is_test = false or is_test is null)
),

cs as (
    select * from {{ ref('stg_stripe_checkout_sessions') }}
    where is_converted = true
),

orders as (
    select
        pi.payment_intent_id,
        pi.created_at                                    as ordered_at,
        pi.created_date                                  as order_date,
        pi.created_week                                  as order_week,
        pi.created_month                                 as order_month,

        -- Customer identity
        pi.customer_id,
        coalesce(pi.email, cs.customer_email)            as customer_email,
        -- Derive email_hash from checkout session email when PI email_hash is null
        -- (older orders where PI had no email — CS customer_email is the fallback)
        coalesce(
            pi.email_hash,
            case when cs.customer_email is not null
                 then left(sha256(lower(trim(cs.customer_email))), 24)
            end
        )                                                as email_hash,
        coalesce(pi.customer_name, cs.customer_name)     as customer_name,

        -- Order financials
        pi.amount_received_dollars                       as gross_revenue_dollars,
        pi.subtotal_dollars,
        pi.discount_dollars,
        pi.shipping_dollars,
        pi.tax_dollars,
        pi.promo_code,
        pi.promo_discount_dollars,

        -- Product / fulfillment
        pi.product,
        pi.product_name,
        pi.fulfillment_mode,
        pi.pickup_slot,
        pi.line_count,
        pi.line_items_summary,
        pi.cart_json,

        -- Shipping address
        coalesce(pi.shipping_city, cs.shipping_city)     as shipping_city,
        coalesce(pi.shipping_state, cs.shipping_state)   as shipping_state,
        coalesce(pi.shipping_zip, cs.shipping_zip)       as shipping_zip,

        -- Attribution (UTM)
        coalesce(pi.utm_source, cs.metadata_utm_source)  as utm_source,
        coalesce(pi.utm_medium, cs.metadata_utm_medium)  as utm_medium,
        coalesce(pi.utm_campaign, cs.metadata_utm_campaign) as utm_campaign,
        pi.utm_content,
        pi.utm_term,

        -- Attribution (ad platform click IDs)
        pi.gclid,
        pi.fbclid,
        pi.fbc,
        pi.fbp,
        pi.has_gclid,
        pi.has_fbclid,

        -- Channel classification (best-effort; marketing mart has richer logic)
        case
            when pi.has_gclid then 'google_ads'
            when pi.has_fbclid then 'meta_ads'
            when coalesce(pi.utm_medium, '') = 'email' then 'email'
            when coalesce(pi.utm_source, '') in ('instagram', 'facebook', 'meta') then 'organic_social'
            when coalesce(pi.utm_source, '') = 'google' then 'organic_search'
            when coalesce(pi.utm_medium, '') = 'referral' then 'referral'
            when coalesce(pi.utm_source, '') = '' or pi.utm_source is null then 'direct'
            else 'other'
        end                                              as channel,

        -- Payment
        pi.card_brand,
        pi.card_funding,

        -- Repeat purchase flag
        pi.is_first_payment                              as is_first_order,

        -- Checkout session link
        cs.checkout_session_id

    from pi
    left join cs using (payment_intent_id)
)

select * from orders
