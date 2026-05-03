#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Activate Meta campaign - unpause and verify status.
Campaign ID: 120243219649250762
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

CAMPAIGN_ID = "120243219649250762"


def get_campaign_status():
    """Get current campaign status."""
    url = f"{BASE_URL}/{CAMPAIGN_ID}"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "id,name,status,effective_status,daily_budget,objective,created_time,updated_time",
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()


def activate_campaign():
    """Activate (unpause) campaign."""
    url = f"{BASE_URL}/{CAMPAIGN_ID}"
    payload = {
        "access_token": ACCESS_TOKEN,
        "status": "ACTIVE",
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()


def get_ad_sets():
    """Get all ad sets in campaign."""
    url = f"{BASE_URL}/{CAMPAIGN_ID}/adsets"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "id,name,status,effective_status,targeting,daily_budget,bid_amount",
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()["data"]


def get_ads():
    """Get all ads in campaign."""
    url = f"{BASE_URL}/{CAMPAIGN_ID}/ads"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "id,name,status,effective_status,adset_id",
        "limit": 100,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()["data"]


def main():
    print("=" * 80)
    print("Meta Campaign Activation — Subscription Launch Apr 2026")
    print("=" * 80)
    print()

    # Get current status
    print("1. Current campaign status:")
    print("-" * 80)
    campaign = get_campaign_status()
    print(f"   Campaign: {campaign['name']}")
    print(f"   Status: {campaign['status']} (Effective: {campaign['effective_status']})")
    print(f"   Daily Budget: ${int(campaign['daily_budget']) / 100:.2f}")
    print(f"   Objective: {campaign['objective']}")
    print()

    if campaign["status"] == "ACTIVE":
        print("   Campaign is already ACTIVE.")
        print()
    else:
        # Activate
        print("2. Activating campaign...")
        print("-" * 80)
        result = activate_campaign()
        print(f"   Success: {result.get('success', False)}")
        print()

        # Verify
        campaign = get_campaign_status()
        print("3. Verified new status:")
        print("-" * 80)
        print(f"   Status: {campaign['status']} (Effective: {campaign['effective_status']})")
        print()

    # Get ad sets
    print("4. Ad Sets (3 total):")
    print("-" * 80)
    ad_sets = get_ad_sets()
    for ad_set in ad_sets:
        print(f"   {ad_set['name']}")
        print(f"      Status: {ad_set['status']} (Effective: {ad_set['effective_status']})")
        if "targeting" in ad_set and "geo_locations" in ad_set["targeting"]:
            geo = ad_set["targeting"]["geo_locations"]
            if "custom_locations" in geo and geo["custom_locations"]:
                loc = geo["custom_locations"][0]
                print(f"      Targeting: {loc.get('name', 'Custom location')}, {loc.get('radius', '?')}mi radius")
        print()

    # Get ads
    print("5. Ads (21 total):")
    print("-" * 80)
    ads = get_ads()
    ad_count_by_set = {}
    for ad in ads:
        ad_set_id = ad["adset_id"]
        ad_count_by_set[ad_set_id] = ad_count_by_set.get(ad_set_id, 0) + 1

    for ad_set in ad_sets:
        count = ad_count_by_set.get(ad_set["id"], 0)
        print(f"   {ad_set['name']}: {count} ads")

    print()
    print("=" * 80)
    print(f"CAMPAIGN ACTIVATED: {campaign['status']}")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Monitor performance in Meta Ads Manager")
    print("2. Check Meta Pixel events in Events Manager")
    print("3. Watch for first conversion within 24-48 hours")
    print("4. Daily review: CTR, CPC, CAC, conversions")
    print()
    print(f"View campaign: https://business.facebook.com/adsmanager/manage/campaigns?act={AD_ACCOUNT_ID.replace('act_', '')}&selected_campaign_ids={CAMPAIGN_ID}")


if __name__ == "__main__":
    main()
