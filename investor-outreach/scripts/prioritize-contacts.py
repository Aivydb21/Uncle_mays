#!/usr/bin/env python3
"""
Investor Contact Prioritization Script
Searches ALL Apollo contacts (full database), scores by thesis fit,
and outputs tiered contact lists for Uncle May's Produce outreach.

Tier 1 is metro-constrained (SF, LA, NYC, DC, Chicago) for email outreach.
Tier 2/3 include all scored contacts nationally.
LinkedIn outreach (national) is handled by prioritize-linkedin.py.

Capital type: Equity / equity-like / forgivable debt only.
Sectors: Food, food retail, data infrastructure, foodtech, marketplaces.
"""

import json
import re
import sys
import time
import urllib.request
import os
from collections import defaultdict

# --- Config ---
CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]

# Already contacted (skip these)
ALREADY_CONTACTED = {
    "tyler mayoras", "james norman", "jordan gaspar", "sonia nagar",
    "corey vernon", "rodney clark", "devon roshankish", "michael rauenhorst",
    "tim kramer", "hannah schiff"
}

# --- Target metros for Tier 1 email outreach ---
TARGET_METRO_CITIES = {
    "SF/Bay Area": [
        "san francisco", "palo alto", "menlo park", "san jose", "oakland",
        "mountain view", "redwood city", "sunnyvale", "berkeley", "mill valley",
        "sausalito", "san mateo", "burlingame", "foster city", "woodside",
        "atherton", "los altos", "cupertino", "walnut creek", "tiburon",
    ],
    "Los Angeles": [
        "los angeles", "santa monica", "beverly hills", "west hollywood",
        "pasadena", "manhattan beach", "el segundo", "venice", "culver city",
        "brentwood", "playa vista",
    ],
    "New York": [
        "new york", "brooklyn", "manhattan", "greenwich", "stamford",
        "jersey city", "hoboken", "westport", "old westbury", "garden city",
    ],
    "DC/DMV": [
        "washington", "arlington", "bethesda", "mclean", "alexandria",
        "chevy chase", "reston", "tysons", "rockville", "silver spring",
    ],
    "Chicago": [
        "chicago", "evanston", "oak brook", "winnetka", "lake forest",
        "northbrook", "naperville", "deerfield", "highland park", "wilmette",
    ],
}

# Flatten for quick lookup
ALL_TARGET_CITIES = set()
for cities in TARGET_METRO_CITIES.values():
    ALL_TARGET_CITIES.update(cities)

# Title keywords for filtering (must match at least one)
TITLE_KEYWORDS = [
    "partner", "managing director", "principal", "founder",
    "investor", "venture partner", "general partner", "gp",
    "director of investment", "head of investment",
    "managing member", "co-founder",
]

# --- Scoring signals ---

FOOD_CONSUMER_KEYWORDS = [
    "food", "grocery", "consumer", "ag ", "agri", "farm", "produce",
    "retail", "data", "marketplace", "platform", "foodtech", "cpg",
    "beverage", "nutrition", "organic", "natural", "fresh",
    "restaurant", "hospitality", "kitchen", "meal",
]

KNOWN_FOOD_CONSUMER_VCS = [
    "manna tree", "af ventures", "cavu", "acre venture", "s2g ventures",
    "circleup", "vmg partners", "topspin consumer", "prelude ventures",
    "almanac insights", "bits x bites", "blue horizon", "boulder food group",
    "closed loop partners", "collaborative fund", "cultivian sandbox",
    "digitalis ventures", "fifty years", "finistere ventures",
    "food-x", "generation investment", "harvest returns",
    "kitchen fund", "lever vc", "mcwin", "modern meadow",
    "new crop capital", "obvious ventures", "omnivore",
    "paine schwartz", "pontifax agtech", "radicle impact",
    "revolution", "s2g", "stray dog capital", "the production board",
    "unovis", "vegtech invest", "village capital",
    "snak venture", "aspect consumer", "forward consumer",
    "palladin consumer", "brynwood", "l catterton",
    "brentwood associates", "north castle partners",
    "yellowwood partners", "yellow wood",
    "boulder food", "agfunder", "better food ventures",
    "breakthrough energy", "congruent ventures", "emancipation capital",
    "kapor capital", "harlem capital", "impact america fund",
    "base ventures", "backstage capital", "black innovation alliance",
    "cross culture ventures", "precursor ventures",
    "sievert larsen", "arborview capital",
]

EXCLUDE_ORG_PATTERNS = [
    r"insurance", r"real estate(?! .*(?:venture|fund|capital))",
    r"realty(?! .*(?:venture|fund|capital))", r"mortgage",
    r"staffing", r"recruiting", r"marketing (?:agency|group|firm)",
    r"law firm", r"legal", r"accounting",
    r"brewery", r"distill", r"winery", r"vineyard",
    r"restaurant(?! .*(?:venture|fund|capital|invest))",
    r"catering", r"hotel", r"resort",
]

EXCLUDE_TITLE_PATTERNS = [
    r"director of (?:sales|marketing|operations|hr|human|events|retail|supply)",
    r"sales director", r"marketing director", r"operations director",
    r"head of (?:sales|marketing|operations|hr|brand|product(?!.*invest))",
    r"business development", r"account manager",
    r"chief operating officer", r"coo(?!\s)", r"chief marketing",
    r"chief financial officer", r"cfo(?!\s)",
    r"senior associate", r"analyst",
    r"director of (?:e-commerce|digital|communications|pr)",
]

DEBT_PATTERNS = [
    r"lending", r"loan", r"credit union", r"mortgage",
    r"debt", r"mezzanine", r"commercial bank",
    r"wealth management", r"wealth advisory",
    r"financial planning", r"financial advisor",
]


def search_contacts(page=1, per_page=100, retries=3):
    """Search ALL Apollo contacts (no location filter)."""
    payload = json.dumps({
        "page": page,
        "per_page": per_page,
    }).encode("utf-8")

    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/contacts/search",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "X-Api-Key": API_KEY,
                "User-Agent": "curl/8.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1} after {wait}s ({e})", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  API error after {retries} attempts: {e}", file=sys.stderr)
                return {"contacts": [], "pagination": {"total_entries": 0, "total_pages": 0}}


def is_investor_title(title):
    if not title:
        return False
    t = title.lower()
    return any(kw in t for kw in TITLE_KEYWORDS)


def should_exclude_org(org):
    if not org:
        return False
    o = org.lower()
    for pattern in EXCLUDE_ORG_PATTERNS + DEBT_PATTERNS:
        if re.search(pattern, o):
            return True
    return False


def should_exclude_title(title):
    if not title:
        return False
    t = title.lower()
    for pattern in EXCLUDE_TITLE_PATTERNS:
        if re.search(pattern, t):
            return True
    return False


def is_investment_fund(org):
    if not org:
        return False
    o = org.lower()
    fund_indicators = [
        "capital", "venture", "partners", "fund", "investment",
        "equity", "holdings", "asset management", "advisors",
        " vc", ".vc", "angels", "accelerat",
    ]
    return any(ind in o for ind in fund_indicators)


def is_in_target_metro(contact):
    """Check if a contact is in one of the 5 target metros."""
    city = (contact.get("city") or "").lower().strip()
    if not city:
        return False, "Unknown"
    for metro, cities in TARGET_METRO_CITIES.items():
        if city in cities:
            return True, metro
    return False, "Other"


def score_contact(contact):
    """Score a contact for Uncle May's thesis fit. Returns (score, reasons)."""
    org = (contact.get("organization_name") or "").lower()
    title = (contact.get("title") or "").lower()
    city = (contact.get("city") or "").lower()
    reasons = []
    score = 0

    # Known food/consumer VC (highest signal)
    known_match = False
    for vc in KNOWN_FOOD_CONSUMER_VCS:
        if vc in org:
            score += 30
            reasons.append(f"Known food/consumer VC: {vc}")
            known_match = True
            break

    # Food/consumer org keyword match — only if org is actually a fund
    if not known_match and is_investment_fund(org):
        for kw in FOOD_CONSUMER_KEYWORDS:
            if kw in org:
                score += 20
                reasons.append(f"Fund with food/consumer focus: '{kw}'")
                break

    # Impact fund (equity)
    if is_investment_fund(org) and any(w in org for w in ["impact", "social"]) and not any(w in org for w in ["lending", "loan", "debt", "credit"]):
        score += 10
        reasons.append("Impact fund (equity)")

    # Chicago bonus (flagship location)
    if "chicago" in city or "evanston" in city or "oak brook" in city:
        score += 10
        reasons.append("Chicago-based")

    # Senior title bonus
    if any(t in title for t in ["managing partner", "general partner", "founder", "gp"]):
        score += 10
        reasons.append("Senior: GP/MP/Founder")
    elif any(t in title for t in ["partner", "managing director", "principal"]):
        score += 5
        reasons.append("Title: Partner/MD/Principal")

    return score, reasons


def main():
    all_contacts = {}  # dedupe by email

    print("=" * 60)
    print("INVESTOR CONTACT PRIORITIZATION")
    print("Uncle May's Produce - Full Database Scoring")
    print("Tier 1: metro-constrained | Tier 2/3: national")
    print("=" * 60)

    # Search ALL contacts (no location filter)
    print("\nSearching all Apollo contacts (full database)...")
    page = 1
    total_fetched = 0
    apollo_total = 0
    while True:
        data = search_contacts(page=page, per_page=100)
        contacts = data.get("contacts", [])
        pagination = data.get("pagination", {})
        apollo_total = pagination.get("total_entries", apollo_total)

        if page == 1:
            print(f"  Total contacts in Apollo: {apollo_total}")

        for c in contacts:
            email = (c.get("email") or "").lower().strip()
            if not email:
                continue
            name = f"{c.get('first_name', '')} {c.get('last_name', '')}".strip()
            if name.lower() in ALREADY_CONTACTED:
                continue

            c["_name"] = name
            c["_location"] = f"{c.get('city', '')}, {c.get('state', '')}".strip(", ")

            if email not in all_contacts:
                all_contacts[email] = c
                total_fetched += 1

        total_pages = pagination.get("total_pages", 1)
        print(f"  Page {page}/{total_pages} - {total_fetched} unique contacts so far")

        if page >= total_pages:
            break
        page += 1
        time.sleep(1.0)

    print(f"\nTotal unique contacts fetched: {len(all_contacts)}")

    # --- Filter and Score ---
    print("\nFiltering and scoring all contacts...")

    tier1 = []       # Score 25+ AND in target metro (email outreach)
    tier2 = []       # Score 10-24 (all locations) + Tier 1 overflow
    tier3 = []       # Score < 10 but passes filters (all locations)
    national_25 = [] # Score 25+ but NOT in target metro (LinkedIn only)
    excluded = []

    metro_counts = defaultdict(int)

    for email, contact in all_contacts.items():
        name = contact["_name"]
        org = contact.get("organization_name", "")
        title = contact.get("title", "")
        location = contact["_location"]

        # Hard exclusions
        if should_exclude_org(org):
            excluded.append((name, org, title, "Excluded org type"))
            continue
        if should_exclude_title(title):
            excluded.append((name, org, title, "Non-investment title"))
            continue
        if not is_investor_title(title):
            excluded.append((name, org, title, "Not investor title"))
            continue

        # Must be at an investment fund or known VC
        if not is_investment_fund(org):
            is_known = any(vc in org.lower() for vc in KNOWN_FOOD_CONSUMER_VCS)
            if not is_known:
                excluded.append((name, org, title, "Not an investment fund"))
                continue

        score, reasons = score_contact(contact)
        in_metro, metro = is_in_target_metro(contact)

        if in_metro:
            metro_counts[metro] += 1

        entry = {
            "name": name,
            "email": email,
            "org": org,
            "title": title,
            "location": location,
            "metro": metro,
            "in_target_metro": in_metro,
            "score": score,
            "reasons": reasons,
        }

        if score >= 25:
            if in_metro:
                tier1.append(entry)
            else:
                # High score but outside target metros — LinkedIn only
                national_25.append(entry)
                tier2.append(entry)  # Also include in Tier 2 for tracking
        elif score >= 10:
            tier2.append(entry)
        else:
            tier3.append(entry)

    # Sort each tier by score descending
    tier1.sort(key=lambda x: x["score"], reverse=True)
    tier2.sort(key=lambda x: x["score"], reverse=True)
    tier3.sort(key=lambda x: x["score"], reverse=True)
    national_25.sort(key=lambda x: x["score"], reverse=True)

    # Deduplicate Tier 1: max 2 contacts per organization
    tier1_deduped = []
    org_counts = defaultdict(int)
    tier1_overflow = []
    for entry in tier1:
        org_key = entry["org"].lower().strip()
        if org_counts[org_key] < 2:
            tier1_deduped.append(entry)
            org_counts[org_key] += 1
        else:
            entry["reasons"].append("Overflow: 3rd+ contact at same firm")
            tier1_overflow.append(entry)

    # Move overflow to tier2
    tier2 = tier1_overflow + tier2
    tier1 = tier1_deduped
    tier2.sort(key=lambda x: x["score"], reverse=True)

    print(f"\nResults:")
    print(f"  Tier 1 (score 25+, target metros, email outreach): {len(tier1)}")
    print(f"  Tier 2 (score 10-24, national + overflow): {len(tier2)}")
    print(f"  Tier 3 (score <10, national): {len(tier3)}")
    print(f"  National 25+ outside metros (LinkedIn only): {len(national_25)}")
    print(f"  Excluded: {len(excluded)}")
    print(f"  Total scored: {len(tier1) + len(tier2) + len(tier3)}")
    print(f"  Metro breakdown: {dict(metro_counts)}")

    # --- Output files ---
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Tier 1
    tier1_path = os.path.join(base_dir, "pipeline", "tier-1", "priority-contacts.md")
    with open(tier1_path, "w", encoding="utf-8") as f:
        f.write("# Tier 1: Priority Contacts - Immediate Email Outreach\n\n")
        f.write(f"> Generated: 2026-04-05\n")
        f.write(f"> Total: {len(tier1)} contacts\n")
        f.write(f"> Criteria: Score 25+ (thesis-aligned equity investor, senior decision-maker)\n")
        f.write(f"> Geographic filter: SF/Bay Area, LA, NYC, DC/DMV, Chicago\n")
        f.write(f"> Max 2 contacts per firm (overflow moved to Tier 2)\n")
        f.write(f"> Scored from full database of {apollo_total} Apollo contacts\n\n")
        f.write("| # | Name | Email | Organization | Title | Location | Metro | Score | Why |\n")
        f.write("|---|------|-------|-------------|-------|----------|-------|-------|-----|\n")
        for i, c in enumerate(tier1, 1):
            reasons_str = "; ".join(c["reasons"])
            f.write(f"| {i} | {c['name']} | {c['email']} | {c['org']} | {c['title']} | {c['location']} | {c['metro']} | {c['score']} | {reasons_str} |\n")

    # Tier 2
    tier2_path = os.path.join(base_dir, "pipeline", "tier-2", "warm-contacts.md")
    with open(tier2_path, "w", encoding="utf-8") as f:
        f.write("# Tier 2: Warm Contacts - Next Wave Outreach\n\n")
        f.write(f"> **Status: ON HOLD** — Not currently targeted. Available for future campaigns.\n")
        f.write(f"> Generated: 2026-04-05\n")
        f.write(f"> Total: {len(tier2)} contacts\n")
        f.write(f"> Criteria: Score 10-24 (national) + Tier 1 overflow (3rd+ at same firm) + score 25+ outside target metros\n\n")
        f.write("| # | Name | Email | Organization | Title | Location | Score | Why |\n")
        f.write("|---|------|-------|-------------|-------|----------|-------|-----|\n")
        for i, c in enumerate(tier2, 1):
            reasons_str = "; ".join(c["reasons"])
            f.write(f"| {i} | {c['name']} | {c['email']} | {c['org']} | {c['title']} | {c['location']} | {c['score']} | {reasons_str} |\n")

    # Tier 3
    tier3_path = os.path.join(base_dir, "pipeline", "tier-3", "campaign-contacts.md")
    with open(tier3_path, "w", encoding="utf-8") as f:
        f.write("# Tier 3: Campaign Contacts - Hold for Future Campaign\n\n")
        f.write(f"> Generated: 2026-04-05\n")
        f.write(f"> Total: {len(tier3)} contacts\n")
        f.write(f"> Criteria: Passes equity filter but score < 10 (general investor, national)\n\n")
        f.write("| # | Name | Email | Organization | Title | Location | Score |\n")
        f.write("|---|------|-------|-------------|-------|----------|-------|\n")
        for i, c in enumerate(tier3, 1):
            f.write(f"| {i} | {c['name']} | {c['email']} | {c['org']} | {c['title']} | {c['location']} | {c['score']} |\n")

    print(f"\nFiles written:")
    print(f"  {tier1_path}")
    print(f"  {tier2_path}")
    print(f"  {tier3_path}")

    # --- Summary JSON ---
    summary = {
        "generated": "2026-04-05",
        "scope": "full database scored, Tier 1 metro-constrained",
        "total_contacts_in_apollo": apollo_total,
        "total_unique_fetched": len(all_contacts),
        "metro_counts": dict(metro_counts),
        "tier_counts": {
            "tier1": len(tier1),
            "tier2": len(tier2),
            "tier3": len(tier3),
            "national_25_plus_outside_metros": len(national_25),
            "excluded": len(excluded),
        },
        "tier1_top10": [
            {"name": c["name"], "org": c["org"], "score": c["score"],
             "location": c["location"], "metro": c["metro"], "reasons": c["reasons"]}
            for c in tier1[:10]
        ],
    }

    summary_path = os.path.join(base_dir, "pipeline", "prioritization-summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    # --- Contact IDs for Tier 1 ---
    contact_ids = []
    for c in tier1:
        contact = all_contacts.get(c["email"])
        if contact and contact.get("id"):
            contact_ids.append({
                "id": contact["id"],
                "name": c["name"],
                "email": c["email"],
                "org": c["org"],
                "score": c["score"],
            })

    ids_path = os.path.join(base_dir, "pipeline", "tier-1", "contact-ids.json")
    with open(ids_path, "w", encoding="utf-8") as f:
        json.dump(contact_ids, f, indent=2)

    print(f"  {summary_path}")
    print(f"  {ids_path}")
    print("\nDone.")


if __name__ == "__main__":
    main()
