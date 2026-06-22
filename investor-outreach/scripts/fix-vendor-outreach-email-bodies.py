#!/usr/bin/env python3
"""
Diagnose + fix the Vendor Outreach campaign email bodies.

The initial create-vendor-outreach-campaign.py run created the campaign and
the 2 steps, but the step response did not surface an emailer_template_id
where expected, so the follow-up PUT to persist the body never fired. This
script:

1. Fetches the campaign and prints the full step + template structure
2. Looks up the emailer_template_id for each step
3. PUTs the correct body+subject to each template

Idempotent; safe to re-run.
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

CAMPAIGN_ID = "6a11e4344aa547000c6f4d5e"

# Step IDs from the original create-vendor-outreach-campaign.py live run.
KNOWN_STEP_IDS = {
    1: "6a11e435c25c0200108b8f90",
    2: "6a11e4354aa547000c6f4d60",
}

EMAIL_STEPS = [
    {
        "position": 1,
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


def apollo_request(method, endpoint, payload=None):
    url = f"{BASE_URL}/{endpoint}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    if data is None and method in ("POST", "PUT"):
        data = b"{}"
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:400]
        print(f"  HTTP {e.code}: {body}")
        return None
    except Exception as e:
        print(f"  ERROR: {e}")
        return None


def main():
    print("=" * 72)
    print(f"  Fixing vendor outreach campaign email bodies")
    print(f"  Campaign ID: {CAMPAIGN_ID}")
    print("=" * 72)

    print("\n[1/3] Fetching steps directly by known step IDs...")
    steps = []
    for pos, sid in KNOWN_STEP_IDS.items():
        s = apollo_request("GET", f"emailer_steps/{sid}")
        if not s:
            print(f"  step {pos} ({sid}): fetch failed")
            continue
        # Apollo may wrap or not
        em_step = s.get("emailer_step", s)
        em_step["position"] = pos
        em_step["_id_fallback"] = sid
        if not em_step.get("id"):
            em_step["id"] = sid
        steps.append(em_step)
        print(f"  step {pos}: keys={list(em_step.keys())}")
        print(f"    id={em_step.get('id')}")
        print(f"    emailer_template_id={em_step.get('emailer_template_id')}")
        em_tpl = em_step.get("emailer_template")
        if isinstance(em_tpl, dict):
            print(f"    emailer_template.id={em_tpl.get('id')}")
            print(f"    emailer_template.subject={em_tpl.get('subject')}")
            print(f"    emailer_template.body length={len(em_tpl.get('body') or '')}")

    print("\n[2/3] Creating templates and linking them to the steps...")
    for step in EMAIL_STEPS:
        pos = step["position"]
        step_id = KNOWN_STEP_IDS[pos]
        print(f"  step {pos}: step_id={step_id}")

        # (a) Create a new emailer_template with the subject + body
        tpl_create = apollo_request(
            "POST",
            "emailer_templates",
            payload={
                "name": f"Vendor Outreach - Wave A + E - Step {pos}",
                "subject": step["subject"],
                "body_html": step["body"].replace("\n", "<br>"),
                "body_text": step["body"],
            },
        )
        if not tpl_create:
            print(f"    template create FAILED")
            continue
        tpl = tpl_create.get("emailer_template", tpl_create)
        tpl_id = tpl.get("id")
        print(f"    template created: id={tpl_id}")

        # (b) PUT the step to link to the template
        link_result = apollo_request(
            "PUT",
            f"emailer_steps/{step_id}",
            payload={"emailer_template_id": tpl_id},
        )
        if link_result:
            print(f"    step linked to template")
        else:
            print(f"    step link PUT FAILED")
        time.sleep(0.5)

    print("\n[3/3] Re-fetching each step to confirm bodies persisted...")
    for pos, sid in KNOWN_STEP_IDS.items():
        s = apollo_request("GET", f"emailer_steps/{sid}")
        if not s:
            print(f"  step {pos}: refetch failed")
            continue
        em_step = s.get("emailer_step", s)
        em_tpl = em_step.get("emailer_template") or {}
        body_len = len(em_tpl.get("body") or "")
        subj = em_tpl.get("subject") or "(no subject)"
        print(f"  step {pos}: subject='{subj[:70]}' body_len={body_len}")

    print("\n" + "=" * 72)
    print("  Done. Re-open the campaign in Apollo and verify the body now")
    print("  renders correctly when you preview a step.")
    print("=" * 72)


if __name__ == "__main__":
    main()
