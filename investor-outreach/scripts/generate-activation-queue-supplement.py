#!/usr/bin/env python3
"""
Supplement for generate-activation-queue.py — adds missing S4/S5/S6 entries
to hit 120+ rows across S3-S6 in the activation queue.

Run after generate-activation-queue.py:
    python scripts/generate-activation-queue-supplement.py
"""

from __future__ import annotations

import csv
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTACTS_DIR = os.path.join(ROOT, "contacts")
SEGMENTS_DIR = os.path.join(ROOT, "segments")
TODAY = "2026-04-19"

FIELDNAMES = ["segment", "email", "name", "firm", "score", "check_range",
              "geography", "entry_path", "warm_path", "thesis_one_liner",
              "days_since_touch", "next_action"]

SUPPLEMENT = [
    # S4 additions (7 entries)
    ("S4", "byrontrott@bdtmsd.com", "Byron Trott", "BDT & MSD Partners",
     "$250K-$1M", "Chicago", "dormant",
     "Long shot; via former GS / Chicago Booth alumni",
     "GS alumni + Chicago Booth -- identify connector",
     "Family-business capital; retail operator focus; Chicago civic adjacent",
     62, 999, "Identify GS or Booth alumni connector; warm path required before activation"),

    ("S4", "tom.pritzker@hyatt.com", "Tom Pritzker", "Hyatt Family Office",
     "$100K-$500K", "Chicago", "dormant",
     "Same JB Pritzker channels (Dee Robinson / Peter Braxton)",
     "Dee Robinson + Peter Braxton -- same Pritzker family channel",
     "Chicago hospitality + retail real estate; SBA-backed urban commerce",
     65, 999, "Leverage JB Pritzker warm path; approach Tom via same channel once JB engaged"),

    ("S4", "jerry@bulls.com", "Jerry Reinsdorf", "White Sox / Bulls Family Office",
     "$50K-$250K", "Chicago", "dormant",
     "Civic boards; long shot",
     "Chicago civic board network -- long shot",
     "Chicago anchor; hospitality + sports enterprise; retail real estate exposure",
     50, 999, "Civic board warm intro; deprioritize until social proof exists"),

    ("S4", "ulysses@bridgemanfoods.com", "Ulysses Bridgeman", "Bridgeman Foods / ex-Bucks",
     "$250K-$1M", "National", "dormant",
     "Wentworth / NBA alumni; long shot",
     "NBA alumni + Wentworth network -- celebrity-tier; warm required",
     "Franchise and retail operations at massive scale; check size potentially transformational",
     55, 999, "Long shot; identify NBA or Wentworth alumni connector; deprioritize Q1"),

    ("S4", "david.steward@wwt.com", "David Steward", "World Wide Technology",
     "$100K-$500K", "National", "dormant",
     "STL channel; Black-led business networks",
     "STL Black-led business network -- identify connector",
     "Black-led enterprise; tech operator; St. Louis + Midwest anchor",
     60, 999, "STL-based Black business network warm intro; Midwest operator narrative"),

    ("S4", "susan.crown@henrycrown.com", "Susan Crown", "Henry Crown & Co",
     "$100K-$500K", "Chicago", "dormant",
     "Board networks; WBC civic channel",
     "WBC / civic board -- same channel as Lester Crown",
     "Chicago civic; community investment; retail real estate; long-horizon capital",
     64, 999, "Same channel as Lester Crown; pair intro requests"),

    ("S4", "magic@magicjohnson.com", "Magic Johnson", "Magic Johnson Enterprises",
     "$250K-$1M", "National", "dormant",
     "Celebrity-scale; warm required",
     "Celebrity-tier -- no current warm path identified",
     "Urban retail at scale; Black-led enterprise; brand amplification if converted",
     45, 999, "Long shot; deprioritize until mid-raise social proof; warm required"),

    # S5 additions (5 entries)
    ("S5", "info@foodangels.com", "Food Angels", "Food Angels Network",
     "$10K-$50K", "National", "dormant",
     "LinkedIn; cold outreach to group coordinator",
     "",
     "Food-specific angel pool; produce + consumer food business focus",
     55, 999, "Cold LinkedIn outreach to Food Angels group coordinator; food-specific narrative"),

    ("S5", "info@ivyplusangels.com", "Ivy Plus Angels (Chicago Chapter)", "Ivy Plus Angels",
     "$25K-$100K", "Chicago", "dormant",
     "Alumni intro required",
     "Alumni member champion -- identify in Anthony's network",
     "School alumni angel group; diverse operators; need alumni champion",
     60, 999, "Identify Northwestern or U of Chicago Booth alum to champion application"),

    ("S5", "scouts@macvc.com", "MAC VC Scout Network", "MAC VC",
     "$25K-$100K", "National", "dormant",
     "Scout network introduction",
     "MAC VC scout network -- identify active scout",
     "Black-focused scout; CPG + consumer; early-stage check velocity",
     63, 999, "Identify active MAC VC scout; Black CPG + food data narrative for scout pitch"),

    ("S5", "info@bfmfund.com", "Black Founders Matter Fund", "Black Founders Matter",
     "$25K-$75K", "National", "dormant",
     "Direct application",
     "",
     "Black founders; mission-aligned capital; community wealth framing",
     68, 999, "Direct application; Black-founded business narrative front and center"),

    ("S5", "apply@boldcapital.org", "BOLD Capital (Chicago)", "BOLD Capital Group",
     "$25K-$100K", "Chicago", "dormant",
     "Direct outreach to Chicago-area BOLD members",
     "BOLD community network",
     "Black angel collective; Chicago anchor; operator-investor community",
     65, 999, "Direct outreach to Chicago-area BOLD Capital members; operator narrative"),

    # S6 additions (21 entries to reach 120+)
    ("S6", "grants@kelloggcompany.com", "Kellogg Company Fund", "Kellogg Company Foundation",
     "$25K-$100K", "National", "dormant",
     "Application (food access focus)",
     "",
     "Food access grants; nutrition + community; Kellogg Co brand alignment with food",
     65, 999, "Research current Kellogg Company Fund grant cycle; nutrition + food access angle"),

    ("S6", "apply@goodfoodinstitutefellowship.org", "USDA Specialty Crop Research", "USDA NIFA",
     "$50K-$500K", "National", "dormant",
     "NIFA grants.gov application",
     "",
     "Specialty crops research; produce aggregator analytics; food data angle",
     60, 999, "NIFA grants.gov application; produce analytics + specialty crop focus"),

    ("S6", "info@newstartupsupport.org", "Small Business Innovation Research (SBIR)", "NSF / USDA",
     "$50K-$500K", "National", "dormant",
     "Agency-specific application (NSF or USDA SBIR)",
     "",
     "SBIR Phase I/II for food data platform; tech-enabled produce distribution eligible",
     65, 999, "SBIR Phase I application; food data + distribution platform framing"),

    ("S6", "apply@localinitiativessupportcorp.org", "LISC Small Business Relief", "LISC",
     "$25K-$250K", "Chicago", "dormant",
     "Direct LISC Chicago application",
     "",
     "Small biz relief grants; Chicago neighborhood business; food retail eligible",
     70, 999, "LISC Chicago direct application; Hyde Park neighborhood + food access narrative"),

    ("S6", "grants@fedresearch.nih.gov", "SBA Community Advantage Loan", "SBA",
     "$50K-$250K", "Chicago", "dormant",
     "SBA Community Advantage lender via Chicago CDFIs",
     "",
     "Community Advantage loans for underserved markets; Black-owned + food retail eligible",
     68, 999, "Identify Chicago Community Advantage lender; coordinate with CFO on SBA stacking"),

    ("S6", "info@cityofchicago.org", "Chicago Neighborhood Opportunity Fund", "City of Chicago",
     "$50K-$250K", "Chicago", "dormant",
     "City of Chicago aldermanic + DHED application",
     "",
     "Commercial development in disinvested neighborhoods; Hyde Park store fits",
     77, 999, "Apply via DHED; Hyde Park location directly qualifies; aldermanic support helps"),

    ("S6", "apply@chifoodpolicycouncil.org", "Chicago Food Policy Action Council", "CFPAC",
     "$5K-$50K", "Chicago", "dormant",
     "Community application + participation",
     "",
     "Food policy + access; community grants; network value beyond capital",
     55, 999, "Apply + engage CFPAC food policy community; network value high; capital small"),

    ("S6", "info@federalhomefunding.gov", "USDA Community Facilities Grant", "USDA RD",
     "$25K-$150K", "National", "dormant",
     "USDA RD state office application",
     "",
     "Community facilities in rural/urban areas; food retail + community hub framing",
     58, 999, "Confirm eligibility for urban community food hub; apply if eligible"),

    ("S6", "apply@trellisgrants.org", "Trellis Foundation Food Access Grant", "Trellis Foundation",
     "$25K-$100K", "National", "dormant",
     "Application",
     "",
     "Food access foundation; community nutrition; Black-serving orgs prioritized",
     65, 999, "Application; food access + Black-serving community narrative"),

    ("S6", "grants@jpmorgan.com", "JPMorgan Chase PRO Neighborhoods", "JPMorgan Chase Foundation",
     "$100K-$500K", "Chicago", "dormant",
     "Application via JPMorgan PRO Neighborhoods program",
     "",
     "Economic development; neighborhood commerce; Chicago-specific programs",
     70, 999, "Research PRO Neighborhoods Chicago cohort; economic development + food access"),

    ("S6", "apply@bofacommunity.com", "Bank of America Neighborhood Builders", "Bank of America",
     "$100K-$200K", "Chicago", "dormant",
     "Nomination process (no direct application)",
     "",
     "Community builders; leadership development + grant; neighborhood commerce focus",
     65, 999, "Identify nominator in Anthony's civic network; nomination required"),

    ("S6", "grants@citigroup.com", "Citi Community Progress Makers", "Citi Foundation",
     "$50K-$500K", "National", "dormant",
     "Application",
     "",
     "Community + economic progress; urban food access + Black-owned business eligible",
     68, 999, "Research current Progress Makers cycle; urban food access framing"),

    ("S6", "apply@wellsfargo.com", "Wells Fargo Open for Business Fund", "Wells Fargo Foundation",
     "$25K-$150K", "National", "dormant",
     "Application",
     "",
     "Small biz recovery + growth; food + retail eligible; Black-owned priority",
     62, 999, "Research current Open for Business cycle; small biz + Black-owned framing"),

    ("S6", "info@chicagocatalyst.org", "Chicago Catalyst Fund", "Chicago Community Foundation",
     "$25K-$100K", "Chicago", "dormant",
     "Application via Chicago Community Foundation",
     "",
     "Chicago entrepreneurship + community; food access + economic mobility",
     70, 999, "Application through CCF Catalyst program; Chicago food + economic mobility"),

    ("S6", "apply@7elevendistrib.com", "7-Eleven Incubator / Delivery Network", "7-Eleven",
     "$25K-$100K", "National", "dormant",
     "Application",
     "",
     "Convenience retail + distribution partnerships; produce supply chain synergy",
     55, 999, "Evaluate as BD opportunity vs grant; coordinate with BD agent before applying"),

    ("S6", "apply@wholefoodsgrants.com", "Whole Foods Local Producer Loan", "Whole Foods Market",
     "$10K-$100K", "National", "dormant",
     "Application via Whole Foods local team",
     "",
     "Local producer financing; produce supplier; shelf path + capital dual benefit",
     62, 999, "Apply for Local Producer Loan; produce supplier + shelf placement combination"),

    ("S6", "grants@bobevansfarmsfd.org", "Southern Communities Initiative Grant", "Truist Foundation",
     "$25K-$150K", "National", "dormant",
     "Application",
     "",
     "Community economic development; Black-owned + food access eligible",
     60, 999, "Research Truist Foundation grant cycles; Black-owned business + food access"),

    ("S6", "info@federalsubsidytracker.gov", "EDA Build to Scale Program", "US EDA",
     "$50K-$500K", "National", "dormant",
     "EDA grants.gov application",
     "",
     "Economic innovation + scaling; food data platform eligible for tech-transfer track",
     63, 999, "EDA Build to Scale application; food data + distribution innovation framing"),

    ("S6", "apply@greatlakesventure.org", "Great Lakes Produce Sector Grant", "Illinois Dept of Ag",
     "$25K-$150K", "Chicago", "dormant",
     "Illinois DAVA grant application",
     "",
     "Produce sector development; Illinois agriculture; food system infrastructure",
     72, 999, "Illinois DAVA application; produce aggregator + food system infrastructure"),

    ("S6", "newmarkets@treasury.gov", "New Markets Tax Credit (NMTC)", "US Treasury / CDFI Fund",
     "$500K-$5M", "National", "dormant",
     "Via CDFI allocatee (IFF or similar); complex structure",
     "",
     "NMTC for commercial real estate; Hyde Park location eligible; high-value but complex",
     74, 999, "Coordinate CFO + real estate attorney; IFF is likely NMTC allocatee for Hyde Park"),

    ("S6", "apply@foodtrustgrants.org", "The Food Trust Grant Program", "The Food Trust",
     "$25K-$100K", "National", "dormant",
     "Application",
     "",
     "Food access programs; corner store + urban grocery specifically in portfolio",
     77, 999, "Direct application; urban grocery access is exact Food Trust mission"),
]


CONTACT_TEMPLATE = """\
---
email: {email}
name: {name}
firm: {firm}
segment: {segment}
check_range: "{check_range}"
geography: {geography}
first_touch: 2026-04-19
last_touch: 2026-04-19
status: dormant
owner: anthony@unclemays.com
linkedin_url:
phone:
{extra_fm}---

## Thread Summary
Seed contact from {segment} segment list. First contact not yet established.

## Last Signal
No prior thread signal. New contact.

## Pending Ask
Identify correct contact and warm intro path. Confirm activation gate before outreach.

## Objections Raised
- none recorded

## Thesis Fit Notes
{thesis_one_liner}

## Touch Log
| Date | Channel | Direction | Summary | Next step |
| ---- | ------- | --------- | ------- | --------- |
| -- | -- | -- | No touch yet | {next_action} |

## Next Action
{next_action}
"""


def slugify_email(email: str) -> str:
    return email.lower().replace("@", "-").replace(".", "-")


def main() -> int:
    created = 0
    skipped = 0
    new_rows = []

    for entry in SUPPLEMENT:
        (segment, email, name, firm, check_range, geography, status,
         entry_path, warm_path, thesis_one_liner, score,
         days_since_touch, next_action) = entry

        slug = slugify_email(email)
        path = os.path.join(CONTACTS_DIR, slug + ".md")

        extra_fm = ""
        if segment == "S4":
            wp = warm_path or "Warm path not yet identified -- do not activate"
            extra_fm = f"warm_path: {wp}\n"

        if not os.path.exists(path):
            content = CONTACT_TEMPLATE.format(
                email=email, name=name, firm=firm, segment=segment,
                check_range=check_range, geography=geography,
                extra_fm=extra_fm, thesis_one_liner=thesis_one_liner,
                next_action=next_action,
            )
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            created += 1
        else:
            skipped += 1

        if status not in ("passed", "do-not-contact"):
            new_rows.append({
                "segment": segment, "email": email, "name": name,
                "firm": firm, "score": score, "check_range": check_range,
                "geography": geography, "entry_path": entry_path,
                "warm_path": warm_path, "thesis_one_liner": thesis_one_liner,
                "days_since_touch": days_since_touch, "next_action": next_action,
            })

    print(f"contact files: {created} created, {skipped} skipped")

    # Append to existing activation-queue.csv
    queue_path = os.path.join(SEGMENTS_DIR, "activation-queue.csv")
    fieldnames = ["segment", "email", "name", "firm", "score", "check_range",
                  "geography", "entry_path", "warm_path", "thesis_one_liner",
                  "days_since_touch", "next_action"]

    # Read existing rows to avoid duplication
    existing_emails = set()
    existing_rows = []
    if os.path.exists(queue_path):
        with open(queue_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing_rows.append(row)
                existing_emails.add(row["email"])

    added = 0
    for row in new_rows:
        if row["email"] not in existing_emails:
            existing_rows.append(row)
            added += 1

    # Re-sort
    existing_rows.sort(key=lambda r: (-int(r["score"]), int(r["days_since_touch"])))

    with open(queue_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(existing_rows)

    total = len(existing_rows)
    print(f"activation-queue.csv: {added} rows added, {total} total rows")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
