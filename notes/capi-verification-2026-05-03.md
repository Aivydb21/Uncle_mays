# Meta CAPI verification — 2026-05-03

## What's wired in code

| Event | Fires from | File | When |
|---|---|---|---|
| `ViewContent` | `POST /api/capi/view` | [src/app/api/capi/view/route.ts](src/app/api/capi/view/route.ts) | Pixel client tracker calls this on page-view |
| `InitiateCheckout` | `POST /api/capi/initiate-checkout` | [src/app/api/capi/initiate-checkout/route.ts](src/app/api/capi/initiate-checkout/route.ts) | When customer hits the checkout page |
| `Purchase` (Stripe Checkout Session) | webhook `checkout.session.completed` | [src/app/api/webhook/route.ts:174](src/app/api/webhook/route.ts#L174) | Server-side from Stripe webhook |
| `Purchase` (PaymentIntent, subscription path) | webhook `payment_intent.succeeded` | [src/app/api/webhook/route.ts:409](src/app/api/webhook/route.ts#L409) | Server-side |
| `Purchase` (PaymentIntent, one-time custom cart) | webhook `payment_intent.succeeded` | [src/app/api/webhook/route.ts:471](src/app/api/webhook/route.ts#L471) | Server-side |

Match keys included on every event: hashed email, hashed phone, fbc, fbp, client IP, client user agent. Event-id deduplication via `purchase-${stripeId}` so the client-side pixel and server-side CAPI don't double-count.

## Required env vars (must be set on Vercel)

```
META_PIXEL_ID=2276705169443313
META_ACCESS_TOKEN=<long-lived system user token from business.facebook.com>
```

The code falls back to the hardcoded pixel id if `META_PIXEL_ID` is unset, but `META_ACCESS_TOKEN` has no fallback — if it's missing, `sendCapiEvent` logs a warning and does nothing.

## Verification steps (10 min)

### 1. Confirm env vars are live in Vercel production
Vercel dashboard → `uncle-mays` project → Settings → Environment Variables. Look for both `META_PIXEL_ID` and `META_ACCESS_TOKEN` in the **Production** scope. If `META_ACCESS_TOKEN` is missing, no Purchase events have ever made it server-side.

### 2. Send a test event from Meta Events Manager
Meta Business Suite → Events Manager → Pixel `2276705169443313` → Test Events tab. Get the `test_event_code` from that page (looks like `TEST12345`).

Then run this from your local terminal (replace TEST_CODE):

```bash
curl -X POST "https://graph.facebook.com/v21.0/2276705169443313/events?access_token=$META_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "event_name": "Purchase",
      "event_time": '$(date +%s)',
      "action_source": "website",
      "user_data": {"em": ["7c4a8d09ca3762af61e59520943dc26494f8941b"]},
      "custom_data": {"value": 32.00, "currency": "USD"}
    }],
    "test_event_code": "TEST_CODE"
  }'
```

Expected response: `{"events_received": 1, ...}`. The event should appear in Test Events within 30 seconds.

If this works but live events don't show in Meta's Overview tab, it's a token-scope issue (the token doesn't have `business_management` or `ads_management` scope on the right pixel).

### 3. Run a $1 live test purchase
- Apply 100% off coupon (or temporarily lower MIN_SUBTOTAL_CENTS)
- Use a real email (not @unclemays.com — those are suppressed by `isSuppressed`)
- Watch the Vercel function logs in real-time during checkout. Expect to see:

```
[CAPI] Purchase sent, events_received=1
```

If you see:
```
[CAPI] META_ACCESS_TOKEN not configured, skipping
```
→ env var missing.

If you see:
```
[CAPI] Purchase failed: 400 {"error": {"message": "Invalid OAuth access token..."}}
```
→ token expired or wrong pixel.

### 4. Check Events Manager for the live Purchase
Within ~5 minutes, the Purchase event should show up in Events Manager → Overview → Server (CAPI) tab. Look for:
- Event count = 1 (or whatever you tested)
- "Event match quality" should be **Good** or **Great** (we send 6 match keys: em, ph, fbc, fbp, IP, UA)
- "Connection method" should show both `Browser` (pixel) and `Server` (CAPI). Deduplication should keep the count at 1, not 2 (if it's 2, the `event_id` dedup is broken).

## Known scope of CAPI right now

**Covers (good):**
- ViewContent on every page render
- InitiateCheckout when /checkout loads
- Purchase server-side from the Stripe webhook (3 code paths cover all sale types)

**Does NOT cover (gaps Meta will eventually want):**
- `AddToCart` server-side. Currently fires client-side only via the Pixel script in `AddToCartButton.tsx`. This is fine for most browsers but loses iOS/ad-block traffic. Adding server-side would require capturing the visitor's email at add-time, which we don't have until checkout (or until they hit save-my-cart). **Could add if needed for audience-building.**
- Lead/signup events for save-my-cart submissions. Worth wiring once we have data on whether save-my-cart users convert at a meaningful rate; if yes, fire `Lead` server-side from `/api/cart/save` so Meta can build a lookalike on cart-savers.

## Recommendation

Run steps 1-4 above before launching the marketing push. If steps 1-2 fail (env var or token issue), nothing else matters; fix that first. If steps 1-3 work but step 4 shows duplicate counts, the dedup is broken (post a stack trace and I'll fix). Otherwise CAPI is healthy.
