#!/usr/bin/env python3
"""
Launch Meta campaign for subscription - PRODUCTION VERSION.
Creates complete campaign structure with 3 ad sets for different placements.
"""

import json
import os
import sys
import urllib.request
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
EXISTING_CAMPAIGN_ID = "120243219649250762"
CAMPAIGN_NAME = "Subscription Launch Apr 2026"

def meta_api_call(endpoint, method="POST", params=None):
    """Make a call to the Meta Marketing API."""
    url = f"{BASE_URL}/{endpoint}?access_token={ACCESS_TOKEN}"

    headers = {"Content-Type": "application/json"}
    payload = json.dumps(params).encode("utf-8") if params else None

    req = urllib.request.Request(url, data=payload, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as e:
        print(f"API Error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        raise


def create_ad_set(campaign_id, name, placement_type):
    """Create an ad set with placement-specific configuration."""
    print(f"Creating ad set: {name}")

    # Base targeting
    targeting = {
        "geo_locations": {
            "cities": [{
                "key": "2490299",  # Chicago
                "radius": 25,
                "distance_unit": "mile"
            }]
        },
        "age_min": 25,
        "age_max": 35,
        "genders": [2],  # Women
        "targeting_automation": {
            "advantage_audience": 0  # Strict targeting
        }
    }

    # Placement-specific configurations
    placements_config = {
        "instagram_feed": {
            "publisher_platforms": ["instagram"],
            "instagram_positions": ["stream"]
        },
        "instagram_stories": {
            "publisher_platforms": ["instagram"],
            "instagram_positions": ["story"]
        },
        "facebook_feed": {
            "publisher_platforms": ["facebook"],
            "facebook_positions": ["feed"]
        }
    }

    params = {
        "name": name,
        "campaign_id": campaign_id,
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "billing_event": "IMPRESSIONS",
        "bid_amount": 200,  # $2.00 bid cap
        "status": "PAUSED",
        "targeting": targeting,
        "promoted_object": {
            "pixel_id": PIXEL_ID,
            "custom_event_type": "PURCHASE"
        },
        **placements_config[placement_type]
    }

    endpoint = f"{AD_ACCOUNT_ID}/adsets"
    result = meta_api_call(endpoint, params=params)
    ad_set_id = result["id"]

    print(f"  [OK] Ad set created: {ad_set_id}")
    return ad_set_id


def main():
    print("="*70)
    print("Meta Campaign Launch - PRODUCTION")
    print("="*70)
    print()

    try:
        campaign_id = EXISTING_CAMPAIGN_ID
        print(f"Using existing campaign: {campaign_id}")
        print(f"Campaign name: {CAMPAIGN_NAME}")
        print()

        # Create 3 ad sets
        print("Creating ad sets for different placements...")
        print()

        ad_sets = {}

        # Instagram Feed
        ad_sets["ig_feed"] = create_ad_set(
            campaign_id,
            "IG Feed - Women 25-35 - Hyde Park",
            "instagram_feed"
        )

        # Instagram Stories
        ad_sets["ig_stories"] = create_ad_set(
            campaign_id,
            "IG Stories - Women 25-35 - Hyde Park",
            "instagram_stories"
        )

        # Facebook Feed
        ad_sets["fb_feed"] = create_ad_set(
            campaign_id,
            "FB Feed - Women 25-35 - Hyde Park",
            "facebook_feed"
        )

        print()
        print("="*70)
        print("[SUCCESS] Meta campaign structure complete!")
        print("="*70)
        print()
        print(f"Campaign ID: {campaign_id}")
        print(f"Campaign name: {CAMPAIGN_NAME}")
        print(f"Status: PAUSED")
        print(f"Budget: $67/day")
        print()
        print("Ad Sets created:")
        for name, ad_set_id in ad_sets.items():
            print(f"  - {name}: {ad_set_id}")
        print()
        print("="*70)
        print("NEXT STEPS - Image Upload & Ad Creation")
        print("="*70)
        print()
        print("Image upload requires multipart/form-data which is complex with urllib.")
        print("You have two options:")
        print()
        print("OPTION A: Manual upload via Meta Ads Manager (15-20 min)")
        print("  1. Go to: https://business.facebook.com/adsmanager")
        print(f"  2. Find campaign: {campaign_id}")
        print("  3. Upload 10 static images (5 Feed 1080x1080 + 5 Stories 1080x1920)")
        print("     Location: ad-exports/subscription-launch-apr17/static-images/")
        print("  4. Create ads linking images to ad sets")
        print("  5. Activate campaign when ready")
        print()
        print("OPTION B: Python requests library (15 min setup + 10 min upload)")
        print("  1. Install: pip install requests")
        print("  2. I'll create upload script using requests library")
        print("  3. Run script to upload images and create ads")
        print()
        print("VIDEO COMPRESSION REMINDER:")
        print("  Videos are 29-82MB (Meta limit: 4MB)")
        print("  Compression guide: VIDEO-COMPRESSION-WORKFLOW-APR17.md")
        print()
        print("="*70)

        # Save campaign details
        output = {
            "campaign_id": campaign_id,
            "campaign_name": CAMPAIGN_NAME,
            "ad_sets": ad_sets,
            "status": "PAUSED",
            "created_at": datetime.now().isoformat(),
            "next_steps": [
                "Upload 10 static images via UI or API",
                "Create ads",
                "Compress videos to <4MB",
                "Get board approval",
                "Activate campaign"
            ]
        }

        output_path = Path.home() / "Desktop" / "business" / "meta-campaign-complete.json"
        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)

        print(f"Campaign details saved: {output_path}")
        print()

        return 0

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
