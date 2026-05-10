/*
  stg_resend_emails
  -----------------
  One row per Resend email send (unique by email_id).
  Source: resend_emails_*.parquet (dev) or
          crm_raw.resend_emails (prod).

  NOTE: No BQ loader exists yet for Resend. See note in
  stg_mailchimp_members.sql — same BQ loader task covers both.

  Key decisions:
  - email_id is the Resend UUID; it is the natural unique key.
  - `to` is PII; to_hash (sha256[:24]) is used for joins.
  - last_event values: sent, delivered, opened, clicked, bounced,
    complained, unsubscribed. Mapped to a numeric delivery_stage
    (0=sent, 1=delivered, 2=opened, 3=clicked) to simplify funnel
    analysis.
  - tag_type / tag_session / tag_step come from Resend email tags set
    at send time; they identify which drip step triggered this send.
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
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/resend_emails_*.parquet',
        union_by_name = true
    )
),

deduped as (
    select *,
        row_number() over (partition by email_id order by created_at desc) as _rn
    from source
)

select
    email_id,
    try_cast(created_at as timestamp)                   as sent_at,
    to_hash,
    -- `from` is a reserved word in SQL; alias immediately
    "from"                                              as from_address,
    subject,
    last_event,
    -- Delivery stage ladder (higher = further in funnel)
    case last_event
        when 'sent'           then 0
        when 'delivered'      then 1
        when 'opened'         then 2
        when 'clicked'        then 3
        when 'bounced'        then -1
        when 'complained'     then -2
        when 'unsubscribed'   then -3
        else null
    end                                                 as delivery_stage,
    last_event in ('bounced', 'complained')             as is_hard_negative,
    last_event = 'delivered'                            as is_delivered,
    last_event in ('opened', 'clicked')                 as is_engaged,
    tag_type,
    tag_session,
    tag_step,
    date_trunc('day', try_cast(created_at as timestamp)) as sent_date
from deduped
where _rn = 1

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`{{ var('crm_dataset') }}`.resend_emails
),

deduped as (
    select *,
        row_number() over (partition by email_id order by created_at desc) as _rn
    from source
)

select
    email_id,
    created_at                                          as sent_at,
    to_hash,
    from_address,
    subject,
    last_event,
    case last_event
        when 'sent'           then 0
        when 'delivered'      then 1
        when 'opened'         then 2
        when 'clicked'        then 3
        when 'bounced'        then -1
        when 'complained'     then -2
        when 'unsubscribed'   then -3
        else null
    end                                                 as delivery_stage,
    last_event in ('bounced', 'complained')             as is_hard_negative,
    last_event = 'delivered'                            as is_delivered,
    last_event in ('opened', 'clicked')                 as is_engaged,
    tag_type,
    tag_session,
    tag_step,
    date(created_at)                                    as sent_date
from deduped
where _rn = 1

{% endif %}
