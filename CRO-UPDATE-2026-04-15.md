# CRO Update — 2026-04-15

## EXECUTIVE SUMMARY

**Breakthrough finding:** Subscription economics are profitable at paid acquisition scale.

**Per-customer profit (6-month LTV):**
- Starter ($30/week): +$171
- Community ($55/week): +$397  
- Premium ($75/week): +$577
- **Blended (40/40/20 mix): +$342**

**At target scale (30 orders/week):**
- Monthly revenue: $27,180
- Monthly ad spend: $12,900
- **Payback period: 1.4 months**
- Month 1 cashflow gap: -$3,387 (turns profitable month 2+)

**This changes everything.** We CAN use paid acquisition to hit 30 orders/week. The path is clear.

---

## WHAT I SHIPPED TODAY

### 1. Paid Acquisition Plan
**File:** `revenue-strategy-paid-acquisition-plan.md`

**3-phase approach:**
- **Phase 1 (Month 1):** $3K test budget to validate 2% conversion and <$100 CAC
- **Phase 2 (Month 2-3):** Ramp to $12.9K/month to hit 30 orders/week
- **Phase 3 (Month 4+):** Optimize tier mix, test new channels, scale to 100/week

**Channel mix:** Meta 67% ($2K), Google Ads 33% ($1K)

**Success criteria:**
- CAC <$100
- Conversion rate ≥2%
- Churn <20% in first 30 days
- ROAS ≥10x (6-month LTV basis)

### 2. Advertising Creative Brief
**File:** `advertising-creative-brief-subscription-launch.md`

**First deliverables (due EOW 2026-04-19):**
- 5 UGC-style testimonial videos (9:16 vertical, 15-30sec)
- 5 product showcase carousels (3-5 images each)
- 15 images + 5 headlines + 5 descriptions for Google Performance Max

**Creative strategy:** Subscription-first positioning, culturally fluent, premium (not charity), founder-led voice.

### 3. Apollo Account Health Check
**Issue identified:** invest@unclemays.com OAuth revoked, Tier 2C campaign stalled.

**Impact:** 148 contacts not receiving emails (10/day lost velocity).

**Fix required (Anthony):**
1. Re-auth Gmail OAuth for invest@ in Apollo Settings > Email Accounts
2. Re-add invest@ to Tier 2C campaign
3. Activate campaign via Apollo UI
4. **Wait 24h+ before re-authing other accounts** (Google bulk revocation risk)

---

## IMMEDIATE NEXT ACTIONS

### Anthony (CEO/Board)
1. **[ ] Approve $3K month 1 test budget** for paid acquisition (Meta $2K, Google Ads $1K)
2. **[ ] Fix invest@ OAuth in Apollo** (see issue above)
3. **[ ] Confirm cashflow plan** for $6-8K working capital gap in months 2-3 (or we ramp slower)
4. **[ ] Review and approve** `revenue-strategy-paid-acquisition-plan.md`

### Advertising Creative
1. **[ ] Read brief:** `advertising-creative-brief-subscription-launch.md`
2. **[ ] Ship first 10 creative variants** by EOW 2026-04-19
3. **[ ] Source customer testimonials** (coordinate with RevOps for Mailchimp ask)
4. **[ ] Set up Canva templates** for weekly variant production

### RevOps
1. **[ ] Install Meta Pixel + Conversions API** (server-side via Stripe webhook)
2. **[ ] Set up Google Ads conversion actions** (3 tiers: $774, $1,419, $1,935 LTV values)
3. **[ ] Build GA4 conversion funnel dashboard** (sessions → checkout → purchase by tier)
4. **[ ] Weekly CAC/ROAS reporting** (automated, ready for Monday AM CRO review)

### CRO (Me)
1. **[x] Complete paid acquisition plan**
2. **[x] Brief Advertising Creative on subscription positioning**
3. **[ ] Weekly revenue review cadence** with Advertising Creative (Mondays)
4. **[ ] Set up go/no-go checkpoints** (end of week 2, end of month 1)

---

## KEY INSIGHTS FROM TODAY'S ANALYSIS

### 1. One-time boxes don't work economically
- AOV: $50 (one-time)
- CAC: $100 (at $2 CPC, 2% conversion)
- **Loss per order: -$50**
- ROAS: 0.6x

**Implication:** ALL paid acquisition must drive subscriptions, not one-time purchases.

### 2. Subscriptions unlock paid acquisition
- 6-month LTV: $1,264 (blended)
- Gross profit (35%): $442
- **Profit at $100 CAC: +$342**
- ROAS (6-month): 12.6x

**Implication:** We can profitably acquire customers at $100 CAC, which is achievable at industry-standard CPCs.

### 3. Higher tiers = higher margins
- Starter: +$171 profit/customer
- Community: +$397 profit/customer (2.3x better)
- Premium: +$577 profit/customer (3.4x better)

**Implication:** Push customers toward Community/Premium via landing page defaults, creative positioning, and upsell flows.

### 4. Month 1 cashflow gap is manageable
- Need $12.9K ad spend to hit 30 orders/week
- Month 1 revenue: $9,513
- **Cashflow gap: -$3,387**
- Month 2+: Profitable (recurring revenue compounds)

**Implication:** Either secure $6-8K working capital OR ramp slower ($6K budget in month 2, $12.9K in month 3).

### 5. Retention assumption is critical
- 6-month LTV assumes customers stay ≥6 months
- **If churn >20%/month:** LTV collapses, CAC tolerance drops, paid acquisition becomes unprofitable
- **If churn <15%/month:** LTV is higher, can increase CAC targets

**Implication:** We MUST validate retention in Phase 1. If churn is high, pause scale and fix product/operations first.

---

## RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Conversion <1.5%** | Medium | High (unprofitable) | Kill switch at 14 days, fix landing page before scaling |
| **Churn >20%** | Medium | Critical (LTV collapses) | Validate retention in Phase 1, pause scale if high |
| **CAC >$150** | Low | High (unprofitable) | Test 10 variants/week, pause underperformers daily |
| **Cashflow gap** | High | Medium | Secure $8K working capital OR ramp slower |
| **Creative fatigue** | High | Medium | Refresh every 2 weeks, ship 5+ new variants/week |

---

## CURRENT STATE (as of 2026-04-15)

### Revenue
- **Orders/week:** ~1 (goal: 30)
- **Last 7 days:** $75 (1 transaction)
- **Gap to target:** 30x growth needed

### Traffic
- **Sessions/day:** 36 (need 215/day at 2% conversion)
- **Organic alone won't get us there** — paid acquisition is required

### Apollo Campaigns
- **Tier 1:** 80 delivered, 4 opens (5.0%), 1 reply (1.2%)
- **Tier 2 Total:** 288 delivered, 3 opens (1.0%), 2 replies (0.7%)
- **invest@ STALLED:** 4 delivered (should be 138+), needs OAuth re-auth

### Email Account Health
- All accounts show 5.0 health score
- Warmbox running independently (verified via API, not UI)
- **Action required:** Anthony re-auth invest@ in Apollo

---

## WHAT SUCCESS LOOKS LIKE

### End of Month 1 (Phase 1 Test)
- 30+ subscription sign-ups at <$100 CAC
- Conversion rate ≥1.5%
- Week 1 churn <20%
- ROAS (6-month projected) ≥10x
- **Go/no-go decision:** Scale to $6K/month (Phase 2) or kill and try organic-first

### End of Month 3 (Phase 2 Scale)
- 129 subscriptions/month (30/week sustained)
- CAC stable at $80-100
- Churn <17% monthly
- Payback period <2 months
- **Go/no-go decision:** Scale to $25K/month (100/week) or hold at 30/week

### End of Month 6 (Phase 3 Optimize)
- 30+ orders/week sustained for 90 days
- LTV ≥$1,400 (retention validated)
- Tier mix: 50%+ Community/Premium (up from 40%)
- ROAS ≥12x
- **Ready to scale:** $25K/month budget to hit 100/week

---

## NEXT SYNC

**CRO + Advertising Creative:** EOW 2026-04-19 (review first batch of creative)

**CRO + RevOps:** 2026-04-17 (tracking setup checkpoint)

**CRO + CEO:** After board approves budget (align on launch timeline)

---

## FILES CREATED TODAY

1. `revenue-strategy-paid-acquisition-plan.md` — Full 3-phase plan, unit economics, budget requirements
2. `advertising-creative-brief-subscription-launch.md` — Creative strategy, first deliverables, brand voice
3. `CRO-UPDATE-2026-04-15.md` — This document (summary for Anthony/board)

---

## QUESTIONS FOR THE BOARD

1. **Budget approval:** Can we commit $3K for month 1 test? If successful, $12.9K/month for months 2-3?

2. **Cashflow:** Do we have $6-8K working capital for the month 2-3 gap, or should we ramp slower?

3. **Retention data:** Do we have any churn data from past customers? (Helps validate the 6-month assumption)

4. **Stripe checkout:** Is the default flow set to subscriptions (not one-time)? If not, this is a critical blocker.

5. **Landing pages:** Do we have subscription-optimized landing pages, or do ads currently drive to the homepage?

---

**Status:** READY TO LAUNCH (pending board approval + creative + tracking setup)

**Owner:** CRO (0df6fe9a-9676-41e7-89e9-724d05272a51)

**Next update:** After Phase 1 completes (end of month 1)
