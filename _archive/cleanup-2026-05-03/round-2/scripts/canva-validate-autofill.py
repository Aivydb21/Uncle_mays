#!/usr/bin/env python3
"""
Canva Brand Template Autofill Validator
---------------------------------------
Lists brand templates, reads their autofill datasets, and generates
5 test variants (A/B/C/D/E) per template to validate the pipeline.

Usage:
    python scripts/canva-validate-autofill.py           # list templates + datasets
    python scripts/canva-validate-autofill.py --generate # generate 5 variants per template

Requires: ~/.claude/canva-config.json with valid tokens
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
import base64

CONFIG_PATH = os.path.join(os.path.expanduser("~"), ".claude", "canva-config.json")

# --- 5 test variant copy sets for A/B testing ---
VARIANT_COPY = [
    {
        "name": "Variant A - Direct Offer",
        "Headline": "Fresh Produce Box, $30 This Week",
        "Subhead": "Hand-curated seasonal fruits & vegetables for your table.",
        "CTA": "Order Now at unclemays.com",
    },
    {
        "name": "Variant B - Curiosity Hook",
        "Headline": "What Does Spring Taste Like in Hyde Park?",
        "Subhead": "Find out with this week's curated produce box.",
        "CTA": "See This Week's Box",
    },
    {
        "name": "Variant C - Social Proof",
        "Headline": "89% of Our Customers Refer a Friend",
        "Subhead": "Join the families already eating better this season.",
        "CTA": "Try Your First Box",
    },
    {
        "name": "Variant D - Scarcity",
        "Headline": "Limited Boxes Available This Week",
        "Subhead": "Order by Thursday. Once they're gone, they're gone.",
        "CTA": "Reserve Your Box",
    },
    {
        "name": "Variant E - Community",
        "Headline": "Produce Curated for Us, by Us",
        "Subhead": "Premium quality. Culturally specific. Delivered weekly.",
        "CTA": "Shop Uncle May's",
    },
]

# Staged produce photo asset ID
PRODUCE_PHOTO_ASSET_ID = "MAHGqpAdAR0"


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def save_config(config):
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)


def refresh_token(config):
    """Refresh the Canva access token."""
    credentials = base64.b64encode(
        f'{config["client_id"]}:{config["client_secret"]}'.encode()
    ).decode()
    payload = urllib.parse.urlencode(
        {"grant_type": "refresh_token", "refresh_token": config["refresh_token"]}
    ).encode("utf-8")
    req = urllib.request.Request(
        config["oauth_token_url"],
        data=payload,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    resp = urllib.request.urlopen(req, timeout=30)
    tokens = json.loads(resp.read())
    config["access_token"] = tokens["access_token"]
    config["refresh_token"] = tokens["refresh_token"]
    save_config(config)
    return config


def canva_get(config, endpoint):
    """GET request to Canva API with auto-refresh on 401."""
    url = f'{config["base_url"]}/{endpoint}'
    req = urllib.request.Request(
        url, headers={"Authorization": f'Bearer {config["access_token"]}'}
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 401:
            config = refresh_token(config)
            req = urllib.request.Request(
                url,
                headers={"Authorization": f'Bearer {config["access_token"]}'},
            )
            resp = urllib.request.urlopen(req, timeout=30)
            return json.loads(resp.read())
        raise


def canva_post(config, endpoint, data):
    """POST request to Canva API with auto-refresh on 401."""
    url = f'{config["base_url"]}/{endpoint}'
    payload = json.dumps(data).encode("utf-8")
    headers = {
        "Authorization": f'Bearer {config["access_token"]}',
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 401:
            config = refresh_token(config)
            headers["Authorization"] = f'Bearer {config["access_token"]}'
            req = urllib.request.Request(
                url, data=payload, headers=headers, method="POST"
            )
            resp = urllib.request.urlopen(req, timeout=60)
            return json.loads(resp.read())
        body = e.read().decode()
        print(f"  ERROR {e.code}: {body}")
        raise


def list_brand_templates(config):
    """List all brand templates in the account."""
    print("\n=== Brand Templates ===\n")
    result = canva_get(config, "brand-templates")
    templates = result.get("items", [])
    if not templates:
        print("  No brand templates found.")
        print("  Anthony needs to publish designs as brand templates in Canva UI.")
        print("  See the setup brief below.\n")
        return []
    for t in templates:
        print(f"  ID: {t['id']}")
        print(f"  Title: {t.get('title', 'Untitled')}")
        print(f"  Created: {t.get('created_at', 'unknown')}")
        print()
    return templates


def get_template_dataset(config, template_id):
    """Get the autofill dataset (fields) for a brand template."""
    print(f"  Dataset for template {template_id}:")
    result = canva_post(config, f"brand-templates/{template_id}/dataset", {})
    dataset = result.get("dataset", {})
    if not dataset:
        print("    No autofill fields found. Ensure 'Connect data' is enabled on elements.")
        return {}
    for field_name, field_info in dataset.items():
        field_type = field_info.get("type", "unknown")
        print(f"    Field: {field_name} (type: {field_type})")
    return dataset


def generate_variants(config, template_id, template_title, dataset):
    """Generate 5 autofill variants from a brand template."""
    print(f"\n  Generating 5 variants for: {template_title}")
    print(f"  Template ID: {template_id}\n")

    field_names = list(dataset.keys())
    text_fields = [f for f in field_names if dataset[f].get("type") == "text"]
    image_fields = [f for f in field_names if dataset[f].get("type") == "image"]

    created = []
    for variant in VARIANT_COPY:
        # Build the autofill data mapping
        autofill_data = {}
        for field in text_fields:
            # Match field name to variant copy (case-insensitive)
            field_lower = field.lower().replace("_", "").replace(" ", "")
            for key in ["Headline", "Subhead", "CTA"]:
                if key.lower() in field_lower:
                    autofill_data[field] = {"type": "text", "text": variant[key]}
                    break
            else:
                # Default: use headline for unmatched text fields
                autofill_data[field] = {"type": "text", "text": variant["Headline"]}

        for field in image_fields:
            autofill_data[field] = {
                "type": "image",
                "asset_id": PRODUCE_PHOTO_ASSET_ID,
            }

        title = f"Uncle Mays - {variant['name']} - {template_title}"
        request_body = {
            "brand_template_id": template_id,
            "title": title,
            "data": autofill_data,
        }

        try:
            result = canva_post(config, "autofills", request_body)
            job = result.get("job", {})
            job_id = job.get("id", "unknown")
            job_status = job.get("status", "unknown")
            print(f"    {variant['name']}: job={job_id}, status={job_status}")

            # Poll for completion (autofill is async)
            if job_id != "unknown":
                for _ in range(10):
                    time.sleep(2)
                    poll = canva_get(config, f"autofills/{job_id}")
                    poll_job = poll.get("job", {})
                    if poll_job.get("status") == "success":
                        design_id = poll_job.get("result", {}).get("design", {}).get("id")
                        print(f"      -> Design created: {design_id}")
                        created.append({"variant": variant["name"], "design_id": design_id})
                        break
                    elif poll_job.get("status") == "failed":
                        error = poll_job.get("error", {})
                        print(f"      -> FAILED: {error}")
                        break
                else:
                    print("      -> Timed out waiting for autofill job")

        except Exception as e:
            print(f"    {variant['name']}: ERROR - {e}")

    return created


def main():
    generate = "--generate" in sys.argv
    config = load_config()

    # Ensure token is fresh
    try:
        canva_get(config, "users/me")
    except Exception:
        config = refresh_token(config)

    templates = list_brand_templates(config)

    if not templates:
        print("=" * 60)
        print("SETUP REQUIRED: No brand templates found.")
        print("=" * 60)
        print()
        print("3 blank designs have been created and are ready to be")
        print("styled and published as brand templates in Canva UI:")
        print()
        print("  1. Uncle Mays - Brand Template - Instagram Post 1080x1080")
        print("     Design ID: DAHGr7UEH74")
        print()
        print("  2. Uncle Mays - Brand Template - Facebook Ad 1200x628")
        print("     Design ID: DAHGrygozEY")
        print()
        print("  3. Uncle Mays - Brand Template - Story Reel 1080x1920")
        print("     Design ID: DAHGr7F9q1Q")
        print()
        print("See scripts/canva-brand-template-setup.md for full instructions.")
        return

    # Show datasets for each template
    for template in templates:
        dataset = get_template_dataset(config, template["id"])
        if generate and dataset:
            created = generate_variants(config, template["id"], template.get("title", ""), dataset)
            print(f"\n  Created {len(created)} variants for {template.get('title')}")
            for c in created:
                print(f"    {c['variant']}: {c['design_id']}")

    if not generate:
        print("\nRun with --generate to create 5 variant designs per template.")


if __name__ == "__main__":
    main()
