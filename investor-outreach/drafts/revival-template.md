# Dormant Thread Revival Template

Used by `dormant-thread-revival.ts` to generate context-aware revival drafts. Fields wrapped in `{...}` are substituted at generation time from the contact file and the parsed Gmail thread.

## Subject

`Re: {OriginalSubject}` — always keeps the prior thread. Never starts a new subject.

## Body

```
{FirstName}, circling back after {TimeSinceLastExchange}. When we last
spoke on {LastExchangeDate}, you {LastSignalOneLine}.

Here is what has changed since: {2–4 crisp updates from UpdateBank, chosen
to match their prior interest}. {OneSentenceAddressingPriorObjectionOrAsk}.

Happy to send the updated teaser and a 15-minute window.
Phone: (312) 972-2595.

– Anthony
```

## Style constraints (hard rules)

- **No em-dashes (—)**. Use two hyphens or restructure the sentence.
- **≤ 2 paragraphs** of body, not counting the sign-off line.
- **No Calendly** in cold or revival outreach — phone only.
- **Investor-to-investor voice**: concise, numerate, no marketing fluff.
- **Phone + teaser offer** always in the closing paragraph.
- **No em dashes and no exclamation points**.
- **No "Hope you're well"** or variants.

## Substitution sources

| Field | Source |
|-------|--------|
| `{FirstName}` | contact file frontmatter `name`, first token |
| `{TimeSinceLastExchange}` | human-readable gap from last thread message timestamp |
| `{LastExchangeDate}` | last message date in "Mon DD, YYYY" format |
| `{LastSignalOneLine}` | contact file "Last Signal" section, paraphrased to ≤ 20 words |
| `{OriginalSubject}` | Gmail thread subject with any existing "Re: " stripped |
| `{UpdateBank}` | company-level update bank (next section) |
| `{OneSentenceAddressingPriorObjectionOrAsk}` | drawn from contact file "Objections Raised" or "Pending Ask"; if neither, omit |

## Update bank (maintained monthly)

Source of truth: `investor-outreach/materials/update-bank.md`. The revival generator picks 2–4 updates scoring highest against the contact's prior interests.

Current update bank (as of 2026-04-19; IR agent must refresh this monthly):

1. SBA 7(a) loan secured.
2. Flagship GM hired (Dee Robinson advising).
3. Hyde Park location — LOI progress / opening window.
4. MacArthur Strategic Capital in due diligence.
5. First-month retail traffic + basket size data.
6. Subscription product live on unclemays.com.
7. Team adds (commercial leads, CPG data hires).

## Output format for daily digest

Each generated draft is serialized as:

```
---
contact_id: {email_slug}
contact_name: {Name}
firm: {Firm}
segment: {S1-S6}
days_dormant: {N}
last_signal: "{verbatim quote max 300 chars}"
pending_ask: {null | text}
objections_referenced: [{dates}]
subject: Re: {OriginalSubject}
---

{body}
```

The morning digest formatter groups these under "Revive Today" with approve/edit UI.
