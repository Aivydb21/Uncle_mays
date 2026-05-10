#!/usr/bin/env python3
"""Update Meta ad creatives to point directly to /shop instead of redirect pages."""

import json
import urllib.request
import urllib.parse
import sys

# Meta API config
ACCESS_TOKEN = "EAAhalZAHvAcYBRDcZBtAAZC87pOee19zbgZCdmEUyEQoWkHHPClerbvpHTh1bVtm5zTYQuPWCHxb5cFodX6OZBTwr7IhU9FIlVCTwIwqT7qAjxsZCeAC6DtKyGit5yfUOo1CpLt9aF5CteYc02KgKnxwksN3bf7FdUv8fcFEg2XLOe8iGqjdnAwv5cB8T7mUt45gZDZD"
BASE_URL = "https://graph.facebook.com/v21.0"
AD_ACCOUNT = "act_814877604473301"

# Creative ID => New URL mapping
CREATIVE_UPDATES = {
    "2115043712650640": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-lookalike&promo=FRESH10",
    "1482124910025625": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-lookalike&promo=FRESH10",
    "1316712163694921": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad&promo=FRESH10",
    "3120592748138275": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=cold-broad&promo=FRESH10",
    "1473006714222124": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=retargeting&promo=FRESH10",
    "941299425463490": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=retargeting&promo=FRESH10",
    "1526609295754283": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=engagement-seeded&promo=FRESH10",
    "1699929914695409": "https://unclemays.com/shop?utm_source=meta&utm_medium=paid&utm_campaign=onetime-launch-apr26&utm_content=engagement-seeded&promo=FRESH10",
}

def fetch_creative(creative_id):
    """Fetch a creative's current spec."""
    url = f"{BASE_URL}/{creative_id}?fields=id,name,object_story_spec&access_token={ACCESS_TOKEN}"
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read())
    except Exception as e:
        print(f"  [ERROR] Error fetching creative {creative_id}: {e}")
        return None

def create_new_creative(original_spec, new_url, old_name):
    """Create a new creative with updated URL."""
    # Update the URL in the spec
    if 'video_data' in original_spec and 'call_to_action' in original_spec['video_data']:
        original_spec['video_data']['call_to_action']['value']['link'] = new_url

    # Remove image_url to avoid conflict with image_hash
    if 'video_data' in original_spec and 'image_url' in original_spec['video_data']:
        del original_spec['video_data']['image_url']

    # Prepare the new creative payload
    payload = {
        'access_token': ACCESS_TOKEN,
        'name': f"UPDATED-{old_name[:100]}",  # Truncate if too long
        'object_story_spec': json.dumps(original_spec)
    }

    url = f"{BASE_URL}/{AD_ACCOUNT}/adcreatives"
    data = urllib.parse.urlencode(payload).encode()

    try:
        with urllib.request.urlopen(url, data=data, timeout=30) as response:
            result = json.loads(response.read())
            return result.get('id')
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"  [ERROR] HTTP {e.code}: {error_body}")
        return None
    except Exception as e:
        print(f"  [ERROR] Error creating creative: {e}")
        return None

def main():
    print("Meta Ad Creative URL Updates")
    print("=" * 60)
    print()

    new_creative_map = {}
    success_count = 0
    failed_count = 0

    for old_id, new_url in CREATIVE_UPDATES.items():
        print(f"Processing creative: {old_id}")
        print(f"  New URL: {new_url}")

        # Fetch the original creative
        creative_data = fetch_creative(old_id)
        if not creative_data:
            failed_count += 1
            print()
            continue

        original_name = creative_data.get('name', '')
        original_spec = creative_data.get('object_story_spec', {})

        # Create new creative with updated URL
        new_id = create_new_creative(original_spec.copy(), new_url, original_name)

        if new_id:
            print(f"  [SUCCESS] Created new creative: {new_id}")
            new_creative_map[old_id] = new_id
            success_count += 1
        else:
            failed_count += 1

        print()

    print("=" * 60)
    print(f"Summary: {success_count} succeeded, {failed_count} failed")
    print()

    if new_creative_map:
        print("New creative mappings (old_id => new_id):")
        for old, new in sorted(new_creative_map.items()):
            print(f"  {old} => {new}")

        # Save mappings
        with open('C:/Users/Anthony/Desktop/um_website/analytics/creative_mappings.json', 'w') as f:
            json.dump(new_creative_map, f, indent=2)
        print()
        print("Mappings saved to: creative_mappings.json")

    return 0 if failed_count == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
