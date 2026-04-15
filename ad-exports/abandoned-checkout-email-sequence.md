# Abandoned Checkout Email Sequence - Phase 1

**Target:** 36 abandoned checkouts in last 30 days  
**Goal:** 10-15% recovery rate (3-5 orders/month)  
**Deployment:** RevOps via Mailchimp  

---

## Email 1: Cart Reminder (Send 1 hour after abandonment)

### Subject Line Variants (A/B Test)
1. **Your Uncle May's box is waiting** *(direct, personal)*
2. **You left something good behind** *(curiosity + warmth)*
3. **Still want fresh produce this week?** *(benefit-led, conversational)*

### Preview Text
"Complete your order in 2 minutes. Fresh, curated produce for your table."

### Email Body (HTML-ready)

**Subject:** Your Uncle May's box is waiting

Hi there,

You started an order for premium produce from Uncle May's but didn't finish. Your items are still in your cart, ready to go. We curate every box with care for Black families who want quality they can count on.

Complete your order now and get Sunday delivery. Questions? Call us anytime at (312) 972-2595.

**[Complete Your Order →]**

---

## Email 2: Urgency Reminder (Send 24 hours after abandonment)

### Subject Line Variants (A/B Test)
1. **Order by Thursday for Sunday delivery** *(deadline-driven, clear)*
2. **Your cart expires soon** *(scarcity + urgency)*
3. **Don't miss this week's delivery** *(FOMO, community-focused)*

### Preview Text
"89% of our customers refer friends. Your box is almost ready."

### Email Body (HTML-ready)

**Subject:** Order by Thursday for Sunday delivery

We saved your cart, but time is running out. To get your fresh produce delivered this Sunday, you need to complete your order by Thursday.

Uncle May's isn't your average grocery box. We curate premium produce for Black communities that deserve the best. 89% of our customers refer friends and family because they trust what we deliver.

**[Order Now for This Week's Delivery →]**

Questions? We're here: (312) 972-2595

---

## Email 3: Final Urgency (Send 48 hours after abandonment)

### Subject Line Variants (A/B Test)
1. **Last chance: Limited boxes left this week** *(scarcity + deadline)*
2. **Your cart is about to expire** *(urgency, direct)*
3. **This is your final reminder** *(clear, no-nonsense)*

### Preview Text
"We only have a few boxes left for Sunday delivery. Order now or miss out."

### Email Body (HTML-ready)

**Subject:** Last chance: Limited boxes left this week

This is your final reminder. We have limited boxes available for Sunday delivery, and your cart is still sitting there. Once they're gone, you'll have to wait until next week.

Our customers love Uncle May's because we bring quality produce to neighborhoods that have been overlooked for too long. Don't miss your chance to join them this week.

**[Complete My Order Now →]**

Need help? Call (312) 972-2595 before it's too late.

---

## Technical Notes for RevOps

**Mailchimp Deployment:**
- Set up as 3-step automation triggered by Stripe checkout.session.expired webhook
- Email 1: 1-hour delay from abandonment
- Email 2: 24-hour delay from abandonment  
- Email 3: 48-hour delay from abandonment
- Stop sequence if customer completes purchase at any point
- Personalize CTA links with direct checkout recovery URLs (merge tag: `*|CHECKOUT_URL|*`)

**A/B Test Plan:**
- Test all 3 subject line variants for Email 1 (33/33/33 split)
- Winner from Email 1 informs Email 2 approach (urgency vs. benefit vs. curiosity)
- Email 3 sticks with proven scarcity angle

**Tone Calibration:**
- These emails are warmer and more conversational than typical e-commerce cart recovery
- Community-focused language ("neighborhoods that have been overlooked") reinforces brand positioning
- Phone number inclusion signals real human support, not automated spam

**Expected Performance:**
- Industry baseline: 8-12% cart recovery  
- Target: 10-15% (3-5 orders from 36 abandoned carts)
- Monitor open rates, CTR, and actual conversions by email in sequence
