# Landing Page Recommendations: 20% Off Campaign

**Context:** 97% checkout abandonment rate  
**Root Cause:** Conversion friction (not traffic)  
**Campaign Goal:** Drive completions, not just clicks  
**Critical:** Landing page must reduce friction

---

## RECOMMENDATION: Dedicated Campaign Landing Page

**URL Structure:** `unclemays.com/first-box-20-off` or `unclemays.com/welcome20`

**Why NOT homepage:**
- Message match: Ads promise "20% off first box" — landing page must deliver on that promise immediately
- Reduced cognitive load: Single clear path to purchase vs multiple options
- Conversion tracking: Easier to measure campaign performance
- A/B testing: Can test page variants without affecting main site

**Why NOT existing product page:**
- Same issue: needs to match ad promise and reduce friction
- May require product page restructure (higher risk/complexity)

**Recommended Approach:**
1. **Week 1 (Immediate):** Direct to homepage WITH 20% off banner at top (quick fix)
2. **Week 2+:** Build dedicated landing page (optimal, but requires dev time)

Given the revenue crisis and tomorrow deadline, **direct to homepage with prominent 20% off banner** is the fastest path to launch.

---

## CRITICAL LANDING PAGE ELEMENTS

### 1. Above the Fold (First Screen)
Must include:
- ✅ **Headline matching ad promise:** "Get 20% Off Your First Box"
- ✅ **Subheadline with value prop:** "Fresh produce curated for Black families in Hyde Park"
- ✅ **Hero image:** Produce box (use existing product photos)
- ✅ **Clear CTA button:** "Shop Now - Save 20%" (large, contrasting color)
- ✅ **Trust signal:** "89% would refer a friend" or "Loved by Hyde Park families"
- ✅ **Price transparency:** "$24 for your first box (regularly $30)"

**Critical:** Visitor should understand offer and see CTA without scrolling.

### 2. How It Works (Reduce Friction)
Address the "what happens next?" anxiety:
- ✅ **Step 1:** Choose your box size (Starter, Family, Community)
- ✅ **Step 2:** Add discount code at checkout (auto-applied if possible)
- ✅ **Step 3:** Delivered fresh to your door

**Friction reducers:**
- "No subscription required" (huge for 97% abandonment)
- "One-time purchase or subscribe — you choose"
- "Cancel anytime" (if they do subscribe)
- "Free delivery Hyde Park" (if applicable, check current policy)

### 3. Social Proof (Build Trust)
Must have to convert cold traffic:
- ✅ Customer testimonials (even if just 2-3)
- ✅ "89% would recommend" stat prominently
- ✅ Product photos (real, not stock)
- ✅ "Trusted by Hyde Park families" (local credibility)

**If available, add:**
- Number of boxes delivered ("500+ boxes delivered")
- Star rating (if you have reviews)
- Media mentions or local press

### 4. Product Details (Remove Uncertainty)
Show what they're getting:
- ✅ Sample box contents ("This week: collard greens, sweet potatoes, bell peppers...")
- ✅ Photos of actual produce
- ✅ Sourcing info ("Sourced from Black farmers" if true, or "Locally sourced")
- ✅ Quality standards ("Fresh, premium, no substitutions")

### 5. Pricing Clarity (Critical for 97% Abandonment)
No surprises at checkout:
- ✅ Show all box sizes and regular prices upfront
- ✅ Show 20% off discount clearly ("$30 → $24")
- ✅ Any delivery fees or taxes mentioned BEFORE checkout
- ✅ "See full pricing" link if breakdown needed

**Hypothesis:** Many abandonments may be price surprise or hidden fee discovery.

### 6. FAQ Section (Pre-emptive Objection Handling)
Answer before they ask:
- "How does delivery work?" (days, times, areas)
- "Can I choose what's in my box?" (yes/no)
- "Do I have to subscribe?" (no!)
- "What if I'm not home?" (delivery instructions)
- "What's your refund policy?" (build trust)

### 7. Strong CTA (Repeated)
CTA should appear:
- Above the fold (primary)
- After "How It Works" section
- After social proof section
- Bottom of page (final conversion)

**CTA copy options:**
- "Get 20% Off Your First Box"
- "Shop Now - Save $6"
- "Claim Your Discount"
- "Try Us for $24"

Test these to see which converts best.

---

## URGENT FIXES (If Using Existing Site)

Based on the 97% abandonment crisis, audit and fix:

### Checkout Flow Audit
1. **Mobile experience:** Is checkout mobile-friendly? (Most traffic is mobile)
2. **Form fields:** Minimize required fields (name, email, address, payment — that's it)
3. **Guest checkout:** Don't force account creation
4. **Payment options:** Are all major cards working? Apple Pay? Google Pay?
5. **Error messages:** Clear and helpful (not technical jargon)
6. **Load speed:** Slow checkout = abandoned checkout
7. **Stripe integration:** Confirm webhooks working (CTO task per CRO doc)

### Price Transparency Audit
1. **Delivery fee:** Is it shown before checkout? Surprise fees kill conversion
2. **Tax:** Calculated and shown clearly?
3. **Total price:** Always visible (sticky footer with running total?)
4. **Discount application:** Does 20% off auto-apply or require code entry?
   - Auto-apply is MUCH better for conversion
   - If code entry required, show code clearly on landing page

### Trust Signals Audit
1. **SSL certificate:** Green padlock visible? (basic security signal)
2. **Secure checkout badge:** "Secure Checkout" or "SSL Encrypted"
3. **Payment logos:** Visa/MC/Amex logos visible
4. **Contact info:** Phone number and email visible (builds trust)
5. **Return/refund policy:** Linked and clear

---

## A/B TESTING RECOMMENDATIONS (After Initial Launch)

Once campaign is live, test these elements:

### Test 1: Headline
- A: "Get 20% Off Your First Box"
- B: "Fresh Produce for $24 (Save $6 Today)"
- Hypothesis: Price-specific may convert better than percentage

### Test 2: CTA Copy
- A: "Shop Now"
- B: "Get 20% Off"
- C: "Claim Your Discount"
- Hypothesis: Discount-specific CTA > generic "Shop Now"

### Test 3: Social Proof Placement
- A: Social proof below the fold
- B: Social proof above the fold (near CTA)
- Hypothesis: Early trust signal increases conversion

### Test 4: "No Subscription Required" Prominence
- A: Small text in FAQ
- B: Large badge above the fold
- Hypothesis: Removing this friction point early will reduce abandonment

---

## DISCOUNT CODE SETUP

**Recommended approach:** Auto-applied discount (no code entry required)

**Setup in Stripe:**
1. Create promotion code: `FIRST20` or `WELCOME20`
2. Set to 20% off
3. Limit to first-time customers only
4. Set expiration (campaign duration)
5. **Embed in checkout URL** so it auto-applies

**Checkout URL example:**
`unclemays.com/checkout?promo=FIRST20` (auto-applies discount)

**If manual code entry required:**
- Show code prominently on landing page: "Use code **FIRST20** at checkout"
- Repeat code near each CTA
- Make it copyable (click to copy feature)

**Track usage:**
- Monitor how many times code is applied
- Monitor completion rate WITH code applied
- If code-applied checkouts also abandon, problem is elsewhere (payment, form, etc.)

---

## MOBILE OPTIMIZATION (CRITICAL)

Majority of Meta ad traffic is mobile. Landing page MUST be mobile-optimized:

### Mobile Checklist
- ✅ Responsive design (test on iPhone and Android)
- ✅ Fast load time (<3 seconds)
- ✅ Large, tappable CTA buttons (44x44px minimum)
- ✅ Readable font size (16px minimum, no pinch-to-zoom needed)
- ✅ Minimal form fields on mobile
- ✅ No horizontal scrolling
- ✅ Images optimized (compressed, not slowing page load)

**Test on actual devices**, not just browser dev tools.

---

## ANALYTICS SETUP (Track Everything)

To understand where the 97% abandonment is happening:

### Google Analytics Events
- `view_landing_page` (from ad click)
- `click_cta` (clicked "Shop Now")
- `view_checkout` (reached checkout page)
- `add_payment_info` (entered payment)
- `purchase` (completed)

**Funnel view:**
1. Landing page views (100%)
2. CTA clicks (X%)
3. Checkout starts (Y%)
4. Checkout completes (Z%)

Identify the biggest drop-off point and fix that first.

### UTM Parameters (For Ad Tracking)
Every ad should include UTM tags in the URL:

`unclemays.com/?utm_source=meta&utm_medium=paid&utm_campaign=first_box_20_off&utm_content=variant_1`

This lets you see which ad variant drove the most conversions (not just clicks).

---

## SUMMARY: Landing Page Strategy

### Immediate (This Week)
1. **Add prominent 20% off banner** to homepage (if using homepage)
2. **Auto-apply discount code** in checkout URL
3. **Audit checkout flow** for mobile UX issues (CTO task from CRO doc)
4. **Add trust signals** (89% stat, "no subscription required")
5. **Show pricing clearly** (remove surprise fees)

### Short-term (Week 2-3)
1. **Build dedicated landing page** with all critical elements above
2. **A/B test** headline, CTA, social proof placement
3. **Add FAQ section** addressing common objections
4. **Optimize mobile experience** (test on real devices)

### Ongoing
1. **Monitor funnel drop-offs** in GA4
2. **Test new variants** based on performance data
3. **Collect testimonials** from first-time customers
4. **Iterate messaging** based on what converts

---

## WHERE ADS SHOULD POINT

**Week 1 (Immediate):**  
→ `unclemays.com/?utm_source=meta&utm_medium=paid&utm_campaign=first_box_20_off&promo=FIRST20`
- Homepage with banner + auto-applied discount
- Fastest to launch (no dev work)
- Can measure performance immediately

**Week 2+ (Optimal):**  
→ `unclemays.com/first-box-20-off?utm_source=meta&utm_medium=paid&utm_campaign=first_box_20_off`
- Dedicated landing page
- Better message match
- Higher conversion expected

---

## FINAL NOTE: Address the 97% Abandonment Root Cause

Creative and landing page optimization will help, but **if the checkout flow is broken** (payment errors, mobile UX issues, hidden fees), even perfect ads won't convert.

**Priority:**
1. **CTO:** Audit and fix checkout technical issues (per CRO URGENT doc)
2. **Advertising Creative (me):** Optimize ad creative and landing page UX
3. **RevOps:** Abandoned cart recovery emails (existing traffic)

All three must work together to fix the conversion crisis.

**Recommendation:** Launch ads AFTER CTO confirms checkout audit is complete and any critical issues are fixed. Driving more traffic to a broken checkout wastes budget.
