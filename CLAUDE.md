# Uncle May's Produce — Investor Outreach Workspace

> ### 🟢 Customer-facing single source of truth: [`customer-facts.md`](./customer-facts.md)
> Delivery day, pricing, active promo codes, cutoff times, and brand positioning that customers can see live on the site live in `customer-facts.md`. **Any agent writing ads, emails, social posts, or landing-page copy MUST read `customer-facts.md` first.** Do not use older planning docs (`emergency-promotion-*`, `promo-launch-offer-*`, `AD-COPY-TEMPLATES.md`, etc.) as authoritative — they contain retired promo codes (WELCOME20, LAUNCH20, FREESHIP, first-order $30) that are no longer live.

> ### 🚢 Deploy target: `uncle-mays` Vercel project (ONLY)
> - Production domain: **unclemays.com** → aliased to the `uncle-mays` Vercel project (`prj_jwMT8iMOmaEdETzwnsKYBrg2lPoI`).
> - Local folder `um_website/` is linked to this project via `.vercel/project.json`. Every `git push` to `Aivydb21/Uncle_mays` main auto-deploys to production here.
> - **Do NOT create another Vercel project under any circumstance without explicit CEO approval.** A stale `business` Vercel project was auto-created earlier and silently double-deployed every push; it has since been deleted. Keeping a single project prevents wasted build minutes, prevents confusion, and keeps logs/analytics in one place.
> - If an agent or workflow appears to be trying to `vercel link` to a new project, `vercel project add`, or `vercel deploy` against a fresh name, **stop and escalate** to the CEO before proceeding.
> - Paperclip, pm2 (`ecosystem.config.cjs`), and all scripts must point at `C:\Users\Anthony\Desktop\um_website\` — never `business/`, which has been archived to `_archive/business-2026-04-22/`.

## Business
Uncle May's Produce is the first data and distribution platform for Black food consumption. The company operates neighborhood-format grocery stores (7,500–12,000 sq ft) targeting historically Black American and culturally thriving urban communities with higher willingness to pay.

- **Founder/CEO:** Anthony Ivy (Chicago Booth MBA; real estate, PE, and M&A background)
- **Contact:** anthony@unclemays.com | (312) 972-2595
- **Flagship:** 10,000 sq ft selling area, Hyde Park, Chicago
- **Projected Year 1 Revenue:** $6.3M ($629/sq ft)
- **Proven Revenue Baseline:** $8M+ in the Hyde Park market
- **Vision:** 82-store national rollout over 10 years, $625M revenue by Year 10
- **Unit Economics:** 35% gross margin (stabilized), 15.3% EBITDA margin, 33% 5-year IRR

## Capital Raise

**SAFE Terms:**
- Amount: $400K–$750K
- Valuation Cap: $5M
- Discount: 20%
- Minimum Check: $25K
- $400K minimum triggers SBA facility close

**Capital Stack ($2,507K total):**
- Equity or Equity-like Capital: $400K
- Tenant Improvements: $100K
- SBA 7(a) Loan: $2,007K (Busey Bank, conditionally approved)

**Uses of Funds:**
- Initial Store Build Out: $1,460K
- Soft Costs (A&E, permits, legal, PM): $445K
- Initial Inventory: $250K
- Pre-Opening Expenses: $60K
- SG&A Reserves: $417K
- Initial AP offset: ($125K)

## Key Milestones Secured
- SBA Loan: Secured
- Location LOI: Secured pending funding
- Store Architect: Civic Projects
- Store Design: Food Market Designs
- General Manager: Matt Weschler (2 prior grocery exits, current GM Wild Onion)

## Leadership Team
- **Anthony Ivy** — CEO (Chicago Booth MBA, PE/M&A, Black agricultural heritage)
- **Zoe Rowell** — COO (15+ yrs ops, $3B Amazon Retail P&L)
- **Jua Mitchell** — CFO (20+ yrs, M&A/IB at BofA, Chicago Booth MBA)
- **Tara Weymon** — CMO (Head of Global Marketing Unilever, VP Marketing P&G)
- **Matt Weschler** — GM Flagship (started/exited 2 Chicago grocery stores)

## Revenue Model
| Layer | Streams | Margin |
|-------|---------|--------|
| Retail | Grocery sales, private label | 20–30% |
| Vendor | Distribution margin, placement fees | 30–45% |
| Data | Market insights, demand analytics | 60–70% |
| Platform | Vendor services, marketplace | 70–80% |

## Market
- TAM: $100B+ annual Black grocery spend
- SAM: $13.4B (Black Families) + $20.4B (Black Working Professionals)
- Beachhead: Black women, ages 25–35
- 97% intent-to-shop from 100+ surveyed consumers
- 89.6% would refer to friends/family

## Folder Structure

```
investor-outreach/
  contacts/                  # Apollo contacts (3,240) and investor CRM tracker
  campaigns/                 # Campaign inventory, email sequence v2, LinkedIn sequence
  materials/                 # Teaser PDF (deck & model managed separately)
  pipeline/tier-1/           # ACTIVE: 87 contacts in "Tier 1 - Thesis Aligned Investors" Apollo campaign
  pipeline/tier-2/           # ACTIVE: 604 contacts loaded into 4 Apollo Tier 2 campaigns (launched 2026-04-09)
  pipeline/tier-3/           # On hold: 677 general contacts (national, future use)
  pipeline/linkedin/         # LinkedIn Tier 1 (99 contacts, national) + Tier 2 (136)
  pipeline/cre-hnw/          # CRE & HNW Black professionals (20 with verified email loaded into v2 Apollo campaign, awaiting UI activation)
  scripts/                   # daily-report.sh, prioritize-contacts.py (full DB), prioritize-linkedin.py (national)
  diligence/                 # Due diligence docs
  notes/                     # Meeting & call notes
```

## Apollo.io API

- **Config:** `~/.claude/apollo-config.json` (API key + base URL)
- **Base URL:** `https://api.apollo.io/api/v1`
- **Auth:** `X-Api-Key` header
- **Email accounts (6):** anthony@, invest@, investmentrelations@, rosalind@, timj@, denise@ (all @unclemays.com)
- **Active campaigns (5 total, 604 + 87 = 691 contacts in flight):**
  - "Tier 1 - Thesis Aligned Investors" (ID: `69d2a0b2c2e0c6000d1608d4`) — 87 contacts, 10/day from anthony@
  - "Tier 2A - Warm Investors (Denise)" (ID: `69d7dc2bf18bda002233eb04`) — 151 contacts from denise@
  - "Tier 2B - Warm Investors (Rosalind)" (ID: `69d7dc492a222a0019913520`) — 151 contacts from rosalind@
  - "Tier 2C - Warm Investors (Invest)" (ID: `69d7dc68457595000d6b285d`) — 151 contacts from invest@
  - "Tier 2D - Warm Investors (TimJ)" (ID: `69d7dc86cfcc9800152117b7`) — 151 contacts from timj@
- **Loaded but not yet activated (pending UI toggle by Anthony):**
  - "CRE & HNW - Black Professionals v2" (ID: `69d9670d516fcc0011c0ee34`) — 20 contacts with verified email loaded (of 32 total; 11 had no email, 1 excluded), 10/day from investmentrelations@
  - **Old broken campaign (ignore):** `69d91b08db5ac5001dad04d3` was the v1 attempt before the v2 rebuild
- **Legacy campaigns:** 6 v1 sequences + "Investor Outreach v2" (all retired/inactive)
- **Contacts:** 3,240 in Apollo database (full DB scored: 66 Tier 1, 612 Tier 2, 677 Tier 3, 1,753 excluded; LinkedIn Tier 1: 99 national)

### Apollo Account Status (verified live via API on 2026-04-12)
- **anthony@unclemays.com:** Active, sending Tier 1. 49 delivered out of 87 contacts. 1 open, 1 reply, 0 bounces. Daily limit 200, set to 50 in campaign step config. `revoked_at=2026-04-08` (historical; re-authed since, currently sending).
- **rosalind@unclemays.com:** Active, sending Tier 2B. 71 delivered. Daily limit 200. `revoked_at=2026-04-09` (historical; re-authed since, currently sending).
- **denise@unclemays.com:** Active, sending Tier 2A. 32 delivered. Daily limit 40. `revoked_at=2026-04-10` (historical; re-authed since, currently sending).
- **investmentrelations@unclemays.com:** Active, sending CRE & HNW v2 (`69d9670d516fcc0011c0ee34`). 5 delivered. Daily limit 40. `revoked_at=2026-04-10` (historical; re-authed since, currently sending).
- **invest@unclemays.com:** STALLED. Tier 2C campaign (`69d7dc68457595000d6b285d`) is `active=False`, 0 scheduled, 0 delivered. `revoked_at=2026-04-07` (before campaign was created on 2026-04-09; never re-authed). Campaign has no email account linked. **Needs Anthony to: (1) re-auth Gmail OAuth in Apollo Settings > Email Accounts, (2) re-add invest@ to Tier 2C campaign, (3) activate the campaign via UI.**
- **timj@unclemays.com:** STALLED. Tier 2D campaign (`69d7dc86cfcc9800152117b7`) is `active=True` with 150 scheduled but 0 delivered. `revoked_at=2026-04-11` (yesterday). **Needs Anthony to re-auth Gmail OAuth in Apollo Settings > Email Accounts.** Wait 24h+ before re-authing other accounts to avoid bulk revocation by Google.
- Apollo `revoked_at` field is historical — accounts can show `revoked_at` AND still be sending if they were re-authed after. Cross-reference with actual delivery counts to confirm health.
- Apollo UI can show false healthy status — **always verify via API, not UI**
- Warmbox warmup is independent from Apollo OAuth and continues sending on all 6 accounts
- All Python clients hitting Apollo MUST set a `User-Agent` header (e.g. `curl/8.0`). Cloudflare blocks the default `Python-urllib/x.y` UA with a 403, error code 1010. `curl` works without an explicit header.

## Workflow — Claude-Managed

Anthony manages Apollo outreach through Claude. Full workflow doc: `investor-outreach/workflow.md`

### Outreach Strategy (updated 2026-04-09)

**Tier 1 Apollo Campaign (ACTIVE)**
- Campaign: "Tier 1 - Thesis Aligned Investors" (ID: `69d2a0b2c2e0c6000d1608d4`)
- 87 contacts (59 original + 10 re-score + 18 mission-aligned), SF, LA, NYC, DC, Chicago
- 4-email sequence over 20 days, anthony@ sender, founder voice (v2)
- Stops on reply, pauses on OOO

**Tier 2 Apollo Campaigns (ACTIVE, launched 2026-04-09)**
- 604 contacts split across 4 accounts (151 each): denise@, rosalind@, invest@, timj@
- 4-email sequence over 20 days, brand voice (v2-tier2, "Uncle May's Produce" as sender)
- 10/day per account = 40 total/day
- Firm-distributed round-robin split (multi-contact firms spread across accounts)
- Sequence doc: `campaigns/email-sequences/investor-sequence-v2-tier2.md`
- Scripts: `scripts/prepare-tier2-campaigns.py`, `scripts/create-tier2-campaigns.py`
- Stops on reply, pauses on OOO, 5% bounce killswitch

**CRE & HNW Apollo Campaign (ACTIVE, sending from investmentrelations@)**
- Campaign: "CRE & HNW - Black Professionals v2" (ID: `69d9670d516fcc0011c0ee34`)
- Old campaign (broken, ignore): `69d91b08db5ac5001dad04d3`
- 20 contacts with verified email loaded (of 32 total; 11 no email found, 1 excluded)
- Excluded: Martin Nesbitt (already in direct conversation with Anthony)
- 4-email sequence over 20 days, anthony@ in From line but actually delivered from investmentrelations@, brand voice (v3-cre)
- 10/day send rate (currently 5 delivered as of 2026-04-11)
- Stops on reply, pauses on OOO
- Contact list: `pipeline/cre-hnw/cre-hnw-contacts.md`
- Sequence doc: `campaigns/email-sequences/investor-sequence-v3-cre.md`
- Campaign results: `pipeline/cre-hnw/campaign-results.json`
- Scripts: `scripts/create-cre-campaign.py`, `scripts/fix-cre-templates.py`, `scripts/rebuild-cre-campaign.py`
- Enrichment scripts (require User-Agent header on Apollo calls): `scripts/enrich-cre-hnw-contacts.py`, `scripts/enrich-cre-batch.py`, `scripts/enrich-cre-bulk.py` — fixed 2026-04-11 to add UA

**Manual Gmail Outreach (PARALLEL)**
- For high-value targets outside the Tier 1 campaign
- Claude drafts, Anthony reviews and sends from anthony@unclemays.com
- Max 10 personalized emails/day

**LinkedIn Outreach (COORDINATED)**
- 99 LinkedIn Tier 1 contacts (national, no geographic filter) + 136 Tier 2
- Coordinated with Apollo email: LinkedIn leads email by 1-2 days
- Sub-Tier A (score 40+, 33 contacts): full surround-sound (views + connection + DMs + InMail)
- Sub-Tier B (score 25-39, 66 contacts): standard (views + connection + DM 1 + InMail)
- Sub-Tier C/Tier 2 (score 15-24, 136 contacts): light (views + connection only)
- 15-20 min/day, 10 connection requests/day, 2 LinkedIn posts/week
- Full sequence doc: `campaigns/linkedin-sequence.md`
- Contact list: `pipeline/linkedin/linkedin-tier1.md`
- All manual, no automation tools (account ban risk)
- Team/location details are confidential in public posts, OK in private DMs

**Daily commands:**
- `"daily report"` — Today's calendar (meetings from Gmail invites), account health, active Apollo campaigns (Tier 1 + Tier 2), Stripe, GA traffic, Mailchimp newsletter stats (Resend transactional stats via [resend.com/emails](https://resend.com/emails)), action items
- `"check replies"` — New replies needing personal follow-up (all campaigns)
- `"campaign stats"` — Full Tier 1 performance breakdown
- `"tier 2 stats"` — Performance across all 4 Tier 2 campaigns
- `"tier 2 replies"` — New replies from Tier 2 campaigns
- `"cre campaign stats"` — CRE & HNW campaign performance
- `"cre replies"` — New replies from CRE & HNW campaign
- `"enrich cre contacts"` — Run Apollo people/match for pending CRE contacts

**Outreach commands:**
- `"draft emails for [N] investors"` — Pull top contacts and create Gmail drafts
- `"draft email for [name]"` — Create a personalized draft for a specific contact
- `"find investors in [sector/city]"` — Search Apollo contacts by criteria
- `"update crm"` — Update investor-crm.md with latest pipeline activity

**LinkedIn commands:**
- `"linkedin queue"` — Today's LinkedIn tasks (connection requests, DMs, InMails, profile views)
- `"linkedin update [name] [status]"` — Update LinkedIn status in CRM
- `"linkedin stats"` — Connection acceptance rate, DM/InMail response rates
- `"linkedin contacts"` — Show the LinkedIn Tier 1 list (99 national contacts)
- `"draft linkedin post"` — Draft a post following the content calendar

**Contact commands:**
- `"show bounced"` / `"show unsubscribed"` — List problem contacts
- `"clean contact list"` — Remove bounced/unsub from sequences
- `"segment by [criteria]"` — Filter by investor type, title, org

**Pipeline commands:**
- `"move [name] to tier-1"` — Update pipeline stage
- `"update pipeline"` — Refresh CRM from campaign data
- `"weekly review"` — Week-over-week metrics and recommendations (includes LinkedIn stats)

**Rules:**
- Stop sending from any account with >5% bounce rate
- Replies are handled personally by Anthony, never automated
- Manual outreach: max 10 emails/day from anthony@

**Email style rules:**
- No em dashes (use commas, periods, or colons instead)
- Max two paragraphs per email body
- Investor-to-investor tone leveraging Anthony's Booth/PE background
- No Calendly in cold emails (send after reply)
- Always include: phone number, "teaser attached" note

## Stripe API

- **Config:** `~/.claude/stripe-config.json` (API key + base URL)
- **Base URL:** `https://api.stripe.com/v1`
- **Auth:** Basic auth with restricted API key
- **Daily report pulls:** Balance, recent charges (48h), payouts
- **Setup:** Generate a restricted read-only key (Charges, Balance, Payouts) at dashboard.stripe.com

### Stripe Webhook (configured 2026-04-09)
- **Destination ID:** `we_1TKR53G67LsNxpToffON5rbo`
- **Endpoint URL:** `https://unclemays.com/api/webhook`
- **Events:** `checkout.session.completed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- **Signing secret:** Set in `um_website/.env` as `STRIPE_WEBHOOK_SECRET`
- **Handler:** `um_website/src/app/api/webhook/route.ts`
- **Note:** Requires SSR deployment (Vercel, not static export) for the API route to be reachable

## Google Analytics (GA4)

- **Config:** `~/.claude/ga-config.json` (property ID + auth paths)
- **Service account key:** `~/.claude/ga-service-account.json` (service account: `claude-ga-reader@uncle-mays-automation.iam.gserviceaccount.com`)
- **OAuth credentials:** `~/.claude/ga-oauth-credentials.json` (OAuth client ID/secret, backup auth method)
- **OAuth token:** `~/.claude/ga-oauth-token.json` (refresh token, backup auth method)
- **API:** GA4 Data API (`analyticsdata.googleapis.com/v1beta`)
- **Auth:** Two methods available — OAuth 2.0 (used by daily-report.sh, simpler) and service account JWT (available for Paperclip agents or scripts needing no user auth)
- **Daily report pulls:** Sessions, users, page views, top pages, traffic sources, conversion events
- **Setup:** Service account key is on disk; OAuth also authorized. Grant Viewer on GA4 property to `claude-ga-reader@uncle-mays-automation.iam.gserviceaccount.com` if using service account auth

## Mailchimp API — Newsletter broadcasts ONLY

> **Scope (as of 2026-04-24):** Mailchimp is the **newsletter engine only**.
> Transactional email (order confirmation, abandoned cart recovery, payment-failed,
> subscription cancellation) moved to **Resend** — see the Resend section below.
> Do NOT add new 1-subscriber `POST /campaigns` + `/actions/send` calls to
> trigger per-customer emails; that pattern was the source of inbox spam and
> broke newsletter analytics by polluting the campaign stats pool with dozens
> of tiny sends. The `upsertContact`, `createCart`, `addSignupLead`, and
> `tagOrderCompleted` helpers in [src/lib/mailchimp.ts](src/lib/mailchimp.ts)
> still exist and are still called — customers land in the audience for
> newsletter segmentation, just not for transactional delivery.

- **Config:** `~/.claude/mailchimp-config.json` (API key + base URL)
- **Base URL:** `https://us19.api.mailchimp.com/3.0`
- **Auth:** HTTP Basic auth (any username, API key as password)
- **Account:** Uncle May's Produce (anthonypivy@gmail.com, us19 data center)
- **Plan:** Free (500 sends/month)
- **Audience:** "Uncle May's Produce" (list ID: `2645503d11`), **3 members as of 2026-04-11**. Was 119 before the 2026-04-10 lockdown lift; investors/stakeholders/non-customers were removed and customers have not yet been re-added. Treat the audience as effectively empty for outbound — re-import customers from Stripe before sending the next campaign.
- **From:** Uncle May's Produce / info@unclemays.com (newsletter From stays on info@)
- **Performance (lifetime, 26 campaigns sent):** 63.9% open rate, 9.8% click rate
  - **Caveat:** these lifetime numbers are inflated by hundreds of 1-subscriber transactional sends created as regular campaigns before the 2026-04-24 Resend migration. Post-migration newsletter stats will be lower and more honest.
- **Last campaign:** 2026-03-25 (before the audience cleanup)

### Mailchimp Commands (or use `/newsletter` skill)
- `/newsletter send` — Full workflow: Anthony provides copy, Claude builds HTML, creates campaign, tests, sends
- `/newsletter draft` — Create campaign in saved state for Mailchimp UI review
- `/newsletter stats` — Pull campaign performance and audience growth
- `/newsletter list` — Show audience segments and member counts

## Resend API — Transactional email

- **Config:** `~/.claude/resend-config.json` (API key + from_email + reply_to + base URL)
- **Base URL:** `https://api.resend.com`
- **Auth:** `Authorization: Bearer <api_key>` header
- **Verified domain:** `unclemays.com` (DKIM + SPF + return-path MX on `send.unclemays.com`, all live in Porkbun DNS)
- **From mailbox:** `Uncle May's Produce <hello@unclemays.com>` (mailbox created 2026-04-24 in Google Workspace)
- **Reply-to:** `info@unclemays.com` (so customer replies land in the shared inbox)
- **Plan:** Free tier, 3k sends/mo, 100/day (upgrade to $20/mo for 50k when paid acquisition scales)
- **Docs:** https://resend.com/docs

### Env vars (required for transactional send to fire)

Both Vercel (Next.js runtime) AND Trigger.dev (task workers) need these — they are separate env var systems, setting Vercel alone won't make triggered emails send:

```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Uncle May's Produce <hello@unclemays.com>
RESEND_REPLY_TO=info@unclemays.com   # optional, defaults to info@unclemays.com
```

### Where transactional email is sent

All triggered emails go through `sendTransactional()` in [src/lib/email/resend.ts](src/lib/email/resend.ts). The 5 Trigger.dev tasks that currently use it:

- [src/trigger/order-confirmation.ts](src/trigger/order-confirmation.ts) — fires on Stripe `checkout.session.completed`
- [src/trigger/abandoned-checkout.ts](src/trigger/abandoned-checkout.ts) — 3-email recovery sequence over 48h (delivery-form abandon, our local session store)
- [src/trigger/stripe-abandoned-checkout.ts](src/trigger/stripe-abandoned-checkout.ts) — 3-email recovery for Stripe-hosted checkouts that expired without payment
- [src/trigger/subscription-lifecycle.ts](src/trigger/subscription-lifecycle.ts) — payment-failed notification
- [src/trigger/subscription-cancellation.ts](src/trigger/subscription-cancellation.ts) — cancellation confirmation

### Suppression list (applied everywhere)

Both [src/lib/email/suppression.ts](src/lib/email/suppression.ts) (Next.js) and [src/trigger/_email-suppression.ts](src/trigger/_email-suppression.ts) (Trigger.dev) block sends to:

- `*@unclemays.com` (all internal staff mailboxes)
- `anthonypivy@gmail.com` (Mailchimp account owner)
- Anything in the `EMAIL_SUPPRESSION_LIST` env var (comma-separated)

Suppressed recipients are also blocked from Mailchimp audience upserts so they never trigger newsletter Journeys either. This was added because test checkouts from internal mailboxes kicked off multi-day recovery sequences (pre-2026-04-24 incident).

### Rules

- **Never reintroduce the 1-subscriber Mailchimp campaign pattern.** If a new triggered email is needed, call `sendTransactional()` from a Trigger.dev task.
- **Always include `tags`** on `sendTransactional()` calls (e.g. `{name: "type", value: "order_confirmation"}`) so Resend logs and event webhooks can filter by email type later.
- **Run TypeScript check** (`npx tsc --noEmit`) and redeploy Trigger.dev (`npx trigger.dev@<version> deploy`) after any change to a trigger task — the Vercel deploy alone will not update the worker code.

## Firecrawl API (Web Scraping & Search)

- **Config:** `~/.claude/firecrawl-config.json` (API key + base URL)
- **Base URL:** `https://api.firecrawl.dev/v2`
- **Auth:** `Authorization: Bearer <api_key>` header
- **CLI:** `firecrawl` (installed globally via npm)
- **Agent skills:** 8 skills installed at `~/.agents/skills/firecrawl*`
- **Plan:** Free tier (500 lifetime credits, 1 credit = 1 page)
- **Docs:** https://docs.firecrawl.dev

### When to Use Firecrawl

Use Firecrawl whenever you need live web data that isn't available through existing APIs (Apollo, Stripe, GA, Mailchimp). Common scenarios:

| Need | Firecrawl Endpoint | Example |
|------|-------------------|---------|
| Research an investor's fund thesis | `POST /scrape` | Scrape fund website "About" or "Portfolio" page before drafting a personalized email |
| Find investor portfolio companies | `POST /scrape` | Check if a fund has invested in food/grocery/data companies |
| Competitor intelligence | `POST /crawl` | Crawl a competitor grocery site for pricing, product assortment, positioning |
| Market data for decks/newsletters | `POST /search` | Search for recent articles on Black consumer spending, grocery trends |
| Verify investor contact info | `POST /scrape` | Confirm a contact's role on their firm's team page |
| Map a website's structure | `POST /map` | Get all URLs on a site before deciding what to scrape |
| Extract structured data | `POST /scrape` with `extract` | Pull portfolio company names, investment stages, check sizes from fund pages |

### Firecrawl Endpoints

```bash
# Scrape a single page (returns clean markdown)
curl -X POST 'https://api.firecrawl.dev/v2/scrape' \
  -H "Authorization: Bearer $FIRECRAWL_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com/about"}'

# Search the web (returns top results as markdown)
curl -X POST 'https://api.firecrawl.dev/v2/search' \
  -H "Authorization: Bearer $FIRECRAWL_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query": "food retail venture capital 2026"}'

# Crawl an entire site (async, returns job ID)
curl -X POST 'https://api.firecrawl.dev/v2/crawl' \
  -H "Authorization: Bearer $FIRECRAWL_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com", "limit": 50}'

# Map a site's URLs (fast, no content)
curl -X POST 'https://api.firecrawl.dev/v2/map' \
  -H "Authorization: Bearer $FIRECRAWL_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com"}'
```

### Firecrawl Commands

- `"research [investor/fund name]"` — Scrape the fund's website for thesis, portfolio, check size, and stage fit
- `"research competitors in [city/market]"` — Search and scrape competitor grocery data
- `"find articles about [topic]"` — Search the web for recent coverage, data, or trends
- `"scrape [url]"` — Scrape a specific URL and return clean markdown
- `"check fund portfolio [fund name]"` — Scrape portfolio page to find relevant investments

### Firecrawl Integration Rules

- **Always use Firecrawl** when drafting personalized investor emails: scrape the fund's site to find thesis alignment, portfolio overlap, and relevant recent activity before writing
- **Prefer Firecrawl search** over general web search for structured research tasks (investor thesis, market data, competitor info)
- **Budget awareness:** Each scrape = 1 credit (500 free). Use `/map` first to identify the right pages before scraping broadly. Avoid crawling entire sites unless necessary.
- **Cache results:** When researching multiple contacts at the same fund, scrape the fund site once and reuse the data
- **For scoring scripts:** When `prioritize-contacts.py` or `prioritize-linkedin.py` identifies a high-score contact, use Firecrawl to enrich with fund thesis data before outreach
- **Load config from:** `~/.claude/firecrawl-config.json` (same pattern as Apollo, Stripe, etc.)

## Domain Authentication (verified 2026-04-04)
- **SPF:** `v=spf1 include:_spf.google.com -all` (hardfail) — PASSING
- **DKIM:** `google._domainkey` configured with RSA key — PASSING
- **DMARC:** `v=DMARC1; p=none; rua=mailto:anthony@unclemays.com` (monitoring mode) — WORKING
- Google DMARC aggregate report received 2026-04-03: 70 emails, all passed SPF+DKIM, zero failures
- DMARC will move to `p=quarantine` after warmup stabilizes
- DMARC reports arrive as XML attachments; consider adding a DMARC monitoring service for automated parsing

## Meta (Facebook/Instagram) API

- **Config:** `~/.claude/meta-config.json` (access token, ad account ID, page ID)
- **Base URL:** `https://graph.facebook.com/v21.0`
- **Auth:** Access token appended as `?access_token=<token>` or via `Authorization: Bearer <token>` header
- **Ad Account:** `act_814877604473301` (Second Try)
- **Page ID:** `755316477673748` (Uncle May's Facebook Page)
- **Pixel ID:** `2276705169443313` (Meta Pixel for conversion tracking)
- **Business ID:** `751387917801678`
- **Use cases:** Campaign management, ad performance, video/image upload, audience targeting, conversion tracking
- **Docs:** https://developers.facebook.com/docs/marketing-apis
- **Reference:** `docs/meta-api-reference.md` (complete API guide with all IDs and working scripts)

### Meta API Usage

```bash
# Get page info
curl "https://graph.facebook.com/v21.0/me?access_token=$META_TOKEN"

# Get page posts
curl "https://graph.facebook.com/v21.0/{page-id}/posts?access_token=$META_TOKEN"

# Get ad account insights
curl "https://graph.facebook.com/v21.0/act_{ad-account-id}/insights?access_token=$META_TOKEN"
```

## Google Ads API

- **Config:** `~/.claude/google-ads-config.json` (developer token + OAuth client + refresh token + customer ID)
- **Base URL:** `https://googleads.googleapis.com/v18`
- **Auth:** OAuth 2.0 (developer token header + refresh-token flow for access token)
- **Use cases:** Creating and managing search/display/YouTube campaigns, ad group and keyword management, ad creative upload, budget management, performance reporting, audience management, conversion tracking
- **Docs:** https://developers.google.com/google-ads/api/docs/start
- **Status (as of 2026-04-22):** FULLY LIVE. Basic access. OAuth complete. API version v22. Operating ad account: `6015592923` (`customer_id`). All campaigns target `6015592923`.
- **Auth quirk (verified 2026-04-22):** MCC `6758950400` is listed in `customers:listAccessibleCustomers` alongside `6015592923`, but it does NOT actually manage `6015592923`. Sending `login-customer-id: 6758950400` in the header causes `PERMISSION_DENIED` (USER_PERMISSION_DENIED). **Query `6015592923` directly with NO `login-customer-id` header** (or set it to `6015592923`). The config still has `login_customer_id: 6758950400` — ignore it, do not send it.

### Required headers

```
Authorization: Bearer <access_token>           # obtained by exchanging refresh_token
developer-token: <developer_token>
login-customer-id: <login_customer_id>         # only if using a manager (MCC) account
```

### Google Ads API Usage (once refresh_token and customer_id are populated)

```bash
# Example: exchange refresh token for access token
curl -sS -X POST "https://oauth2.googleapis.com/token" \
  -d "client_id=$GADS_CLIENT_ID" \
  -d "client_secret=$GADS_CLIENT_SECRET" \
  -d "refresh_token=$GADS_REFRESH_TOKEN" \
  -d "grant_type=refresh_token"

# Example: list accessible customers
curl -sS "https://googleads.googleapis.com/v18/customers:listAccessibleCustomers" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "developer-token: $GADS_DEVELOPER_TOKEN"

# Example: search query (GAQL) against a customer
curl -sS -X POST "https://googleads.googleapis.com/v18/customers/$GADS_CUSTOMER_ID/googleAds:search" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "developer-token: $GADS_DEVELOPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT campaign.id, campaign.name, metrics.clicks, metrics.impressions, metrics.cost_micros FROM campaign WHERE segments.date DURING LAST_7_DAYS"}'
```

### Google Ads Integration Rules

- **Primary owner:** Advertising Creative owns creative assets, variant design, and campaign quality. **CRO** owns budget, bidding strategy, targeting, and spend commitments. Neither has permission to commit live spend or publish active campaigns without board approval.
- **No live campaign activation** without explicit board approval on budget and targeting.
- **Always start paused.** New campaigns created via the API must be created in `PAUSED` status so the board can review before activation.
- **Budget caps must be set on creation.** Never create a campaign without `campaign_budget.amount_micros` defined.
- **Coordinate with RevOps** for conversion tracking, UTM hygiene, and performance measurement. RevOps runs the analytics; Advertising Creative ships the variants.
- **Coordinate with CRO** for spend decisions and channel mix allocation against Meta and other paid channels.

## Canva Connect API (ACTIVE as of 2026-04-12)

- **Status: ACTIVE.** Public integration via OAuth PKCE. All Paperclip agents (especially Advertising Creative) now have programmatic Canva access.
- **Config:** `~/.claude/canva-config.json` (client ID, client secret, access token, refresh token)
- **Base URL:** `https://api.canva.com/rest/v1`
- **Auth:** `Authorization: Bearer <access_token>` header
- **Integration type:** Public (no Teams/Enterprise required)
- **User ID:** `oUYY93XYzgOmcPKNdqaBT0`
- **Team/Brand ID:** `oBYY9v2BovbNNRKOs33y8c`
- **Access token expiry:** 4 hours (use refresh_token to rotate)
- **Docs:** https://www.canva.dev/docs/connect/

### Scopes Granted (19 total)

`app:read`, `app:write`, `asset:read`, `asset:write`, `brandtemplate:meta:read`, `brandtemplate:content:read`, `brandtemplate:content:write`, `comment:read`, `comment:write`, `design:meta:read`, `design:content:read`, `design:content:write`, `design:permission:read`, `design:permission:write`, `folder:read`, `folder:write`, `folder:permission:read`, `folder:permission:write`, `profile:read`

### Existing Designs in Account

| ID | Title |
|----|-------|
| DAHFhtqRSLs | UNCLE MAY'S PRODUCE |
| DAGz6UiLPhE | Presentation - Scaling Black Grocery Chains |
| DAGz6fmEJ9M | Presentation - Uncle May's Produce |
| DAGz6apShSg | Presentation - Uncle May's Produce: A Scalable Grocery Chain |
| DAGz5j0A5Aw | Uncle Mays Grocery Deck.pptx |
| + 5 more presentation variants |

### Canva API Endpoints

```bash
# Get user profile
curl -sS 'https://api.canva.com/rest/v1/users/me' \
  -H "Authorization: Bearer $CANVA_TOKEN"

# List designs
curl -sS 'https://api.canva.com/rest/v1/designs?ownership=owned&sort_by=modified_descending' \
  -H "Authorization: Bearer $CANVA_TOKEN"

# Get design details
curl -sS 'https://api.canva.com/rest/v1/designs/{design_id}' \
  -H "Authorization: Bearer $CANVA_TOKEN"

# Create design
curl -sS -X POST 'https://api.canva.com/rest/v1/designs' \
  -H "Authorization: Bearer $CANVA_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"design_type": {"type": "preset", "name": "doc"}, "title": "My Design"}'

# Upload asset
curl -sS -X POST 'https://api.canva.com/rest/v1/assets/upload' \
  -H "Authorization: Bearer $CANVA_TOKEN" \
  -H 'Content-Type: application/octet-stream' \
  --data-binary @image.png

# List brand templates
curl -sS 'https://api.canva.com/rest/v1/brand-templates' \
  -H "Authorization: Bearer $CANVA_TOKEN"

# Export design (renders to image/PDF)
curl -sS -X POST 'https://api.canva.com/rest/v1/exports' \
  -H "Authorization: Bearer $CANVA_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"design_id": "DAHFhtqRSLs", "format": {"type": "pdf"}}'
```

### Canva Integration Rules

- **Token rotation:** Access token expires every 4 hours. All Python helpers include auto-refresh on 401. When refreshing, save both the new access_token AND the new refresh_token to config (Canva rotates both).
- **Public integration limits:** Rate limits may be lower than Private integrations. If rate-limited, back off and retry.
- **Design exports:** Use the exports endpoint to render designs to PDF/PNG for email attachments or investor materials.
- **Asset uploads:** Upload brand images, logos, and creative assets programmatically for the Advertising Creative to use in designs.
- **No brand templates yet:** Brand templates require Canva for Teams. The agent can still create designs from presets and modify existing designs.

## Creative Tool Requests

The Advertising Creative is encouraged to **ask for creative tools when they need them**. If Canva, Firecrawl, and existing APIs are not enough for a specific creative job (for example: a dedicated image generation model, a video editor API, a stock photography subscription, a font library, an AI upscaler, a background remover, a stock footage license), the agent should:

1. **Write a one-paragraph tool request** that includes:
   - The specific creative job that current tools cannot solve
   - The proposed tool (name, vendor, pricing tier, link)
   - The expected creative impact (what variants it unlocks, what velocity it adds)
   - A budget estimate per month
2. **Post the request as an inbox task for the CEO** tagged `[Creative Tool Request]`
3. **Wait for board approval** before signing up, installing, or committing budget
4. **Do NOT deploy or subscribe to any new tool without explicit board approval.** The no-new-infrastructure guardrail still applies; this creates a permitted escalation path, it does not lift the guardrail.

The goal is to keep the creative unblocked. Do not let tool gaps silently cap output. If a better tool exists and would materially change what the creative can ship, say so.

## Checkout + Recovery — reality check (for audit agents without file-read)

This section exists because Paperclip CRO-style agents that can't read the repo directly have repeatedly raised "bugs" that don't exist. Before flagging any of the below as broken, verify against the live file.

- **Subscription payment page pricing is dynamic, not hardcoded.** [src/app/subscribe/[product]/payment/page.tsx](src/app/subscribe/[product]/payment/page.tsx) uses `${checkout.subPrice}` pulled from `localStorage` (populated by the delivery step from `PRODUCTS[slug].subPrice`). Starter $40, Family $58.50, Community $85.50 all render correctly.
- **One-time checkout delivery + payment routes exist.** [src/app/checkout/[product]/delivery/page.tsx](src/app/checkout/[product]/delivery/page.tsx) and [src/app/checkout/[product]/payment/page.tsx](src/app/checkout/[product]/payment/page.tsx) are live. The `/checkout/[product]` flow is complete.
- **Stripe abandon tracker uses Mailchimp tags, not a JSON file.** [src/trigger/stripe-abandoned-checkout.ts](src/trigger/stripe-abandoned-checkout.ts) marks progress via `abc_<sessionIdSuffix>_e<N>` tags on the Mailchimp contact. No filesystem state; serverless-safe.
- **Purchase pixel fires on order-success for both GA4 and Meta, with retry.** [src/app/order-success/OrderSuccessContent.tsx](src/app/order-success/OrderSuccessContent.tsx) retries up to 8× at 1s intervals to survive 3DS redirects. Deduplication via `event_id` is wired.
- **Pricing toggle defaults to subscription.** [src/components/Pricing.tsx](src/components/Pricing.tsx) `useState(true)`. `?mode=one-time` flips to one-time; `?mode=subscription` is a no-op.
- **Delivery forms validate Chicago-only delivery.** Both [src/app/subscribe/[product]/delivery/page.tsx](src/app/subscribe/[product]/delivery/page.tsx) and [src/app/checkout/[product]/delivery/page.tsx](src/app/checkout/[product]/delivery/page.tsx) require state=IL and ZIP starting with `606`. Out-of-area visitors see an inline email capture waitlist form (via `WaitlistCapture` component) that posts to `/api/capture-email`.
- **Address autocomplete (Google Places).** Both delivery pages use `useAddressAutocomplete` hook ([src/hooks/use-address-autocomplete.ts](src/hooks/use-address-autocomplete.ts)) to attach Google Places Autocomplete to the street address field. On selection, city/state/ZIP auto-populate. Requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in env; gracefully degrades to manual entry when key is missing.
- **Hero CTA, MobileCTA, and shop bottom CTA all route to `/#boxes`.** [src/components/Hero.tsx](src/components/Hero.tsx) "Get Your Box" → `/#boxes`. [src/components/MobileCTA.tsx](src/components/MobileCTA.tsx) both buttons → `/#boxes`. [src/app/shop/page.tsx](src/app/shop/page.tsx) bottom CTA → `/#boxes`. None of these link directly to `/checkout/*` anymore (changed 2026-04-24, UNC-605).
- **Abandoned-cart recovery emails link to `/#boxes`**, which anchors to the pricing grid (section id `boxes` in [src/components/Pricing.tsx](src/components/Pricing.tsx)). There is no standalone `/boxes` route — `/#boxes` is intentional.
- **FRESH10 promo code is visible on pricing and checkout pages.** [src/components/Pricing.tsx](src/components/Pricing.tsx) shows a "Use code FRESH10" banner. Both [src/app/checkout/[product]/page.tsx](src/app/checkout/[product]/page.tsx) and [src/app/subscribe/[product]/page.tsx](src/app/subscribe/[product]/page.tsx) have a promo code input field with a FRESH10 hint. Promo registry lives in [src/lib/promo.ts](src/lib/promo.ts).

If you are a CRO/audit agent without filesystem access, flag items at the **file path** level ("please verify X in file Y") rather than asserting specific line numbers you cannot see.

## Key Positioning Notes

- Uncle May's is **NOT** a food desert solution — do not use this framing
- Targets affluent Black communities with higher economic capacity
- Positioning: data-driven platform + distribution, not just retail grocery


<!-- TRIGGER.DEV basic START -->
# Trigger.dev Basic Tasks (v4)

**MUST use `@trigger.dev/sdk`, NEVER `client.defineJob`**

## Basic Task

```ts
import { task } from "@trigger.dev/sdk";

export const processData = task({
  id: "process-data",
  retry: {
    maxAttempts: 10,
    factor: 1.8,
    minTimeoutInMs: 500,
    maxTimeoutInMs: 30_000,
    randomize: false,
  },
  run: async (payload: { userId: string; data: any[] }) => {
    // Task logic - runs for long time, no timeouts
    console.log(`Processing ${payload.data.length} items for user ${payload.userId}`);
    return { processed: payload.data.length };
  },
});
```

## Schema Task (with validation)

```ts
import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

export const validatedTask = schemaTask({
  id: "validated-task",
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  run: async (payload) => {
    // Payload is automatically validated and typed
    return { message: `Hello ${payload.name}, age ${payload.age}` };
  },
});
```

## Triggering Tasks

### From Backend Code

```ts
import { tasks } from "@trigger.dev/sdk";
import type { processData } from "./trigger/tasks";

// Single trigger
const handle = await tasks.trigger<typeof processData>("process-data", {
  userId: "123",
  data: [{ id: 1 }, { id: 2 }],
});

// Batch trigger (up to 1,000 items, 3MB per payload)
const batchHandle = await tasks.batchTrigger<typeof processData>("process-data", [
  { payload: { userId: "123", data: [{ id: 1 }] } },
  { payload: { userId: "456", data: [{ id: 2 }] } },
]);
```

### Debounced Triggering

Consolidate multiple triggers into a single execution:

```ts
// Multiple rapid triggers with same key = single execution
await myTask.trigger(
  { userId: "123" },
  {
    debounce: {
      key: "user-123-update",  // Unique key for debounce group
      delay: "5s",              // Wait before executing
    },
  }
);

// Trailing mode: use payload from LAST trigger
await myTask.trigger(
  { data: "latest-value" },
  {
    debounce: {
      key: "trailing-example",
      delay: "10s",
      mode: "trailing",  // Default is "leading" (first payload)
    },
  }
);
```

**Debounce modes:**
- `leading` (default): Uses payload from first trigger, subsequent triggers only reschedule
- `trailing`: Uses payload from most recent trigger

### From Inside Tasks (with Result handling)

```ts
export const parentTask = task({
  id: "parent-task",
  run: async (payload) => {
    // Trigger and continue
    const handle = await childTask.trigger({ data: "value" });

    // Trigger and wait - returns Result object, NOT task output
    const result = await childTask.triggerAndWait({ data: "value" });
    if (result.ok) {
      console.log("Task output:", result.output); // Actual task return value
    } else {
      console.error("Task failed:", result.error);
    }

    // Quick unwrap (throws on error)
    const output = await childTask.triggerAndWait({ data: "value" }).unwrap();

    // Batch trigger and wait
    const results = await childTask.batchTriggerAndWait([
      { payload: { data: "item1" } },
      { payload: { data: "item2" } },
    ]);

    for (const run of results) {
      if (run.ok) {
        console.log("Success:", run.output);
      } else {
        console.log("Failed:", run.error);
      }
    }
  },
});

export const childTask = task({
  id: "child-task",
  run: async (payload: { data: string }) => {
    return { processed: payload.data };
  },
});
```

> Never wrap triggerAndWait or batchTriggerAndWait calls in a Promise.all or Promise.allSettled as this is not supported in Trigger.dev tasks.

## Waits

```ts
import { task, wait } from "@trigger.dev/sdk";

export const taskWithWaits = task({
  id: "task-with-waits",
  run: async (payload) => {
    console.log("Starting task");

    // Wait for specific duration
    await wait.for({ seconds: 30 });
    await wait.for({ minutes: 5 });
    await wait.for({ hours: 1 });
    await wait.for({ days: 1 });

    // Wait until specific date
    await wait.until({ date: new Date("2024-12-25") });

    // Wait for token (from external system)
    await wait.forToken({
      token: "user-approval-token",
      timeoutInSeconds: 3600, // 1 hour timeout
    });

    console.log("All waits completed");
    return { status: "completed" };
  },
});
```

> Never wrap wait calls in a Promise.all or Promise.allSettled as this is not supported in Trigger.dev tasks.

## Key Points

- **Result vs Output**: `triggerAndWait()` returns a `Result` object with `ok`, `output`, `error` properties - NOT the direct task output
- **Type safety**: Use `import type` for task references when triggering from backend
- **Waits > 5 seconds**: Automatically checkpointed, don't count toward compute usage
- **Debounce + idempotency**: Idempotency keys take precedence over debounce settings

## NEVER Use (v2 deprecated)

```ts
// BREAKS APPLICATION
client.defineJob({
  id: "job-id",
  run: async (payload, io) => {
    /* ... */
  },
});
```

Use SDK (`@trigger.dev/sdk`), check `result.ok` before accessing `result.output`

<!-- TRIGGER.DEV basic END -->