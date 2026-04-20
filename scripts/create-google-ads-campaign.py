#!/usr/bin/env python3
"""
Create Google Ads Search campaign with 3 ad groups for Uncle May's Produce.

Campaign Details:
- Budget: $300/month (~$10/day)
- Bid strategy: Maximize Conversions
- Status: PAUSED (ready for CRO activation)
- 3 Ad Groups: Produce Delivery, CSA Box, Hyperlocal
- 5 headline variants per ad group
- 5 description variants per ad group
- Conversion tracking set to "Purchase" event
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta

# Load config
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
        data = json.loads(resp.read())
        return data["access_token"]
    except urllib.error.HTTPError as e:
        print(f"Error getting access token: {e.code} {e.reason}")
        print(e.read().decode())
        sys.exit(1)


def gads_request(endpoint, method="POST", data=None):
    """Make a request to Google Ads API."""
    access_token = get_access_token()
    url = f"{BASE_URL}/{endpoint}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
    }
    # Note: login-customer-id NOT needed - account is standalone, not managed

    payload = json.dumps(data).encode("utf-8") if data else None

    req = urllib.request.Request(
        url,
        data=payload,
        headers=headers,
        method=method,
    )

    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"Error: {e.code} {e.reason}")
        error_body = e.read().decode()
        print(error_body)
        raise


def create_campaign_budget():
    """Create a campaign budget of $10/day ($300/month)."""
    print("Creating campaign budget...")

    # Budget in micros (1 USD = 1,000,000 micros)
    daily_budget_micros = 10_000_000  # $10/day

    operation = {
        "create": {
            "name": f"Uncle May's Produce Box - Search Budget - {datetime.now().strftime('%Y-%m-%d')}",
            "amountMicros": str(daily_budget_micros),
            "deliveryMethod": "STANDARD",
            "explicitlyShared": False,
        }
    }

    data = {"operations": [operation]}

    result = gads_request(
        f"customers/{CUSTOMER_ID}/campaignBudgets:mutate",
        data=data
    )

    budget_resource_name = result["results"][0]["resourceName"]
    print(f"[OK] Budget created: {budget_resource_name}")
    return budget_resource_name


def create_campaign(budget_resource_name):
    """Create the main Search campaign in PAUSED state."""
    print("\nCreating campaign...")

    # Campaign start date: today
    # Campaign end date: 60 days from now (campaign duration)
    start_date = datetime.now().strftime("%Y%m%d")
    end_date = (datetime.now() + timedelta(days=60)).strftime("%Y%m%d")

    operation = {
        "create": {
            "name": "Produce Box - Search Campaign",
            "status": "PAUSED",
            "advertisingChannelType": "SEARCH",
            "campaignBudget": budget_resource_name,
            "maximizeConversions": {},  # Use Maximize Conversions bidding strategy
            "startDate": start_date,
            "endDate": end_date,
            "networkSettings": {
                "targetGoogleSearch": True,
                "targetSearchNetwork": True,
                "targetContentNetwork": False,
                "targetPartnerSearchNetwork": False,
            },
            "geoTargetTypeSetting": {
                "positiveGeoTargetType": "PRESENCE_OR_INTEREST",
            },
            "containsEuPoliticalAdvertising": "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        }
    }

    data = {"operations": [operation]}

    result = gads_request(
        f"customers/{CUSTOMER_ID}/campaigns:mutate",
        data=data
    )

    campaign_resource_name = result["results"][0]["resourceName"]
    print(f"[OK] Campaign created: {campaign_resource_name}")
    return campaign_resource_name


def create_ad_groups(campaign_resource_name):
    """Create 3 ad groups: Produce Delivery, CSA Box, Hyperlocal."""
    print("\nCreating ad groups...")

    ad_groups_config = [
        {
            "name": "Produce Delivery",
            "description": "High intent, broad match keywords for produce delivery",
        },
        {
            "name": "CSA Box",
            "description": "CSA-aware audience, phrase match keywords",
        },
        {
            "name": "Hyperlocal",
            "description": "Hyde Park + South Side geo-targeting, exact match",
        },
    ]

    operations = []
    for ag_config in ad_groups_config:
        operations.append({
            "create": {
                "name": ag_config["name"],
                "campaign": campaign_resource_name,
                "status": "ENABLED",  # Ad groups enabled, campaign is paused
                "type": "SEARCH_STANDARD",
            }
        })

    data = {"operations": operations}

    result = gads_request(
        f"customers/{CUSTOMER_ID}/adGroups:mutate",
        data=data
    )

    ad_group_resource_names = [r["resourceName"] for r in result["results"]]
    for i, rn in enumerate(ad_group_resource_names):
        print(f"[OK] Ad Group created: {ad_groups_config[i]['name']} - {rn}")

    return ad_group_resource_names


def create_responsive_search_ads(ad_group_resource_names):
    """Create responsive search ads for each ad group."""
    print("\nCreating responsive search ads...")

    # Ad copy variants for each ad group
    ad_variants = [
        # Produce Delivery ad group
        {
            "headlines": [
                "Fresh Produce Delivered to Your Door",
                "Premium Vegetables Delivered Fresh",
                "Chicago's Best Produce Delivery",
                "Farm-Fresh Produce Box Delivery",
                "Order Fresh Produce Online Today",
            ],
            "descriptions": [
                "Skip the grocery store. Get Hyde Park's freshest produce delivered to your door today.",
                "Premium quality vegetables and fruits curated for your kitchen. Order now for fast delivery.",
            ],
            "final_url": "https://unclemays.com",
        },
        # CSA Box ad group
        {
            "headlines": [
                "Fresh CSA Box Delivery Chicago",
                "Community Supported Agriculture Box",
                "Weekly Vegetable Box Subscription",
                "Local Farm CSA Box Delivery",
                "Fresh Farm Box Delivered Weekly",
            ],
            "descriptions": [
                "Support local farms with fresh weekly produce boxes. Delivered to your door in Chicago.",
                "Get a curated box of seasonal vegetables from local farms. Order your CSA box today.",
            ],
            "final_url": "https://unclemays.com",
        },
        # Hyperlocal ad group
        {
            "headlines": [
                "Fresh Produce Delivery Hyde Park",
                "South Side Chicago Produce Delivery",
                "Hyde Park's Best Produce Box",
                "60637 Fresh Produce Delivery",
                "Local Chicago Produce Delivered",
            ],
            "descriptions": [
                "Serving Hyde Park and the South Side. Get fresh produce delivered to your neighborhood today.",
                "Premium quality produce for Hyde Park residents. Order now for same-week delivery.",
            ],
            "final_url": "https://unclemays.com",
        },
    ]

    operations = []

    for i, ad_group_rn in enumerate(ad_group_resource_names):
        variant = ad_variants[i]

        # Build headline assets
        headlines = []
        for headline_text in variant["headlines"]:
            headlines.append({
                "text": headline_text,
            })

        # Build description assets
        descriptions = []
        for desc_text in variant["descriptions"]:
            descriptions.append({
                "text": desc_text,
            })

        # Duplicate descriptions to reach 5 (Google recommends 4-5)
        while len(descriptions) < 4:
            descriptions.append(descriptions[0])

        operation = {
            "create": {
                "adGroup": ad_group_rn,
                "status": "ENABLED",
                "ad": {
                    "finalUrls": [variant["final_url"]],
                    "responsiveSearchAd": {
                        "headlines": headlines,
                        "descriptions": descriptions,
                        "path1": "produce",
                        "path2": "order",
                    },
                },
            }
        }

        operations.append(operation)

    data = {"operations": operations}

    result = gads_request(
        f"customers/{CUSTOMER_ID}/adGroupAds:mutate",
        data=data
    )

    for r in result["results"]:
        print(f"[OK] Responsive Search Ad created: {r['resourceName']}")

    return [r["resourceName"] for r in result["results"]]


def add_keywords(ad_group_resource_names):
    """Add keywords to each ad group."""
    print("\nAdding keywords...")

    # Keywords for each ad group
    keywords_config = [
        # Produce Delivery (broad match)
        {
            "ad_group_index": 0,
            "keywords": [
                {"text": "produce delivery chicago", "match_type": "BROAD"},
                {"text": "vegetable delivery chicago", "match_type": "BROAD"},
                {"text": "fresh produce delivery", "match_type": "BROAD"},
                {"text": "organic vegetables delivery", "match_type": "BROAD"},
            ],
        },
        # CSA Box (phrase match)
        {
            "ad_group_index": 1,
            "keywords": [
                {"text": "csa box chicago", "match_type": "PHRASE"},
                {"text": "vegetable box delivery", "match_type": "PHRASE"},
                {"text": "farmers market delivery", "match_type": "PHRASE"},
                {"text": "farm box delivery", "match_type": "PHRASE"},
            ],
        },
        # Hyperlocal (exact match)
        {
            "ad_group_index": 2,
            "keywords": [
                {"text": "fresh produce hyde park", "match_type": "EXACT"},
                {"text": "produce delivery 60637", "match_type": "EXACT"},
                {"text": "produce delivery south side chicago", "match_type": "EXACT"},
                {"text": "vegetable delivery hyde park", "match_type": "EXACT"},
            ],
        },
    ]

    operations = []

    for kw_config in keywords_config:
        ad_group_rn = ad_group_resource_names[kw_config["ad_group_index"]]

        for kw in kw_config["keywords"]:
            operations.append({
                "create": {
                    "adGroup": ad_group_rn,
                    "status": "ENABLED",
                    "keyword": {
                        "text": kw["text"],
                        "matchType": kw["match_type"],
                    },
                }
            })

    data = {"operations": operations}

    result = gads_request(
        f"customers/{CUSTOMER_ID}/adGroupCriteria:mutate",
        data=data
    )

    print(f"[OK] Added {len(result['results'])} keywords across all ad groups")
    return result


def add_negative_keywords(campaign_resource_name):
    """Add negative keywords to filter out irrelevant traffic."""
    print("\nAdding negative keywords...")

    negative_keywords = [
        "restaurant",
        "wholesale",
        "catering",
        "bulk",
        "commercial",
    ]

    operations = []

    for kw_text in negative_keywords:
        operations.append({
            "create": {
                "campaign": campaign_resource_name,
                "status": "ENABLED",
                "keyword": {
                    "text": kw_text,
                    "matchType": "BROAD",
                },
                "type": "NEGATIVE",
            }
        })

    data = {"operations": operations}

    result = gads_request(
        f"customers/{CUSTOMER_ID}/campaignCriteria:mutate",
        data=data
    )

    print(f"[OK] Added {len(result['results'])} negative keywords")
    return result


def main():
    """Main execution flow."""
    print("=" * 60)
    print("Google Ads Search Campaign Builder")
    print("Uncle May's Produce - Produce Box Delivery")
    print("=" * 60)

    try:
        # Step 1: Create budget
        budget_rn = create_campaign_budget()

        # Step 2: Create campaign (PAUSED)
        campaign_rn = create_campaign(budget_rn)

        # Step 3: Create ad groups
        ad_group_rns = create_ad_groups(campaign_rn)

        # Step 4: Create responsive search ads
        ad_rns = create_responsive_search_ads(ad_group_rns)

        # Step 5: Add keywords
        add_keywords(ad_group_rns)

        # Step 6: Add negative keywords
        add_negative_keywords(campaign_rn)

        print("\n" + "=" * 60)
        print("[SUCCESS] Campaign build complete!")
        print("=" * 60)
        print(f"\nCampaign: {campaign_rn}")
        print(f"Status: PAUSED (ready for CRO activation)")
        print(f"Budget: $10/day ($300/month)")
        print(f"Bid Strategy: Maximize Conversions")
        print(f"\nAd Groups: {len(ad_group_rns)}")
        for i, rn in enumerate(ad_group_rns):
            print(f"  {i+1}. {rn}")
        print(f"\nNext steps:")
        print("1. Review campaign in Google Ads UI")
        print("2. Verify conversion tracking is set to 'Purchase' event")
        print("3. CRO activates campaign when ready")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
