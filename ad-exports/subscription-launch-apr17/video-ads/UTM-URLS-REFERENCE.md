# UTM-Tagged URLs Reference — Video Ads Campaign

**Campaign:** conversion_apr21  
**Promo Code:** FREESHIP ($10 off first box)  
**Prepared by:** Advertising Creative  
**Date:** 2026-04-17

All URLs follow RevOps standards from `marketing-launch-tracking-deliverables.md`

---

## Meta Video Ad URLs

### Quality Hook (Video 1)

**Facebook Feed (1:1 square):**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_video_1&promo=FREESHIP
```

**Instagram Feed (1:1 square):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_video_1&promo=FREESHIP
```

**Instagram Stories (9:16 vertical):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=quality_video_1&promo=FREESHIP
```

**Instagram Reels (9:16 vertical):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=quality_video_1&promo=FREESHIP
```

---

### Culture Hook (Video 2)

**Facebook Feed (1:1 square):**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=culture_video_2&promo=FREESHIP
```

**Instagram Feed (1:1 square):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=culture_video_2&promo=FREESHIP
```

**Instagram Stories (9:16 vertical):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=culture_video_2&promo=FREESHIP
```

**Instagram Reels (9:16 vertical):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=culture_video_2&promo=FREESHIP
```

---

### Convenience Hook (Video 3)

**Facebook Feed (1:1 square):**
```
https://unclemays.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=convenience_video_3&promo=FREESHIP
```

**Instagram Feed (1:1 square):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=convenience_video_3&promo=FREESHIP
```

**Instagram Stories (9:16 vertical):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=convenience_video_3&promo=FREESHIP
```

**Instagram Reels (9:16 vertical):**
```
https://unclemays.com?utm_source=instagram&utm_medium=paid_social_stories&utm_campaign=conversion_apr21&utm_content=convenience_video_3&promo=FREESHIP
```

---

## Google Ads Video URLs

### YouTube Bumper Ad (15s non-skippable)

**Campaign:** conversion_apr21  
**Final URL:**
```
https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=conversion_apr21&utm_content=youtube_bumper_1&promo=FREESHIP
```

---

### YouTube Skippable In-Stream (20-40s)

**Campaign:** conversion_apr21  
**Final URL (Convenience Hook):**
```
https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=conversion_apr21&utm_content=youtube_skippable_1&promo=FREESHIP
```

**Final URL (Quality Hook, if separate ad):**
```
https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=conversion_apr21&utm_content=youtube_skippable_2&promo=FREESHIP
```

**Final URL (Culture Hook, if separate ad):**
```
https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=conversion_apr21&utm_content=youtube_skippable_3&promo=FREESHIP
```

---

### Performance Max Video Asset

**Campaign:** conversion_apr21  
**Final URL (Quality Hook):**
```
https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=conversion_apr21&utm_content=pmax_video_1&promo=FREESHIP
```

**Final URL (Culture Hook, if separate asset group):**
```
https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=conversion_apr21&utm_content=pmax_video_2&promo=FREESHIP
```

**Final URL (Convenience Hook, if separate asset group):**
```
https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=conversion_apr21&utm_content=pmax_video_3&promo=FREESHIP
```

---

## UTM Parameter Breakdown

All video ad URLs use this consistent structure:

```
https://unclemays.com
  ?utm_source={platform}
  &utm_medium={format}
  &utm_campaign=conversion_apr21
  &utm_content={hook}_video_{variant}
  &promo=FREESHIP
```

### Parameters Explained

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `utm_source` | `facebook`, `instagram`, `google` | Traffic source platform |
| `utm_medium` | `paid_social`, `paid_social_stories`, `video`, `pmax` | Ad format/placement |
| `utm_campaign` | `conversion_apr21` | Campaign identifier (all video ads use same campaign) |
| `utm_content` | `quality_video_1`, `culture_video_2`, `youtube_bumper_1`, etc. | Specific ad variant for A/B testing |
| `promo` | `FREESHIP` | Stripe promo code ($10 off first box) |

---

## Testing URLs

Before uploading to Meta/Google Ads, test each URL:

1. **Click the URL** in a browser
2. **Check GA4 real-time report** — verify UTM params appear
3. **Complete a test checkout** — verify promo code FREESHIP applies ($10 discount)
4. **Check GA4 e-commerce report** — verify purchase event attributed to correct campaign/source

**GA4 Reports to Check:**
- Real-time: Traffic by source/medium (should show `instagram / paid_social`, `google / video`, etc.)
- Acquisition: Traffic acquisition report (verify campaign = `conversion_apr21`)
- E-commerce: Purchases by campaign (verify revenue attributed correctly)

---

## Promo Code Details

**Stripe Promo Code ID:** `promo_1TMVz1G67LsNxpTot1tkLgIB`  
**Coupon ID:** `freeship-launch-2026`  
**Discount:** $10 off  
**Restriction:** First-time transaction only  
**Redemption URL:** `https://unclemays.com?promo=FREESHIP`

The `promo=FREESHIP` query parameter auto-applies the promo code at checkout (implemented via Stripe Checkout Session `promotion_code` parameter).

---

## URL Shorteners (DO NOT USE)

**DO NOT use URL shorteners** (bit.ly, tinyurl, etc.) for these campaign URLs:

- Meta and Google Ads support long URLs (no character limit on destination URLs)
- URL shorteners break GA4 UTM tracking
- URL shorteners add an extra redirect (slower page load, worse mobile UX)
- Some users distrust shortened URLs (lower CTR)

Always use the full `https://unclemays.com?utm_source=...&promo=FREESHIP` URL.

---

## Meta Ads Manager Upload Fields

When uploading to Meta Ads Manager, paste the full UTM URL into:

- **Destination:** Website URL field
- **NOT** the "URL parameters" field (that field is for dynamic parameters, not static UTM tags)

**Example:**
- ✅ **Correct:** Paste full URL `https://unclemays.com?utm_source=instagram&utm_medium=paid_social&utm_campaign=conversion_apr21&utm_content=quality_video_1&promo=FREESHIP` into "Website URL" field
- ❌ **Wrong:** Paste `https://unclemays.com` into "Website URL" and `utm_source=instagram` into "URL parameters" (this breaks the promo code)

---

## Google Ads Upload Fields

When uploading to Google Ads, paste the full UTM URL into:

- **Final URL:** The main destination URL field
- **NOT** the "Tracking template" or "Custom parameters" fields (those are for advanced tracking, not standard UTM)

**Example:**
- ✅ **Correct:** Paste `https://unclemays.com?utm_source=google&utm_medium=video&utm_campaign=conversion_apr21&utm_content=youtube_bumper_1&promo=FREESHIP` into "Final URL"
- ❌ **Wrong:** Use tracking template `{lpurl}?utm_source=google` (this breaks the promo code auto-apply)

---

## Tracking Verification Checklist

After uploading all video ads, verify tracking is working:

- [ ] Click each ad (or use Ad Preview tool)
- [ ] Check GA4 real-time report shows traffic from correct source/medium
- [ ] Complete a test purchase on mobile (iOS + Android)
- [ ] Verify promo code FREESHIP auto-applies at checkout ($10 discount visible)
- [ ] Check GA4 e-commerce report shows purchase attributed to correct campaign
- [ ] Verify Meta Pixel fires `PageView`, `InitiateCheckout`, `Purchase` events (use Meta Events Manager)
- [ ] Verify Google Ads conversion tracking fires on purchase (if `NEXT_PUBLIC_GOOGLE_ADS_ID` is set)

---

**Status:** ✅ All UTM URLs prepared and documented  
**Next:** Upload videos to Meta/Google Ads when files are ready  
**Blocker:** Meta API token invalid (may require manual UI upload)
