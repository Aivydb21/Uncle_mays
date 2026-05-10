# Uncle May's, ETA / Self-Funded Searcher Pivot Workspace

**Date:** 2026-05-08
**Owner:** Anthony Ivy

This folder is the working set for the repositioning of Uncle May's investor outreach from venture-style targets to self-funded searcher LPs. All artifacts are produced for the Hyde Park flagship $400K preferred equity raise on top of the $2.0M SBA 7(a) facility.

## File guide

| File | What it is | Status |
|---|---|---|
| [positioning-brief.md](positioning-brief.md) | Strategic shift, audience, and messaging changes | Locked |
| [email-sequence.md](email-sequence.md) | Four-email cold sequence over 20 days, sender anthony@ | Locked |
| [linkedin-sequence.md](linkedin-sequence.md) | Profile view, connection request, DM templates | Locked |
| [teaser-one-pager.md](teaser-one-pager.md) | One-page deal teaser for email 2 of the cold sequence | Locked, pending PDF render |
| [target-list.md](target-list.md) | Tier 1 firms (verified) plus Tier 2 Black ETA introducer cluster | Locked |
| [verification-report.md](verification-report.md) | Tier 1 Firecrawl verification, Black ETA research, Apollo cross-check | Historical record |
| [searchfunder-raw.txt](searchfunder-raw.txt) | Raw Searchfunder paste (385 entries after curation) | Source data |
| [searchfunder-scored.csv](searchfunder-scored.csv) | All 385 entries scored on geo + title + alumni | Source data |
| [searchfunder-top-tier.md](searchfunder-top-tier.md) | Wave 1 / Wave 2 / archive cuts | Locked |
| [score_searchfunder.py](score_searchfunder.py) | Scoring script (re-runnable if more entries pasted) | Tool |
| [apollo-load-ready.csv](apollo-load-ready.csv) | Combined contact list (33 rows: 23 verified + 10 parked) | Reference |
| **[apollo-import-wave1-ready.csv](apollo-import-wave1-ready.csv)** | **23 verified contacts, Apollo-import schema, ready to upload** | **Active** |
| [apollo-import-wave1-5-pending.csv](apollo-import-wave1-5-pending.csv) | 10 parked contacts (hold/locked/unavailable) for Wave 1.5 | Pending |
| **[apollo-launch-config.md](apollo-launch-config.md)** | **Step-by-step Apollo UI launch playbook with sequence merge-tag content** | **Active** |
| [apollo-dropped.csv](apollo-dropped.csv) | Rows dropped during cleanup, with `_drop_reason` audit column | Audit trail |
| [apollo-enrichment-report.md](apollo-enrichment-report.md) | Apollo enrichment runs 1, 2, 3 with stats and credit usage | Historical record |

## apollo-load-ready.csv breakdown

**33 rows total.** By email_status:

- **23 verified** ready to send today
- **1 hold** (Mary Yap, guessed pattern, validate before send)
- **8 locked** (need Apollo UI batch-unlock or LinkedIn DM, see below)
- **1 unavailable** (Asia Davis, ETA Capital Fund, manual lookup)

By source:

- **23 tier1_verified** (SIG, American Operator/Mainshares, Endurance, Pursuant, Northwest Bank, ETA Capital Fund)
- **10 searchfunder_wave1** (high-signal Searchfunder names with verified email)

## Recommended outreach split

**Email channel (24 contacts):** 23 verified rows plus Mary Yap once you validate her pattern. Bulk-import to Apollo, run the four-email sequence at 10/day for two days.

**Apollo UI batch-unlock attempt (3 contacts):** N'gai Me***l (American Operator, Founding Advisor), Louis To***o (Northwest Bank, President/CEO), Shane Ba***w (Live Oak Bank, Managing Director). These were skipped at the credit cap during the agent run; a UI session can unlock them, possibly with a few more credits.

**LinkedIn DM channel (3 to 6 contacts):** ETA Capital Fund principals. Three have LinkedIn URLs surfaced via Firecrawl (Darrin Redus, Destini Brodi, Monique Winston). Three need manual lookup (Mark Merkel, Curtis Holis, Asia Davis). Use the LinkedIn DM template from [linkedin-sequence.md](linkedin-sequence.md).

## Open items requiring decisions

- **John Rood email** maps to Proceptual, not Greenrood Holdings. Verify on LinkedIn before send or pull from list.
- **Sam Rosati email** from Apollo is `sam@smblaw.group` (his SMB Law Group firm), not `info@pursuantcapital.com`. The smblaw.group email is direct and likely fine; Pursuant Capital may forward to it anyway. Anthony's call.
- **Mary Yap** validation before send.
- **ETA Capital Fund $1M minimum check** vs. $400K total round size. Decide whether to expand the equity tranche, ask them to syndicate, or hold them for a future deal. Affects whether Darrin Redus / Destini Brodi / Monique Winston get the standard cold pitch or a customized one.

## Drops (audit trail in apollo-dropped.csv)

- **8 null-data Wave 1 rows** (Allam Taj, Kyle Calvin, David Balso, Nicholas Shiffert, Geoff Duckworth, Ganpati Goel, Riddhi Jain, Riley Langford). Apollo has the IDs but no enriched data at this account level. Manual LinkedIn lookup possible if any prove high-priority later.
- **4 obfuscated duplicate rows** (Robert Gr***m, Richard Au***n, Tiffany Au***n, Lawrence Du***n). All redundant with their unlocked verified-email counterparts.
- **4 obfuscated API-failed rows** (Rob Pe***z, Matthew Bo***r, Chip Ma***n, Jessica Fe***n). Apollo's api_search could not match these to the firms; they may be stale firm-search artifacts.
