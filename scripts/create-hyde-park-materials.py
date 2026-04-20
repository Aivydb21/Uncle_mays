#!/usr/bin/env python3
"""Create door hanger and flyer designs for Hyde Park local marketing campaign."""

import json
import os
import urllib.request
import urllib.parse
import time

# Load Canva config
config_path = os.path.expanduser("~/.claude/canva-config.json")
with open(config_path) as f:
    config = json.load(f)

BASE_URL = config["base_url"]
ACCESS_TOKEN = config["access_token"]

def refresh_token():
    """Refresh the Canva access token."""
    import base64
    credentials = base64.b64encode(
        f'{config["client_id"]}:{config["client_secret"]}'.encode()
    ).decode()
    payload = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": config["refresh_token"],
    }).encode("utf-8")
    req = urllib.request.Request(
        config["oauth_token_url"],
        data=payload,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    resp = urllib.request.urlopen(req, timeout=30)
    tokens = json.loads(resp.read())
    config["access_token"] = tokens["access_token"]
    config["refresh_token"] = tokens["refresh_token"]
    # Save updated tokens
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    global ACCESS_TOKEN
    ACCESS_TOKEN = tokens["access_token"]
    print("Token refreshed successfully")
    return tokens["access_token"]

def canva_post(endpoint, data):
    """POST request to Canva API. Auto-refreshes on 401."""
    url = f"{BASE_URL}/{endpoint}"
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print("Access token expired, refreshing...")
            new_token = refresh_token()
            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "Authorization": f"Bearer {new_token}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            resp = urllib.request.urlopen(req, timeout=30)
            return json.loads(resp.read())
        raise

def canva_get(endpoint):
    """GET request to Canva API."""
    url = f"{BASE_URL}/{endpoint}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())

# Create door hanger design (4.25" x 11" at 300 DPI = 1275 x 3300 px)
print("Creating door hanger design (4.25\" x 11\")...")
door_hanger = canva_post("designs", {
    "design_type": {
        "type": "dimensions",
        "dimensions": {
            "width": 1275,
            "height": 3300,
            "unit": "px"
        }
    },
    "title": "Hyde Park Door Hanger - NEIGHBOR20"
})
print(f"Door hanger created: {door_hanger['design']['id']}")
print(f"Edit URL: https://www.canva.com/design/{door_hanger['design']['id']}/edit")

time.sleep(2)

# Create flyer design (8.5" x 11" at 300 DPI = 2550 x 3300 px)
print("\nCreating flyer design (8.5\" x 11\")...")
flyer = canva_post("designs", {
    "design_type": {
        "type": "dimensions",
        "dimensions": {
            "width": 2550,
            "height": 3300,
            "unit": "px"
        }
    },
    "title": "Hyde Park Flyer - NEIGHBOR20"
})
print(f"Flyer created: {flyer['design']['id']}")
print(f"Edit URL: https://www.canva.com/design/{flyer['design']['id']}/edit")

# Save design IDs to file for later export
output = {
    "door_hanger": {
        "id": door_hanger["design"]["id"],
        "url": f"https://www.canva.com/design/{door_hanger['design']['id']}/edit",
        "dimensions": "4.25x11 inches (1275x3300 px)"
    },
    "flyer": {
        "id": flyer["design"]["id"],
        "url": f"https://www.canva.com/design/{flyer['design']['id']}/edit",
        "dimensions": "8.5x11 inches (2550x3300 px)"
    },
    "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    "campaign": "Hyde Park Local Marketing - NEIGHBOR20",
    "print_specs": {
        "door_hangers": "1,000 units",
        "flyers": "500 units",
        "budget": "$200/week",
        "deadline": "April 15, 2026"
    }
}

output_file = "/c/Users/Anthony/Desktop/business/ad-exports/hyde-park-materials.json"
os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, "w") as f:
    json.dump(output, f, indent=2)

print(f"\nDesign IDs saved to: {output_file}")
print("\nNext steps:")
print("1. Open both designs in Canva editor (URLs above)")
print("2. Add brand elements:")
print("   - Background: #1B5E20 (primary green)")
print("   - Logo: MAHGqhNKUqA")
print("   - Produce photo: MAHGqpAdAR0")
print("3. Add copy:")
print("   - Headline: Your Neighbor's Produce Box")
print("   - Subhead: Fresh, hand-curated fruits & vegetables")
print("   - Offer: $30 First Box with code NEIGHBOR20")
print("   - QR code to unclemays.com")
print("4. Door hanger: Add tear-off coupon at bottom")
print("5. Export as PDF for print")
