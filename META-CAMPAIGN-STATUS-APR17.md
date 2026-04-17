# Meta Campaign Launch Status - April 17, 2026

## Campaign Structure ✓ COMPLETE

**Campaign ID:** `120243219649250762`
- Status: PAUSED (per governance)
- Budget: $67/day (CBO)
- Objective: Conversions
- Optimization: PURCHASE events

**Ad Sets Created (3):**

1. **Instagram Feed** - `120243219914430762`
   - Placement: Instagram Feed only
   - Targeting: Women 25-50, Chicago 25mi radius (updated 2026-04-17 based on actual customer data)
   - Bid: $2.00 cap
   - Pixel: 2276705169443313 (PURCHASE event)

2. **Instagram Stories** - `120243219918030762`
   - Placement: Instagram Stories only
   - Targeting: Women 25-50, Chicago 25mi radius (updated 2026-04-17 based on actual customer data)
   - Bid: $2.00 cap
   - Pixel: 2276705169443313 (PURCHASE event)

3. **Facebook Feed** - `120243219919870762`
   - Placement: Facebook Feed only
   - Targeting: Women 25-50, Chicago 25mi radius (updated 2026-04-17 based on actual customer data)
   - Bid: $2.00 cap
   - Pixel: 2276705169443313 (PURCHASE event)

**Targeting Rationale:** Initial targeting was women 25-35. Updated to 25-50 after analyzing last week's orders, which came from women ages 35-50. Expanded range captures both hypothesis (25-35) and actual customer data (35-50).

## Video Assets ✓ UPLOADED

**Uploaded to Meta:**
- Video 1: `1437672617665607` (9.4MB)
- Video 2: `2355242318591638` (9.2MB)

**Note:** Meta's actual upload limit is ~10MB (not the documented 4MB).

## Static Image Assets (Status: User Uploading Manually)

**Location:** `C:\Users\Anthony\Desktop\business\ad-exports\subscription-launch-apr17\static-images\`

**Meta Assets (10 images):**
- 5 Feed images (1080x1080): feed-variant-1 through feed-variant-5
- 5 Stories images (1080x1920): stories-variant-1 through stories-variant-5

**Status:** User is manually uploading via Meta Ads Manager UI.

## Ads ✓ CREATED

**Facebook Page:** `755316477673748` (Uncle May's Produce)
**Thumbnail Image:** `7aef798892a38251a52c4e3f72716993` (meta_feed_chicago_families_1080x1080.png)

**6 Video Ads Created (All PAUSED):**

1. **Instagram Feed - Video 1**
   - Ad ID: `120243221203760762`
   - Creative ID: `1280764066819531`
   - Video: `1437672617665607`

2. **Instagram Feed - Video 2**
   - Ad ID: `120243221205970762`
   - Creative ID: `3966684956796146`
   - Video: `2355242318591638`

3. **Instagram Stories - Video 1**
   - Ad ID: `120243221207200762`
   - Creative ID: `1280764066819531`
   - Video: `1437672617665607`

4. **Instagram Stories - Video 2**
   - Ad ID: `120243221208210762`
   - Creative ID: `3966684956796146`
   - Video: `2355242318591638`

5. **Facebook Feed - Video 1**
   - Ad ID: `120243221208940762`
   - Creative ID: `1577563503305032`
   - Video: `1437672617665607`

6. **Facebook Feed - Video 2**
   - Ad ID: `120243221209870762`
   - Creative ID: `1306430608106512`
   - Video: `2355242318591638`

~~**Manual Creation Steps (15 min):**~~ (NO LONGER NEEDED - COMPLETED VIA API)

1. Go to https://business.facebook.com/adsmanager
2. Navigate to campaign `120243219649250762`
3. Create 6 video ads total (2 per ad set):

### For Each Ad Set:

**Ad Set: Instagram Feed (`120243219914430762`)**
- Create 2 ads using Video 1 and Video 2

**Ad Set: Instagram Stories (`120243219918030762`)**
- Create 2 ads using Video 1 and Video 2

**Ad Set: Facebook Feed (`120243219919870762`)**
- Create 2 ads using Video 1 and Video 2

### Ad Creative Template:

```
Format: Single Video
Video ID: [Use 1437672617665607 or 2355242318591638]

Primary Text:
Get farm-fresh produce boxes delivered to your door every week. Support local farmers and eat healthier. Join our community today!

Headline:
Fresh Produce Delivered Weekly

Description (optional):
Fresh, locally-sourced produce from Chicago-area farms

Call-to-Action: Shop Now

Website URL:
https://unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=video&utm_campaign=subscription_launch_apr2026

Status: PAUSED
```

## API Integration ✓ WORKING

**Scripts Created:**
- `scripts/launch-meta-campaign.py` - Campaign + ad set creation (WORKING)
- `scripts/test-meta-video-upload.py` - Video upload testing (WORKING)
- `scripts/create-meta-video-ads.py` - Ad creation (BLOCKED by page requirement)

**Meta Config:** `~/.claude/meta-config.json`
```json
{
  "app_id": "2351398258672070",
  "access_token": "[REDACTED]",
  "base_url": "https://graph.facebook.com/v21.0",
  "ad_account_id": "act_814877604473301",
  "account_name": "Second Try"
}
```

**Missing for Full API Automation:**
- `page_id` - Facebook Page ID for Uncle May's Produce

## To Enable Full API Automation

1. **Create Facebook Page** (if not exists):
   - Go to https://www.facebook.com/pages/create
   - Business Name: Uncle May's Produce
   - Category: Grocery Store
   - Address: [Hyde Park location]

2. **Connect Page to Ad Account**:
   - Go to https://business.facebook.com/settings
   - Pages → Add Page or Request Access
   - Link the Uncle May's Produce page to ad account `act_814877604473301`

3. **Get Page ID and Update Config**:
   ```bash
   # Get page ID
   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=[TOKEN]"
   
   # Add to config
   echo '{"page_id": "[PAGE_ID]"}' >> ~/.claude/meta-config.json
   ```

4. **Future Ad Creation Will Be Fully Automated**:
   ```bash
   python scripts/create-meta-video-ads.py
   ```

## Campaign Status: ⚠️ HOLD - CRITICAL ISSUE RESOLVED

**CRITICAL ISSUE FOUND & FIXED (2026-04-17):**
- Campaign went LIVE targeting **New York City** instead of Chicago
- **$0 spent** (caught within hours, no delivery occurred)
- Campaign **PAUSED** by CRO
- Targeting **CORRECTED** to Chicago, IL (25mi radius)
- All 3 ad sets verified: Women 25-50, Chicago 25mi ✅

**Root Cause:** Geo key error during ad set creation (NYC key 2490299 used instead of Chicago key 2438177)

### Completed:
- ✓ Campaign structure created
- ✓ 3 ad sets configured with targeting, budgets, and placements
- ✓ **Targeting corrected to Chicago, IL** (verified 2026-04-17)
- ✓ 2 videos uploaded
- ✓ 1 thumbnail image uploaded
- ✓ 6 video ads created programmatically
- ✓ Facebook Page connected (`755316477673748`)
- ✓ API integration working end-to-end

### Blockers (Must Complete Before Activation):
1. ⚠️ **Advertising Creative**: Ship 3 more video variants (need 5 total minimum) - BLOCKING
2. ⚠️ **Advertising Creative**: Upload 10 static images - BLOCKING
3. ⚠️ **RevOps**: Run test purchase to verify Meta Pixel PURCHASE event - BLOCKING
4. ⚠️ **CTO**: Confirm Stripe checkout defaults to subscription - BLOCKING
5. ⚠️ **Board**: Approve $67/day spend commitment - BLOCKING

### Pending Board Approval:
- **Spend Commitment:** $67/day = ~$2,010/month
- **Projected CAC:** $101 (just above $100 target, acceptable for Month 1 test)
- **Projected Orders:** 20/month from Meta
- **Target:** 30 produce boxes/week revenue target
- **Conversion Tracking:** Meta Pixel `2276705169443313` tracking PURCHASE events

### Next Steps:

1. ⏳ **Advertising Creative**: Ship 3+ video variants by EOD 2026-04-18
2. ⏳ **Advertising Creative**: Upload 10 static images by EOD 2026-04-17
3. ⏳ **RevOps**: Test purchase verification by 2026-04-18 AM
4. ⏳ **CTO**: Verify subscription default by 2026-04-18 AM
5. ⏳ **Board**: Review full CRO assessment in `META-ADS-REVIEW-APR17.md`
6. ⏳ **Board**: Approve $67/day spend commitment
7. ⏳ **CRO**: Activate campaign once blockers cleared (target: 2026-04-19 AM)

**Full Review:** See `META-ADS-REVIEW-APR17.md` for comprehensive strategic assessment, risk analysis, and recommendations.

## Google Ads Status

**Paused per user direction.** Focus is on Meta launch first.

---

**Last Updated:** 2026-04-17 18:32 UTC
**Updated By:** CRO (Paperclip Agent)
**Status:** ✓ Complete, awaiting board approval for activation
**Issue:** [UNC-365](/UNC/issues/UNC-365)
