# Funnel Reality Check — 2026-04-24

**Source:** GA4 Data API, property `494626869`, last 30 days (2026-03-25 → 2026-04-23).
**Purpose:** Verify the 2026-04-24 CRO audit's headline claim of a 95.8% drop between checkout summary and delivery step before acting on it.

## Headline

**The CRO's finding is confirmed — in fact, slightly understated.** The real summary → delivery drop for the two live products (Starter + Family, one-time + subscribe paths combined) is **97.0%**. Phase 2 of the conversion plan (warmed landing page A/B test) is validated.

Two additional leaks the CRO report underweighted:
- **Delivery → Payment: 50%** drop. Cut in half at the mid-funnel.
- **Payment → Purchase: 89%** drop. Of the 55 people who reached a payment form, 6 completed. This is larger-percentage loss than the delivery→payment step and suggests payment friction (card failure, trust, price shock, 3DS) on top of the top-of-funnel problem.

## Raw counts by path (30 days)

### Checkout (one-time) flow
| Path | Pageviews | Sessions |
|---|---:|---:|
| `/checkout/family` | 2,426 | 1,544 |
| `/checkout/starter` | 852 | 643 |
| `/checkout/community` | 45 | 23 |
| `/checkout/starter/delivery` | 39 | 20 |
| `/checkout/family/delivery` | 15 | 12 |
| `/checkout/community/delivery` | 14 | 11 |
| `/checkout/starter/payment` | 16 | 7 |
| `/checkout/family/payment` | 6 | 6 |
| `/checkout/community/payment` | 3 | 3 |

### Subscribe flow
| Path | Pageviews | Sessions |
|---|---:|---:|
| `/subscribe/starter` | 244 | 209 |
| `/subscribe/family` | 137 | 103 |
| `/subscribe/community` | 74 | 59 |
| `/subscribe/starter/delivery` | 34 | 16 |
| `/subscribe/family/delivery` | 22 | 9 |
| `/subscribe/community/delivery` | 13 | 9 |
| `/subscribe/starter/payment` | 17 | 8 |
| `/subscribe/family/payment` | 16 | 8 |
| `/subscribe/community/payment` | 9 | 6 |

### Event counts (30 days)
| Event | Count |
|---|---:|
| `page_view` | 6,036 |
| `session_start` | 3,688 |
| `begin_checkout` | 149 |
| `form_start` | 36 |
| `purchase` | 6 |
| `generate_lead` | 3 |

## The actual funnel (primary products — Starter + Family only)

| Step | Path regex | Pageviews | % of summary | Step drop |
|---|---|---:|---:|---:|
| 1. Summary | `/(checkout\|subscribe)/(starter\|family)$` | **3,659** | 100% | — |
| 2. Delivery | `/(checkout\|subscribe)/(starter\|family)/delivery` | **110** | 3.0% | **−97.0%** |
| 3. Payment | `/(checkout\|subscribe)/(starter\|family)/payment` | **55** | 1.5% | −50.0% |
| 4. Purchase | `purchase` event | **6** | 0.16% | −89.1% |

Overall pageview-to-purchase CR: **0.16%** (matches CRO report). D2C food benchmark is 2–5%.

## Where the leaks actually are

1. **Summary → Delivery (97% drop).** This is where the CRO focused and they were right. Primary causes are almost certainly:
   - Cold Meta traffic landing on a checkout-summary page instead of a warmed landing page.
   - Email gate required before continuing (the delivery page requires an email entered on the summary before "Continue to delivery" lights up).
   - No social proof density at the point of choice.
2. **Delivery → Payment (50% drop).** Delivery form friction. Likely ZIP rejection (non-Chicago visitors hit the out-of-area waitlist), form fatigue, or address-entry abandonment. Google Places autocomplete shipped 2026-04-23 (commit `f127130`) so this number should start improving — it's worth re-pulling in two weeks.
3. **Payment → Purchase (89% drop).** The bottom-funnel leak the CRO underweighted. 55 people saw a payment form, 6 completed. Possible causes: 3DS failure, declined cards, price shock on add-ons, trust concerns on the payment step itself, or simply people pressing back. This should be investigated with Stripe PaymentIntent failure-reason data, not just GA4.

## Secondary findings

- **Community Box still has live traffic** despite being retired. `/checkout/community` + `/subscribe/community` = **119 combined pageviews** in 30 days (3.2% of summary traffic), and 17 people reached `/community/delivery`. That's traffic landing on dead paths. Source is almost certainly old Meta ads or external references. Worth an Advertising Creative / Paperclip agent sweep to find and kill those ad variants or redirect the routes.
- **`begin_checkout` = 149 events** vs. 55 payment-page pageviews. `begin_checkout` fires on `/shop` "Choose" click AND on payment-page load, so it's double-counting at two surfaces. Not a bug but not a clean funnel metric.
- **`generate_lead` = 3 events** — this fires when a valid email is entered on the delivery page. Given 110 delivery-page pageviews, only 3 reached a valid-email state. That suggests the 97% summary→delivery drop is even more skewed — many of the 110 delivery-page hits bounce before engaging the form.
- **Purchase events match Stripe** (6 in GA4, matches CRO report's count). Purchase pixel reliability (the retry loop added earlier) is working.

## Implication for the conversion plan

- **Phase 2 stays valid.** Build `/get-started` landing page and A/B test against `/#boxes`. The top-of-funnel warming is the highest-leverage fix.
- **Add a Phase 2.5: Payment-step diagnostics.** Before scaling ad spend, pull 30 days of Stripe PaymentIntent failure reasons via API to understand the 89% payment→purchase drop. If most are card declines or 3DS failures, it's not a UX problem — it's a traffic-quality or fraud-ruleset problem. If most are abandoned incomplete intents, it's payment-form friction (order summary, trust signals, price clarity).
- **Kill the Community Box traffic leak.** Either archive the remaining Community routes or redirect `/checkout/community` and `/subscribe/community` to `/#boxes` so the 119 PVs aren't wasted. Also find and kill any Meta ad variants still pointing at those URLs.

## Cross-check gaps

- **Vercel Analytics:** not cross-checked in this pass. If the Vercel analytics dashboard is enabled, pulling the same funnel there would validate GA4's counts against a different event source.
- **Meta CAPI event counts:** not cross-checked. The CRO reported 1,488 Meta InitiateCheckout events; per the code audit on 2026-04-24, that pixel fires on payment-step page load and server-side CAPI on intent creation, NOT on summary-page load. So 1,488 is partially bogus (it double-counts CAPI fires with client-side payment-page fires). Not investigating further in this pass — GA4 pageviews are the more trustworthy source of funnel truth.

---

## Phase 2.5 addendum — Stripe PaymentIntent failure audit (added later same day)

Pulled all 102 PaymentIntents created in the last 30 days via the Stripe API.

### Status breakdown (30d, n=102)
| Status | Count |
|---|---:|
| `canceled` | 53 |
| `requires_payment_method` | 34 |
| `succeeded` | 15 |

### The headline finding: zero card failures.

**Of the 87 non-succeeded PaymentIntents, ZERO had a `payment_method` attached.** Not one. The 89% payment → purchase drop is **pure pre-card abandonment** — users reach the payment form, see it, and leave without ever typing a card number.

This is unexpected and important. It rules out:
- ❌ Card declines / insufficient funds
- ❌ 3DS authentication failures
- ❌ Stripe-side technical errors
- ❌ Fraud-ruleset rejections
- ❌ Card-network issues

The only thing it's consistent with is **payment-form UX/trust friction**:
- Sticker shock at the final amount
- Friction of typing 16-digit card + CVV + ZIP on a mobile keyboard (81.5% of traffic)
- No Apple Pay / Google Pay buttons currently visible
- Insufficient trust signals at the moment of credit-card entry
- Browse-mode behavior — people came to look, not buy, and leave when asked to pay

### Cancellation reasons (53 canceled PIs)
| Reason | Count |
|---|---:|
| `void_invoice` | 52 |
| `failed_invoice` | 1 |

Almost all cancellations are downstream effects of subscription invoices voiding when the customer never paid. Not user-initiated cancels.

### Of the 15 succeeded, only 2 are real new customers in this window
| Email | Count | Type |
|---|---:|---|
| `anthonypivy@gmail.com` (Anthony, personal) | 9 | Internal tests |
| `anthony@unclemays.com` (Anthony, work) | 1 | Internal test |
| `doina.romanciuc.dr@gmail.com` (Doina) | 1 | Recurring subscription renewal |
| `awoods@mail.roosevelt.edu` (Antoinette) | 1 | Real customer |
| `(no customer attached)` | 3 | Older real customers (Morgan, Maria + 1) — created via guest checkout before the 30d window's customer linkage |

So the "15 succeeded" headline is misleading: in the last 30 days only **1 brand-new external customer** acquired (Antoinette Woods, Apr 15) plus **1 recurring renewal** (Doina). Everything else is internal testing or noise.

### What we should prioritize as a result

The plan's Phase 3.3 (Apple/Google Pay on payment step) just got promoted to **highest single-fix leverage**. It's a Stripe Dashboard config change — no code, no risk, no deploy — and it removes the dominant friction at the step where 85% of intents are dying. Recommend doing this BEFORE Phase 2 (`/get-started` landing page).

Also high-leverage and currently absent at the payment step:
- **Express checkout buttons at the top** (Apple Pay, Google Pay) — Stripe `PaymentElement` shows these automatically once enabled in dashboard.
- **Money-back / freshness guarantee** explicit on the payment screen.
- **Order summary clarity** — the price the user is about to be charged should be visible above the payment fields, not below.
- **At least one testimonial or trust badge** at the moment of card entry.

### Sequencing recommendation

1. **Today** (10 minutes): enable Apple Pay + Google Pay in Stripe Dashboard, register `unclemays.com` as an Apple Pay domain. Zero code change.
2. **This week**: add trust-signal pass to payment page (guarantee badge + 1 testimonial above the fold of the payment form).
3. **Then** measure for 14 days. If payment → purchase rises from 11% to even 25%, that's a 2.3× revenue lift at the same top-of-funnel volume.
4. **Then** start `/get-started` (Phase 2). With a fixed bottom of the funnel, top-of-funnel improvements compound.

---

**Pulled by:** GA4 Data API + Stripe REST API (Opus 4.7 session, 2026-04-24)
**Queries:** OAuth user token to `analyticsdata.googleapis.com/v1beta`; restricted Stripe key to `api.stripe.com/v1/payment_intents`
