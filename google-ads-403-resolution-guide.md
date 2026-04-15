# Google Ads API 403 Error - Resolution Guide

## Problem

Google Ads API returns `403 USER_PERMISSION_DENIED` when trying to query campaigns in the operating account (6015592923) from the MCC account (6758950400).

## Root Cause

**The OAuth user lacks Standard/Admin access to the operating account**, or the **API access level is limited to Basic**.

## What Works

- ✅ OAuth token exchange
- ✅ `listAccessibleCustomers` (shows both accounts)
- ✅ Querying the MCC account directly (6758950400)

## What Fails

- ❌ Querying the operating account (6015592923) with MCC credentials
- ❌ Error: `"User doesn't have permission to access customer"`

## Resolution Steps

### Option 1: Upgrade API Access Level (Recommended)

1. Go to Google Ads UI: https://ads.google.com
2. Navigate to **Tools & Settings** > **Setup** > **API Center**
3. Check the **API access level**:
   - If it shows "Basic access": Click **Apply for Standard access**
   - Fill out the form (may require business verification)
   - Wait for Google approval (1-2 business days)

### Option 2: Grant Admin Access to OAuth User

1. Go to the operating account in Google Ads UI (6015592923)
2. Navigate to **Tools & Settings** > **Access & security** > **User access**
3. Find the OAuth user's email and check their access level
4. If not "Admin", upgrade to "Admin" or "Standard" access
5. Save and wait 10 minutes for permissions to propagate

### Option 3: Verify MCC Link Access Level

1. Go to MCC account (6758950400) in Google Ads UI
2. Navigate to **Accounts** > **Performance**
3. Find the operating account (6015592923) in the list
4. Click the account and check **Access level**
5. If it's "Read-only", upgrade to "Standard" access

### Option 4: Use Manual Conversion Tracking (Fallback)

If API access cannot be resolved quickly:

1. Go to Google Ads > **Goals** > **Conversions**
2. Click **+ New conversion action**
3. Select **Import** > **Other data sources** > **Track conversions from clicks**
4. Set up conversion goal: **Purchase**
5. Copy the conversion tag/pixel code
6. Send to CTO for website installation at `/api/webhook` or checkout confirmation page

**Trade-off:** Manual setup works immediately but loses API automation (no Stripe-to-Google Ads sync, no programmatic reporting).

## Testing After Fix

Run the diagnostic script to confirm:

```bash
python scripts/test-google-ads-api.py
```

Expected output:
```
[OK] listAccessibleCustomers succeeded
[OK] Campaign search succeeded
[OK] All API tests passed!
```

## Next Steps After Fix

Once API access is working:

1. Set up conversion tracking (import Stripe purchases via API)
2. Create conversion action for "Purchase" events
3. Build automated sync: Stripe webhook → Google Ads Offline Conversion Import
4. Test with a real purchase from Stripe
5. Verify conversion shows up in Google Ads UI (Goals > Conversions)

## Current Status

- **Config:** Complete ✅
- **OAuth:** Complete ✅
- **Developer Token:** Approved ✅
- **API Access:** **Blocked - needs Standard access or user permission upgrade** ❌

## Recommended Action

**Apply for Standard API access** (Option 1) while also checking user permissions (Option 2). Standard access is required for production use anyway, and will solve the MCC-to-client query issue permanently.

Estimated time to resolve: 1-2 business days (Google approval time).

## Escalation

If Standard access is denied or delayed beyond 3 business days, fall back to manual conversion tracking (Option 4) and revisit API access later.
