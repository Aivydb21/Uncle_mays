# Customer Feedback Program — operating doc

This is the durable doc for how the feedback infrastructure runs. Edit
freely as the program evolves; the implementation plan that bootstrapped
it lives in `~/.claude/plans/here-is-some-feedback-tender-lighthouse.md`.

## Why the program exists

Funnel data (April 2026) shows top of funnel is healthy (≈2,000 sessions /
week, $0.16 Meta CPC, 10.9% CTR) but conversion collapses at and after
checkout (≈3 paid orders / week). The hypothesis is that **the box
contents aren't what visitors want to buy.** The program exists to validate
or correct that hypothesis with direct voice-of-customer data, and to
provide a durable infrastructure that future revenue, product, and
marketing decisions can draw from at any time.

## Architecture (V1)

Six layers. V1 ships a thin slice of all six.

| # | Layer | V1 implementation |
|---|---|---|
| 1 | Sources | A: checkout exit survey · B: homepage ask capture · C: abandoned-cart Step 0 (feedback ask) · D: founder interviews |
| 2 | Ingestion | `POST /api/feedback` · email-as-store via `sendInternalAlert` to `anthony@unclemays.com` · `/admin/feedback` manual upload · `ingest-gmail-feedback.py` Gmail-label pull |
| 3 | Store | Anthony's Gmail (`feedback-inbound` label) is canonical. Local JSONL `data/feedback/feedback.jsonl` is reconstructed on demand. Two derived indexes: `feedback-by-theme.json`, `feedback-by-email.json`. |
| 4 | Triage / classification | `classify-feedback.py` (Claude API, prompt-cached). Themes: closed list of 9. Sentiment: pos/neutral/neg. Actionable: bool. |
| 5 | Reporting | `feedback-digest.py` weekly to `anthony@unclemays.com` only · `GET /api/feedback?token=…` ad-hoc CSV |
| 6 | Closed loop | Per-respondent: Anthony reply within 5 business days when warranted · Per-theme: ≥3× recurrence promotes to `notes/feedback-backlog.md` |

## Sources, in detail

### A — Checkout exit survey

Component: `src/components/CheckoutExitSurvey.tsx`. Mounted on
`/checkout/[product]` and `/subscribe/[product]`. Trigger thresholds were
calibrated against Microsoft Clarity dwell data and are documented at
`notes/exit-survey-thresholds-2026-04-29.md`. Re-calibrate when the
checkout layout changes meaningfully or when avg engagement drifts >30%.

### B — Homepage ask capture

Component: `src/components/AskCapture.tsx`. Mounted in
`src/page-content/Index.tsx` between `<Pricing />` and the How-It-Works
section.

### C — Abandoned-cart feedback ask (Step 0)

Both `src/trigger/abandoned-checkout.ts` and
`src/trigger/stripe-abandoned-checkout.ts` send a feedback ask **first**,
before any sales-recovery email. Schedule:

- Email 0 (feedback ask): 2h after abandon
- Email 1 (recovery): 24h after abandon
- Email 2 (recovery): 48h after abandon
- Email 3 (recovery): 72h after abandon

Replies land in `info@unclemays.com`. Anthony applies Gmail label
`feedback-inbound` when triaging, then `ingest-gmail-feedback.py`
imports them into the JSONL store.

V1.1 follow-up: detect Step 0 replies and auto-suppress Steps 1-3.

### D — Founder interviews

No code path. Anthony emails paying customers, takes notes in
`notes/customer-interviews-<date>.md`, and uploads them via
`/admin/feedback` (gated by `FEEDBACK_ADMIN_TOKEN` env var).

### E — Social ask (FB/IG follower funnel)

Page: `src/app/ask/page.tsx`. Component: `src/components/AskForm.tsx`.
Two-question form (what would you want in the box, what would make you
buy) plus optional email. On submit, posts to `/api/feedback` with
`source=social-ask`, `channel=social`, and reveals `FRESH35` (35% off
first box) on the thank-you screen.

Anthony posts links to `unclemays.com/ask?utm_source=facebook|instagram&utm_medium=organic&utm_campaign=social_ask_<month>_<year>`
on the FB Page (755316477673748) and the IG feed manually. UTM/fbclid
captured globally by `<UTMCapture/>` flow into the feedback row's
`notes` field, so the weekly digest's source breakdown shows FB vs IG
split.

The page is `noindex` (it's an outreach surface, not SEO content) and
revealing FRESH35 on submit rather than gating it behind an email is
intentional — the goal is feedback volume, not lead capture.

## Operating cadence

| Cadence | Owner | Action |
|---|---|---|
| Daily (auto) | — | Sources A, B, C capture continuously. No human action. |
| Twice weekly, ~10 min | Anthony | Triage Gmail `feedback-inbound`. Reply personally where warranted. Flag any threads with `feedback-replied` if they came back. |
| Weekly Monday 8am CT (auto) | — | Run `ingest-gmail-feedback.py`, then `classify-feedback.py`, then `feedback-digest.py` on Anthony's local machine (or a scheduled task). Digest emails to `anthony@unclemays.com` only. |
| Weekly review, 15 min | Anthony, solo | Read the digest, groom `notes/feedback-backlog.md`, decide what (if anything) the data tells us to change about the box, the page, or the funnel. Anthony decides if findings get shared with GM or board on a case-by-case basis. |
| Monthly | Anthony | Review the program itself: balanced sources? sufficient volume? themes need revision? anything stale? |

## Theme list (V1)

Closed list of 9. Edit `THEMES` in `classify-feedback.py` to change.

- `box_contents` — item-level wants (X is missing, I want Y, Z is random)
- `price` — too high / too low / value questions
- `delivery` — day, area, logistics, shipping
- `frequency` — weekly vs every-other-week vs monthly
- `quantity` — how-much-food, portion, weight, "feeds X"
- `proteins` — chicken, beef, eggs, fish, pork, lamb
- `subscription_friction` — don't want to subscribe, want one-time, cancel anxiety
- `trust` — skepticism, "how do I know it's fresh", competitor compares
- `other` — fallback

A theme that recurs ≥3× across distinct respondents is promoted to a
backlog item in `notes/feedback-backlog.md`.

## Required env vars

Vercel (Next.js):
- `FEEDBACK_ADMIN_TOKEN` — gates `/admin/feedback` and `GET /api/feedback`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — already configured (used by sendInternalAlert)
- `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID` — already configured

Trigger.dev workers (separate env):
- Same Resend/Mailchimp keys (per CLAUDE.md, must be set in BOTH systems)

Local scripts:
- `~/.claude/anthropic-config.json` — Claude API key for the classifier
- `~/.claude/gmail-oauth-token.json` — for the Gmail ingest script
- `~/.claude/resend-config.json` — for the digest send

## Goal for first 14 days post-ship

50+ classified responses across at least three sources, one weekly digest
delivered, and at least one theme that has crossed the recurrence
threshold and entered `notes/feedback-backlog.md`.

## Roadmap (post-V1)

- **V1.1** — Auto-suppress recovery Steps 1-3 when Step 0 reply detected.
- **V1.1** — Trigger.dev scheduled task for `ingest-gmail-feedback.py` (every 6h) so the JSONL store stays current without manual runs.
- **V1.2** — Post-purchase NPS / CSAT email at +14d after delivery.
- **V2** — Conjoint-analysis study (free Spring Box incentive) externally hosted, ingested via `/admin/feedback`.
- **V3** — Storage migration off JSONL when row count > 5k or query patterns require relational joins.
- **V3** — Public reviews ingestion (Google, Yelp, social mentions).
- **V3** — Support inbox tagging + auto-classify.
