# Recovery email — Alisia Walton

**To:** alisia_walton@yahoo.com
**Send from:** anthony@unclemays.com (manual — personal touch matters)
**Subject:** Hey Alisia — was there an issue with your Uncle May's order?

---

Hey Alisia,

I'm Anthony, the founder of Uncle May's Produce. I noticed you tried to place an order with us twice last week — once on Wednesday and again Thursday afternoon — and both times something didn't go through at the payment step. I wanted to reach out personally and figure out what happened.

You were ordering the family box with pinto beans, delivery to the Clyde Ave address in Calumet City. The promo code FRESH10 was applied both times — that part was working. So I'm guessing it was a card issue, a browser issue, or maybe you just got pulled away.

If you still want the box, three ways forward — pick whichever is easiest:

1. **Try checkout again** at [unclemays.com/shop](https://unclemays.com/shop), code **FRESH10** for $10 off. We pushed several fixes to the payment form this week so it should behave better than last time.
2. **Take your order over the phone** in 5 minutes — call/text me at (312) 972-2595.
3. **Grab 10 minutes on my calendar** so I can walk you through it AND hear what happened on your end: [calendly.com/anthony-unclemays/uncle-may-s-quick-interview](https://calendly.com/anthony-unclemays/uncle-may-s-quick-interview)

Honestly, option 3 is the one I'd value most. We're a small team, you'd be one of our first Calumet City customers, and feedback from someone who almost ordered is more useful to us than feedback from someone who already did. I'll make it worth your time.

Thanks for trying — and sorry it didn't work the first time.

Anthony Ivy
Founder, Uncle May's Produce
(312) 972-2595
anthony@unclemays.com

---

## Notes for sending
- Two attempts with same fbclid suggests she came back through the same Meta ad. High intent.
- Address is **554 Clyde Ave, Apt 8, Calumet City 60409** — confirm before re-quoting delivery.
- Both attempts had `requires_payment_method` status — likely declined card OR Stripe Element timeout. If she replies, we can pull the `last_payment_error` from Stripe to see which.
- If she replies, log the conversation in `customer-interviews/alisia-followup.md` — this also counts as interview #4 toward the 7-interview target for dimension 1.
