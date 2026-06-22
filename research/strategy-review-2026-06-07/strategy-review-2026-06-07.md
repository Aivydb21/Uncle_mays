# Uncle May's Produce - Strategy Review: Fixing the Funnel & Product Mix

_Generated 2026-06-07 via a 21-skill McKinsey-style strategy pipeline (6 phases + synthesis). Anchor decision: lift paid CVR from ~0.46% and turn the narrow assortment into an offer paid traffic will buy._

---

# Uncle May's Produce: Board Strategy Review
### Fixing the Funnel and Product Mix
*Engagement close. Date: 2026-06-07. Prepared for: Anthony Ivy (CEO) and the board.*

---

## Executive Summary

Paid conversion on unclemays.com is roughly 0.46%, which is 4-8x below the 2-4% food-DTC benchmark, and the root cause is not the checkout, the media, or the price: it is a 43-SKU produce-only catalog that makes it impossible for a paid shopper to build a basket worth buying. The move is a "catalog-first, then funnel" sequence: launch Wave A (soul-food basket) and Wave B (commodity staples) in parallel to reach 80-100 live SKUs in 8-12 weeks, resolve the EXP-002 daily-delivery SLA, and turn on the Black-owned badge, while holding all paid media, the CRO/UX operator hire, and any platform migration behind one three-metric relaunch gate. The expected impact, on an assumption-labeled base case, is recovery of the catalog inventory outlay within roughly 8-14 weeks as conversion moves off the floor and average order value rises structurally. The single largest risk is that assortment is not the primary conversion driver, so the plan embeds an early, cheap test (LogRocket session recordings on the expanded catalog) before any paid dollar is committed. The ask: approve catalog expansion as the sole capital priority, ratify the relaunch gate as the binding governance trigger for every deferred spend, and re-subscribe LogRocket now so the bet is measurable.

---

## The Diagnosis

**The funnel break is upstream of checkout, and the binding constraint is offer adequacy, not funnel mechanics.** The numbers tell a clean story: only about 25% of sessions reach /shop, and only about 5.5% of those add to cart. Shoppers are reaching the catalog, seeing produce-only assortment, and leaving because they cannot fill a meaningful order. The checkout rewrite, the embedded Stripe Elements work, and the delivery UX are not being meaningfully tested yet, because the offer fails at the browse stage before checkout ever loads.

**Root cause, not symptom.** It is tempting to treat 0.46% as a conversion-rate-optimization problem and reach for a CRO operator or a platform migration. That misreads the fact base. A 43-SKU catalog spanning produce and a handful of proteins cannot build the $30-60 basket the paid shopper needs. Every other lever, paid media efficiency, checkout polish, delivery clarity, is a symptom-level fix that cannot move conversion while the offer itself is incomplete. The CEO's root hypothesis is well-supported: this is a demand-side, assortment problem, not a technical or media problem.

**Two compounding constraints, in order.** First and binding: basket inadequacy at /shop (the 5.5% add-to-cart rate). Second and compounding: the /shop reach problem (75% of paid visitors never see the offer at all). Even a strong assortment fix is capped if three-quarters of paid traffic never reaches the catalog, so homepage-to-shop navigation must be fixed in parallel, not after.

**What we are explicitly treating as hypothesis, not fact.** Three headline numbers in the investor materials are projections or directional signals, not behavioral evidence, and this review treats them as such: the 97% intent-to-shop survey, the 35% stabilized gross margin target, and the $6.3M Year-1 revenue. The first 30-60 paying customers in the expanded catalog are the real demand test. We do not let survey intent substitute for cart behavior.

---

## Where to Play and How to Win

**Where to play.** The realistic serviceable obtainable market is south-side Chicago and the south suburbs, an estimated $38M-$62M annual online grocery opportunity (assumption-labeled, derived from household counts and conservative online-channel capture), not the $13.4B-$20.4B SAM in the investor deck. Roughly 80% of that wallet sits in basket-completion categories, pantry staples, proteins, snacks, and heat-and-eat, that the current catalog cannot capture. The brand is not losing to a competitor; it is losing to basket fragmentation, where south-side households split their shop across Mariano's, Aldi, and the occasional Whole Foods trip because no single online channel serves the full basket.

**Which customers.** Four behaviorally distinct segments exist, but only two can anchor the relaunch:

- **The Soul-Food Household** is the highest-LTV, highest-priority segment, with a documented 72-191% over-index on items Uncle May's does not yet stock (collards, okra, black-eyed peas, smoked turkey necks, cornmeal, oxtail). This is the only segment where the Black-owned sourcing thesis is a genuine purchase driver, not a brand nicety. It converts best on Facebook (community, recipe-forward video) and is the most repeat-purchase-dependent, which ties its LTV directly to the delivery SLA.
- **The Health-Forward Professional** is the de-facto audience the 0.46% is measured against today. They reach /shop, add roughly $12 of kale and carrots, and hit the $20 minimum wall before they can complete. This is basket incompletion, not checkout friction. They convert on Instagram and Google search intent.
- The **Convenience Shopper** (needs heat-and-eat, Wave D) and the **Gift/Exploratory Buyer** (needs a box vehicle that does not exist yet) are real but have low right-to-win today. Do not target them with paid media until their enabling category is live.

**How to win.** The only durable moat is the intersection of the Black-owned badge, south-side delivery, and a no-subscription-lock build-your-own cart, but this is only true above an 80-100 SKU, four-category threshold. Below it, the positioning is a claim with no product behind it. Instacart, DoorDash, and Whole Foods cannot replicate verified Black-owned sourcing credibility at scale, and every category added with a verified badge widens that gap.

**The competitive clock.** The threat is not direct replication of the niche; it is indirect substitution. Instacart-plus-Whole Foods and Aldi already solve basket completion for the same shopper and win every time a paid visitor hits /shop and finds only produce. Two timing risks matter: a possible Whole Foods southward expansion near the planned flagship would collapse the price-perception story, and the incumbents' 1-2 hour delivery windows undercut a 4-day lead time. The keyword cluster "Black-farmed produce, south-side Chicago" is not yet contested at scale, so first-mover advantage there remains available but finite.

---

## The Strategy

**The chosen path is "Catalog-First, then Funnel."** The decision is settled that the catalog must be fixed; the strategic choice is sequencing. We sequence the offer ahead of every growth lever because basket completion is the binding constraint on which every downstream metric depends.

**The assortment moves.**

- **Wave A and Wave B run in parallel, not sequentially.** Wave A (soul-food basket: collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) unlocks the highest-LTV Soul-Food Household and carries the strongest Black-owned sourcing integrity. Wave B (commodity staples: bananas, onions, tomatoes, pantry) lowers the per-item price floor and removes the $20 cart minimum as the secondary suppressor for the Health-Forward Professional. Both are required before paid relaunch; neither alone is sufficient. Target is a combined 80-100 live SKUs with at least 10 merchandised SKUs per new category.
- **Proteins are an anchor, not a side category.** They are already the highest AOV-contribution SKUs and over-index strongly for Black households. Adding protein variety (oxtail, smoked turkey necks, ground beef) raises AOV structurally without touching list prices and adds no new trust surface.
- **The Black-owned badge ships at Wave A/B launch on every eligible SKU.** It is zero-cost and zero-lead-time on the current stack, and it is the one moat the incumbents cannot copy. Delaying it is pure value destruction.
- **Wave E (Black-owned personal care) is a genuine invest candidate, but only after Wave A/B are proven.** High DTC margin (assumption: 55-70%), shelf-stable, no cold-chain cost, full sourcing integrity, but it needs its own discovery mechanism and must not draw sourcing bandwidth during the sprint.

**The pricing moves (the highest-leverage pricing intervention is structural, not a price cut).**

- **Test a $15 cart minimum the week Wave B staples go live.** The $20 floor fires at exactly the wrong moment for small-basket shoppers once low-unit-price SKUs ($1.50-$4.00) arrive. Measure cart completion by session cohort, not in aggregate, then retest $20 against the full catalog.
- **Move from a flat $7.99 delivery fee to a tiered fee** (illustrative tiers, to be validated: free above a high-basket threshold, a reduced mid-tier, full fee on small orders). At current AOV the flat fee is 13-40% of order value and punishes exactly the shoppers Wave A/B is meant to convert; tiering rewards basket-building without eroding economics on large orders.
- **Validate Wave A shelf prices against live Whole Foods and Aldi before launch.** The "cleaner than Whole Foods, cheaper than Aldi" claim is unverified for specialty and Black-farmed items; price Wave A SKUs at a modest premium to Whole Foods, not to Aldi, and confirm against real shelf prices first.
- **No promo codes until a post-assortment behavioral baseline exists.** The current clean-price signal is the right experiment. When the first promo runs, make it a free-delivery threshold, not a percentage discount, to protect margin while removing a known friction point.
- **Re-introduce an optional subscription tier at Wave A/B launch, never required to check out.** It captures Soul-Food Household LTV and improves routing efficiency; the prior design flaw (subscription required to complete checkout) must not return.

**The business case (assumptions labeled).** The inventory investment for Wave A plus Wave B is an estimated $43K-$72K over 8-12 weeks, and it is the only intervention with positive expected value today. Base case (assumption-labeled): moving from 0.46% toward a conservative 1.5% CVR at roughly $50 AOV on a modest paid-session volume generates meaningful incremental weekly revenue and recoups the inventory outlay in roughly 8-14 weeks. By contrast, paid media at 0.46% CVR has negative expected value because CAC almost certainly exceeds first-order gross profit; it is the clearest exit candidate in the portfolio until the gate clears.

**What we are explicitly deferring.** The CRO/UX operator hire ($50K-$120K, 90-day trial) is a hold, not a no: hired now it would optimize a funnel feeding a broken offer. Platform migration from custom Next.js to headless Shopify is removed from active consideration: it is not the binding constraint at any point in the analysis, and a 3-6 month migration pause is a competitive vulnerability window with no proven conversion floor to compare against. Both unlock only after the relaunch gate and a full week of post-assortment behavioral data.

---

## The 90-Day Roadmap

A two-speed operating model runs throughout: a sourcing-and-catalog sprint team owns the binding constraint, while a thin steady-state layer holds the live funnel, the fulfillment SLA, and organic channels with no new headcount until the gate passes.

**Weeks 1-2: Pre-wire and de-risk.**
- Assign binary decision rights in writing: Anthony (CEO) owns sourcing standards, Black-owned badge approval, and sourcing-pipeline velocity; Zoe (COO) owns vendor selection, inventory levels, fulfillment SLA, /shop reach, and the weekly metrics publish. Shared ownership is not ownership.
- Secure at least two alternate sourcing relationships under LOI for each Wave A soul-food SKU. The single-farm supplier (Run A Way Buckers Club, Pembroke IL) is a blocking stakeholder and a single point of failure; this is the highest-severity de-risk action.
- Re-subscribe LogRocket and Galileo before any SKU ships. This is positioned as a governance requirement, not optional analytics: without session-level data we cannot tell whether assortment or funnel friction moved conversion, leaving the $43K-$72K decision in ambiguity.

**Weeks 1-12: The catalog sprint (sole capital priority).**
- Wave A and Wave B sourced and merchandised in parallel toward 80-100 live SKUs, 10+ per category, by Week 12. This receives 100% of sourcing and engineering capacity.
- Black-owned badge activated on all eligible SKUs at launch (Black-owned Badge Coverage target: 100%).
- Fix homepage-to-shop navigation in parallel with catalog work to lift /shop reach above the 40% gate.

**By Week 4: EXP-002 SLA resolution (equal-priority operational blocker, not a side project).**
- Zoe publishes a firm, customer-facing daily-delivery SLA grounded in actual driver routing capacity. The current "every day" claim runs ahead of verified routing; until the SLA is real, the highest-LTV segment cannot be retained and any paid relaunch bleeds into a trust gap.

**The relaunch gate (the master governance trigger, all three in the same calendar week).**
- /shop reach above 40%.
- Add-to-cart rate above 12%.
- At least three of the top-10 Black-household staple SKUs live and in-stock.
- No paid dollar, no CRO operator briefing, and no platform decision before all three clear simultaneously.

**The week Wave B staples go live: pricing experiments.**
- Test the $15 cart minimum (cohort-measured) and launch the tiered delivery fee, so results are readable without a promo confound.

**Post-gate (unlocks only after the gate clears plus one full week of behavioral data).**
- Reactivate paid media against the south-side keyword cluster with the expanded catalog and segment-specific creative (Facebook recipe-forward for Soul-Food Household; Instagram and Google intent for Health-Forward Professional). The pre-pause generic produce imagery underperformed both segments.
- Open the CRO/UX operator window. Inform candidates (Barrel, Anatta, Bear Group) now that a window opens at gate passage so they do not fill capacity, but brief no one until the behavioral baseline exists, and screen any candidate whose model forces a Shopify migration.
- Wave E (personal care) sourcing begins once one full week shows ATC above 12%.

---

## Risks and What Could Break It

**1. Assumption inversion (highest severity): assortment is not the primary conversion driver.** If checkout friction, delivery trust, or price perception drive more conversion failure than assortment, adding 40-60 SKUs will not move CVR and the inventory outlay strands. *Mitigation:* run LogRocket session recordings on the expanded catalog in the first two weeks of Wave A/B, before paid spend resumes, so the assumption is tested cheaply and early. This is the single most important hedge in the plan.

**2. Sourcing concentration collapse.** A single farm supplier with seasonal constraints cannot scale to Wave A/B volume on a 90-day clock; one harvest failure or capacity ceiling hollows the catalog and makes the gate unreachable. *Mitigation:* two backup sources per Wave A SKU under LOI before launch (Weeks 1-2 action above). War-game signal: if the supplier shows capacity strain, compress the sprint to 6 weeks with a smaller initial SKU count rather than slip the gate.

**3. EXP-002 execution drag.** If the SLA is not published by Week 4, the highest-LTV segment is unretainable even after assortment improves, invalidating the repeat-purchase assumptions in the business case. *Mitigation:* treat the SLA as a hard Week-4 milestone with Zoe as named owner, equal in priority to catalog work.

**4. The gate measures novelty, not retention.** The three gate metrics are necessary but not sufficient: the brand could pass on first-order novelty and reactivate paid into a leaky retention funnel. *Mitigation:* Anthony must set a specific, observable organic-engagement / repeat-purchase threshold (for example a first-30-day repeat-order rate) as a binding pre-paid-restart gate, and communicate it to Zoe and any future operator. This gap is currently undefined in the CEO-approved plan and must be closed.

**5. Pricing claim collapses on first comparison.** If Wave A SKUs price above Whole Foods for comparable items, the positioning story breaks for the first buyers who compare, destroying both conversion and word-of-mouth for the priority segment. *Mitigation:* validate against live shelf prices before Wave A launches.

**6. Capital-timing squeeze.** The $43K-$72K inventory draw must not cannibalize the cash reserve that must remain intact to trigger the SBA facility, and the SAFE round is currently idle (Apollo OAuth revocation). If the round closes below the $400K minimum, the board must pre-define the triage between catalog inventory and operational runway now, not after close. War-game contingency: ring-fence catalog inventory funding from the SBA-trigger reserve.

**7. Competitive encirclement (low probability, high impact).** An incumbent running a "support Black farmers" paid push in the south-side DMA during the paid pause would steal the organic window. *Mitigation:* monitor for a new campaign in the DMA targeting Black households as an early-warning signal; response is sprint compression, not abandonment.

---

## How We Will Know It Is Working

**The KPI system is three tiers, each tied to a binary decision.** Most metrics are noise until Wave A/B are live, so the architecture deliberately retires vanity metrics and elevates leading indicators.

*Tier 1 - Offer readiness (the only metrics that matter now):*
- **Assortment Velocity** (SKUs sourced per week toward the 80-100 target). The single leading indicator today. Owner: Anthony.
- **Black-owned Badge Coverage** (% of eligible SKUs with a verified badge). Target 100% at launch. Zero-cost to track.
- **EXP-002 SLA Resolution Rate** (% of delivery days where actual routing matches the published SLA). Owner: Zoe, weekly, from Week 4.

*Tier 2 - Funnel health (the gate):*
- **/shop reach** (above 40%). Owner: Zoe.
- **Add-to-cart rate** (above 12%).
- **Top-10 staple SKU availability** (three live and in-stock, same week).

*Tier 3 - Unit economics (unlock only post-gate, with LogRocket live):*
- **AOV by segment** (Soul-Food Household vs Health-Forward Professional), the first new behavioral KPI.
- **Cart-completion rate by cohort** for the $15-minimum test.
- Paid CVR and CAC become meaningful only after the gate; until then they are explicitly not owned, because the metric is not yet real.

**Retire immediately:** paid CVR as a standing target (meaningless at 43 SKUs), CAC (undefined without post-cost margin data), Mailchimp open rate (audience effectively empty, newsletter-only), and the 97% survey intent-to-shop figure (not behavioral evidence).

**Value realization.** Every benefit category has a named individual owner, a hard baseline captured before Wave A/B launch, and a weekly governance cadence that forces an escalation decision before any deferred lever reactivates. The relaunch gate is the master trigger; the weekly metrics publish (Zoe) is the rhythm that keeps the gate hard rather than a soft suggestion. Expected capture (assumption-labeled): $5K-$8K incremental weekly revenue and inventory recovery in 8-14 weeks, contingent on the gate clearing and the SLA being published.

---

## The Ask / Decision

The board is asked to decide four things now:

1. **Approve the Wave A + Wave B catalog sprint as the sole capital priority,** funding an assumption-labeled $43K-$72K inventory investment over 8-12 weeks toward 80-100 live SKUs, run in parallel, ring-fenced from the SBA-trigger cash reserve.
2. **Ratify the three-metric relaunch gate as the binding governance trigger** for all deferred spend: no paid media, no CRO/UX operator hire, and no platform decision until /shop reach above 40%, ATC above 12%, and three top-10 staple SKUs in-stock all clear in the same calendar week. Assign Zoe as the gate's measurement owner with a weekly publish cadence.
3. **Authorize the immediate re-subscription of LogRocket and Galileo** as a governance requirement, so the assortment-versus-friction question is testable before paid spend resumes.
4. **Direct Anthony to define the missing pre-paid-restart retention gate** (a specific repeat-purchase or organic-engagement threshold) and direct Zoe to publish the EXP-002 daily-delivery SLA by Week 4.

Everything else, paid media, the operator hire, the platform question, is explicitly deferred with defined unlock conditions. The discipline of this plan is that it refuses to fund the funnel before the offer can convert. Approve the offer fix, hold the line on the gate, and the paid engine becomes worth restarting.

---

## Consolidated Open Data Gaps

The analyses below flagged these as real numbers needed to harden the strategy:

- Realized AOV from orders placed before the 2026-05-16 paid-ads pause: this is the most critical missing number for diagnosing whether the basket mechanics are broken or whether the problem is purely top-of-funnel.
- Actual session-to-shop rate and ATC rate from organic traffic post-pause (2026-05-16 to 2026-06-07): needed to separate media-driven traffic quality issues from site-side offer issues.
- EXP-002 painted-door test results: can the operation reliably execute daily delivery across the full service area today?
- ZIP-level or neighborhood breakdown of sessions and orders: are paid impressions reaching served ZIPs or leaking to non-served areas (Lincoln Park, Lakeview, Austin)?
- Repeat purchase rate from non-subscription customers: how many customers placed a second order within 30 days? This is the only behavioral proof of product-market fit the business currently has.
- Actual number of orders placed (unit count, not just revenue) before the paid-ads pause: needed to assess statistical significance of the 0.46% CVR measurement.
- Timeline and milestone plan for the 6-phase product-mix reset: how many weeks until Wave B (commodity staples) and Wave E (Black-owned personal care) are live with 10+ merchandised SKUs each?
- Black-owned vendor coverage in the sourcing pipeline (app3raEVB9kHeUoHE): what percentage of the 1,025-row pipeline are Black-owned, and how many are in the categories (snacks, pantry, prepared) that are currently absent?
- Session-level CVR split by traffic source (Meta vs. Google vs. organic vs. direct): cannot confirm whether 0.46% applies equally to all sources or is driven by a single misfiring audience
- Post-/shop scroll and click behavior: no heatmap or session replay data available (LogRocket/Galileo paused), so homepage-to-shop navigation hypothesis is inferred from session rates, not observed user behavior
- Add-to-cart rate split by SKU category: do visitors who reach /shop add produce, proteins, or neither? This determines which specific catalog gaps are most acute
- Delivery fulfillment rate by ZIP and day of week: needed to quantify the delivery trust risk before paid relaunch
- Repeat purchase rate among the small cohort of actual purchasers (excluding the grandfathered subscriber): the only behavioral proof of retention is Doina's one subscription
- Basket size distribution among completers: knowing whether paid converters are buying the minimum viable basket or a fuller cart clarifies whether the $20 minimum is a friction point post-assortment expansion
- Competitive basket analysis for south-side Chicago: what a comparable Whole Foods, Mariano's, or Instacart basket looks like in price and SKU count for the same household profile, to anchor the category gap against a real alternative
- Funnel attribution split: what fraction of the 0.46% paid CVR gap is attributable to assortment vs. checkout UX vs. trust signals vs. price perception. Currently inferred but not measured.
- Logged delivery slot availability and on-time delivery rate from EXP-002 (painted-door test results not yet read out).
- SKU-level landed cost for the live catalog (needed to build a real blended gross margin model for the e-commerce channel, separate from the flagship store projection).
- Shelf-price comparison: Uncle Mays current prices vs. Whole Foods Chicago and Aldi Chicago for equivalent SKUs (needed to verify the 'cleaner than Whole Foods, cheaper than Aldi' claim).
- Email and contact list from the original 100+ consumer survey (needed to run a closed beta with the highest-intent demand signal the business currently has).
- Black-owned distributor and co-op availability in the Chicago metro for Wave B (commodity produce staples) and Wave E (personal care): MOQ, pricing, lead time, and certification status.
- Organic social account follower count, engagement rate, and historical traffic contribution (not documented in the fact base; needed to assess whether organic channels can support the assortment test).
- Session data with LogRocket reactivated: scroll depth on /shop, rage clicks, drop-off points in checkout flow, and the specific moment shoppers exit. Currently PAUSED as of 2026-05-28.
- Actual Mailchimp audience size post-cleanup (fact base says effectively empty; Stripe customer email count needed to estimate newsletter audience potential after re-import).
- Service-area household count and online grocery adoption rate by ZIP: the Census ACS parquet is on disk but has not been joined to delivery ZIPs to produce a precise household count. Run the join on `census_acs_zip_20260502T183716Z.parquet` against the service-area ZIP list to replace the 200K-240K estimate with an exact figure.
- Post-assortment baseline CVR: there is no behavioral data on what conversion rate looks like after a catalog expansion because no expansion has happened yet. The 2% target is a benchmark assumption, not a measured outcome. First 30 days post-Wave-B launch are the critical observation window.
- Average basket size by segment: the 30-60 USD stated AOV range is a current observation on a 43-SKU catalog. It is unknown whether a 100-SKU catalog produces a higher AOV (likely) or lower (if commodity staples lower average unit price). This needs a first-party test, not an assumption.
- Competitor delivery penetration in south-side ZIPs: no verified data exists on what share of south-side households are currently active on Instacart, Amazon Fresh, or Walmart+ in the specific service-area ZIPs. This matters for estimating switching cost and market share ceiling.
- Black-farmed SKU sourcing capacity beyond Run A Way Buckers Club: the vendor sourcing pipeline (1,025-row Airtable base app3raEVB9kHeUoHE) exists but has not been translated into confirmed supply agreements for Wave B staples. The gap between pipeline and contracted supply is the single biggest operational risk to the where-to-play options.
- Repeat purchase rate for current customers: the fact base does not include a stated repeat rate beyond the one grandfathered subscriber. The bottom-up market size model assumes a 2x organic multiplier on paid conversions, which is a placeholder. Actual cohort retention data (even from a small sample) would sharpen this estimate significantly.
- Heat-and-eat supplier landscape in south-side Chicago: whether Black-owned prepared food suppliers exist in the service area at the scale needed for 8-12 reliable SKUs is unknown. This is the key feasibility check before Option 2 is committed.
- Segment-level AOV and ATC rate by SKU category from LogRocket/Galileo (currently paused): impossible to confirm whether the 0.46% CVR is disproportionately failing Segment 1 vs. Segment 2 without session-level cohort data.
- Numerator full 'Food Culture in the Black Community' report (public press-release figures used throughout): would convert inferred items in the soul-food basket from directional to rank-ordered, and would provide Black-household basket-size and frequency data by income tier to validate Segment 1 AOV and frequency assumptions.
- BLS Consumer Expenditure Survey microdata for Chicago MSA, race-disaggregated (free, 20-40 analyst hours): would provide category-level dollar-share by Black household income tier in Chicago, converting the gross-margin estimates from assumption to data.
- EXP-002 painted-door delivery window test results: required to confirm whether Segment 1 (Soul-Food Household, the most repeat-purchase-dependent segment) can be served on the daily delivery cadence promised, or whether a sub-area SLA is needed before relaunch.
- Post-Wave-A first 30-day order cohort (does not exist yet): ATC rate by category, AOV by segment proxy (basket composition reveals segment), repeat rate within 14 days. This is the only behavioral test that can confirm or falsify the segment model.
- Service-area ZIP-level demographic breakdown cross-referenced against delivery order ZIP codes (Census ACS on disk at ml/data/raw/census_acs_zip_20260502T183716Z.parquet, but order-level ZIP data is only available post-relaunch): would allow segment sizing at the ZIP level and identify which sub-geographies are over- or under-indexed.
- Whole Foods Chicago expansion plans south of 55th Street: no public permit or lease data confirmed as of June 2026. Monitor Chicago DPD permit filings and JLL/CBRE retail leasing reports for Hyde Park / Kenwood corridor.
- Aldi shelf prices for 8-10 anchor staples Uncle Mays plans to add in Wave B (bananas, bagged potatoes, dried beans, rice, eggs). Required before the 'cheaper than Aldi' claim can be validated or the tagline must be revised.
- Instacart / DoorDash paid ad spend and keyword targeting in south-side Chicago ZIP codes (60615, 60619, 60637). Estimated via Facebook Ad Library and Google Ads Auction Insights; not verified against actual spend data.
- Active VC-backed Black food e-commerce entrants nationally: no confirmed funded competitor identified as of June 2026. This is an assumption. Recommend a quarterly scan of Crunchbase and Black Enterprise funding announcements.
- EXP-002 painted-door test results: the actual daily delivery coverage map, order volumes attempted vs. fulfilled, and lead-time distribution are not in the fact base. This is the single most important operational data gap for competitive response planning.
- GreenLeaf Market and other Black-owned Chicago grocery operators' current digital presence and delivery capability: no verified current-state data on whether any have launched or are piloting e-commerce delivery since this fact base was assembled.
- Current Instacart and DoorDash delivery fee structures and promotional cadence in south-side Chicago ZIPs: the $7.99 Uncle Mays flat-fee comparison is made without a verified current Instacart fee for equivalent basket sizes in the same ZIPs.
- Realized gross margin by SKU or category (the 35% target is a projection; no actual order-level COGS data is in the fact base)
- Realized CAC by channel (Meta vs Google vs direct) from the mart_cac dbt model; BigQuery data not queried here
- Actual AOV distribution across completed orders (typical first cart $30-$60 is directional; no mean/median from mart_customers)
- Repeat purchase rate and time-to-second-order from the mart_customers LTV fields (no live query run; data exists in BigQuery but not surfaced)
- Delivery routing cost per stop under EXP-002 (the $7.99 fee may be below actual delivery unit cost at current volume, which would make the delivery P&L negative)
- Actual add-to-cart rate and session-to-shop rate post-May-16 pause (Galileo subscription is paused; no post-pause funnel behavioral data)
- Wave A supplier quotes and minimum order quantities (working capital estimates of $31K-$52K are order-of-magnitude only; firm numbers require Phase 4 outreach results)
- Black-owned field not yet populated in the Suppliers Airtable table (cannot confirm >90% Wave A Black-owned share until field is added and outreach completes)
- Personal care category revenue benchmarks for Black-owned DTC brands to size the Wave E pool more precisely than the labeled assumption used here
- Wave A and Wave B inventory cost estimates ($31K-$52K Wave A cited from profit-pool phase; Wave B estimate assumed $20K-$40K but not given in fact base) require confirmation from CEO/COO sourcing conversations before capital allocation.
- Organic session volume during the gate-measurement period is unknown. The Mailchimp audience is effectively empty and social follower counts are not in the fact base. If organic weekly /shop sessions are below 50-100, the behavioral gate cannot be measured with statistical confidence on a 4-6 week timeline.
- Run A Way Buckers Club capacity to supply soul-food SKUs (collards, okra, smoked cuts) is not confirmed in the fact base. The farm is described as the single supplier for the current 43 SKUs; its ability to expand categories in 4-6 weeks is an assumption.
- Net-new supplier identification timeline for Wave B commodity staples is not in the fact base. CEO and COO own sourcing jointly (2026-05-17 decision) but no supplier names or timelines are confirmed.
- EXP-002 painted-door test status and current routing capacity are not quantified. The fact base says the test is 'running' but does not give a timeline to resolution or a current fill-rate metric.
- Pricing comparison data vs. Aldi and Whole Foods for overlapping SKUs does not exist in the fact base. The 'cleaner than Whole Foods, cheaper than Aldi' claim cannot be verified without a live SKU-level price audit.
- Platform migration cost estimate ($50-150K) is an assumption inserted for comparison purposes and not grounded in any vendor quote or scope of work in the fact base.
- Post-assortment AOV assumption for the Soul-Food Household ($45-70) and Health-Forward Professional ($30-50) are inherited from the customer-segmentation phase and labeled as estimates. Actual AOV for these segments is unknown until Wave A/B orders are collected.
- Wave A and Wave B inventory cost estimates ($31-52K and the Wave B equivalent) are assumptions from the profit-pool phase, not vendor quotes. Actual costs depend on supplier negotiations Anthony and Zoe have not yet completed. First vendor bids required to validate the investment case.
- Post-assortment CVR, ATC rate, and /shop reach are unknown because LogRocket has been paused since 2026-05-28 and paid ads have been paused since 2026-05-16. There is no behavioral baseline against which to measure the impact of the specialty-SKU re-merchandising already done or the Wave A and B additions.
- EXP-002 daily delivery test results are unresolved. The actual routing capacity per day, cost per delivery, and driver availability have not been shared in the fact base. The firm SLA decision requires this operational data before it can be published to customers.
- Personal care margin assumption (55-70% DTC) is a category-level benchmark, not a Wave E supplier quote. Uncle Mays has not run a personal care product through its fulfillment chain, so actual landed margin and logistics cost per unit are unknown.
- The $15 cart minimum test result is entirely hypothetical until Wave B commodity SKUs are live and the test is run. No A/B data exists. The conversion impact of moving from $20 to $15 minimum is an assumption, not a measured outcome.
- CRO operator cost and timeline ($50-120K, 90-day trial) are estimates from prior engagement context, not signed proposals from Barrel, Anatta, or Bear Group. Each operator's minimum data requirements and custom-stack experience have not been confirmed.
- Black-household top-10 staple SKU list by purchase frequency in the Chicago south-side market has not been compiled from primary or secondary data (Numerator pull was budget-declined by CEO). The three-threshold relaunch gate requires naming specific SKUs as live, and that list does not yet exist in the fact base.
- Driver cost per delivery route by ZIP cluster: needed to verify whether free delivery above $60 is margin-neutral or margin-negative given actual last-mile economics, and to set the correct free-delivery threshold.
- Cart abandonment data by abandonment-value tier (e.g., carts abandoned at $10-$14.99, $15-$19.99, $20-$24.99): needed to quantify how many sessions are currently blocked by the $20 minimum and to size the conversion opportunity from lowering it.
- Live shelf price comparison for 10-15 comparable SKUs at Whole Foods Hyde Park and Aldi (closest south-side location): needed to validate or falsify the 'cleaner than Whole Foods, cheaper than Aldi' positioning claim before Wave A launches.
- Order value distribution (histogram by $5 bucket) from all completed Stripe orders to date: needed to establish the current AOV baseline and identify whether clustering near the $20 minimum is suppressing natural basket size.
- SKU-level ATC rate from Airtable or GA4 event data: needed to identify which current SKUs are adding to cart vs. being viewed without conversion, to prioritize Wave A/B merchandising and price-point decisions.
- Repeat purchase rate at 30 and 60 days from the existing small Stripe customer base: needed to set the subscription pricing discount and LTV model for the Soul-Food Household segment.
- Doina's grandfathered subscription economics (actual margin after fulfillment cost at $55/week): needed to calibrate the proposed $59-$79/week subscription tier against real unit economics, not projected margins.
- Actual weekly paid session volume at the $439/week pre-pause spend level (needed to validate CAC and payback period; 150 sessions/week is an unverified assumption)
- Per-delivery variable cost (driver cost, cold-chain logistics, packaging) needed to verify that $7.99 flat fee is margin-positive at Wave A+B AOV levels
- Black-owned supplier landscape for Wave A specialty items (collards, okra, smoked meats, dry goods) in the Chicago/Midwest sourcing radius: no confirmed vendor list, timeline, or unit cost structure
- EXP-002 actual routing data: which days and ZIP codes are being served, at what fill rate, and whether daily delivery is operationally achievable before paid relaunch
- Realized gross margin by SKU category on current 43 SKUs: the 35% gross margin target is a projection; no actual blended margin figure is in the fact base
- Post-expansion ATC rate by SKU category: needed to confirm whether assortment or checkout friction is the primary CVR driver; currently not measurable because LogRocket subscription is paused
- Competitive paid-acquisition spend in the 'Black-farmed produce south-side Chicago' keyword cluster: the assumption of first-mover advantage is unverified
- Product photography unit cost for 40-60 new SKUs: the $2,000-$6,000 estimate is an assumption with no vendor quote
- Actual repeat purchase rate and LTV for existing customers (Doina's $55/week is a single data point, not a segment-level statistic)
- Wave A and Wave B vendor sourcing lead times: no vendor from the Airtable pipeline (app3raEVB9kHeUoHE, 1,025 rows) has been activated. Actual time-to-first-delivery for collards, okra, smoked turkey cuts, and commodity staples from a new Black-owned or Black-farmed supplier is unknown. This determines whether the 8-12 week sprint timeline is achievable.
- Wave E personal care inventory cost: the $15K-$25K estimate is drawn from prior profit-pool analysis assumptions, not from vendor quotes. Actual unit economics (cost, MOQ, shelf-stable freight) for batana oil, soaps, and skin/hair care from Black-owned suppliers are unverified.
- Actual first-order AOV from organic post-assortment orders: the business case assumed $50 AOV. Whether Wave A/B catalog additions shift AOV to that range (vs. current $30-$60 produce-only range) is unproven until the first 30 organic orders after launch are logged.
- EXP-002 routing capacity data: the actual number of ZIP codes and delivery days the current driver network can reliably cover is not in the fact base. Zoe's SLA publication depends on this, and it is the gating input for the fulfillment trust fix.
- Whole Foods shelf prices for soul-food category equivalents (collards, okra, smoked cuts, black-eyed peas): the positioning claim 'cleaner than Whole Foods, cheaper than Aldi' has not been validated against live shelf prices for Wave A SKUs. If Wave A prices land above Whole Foods on key items, the positioning story breaks.
- Post-assortment /shop reach and ATC rate baseline: LogRocket is paused. No behavioral data from the current storefront (post any assortment change) is available. All relaunch gate targets are projections from pre-pause data at 43 SKUs.
- CRO/UX operator minimum stack requirements: whether Barrel, Anatta, or Bear Group will require a Shopify migration as a condition of engagement, or whether they will work with the existing Next.js stack, is unknown. This is the key input to the platform migration decision.
- Post-assortment CVR baseline: no behavioral data exists for a catalog with 80+ SKUs. The base-case ROI model ($43K-$72K inventory recovering in 8-14 weeks at 1.5% CVR) is an assumption. The first two weeks of post-Wave A/B organic traffic are the real demand test.
- ATC rate and AOV by SKU category: LogRocket is paused, so there is no per-SKU add-to-cart or per-category abandonment data. Reviving LogRocket before paid relaunch is required to know which Wave A/B SKUs are driving or blocking basket completion.
- EXP-002 delivery routing capacity: the actual number of ZIP codes and delivery windows the current driver setup can reliably serve every day is unknown. Zoe must produce this number before any SLA is published or any paid campaign targeting south-side households is activated.
- Wave A/B sourcing capacity: Run A Way Buckers Club (the single current supplier) cannot supply commodity staples or the full soul-food basket. The vendor pipeline for collards, okra, rice, cornmeal, bananas, onions, and tomatoes is unquantified. Sourcing velocity (SKUs contracted per week) is the true pacing constraint for the 8-12 week sprint target.
- Competitive shelf-price validation: the 'cleaner than Whole Foods, cheaper than Aldi' claim has not been verified against live shelf prices for Wave A SKU equivalents. A manual price check at the nearest Aldi and Whole Foods for collards, okra, sweet potatoes, eggs, and chicken is required before Wave A launch copy is finalized.
- Black-owned badge eligibility count: the total number of SKUs in the planned Wave A/B catalog that will qualify for the Black-owned badge is unknown until vendor sourcing is finalized. This number determines the strength of the badge as a discovery signal at launch.
- Cart minimum sensitivity: the conversion impact of a $15 vs $20 minimum is assumed based on typical produce-basket price points ($1.50-$6.00 per item), but no A/B test has been run. The $15 test is the mechanism to measure this, not a confirmed improvement.
- Gross margin by category: the 35% stabilized gross margin target is a projection for the physical flagship store, not the e-commerce channel. Actual realized gross margin on Wave A soul-food SKUs and Wave B commodity staples under current delivery cost structure is unknown and may differ materially from the flagship projection.
- Actual Wave A vendor landscape for south-side Chicago / Midwest Black-owned soul-food staple suppliers (collards, okra, smoked cuts, cornmeal, black-eyed peas): no current sourcing relationships outside Run A Way Buckers Club; engagement timeline and minimum order quantities unknown.
- EXP-002 daily delivery routing capacity data: actual driver headcount, days covered per week, and routing coverage by ZIP are unpublished internally. Without this, the published SLA is aspirational, not operational.
- Post-assortment CVR baseline: all funnel metrics (/shop reach 25%, ATC 5.5%, CVR 0.46%) are pre-catalog-expansion and pre-LogRocket-restoration measurements. No behavioral data exists from an expanded catalog. The relaunch gate thresholds (40% /shop reach, 12% ATC) are defensible benchmarks based on food-DTC comparables but are not Uncle Mays-specific empirical targets.
- Live Whole Foods and Aldi shelf prices for the specific soul-food SKUs Uncle Mays plans to launch (collards, okra, black-eyed peas, smoked cuts): required to validate the 'cleaner than Whole Foods, cheaper than Aldi' positioning claim before Wave A launches.
- Wave A and Wave B inventory unit economics: first-order cost per SKU, minimum order quantities, spoilage/shrinkage rates, and cold-chain handling costs for smoked cuts and proteins. The $43K-$72K total inventory investment is an estimate from business-case-builder; actual vendor quotes required to confirm.
- Black-owned personal care supplier landscape (Wave E): soaps, batana hair oil, skin and hair care products with verifiable Black-owned sourcing. No current vendor relationships identified. Lead time and minimum order quantities unknown.
- CAC at post-relaunch CVR levels: the $18-25 first-order gross margin threshold used in the governance metrics is an estimate derived from a 35% gross margin assumption on $50-70 AOV. Actual gross margin on the current live catalog (not the 35% stabilized projection) is unknown and would change the CAC floor materially.
- ATC rate broken out by SKU category (produce vs. protein) from the current 43-SKU catalog: this would isolate whether the ATC failure is uniform across categories or concentrated in produce-only sessions, directly testing the assortment assumption before Wave A/B launches.
- Confirmed vendor agreements (not prospecting contacts) for Wave A soul-food items: collards, okra, smoked turkey necks or smoked cuts, dry black-eyed peas, cornmeal. The Airtable vendor pipeline (1,025 rows) is prospecting, not confirmed supply.
- Live shelf prices at the Hyde Park Whole Foods (5118 S Lake Park Ave) and the nearest south-side Aldi for every Wave A and Wave B SKU equivalent. Required before Wave A/B pricing is set.
- EXP-002 output: which delivery dates and which ZIP codes in the service area have been successfully fulfilled at current organic order volume, and what is the maximum orders-per-day the current driver routing can reliably serve? This is the input to the published SLA.
- Operating cash balance and the minimum unrestricted cash floor required to maintain SBA 7(a) facility eligibility (Busey Bank conditional approval). Without this number, the Wave A/B inventory budget cannot be safely sized.
- LogRocket session recordings from the current catalog (before Wave A/B launches) showing the specific browse-stage drop-off point on /shop: is drop-off concentrated at the category navigation level, the individual SKU card level, or at the cart minimum wall? This is the cheapest test of the assortment assumption before any sourcing spend.
- Minimum technical requirements from Barrel, Anatta, and Bear Group for a conversion rate optimization engagement: do any of them require Shopify or a headless commerce framework as a condition of engagement, or will they work on the current custom Next.js stack?
- Actual sourcing capacity of Run A Way Buckers Club for Wave A SKUs (collards, okra, smoked cuts) at catalog volume: no production volume data exists in the fact base. This is the single most important data gap given single-supplier concentration.
- EXP-002 painted-door test results: no resolution date or preliminary data is documented. The daily delivery SLA is the second most critical operational unknown.
- Confirmed Black-owned badge eligibility for Wave A/B SKUs: the vendor pipeline (1,025 rows, Airtable app3raEVB9kHeUoHE) has not been screened for badge eligibility. The number of certifiably Black-owned suppliers in the Wave A/B assortment is unknown.
- Post-Wave A/B CVR and ATC behavioral data: this cannot exist until the sprint is complete. All relaunch gate metrics are forward-looking. The business case's 1.5% CVR assumption is unverified at behavioral scale.
- Live Whole Foods and Aldi shelf prices for Wave A soul-food SKUs (collards, okra, black-eyed peas, cornmeal): the 'cleaner than Whole Foods, cheaper than Aldi' claim has not been validated against actual shelf prices for these specific items.
- SAFE round close probability and timeline: Apollo outreach is idle, no active investor meetings are documented in the fact base, and the minimum $400K gate for SBA facility trigger has no confirmed close timeline.
- CRO/UX operator platform requirements from Barrel, Anatta, and Bear Group: no discovery calls or RFP responses are documented. Whether any of the three shortlisted operators require a Shopify migration as a condition of engagement is unknown.
- Repeat purchase rate for existing Stripe customers (excluding the grandfathered Doina subscription): no cohort retention data is available in the fact base. The Soul-Food Household LTV assumption depends entirely on repeat purchase behavior that has not been measured.
- SKU-level gross margin data: no cost-per-SKU or landed-cost data exists for the live catalog. Without it, AOV targets and unit economics thresholds are assumption-labeled. This requires Zoe (COO) to extract vendor invoice costs from Run A Way Buckers Club and any Wave A/B suppliers before the Unit Economics Review activates.
- Segment-level behavioral data (AOV by segment, ATC rate by SKU, repeat purchase rate by segment) does not exist because LogRocket is paused and Mailchimp audience is effectively empty. LogRocket must be re-subscribed before post-gate unit economics reviews can produce reliable segment splits.
- Actual /shop Reach Rate and ATC Rate baselines: the 25% and 5.5% figures are pre-pause estimates. A clean post-Wave A/B baseline measurement requires at least two weeks of organic traffic to the expanded catalog before the gate review is meaningful.
- Delivery fee elasticity: the hypothesis that a tiered delivery fee (free above $60) will increase AOV without suppressing order volume is untested. Requires A/B test data from post-relaunch, minimum 200 sessions per variant.
- Cart minimum elasticity: the $15 vs $20 minimum experiment needs at least two weeks of data post-Wave B launch to detect a statistically meaningful difference in cart completion rate at the typical sample sizes Uncle Mays organic traffic currently generates.
- Whole Foods and Aldi live shelf prices for Wave A soul-food SKUs (collards, okra, smoked turkey necks, cornmeal, black-eyed peas): the pricing claim 'cleaner than Whole Foods, cheaper than Aldi' has not been validated against actual current shelf prices. Required before Wave A launches to confirm the pricing assumption holds.
- EXP-002 painted-door results: the actual driver routing capacity data that will determine the published SLA has not been confirmed. Zoe (COO) must produce this before Week 4 or the relaunch gate cannot be assessed for the fulfillment condition.
- Actual post-assortment CVR at 1.5% and 2.0% is an assumption; no behavioral data exists at post-Wave A/B catalog scale. Real number will be available 3-4 weeks after Wave A/B launch with LogRocket active.
- CAC by channel (Meta vs Google) from the pre-pause $439/week spend is not in the fact base. Exact CAC is required to confirm whether reactivated paid spend clears the first-order gross margin threshold. Reconstruct from Stripe charges vs GA4 paid session data before relaunch.
- AOV by segment (Soul-Food Household vs Health-Forward Professional) does not exist because LogRocket is paused and Mailchimp audience is empty. This is required to brief the CRO operator. Capture from Stripe order history segmented by ZIP code as a proxy until LogRocket is back.
- The $15 cart minimum experiment requires a minimum session volume to reach 80% confidence. Current organic traffic level (paid paused, Mailchimp audience empty) is not quantified in the fact base. Confirm weekly organic session count from GA4 before scheduling the test.
- Wave A and Wave B sourcing costs (vendor pricing, minimum order quantities, cold-chain freight for soul-food proteins) are estimated at $43K-$72K combined but the actual vendor quotes are not in the fact base. Anthony and Zoe need signed vendor agreements with unit costs to confirm the inventory investment and margin assumption.
- Actual Whole Foods and Aldi shelf prices for collards, okra, cornmeal, black-eyed peas, bananas, onions, and tomatoes in Hyde Park and the south suburbs have not been audited. The 'cleaner than Whole Foods, cheaper than Aldi' positioning is unvalidated. Required before Wave A pricing is set.
- EXP-002 daily delivery painted-door test results are not in the fact base. The real routing capacity (how many days per week can be reliably served) determines the customer-facing SLA and directly affects the Soul-Food Household retention model. Zoe must surface this by Week 4.
- Repeat purchase rate baseline does not exist (one grandfathered subscriber is not a rate). The 25% 30-day repeat rate target is a labeled assumption benchmarked from urban food-DTC norms. First real measurement is available 30 days after Wave A/B launch.
- Actual CAC from pre-pause paid media campaigns (Meta + Google, ~$439/wk): without this, the claim that CAC exceeds first-order gross margin is a structural inference, not a measured fact.
- Post-assortment CVR baseline: no behavioral data exists on how the funnel performs at 80-100 SKUs because the catalog has never been that broad. The 1.5% CVR base-case assumption in the business case is directional only.
- Wave A and Wave B vendor pipeline status: which of the 1,025 contacts in Airtable base app3raEVB9kHeUoHE have been contacted, which have responded, and which have agreed to terms. No sourcing LOIs are confirmed in the fact base.
- EXP-002 actual driver routing data: what delivery days and ZIP codes can the team actually serve today, and how far does that fall short of the 'every day, citywide' customer promise.
- Live Whole Foods and Aldi shelf prices for Wave A soul-food SKUs (collards, okra, smoked cuts, cornmeal, black-eyed peas, oxtail): the 'cleaner than Whole Foods, cheaper than Aldi' claim is unvalidated against current shelf prices.
- Segment-level behavioral data (AOV by segment, repeat rate by segment, ATC rate by SKU): LogRocket is paused and Mailchimp audience is effectively empty, so no segment-level behavioral splits exist yet.
- Black-owned badge eligibility count: how many of the current 43 SKUs qualify for the badge and how many Wave A/B SKUs will qualify, so the badge coverage KPI can be set at a specific number rather than a percentage of an unknown denominator.
- Post-assortment behavioral baseline: no session-level segment data (ATC by segment, AOV by SKU, session-to-shop by entry page) exists because LogRocket is paused. This is the single most important data gap. It must be filled before any post-Wave A/B CVR conclusion is drawn.
- Run A Way Buckers Club capacity data: no confirmed volume ceiling, seasonal availability calendar, or exclusivity terms for Wave A soul-food SKUs. Without this, sourcing concentration risk cannot be quantified.
- Wave A and Wave B vendor pipeline: no identified backup suppliers under LOI. The two-backup-per-SKU requirement is a governance standard, not a current fact.
- Actual Whole Foods and Aldi shelf prices for soul-food SKUs in south-side Chicago ZIP codes: the 'cleaner than Whole Foods, cheaper than Aldi' positioning claim is unverified against live comparables. Price perception misalignment at Wave A launch could suppress conversion for the highest-priority segment.
- EXP-002 routing data: no published finding from the painted-door test on actual driver capacity by day of week. Until Zoe publishes a firm SLA, the daily delivery promise is a customer-facing claim without operational backing.
- Capital sequencing clarity: no confirmed ringfencing of the $43K-$72K inventory investment from the $400K SBA facility trigger cash reserve. A capital squeeze could force premature paid relaunch at the worst possible moment.
- Organic engagement threshold: the CEO-approved plan has no defined observable gate (repeat-session rate, first-30-day repeat order rate, email re-engagement signal) for the organic engagement evidence required before paid restart. This must be specified before the relaunch gate is finalized.
- CRO operator stack requirements: Barrel, Anatta, and Bear Group have not been asked whether they require Shopify. If any of the three is Shopify-dependent, the platform decision is coupled to the operator decision and must be resolved before the engagement window opens, not after.
- Post-assortment behavioral baselines: segment-level ATC rate, AOV by segment (Soul-Food Household vs Health-Forward Professional), session-to-shop rate by traffic source. None exist yet because LogRocket is paused and the expanded catalog is not live.
- Wave A and Wave B sourcing cost actuals: the $43K-$72K combined inventory estimate is an assumption. Actual unit costs, minimum order quantities, and lead times from backup suppliers are unknown until LOIs are signed.
- EXP-002 driver routing capacity data: the actual number of delivery days per week and routes per day Uncle Mays can fulfill is unpublished. Zoe's SLA will surface this.
- Whole Foods and Aldi shelf prices for Wave A soul-food SKUs: no live price check has been run. Required before Wave A list prices are set.
- CAC actuals: cost-per-acquisition from the pre-pause Meta and Google Ads spend is not in the fact base. Without this, the business case recoup timeline (8-14 weeks assumption) cannot be precisely validated.
- Repeat purchase rate and cohort retention data: no behavioral data exists on whether any first-time customers have returned. The single grandfathered subscriber (Doina, $55/wk) is the only longitudinal data point.
- Organic engagement baseline: no defined metric for minimum repeat-session rate, email open rate, or first-30-day repeat order rate that must be observed before paid restart. The CEO-approved plan requires this gate but it remains undefined.

---

# Appendix: Full Analyses by Phase

## 1. Diagnose

### situation-assessment

**Uncle Mays is a viable food-DTC brand held back by a single root cause: a 43-SKU produce-only catalog that cannot build the basket size paid shoppers need to convert, making every dollar of paid traffic wasted until assortment catches up.**

# Situation Assessment
## Uncle Mays Produce: E-Commerce Funnel + Product Mix Baseline
**As of 2026-06-07. Decision anchor: fix paid CVR from ~0.46% to food-DTC range (2-4%) by fixing the offer before restarting spend.**

---

## Executive Read

Uncle Mays is a differentiated brand with a coherent positioning (Black-farmed, affluent south-side Chicago, no food-desert framing) and a technically functional e-commerce stack. The business is not failing because of bad media buying, a broken checkout, or weak creative. It is failing because the catalog is too narrow to absorb paid traffic. A shopper arriving from a Meta or Google ad encounters 43 SKUs concentrated in greens, roots, and a handful of proteins. They cannot build a complete grocery run. The $20 cart minimum exists but a meaningful basket, say $40-60, requires stacking multiple produce items because snacks, pantry staples, prepared foods, beverages, and broader protein are entirely absent. This drives the 5.5% add-to-cart rate and the 0.46% paid CVR. The CEO diagnosed this correctly and the 6-phase product-mix reset is the right first move. The strategic risk now is executing the reset without clear re-entry criteria for paid spend, and allowing the organizational bandwidth consumed by the SAFE capital raise to delay the assortment work that unlocks everything else.

---

## Fact Base

| Area | Evidence | Interpretation | Confidence |
|---|---|---|---|
| Paid conversion | 0.46% measured 2026-05-11 | 4-8x below 2-4% food-DTC benchmark. Statistically significant underperformance, not noise. | HIGH (direct measurement) |
| Funnel drop at browse | /shop reach 25% of sessions; ATC 5.5% of those reaching /shop | The offer is failing before checkout is tested. Visitors are not browsing, not adding. This is an offer and assortment problem, not a checkout UX problem. | HIGH (direct measurement) |
| Catalog depth | 43 active SKUs (47 total): Greens ~14, Roots ~12, Pantry ~10, Microgreens ~6, Protein ~5 | Single-category depth, no cross-category breadth. Snacks, prepared/heat-and-eat, dry goods, beverages, non-food entirely absent. Basket-building is structurally impossible for a full grocery run. | HIGH (Airtable catalog) |
| Single farm supplier | Run A Way Buckers Club (Pembroke, IL) covers produce core + pastured proteins | Supply concentration is a sourcing risk and a catalog ceiling. Expanding assortment requires adding new supplier relationships. | HIGH (fact base) |
| Supplier sourcing pipeline | 1,025-row Airtable base (app3raEVB9kHeUoHE) is a vendor pipeline, NOT live inventory | No hidden SKUs. The sourcing gap is real, not a filter bug or code issue. | HIGH (confirmed 2026-05-16) |
| Pricing | Build-your-own, $20 minimum, typical first cart $30-60 | Minimum is achievable but the $40-60 basket target requires stacking produce-only items. No anchor SKU (e.g., $15-25 pantry staple bundle) to lift AOV without adding items. | MEDIUM (inferred from price list; actual AOV not given) |
| Active promo codes | None as of 2026-05-18 (FRESH10/FRESH30 retired) | Deliberate isolation of conversion signal. Correct diagnostic move. Promo codes are a future lever, not a current gap. | HIGH |
| Paid media spend | ~$439/wk pre-pause ($377 Meta, $62 Google Ads). Paused 2026-05-16. | Spend was modest but non-trivial. Pausing before fixing the offer is the right sequence. Restarting without new SKUs would repeat the same result. | HIGH |
| Delivery promise | "Every day, customer-picks window" live on site. EXP-002 painted-door test running. | Customer promise is ahead of operational reality. Fulfillment trust gap could suppress repeat purchase even after assortment improves. | MEDIUM (operational caveat noted in fact base) |
| Service area | South-side Chicago + Loop + Pilsen + south suburbs. North-side and far-west ZIPs not served. | Addressable paid audience is geographically constrained. Meta and Google targeting must exclude non-served ZIPs or CAC inflates from unconvertible impressions. | HIGH |
| Demand signal (survey) | 97% intent-to-shop, 89.6% referral intent (100+ surveyed) | Directional confidence only. Stated intent does not predict behavioral conversion. These numbers are not usable as conversion benchmarks. | LOW as behavioral evidence (HIGH as directional signal) |
| Revenue + margin projections | $6.3M Year-1 revenue, 35% gross margin, 15.3% EBITDA (stabilized), 33% 5-year IRR | Projections, not realized results. The only realized behavioral data is the funnel metrics above. Do not use these to anchor CRO or assortment ROI estimates. | LOW confidence as current-state data |
| Capital raise context | $400-750K SAFE (5M cap, 20% discount). Apollo outreach idle (OAuth revoked). SBA conditional approval in place. | Capital raise is a parallel track. It does not unblock the assortment work, which requires sourcing relationships and inventory, not equity (<=250K USD initial inventory per CEO). | MEDIUM (raise status is a constraint on bandwidth, not budget for e-commerce) |
| Tech stack | Custom Next.js + Stripe PaymentElement (embedded, not hosted) + Airtable catalog + Trigger.dev + Resend + Mailchimp (audience effectively empty) | Stack is functional and flexible. The decision to stay or migrate to headless Shopify is open and should not be resolved until post-assortment baseline behavioral data exists. | HIGH |
| LogRocket/Galileo analytics | Subscription paused ~2 weeks as of 2026-05-28. Code, dbt, BQ intact. One env var toggle restores it. | Product analytics are dark during the most critical diagnostic window. Restoring LogRocket is a day-1 action for the next phase. | HIGH |
| Product-mix reset plan | 6 phases, CEO-approved 2026-05-16. Locked decisions include wholesale commodity staples (Wave B), specialty rail demotion, Black-owned personal care (Wave E). | Plan is directionally correct and properly sequenced. Missing: explicit behavioral re-entry gates (ATC rate, session-to-shop rate, repeat purchase target) before paid ads restart. | HIGH |
| CRO/UX operator consideration | Shortlist: Barrel, Anatta, Bear Group. $50-120K for 90-day trial. Platform decision coupled to hire. | Premature. No operator can improve on a 43-SKU catalog. Brief the operator against post-assortment data, not pre-assortment data. | MEDIUM |

---

## Momentum Signals

| Signal | Direction | Why It Matters |
|---|---|---|
| Paid ads paused (2026-05-16) | Neutral/positive | Stops wasting spend against a broken offer. Buys time for the product-mix reset. But organic traffic is thin and Mailchimp audience is near-zero, so behavioral data is now scarce. |
| 6-phase product-mix reset in motion | Positive | CEO root-cause diagnosis is correct. Execution pace is the gating variable. |
| Black-owned badge wired in code, no SKU rendering it | Flat | A differentiation asset exists but is invisible to shoppers. First new Black-owned SKU activated will immediately prove or disprove the badge as a conversion lever. |
| Single grandfathered subscriber (Doina, $55/wk) | Neutral | One repeat-purchase data point. Not a trend. Subscription model is intentionally paused. |
| LogRocket/Galileo paused | Negative | Product analytics dark during a critical fix window. Every week without session data is a week without learnings from organic visitors. |
| Mailchimp audience near-zero (3 members) | Negative | Newsletter re-engagement channel is effectively offline. Organic traffic that does not convert cannot be re-engaged via email. |
| Apollo investor outreach idle | Negative for capital raise, neutral for e-commerce | Does not directly affect funnel fix, but competes for CEO/COO bandwidth. |
| EXP-002 painted-door delivery test running | Positive | Operational honesty about delivery capacity. Shows the team is testing before scaling. But results are unknown, creating the fulfillment trust gap risk. |
| No active promo codes | Positive (diagnostic) | Clean baseline for post-assortment conversion measurement. Reintroducing promos too early would re-introduce the confound. |

---

## Strategic Issues

1. **The offer does not match the occasion.** Paid shoppers arrive expecting to fill a meaningful grocery basket. A 43-SKU produce-only catalog cannot support a $40-60 basket without forcing customers to over-index on greens and roots. Until snacks, pantry staples, prepared foods, and broader proteins are live with 10+ merchandised SKUs each, paid traffic will continue to convert at or below 0.46% regardless of ad creative, targeting, or checkout UX improvements.

2. **The product-mix reset lacks behavioral re-entry criteria.** The 6-phase plan correctly sequences offer-fix before spend-restart, but the current re-entry trigger is qualitative ("at least 1 new category live with 10+ SKUs plus organic engagement evidence"). Without explicit numeric gates (e.g., session-to-shop rate >40%, ATC rate >12%, organic repeat purchase rate >15% within 30 days), the team risks restarting paid spend too early or too late, with no shared definition of "ready."

3. **Product analytics are dark at the worst possible moment.** LogRocket and Galileo are paused precisely when the team needs session-level visibility into which SKUs shoppers browse, where they drop, and whether new categories lift ATC. Restoring the subscription is a low-effort, high-return action that should happen before any new SKUs go live, so the first cohort of post-assortment visitors is fully instrumented.

4. **Operational delivery credibility is unresolved.** The "every day, customer-picks window" promise is the most important trust signal for a premium fresh-grocery brand. If EXP-002 reveals the team cannot reliably execute daily delivery, the promise must be revised before paid spend restarts. A conversion rate improvement built on a promise the operation cannot keep will result in refund volume and churn that erases the CVR gains.

5. **Bandwidth is split across three simultaneous priorities.** The product-mix reset (Anthony + Zoe joint ownership), the SAFE capital raise (Apollo idle, investor outreach needs OAuth fix), and the CRO/UX operator evaluation are all active at the same time. Each individually requires senior decision-maker time. The sequencing risk is that the capital raise urgency crowds out the assortment work, which is the only lever that changes the e-commerce trajectory.

6. **The CRO/UX operator and platform decisions are premature.** Barrel, Anatta, and Bear Group are legitimate operators, but their value proposition is optimizing a working funnel, not diagnosing an offer gap. Any operator hired today would correctly identify the assortment problem within week 1 and spend the remainder of the 90-day trial waiting for SKUs. The $50-120K engagement cost and the platform migration risk should be deferred until at least two new categories are live and a post-assortment behavioral baseline exists.

---

## Open Questions

**Must answer before committing to the next phase of the reset:**

1. What are the specific behavioral thresholds that define "the offer is ready to support paid spend"? (session-to-shop rate, ATC rate, repeat purchase rate, AOV target.) Without these, the paid-ads re-entry decision will be made on feel, not data.

2. What is the actual realized AOV from the orders placed before the paid-ads pause? This is the single most important missing number. If realized AOV is below $35, the $20 minimum and build-your-own format are constraining basket size even for motivated shoppers. If realized AOV is $50+, the conversion problem is purely top-of-funnel (offer recognition, not basket mechanics).

3. What did EXP-002 reveal about delivery capacity? Can the operation reliably execute daily delivery across the full service area today, or is the "every day" promise still aspirational?

4. How long will the product-mix reset (Waves B through E) take to execute given Anthony + Zoe joint sourcing ownership, no Numerator data, and the <=250K initial inventory budget? A realistic timeline with milestones is needed to prevent the capital raise from crowding it out.

5. Is there a re-engagement path for the organic visitors who have been arriving since the paid-ads pause but are not converting? With Mailchimp near-zero and LogRocket dark, there is currently no mechanism to learn from or re-reach this traffic.

6. What is the actual distribution of sessions by ZIP code or neighborhood? Knowing whether traffic is concentrated in served ZIPs or leaking in from non-served areas would materially change the media targeting brief when spend restarts.

7. Before evaluating headless Shopify migration: what specific checkout or catalog behaviors has the current Next.js stack blocked that a new platform would solve? If the answer is "none yet identified," the migration discussion should be deferred until post-assortment data surfaces a stack-level constraint.


_Data gaps: Realized AOV from orders placed before the 2026-05-16 paid-ads pause: this is the most critical missing number for diagnosing whether the basket mechanics are broken or whether the problem is purely top-of-funnel.; Actual session-to-shop rate and ATC rate from organic traffic post-pause (2026-05-16 to 2026-06-07): needed to separate media-driven traffic quality issues from site-side offer issues.; EXP-002 painted-door test results: can the operation reliably execute daily delivery across the full service area today?; ZIP-level or neighborhood breakdown of sessions and orders: are paid impressions reaching served ZIPs or leaking to non-served areas (Lincoln Park, Lakeview, Austin)?; Repeat purchase rate from non-subscription customers: how many customers placed a second order within 30 days? This is the only behavioral proof of product-market fit the business currently has.; Actual number of orders placed (unit count, not just revenue) before the paid-ads pause: needed to assess statistical significance of the 0.46% CVR measurement.; Timeline and milestone plan for the 6-phase product-mix reset: how many weeks until Wave B (commodity staples) and Wave E (Black-owned personal care) are live with 10+ merchandised SKUs each?; Black-owned vendor coverage in the sourcing pipeline (app3raEVB9kHeUoHE): what percentage of the 1,025-row pipeline are Black-owned, and how many are in the categories (snacks, pantry, prepared) that are currently absent?_

### growth-barriers

**The binding constraint on Uncle Mays paid conversion is not the funnel mechanics or the media spend: it is a 43-SKU produce-only catalog that makes basket completion impossible for the paid shopper it is attracting, and until at least two new high-demand categories are live with 10+ merchandised SKUs each, every other funnel fix is treating symptoms.**

# Growth Barrier Diagnosis

## Growth Gap

**Target:** Paid conversion in the 2-4% food-DTC benchmark range (at minimum 2%, call it a 4x lift from current).

**Current:** ~0.46% paid CVR measured 2026-05-11. Paid ads paused 2026-05-16, so the CVR measurement is the last reliable signal. Pre-pause spend was ~$439/week ($377 Meta across 4 campaigns + $62 Google Ads).

**Gap magnitude:** At 0.46% and $439/week in spend, the business is generating roughly 1 paid conversion per $50-100 in ad spend (assumption: average CPC $0.50-1.50 on Meta/Google food audiences, implying ~300-900 paid clicks per week, of which 1-4 convert). At 2% CVR with the same spend, that would be 6-18 paid conversions per week, a 4-8x improvement in revenue-per-ad-dollar. The gap is not marginal. It is structural.

**Why growth is stalled:** Uncle Mays is spending money to acquire shoppers who land, cannot build a satisfying basket from 43 SKUs spanning produce and a handful of proteins, and leave. The funnel does not have a checkout problem. It has an offer problem that makes every funnel stage look broken.

---

## Driver Tree

Growth in paid e-commerce revenue is the product of four sequential rates:

```
Paid Revenue = 
  Paid Visitors
  x Session-to-Shop Rate          (currently ~25%)
  x Shop-to-Add-to-Cart Rate      (currently ~5.5%)
  x Add-to-Cart-to-Purchase Rate  (not separately reported; implied ~33% if CVR is 0.46% / (25% x 5.5%) = ~33%)
  x Average Order Value           (estimated $30-60 based on anchor prices)
```

Breaking the tree into its demand-side and supply-side components:

**Demand side (can be influenced by media + positioning):**
- Paid visitor volume: suppressed by paused spend (deliberate)
- Audience-offer match: how well the target audience (south-side Black households, WTP-positive) is matched to what is actually for sale today (produce + proteins)

**Supply side (owned entirely by Uncle Mays):**
- Catalog depth: 43 SKUs, produce-only with thin protein and pantry
- Basket completability: can a shopper fill a $30-60 order they feel good about?
- Pricing anchors: $3 kale, $5 pea shoots, $10 lamb chops (thin spread, produce-skewed)
- Delivery credibility: daily promise vs. actual routing capacity (EXP-002 test unresolved)
- UX/navigation: what % of sessions reach /shop at all?

**Retention side (relevant post-conversion, currently near-zero):**
- Repeat purchase: one grandfathered subscriber; no behavioral repeat purchase data
- Recovery: Resend abandoned checkout sequences wired but audience is small
- Newsletter: Mailchimp audience effectively empty post-cleanup

---

## Barrier Assessment

| Driver | Evidence | Impact | Confidence | Root Cause or Symptom |
|---|---|---|---|---|
| Catalog depth (43 SKUs, produce-only) | CEO's own diagnosis: "an offering Anthony himself wouldn't buy." ATC of 5.5% on /shop confirms shoppers browse and leave. No snacks, no beverages, no heat-and-eat, no pantry staples. | Very high: this is the primary reason shoppers cannot convert | High | ROOT CAUSE |
| Session-to-/shop rate (25%) | 75% of paid visitors never see the product catalog. This is upstream of the assortment problem and compounds it. Could reflect homepage copy/CTA weakness, slow load, or mismatch between ad creative promise and landing experience. | High: even a perfect catalog cannot convert visitors who never see it | Medium (no session-level split by traffic source) | ROOT CAUSE (secondary, independent of assortment) |
| Add-to-cart rate (5.5%) | Given a 25% /shop reach, 5.5% ATC implies roughly 1.4% of all paid sessions add anything to cart. Shoppers who reach /shop are not finding a basket-filling offer. | Very high: this is where assortment inadequacy is most visible | High | SYMPTOM of catalog depth |
| Cart minimum at $20 | With a 3-item produce basket averaging $6-8 per item, the minimum is reachable but tight. With a $5 pea shoot and a $3 kale bunch, a shopper needs 3+ items. After assortment expands with lower-price-point pantry SKUs this becomes a harder blocker. | Medium today, high post-expansion | Medium | SYMPTOM, not today's binding constraint |
| Daily delivery promise vs. actual routing | EXP-002 painted-door test is still running. The customer-facing promise ("every day, you pick your window") may not always be fulfillable across all service-area ZIPs on all days. Trust damage from a missed or delayed delivery suppresses repeat purchase. | Medium for new acquisition, high for repeat | Medium (no delivery failure rate data available) | ROOT CAUSE for retention, symptom for CVR today |
| Checkout UX (Stripe Elements, custom Next.js) | The prior situation-assessment noted funnel breaks are upstream of checkout. There is no evidence of a Stripe-specific drop-off problem. UX flaws are possible but unproven without post-assortment behavioral data. | Low to medium as a standalone driver | Low (LogRocket/Galileo paused, no session-level data) | SYMPTOM, possibly not present |
| No active promo codes | FRESH10/FRESH30 retired 2026-05-18. Removing promos was deliberate to isolate conversion signal. At 0.46% CVR, the promo-off baseline is the right experimental choice pre-assortment relaunch. | Low: promos mask the real problem rather than fixing it | High | NOT a root cause |
| Paid media paused | Paused 2026-05-16 by design. Correct decision: spending on a broken offer is waste. | Zero CVR while paused is expected, not a problem | High | NOT a root cause |
| Audience targeting quality | No post-pause data on which audience segments drove the 0.46%. South-side Chicago, Black households, WTP-positive is the right ICP directionally. Whether Meta/Google was reaching that ICP at scale is unknown. | Medium: wrong audience would compound offer mismatch | Low (no audience-level CVR breakdown available) | POSSIBLE secondary root cause, data gap |
| Homepage-to-shop navigation | 75% of sessions do not reach /shop. This is independent of assortment and fixable with UX changes to the homepage CTA, above-the-fold copy, and visual merchandising. | High: structural leak that persists post-assortment | Medium (no heatmap or scroll data, LogRocket paused) | ROOT CAUSE (secondary) |

---

## Binding Constraint

**The binding constraint is offer inadequacy: a 43-SKU produce-only catalog that cannot support basket completion for the paid shopper Uncle Mays is acquiring.**

Here is why this is the true constraint and not a symptom:

1. **The funnel break is at ATC, not at checkout.** A 5.5% ATC rate on /shop means the vast majority of shoppers who see the catalog decide not to add anything. That decision happens at the product browse stage, before delivery UX, before pricing, before the cart minimum, and before Stripe. If the problem were checkout mechanics, you would see high ATC with low purchase completion. You see low ATC. That is an offer problem.

2. **No food-DTC brand at 43 SKUs in one category converts paid traffic at 2-4%.** The food-DTC benchmark assumes a catalog where a shopper can fill a meaningful basket (protein + produce + pantry + a snack or two). A $40 basket from Uncle Mays today requires buying produce AND a protein, which is a commitment most new visitors will not make on the first visit. The most accessible entry basket, 3 produce items, costs $7-10 and clears the $20 minimum but feels thin.

3. **The CEO's own diagnosis is correct and internally consistent.** "An offering Anthony himself wouldn't buy" is not a branding judgment. It is a basket-adequacy judgment. The 6-phase product-mix reset directly addresses the binding constraint.

4. **All other funnel metrics are downstream of this constraint.** The 25% /shop reach is a real secondary problem (homepage navigation), but fixing it without fixing the catalog would increase the number of shoppers who see a thin assortment and leave, not the number who convert. The two must be fixed together, but the catalog is the rate-limiting step.

**Secondary binding constraint: homepage-to-shop navigation.**

25% session-to-shop rate means 3 in 4 paid visitors never reach the catalog. This is independent of assortment and should be addressed in parallel. It is not the primary binding constraint because even if fixed to 60-70%, the ATC problem would persist until the catalog expands. But it is a structural leak that will suppress CVR at every stage of the roadmap, and it can be fixed with homepage copy and CTA changes that require no sourcing work.

---

## Recommended Actions

**1. Execute Phase 3 of the product-mix reset with explicit category prioritization before any other funnel work.**

The three categories with the highest basket-completion lift and lowest sourcing complexity are: (a) dry pantry staples (oils, spices, grains, beans beyond current SKUs), (b) snacks (trail mix, dried fruit, chips from Black-owned brands), and (c) beverages (juices, teas, drinks from Black-owned brands). These categories close the basket gap without requiring cold-chain sourcing agreements. They also have the most favorable margin profiles (60-70% gross margin for shelf-stable goods vs. 20-30% for fresh produce). The consumption research in Phase 3 should rank categories by basket-completion contribution, not by ideological fit alone. "What do south-side households buy alongside fresh produce" is the research question, not "what is the most interesting Black-farmed item."

Target: 10+ new SKUs live across at least 2 new categories before paid relaunch. The CEO-approved Wave B (commodity staples like bananas) and Wave E (Black-owned personal care) are correct expansions but should not delay the faster-to-source pantry and snack categories.

**2. Fix the homepage-to-/shop navigation gap in parallel with catalog sourcing.**

A 25% session-to-shop rate is a separate problem from assortment, and it is fixable now without waiting for new SKUs. Specific changes to test: (a) make the primary CTA on the homepage ("Shop Now" or equivalent) the dominant above-the-fold action, (b) add a merchandise preview (3-5 hero SKUs with photos and prices) on the homepage so shoppers can see what they are buying before clicking through, (c) audit the mobile homepage experience (assumption: majority of Meta/Instagram paid traffic arrives on mobile). None of these require new sourcing. They require 1-2 weeks of design and development work. Run with LogRocket/Galileo re-enabled to measure the change.

Target: session-to-/shop rate above 40% within 30 days of implementing homepage changes.

**3. Establish hard relaunch gates before reactivating paid spend.**

The current plan lacks explicit thresholds. The engagement recommends three simultaneous gates, all of which must be cleared before paid budgets resume:

- Gate 1 (Offer): At least 2 new categories live, each with 10+ merchandised SKUs, and the Black-owned badge rendering on at least 5 SKUs.
- Gate 2 (Funnel): Session-to-/shop rate above 40% AND add-to-cart rate above 12% (both measured over at least 500 organic/newsletter sessions, not paid, to avoid spend confounds).
- Gate 3 (Fulfillment credibility): EXP-002 painted-door test resolved. Delivery promise reflects actual routing capacity. If every-day delivery is not yet operationally solid, the landing page must reflect the true SLA.

Once all three gates are cleared, reactivate Meta first (existing campaigns, $100-150/day test budget) and measure CVR over 2 weeks before scaling. Reactivate Google Ads second. Hire the CRO/UX operator only after the first post-relaunch CVR measurement is available, so the operator has a real baseline to work from.

**4. Resolve the delivery promise before paid relaunch, not after.**

The EXP-002 painted-door test is still running as of 2026-06-07. If the customer-facing promise says "every day, you pick your window" but actual driver routing cannot cover all service-area ZIPs on all days, the first cohort of paid conversions will experience broken promises, file refund requests under the freshness guarantee, and not return. One bad fulfillment experience from a paid acquisition costs not just the $50-100 in ad spend to acquire that customer but also the word-of-mouth downside in a tight south-side community network. Close or resolve EXP-002 before paid relaunch. Set a realistic SLA (even if it is "5 days per week" initially) and make that the customer-facing promise.


_Data gaps: Session-level CVR split by traffic source (Meta vs. Google vs. organic vs. direct): cannot confirm whether 0.46% applies equally to all sources or is driven by a single misfiring audience; Post-/shop scroll and click behavior: no heatmap or session replay data available (LogRocket/Galileo paused), so homepage-to-shop navigation hypothesis is inferred from session rates, not observed user behavior; Add-to-cart rate split by SKU category: do visitors who reach /shop add produce, proteins, or neither? This determines which specific catalog gaps are most acute; Delivery fulfillment rate by ZIP and day of week: needed to quantify the delivery trust risk before paid relaunch; Repeat purchase rate among the small cohort of actual purchasers (excluding the grandfathered subscriber): the only behavioral proof of retention is Doina's one subscription; Basket size distribution among completers: knowing whether paid converters are buying the minimum viable basket or a fuller cart clarifies whether the $20 minimum is a friction point post-assortment expansion; Competitive basket analysis for south-side Chicago: what a comparable Whole Foods, Mariano's, or Instacart basket looks like in price and SKU count for the same household profile, to anchor the category gap against a real alternative_

### assumption-audit

**The 6-phase product-mix reset rests on five load-bearing assumptions that are currently unproven at behavioral scale, and two of them (assortment as the primary conversion driver, and Black-farmed sourcing capacity) could individually invalidate the entire plan if wrong.**

# Assumption Audit

## Strategy Being Tested

Fix Uncle Mays' e-commerce funnel and product mix to lift paid conversion from ~0.46% into the 2-4% food-DTC benchmark. The plan under audit is the CEO-approved 6-phase product-mix reset: pause paid ads, audit SKUs, run consumption research, perform gap analysis, build sourcing roadmap, expand catalog to at least one new category with 10+ SKUs and organic-engagement evidence, then restart paid. The anchor question every assumption must serve: does this sequence of moves actually fix conversion, and what has to be true for it to work?

---

## Assumption Register

| Assumption | Category | Importance | Evidence Strength | Risk |
|---|---|---|---|---|
| Narrow assortment (43 SKUs, produce-only) is the primary driver of 0.46% paid CVR and 5.5% ATC rate | Customer / Market | Critical | Moderate (CEO hypothesis, supported by browse-stage funnel break; checkout UX and trust gaps not yet ruled out) | High: if UX or trust is equally responsible, the reset delivers new SKUs into the same broken funnel |
| Black-owned / Black-farmed sourcing can reach sufficient catalog density (Wave B staples + Wave E personal care) within the reset timeline | Operational | Critical | Low (currently one farm supplier; no sourcing commitments for Wave B/E categories) | High: sourcing bottleneck delays the relaunch trigger and strands the paid ads pause |
| The 97% intent-to-shop survey translates to actual cart-building at 30-60 USD AOV when the catalog is expanded | Customer | High | Very Low (survey, not behavioral; no repeat purchase data except one grandfathered sub) | High: survey intent is a notoriously weak predictor of online grocery conversion |
| Current price points deliver on "cleaner than Whole Foods, cheaper than Aldi" in a way that is perceptible and verifiable to the shopper | Market / Customer | High | Low (no documented shelf-price comparison; claim is asserted, not tested) | High: if shoppers do not perceive the price advantage, positioning fails regardless of assortment width |
| Daily delivery can be operationally delivered at scale (the "every day" customer-facing promise) | Operational | High | Low (EXP-002 painted-door test still running; actual routing capacity is a subset of the promise) | High: a fulfillment trust gap suppresses repeat purchase even after assortment improves |
| Adding 10+ SKUs in one new category will produce measurable organic-engagement evidence sufficient to justify paid relaunch | Market | High | Low (threshold is undefined; no baseline for what "organic engagement evidence" means in sessions, ATC, or repeat rate) | Medium: without a defined gate, teams will either launch paid too early or never have a clear green light |
| A 35% gross margin is achievable at the SKU level when Wave B commodity staples (bananas, bulk dry goods) are added alongside Black-farmed specialty produce | Economic | High | Low (35% is a projection for the physical flagship, not the live e-commerce channel; commodity produce margins are typically 15-25%) | High: blending commodity SKUs at lower margins may drag blended margin well below 35% and alter the unit economics case |
| Deferring CRO/UX operator hire and platform migration until post-assortment is safe (the current Next.js stack will not become a constraint) | Organizational / Operational | Medium | Moderate (funnel break appears to be upstream of checkout UX; but checkout UX is untested at scale) | Medium: if checkout UX is a co-equal constraint, deferring the operator hire adds 60-90 days to the fix timeline |
| The Black-owned supplier badge will meaningfully differentiate the offer and support a premium-price perception | Market / Customer | Medium | Very Low (badge is wired but inert; no A/B data; no comparable data from other Black-owned grocery brands) | Medium: badge may not move conversion without proof of sourcing provenance presented in a compelling UX |
| Mailchimp newsletter audience (currently near-empty) and organic social can provide meaningful traffic for the organic-engagement test before paid restarts | Market | Medium | Low (3 Mailchimp members as of last check; social audience size and engagement not documented in fact base) | Medium: if organic channels cannot drive sufficient traffic to test assortment, the gating condition cannot be evaluated |
| The 20 USD minimum cart threshold does not itself suppress conversion below what it would otherwise be | Customer | Medium | Low (no A/B test; minimum is structural, not evidence-based) | Medium: a 20 USD floor may exclude low-intent or trial-behavior shoppers who would have converted at a lower amount and reordered |
| The south-side Chicago / south-suburb service area contains enough high-intent households to support paid CAC payback at the planned AOV | Market | Medium | Low (97% survey directional; no behavioral demand density map by ZIP) | Medium: if demand is thin in the serviceable ZIPs, CAC will be too high to support the economics regardless of CVR improvement |

---

## Load-Bearing Assumptions

**1. Assortment breadth is the primary (not just a) conversion driver.**

This is the CEO root hypothesis and the entire 6-phase plan is structured around it. If it is correct, fixing the catalog fixes the funnel. If checkout UX, delivery trust signals, or price-perception gaps carry equal or greater weight in suppressing CVR, the reset will deliver new SKUs into a funnel that still does not convert, and the team will have spent sourcing budget and 90-120 days without a conversion lift. The current evidence is consistent with the hypothesis (funnel breaks at browse stage, not at payment), but it does not rule out co-equal UX failures. This assumption must be partially tested before the full sourcing investment is committed.

**2. Black-farmed / Black-owned sourcing can scale to meaningful catalog density within the reset timeline.**

The current catalog rests on a single supplier (Run A Way Buckers Club, Pembroke IL). Wave B adds commodity staples (bananas, bulk pantry) and Wave E adds personal care. Neither category has announced sourcing commitments. Black-owned sourcing for commodity produce is structurally harder than specialty: commodity margins are thinner, minimum order quantities are higher, and the supplier base is smaller. If sourcing takes 6+ months to reach 10+ merchandised SKUs in even one new category, the paid-ads pause becomes an extended blackout with no revenue-generating activity and no behavioral data.

**3. The 97% intent-to-shop survey translates to actual cart-building at 30-60 USD AOV.**

This is the demand foundation for the entire business. Online grocery is one of the highest-intent, lowest-conversion retail categories. Survey intent in food is well-documented to overstate behavioral conversion by 3-5x. The one behavioral proof point (one grandfathered $55/wk subscriber, currently no active subscriptions) is a sample of one. The assumption that the 100+ surveyed consumers will build carts in the 30-60 USD range when given an expanded catalog is the single most important unvalidated belief in the system.

**4. The daily delivery promise is operationally sustainable without creating a fulfillment trust gap.**

The customer-facing promise of "every day, customer-picked window" is running ahead of verified routing capacity. If the painted-door test (EXP-002) reveals that the team can only reliably route 3-4 days per week, and customers experience slot unavailability or late delivery after being promised daily windows, the trust gap will suppress repeat purchase independently of how good the catalog becomes. In online grocery, fulfillment reliability is a top-3 driver of repeat purchase; it is not a secondary concern.

**5. The blended gross margin target is achievable when commodity staples are added.**

The 35% gross margin target is a projection for the planned physical flagship, not a measured outcome from the live e-commerce channel. Adding Wave B commodity staples (bananas, bulk dry goods) changes the margin mix. Commodity produce typically runs 15-25% gross margin at retail, below the 35% target. The assumption that blending commodity SKUs with specialty Black-farmed produce and personal care will hold blended margin at 35% or above is unproven and could materially alter the unit economics case for both the e-commerce channel and the investor narrative.

---

## Test Plan

| Assumption | Test | Data Needed | Owner | Decision Trigger |
|---|---|---|---|---|
| Assortment is the primary CVR driver (vs. UX / trust) | Before full sourcing investment: run a "ghost SKU" or "coming soon" test. Add 10-15 placeholder cards (locked, not purchasable) in missing categories (snacks, heat-and-eat, beverages) and measure whether session-to-shop rate or ATC rate increases vs. the current catalog. This tests whether breadth-signal alone moves browse behavior. | Session-to-shop rate with vs. without placeholder SKUs, using the existing Next.js catalog; LogRocket session replays to observe scroll and click behavior (reactivate LogRocket for this test) | CTO (ghost SKU implementation), CEO (decision gate) | If ATC rate does not increase by at least 50% relative (from 5.5% toward 8%+) with placeholder cards showing, treat UX / trust as a co-equal constraint and pull in the CRO/UX operator earlier |
| Black-owned sourcing can reach 10+ SKUs in one new category within 90 days | Sourcing sprint with Zoe (COO): contact 5+ Black-owned distributors and co-ops in the Chicago metro for Wave B (commodity produce staples) within 30 days. Document MOQ, pricing, lead time, and Black-owned certifiability for each. | Supplier responses with MOQ, price, lead time, and certification status | Anthony (CEO) + Zoe (COO) | If fewer than 3 suppliers can deliver 10+ SKUs at acceptable margin and within 60 days, revise the reset timeline and investor narrative accordingly; consider whether a conventional distributor bridge (non-Black-owned, labeled honestly) is acceptable for Wave B while Black-owned sourcing scales |
| Survey intent converts to actual cart-building at 30-60 USD AOV | When the first new category (even a pilot batch of 5 SKUs) is live, run a closed beta with 50-100 of the 100+ surveyed consumers via direct email and text. Measure actual add-to-cart rate, average order value, and checkout completion. | Email / phone list from the original survey cohort; GA4 conversion events; Stripe orders | CEO (outreach), CTO (tracking) | If fewer than 10% of invited beta users complete a purchase, the behavioral demand signal is materially weaker than the survey suggests; revisit AOV assumptions and paid CAC targets before restarting spend |
| "Cleaner than Whole Foods, cheaper than Aldi" is perceptible and accurate at current prices | Build a side-by-side price comparison for the top 15 current SKUs (by sales volume or catalog prominence) against Whole Foods Chicago and Aldi Chicago shelf prices pulled from Instacart / store websites. Document where Uncle Mays is actually cheaper, at parity, or more expensive. | Current Uncle Mays prices (in catalog), Instacart / competitor shelf prices for equivalent SKUs | CEO or COO (30-minute research task, no paid tool needed) | If Uncle Mays is more expensive than Aldi on more than 30% of comparable SKUs, the tagline is misleading and must be revised before paid relaunch; if more expensive than Whole Foods on any SKU, remove that SKU from the price comparison claim |
| Daily delivery is operationally sustainable | Set a hard EXP-002 read-out date. By that date, document: how many days per week delivery slots are actually available for booking, average lead time, and on-time delivery rate for completed orders. | Slot availability data from the checkout booking system, delivery completion rate from driver logs or Stripe orders vs. booked slots | Anthony (CEO) + operations | If on-time delivery rate is below 90% or slot availability is below 5 days per week, pause the "every day" customer promise, update customer-facts.md and site copy to reflect actual availability, and treat this as a hard gate before paid relaunch |
| Blended gross margin holds at or near 35% when commodity SKUs are added | Model the blended gross margin for a representative basket (60 USD cart, mixed specialty + commodity + one protein) at supplier costs obtained in the sourcing sprint. Do not use the flagship store projection; build a SKU-level model for the e-commerce channel. | Supplier cost per unit for at least 10 commodity SKUs (from sourcing sprint), current landed cost for existing SKUs | CFO (Jua Mitchell) + COO | If the blended e-commerce gross margin model shows below 25% on a representative cart, revise the investor narrative and reconsider whether commodity staples should be sold at a loss-leader rate or excluded from the catalog; present revised projections before the next investor conversation |
| Organic channels can generate sufficient traffic to run a meaningful assortment test | Rebuild the Mailchimp audience from Stripe customers (export customer emails, import to Mailchimp), run one newsletter announcing the expanded catalog, and measure click-through to /shop. In parallel, post 3 organic social posts featuring new SKUs and measure sessions from social. | Stripe customer email export, Mailchimp campaign open + click rates, GA4 sessions by source/medium | CEO / CMO (Tara Weymon) | If the newsletter generates fewer than 200 clicks to /shop and organic social generates fewer than 100 sessions in the first week, organic channels cannot support the assortment test; a small paid spend (under 500 USD) should be used to drive test traffic before full paid relaunch |

---

## Recommendation

**Test first on two fronts simultaneously, then proceed.**

The 6-phase reset sequence is directionally correct, but two assumptions must be partially validated before the full sourcing investment is committed: (1) that assortment is the primary CVR driver rather than a co-equal one alongside UX and trust, and (2) that Black-owned sourcing can reach meaningful density within the reset timeline. Both tests can be run within 30 days without paid spend.

The ghost-SKU browse test (placeholder catalog cards, LogRocket reactivated) is a low-cost, high-signal experiment that can separate assortment signal from UX signal in 2-3 weeks. If it confirms the hypothesis, proceed to full sourcing investment with confidence. If it does not move ATC, pull in the CRO/UX operator 60-90 days earlier than planned, before sinking sourcing budget.

The sourcing sprint (CEO + COO, 30 days) converts the sourcing assumption from belief to evidence. If it succeeds, the reset timeline holds. If it reveals that Black-owned commodity sourcing takes 4-6 months, the plan must be replanned around a Wave A+ approach: deepen the existing specialty catalog and expand proteins first (lower sourcing friction), and delay commodity staples until sourcing is secured.

Do not restart paid ads until three gates are met: (a) at least one new category is live with 10+ SKUs, (b) the daily delivery promise is verified as operationally accurate, and (c) the price-comparison audit confirms the tagline is defensible. These are the three conditions where a paid click has a reasonable chance of converting.


_Data gaps: Funnel attribution split: what fraction of the 0.46% paid CVR gap is attributable to assortment vs. checkout UX vs. trust signals vs. price perception. Currently inferred but not measured.; Logged delivery slot availability and on-time delivery rate from EXP-002 (painted-door test results not yet read out).; SKU-level landed cost for the live catalog (needed to build a real blended gross margin model for the e-commerce channel, separate from the flagship store projection).; Shelf-price comparison: Uncle Mays current prices vs. Whole Foods Chicago and Aldi Chicago for equivalent SKUs (needed to verify the 'cleaner than Whole Foods, cheaper than Aldi' claim).; Email and contact list from the original 100+ consumer survey (needed to run a closed beta with the highest-intent demand signal the business currently has).; Black-owned distributor and co-op availability in the Chicago metro for Wave B (commodity produce staples) and Wave E (personal care): MOQ, pricing, lead time, and certification status.; Organic social account follower count, engagement rate, and historical traffic contribution (not documented in the fact base; needed to assess whether organic channels can support the assortment test).; Session data with LogRocket reactivated: scroll depth on /shop, rage clicks, drop-off points in checkout flow, and the specific moment shoppers exit. Currently PAUSED as of 2026-05-28.; Actual Mailchimp audience size post-cleanup (fact base says effectively empty; Stripe customer email count needed to estimate newsletter audience potential after re-import)._


## 2. Market Intel

### market-mapping

**Uncle Mays' serviceable online grocery market in south-side Chicago is a 38-62M USD annual opportunity, but 80% of that value sits in basket-completion categories (pantry staples, proteins, snacks, heat-and-eat) that the current 43-SKU catalog cannot capture, making assortment expansion the prerequisite to claiming any meaningful share.**

# Market Map

## Market Definition

**Decision question:** What is the realistically addressable online grocery market for Uncle Mays in south-side Chicago, how is it segmented by shopper need and wallet share, where is the white space the current 43-SKU catalog cannot capture, and what where-to-play choices follow?

**Boundary:** Online grocery delivery and pickup, south-side Chicago and south suburbs, households within Uncle Mays' current service area (south Chicago, Near South Side, Bronzeville, Hyde Park, Woodlawn, Chatham, South Shore, Pill Hill, Calumet Heights, south suburbs). This excludes north-side Chicago (Lincoln Park, Lakeview, not served), the national Black grocery TAM (not actionable for e-commerce fix), and the planned physical flagship (different economics, different timeline).

**Customer scope:** Households ordering grocery for at-home consumption. Primary target is Black households, but the service area also includes non-Black households who will convert on convenience + quality positioning.

**Time horizon:** 12-24 months, anchored to the product-mix reset and paid relaunch. The market map serves the offer design decision, not a 10-year rollout.

**Exclusions:** The 13.4B-20.4B SAM cited in investor materials is a national figure for Black household grocery spend. It is not actionable for the e-commerce funnel fix. This map deliberately scopes to the realistic SOM.

---

## Size Estimate

| Method | Logic | Estimate | Confidence |
|---|---|---|---|
| Top-down: service-area households x online capture | South-side Chicago + south suburbs service area: approximately 200,000-240,000 households (Census ACS 2022, ZCTA-level; the `census_acs_zip_20260502T183716Z.parquet` file on disk contains the underlying data). Median household grocery spend: approximately 570-620 USD/month (USDA LSRO 2023 thrifty-to-moderate cost of food, 2-4 person household, indexed to Chicago CPI). Online grocery channel share in urban Black-majority ZIPs: estimated 12-18% based on FMI Power of Foodservice 2023 (Black urban households adopt online grocery at slightly lower rates than white urban households but the gap is closing; 15% is the midpoint assumption). Annual addressable: 200K HH x 600 USD/month x 15% online x 12 = 216M USD total service-area online grocery. Uncle Mays' realistic achievable share at 2-3% market penetration in years 1-2: 4.3-6.5M USD. At 5% penetration (ambitious year 2): 10.8M USD. | 216M USD total service-area online grocery market; 4-11M USD realistic SOM at 2-5% share | Medium. Household count from Census is reliable. Monthly grocery spend and online share are assumptions labeled as such. |
| Bottom-up: target households x Uncle Mays AOV x order frequency | Behavioral conversion pathway: paid traffic resumes at 2,000-3,000 sessions/week (pre-pause level, assumption); at a restored 2% paid CVR (target after product mix fix), that yields 40-60 conversions/week. At 45 USD AOV (midpoint of 30-60 USD stated range), weekly revenue: 1,800-2,700 USD. Annualized: 94K-140K USD from paid alone. Add organic, repeat, and referral at 2x paid (rough urban DTC multiplier): 280K-420K USD year 1. At 3x repeat multiplier after catalog matures: 560K-840K USD. This is the near-term revenue range, not the market size. | 280K-840K USD realistic year-1 revenue range from current paid+organic traffic at target CVR. Scales to 2-4M USD if weekly paid traffic grows 5-10x and repeat rate holds above 30%. | Medium-low. AOV, traffic level, and repeat rate are all assumptions; no post-assortment behavioral data exists yet. |
| Cross-check: comparable urban food-DTC operators | Direct Eats (Chicago, shuttered 2020) reportedly served ~4,000 weekly customers in its peak year at 60-80 USD AOV. Imperfect Produce Chicago (now Misfits Market) served ~8,000 Chicago households at peak. Both operated with 200-400 SKUs. Uncle Mays at 100 SKUs with Black-farmed positioning could plausibly reach 500-1,500 weekly active households in year 2, yielding 1.5-4.5M USD annual revenue. This is consistent with the bottom-up range. | Comparable operator range: 1.5-4.5M USD annual revenue at modest scale | Low-medium. Comps are imperfect (different eras, different funding) but directionally consistent. |

**Synthesis:** The service-area online grocery market is large enough (200M+ USD) that even 2-3% share is a viable business. The near-term revenue constraint is not market size but Uncle Mays' ability to convert sessions into baskets, which requires the catalog fix. The 4-11M USD SOM is achievable in a 2-3 year window with full catalog (100+ SKUs) and restored paid spend. Year-1 revenue of 280K-840K USD is the realistic range given current traffic levels and the product-mix reset timeline.

---

## Segment Map

The market is segmented by primary shopper need and basket behavior, not by demographics alone. Four segments exist within the service area. They are MECE by primary purchase driver.

| Segment | Est. Size (service area, annual USD) | Growth | Profitability | Competition | Attractiveness for Uncle Mays |
|---|---|---|---|---|---|
| **Weekly Staples Buyer** (produce + pantry + protein as routine household replenishment, 60-100 USD basket, 1-2x/week frequency) | 110-130M USD (largest segment; 50-60% of total service-area online grocery wallet) | Moderate (4-6% YoY, online channel gaining share from brick-and-mortar) | High per order (large basket), but requires broad assortment: 80+ SKUs minimum to fill a basket without friction. Uncle Mays currently cannot serve this segment. | Instacart (Mariano's, Aldi, Whole Foods delivery), Amazon Fresh (limited south-side coverage), Walmart+ (south-side locations). All serve the staples need but without Black-farmed differentiation or Black-owned badge. | High potential, currently zero Uncle Mays capture. Wave B (commodity staples + Black-owned badge) directly targets this segment. Cannot be activated without 40+ new SKUs in pantry, protein, dairy-adjacent. |
| **Specialty / Mission Buyer** (Black-farmed, organic, specialty produce as a deliberate choice, 30-60 USD basket, 1-2x/month frequency) | 12-18M USD (estimated 6-8% of service-area online grocery; smaller but high-margin segment) | High (8-12% YoY; cultural food movement, Black-owned business support accelerating post-2020) | Very high gross margin potential (30-45% on specialty SKUs per CEO projections). Willingness to pay premium. | Direct Eats (gone). FreshDirect (not Chicago). Weekly CSA boxes (limited Black-farmed supply). No credible Black-farmed online grocer in south Chicago today. | Uncle Mays' current 43-SKU catalog already serves this segment, but it is too small to sustain a business alone. This is the beachhead, not the destination. The 97% survey intent likely comes from this segment. |
| **Prepared / Heat-and-Eat Buyer** (ready meals, marinated proteins, meal kits, high convenience, 25-50 USD basket, 2-4x/month frequency) | 30-45M USD (estimated 14-20% of service-area online grocery; accelerating with time-constrained urban households) | Very high (10-15% YoY; fastest-growing urban food-DTC segment nationally per FMI 2024 data) | High margin on prepared items (30-50%). High repeat rate. Low price sensitivity if quality is positioned correctly. | GrubHub/DoorDash (restaurant delivery, not grocery), Snap Kitchen (no south-side presence), meal kit services (Blue Apron, etc., declining). No heat-and-eat Black-culinary-focused online grocer in south Chicago. | Very high white space. Wave E (personal care) is planned; heat-and-eat is not yet in the wave plan but is the highest-frequency repeat driver. Adding 8-12 prepared SKUs (marinated proteins, seasoning kits, heat-and-eat sides) would materially lift repeat rate before personal care. |
| **Snack / Impulse / Top-Up Buyer** (single-category top-up, snacks, beverages, specialty pantry, 15-30 USD basket, 1-3x/month frequency) | 18-25M USD (estimated 8-12% of service-area online grocery) | Moderate-High (6-10% YoY) | Moderate margin. High volume. Critical for basket completion because these SKUs lower the effective cart-building friction (low unit price, easy add). | Gopuff (strong south-side Chicago presence, convenience-store model), Amazon (Prime Now, fast delivery). Both lack Black-owned positioning. | High for basket-fill function: adding 10-15 snack and pantry-staple SKUs directly solves the cart-building problem identified in growth-barriers phase. Not a standalone segment win but essential to unblock conversion across all segments. |

---

## White Space

**Primary white space: Black-farmed + commodity staples + build-your-own, south-side delivery, no subscription lock-in.**

No online grocer in south-side Chicago currently combines: (1) verified Black-farmed sourcing with a visible badge, (2) commodity staples alongside specialty produce, (3) a build-your-own cart (no fixed box, no subscription), and (4) same-day or next-day window selection. Instacart and Amazon Fresh have the staples and the delivery infrastructure but zero Black-farmed differentiation. CSA boxes have the sourcing story but no build-your-own flexibility and no staples. This intersection is genuinely unoccupied.

**Secondary white space: Black-culinary heat-and-eat.**

No online grocer in south-side Chicago serves pre-marinated or seasoned proteins, heat-and-eat sides (collard greens, mac and cheese, black-eyed peas), or curated meal prep kits rooted in Black American culinary tradition. This is a distinct need from generic meal kits (Blue Apron) and from restaurant delivery (Grubhub). If Uncle Mays adds 8-12 SKUs in this space before a competitor does, it creates a repeat-purchase anchor that neither Instacart nor Amazon can replicate with their supplier base.

**Tertiary white space: Black-owned personal care, bundled with grocery.**

Wave E (Black-owned soaps, batana hair oil, skin/hair care) is a real white space in the sense that no grocery delivery operator in south Chicago currently bundles personal care with produce. The risk is operational: personal care adds SKU complexity, packaging requirements, and supplier sourcing that compete for the same bandwidth as the more conversion-critical food categories. This white space is real but lower priority than the staples and prepared categories for the funnel fix.

**Non-white-space (contested, do not enter yet):**

- North-side Chicago delivery: not in service area, high operational cost, lower cultural fit with positioning.
- National Black grocery delivery: premature without proof of local unit economics.
- Restaurant-quality prepared meals: margins require commissary kitchen; operational complexity exceeds current capacity.

---

## Where-To-Play Options

**Option 1 (recommended): Own the south-side weekly basket, Black-farmed anchor.**

Expand to 100-120 SKUs across 6 categories (greens/roots as today, plus commodity staples, proteins at scale, snacks/pantry, beverages, 1 prepared category) within 90 days. Price commodity staples (bananas, oats, canned beans, olive oil) at or below Aldi shelf price. Use Black-owned badge on every qualifying SKU. Relaunch paid with a "build your weekly basket" creative hook targeting south-side households by ZIP. This captures the Weekly Staples segment (50-60% of wallet) while retaining the Specialty Buyer who is already the beachhead. Requires Wave B sourcing to be operational, which is the CEO's stated priority.

**Option 2 (complementary, not standalone): Add 8-12 Black-culinary heat-and-eat SKUs as the repeat-purchase anchor.**

Before or alongside Wave B, introduce a small prepared/marinated shelf: seasoned chicken thighs ready to bake, pre-washed collard greens with seasoning packet, marinated short ribs, mac-and-cheese base kit. These SKUs require minimal operational change (same cold-chain as current proteins), are high-margin, and drive repeat visits because they solve the "what's for dinner tonight" need that produce alone cannot. This addresses the Prepared Buyer white space and is the single highest-repeat-rate lever available without a commissary.

**Option 3 (deferred): Personal care and non-food bundling (Wave E).**

Real white space, but the funnel fix must come first. Adding personal care before the food basket is solved would fragment the brand story and the sourcing team's bandwidth. Activate Wave E only after Option 1 is live and the /shop reach and ATC gates are cleared. The Black-owned badge infrastructure is already wired in code; personal care SKUs can be onboarded quickly once the food catalog stabilizes.


_Data gaps: Service-area household count and online grocery adoption rate by ZIP: the Census ACS parquet is on disk but has not been joined to delivery ZIPs to produce a precise household count. Run the join on `census_acs_zip_20260502T183716Z.parquet` against the service-area ZIP list to replace the 200K-240K estimate with an exact figure.; Post-assortment baseline CVR: there is no behavioral data on what conversion rate looks like after a catalog expansion because no expansion has happened yet. The 2% target is a benchmark assumption, not a measured outcome. First 30 days post-Wave-B launch are the critical observation window.; Average basket size by segment: the 30-60 USD stated AOV range is a current observation on a 43-SKU catalog. It is unknown whether a 100-SKU catalog produces a higher AOV (likely) or lower (if commodity staples lower average unit price). This needs a first-party test, not an assumption.; Competitor delivery penetration in south-side ZIPs: no verified data exists on what share of south-side households are currently active on Instacart, Amazon Fresh, or Walmart+ in the specific service-area ZIPs. This matters for estimating switching cost and market share ceiling.; Black-farmed SKU sourcing capacity beyond Run A Way Buckers Club: the vendor sourcing pipeline (1,025-row Airtable base app3raEVB9kHeUoHE) exists but has not been translated into confirmed supply agreements for Wave B staples. The gap between pipeline and contracted supply is the single biggest operational risk to the where-to-play options.; Repeat purchase rate for current customers: the fact base does not include a stated repeat rate beyond the one grandfathered subscriber. The bottom-up market size model assumes a 2x organic multiplier on paid conversions, which is a placeholder. Actual cohort retention data (even from a small sample) would sharpen this estimate significantly.; Heat-and-eat supplier landscape in south-side Chicago: whether Black-owned prepared food suppliers exist in the service area at the scale needed for 8-12 reliable SKUs is unknown. This is the key feasibility check before Option 2 is committed._

### customer-segmentation

**Uncle Mays has four behaviorally distinct customer segments, but only two of them (the Soul-Food Household and the Health-Forward Professional) have both high enough basket completion potential and sufficient supply-side readiness to anchor the paid relaunch, and the current 43-SKU produce-only catalog can fully serve neither.**

# Customer Segmentation
## Uncle Mays Produce, June 2026

---

## Segmentation Objective

Identify which customer segments have the highest potential to convert and retain on the post-reset Uncle Mays catalog, so the product-mix wave sequence, paid media relaunch creative, pricing decisions, and CRO/UX operator brief are all aimed at the right shopper from day one.

The prior phases established that the binding constraint is offer inadequacy, not funnel mechanics. This segmentation answers the follow-on question: which specific shoppers are being failed by the 43-SKU produce-only catalog, what do each of them actually need to build a satisfying basket, and which segments should the product-mix Waves A through E be optimized for in priority order.

---

## Segmentation Dimensions

Four dimensions differentiate Uncle Mays shoppers in ways that are observable, predict purchase behavior, and connect directly to assortment, pricing, and media decisions.

**1. Basket intent:** Are they shopping for a weekly household staples run, or for a specific cultural/occasion purpose, or for convenience (add to existing delivery stack), or for exploration/gifting?

**2. Household cooking pattern:** Soul-food and culturally-rooted scratch cooking (collards, proteins for seasoning, cornmeal, rice-based sides) vs. health-forward meal-prep cooking (greens, salads, specialty produce, proteins without the seasoning-cut requirement) vs. minimal cooking (needs heat-and-eat or prepared as the anchor) vs. light/gift usage.

**3. Geography and delivery context:** South-side Chicago ZIP (60615-60655, the Hyde Park and Bronzeville core) vs. south suburb cluster (Flossmoor, Olympia Fields, Matteson, South Holland) vs. the Loop/Near North corridor (60601-60611). Service area is fixed, but willingness to pay, basket size, and category mix vary across these sub-zones.

**4. Purchase frequency intent:** Weekly or bi-weekly primary grocery mission vs. supplemental ordering (customer already shops Jewel/Walmart for staples, adds Uncle Mays for specialty produce) vs. one-time/occasion.

---

## Segment Definitions

| Segment | Defining Traits | Needs | Economics (estimated) | Behavior |
|---|---|---|---|---|
| **1. Soul-Food Household** | South-side and south-suburb household, 2-5 people, with a scratch soul-food cooking pattern. Buys collards, mustard greens, proteins (smoked turkey, chicken, short ribs), rice, cornmeal, black-eyed peas as weekly staples. Numerator data: Black households are 191% more likely to buy mustard greens, 89% more likely to buy okra, 72% more likely to buy black-eyed peas vs. the US average. This shopper is the merchandising thesis of Uncle Mays. | Full soul-food basket in one stop: greens with seasoning meats, proteins, rice, cornmeal, black-eyed peas, okra, hot sauce, condiments. The current catalog gives them specialty greens and short ribs but no collards, no smoked turkey necks, no okra, no rice, no cornmeal. They cannot complete a Sunday dinner shop. | AOV estimate: $50-$80 per order (produce + seasoning meat + protein + pantry staples). Frequency potential: weekly to bi-weekly. LTV estimate: high if assortment is completed. Gross margin is highest on produce and pantry; protein margin depends on supplier cost. | Expects familiar SKUs on the first scroll. Discovery pattern is Facebook community groups and recipe sharing, not Instagram explore or Google search. Referral rate is high (Numerator: 89.6% of surveyed consumers would refer friends/family). Subscription or repeat-order cadence is natural for this shopper. Most sensitive to fulfillment reliability because they plan meals around the delivery. |
| **2. Health-Forward Professional** | South-side Chicago or Loop/Near North, 1-2 people (single or couple), income above the service-area median (Hyde Park, Bronzeville, Loop corridors). Health-conscious buyer who treats quality sourcing and the Black-owned brand story as a reason to pay a premium. The current paid traffic is likely disproportionately this segment (Google and Instagram skew younger, higher income, smaller household). This is probably who produced the 0.46% CVR. | A basket of high-quality fresh produce (salads, specialty greens, berries, tomatoes, cucumbers, herbs) plus a clean protein (eggs, pastured chicken, grass-fed beef). Wants variety and rotation. Does NOT need soul-food staples as primary anchors, but would add bananas, onions, cilantro, and tomatoes if present. The current catalog serves this shopper partially (kale, chard, salad mix, pea shoots, microgreens, eggs, chicken, short ribs) but fails on everyday staples needed to build a $40+ basket from a 1-2 person household. | AOV estimate: $35-$55 per order (smaller household size, fewer bulk items). Frequency potential: weekly to supplemental (may use as a top-up for a Whole Foods or Mariano's shop). LTV estimate: medium. Highly elastic on convenience. Will churn if delivery reliability is inconsistent. | Arrives via Google search ("fresh produce delivery Chicago," "Black-owned grocery delivery") or Instagram paid. Browses /shop and can find relevant SKUs but cannot build a $40 basket from 43 SKUs without hitting the wall on staples. Most likely to exit at the "not enough items" moment rather than the checkout. Responds to brand story and Black-owned badge. Higher likelihood to leave a review or share on social. |
| **3. Convenience/Add-On Shopper** | Already uses Instacart, Whole Foods delivery, or Amazon Fresh for the bulk of their grocery run. Lives in the service area. Adds Uncle Mays for a specific category that Instacart under-serves: culturally relevant produce, Black-owned brand story, or specific specialty items. May be a smaller-basket customer. | A narrow, specific basket: "I want fresh collards and a smoked turkey neck that I can't easily find on Instacart" or "I want this Black-owned salad mix." Not a full-trip shopper. Needs the catalog to have their specific item reliably stocked. Will not build a $40 basket intentionally. | AOV estimate: $25-$40 (narrow basket). Frequency: sporadic to monthly. LTV estimate: low unless a subscription or reminder mechanism pulls them back. $20 cart minimum is less of a barrier than for Segment 2 because this shopper knows what they want and typically adds enough to reach $20. | Arrives primarily via organic social or word-of-mouth (not paid). Has high intent on a narrow set of SKUs. Converts if those SKUs are in stock and visible. Churns silently when items go out of stock. Not a natural repeat buyer without a retargeting or newsletter touch. |
| **4. Gift/Exploratory Buyer** | Outside the core cultural target, or a core-target customer buying for someone else. Attracted by the brand story, media coverage, or a social recommendation. Likely first and only order unless converted into Segment 1 or 2. Currently has almost no infrastructure support (no gift box, no curated bundle, no subscription option for gifting). | A curated selection that looks like a gift. Fixed box or "build a box for someone" UX. Wants to feel like they are supporting something meaningful. The current build-your-own cart model is not optimized for this buyer. | AOV estimate: $45-$65 (gift buyers tend to overshoot the minimum to feel generous). Frequency: very low, one-time. LTV estimate: very low unless converted to a repeat buyer. | Arrives via press, podcast, founder social media, or organic Instagram. Browses the site, hits the build-your-own cart, and bounces because there is no "starter set" or "best of Uncle Mays" guided path. Likely responsible for some of the 25% session-to-shop drop-off and the 5.5% ATC rate. |

---

## Segment Prioritization

| Segment | Size | Growth | Profitability | Fit (current offer) | Right to Win | Priority |
|---|---|---|---|---|---|---|
| **1. Soul-Food Household** | Large. The south-side Chicago + south-suburb service area has approximately 400,000-500,000 Black households (Census ACS 2022, south-side ZIP cluster). The subset with weekly grocery delivery behavior is smaller but not thin: Numerator confirms Black consumers are 33% more likely to use online grocery delivery than the US average. Directional assumption: 5-10% delivery-grocery penetration in the service area is a reasonable working estimate, implying 20,000-50,000 addressable households. Exact size is a data gap. | High. Black household grocery delivery adoption is growing faster than the national average (Numerator, 21% more likely to be early adopters of new shopping services). The Numerator soul-food basket items (collards, mustard greens, okra, black-eyed peas) are under-served by every existing Chicago delivery operator, creating a durable white space. | Highest. Soul-food basket items carry the highest gross margin opportunity when sourced directly from Black farmers: greens and pantry staples at 30-45% gross margin on specialty sourcing, proteins at 20-30%. Basket AOV of $50-$80 at weekly frequency produces the highest LTV in the segment set. | Very low today. The current catalog has mustard greens (a leading soul-food item) and short ribs, but is missing 9 of the 11 Tier-1 soul-food basket items identified in Wave A of the product-mix recommendation: collards, okra, black-eyed peas, smoked turkey necks, ham hocks, white rice, cornmeal, oxtail, and catfish. A shopper in this segment who arrives at /shop today cannot complete their primary grocery mission. | Highest. The Black-owned sourcing story, the Run A Way Buckers Club Pembroke origin, the soul-food basket curation, and the "cleaner than Whole Foods" value proposition are all uniquely suited to this segment. No Chicago delivery operator is building a soul-food-basket-first catalog with a Black-farmed sourcing thesis. | **1: Anchor segment. All Wave A sourcing and homepage merchandising should be optimized for this shopper.** |
| **2. Health-Forward Professional** | Medium to large. The Hyde Park, Bronzeville, and Loop/Near North corridors have a high concentration of the target profile (college-educated, income above service-area median, health-conscious). The exact count is a data gap, but the Census ACS Hyde Park and Bronzeville ZIPs (60615, 60616, 60637, 60649) show median household incomes ranging from $55K to $85K, above the city median. This is the segment most likely reached by the current pre-pause paid media. | Medium. Healthy-food delivery is competitive (Whole Foods via Amazon Prime, Mariano's via Instacart, Imperfect Foods) but Uncle Mays has a differentiation angle (Black-owned brand, direct-farmer sourcing, south-side identity) that is defensible. | Medium. Smaller basket size ($35-$55 AOV) and lower frequency (weekly to supplemental) reduce LTV relative to Segment 1. However this segment is more amenable to premium pricing and the Black-owned badge is a purchase-decision factor, which supports gross margin preservation. | Low today. The current catalog partially serves this shopper (specialty greens, eggs, proteins) but cannot support a full weekly trip for a 1-2 person household. Universal staples missing: bananas, onions, tomatoes, cucumbers, berries, herbs. The shopper browses, finds some relevant SKUs, but the basket ceiling at 43 SKUs is too low to reach $35-$55 without a protein, which forces a high-commitment first order. | High. The brand story and Black-owned sourcing have strong resonance with this segment's identity values. The "cleaner than Whole Foods" tagline is most legible to a shopper who already shops Whole Foods or Mariano's and is looking for a better alternative. This segment also has the highest social-sharing propensity, making it the primary referral source for Segment 1. | **2: Secondary priority. Wave B universal staples are the unlock. Hold paid media targeting this segment until Wave B is live.** |
| **3. Convenience/Add-On Shopper** | Medium. This segment is real but hard to size without order data. Likely overlaps significantly with Segments 1 and 2 in demographics. The constraint is that this shopper has low frequency intent by definition. | Low to medium. The convenience-add segment tends to erode as competitors expand their culturally-relevant assortment. If Instacart onboards more Black-farmed produce vendors, the add-on reason weakens. | Low. Low AOV and low frequency produce low LTV. Margin per order may be acceptable but the segment does not build a business. | Medium. The current catalog, limited as it is, does serve the convenience/add-on shopper better than it serves Segments 1 or 2: a shopper who specifically wants mustard greens and short ribs can find both today. | Medium. Right-to-win is real but the competitive moat is thin. Shelf-stable availability and reliable stock matter more than assortment breadth for this segment. | **3: Opportunistic. Serve but do not target with paid spend. Newsletter and organic social are the right channels.** |
| **4. Gift/Exploratory Buyer** | Small today. No infrastructure to capture or convert this buyer (no gift box, no curated path, no subscription). The segment's size is speculative. | Low in the near term. Becomes meaningful only after press coverage scales or the brand reaches cultural awareness outside the direct target. | Low. One-time orders do not build a business. If converted to Segment 1 or 2 the economics change, but the conversion path does not exist yet. | Very low. The build-your-own cart model is the worst possible UX for a gift buyer. The $20 minimum feels arbitrary when the buyer is trying to spend $50 on a curated experience. No gift box, no "best of" guided path, no branded packaging story surfaced at the point of purchase. | Low today. Nothing in the current or near-term product roadmap is specifically designed for this segment. | **4: Defer. Do not invest in this segment until Segments 1 and 2 are producing repeat revenue.** |

---

## Strategic Implications

### 1. Sequence the product-mix waves to serve the anchor segment first, then the secondary segment

Wave A (soul-food basket, 11 Tier-1 SKUs: collards, okra, black-eyed peas, smoked turkey necks, ham hocks, white rice, cornmeal, oxtail, catfish, elbow macaroni plus cheddar, hot sauce) is the right first move because it directly addresses the basket-completion failure for Segment 1 (Soul-Food Household). This is not a positioning choice. It is a functional unlock: Segment 1 cannot complete their primary grocery mission from the current catalog, so they do not convert regardless of media spend or funnel optimization.

Wave B (universal weekly core: bananas, onions, tomatoes, cucumbers, berries, bread, dairy, ground beef, herbs) is the unlock for Segment 2 (Health-Forward Professional). These SKUs are not differentiators but they lower the basket-building friction for a 1-2 person household enough to push AOV from the current implied $30-40 ceiling to a $40-55 range where order economics work. Wave B also benefits Segment 1 by filling the everyday-staples layer underneath the soul-food differentiators.

Do not launch paid media until at least Wave A is live, verified with organic ATC and completed-order signals, and the relaunch CVR gate is met (per the prior engagement phases: /shop reach above 40%, ATC above 12%, at least one completed full-basket order from net-new paid acquisition without a promo, all in the same week).

### 2. Build segment-specific creative briefs before the paid relaunch

The current ad creative that drove 0.46% CVR defaulted to generic produce imagery. Each priority segment needs a distinct entry point:

Segment 1 (Soul-Food Household): Facebook-first. Video creative anchored on soul-food occasion (Sunday dinner, Juneteenth prep, family gathering). Show the basket. Lead with "collards, short ribs, black-eyed peas, delivered by a Black farmer." The Black-owned badge and Run A Way Buckers Club Pembroke origin are primary trust signals, not secondary ones. Founder voice (Anthony) in the creative outperforms polished brand copy for this segment.

Segment 2 (Health-Forward Professional): Instagram and Google-first. Static and Reel creative anchored on freshness, portion quality, and the sourcing story. "Cleaner than Whole Foods, sourced from Black farmers in Pembroke, IL" is the headline. Lead with eggs, pastured chicken, salad mix, and pea shoots as the visual anchors because these are the only current SKUs that speak to this shopper's intent. Post-Wave B, add berries and herbs to the creative set.

The same creative does not serve both segments. The media budget should be split by segment and by platform at relaunch, not unified behind one brand message.

### 3. Apply the Black-owned badge as a conversion signal for Segment 1, and a brand signal for Segment 2

The badge is wired in code but inert. For Segment 1, the badge on collards sourced from Run A Way Buckers Club and smoked turkey necks from a Black-owned meat supplier is a purchase-decision factor, not merely a brand nicety. Numerator's research confirms 68% of Black consumers express identity through food choices and 35% select grocery stores based on cultural relevance. The badge should be visible on every Wave A and Wave B SKU that has a Black-owned supplier.

For Segment 2, the badge is a brand differentiator that justifies the premium over Whole Foods. Surface it at the category level (a "Black-owned collection" hero rail) as well as at the SKU level.

### 4. Test the cart minimum at $15 after Wave B is live, for Segment 2

The $20 minimum is a functional suppressor for Segment 2. A 1-2 person household building a salad-and-eggs basket (romaine $3.00, kale $3.00, eggs $5.99, candy carrots $1.50) hits $13.49 after four items and then faces a $6.51 gap to clear the gate. After Wave B adds bananas ($1.50-$2.00 est.), onions ($2.50 est.), and cilantro ($1.50 est.) as low-price-point staples, the same shopper can clear $20 in five items. But the minimum test should still be run because the barrier may not disappear entirely.

For Segment 1 the $20 minimum is a non-issue (a collards plus smoked turkey neck plus rice basket is $20+ in three SKUs at expected Wave A prices) and reducing it creates margin risk without conversion benefit for the anchor segment. The minimum test should be Segment 2-specific.

### 5. Defer the CRO/UX operator hire until post-Wave-A behavioral data is available, but brief them against the segment model now

The prior phases established that hiring an operator now (Barrel, Anatta, Bear Group, $50-120K, 90-day trial) is premature because there is no post-assortment behavioral baseline to brief against. The segmentation adds precision to that recommendation: the operator needs to be briefed against two distinct conversion journeys (Segment 1 soul-food basket completion and Segment 2 weekly-professional top-up), not a single unified funnel. Without Wave A data, the operator cannot know which journey is failing at which step, making the engagement largely speculative.

When the operator briefing does happen, the segment model should drive it. Segment 1's funnel fails at assortment (no Wave A SKUs). Segment 2's funnel fails at basket depth (cannot reach $40 without a protein). These are different UX problems: Segment 1 needs better category architecture (soul-food rail, greens-plus-seasoning-meat cross-sell), while Segment 2 needs better basket-building affordances (suggested add-ons, low-price-point staples visible above the fold).

### 6. Do not activate the Convenience Shopper or Gift/Exploratory Buyer segments with paid media

Segment 3 (Convenience) is best served by organic social and newsletter, which have near-zero marginal cost and are already operating. These shoppers arrive when they have a specific need; they cannot be efficiently acquired by paid impression-based media.

Segment 4 (Gift/Exploratory) requires infrastructure that does not exist (gift box, curated set, guided bundle path) before it can be monetized. Building that infrastructure before Segments 1 and 2 are converting would be a misallocation of product and engineering time.

### 7. Resolve the EXP-002 delivery reliability test before the paid relaunch gates are checked

The Soul-Food Household (Segment 1) is the most repeat-purchase-dependent segment in the set. Its LTV depends on weekly or bi-weekly ordering, and that ordering cadence is predicated on delivery reliability. The "every day, pick your window" customer promise running ahead of confirmed daily driver routing is a fulfillment trust risk that is concentrated in the most valuable segment. If the EXP-002 test reveals that the team cannot route every day across the full service area, the relaunch plan must include an honest service-area scope reduction (e.g., "every day in the south-side 606xx ZIPs; 3 days/week in the south suburbs") rather than continuing the painted-door setup. A Segment 1 shopper who plans Sunday collards and a delivery arrives the following Tuesday is not coming back.

---

## Data Gaps

The following real data would materially sharpen the segment sizing, economics, and prioritization.


_Data gaps: Segment-level AOV and ATC rate by SKU category from LogRocket/Galileo (currently paused): impossible to confirm whether the 0.46% CVR is disproportionately failing Segment 1 vs. Segment 2 without session-level cohort data.; Numerator full 'Food Culture in the Black Community' report (public press-release figures used throughout): would convert inferred items in the soul-food basket from directional to rank-ordered, and would provide Black-household basket-size and frequency data by income tier to validate Segment 1 AOV and frequency assumptions.; BLS Consumer Expenditure Survey microdata for Chicago MSA, race-disaggregated (free, 20-40 analyst hours): would provide category-level dollar-share by Black household income tier in Chicago, converting the gross-margin estimates from assumption to data.; EXP-002 painted-door delivery window test results: required to confirm whether Segment 1 (Soul-Food Household, the most repeat-purchase-dependent segment) can be served on the daily delivery cadence promised, or whether a sub-area SLA is needed before relaunch.; Post-Wave-A first 30-day order cohort (does not exist yet): ATC rate by category, AOV by segment proxy (basket composition reveals segment), repeat rate within 14 days. This is the only behavioral test that can confirm or falsify the segment model.; Service-area ZIP-level demographic breakdown cross-referenced against delivery order ZIP codes (Census ACS on disk at ml/data/raw/census_acs_zip_20260502T183716Z.parquet, but order-level ZIP data is only available post-relaunch): would allow segment sizing at the ZIP level and identify which sub-geographies are over- or under-indexed._

### competitive-intel

**Uncle Mays' most dangerous competitive threat is not a direct rival stealing customers but category substitutes (Instacart/Whole Foods same-day delivery and Aldi in-store) that already satisfy the basket-completion need Uncle Mays cannot yet meet at 43 SKUs, making assortment expansion a competitive urgency, not just a UX fix.**

# Competitive Intel

## Strategic Move Under Analysis

Uncle Mays is about to expand its catalog from 43 produce-only SKUs to a multi-category assortment (staples, snacks, heat-and-eat, personal care) and restart paid acquisition. The question this analysis answers: which competitors will respond, how, and what should Uncle Mays do before they do?

---

## Competitor Map

| Competitor | Position | Incentives | Capabilities | Constraints |
|---|---|---|---|---|
| **Instacart (+ Whole Foods / Mariano's)** | Default same-day grocery delivery, south-side Chicago and south suburbs | Maximize GMV per household; protect last-mile share in high-density Chicago ZIPs | Entire Whole Foods and Mariano's catalogs (50K+ SKUs), 1-2 hour delivery windows, mature paid social acquisition engine, loyalty integrations | Cannot credibly claim Black-owned sourcing; no cultural positioning for south-side Black households; delivery fee + tip economics push actual cost above Uncle Mays' $7.99 flat fee for small baskets |
| **Aldi (in-store, Hyde Park / Chatham)** | Low-price commodity staple destination for south-side shoppers | Drive in-store traffic; protect price leadership on staples | 1,400+ SKUs, lowest price points in market, physical presence in target ZIPs (Chatham, Calumet) | Zero e-commerce delivery; no Black-owned positioning; thin margins make premium-positioning moves structurally impossible |
| **Whole Foods Market (in-store, 63rd St Hyde Park or future southward expansion)** | Premium grocery, aspirational positioning | Protect premium positioning, extend geographic footprint, capture Hyde Park redevelopment upside | 40K+ SKUs, Prime delivery integration, premium private label, trusted provenance claims | No culturally-specific Black community positioning; perceived as outsider in Black south-side neighborhoods; prices are higher, not lower, than Uncle Mays on produce comparables |
| **GreenLeaf Market (Chicago, Black-owned)** | Black-owned independent grocery, primarily in-store | Serve loyal local customer base; sustain the existing store | Physical store presence, established community trust, SNAP/EBT acceptance | No meaningful e-commerce infrastructure; single location; no delivery capacity; cannot compete on SKU breadth or paid acquisition |
| **Appetite for Change (North Minneapolis model, no Chicago ops)** | Black food-system nonprofit with market/CSA elements | Mission: food sovereignty, employment, community ownership | Strong sourcing relationships with Black farmers in upper Midwest; trusted brand | Not in Chicago; non-commercial CSA model with pickup-only; not a direct retail competitor; relevant as a sourcing partnership target, not a threat |
| **DoorDash / Uber Eats Grocery** | On-demand convenience grocery from local corner stores and specialty shops | Grow grocery GMV; expand beyond restaurant delivery | Massive driver network, 30-60 minute windows in Chicago, existing south-side user base | Catalog quality varies by local store; no Black-farmed sourcing claims; high platform fee (30%) makes unit economics hostile for independent Black vendors |
| **Direct Eats (online specialty grocer, national)** | Curated specialty and specialty-diet grocery delivery | Maintain niche premium DTC positioning | Broader specialty catalog than Uncle Mays, established DTC checkout experience | Not targeting Black cultural positioning; no local Chicago fulfillment advantage; national UPS shipping means 3-5 day lead times vs Uncle Mays' local routing |
| **Imperfect Foods / Misfits Market (national, ugly-produce DTC)** | Subscription-based produce and pantry delivery, national | Grow subscription GMV; retain churned subscribers | Large produce + pantry catalog, subscription economics, active paid social presence | Subscription-only model limits impulse purchase; no local south-side identity; ugly-produce framing conflicts with Uncle Mays' quality positioning; no Black-owned sourcing story |
| **Venture-backed Black food e-commerce entrants (hypothetical)** | Not yet in market, but structurally plausible given Black food-economy attention | Capture the nationally-underserved Black grocery e-commerce segment | If VC-backed: capital for paid acquisition, catalog depth, and fulfillment infrastructure from day one | Not operational as of June 2026 (assumption: no known funded entrant in this specific niche); Uncle Mays has first-mover advantage in the segment |

---

## Likely Moves

| Competitor | Most Likely Move | Trigger | Impact on Uncle Mays | Confidence |
|---|---|---|---|---|
| **Instacart + Whole Foods** | No direct response; passive erosion via convenience. Continued Instacart promotions ($0 delivery, free trial Instacart+) targeting south-side Chicago ZIP codes through Meta and Google paid social. | Uncle Mays restarts paid acquisition and bids on 'Black-owned grocery delivery Chicago' or 'fresh produce delivery south side' keywords. | Paid CAC increases as Instacart and Whole Foods bid into the same keyword clusters; paid shoppers comparison-shop and find Instacart's 1-2 hour window vs Uncle Mays' 4-day minimum lead time. Conversion rate pressure even with an expanded catalog. | High: this is already happening passively regardless of Uncle Mays' actions. |
| **Aldi** | No response. Aldi does not run paid digital acquisition for individual store footprints. The threat is passive: Aldi is the default low-price destination the target shopper already has a habit with. | Irrelevant to Uncle Mays' paid campaign; Aldi does not compete on the digital channel. | Uncle Mays must validate the 'cheaper than Aldi' price claim specifically on overlapping SKUs (bananas, produce staples in Wave B) before paid relaunch. If Uncle Mays' commodity staple prices are higher than Aldi in-store, the tagline is a liability, not an asset. | High: Aldi passively exerts pricing pressure on the commodity staples Uncle Mays plans to add in Wave B. |
| **Whole Foods (Hyde Park)** | Physical expansion. If Hyde Park development creates a Whole Foods lease opportunity south of 51st St, Whole Foods would sign it to capture the UChicago and Kenwood premium households that overlap directly with Uncle Mays' target customer. | Amazon-Whole Foods growth mandates for Chicago; Hyde Park residential development pipeline (2026-2028). | Would collapse the 'cleaner than Whole Foods' positioning advantage in the target ZIP and co-locate with the planned Uncle Mays flagship. Most dangerous if it precedes Uncle Mays' physical store opening. | Low to Medium: no confirmed Whole Foods expansion south of 55th in current public record (assumption, flagged as data gap); timeline is 2-3 years out if it happens. |
| **GreenLeaf / Black-owned Chicago grocers** | Partnership offer or benign coexistence. A VC-backed Uncle Mays is more likely to be seen as a resource (distribution, marketing, shared sourcing) than a threat by other Black grocery operators. | Uncle Mays closes the SAFE round and gains visible traction. | Minimal competitive impact; high sourcing and community-credibility partnership upside. | High: Black-owned grocery operators in Chicago are not running paid e-commerce; they are not competing for the same acquisition funnel. |
| **DoorDash Grocery** | Targeted promotions or grocery tab expansion in south-side Chicago if they detect a new paid competitor entering 'Black-owned grocery' search intent. Not a strategic response to Uncle Mays specifically, but a structural intensification of the convenience substitute. | Paid relaunch by Uncle Mays; any earned media coverage of Uncle Mays' expansion. | Increases competitive noise in the shopper's consideration set. DoorDash's 30-minute window is a direct rebuttal to Uncle Mays' 4-day lead time for impulse purchases. | Medium: DoorDash responds to market signals, not specific competitors at Uncle Mays' current scale. |
| **Imperfect Foods / Misfits Market** | No targeted response to Uncle Mays. They compete nationally for subscription intent; Uncle Mays is sub-scale and geographically narrow relative to their audience. | Not applicable at current Uncle Mays scale. | Relevant only as a positioning benchmark: their subscription churn rates and produce-quality complaints are an acquisition opportunity Uncle Mays can target with 'no subscription, no ugly produce' messaging. | High confidence in non-response. |
| **Hypothetical VC-backed Black food e-commerce entrant** | If such an entrant is funded and announces in the next 12-18 months, they will likely target national scale (not Chicago-specific) and lead with subscription. Their first 12 months would be spent on supply chain, not paid acquisition. Uncle Mays would still have 12-18 months of local advantage. | VC investment in 'Black food economy' accelerates nationally (2026-2027 window). | Highest tail risk if such an entrant targets Chicago specifically with deeper capital. Uncle Mays' local fulfillment relationships and Black-farmed sourcing network are the durable moats in that scenario. | Low probability, high impact. Include as a tail-risk scenario only. |

---

## Response Plan

| Scenario | Early Signal | Recommended Response |
|---|---|---|
| **Instacart paid acquisition intensifies in Uncle Mays' target ZIPs post-relaunch** | Paid CAC rises above $60 per acquisition in the first 30 days after relaunch; impression share on 'produce delivery south side Chicago' drops; Meta ad frequency rises without corresponding CVR improvement. | Shift paid creative from generic produce/delivery to Black-owned specificity ('only Black-farmed produce, delivered south side'). This keyword and creative angle has no credible Instacart counter. Lean into cultural specificity, not convenience speed, as the differentiator. |
| **Wave B commodity staple prices (bananas, pantry) are found to be higher than Aldi in-store on launch** | Price comparison by a customer or reviewer is published or surfaced on Google reviews / social media; add-to-cart rate on staple SKUs is significantly lower than produce SKUs post-expansion. | Conduct a SKU-level price audit before Wave B launch (see data gaps). If staple prices cannot match or beat Aldi on 5-8 anchor staples, reframe the tagline: 'ethically sourced, comparable to Whole Foods quality at better prices' rather than 'cheaper than Aldi.' Do not let a false pricing claim become a trust liability. |
| **Whole Foods announces Hyde Park or Kenwood expansion (2-3 year horizon)** | Permit filings or development announcements in Hyde Park / Kenwood / Bronzeville corridor; Amazon-Whole Foods press coverage of Chicago southward expansion. | Accelerate the flagship store timeline and negotiate the Hyde Park LOI to close before Whole Foods can establish a presence. Uncle Mays' advantage is speed and community embeddedness: sign the lease, open the store, and build customer loyalty before Whole Foods arrives. Physical presence and cultural trust are not replicable by a national chain. |
| **A VC-backed Black food e-commerce entrant enters the market with capital** | Funding announcement in TechCrunch, Forbes, or Black enterprise press; social ads targeting 'Black grocery' or 'Black-owned food delivery' keywords; product listings showing Black-farmed or Black-owned sourcing. | Activate the vendor-sourcing-pipeline Airtable base (app3raEVB9kHeUoHE, 1,025 rows) as a competitive asset. The sourcing relationships Uncle Mays has built are first-mover capital a new entrant cannot replicate in 12 months. Announce Black-owned supplier partnerships publicly, use the badge in paid creative, and file any proprietary sourcing relationships as contractual exclusives where possible. |
| **DoorDash or Instacart launches a 'support Black-owned businesses' campaign targeting south-side Chicago** | DoorDash or Instacart paid social in Chicago featuring Black-owned restaurant or grocery framing; press coverage of their DEI grocery initiatives. | Respond with a 'platform vs. owned' narrative: Uncle Mays IS Black-owned, from the supplier to the founder to the community served. A platform promoting Black-owned sellers is not the same as a Black-owned platform. Lean into this distinction in earned media and organic social content. |

---

## Strategic Implication

The competitive landscape validates the CEO's sequencing instinct but adds three specific implications the product-mix reset plan does not yet address.

**First, the assortment gap is a competitive vulnerability, not just a UX gap.** Every week Uncle Mays runs with 43 SKUs, Instacart and Aldi are capturing the basket-completion need of the exact shopper Uncle Mays is trying to convert. The urgency of Wave B and Wave C (snacks, pantry, heat-and-eat) is not about sales volume at launch. It is about qualifying Uncle Mays as a credible basket-completion destination before paid acquisition resumes, so that paid dollars compete against a real offer rather than sending shoppers to Instacart after failing to find what they need.

**Second, the only durable moat against all named competitors is Black-owned sourcing density.** Instacart cannot manufacture community trust. Whole Foods cannot source from Black Pembroke farmers. DoorDash cannot badge SKUs with verified Black-owned provenance. The competitive moat is already being built through the Run Away Buckers Club relationship and the Wave E personal-care expansion. The speed at which Uncle Mays converts the 1,025-row vendor sourcing pipeline into badged, live catalog SKUs determines how wide that moat is before a well-capitalized entrant arrives.

**Third, the 4-day minimum delivery lead time is a competitive liability that compounds after assortment expands.** Adding 30 new SKUs will raise ATC rates. But a shopper who builds a $45 cart and sees 'earliest delivery in 4 days' will compare that against Instacart's 2-hour window and may abandon anyway. Resolving the EXP-002 operational test to a firm SLA (even '48-hour delivery for orders placed before noon' is a competitive improvement over 4 days) is a pre-launch competitive requirement, not an optional ops upgrade.

The competitive environment does not change the product-mix reset sequence. It adds three hard deadlines: (1) Wave B staple price validation before paid relaunch (Aldi price audit), (2) lead-time reduction before paid relaunch (Instacart response mitigation), and (3) Black-owned sourcing pipeline activation as a public competitive asset before any well-capitalized entrant can replicate it.


_Data gaps: Whole Foods Chicago expansion plans south of 55th Street: no public permit or lease data confirmed as of June 2026. Monitor Chicago DPD permit filings and JLL/CBRE retail leasing reports for Hyde Park / Kenwood corridor.; Aldi shelf prices for 8-10 anchor staples Uncle Mays plans to add in Wave B (bananas, bagged potatoes, dried beans, rice, eggs). Required before the 'cheaper than Aldi' claim can be validated or the tagline must be revised.; Instacart / DoorDash paid ad spend and keyword targeting in south-side Chicago ZIP codes (60615, 60619, 60637). Estimated via Facebook Ad Library and Google Ads Auction Insights; not verified against actual spend data.; Active VC-backed Black food e-commerce entrants nationally: no confirmed funded competitor identified as of June 2026. This is an assumption. Recommend a quarterly scan of Crunchbase and Black Enterprise funding announcements.; EXP-002 painted-door test results: the actual daily delivery coverage map, order volumes attempted vs. fulfilled, and lead-time distribution are not in the fact base. This is the single most important operational data gap for competitive response planning.; GreenLeaf Market and other Black-owned Chicago grocery operators' current digital presence and delivery capability: no verified current-state data on whether any have launched or are piloting e-commerce delivery since this fact base was assembled.; Current Instacart and DoorDash delivery fee structures and promotional cadence in south-side Chicago ZIPs: the $7.99 Uncle Mays flat-fee comparison is made without a verified current Instacart fee for equivalent basket sizes in the same ZIPs._

### profit-pool-analysis

**The e-commerce profit pool for Uncle Mays is almost entirely locked inside a repeat-purchase, high-AOV basket that the current 43-SKU produce-only catalog cannot build, meaning nearly all gross margin the brand can structurally earn is being destroyed at the top of the funnel before a single payment is attempted.**

# Profit Pool Analysis: Uncle Mays Produce E-Commerce

## Scope

This analysis covers the live Uncle Mays e-commerce operation as of 2026-06-07: a build-your-own online grocery with 43 active SKUs (greens, roots, microgreens, pantry, proteins), one farm supplier (Run A Way Buckers Club, Pembroke IL), delivering across south-side Chicago and south suburbs. The scope is the funnel and product mix fix, NOT the planned physical flagship or the 82-store rollout. Revenue pools, margins, and attractiveness are assessed across three dimensions: current catalog structure, the planned Wave A-E assortment reset, and the structural economics of each customer segment.

**Important data limitation:** No live revenue or order-count data is available from the fact base. Gross margin projections (35% stabilized target) are stated business targets, not realized e-commerce actuals. CAC, ROAS, and LTV figures are not observable from available data. Where specific numbers are required, they are constructed from the fact base as labeled assumptions and flagged in dataGaps.

---

## Profit Pool Map

The pools below are sized by their structural revenue and margin potential for Uncle Mays specifically, given the service area, catalog, positioning, and funnel data available. "Revenue" is the order-of-magnitude pool accessible to Uncle Mays within its service area and customer base. "Margin" is the estimated gross margin range per pool based on product type, sourcing cost structure, and industry benchmarks for comparable food-DTC operators. "Profit" is a directional index (High / Medium / Low) because no realized order-level P&L is available.

| Pool | Revenue potential (annual, Uncle Mays service area) | Gross margin range | Profit index | Growth trajectory | Attractiveness |
|---|---|---|---|---|---|
| Repeat Black-household weekly basket ($60-$120 AOV, 2-4 orders/mo) | Largest pool. Assumption: 2,000 active repeat households at $80 avg monthly spend = $1.9M annually. (Labeled assumption; not from data.) | 28-35%. Mix of produce (30-38%), commodity staples (18-25%), proteins (25-35%), pantry (35-45%). Blended toward low end while assortment is produce-heavy. | High, but currently inaccessible | Growing: expands with each assortment wave | HIGHEST PRIORITY. This is the core addressable profit pool. Currently locked out because catalog cannot build a $60+ basket. |
| First-order novelty / acquisition (paid traffic, $30-$60 AOV, low repeat) | Smallest profitable pool. At 0.46% CVR and ~$439/wk spend, paid traffic generates negligible completed orders and near-zero net margin after CAC. | 25-32% gross on order. Net margin likely negative after ~$150+ implied CAC (assumption: at 0.46% CVR and average cost-per-click of $1.00-$2.00 on Meta/Google, roughly 200-435 paid clicks per conversion, implying CAC of $200-$870). (Labeled assumption.) | Negative at current CVR. Breakeven requires CVR above ~1.5% at $50 AOV and gross margin of 30%. | Declining: ads paused; CVR cannot improve without assortment | UNATTRACTIVE until assortment reset and CVR >1.5%. |
| High-ticket protein basket ($60-$120 AOV, anchor SKU is pastured chicken ~$32 or oxtail ~$35-$45) | Medium. These orders exist today. The pastured chicken, short ribs, lamb chops are already in catalog. A shopper who buys one protein + 3-5 produce items is at $50-$75. | 28-34% gross. Proteins carry lower margin than specialty produce but drive AOV disproportionately. | Medium-High. Best current pool. | Stable to growing. Adding oxtail, smoked cuts, catfish (Wave A) directly expands this pool. | HIGH. This pool is live today. The assortment gap is that the seasoning ingredients (collards, rice, cornmeal, hot sauce) are missing, so the protein sale is incomplete. |
| Soul-food basket (Wave A: collards, okra, smoked turkey necks, ham hocks, oxtail, rice, cornmeal, black-eyed peas, hot sauce) | Incremental to existing orders. Each new soul-food SKU adds $8-$25 to an existing protein order. Assumption: if Wave A adds $20 average basket lift on 100 orders/month, that is $24K additional annual revenue incremental to current base. (Labeled assumption.) | 30-40%. Pantry items (rice, cornmeal, dry beans) carry 35-45% gross margin. Smoked specialty cuts are 25-32%. Condiments and hot sauce are 40-55% if sourced directly from small Black-owned producers. | High on pantry and condiments. Medium on specialty cuts. Blended ~35%. | High growth: this pool has zero current revenue and is activated the moment Wave A ships. | HIGHEST NEAR-TERM ROI. $31K-$52K inventory investment, >90% Black-owned, directly feeds the highest-demand Black-household consumption clusters (mustard greens +191% over-index, chicken +38%, sweet potatoes +12% per consumption research). |
| Universal weekly staples (Wave B: bananas, dairy, bread, ground beef, apples, tomatoes, onions, cilantro) | Basket-completion pool. Assumption: a shopper who adds $15-$35 in staples to an existing $40 basket converts a produce-only order into a $55-$75 order. At scale (500 households/month), that is $90K-$210K annual incremental. (Labeled assumption.) | 18-28%. Commodity produce and dairy carry the thinnest margins in the system (bananas 15-20%, whole milk 12-18%). These are necessary loss-leaders, not profit drivers. | Low on individual SKUs. High on basket because they prevent cart abandonment on the "I still need to go to Jewel" problem. | High on basket contribution. | NECESSARY, NOT ATTRACTIVE on margin. Wave B staples are a conversion tool, not a profit center. Their job is to make the $7.99 delivery fee feel worth it. |
| Specialty / seasonal rail (microgreens, ramps, sunchokes, black garlic, daikon, heirloom varieties) | Small. These are the current hero SKUs and they are not driving repeat purchase. Low velocity, high per-unit value. | 38-50%. Highest gross margin category in the catalog. Small but real. | Low on revenue, High on margin per unit. | Declining as a share of catalog. Being demoted to specialty rail per CEO decision. | NICHE. Keep in catalog, stop spending paid acquisition dollars against them. They serve the "chef-curious" buyer who arrives organically. |
| Black-owned personal care (Wave E: soaps, oils, batana hair oil, skin care, hair care) | Speculative. If 200 active households buy 1-2 personal care SKUs/month at $15-$40 per SKU, that is $36K-$96K annually. (Labeled assumption.) | 50-65%. Personal care DTC has among the highest gross margins in consumer goods. Shelf-stable, no cold-chain, lightweight freight. | High on margin. Speculative on revenue. | High growth potential, but this is a new category requiring its own discovery and intent. These shoppers may not arrive via grocery search terms. | ATTRACTIVE LONG-TERM, PREMATURE NEAR-TERM. Build Wave A and B first. Wave E requires separate positioning and creative to drive discovery. |
| Frozen and prepared (Wave D: heat-and-eat braised greens, mac and cheese, frozen catfish, frozen biscuits) | Highest untapped demand signal from consumption research. Time-pressed households over-index heavily on heat-and-eat. | 30-45%. Prepared foods carry strong margin if co-packed at scale. Frozen veg at 35-40%. The margin upside is real. | High potential. Not accessible for 10-14 weeks. | High growth once supplier base is built. | ATTRACTIVE BUT SLOW. The bottleneck is vendor scarcity (3 frozen foods, 17 prepared foods in the DB). This pool is right to sequence last. |

---

## Value Capture

| Player or activity | Value captured | Reason |
|---|---|---|
| Uncle Mays (current state) | Negative to near-zero net margin on paid acquisition. Positive but thin margin on direct/organic orders. | The margin that exists in the catalog (30-38% on produce) is being consumed by a CAC that almost certainly exceeds first-order gross profit at 0.46% CVR and ~$439/week spend. No repeat-purchase engine is built yet because the catalog cannot support a second weekly trip. |
| Run A Way Buckers Club (single farm supplier) | Captures supplier margin on all produce and protein SKUs sold. Pricing power as sole supplier. | All current catalog revenue flows through one supplier. Uncle Mays has no leverage to negotiate better COGS until it diversifies its supplier base in Waves A and B. The single-supplier dependency also creates operational concentration risk: a bad season, farm disruption, or pricing disagreement stops the entire catalog. |
| Stripe (payment processing) | 2.9% + $0.30 per transaction (standard processing rate, industry baseline). | At $50 AOV, Stripe takes ~$1.75 per order (3.5% effective rate). Non-negotiable until order volume reaches the threshold for custom pricing. Not material but a fixed cost floor on every transaction. |
| Delivery driver / routing (EXP-002 operational layer) | Captures delivery cost spread between the $7.99 flat fee and the real per-stop routing cost. | If routing cost per stop exceeds $7.99 (a realistic scenario in south-side Chicago at low volume), the delivery fee is a margin drain, not a margin contributor. The EXP-002 painted-door test is designed to discover actual routing economics. Until resolved, delivery profitability is unknown. |
| Future Wave A-E suppliers (Black-owned small farms and producers) | Capture supplier margin on their goods. Uncle Mays captures a distribution margin and a data margin on consumption. | The product-mix reset is designed to shift value capture toward Uncle Mays by (a) sourcing directly from small producers at below-retail wholesale prices, (b) building a multi-supplier base that creates negotiating leverage, and (c) capturing basket data that no single producer has on its own. This is the data platform layer of the long-term vision activated at the SKU level. |
| Paid media platforms (Meta, Google Ads) | Capture ~$439/week in ad spend with near-zero demonstrable return at current CVR. | At 0.46% paid CVR, the majority of paid media budget is transferred to Meta and Google with no completed order to show for it. This is the most visible current value-leakage in the system and the correct reason to pause paid until assortment and funnel improve. |
| Mailchimp / Resend / Trigger.dev (comms infrastructure) | Marginal cost. Resend at free tier (3K/month), Mailchimp free tier (500 sends/month). | Email is effectively free at current volume. This is the highest-ROI retention channel available: zero variable cost, high deliverability, and owned audience. The fact that the Mailchimp audience is effectively empty (119 contacts removed, not yet re-imported from Stripe) means this low-cost pool is currently idle. |
| Black-farmed sourcing network (long-term) | Currently zero: one supplier. At scale (Waves A-E), Uncle Mays becomes a distribution channel and data buyer for dozens of Black-owned producers. | The long-term platform play is to capture the data margin (60-70% on insights per the CLAUDE.md revenue model) and the vendor services margin (70-80% on marketplace) by sitting between the Black-owned supply base and the Black household consumer base. That value pool cannot be entered until the catalog is broad enough to generate meaningful consumption data. The product-mix reset is the prerequisite, not a separate initiative. |

---

## Strategic Implications

### 1. Where to play

**Play in the repeat Black-household basket first.** The only pool that generates sustainable unit economics is a household spending $60-$120 per order, 2-4 times per month, across produce, proteins, soul-food basket staples, and pantry. That implies a minimum viable catalog of 60-80 SKUs across at least 5 substantive categories, not 43 SKUs concentrated in produce and one protein tier. Wave A (soul-food basket, $31K-$52K, 2-3 weeks) is the single fastest path to accessing this pool. Every business-day that Wave A is not live is a day the repeat-purchase pool is not addressable.

**Play on proteins as the basket anchor.** Pastured chicken (the single highest-indexed Black-household item), oxtail, smoked cuts, and fresh catfish are the anchor SKUs that turn a produce browse into a meal-planning session. The current catalog has chicken, short ribs, and lamb chops. Adding oxtail and smoked seasoning cuts (turkey necks, ham hocks) completes the soul-food protein set and directly enables the collard greens and rice cross-sell. This is the highest-leverage SKU move inside Wave A.

**Play on pantry and condiments for margin.** Rice (5 lb and 20 lb), dry black-eyed peas, cornmeal, and hot sauce carry 35-55% gross margin, require no cold-chain, and are impulse-adds to any protein order. They also solve the "I still need to stop somewhere else" problem that is suppressing repeat purchase today. Among all the Wave A SKUs, pantry and condiments have the best margin per dollar of working capital deployed.

**Play on organic and email channels before paid.** The owned email list (even at near-empty) and organic social are zero-variable-cost channels that can run the Wave A CVR test at no media spend. The 5-business-day organic test prescribed in the sourcing roadmap (Phase 3, Section 5) costs nothing and generates the evidence needed to brief the board on paid relaunch. Running paid before organic data is available wastes budget and produces uninterpretable results.

### 2. Where to avoid

**Avoid paid media reactivation until CVR gate is passed.** The current paid economics are negative. At 0.46% CVR, the brand is buying sessions that leave without converting, paying $1.00-$2.00+ per click, and getting nothing except attribution data. The math does not close at any reasonable ROAS until CVR rises above ~1.5% and AOV rises above $55. Both of those conditions require Wave A and at least partial Wave B live on site. Restarting paid at current catalog depth would be burning the SAFE capital.

**Avoid the specialty/seasonal rail as a paid acquisition hook.** Microgreens, ramps, sunchokes, black garlic, and heirloom radishes are high-margin per unit but they do not appear on any of the four top-30 consumption lists. They are the right product for the organic-discovery shopper, not the right hero for a paid campaign targeting a household that needs a week's worth of groceries. Running paid creative against these SKUs is the current state and it is not working. These SKUs belong in a "Specialty, What's in Season" rail, behind the soul-food basket and weekly staples.

**Avoid Wave D (frozen and prepared) until Waves A and B are live and generating behavioral data.** The frozen and prepared pool is structurally attractive (high perceived value, strong repeat-purchase frequency, heat-and-eat over-index in Black households) but the supplier base has 3 frozen-foods rows and 17 prepared-foods rows in the DB. Building Wave D requires net-new vendor discovery, cold-chain ops investment, and 10-14 weeks of lead time. Sequencing it before Wave A and B would consume working capital without proof of demand. The gate is correct: run the organic test, pass the CVR ladder, then fund Wave D.

**Avoid hiring a CRO/UX operator before Wave A generates baseline behavioral data.** The situation-assessment and growth-barriers phases already concluded this. The profit-pool reason is structural: a CRO/UX operator running a Baymard-style audit will correctly identify friction points in the checkout flow, but fixing checkout friction on a catalog that cannot satisfy a grocery trip still produces a leaking bucket. The operator's leverage is highest when they have a pre/post assortment baseline to optimize against, specifically a comparison of ATC rate and AOV before and after Wave A is live. Without that baseline, the 50-120K USD engagement fee funds optimization of the wrong variable.

**Avoid Wave B commodity staples (whole milk, sliced bread, bananas) as margin strategy.** Wave B is necessary for basket completion and conversion, not for margin. Whole milk, commodity bread, and bananas carry 12-20% gross margin on best-case direct sourcing, and the supplier base for these items is primarily non-Black-owned wholesale distributors. Their job in the profit pool is to prevent the shopper from going to Jewel for staples, which makes the $7.99 delivery fee feel justified and drives repeat purchase. They are not themselves margin pools; they are basket-completion infrastructure.

### 3. How to improve capture

**Compress the Wave A timeline to 2 weeks, not 3.** The sourcing roadmap identifies 19 Midwest produce suppliers (IL/IN/MI/WI) with email in the Suppliers DB, all with high Black-owned likelihood. These are warm contacts in an owned database, not cold discovery. Zoe (COO) and Anthony (CEO) can issue standardized outreach to all 19 in a single batch. The template exists (sourcing roadmap Section 1a). Getting Wave A collards, okra, rice, and smoked cuts live in 2 weeks rather than 3 cuts the delay between current state (near-zero repeat-purchase revenue) and the first behavioral proof point by 30%.

**Use the $20 cart minimum as a diagnostic, not a permanent setting.** The minimum currently blocks checkout for a shopper who puts 2-3 produce items in the cart ($10-$15 total). Once Wave A is live and lower-price-point pantry SKUs (dry black-eyed peas $3-$4, cornmeal $4-$5, hot sauce $4-$6) are on the shelf, a shopper can reach $20 with 5-6 items, which is a healthier basket. After Wave A, test lowering the minimum to $15 for organic-channel shoppers only (no paid), measure whether average order value drops or holds, and decide whether $20 is still the right floor. If AOV holds above $45 at the $15 minimum, the floor was suppressing conversion without protecting margin.

**Rebuild the Mailchimp audience from Stripe and use it immediately for Wave A launch.** The newsletter audience was cleaned to near-empty in April 2026. The Stripe customer records are the source of truth for past purchasers. Re-importing past buyers into Mailchimp for a "Wave A is live" newsletter to an audience that already trusted the brand enough to check out is the highest-expected-value marketing action available right now. It costs zero, reaches warm prospects who have already paid once, and generates the first post-assortment behavioral signal from the segment most likely to convert again.

**Structure the delivery fee for higher-AOV protection, not flat pricing.** The current $7.99 flat delivery fee is 13% of a $60 order but 40% of a $20 order. Once Wave B staples are live and AOV targets of $60-$80 are realistic, consider a tiered fee: free delivery above $65 (a meaningful loyalty signal for the repeat household), $4.99 for $35-$65 (covers margin contribution from the additional basket), $7.99 for $20-$35 (current state). This restructuring converts the delivery fee from a conversion barrier into a behavioral nudge toward larger baskets. Do not implement until Wave A and B are live and AOV data is available to set the tiers against real order distribution.

**Surface the Black-owned badge from day one of Wave A.** The badge is wired in code but inert because no SKU currently has a supplier with the Black-owned field set. Wave A has greater than 90% Black-owned sourcing by intent. The moment the first Wave A SKU is live with a supplier record properly tagged, the badge activates. This is the single highest-authenticity trust signal Uncle Mays can put in the paid creative when ads relaunch, and it costs zero incremental development. The action required is operational: tag the `BlackOwnedSupplier` field on the Run A Way Buckers Club record and on each new Wave A supplier as they are onboarded.

**Pin the profitability model to repeat-purchase LTV, not first-order margin.** At $50 first-order AOV and 30% gross margin, Uncle Mays makes roughly $15 of gross profit per order before CAC, delivery cost, and ops overhead. That unit economics does not close. At 3 orders per month, $70 AOV, and 30% gross margin, it makes $63/month per active household, before CAC is amortized. The math closes comfortably if CAC is paid once and amortized over 6+ orders. This means the strategic priority is not maximizing first-order margin (where Wave B commodity staples look unattractive) but maximizing second and third purchase (where Wave B staples are the most important investment in the catalog). The product mix reset is fundamentally a LTV-pool decision, not a SKU-margin decision.

_Data gaps: Realized gross margin by SKU or category (the 35% target is a projection; no actual order-level COGS data is in the fact base); Realized CAC by channel (Meta vs Google vs direct) from the mart_cac dbt model; BigQuery data not queried here; Actual AOV distribution across completed orders (typical first cart $30-$60 is directional; no mean/median from mart_customers); Repeat purchase rate and time-to-second-order from the mart_customers LTV fields (no live query run; data exists in BigQuery but not surfaced); Delivery routing cost per stop under EXP-002 (the $7.99 fee may be below actual delivery unit cost at current volume, which would make the delivery P&L negative); Actual add-to-cart rate and session-to-shop rate post-May-16 pause (Galileo subscription is paused; no post-pause funnel behavioral data); Wave A supplier quotes and minimum order quantities (working capital estimates of $31K-$52K are order-of-magnitude only; firm numbers require Phase 4 outreach results); Black-owned field not yet populated in the Suppliers Airtable table (cannot confirm >90% Wave A Black-owned share until field is added and outreach completes); Personal care category revenue benchmarks for Black-owned DTC brands to size the Wave E pool more precisely than the labeled assumption used here_


## 3. Strategic Choice

### strategic-options

**Uncle Mays must pursue a "Catalog-First, then Funnel" sequencing strategy: launch Wave A soul-food and Wave B commodity staples in parallel on the current stack before any paid relaunch, CRO hire, or platform decision, because assortment breadth is the binding constraint on every downstream metric and none of the other options can generate positive unit economics until two new categories are live with 10+ merchandised SKUs each.**

# Strategic Options

## Decision

How should Uncle Mays sequence the four major interventions available (catalog expansion, funnel/UX optimization, paid media relaunch, and platform or operator change) to move paid conversion from ~0.46% to the 2-4% food-DTC benchmark, given that the binding constraint is a 43-SKU produce-only catalog that cannot satisfy basket completion for any target segment, and the capital and operational runway is finite?

This is a sequencing and prioritization decision, not a binary pivot. The prior phases have converged on a clear root cause (offer inadequacy) and a directionally sound plan (6-phase product-mix reset). The strategic options question is: which parallel tracks are valid, which are premature, and what are the objective gates between phases?

---

## Options

| Option | Description | Upside | Trade-Off | What Must Be True |
|---|---|---|---|---|
| **A: Catalog-First, Parallel Waves** | Launch Wave A (soul-food basket) and Wave B (commodity staples) simultaneously on the current stack. Defer paid media, CRO hire, and platform decision until behavioral gates are hit (ATC >12%, /shop reach >40%, 3+ staple SKUs in stock). | Eliminates the binding constraint in the shortest calendar time. Unlocks Soul-Food Household and Health-Forward Professional simultaneously. Creates a real behavioral baseline to brief an operator against. | Requires sourcing and merchandising execution on two fronts at once. No paid traffic means the behavioral signal accumulates slowly via organic only. | Run A Way Buckers Club and at least one net-new supplier can deliver Wave A staples within 4-6 weeks. CEO and COO bandwidth covers joint sourcing without a dedicated ops hire. Black-owned badge logic already wired in code and activates on first Wave A SKU. |
| **B: Catalog-First, Sequential Waves** | Launch Wave A (soul-food) first. Evaluate ATC and repeat-purchase data at 30 days. Launch Wave B (commodity staples) only after Wave A behavioral signal is confirmed. Defer paid, CRO, and platform throughout. | Lower simultaneous sourcing complexity. Cleaner attribution of which wave moves the needle. | Slower time to basket adequacy. The Health-Forward Professional (current paid traffic audience) remains underserved for an additional 4-8 weeks. The cart minimum suppression problem persists longer. Competitive window for Black food e-commerce stays open longer. | The team can source and merchandise Wave A from a single net-new supplier in 4-6 weeks. Organic traffic (newsletter, social) is sufficient to generate meaningful ATC signal within 30 days at current audience size. |
| **C: Funnel-Fix First, Catalog Parallel** | Immediately hire CRO/UX operator and begin funnel remediation (homepage-to-shop navigation, trust signals, checkout UX) while catalog expansion runs in the background. Restart paid ads at minimum spend ($100-200/week) to generate behavioral data for the operator. | Operator gets real paid-traffic data during catalog expansion. Funnel and catalog improvements compound together at relaunch. | The operator is being briefed against a broken offer. Every week of paid spend at 0.46% CVR generates near-zero positive unit economics (CAC almost certainly exceeds first-order margin). Operator leverage is wasted on a funnel feeding an inadequate catalog. Contradicted by conclusion of growth-barriers and assumption-audit phases. | The conversion failure is primarily UX/friction-driven, not offer-driven. This requires disproving the root cause conclusion from all six prior phases, which would need a new controlled test. |
| **D: Platform Migration First** | Migrate from custom Next.js to headless Shopify before catalog expansion or funnel optimization. Use the migration as the forcing function to fix navigation, catalog architecture, and checkout UX simultaneously. | Single-event clean slate. Shopify ecosystem gives operators and CRO agencies a familiar toolset. Removes the operator-compatibility question for any future hire. | 3-6 month migration window creates competitive vulnerability. Catalog architecture and assortment decisions must be made before or during migration, compressing the timeline. No behavioral baseline to carry forward. The current stack has no proven conversion ceiling, so migration does not eliminate the binding constraint (the catalog). Highest-cost option in capital and calendar time. Contradicted by competitive-intel conclusion that replatforming creates a vulnerability window. | Platform is the binding constraint on operator engagement and funnel performance. This is not supported by any prior phase conclusion. |
| **E: Paid Relaunch First, Catalog Parallel** | Restart paid media at pre-pause levels ($439/week) while catalog expansion runs in parallel. Use paid traffic to accelerate behavioral signal accumulation. | Faster data accumulation. Keeps brand in paid channels during the catalog expansion window. Maintains algorithm learning continuity. | Paid channels currently generate near-zero positive unit economics (0.46% CVR, CAC exceeds first-order margin by assumption). Restarting spend before the offer improves is throwing money at a broken offer. Contradicted by the CEO's own decision to pause paid until "at least 1 new category live with 10+ merchandised SKUs plus organic-engagement evidence." |  Behavioral signal from organic is insufficient to pace catalog iteration decisions. The spend is treated as a data cost, not a revenue channel. |

---

## Evaluation

| Criteria | A: Catalog-First, Parallel Waves | B: Catalog-First, Sequential Waves | C: Funnel-Fix First | D: Platform Migration First | E: Paid Relaunch First |
|---|---|---|---|---|---|
| **Addresses binding constraint** | High: directly eliminates the offer inadequacy for both priority segments simultaneously | Medium-High: eliminates it, but 4-8 weeks slower to full coverage | Low: does not address offer inadequacy; treats symptoms | Low: does not address offer inadequacy; treats infrastructure | Low: accelerates data collection on a broken offer |
| **Speed to basket adequacy** | Fastest: Wave A + B in 4-8 weeks | Moderate: Wave A at 4-6 weeks, Wave B at 8-14 weeks | Slow: funnel fixes do not create basket adequacy | Slowest: migration absorbs 3-6 months before any catalog work compounds | Catalog work pace unchanged; paid spend does not accelerate sourcing |
| **Capital efficiency** | Highest: $31K-$52K Wave A inventory + $20K-$40K Wave B (assumption, not given), no paid spend waste, no operator burn | High: same inventory costs staged; lower simultaneous cash out | Low: $50-120K operator cost on a broken offer; plus paid spend waste at 0.46% CVR | Lowest: migration cost (est. $50-150K assumption) plus catalog work plus operator, all in sequence | Low: $439/week spend at near-zero ROI for 4-8+ weeks while catalog is built |
| **Risk level** | Medium: sourcing execution on two fronts simultaneously; mitigated by CEO+COO joint ownership | Low-Medium: lower sourcing complexity; higher opportunity cost | High: operator leverage wasted; root cause unaddressed; spend waste | Very High: migration risk, competitive window, no proven conversion ceiling on current stack | High: spend waste; no unit economics improvement until catalog catches up |
| **Operator/CRO leverage** | High: post-assortment behavioral baseline is the right brief for an operator; hire unlocks cleanly after gates are hit | High: same, with 4-8 week delay | Very Low: operator briefed against a broken offer | Medium: operator gets a clean platform but still a broken offer if catalog is not expanded | Low: operator still gets a broken-offer brief if hired during paid relaunch |
| **Competitive positioning** | Strong: fastest path to the Black-owned catalog density that competitors cannot replicate; first-mover in Black-farmed soul-food delivery preserved | Moderate: correct direction, slower pace | Weak: funnel fixes do not widen the Black-owned sourcing moat | Weak: migration pause opens vulnerability window | Moderate: maintains paid presence but does not widen moat |
| **Consistency with prior phase conclusions** | Fully consistent with all six prior phase conclusions | Fully consistent; slower execution | Contradicted by growth-barriers, assumption-audit, and customer-segmentation conclusions | Contradicted by competitive-intel conclusion | Contradicted by CEO decision and growth-barriers conclusion |

---

## Recommendation

**Option A: Catalog-First, Parallel Waves is the recommended path.**

The recommendation is direct: run Wave A (soul-food basket) and Wave B (commodity staples with Black-owned badge) simultaneously, targeting a 4-8 week delivery window, using the current custom Next.js stack and the existing single-farm supplier plus at least one net-new supplier for Wave B commodities. Every other option either fails to address the binding constraint, wastes capital on a broken offer, or creates competitive vulnerability.

**Why not Option B (sequential waves)?** The 4-8 week delay to Wave B is a meaningful cost. The Health-Forward Professional is the segment that paid traffic currently attracts and the segment being measured against the 0.46% CVR benchmark. That segment cannot build a satisfying basket from soul-food SKUs alone (it needs lower-price-point pantry and produce staples to clear the $20 minimum without a $30+ protein commitment). Parallel execution is feasible given CEO+COO joint sourcing ownership and the relatively modest inventory commitment.

**Why not Option C (funnel-fix first)?** Six prior phases have converged on offer inadequacy as the primary conversion driver. Option C inverts the causal chain. An operator hired today would be asked to optimize a funnel feeding a 43-SKU catalog that cannot build a $30-60 basket. That is not operator leverage; that is operator waste at $50-120K. The hire is correct in principle; the timing is wrong. The gate is: ATC above 12%, /shop reach above 40%, and three top-10 staple SKUs in stock, all in the same week.

**Why not Option D (platform migration)?** Platform is not in the causal chain at any point in the prior analysis. The current Next.js stack has no proven conversion ceiling. The competitive-intel phase explicitly flagged a 3-6 month migration pause as creating a vulnerability window for Instacart-powered competitors to deepen south-side penetration. The platform decision is legitimate as a long-term operator-compatibility question, but it belongs after post-assortment behavioral data and a confirmed operator engagement, not before.

**Why not Option E (paid relaunch first)?** The CEO's own decision (2026-05-16) already settled this, and the profit-pool analysis confirms it: at 0.46% CVR and $30-60 AOV, the paid model has negative expected value because CAC almost certainly exceeds first-order gross margin. Restarting spend before the offer improves generates data at a price Uncle Mays cannot afford to pay.

**Sequencing within Option A:**

Phase 1 (Weeks 1-4): Source and merchandise Wave A (collards, okra, black-eyed peas, smoked cuts or smoked turkey necks, rice or cornmeal) and Wave B commodity staples (bananas, onions, tomatoes, dry pantry). Activate the Black-owned badge on every eligible SKU. Resolve EXP-002 to a published delivery SLA. Test $15 cart minimum once Wave B low-price SKUs are live.

Phase 2 (Weeks 4-8): Organic engagement gate. Measure /shop reach, ATC, and session behavior against the relaunch thresholds using any available analytics (GA4, even without LogRocket). Reactivate LogRocket/Galileo subscription to generate segment-level behavioral data. First-30-day repeat rate from organic buyers is the critical signal.

Phase 3 (Gate hit): When /shop reach exceeds 40%, ATC exceeds 12%, and three or more top-10 staple SKUs are confirmed live and in-stock in the same calendar week, brief the CRO/UX operator shortlist (Barrel, Anatta, Bear Group) with the post-assortment behavioral data. That brief is the correct input for a platform and operator decision.

Phase 4 (Post-operator engagement): Restart paid at the pre-pause budget with new creative anchored to segment entry points (Soul-Food Household on Facebook with recipe-forward video; Health-Forward Professional on Instagram and Google search with fresh produce + Black-owned story). Evaluate platform migration only if the operator engagement surfaces a credible technical ceiling on the current stack.

**What must be true for Option A to work:**

1. Run A Way Buckers Club can supply at least 3 of the 5 Wave A soul-food SKUs within 4-6 weeks without a multi-week stockout gap.
2. CEO+COO can identify and onboard at least one net-new supplier for Wave B commodity staples (bananas, onions, tomatoes) within the same 4-6 week window. Sourcing is the execution risk, not the strategy.
3. EXP-002 painted-door test is resolved to a firm, published SLA before Wave A goes live to customers. The Soul-Food Household will not repeat-purchase on a fulfillment promise it cannot trust.
4. Organic traffic (newsletter, social) generates at least 50-100 unique /shop sessions per week during the gate-measurement period to produce statistically meaningful ATC and repeat signals. If the Mailchimp audience is still effectively empty, organic social must carry the load.
5. The $20 cart minimum is temporarily lowered to $15 as a time-bound experiment (4-week test) once Wave B low-price SKUs are live, to isolate whether minimum suppression is real for the Health-Forward Professional segment.

---

## Next Tests

The following evidence is needed before committing to the paid relaunch, operator hire, or platform decision. These are the conversion gates established across prior phases, now operationalized:

1. **Wave A + B sourcing confirmation (Week 2).** CEO and COO confirm: (a) Run A Way Buckers Club can supply at least 3 Wave A soul-food SKUs on a reliable weekly cadence, and (b) at least one net-new supplier is contracted for Wave B commodity staples. If sourcing confirms at fewer than 5 total net-new SKUs by Week 4, the parallel-wave assumption fails and Option B (sequential) becomes the fallback.

2. **EXP-002 resolution (Week 2-3).** The daily delivery painted-door test is resolved to a published SLA (specific days or windows the team can actually fulfill). If the team cannot commit to at least 5-6 delivery days per week for the service area, the customer promise must be updated before any new category goes live, or repeat-purchase from the Soul-Food Household will not occur regardless of assortment improvement.

3. **LogRocket/Galileo reactivation (Week 1).** The one-step revival (re-add LOGROCKET and NEXT_PUBLIC_LOGROCKET_APP_ID env vars, uncomment three cron lines, redeploy) should happen immediately so that Wave A/B go-live generates session-level behavioral data from day one. Without Galileo, the behavioral gate measurement relies only on GA4 aggregates, which cannot segment by SKU browse path or identify specific basket-completion failure modes.

4. **$15 cart minimum A/B test (Week 4-6, after Wave B live).** Run a 2-week time-based test (not a code A/B split, given stack constraints) at $15 minimum vs. current $20 minimum. Success criterion: ATC rate for sessions that reach /shop improves by at least 3 percentage points in the $15 window without a meaningful decline in AOV. If it does not move ATC, keep $20.

5. **Behavioral gate confirmation before operator brief (Week 6-10).** Before scheduling any operator conversation, confirm all three thresholds in the same calendar week: /shop reach above 40%, ATC rate above 12%, and at least three of the top-10 Black-household staple SKUs live and in-stock (not just listed). A single week of gate passage is not sufficient; two consecutive weeks removes noise.

6. **Pricing perception spot-check (at or before operator brief).** A structured comparison of Uncle Mays prices vs. comparable SKUs at Aldi, Whole Foods, and Direct Eats for at least 10 overlapping items. This is the only way to verify whether the "cleaner than Whole Foods, cheaper than Aldi" positioning is factually supportable at current price points. If the comparison shows Uncle Mays is priced above Aldi on commodities without a Black-owned badge on those SKUs, the positioning story breaks before paid traffic can benefit from it.


_Data gaps: Wave A and Wave B inventory cost estimates ($31K-$52K Wave A cited from profit-pool phase; Wave B estimate assumed $20K-$40K but not given in fact base) require confirmation from CEO/COO sourcing conversations before capital allocation.; Organic session volume during the gate-measurement period is unknown. The Mailchimp audience is effectively empty and social follower counts are not in the fact base. If organic weekly /shop sessions are below 50-100, the behavioral gate cannot be measured with statistical confidence on a 4-6 week timeline.; Run A Way Buckers Club capacity to supply soul-food SKUs (collards, okra, smoked cuts) is not confirmed in the fact base. The farm is described as the single supplier for the current 43 SKUs; its ability to expand categories in 4-6 weeks is an assumption.; Net-new supplier identification timeline for Wave B commodity staples is not in the fact base. CEO and COO own sourcing jointly (2026-05-17 decision) but no supplier names or timelines are confirmed.; EXP-002 painted-door test status and current routing capacity are not quantified. The fact base says the test is 'running' but does not give a timeline to resolution or a current fill-rate metric.; Pricing comparison data vs. Aldi and Whole Foods for overlapping SKUs does not exist in the fact base. The 'cleaner than Whole Foods, cheaper than Aldi' claim cannot be verified without a live SKU-level price audit.; Platform migration cost estimate ($50-150K) is an assumption inserted for comparison purposes and not grounded in any vendor quote or scope of work in the fact base.; Post-assortment AOV assumption for the Soul-Food Household ($45-70) and Health-Forward Professional ($30-50) are inherited from the customer-segmentation phase and labeled as estimates. Actual AOV for these segments is unknown until Wave A/B orders are collected._

### portfolio-review

**Uncle Mays must concentrate all resources on Wave A and Wave B catalog expansion first, because every other initiative in the portfolio, from CRO operator to paid media restart, produces zero or negative returns until two new categories are live and basket completion is structurally possible.**

# Portfolio Review

## Portfolio Scope

**Included:** All active and pending initiatives that compete for Uncle Mays' finite sourcing bandwidth, engineering capacity, operating cash, and founder time between now and the paid-media relaunch gate. Specifically: the six product-wave catalog initiatives (Waves A through E plus the existing 43-SKU base), three funnel/platform investments (CRO operator hire, platform migration, LogRocket reactivation), two operating bets (EXP-002 delivery SLA resolution, cart-minimum experiment), and the paid media program (Meta + Google, paused).

**Excluded:** The Hyde Park physical flagship and the $400-750K SAFE raise. These are the correct strategic destination but they are not in the e-commerce funnel portfolio being reviewed here and their timelines are decoupled from the relaunch gate.

**Decision question:** Given one binding constraint (43-SKU produce-only catalog cannot support basket completion), where should Uncle Mays invest, hold, fix, or exit to move paid CVR from 0.46% into the 2-4% food-DTC benchmark range in the next 60-90 days?

---

## Evaluation Matrix

Criteria definitions:
- **Attractiveness:** Size of the conversion or revenue impact if the initiative succeeds.
- **Performance:** Current result vs. expected, or readiness of the initiative to deliver.
- **Fit:** Alignment with the Black-farmed/Black-owned positioning, target segments (Soul-Food Household, Health-Forward Professional), and the Catalog-First sequencing strategy.
- **Right To Win:** Unique sourcing, cultural credibility, or operational advantage Uncle Mays holds that others cannot replicate quickly.
- **Recommendation:** Invest / Hold / Fix / Harvest / Exit.

| Item | Attractiveness | Performance | Fit | Right To Win | Recommendation |
|---|---|---|---|---|---|
| **Wave A: Soul-Food Basket** (collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) | High: directly unlocks the Soul-Food Household, the highest-LTV segment with 72-191% over-index on exactly these SKUs; $31-52K inventory estimate (assumption, labeled); highest AOV-contribution category after proteins | Low: zero SKUs live today; sourcing from a single farm (Run A Way Buckers Club) does not cover most of these items; supplier expansion required | Very high: sits at the center of the Black-farmed thesis, carries near-100% Black-owned sourcing integrity, is the category that makes the positioning real rather than aspirational | High: Instacart and DoorDash cannot offer Black-farmed collards or smoked turkey necks with a verifiable sourcing story; category differentiation is durable | **INVEST: immediate priority, parallel with Wave B** |
| **Wave B: Commodity Staples** (bananas, onions, tomatoes, pantry) | High: lowers per-item price floor below $4, unblocks Health-Forward Professional from the $20 cart minimum, adds basket-completion SKUs that every segment needs on every trip | Low: zero SKUs live; sourcing is simpler than Wave A (commodity distributors available) but the Black-owned badge coverage is lower; CEO decision is to badge where possible, sell wholesale otherwise | High: supports all four segments, removes the basket-completion barrier, enables the $15 cart-minimum test, and does not conflict with the Black-farmed positioning if badged SKUs are surfaced prominently | Medium: commodity staples are not a moat, but combining them with Black-owned badge curation and south-side-specific delivery creates a basket that no incumbent bundles today | **INVEST: immediate priority, parallel with Wave A** |
| **Wave C: Expanded Proteins** (oxtail, smoked turkey, additional chicken cuts, broader seafood) | High: proteins are the highest per-unit AOV contributor already in the catalog; oxtail has documented 191% Black-household over-index; basket AOV impact is immediate | Medium: Run A Way Buckers Club already supplies some proteins; category is partially proven; gap is coverage (no oxtail, no smoked cuts, no seafood) | Very high: proteins are the single highest-leverage Wave A complement; a Soul-Food Household basket without smoked turkey necks or oxtail is incomplete | High: Black-farmed proteins with a sourcing story are not available from any incumbent south-side online channel | **INVEST: sequence directly after Wave A SKUs are live, not before** |
| **Wave D: Frozen and Prepared / Heat-and-Eat** | High: highest frequency repeat purchase in urban grocery delivery nationally; captures the Convenience Shopper segment; highest perceived value per dollar for time-pressed households | Low: no SKUs live; thinnest supplier base of all waves; cold-chain and food safety complexity is highest; 10-14 week timeline estimate (assumption) | High: prepared soul-food (mac and cheese, greens, cornbread) with Black-owned sourcing is a unique category no incumbent offers online in Chicago | Medium: right to win exists but requires new operational infrastructure (cold-chain SKU management) that Uncle Mays does not have today | **HOLD: unlock only after Waves A, B, and C produce behavioral data; do not dilute sourcing bandwidth now** |
| **Wave E: Black-Owned Personal Care** (soaps, batana oil, hair/skin care) | Medium-High: personal care DTC margins typically 55-70% (assumption, labeled); shelf-stable, no cold chain, full Black-owned sourcing integrity; $15-25K estimated inventory (assumption, labeled) | Low: zero SKUs live; requires separate product discovery and cross-sell mechanism beyond grocery browsing | High: extends the brand's cultural mandate beyond food; Black-owned personal care has no incumbent in the south-side delivery channel | High: batana oil and culturally-specific hair/skin care are not available through Instacart or DoorDash; differentiation is genuine and hard to copy | **HOLD: strong second-order bet, but do not dilute Wave A and B bandwidth; unlock when grocery catalog reaches 80+ SKUs and a cross-sell discovery mechanism is built** |
| **Existing 43-SKU Base** (greens, roots, microgreens, current proteins) | Low as a standalone offer: cannot support basket completion above $20-30 AOV without a protein anchor; 5.5% ATC rate is the behavioral proof | Low: producing a 0.46% paid CVR; /shop reach 25%; specialty SKUs (ramps, sunchokes, microgreens, black garlic, daikon) are CEO-flagged for demotion | Medium: the core produce assortment is on-strategy and on-brand; proteins are strong; specialty rail demotion is correct | High on proteins; medium on specialty produce | **FIX: demote specialty SKUs to a What's-in-Season rail per CEO decision; hero the proteins and core produce; do not remove or archive, just re-merchandise** |
| **Paid Media Program** (Meta + Google, ~$439/week pre-pause) | Low at current CVR: CAC almost certainly exceeds first-order gross profit margin at 0.46% CVR and $30-60 AOV; negative expected value confirmed across profit-pool analysis | Very low: paused since 2026-05-16 with no behavioral data since; pre-pause performance was the source of the 0.46% CVR measurement | Low until assortment gate is met: paid traffic into a 43-SKU catalog is the wrong sequencing; reactivating now destroys cash without building a customer base | Low until relaunch gate: no competitive advantage in paid acquisition before the catalog gives shoppers a reason to convert | **EXIT from active spend until the three-threshold gate is met: /shop reach above 40%, ATC above 12%, at least three top-10 Black-household staple SKUs live and in-stock, confirmed in the same calendar week** |
| **CRO/UX Operator Hire** (Barrel, Anatta, Bear Group; $50-120K, 90-day trial) | High when unlocked: a post-assortment funnel with the right behavioral baseline could close the gap from 40%+ /shop reach to 2-4% paid CVR; highest leverage investment in Phase 2 | Low now: no post-assortment behavioral data exists to brief against; LogRocket is paused; Mailchimp audience is empty; any operator hired today optimizes the wrong funnel | High in the right sequence: CRO work is the correct Phase 2 lever once offer and baseline exist | Medium: operator's leverage depends entirely on having a behavioral baseline to improve against | **HOLD with defined unlock: hire when /shop reach exceeds 40% and ATC exceeds 12% in the same week post-assortment; use that data as the operator brief** |
| **Platform Migration to Headless Shopify** | Low-Medium: Shopify's ecosystem (apps, operator familiarity) has long-run appeal; short-run conversion upside is unproven and likely smaller than assortment or funnel changes | Low: no evidence that the current Next.js stack is the binding constraint; checkout is Stripe PaymentElement embedded, not a friction source identified in the funnel data | Low now: a 3-6 month migration pause creates a competitive vulnerability window and delays the post-assortment behavioral data collection that every other decision depends on | Low: Uncle Mays has no platform-specific moat to protect or gain | **EXIT from active consideration: defer until post-operator engagement and post-assortment behavioral data; revisit only if operator identifies a specific stack constraint that blocks a conversion lever** |
| **LogRocket / Galileo Reactivation** | High: the only product-analytics tool that can generate session-level behavioral data needed to brief the CRO operator, measure post-assortment ATC improvements, and validate the relaunch gate thresholds | Low: subscription paused since 2026-05-28; no behavioral data flowing; reactivation is a one-step action (re-add two env vars, uncomment three cron lines, redeploy) | Very high: post-assortment behavioral measurement is the prerequisite for every Phase 2 decision | High: the CTO auto-ship lane and Galileo-first standing rule are already in place; reactivation restores an existing capability, not a new one | **INVEST: reactivate immediately as part of Wave A and B launch preparation; the relaunch gate thresholds cannot be measured without session-level data** |
| **EXP-002 Daily Delivery SLA Resolution** | High: fulfillment trust is the primary repeat-purchase driver for the Soul-Food Household, the highest-LTV segment; an unresolved SLA suppresses LTV independent of assortment quality | Low: painted-door test still running; the 'every day' customer promise runs ahead of actual driver routing capacity; trust gap is live | Very high: delivery reliability is a prerequisite for any repeat-purchase retention strategy in the Soul-Food Household segment | High: operational credibility is a moat once earned; broken promises are a moat-destroyer | **INVEST: resolve EXP-002 to a firm, published, customer-facing SLA before any paid relaunch; this is parallel-priority with Wave A and B catalog work** |
| **$20 Cart Minimum Experiment** | Medium: a $15 floor test after Wave B launches could reduce basket-incompletion abandonment for the Health-Forward Professional segment; low cost to test | Low: current $20 minimum is not the binding constraint today but becomes a suppressor when Wave B sub-$4 SKUs go live | High: directly addresses a segment-specific conversion barrier identified in the customer segmentation phase | Medium: pricing test requires Wave B to be live first; no right-to-win advantage, just a conversion lever | **FIX: schedule the $15 test for the week Wave B staples go live; do not implement before then or the test signal is confounded with the catalog change** |

---

## Allocation Moves

| Move | Rationale | Resource Implication |
|---|---|---|
| **Invest: Wave A and Wave B catalog expansion, parallel** | These are the only two moves that directly dissolve the binding constraint (basket incompletion). Every other initiative is either downstream of this or independent. The $31-52K Wave A and Wave B inventory estimates (assumption) are the highest-ROI sourcing spend in the portfolio. | Anthony and Zoe own sourcing jointly per CEO decision. Engineering: add SKUs and category pages to Airtable-driven catalog. No platform change. Timeline target: 10+ merchandised SKUs per wave live within 60 days. |
| **Invest: LogRocket/Galileo reactivation** | The relaunch gate thresholds (/shop reach, ATC rate) cannot be measured without session-level data. Reactivation is a one-step, low-cost operation. Without this, the team is navigating post-assortment changes blind. | CTO action: re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel and Trigger.dev, uncomment three cron lines, redeploy. Under one hour of engineering time. Cost is the LogRocket subscription rate. |
| **Invest: EXP-002 delivery SLA resolution** | Fulfillment trust governs LTV for the Soul-Food Household. Wave A unlocks that segment, and the segment's repeat-purchase value is only capturable if the delivery promise is credible. Resolution before paid relaunch is non-negotiable. | Anthony and the operations team. Resolve the test to a firm SLA: specify exactly which days and windows are guaranteed, publish that SLA on the /shop and checkout pages, update customer-facts.md. |
| **Fix: Re-merchandise existing 43 SKUs** | The specialty SKUs (ramps, sunchokes, microgreens, black garlic, daikon) are crowding the hero rail and confusing the paid shopper's first session. Demoting them to a Specialty / What's-in-Season rail per CEO decision improves the browse-to-ATC path without adding new inventory. | Engineering: update the Airtable catalog fields to flag specialty SKUs and adjust the /shop sort/filter logic. Design: update hero rail imagery to feature core produce and proteins. Estimated: 1-2 days. |
| **Fix: $15 cart minimum test** | The $20 minimum suppresses conversion for Health-Forward Professional shoppers adding 2-3 low-price-point Wave B commodity SKUs. Test at $15 the week Wave B goes live to isolate the minimum's effect from the catalog change. | Engineering: one parameter change in cart-pricing-constants.ts. Must be timed with Wave B launch to avoid confounding signals. |
| **Hold: CRO/UX operator hire** | No post-assortment behavioral baseline exists to brief against. Any operator hired today would optimize a funnel that feeds a broken offer. The hold is time-gated, not indefinite: hire when /shop reach exceeds 40% and ATC exceeds 12% in the same week. | No spend commitment now. Use the hold period to: (1) request a brief template from each shortlisted operator (Barrel, Anatta, Bear Group), (2) prepare the behavioral data package they will need (LogRocket session exports, post-assortment funnel data), (3) confirm each operator's Next.js/custom-stack experience. |
| **Hold: Waves D and E** | Wave D (frozen/prepared) and Wave E (personal care) are correct strategic bets but sourcing bandwidth is finite and both waves require new operational infrastructure. Adding them now dilutes Wave A and B velocity without improving the conversion constraint. | Maintain the vendor sourcing pipeline (Airtable app3raEVB9kHeUoHE) for Wave D and E contacts. No active sourcing outreach until Wave A and B produce behavioral data (target: 30 days post-launch). |
| **Exit: Paid media spend** | The program has provably negative unit economics at current CVR and AOV. Reactivating before the three-threshold gate wastes cash that is better allocated to Wave A and B inventory. The gate is objective and measurable: do not reactivate until the same calendar week shows /shop reach above 40%, ATC above 12%, and at least three top-10 Black-household staple SKUs live and in-stock. | Zero spend commitment. Maintain the existing Meta and Google Ads account structure, audience configurations, and creative assets so relaunch is a toggle, not a rebuild. Update ad creative to reflect Wave A and B SKUs before reactivation. |
| **Exit: Platform migration to headless Shopify** | Not the binding constraint at any stage. Migration introduces a 3-6 month pause that delays post-assortment behavioral data collection, creates competitive vulnerability, and defers every other Phase 2 decision. Exit from active consideration does not mean never: revisit after the CRO operator engagement if the operator identifies a specific stack constraint. | No engineering commitment to migration planning. Redirect that bandwidth to Wave A and B catalog work and LogRocket reactivation. |

---

## Decisions Required

1. **Wave A and B sourcing commitment: who is the second and third supplier, and by what date?** Run A Way Buckers Club cannot supply collards, smoked turkey necks, oxtail, bananas, or pantry staples. Anthony and Zoe must identify and onboard at least two new Black-owned or Black-farmed suppliers within 30 days or the Wave A and B timeline slips. This is the single most time-sensitive decision in the portfolio.

2. **EXP-002 resolution: what is the firm delivery SLA, and when is it published?** The painted-door test must close to a specific, customer-facing commitment (for example, 'delivery available Tuesday through Saturday, morning through evening window, within the service area') before paid relaunch. The decision requires Anthony and the operations team to agree on what the routing infrastructure can actually guarantee today, not what it can aspirationally deliver at scale.

3. **LogRocket reactivation timing: does the CTO reactivate this week, or after Wave A and B launch?** Reactivating now gives four to eight weeks of post-re-merchandising baseline data before the new waves go live, which improves the signal quality of the post-wave measurement. Waiting until launch makes Wave A and B the first clean data point. The tradeoff is baseline richness vs. subscription cost. The recommendation is to reactivate now: the measurement gap from the 2026-05-28 pause is already costing signal, and the cost of the subscription is lower than the cost of making Phase 2 decisions without behavioral data.

4. **Relaunch gate: what is the exact calendar commitment for measuring the three thresholds?** The gate criteria (/shop reach above 40%, ATC above 12%, three top-10 staple SKUs live and in-stock) are defined, but the team needs a specific review date. Recommendation: set a hard 60-day review from the date Wave A and B first SKUs go live. If the gate is not met at 60 days, extend sourcing and re-merchandise before any paid dollar is committed.

5. **CRO operator brief preparation: which operator is the leading candidate, and what data package will they require?** Use the hold period to engage Barrel, Anatta, and Bear Group with a brief that describes the custom Next.js stack, the Airtable-driven catalog architecture, LogRocket as the analytics layer, and the post-assortment behavioral baseline that will be ready at the time of hire. Confirm each operator's custom-stack experience before committing the $50-120K. The decision to hire should be made at the 60-day relaunch gate review, not before.


_Data gaps: Wave A and Wave B inventory cost estimates ($31-52K and the Wave B equivalent) are assumptions from the profit-pool phase, not vendor quotes. Actual costs depend on supplier negotiations Anthony and Zoe have not yet completed. First vendor bids required to validate the investment case.; Post-assortment CVR, ATC rate, and /shop reach are unknown because LogRocket has been paused since 2026-05-28 and paid ads have been paused since 2026-05-16. There is no behavioral baseline against which to measure the impact of the specialty-SKU re-merchandising already done or the Wave A and B additions.; EXP-002 daily delivery test results are unresolved. The actual routing capacity per day, cost per delivery, and driver availability have not been shared in the fact base. The firm SLA decision requires this operational data before it can be published to customers.; Personal care margin assumption (55-70% DTC) is a category-level benchmark, not a Wave E supplier quote. Uncle Mays has not run a personal care product through its fulfillment chain, so actual landed margin and logistics cost per unit are unknown.; The $15 cart minimum test result is entirely hypothetical until Wave B commodity SKUs are live and the test is run. No A/B data exists. The conversion impact of moving from $20 to $15 minimum is an assumption, not a measured outcome.; CRO operator cost and timeline ($50-120K, 90-day trial) are estimates from prior engagement context, not signed proposals from Barrel, Anatta, or Bear Group. Each operator's minimum data requirements and custom-stack experience have not been confirmed.; Black-household top-10 staple SKU list by purchase frequency in the Chicago south-side market has not been compiled from primary or secondary data (Numerator pull was budget-declined by CEO). The three-threshold relaunch gate requires naming specific SKUs as live, and that list does not yet exist in the fact base._

### pricing-strategy

**Uncle Mays' pricing architecture is structurally sound for high-AOV repeat baskets but is actively destroying conversion for every low-AOV, first-visit shopper the paid funnel attracts today, and the highest-leverage pricing intervention is not a price cut but a $15 cart minimum test paired with a delivery-fee threshold that rewards the basket size the brand needs to be profitable.**

# Pricing Strategy

## Pricing Objective

The pricing objective for Uncle Mays in this phase is **basket-size growth and first-conversion recovery**, not margin expansion or price increase. Every pricing lever must be evaluated against a single question: does it increase the probability that a first-time paid visitor builds a $40+ cart and completes checkout? Margin optimization is a second-phase objective, sequenced after assortment expansion and paid CVR reach the relaunch gates established in prior phases (/shop reach above 40%, ATC above 12%).

Secondary objective: retain and grow the repeat Soul-Food Household segment (the highest-LTV segment identified in customer segmentation) through pricing structures that reward weekly basket-building behavior.

---

## Diagnosis

| Area | Evidence | Issue | Impact |
|---|---|---|---|
| Cart minimum ($20) | Produce-only basket caps at $12-18 for 2-3 items (kale $3.00/0.3 lb, candy carrots $1.50/0.5 lb, sweet potato $2.50 each). The minimum fires before checkout loads for a meaningful share of produce-only first visits. | The $20 floor is calibrated to the wrong catalog. It was set when proteins and pantry were expected to fill baskets. At 43 SKUs it excludes shoppers who cannot find enough items to cross the line. | Assumption: estimated 15-30% of would-be converters are blocked at the minimum today (data gap: no cart-abandonment data by abandonment-value tier). |
| Delivery fee ($7.99 flat) | At $20 AOV: 40% of order value. At $40 AOV: 20%. At $60 AOV: 13%. At $100 AOV: 8%. The fee is flat regardless of basket size, penalizing small baskets and providing no incentive to build a larger cart. | The flat fee creates an asymmetric cost burden: the shoppers with the smallest baskets (the ones the brand most needs to convert and grow) pay the highest effective fee rate. The fee is not a barrier for the weekly Soul-Food Household at $70-$100+ AOV but it is a deterrent at the $20-$40 first-order range. | Structural CAC erosion: if paid shoppers arrive with $30-$40 intent-to-spend, the $7.99 fee raises their perceived total cost by 20-27% before a single SKU is added. This compounds the basket-incompletion problem. |
| Price positioning claim ("cleaner than Whole Foods, cheaper than Aldi") | This claim is unverified against live shelf prices. Available price anchors: kale/chard $3.00 (0.3 lb = $10/lb effective), candy carrots $1.50 (0.5 lb = $3/lb effective), sweet potato $2.50 each, pea shoots $5.00 (1 oz = $80/lb effective). Whole Foods Chicago: organic kale typically $2.50-$3.50/bunch (8-12 oz, $4-$6/lb effective). Aldi: conventional kale $0.89-$1.29/bunch. | At current price points Uncle Mays is likely competitive with Whole Foods on some specialty SKUs but is not 'cheaper than Aldi' on conventional items. If shoppers run a mental price comparison mid-browse, the positioning claim could backfire and reduce perceived value rather than reinforce it. | The positioning claim needs to be verified SKU-by-SKU before Wave A launches. If even three or four anchor SKUs fail the claim, the trust signal reverses. |
| No active promo codes | FRESH10 and FRESH30 retired 2026-05-18. Listed price equals price paid. This is the correct call for isolating conversion signal, per the CEO decision. | No promo exists for first-order friction reduction. New visitors have no soft landing: they see full price plus $7.99 delivery with no promotional offset. For a brand with no brand equity yet among paid traffic, this is a trust gap, not a price problem, but it has a pricing solution. | Assumption: first-order free-delivery threshold (rather than a percentage discount) would reduce the delivery fee deterrent without sacrificing per-unit margin. |
| List-price mix shift | The highest-AOV-contribution SKUs (proteins: whole chicken $32, beef short ribs $8.50-$12.50/lb, lamb chops $10/pair, eggs $5.99/dozen) are already in the catalog but do not appear to be merchandised as the basket anchors. Specialty low-volume SKUs (pea shoots $5/oz, microgreens) are priced at premium specialty rates that do not belong in the primary catalog rail. | The price architecture is currently inverted: high-price, low-demand specialty items are visible alongside everyday items, creating sticker shock without value justification for the paid shopper arriving from a 'fresh produce delivery' search intent. | Perceived price level is set by the highest-visibility SKUs. If pea shoots ($5/oz, or $80/lb effective) are above the fold next to carrots ($3/lb), the store reads as premium specialty, not 'accessible Black-farmed grocery.' |
| Subscription model | One grandfathered subscriber (Doina, $55/week via Stripe direct). No subscription tier available for new customers. The Wave A/B Soul-Food Household segment is the highest repeat-purchase candidate in the system. | No subscription pricing structure means every repeat purchase requires a new conversion decision, raising the effective CAC of the repeat cycle and forfeiting the routing-efficiency gains that come from predictable weekly orders. | LTV gap: if the Soul-Food Household converts at $60-$80/week and repeats 20+ times per year, the LTV is $1,200-$1,600/year. Without a subscription lock or retention pricing mechanism, each repeat order is a fresh conversion event. |
| Black-owned badge (inert) | Badge is wired in code but no SKU renders one. 100% of current Run A Way Buckers Club SKUs are Black-farmed and would qualify. | A verifiable Black-owned badge is the primary non-price differentiation signal that justifies a premium over Whole Foods and Aldi. Without it active, the brand is competing on price alone, which it cannot win against Aldi and may not win against Whole Foods. | The inert badge is a pricing-power destroyer: it removes the key reason a culturally-aligned shopper would pay 10-20% more than a conventional alternative. |

---

## Segment Price Logic

| Segment | Value Driver | WTP Signal | Pricing Move |
|---|---|---|---|
| Soul-Food Household (highest-priority, highest-LTV) | Black-farmed sourcing credibility, culturally specific items (collards, okra, smoked cuts, black-eyed peas), weekly basket completion, no subscription lock-in required | Doina at $55/week is the only behavioral proof point. Survey-level: 97% intent-to-shop (directional, not behavioral). Assumption: WTP at $60-$90/week for a full soul-food basket with Black-owned badge, based on Whole Foods Hyde Park price anchoring in the same ZIP code. | (1) Activate Black-owned badge on all eligible Wave A SKUs at launch. (2) Price Wave A items at Whole Foods parity, not Aldi parity (justify with sourcing story, not discount). (3) Introduce an optional weekly subscription at $59-$79/week (pre-selected basket with customization) once Wave A has 5+ repeat orders as behavioral proof. |
| Health-Forward Professional (current paid-traffic audience, 0.46% CVR) | Premium produce, Black-farmed credential, convenience (daily delivery), no long-term commitment | Current CVR of 0.46% reveals low realized WTP at current offer, but the failure is more likely basket incompletion than price resistance. These shoppers transact at Whole Foods routinely and will pay Whole Foods-equivalent prices for comparable quality. | (1) Lower the cart minimum to $15 after Wave B staples lower per-item price floor. (2) Test a free-delivery threshold at $45+ to replace the flat $7.99 on orders above that level. (3) Keep list prices at or near Whole Foods parity; do not discount to Aldi levels, which would undermine the quality signal. |
| Convenience Shopper (future, Wave D) | Time savings, heat-and-eat, predictable delivery windows | No behavioral data yet. Urban food-delivery DTC benchmarks (Thistle, Daily Harvest, Hungryroot): $8-$15 per serving, $40-$80 per order, free delivery above $50. | Defer pricing design until Wave D (prepared/heat-and-eat) is in sourcing. Benchmark against Thistle and Daily Harvest for the prepared-meal tier when ready. |
| Gift / Exploratory Buyer (future, Wave A/B) | Discovery, gifting occasion, brand story, novelty | No behavioral data. Gift basket AOV in specialty food DTC typically $45-$85. | No pricing action needed now. Design a curated gift SKU or gift-card mechanic at Wave A/B launch as an add-on, not a primary revenue stream. |

---

## Recommended Moves

**Move 1: Lower the cart minimum to $15 immediately after Wave B staples are live (not before).**

The $20 minimum was calibrated to a catalog where proteins were the assumed basket-filler. Once Wave B commodity staples (bananas, onions, tomatoes at $1.00-$2.50/unit) are live, a shopper can reach $15 with 6-8 items. The $20 floor remains above the pantry add-on price for many SKUs. Implementation: change the minimum in cart-pricing-constants.ts simultaneously with Wave B launch so the two changes are evaluated together. Run an A/B test if traffic volume supports it (minimum: 500 sessions per variant); if not, run a pre/post comparison with a 2-week hold window.

Rationale from prior phases: growth-barriers analysis identified the $20 minimum as the primary suppressor in the pantry/snack segment at sub-$4 per-item price points. Market-mapping analysis confirmed testing $15 as a priority pricing experiment after Wave B. Customer-segmentation analysis identified it as a real suppressor for the Health-Forward Professional who arrives for two or three produce items.

**Move 2: Replace the flat $7.99 delivery fee with a tiered structure tied to basket size.**

Proposed tiers (subject to operational margin verification):
- Orders at $60+: free delivery (target: Soul-Food Household weekly basket)
- Orders $35-$59.99: $4.99 delivery
- Orders $20-$34.99: $7.99 delivery (current rate, unchanged for this range)
- Orders under the minimum (post-Move 1, below $15): blocked (no change)

Rationale: the flat fee punishes exactly the basket sizes the brand needs to grow. Free delivery above $60 creates a strong behavioral incentive to add one more item, which is the single most effective basket-building tactic in food DTC (Amazon, Thrive Market, Hungryroot all use this mechanic). The $35 threshold is where the fee drops from 23% to 14% of order value, which is the range where delivery fee stops being the dominant conversion objection.

Risk: free delivery above $60 reduces revenue per order by $7.99 on large baskets. This is a margin trade. The bet is that free delivery increases large-basket frequency enough to offset the per-order fee loss. This must be verified against delivery economics (driver cost per route is a data gap).

**Move 3: Activate the Black-owned badge on all eligible SKUs at Wave A/B launch, and use it as the primary price-justification mechanism.**

The badge is wired in code but inert. Activating it does not require a price change, but it changes the pricing context: a shopper who sees "Black-owned farm, Pembroke IL" next to a $3.00 kale bundle is making a different purchase decision than a shopper comparing it against a $0.89 Aldi bunch. The badge is the price anchor, not the price cut. Every Wave A soul-food item and every existing Run A Way Buckers Club SKU should show the badge on launch day, before Wave A goes live.

This move is zero-cost, zero-risk, and directly addresses the assumption-audit finding that the pricing claim "cleaner than Whole Foods, cheaper than Aldi" may be misaligned for specialty Black-farmed items. The badge reframes the comparison from commodity price to sourcing story.

**Move 4: Verify price positioning claim SKU-by-SKU against live Whole Foods and Aldi shelf prices before Wave A launches.**

This is a pre-launch audit, not a price change. Scrape or manually check 10-15 comparable SKUs at Whole Foods Hyde Park and Aldi (closest south-side location) and compare to Uncle Mays list prices. Items where Uncle Mays is more expensive than Whole Foods (after the Black-owned framing) should either be repriced to parity or given explicit sourcing-story copy that justifies the premium. Items where Uncle Mays is already cheaper than Whole Foods should be called out explicitly in on-page copy.

The claim "cleaner than Whole Foods, cheaper than Aldi" is currently unverified. If it holds for core produce items, it is a powerful conversion tool. If it fails on even a few visible SKUs, it creates a trust deficit. The audit takes one hour and protects the entire pricing architecture.

**Move 5: Design a first-order delivery incentive (free delivery at $45+) to replace the retired promo codes, for use only at paid relaunch.**

Do not activate any promo codes before the assortment-expansion relaunch gate is hit. When paid ads restart, a first-order free-delivery threshold at $45+ orders serves two functions: it reduces the delivery-fee objection for the Health-Forward Professional without a percentage discount (which erodes per-unit margin), and it creates a basket-building incentive aligned with the delivery-tier structure from Move 2.

Implementation: a Stripe coupon applied automatically at checkout when the session is flagged as a first-order paid-acquisition session (UTM source present, no prior Stripe customer ID). This is cleaner than a promo code because it is invisible to the shopper until the cart crosses the threshold, which reduces the "promo-hunting" behavior that percentage discounts attract.

**Move 6: Design an optional weekly subscription tier at Wave A/B launch, not a subscription requirement.**

The grandfathered $55/week subscriber (Doina) is behavioral proof that the Soul-Food Household segment will subscribe to a predictable weekly delivery. A $59-$79/week subscription (with 5-7 pre-selected items that can be swapped) would capture that LTV structure at scale. The critical design constraint: subscription must be an opt-in at checkout, not a barrier to one-time purchase. The prior design flaw was coupling subscription to access; the fix is positioning subscription as a loyalty reward (free delivery, priority window selection, locked price) for customers who have already made one or two one-time purchases.

Timing: do not launch the subscription tier until Wave A has generated at least 5 repeat orders from non-founder customers as behavioral proof of repeat-purchase intent. Then price it at a $4-$8/week discount to the equivalent one-time basket to provide a clear switching incentive.

---

## Risks and Tests

**Risk 1: Lowering the cart minimum from $20 to $15 reduces average AOV and erodes delivery margin on small orders.**

Mitigation: the tiered delivery fee (Move 2) directly addresses this. At $15-$19.99 orders, the $7.99 delivery fee applies unchanged, which means the economics on small baskets are no worse than today. The minimum reduction is a conversion experiment, not a margin giveaway. If small-basket orders become a large share of volume at thin margins, reset to $18 or $20. Gate the rollback on a clear threshold: if orders under $30 exceed 25% of weekly order volume in the first two weeks post-launch, revert.

**Risk 2: Free delivery above $60 (Move 2) trains shoppers to hold out for the threshold, reducing orders in the $40-$59 range.**

This is a known risk in tiered delivery structures. Mitigation: set the free threshold at $60, not at a round number like $50, which reduces the threshold-gaming behavior. Monitor order distribution in the $50-$65 range post-launch. If bunching appears (many orders just above $60 and very few at $50-$59), the threshold is too visible and should be tested at $65.

**Risk 3: The price positioning audit (Move 4) reveals that Uncle Mays is more expensive than Whole Foods on multiple high-visibility SKUs.**

If this happens, the response is not to lower prices but to build explicit sourcing justification copy ("Run A Way Buckers Farm, Pembroke IL, Black-owned since 2018") that shifts the comparison from commodity price to sourcing story. A shopper who understands why the item costs more will pay more. A shopper who sees only a higher price will leave.

**Risk 4: The subscription tier (Move 6) cannibalizes one-time order revenue without improving LTV if it is priced too aggressively.**

Mitigation: price the subscription at no more than a $6/week discount to the equivalent one-time basket. At $59/week for a $65 equivalent one-time basket, the discount is 9% and the margin trade is favorable given routing-efficiency gains. Do not offer a free-trial subscription until there is a reliable churn-recovery sequence wired (Resend or Mailchimp).

**Pilot design and sequencing:**

All pricing tests should be run in this sequence, tied to the catalog-expansion phases from the strategic-options conclusion:

1. Pre-Wave A launch (now): Price audit against Whole Foods and Aldi (Move 4). Activate Black-owned badge code-side (Move 3). No price changes yet.
2. Wave A/B launch day (target: 6-8 weeks): Lower cart minimum to $15. Deploy tiered delivery fee structure. These two changes go live simultaneously so their combined effect on AOV and conversion can be measured as a single package.
3. Two weeks post-Wave A/B launch: Measure /shop reach, ATC rate, and average order value against the relaunch gates. If ATC exceeds 12% and at least 10 orders have been placed, proceed to paid relaunch with first-order free-delivery-at-$45 incentive (Move 5).
4. Four weeks post-paid-relaunch: If the Soul-Food Household segment shows repeat purchase signals (2+ orders from the same customer in 30 days), design and soft-launch the subscription tier (Move 6) as an opt-in at the post-purchase screen.

**Metrics to track (data gaps that must be instrumented before Wave A/B launch):**

- Order value distribution by $5 bucket ($15-$20, $20-$25, $25-$30, etc.) to catch cart minimum suppression
- Delivery fee as a percentage of order value by order (to verify the tiered-fee economics)
- ATC rate by SKU category (produce vs. protein vs. pantry once Wave A/B is live)
- Repeat purchase rate at 30 days by first-order AOV tier (to validate LTV assumptions for subscription pricing)

Note: LogRocket is paused as of 2026-05-28. Galileo insights and session-level funnel data are unavailable until the subscription is re-enabled. Stripe and GA4 will be the primary measurement sources for the above metrics during the pause window. Restore LogRocket before paid relaunch so session-level cart-abandonment data is available to validate the pricing tests.


_Data gaps: Driver cost per delivery route by ZIP cluster: needed to verify whether free delivery above $60 is margin-neutral or margin-negative given actual last-mile economics, and to set the correct free-delivery threshold.; Cart abandonment data by abandonment-value tier (e.g., carts abandoned at $10-$14.99, $15-$19.99, $20-$24.99): needed to quantify how many sessions are currently blocked by the $20 minimum and to size the conversion opportunity from lowering it.; Live shelf price comparison for 10-15 comparable SKUs at Whole Foods Hyde Park and Aldi (closest south-side location): needed to validate or falsify the 'cleaner than Whole Foods, cheaper than Aldi' positioning claim before Wave A launches.; Order value distribution (histogram by $5 bucket) from all completed Stripe orders to date: needed to establish the current AOV baseline and identify whether clustering near the $20 minimum is suppressing natural basket size.; SKU-level ATC rate from Airtable or GA4 event data: needed to identify which current SKUs are adding to cart vs. being viewed without conversion, to prioritize Wave A/B merchandising and price-point decisions.; Repeat purchase rate at 30 and 60 days from the existing small Stripe customer base: needed to set the subscription pricing discount and LTV model for the Soul-Food Household segment.; Doina's grandfathered subscription economics (actual margin after fulfillment cost at $55/week): needed to calibrate the proposed $59-$79/week subscription tier against real unit economics, not projected margins._

### business-case-builder

**The Wave A + Wave B catalog expansion ($43K-$72K inventory investment, 8-12 weeks) is the only intervention with positive expected value at Uncle Mays today: it directly attacks the binding constraint identified across seven prior analysis phases, and every other lever (paid media, CRO operator, platform migration) has negative expected value until it ships.**

# Business Case

## Decision

Should Uncle Mays invest $43K-$72K in Wave A (soul-food basket) and Wave B (commodity staples) catalog inventory, run the sourcing sprint in parallel over 8-12 weeks, and treat this as the gating condition before reactivating paid media, hiring a CRO/UX operator, or making any platform decision?

The alternative options evaluated and rejected are:
- Option B: Restart paid media now on the current 43-SKU catalog
- Option C: Hire CRO/UX operator now (50-120K USD, 90-day trial) before assortment expands
- Option D: Migrate to headless Shopify before assortment expands
- Option E: Do nothing / wait for more organic data

---

## Economics Summary

All figures use labeled assumptions. Revenue estimates derive from the live fact base (0.46% CVR, ~150 paid sessions/week pre-pause assumption, $50 AOV base assumption) and prior-phase analysis conclusions. Margins are labeled as targets, not realized results.

| Metric | Downside | Base | Upside |
|---|---|---|---|
| Weeks to Wave A+B live | 14-16 | 10-12 | 8-9 |
| Post-expansion CVR (paid) | 1.0% | 1.5% | 2.5% |
| Post-expansion AOV | $38 | $52 | $68 |
| Weekly paid sessions at relaunch (assumption: restart at pre-pause rate) | 100 | 150 | 200 |
| Weekly gross revenue (paid channel only) | $3,800 | $11,700 | $34,000 |
| Incremental weekly revenue vs. today ($0, ads paused) | $3,800 | $11,700 | $34,000 |
| Gross margin rate (assumption: blended 28-35% target, not realized) | 22% | 30% | 36% |
| Weekly gross profit (paid channel) | $836 | $3,510 | $12,240 |
| Inventory investment (Wave A+B combined) | $43,000 | $57,500 | $72,000 |
| Weeks to inventory payback (gross profit basis) | 51 | 16 | 6 |
| Incremental weekly CAC burden (assumption: restart at pre-pause $439/wk) | Not modeled | $293 | $176 |

**Notes on the model:**

- Paid sessions/week at relaunch is an assumption. Pre-pause spend was $439/week total (Meta + Google). No actual weekly session volume is in the fact base; 150 sessions/week is a conservative estimate for that budget level in a targeted south-side Chicago geo.
- CVR improvement from 0.46% to 1.5% base case is a conservative extrapolation, not a projection. The growth-barriers analysis concluded that assortment breadth (not checkout UX) is the binding constraint; adding 40-60 SKUs in the highest-demand categories moves the lever. The 2-4% food-DTC benchmark is the ceiling, not the base case.
- AOV assumption ($52 base) reflects a post-Wave-A basket: produce ($12-$18) + one pantry/staple item ($4-$8) + one protein ($10-$15) + one Wave B commodity item ($3-$6). This is consistent with the prior-phase estimate of $30-$60 typical first cart.
- Gross margin rate is the CEO-projected target (35%), discounted to 30% base case to reflect the mix of commodity staples (Wave B, likely 20-25% margin) blended with specialty produce and protein (35-45% target margin). All margin figures remain projections until realized.

---

## Value Drivers

| Driver | Assumption | Evidence | Sensitivity |
|---|---|---|---|
| CVR improvement from assortment breadth | Moving from 43 SKUs (produce-only) to 80-100 SKUs across 4 categories lifts CVR from 0.46% toward 1.5% base | Growth-barriers analysis: 5.5% ATC means shoppers see the catalog and leave; seven prior phases all converge on assortment as primary cause. Food-DTC benchmark: 2-4%. | High sensitivity: if funnel friction (checkout UX, trust signals) is equally responsible, CVR improvement could be 0.6-0.9% not 1.5%. This is the single most dangerous assumption. |
| AOV lift from basket completion | Wave A soul-food items and Wave B commodity staples allow a $50+ cart without requiring a protein anchor | Profit-pool analysis: proteins are highest AOV-contribution per unit; Wave A items (collards, black-eyed peas, rice, cornmeal) are the top over-indexed Black-household items per Numerator/USDA patterns. | Medium sensitivity: if Wave A sourcing is delayed beyond 12 weeks, the basket stays produce-heavy and AOV improvement is partial. |
| Repeat purchase rate improvement | The Soul-Food Household (highest-LTV segment) does not repeat on produce-only; adds a staple basket enables weekly repurchase | Customer-segmentation analysis: Soul-Food Household is the most repeat-purchase-dependent segment; repeat-purchase LTV is the primary profit driver across all segments. | High sensitivity: contingent on EXP-002 delivery SLA resolution. Fulfillment trust suppresses repeat rate independent of assortment. |
| Black-owned badge differentiation | Every Black-farmed or Black-owned SKU with a verified badge widens the moat competitors cannot replicate | Competitive-intel analysis: Instacart, DoorDash, and Whole Foods cannot replicate Black-owned sourcing credibility. Wave A has ~90%+ Black-owned integrity per profit-pool analysis. | Low sensitivity: the badge is wired in code; this is an execution risk (sourcing verification), not a market risk. |
| $20-to-$15 cart minimum test | Reducing the minimum after Wave B lowers per-item price floor unlocks suppressed low-AOV shoppers | Growth-barriers analysis: cart minimum is not the binding constraint today but becomes one once sub-$4 SKUs are live. Customer-segmentation: Health-Forward Professional hits the $20 wall at 2-3 produce items. | Medium sensitivity: testing at $15 costs nothing; risk is margin dilution if $15-$25 carts become a large share of volume. |
| Delivery SLA resolution | Publishing a firm, verified daily delivery SLA before paid relaunch removes the trust gap suppressing repeat purchase | Assumption-audit and competitive-intel analyses: EXP-002 is a painted-door test, not a proven operational capability. Fulfillment credibility is a prerequisite for the Soul-Food Household repeat rate. | High sensitivity: if EXP-002 reveals the team cannot route every day at scale, repeat LTV projections are materially impaired regardless of assortment. |

---

## Cost and Investment

### Wave A + Wave B Inventory Investment

**Wave A: Soul-Food Basket** (collards, okra, smoked turkey necks / smoked cuts, rice, cornmeal, black-eyed peas, sweet onions, field peas, crowder peas)
- Estimated initial inventory: $18,000-$28,000 (assumption: 8-10 SKUs at $1,800-$2,800 average initial stock per SKU, reflecting perishable cold-chain SKUs requiring smaller initial batches plus shelf-stable dry goods with larger batches)
- Source: profit-pool analysis cited $31K-$52K for Wave A; this model uses the lower bound adjusted for parallel Wave B deployment
- Sourcing timeline: 4-8 weeks to identify and onboard Black-owned suppliers for specialty items; bananas and commodity items faster
- Cold-chain complexity: smoked meats and proteins require refrigerated logistics; this is the primary operational risk in Wave A

**Wave B: Commodity Staples** (bananas, yellow onions, tomatoes, garlic, lemons/limes, dried lentils, olive oil, hot sauce, vinegar, canned tomatoes)
- Estimated initial inventory: $12,000-$22,000 (assumption: 8-12 SKUs, primarily shelf-stable or ambient, lower per-SKU investment than Wave A cold-chain items)
- Black-owned badge: not all Wave B items will have Black-owned sourcing at launch; the CEO-approved decision is to sell wholesale commodity staples alongside Black-farmed specialty, badging where applicable
- Sourcing timeline: 2-4 weeks for commodity items through existing Chicago-area distributors

**Combined Wave A+B initial investment: $30,000-$50,000 inventory**

### Additional One-Time Costs

| Cost Item | Estimate | Confidence | Timing |
|---|---|---|---|
| Sourcing + supplier onboarding time (CEO + COO at internal cost) | Not dollar-costed; already budgeted as part of 6-phase reset | CEO decision 2026-05-17: sourcing owned jointly by Anthony + Zoe | 8-12 weeks |
| Airtable catalog updates and SKU merchandising (internal) | Low; catalog is Airtable-driven, no replatform required | Stack is already built for this; Black-owned badge is code-wired | 1-2 weeks after sourcing confirmed |
| Photography / product imagery for new SKUs | $2,000-$6,000 (assumption: 40-60 SKUs at $50-$100 per SKU, basic e-commerce product photography) | No fact-base figure; assumption labeled | Concurrent with sourcing sprint |
| Delivery SLA verification (EXP-002 resolution) | $0-$3,000 in operational testing cost (assumption) | Painted-door test is already running; cost is internal routing ops time | Must resolve before paid relaunch |
| Wave E personal care initial inventory (optional at relaunch) | $15,000-$25,000 | Profit-pool analysis: 55-70% DTC margin, shelf-stable, no cold-chain | Can sequence after Wave A+B if budget constrained |

**Total case investment before paid relaunch: $43,000-$72,000** (Wave A+B inventory + photography; excluding Wave E and operator/platform costs which remain deferred)

### Ongoing Costs at Paid Relaunch

- Paid media restart (Meta + Google): $439/week pre-pause baseline; no budget increase until CVR gate is hit
- Delivery operations: $7.99 flat fee covers variable delivery cost assumption (no fact-base data on per-delivery cost; treat delivery unit economics as a data gap)
- No CRO/UX operator cost until behavioral gate is hit ($0 in this case window)

---

## Risks

**Risk 1: Assortment breadth is not the primary CVR driver (HIGH probability if unaddressed)**
The most dangerous assumption in this case is that a 43-SKU produce-only catalog is the root cause of 0.46% CVR. If checkout friction, trust signals, or price perception are equally responsible, Wave A+B will improve ATC but CVR will not reach 1.5% base case. The assumption-audit phase rated this as the single most dangerous load-bearing assumption.
Mitigation: instrument ATC rate and session-to-shop rate immediately after Wave A+B launch, before reactivating paid spend. If ATC improves but CVR does not, escalate to checkout UX audit. Do not reactivate paid spend until the CVR gate is confirmed.

**Risk 2: Black-owned sourcing cannot reach catalog density on a 10-12 week clock (MEDIUM probability)**
A single current farm supplier (Run A Way Buckers Club, Pembroke IL) is the entire sourcing base. Wave A requires 8-10 new suppliers or a distribution partner who can aggregate Black-owned growers and processors. Chicago-area BIPOC food hubs (Appetite for Change, Regional Food Bank distributor network) are potential partners but have not been contracted.
Mitigation: prioritize Wave B commodity staples (faster to source) as the bridge to assortment breadth while Wave A specialty sourcing is in flight. Never wait for Wave A to complete before launching Wave B items.

**Risk 3: EXP-002 delivery SLA is unresolvable on current team capacity (MEDIUM probability)**
The daily delivery promise is operationally unverified. If the team cannot route every day at scale, the Soul-Food Household repeat-purchase thesis collapses. This is not a risk that Wave A+B investment hedges against.
Mitigation: resolve EXP-002 as a hard gate before paid relaunch, independent of catalog progress. If daily routing is not operationally feasible, publish a modified SLA (e.g., 5 days/week, specific zip-code routing schedule) before any paid acquisition resumes.

**Risk 4: Cold-chain operational complexity in Wave A (MEDIUM probability)**
Smoked meats, refrigerated proteins, and perishable produce have higher fulfillment complexity than shelf-stable goods. Adding 4-6 cold-chain SKUs to the catalog without a verified cold-chain logistics upgrade could produce spoilage, failed deliveries, or quality complaints that damage the brand at a critical trust-building moment.
Mitigation: sequence cold-chain SKUs (smoked turkey necks, oxtail) after at least one successful week of shelf-stable Wave A+B items live. Do not launch everything simultaneously.

**Risk 5: $20 cart minimum test creates margin dilution if mistimed (LOW probability)**
Reducing the minimum to $15 before Wave B lowers the per-item price floor could increase order volume of sub-profitable baskets. The risk is real but small relative to the conversion benefit.
Mitigation: test the $15 minimum only after Wave B items are live and only in a controlled A/B test. Do not apply universally on launch day.

**Risk 6: Platform and operator decision is deferred too long (LOW probability in the 12-week window)**
The competitive-intel analysis flagged a 3-6 month platform migration as a vulnerability window. If a venture-backed competitor enters the Black-food-delivery space during the Wave A+B sprint, the deferral becomes costly.
Mitigation: monitor the competitive landscape monthly. The platform decision gate opens after one full month of post-relaunch behavioral data with the expanded catalog. The operator hire gate opens when /shop reach exceeds 40% and ATC exceeds 12% in the same week.

---

## Recommendation

**Proceed immediately with Wave A + Wave B parallel sourcing sprint. Invest $43K-$72K in initial inventory. Hold all other investments (paid media, CRO operator, platform migration) until the three relaunch readiness gates are confirmed in the same calendar week.**

The investment is justified on four grounds:

**1. It is the only option with positive expected value today.** Restarting paid media at 0.46% CVR generates negative CAC-to-gross-profit unit economics (CAC almost certainly exceeds first-order gross profit at $30-$60 AOV and sub-1% CVR). The catalog investment breaks the cycle by making basket completion possible.

**2. The downside case is acceptable.** Even in the downside scenario (CVR reaches only 1.0% post-expansion, AOV $38, 100 paid sessions/week), weekly gross profit from the paid channel is $836, producing a 51-week payback on inventory. That is a long payback but still better than the alternative of indefinite paid-media suspension with no path to improvement.

**3. The base case is compelling.** At 1.5% CVR, $52 AOV, 150 paid sessions/week, and 30% blended margin, weekly gross profit from the paid channel alone is $3,510, producing a 16-week inventory payback. Organic and repeat-purchase revenue compounds on top of that figure.

**4. Every deferred option becomes more valuable after this investment, not less.** The CRO/UX operator ($50K-$120K) can brief against real post-assortment behavioral data. The platform migration decision can be made against a known conversion floor on the current stack. Paid media restarts at a catalog that can justify CPCs. Wave E personal care ($15K-$25K, 55-70% margin) becomes a portfolio extension, not a distraction.

**Immediate actions, in priority order:**

1. Begin Wave B commodity sourcing this week (bananas, onions, tomatoes, garlic): 2-4 week timeline, no cold-chain complexity, immediately lowers per-item price floor
2. Identify 2-3 Wave A suppliers (Black-owned: collard/greens processors, dry bean and rice distributors, smoked meat purveyors) within 2 weeks; target first Wave A SKUs live by week 6
3. Resolve EXP-002 delivery SLA in parallel: set a hard date (suggest: end of week 4) for a go/no-go decision on daily routing; publish the actual SLA before paid relaunch regardless of outcome
4. Instrument Airtable catalog and test ATC rate on new SKUs with organic traffic before paid relaunch; do not reactivate LogRocket (paused) until the subscription is renewed, but track session-to-shop and ATC in GA4 in the interim
5. Test $15 cart minimum in a 2-week A/B test immediately after first Wave B items are live
6. Confirm relaunch readiness gate: /shop reach above 40%, ATC above 12%, and at least 3 of the top-10 Black-household staple SKUs live and in-stock, all in the same calendar week, before committing a single paid dollar

**What this case does NOT recommend:**
- Restarting paid media before the readiness gate (negative expected value at current CVR)
- Hiring a CRO/UX operator before post-assortment behavioral data exists (no baseline to brief against)
- Migrating to headless Shopify before confirming the conversion floor on the current stack (platform is not the binding constraint)
- Launching Wave E personal care before Wave A+B basket is established (sequencing risk: personal care needs its own discovery mechanism, not just catalog placement)


_Data gaps: Actual weekly paid session volume at the $439/week pre-pause spend level (needed to validate CAC and payback period; 150 sessions/week is an unverified assumption); Per-delivery variable cost (driver cost, cold-chain logistics, packaging) needed to verify that $7.99 flat fee is margin-positive at Wave A+B AOV levels; Black-owned supplier landscape for Wave A specialty items (collards, okra, smoked meats, dry goods) in the Chicago/Midwest sourcing radius: no confirmed vendor list, timeline, or unit cost structure; EXP-002 actual routing data: which days and ZIP codes are being served, at what fill rate, and whether daily delivery is operationally achievable before paid relaunch; Realized gross margin by SKU category on current 43 SKUs: the 35% gross margin target is a projection; no actual blended margin figure is in the fact base; Post-expansion ATC rate by SKU category: needed to confirm whether assortment or checkout friction is the primary CVR driver; currently not measurable because LogRocket subscription is paused; Competitive paid-acquisition spend in the 'Black-farmed produce south-side Chicago' keyword cluster: the assumption of first-mover advantage is unverified; Product photography unit cost for 40-60 new SKUs: the $2,000-$6,000 estimate is an assumption with no vendor quote; Actual repeat purchase rate and LTV for existing customers (Doina's $55/week is a single data point, not a segment-level statistic)_


## 4. Operating Model

### operating-model-design

**Uncle Mays must run as a two-speed operating model: a sourcing-and-catalog sprint team (Waves A and B in parallel, 8-12 weeks) owns the binding constraint, while a thin steady-state operating layer holds the live funnel, fulfillment SLA, and organic channels without adding headcount or cost until the relaunch gate is passed.**

# Operating Model Design

## Strategic Requirement

The operating model must enable one outcome in the next 8-12 weeks: expand the live customer catalog from 43 SKUs to 80-100 SKUs across at least 4 categories (produce, soul-food staples, commodity pantry, proteins) so that the paid acquisition funnel can restart with a basket-completion offer. Every design choice below is tested against this requirement. Nothing in this model is permanent infrastructure for the long-term vision. It is the minimum viable operating configuration to pass the relaunch gate and generate a post-assortment behavioral baseline.

The relaunch gate (carried forward from prior phases) is the single governance trigger for all deferred decisions:
- /shop reach above 40% (up from 25%)
- Add-to-cart rate above 12% (up from 5.5%)
- At least 3 of the top-10 Black-household staple SKUs live and in-stock
- All three confirmed in the same calendar week

Until that gate is passed, paid spend stays off, the CRO operator is not hired, the platform migration is not decided, and no new promo code is activated.

---

## Capability Model

| Capability | Current State | Required State | Gap |
|---|---|---|---|
| Sourcing: Black-farmed and Black-owned specialty produce | Functional, single-farm supplier (Run A Way Buckers Club), seasonal constraints | Multi-vendor network covering Wave A soul-food SKUs (collards, okra, smoked cuts, black-eyed peas, cornmeal, rice) plus commodity staples (bananas, onions, tomatoes); 80-100 SKUs live | Critical gap. One supplier cannot deliver category breadth or Wave B staples. Vendor pipeline exists in Airtable (app3raEVB9kHeUoHE, 1,025 rows) but no vendor has been activated for Wave A or B SKUs. |
| Catalog management: Airtable-to-storefront merchandising | Functional for 43 SKUs. Black-owned badge wired in code but inert (no SKU renders one). Specialty SKUs not yet demoted to a seasonal rail. | Badge live on all eligible SKUs at Wave A/B launch. Specialty SKUs (ramps, sunchokes, microgreens, black garlic, daikon) moved to a dedicated Specialty / What's-in-season rail. Hero merchandising anchored on soul-food and staple categories. | Moderate gap. Code is ready. Work is editorial, not technical: badge activation, hero reorder, rail creation. Estimated 1-2 engineering sprints. |
| Fulfillment: daily citywide delivery SLA | Painted-door test (EXP-002) running. Customer-facing promise is "every day." Actual routing serves a subset the team can cover each week. No published SLA grounded in real capacity. | Firm, published, operationally grounded SLA. Customer knows which days and windows are available in their ZIP. No promise made that routing cannot keep. | Critical gap. Mismatch between customer promise and operational reality is a fulfillment trust risk that suppresses repeat purchase for the Soul-Food Household (highest-LTV segment) independent of assortment improvements. |
| Funnel analytics: behavioral data by segment and SKU | LogRocket paused. Mailchimp audience effectively empty. No segment-level AOV, ATC rate by SKU, or repeat rate data available. | Post-assortment baseline: /shop reach, ATC rate by category, AOV by session, repeat purchase rate by segment, all tracked weekly from day one of Wave A/B launch. | Critical gap. Without this data, the relaunch gate cannot be verified and the CRO operator cannot be briefed. LogRocket revival is a one-step action (re-add two env vars and uncomment three cron lines). |
| Organic acquisition: newsletter, social, community | Organic social active (Facebook, Instagram). Newsletter audience effectively empty (3 members). No community engagement program running. | Newsletter re-import of Stripe customers before Wave A launch. Two-post-per-week organic social cadence anchored on soul-food recipes and Black-farmed sourcing stories to generate behavioral engagement evidence before paid restart. | Moderate gap. Newsletter re-import is a 1-day Stripe-to-Mailchimp export task. Social cadence is a content calendar question, not a tooling question. |
| Paid acquisition: Meta + Google | Paused since 2026-05-16. Pre-pause CVR 0.46%, CAC almost certainly above first-order gross margin. No ROAS data from expanded catalog exists. | Deferred until relaunch gate passed. When reactivated: Soul-Food Household on Facebook (recipe-forward video); Health-Forward Professional on Instagram and Google search ('fresh produce delivery Chicago'); creatives anchored on soul-food and Black-farmed stories, not generic produce imagery. | Not a current gap. Staying paused is the correct operating decision. The capability exists and can be reactivated; the problem is the offer it drives traffic to, not the channel. |
| Pricing and promotions governance | Cart minimum $20, flat $7.99 delivery fee, no active promo codes. FRESH10/FRESH30 retired. Clean-price signal is deliberate. | Cart minimum test at $15 after Wave B low-price-point SKUs (bananas, onions) are live. Tiered delivery fee tested at $60+ threshold (free delivery above $60, $4.99 from $35-$59, $7.99 below $35). No promo reactivation until post-assortment behavioral baseline confirmed. | Managed gap. No action needed now. Decisions are queued with explicit unlock conditions. |
| Platform and engineering: Next.js custom stack | Functional. Airtable-driven catalog, Stripe embedded checkout, Trigger.dev workers, Resend transactional email. No proven conversion floor yet on this stack post-assortment. | Current stack is adequate for Wave A/B launch and behavioral baseline period. Platform migration decision deferred until post-CRO operator engagement reveals a hard stack constraint. | Not a current gap. Platform is not the binding constraint at any prior analysis stage. Treating it as a gap now wastes engineering capacity needed for catalog work. |
| CRO and funnel optimization | No operator engaged. No post-assortment baseline exists to brief against. | Deferred. Operator hire ($50K-$120K, 90-day trial) opens when relaunch gate is passed and one full week of post-assortment behavioral data is available. Shortlist: Barrel, Anatta, Bear Group (all US-based, not Shopify-locked). | Explicitly deferred, not a gap. Hiring now optimizes the wrong funnel and wastes the budget. |

---

## Target Model

| Element | Recommendation | Rationale |
|---|---|---|
| Operating structure | Two-speed model: a catalog sprint team running at full intensity for 8-12 weeks, and a lean steady-state layer holding live funnel, fulfillment, and organic channels. No new headcount until the relaunch gate is passed. | The binding constraint is a sourcing and catalog problem, not a headcount or org-complexity problem. Adding roles before the gate is passed burns capital with no conversion return. |
| Catalog sprint team | Anthony (CEO) and Zoe (COO) co-own sourcing. Anthony owns vendor standards: Black-owned certification criteria, badge approval, assortment strategy decisions. Zoe owns vendor selection execution, inventory levels, SKU readiness sign-off, and the Wave A/B launch checklist. One engineer (existing) owns Airtable-to-storefront catalog tooling. | Sourcing is jointly owned per the CEO-approved plan (2026-05-17). Splitting accountability clearly (Anthony: standards; Zoe: execution) prevents the sourcing pipeline from stalling on founder bandwidth. |
| Wave sequencing within the sprint | Wave A (soul-food basket: collards, okra, smoked turkey cuts, black-eyed peas, cornmeal, rice) and Wave B (commodity staples: bananas, onions, tomatoes, additional pantry) run in parallel, not sequentially. Wave A targets Soul-Food Household, highest-LTV segment. Wave B lowers per-item price floor and unblocks cart minimum suppression for Health-Forward Professional. Both must be live with 10+ merchandised SKUs each before paid traffic resumes. | Sequential execution would delay the combined 80-100 SKU target by 4-6 weeks. The two waves address different sourcing channels (specialty Black-farmed vs. commodity wholesale) with minimal overlap, so parallel execution is feasible. |
| Black-owned badge activation | Activate on all eligible SKUs at Wave A/B launch. No new code work required (wired but inert). Anthony approves badge criteria and eligibility list before launch. Zoe confirms supplier documentation. | The badge is the only durable moat against Instacart, DoorDash Grocery, and Whole Foods. It costs nothing to activate and creates perceived quality premium that supports current price points without a price cut. |
| Fulfillment SLA governance | Zoe resolves EXP-002 and publishes a firm, routing-grounded SLA before Wave A/B launch. Customer-facing promise aligns exactly with operational capacity. No ZIP or day is advertised that routing cannot reliably cover. SLA is reviewed weekly by Zoe and updated if capacity changes. | The Soul-Food Household is the highest-LTV segment and the most repeat-purchase-dependent. Fulfillment trust governs LTV for that segment. An unresolved SLA suppresses retention independent of catalog quality. |
| Funnel analytics: LogRocket revival | Re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel (prod + preview) and Trigger.dev project env vars. Uncomment the three cron lines (galileo-daily-briefing.ts, galileo-incident-alert.ts, logrocket-daily-ingest.ts). Deploy. This is a one-step action, not a project. Target: live before Wave A/B first SKUs go live on the storefront. | Post-assortment behavioral data (/shop reach, ATC rate by category, AOV, repeat rate) is the primary output of the catalog sprint. Without LogRocket live from day one, the team cannot verify the relaunch gate and cannot brief the CRO operator when the window opens. |
| Organic engagement cadence | Newsletter: re-import Stripe customers into Mailchimp audience before Wave A launch (one-time task). Social: two posts per week on Facebook and Instagram anchored on soul-food recipes, Black-farmed sourcing stories, and new SKU introductions. No new tools, no paid promotion. | Organic engagement evidence is required by the CEO-approved plan before paid restart. It also generates the social proof and community signal that pre-warms the Soul-Food Household segment for Wave A launch. |
| Pricing governance queue | Three pricing decisions are queued with explicit unlock conditions, not active: (1) $15 cart minimum test: runs the week Wave B low-price-point SKUs (bananas, onions) are live; (2) tiered delivery fee test ($60+ free, $35-$59 at $4.99, below $35 at $7.99): runs alongside the $15 cart minimum test; (3) first promo reactivation (first-order free delivery at $45+, not a percentage discount): only after post-assortment behavioral baseline is confirmed. Anthony approves each pricing test before activation. | Queuing decisions with explicit conditions prevents premature activation (which would contaminate the clean-price signal) and prevents indefinite deferral (which would let a known suppressor persist unchecked after the binding constraint is removed). |
| Metrics ownership | Zoe owns: /shop reach (weekly), fulfillment SLA compliance rate (weekly), Wave A/B SKU live count (weekly). Anthony owns: sourcing pipeline velocity (new vendors engaged per week, new SKUs contracted per week). CTO owns: LogRocket/Galileo briefing delivery and funnel event integrity. No one owns paid CVR until the relaunch gate is passed, because the metric is not meaningful until offer and funnel are both repaired. | Assigning ownership now, before the metrics are active, ensures accountability is clear from day one of Wave A/B launch rather than being negotiated after the fact. |
| Deferred decisions register | Three decisions formally deferred with defined unlock conditions: (1) CRO/UX operator hire: unlocked when relaunch gate is passed and one full week of post-assortment behavioral data exists; (2) platform migration to headless Shopify: unlocked only if post-operator engagement reveals a hard stack constraint that the current Next.js build cannot resolve; (3) Wave E personal care (soaps, batana oil, hair/skin care): unlocked after Wave A and B are live and repeat purchase rate is measurable. | Explicit deferral with conditions prevents two failure modes: premature activation (wasting capital before the binding constraint is removed) and indefinite drift (where deferred decisions never get a trigger to re-examine). |

---

## Decision Rights

| Decision | Owner | Contributors | Governance |
|---|---|---|---|
| Wave A/B vendor approval (Black-owned certification standard) | Anthony (CEO) | Zoe (COO) for vendor diligence; sourcing pipeline data from Airtable app3raEVB9kHeUoHE | Anthony approves criteria once; Zoe applies them per vendor. Any borderline case escalates to Anthony within 48 hours. |
| Wave A/B SKU readiness for storefront launch | Zoe (COO) | Engineer (catalog tooling), Anthony (assortment strategy) | Zoe signs off on 10-SKU-minimum readiness checklist per wave before any SKU goes live. No partial-wave launches that dilute hero merchandising impact. |
| Black-owned badge eligibility per SKU | Anthony (CEO) | Zoe (COO) confirms supplier documentation | Anthony approves the eligibility list at Wave A/B launch and at each new vendor addition thereafter. Badge activation is an engineering task executed by the engineer once the list is approved. |
| Fulfillment SLA publication | Zoe (COO) | EXP-002 routing data, driver capacity | Zoe publishes the SLA before Wave A/B launch. SLA is reviewed and updated weekly. Any change to the published SLA is Zoe's decision with a Paperclip audit trail entry. |
| Organic social post approval | CRO (Tara Weymon, CMO) | Anthony for any post that makes a sourcing claim or uses investor-facing language | CRO-at-will per standing order. Paperclip issue for audit trail. No board approval. |
| Newsletter send approval | CRO | Anthony for any campaign that references the capital raise or investor materials | CRO-at-will per standing order. Mailchimp draft reviewed by Anthony only when investor-adjacent content is included. |
| Relaunch gate verification | Anthony (CEO) | Zoe (CVR and fulfillment data), CTO (LogRocket/Galileo report), CRO (organic engagement evidence) | Anthony calls the gate pass or fail based on a written weekly readiness report compiled by the CTO from LogRocket data. All three gate criteria must be confirmed in the same calendar week. No majority-rules override. |
| Paid media reactivation | Anthony (CEO) | CRO (channel strategy and creative brief), CTO (conversion tracking verification) | Gate-gated. Paid spend does not restart until Anthony formally calls the relaunch gate passed. First-week budget cap at $200/week to validate post-assortment CVR before returning to $439/week. CRO owns channel allocation within the approved budget. |
| Cart minimum and delivery fee tests | Anthony (CEO) | CRO (test design), CTO (implementation) | Queued with explicit unlock conditions (see Target Model). Anthony approves each test individually before activation. Tests run for a minimum of 2 full weeks before results are read. |
| CRO/UX operator hire | Anthony (CEO) | Zoe (ops fit), CRO (scope and brief) | Deferred until relaunch gate passed plus one full week of post-assortment behavioral data. Decision is a board approval per standing order (net-new spend commitment). CFO and bookkeeper looped on the same thread. |
| Platform migration decision | Anthony (CEO) | CTO (technical assessment), CRO/UX operator (stack requirements) | Deferred until post-operator engagement reveals a hard stack constraint. If raised before that unlock, it is explicitly rejected and the rejection is logged in the deferred decisions register. |
| Wave E personal care launch | Zoe (COO) | Anthony (assortment strategy and badge approval), CRO (merchandising placement) | Deferred until Wave A and B are live with measurable repeat purchase rate. Wave E sourcing can begin in parallel after Wave A/B launch but no storefront placement until unlock condition is met. |
| New Vercel project, new paid SaaS subscription, new agency retainer | Anthony (CEO), board approval required | CFO, Bookkeeper | Net-new spend. Board approval required per standing order before any commitment. |

---

## Transition Plan

### Phase 0: Immediate (Week 1, before any catalog work begins)

Three actions must complete before the catalog sprint starts because they set the operating conditions the sprint depends on.

**Action 1: Revive LogRocket.** Re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel (prod + preview) and Trigger.dev. Uncomment three cron lines. Deploy. Owner: CTO. If LogRocket is not live from day one of Wave A/B SKU additions, the team will have no behavioral data to verify the relaunch gate against.

**Action 2: Re-import Stripe customers into Mailchimp.** Export active customer emails from Stripe, import to the Mailchimp audience (list ID 2645503d11). This is the only newsletter audience available and must exist before any Wave A/B organic engagement campaign can reach past customers. Owner: CRO. Estimated time: one business day.

**Action 3: Assign metrics ownership in writing.** Zoe takes /shop reach, fulfillment SLA compliance, and SKU live count. Anthony takes sourcing pipeline velocity. CTO takes LogRocket briefing delivery. Written in a Paperclip issue, not in a planning document. Owner: Anthony. This prevents the Week 4 conversation where accountability for a missed gate criterion is unclear.

**Transition risk in Phase 0:** The LogRocket revival is low-risk technically (one-step per CLAUDE.md) but high-stakes operationally. If it is delayed past Wave A/B first SKU launch, the team will be flying blind during the most important behavioral data collection window in the engagement. Escalate any Vercel env-var or Trigger.dev deployment blocker to CTO same day.

---

### Phase 1: Catalog Sprint (Weeks 1-12, parallel)

**Wave A (soul-food basket):** Anthony and Zoe begin vendor outreach from the Airtable sourcing pipeline (app3raEVB9kHeUoHE) targeting: collards/mustard greens, okra, smoked turkey cuts or necks, black-eyed peas, cornmeal, long-grain rice, additional dried beans, sweet onions, seasonal greens. Target: 10+ SKUs live with Black-owned badge where eligible, hero merchandising placement, soul-food-recipe-anchored product copy. Minimum viable: 10 SKUs contracted and in-stock before any Wave A SKU goes live on the storefront (no partial-wave launch).

**Wave B (commodity staples):** Parallel vendor sourcing targeting: bananas, yellow/red onions, tomatoes, garlic, lemons/limes, additional pantry dry goods (salt, oil, flour). These are commodity sources; Black-owned badge applies where a verified Black-owned wholesale supplier exists. Wave B lowers the per-item price floor and unblocks the $15 cart minimum test. Target: 10+ SKUs live alongside Wave A. Same no-partial-wave rule applies.

**Specialty SKU demotion:** Move microgreens, ramps, sunchokes, black garlic, daikon off the hero into a Specialty / What's-in-season rail. This is an editorial catalog change (Airtable + storefront hero reorder), not a new feature build. Owner: engineer, Zoe approves. Estimated time: 1-3 days.

**Black-owned badge activation:** Anthony finalizes eligibility list. Engineer activates badge on all eligible SKUs. Zoe confirms supplier documentation for each badge. Target: live at Wave A/B launch, not before (to avoid a partial activation that confuses the benchmark).

**Organic engagement:** CRO publishes two posts per week on Facebook and Instagram. Posts are anchored on soul-food recipes featuring Wave A SKUs, Black-farmed sourcing stories, and new product introductions. No paid promotion. Posts serve as both community-building and organic-engagement evidence toward the relaunch gate.

**EXP-002 resolution:** Zoe resolves the daily delivery routing test and publishes a firm, operationally grounded SLA. Published SLA goes on the storefront and in the customer-facing delivery copy. Owner: Zoe. Must complete before Wave A/B launch, not after.

**Transition risks in Phase 1:**

- Sourcing velocity risk: the Airtable vendor pipeline has 1,025 rows but zero vendors activated for Wave A or B. If vendor outreach takes longer than 4-6 weeks, the 8-12 week sprint timeline slips. Mitigation: Anthony and Zoe commit to a weekly sourcing velocity target (minimum 3 new vendors engaged per week, minimum 2 SKUs contracted per week) tracked on the metrics dashboard.
- Single-farm dependency risk: Run A Way Buckers Club remains the only contracted supplier during the vendor ramp. If that supplier has a seasonal gap or supply disruption, the current catalog could shrink further. Mitigation: Wave A vendor contracts prioritize at least 2 backup suppliers for each soul-food category before any new SKU is launched as a primary.
- Badge documentation risk: activating a Black-owned badge on a SKU without verified supplier documentation creates a brand credibility risk that could undermine the primary sourcing moat. Mitigation: no badge activates without Zoe's written sign-off on the documentation for that supplier.
- Merchandising coherence risk: launching Wave A and B in parallel with specialty SKU demotion happening simultaneously could create a confused storefront during transition. Mitigation: stage the storefront changes in a single deployment at Wave A/B readiness, not incrementally over weeks.

---

### Phase 2: Relaunch Gate Verification (Week 10-14, depending on Sprint velocity)

**Weekly readiness report:** Starting at Week 8, CTO compiles a weekly one-page readiness report from LogRocket/Galileo data: /shop reach, ATC rate by category, top-10 Black-household staple SKU live and in-stock status. Report is reviewed by Anthony, Zoe, and CRO. Anthony calls the gate pass or fail. All three criteria must be met in the same calendar week.

**Cart minimum test:** Runs the week Wave B low-price-point SKUs (bananas, onions) are confirmed live and in-stock. $15 minimum replaces $20 minimum. CTO implements. CRO monitors ATC rate and conversion for two full weeks before any conclusion is drawn.

**Delivery fee test:** Runs alongside the cart minimum test if the relaunch gate criteria are within reach. Tiered structure: free above $60, $4.99 from $35-$59, $7.99 below $35. CTO implements. Anthony approves before activation.

**Transition risks in Phase 2:**

- Gate measurement risk: without LogRocket live from Phase 0, the team will not have reliable /shop reach and ATC data by Week 10. This is why Phase 0 LogRocket revival is a hard prerequisite.
- Premature gate call risk: pressure to restart paid spend (capital efficiency, investor narrative) may push an early gate call before all three criteria are met in the same week. Mitigation: the gate is a written, three-criterion checklist that Anthony must sign. No oral or informal gate call is valid.
- AOV assumption risk: the base-case business case assumed $50 AOV post-assortment. If actual AOV after Wave A/B launch is materially lower (below $35), the unit economics case for paid reactivation weakens and the gate thresholds may need recalibration. Mitigation: log actual AOV from the first 30 organic post-assortment orders and compare to assumption before committing paid spend.

---

### Phase 3: Paid Relaunch and Operator Engagement (Week 14+ if gate is passed)

**Paid relaunch protocol:** First-week budget cap at $200/week (Meta only, Facebook Soul-Food Household audience with soul-food recipe video creative). Increase to $439/week only after a full week of post-relaunch CVR data confirms improvement above the pre-pause 0.46% baseline. CRO owns channel allocation and creative brief within approved budget. CTO verifies conversion tracking (Meta Pixel CAPI, GA4 purchase event) is firing correctly before first paid dollar is committed.

**CRO/UX operator engagement:** Anthony and Zoe select from shortlist (Barrel, Anatta, Bear Group) based on a brief that includes: post-assortment CVR, /shop reach, ATC rate by category, AOV distribution, and fulfillment SLA compliance rate. Engagement is scoped as a 90-day trial with a defined CVR improvement target. Board approval required before contract is signed (net-new spend). CFO and bookkeeper looped.

**Wave E personal care:** After Wave A and B are live and repeat purchase rate is measurable, Zoe initiates sourcing for Black-owned personal care (soaps, batana oil, hair/skin care). Shelf-stable, no cold chain, 15K-25K estimated inventory (assumption: based on prior profit-pool analysis; add to dataGaps for vendor quote verification). Storefront placement and discovery mechanism designed with CRO operator input.

**Transition risks in Phase 3:**

- Creative briefing risk: if paid creative defaults to generic produce imagery rather than soul-food and Black-farmed sourcing stories (the failure mode of the pre-pause campaigns), CVR improvement will be suppressed even with a full catalog. Mitigation: CRO writes a creative brief anchored on Soul-Food Household and Health-Forward Professional segment entry points (Facebook recipe video; Instagram and Google search 'fresh produce delivery Chicago') as a condition of paid reactivation.
- Platform migration distraction risk: if the CRO/UX operator recommends a Shopify migration as their first action, the team faces a 3-6 month pause during the competitive window when first-mover advantage in the 'Black-farmed produce, south-side Chicago' keyword cluster is still available. Mitigation: platform migration is only approved if the operator can demonstrate a hard stack constraint that the current Next.js build cannot resolve and the conversion improvement from migrating is greater than the conversion loss from the pause.

---

### Summary: First Moves in Priority Order

1. Revive LogRocket (CTO, Week 1, before catalog sprint starts).
2. Re-import Stripe customers into Mailchimp (CRO, Week 1).
3. Assign metrics ownership in writing in a Paperclip issue (Anthony, Week 1).
4. Publish EXP-002 daily delivery SLA (Zoe, before Wave A/B launch).
5. Begin Wave A and Wave B vendor outreach from Airtable sourcing pipeline (Anthony + Zoe, Week 1, parallel).
6. Demote specialty SKUs to seasonal rail in a single storefront deployment at Wave A/B readiness (engineer + Zoe, at sprint completion).
7. Activate Black-owned badge on all eligible SKUs at Wave A/B launch (engineer, Anthony approves list, Zoe confirms documentation).
8. Publish weekly readiness report from Week 8 onward (CTO).
9. Call relaunch gate when all three criteria are met in the same week (Anthony).
10. Engage CRO/UX operator after gate is passed and one full week of post-assortment behavioral data exists (Anthony, board approval before contract).


_Data gaps: Wave A and Wave B vendor sourcing lead times: no vendor from the Airtable pipeline (app3raEVB9kHeUoHE, 1,025 rows) has been activated. Actual time-to-first-delivery for collards, okra, smoked turkey cuts, and commodity staples from a new Black-owned or Black-farmed supplier is unknown. This determines whether the 8-12 week sprint timeline is achievable.; Wave E personal care inventory cost: the $15K-$25K estimate is drawn from prior profit-pool analysis assumptions, not from vendor quotes. Actual unit economics (cost, MOQ, shelf-stable freight) for batana oil, soaps, and skin/hair care from Black-owned suppliers are unverified.; Actual first-order AOV from organic post-assortment orders: the business case assumed $50 AOV. Whether Wave A/B catalog additions shift AOV to that range (vs. current $30-$60 produce-only range) is unproven until the first 30 organic orders after launch are logged.; EXP-002 routing capacity data: the actual number of ZIP codes and delivery days the current driver network can reliably cover is not in the fact base. Zoe's SLA publication depends on this, and it is the gating input for the fulfillment trust fix.; Whole Foods shelf prices for soul-food category equivalents (collards, okra, smoked cuts, black-eyed peas): the positioning claim 'cleaner than Whole Foods, cheaper than Aldi' has not been validated against live shelf prices for Wave A SKUs. If Wave A prices land above Whole Foods on key items, the positioning story breaks.; Post-assortment /shop reach and ATC rate baseline: LogRocket is paused. No behavioral data from the current storefront (post any assortment change) is available. All relaunch gate targets are projections from pre-pause data at 43 SKUs.; CRO/UX operator minimum stack requirements: whether Barrel, Anatta, or Bear Group will require a Shopify migration as a condition of engagement, or whether they will work with the existing Next.js stack, is unknown. This is the key input to the platform migration decision._

### initiative-prioritizer

**Concentrate 100% of available capacity on Wave A and Wave B catalog expansion in parallel: they are the only initiatives with positive expected value today, and every other initiative on the list has zero or negative returns until the relaunch gate is passed.**

# Initiative Prioritization

## Criteria

The single anchoring decision is: fix the Uncle Mays funnel and product mix. Move paid conversion from ~0.46% into the 2-4% food-DTC range and fix the narrow 43-SKU assortment that paid traffic will not buy. Every initiative is scored against that anchor.

**Decision criteria and weights:**

| Criterion | Weight | Definition |
|---|---|---|
| Impact on binding constraint | 35% | Does this directly attack the 43-SKU assortment gap or the /shop reach / ATC break? |
| Feasibility (time + cost) | 25% | Can this ship in 8-12 weeks within the current budget envelope without new headcount? |
| Strategic fit | 20% | Does this reinforce Black-owned sourcing, south-side delivery, build-your-own cart, or the Soul-Food Household segment? |
| Urgency | 20% | Does delaying this suppress a downstream initiative or allow a competitive window to close? |

**Resource constraints that govern the scoring:**

- Sourcing bandwidth is the scarcest resource (Anthony + Zoe only, no procurement team).
- Engineering capacity is thin (custom Next.js stack, no dedicated CRO resource yet).
- Cash is finite. The $400-750K SAFE has not closed. Inventory investment must stay inside the $43K-$72K envelope modeled in [business-case-builder].
- No new paid spend until the relaunch gate is confirmed. Every dollar of media budget has provably negative unit economics at 0.46% CVR and $30-60 AOV.

---

## Initiative Assessment

| Initiative | Impact | Feasibility | Fit | Priority | Rationale |
|---|---|---|---|---|---|
| Wave A catalog: soul-food basket (collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) | High | High | High | **1 - Do Now** | Directly attacks the binding constraint. Unlocks the Soul-Food Household, the highest-LTV segment with the strongest Black-household over-index (72-191% on items not yet stocked). Estimated $31K-$52K inventory, 100%+ Black-owned sourcing integrity possible. Highest ROI move in the entire portfolio. |
| Wave B catalog: commodity staples (bananas, onions, tomatoes, pantry staples) | High | High | High | **1 - Do Now (parallel with Wave A)** | Lowers the per-item price floor, removes the $20 cart minimum as a suppressor for Health-Forward Professionals, and enables basket completion for the second-priority segment. Cannot defer to after Wave A: both segments must be addressable at relaunch. CEO decision locked 2026-05-17. |
| Black-owned badge activation on all eligible SKUs | High | High | High | **1 - Do Now (at Wave A/B launch)** | Zero-cost, zero-lead-time capability on the existing stack. Only durable moat Instacart and Whole Foods cannot replicate. Delaying it past Wave A/B launch is pure value destruction with no offsetting benefit. |
| EXP-002 daily delivery SLA resolution (Zoe publishes firm, customer-facing SLA) | High | Medium | High | **1 - Do Now (unblocks relaunch)** | Fulfillment trust is the primary repeat-purchase driver for the Soul-Food Household. An unresolved SLA suppresses LTV for the highest-priority segment regardless of how well catalog expands. Must be resolved and published before any paid relaunch. |
| Relaunch gate operationalization (formal written thresholds: /shop reach above 40%, ATC above 12%, 3 of top-10 staple SKUs in stock in same week) | Medium | High | High | **1 - Do Now (governance)** | Without a written, owned gate, the team has no objective criterion to prevent premature paid reactivation. Costs nothing to formalize. Prevents the single most likely execution error in the roadmap. |
| $20-to-$15 cart minimum test | Medium | High | High | **2 - Queue (week Wave B goes live)** | Not the binding constraint today but becomes the primary suppressor for Health-Forward Professionals once low-price-point commodity SKUs are live. Low risk, high learning. Must be queued now so it ships the same week as Wave B, not weeks after. |
| Tiered delivery fee test (free above $60, $4.99 from $35-$59, $7.99 below $35) | Medium | Medium | Medium | **2 - Queue (after Wave B)** | The flat $7.99 fee is 13-40% of order value at current $20-$60 AOV range, a conversion killer below $40. A tiered structure aligns fee with margin contribution and rewards basket-building behavior. Requires engineering time; queue after Wave B confirmation. |
| Protein SKU expansion (oxtail, smoked turkey necks, ground beef, additional cuts) | High | Medium | High | **2 - Queue (Wave A parallel or immediately after)** | Proteins are the highest AOV-contribution SKUs per unit and have the strongest Black-household over-index. Each new protein SKU raises average AOV structurally without touching list prices. Sequenced inside Wave A because it shares the sourcing track. |
| Specialty SKU demotion to 'What's in Season' rail (ramps, sunchokes, microgreens, black garlic, daikon) | Low | High | High | **2 - Queue (engineering, pre-launch)** | CEO decision locked 2026-05-17. Reduces browse friction by concentrating hero catalog on high-demand SKUs. Low engineering lift. Must ship before Wave A/B launch so the homepage shows the expanded catalog cleanly. |
| Homepage-to-/shop navigation fix (only 25% of sessions currently reach /shop) | High | Medium | Medium | **2 - Queue (engineering, pre-launch)** | A secondary binding constraint identified in [growth-barriers]. Even if ATC improves to 15% post-assortment, 75% of paid visitors never see the offer. The fix is upstream of checkout. Must ship before paid relaunch but does not require Wave A/B to be complete first. |
| Organic social content reset (soul-food recipe-forward video for Facebook; brand-story anchored creative for Instagram) | Medium | Medium | High | **2 - Queue (during catalog sprint)** | Current organic creative defaults to generic produce imagery. Soul-Food Household converts best on Facebook recipe-forward video; Health-Forward Professional converts on Instagram search intent. Both segments are active now. Organic channels continue even with paid paused. No budget required. |
| Wave E: Black-owned personal care (soaps, batana oil, hair/skin care) | Medium | Medium | High | **3 - After relaunch gate** | Highest-margin incremental bet post-Wave A/B. Shelf-stable freight, no cold-chain cost, 55-70% DTC margins (assumption: labeled). Estimated $15K-$25K inventory. But it requires its own discovery mechanism and must not dilute Wave A/B sourcing bandwidth. Unlock condition: Wave A/B live, relaunch gate passed. |
| CRO/UX operator hire (Barrel, Anatta, Bear Group, 50-120K USD, 90-day trial) | High | Low (now) | High | **Kill (deferred with unlock condition)** | Provably premature. An operator briefed against 0.46% CVR from a 43-SKU catalog optimizes the wrong funnel and wastes the budget and the operator's leverage. No post-assortment behavioral baseline exists to brief against. Unlock condition: relaunch gate passed, one full week of post-Wave A/B behavioral data in hand. |
| Paid media reactivation (Meta ~$377/wk + Google Ads ~$62/wk) | High | Low (now) | High | **Kill (deferred with unlock condition)** | Provably negative unit economics at 0.46% CVR and $30-60 AOV: CAC almost certainly exceeds first-order gross profit margin at pre-pause spend levels. Reactivating before the relaunch gate destroys cash without building a customer base. Unlock condition: all three relaunch gate thresholds confirmed in the same calendar week. |
| Platform migration to headless Shopify | Low | Low | Medium | **Kill (indefinite deferral)** | Not the binding constraint at any point across 12 prior analysis phases. Creates a 3-6 month competitive vulnerability window (Instacart-powered competitors deepen south-side penetration during migration). Current stack has no proven post-assortment conversion floor to compare against. Platform is not on the agenda until post-operator engagement reveals a hard stack constraint. |
| LogRocket/Galileo subscription revival | Medium | High | Medium | **3 - After relaunch gate** | One-step revival (re-add env vars, uncomment three cron lines, redeploy). No post-assortment behavioral data exists yet to analyze. Revive when paid relaunch begins so that the first post-gate sessions are captured. Prioritizing revival now is waste: the subscription cost runs while the catalog that would generate meaningful sessions does not yet exist. |
| Apollo investor outreach reactivation (fix OAuth, resume SAFE raise) | Medium | Medium | Low (for funnel anchor) | **3 - Parallel track, separate owner** | Critical for capital formation (SAFE close triggers SBA facility, funds flagship build), but it is a separate decision track from the funnel and assortment anchor. Does not compete for the same resources as Wave A/B. Anthony can drive OAuth fix and outreach in parallel without detracting from the catalog sprint. Do not let it slow Wave A/B. |
| Subscription tier re-introduction | Low | Medium | Medium | **3 - After relaunch gate** | The grandfathered $55/week subscriber (Doina) is a proof point for the Soul-Food Household segment. A re-introduced tier would improve delivery routing efficiency and LTV. But it must not require subscription to complete checkout (prior design flaw), and the Soul-Food Household cannot be retained until assortment can satisfy the weekly run. Unlock condition: Wave A live, EXP-002 SLA resolved. |
| Pricing validation: verify 'cleaner than Whole Foods, cheaper than Aldi' against live shelf prices | Medium | High | High | **2 - Queue (before Wave A/B launch)** | Wave A soul-food SKUs should be priced at a modest 5-12% premium to Whole Foods, not Aldi. The positioning claim is unverified against actual shelf prices and may be misaligned for specialty and Black-farmed items. Low effort (manual price check), high risk if wrong. Must complete before Wave A launch copy is written. |

---

## Priority Roadmap

| Phase | Initiative | Owner | Milestone |
|---|---|---|---|
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Wave A soul-food basket sourcing and onboarding (collards, okra, smoked turkey necks, rice, cornmeal, black-eyed peas, oxtail, additional protein cuts) | Anthony (CEO): sourcing standards + Black-owned badge approval. Zoe (COO): vendor selection, inventory levels, fulfillment readiness. | 10+ Wave A SKUs live in Airtable Catalog base, Black-owned badge active, in-stock and orderable. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Wave B commodity staples onboarding (bananas, onions, tomatoes, pantry staples) | Anthony: badge approval per SKU. Zoe: vendor selection and stock. | 10+ Wave B SKUs live, at least 3 of top-10 Black-household staple SKUs confirmed in stock. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Black-owned badge activation on all eligible SKUs | Engineering (existing stack, zero new code required): badge field already wired, inert. | Badge renders on every eligible SKU at Wave A/B go-live. No eligible SKU ships without it. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | EXP-002 daily delivery SLA resolution | Zoe (COO): owns driver routing capacity analysis and published SLA. | Firm, written, customer-facing delivery SLA published. Conflict between customer promise and actual capacity resolved. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Specialty SKU demotion to 'What's in Season' rail | Engineering: Airtable catalog field tag + front-end rail component. | Specialty SKUs (ramps, sunchokes, microgreens, black garlic, daikon) no longer in hero; live in dedicated seasonal rail before paid relaunch. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Homepage-to-/shop navigation fix | Engineering. | /shop reach in organic sessions climbs above 40% in at least one measurement week before paid relaunch. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Pricing validation: verify 'cleaner than Whole Foods, cheaper than Aldi' | Anthony or Zoe: manual shelf-price check at nearest Aldi and Whole Foods for Wave A SKU equivalents. | Price-comparison doc complete. Wave A launch prices set against validated benchmarks, not assumptions. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Relaunch gate formalized in writing | Anthony (CEO): owns the decision rights document. | Written gate document signed off: /shop reach above 40%, ATC above 12%, 3 of top-10 Black-household staple SKUs live and in-stock, all in the same calendar week. Gate triggers all Phase 2 unlocks. |
| **Phase 1: Catalog Sprint (Weeks 1-12, in parallel)** | Organic social content reset (recipe-forward Facebook video; Instagram brand-story anchors for soul-food and health-forward angles) | CMO (Tara Weymon): creative direction. Anthony: narrative approvals. | At least 4 organic posts per week during the catalog sprint, using Wave A/B SKU content. Soul-food recipe format on Facebook; brand-story format on Instagram. |
| **Phase 2: Relaunch (Week of Gate Confirmation + immediately after)** | $20-to-$15 cart minimum test | Engineering: one-line config change. Anthony: approves. | Test live the same week Wave B commodity staples go live. Measure first-order conversion rate and AOV at $15 vs prior $20 baseline. Run for a minimum of 2 weeks before deciding. |
| **Phase 2: Relaunch (Week of Gate Confirmation + immediately after)** | Paid media reactivation (Meta + Google Ads) | CMO (Tara Weymon): creative. Anthony: budget approval (board decision per standing order for any raise above pre-pause $439/wk). | Gate confirmed. First campaigns use soul-food and commodity staple creative, not generic produce imagery. Facebook targets Soul-Food Household demo. Google targets 'fresh produce delivery Chicago' search intent. |
| **Phase 2: Relaunch (Week of Gate Confirmation + immediately after)** | LogRocket/Galileo subscription revival | Engineering (CTO lane): one-step revival (re-add env vars, uncomment three cron lines, deploy). | Active before first paid session post-relaunch. Every paid session after gate confirmation is captured. |
| **Phase 2: Relaunch (Week of Gate Confirmation + immediately after)** | Tiered delivery fee test (free above $60, $4.99 from $35-$59, $7.99 below $35) | Engineering: pricing config. Anthony: approves. | Live within 2 weeks of paid relaunch. Measure AOV shift and conversion rate at each fee tier vs flat $7.99 baseline. |
| **Phase 3: Post-Relaunch (4-8 weeks post-gate, unlock condition: Wave A/B confirmed, gate passed)** | CRO/UX operator engagement (Barrel, Anatta, or Bear Group, 50-120K USD, 90-day trial) | Anthony: vendor selection and contract. Zoe: ops requirements brief. | Full week of post-Wave A/B behavioral data (Galileo briefings, LogRocket sessions, ATC by SKU, AOV by segment) compiled and used as briefing document. Operator hired against the real post-assortment funnel, not the pre-reset one. |
| **Phase 3: Post-Relaunch (4-8 weeks post-gate, unlock condition: Wave A/B confirmed, gate passed)** | Wave E Black-owned personal care onboarding (soaps, batana oil, hair/skin care) | Anthony: Black-owned badge approval per SKU. Zoe: vendor selection, shelf-stable freight. | Minimum 8 SKUs live, each with verified Black-owned badge, before personal care appears in paid creative rotation. |
| **Phase 3: Post-Relaunch (4-8 weeks post-gate, unlock condition: Wave A/B confirmed, gate passed)** | Subscription tier re-introduction for Soul-Food Household | Engineering: subscription flow (must not require subscription to complete checkout). Anthony: pricing approval. | First-order checkout remains a one-time cart. Subscription is an opt-in upsell at order confirmation, not a gate. At least 10 Wave A SKUs must be in-stock weekly to support the subscription promise. |
| **Parallel track (not competing for catalog bandwidth)** | Apollo investor outreach revival (fix Google OAuth for all mailboxes, resume SAFE raise) | Anthony (CEO): owns OAuth fix sequence (Google Workspace Admin, re-auth one mailbox at a time, 24h between each). | All mailboxes re-authed and sending. SAFE raise restarted. Treated as a separate decision track from the funnel anchor. |

---

## Kill List

| Initiative | Reason | Revisit Trigger |
|---|---|---|
| Platform migration to headless Shopify | Not the binding constraint at any point across 12 prior analysis phases. A 3-6 month migration pause creates a direct competitive vulnerability window as Instacart-powered delivery deepens south-side penetration. The current Next.js stack has no proven post-assortment conversion floor to compare against. Fixing the offer on the current stack first is both faster and lower risk. | Revisit only after the CRO/UX operator engagement (Phase 3) identifies a hard stack constraint that blocks a specific conversion improvement the operator needs to execute. No operator brief, no platform decision. |
| Paid media reactivation before gate | Provably negative unit economics. At 0.46% CVR and $30-60 AOV, CAC almost certainly exceeds first-order gross profit margin at the pre-pause $439/wk spend rate. Reactivating before the relaunch gate burns cash without building a customer base. | Relaunch gate confirmed: /shop reach above 40%, ATC above 12%, and at least 3 of the top-10 Black-household staple SKUs live and in-stock, all in the same calendar week. All three must be true simultaneously. |
| CRO/UX operator hire before gate | An operator briefed against 0.46% CVR from a 43-SKU catalog optimizes the wrong funnel. No post-assortment behavioral baseline exists. The $50-120K budget is destroyed if the operator spends the 90-day trial period diagnosing the assortment problem the product-mix reset is already solving. | Relaunch gate passed, plus at least one full week of Galileo briefings and LogRocket session data from the post-Wave A/B funnel. The briefing document must exist before the vendor conversation begins. |
| Wave D frozen and prepared foods (heat-and-eat) | The highest-potential second-order profit pool but the thinnest supplier base and most operational complexity in the roadmap. At $40K-$70K inventory estimate and 10-14 weeks lead time, it dilutes the Wave A/B sprint without contributing to the relaunch gate. Not the right bet while sourcing bandwidth is the scarcest resource. | Revisit when Wave A and Wave B are both live and in-stock, the relaunch gate is passed, and Zoe confirms sourcing capacity for a third simultaneous category. |
| Paid Numerator consumer panel data pull | CEO decision locked 2026-05-17: no budget for paid data. The top-30 consumption research must be completed using publicly available sources (Nielsen/Circana category-level household expenditure, USDA, publicly available DoorDash and Instacart category reports). | Revisit only if a specific sourcing or pricing decision cannot be resolved without household-panel data AND the SAFE round has closed. |
| Reactivating FRESH10/FRESH30 promo codes (or any percentage-discount promo) | No promo codes until post-assortment behavioral baseline is confirmed. The current clean-price signal is the correct experiment to isolate conversion behavior. A promo code introduced now contaminates the baseline and makes it impossible to distinguish assortment-driven CVR improvement from discount-driven CVR improvement. | First promo test: after the relaunch gate is passed and at least two weeks of clean post-Wave A/B paid data are collected. The first promo must be a free-delivery threshold ($45+ gets free delivery, not a percentage discount) to protect margin while reducing a known friction point. |
| Mailchimp newsletter reactivation at scale before audience rebuild | The Mailchimp audience is effectively empty (3 members as of the last check). Sending a broadcast to 3 people while the catalog sprint is running is not a meaningful channel investment. Engineering should not touch Mailchimp infrastructure during the catalog sprint. | Revisit after Wave A/B launch: import customers from Stripe, rebuild the audience to at least 50 verified customer contacts, then plan the first post-reset newsletter as a product-launch announcement. |

---

## Sequencing Dependencies

The roadmap has four hard sequencing dependencies. Violating any one of them produces provably negative outcomes:

1. **Wave A and Wave B must both be live before paid media restarts.** Wave A alone satisfies the Soul-Food Household but does not lower the per-item price floor. Wave B alone does not address the Black-household demand over-index. Both are required for the relaunch gate to be meaningful.

2. **EXP-002 SLA must be resolved before any paid spend is committed.** The Soul-Food Household is the most repeat-purchase-dependent segment. If paid traffic acquires Soul-Food Household customers who then experience an unfulfilled daily-delivery promise, the first-order acquisition cost is wasted and the NPS damage suppresses referral. The segment's LTV model breaks at the first fulfillment failure.

3. **CRO/UX operator cannot be hired until Wave A/B behavioral data exists.** The operator's 90-day trial is the most time-sensitive investment in Phase 3. If it starts against a broken offer, it ends without a conversion improvement and the unlock condition for the platform decision never arrives.

4. **Platform decision cannot precede the CRO/UX operator engagement.** The current stack's conversion ceiling is unknown because it has never been tested against a full catalog. The operator engagement is the only event that can reveal whether the stack itself (not the offer, not the funnel copy) is the binding constraint.

---

## Resource Allocation Summary

| Resource | Phase 1 Allocation | Phase 2 Allocation | Phase 3 Allocation |
|---|---|---|---|
| Anthony (CEO) | 70% sourcing: Wave A/B vendor outreach, Black-owned badge approvals, pricing validation. 30% investor outreach: Apollo OAuth fix, SAFE raise (parallel track). | 50% paid media oversight (board approval required for any spend above pre-pause level). 50% Wave E sourcing initiation. | 40% CRO operator vendor selection and contract. 60% Wave E launch and operator brief. |
| Zoe (COO) | 80% sourcing execution: vendor selection, inventory levels, fulfillment SLA. 20% EXP-002 SLA resolution and driver routing capacity analysis. | 60% fulfillment scaling for post-relaunch volume. 40% Wave E vendor selection (shelf-stable, no cold-chain). | 50% Wave D scoping (frozen/prepared, sourcing complexity assessment). 50% operator ops requirements brief. |
| Engineering | 60% catalog pipeline: Airtable SKU onboarding, badge activation, specialty rail, /shop navigation fix. 40% delivery fee config, cart minimum config (queued for Phase 2 trigger). | 60% pricing experiments (cart minimum test, tiered delivery fee). 40% LogRocket revival and subscription tier engineering. | 70% CRO operator implementation support. 30% Wave E catalog engineering. |
| Paid media budget | $0. Hold. | Reactivate at pre-pause level ($439/wk) only after gate confirmed. No increase without board approval. | Scale on positive ROAS signal from Phase 2 post-gate data. Any increase requires board approval per standing order. |

_Data gaps: Post-assortment CVR baseline: no behavioral data exists for a catalog with 80+ SKUs. The base-case ROI model ($43K-$72K inventory recovering in 8-14 weeks at 1.5% CVR) is an assumption. The first two weeks of post-Wave A/B organic traffic are the real demand test.; ATC rate and AOV by SKU category: LogRocket is paused, so there is no per-SKU add-to-cart or per-category abandonment data. Reviving LogRocket before paid relaunch is required to know which Wave A/B SKUs are driving or blocking basket completion.; EXP-002 delivery routing capacity: the actual number of ZIP codes and delivery windows the current driver setup can reliably serve every day is unknown. Zoe must produce this number before any SLA is published or any paid campaign targeting south-side households is activated.; Wave A/B sourcing capacity: Run A Way Buckers Club (the single current supplier) cannot supply commodity staples or the full soul-food basket. The vendor pipeline for collards, okra, rice, cornmeal, bananas, onions, and tomatoes is unquantified. Sourcing velocity (SKUs contracted per week) is the true pacing constraint for the 8-12 week sprint target.; Competitive shelf-price validation: the 'cleaner than Whole Foods, cheaper than Aldi' claim has not been verified against live shelf prices for Wave A SKU equivalents. A manual price check at the nearest Aldi and Whole Foods for collards, okra, sweet potatoes, eggs, and chicken is required before Wave A launch copy is finalized.; Black-owned badge eligibility count: the total number of SKUs in the planned Wave A/B catalog that will qualify for the Black-owned badge is unknown until vendor sourcing is finalized. This number determines the strength of the badge as a discovery signal at launch.; Cart minimum sensitivity: the conversion impact of a $15 vs $20 minimum is assumed based on typical produce-basket price points ($1.50-$6.00 per item), but no A/B test has been run. The $15 test is the mechanism to measure this, not a confirmed improvement.; Gross margin by category: the 35% stabilized gross margin target is a projection for the physical flagship store, not the e-commerce channel. Actual realized gross margin on Wave A soul-food SKUs and Wave B commodity staples under current delivery cost structure is unknown and may differ materially from the flagship projection._

### transformation-roadmap

**Uncle Mays must execute a four-phase, 26-week transformation anchored on Wave A and Wave B catalog expansion first, with every downstream lever (paid media, CRO operator, platform decision) gated behind three hard relaunch thresholds that cannot be reached until two new categories are live and basket completion is structurally possible.**

# Transformation Roadmap

## Target Outcome

Move Uncle Mays' paid conversion rate from ~0.46% into the 2-4% food-DTC benchmark range within 26 weeks by fixing the root cause first: a 43-SKU produce-only catalog that cannot build the $30-60 basket paid shoppers need to convert.

By Week 26, the business must reach:
- At least 80-100 live, merchandised SKUs across a minimum of 4 categories (produce, soul-food staples, commodity pantry, protein variety)
- /shop reach above 40% of sessions (currently ~25%)
- Add-to-cart rate above 12% (currently ~5.5%)
- A confirmed, customer-facing daily delivery SLA grounded in actual driver routing
- At least one full-basket paid order (no promo, $50+ AOV) from a net-new paid acquisition source in the same calendar week that the above conversion metrics clear
- Paid media reactivated, a post-assortment behavioral baseline in hand, and the CRO/UX operator hire formally open

Every milestone, decision gate, and governance trigger below is built backward from these outcomes.

---

## Workstreams

| Workstream | Objective | Owner | Key Dependency |
|---|---|---|---|
| WS-1: Wave A Catalog (Soul-Food Basket) | Source and launch collards, okra, smoked cuts, rice, cornmeal, black-eyed peas plus additional protein SKUs (oxtail, smoked turkey necks, ground beef) with Black-owned badge on all eligible items. Target: 40+ new SKUs. | Anthony (CEO) + Zoe (COO) joint | Vendor contracts and inventory commitment signed before any paid relaunch; 10-SKU minimum readiness checklist completed by both owners |
| WS-2: Wave B Catalog (Commodity Staples) | Source and launch bananas, onions, tomatoes, garlic, lemons, cooking oils, dry goods, and pantry staples alongside specialty produce. Target: 30-40 new SKUs. Black-owned badge where sourcing allows. | Zoe (COO) primary, Anthony (CEO) badge approval | Wave A vendor sourcing does not block Wave B commodity sourcing; commodity SKUs are pipeline-ready before Wave A closes |
| WS-3: Delivery SLA Resolution (EXP-002) | Convert the EXP-002 painted-door daily delivery test into a firm, published customer-facing SLA. Resolve actual driver routing capacity. Publish what days and windows are guaranteed, not aspirational. | Zoe (COO) sole owner | No paid relaunch approved until SLA is published and operationally verified for at least two consecutive weeks |
| WS-4: Funnel and Merchandising Readiness | Activate Black-owned badge on all eligible SKUs. Restructure /shop page to lead with soul-food and commodity categories, not microgreens or specialty. Fix homepage-to-shop navigation (currently only 25% of sessions reach /shop). Test $15 cart minimum the week Wave B staples go live. Reactivate LogRocket (paused) to restore behavioral baseline measurement. | Engineering lead (current stack) + Anthony (CEO) on merchandising decisions | Wave A/B SKUs must be in Airtable Catalog before merchandising changes can ship; LogRocket env vars must be restored before any relaunch-gate measurement is valid |
| WS-5: Organic Channel Maintenance | Hold newsletter, organic social (Facebook, Instagram), and transactional email in a steady state through the catalog sprint. Two posts per week on Instagram/Facebook. No promo codes until relaunch gate is confirmed. | CRO (or Anthony acting as CRO) | Mailchimp audience must be re-imported from Stripe before any newsletter campaign targeting customers; organic content must not contradict the SLA published in WS-3 |
| WS-6: Relaunch and Paid Media Restart | Restart Meta and Google Ads ($439/wk pre-pause baseline, then scale) with new creative anchored in soul-food and Black-owned badge story. Soul-Food Household segment on Facebook (recipe-forward video). Health-Forward Professional segment on Instagram and Google search. | Anthony (CEO) approves spend; CRO executes | All three relaunch gate thresholds must clear in the same calendar week before the first dollar is committed |
| WS-7: CRO Operator Hire and Platform Decision | Issue formal RFP to Barrel, Anatta, and Bear Group. Brief operators against post-assortment behavioral baseline. Make platform decision (stay on custom Next.js vs. headless Shopify) only after operator engagement reveals a hard stack constraint. | Anthony (CEO) decision; Zoe (COO) vendor process | Relaunch gate must be cleared and at least one full week of post-assortment behavioral data must exist before the operator is briefed |
| WS-8: Wave E Personal Care (Black-Owned) | Source soaps, batana hair oil, skin and hair care products with Black-owned sourcing integrity. No cold-chain cost. Shelf-stable freight. Target: 15-25 new SKUs. | Anthony (CEO) sourcing approval; Zoe (COO) vendor ops | Wave A/B must be live and showing repeat purchase signal before Wave E sourcing bandwidth is opened; Wave E must not share vendor pipeline bandwidth with WS-1 or WS-2 during the sprint |

---

## Roadmap

| Phase | Timing | Major Actions | Milestones |
|---|---|---|---|
| Phase 0: Sprint Setup | Weeks 1-2 | (1) Lock Wave A and Wave B vendor shortlists and initiate sourcing conversations. (2) Restore LogRocket subscription and re-add env vars to Vercel and Trigger.dev so behavioral measurement is live before any catalog changes ship. (3) Zoe begins formal EXP-002 routing analysis to determine actual driver capacity. (4) Anthony and Zoe jointly complete the Wave A/B 10-SKU minimum readiness checklist template. (5) Engineering activates Black-owned badge code (already wired) on any currently eligible SKUs in the existing 43. (6) Internal baseline measurement: capture current /shop reach, ATC rate, and session-level behavior via LogRocket before any catalog changes. | Decision gate: By end of Week 2, vendor shortlists are signed off by both Anthony and Zoe, LogRocket is live and measuring, and at least one vendor contract is in negotiation for each of Wave A and Wave B. If no vendor contract is in negotiation by Day 14, Anthony escalates sourcing to his network immediately. |
| Phase 1: Catalog Sprint (Wave A and Wave B in parallel) | Weeks 3-12 | Wave A (Weeks 3-10): Onboard soul-food basket vendors. Ingest SKUs into Airtable Catalog. Activate Black-owned badge on all eligible items. Launch collards, okra, smoked cuts, cornmeal, black-eyed peas, rice, oxtail, smoked turkey necks, ground beef into the live customer catalog. Target: 40+ new SKUs live by Week 10. Wave B (Weeks 3-12): Onboard commodity staple vendors. Launch bananas, onions, tomatoes, garlic, lemons, cooking oils, dry goods, pantry. Target: 30-40 new SKUs live by Week 12. Merchandising (Week 5, rolling): Restructure /shop page as Wave A SKUs land. Soul-food and commodity categories lead. Specialty/microgreens move to a secondary rail. Homepage-to-shop navigation fixed (CTA clarity, above-fold shop link). Cart minimum test at $15 queued for the week Wave B staples go live (estimated Week 10-12). Delivery SLA (Weeks 3-8): Zoe completes EXP-002 routing analysis by Week 4 and publishes an internal SLA draft. Customer-facing SLA goes live by Week 6. Verified operationally for two consecutive weeks by Week 8. | Week 6 check-in gate: At least 20 new SKUs live (Wave A and Wave B combined), /shop reach trending up from 25% baseline, Black-owned badge active on all eligible items, customer-facing SLA published. If Wave A SKU count is below 15 by Week 6, Anthony triggers an emergency sourcing escalation before Week 7. Week 10 readiness gate: Wave A at 35+ SKUs, Wave B at 20+ SKUs, $15 cart minimum test running, LogRocket showing ATC trend data. |
| Phase 2: Relaunch Gate Confirmation | Weeks 11-14 | Measure the three hard thresholds in the same calendar week using LogRocket and GA4: (1) /shop reach above 40%. (2) ATC rate above 12%. (3) At least three of the top-10 Black-household staple SKUs live and in-stock. Additionally confirm: customer-facing delivery SLA is published and operationally verified for two consecutive weeks. Run at least five organic-traffic test orders (no promo, no internal accounts) to validate the full basket-build and checkout experience against the expanded catalog. Validate pricing alignment: check live Whole Foods and Aldi shelf prices for Wave A soul-food SKUs and confirm Uncle Mays is priced at no more than 5-12% premium to Whole Foods. Confirm the $15 cart minimum test result: if conversion improves materially at $15 vs. $20, make $15 permanent before paid restart. | Relaunch gate decision: Anthony and Zoe confirm all three thresholds in writing in the same calendar week. If any threshold is not met by Week 14, do not open paid spend. Diagnose which threshold is lagging (SKU count, /shop reach, or ATC), fix it, and recheck weekly until all three clear. No exceptions. |
| Phase 3: Paid Relaunch and Operator Engagement | Weeks 15-20 | Week 15 (paid restart): Reactivate Meta ($377/wk baseline) with new creative: Facebook targets Soul-Food Household (recipe-forward video anchored in soul-food SKUs and Black-owned badge story); Instagram targets Health-Forward Professional (fresh produce, brand story, sourcing narrative). Reactivate Google Ads ($62/wk baseline) against 'fresh produce delivery Chicago' and 'Black-owned grocery delivery' keyword clusters. Track paid CVR, CAC, and AOV weekly. Kill any campaign where CVR is below 1.0% after two full weeks. Week 15 (operator RFP): Issue formal RFP to Barrel, Anatta, and Bear Group. Brief against the post-assortment behavioral baseline (one full week of LogRocket data from the expanded catalog, paid traffic included). Platform decision: custom Next.js vs. headless Shopify is on the agenda for operator scoping calls, not a pre-decided input. Week 17 (operator selection): Select operator. Agree on 90-day trial scope and success metrics. Week 18 (delivery-fee test): If post-relaunch AOV data shows a concentration of orders below $40, activate tiered delivery fee structure: free above $60, $4.99 from $35-59, $7.99 below $35. Track impact on AOV and conversion for two weeks before making permanent. Week 20 check-in gate: Paid CVR above 1.0% (minimum acceptable, not target), AOV above $45, at least one Soul-Food Household repeat order confirmed. | Decision gate at Week 20: If paid CVR has not cleared 1.0% with the expanded catalog and new creative, halt paid spend again and bring the CRO operator into a full funnel audit before recommitting budget. If CVR is above 1.5%, accelerate budget toward the higher-performing segment and channel. |
| Phase 4: Wave E and Scale | Weeks 21-26 | Wave E sourcing (Weeks 21-24): Anthony opens Wave E personal care sourcing (soaps, batana hair oil, skin and hair care) only if Wave A/B are showing repeat purchase signal and WS-1/WS-2 vendor bandwidth is no longer bottlenecked. Target: 15-25 new SKUs, shelf-stable, Black-owned sourcing integrity, no cold-chain. Wave E launch (Weeks 24-26): Activate personal care category in the catalog. Ensure it has its own discovery mechanism on /shop (dedicated rail, not just catalog depth). CRO operator engagement (Weeks 21-26): Operator executes 90-day trial. Funnel optimization against behavioral baseline. Platform decision resolved by Week 24 based on operator findings. Scale paid media to the level the unit economics support: paid CVR must sustain above 1.5% and CAC must be below the first-order gross profit margin (assumption: approximately $18-25 at 35% gross margin on a $50-70 AOV) before budget increases above the $439/wk pre-pause baseline. | Exit criteria for the 26-week roadmap: paid CVR at or above 1.5%, AOV at or above $50 on paid acquisition, at least two confirmed repeat orders from Soul-Food Household segment customers, Wave E live with 15+ SKUs, operator engagement underway with a platform recommendation in draft. |

---

## First 90 Days

The first 90 days cover Phase 0, Phase 1, and the early part of Phase 2. Every action in this window is either directly attacking the binding constraint (catalog breadth) or preparing the measurement infrastructure needed to know when the constraint is resolved.

**Week 1 (immediately):**
- Anthony and Zoe jointly build the Wave A and Wave B vendor shortlists. Minimum three vendor candidates per category. No single-source dependencies allowed in Wave A (the current single-farm-supplier model is a sourcing concentration risk that Wave A must not replicate for its highest-volume SKUs).
- Engineering restores LogRocket subscription: re-add `NEXT_PUBLIC_LOGROCKET_APP_ID` and `LOGROCKET_PAT` to Vercel (prod and preview) and Trigger.dev project env vars, uncomment the three cron lines in the relevant trigger files, and redeploy. This is a prerequisite for all relaunch-gate measurement. Without it, the team is flying blind.
- Engineering activates the Black-owned badge on any currently eligible SKUs in the existing 43 (no new sourcing required; the badge is already wired in code). This is a zero-cost, same-week win.

**Week 2:**
- At least one Wave A vendor contract in active negotiation (not just initiated). If Anthony's personal sourcing network has not surfaced a soul-food staple vendor by Day 10, escalate to a Chicago-area Black food distributor cold outreach push before Day 14.
- Zoe begins formal EXP-002 routing analysis: map actual driver capacity against the 'every day' customer promise. Document which delivery windows are genuinely coverable today.
- Engineering captures the current /shop reach and ATC baseline from LogRocket (now restored) and GA4. This is the pre-intervention measurement that all future gate checks compare against.

**Weeks 3-6:**
- Ingest the first Wave A SKUs into Airtable Catalog as soon as vendor contracts are signed. Do not wait for all 40 SKUs to be ready before the first batch goes live. Launch in batches of 8-10 SKUs to build /shop momentum while sourcing continues.
- Restructure /shop page to lead with the soul-food and commodity categories as soon as the first Wave A batch is live. The current page leads with microgreens and specialty produce, which is the wrong signal for the Soul-Food Household.
- Zoe publishes the customer-facing delivery SLA by Week 6. If actual routing capacity cannot support seven days per week, publish the days that are guaranteed and be explicit. A credible three-days-per-week SLA is better than an aspirational seven-days-per-week promise that creates fulfillment trust gaps.
- Week 6 gate review: Anthony and Zoe jointly review the gate checklist. If the 20-SKU threshold is not met, the escalation protocol activates immediately, not at the next scheduled review.

**Decision gates in the first 90 days:**
1. Day 14: Vendor shortlists signed off and at least one contract in active negotiation per wave. If not, Anthony escalates sourcing strategy before Day 21.
2. Week 6: 20+ new SKUs live, /shop reach trending up from 25% baseline, customer-facing SLA published. If not, hold all other workstreams and focus 100% of capacity on whichever of the two is lagging.
3. Week 10: Wave A at 35+ SKUs, Wave B at 20+ SKUs, $15 cart minimum test running, LogRocket ATC data available for trend analysis. If not, delay the relaunch gate confirmation by the number of weeks needed to clear this milestone.

**What is explicitly not happening in the first 90 days:**
- No paid media spend (Meta and Google remain paused until the relaunch gate clears, estimated Week 11-14 at the earliest).
- No CRO operator hire outreach or RFP (deferred to Phase 3, after the relaunch gate).
- No platform migration planning or vendor evaluation (deferred until post-operator engagement).
- No new promo codes (the clean-price experiment continues; do not confound the behavioral signal).
- No Wave E personal care sourcing (Wave A and Wave B have full vendor sourcing bandwidth for the sprint).

---

## Governance

**Cadence:**

| Cadence | Meeting | Attendees | Agenda |
|---|---|---|---|
| Weekly (every Monday) | Catalog Sprint Review | Anthony (CEO), Zoe (COO) | SKU count vs. target, vendor pipeline velocity, gate milestone status, blockers |
| Weekly (every Friday) | Funnel Metrics Review | Anthony (CEO) + Engineering lead | /shop reach, ATC rate, LogRocket session trends, delivery SLA compliance data |
| Bi-weekly | Full Roadmap Review | Anthony (CEO), Zoe (COO), Engineering lead | Phase progress, gate status, risk escalation, resourcing decisions |
| Ad hoc (triggered) | Gate Confirmation Meeting | Anthony (CEO), Zoe (COO) | Formal sign-off when all three relaunch gate thresholds clear in the same calendar week |

**Metrics ownership:**

| Metric | Owner | Cadence | Relaunch Gate Threshold |
|---|---|---|---|
| /shop reach (% of sessions) | Engineering lead (measured) reported to Anthony | Weekly | Above 40% |
| Add-to-cart rate | Engineering lead (measured) reported to Anthony | Weekly | Above 12% |
| Top-10 Black-household staple SKUs live and in-stock | Zoe (COO) | Weekly | At least 3 of 10 confirmed in the same calendar week as the other two thresholds |
| Delivery SLA compliance | Zoe (COO) | Weekly | Customer-facing SLA published and operationally verified two consecutive weeks before relaunch |
| Sourcing pipeline velocity (new SKUs sourced per week toward Wave A/B targets) | Anthony (CEO) primary, Zoe (COO) ops | Weekly | Wave A at 40+ SKUs, Wave B at 30+ SKUs, by Week 12 |
| Paid CVR (post-relaunch only) | Anthony (CEO) | Weekly, post-relaunch | Not meaningful until post-relaunch gate; target 1.5%+ to sustain spend, 1.0% minimum acceptable |
| Paid CAC vs. first-order gross margin | Anthony (CEO) | Weekly, post-relaunch | CAC must be below estimated first-order gross profit (assumption: $18-25 at 35% margin on $50-70 AOV) before budget increases |

**Escalation protocol:**

Any gate milestone missed by more than two weeks triggers an escalation call within 48 hours. The call must produce one of three decisions: (1) targeted resource reallocation to unblock the lagging workstream, (2) revised gate timeline with documented root cause, or (3) a strategic decision to pivot approach if the root cause is structural. No milestone slip is acknowledged without a documented decision.

**Decision rights (binary, no ambiguity):**

| Decision | Authority | Condition |
|---|---|---|
| Wave A/B SKU launch (any batch) | Anthony (CEO) sourcing standards + Zoe (COO) vendor ops: both must sign off | 10-SKU minimum readiness checklist complete |
| Black-owned badge activation on a SKU | Anthony (CEO) sole authority | Vendor sourcing integrity confirmed |
| Customer-facing delivery SLA publication | Zoe (COO) sole authority | Grounded in verified driver routing data, not aspirational |
| Paid media reactivation | Anthony (CEO) approves; must confirm all three relaunch gate thresholds cleared in writing | All three thresholds in same calendar week |
| CRO operator RFP initiation | Anthony (CEO) approves | Relaunch gate confirmed and one full week of post-assortment paid behavioral data exists |
| Platform migration commitment | Anthony (CEO) board-level decision | Post-operator engagement, hard stack constraint documented, not before |
| Wave E sourcing opening | Anthony (CEO) + Zoe (COO) joint | Wave A/B repeat purchase signal confirmed, Wave A/B vendor bandwidth no longer bottlenecked |
| Cart minimum change from $20 to $15 | Anthony (CEO) | Week Wave B staples go live; measure for two weeks, make permanent if conversion improves |
| Paid budget increase above $439/wk pre-pause baseline | Anthony (CEO) board approval required (net-new spend commitment per standing order) | CVR above 1.5%, CAC below first-order gross margin for two consecutive weeks |

**Risk register:**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Wave A sourcing velocity is slower than 8-12 weeks because Run A Way Buckers Club is the only current vendor and soul-food staples require different supplier relationships | High | High: delays the relaunch gate and keeps paid CVR broken | Initiate at least three Wave A vendor conversations in Week 1. Do not accept a single-vendor dependency for collards, okra, or smoked cuts. |
| The relaunch gate is cleared but assortment breadth is not the primary CVR driver: funnel friction (checkout UX, trust signals, delivery clarity) is equally or more responsible | Medium | High: the Wave A/B investment does not produce the 2-4% CVR target even after catalog expands | After relaunch gate clears, run an isolated funnel friction test (three-day LogRocket deep-dive on session recordings of /shop abandoners) before committing the full $50-120K CRO operator budget |
| EXP-002 reveals that daily delivery is not operationally feasible at current team scale, forcing a published SLA that contradicts the customer-facing promise | Medium | High: trust gap suppresses repeat purchase for the highest-LTV segment | Zoe completes the routing analysis by Week 4 and presents options to Anthony. The SLA published must be what the team can guarantee, not what sounds best in marketing copy. |
| The $15 cart minimum test reduces average AOV below the delivery economics threshold, making delivery unprofitable at scale | Low-Medium | Medium: requires re-examining the tiered delivery fee structure or reverting to $20 | Run the $15 test for two weeks only, tracking both conversion rate and AOV. If AOV drops below $35, revert to $20 and instead accelerate the tiered delivery fee structure. |
| A venture-backed entrant enters the Black-farmed south-side Chicago delivery space during the 8-12 week catalog sprint pause in paid acquisition | Low | Medium: erodes first-mover advantage in the 'Black-farmed produce delivery Chicago' keyword cluster | Maintain organic social posting cadence (two posts per week) and one low-cost newsletter to signal market presence even while paid is paused. The Black-owned badge and Black-farmed sourcing are not replicable quickly by a new entrant. |
| Platform migration is initiated before the post-operator behavioral baseline exists, creating a 3-6 month competitive vulnerability window | Low (deferred by governance) | High: delays relaunch gate by an entire migration cycle | Platform migration is explicitly gated behind the operator engagement by governance. Any agent or advisor proposing a migration before Week 21 must be escalated to Anthony for an explicit exception decision. |


_Data gaps: Actual Wave A vendor landscape for south-side Chicago / Midwest Black-owned soul-food staple suppliers (collards, okra, smoked cuts, cornmeal, black-eyed peas): no current sourcing relationships outside Run A Way Buckers Club; engagement timeline and minimum order quantities unknown.; EXP-002 daily delivery routing capacity data: actual driver headcount, days covered per week, and routing coverage by ZIP are unpublished internally. Without this, the published SLA is aspirational, not operational.; Post-assortment CVR baseline: all funnel metrics (/shop reach 25%, ATC 5.5%, CVR 0.46%) are pre-catalog-expansion and pre-LogRocket-restoration measurements. No behavioral data exists from an expanded catalog. The relaunch gate thresholds (40% /shop reach, 12% ATC) are defensible benchmarks based on food-DTC comparables but are not Uncle Mays-specific empirical targets.; Live Whole Foods and Aldi shelf prices for the specific soul-food SKUs Uncle Mays plans to launch (collards, okra, black-eyed peas, smoked cuts): required to validate the 'cleaner than Whole Foods, cheaper than Aldi' positioning claim before Wave A launches.; Wave A and Wave B inventory unit economics: first-order cost per SKU, minimum order quantities, spoilage/shrinkage rates, and cold-chain handling costs for smoked cuts and proteins. The $43K-$72K total inventory investment is an estimate from business-case-builder; actual vendor quotes required to confirm.; Black-owned personal care supplier landscape (Wave E): soaps, batana hair oil, skin and hair care products with verifiable Black-owned sourcing. No current vendor relationships identified. Lead time and minimum order quantities unknown.; CAC at post-relaunch CVR levels: the $18-25 first-order gross margin threshold used in the governance metrics is an estimate derived from a 35% gross margin assumption on $50-70 AOV. Actual gross margin on the current live catalog (not the 35% stabilized projection) is unknown and would change the CAC floor materially._


## 5. Risk & Governance

### risk-and-mitigation

**The Wave A and Wave B catalog sprint faces five decision-changing risks, the most dangerous of which is that assortment breadth is not the primary conversion driver, a scenario that would invalidate the entire sequencing strategy and strand $43K-$72K of inventory investment without a payoff.**

# Strategic Risk Register

## Strategy Under Review

Uncle Mays is executing a six-phase product-mix reset anchored on Wave A (soul-food basket: collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) and Wave B (commodity staples: bananas, onions, tomatoes, pantry) running in parallel on the current Next.js stack. The goal is to expand from 43 active SKUs to 80-100 live SKUs in 8-12 weeks, pass a relaunch gate (/shop reach above 40%, ATC above 12%, three of the top-10 Black-household staple SKUs in-stock in the same calendar week), and then restart paid media against a catalog that can support basket completion. Every other lever, including the $439/week paid budget, the $50K-$120K CRO operator hire, and any platform migration, is formally deferred until the gate is passed. The binding assumption across all prior phases is that assortment breadth is the primary driver of the 0.46% paid CVR versus a 2-4% food-DTC benchmark.

---

## Risk Register

| Risk | Category | Likelihood | Impact | Mitigation | Owner | Trigger | Residual Risk |
|---|---|---|---|---|---|---|---|
| **Assumption inversion: assortment is not the primary CVR driver.** If checkout UX friction, delivery trust gap, or price perception are equally or more responsible for the 0.46% CVR, adding 40-60 new SKUs will not move conversion. The $43K-$72K inventory investment recoups nothing and the team has consumed 8-12 weeks of sprint capacity without a payoff. | Customer / Market | Medium (35-45%). Prior phases identify assortment as the most probable root cause, but the evidence is inferential: 5.5% ATC from 43 SKUs is consistent with assortment failure, but also with a trust or UX failure at the browse stage. No A/B test isolates the cause. | Critical. Invalidates the entire sequencing strategy. Every deferred lever (paid media, CRO hire, platform) is deferred on the premise that offer breadth is the binding constraint. If that premise is wrong, the strategy must be redesigned from scratch. | (1) Reactivate LogRocket before Wave A/B launches so session recordings capture browse-stage drop-off patterns on the expanded catalog from day one. (2) Set a 30-day post-launch behavioral checkpoint: if ATC does not improve to at least 8% within 30 days of Wave A/B live, treat as a signal that assortment is not the sole driver and commission a 5-session moderated user test with south-side shoppers to isolate competing causes. (3) Do not wait for the full relaunch gate to run this diagnosis. | Anthony (CEO): owns the 30-day checkpoint decision. Logan Rocket reactivation: CIO/tech lead. | ATC below 8% at 30 days post Wave A/B launch, measured on organic + direct traffic only (no paid). | Medium-low. Even if assortment is not the sole driver, a broader catalog reduces the risk of browse-stage abandonment and is necessary regardless. The 30-day checkpoint limits the capital at risk. |
| **Sourcing concentration: single primary farm supplier with seasonal constraints.** Run A Way Buckers Club (Pembroke, IL) is the only confirmed farm supplier. Wave A soul-food SKUs (collards, okra, smoked cuts) and Wave B staples (pantry, beans) require vendor relationships that do not yet exist as confirmed agreements. One harvest failure, pricing dispute, or supplier exit hollows the catalog at any point. | Operational | High (55-65%). Produce supply from a single small-scale farm is inherently seasonal and weather-dependent. Wave A and Wave B both require net-new vendor relationships that are currently unconfirmed. | High. A supply disruption mid-wave forces a catalog rollback, damages the in-stock credibility of the brand at the worst possible moment (first exposure to the expanded catalog), and delays the relaunch gate by weeks or months. | (1) Anthony and Zoe must identify and confirm at least two backup sources per Wave A soul-food SKU before any SKU goes live (not before Wave A launches, before each individual SKU is published). (2) Stage Wave B commodity staples through a regional distributor (Chicago-area distributors include KeHE, UNFI Midwest) as a bridge while Black-owned sourcing relationships for those categories are developed. (3) Establish a minimum in-stock threshold of three weeks of inventory per SKU as a publishing gate. SKUs that cannot clear three weeks of projected demand in inventory are held from the live catalog until sourced. | Zoe (COO): owns vendor confirmation and in-stock thresholds. Anthony (CEO): approves Black-owned badge status for each new supplier. | Any SKU going out of stock for more than 48 hours after Wave A/B launch, or any single supplier signaling a supply disruption before launch. | Medium. Sourcing concentration cannot be fully mitigated in 8-12 weeks. The distributor bridge reduces the risk for commodity staples but Wave A specialty soul-food items (okra, smoked cuts, black-eyed peas) require direct supplier relationships that take time to establish. |
| **EXP-002 daily delivery SLA unresolved before paid relaunch.** The customer-facing promise is daily delivery, customer-picked window. The actual driver routing capacity is unverified and the EXP-002 painted-door test has not produced a published SLA. If Zoe cannot confirm actual routing coverage before paid traffic resumes, fulfillment failures will suppress repeat purchase for the Soul-Food Household (highest-LTV segment) independent of catalog progress. | Operational | Medium-high (50-60%). The painted-door test is still running as of 2026-06-07 with no published resolution. Scaling from organic order volume to paid-traffic order volume without a confirmed routing SLA is operationally risky. | High. The Soul-Food Household segment is the most repeat-purchase-dependent segment in the customer model. A single missed delivery window or unfulfilled order in the first two weeks of paid relaunch produces a negative word-of-mouth event in a community where referral (89.6% stated intent) is a primary growth channel. Each failed delivery is not just a lost order: it is a lost referral chain. | (1) Make EXP-002 resolution a hard gate alongside the catalog gate. Zoe publishes a written, customer-facing SLA grounded in confirmed driver routing capacity by Week 4 of the sprint, regardless of catalog progress. (2) If daily coverage across the full service area cannot be confirmed, narrow the initial paid relaunch geography to the ZIP codes where routing is confirmed (Hyde Park and nearest south-side ZIPs), then expand as capacity is proven. (3) Add a real-time order volume cap per day at checkout (e.g., maximum N orders per delivery date) to prevent routing overload during the relaunch window. | Zoe (COO): owns EXP-002 resolution, published SLA, and order volume cap at checkout. | EXP-002 still unresolved at Week 4 of the sprint, OR any order fulfillment failure rate above 3% in the two weeks following paid relaunch. | Medium. The geographic narrowing fallback significantly reduces operational risk but also reduces the addressable paid audience for the relaunch, which may slow the pace of reaching the relaunch gate thresholds. |
| **Relaunch gate governance failure: no named measurement owner or weekly review cadence.** The three-threshold gate (/shop reach above 40%, ATC above 12%, three top-10 staple SKUs in-stock) is defined in the roadmap but has no assigned measurement owner, no weekly review meeting, and no mechanism to prevent Anthony or a future CRO operator from declaring the gate passed based on a single good day rather than a confirmed weekly trend. | Organizational | Medium-high (50-60%). Governance gaps in small founding teams under capital pressure are the norm, not the exception. With investor outreach idle and a SAFE raise pending, the incentive to restart paid spend prematurely is high. | High. Premature paid relaunch at 0.46% CVR (or even at 0.8-1.0% if the catalog partially improves but has not fully expanded) burns cash with negative unit economics and re-establishes a "paid media doesn't work" narrative at a critical moment for investor perception. | (1) Assign explicit metric ownership now: Zoe owns /shop reach and fulfillment SLA, reported weekly. Anthony owns sourcing pipeline velocity (SKUs per week toward Wave A/B targets). No one is assigned paid CVR ownership until the gate is passed, because the metric is not yet meaningful. (2) Schedule a weekly 30-minute gate review (Anthony + Zoe) starting Week 4 of the sprint, using a single shared dashboard that shows all three gate metrics on the same view. (3) Define "confirmed" as three consecutive weeks above the threshold, not a single week, to prevent false positives from a promotional organic traffic spike. | Anthony (CEO): owns the gate-review meeting and final go/no-go call. Zoe (COO): owns the weekly metric report. | Any discussion of restarting paid media before the three-consecutive-week threshold is met on all three gate metrics simultaneously. |  Low-medium after governance structure is in place. The primary residual risk is CEO override under capital pressure. |
| **Wave A pricing misalignment with Whole Foods and Aldi shelf prices.** The 'cleaner than Whole Foods, cheaper than Aldi' claim has not been validated against actual live shelf prices for Wave A soul-food items. If collards, okra, or smoked cuts are priced at or above Whole Foods shelf price, the positioning claim collapses for the first comparison-shopping buyers and triggers negative word-of-mouth rather than the intended referral effect. | Market / Customer | Medium (35-45%). Specialty and Black-farmed soul-food items often carry premium production costs. A 5-12% premium-to-Whole-Foods pricing target is cited in the pricing-strategy phase as a goal, but whether actual Wave A sourcing costs allow that pricing without margin compression is unverified. | Medium-high. Pricing misalignment on Wave A at launch permanently anchors the price perception for early adopters in the Soul-Food Household segment. Price perception is difficult to recalibrate without a visible price cut, which damages margin and brand credibility simultaneously. | (1) Before Wave A SKUs are published, Anthony or Zoe physically checks Whole Foods (Hyde Park location, 5118 S Lake Park) and Aldi (nearest south-side location) shelf prices for every Wave A SKU equivalent. This is a one-time two-hour task, not a market research project. (2) Price each Wave A SKU at no more than Whole Foods shelf price for a comparable item, and flag any SKU where Uncle Mays cost structure requires pricing above Whole Foods. Those SKUs go into a "Specialty / What's-in-season" rail (already CEO-approved for specialty items) rather than the core basket, until sourcing costs can be reduced. (3) For Wave B commodity staples (bananas, onions, tomatoes), price at or below Aldi. These are the items where the 'cheaper than Aldi' claim must be literally true, not directionally true. | Anthony (CEO): approves final Wave A and Wave B pricing before publish. Zoe (COO): conducts the shelf-price audit. | Any Wave A/B SKU published at a price above the Whole Foods shelf equivalent for a comparable item, OR any customer review or social media comment citing price as a reason for not purchasing. | Low after the shelf-price audit is complete, provided sourcing costs are consistent with the pricing targets. |
| **LogRocket subscription pause creates a behavioral measurement blind spot during the most important catalog transition.** LogRocket has been paused since 2026-05-28. Wave A and Wave B will produce the first net-new shopper behavior on an expanded catalog, and the team will have no session-level data to diagnose what is working, where drop-off occurs, or whether the assortment assumption is validated. The relaunch gate thresholds (ATC, /shop reach) can be measured via GA4, but root-cause diagnosis of any shortfall requires session replay. | Operational / Organizational | High (70-80%). Revival requires only re-adding two environment variables and uncommenting three cron lines, but it has been paused for at least 10 days with no documented revival date. Under sprint pressure, operational housekeeping items like this get delayed. | Medium-high. Without session replay, the team cannot distinguish between "shoppers are seeing the new SKUs but not adding them" and "shoppers are not finding the new SKUs." These diagnoses lead to completely different interventions. Blind-spot measurement during the first 30 days of Wave A/B is directly responsible for the most dangerous risk (assumption inversion) not being caught early. | (1) Reactivate LogRocket before Wave A/B launches. The revival steps are documented in CLAUDE.md: re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel (prod and preview) and Trigger.dev project env vars, uncomment three cron lines, deploy. Assign this as a named task with a completion date in the first week of the sprint. (2) Define three specific Galileo query questions to run in the first week after Wave A/B launches: (a) What is the browse-to-ATC drop-off point on new SKUs? (b) Are shoppers reaching the new category sections? (c) What is the session-level behavior on the cart minimum wall? | CIO or tech lead: owns LogRocket revival by Day 7 of the sprint. Anthony (CEO): owns the Galileo query review at Day 30 checkpoint. | Wave A/B live with LogRocket still paused. | Low once reactivated. The tool is intact; only env vars and cron lines are dark. |
| **Capital sequencing squeeze: Wave A/B inventory draws on the same cash reserve needed to trigger the SBA facility.** The SAFE raise ($400K-$750K, 5M cap) is intended primarily to fund the Hyde Park flagship build-out, with the $400K minimum triggering the SBA 7(a) facility close. Wave A/B inventory is estimated at $43K-$72K. If that inventory spend draws from the same unrestricted cash that must remain intact for the SBA trigger, a cash flow squeeze could force either a catalog rollout pause or a premature paid relaunch (to generate revenue) at the worst possible moment. | Financial | Low-medium (25-35%). The SAFE raise is currently idle (Apollo OAuth revoked, investor outreach paused). If the raise closes before Wave A/B inventory is procured, there is no squeeze. If the raise is delayed more than 12 weeks, the team may be sourcing Wave A/B inventory from operating cash. | Medium. A cash flow squeeze does not kill the strategy but forces a timing compromise: either the catalog sprint slows (fewer SKUs per week) or paid media is reactivated prematurely to generate short-term revenue, both of which undermine the sequencing logic that the entire strategy rests on. | (1) Jua (CFO) confirms current unrestricted cash balance and the minimum cash floor required to maintain SBA facility eligibility before Wave A/B sourcing contracts are signed. (2) If unrestricted cash after the SBA floor is below $80K, cap Wave A/B initial inventory at $43K (the low end of the range) and phase Wave B staples through a consignment or pay-on-sale arrangement with a regional distributor rather than purchasing inventory outright. (3) Fix the Apollo OAuth revocation (Google Workspace Admin: set Apollo to Trusted) as a parallel track to the catalog sprint, not a sequential one. Every week the SAFE raise is idle is a week the cash buffer shrinks. | Jua (CFO): owns cash floor confirmation and SBA eligibility monitoring. Anthony (CEO): owns Apollo OAuth fix and SAFE raise restart timeline. | Operating cash balance approaching the SBA minimum floor before the SAFE raise closes, OR any discussion of restarting paid media to generate short-term revenue before the relaunch gate is passed. | Low-medium. The CFO monitoring and the inventory phase-in option significantly reduce the risk, but the SAFE raise timeline is the ultimate lever. |

---

## Highest-Risk Assumptions

**1. Assortment breadth is the primary driver of 0.46% paid CVR (load-bearing, unproven).**
All prior phases treat this as the most probable root cause, but the evidence is inferential. The 5.5% ATC rate from organic and paid sessions on 43 SKUs is consistent with assortment failure, but also with checkout trust failure, delivery UX confusion, or price-perception misalignment. The 30-day post-launch behavioral checkpoint (ATC above 8% from organic traffic within 30 days of Wave A/B) is the first behavioral test of this assumption. If the assumption fails, the entire six-phase plan requires redesign.

**2. Black-farmed and Black-owned sourcing can scale from one farm supplier to 80-100 SKUs in 8-12 weeks (load-bearing, structurally constrained).**
The sourcing base today is a single farm (Run A Way Buckers Club) plus an unverified vendor pipeline in Airtable (app3raEVB9kHeUoHE, 1,025 rows) that is a prospecting list, not confirmed supply relationships. Wave A soul-food items and Wave B commodity staples both require net-new agreements. This assumption is the one most likely to create a timeline slip that forces a premature paid relaunch.

**3. The daily delivery promise is operationally supportable at paid traffic volumes (unresolved).**
EXP-002 is a painted-door test: the customer sees a daily delivery promise, but the actual routing covers a subset of dates and ZIPs the team can staff each week. This assumption must be resolved to a firm, written SLA before any paid traffic is directed at the expanded catalog, because fulfillment failures in the first two weeks of paid relaunch are the highest-impact word-of-mouth risk in the system.

**4. Wave A/B pricing sits below Whole Foods and at or below Aldi for comparable items (unvalidated).**
The pricing strategy phase recommends a 5-12% premium to Whole Foods for specialty soul-food items and at-or-below Aldi for commodity staples. Neither has been validated against live shelf prices. A two-hour shelf-price audit at the Hyde Park Whole Foods and nearest Aldi south-side location must happen before Wave A/B SKUs are priced and published.

**5. The 97% intent-to-shop survey translates to actual cart-building at $30-$60 AOV with the expanded catalog (directional, not behavioral).**
The survey was conducted before the catalog existed in its current form. Stated intent does not predict actual basket-building behavior, particularly at a $20 cart minimum with a $7.99 delivery fee. The first 30-60 paying customers on the expanded catalog are the real behavioral test. Do not adjust paid budget or operator hiring timelines based on survey data alone.

**6. The current Next.js stack can support a credible CRO operator engagement without replatforming (untested).**
The CRO operator hire is deferred until post-assortment, which is correct. But the implicit assumption is that Barrel, Anatta, or Bear Group can meaningfully optimize on the current custom stack. If any shortlisted operator's minimum effective engagement requires Shopify or a headless commerce framework, the platform decision becomes non-deferrable at the operator hire moment. This must be verified in the scoping conversation before signing any operator agreement.

---

## Contingency Moves

**If ATC does not improve to 8% within 30 days of Wave A/B launch (assumption inversion signal):**
1. Pause any remaining Wave B sourcing commitments that have not yet shipped.
2. Commission five moderated user sessions (in-person or remote, compensated at $75-$100 each) with south-side Chicago shoppers matching the Soul-Food Household or Health-Forward Professional profile, focused on the live /shop page with the expanded catalog.
3. Run a LogRocket Galileo query on session recordings from the first 30 days to identify the specific browse-stage drop-off point on new SKUs.
4. Bring the findings to a single decision session: is the primary failure (a) SKU discoverability (navigation/merchandising fix, 1-2 weeks), (b) checkout friction (begin scoping CRO operator earlier than planned), or (c) price perception (run the shelf-price audit immediately if not yet done)?
5. Do not restart paid media until the primary failure mode is identified and a fix is shipped.

**If a key Wave A supplier fails or goes out of stock within 60 days of launch:**
1. Activate the backup sourcing list that Zoe confirmed before Wave A launched. If no backup is confirmed, immediately pull the affected SKU from the live catalog rather than showing an out-of-stock flag, to protect catalog credibility.
2. Replace the pulled SKU with the next-highest-demand Wave A item that has confirmed supply, using the top-30 Black-household consumption research as the priority list.
3. Communicate proactively to any customers who had that SKU in a pending order: full refund on that line item plus a $5 store credit toward the next order, no promo code required (this is a service recovery action, not a marketing promo).

**If Zoe cannot publish a firm delivery SLA by Week 4 of the sprint:**
1. Narrow the paid relaunch geography to a confirmed routing zone: the three to five south-side ZIP codes where driver routing is already proven at current organic volume (assumed to be Hyde Park and immediately adjacent ZIPs based on the pickup location at Polsky Center).
2. Add an order volume cap per delivery date at checkout, visible to the shopper as "Limited slots available," to prevent routing overload in the first weeks of paid relaunch.
3. Do not expand paid geography until one full month of the narrowed-geography SLA is clean (fulfillment failure rate below 3%).

**If the SAFE raise remains idle at Week 8 of the sprint and operating cash approaches the SBA minimum floor:**
1. Jua (CFO) presents a 30-day cash bridge plan to Anthony that identifies which Wave B sourcing commitments can be converted to pay-on-sale or consignment terms with the regional distributor.
2. Hold Wave E (personal care) entirely until the SAFE closes. Wave E inventory ($15K-$25K) is the most deferrable spend in the roadmap.
3. Anthony personally re-authenticates one Apollo mailbox per week (staggered, not bulk) following the Google Workspace Admin fix, to restart the SAFE raise pipeline. The Apollo OAuth fix is the single highest-leverage action for unblocking investor outreach and it has a documented resolution path in CLAUDE.md.

**If a paid competitor (Instacart-backed or venture-backed Black food e-commerce) announces entry into south-side Chicago before the relaunch gate is passed:**
1. Accelerate the Black-owned badge activation across all eligible SKUs immediately, even if only 20-30 SKUs are live at that point. Sourcing-integrity differentiation is the only moat that cannot be replicated on a short timeline.
2. Do not accelerate paid relaunch in response to competitive pressure if the relaunch gate has not been passed. Reactivating paid media at 0.46% CVR against a better-funded competitor produces a worse outcome than staying dark and completing the catalog.
3. Accelerate organic social content (Facebook and Instagram on owned accounts) featuring Black farmer stories, harvest footage from Run A Way Buckers Club, and community-sourcing narratives. This content costs nothing and widens the sourcing-credibility gap before the competitor can establish its own narrative.

**If the CRO operator scoping reveals that the shortlisted operators (Barrel, Anatta, Bear Group) require Shopify as a minimum effective engagement condition:**
1. Treat this as a decision point, not a blocker. Bring the platform decision forward with a defined scope: what specific conversion improvements would Shopify unlock that the current Next.js stack cannot support?
2. Commission a two-week technical assessment (not a full migration scoping) to identify which checkout, catalog, and merchandising capabilities are stack-constrained versus configuration-constrained on the current Next.js build.
3. Do not begin a migration without a behavioral baseline from at least four weeks of post-assortment paid traffic data. A migration without a baseline produces a new funnel with no comparison point.


_Data gaps: ATC rate broken out by SKU category (produce vs. protein) from the current 43-SKU catalog: this would isolate whether the ATC failure is uniform across categories or concentrated in produce-only sessions, directly testing the assortment assumption before Wave A/B launches.; Confirmed vendor agreements (not prospecting contacts) for Wave A soul-food items: collards, okra, smoked turkey necks or smoked cuts, dry black-eyed peas, cornmeal. The Airtable vendor pipeline (1,025 rows) is prospecting, not confirmed supply.; Live shelf prices at the Hyde Park Whole Foods (5118 S Lake Park Ave) and the nearest south-side Aldi for every Wave A and Wave B SKU equivalent. Required before Wave A/B pricing is set.; EXP-002 output: which delivery dates and which ZIP codes in the service area have been successfully fulfilled at current organic order volume, and what is the maximum orders-per-day the current driver routing can reliably serve? This is the input to the published SLA.; Operating cash balance and the minimum unrestricted cash floor required to maintain SBA 7(a) facility eligibility (Busey Bank conditional approval). Without this number, the Wave A/B inventory budget cannot be safely sized.; LogRocket session recordings from the current catalog (before Wave A/B launches) showing the specific browse-stage drop-off point on /shop: is drop-off concentrated at the category navigation level, the individual SKU card level, or at the cart minimum wall? This is the cheapest test of the assortment assumption before any sourcing spend.; Minimum technical requirements from Barrel, Anatta, and Bear Group for a conversion rate optimization engagement: do any of them require Shopify or a headless commerce framework as a condition of engagement, or will they work on the current custom Next.js stack?_

### war-gaming

**The Wave A/B catalog sprint is structurally sound but carries three scenarios that could each independently prevent the relaunch gate from being reached: sourcing failure at the single-farm supplier level, a competitor (Instacart/DoorDash) blanketing south-side Chicago with a Black-food marketing push before Uncle Mays relaunches, and execution drag on EXP-002 that leaves the Soul-Food Household unretainable even after the assortment improves.**

# Strategy War Game

## Strategy Under Test

Uncle Mays is executing a "Catalog-First, then Funnel" sequencing strategy. The core logic: launch Wave A (soul-food basket: collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) and Wave B (commodity staples: bananas, onions, tomatoes, pantry) in parallel on the current Next.js stack, targeting 80-100 live SKUs within 8-12 weeks. Paid ads remain paused. The relaunch gate requires three hard thresholds in the same calendar week: /shop reach above 40%, ATC above 12%, and at least three of the top-10 Black-household staple SKUs live and in-stock. Every other lever (paid media restart, CRO operator hire at $50-120K, platform migration, cart-minimum test) is formally deferred until the gate clears. The business case rests on moving CVR from 0.46% to approximately 1.5% post-assortment, at $50 AOV, on modest paid traffic volume, generating roughly $5K-$6K in incremental weekly revenue that recoups the $43K-$72K inventory investment in 8-14 weeks.

The strategy is correct in diagnosis and sequence. The war game tests whether it survives contact with sourcing reality, competitive timing, operational execution, and capital uncertainty.

---

## Scenarios

| Scenario | Trigger | Impact | Likelihood | Severity |
|---|---|---|---|---|
| **S1. Sourcing collapse at Run A Way Buckers Club** | Single farm supplier cannot deliver Wave A soul-food SKUs (collards, okra) at catalog volume due to seasonal shortfall, crop failure, or capacity constraints. No backup supplier exists today. | Wave A sprint halts. Soul-food basket cannot launch. The highest-LTV segment (Soul-Food Household) remains unserved. Relaunch gate cannot be reached. The 8-12 week timeline extends indefinitely. | Medium. Seasonal agriculture is inherently variable; Pembroke, IL growing conditions are real and the supplier relationship is exclusive today. | Critical. This scenario individually prevents the relaunch gate from being passed. No mitigation exists unless alternate sourcing is pre-committed. |
| **S2. Competitor paid push in south-side Chicago during the pause window** | Instacart, DoorDash Grocery, or a venture-backed Black food e-commerce entrant runs a targeted paid campaign in the south-side Chicago DMA with Black-food or Black-farmer messaging, capitalizing on Uncle Mays' paid absence. | Organic social window narrows. The first-mover advantage in the 'Black-farmed produce, south-side Chicago' paid keyword cluster (currently uncontested at $439/wk) is partially or fully eroded before Uncle Mays relaunches. Brand awareness built during the organic pause is partially captured by a better-funded entrant. | Low to Medium. No competitor is currently running this push at meaningful scale (pre-pause observation), but the window is finite if Black food e-commerce attracts venture capital. | High. If the keyword cluster is occupied at relaunch, CAC on paid restart will be structurally higher, potentially invalidating the business case's CVR and payback assumptions. |
| **S3. EXP-002 reveals daily delivery is operationally unfeasible at current team size** | The painted-door test shows that the team cannot route deliveries every day across the full service area. The customer-facing 'every day' promise must be retracted or narrowed. | Soul-Food Household repeat purchase rate suppressed. The highest-LTV segment is also the most repeat-purchase-dependent. A published SLA that contradicts the current customer promise creates a trust gap that organic reviews and word-of-mouth will amplify in tight south-side community networks. | Medium. The EXP-002 test is running precisely because this risk is real. | High. Retention failure in the highest-LTV segment directly undermines the repeat-purchase economics that make the Wave A business case positive. |
| **S4. Wave A/B assortment expands but CVR does not move** | New SKUs are live with 10+ items per category, Black-owned badges are active, merchandising is updated, but the 8-week post-launch CVR remains below 1.0% due to funnel mechanics (checkout UX, trust signals, delivery clarity) being a co-equal constraint rather than a secondary one. | The primary hypothesis (assortment is the binding constraint) is falsified. The business case for Wave A/B investment ($43K-$72K inventory) does not recoup on the expected timeline. The CRO operator hire and funnel-fix work stream become urgent and concurrent, not sequential. | Medium. The assumption-audit phase flagged this as the most dangerous assumption. Seven prior analysis phases assessed it as the primary constraint, but the behavioral confirmation does not exist yet. | High. Falsification of the primary hypothesis requires a near-complete strategic pivot: shift from catalog sprint to parallel funnel-fix, potentially requiring the CRO operator sooner and at higher cost than planned. |
| **S5. SAFE round closes below $400K minimum or stalls** | The Apollo outreach pipeline is idle (OAuth revoked across all mailboxes as of 2026-05-29). The SAFE round does not close the $400K minimum needed to trigger the SBA 7(a) facility (Busey Bank, conditionally approved). | Wave A/B inventory investment ($43K-$72K) competes directly with operational runway for available cash. The SBA facility does not close, blocking the flagship store build-out and the long-term capital stack. The entire e-commerce-first strategy must generate positive cash flow on its own timeline. | Medium. Apollo is idle, investor outreach is paused, and the SAFE has no confirmed close date. The pipeline status is genuinely uncertain. | High. Capital constraint at this threshold forces triage between catalog investment and operational continuity, potentially deferring the only intervention with positive expected value. |
| **S6. CRO/UX operator shortlist (Barrel, Anatta, Bear Group) requires Shopify migration as engagement condition** | The CRO operator is selected post-relaunch gate, but the operator's engagement model is incompatible with the custom Next.js stack and requires a platform migration as a condition of taking the engagement. | The platform decision, formally deferred, is forced under time pressure with an active operator contract creating a cost anchor. The 3-6 month migration window opens during the period when Uncle Mays is most vulnerable (early post-relaunch, thin behavioral data). | Low to Medium. The shortlisted agencies work across platforms, but Barrel, Anatta, and Bear Group have deep Shopify/headless practices and may scope the engagement around Shopify tooling. | Medium. The scenario creates a forced decision rather than a deliberate one, potentially wasting operator budget on migration rather than conversion optimization. |
| **S7. Black-owned badge activation reveals sourcing integrity gap** | Wave A/B launch with Black-owned badges reveals that fewer SKUs than expected qualify (sourcing documentation is incomplete, suppliers are not certifiably Black-owned under whatever standard Uncle Mays applies). The badge appears on a small subset of SKUs, undermining the positioning claim. | The core brand differentiation (Black-farmed, Black-owned) is visibly uneven in the catalog. Shoppers see the badge on three items and its absence on twenty others. The signal is weaker than the positioning implies. Media coverage or social commentary on the gap could reframe the brand as aspirational rather than authentic. | Medium. The vendor sourcing pipeline (Airtable, 1,025 rows) has not been screened for badge eligibility. Run A Way Buckers Club is the only confirmed Black-owned supplier today. | Medium. Reputational risk is real but recoverable if the sourcing roadmap is transparent and the brand communicates it proactively. |

---

## Vulnerabilities

| Weak Point | Why It Matters | Mitigation |
|---|---|---|
| **Single-supplier sourcing concentration** | Run A Way Buckers Club is the only current farm supplier. Wave A soul-food SKUs (collards, okra, smoked cuts) are not currently on their SKU list in meaningful volume. If that relationship fails or cannot scale, the entire sprint fails with no fallback. | Anthony and Zoe must secure at minimum two alternate Black-owned or Black-farmed supplier relationships under LOI before Wave A launches. The 1,025-row vendor sourcing pipeline (Airtable, app3raEVB9kHeUoHE) is the starting screen: filter for soul-food category SKUs and initiate outreach immediately. |
| **Relaunch gate has no retention component** | The three gate metrics (/shop reach 40%, ATC 12%, three top-10 staple SKUs in stock) measure acquisition-side readiness. They do not test whether the Soul-Food Household, the highest-LTV segment, actually repeats. Passing the gate on novelty traffic could trigger paid relaunch into a retention-broken funnel. | Add a fourth gate metric: at least 20% of first-order customers from the organic post-assortment period must place a second order within 21 days before paid spend resumes. Measure via Stripe customer IDs, not Mailchimp (audience is effectively empty). |
| **Organic engagement threshold is undefined** | The CEO-approved plan requires "organic-engagement evidence" before paid restart but does not define what that evidence is. Without a specific observable threshold, the gate is subject to subjective interpretation and can be called early under revenue or investor pressure. | Define the organic engagement gate now, in writing, as: minimum 500 unique sessions to /shop in a single week, minimum 12% ATC rate in that same week, and at least one completed full-basket order (70 USD+ AOV) from a net-new customer without a promo code. All three in the same week. |
| **No repeat-purchase infrastructure** | Mailchimp audience is effectively empty. LogRocket is paused. There is no post-purchase email sequence capable of driving a second order from Wave A/B customers. The Soul-Food Household's LTV depends entirely on unassisted repeat behavior or word-of-mouth during the organic window. | Before Wave A launches: re-import Stripe customers into Mailchimp, reactivate the post-purchase email sequence (a single "how was your order?" email at Day 3 plus a "ready to reorder?" prompt at Day 14), and restore LogRocket so Galileo can surface ATC and repeat-session patterns. The LogRocket revival is one step: re-add two env vars and uncomment three cron lines. |
| **Daily delivery promise outpaces operational reality** | The customer-facing commitment is "every day, 7 days/week, customer-picked window." EXP-002 is still a painted-door test. If the test resolves to 3-4 delivery days per week, the published SLA must be retracted before paid relaunch, creating a trust and messaging gap at exactly the moment paid traffic is returning. | Zoe must publish the EXP-002 results and a firm SLA by Week 4 of the sprint, regardless of catalog progress. If daily routing is not achievable, the honest SLA is "Tuesday, Thursday, Saturday delivery" or similar, updated everywhere (homepage, /shop, checkout, customer-facts.md, and all campaign copy). |
| **Apollo outreach pipeline is idle during SAFE raise** | All five connected Apollo mailboxes have revoked OAuth tokens as of 2026-05-29. Investor outreach has been effectively paused for weeks. The SAFE round cannot close without active outreach, and the capital is needed to fund Wave A/B inventory. | The OAuth fix is one administrative action (Google Workspace Admin, mark Apollo as Trusted). Anthony must execute this within the first week of the sprint. Stagger mailbox re-authentication (one every 24h, not bulk) to avoid triggering Google anti-abuse. Until at least anthony@ and invest@ are re-authenticated and sending, the SAFE pipeline is dark. |
| **No behavioral data to brief a CRO operator against** | LogRocket is paused and Mailchimp is empty. If the relaunch gate is passed and a CRO operator is hired, the operator will have only Stripe order history and GA4 session aggregates to work from. Galileo session-level frustration data, the highest-signal input for funnel diagnosis, will be missing for the entire sprint window. | Restore LogRocket now, not at relaunch. The subscription is paused, not deleted. One-step revival: re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel and Trigger.dev, uncomment three cron lines, deploy. Every week of the sprint without Galileo data is a week the CRO operator briefing package gets thinner. |

---

## Response Playbook

| Signal | Response | Owner |
|---|---|---|
| Run A Way Buckers Club cannot confirm Wave A SKU availability at volume within two weeks of sprint start | Immediately activate the Airtable vendor pipeline (app3raEVB9kHeUoHE): filter for collards, okra, smoked meats, dried legumes suppliers. Initiate outreach to top 5 Black-owned candidates. Accept non-Black-owned backup sourcing for commodity Wave B SKUs (bananas, onions, tomatoes) to protect launch timing. Wave A launch is deferred by two weeks maximum; if no alternate is confirmed in that window, launch Wave B only and reopen Wave A timeline. | Zoe (COO) owns vendor selection. Anthony (CEO) owns Black-owned badge approval for any new supplier. |
| New south-side Chicago paid campaign observed from Instacart, DoorDash Grocery, or a venture-backed Black food entrant (visible in Meta Ad Library or Google Ads Transparency Center) | Compress the Wave A/B sprint timeline to six weeks, accepting a smaller initial SKU count (50-60 vs 80-100). Reactivate one paid campaign immediately (Meta, south-side Chicago, soul-food creative, $150/wk budget) as a brand-presence play, not a conversion play. Accept that this triggers the relaunch before the full gate is passed, but defends the keyword cluster. | Anthony (CEO) owns paid restart decision. Existing budget authority under the CRO at-will policy covers the $150/wk; no board approval required at that level if it is within the existing Meta campaign structure. |
| EXP-002 test resolves to fewer than 7 delivery days per week | Zoe publishes a revised, honest SLA (e.g., "Tuesday, Thursday, Saturday delivery") across all customer touchpoints within 48 hours of resolution. Update customer-facts.md, homepage, /shop page, checkout delivery selector, and all email templates before any paid campaign is drafted. Do not launch paid ads referencing daily delivery if the SLA is less than daily. | Zoe (COO) owns SLA publication. Anthony (CEO) approves the customer-facing copy update before it goes live. |
| Post-Wave A/B CVR is below 1.0% at Week 8 (post-launch, organic traffic only) | Run a two-week diagnostic sprint: restore LogRocket immediately if not already live, pull Galileo session-level data for /shop abandonment patterns, run a five-question post-add-to-cart exit survey (Hotjar or similar, no new tool required if LogRocket is active). Identify whether the primary drop is at ATC (assortment still insufficient) or at checkout (funnel mechanics are the co-equal constraint). If checkout mechanics are diagnosed as primary, accelerate the CRO operator hire by four weeks. | Anthony (CEO) owns the go/no-go on accelerating the operator hire. CTO owns the Galileo diagnostic pull and session analysis. |
| SAFE round stalls below $400K by Week 6 | Triage in this order: (1) re-authenticate Apollo mailboxes and restart outreach immediately to the existing 87-contact Tier 1 campaign; (2) identify which Wave A/B SKUs can be sourced on 30-day net payment terms (postponing cash outlay by one cycle); (3) reduce Wave A/B initial inventory investment to the minimum viable catalog (40-50 SKUs, $25K-$35K cash outlay) that still clears the relaunch gate. Do not defer the EXP-002 SLA resolution; that is zero-cost. | Anthony (CEO) owns investor outreach restart and capital triage. Zoe (COO) owns vendor payment-term negotiation. |
| CRO/UX operator shortlist requires Shopify migration as a condition of engagement | Disqualify that operator from the shortlist. Issue a revised brief to Barrel, Anatta, and Bear Group explicitly stating the engagement must optimize on the current Next.js/Stripe embedded stack. Accept that this narrows the operator field. If all three require migration, commission a two-week stack assessment from one of them (fixed fee, not a retainer) to determine whether a hard stack constraint exists, before committing to migration. | Anthony (CEO) owns operator selection. CTO owns the stack assessment scope and vendor communication. |
| Black-owned badge activation reveals fewer than 60% of Wave A/B SKUs qualify | Do not delay the launch waiting for badge documentation. Launch with badges on all confirmed-eligible SKUs and an explicit "sourcing story" page that explains the journey: where each SKU comes from, which suppliers are Black-owned, and what the roadmap to expand Black-owned coverage looks like. Proactive transparency is a stronger brand signal than a fully-badged catalog that appears overnight. | Anthony (CEO) owns the sourcing story narrative. Zoe (COO) owns supplier documentation collection. Ship the sourcing story page before Wave A/B launch, not after. |
| Repeat purchase rate at Day 21 is below 20% for first post-assortment cohort | Before paid relaunch, run a three-question survey to all first-order customers via Resend transactional email: what was missing from the catalog, would you order again, what would need to change. Synthesize results in one week. If catalog gaps are cited most frequently, add the top-cited SKUs to Wave C before paid restart. If delivery or UX issues dominate, accelerate the CRO operator hire. Do not reactivate paid spend until the 20% repeat gate is met. | Anthony (CEO) owns the survey launch decision. CTO owns the Resend send. The 21-day window starts at Wave A/B launch, so the survey cohort is available roughly at Week 9 of the sprint. |

_Data gaps: Actual sourcing capacity of Run A Way Buckers Club for Wave A SKUs (collards, okra, smoked cuts) at catalog volume: no production volume data exists in the fact base. This is the single most important data gap given single-supplier concentration.; EXP-002 painted-door test results: no resolution date or preliminary data is documented. The daily delivery SLA is the second most critical operational unknown.; Confirmed Black-owned badge eligibility for Wave A/B SKUs: the vendor pipeline (1,025 rows, Airtable app3raEVB9kHeUoHE) has not been screened for badge eligibility. The number of certifiably Black-owned suppliers in the Wave A/B assortment is unknown.; Post-Wave A/B CVR and ATC behavioral data: this cannot exist until the sprint is complete. All relaunch gate metrics are forward-looking. The business case's 1.5% CVR assumption is unverified at behavioral scale.; Live Whole Foods and Aldi shelf prices for Wave A soul-food SKUs (collards, okra, black-eyed peas, cornmeal): the 'cleaner than Whole Foods, cheaper than Aldi' claim has not been validated against actual shelf prices for these specific items.; SAFE round close probability and timeline: Apollo outreach is idle, no active investor meetings are documented in the fact base, and the minimum $400K gate for SBA facility trigger has no confirmed close timeline.; CRO/UX operator platform requirements from Barrel, Anatta, and Bear Group: no discovery calls or RFP responses are documented. Whether any of the three shortlisted operators require a Shopify migration as a condition of engagement is unknown.; Repeat purchase rate for existing Stripe customers (excluding the grandfathered Doina subscription): no cohort retention data is available in the fact base. The Soul-Food Household LTV assumption depends entirely on repeat purchase behavior that has not been measured._

### kpi-architect

**Uncle Mays needs exactly nine KPIs organized into three tiers (offer readiness, funnel health, unit economics), each linked to a specific binary decision, because the current 0.46% CVR makes every metric except assortment velocity and ATC rate meaningless until Wave A and Wave B are live.**

# KPI Architecture

## Strategic Objective

Move Uncle Mays from a 0.46% paid conversion rate to a healthy food-DTC range (2-4%) by fixing the offer first and the funnel second. The KPI system must govern two decisions simultaneously: (1) when the assortment is ready to reopen paid acquisition, and (2) whether the unit economics of the expanded catalog are structurally sound enough to justify the CRO operator hire and platform decision. Every metric in this system must connect directly to one of those two decisions. Metrics that do not serve either decision are removed.

The system runs in two speeds. Before the relaunch gate is passed, the only metrics that matter are Offer Readiness metrics (the sprint team's dashboard). After the gate is passed, Funnel Health and Unit Economics metrics activate. No one should be reporting CVR, CAC, or AOV in weekly reviews until the gate clears, because those numbers are generated by a broken offer and will produce false signals.

---

## KPI System

| KPI | Type | Decision It Supports | Owner | Threshold / Gate |
|---|---|---|---|---|
| **Assortment Velocity** (new SKUs sourced and live per week, toward 80-100 target) | Leading / Offer Readiness | Is Wave A + Wave B on track? Does the sprint need to accelerate sourcing or reduce scope? | Anthony (CEO) owns sourcing standards and badge approval; Zoe (COO) owns vendor selection and inventory receipt | 6+ net-new SKUs live per week during sprint; alarm if below 4 for two consecutive weeks |
| **Black-owned Badge Coverage** (% of eligible SKUs displaying a verified Black-owned badge) | Leading / Offer Readiness | Has the zero-cost sourcing-integrity moat been deployed at launch? Is every eligible Wave A/B SKU badged before paid traffic resumes? | Anthony (CEO) | 100% at Wave A/B launch. Block launch if below 100%. |
| **EXP-002 SLA Resolution Rate** (% of customer-promised delivery days where actual driver routing matches the published SLA) | Leading / Operational | Can the daily delivery promise be made to a paying Soul-Food Household customer? Is paid relaunch operationally safe? | Zoe (COO) | Published SLA grounded in actual routing must be posted by Week 4. Resolution rate must be 85%+ for two consecutive weeks before paid relaunch. |
| **/shop Reach Rate** (% of all sessions that reach the /shop page) | Lagging / Funnel Health | Is the homepage converting browsers to shoppers? Does homepage navigation need a fix before or alongside paid relaunch? | CRO / operator once hired; Anthony (CEO) until then | Relaunch gate threshold: 40% or above. Current baseline: ~25%. |
| **Add-to-Cart Rate** (% of /shop sessions that add at least one SKU to cart) | Lagging / Funnel Health | Is the expanded catalog building basket intent? Is assortment breadth actually solving the browse-and-leave failure mode? | CRO / operator once hired; Anthony (CEO) until then | Relaunch gate threshold: 12% or above. Current baseline: ~5.5%. |
| **Relaunch Gate Composite** (all three conditions true in the same calendar week: /shop reach above 40%, ATC above 12%, three or more of the top-10 Black-household staple SKUs live and in-stock) | Binary Trigger | Is it time to reactivate paid media, run the $15 cart minimum test, and open the CRO operator hiring window? | Anthony (CEO) calls the gate; Zoe (COO) confirms fulfillment readiness | All three conditions must be true simultaneously. Any single miss resets the clock. |
| **Average Order Value by Segment** (Soul-Food Household vs Health-Forward Professional, tracked separately once LogRocket is re-subscribed and segment tagging is live) | Lagging / Unit Economics | Is Wave A driving higher AOV for the Soul-Food Household? Is Wave B + $15 cart minimum test lifting Health-Forward Professional basket size? | Anthony (CEO) monitors; CRO operator owns post-hire | Soul-Food Household target AOV: $60+ (assumption, labeled). Health-Forward Professional target AOV: $35-$50 (assumption, labeled). Flag if either segment AOV is below $30 for two consecutive weeks post-relaunch. |
| **Cart Completion Rate** (% of sessions that add to cart and reach a completed Stripe payment, net of $20 or $15 minimum blocks) | Lagging / Funnel Health + Unit Economics | Is checkout friction the next binding constraint after assortment expands? Does the CRO operator have a real problem to fix? | CRO / operator once hired | Target: 50%+ of add-to-cart sessions completing payment (assumption, labeled as food-DTC benchmark). Flag below 35% for two consecutive weeks as checkout-friction signal warranting operator engagement. |
| **30-day Repeat Purchase Rate** (% of first-time paying customers who place a second order within 30 days) | Lagging / Unit Economics | Is the expanded catalog building retention, not just acquisition? Is the Soul-Food Household returning at a rate that supports positive LTV economics? | Anthony (CEO) monitors; CRO / operator owns post-hire | Target: 25%+ at 30 days (assumption, labeled as food-DTC benchmark). Below 15% for two consecutive cohort weeks is a retention-system alarm requiring fulfillment SLA and catalog diagnosis. |

---

## Driver Tree

The value driver tree runs left to right from the binding constraint to the outcome.

**Paid Conversion Rate (target: 2-4%)** is the outcome metric. It is driven by two parallel sub-trees.

**Sub-tree 1: Offer Adequacy (pre-gate, sprint phase)**

Assortment Velocity (SKUs live per week) drives Catalog Depth (total live SKUs, target 80-100). Catalog Depth enables Basket Completion (shopper can build a $35-60 cart without leaving the /shop page). Basket Completion drives Add-to-Cart Rate. ATC Rate times /shop Reach Rate times Cart Completion Rate equals paid CVR.

Black-owned Badge Coverage is a multiplier on Basket Completion: a fully badged catalog increases perceived trust and willingness to pay at current price points, reducing price-sensitivity abandonment in the /shop session.

EXP-002 SLA Resolution Rate drives Delivery Credibility. Delivery Credibility is a prerequisite for repeat purchase. Repeat purchase is the primary LTV driver for the Soul-Food Household segment, which has the highest projected AOV and the highest sourcing-integrity sensitivity.

**Sub-tree 2: Funnel Mechanics (post-gate, operator phase)**

/shop Reach Rate (driven by homepage navigation quality, paid creative relevance, and organic traffic intent) gates how many sessions ever see the offer. This is the upper funnel. It must clear 40% before paid spend makes sense, because below that threshold most paid dollars never reach the catalog.

Add-to-Cart Rate (driven by catalog depth, merchandising quality, SKU photography, and Black-owned badge salience) is the mid-funnel conversion. It must clear 12% to confirm the offer is working before the Cart Completion / checkout-friction diagnosis begins.

Cart Completion Rate (driven by checkout UX, delivery clarity, trust signals, and the $20 vs $15 cart minimum) is the lower funnel. It is the CRO operator's primary lever and should not be optimized until the upper and mid-funnel are confirmed.

**AOV Lever:**

Average Order Value is driven by protein anchor SKUs (highest per-unit AOV contribution) plus pantry staples basket-building (Wave B). The $7.99 delivery fee creates a structural incentive for orders above $60. A tiered delivery fee (free above $60, $4.99 from $35-$59, $7.99 below $35) is a testable AOV lever that should be queued for the same week Wave B is live.

**The cascade:**

Assortment Velocity (sprint weeks 1-12) produces Catalog Depth (80-100 SKUs) produces Basket Completion (Soul-Food + Health-Forward) produces ATC Rate (target 12%) combined with /shop Reach (target 40%) produces Relaunch Gate clearance produces Paid CVR (target 2-4%) produces AOV (target $50+) produces positive CAC economics produces 30-day Repeat Rate (target 25%+) produces LTV sufficient to justify CRO operator investment.

No step in this cascade can be shortcut. Every prior analysis phase confirmed that the binding constraint at each step is the one immediately upstream.

---

## Metrics To Remove

| Metric | Why Remove |
|---|---|
| **Paid CVR (current: 0.46%)** as a weekly performance indicator | Generated by a 43-SKU broken offer, not by funnel mechanics. Reporting it weekly creates false urgency to fix checkout before the offer is fixed. Retire as a sprint-phase weekly metric. Reactivate post-gate as part of the Relaunch Gate Composite. |
| **Customer Acquisition Cost (CAC)** | Undefined without accurate gross margin by SKU (no post-cost margin data exists for the live catalog), and meaningless when paid media is paused. Return as a tracked metric 4 weeks after paid relaunch, once at least 30 paid-acquisition orders have been processed at the new catalog state. |
| **Mailchimp open rate and click rate** | The Mailchimp audience is effectively empty (3 members as of 2026-06-07). The lifetime 63.9% open rate is inflated by hundreds of 1-subscriber transactional sends before the Resend migration. These numbers are not representative of any real audience. Remove from weekly reporting until the audience is rebuilt from Stripe customers post-Wave A/B launch. |
| **Survey intent-to-shop (97%)** | This is a stated-preference survey from 100+ consumers, not a behavioral metric. It does not predict cart-building behavior at $30-$60 AOV. It is appropriate for investor materials but must not appear in operating dashboards as a performance indicator. |
| **Lifetime campaign stats (26 campaigns, 63.9% open rate)** | Same issue as Mailchimp open rate above. These are historical artifacts from a pre-migration send pattern. They have no predictive validity for the newsletter audience that will be rebuilt post-Wave A/B. |
| **SAFE raise progress (amount raised vs. $400K-$750K target)** | Capital raise metrics belong in an investor-relations dashboard, not in the funnel and product-mix operating review. Mixing them creates a false equivalence between capital-raise pace and operational conversion progress. |
| **Projected Year-1 revenue ($6.3M)** as an operating target | This is a projection built on assumptions that have not been validated against behavioral data. Using it as a KPI creates pressure to hit a number that was modeled before the assortment gap was diagnosed. It is appropriate for investor materials and board context only. |
| **Gross margin (35% target) and EBITDA (15.3% target)** as weekly operating KPIs | Both are projections for the stabilized physical flagship store, not the current e-commerce operation. The e-commerce gross margin by SKU has not been calculated. These numbers must not be used in e-commerce operating reviews until SKU-level cost data is available. |

---

## Review Cadence

### Sprint Phase (Weeks 1-12, before relaunch gate): Offer Readiness Dashboard

**Weekly: Sourcing Sprint Standup (30 minutes, Monday)**
- Participants: Anthony (CEO), Zoe (COO)
- Metrics reviewed: Assortment Velocity (SKUs live this week vs. 6-SKU weekly target), cumulative catalog depth vs. 80-100 target, Black-owned Badge Coverage (% eligible SKUs badged), EXP-002 SLA Resolution Rate
- Decision: If Assortment Velocity is below 4 SKUs for two consecutive weeks, the sprint team must triage: is the block sourcing (vendor not found), procurement (inventory not ordered), or engineering (SKU not live in Airtable catalog)?
- No paid media, CVR, or operator metrics reviewed in this meeting. Those are not the binding constraint.

**Weekly: EXP-002 SLA Publish (every Friday, Zoe)**
- Zoe publishes one customer-facing sentence summarizing the delivery SLA for the following week, grounded in actual driver routing capacity
- This is a standing commitment, not a meeting. The publish deadline is Week 4, before which no paid relaunch commitment is made regardless of catalog progress.
- If SLA Resolution Rate falls below 85% in any week, Zoe escalates to Anthony that week. No paid relaunch proceeds until it is back above 85% for two consecutive weeks.

**Bi-weekly: Relaunch Gate Review (45 minutes, every other Monday starting Week 8)**
- Participants: Anthony (CEO), Zoe (COO)
- Metrics reviewed: /shop Reach Rate vs. 40% threshold, ATC Rate vs. 12% threshold, count of top-10 Black-household staple SKUs live and in-stock, EXP-002 SLA Resolution Rate vs. 85% threshold
- Decision: Gate is open or gate is closed. If open, the meeting immediately triggers: paid media reactivation plan (Meta + Google), $15 cart minimum test queue, CRO operator hiring window open, Wave E personal care sourcing discussion.
- If gate is not cleared, the meeting produces one specific triage item per failed condition. It does not revisit the gate criteria.

### Post-Gate Phase (Weeks 13 onward): Funnel Health and Unit Economics Dashboard

**Weekly: Funnel Health Review (30 minutes, Monday)**
- Participants: Anthony (CEO), Zoe (COO), CRO operator (once hired)
- Metrics reviewed: /shop Reach Rate, ATC Rate, Cart Completion Rate, paid CVR (Meta and Google separately)
- Escalation trigger: If paid CVR drops below 1.0% for two consecutive weeks after relaunch, pause paid and diagnose before next week's review.

**Bi-weekly: Unit Economics Review (45 minutes, every other Wednesday)**
- Participants: Anthony (CEO), Zoe (COO), CFO (Jua)
- Metrics reviewed: AOV by segment (Soul-Food Household vs. Health-Forward Professional), 30-day Repeat Purchase Rate by segment, gross margin by category (Wave A vs. Wave B vs. Wave E, once wave data is available), delivery fee contribution vs. total order economics
- Decisions: Is AOV structurally improving? Is the $15 cart minimum test producing higher completion rates than $20? Should the tiered delivery fee (free above $60) be tested?
- Escalation trigger: If 30-day Repeat Purchase Rate falls below 15% for two consecutive bi-weekly periods, escalate to a full funnel + fulfillment diagnosis before committing the next sourcing wave.

**Monthly: Strategic KPI Review (60 minutes)**
- Participants: Anthony (CEO), Zoe (COO), full leadership team
- Metrics reviewed: all nine KPIs, trend vs. prior month, relaunch gate status or post-gate performance vs. food-DTC benchmark (2-4% CVR, 25%+ 30-day repeat)
- Decisions: Is the catalog expansion producing the hypothesized funnel improvement? Is Wave E personal care ready to source? Is the CRO operator hire delivering results against the post-assortment baseline? Is the platform decision back on the agenda?
- This is the one meeting where investor-context metrics (capital raise status, flagship store timeline) may be briefly noted, but they must not drive operating decisions.

### Governance Guardrails

Three actions are permanently blocked until the Relaunch Gate Composite is confirmed in writing by Anthony (CEO):
1. Reactivating paid media on Meta or Google (any budget, any campaign)
2. Opening the CRO operator hiring process (any vendor, any RFP)
3. Running the $15 cart minimum experiment

One action is permanently blocked until EXP-002 SLA Resolution Rate is above 85% for two consecutive weeks, independently of catalog progress:
- Any customer-facing communication that promises daily delivery without qualifying the booking-horizon or routing-capacity constraint

One action must occur at Wave A/B launch regardless of any other gate status:
- Black-owned Badge Coverage must reach 100% on all eligible SKUs. If engineering has a blocker, Anthony (CEO) resolves it before launch, not after.


_Data gaps: SKU-level gross margin data: no cost-per-SKU or landed-cost data exists for the live catalog. Without it, AOV targets and unit economics thresholds are assumption-labeled. This requires Zoe (COO) to extract vendor invoice costs from Run A Way Buckers Club and any Wave A/B suppliers before the Unit Economics Review activates.; Segment-level behavioral data (AOV by segment, ATC rate by SKU, repeat purchase rate by segment) does not exist because LogRocket is paused and Mailchimp audience is effectively empty. LogRocket must be re-subscribed before post-gate unit economics reviews can produce reliable segment splits.; Actual /shop Reach Rate and ATC Rate baselines: the 25% and 5.5% figures are pre-pause estimates. A clean post-Wave A/B baseline measurement requires at least two weeks of organic traffic to the expanded catalog before the gate review is meaningful.; Delivery fee elasticity: the hypothesis that a tiered delivery fee (free above $60) will increase AOV without suppressing order volume is untested. Requires A/B test data from post-relaunch, minimum 200 sessions per variant.; Cart minimum elasticity: the $15 vs $20 minimum experiment needs at least two weeks of data post-Wave B launch to detect a statistically meaningful difference in cart completion rate at the typical sample sizes Uncle Mays organic traffic currently generates.; Whole Foods and Aldi live shelf prices for Wave A soul-food SKUs (collards, okra, smoked turkey necks, cornmeal, black-eyed peas): the pricing claim 'cleaner than Whole Foods, cheaper than Aldi' has not been validated against actual current shelf prices. Required before Wave A launches to confirm the pricing assumption holds.; EXP-002 painted-door results: the actual driver routing capacity data that will determine the published SLA has not been confirmed. Zoe (COO) must produce this before Week 4 or the relaunch gate cannot be assessed for the fulfillment condition._

### value-realization

**Uncle Mays will capture $5K-$8K in incremental weekly revenue and recoup its $43K-$72K catalog investment in 8-14 weeks only if each benefit category has a named owner, a hard baseline, and a governance cadence that forces an escalation decision before any deferred lever (paid media, CRO operator, platform) is reactivated prematurely.**

# Value Realization Plan
## Uncle Mays Produce : Funnel and Product Mix Fix
### As of 2026-06-07

---

## Value Ambition

The transformation delivers two sequential waves of captured value over 26 weeks.

**Wave 1 (Weeks 1-12): Catalog-first, no paid spend.** The binding constraint (43-SKU produce-only assortment) is removed by launching Wave A soul-food basket and Wave B commodity staples in parallel, reaching 80-100 live SKUs. The relaunch gate (/shop reach above 40%, ATC above 12%, three top-10 Black-household staple SKUs live and in-stock in the same week) is confirmed. Delivery SLA is resolved and published.

**Wave 2 (Weeks 13-26): Funnel activation.** With the offer fixed, paid media restarts on a proven catalog. The $15 cart minimum test runs. The Black-owned badge activates on all eligible SKUs. A tiered delivery fee structure is tested. Post-assortment behavioral data accumulates to brief the CRO operator. The Soul-Food Household and Health-Forward Professional segments each have a targeted paid creative and channel.

**Target value:** Move paid CVR from 0.46% toward 1.5% (conservative, labeled assumption) at $50 AOV (assumption based on 30-60 USD typical first cart), generating approximately $5K-$8K in incremental weekly revenue at a modest 150 paid sessions per week. Recoup $43K-$72K inventory investment in 8-14 weeks post-relaunch. Reach positive paid-channel unit economics (CAC below first-order gross margin, assumption: 35% gross margin target) before any budget escalation.

All revenue projections are clearly labeled as assumptions derived from prior engagement phases. No behavioral data at post-assortment scale exists yet.

---

## Value Ledger

### One-Time Benefits

| Benefit | Baseline | Target | Owner | Proof Standard |
|---|---|---|---|---|
| Catalog expansion to 80-100 SKUs (Wave A + Wave B in parallel) | 43 active SKUs, 0 soul-food or commodity staple SKUs | 80-100 live SKUs, Wave A covering collards, okra, smoked cuts, rice, cornmeal, black-eyed peas; Wave B covering bananas, onions, tomatoes, core pantry | Anthony (CEO, sourcing standards + Black-owned badge approval) and Zoe (COO, vendor selection + inventory levels) | Joint sign-off on 10-SKU-minimum readiness checklist for each Wave before launch; confirmed in Airtable catalog table (appm6F6H9obydzAM2) |
| Black-owned badge activation on all eligible SKUs | Badge wired in code, inert, 0 SKUs rendering it | 100% of eligible Wave A and Wave B SKUs showing badge at launch | Anthony (CEO) | Live site audit on launch day: every eligible SKU page renders badge before paid spend resumes |
| $15 cart minimum test (Wave B week, one-time experiment) | $20 hard minimum, suppressing Health-Forward Professional baskets at $12-18 produce-only AOV | A/B test: measure ATC rate and checkout completion rate at $15 vs $20 for one full week after first Wave B staples go live | Zoe (COO) as experiment owner | Statistically separable ATC lift or no lift at 80% confidence over 7-day window; CEO decision gate on outcome |
| EXP-002 delivery SLA published and customer-facing | Daily delivery promise runs ahead of actual driver routing capacity; SLA undefined | Firm, published customer-facing SLA grounded in actual driver routing capacity, live on the site before paid relaunch | Zoe (COO) | SLA text live on /faq and checkout delivery selection UI, signed off by Anthony before paid spend resumes |
| LogRocket subscription reinstated and behavioral baseline captured | LogRocket paused ~2 weeks as of 2026-05-28; no segment-level ATC, session-to-shop, or SKU-level behavioral data | LogRocket active, minimum 2 weeks of post-assortment session data captured (segment-level ATC, AOV by SKU category, /shop reach) before CRO operator is briefed | CIO (owns env var re-activation and Trigger.dev cron un-comment) | Galileo daily briefing flowing; CTO confirms data in BigQuery logrocket_galileo tables |

### Recurring Benefits

| Benefit | Baseline | Target | Owner | Proof Standard |
|---|---|---|---|---|
| Paid CVR improvement (post-relaunch) | 0.46% paid CVR (measured 2026-05-11, pre-pause) | 1.5% CVR conservative target (assumption: labeled); 2% stretch (food-DTC low end benchmark) | CRO operator (once hired, post-relaunch gate); Anthony (CEO) holds the gate | Weekly measurement in GA4; three consecutive weeks above 1.5% before budget escalation |
| /shop reach improvement | 25% of sessions reach /shop | Above 40% (relaunch gate threshold) | Zoe (COO) owns weekly measurement | GA4 session-to-/shop rate, weekly cadence, reported every Monday |
| Add-to-cart rate improvement | 5.5% ATC from /shop | Above 12% (relaunch gate threshold) | Zoe (COO) owns weekly measurement | GA4 ATC events, weekly cadence, same Monday report |
| AOV improvement (basket completion) | Estimated $30-60 first-cart AOV (fact base); structural ceiling at $60 without snacks, proteins, pantry | $60+ average basket post-Wave A/B (assumption: Soul-Food Household basket averages $60-90 with soul-food items + produce) | Anthony (CEO, assortment mix decisions) | Stripe weekly AOV report; 4-week rolling average above $60 triggers next protein expansion discussion |
| Repeat purchase rate improvement (Soul-Food Household segment) | Unknown; no behavioral baseline; one grandfathered subscriber | 25% 30-day repeat rate for Soul-Food Household (assumption: labeled; benchmark from urban food-DTC repeat norms) | Zoe (COO) owns fulfillment SLA as the primary repeat-purchase driver | dbt mart_customers repeat-purchase flag; measured at Week 8 and Week 16 post-relaunch |
| Delivery fee economics improvement | $7.99 flat fee is 13-40% of order value at $20-60 AOV range; conversion-killer below $40 AOV | Tiered fee test: free above $60, $4.99 from $35-59, $7.99 below $35; measure checkout completion rate by tier vs flat $7.99 baseline | Zoe (COO, experiment design and Stripe configuration) | One-week A/B; checkout completion rate by fee tier reported to Anthony; CEO decision gate |
| Wave E personal care margin capture (post-Wave A/B) | 0 personal care SKUs; $0 personal care revenue | Wave E live (Black-owned soaps, batana oil, hair and skin care); assumed 55-70% DTC gross margin; $15K-$25K initial inventory | Anthony (CEO, sourcing and Black-owned badge approval) | Wave E activates only after one full week of post-relaunch behavioral data shows ATC above 12%; inventory investment approved separately |
| Paid channel unit economics positive (CAC below first-order gross margin) | CAC almost certainly exceeds first-order gross margin at 0.46% CVR (assumption from prior phase); exact CAC unknown | CAC below estimated first-order gross margin (assumption: 35% gross margin on $50 AOV = $17.50 contribution; CAC must clear $17.50) | Anthony (CEO) as budget authority; CRO operator (once engaged) as optimization owner | GA4 + Stripe attribution; weekly CAC calculation by channel; if CAC exceeds contribution margin for two consecutive weeks, paid budget pauses automatically |

---

## Governance

| Cadence | Participants | Decisions |
|---|---|---|
| Weekly (every Monday, 30 min) | Anthony (CEO), Zoe (COO) | Review /shop reach, ATC rate, AOV, sourcing pipeline velocity (SKUs sourced toward Wave A/B targets), EXP-002 SLA status. Escalation trigger: any metric flat or declining for two consecutive weeks requires a root-cause call by Wednesday. |
| Wave launch gate review (one-time, at Week 10-12) | Anthony (CEO), Zoe (COO), CIO | Confirm all three relaunch gate thresholds are met in the same calendar week (/shop reach above 40%, ATC above 12%, three top-10 Black-household staple SKUs live and in-stock). If any threshold is unmet, identify the single blocking constraint and set a 2-week remediation plan. No paid dollar committed until all three clear in the same week. |
| CRO operator hire decision (triggered by relaunch gate) | Anthony (CEO) | Hire window opens only after relaunch gate is confirmed AND one full week of post-assortment behavioral data is in LogRocket+Galileo. Shortlist (Barrel, Anatta, Bear Group) is briefed against actual post-assortment CVR, ATC, and AOV data. If gate is not passed by Week 16, re-evaluate whether catalog or funnel is the remaining binding constraint before committing $50-120K. |
| Platform migration decision (deferred, formal review at Week 20) | Anthony (CEO), CIO, CRO operator (if engaged) | Platform decision is not on the agenda until post-operator engagement surfaces a hard stack constraint that cannot be resolved on the current Next.js stack. Review at Week 20 only if CRO operator identifies a specific conversion ceiling attributable to platform limitations. |
| Budget escalation review (post-relaunch, monthly) | Anthony (CEO), Zoe (COO) | If weekly CAC exceeds first-order gross margin contribution for two consecutive weeks, paid budget pauses automatically. If CAC is below margin contribution for four consecutive weeks, Anthony approves next budget increment (no board approval required for within-existing-budget allocation; board approval required for any net-new spend commitment per CLAUDE.md standing order). |
| Wave E unlock review (triggered after relaunch gate + 1 week of data) | Anthony (CEO), Zoe (COO) | Approve Wave E personal care inventory ($15K-$25K) as a separate capital decision, not bundled with Wave A/B. Wave E does not draw on Wave A/B sourcing bandwidth. Unlock condition: ATC above 12% confirmed for one full post-relaunch week. |
| Escalation trigger: fulfillment SLA breach | Zoe (COO) escalates to Anthony (CEO) within 24 hours | If any customer-reported delivery failure occurs after SLA is published, Zoe escalates immediately. Paid budget pauses automatically until root cause is identified and resolved. No exceptions: fulfillment trust is the primary repeat-purchase driver for the Soul-Food Household. |

---

## Risks To Capture

**Risk 1: Assortment breadth is not the primary CVR driver.**
If funnel friction (checkout UX, delivery clarity, trust signals) accounts for an equal or greater share of the 0.46% CVR gap, adding 80-100 SKUs will not move conversion and the inventory investment ($43K-$72K) will not recoup on the 8-14 week timeline. Mitigation: LogRocket must be reactivated before Wave A/B launches so that post-assortment session data (rage clicks, drop-off points, checkout errors) is observable from Day 1 of the expanded catalog. If /shop reach and ATC do not improve within 3 weeks of Wave A/B launch, escalate to a targeted funnel audit before committing additional sourcing spend.

**Risk 2: Black-farmed sourcing cannot reach Wave A/B density on the 8-12 week clock.**
Run A Way Buckers Club (the single current farm supplier) has seasonal constraints. Wave A soul-food items (collards, okra, smoked turkey necks) and Wave B commodity staples (bananas, onions, tomatoes) require additional vendors. If Anthony and Zoe cannot sign two to three new vendors by Week 6, the Wave A/B target of 80-100 SKUs slips and the relaunch gate cannot be reached. Mitigation: sourcing pipeline velocity (SKUs per week reaching signed vendor agreement) is tracked in Monday governance. If velocity falls below 6 new SKUs per week through Week 6, escalate to a sourcing sprint session by Week 7.

**Risk 3: EXP-002 painted-door test reveals daily delivery is not operationally viable at current routing capacity.**
If the daily delivery promise cannot be fulfilled reliably, publishing a firm SLA will expose a gap rather than close one, and the Soul-Food Household (highest LTV segment) will churn on first or second order regardless of assortment quality. Mitigation: Zoe resolves EXP-002 and publishes the real SLA by Week 4, even if the real SLA is "Tuesday, Thursday, Saturday" rather than "every day." A honest, reliable SLA is more valuable than a generous, unreliable one. If the real SLA is narrower than "every day," update /faq, checkout delivery UI, and all organic copy before paid relaunch.

**Risk 4: The $20 cart minimum test produces no readable signal.**
If Wave B staples launch with insufficient organic traffic (Mailchimp audience effectively empty, paid ads still paused), the one-week $15 minimum A/B test will have too few sessions to reach 80% confidence. Mitigation: run the minimum test during the first week of paid relaunch, not before, so paid traffic provides enough volume. If organic sessions are too low to read the test, default to $15 as the safer assumption for the health-forward professional segment and revisit after four weeks of post-relaunch data.

**Risk 5: CRO operator is hired before post-assortment behavioral data exists.**
If the hire is accelerated under capital or investor timeline pressure before the relaunch gate is confirmed, the operator will be briefed against 0.46% CVR from a 43-SKU catalog and will optimize the wrong funnel. The $50-120K investment will produce recommendations that are invalidated the moment Wave A/B go live. Mitigation: the hire decision is formally gated behind the relaunch confirmation and one full week of post-assortment LogRocket data. Anthony holds this gate personally.

**Risk 6: Pricing perception ("cleaner than Whole Foods, cheaper than Aldi") is misaligned with actual shelf prices.**
The positioning claim has not been validated against live Whole Foods and Aldi shelf prices. If Wave A soul-food SKUs are priced at a premium to Whole Foods (not just a 5-12% premium), the brand's core value proposition fails at the moment of first purchase for the segment it most needs to convert. Mitigation: Anthony or Zoe conducts a live shelf-price audit at the nearest Whole Foods and Aldi locations before Wave A launch. Price points for collards, okra, cornmeal, and proteins are set with explicit reference to that audit, not to the current positioning assumption.

**Risk 7: Paid channel reactivation before unit economics are confirmed destroys cash.**
The prior paid model ($439/week pre-pause on Meta and Google) had almost certainly negative unit economics at 0.46% CVR and $30-60 AOV. If paid ads restart before CAC is confirmed below first-order gross margin contribution, the brand burns the SAFE proceeds (400-750K raise) on negative-return traffic. Mitigation: the relaunch gate and the two-consecutive-week automatic pause rule together create the guardrail. Anthony holds budget authority and must confirm positive unit economics before any budget increment above the pre-pause $439/week.


_Data gaps: Actual post-assortment CVR at 1.5% and 2.0% is an assumption; no behavioral data exists at post-Wave A/B catalog scale. Real number will be available 3-4 weeks after Wave A/B launch with LogRocket active.; CAC by channel (Meta vs Google) from the pre-pause $439/week spend is not in the fact base. Exact CAC is required to confirm whether reactivated paid spend clears the first-order gross margin threshold. Reconstruct from Stripe charges vs GA4 paid session data before relaunch.; AOV by segment (Soul-Food Household vs Health-Forward Professional) does not exist because LogRocket is paused and Mailchimp audience is empty. This is required to brief the CRO operator. Capture from Stripe order history segmented by ZIP code as a proxy until LogRocket is back.; The $15 cart minimum experiment requires a minimum session volume to reach 80% confidence. Current organic traffic level (paid paused, Mailchimp audience empty) is not quantified in the fact base. Confirm weekly organic session count from GA4 before scheduling the test.; Wave A and Wave B sourcing costs (vendor pricing, minimum order quantities, cold-chain freight for soul-food proteins) are estimated at $43K-$72K combined but the actual vendor quotes are not in the fact base. Anthony and Zoe need signed vendor agreements with unit costs to confirm the inventory investment and margin assumption.; Actual Whole Foods and Aldi shelf prices for collards, okra, cornmeal, black-eyed peas, bananas, onions, and tomatoes in Hyde Park and the south suburbs have not been audited. The 'cleaner than Whole Foods, cheaper than Aldi' positioning is unvalidated. Required before Wave A pricing is set.; EXP-002 daily delivery painted-door test results are not in the fact base. The real routing capacity (how many days per week can be reliably served) determines the customer-facing SLA and directly affects the Soul-Food Household retention model. Zoe must surface this by Week 4.; Repeat purchase rate baseline does not exist (one grandfathered subscriber is not a rate). The 25% 30-day repeat rate target is a labeled assumption benchmarked from urban food-DTC norms. First real measurement is available 30 days after Wave A/B launch._


## 6. Communicate

### narrative-builder

**Uncle Mays must tell a single, answer-first story to every audience it faces: the 43-SKU catalog is the reason paid conversion is 0.46%, Wave A and Wave B expansion is the only fix, and every other decision (paid restart, CRO operator, platform) is locked behind a three-metric relaunch gate that cannot be reached until two new categories are live.**

# Executive Narrative

## Audience and Decision

**Primary audience:** Anthony Ivy (CEO, sourcing and capital owner), Zoe Rowell (COO, fulfillment SLA and vendor owner). Secondary audience: any investor or board member evaluating the SAFE raise.

**Decision required:** Commit 100% of available sourcing and engineering capacity to Wave A and Wave B catalog expansion in parallel. Formally defer paid media, the CRO operator hire, and the platform migration decision until the three-metric relaunch gate is confirmed in a single calendar week. Resolve EXP-002 delivery SLA to a published, customer-facing commitment by Week 4.

---

## Core Message

Uncle Mays has a 0.46% paid conversion rate because a 43-SKU produce-only catalog cannot build the basket a paid shopper needs to complete checkout, and the only fix is launching Wave A and Wave B in parallel to reach 80-100 live SKUs before a single paid dollar is reactivated.

---

## Storyline

| Page or Section | Headline | Purpose |
|---|---|---|
| 1. Situation | Uncle Mays is running paid traffic into a catalog that cannot convert it: 0.46% paid CVR against a 2-4% food-DTC benchmark, with only 5.5% of /shop visitors adding to cart. | Establish the size of the gap. Anchor the audience on a behavioral fact, not a projection. |
| 2. Complication | The root cause is not checkout friction, delivery UX, or media targeting: it is that a shopper arriving for a $50 grocery run cannot fill that basket from 43 SKUs of specialty produce, and the funnel breaks at browse before Stripe Elements ever loads. | Name the real problem. Separate it from the proxies (checkout, ads) that would attract the wrong fixes. |
| 3. Question | What is the one intervention that directly unblocks basket completion, and what does everything else depend on? | Frame the decision cleanly before the answer lands. |
| 4. Answer | Wave A soul-food basket and Wave B commodity staples, running in parallel over 8-12 weeks to reach 80-100 live SKUs, is the only intervention with positive expected value. Every other lever (paid media, CRO operator, platform migration) has zero or negative expected value until two new categories are live. | Lead with the conclusion. Give the audience the recommendation in the first sentence of this page. |
| 5. Wave A: What it is | Wave A adds the SKUs the Soul-Food Household actually buys: collards, okra, smoked cuts, rice, cornmeal, black-eyed peas, and oxtail. These are the items Uncle Mays' highest-LTV segment over-indexes on by 72-191% versus the average US household, and the current catalog stocks none of them. | Make Wave A concrete and segment-specific, not abstract. |
| 6. Wave B: What it is | Wave B adds commodity staples (bananas, onions, tomatoes, pantry) that lower the per-item price floor, reduce the $20 cart minimum as a conversion barrier, and give the Health-Forward Professional enough variety to build a $30+ basket without a protein anchor. | Make Wave B concrete and show how it complements Wave A rather than competing with it. |
| 7. The relaunch gate | Three hard thresholds, measured in the same calendar week, are the only conditions under which a paid dollar is committed: /shop reach above 40%, add-to-cart rate above 12%, and at least three of the top-10 Black-household staple SKUs live and in-stock. No exceptions, no early reactivation under revenue pressure. | Give the board and the operating team a single, unambiguous governance trigger. Remove discretion from the paid restart decision. |
| 8. What is deferred, and why | Paid media ($439/wk pre-pause), the CRO operator hire ($50-120K), and the platform migration decision are all formally off the table until the relaunch gate is passed. Each has a defined unlock condition, not an indefinite pause. | Name the deferrals explicitly. This prevents premature reactivation and signals capital discipline to investors. |
| 9. The parallel blocker | EXP-002 daily delivery SLA must be resolved to a firm, customer-facing commitment by Week 4. The Soul-Food Household is the highest-LTV segment and the most repeat-purchase-dependent, meaning fulfillment trust governs whether Wave A generates any LTV at all. If the SLA is not published before paid relaunch, assortment expansion will not retain the customers it acquires. | Elevate EXP-002 from an ops item to a strategic prerequisite. Assign it equal urgency to catalog work. |
| 10. The zero-cost moat | The Black-owned badge activates on all eligible SKUs at Wave A/B launch. It is already wired in code, costs nothing to deploy, and is the one sourcing-integrity signal Instacart and Whole Foods cannot replicate. Delaying it is pure value destruction. | Make the badge activation feel non-negotiable. It is the cheapest strategic move in the entire roadmap. |
| 11. Decision rights | Anthony owns sourcing standards and Black-owned badge approval. Zoe owns vendor selection, inventory levels, and fulfillment SLA. No Wave launches without both signing off on the 10-SKU minimum readiness checklist. Shared ownership is not ownership. | Make the operating model explicit. Prevent ambiguity about who can block a Wave launch and who cannot. |
| 12. The ask | Start Wave A and Wave B sourcing this week. Publish the EXP-002 SLA by Week 4. Resubscribe LogRocket before Wave A/B launches so behavioral baselines are observable from day one of the expanded catalog. Review the relaunch gate metrics weekly, with Zoe owning /shop reach and Anthony owning sourcing pipeline velocity. | Close with a specific, time-bounded action list. No next-step ambiguity. |

---

## Pyramid Logic

**Recommendation:** Launch Wave A (soul-food basket) and Wave B (commodity staples) in parallel, targeting 80-100 live SKUs in 8-12 weeks, before reactivating any paid spend or making any operator or platform decision.

**Supporting argument 1: The offer is the binding constraint, not the funnel.**
- Evidence: 5.5% add-to-cart rate means shoppers reach /shop and leave without adding anything. Checkout friction and delivery UX cannot explain a behavior that stops at browse.
- Evidence: The CEO's root hypothesis is confirmed by the fact base: "an offering Anthony himself wouldn't buy" is not a UX problem, it is a catalog problem.
- Evidence: The /shop reach problem (25% of sessions) compounds the assortment gap but is secondary: even at 15% ATC, 75% of paid visitors never see the offer, so both problems require parallel work.

**Supporting argument 2: Wave A and Wave B directly attack the two highest-LTV segments that the current catalog cannot serve.**
- Evidence: The Soul-Food Household over-indexes 72-191% on items Uncle Mays does not stock (collards, okra, smoked cuts, black-eyed peas, oxtail). Wave A is the minimum viable offer for this segment.
- Evidence: The Health-Forward Professional is the de-facto current paid audience. It reaches /shop but cannot build a $30-60 basket from specialty produce alone. Wave B staples lower the price floor and remove the $20 cart minimum as the secondary suppressor.
- Assumption (labeled): Base-case ROI on $43K-$72K inventory investment recovers in 8-14 weeks at a conservative 1.5% CVR at $50 AOV on modest paid traffic volume. This is an assumption, not a realized result.

**Supporting argument 3: Every other intervention has zero or negative expected value until the relaunch gate is confirmed.**
- Evidence: Paid media at 0.46% CVR and $30-60 AOV almost certainly produces CAC above first-order gross margin (specific CAC not known; see dataGaps). Reactivating before the gate destroys cash.
- Evidence: A CRO/UX operator briefed against 0.46% CVR from a 43-SKU catalog will optimize the wrong funnel. The hire window opens when the relaunch gate is passed and one week of post-assortment behavioral data exists.
- Evidence: Platform migration (custom Next.js to headless Shopify) is not identified as the binding constraint at any point across twelve prior analysis phases. A 3-6 month migration pause creates a competitive vulnerability window while solving a problem that does not yet exist.

**Supporting argument 4: The Black-owned sourcing moat is the only durable competitive differentiator, and the badge is the zero-cost mechanism for signaling it.**
- Evidence: Instacart, DoorDash Grocery, and Whole Foods cannot replicate Black-owned sourcing credibility at scale. Every SKU added with a verified Black-owned badge widens the gap.
- Evidence: The badge is already wired in code. Zero engineering cost, zero lead time. Delaying it is pure value destruction with no offsetting benefit.

---

## Hostile Questions

| Question | Answer |
|---|---|
| What if assortment is not the primary conversion driver? What if checkout UX or delivery trust is equally responsible? | This is the highest-severity risk in the engagement. The partial hedge is to resubscribe LogRocket before Wave A/B launches and run session recordings on the expanded catalog before paid spend resumes. If ATC does not improve materially after 80-100 SKUs are live, the next diagnostic is checkout friction, and the CRO operator hire becomes the correct response. The sequencing is correct because fixing the offer first costs $43K-$72K in inventory and 8-12 weeks, while hiring a CRO operator before the offer is fixed costs $50-120K for an engagement that cannot produce a behavioral baseline to work from. |
| How do you know Wave A and Wave B can actually be sourced in 8-12 weeks? You have one farm supplier today. | This is the second-highest-severity risk. Anthony and Zoe must have at least two confirmed alternate sourcing relationships under LOI for each Wave A soul-food SKU before launch. The engagement recommends sourcing the vendor pipeline (Airtable base app3raEVB9kHeUoHE, 1,025 rows) as the starting contact list for outreach, but no specific vendor commitments exist yet. If sourcing cannot close two Wave A categories in 8 weeks, the sprint timeline compresses and the relaunch gate moves out proportionally. |
| Why not just restart paid ads now at a lower budget to test demand while the catalog is being built? | Because unit economics are provably negative at 0.46% CVR and $30-60 AOV. A lower budget reduces the cash burn but does not change the math. Every paid visitor arriving at a 43-SKU catalog faces the same basket-completion gap. Restarting paid before the relaunch gate is confirmed accelerates CAC without accelerating LTV. |
| What if the $20 cart minimum is actually the primary conversion barrier, not the assortment? | The $20 minimum is a real suppressor but it fires downstream of the catalog problem. A shopper who cannot find enough items to want cannot be helped by a lower minimum. The minimum becomes the binding suppressor only after Wave B low-unit-price staples (bananas, onions, tomatoes) are live and first-visit basket size is structurally limited by the floor, not by catalog breadth. Test $15 the week Wave B staples launch. |
| The 97% intent-to-shop survey is strong demand signal. Why are we treating it with so much skepticism? | Survey intent and checkout behavior are different things. The 97% figure was collected before shoppers saw the current catalog, pricing, and delivery lead times. The first 30-60 paying customers in the expanded catalog are the real demand test. Treating the survey as behavioral proof would justify premature paid reactivation and set a false baseline for the relaunch gate. |
| Should we consider a temporary promo code to boost conversion while the catalog is being built? | No, and this is consistent with the CEO's own decision from 2026-05-18. The clean-price signal is the right experiment. A promo during the catalog build period would confound the conversion signal, making it impossible to isolate whether any CVR improvement came from assortment or from the promo. The first promo test, when it runs, should be a free delivery threshold (for example, free delivery at $45+) rather than a percentage discount, to protect margin while reducing a known friction point. |
| The delivery promise says every day but EXP-002 is still a painted-door test. Is the customer being misled? | The EXP-002 test is an operational credibility gap that must be resolved before paid relaunch, not after. Zoe (COO) must publish a firm, customer-facing SLA grounded in actual driver routing by Week 4. Until that SLA is published and operationally verified, the brand should not be scaling paid acquisition against a delivery promise it cannot yet guarantee at volume. |
| Why not just move to Shopify now and get a better e-commerce foundation before expanding the catalog? | Platform is not the binding constraint at any point in the prior twelve analysis phases. A 3-6 month migration pause creates a competitive vulnerability window while the Black food e-commerce space is still open. The current custom Next.js stack has no proven conversion floor yet to compare against. The platform decision belongs after the CRO operator engagement reveals a hard stack constraint, not before. |
| If you defer the CRO operator hire until post-relaunch, are you not just pushing the problem forward? | The operator hire is deferred because a $50-120K engagement briefed against 0.46% CVR from a 43-SKU catalog will optimize the wrong funnel. The hire becomes the highest-leverage investment in the portfolio the moment the relaunch gate is passed and one week of post-assortment behavioral data exists. The unlock condition is specific and measurable, not indefinite. |
| How does this story land with investors asking about the $6.3M Year 1 revenue projection? | Investors asking about the projection need to understand that the e-commerce funnel and the flagship store are two separate value-creation tracks. The $6.3M projection is tied to the flagship store (SBA facility, Hyde Park build-out), not to current e-commerce performance. The SAFE raise is the trigger for the SBA facility. The e-commerce operation is the demand-proof engine that validates the brand thesis before the flagship opens, and the Wave A/B expansion is the work that produces that proof. Conflating the two tracks is the fastest way to lose credibility with a sophisticated investor. |

_Data gaps: Actual CAC from pre-pause paid media campaigns (Meta + Google, ~$439/wk): without this, the claim that CAC exceeds first-order gross margin is a structural inference, not a measured fact.; Post-assortment CVR baseline: no behavioral data exists on how the funnel performs at 80-100 SKUs because the catalog has never been that broad. The 1.5% CVR base-case assumption in the business case is directional only.; Wave A and Wave B vendor pipeline status: which of the 1,025 contacts in Airtable base app3raEVB9kHeUoHE have been contacted, which have responded, and which have agreed to terms. No sourcing LOIs are confirmed in the fact base.; EXP-002 actual driver routing data: what delivery days and ZIP codes can the team actually serve today, and how far does that fall short of the 'every day, citywide' customer promise.; Live Whole Foods and Aldi shelf prices for Wave A soul-food SKUs (collards, okra, smoked cuts, cornmeal, black-eyed peas, oxtail): the 'cleaner than Whole Foods, cheaper than Aldi' claim is unvalidated against current shelf prices.; Segment-level behavioral data (AOV by segment, repeat rate by segment, ATC rate by SKU): LogRocket is paused and Mailchimp audience is effectively empty, so no segment-level behavioral splits exist yet.; Black-owned badge eligibility count: how many of the current 43 SKUs qualify for the badge and how many Wave A/B SKUs will qualify, so the badge coverage KPI can be set at a specific number rather than a percentage of an unknown denominator._

### stakeholder-alignment

**The Wave A and Wave B catalog sprint will stall or be reversed unless Anthony (CEO), Zoe (COO), and the single farm supplier are pre-wired in the first two weeks, because the three most dangerous failure modes (premature paid relaunch, sourcing concentration collapse, and EXP-002 drift) are all stakeholder decisions, not technical ones.**

# Stakeholder Alignment Plan
## Uncle Mays Produce: Wave A and Wave B Catalog Sprint
### Anchor Decision: Fix Funnel and Product Mix, Get Paid CVR from 0.46% to Food-DTC Range

---

## Decision Path

**The decision that must be won:** Launch Wave A (soul-food basket: collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) and Wave B (commodity staples: bananas, onions, tomatoes, pantry) in parallel on the current Next.js stack, target 80-100 live SKUs in 8-12 weeks, and hold every deferred lever (paid media, CRO operator, platform migration) behind the three-metric relaunch gate until it clears in a single calendar week.

**Who decides:** Anthony Ivy (CEO) is the sole decision-maker on sourcing standards, Black-owned badge approval, and any capital deployment above the inventory investment. Zoe Rowell (COO) is the sole decision-maker on vendor selection, inventory levels, and fulfillment SLA publication. No Wave launches without both signing off on the 10-SKU minimum readiness checklist.

**Approval path and timing:**

1. Week 1: Anthony and Zoe align on Wave A/B parallel sprint structure and binary decision rights. No external engagement before this alignment is confirmed.
2. Week 2: Sourcing relationships. Anthony and Zoe jointly approach Run A Way Buckers Club for capacity commitments and identify two backup suppliers per Wave A soul-food SKU.
3. Week 4: Zoe publishes EXP-002 fulfillment SLA in customer-facing terms, grounded in actual driver routing capacity. This is a hard deadline, not a target.
4. Week 4: LogRocket subscription reactivated (one step: re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel and Trigger.dev, uncomment three cron lines, deploy). Session-level behavioral data must be live before Wave A/B catalog changes are observable.
5. Week 8-12: Relaunch gate measured in a single calendar week: /shop reach above 40%, ATC above 12%, three of the top-10 Black-household staple SKUs live and in stock. Named measurement owner: Zoe (COO), weekly publish cadence.
6. Post-gate: Paid media reactivation (Meta + Google, ~$439/wk pre-pause baseline), CRO operator engagement (Barrel, Anatta, or Bear Group), $15 cart minimum test. These decisions happen in sequence after the gate clears, not before.

**What is NOT in scope for this decision cycle:** Platform migration to headless Shopify, Wave E personal care launch, subscription re-introduction, and any new paid tool or SaaS commitment. Each has a defined unlock condition and is formally deferred.

---

## Stakeholder Map

| Stakeholder | Role | Influence | Current Stance | What They Need To Hear |
|---|---|---|---|---|
| Anthony Ivy (CEO) | Decision authority on sourcing standards, Black-owned badge, capital | Blocking (sole owner of sourcing standard and badge approval) | Aligned on diagnosis. Personally identified narrow assortment as root cause. Risk: may face pressure from investors or revenue shortfall to restart paid media early. | The relaunch gate is a protection against wasting capital, not a delay tactic. Premature paid restart at 0.46% CVR destroys cash with provably negative unit economics. The gate keeps the SAFE raise story clean. |
| Zoe Rowell (COO) | Decision authority on vendor selection, inventory, fulfillment SLA, /shop reach metric ownership | Blocking (catalog launch cannot ship without vendor and inventory sign-off; SLA must be published by Week 4) | Assumed aligned on product mix reset (sourcing owned jointly by Anthony and Zoe per CEO decision 2026-05-17). Risk: bandwidth compression if COO capacity is also covering operational steady-state. | Her two deliverables are binary and time-boxed: (1) EXP-002 SLA published by Week 4 and (2) /shop reach and ATC published weekly from Wave A/B launch. These are the only metrics that matter until the gate clears. Shared ownership is not ownership. |
| Run A Way Buckers Club (Pembroke, IL) | Single farm supplier, source of Wave A soul-food SKU candidates (kale, sweet potatoes, dry beans, proteins) | Blocking (sourcing concentration risk: one disruption collapses Wave A) | Unknown. Assumed positive (existing relationship). Risk: seasonal constraints, capacity ceiling, or exclusive-supply conflict with Wave A volume requirements. | Uncle Mays is offering a stable, predictable demand signal (not spot purchases) and a Black-owned badge that amplifies their brand. The ask is a capacity commitment and a backup-supplier waiver so Uncle Mays can onboard secondary sources without damaging the relationship. |
| Wave A and Wave B new vendors (unidentified, minimum two per soul-food SKU) | Backup sourcing for Wave A, primary sourcing for Wave B commodity staples | High (no backup = single-point failure that stalls sprint) | Unknown. Must be identified and brought under LOI before Wave A launches. | Uncle Mays offers a Black-owned badge, a south-side Chicago delivery footprint, and a fast-growing e-commerce channel. The engagement is a volume commitment in exchange for preferred pricing and sourcing reliability. |
| SAFE round investors (87 Tier 1 contacts in Apollo, currently idle due to OAuth revocation) | Capital providers for $400K-$750K SAFE (5M cap, 20% discount) | High indirect (capital timing creates a sequencing risk: if inventory draw of $43K-$72K competes with the cash reserve needed for the SBA facility trigger, the entire reset plan is at risk) | Unreached (all Apollo campaigns idle due to OAuth revocation since 2026-04-17). | The 0.46% CVR and paid pause are not a crisis. They are a deliberate, diagnosed intervention: offer inadequacy was identified, catalog fix is in motion, paid will restart only after three hard thresholds clear. The business case is stronger with a defined relaunch gate than with speculative projections. |
| CRO/UX operator candidates (Barrel, Anatta, Bear Group) | Future funnel optimization owners, $50K-$120K 90-day engagement | Moderate (their engagement model may force a platform decision; if Shopify-dependent, they create a migration timeline under pressure rather than by choice) | Not yet engaged. Formally deferred until post-relaunch gate. | They will be engaged once post-assortment behavioral data exists. The brief they will receive will be against a real funnel, not a 43-SKU catalog. The unlock condition is specific: one full week of post-relaunch data with /shop reach above 40% and ATC above 12%. |
| Customers (south-side Chicago households, Soul-Food Household and Health-Forward Professional segments) | Behavioral validators of the entire hypothesis | Decisive (their cart completion behavior is the only real proof that assortment was the binding constraint) | Latent. Survey intent (97%) is directional only. No behavioral evidence at Wave A/B scale exists yet. | Clear delivery SLA, Black-owned badge on eligible SKUs, and a catalog that can build a $30-$60+ basket without forcing a protein purchase. The offer must be credible before any paid message reaches them. |
| Engineering (current Next.js stack) | Catalog updates, Black-owned badge activation, LogRocket reactivation, cart minimum test | Moderate (Black-owned badge is inert but wired in code; reactivation is zero-lead-time. LogRocket revival is one deploy step. Platform migration is deferred.) | Assumed available. Risk: competing priorities or no clear ticket ownership for the badge activation and LogRocket re-subscription. | Three zero-lead-time actions must ship before Wave A/B launch: (1) Black-owned badge activated on all eligible SKUs, (2) LogRocket re-subscribed and three cron lines uncommented, (3) cart minimum test queued for the week Wave B staples go live. None require a platform decision. |
| Jua Mitchell (CFO) | Cash reserve oversight, capital stack guardian | High indirect (the $43K-$72K inventory investment and the $400K SBA facility trigger must not compete for the same cash reserve) | Assumed monitoring. Risk: no explicit capital sequencing rule between inventory investment and SAFE raise cash reserve. | The inventory investment ($43K-$72K) must be explicitly ringfenced from the $400K minimum SAFE threshold that triggers the SBA facility. A capital sequencing memo naming these two pools is a prerequisite before Wave A POs are issued. |

---

## Resistance Points

| Concern | Who Holds It | Response |
|---|---|---|
| "Why not restart paid ads now and test whether the catalog is actually the problem?" | Anthony (CEO), investor audience | Paid CVR at 0.46% with a 43-SKU catalog produces provably negative unit economics. CAC almost certainly exceeds first-order gross profit at $30-$60 AOV. Restarting paid before the relaunch gate destroys cash without producing a usable signal, because the sample is drawn from a broken offer. The gate exists to protect the capital, not to delay growth. |
| "The sourcing timeline is too tight. 80-100 SKUs in 8-12 weeks is optimistic." | Zoe (COO), Run A Way Buckers Club | The target is 80-100 live and merchandised SKUs, not 80-100 sourced from scratch. Wave A soul-food SKUs have partial overlap with existing catalog (kale, sweet potatoes, beans, chicken already live). Wave B commodity staples (bananas, onions, tomatoes) are wholesale commodity purchases, not specialty sourcing. The incremental sourcing lift is 40-60 net new SKUs. The risk is not the count but the backup supplier gap, which is why alternate LOIs must be in place before launch. |
| "We don't have behavioral data to know if assortment is actually the driver." | Engineering, future CRO operator | Two facts constrain the alternative hypotheses. First, 5.5% add-to-cart means shoppers are reaching /shop and leaving before checkout, which rules out checkout friction as the primary cause. Second, the basket incompletion math is structural: a shopper cannot build a satisfying $30-$60 cart from 43 SKUs spanning only produce and five proteins. LogRocket session recordings on the expanded catalog (reactivated before Wave A/B launch) will confirm or challenge this within two weeks of the new SKUs going live. The assumption is testable and the test is defined. |
| "The EXP-002 daily delivery promise is already customer-facing. Walking it back damages trust." | Zoe (COO), customer segment | EXP-002 is a painted-door test, not a hardened promise. The SLA must be published in terms the routing can actually honor. A firm, narrower SLA (for example, delivery available Tuesday through Saturday, customer-picked window) is more trustworthy than a 'every day' claim that cannot be fulfilled at scale. The Soul-Food Household, the highest-LTV segment, bases repeat purchase on fulfillment trust, not on a broad promise. A credible narrow SLA outperforms an incredible broad one. |
| "Hiring the CRO operator now gives us more time to ramp them before relaunch." | Anthony (CEO) under revenue pressure | An operator briefed against 0.46% CVR from a 43-SKU catalog will optimize the wrong funnel. The 90-day clock on a $50K-$120K engagement begins at the briefing, not at relaunch. Briefing early wastes the most expensive portion of the engagement on a funnel that is structurally broken. The unlock condition is specific and achievable in 12-16 weeks. |
| "What if we move to Shopify now and use it as the platform for the expanded catalog?" | CRO operator candidates, investor audience | Platform is not the binding constraint at any point in the prior 18 analysis phases. A 3-6 month migration pause creates a competitive vulnerability window while Instacart and DoorDash Grocery deepen south-side penetration. The current Next.js stack has no proven conversion floor yet to compare against. The platform decision belongs after the operator engagement, after post-assortment behavioral data exists, and after a hard stack constraint is identified. Making it now is the highest-risk option in the set. |
| "The SAFE raise is idle (Apollo OAuth revoked). Investors aren't hearing the story." | Anthony (CEO), Jua Mitchell (CFO) | The Apollo OAuth fix is a one-day technical action (Google Workspace Admin, set Apollo as Trusted, re-auth one mailbox at a time with 24h+ between each). It is independent of the catalog sprint and should be unblocked in parallel, not deferred. The investor message improves with the relaunch gate narrative: a defined fix with hard thresholds is more credible to thesis-aligned investors than a speculative 6.3M Year-1 projection. |
| "The Black-owned badge is already wired but nothing is rendering it. Why hasn't this shipped?" | Engineering, Anthony (CEO) | The badge is inert because no SKU currently has the field populated with a verified supplier credential. The action is data entry and supplier verification, not code. Anthony owns badge approval. The pre-wire action is to build the supplier verification checklist and assign it to Anthony with a Wave A/B launch deadline. |
| "Capital is tight. What if the SAFE closes below $400K and Wave A/B inventory draws on the SBA trigger reserve?" | Jua Mitchell (CFO), Anthony (CEO) | This is the highest-consequence capital-timing risk in the system. A contingency must be defined before Wave A POs are issued. Options: (1) sequence Wave B commodity staples first (lower inventory cost, faster sourcing) and hold Wave A soul-food until SAFE closes above threshold; (2) identify a purchase-order financing line for inventory so the $43K-$72K does not draw on cash reserves. Jua Mitchell must own this decision with a named resolution date before any purchase order is issued. |

---

## Pre-Wire Plan

| Action | Owner | Timing | Desired Outcome |
|---|---|---|---|
| One-on-one alignment session: Anthony and Zoe confirm binary decision rights (Anthony owns sourcing standards and badge approval; Zoe owns vendor selection, inventory, and /shop reach metric publish). | Anthony (CEO) initiates | Week 1 | Both leaders exit with named responsibilities, a weekly check-in cadence, and the relaunch gate thresholds in writing. No Wave ships without both signing the 10-SKU readiness checklist. |
| Capital sequencing memo: Jua Mitchell confirms the $43K-$72K inventory investment is ringfenced from the $400K SBA trigger cash reserve. | Jua Mitchell (CFO), Anthony (CEO) | Week 1 | Named capital pools, contingency decision tree if SAFE closes below threshold, purchase-order financing fallback identified. No Wave A POs issued until this memo is signed. |
| Run A Way Buckers Club capacity conversation: Anthony and Zoe request volume commitment for Wave A soul-food SKUs and surface the backup-supplier intent without damaging the relationship. | Anthony (CEO) and Zoe (COO) jointly | Week 2 | Volume commitment for Wave A SKUs in writing. Agreement (or explicit non-objection) to Uncle Mays onboarding secondary suppliers for backup coverage. |
| Identify and bring under LOI at least two backup suppliers per Wave A soul-food SKU (collards, okra, smoked turkey necks or equivalent, cornmeal, black-eyed peas). | Zoe (COO) leads, Anthony (CEO) approves Black-owned badge eligibility | Week 2-4 | Backup sourcing LOIs in place before Wave A launches. Sourcing concentration risk de-risked from blocking to manageable. |
| Supplier verification checklist for Black-owned badge: build the checklist, assign badge-approval actions to Anthony, set a Wave A/B launch deadline. | Anthony (CEO) owns approval; Engineering owns badge field population | Week 2 | Every Wave A/B SKU sourced from a Black-owned supplier launches with the badge live. Zero-cost, zero-lead-time on the current stack. |
| LogRocket reactivation: re-add NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel (prod and preview) and Trigger.dev project env vars, uncomment the three cron lines in galileo-daily-briefing.ts, galileo-incident-alert.ts, and logrocket-daily-ingest.ts, then deploy. | Engineering (CTO owns ship) | Week 3, before Wave A/B launch | Session-level behavioral data is live before the expanded catalog is observable. Post-assortment CVR change is attributable, not ambiguous. |
| EXP-002 SLA publication: Zoe publishes a firm, customer-facing delivery SLA grounded in actual driver routing capacity. Narrower but credible beats broad and unreliable. | Zoe (COO) | Week 4, hard deadline | Customer-facing SLA is live. Soul-Food Household retention strategy is executable. Paid relaunch cannot proceed without this. |
| Investor message pre-wire: draft the relaunch gate narrative for every investor touchpoint (Apollo sequences, manual Gmail outreach, deck appendix). Lead with: offer inadequacy is diagnosed, catalog fix is in motion, paid restarts only after three hard thresholds clear. | Anthony (CEO) authors, Jua Mitchell (CFO) reviews for capital-raise consistency | Week 3 | Every investor conversation reinforces the same story. The 0.46% CVR does not become a credibility problem because the fix is defined and the gate is specific. |
| Apollo OAuth unblock: Google Workspace Admin sets Apollo as Trusted, re-auth one mailbox (start with anthony@), wait 24h+ before next mailbox. Do not bulk re-auth. | Anthony (CEO) owns the Google Workspace action | Week 1 (parallel, not dependent on catalog sprint) | At least one Apollo mailbox sending within 72 hours. Investor outreach resumes in parallel with catalog sprint, not after it. |
| CRO operator preliminary scoping: send a one-paragraph note to Barrel, Anatta, and Bear Group that Uncle Mays is in a catalog sprint and the engagement window opens at relaunch gate passage (estimated 12-16 weeks). Ask about capacity availability and minimum stack requirements. | Anthony (CEO) | Week 6 | Operators are informed, not surprised. Capacity is reserved. Any Shopify-dependency requirement is surfaced 6-8 weeks before the platform decision must be made, giving time for a deliberate decision rather than a forced one. |
| Relaunch gate ownership and cadence: assign Zoe as named measurement owner for /shop reach and ATC, with a weekly publish deadline. Build a one-page gate dashboard (can be a shared doc) showing the three thresholds against live readings each week. | Zoe (COO) builds, Anthony (CEO) reviews weekly | Week 4, maintained weekly | The relaunch gate is a hard governance trigger, not a soft guideline. No paid dollar is committed before all three thresholds clear in a single calendar week. |
| Cart minimum test queuing: engineering tickets for a $15 cart minimum A/B test are written and staged before Wave B commodity staples go live, so the test can activate the same week Wave B SKUs appear in the catalog. | Engineering (CTO), Zoe (COO) approves | Week 6-8, ready to activate at Wave B launch | The $15 cart minimum test is not delayed by a ticket backlog. Results are readable within two weeks of Wave B launch without a promo confound. |
| Post-gate CRO operator brief preparation: once the relaunch gate clears, draft the operator brief against one full week of post-assortment behavioral data (segment-level ATC from LogRocket, session-to-shop rate, AOV by SKU). | Anthony (CEO) and Zoe (COO) co-author | Week 12-16, contingent on gate | The operator receives a real brief, not a speculative one. The 90-day engagement clock starts on a funnel that can actually be optimized. |

_Data gaps: Post-assortment behavioral baseline: no session-level segment data (ATC by segment, AOV by SKU, session-to-shop by entry page) exists because LogRocket is paused. This is the single most important data gap. It must be filled before any post-Wave A/B CVR conclusion is drawn.; Run A Way Buckers Club capacity data: no confirmed volume ceiling, seasonal availability calendar, or exclusivity terms for Wave A soul-food SKUs. Without this, sourcing concentration risk cannot be quantified.; Wave A and Wave B vendor pipeline: no identified backup suppliers under LOI. The two-backup-per-SKU requirement is a governance standard, not a current fact.; Actual Whole Foods and Aldi shelf prices for soul-food SKUs in south-side Chicago ZIP codes: the 'cleaner than Whole Foods, cheaper than Aldi' positioning claim is unverified against live comparables. Price perception misalignment at Wave A launch could suppress conversion for the highest-priority segment.; EXP-002 routing data: no published finding from the painted-door test on actual driver capacity by day of week. Until Zoe publishes a firm SLA, the daily delivery promise is a customer-facing claim without operational backing.; Capital sequencing clarity: no confirmed ringfencing of the $43K-$72K inventory investment from the $400K SBA facility trigger cash reserve. A capital squeeze could force premature paid relaunch at the worst possible moment.; Organic engagement threshold: the CEO-approved plan has no defined observable gate (repeat-session rate, first-30-day repeat order rate, email re-engagement signal) for the organic engagement evidence required before paid restart. This must be specified before the relaunch gate is finalized.; CRO operator stack requirements: Barrel, Anatta, and Bear Group have not been asked whether they require Shopify. If any of the three is Shopify-dependent, the platform decision is coupled to the operator decision and must be resolved before the engagement window opens, not after._

### decision-memo

**Approve the Wave A and Wave B catalog sprint as the sole capital priority: launch 80-100 SKUs in 8-12 weeks, hold all paid media and operator spend behind a three-metric relaunch gate, and treat every other initiative as blocked until that gate clears in a single calendar week.**

# Decision Memo

**To:** Anthony Ivy, CEO; Zoe Rowell, COO
**From:** Strategy Engagement, Phase 14
**Date:** 2026-06-07
**Re:** Approve the Wave A and Wave B catalog sprint, hold all other initiatives behind the relaunch gate

---

## Recommendation

Approve the Wave A and Wave B catalog expansion sprint immediately and treat it as the sole capital and capacity priority for the next 8-12 weeks. Wave A (soul-food basket: collards, okra, smoked cuts, rice, cornmeal, black-eyed peas) and Wave B (commodity staples: bananas, onions, tomatoes, core pantry) must run in parallel, not sequentially, targeting 80-100 live SKUs. Every other initiative, paid media, the CRO/UX operator hire, platform migration, and Wave E personal care, is formally deferred behind a single three-metric relaunch gate: /shop reach above 40%, add-to-cart rate above 12%, and at least three of the top-10 Black-household staple SKUs live and in-stock, all confirmed in the same calendar week. No paid dollar is committed before all three clear. This is not a phased recommendation with optional sequencing. It is a binary gate: catalog first, then everything else.

---

## Decision Required

Anthony Ivy (CEO) and Zoe Rowell (COO) must each confirm the following by end of week:

1. **Anthony:** Approve the Wave A and Wave B sprint scope. Commit to sourcing at least two confirmed backup supplier relationships (beyond Run A Way Buckers Club) per Wave A soul-food SKU under LOI before Wave A launches.
2. **Zoe:** Commit to publishing a firm, customer-facing delivery SLA grounded in actual driver routing capacity by Week 4, and to owning the /shop reach metric with a weekly reporting cadence starting immediately.
3. **Both:** Formally confirm that paid media ($439/wk pre-pause), the CRO/UX operator hire ($50-120K), and platform migration are on hold until the relaunch gate clears. This must be a stated decision, not a soft deferral, to prevent premature reactivation under investor or revenue pressure.

---

## Context

Thirteen prior phases of this engagement have converged on a single root cause: the 43-SKU produce-only catalog makes basket completion structurally impossible for the paid shoppers Uncle Mays is attracting, and every other intervention treats symptoms rather than the cause.

The live funnel metrics are unambiguous. Paid conversion is approximately 0.46%, against a 2-4% food-DTC benchmark. Only 25% of sessions reach /shop. Of those, only 5.5% add to cart. The break is at the browse stage, before Stripe Elements, before the delivery scheduler, and before any pricing friction. Shoppers arrive, see a 43-SKU produce-only catalog, cannot build a satisfying $30-60 basket, and leave.

The CEO's own hypothesis, stated at the start of this engagement, is that the assortment is "an offering Anthony himself wouldn't buy." That hypothesis is supported by every piece of evidence in the fact base: the missing categories (snacks, heat-and-eat, pantry staples, beverages), the single farm supplier with seasonal constraints, the $7.99 delivery fee that represents 13-40% of order value at current AOV, and the absence of any behavioral data showing that checkout friction or pricing is the primary failure mode.

The 6-phase product-mix reset approved by the CEO on 2026-05-16 is directionally correct. This memo operationalizes it with explicit ownership, hard gate thresholds, and formal deferrals for every initiative that has been accumulating as open questions across the engagement.

The decision is urgent for two reasons. First, the paid pause clock is running: every week of organic-only traffic without an expanded catalog is a week of wasted potential customer acquisition and lost repeat-purchase data. Second, the competitive window for first-mover advantage in the "Black-farmed produce, south-side Chicago" paid search cluster is finite. When paid restarts, it must restart against a catalog that can actually close.

---

## Options Considered

| Option | Upside | Trade-Off | Verdict |
|---|---|---|---|
| Wave A + Wave B in parallel (RECOMMENDED) | Directly attacks the binding constraint. Unlocks the Soul-Food Household (highest LTV) and the Health-Forward Professional simultaneously. Base-case ROI: $5K-$8K incremental weekly revenue, recouping $43K-$72K inventory outlay in 8-14 weeks (assumption: conservative 1.5% CVR at $50 AOV on 150 paid sessions/week post-relaunch). | Requires two sourcing relationships to be under LOI before launch. Parallel execution demands clear ownership split between Anthony and Zoe with no ambiguity. | APPROVE |
| Wave A first, Wave B sequentially | Lower upfront sourcing complexity. | Wave B commodity staples are needed in the same week as Wave A to lower per-item price floor and unblock the $20 cart minimum for Health-Forward Professionals. Sequential execution extends the relaunch gate by 4-6 weeks and delays the $15 cart minimum test. | REJECT |
| Hire CRO/UX operator now and fix the funnel before assortment | Operator expertise could catch checkout UX issues independent of assortment. | Thirteen prior analyses show no evidence that checkout friction is the primary failure mode. An operator briefed against 0.46% CVR from a 43-SKU catalog will optimize the wrong funnel. $50-120K spent with no post-assortment baseline is provably wasted. | DEFER: unlock condition is relaunch gate confirmed plus one full week of post-assortment behavioral data. |
| Reactivate paid media now with current catalog | Restores traffic and generates behavioral data. | At 0.46% CVR and $30-60 AOV, CAC almost certainly exceeds first-order gross profit. Every paid session is burning cash against an offer that cannot close. Generates noise, not signal. | REJECT until relaunch gate clears. |
| Migrate to headless Shopify now | Operator-ready platform. Potential CRO acceleration if operator requires Shopify. | 3-6 month migration pause creates a competitive vulnerability window. Platform is not the binding constraint at any stage of the prior analysis. Current stack has no proven conversion floor to compare against. Forces the platform decision under time pressure if the operator requires Shopify. | DEFER: not on the agenda until post-operator engagement reveals a hard stack constraint. |
| Wave E personal care (soaps, batana oil, hair/skin care) now | 55-70% DTC margins (assumption). No cold-chain cost. Shelf-stable freight. Full Black-owned sourcing integrity. $15K-$25K inventory. | Dilutes Wave A/B sourcing bandwidth during the sprint. Personal care needs its own discovery and traffic mechanism, not just catalog placement. Highest-margin bet, but only after Wave A/B are proven. | DEFER: unlock condition is one full week of post-relaunch behavioral data showing ATC above 12%. |

---

## Evidence

The following evidence is drawn from live behavioral data and confirmed structural facts. Projections and assumptions are labeled.

**Funnel data (live, measured 2026-05-11):** Paid CVR approximately 0.46% vs 2-4% food-DTC benchmark. /shop reach 25% of sessions. Add-to-cart 5.5% of /shop sessions. The break is at browse, not checkout.

**Catalog fact (Airtable, base appm6F6H9obydzAM2):** 43 active SKUs. Mix: Greens approximately 14, Roots approximately 12, Pantry approximately 10, Microgreens approximately 6, Protein approximately 5. Single farm supplier. Genuinely missing: snacks, heat-and-eat, broader meats, dry goods, beverages, non-food. The 1,025-row vendor sourcing pipeline (base app3raEVB9kHeUoHE) is not available inventory.

**Pricing structure (live):** $20 cart minimum. $7.99 flat delivery fee. At $20-$35 AOV, the delivery fee is 23-40% of order value, making it a conversion-killer for the produce-only baskets the current catalog generates. At $60+ AOV (assumption: post-Wave A/B Soul-Food Household basket), the fee drops to approximately 13%, which is tolerable.

**Wave A inventory estimate (assumption, labeled):** $31K-$52K for soul-food basket SKUs at initial order volumes. Two confirmed sourcing relationships required before launch. Wave B (commodity staples) adds an estimated $12K-$20K (assumption). Combined range $43K-$72K.

**Competitor context:** Instacart and DoorDash Grocery solve basket completion for south-side shoppers today because Uncle Mays cannot. The do-nothing competitive loss is not to a direct rival but to basket fragmentation across Mariano's, Aldi, and occasional Whole Foods trips. The Black-owned sourcing badge and culturally-specific assortment are the only durable moats Instacart cannot replicate.

**Segmentation (based on public category data, assumption-labeled at the individual segment level):** The Soul-Food Household over-indexes 72-191% on items Uncle Mays does not yet stock (collards, okra, black-eyed peas, smoked turkey necks, cornmeal, oxtail). Wave A directly addresses this gap. The Health-Forward Professional is the current de-facto paid-traffic audience, but cannot build a $30-60 basket from 43 SKUs of specialty produce.

**Prior phase convergence:** All 13 prior analysis phases (situation-assessment through narrative-builder) converge on the same binding constraint: assortment breadth, not checkout mechanics or media spend. No prior phase found evidence that funnel friction is the primary failure mode.

---

## Risks and Mitigations

**Risk 1: Assortment breadth is not the primary conversion driver.** If checkout UX friction, delivery trust, or price perception drive more conversion failure than catalog inadequacy, adding 40-60 new SKUs will not move CVR and the $43K-$72K inventory outlay will not recoup. Mitigation: re-subscribe LogRocket before Wave A/B launches and run session recordings on the expanded catalog for the first two weeks before paid spend resumes. This creates a direct behavioral test of the assumption without burning paid budget. If session recordings show high /shop reach and browse time but low ATC on the expanded catalog, escalate to the CRO operator hire immediately.

**Risk 2: Sourcing concentration failure.** A single farm supplier (Run A Way Buckers Club, Pembroke IL) plus unverified Wave A/B vendor relationships means one supply disruption, one harvest failure, or one key vendor exit can hollow the catalog at launch. Mitigation: Anthony and Zoe must have at least two confirmed backup sources per Wave A soul-food SKU under LOI before any Wave A SKU goes live on the customer catalog. This is a hard pre-condition for launch, not a best-effort.

**Risk 3: EXP-002 SLA unresolved at paid relaunch.** If Zoe cannot publish a firm, customer-facing delivery SLA grounded in actual driver routing capacity, the Soul-Food Household (highest-LTV segment, most repeat-purchase-dependent) will experience fulfillment trust failures that suppress retention independent of assortment quality. Mitigation: Zoe publishes the SLA by Week 4 regardless of catalog progress. If the SLA cannot be published by Week 4, paid relaunch is blocked even if the three-metric gate clears.

**Risk 4: Premature paid reactivation under investor or revenue pressure.** The relaunch gate (/shop reach above 40%, ATC above 12%, three top-10 staple SKUs in-stock in the same calendar week) has no named measurement owner or weekly review cadence today. Without governance, it becomes a soft suggestion rather than a hard trigger. Mitigation: Zoe owns /shop reach (weekly report, every Monday). Anthony owns sourcing pipeline velocity (SKUs sourced per week, same Monday report). Gate status is a standing agenda item at weekly leadership check-in. No paid dollar before all three metrics clear simultaneously, documented in writing.

**Risk 5: Capital timing squeeze.** If the $400K-$750K SAFE raise closes below the $400K minimum or is delayed further (Apollo OAuth is currently idle), the $43K-$72K Wave A/B inventory investment may compete with the cash reserve required to trigger the SBA 7(a) facility. Mitigation: define a triage threshold now: if available cash drops below the SBA trigger reserve floor, the catalog sprint pauses at the Wave B midpoint and the team operates on the SKUs already sourced. This contingency must be defined before launch, not after a cash flow squeeze forces the decision.

**Risk 6: Wave A pricing misaligned with Whole Foods and Aldi comparables.** The "cleaner than Whole Foods, cheaper than Aldi" claim has not been validated against actual shelf prices for soul-food SKUs. If Wave A items are priced above Whole Foods shelf price for comparable items, the positioning collapses for the first buyers who compare, destroying word-of-mouth for the highest-priority segment. Mitigation: Anthony or Zoe runs a live price check at the nearest Whole Foods (Hyde Park) and Aldi (south-side) for every Wave A SKU before launch. Wave A pricing is set at a 5-12% premium to Whole Foods shelf price, not at a premium to Aldi.

---

## Next Steps

The following actions are time-gated and owned. All must be in motion by end of Week 1.

| Action | Owner | Deadline |
|---|---|---|
| Confirm Wave A and Wave B sprint scope and parallel execution | Anthony + Zoe | End of Week 1 |
| Identify and initiate LOI with at least two backup suppliers per Wave A SKU | Anthony (CEO, sourcing standards) + Zoe (COO, vendor selection) | Week 2 |
| Run live Whole Foods and Aldi shelf-price check for all Wave A SKUs; set Wave A list prices | Anthony | Before Wave A launch |
| Activate Black-owned badge on all currently eligible SKUs in Airtable Catalog (zero-cost, zero-lead-time on current stack) | Engineering (CTO) | At Wave A/B launch, no later than Week 8 |
| Re-subscribe LogRocket + Gatsby (restore NEXT_PUBLIC_LOGROCKET_APP_ID and LOGROCKET_PAT to Vercel and Trigger.dev; uncomment three cron lines; deploy) | CTO | Before Wave A/B launch, no later than Week 6 |
| Publish firm, customer-facing delivery SLA grounded in actual EXP-002 driver routing data | Zoe (COO) | Week 4 |
| Set up weekly relaunch gate review: /shop reach, ATC rate, staple SKU in-stock count; document gate status in writing | Zoe (/shop reach + SLA) and Anthony (sourcing velocity) | First review Week 4, every Monday thereafter |
| Queue $15 cart minimum A/B test for the week Wave B staples (bananas, onions) go live | Engineering (CTO) | Wave B launch week |
| Queue tiered delivery fee experiment ($4.99 from $35-$59, free above $60) for post-relaunch gate confirmation | CRO (or Engineering if no CRO yet) | Week after relaunch gate clears |
| Define capital triage threshold: minimum cash reserve floor below which catalog sprint pauses at Wave B midpoint | Anthony + Jua (CFO) | End of Week 1 |
| Formally document in writing: paid media, CRO operator hire, and platform migration are deferred until relaunch gate | Anthony | End of Week 1 |

The relaunch gate is the master governance trigger. When /shop reach clears 40%, ATC clears 12%, and three top-10 Black-household staple SKUs are live and in-stock in the same calendar week, the following decisions unlock sequentially: (1) $15 cart minimum test activates immediately; (2) paid media restarts at pre-pause budget ($439/wk) with new segment-specific creative (Facebook for Soul-Food Household, Instagram and Google search for Health-Forward Professional); (3) CRO/UX operator RFP opens (Barrel, Anatta, Bear Group shortlist); (4) Wave E personal care sourcing begins. Platform migration remains off the agenda until post-operator engagement reveals a hard stack constraint.

_Data gaps: Post-assortment behavioral baselines: segment-level ATC rate, AOV by segment (Soul-Food Household vs Health-Forward Professional), session-to-shop rate by traffic source. None exist yet because LogRocket is paused and the expanded catalog is not live.; Wave A and Wave B sourcing cost actuals: the $43K-$72K combined inventory estimate is an assumption. Actual unit costs, minimum order quantities, and lead times from backup suppliers are unknown until LOIs are signed.; EXP-002 driver routing capacity data: the actual number of delivery days per week and routes per day Uncle Mays can fulfill is unpublished. Zoe's SLA will surface this.; Whole Foods and Aldi shelf prices for Wave A soul-food SKUs: no live price check has been run. Required before Wave A list prices are set.; CAC actuals: cost-per-acquisition from the pre-pause Meta and Google Ads spend is not in the fact base. Without this, the business case recoup timeline (8-14 weeks assumption) cannot be precisely validated.; Repeat purchase rate and cohort retention data: no behavioral data exists on whether any first-time customers have returned. The single grandfathered subscriber (Doina, $55/wk) is the only longitudinal data point.; Organic engagement baseline: no defined metric for minimum repeat-session rate, email open rate, or first-30-day repeat order rate that must be observed before paid restart. The CEO-approved plan requires this gate but it remains undefined._

