# Apollo OAuth Re-authentication Runbook

**Purpose:** Restore Apollo email account OAuth connections after Google revocation  
**Audience:** CIO, CEO, or authorized user with Apollo admin access  
**Risk Level:** HIGH - Bulk re-auth will trigger more revocations  
**Time Required:** 7+ days (24h spacing between accounts)

## Prerequisites

- [ ] Apollo admin access (anthony@unclemays.com login)
- [ ] Gmail admin access for @unclemays.com domain
- [ ] Confirmed business need for Apollo investor outreach
- [ ] CEO approval for rebuild (Apollo is deprioritized as of 2026-04-14)

## Critical Rules

1. **NEVER re-auth multiple accounts in the same day** - Google will revoke all tokens
2. **Wait 24+ hours between each account** - Minimum safe interval
3. **Verify success before proceeding** - Check `daily_limit` via API after each re-auth
4. **Do not trust Apollo UI** - UI shows "healthy" even when broken; use API validation
5. **Expect failures** - Google may revoke even with spacing; have backup plan

## Pre-Flight Check

Before starting, verify current status:

```bash
# Check all account statuses
cd ~/Desktop/um_website/investor-outreach/scripts
python3 apollo-health-check.py --detailed
```

Expected output: All accounts showing `daily_limit: 0`, recent `revoked_at` dates.

## Re-authentication Sequence

### Account Order (Recommended)

Re-auth in order of campaign priority:

1. **Day 1:** anthony@unclemays.com (Tier 1 - highest value contacts)
2. **Day 2:** rosalind@unclemays.com (Tier 2B)
3. **Day 3:** denise@unclemays.com (Tier 2A)
4. **Day 4:** invest@unclemays.com (Tier 2C)
5. **Day 5:** timj@unclemays.com (Tier 2D)
6. **Day 6:** investmentrelations@unclemays.com (CRE & HNW)

### Per-Account Procedure

For each account, follow these steps:

#### Step 1: Re-auth OAuth (Apollo UI)

1. Log into Apollo.io as admin
2. Navigate to: **Settings → Email Accounts**
3. Find the target account (e.g., `anthony@unclemays.com`)
4. Click **Re-connect** or **Authorize Gmail**
5. Complete Google OAuth flow in popup
6. **Close the popup when done**

#### Step 2: Verify Success (API - 5 minutes later)

Wait 5 minutes for Apollo to process, then verify:

```bash
cd ~/Desktop/um_website/investor-outreach/scripts
python3 -c "
import json, urllib.request, os

config = json.load(open(os.path.expanduser('~/.claude/apollo-config.json')))
APOLLO_KEY = config['api_key']
APOLLO_URL = config['base_url']

email = 'anthony@unclemays.com'  # Change this for each account

req = urllib.request.Request(
    f'{APOLLO_URL}/email_accounts',
    headers={'X-Api-Key': APOLLO_KEY, 'User-Agent': 'curl/8.0'}
)
resp = urllib.request.urlopen(req, timeout=30)
accounts = json.loads(resp.read())

for acc in accounts.get('email_accounts', []):
    if acc.get('email') == email:
        print(f\"Account: {email}\")
        print(f\"  Active: {acc.get('active')}\")
        print(f\"  Daily limit: {acc.get('daily_email_sending_limit')}\")
        print(f\"  Revoked at: {acc.get('revoked_at', 'Never')}\")
        break
"
```

**Success criteria:**
- `daily_email_sending_limit` > 0 (typically 50-200)
- `revoked_at` is `null` or older than today
- `active` is `True`

**If failed:**
- `daily_limit` still 0 → OAuth didn't stick, retry Step 1
- `revoked_at` is today → Google rejected it immediately, STOP and escalate
- Account not found → Check if you're looking at the right Apollo workspace

#### Step 3: Wait 24 Hours

**Do not proceed to the next account for at least 24 hours.**

Set a calendar reminder for the next account. During the wait:
- Monitor the re-authed account for new revocations (check API every 6 hours)
- If revoked again during the 24h wait, STOP the entire process and escalate to CEO

#### Step 4: Document Results

After each account, log the result:

```bash
echo "$(date): anthony@unclemays.com re-authed, daily_limit=50" >> ~/Desktop/um_website/investor-outreach/runbooks/oauth-reauth-log.txt
```

## Campaign Relinking (After All Accounts Re-authed)

Once ALL 6 accounts are successfully re-authed and stable for 24 hours:

### For Each Campaign:

1. Log into Apollo.io
2. Navigate to: **Campaigns → [Campaign Name]**
3. Click **Settings** or **Edit Campaign**
4. Under **Sender Email**, select the appropriate account:
   - Tier 1 → anthony@unclemays.com
   - Tier 2A → denise@unclemays.com
   - Tier 2B → rosalind@unclemays.com
   - Tier 2C → invest@unclemays.com
   - Tier 2D → timj@unclemays.com
   - CRE & HNW v2 → investmentrelations@unclemays.com
5. **Save** the campaign
6. Verify `num_scheduled_contacts` > 0 (may take 5-10 minutes for Apollo to reschedule)

### Verify Campaign Linking (API):

```bash
cd ~/Desktop/um_website/investor-outreach/scripts
python3 apollo-health-check.py --campaigns
```

Expected output: Each campaign shows an email account (not "NO ACCOUNT LINKED") and `num_scheduled` > 0.

## Monitoring (Post-Rebuild)

After rebuild, run daily health checks:

```bash
# Add to cron or manual daily check
cd ~/Desktop/um_website/investor-outreach/scripts
python3 apollo-health-check.py --daily-report
```

**Alert triggers:**
- Any account with `daily_limit: 0`
- Any account with recent `revoked_at` (within 24 hours)
- Any campaign with `NO ACCOUNT LINKED`
- Any campaign with 0 emails sent in last 3 days

## Troubleshooting

### Google keeps revoking even with 24h spacing

**Cause:** Google flagged the domain or detected abnormal OAuth patterns  
**Solution:**
- Contact Google Workspace support to remove domain from spam list
- OR migrate to a different OAuth app (create new Google Cloud project)
- OR accept Apollo sunset and use alternative outreach methods

### Campaign relinking doesn't stick

**Cause:** Apollo bug or campaign in invalid state  
**Solution:**
- Delete the campaign and recreate it with contacts + sequences
- Use Apollo support chat for campaign recovery
- Export contacts and rebuild in fresh campaign

### Account shows healthy in UI but API says daily_limit: 0

**Cause:** Apollo UI cache is stale  
**Solution:**
- Always trust the API, not the UI
- Force refresh by disconnecting and reconnecting OAuth

### Daily limit is restored but emails not sending

**Cause:** Campaign not linked OR warmup throttling OR bounce rate too high  
**Solution:**
- Verify campaign has email account linked
- Check Warmbox warmup progress (needs 2-4 weeks to ramp up)
- Check bounce rate (>5% will auto-pause sending)

## Rollback Plan

If the rebuild fails or Google continues revoking:

1. **Preserve data:**
   - Export all contact lists from Apollo (CSV)
   - Save campaign sequences (copy email templates)
   - Archive in `investor-outreach/archive/apollo-export-[date]/`

2. **Sunset Apollo:**
   - Cancel Apollo subscription (currently on free tier, so no cost)
   - Remove OAuth connections
   - Archive apollo-config.json

3. **Alternative outreach methods:**
   - Manual Gmail outreach (max 10/day per account to avoid spam flags)
   - LinkedIn outreach (no email needed)
   - Mailchimp for investor newsletters (separate from Apollo)
   - Warm introductions via network

## Success Metrics

After rebuild completion, track for 2 weeks:

- **OAuth stability:** 0 revocations in 14 days
- **Campaign delivery:** >90% of scheduled emails actually sent
- **Bounce rate:** <5% across all campaigns
- **Reply rate:** >2% positive responses (baseline)

If any metric fails, revisit the rebuild plan or recommend sunset.

## Appendix: API Validation Scripts

### Check Single Account

```bash
python3 -c "
import json, urllib.request, os
config = json.load(open(os.path.expanduser('~/.claude/apollo-config.json')))
req = urllib.request.Request(
    f\"{config['base_url']}/email_accounts\",
    headers={'X-Api-Key': config['api_key'], 'User-Agent': 'curl/8.0'}
)
resp = urllib.request.urlopen(req, timeout=30)
accounts = json.loads(resp.read())
for acc in accounts.get('email_accounts', []):
    if acc.get('email') == 'anthony@unclemays.com':
        print(json.dumps(acc, indent=2))
"
```

### Check Single Campaign

```bash
python3 -c "
import json, urllib.request, os
config = json.load(open(os.path.expanduser('~/.claude/apollo-config.json')))
campaign_id = '69d2a0b2c2e0c6000d1608d4'  # Tier 1
req = urllib.request.Request(
    f\"{config['base_url']}/emailer_campaigns/{campaign_id}\",
    headers={'X-Api-Key': config['api_key'], 'User-Agent': 'curl/8.0'}
)
resp = urllib.request.urlopen(req, timeout=30)
camp = json.loads(resp.read())
print(json.dumps(camp.get('emailer_campaign', {}), indent=2))
"
```

---

**Last Updated:** 2026-04-14  
**Author:** CIO  
**Issue:** [UNC-243](/UNC/issues/UNC-243)
