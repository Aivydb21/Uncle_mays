#!/usr/bin/env python3
"""
Create Meta ad campaign for April 17, 2026 launch.
Uses Meta Marketing API to set up campaign, ad sets, and ads.
"""

import json
import os
import sys
import urllib.request
import urllib.parse
from pathlib import Path

# Load Meta config
config_path = os.path.expanduser("~/.claude/meta-config.json")
with open(config_path) as f:
    config = json.load(f)

ACCESS_TOKEN = config["access_token"]
BASE_URL = config["base_url"]
AD_ACCOUNT_ID = config["ad_account_id"]

# Campaign spec
CAMPAIGN_NAME = "Uncle May's Produce Box - April 2026 Launch"
DAILY_BUDGET = 7000  # $70 in cents
PIXEL_ID = "2276705169443313"

# Targeting
TARGETING = {
    "geo_locations": {
        "custom_locations": [{
            "latitude": 41.7943,
            "longitude": -87.5907,
            "radius": 25,
            "distance_unit": "mile"
        }]
    },
    "age_min": 25,
    "age_max": 35,
    "genders": [2],  # Women only
    "flexible_spec": [{
        "interests": [
            {"id": "6003107902433", "name": "Organic food"},
            {"id": "6003139225998", "name": "Healthy eating"}
        ]
    }]
}


def meta_post(endpoint, data):
    """POST to Meta API."""
    data["access_token"] = ACCESS_TOKEN
    payload = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/{endpoint}", data=payload, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"Error: {e.code} {e.reason}", file=sys.stderr)
        print(f"Response: {error_body}", file=sys.stderr)
        raise


def upload_image(file_path, filename):
    """Upload image to Meta ad account."""
    print(f"Uploading {filename}...")

    # Read file as bytes
    with open(file_path, "rb") as f:
        image_bytes = f.read()

    # Create multipart form data
    boundary = "----WebKitFormBoundary" + os.urandom(16).hex()

    body = []
    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="access_token"'.encode())
    body.append(b"")
    body.append(ACCESS_TOKEN.encode())

    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="filename"; filename="{filename}"'.encode())
    body.append(b"Content-Type: image/png")
    body.append(b"")
    body.append(image_bytes)

    body.append(f"--{boundary}--".encode())
    body_bytes = b"\r\n".join(body)

    req = urllib.request.Request(
        f"{BASE_URL}/{AD_ACCOUNT_ID}/adimages",
        data=body_bytes,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )

    try:
        resp = urllib.request.urlopen(req, timeout=60)
        result = json.loads(resp.read())
        # Extract image hash from response
        images = result.get("images", {})
        if filename in images:
            return images[filename]["hash"]
        return None
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"Error uploading {filename}: {e.code}", file=sys.stderr)
        print(f"Response: {error_body}", file=sys.stderr)
        return None


def create_campaign():
    """Create campaign with CBO."""
    print(f"\nCreating campaign: {CAMPAIGN_NAME}")

    data = {
        "name": CAMPAIGN_NAME,
        "objective": "OUTCOME_SALES",  # Updated objective for conversions
        "status": "PAUSED",
        "special_ad_categories": [],
        "daily_budget": DAILY_BUDGET
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/campaigns", data)
    campaign_id = result["id"]
    print(f"✓ Campaign created: {campaign_id}")
    return campaign_id


def create_adset(campaign_id, name, placement):
    """Create ad set with targeting."""
    print(f"\nCreating ad set: {name}")

    # Placement configuration
    placement_map = {
        "ig_feed": {"publisher_platforms": ["instagram"], "instagram_positions": ["stream"]},
        "ig_story": {"publisher_platforms": ["instagram"], "instagram_positions": ["story"]},
        "fb_feed": {"publisher_platforms": ["facebook"], "facebook_positions": ["feed"]}
    }

    data = {
        "name": name,
        "campaign_id": campaign_id,
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "promoted_object": json.dumps({
            "pixel_id": PIXEL_ID,
            "custom_event_type": "PURCHASE"
        }),
        "targeting": json.dumps(TARGETING),
        "status": "PAUSED",
        **placement_map[placement]
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/adsets", data)
    adset_id = result["id"]
    print(f"✓ Ad set created: {adset_id}")
    return adset_id


def create_ad(adset_id, name, image_hash, ad_spec):
    """Create ad with creative."""
    print(f"Creating ad: {name}")

    creative_data = {
        "name": f"{name} Creative",
        "object_story_spec": json.dumps({
            "page_id": "755316477673748",  # Uncle May's Produce page
            "link_data": {
                "image_hash": image_hash,
                "link": ad_spec["url"],
                "message": ad_spec["primary_text"],
                "name": ad_spec.get("headline", ""),
                "call_to_action": {"type": ad_spec["cta"]}
            }
        })
    }

    # Create ad creative first
    creative_result = meta_post(f"{AD_ACCOUNT_ID}/adcreatives", creative_data)
    creative_id = creative_result["id"]

    # Create ad
    ad_data = {
        "name": name,
        "adset_id": adset_id,
        "creative": json.dumps({"creative_id": creative_id}),
        "status": "PAUSED"
    }

    result = meta_post(f"{AD_ACCOUNT_ID}/ads", ad_data)
    ad_id = result["id"]
    print(f"✓ Ad created: {ad_id}")
    return ad_id


def main():
    """Main execution."""
    exports_dir = Path(__file__).parent / "exports"

    # Ad specs from campaign-spec-april-17.md
    ad_specs = {
        # Instagram Feed
        "instagram_post_a_direct_offer.png": {
            "primary_text": "Fresh produce boxes from $30. Sourced from Black farmers, delivered across Chicago every Wednesday. No subscription. Order today.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_feed_a"
        },
        "instagram_post_b_curiosity.png": {
            "primary_text": "What does spring taste like in Hyde Park? Find out with Uncle May's seasonal produce box. Delivered fresh every Wednesday.",
            "cta": "LEARN_MORE",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_feed_b"
        },
        "instagram_post_c_social_proof.png": {
            "primary_text": "89% of our customers refer friends and family. Fresh produce from Black farmers, delivered to your Chicago door. Boxes from $30.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_feed_c"
        },
        "instagram_post_d_scarcity.png": {
            "primary_text": "Limited boxes available. Order by Tuesday night for this week's delivery. Fresh produce from Black farmers. $30 starter box.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_feed_d"
        },
        "instagram_post_e_community.png": {
            "primary_text": "For us, by us. Uncle May's supports Black farmers and delivers fresh produce across Chicago. Boxes from $30, no subscription.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_feed_e"
        },

        # Instagram Stories
        "story_a_direct_offer.png": {
            "primary_text": "$30 starter box. Fresh produce from Black farmers. Delivered Wednesday. No subscription.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_story_a"
        },
        "story_b_curiosity.png": {
            "primary_text": "What's in season this week? Tap to see Uncle May's spring produce box.",
            "cta": "LEARN_MORE",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_story_b"
        },
        "story_c_social_proof.png": {
            "primary_text": "89% of customers refer friends. Try Uncle May's produce box. $30 delivered.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_story_c"
        },
        "story_d_scarcity.png": {
            "primary_text": "Order by Tuesday for this week's delivery. Limited boxes. Fresh from Black farmers.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_story_d"
        },
        "story_e_community.png": {
            "primary_text": "For us, by us. Supporting Black farmers, delivering fresh produce across Chicago.",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=ig_story_e"
        },

        # Facebook Feed
        "facebook_a_direct_offer.png": {
            "primary_text": "Fresh produce boxes from $30. Sourced from Black farmers, delivered across Chicago every Wednesday. No subscription required.",
            "headline": "Fresh Produce from Black Farmers",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=fb_feed_a"
        },
        "facebook_b_curiosity.png": {
            "primary_text": "What does spring taste like in Hyde Park? Uncle May's curates seasonal produce from Black farmers and delivers it to your door every Wednesday.",
            "headline": "Seasonal Chicago Produce Delivery",
            "cta": "LEARN_MORE",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=fb_feed_b"
        },
        "facebook_c_social_proof.png": {
            "primary_text": "89% of our customers refer friends and family. Fresh produce from Black farmers, delivered to your Chicago door. Boxes from $30, no subscription.",
            "headline": "Trusted by Chicago Families",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=fb_feed_c"
        },
        "facebook_d_scarcity.png": {
            "primary_text": "Limited boxes available. Order by Tuesday night for this week's delivery. Fresh produce from Black farmers delivered across Chicago.",
            "headline": "Order by Tuesday for This Week",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=fb_feed_d"
        },
        "facebook_e_community.png": {
            "primary_text": "For us, by us. Uncle May's supports Black farmers and delivers fresh produce across Chicago. Boxes from $30, no subscription required.",
            "headline": "Supporting Black Farmers",
            "cta": "SHOP_NOW",
            "url": "https://unclemays.com?utm_source=meta&utm_medium=cpc&utm_campaign=april_launch&utm_content=fb_feed_e"
        }
    }

    print("=" * 60)
    print("Meta Ad Campaign Setup — April 17, 2026 Launch")
    print("=" * 60)

    # Step 1: Upload all images
    print("\nSTEP 1: Uploading creatives...")
    image_hashes = {}
    for filename in ad_specs.keys():
        file_path = exports_dir / filename
        if not file_path.exists():
            print(f"ERROR: File not found: {filename}", file=sys.stderr)
            sys.exit(1)

        image_hash = upload_image(file_path, filename)
        if image_hash:
            image_hashes[filename] = image_hash
        else:
            print(f"ERROR: Failed to upload {filename}", file=sys.stderr)
            sys.exit(1)

    print(f"\n✓ Uploaded {len(image_hashes)} creatives")

    # Step 2: Create campaign
    print("\nSTEP 2: Creating campaign...")
    campaign_id = create_campaign()

    # Step 3: Create ad sets
    print("\nSTEP 3: Creating ad sets...")
    ig_feed_adset = create_adset(campaign_id, "IG Feed - Women 25-35 - Chicago", "ig_feed")
    ig_story_adset = create_adset(campaign_id, "IG Stories - Women 25-35 - Chicago", "ig_story")
    fb_feed_adset = create_adset(campaign_id, "FB Feed - Women 25-35 - Chicago", "fb_feed")

    adset_map = {
        "instagram_post": ig_feed_adset,
        "story": ig_story_adset,
        "facebook": fb_feed_adset
    }

    # Step 4: Create ads
    print("\nSTEP 4: Creating ads...")
    for filename, spec in ad_specs.items():
        # Determine ad set based on filename
        if filename.startswith("instagram_post"):
            adset_id = ig_feed_adset
            ad_name = f"IG Feed - {filename.split('_')[-2].upper()}"
        elif filename.startswith("story"):
            adset_id = ig_story_adset
            ad_name = f"IG Story - {filename.split('_')[-2].upper()}"
        elif filename.startswith("facebook"):
            adset_id = fb_feed_adset
            ad_name = f"FB Feed - {filename.split('_')[-2].upper()}"

        create_ad(adset_id, ad_name, image_hashes[filename], spec)

    print("\n" + "=" * 60)
    print("✓ Campaign setup complete!")
    print("=" * 60)
    print(f"\nCampaign ID: {campaign_id}")
    print(f"Status: PAUSED (ready for April 17 launch)")
    print(f"Budget: $70/day")
    print(f"Ad Sets: 3")
    print(f"Ads: 15")
    print(f"\nNext: Review in Meta Ads Manager")
    print(f"https://business.facebook.com/adsmanager/manage/campaigns?act={AD_ACCOUNT_ID.replace('act_', '')}")


if __name__ == "__main__":
    main()
