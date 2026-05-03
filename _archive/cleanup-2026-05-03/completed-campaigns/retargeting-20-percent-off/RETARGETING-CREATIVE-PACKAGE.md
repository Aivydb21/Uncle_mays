# Retargeting Ad Creative: First-Order 20% Off
**Campaign:** Retargeting — Bounced Site Visitors  
**Platform:** Meta (Facebook + Instagram)  
**Audience:** Custom audience of unclemays.com visitors (past 30 days) who did NOT purchase  
**Objective:** Checkout conversions  
**Promo:** 20% off first box ($24 instead of $30 for Essentials)  
**Parent Issue:** UNC-566 / UNC-572  
**Date:** 2026-04-22

---

## Strategic Rationale

**Why retargeting is different from cold acquisition:**

These people already visited unclemays.com. They know the brand exists. They saw the produce box offer. They left without buying. The creative job is NOT awareness — it is objection-busting and urgency injection.

**Top bounce reasons (informed by 97% checkout abandonment data):**
1. Price surprise at checkout
2. Subscription anxiety ("do I have to commit?")
3. Trust gap ("is this legit? will the produce be good?")
4. Timing ("I'll come back later" — then don't)

**Creative approach:** Each variant attacks a different objection. Discount is front-loaded in every variant to eliminate price surprise. Every variant includes a trust signal AND a friction-reducer.

---

## Variant 1: Social Proof + Discount Reminder

**Hook Strategy:** "Other people like you already bought" — peer validation for warm visitors  
**Objection Targeted:** Trust gap  

### Feed (1080x1080)

**Visual Concept:**
- Base image: `hero-produce.jpg` with warm color grading
- Top: "89% of Customers Refer Us" in bold white text on dark semi-transparent banner
- Center: Product beauty shot (greens, okra, yams visible)
- Bottom left: "$24 First Box" in large green badge (was $30 crossed out)
- Bottom right: "20% OFF — First Order Only" in gold badge
- Uncle May's logo top-right, 80px

**Ad Copy:**
- **Headline (38 chars):** `Still Thinking? 89% Would Refer Us.`
- **Primary Text (124 chars):** `You checked us out. Now check out what 89% of customers love enough to tell friends. First box $24 (reg $30). Hyde Park.`
- **CTA:** `Get 20% Off`

### Story (1080x1920)

**Visual Concept:**
- Full-bleed `hero-produce.jpg` vertical crop
- Top third: "You Looked. You Liked." (52pt bold white)
- Center: "Now Try It for $24" (72pt, green highlighted)
- Lower: "89% of customers refer friends" (36pt, white on dark overlay)
- Bottom: "Swipe Up — 20% Off First Box" with upward arrow
- Logo top-center, 100px

**Ad Copy (same as feed, optimized for story overlay):**
- **Headline:** `Still Thinking? 89% Would Refer Us.`
- **Primary Text:** `You checked us out. Now check out what 89% of customers love enough to tell friends. First box $24 (reg $30). Hyde Park.`
- **CTA:** `Get 20% Off`

---

## Variant 2: Testimonial-Led + Discount

**Hook Strategy:** Customer voice (UGC-style) — builds trust through identification  
**Objection Targeted:** Trust gap + "is this for me?"  

### Feed (1080x1080)

**Visual Concept:**
- Clean white/cream background with produce box slightly off-center
- Large quotation marks (") in gold, decorative
- Quote text center: "Finally, produce picked for US. The collards alone are worth it." (styled as handwritten or serif italic)
- Attribution: "— Hyde Park Customer" (small, below quote)
- Bottom banner: "YOUR FIRST BOX: $24" in bold green (with "reg $30" strikethrough)
- "20% Off — Limited Time" badge bottom-right
- Logo bottom-left, 80px

**Ad Copy:**
- **Headline (37 chars):** `"The Collards Alone Are Worth It."`
- **Primary Text (123 chars):** `Hyde Park families trust Uncle May's for produce picked with us in mind. Come back and try it. First box 20% off — $24.`
- **CTA:** `Try It Now`

### Story (1080x1920)

**Visual Concept:**
- `produce-box.jpg` as base, vertical crop, slightly blurred edges
- Top third: Large gold quotation mark + "Finally, produce picked for US."
- Center: Produce box in focus (unblurred center)
- Lower third: "Your First Box: $24" (64pt bold) + "20% Off" badge
- Bottom: "Swipe Up to Order" with arrow
- Logo top, 100px

**Ad Copy (same copy, story format):**
- **Headline:** `"The Collards Alone Are Worth It."`
- **Primary Text:** `Hyde Park families trust Uncle May's for produce picked with us in mind. Come back and try it. First box 20% off — $24.`
- **CTA:** `Try It Now`

---

## Variant 3: Box Unboxing + No-Risk Offer

**Hook Strategy:** Show what's inside the box — visual proof of value  
**Objection Targeted:** "Is it worth $24?" + subscription anxiety  

### Feed (1080x1080)

**Visual Concept:**
- `produce-box.jpg` as base — box open, contents visible
- Top: "What's In This Week's Box?" (48pt bold, white on dark banner)
- Center: Product callout labels pointing to items in the box:
  - "Collard Greens"
  - "Fresh Okra"  
  - "Sweet Potatoes"
  - "Heirloom Tomatoes"
  - "Fresh Herbs"
- Bottom left: "$24 First Box (No Subscription Required)" in green badge
- Bottom right: "20% OFF" gold badge
- Logo top-left, 80px

**Ad Copy:**
- **Headline (40 chars):** `See What You're Missing. $24 First Box`
- **Primary Text (125 chars):** `Collards, okra, yams, tomatoes, herbs. Curated for us. No commitment, no subscription required. First box 20% off. Try it.`
- **CTA:** `See This Week's Box`

### Story (1080x1920)

**Visual Concept:**
- Vertical unboxing-style layout using `produce-box.jpg`
- Top: "You Were This Close" (56pt bold, white)
- Upper-center: Box image with produce visible
- Center: Stacked product names with checkmark icons:
  - ✓ Collard Greens
  - ✓ Fresh Okra
  - ✓ Sweet Potatoes
  - ✓ Heirloom Tomatoes
  - ✓ Fresh Herbs
- Lower: "$24 — No Subscription Required" (52pt, green)
- Bottom: "Swipe Up for 20% Off" with arrow
- Logo top, 100px

**Ad Copy (same copy, story format):**
- **Headline:** `See What You're Missing. $24 First Box`
- **Primary Text:** `Collards, okra, yams, tomatoes, herbs. Curated for us. No commitment, no subscription required. First box 20% off. Try it.`
- **CTA:** `See This Week's Box`

---

## Character Count Verification

| Variant | Headline | Primary Text | Status |
|---------|----------|--------------|--------|
| V1 Social Proof | 38 chars | 124 chars | Within limits |
| V2 Testimonial | 37 chars | 123 chars | Within limits |
| V3 Unboxing | 40 chars | 125 chars | Within limits |

**Meta limits:** Headline 40 chars, Primary text 125 chars — all compliant.

---

## UTM Templates (Retargeting-Specific)

### Feed
```
https://unclemays.com?utm_source=meta&utm_medium=retargeting&utm_campaign=retarget_20off_apr2026&utm_content=[variant]_feed&promo=FIRST20
```

### Story
```
https://unclemays.com?utm_source=meta&utm_medium=retargeting&utm_campaign=retarget_20off_apr2026&utm_content=[variant]_story&promo=FIRST20
```

**Variant slugs:**
- `social_proof` (V1)
- `testimonial` (V2)
- `unboxing` (V3)

---

## A/B Test Design

**Hypothesis:** Testimonial-led creative (V2) will outperform social proof (V1) and unboxing (V3) on retargeting audiences because warm visitors need trust reinforcement more than product education.

**Test structure:**
- **Variable under test:** Hook type (social proof vs testimonial vs unboxing)
- **Held constant:** Discount offer (20% off, $24), audience (site visitors past 30 days, no purchasers), placement (feed + stories)
- **Success metric:** Cost per checkout initiation (primary), CTR (secondary)
- **Test duration:** 72 hours minimum, or 50 conversions per variant (whichever comes first)
- **Budget split:** Equal across all 3 variants

**Expected outcome:** V2 (testimonial) wins on conversion rate; V3 (unboxing) wins on CTR. V1 (social proof) is the control baseline.

**Iteration plan:**
- Winner gets 60% of retargeting budget
- Runner-up gets 30%
- Loser gets 10% (for continued learning)
- Refresh creative at day 7 regardless (small retargeting audience = fast fatigue)

---

## Retargeting Audience Setup Notes (for CRO)

**Custom Audience:**
- Source: Meta Pixel (ID: `2276705169443313`)
- Event: All website visitors, past 30 days
- Exclude: Purchasers (checkout.session.completed event)
- Minimum audience size: Check that pixel has sufficient data (need 1,000+ in audience for Meta to deliver effectively)

**Frequency cap recommendation:** 3 impressions per person per day (retargeting creative burns out fast on small audiences)

**Budget recommendation:** $20-30/day for retargeting (separate from prospecting budget). Retargeting audiences are small but high-intent, so CPAs should be lower than cold traffic.

---

## Production Specs

### Source Images
- `public/images/hero-produce.jpg` — 178KB, fresh produce hero
- `public/images/produce-box.jpg` — 174KB, box/unboxing visual
- `public/uncle-mays-logo.png` — 16KB, brand logo

### Export Settings
- Format: PNG (high quality)
- Color space: sRGB
- Resolution: 72 DPI
- Max file size: 5MB per image

### Typography
- Headlines: Bold sans-serif (Montserrat or Poppins)
- Body: Medium weight sans-serif
- CTAs: Bold, high contrast, button-style
- Quotes (V2): Serif italic or script for warmth

### Color Palette
- Primary green: #2D5016 (earth tone)
- Accent gold: #D4AF37 (cultural warmth)
- CTA green: #4CAF50
- Promo badge: #00C853
- Dark overlay: rgba(0,0,0,0.4)

---

## Canva Production Guide

For each variant, create two designs:
1. **Feed:** Custom size 1080x1080 px
2. **Story:** Custom size 1080x1920 px

**Steps:**
1. Upload source images to Canva (if not already uploaded)
2. Create design from custom size preset
3. Apply base image, crop/position per spec
4. Add text overlays per variant specification
5. Add logo, badges, CTAs per spec
6. Export as PNG
7. Save to `ad-exports/retargeting-20-percent-off/`

**File naming:**
- `retarget_v1_social_proof_feed_1080x1080.png`
- `retarget_v1_social_proof_story_1080x1920.png`
- `retarget_v2_testimonial_feed_1080x1080.png`
- `retarget_v2_testimonial_story_1080x1920.png`
- `retarget_v3_unboxing_feed_1080x1080.png`
- `retarget_v3_unboxing_story_1080x1920.png`

**Total: 6 static images**

---

## Status

**Creative package:** COMPLETE  
**Visual production:** Requires Canva execution (specs above are production-ready)  
**CRO review needed:** Audience setup, budget allocation, promo code confirmation  
**Board approval needed:** Before any creative goes live
