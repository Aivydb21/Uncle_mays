#!/usr/bin/env python3
"""Update email templates for all Tier 2 campaign steps."""

import json
import os
import time
import urllib.request

config = json.load(open(os.path.expanduser("~/.claude/apollo-config.json")))
API_KEY = config["api_key"]
BASE_URL = config["base_url"]

CAMPAIGNS = [
    {"name": "Tier 2A (Denise)", "id": "69d7dc2bf18bda002233eb04"},
    {"name": "Tier 2B (Rosalind)", "id": "69d7dc492a222a0019913520"},
    {"name": "Tier 2C (Invest)", "id": "69d7dc68457595000d6b285d"},
    {"name": "Tier 2D (TimJ)", "id": "69d7dc86cfcc9800152117b7"},
]

EMAILS = [
    {
        "position": 1,
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


def text_to_html(text):
    """Convert plain text to simple HTML."""
    paragraphs = text.split("\n\n")
    html_parts = []
    for p in paragraphs:
        lines = p.split("\n")
        if any(line.startswith("- ") for line in lines):
            items = []
            for line in lines:
                if line.startswith("- "):
                    content = line[2:].replace("&", "&amp;").replace("<", "&lt;")
                    items.append(f"<li>{content}</li>")
                else:
                    content = line.replace("&", "&amp;").replace("<", "&lt;")
                    items.append(f"<p>{content}</p>")
            html_parts.append("<ul>" + "".join(items) + "</ul>")
        else:
            escaped = [l.replace("&", "&amp;").replace("<", "&lt;") for l in lines]
            html_parts.append("<p>" + "<br>".join(escaped) + "</p>")
    return "".join(html_parts)


def main():
    print("=== UPDATING EMAIL TEMPLATES ===\n")

    for camp in CAMPAIGNS:
        print(f"--- {camp['name']} ---")

        # Get campaign steps
        req = urllib.request.Request(
            f"{BASE_URL}/emailer_campaigns/{camp['id']}",
            headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
        )
        resp = urllib.request.urlopen(req, timeout=15)
        data = json.loads(resp.read())
        steps = data.get("emailer_steps", [])

        for step_info in steps:
            step_id = step_info["id"]
            position = step_info["position"]

            # Find matching email
            email = next((e for e in EMAILS if e["position"] == position), None)
            if not email:
                print(f"  Step {position}: no matching content, skipping")
                continue

            # Get the touch to find template_id
            req = urllib.request.Request(
                f"{BASE_URL}/emailer_touches?emailer_step_id={step_id}",
                headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"},
            )
            resp = urllib.request.urlopen(req, timeout=15)
            touch_data = json.loads(resp.read())
            touches = touch_data.get("emailer_touches", [])

            if not touches:
                print(f"  Step {position}: no touch found")
                continue

            template_id = touches[0]["emailer_template_id"]

            # Update template with subject and body
            body_html = text_to_html(email["body"])
            payload = json.dumps({
                "subject": email["subject"],
                "body_text": email["body"],
                "body_html": body_html,
            }).encode("utf-8")

            req = urllib.request.Request(
                f"{BASE_URL}/emailer_templates/{template_id}",
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Api-Key": API_KEY,
                    "User-Agent": "curl/8.0",
                },
                method="PUT",
            )
            try:
                resp = urllib.request.urlopen(req, timeout=15)
                result = json.loads(resp.read())
                tmpl = result.get("emailer_template", result)
                subj = tmpl.get("subject", "")[:50]
                print(f"  Step {position}: '{subj}' - OK")
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", errors="replace")
                print(f"  Step {position}: FAILED (HTTP {e.code}): {body[:200]}")

            time.sleep(0.3)

        print()

    print("=== ALL TEMPLATES UPDATED ===")


if __name__ == "__main__":
    main()
