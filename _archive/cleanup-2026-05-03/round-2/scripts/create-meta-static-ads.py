#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create 15 static image ads for Meta campaign.
- 5 Feed images for Instagram Feed ad set
- 5 Story images for Instagram Stories ad set
- 5 Feed images for Facebook Feed ad set
"""

import json
import sys
from pathlib import Path
import requests

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Load Meta config
config_path = Path.home() / ".claude" / "meta-config.json"
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]
AD_ACCOUNT_ID = config["ad_account_id"]
BASE_URL = config["base_url"]
PAGE_ID = "755316477673748"  # Uncle May's Produce Facebook Page

# Load uploaded image hashes
images_file = Path.home() / "Desktop" / "business" / "meta-static-images-uploaded.json"
with open(images_file) as f:
    images_data = json.load(f)

# Create hash lookup
IMAGE_HASHES = {img["filename"]: img["hash"] for img in images_data["uploaded"]}

# Ad Sets (from META-CAMPAIGN-STATUS-APR17.md)
AD_SETS = {
    "instagram_feed": "120243219914430762",
    "instagram_stories": "120243219918030762",
    "facebook_feed": "120243219919870762",
}

# Ad creative copy (consistent with video ads)
AD_COPY = {
    "primary_text": "Get farm-fresh produce boxes delivered to your door every week. Support local farmers and eat healthier. Join our community today!",
    "headline": "Fresh Produce Delivered Weekly",
    "description": "Fresh, locally-sourced produce from Chicago-area farms",
    "link": "https://unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=image&utm_campaign=subscription_launch_apr2026",
    "call_to_action": "SHOP_NOW",
}

# Feed images (1080x1080) for Instagram Feed and Facebook Feed
FEED_IMAGES = [
    "meta_feed_chicago_families_1080x1080.png",
    "meta_feed_farm_to_table_1080x1080.png",
    "meta_feed_grandmas_greens_1080x1080.png",
    "meta_feed_whats_in_box_1080x1080.png",
    "meta_feed_zero_hassle_1080x1080.png",
]

# Story images (1080x1920) for Instagram Stories
STORY_IMAGES = [
    "meta_story_blackowned_1080x1920.png",
    "meta_story_convenience_1080x1920.png",
    "meta_story_cultural_1080x1920.png",
    "meta_story_offer_1080x1920.png",
    "meta_story_subscription_value_1080x1920.png",
]


def create_image_creative(image_hash: str, name: str) -> str:
    """Create ad creative with static image."""
    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/adcreatives"

    payload = {
        "access_token": ACCESS_TOKEN,
        "name": name,
        "object_story_spec": {
            "page_id": PAGE_ID,
            "link_data": {
                "image_hash": image_hash,
                "link": AD_COPY["link"],
                "message": AD_COPY["primary_text"],
                "name": AD_COPY["headline"],
                "description": AD_COPY["description"],
                "call_to_action": {
                    "type": AD_COPY["call_to_action"],
                    "value": {"link": AD_COPY["link"]},
                },
            },
        },
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()["id"]


def create_ad(ad_set_id: str, creative_id: str, name: str) -> dict:
    """Create ad in ad set using creative."""
    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/ads"

    payload = {
        "access_token": ACCESS_TOKEN,
        "name": name,
        "adset_id": ad_set_id,
        "creative": {"creative_id": creative_id},
        "status": "ACTIVE",  # Campaign is PAUSED, so ads can be ACTIVE
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()


def main():
    print("=" * 70)
    print("Creating Meta Static Image Ads — Subscription Launch Apr 2026")
    print("=" * 70)
    print()

    created_ads = []

    # 1. Instagram Feed — 5 feed images
    print("Instagram Feed Ad Set (5 feed images):")
    print("-" * 70)
    for i, image_filename in enumerate(FEED_IMAGES, 1):
        try:
            image_hash = IMAGE_HASHES[image_filename]
            creative_name = f"IG Feed Static {i} - {image_filename.split('_')[2]}"
            ad_name = f"Instagram Feed - Static Image {i}"

            # Create creative
            creative_id = create_image_creative(image_hash, creative_name)

            # Create ad
            ad_result = create_ad(AD_SETS["instagram_feed"], creative_id, ad_name)

            print(f"  OK {ad_name}")
            print(f"     Ad ID: {ad_result['id']}")
            print(f"     Creative ID: {creative_id}")
            print()

            created_ads.append({
                "ad_set": "instagram_feed",
                "ad_name": ad_name,
                "ad_id": ad_result["id"],
                "creative_id": creative_id,
                "image_hash": image_hash,
                "image_filename": image_filename,
            })

        except Exception as e:
            print(f"  FAIL {image_filename}: {e}")
            print()

    # 2. Instagram Stories — 5 story images
    print("Instagram Stories Ad Set (5 story images):")
    print("-" * 70)
    for i, image_filename in enumerate(STORY_IMAGES, 1):
        try:
            image_hash = IMAGE_HASHES[image_filename]
            creative_name = f"IG Stories Static {i} - {image_filename.split('_')[2]}"
            ad_name = f"Instagram Stories - Static Image {i}"

            creative_id = create_image_creative(image_hash, creative_name)
            ad_result = create_ad(AD_SETS["instagram_stories"], creative_id, ad_name)

            print(f"  OK {ad_name}")
            print(f"     Ad ID: {ad_result['id']}")
            print(f"     Creative ID: {creative_id}")
            print()

            created_ads.append({
                "ad_set": "instagram_stories",
                "ad_name": ad_name,
                "ad_id": ad_result["id"],
                "creative_id": creative_id,
                "image_hash": image_hash,
                "image_filename": image_filename,
            })

        except Exception as e:
            print(f"  FAIL {image_filename}: {e}")
            print()

    # 3. Facebook Feed — 5 feed images
    print("Facebook Feed Ad Set (5 feed images):")
    print("-" * 70)
    for i, image_filename in enumerate(FEED_IMAGES, 1):
        try:
            image_hash = IMAGE_HASHES[image_filename]
            creative_name = f"FB Feed Static {i} - {image_filename.split('_')[2]}"
            ad_name = f"Facebook Feed - Static Image {i}"

            creative_id = create_image_creative(image_hash, creative_name)
            ad_result = create_ad(AD_SETS["facebook_feed"], creative_id, ad_name)

            print(f"  OK {ad_name}")
            print(f"     Ad ID: {ad_result['id']}")
            print(f"     Creative ID: {creative_id}")
            print()

            created_ads.append({
                "ad_set": "facebook_feed",
                "ad_name": ad_name,
                "ad_id": ad_result["id"],
                "creative_id": creative_id,
                "image_hash": image_hash,
                "image_filename": image_filename,
            })

        except Exception as e:
            print(f"  FAIL {image_filename}: {e}")
            print()

    # Summary
    print("=" * 70)
    print(f"Created: {len(created_ads)}/15 static image ads")
    print("=" * 70)
    print()

    # Save results
    results_file = Path.home() / "Desktop" / "business" / "meta-static-ads-created.json"
    with open(results_file, "w") as f:
        json.dump({
            "ads": created_ads,
            "total": 15,
            "created_count": len(created_ads),
            "timestamp": "2026-04-17",
        }, f, indent=2)

    print(f"Results saved to: {results_file}")
    print()

    if len(created_ads) == 15:
        print("SUCCESS: All 15 static image ads created!")
        print()
        print("Campaign now has:")
        print("  - 6 video ads (2 per ad set)")
        print("  - 15 static image ads (5 per ad set)")
        print("  - Total: 21 ads across 3 ad sets")
        print()
        print("Campaign is ready to activate (currently PAUSED).")
    else:
        print(f"WARNING: Only created {len(created_ads)}/15 ads. Review errors above.")


if __name__ == "__main__":
    main()
