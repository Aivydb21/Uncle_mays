# Contact Files — Rules of the Road

Every investor contact has exactly one markdown file here. It is the single source of truth for what we know and what's next. The IR agent reads this file before every draft and writes back after every interaction.

## Filename convention

`{email-slug}.md` where `{email-slug}` is the email address lowercased, with `@` and `.` replaced by `-`.

Examples:
- `jane@fund.com` → `jane-fund-com.md`
- `bob.smith@example.co.uk` → `bob-smith-example-co-uk.md`

## Required frontmatter fields

| Field | Required | Values |
| ----- | -------- | ------ |
| email | yes | lowercased |
| name | yes | "First Last" |
| firm | yes | or "Individual" |
| segment | yes | S1 \| S2 \| S3 \| S4 \| S5 \| S6 |
| check_range | yes | "$25K-$100K" format |
| geography | yes | Chicago \| National \| Regional \| International |
| first_touch | yes | YYYY-MM-DD |
| last_touch | yes | YYYY-MM-DD |
| status | yes | active \| dormant \| in-dd \| committed \| passed \| do-not-contact |
| owner | yes | email of the internal owner (usually anthony@) |
| linkedin_url | optional | full URL |
| phone | optional | with country code |

## Required sections

1. **Thread Summary** — one paragraph max 6 sentences
2. **Last Signal** — verbatim quote with date + direction
3. **Pending Ask** — what they owe us OR we owe them (or "null")
4. **Objections Raised** — bulleted list, each with date + verbatim + status
5. **Thesis Fit Notes** — why this contact matters for Uncle May's
6. **Touch Log** — chronological interaction table
7. **Next Action** — one sentence with an owner and date

## Read/write rules for the IR agent

- **Before every draft**: load the file. If absent, build it from the Gmail thread using `build-contact-file.py` BEFORE drafting.
- **After every send**: append to Touch Log, update `last_touch` and Next Action.
- **After every reply received**: update Last Signal, Pending Ask, Objections Raised.
- **On status change**: write-through to `investor-crm.md`.

## Validation

Run `python investor-outreach/scripts/contact-file-lint.py` before committing changes. Exits non-zero on any schema violation.

## Backfill

On first setup, backfill is produced from:
- Every row in `investor-crm.md` (99 contacts)
- Every dormant thread surfaced by `analyze-gmail-followups.py` within a 120–210 day window

Expected initial volume: ~120 files.
