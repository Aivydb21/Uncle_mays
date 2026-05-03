#!/usr/bin/env python3
"""
Test direct access to Google Ads account without MCC
"""

import json
import os
import urllib.request
import urllib.parse
import urllib.error

# Load config
config_path = os.path.expanduser("~/.claude/google-ads-config.json")
with open(config_path) as f:
    config = json.load(f)

DEVELOPER_TOKEN = config["developer_token"]
CLIENT_ID = config["client_id"]
CLIENT_SECRET = config["client_secret"]
REFRESH_TOKEN = config["refresh_token"]
CUSTOMER_ID = config["customer_id"]  # 6015592923
BASE_URL = config["base_url"]
OAUTH_TOKEN_URL = config["oauth_token_url"]

def get_access_token():
    """Exchange refresh token for access token."""
    payload = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN,
        "grant_type": "refresh_token",
    }).encode("utf-8")

    req = urllib.request.Request(
        OAUTH_TOKEN_URL,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())["access_token"]

def test_direct_access():
    """Test accessing account 6015592923 directly without MCC."""
    print("Testing DIRECT access (no login-customer-id header)...")
    print(f"Customer ID: {CUSTOMER_ID}")
    print()

    access_token = get_access_token()

    # Try a simple query
    query = "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1"

    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/googleAds:search"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        # NO login-customer-id header
        "Content-Type": "application/json",
    }

    payload = json.dumps({"query": query}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        print("✓ SUCCESS! Direct access works!")
        print()
        print("Response:", json.dumps(result, indent=2))
        print()
        print("RECOMMENDATION: Remove login_customer_id from config and use direct access")
        return True
    except urllib.error.HTTPError as e:
        print(f"✗ FAILED: {e.code} {e.reason}")
        print(e.read().decode())
        return False

if __name__ == "__main__":
    test_direct_access()
