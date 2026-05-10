/*
  stg_meta_campaign_insights
  --------------------------
  One row per Meta (Facebook/Instagram) campaign per day.
  Source: meta_campaign_insights_*.parquet (dev) or
          ads_raw.meta_campaign_insights (prod, loaded by
          ml/ingest/bigquery_ads_loader.py via WRITE_TRUNCATE).

  Key decisions:
  - spend_usd is already in dollars in the raw data (Meta API returns
    USD spend directly).
  - Derived cost_per_purchase_usd = spend_usd / purchases; NULL when
    purchases = 0 to avoid division errors.
  - ctr, cpc, cpm come from the Meta API as pre-computed rates; we
    expose them as-is (no re-derivation risk).
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/meta_campaign_insights_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by campaign_id, date order by date desc) as _rn
    from source
)

select
    campaign_id,
    campaign_name,
    try_cast(date as date)                              as report_date,
    try_cast(impressions as bigint)                     as impressions,
    try_cast(clicks as bigint)                          as clicks,
    try_cast(reach as bigint)                           as reach,
    try_cast(frequency as double)                       as frequency,
    try_cast(spend_usd as double)                       as spend_usd,
    try_cast(ctr as double)                             as ctr,
    try_cast(cpc as double)                             as cpc_usd,
    try_cast(cpm as double)                             as cpm_usd,
    try_cast(purchases as double)                       as purchases,
    try_cast(purchase_value_usd as double)              as purchase_value_usd,
    try_cast(initiate_checkout as double)               as initiate_checkout,
    try_cast(add_to_cart as double)                     as add_to_cart,
    try_cast(view_content as double)                    as view_content,
    -- Derived
    case
        when try_cast(purchases as double) > 0
        then try_cast(spend_usd as double) / try_cast(purchases as double)
        else null
    end                                                 as cost_per_purchase_usd
from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`{{ var('ads_dataset') }}`.meta_campaign_insights
)

select
    campaign_id,
    campaign_name,
    date(date)                                          as report_date,
    impressions,
    clicks,
    reach,
    frequency,
    spend_usd,
    ctr,
    cpc                                                 as cpc_usd,
    cpm                                                 as cpm_usd,
    purchases,
    purchase_value_usd,
    initiate_checkout,
    add_to_cart,
    view_content,
    case
        when purchases > 0 then spend_usd / purchases
        else null
    end                                                 as cost_per_purchase_usd
from source

{% endif %}
