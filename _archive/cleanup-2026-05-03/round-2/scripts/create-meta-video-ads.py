#!/usr/bin/env python3
"""
Create Meta video ads linking uploaded videos to ad sets
"""

import json
import os
import sys
import urllib.request
import urllib.parse

# Load Meta config
config_path = os.path.expanduser("~/.claude/meta-config.json")
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]
AD_ACCOUNT_ID = config["ad_account_id"]
BASE_URL = "https://graph.facebook.com/v21.0"

# Uploaded video IDs
VIDEO_IDS = [
    "1437672617665607",
    "2355242318591638"
]

# Ad sets to create ads for
AD_SETS = [
    {"name": "Instagram Feed", "id": "120243219914430762"},
    {"name": "Instagram Stories", "id": "120243219918030762"},
    {"name": "Facebook Feed", "id": "120243219919870762"}
]

# Ad copy
AD_TITLE = "Fresh Produce Delivered Weekly"
AD_MESSAGE = "Get farm-fresh produce boxes delivered to your door every week. Support local farmers and eat healthier. Join our community today!"
CTA_LINK = "https://unclemays.com/products/weekly-produce-box?utm_source=facebook&utm_medium=video&utm_campaign=subscription_launch_apr2026"

def create_ad(ad_set, video_id, video_index):
    """Create an ad with video creative"""
    ad_set_id = ad_set["id"]
    ad_set_name = ad_set["name"]

    print(f"\nCreating ad for {ad_set_name} with Video {video_index + 1}...")

    # Create ad directly with inline creative
    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/ads"

    creative = {
        "object_story_spec": {
            "video_data": {
                "video_id": video_id,
                "title": AD_TITLE,
                "message": AD_MESSAGE,
                "call_to_action": {
                    "type": "SHOP_NOW",
                    "value": {
                        "link": CTA_LINK
                    }
                }
            }
        }
    }

    params = {
        "name": f"Subscription Launch - {ad_set_name} - Video {video_index + 1}",
        "adset_id": ad_set_id,
        "creative": creative,
        "status": "PAUSED",
        "access_token": ACCESS_TOKEN
    }

    data = json.dumps(params).encode()

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "curl/8.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            ad_id = result.get("id")
            print(f"  SUCCESS! Ad ID: {ad_id}")
            return ad_id
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR: {e.code}")
        print(f"  {error_body}")

        # Try alternative format
        if "page" in error_body.lower() or "instagram" in error_body.lower():
            print(f"\n  Trying alternative format without page requirement...")
            return create_ad_alternative(ad_set, video_id, video_index)

        return None

def create_ad_alternative(ad_set, video_id, video_index):
    """Create ad using link format instead of page format"""
    ad_set_id = ad_set["id"]
    ad_set_name = ad_set["name"]

    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/ads"

    # Use link_data instead of video_data for page-less ads
    creative = {
        "object_story_spec": {
            "link_data": {
                "video_id": video_id,
                "link": CTA_LINK,
                "message": AD_MESSAGE,
                "name": AD_TITLE,
                "call_to_action": {
                    "type": "SHOP_NOW",
                    "value": {
                        "link": CTA_LINK
                    }
                }
            }
        }
    }

    params = {
        "name": f"Subscription Launch - {ad_set_name} - Video {video_index + 1}",
        "adset_id": ad_set_id,
        "creative": creative,
        "status": "PAUSED",
        "access_token": ACCESS_TOKEN
    }

    data = json.dumps(params).encode()

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "curl/8.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            ad_id = result.get("id")
            print(f"  SUCCESS (alternative format)! Ad ID: {ad_id}")
            return ad_id
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ALTERNATIVE ALSO FAILED: {e.code}")
        print(f"  {error_body}")
        return None

def main():
    print("=" * 70)
    print("Creating Meta Video Ads")
    print("=" * 70)
    print(f"\nVideo IDs: {VIDEO_IDS}")
    print(f"Ad Sets: {[a['name'] for a in AD_SETS]}")

    created_ads = []

    # Create 2 ads per ad set (one for each video)
    for ad_set in AD_SETS:
        for i, video_id in enumerate(VIDEO_IDS):
            ad_id = create_ad(ad_set, video_id, i)
            if ad_id:
                created_ads.append({
                    "ad_set": ad_set["name"],
                    "video_index": i + 1,
                    "ad_id": ad_id
                })

    print(f"\n" + "=" * 70)
    print(f"Summary")
    print("=" * 70)
    print(f"Created {len(created_ads)} ads:")
    for ad in created_ads:
        print(f"  - {ad['ad_set']} / Video {ad['video_index']}: {ad['ad_id']}")

    if len(created_ads) < len(AD_SETS) * len(VIDEO_IDS):
        print(f"\n! Some ads failed to create - see errors above")
        print(f"\nManual workaround:")
        print(f"1. Go to Meta Ads Manager: https://business.facebook.com/adsmanager")
        print(f"2. Navigate to campaign 120243219649250762")
        print(f"3. For each ad set, create ads manually using video IDs:")
        for i, video_id in enumerate(VIDEO_IDS):
            print(f"   - Video {i + 1}: {video_id}")

    # Save results
    results = {
        "campaign_id": "120243219649250762",
        "video_ids": VIDEO_IDS,
        "ads": created_ads
    }

    with open("meta-video-ads-results.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: meta-video-ads-results.json")

if __name__ == "__main__":
    main()
