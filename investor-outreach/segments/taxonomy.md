# Investor Segment Taxonomy — Uncle May's Produce

Replaces the prior Tier 1/2/3 framing. Every investor contact is assigned exactly one segment in `S1–S6`. Strategic corporates (S7) are descoped for the current raise and will be revisited post-close.

## Segments

| Segment | Description | Check range | Entry style | Active status |
|---------|-------------|-------------|-------------|---------------|
| **S1** | VC — thesis-aligned (existing Tier 1) | $50K–$250K | Cold sequence + warm-intro mining | 87 contacts live (Apollo) |
| **S2** | VC — warm-fit (existing Tier 2) | $25K–$100K | Brand-voice sequence across 4 senders | 604 contacts (partial OAuth block) |
| **S3** | Philanthropic / mission-aligned | $25K PRI, $50K–$500K MRI, grants | Warm, thesis-led | Seeding now |
| **S4** | HNW / family offices (Chicago-first) | $25K–$250K | Warm intros only | Seeding now |
| **S5** | Angel syndicates / groups | $25K–$100K | Syndicate-gated | Seeding now |
| **S6** | Grants / non-dilutive / accelerators | $10K–$250K | Application | Seeding now |
| ~~S7~~ | ~~Strategic corporates~~ | — | — | Descoped |

## Scoring weights per segment

Contacts are scored 0–100 within their segment. Activation queue sorts by score desc, then `days_since_last_touch` asc.

### Common factors (all segments)

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Thesis fit (food / Black consumer / retail / community wealth) | 25 | Primary filter; below 10 → exclude |
| Check size within segment range | 10 | Must be in range to score |
| Chicago geography | 10 | Flagship is Chicago; reduces to 5 for National |
| Decision speed ≤60 days | 10 | Accelerates raise closing |
| Portfolio overlap (similar companies invested) | 10 | Signal of thesis validation |
| Warm path identified | 15 | Warm beats cold every time |
| Recent activity (last 6 months) | 10 | Active check-writers only |
| Prior engagement with Uncle May's | 10 | Replies, meetings, referrals |

### Segment-specific modifiers

- **S3 Philanthropic**: +10 if PRI/MRI capacity confirmed, +5 if food-system grant history, +5 if Black-led / Black-serving mission alignment.
- **S4 HNW**: +15 if warm path identified (mandatory gate — no warm, no activation), +5 if food/grocery/CPG operator experience, +5 if real-estate exposure.
- **S5 Angels**: +10 if syndicate lead identified, +5 if food/consumer angel specialty, +5 if operator angels (not just passive LPs).
- **S6 Grants**: +15 if current application window open, +10 if Uncle May's is explicitly eligible (geography, revenue, sector), +5 if prior winners in our space.

## Activation gates (hard requirements before outbound)

Each segment has a gate. No outbound send until gate is passed.

| Segment | Activation gate |
|---------|-----------------|
| S1 | In Apollo Tier 1 campaign OR written warm-intro path |
| S2 | In Apollo Tier 2 campaign on a healthy sender account |
| S3 | Thesis field populated; PRI/MRI indicator present; sequence chosen (grant / PRI / MRI) |
| S4 | Warm path named in frontmatter (who introduces, status) |
| S5 | Syndicate lead identified; if group, application window confirmed open |
| S6 | Application window open; eligibility confirmed |

## Unified activation queue

All segments feed into a single CSV — `segments/activation-queue.csv` — which the morning digest consumes. Required columns:

```
segment, email, name, firm, score, check_range, geography, entry_path, warm_path, thesis_one_liner, days_since_touch, next_action
```

The queue regenerates daily from contact files at 07:30 CT (before the 08:00 morning digest).

## Ownership

- **S1, S2, S3, S4, S5, S6**: Investor Relations agent (906e449e).
- **S3 PRI conversations**: CFO (Jua — bfcf59d8) loops in for diligence.
- **S4 checks ≥$100K**: CFO loops in for terms.
- **S6 grant applications**: IR agent owns authorship; CEO (Anthony — 204674de) signs.

## References

- Full scoring implementation: `scripts/prioritize-contacts.py`, `scripts/score-mission-aligned.py`
- Seed lists: `segments/S3-philanthropic.md`, `segments/S4-hnw-chicago.md`, `segments/S5-angels.md`, `segments/S6-grants.md`
- Existing S1/S2 data: `pipeline/tier-1/`, `pipeline/tier-2/`, `contacts/apollo-investor-contacts.md`
