#!/usr/bin/env python3
"""
Rebuild CRE & HNW campaign from scratch.
Creates new campaign, adds 4-step v3-cre sequence, adds 20 contacts, activates.
"""

import json, os, sys, time, urllib.request, urllib.error, urllib.parse

CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]
SENDER_ACCOUNT_ID = "69c43dfd105e19000d73a510"  # investmentrelations@unclemays.com


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
            body = e.read().decode("utf-8", errors="replace")[:500]
            if attempt < retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  Retry {attempt+1} after {wait}s (HTTP {e.code}: {body[:200]})")
                time.sleep(wait)
            else:
                print(f"  FAILED: HTTP {e.code}: {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  FAILED: {e}")
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
            body = e.read().decode("utf-8", errors="replace")[:500]
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  FAILED: HTTP {e.code}: {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  FAILED: {e}")
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
                print(f"  FAILED: {e}")
                return None


# v3-cre email sequence
EMAIL_STEPS = [
    {
        "position": 1, "wait_time": 0, "wait_mode": "day",
        "subject": "a grocery platform launching in hyde park",
        "body": "Hi {{first_name}},\n\nUncle May's Produce is opening a 10,000 sq ft flagship grocery store in Hyde Park, Chicago. SBA loan secured, location LOI signed, architect engaged. Our founder, Anthony Ivy (Chicago Booth MBA, private equity and M&A background), is building the first data and distribution platform for Black food consumption, starting with a physical retail asset in one of Chicago's most culturally vibrant neighborhoods.\n\nThis is a real commercial lease backed by real demand data: $100B+ in annual Black grocery spend, zero infrastructure connecting that market to suppliers, and 97% intent-to-shop from 100+ surveyed consumers in our target demographic. We're raising $400K to $750K to close the capital stack and break ground. A short teaser is attached if you'd like to take a look. Worth a conversation?\n\nUncle May's Produce\nAnthony Ivy, Founder & CEO\n(312) 972-2595 | unclemays.com",
    },
    {
        "position": 2, "wait_time": 5, "wait_mode": "day",
        "subject": "the capital stack behind uncle may's",
        "body": "Hi {{first_name}},\n\nFollowing up on Uncle May's. The capital structure is built to de-risk early investors. The $400K equity minimum triggers a conditionally approved $2M SBA 7(a) facility through Busey Bank plus $100K in tenant improvements, bringing total deployment to $2.5M. That gets us through build-out, inventory, and six months of operating reserves with no additional dilution.\n\nThe unit economics are institutional grade: projected $629/sq ft in Year 1 revenue ($6.3M total), 35% gross margin at stabilization, and 15.3% EBITDA margin. Our GM, Matt Weschler, has started and exited two Chicago grocery stores. He's already on board and active. Happy to share the deck or financial model if this is relevant.\n\nUncle May's Produce\nAnthony Ivy, Founder & CEO",
    },
    {
        "position": 3, "wait_time": 7, "wait_mode": "day",
        "subject": "why this isn't just a grocery store",
        "body": "Hi {{first_name}},\n\nOne thing worth flagging: Uncle May's looks like a retail play, but the long-term business model is infrastructure. Every transaction generates proprietary data on Black food consumption. SKU-level demand, pricing elasticity, vendor performance, purchasing behavior by demographic and geography. No one else captures this because no one else owns both the consumer interface and the supplier network for this market.\n\nThat data compounds with every store. Retail margins run 20 to 30%, but vendor distribution reaches 30 to 45%, data and analytics 60 to 70%, and platform services 70 to 80%. The 82-store national rollout targets $625M revenue by Year 10. We start as a retailer, we scale as a platform. If this category interests you, we'd welcome 20 minutes to walk through the model.\n\nUncle May's Produce\nAnthony Ivy, Founder & CEO",
    },
    {
        "position": 4, "wait_time": 8, "wait_mode": "day",
        "subject": "closing the round, uncle may's",
        "body": "Hi {{first_name}},\n\nLast note from us. We're closing the seed round at $400K to $750K on a $5M cap SAFE with a 20% discount. $25K minimum check. The equity tranche triggers the SBA facility and puts us into build-out immediately.\n\nThe leadership team backing this: Anthony Ivy (CEO, Chicago Booth, PE/M&A) is joined by a COO who managed a $3B retail P&L at Amazon, a CFO from Bank of America investment banking (also Chicago Booth), and a CMO who led global marketing at Unilever and P&G. Early investors get in before the data network scales. If this doesn't fit, no worries at all. But if it does, we'd rather you hear it from us than read about it later.\n\nUncle May's Produce\nAnthony Ivy, Founder & CEO\n(312) 972-2595 | unclemays.com",
    },
]

# 20 contacts with verified emails
CONTACTS = [
    ("Don Peebles", "69d91aee1e88ce00212140dd"),
    ("Quintin Primo", "69d91aeff903500019d44235"),
    ("Leon Walker", "69d91af01d6477001dd2312c"),
    ("Jair Lynch", "69d91af01e88ce00157ea306"),
    ("Robin Zeigler", "69d91af1080ca80019c33cad"),
    ("Amin Irving", "69d91af27d23bb0021b7567d"),
    ("Greg Reaves", "69d91af3f903500019d442ad"),
    ("Leslie Smallwood-Lewis", "69d91af47343f0000dff9770"),
    ("Bo Menkiti", "69d91af5080ca80019c33cb9"),
    ("Victor MacFarlane", "69d91af6c72f8b0019ded1e4"),
    ("Tammy Jones", "69d91af7648b83000d415867"),
    ("Daryl Carter", "69d91af84f78710015173b56"),
    ("Kirk Goodrich", "69d91afab2ebe90019db4076"),
    ("Kimberly Hardy", "69d91afb97482c00158a492d"),
    ("Ashley Thomas", "69d91afcb254c80015a20c6a"),
    ("Kimberly Dowdell", "69d91afe490c75000d70f59c"),
    ("Mellody Hobson", "69d91aff4bdc6d000d9dad2e"),
    ("Jim Reynolds", "69d91b0074fb1d000d8b5253"),
    ("Robert Smith", "69d91b02fd4515001164b8e8"),
    ("Michael Russell", "69d91b05dbf1280019f6279e"),
]


def main():
    print("=" * 60)
    print("  REBUILDING CRE & HNW CAMPAIGN")
    print("=" * 60)

    # --- Step 1: Create new campaign ---
    print("\n[1/4] Creating new campaign...")
    result = apollo_post("emailer_campaigns", {
        "name": "CRE & HNW - Black Professionals v2",
        "permissions": "team_can_use",
        "email_account_ids": [SENDER_ACCOUNT_ID],
        "max_emails_per_day": 10,
        "active": False,
        "mark_finished_if_reply": True,
        "mark_paused_if_ooo": True,
    })
    if not result or not result.get("emailer_campaign"):
        print("  FATAL: Could not create campaign")
        print(f"  Response: {json.dumps(result, indent=2)[:500] if result else 'None'}")
        sys.exit(1)

    campaign = result["emailer_campaign"]
    campaign_id = campaign["id"]
    print(f"  Campaign created: {campaign_id}")
    print(f"  Name: {campaign.get('name')}")
    print(f"  Active: {campaign.get('active')}")

    # --- Step 2: Add email steps ---
    print(f"\n[2/4] Adding 4 email steps...")
    steps_ok = 0
    for step in EMAIL_STEPS:
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
            sd = result.get("emailer_step", result)
            step_id = sd.get("id")
            template_id = sd.get("emailer_template_id") or sd.get("emailer_template", {}).get("id")
            print(f"  Step {step['position']}: created (ID: {step_id})")

            # Update template to ensure body persists
            if template_id:
                tr = apollo_put(f"emailer_templates/{template_id}", {
                    "subject": step["subject"],
                    "body": step["body"],
                })
                if tr:
                    print(f"    Template {template_id} updated")
                else:
                    print(f"    Template update failed")
            steps_ok += 1
        else:
            print(f"  Step {step['position']}: FAILED")
        time.sleep(0.5)

    print(f"  Steps created: {steps_ok}/4")

    # Verify steps
    time.sleep(1)
    verify = apollo_get(f"emailer_campaigns/{campaign_id}")
    if verify:
        vc = verify.get("emailer_campaign", verify)
        actual_steps = len(vc.get("emailer_steps", []))
        print(f"  Verified steps in campaign: {actual_steps}")
        if actual_steps > 0:
            for i, s in enumerate(vc.get("emailer_steps", [])):
                print(f"    Step {i+1}: '{s.get('subject','')[:40]}' wait={s.get('wait_time')}d")

    # --- Step 3: Add contacts ---
    print(f"\n[3/4] Adding {len(CONTACTS)} contacts...")
    contact_ids = [cid for _, cid in CONTACTS]

    params = [
        ("emailer_campaign_id", campaign_id),
        ("send_email_from_email_account_id", SENDER_ACCOUNT_ID),
        ("sequence_active_in_other_campaigns", "true"),
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
            resp_body = resp.read().decode("utf-8", errors="replace")
            print(f"  Added {len(contact_ids)} contacts")
            if resp_body:
                print(f"  Response: {resp_body[:200]}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:500]
        print(f"  ERROR: HTTP {e.code}: {body}")
    except Exception as e:
        print(f"  ERROR: {e}")

    # --- Step 4: Activate ---
    print(f"\n[4/4] Activating campaign...")
    result = apollo_put(f"emailer_campaigns/{campaign_id}", {"active": True})
    if result:
        c = result.get("emailer_campaign", result)
        print(f"  Active: {c.get('active')}")
    else:
        print("  Activation failed")

    # Final verify
    time.sleep(1)
    final = apollo_get(f"emailer_campaigns/{campaign_id}")
    if final:
        fc = final.get("emailer_campaign", final)
        print(f"\n  === FINAL STATUS ===")
        print(f"  Campaign ID: {campaign_id}")
        print(f"  Name: {fc.get('name')}")
        print(f"  Active: {fc.get('active')}")
        print(f"  Steps: {len(fc.get('emailer_steps', []))}")
        print(f"  Send rate: {fc.get('max_emails_per_day')}/day")

    # Save new campaign ID
    results_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..",
        "pipeline", "cre-hnw", "campaign-results.json"
    )
    with open(results_path) as f:
        results = json.load(f)
    results["campaign_id"] = campaign_id
    results["campaign_name"] = "CRE & HNW - Black Professionals v2"
    results["old_campaign_id"] = "69d91b08db5ac5001dad04d3"
    results["status"] = "active" if (final and final.get("emailer_campaign", {}).get("active")) else "created_inactive"
    results["updated_at"] = "2026-04-10"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  Results saved to: {results_path}")

    print("\n" + "=" * 60)
    print("  DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()
