#!/usr/bin/env python3
"""Test Google Ads API against the MCC account directly."""

import json
import os
import urllib.request
import urllib.parse
import sys

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
    data = json.loads(resp.read())
    return data["access_token"]

def test_mcc_query(access_token):
    """Try querying the MCC account itself."""
    mcc_id = config["login_customer_id"]

    url = f"{config['base_url']}/customers/{mcc_id}/googleAds:search"

    # Try to list campaigns in the MCC
    query = "SELECT campaign.id, campaign.name FROM campaign LIMIT 1"
    payload = json.dumps({"query": query}).encode("utf-8")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": config["developer_token"],
        "Content-Type": "application/json",
    }

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        print("[OK] MCC campaign query succeeded:")
        print(json.dumps(data, indent=2))
        return True
    except urllib.error.HTTPError as e:
        print(f"[FAIL] MCC campaign query failed: {e.code} {e.reason}")
        error_body = e.read().decode()
        try:
            error_json = json.loads(error_body)
            print(json.dumps(error_json, indent=2))
        except:
            print(error_body)
        return False

def test_customer_info(access_token):
    """Get customer info for both accounts."""
    for cid_name, cid in [("MCC", config["login_customer_id"]), ("Operating", config["customer_id"])]:
        url = f"{config['base_url']}/customers/{cid}"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "developer-token": config["developer_token"],
        }

        req = urllib.request.Request(url, headers=headers)

        try:
            resp = urllib.request.urlopen(req, timeout=30)
            data = json.loads(resp.read())
            print(f"[OK] {cid_name} account info ({cid}):")
            print(json.dumps(data, indent=2))
        except urllib.error.HTTPError as e:
            print(f"[FAIL] {cid_name} account info failed: {e.code} {e.reason}")
            error_body = e.read().decode()
            try:
                print(json.dumps(json.loads(error_body), indent=2))
            except:
                print(error_body)
        print()

def main():
    print("Google Ads API MCC Test")
    print("=" * 50)
    print(f"MCC Account: {config['login_customer_id']}")
    print(f"Operating Account: {config['customer_id']}")
    print()

    access_token = get_access_token()
    print("[OK] Access token obtained")
    print()

    print("Test 1: Query MCC account directly (no login-customer-id header)...")
    test_mcc_query(access_token)
    print()

    print("Test 2: Get account info for both accounts...")
    test_customer_info(access_token)

if __name__ == "__main__":
    main()
