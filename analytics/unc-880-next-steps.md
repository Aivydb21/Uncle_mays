# UNC-880 Next Steps — Manual Execution Required

**Status:** Blocked on Paperclip API connectivity  
**Date:** 2026-05-06  
**Issue:** [UNC-880](/UNC/issues/UNC-880)

## What Was Completed

1. ✅ Diagnosed root cause: Meta ads route through redirect pages instead of landing directly on `/shop`
2. ✅ Audited homepage CTA (confirmed it's fine)
3. ✅ Wrote comprehensive recommendation: `analytics/cro-recommendation-unc-880.md`
4. ✅ Prepared board approval request payload: `analytics/unc-880-approval-request.json`

## Infrastructure Blocker

**Paperclip API unreachable:** `http://paperclip.taila8b3ff.ts.net:3100`
- Connection refused on all attempts (curl, npx paperclipai)
- Cannot create approval request via API
- Cannot update issue status to `blocked`
- Cannot post comments to issue thread

## Required Manual Actions

### Action 1: Fix Paperclip API Connectivity

```bash
# Check if Paperclip server is running
curl http://paperclip.taila8b3ff.ts.net:3100/api/health

# If not running, start it
pnpm paperclipai run
# OR
pnpm dev
```

### Action 2: Create Board Approval Request

Once API is reachable:

```bash
# Using CLI
npx paperclipai approval create \
  --company-id "4feca4d1-108b-4905-b16a-ed9538c6f9ef" \
  --type "request_board_approval" \
  --requested-by-agent-id "0df6fe9a-9676-41e7-89e9-724d05272a51" \
  --issue-ids "<UNC-880-UUID>" \
  --payload @analytics/unc-880-approval-request.json \
  --json

# OR using curl
curl -X POST \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  "$PAPERCLIP_API_URL/api/companies/4feca4d1-108b-4905-b16a-ed9538c6f9ef/approvals" \
  -d @analytics/unc-880-approval-request.json
```

**Note:** Need to convert "UNC-880" identifier to UUID first:
```bash
npx paperclipai issue get UNC-880 --json | jq -r '.id'
```

### Action 3: Update UNC-880 Status to Blocked

```bash
curl -X PATCH \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
  "$PAPERCLIP_API_URL/api/issues/UNC-880" \
  -d '{
    "status": "blocked",
    "comment": "Blocked pending board approval for Meta ad destination URL changes. Approval request filed. Recommendation in analytics/cro-recommendation-unc-880.md"
  }'
```

### Action 4: Link Approval to Issue (if not auto-linked)

The approval creation should auto-link via `issueIds`, but if needed:
```bash
# Check approval was linked
npx paperclipai approval get <approval-id> --json | jq '.issueIds'
```

## What Happens After Approval

**If approved:**
1. Update 8 Meta ad creatives in campaign `120243766361490762`:
   - Change `/get-started` → `/shop?promo=FRESH10` (Cold Broad, Cold Engagement)
   - Change `/checkout/family` → `/shop?promo=FRESH10` (Retargeting)
2. Preserve all UTM parameters
3. Monitor for 7 days:
   - Target: /shop reach rate 40%+
   - Watch: add_to_cart and purchase rates

**If rejected/revision requested:**
1. Address feedback
2. Resubmit approval with updated recommendation

## Reference Documents

- **Diagnosis & recommendation:** `analytics/cro-recommendation-unc-880.md`
- **Approval payload:** `analytics/unc-880-approval-request.json`
- **Current ad config:** `ad-exports/onetime-launch-apr26/DEPLOYED-IDS.md`
- **Ad campaign IDs:** `.meta-campaign-ids.json`

## Contact

- **Agent:** CRO (0df6fe9a-9676-41e7-89e9-724d05272a51)
- **Run:** 7bde0256-1516-4f9c-a59d-368fa940c55c
- **Issue:** UNC-880
