#!/usr/bin/env python3
"""
Export 15 Meta ad creatives from Canva via API.
Handles token refresh automatically on 401.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
import base64

# Load config
config_path = os.path.expanduser("~/.claude/canva-config.json")
with open(config_path) as f:
    config = json.load(f)

BASE_URL = config["base_url"]
ACCESS_TOKEN = config["access_token"]
REFRESH_TOKEN = config["refresh_token"]

# Design exports mapping (design_id -> filename)
EXPORTS = {
    # Instagram Posts (1080x1080)
    "DAHGwZ4nIJk": "instagram_post_a_direct_offer.png",
    "DAHGwevpvOU": "instagram_post_b_curiosity.png",
    "DAHGwY_hAdU": "instagram_post_c_social_proof.png",
    "DAHGwYWKCiU": "instagram_post_d_scarcity.png",
    "DAHGwao27QE": "instagram_post_e_community.png",

    # Instagram Stories (1080x1920)
    "DAHGweYGtEY": "story_a_direct_offer.png",
    "DAHGwYzv9Uc": "story_b_curiosity.png",
    "DAHGwROMeXk": "story_c_social_proof.png",
    "DAHGwbtQBkc": "story_d_scarcity.png",
    "DAHGwXi10JE": "story_e_community.png",

    # Facebook Feed (1200x628)
    "DAHGwdgGtgA": "facebook_a_direct_offer.png",
    "DAHGwfthEcc": "facebook_b_curiosity.png",
    "DAHGwSGdhks": "facebook_c_social_proof.png",
    "DAHGwRcdsf0": "facebook_d_scarcity.png",
    "DAHGwd0Z_5U": "facebook_e_community.png",
}

OUTPUT_DIR = "data/meta-ads/exports"


def refresh_access_token():
    """Refresh the Canva access token using the refresh token."""
    global ACCESS_TOKEN, REFRESH_TOKEN

    print("Refreshing access token...")
    credentials = base64.b64encode(
        f'{config["client_id"]}:{config["client_secret"]}'.encode()
    ).decode()

    payload = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": REFRESH_TOKEN,
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

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        tokens = json.loads(resp.read())

        # Update both tokens
        ACCESS_TOKEN = tokens["access_token"]
        REFRESH_TOKEN = tokens["refresh_token"]

        # Save to config file
        config["access_token"] = ACCESS_TOKEN
        config["refresh_token"] = REFRESH_TOKEN

        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)

        print("[OK] Token refreshed successfully")
        return True

    except Exception as e:
        print(f"[FAIL] Token refresh failed: {e}")
        return False


def canva_api_request(method, endpoint, data=None, retry_on_401=True):
    """Make a request to Canva API with automatic token refresh on 401."""
    global ACCESS_TOKEN

    url = f"{BASE_URL}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)

    try:
        resp = urllib.request.urlopen(req, timeout=60)
        return json.loads(resp.read())

    except urllib.error.HTTPError as e:
        if e.code == 401 and retry_on_401:
            # Token expired, refresh and retry once
            if refresh_access_token():
                return canva_api_request(method, endpoint, data, retry_on_401=False)
            else:
                raise Exception("Failed to refresh token after 401")
        elif e.code == 429:
            # Rate limit
            error_body = e.read().decode('utf-8')
            raise Exception(f"Rate limit hit: {error_body}")
        else:
            error_body = e.read().decode('utf-8')
            raise Exception(f"HTTP {e.code}: {error_body}")


def create_export(design_id):
    """Create a PNG export job for a design."""
    print(f"  Creating export job for {design_id}...")

    data = {
        "design_id": design_id,
        "format": {
            "type": "png"
        }
    }

    return canva_api_request("POST", "exports", data)


def get_export_status(export_id):
    """Get the status of an export job."""
    return canva_api_request("GET", f"exports/{export_id}")


def download_file(url, output_path):
    """Download a file from a URL."""
    print(f"  Downloading to {output_path}...")

    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, timeout=60)

    with open(output_path, 'wb') as f:
        f.write(resp.read())

    print(f"  [OK] Saved {output_path}")


def export_design(design_id, filename):
    """Export a single design to PNG."""
    print(f"\n[{filename}]")

    # Create export job
    result = create_export(design_id)

    # Try both 'job' and 'export' keys (API might use either)
    job_data = result.get("job") or result.get("export")
    if not job_data:
        print(f"  [FAIL] Failed to create export: {result}")
        return False

    export_id = job_data.get("id")
    if not export_id:
        print(f"  [FAIL] No job ID in response: {result}")
        return False

    print(f"  Export job created: {export_id}")

    # Poll for completion (max 60 seconds)
    for attempt in range(30):
        time.sleep(2)
        status = get_export_status(export_id)

        # Try both 'job' and 'export' keys
        status_data = status.get("job") or status.get("export")
        if not status_data:
            print(f"  [FAIL] Invalid status response: {status}")
            return False

        state = status_data.get("status")
        print(f"  Status: {state}")

        if state == "success":
            # Get download URL (Canva returns an array of URLs)
            urls = status_data.get("urls", [])
            if urls and len(urls) > 0:
                url = urls[0]
                output_path = os.path.join(OUTPUT_DIR, filename)
                download_file(url, output_path)
                return True
            else:
                print(f"  [FAIL] No download URL in response")
                return False

        elif state == "failed":
            error = status_data.get("error")
            print(f"  [FAIL] Export failed: {error}")
            return False

        # Still processing, continue polling

    print(f"  [FAIL] Timeout waiting for export")
    return False


def main():
    """Export all 15 designs."""
    print("Canva Design Export")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Total designs: {len(EXPORTS)}")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Export each design
    success_count = 0
    failed_designs = []

    for design_id, filename in EXPORTS.items():
        try:
            if export_design(design_id, filename):
                success_count += 1
            else:
                failed_designs.append((design_id, filename))
        except Exception as e:
            print(f"  [FAIL] Error: {e}")
            failed_designs.append((design_id, filename))

    # Summary
    print("\n" + "=" * 60)
    print(f"[OK] Successfully exported: {success_count}/{len(EXPORTS)}")

    if failed_designs:
        print(f"[FAIL] Failed exports: {len(failed_designs)}")
        for design_id, filename in failed_designs:
            print(f"  - {filename} ({design_id})")
        sys.exit(1)
    else:
        print("All designs exported successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
