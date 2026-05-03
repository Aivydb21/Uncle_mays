#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload 10 static images to Meta Ads account for subscription launch campaign.
Uses Meta Marketing API to upload images to ad account asset library.
"""

import json
import os
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
AD_ACCOUNT_ID = config["ad_account_id"]  # act_814877604473301
BASE_URL = config["base_url"]  # https://graph.facebook.com/v21.0

# Image directory
IMAGE_DIR = Path.home() / "Desktop" / "business" / "ad-exports" / "subscription-launch-apr17" / "static-images"

# Meta images to upload (5 Feed + 5 Stories)
META_IMAGES = [
    "meta_feed_chicago_families_1080x1080.png",
    "meta_feed_farm_to_table_1080x1080.png",
    "meta_feed_grandmas_greens_1080x1080.png",
    "meta_feed_whats_in_box_1080x1080.png",
    "meta_feed_zero_hassle_1080x1080.png",
    "meta_story_blackowned_1080x1920.png",
    "meta_story_convenience_1080x1920.png",
    "meta_story_cultural_1080x1920.png",
    "meta_story_offer_1080x1920.png",
    "meta_story_subscription_value_1080x1920.png",
]


def upload_image(image_path: Path) -> dict:
    """Upload a single image to Meta ad account."""
    url = f"{BASE_URL}/{AD_ACCOUNT_ID}/adimages"

    with open(image_path, "rb") as f:
        files = {"file": (image_path.name, f, "image/png")}
        params = {"access_token": ACCESS_TOKEN}

        response = requests.post(url, params=params, files=files)
        response.raise_for_status()

    return response.json()


def main():
    print("=" * 70)
    print("Meta Static Images Upload — Subscription Launch Apr 2026")
    print("=" * 70)
    print()

    uploaded = []
    failed = []

    for image_name in META_IMAGES:
        image_path = IMAGE_DIR / image_name

        if not image_path.exists():
            print(f"MISSING: {image_name}")
            failed.append(image_name)
            continue

        try:
            result = upload_image(image_path)

            # Meta response format: {"images": {"filename": {"hash": "...", "url": "..."}}}
            # The key might be with or without .png extension
            image_key = image_name.replace(".png", "")
            if "images" in result:
                # Try both with and without extension
                if image_key in result["images"]:
                    image_hash = result["images"][image_key]["hash"]
                elif image_name in result["images"]:
                    image_hash = result["images"][image_name]["hash"]
                else:
                    # Take first result
                    first_key = list(result["images"].keys())[0]
                    image_hash = result["images"][first_key]["hash"]
            else:
                raise ValueError(f"Unexpected response format: {result}")

            print(f"OK {image_name}")
            print(f"   Hash: {image_hash}")
            print()

            uploaded.append({
                "filename": image_name,
                "hash": image_hash,
                "path": str(image_path),
            })

        except Exception as e:
            print(f"FAIL {image_name}")
            print(f"   Error: {e}")
            print()
            failed.append(image_name)

    # Summary
    print("=" * 70)
    print(f"Uploaded: {len(uploaded)}/10")
    print(f"Failed: {len(failed)}/10")
    print("=" * 70)

    # Save results
    results_file = Path.home() / "Desktop" / "business" / "meta-static-images-uploaded.json"
    with open(results_file, "w") as f:
        json.dump({
            "uploaded": uploaded,
            "failed": failed,
            "total": len(META_IMAGES),
            "success_count": len(uploaded),
            "timestamp": "2026-04-17",
        }, f, indent=2)

    print()
    print(f"Results saved to: {results_file}")
    print()

    if failed:
        print("WARNING: Some images failed to upload. Review errors above.")
        sys.exit(1)
    else:
        print("SUCCESS: All 10 static images uploaded successfully!")
        print()
        print("Next steps:")
        print("1. Create ads using these image hashes")
        print("2. Add to existing ad sets (Instagram Feed, Instagram Stories, Facebook Feed)")
        print("3. Use same copy as video ads for consistency")
        sys.exit(0)


if __name__ == "__main__":
    main()
