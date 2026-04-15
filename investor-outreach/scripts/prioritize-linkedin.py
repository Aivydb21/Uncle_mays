#!/usr/bin/env python3
"""
LinkedIn Investor Contact Prioritization Script
Variant of prioritize-contacts.py with NO geographic constraints.

Searches ALL Apollo contacts, scores by thesis fit (food/consumer/data VCs,
senior titles, equity-only), and outputs a LinkedIn-specific tier list.

Key differences from prioritize-contacts.py:
- No metro/location filtering — searches entire Apollo database
- Per-firm cap raised to 4 (LinkedIn connecting with multiple people at same fund is normal)
- Outputs to pipeline/linkedin/linkedin-tier1.md
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

# Already contacted (skip these from fresh outreach, but include in LinkedIn list)
ALREADY_CONTACTED_EMAIL = {
    "tyler mayoras", "james norman", "jordan gaspar", "sonia nagar",
    "corey vernon", "rodney clark", "devon roshankish", "michael rauenhorst",
    "tim kramer", "hannah schiff"
}

# --- Title keywords for filtering (must match at least one) ---
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
    # Additional food/consumer VCs often outside the 5 target metros
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


def search_all_contacts(page=1, per_page=100, retries=3):
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


def score_contact(contact):
    """Score a contact for Uncle May's thesis fit. Returns (score, reasons).
    Same scoring as prioritize-contacts.py but without metro-dependent bonuses
    being the primary driver."""
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

    # Chicago bonus (still valuable — local to flagship)
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
    print("LINKEDIN INVESTOR CONTACT PRIORITIZATION")
    print("Uncle May's Produce - National LinkedIn Outreach List")
    print("No geographic constraints - thesis alignment only")
    print("=" * 60)

    # Search ALL contacts in Apollo (no location filter)
    print("\nSearching all Apollo contacts (no metro filter)...")
    page = 1
    total_fetched = 0
    while True:
        data = search_all_contacts(page=page, per_page=100)
        contacts = data.get("contacts", [])
        pagination = data.get("pagination", {})
        total = pagination.get("total_entries", 0)

        if page == 1:
            print(f"  Total contacts in Apollo: {total}")

        for c in contacts:
            email = (c.get("email") or "").lower().strip()
            if not email:
                continue
            name = f"{c.get('first_name', '')} {c.get('last_name', '')}".strip()
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
    print("\nFiltering and scoring for LinkedIn outreach...")

    linkedin_tier1 = []  # Score 25+ (thesis-aligned)
    linkedin_tier2 = []  # Score 15-24 (thesis-adjacent)
    excluded = []

    for email, contact in all_contacts.items():
        name = contact["_name"]
        org = contact.get("organization_name", "")
        title = contact.get("title", "")
        location = contact["_location"]

        # Hard exclusions (same as email script)
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

        entry = {
            "name": name,
            "email": email,
            "org": org,
            "title": title,
            "location": location,
            "score": score,
            "reasons": reasons,
            "already_emailed": name.lower() in ALREADY_CONTACTED_EMAIL,
        }

        if score >= 25:
            linkedin_tier1.append(entry)
        elif score >= 15:
            linkedin_tier2.append(entry)
        # Score < 15: not worth LinkedIn outreach

    # Sort by score descending
    linkedin_tier1.sort(key=lambda x: x["score"], reverse=True)
    linkedin_tier2.sort(key=lambda x: x["score"], reverse=True)

    # Deduplicate: max 4 contacts per organization for LinkedIn (relaxed from 2)
    def dedup_tier(tier, max_per_org=4):
        deduped = []
        overflow = []
        org_counts = defaultdict(int)
        for entry in tier:
            org_key = entry["org"].lower().strip()
            if org_counts[org_key] < max_per_org:
                deduped.append(entry)
                org_counts[org_key] += 1
            else:
                entry["reasons"].append(f"Overflow: {org_counts[org_key]+1}th contact at same firm")
                overflow.append(entry)
        return deduped, overflow

    linkedin_tier1, overflow1 = dedup_tier(linkedin_tier1, max_per_org=4)
    # Move overflow to tier2
    linkedin_tier2 = overflow1 + linkedin_tier2
    linkedin_tier2.sort(key=lambda x: x["score"], reverse=True)
    linkedin_tier2, _ = dedup_tier(linkedin_tier2, max_per_org=4)

    print(f"\nResults:")
    print(f"  LinkedIn Tier 1 (score 25+, thesis-aligned): {len(linkedin_tier1)}")
    print(f"  LinkedIn Tier 2 (score 15-24, thesis-adjacent): {len(linkedin_tier2)}")
    print(f"  Excluded: {len(excluded)}")

    # Count contacts outside the 5 original metros
    ORIGINAL_METROS = {"sf/bay area", "los angeles", "new york", "dc/dmv", "chicago",
                       "san francisco", "palo alto", "menlo park", "brooklyn", "manhattan"}
    new_geo_count = sum(
        1 for c in linkedin_tier1
        if not any(metro in c["location"].lower() for metro in ORIGINAL_METROS)
    )
    print(f"  New contacts outside original 5 metros: {new_geo_count}")

    # --- Output files ---
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    linkedin_dir = os.path.join(base_dir, "pipeline", "linkedin")
    os.makedirs(linkedin_dir, exist_ok=True)

    # LinkedIn Tier 1
    tier1_path = os.path.join(linkedin_dir, "linkedin-tier1.md")
    with open(tier1_path, "w", encoding="utf-8") as f:
        f.write("# LinkedIn Tier 1: Thesis-Aligned Investors (National)\n\n")
        f.write(f"> Generated: 2026-04-05\n")
        f.write(f"> Total: {len(linkedin_tier1)} contacts\n")
        f.write(f"> Criteria: Score 25+ (thesis-aligned equity investor, no geographic filter)\n")
        f.write(f"> Max 4 contacts per firm\n\n")

        # Sub-tier A header
        f.write("## Sub-Tier A: Score 40+ (Full surround-sound treatment)\n\n")
        f.write("| # | Name | Organization | Title | Location | Score | Why | Email Channel |\n")
        f.write("|---|------|-------------|-------|----------|-------|-----|---------------|\n")
        i = 1
        for c in linkedin_tier1:
            if c["score"] < 40:
                break
            reasons_str = "; ".join(c["reasons"])
            email_status = "Already emailed" if c["already_emailed"] else "Apollo Tier 1" if c["score"] >= 25 else "LinkedIn only"
            f.write(f"| {i} | {c['name']} | {c['org']} | {c['title']} | {c['location']} | {c['score']} | {reasons_str} | {email_status} |\n")
            i += 1

        # Sub-tier B header
        f.write(f"\n## Sub-Tier B: Score 25-39 (Standard multi-channel)\n\n")
        f.write("| # | Name | Organization | Title | Location | Score | Why | Email Channel |\n")
        f.write("|---|------|-------------|-------|----------|-------|-----|---------------|\n")
        for c in linkedin_tier1:
            if c["score"] >= 40:
                continue
            reasons_str = "; ".join(c["reasons"])
            email_status = "Already emailed" if c["already_emailed"] else "Apollo Tier 1" if c["score"] >= 25 else "LinkedIn only"
            f.write(f"| {i} | {c['name']} | {c['org']} | {c['title']} | {c['location']} | {c['score']} | {reasons_str} | {email_status} |\n")
            i += 1

    # LinkedIn Tier 2
    tier2_path = os.path.join(linkedin_dir, "linkedin-tier2.md")
    with open(tier2_path, "w", encoding="utf-8") as f:
        f.write("# LinkedIn Tier 2: Thesis-Adjacent Investors (National)\n\n")
        f.write(f"> Generated: 2026-04-05\n")
        f.write(f"> Total: {len(linkedin_tier2)} contacts\n")
        f.write(f"> Criteria: Score 15-24 (connection request only, no DMs unless they accept)\n\n")
        f.write("| # | Name | Organization | Title | Location | Score | Why |\n")
        f.write("|---|------|-------------|-------|----------|-------|-----|\n")
        for j, c in enumerate(linkedin_tier2, 1):
            reasons_str = "; ".join(c["reasons"])
            f.write(f"| {j} | {c['name']} | {c['org']} | {c['title']} | {c['location']} | {c['score']} | {reasons_str} |\n")

    print(f"\nFiles written:")
    print(f"  {tier1_path}")
    print(f"  {tier2_path}")

    # Summary JSON
    summary = {
        "generated": "2026-04-05",
        "linkedin_tier1_count": len(linkedin_tier1),
        "linkedin_tier2_count": len(linkedin_tier2),
        "excluded_count": len(excluded),
        "new_contacts_outside_original_metros": new_geo_count,
        "sub_tier_a_count": sum(1 for c in linkedin_tier1 if c["score"] >= 40),
        "sub_tier_b_count": sum(1 for c in linkedin_tier1 if c["score"] < 40),
        "top_10": [
            {"name": c["name"], "org": c["org"], "score": c["score"],
             "location": c["location"], "reasons": c["reasons"]}
            for c in linkedin_tier1[:10]
        ],
    }

    summary_path = os.path.join(linkedin_dir, "linkedin-prioritization-summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"  {summary_path}")
    print("\nDone.")


if __name__ == "__main__":
    main()
