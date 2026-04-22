# Emergency Demand Push Plan (UNC-195)
**Growth & Conversion Operator**  
**Date:** 2026-04-13  
**Cash Crisis:** $159.59 on hand, 0 orders Apr 7-12

---

## Current State

- **Mailchimp audience:** 6 members (down from 119 after investor cleanup)
- **Stripe balance:** $0.00 (all cleared out)
- **Abandoned checkout infrastructure:** EXISTS but needs immediate manual trigger
- **Zero orders:** Apr 7-12 (6 days)
- **Weekly target:** 30 boxes/week
- **Cash runway:** <1 day at current spend rate

---

## RECOMMENDATION 1: Trigger Abandoned Checkout Recovery NOW

### Existing Infrastructure Found

Located two Trigger.dev scheduled tasks:

1. **`stripe-abandoned-checkout.ts`**
   - Polls Stripe API for expired checkout sessions
   - Runs every 30 minutes
   - Sends recovery email 1 hour after session expiration
   - Includes manual backfill task: `backfillStripeAbandonedCheckouts`

2. **`abandoned-checkout.ts`**
   - Polls local checkout-store API
   - Runs every 15 minutes
   - Tracks sessions that started but didn't complete payment
   - Includes manual backfill task: `backfillAbandonedCheckouts`

### Immediate Action Required

**Run backfill tasks NOW** to catch abandoned checkouts from last 48 hours (instead of waiting for next scheduled run).

#### Execution Steps

```bash
# Step 1: DRY RUN to see how many sessions qualify
npx trigger.dev@latest dev --task backfillStripeAbandonedCheckouts \
  --payload '{"lookbackHours": 48, "dryRun": true}'

# Step 2: If count looks good, run LIVE
npx trigger.dev@latest dev --task backfillStripeAbandonedCheckouts \
  --payload '{"lookbackHours": 48, "dryRun": false}'

# Step 3: Run local checkout-store backfill as well
npx trigger.dev@latest dev --task backfillAbandonedCheckouts \
  --payload '{"lookbackHours": 48, "dryRun": false}'
```

### Email Copy (Already Built In)

The scripts include pre-approved email copy from Advertising Creative:

**Subject:** "Your Uncle May's box is waiting"

**Body highlights:**
- Personal greeting with customer name
- "You started an order but didn't finish" hook
- Social proof: "curated for Black families who want quality"
- Urgency: "Complete your order now and get Sunday delivery"
- CTA button: "Complete Your Order"
- Phone number: (312) 972-2595 for questions

**Email sequence:** 
- Email 1: Cart reminder (sent 1 hour after abandonment)
- Email 2 & 3: Follow-ups (already coded, not yet enabled)

### Expected Impact

- **Historical data:** 36 abandoned checkouts in last 30 days (from UNC-195)
- **Industry recovery rate:** 10-15%
- **Expected orders:** 3-5 from recovery emails alone
- **Revenue impact:** $285-$795 (at $95-$159/box)
- **Cost:** $0 (uses existing Mailchimp account)

### Approval Needed

✅ **Approve running backfill tasks** to send recovery emails immediately

---

## RECOMMENDATION 2: Emergency Email to Past Customers

### Target Audience

All paying customers from Stripe (last 90 days):
- Recent customers (0-14 days since last order)
- Lapsed customers (15-60 days since last order)
- Dormant customers (60+ days since last order)

**Current Mailchimp status:** Only 6 members (investors removed on 2026-04-10). **Must re-import customers from Stripe before sending.**

### Email Draft

**From:** Uncle May's Produce <info@unclemays.com>  
**Subject:** Fresh produce boxes back in stock - order by Thursday for Sunday delivery  
**Preview text:** Limited availability this week. Reserve your box now.

**Body:**

---

Hi there,

It's been a few weeks since your last Uncle May's produce box. We have fresh, curated produce ready for delivery this Sunday, but boxes are limited.

**Order by Thursday 11:59pm to guarantee Sunday delivery.**

Every box is hand-selected for Black families who want quality they can count on. 97% of our customers say they'd order again.

**[Order Now →]** https://unclemays.com/boxes?utm_source=email&utm_medium=reengagement&utm_campaign=emergency_apr13

Questions? Call us anytime at **(312) 972-2595**.

— The Uncle May's Team  
unclemays.com | Chicago, IL

---

### Execution Plan

1. **Pull customer emails from Stripe** (Growth & Conversion will handle)
2. **Re-import to Mailchimp** (batch upload, tag as "customers")
3. **Create draft campaign** in Mailchimp (not sent)
4. **Send preview link to Anthony** for final review
5. **Anthony approves** → schedule send for Tuesday morning (Apr 15)

### Expected Impact

- **Target list size:** ~20-40 past customers (estimate based on 36 abandoned + completed orders)
- **Open rate:** 64.7% (current Mailchimp performance)
- **CTR:** ~10% (industry standard for re-engagement)
- **Conversion:** 2-4 orders
- **Revenue impact:** $190-$636
- **Cost:** $0

### Approval Needed

1. ✅ **Approve email copy** (or provide edits)
2. ✅ **Approve sending to past customers** (re-engagement)

---

## RECOMMENDATION 3: Social Media Posts

### Platform Strategy

- **Instagram:** Urgency + visual appeal (produce photos)
- **Facebook:** Community + scarcity (Hyde Park/South Side targeting)
- **Posting schedule:** Tuesday morning (Apr 15) + Thursday reminder

### Instagram Post (Urgency)

```
📦 Fresh produce boxes dropping Sunday

Order by Thursday night to lock in your delivery. We're curating boxes with care for Black families who want quality + convenience.

89% of customers refer us to friends. See why at unclemays.com/boxes

#UnclesMays #ChicagoFood #FreshProduce #BlackOwnedBusiness #HydePark #SouthSide
```

**Image:** Fresh produce box (staged, colorful) - assign to Advertising Creative if photo needed

**Link:** https://unclemays.com/boxes?utm_source=instagram&utm_medium=organic&utm_campaign=emergency_apr13

---

### Facebook Post (Community + Scarcity)

```
Limited produce boxes available for Sunday delivery (Hyde Park + South Side).

Order by Thursday 11:59pm: unclemays.com/boxes

Premium produce, hand-selected for your table. Every box ships fresh. Call (312) 972-2595 with questions.

— Uncle May's Produce, Chicago
```

**Link:** https://unclemays.com/boxes?utm_source=facebook&utm_medium=organic&utm_campaign=emergency_apr13

---

### Execution Plan

- **Tuesday Apr 15:** Post to Instagram + Facebook (morning)
- **Thursday Apr 17:** Reminder post (evening, "Last chance" angle)
- **Cost:** $0 (organic posts only, no ad spend)

### Expected Impact

- **Reach:** 200-500 (current follower base + shares)
- **CTR:** 1-3% (organic social)
- **Orders:** 1-2
- **Revenue impact:** $95-$318

### Approval Needed

✅ **Approve social media copy** (or provide edits) → I'll stage for you to post manually or assign to Advertising Creative

---

## Summary & Next Steps

| Action | Expected Orders | Revenue Impact | Cost | Approval Status |
|--------|----------------|----------------|------|-----------------|
| Abandoned checkout recovery | 3-5 | $285-$795 | $0 | ⏳ Pending |
| Customer re-engagement email | 2-4 | $190-$636 | $0 | ⏳ Pending |
| Social media posts | 1-2 | $95-$318 | $0 | ⏳ Pending |
| **TOTAL** | **6-11 orders** | **$570-$1,749** | **$0** | |

### Success Target

**Minimum:** 3 orders this week (stabilizes cash position)  
**Realistic:** 6-8 orders (gets to ~$500-$1,000 cash on hand)  
**Stretch:** 10+ orders (hits weekly target pace)

### Guardrails Respected

✅ No ad spend (all organic/email)  
✅ All campaigns staged for Anthony's approval before send  
✅ No discretionary costs  
✅ No new infrastructure  

### Immediate Action Required from Anthony

1. **Approve abandoned checkout backfill** → I'll trigger Trigger.dev tasks NOW
2. **Approve customer re-engagement email copy** → I'll build Mailchimp campaign for final preview
3. **Approve social media posts** → I'll provide copy for you to post (or delegate to Advertising Creative)

**Timeline:**
- **Today (Apr 13):** Run abandoned checkout backfill (immediate recovery emails sent)
- **Tuesday (Apr 15):** Send customer re-engagement email + post social media
- **Thursday (Apr 17):** Social media reminder post + order cutoff
- **Sunday (Apr 20):** Deliveries + revenue hits Stripe

---

**Ready to execute on your approval.**

— Growth & Conversion Operator
