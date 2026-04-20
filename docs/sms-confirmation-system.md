# SMS Order Confirmation System

## Overview

The SMS confirmation system automatically sends delivery confirmations to customers on their delivery day and collects their confirmation responses. This replaces manual phone calls and supports the 30 produce boxes/week revenue target by reducing operational overhead.

## Features

- **Automated SMS delivery confirmations** sent 2 hours before delivery window (or 8am by default)
- **Two-way messaging** to collect customer confirmation (YES/NO responses)
- **Status tracking** for all SMS confirmations in the checkout session store
- **Integration** with existing Stripe checkout and Trigger.dev task infrastructure

## System Architecture

```
Order Flow:
1. Customer completes checkout → Stripe webhook fires
2. Webhook triggers SMS confirmation task (via Trigger.dev)
3. Task waits until delivery day morning
4. SMS sent to customer via Twilio
5. Customer responds YES/NO
6. Response webhook updates session status
```

## Setup Requirements

### 1. Twilio Account Setup

1. Create a Twilio account at [twilio.com/console](https://www.twilio.com/console)
2. Purchase a phone number with SMS capabilities
3. Note your Account SID, Auth Token, and Phone Number

### 2. Environment Variables

Add these to `.env` and `.env.local`:

```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Twilio Webhook Configuration

Configure Twilio to call your SMS webhook when messages are received:

1. Go to Twilio Console → Phone Numbers → Active Numbers
2. Click your phone number
3. Under "Messaging", set:
   - **A MESSAGE COMES IN**: Webhook
   - **URL**: `https://unclemays.com/api/sms/webhook`
   - **HTTP METHOD**: POST
4. Save changes

### 4. Stripe Metadata

When creating Stripe checkout sessions, include the local checkout session ID in metadata:

```javascript
const session = await stripe.checkout.sessions.create({
  // ... other parameters
  metadata: {
    checkoutSessionId: localSessionId, // from checkout-store
  },
});
```

This links Stripe payments to local sessions for SMS triggering.

### 5. Deploy SMS Webhook

The SMS webhook must be publicly accessible for Twilio to call it:

```bash
# Deploy to production (Vercel/Netlify/etc)
npm run build
npm run deploy
```

**Note**: The webhook requires Node.js runtime (not static export) for the API route.

## How It Works

### SMS Sending Flow

1. **Checkout Completed**: When a Stripe `checkout.session.completed` event fires, the webhook checks for:
   - Phone number in customer details
   - `checkoutSessionId` in session metadata
   - Delivery date in the local checkout session

2. **Task Queued**: If all requirements are met, a Trigger.dev task `send-delivery-confirmation-sms` is queued with:
   - Session ID
   - Customer phone number
   - First name
   - Delivery date and window
   - Product name

3. **Wait Until Delivery Day**: The task waits until 2 hours before the delivery window (or 8am on delivery day if no window specified).

4. **SMS Sent**: Twilio sends an SMS like:
   ```
   Hi Sarah! Your Starter Box from Uncle May's Produce will be delivered between 2:00 PM - 4:00 PM. Reply YES to confirm you'll be home, or NO if you need to reschedule. Questions? Call (312) 972-2595.
   ```

5. **Status Updated**: The local checkout session is updated with:
   - `smsConfirmationSent: true`
   - `smsConfirmationResponse: "pending"`
   - `smsConfirmationSentAt: timestamp`

### SMS Response Flow

1. **Customer Responds**: Customer replies with YES, Y, CONFIRM, NO, N, or RESCHEDULE

2. **Twilio Webhook Fires**: Twilio POSTs to `/api/sms/webhook` with:
   - `From`: Customer phone number
   - `Body`: Message text

3. **Session Updated**: The webhook:
   - Finds the most recent pending SMS confirmation for that phone number
   - Updates `smsConfirmationResponse` to "confirmed" or "declined"
   - Sets `smsConfirmationRespondedAt` timestamp

4. **Confirmation Sent**: Customer receives a reply:
   - **YES**: "Thanks Sarah! Your delivery is confirmed. See you soon!"
   - **NO**: "Got it Sarah. We'll contact you to reschedule. Call (312) 972-2595 if needed."

### Unknown Response Handling

If the customer sends an unrecognized message, they receive:
```
Sorry, I didn't understand that. Please reply YES to confirm delivery or NO to reschedule. For questions, call (312) 972-2595.
```

## Data Model

### CheckoutSession Interface

```typescript
interface CheckoutSession {
  // ... existing fields
  phone?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  smsConfirmationSent?: boolean;
  smsConfirmationResponse?: "pending" | "confirmed" | "declined" | null;
  smsConfirmationSentAt?: string;
  smsConfirmationRespondedAt?: string;
}
```

## Testing

### 1. Test SMS Sending (Development)

```bash
# Trigger a test SMS task manually via Trigger.dev CLI
npx trigger.dev@latest test --task send-delivery-confirmation-sms --payload '{
  "sessionId": "test-session-123",
  "phone": "+13125551234",
  "firstName": "Test",
  "deliveryDate": "2026-04-17",
  "deliveryWindow": "2:00 PM - 4:00 PM",
  "productName": "Starter Box"
}'
```

**Note**: For immediate testing, comment out the `wait.until()` call in `sms-confirmation.ts`.

### 2. Test SMS Response Webhook

```bash
# Simulate Twilio webhook POST
curl -X POST https://unclemays.com/api/sms/webhook \
  -d "From=+13125551234" \
  -d "Body=YES"
```

### 3. End-to-End Test

1. Complete a real checkout on staging with:
   - Valid phone number
   - Delivery date set to tomorrow
   - Delivery window specified

2. Update `.env` with test Twilio credentials

3. Monitor logs:
   - Stripe webhook logs for task queueing
   - Trigger.dev dashboard for task execution
   - Twilio console for SMS delivery

4. Reply to the SMS from your phone

5. Check `data/checkout-sessions.json` for updated status

## Production Deployment Checklist

- [ ] Twilio account created and phone number purchased
- [ ] Environment variables set in production (Vercel/Netlify secrets)
- [ ] Twilio webhook configured to production URL
- [ ] Stripe metadata includes `checkoutSessionId` on all checkouts
- [ ] TRIGGER_SECRET_KEY set for task triggering
- [ ] SMS webhook tested with real phone number
- [ ] Monitoring/alerting set up for failed SMS sends

## Monitoring & Debugging

### Check SMS Task Status

Visit Trigger.dev dashboard:
- https://cloud.trigger.dev → Your project → Tasks → `send-delivery-confirmation-sms`

### Check SMS Delivery Status

Visit Twilio console:
- https://console.twilio.com → Messaging → Logs

### Check Session Status

```bash
# View a session's SMS status
curl https://unclemays.com/api/checkout/session/SESSION_ID
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| SMS not sending | Missing Twilio env vars | Check `.env` file has all 3 Twilio variables |
| Task not triggered | No `checkoutSessionId` in Stripe metadata | Update checkout flow to include metadata |
| Webhook 404 | SMS webhook not deployed | Deploy to production, not local |
| "Session not found" response | Phone number mismatch | Verify phone format (include country code) |

## Cost Estimates

### Twilio Pricing (as of 2026)
- SMS (US): $0.0079/message
- Phone number: $1.15/month

### Monthly Cost (30 boxes/week)
- Outbound SMS: 120 messages/month × $0.0079 = $0.95
- Inbound SMS: 120 responses/month × $0.0079 = $0.95
- Phone number: $1.15
- **Total: ~$3/month**

## Future Enhancements

- [ ] Add SMS opt-in/opt-out management
- [ ] Support delivery time changes via SMS
- [ ] Send delivery updates (driver en route, delivered)
- [ ] Multi-language support
- [ ] Analytics dashboard for confirmation rates
- [ ] Integration with ops dashboard for declined confirmations

## Related Files

- `src/trigger/sms-confirmation.ts` - SMS sending task
- `src/app/api/sms/webhook/route.ts` - Response webhook handler
- `src/app/api/webhook/route.ts` - Stripe webhook (triggers SMS task)
- `src/lib/checkout-store.ts` - Session data model
- `src/app/api/checkout/session/[id]/route.ts` - Session fetch endpoint

## Support

For issues or questions:
- Email: anthony@unclemays.com
- Phone: (312) 972-2595
