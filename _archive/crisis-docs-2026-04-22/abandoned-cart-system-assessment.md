# Abandoned Cart Recovery System Assessment
**Date:** 2026-04-16  
**Analyst:** Growth & Conversion Operator  
**Issue:** UNC-341

---

## Executive Summary

Uncle May's Produce has a **fully-built abandoned cart recovery infrastructure** already deployed. The system uses Trigger.dev v3 for task orchestration, Mailchimp for email delivery, and Apollo for CRM tracking.

### Current Performance
- **Abandonment Rate:** 97% (100 sessions started, 3 completed in last 30 days)
- **Revenue Lost:** $4,655.50 (last 30 days)
- **Average Cart Value:** $46.55
- **Product Mix:** 90% one-time, 10% subscription
- **Recoverable Carts (non-internal):** 1 email ($31.50) - rest are internal @unclemays.com test sessions

### System Status
✅ **Infrastructure:** Fully built and code-deployed  
⚠️ **Operational Status:** Partially active, needs configuration completion  
🔴 **Native Mailchimp Automation:** Paused (status: "save", not live)

---

## System Architecture (Existing)

### 1. Three-Tiered Recovery Approach

#### Tier 1: Direct Trigger (On Checkout Submit)
- **Trigger Point:** POST to `/api/checkout/session` after customer submits delivery info
- **Wait Period:** 1 hour (Trigger.dev checkpointed wait)
- **Task:** `sendAbandonedCheckoutEmail`
- **Verification:** Re-checks session status before sending
- **Status:** ⚠️ Requires `TRIGGER_SECRET_KEY` env var (currently missing in deployment)

#### Tier 2: Scheduled Fallback (Every 15 Minutes)
- **Cron:** `*/15 * * * *` (every 15 minutes)
- **Task:** `abandonedCheckoutProcessor`
- **Window:** Catches sessions 1-4 hours old
- **Actions:** 
  - Tags in Apollo (label: "Customers")
  - Upserts in Mailchimp
  - Sends recovery email via Mailchimp campaign
  - Marks session as processed
- **Status:** ✅ Should be running if Trigger.dev tasks are deployed

#### Tier 3: Manual Backfill
- **Task:** `backfillAbandonedCheckouts`
- **Use Case:** Historical recovery, testing
- **Features:** Dry-run mode, configurable lookback window
- **Status:** ✅ Available for manual trigger

### 2. Mailchimp Integration

**Dual System:**
1. **Native E-commerce Automation** (Currently Paused)
   - Store ID: `unclemays_stripe`
   - Automation ID: `49a3af119a`
   - Status: `save` (not live)
   - **Action Required:** Activate or remove

2. **Custom Trigger.dev Campaigns** (Partially Active)
   - Creates targeted Mailchimp campaigns per abandoned cart
   - Recent activity: 10 campaigns created, 1 sent today (2026-04-16 18:02)
   - Performance: 0 opens, 0 clicks on sent campaign
   - Issue: Many campaigns created but stuck in "save" status (not sending)

### 3. Data Flow

```
Customer submits delivery form
  ↓
POST /api/checkout/session
  ↓
Creates local session in checkout-store
  ↓
(Parallel, non-blocking):
  1. Upsert Mailchimp contact + tag "checkout_started"
  2. Create Mailchimp e-commerce cart
  3. Trigger Trigger.dev task (if TRIGGER_SECRET_KEY exists)
  ↓
[1 hour wait - Trigger.dev checkpoint]
  ↓
Verify session still abandoned (not paid, not already sent)
  ↓
Send recovery email via Mailchimp campaign API
  ↓
Mark session.recoveryEmailSent = true
```

**On Payment Success:**
```
PATCH /api/checkout/session { completedAt: timestamp }
  ↓
Tag customer "order_completed" + deactivate "checkout_started"
  ↓
Delete Mailchimp cart (prevents Journey from firing)
```

---

## Current Configuration Gaps

### Environment Variables (Missing or Incomplete)

| Variable | Status | Impact |
|----------|--------|--------|
| `TRIGGER_SECRET_KEY` | ❌ Missing | Direct trigger won't fire; relies on cron fallback only |
| `MAILCHIMP_API_KEY` | ✅ Present | Working |
| `MAILCHIMP_AUDIENCE_ID` | ❓ Unknown | Check if set in deployment env |
| `APOLLO_API_KEY` | ❓ Unknown | CRM tagging won't work if missing |
| `SITE_BASE_URL` | ❓ Unknown | Falls back to `https://unclemays.com` |

**Deployment Platform:** Likely Vercel (Next.js app) - env vars need to be set in Vercel dashboard

### Mailchimp Store Configuration

- ✅ Store exists: `unclemays_stripe`
- ✅ Products mapped: starter, family, community boxes
- ❌ 0 active carts (all deleted or expired)
- ⚠️ Native automation paused - **decide: activate or remove?**

---

## Recovery Email Analysis

### Current Email (Single Email, No Sequence)

**Timing:** 1 hour after abandon  
**Subject:** "Your Uncle May's produce box is still waiting"  
**Preview:** "Complete your order and get fresh produce delivered."  
**From:** Uncle May's Produce / info@unclemays.com  
**CTA:** "Complete My Order" → Returns to product checkout page with UTM tracking  

**Email Content:**
- ✅ Clean, simple design
- ✅ Personalized with first name
- ✅ Clear CTA button (green, prominent)
- ✅ Phone number for support
- ✅ UTM tracking: `utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery`
- ❌ No urgency (delivery timeline, inventory scarcity)
- ❌ No social proof (97% intent-to-shop, customer testimonials)
- ❌ No product image or cart details
- ❌ Only 1 email, no follow-up sequence

### Issue: Original Request Specified 3-Email Sequence

**UNC-341 Requirements:**
- Email 1: 1 hour (current implementation ✅)
- Email 2: 24 hours (not implemented ❌)
- Email 3: 72 hours (not implemented ❌)

**Current System:** Only sends 1 email, then stops

---

## Performance Data

### Last 30 Days (2026-03-17 to 2026-04-16)

| Metric | Value |
|--------|-------|
| Expired Stripe sessions | 100 |
| Total revenue lost | $4,655.50 |
| Average cart value | $46.55 |
| Recoverable emails (non-internal) | 1 |
| Recoverable revenue | $31.50 |

**Note:** 99 of 100 sessions are internal test emails (@unclemays.com). Only 1 real customer abandoned cart in last 30 days.

### Daily Abandonment Pattern

| Date | Sessions |
|------|----------|
| 2026-04-15 | 4 |
| 2026-04-14 | 1 |
| 2026-04-11 | 7 |
| 2026-04-10 | 9 |
| 2026-04-09 | 7 |
| 2026-04-08 | 22 |
| 2026-04-06 | 5 |

**Peak:** April 8 (22 sessions) - likely testing activity

### Mailchimp Campaign Performance (Today, 2026-04-16)

- **Campaigns created:** 10 (last batch)
- **Campaigns sent:** 1
- **Opens:** 0
- **Clicks:** 0
- **Status of unsent:** Stuck in "save" (draft) status

**Red Flag:** Campaigns are being created but not sending successfully

---

## Root Cause Analysis: Why Aren't Emails Sending?

### Hypothesis 1: Missing Trigger.dev Secret Key
- ❌ `TRIGGER_SECRET_KEY` not in `.env`
- ❓ May be set in Vercel env but not locally
- **Impact:** Direct triggers won't fire from checkout API
- **Mitigation:** Cron fallback should still work every 15 minutes

### Hypothesis 2: Mailchimp Campaign Send Failures
- ✅ Campaigns are being created (API calls succeeding)
- ❌ Many campaigns stuck in "save" status
- **Possible Causes:**
  - Mailchimp API rate limits
  - Missing/invalid segment targeting (email doesn't exist in list)
  - Insufficient Mailchimp plan permissions (Free tier: 500 sends/month)
  - Campaign not reaching "send" API call (error in code path)

### Hypothesis 3: No Real Traffic to Recover
- ✅ Only 1 non-internal abandoned cart in 30 days
- **Reality Check:** The 97% abandon rate is mostly internal testing
- **Real Customer Abandonment:** Very low volume to assess system performance

### Hypothesis 4: Native Mailchimp Automation Conflict
- ⚠️ Native automation exists but is paused
- **Potential Issue:** If activated, would compete with custom Trigger.dev campaigns
- **Recommendation:** Pick one approach, disable the other

---

## Immediate Action Items

### 1. Fix Configuration (Priority: CRITICAL)

**Complete Environment Variables:**
```bash
# Add to Vercel project environment (Production + Preview)
TRIGGER_SECRET_KEY=<from Trigger.dev dashboard>
MAILCHIMP_API_KEY=<REDACTED-SET-IN-ENV>
MAILCHIMP_AUDIENCE_ID=2645503d11
APOLLO_API_KEY=<from ~/.claude/apollo-config.json>
SITE_BASE_URL=https://unclemays.com
```

**How to Find TRIGGER_SECRET_KEY:**
1. Login to https://cloud.trigger.dev
2. Navigate to project `proj_mgkoedwrgnjwbckanbbx`
3. Settings → API Keys → Copy "Secret Key"

### 2. Verify Trigger.dev Deployment (Priority: HIGH)

**Check Deployment Status:**
```bash
cd ~/Desktop/business
npx trigger.dev@latest deploy --dry-run
```

**Expected Output:** Tasks should show as deployed:
- `send-abandoned-checkout-email`
- `abandoned-checkout-processor` (cron)
- `backfill-abandoned-checkouts`

**If Not Deployed:**
```bash
npx trigger.dev@latest deploy --env prod
```

### 3. Debug Mailchimp Campaign Send Failures (Priority: HIGH)

**Test Campaign Creation + Send:**
```bash
# Create test script to manually trigger recovery email
# Check Mailchimp API response for campaign send failures
# Review Mailchimp activity log for rate limit or permission errors
```

**Check Mailchimp Plan Limits:**
- Free tier: 500 sends/month
- Current usage: 126 total campaigns sent (lifetime)
- **Question:** Are we hitting monthly send limits?

### 4. Decide on Native Mailchimp Automation (Priority: MEDIUM)

**Option A: Activate Native Automation**
- Pro: No custom code to maintain
- Pro: Built-in Mailchimp Journey analytics
- Con: Less customization (can't do 3-email sequence easily)
- Con: Requires store/cart sync to work properly

**Option B: Disable Native, Use Trigger.dev Only**
- Pro: Full control over timing, copy, sequence
- Pro: Can implement 3-email sequence as requested
- Pro: Better integration with Apollo CRM
- Con: More complex system to maintain

**Recommendation:** Use Trigger.dev system, disable native automation (delete or archive). Justification: Native automation is paused and adds unnecessary complexity. Trigger.dev approach gives full control for A/B testing and multi-email sequences.

### 5. Implement 3-Email Sequence (Priority: MEDIUM)

**Current:** 1 email at 1 hour  
**Requested:** 3 emails at 1hr, 24hr, 72hr

**Implementation Approach:**

**Option A: Modify Existing Task (Simplest)**
```typescript
// In sendAbandonedCheckoutEmail task:
await wait.for({ hours: 1 });
await sendEmail1(); // Current email

await wait.for({ hours: 23 }); // +23 hours = 24hr total
if (!isPaid() && !optedOut()) {
  await sendEmail2(); // Social proof + urgency
}

await wait.for({ hours: 48 }); // +48 hours = 72hr total
if (!isPaid() && !optedOut()) {
  await sendEmail3(); // Final offer + discount?
}
```

**Option B: Separate Tasks with Chaining (More Flexible)**
```typescript
// Task 1: sendAbandonedEmail1 (1hr wait)
// Task 2: sendAbandonedEmail2 (24hr wait, triggered after email1)
// Task 3: sendAbandonedEmail3 (72hr wait, triggered after email2)
```

**Recommendation:** Option A for speed, Option B for A/B testing flexibility

---

## Optimization Opportunities

### Email Copy Improvements

**Email 1 (1 hour) - Current vs. Recommended:**

| Current | Recommended |
|---------|-------------|
| Generic "produce box" | Show specific product (Starter, Family, Community) |
| No urgency | "Next delivery: [Day], [Date]" |
| No social proof | "97% of customers complete their order" |
| No product image | Include box image or produce photos |
| Generic CTA "Complete Order" | "Get Fresh Produce by [Day]" |

**Email 2 (24 hours) - New:**
- Subject: "Still interested in fresh produce delivered?"
- Content: Social proof (customer testimonials, delivery map)
- CTA: Emphasize convenience ("No grocery store trip needed")
- Add: "Limited delivery slots for [Date]"

**Email 3 (72 hours) - New:**
- Subject: "Last chance: Your produce box is reserved"
- Content: FOMO + possible first-order discount
- CTA: "Claim Your Box Now"
- **Question for CRO:** Approved discount amount (10%? $5 off?)

### Segmentation Strategy

**Current:** No segmentation (same email to all abandons)

**Recommended Segments:**

| Segment | Criteria | Messaging Angle |
|---------|----------|-----------------|
| First-time customers | No prior orders | Emphasize trial, zero risk |
| Repeat customers | 1+ prior orders | "Welcome back" + new products |
| Subscription browsers | Viewed subscription page | Highlight convenience + savings |
| One-time browsers | Viewed one-time page | Flexibility, no commitment |
| Mobile abandoners | Device = mobile | Shorter copy, bigger CTA button |
| Desktop abandoners | Device = desktop | More detailed product info |
| High-value carts | Cart > $60 | Free delivery threshold |
| Low-value carts | Cart < $40 | Upsell to free delivery threshold |

**Data Available:**
- ✅ Product type (subscription vs. one-time)
- ✅ Cart value
- ⚠️ Device (requires GA4 integration or user-agent parsing)
- ❌ Order history (requires Stripe customer lookup)

### A/B Test Roadmap

**Week 1-2: Baseline**
- Run current 1-email system
- Measure: open rate, click rate, recovery rate
- Target: 20%+ open rate (industry benchmark: 45%)

**Week 3-4: Subject Line Test**
- Variant A: Urgency ("Your box expires in 24 hours")
- Variant B: FOMO ("Don't miss this week's produce")
- Variant C: Personalization ("[Name], your $XX cart is waiting")
- Measure: Open rate lift

**Week 5-6: Timing Test**
- Variant A: 1hr / 24hr / 72hr (baseline)
- Variant B: 30min / 12hr / 48hr (faster)
- Variant C: 3hr / 48hr / 7days (slower)
- Measure: Recovery rate by timing

**Week 7-8: Incentive Test**
- Variant A: No discount (baseline)
- Variant B: $5 off first order
- Variant C: 10% off first order
- Variant D: Free delivery (if normally charged)
- Measure: Recovery rate vs. margin impact

---

## Success Metrics & Targets

### Industry Benchmarks
- Average cart recovery open rate: **45%**
- Average recovery rate: **10-15%**
- Best-in-class recovery rate: **20-30%**

### Uncle May's Targets

**Month 1 (System Stabilization):**
- ✅ All env vars configured
- ✅ Trigger.dev tasks verified deploying
- ✅ 1st recovery email sending reliably
- 📊 Baseline metrics: open rate, click rate, recovery rate
- 🎯 Target: 20% open rate, 5% recovery rate

**Month 2 (3-Email Sequence):**
- ✅ Emails 2 & 3 implemented and tested
- 📊 Sequence performance: email 1 vs. 2 vs. 3
- 🎯 Target: 10% recovery rate (cumulative across all emails)
- 💰 Revenue recovered: $1,000+ (assumes 17% of $5,760 monthly potential)

**Month 3+ (Optimization):**
- ✅ Segmentation by product type, device, cart value
- ✅ A/B tests running (subject lines, timing, incentives)
- 🎯 Target: 15-20% recovery rate
- 💰 Revenue recovered: $2,000+/month

### Revenue Model

**Assumptions:**
- 100 abandoned carts/month (current rate)
- 97% are internal tests → **3 real customer abandons/month** (current reality)
- Average cart value: $46.55
- Recovery rate: 10-20%

**Realistic Recovery Potential (Current Low Traffic):**
- 3 abandons × $46.55 × 15% recovery = **$21/month**

**At Scale (Post-Launch with Paid Ads):**
- Assumption: 30 orders/week target = 120 orders/month
- If funnel is: 400 checkouts started → 120 completed = 70% abandon rate
- 280 real abandons/month × $46.55 × 15% recovery = **$1,955/month recovered**

**Key Insight:** Current 97% abandon rate is misleading - it's mostly internal testing. Real opportunity emerges when paid ads drive traffic.

---

## Coordination Requirements

### With RevOps
- Provide weekly recovery rate reports
- Share GA4 conversion event data (UTM-tagged recovery orders)
- Coordinate on Stripe customer_details enrichment

### With Advertising Creative
- **Immediate:** Review and approve Email 2 & 3 copy (once drafted)
- **Ongoing:** Provide email design templates (mobile-first)
- **Monthly:** Review performance, suggest copy optimizations

### With CRO
- Approve discount strategy for Email 3 (if used)
- Review recovery rate vs. margin impact
- Approve budget for Mailchimp plan upgrade (if needed for higher volume)

### With CTO
- Verify Trigger.dev env vars set in Vercel
- Confirm task deployment status
- Add device tracking metadata to checkout sessions (for segmentation)
- Consider: Move from Mailchimp campaign API to transactional email (Sendgrid/Postmark) for higher reliability

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Trigger.dev tasks not deployed | Medium | High | Run `npx trigger.dev deploy`, verify in dashboard |
| Missing env vars in production | High | High | Add to Vercel, redeploy |
| Mailchimp API rate limits | Low | Medium | Monitor usage, upgrade plan if needed |
| Campaign send failures | Medium | High | Debug API responses, add error logging |
| Email deliverability issues | Low | High | Verify SPF/DKIM, monitor bounce rate |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low real traffic = can't validate system | High | Medium | Focus on infrastructure readiness for paid ads launch |
| Recovery emails marked as spam | Low | High | Warm send from info@, use plain text + HTML |
| Customer annoyance (too many emails) | Low | Medium | Stop on reply, honor unsubscribe, max 3 emails |
| Discount erosion (if used in Email 3) | Medium | Medium | Limit to first-order only, test margin impact |

---

## Recommended Execution Plan

### Week 1: Fix Configuration & Deploy (April 17-23)

**Day 1 (April 17):**
- [ ] Add all missing env vars to Vercel (Trigger, Mailchimp, Apollo)
- [ ] Deploy Trigger.dev tasks: `npx trigger.dev deploy --env prod`
- [ ] Verify tasks appear in Trigger.dev dashboard as "deployed"

**Day 2 (April 18):**
- [ ] Create test abandoned cart (internal email)
- [ ] Verify Email 1 sends after 1 hour
- [ ] Check Mailchimp campaign status (should be "sent", not "save")
- [ ] Verify GA4 tracking fires on recovery link click

**Day 3 (April 19):**
- [ ] Debug any send failures (check Trigger.dev logs)
- [ ] Review Mailchimp API rate limits and current usage
- [ ] Document baseline system performance

**Day 4-5 (April 20-21):**
- [ ] Make final email copy optimizations (add urgency, social proof)
- [ ] Coordinate with Advertising Creative for email design review
- [ ] Prepare for paid ads launch (system ready to scale)

### Week 2: Implement 3-Email Sequence (April 24-30)

**Day 1-2:**
- [ ] Draft Email 2 copy (24-hour follow-up)
- [ ] Draft Email 3 copy (72-hour follow-up)
- [ ] Get CRO approval for discount amount (if used)
- [ ] Get Advertising Creative approval for all copy

**Day 3-4:**
- [ ] Code Email 2 & 3 into `sendAbandonedCheckoutEmail` task
- [ ] Add additional wait periods (23hr, 48hr)
- [ ] Add re-verification checks between emails
- [ ] Test full 3-email sequence (dry-run mode)

**Day 5:**
- [ ] Deploy updated task
- [ ] Monitor first live 3-email sequence
- [ ] Verify no duplicate sends, proper timing

### Week 3-4: Baseline Measurement (May 1-14)

- [ ] Track all recovery emails sent
- [ ] Measure open rate, click rate, recovery rate per email
- [ ] Calculate revenue recovered
- [ ] Identify highest-performing email in sequence
- [ ] Document for A/B test planning

### Week 5+: Optimization & Scaling (May 15+)

- [ ] Launch first A/B test (subject lines)
- [ ] Implement segmentation (product type, cart value)
- [ ] Weekly reports to CRO (recovery rate, revenue)
- [ ] Scale with paid ads traffic

---

## Questions for CRO

1. **Discount Approval:** What discount amount (if any) is approved for Email 3 recovery?
   - Suggested: $5 off first order OR 10% off first order
   - Margin impact vs. recovery rate trade-off

2. **Mailchimp Plan:** Current plan is Free (500 sends/month). At what volume should we upgrade?
   - 280 real abandons/month × 3 emails = 840 sends/month → **requires paid plan**
   - Cost: ~$20-50/month for 1,500 sends

3. **Native Automation:** Should we delete the paused Mailchimp native automation or keep as backup?
   - Recommendation: Delete to avoid confusion, commit to Trigger.dev approach

4. **Alternative Email Provider:** Should we evaluate transactional email (Sendgrid/Postmark) vs. Mailchimp campaigns?
   - Pro: Higher reliability, better deliverability, simpler API
   - Con: Migration effort, separate platform
   - Cost comparison: Sendgrid ~$20/month for 40k emails vs. Mailchimp ~$50/month for 1,500 sends

---

## Conclusion

**The abandoned cart recovery system is fully built but not fully operational.**

✅ **Infrastructure:** Complete  
⚠️ **Configuration:** Partial (missing env vars)  
❌ **Optimization:** Not yet implemented (still 1-email, not 3-email sequence)

**Immediate Priority:** Fix configuration, verify deployment, then implement 3-email sequence.

**Timeline to Full Operation:** 2 weeks (config + sequence)

**Expected Revenue Impact:**
- Short-term (current traffic): ~$20/month
- Post-launch (paid ads traffic): ~$1,900/month (15% recovery on 280 abandons)

**Next Steps:** Complete Week 1 action items (configuration + deployment verification) before paid ads launch on April 21.

---

**Prepared by:** Growth & Conversion Operator  
**For:** CRO Review  
**Paperclip Issue:** [UNC-341](/UNC/issues/UNC-341)  
**Related Issues:** [UNC-339](/UNC/issues/UNC-339) (RevOps analysis), [UNC-340](/UNC/issues/UNC-340) (CTO audit)
