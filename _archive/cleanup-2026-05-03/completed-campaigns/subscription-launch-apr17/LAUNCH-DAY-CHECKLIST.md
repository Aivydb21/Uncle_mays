# Launch Day Checklist — Apr 17, 2026
**Task:** UNC-358 (URGENT)  
**Deadline:** 6pm CT today  
**Total Time:** 45 minutes

---

## Overview

Both Google Ads API and Meta API are blocked (permissions/auth errors). **Manual upload is the fastest path to launch today.**

All 25 static images are ready in `ad-exports/subscription-launch-apr17/static-images/`

---

## Your Action Items (Execute in Order)

### ✅ Step 1: Upload Google Ads Performance Max (30 min)
**Guide:** `MANUAL-UPLOAD-GOOGLE-ADS.md`

**Deliverables:**
- [ ] Performance Max campaign created with 15 images
- [ ] Budget: $20/day
- [ ] All copy added (5 headlines, 5 long headlines, 5 descriptions)
- [ ] UTM tracking: `?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP`
- [ ] Campaign status: ENABLED (or PAUSED for review)

**Bonus:**
- [ ] Google Search campaign created with branded keywords
- [ ] Budget: $10/day

---

### ✅ Step 2: Upload Meta Ads (20 min)
**Guide:** `MANUAL-UPLOAD-META-ADS.md`

**Deliverables:**
- [ ] Advantage+ Shopping Campaign created
- [ ] 10 ad variants uploaded (5 Feed 1080x1080, 5 Story 1080x1920)
- [ ] All ad copy added (primary text, headline, description)
- [ ] Budget: $67/day
- [ ] UTM tracking: `?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&promo=FREESHIP`
- [ ] Campaign status: ACTIVE

---

### ✅ Step 3: Verify Tracking (15 min)
**Guide:** `TRACKING-VERIFICATION.md`

**Deliverables:**
- [ ] Meta Pixel fires on landing page
- [ ] GA4 tracks page views with UTM parameters
- [ ] FREESHIP promo code works in Stripe checkout
- [ ] UTM parameters flow from ad click to Stripe metadata

---

## Quick Reference: File Locations

### Static Images (25 total)
**Directory:** `ad-exports/subscription-launch-apr17/static-images/`

**Google Performance Max (15 images):**
- 5 landscape (1200x628): `pmax_landscape_*.png`
- 5 square (1080x1080): `pmax_square_*.png`
- 5 portrait (1080x1350): `pmax_portrait_*.png`

**Meta Feed + Stories (10 images):**
- 5 Feed (1080x1080): `meta_feed_*.png`
- 5 Story (1080x1920): `meta_story_*.png`

### Copy & Instructions
- Google Ads copy: `google-performance-max-copy.md`
- Google Ads guide: `MANUAL-UPLOAD-GOOGLE-ADS.md`
- Meta Ads guide: `MANUAL-UPLOAD-META-ADS.md`
- Tracking guide: `TRACKING-VERIFICATION.md`

---

## Campaign Settings Summary

| Platform | Campaign Type | Budget | UTM Campaign | Promo Code |
|----------|--------------|--------|--------------|------------|
| Google Ads | Performance Max | $20/day | subscription_launch_apr2026 | FREESHIP |
| Google Ads | Search (Branded) | $10/day | branded_apr2026 | FREESHIP |
| Meta | Advantage+ Shopping | $67/day | conversion_apr21 | FREESHIP |
| **TOTAL** | **3 campaigns** | **$97/day** | **$679/week** | **FREESHIP** |

---

## Success Metrics (What to Watch Week 1)

**Google Ads:**
- CTR: Target 1.5%+
- CPC: Target <$2.00
- Conversions: Track in GA4 + Stripe

**Meta:**
- CTR: Target 1.5%+
- CPC: Target <$2.00
- CPM: Expect $10-$20 (Chicago market)
- Conversions: Track via Meta Pixel + Stripe

**Overall:**
- CAC Target: <$100
- Orders Target: 5-10 orders Week 1 (proof of concept)

---

## What to Do After Launch

1. **Wait 1 hour** for ads to start serving
2. **Run verification checklist** (TRACKING-VERIFICATION.md)
3. **Monitor for 24 hours** (check Ads Manager dashboards)
4. **Report results** in UNC-358 Paperclip thread
5. **Week 1 review** (Friday Apr 21): Share performance data with CRO + Advertising Creative

---

## Troubleshooting

**Google Ads not serving?**
- Check payment method is valid
- Performance Max can take 24-48 hours to ramp up
- Search ads should serve immediately for branded keywords

**Meta ads rejected?**
- Check rejection reason in Ads Manager
- Request review if rejection seems incorrect
- Most Uncle May's ads should pass (no health claims, no personal attributes)

**Tracking broken?**
- See TRACKING-VERIFICATION.md for step-by-step debugging
- Coordinate with RevOps or CTO to fix
- Do NOT scale budget until tracking is confirmed working

**Need help?**
- Slack the CRO (channel strategy, budget questions)
- Slack RevOps (tracking, GA4, conversion questions)
- Slack CTO (pixel, website, technical questions)
- Post in UNC-358 Paperclip thread (urgent blockers)

---

## API Blockers (Why Manual Upload)

**Google Ads API:**
- Error: 403 Forbidden, USER_PERMISSION_DENIED
- Likely cause: Account permissions not fully propagated despite config being correct
- Timeline to fix: Unknown (API debugging can take days)

**Meta API:**
- Error: 190/460 (token invalid/revoked)
- Likely cause: OAuth token expired or app permissions changed
- Timeline to fix: Requires re-auth flow (30-60 min)

**Decision:** Manual upload is faster and more reliable for today's launch deadline.

---

## Next Steps (Post-Launch)

1. **Fix API access** for future campaigns (coordinate with CTO/RevOps)
2. **Week 2 creative refresh** (Apr 21-28): Ship 5 new variants based on Week 1 performance
3. **Video ads** (Week 2): Add 3 DIY videos to Meta campaigns (UNC-355)
4. **Scale budget** (Week 3+): If CAC <$100, scale to $150/day ($1,050/week)

---

**Status:** READY TO EXECUTE  
**Owner:** Anthony (with support from Advertising Creative)  
**Estimated completion:** 6pm CT today (Apr 17)
