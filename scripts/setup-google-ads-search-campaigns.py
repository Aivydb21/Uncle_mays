#!/usr/bin/env python3
"""
Setup Google Ads standard search campaigns for Uncle May's Produce
Task: UNC-96

Creates campaigns in PAUSED status for board review before activation.
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta

# Load Google Ads config
config_path = os.path.expanduser("~/.claude/google-ads-config.json")
with open(config_path) as f:
    config = json.load(f)

DEVELOPER_TOKEN = config["developer_token"]
CLIENT_ID = config["client_id"]
CLIENT_SECRET = config["client_secret"]
REFRESH_TOKEN = config["refresh_token"]
LOGIN_CUSTOMER_ID = config["login_customer_id"]
CUSTOMER_ID = config["customer_id"]
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

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())["access_token"]
    except urllib.error.HTTPError as e:
        print(f"OAuth error: {e.code} {e.reason}")
        print(e.read().decode())
        sys.exit(1)

def google_ads_request(endpoint, query=None, method="POST"):
    """Make a request to Google Ads API."""
    access_token = get_access_token()

    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/{endpoint}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        # Removed login-customer-id - using direct access instead of MCC
        "Content-Type": "application/json",
    }

    if query:
        payload = json.dumps({"query": query}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"API error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        return None

def create_budget():
    """Create campaign budget ($5/day)."""
    print("Creating campaign budget ($5/day)...")

    # Budget in micros: $5 = 5,000,000 micros
    budget_amount_micros = 5_000_000

    mutation = {
        "operations": [{
            "create": {
                "name": f"Uncle May's Search Budget - {datetime.now().strftime('%Y%m%d')}",
                "amount_micros": budget_amount_micros,
                "delivery_method": "STANDARD",
                "explicitly_shared": False,
            }
        }]
    }

    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/campaignBudgets:mutate"
    access_token = get_access_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        # Removed login-customer-id - using direct access instead of MCC
        "Content-Type": "application/json",
    }

    payload = json.dumps(mutation).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        budget_resource_name = result["results"][0]["resourceName"]
        print(f"[OK] Budget created: {budget_resource_name}")
        return budget_resource_name
    except urllib.error.HTTPError as e:
        print(f"Budget creation error: {e.code} {e.reason}")
        print(e.read().decode())
        return None

def create_campaign(budget_resource_name):
    """Create search campaign in PAUSED status."""
    print("Creating search campaign (PAUSED for board review)...")

    start_date = (datetime.now() + timedelta(days=1)).strftime("%Y%m%d")

    mutation = {
        "operations": [{
            "create": {
                "name": "Uncle May's - Chicago Produce Delivery",
                "status": "PAUSED",  # Board must approve before activating
                "advertising_channel_type": "SEARCH",
                "campaign_budget": budget_resource_name,
                "network_settings": {
                    "target_google_search": True,
                    "target_search_network": True,
                    "target_content_network": False,
                    "target_partner_search_network": False,
                },
                "manual_cpc": {},  # Manual CPC bidding
                "start_date": start_date,
                "geo_target_type_setting": {
                    "positive_geo_target_type": "PRESENCE_OR_INTEREST"
                },
                "contains_eu_political_advertising": "UNSPECIFIED"
            }
        }]
    }

    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/campaigns:mutate"
    access_token = get_access_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        # Removed login-customer-id - using direct access instead of MCC
        "Content-Type": "application/json",
    }

    payload = json.dumps(mutation).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        campaign_resource_name = result["results"][0]["resourceName"]
        print(f"[OK] Campaign created: {campaign_resource_name}")
        return campaign_resource_name
    except urllib.error.HTTPError as e:
        print(f"Campaign creation error: {e.code} {e.reason}")
        print(e.read().decode())
        return None

def add_geo_targeting(campaign_resource_name):
    """Add Chicago metro area geo targeting."""
    print("Adding Chicago metro geo targeting...")

    # Chicago metro area criterion ID: 1014044 (Chicago-Naperville-Elgin, IL-IN-WI)
    mutation = {
        "operations": [{
            "create": {
                "campaign": campaign_resource_name,
                "geo_target_constant": "geoTargetConstants/1014044",  # Chicago metro
            }
        }]
    }

    url = f"{BASE_URL}/customers/{CUSTOMER_ID}/campaignCriteria:mutate"
    access_token = get_access_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        # Removed login-customer-id - using direct access instead of MCC
        "Content-Type": "application/json",
    }

    payload = json.dumps(mutation).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        print(f"[OK] Geo targeting added: Chicago metro")
        return True
    except urllib.error.HTTPError as e:
        print(f"Geo targeting error: {e.code} {e.reason}")
        print(e.read().decode())
        return False

def main():
    print("=" * 60)
    print("Google Ads Search Campaign Setup - Uncle May's Produce")
    print("Task: UNC-96")
    print("=" * 60)
    print()

    print(f"Customer ID: {CUSTOMER_ID}")
    print(f"Access Mode: Direct (no MCC)")
    print(f"API Version: {BASE_URL.split('/')[-1]}")
    print()

    # Step 1: Create budget
    budget_resource_name = create_budget()
    if not budget_resource_name:
        print("[FAIL] Failed to create budget. Exiting.")
        sys.exit(1)

    print()

    # Step 2: Create campaign
    campaign_resource_name = create_campaign(budget_resource_name)
    if not campaign_resource_name:
        print("[FAIL] Failed to create campaign. Exiting.")
        sys.exit(1)

    print()

    # Step 3: Add geo targeting
    if not add_geo_targeting(campaign_resource_name):
        print("[FAIL] Failed to add geo targeting. Campaign exists but incomplete.")
        sys.exit(1)

    print()
    print("=" * 60)
    print("[OK] Campaign structure created successfully!")
    print()
    print("Campaign Status: PAUSED (awaiting board approval)")
    print("Next steps:")
    print("  1. Create ad groups (requires separate script)")
    print("  2. Add keywords to ad groups")
    print("  3. Create Responsive Search Ads")
    print("  4. Add audience signals (observation mode)")
    print("  5. Board approval to activate")
    print("=" * 60)

    # Save campaign details for next steps
    campaign_data = {
        "customer_id": CUSTOMER_ID,
        "campaign_resource_name": campaign_resource_name,
        "budget_resource_name": budget_resource_name,
        "created_at": datetime.now().isoformat(),
        "status": "PAUSED",
    }

    output_file = "google-ads-campaign-setup.json"
    with open(output_file, "w") as f:
        json.dump(campaign_data, f, indent=2)

    print(f"\nCampaign details saved to: {output_file}")

if __name__ == "__main__":
    main()
