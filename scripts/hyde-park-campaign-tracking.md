# Hyde Park Local Campaign Tracking

**Campaign Period:** April 18-28, 2026  
**Promo Code:** NEIGHBOR20 (20% off)  
**Target CAC:** <$20/order  
**Budget:** $200/week approved

## Stripe Setup

- **Coupon ID:** `neighbor20-local-2026`
- **Promotion Code:** `NEIGHBOR20` (promo_1TMEpBG67LsNxpToOls0tXOn)
- **Discount:** 20% off
- **Duration:** Forever (no expiration)
- **Redemptions:** Unlimited

## UTM Tracking URLs

### QR Code URL (Primary)
```
https://unclemays.com/?utm_source=qr-code&utm_medium=offline&utm_campaign=hyde-park-local&promo=NEIGHBOR20
```

### Flyer/Print URL
```
https://unclemays.com/?utm_source=flyer&utm_medium=offline&utm_campaign=hyde-park-local&promo=NEIGHBOR20
```

### Door Hanger URL
```
https://unclemays.com/?utm_source=door-hanger&utm_medium=offline&utm_campaign=hyde-park-local&promo=NEIGHBOR20
```

## Phone Order Tracking

For phone orders taken during the campaign:

1. **Ask for promo code awareness:** "Did you see our NEIGHBOR20 offer?"
2. **Log in manual order form:** See `phone-order-log.csv`
3. **Apply discount manually** in Stripe when creating checkout
4. **Add metadata** to Stripe order:
   - `campaign`: `hyde-park-local`
   - `utm_campaign`: `hyde-park-local`
   - `utm_source`: `phone`
   - `utm_medium`: `offline`

## Daily Reporting Metrics

**Run daily during campaign (April 18-28):**
```bash
cd ~/Desktop/um_website/scripts
./daily-campaign-report.sh
```

The script tracks:
- **Orders:** Count with `campaign=hyde-park-local` metadata
- **Revenue:** Sum of successful payments with campaign tag
- **CAC:** Total campaign spend ÷ orders (target: <$20)
- **Conversion rate:** Orders ÷ GA4 sessions with utm_campaign=hyde-park-local
- **Promo code usage:** Redemptions of NEIGHBOR20
- **Traffic:** GA4 sessions by utm_source
- **Phone orders:** Count from phone-order-log.csv

**Report to CRO:** Post daily summary as comment on main campaign task

## Coordinate with Advertising Creative

- **QR Code URL:** https://unclemays.com/?utm_source=qr-code&utm_medium=offline&utm_campaign=hyde-park-local&promo=NEIGHBOR20
- Creative generates QR code image for this URL
- Include "Use code NEIGHBOR20 at checkout for 20% off" on all materials
