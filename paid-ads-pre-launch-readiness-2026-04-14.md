# Paid Ads Pre-Launch Readiness Report
**Date:** 2026-04-14  
**Author:** Growth & Conversion Operator  
**Campaign:** 30 Orders/Week Customer Acquisition  
**Launch Date:** April 21, 2026  
**Ad Spend:** $2,000/month ($66/day) Meta + Google  
**Paperclip Issue:** [UNC-250](/UNC/issues/UNC-250)

---

## Executive Summary

**GO/NO-GO DECISION: CONDITIONAL GO**

The website is **NOT yet ready** for $2,000/month paid ad spend, but can be made ready by April 20 if **3 critical fixes** ship this week:

1. **Mobile optimization verified** (60%+ of paid traffic will be mobile)
2. **"Free Delivery" messaging prominent** (eliminate cost surprise abandonment)
3. **Urgency messaging added** (delivery deadline, limited availability)

The checkout flow **critical bug is fixed** (payment links now collect shipping addresses), but **conversion rate is unproven**. We need 48 hours of post-fix data before committing $2K/month.

**Recommendation:** Delay launch by 3 days (April 21 → April 24) to:
- Validate checkout fix is working (25%+ completion rate)
- Ship 3 critical mobile/messaging fixes
- Test end-to-end: ad click → landing page (mobile) → checkout → purchase

---

## Context: Why This Matters

### The Stakes
- **Paid ad budget:** $2,000/month ($66/day)
- **Target CAC:** <$50 per order
- **Required orders at $66/day:** 40 orders/month minimum to break even (40 × $50 = $2,000)
- **Required conversion rate:** 1.3% assuming 3,000 sessions/month at $0.67 CPC

### The Risk
If we launch ads before the website is ready:
- **Burn scenario:** $66/day × 7 days = $462 wasted on traffic that bounces or abandons
- **Damage scenario:** Poor ad performance (low CTR, high bounce) tanks Meta/Google quality scores, making future ads more expensive
- **Opportunity cost:** Could spend $462 AFTER fixes are live and convert at 3-5x the rate

### The Upside
If we launch ads AFTER critical fixes:
- **Win scenario:** 3,000 sessions/month × 3% conversion = 90 orders/month at $22 CAC (target: 30/week = 120/month)
- **Scale scenario:** Proven funnel can justify increasing spend to $100-200/day

---

## Pre-Launch Checklist

### ✅ COMPLETED (Checkout Flow)

**1. Shipping Address Collection Fix (CRITICAL)**
- **Issue:** Old payment links didn't collect shipping addresses for a delivery business → 97% abandonment
- **Fix:** Homepage updated with new payment links (shipping + phone + promo enabled)
- **Status:** Deployed 2026-04-14 15:45 UTC
- **Impact:** Expected 0% → 25-30% completion rate within 48 hours
- **Reference:** [checkout-audit-findings-2026-04-14.md](checkout-audit-findings-2026-04-14.md)

**Validation Needed:** Monitor checkout sessions April 15-16 to confirm 25%+ completion before launch

---

### ❌ CRITICAL LAUNCH BLOCKERS (Must Fix Before April 21)

**2. Mobile Experience Verification (CRITICAL)**
- **Issue:** Website mobile optimization unverified; 60%+ of paid social traffic will be mobile
- **Risk:** Mobile visitors bounce or abandon due to poor UX (mobile converts at 1.5-2% vs desktop 3-4%)
- **Fix Required:**
  - Test on iOS/Android (Safari, Chrome)
  - Verify CTAs are thumb-friendly (no tiny buttons)
  - Ensure forms are easy to fill on mobile
  - Check page load speed <2 seconds on 4G
  - Verify checkout flow works end-to-end on mobile
- **Owner:** CTO
- **Timeline:** 1-2 days
- **Impact if not fixed:** 60% of paid traffic will bounce → $40/day wasted

**3. "Free Delivery" Messaging (HIGH)**
- **Issue:** Delivery cost not visible before checkout (43% of cart abandonment due to unexpected costs)
- **Current State:** Shipping IS free, but not explicitly stated
- **Fix Required:**
  - Add "Free Delivery" badge on homepage hero
  - Add "Free Delivery" on each product card
  - Add "Free Delivery to Hyde Park" in checkout messaging
- **Owner:** CTO (1-line copy change)
- **Timeline:** 1 day
- **Impact if not fixed:** 43% of checkout starters abandon thinking shipping costs are hidden

**4. Urgency Messaging (MEDIUM-HIGH)**
- **Issue:** No reason to buy TODAY vs next week
- **Fix Required:**
  - "Order by Wednesday 11:59pm for Thursday delivery"
  - "Limited boxes available this week" (if true)
  - Countdown timer if we have a real weekly cutoff
- **Owner:** CTO
- **Timeline:** 1-2 days
- **Impact if not fixed:** Visitors bookmark and forget, never return

---

### 🟡 HIGH-IMPACT OPTIMIZATIONS (Nice-to-Have Before Launch)

**5. Product Photography (HIGH)**
- **Issue:** Only 2 generic hero images; no individual produce photos
- **Fix:** Photoshoot of box contents, individual items, packaging, unboxing
- **Owner:** Advertising Creative + CTO
- **Timeline:** 1 week (can launch ads without this if time-constrained)
- **Impact:** +20-35% conversion (visual confidence for food purchases)
- **Recommendation:** Delay if needed; launch ads first, ship photos in Week 2

**6. Social Proof Expansion (MEDIUM)**
- **Issue:** Only 3 testimonials; no product reviews
- **Fix:** Add 5-10 more customer testimonials, start collecting reviews
- **Owner:** Advertising Creative + CTO
- **Timeline:** 3-5 days (ongoing review collection)
- **Impact:** +10-20% conversion (trust building)
- **Recommendation:** Can launch without; prioritize collecting reviews from first paid ad orders

**7. Email Capture for Retargeting (MEDIUM)**
- **Issue:** No exit-intent popup or abandoned cart email recovery
- **Fix:** Add Mailchimp popup, automated abandoned cart sequence
- **Owner:** CTO + Growth & Conversion
- **Timeline:** 3-5 days
- **Impact:** Recover 5-15% of abandoned carts
- **Recommendation:** Can launch without; ship in Week 1 post-launch

---

### ✅ ALREADY SUFFICIENT (No Further Action Needed)

**8. Checkout Speed**
- Homepage → checkout in 2 clicks, Stripe checkout under 60 seconds
- **Status:** GOOD

**9. Value Proposition**
- Clear "$30 first box" offer above the fold
- "No subscription required" friction reducer
- **Status:** GOOD

**10. Trust Signals**
- 3 customer testimonials
- "100% freshness guarantee"
- Instagram integration
- **Status:** SUFFICIENT (can expand post-launch)

**11. Product Clarity**
- Clear item listings, quantities, weights
- Starter, Family, Premium tiers
- **Status:** GOOD

---

## Go/No-Go Decision Framework

### Launch April 21 IF:
1. ✅ Checkout fix validated (25%+ completion rate by April 16)
2. ✅ Mobile experience tested and optimized (April 18-19)
3. ✅ "Free Delivery" messaging added (April 18)
4. ✅ Urgency messaging added (April 18-19)
5. ✅ End-to-end test: ad click → mobile landing → mobile checkout → purchase (April 19-20)

### Delay to April 24 IF:
1. ❌ Checkout completion rate <20% by April 16 (additional blockers exist)
2. ❌ Mobile experience has major UX issues requiring >3 days to fix
3. ❌ End-to-end test fails (April 19-20)

### DO NOT LAUNCH IF:
1. ❌ Checkout completion rate <15% (funnel is broken)
2. ❌ Mobile checkout is non-functional
3. ❌ Page load speed >5 seconds on mobile

---

## Pre-Launch Testing Protocol

### Day 1-2 (April 15-16): Validate Checkout Fix
- **Task:** Monitor checkout recovery via `scripts/monitor-checkout-recovery.py`
- **Success:** 10+ completed checkouts, 25%+ conversion rate
- **Owner:** Growth & Conversion
- **Decision:** If <20% by April 16, escalate to CTO for deeper investigation

### Day 3 (April 17): Mobile Experience Audit
- **Task:** Test full user journey on iOS (Safari) and Android (Chrome)
  - Homepage loads <2 seconds
  - CTAs are tappable (no tiny buttons)
  - Forms are easy to fill (address, phone, payment)
  - Checkout completes successfully
  - Order confirmation email arrives
- **Owner:** CTO
- **Deliverable:** Mobile testing report with screenshots + issues found

### Day 4 (April 18): Critical Fixes Deployed
- **Task:** Ship mobile fixes + "Free Delivery" messaging + urgency messaging
- **Owner:** CTO
- **Validation:** Test again on mobile to confirm fixes work

### Day 5 (April 19): End-to-End Test
- **Task:** Simulate paid ad user journey
  1. Click a test Meta ad on mobile
  2. Land on homepage
  3. See "Free Delivery" and urgency messaging
  4. Click "Order Now" CTA
  5. Complete checkout on mobile (use test payment method)
  6. Verify order confirmation email
- **Owner:** CTO + Growth & Conversion
- **Success:** Complete purchase in <3 minutes on mobile, no friction points

### Day 6 (April 20): Final Go/No-Go
- **Review:** Checkout completion rate, mobile test results, end-to-end test
- **Decision:** Launch April 21 OR delay to April 24
- **Owner:** CRO (final call)

---

## Launch Day Monitoring Plan (April 21)

### Metrics to Track (Hourly for First 24h)
1. **Ad performance:** Impressions, clicks, CTR, CPC
2. **Landing page:** Bounce rate, time on page, CTA clicks
3. **Checkout:** Sessions started, sessions completed, conversion rate
4. **Revenue:** Orders, AOV, total revenue
5. **CAC:** Total ad spend ÷ orders

### Kill Switches
- **Pause ads if:** Bounce rate >80% (landing page broken)
- **Pause ads if:** Checkout completion rate <10% (checkout broken)
- **Pause ads if:** CAC >$100 after 50 clicks (targeting is wrong)
- **Pause ads if:** CTR <0.5% after 500 impressions (creative is bad)

### Success Criteria (First 7 Days)
- **CAC:** <$50 per order
- **Checkout conversion:** 25%+ completion
- **Orders:** 10-15 orders in first week (establish baseline)
- **ROAS:** >1.5x (revenue ÷ ad spend)

---

## Risk Mitigation

### Risk 1: Checkout Fix Doesn't Work
- **Likelihood:** LOW (CTO identified root cause, fix is straightforward)
- **Mitigation:** 48-hour validation period (April 15-16)
- **Backup Plan:** If <20% completion, delay launch and investigate additional blockers

### Risk 2: Mobile Experience Is Broken
- **Likelihood:** MEDIUM (mobile optimization not yet verified)
- **Mitigation:** Full mobile testing April 17-18
- **Backup Plan:** If major issues found, delay launch and prioritize mobile fixes

### Risk 3: Paid Traffic Doesn't Convert
- **Likelihood:** MEDIUM (organic traffic may behave differently than paid)
- **Mitigation:** Start with $20-30/day test budget for first 48 hours
- **Backup Plan:** If CAC >$100, pause ads and investigate targeting/creative mismatch

### Risk 4: Ad Creative Doesn't Resonate
- **Likelihood:** MEDIUM (15 variants created but not yet tested)
- **Mitigation:** A/B test all 15 variants in first week, kill losers
- **Backup Plan:** If CTR <0.5%, pause and iterate on creative

---

## Budget Allocation Recommendation

### Phase 1: Validation (April 21-24, 4 days)
- **Budget:** $25/day × 4 days = $100 total
- **Goal:** Validate funnel works with paid traffic (CAC, conversion rate, ROAS)
- **Channels:** Meta only (Instagram + Facebook feed)
- **Success:** CAC <$50, 10+ orders in 4 days

### Phase 2: Scale (April 25-30, 6 days)
- **Budget:** $50/day × 6 days = $300 total
- **Goal:** Scale winning creative, hit 30 orders/week run rate
- **Channels:** Meta (scale) + Google Search (test)
- **Success:** CAC <$50, 20+ orders in 6 days

### Phase 3: Full Rollout (May 1+)
- **Budget:** $66/day ($2,000/month)
- **Goal:** Sustain 30 orders/week, optimize for efficiency
- **Channels:** Meta (majority) + Google Search (minority)
- **Success:** Consistent 30+ orders/week, CAC <$50, ROAS >2.5x

**Total April Spend:** $400 (vs. $2,000 planned) → $1,600 saved by phased rollout

---

## Coordination Plan

### CTO (Technical Fixes)
- **April 17:** Mobile experience testing
- **April 18:** Deploy "Free Delivery" + urgency messaging
- **April 19:** Mobile fixes deployed and tested
- **April 20:** Final end-to-end test

### Advertising Creative (Ad Variants)
- **April 18:** Confirm all 15 ad variants are uploaded to Meta
- **April 19:** Set up A/B test structure (5 hooks × 3 formats)
- **April 20:** Review ad creative with CRO for final approval

### CRO (Budget & Strategy)
- **April 16:** Review checkout recovery data, go/no-go decision checkpoint
- **April 20:** Final go/no-go decision based on all testing
- **April 21:** Monitor launch metrics hourly, approve spend increase if metrics hit

### Growth & Conversion (Monitoring & Optimization)
- **April 15-16:** Monitor checkout recovery
- **April 17:** Support mobile testing with CTO
- **April 19:** Run end-to-end test
- **April 21+:** Daily performance reports, flag anomalies, recommend optimizations

---

## Cross-Reference: Related Documents

This report synthesizes findings from:
1. **[checkout-audit-findings-2026-04-14.md](checkout-audit-findings-2026-04-14.md)** — Root cause of 97% abandonment (payment links), fix deployed
2. **[website-conversion-audit-2026-04-14.md](website-conversion-audit-2026-04-14.md)** — Comprehensive CRO analysis, 13 gaps identified
3. **[30-per-week-campaign-plan.md](30-per-week-campaign-plan.md)** — Overall campaign strategy and budget
4. **[checkout-recovery-status-2026-04-14.md](checkout-recovery-status-2026-04-14.md)** — Monitoring plan for checkout fix validation

---

## FINAL RECOMMENDATION

**CONDITIONAL GO for April 21 launch** with the following gates:

### Must-Ship Before Launch (April 18-20)
1. Mobile experience verified and optimized
2. "Free Delivery" messaging added
3. Urgency messaging added (delivery deadline)
4. End-to-end test passed (mobile ad click → purchase)

### Must-Validate Before Launch (April 15-16)
1. Checkout completion rate ≥25% (proves fix is working)

### Phased Budget Rollout
1. April 21-24: $25/day validation ($100 total)
2. April 25-30: $50/day scale ($300 total)
3. May 1+: $66/day full rollout ($2,000/month)

**If any gate fails, delay launch to April 24 and fix blockers.**

---

**Next Actions:**
1. **April 15:** Pull 24-hour checkout recovery metrics → update UNC-246
2. **April 16:** Go/no-go checkpoint based on checkout data → inform CRO
3. **April 17:** CTO begins mobile testing
4. **April 20:** Final go/no-go decision → inform board
