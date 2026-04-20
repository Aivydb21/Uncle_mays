# Google Ads Conversion Tracking Setup Guide

## Overview

This guide covers the complete setup of Google Ads conversion tracking for Uncle May's Produce Box purchases, including:
1. Google Ads ↔ GA4 linking
2. GA4 conversion import
3. Server-side enhanced conversions via Stripe webhooks
4. Remarketing audience configuration

## Prerequisites

✅ Google Ads account active (6015592923)
✅ GA4 property configured (494626869)
✅ Google Ads API access enabled (v22)
✅ Stripe webhook configured
✅ Trigger.dev deployed

## Phase 1: Link Google Ads to GA4

### Step 1.1: Link in Google Ads UI

1. Go to Google Ads: https://ads.google.com
2. Navigate to: **Tools & Settings → Setup → Linked accounts**
3. Find **Google Analytics (GA4) & Firebase**
4. Click **Details → Link**
5. Select GA4 property: `Uncle May's Produce (494626869)`
6. Enable these features:
   - ✅ **Import conversions** (required)
   - ✅ **Import site metrics** (recommended)
   - ✅ **Personalized advertising** (required for remarketing)
   - ✅ **Auto-tagging** (recommended for tracking)
7. Click **Link**

### Step 1.2: Verify Linking

Run this Python script to verify the link:

```python
import json
import urllib.request
import urllib.parse

# Load config
config = json.load(open("C:/Users/Anthony/.claude/google-ads-config.json"))

def get_access_token():
    payload = urllib.parse.urlencode({
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "refresh_token": config["refresh_token"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=payload)
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())["access_token"]

def check_ga4_link():
    token = get_access_token()
    query = """
        SELECT
          google_analytics_4_link.resource_name,
          google_analytics_4_link.property_id,
          google_analytics_4_link.account_id
        FROM google_analytics_4_link
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "developer-token": config["developer_token"],
        "login-customer-id": config["login_customer_id"],
        "Content-Type": "application/json",
    }
    payload = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        f"{config['base_url']}/customers/{config['customer_id']}/googleAds:search",
        data=payload,
        headers=headers,
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    
    if data.get("results"):
        for result in data["results"]:
            link = result["googleAnalytics4Link"]
            print(f"✓ GA4 Linked: Property ID {link['propertyId']}")
    else:
        print("✗ No GA4 link found")

check_ga4_link()
```

## Phase 2: Import GA4 Purchase Conversion

### Step 2.1: Create Conversion Action from GA4 Event

1. In Google Ads, go to: **Tools & Settings → Measurement → Conversions**
2. Click **+ New conversion action**
3. Select **Import → Google Analytics 4 properties → Web**
4. Choose event: **purchase** (this is the standard GA4 e-commerce event)
5. Configure conversion settings:
   - **Name:** "Purchase - Uncle May's Produce Box"
   - **Category:** Purchase
   - **Value:** Use value from event (Stripe sends `amount_total`)
   - **Count:** One (count only unique conversions)
   - **Click-through conversion window:** 30 days
   - **Engaged-view conversion window:** 1 day
   - **Attribution model:** Position-based (default)
6. Click **Import and continue**

### Step 2.2: Verify GA4 is Tracking Purchases

Check if GA4 is receiving `purchase` events from your Stripe integration:

```python
# Use GA4 Data API to query recent purchase events
import json
import urllib.request

ga_config = json.load(open("C:/Users/Anthony/.claude/ga-config.json"))
oauth_token = json.load(open("C:/Users/Anthony/.claude/ga-oauth-token.json"))

def get_ga4_purchases():
    headers = {
        "Authorization": f"Bearer {oauth_token['access_token']}",
        "Content-Type": "application/json",
    }
    
    request_body = {
        "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
        "dimensions": [{"name": "eventName"}],
        "metrics": [{"name": "eventCount"}],
        "dimensionFilter": {
            "filter": {
                "fieldName": "eventName",
                "stringFilter": {"value": "purchase"}
            }
        }
    }
    
    req = urllib.request.Request(
        f"https://analyticsdata.googleapis.com/v1beta/{ga_config['property_id']}:runReport",
        data=json.dumps(request_body).encode(),
        headers=headers,
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    
    if data.get("rows"):
        count = data["rows"][0]["metricValues"][0]["value"]
        print(f"✓ GA4 purchase events (last 7 days): {count}")
    else:
        print("✗ No purchase events found in GA4")
        print("   → Check if Stripe webhook is sending 'purchase' events to GA4")

get_ga4_purchases()
```

**Note:** If no purchase events are found, you need to ensure your Stripe webhook or website checkout completion is sending the `purchase` event to GA4 via `gtag.js`:

```javascript
// Example: In your checkout success page
gtag('event', 'purchase', {
  transaction_id: 'stripe_session_id',
  value: 39.00,
  currency: 'USD',
  items: [
    {
      item_id: 'produce-box',
      item_name: 'Weekly Produce Box',
      price: 39.00,
      quantity: 1
    }
  ]
});
```

## Phase 3: Server-Side Enhanced Conversions

Server-side conversion tracking supplements GA4 import with first-party Stripe data for maximum accuracy and attribution.

### Step 3.1: Create Conversion Action via API

Run the Trigger.dev setup task:

```bash
npx trigger.dev@latest dev
```

Then in another terminal:

```bash
# Trigger the setup task
curl -X POST http://localhost:3000/api/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "task": "setup-google-ads-conversion-action"
  }'
```

Or use the Trigger.dev dashboard to run `setup-google-ads-conversion-action`.

This will create a conversion action named "Purchase - Uncle May's Produce Box" and return the conversion action ID.

### Step 3.2: Set Environment Variable

After running the setup task, you'll get output like:

```
✓ Created conversion action: customers/6015592923/conversionActions/123456789
✓ Conversion Action ID: 123456789
```

Add this to your `.env` file:

```bash
GOOGLE_ADS_CONVERSION_ACTION_ID=123456789
```

And redeploy Trigger.dev:

```bash
npx trigger.dev@latest deploy
```

### Step 3.3: Test Conversion Upload

Create a test purchase in Stripe (or use a recent completed session) and verify the conversion uploads:

1. The `stripe-purchase-sync` task runs every 2 hours and will automatically trigger `upload-google-ads-conversion`
2. Check Trigger.dev dashboard for task execution logs
3. Verify in Google Ads: **Tools & Settings → Measurement → Conversions**
   - Conversions should appear within 3-24 hours (Google Ads processing time)

## Phase 4: Remarketing Audiences

### Step 4.1: Enable Audience Sharing in GA4

1. Go to GA4: https://analytics.google.com
2. Navigate to: **Admin → Data collection and modification → Google Signals**
3. Click **Get started → Continue → Activate**
4. Navigate to: **Admin → Data sharing settings**
5. Enable: **Google products & services** (required for Google Ads remarketing)

### Step 4.2: Create Audiences in Google Ads

Run the Trigger.dev audience setup task:

```bash
# Via Trigger.dev dashboard or API
curl -X POST http://localhost:3000/api/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "task": "setup-google-ads-audiences"
  }'
```

This creates three audiences:
1. **All Website Visitors (30 days)** — For broad remarketing
2. **Cart Abandoners** — Visitors who viewed `/boxes` but didn't reach `/thank-you`
3. **Past Purchasers** — Customers who completed a purchase

### Step 4.3: Verify Audiences

```python
def list_audiences():
    token = get_access_token()
    query = """
        SELECT
          user_list.id,
          user_list.name,
          user_list.size_for_display,
          user_list.size_for_search
        FROM user_list
        WHERE user_list.type = 'RULE_BASED'
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "developer-token": config["developer_token"],
        "login-customer-id": config["login_customer_id"],
        "Content-Type": "application/json",
    }
    payload = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        f"{config['base_url']}/customers/{config['customer_id']}/googleAds:search",
        data=payload,
        headers=headers,
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    
    for result in data.get("results", []):
        ul = result["userList"]
        print(f"✓ Audience: {ul['name']} (ID: {ul['id']})")
        print(f"  Display: {ul.get('sizeForDisplay', 0)} | Search: {ul.get('sizeForSearch', 0)}")

list_audiences()
```

**Note:** Audiences require 1,000+ active users before they can be used in campaigns. Newly created audiences will show size 0 initially.

## Phase 5: Verification & Testing

### Test Conversion Flow End-to-End

1. **Create test purchase:**
   ```bash
   # Use Stripe test mode to create a checkout session
   curl https://api.stripe.com/v1/checkout/sessions \
     -u sk_test_YOUR_KEY: \
     -d success_url="https://unclemays.com/thank-you" \
     -d line_items[0][price]=price_test_id \
     -d line_items[0][quantity]=1 \
     -d mode=payment
   ```

2. **Complete the test checkout** in Stripe's test UI

3. **Verify sync:**
   - Check Trigger.dev dashboard: `stripe-purchase-sync` should run within 2 hours
   - Check `upload-google-ads-conversion` task logs for success
   - Check Google Ads conversions (may take 3-24h to appear)

4. **Verify GA4 import:**
   - Go to Google Ads: **Tools & Settings → Measurement → Conversions**
   - Find "Purchase - Uncle May's Produce Box (GA4)"
   - Check "Recent conversions" column (updates daily)

### Monitor Conversion Attribution

After 7 days of data collection:

```python
def get_conversion_stats():
    token = get_access_token()
    query = """
        SELECT
          campaign.id,
          campaign.name,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_per_conversion
        FROM campaign
        WHERE segments.date DURING LAST_7_DAYS
        AND metrics.conversions > 0
        ORDER BY metrics.conversions DESC
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "developer-token": config["developer_token"],
        "login-customer-id": config["login_customer_id"],
        "Content-Type": "application/json",
    }
    payload = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        f"{config['base_url']}/customers/{config['customer_id']}/googleAds:search",
        data=payload,
        headers=headers,
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    
    for result in data.get("results", []):
        campaign = result["campaign"]
        metrics = result["metrics"]
        print(f"Campaign: {campaign['name']}")
        print(f"  Conversions: {metrics['conversions']}")
        print(f"  Value: ${metrics['conversionsValue']:.2f}")
        print(f"  Cost per conversion: ${metrics['costPerConversion']:.2f}")

get_conversion_stats()
```

## Troubleshooting

### Conversions Not Appearing

1. **Check GA4 link:** Verify GA4 property is linked in Google Ads
2. **Check conversion action status:** Must be ENABLED, not REMOVED or PAUSED
3. **Check attribution window:** Conversions only count within the 30-day click window
4. **Check time lag:** Google Ads conversions can take 3-24 hours to appear

### Server-Side Conversions Failing

1. **Check environment variables:** All `GOOGLE_ADS_*` vars must be set
2. **Check conversion action ID:** Must match the actual ID from Google Ads
3. **Check Trigger.dev logs:** Look for API errors in task execution
4. **Check email hashing:** Enhanced conversions require SHA-256 hashed emails

### Audiences Not Populating

1. **Check Google Signals:** Must be enabled in GA4
2. **Check data sharing:** GA4 must share data with Google Ads
3. **Check audience rules:** URLs must match actual site structure
4. **Check minimum size:** Audiences need 1,000+ users to be usable

## Next Steps

After setup is complete:

1. **Run UNC-96:** Set up Google Ads search campaigns using these conversion actions
2. **Configure bid strategies:** Use "Maximize conversions" or "Target CPA" bidding
3. **Set up remarketing campaigns:** Use the created audiences for retargeting
4. **Monitor performance:** Weekly reviews of conversion rates and attribution

## Reference

- **Google Ads Customer ID:** 6015592923
- **GA4 Property ID:** 494626869
- **Conversion Action:** Purchase - Uncle May's Produce Box
- **Trigger.dev Tasks:**
  - `setup-google-ads-conversion-action`
  - `upload-google-ads-conversion`
  - `setup-google-ads-audiences`
- **Stripe Webhook:** Configured at unclemays.com/api/webhook

## Coordination with RevOps

RevOps will verify:
- ✅ Conversions appearing in Google Ads dashboard
- ✅ Attribution data flowing correctly
- ✅ Audience sizes growing over time
- ✅ Conversion values matching Stripe transaction amounts

CTO will provide:
- ✅ Server-side conversion tracking (this implementation)
- ✅ Trigger.dev task logs and monitoring
- ✅ API integration health checks
