#!/usr/bin/env python3
"""
Meta A/B Test Campaign Setup
Uploads 15 ad creatives and creates campaign structure in PAUSED state
"""

import json
import os
import urllib.request
import urllib.parse
from pathlib import Path

# Load Meta config
config_path = Path.home() / ".claude" / "meta-config.json"
config = json.load(open(config_path))

META_TOKEN = config["access_token"]
META_URL = config["base_url"]
AD_ACCOUNT_ID = config["ad_account_id"]

# Ad creative mapping
AD_CREATIVES = {
    "instagram_post": {
        "A": "instagram_1080x1080_variant_a.png",
        "B": "instagram_1080x1080_variant_b.png",
        "C": "instagram_1080x1080_variant_c.png",
        "D": "instagram_1080x1080_variant_d.png",
        "E": "instagram_1080x1080_variant_e.png",
    },
    "facebook_ad": {
        "A": "facebook_1200x628_variant_a.png",
        "B": "facebook_1200x628_variant_b.png",
        "C": "facebook_1200x628_variant_c.png",
        "D": "facebook_1200x628_variant_d.png",
        "E": "facebook_1200x628_variant_e.png",
    },
    "story_reel": {
        "A": "story_1080x1920_variant_a.png",
        "B": "story_1080x1920_variant_b.png",
        "C": "story_1080x1920_variant_c.png",
        "D": "story_1080x1920_variant_d.png",
        "E": "story_1080x1920_variant_e.png",
    },
}

VARIANT_HOOKS = {
    "A": "Direct Offer",
    "B": "Curiosity",
    "C": "Social Proof",
    "D": "Scarcity",
    "E": "Community",
}


def meta_post(endpoint, data):
    """POST to Meta Graph API"""
    payload = urllib.parse.urlencode(data).encode("utf-8")
    url = f"{META_URL}/{endpoint}"
    req = urllib.request.Request(url, data=payload, method="POST")
    resp = urllib.request.urlopen(req, timeout=60)
    return json.loads(resp.read())


def meta_get(endpoint, params=None):
    """GET from Meta Graph API"""
    params = params or {}
    params["access_token"] = META_TOKEN
    query = urllib.parse.urlencode(params)
    url = f"{META_URL}/{endpoint}?{query}"
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def upload_image(filepath, name):
    """Upload image to Meta ad account"""
    print(f"Uploading {name}...")

    # Read image file as bytes
    with open(filepath, "rb") as f:
        image_bytes = f.read()

    # Meta expects multipart/form-data for image uploads
    # Using AdImage hash upload method instead
    import base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    data = {
        "access_token": META_TOKEN,
        "bytes": image_b64,
        "name": name,
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/adimages", data)

    if "images" in result:
        image_hash = list(result["images"].values())[0]["hash"]
        print(f"  ✓ Uploaded: {image_hash}")
        return image_hash
    else:
        raise Exception(f"Upload failed: {result}")


def create_campaign():
    """Create campaign in PAUSED state"""
    print("\nCreating campaign...")

    data = {
        "access_token": META_TOKEN,
        "name": "Produce Box A/B Test — April 2026",
        "objective": "OUTCOME_SALES",  # Conversions objective
        "status": "PAUSED",  # CRITICAL: Start paused for board review
        "special_ad_categories": [],
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/campaigns", data)
    campaign_id = result["id"]
    print(f"  ✓ Campaign created: {campaign_id} (PAUSED)")
    return campaign_id


def create_campaign_budget(campaign_id):
    """Create campaign budget ($50/day)"""
    print("\nCreating campaign budget...")

    data = {
        "access_token": META_TOKEN,
        "name": "Produce Box A/B Test Budget",
        "budget_amount": 5000,  # $50 in cents
        "budget_type": "DAILY",
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/campaignbudgets", data)
    budget_id = result["id"]
    print(f"  ✓ Budget created: {budget_id} ($50/day)")

    # Update campaign with budget
    update_data = {
        "access_token": META_TOKEN,
        "campaign_budget_id": budget_id,
    }
    meta_post(f"{campaign_id}", update_data)

    return budget_id


def create_ad_set(campaign_id, name, format_type):
    """Create ad set with targeting"""
    print(f"\nCreating ad set: {name}...")

    # Targeting spec
    targeting = {
        "geo_locations": {
            "cities": [
                {"key": "2419718", "name": "Chicago", "region": "Illinois", "country": "US", "radius": 10, "distance_unit": "mile"}
            ]
        },
        "age_min": 25,
        "age_max": 35,
        "genders": [2],  # Women
        "flexible_spec": [
            {
                "interests": [
                    {"id": "6003139266461", "name": "Organic food"},
                    {"id": "6003107902433", "name": "Healthy diet"},
                    {"id": "6003629266685", "name": "Local business"},
                ]
            }
        ],
        "household_incomes": [
            {"id": "6009072173983"}  # $50K+ household income
        ],
    }

    data = {
        "access_token": META_TOKEN,
        "name": name,
        "campaign_id": campaign_id,
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "billing_event": "IMPRESSIONS",
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
        "daily_budget": 1667,  # $16.67 in cents
        "status": "PAUSED",
        "targeting": json.dumps(targeting),
        "promoted_object": json.dumps({
            "pixel_id": "YOUR_PIXEL_ID",  # TODO: Get actual pixel ID
            "custom_event_type": "PURCHASE",
        }),
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/adsets", data)
    adset_id = result["id"]
    print(f"  ✓ Ad set created: {adset_id}")
    return adset_id


def create_ad_creative(adset_id, image_hash, variant, format_type, hook):
    """Create ad creative"""
    print(f"  Creating ad creative: {format_type} - Variant {variant} ({hook})...")

    # UTM parameters
    utm_params = {
        "utm_source": "meta",
        "utm_medium": "paid_social",
        "utm_campaign": "produce_box_ab_test",
        "utm_content": f"{format_type.lower().replace(' ', '_')}_{hook.lower().replace(' ', '_')}",
    }

    link = f"https://unclemays.com?{urllib.parse.urlencode(utm_params)}"

    # Ad copy (customize per hook)
    copy_variants = {
        "Direct Offer": "Fresh produce boxes delivered to Hyde Park. $30 for your first order. 🥬",
        "Curiosity": "What's in the box? Discover fresh, local produce curated for Hyde Park. Order now. 🥕",
        "Social Proof": "Join 97% of Hyde Park residents who trust Uncle May's for fresh produce. Order today. 🌽",
        "Scarcity": "Limited slots available this week. Reserve your fresh produce box now. ⏰",
        "Community": "Fresh produce for us, by us. Supporting Black-owned local food in Hyde Park. 🙌",
    }

    message = copy_variants.get(hook, "Fresh produce delivered to your door.")

    object_story_spec = {
        "page_id": "YOUR_PAGE_ID",  # TODO: Get actual page ID
        "link_data": {
            "image_hash": image_hash,
            "link": link,
            "message": message,
            "call_to_action": {
                "type": "SHOP_NOW",
            },
        },
    }

    data = {
        "access_token": META_TOKEN,
        "name": f"{format_type} - Variant {variant} ({hook})",
        "object_story_spec": json.dumps(object_story_spec),
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/adcreatives", data)
    creative_id = result["id"]
    print(f"    ✓ Creative created: {creative_id}")
    return creative_id


def create_ad(adset_id, creative_id, name):
    """Create ad"""
    data = {
        "access_token": META_TOKEN,
        "name": name,
        "adset_id": adset_id,
        "creative": json.dumps({"creative_id": creative_id}),
        "status": "PAUSED",
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/ads", data)
    ad_id = result["id"]
    print(f"    ✓ Ad created: {ad_id}")
    return ad_id


def main():
    """Main setup flow"""
    print("=" * 60)
    print("META A/B TEST CAMPAIGN SETUP")
    print("=" * 60)

    # Step 1: Upload all images
    print("\n[1/4] UPLOADING AD CREATIVES")
    print("-" * 60)

    image_hashes = {}
    current_dir = Path(__file__).parent

    for format_type, variants in AD_CREATIVES.items():
        image_hashes[format_type] = {}
        for variant, filename in variants.items():
            filepath = current_dir / filename
            name = f"{format_type}_{variant}_{VARIANT_HOOKS[variant]}"
            try:
                hash_val = upload_image(filepath, name)
                image_hashes[format_type][variant] = hash_val
            except Exception as e:
                print(f"  ✗ Error uploading {filename}: {e}")
                return

    # Step 2: Create campaign
    print("\n[2/4] CREATING CAMPAIGN STRUCTURE")
    print("-" * 60)

    campaign_id = create_campaign()
    budget_id = create_campaign_budget(campaign_id)

    # Step 3: Create ad sets
    print("\n[3/4] CREATING AD SETS")
    print("-" * 60)

    adset_ids = {}
    adset_names = {
        "instagram_post": "Instagram Post 1080x1080",
        "facebook_ad": "Facebook Ad 1200x628",
        "story_reel": "Story/Reel 1080x1920",
    }

    for format_type, name in adset_names.items():
        adset_id = create_ad_set(campaign_id, name, format_type)
        adset_ids[format_type] = adset_id

    # Step 4: Create ads
    print("\n[4/4] CREATING ADS (15 total)")
    print("-" * 60)

    ad_ids = []
    for format_type in AD_CREATIVES.keys():
        adset_id = adset_ids[format_type]
        for variant in ["A", "B", "C", "D", "E"]:
            image_hash = image_hashes[format_type][variant]
            hook = VARIANT_HOOKS[variant]

            creative_id = create_ad_creative(adset_id, image_hash, variant, adset_names[format_type], hook)
            ad_name = f"{adset_names[format_type]} - Variant {variant} ({hook})"
            ad_id = create_ad(adset_id, creative_id, ad_name)

            ad_ids.append(ad_id)

    # Summary
    print("\n" + "=" * 60)
    print("✅ SETUP COMPLETE")
    print("=" * 60)
    print(f"Campaign ID: {campaign_id}")
    print(f"Budget: $50/day (${350} for 7 days)")
    print(f"Ad Sets: 3")
    print(f"Ads: {len(ad_ids)}")
    print(f"Status: PAUSED (requires CRO activation)")
    print("\nNext steps:")
    print("1. Review campaign structure in Meta Ads Manager")
    print("2. Verify targeting, budget, and creatives")
    print("3. Activate campaign tomorrow (2026-04-14) at 9am CST")
    print("=" * 60)

    # Save metadata
    metadata = {
        "campaign_id": campaign_id,
        "budget_id": budget_id,
        "adset_ids": adset_ids,
        "ad_ids": ad_ids,
        "image_hashes": image_hashes,
        "created_at": "2026-04-13",
        "status": "PAUSED",
        "scheduled_start": "2026-04-14 09:00:00 CST",
    }

    with open(current_dir / "campaign-metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nMetadata saved to campaign-metadata.json")


if __name__ == "__main__":
    main()
