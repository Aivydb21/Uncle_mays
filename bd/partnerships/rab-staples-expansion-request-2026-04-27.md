# Letter to Run A Way Buckers Club — Staple Items Inquiry

**Date:** 2026-04-27
**From:** Anthony Ivy, CEO, Uncle May's Produce LLC
**To:** Run A Way Buckers Club, Pembroke, IL
**Subject:** Customer demand for additional staples, asking what you can supply

---

## Suggested email/letter to send

> **Subject:** Customer demand for staples, can we add to our box?
>
> Hi [name],
>
> I hope you're doing well. Quick update from our side, then a question.
>
> The Uncle May's customer base has been growing and we've been getting consistent feedback from our Chicago households about a small set of grocery staples they wish were in the box. We want to keep doing right by you as our supplier, so before we look anywhere else, I wanted to ask first whether any of these are things RAB grows or could grow on a regular schedule.
>
> Here's the customer wishlist, in rough order of how often we hear it:
>
> 1. **Lettuce** (head lettuce or leaf, separate from your current salad mix)
> 2. **Potatoes** (any variety, our customers cook a lot)
> 3. **Onions** (yellow, red, or sweet)
> 4. **Tomatoes** (slicers and cherry are both asked for)
> 5. **Cucumbers** (slicers)
> 6. **Spinach** (bunched or loose)
> 7. **Cilantro** (bunches)
> 8. **Brussels sprouts** (loose or on the stalk)
> 9. **Any grains you have available** (rice, wheat berries, oats, corn meal, anything you mill or store)
>
> A few questions for each:
>
> - Do you currently grow it?
> - If yes, what months of the year is it available?
> - What's the wholesale price per pound or per unit, and what's the minimum quantity you'd want us to commit to per week?
> - If no, is it something you'd be open to growing if we could commit to weekly volume?
>
> Even partial answers are useful. If only some of these are realistic for you, that tells us where we can lean on RAB and where we'd need to look elsewhere — and we'd much rather lean on you for everything you can do.
>
> If easier, I can call you this week and walk through the list together. Whatever works on your end.
>
> Thanks for everything you've supplied us so far. Our customers love that the produce is coming straight from your farm and we want to grow that story together.
>
> Anthony Ivy
> Uncle May's Produce LLC
> (312) 972-2595
> anthony@unclemays.com

---

## Optional attachment — table to make it easy for RAB to respond

If RAB prefers a fill-in-the-blank table over open-ended questions, paste this into the bottom of the email or attach as a separate document:

| Item | Do you grow it? | Months available | Wholesale price | Min weekly volume | Notes |
|---|---|---|---|---|---|
| Lettuce (head or leaf) | | | | | |
| Potatoes | | | | | |
| Onions | | | | | |
| Tomatoes | | | | | |
| Cucumbers | | | | | |
| Spinach | | | | | |
| Cilantro | | | | | |
| Brussels sprouts | | | | | |
| Grains (any) | | | | | |

---

## Internal notes (do not send to RAB)

### Why this matters

These items are all on our customer-facts.md "do not claim" list right now (tomatoes, cucumbers, spinach, brussels sprouts) or are not yet part of any box. Customer feedback from session replays and direct emails consistently highlights "this looks like a partial grocery box, not a full one." Adding staples turns Uncle May's from a salad-greens-and-roots curated box into a credible weekly grocery substitute.

### Seasonality reality (set expectations before reading RAB's response)

| Item | When IL farmers typically have it |
|---|---|
| Lettuce | Spring + fall (heat sensitive); under cover in winter |
| Potatoes | Harvested fall, storage carries through winter and spring |
| Onions | Harvested late summer, storage through winter |
| Tomatoes | Outdoor: July-Oct. Hoophouse: May-Nov |
| Cucumbers | Outdoor: June-Sept. Hoophouse: extends a few weeks |
| Spinach | Cool weather: spring, fall, winter under cover |
| Cilantro | Cool weather: spring + fall (bolts in summer heat) |
| Brussels sprouts | Fall + early winter (improves after frost) |
| Grains | Depends on what RAB stores or mills |

So even if RAB says yes to everything, only potatoes, onions, and grains are likely year-round-available without greenhouse infrastructure. Plan box copy around "what's in season" rather than promising specific items.

### Decision tree based on RAB's response

| RAB response | What to do |
|---|---|
| Yes to most items, year-round | Update customer-facts.md to remove these from the "do not claim" list, refresh box copy, update marketing |
| Yes seasonally but not year-round | Plan a rotating box calendar by month and update product page to communicate "what's in season this week" |
| Yes to a few, no to most | Decide whether to onboard a second supplier for the gaps (per existing customer-facts.md note: "Adding those back requires onboarding a second supplier first") |
| No to most | Have an honest conversation about whether RAB-only sourcing is viable as Uncle May's grows, OR whether we need a complementary supplier |

### After response, things to update in the codebase

- [`customer-facts.md`](../../customer-facts.md) sourcing section + retired-claims section
- [`src/lib/products.ts`](../../src/lib/products.ts) Small Box and Family Box `items` arrays
- Any FAQ copy that references "what's in the box"
- Ad creative copy if it lists specific items
