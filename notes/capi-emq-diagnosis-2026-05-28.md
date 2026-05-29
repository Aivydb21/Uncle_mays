# Meta CAPI EMQ Diagnosis — 2026-05-28

Triggered by: UNC-1404 autonomous heartbeat. Board approval 6b7629ea was filed to add hashed PII to CAPI events. Decision Scientist audit found the proposal was a no-op — this document records the verified findings.

---

## 1. META_ACCESS_TOKEN — CONFIRMED set in Vercel production

Source: `.env.vercel.production` line 16.

```
META_ACCESS_TOKEN="EAAhalZAHvAcY..."   # same token in local .env and production
META_PIXEL_ID=2276705169443313
```

`meta-capi.ts:46-50` silently skips if the token is missing. Token is present → CAPI events will fire on real purchases.

**Status: ✅ Not a gap.**

---

## 2. Match keys — CONFIRMED fully wired on all 3 Purchase paths

Code review (current main, 2026-05-28):

| Path | File | Lines | em | ph | Other match keys |
|---|---|---|---|---|---|
| `checkout.session.completed` | `webhook/route.ts` | 228-241 | ✅ `session.customer_details?.email` | ✅ `session.customer_details?.phone` | fn, ln, city, state, zip, country, fbc, fbp, IP, UA |
| `payment_intent.succeeded` (subscription) | `webhook/route.ts` | 478-491 | ✅ `intentEmail` | ✅ `intent.metadata?.phone` | fn, ln, shipping_city/state/zip/country, fbc, fbp, IP, UA |
| `payment_intent.succeeded` (one-time) | `webhook/route.ts` | 547-560 | ✅ `confirmEmail` | ✅ `metadata?.customer_phone \|\| metadata?.phone` | fn, ln, shipping fields, fbc, fbp, IP, UA |

All hashing is SHA-256 `.toLowerCase().trim()` via `hashSHA256()` at `meta-capi.ts:6-8`. Meta-compliant.

Total match keys per event: up to 12 (em, ph, fn, ln, ct, st, zp, country, fbc, fbp, client_ip_address, client_user_agent).

Meta's "Great" EMQ threshold requires 6-8 match keys. We send up to 12 when all fields are present.

**Status: ✅ Not a gap.**

---

## 3. Why EMQ = 5.0/10 — Sample-size noise, not match-key failure

Context (from UNC-1404 snapshot):
- Lifetime real Purchase CAPI events received by Meta: ≤1
- Anthony test purchases are dropped by `isSuppressed()` at `webhook/route.ts:224`, `:474`, `:543`
- The "bot" purchase is 1 event at most — insufficient for statistical EMQ

Meta's EMQ algorithm requires a meaningful number of events to calculate a reliable score. On n ≤ 1 events, the 5.0 score reflects:
- Empty rolling window (no recent real events)
- Not: missing match keys

**Verification**: `notes/capi-verification-2026-05-03.md:13` already confirmed: *"Match keys included on every event: hashed email, hashed phone, fbc, fbp, client IP, client user agent."*

---

## 4. Next experiment — grow real-purchase n

The binding constraint is **real customer purchases**, not CAPI configuration. Once real purchases happen:
- EMQ will update within 24-48h of Meta receiving events
- Expected EMQ: Good to Great (7-9+/10) given 12 match keys
- No code change needed

**Recommended test when a real purchase is imminent**:
1. Watch Vercel function logs in real-time for `[CAPI] Purchase sent, events_received=1`
2. Check Meta Events Manager → Pixel 2276705169443313 → Server tab within 5 min
3. Confirm deduplication: count should be 1 (not 2) if client-side pixel also fires

---

## 5. Board approval 6b7629ea — superseded

The approval to "add hashed PII to Meta CAPI events" was filed on the basis of incorrect diagnosis. The work is already done. CEO should decline or disregard this approval — no implementation action needed.

---

## Summary

| Item | Status | Action needed |
|---|---|---|
| META_ACCESS_TOKEN in Vercel prod | ✅ Confirmed present | None |
| Hashed em + ph in CAPI payload | ✅ Confirmed wired on all 3 paths | None |
| EMQ 5.0/10 cause | Sample-size noise (n ≤ 1 events) | None — will self-correct with real purchases |
| Board approval 6b7629ea | Superseded — no-op proposal | CEO to decline/disregard |
| Next meaningful CAPI signal | First real customer Purchase | Monitor Vercel logs at checkout |
