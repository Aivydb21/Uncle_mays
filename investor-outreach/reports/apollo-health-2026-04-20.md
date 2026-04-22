# Apollo Infrastructure Health Report
**Date:** 2026-04-20  
**Run by:** IR Agent (UNC-408)  
**Comparison baseline:** 2026-04-13 (last Monday, per apollo-postmortem.md)

---

## Executive Summary

**Status: CRITICAL -- Zero outreach delivery for 7+ days.**

All 6 sender accounts remain OAuth-revoked with daily_limit unset (0 effective). All 6 campaigns remain orphaned (no account linked). No emails have been sent or scheduled since the April 8-13 cascade failure. One new regression was detected: anthony@ received a fresh OAuth revocation on 2026-04-17, after the April 16 health check reported all accounts healthy. invest@ and timj@ are flagged as stalled per the issue brief -- remediation tasks opened below.

---

## Account Status (vs. Last Monday April 13)

| Account | revoked_at | last_synced_at | daily_limit | vs April 13 |
|---------|-----------|----------------|-------------|-------------|
| rosalind@unclemays.com | 2026-04-09 17:20 UTC | 2026-04-20 15:08 UTC | unset (0) | Unchanged |
| investmentrelations@unclemays.com | 2026-04-10 21:04 UTC | 2026-04-20 15:03 UTC | unset (0) | Unchanged |
| invest@unclemays.com | 2026-04-12 18:23 UTC | 2026-04-20 15:09 UTC | unset (0) | Unchanged -- STALLED |
| denise@unclemays.com | 2026-04-10 17:05 UTC | 2026-04-20 15:06 UTC | unset (0) | Unchanged |
| anthony@unclemays.com | **2026-04-17 01:35 UTC** | 2026-04-20 15:07 UTC | unset (0) | **NEW revocation** |
| timj@unclemays.com | 2026-04-13 15:27 UTC | 2026-04-20 15:05 UTC | unset (0) | Unchanged -- STALLED |

**Key observations:**
- `last_synced_at` is today for all 6 accounts -- Apollo synced them, but sync does not clear `revoked_at`
- `last_synced_at > revoked_at` for all 6: accounts have been synced after revocation; this was the basis for the April 16 "all healthy" report from UNC-318, but campaigns were not relinked and oauth tokens were not restored
- **anthony@**: fresh revocation on April 17 at 01:35 UTC -- this is a regression, not a holdover from the cascade
- **invest@ and timj@**: explicitly stalled; flagged for separate remediation tasks per AGENTS.md section 7

---

## Campaign Status (vs. Last Monday April 13)

| Campaign | Active | Linked Account | Contacted | Scheduled | Delivered | Bounced | vs April 13 |
|----------|--------|---------------|-----------|-----------|-----------|---------|-------------|
| Tier 1 - Thesis Aligned | False | NONE | 0 | 0 | 0 | 0 | Unchanged |
| Tier 2A (Denise) | True | NONE | 0 | 0 | 0 | 0 | Unchanged |
| Tier 2B (Rosalind) | True | NONE | 0 | 0 | 0 | 0 | Unchanged |
| Tier 2C (Invest) | True | NONE | 0 | 0 | 0 | 0 | Unchanged |
| Tier 2D (TimJ) | True | NONE | 0 | 0 | 0 | 0 | Unchanged |
| CRE & HNW v2 | False | NONE | 0 | 0 | 0 | 0 | Unchanged |

All 6 campaigns remain orphaned. No contacts contacted, no contacts scheduled, zero delivery.  
Bounce rate: N/A (no sends).

---

## Deltas vs April 13 Baseline

- **revoked_at deltas**: 5 of 6 accounts unchanged. anthony@ has a new revocation (April 17).
- **Bounce rate trend**: Undefined -- zero sends both weeks. No regression, no improvement.
- **Campaign linking**: No change. All orphaned.
- **Delivery activity**: None since April 8 cascade.
- **April 16 "all healthy" finding**: Based on `last_synced_at > revoked_at` heuristic. Not a full restore. OAuth tokens were not confirmed re-authed via `daily_limit` restoration, and campaigns were never relinked. This report supersedes that finding.

---

## Remediation Required

Per AGENTS.md section 7 rules:

1. **invest@ revoked_at (2026-04-12) -- newer than any last delivery**: Remediation task opened: `Reauth Apollo account invest@unclemays.com`
2. **timj@ revoked_at (2026-04-13) -- newer than any last delivery**: Remediation task to be opened 24h after invest@ task starts (per no-bulk-reauth rule)
3. **anthony@ new revocation (2026-04-17)**: Separate remediation -- NOT co-scheduled with invest@ or timj@

Accounts not immediately actionable this cycle (too many parallel re-auths would trigger cascade again):
- rosalind@, denise@, investmentrelations@: remediation deferred to subsequent 24h windows after invest@ and timj@ complete

---

## Risk Flag

The April 16 report from CIO claimed all accounts healthy without verifying campaign relinking or `daily_limit` restoration. The current state reveals that report was premature. Anthony@ was re-revoked on April 17 -- possibly from an attempted sync or re-auth attempt that was not properly spaced. This mirrors the April 8-13 cascade pattern.

**No bulk re-auth attempts should be made.** Follow one-account-per-24h protocol per AGENTS.md section 7 and the postmortem runbook.

---

## Next Actions

1. Remediation task #1: Reauth `invest@unclemays.com` -- open immediately
2. Remediation task #2: Reauth `timj@unclemays.com` -- schedule 24h after invest@
3. Remediation task #3: Reauth `anthony@unclemays.com` -- schedule 24h after timj@
4. After each re-auth: verify `daily_limit > 0` before proceeding to next account
5. After all re-auths: manually relink each campaign to its designated account in Apollo UI
6. Post-relink: verify `num_scheduled > 0` for each campaign before declaring healthy

---

*Script used: `investor-outreach/scripts/apollo-health-check.py --daily-report`*  
*Apollo API key: `~/.claude/apollo-config.json`*
