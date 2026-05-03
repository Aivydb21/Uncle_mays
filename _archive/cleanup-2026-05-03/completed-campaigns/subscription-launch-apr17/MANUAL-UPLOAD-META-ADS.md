# Manual Upload: Meta Ads (Facebook/Instagram)
**Task:** UNC-358  
**Deadline:** 6pm CT today (Apr 17)  
**Time Required:** 20 minutes  
**Campaign Budget:** $67/day ($469/week)

**Why Manual:** Meta API token invalid (error 190/460). Manual upload is faster than debugging API auth.

---

## What You're Uploading

**Location:** `ad-exports/subscription-launch-apr17/static-images/`

**Meta images (10 total):**
- 5 Feed images (1080x1080 square): Files starting with `meta_feed_*`
- 5 Story images (1080x1920 vertical): Files starting with `meta_story_*`

---

## Step 1: Create Advantage+ Shopping Campaign (15 min)

1. Go to https://business.facebook.com/adsmanager
2. Select Uncle May's Produce ad account
3. Click **+ Create** (green button)

### Campaign Setup

**Campaign Objective:**
- Select **Sales** (under "Conversions")
- Click **Continue**

**Campaign Name:**
```
Uncle May's Produce - Advantage+ Shopping - Apr 2026
```

**Buying Type:** Auction (default)

**Campaign Details:**
- **Advantage campaign budget:** Toggle ON
- **Daily budget:** $67 USD
- Click **Next**

---

## Step 2: Ad Set Setup

**Ad Set Name:**
```
Subscription Launch - Chicago - Apr 2026
```

**Performance Goal:**
- Select **Maximize number of conversions**
- Conversion event: **Purchase** (if pixel is set up) OR **Lead** (if not)

**Budget & Schedule:**
- Daily budget: $67 (already set at campaign level)
- Start date: **Today (Apr 17)**
- End date: **Leave blank** (continuous)

**Audience:**
- **Location:** United States > Illinois > Chicago
  - **Detailed targeting:** Add radius around Hyde Park (zip 60615)
  - **OR:** Target these zips: 60615, 60637, 60653, 60649 (Hyde Park, Woodlawn, Kenwood, South Shore)
- **Age:** 25-45 (wider than beachhead to test)
- **Gender:** All (but will skew toward women based on creative/product)
- **Detailed Targeting (optional):** Interests in "Organic Food", "Whole Foods Market", "Healthy Eating"

**Placements:**
- Select **Advantage+ placements** (recommended) — lets Meta optimize
- **OR:** Manual placements: Feed, Stories, Reels (Instagram + Facebook)

**Optimization & Delivery:**
- Click **Next**

---

## Step 3: Create Ads (Upload Images)

### Ad Name
```
Subscription Launch - Apr 2026 - Image Variants
```

### Identity
- Facebook Page: **Uncle May's Produce**
- Instagram Account: **@unclemaysproduce** (if connected)

### Ad Setup

**Format:** Single image or carousel (start with single image, create 10 ad variants)

**You need to create 10 separate ads** (Meta doesn't batch-upload images like Google). Here's the flow for each:

1. Click **+ Add Creative** > **Create Ad**
2. Click **Add Media** > **Upload Image**
3. Select ONE image from `ad-exports/subscription-launch-apr17/static-images/`
4. Add **Primary Text**, **Headline**, **Description** (see copy below)
5. Click **Publish** to create the ad
6. Repeat 10 times (one for each image)

---

## Ad Copy by Image

### Feed Images (1080x1080)

**Image 1:** `meta_feed_chicago_families_1080x1080.png`
- **Primary Text:** "Join 500+ Chicago families who get fresh, culturally specific produce delivered every week. No grocery store lines, no searching for good greens. Just quality, convenience, and community."
- **Headline:** "Chicago's #1 Produce Box"
- **Description:** "From $30/week. Subscribe today."

**Image 2:** `meta_feed_farm_to_table_1080x1080.png`
- **Primary Text:** "We source from Black farmers. You get restaurant-quality greens, okra, yams, and more. Delivered every Wednesday to your Hyde Park door."
- **Headline:** "Farm-to-Table, Culture-Forward"
- **Description:** "Black-owned. Chicago-based."

**Image 3:** `meta_feed_grandmas_greens_1080x1080.png`
- **Primary Text:** "Remember how your grandma's greens tasted? That's what we deliver. Collards, okra, sweet potatoes that actually taste like home."
- **Headline:** "Your Grandma's Greens, Delivered"
- **Description:** "Subscribe from $30/week."

**Image 4:** `meta_feed_whats_in_box_1080x1080.png`
- **Primary Text:** "This week's Community Box ($55): Collard greens, okra, heirloom tomatoes, sweet potatoes, fresh herbs. Delivered Wednesday. Cancel anytime."
- **Headline:** "What's in This Week's Box"
- **Description:** "See all subscription tiers."

**Image 5:** `meta_feed_zero_hassle_1080x1080.png`
- **Primary Text:** "I used to spend 2 hours at Whole Foods every week. Now Uncle May's shows up at my door. Fresh, quality, zero hassle."
- **Headline:** "Premium Produce, Zero Hassle"
- **Description:** "Start your subscription today."

---

### Story Images (1080x1920)

**Image 6:** `meta_story_blackowned_1080x1920.png`
- **Primary Text:** "Black-owned, Chicago Booth founded, trusted by Hyde Park. We're building the grocery store we wish existed."
- **Headline:** "Support Black-Owned"
- **Description:** "Subscribe in 2 minutes."

**Image 7:** `meta_story_convenience_1080x1920.png`
- **Primary Text:** "Set it and forget it. Fresh produce every week, no reordering, no driving to 3 stores to find good okra."
- **Headline:** "Convenience + Quality"
- **Description:** "Join 500+ families."

**Image 8:** `meta_story_cultural_1080x1920.png`
- **Primary Text:** "Produce picked for Black families. Greens that look like what your mom used to buy. Okra that doesn't disappoint."
- **Headline:** "Culturally Specific Produce"
- **Description:** "From $30/week."

**Image 9:** `meta_story_offer_1080x1920.png`
- **Primary Text:** "Free delivery on your first box with code FREESHIP. Subscribe today, get your first delivery this Wednesday."
- **Headline:** "Free Delivery This Week"
- **Description:** "Use code FREESHIP."

**Image 10:** `meta_story_subscription_value_1080x1920.png`
- **Primary Text:** "I thought $55/week was expensive until I saw what I was getting. Restaurant-quality produce, delivered. I'm never going back to the grocery store."
- **Headline:** "Restaurant-Quality, Delivered"
- **Description:** "Subscribe now."

---

### Destination & Call-to-Action

**For ALL 10 ads:**

**Website URL:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&promo=FREESHIP
```

**Call-to-Action Button:** **Shop Now** (or **Subscribe** if available)

---

## Step 4: Review and Publish

1. Review all 10 ad creatives (images + copy)
2. Check budget: $67/day
3. Check placements: Feed, Stories, Reels
4. Check UTM tracking is in all URLs
5. **Campaign status:** ACTIVE (launch immediately)
6. Click **Publish**

---

## Success Checklist

- [ ] Advantage+ Shopping Campaign created
- [ ] 10 ad variants uploaded (5 Feed, 5 Story)
- [ ] All ad copy added (primary text, headline, description)
- [ ] Budget set to $67/day
- [ ] UTM parameters in all URLs (?utm_source=facebook&utm_medium=paid_social...)
- [ ] Call-to-action button set to "Shop Now"
- [ ] Campaign status set to ACTIVE

---

## Verification (After Launch)

1. Wait 30 minutes for ads to enter review
2. Check Ads Manager for ad approval status (should be approved within 24h)
3. Once approved, wait 1 hour for delivery to start
4. Check Meta Pixel events firing (see `TRACKING-VERIFICATION.md`)
5. Check GA4 for traffic with utm_source=facebook
6. Test FREESHIP promo code in Stripe checkout

---

## Troubleshooting

**Ads rejected?**
- Common reasons: Misleading claims, before/after images, personal attributes
- Uncle May's ads should be fine (no health claims, no personal targeting language)
- If rejected, check rejection reason in Ads Manager and request review

**Campaign not delivering?**
- Check payment method is valid
- Check pixel is installed (required for conversion campaigns)
- Advantage+ can take 24 hours to ramp up (this is normal)

**Low delivery?**
- If Chicago audience is too small, expand to: Cook County, IL (includes all of Chicago + suburbs)
- OR: Expand age range to 18-55
- OR: Remove detailed interest targeting

**Need help?**
- Slack the CRO or post in UNC-358 Paperclip thread

---

**Next:** Verify tracking (see `TRACKING-VERIFICATION.md`)
