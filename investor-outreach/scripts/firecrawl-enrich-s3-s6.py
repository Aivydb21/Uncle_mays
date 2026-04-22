#!/usr/bin/env python3
"""
firecrawl-enrich-s3-s6.py — Firecrawl enrichment pass for S3 + S6 contacts.

For each contact, scrapes the org/program website (thesis/about/portfolio/grant page),
extracts relevant text, and updates the Thesis Fit Notes section of the contact file.

Budget: hard cap at 150 credits. Skips already-cached entries.

Run from Desktop/um_website/investor-outreach/:
    python scripts/firecrawl-enrich-s3-s6.py
    python scripts/firecrawl-enrich-s3-s6.py --dry-run      # show what would be scraped
    python scripts/firecrawl-enrich-s3-s6.py --limit 20     # override credit limit
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTACTS_DIR = os.path.join(ROOT, "contacts")
CACHE_DIR = os.path.join(ROOT, "pipeline", "firecrawl-cache")
CONFIG_PATH = os.path.expanduser("~/.claude/firecrawl-config.json")
CREDIT_LIMIT = 150

# ---------------------------------------------------------------------------
# Target map: (email_slug, display_name, scrape_url, priority_score)
# Priority determines order; highest scraped first within credit budget.
# ---------------------------------------------------------------------------

TARGETS = [
    # S3 — Philanthropic / Mission-Aligned
    # Format: (slug, name, url, score)
    ("programs-chicagoclf-org", "Chicago Community Loan Fund",
     "https://www.chicagoclf.org/loans/", 88),
    ("info-cct-org", "Chicago Community Trust",
     "https://cct.org/grants/", 85),
    ("grants-polkbrosfdn-org", "Polk Bros Foundation",
     "https://www.polkbrosfdn.org/grants/guidelines/", 80),
    ("programstaff-joycefdn-org", "Joyce Foundation",
     "https://www.joycefdn.org/programs/", 82),
    ("info-buildersinitiative-org", "Builders Initiative",
     "https://www.buildersinitiative.org/what-we-do/", 72),
    ("lending-iff-org", "IFF (Illinois Facilities Fund)",
     "https://www.iff.org/lending/", 83),
    ("chicago-lisc-org", "LISC Chicago",
     "https://www.lisc.org/chicago/", 81),
    ("info-fieldfoundation-org", "Field Foundation of Illinois",
     "https://www.fieldfoundation.org/grants/", 68),
    ("info-woodsfund-org", "Woods Fund Chicago",
     "https://www.woodsfund.org/grantmaking/", 70),
    ("grants-driehaus-org", "Driehaus Foundation",
     "https://www.driehausfoundation.org/grant-guidelines/", 55),
    ("grants-grandvictoria-org", "Grand Victoria Foundation",
     "https://www.grandvictoriafdn.org/grant-guidelines/", 65),
    ("grants-mccormickfoundation-org", "McCormick Foundation",
     "https://www.mccormickfoundation.org/grants/", 75),
    ("socialinvestments-kresge-org", "Kresge Foundation Social Investments",
     "https://kresge.org/our-work/social-investment-practice/", 73),
    ("programinfo-wkkf-org", "W.K. Kellogg Foundation",
     "https://www.wkkf.org/grants/how-to-apply", 74),
    ("grants-surdna-org", "Surdna Foundation",
     "https://surdna.org/grants/", 63),
    ("healthyfood-reinvestment-com", "Reinvestment Fund Healthy Food",
     "https://www.reinvestment.com/impact/healthy-food/", 78),
    ("info-enterprisecommunity-org", "Enterprise Community Partners",
     "https://www.enterprisecommunity.org/financing-and-development/financial-products", 70),
    ("info-livingcities-org", "Living Cities",
     "https://livingcities.org/work/", 67),
    ("info-nextstreet-com", "Next Street",
     "https://nextstreet.com/what-we-do/", 60),
    ("info-benefitchicago-org", "Benefit Chicago",
     "https://www.benefitchicago.org/about/", 84),
    ("grants-conantfamilyfoundation-org", "Conant Family Foundation",
     "https://www.conantfamilyfoundation.org/", 62),
    ("info-ofn-org", "Opportunity Finance Network",
     "https://ofn.org/cdfi-resources/", 45),

    # S6 — Grants / Non-dilutive (top by score)
    ("apply-goodfoodcatalyst-org", "Good Food Catalyst",
     "https://goodfoodcatalyst.org/apply/", 80),
    ("apply-kroger-com", "Kroger F3 Tech Accelerator",
     "https://www.thekrogerco.com/business-segments/kroger-alternative-profit/kroger-precision-marketing/", 82),
    ("rd-usda-il-usda-gov", "USDA VAPG Program",
     "https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants", 85),
    ("scbgp-usda-gov", "USDA Specialty Crop Block Grant",
     "https://www.ams.usda.gov/grants-and-loans/specialty-crop-block-grant-program", 80),
    ("apply-chobaniincubator-com", "Chobani Incubator",
     "https://choosingchobani.com/incubator/", 72),
    ("apply-foodsystem6-org", "Food System 6",
     "https://foodsystem6.org/programs/", 75),
    ("chicago-techstars-com", "Techstars Chicago",
     "https://www.techstars.com/accelerators/chicago", 68),
    ("info-blackfoodfund-org", "Black Food Fund",
     "https://blackfoodfund.com/apply/", 78),
    ("apply-backstagecapital-com", "Backstage Capital Grant",
     "https://backstagecapital.com/grants/", 72),
    ("apply-plugandplaytechcenter-com", "Plug and Play Food",
     "https://www.plugandplaytechcenter.com/food-agriculture/", 65),
    ("grants-kauffman-org", "Kauffman Foundation",
     "https://www.kauffman.org/grants/", 68),
    ("smallbiz-cityofchicago-org", "Chi Biz Hub / Chicago SBIF",
     "https://www.chicago.gov/city/en/depts/dcd/supp_info/small_business_improvementfund.html", 73),
    ("info-trendcorp-org", "Chicago TREND",
     "https://www.chicagotrend.com/about/", 76),
    ("ams-grants-usda-gov", "USDA LFPA Program",
     "https://www.ams.usda.gov/selling-your-farm-products/local-food-purchase-assistance", 78),
    ("fmpp-ams-usda-gov", "USDA Farmers Market Promotion Program",
     "https://www.ams.usda.gov/grants-and-loans/farmers-market-promotion-program", 72),
    ("info-newmarkets-iff-org", "IFF New Markets Tax Credit",
     "https://www.iff.org/real-estate/new-markets-tax-credits/", 79),
    ("grants-jpmorgan-com", "JPMorgan PRO Neighborhoods",
     "https://www.jpmorganchase.com/impact/communities/pro-neighborhoods", 70),
    ("apply-wellsfargo-com", "Wells Fargo Open for Business",
     "https://www.wellsfargo.com/open-for-business-fund/", 62),
    ("info-foodtrustgrants-org", "The Food Trust",
     "https://thefoodtrust.org/what-we-do/", 77),
    ("grants-citigroup-com", "Citi Progress Makers",
     "https://www.citigroup.com/citi/foundation/", 68),
    ("apply-chifoodpolicycouncil-org", "Chicago Food Policy Action Council",
     "https://www.chicagofoodpolicy.com/programs", 55),
    ("ssbci-illinois-gov", "SSBCI Illinois",
     "https://dceo.illinois.gov/businessfinancialassistance/ssbci.html", 70),
    ("vouchers-illinois-gov", "Illinois Innovation Voucher",
     "https://www.illinoisinnovation.com/innovation-vouchers/", 68),
    ("apply-accion-org", "Accion Opportunity Fund",
     "https://www.accionopportunityfund.org/business-loans/", 62),
    ("info-chicagocatalyst-org", "Chicago Community Foundation",
     "https://www.cct.org/apply-for-a-grant/", 70),
]


def load_config() -> dict:
    if not os.path.exists(CONFIG_PATH):
        print(f"Firecrawl config not found at {CONFIG_PATH}", file=sys.stderr)
        sys.exit(1)
    with open(CONFIG_PATH) as f:
        return json.load(f)


def cache_path(slug: str) -> str:
    return os.path.join(CACHE_DIR, slug + ".json")


def is_cached(slug: str) -> bool:
    return os.path.exists(cache_path(slug))


def firecrawl_scrape(api_key: str, url: str, slug: str) -> dict | None:
    """Call Firecrawl v2 /scrape endpoint. Returns parsed JSON or None on error."""
    endpoint = "https://api.firecrawl.dev/v1/scrape"
    payload = json.dumps({
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": True,
        "waitFor": 1000,
    }).encode()
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            # Save to cache
            os.makedirs(CACHE_DIR, exist_ok=True)
            with open(cache_path(slug), "w", encoding="utf-8") as f:
                json.dump({"url": url, "data": data}, f, indent=2)
            return data
    except Exception as exc:
        print(f"  Firecrawl error for {url}: {exc}", file=sys.stderr)
        return None


def extract_thesis_notes(markdown: str, org_name: str, max_chars: int = 600) -> str:
    """Extract the most relevant 1-2 paragraphs about thesis/mission/programs."""
    if not markdown:
        return f"Firecrawl returned empty content for {org_name}."

    # Look for mission-relevant sections
    keywords = [
        "mission", "focus", "invest", "grant", "program", "food", "community",
        "support", "fund", "eligib", "priority", "thesis", "portfolio",
        "black", "bipoc", "equity", "access", "produce", "agriculture",
    ]

    lines = markdown.split("\n")
    scored_lines: list[tuple[int, str]] = []
    for line in lines:
        line = line.strip()
        if not line or len(line) < 30:
            continue
        # Skip nav/boilerplate lines
        if line.startswith("#") and len(line) < 50:
            continue
        score = sum(1 for kw in keywords if kw.lower() in line.lower())
        if score > 0:
            scored_lines.append((score, line))

    scored_lines.sort(key=lambda x: -x[0])

    # Take top lines up to max_chars
    selected = []
    total = 0
    for _, line in scored_lines[:8]:
        if total + len(line) > max_chars:
            break
        selected.append(line)
        total += len(line)

    if not selected:
        # Fall back to first 600 chars of markdown
        return markdown[:max_chars].strip()

    notes = " | ".join(selected[:3])
    return f"[Firecrawl {org_name}] {notes}"


def update_contact_file_thesis(slug: str, thesis_notes: str) -> bool:
    """Replace the Thesis Fit Notes section in the contact file."""
    path = os.path.join(CONTACTS_DIR, slug + ".md")
    if not os.path.exists(path):
        return False
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace Thesis Fit Notes section content
    section_start = "## Thesis Fit Notes\n"
    next_section = "\n## Touch Log"
    if section_start not in content:
        return False

    idx = content.index(section_start) + len(section_start)
    end_idx = content.find(next_section, idx)
    if end_idx == -1:
        return False

    # Preserve any existing hand-written notes if they don't start with "To be populated"
    existing = content[idx:end_idx].strip()
    if existing and not existing.startswith("To be populated") and not existing.startswith("[Firecrawl"):
        # Append firecrawl notes to existing notes
        new_notes = existing + "\n\n" + thesis_notes
    else:
        new_notes = thesis_notes

    new_content = content[:idx] + new_notes + "\n" + content[end_idx:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Show what would be scraped without calling API")
    ap.add_argument("--limit", type=int, default=CREDIT_LIMIT, help="Max Firecrawl credits to use")
    ap.add_argument("--force", action="store_true", help="Re-scrape even if cached")
    args = ap.parse_args()

    config = load_config()
    api_key = config["api_key"]

    # Sort by priority (score desc)
    targets = sorted(TARGETS, key=lambda t: -t[3])

    credits_used = 0
    enriched = 0
    cache_hits = 0
    errors = 0

    print(f"Firecrawl enrichment: {len(targets)} targets, budget {args.limit} credits")
    print()

    for slug, name, url, score in targets:
        if credits_used >= args.limit:
            print(f"Credit limit ({args.limit}) reached. Stopping.")
            break

        if is_cached(slug) and not args.force:
            # Use cached data
            with open(cache_path(slug)) as f:
                cached = json.load(f)
            data = cached.get("data", {})
            markdown = ""
            if isinstance(data, dict):
                md = data.get("data", data)
                if isinstance(md, dict):
                    markdown = md.get("markdown", "")
                elif isinstance(md, str):
                    markdown = md
            thesis = extract_thesis_notes(markdown, name)
            updated = update_contact_file_thesis(slug, thesis)
            if updated:
                cache_hits += 1
                print(f"  [cache] {name}: contact file updated")
            continue

        if args.dry_run:
            print(f"  [would scrape] {name} (score {score}): {url}")
            continue

        print(f"  [scrape] {name} (score {score})... ", end="", flush=True)
        data = firecrawl_scrape(api_key, url, slug)
        credits_used += 1

        if data is None:
            errors += 1
            print("ERROR")
            continue

        # Extract markdown from response
        markdown = ""
        if isinstance(data, dict):
            md = data.get("data", data)
            if isinstance(md, dict):
                markdown = md.get("markdown", "")
            elif isinstance(md, str):
                markdown = md

        thesis = extract_thesis_notes(markdown, name)
        updated = update_contact_file_thesis(slug, thesis)
        if updated:
            enriched += 1
            print(f"ok ({len(markdown)} chars)")
        else:
            print(f"scraped but contact file not found")

        # Polite rate limit: 1 req/sec
        time.sleep(1.0)

    print()
    print(f"Done: {enriched} enriched, {cache_hits} from cache, {errors} errors, {credits_used} credits used")
    return 0


if __name__ == "__main__":
    sys.exit(main())
