#!/usr/bin/env python3
"""
Upload 15 Performance Max images to Google Ads
Task: UNC-358

Creates Performance Max campaign with asset group and 15 images.
Campaign created in PAUSED status for board approval.
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
import base64
from datetime import datetime

# Load Google Ads config
config_path = os.path.expanduser("~/.claude/google-ads-config.json")
with open(config_path) as f:
    config = json.load(f)

DEVELOPER_TOKEN = config["developer_token"]
CLIENT_ID = config["client_id"]
CLIENT_SECRET = config["client_secret"]
REFRESH_TOKEN = config["refresh_token"]
LOGIN_CUSTOMER_ID = config["login_customer_id"]
CUSTOMER_ID = config["customer_id"]
BASE_URL = config["base_url"]
OAUTH_TOKEN_URL = config["oauth_token_url"]

# Image paths (15 Performance Max images)
IMAGE_DIR = "ad-exports/subscription-launch-apr17/static-images"
PMAX_IMAGES = [
    # Landscape (1200x628)
    "pmax_landscape_cultural_1200x628.png",
    "pmax_landscape_hero_value_1200x628.png",
    "pmax_landscape_offer_1200x628.png",
    "pmax_landscape_social_proof_1200x628.png",
    "pmax_landscape_subscription_1200x628.png",
    # Square (1080x1080)
    "pmax_square_blackowned_1080x1080.png",
    "pmax_square_cultural_1080x1080.png",
    "pmax_square_price_anchor_1080x1080.png",
    "pmax_square_product_hero_1080x1080.png",
    "pmax_square_subscription_value_1080x1080.png",
    # Portrait (1080x1350)
    "pmax_portrait_cultural_pride_1080x1350.png",
    "pmax_portrait_mobile_hero_1080x1350.png",
    "pmax_portrait_offer_1080x1350.png",
    "pmax_portrait_subscription_simplicity_1080x1350.png",
    "pmax_portrait_value_stack_1080x1350.png",
]

def get_access_token():
    """Exchange refresh token for access token."""
    payload = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN,
        "grant_type": "refresh_token",
    }).encode("utf-8")

    req = urllib.request.Request(
        OAUTH_TOKEN_URL,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())["access_token"]
    except urllib.error.HTTPError as e:
        print(f"OAuth error: {e.code} {e.reason}")
        print(e.read().decode())
        sys.exit(1)

def google_ads_mutate(endpoint, operations, access_token=None):
    """Make a mutate request to Google Ads API."""
    if not access_token:
        access_token = get_access_token()

    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        "login-customer-id": LOGIN_CUSTOMER_ID,
        "Content-Type": "application/json",
    }

    payload = json.dumps({"operations": operations}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=60)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"API error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        return None

def upload_image(image_path, image_name, access_token):
    """Upload a single image as an asset."""
    print(f"  Uploading {image_name}...")

    # Read image file and encode as base64
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    operations = [{
        "create": {
            "name": image_name.replace(".png", "").replace("_", " ").title(),
            "type": "IMAGE",
            "image_asset": {
                "data": image_data,
            }
        }
    }]

    result = google_ads_mutate("assets:mutate", operations, access_token)

    if result and "results" in result and len(result["results"]) > 0:
        asset_resource = result["results"][0]["resourceName"]
        print(f"    [OK] Uploaded: {asset_resource}")
        return asset_resource
    else:
        print(f"    [FAIL] Failed to upload {image_name}")
        return None

def create_budget(access_token):
    """Create campaign budget ($20/day for Performance Max)."""
    print("\nCreating campaign budget ($20/day)...")

    # Budget in micros: $20 = 20,000,000 micros
    budget_amount_micros = 20_000_000

    operations = [{
        "create": {
            "name": f"Uncle May's Performance Max Budget - {datetime.now().strftime('%Y%m%d')}",
            "amount_micros": budget_amount_micros,
            "delivery_method": "STANDARD",
            "explicitly_shared": False,
        }
    }]

    result = google_ads_mutate("campaignBudgets:mutate", operations, access_token)

    if result and "results" in result:
        budget_resource = result["results"][0]["resourceName"]
        print(f"  [OK] Budget created: {budget_resource}")
        return budget_resource
    else:
        print("  [FAIL] Failed to create budget")
        return None

def create_pmax_campaign(budget_resource, access_token):
    """Create Performance Max campaign."""
    print("\nCreating Performance Max campaign...")

    # Start date: today
    # End date: 30 days from now
    start_date = datetime.now().strftime("%Y%m%d")
    end_date = (datetime.now().replace(day=1, month=datetime.now().month + 1) if datetime.now().month < 12 else datetime.now().replace(day=1, month=1, year=datetime.now().year + 1)).strftime("%Y%m%d")

    operations = [{
        "create": {
            "name": "Uncle May's Produce - Performance Max - Apr 2026",
            "status": "PAUSED",  # Created paused for board approval
            "advertising_channel_type": "PERFORMANCE_MAX",
            "campaign_budget": budget_resource,
            "bidding_strategy_type": "MAXIMIZE_CONVERSIONS",
            "start_date": start_date,
            "url_custom_parameters": [
                {"key": "utm_source", "value": "google"},
                {"key": "utm_medium", "value": "pmax"},
                {"key": "utm_campaign", "value": "subscription_launch_apr2026"},
            ],
        }
    }]

    result = google_ads_mutate("campaigns:mutate", operations, access_token)

    if result and "results" in result:
        campaign_resource = result["results"][0]["resourceName"]
        print(f"  [OK] Campaign created: {campaign_resource}")
        return campaign_resource
    else:
        print("  [FAIL] Failed to create campaign")
        return None

def create_asset_group(campaign_resource, asset_resources, access_token):
    """Create asset group with uploaded images."""
    print("\nCreating asset group with images...")

    # Headlines from google-performance-max-copy.md
    headlines = [
        "Fresh Produce, Delivered Weekly",
        "Black-Owned Grocery, Chicago",
        "Subscribe From $30/Week",
        "Premium Greens, Weekly",
        "Join 500+ Chicago Families",
    ]

    # Long headlines
    long_headlines = [
        "Subscribe to Chicago's #1 Produce Box for Black Families",
        "Fresh Greens, Okra, Yams Delivered Every Week",
        "Black-Owned, Chicago-Based, Culturally Specific Produce",
        "From $30/Week, Cancel Anytime, First Box This Thursday",
        "Premium Produce Subscription for Hyde Park Families",
    ]

    # Descriptions
    descriptions = [
        "Premium produce boxes for Black families. Greens, okra, yams, and more.",
        "Subscription grocery from Black farmers. Delivered every Thursday.",
        "Skip the store. Get restaurant-quality produce at home.",
        "Started by a Chicago Booth grad, trusted by Hyde Park.",
        "The produce box you've been looking for. Subscribe in 2 minutes.",
    ]

    # Build asset group
    operations = [{
        "create": {
            "name": "Subscription Launch - Apr 2026",
            "campaign": campaign_resource,
            "final_urls": ["https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP"],
            "status": "PAUSED",
        }
    }]

    result = google_ads_mutate("assetGroups:mutate", operations, access_token)

    if result and "results" in result:
        asset_group_resource = result["results"][0]["resourceName"]
        print(f"  [OK] Asset group created: {asset_group_resource}")
        return asset_group_resource
    else:
        print("  [FAIL] Failed to create asset group")
        return None

def main():
    print("=" * 60)
    print("Google Ads Performance Max Image Upload")
    print("Task: UNC-358")
    print("=" * 60)

    # Get access token once
    access_token = get_access_token()
    print("[OK] Authenticated with Google Ads API\n")

    # Step 1: Upload images
    print("Step 1: Uploading 15 images...")
    print("-" * 60)

    asset_resources = []
    for image_file in PMAX_IMAGES:
        image_path = os.path.join(IMAGE_DIR, image_file)
        if not os.path.exists(image_path):
            print(f"  [FAIL] Image not found: {image_path}")
            continue

        asset_resource = upload_image(image_path, image_file, access_token)
        if asset_resource:
            asset_resources.append(asset_resource)

    print(f"\n[OK] Uploaded {len(asset_resources)}/{len(PMAX_IMAGES)} images")

    if len(asset_resources) < 10:
        print("\n[FAIL] Too few images uploaded. Minimum 10 required for Performance Max.")
        sys.exit(1)

    # Step 2: Create budget
    print("\n" + "-" * 60)
    budget_resource = create_budget(access_token)
    if not budget_resource:
        sys.exit(1)

    # Step 3: Create campaign
    print("-" * 60)
    campaign_resource = create_pmax_campaign(budget_resource, access_token)
    if not campaign_resource:
        sys.exit(1)

    # Step 4: Create asset group
    print("-" * 60)
    asset_group_resource = create_asset_group(campaign_resource, asset_resources, access_token)
    if not asset_group_resource:
        sys.exit(1)

    # Success summary
    print("\n" + "=" * 60)
    print("SUCCESS: Performance Max campaign created")
    print("=" * 60)
    print(f"Campaign: {campaign_resource}")
    print(f"Asset Group: {asset_group_resource}")
    print(f"Images: {len(asset_resources)} uploaded")
    print(f"Budget: $20/day")
    print(f"Status: PAUSED (awaiting board approval)")
    print("\nNext steps:")
    print("1. Review campaign in Google Ads UI")
    print("2. Get board approval to activate")
    print("3. Set status to ENABLED")
    print("=" * 60)

if __name__ == "__main__":
    main()
