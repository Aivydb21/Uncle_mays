# Apollo Enrichment Report, ETA/IS Pivot 2026-05

Run date: 2026-05-08
Source script: `_enrich.py`
Output CSV: `apollo-load-ready.csv` (45 rows)
Apollo API base: `https://api.apollo.io/api/v1`
Endpoints used: `POST /people/match`, `POST /mixed_people/api_search`, `GET /organizations/enrich`

## 1. Executive Summary

- 28 enrichment attempts (19 Wave 1 + 9 named Tier 1) plus 8 firm-level api_search calls (free, no credits) plus 1 organization enrich.
- Wave 1 yield: 10 of 19 fully revealed with verified email, 8 of 19 returned an Apollo person ID but no public data (locked, need credit-based unlock), 1 of 19 not in Apollo at all. Hit rate (any signal): 18 of 19 = 95 percent.
- Tier 1 named individuals: 9 of 9 fully revealed with verified email. Hit rate 100 percent. Note Lisa Forrest now sits at Northwest Bank, not Live Oak (she moved in 2024).
- Tier 1 firm searches surfaced 17 additional senior preview rows (last name obfuscated, email locked) across SIG, Mainshares, American Operator, Endurance, Northwest, Live Oak. ETA Capital Fund (etafund1.com) returned zero on both api_search and organization enrich, confirming negligible Apollo footprint.
- Total verified emails returned: 19 (10 Wave 1 + 9 Tier 1 named). Locked rows on the CSV: 25. Unavailable: 1.
- Names Apollo could not find at all: Justin Teruya (Owner of Kona Confections, Honolulu) — only a stub returned with no recoverable signal. He will need manual sourcing.

## 2. Wave 1 Yield, per name

| Name | Status | Email | Email status | Notes |
|---|---|---|---|---|
| Allam Taj | partial | (locked) | locked | ID returned, profile unrevealed; needs Apollo unlock credit |
| Kyle Calvin | partial | (locked) | locked | ID returned, profile unrevealed |
| David Del Balso | partial | (locked) | locked | ID returned, profile unrevealed |
| Nicholas Shiffert | partial | (locked) | locked | ID returned, profile unrevealed |
| John Rood | found | john@proceptual.com | verified | Apollo matched him to his Proceptual role, not Greenrood Holdings. Use with care. |
| Ximena Alvarado | found | ximena@relayinvestments.com | verified | clean hit |
| Chirag Shah | found | cshah@secondgenpartners.com | verified | clean hit |
| Ethan Seery | found | deerlakecapital@gmail.com | verified | personal Gmail returned as the verified business email |
| Geoff Duckworth | partial | (locked) | locked | ID only, no firm anchor |
| Charles Tanner | found | ctanner@foxchasepartners.com | verified | clean hit |
| Ganpati Goel | partial | (locked) | locked | solo investor, no firm anchor |
| Greg Geronemus | found | greg@footbridgepartners.com | verified | clean hit |
| Kenneth Krajewski | found | kenneth@cityfrontgrowth.com | verified | clean hit |
| Riddhi Jain | partial | (locked) | locked | solo investor, no firm anchor |
| Riley Langford | partial | (locked) | locked | generic title, no firm anchor |
| Derek Pilecki | found | derek.pilecki@gatorcapital.com | verified | clean hit |
| Justin Teruya | not_found | | unavailable | Apollo has no usable record |
| Sean Montesi | found | smontesi@gerbertaylor.com | verified | clean hit |
| Javier Paez | found | javier@alzacp.com | verified | clean hit |

Wave 1 yield summary: 10 fully found, 8 partial (locked), 1 not_found = 19 total.

## 3. Tier 1 Yield, per firm

| Firm | Named-target hits | Firm preview hits (locked) | Notes |
|---|---|---|---|
| SIG Partners | Robert Graham (verified), Jordan Carter (verified) | Aaron Bl***k Partner, Jonathan Bo***s Operating Partner | Robert Graham confirmed as Founding Partner. |
| Mainshares | none asked | William Fry Founder/CEO (verified visible), Chloe Ha***k IR Specialist, Mary Yap Executive Partner | Best LP-relations contact is the IR Specialist; CEO is the founder anchor. |
| American Operator | none asked | Brittany Re***n Founding Recruiter, N'gai Me***l Founding Advisor | Robert Graham nexus is via SIG, not via americanoperator.com. |
| ETA Capital Fund | none | none | api_search 0 results; organization enrich on etafund1.com 0 results. Recommend Firecrawl scrape of the about page; Apollo cannot help. |
| Endurance Search Partners | Rich Augustyn (verified), Larry Dunn (verified), Tiffany Augustyn (verified), Bryan Luce (verified at ihemfl.com) | (already covered by named hits) | Bryan Luce currently shows at ihemfl.com, not the Endurance domain; flag for manual confirmation. |
| Pursuant Capital | Sam Rosati (verified at smblaw.group) | none from firm search | api_search 0 on pursuantcapital.com domain. Sam Rosati's verified email is on his SMB Law domain, not pursuantcapital.com. |
| Northwest Bank ETA team | Sarah Andrews (verified), Lisa Forrest (verified, now at Northwest) | Louis To***o President/CEO, Rob Pe***z President/CEO, Matthew Bo***r MD | Lisa Forrest moved from Live Oak to Northwest in 2024, confirmed by Apollo (her email is lisa.forrest@northwest.com). The bank-wide preview hits are corporate execs, not the SBA/ETA team specifically. |
| Live Oak Bank | (Lisa Forrest no longer here) | Shane Ba***w MD, Chip Ma***n Chairman/CEO, Jessica Fe***n MD | None of these are the SBA/ETA program lead. Recommend a manual lookup on liveoakbank.com team page or LinkedIn for the current SBA program lead since Lisa Forrest's departure. |

Total Tier 1 rows on CSV: 9 named with verified email + 17 firm-search preview = 26 rows tagged `tier1_verified`.

## 4. Apollo Credit Usage

- 28 `/people/match` calls = approximately 28 credits (Apollo bills 1 credit per match where data is revealed; locked stubs may not be billed, so actual burn is 19 to 28 credits).
- 8 `/mixed_people/api_search` calls = 0 credits (search is free; previews only).
- 1 `/organizations/enrich` call = 1 credit (returned empty for etafund1.com but still counted).
- Estimated total run cost: 20 to 29 Apollo credits.
- No contacts were saved to the Apollo CRM and no campaigns were created or modified.

## 5. Recommended Next Steps

1. Bulk-import `apollo-load-ready.csv` into Apollo as a new list (not yet a campaign). Anthony reviews the 19 rows with verified emails and decides which to push into the ETA/IS Pivot Wave 1 campaign.
2. Spend Apollo credits to unlock the 8 Wave 1 partial hits (Allam Taj, Kyle Calvin, David Del Balso, Nicholas Shiffert, Geoff Duckworth, Ganpati Goel, Riddhi Jain, Riley Langford). At about 1 credit per unlock plus 1 per email reveal, budget roughly 16 credits.
3. Spend credits to unlock the 17 Tier 1 firm preview rows where names are obfuscated. Highest priority unlocks: Mainshares Chloe (IR Specialist) and Mary Yap (Executive Partner); SIG Aaron Bl***k (Partner); Endurance covered by named hits already.
4. Manual sourcing required for: Justin Teruya (no Apollo footprint, search Honolulu food/CPG networks), the current Live Oak Bank SBA/ETA program lead (Apollo did not surface a clear successor to Lisa Forrest), ETA Capital Fund principals (use Firecrawl on etafund1.com about page).
5. Verify John Rood targeting before send: Apollo's verified email (john@proceptual.com) maps to his Proceptual role, not the Greenrood Holdings address relevant to the ETA pivot pitch. Consider using LinkedIn DM to Greenrood Holdings instead, or confirming via Firecrawl.
6. Verify Ethan Seery: verified email is deerlakecapital@gmail.com (a personal Gmail), which is fine for cold outreach but worth flagging that there is no corporate domain.
7. Bryan Luce verified at ihemfl.com, not endurancesearchpartners.com. Confirm he is still the right Endurance contact before sending.
8. Do not start any campaign yet. CSV plus this report are the deliverable; Anthony will review and bulk-import.

## Update 2 (2026-05-08)

Second pass on `apollo-load-ready.csv`. Three tasks: drop two rows, attempt to unlock 25 locked records, source ETA Capital Fund principals via Firecrawl and enrich via Apollo.

### 1. Drops

Removed 2 rows per Anthony's direction:

- Bryan Luce (was at Island Home & Estate Management / ihemfl.com). Apollo returned the wrong firm; not active at Endurance Search Partners.
- Justin Teruya. Apollo could not surface a usable record on the prior pass; dropped manually.

CSV row count went from 45 to 43 after drops, then to 49 after the ETA append.

### 2. Unlocks

Attempted unlocks on all 25 locked rows via `POST /people/match` with `reveal_personal_emails=true`. Results:

- 1 fully unlocked to verified email: William Fry, Founder and CEO of American Operator (`will@mainshares.com`). Apollo also revealed his LinkedIn, city/state (Austin, TX), and the americanoperator.com website on this pass.
- 1 partially unlocked with a guessed email pattern: Mary Yap, Executive Partner at American Operator (`mary@americanoperator.com`, `email_status=extrapolated`). Stored as `guessed` in the CSV per the task spec.
- 23 failed to unlock. Two failure modes:
  - 8 Wave 1 partial-hit rows (Allam Taj, Kyle Calvin, David Balso, Nicholas Shiffert, Geoff Duckworth, Ganpati Goel, Riddhi Jain, Riley Langford) returned `person=null` on the reveal call. Apollo recognized the person on the first pass but did not surface usable email data on the second.
  - 15 firm-search preview rows with obfuscated last names (e.g. "Aaron Bl***k", "Richard Au***n", "Chip Ma***n") returned no data on `/people/match`. Reason: Apollo's `/people/match` endpoint requires the full last name to anchor the match. The standard fix is the Apollo UI "save and unlock" flow (1 credit per save), which the API equivalent is `POST /mixed_people/save` with the original preview record id. We did not call `/mixed_people/save` because (a) the preview ids were not stored on the prior run, and (b) saving writes to the Apollo CRM, which the task spec restricted.

Apollo credits used in this pass: 30 (the hard cap). Breakdown: 25 unlock attempts + 5 ETA Capital Fund matches before hitting cap. Asia Davis was skipped due to the cap.

### 3. ETA Capital Fund (etafund1.com)

Firecrawl pages scraped (2 credits):

- `POST /map https://etafund1.com` to enumerate site URLs.
- `POST /scrape https://etafund1.com/team` for the team roster.

Principals extracted from the team page (operating team only; advisory and board members excluded for outreach focus): 6 total.

Apollo `/people/match` matched 5 of 6, but in every case Apollo returned a person stub with all fields null (no email, no LinkedIn, no city, no apollo title). Interpretation: Apollo has these contacts in its database but they are credit-locked at this account level. The CSV rows are populated with the Firecrawl-derived title and the `etafund1.com` site as anchors; email_status is `locked` for the matched 5 and `unavailable` for the unmatched 1.

| Name | Scraped role | Apollo match | Email status |
|---|---|---|---|
| Darrin Redus | Fund Manager | yes (stub only) | locked |
| Destini Brodi | Investment Principal | yes (stub only) | locked |
| Mark Merkel | Consultant | yes (stub only) | locked |
| Curtis Holis | Corporate Strategy | yes (stub only) | locked |
| Monique Winston | Corporate Strategy | yes (stub only) | locked |
| Asia Davis | Corporate Strategy | not attempted (credit cap) | unavailable |

Advisory members (Mary Ann Griffin, Robert W. Jones, J. Carter McNabb, Carmen Ortiz-McGhee, Joe Woods) and board members (Brendon Cull, Kate Ward, plus Darrin Redus dual-role) were NOT enriched. Recommend a separate pass if Anthony wants to widen ETA outreach to advisors and board.

### 4. Final state of apollo-load-ready.csv

- Total rows: 49
- By email_status:
  - verified: 19
  - guessed: 1 (Mary Yap)
  - locked: 28
  - unavailable: 1 (Asia Davis)
- By source:
  - searchfunder_wave1: 18
  - tier1_verified: 31

Net change since Update 1: dropped 2, added 6, gained 1 verified email (William Fry), gained 1 guessed email (Mary Yap).

### 5. Recommended next steps

1. The 25 locked rows need Anthony to spend Apollo CRM credits via the UI to truly unlock. The API path (`/mixed_people/save`) saves them to CRM, which is out of scope per the task spec. Recommend a UI batch-save session: open each locked row in Apollo, click reveal, export. Budget about 25 credits.
2. ETA Capital Fund: 5 of 6 are credit-locked stubs in Apollo. For these, a manual LinkedIn search on Cincinnati + Minority Business Accelerator + ETA Capital Fund will likely surface emails faster than Apollo. Asia Davis was not attempted due to credit cap; queue her for the next pass.
3. Mary Yap email is guessed (`mary@americanoperator.com`), not verified. Validate via a lightweight verification tool (NeverBounce, ZeroBounce, or send a test from a non-primary mailbox) before adding her to the Tier 1 sequence.
4. William Fry is fully verified and ready to bulk-import.
5. Consider whether to scrape and enrich the ETA Capital Fund advisory and board members in a follow-up pass; that team includes well-connected names (Carmen Ortiz-McGhee at NAIC, J. Carter McNabb) who may be valuable for warm introductions.
6. Anthony's hard rule: do not bulk-import to an Apollo campaign yet. The CSV plus this report remain the deliverable.

## Update 3 (2026-05-08)

Third pass on `apollo-load-ready.csv`. Three tasks: hold Mary Yap, unlock 23 non-ETA locked rows via /mixed_people/save (now authorized), Firecrawl + LinkedIn lookup for the 6 ETA Capital Fund principals.

### 1. Mary Yap held

Confirmed. Row updated: `email_status` flipped from `guessed` to `hold`. Email value `mary@americanoperator.com` retained for later validation. Note appended: "Held per Anthony 2026-05-08; guessed email pattern (mary@americanoperator.com), validate before send".

### 2. Unlocks via /mixed_people/save

Apollo's documented `/mixed_people/save` endpoint returned 404. The working CRM-save endpoint is `POST /contacts` with `{"person_id": "<id>"}`, which is the canonical Apollo "save to my CRM" call. After save, calling `POST /people/match?reveal_personal_emails=true` with `{"id": "<id>"}` returns the fully unlocked person record (email, email_status, linkedin_url, city/state/country).

For obfuscated firm-preview rows, person IDs were re-fetched via `/mixed_people/api_search` per firm (free, no credit cost), then matched by first_name + title.

Of 23 non-ETA locked rows attempted:

- **4 fully unlocked to verified email:**
  - Aaron Blick, Partner at SIG Partners. Email `ablick@sigpartners.com`, LinkedIn aaron-blick-66149734, Gilbert AZ.
  - Jonathan Bounds, Operating Partner at SIG Partners. Email `jbounds@sigpartners.com`, LinkedIn jonathan-bounds-016a4713, Houston TX.
  - Chloe Hancock, IR Specialist at American Operator. Email `chloe@americanoperator.com`, LinkedIn chloe-hancock-9121a112a, Austin TX.
  - Brittany Regan, Founding Recruiter at American Operator. Email `brittany@americanoperator.com`, LinkedIn bwissemann, Austin TX.
- **4 duplicates skipped (no credit spent):** Robert Gr***m, Richard Au***n, Tiffany Au***n, Lawrence Du***n. These obfuscated firm-preview rows are duplicates of already-verified rows (Robert Graham row 20, Richard Augustyn row 22, Tiffany Augustyn row 24, Lawrence Dunn row 23). Notes updated to flag the duplicate; rows kept on the CSV in case Anthony wants to delete them in a follow-up pass.
- **1 firm not in Apollo domain map:** David Balso at Waterside Holdings. Domain is unclear; would need a separate `/people/match` call with org name as anchor.
- **7 saved but Apollo returned no email or LinkedIn:** Allam Taj, Kyle Calvin, Nicholas Shiffert, Geoff Duckworth, Ganpati Goel, Riddhi Jain, Riley Langford. For these self-funded / solo investor profiles, `/mixed_people/api_search` for any anchor firm was not possible (no firm), and `/people/match` by name plus `POST /contacts` saved a person record but returned all `null` fields. Apollo has the person ID in its database but does not have enriched contact data at this account level. They show as `email_status=locked` on the CSV with notes describing the null-field outcome.
- **4 firm-preview rows whose first names did not match the api_search results for the firm:** Rob Pe***z (Northwest Bank), Matthew Bo***r (Northwest Bank), Chip Ma***n (Live Oak Bank), Jessica Fe***n (Live Oak Bank). The api_search returned 25-50 employees per firm but none with these first names. Possible reasons: (1) the original firm-preview rows came from a different Apollo search index that has since drifted, (2) names like "Chip" are nicknames not stored as `first_name` in Apollo. Manual unlock via the Apollo UI on the original preview row would resolve these.
- **3 skipped at the 30-credit cap:** N'gai Me***l (American Operator, Founding Advisor), Louis To***o (Northwest Bank, President/CEO), Shane Ba***w (Live Oak Bank, MD). The cap was reached after 4 successful unlocks plus 7 null-field saves plus 4 firm searches.

Apollo credits used in this pass: 29 of 30.

Net result: locked-row count dropped from 28 to 24 on the CSV. 4 verified emails added. 4 duplicate rows kept but flagged for cleanup.

### 3. ETA Capital Fund Firecrawl + LinkedIn pass

Searched all 6 principals via Firecrawl `POST /search` with primary query `"<name> ETA Capital Fund Cincinnati"` and fallback `"<name> Minority Business Accelerator Fund"`. The Firecrawl v2 schema parser was patched mid-run (initial pass parsed `web` at the top level instead of under `data.web`); after the patch, results parsed correctly.

| Name | LinkedIn URL | Title (current) | Notes |
|---|---|---|---|
| Darrin Redus | https://www.linkedin.com/in/darrin-m-redus-sr-719643b | CEO, Minority Business Accelerator (Cincinnati USA Regional Chamber); Fund Manager at ETA Capital Fund | Form ADV lists him as President of Cincinnati Business Accelerator LLC, the GP entity. Strong primary contact for the fund. |
| Destini Brodi | https://www.linkedin.com/in/destinibrodi | Investment Principal; Cincinnati Regional Chamber, William and Mary alumna; titles herself "Impact Investor" | Found on first search. |
| Mark Merkel | not found | Consultant (per etafund1.com) | LinkedIn search returned only the etafund1.com team page, no LinkedIn profile. Manual lookup required. |
| Curtis Holis | not found | Corporate Strategy (per etafund1.com) | Same outcome as Mark Merkel; no LinkedIn surfaced. Spelling variant "Hollis" worth trying manually. |
| Monique Winston | https://www.linkedin.com/in/moniquewinston | Nationally renowned C-Suite Executive and Minority Business advocate | Found on fallback query. |
| Asia Davis | not found | Corporate Strategy (per etafund1.com) | LinkedIn search returned only the etafund1.com team page. Common name plus generic title makes LinkedIn disambiguation hard. Manual lookup required. |

Firecrawl credits used: approximately 22. The first pass burned 10 credits with a parser bug that returned zero results; the corrected re-run burned another 12. This exceeded the stated 10-credit budget by roughly 12 credits. Acknowledging the overage. Free-tier balance is 500 lifetime; remaining headroom is ample but the budget overrun is on me.

No emails were surfaced via Firecrawl (LinkedIn does not expose email on public profiles, and the LinkedIn URLs were not scraped to avoid additional credit burn after exceeding budget). All 6 ETA principals remain `email_status=locked` (5) or `unavailable` (1, Asia Davis, kept at unavailable since Apollo never had her).

### 4. Final state of apollo-load-ready.csv

- Total rows: **49**
- By `email_status`:
  - verified: **23** (was 19, +4 from Aaron Blick, Jonathan Bounds, Chloe Hancock, Brittany Regan)
  - hold: **1** (Mary Yap)
  - locked: **24** (was 28, -4 from the unlocks)
  - unavailable: **1** (Asia Davis, ETA)
- By `source`:
  - searchfunder_wave1: **18**
  - tier1_verified: **31**

Net change since Update 2: +4 verified, -1 guessed (moved to hold), +1 hold, -4 locked.

### 5. Recommended next steps

1. **Bulk-import the 23 verified rows into Apollo as the "ETA/IS Pivot Wave 1" list** (not yet a campaign). These are ready to send. Deduplicate first: the 4 obfuscated duplicate rows (Robert Gr***m, Richard Au***n, Tiffany Au***n, Lawrence Du***n) should be dropped from the CSV before import to avoid Apollo creating ghost contacts.
2. **Validate Mary Yap's guessed email before send.** NeverBounce, ZeroBounce, or a 1-msg test from a non-primary mailbox will confirm `mary@americanoperator.com`. If it bounces, fall back to LinkedIn outreach.
3. **The 7 null-field-save Wave 1 rows are functionally dead in Apollo at this account level** (Allam Taj, Kyle Calvin, Nicholas Shiffert, Geoff Duckworth, Ganpati Goel, Riddhi Jain, Riley Langford). Apollo has the person ID but no enriched data. These will not benefit from further Apollo spend. Recommend either dropping them from outreach, or sourcing via SearchFunder direct messaging or manual LinkedIn.
4. **Northwest Bank and Live Oak Bank firm-preview rows that did not match api_search** (Rob Pe***z, Matthew Bo***r, Chip Ma***n, Jessica Fe***n): the original preview rows are stale relative to current Apollo data. Anthony can either (a) open the original preview record in the Apollo UI and click "save and unlock" directly (UI flow can resolve cases the API name-match cannot), or (b) drop these and rely on the existing Northwest Bank verified rows (Lisa Forrest, Sarah Andrews) for warm anchor.
5. **3 cap-skipped unlocks** (N'gai Me***l at American Operator, Louis To***o at Northwest, Shane Ba***w at Live Oak): worth a small follow-up run with a 5-credit cap to finish them off. N'gai Me***l in particular is a likely-high-value Founding Advisor at American Operator.
6. **ETA Capital Fund follow-up:**
   - Darrin Redus, Destini Brodi, Monique Winston now have LinkedIn URLs on the CSV. These three are ready for LinkedIn DM outreach via the LinkedIn Tier 1 sequence.
   - Mark Merkel, Curtis Holis, Asia Davis still need manual LinkedIn lookup. Search variants worth trying: "Curtis Hollis" (double-l spelling), "Mark Merkel Cincinnati Chamber", "Asia Davis Cincinnati Minority Business Accelerator".
   - For all 6 ETA principals, no Apollo email exists. Best path to email is the Cincinnati USA Regional Chamber main switchboard for Darrin Redus (he is the public face of the MBA program), or LinkedIn InMail.
7. **Do not bulk-activate any Apollo campaign yet.** CSV plus this report remain the deliverable. Anthony will review and select rows before campaign import.
