# GA4 Server-Side Tracking Configuration

## Quick Setup (5 minutes)

### Step 1: Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/analytics/web/)
2. Click **Admin** (gear icon, bottom left)
3. Make sure **Uncle May's Produce** is selected as your property
4. Click **Data Streams** (under Property column)
5. Click your web data stream (probably "unclemays.com")
6. Copy the **Measurement ID** at the top (format: `G-XXXXXXXXXX`)
   - Example: `G-494626869` or similar

### Step 2: Create Measurement Protocol API Secret

Still on the Data Stream page:

1. Scroll down to **Measurement Protocol API secrets** section
2. Click **Create**
3. Enter a nickname: `Stripe Webhook Server-Side Tracking`
4. Click **Create**
5. **IMPORTANT:** Copy the **Secret value** immediately (you can't view it again)
   - It will look like: `abcdefghijklmnop1234567890`

### Step 3: Set Environment Variables

**If using Vercel (production):**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `unclemays` project
3. Click **Settings** → **Environment Variables**
4. Add these 3 variables (for **Production** environment):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_GA_ID` | Your `G-XXXXXXXXXX` from Step 1 | Production |
| `GA4_MEASUREMENT_ID` | Same `G-XXXXXXXXXX` from Step 1 | Production |
| `GA4_API_SECRET` | The secret value from Step 2 | Production |

5. Click **Save**
6. Go to **Deployments** tab → Click the 3-dot menu on latest deployment → **Redeploy**

**If running locally (for testing):**

Edit `.env.local` in your project root:

```bash
# Add these lines (replace with actual values)
NEXT_PUBLIC_GA_ID=G-494626869
GA4_MEASUREMENT_ID=G-494626869
GA4_API_SECRET=your_actual_secret_here
```

Then restart your dev server:
```bash
npm run dev
```

### Step 4: Verify It's Working

**Option A: Check Webhook Logs (Easiest)**

1. Complete a test checkout on your site
2. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
3. Click your webhook endpoint (`https://unclemays.com/api/webhook`)
4. Find the most recent `checkout.session.completed` event
5. Click to view details
6. Check the **Response** tab for: `"received": true`
7. In your application logs (Vercel Logs), look for:
   ```
   [GA4] Purchase tracked: cs_xxxxx = $30
   ```

**Option B: GA4 Real-Time Report**

1. Go to [GA4 Reports](https://analytics.google.com/analytics/web/#/p494626869/reports/realtime)
2. Complete a test checkout
3. Within 5 minutes, you should see a `purchase` event
4. Click on the event to see transaction details

## What Gets Tracked

The webhook now sends this data to GA4 on every successful checkout:

```json
{
  "client_id": "stripe.cs_xxxxx",
  "events": [
    {
      "name": "purchase",
      "params": {
        "transaction_id": "cs_xxxxx",
        "value": 30.00,
        "currency": "USD",
        "items": [
          {
            "item_id": "produce_box",
            "item_name": "Starter Box",
            "price": 30.00,
            "quantity": 1
          }
        ]
      }
    }
  ]
}
```

## Why Server-Side Tracking?

**Client-side tracking alone has issues:**
- ❌ Blocked by ad blockers (30-40% of users)
- ❌ Users close browser before success page loads
- ❌ Privacy tools disable JavaScript tracking
- ❌ Single-page apps can skip page loads

**Server-side tracking is more reliable:**
- ✅ Fires from your server (Stripe webhook)
- ✅ Can't be blocked by ad blockers
- ✅ Guaranteed to fire on every successful payment
- ✅ More accurate conversion data

## Troubleshooting

### "Measurement ID or API Secret not configured"

**Cause:** Environment variables not set or deployment not restarted.

**Fix:**
1. Verify variables in Vercel Settings → Environment Variables
2. Redeploy the application
3. Check logs after next checkout

### "GA4 Tracking failed: 403 Forbidden"

**Cause:** Invalid API secret.

**Fix:**
1. Go back to GA4 Data Stream → Measurement Protocol API secrets
2. Delete old secret, create a new one
3. Update `GA4_API_SECRET` in Vercel
4. Redeploy

### "GA4 Tracking failed: 400 Bad Request"

**Cause:** Invalid Measurement ID format.

**Fix:**
1. Verify Measurement ID starts with `G-` (not `UA-` or other format)
2. Check for typos
3. Make sure you're using the **Measurement ID** not the **Property ID**

### Events not showing in GA4

**Check these:**
1. Wait 5-10 minutes (GA4 can be delayed)
2. Use Real-Time report, not standard reports (those update daily)
3. Check webhook logs to confirm event was sent
4. Verify your GA4 property is in "collecting data" mode (not paused)

## Additional Configuration (Optional)

### Google Ads Conversion Tracking

If you want to track purchases in Google Ads:

1. Go to [Google Ads](https://ads.google.com/) → Tools → Conversions
2. Create a new conversion action: "Website Purchase"
3. Copy the **Conversion ID** (format: `AW-XXXXXXXXXX`)
4. Copy the **Conversion Label**
5. Add to environment variables:
   ```
   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=your_label
   ```

The client-side tracking code already supports this (see `OrderSuccessContent.tsx`).

## Need Help?

- **GA4 Access Issues:** Contact anthony@unclemays.com (property owner)
- **Vercel Deployment:** CTO agent can handle redeployment
- **Testing Help:** See `GA4-META-TRACKING-TESTING-GUIDE.md`
