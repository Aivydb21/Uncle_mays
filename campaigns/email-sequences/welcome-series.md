# Welcome Series — New Signup Sequence

> **Who gets this:** Anyone who enters their email on the homepage capture form (no purchase yet).
> **Goal:** Convert a warm lead into a first-box buyer within 7 days.
> **Trigger:** Tag `new_signup` added to Mailchimp contact.
> **Source of truth:** [`customer-facts.md`](../../customer-facts.md). Do not hardcode prices or cutoff here without updating that doc first.

**Brand rules (from `customer-facts.md`):**
- Delivery: Wednesday, every week
- Cutoff: Sunday 11:59 PM CT
- Pricing: $35 / $65 / $95 (one-time), 10% off on Subscribe & Save
- No promo codes. No discounts beyond Subscribe & Save.
- From: `Uncle May's Produce <info@unclemays.com>`
- Footer: `Uncle May's Produce · Hyde Park, Chicago, IL`
- Brand green: `#2d7a2d`

---

## Email 1 — Welcome (send immediately on signup)

**Subject:** Welcome to Uncle May's. Here's what's waiting.
**Preview:** Black-farmed seasonal produce, delivered to your Chicago door every Wednesday.

**Body:**

> Hi *|FNAME|default:friend*,
>
> Welcome to Uncle May's Produce.
>
> We deliver Black-farmed seasonal produce to Chicago doors every Wednesday — the kind of produce that actually tastes like something. No chemical washes. No gas-ripened tomatoes. No "fresh for 14 days" sticker on a pepper.
>
> Here's how it works:
>
> **1. You pick a box.** Starter ($35), Family ($65), or Community ($95). Each one is curated for a specific household size.
>
> **2. You order by Sunday 11:59 PM.** We pack Monday–Tuesday.
>
> **3. We deliver Wednesday.** Right to your Chicago door. Free delivery.
>
> Try one box. See how it compares to whatever you've been buying.
>
> **[Order your first box →]**
>
> — Anthony
> Founder, Uncle May's Produce
> (312) 972-2595

**CTA destination:** `https://unclemays.com/shop?utm_source=mailchimp&utm_medium=email&utm_campaign=welcome&utm_content=welcome_1`

---

## Email 2 — Proof (send 2 days after signup, skip if customer has ordered)

**Subject:** Where your produce actually comes from
**Preview:** The farms. The farmers. The reason this tastes different.

**Body:**

> Hi *|FNAME|default:friend*,
>
> Most grocery produce gets picked green, shipped 1,500 miles, gassed to ripen, and sits on a shelf under fluorescent lights for two weeks before you take it home.
>
> That's why it tastes like water.
>
> Our boxes come directly from Black-owned farms across the Midwest. Picked this week. Packed Monday or Tuesday. At your door Wednesday.
>
> Two days. Not two weeks.
>
> The farmers we source from have been doing this for generations. They know what ripe actually tastes like — and when you taste a tomato that was on a vine 48 hours ago, you'll know the difference too.
>
> **[See this week's boxes →]**
>
> Questions? Reply to this email or call (312) 972-2595.
>
> — Anthony

**CTA destination:** `https://unclemays.com/shop?utm_source=mailchimp&utm_medium=email&utm_campaign=welcome&utm_content=welcome_2`

---

## Email 3 — Nudge (send 5 days after signup, skip if customer has ordered)

**Subject:** Your first Wednesday is waiting
**Preview:** Order by Sunday 11:59 PM CT for this week's delivery.

**Body:**

> Hi *|FNAME|default:friend*,
>
> Quick one.
>
> We deliver to your Chicago door every Wednesday. This week's boxes are still open for orders, and the cutoff is **Sunday at 11:59 PM CT**.
>
> Three sizes:
>
> - **Starter Box — $35** · ~8 servings, for 1–2 people
> - **Family Box — $65** · produce + dozen farm eggs + pasture-raised whole chicken, for a family of 4
> - **Community Box — $95** · specialty and heirloom produce + eggs + your choice of protein, great for sharing
>
> No subscription required. One box at a time. 100% freshness guarantee — if anything is off, we make it right, no questions asked.
>
> **[Order this week's box →]**
>
> — Anthony
> (312) 972-2595

**CTA destination:** `https://unclemays.com/shop?utm_source=mailchimp&utm_medium=email&utm_campaign=welcome&utm_content=welcome_3`

---

## Setup instructions for the Mailchimp UI

1. Go to **Automations → Create → Customer Journey** in Mailchimp.
2. Starting point: **Tag added** → tag is `new_signup`.
3. Add three email steps:
   - Email 1: send immediately (delay 0)
   - Email 2: send after 2 days (skip if customer has `purchased` tag)
   - Email 3: send after 5 days (skip if customer has `purchased` tag)
4. Copy the subject, preview, and body from each section above into the email editor.
5. Test once with your own email address.
6. Turn on the journey.

**Important:** The `new_signup` tag is added by the homepage email-capture form automatically. The `purchased` tag is added by the Stripe webhook when an order completes. Both are already wired up as of this commit.
