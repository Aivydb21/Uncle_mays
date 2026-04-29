# Exit-survey trigger thresholds — calibration record (2026-04-29)

## Source

`investor-outreach/scripts/pull-clarity-checkout-dwell.py` against Microsoft
Clarity export API, 3-day aggregate. Raw JSON at
`data/clarity-checkout-dwell-2026-04-29.json`.

## Findings (3-day aggregate, last 72h)

| Page | Sessions | Avg active engagement | Avg scroll depth |
|---|---|---|---|
| `/checkout/family` | 42 | **19.5s** | 53.6% |
| `/checkout/starter` | 22 | **20.7s** | 57.1% |
| `/checkout/family/payment` | 3 | 27.5s | 90.8% |
| `/checkout/starter/payment` | 5 | 55.0s | 88.8% |

Interpretation: visitors on the first checkout step (the summary page where
the exit survey lives) spend roughly **20 seconds of active engagement
before leaving**, scrolling about half the page. People who reach the
payment step engage longer (27–55s) and scroll deeper (~90%) — those are
near-converters and we don't survey them.

## Calibrated trigger rules for `<CheckoutExitSurvey />`

Goal: fire late enough that the visitor has actually engaged, early enough
that we catch them before they're gone. Median active engagement = 20s, so
**15s** is "engaged but not committed" and gives a 5s window to fire
before the median bounce.

### Desktop

Fire when **either** condition is met:

1. **Native exit-intent**: mouseout event with `event.clientY <= 0`
   (mouse leaves through the top of the viewport — heading for the address
   bar / tab close) AND user has been on page for ≥ 8 seconds (avoid
   firing on accidental mouse-flicks during initial page load).
2. **Time-based fallback**: 18 seconds of total dwell (we can't reliably
   measure "active" engagement client-side without tab-visibility tracking,
   so total dwell is a fair proxy) AND scroll depth ≥ 30% (proves they
   actually engaged, not just bounced on load).

### Mobile

Mobile has no exit-intent equivalent. Fire when **all** conditions are met:

1. Total dwell ≥ 12 seconds.
2. Scroll depth ≥ 40% of page height at any point.
3. Visitor scrolls **up** by ≥ 200px from their max scroll position
   (heuristic: heading back to the top to close the tab or hit back).

### Universal guards

- Do not fire on `/checkout/[product]/payment` or
  `/subscribe/[product]/payment` — those visitors are converting.
- Do not fire on `/order-success`.
- Fire **once per session** — sessionStorage flag
  `unc-exit-survey-shown-${slug}`.
- Auto-dismiss after 30s if not engaged (don't trap the user).

## When to recalibrate

Re-run `pull-clarity-checkout-dwell.py` and update this doc if any of:

- Page layout on `/checkout/[product]` changes meaningfully.
- Avg engagement time drifts > 30% in either direction.
- Survey response rate drops below 5% of fires (signal we're firing wrong).
