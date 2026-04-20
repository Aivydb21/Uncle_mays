#!/usr/bin/env python3
"""
Create CRE & HNW Apollo campaign.
- Creates contacts in Apollo (or finds existing ones)
- Creates campaign with v3-cre sequence
- Adds contacts to campaign
- Leaves campaign INACTIVE for review

Usage:
  python3 create-cre-campaign.py           # Dry run
  python3 create-cre-campaign.py --execute # Live
"""

import json, os, sys, time, urllib.request, urllib.error, urllib.parse

CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]
DRY_RUN = "--execute" not in sys.argv

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUTPUT_DIR = os.path.join(BASE_DIR, "pipeline", "cre-hnw")

CAMPAIGN_NAME = "CRE & HNW - Black Professionals"
SENDER_EMAIL = "investmentrelations@unclemays.com"
MAX_PER_DAY = 10

# All 32 contacts with best available email info
# email_status: "verified" = Apollo confirmed, "guessed" = pattern-based, "none" = no email
CONTACTS = [
    {"first_name": "Don", "last_name": "Peebles", "email": "donpeebles@peeblescorp.com", "email_status": "verified", "org": "The Peebles Corporation", "title": "Owner & Founder", "domain": "peeblescorp.com"},
    {"first_name": "Quintin", "last_name": "Primo", "email": "qprimo@capri.global", "email_status": "verified", "org": "Capri Investment Group", "title": "Founder & Executive Chairman", "domain": "capri.global"},
    {"first_name": "Leon", "last_name": "Walker", "email": "lwalker@dl3realty.com", "email_status": "verified", "org": "DL3 Realty", "title": "Managing Partner", "domain": "dl3realty.com"},
    {"first_name": "Jair", "last_name": "Lynch", "email": "jlynch@cubesmart.com", "email_status": "verified", "org": "Jair Lynch Real Estate Partners", "title": "President & CEO", "domain": "jairlynch.com"},
    {"first_name": "Robin", "last_name": "Zeigler", "email": None, "email_status": "none", "org": "MURAL Real Estate Partners", "title": "Founder & CEO", "domain": "muralrealestate.com"},
    {"first_name": "Amin", "last_name": "Irving", "email": None, "email_status": "none", "org": "Ginosko Development Company", "title": "Founder, President & CEO", "domain": "ginosko.com"},
    {"first_name": "Greg", "last_name": "Reaves", "email": None, "email_status": "none", "org": "Mosaic Development Partners", "title": "Founder & CEO", "domain": "mosaicdp.com"},
    {"first_name": "Leslie", "last_name": "Smallwood-Lewis", "email": None, "email_status": "none", "org": "Mosaic Development Partners", "title": "Founder & COO", "domain": "mosaicdp.com"},
    {"first_name": "Bo", "last_name": "Menkiti", "email": None, "email_status": "none", "org": "The Menkiti Group", "title": "Founder & CEO", "domain": "menkitigroup.com"},
    {"first_name": "Christopher", "last_name": "Bramwell", "email": None, "email_status": "none", "org": "CB Emmanuel Realty", "title": "Co-Founder"},
    {"first_name": "Victor", "last_name": "MacFarlane", "email": None, "email_status": "none", "org": "MacFarlane Partners", "title": "Chairman & CEO"},
    {"first_name": "Tammy", "last_name": "Jones", "email": None, "email_status": "none", "org": "Basis Investment Group", "title": "Founder & CEO"},
    {"first_name": "Daryl", "last_name": "Carter", "email": None, "email_status": "none", "org": "Avanath Capital", "title": "Founder & CEO", "domain": "avanath.com"},
    {"first_name": "Devon", "last_name": "Prioleau", "email": None, "email_status": "none", "org": "PDG", "title": "Managing Principal"},
    {"first_name": "Kirk", "last_name": "Goodrich", "email": None, "email_status": "none", "org": "Monadnock Development", "title": "President", "domain": "monadnockdev.com"},
    {"first_name": "Leonard", "last_name": "Allen-Smith", "email": None, "email_status": "none", "org": "Allen Smith Equities", "title": "Founder & CEO"},
    {"first_name": "Kimberly", "last_name": "Hardy", "email": None, "email_status": "none", "org": "McKissack & McKissack", "title": "SVP, Diversity & Compliance", "domain": "mckissack.com"},
    {"first_name": "Ashley", "last_name": "Thomas", "email": None, "email_status": "none", "org": "NAREB", "title": "President-Elect", "domain": "nareb.com"},
    {"first_name": "Emmitt", "last_name": "Smith", "email": None, "email_status": "none", "org": "Emmitt Smith Advisors", "title": "Founder"},
    {"first_name": "Kimberly", "last_name": "Dowdell", "email": None, "email_status": "none", "org": "AIA", "title": "Past President"},
    {"first_name": "John", "last_name": "Rogers", "email": None, "email_status": "none", "org": "Ariel Investments", "title": "Founder & Co-CEO", "domain": "arielinvestments.com"},
    {"first_name": "Mellody", "last_name": "Hobson", "email": None, "email_status": "none", "org": "Ariel Investments", "title": "Co-CEO & President", "domain": "arielinvestments.com"},
    {"first_name": "Jim", "last_name": "Reynolds", "email": None, "email_status": "none", "org": "Loop Capital", "title": "Founder & CEO", "domain": "loopcapital.com"},
    {"first_name": "Martin", "last_name": "Nesbitt", "email": None, "email_status": "none", "org": "Vistria Group", "title": "Co-Founder & Co-CEO", "domain": "vistria.com"},
    {"first_name": "Robert", "last_name": "Smith", "email": None, "email_status": "none", "org": "Vista Equity Partners", "title": "Founder & Chairman", "domain": "vistaequitypartners.com"},
    {"first_name": "Bernard", "last_name": "Loyd", "email": None, "email_status": "none", "org": "Mesirow", "title": "Senior MD", "domain": "mesirow.com"},
    {"first_name": "Desiree", "last_name": "Rogers", "email": None, "email_status": "none", "org": "", "title": "CEO/Entrepreneur"},
    {"first_name": "Valerie", "last_name": "Jarrett", "email": None, "email_status": "none", "org": "", "title": "Senior Advisor"},
    {"first_name": "Michael", "last_name": "Russell", "email": None, "email_status": "none", "org": "H.J. Russell & Company", "title": "CEO"},
    {"first_name": "Benathan", "last_name": "Upshaw", "email": None, "email_status": "none", "org": "CB Emmanuel Realty", "title": "Co-Founder"},
    {"first_name": "Jemal", "last_name": "King", "email": None, "email_status": "none", "org": "Model of Transformation", "title": "Founder"},
    {"first_name": "Morgan", "last_name": "Malone", "email": None, "email_status": "none", "org": "", "title": "Developer"},
]

# v3-cre email sequence
EMAIL_STEPS = [
    {
        "position": 1,
        "wait_time": 0,
        "wait_mode": "day",
        "subject": "a grocery platform launching in hyde park",
        "body": (
            "Hi {{first_name}},\n\n"
            "Uncle May's Produce is opening a 10,000 sq ft flagship grocery store in Hyde Park, Chicago. "
            "SBA loan secured, location LOI signed, architect engaged. Our founder, Anthony Ivy (Chicago "
            "Booth MBA, private equity and M&A background), is building the first data and distribution "
            "platform for Black food consumption, starting with a physical retail asset in one of Chicago's "
            "most culturally vibrant neighborhoods.\n\n"
            "This is a real commercial lease backed by real demand data: $100B+ in annual Black grocery spend, "
            "zero infrastructure connecting that market to suppliers, and 97% intent-to-shop from 100+ surveyed "
            "consumers in our target demographic. We're raising $400K to $750K to close the capital stack and "
            "break ground. A short teaser is attached if you'd like to take a look. Worth a conversation?\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO\n"
            "(312) 972-2595 | unclemays.com"
        ),
    },
    {
        "position": 2,
        "wait_time": 5,
        "wait_mode": "day",
        "subject": "the capital stack behind uncle may's",
        "body": (
            "Hi {{first_name}},\n\n"
            "Following up on Uncle May's. The capital structure is built to de-risk early investors. "
            "The $400K equity minimum triggers a conditionally approved $2M SBA 7(a) facility through "
            "Busey Bank plus $100K in tenant improvements, bringing total deployment to $2.5M. That gets "
            "us through build-out, inventory, and six months of operating reserves with no additional dilution.\n\n"
            "The unit economics are institutional grade: projected $629/sq ft in Year 1 revenue ($6.3M total), "
            "35% gross margin at stabilization, and 15.3% EBITDA margin. Our GM, Matt Weschler, has started "
            "and exited two Chicago grocery stores. He's already on board and active. Happy to share the deck "
            "or financial model if this is relevant.\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO"
        ),
    },
    {
        "position": 3,
        "wait_time": 7,
        "wait_mode": "day",
        "subject": "why this isn't just a grocery store",
        "body": (
            "Hi {{first_name}},\n\n"
            "One thing worth flagging: Uncle May's looks like a retail play, but the long-term business model "
            "is infrastructure. Every transaction generates proprietary data on Black food consumption. SKU-level "
            "demand, pricing elasticity, vendor performance, purchasing behavior by demographic and geography. "
            "No one else captures this because no one else owns both the consumer interface and the supplier "
            "network for this market.\n\n"
            "That data compounds with every store. Retail margins run 20 to 30%, but vendor distribution reaches "
            "30 to 45%, data and analytics 60 to 70%, and platform services 70 to 80%. The 82-store national "
            "rollout targets $625M revenue by Year 10. We start as a retailer, we scale as a platform. If this "
            "category interests you, we'd welcome 20 minutes to walk through the model.\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO"
        ),
    },
    {
        "position": 4,
        "wait_time": 8,
        "wait_mode": "day",
        "subject": "closing the round, uncle may's",
        "body": (
            "Hi {{first_name}},\n\n"
            "Last note from us. We're closing the seed round at $400K to $750K on a $5M cap SAFE with a "
            "20% discount. $25K minimum check. The equity tranche triggers the SBA facility and puts us into "
            "build-out immediately.\n\n"
            "The leadership team backing this: Anthony Ivy (CEO, Chicago Booth, PE/M&A) is joined by a COO "
            "who managed a $3B retail P&L at Amazon, a CFO from Bank of America investment banking (also "
            "Chicago Booth), and a CMO who led global marketing at Unilever and P&G. Early investors get in "
            "before the data network scales. If this doesn't fit, no worries at all. But if it does, we'd "
            "rather you hear it from us than read about it later.\n\n"
            "Uncle May's Produce\n"
            "Anthony Ivy, Founder & CEO\n"
            "(312) 972-2595 | unclemays.com"
        ),
    },
]


# --- Apollo API helpers ---

def apollo_post(endpoint, payload, retries=3):
    data = json.dumps(payload).encode("utf-8")
    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/{endpoint}", data=data,
            headers={"Content-Type": "application/json", "X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1}/{retries} after {wait}s (HTTP {e.code}: {body})")
                time.sleep(wait)
            else:
                print(f"  API error (HTTP {e.code}): {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  API error: {e}")
                return None


def apollo_put(endpoint, payload, retries=3):
    data = json.dumps(payload).encode("utf-8")
    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/{endpoint}", data=data,
            headers={"Content-Type": "application/json", "X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
            method="PUT",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  API error (HTTP {e.code}): {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  API error: {e}")
                return None


def apollo_get(endpoint, retries=3):
    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/{endpoint}",
            headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  API error: {e}")
                return None


def main():
    mode = "DRY RUN" if DRY_RUN else "LIVE"
    print("=" * 70)
    print(f"  CRE & HNW CAMPAIGN CREATION ({mode})")
    print("=" * 70)

    if DRY_RUN:
        print("\n  Dry run. Run with --execute to create.\n")

    # --- Step 1: Get sender account ID ---
    print("\n[1/5] Getting sender email account...")
    accounts = apollo_get("email_accounts")
    sender_id = None
    if accounts:
        for a in accounts.get("email_accounts", []):
            if a.get("email", "").lower() == SENDER_EMAIL:
                sender_id = a["id"]
                print(f"  {SENDER_EMAIL}: ID={sender_id}, active={a.get('active')}")
                break
    if not sender_id:
        print(f"  ERROR: {SENDER_EMAIL} not found in Apollo")
        sys.exit(1)

    # --- Step 2: Create contacts in Apollo ---
    print(f"\n[2/5] Creating {len(CONTACTS)} contacts in Apollo...")
    contacts_with_email = []
    contacts_no_email = []

    for c in CONTACTS:
        name = f"{c['first_name']} {c['last_name']}"
        email = c.get("email")

        if DRY_RUN:
            tag = "EMAIL" if email else "NO-EM"
            print(f"  [{tag:5s}] {name:30s} | {email or 'no email':35s} | {c.get('org','')[:25]}")
            if email:
                contacts_with_email.append({"name": name, "email": email, "id": "DRY_RUN"})
            else:
                contacts_no_email.append({"name": name, "org": c.get("org", "")})
            continue

        # Create contact in Apollo
        payload = {
            "first_name": c["first_name"],
            "last_name": c["last_name"],
            "title": c.get("title", ""),
            "organization_name": c.get("org", ""),
        }
        if email:
            payload["email"] = email

        result = apollo_post("contacts", payload)
        if result:
            contact = result.get("contact", {})
            cid = contact.get("id")
            returned_email = contact.get("email") or email
            if cid and returned_email:
                print(f"  [OK   ] {name:30s} | {returned_email:35s} | ID: {cid}")
                contacts_with_email.append({
                    "name": name, "email": returned_email, "id": cid,
                    "email_status": c.get("email_status", "unknown"),
                    "org": c.get("org", ""), "title": c.get("title", ""),
                })
            elif cid:
                print(f"  [NO-EM] {name:30s} | no email, ID: {cid}")
                contacts_no_email.append({"name": name, "id": cid, "org": c.get("org", "")})
            else:
                print(f"  [FAIL ] {name:30s} | no contact ID returned")
        else:
            # Check if contact already exists (duplicate)
            print(f"  [SKIP ] {name:30s} | creation failed (may already exist)")
            contacts_no_email.append({"name": name, "org": c.get("org", ""), "error": "creation_failed"})

        time.sleep(0.5)

    print(f"\n  Contacts with email: {len(contacts_with_email)}")
    print(f"  Contacts without email: {len(contacts_no_email)}")

    # --- Step 3: Create campaign ---
    print(f"\n[3/5] Creating campaign '{CAMPAIGN_NAME}'...")
    campaign_id = None

    if DRY_RUN:
        print(f"  [DRY RUN] Would create campaign with sender {SENDER_EMAIL}")
        campaign_id = "DRY_RUN"
    else:
        result = apollo_post("emailer_campaigns", {
            "name": CAMPAIGN_NAME,
            "permissions": "team_can_use",
            "email_account_ids": [sender_id],
            "max_emails_per_day": MAX_PER_DAY,
            "active": False,
            "mark_finished_if_reply": True,
            "mark_paused_if_ooo": True,
        })
        if result and result.get("emailer_campaign"):
            campaign_id = result["emailer_campaign"]["id"]
            print(f"  Campaign created: {campaign_id}")
        else:
            print("  ERROR: Failed to create campaign")
            sys.exit(1)

    # --- Step 4: Add email steps ---
    print(f"\n[4/5] Adding {len(EMAIL_STEPS)} email steps...")
    for step in EMAIL_STEPS:
        if DRY_RUN:
            print(f"  Step {step['position']}: \"{step['subject']}\" (wait {step['wait_time']}d)")
            continue

        result = apollo_post("emailer_steps", {
            "emailer_campaign_id": campaign_id,
            "position": step["position"],
            "wait_time": step["wait_time"],
            "wait_mode": step["wait_mode"],
            "type": "auto_email",
            "subject": step["subject"],
            "body": step["body"],
        })
        if result:
            step_data = result.get("emailer_step", result)
            step_id = step_data.get("id")
            template_id = step_data.get("emailer_template_id") or step_data.get("emailer_template", {}).get("id")
            print(f"  Step {step['position']}: created (ID: {step_id})")

            # Update template to ensure body persists
            if template_id:
                apollo_put(f"emailer_templates/{template_id}", {
                    "subject": step["subject"],
                    "body": step["body"],
                })
                print(f"    Template updated: {template_id}")
        else:
            print(f"  Step {step['position']}: FAILED")
        time.sleep(0.5)

    # --- Step 5: Add contacts to campaign ---
    emailable = [c for c in contacts_with_email if c.get("id") and c["id"] != "DRY_RUN"]
    print(f"\n[5/5] Adding {len(emailable)} contacts to campaign...")

    if DRY_RUN:
        print(f"  [DRY RUN] Would add {len(contacts_with_email)} contacts with email")
    elif emailable:
        contact_ids = [c["id"] for c in emailable]
        # Build query string
        params = [
            ("emailer_campaign_id", campaign_id),
            ("send_email_from_email_account_id", sender_id),
        ]
        for cid in contact_ids:
            params.append(("contact_ids[]", cid))

        query_string = urllib.parse.urlencode(params)
        url = f"{BASE_URL}/emailer_campaigns/{campaign_id}/add_contact_ids?{query_string}"

        req = urllib.request.Request(
            url,
            headers={"X-Api-Key": API_KEY, "Content-Type": "application/json", "User-Agent": "curl/8.0"},
            method="POST",
            data=b"{}",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp.read()
                print(f"  Added {len(contact_ids)} contacts to campaign")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:300]
            print(f"  ERROR adding contacts: HTTP {e.code}: {body}")
        except Exception as e:
            print(f"  ERROR adding contacts: {e}")
    else:
        print("  No contacts with email + ID to add")

    # --- Save results ---
    results = {
        "campaign_name": CAMPAIGN_NAME,
        "campaign_id": campaign_id,
        "sender": SENDER_EMAIL,
        "sender_account_id": sender_id,
        "contacts_with_email": contacts_with_email,
        "contacts_no_email": contacts_no_email,
        "status": "created_inactive",
    }
    out_path = os.path.join(OUTPUT_DIR, "campaign-results.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    # --- Summary ---
    print(f"\n{'=' * 70}")
    print(f"  SUMMARY ({mode})")
    print(f"{'=' * 70}")
    print(f"  Campaign: {CAMPAIGN_NAME}")
    print(f"  Campaign ID: {campaign_id}")
    print(f"  Sender: {SENDER_EMAIL}")
    print(f"  Sequence: 4 emails over 20 days (v3-cre)")
    print(f"  Max/day: {MAX_PER_DAY}")
    print(f"  Contacts with email: {len(contacts_with_email)}")
    print(f"  Contacts pending email: {len(contacts_no_email)}")
    print(f"  Results saved to: {out_path}")

    if not DRY_RUN:
        print(f"\n  Campaign created INACTIVE.")
        print(f"  Next steps:")
        print(f"  1. Review in Apollo UI")
        print(f"  2. Run enrichment when credits reset to add remaining {len(contacts_no_email)} contacts")
        print(f"  3. Activate when ready")
    else:
        print(f"\n  Run with --execute to create campaign.")

    print("=" * 70)


if __name__ == "__main__":
    main()
