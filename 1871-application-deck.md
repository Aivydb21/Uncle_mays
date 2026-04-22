# Uncle May's Produce

### The first data and distribution platform for Black food consumption.

**Anthony Ivy — Founder & CEO**
1871 Launch Stage Application · April 2026

---

# Elevator Pitch

**For** Black women and families in Chicago (ages 25–45, college-educated, household income $75K+)

**With** the pain of grocery produce that's picked green, ships 1,500 miles, and tastes like nothing — while Black-owned farms with better product have no retail shelf

**Who aren't satisfied with** Whole Foods (expensive, culturally detached), Aldi (low quality), or Imperfect Foods / Misfits (generic)

---

# Elevator Pitch (continued)

**Our value prop helps them** get a curated weekly box of seasonal produce sourced directly from Black farms, delivered to their door

**When** they're planning the week's groceries and want better food without a trip to three stores

**By** offering three transparent box sizes ($35 / $65 / $95), Wednesday delivery Chicago-wide, 10% off Subscribe & Save, and a 100% freshness guarantee

---

# Target Customer

### Primary Persona
- Black women, **25–35**, in Chicago
- South Side, Hyde Park, Bronzeville, Kenwood, South Shore
- Household income **$75K+**, college-educated
- Already shopping at Whole Foods or Mariano's
- Pays a premium for quality + cultural alignment

### Secondary Persona
- Black families with kids — Family Box size, weekly cadence

---

# Persona Validation

- **100+ consumers surveyed** pre-launch
- **97% intent-to-shop**
- **89.6% would refer friends & family**
- Qualitative interviews confirmed the pain: wilting produce, no flavor, no cultural alignment at major grocers
- Early real customers in the exact target neighborhoods — **[YOU FILL IN: count + neighborhoods]**

> We validated demand. We haven't yet validated scalable paid acquisition — that's what Launch stage is for.

---

# The Problem

Fresh grocery produce is:
- Picked green and shipped 1,500+ miles
- Gassed to ripen, then shelf-aged under fluorescent lights
- Two weeks old by the time you buy it

Black-owned farms have:
- Better product and deep generational knowledge
- Almost no retail market access

**The result:** An audience that wants quality + cultural alignment has no option that delivers both.

---

# Jobs to Be Done

**Functional**
Feed my household fresh, high-quality produce without making three grocery trips

**Emotional**
Eat food I trust and feel good about where my dollars go

**Social**
Support Black farmers. Introduce my kids to real, seasonal food.

---

# Customer Journey

1. **Trigger** — Produce wilts in 3 days, tomatoes taste like cardboard
2. **Search** — Whole Foods is expensive, Imperfect has no Black farms, farmer's market is inconvenient
3. **Discover** — Sees Uncle May's ad or referral
4. **Evaluate** — Reads box contents, prices, farmer story
5. **First purchase** — Starter ($35) or Family ($65)
6. **Wednesday delivery** — Receives, tastes, judges
7. **Return or churn** — Subscribes or orders again in 1–3 weeks

---

# MVP Features Being Tested

| Feature | What it tests |
|---|---|
| Three-tier box sizing | Price-size anchoring & self-selection |
| Subscribe & Save 10% | Subscription lever vs. one-time |
| No-subscription-required | Commitment friction removal |
| Wednesday delivery + Sunday cutoff | Weekly cadence acceptance |
| Black-farm sourcing | Cultural alignment as the wedge |
| 100% freshness guarantee | Risk-reversal → conversion |
| Embedded Stripe checkout | Funnel completion UX |

---

# Customer Acquisition To Date

### Channels in use
- **Meta Ads** (Facebook + Instagram) — primary paid
- **Google Ads** (Performance Max + Search) — category-intent
- **Organic social** — Instagram founder content from farms
- **Direct referral & community outreach** — highest conversion, doesn't scale
- **Stakeholder email** — founder network

### What we learned
Direct converts. Paid under-converts until the site and ads align — cohesion is the bottleneck, not creative.

---

# Key Metrics for MVP

1. **Conversion rate** — paid traffic → purchase
*Our product-market fit signal.*

2. **CAC vs. first-order revenue**
*Target: CAC < $15 on a $35–$65 first order.*

3. **Subscription conversion + 4-week retention**
*The LTV lever. Without this, unit economics break.*

---

# Current State

- Small but real early customer base — **[YOU FILL IN]**
- Paid CAC not yet stable (ran during pre-reset drift)
- Just completed full cohesion reset — baselining cleanly starts this week

> Graphs to attach before submission:
> • GA4: 30-day sessions + conversion rate
> • Stripe: 30-day orders + active subs
> • Meta: 14-day cost-per-purchase + CTR

---

# Analytics Stack

- **Google Analytics 4** — conversion events across checkout
- **Meta Pixel + Conversions API** — server-side for ITP resilience
- **Google Ads conversion tracking** — bid optimization
- **Stripe** — source of truth for orders & subs
- **Mailchimp** — email performance + welcome automation
- **Daily dashboard** — API-driven founder report across all of the above

---

# Business Model

| Box | One-Time | Subscribe & Save |
|---|---|---|
| Starter | $35 | $31.50/wk |
| Family *(most popular)* | $65 | $58.50/wk |
| Community | $95 | $85.50/wk |

Community add-ons: protein $18–$24

**Gross margin target: 35%**

---

# Path to Profitability

**Break-even math:**
- $65 avg order × 35% margin = **~$22.75 gross profit / order**
- Fixed monthly cost: **[YOU FILL IN]**
- At $10K/month fixed → ~440 orders/month (~100/week) = break-even

**Timeline:** 6–12 months post-clean-relaunch, dependent on:
- CAC stabilizing under $15
- Subscription conversion reaching 15–30%
- Channel mix optimization (Meta + Google + organic)

---

# Test 1 — Checkout UX

**Hypothesis:** Embedded Stripe Elements would reduce checkout abandonment vs. hosted Stripe Checkout.

**Outcome:** Completion climbed from **~3% → ~30%** of starts. ~10x lift.

**What it framed next:** Upstream bottleneck — now the problem is getting qualified traffic to the (now-working) checkout. Led to the ad-to-site-to-checkout cohesion audit.

---

# Test 2 — Multi-Promo Campaign

**Hypothesis:** Three overlapping discount codes (WELCOME20 / LAUNCH20 / FREESHIP) across ads would drive cheap trial acquisition.

**Outcome:** Codes ran across ads, emails, and landing pages — but weren't consistently wired into checkout. Customers saw ad discounts that didn't appear at checkout. Trust broke; CAC ballooned.

**What it framed next:** Retire all discounts. Flat $35/$65/$95, 10% sub only. Rebuild around one source of truth. Re-launch is now.

---

# Test 3 — Subscription Flow

**Hypothesis:** Surfacing subscription at checkout would drive higher LTV.

**Outcome:** Subscription completion rate low. Friction isn't pricing — it's asking for commitment before the customer has tasted the product.

**What it framed next:** Lead with one-time at checkout. Pitch Subscribe & Save **after** first delivery via post-purchase email. Trial-to-subscription, not pre-trial commitment.

---

# Revenue Projection

### Assumptions
- AOV **$65** (Family Box modal)
- **30%** of buyers convert to subscribers (stretch from current baseline)
- Subscriber lifetime **12 weeks** @ $58.50/wk = **$702 LTV**
- **70%** stay one-time; 30% of those buy a 2nd box within 60 days = **$84.50**
- Blended LTV: **$269.85** / customer
- Gross profit per customer @ 35% margin: **$94.45**

---

# Revenue Projection

| Customers | Gross Revenue | Gross Profit (35%) |
|---|---|---|
| **100** | $26,985 | $9,445 |
| **1,000** | $269,850 | $94,450 |
| **10,000** | $2,698,500 | $944,500 |

### Sensitivity
If sub conversion stays <10%, LTV drops to ~$100 → 10K customers = ~$1M revenue / ~$350K gross profit.

**This is why subscription funnel is our #1 operational fix.**

---

# Biggest Takeaways

### 1. Cohesion beats cleverness.
Brand and creative were strong. The conversion gap came from small operational drift — conflicting promo codes, delivery day mismatch, stale pricing. Fixing consistency moved the needle more than any new campaign.

### 2. Crisis-mode iteration creates more crises.
4 days, 3 overlapping promos, 2 checkout overhauls, 6 planning docs with different "truths." More rebuilding than selling. Installed a single source of truth — one place to change, one truth to defend.

---

# Biggest Takeaways (continued)

### 3. Paid doesn't convert cold traffic without proof.
Ads promised quality. The site didn't deliver the proof to back it up. Cold customers need visible farmer photos, real testimonials, and authentic founder video before they'll trust a new grocery brand with $35.

### 4. The offer is right; the funnel isn't yet.
97% survey intent + early repeat customers confirm resonance. What hasn't worked: paid acquisition → first purchase → subscription for cold audiences. That's the Launch stage work.

---

# Why Launch — 1 of 2

### 1. We've validated the demand signal.
97% intent-to-shop in surveys, qualitative interviews, and real early customers matching the persona. The question is no longer "will anyone buy?" — it's "how do we acquire efficiently and retain?"

### 2. We just completed the operational reset.
A full cohesion pass fixed the 40+ places where site, emails, and ads had drifted. Entering Launch with one source of truth and aligned channels.

---

# Why Launch — 2 of 2

### 3. We have the team.
- **Zoe Rowell** — COO (ex-Amazon Retail, $3B P&L)
- **Jua Mitchell** — CFO (ex-BofA M&A, Booth MBA)
- **Tara Weymon** — CMO (ex-Unilever, P&G)
- **Matt Weschler** — GM Flagship (2 prior Chicago grocery exits)

### 4. Capital is lined up.
- SBA 7(a): **$2.0M conditionally approved** (Busey Bank)
- SAFE open: **$400K–$750K** at $5M cap / 20% discount
- Flagship LOI: Hyde Park, pending funding close

### 5. Launch-stage needs, not Build-stage.
Live business, paying customers, active payment rails and ad spend. We need peers scaling with us and mentors in B2C/DTC grocery — not prototyping support.

---

# Ready to Move

Clean source of truth. Aligned channels. Senior team. Capital lined up. A real product with real early customers who come back.

**Launch is where this gets scaled. We're ready.**

---

# Contact

**Anthony Ivy** — Founder & CEO
Uncle May's Produce
anthony@unclemays.com
(312) 972-2595

unclemays.com
