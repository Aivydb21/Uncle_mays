/*
  stg_crm__apollo_contacts
  -------------------------
  One row per Apollo.io contact (B2B prospecting / BD outreach).
  3,347 rows as of 2026-05-26.
  Source: crm_raw.apollo_contacts (WRITE_TRUNCATE daily via bigquery_crm_loader.py).

  Key decisions:
  - These are BD targets, NOT customers. Do not join to stg_stripe_customers
    without careful matching — overlap should be low.
  - email_hash is the stable join key; email is PII.
  - labels is a STRING (comma-separated tag list from Apollo); split downstream
    if per-label analysis is needed.
  - No timestamp column in source → no freshness check possible in dbt source.
    Rely on ingest run logs for freshness confirmation.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/apollo_contacts_*.parquet',
        union_by_name = true
    )
)

select
    apollo_id,
    email_hash,
    email,
    first_name,
    last_name,
    coalesce(first_name, '') || ' ' || coalesce(last_name, '')  as full_name,
    title,
    seniority,
    city,
    state,
    country,
    linkedin_url,
    org_name,
    org_website,
    org_industry,
    labels

from source

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`crm_raw`.`apollo_contacts`
)

select
    apollo_id,
    email_hash,
    email,
    first_name,
    last_name,
    concat(coalesce(first_name, ''), ' ', coalesce(last_name, ''))  as full_name,
    title,
    seniority,
    city,
    state,
    country,
    linkedin_url,
    org_name,
    org_website,
    org_industry,
    labels

from source

{% endif %}
