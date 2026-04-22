#!/usr/bin/env python3
"""
Produce 25 static ad images for subscription launch using Canva API.
Campaign: Uncle May's Produce Box Subscription Launch (Apr 17, 2026)
"""

import json
import os
import sys
import time
import requests
from pathlib import Path

# Load Canva config
CONFIG_PATH = Path.home() / ".claude" / "canva-config.json"
with open(CONFIG_PATH) as f:
    config = json.load(f)

BASE_URL = config["base_url"]
ACCESS_TOKEN = config["access_token"]
REFRESH_TOKEN = config["refresh_token"]
CLIENT_ID = config["client_id"]
CLIENT_SECRET = config["client_secret"]

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# Output directory
OUTPUT_DIR = Path("C:/Users/Anthony/Desktop/um_website/ad-exports/subscription-launch-apr17/static-images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Source images
SOURCE_IMAGES = {
    "heritage": "C:/Users/Anthony/Desktop/um_website/public/images/heritage.jpg",
    "hero_produce": "C:/Users/Anthony/Desktop/um_website/public/images/hero-produce.jpg",
    "produce_box": "C:/Users/Anthony/Desktop/um_website/public/images/produce-box.jpg",
    "logo": "C:/Users/Anthony/Desktop/um_website/public/uncle-mays-logo.png"
}


def refresh_access_token():
    """Refresh Canva access token (expires every 4 hours)."""
    print("Refreshing Canva access token...")
    response = requests.post(
        "https://api.canva.com/rest/v1/oauth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "refresh_token",
            "refresh_token": REFRESH_TOKEN,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        }
    )

    if response.status_code == 200:
        data = response.json()
        new_access_token = data["access_token"]
        new_refresh_token = data.get("refresh_token", REFRESH_TOKEN)

        # Update config file
        config["access_token"] = new_access_token
        config["refresh_token"] = new_refresh_token
        with open(CONFIG_PATH, "w") as f:
            json.dump(config, f, indent=2)

        # Update global variables
        global ACCESS_TOKEN, REFRESH_TOKEN, HEADERS
        ACCESS_TOKEN = new_access_token
        REFRESH_TOKEN = new_refresh_token
        HEADERS["Authorization"] = f"Bearer {ACCESS_TOKEN}"

        print("✓ Access token refreshed")
        return True
    else:
        print(f"✗ Token refresh failed: {response.status_code} {response.text}")
        return False


def upload_asset(filepath, asset_name):
    """Upload an image asset to Canva."""
    print(f"Uploading {asset_name}...")

    try:
        with open(filepath, "rb") as f:
            files = {"file": (os.path.basename(filepath), f, "image/jpeg")}
            response = requests.post(
                f"{BASE_URL}/assets/upload",
                headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
                files=files
            )

        if response.status_code == 201:
            asset_id = response.json().get("asset", {}).get("id")
            print(f"✓ Uploaded {asset_name}: {asset_id}")
            return asset_id
        else:
            print(f"✗ Upload failed for {asset_name}: {response.status_code} {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error uploading {asset_name}: {e}")
        return None


def create_design(title, width, height):
    """Create a blank Canva design."""
    print(f"Creating design: {title} ({width}x{height})...")

    response = requests.post(
        f"{BASE_URL}/designs",
        headers=HEADERS,
        json={
            "design_type": {"type": "preset", "name": "social_media_post"},
            "title": title,
            "dimensions": {"width": width, "height": height, "unit": "px"}
        }
    )

    if response.status_code == 201:
        design_id = response.json().get("design", {}).get("id")
        print(f"✓ Created design: {design_id}")
        return design_id
    elif response.status_code == 401:
        # Token expired, refresh and retry
        if refresh_access_token():
            return create_design(title, width, height)
        else:
            return None
    else:
        print(f"✗ Design creation failed: {response.status_code} {response.text}")
        return None


def export_design(design_id, filename):
    """Export a Canva design to PNG."""
    print(f"Exporting {filename}...")

    response = requests.post(
        f"{BASE_URL}/exports",
        headers=HEADERS,
        json={
            "design_id": design_id,
            "format": {"type": "png"}
        }
    )

    if response.status_code == 201:
        export_data = response.json().get("export", {})
        export_id = export_data.get("id")

        # Poll for export completion
        max_wait = 60  # seconds
        start_time = time.time()

        while time.time() - start_time < max_wait:
            status_response = requests.get(
                f"{BASE_URL}/exports/{export_id}",
                headers=HEADERS
            )

            if status_response.status_code == 200:
                status_data = status_response.json().get("export", {})
                if status_data.get("status") == "success":
                    download_url = status_data.get("urls", {}).get("url")
                    if download_url:
                        # Download the image
                        img_response = requests.get(download_url)
                        if img_response.status_code == 200:
                            filepath = OUTPUT_DIR / filename
                            with open(filepath, "wb") as f:
                                f.write(img_response.content)
                            print(f"✓ Exported: {filepath}")
                            return True

            time.sleep(2)

        print(f"✗ Export timed out for {filename}")
        return False

    elif response.status_code == 401:
        if refresh_access_token():
            return export_design(design_id, filename)
        else:
            return False
    else:
        print(f"✗ Export failed: {response.status_code} {response.text}")
        return False


def main():
    """Main production workflow."""
    print("=" * 60)
    print("UNCLE MAY'S SUBSCRIPTION LAUNCH - STATIC AD PRODUCTION")
    print("=" * 60)
    print()

    print("Note: Canva API has limited support for programmatic text overlay.")
    print("This script creates blank designs with correct dimensions.")
    print("Text overlays must be added in Canva UI following the specifications.")
    print()

    # Image specifications (simplified - create blank canvases)
    designs = [
        # Google Performance Max - Landscape (1200x628)
        ("PMax Landscape 1: Hero Value", 1200, 628, "pmax_landscape_hero_value_1200x628.png"),
        ("PMax Landscape 2: Cultural", 1200, 628, "pmax_landscape_cultural_1200x628.png"),
        ("PMax Landscape 3: Subscription", 1200, 628, "pmax_landscape_subscription_1200x628.png"),
        ("PMax Landscape 4: Social Proof", 1200, 628, "pmax_landscape_social_proof_1200x628.png"),
        ("PMax Landscape 5: Offer", 1200, 628, "pmax_landscape_offer_1200x628.png"),

        # Google Performance Max - Square (1080x1080)
        ("PMax Square 1: Product Hero", 1080, 1080, "pmax_square_product_hero_1080x1080.png"),
        ("PMax Square 2: Subscription Value", 1080, 1080, "pmax_square_subscription_value_1080x1080.png"),
        ("PMax Square 3: Cultural", 1080, 1080, "pmax_square_cultural_1080x1080.png"),
        ("PMax Square 4: Price Anchor", 1080, 1080, "pmax_square_price_anchor_1080x1080.png"),
        ("PMax Square 5: Black Owned", 1080, 1080, "pmax_square_blackowned_1080x1080.png"),

        # Google Performance Max - Portrait (1080x1350)
        ("PMax Portrait 1: Mobile Hero", 1080, 1350, "pmax_portrait_mobile_hero_1080x1350.png"),
        ("PMax Portrait 2: Value Stack", 1080, 1350, "pmax_portrait_value_stack_1080x1350.png"),
        ("PMax Portrait 3: Cultural Pride", 1080, 1350, "pmax_portrait_cultural_pride_1080x1350.png"),
        ("PMax Portrait 4: Offer Focus", 1080, 1350, "pmax_portrait_offer_1080x1350.png"),
        ("PMax Portrait 5: Simplicity", 1080, 1350, "pmax_portrait_subscription_simplicity_1080x1350.png"),

        # Meta Feed (1080x1080)
        ("Meta Feed 1: What's in Box", 1080, 1080, "meta_feed_whats_in_box_1080x1080.png"),
        ("Meta Feed 2: Chicago Families", 1080, 1080, "meta_feed_chicago_families_1080x1080.png"),
        ("Meta Feed 3: Grandma's Greens", 1080, 1080, "meta_feed_grandmas_greens_1080x1080.png"),
        ("Meta Feed 4: Farm to Table", 1080, 1080, "meta_feed_farm_to_table_1080x1080.png"),
        ("Meta Feed 5: Zero Hassle", 1080, 1080, "meta_feed_zero_hassle_1080x1080.png"),

        # Meta Story (1080x1920)
        ("Meta Story 1: Subscription Value", 1080, 1920, "meta_story_subscription_value_1080x1920.png"),
        ("Meta Story 2: Cultural", 1080, 1920, "meta_story_cultural_1080x1920.png"),
        ("Meta Story 3: Black Owned", 1080, 1920, "meta_story_blackowned_1080x1920.png"),
        ("Meta Story 4: Offer Focus", 1080, 1920, "meta_story_offer_1080x1920.png"),
        ("Meta Story 5: Convenience", 1080, 1920, "meta_story_convenience_1080x1920.png"),
    ]

    # Upload source assets first (if not already uploaded)
    print("\nStep 1: Uploading source images...")
    # Note: This is commented out as repeated uploads may not be necessary
    # and we need to manually add images in Canva UI anyway
    # for name, filepath in SOURCE_IMAGES.items():
    #     if os.path.exists(filepath):
    #         upload_asset(filepath, name)

    # Create designs
    print("\nStep 2: Creating blank designs with correct dimensions...")
    created_designs = []

    for title, width, height, filename in designs:
        design_id = create_design(title, width, height)
        if design_id:
            created_designs.append((design_id, title, filename))
            time.sleep(1)  # Rate limit protection

    print(f"\n✓ Created {len(created_designs)} / {len(designs)} designs")

    # Export note
    print("\n" + "=" * 60)
    print("IMPORTANT: NEXT STEPS")
    print("=" * 60)
    print("\nCanva API cannot add text overlays programmatically.")
    print("You MUST open each design in Canva UI and add:")
    print("  1. Background image (heritage.jpg, hero-produce.jpg, or produce-box.jpg)")
    print("  2. Text overlays per specifications in static-image-specifications.md")
    print("  3. Uncle May's logo")
    print("  4. Export as PNG to ad-exports/subscription-launch-apr17/static-images/")
    print()
    print("Created designs in your Canva account (sorted by 'modified_descending'):")
    print("Visit: https://www.canva.com/folder/all-designs")
    print()

    # List created design IDs for reference
    if created_designs:
        print("Design IDs (for reference):")
        for design_id, title, _ in created_designs[:5]:
            print(f"  - {title}: {design_id}")
        if len(created_designs) > 5:
            print(f"  ... and {len(created_designs) - 5} more")

    print("\n" + "=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
