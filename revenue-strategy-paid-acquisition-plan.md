# Paid Acquisition Plan — Uncle May's Produce Box
**Owner:** CRO  
**Date:** 2026-04-15  
**Target:** 30 orders/week (129/month)  
**Status:** READY TO EXECUTE

---

## Executive Summary

**The subscription model economics are profitable.** At $100 CAC (achievable at $2 CPC, 2% conversion):
- 6-month LTV: $1,264 (blended)
- Gross profit: $442 per customer
- **Profit per customer: +$342**
- **Payback period: 1.4 months**

**Month 1 requires $12.9K ad spend** to hit 30 orders/week, with a $3.4K cashflow gap that turns profitable by month 2 as recurring revenue compounds.

---

## Unit Economics (Validated)

### Subscription Tiers
| Tier | Weekly | Monthly | 6mo LTV | GP (35%) | Max CAC | Profit @ $100 CAC |
|------|--------|---------|---------|----------|---------|-------------------|
| Starter | $30 | $129 | $774 | $271 | $271 | **+$171** |
| Community | $55 | $237 | $1,419 | $497 | $497 | **+$397** |
| Premium | $75 | $323 | $1,935 | $677 | $677 | **+$577** |
| **Blended (40/40/20)** | **$49** | **$211** | **$1,264** | **$442** | **$442** | **+$342** |

### Paid Acquisition Assumptions
- **CPC:** $2.00 (food/grocery industry standard)
- **Conversion rate:** 2.0% (e-commerce baseline)
- **CAC:** $100 ($2 CPC ÷ 2% conversion)
- **ROAS (6-month):** 12.6x
- **Payback:** 1.4 months

---

## Phase 1: Test & Learn (Month 1)
**Budget:** $3,000  
**Goal:** Validate assumptions, find winning creative, optimize to 2%+ conversion

### Channel Mix
1. **Meta (Facebook/Instagram): $2,000** (67%)
   - Advantage+ Shopping Campaigns (ASC)
   - Feed + Stories + Reels placements
   - Lookalike audiences (customer file seed)
   - Dynamic creative testing (5-10 variants)

2. **Google Ads: $1,000** (33%)
   - Performance Max (automated)
   - Search: branded + "produce box Chicago" + "Black-owned grocery"
   - YouTube in-stream (culturally specific creative)

### Success Metrics
- **Min viable:** 1.5% conversion, $133 CAC → breakeven
- **Target:** 2.0% conversion, $100 CAC → $342 profit/customer
- **Scale trigger:** 2.5%+ conversion, <$80 CAC → $362+ profit/customer

### Week-by-Week Plan
- **Week 1:** Launch campaigns, baseline data collection
- **Week 2:** First optimization (pause underperformers, 2x winners)
- **Week 3:** Creative refresh (new hooks, Advertising Creative ships variants)
- **Week 4:** Results analysis, scale/kill decision

---

## Phase 2: Scale to 30/week (Month 2-3)
**Budget:** $12,900/month  
**Goal:** 129 orders/month, achieve 1.4-month payback

### Ramp Schedule
- **Month 2:** $6,000 budget (15 orders/week) — validate retention
- **Month 3:** $12,900 budget (30 orders/week) — full scale

### Channel Allocation (at full scale)
- **Meta:** $9,000/month (70%)
- **Google Ads:** $3,900/month (30%)

### Retention Validation
**Critical assumption:** 6-month retention drives the economics.

**Tracking plan:**
- Stripe subscription churn data (weekly cohorts)
- Target: <17% monthly churn (6+ month average tenure)
- If churn >20%: pause scale, fix product/operations first
- If churn <15%: LTV is higher, can increase CAC targets

---

## Phase 3: Optimize Mix & Expand (Month 4+)
**Budget:** $12,900+/month  
**Goal:** 100 orders/week, test new channels

### Tier Mix Optimization
**Current assumption:** 40% Starter, 40% Community, 20% Premium  
**Target:** 20% Starter, 50% Community, 30% Premium

**Tactics:**
- Landing page A/B test: default selection on Community (not Starter)
- Ad creative: hero the $55 Community box, not $30 Starter
- Upsell flow: "Most popular" badge on Community
- **Impact:** Blended LTV increases from $1,264 → $1,419 (+12%), CAC tolerance increases to $248

### New Channel Tests (if Phase 1-2 succeed)
- **YouTube (separate from Performance Max):** $2K/month
- **TikTok:** $1K/month (if Advertising Creative ships TikTok-native creative)
- **Influencer/UGC partnerships:** Barter for content, retarget with paid
- **Podcast sponsorships:** Chicago food/culture podcasts (if attribution works)

---

## Creative Strategy (Brief for Advertising Creative)

### Positioning
- **NOT a food desert solution** — affluent Black communities who want this and can pay
- **Premium, culturally specific produce** — "your grandmother's greens, delivered"
- **Data-driven platform** — "we know what you want before you do"

### Hooks to Test
1. "The produce box Chicago's Black families trust" (social proof)
2. "Fresh greens, Black farmers, your door" (value prop)
3. "Why Hyde Park families switched to Uncle May's" (case study)
4. "The grocery experience you deserve" (premium positioning)
5. "Farm-to-table, culture-forward" (differentiation)

### Creative Formats (Priority Order)
1. **UGC-style testimonials** (highest trust, lowest production cost)
   - Customer unboxing videos
   - Family cooking with the box
   - "I used to shop at [competitor], now I get Uncle May's"

2. **Product showcase** (conversion-optimized)
   - Flat lay of the box contents
   - Side-by-side: store produce vs Uncle May's quality
   - "What's in this week's box" carousel

3. **Founder story** (brand building, retargeting)
   - Anthony's Booth/PE background → premium grocery
   - Black agricultural heritage → cultural authenticity
   - "Why I built this" (trust signal)

### Platform-Specific Requirements
- **Meta Feed:** 1080x1080, 9:16 for Stories/Reels
- **Meta Reels:** 9:16 vertical video, 15-30sec, hook in first 3sec
- **Google Performance Max:** Asset groups (15 images, 5 videos, 5 headlines, 5 descriptions)
- **YouTube in-stream:** 15sec bumper + 30sec skippable

### Variant Testing Discipline
- Ship **5-10 variants per week** in month 1 (test phase)
- Kill bottom 50% of variants weekly, double down on top 20%
- Refresh creative every 2 weeks (fatigue sets in fast on Meta)

---

## Conversion Tracking Setup (Delegate to RevOps)

### Required Events
1. **GA4 + GTM:**
   - `view_item` (product page view)
   - `begin_checkout` (checkout initiated)
   - `add_payment_info` (Stripe checkout loaded)
   - `purchase` (subscription created)
   - **Critical:** Pass `subscription_tier` and `subscription_value` parameters

2. **Meta Pixel:**
   - ViewContent
   - InitiateCheckout
   - Purchase (value = 6-month LTV, NOT first payment)
   - **Use Conversions API** (server-side tracking via Stripe webhook)

3. **Google Ads:**
   - Conversion action: "Subscription - Starter" ($774 value)
   - Conversion action: "Subscription - Community" ($1,419 value)
   - Conversion action: "Subscription - Premium" ($1,935 value)
   - Import from GA4 or set up via GTM

### Attribution Window
- **Meta:** 7-day click, 1-day view (default)
- **Google:** Last click (30-day window)
- **RevOps dashboard:** Multi-touch attribution (first touch, last touch, linear)

---

## Guardrails & Kill Switches

### Pause Spending If:
1. **Bounce rate >5%** on any campaign (email deliverability issue, wrong audience)
2. **CAC >$150** for 7 consecutive days (below breakeven, bad creative/targeting)
3. **Conversion rate <1%** for 14 consecutive days (landing page/offer issue)
4. **Churn >20%** in first 30 days (product/ops issue, paid acquisition won't fix)

### Weekly Review Checklist
- [ ] CAC by channel, campaign, ad set
- [ ] Conversion rate by landing page variant
- [ ] ROAS (actual, not projected)
- [ ] Churn rate by cohort (weekly sign-ups)
- [ ] Creative fatigue (CTR decay >30% = refresh)

---

## Budget Summary

| Phase | Duration | Budget | Orders/Week | Orders/Month | CAC | Revenue | Profit |
|-------|----------|--------|-------------|--------------|-----|---------|--------|
| **Phase 1: Test** | Month 1 | $3,000 | 7-10 | 30-40 | $75-100 | $6,321 | TBD |
| **Phase 2: Ramp** | Month 2 | $6,000 | 15 | 65 | $92 | $13,696 | +$1,760 |
| **Phase 2: Scale** | Month 3 | $12,900 | 30 | 129 | $100 | $27,180 | -$3,387* |
| **Phase 3: Optimize** | Month 4+ | $12,900 | 30+ | 129+ | <$100 | $27,180+ | +$5,000+ |

*Month 3 is cashflow-negative due to upfront CAC, but profitable by month 4 as recurring revenue from months 2-3 compounds.

---

## Next Actions (Immediate)

### CRO (Me):
- [x] Complete paid acquisition plan
- [ ] Brief Advertising Creative on subscription positioning + creative strategy
- [ ] Align with RevOps on conversion tracking setup (GA4, Meta, Google Ads)
- [ ] Get board approval on $3K month 1 test budget
- [ ] Set up weekly revenue dashboard (Stripe + GA4 + ad platform data)

### Advertising Creative:
- [ ] Ship first 10 creative variants (5 UGC-style, 5 product showcase) by EOW
- [ ] Set up Canva templates for weekly variant production
- [ ] Source UGC content (customer testimonials, unboxing videos)

### RevOps:
- [ ] Install Meta Pixel + Conversions API (via Stripe webhook)
- [ ] Set up Google Ads conversion actions (3 subscription tiers)
- [ ] Build GA4 dashboard: sessions → checkout → purchase by tier
- [ ] Weekly CAC/ROAS reporting (automated)

### CEO/Board:
- [ ] Approve $3K month 1 test budget
- [ ] Confirm cashflow plan for $6-8K working capital gap (months 2-3)
- [ ] Review and approve channel strategy (Meta + Google Ads)

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Conversion <1.5% | Medium | High (unprofitable) | Kill switch at 14 days, fix landing page/offer before scaling |
| Churn >20% | Medium | Critical (LTV collapses) | Validate retention in Phase 1, pause scale if churn is high |
| CAC >$150 | Low | High (unprofitable) | Creative testing discipline (10 variants/week), pause underperformers daily |
| Cashflow gap | High | Medium | Secure $8K working capital before Phase 2, or ramp slower ($6K budget month 2) |
| Creative fatigue | High | Medium | Refresh every 2 weeks, ship 5+ new variants/week in month 1 |

---

## Success Definition

**Phase 1 success (go/no-go for scale):**
- 30+ subscription sign-ups at <$100 CAC
- Conversion rate ≥1.5%
- Week 1 churn <20%
- ROAS (6-month projected) ≥10x

**Phase 2 success (continue scaling):**
- 129 subscriptions/month by month 3
- CAC stable at $80-100
- Month 2 churn <17%
- Payback period <2 months

**Phase 3 success (path to 100/week):**
- 30+ orders/week sustained for 60 days
- LTV ≥$1,400 (retention validated)
- Tier mix: 50%+ Community/Premium
- ROAS ≥12x, ready to scale to $25K/month budget (100/week)

---

**Document Status:** FINAL  
**Next Review:** After Phase 1 (end of month 1)  
**Owner:** CRO  
**Approvers:** CEO, CFO (budget), Advertising Creative (creative strategy), RevOps (tracking plan)
