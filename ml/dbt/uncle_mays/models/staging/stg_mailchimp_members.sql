/*
  stg_mailchimp_members
  ---------------------
  One row per Mailchimp list member (unique by email_hash).
  Source: mailchimp_members_*.parquet (dev) or
          crm_raw.mailchimp_members (prod).

  NOTE: No BQ loader exists yet for Mailchimp. To run prod target,
  build ml/ingest/bigquery_crm_loader.py (mirrors bigquery_ads_loader.py)
  to write crm_raw.mailchimp_members via WRITE_TRUNCATE. File a
  child issue off UNC-890 to track this.

  Key decisions:
  - Dedup on email_hash, keeping the most recently changed record.
  - tags column is a comma-separated string in parquet. Exposed as-is;
    downstream tag filtering uses LIKE or a macro.
  - status values: subscribed, unsubscribed, cleaned, pending, transactional.
  - is_subscribed shortcut for the most common filter.
*/

{{
  config(
    materialized = 'view',
    enabled = var('crm_pipeline_live', false)
  )
}}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/mailchimp_members_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (
            partition by email_hash
            order by try_cast(last_changed_ts as timestamp) desc nulls last
        ) as _rn
    from source
)

select
    email_hash,
    -- Email is PII; carry it but downstream models should use email_hash.
    email,
    status,
    status = 'subscribed'                               as is_subscribed,
    try_cast(signup_ts as timestamp)                    as signup_ts,
    try_cast(opt_ts as timestamp)                       as opt_in_ts,
    try_cast(last_changed_ts as timestamp)              as last_changed_ts,
    try_cast(member_rating as tinyint)                  as member_rating,
    tags,
    try_cast(tag_count as smallint)                     as tag_count,
    try_cast(avg_open_rate as double)                   as avg_open_rate,
    try_cast(avg_click_rate as double)                  as avg_click_rate,
    country_code,
    region
from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`{{ var('crm_dataset') }}`.mailchimp_members
),

deduped as (
    select *,
        row_number() over (
            partition by email_hash
            order by last_changed_ts desc nulls last
        ) as _rn
    from source
)

select
    email_hash,
    email,
    status,
    status = 'subscribed'                               as is_subscribed,
    timestamp(signup_ts)                                as signup_ts,
    timestamp(opt_ts)                                   as opt_in_ts,
    timestamp(last_changed_ts)                          as last_changed_ts,
    member_rating,
    tags,
    tag_count,
    avg_open_rate,
    avg_click_rate,
    country_code,
    region
from deduped
where _rn = 1

{% endif %}
