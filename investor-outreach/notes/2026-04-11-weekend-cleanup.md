# 2026-04-11 — Weekend Cleanup Notes

End-of-week cleanup pass before closing for the weekend. Captures everything changed across CLAUDE.md, Paperclip agent instructions, scripts, and local files so the state on Monday is known-good.

---

## Real bugs fixed (would have caused silent failures)

| Bug | Where | Fix |
|---|---|---|
| Apollo returns HTTP 403 (Cloudflare error 1010) when called from Python `urllib` with default `Python-urllib/x.y` User-Agent | `enrich-cre-hnw-contacts.py`, `enrich-cre-batch.py`, `enrich-cre-bulk.py` | Added `"User-Agent": "curl/8.0"` to all Apollo headers dicts. Verified live: same call now returns 200. `curl` works without an explicit UA so `daily-report.sh` was already fine. |
| `enrich-cre-hnw-contacts.py` interprets the 403 as an Apollo rate limit and stops with "Re-run later" | Same script, line 164 | Clarified the error message to point at the UA fix first, then quota second. |
| `daily-report.sh` Stripe section crashes with `JSONDecodeError: Expecting value` | [investor-outreach/scripts/daily-report.sh:232](investor-outreach/scripts/daily-report.sh#L232) | curl was treating `created[gte]=` as a glob pattern and silently returning an empty body. Added `-g` flag to disable globbing. Stripe call now returns valid JSON. |
| `daily-report.sh` Firecrawl section fails with "Could not reach Firecrawl API" | [investor-outreach/scripts/daily-report.sh:506](investor-outreach/scripts/daily-report.sh#L506) | Wrong endpoint: was `/account` (404), should be `/team/credit-usage`. Also had leftover lines referencing undefined variables after a partial earlier edit. Now reports 433/525 credits remaining. |
| Paperclip agents had no `adapterConfig.cwd` set, so they inherited the Paperclip dev server's cwd of `~/Desktop/paperclip` and could not resolve any `investor-outreach/...`, `pipeline/...`, `scripts/...` reference in their instructions. Every "check the daily report script" step in their heartbeat was silently a dead path. | All 9 live agents | `PATCH /api/agents/:id` with `{"adapterConfig":{"cwd":"C:\\Users\\Anthony\\Desktop\\business"}}`. Localhost API allows GET/PATCH without bearer auth. Verified all referenced paths now resolve. |

## Real-world state captured (CLAUDE.md was stale on several points)

Verified live via API and the daily report script on 2026-04-11:

- **5 active Apollo campaigns**, not 1 + "Tier 2 on hold". Tier 1 (49 delivered, 1 reply, 0 bounces, 87 contacts), Tier 2A Denise (32 delivered, 149 active), Tier 2B Rosalind (71 delivered, 147 active), Tier 2D TimJ (0 delivered, 150 active — likely paused), and CRE & HNW v2 (5 delivered).
- **Tier 2C Invest@ shows 0/0 active** in the campaign — appears to still need OAuth re-auth.
- **CRE & HNW v2 is ACTIVE**, not "pending UI activation" as CLAUDE.md previously claimed. 5 emails delivered from `investmentrelations@`.
- **Mailchimp audience is now 3 members**, not 119. The 2026-04-10 lockdown lift removed all investors / stakeholders / non-customers and customers have not been re-imported. **Treat the Mailchimp audience as effectively empty for outbound. Re-import customers from Stripe before any campaign send.**
- **GA4 working perfectly**: 97 sessions / 91 users / 135 page views in last 24h, top page `/` (111 views), then `/about` and `/checkout/community`.
- **Top traffic sources**: direct (33), fb (28), ig (17), email (5), google (4). Meta is the dominant paid channel right now.
- **24 `begin_checkout` events in 24h** but Stripe shows 0 transactions in last 48h — there is a serious checkout-to-purchase drop-off worth investigating with RevOps next week.
- **Stripe balance**: $159.59 available, $0 pending. Most recent payouts were Feb 2026.

## Files removed

| File | Why |
|---|---|
| `_tmp_payload.json` (1.3 KB, Apr 3) | Leftover Apollo template upload payload. |
| `investor-outreach/temp-template.html` (14 KB, Apr 6) | Orphan Mailchimp template draft. No incoming references. |
| `~/.paperclip/.../*.bak-20260411` (10 files) | Paperclip COMPANY-CONTEXT and TOOLS backups created earlier in the day. The new sync script can rebuild them anytime from CLAUDE.md, so the backups are no longer load-bearing. |
| `investor-outreach/scripts/enrich-cre-*.py.bak-20260411` (3 files) | Backups from the Apollo UA fix above. |

## New script

[scripts/sync-paperclip-context.py](scripts/sync-paperclip-context.py) — Re-syncs the canonical CLAUDE.md into the COMPANY-CONTEXT.md file of every old-style Paperclip agent (CEO, CTO, CFO, COO, IR), prepending an updated agent roster header. Run with `--dry-run` first to preview. Use this any time CLAUDE.md changes substantively so the agents do not silently drift.

```
python scripts/sync-paperclip-context.py --dry-run
python scripts/sync-paperclip-context.py
```

## Things still on Anthony's plate

1. **`paperclip-guide.md`** (434 lines, dated 2026-04-07) is now severely stale: it lists the original 5-agent setup (CEO/CMO/COO/IR/CTO) and references the CMO heavily. CRO, RevOps, CIO, CFO, and Advertising Creative are missing. The structural content (heartbeat model, budget management, projects, daily workflow, troubleshooting, key principles) is still valuable. Decide between (a) rewrite to match the current 9-agent roster, (b) move to `archive/`, or (c) delete. I left it alone pending your call.
2. **Tier 2C Invest@ is stuck at 0 active** in Apollo. Either OAuth re-auth never completed or the campaign needs to be re-loaded. Worth a 5-min check in the Apollo UI early Monday.
3. **Tier 2D TimJ@ is stuck at 0 delivered** despite 150 active contacts. Same question as Invest@.
4. **24 begin_checkout / 0 actual purchases** is a real funnel problem. RevOps should investigate Monday.
5. **Mailchimp audience is empty** (3 members). Before any newsletter send, run a one-shot import of paying customers from Stripe into the audience.
6. **Active IR agent (`906e449e`) is in `status: error`** in Paperclip. Separate from this cleanup, but worth investigating.
7. **Google Ads activation** still pending: `refresh_token` and `customer_id` missing in `~/.claude/google-ads-config.json`. Account creation is in progress.
8. **UNC-18** (the stale "GA4 service account key missing" task) should be closed in the Paperclip UI as `done` — the work was already complete; the task was generated from a stale agent context that has now been fixed.

## Verified working at end of day

- `python scripts/sync-paperclip-context.py --dry-run` (no changes pending after sync)
- `bash investor-outreach/scripts/daily-report.sh` (full clean run, all 6 sections)
- Apollo API via Python urllib with User-Agent: 200 OK on `emailer_campaigns/{id}`
- Stripe `/balance` and `/charges` endpoints
- GA4 `runReport` against property `494626869`
- Mailchimp `/lists/2645503d11`
- Firecrawl `/team/credit-usage`
- Paperclip CLI: `npx paperclipai agent list -C 4feca4d1-108b-4905-b16a-ed9538c6f9ef` returns the 9 live agents
- Paperclip API on localhost: GET and PATCH on `/api/agents/:id` work without bearer auth (used to set agent cwd)
