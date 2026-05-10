#!/usr/bin/env python3
"""Update Meta ads to use the new creatives with fixed /shop URLs."""

import json
import urllib.request
import urllib.parse
import sys

# Meta API config
ACCESS_TOKEN = "EAAhalZAHvAcYBRDcZBtAAZC87pOee19zbgZCdmEUyEQoWkHHPClerbvpHTh1bVtm5zTYQuPWCHxb5cFodX6OZBTwr7IhU9FIlVCTwIwqT7qAjxsZCeAC6DtKyGit5yfUOo1CpLt9aF5CteYc02KgKnxwksN3bf7FdUv8fcFEg2XLOe8iGqjdnAwv5cB8T7mUt45gZDZD"
BASE_URL = "https://graph.facebook.com/v21.0"

# Load creative mappings
with open('C:/Users/Anthony/Desktop/um_website/analytics/creative_mappings.json') as f:
    CREATIVE_MAP = json.load(f)

# Ad ID => Old Creative ID mapping (from DEPLOYED-IDS.md)
# These are the 8 ads in the "One-Time Box Launch - Apr 2026" campaign
AD_TO_OLD_CREATIVE = {
    "120243766375490762": "2115043712650640",  # OneTime LAL - Don Jhonsan 4
    "120243766376170762": "1482124910025625",  # OneTime LAL - Don Video 5
    "120243766377060762": "1316712163694921",  # OneTime Broad - Don Jhonsan 4
    "120243766378270762": "3120592748138275",  # OneTime Broad - Don Video 5
    "120243766379160762": "1473006714222124",  # OneTime Retarget - Don Jhonsan 4
    "120243766380090762": "941299425463490",   # OneTime Retarget - Don Video 5
    "120243780049710762": "1526609295754283",  # OneTime Engagement-Seeded - Don Jhonsan 4
    "120243780050480762": "1699929914695409",  # OneTime Engagement-Seeded - Don Video 5
}

def update_ad_creative(ad_id, new_creative_id):
    """Update an ad to use a new creative."""
    url = f"{BASE_URL}/{ad_id}"
    payload = {
        'access_token': ACCESS_TOKEN,
        'creative': json.dumps({'creative_id': new_creative_id})
    }
    data = urllib.parse.urlencode(payload).encode()

    try:
        with urllib.request.urlopen(url, data=data, timeout=30) as response:
            result = json.loads(response.read())
            return result.get('success', False)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"  [ERROR] HTTP {e.code}: {error_body}")
        return False
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def main():
    print("Updating Meta Ads to Use New Creatives")
    print("=" * 60)
    print()

    success_count = 0
    failed_count = 0

    for ad_id, old_creative_id in AD_TO_OLD_CREATIVE.items():
        new_creative_id = CREATIVE_MAP.get(old_creative_id)

        if not new_creative_id:
            print(f"[SKIP] No new creative found for ad {ad_id}")
            failed_count += 1
            continue

        print(f"Updating ad: {ad_id}")
        print(f"  Old creative: {old_creative_id}")
        print(f"  New creative: {new_creative_id}")

        if update_ad_creative(ad_id, new_creative_id):
            print(f"  [SUCCESS] Ad updated")
            success_count += 1
        else:
            print(f"  [FAILED] Could not update ad")
            failed_count += 1

        print()

    print("=" * 60)
    print(f"Summary: {success_count} succeeded, {failed_count} failed")
    print()

    if success_count == 8:
        print("[COMPLETE] All 8 ads now point to /shop (no redirect)")
        print()
        print("Next steps:")
        print("1. Verify ads in Meta Ads Manager")
        print("2. Test each destination URL manually")
        print("3. Monitor /shop reach rate for 7 days")
        print("   - Target: 40%+ (up from 25.2%)")
        print("   - Check: GA4 funnel analysis")

    return 0 if failed_count == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
