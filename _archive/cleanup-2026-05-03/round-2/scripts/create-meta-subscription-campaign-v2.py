#!/usr/bin/env python3
"""
Create Meta (Facebook/Instagram) campaign for subscription launch - FIXED VERSION.
Uses proper JSON API format instead of URL encoding.
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
CAMPAIGN_NAME = "Subscription Launch Apr 2026"
DAILY_BUDGET = 6700  # $67/day in cents

def meta_api_call(endpoint, method="POST", params=None):
    """Make a call to the Meta Marketing API with proper JSON formatting."""
    url = f"{BASE_URL}/{endpoint}?access_token={ACCESS_TOKEN}"

    headers = {
        "Content-Type": "application/json",
    }

    payload = json.dumps(params).encode("utf-8") if params else None

    req = urllib.request.Request(url, data=payload, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as e:
        print(f"API Error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        try:
            error_json = json.loads(error_body)
            if "error" in error_json:
                print(f"Error message: {error_json['error'].get('message')}")
                if 'error_user_msg' in error_json['error']:
                    print(f"User message: {error_json['error']['error_user_msg']}")
        except:
            pass
        raise


def create_campaign():
    """Create the main campaign."""
    print(f"Creating campaign: {CAMPAIGN_NAME}")

    endpoint = f"{AD_ACCOUNT_ID}/campaigns"
    params = {
        "name": CAMPAIGN_NAME,
        "objective": "OUTCOME_SALES",
        "status": "PAUSED",
        "special_ad_categories": [],
        "daily_budget": DAILY_BUDGET,
    }

    result = meta_api_call(endpoint, params=params)
    campaign_id = result["id"]

    print(f"  [OK] Campaign created: {campaign_id}")
    return campaign_id


def create_ad_set_simple(campaign_id, name):
    """Create a simple ad set with minimal targeting to test."""
    print(f"Creating ad set: {name}")

    endpoint = f"{AD_ACCOUNT_ID}/adsets"

    # Simple targeting - just location and age/gender
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
            "advantage_audience": 0  # Disabled - use strict targeting
        }
    }

    params = {
        "name": name,
        "campaign_id": campaign_id,
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "billing_event": "IMPRESSIONS",
        "bid_amount": 200,  # $2.00 bid cap in cents
        "status": "PAUSED",
        "targeting": targeting,
        "promoted_object": {
            "pixel_id": PIXEL_ID,
            "custom_event_type": "PURCHASE"
        },
    }

    result = meta_api_call(endpoint, params=params)
    ad_set_id = result["id"]

    print(f"  [OK] Ad set created: {ad_set_id}")
    return ad_set_id


def main():
    print("="*70)
    print("Meta Campaign Setup - FIXED VERSION")
    print("="*70)
    print()

    try:
        # Check if campaign already exists from previous run
        print("Checking existing campaign...")
        existing_campaign_id = "120243219649250762"  # From previous attempt
        print(f"Using existing campaign: {existing_campaign_id}")
        print()

        # Try creating one simple ad set to test
        print("Creating test ad set...")
        ad_set_id = create_ad_set_simple(existing_campaign_id, "Test Ad Set - Women 25-35 Chicago")
        print()

        print("="*70)
        print("[OK] Ad set creation successful!")
        print("="*70)
        print(f"Campaign ID: {existing_campaign_id}")
        print(f"Ad Set ID: {ad_set_id}")
        print()
        print("Next: Create full campaign structure with 3 ad sets + placements")
        print("="*70)

        return 0

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
