# Airtable health report, Phase 1 of product mix reset

**Audit date:** 2026-05-16
**Plan reference:** `C:\Users\Anthony\.claude\plans\i-realize-that-our-mellow-pnueli.md`
**Paperclip audit issue:** UNC-1133

## Headline numbers

| Asset | Where | Records |
|---|---|---|
| Live customer catalog | `appm6F6H9obydzAM2 / Catalog` | **47** active SKUs |
| Product Mix sourcing pipeline | `app3raEVB9kHeUoHE / Imported table` | **1,025** candidate items |
| Unified Suppliers DB | `appm6F6H9obydzAM2 / Suppliers` | **1,320 suppliers (826 with email)** |
| Black Vendors (legacy) | `appHgPTKlcuFKajQp` | **Archived 2026-05-01**, merged into Suppliers |

The two bases are NOT the same source. The site reads only from the Catalog table. The 1,025-record figure quoted in earlier prep notes refers to the sourcing pipeline, which is not consumed by the live site.

## Live catalog (47 SKUs) by category

| Category | SKUs (approx) |
|---|---|
| Greens | ~14 (kale, lettuces, chard, mustards, asparagus, salad mix, ramps) |
| Roots | ~12 (radishes, potatoes, sweet potatoes, carrots, sunchokes, black garlic) |
| Pantry | ~10 (mostly beans; spruce branches) |
| Microgreens | ~6 |
| Protein | ~5 (pastured chicken, beef short ribs x2, lamb chops, eggs) |

**Verdict on live catalog:** CEO's intuition is correct. There are no snacks, no heat-and-eat, no frozen, no broader meat selection (no ground beef, no pork, no fish, no deli), no dry goods beyond beans, no beverages, no breakfast staples, no non-food. A customer cannot do a weekly grocery trip here.

The `VALID_CATEGORIES` whitelist in `src/lib/catalog/airtable.ts` does exist, but it doesn't hide inventory: the curated Catalog table only contains these 5 categories anyway. **Conclusion: the gap is sourcing, not filtering.** Earlier framing that called this a "code filter problem" was incorrect.

## Product Mix sourcing pipeline (1,025 items): characterization

Audit sampled 1,000 of 1,025 records (97%). Distribution of stand-out categories:

| Category | Items |
|---|---|
| Uncategorized | 288 |
| Beverages | 251 |
| Snacks | 63 |
| Gift Sets | 44 |
| Pantry | 33 |
| Spice & Herbs | 31 |
| Baking Goods | 28 |
| Spices, Sauces, and Condiments | 21 |
| Wellness | 21 |
| Baking | 21 |
| Baking & Bread Ingredients | 19 |
| Kitchen Utensils | 19 |
| Meats & Proteins | 17 |
| Condiments and Sauces | 16 |
| Frozen Foods | 14 |
| Vegetables, Fruits, Canned Goods | 11 each |
| Health, International | 10 + 9 |

Notable category overlap (e.g. "Baking" / "Baking Goods" / "Baking & Bread Ingredients"; "Spice & Herbs" / "Spices, Sauces, and Condiments" / "Condiments and Sauces") suggests the taxonomy is messy and was assembled from multiple sources without dedupe.

### Completeness, out of 1,000 sampled rows

| Field | Populated |
|---|---|
| Vendor Company (linked select) | 807 / 1000 |
| Price per Unit | 738 / 1000 |
| Retail Price | 738 / 1000 |
| Email (vendor contact email) | **0 / 1000** |
| Onboarding Status | **0 / 1000** |

**Interpretation:** This is a **research / wishlist database**, not an active sourcing pipeline. Vendor company names are tagged on most rows and target pricing exists on three-quarters, but there is no contact info recorded on any row and no evidence of active onboarding. It functions as a candidate list that someone (a prior agent, a research pass) populated by scraping or compiling vendor catalogs.

### Bucket scoring against the audit's original A/B/C scheme

- **Bucket A (real and shippable today):** 0. No rows show evidence of an established vendor relationship, contact, or onboarding state.
- **Bucket B (real candidate, near-shippable with 1-2 missing fields):** roughly the 738 rows that have vendor name + unit price + retail price. These are well-defined SKU concepts paired to vendor names, but actual contact and shipping arrangements still need to be made.
- **Bucket C (placeholder or aspirational):** the remaining ~262 rows (no price, no vendor, often uncategorized).

### What this means for the plan

1. **Phase 5 (code) is small.** `VALID_CATEGORIES` will need to be expanded if and when new categories are added to the live Catalog table, but it is not the bottleneck. Today the live Catalog literally does not have non-produce rows to drop.
2. **Phase 4 (sourcing) is the actual bottleneck.** None of the Product Mix rows are turnkey. They are leads. Real outreach and onboarding to a vendor's order desk is required to put any new category live.
3. **The Product Mix database is still useful** as a starting list of vendor names per category and target retail pricing. Phase 4 can use it as a research pre-cursor before tapping the (presumably more accurate) Suppliers table.
4. **Taxonomy cleanup needed.** Before merging Product Mix candidates into the live Catalog, the duplicated subcategory names ("Baking" vs "Baking Goods" vs "Baking & Bread Ingredients") need consolidation.

## Recommendations to the CEO

1. Treat the live catalog as having **47 SKUs**, full stop. Plan paid-marketing relaunch (Phase 6) against the actual customer-facing inventory count, not the wishlist.
2. **Skip Phase 1's planned A/B/C bucketing of the live Catalog**, because at 47 rows it's easy to eyeball and almost everything is shippable today. Replace it with a one-page merch-quality QA check (photo, description, price sanity) as part of Phase 5.
3. **Carry the Product Mix database forward into Phase 4** as a vendor-lead pre-cursor. The 738 rows with target pricing are a head start on the vendor candidate list per category, even though contact and onboarding are still required.
4. **Proceed with Phase 2 (consumption research) as planned.** The narrow-assortment problem is real and the research-backed approach the CEO requested is the right next step.

## Suppliers table (the actual Phase 4 starting line)

The unified Suppliers DB at `appm6F6H9obydzAM2 / Suppliers` is the merged result of the old Black Farms and Black Vendors tables (consolidated 2026-05-01). The legacy `appHgPTKlcuFKajQp` base is archived and slated for deletion.

**1,320 suppliers total**, by type:

| Type | Count |
|---|---|
| Farm | 1,121 |
| Vendor | 197 |
| Other / Both | 2 |

**826 of 1,320 have an email on file (63%)**, which is the practical Phase 4 outreach pool.

### Category coverage (multi-tagged, top 25)

| Category | Suppliers |
|---|---|
| Produce | 315 |
| Health & Wellness | 125 |
| Floral & Plants | 119 |
| Beverages | 118 |
| Meat & Seafood | 107 |
| Uncategorized | 99 |
| Pantry | 86 |
| Spices, Sauces & Condiments | 70 |
| Baking & Bread Ingredients | 55 |
| Honey & Bees | 51 |
| Eggs | 46 |
| Dairy | 40 |
| Personal Care | 39 |
| Snacks | 31 |
| Prepared Foods | 17 |
| Mushrooms | 11 |
| Canned Goods | 5 |
| International | 4 |
| Gift Sets | 4 |
| Frozen Foods | 3 |
| Kitchen Utensils, Grains & Starches, Candy | 1 each |

**Encouraging:** the categories the CEO flagged as missing from the live catalog (snacks, meats, beverages, prepared, broader pantry) have non-trivial supplier representation. Frozen and Canned coverage is thin and will likely require new vendor discovery for Phase 4.

## Revised verdict for Phase 4

The supply side is in better shape than the Product Mix wishlist alone suggested. The real Phase 4 question is not "are there candidate vendors" but "are these vendors active, can they ship on our cadence, and what is their minimum order." The 826 contactable suppliers in the merged DB is the actual starting line.

## Open items for Phase 3/4

- Vendor outreach prioritization should be **Suppliers-DB-first**, with Product Mix base used as a secondary signal for which SKUs to ask each supplier about.
- Frozen Foods (3 suppliers) and Canned Goods (5 suppliers) are the thinnest categories. If consumption research (Phase 2) ranks these high, vendor discovery work is required before they can be added.
- Confirm with CEO whether to deduplicate Product Mix categories before or during Phase 3 gap analysis.
