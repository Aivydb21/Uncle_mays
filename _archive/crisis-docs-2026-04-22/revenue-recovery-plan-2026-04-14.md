# Revenue Recovery Plan — RevOps Analysis
**Date:** 2026-04-14  
**Prepared by:** RevOps  
**Status:** CRITICAL - IMMEDIATE ACTION REQUIRED

---

## Executive Summary

**Current State:** Zero orders in 7 days vs 30/week target (100% miss)

**Root Causes Identified:**
1. ✅ **Checkout broken** (FIXED by CTO today) — 97% abandonment due to missing shipping address collection
2. ❌ **Traffic crisis** — 15 sessions/day vs 100+ needed (85% shortfall)
3. ❌ **Zero active demand channels** — All paid ads paused, email list empty, no organic social

**Expected Recovery Timeline:**
- **48 hours:** 10-15 orders (from checkout fix + existing traffic)
- **Week 1:** 20-25 orders (requires reactivating ONE demand channel)
- **Week 4:** 30+ orders (requires multi-channel activation)

---

## Findings

### 1. Checkout Conversion (FIXED ✅)

**Problem:** Old payment links hardcoded in homepage didn't collect shipping addresses for a delivery business.

**Impact:** 
- 100 checkout sessions in 14 days
- Only 3 completed (all before April 7)
- 97% abandonment rate

**Fix Deployed:** 
- New payment links with shipping/phone/promo enabled
- Deployed 2026-04-14 15:45 UTC by CTO
- Commit: `14965a2`

**Expected Impact:**
- Completion rate: 3% → 25-30% within 48h
- 10-15 orders in next 48h (assuming current ~7 checkout starts/day continues)

**Status:** Monitoring required. Pull metrics in 24h.

---

### 2. Traffic Crisis (CRITICAL ❌)

**Current Traffic (24h):**
- Total sessions: 15
- Direct: 11 (bookmarks/URL typing)
- Canva.com: 2 (internal team)
- Google organic: 2 (not ads)

**Traffic Needed:**
- For 30 orders/week: ~100 sessions/day
- Assuming 30% conversion rate (post-fix) × 7 days = 30 orders

**Current vs Target:** 85% shortfall

**Traffic Sources Audit:**

| Channel | Status | Sessions/Day | Needed | Gap |
|---------|--------|--------------|--------|-----|
| Meta Ads | ❌ ALL PAUSED | 0 | 40-50 | -100% |
| Google Ads | ❌ INACTIVE/403 | 0 | 20-30 | -100% |
| Email (customer) | ❌ AUDIENCE EMPTY | 0 | 15-20 | -100% |
| Organic Social | ❌ NO POSTING | 0 | 10-15 | -100% |
| SEO/Organic | 🟡 MINIMAL | 2 | 10-15 | -85% |
| Direct/Referral | 🟢 BASELINE | 11 | 10-15 | -20% |
| **TOTAL** | | **15** | **100+** | **-85%** |

---

### 3. Demand Channel Breakdown

#### Meta Ads (Facebook/Instagram)
**Status:** All campaigns PAUSED  
**Ad Accounts:**
- Anthony Ivy: Active, $0 spent
- Uncle Mays Ads: DISABLED (Status 101), $164.95 lifetime spent
- Second Try: Active, $63.06 lifetime spent

**Campaigns (All PAUSED):**
- Week 1 — $30 Offer A/B Tests
- Uncle May's - Website Retargeting
- Uncle May's Sales Campaign
- New Engagement Campaign
- New Sales Campaign

**Recommendation:** Reactivate "Week 1 — $30 Offer A/B Tests" campaign immediately at $30-50/day budget.

---

#### Google Ads
**Status:** API returned 403 Forbidden (likely paused or permissions issue)  
**Config:** Fully authenticated, MCC: 6758950400, Customer: 6015592923  
**Spend (7d):** Unknown (API error)

**Recommendation:** Debug Google Ads API access, check dashboard for active campaigns. If paused, reactivate search campaigns at $20-30/day.

---

#### Email Marketing (Mailchimp)
**Status:** Audience effectively empty  
**Current Subscribers:** 6 (down from 119 after 2026-04-10 cleanup)  
**Last Campaign:** April 10 to investors (not customers), 0.7% open rate, 0.1% click rate

**Problem:** Customers were removed during investor cleanup and have not been re-imported from Stripe.

**Recommendation:** 
1. Export all completed Stripe customers (email + name)
2. Re-import to Mailchimp audience
3. Launch reorder campaign ("Your next box is ready")

---

#### Organic Social
**Status:** No recent activity  
**Traffic:** 0 sessions from social in last 24h

**Recommendation:** Resume Instagram/Facebook organic posting at 2-3x/week minimum. Share behind-the-scenes, product highlights, customer testimonials.

---

### 4. Apollo Investor Outreach Status

**Tier 1 Campaign (ACTIVE ✅):**
- 87 contacts, 70 delivered, 2 opens (2.9%), 1 reply (1.4%)
- Sending from anthony@ at 10/day

**Tier 2 Campaigns (3 of 4 ACTIVE ⚠️):**
- Tier 2A (Denise): 149 contacts, 69 delivered, 0 opens
- Tier 2B (Rosalind): 148 contacts, 73 delivered, 0 opens
- **Tier 2C (Invest): ❌ BROKEN — 149 contacts, 0 sent, NO EMAIL ACCOUNT LINKED**
- Tier 2D (TimJ): 149 contacts, 31 delivered, 0 opens

**Tier 2C Fix Required:**
1. Go to Apollo Settings > Email Accounts
2. Re-authenticate invest@unclemays.com Gmail OAuth
3. Go to Tier 2C campaign settings, re-add invest@ as sender
4. Campaign will resume automatically

**CRE Campaign (ACTIVE ✅):**
- 20 contacts, 18 delivered, 1 bounce (5.6%)
- Sending from investmentrelations@

---

## Action Plan

### URGENT (Next 24 Hours)

#### 1. Fix Tier 2C Apollo Campaign (invest@ account)
**Owner:** Anthony (manual UI action required)  
**Steps:**
1. Log into Apollo.io
2. Go to Settings > Email Accounts
3. Click "Re-authenticate" for invest@unclemays.com
4. Accept Gmail OAuth permissions
5. Go to Tier 2C campaign settings
6. Re-add invest@ as sender email
7. Verify campaign shows "Active" with sends scheduled

**Expected Impact:** +149 investor contacts back in outreach rotation

---

#### 2. Reactivate Meta Ads
**Owner:** Advertising Creative (with CRO budget approval)  
**Campaign:** "Week 1 — $30 Offer A/B Tests" (already exists, just paused)  
**Budget:** $30-50/day ($210-350/week)  
**Target:** Local Chicago audience (Hyde Park + South Side)  
**Creative:** Use existing variants or request new batch from Advertising Creative  
**UTM:** `?utm_source=facebook&utm_medium=cpc&utm_campaign=week1-ab-test`

**Expected Impact:** +30-40 sessions/day, 10-12 orders/week (@ 30% conversion)

**Approval Required:** Board must approve ad spend before activation

---

#### 3. Re-Import Stripe Customers to Mailchimp
**Owner:** RevOps  
**Steps:**
1. Export all Stripe customers with `subscriptions.data.length > 0` OR `charges.data.length > 0`
2. Format as CSV: email, first_name, last_name, total_spent, last_order_date
3. Import to Mailchimp audience (list ID: `2645503d11`)
4. Tag as "Customers" to separate from investors/stakeholders

**Expected Audience Size:** ~100-150 customers (based on 3 recent orders + historical data)

---

### HIGH PRIORITY (This Week)

#### 4. Launch Customer Reorder Email Campaign
**Owner:** RevOps (or /newsletter skill)  
**Audience:** Mailchimp customers (after re-import)  
**Subject:** "Your next box is ready — Thursday delivery"  
**Offer:** "COMEBACK20" promo code for 20% off  
**Send:** Tuesday 10am (optimal for Thursday delivery)

**Expected Impact:** +15-20 orders (10-15% reorder rate from 100-150 customers)

---

#### 5. Activate Google Ads (if available)
**Owner:** CRO (debug API + activate campaigns)  
**Budget:** $20-30/day ($140-210/week)  
**Campaign Type:** Search (keywords: "produce delivery Chicago", "Black-owned grocery", "fresh produce box")  
**UTM:** `?utm_source=google&utm_medium=cpc&utm_campaign=search-chicago`

**Expected Impact:** +15-20 sessions/day, 5-7 orders/week

---

#### 6. Resume Organic Social Posting
**Owner:** CMO/Marketing Agent (if available)  
**Frequency:** 2-3 posts/week  
**Platforms:** Instagram, Facebook  
**Content:** Behind-the-scenes, product highlights, customer stories, delivery day photos  
**Goal:** Build brand awareness, drive direct traffic

**Expected Impact:** +5-10 sessions/day (low immediate conversion, high long-term brand value)

---

### MEDIUM PRIORITY (Next 2 Weeks)

#### 7. Launch Abandoned Cart Recovery
**Owner:** RevOps  
**Audience:** 97 expired Stripe checkout sessions from April 7-14  
**Message:** "You left a box in your cart — complete your order for Thursday delivery"  
**Offer:** "COMPLETE10" for 10% off  
**Channel:** Email (if available) or manual outreach

**Expected Impact:** +10-15 orders (10-15% recovery rate)

---

#### 8. Set Up Conversion Tracking & Attribution
**Owner:** RevOps  
**Tasks:**
- Add UTM parameters to all paid ad links
- Set up GA4 conversion events (checkout start, checkout complete)
- Create attribution report (which channel drives orders)
- Daily dashboard for CRO

**Expected Impact:** Better budget allocation, 10-15% efficiency gain

---

## Financial Projections

### Scenario 1: Do Nothing (Baseline)
- **Traffic:** 15 sessions/day (current)
- **Conversion:** 30% (post-checkout fix)
- **Orders/Week:** 30 sessions × 30% = 9 orders
- **Revenue/Week:** 9 × $50 avg = $450
- **Miss vs Target:** 70% shortfall

### Scenario 2: Reactivate Meta Ads Only
- **Traffic:** 15 baseline + 35 Meta = 50 sessions/day
- **Conversion:** 30%
- **Orders/Week:** 105 sessions × 30% = 31 orders
- **Revenue/Week:** 31 × $50 = $1,550
- **Ad Spend/Week:** $350 (at $50/day)
- **Net Revenue:** $1,200/week
- **Hit Target:** ✅ 30 orders/week

### Scenario 3: Full Multi-Channel Activation
- **Traffic:** 15 baseline + 35 Meta + 20 Google + 15 Email + 10 Social = 95 sessions/day
- **Conversion:** 32% (with optimization)
- **Orders/Week:** 190 sessions × 32% = 61 orders
- **Revenue/Week:** 61 × $50 = $3,050
- **Ad Spend/Week:** $560 (Meta $350 + Google $210)
- **Net Revenue:** $2,490/week
- **Exceed Target:** ✅ 203% of goal

---

## Metrics to Monitor (Daily)

| Metric | Current | Target (Week 1) | Target (Week 4) |
|--------|---------|-----------------|-----------------|
| Sessions/Day | 15 | 50 | 95 |
| Checkout Starts/Day | ~7 | 15 | 30 |
| Checkout Completion Rate | 3% | 30% | 35% |
| Orders/Day | 0 | 3-4 | 8-9 |
| Orders/Week | 0 | 21-28 | 56-63 |
| Revenue/Week | $0 | $1,050-1,400 | $2,800-3,150 |
| CAC (Cost/Order) | N/A | $15-20 | $10-15 |
| ROAS (Revenue/Ad Spend) | N/A | 3.0x | 4.5x |

---

## Immediate Next Steps (CRO Decision Required)

1. **Fix Tier 2C Apollo Campaign** → Anthony manual action (15 min)
2. **Approve Meta Ads Budget** → Board approval required ($30-50/day = $210-350/week)
3. **Re-Import Stripe Customers to Mailchimp** → RevOps execution (30 min)
4. **Launch Reorder Email Campaign** → RevOps execution (1 hour)
5. **Debug Google Ads API + Check Dashboard** → CRO investigation (30 min)

**Total Time to First Revenue Impact:** 2-3 hours of work + board approval

**Expected Outcome:** 30+ orders/week within 7 days, hitting revenue target.

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Checkout fix doesn't improve conversion | High | Monitor 24h metrics, investigate additional UX issues |
| Ad spend doesn't convert | Medium | Start with $30/day, monitor ROAS daily, kill if <2.0x after 3 days |
| Email list too small (<50 customers) | Medium | Focus on paid ads + organic, build email list over time |
| Board doesn't approve ad spend | High | Pivot to organic-only (social + email), slower growth path |
| Google Ads account restricted | Low | Meta + Email can hit target alone |

---

**FINAL RECOMMENDATION:**

Execute Scenario 2 (Meta Ads Only) immediately. This is the **minimum viable action** to hit 30 orders/week target with:
- ✅ Single channel activation (simpler execution)
- ✅ Proven channel (Meta historical data exists)
- ✅ Board approval easier (lower budget ask)
- ✅ Fast time-to-revenue (ads live in <24h)

Once Scenario 2 validates at 30+ orders/week, scale to Scenario 3 for 60+ orders/week and build multi-channel resilience.

---

**STATUS:** Awaiting CRO decision on ad spend authorization. RevOps ready to execute all non-ad tasks immediately.
