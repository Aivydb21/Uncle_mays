#!/usr/bin/env python3
"""
Rebuild the Vendor Outreach campaign with correct Apollo architecture.

Previous attempt (create-vendor-outreach-campaign.py) used a step-creates-
template-implicitly pattern that doesn't work on Apollo's current API. The
correct architecture is:

  emailer_campaign
    -> emailer_step  (timing + position)
       -> emailer_touch  (link, approved)
          -> emailer_template  (subject + body_html + body_text)

This script:
1. Loads contact IDs from the previous campaign-results.json (no need to
   recreate contacts; they're already in Apollo and verified).
2. Creates a fresh campaign on anthony@unclemays.com.
3. For each of the 2 sequence steps:
   a. POST emailer_templates with body_html + body_text
   b. POST emailer_steps
   c. POST emailer_touches with status='approved'
4. Adds the existing 36 contacts to the new campaign.
5. Updates the saved report with the new campaign ID.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


CONFIG = json.load(open(os.path.expanduser("~/.claude/apollo-config.json")))
API_KEY = CONFIG["api_key"]
BASE_URL = CONFIG["base_url"]

SENDER_EMAIL = "anthony@unclemays.com"
CAMPAIGN_NAME = "Vendor Outreach - Wave A + E"
MAX_PER_DAY = 15

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RESULTS_PATH = os.path.join(BASE_DIR, "pipeline", "vendor-outreach", "campaign-results.json")

DRY_RUN = "--execute" not in sys.argv


EMAIL_STEPS = [
    {
        "position": 1,
        "wait_time": 0,
        "wait_mode": "day",
        "touch_type": "new_thread",
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
        "touch_type": "reply_to_thread",
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


def apollo(method, endpoint, payload=None, params=None, retries=3):
    url = f"{BASE_URL}/{endpoint}"
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
                "X-Api-Key": API_KEY,
                "User-Agent": "curl/8.0",
            },
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 204:
                    return {}
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:300]
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"    HTTP {e.code}: {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"    ERROR: {e}")
                return None


def main():
    mode = "DRY RUN" if DRY_RUN else "LIVE"
    print("=" * 72)
    print(f"  VENDOR OUTREACH CAMPAIGN REBUILD ({mode})")
    print("=" * 72)

    # 1. Load existing contacts
    if not os.path.exists(RESULTS_PATH):
        print(f"  ERROR: results file not found at {RESULTS_PATH}")
        print(f"  Run create-vendor-outreach-campaign.py first.")
        sys.exit(1)
    with open(RESULTS_PATH) as f:
        prev_results = json.load(f)
    existing_contacts = prev_results.get("vendors_added_to_campaign", [])
    contact_ids = [c["apollo_id"] for c in existing_contacts if c.get("apollo_id")]
    print(f"\n[1/6] Loaded {len(contact_ids)} existing Apollo contact IDs from prior run.")

    # 2. Get sender
    print(f"\n[2/6] Getting sender account ID for {SENDER_EMAIL}...")
    accounts = apollo("GET", "email_accounts")
    sender_id = None
    if accounts:
        for a in accounts.get("email_accounts", []):
            if a.get("email", "").lower() == SENDER_EMAIL.lower():
                sender_id = a["id"]
                break
    if not sender_id and not DRY_RUN:
        print(f"  ERROR: {SENDER_EMAIL} not found")
        sys.exit(1)
    print(f"  sender_id = {sender_id}")

    # 3. Create campaign
    print(f"\n[3/6] Creating campaign '{CAMPAIGN_NAME}'...")
    if DRY_RUN:
        campaign_id = "DRY_RUN"
        print(f"  [DRY] would create campaign on {SENDER_EMAIL}")
    else:
        result = apollo("POST", "emailer_campaigns", payload={
            "name": CAMPAIGN_NAME,
            "permissions": "team_can_use",
            "email_account_ids": [sender_id],
            "max_emails_per_day": MAX_PER_DAY,
            "active": False,
            "mark_finished_if_reply": True,
            "mark_paused_if_ooo": True,
        })
        if not result or not result.get("emailer_campaign"):
            print("  ERROR: campaign creation failed")
            sys.exit(1)
        campaign_id = result["emailer_campaign"]["id"]
        print(f"  campaign_id = {campaign_id}")

    # 4. For each step: create template, then step, then touch
    print(f"\n[4/6] Creating {len(EMAIL_STEPS)} step+touch+template trios...")
    created_steps = []
    for step in EMAIL_STEPS:
        print(f"\n  -- Step {step['position']} --")
        if DRY_RUN:
            print(f"    [DRY] template/step/touch: {step['subject'][:50]}...")
            created_steps.append({"position": step["position"], "step_id": "DRY", "tpl_id": "DRY", "touch_id": "DRY"})
            continue

        # a. Create template
        tpl_result = apollo("POST", "emailer_templates", payload={
            "name": f"{CAMPAIGN_NAME} - Step {step['position']}",
            "subject": step["subject"],
            "body_html": step["body"].replace("\n", "<br>"),
            "body_text": step["body"],
        })
        if not tpl_result:
            print(f"    template create FAILED")
            continue
        tpl = tpl_result.get("emailer_template", tpl_result)
        tpl_id = tpl.get("id")
        print(f"    template_id = {tpl_id} (body_text len={len(tpl.get('body_text') or '')})")

        # b. Create step
        step_result = apollo("POST", "emailer_steps", payload={
            "emailer_campaign_id": campaign_id,
            "position": step["position"],
            "wait_time": step["wait_time"],
            "wait_mode": step["wait_mode"],
            "type": "auto_email",
        })
        if not step_result:
            print(f"    step create FAILED")
            continue
        step_data = step_result.get("emailer_step", step_result)
        step_id = step_data.get("id")
        print(f"    step_id = {step_id}")

        # c. Create touch linking step to template, with approved status
        touch_result = apollo("POST", "emailer_touches", payload={
            "emailer_step_id": step_id,
            "emailer_template_id": tpl_id,
            "status": "approved",
            "type": step["touch_type"],
        })
        if not touch_result:
            print(f"    touch create FAILED")
            continue
        touch = touch_result.get("emailer_touch", touch_result)
        touch_id = touch.get("id")
        actual_tpl_id = touch.get("emailer_template_id")
        touch_status = touch.get("status")
        print(f"    touch_id = {touch_id} status={touch_status}")

        # If Apollo replaced our template_id with a new empty one, populate it
        if actual_tpl_id and actual_tpl_id != tpl_id:
            print(f"    Apollo reassigned template_id to {actual_tpl_id} -- populating it")
            apollo("PUT", f"emailer_templates/{actual_tpl_id}", payload={
                "subject": step["subject"],
                "body_html": step["body"].replace("\n", "<br>"),
                "body_text": step["body"],
            })
            tpl_id = actual_tpl_id

        # If touch status is to_be_reviewed, attempt to approve
        if touch_status != "approved":
            print(f"    touch is {touch_status}; attempting to approve via PATCH")
            apollo("PATCH", f"emailer_touches/{touch_id}", payload={"status": "approved"})

        created_steps.append({
            "position": step["position"],
            "step_id": step_id,
            "tpl_id": tpl_id,
            "touch_id": touch_id,
        })
        time.sleep(0.5)

    # 5. Add contacts to the new campaign
    print(f"\n[5/6] Adding {len(contact_ids)} contacts to campaign {campaign_id}...")
    if DRY_RUN:
        print(f"  [DRY] would add {len(contact_ids)} contacts")
    elif contact_ids:
        params = [
            ("emailer_campaign_id", campaign_id),
            ("send_email_from_email_account_id", sender_id),
        ]
        for cid in contact_ids:
            params.append(("contact_ids[]", cid))
        url = f"{BASE_URL}/emailer_campaigns/{campaign_id}/add_contact_ids?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(
            url, headers={"X-Api-Key": API_KEY, "Content-Type": "application/json", "User-Agent": "curl/8.0"},
            method="POST", data=b"{}",
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp.read()
                print(f"  Added {len(contact_ids)} contacts")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:300]
            print(f"  ERROR HTTP {e.code}: {body}")

    # 6. Final verification
    print(f"\n[6/6] Verifying campaign state...")
    if not DRY_RUN:
        c = apollo("GET", f"emailer_campaigns/{campaign_id}")
        if c:
            print(f"  steps:     {len(c['emailer_steps'])}")
            print(f"  touches:   {len(c['emailer_touches'])}")
            print(f"  templates: {len(c['emailer_templates'])}")
            for touch in c["emailer_touches"]:
                tpl = next((t for t in c["emailer_templates"] if t["id"] == touch["emailer_template_id"]), None)
                body_len = len((tpl or {}).get("body_text") or "")
                subj = (tpl or {}).get("subject") or "(no subject)"
                print(f"    touch {touch['id'][-8:]} status={touch['status']:14s} type={touch['type']:16s} subject='{subj[:50]}' body_len={body_len}")

    # Update results file
    if not DRY_RUN and campaign_id != "DRY_RUN":
        prev_results["campaign_id"] = campaign_id
        prev_results["archived_campaign_id"] = "6a11e4344aa547000c6f4d5e"
        prev_results["rebuild_steps"] = created_steps
        with open(RESULTS_PATH, "w") as f:
            json.dump(prev_results, f, indent=2, default=str)
        print(f"\n  Updated {RESULTS_PATH}")

    print(f"\n{'=' * 72}")
    print(f"  REBUILD COMPLETE ({mode})")
    print(f"  Campaign ID: {campaign_id}")
    print(f"  Next: review in Apollo UI, then activate.")
    print(f"{'=' * 72}")


if __name__ == "__main__":
    main()
