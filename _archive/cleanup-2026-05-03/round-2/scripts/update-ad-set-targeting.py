#!/usr/bin/env python3
"""
Update Meta ad set targeting based on real customer data
Original: Women 25-35
Updated: Women 25-50 (based on actual order data)
"""

import json
import os
import urllib.request
import urllib.parse

# Load Meta config
config_path = os.path.expanduser("~/.claude/meta-config.json")
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]

# Ad sets to update
AD_SETS = [
    {"name": "Instagram Feed", "id": "120243219914430762"},
    {"name": "Instagram Stories", "id": "120243219918030762"},
    {"name": "Facebook Feed", "id": "120243219919870762"}
]

def update_ad_set_targeting(ad_set_id, ad_set_name):
    """Update ad set targeting to ages 25-50"""
    print(f"\nUpdating {ad_set_name}...")

    # New targeting spec
    targeting = {
        "geo_locations": {
            "cities": [{
                "key": "2490299",  # Chicago
                "radius": 25,
                "distance_unit": "mile"
            }]
        },
        "age_min": 25,
        "age_max": 50,  # Expanded from 35 to 50
        "genders": [2],  # Women
        "targeting_automation": {
            "advantage_audience": 0  # Strict targeting
        }
    }

    url = f"https://graph.facebook.com/v21.0/{ad_set_id}"

    params = {
        "targeting": json.dumps(targeting),
        "access_token": ACCESS_TOKEN
    }

    data = urllib.parse.urlencode(params).encode()

    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("User-Agent", "curl/8.0")

    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            if result.get("success"):
                print(f"  ✓ Updated to ages 25-50")
                return True
            else:
                print(f"  Response: {result}")
                return False
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR {e.code}: {error_body}")
        return False

def main():
    print("=" * 70)
    print("Updating Ad Set Targeting - Ages 25-50")
    print("=" * 70)
    print("\nReason: Last week's orders were from women ages 35-50")
    print("Old targeting: Women 25-35")
    print("New targeting: Women 25-50")

    updated = 0
    for ad_set in AD_SETS:
        if update_ad_set_targeting(ad_set["id"], ad_set["name"]):
            updated += 1

    print(f"\n" + "=" * 70)
    print(f"Updated {updated}/{len(AD_SETS)} ad sets successfully")
    print("=" * 70)

    if updated == len(AD_SETS):
        print("\n✓ All ad sets now targeting women 25-50 in Chicago 25mi radius")
        print("\nNext: Monitor performance by age group in Meta Ads Manager")
        print("  - Breakdown by Age in Ads Manager columns")
        print("  - If 35-50 outperforms, consider narrowing to that range")
        print("  - If both convert well, keep the wider range")
    else:
        print("\n⚠ Some updates failed - check errors above")

if __name__ == "__main__":
    main()
