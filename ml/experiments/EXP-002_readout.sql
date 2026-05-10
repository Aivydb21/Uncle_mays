-- EXP-002 day-14 readout query
-- Run on or after T0+14 (target: 2026-05-23)
--
-- Bind T0 to the deploy timestamp before running. Default below is
-- 2026-05-09 (the day the painted door first shipped to production).
-- All timestamps are UTC; convert to America/Chicago at the edges if
-- you want to align with business-day buckets.
--
-- Outputs five result sets (run as separate statements or wrap in
-- temp tables and union). They map 1:1 onto the EXP-002 pre-spec:
--   1. Session->purchase rate, pre vs post (primary metric)
--   2. Slot-pick rate (sessions reaching the scheduler -> picking a slot)
--   3. Day-of-week distribution among slot picks
--   4. Window-of-day distribution among slot picks
--   5. Day-of-week distribution among ACTUAL paid orders (Stripe metadata)
--      - the "real money" signal that survives even if GA4 events are flaky
--
-- Adjust dataset names if your prod env differs:
--   uncle-mays-automation.analytics_494626869   (GA4 export)
--   uncle-mays-automation.stripe_raw            (Stripe loader output)

DECLARE T0           TIMESTAMP DEFAULT TIMESTAMP('2026-05-09 22:00:00 UTC');
DECLARE PRE_START    TIMESTAMP DEFAULT TIMESTAMP_SUB(T0, INTERVAL 14 DAY);
DECLARE POST_END     TIMESTAMP DEFAULT TIMESTAMP_ADD(T0, INTERVAL 14 DAY);

-- =====================================================================
-- 1. PRIMARY METRIC: session -> purchase rate, pre vs post
-- =====================================================================
WITH all_events AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    event_name,
    event_ts
  FROM (
    SELECT
      user_pseudo_id,
      event_name,
      TIMESTAMP_MICROS(event_timestamp) AS event_ts,
      event_params
    FROM `uncle-mays-automation.analytics_494626869.events_*`
    WHERE _TABLE_SUFFIX BETWEEN
      FORMAT_DATE('%Y%m%d', DATE(PRE_START))
      AND FORMAT_DATE('%Y%m%d', DATE(POST_END))
  )
),
sessions AS (
  SELECT
    user_pseudo_id,
    session_id,
    MIN(event_ts) AS session_start,
    CASE
      WHEN MIN(event_ts) <  T0 THEN 'pre'
      WHEN MIN(event_ts) >= T0 THEN 'post'
    END AS bucket
  FROM all_events
  WHERE session_id IS NOT NULL
  GROUP BY 1, 2
),
purchases AS (
  SELECT
    user_pseudo_id,
    session_id,
    1 AS purchased
  FROM all_events
  WHERE event_name = 'purchase'
  GROUP BY 1, 2
),
session_with_purchase AS (
  SELECT
    s.bucket,
    s.user_pseudo_id,
    s.session_id,
    COALESCE(p.purchased, 0) AS purchased
  FROM sessions s
  LEFT JOIN purchases p USING (user_pseudo_id, session_id)
)
SELECT
  bucket,
  COUNT(*)                                           AS sessions,
  SUM(purchased)                                     AS purchases,
  SAFE_DIVIDE(SUM(purchased), COUNT(*))              AS conversion_rate,
  SAFE_DIVIDE(SUM(purchased), COUNT(*)) * 100        AS conversion_pct
FROM session_with_purchase
GROUP BY bucket
ORDER BY bucket DESC;

-- =====================================================================
-- 2. SLOT-PICK RATE among scheduler views (post period only)
--    delivery_scheduler_view -> delivery_slot_selected funnel
-- =====================================================================
WITH ev AS (
  SELECT
    user_pseudo_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_id,
    event_name,
    TIMESTAMP_MICROS(event_timestamp) AS event_ts
  FROM `uncle-mays-automation.analytics_494626869.events_*`
  WHERE _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE(T0))
    AND FORMAT_DATE('%Y%m%d', DATE(POST_END))
    AND event_name IN ('delivery_scheduler_view', 'delivery_slot_selected')
)
SELECT
  COUNT(DISTINCT IF(event_name = 'delivery_scheduler_view',
                    CONCAT(user_pseudo_id, '|', CAST(session_id AS STRING)),
                    NULL))                            AS scheduler_views,
  COUNT(DISTINCT IF(event_name = 'delivery_slot_selected',
                    CONCAT(user_pseudo_id, '|', CAST(session_id AS STRING)),
                    NULL))                            AS sessions_with_slot_pick,
  SAFE_DIVIDE(
    COUNT(DISTINCT IF(event_name = 'delivery_slot_selected',
                      CONCAT(user_pseudo_id, '|', CAST(session_id AS STRING)),
                      NULL)),
    COUNT(DISTINCT IF(event_name = 'delivery_scheduler_view',
                      CONCAT(user_pseudo_id, '|', CAST(session_id AS STRING)),
                      NULL))
  )                                                   AS slot_pick_rate
FROM ev;

-- =====================================================================
-- 3. DAY-OF-WEEK DISTRIBUTION among slot picks (post period)
--    Uses the day_offset and weekday event_params from delivery_slot_selected.
-- =====================================================================
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'weekday')   AS weekday,
  (SELECT value.int_value    FROM UNNEST(event_params) WHERE key = 'day_offset') AS day_offset,
  COUNT(*) AS pick_count
FROM `uncle-mays-automation.analytics_494626869.events_*`
WHERE event_name = 'delivery_slot_selected'
  AND _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE(T0))
    AND FORMAT_DATE('%Y%m%d', DATE(POST_END))
GROUP BY weekday, day_offset
ORDER BY day_offset;

-- =====================================================================
-- 4. WINDOW-OF-DAY DISTRIBUTION among slot picks (post period)
-- =====================================================================
SELECT
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'window_key') AS window_key,
  COUNT(*) AS pick_count
FROM `uncle-mays-automation.analytics_494626869.events_*`
WHERE event_name = 'delivery_slot_selected'
  AND _TABLE_SUFFIX BETWEEN
    FORMAT_DATE('%Y%m%d', DATE(T0))
    AND FORMAT_DATE('%Y%m%d', DATE(POST_END))
GROUP BY window_key
ORDER BY pick_count DESC;

-- =====================================================================
-- 5. REAL-MONEY SIGNAL: day/window distribution among ACTUAL paid orders
--    Pulls from Stripe payment_intents.metadata (the preferred_delivery_*
--    fields written in /api/checkout/intent). This is the diagnostic
--    most worth trusting at low n — survives GA4 event-fire flakiness.
--
--    Adjust the JSON paths below if the loader stores metadata as a
--    string vs. a struct. The Stripe API returns metadata as
--    Map<string, string>; the loader docstring (top of file) says it
--    flattens to JSON, so JSON_EXTRACT_SCALAR is the right tool.
-- =====================================================================
SELECT
  JSON_EXTRACT_SCALAR(metadata, '$.preferred_delivery_date')   AS preferred_date,
  JSON_EXTRACT_SCALAR(metadata, '$.preferred_delivery_window') AS preferred_window,
  COUNT(*)                                                     AS paid_orders,
  SUM(amount) / 100.0                                          AS gmv_dollars
FROM `uncle-mays-automation.stripe_raw.payment_intents`
WHERE TIMESTAMP_SECONDS(created) >= T0
  AND TIMESTAMP_SECONDS(created) <  POST_END
  AND status = 'succeeded'
  AND JSON_EXTRACT_SCALAR(metadata, '$.preferred_delivery_date') IS NOT NULL
GROUP BY preferred_date, preferred_window
ORDER BY preferred_date, preferred_window;

-- =====================================================================
-- DECISION GUIDE (per EXP-002 pre-spec):
--
--   * Result 1: report rate, lift, p-value. CAVEAT confounds (paid ads
--     paused 2026-05-09; pre traffic was ad-driven, post is organic).
--     Do NOT claim causal lift on this alone.
--   * Result 3: if >=30% of picks are non-Wednesday days, demand for
--     flexibility exists. <30%, demand is weaker than feedback suggested.
--   * Result 5: same threshold but with real money behind it. Prefer
--     this over Result 3 if both are populated.
-- =====================================================================
