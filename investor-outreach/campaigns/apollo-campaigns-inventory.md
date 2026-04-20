# Apollo.io Campaign Inventory
> Last updated: 2026-04-09

---

## Active Campaign

### Tier 1 - Thesis Aligned Investors
- **ID:** `69d2a0b2c2e0c6000d1608d4`
- **Status:** ACTIVE (launched 2026-04-05)
- **Send account:** anthony@unclemays.com
- **Daily limit:** 10
- **Contacts:** 87 (59 original + 10 full-DB re-score + 18 mission-aligned investors added 2026-04-06)
- **Sequence:** v2 (founder voice, 4 emails over 20 days)

| Step | Day | Subject |
|------|-----|---------|
| 1 | 0 | building grocery infrastructure for Black communities |
| 2 | 5 | quick update, Uncle May's progress |
| 3 | 12 | the data layer no one has built |
| 4 | 20 | closing the round, Uncle May's |

**Contact criteria:**
- Scored via `scripts/prioritize-contacts.py` (full database of 3,240 contacts scored)
- Tier 1 metro filter: SF/Bay Area, LA, NYC, DC/DMV, Chicago
- Sectors: food, food retail, data infrastructure, foodtech, marketplaces
- Capital type: equity/equity-like only
- Max 2 contacts per firm

**Full contact list:** [pipeline/tier-1/priority-contacts.md](../pipeline/tier-1/priority-contacts.md)

---

### Tier 2 - Warm Investors (4 campaigns, launched 2026-04-09)

**Voice:** Brand ("Uncle May's Produce"), referencing Anthony as founder
**Sequence:** v2-tier2 (4 emails over 20 days, brand voice)
**Sequence doc:** [email-sequences/investor-sequence-v2-tier2.md](email-sequences/investor-sequence-v2-tier2.md)
**Daily limit:** 10 per account (40 total/day)
**Contact splitting:** Firm-distributed round-robin (604 contacts, 7 deduped, 1 unresolved)

| Campaign | ID | Sender | Contacts |
|----------|----|--------|----------|
| Tier 2A - Warm Investors (Denise) | `69d7dc2bf18bda002233eb04` | denise@unclemays.com | 150 |
| Tier 2B - Warm Investors (Rosalind) | `69d7dc492a222a0019913520` | rosalind@unclemays.com | 150 |
| Tier 2C - Warm Investors (Invest) | `69d7dc68457595000d6b285d` | invest@unclemays.com | 150 |
| Tier 2D - Warm Investors (TimJ) | `69d7dc86cfcc9800152117b7` | timj@unclemays.com | 150 |

| Step | Day | Subject |
|------|-----|---------|
| 1 | 0 | building grocery infrastructure for Black communities |
| 2 | 5 | quick update, Uncle May's progress |
| 3 | 12 | the data layer no one has built |
| 4 | 20 | closing the round, Uncle May's |

**Contact criteria:**
- Tier 2 from `scripts/prioritize-contacts.py` (612 contacts, score 10-40 national + Tier 1 overflow)
- Deduped against live Tier 1 campaign (7 removed)
- Firm-distributed split: no firm has all contacts on one sender
- Split files: `pipeline/tier-2/campaign-split-{a,b,c,d}.json`

---

### CRE & HNW - Black Professionals (Campaign 5, pending launch)

**Voice:** Brand ("Uncle May's Produce"), CRE/HNW-tailored
**Sequence:** v3-cre (4 emails over 20 days, CRE/real estate emphasis)
**Sequence doc:** [email-sequences/investor-sequence-v3-cre.md](email-sequences/investor-sequence-v3-cre.md)
**Daily limit:** 10/day

| Campaign | ID | Sender | Contacts |
|----------|----|--------|----------|
| CRE & HNW - Black Professionals | `pending` | investmentrelations@unclemays.com | 32 |

| Step | Day | Subject |
|------|-----|---------|
| 1 | 0 | a grocery platform launching in hyde park |
| 2 | 5 | the capital stack behind uncle may's |
| 3 | 12 | why this isn't just a grocery store |
| 4 | 20 | closing the round, uncle may's |

**Contact criteria:**
- Black commercial real estate professionals (national): developers, fund managers, investors
- Wealthy Black Chicago-based individuals: business leaders, entrepreneurs
- Sourced via Firecrawl web research + Apollo People Search enrichment
- Deduped against all 5 active campaigns
- Full contact list: [pipeline/cre-hnw/cre-hnw-contacts.md](../pipeline/cre-hnw/cre-hnw-contacts.md)

**Status:** Contact list compiled (32 contacts). Emails pending Apollo enrichment. Campaign creation pending.

---

## Email Sequences

### v2 (Founder voice, Tier 1)

Transcripts: [email-sequences/investor-sequence-v2.md](email-sequences/investor-sequence-v2.md)

| Step | Timing | Purpose | Key Proof Points |
|------|--------|---------|-----------------|
| 1 | Day 1 | Founder intro + thesis | Booth MBA, $100B market, Hyde Park flagship |
| 2 | Day 5 | Traction & de-risking | SBA secured, LOI signed, GM hired, 97% intent |
| 3 | Day 12 | Market & data moat | Margin layers (20-80%), unit economics, $625M Y10 |
| 4 | Day 20 | Closing with urgency | SAFE terms, leadership team, round closing |

### v2-tier2 (Brand voice, Tier 2)

Transcripts: [email-sequences/investor-sequence-v2-tier2.md](email-sequences/investor-sequence-v2-tier2.md)

Same 4-step structure as v2 but adapted for brand voice ("Uncle May's Produce" as sender). Anthony referenced as founder, not first-person narrator. Sign-off: "Uncle May's Produce / Anthony Ivy, Founder & CEO / (312) 972-2595 | unclemays.com"

### v3-cre (Brand voice, CRE & HNW)

Transcripts: [email-sequences/investor-sequence-v3-cre.md](email-sequences/investor-sequence-v3-cre.md)

Same 4-step, 20-day structure. Brand voice. Tailored for CRE professionals and HNW individuals:
- Email 1 leads with the physical asset (10,000 sq ft, Hyde Park, commercial lease)
- Email 2 emphasizes capital stack structure and institutional-grade unit economics ($629/sq ft)
- Email 3 explains the data platform moat (same as v2-tier2)
- Email 4 closing with SAFE terms and team (same as v2-tier2)

---

## Email Accounts

| Email | Status | Role |
|-------|--------|------|
| anthony@unclemays.com | Active (re-authenticated 2026-04-05) | Tier 1 campaign sender |
| denise@unclemays.com | OAuth needs re-auth, Warmbox running | Tier 2A campaign sender (151 contacts) |
| rosalind@unclemays.com | OAuth needs re-auth, Warmbox running | Tier 2B campaign sender (151 contacts) |
| invest@unclemays.com | OAuth needs re-auth, Warmbox running | Tier 2C campaign sender (151 contacts) |
| timj@unclemays.com | OAuth needs re-auth, Warmbox running | Tier 2D campaign sender (151 contacts) |
| investmentrelations@unclemays.com | OAuth needs re-auth, Warmbox running | CRE & HNW campaign sender (pending) |

---

## Archived Campaigns (v1 — retired)

> These campaigns used a failed v1 sequence (third-person voice, spam-triggering subjects, no personalization). All are permanently inactive. Total result: 489 delivered, 3 opens, 0 replies.

| Campaign | ID | Delivered | Opened | Replied | Bounced |
|----------|----|-----------|--------|---------|---------|
| Lead Gen & Outreach 5 | `69caeb04911a3800156eb599` | 125 | 1 | 0 | 1 |
| Lead Gen & Outreach 4 | `69cae9cce7fefb0011573113` | 132 | 1 | 0 | 1 |
| Lead Gen & Outreach 3 | `69cae7636fb20c0019ead4fc` | 62 | 0 | 0 | 2 |
| Lead Gen & Outreach 2 | `69cae3f4836212001d9a9f44` | 61 | 0 | 0 | 3 |
| Lead Gen & Outreach 1 | `69cabb45e7887500155a51e0` | 109 | 1 | 0 | 1 |
| Lead Gen & Outreach 6 | `69cfd6aae48ddd000d347042` | 0 | 0 | 0 | 0 |
| Investor Outreach v2 | `69d0080f3f33060019a7a262` | 0 | 0 | 0 | 0 |

**Lessons from v1 failure:**
- Third-person voice and no founder credibility killed open/reply rates
- Subject lines with dollar signs and "opportunity" triggered spam filters
- No warmup before sending destroyed deliverability
- All emails repeated the same pitch with no new information per step
