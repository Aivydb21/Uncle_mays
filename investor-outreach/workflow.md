# Investor Outreach Workflow

> Claude-managed: Tier 1 Apollo campaign + manual Gmail outreach + Mailchimp newsletters
> Daily performance reviews via daily report (Trigger.dev scheduled task + shell script)
> Last updated: 2026-04-09

---

## Quick Commands

Tell Claude any of these and it will execute:

### Daily Check-in
- **"daily report"** — Email account health, active Apollo campaigns, Stripe transactions, Google Analytics traffic, Mailchimp newsletter stats, action items
- **"check replies"** — New replies across Gmail and Apollo needing personal follow-up
- **"campaign stats"** — Full Tier 1 campaign performance breakdown

### Manual Outreach
- **"draft emails for [N] investors"** — Search Apollo for best-fit contacts, create personalized Gmail drafts
- **"draft email for [name]"** — Create a personalized draft for a specific contact
- **"find investors in [sector/city/type]"** — Search Apollo contacts by criteria
- **"update crm"** — Update investor-crm.md with latest pipeline activity

### LinkedIn Outreach
- **"linkedin queue"** — Show today's LinkedIn tasks: connection requests, DMs, InMails, profile views
- **"linkedin update [name] [status]"** — Update LinkedIn status in CRM (e.g., Requested, Connected, DM1 Sent)
- **"linkedin stats"** — Connection acceptance rate, DM response rate, InMail response rate
- **"draft linkedin post"** — Draft a LinkedIn post following the content calendar themes
- **"linkedin contacts"** — Show the LinkedIn Tier 1 list (99 contacts, national)

### Contact Management
- **"show bounced contacts"** — List contacts that hard bounced
- **"show unsubscribed"** — List contacts that opted out
- **"clean contact list"** — Remove bounced and unsubscribed contacts from active sequences
- **"search contacts [keyword]"** — Find contacts by name, org, or title

### Pipeline
- **"update pipeline"** — Refresh the CRM tracker with latest campaign activity
- **"show engaged contacts"** — List contacts who opened or clicked
- **"show replied"** — List contacts who replied (these need your direct follow-up)
- **"move [name] to tier-1"** — Update pipeline stage
- **"weekly review"** — Week-over-week metrics and recommendations (includes LinkedIn stats)

### Newsletter (Mailchimp)
- **`/newsletter send`** — Full workflow: provide copy, Claude builds HTML, creates campaign, sends test, sends live after approval
- **`/newsletter draft`** — Create campaign in "saved" state for review in Mailchimp UI
- **`/newsletter stats`** — Recent campaign performance (opens, clicks, unsubs, open rate)
- **`/newsletter list`** — Audience stats: subscriber count, segments, rates

### Web Research (Firecrawl-powered)
- **"research [fund name]"** — Scrape fund website for thesis, portfolio companies, check size, stage. Used to personalize outreach emails.
- **"research competitors in [city]"** — Search and scrape competitor grocery stores for pricing, product mix, positioning
- **"find articles about [topic]"** — Web search for recent coverage, data, trends (e.g., "Black consumer grocery spending 2026")
- **"scrape [url]"** — Scrape a specific URL, return clean markdown
- **"check fund portfolio [fund name]"** — Scrape portfolio page to see if fund has food/grocery/data investments
- **"enrich contact [name]"** — Look up the contact's fund website, scrape thesis/team page, add context to CRM entry

### Deliverability
- **"domain health"** — Check SPF/DKIM/DMARC and domain health scores
- **"warmup status"** — Current warmup progress and daily send volumes

---

## Daily Routine

Every day, say **"daily report"** and Claude will (also say **"linkedin queue"** for LinkedIn tasks):

1. **Calendar** — Today's meetings with time, contact, platform, and prep notes. Upcoming meetings this week.
2. **Email account health** — anthony@ connection status, deliverability scores across all 6 accounts
3. **Apollo campaigns (active only)** — Contacts active/paused/finished/bounced, per-step breakdown, open/reply rates
4. **Stripe summary** — Current balance (available + pending), recent transactions (last 48h), payouts
5. **Google Analytics** — Sessions, unique visitors, page views, top pages, traffic sources, conversion events
6. **Mailchimp newsletter** — Subscriber count, avg open/click rates, recent campaign performance table
7. **Action items** — Replies to handle, bounces to clean, deliverability flags, calendar prep tasks

Calendar data is pulled from Gmail (calendar invite messages with .ics attachments). Excludes cancelled/declined events. Includes prep reminders (e.g., questionnaires to fill out, docs to review).

The daily report runs two ways:
- **Automated:** Trigger.dev scheduled task at 8:00 AM CT, sends HTML email to anthony@unclemays.com
- **On demand:** Say "daily report" or "send the daily report" to trigger immediately via shell script or Trigger.dev

---

## Active Outreach

### Tier 1 Apollo Campaign (ACTIVE, launched 2026-04-05)

**Campaign:** "Tier 1 - Thesis Aligned Investors"
**Campaign ID:** `69d2a0b2c2e0c6000d1608d4`
**Send account:** anthony@unclemays.com
**Contacts:** 87 (59 original + 10 full-DB re-score + 18 mission-aligned investors added 2026-04-06)
**Daily limit:** 10 emails/day
**Sequence:** 4 emails over 20 days

| Step | Day | Subject |
|------|-----|---------|
| 1 | 0 | building grocery infrastructure for Black communities |
| 2 | 5 | quick update, Uncle May's progress |
| 3 | 12 | the data layer no one has built |
| 4 | 20 | closing the round, Uncle May's |

**Settings:**
- Stop on reply: Yes (replies handled personally by Anthony)
- Pause on OOO: Yes
- Teaser PDF attached to Email 1

**Contact criteria (scored via `scripts/prioritize-contacts.py`):**
- Full Apollo database scored (3,240 contacts, no contacts left unscored)
- Tier 1 metro filter: SF/Bay Area, LA, NYC, DC/DMV, Chicago
- Sectors: Food, food retail, data infrastructure, foodtech, marketplaces
- Capital type: Equity, equity-like, forgivable debt only (no pure debt, no CDFIs)
- Titles: Partner, Managing Director, Principal, GP, Founder
- Max 2 contacts per firm

### Tier 2 Apollo Campaigns (ACTIVE, launched 2026-04-09)

**Contacts:** 604 (from 612 Tier 2 contacts, 7 deduped against Tier 1, 1 unresolved)
**Voice:** Brand voice ("Uncle May's Produce"), referencing Anthony as founder
**Sequence:** v2-tier2 (4 emails over 20 days, brand voice adaptation)
**Sequence doc:** `campaigns/email-sequences/investor-sequence-v2-tier2.md`
**Daily limit:** 10/account = 40 total/day

| Campaign | Sender | Contacts | Campaign ID |
|----------|--------|----------|-------------|
| Tier 2A | denise@unclemays.com | 150 | `69d7dc2bf18bda002233eb04` |
| Tier 2B | rosalind@unclemays.com | 150 | `69d7dc492a222a0019913520` |
| Tier 2C | invest@unclemays.com | 150 | `69d7dc68457595000d6b285d` |
| Tier 2D | timj@unclemays.com | 150 | `69d7dc86cfcc9800152117b7` |

**Settings:** Same as Tier 1 (stop on reply, pause on OOO, teaser attached to Email 1)

**Contact splitting:** Firm-distributed round-robin. Multi-contact firms (e.g., L Catterton) are spread across all 4 accounts to avoid same-firm spam complaints.

**Monitoring:** Daily report shows per-campaign and aggregate metrics. Bounce rate killswitch at 5%, warning at 3%.

**Scripts:**
- `scripts/prepare-tier2-campaigns.py` -- Parse, dedup, split contacts
- `scripts/create-tier2-campaigns.py` -- Create campaigns (dry run by default, `--execute` to create)
- Split files: `pipeline/tier-2/campaign-split-{a,b,c,d}.json`

**Tier 2 commands:**
- `"tier 2 stats"` -- Performance across all 4 campaigns
- `"tier 2 replies"` -- New replies from Tier 2 campaigns

### CRE & HNW Apollo Campaign (PENDING)

**Campaign:** "CRE & HNW - Black Professionals"
**Campaign ID:** `pending`
**Send account:** investmentrelations@unclemays.com
**Contacts:** 32 (Black CRE professionals + wealthy Black Chicago individuals)
**Daily limit:** 10 emails/day
**Sequence:** v3-cre (4 emails over 20 days, CRE/real estate emphasis)
**Sequence doc:** `campaigns/email-sequences/investor-sequence-v3-cre.md`
**Contact list:** `pipeline/cre-hnw/cre-hnw-contacts.md`

| Step | Day | Subject |
|------|-----|---------|
| 1 | 0 | a grocery platform launching in hyde park |
| 2 | 5 | the capital stack behind uncle may's |
| 3 | 12 | why this isn't just a grocery store |
| 4 | 20 | closing the round, uncle may's |

**Status:** Contact list compiled. Emails pending Apollo enrichment (API rate limit). Campaign creation pending.

**To activate:**
1. Run `python3 scripts/enrich-cre-hnw-contacts.py --execute` when Apollo API resets
2. Re-auth investmentrelations@unclemays.com OAuth in Apollo (one account at a time, hours apart)
3. Create campaign via `/apollo-campaign create`
4. Activate after OAuth is stable

**CRE & HNW commands:**
- `"cre campaign stats"` -- Campaign performance
- `"cre replies"` -- New replies from CRE & HNW campaign
- `"enrich cre contacts"` -- Run Apollo people/match for pending contacts

### Manual Gmail Outreach (PARALLEL)

For high-value targets outside the Tier 1 campaign or contacts requiring more personalization:
- Send from anthony@unclemays.com via Gmail
- **Before drafting:** Use Firecrawl to scrape the investor's fund website (thesis page, portfolio page, team page) for personalization hooks
- Claude drafts, Anthony reviews and sends
- Max 10 personalized emails per day
- Track in investor-crm.md

### LinkedIn Outreach (COORDINATED, launched 2026-04-05)

**Target list:** 99 LinkedIn Tier 1 contacts (national, no geographic filter)
**Target list file:** `pipeline/linkedin/linkedin-tier1.md`
**Sequence doc:** `campaigns/linkedin-sequence.md`
**Daily time:** 15-20 minutes, single morning block

**How it works:**
- LinkedIn leads email by 1-2 days ("warm before cold")
- Connection requests go out 1 day before Apollo Email 1
- DMs use different messaging angles than emails (team pedigree, catalytic capital)
- InMails reserved for Sub-Tier A/B non-connected non-responders only

**Sub-Tiers:**
| Sub-Tier | Score | Count | Treatment |
|----------|-------|-------|-----------|
| A | 40+ | 33 | Full: views + connection + engagement + DMs + InMail |
| B | 25-39 | 66 | Standard: views + connection + DM 1 + InMail fallback |
| C (Tier 2) | 15-24 | 136 | Light: views + connection only |

**Pacing:** 10 connection requests/day. Weeks 1-2: email-synced contacts. Weeks 2-3: LinkedIn-only contacts. Weeks 3-5: Tier 2.

**Content:** 2 LinkedIn posts/week (Mon + Thu). Text only. No team/location reveals (confidential). No "food desert" framing. See `campaigns/linkedin-sequence.md` for content calendar.

**Automation policy:** All manual. No browser automation tools. LinkedIn's native scheduler for posts only.

---

## Contact Segmentation

The full Apollo database (3,240 contacts) has been scored and segmented:

| Tier | Count | Status | Description |
|------|-------|--------|-------------|
| Tier 1 | 66 scored (69 in Apollo campaign) | **Active** | Thesis-aligned equity investors in target metros (SF, LA, NYC, DC, Chicago) |
| Tier 2 | 604 (612 scored, 7 dedup, 1 unresolved) | **Active** | Strong-fit equity investors (national) + Tier 1 overflow. 4 campaigns across denise@, rosalind@, invest@, timj@ |
| Tier 3 | 677 | On hold | General investors (national) |
| LinkedIn Tier 1 | 99 | **Active LinkedIn outreach** | Thesis-aligned, national, no geo filter |
| Excluded | 1,753 | Filtered out | Non-investors, operators, pure debt, non-fund companies |

Full lists in `pipeline/tier-{1,2,3}/` and `pipeline/linkedin/`.

---

## Handling Replies

When someone replies:

1. Claude flags it in the daily report
2. **You respond directly** from anthony@unclemays.com
3. If they want the deck: send it manually with a personal note
4. If they want a call: send your Calendly link
5. Update the CRM tracker with their status
6. Tell Claude: **"move [name] to tier-1"** to update pipeline

---

## Weekly Review (Fridays)

Say **"weekly review"** and Claude will generate:

- Week-over-week comparison of all metrics
- Tier 1 campaign progress (contacts through each step)
- Pipeline movement summary
- Contacts engaged vs. replied
- **LinkedIn stats:** connection acceptance rate, DM response rate, InMail response rate
- **LinkedIn content:** post engagement (impressions, likes, comments)
- **Channel attribution:** which channel generated each reply (email vs. LinkedIn)
- **Market intelligence (Firecrawl):** Any notable competitor moves, industry articles, or market data discovered during the week
- Recommendations for the following week

---

## Stakeholder Newsletter (Mailchimp)

Periodic updates to the full stakeholder base (investors, advisors, community supporters) via Mailchimp.

**Account:** Uncle May's Produce (us19, info@unclemays.com)
**Audience:** 119 subscribers, 64.7% open rate, 11.7% click rate
**List ID:** `2645503d11`
**Plan:** Free (500 sends/month)

### How to Send a Newsletter

1. Run **`/newsletter send`**
2. Provide: subject line + body copy + any media links
3. Claude builds HTML in the Uncle May's template style (Playfair Display headings, tan header/footer, left-aligned body, white dividers between sections)
4. Claude creates the Mailchimp campaign and sends a test to anthony@unclemays.com
5. Review the test in your inbox
6. Confirm to send live to all 119 subscribers

### Newsletter Template Style
- Page background: warm sage `rgb(234, 236, 226)`
- Header/footer: tan `#d2c3b1`
- Headings: Playfair Display serif, bold, left-aligned
- Body: Arial, 16px, left-aligned
- Links: teal `rgb(0, 108, 115)`
- Sections separated by white 2px divider lines
- YouTube videos embedded as clickable thumbnails
- Signature: Anthony Ivy, Founder & CEO, email + phone

### Segments
| Segment | Members | Use |
|---------|---------|-----|
| Investor or High Visible | 49 | Investor-specific updates |
| Non Brokered List | 117 | General stakeholder updates |
| Broker | 2 | Broker communications |
| Full list | 119 | Default for stakeholder newsletters |

---

## Email Style Rules

When Claude drafts investor emails:
- **No em dashes** (use commas, periods, or colons instead)
- **Max two paragraphs** per email body
- **Investor-to-investor tone** leveraging Anthony's Booth MBA, PE, and M&A background
- Always include: phone number, "teaser attached" note
- No Calendly in cold emails (send only after someone replies)
- Each email should have a personalized hook to the investor's fund thesis
- **Firecrawl enrichment:** Before drafting any personalized email, scrape the investor's fund website to find thesis alignment, portfolio companies, recent investments, and relevant blog posts. Use this to write a specific, relevant opening hook rather than generic outreach.

## Account Rules

- Stop sending from any account with bounce rate above 5%
- Replies are handled personally by Anthony, never automated
- Always verify Apollo account status via API, not UI (UI has shown false healthy status before)
- Warmbox warmup continues independently on the 5 alias accounts (invest@, investmentrelations@, rosalind@, timj@, denise@)

## Operational Lessons

1. **Apollo UI is unreliable for account health** (2026-04-04): Accounts showed green/healthy in UI while API showed OAuth revoked. Always check via API.
2. **Warmbox has its own OAuth tokens** (2026-04-04): When Google revoked Apollo's OAuth, Warmbox continued sending independently. Verified via Gmail sent folders and DMARC report.
3. **Bulk OAuth grants trigger Google revocation** (2026-04-03): Connecting 6 accounts to Apollo/Warmbox within minutes caused Google to revoke all tokens. Re-auth one account at a time, spaced hours apart.
4. **Email content in Apollo API** (2026-04-05): Step creation via API doesn't persist email body. Must update via `emailer_templates` endpoint separately after step creation.
5. **Firecrawl for investor research** (2026-04-07): Firecrawl API available for live web scraping. Use before drafting personalized emails to scrape fund thesis/portfolio pages. Config at `~/.claude/firecrawl-config.json`. Free tier = 500 credits. Use `/map` before `/crawl` to avoid wasting credits. Cache fund data when researching multiple contacts at the same firm.
