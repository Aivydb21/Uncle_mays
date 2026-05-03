#!/usr/bin/env python3
"""Test Google Ads API connection and diagnose 403 errors."""

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

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        return data["access_token"]
    except urllib.error.HTTPError as e:
        print(f"OAuth token exchange failed: {e.code} {e.reason}")
        print(e.read().decode())
        sys.exit(1)

def list_accessible_customers(access_token):
    """List accessible customer accounts."""
    url = f"{config['base_url']}/customers:listAccessibleCustomers"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "developer-token": config["developer_token"],
        },
    )

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        print("[OK] listAccessibleCustomers succeeded:")
        print(json.dumps(data, indent=2))
        return data
    except urllib.error.HTTPError as e:
        print(f"[FAIL] listAccessibleCustomers failed: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        try:
            error_json = json.loads(error_body)
            print(json.dumps(error_json, indent=2))
        except:
            pass
        return None

def search_campaigns(access_token):
    """Try a simple GAQL search query."""
    customer_id = config["customer_id"]
    login_customer_id = config["login_customer_id"]

    url = f"{config['base_url']}/customers/{customer_id}/googleAds:search"

    query = "SELECT campaign.id, campaign.name FROM campaign LIMIT 1"
    payload = json.dumps({"query": query}).encode("utf-8")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": config["developer_token"],
        "login-customer-id": str(login_customer_id),
        "Content-Type": "application/json",
    }

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        print("[OK] Campaign search succeeded:")
        print(json.dumps(data, indent=2))
        return data
    except urllib.error.HTTPError as e:
        print(f"[FAIL] Campaign search failed: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        try:
            error_json = json.loads(error_body)
            print(json.dumps(error_json, indent=2))
        except:
            pass
        return None

def main():
    print("Google Ads API Diagnostic Test")
    print("=" * 50)
    print(f"API Base URL: {config['base_url']}")
    print(f"Developer Token: {config['developer_token'][:10]}...")
    print(f"Login Customer ID (MCC): {config['login_customer_id']}")
    print(f"Customer ID (Operating): {config['customer_id']}")
    print()

    print("Step 1: Exchange refresh token for access token...")
    access_token = get_access_token()
    print(f"[OK] Access token obtained: {access_token[:20]}...")
    print()

    print("Step 2: List accessible customers...")
    customers = list_accessible_customers(access_token)
    print()

    print("Step 3: Search campaigns in operating account...")
    campaigns = search_campaigns(access_token)
    print()

    if customers and campaigns:
        print("[OK] All API tests passed!")
    else:
        print("[FAIL] Some API tests failed - see errors above")
        sys.exit(1)

if __name__ == "__main__":
    main()
