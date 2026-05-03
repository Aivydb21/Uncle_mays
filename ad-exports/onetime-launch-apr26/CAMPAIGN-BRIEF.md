# One-Time Box Launch Campaign — 2026-04-26

**Status:** Brief, awaiting approval to spend
**Author:** Opus 4.7 + Anthony Ivy
**Replaces:** Meta "Subscription Launch Apr 2026" (paused 2026-04-26)

---

## TL;DR

The April Subscription Launch burned **$588 in 7 days for 0 purchases** because it pitched a subscription to cold traffic that empirically fears subscriptions. Yesterday we re-built the funnel to lead with one-time orders. This campaign is the cold-traffic fuel for the new funnel, with **the same creator and creative format that already drove 28–29% CTR**, just retargeted at a one-time message.

We will know in **10–14 days at $50–$75/day** ($500–$1,000 total) whether the funnel changes lifted conversion. If yes, scale. If no, we have a deeper UX/product problem and we go back to qualitative research.

---

## What we learned (the only inputs that matter)

### From Stripe (last 30 days, real customers only)
- **15 distinct subscription attempts. 1 paid (Doina, grandfathered).** 14 abandoned at the Stripe Elements card form.
- **0 of 87 non-succeeded PaymentIntents had a card attached.** Pure pre-card abandonment — not card declines, not 3DS, not fraud rules. The fear vector is the recurring-billing commitment.
- 1 customer (Nicole) wrote back unprompted to confirm: *"I did not want a subscription. I just wanted to make a single purchase."*

### From Meta (last 30 days, ad-level)
| Creative angle | Best ad CTR | CPC | Verdict |
|---|---|---|---|
| **Don creator videos (UGC-style, IG/FB feed + stories)** | **28–29%** | **$0.07** | Exceptional — keep the creator |
| Static product/farmer images (Checkout variants) | 1–3% | $0.43–$2.42 | Kill — burning impressions |
| Retargeting (You Were Close) | 1.80% | $0.07 | Underperforming, needs new creative |

The creator-format ads were getting 14× the CTR of static images at 1/10th the CPC. **The hook works. The funnel killed the conversion, not the creative.**

### From GA4 (last 30 days)
- **0.16% pageview→purchase conversion rate** (D2C food benchmark: 2–5%, so we are ~15× below floor)
- **97% drop summary→delivery, 50% drop delivery→payment, 89% drop payment→purchase**
- 81.5% of traffic is mobile. Speed and mobile UX are not optional.

### From Google Ads (last 30 days)
- **"Produce Box - Search Campaign" is the only paid channel that converted: $110.94 → 1 sale.** Search captures intent.
- Cost-per-conversion: $110.94. CAC will compress as we expand keyword coverage and the new funnel converts a higher % of clicks.

---

## What we already shipped this week (the funnel-side bets)

These changes went live 2026-04-25 and 2026-04-26. The whole point of this campaign is to feed traffic through them so we can measure their lift.

| Date | Change | Expected effect |
|---|---|---|
| 2026-04-25 | Mobile perf: homepage 67→81, /subscribe/family 72→92, /subscribe/family/delivery 53→82 | Cuts mobile bounce in the 50% delivery→payment leak |
| 2026-04-25 | Checkout polish: sticky mobile summary, inline validation, state-locked, FREE delivery line, "Today's charge" breakdown | Cuts payment-step abandonment |
| 2026-04-25 | Subscription removed from homepage Pricing toggle (one-time only by default; `?mode=subscription` deep-link still works) | Removes the fear trigger before it fires |
| 2026-04-25 | Concrete cancellation proof on subscribe payment page | For users who DO arrive via deep-link |
| 2026-04-25 | Delivery window 12–3pm → 5–8pm | Matches when customers can actually receive |
| 2026-04-25 | Webhook alert on `incomplete_expired` subs (real-time email to Anthony) | Surfaces silent abandons within 24h |
| 2026-04-26 | Homepage hero/FAQ/JSON-LD copy: lead with "no subscription, no auto-renewal, no card on file" | Reinforces the message users said they need |

---

## Active A/B test (do NOT disrupt)

There is a live `/get-started` vs `/#boxes` A/B test on Meta traffic, set up 2026-04-25. Setup doc: [`get-started-ab-test-setup.md`](../get-started-ab-test-setup.md).

This campaign respects that test. Both arms get traffic from the same creative pool; the only difference between control and treatment is the landing URL's `utm_content` value. We do not introduce a new experimental variable until that test reads out.

---

## Campaign architecture

Two channels, one message, three audiences.

### Channel 1 — Meta (paid social), $50/day → ramp to $100/day if signal is positive

**Campaign name:** `One-Time Box Launch — Apr 2026`
**Objective:** OUTCOME_SALES (same as Sub Launch)
**Status at creation:** PAUSED until creative is finalized and approved

**Three ad sets:**

1. **Cold — Chicago, 25–55, food-conscious women (lookalike-weighted)**
   - Landing URL split 50/50 between `/` (control) and `/get-started` (treatment), to honor the live A/B test
   - Daily cap: $30/day
2. **Cold — Chicago, 25–55, "shop local" / Black-owned-business interest cluster**
   - Landing URL: `/get-started` (treatment only — this audience is colder, more warming needed)
   - Daily cap: $15/day
3. **Retargeting — past-30d site visitors who reached `/checkout/*` or `/subscribe/*` but didn't purchase**
   - Landing URL: `/checkout/family?promo=FRESH10` (preselects Family box, applies $10 discount)
   - Daily cap: $5/day, soft floor (this is rescue traffic, not scale traffic)

**UTMs (all ads):**
```
utm_source=meta
utm_medium=paid
utm_campaign=onetime-launch-apr26
utm_content=<creative-id>     # e.g. "don-video-onetime-v1", "static-anchor-v1"
utm_term=<audience>           # "cold-lookalike", "cold-shoplocal", "retargeting"
```

**Creative (priority order):**

1. **Re-shoot of Don creator video, one-time framing.**
   - 15s vertical (IG Stories + Reels) and 30s 1:1 (FB/IG feed)
   - Hook (first 2s): *"You don't need a subscription to eat better. One box, one time, that's it."*
   - Body: Don holds up the box, lists 3 items, says *"Black-farmed, delivered to my door in Chicago. No subscription. I order when I want."*
   - End card: *"Order one box. $40. Use FRESH10 for $10 off. unclemays.com"*
   - This is the highest-leverage single asset to produce. The previous Don videos were the only thing on Meta that hit double-digit CTR.

2. **Static carousel — what's in the box.**
   - 5 frames showing actual box contents (kale, sweet potatoes, microgreens, etc.)
   - Single overlay text: *"$40. One box. No subscription."*
   - For the audience that doesn't watch video.

3. **Retargeting variant — cancellation/refund reassurance.**
   - For audience #3 only.
   - 15s vertical: Anthony on camera, *"If you came to our site and bounced, here's what you need to know: there's no subscription, your card isn't kept on file, and if you don't love your first box we refund the whole thing. FRESH10 takes $10 off if you want to try one."*

### Channel 2 — Google Ads (search), keep "Produce Box - Search Campaign" running, expand keywords

**Status:** Already enabled, $110/30d, **don't touch budget yet** — let it baseline against the new funnel for 7 days, then scale.

**Add these keywords** (search campaign, exact match):
- "chicago produce delivery"
- "chicago black owned grocery"
- "chicago organic produce delivery"
- "chicago weekly produce box"
- "chicago farmers box delivery"
- "produce delivery hyde park"
- "produce delivery south side chicago"

**Negative keywords** (must add):
- "subscription" (we don't want to compete on subscription queries — those users are exactly the ones who fear it)
- "free trial"
- "cheap"
- "wholesale"

**Landing URL for all search ads:**
```
https://unclemays.com/?utm_source=google&utm_medium=paid&utm_campaign=produce-box-search&utm_term={keyword}
```

(Search traffic skips `/get-started` because they have explicit intent — they searched for it. Drop them on the homepage with the one-time-default Pricing.)

### Channel 3 — Email recovery (already in motion, no spend)

We have 4 drafts in Anthony's inbox (Brandy, Nicole, Maria, Vazantha) plus Antoinette already in dialogue. These are the highest-conversion-rate "ads" we have right now — directly addressing 5 known intent customers. Send tomorrow morning.

---

## Budget summary

| Channel | Daily | 14-day total | Notes |
|---|---|---|---|
| Meta — Cold, lookalike | $30 | $420 | Bulk of test |
| Meta — Cold, shop-local | $15 | $210 | Treatment only |
| Meta — Retargeting | $5 | $70 | Soft floor |
| Meta TOTAL | **$50** | **$700** | Ramp to $100/day if CR > 0.5% by day 7 |
| Google Search | $5 organic-pace | $70 | Continue, no scale during test |
| **TOTAL TEST SPEND** | **~$55** | **~$770** | Replaces the prior $100/day Meta-only burn |

**Pre-existing Sub Launch spend was $100/day.** This new plan spends roughly **half** of that during the measurement window, then scales if the data supports it. We are not increasing total ad burn during the test.

---

## Measurement plan + timeline

### Day 0 (Mon Apr 27)
- Anthony reviews and approves brief
- Don re-shoots primary video (or repurposes existing footage with new VO if Don is unavailable)
- Static carousel finalized
- Anthony emails Brandy/Nicole/Maria/Vazantha drafts
- New Meta campaign created, **kept PAUSED**, waiting on creative

### Day 1 (Tue Apr 28)
- Creative uploaded
- Meta campaign activated at $50/day cap
- Google Ads keyword expansion live
- Clarity sessions start accumulating against the new funnel
- First abandon-alert for Antoinette's 4 incomplete subs from Apr 25 should fire

### Day 3 (Thu Apr 30) — first read
- ~150 sessions, ~5–10 begin_checkout, ~1–2 purchases expected if funnel is fixed
- If `purchase` events = 0 with 100+ sessions on the new funnel, **stop and investigate** (likely a remaining UX bug or Stripe Elements issue)
- Clarity replays reviewed for new friction points

### Day 7 (Mon May 4) — go/no-go for ramp
- Hard metrics: pageview→purchase rate, payment-step→purchase rate
- **Ramp signal:** if pageview→purchase ≥ 0.5% (3× current), increase Meta to $75/day, expand Google keywords by another 10
- **Hold signal:** if 0.16% < CR < 0.5%, hold spend, iterate creative
- **Stop signal:** if CR ≤ 0.16%, pause Meta, investigate funnel

### Day 14 (Mon May 11) — final read
- ~1,500 sessions, ~50 begin_checkout, ~5–10 purchases expected at restored 0.5% CR
- A/B test (`/get-started` vs `/#boxes`) reads out per its setup doc — winner gets all traffic
- If the **abandon-at-payment** rate dropped below 50% (from ~89%) — the subscription demotion worked
- If we have ≥ 1 retargeting-driven recovery purchase — retargeting funnel works

### What "winning" looks like by Day 14
| Metric | Today (Apr 22 cohort) | Target (May 11 cohort) |
|---|---|---|
| Pageview → purchase | 0.16% | ≥ 0.5% |
| Payment → purchase | 11% | ≥ 25% |
| Real new customers in 14 days | 1 (Antoinette) | ≥ 8 |
| Revenue from new acquisition | $75 | ≥ $400 |

---

## Pre-flight checklist (everything that must be true before activation)

- [ ] **Apple/Google Pay enabled at Stripe payment step.** Marked as shipped in `funnel-reality-2026-04-24.md` Phase 2.5 — needs a real-device verification before we send traffic.
- [ ] **Google Maps Places API key set on Vercel** (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) — verified working as of yesterday's deploy, but worth a smoke test on iPhone Safari.
- [ ] **Microsoft Clarity recording on production** — confirmed live yesterday (`wfyaha32fb`).
- [ ] **Mobile Lighthouse ≥ 80 on all three measured pages** — confirmed yesterday.
- [ ] **Meta Pixel + CAPI deduplication firing on `Purchase`** — verified by the retry loop in `OrderSuccessContent.tsx`.
- [ ] **Don creative re-shoot or VO re-record** — primary asset, blocking everything else.
- [ ] **`?promo=FRESH10` URL works on `/checkout/family`** — verify by clicking the retargeting destination URL before launch.

---

## Risks + how we'll know early

| Risk | Signal | Action |
|---|---|---|
| Don creator unavailable for re-shoot | Day 0 | Use existing Don footage + new VO; rerecord audio only |
| Meta creative review rejects "no subscription" claim | Day 1 | Reframe as "one-time order, no recurring billing" (factual, will pass review) |
| Funnel fixes didn't work — CR still ≤ 0.16% by Day 3 | Daily Stripe check | Pause Meta, escalate to user-research session (3 UserTesting sessions, $200 budget already discussed) |
| Mobile Lighthouse regresses post-deploy | Daily PSI smoke check | Block additional spend until fixed |
| Google Ads "subscription" negative keyword too aggressive | Day 7 keyword report | Drop the negative if search volume cratered |
| Creator angle gets fatigued at higher spend | Day 7 CTR/CPC trend | Rotate to static carousel as primary creative |

---

## Out of scope for this campaign (deliberate)

- **New brand creative.** We're using the existing Don format because it works. New brand work is a separate project on a longer timeline.
- **Subscription marketing.** Not surfaced to cold traffic at all. Subscription becomes a post-purchase upsell email (next-PR scope per yesterday's discussion), not a paid-acquisition vector.
- **Influencer partnerships beyond Don.** One creator at a time until we have a baseline.
- **TikTok / YouTube / Reddit.** Meta + Google is enough to validate the new funnel. Add channels after we have a working unit economics baseline.
- **National expansion.** Munster IN waitlist exists; not a paid-acquisition target until we have a Northwest Indiana route.

---

## Decision needed from Anthony

1. **Approve the budget** ($50/day Meta, keep $5–10 organic-pace on Google).
2. **Confirm creator availability** — can Don re-shoot a 15s + 30s with the one-time framing, or do we work with existing footage and a VO swap?
3. **Approve creative copy** above (or amend).
4. **Approve the Google Ads negative-keyword list** (especially the "subscription" negative, which is counterintuitive but data-backed).

Once those four are confirmed, I can wire the Meta campaign skeleton via API in PAUSED state for final review before activation.
