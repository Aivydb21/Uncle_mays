#!/usr/bin/env python3
"""Test Google Ads API access and list accessible customers."""

import json
import os
import urllib.request
import urllib.parse

# Load config
config_path = os.path.expanduser("~/.claude/google-ads-config.json")
with open(config_path) as f:
    config = json.load(f)

def get_access_token():
    """Exchange refresh token for access token."""
    payload = urllib.parse.urlencode({
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "refresh_token": config["refresh_token"],
        "grant_type": "refresh_token",
    }).encode("utf-8")

    req = urllib.request.Request(
        config["oauth_token_url"],
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())["access_token"]

def list_accessible_customers():
    """List all accessible customer accounts."""
    access_token = get_access_token()

    url = f"{config['base_url']}/customers:listAccessibleCustomers"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": config["developer_token"],
    }

    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())

# Test access
print("Testing Google Ads API access...")
print()

try:
    result = list_accessible_customers()
    print("SUCCESS! API is accessible.")
    print()
    print(f"Accessible customers: {len(result.get('resourceNames', []))}")
    for resource_name in result.get("resourceNames", []):
        customer_id = resource_name.split("/")[-1]
        print(f"  - {customer_id} ({resource_name})")
    print()

    # Check if our configured customer is in the list
    configured_customer = config["customer_id"]
    configured_login_customer = config["login_customer_id"]

    print(f"Configured customer_id: {configured_customer}")
    print(f"Configured login_customer_id (MCC): {configured_login_customer}")
    print()

    accessible_ids = [rn.split("/")[-1] for rn in result.get("resourceNames", [])]

    if configured_customer in accessible_ids:
        print(f"[OK] Customer {configured_customer} is accessible")
    else:
        print(f"[ERROR] Customer {configured_customer} is NOT in accessible list!")

    if configured_login_customer in accessible_ids:
        print(f"[OK] MCC {configured_login_customer} is accessible")
    else:
        print(f"[ERROR] MCC {configured_login_customer} is NOT in accessible list!")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
