#!/usr/bin/env python3
"""
Create Apollo vendor outreach campaign on anthony@unclemays.com.

- Pulls 36 target vendors by Business Name from Airtable Suppliers table.
- Creates contacts in Apollo (or finds existing ones).
- Fetches Apollo's email_status verification on each contact.
- Creates "Vendor Outreach - Wave A + E" campaign (2-touch sequence) on
  anthony@unclemays.com, INACTIVE, 15/day, stops on reply, pauses on OOO.
- Adds only verified contacts to the campaign by default. Unverified /
  catch_all / invalid are reported for manual review.
- Writes a results JSON to investor-outreach/pipeline/vendor-outreach/.
- Updates Airtable Suppliers rows with OnboardingStatus = "Form sent" for
  contacts successfully queued.

Usage:
  python3 create-vendor-outreach-campaign.py            # Dry run
  python3 create-vendor-outreach-campaign.py --execute  # Live
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


APOLLO_CONFIG = json.load(open(os.path.expanduser("~/.claude/apollo-config.json")))
AIRTABLE_CONFIG = json.load(open(os.path.expanduser("~/.claude/airtable-config.json")))

APOLLO_API_KEY = APOLLO_CONFIG["api_key"]
APOLLO_BASE_URL = APOLLO_CONFIG["base_url"]
AIRTABLE_PAT = AIRTABLE_CONFIG.get("pat") or AIRTABLE_CONFIG.get("api_key")
AIRTABLE_BASE_ID = "appm6F6H9obydzAM2"
AIRTABLE_TABLE = "Suppliers"

DRY_RUN = "--execute" not in sys.argv

CAMPAIGN_NAME = "Vendor Outreach - Wave A + E"
SENDER_EMAIL = "anthony@unclemays.com"
MAX_PER_DAY = 15

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUTPUT_DIR = os.path.join(BASE_DIR, "pipeline", "vendor-outreach")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 36 target vendors. Already-emailed (Pearson Farms, Dr. Nettles Beauty,
# Cutino Sauce Co., Bossville Farms, Eden Place Farms) excluded.
TARGET_BUSINESS_NAMES = [
    # Wave A — perishable produce (Midwest)
    "We Sow We Grow",
    "Faith Farms",
    "Renaissance Farm",
    "Jackson Family Farm",
    "New Age Provisions Farms",
    "Old City Acres",
    # Wave A — meat & seafood
    "Prairie Hills Farm",
    "Oakland Avenue Urban Farm",
    "Smith Farm and Ranch",
    "Foxfire Ranch",
    "Muhammad Family Farm",
    "Briarwood Cattle Farm",
    "Brown Bass Farm",
    "Royal Queens Farm",
    "Taylor Stevenson Ranch",
    # Wave A — pantry
    "We the People Opportunity Farm",
    "Nurturing Our Seeds",
    "Jubilee Justice",
    "Rollen's RAW Grains",
    "Joppy Mommas Farm",
    "Petit Jardin by Erica Sage",
    # Wave A — spices & condiments
    "Chauncey's",
    "Long Walk Spring Farm",
    "Iléwa Foods",
    "Igotchu Seasonings",
    "EXAU",
    "Gustus Vitae",
    # Wave E — Black-owned personal care
    "Earthly, Holistic & Organic Garden + *Thirdday Soaps Garden Wellness",
    "Zizis Bee Company",
    "Mystic Pine Farm",
    "Hidden Gems Farm",
    "AMBI Skincare",
    "Elements of Nature",
    "Hempress Farms",
    "Out the Mud Farm",
    "Perma-Pastures Farm",
]


# 2-touch sequence. Uses Apollo merge tag {{organization_name}}.
# No first-name personalization — uniform "Hello from the {org} team,"
# salutation reads naturally for B2B vendor outreach.
EMAIL_STEPS = [
    {
        "position": 1,
        "wait_time": 0,
        "wait_mode": "day",
        "subject": "Stock your products at Uncle May's, 8-minute application",
        "body": (
            "Hello from the {{organization_name}} team,\n\n"
            "I'm Anthony Ivy, founder of Uncle May's Produce. We're a "
            "Chicago-based grocery and produce platform with a Hyde Park "
            "flagship store opening this June and a daily delivery business "
            "already live. We're expanding our catalog and "
            "{{organization_name}} caught our eye as a supplier we'd want to "
            "work with.\n\n"
            "Could you fill out our 8-minute supplier application?\n\n"
            "https://unclemays.com/vendor-onboarding\n\n"
            "We use what you share to evaluate fit, plan our first order with "
            "you, and if you opt in, feature your story to our customers. No "
            "commitment on either side.\n\n"
            "Thanks,\n"
            "Anthony Ivy\n"
            "Founder, Uncle May's Produce\n"
            "anthony@unclemays.com | (312) 972-2595"
        ),
    },
    {
        "position": 2,
        "wait_time": 5,
        "wait_mode": "day",
        "subject": "Re: Stock your products at Uncle May's, 8-minute application",
        "body": (
            "Hello from the {{organization_name}} team,\n\n"
            "Quick nudge in case the first note got buried. We're actively "
            "looking for partners across produce, meat, pantry, and personal "
            "care for our Hyde Park flagship launch and Chicago delivery "
            "business.\n\n"
            "If {{organization_name}} could be a fit, the application is "
            "here: https://unclemays.com/vendor-onboarding\n\n"
            "If we're not a fit right now, no worries, just let me know and "
            "I'll move you off the list.\n\n"
            "Thanks,\n"
            "Anthony Ivy\n"
            "Founder, Uncle May's Produce\n"
            "anthony@unclemays.com | (312) 972-2595"
        ),
    },
]


# --- HTTP helpers ---

def apollo_request(method, endpoint, payload=None, params=None, retries=3):
    url = f"{APOLLO_BASE_URL}/{endpoint}"
    if params:
        url = f"{url}?{urllib.parse.urlencode(params, doseq=True)}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    if data is None and method in ("POST", "PUT"):
        data = b"{}"
    for attempt in range(retries):
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "X-Api-Key": APOLLO_API_KEY,
                "User-Agent": "curl/8.0",
            },
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:300]
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"    retry {attempt+1}/{retries} after {wait}s (HTTP {e.code}: {body[:100]})")
                time.sleep(wait)
            else:
                print(f"    ERROR HTTP {e.code}: {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"    ERROR: {e}")
                return None
    return None


def airtable_list(filter_formula=None, fields=None):
    """List Suppliers records matching the filter formula."""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{urllib.parse.quote(AIRTABLE_TABLE)}"
    params = {"pageSize": "100"}
    if filter_formula:
        params["filterByFormula"] = filter_formula
    if fields:
        # repeating ?fields[]= pattern
        out = []
        offset = None
        while True:
            q = list(params.items()) + [("fields[]", f) for f in fields]
            if offset:
                q.append(("offset", offset))
            full_url = f"{url}?{urllib.parse.urlencode(q)}"
            req = urllib.request.Request(
                full_url, headers={"Authorization": f"Bearer {AIRTABLE_PAT}", "User-Agent": "curl/8.0"}
            )
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read())
                    out.extend(data.get("records", []))
                    offset = data.get("offset")
                    if not offset:
                        break
            except Exception as e:
                print(f"  Airtable list error: {e}")
                return out
        return out


# Records whose Business Name contains apostrophes that break Airtable's
# LOWER()-on-literal parsing. Looked up manually via search_records.
KNOWN_RECORD_IDS = {
    "Chauncey's": "rec5VOa5SeJFOXNNZ",
    "Rollen's RAW Grains": "recPneyBYTia3qBCe",
}


def airtable_get(record_id, fields=None):
    """Fetch a single Suppliers record by ID. Ignores the `fields` arg
    intentionally: GET-by-id returns all fields, and Airtable rejects the
    `fields[]=` query param style on single-record GETs."""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{urllib.parse.quote(AIRTABLE_TABLE)}/{record_id}"
    req = urllib.request.Request(
        url, headers={"Authorization": f"Bearer {AIRTABLE_PAT}", "User-Agent": "curl/8.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"    airtable_get error for {record_id}: {e}")
        return None


def airtable_patch(record_id, fields):
    """Update a Suppliers record."""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{urllib.parse.quote(AIRTABLE_TABLE)}/{record_id}"
    body = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {AIRTABLE_PAT}",
            "Content-Type": "application/json",
            "User-Agent": "curl/8.0",
        },
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:200]
        print(f"    Airtable patch error: HTTP {e.code}: {body}")
        return None
    except Exception as e:
        print(f"    Airtable patch error: {e}")
        return None


# --- Main flow ---

def pull_target_vendors():
    """Pull the target vendors from Airtable one at a time by Business Name.

    Uses case-insensitive LOWER() comparison since Airtable's smart caps
    sometimes shifts the stored value (e.g. 'Chauncey'S' vs 'Chauncey's'),
    and individual lookups are more robust to special characters than
    chunked OR formulas (Iléwa Foods + apostrophe combos break encoding).
    """
    print(f"\n[1/6] Pulling {len(TARGET_BUSINESS_NAMES)} vendors from Airtable...")
    fields = ["Business Name", "First Name", "Last Name", "Email", "City", "State", "Category"]
    found = []
    missing = []
    for name in TARGET_BUSINESS_NAMES:
        # Escape single quotes for Airtable formula by doubling them
        escaped = name.replace("'", "''")
        # LOWER() both sides for case-insensitive match
        formula = f"LOWER({{Business Name}})=LOWER('{escaped}')"
        rows = airtable_list(filter_formula=formula, fields=fields)
        # Fallback: known record IDs for names that break formula parsing.
        if not rows and name in KNOWN_RECORD_IDS:
            single = airtable_get(KNOWN_RECORD_IDS[name], fields=fields)
            if single:
                rows = [single]
        if not rows:
            missing.append({"business_name": name, "reason": "not found in Airtable"})
            continue
        r = rows[0]
        f = r.get("fields", {})
        email = f.get("Email", "")
        if not email:
            missing.append({"business_name": name, "reason": "no email in Airtable"})
            continue
        state = f.get("State")
        if isinstance(state, list) and state:
            state = state[0]
        elif not isinstance(state, str):
            state = ""
        found.append({
            "airtable_id": r["id"],
            "business_name": f.get("Business Name", name),
            "first_name": f.get("First Name", ""),
            "last_name": f.get("Last Name", ""),
            "email": email,
            "city": f.get("City", ""),
            "state": state,
            "category": f.get("Category", []),
        })
        time.sleep(0.1)
    print(f"  Matched with email: {len(found)}/{len(TARGET_BUSINESS_NAMES)}")
    print(f"  Missing / no email: {len(missing)}")
    for m in missing:
        print(f"    - {m['business_name']} ({m['reason']})")
    return found, missing


def get_sender_account_id():
    print(f"\n[2/6] Getting sender account ID for {SENDER_EMAIL}...")
    accounts = apollo_request("GET", "email_accounts")
    if not accounts:
        return None
    for a in accounts.get("email_accounts", []):
        if a.get("email", "").lower() == SENDER_EMAIL.lower():
            print(f"  Found: id={a['id']}, active={a.get('active')}")
            return a["id"]
    print(f"  ERROR: {SENDER_EMAIL} not in Apollo email_accounts")
    return None


def create_or_match_contacts(vendors):
    print(f"\n[3/6] Creating {len(vendors)} contacts in Apollo...")
    created = []
    for v in vendors:
        if DRY_RUN:
            created.append({**v, "apollo_id": "DRY_RUN", "email_status": "dry_run"})
            print(f"  [DRY] {v['business_name']:50s} | {v['email']}")
            continue

        payload = {
            "organization_name": v["business_name"],
            "email": v["email"],
        }
        if v.get("first_name"):
            payload["first_name"] = v["first_name"]
        if v.get("last_name"):
            payload["last_name"] = v["last_name"]
        if v.get("city"):
            payload["city"] = v["city"]
        if v.get("state"):
            payload["state"] = v["state"]

        result = apollo_request("POST", "contacts", payload=payload)
        if result and result.get("contact"):
            c = result["contact"]
            apollo_id = c.get("id")
            email_status = c.get("email_status", "unknown") or "unknown"
            print(f"  [OK ] {v['business_name']:50s} | status={email_status:12s} | id={apollo_id}")
            created.append({**v, "apollo_id": apollo_id, "email_status": email_status})
        else:
            print(f"  [ERR] {v['business_name']:50s} | contact creation failed")
            created.append({**v, "apollo_id": None, "email_status": "create_failed"})
        time.sleep(0.5)

    return created


def bucket_by_email_status(contacts):
    buckets = {
        "verified": [],
        "unverified": [],
        "catch_all": [],
        "invalid": [],
        "no_id": [],
        "other": [],
    }
    for c in contacts:
        if not c.get("apollo_id"):
            buckets["no_id"].append(c)
            continue
        status = (c.get("email_status") or "unknown").lower()
        if status in ("verified", "valid", "deliverable"):
            buckets["verified"].append(c)
        elif status in ("unverified", "unknown", "pending"):
            buckets["unverified"].append(c)
        elif "catch" in status:
            buckets["catch_all"].append(c)
        elif status in ("invalid", "undeliverable", "hard_bounce", "bounce_risk"):
            buckets["invalid"].append(c)
        else:
            buckets["other"].append(c)
    return buckets


def create_campaign(sender_id):
    print(f"\n[4/6] Creating campaign '{CAMPAIGN_NAME}'...")
    if DRY_RUN:
        print(f"  [DRY] Would create campaign on sender id={sender_id}")
        return "DRY_RUN"
    result = apollo_request(
        "POST",
        "emailer_campaigns",
        payload={
            "name": CAMPAIGN_NAME,
            "permissions": "team_can_use",
            "email_account_ids": [sender_id],
            "max_emails_per_day": MAX_PER_DAY,
            "active": False,
            "mark_finished_if_reply": True,
            "mark_paused_if_ooo": True,
        },
    )
    if result and result.get("emailer_campaign"):
        cid = result["emailer_campaign"]["id"]
        print(f"  Campaign created (inactive): {cid}")
        return cid
    print("  ERROR: campaign creation failed")
    return None


def add_steps(campaign_id):
    """Apollo architecture: emailer_step -> emailer_touch -> emailer_template.

    Working flow (verified 2026-05-23):
      1. POST emailer_steps WITHOUT subject/body. Apollo auto-creates an
         emailer_touch + empty emailer_template attached to the step.
      2. GET emailer_campaigns/{id} to find the auto-created touch and its
         emailer_template_id.
      3. PUT emailer_templates/{tpl_id} with body_html + body_text + subject
         to persist the email content.

    The earlier inline-body pattern (POST step with subject+body) silently
    drops the content -- the step gets created but the auto-template stays
    empty and the campaign UI shows a blank email. See archived campaign
    6a11e4344aa547000c6f4d5e for an example of that failure mode.
    """
    print(f"\n[5/6] Adding {len(EMAIL_STEPS)} email steps...")
    for step in EMAIL_STEPS:
        if DRY_RUN:
            print(f"  [DRY] step {step['position']}: \"{step['subject']}\" (wait {step['wait_time']}d)")
            continue
        # 1. Create the step (no body/subject in payload).
        result = apollo_request(
            "POST",
            "emailer_steps",
            payload={
                "emailer_campaign_id": campaign_id,
                "position": step["position"],
                "wait_time": step["wait_time"],
                "wait_mode": step["wait_mode"],
                "type": "auto_email",
            },
        )
        if not result:
            print(f"  step {step['position']}: step POST FAILED")
            continue
        step_data = result.get("emailer_step", result)
        step_id = step_data.get("id")
        print(f"  step {step['position']}: step_id={step_id}")

        # 2. Refetch the campaign to find the auto-created touch.
        time.sleep(0.5)
        camp = apollo_request("GET", f"emailer_campaigns/{campaign_id}")
        if not camp:
            print(f"    could not refetch campaign; template body NOT persisted")
            continue
        touches = camp.get("emailer_touches", [])
        my_touch = next((t for t in touches if t.get("emailer_step_id") == step_id), None)
        if not my_touch or not my_touch.get("emailer_template_id"):
            print(f"    no auto-touch found for step; template body NOT persisted")
            continue
        tpl_id = my_touch["emailer_template_id"]

        # 3. PUT the auto-created template with the actual content.
        upd = apollo_request(
            "PUT",
            f"emailer_templates/{tpl_id}",
            payload={
                "subject": step["subject"],
                "body_html": step["body"].replace("\n", "<br>"),
                "body_text": step["body"],
            },
        )
        if upd:
            tpl = upd.get("emailer_template", upd)
            body_len = len(tpl.get("body_text") or "")
            print(f"    template {tpl_id} populated (body_text len={body_len})")
        else:
            print(f"    template {tpl_id} PUT FAILED")
        time.sleep(0.5)


def add_contacts(campaign_id, sender_id, verified_contacts):
    print(f"\n[6/6] Adding {len(verified_contacts)} verified contacts to campaign...")
    if DRY_RUN:
        print(f"  [DRY] would add {len(verified_contacts)} contacts")
        return True
    if not verified_contacts:
        print("  No verified contacts to add")
        return True

    params = [
        ("emailer_campaign_id", campaign_id),
        ("send_email_from_email_account_id", sender_id),
    ]
    for c in verified_contacts:
        params.append(("contact_ids[]", c["apollo_id"]))

    url = f"{APOLLO_BASE_URL}/emailer_campaigns/{campaign_id}/add_contact_ids?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "X-Api-Key": APOLLO_API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "curl/8.0",
        },
        method="POST",
        data=b"{}",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            resp.read()
            print(f"  Added {len(verified_contacts)} contacts")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:300]
        print(f"  ERROR HTTP {e.code}: {body}")
        return False


def update_airtable_status(contacts_added):
    print(f"\n[*] Updating Airtable OnboardingStatus = 'Form sent' for {len(contacts_added)} contacts...")
    for c in contacts_added:
        if DRY_RUN:
            print(f"  [DRY] {c['business_name']}")
            continue
        result = airtable_patch(c["airtable_id"], {"OnboardingStatus": "Form sent"})
        if result:
            print(f"  [OK ] {c['business_name']}")
        else:
            print(f"  [ERR] {c['business_name']}")
        time.sleep(0.2)


def main():
    mode = "DRY RUN" if DRY_RUN else "LIVE"
    print("=" * 72)
    print(f"  VENDOR OUTREACH CAMPAIGN ({mode})")
    print(f"  Sender: {SENDER_EMAIL}  Daily limit: {MAX_PER_DAY}")
    print("=" * 72)
    if DRY_RUN:
        print("\n  Dry run. Run with --execute to write to Apollo and Airtable.")

    vendors, missing = pull_target_vendors()
    if not vendors:
        print("\n  No vendors matched. Aborting.")
        sys.exit(1)

    sender_id = get_sender_account_id()
    if not sender_id and not DRY_RUN:
        print("\n  No sender account. Aborting.")
        sys.exit(1)

    contacts = create_or_match_contacts(vendors)
    buckets = bucket_by_email_status(contacts)

    print(f"\n  Email status buckets:")
    for k, v in buckets.items():
        print(f"    {k:12s}: {len(v)}")

    verified = buckets["verified"]
    if DRY_RUN:
        verified = contacts  # dry-run treats all as verified for output

    campaign_id = create_campaign(sender_id)
    if campaign_id:
        add_steps(campaign_id)
        added_ok = add_contacts(campaign_id, sender_id, verified)
        if added_ok and not DRY_RUN:
            update_airtable_status(verified)

    # --- Save report ---
    report = {
        "campaign_name": CAMPAIGN_NAME,
        "campaign_id": campaign_id,
        "sender": SENDER_EMAIL,
        "max_per_day": MAX_PER_DAY,
        "buckets": {k: [c["business_name"] for c in v] for k, v in buckets.items()},
        "vendors_added_to_campaign": [
            {"business_name": c["business_name"], "email": c["email"], "apollo_id": c.get("apollo_id")}
            for c in verified
        ],
        "missing_from_airtable": missing,
    }
    out_path = os.path.join(OUTPUT_DIR, "campaign-results.json")
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2, default=str)

    print(f"\n{'=' * 72}")
    print(f"  SUMMARY ({mode})")
    print(f"{'=' * 72}")
    print(f"  Campaign:        {CAMPAIGN_NAME}")
    print(f"  Campaign ID:     {campaign_id}")
    print(f"  Sender:          {SENDER_EMAIL}")
    print(f"  Sequence:        2 emails (0d + 5d), 15/day")
    print(f"  Verified queued: {len(verified)}")
    print(f"  Unverified:      {len(buckets['unverified'])}  (need manual review)")
    print(f"  Catch-all:       {len(buckets['catch_all'])}  (need manual review)")
    print(f"  Invalid:         {len(buckets['invalid'])}  (do not send)")
    print(f"  Missing/no-email: {len(missing)}  (Airtable gap)")
    print(f"  Report:          {out_path}")
    if not DRY_RUN:
        print(f"\n  Campaign is INACTIVE.")
        print(f"  Next steps:")
        print(f"  1. Open Apollo, review the campaign")
        print(f"  2. Pause Tier 2A (denise@) if not already paused")
        print(f"  3. Activate the vendor outreach campaign")
    else:
        print(f"\n  Run with --execute to create the campaign.")
    print("=" * 72)


if __name__ == "__main__":
    main()
