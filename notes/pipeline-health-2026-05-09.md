# Pipeline Health — 2026-05-09 ~11:45 CDT

**All sources: FRESH** (last pull ~11:42 CDT today, multiple successful runs)

| Source | Latest file | Status |
|---|---|---|
| stripe (all tables) | 20260509T164237Z | ✓ |
| ga4_events / ga4_session_summary | 20260509T164150Z | ✓ |
| airtable (catalog, pickup_slots, suppliers) | 20260509T164204Z | ✓ |
| mailchimp, resend | 20260509T164142Z | ✓ |
| apollo_contacts | 20260509T163927Z | ✓ |
| meta_campaigns / meta_campaign_insights | 20260509T164152Z | ✓ |
| google_ads_campaign_insights | 20260509T164154Z | ✓ |
| clarity_url_metrics | 20260509T164157Z | ✓ |
| conversion_v2 (processed) | 20260509T164237Z | ✓ |

No schema drift detected. Zero pipeline errors.

## One anomaly worth flagging (not a bug)

`stripe_checkout_sessions` newest record: **2026-04-24** [observed]. Sessions appear to have stopped being created after the site migrated from Stripe Checkout to a custom PaymentIntent flow. Confirmed: only 2 of 35 succeeded PIs carry `checkout_session_local_id`. The `stripe_payment_intents` table is the live conversion record going forward — checkout_sessions is legacy.

**Action for Decision Scientist:** confirm whether `checkout_sessions` table can be deprecated from the feature set in conversion_v2, or whether it should remain as historical signal for pre-Apr-24 rows.

## Revenue pulse (from Stripe, observed)

| Metric | Value | Source |
|---|---|---|
| Succeeded PIs all-time | 35 | stripe_payment_intents latest |
| Revenue all-time | $3,114.73 | stripe_payment_intents latest |
| Succeeded PIs last 7d | 2 | stripe_payment_intents latest |
| Revenue last 7d | $81.71 | stripe_payment_intents latest |
| PI funnel last 30d (132 created) | 17 succeeded (12.9%), 59 canceled, 55 requires_payment_method | stripe_payment_intents latest |
| Checkout sessions complete all-time | 18 of 303 (5.9%) | stripe_checkout_sessions latest |

**Gap vs target:** 2 orders/week [observed] vs. 30 orders/week [target from memory]. Currently at 6.7% of target. Decision Scientist / CRO should own the interpretation.
