#!/usr/bin/env python3
"""
Create Performance Max campaign for subscription launch.
Uses assets from ad-exports/subscription-launch-apr17/

Campaign will be created in PAUSED status per governance rules.
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
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

# Campaign settings (from creative brief)
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M")
CAMPAIGN_NAME = f"Subscription Launch PMax {TIMESTAMP}"
DAILY_BUDGET_MICROS = 20_000_000  # $20/day
FINAL_URL = "https://unclemays.com?utm_source=google&utm_medium=pmax&utm_campaign=subscription_launch_apr2026&promo=FREESHIP"

# Asset locations
BUSINESS_DIR = Path.home() / "Desktop" / "business"
ASSETS_DIR = BUSINESS_DIR / "ad-exports" / "subscription-launch-apr17" / "static-images"


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

    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())["access_token"]


def gads_request(endpoint, method="POST", data=None):
    """Make a request to Google Ads API with proper headers."""
    access_token = get_access_token()
    url = f"{BASE_URL}/{endpoint}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        # Note: login-customer-id NOT included - account appears to be standalone
        "Content-Type": "application/json",
    }

    payload = json.dumps(data).encode("utf-8") if data else None

    req = urllib.request.Request(url, data=payload, headers=headers, method=method)

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        raise


def create_campaign_budget():
    """Create campaign budget."""
    print(f"Creating campaign budget: ${DAILY_BUDGET_MICROS / 1_000_000:.2f}/day...")

    endpoint = f"customers/{CUSTOMER_ID}/campaignBudgets:mutate"
    data = {
        "operations": [{
            "create": {
                "name": f"Budget - {CAMPAIGN_NAME}",
                "amountMicros": DAILY_BUDGET_MICROS,
                "deliveryMethod": "STANDARD",
            }
        }]
    }

    result = gads_request(endpoint, data=data)
    budget_rn = result["results"][0]["resourceName"]
    print(f"  [OK] Budget created: {budget_rn}")
    return budget_rn


def create_pmax_campaign(budget_rn):
    """Create Performance Max campaign."""
    print(f"Creating Performance Max campaign: {CAMPAIGN_NAME}...")

    endpoint = f"customers/{CUSTOMER_ID}/campaigns:mutate"
    data = {
        "operations": [{
            "create": {
                "name": CAMPAIGN_NAME,
                "status": "PAUSED",  # Per governance: start paused
                "advertisingChannelType": "PERFORMANCE_MAX",
                "campaignBudget": budget_rn,
                "biddingStrategyType": "MAXIMIZE_CONVERSIONS",
                "urlExpansionOptOut": True,  # Disable URL expansion per brief
            }
        }]
    }

    result = gads_request(endpoint, data=data)
    campaign_rn = result["results"][0]["resourceName"]
    print(f"  [OK] Campaign created: {campaign_rn}")
    return campaign_rn


def create_asset_group(campaign_rn):
    """Create asset group with text assets."""
    print("Creating asset group with copy...")

    # Copy from google-performance-max-copy.md
    headlines = [
        "Fresh Produce, Delivered Weekly",
        "Black-Owned Grocery, Chicago",
        "Subscribe From $30/Week",
        "Premium Greens, Weekly",
        "Join 500+ Chicago Families",
    ]

    long_headlines = [
        "Subscribe to Chicago's #1 Produce Box for Black Families",
        "Fresh Greens, Okra, Yams Delivered Every Week",
        "Black-Owned, Chicago-Based, Culturally Specific Produce",
        "From $30/Week, Cancel Anytime, First Box This Thursday",
        "Premium Produce Subscription for Hyde Park Families",
    ]

    descriptions = [
        "Premium produce boxes for Black families. Greens, okra, yams, and more.",
        "Subscription grocery from Black farmers. Delivered every Thursday.",
        "Skip the store. Get restaurant-quality produce at home.",
        "Started by a Chicago Booth grad, trusted by Hyde Park.",
        "The produce box you've been looking for. Subscribe in 2 minutes.",
    ]

    endpoint = f"customers/{CUSTOMER_ID}/assetGroups:mutate"
    data = {
        "operations": [{
            "create": {
                "name": "Subscription Launch - Apr 2026",
                "campaign": campaign_rn,
                "finalUrls": [FINAL_URL],
                "status": "PAUSED",
            }
        }]
    }

    result = gads_request(endpoint, data=data)
    asset_group_rn = result["results"][0]["resourceName"]
    print(f"  [OK] Asset group created: {asset_group_rn}")

    # Note: Text assets and image assets need to be added via separate mutate operations
    # This would require creating assets first, then linking them to the asset group
    # For now, we've created the campaign structure

    return asset_group_rn


def main():
    print("="*70)
    print("Google Ads Performance Max Campaign Setup")
    print("Subscription Launch - April 2026")
    print("="*70)
    print()

    try:
        # Step 1: Create budget
        budget_rn = create_campaign_budget()

        # Step 2: Create campaign
        campaign_rn = create_pmax_campaign(budget_rn)

        # Step 3: Create asset group
        asset_group_rn = create_asset_group(campaign_rn)

        print()
        print("="*70)
        print("[OK] Performance Max campaign structure created!")
        print("="*70)
        print(f"Campaign: {campaign_rn}")
        print(f"Asset Group: {asset_group_rn}")
        print(f"Status: PAUSED (ready for board review)")
        print()
        print("Next steps:")
        print("1. Upload images to asset group (requires multipart upload)")
        print("2. Upload videos to asset group")
        print("3. Add text assets (headlines, descriptions)")
        print("4. Get board approval")
        print("5. Activate campaign via Google Ads UI")
        print("="*70)

        return 0

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
