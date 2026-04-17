# Meta API Reference - Uncle May's Produce

## Quick Start

All Meta API operations use the config at: `~/.claude/meta-config.json`

**Current Config:**
```json
{
  "app_id": "2351398258672070",
  "access_token": "EAAhalZAHvAcYBRDcZBtAAZC87pOee19zbgZCdmEUyEQoWkHHPClerbvpHTh1bVtm5zTYQuPWCHxb5cFodX6OZBTwr7IhU9FIlVCTwIwqT7qAjxsZCeAC6DtKyGit5yfUOo1CpLt9aF5CteYc02KgKnxwksN3bf7FdUv8fcFEg2XLOe8iGqjdnAwv5cB8T7mUt45gZDZD",
  "base_url": "https://graph.facebook.com/v21.0",
  "ad_account_id": "act_814877604473301",
  "account_name": "Second Try",
  "page_id": "755316477673748"
}
```

**ACTION REQUIRED:** Add `page_id` to your config file if not present:
```bash
# Edit ~/.claude/meta-config.json and add:
"page_id": "755316477673748"
```

## Account IDs

| Resource | ID | Link |
|----------|-----|------|
| Ad Account | `act_814877604473301` | [View](https://business.facebook.com/adsmanager/manage?act=814877604473301) |
| Facebook Page | `755316477673748` | [View](https://business.facebook.com/latest/settings/pages/?business_id=751387917801678&selected_asset_id=755316477673748) |
| Meta Pixel | `2276705169443313` | (configured in ad sets) |
| Business Manager | `751387917801678` | [View](https://business.facebook.com/settings/?business_id=751387917801678) |

## Active Campaign (Subscription Launch - Apr 2026)

### Campaign Structure

**Campaign ID:** `120243219649250762`
- Status: PAUSED
- Budget: $67/day (CBO)
- Objective: Conversions
- Optimization: PURCHASE events
- [View in Ads Manager](https://business.facebook.com/adsmanager/manage/campaigns?act=814877604473301&selected_campaign_ids=120243219649250762)

### Ad Sets

| Placement | Ad Set ID | Targeting |
|-----------|-----------|-----------|
| Instagram Feed | `120243219914430762` | Women 25-35, Chicago 25mi |
| Instagram Stories | `120243219918030762` | Women 25-35, Chicago 25mi |
| Facebook Feed | `120243219919870762` | Women 25-35, Chicago 25mi |

**Common Ad Set Config:**
- Bid: $2.00 cap
- Optimization: OFFSITE_CONVERSIONS
- Pixel: `2276705169443313` (PURCHASE event)
- Advantage Audience: Disabled (strict targeting)

### Video Assets

**Uploaded Videos:**
- Video 1: `1437672617665607` (9.4MB)
- Video 2: `2355242318591638` (9.2MB)

**Thumbnail Image:**
- Hash: `7aef798892a38251a52c4e3f72716993`
- Original: `meta_feed_chicago_families_1080x1080.png`

### Active Ads (6 total)

| Ad Set | Video | Ad ID | Creative ID |
|--------|-------|-------|-------------|
| IG Feed | Video 1 | `120243221203760762` | `1280764066819531` |
| IG Feed | Video 2 | `120243221205970762` | `3966684956796146` |
| IG Stories | Video 1 | `120243221207200762` | `1280764066819531` |
| IG Stories | Video 2 | `120243221208210762` | `3966684956796146` |
| FB Feed | Video 1 | `120243221208940762` | `1577563503305032` |
| FB Feed | Video 2 | `120243221209870762` | `1306430608106512` |

**Ad Creative:**
- Primary Text: "Get farm-fresh produce boxes delivered to your door every week. Support local farmers and eat healthier. Join our community today!"
- Headline: "Fresh Produce Delivered Weekly"
- CTA: Shop Now
- Website URL: `https://unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=video&utm_campaign=subscription_launch_apr2026`

## Working Scripts

All scripts in: `C:/Users/Anthony/Desktop/business/scripts/`

### Campaign Creation
- `launch-meta-campaign.py` - Creates campaign + ad sets
- Usage: `python scripts/launch-meta-campaign.py`

### Video Upload
- `test-meta-video-upload.py` - Test video upload (checks size limits)
- Usage: `python scripts/test-meta-video-upload.py`

### Ad Creation
- `create-video-ads-with-page.py` - Creates ads with page ID and thumbnail
- Usage: `python scripts/create-video-ads-with-page.py`

**Note:** All scripts load config from `~/.claude/meta-config.json`

## Common API Operations

### 1. Get Campaign Performance

```bash
curl "https://graph.facebook.com/v21.0/120243219649250762/insights?access_token=$ACCESS_TOKEN&fields=campaign_name,impressions,clicks,spend,cpc,cpm,ctr,conversions,cost_per_conversion&date_preset=last_7d"
```

### 2. Get Ad Set Performance

```bash
curl "https://graph.facebook.com/v21.0/120243219914430762/insights?access_token=$ACCESS_TOKEN&fields=adset_name,impressions,clicks,spend,conversions,cost_per_conversion&date_preset=last_7d"
```

### 3. Get Ad Performance

```bash
curl "https://graph.facebook.com/v21.0/120243221203760762/insights?access_token=$ACCESS_TOKEN&fields=ad_name,impressions,clicks,spend,conversions,cost_per_conversion&date_preset=last_7d"
```

### 4. Activate Campaign

```bash
curl -X POST "https://graph.facebook.com/v21.0/120243219649250762" \
  -d "status=ACTIVE" \
  -d "access_token=$ACCESS_TOKEN"
```

### 5. Pause Campaign

```bash
curl -X POST "https://graph.facebook.com/v21.0/120243219649250762" \
  -d "status=PAUSED" \
  -d "access_token=$ACCESS_TOKEN"
```

### 6. Update Ad Set Budget/Bid

```bash
# Update bid amount ($3.00 = 300 cents)
curl -X POST "https://graph.facebook.com/v21.0/120243219914430762" \
  -d "bid_amount=300" \
  -d "access_token=$ACCESS_TOKEN"
```

### 7. Upload New Video

```bash
curl -X POST "https://graph.facebook.com/v21.0/act_814877604473301/advideos" \
  -F "access_token=$ACCESS_TOKEN" \
  -F "source=@path/to/video.mp4"
```

### 8. Upload New Image (for thumbnails or static ads)

```bash
curl -X POST "https://graph.facebook.com/v21.0/act_814877604473301/adimages" \
  -F "access_token=$ACCESS_TOKEN" \
  -F "filename.png=@path/to/image.png"
```

### 9. Create New Ad

```bash
# See create-video-ads-with-page.py for full example
# Requires: page_id, video_id, thumbnail image_hash
```

### 10. Get Page Info

```bash
curl "https://graph.facebook.com/v21.0/755316477673748?access_token=$ACCESS_TOKEN&fields=name,link,fan_count,followers_count"
```

## Access Token Management

**Current Token:** Long-lived user access token (60 days)

**To Refresh Token:**
1. Go to https://developers.facebook.com/tools/explorer/
2. Select App: Uncle May's Produce (2351398258672070)
3. Get Token → Get User Access Token
4. Select permissions: `ads_management`, `pages_read_engagement`, `pages_manage_ads`, `business_management`
5. Generate Token
6. Exchange for long-lived token:

```bash
curl "https://graph.facebook.com/v21.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=2351398258672070" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

7. Update `~/.claude/meta-config.json` with new token

**Token Expires:** Check with:
```bash
curl "https://graph.facebook.com/v21.0/debug_token?input_token=$ACCESS_TOKEN&access_token=$ACCESS_TOKEN"
```

## Conversion Tracking

**Meta Pixel:** `2276705169443313`

**Installed On:**
- Product pages: `/products/*`
- Checkout pages: `/checkout/*`
- Order confirmation: `/order/confirmation`

**Events Tracked:**
- `ViewContent` - Product page views
- `InitiateCheckout` - Checkout started
- `AddToCart` - Item added to cart
- `Purchase` - Order completed (conversion event)

**Test Pixel:**
```bash
# Use Meta Pixel Helper Chrome Extension
# Or: https://business.facebook.com/events_manager2/list/pixel/2276705169443313/test_events
```

## Rate Limits

Meta enforces rate limits per account and per user:
- Ad Account: ~200 calls per hour per account
- User: ~200 calls per hour per user token

**Best Practices:**
- Batch operations when possible
- Use field filtering to reduce response size
- Cache campaign/ad set IDs instead of repeated lookups
- Use webhooks for real-time updates instead of polling

## Troubleshooting

### Common Errors

**Error 190: Access Token Invalid**
- Token expired (60 days for long-lived)
- Permissions changed or revoked
- Solution: Refresh token (see Access Token Management above)

**Error 1443121: Facebook Page Missing**
- Page not connected to ad account
- Solution: Ensure `page_id` is in config and page is connected to Business Manager

**Error 1443226: Video Thumbnail Required**
- Video ads need a thumbnail image
- Solution: Upload image and include `image_hash` in creative spec

**Error 100: Invalid Parameter**
- Check field names match API version
- Verify all required fields are present
- Check targeting parameters don't overlap (e.g., countries + cities with radius)

### Debug Mode

Add `&debug=all` to any API call to see detailed error info:

```bash
curl "https://graph.facebook.com/v21.0/120243219649250762?access_token=$ACCESS_TOKEN&debug=all"
```

## Additional Resources

- **Meta Marketing API Docs:** https://developers.facebook.com/docs/marketing-apis
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Meta Business Help:** https://www.facebook.com/business/help
- **Ad Account:** https://business.facebook.com/adsmanager/manage?act=814877604473301
- **Events Manager:** https://business.facebook.com/events_manager2/list/pixel/2276705169443313
- **Business Settings:** https://business.facebook.com/settings/?business_id=751387917801678

---

**Last Updated:** 2026-04-17 18:35 UTC
**Maintained By:** CRO (Paperclip Agent)
**Related Docs:** `META-CAMPAIGN-STATUS-APR17.md`, `meta-video-ads-results.json`
