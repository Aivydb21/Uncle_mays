/*
  stg_gads_campaign_insights
  --------------------------
  One row per Google Ads campaign per day.
  Source: google_ads_campaign_insights_*.parquet (dev) or
          ads_raw.google_ads_campaign_insights (prod, loaded by
          ml/ingest/bigquery_ads_loader.py via WRITE_TRUNCATE).

  Key decisions:
  - cost_micros (raw Google Ads unit: 1/1,000,000 of a dollar) is cast
    to spend_usd = cost_micros / 1,000,000. The raw column is also
    retained for auditability.
  - average_cpc_usd is pre-computed by the Google Ads API; we expose it
    directly.
  - campaign_status: ENABLED | PAUSED | REMOVED.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/google_ads_campaign_insights_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by campaign_id, date order by date desc) as _rn
    from source
)

select
    try_cast(campaign_id as varchar)                    as campaign_id,
    campaign_name,
    campaign_status,
    channel_type,
    try_cast(date as date)                              as report_date,
    try_cast(impressions as bigint)                     as impressions,
    try_cast(clicks as bigint)                          as clicks,
    try_cast(cost_micros as bigint)                     as cost_micros,
    try_cast(spend_usd as double)                       as spend_usd,
    try_cast(conversions as double)                     as conversions,
    try_cast(conversion_value as double)                as conversion_value_usd,
    try_cast(ctr as double)                             as ctr,
    try_cast(average_cpc_usd as double)                 as average_cpc_usd,
    -- Derived
    case
        when try_cast(conversions as double) > 0
        then try_cast(spend_usd as double) / try_cast(conversions as double)
        else null
    end                                                 as cost_per_conversion_usd
from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`{{ var('ads_dataset') }}`.google_ads_campaign_insights
)

select
    cast(campaign_id as string)                         as campaign_id,
    campaign_name,
    campaign_status,
    channel_type,
    date(date)                                          as report_date,
    impressions,
    clicks,
    cost_micros,
    spend_usd,
    conversions,
    conversion_value                                    as conversion_value_usd,
    ctr,
    average_cpc_usd,
    case
        when conversions > 0 then spend_usd / conversions
        else null
    end                                                 as cost_per_conversion_usd
from source

{% endif %}
