# Fifth Star Funds Application Deck, Outline + Draft Copy

**Date:** 2026-05-06
**Format:** 10 slides. Designed for a partner who reads the deck before the meeting and skims it during.
**Voice:** founder, first-person where natural, no marketing language, no em dashes.

---

## Slide 1, Title

**Uncle May's Produce**
The first data and distribution platform for Black food consumption.

Chicago, single-store box business today. Hyde Park flagship Year 1.

Anthony Ivy, founder + CEO. anthony@unclemays.com. (312) 972-2595.

Polsky Center referral. Application to Fifth Star Funds, May 2026.

---

## Slide 2, The problem (rubric dim 1)

**The cohort:** 310,000 Black households in Chicago. They spend approximately $1.7B per year on groceries. The current options serving them poorly:

- National DTC produce boxes (Imperfect, Misfits, Hungry Harvest) sell ugly-produce framing on national supply. Cultural specificity is zero.
- Chain grocery (Mariano's, Whole Foods) sells produce of unknown provenance from a national consolidated supply chain. Cart breadth is real but cultural specificity is zero.
- Discount chains (Aldi, Save A Lot) compete on price floor. Quality and cultural specificity are zero.
- Independent grocers (the African store in the south suburbs Amaka drives to, west-side soul-food markets) have cultural specificity but require a 20-to-40-minute drive and offer no delivery.
- The closest mission-aligned operator (Forty Acres Fresh Market, founded by a Booth alum) reports "over 1,000 customers" in seven years of operation. The market is wide open.

**What customers actually say** (from interviews, see slide 4 for synthesis):

- "I drive to the African store for chicken and goat" (Amaka, 2026-05-06)
- "I want chicken" (Marian C, single-word answer to "what would you want in your box")
- "I want variety, drop-off, and affordability" (Marian, fairhaven)

The job to be done is not "rescue ugly produce." It is "deliver culturally-specific produce and protein from named Black-owned farms to my door, at the quality I would drive 40 minutes for, without the drive."

---

## Slide 3, The solution (rubric dim 6, product priorities)

**What we ship today:**
- Build-your-own catalog (launched 2026-04-30). Customer picks proteins, beans, produce mix.
- $90 average order value. 40% target gross margin. 22% contribution margin per order.
- Hyperlocal sourcing: Run A Way Buckers Club (Pembroke, IL, Black-owned farm, 80 minutes from Chicago).
- Wednesday delivery. Sunday 11:59 PM cutoff. Chicago and adjacent suburbs only.
- Stripe + Trigger.dev + Resend + Mailchimp + Vercel stack. No new infrastructure planned.

**What we ship in the next 30 days, post-raise:**
- Goat and African-cut chicken specs (driven by Amaka interview today).
- Tomatoes and sweet corn via second supplier (driven by Marian + fairhaven feedback).
- Closed-loop attribution (Pixel feedback loop fixed 2026-05-05; this is the first week we can measure CAC honestly).

---

## Slide 4, The customer (rubric dim 1, JTBD)

**Five interviews. Five customers, three distinct archetypes, one convergent job to be done.**

> "Finally. An opportunity to buy from Black people all in one place." — Antoinette, 3x repeat

> "Y'all had me at all Black farmers." — Miriam

> "Now that I'm on the South Side it's like hunting for food." — Morgan Dixon

> "Always searching for real food, given the limited options on the Southside." — Morgan Woodthorn

> "I drive to the African store in the south suburbs for chicken and goat." — Amaka

**The job to be done:** *Feed my household real food, circulate my grocery dollar inside the Black community, and do it without the multi-year networking project it took to find Black farms in the first place.*

**Convergent signal across all five interviews:**

| Driver | Validated by |
|---|---|
| "Black farmers" as #1 emotional trigger | Miriam, Antoinette, Morgan W, Amaka (4/5) |
| South Side as identity, not just geography | Antoinette, Morgan W, Morgan D (3/5) |
| No-subscription as trust signal, not feature gap | Morgan W, Morgan D (2/5 unprompted) |
| Substitute is in-person grocery, not DTC | All 5 |
| Discovery friction was the prior problem | Antoinette ("3 years"), Amaka, Morgan D ("hunting") |

**What this tells us about positioning.** We are not competing with Imperfect or Misfits. They appear in zero customer comparison sets. We are competing with Petes, Aldi, Marianos, farmer's markets, and a multi-year search project that never resolved. We collapsed that search into a transaction. That is the wedge.

Full memo: [`customer-interviews/jtbd-memo.md`](../customer-interviews/jtbd-memo.md).

---

## Slide 5, What we have learned and changed (rubric dim 5, adaptability)

**The catalog pivot, narrated:**

Before 2026-04-30 we sold three fixed boxes (Starter, Family, Community). Conversion was poor. Customer interviews and abandoned-cart metadata told us why: customers did not see the protein they wanted (Linda wanted beef short ribs and got a generic "family" box, Lia wanted lamb chops and got a generic family box). The fixed-box format hid the SKU choice that customers actually cared about.

We shipped build-your-own catalog on 2026-04-30. Within 6 days we had 2 paid catalog orders (Antoinette $72, Miriam $70). The unit-economics math now reconciles to per-order P&L, not to assumed-mix box P&L. AOV is up. Repeat behavior is observable for the first time.

**The lesson:** the product was getting in the way of the demand. We were 5 weeks into the box business when we found that out, and 7 days from finding out to shipping the fix.

---

## Slide 6, Unit economics + traction (rubric dim 3)

**Per-order P&L:**
- AOV $90, COGS $54 (60%), gross margin $36 (40%).
- Variable costs (packaging, last-mile, Stripe, promo amortization, infra) $15.90.
- **Contribution margin $20.10 per order, 22% of AOV.**

**Three CAC scenarios:**

| Scenario | CAC | Payback | Status |
|---|---|---|---|
| Today (broken attribution) | ~$200 | impossible | Pre-2026-05-05 attribution. |
| Target, 60 days | $40 to $55 | first order net positive | Post-fix, achievable on Chicago Meta + Google. |
| Venture-grade | <$25 | 1 order | Requires strong organic + referral. Year 2 plausible. |

**Subscription anchor:** 1 active grandfathered subscriber (Doina Romanciuc, $55/wk, 6+ months tenure). Sub-conversion of one-time customers is the LTV lever.

**LTV is unmeasured.** Buying the time to measure it honestly is a primary use of the raise. See `unit-economics.md` and `use-of-funds.md`.

---

## Slide 7, Competitive landscape (rubric dim 1)

| Competitor | Format | AOV / weekly basket | We win on | They win on |
|---|---|---|---|---|
| African / soul-food independent grocer | brick-and-mortar | varies | delivery, time savings | SKU breadth, cultural cuts, in-language staff |
| Mariano's, Whole Foods, Pete's | chain | $80 to $120 | cultural sourcing, transparency | one-stop cart, milk and bread |
| Aldi, Save A Lot | discount chain | $40 to $70 | (we do not compete) | lowest unit price |
| Imperfect, Misfits, Hungry Harvest | national DTC | $22 to $44 (Imperfect implied), $26 to $40 (Misfits), $15 to $33 (Hungry Harvest) | cultural specificity, hyperlocal sourcing | price, automation, scale |
| Local CSAs and farmer's markets | weekly subscription | $25 to $45 | delivery, SKU flexibility | 20+ year community trust |
| Forty Acres Fresh Market | mobile + brick-and-mortar | n/a published | different geography, delivery format | mission alignment, west-side trust, Booth alumni network |
| Communal whole-animal share groups | informal | n/a | reliability, no coordination labor | pure cost-per-pound advantage |

Full rationale: `competitor-map.md`.

---

## Slide 8, The team (rubric dim 7, resourcefulness)

- **Anthony Ivy**, CEO. Chicago Booth MBA, prior PE + M&A. Black agricultural heritage. Building from operating-cost discipline, not from venture excess.
- **Zoe Rowell**, COO. 15+ years operations. Ran $3B Amazon Retail P&L.
- **Jua Mitchell**, CFO. 20+ years investment banking + M&A, BofA. Chicago Booth MBA.
- **Tara Weymon**, CMO. Head of Global Marketing at Unilever, prior VP Marketing at P&G.
- **Matt Weschler**, GM Flagship. Started and exited two Chicago grocery stores. Currently GM at Wild Onion. Will run the Hyde Park flagship.

**The infrastructure built without venture capital:**
- 12-agent Paperclip operating system (board-governed, change-controlled).
- 8 production data integrations (Stripe, GA4, Mailchimp, Resend, Apollo, Meta, Google Ads, Canva).
- 5 Trigger.dev tasks running production transactional email.
- Full attribution stack reconciling within 5%, post-2026-05-05.

This was built on operating capital. The Fifth Star raise extends that discipline. It does not replace it.

---

## Slide 9, Use of funds (rubric dim 8)

Three tiers, each a complete plan, not a partial version of the next.

| Tier | Amount | Runway | Thesis tested |
|---|---|---|---|
| 1 | $50K | 6 months | "Can the funnel hit a CAC under $55 with clean attribution?" |
| 2 | $100K | 9 months | "Funnel + sticky retention. Can we get LTV/CAC above 2.0 in 6 months?" |
| 3 | $200K | 12 months | "DTC proof + Hyde Park pre-construction in parallel. Seed-ready in 12 months?" |

**All capital committed at close. None of it performance-gated.** Phasing is by construction milestone (supplier onboarded, infra shipped, hire made), not by hitting a metric.

Full memo: `use-of-funds.md`. The seed-readiness gate criteria (CAC ≤$60, gross margin ≥35%, 30-day repeat ≥25%, LTV/CAC ≥3.0) are explicit and the founder commits to returning to Fifth Star with the data when 4 of 6 metrics land in their ranges.

---

## Slide 10, The founder, the bet, the ask (rubric dim 9, grit)

**The bet, in one paragraph:**

Black grocery customers are the most under-served, highest-LTV, highest-cultural-affinity demographic in American retail food. The companies that will serve them at scale do not exist yet. Uncle May's is building the data and distribution platform that does. The Chicago box business is how we earn the right to underwrite the Hyde Park flagship. The Hyde Park flagship is how we earn the right to underwrite the 82-store rollout. Each step funds itself with a real product and real customers, not just slides.

**The ask:**

A check from Fifth Star, in one of three sizes ($50K / $100K / $200K), on a SAFE at $5M cap with a 20% discount, $25K minimum. Polsky referral path. Decision sought by 2026-06-15.

**What I will give you back:**

- Monthly metrics email (CAC, AOV, gross margin, 30-day repeat, LTV/CAC).
- An open invitation to ride along on a Wednesday delivery.
- A return conversation when 4 of 6 seed-readiness gates land.

If we fail, we fail with documented unit-economics math, documented customer cohorts, and a documented decision tree. Black-founder failure deserves the same caliber of public record as Black-founder success. That is also a deliverable.

---

## What is NOT in this deck

- Year-10 financial forecasts. The parent investor model has them. The Fifth Star raise is funded against 12-month milestones, not 10-year forecasts.
- The 82-store national rollout. That is the long-arc story. It belongs in the Series A deck, not here.
- Endorsements, logos, vanity. The deck is data, customers, founder. That is the whole story.

---

## Production checklist before submission

- [ ] Slide 4 (JTBD): write after Day 5 interview synthesis
- [ ] Visual treatment: convert this markdown to slide deck (Canva, brand-template-driven, single visual per slide)
- [ ] Cover page: include Polsky referral logo with permission
- [ ] Appendix: attach `unit-economics.md`, `use-of-funds.md`, `tam-chicago.md`, `competitor-map.md` as separate PDFs
- [ ] One-pager (cover sheet) for partners who will not open the deck
- [ ] Verify all citations one final time (Imperfect / Misfits / Hungry Harvest pricing, Forty Acres facts, BLS figures)
- [ ] Polsky review (Day 8, 2026-05-12)
