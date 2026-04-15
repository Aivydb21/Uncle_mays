#!/usr/bin/env python3
"""
Tier 2 Campaign Creation Script
Creates 3 Apollo campaigns (one per sender account), adds email steps
with the v2-tier2 brand-voice sequence, and loads contacts from split files.

Usage:
  python3 create-tier2-campaigns.py           # Dry run (shows what would happen)
  python3 create-tier2-campaigns.py --execute  # Actually create campaigns

Pre-requisites:
  1. OAuth re-authenticated for denise@, rosalind@, invest@ in Apollo
  2. prepare-tier2-campaigns.py has been run (split files exist)
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

# --- Config ---
CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, "..")
SPLIT_DIR = os.path.join(BASE_DIR, "pipeline", "tier-2")
OUTPUT_FILE = os.path.join(BASE_DIR, "pipeline", "tier-2", "campaign-ids.json")

DRY_RUN = "--execute" not in sys.argv

# --- Campaign definitions ---
CAMPAIGNS = [
    {
        "name": "Tier 2A - Warm Investors (Denise)",
        "sender_email": "denise@unclemays.com",
        "split_file": "campaign-split-a.json",
    },
    {
        "name": "Tier 2B - Warm Investors (Rosalind)",
        "sender_email": "rosalind@unclemays.com",
        "split_file": "campaign-split-b.json",
    },
    {
        "name": "Tier 2C - Warm Investors (Invest)",
        "sender_email": "invest@unclemays.com",
        "split_file": "campaign-split-c.json",
    },
    {
        "name": "Tier 2D - Warm Investors (TimJ)",
        "sender_email": "timj@unclemays.com",
        "split_file": "campaign-split-d.json",
    },
]

# Email sequence: v2-tier2 brand voice
# wait_time is relative to previous step (in days)
EMAIL_STEPS = [
    {
        "position": 1,
        "wait_time": 0,
        "subject": "building grocery infrastructure for Black communities",
        "body": (
            "Hi {{first_name}},\n\n"
            "Uncle May's Produce is building the first data and distribution platform "
            "for Black food consumption in the U.S. Our founder, Anthony Ivy (Chicago Booth "
            "MBA, private equity and M&A background), identified a structural gap: Black "
            "Americans spend over $100B annually on groceries, but there's no infrastructure "
            "connecting consumers, farmers, and brands in this market. No system of record. "
            "No centralized demand data. No distribution network.\n\n"
            "We're building that infrastructure, starting with retail stores that capture "
            "real-time demand signals, then layering on vendor distribution and proprietary "
            "food data. Retail is the wedge, not the end game. Our Chicago flagship in Hyde "
            "Park is ready to launch: SBA loan secured, location LOI signed, and a GM with "
            "two prior grocery exits is already on board.\n\n"
            "We're raising $400K to $750K to close the capital stack and open the doors. "
            "A short teaser is attached if you'd like to take a look. Worth a conversation?\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO\n"
            "(312) 972-2595 | unclemays.com"
        ),
    },
    {
        "position": 2,
        "wait_time": 5,
        "subject": "quick update, Uncle May's progress",
        "body": (
            "Hi {{first_name}},\n\n"
            "Following up on our note about Uncle May's. Wanted to share where things stand, "
            "because this isn't a concept. It's activated.\n\n"
            "What's already secured:\n"
            "- SBA 7(a) loan conditionally approved ($2M via Busey Bank)\n"
            "- Flagship LOI signed, 10,000 sq ft in Hyde Park, Chicago\n"
            "- General Manager hired, Matt Weschler, started and exited two Chicago grocery stores\n"
            "- Store architect and designer engaged, Civic Projects and Food Market Designs\n"
            "- 97% intent-to-shop from 100+ surveyed Black consumers in our target demographic\n\n"
            "The $400K equity minimum triggers the full $2.5M capital stack. "
            "This isn't speculative capital. It's catalytic.\n\n"
            "Happy to share the deck or model if this is relevant to your thesis.\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO"
        ),
    },
    {
        "position": 3,
        "wait_time": 7,
        "subject": "the data layer no one has built",
        "body": (
            "Hi {{first_name}},\n\n"
            "One thing that comes up often with investors: Uncle May's looks like a grocery "
            "store, but the business model is infrastructure. Every transaction generates "
            "proprietary data on Black food consumption. SKU-level demand, pricing elasticity, "
            "vendor performance, purchasing behavior by demographic and geography. No one else "
            "captures this because no one else owns both the consumer interface and the supplier "
            "network for this market.\n\n"
            "That data compounds with every store. More locations means better demand forecasting, "
            "better procurement, better margins, and a moat that gets wider over time. The margins "
            "tell the story: retail grocery at 20 to 30%, vendor distribution at 30 to 45%, data "
            "and analytics at 60 to 70%, and platform services at 70 to 80%. We start as a retailer. "
            "We scale as a platform.\n\n"
            "Our unit model projects $6.3M Year 1 revenue, 35% gross margin, and a 33% five-year "
            "IRR on the flagship alone. The 82-store national rollout targets $625M by Year 10. "
            "If this category interests you, we'd welcome 20 minutes to walk through the model.\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO"
        ),
    },
    {
        "position": 4,
        "wait_time": 8,
        "subject": "closing the round, Uncle May's",
        "body": (
            "Hi {{first_name}},\n\n"
            "Last note from us on this. We're closing the seed round at $400K to $750K on a "
            "$5M cap SAFE with a 20% discount. $25K minimum check. The equity tranche triggers "
            "the SBA facility and puts us into build-out immediately.\n\n"
            "The leadership team is in place. Anthony Ivy (CEO, Chicago Booth MBA, PE/M&A) is "
            "joined by a COO from Amazon ($3B retail P&L), a CFO from Bank of America investment "
            "banking, and a CMO who led global marketing at Unilever and P&G. Early investors get "
            "in before the data network scales, the most defensible and highest-upside phase of "
            "the entire arc.\n\n"
            "If this doesn't fit your thesis, no worries at all. But if it does, we'd rather "
            "you hear it from us than read about it later.\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO\n"
            "(312) 972-2595 | unclemays.com"
        ),
    },
]

# Contact batch size for adding to campaigns
CONTACT_BATCH_SIZE = 50


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
                print(f"  API error: {e}", file=sys.stderr)
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
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1} after {wait}s (HTTP {e.code}: {body[:200]})", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  API error (HTTP {e.code}): {body[:500]}", file=sys.stderr)
                return None
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1} after {wait}s ({e})", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  API error: {e}", file=sys.stderr)
                return None


def apollo_put(endpoint, payload, retries=3):
    """PUT request to Apollo API."""
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
            method="PUT",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1} after {wait}s (HTTP {e.code}: {body[:200]})", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  API error (HTTP {e.code}): {body[:500]}", file=sys.stderr)
                return None
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1} after {wait}s ({e})", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"  API error: {e}", file=sys.stderr)
                return None


# --- Step 1: Get email account IDs ---

def get_email_account_ids(target_emails):
    """Fetch email account IDs from Apollo for the specified email addresses."""
    print("  Fetching email accounts from Apollo...")
    result = apollo_get("email_accounts")
    if not result:
        print("  ERROR: Could not fetch email accounts", file=sys.stderr)
        return None

    accounts = result.get("email_accounts", [])
    account_map = {}
    for acct in accounts:
        email = acct.get("email", "").lower()
        if email in target_emails:
            account_map[email] = {
                "id": acct["id"],
                "email": email,
                "health": acct.get("deliverability_score", {}).get("domain_health_score", 0),
                "deliverability": acct.get("deliverability_score", {}).get("deliverability_score", 0),
                "warmup_status": acct.get("mailwarming_status", "off"),
                "daily_limit": acct.get("email_daily_threshold", 0),
            }

    return account_map


# --- Step 2: Create campaign ---

def create_campaign(name, email_account_id, max_per_day=10):
    """Create a new Apollo emailer campaign (inactive)."""
    payload = {
        "name": name,
        "permissions": "team_can_use",
        "email_account_ids": [email_account_id],
        "max_emails_per_day": max_per_day,
        "active": False,
    }
    result = apollo_post("emailer_campaigns", payload)
    if result and result.get("emailer_campaign"):
        campaign = result["emailer_campaign"]
        return campaign.get("id")
    return None


# --- Step 3: Add email steps ---

def add_email_step(campaign_id, step):
    """Add an email step to a campaign.

    Apollo requires wait_mode field alongside wait_time.
    Per operational lesson #4: step creation may not persist body.
    We try including body in the initial creation, then update template separately.
    """
    payload = {
        "emailer_campaign_id": campaign_id,
        "position": step["position"],
        "wait_time": step["wait_time"],
        "wait_mode": "day",
        "type": "auto_email",
        "subject": step["subject"],
        "body": step["body"],
    }
    result = apollo_post("emailer_steps", payload)
    if result:
        step_data = result.get("emailer_step", result)
        step_id = step_data.get("id")
        template_id = step_data.get("emailer_template_id") or step_data.get("emailer_template", {}).get("id")
        return {"step_id": step_id, "template_id": template_id}
    return None


def update_step_template(template_id, step):
    """Update the email template for a step (fallback if body didn't persist)."""
    payload = {
        "subject": step["subject"],
        "body": step["body"],
    }
    result = apollo_put(f"emailer_templates/{template_id}", payload)
    return result is not None


# --- Step 4: Add contacts ---

def add_contacts_to_campaign(campaign_id, contact_ids, email_account_id):
    """Add contacts to a campaign in batches.

    Apollo's add_contact_ids endpoint uses query parameters, not JSON body.
    contact_ids[] are passed as repeated query params.
    """
    total_added = 0
    for i in range(0, len(contact_ids), CONTACT_BATCH_SIZE):
        batch = contact_ids[i:i + CONTACT_BATCH_SIZE]

        # Build query string with repeated contact_ids[] params
        params = [
            ("emailer_campaign_id", campaign_id),
            ("send_email_from_email_account_id", email_account_id),
            ("sequence_active_in_other_campaigns", "true"),
        ]
        for cid in batch:
            params.append(("contact_ids[]", cid))

        query_string = urllib.parse.urlencode(params)
        url = f"{BASE_URL}/emailer_campaigns/{campaign_id}/add_contact_ids?{query_string}"

        success = False
        for attempt in range(3):
            req = urllib.request.Request(
                url,
                headers={
                    "X-Api-Key": API_KEY,
                    "User-Agent": "curl/8.0",
                    "Content-Type": "application/json",
                },
                method="POST",
                data=b"{}",
            )
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    resp.read()
                    success = True
                    break
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", errors="replace")
                if attempt < 2:
                    wait = 2 ** (attempt + 1)
                    print(f"    Retry {attempt+1} after {wait}s (HTTP {e.code}: {body[:200]})", file=sys.stderr)
                    time.sleep(wait)
                else:
                    print(f"    ERROR batch at {i}: HTTP {e.code}: {body[:200]}", file=sys.stderr)
            except Exception as e:
                if attempt < 2:
                    time.sleep(2 ** (attempt + 1))
                else:
                    print(f"    ERROR batch at {i}: {e}", file=sys.stderr)

        if success:
            total_added += len(batch)
            if total_added % 100 == 0 or total_added == len(contact_ids):
                print(f"    Added {total_added}/{len(contact_ids)} contacts...")
        time.sleep(0.5)  # Rate limiting
    return total_added


# --- Main ---

def main():
    mode = "DRY RUN" if DRY_RUN else "LIVE EXECUTION"
    print("=" * 60)
    print(f"  TIER 2 CAMPAIGN CREATION ({mode})")
    print("=" * 60)

    if DRY_RUN:
        print("\n  This is a dry run. No campaigns will be created.")
        print("  Run with --execute to create campaigns.\n")

    # Step 1: Get email account IDs
    print("\n[1/4] Fetching email account IDs...")
    target_emails = {c["sender_email"] for c in CAMPAIGNS}
    account_map = get_email_account_ids(target_emails)
    if not account_map:
        print("  FATAL: Could not fetch email accounts. Aborting.", file=sys.stderr)
        sys.exit(1)

    all_found = True
    for campaign in CAMPAIGNS:
        email = campaign["sender_email"]
        if email in account_map:
            acct = account_map[email]
            print(f"  {email}: ID={acct['id']}, health={acct['health']}, deliver={acct['deliverability']}, warmup={acct['warmup_status']}")
        else:
            print(f"  {email}: NOT FOUND in Apollo. OAuth may need re-authentication.")
            all_found = False

    if not all_found:
        print("\n  WARNING: Not all accounts found. OAuth re-auth required before proceeding.")
        if not DRY_RUN:
            print("  Aborting. Re-auth the missing accounts, then re-run.", file=sys.stderr)
            sys.exit(1)

    # Step 2: Load contact splits
    print("\n[2/4] Loading contact splits...")
    campaign_contacts = {}
    for campaign in CAMPAIGNS:
        split_path = os.path.join(SPLIT_DIR, campaign["split_file"])
        if not os.path.exists(split_path):
            print(f"  ERROR: {campaign['split_file']} not found. Run prepare-tier2-campaigns.py first.", file=sys.stderr)
            sys.exit(1)
        with open(split_path) as f:
            contacts = json.load(f)
        campaign_contacts[campaign["name"]] = contacts
        print(f"  {campaign['name']}: {len(contacts)} contacts loaded from {campaign['split_file']}")

    # Step 3: Create campaigns
    print(f"\n[3/4] Creating campaigns and email steps...")
    campaign_results = []

    for campaign in CAMPAIGNS:
        email = campaign["sender_email"]
        name = campaign["name"]
        contacts = campaign_contacts[name]

        print(f"\n  --- {name} ---")
        print(f"  Sender: {email}")
        print(f"  Contacts: {len(contacts)}")
        print(f"  Daily limit: 10")
        print(f"  Sequence: 4 emails over 20 days (v2-tier2 brand voice)")

        if DRY_RUN:
            print(f"  [DRY RUN] Would create campaign, 4 steps, add {len(contacts)} contacts")
            campaign_results.append({
                "name": name,
                "sender": email,
                "contacts": len(contacts),
                "campaign_id": "DRY_RUN",
                "status": "dry_run",
            })
            continue

        # Create the campaign
        acct = account_map.get(email)
        if not acct:
            print(f"  SKIP: Account {email} not available")
            continue

        print(f"  Creating campaign...")
        campaign_id = create_campaign(name, acct["id"], max_per_day=10)
        if not campaign_id:
            print(f"  ERROR: Failed to create campaign for {email}", file=sys.stderr)
            continue
        print(f"  Campaign created: {campaign_id}")

        # Add email steps
        print(f"  Adding 4 email steps...")
        step_results = []
        for step in EMAIL_STEPS:
            step_result = add_email_step(campaign_id, step)
            if step_result:
                print(f"    Step {step['position']}: created (ID: {step_result['step_id']})")
                # Try to update template if template_id is available
                if step_result.get("template_id"):
                    update_step_template(step_result["template_id"], step)
                    print(f"    Step {step['position']}: template updated")
                step_results.append(step_result)
            else:
                print(f"    Step {step['position']}: FAILED", file=sys.stderr)
            time.sleep(0.3)

        # Add contacts
        contact_ids = [c["id"] for c in contacts]
        print(f"  Adding {len(contact_ids)} contacts...")
        added = add_contacts_to_campaign(campaign_id, contact_ids, acct["id"])
        print(f"  Added: {added}/{len(contact_ids)} contacts")

        campaign_results.append({
            "name": name,
            "sender": email,
            "contacts": len(contacts),
            "contacts_added": added,
            "campaign_id": campaign_id,
            "steps_created": len(step_results),
            "status": "created_inactive",
        })

    # Step 4: Save results
    print(f"\n[4/4] Saving campaign IDs...")
    if not DRY_RUN:
        with open(OUTPUT_FILE, "w") as f:
            json.dump(campaign_results, f, indent=2)
        print(f"  Saved to: {OUTPUT_FILE}")

    # Summary
    print("\n" + "=" * 60)
    print(f"  SUMMARY ({mode})")
    print("=" * 60)
    for r in campaign_results:
        status = r.get("status", "unknown")
        cid = r.get("campaign_id", "N/A")
        print(f"  {r['name']}")
        print(f"    Sender:   {r['sender']}")
        print(f"    Contacts: {r['contacts']}")
        print(f"    Campaign: {cid}")
        print(f"    Status:   {status}")

    if DRY_RUN:
        print("\n  This was a dry run. To create campaigns, run:")
        print("    python3 create-tier2-campaigns.py --execute")
    else:
        print("\n  Campaigns created INACTIVE. To activate:")
        print("  1. Verify in Apollo UI that campaigns have correct steps and contacts")
        print("  2. Activate one campaign at a time via Apollo UI or API")
        print("  3. Run daily-report.sh to monitor performance")

    print("=" * 60)


if __name__ == "__main__":
    main()
