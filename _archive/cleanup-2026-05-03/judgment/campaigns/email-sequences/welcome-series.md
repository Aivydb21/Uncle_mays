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

> *|IF:FNAME|*Hi *|FNAME|*,*|ELSE:|*Hi friend,*|END:IF|*
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

> *|IF:FNAME|*Hi *|FNAME|*,*|ELSE:|*Hi friend,*|END:IF|*
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

> *|IF:FNAME|*Hi *|FNAME|*,*|ELSE:|*Hi friend,*|END:IF|*
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

**The 3 templates are already created in your Mailchimp account.** HTML is styled with Uncle May's green (#2d7a2d), correct footer, merge tags, and UTM-tagged CTAs. Content is pre-filled — you can edit text directly inside the template editor if you want to tweak.

### Template IDs (saved in Mailchimp)

| # | Template ID | Purpose |
|---|---|---|
| 1 | **10000806** | Welcome 1 - Introduction (send immediately) |
| 2 | **10000807** | Welcome 2 - Proof (send day 2, skip if purchased) |
| 3 | **10000808** | Welcome 3 - Nudge (send day 5, skip if purchased) |

You'll also see them in the UI under **Content → Email templates → Saved templates**.

### Wire them into a Customer Journey

1. **Mailchimp → Automations → Create → Customer Journey** (start from scratch).
2. **Starting point:** "Tag is added" → tag name: `new_signup`
3. **Step 1:** "Send email"
   - Select template: **Welcome 1 - Introduction**
   - Subject: `Welcome to Uncle May's. Here's what's waiting.`
   - Preview: `Black-farmed seasonal produce, delivered to your Chicago door every Wednesday.`
   - From: `Uncle May's Produce <info@unclemays.com>`
   - Delay: **immediately**
4. **Step 2:** "Rule" → "If/Else" → check if contact has tag `purchased`
   - If yes → End journey
   - If no → continue
5. **Step 3:** "Wait" → **2 days**
6. **Step 4:** "Send email"
   - Template: **Welcome 2 - Proof**
   - Subject: `Where your produce actually comes from`
   - Preview: `The farms. The farmers. The reason this tastes different.`
7. **Step 5:** Repeat the `purchased` check (same as step 2)
8. **Step 6:** "Wait" → **3 days** (5 days total from signup)
9. **Step 7:** "Send email"
   - Template: **Welcome 3 - Nudge**
   - Subject: `Your first Wednesday is waiting`
   - Preview: `Order by Sunday 11:59 PM CT for this week's delivery.`
10. **Test** by adding the `new_signup` tag manually to your own email in the audience, then verify Step 1 fires.
11. **Turn on the journey.**

### Tags already wired up

- **`new_signup`** — Added automatically by the homepage email capture form (`/api/email-capture`). Every new email entered on unclemays.com gets this tag.
- **`order_completed`** — Added by the Stripe webhook after a successful purchase (see `src/lib/mailchimp.ts::tagOrderCompleted`). **For the journey, use this tag name instead of `purchased`** when setting up the If/Else check in steps 2 and 5 — that's the tag the code actually sets.

### Rotating copy later

To change email content without re-wiring the journey: edit the saved template in Mailchimp (**Content → Email templates → Saved templates**). All future journey sends pick up the new content. No code change needed.
