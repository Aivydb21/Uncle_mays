"""
Score the Searchfunder paste against Anthony's filter criteria.
Limitations honestly stated:
- Searchfunder paste only contains name, title, location, schools.
- Check size, sector preferences, and contact info are NOT in the paste.
- Geographic and title-text filtering can be done from the paste; check-size
  and sector filtering requires Anthony to click profiles for the top tier.
"""
import csv
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(ROOT, "searchfunder-raw.txt")
OUT_CSV = os.path.join(ROOT, "searchfunder-scored.csv")
OUT_TOP = os.path.join(ROOT, "searchfunder-top-tier.md")

# US state abbreviations -> region
MIDWEST_STATES = {"IL", "WI", "MI", "IN", "MN", "OH", "IA", "MO", "KS", "NE", "ND", "SD"}
US_STATES_ALL = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
    "WI", "WY", "DC",
}

# Title-text signals (lowercased)
# Note: "solo searcher" is now penalized separately, NOT counted as self-funded LP signal.
SELF_FUNDED_SIGNALS = ["self-funded", "self funded", "selffunded", "solo investor", "investor in self-funded", "investor in self funded"]
SEARCH_INVESTOR_SIGNALS = ["search investor", "search fund investor", "sf investor", "search/lmm", "self funded search", "self-funded search"]
# Penalty: titles indicating they are an OPERATOR / SEARCHER (their side of the table is buying, not LP-ing).
SEARCHER_OPERATOR_SIGNALS = ["solo searcher", "self funded searcher", "self-funded searcher", "searcher", "exploring search funds"]
# School/alumni signals (matched against the schools field, not title).
ALUMNI_BOOTH_SIGNALS = [
    "the university of chicago - booth school of business",
    "university of chicago - booth school of business",
    "chicago booth",
    "booth school",
]
ALUMNI_UCHICAGO_NON_BOOTH_SIGNALS = [
    "university of chicago",
]
ALUMNI_HBS_SIGNALS = [
    "harvard business school",
    "harvard university - harvard business school",
]
ETA_FIRM_SIGNALS = [
    "eta equity", "next coast eta", "footbridge", "salt creek", "salt creek capital",
    "search fund accelerator", "search fund ventures", "anacapa", "saugatuck",
    "broadtree", "kamylon", "halstatt", "endurance search", "true north search",
    "village search", "relay", "mer search", "novastone", "liberty search",
    "search fund funding", "deer lake", "atento capital", "pacific lake",
    "newmajority", "new majority capital", "novastone",
]
INDEPENDENT_SPONSOR_SIGNALS = [
    "independent sponsor", "buy and build", "buy & build", "buy-and-build", "buy and builds",
]
HOLDCO_SIGNALS = [
    "holdco", "holdings", "family office", "family capital", "private investor",
    "operator", "ceo mentor", "former searcher", "exited search", "former ceo",
]
TOO_BIG_FIRMS = [
    "blackstone", "apollo global", "kkr", "bain capital", "carlyle", "tpg",
    "warburg", "general atlantic", "silver lake", "vista equity", "thoma bravo",
    "bank of america merrill lynch", "piper sandler",
    "norwest venture partners", "trivest", "shore capital", "rock island capital",
    "princeton equity", "tecum capital", "gemini investors", "trivest partners",
    "halstatt legacy", "saugatuck capital", "broadtree partners",
    "ten oaks group", "staple street capital", "sentinel capital", "ameriflex",
    "spectra investments",
]
WRONG_SECTOR_SIGNALS = [
    "spacex", "google", "meta", "stripe", "abbvie", "medtronic",
    "chevron", "convatec", "republic services", "lonza", "apple inc",
    "deloitte", "pwc", "stripe", "trader at", "real estate",
    "cybersecurity", "private equity intern",
]


def parse_location(loc):
    """Return (state, country, is_us, is_chicago, is_midwest)."""
    if not loc:
        return ("", "", False, False, False)
    l = loc.strip()
    is_us = "USA" in l or "United States" in l
    is_chicago = "Chicago, IL" in l or "Evanston, IL" in l or ", IL," in l or "IL " in l or l.endswith(", IL") or "Plainfield, IL" in l or "Arlington Heights" in l or "Galena, IL" in l
    # extract state
    state = ""
    m = re.search(r",\s*([A-Z]{2})\b", l)
    if m and m.group(1) in US_STATES_ALL:
        state = m.group(1)
    is_midwest = state in MIDWEST_STATES
    country = ""
    if not is_us:
        # grab last comma-segment as country guess
        country = l.split(",")[-1].strip()
    return (state, country, is_us, is_chicago, is_midwest)


def score_geo(parsed_loc):
    state, country, is_us, is_chicago, is_midwest = parsed_loc
    if is_chicago:
        return 5
    if is_midwest:
        return 4
    if is_us:
        return 2
    # international
    return 0


def score_title(title):
    if not title:
        return 0, []
    t = title.lower()
    score = 0
    flags = []
    for p in SELF_FUNDED_SIGNALS:
        if p in t:
            score += 5
            flags.append("self-funded")
            break
    for p in SEARCH_INVESTOR_SIGNALS:
        if p in t:
            score += 4
            flags.append("search-investor")
            break
    for p in ETA_FIRM_SIGNALS:
        if p in t:
            score += 3
            flags.append("eta-firm")
            break
    for p in INDEPENDENT_SPONSOR_SIGNALS:
        if p in t:
            score += 3
            flags.append("indep-sponsor")
            break
    for p in HOLDCO_SIGNALS:
        if p in t:
            score += 2
            flags.append("holdco/operator")
            break
    # Penalty: titles indicating they are an operator / searcher, not an LP.
    for p in SEARCHER_OPERATOR_SIGNALS:
        if p in t:
            score -= 3
            flags.append("searcher-operator")
            break
    for p in TOO_BIG_FIRMS:
        if p in t:
            score -= 4
            flags.append("too-big")
            break
    for p in WRONG_SECTOR_SIGNALS:
        if p in t:
            score -= 3
            flags.append("wrong-sector")
            break
    if score == 0 and "investor" in t:
        score = 1
        flags.append("generic-investor")
    return score, flags


def score_alumni(schools):
    """Score Booth / HBS / UChicago alumni signal from the schools field."""
    if not schools:
        return 0, []
    s = schools.lower()
    score = 0
    flags = []
    booth = any(p in s for p in ALUMNI_BOOTH_SIGNALS)
    if booth:
        score += 3
        flags.append("booth")
    elif any(p in s for p in ALUMNI_UCHICAGO_NON_BOOTH_SIGNALS):
        score += 2
        flags.append("uchicago")
    if any(p in s for p in ALUMNI_HBS_SIGNALS):
        score += 2
        flags.append("hbs")
    return score, flags


def main():
    rows = []
    with open(RAW, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line.strip():
                continue
            parts = line.split("|")
            if len(parts) < 5:
                # pad
                parts = parts + [""] * (5 - len(parts))
            name = parts[0].strip()
            title = parts[2].strip()
            loc = parts[3].strip()
            schools = parts[4].strip()
            ploc = parse_location(loc)
            geo = score_geo(ploc)
            tscore, tflags = score_title(title)
            ascore, aflags = score_alumni(schools)
            total = geo + tscore + ascore
            rows.append({
                "name": name,
                "title": title,
                "location": loc,
                "state": ploc[0],
                "country": ploc[1],
                "is_us": ploc[2],
                "is_chicago": ploc[3],
                "is_midwest": ploc[4],
                "schools": schools,
                "geo_score": geo,
                "title_score": tscore,
                "alumni_score": ascore,
                "total_score": total,
                "flags": ";".join(tflags + aflags),
            })

    rows.sort(key=lambda r: (-r["total_score"], r["name"]))

    # Write full CSV
    with open(OUT_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        for r in rows:
            w.writerow(r)

    def is_dq(r):
        return "too-big" in r["flags"] or "wrong-sector" in r["flags"]

    def has_positive_signal(r):
        positives = ["self-funded", "search-investor", "eta-firm", "indep-sponsor", "holdco/operator", "booth", "uchicago", "hbs"]
        return any(p in r["flags"] for p in positives)

    # Wave 1: top tier (score >= 7 AND no DQ) OR (Chicago AND has any positive signal AND no DQ) OR (Booth alum AND has any positive signal AND no DQ)
    wave1 = [r for r in rows
             if not is_dq(r) and (
                 r["total_score"] >= 7
                 or (r["is_chicago"] and has_positive_signal(r))
                 or ("booth" in r["flags"] and has_positive_signal(r))
             )]
    # Dedupe wave1
    seen = set()
    wave1_dedup = []
    for r in wave1:
        if r["name"] not in seen:
            seen.add(r["name"])
            wave1_dedup.append(r)
    wave1 = sorted(wave1_dedup, key=lambda r: -r["total_score"])

    # Wave 2: mid-tier US-based with positive signal, no DQ, not in Wave 1
    wave1_names = {r["name"] for r in wave1}
    wave2 = [r for r in rows
             if not is_dq(r)
             and r["name"] not in wave1_names
             and r["is_us"]
             and has_positive_signal(r)
             and r["total_score"] >= 4]
    wave2 = sorted(wave2, key=lambda r: -r["total_score"])

    # Archive: everyone else (low score, or international without strong signal, or no positive signal)
    in_w1_w2 = wave1_names | {r["name"] for r in wave2}
    archive = [r for r in rows if r["name"] not in in_w1_w2 and not is_dq(r)]
    dq = [r for r in rows if is_dq(r)]

    chicago_only = [r for r in rows if r["is_chicago"]]
    midwest_only = [r for r in rows if r["is_midwest"] and not r["is_chicago"]]
    booth_only = [r for r in rows if "booth" in r["flags"]]
    hbs_only = [r for r in rows if "hbs" in r["flags"]]
    self_funded_explicit = [r for r in rows if "self-funded" in r["flags"] or "search-investor" in r["flags"]]
    searcher_op = [r for r in rows if "searcher-operator" in r["flags"]]

    with open(OUT_TOP, "w", encoding="utf-8") as f:
        f.write("# Searchfunder Scoring, v2 (Booth alumni + Solo-Searcher penalty)\n\n")
        f.write(f"**Total entries parsed:** {len(rows)}\n\n")
        f.write("## Counts by wave\n\n")
        f.write(f"- **Wave 1** (immediate outreach candidates): {len(wave1)}\n")
        f.write(f"- **Wave 2** (mid-tier, activate if Wave 1 underperforms): {len(wave2)}\n")
        f.write(f"- **Archive** (no clear signal or international without warrant): {len(archive)}\n")
        f.write(f"- **Disqualified** (too-big or wrong-sector): {len(dq)}\n\n")
        f.write("## Counts by attribute\n\n")
        f.write(f"- Chicago-based: {len(chicago_only)}\n")
        f.write(f"- Midwest (non-Chicago): {len(midwest_only)}\n")
        f.write(f"- Booth alumni: {len(booth_only)}\n")
        f.write(f"- HBS alumni: {len(hbs_only)}\n")
        f.write(f"- Explicit self-funded / search-investor language: {len(self_funded_explicit)}\n")
        f.write(f"- Searcher / operator (now penalized): {len(searcher_op)}\n\n")
        f.write("## Methodology v2\n\n")
        f.write("**Geographic** (max 5): Chicago = 5, Midwest = 4, US other = 2, international = 0.\n\n")
        f.write("**Title text:** self-funded language = +5, search investor language = +4, named ETA firm = +3, independent sponsor = +3, holdco/family office/operator = +2, **searcher / solo-searcher (operator on the wrong side of the table) = -3** (new), too-big PE shop = -4, wrong sector = -3.\n\n")
        f.write("**Alumni** (new): Booth = +3, UChicago non-Booth = +2, HBS = +2.\n\n")
        f.write("**Wave 1 = score >= 7, OR Chicago with any positive signal, OR Booth alum with any positive signal.** All exclude disqualifiers.\n\n")
        f.write("**Wave 2 = US-based, score 4 to 6, has positive signal, not in Wave 1.**\n\n")
        f.write("**Filters NOT applied** (data not in Searchfunder paste):\n\n")
        f.write("- Stated check size ($50K to $250K)\n")
        f.write("- Stated sector preference (food / retail / grocery)\n")
        f.write("- Email or contact path\n\n")
        f.write("Anthony clicks each Wave 1 profile to capture those before Apollo load.\n\n")
        f.write("---\n\n")

        f.write("## Wave 1, Immediate Outreach Candidates\n\n")
        f.write(f"**{len(wave1)} names.** Profile-click verification, then Apollo load.\n\n")
        f.write("| Name | Title | Location | Schools | Score | Flags |\n")
        f.write("|---|---|---|---|---|---|\n")
        for r in wave1:
            schools_short = (r['schools'][:50] + "...") if len(r['schools']) > 50 else r['schools']
            f.write(f"| {r['name']} | {r['title'][:70]} | {r['location'][:35]} | {schools_short} | {r['total_score']} | {r['flags']} |\n")
        f.write("\n---\n\n")

        f.write("## Wave 2, Mid-Tier Reserve\n\n")
        f.write(f"**{len(wave2)} names.** Park in a separate Apollo campaign; activate only if Wave 1 underperforms.\n\n")
        f.write("| Name | Title | Location | Score | Flags |\n")
        f.write("|---|---|---|---|---|\n")
        for r in wave2:
            f.write(f"| {r['name']} | {r['title'][:70]} | {r['location'][:35]} | {r['total_score']} | {r['flags']} |\n")
        f.write("\n---\n\n")

        f.write(f"## Archive (no further action this campaign)\n\n")
        f.write(f"**{len(archive)} names.** Kept in [searchfunder-scored.csv](searchfunder-scored.csv) for cold-archive reference. Not loaded to Apollo.\n\n")
        f.write("---\n\n")

        f.write("## Disqualified\n\n")
        f.write("| Name | Title | Location | Reason |\n")
        f.write("|---|---|---|---|\n")
        for r in sorted(dq, key=lambda r: r["name"]):
            f.write(f"| {r['name']} | {r['title'][:70]} | {r['location'][:35]} | {r['flags']} |\n")

    print(f"Total parsed: {len(rows)}")
    print(f"Wave 1 (immediate): {len(wave1)}")
    print(f"Wave 2 (reserve): {len(wave2)}")
    print(f"Archive: {len(archive)}")
    print(f"Disqualified: {len(dq)}")
    print(f"Chicago: {len(chicago_only)}")
    print(f"Midwest non-Chicago: {len(midwest_only)}")
    print(f"Booth alumni: {len(booth_only)}")
    print(f"HBS alumni: {len(hbs_only)}")
    print(f"Wrote {OUT_CSV}")
    print(f"Wrote {OUT_TOP}")


if __name__ == "__main__":
    main()
