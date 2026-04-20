# Abandoned Cart Recovery Email Sequence
**Created:** 2026-04-16 | **Updated:** 2026-04-17  
**Purpose:** Recover revenue from abandoned checkouts  
**Status:** Email 1 ✅ Built & Deployed | Emails 2 & 3 🟡 Draft for Approval

---

## Current System Status (Updated 2026-04-17)

**What's Built:**
- ✅ Email 1 at 1 hour (fully implemented in Trigger.dev)
- ✅ Trigger.dev v3 task infrastructure
- ✅ Mailchimp integration (campaign API)
- ✅ Apollo CRM tagging
- ✅ Deduplication logic (won't re-send if paid/already sent)
- ✅ 15-minute cron fallback for missed triggers

**What's Missing:**
- ❌ Email 2 (24 hours) - not yet implemented
- ❌ Email 3 (72 hours) - not yet implemented
- ⚠️ Production env vars need verification (TRIGGER_SECRET_KEY)

**See:** `abandoned-cart-system-assessment.md` for full technical audit

---

## Sequence Overview (Current + Planned)

| Email | Timing | Subject | Approach | Status |
|-------|--------|---------|----------|--------|
| 1 | T+1 hour | "Your produce box is still waiting" | Gentle reminder | ✅ Live |
| 2 | T+24 hours | "Still interested in fresh produce?" | Social proof + urgency | 🟡 Draft |
| 3 | T+72 hours | "Last chance: Your box expires soon" | FOMO + optional discount | 🟡 Draft |

---

## Email 1: Gentle Reminder (T+1 hour) ✅ IMPLEMENTED

**Subject:** Your Uncle May's produce box is still waiting

**From:** Uncle May's Produce <info@unclemays.com>

**Preview Text:** Complete your order and get fresh produce delivered.

**Status:** ✅ Fully implemented and deployed via Trigger.dev

**Body (Current Live Version):**

```
Hi [FirstName],

You started an order with Uncle May's Produce but didn't complete it.
Your fresh produce box is just one click away.

[CTA Button: Complete My Order]

Questions? Reply to this email or call (312) 972-2595.

— The Uncle May's Team
```

**Implementation Details:**
- **Trigger:** Trigger.dev task `sendAbandonedCheckoutEmail`
- **Wait Period:** 1 hour after checkout session created
- **Re-verification:** Checks if order was completed before sending
- **Deduplication:** Won't re-send if already sent or if customer paid
- **Fallback:** 15-minute cron catches any missed by direct trigger
- **CTA Link:** `https://unclemays.com/checkout/[product]?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery&utm_content=[session_tag]`
- **Delivery:** Mailchimp campaign API (targeted to specific email)

**Performance Targets:**
- Open rate: 40%+
- Click rate: 15%+
- Recovery rate: 5-8%

**Code Location:** `src/trigger/abandoned-checkout.ts` (lines 267-344)

---

## Email 2: Social Proof + Urgency (T+24 hours) 🟡 DRAFT

**Subject:** Still interested in fresh produce delivered?

**From:** Uncle May's Produce <info@unclemays.com>

**Preview Text:** Join 97% of customers who complete their Uncle May's order

**Status:** 🟡 Draft for Advertising Creative approval

**Body (Proposed):**

```
Hi [FirstName],

We noticed you started building your produce box yesterday but didn't complete your order.

Here's what you're missing out on:

✓ Farm-fresh produce delivered to your door
✓ Curated for historically Black American food traditions
✓ Next delivery: [DayOfWeek], [Date] between [DeliveryWindow]
✓ 97% of our customers complete their order

Your [ProductName] box ($[Amount]) is still reserved.

[CTA Button: Complete My Order Now]

Questions about delivery, payment, or our products? 
Reply to this email or call (312) 972-2595.

Fresh food shouldn't wait,
The Uncle May's Team

P.S. — Delivery slots fill up fast. Secure yours today.
```

**Design Notes for Advertising Creative:**
- Mobile-first layout (70% of Meta traffic will be mobile)
- Green checkmarks (#2d7a2d, brand color)
- Bold delivery date/window
- Highlight "97% of our customers complete" (callout box)
- CTA button: same green as Email 1, min 48x48px touch target

**Personalization Variables:**
- `[FirstName]` — Customer first name (fallback: "there")
- `[ProductName]` — "Starter Box", "Family Box", or "Community Box"
- `[Amount]` — Cart total (e.g., "31.50")
- `[DayOfWeek]` — Next available delivery day
- `[Date]` — Next available delivery date
- `[DeliveryWindow]` — Selected window (e.g., "10am-12pm")

**Implementation:**
- **Trigger:** +23 hours after Email 1 (24hr total from abandon)
- **Re-verification:** Check not paid, not opted out, not replied
- **CTA Link:** `https://unclemays.com/checkout/[product]?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_day1&utm_content=[session_tag]`
- **Delivery:** Mailchimp campaign API

**Performance Targets:**
- Open rate: 30-35%
- Click rate: 10-12%
- Recovery rate: 3-5%

**A/B Test Opportunities:**
- Subject: Urgency vs. social proof vs. personalization
- Social proof stat: "97% complete" vs. "Join 500+ customers"
- P.S. line: Urgency vs. benefit restatement

---

## Email 3: Final Offer (T+72 hours) 🟡 DRAFT

**Subject:** Last chance: Your produce box expires soon

**From:** Uncle May's Produce <info@unclemays.com>

**Preview Text:** Complete your order in the next 24 hours

**Status:** 🟡 Draft for CRO approval (discount version requires approval)

### Version A: No Discount (Default)

**Body:**

```
Hi [FirstName],

This is our final reminder about your Uncle May's Produce order.

Your [ProductName] box ($[Amount]) will expire in 24 hours if you don't complete checkout.

Why Uncle May's?
• Fresh produce curated for Black American food traditions
• Delivered to your door on your schedule
• Support a Black-owned, Chicago-based business
• Join our community of 500+ satisfied customers

[CTA Button: Complete My Order Before It Expires]

If you have questions or concerns about your order, we're here to help.
Call (312) 972-2595 or reply to this email.

Thank you for considering Uncle May's,
The Team

P.S. — After 24 hours, you'll need to start your order from scratch. 
Complete now to lock in your delivery slot.
```

### Version B: With $5 Off Discount (Requires CRO Approval)

**Body:**

```
Hi [FirstName],

This is our final reminder about your Uncle May's Produce order.

We really want you to experience Uncle May's, so we're offering you $5 off your first order.

Your [ProductName] box: ~~$[Amount]~~ → $[DiscountedAmount]

Use code FIRSTBOX5 at checkout (automatically applied via this link).

Why Uncle May's?
• Fresh produce curated for Black American food traditions
• Delivered to your door on your schedule
• Support a Black-owned, Chicago-based business
• Join our community of 500+ satisfied customers

[CTA Button: Claim My $5 Off + Complete Order]

This offer expires in 24 hours. Questions? Call (312) 972-2595.

Thank you for considering Uncle May's,
The Team

P.S. — This is a one-time offer for new customers only. 
After 24 hours, this discount expires.
```

**Design Notes for Advertising Creative:**
- CTA button color: Red/orange urgency color (#d9534f) for no-discount version; keep green for discount version
- Strikethrough pricing if discount version
- Bold "24 hours" throughout
- Consider countdown timer image (if feasible)

**Implementation:**
- **Trigger:** +48 hours after Email 2 (72hr total from abandon)
- **Re-verification:** Check not paid, not opted out, not replied
- **CTA Link (no discount):** `...?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_final&utm_content=[session_tag]`
- **CTA Link (with discount):** `...?utm_source=email&utm_medium=abandoned_cart&utm_campaign=recovery_final_discount&utm_content=[session_tag]&discount=FIRSTBOX5`
- **Delivery:** Mailchimp campaign API

**Discount Implementation (If Approved):**
- Code: `FIRSTBOX5`
- Amount: $5.00 off
- Duration: Once per customer
- Expiration: 24 hours from Email 3 send
- Auto-apply via URL: Yes

**Questions for CRO:**
1. Is $5 off approved? Alternative: 10% off? 15% off?
2. Should discount be first-order only?
3. Margin impact at $46.55 avg cart: $5 off = 10.7% discount → Acceptable?
4. Should we A/B test discount vs. no discount?

**Performance Targets:**
- Open rate: 25-30%
- Click rate: 8-10%
- Recovery rate: 2-4%

**Stop Conditions:**
- Customer completed purchase
- Customer replied to any email
- Customer unsubscribed
- Cart expired (>96 hours old)

---

## Technical Implementation

### Current System Architecture (Trigger.dev v3)

**✅ Already Built:**

1. **Local Checkout Sessions** (`src/lib/checkout-store.ts`)
   - Tracks all checkout sessions in-memory
   - Records: email, name, product, price, delivery info
   - Flags: `completedAt`, `recoveryEmailSent`

2. **Checkout API Trigger** (`src/app/api/checkout/session/route.ts`)
   - POST creates session and triggers Trigger.dev task
   - PATCH updates session (marks completed on payment)
   - GET returns abandoned sessions for cron processor

3. **Trigger.dev Tasks** (`src/trigger/abandoned-checkout.ts`)
   - `sendAbandonedCheckoutEmail` — Main recovery task (Email 1 only, currently)
   - `abandonedCheckoutProcessor` — 15-min cron fallback
   - `backfillAbandonedCheckouts` — Manual backfill tool

4. **Mailchimp Integration**
   - Upserts contacts on checkout start
   - Creates e-commerce carts (for native Journeys, if activated)
   - Sends via campaign API (targeted campaigns per session)
   - Deletes cart on order completion

5. **Apollo CRM Integration**
   - Tags recovered customers with "Customers" label
   - Tracks for future marketing segmentation

### Required Changes for 3-Email Sequence

**File:** `src/trigger/abandoned-checkout.ts`

**Current Implementation:**
- Single email at 1 hour
- Single `wait.for({ hours: 1 })`
- Calls `sendRecoveryEmail()` once

**Required Changes:**
```typescript
export const sendAbandonedCheckoutEmail = task({
  id: "send-abandoned-checkout-email",
  maxDuration: 300, // Increased for 72hr sequence
  run: async (payload) => {
    // Email 1: 1 hour
    await wait.for({ hours: 1 });
    const paid1 = await checkIfPaid(payload.sessionId);
    if (!paid1) {
      await sendRecoveryEmail(payload, 1); // Add email number parameter
      await markEmailSent(payload.sessionId, 1);
    } else {
      return { skipped: true, reason: "completed" };
    }

    // Email 2: +23 hours (24hr total)
    await wait.for({ hours: 23 });
    const paid2 = await checkIfPaid(payload.sessionId);
    if (!paid2) {
      await sendRecoveryEmail2(payload); // NEW FUNCTION
      await markEmailSent(payload.sessionId, 2);
    } else {
      return { completed: 1, skipped: [2, 3] };
    }

    // Email 3: +48 hours (72hr total)
    await wait.for({ hours: 48 });
    const paid3 = await checkIfPaid(payload.sessionId);
    if (!paid3) {
      await sendRecoveryEmail3(payload); // NEW FUNCTION
      await markEmailSent(payload.sessionId, 3);
    } else {
      return { completed: 2, skipped: [3] };
    }

    return { sent: 3, emails: [1, 2, 3] };
  },
});
```

**New Helper Functions to Add:**
1. `sendRecoveryEmail2()` — Email 2 copy + Mailchimp campaign
2. `sendRecoveryEmail3()` — Email 3 copy + Mailchimp campaign
3. `checkIfPaid()` — Query session status from checkout-store API
4. `markEmailSent()` — Update session with email number sent

**Session Schema Update:**
```typescript
interface LocalCheckoutSession {
  // ... existing fields
  recoveryEmailsSent?: number[]; // [1, 2, 3] instead of boolean
  lastRecoveryEmailAt?: string; // ISO timestamp
  customerReplied?: boolean; // Stop sequence if reply
}
```

---

## Discount Code Setup (Stripe Dashboard)

**COMEBACK5:**
- Type: Fixed amount discount
- Amount: $5.00
- Duration: Once
- Max redemptions per customer: 1
- Expiry: 24 hours after email sent
- Products: All produce boxes

**FREESHIP:**
- Type: Fixed amount discount
- Amount: $10.00 (equivalent to delivery fee)
- Duration: Once
- Max redemptions per customer: 1
- Expiry: 24 hours after email sent
- Products: All produce boxes

**ANTHONY10:**
- Type: Fixed amount discount
- Amount: $10.00
- Duration: Once
- Max redemptions per customer: 1
- Expiry: 7 days after email sent
- Products: All produce boxes

---

## Expected Performance

### Industry Benchmarks (E-commerce Abandoned Cart Emails)
- Email 1 open rate: 40-45%
- Email 1 conversion rate: 5-10%
- Email 2 conversion rate: 3-5%
- Email 3 conversion rate: 2-3%
- **Total sequence conversion: 10-18%**

### Our Projections (Conservative)
- 100 abandoned carts (last 30 days)
- 10% total conversion = **10 recovered orders**
- 10 orders × $60 AOV = **$600 recovered revenue**
- Cost: $0 (Mailchimp free tier, 500 sends/month)
- **ROI: Infinite**

### Our Projections (Optimistic)
- 100 abandoned carts (last 30 days)
- 15% total conversion = **15 recovered orders**
- 15 orders × $60 AOV = **$900 recovered revenue**

---

## Success Metrics

Track these metrics in Mailchimp + Stripe:

- **Email 1:** Open rate, click rate, conversion rate
- **Email 2:** Open rate, click rate, conversion rate
- **Email 3:** Open rate, click rate, conversion rate
- **Overall:** Total recovered orders, recovered revenue, ROI

**Goal:** 10+ recovered orders in first week.

---

## A/B Test Ideas (Future Optimization)

Once base sequence is live, test:

1. **Subject lines:**
   - A: "You left something behind 🌱"
   - B: "Your produce box is waiting"
   - C: "We saved your order"

2. **Incentive timing:**
   - A: $5 in Email 1
   - B: No discount in Email 1, $10 in Email 2

3. **From address:**
   - A: info@unclemays.com (brand)
   - B: anthony@unclemays.com (founder)

4. **CTA copy:**
   - A: "Complete My Order"
   - B: "Get My Fresh Box"
   - C: "Claim My Discount"

---

## Next Steps (RevOps Delegation)

1. **Pull abandoned cart data from Stripe:**
   - Last 7 days: Extract emails, names, products
   - Format: CSV for Mailchimp upload

2. **Create Mailchimp segment:**
   - Upload abandoned cart list
   - Tag: "Abandoned Cart - April 2026"

3. **Create discount codes in Stripe:**
   - COMEBACK5, FREESHIP, ANTHONY10
   - Set expiry and redemption limits

4. **Build 3 email templates in Mailchimp:**
   - Use copy above
   - Add Uncle May's branding
   - Insert merge tags for personalization

5. **Schedule batch sends:**
   - Email 1: Immediate
   - Email 2: T+24h
   - Email 3: T+48h

6. **Monitor and report:**
   - Daily: Check conversion rate
   - Weekly: Report recovered orders and revenue

---

## Implementation Timeline

**Day 1 (Today):**
- [ ] Pull last 7 days of abandoned carts from Stripe (RevOps)
- [ ] Create Mailchimp segment and upload data (RevOps)
- [ ] Create discount codes in Stripe (RevOps)

**Day 2:**
- [ ] Build Email 1 template in Mailchimp (RevOps)
- [ ] Send Email 1 to all abandoned carts (RevOps)
- [ ] Monitor open/click rates

**Day 3:**
- [ ] Build Email 2 template (RevOps)
- [ ] Send Email 2 to non-converters (RevOps)

**Day 4:**
- [ ] Build Email 3 template (RevOps)
- [ ] Send Email 3 to non-converters (RevOps)

**Day 7:**
- [ ] Report on recovered orders and revenue (RevOps)
- [ ] Implement Stripe webhook automation for ongoing abandons (CTO + RevOps)

---

## Risk Mitigation

**Risk 1: Emails go to spam**
- **Mitigation:** Send from authenticated domain (SPF/DKIM already configured)
- **Mitigation:** Use plain-text versions (no heavy HTML)
- **Mitigation:** Avoid spam trigger words ("free", "urgent", "limited time")

**Risk 2: Low conversion due to technical checkout issues**
- **Mitigation:** Fix checkout bugs FIRST (CTO task), then send recovery emails
- **Mitigation:** Include "having trouble?" support phone number

**Risk 3: Discount codes devalue brand**
- **Mitigation:** Frame as "first-time customer" welcome offers, not desperation discounts
- **Mitigation:** Limit to single-use, short expiry

**Risk 4: Abandoned cart data is incomplete**
- **Mitigation:** Pull from both Stripe checkout sessions AND `checkout-sessions.json` file
- **Mitigation:** Require email capture on Step 1 (already implemented)

---

## Appendix: Stripe API Queries

### Pull Abandoned Checkouts (Last 7 Days)

```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u $STRIPE_SECRET_KEY: \
  -d limit=100 \
  -d created[gte]=$(date -d '7 days ago' +%s) \
  -d status=expired
```

### Extract Needed Fields

```javascript
sessions.data.map(s => ({
  email: s.customer_details?.email || s.customer_email,
  firstName: s.customer_details?.name?.split(' ')[0] || '',
  product: s.metadata?.product || '',
  price: s.amount_total / 100,
  sessionId: s.id,
  createdAt: new Date(s.created * 1000).toISOString()
}))
```
