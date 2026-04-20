# Meta Ad Campaign Launch Checklist — April 17, 2026

**Gate:** UNC-304 checkout fix must be deployed and tested before activation  
**Budget:** $70/day ($490/week)  
**Target:** 15-20 orders/week, CPA <$25

---

## T-48 Hours (April 15-16)

### Advertising Creative
- [ ] Export all 15 ad creatives from Canva (see `campaign-spec-april-17.md` for design IDs)
  - [ ] 5x Instagram Post (1080x1080)
  - [ ] 5x Instagram Stories (1080x1920)
  - [ ] 5x Facebook Feed (1200x628)
- [ ] Verify file sizes <5MB each, PNG format
- [ ] Upload to shared drive: `data/meta-ads/exports/`

### CRO or Advertising Creative (Meta Ads Manager Setup)
- [ ] Log in to Meta Ads Manager (ad account: act_814877404473301)
- [ ] Create campaign:
  - Name: "Uncle May's Produce Box - April 2026 Launch"
  - Objective: Conversions
  - Conversion event: Purchase
  - Campaign budget optimization: ON
  - Daily budget: $70
  - Status: PAUSED
- [ ] Create Ad Set 1: Instagram Feed
  - Targeting: Women 25-35, Chicago 25-mile radius, interests (healthy eating, organic, Black culture)
  - Placement: Instagram Feed only
  - Optimization: Purchase
- [ ] Create Ad Set 2: Instagram Stories
  - Same targeting as Ad Set 1
  - Placement: Instagram Stories only
- [ ] Create Ad Set 3: Facebook Feed
  - Same targeting as Ad Set 1
  - Placement: Facebook Feed only
- [ ] Upload 5 creatives to Ad Set 1 (Instagram Post variants A-E)
- [ ] Upload 5 creatives to Ad Set 2 (Story variants A-E)
- [ ] Upload 5 creatives to Ad Set 3 (Facebook variants A-E)
- [ ] Set UTM parameters on all ads:
  - `utm_source=meta`
  - `utm_medium=cpc`
  - `utm_campaign=april_launch`
  - `utm_content={placement}_{variant}` (e.g., `ig_feed_a`)
- [ ] Set primary text, headlines, and CTAs per `campaign-spec-april-17.md`
- [ ] Verify all 15 ads show "Paused" status
- [ ] Screenshot campaign structure and post to UNC-305

### RevOps (Conversion Tracking Verification)
- [ ] Run end-to-end test purchase (use Stripe test mode)
- [ ] Verify Meta Pixel Purchase event fires in Events Manager
- [ ] Confirm transaction value is captured correctly
- [ ] Check UTM params persist through Stripe checkout
- [ ] Post test results to UNC-305

---

## T-24 Hours (April 16 Evening)

### CTO (Checkout Fix Verification)
- [ ] Deploy UNC-304 checkout fix to production
- [ ] Run 3 test purchases with different box types
- [ ] Confirm conversion rate improvement (target >15%)
- [ ] Post green light to UNC-304 and UNC-305

### CRO (Final Review)
- [ ] Review all Meta ad settings one final time
- [ ] Verify budget caps are set correctly ($70/day max)
- [ ] Confirm all ads are still PAUSED
- [ ] Check that Pixel ID `2276705169443313` is firing correctly
- [ ] Create monitoring dashboard link (Meta Ads Manager + GA4)

---

## Launch Day — April 17, 2026 (Morning)

**Pre-Activation Checklist:**
- [ ] CTO confirms checkout fix is live and tested ✓
- [ ] RevOps confirms conversion tracking test passed ✓
- [ ] CRO confirms campaign settings reviewed ✓
- [ ] CEO approval to proceed ✓

**Activation (10:00 AM CT):**
- [ ] CRO: Activate all 3 ad sets simultaneously in Meta Ads Manager
- [ ] Verify delivery starts within 15 minutes
- [ ] Post "LIVE" update to UNC-305

---

## First 2 Hours (10:00 AM - 12:00 PM)

**CRO Monitoring:**
- [ ] Check Meta Ads Manager every 30 minutes
- [ ] Verify all 15 ads are delivering (no errors)
- [ ] Monitor early CTR (target >1.5%)
- [ ] Check for any disapproved ads or policy violations
- [ ] Watch spend rate (should be ~$3/hour)

**RevOps Monitoring:**
- [ ] Watch GA4 real-time traffic (utm_source=meta)
- [ ] Monitor Stripe dashboard for incoming orders
- [ ] Verify conversion events appearing in Meta Events Manager
- [ ] Post hourly update to UNC-305

**Red Flags (immediate pause if):**
- CTR <0.5% across all variants
- CPC >$5
- Zero conversions after 50 clicks
- Any ad disapproved for policy violation

---

## First 24 Hours (April 17)

**Performance Review (Evening):**
- [ ] Pull campaign stats from Meta Ads Manager
- [ ] Identify top 3 variants by CTR
- [ ] Check early conversion signals (add-to-cart events)
- [ ] Calculate spend vs. orders (early CPA check)
- [ ] Post day-1 summary to UNC-305

**Key Metrics:**
- Impressions: 5,000-10,000 (expected)
- Clicks: 75-150 (1.5% CTR)
- Orders: 2-4 (early target)
- CPA: <$35 (acceptable day 1)
- Spend: ~$70

**Optimization Actions:**
- If any variant has CTR <0.8%: reduce budget allocation by 50%
- If any variant has CTR >3%: note for scaling tomorrow
- If checkout converts <10%: escalate to CEO (problem is website, not ads)

---

## Days 2-3 (April 18-19)

**Daily Reviews:**
- [ ] Morning: Check overnight performance (7:00 AM)
- [ ] Adjust budgets based on CTR and early conversions
- [ ] Pause bottom 2-3 performers if CTR <0.8%
- [ ] Shift budget to top 2-3 performers
- [ ] Evening: Post daily summary to UNC-305

**Optimization Triggers:**
- **If CPA >$35 after 3 days:** Pause underperformers, escalate to CEO
- **If CTR consistently <1%:** Creative problem → Advertising Creative ships new hooks
- **If conversion rate <10%:** Website problem → CTO investigates checkout funnel
- **If ROAS <1.5x:** Budget problem → CRO reduces daily spend to $50

---

## Week 1 Wrap (April 23)

**Final Report:**
- [ ] Pull full week of data from Meta Ads Manager
- [ ] Calculate final CPA, ROAS, conversion rate
- [ ] Identify winning variants (scale for Week 2)
- [ ] Document learnings and next tests
- [ ] Post Week 1 report to UNC-251 (parent task)

**Success Criteria:**
- 15-20 orders from Meta ads
- CPA <$25
- ROAS >2.0x
- 1+ winning creative identified for scaling

**Next Steps (if successful):**
- Scale winning variant to $100/day
- Test new hooks based on Week 1 learnings
- Expand targeting to nearby Chicago neighborhoods
- Add retargeting campaign for cart abandoners

---

## Emergency Contacts

**If technical issues:**
- CTO (checkout, website, tracking)
- RevOps (analytics, conversion tracking)

**If Meta account issues:**
- Anthony Ivy: (312) 972-2595 / anthony@unclemays.com
- Meta Ads Support: Business Help Center

**If budget/spend issues:**
- CFO (approve emergency budget changes)
- CEO (strategic decisions)

---

## Rollback Plan

**If launch fails (no orders in 48 hours):**
1. Pause all campaigns immediately
2. CRO + Advertising Creative + RevOps post-mortem
3. Identify root cause: creative, targeting, checkout, or offer
4. Fix and relaunch within 72 hours
5. Escalate to CEO if problem is strategic (pricing, product-market fit)

**If checkout breaks after launch:**
1. Pause all campaigns immediately (stop spending on broken funnel)
2. Alert CTO to fix
3. Resume when checkout is verified working again
4. Extend budget period by days lost

---

## Notes

- This is a critical launch for the emergency revenue push (UNC-251)
- 17 days to hit 30 boxes target (overdraft risk)
- Meta ads are the primary customer acquisition channel
- Success here unlocks scaling to $100/day+ in Week 2
- All decisions route through CRO, escalate blockers to CEO immediately
