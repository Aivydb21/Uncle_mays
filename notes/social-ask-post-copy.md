# Social Ask — Post Copy (FB + IG)

Drafts for the FB Page and IG feed posts that drive followers to
`unclemays.com/ask`. Brand voice rules: no em dashes, second-person,
plain English, Hyde Park / South Side grounding, no retired claims
(no eggs, collards, $30 first order, Community Box, etc.).

All links use the same UTM scheme so the weekly digest can split
FB vs IG cleanly:

- FB: `https://unclemays.com/ask?utm_source=facebook&utm_medium=organic&utm_campaign=social_ask_apr2026`
- IG (bio link or Story link sticker — IG feed posts don't carry clickable URLs): `https://unclemays.com/ask?utm_source=instagram&utm_medium=organic&utm_campaign=social_ask_apr2026`

For IG feed posts, put the link in the bio with "👆 link in bio" in
the post body. Or use a Story with a link sticker pointing to the
same URL, and let the feed post drive people to the Story.

---

## Variant A — Direct ask (recommended for first post)

**FB caption:**

We want to know what you'd actually buy.

Two questions, takes 30 seconds. We'll send you 30% off your first box as a thank you.

What would you want in your produce box? What would make you actually pull the trigger?

Tell us here: https://unclemays.com/ask?utm_source=facebook&utm_medium=organic&utm_campaign=social_ask_apr2026

We restock every week based on what people ask for. The more specific you are, the better we can build the box you'd actually buy.

**IG caption (link in bio):**

What would you actually buy?

Two questions, 30 seconds. 30% off your first box for telling us.

We restock every Wednesday based on what people ask for. So tell us: what do you want in your produce box, and what would make you pull the trigger?

👆 Link in bio (/ask)

#chicagofood #southsidechicago #blackownedchicago #hydeparkchicago #produce #farmtotable

---

## Variant B — Founder voice / personal

**FB caption:**

Hey, Anthony here, founder of Uncle May's.

I want to ship the box you'd actually buy. Right now we have salad mix, kale, candy carrots, sweet potatoes, broccoli, organic black beans, and pasture-raised chicken thighs from Run A Way Buckers Club in Pembroke, IL.

But I know I'm missing things. Tell me what you'd want, and tell me what's stopping you from ordering. Two questions, 30 seconds.

I'll send you 30% off your first box for the time.

https://unclemays.com/ask?utm_source=facebook&utm_medium=organic&utm_campaign=social_ask_apr2026

**IG caption (link in bio):**

Anthony here, founder.

I want to ship the box you'd actually buy. So tell me: what would you want in it, and what's stopping you from ordering?

Two questions, 30 seconds. 30% off your first box as a thank you.

👆 Link in bio (/ask)

#chicagoblackowned #southsidechicago #hydeparkchicago #localproduce

---

## Variant C — Tight / punchy

**FB caption:**

Two questions. 30 seconds. 30% off your first box for answering.

1. What would you want in your produce box?
2. What would make you buy?

https://unclemays.com/ask?utm_source=facebook&utm_medium=organic&utm_campaign=social_ask_apr2026

We're a Black-owned produce delivery sourced from Run A Way Buckers Club (Pembroke, IL). Wednesday delivery across the Chicago metro south.

**IG caption (link in bio):**

Two questions. 30 seconds. 30% off for answering.

1. What would you want in your produce box?
2. What would make you buy?

Black-owned produce delivery, sourced from Run A Way Buckers Club (Pembroke, IL). Every Wednesday across the Chicago metro south.

👆 Link in bio (/ask)

---

## Image suggestion

A clean photo of the actual Spring Box or Full Harvest Box contents
on a kitchen counter works best for both platforms. Or a photo of
salad mix + carrots + sweet potatoes laid out flat. Avoid stock
photos. The "what's in the box" reality is part of the ask — show
people what we currently carry so the answers come back more useful.

## Posting checklist

- [ ] Pick one variant (don't post all three).
- [ ] Image attached.
- [ ] Bio link updated to `unclemays.com/ask` for the IG variant
      (and back to homepage when this campaign ends).
- [ ] Pin the FB post to the top of the Page for the duration of
      the campaign (1 week minimum).
- [ ] After 24h: pull `data/feedback/feedback.jsonl` (run
      `python investor-outreach/scripts/ingest-gmail-feedback.py`)
      to check volume + early themes.
- [ ] After 7 days: re-post a fresh variant to catch followers who
      missed the first one. Bump UTM to `social_ask_apr2026_v2`.
