/*
  stg_ops__census_acs_zip
  ------------------------
  ACS 5-year census estimates by ZIP code. 45 rows as of 2026-05-26
  (Uncle May's Chicago delivery area).
  Source: ops_raw.census_acs_zip (WRITE_TRUNCATE; refreshed annually with new ACS vintage).

  Key decisions:
  - zip is the join key to customer shipping addresses in stg_stripe_payment_intents
  - Racial/ethnic composition columns renamed for clarity; pct_* columns are
    the household-level percentages from ACS (not population percentages)
  - This is a reference table used for market-area segmentation and targeting
    analysis. No PII.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/census_acs_zip_*.parquet',
        union_by_name = true
    )
)

select
    zip,
    try_cast(median_household_income as double)     as median_household_income,
    try_cast(total_population as double)            as total_population,
    try_cast(median_age as double)                  as median_age,
    try_cast(median_household_size as double)       as median_household_size,
    try_cast(black_pop as double)                   as black_pop,
    try_cast(white_pop as double)                   as white_pop,
    try_cast(hispanic_pop as double)                as hispanic_pop,
    try_cast(pct_black_households as double)        as pct_black_households,
    try_cast(pct_white_households as double)        as pct_white_households,
    try_cast(pct_hispanic_households as double)     as pct_hispanic_households

from source

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`ops_raw`.`census_acs_zip`
)

select
    zip,
    median_household_income,
    total_population,
    median_age,
    median_household_size,
    black_pop,
    white_pop,
    hispanic_pop,
    pct_black_households,
    pct_white_households,
    pct_hispanic_households

from source

{% endif %}
