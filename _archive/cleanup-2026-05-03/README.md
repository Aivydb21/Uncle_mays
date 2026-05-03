# Cleanup — 2026-05-03

Files moved out of the active workspace. Nothing destroyed; everything is recoverable via `git log` or by moving it back. Done after the catalog launch + right-sizing work was complete and the repo was a mess of completed-campaign assets, exploration dumps, and one-shot migration scripts.

## Folders

### `loose-files/`
Stray JSON dumps and exploration scripts that lived at the repo root (`_ads_full.json`, `_meta_ads.json`, `_perf_review.py`, `check_apollo*.py`, `check_stripe.py`, `meta-*.json`, `tier1_statuses.json`, etc.) plus `ecosystem.config.cjs` (PM2 config, dead since the Trigger.dev migration) and `.env.pre-merge-2026-04-22` (backup of pre-merge env, no longer needed).

### `completed-campaigns/`
Shipped or ended ad campaigns whose creative assets and brief docs are valuable for reference but should not clutter the active `ad-exports/` folder:
- `meta-ab-test-2026-04-14/`
- `subscription-launch-apr17/` (largest, ~80 MB of video/image assets)
- `meta-campaign-apr2026/`
- `performance-max-2026-04-14/`
- `hyde-park-local/`
- `retargeting-20-percent-off/`
- `organic-social-apr14/`
- `CAMPAIGN-BRIEF-CRO-REVIEW.md`
- Old HR snapshots: `chro-status-2026-04-14.md`, `chro-status-2026-04-16.md`
- Old investor email sequences (v2 + v3, replaced by v4+ in active `investor-outreach/campaigns/`)

### `scripts/`
One-shot Python migrations that already ran and won't be re-run in normal operations:
- `provision_airtable_catalog.py` (Catalog + PickupSlots tables created 2026-04-30)
- `rightsize_airtable_catalog.py` + `rightsize_v2_2026_05_03.py` (catalog right-sizing applied)
- `mailchimp-reimport-from-stripe.py` (one-time audience rebuild after the 2026-04-10 lockdown)

### `judgment/`
Folders the user explicitly green-lit for archival:
- `pr-outreach/` — dormant journalist pitches and PR drafts
- `events/` — 1871 Foodtech (2026-04-24) day-of materials, postmortem captured elsewhere
- `finance/debt/` — line-of-credit doc no longer load-bearing
- `campaigns/` — old email-sequence templates superseded by `investor-outreach/`
- `brand-assets/` — `black-farmer-hero.png` + sub-folder of unused ad-export images
- `dist/` — stale Vite build output (the project is Next.js; this was orphaned)

## Active stuff that stayed put

- `ad-exports/onetime-launch-apr26/` (current campaign brief)
- `bd/paperclip-drafts/`, `bd/investor-prep/`, `bd/partnerships/`
- `hr/chro-status-2026-04-29.md` (latest)
- `investor-outreach/contacts/`, `investor-outreach/drafts/`, `investor-outreach/scripts/`
- `notes/`, `legal/`, `ml/`, `_airtable_dump/`
- `scripts/sync-paperclip-context.py` and `scripts/generate_catalog_images.py`

## Round 2 (later same day)

After the first round shipped, the user flagged additional stale items moved to `round-2/`:

- `round-2/1871/` — `1871-application.md`, `1871-application-deck.md`, `bd/investor-prep/1871-foodtech-2026-04-24.md`, `investor-outreach/contacts/membership-1871-com.md`. The 1871 Foodtech opportunity is no longer being pursued.
- `round-2/strategy/` — `revenue-strategy-paid-acquisition-plan.md` (root). Pre-launch CRO paid-acquisition plan, superseded by the catalog-launch reality. (`bd/STRATEGY.md` kept; that's the BD agent's living strategy doc.)
- `round-2/scripts/` — every script in `scripts/` except the two active utilities `generate_catalog_images.py` (catalog AI image regen) and `sync-paperclip-context.py` (CLAUDE.md → agent context sync). 40+ ad-platform automation scripts that are not safe to run anyway (the standing order on marketing/advertising changes blocks autonomous ad-account writes).
- `round-2/ops/` — every file in `ops/` except `start-paperclip.cmd` and `stop-paperclip.cmd`. The remaining ops docs (campaign monitoring, fulfillment procedures, conversion-lift snapshot, weekly revenue report template, etc.) are stale or unneeded.

After round 2, `scripts/` contains only 2 files and `ops/` contains only 2 files.

## How to undo

If anything in here turns out to still be needed, `git log --diff-filter=R --follow -- <path>` will show the rename, and you can `git mv` it back. Or just copy out of this folder.
