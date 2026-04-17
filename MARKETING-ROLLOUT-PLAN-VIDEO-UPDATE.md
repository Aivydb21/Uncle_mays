# Marketing Rollout Plan — Video Integration Update

**Updated:** 2026-04-17  
**Prepared by:** CEO  
**Context:** Anthony completing 3 DIY marketing videos (20-40 seconds each)  
**Status:** ACTIVE - Video production in progress

---

## EXECUTIVE SUMMARY

Anthony is producing 3 completed marketing video ads (20-40 seconds each) for the subscription launch campaign. This updates our rollout from static-first to video-accelerated launch.

**Impact:**
- **Week 1 (Apr 17-23):** Launch with static images + 3 completed videos (immediate video presence)
- **Week 2 (Apr 24-30):** Add 5 UGC testimonial videos (9 total video variants)
- **Week 3-4:** Refresh based on performance data

**Key Change:** Original plan called for UGC videos in Week 2. Anthony's DIY videos allow us to test video creative from Day 1 alongside static ads.

---

## Updated Campaign Timeline

### Week 1: Apr 17-23 (LAUNCH WEEK) — UPDATED

**Static Creative (unchanged):**
- 15 Google Performance Max images (landscape, square, portrait)
- 10 Meta images (Feed + Stories)

**Video Creative (NEW — Anthony's DIY videos):**
- 3 completed videos (20-40 seconds each)
- Ready for Meta (Instagram/Facebook Feed, Stories, Reels) and Google Ads (YouTube, Performance Max)
- To be stored in `ad-exports/subscription-launch-apr17/video-ads/final-renders/`

**Campaign Structure:**

| Channel | Creative Mix | Budget | Daily Limit |
|---------|--------------|--------|-------------|
| Meta (Facebook/Instagram) | 10 static images + 3 videos (13 variants) | $2,000/month | $67/day |
| Google Performance Max | 15 images + 3 videos | $600/month | $20/day |
| Google Search | Text ads only | $300/month | $10/day |
| Google YouTube | 3 videos | $100/month | $3/day |

**Performance Targets Week 1:**
- 30 orders/week (baseline revenue goal)
- <$100 CAC
- >1.5% CTR on video ads (vs >1.0% on static)
- Identify best-performing hook (Quality vs Culture vs Convenience)

---

### Week 2: Apr 24-30 (CREATIVE REFRESH)

**Add UGC Testimonial Videos:**
- 5 UGC-style customer testimonials (15-30 seconds, vertical 9:16)
- Film week of Apr 21, upload Apr 24
- Scripts already prepared in `ad-exports/subscription-launch-apr17/ugc-video-creative-briefs.md`

**Total Video Inventory After Week 2:**
- 3 Anthony DIY videos (Week 1)
- 5 UGC testimonials (Week 2)
- **= 9 total video variants**

**Week 2 Strategy:**
- Kill bottom 50% of Week 1 static images (based on CTR/CPC data)
- Double down on best-performing video hook
- Add 5 UGC videos as fresh creative (combat Meta fatigue)

---

### Week 3-4: May 1-14 (OPTIMIZATION)

**Performance-Based Refresh:**
- Ship 3-5 new variants based on what's working
- If video outperforms static: shift budget toward video placements
- If Quality Hook wins: produce 3 more quality-focused variants
- If Culture Hook wins: lean into Black-owned messaging
- If Convenience Hook wins: emphasize time-saving benefits

**Creative Tool Request (if needed):**
- If video production bottleneck identified, submit tool request for AI video gen or stock footage API
- See CLAUDE.md Creative Tool Request workflow

---

## Video Asset Integration Plan

### Anthony's 3 DIY Videos (Week 1)

**Expected Hooks (to be confirmed after upload):**
1. **Quality Hook:** Premium produce, cultural specificity, "your grandmother would approve"
2. **Culture Hook:** Black-owned, Hyde Park community, cultural pride
3. **Convenience Hook:** Time-saving, subscription benefits, "skip the grocery run"

**Format Requirements:**

| Platform | Aspect Ratio | Duration | File Format | Max Size |
|----------|--------------|----------|-------------|----------|
| Meta Feed | 1:1 square | 20-40s | MP4 (H.264) | <4MB |
| Meta Stories/Reels | 9:16 vertical | 20-40s | MP4 (H.264) | <4MB |
| YouTube Bumper | 16:9 or 1:1 | 15s (trim if needed) | MP4 (H.264) | <100MB |
| YouTube Skippable | 16:9 | 20-40s | MP4 (H.264) | <100MB |
| Performance Max | 16:9 or 1:1 | 20-40s | MP4 (H.264) | <100MB |

**Action Items:**
1. ✅ Anthony uploads completed videos to `ad-exports/subscription-launch-apr17/video-ads/final-renders/meta/` and `/google-ads/`
2. ✅ Anthony creates VIDEO-MANIFEST.md with file names, durations, hooks, file sizes
3. ⏳ CEO delegates to CRO: campaign upload coordination
4. ⏳ CEO delegates to Advertising Creative: UTM tagging, ad copy, platform upload execution

---

## Delegation Plan

### To CRO (Revenue Strategy)

**Task:** Coordinate video ad launch and performance monitoring

**Responsibilities:**
- Review Anthony's VIDEO-MANIFEST.md
- Approve budget allocation across video vs static placements
- Set performance benchmarks for video ads (CTR, CPC, CAC targets)
- Monitor Week 1 performance: which hook performs best?
- Recommend Week 2 creative refresh strategy based on data

**Timeline:** Immediate (videos ready for upload this week)

**Deliverable:** Campaign performance report by Apr 21 (end of Week 1) with recommendation for Week 2 mix

---

### To Advertising Creative (Campaign Execution)

**Task:** Upload video ads to Meta and Google Ads with proper UTM tagging

**Responsibilities:**
- Receive video files from `ad-exports/subscription-launch-apr17/video-ads/final-renders/`
- Apply UTM tagging per RevOps standards (see `marketing-launch-tracking-deliverables.md`)
- Write ad copy for each video variant (headline + description)
- Upload to Meta Ads Manager (Feed, Stories, Reels placements)
- Upload to Google Ads (YouTube bumper/skippable, Performance Max asset group)
- Verify Meta Pixel and GA4 tracking fire correctly on video ad clicks
- Create thumbnail images for upload interfaces (if needed)

**UTM Tagging Template (from RevOps doc):**

```
Meta Feed Video (Quality Hook):
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_video_1&promo=FREESHIP

Meta Stories Video (Culture Hook):
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=culture_video_2&promo=FREESHIP

YouTube Video (Convenience Hook):
https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=conversion_apr21&utm_content=convenience_video_3&promo=FREESHIP
```

**Timeline:** Upload by EOD Apr 17 (launch day) or Apr 18 (if videos arrive late)

**Deliverable:** Confirmation comment on UNC-277 with:
- Number of video ads uploaded (Meta + Google)
- Platforms/placements activated
- UTM-tagged URLs used
- Screenshot of Meta Ads Manager showing video ads live

---

### To RevOps (Performance Tracking)

**Task:** Add video ad tracking to daily performance reports

**Responsibilities:**
- Track video ad performance separately from static image performance
- Report CTR, CPC, CPM, CAC by video variant (Quality vs Culture vs Convenience)
- Monitor 3-second video play rate (Meta-specific metric)
- Flag if any video has <1% CTR for 3+ days (underperforming, candidate for kill)
- Compare video ROAS vs static ROAS

**Timeline:** Daily reports starting Apr 18 (day after video launch)

**Deliverable:** Weekly video performance summary by Apr 24 (end of Week 1)

---

## Success Metrics — Video vs Static

### Video Ad Benchmarks (Industry + Our Targets)

| Metric | Industry Benchmark | Uncle May's Target | Week 1 Goal |
|--------|-------------------|-------------------|-------------|
| **CTR (Click-Through Rate)** | 1.2% (video) vs 0.9% (static) | >1.5% | Beat static by 0.3%+ |
| **3-Second Play Rate** | 40% (Meta) | >45% | Strong hook effectiveness |
| **CPC (Cost Per Click)** | $1.50-$2.50 | <$2.00 | Lower than static |
| **CAC (Cost Per Acquisition)** | N/A | <$100 | Same as overall target |
| **ROAS (6-month LTV)** | N/A | 12x+ | $1,264 LTV / $100 CAC |

**Video-Specific Metrics to Track:**
- **Hook rate:** % of viewers who watch first 3 seconds (Meta Stories/Reels)
- **Completion rate:** % who watch to CTA screen
- **CTA click rate:** % who click after watching full video

**Decision Rules:**
- If video CTR >2%: Shift more budget to video placements
- If video CAC <$80: Double down, produce more video variants
- If static outperforms video: Kill video refresh plan, focus on static iteration

---

## Video Creative Guidelines (For Future Variants)

Based on the creative brief and brand voice:

### DO (All Future Video Variants):
- **Lead with the hook in first 3 seconds** (critical for scroll-stop on Meta)
- **Show culturally specific produce** (collards, okra, plantains, yams) in close-up shots
- **Feature Black talent authentically** (not performative, relatable to target demo)
- **Emphasize subscription benefits** (convenience, consistency, cultural fit)
- **End with clear CTA** (e.g., "Order your first box," "Subscribe in 60 seconds")
- **Include Uncle May's logo** in final 3 seconds
- **Keep it mobile-optimized** (legible text, fast load, vertical format for Stories/Reels)

### DON'T (Brand Guardrails):
- No food desert framing or charity messaging
- No struggle/scarcity narratives
- No generic stock footage aesthetic
- No over-explaining cultural specificity (let it be self-evident)
- No jargon or corporate-speak

### Copy Principles (Video Overlays/Scripts):
- **No em dashes** (use commas, periods, colons instead)
- **Active voice** ("We deliver" not "Fresh produce is delivered")
- **Specificity wins** ("Collard greens, okra, sweet potatoes" beats "fresh vegetables")
- **Confident, not defensive** (premium positioning, no apologies for pricing)

---

## Week 1 Launch Day Checklist (Apr 17)

### Before Video Upload:
- [ ] Anthony places completed videos in `ad-exports/subscription-launch-apr17/video-ads/final-renders/`
- [ ] Anthony creates VIDEO-MANIFEST.md with file details (names, durations, hooks, sizes)
- [ ] CEO delegates to CRO (campaign coordination) and Advertising Creative (upload execution)
- [ ] CRO reviews manifest and approves budget allocation for video placements

### Video Upload (Advertising Creative):
- [ ] Apply UTM tagging per RevOps standards
- [ ] Write ad copy (headlines + descriptions) for each video
- [ ] Upload to Meta Ads Manager (Feed, Stories, Reels)
- [ ] Upload to Google Ads (YouTube, Performance Max)
- [ ] Verify Meta Pixel fires on video ad clicks
- [ ] Verify GA4 tracking captures video ad traffic

### Post-Upload Verification:
- [ ] Test video ads on mobile (Instagram app, Facebook app)
- [ ] Confirm videos load fast (<3 seconds to play)
- [ ] Confirm CTA text is legible on small screens
- [ ] Confirm promo code FREESHIP is mentioned in ad copy
- [ ] Screenshot live ads in Meta Ads Manager and Google Ads
- [ ] Post confirmation comment on UNC-277

---

## Contingency Plans

### If Videos Arrive Late (After Apr 17 Launch):
- Launch Thursday with 25 static images only (original plan)
- Add videos Friday Apr 18 or Monday Apr 21 as creative refresh
- No impact on Week 1 performance (static ads already proven)

### If Videos Need Editing/Resizing:
- **<15 seconds:** Use as YouTube bumper (15s non-skippable)
- **15-30 seconds:** Ideal for all placements
- **>30 seconds:** Trim to 30s for Meta (attention span), keep full length for YouTube skippable
- Advertising Creative can trim in Canva Video Editor if needed

### If Video Performance Underperforms Static:
- Kill video variants by end of Week 1
- Shift budget back to static images
- Revisit video strategy: different hooks, UGC testimonials instead of DIY, or AI video tools

---

## Long-Term Video Strategy (Month 2-3)

**Goal:** Sustainable video variant production at 3-5 new videos/week

**Options:**
1. **UGC Pipeline:** Incentivize customers to film testimonials ($25 credit per video), build library
2. **AI Video Tools:** Runway/Pika for AI-generated testimonial-style ads
3. **Stock Footage + Overlays:** Storyblocks/Artgrid B-roll + Canva text animations
4. **Template-Based Video API:** Shotstack/Bannerbear for programmatic video ad generation

**Decision Point:** After Week 2 data (Apr 24), assess:
- Is video worth the production effort? (CAC, ROAS vs static)
- What's the bottleneck? (Filming time, editing, concept development)
- Which tool request unlocks scalability?

---

## Open Questions for Board/CRO

1. **What are the 3 video hooks Anthony filmed?** (Quality, Culture, Convenience or different angles?)
2. **What aspect ratios did Anthony export?** (Need both 9:16 vertical and 1:1 square for Meta, 16:9 for YouTube)
3. **Are videos <4MB for Meta upload?** (If not, Advertising Creative can compress)
4. **When will videos be ready for upload?** (Today Apr 17, or later this week?)
5. **Should we delay launch to include videos, or add them post-launch?** (Recommend add post-launch if not ready today)

---

## Next Steps (CEO Actions)

1. ✅ **Created VIDEO-ASSET-GUIDELINES.md** — File naming, storage structure, upload checklist
2. ✅ **Updated MARKETING-ROLLOUT-PLAN-VIDEO-UPDATE.md** — This document
3. ⏳ **Delegate to CRO** — Campaign coordination, budget approval, performance monitoring
4. ⏳ **Delegate to Advertising Creative** — Video upload, UTM tagging, ad copy, platform execution
5. ⏳ **Comment on UNC-277** — Notify board that instructions are ready, handoff to CRO + Adv Creative

---

**Status:** ✅ Plan updated, ready for video integration  
**Owner:** CEO (delegation in progress)  
**Next Sync:** After Anthony uploads VIDEO-MANIFEST.md, CEO reviews and delegates upload tasks  
**Launch:** Thu Apr 17 (static) + videos ASAP after manifest posted
