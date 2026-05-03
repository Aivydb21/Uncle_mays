# Meta Campaign Delivery Monitoring Plan (2026-04-17)

## Context

Board diagnosed and fixed campaign optimization issue at 6:19 PM on 2026-04-17:
- **Root cause:** Campaign optimized for Purchase conversions, but Pixel has 0 Purchase events in last 7 days
- **Fix:** Created 3 new ad sets optimized for INITIATED_CHECKOUT (96 events available)
- **Expected:** Delivery within 1-2 hours
- **Actual:** 5 hours later (11:30 PM), still zero delivery

## Current State

**Campaign:** Subscription Launch Apr 2026 (ID: 120243219649250762)
- Status: ACTIVE / ACTIVE
- Daily budget: $67.00
- Budget remaining: $30.49
- Account total spent: $63.06

**Ad Sets (all ACTIVE, created 6:19 PM):**
1. FB Feed - Women 25-35 - Hyde Park (Checkout) - 120243236041950762
2. IG Stories - Women 25-35 - Hyde Park (Checkout) - 120243236049950762
3. IG Feed - Women 25-35 - Hyde Park (Checkout) - 120243236057640762

**Ads:** 21 total (7 per ad set), all ACTIVE with no issues

**Pixel Data (last 7 days):**
- PageView: ~1,100
- InitiateCheckout: 96
- ViewContent: 4
- Purchase: 0

## Monitoring Schedule

### Morning Check (2026-04-18, 8:00 AM)
Run `./scripts/monitor-meta-delivery.sh` to check if delivery started overnight.

**If delivering:**
- Track performance hourly for first 4 hours
- Monitor InitiateCheckout conversion rate
- Check if we start getting Purchase events from paid traffic
- Calculate CPA for checkouts

**If not delivering:**
1. Escalate to Anthony for Meta UI check (billing, delivery insights, account restrictions)
2. Consider budget increase to $100+ daily
3. Test wider audience (Chicago metro vs Hyde Park only)
4. Check if payment method needs updating

### Hourly Checks (first 4 hours of delivery)
- Impressions and reach
- Click-through rate
- Cost per click
- InitiateCheckout events
- Purchase events (if any)

### Daily Report
Include in CRO daily report:
- Delivery status (yes/no)
- Spend vs budget
- Impressions, reach, clicks
- Checkout events from paid traffic
- Purchase events from paid traffic
- Blocker diagnosis if not delivering

## Delivery Blockers (Diagnosis Checklist)

If ads still aren't delivering by morning:

**Payment/Billing:**
- [ ] Payment method valid and not declined
- [ ] Account spending limit not reached
- [ ] No billing holds or restrictions

**Budget:**
- [ ] $30.49 remaining might be too low - increase to $100+ daily
- [ ] Campaign lifetime budget not exhausted
- [ ] Account-level spend cap not blocking

**Audience:**
- [ ] Hyde Park targeting too narrow for delivery
- [ ] Test: widen to Chicago metro or add adjacent neighborhoods (Kenwood, Bronzeville, Woodlawn)
- [ ] Check audience size in Meta UI (needs 1,000+ for reliable delivery)

**Technical:**
- [ ] Pixel firing correctly (verify with Pixel Helper extension)
- [ ] Ad creative approved (no policy violations)
- [ ] Ad account not flagged or restricted

## Conversion Funnel Issue (Separate Priority)

**Critical:** 96 InitiateCheckout events → 0 Purchase events = 0% conversion

This is a separate revenue blocker from ad delivery. Once ads start delivering, we need to immediately diagnose:

1. **Stripe Webhook:** Verify checkout.session.completed and payment_intent.succeeded events are firing
2. **Pixel Integration:** Confirm Purchase event fires on payment success
3. **Checkout Flow:** Test full user journey from ad click → purchase confirmation
4. **Payment Processing:** Check for Stripe errors, declines, or failures
5. **GA4 Data:** Cross-reference with GA4 e-commerce events to confirm tracking

**Next Steps (post-delivery):**
- Run test purchase from ad click to confirm full funnel
- Check Stripe dashboard for abandoned payment intents
- Review checkout form validation errors
- Analyze drop-off points between InitiateCheckout and Purchase

## Success Criteria

**Short-term (24 hours):**
- Ads delivering (impressions > 0)
- Spend within budget
- InitiateCheckout events from paid traffic

**Medium-term (7 days):**
- Purchase events from paid traffic (conversion funnel fixed)
- CPA for purchases under $50
- ROAS positive (revenue > spend)

**Long-term (30 days):**
- 30 orders/week target from paid traffic
- Stable CAC under $30
- 5%+ checkout-to-purchase conversion rate
