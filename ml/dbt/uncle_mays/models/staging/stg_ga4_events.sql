/*
  stg_ga4_events
  --------------
  One row per GA4 event. Wraps the BigQuery daily-sharded export
  (`analytics_494626869.events_*`) in prod, and the flattened
  parquet snapshots (ga4_events_*.parquet) in dev.

  In prod, we flatten event_params inline — same SQL used by
  ml/ingest/bigquery_ga4.py, so schemas are guaranteed to match.
  In dev, the parquet is already flattened; all columns arrive as
  VARCHAR so we cast to native types here.

  Key decisions:
  - event_timestamp: microseconds since epoch in BQ; ISO string in parquet.
    Normalised to a TIMESTAMP column called `event_ts`.
  - event_date: YYYYMMDD string in both sources → DATE.
  - Nullability: many event_params are sparse by design (e.g. form_id
    only on form events). Downstream models should filter on event_name.
*/

{{
  config(
    materialized = 'view' if target.type == 'duckdb' else 'table',
    partition_by = {"field": "event_date", "data_type": "date"} if target.type == 'bigquery' else none
  )
}}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/ga4_events_*.parquet',
        union_by_name = true
    )
)

select
    -- Identity
    user_pseudo_id,
    user_id,
    stream_id,
    platform,

    -- Timing
    strptime(event_date, '%Y%m%d')::date                   as event_date,
    -- event_timestamp is microseconds since epoch as a string in parquet
    -- epoch_ms() expects milliseconds, so divide by 1000
    epoch_ms(try_cast(event_timestamp as bigint) // 1000)   as event_ts,

    -- Event
    event_name,

    -- Device
    device_category,
    device_os,
    device_browser,
    device_brand,

    -- Geo
    geo_country,
    geo_region,
    geo_city,
    geo_metro,

    -- Traffic source
    traffic_source,
    traffic_medium,
    traffic_name,
    manual_source,
    manual_medium,
    manual_campaign,
    manual_content,
    manual_term,
    gclid,
    session_campaign,

    -- Session
    try_cast(ga_session_id as bigint)                       as ga_session_id,
    try_cast(ga_session_number as bigint)                   as ga_session_number,
    try_cast(engagement_time_msec as bigint)                as engagement_time_msec,
    try_cast(is_entrance as boolean)                        as is_entrance,

    -- Page
    page_location,
    page_referrer,
    page_title,

    -- Form
    form_id,
    form_name,

    -- Ecommerce
    transaction_id,
    try_cast(purchase_revenue_usd as double)                as purchase_revenue_usd,
    try_cast(unique_items as bigint)                        as unique_items,
    item_id,
    item_name,
    try_cast(event_value as double)                         as event_value,
    currency,
    try_cast(quantity as bigint)                            as quantity,

    -- Click
    link_url

from source

{% else %}

-- BQ prod: read directly from the GA4 daily-sharded export and flatten
-- event_params in one pass, identical to ml/ingest/bigquery_ga4.py.
with source as (
    select
        parse_date('%Y%m%d', event_date)                            as event_date,
        timestamp_micros(event_timestamp)                           as event_ts,
        event_name,
        user_pseudo_id,
        user_id,
        stream_id,
        platform,
        device.category                                             as device_category,
        device.operating_system                                     as device_os,
        device.web_info.browser                                     as device_browser,
        device.mobile_brand_name                                    as device_brand,
        geo.country                                                 as geo_country,
        geo.region                                                  as geo_region,
        geo.city                                                    as geo_city,
        geo.metro                                                   as geo_metro,
        traffic_source.source                                       as traffic_source,
        traffic_source.medium                                       as traffic_medium,
        traffic_source.name                                         as traffic_name,
        collected_traffic_source.manual_source                      as manual_source,
        collected_traffic_source.manual_medium                      as manual_medium,
        collected_traffic_source.manual_campaign_name               as manual_campaign,
        collected_traffic_source.manual_content                     as manual_content,
        collected_traffic_source.manual_term                        as manual_term,
        collected_traffic_source.gclid                              as gclid,
        session_traffic_source_last_click.manual_campaign.campaign_name as session_campaign,
        ecommerce.transaction_id                                    as transaction_id,
        ecommerce.purchase_revenue_in_usd                          as purchase_revenue_usd,
        ecommerce.unique_items                                      as unique_items,
        (select value.string_value from unnest(event_params) where key = 'page_location')     as page_location,
        (select value.string_value from unnest(event_params) where key = 'page_referrer')     as page_referrer,
        (select value.string_value from unnest(event_params) where key = 'page_title')        as page_title,
        (select value.int_value    from unnest(event_params) where key = 'ga_session_id')     as ga_session_id,
        (select value.int_value    from unnest(event_params) where key = 'ga_session_number') as ga_session_number,
        (select value.int_value    from unnest(event_params) where key = 'engagement_time_msec') as engagement_time_msec,
        (select value.int_value    from unnest(event_params) where key = 'entrances')         as is_entrance,
        (select value.string_value from unnest(event_params) where key = 'form_id')           as form_id,
        (select value.string_value from unnest(event_params) where key = 'form_name')         as form_name,
        (select value.string_value from unnest(event_params) where key = 'link_url')          as link_url,
        (select value.string_value from unnest(event_params) where key = 'item_id')           as item_id,
        (select value.string_value from unnest(event_params) where key = 'item_name')         as item_name,
        (select value.double_value from unnest(event_params) where key = 'value')             as event_value,
        (select value.string_value from unnest(event_params) where key = 'currency')          as currency,
        (select value.int_value    from unnest(event_params) where key = 'quantity')          as quantity
    from `uncle-mays-automation.{{ var('ga4_dataset') }}.events_*`
)

select * from source

{% endif %}
