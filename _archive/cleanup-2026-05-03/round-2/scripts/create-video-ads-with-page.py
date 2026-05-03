#!/usr/bin/env python3
"""
Create Meta video ads with Facebook Page ID
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
PAGE_ID = "755316477673748"  # Uncle May's Facebook Page
THUMBNAIL_HASH = "7aef798892a38251a52c4e3f72716993"  # Uploaded thumbnail image

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

    # Step 1: Create ad creative
    creative_url = f"{BASE_URL}/{AD_ACCOUNT_ID}/adcreatives"

    creative_spec = {
        "name": f"Subscription Launch - {ad_set_name} - Video {video_index + 1}",
        "object_story_spec": {
            "page_id": PAGE_ID,
            "video_data": {
                "video_id": video_id,
                "image_hash": THUMBNAIL_HASH,
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

    params = urllib.parse.urlencode({
        "access_token": ACCESS_TOKEN,
        **{k: json.dumps(v) if isinstance(v, dict) else v for k, v in creative_spec.items()}
    })

    req = urllib.request.Request(
        f"{creative_url}?{params}",
        method="POST"
    )
    req.add_header("User-Agent", "curl/8.0")

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            creative_id = result.get("id")
            print(f"  Creative created: {creative_id}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR creating creative: {e.code}")
        print(f"  {error_body}")
        return None

    # Step 2: Create ad using the creative
    ads_url = f"{BASE_URL}/{AD_ACCOUNT_ID}/ads"

    ad_params = urllib.parse.urlencode({
        "name": f"Subscription Launch - {ad_set_name} - Video {video_index + 1}",
        "adset_id": ad_set_id,
        "creative": json.dumps({"creative_id": creative_id}),
        "status": "PAUSED",
        "access_token": ACCESS_TOKEN
    })

    req = urllib.request.Request(
        f"{ads_url}?{ad_params}",
        method="POST"
    )
    req.add_header("User-Agent", "curl/8.0")

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            ad_id = result.get("id")
            print(f"  Ad created: {ad_id}")
            print(f"  SUCCESS!")
            return {
                "ad_id": ad_id,
                "creative_id": creative_id
            }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR creating ad: {e.code}")
        print(f"  {error_body}")
        return None

def main():
    print("=" * 70)
    print("Creating Meta Video Ads with Page ID")
    print("=" * 70)
    print(f"\nPage ID: {PAGE_ID}")
    print(f"Video IDs: {VIDEO_IDS}")
    print(f"Ad Sets: {[a['name'] for a in AD_SETS]}")

    created_ads = []

    # Create 2 ads per ad set (one for each video)
    for ad_set in AD_SETS:
        for i, video_id in enumerate(VIDEO_IDS):
            result = create_ad(ad_set, video_id, i)
            if result:
                created_ads.append({
                    "ad_set": ad_set["name"],
                    "ad_set_id": ad_set["id"],
                    "video_index": i + 1,
                    "video_id": video_id,
                    "ad_id": result["ad_id"],
                    "creative_id": result["creative_id"]
                })

    print(f"\n" + "=" * 70)
    print(f"Summary")
    print("=" * 70)
    print(f"Created {len(created_ads)}/{len(AD_SETS) * len(VIDEO_IDS)} ads successfully:")
    for ad in created_ads:
        print(f"  - {ad['ad_set']} / Video {ad['video_index']}: Ad {ad['ad_id']}")

    # Save results
    results = {
        "campaign_id": "120243219649250762",
        "page_id": PAGE_ID,
        "video_ids": VIDEO_IDS,
        "ads": created_ads,
        "total_created": len(created_ads),
        "total_expected": len(AD_SETS) * len(VIDEO_IDS)
    }

    with open("meta-video-ads-results.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: meta-video-ads-results.json")

    if len(created_ads) == len(AD_SETS) * len(VIDEO_IDS):
        print(f"\nSUCCESS! All ads created and set to PAUSED status.")
        print(f"\nNext steps:")
        print(f"1. Review ads in Meta Ads Manager")
        print(f"2. Request board approval for activation")
        print(f"3. Activate campaign when approved")
    else:
        print(f"\nWARNING: Some ads failed to create. Check errors above.")

if __name__ == "__main__":
    main()
