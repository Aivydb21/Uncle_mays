# Manual Upload: Google Ads Performance Max Campaign
**Task:** UNC-358  
**Deadline:** 6pm CT today (Apr 17)  
**Time Required:** 30 minutes  
**Campaign Budget:** $20/day Performance Max + $10/day Search

---

## What You're Uploading

**Location:** `ad-exports/subscription-launch-apr17/static-images/`

**Performance Max images (15 total):**
- 5 landscape (1200x628): Files starting with `pmax_landscape_*`
- 5 square (1080x1080): Files starting with `pmax_square_*`
- 5 portrait (1080x1350): Files starting with `pmax_portrait_*`

---

## Step 1: Create Performance Max Campaign (10 min)

1. Go to https://ads.google.com
2. Select account **6015592923** (Uncle May's Produce operating account)
3. Click **Campaigns** > **+ New Campaign**
4. Select goal: **Sales** (or **Leads** if Sales not available)
5. Campaign type: **Performance Max**
6. Click **Continue**

**Campaign Settings:**
- Campaign name: `Uncle May's Produce - Performance Max - Apr 2026`
- Budget: **$20/day**
- Bidding: **Maximize conversions** (default)
- Start date: **Today (Apr 17)**
- End date: **Leave blank** (continuous)
- Click **Next**

---

## Step 2: Create Asset Group (15 min)

### Asset Group Name
- Name: `Subscription Launch - Apr 2026`

### Final URL
```
https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP
```

### Upload Images (15 images)

Click **+ Upload images** and select all 15 files from `ad-exports/subscription-launch-apr17/static-images/`:

**Landscape (1200x628):**
1. pmax_landscape_cultural_1200x628.png
2. pmax_landscape_hero_value_1200x628.png
3. pmax_landscape_offer_1200x628.png
4. pmax_landscape_social_proof_1200x628.png
5. pmax_landscape_subscription_1200x628.png

**Square (1080x1080):**
6. pmax_square_blackowned_1080x1080.png
7. pmax_square_cultural_1080x1080.png
8. pmax_square_price_anchor_1080x1080.png
9. pmax_square_product_hero_1080x1080.png
10. pmax_square_subscription_value_1080x1080.png

**Portrait (1080x1350):**
11. pmax_portrait_cultural_pride_1080x1350.png
12. pmax_portrait_mobile_hero_1080x1350.png
13. pmax_portrait_offer_1080x1350.png
14. pmax_portrait_subscription_simplicity_1080x1350.png
15. pmax_portrait_value_stack_1080x1350.png

---

### Add Headlines (Max 30 characters each)

Copy/paste these 5 headlines exactly:

1. `Fresh Produce, Delivered Weekly`
2. `Black-Owned Grocery, Chicago`
3. `Subscribe From $30/Week`
4. `Premium Greens, Weekly`
5. `Join 500+ Chicago Families`

---

### Add Long Headlines (Max 90 characters each)

Copy/paste these 5 long headlines exactly:

1. `Subscribe to Chicago's #1 Produce Box for Black Families`
2. `Fresh Greens, Okra, Yams Delivered Every Week`
3. `Black-Owned, Chicago-Based, Culturally Specific Produce`
4. `From $30/Week, Cancel Anytime, First Box This Wednesday`
5. `Premium Produce Subscription for Hyde Park Families`

---

### Add Descriptions (Max 90 characters each)

Copy/paste these 5 descriptions exactly:

1. `Premium produce boxes for Black families. Greens, okra, yams, and more.`
2. `Subscription grocery from Black farmers. Delivered every Wednesday.`
3. `Skip the store. Get restaurant-quality produce at home.`
4. `Started by a Chicago Booth grad, trusted by Hyde Park.`
5. `The produce box you've been looking for. Subscribe in 2 minutes.`

---

### Business Name
```
Uncle May's Produce
```

### Call-to-Action
Select: **Subscribe**

---

## Step 3: Review and Launch

1. Review all assets (15 images, 5 headlines, 5 long headlines, 5 descriptions)
2. **Campaign status:** Set to **PAUSED** if you want to review before spending
3. **OR:** Set to **ENABLED** to launch immediately
4. Click **Publish Campaign**

---

## Step 4: Create Google Search Campaign (5 min)

1. Click **Campaigns** > **+ New Campaign**
2. Select goal: **Sales** (or **Leads**)
3. Campaign type: **Search**
4. Click **Continue**

**Campaign Settings:**
- Campaign name: `Uncle May's Produce - Search - Branded - Apr 2026`
- Budget: **$10/day**
- Bidding: **Maximize conversions**
- Networks: **Google Search only** (uncheck Search partners and Display Network)
- Start date: **Today (Apr 17)**
- Click **Save and Continue**

### Create Ad Group

**Ad Group Name:** `Branded Keywords`

**Keywords (exact match, add brackets):**
```
[uncle may's produce]
[uncle mays produce]
[uncle may's chicago]
[uncle may's produce box]
```

**Ad Headline 1:** `Uncle May's Produce Box`  
**Ad Headline 2:** `Black-Owned Grocery Chicago`  
**Ad Headline 3:** `Subscribe From $30/Week`  
**Description 1:** `Premium produce boxes for Black families. Delivered every Wednesday.`  
**Description 2:** `Chicago Booth founded. Trusted by 500+ Hyde Park families.`  
**Final URL:**
```
https://unclemays.com?utm_source=google&utm_medium=search&utm_campaign=branded_apr2026&promo=FREESHIP
```

Click **Save** and **Publish Campaign**.

---

## Success Checklist

- [ ] Performance Max campaign created with 15 images
- [ ] All 5 headlines, 5 long headlines, 5 descriptions added
- [ ] Budget set to $20/day
- [ ] UTM parameters added to final URL
- [ ] Search campaign created with branded keywords
- [ ] Budget set to $10/day
- [ ] Both campaigns set to ENABLED (or PAUSED for review)

---

## Verification (After Launch)

1. Wait 1 hour for campaigns to start serving
2. Check Google Ads dashboard for impressions/clicks
3. Check GA4 for traffic with utm_source=google
4. Test a click on your ad to verify FREESHIP promo code works in checkout

---

## Troubleshooting

**Images rejected?**
- Check image specs: Landscape 1200x628, Square 1080x1080, Portrait 1080x1350
- No text-heavy images (Google has 20% text limit for some placements)

**Campaign not serving?**
- Check payment method is valid
- Check account is not suspended
- Performance Max can take 24-48 hours to ramp up (this is normal)

**Need help?**
- Slack the CRO or post in UNC-358 Paperclip thread

---

**Next:** Upload Meta ads (see `MANUAL-UPLOAD-META-ADS.md`)
