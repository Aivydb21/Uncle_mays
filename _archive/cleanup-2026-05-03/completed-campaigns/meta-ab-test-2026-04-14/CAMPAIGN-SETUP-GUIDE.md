# Meta A/B Test Campaign Setup Guide

**Status:** Ready for CRO activation  
**Launch Date:** 2026-04-14 at 9:00 AM CST  
**Budget:** $50/day ($350 total for 7 days)  
**Ad Account:** act_814877604473301

---

## ✅ Completed: Ad Creative Export

All 15 ad creatives exported and ready for upload:

### Instagram Post (1080x1080)
- `instagram_1080x1080_variant_a.png` — **Direct Offer** hook
- `instagram_1080x1080_variant_b.png` — **Curiosity** hook
- `instagram_1080x1080_variant_c.png` — **Social Proof** hook
- `instagram_1080x1080_variant_d.png` — **Scarcity** hook
- `instagram_1080x1080_variant_e.png` — **Community** hook

### Facebook Ad (1200x628)
- `facebook_1200x628_variant_a.png` — **Direct Offer** hook
- `facebook_1200x628_variant_b.png` — **Curiosity** hook
- `facebook_1200x628_variant_c.png` — **Social Proof** hook
- `facebook_1200x628_variant_d.png` — **Scarcity** hook
- `facebook_1200x628_variant_e.png` — **Community** hook

### Story/Reel (1080x1920)
- `story_1080x1920_variant_a.png` — **Direct Offer** hook
- `story_1080x1920_variant_b.png` — **Curiosity** hook
- `story_1080x1920_variant_c.png` — **Social Proof** hook
- `story_1080x1920_variant_d.png` — **Scarcity** hook
- `story_1080x1920_variant_e.png` — **Community** hook

**Total:** 15 files, 13MB

---

## 📋 Manual Setup Steps (Meta Ads Manager)

### Step 1: Create Campaign

1. Go to Meta Ads Manager → Create Campaign
2. Campaign objective: **Sales** (Conversions)
3. Campaign name: `Produce Box A/B Test — April 2026`
4. Special ad categories: None
5. Campaign budget: **$50/day** (Daily budget optimization)
6. Schedule: Start 2026-04-14 09:00 CST, End 2026-04-20 23:59 CST (7 days)
7. **Status:** Create in PAUSED state initially

### Step 2: Create 3 Ad Sets

Create 3 ad sets (one per format):

#### Ad Set 1: Instagram Post 1080x1080

- **Name:** Instagram Post 1080x1080
- **Conversion location:** Website
- **Pixel:** 2276705169443313 (Uncle May's Produce)
- **Conversion event:** Purchase
- **Budget:** $16.67/day
- **Optimization:** Conversions
- **Bid strategy:** Lowest cost
- **Targeting:**
  - Location: Chicago, IL + 10 mile radius (includes Hyde Park, Bronzeville, Kenwood, South Loop, Woodlawn)
  - Age: 25-35
  - Gender: Women
  - Detailed targeting: 
    - Interests: Organic food, Healthy diet, Local business, Black-owned businesses
    - Household income: Top 25% (approx $50K+)
- **Placements:** Advantage+ placements (automatic), but primarily Instagram Feed
- **Schedule:** Same as campaign (2026-04-14 to 2026-04-20)

#### Ad Set 2: Facebook Ad 1200x628

- **Name:** Facebook Ad 1200x628
- Same settings as Ad Set 1, but placements optimized for Facebook Feed

#### Ad Set 3: Story/Reel 1080x1920

- **Name:** Story/Reel 1080x1920
- Same settings as Ad Set 1, but placements optimized for Instagram Stories/Reels

### Step 3: Upload Images & Create 15 Ads

For each ad set, create 5 ads (one per variant A/B/C/D/E):

#### Instagram Post Ad Set

**Ad 1: Variant A — Direct Offer**
- Image: `instagram_1080x1080_variant_a.png`
- Primary text: "Fresh produce boxes delivered to Hyde Park. $30 for your first order. 🥬"
- Headline: "Get Your First Box"
- Description: "Organic, local, delivered fresh"
- Call to action: Shop Now
- Website URL: `https://unclemays.com?utm_source=meta&utm_medium=paid_social&utm_campaign=produce_box_ab_test&utm_content=instagram_direct_offer`

**Ad 2: Variant B — Curiosity**
- Image: `instagram_1080x1080_variant_b.png`
- Primary text: "What's in the box? Discover fresh, local produce curated for Hyde Park. Order now. 🥕"
- Headline: "Discover What's Fresh"
- Website URL: `https://unclemays.com?utm_source=meta&utm_medium=paid_social&utm_campaign=produce_box_ab_test&utm_content=instagram_curiosity`

**Ad 3: Variant C — Social Proof**
- Image: `instagram_1080x1080_variant_c.png`
- Primary text: "Join 97% of Hyde Park residents who trust Uncle May's for fresh produce. Order today. 🌽"
- Headline: "Join Your Neighbors"
- Website URL: `https://unclemays.com?utm_source=meta&utm_medium=paid_social&utm_campaign=produce_box_ab_test&utm_content=instagram_social_proof`

**Ad 4: Variant D — Scarcity**
- Image: `instagram_1080x1080_variant_d.png`
- Primary text: "Limited slots available this week. Reserve your fresh produce box now. ⏰"
- Headline: "Reserve Your Slot"
- Website URL: `https://unclemays.com?utm_source=meta&utm_medium=paid_social&utm_campaign=produce_box_ab_test&utm_content=instagram_scarcity`

**Ad 5: Variant E — Community**
- Image: `instagram_1080x1080_variant_e.png`
- Primary text: "Fresh produce for us, by us. Supporting Black-owned local food in Hyde Park. 🙌"
- Headline: "Support Local, Eat Fresh"
- Website URL: `https://unclemays.com?utm_source=meta&utm_medium=paid_social&utm_campaign=produce_box_ab_test&utm_content=instagram_community`

#### Facebook Ad Set & Story/Reel Set

Repeat the same 5 variants (A/B/C/D/E) using the corresponding image files and updating UTM content to `facebook_[hook]` and `story_[hook]`.

---

## 🔒 Budget Safety Setup

### Account Spend Limit
1. Go to Account Settings → Billing
2. Set account spending limit: **$55/day** (buffer for overspend protection)

### Auto-Pause Rule (via Automated Rules)
1. Go to Automated Rules → Create Rule
2. Condition: If CPA > $25 for any ad
3. Time range: Last 3 days
4. Action: Pause ad
5. Apply to: All ads in campaign

---

## 📊 UTM Tracking Summary

All ad links include UTM parameters for GA4 tracking:

| Parameter | Value |
|-----------|-------|
| utm_source | `meta` |
| utm_medium | `paid_social` |
| utm_campaign | `produce_box_ab_test` |
| utm_content | `[format]_[hook]` (e.g., `instagram_social_proof`) |

**Format values:** `instagram`, `facebook`, `story`  
**Hook values:** `direct_offer`, `curiosity`, `social_proof`, `scarcity`, `community`

---

## ✅ Pre-Launch Checklist

Before activating campaign on 2026-04-14:

- [ ] All 15 ads uploaded and configured
- [ ] UTM parameters verified on all ad links
- [ ] Meta Pixel firing on unclemays.com/checkout (test with Pixel Helper Chrome extension)
- [ ] Account spending limit set to $55/day
- [ ] Auto-pause rule created for $25 CPA threshold
- [ ] GA4 custom report created for campaign tracking (see reporting section below)
- [ ] Campaign status confirmed as PAUSED
- [ ] Launch scheduled for 2026-04-14 09:00 CST

---

## 📈 Reporting Dashboard (RevOps will set up)

Daily report will track per-variant:
- Impressions
- Clicks
- CTR (Click-through rate)
- CPC (Cost per click)
- Conversions (purchases)
- CPA (Cost per acquisition)

**Alerts:**
- If any variant <0.5% CTR after 48 hours → Pause variant, notify CRO
- If any variant >$20 CPA after 48 hours → Pause variant, notify CRO

**Final report:** 2026-04-21 (Day 8)
- Winner recommendation based on lowest CPA + highest conversion rate
- Scale decision: Move $50/day budget to winning variant if CPA <$15 and CTR >2.5%

---

## 🎯 Success Criteria

| Metric | Target |
|--------|--------|
| CTR | >2.5% |
| CPA | <$15 |
| Conversions (7 days) | ≥5 (statistical significance) |

If winning variant meets all criteria, scale to $50/day on single best-performing variant.

---

## 📞 Contact

**RevOps (this agent):** Campaign setup, reporting, performance monitoring  
**CRO:** Final activation, budget decisions, scale strategy  
**Board:** Approval for budget >$50/day

---

## Meta Account Credentials

- **Ad Account ID:** act_814877604473301
- **Page ID:** 755316477673748 (Uncle May's Produce)
- **Pixel ID:** 2276705169443313
- **Access Token:** Stored in `~/.claude/meta-config.json`

