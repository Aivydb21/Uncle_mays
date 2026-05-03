#!/usr/bin/env python3
"""
Daily Meta A/B Test Performance Report
Pulls GA4 + Meta Ads Manager data and generates daily performance summary
"""

import json
import os
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path

# Load configs
ga_config = json.load(open(Path.home() / ".claude" / "ga-config.json"))
ga_oauth_creds = json.load(open(Path.home() / ".claude" / "ga-oauth-credentials.json"))
ga_token_data = json.load(open(Path.home() / ".claude" / "ga-oauth-token.json"))
meta_config = json.load(open(Path.home() / ".claude" / "meta-config.json"))

GA_PROPERTY_ID = ga_config["property_id"]
META_TOKEN = meta_config["access_token"]
META_URL = meta_config["base_url"]
AD_ACCOUNT_ID = meta_config["ad_account_id"]

# Campaign metadata (saved during setup)
CAMPAIGN_START = datetime(2026, 4, 14)
CAMPAIGN_END = datetime(2026, 4, 20)
TOTAL_BUDGET = 350  # $350 for 7 days


def refresh_ga_token():
    """Refresh GA4 OAuth access token"""
    refresh_payload = urllib.parse.urlencode({
        "client_id": ga_oauth_creds["installed"]["client_id"],
        "client_secret": ga_oauth_creds["installed"]["client_secret"],
        "refresh_token": ga_token_data["refresh_token"],
        "grant_type": "refresh_token",
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=refresh_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())["access_token"]


def get_ga4_data(start_date, end_date):
    """Get GA4 conversion data by utm_content"""
    access_token = refresh_ga_token()

    request_body = json.dumps({
        "dateRanges": [{
            "startDate": start_date.strftime("%Y-%m-%d"),
            "endDate": end_date.strftime("%Y-%m-%d"),
        }],
        "dimensions": [{"name": "sessionCampaignContent"}],  # utm_content
        "metrics": [
            {"name": "sessions"},
            {"name": "totalUsers"},
            {"name": "engagedSessions"},
            {"name": "engagementRate"},
            {"name": "conversions"},
        ],
        "dimensionFilter": {
            "filter": {
                "fieldName": "sessionCampaignName",
                "stringFilter": {"value": "produce_box_ab_test"},
            }
        },
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://analyticsdata.googleapis.com/v1beta/properties/{GA_PROPERTY_ID}:runReport",
        data=request_body,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def get_meta_campaign_data():
    """Get Meta Ads Manager campaign performance"""
    # First, find the campaign ID by name
    search_req = urllib.request.Request(
        f"{META_URL}/{AD_ACCOUNT_ID}/campaigns?fields=id,name&access_token={META_TOKEN}"
    )
    search_resp = urllib.request.urlopen(search_req, timeout=30)
    campaigns = json.loads(search_resp.read())

    campaign_id = None
    for campaign in campaigns.get("data", []):
        if "Produce Box A/B Test" in campaign.get("name", ""):
            campaign_id = campaign["id"]
            break

    if not campaign_id:
        return {"error": "Campaign not found"}

    # Get ads performance
    ads_req = urllib.request.Request(
        f"{META_URL}/{campaign_id}/ads?fields=id,name,adset{{name}},insights{{impressions,clicks,ctr,spend,cpm,cpc}}&access_token={META_TOKEN}"
    )
    ads_resp = urllib.request.urlopen(ads_req, timeout=30)
    return json.loads(ads_resp.read())


def calculate_cpa(spend, conversions):
    """Calculate cost per acquisition"""
    if conversions == 0:
        return float("inf")
    return spend / conversions


def generate_report():
    """Generate daily performance report"""
    today = datetime.now()
    days_elapsed = (today - CAMPAIGN_START).days

    if days_elapsed < 0:
        return "Campaign has not started yet (starts 2026-04-14)"

    if days_elapsed > 7:
        return "Campaign has ended (ran 2026-04-14 to 2026-04-20)"

    print(f"Fetching data for Meta A/B Test (Day {days_elapsed}/7)...\n")

    # Get GA4 data
    print("Pulling GA4 conversion data...")
    ga_data = get_ga4_data(CAMPAIGN_START, today)

    # Get Meta data
    print("Pulling Meta Ads Manager data...")
    meta_data = get_meta_campaign_data()

    # Parse GA4 results
    ga_variants = {}
    if "rows" in ga_data:
        for row in ga_data["rows"]:
            utm_content = row["dimensionValues"][0]["value"]
            sessions = int(row["metricValues"][0]["value"])
            users = int(row["metricValues"][1]["value"])
            engaged = int(row["metricValues"][2]["value"])
            engagement_rate = float(row["metricValues"][3]["value"])
            conversions = int(row["metricValues"][4]["value"])

            ga_variants[utm_content] = {
                "sessions": sessions,
                "users": users,
                "engaged_sessions": engaged,
                "engagement_rate": engagement_rate,
                "conversions": conversions,
                "conversion_rate": (conversions / sessions * 100) if sessions > 0 else 0,
            }

    # Parse Meta results
    meta_variants = {}
    total_spend = 0
    if "data" in meta_data:
        for ad in meta_data["data"]:
            ad_name = ad.get("name", "")
            if "insights" in ad and ad["insights"]["data"]:
                insight = ad["insights"]["data"][0]
                impressions = int(insight.get("impressions", 0))
                clicks = int(insight.get("clicks", 0))
                ctr = float(insight.get("ctr", 0))
                spend = float(insight.get("spend", 0))
                cpm = float(insight.get("cpm", 0))
                cpc = float(insight.get("cpc", 0))

                total_spend += spend

                # Extract utm_content from ad name (assumes naming: "Format - Variant X (Hook)")
                # Map to utm_content format
                # This is approximate - would need exact mapping logic

                meta_variants[ad_name] = {
                    "impressions": impressions,
                    "clicks": clicks,
                    "ctr": ctr,
                    "spend": spend,
                    "cpm": cpm,
                    "cpc": cpc,
                }

    # Generate report
    report = f"""
{'=' * 70}
DAILY META A/B TEST REPORT — {today.strftime('%Y-%m-%d')}
{'=' * 70}

Campaign Status: {'ACTIVE' if days_elapsed <= 7 else 'ENDED'}
Days Elapsed: {days_elapsed} / 7
Total Spend: ${total_spend:.2f} / ${TOTAL_BUDGET}
Remaining Budget: ${TOTAL_BUDGET - total_spend:.2f}

{'=' * 70}
GA4 CONVERSION DATA (by variant)
{'=' * 70}

"""

    # Sort variants by conversion rate
    sorted_variants = sorted(
        ga_variants.items(),
        key=lambda x: x[1]["conversion_rate"],
        reverse=True
    )

    for utm_content, data in sorted_variants:
        report += f"\n{utm_content}:\n"
        report += f"  Sessions: {data['sessions']}\n"
        report += f"  Users: {data['users']}\n"
        report += f"  Conversions: {data['conversions']}\n"
        report += f"  Conversion Rate: {data['conversion_rate']:.2f}%\n"
        report += f"  Engagement Rate: {data['engagement_rate']:.2f}%\n"

    report += f"\n{'=' * 70}\n"
    report += "META ADS MANAGER DATA\n"
    report += f"{'=' * 70}\n\n"

    for ad_name, data in meta_variants.items():
        report += f"{ad_name}:\n"
        report += f"  Impressions: {data['impressions']:,}\n"
        report += f"  Clicks: {data['clicks']}\n"
        report += f"  CTR: {data['ctr']:.2f}%\n"
        report += f"  Spend: ${data['spend']:.2f}\n"
        report += f"  CPC: ${data['cpc']:.2f}\n"
        report += f"  CPM: ${data['cpm']:.2f}\n\n"

    report += f"{'=' * 70}\n"
    report += "ALERTS & RECOMMENDATIONS\n"
    report += f"{'=' * 70}\n\n"

    # Check for underperformers (simplified logic - would need exact variant mapping)
    alerts = []
    if days_elapsed >= 2:  # 48-hour check
        for utm_content, data in ga_variants.items():
            if data["conversion_rate"] < 0.5 and data["sessions"] >= 50:
                alerts.append(f"⚠️  {utm_content}: Low conversion rate ({data['conversion_rate']:.2f}%) — RECOMMEND PAUSE")

    if alerts:
        for alert in alerts:
            report += alert + "\n"
    else:
        report += "✅ No alerts at this time\n"

    report += f"\n{'=' * 70}\n"

    return report


if __name__ == "__main__":
    report = generate_report()
    print(report)

    # Save report
    output_dir = Path.home() / "Desktop" / "business" / "ad-exports" / "meta-ab-test-2026-04-14" / "reports"
    output_dir.mkdir(exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    output_file = output_dir / f"daily-report-{today}.md"

    with open(output_file, "w") as f:
        f.write(report)

    print(f"\n✅ Report saved to: {output_file}")
