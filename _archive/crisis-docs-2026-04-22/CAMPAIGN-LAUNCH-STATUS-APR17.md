# Campaign Launch Status — April 17, 2026

**Issue:** UNC-365  
**Owner:** CRO  
**Status:** READY FOR MANUAL LAUNCH (API blocked)  
**Time:** 11:57 AM CT

---

## EXECUTIVE SUMMARY

**All creative assets are ready** for launch. However, both Meta and Google Ads APIs have access issues that require manual intervention. **Fastest path to launch: Manual setup via platform UIs** (30-45 minutes total).

---

## ASSETS READY ✅

### Static Images (25 total)
**Location:** `ad-exports/subscription-launch-apr17/static-images/`

- **Google Performance Max (15 images):**
  - 5 landscape (1200x628): 700KB-900KB each
  - 5 square (1080x1080): 800KB-1.5MB each
  - 5 portrait (1080x1350): 1.1MB-1.5MB each

- **Meta (10 images):**
  - 5 Feed (1080x1080): 827KB-1.5MB each
  - 5 Stories (1080x1920): 1.2MB-2.3MB each

**Quality:** Professional, brand-compliant, subscription-focused messaging, FREESHIP promo featured.

### Video Assets (3 total)
**Location:** `ad-exports/subscription-launch-apr17/video-ads/final-renders/`

- **Meta folder:** 3 videos (29MB, 76MB, 82MB) ⚠️ **TOO LARGE** (Meta limit: 4MB)
- **Google Ads folder:** 3 videos (same files) ✅ **OK** (Google limit: 100MB)

**Action needed:** Compress videos for Meta (<4MB) before upload.

### Copy Assets ✅
**Location:** `ad-exports/subscription-launch-apr17/google-performance-max-copy.md`

- 5 Headlines (<30 chars)
- 5 Long Headlines (<90 chars)
- 5 Descriptions (<90 chars)
- Business name, CTA, UTM-tagged URLs

---

## API ACCESS STATUS

### Meta API: ❌ BLOCKED
**Error:** `OAuthException: An active access token must be used` (error 2500)  
**Config:** `~/.claude/meta-config.json`  
**Ad Account:** `act_814877604473301`

**Root cause:** Access token expired or revoked (same issue as April 16).

**Resolution options:**
1. **Manual setup via Meta Ads Manager** (recommended, fastest) — 20-30 minutes
2. Re-authenticate Meta API access (Anthony logs into facebook.com, re-authorizes app) — 10 minutes + re-run upload scripts

### Google Ads API: ⚠️ PERMISSION ISSUE
**Error:** `403 USER_PERMISSION_DENIED` on campaign queries  
**Config:** `~/.claude/google-ads-config.json`  
**Customer ID:** `6015592923` (operating account)  
**MCC ID:** `6758950400` (manager account)

**Diagnosis:**
- ✅ OAuth refresh token works (access token obtained)
- ✅ Can list accessible customers
- ❌ Cannot query campaigns in operating account (permission denied)
- Script IS setting `login-customer-id` header correctly

**Root cause:** Account permissions not fully propagated or MCC relationship incomplete.

**Resolution options:**
1. **Manual setup via Google Ads UI** (recommended, fastest) — 15-20 minutes
2. Anthony reviews account permissions in Google Ads Admin — verify CRO/RevOps has Standard or Admin access to customer `6015592923`

---

## LAUNCH PLAN: MANUAL SETUP (FASTEST PATH)

Given API blockers, **manual setup is the fastest path to launch today.**

### Step 1: Meta Campaigns (20-30 min)
**Platform:** https://business.facebook.com/adsmanager

1. Create campaign:
   - Objective: Sales (Advantage+ Shopping Campaign)
   - Budget: $67/day ($2,000/month)
   - Status: Start PAUSED

2. Create 3 ad sets:
   - **IG Feed:** Women 25-35, 25mi radius of Hyde Park
   - **IG Stories:** Same targeting
   - **FB Feed:** Same targeting

3. Upload creatives:
   - Upload 10 images from `ad-exports/subscription-launch-apr17/static-images/` (5 Feed + 5 Stories)
   - Add primary text, CTA, destination URL with UTM params

4. Verify Meta Pixel tracking fires on checkout

5. Activate campaign

**Video upload:** SKIP FOR NOW (files too large, need compression).

### Step 2: Google Ads Campaigns (15-20 min)
**Platform:** https://ads.google.com

**Campaign 1: Performance Max ($600/month, $20/day)**
1. Create Performance Max campaign
2. Create asset group "Subscription Launch Apr 2026"
3. Upload 15 images from `ad-exports/subscription-launch-apr17/static-images/pmax_*`
4. Copy headlines, descriptions, business name from `google-performance-max-copy.md`
5. Set final URL: `https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP`
6. Budget: $20/day
7. Status: Start PAUSED

**Campaign 2: Search ($300/month, $10/day)**
1. Create Search campaign
2. Add keywords:
   - [uncle may's produce] (branded)
   - [produce box chicago]
   - [black owned grocery chicago]
3. Write 3 text ads (use copy from Performance Max)
4. Budget: $10/day
5. Status: Start PAUSED

**Campaign 3: YouTube ($100/month, $3/day)**
1. Create Video campaign
2. Upload 3 videos from `ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`
3. Set destination URL with UTM params
4. Budget: $3/day
5. Status: Start PAUSED

**Video upload:** ✅ OK (files under 100MB, Google accepts).

### Step 3: Verify Tracking (10 min)
1. Meta Pixel fires on `checkout` events
2. GA4 captures UTM parameters
3. Promo code `FREESHIP` works in Stripe checkout
4. Test conversions in both platforms (sandbox or real)

### Step 4: Activate Campaigns (2 min)
1. Meta: Set campaign to ACTIVE
2. Google Ads: Set all 3 campaigns to ACTIVE
3. Monitor for first 2 hours (impressions, clicks, errors)

**Total time:** 45-60 minutes

---

## VIDEO COMPRESSION WORKFLOW (FOLLOW-UP)

### Goal
Compress 3 video files from 29-82MB down to <4MB each for Meta upload.

### Requirements
- Install ffmpeg (not currently on system)
- Target: <4MB per video, maintain quality
- Format: MP4 (H.264 codec)
- Resolutions: 1080x1920 (Stories/Reels), 1080x1080 (Feed)

### Compression script (pseudo-code)
```bash
# Install ffmpeg
# Windows: choco install ffmpeg OR download from ffmpeg.org

# Compress for Meta (target 3.5MB to stay under 4MB limit)
ffmpeg -i "01- Don Johnson Sample.mp4" \
  -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1080:1920" \
  -b:v 800k -maxrate 1000k -bufsize 2000k \
  -c:a aac -b:a 128k \
  "01-don-johnson-meta-compressed.mp4"

# Repeat for other 2 videos
```

### Timeline
- Install ffmpeg: 5-10 minutes
- Compress 3 videos: 15-20 minutes (processing time)
- Upload to Meta: 5 minutes
- **Total:** 25-35 minutes

**Recommendation:** Launch today with static images, add compressed videos tomorrow (April 18) as Week 1 creative refresh.

---

## CAMPAIGN PERFORMANCE TARGETS (WEEK 1)

**Success Metrics:**
- CTR (Click-Through Rate): ≥1.5%
- CPC (Cost Per Click): ≤$2.00
- CAC (Cost Per Acquisition): <$100
- Orders: 15-20 in first week

**Kill Criteria:**
- Any variant with CTR <1% for 7 days = kill and replace

**Daily Monitoring:**
- RevOps pulls performance data each morning
- CRO reviews and flags underperformers
- Advertising Creative ships replacements as needed

---

## NEXT STEPS (PRIORITY ORDER)

### Today (April 17) — LAUNCH DAY
1. **Anthony:** Manual Meta campaign setup (20-30 min) [HIGHEST PRIORITY]
2. **Anthony:** Manual Google Ads campaign setup (15-20 min)
3. **RevOps:** Verify tracking (Meta Pixel, GA4, UTM params)
4. **CRO:** Monitor first 4 hours of campaign performance

### Tomorrow (April 18) — WEEK 1 MONITORING
1. **RevOps:** Daily performance report (CTR, CPC, impressions by variant)
2. **CRO:** Review and identify underperformers (<1% CTR)
3. **Advertising Creative:** Prepare video compression workflow

### Week 2 (April 21-24) — CREATIVE REFRESH
1. **Advertising Creative:** Compress and upload 3 videos to Meta
2. **Advertising Creative:** Add videos to Google YouTube campaign
3. **CRO:** Kill bottom 50% of static variants, double down on winners

---

## FILES & RESOURCES

**Asset directories:**
- Static images: `ad-exports/subscription-launch-apr17/static-images/`
- Videos (Google-ready): `ad-exports/subscription-launch-apr17/video-ads/final-renders/google-ads/`
- Videos (need compression): `ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/`

**Documentation:**
- Performance Max copy: `ad-exports/subscription-launch-apr17/google-performance-max-copy.md`
- Launch readiness: `LAUNCH-READY-APR17.md`
- Creative brief: `advertising-creative-brief-subscription-launch.md`
- Video integration plan: `MARKETING-ROLLOUT-PLAN-VIDEO-UPDATE.md`

**Config files:**
- Meta: `~/.claude/meta-config.json` (access token expired)
- Google Ads: `~/.claude/google-ads-config.json` (permission issue on queries)

---

## BLOCKERS SUMMARY

| Blocker | Impact | Resolution | ETA |
|---------|--------|------------|-----|
| Meta API access expired | Can't upload programmatically | Manual UI setup OR re-auth | 20 min (manual) |
| Google Ads API permissions | Can't create campaigns via API | Manual UI setup OR fix permissions | 15 min (manual) |
| Videos too large for Meta | Can't upload videos to Meta | Compress with ffmpeg | 30 min (tomorrow) |

**Bottom line:** Launch today with manual setup (45-60 min), add videos tomorrow after compression.

---

**Prepared by:** CRO  
**Date:** 2026-04-17, 11:57 AM  
**Status:** READY FOR MANUAL LAUNCH
