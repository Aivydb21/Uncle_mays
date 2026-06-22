/*
  stg_logrocket__galileo_briefings
  ---------------------------------
  One row per Galileo on-demand query. 22 rows as of 2026-05-26.
  Source: logrocket_galileo.briefings (WRITE_TRUNCATE daily via logrocket.py).

  Key decisions:
  - chat_id is the stable identifier for a Galileo conversation thread
  - prompt_id is unique per individual query within a thread
  - answer is the raw Galileo narrative (unstructured text)
  - links is a JSON string of session URLs cited by Galileo
  - status: 'complete' = answer available; anything else = pending/error
  - pulled_at is cast from STRING to TIMESTAMP
  - This model is the source of truth for structured Galileo output in dbt.
    Downstream marts join on chat_id to correlate Galileo insights with
    revenue and retention metrics.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/logrocket_galileo_briefings_*.parquet',
        union_by_name = true
    )
)

select
    prompt_id,
    chat_id,
    prompt_version,
    query,
    answer,
    status,
    status = 'complete'                         as is_complete,
    try_cast(duration_ms as integer)            as duration_ms,
    links,
    try_cast(poll_count as integer)             as poll_count,
    try_cast(pulled_at as timestamp)            as pulled_at,
    _date_bucket

from source

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`logrocket_galileo`.`briefings`
)

select
    prompt_id,
    chat_id,
    prompt_version,
    query,
    answer,
    status,
    status = 'complete'                         as is_complete,
    duration_ms,
    links,
    poll_count,
    timestamp(pulled_at)                        as pulled_at,
    _date_bucket

from source

{% endif %}
