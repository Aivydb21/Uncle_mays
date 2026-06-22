/*
  mart_logrocket_session_summary
  --------------------------------
  Daily session-level summary derived from LogRocket via Galileo MCP.

  Background (UNC-1221):
    The LogRocket REST /sessions endpoint returns 404. As a workaround,
    ml/ingest/logrocket.py --session-summary asks Galileo for structured
    session counts per UTC calendar day and writes 1 row per day to
    logrocket_raw.sessions with source = 'galileo_summary'.

  Grain: one row per UTC calendar day (summary_date).

  Key columns:
    summary_date             — UTC date of the sessions (DATE)
    session_count            — total sessions Galileo reported
    mobile_sessions          — mobile device sessions (parsed from JSON breakdown)
    desktop_sessions         — desktop/tablet sessions (parsed from JSON breakdown)
    home_sessions            — sessions entering at /
    shop_sessions            — sessions entering at /shop
    checkout_sessions        — sessions entering at /checkout
    other_sessions           — sessions entering at any other page
    frustrated_user_count    — users classified as frustrated by Galileo
    rage_click_count         — rage clicks recorded
    ga4_sessions             — GA4 sessions for the same day (for parity check)
    session_count_vs_ga4_pct — deviation of LR count from GA4 (NULL if no GA4 data)

  Acceptance criteria (UNC-1221):
    - At least 1 row per UTC day once the ingest runs
    - session_count within 30% of GA4 sessions for the same day

  Refresh: daily via dbt-daily-refresh Trigger.dev task.
*/

with

logrocket_raw as (

    select
        cast(summary_date as date)                           as summary_date,
        cast(session_count as int64)                         as session_count,
        cast(frustrated_user_count as int64)                 as frustrated_user_count,
        safe_cast(rage_click_count as int64)                 as rage_click_count,

        -- Device breakdown (stored as JSON string by the ingest script)
        safe_cast(
            json_extract_scalar(device_type_breakdown, '$.mobile') as int64
        )                                                    as mobile_sessions,
        safe_cast(
            json_extract_scalar(device_type_breakdown, '$.desktop') as int64
        )                                                    as desktop_sessions,

        -- Entry-page breakdown
        -- json_extract_scalar uses legacy JSONPath: keys with special chars
        -- (leading slash) require single-quoted brackets: $['/'] not $."/"
        safe_cast(
            json_extract_scalar(entry_page_breakdown, "$['/']") as int64
        )                                                    as home_sessions,
        safe_cast(
            json_extract_scalar(entry_page_breakdown, "$['/shop']") as int64
        )                                                    as shop_sessions,
        safe_cast(
            json_extract_scalar(entry_page_breakdown, "$['/checkout']") as int64
        )                                                    as checkout_sessions,
        safe_cast(
            json_extract_scalar(entry_page_breakdown, '$.other') as int64
        )                                                    as other_sessions,

        galileo_chat_id,
        pulled_at

    from {{ source('logrocket_raw', 'sessions') }}

    where source = 'galileo_summary'
      and summary_date is not null

),

ga4_daily as (

    -- Daily session count from GA4 for parity check.
    -- Uses the same event_date grain as mart_conversion_funnel.
    select
        parse_date('%Y%m%d', event_date)                    as event_date,
        count(distinct concat(user_pseudo_id, cast(
            (select value.int_value
             from unnest(event_params)
             where key = 'ga_session_id'
             limit 1) as string))
        )                                                    as ga4_sessions

    from {{ source('ga4', 'events_*') }}

    where _table_suffix >= format_date('%Y%m%d', date_sub(current_date(), interval 30 day))
      and event_name = 'session_start'

    group by 1

),

final as (

    select
        lr.summary_date,
        lr.session_count,
        lr.mobile_sessions,
        lr.desktop_sessions,
        lr.home_sessions,
        lr.shop_sessions,
        lr.checkout_sessions,
        lr.other_sessions,
        lr.frustrated_user_count,
        lr.rage_click_count,
        ga.ga4_sessions,
        case
            when ga.ga4_sessions is null or ga.ga4_sessions = 0 then null
            else round(
                (lr.session_count - ga.ga4_sessions) / ga.ga4_sessions * 100.0, 1
            )
        end                                                  as session_count_vs_ga4_pct,
        lr.galileo_chat_id,
        lr.pulled_at

    from logrocket_raw lr
    left join ga4_daily ga
        on lr.summary_date = ga.event_date

)

select * from final
