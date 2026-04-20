#!/usr/bin/env python3
"""
Mission-Aligned Investor Scoring Script
Finds foundations, impact funds, CDFIs, diversity-focused funds,
and other non-traditional VC investors in the Apollo database
that align with Uncle May's Produce thesis.
"""

import json
import urllib.request
import os
import time

CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]

# Manually curated mission-aligned organizations
MISSION_ALIGNED_ORGS = {
    # Impact funds
    "beyond impact": {"type": "Impact VC", "why": "Impact-focused venture fund, invests in social enterprises"},
    "capital impact partners": {"type": "CDFI/Impact", "why": "Community development FI, finances community facilities including grocery"},
    "impactassets": {"type": "Impact Platform", "why": "Impact investing platform, donor-advised funds for social enterprises"},
    "radicle impact": {"type": "Impact VC", "why": "Impact fund investing in food systems and sustainability"},
    "social investment managers": {"type": "Impact Fund", "why": "Social investment fund (SIMA), emerging markets and impact"},
    "simafunds": {"type": "Impact Fund", "why": "Social investment fund (SIMA)"},
    "trimtab impact": {"type": "Impact Fund", "why": "Early-stage impact fund"},
    "sonen capital": {"type": "Impact Advisory", "why": "Impact investment advisory, manages impact portfolios"},

    # Black-led / diversity-focused funds
    "black operator ventures": {"type": "Black-Led VC", "why": "Black-led operator fund, invests in Black founders"},
    "harlem capital": {"type": "Diversity VC", "why": "Diversity-focused fund, invests in minority and women founders"},
    "backstage capital": {"type": "Diversity VC", "why": "Invests in underrepresented founders (Black, women, LGBTQ+)"},
    "base ventures": {"type": "Black-Led VC", "why": "Black-led seed fund, Oakland-based"},
    "kapor capital": {"type": "Impact VC", "why": "Social impact tech fund, gap-closing ventures for low-income communities"},
    "cross culture": {"type": "Diversity VC", "why": "Invests in founders building for diverse communities"},

    # Food/ag mission-aligned
    "good food": {"type": "Food Foundation", "why": "Food-focused foundation promoting good food economy"},
    "evergreen climate": {"type": "Climate/Impact", "why": "Chicago-based climate innovation fund, food systems in scope"},

    # Community development / place-based
    "chicago community loan": {"type": "CDFI", "why": "Chicago CDFI, finances community development projects"},
    "small business community capital": {"type": "Community Fund", "why": "Community capital for small businesses"},
    "third & urban": {"type": "Urban Development", "why": "Urban development and revitalization"},

    # Catalytic / mission capital
    "berkeley catalyst": {"type": "Catalytic Capital", "why": "Catalytic capital fund"},

    # Family offices with impact potential
    "dca family office": {"type": "Family Office", "why": "Family office with alternative asset focus"},
    "family fund": {"type": "Community VC", "why": "Founder community and venture fund"},

    # Mission-aligned conventional
    "regen ventures": {"type": "Regenerative VC", "why": "Regenerative economy fund, sustainability focus"},
    "regen.vc": {"type": "Regenerative VC", "why": "Regenerative economy fund"},

    # State/public capital
    "illinois state treasurer": {"type": "Public Capital", "why": "IL state sustainable investment program, local to flagship"},

    # Impact advisory with deal flow
    "dwm": {"type": "Impact Advisory", "why": "Impact-focused development and wealth management"},
}

ALREADY_CONTACTED = {
    "corey vernon", "ami naik", "michael rauenhorst", "hannah schiff",
    "james norman", "tyler mayoras", "jordan gaspar", "sonia nagar",
    "rodney clark", "devon roshankish", "tim kramer",
}

IN_TIER1_CAMPAIGN = set()


def fetch_all_contacts():
    all_contacts = {}
    page = 1
    while True:
        payload = json.dumps({"page": page, "per_page": 100}).encode("utf-8")
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
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        contacts = data.get("contacts", [])
        pagination = data.get("pagination", {})

        for c in contacts:
            email = (c.get("email") or "").lower().strip()
            if not email:
                continue
            name = f"{c.get('first_name', '')} {c.get('last_name', '')}".strip()
            c["_name"] = name
            c["_location"] = f"{c.get('city', '')}, {c.get('state', '')}".strip(", ")
            if email not in all_contacts:
                all_contacts[email] = c

        if page >= pagination.get("total_pages", 1):
            break
        page += 1
        time.sleep(0.8)

    return all_contacts


def score_mission_contact(contact, org_info):
    """Score a mission-aligned contact for Uncle May's fit."""
    org = (contact.get("organization_name") or "").lower()
    title = (contact.get("title") or "").lower()
    city = (contact.get("city") or "").lower()
    state = (contact.get("state") or "").lower()

    score = 0
    reasons = []

    # Type-based scoring
    if org_info["type"] in ["Black-Led VC", "Diversity VC"]:
        score += 30
        reasons.append(f"Diversity-focused: {org_info['type']}")
    elif org_info["type"] in ["Impact VC", "Impact Fund", "Impact Platform", "CDFI/Impact", "CDFI"]:
        score += 25
        reasons.append(f"Mission-aligned: {org_info['type']}")
    elif org_info["type"] in ["Food Foundation", "Climate/Impact", "Regenerative VC"]:
        score += 20
        reasons.append(f"Sector-aligned: {org_info['type']}")
    elif org_info["type"] in ["Community Fund", "Urban Development", "Catalytic Capital", "Community VC"]:
        score += 15
        reasons.append(f"Community capital: {org_info['type']}")
    elif org_info["type"] in ["Family Office", "Impact Advisory", "Public Capital"]:
        score += 10
        reasons.append(f"Potential ally: {org_info['type']}")

    # Chicago/Illinois bonus
    if "chicago" in city or "evanston" in city or "oak brook" in city or "illinois" in state:
        score += 10
        reasons.append("Chicago/Illinois-based")

    # Senior title bonus
    if any(t in title for t in ["managing partner", "general partner", "founder", "gp", "president", "ceo"]):
        score += 10
        reasons.append("Senior decision-maker")
    elif any(t in title for t in ["partner", "managing director", "principal", "director"]):
        score += 5
        reasons.append("Investment role")

    # Food/community keyword
    if any(w in org + " " + title for w in ["food", "grocery", "community", "neighborhood", "urban"]):
        score += 5
        reasons.append("Food/community keyword")

    return score, reasons


def main():
    print("Fetching all Apollo contacts...")
    all_contacts = fetch_all_contacts()
    print(f"Total contacts: {len(all_contacts)}")

    # Find and score mission-aligned contacts
    scored = []

    for email, c in all_contacts.items():
        org = (c.get("organization_name") or "").lower()
        title = (c.get("title") or "").lower()
        name = c["_name"]

        matched_key = None
        for key, info in MISSION_ALIGNED_ORGS.items():
            if key in org or key in email:
                matched_key = key
                break

        # Also check for senior impact roles at other firms
        if not matched_key:
            if "impact" in title and any(
                w in title
                for w in ["director", "partner", "head", "managing", "vp", "vice president"]
            ):
                matched_key = "__impact_role"

        if not matched_key:
            continue

        if matched_key == "__impact_role":
            org_info = {
                "type": "Impact Role",
                "why": f"Senior impact role at {c.get('organization_name', '')}",
            }
        else:
            org_info = MISSION_ALIGNED_ORGS[matched_key]

        score, reasons = score_mission_contact(c, org_info)

        status = "New"
        if name.lower() in ALREADY_CONTACTED:
            status = "Already contacted"
        elif name.lower() in IN_TIER1_CAMPAIGN:
            status = "In Tier 1 campaign"

        scored.append({
            "name": name,
            "email": email,
            "org": c.get("organization_name", ""),
            "title": c.get("title", ""),
            "location": c["_location"],
            "type": org_info["type"],
            "why": org_info["why"],
            "score": score,
            "reasons": reasons,
            "status": status,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    # Output
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(base_dir, "pipeline", "mission-aligned-investors.md")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# Mission-Aligned Investors: Foundations, Impact Funds, and Non-VC Capital\n\n")
        f.write("> Generated: 2026-04-05\n")
        f.write(f"> Total: {len(scored)} contacts\n")
        f.write("> Non-traditional investors whose mission aligns with Uncle May's thesis:\n")
        f.write(">   data infrastructure for Black food consumption, community wealth, food access\n\n")

        f.write("## Scoring Criteria\n\n")
        f.write("| Factor | Points |\n")
        f.write("|--------|--------|\n")
        f.write("| Diversity/Black-led fund | +30 |\n")
        f.write("| Impact/mission fund | +25 |\n")
        f.write("| Food/climate sector alignment | +20 |\n")
        f.write("| Community/catalytic capital | +15 |\n")
        f.write("| Potential ally (advisory, public, family) | +10 |\n")
        f.write("| Chicago/Illinois-based | +10 |\n")
        f.write("| Senior decision-maker | +10 |\n")
        f.write("| Investment role | +5 |\n")
        f.write("| Food/community keyword | +5 |\n\n")

        f.write("## Ranked Contacts\n\n")
        f.write("| # | Name | Organization | Type | Title | Location | Score | Status | Why Aligned |\n")
        f.write("|---|------|-------------|------|-------|----------|-------|--------|-------------|\n")
        for i, c in enumerate(scored, 1):
            reasons_str = "; ".join(c["reasons"])
            f.write(
                f"| {i} | {c['name']} | {c['org']} | {c['type']} "
                f"| {c['title']} | {c['location']} | {c['score']} | {c['status']} | {reasons_str} |\n"
            )

    print(f"\nWrote {len(scored)} contacts to {output_path}")
    print()

    # Print summary by type
    by_type = {}
    for c in scored:
        by_type.setdefault(c["type"], []).append(c)

    print("=== MISSION-ALIGNED INVESTORS FOR UNCLE MAY'S ===")
    for t in sorted(by_type.keys(), key=lambda x: -max(c["score"] for c in by_type[x])):
        contacts = by_type[t]
        print(f"\n--- {t} ({len(contacts)} contacts) ---")
        for c in contacts:
            tag = ""
            if c["status"] != "New":
                tag = f" [{c['status'].upper()}]"
            print(f"  {c['score']:3d}  {c['name']} | {c['org']} | {c['title']} | {c['location']}{tag}")
            print(f"       Why: {c['why']}")

    # Summary JSON
    summary_path = os.path.join(base_dir, "pipeline", "mission-aligned-summary.json")
    summary = {
        "generated": "2026-04-05",
        "total_contacts": len(scored),
        "by_type": {t: len(cs) for t, cs in by_type.items()},
        "new_contacts": sum(1 for c in scored if c["status"] == "New"),
        "already_contacted": sum(1 for c in scored if c["status"] != "New"),
        "top_10": [
            {"name": c["name"], "org": c["org"], "type": c["type"],
             "score": c["score"], "why": c["why"], "status": c["status"]}
            for c in scored[:10]
        ],
    }
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"\n{summary_path}")


if __name__ == "__main__":
    main()
