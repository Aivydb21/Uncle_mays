# Apollo Campaign Launch Config, Wave 1

**Date:** 2026-05-09
**File to import:** [apollo-import-wave1-ready.csv](apollo-import-wave1-ready.csv) (23 rows)
**Sender:** anthony@unclemays.com
**Daily volume cap:** 10 sends per day
**Expected campaign duration:** 3 to 4 days for first-touch coverage, 20 days for the full four-email sequence per contact.

This is a step-by-step play that takes about 20 minutes in the Apollo UI. Run through it once and the campaign goes live. Sends start the next business day after activation.

---

## Step 1, Import the CSV

1. Apollo UI: **Search** → **People** → top-right **Import** → **Import CSV**
2. Upload `apollo-import-wave1-ready.csv`
3. **Import settings:**
   - Match by: email
   - On duplicates: skip (you have zero overlap with the existing 3,275-contact CRM, but this guards against accidental re-import on a re-run)
   - Add to a new list named: **`UM Wave 1 ETA SF LPs`**
4. **Field mapping** (Apollo will auto-detect most; verify these explicitly):

   | CSV column | Apollo field |
   |---|---|
   | first_name | First Name |
   | last_name | Last Name |
   | email | Email |
   | linkedin_url | LinkedIn URL |
   | title | Title |
   | organization_name | Company / Organization |
   | organization_website | Company Website |
   | city | City |
   | state | State |
   | country | Country |
   | source_tag | Custom field: `Source` (create if not present) |
   | tier | Custom field: `UM Tier` (create if not present) |
   | notes | Custom field: `UM Notes` (create if not present) |

5. Click **Import**. Apollo confirms 23 rows imported. Review any errors before proceeding.

---

## Step 2, Create the campaign / sequence

1. Apollo UI: **Engage** → **Sequences** → **New Sequence**
2. Name: **`UM 2026 ETA SF LP Outreach v1`**
3. **Settings:**
   - Sender mailbox: `anthony@unclemays.com`
   - Sending schedule: **Mon to Thu, 9:00am to 5:00pm Central**, paused Fri to Sun (avoids weekend sends to a sophisticated audience)
   - Daily limit per mailbox: **10 sends per day**
   - Stop on reply: **yes**
   - Pause on out-of-office: **yes**
   - Bounce killswitch: 5% campaign-level
   - Tracking: opens **on**, clicks **on**, unsubscribe link **off** (this is regulated investor outreach to accredited targets, opt-out is by reply per applicable rules)

---

## Step 3, Load the four-email sequence

The sequence is in [email-sequence.md](email-sequence.md). Apollo merge-tag versions are below; copy each block directly into the Apollo step editor.

### Step 1, Day 0, Email

**Subject (A/B test, 50/50 split):**

- A: `Self-funded searcher deal, Chicago grocery, $400K preferred + SBA`
- B: `Single-asset grocery deal, SBA 7(a) + preferred equity, Chicago`

**Body:**

```
{{first_name}},

I am running a self-funded searcher deal on a single grocery asset in Hyde Park, Chicago. Existing location, $8M+ in revenue at this address for the past three years, 10,000 sq ft, transit-connected. Capital stack is a $2.0M SBA 7(a) senior facility (Busey Bank, conditionally approved) plus $400K of preferred equity and $100K of UChicago tenant improvement support. I am the operator-CEO, Booth MBA, prior PE and M&A.

The base case underwrites at 18.4 percent five-year IRR, 23.3 percent ten-year IRR on the single asset, with an 8 to 10 percent accruing preferred return and a cumulative realized cash sweep to investors at 3.0 to 3.2x. Named GM is Matt Weschler, two prior Chicago grocery exits. Worth a fifteen-minute call if the structure fits your sleeve.

Anthony Ivy
Founder and CEO, Uncle May's Produce
(312) 972-2595
```

### Step 2, Day 4, Email (reply on same thread)

**Subject:** `Re: {previous}`

**Body:**

```
{{first_name}},

Following up with the one-page teaser. Same deal: single-asset Chicago grocery, $400K preferred alongside a $2.0M SBA 7(a) facility, ten-year hold, 18.4 percent / 23.3 percent IRR base case.

Happy to walk through the unit model and downside cases if useful. Hyde Park location is the existing $8M+ revenue store, not a greenfield bet, which is what makes the senior debt and the equity stack underwriteable.

Anthony Ivy
(312) 972-2595
```

**Attachment:** the one-page teaser PDF (rendered from [teaser-one-pager.md](teaser-one-pager.md); see Step 4 below if not yet rendered).

### Step 3, Day 10, Email (reply on same thread)

**Subject:** `Re: {previous}`

**Body:**

```
{{first_name}},

One more note on this one because it sits in a niche I do not think gets shown often. The asset is an existing 10,000 sq ft grocery store at the same address that has done $8M+ in revenue for three consecutive years. The flagship plan is to take over that footprint, re-position it as a culturally aligned format, and operate it as a single-asset, ten-year hold. No platform overhead, no rollout pressure, no carry.

Matt Weschler runs the store. He started, ran, and exited two prior Chicago grocery stores; he is currently GM at Wild Onion. The DSCR sits at 4.9x in year one and stabilizes at 4.8x. SBA conditional commitment is already in place pending the equity tranche close.

If you back self-funded searchers and the structure fits, I would be glad to send the full deck and unit model.

Anthony Ivy
(312) 972-2595
```

### Step 4, Day 20, Email (reply on same thread, final close-out)

**Subject:** `Closing the loop`

**Body:**

```
{{first_name}},

Closing the loop on this one. The Hyde Park flagship deal closes the equity tranche on a defined timeline so we can activate the SBA facility. If it is not a fit for your sleeve, no worries; if you know an LP or family office in your network that backs self-funded searcher deals in food retail, an introduction would be appreciated.

Either way, thanks for the time on the read.

Anthony Ivy
Founder and CEO, Uncle May's Produce
(312) 972-2595
```

---

## Step 4, Render the teaser to PDF

Email 2 attaches the one-page teaser. Two options:

- **Fastest:** open [teaser-one-pager.md](teaser-one-pager.md) in any markdown-to-PDF tool (VS Code with the Markdown PDF extension, or `pandoc teaser-one-pager.md -o teaser-one-pager.pdf`). 5 minutes.
- **Branded:** push the markdown through Gamma using the same flow as the institutional deck. Gamma styling, single page output. 10 minutes. The institutional pitchbook generation script in `Desktop/um_website/investor-outreach/materials/deck-rework-2026-05/` is a workable template.

Save the rendered PDF as `teaser-one-pager.pdf` in this folder. Upload as the email 2 attachment in Apollo.

---

## Step 5, Personalize email 1 openers (do this BEFORE activating the sequence)

Apollo's bulk-personalization tool lets you write a unique opener line per contact, inserted as a `{{first_line}}` merge tag at the top of email 1. Recommended for Tier 1 firm contacts (the 13 firm-tagged rows). Skip for the 10 Wave 1 individual rows where personalization adds friction without yield.

For each Tier 1 firm contact, the opener should be one short sentence referencing one of:

- A specific deal the firm has publicly backed that matches the pattern (single-asset, SBA-leveraged, operator-led)
- The firm's stated thesis on self-funded searchers if it is on their site
- A Booth, HBS, Wharton, or other warm tie if real

If you cannot find a specific reference for a contact, leave the opener blank for that contact (Apollo will skip the merge tag cleanly).

Time budget: 15 to 20 minutes for the 13 Tier 1 firm contacts. This is the single highest-leverage step in the launch.

---

## Step 6, Add the imported list to the sequence

1. Sequences → `UM 2026 ETA SF LP Outreach v1` → **Add Contacts**
2. Add by list: `UM Wave 1 ETA SF LPs`
3. Apollo previews the 23 contacts. Confirm they all have valid email and that no one has the `Stop` or `Bounced` flag from any prior interaction.
4. Click **Add and Activate**

---

## Step 7, Activate

1. Sequence settings → **Active**: yes
2. First sends fire on the next scheduled send window (typically the next business morning at 9 a.m. Central).
3. Daily limit caps at 10, so all 23 contacts get the first email within 3 business days.

---

## Post-launch monitoring

In Apollo:

- **Engage → Sequences → UM 2026 ETA SF LP Outreach v1 → Analytics:** open rate, reply rate, bounce rate refresh in real time.
- **Send window:** Mon to Thu only. Friday-through-Sunday silence is intentional.
- **Anthony manually monitors anthony@ inbox** for replies. Replies stop the sequence automatically per the Stop on Reply setting.

In this workspace:

- A daily-stats pull script can be added to `investor-outreach/scripts/` that hits the Apollo Sequences API and writes a one-line summary to a daily log. Available on request.

---

## Wave 1.5 (parked, not in this launch)

The 10 contacts in [apollo-import-wave1-5-pending.csv](apollo-import-wave1-5-pending.csv) are **not** loaded in this campaign. They are:

- **1 hold:** Mary Yap (American Operator, validate guessed pattern)
- **3 locked, candidates for Apollo UI batch-unlock:** N'gai Me***l (American Operator, Founding Advisor), Louis To***o (Northwest Bank, President/CEO), Shane Ba***w (Live Oak Bank, Managing Director)
- **6 ETA Capital Fund:** Darrin Redus, Destini Brodi, Mark Merkel, Curtis Holis, Monique Winston, Asia Davis. Three have LinkedIn URLs surfaced via Firecrawl (Darrin, Destini, Monique) and are LinkedIn DM targets, not email targets.

Address Wave 1.5 only after Wave 1 produces reply data, or in parallel if you want to push faster. The LinkedIn DM template is in [linkedin-sequence.md](linkedin-sequence.md).

---

## Stop conditions, kill switch

- **5% bounce rate at the campaign level:** pause the campaign immediately, investigate.
- **Any reply mentioning the deal pattern is wrong / not a fit / wrong audience:** read carefully; if more than two replies converge on the same signal, pause and reconsider.
- **Negative signal from Robert Graham at SIG Partners or Sam Rosati at Pursuant Capital:** these are the most authoritative voices on self-funded searcher deal patterns; their feedback is more weighted than other replies.

If anything trips, pause in Apollo UI; the sequence preserves state and can resume cleanly.
