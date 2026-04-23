# Meta Ad URL Updates Required

Generated 2026-04-22. Meta does not allow in-place URL updates on live creatives via API, so these must be applied manually in Ads Manager.

## How to apply

1. Go to [Ads Manager](https://business.facebook.com/adsmanager) → Ad Account "Second Try" → Ads tab
2. For each ad ID below: select ad → **Edit** → scroll to **Website URL** → paste new URL → **Publish**
3. Meta re-enters ad review but should approve within ~30 min for URL-only changes

## Retargeting ads → `/checkout/starter?promo=FRESH10`

Warm visitors already know the brand; shorter path to purchase.

| Ad ID | Ad Name | New URL |
|---|---|---|
| `120243457462600762` | Retargeting - Community 0 Off | `https://unclemays.com/checkout/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=retargeting_community&promo=FRESH10` |
| `120243457458270762` | Retargeting - Unboxing V2 | `https://unclemays.com/checkout/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=retargeting_unboxing&promo=FRESH10` |

## Cold / Sub Launch ads → `/subscribe/starter?promo=FRESH10`

Lowest-friction entry point for cold traffic ($31.50/wk with FRESH10 discount on first box).

| Ad ID | Ad Name | New URL |
|---|---|---|
| `120243372446130762` | Var C Community Identity — FB Feed | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=variant_c_community&promo=FRESH10` |
| `120243365957030762` | IG Feed Farmer Image — A/B Test | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=ig_farmer&promo=FRESH10` |
| `120243366810480762` | FB Feed Woman Unboxing Crate V1 | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=fb_unboxing_v1&promo=FRESH10` |
| `120243365954400762` | FB Feed Farmer Image — A/B Test | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=fb_farmer&promo=FRESH10` |
| `120243366812440762` | FB Feed Woman Unboxing Box V2 | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=fb_unboxing_v2&promo=FRESH10` |
| `120243236105080762` | FB Feed Static 5 | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=fb_static5&promo=FRESH10` |
| `120243236117510762` | FB Feed Static 1 | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=fb_static1&promo=FRESH10` |
| `120243236112320762` | FB Feed Static 3 | `https://unclemays.com/subscribe/starter?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026&utm_content=fb_static3&promo=FRESH10` |

## Video-only ads (no link to update)

These eight have no Website URL set (video-only with CTA button). They need a link added to the CTA during the same edit pass — use `/subscribe/starter?promo=FRESH10` with a matching `utm_content`.

- `120243457464920762` — Retargeting - Don Video (Social Proof)
- `120243399452240762` — Sub Launch - IG Feed - Don Jhonsan 4
- `120243399457950762` — Sub Launch - IG Feed - Don Video 5
- `120243399453720762` — Sub Launch - IG Stories - Don Jhonsan 4
- `120243399459760762` — Sub Launch - IG Stories - Don Video 5
- `120243399461780762` — Sub Launch - FB Feed - Don Video 5
- `120243399455400762` — Sub Launch - FB Feed - Don Jhonsan 4
- `120243236140440762` — IG Stories Video 1
- `120243236125020762` — FB Feed Video 2
- `120243236121200762` — FB Feed Video 1
- `120243236165060762` — IG Feed Video 1

## Already done via API

- **PAUSED**: `Var A Price Anchor — FB Feed (Checkout)` (ID `120243372442590762`) — "$20 first box" promise can't be fulfilled with FRESH10 ($10 off on $35 = $25). Don't reactivate until we have a $15-off Starter coupon (`STARTER15`) or similar.
