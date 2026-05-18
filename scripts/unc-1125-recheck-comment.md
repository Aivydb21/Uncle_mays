## Layer 3 Galileo recheck — complete

48h window: 2026-05-16 14:00 UTC → 2026-05-18 14:39 UTC.
Galileo chatID: `019e3b85-53f0-796c-891b-224fba2ccd28`

| # | Pattern | Originating issue(s) | Verdict | Disposition |
|---|---|---|---|---|
| 1 | Add-to-cart silent fail in FB/IG in-app browser | [UNC-1084](/UNC/issues/UNC-1084), [UNC-1121](/UNC/issues/UNC-1121) | **UNCHANGED** (3 of 20 FB/IG sessions still failed) | **Re-open [UNC-1121](/UNC/issues/UNC-1121) → `todo`** |
| 2 | Mobile checkout dead-click + Stripe stuck loader | [UNC-1085](/UNC/issues/UNC-1085) | ABSENT (0 sessions) | Keep `done` |
| 3 | NYC ZIP-rejection bounce | [UNC-1086](/UNC/issues/UNC-1086) | ABSENT | Keep `done` |
| 4 | Blank Stripe Elements payment slot | [UNC-1094](/UNC/issues/UNC-1094) | ABSENT | Keep `done` |
| 5 | Out-of-zone paid traffic constraint surfaced too late | [UNC-1095](/UNC/issues/UNC-1095) | DROPPED (0 paid `fbclid` sessions hit it) | Keep `done` |
| 6 | "Enter a valid ZIP" text dead-clicks | [UNC-1117](/UNC/issues/UNC-1117) | DOWNGRADED (5 sessions still click; no abandons) | Keep `done` |
| 7 | Homepage section-heading / product-photo dead-taps | [UNC-1122](/UNC/issues/UNC-1122) | ABSENT | Keep `done` |
| 8 | 20-min frozen homepage (Airtable hang) | [UNC-1123](/UNC/issues/UNC-1123) | ABSENT | Keep `done` |

**Overall:** May 15-16 fix batch largely landed — 5 absent, 1 dropped, 1 downgraded, 1 unchanged.

The one holdout is the FB/IG in-app browser add-to-cart bug. UNC-1121's earlier fix did not eliminate it for every session — 3 of 20 in-app browser sessions still saw silent add-to-cart failures in the recheck window. Re-opening [UNC-1121](/UNC/issues/UNC-1121) to `todo` and queuing the next iteration.

This recheck issue closes as `done`. Parent routine `246b3419` (one-shot) is being archived next.

Sample representative sessions for the unchanged pattern:
- https://app.logrocket.com/mk3nrx/uncle_mays/s/6-019e3264-2f6d-72eb-99da-3b5d890b97cd/0?t=1778961890714
- https://app.logrocket.com/mk3nrx/uncle_mays/s/6-019e31e0-c5fe-7dc5-8fb0-b228449106ca/0?t=1778953298731
- https://app.logrocket.com/mk3nrx/uncle_mays/s/6-019e31e3-3efe-78de-bba8-fddf0d0e7674/0?t=1778953443435
