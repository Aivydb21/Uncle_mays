/*
  stg_logrocket__sessions
  ------------------------
  One row per LogRocket session (REST mode) or one row per UTC day
  (Galileo summary mode, source = 'galileo_summary').
  3 rows as of 2026-05-26 — all are Galileo summary rows.
  Source: logrocket_raw.sessions (WRITE_TRUNCATE daily via logrocket.py).

  IMPORTANT: The LogRocket REST sessions API returns 404 (see UNC-1221),
  so current rows are Galileo-derived daily summaries. True per-session
  rows will appear once the REST issue is resolved. Until then:
  - session_id = NULL for summary rows
  - session_count, frustrated_user_count, device_type_breakdown, and
    entry_page_breakdown are populated for summary rows
  - per-session cols (duration_ms, page_count, etc.) are NULL for summaries

  Key decisions:
  - is_summary flag lets downstream models branch on row type
  - pulled_at is cast from STRING to TIMESTAMP
  - Galileo narrative stored in galileo_raw_answer for reference (not for
    joining — use stg_logrocket__galileo_briefings for structured Galileo data)
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/logrocket_sessions_*.parquet',
        union_by_name = true
    )
)

select
    session_id,
    coalesce(source, 'rest')                            as session_source,
    source = 'galileo_summary'                          as is_summary,
    try_cast(summary_date as date)                      as summary_date,
    try_cast(session_count as integer)                  as session_count,
    try_cast(frustrated_user_count as integer)          as frustrated_user_count,
    device_type_breakdown,
    entry_page_breakdown,
    galileo_raw_answer,
    galileo_chat_id,
    -- Per-session fields (NULL for summary rows)
    user_id,
    try_cast(started_at_ms as bigint)                   as started_at_ms,
    case
        when try_cast(started_at_ms as bigint) is not null
        then to_timestamp(try_cast(started_at_ms as bigint) / 1000.0)
    end                                                 as started_at,
    try_cast(duration_ms as bigint)                     as duration_ms,
    try_cast(page_count as integer)                     as page_count,
    try_cast(error_count as integer)                    as error_count,
    try_cast(rage_click_count as integer)               as rage_click_count,
    first_url,
    os_name,
    browser_name,
    country_code,
    device_type,
    try_cast(is_identified as boolean)                  as is_identified,
    try_cast(pulled_at as timestamp)                    as pulled_at,
    _date_bucket

from source

{% else %}

with src as (
    select *
    from `uncle-mays-automation`.`logrocket_raw`.`sessions`
)

select
    session_id,
    coalesce(source, 'rest')                            as session_source,
    source = 'galileo_summary'                          as is_summary,
    date(summary_date)                                  as summary_date,
    session_count,
    frustrated_user_count,
    device_type_breakdown,
    entry_page_breakdown,
    galileo_raw_answer,
    galileo_chat_id,
    user_id,
    cast(started_at_ms as int64)                        as started_at_ms,
    case
        when cast(started_at_ms as int64) is not null
        then timestamp_millis(cast(started_at_ms as int64))
    end                                                 as started_at,
    cast(duration_ms as int64)                          as duration_ms,
    cast(page_count as int64)                           as page_count,
    cast(error_count as int64)                          as error_count,
    cast(rage_click_count as int64)                     as rage_click_count,
    first_url,
    os_name,
    browser_name,
    country_code,
    device_type,
    cast(is_identified as bool)                         as is_identified,
    timestamp(pulled_at)                                as pulled_at,
    _date_bucket

from src

{% endif %}
