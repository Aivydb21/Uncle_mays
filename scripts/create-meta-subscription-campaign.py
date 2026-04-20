#!/usr/bin/env python3
"""
Create Meta (Facebook/Instagram) campaign for subscription launch.
Uses static images from ad-exports/subscription-launch-apr17/

Creates campaign in PAUSED status per governance rules.
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
from datetime import datetime

# Load Meta config
config_path = os.path.expanduser("~/.claude/meta-config.json")
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]
AD_ACCOUNT_ID = config["ad_account_id"]
BASE_URL = config["base_url"]
PIXEL_ID = "2276705169443313"

# Campaign settings
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M")
CAMPAIGN_NAME = f"Subscription Launch Apr 2026"
DAILY_BUDGET = 6700  # $67/day in cents
BASE_DESTINATION_URL = "https://unclemays.com"

# Asset locations
BUSINESS_DIR = Path.home() / "Desktop" / "business"
ASSETS_DIR = BUSINESS_DIR / "ad-exports" / "subscription-launch-apr17" / "static-images"


def meta_api_call(endpoint, method="POST", data=None):
    """Make a call to the Meta Marketing API."""
    url = f"{BASE_URL}/{endpoint}"

    # Add access token to data
    if data is None:
        data = {}
    data["access_token"] = ACCESS_TOKEN

    # Encode data
    payload = urllib.parse.urlencode(data).encode("utf-8") if data else None

    req = urllib.request.Request(url, data=payload, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as e:
        print(f"API Error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        raise


def create_campaign():
    """Create the main campaign."""
    print(f"Creating campaign: {CAMPAIGN_NAME}")

    endpoint = f"{AD_ACCOUNT_ID}/campaigns"
    data = {
        "name": CAMPAIGN_NAME,
        "objective": "OUTCOME_SALES",
        "status": "PAUSED",  # Per governance
        "special_ad_categories": "[]",
        "daily_budget": DAILY_BUDGET,
    }

    result = meta_api_call(endpoint, data=data)
    campaign_id = result["id"]

    print(f"  [OK] Campaign created: {campaign_id}")
    return campaign_id


def create_ad_set(campaign_id, name, placement_type):
    """Create an ad set for a specific placement."""
    print(f"Creating ad set: {name}")

    # Targeting (from creative brief)
    targeting = {
        "geo_locations": {
            "custom_locations": [{
                "latitude": 41.7943,
                "longitude": -87.5907,
                "radius": 25,
                "distance_unit": "mile"
            }]
        },
        "age_min": 25,
        "age_max": 35,
        "genders": [2],  # Women
        "flexible_spec": json.dumps([{
            "interests": [
                {"id": "6003139266461", "name": "Healthy eating"},
                {"id": "6003107902433", "name": "Organic food"}
            ]
        }])
    }

    # Publisher platforms
    if placement_type == "instagram_feed":
        publisher_platforms = ["instagram"]
        instagram_positions = ["stream"]
        facebook_positions = None
    elif placement_type == "instagram_stories":
        publisher_platforms = ["instagram"]
        instagram_positions = ["story"]
        facebook_positions = None
    else:  # facebook_feed
        publisher_platforms = ["facebook"]
        instagram_positions = None
        facebook_positions = ["feed"]

    endpoint = f"{AD_ACCOUNT_ID}/adsets"
    data = {
        "name": name,
        "campaign_id": campaign_id,
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "billing_event": "IMPRESSIONS",
        "status": "PAUSED",
        "targeting": json.dumps(targeting),
        "promoted_object": json.dumps({
            "pixel_id": PIXEL_ID,
            "custom_event_type": "PURCHASE"
        }),
    }

    if instagram_positions:
        data["instagram_positions"] = json.dumps(instagram_positions)
    if facebook_positions:
        data["facebook_positions"] = json.dumps(facebook_positions)

    result = meta_api_call(endpoint, data=data)
    ad_set_id = result["id"]

    print(f"  [OK] Ad set created: {ad_set_id}")
    return ad_set_id


def main():
    print("="*70)
    print("Meta Campaign Setup - Subscription Launch")
    print("="*70)
    print()

    try:
        # Step 1: Create campaign
        campaign_id = create_campaign()
        print()

        # Step 2: Create ad sets
        print("Creating ad sets...")
        ad_sets = {
            "ig_feed": create_ad_set(campaign_id, "IG Feed - Women 25-35 - Hyde Park", "instagram_feed"),
            "ig_stories": create_ad_set(campaign_id, "IG Stories - Women 25-35 - Hyde Park", "instagram_stories"),
            "fb_feed": create_ad_set(campaign_id, "FB Feed - Women 25-35 - Hyde Park", "facebook_feed"),
        }
        print()

        # Note: Image upload and ad creation requires multipart/form-data
        # This is complex with urllib - would need requests library or manual UI upload

        print("="*70)
        print("[OK] Meta campaign structure created!")
        print("="*70)
        print(f"Campaign ID: {campaign_id}")
        print(f"Status: PAUSED (per governance)")
        print()
        print("Ad Sets created:")
        for name, ad_set_id in ad_sets.items():
            print(f"  - {name}: {ad_set_id}")
        print()
        print("Next steps:")
        print("1. Upload 10 static images (5 Feed + 5 Stories) via Meta Ads Manager UI")
        print("2. Create ads linking images to ad sets")
        print("3. Compress and upload videos after manual compression")
        print("4. Get board approval")
        print("5. Activate campaign")
        print("="*70)

        # Save campaign details
        output = {
            "campaign_id": campaign_id,
            "campaign_name": CAMPAIGN_NAME,
            "ad_sets": ad_sets,
            "status": "PAUSED",
            "created_at": datetime.now().isoformat(),
            "next_steps": [
                "Upload images via UI",
                "Create ads",
                "Compress videos to <4MB",
                "Get approval",
                "Activate"
            ]
        }

        output_path = BUSINESS_DIR / "meta-campaign-created.json"
        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)

        print(f"\nCampaign details saved to: {output_path}")

        return 0

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
