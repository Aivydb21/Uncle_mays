#!/usr/bin/env python3
"""
Tier 2 Campaign Preparation Script
Parses Tier 2 contacts from markdown, deduplicates against Tier 1 Apollo campaign,
resolves Apollo contact IDs, and splits contacts across 3 sender accounts using
firm-distributed round-robin.

Outputs:
  - pipeline/tier-2/contact-ids.json (all Tier 2 contacts with Apollo IDs)
  - pipeline/tier-2/campaign-split-a.json (denise@)
  - pipeline/tier-2/campaign-split-b.json (rosalind@)
  - pipeline/tier-2/campaign-split-c.json (invest@)
  - pipeline/tier-2/dedup-report.json (removed contacts and reasons)
"""

import json
import os
import re
import sys
import time
import urllib.request
from collections import defaultdict

# --- Config ---
CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]

# --- Paths ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, "..")
TIER2_MD = os.path.join(BASE_DIR, "pipeline", "tier-2", "warm-contacts.md")
TIER1_IDS = os.path.join(BASE_DIR, "pipeline", "tier-1", "contact-ids.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "pipeline", "tier-2")

TIER1_CAMPAIGN_ID = "69d2a0b2c2e0c6000d1608d4"

# Sender accounts for the 4 campaigns
ACCOUNTS = [
    {"label": "A", "email": "denise@unclemays.com", "file": "campaign-split-a.json"},
    {"label": "B", "email": "rosalind@unclemays.com", "file": "campaign-split-b.json"},
    {"label": "C", "email": "invest@unclemays.com", "file": "campaign-split-c.json"},
    {"label": "D", "email": "timj@unclemays.com", "file": "campaign-split-d.json"},
]


# --- Apollo API helpers ---

def apollo_get(endpoint, retries=3):
    """GET request to Apollo API."""
    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/{endpoint}",
            headers={
                "X-Api-Key": API_KEY,
                "User-Agent": "curl/8.0",
            },
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
                return None


def apollo_post(endpoint, payload, retries=3):
    """POST request to Apollo API."""
    data = json.dumps(payload).encode("utf-8")
    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/{endpoint}",
            data=data,
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
                return None


# --- Step 1: Parse Tier 2 markdown ---

def parse_tier2_markdown(path):
    """Parse the Tier 2 warm-contacts.md markdown table into a list of dicts.

    Handles rows where the Title field contains pipe characters by anchoring
    on the known columns: # (int), Name, Email (@), Org at the start,
    and Location, Score (int), Why at the end.
    """
    contacts = []
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line.startswith("|"):
            continue
        # Skip header separator rows
        if re.match(r"^\|[\s\-|]+$", line):
            continue

        # Split on | and strip whitespace; remove empty first/last entries
        raw_cols = line.split("|")
        cols = [c.strip() for c in raw_cols[1:-1]]  # skip leading/trailing empty

        if len(cols) < 8:
            continue

        # Skip header row
        if cols[0] == "#":
            continue

        # Validate first column is a number
        try:
            num = int(cols[0])
        except ValueError:
            continue

        # Anchor from the end: last 3 real columns are Location, Score, Why
        # Score is always an integer, so find it from the right
        score_idx = None
        for i in range(len(cols) - 1, 3, -1):
            try:
                score_val = int(cols[i])
                # Score should be between 1 and 100
                if 1 <= score_val <= 100:
                    score_idx = i
                    break
            except ValueError:
                continue

        if score_idx is None:
            continue

        # Columns layout:
        # [0]=# [1]=Name [2]=Email [3]=Org [4..score_idx-2]=Title [score_idx-1]=Location [score_idx]=Score [score_idx+1:]=Why
        name = cols[1]
        email = cols[2].lower().strip()
        organization = cols[3]
        title = " | ".join(cols[4:score_idx - 1]) if score_idx > 5 else cols[4]
        location = cols[score_idx - 1] if score_idx > 4 else ""
        score = int(cols[score_idx])
        why = " | ".join(cols[score_idx + 1:]) if score_idx + 1 < len(cols) else ""

        contact = {
            "num": num,
            "name": name,
            "email": email,
            "organization": organization,
            "title": title,
            "location": location,
            "score": score,
            "why": why,
        }
        contacts.append(contact)

    return contacts


# --- Step 2: Deduplicate against Tier 1 ---

def get_tier1_emails():
    """Get all emails from the active Tier 1 campaign."""
    tier1_emails = set()
    dedup_sources = []

    # Source 1: contact-ids.json (66 known Tier 1 contacts)
    if os.path.exists(TIER1_IDS):
        with open(TIER1_IDS) as f:
            tier1_contacts = json.load(f)
        for c in tier1_contacts:
            email = c.get("email", "").lower().strip()
            if email:
                tier1_emails.add(email)
        dedup_sources.append(f"contact-ids.json: {len(tier1_contacts)} contacts")

    # Source 2: Query the live Tier 1 campaign for its full contact list
    # Apollo API: search contacts filtered by campaign
    print("  Querying Tier 1 campaign contacts from Apollo API...")
    page = 1
    api_count = 0
    while True:
        result = apollo_post("contacts/search", {
            "page": page,
            "per_page": 100,
            "emailer_campaign_ids": [TIER1_CAMPAIGN_ID],
        })
        if not result or not result.get("contacts"):
            break
        for c in result["contacts"]:
            email = c.get("email", "").lower().strip()
            if email:
                tier1_emails.add(email)
                api_count += 1
        total_pages = result.get("pagination", {}).get("total_pages", 1)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.5)
    dedup_sources.append(f"Apollo Tier 1 campaign API: {api_count} contacts")

    print(f"  Tier 1 dedup set: {len(tier1_emails)} unique emails")
    print(f"  Sources: {'; '.join(dedup_sources)}")
    return tier1_emails


def deduplicate(contacts, tier1_emails):
    """Remove contacts that overlap with Tier 1."""
    clean = []
    removed = []
    for c in contacts:
        if c["email"] in tier1_emails:
            removed.append({
                "name": c["name"],
                "email": c["email"],
                "organization": c["organization"],
                "reason": "Duplicate: already in Tier 1 Apollo campaign",
            })
        else:
            clean.append(c)
    return clean, removed


# --- Step 3: Resolve Apollo contact IDs ---

def build_email_to_id_map():
    """Page through all Apollo contacts and build {email: id} lookup."""
    email_map = {}
    page = 1
    total = 0

    print("  Fetching all Apollo contacts for ID resolution...")
    while True:
        result = apollo_post("contacts/search", {
            "page": page,
            "per_page": 100,
        })
        if not result:
            break

        contacts = result.get("contacts", [])
        if not contacts:
            break

        for c in contacts:
            email = (c.get("email") or "").lower().strip()
            if email:
                email_map[email] = c["id"]
        total += len(contacts)

        pagination = result.get("pagination", {})
        total_pages = pagination.get("total_pages", 1)
        total_entries = pagination.get("total_entries", 0)

        if page == 1:
            print(f"  Total Apollo contacts: {total_entries} ({total_pages} pages)")

        if page % 5 == 0:
            print(f"  Page {page}/{total_pages} ({total} contacts fetched)...")

        if page >= total_pages:
            break
        page += 1
        time.sleep(0.3)  # Rate limiting

    print(f"  Built email-to-ID map: {len(email_map)} entries")
    return email_map


def resolve_ids(contacts, email_map):
    """Match Tier 2 contacts to Apollo IDs."""
    resolved = []
    unresolved = []
    for c in contacts:
        apollo_id = email_map.get(c["email"])
        if apollo_id:
            c["apollo_id"] = apollo_id
            resolved.append(c)
        else:
            unresolved.append({
                "name": c["name"],
                "email": c["email"],
                "organization": c["organization"],
                "reason": "No matching Apollo contact ID found",
            })
    return resolved, unresolved


# --- Step 4: Firm-distributed round-robin split ---

def split_contacts(contacts):
    """
    Split contacts across 3 accounts using firm-distributed round-robin.
    Groups by organization, then round-robins each org's contacts across accounts.
    """
    # Group by normalized organization name
    org_groups = defaultdict(list)
    for c in contacts:
        org_key = (c.get("organization") or "unknown").lower().strip()
        org_groups[org_key].append(c)

    # Sort orgs by number of contacts (largest first for better distribution)
    sorted_orgs = sorted(org_groups.items(), key=lambda x: -len(x[1]))

    # Initialize buckets (one per account)
    num_buckets = len(ACCOUNTS)
    splits = [[] for _ in range(num_buckets)]
    # Track bucket sizes for load balancing
    sizes = [0] * num_buckets

    for org_name, org_contacts in sorted_orgs:
        # Sort contacts within org by score descending
        org_contacts.sort(key=lambda c: -c.get("score", 0))

        # Assign contacts round-robin, starting with the smallest bucket
        for i, contact in enumerate(org_contacts):
            # Find the bucket with the fewest contacts
            target = sizes.index(min(sizes))
            # For round-robin within the org, offset by index
            bucket_idx = (target + i) % num_buckets
            splits[bucket_idx].append(contact)
            sizes[bucket_idx] += 1

    return splits


def verify_split(splits, contacts):
    """Verify the split is balanced and firm-distributed."""
    total = sum(len(s) for s in splits)
    assert total == len(contacts), f"Split lost contacts: {total} vs {len(contacts)}"

    # Check balance
    sizes = [len(s) for s in splits]
    max_diff = max(sizes) - min(sizes)

    # Check firm distribution
    firm_collisions = 0
    org_distribution = defaultdict(lambda: defaultdict(int))
    for idx, split in enumerate(splits):
        for c in split:
            org_key = (c.get("organization") or "unknown").lower().strip()
            org_distribution[org_key][idx] += 1

    # Flag orgs where all contacts went to one bucket
    for org, buckets in org_distribution.items():
        total_for_org = sum(buckets.values())
        if total_for_org > 1 and len(buckets) == 1:
            firm_collisions += 1

    return {
        "total": total,
        "sizes": sizes,
        "max_imbalance": max_diff,
        "firm_collisions": firm_collisions,
        "org_count": len(org_distribution),
    }


# --- Main ---

def main():
    print("=" * 60)
    print("  TIER 2 CAMPAIGN PREPARATION")
    print("=" * 60)

    # Step 1: Parse Tier 2 markdown
    print("\n[1/4] Parsing Tier 2 contacts...")
    contacts = parse_tier2_markdown(TIER2_MD)
    print(f"  Parsed: {len(contacts)} contacts from warm-contacts.md")

    # Score distribution
    score_dist = defaultdict(int)
    for c in contacts:
        score_dist[c["score"]] += 1
    print("  Score distribution:")
    for score in sorted(score_dist.keys(), reverse=True):
        print(f"    Score {score}: {score_dist[score]} contacts")

    # Step 2: Deduplicate against Tier 1
    print("\n[2/4] Deduplicating against Tier 1 campaign...")
    tier1_emails = get_tier1_emails()
    clean_contacts, dedup_removed = deduplicate(contacts, tier1_emails)
    print(f"  Removed: {len(dedup_removed)} duplicates")
    for r in dedup_removed:
        print(f"    - {r['name']} ({r['email']}) @ {r['organization']}")
    print(f"  Remaining: {len(clean_contacts)} contacts")

    # Step 3: Resolve Apollo contact IDs
    print("\n[3/4] Resolving Apollo contact IDs...")
    email_map = build_email_to_id_map()
    resolved, id_unresolved = resolve_ids(clean_contacts, email_map)
    print(f"  Resolved: {len(resolved)} contacts with Apollo IDs")
    if id_unresolved:
        print(f"  Unresolved: {len(id_unresolved)} contacts (no Apollo ID)")
        for u in id_unresolved[:10]:
            print(f"    - {u['name']} ({u['email']})")
        if len(id_unresolved) > 10:
            print(f"    ... and {len(id_unresolved) - 10} more")

    # Step 4: Split across 3 accounts
    print("\n[4/4] Splitting contacts across 3 accounts...")
    splits = split_contacts(resolved)
    stats = verify_split(splits, resolved)

    print(f"  Split results:")
    for idx, account in enumerate(ACCOUNTS):
        split = splits[idx]
        split_scores = defaultdict(int)
        for c in split:
            split_scores[c["score"]] += 1
        score_str = ", ".join(f"{s}:{n}" for s, n in sorted(split_scores.items(), reverse=True))
        print(f"    Campaign {account['label']} ({account['email']}): {len(split)} contacts [{score_str}]")

    print(f"  Max imbalance: {stats['max_imbalance']} contacts")
    print(f"  Firm collisions (all contacts at one sender): {stats['firm_collisions']}")
    print(f"  Organizations represented: {stats['org_count']}")

    # --- Write outputs ---
    print("\nWriting output files...")

    # All Tier 2 contact IDs
    contact_ids_out = [
        {"id": c["apollo_id"], "name": c["name"], "email": c["email"],
         "org": c["organization"], "score": c["score"]}
        for c in resolved
    ]
    with open(os.path.join(OUTPUT_DIR, "contact-ids.json"), "w") as f:
        json.dump(contact_ids_out, f, indent=2)
    print(f"  Wrote contact-ids.json ({len(contact_ids_out)} contacts)")

    # Campaign splits
    for idx, account in enumerate(ACCOUNTS):
        split_out = [
            {"id": c["apollo_id"], "name": c["name"], "email": c["email"],
             "org": c["organization"], "title": c["title"], "location": c.get("location", ""),
             "score": c["score"]}
            for c in splits[idx]
        ]
        with open(os.path.join(OUTPUT_DIR, account["file"]), "w") as f:
            json.dump(split_out, f, indent=2)
        print(f"  Wrote {account['file']} ({len(split_out)} contacts for {account['email']})")

    # Dedup report
    dedup_report = {
        "tier1_duplicates_removed": dedup_removed,
        "id_unresolved": id_unresolved,
        "total_parsed": len(contacts),
        "total_after_dedup": len(clean_contacts),
        "total_resolved": len(resolved),
        "total_unresolved": len(id_unresolved),
        "split_stats": stats,
    }
    with open(os.path.join(OUTPUT_DIR, "dedup-report.json"), "w") as f:
        json.dump(dedup_report, f, indent=2)
    print(f"  Wrote dedup-report.json")

    # --- Summary ---
    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Total Tier 2 contacts:   {len(contacts)}")
    print(f"  Removed (Tier 1 dedup):  {len(dedup_removed)}")
    print(f"  Removed (no Apollo ID):  {len(id_unresolved)}")
    print(f"  Ready for campaigns:     {len(resolved)}")
    for idx, account in enumerate(ACCOUNTS):
        print(f"  Campaign {account['label']} ({account['email']:<30}): {len(splits[idx])}")
    print("=" * 60)
    print("\nNext step: Run create-tier2-campaigns.py to create Apollo campaigns")


if __name__ == "__main__":
    main()
