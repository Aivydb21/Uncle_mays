# Revenue Crisis Response Plan
**Date:** 2026-04-13  
**Owner:** CRO  
**Status:** CRITICAL — Zero orders in 6 days

## Situation

### Current State
- **Last order:** 6 days ago (2026-04-06)
- **Run rate:** ~4 orders/week ($231/week)
- **Target:** 30 orders/week ($600-900/week)
- **Gap:** 86% below target

### Root Cause
**97% checkout abandonment rate**
- 100 checkout sessions in last 14 days
- Only 3 completed (3% conversion)
- 97 expired without purchase
- Traffic is healthy (21 sessions/day, 14 users/day)
- Checkout intent is there (~7 starts/day)
- **Conversion is broken**

## Immediate Actions (Next 24 Hours)

### 1. Fix Checkout Flow (Owner: CTO)
**Priority:** CRITICAL  
**Issue:** 97% abandonment suggests technical or UX failure

**Diagnostics Required:**
- [ ] Review checkout error logs (last 14 days)
- [ ] Test full checkout flow (Starter, Family, Community boxes)
- [ ] Check Stripe webhook delivery for `checkout.session.completed`
- [ ] Verify payment method availability
- [ ] Check for mobile vs desktop issues
- [ ] Review cart abandonment reasons (if tracked)

**Hypothesis:**
- Payment processing errors?
- Delivery address validation failures?
- Price surprise at checkout (tax/fees not shown earlier)?
- Mobile UX broken?
- Stripe configuration issue?

### 2. Abandoned Cart Recovery (Owner: CRO → RevOps)
**Priority:** CRITICAL  
**Opportunity:** 97 email addresses from expired checkouts

**Actions:**
- [ ] Pull email addresses from expired Stripe checkout sessions (last 14 days)
- [ ] Build email list (exclude completed purchases, remove duplicates)
- [ ] Draft recovery email sequence (3 emails over 7 days)
  - Email 1 (Day 0): "You left something behind" + 10% discount
  - Email 2 (Day 3): Social proof + urgency ("boxes selling out")
  - Email 3 (Day 7): Last chance + 15% discount
- [ ] Set up automated abandoned cart recovery in Mailchimp

**Expected Recovery:** 5-10% conversion = 5-10 orders = $175-350 immediate revenue

### 3. Customer Acquisition Push (Owner: CRO)
**Priority:** HIGH  
**Gap:** We have investor outreach but no customer acquisition channels

**Immediate (This Week):**
- [ ] Meta ad campaign ($50/day budget)
  - Target: Black women 25-35, Hyde Park + surrounding neighborhoods
  - Creative: Product shots + testimonials
  - Offer: First box 20% off
- [ ] Local outreach
  - Door hangers in Hyde Park apartment buildings
  - Partnership with local Black-owned businesses
  - Community event sponsorship
- [ ] Social media push (Instagram/Facebook)
  - 2 posts/day highlighting boxes and customer testimonials
  - Stories showing box unboxing and recipes
  - Paid boost on top posts ($20/day)

**Channels to Activate (Next 2 Weeks):**
- [ ] Google Ads (search: "produce delivery chicago", "fresh vegetables hyde park")
- [ ] Referral program (existing customers refer friends = 20% off)
- [ ] Partnership with Hyde Park fitness studios, yoga studios
- [ ] University of Chicago student outreach

### 4. Fix Apollo Account Issues (Owner: CRO)
**Priority:** HIGH (for fundraising, not customer acquisition)  
**Issue:** invest@ and timj@ accounts have broken OAuth, campaigns stalled

**Actions:**
- [ ] Escalate to Anthony: Re-authorize Gmail OAuth for invest@ and timj@ accounts
- [ ] Wait 24h+ between re-auths to avoid Google bulk revocation
- [ ] Verify campaigns resume sending after re-auth
- [ ] Monitor deliverability (Tier 2 has 0 opens on 150 emails sent)

### 5. Data Quality & Monitoring (Owner: RevOps)
**Priority:** MEDIUM  
**Actions:**
- [ ] Set up daily Stripe alerts (new orders, failed checkouts, revenue)
- [ ] Build checkout funnel dashboard (GA4: homepage → product page → checkout → complete)
- [ ] Weekly conversion rate reporting
- [ ] Customer feedback survey (why did you abandon checkout?)

## Success Metrics (Next 30 Days)

| Metric | Current | Target (Week 1) | Target (Week 4) |
|--------|---------|-----------------|-----------------|
| Orders/week | 4 | 10 | 30 |
| Revenue/week | $231 | $350-500 | $600-900 |
| Checkout conversion | 3% | 10% | 20% |
| Traffic (sessions/day) | 21 | 40 | 60 |
| Abandoned cart recovery | 0% | 5% | 10% |

## Escalation

**If no improvement in 7 days:**
- Board meeting to discuss product-market fit
- Consider pivot to catering/meal kits
- Evaluate pricing strategy
- Review competitive landscape

**Immediate escalations:**
- CTO: Checkout flow audit (due: 2026-04-14)
- RevOps: Abandoned cart email setup (due: 2026-04-15)
- Advertising Creative: Meta ad creative (due: 2026-04-15)

---

**Next Update:** 2026-04-14 EOD
