# Apollo Infrastructure Failure - Root Cause Analysis
**Date:** 2026-04-14  
**Author:** CIO  
**Issue:** [UNC-243](/UNC/issues/UNC-243)

## Executive Summary

The Apollo investor outreach infrastructure has completely failed. All 6 email accounts are disconnected from all 6 active campaigns. Zero emails are being sent. This analysis documents the root cause and provides a path forward.

## Current State (Verified 2026-04-14 via API)

### Email Accounts
All 6 accounts show the same failure pattern:

| Account | Active | Revoked At | Daily Limit | Status |
|---------|--------|------------|-------------|--------|
| anthony@ | True | 2026-04-08 | 0 | Dead |
| rosalind@ | True | 2026-04-09 | 0 | Dead |
| denise@ | True | 2026-04-10 | 0 | Dead |
| investmentrelations@ | True | 2026-04-10 | 0 | Dead |
| invest@ | True | 2026-04-12 | 0 | Dead |
| timj@ | True | 2026-04-13 | 0 | Dead |

**Key indicators:**
- `active: True` (UI status - unreliable)
- `daily_limit: 0` (cannot send any emails)
- `revoked_at` (OAuth tokens invalidated by Google)

### Campaigns
All 6 campaigns are orphaned:

| Campaign | ID | Contacted | Scheduled | Email Account |
|----------|-----|-----------|-----------|---------------|
| Tier 1 | 69d2a0b2c2e0c6000d1608d4 | 0 | 0 | NO ACCOUNT LINKED |
| Tier 2A (Denise) | 69d7dc2bf18bda002233eb04 | 0 | 0 | NO ACCOUNT LINKED |
| Tier 2B (Rosalind) | 69d7dc492a222a0019913520 | 0 | 0 | NO ACCOUNT LINKED |
| Tier 2C (Invest) | 69d7dc68457595000d6b285d | 0 | 0 | NO ACCOUNT LINKED |
| Tier 2D (TimJ) | 69d7dc86cfcc9800152117b7 | 0 | 0 | NO ACCOUNT LINKED |
| CRE & HNW v2 | 69d9670d516fcc0011c0ee34 | 0 | 0 | NO ACCOUNT LINKED |

**Impact:** Zero emails sent, zero emails scheduled, complete outreach shutdown.

## Root Cause Analysis

### Primary Cause: Bulk OAuth Re-authentication
Google's anti-spam systems detect and revoke OAuth tokens when multiple accounts are re-authenticated in rapid succession. This is documented in CLAUDE.md: *"Bulk OAuth grants trigger Google revocation — re-auth one account at a time, hours apart"*

**Timeline of failures:**
1. 2026-04-08: anthony@ revoked
2. 2026-04-09: rosalind@ revoked
3. 2026-04-10: denise@ + investmentrelations@ revoked (same day = bulk pattern)
4. 2026-04-12: invest@ revoked
5. 2026-04-13: timj@ revoked

The pattern suggests attempted bulk re-auth, triggering cascading revocations.

### Secondary Cause: Campaign Unlinking
When Apollo detects an OAuth revocation:
1. The email account's `daily_limit` is reset to 0
2. The account is unlinked from all associated campaigns
3. Campaigns show `active: True` in UI but cannot send (no account)
4. **Campaigns must be manually relinked after re-auth** (not automatic)

### Contributing Factor: No Monitoring
There was no automated health check to detect:
- OAuth revocations
- Campaign unlinking
- Sending failures
- Daily limit resets

The failure went undetected until manual investigation.

## Why Warmbox Didn't Help

Warmbox (email warmup service) is **independent** from Apollo OAuth:
- Warmbox uses its own OAuth connection to Gmail
- Warmbox warmup continues even when Apollo OAuth is revoked
- Warmup improves deliverability but doesn't fix Apollo OAuth failures

This created a false sense of health - Warmbox was running, but Apollo couldn't send.

## Lessons Learned

1. **Never bulk re-auth Gmail OAuth** - Google will revoke all tokens as anti-spam measure
2. **Apollo UI status is unreliable** - Must verify via API (`daily_limit`, `num_contacted`, campaign email account)
3. **Re-auth requires manual campaign relinking** - OAuth renewal doesn't auto-restore campaigns
4. **Need automated monitoring** - Daily health checks for OAuth status and sending activity
5. **Warmbox ≠ Apollo health** - They're independent systems

## Rebuild Effort (If Required)

To restore Apollo infrastructure:

**Phase 1: Account Re-authentication (6-7 days)**
- Re-auth accounts one at a time, 24+ hours apart
- Order: anthony@ → rosalind@ → denise@ → invest@ → timj@ → investmentrelations@
- Verify `daily_limit` restored after each re-auth
- Monitor for revocation before proceeding to next account

**Phase 2: Campaign Relinking (1-2 hours)**
- Manually link each campaign to its designated email account via Apollo UI
- Verify `num_scheduled` > 0 after linking
- Test send from each campaign

**Phase 3: Monitoring (2-3 hours)**
- Deploy automated health dashboard (see `scripts/apollo-health-check.py`)
- Daily Slack/email alerts for OAuth revocations
- Weekly campaign performance reports

**Total effort:** ~10-12 hours over 7 days (mostly waiting between re-auths)

**Risk:** Google may still revoke if it detects the pattern. May need to use different Google Workspace or accept permanent Apollo sunset.

## Recommendation

Given the company's **strategic pivot to customer acquisition** (UNC-242, CRITICAL) and Apollo being **cleanup work** (UNC-243, MEDIUM), I recommend:

**Option A: Controlled Sunset (Recommended)**
- Document the failure (this doc)
- Preserve contact database and campaign sequences
- Deprioritize rebuild until investor outreach is strategically necessary
- Focus CIO resources on customer acquisition infrastructure (GA4, Meta Ads, email deliverability for transactional/marketing emails)

**Option B: Minimal Viable Rebuild (If Investor Outreach Resumes)**
- Rebuild only when there's a confirmed business need
- Use the runbook (see `runbooks/apollo-oauth-reauth.md`)
- Follow the 24-hour spacing rule strictly
- Deploy monitoring before sending

## Deliverables

✅ Root cause analysis (this document)  
✅ OAuth re-auth runbook → `runbooks/apollo-oauth-reauth.md`  
✅ Health monitoring script → `scripts/apollo-health-check.py`  
🔲 Campaign health dashboard (defer until rebuild decision)

## Next Steps

1. Review this analysis with CEO
2. Decide: sunset Apollo or rebuild?
3. If rebuild: execute Phase 1 starting 2026-04-15
4. If sunset: archive Apollo configs and focus on customer acquisition infrastructure

---

**Related Issues:**
- Parent: [UNC-240](/UNC/issues/UNC-240) - Apollo still not bearing fruit
- Critical: [UNC-242](/UNC/issues/UNC-242) - Customer acquisition campaign (CRO)
- This: [UNC-243](/UNC/issues/UNC-243) - Apollo infrastructure fix (CIO)
