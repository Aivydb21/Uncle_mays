#!/usr/bin/env python3
"""
Export all 15 Meta ad variants from Canva
Saves PNG files to data/meta-ads/exports/
"""

import json
import os
import time
import urllib.request
import urllib.parse

# Load Canva config
config_path = os.path.expanduser("~/.claude/canva-config.json")
with open(config_path) as f:
    config = json.load(f)

BASE_URL = config["base_url"]
ACCESS_TOKEN = config["access_token"]

# Design IDs from UNC-219
DESIGNS = {
    # Instagram Post (1080x1080)
    "instagram_post_a_direct_offer": "DAHGwZ4nIJk",
    "instagram_post_b_curiosity": "DAHGwevpvOU",
    "instagram_post_c_social_proof": "DAHGwY_hAdU",
    "instagram_post_d_scarcity": "DAHGwYWKCiU",
    "instagram_post_e_community": "DAHGwao27QE",

    # Facebook Ad (1200x628)
    "facebook_a_direct_offer": "DAHGwdgGtgA",
    "facebook_b_curiosity": "DAHGwfthEcc",
    "facebook_c_social_proof": "DAHGwSGdhks",
    "facebook_d_scarcity": "DAHGwRcdsf0",
    "facebook_e_community": "DAHGwd0Z_5U",

    # Story/Reel (1080x1920)
    "story_a_direct_offer": "DAHGweYGtEY",
    "story_b_curiosity": "DAHGwYzv9Uc",
    "story_c_social_proof": "DAHGwROMeXk",
    "story_d_scarcity": "DAHGwbtQBkc",
    "story_e_community": "DAHGwXi10JE",
}

def refresh_token():
    """Refresh the access token if needed."""
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

    # Update config
    config["access_token"] = tokens["access_token"]
    config["refresh_token"] = tokens["refresh_token"]

    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)

    return tokens["access_token"]

def create_export(design_id):
    """Create an export job for a design."""
    url = f"{BASE_URL}/exports"
    payload = json.dumps({
        "design_id": design_id,
        "format": {"type": "png"}
    }).encode("utf-8")

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
            # Token expired, refresh and retry
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

def get_export_job(job_id):
    """Check export job status."""
    url = f"{BASE_URL}/exports/{job_id}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
    )

    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())

def download_file(url, filepath):
    """Download file from URL."""
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req, timeout=60)

    with open(filepath, "wb") as f:
        f.write(resp.read())

def main():
    os.makedirs("exports", exist_ok=True)

    print(f"Exporting {len(DESIGNS)} ad variants from Canva...")

    # Create all export jobs
    jobs = {}
    for name, design_id in DESIGNS.items():
        print(f"Creating export for {name} ({design_id})...")
        result = create_export(design_id)
        jobs[name] = result["job"]["id"]
        time.sleep(0.5)  # Rate limit protection

    print(f"\nWaiting for {len(jobs)} export jobs to complete...")

    # Poll until all complete
    completed = {}
    while len(completed) < len(jobs):
        for name, job_id in jobs.items():
            if name in completed:
                continue

            job = get_export_job(job_id)
            status = job["job"]["status"]

            if status == "success":
                url = job["job"]["urls"][0]["url"]
                filepath = f"exports/{name}.png"
                print(f"✓ {name} ready - downloading...")
                download_file(url, filepath)
                completed[name] = filepath
            elif status == "failed":
                print(f"✗ {name} FAILED: {job['job'].get('error', 'Unknown error')}")
                completed[name] = None
            elif status in ["in_progress", "pending"]:
                print(f"  {name}: {status}...")

        if len(completed) < len(jobs):
            time.sleep(2)

    print(f"\n✓ Export complete!")
    print(f"  Success: {sum(1 for v in completed.values() if v is not None)}/{len(jobs)}")
    print(f"  Files saved to: data/meta-ads/exports/")

    # Create manifest
    manifest = {
        "exported_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total": len(DESIGNS),
        "files": completed
    }

    with open("exports/manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    main()
