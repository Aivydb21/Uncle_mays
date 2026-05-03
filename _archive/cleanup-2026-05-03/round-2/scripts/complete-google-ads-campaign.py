#!/usr/bin/env python3
"""
Complete Google Ads Search campaign by adding ads and keywords to existing ad groups.

Existing campaign: customers/6015592923/campaigns/23759756599
- Produce Delivery: customers/6015592923/adGroups/194132661806
- CSA Box: customers/6015592923/adGroups/194132661966
- Hyperlocal: customers/6015592923/adGroups/194132662006
"""

import json
import os
import sys
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
CUSTOMER_ID = config["customer_id"]
BASE_URL = config["base_url"]
OAUTH_TOKEN_URL = config["oauth_token_url"]

# Existing resources
CAMPAIGN_RN = "customers/6015592923/campaigns/23759756599"
AD_GROUP_RNS = [
    "customers/6015592923/adGroups/194132661806",  # Produce Delivery
    "customers/6015592923/adGroups/194132661966",  # CSA Box
    "customers/6015592923/adGroups/194132662006",  # Hyperlocal
]


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
    data = json.loads(resp.read())
    return data["access_token"]


def gads_request(endpoint, method="POST", data=None):
    """Make a request to Google Ads API."""
    access_token = get_access_token()
    url = f"{BASE_URL}/{endpoint}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": DEVELOPER_TOKEN,
        "Content-Type": "application/json",
    }

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


def create_responsive_search_ads():
    """Create responsive search ads for each ad group."""
    print("Creating responsive search ads...")

    # Ad copy variants for each ad group (30 char headlines, 90 char descriptions)
    ad_variants = [
        # Produce Delivery ad group
        {
            "headlines": [
                "Fresh Produce Delivered",  # 23 chars
                "Premium Veggies Delivered",  # 26 chars
                "Chicago Produce Delivery",  # 25 chars
                "Farm-Fresh Produce Box",  # 23 chars
                "Order Fresh Produce Today",  # 26 chars
            ],
            "descriptions": [
                "Skip the store. Get Hyde Park's freshest produce delivered to your door today.",  # 79 chars
                "Premium vegetables & fruits curated for your kitchen. Order now for fast delivery.",  # 87 chars
                "Fresh, local produce delivered weekly. Support local farms. Order your box today.",  # 85 chars
                "Restaurant-quality produce at home. Fast delivery across Chicago. Order now.",  # 76 chars
            ],
            "final_url": "https://unclemays.com",
        },
        # CSA Box ad group
        {
            "headlines": [
                "CSA Box Delivery Chicago",  # 24 chars
                "Weekly Veggie Box",  # 17 chars
                "Local Farm CSA Box",  # 18 chars
                "Fresh Farm Box Weekly",  # 21 chars
                "Community Farm Box",  # 18 chars
            ],
            "descriptions": [
                "Support local farms with fresh weekly produce boxes. Delivered in Chicago.",  # 75 chars
                "Get seasonal vegetables from local farms. Order your CSA box today.",  # 69 chars
                "Farm-fresh produce delivered weekly. Support your community. Order now.",  # 73 chars
                "Join Chicago's best CSA. Fresh vegetables from local farms every week.",  # 73 chars
            ],
            "final_url": "https://unclemays.com",
        },
        # Hyperlocal ad group
        {
            "headlines": [
                "Hyde Park Produce Delivery",  # 26 chars
                "South Side Produce Box",  # 22 chars
                "Hyde Park Fresh Produce",  # 23 chars
                "60637 Produce Delivery",  # 22 chars
                "Local Chicago Produce",  # 21 chars
            ],
            "descriptions": [
                "Serving Hyde Park & South Side. Fresh produce delivered to your neighborhood.",  # 79 chars
                "Premium produce for Hyde Park residents. Order now for same-week delivery.",  # 75 chars
                "Your neighborhood produce box. Fresh, local, delivered to Hyde Park this week.",  # 80 chars
                "South Side's freshest produce. Support local. Order your box today.",  # 68 chars
            ],
            "final_url": "https://unclemays.com",
        },
    ]

    operations = []

    for i, ad_group_rn in enumerate(AD_GROUP_RNS):
        variant = ad_variants[i]

        # Build headline assets (5 required)
        headlines = []
        for headline_text in variant["headlines"]:
            headlines.append({"text": headline_text})

        # Build description assets (4-5 required)
        descriptions = []
        for desc_text in variant["descriptions"]:
            descriptions.append({"text": desc_text})

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


def add_keywords():
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
        ad_group_rn = AD_GROUP_RNS[kw_config["ad_group_index"]]

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


def add_negative_keywords():
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
                "campaign": CAMPAIGN_RN,
                "negative": True,
                "keyword": {
                    "text": kw_text,
                    "matchType": "BROAD",
                },
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
    print("Complete Google Ads Search Campaign")
    print("Uncle May's Produce - Add Ads & Keywords")
    print("=" * 60)

    try:
        # Step 1: Create responsive search ads
        ad_rns = create_responsive_search_ads()

        # Step 2: Add keywords
        add_keywords()

        # Step 3: Add negative keywords
        add_negative_keywords()

        print("\n" + "=" * 60)
        print("[SUCCESS] Campaign build complete!")
        print("=" * 60)
        print(f"\nCampaign: {CAMPAIGN_RN}")
        print(f"Status: PAUSED (ready for CRO activation)")
        print(f"\nAd Groups: {len(AD_GROUP_RNS)}")
        for rn in AD_GROUP_RNS:
            print(f"  - {rn}")
        print(f"\nAds Created: {len(ad_rns)}")
        print(f"\nNext steps:")
        print("1. Review campaign in Google Ads UI")
        print("2. Verify conversion tracking is set to 'Purchase' event")
        print("3. CRO activates campaign when ready (April 21 launch)")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
