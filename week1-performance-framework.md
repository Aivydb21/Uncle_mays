# Week 1 Performance Framework — Subscription Launch Campaign

**Campaign:** Subscription Launch April 2026  
**Owner:** CRO  
**Date:** 2026-04-17 (Launch Day)  
**Status:** ACTIVE

---

## Current Baseline (Pre-Launch)

**Revenue Status (as of Apr 17, 11:30am):**
- Last 7 days: 1 order ($75)
- Current run rate: ~3 orders/week
- Stripe balance: $0 available, $72.52 pending
- **Target: 30 orders/week (10x current baseline)**

**Campaign Readiness:**
- ✅ **Static creative:** 25 images ready (15 Google Ads + 10 Meta)
- ✅ **Google Ads API:** Fully configured, ready for upload
- ⏳ **Video creative:** 3 videos in production by Anthony (not yet uploaded)
- ❌ **Meta API:** BLOCKED (token error 190/460, requires re-auth or manual upload)

---

## Week 1 Success Metrics

### Primary Revenue Goal
**Target:** 30 orders/week starting Week 2 (Apr 24-30)  
**Week 1 (Apr 17-23) Target:** 15 orders (50% of target, ramp-up period)

**Breakdown by channel:**
| Channel | Week 1 Orders | Week 1 CAC Target | Week 1 Spend |
|---------|---------------|-------------------|--------------|
| Google Ads (Performance Max + Search) | 5-8 orders | <$100 | $200-300 |
| Meta Ads (if launched) | 8-12 orders | <$100 | $400-500 |
| Organic/Stakeholder (baseline) | 2-3 orders | $0 | $0 |
| **TOTAL** | **15-23 orders** | **<$100 blended** | **$600-800** |

### Creative Performance Benchmarks

**Static Image Ads:**
| Metric | Target | Industry Benchmark | Kill Threshold |
|--------|--------|-------------------|----------------|
| **CTR (Click-Through Rate)** | >1.5% | 0.9% static | <1.0% for 7 days |
| **CPC (Cost Per Click)** | <$2.00 | $1.50-2.50 | >$3.00 for 3 days |
| **Landing Page Conversion** | >2.0% | 1.5-2.5% | <1.0% for 3 days |
| **CAC (Cost Per Acquisition)** | <$100 | N/A | >$150 for 7 days |

**Video Ads (once launched):**
| Metric | Target | Industry Benchmark | Kill Threshold |
|--------|--------|-------------------|----------------|
| **CTR** | >1.8% | 1.2% video | <1.2% for 7 days |
| **3-Second Play Rate** | >45% | 40% (Meta) | <35% for 3 days |
| **Hook Rate (first 3sec)** | >40% | 35-40% | <30% for 3 days |
| **CPC** | <$1.80 | $1.20-2.00 | >$2.50 for 3 days |
| **CAC** | <$80 | N/A | >$120 for 7 days |

**Video vs Static Comparison:**
- If video CTR beats static by >0.3%: Shift budget toward video placements
- If video CAC <$80: Double down, produce more video variants in Week 2
- If static outperforms video after 7 days: Kill video refresh plan, focus on static iteration

---

## Platform-Specific Targets

### Google Ads (READY TO LAUNCH)

**Campaign Structure:**
- Performance Max: $600/month ($20/day)
- Search (branded + high-intent): $300/month ($10/day)
- YouTube (once videos arrive): $100/month ($3/day)

**Week 1 Google Ads Targets:**
| Metric | Target |
|--------|--------|
| Impressions | 15,000-20,000 |
| Clicks | 250-350 (1.5%+ CTR) |
| Orders | 5-8 (2%+ conversion) |
| Spend | $200-300 |
| CAC | <$50 (Google typically lower than Meta) |
| ROAS (6-month LTV) | 15x+ ($1,264 LTV / $80 CAC) |

**Action Items (URGENT - TODAY):**
1. Advertising Creative: Upload 15 static images to Google Ads Performance Max via API
2. Advertising Creative: Set up Search campaign with branded keywords
3. RevOps: Verify GA4 + Stripe conversion tracking
4. CRO (me): Monitor first 4 hours of traffic for errors/issues

### Meta Ads (BLOCKED - MANUAL WORKAROUND NEEDED)

**Campaign Structure:**
- Advantage+ Shopping Campaign: $2,000/month ($67/day)
- Feed + Stories + Reels placements

**Week 1 Meta Ads Targets (IF LAUNCHED):**
| Metric | Target |
|--------|--------|
| Impressions | 50,000-75,000 |
| Clicks | 500-750 (1.5%+ CTR) |
| Orders | 10-15 (2%+ conversion) |
| Spend | $400-500 |
| CAC | <$100 |
| ROAS (6-month LTV) | 12x+ |

**Blocker:** Meta API token invalid (error 190/460)

**Workaround Options:**
1. **Anthony re-authenticates Meta API** (5 minutes, preferred)
2. **Manual upload via Meta Ads Manager UI** (20 minutes, workable)
3. **Delay Meta launch until API fixed** (not recommended, loses Week 1 data)

**Recommendation:** Advertising Creative uploads 10 static images manually to Meta Ads Manager TODAY (Apr 17) to avoid missing launch window. Videos can be added Friday/Monday when Anthony uploads them.

---

## Week 1 Monitoring Framework

### Daily Tracking (RevOps Delivers to CRO)

**Every morning by 9am CT:**
- Stripe: New orders (count + revenue)
- Google Ads: Spend, clicks, CTR, CPC, conversions
- Meta Ads: Spend, clicks, CTR, CPC, conversions (if launched)
- GA4: Traffic, top pages, checkout funnel drop-off
- Alerts: Any campaign with >$50 spend and 0 conversions

**Every evening by 6pm CT:**
- Cumulative spend vs target ($600-800 Week 1)
- Cumulative orders vs target (15-23 Week 1)
- Blended CAC vs target (<$100)
- Top 3 performing variants (by CTR)
- Bottom 3 variants flagged for kill

### Mid-Week Check-In (Thursday Apr 17 → Wed Apr 23)

**Wednesday Apr 23, 5pm CT:**
- CRO + RevOps + Advertising Creative review Week 1 data
- Kill bottom 50% of static variants (CTR <1%)
- Identify top 3 hooks (Quality vs Culture vs Convenience)
- Plan Week 2 creative refresh (video + static)

**Decision gates:**
- If blended CAC >$150: Pause all campaigns, diagnose issue (creative, targeting, or landing page)
- If Google Ads outperforms Meta: Shift $200 from Meta → Google for Week 2
- If video (when launched) beats static CTR by >0.5%: Accelerate video production for Week 2

---

## Video Launch Coordination (PENDING)

**Current Status:**
- Anthony filming 3 DIY videos (20-40 seconds, 3 hooks)
- Expected upload: Today (Apr 17) or Friday (Apr 18)
- Directory: `ad-exports/subscription-launch-apr17/video-ads/final-renders/`

**When Anthony uploads VIDEO-MANIFEST.md:**

**Immediate Actions (within 2 hours):**
1. **CRO (me):** Review manifest for file count, durations, hooks, file sizes
2. **CRO:** Approve budget allocation for video vs static placements
3. **Advertising Creative:** Apply UTM tagging per RevOps standards
4. **Advertising Creative:** Write ad copy (headlines + descriptions) for each video
5. **Advertising Creative:** Upload to Google Ads (YouTube + Performance Max)
6. **Advertising Creative:** Upload to Meta Ads Manager (manual, Feed + Stories + Reels)
7. **RevOps:** Verify Meta Pixel + GA4 tracking fire on video ad clicks

**Video Performance Expectations:**
- First 24 hours: 3-second play rate >40% (Meta Stories/Reels)
- First 48 hours: CTR >1.5% (beat or match static)
- First 7 days: CAC <$100 (same as static target)

**If videos underperform static after 7 days:**
- Kill video variants
- Shift budget back to static
- Revisit video strategy: UGC testimonials or AI video tools for Week 3+

---

## Week 1 Creative Iteration Plan

### By End of Week 1 (Friday Apr 23):

**Kill Criteria (Apply to ALL Variants):**
- CTR <1.0% for 7 days → Kill immediately
- CPC >$3.00 for 3 days → Pause, review targeting
- Zero conversions after $100 spend → Kill and replace

**Replacement Plan:**
- For every killed variant, ship 1 new variant within 48 hours
- Test new hooks if existing hooks fail (e.g., if Quality Hook fails across all variants, try Affordability Hook)

**Week 2 Refresh (Apr 24-30):**
- Add 5 UGC testimonial videos (already scripted in `ugc-video-creative-briefs.md`)
- Film Week 2 videos on Monday Apr 21 for upload Wednesday Apr 23
- Replace bottom 50% of static images with new Midjourney-generated variants (custom produce photography)

---

## Success Criteria for Week 1

**🟢 GREEN (Proceed to Scale):**
- 15+ orders in Week 1
- Blended CAC <$100
- At least 3 static variants with CTR >2%
- Landing page conversion >2%
- **Action:** Increase budget to $1,000/week for Week 2

**🟡 YELLOW (Iterate & Optimize):**
- 10-14 orders in Week 1
- Blended CAC $100-150
- Top variant CTR 1.5-2%
- Landing page conversion 1.5-2%
- **Action:** Kill bottom 50% of variants, ship 5 new variants, re-test Week 2 at same budget

**🔴 RED (Pause & Diagnose):**
- <10 orders in Week 1
- Blended CAC >$150
- All variants CTR <1.5%
- Landing page conversion <1.5%
- **Action:** Pause all paid campaigns, diagnose root cause (creative issue, targeting issue, or product/pricing issue)

---

## Contingency Plans

### If Meta API Stays Broken:
- **Workaround:** Manual uploads via Meta Ads Manager UI (20 min per batch)
- **Impact:** Slower iteration speed, no programmatic A/B testing
- **Mitigation:** Advertising Creative handles manual uploads, RevOps pulls performance data via Meta API (read-only endpoints work)

### If Videos Arrive Late (After Apr 17):
- **Plan A:** Launch Thursday with 25 static images only (current plan)
- **Plan B:** Add videos Friday Apr 18 or Monday Apr 21 as creative refresh
- **Impact:** No Week 1 video data, but static ads already proven

### If Google Ads Underperforms:
- **Threshold:** If Google CAC >$150 for 3 days
- **Action:** Shift budget from Google Search → Performance Max (better ROAS historically)
- **Backup:** Increase Meta budget if Meta performs better

### If Landing Page Conversion <1%:
- **Likely cause:** Checkout friction, pricing objection, or unclear subscription messaging
- **Action:** CRO + CTO review checkout flow, A/B test copy changes
- **Quick fix:** Add trust signals (reviews, testimonials, "500+ families" badge) above fold

---

## Communication Cadence

**Daily (Mon-Fri, 9am CT):**
- RevOps delivers performance report to CRO via Paperclip comment or Slack

**Weekly (Friday 3pm CT):**
- CRO + RevOps + Advertising Creative sync call (15 minutes)
- Review: What worked, what failed, what to test next week
- Ship: Week 2 creative plan

**Ad Hoc:**
- If any campaign hits >$100 spend with 0 conversions: RevOps alerts CRO immediately
- If CAC spikes >$200: CRO pauses campaigns, investigates
- If video upload happens: CRO coordinates immediate upload (within 2 hours)

---

## Open Questions for Board/CEO

1. **Meta API:** Should we wait for Anthony to re-auth, or proceed with manual uploads today?
   - **CRO Recommendation:** Proceed with manual uploads TODAY to avoid losing launch day momentum

2. **Video Upload Timing:** When will Anthony upload the VIDEO-MANIFEST.md?
   - **Need clarity:** Today (Apr 17), Friday (Apr 18), or Monday (Apr 21)?

3. **Budget Flexibility:** If Google Ads crushes it at <$50 CAC, can we shift Meta budget → Google mid-week?
   - **CRO Position:** Yes, optimize toward better-performing channel within total $1,000/week envelope

4. **Week 2 Video Production:** Who films the 5 UGC testimonial videos?
   - Option A: Anthony placeholder videos (fastest)
   - Option B: Customer outreach via Mailchimp ($25 credit incentive, 7-day turnaround)
   - **CRO Recommendation:** Option A (Anthony) for speed

---

## Next Steps (URGENT - TODAY)

### Immediate (Next 2 Hours):

**CRO (me):**
- ✅ Create Week 1 performance framework (this document)
- ⏳ Comment on UNC-355 with status update and unblock plan
- ⏳ Coordinate with Advertising Creative on urgent uploads

**Advertising Creative:**
- ⏳ Upload 15 static images to Google Ads Performance Max via API (30 min)
- ⏳ Upload 10 static images to Meta Ads Manager manually (20 min, workaround for API issue)
- ⏳ Set up Google Search campaign with branded keywords (15 min)
- ⏳ Verify UTM tracking on all ad links

**RevOps:**
- ⏳ Set up daily performance tracking (Stripe + GA4 + Google Ads + Meta)
- ⏳ Create Week 1 dashboard (orders, spend, CAC, CTR by variant)
- ⏳ Verify Meta Pixel + GA4 conversion events fire correctly

**Anthony (via CEO):**
- ⏳ Re-authenticate Meta API (5 min) OR confirm manual upload workaround is OK
- ⏳ Upload VIDEO-MANIFEST.md when videos are ready

---

**Status:** ✅ Framework Complete  
**Owner:** CRO  
**Next Update:** Daily performance tracking starts tomorrow (Apr 18, 9am CT)  
**Launch:** TODAY (Apr 17) with static images, videos to follow ASAP

---

## Appendix: Performance Tracking Template (RevOps)

```markdown
# Daily Performance Report - Week 1 Day X

**Date:** 2026-04-XX  
**Prepared by:** RevOps  
**Delivered to:** CRO

## Orders & Revenue
- Today: X orders, $XXX revenue
- Week 1 Total: X orders (Target: 15-23)
- Current Run Rate: X orders/week

## Paid Campaign Performance

### Google Ads
- Spend: $XX (Budget: $30-40/day)
- Clicks: XX (CTR: X.X%)
- Orders: X (CAC: $XX)
- Top 3 Variants: [list by CTR]

### Meta Ads (if launched)
- Spend: $XX (Budget: $60-70/day)
- Clicks: XX (CTR: X.X%)
- Orders: X (CAC: $XX)
- Top 3 Variants: [list by CTR]

## Alerts
- [ ] Any campaign >$50 spend, 0 conversions?
- [ ] Any variant CTR <1% for >3 days?
- [ ] Blended CAC >$150?

## Recommendations
- Kill: [list underperforming variants]
- Double down: [list top performers]
- Next steps: [tactical adjustments]
```

---

**End of Framework**
