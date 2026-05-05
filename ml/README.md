# Uncle May's — Data & ML Workspace

Working folder for data extraction, feature engineering, modeling, and analysis. Lives alongside the website code so we can pull from local stores (Stripe webhooks, checkout-store, customer feedback) and the same APIs the site uses.

## Folder layout

```
ml/
  data/
    raw/         # Pulled extracts (gitignored — contains PII)
    interim/     # Cleaned, joined, deidentified
    processed/   # Feature stores ready for training
  ingest/        # One module per source (apollo.py, stripe.py, ga.py, ...)
  features/      # Feature engineering (windowing, encoding, joins)
  models/        # Training scripts + saved artifacts (artifacts gitignored)
  notebooks/     # Exploration; promote findings into ingest/features/models
  experiments/   # Run logs, metrics, configs per experiment
  configs/       # YAML/JSON configs (one per experiment + shared schemas)
```

**Promotion rule:** notebooks are for exploration only. The moment a query, transform, or model is worth re-running, move it into `ingest/`, `features/`, or `models/` as a script. Notebook code rots; module code gets imported and tested.

## Available data sources

Two-column inventory: what we can pull, where it lives, what's interesting in it. Auth is already configured at the paths shown (see CLAUDE.md for full setup).

### First-party (we generate it)

| Source | Where | Auth | Volume / freshness | Useful for |
|---|---|---|---|---|
| **Stripe** | `https://api.stripe.com/v1` + webhook log | `~/.claude/stripe-config.json`; webhook events at `/api/webhook` | Real-time events, full history. Customers, charges, subscriptions, invoices, disputes, payouts | LTV, churn, ARPU, payment-failure prediction, subscription cohort analysis |
| **Local checkout-store** | `data/checkout-sessions.json` (site repo) | None (local file) | Every checkout attempt with cart, address, pricing, completedAt or null. **Vercel ephemeral — only reliable on local + post-2026-04-24 sessions** | Abandoned-cart prediction, conversion rate by path, basket composition, completion lag |
| **Mailchimp** | `https://us19.api.mailchimp.com/3.0` | `~/.claude/mailchimp-config.json` | 26 lifetime campaigns; audience currently 3 (lockdown reset 2026-04-10). Lifetime 63.9% open / 9.8% click (inflated by 1-subscriber transactional sends pre-2026-04-24) | Newsletter open/click prediction once audience rebuilds. Segmentation experiments |
| **Resend (transactional)** | `https://api.resend.com` + dashboard | `~/.claude/resend-config.json` | All triggered emails since 2026-04-24 cutover (order-confirmation, abandoned-checkout 0/1/2/3, subscription lifecycle). Bounces, opens, clicks via Resend events | Send-time optimization, recovery-sequence step-conversion analysis, deliverability monitoring |
| **GA4** | `analyticsdata.googleapis.com/v1beta` | `~/.claude/ga-service-account.json` (or OAuth) | Sessions, users, page views, events (purchase, add_to_cart, initiate_checkout), traffic sources, device, geo | Funnel attribution, channel-level conversion modeling, page-level engagement scoring |
| **Meta Pixel + CAPI** | Events in Meta Events Manager + CAPI logs | `~/.claude/meta-config.json`. Pixel `2276705169443313`, account `act_814877604473301` | Page views, AddToCart, InitiateCheckout, Purchase. Plus campaign/adset/ad performance | Audience modeling, lookalike seed quality, creative-level CTR/CVR prediction |
| **Google Ads** | `googleads.googleapis.com/v22` | `~/.claude/google-ads-config.json`, customer `6015592923` | Campaign, ad group, ad, keyword performance | Bid/budget optimization, search-query mining, cross-channel ROAS modeling |
| **Apollo.io** | `https://api.apollo.io/api/v1` | `~/.claude/apollo-config.json` | 3,240 contacts scored (66 T1 / 612 T2 / 677 T3 / 1,753 excluded). 5 active campaigns, ~691 in flight. Per-contact opens/replies/bounces | Reply-likelihood scoring, sender/account-pair routing, send-time optimization for cold outreach |
| **Customer feedback** | Anthony's Gmail under `feedback-inbound` label | `~/.claude/Gmail` MCP | Reconstructible to JSONL via `investor-outreach/scripts/ingest-gmail-feedback.py`. Free-text from `/ask`, AskCapture, exit survey, abandon-feedback emails. Themes at `notes/feedback-backlog.md` | Theme classification, sentiment, intent extraction, recurring-pain detection |
| **Twilio SMS** | Twilio API | env vars in site repo | Confirmation send + customer responses (confirmed/declined) | Confirmation-response rate by ZIP, time-of-day signal |
| **Stripe webhook log** | `/api/webhook` server logs (Vercel) | Vercel logs UI | Every event we receive. Includes raw `intent.metadata` (cart, UTMs, CAPI fields) | Reconstructing customer journeys end-to-end without joins |

### Third-party operational (we own the account)

| Source | Where | Auth | Useful for |
|---|---|---|---|
| **Airtable — Suppliers** | base `appm6F6H9obydzAM2`, table `Suppliers` | `~/.claude/airtable-config.json` PAT `Uncle_Mays` | 100+ farms + vendors with category/subcategory, location, products offered, certifications | Vendor-product matching, supply-side modeling, route-density planning |
| **Airtable — Black Vendors (legacy)** | base `appHgPTKlcuFKajQp` | same PAT | Older vendor list (largely merged into Suppliers 2026-05-01) | Historical reference; deprecate after Suppliers fully cuts over |
| **Airtable — Product Mix** | base `app3raEVB9kHeUoHE` | same PAT | Per-item product/cost data (planned source for the new /shop catalog) | Demand-per-SKU forecasting, COGS-based margin modeling |
| **Canva** | `https://api.canva.com/rest/v1` | `~/.claude/canva-config.json` | Design assets, exports, brand templates | Creative-level CTR labeling for ad-creative experiments |
| **Trigger.dev** | `https://api.trigger.dev` + MCP | `TRIGGER_SECRET_KEY` env | Run history for every background task (abandoned-cart, order-confirmation, sub lifecycle, etc.). Pass/fail/duration | Job-failure root-cause analysis, pipeline reliability metrics |
| **Investor outreach files** | `investor-outreach/contacts/` (3,240 contact CSV/MD), `pipeline/`, `notes/`, `crm/investor-crm.md` | Local files | Per-contact scoring, replies, follow-up notes | Investor-reply prediction, segmentation, ICP scoring |

### Public / web (collectable on demand)

| Source | Tool | Notes |
|---|---|---|
| **Firecrawl** | `https://api.firecrawl.dev/v2` | `~/.claude/firecrawl-config.json`. Scrape + crawl + search + map. **Free tier exhausted as of 2026-05-01** — need top-up before next pull |
| **WebSearch** | Built-in tool | Up-to-date results, no quota visible. Good for market data, competitor intel, investor news |
| **Census / ACS** | Public APIs | ZIP-level demographics for service-area modeling (income, household size, % Black households) |
| **USDA NASS / FNS** | Public APIs | Crop yields, food access scores by county |

### Local repo artifacts (untracked dumps from prior sessions)

| File | Origin |
|---|---|
| `_ads_full.json`, `_adsets.json`, `_camps.json`, `_meta_ads.json` | Recent Meta Ads pulls |
| `_airtable_dump/` | Airtable snapshot |
| `ad-exports/onetime-launch-apr26/` | One-time launch campaign assets |
| `ad-exports/funnel-reality-2026-04-24.md` | Funnel analysis snapshot |
| `notes/feedback-backlog.md` | Customer feedback themes ranked by recurrence |
| `notes/exit-survey-thresholds-2026-04-29.md` | Exit-survey trigger calibration |

These are convenient starting points — copy into `ml/data/raw/` (gitignored) before transforming.

## Suggested first projects (pick one to scaffold next)

Sorted by **expected business value × data readiness**:

1. **Abandoned-cart conversion prediction.** We already capture every abandoned session in `checkout-store.ts` plus the `recoveryEmail0–3SentAt` flags and outcomes. Train a model that scores each new abandoned session for likelihood-to-recover, then route low-likelihood carts straight to feedback-only (skip the 3 sales emails). Tight feedback loop, immediate revenue impact.
2. **Customer LTV / churn.** Stripe customer + subscription history is small but complete. Model first-purchase characteristics → repeat-order count, gross profit. Output: a per-customer LTV used to price acquisition.
3. **Cold-email reply prediction (Apollo).** 3,240 scored contacts, ~691 in flight, full open/reply/bounce per contact. Predict reply probability before send to prioritize the limited 10/day per account. Direct fundraising velocity impact.
4. **SKU demand forecasting** (gated on the new custom-cart launch). Once the Catalog is live and orders flow, forecast per-SKU weekly demand to size POs to farms. Avoids shrink + stockouts.
5. **Creative-level ad performance scoring.** Meta + Google Ads performance joined to Canva exports. Predict CTR/CVR for new creative before spend.
6. **Service-area expansion scoring.** Join Stripe orders + GA4 sessions to Census + ACS by ZIP. Predict revenue density for unopened ZIPs.

## Pipeline (built 2026-05-02)

End-to-end refresh:

```bash
python -m pip install -r ml/requirements.txt    # one-time
python -m ml.run_pipeline                        # extract every source + rebuild dataset
```

Individual ingests:

```bash
python -m ml.ingest.checkout_store
python -m ml.ingest.stripe          # PIs + Checkout Sessions + Customers + Charges
python -m ml.ingest.bigquery_ga4    # GA4 events_* + per-session summary
python -m ml.ingest.mailchimp
python -m ml.ingest.resend
python -m ml.ingest.apollo
python -m ml.features.build_dataset # join everything into ml/data/processed/conversion_v1_*.parquet
```

### Y label (vintage C, hybrid window)

Spine = Stripe PaymentIntents since `DATASET_START_DATE` (default 2026-04-24).

| Status | Label | Notes |
|---|---|---|
| `succeeded` | **1** | Converted |
| `canceled` | **0** | Outcome determined immediately |
| `requires_payment_method` and older than `ABANDON_WINDOW_DAYS` (default 1) | **0** | Started checkout, never entered card |
| `processing` / `requires_action` / `requires_confirmation` | excluded | Still in flight |
| `is_subscription_invoice == True` | excluded | Renewal flow, separate model |
| `is_test == True` | excluded | Internal test orders |

### Joined sources

- **Stripe customers** by `customer_id` → billing geo, delinquent flag
- **Stripe charges** by `payment_intent_id` → decline reason, risk level, outcome
- **Prior-history rollup** by `email_hash` (self-join, strict <-time) → `prior_paid_count`, `prior_paid_total_cents`, `is_returning_customer`, `days_since_last_purchase`
- **checkout-store.ts** by `payment_intent_id` → cart breakdown, recovery email flags, SMS confirmation
- **Mailchimp** by `email_hash` → audience membership, open/click rates, member rating, tags
- **Resend** by `to_hash` → transactional send count, unique types
- **Apollo** by `email_hash` → investor/business overlap (rarely matches consumer emails — expected)
- **GA4 BigQuery** by `transaction_id` (succeeded only, exact) and fallback by `gclid` (fuzzy) → device, geo, traffic source, pageviews, scrolls, form_starts

### Output

`ml/data/processed/conversion_v1_<utc>.parquet` — one row per labeled session, ~119 columns.

## Campaign-name convention (UTMs ↔ ad-platform dashboard names)

Stripe captures `utm_campaign` from the URL (slug-style). Meta and Google
Ads APIs return the dashboard `campaign_name` (human-readable). They never
match by string. The bridge is at
[`ml/configs/campaign_name_map.json`](configs/campaign_name_map.json).

**Going-forward convention** for every new paid campaign — set the ad's
destination URL `utm_campaign=` parameter to a slug of the form
`<source>-<intent>-<yyyymm>`, then add a row to the map:

| Source | Example dashboard name | Slug |
|---|---|---|
| Meta | `Subscription Launch Apr 2026` | `meta-sub-launch-202604` |
| Meta | `One-Time Box Launch - Apr 2026` | `meta-onetime-launch-202604` |
| Meta | `Retargeting - Website Visitors Apr 2026` | `meta-retargeting-202604` |
| Google Ads | `Produce Box - Search Campaign` | `gads-search-produce-202604` |

Non-paid `utm_campaign` values (`recovery` for abandoned-cart emails,
`profile_link` for IG bio, etc.) stay as-is — they don't need translating
because they aren't matched against any ad-platform campaign.

## Notebook setup (R + Quarto)

The first-look modeling notebook is Quarto with R doing the heavy lifting
(tidymodels). Install once:

```bash
# Quarto: comes preinstalled at C:\Users\Anthony\AppData\Local\Programs\Quarto
quarto --version

# R: at C:\Program Files\R\R-4.3.3 (not on PATH; use full path or alias)
"/c/Program Files/R/R-4.3.3/bin/Rscript.exe" ml/notebooks/_setup.R
```

Render the notebook:

```bash
cd ml/notebooks
quarto render 01_first_look_baseline.qmd
# → 01_first_look_baseline.html (gitignored)
```

The notebook compares LR (`glmnet`) + RF (`ranger`) + XGBoost (`xgboost`) on
the conversion-prediction dataset, with a side-by-side **class-weighted vs
SMOTE** imbalance comparison and PR-AUC + variable-importance reporting.
Reusable R helpers live in `_feature_prep.R` (clean + recipe builder) so the
same logic can be sourced by future training scripts in `ml/models/`.

**Known caveats**

- R 4.3.3's bundled `fastmap 1.1.1` blocks `tidymodels_prefer()` (needs
  `fastmap >= 1.2.0`). The notebook works around it; upgrade `fastmap`
  manually when no R session is holding `fastmap.dll`.
- Capping anonymous attempts at 3-per-bucket dramatically rebalances the
  class distribution (3% positive → 34% positive). Bump
  `max_per_anon_bucket` in `clean_attempts()` to keep more of the original
  imbalance.

## Stack (recommended, not installed yet)

- **Python 3.11+**, `uv` for env management
- **DuckDB** for local joins across raw extracts (no Postgres needed at this scale)
- **Polars** for tabular work (faster than pandas, better memory)
- **scikit-learn** for baselines, **XGBoost / LightGBM** for tabular winners
- **MLflow** for experiment tracking (lightweight; runs land in `experiments/runs/`)
- **Jupyter** for `notebooks/`

When we pick a first project, I'll add `pyproject.toml` with the right pinned deps + a one-line setup script.

## Conventions

- Every `ingest/<source>.py` exposes one function: `extract(since: datetime | None = None) -> Path` writing a parquet to `data/raw/<source>_<isoutc>.parquet`.
- `features/` modules read from `data/raw/`, write to `data/processed/`. They never touch external APIs.
- `models/` modules read from `data/processed/`, write artifacts to `models/artifacts/<run_id>/`. They never touch external APIs and never reach into `data/raw/`.
- Every dataset transformation gets logged to `experiments/` with input file hashes so runs are reproducible without re-extracting.
- **PII never leaves `data/raw/`.** Hash emails to deterministic IDs at the interim layer.
