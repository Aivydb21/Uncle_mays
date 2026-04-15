#!/usr/bin/env python3
"""
Fix CRE campaign: populate email templates via emailer_touches endpoint,
then activate the campaign.

The Apollo API does NOT persist subject/body when creating steps.
You must: GET /emailer_touches?emailer_step_id=X -> get template_id
         PUT /emailer_templates/<template_id> with subject + body
"""

import json, os, time, urllib.request, urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/apollo-config.json")
with open(CONFIG_PATH) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]
CAMPAIGN_ID = "69d9670d516fcc0011c0ee34"

STEP_IDS = [
    "69d9670da32bc80015822c85",  # Step 1
    "69d9670e193a710011be6133",  # Step 2
    "69d9670f5efa000021304349",  # Step 3
    "69d96710a32bc80015822c8b",  # Step 4
]

EMAILS = [
    {
        "subject": "a grocery platform launching in hyde park",
        "body_text": (
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
        "subject": "the capital stack behind uncle may's",
        "body_text": (
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
        "subject": "why this isn't just a grocery store",
        "body_text": (
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
        "subject": "closing the round, uncle may's",
        "body_text": (
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


def apollo_get(endpoint, retries=3):
    for attempt in range(retries):
        req = urllib.request.Request(
            f"{BASE_URL}/{endpoint}",
            headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:300]
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  GET {endpoint} failed: HTTP {e.code}: {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  GET {endpoint} failed: {e}")
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
            body = e.read().decode("utf-8", errors="replace")[:300]
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  PUT {endpoint} failed: HTTP {e.code}: {body}")
                return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                print(f"  PUT {endpoint} failed: {e}")
                return None


def main():
    print("=" * 60)
    print("  CRE CAMPAIGN: POPULATE TEMPLATES VIA TOUCHES")
    print("=" * 60)

    success_count = 0

    for i, step_id in enumerate(STEP_IDS):
        email = EMAILS[i]
        print(f"\n--- Step {i+1}: '{email['subject'][:40]}...' ---")

        # Phase 1: Get template ID via emailer_touches
        print(f"  [1] Getting touches for step {step_id}...")
        touches_data = apollo_get(f"emailer_touches?emailer_step_id={step_id}")
        if not touches_data:
            print(f"      FAILED to get touches")
            continue

        touch_list = touches_data.get("emailer_touches", [])
        print(f"      Found {len(touch_list)} touches")

        if not touch_list:
            print(f"      ERROR: No touches found for step")
            continue

        # Extract template ID
        touch = touch_list[0]
        template_id = touch.get("emailer_template_id")
        if not template_id:
            tmpl = touch.get("emailer_template")
            if tmpl and isinstance(tmpl, dict):
                template_id = tmpl.get("id")

        if not template_id:
            print(f"      ERROR: No template_id found in touch")
            print(f"      Touch fields with values:")
            for k, v in touch.items():
                if v is not None and v != "" and v != [] and v != {}:
                    val_str = str(v)
                    if len(val_str) > 100:
                        val_str = val_str[:100] + "..."
                    print(f"        {k}: {val_str}")
            continue

        print(f"      Template ID: {template_id}")

        # Phase 2: Update template with subject + body
        print(f"  [2] Updating template {template_id}...")

        # Build HTML from plain text
        body_html = email["body_text"].replace("\n\n", "</p><p>").replace("\n", "<br>")
        body_html = f"<p>{body_html}</p>"

        result = apollo_put(f"emailer_templates/{template_id}", {
            "subject": email["subject"],
            "body_text": email["body_text"],
            "body_html": body_html,
        })

        if result:
            tmpl = result.get("emailer_template", result)
            subj = tmpl.get("subject", "")
            bt = tmpl.get("body_text", "") or ""
            bh = tmpl.get("body_html", "") or ""
            body_len = max(len(bt), len(bh))
            print(f"      Subject: '{subj[:50]}'")
            print(f"      Body length: {body_len}")
            if subj and body_len > 0:
                print(f"      SUCCESS")
                success_count += 1
            else:
                print(f"      WARNING: Content may not have persisted")
        else:
            print(f"      FAILED to update template")

        time.sleep(0.5)

    print(f"\n\n{'=' * 60}")
    print(f"  TEMPLATE UPDATE RESULTS: {success_count}/4 steps populated")
    print(f"{'=' * 60}")

    if success_count < 4:
        print("\n  Not all templates populated. Skipping activation.")
        return

    # Phase 3: Verify via touches
    print(f"\n--- VERIFICATION ---")
    for i, step_id in enumerate(STEP_IDS):
        touches_data = apollo_get(f"emailer_touches?emailer_step_id={step_id}")
        if touches_data:
            touch_list = touches_data.get("emailer_touches", [])
            if touch_list:
                tmpl = touch_list[0].get("emailer_template", {})
                subj = tmpl.get("subject", "")
                body = tmpl.get("body_text", "") or tmpl.get("body_html", "") or ""
                print(f"  Step {i+1}: subject='{subj[:45]}' body_len={len(body)}")
            else:
                print(f"  Step {i+1}: no touches")
        time.sleep(0.3)

    # Phase 4: Activate
    print(f"\n--- ACTIVATING CAMPAIGN ---")
    result = apollo_put(f"emailer_campaigns/{CAMPAIGN_ID}", {"active": True})
    if result:
        c = result.get("emailer_campaign", result)
        active = c.get("active")
        statuses = c.get("contact_statuses", {})
        print(f"  Active: {active}")
        print(f"  Contact statuses: {statuses}")

        if active:
            print(f"\n  CAMPAIGN IS LIVE!")
        else:
            print(f"\n  Campaign did not activate. May need OAuth re-auth.")
    else:
        print(f"  Activation call failed")

    print(f"\n{'=' * 60}")
    print(f"  DONE")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
