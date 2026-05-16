# CEO Daily Digest — Spec

**Owner:** CTO (build), Paperclip (delivery)
**Status:** Draft pending CEO sign-off, then wire-up
**Effective:** TBD on approval

## Purpose

Restore CEO situational awareness after the 2026-05-15 standing order removed approval gates for CRO-at-will and CTO auto-ship lanes. Agents now ship freely; the digest is the read-once surface that keeps Anthony in the loop without re-introducing pre-ship approvals.

## Cadence

- **Daily, 07:00 America/Chicago.**
- Covers the trailing 24h window (prior day 07:00 → today 07:00).
- Single digest per day. No weekend pause — agents ship 7 days a week.

## Destination

- **Paperclip inbox task** assigned to Anthony, tagged `[CEO Digest]`.
- Title format: `[CEO Digest] YYYY-MM-DD — N shipped, M open, $X pending approval`.
- Body in markdown using the section template below.
- Task stays open until Anthony closes or comments. Unclosed digests roll forward as a "previous digest still open" line in the next day's digest header.

## Contributors

- **Only agents that took an action in the trailing 3-day window** append entries.
- Quiet agents (no PRs, no Paperclip comments, no campaign edits, no API writes in 3 days) are skipped silently — they do not appear as empty bullets.
- The digest builder queries each agent's Paperclip activity log + git author log + Apollo/Mailchimp/Stripe/Google-Ads/Meta write logs to determine "took action."

## Sections (in order)

### 1. Shipped (last 24h)

One line per concrete change. Pulls from:
- Git: merged PRs to `main` on `Aivydb21/Uncle_mays` (title + PR link + author agent).
- Apollo: campaign create/activate/pause, sequence edits, contact list changes.
- Mailchimp: campaign sends, journey edits, audience changes.
- Stripe: coupon create/archive, price/product changes.
- Google Ads & Meta: campaign status changes, budget edits, creative swaps.
- Marketing landing pages: file-level diff in `src/page-content/` or `src/app/(marketing)/`.

Each line: `· <agent> — <one-line description> — <link>`

### 2. Issues opened or escalated (last 24h)

- New Paperclip issues filed by any agent.
- Anything explicitly flagged `cc: CEO` or `escalate: CEO` in a Paperclip comment.
- LogRocket/Galileo severity-high insights from the daily briefing that the CTO has NOT yet auto-shipped a fix for.

Each line: `· <agent> — <issue title> — <severity> — <link>`

### 3. Stalled >24h

- Any Paperclip task or PR with no agent activity for >24h that is not in `done` or `wont-do` state.
- Any LogRocket-flagged issue from the prior briefing still without a shipped fix.
- Any Apollo campaign with delivery count flatlined for >24h while marked active (the `invest@` / `timj@` failure mode from 2026-04-12).

Each line: `· <owning agent> — <item> — <hours stalled> — <link>`

### 4. Pending net-new spend approvals (your action items)

- Every open `request_board_approval` of type net-new spend, sorted by age.
- One-line summary of the ask + dollar amount + agent + age.
- This is the only section where the CEO is expected to take action; the other sections are informational.

Each line: `· <agent> — <ask> — $<amount>/mo — <age> — <approval link>`

## Build plan

1. **Trigger.dev task** `src/trigger/ceo-daily-digest.ts` scheduled at 07:00 CT.
2. Pulls activity from: Paperclip API, git log (via gh CLI), Apollo, Mailchimp, Stripe, Google Ads, Meta, BigQuery marts.
3. Renders markdown body, posts to Paperclip as a new task assigned to Anthony tagged `[CEO Digest]`.
4. On failure, posts an `[CEO Digest FAILED]` task with the exception — never silently skips a day.

## Out of scope (deliberately)

- **No pre-ship approval gating.** The digest reports what happened; it does not block.
- **No real-time pings.** Event-driven Slack/email pings re-create the noise the at-will lane was meant to retire. The digest is the only channel.
- **No agent activity summary per se.** Quiet agents stay quiet. The Shipped section already names who did what; a separate "who worked on what" section would duplicate it.

## CEO decisions (2026-05-16)

- **Recipient:** CEO only. No board chair CC.
- **Weekends:** Same 07:00 CT cadence, 7 days a week.
- **Metrics delta:** Section 5 dropped from v1. The digest is Sections 1–4 only (Shipped, Issues opened/escalated, Stalled >24h, Pending net-new spend approvals). Metrics can be added later if the CEO wants them.
