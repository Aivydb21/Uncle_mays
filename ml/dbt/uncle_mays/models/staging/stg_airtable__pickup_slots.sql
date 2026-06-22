/*
  stg_airtable__pickup_slots
  ---------------------------
  One row per pickup window slot. 12 rows as of 2026-05-26.
  Source: airtable_raw.pickup_slots (WRITE_TRUNCATE daily via airtable_loader.py).

  Key decisions:
  - capacity_remaining = capacity - booked (may go negative if oversold; flag it)
  - startsat / endsat are STRING in source — cast to TIMESTAMP here
  - active = false rows are retained so we can track historical slot utilisation
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/airtable_pickup_slots_*.parquet',
        union_by_name = true
    )
)

select
    airtable_id                                     as slot_id,
    slotid                                          as slot_label,
    locationlabel                                   as location_label,
    active                                          as is_active,
    try_cast(booked as integer)                     as bookings,
    try_cast(capacity as integer)                   as capacity,
    (try_cast(capacity as integer) - try_cast(booked as integer))
                                                    as capacity_remaining,
    try_cast(capacity as integer) > 0
        and try_cast(booked as integer) >= try_cast(capacity as integer)
                                                    as is_full,
    try_cast(startsat as timestamp)                 as starts_at,
    try_cast(endsat as timestamp)                   as ends_at,
    try_cast(created_time as timestamp)             as created_at

from source

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`airtable_raw`.`pickup_slots`
)

select
    airtable_id                                     as slot_id,
    slotid                                          as slot_label,
    locationlabel                                   as location_label,
    active                                          as is_active,
    booked                                          as bookings,
    capacity,
    (capacity - booked)                             as capacity_remaining,
    capacity > 0 and booked >= capacity             as is_full,
    timestamp(startsat)                             as starts_at,
    timestamp(endsat)                               as ends_at,
    timestamp(created_time)                         as created_at

from source

{% endif %}
