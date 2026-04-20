# UTM Tagging Standards — Uncle May's Produce
**Created:** 2026-04-14  
**Owner:** RevOps  
**Purpose:** Standard UTM parameters for paid ad campaigns (Meta, Google, email, social)

---

## Standard UTM Structure

All campaign URLs must follow this format:
```
https://unclemays.com?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}
```

---

## UTM Parameters

### utm_source (Traffic Source)
Where the traffic originates.

| Value | When to Use |
|-------|-------------|
| `facebook` | Facebook feed ads, Facebook stories, Facebook video ads |
| `instagram` | Instagram feed ads, Instagram stories, Instagram reels |
| `google` | Google Search ads, Google Display ads, Performance Max |
| `email` | Mailchimp campaigns, transactional emails |
| `organic_social` | Unpaid Instagram/Facebook posts |
| `referral` | Partner websites, press mentions, directories |

**Examples:**
- Meta ad on Facebook feed: `utm_source=facebook`
- Meta ad on Instagram stories: `utm_source=instagram`
- Google Search ad: `utm_source=google`

---

### utm_medium (Traffic Type)
The marketing channel or tactic.

| Value | When to Use |
|-------|-------------|
| `paid_social` | Paid ads on Facebook/Instagram feed |
| `paid_social_stories` | Paid ads in Facebook/Instagram stories |
| `paid_search` | Google Search text ads |
| `display` | Google Display Network banner ads |
| `pmax` | Google Performance Max campaigns |
| `email` | Email campaigns (newsletters, abandoned cart) |
| `retargeting` | Remarketing ads (Meta or Google) |
| `organic` | Unpaid social posts |
| `referral` | External link from partner site |

**Examples:**
- Instagram feed ad: `utm_medium=paid_social`
- Instagram story ad: `utm_medium=paid_social_stories`
- Google Search ad: `utm_medium=paid_search`
- Abandoned cart email: `utm_medium=email`

---

### utm_campaign (Campaign Name)
The specific marketing initiative.

**Format:** `{goal}_{timeframe}_{variant}`

| Component | Description | Examples |
|-----------|-------------|----------|
| **goal** | Campaign objective | `conversion`, `awareness`, `retarget`, `recovery` |
| **timeframe** | Launch period | `apr21`, `q2`, `week17` |
| **variant** | A/B test version | `v1`, `v2`, `premium`, `family` |

**Campaign Naming Examples:**

| Campaign | utm_campaign Value |
|----------|-------------------|
| Customer acquisition launch (April 21) | `conversion_apr21` |
| Abandoned cart recovery | `recovery` |
| Retargeting website visitors | `retarget_apr21` |
| Brand awareness test | `awareness_q2` |
| Premium box promo | `conversion_apr21_premium` |

**Examples:**
- Launch campaign: `utm_campaign=conversion_apr21`
- Cart recovery: `utm_campaign=recovery`
- Retargeting: `utm_campaign=retarget_apr21`

---

### utm_content (Creative Variant)
The specific ad creative or link placement.

**Format:** `{hook}_{format}_{size}`

| Component | Description | Examples |
|-----------|-------------|----------|
| **hook** | Message angle | `quality`, `heritage`, `delivery`, `price` |
| **format** | Ad format | `image`, `video`, `carousel`, `collection` |
| **size** | Variant number | `1`, `2`, `3` |

**Creative Naming Examples:**

| Ad Creative | utm_content Value |
|-------------|------------------|
| "Quality produce" image ad #1 | `quality_image_1` |
| "Heritage" video ad #2 | `heritage_video_2` |
| "Fast delivery" carousel ad #3 | `delivery_carousel_3` |
| Email: Header CTA button | `header_cta` |
| Email: Footer product link | `footer_product` |

**Examples:**
- Image ad with quality hook: `utm_content=quality_image_1`
- Video ad with heritage hook: `utm_content=heritage_video_2`
- Email CTA button: `utm_content=header_cta`

---

## Campaign-Specific URL Examples

### Meta Ads (Facebook/Instagram)

**Instagram Feed - Conversion Campaign - Quality Hook Image #1:**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_image_1
```

**Facebook Stories - Conversion Campaign - Heritage Video #2:**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=heritage_video_2
```

**Instagram Retargeting - Carousel Ad #3:**
```
https://unclemays.com?utm_source=instagram&utm_medium=retargeting&utm_campaign=retarget_apr21&utm_content=delivery_carousel_3
```

---

### Google Ads

**Search Campaign - Produce Delivery Keywords:**
```
https://unclemays.com?utm_source=google&utm_medium=paid_search&utm_campaign=conversion_apr21&utm_content=produce_delivery
```

**Performance Max - Premium Box Asset Group:**
```
https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=conversion_apr21&utm_content=premium_assetgroup
```

**Display Network - Retargeting Banner:**
```
https://unclemays.com?utm_source=google&utm_medium=display&utm_campaign=retarget_apr21&utm_content=banner_300x250
```

---

### Email Campaigns

**Abandoned Cart Recovery - 1 Hour Email:**
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=recovery&utm_content=1h_cta
```

**Newsletter - Product Spotlight CTA:**
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=newsletter_apr&utm_content=product_spotlight
```

**Reorder Reminder - Repeat Customer:**
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=reorder&utm_content=repeat_customer
```

---

### Organic Social

**Instagram Organic Post - Story Link:**
```
https://unclemays.com?utm_source=instagram&utm_medium=organic&utm_campaign=stories&utm_content=weekly_box
```

**Facebook Organic Post - Event Announcement:**
```
https://unclemays.com?utm_source=facebook&utm_medium=organic&utm_campaign=event&utm_content=popup_mar
```

---

## GA4 Tracking Configuration

### Custom Event Tracking

Ensure GA4 is configured to track these events with UTM parameters:

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `page_view` | All page loads | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` |
| `view_item` | Product page view | All UTMs + `product_name`, `price` |
| `add_to_cart` | Add to cart click | All UTMs + `product_name`, `price` |
| `begin_checkout` | Checkout started | All UTMs + `cart_value` |
| `purchase` | Order complete | All UTMs + `transaction_id`, `revenue`, `product_name` |
| `abandoned_cart` | Checkout expired | All UTMs + `session_id`, `cart_value` |

### GA4 Custom Dimensions

Create these custom dimensions for better attribution:

1. **Campaign Goal** → Extract from `utm_campaign` (first segment)
2. **Ad Format** → Extract from `utm_content` (second segment)
3. **Creative Hook** → Extract from `utm_content` (first segment)

**Example:**
- URL: `...&utm_campaign=conversion_apr21&utm_content=quality_image_1`
- Campaign Goal: `conversion`
- Ad Format: `image`
- Creative Hook: `quality`

---

## Reporting Structure

### GA4 Reports to Build

1. **Source/Medium Report**
   - Dimensions: `utm_source`, `utm_medium`
   - Metrics: Sessions, Users, Conversions, Revenue, Conversion Rate

2. **Campaign Performance Report**
   - Dimensions: `utm_campaign`, `utm_source`
   - Metrics: Sessions, Add to Carts, Checkouts Started, Purchases, Revenue, CAC, ROAS

3. **Creative Performance Report**
   - Dimensions: `utm_content`, `utm_campaign`
   - Metrics: Sessions, CTR, Conversion Rate, Revenue

4. **Funnel Attribution Report**
   - Dimensions: `utm_source`, `utm_medium`, `utm_campaign`
   - Metrics: Views → Add to Cart → Checkout → Purchase (drop-off rates)

---

## Quality Control Checklist

Before launching any campaign, verify:

- [ ] All URLs include `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- [ ] Values use lowercase, underscores (no spaces or hyphens)
- [ ] Campaign naming follows `{goal}_{timeframe}_{variant}` format
- [ ] Content naming follows `{hook}_{format}_{size}` format
- [ ] URLs are tested in GA4 real-time report (verify parameters appear)
- [ ] Campaign names are coordinated with Advertising Creative

---

## Common Mistakes to Avoid

❌ **Don't:**
- Mix cases: `Facebook` vs `facebook` creates duplicate sources
- Use spaces: `paid social` breaks GA4 (use `paid_social`)
- Use hyphens in values: `paid-social` should be `paid_social`
- Reuse content IDs: `quality_image_1` should be unique per ad
- Skip parameters: Always include all 4 (source, medium, campaign, content)

✅ **Do:**
- Use lowercase: `facebook`, not `Facebook`
- Use underscores: `paid_social`, not `paid social`
- Be specific: `quality_image_1`, not `ad1`
- Be consistent: Always use same format
- Test in GA4: Verify UTMs appear in real-time reports

---

## Campaign URL Builder Tool

Use Google's Campaign URL Builder for consistency:  
https://ga-dev-tools.google/campaign-url-builder/

**Pre-filled Template:**
```
Website URL: https://unclemays.com
Campaign Source: [facebook | instagram | google | email]
Campaign Medium: [paid_social | paid_search | email | retargeting]
Campaign Name: [conversion_apr21 | recovery | retarget_apr21]
Campaign Content: [quality_image_1 | heritage_video_2 | etc]
```

---

## Integration with Ad Platforms

### Meta Ads Manager
Add UTM parameters in **Ad Creative** → **Website URL** field:
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_image_1
```

### Google Ads
Add UTM parameters in **Final URL** field:
```
https://unclemays.com?utm_source=google&utm_medium=paid_search&utm_campaign=conversion_apr21&utm_content=produce_delivery
```

Or use **Tracking Template** for dynamic insertion:
```
{lpurl}?utm_source=google&utm_medium=paid_search&utm_campaign=conversion_apr21&utm_content={creative}
```

### Mailchimp
Add UTM parameters to all email links via **Merge Tags**:
```
https://unclemays.com?utm_source=email&utm_medium=email&utm_campaign=*|CAMPAIGN_UID|*&utm_content=header_cta
```

---

## Maintenance & Updates

**Weekly:**
- Review GA4 Source/Medium report for inconsistencies
- Flag any UTM values that don't match standards
- Update this doc if new campaigns require new naming

**Monthly:**
- Audit all active campaigns for UTM compliance
- Archive old campaign IDs (>90 days inactive)
- Update campaign naming for new quarter/month

---

## Contact

**Questions:** RevOps (anthony@unclemays.com)  
**Last Updated:** 2026-04-14  
**Version:** 1.0
