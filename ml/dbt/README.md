# Uncle May's dbt Project

Analytics-ready data models for Uncle May's Produce. All board-deck
metrics are defined here. There is one definition of every metric at
Uncle May's; it lives in a model in this project.

## Project layout

```
uncle_mays/
  models/
    staging/          -- One view per source table; thin cleaning + renaming
      stg_stripe_charges.sql
      stg_stripe_checkout_sessions.sql
      stg_stripe_customers.sql
      stg_stripe_payment_intents.sql
    marts/
      core/           -- Revenue facts and customer dimensions
        mart_orders.sql          -- One row per completed order (revenue fact)
        mart_customers.sql       -- One row per customer (LTV, cohort)
      marketing/      -- Channel performance, CAC, ROAS
        mart_channel_performance.sql
      finance/        -- (placeholder for gross margin, contribution margin)
```

## Running locally (dev — DuckDB)

Requirements: `uv` (installed at `~/.local/bin/uv`). dbt-core 1.11.x is
incompatible with Python 3.14 (mashumaro crash); `uv run --python 3.13` bypasses
the system Python automatically.

```bash
export PATH="$HOME/.local/bin:$PATH"   # ensure uv is in PATH
export DBT_DATA_DIR="C:/Users/Anthony/Desktop/um_website/ml/data/raw"
cd ml/dbt/uncle_mays

# Verify connection (should print "All checks passed!")
uv run --python 3.13 --with dbt-duckdb dbt debug --target dev --profiles-dir ..

# Run all models (builds DuckDB tables from raw parquet into ml/data/uncle_mays_dev.duckdb)
uv run --python 3.13 --with dbt-duckdb dbt run --target dev --profiles-dir ..

# Run schema tests (38/38 pass as of 2026-05-04)
uv run --python 3.13 --with dbt-duckdb dbt test --target dev --profiles-dir ..

# Generate docs
uv run --python 3.13 --with dbt-duckdb dbt docs generate --profiles-dir ..
uv run --python 3.13 --with dbt-duckdb dbt docs serve
```

The `profiles.yml` is at `ml/dbt/profiles.yml` (one level above the project dir),
so always pass `--profiles-dir ..` from inside `uncle_mays/`.

## Running against BigQuery (prod)

1. Ensure raw Stripe/Mailchimp parquet data has been loaded to BQ by
   `ml/ingest/`. The expected source dataset is `stripe_raw`.
2. Service account `claude-ga-reader@uncle-mays-automation.iam.gserviceaccount.com`
   must have `bigquery.dataEditor` on the `uncle_mays_dbt` dataset.

```bash
dbt run --target prod
dbt test --target prod
```

## Metric definitions

See `ml/notebooks/metrics-glossary.qmd` for the full glossary.

Quick reference:

| Metric | Model | Formula |
|--------|-------|---------|
| AOV    | mart_orders | avg(gross_revenue_dollars) |
| Weekly Revenue | mart_orders | sum(gross_revenue_dollars) group by order_week |
| Checkout Conversion Rate | stg_stripe_checkout_sessions | count(is_converted) / count(*) |
| LTV | mart_customers | ltv_dollars |
| Repeat Rate | mart_customers | count(is_repeat_customer=true) / count(*) |
| CAC | mart_channel_performance | ad_spend_dollars / new_customers (pending ad spend load) |

## Owner

Analytics Engineer (`analytics-engineer` on Paperclip).
Questions → @analytics-engineer or UNC-752.
