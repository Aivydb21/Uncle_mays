/*
  stg_airtable__catalog
  ----------------------
  One row per Airtable catalog SKU. 47 rows as of 2026-05-26.
  Source: airtable_raw.catalog (WRITE_TRUNCATE daily via airtable_loader.py).

  Key decisions:
  - price_dollars = priceoverridecents / 100.0  (the customer-facing price)
  - cost_dollars  = costcents / 100.0            (COGS; used in margin math)
  - active filter is deliberately NOT applied here — marts decide whether
    to restrict to active SKUs so historical analysis still works.
  - priceoverridecents of 0 (or null) means "price not set" for that SKU;
    those rows will have price_dollars = 0. Downstream models should filter
    where price_dollars > 0 when computing revenue or margin.
*/

{{ config(materialized='view') }}

{% if target.type == 'duckdb' %}

with source as (
    select *
    from read_parquet(
        '{{ env_var("DBT_DATA_DIR", "../../data/raw") }}/airtable_catalog_*.parquet',
        union_by_name = true
    )
)

select
    airtable_id                                         as catalog_id,
    sku,
    name                                                as product_name,
    category,
    unit,
    unitlabel                                           as unit_label,
    active                                              as is_active,
    taxcategory                                         as tax_category,
    sortorder                                           as sort_order,
    defaultaddqty                                       as default_add_qty,
    coalesce(try_cast(priceoverridecents as double), 0) / 100.0   as price_dollars,
    coalesce(try_cast(costcents as double), 0) / 100.0            as cost_dollars,
    -- gross margin per unit (only meaningful when both price and cost are set)
    case
        when try_cast(priceoverridecents as double) > 0
         and try_cast(costcents as double) > 0
        then (try_cast(priceoverridecents as double) - try_cast(costcents as double))
             / try_cast(priceoverridecents as double)
    end                                                 as gross_margin_pct,
    imageurl                                            as image_url,
    try_cast(created_time as timestamp)                 as created_at

from source

{% else %}

with source as (
    select *
    from `uncle-mays-automation`.`airtable_raw`.`catalog`
)

select
    airtable_id                                         as catalog_id,
    sku,
    name                                                as product_name,
    category,
    unit,
    unitlabel                                           as unit_label,
    active                                              as is_active,
    taxcategory                                         as tax_category,
    sortorder                                           as sort_order,
    defaultaddqty                                       as default_add_qty,
    coalesce(priceoverridecents, 0) / 100.0             as price_dollars,
    coalesce(costcents, 0) / 100.0                      as cost_dollars,
    case
        when priceoverridecents > 0 and costcents > 0
        then (priceoverridecents - costcents) / priceoverridecents
    end                                                 as gross_margin_pct,
    imageurl                                            as image_url,
    timestamp(created_time)                             as created_at

from source

{% endif %}
