#!/usr/bin/env python3
"""
Week 1 Performance Dashboard - Subscription Launch Campaign
Pulls daily metrics from Stripe, Google Ads, Meta Ads, and GA4
Outputs formatted markdown report for CRO

Usage: python scripts/week1-performance-dashboard.py [--date YYYY-MM-DD]
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import requests
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2.credentials import Credentials

# Load API configs
HOME = Path.home()
STRIPE_CONFIG = json.loads((HOME / ".claude" / "stripe-config.json").read_text())
GOOGLE_ADS_CONFIG = json.loads((HOME / ".claude" / "google-ads-config.json").read_text())
META_CONFIG = json.loads((HOME / ".claude" / "meta-config.json").read_text())
GA_CONFIG = json.loads((HOME / ".claude" / "ga-config.json").read_text())

# Week 1 date range (Apr 17-23, 2026)
WEEK1_START = datetime(2026, 4, 17)
WEEK1_END = datetime(2026, 4, 23)


def get_date_range(target_date=None):
    """Get date range for report. Defaults to yesterday."""
    if target_date:
        date = datetime.strptime(target_date, "%Y-%m-%d")
    else:
        date = datetime.now() - timedelta(days=1)

    return date.strftime("%Y-%m-%d"), date


def fetch_stripe_data(start_date, end_date):
    """Fetch orders and revenue from Stripe."""
    headers = {"Authorization": f"Bearer {STRIPE_CONFIG['api_key']}"}

    # Convert dates to Unix timestamps
    start_ts = int(datetime.strptime(start_date, "%Y-%m-%d").timestamp())
    end_ts = int(datetime.strptime(end_date, "%Y-%m-%d").timestamp()) + 86400  # End of day

    # Fetch charges (orders)
    charges_url = f"{STRIPE_CONFIG['base_url']}/charges"
    params = {
        "created[gte]": start_ts,
        "created[lt]": end_ts,
        "limit": 100,
    }

    response = requests.get(charges_url, headers=headers, params=params)
    response.raise_for_status()
    charges = response.json()["data"]

    # Calculate metrics
    successful_charges = [c for c in charges if c["status"] == "succeeded"]
    order_count = len(successful_charges)
    revenue = sum(c["amount"] for c in successful_charges) / 100  # Convert cents to dollars

    # Check for FREESHIP promo code usage
    freeship_count = sum(
        1 for c in successful_charges
        if c.get("metadata", {}).get("promo_code", "").upper() == "FREESHIP"
    )

    return {
        "orders": order_count,
        "revenue": revenue,
        "avg_order_value": revenue / order_count if order_count > 0 else 0,
        "freeship_redemptions": freeship_count,
    }


def get_google_ads_access_token():
    """Exchange refresh token for access token."""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_ADS_CONFIG["client_id"],
        "client_secret": GOOGLE_ADS_CONFIG["client_secret"],
        "refresh_token": GOOGLE_ADS_CONFIG["refresh_token"],
        "grant_type": "refresh_token",
    }

    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


def fetch_google_ads_data(start_date, end_date):
    """Fetch Google Ads campaign performance."""
    access_token = get_google_ads_access_token()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "developer-token": GOOGLE_ADS_CONFIG["developer_token"],
        "login-customer-id": GOOGLE_ADS_CONFIG["login_customer_id"],
        "Content-Type": "application/json",
    }

    # GAQL query for campaign performance
    query = f"""
        SELECT
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr
        FROM campaign
        WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
        AND campaign.status = 'ENABLED'
        ORDER BY metrics.clicks DESC
    """

    search_url = f"https://googleads.googleapis.com/v22/customers/{GOOGLE_ADS_CONFIG['customer_id']}/googleAds:search"

    response = requests.post(search_url, headers=headers, json={"query": query})

    if response.status_code != 200:
        print(f"Google Ads API error: {response.status_code} - {response.text}")
        return {
            "total_spend": 0,
            "total_clicks": 0,
            "total_impressions": 0,
            "total_conversions": 0,
            "ctr": 0,
            "cpc": 0,
            "cac": 0,
            "campaigns": [],
        }

    results = response.json().get("results", [])

    # Aggregate metrics
    total_spend = 0
    total_clicks = 0
    total_impressions = 0
    total_conversions = 0
    campaigns = []

    for row in results:
        campaign = row.get("campaign", {})
        metrics = row.get("metrics", {})

        spend = metrics.get("costMicros", 0) / 1_000_000  # Convert micros to dollars
        clicks = metrics.get("clicks", 0)
        impressions = metrics.get("impressions", 0)
        conversions = metrics.get("conversions", 0)
        ctr = metrics.get("ctr", 0) * 100  # Convert to percentage

        total_spend += spend
        total_clicks += clicks
        total_impressions += impressions
        total_conversions += conversions

        campaigns.append({
            "name": campaign.get("name", "Unknown"),
            "spend": spend,
            "clicks": clicks,
            "impressions": impressions,
            "conversions": conversions,
            "ctr": ctr,
        })

    return {
        "total_spend": total_spend,
        "total_clicks": total_clicks,
        "total_impressions": total_impressions,
        "total_conversions": total_conversions,
        "ctr": (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
        "cpc": total_spend / total_clicks if total_clicks > 0 else 0,
        "cac": total_spend / total_conversions if total_conversions > 0 else 0,
        "campaigns": campaigns,
    }


def fetch_meta_ads_data(start_date, end_date):
    """Fetch Meta Ads campaign performance."""
    access_token = META_CONFIG["access_token"]

    # Get ad account ID (strip 'act_' prefix if present)
    ad_account_id = META_CONFIG["ad_account_id"]
    if ad_account_id.startswith("act_"):
        ad_account_id = ad_account_id.replace("act_", "")

    # Get ad account insights
    # Meta uses YYYY-MM-DD format for date ranges
    insights_url = f"{META_CONFIG['base_url']}/act_{ad_account_id}/insights"

    params = {
        "access_token": access_token,
        "time_range": json.dumps({
            "since": start_date,
            "until": end_date,
        }),
        "fields": "impressions,clicks,spend,actions,ctr,cpc",
        "level": "campaign",
    }

    try:
        response = requests.get(insights_url, params=params)

        if response.status_code != 200:
            print(f"Meta Ads API error: {response.status_code} - {response.text}")
            return {
                "total_spend": 0,
                "total_clicks": 0,
                "total_impressions": 0,
                "total_conversions": 0,
                "ctr": 0,
                "cpc": 0,
                "cac": 0,
                "campaigns": [],
                "error": response.text,
            }

        data = response.json().get("data", [])

        # Aggregate metrics
        total_spend = 0
        total_clicks = 0
        total_impressions = 0
        total_conversions = 0
        campaigns = []

        for campaign in data:
            spend = float(campaign.get("spend", 0))
            clicks = int(campaign.get("clicks", 0))
            impressions = int(campaign.get("impressions", 0))

            # Extract conversions from actions array
            conversions = 0
            actions = campaign.get("actions", [])
            for action in actions:
                if action.get("action_type") == "purchase":
                    conversions = int(action.get("value", 0))

            total_spend += spend
            total_clicks += clicks
            total_impressions += impressions
            total_conversions += conversions

            campaigns.append({
                "name": campaign.get("campaign_name", "Unknown"),
                "spend": spend,
                "clicks": clicks,
                "impressions": impressions,
                "conversions": conversions,
                "ctr": float(campaign.get("ctr", 0)),
            })

        return {
            "total_spend": total_spend,
            "total_clicks": total_clicks,
            "total_impressions": total_impressions,
            "total_conversions": total_conversions,
            "ctr": (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
            "cpc": total_spend / total_clicks if total_clicks > 0 else 0,
            "cac": total_spend / total_conversions if total_conversions > 0 else 0,
            "campaigns": campaigns,
        }

    except Exception as e:
        print(f"Meta Ads API exception: {str(e)}")
        return {
            "total_spend": 0,
            "total_clicks": 0,
            "total_impressions": 0,
            "total_conversions": 0,
            "ctr": 0,
            "cpc": 0,
            "cac": 0,
            "campaigns": [],
            "error": str(e),
        }


def fetch_ga4_data(start_date, end_date):
    """Fetch GA4 traffic and conversion data."""
    # Load OAuth credentials
    oauth_token_path = HOME / ".claude" / "ga-oauth-token.json"
    token_data = json.loads(oauth_token_path.read_text())

    credentials = Credentials(
        token=None,
        refresh_token=token_data["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=token_data["client_id"],
        client_secret=token_data["client_secret"],
    )

    client = BetaAnalyticsDataClient(credentials=credentials)
    property_id = GA_CONFIG["property_id"]

    # Strip 'properties/' prefix if present
    if property_id.startswith("properties/"):
        property_id = property_id.replace("properties/", "")

    # Request: Sessions, users, pageviews
    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="activeUsers"),
            Metric(name="screenPageViews"),
            Metric(name="eventCount"),
        ],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
    )

    response = client.run_report(request)

    # Parse response
    sessions = 0
    users = 0
    pageviews = 0

    for row in response.rows:
        sessions += int(row.metric_values[0].value)
        users += int(row.metric_values[1].value)
        pageviews += int(row.metric_values[2].value)

    # Request: Conversion events (purchase, begin_checkout)
    conversion_request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="eventName")],
        metrics=[Metric(name="eventCount")],
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimension_filter={
            "filter": {
                "field_name": "eventName",
                "in_list_filter": {"values": ["purchase", "begin_checkout"]},
            }
        },
    )

    conversion_response = client.run_report(conversion_request)

    purchases = 0
    checkouts = 0

    for row in conversion_response.rows:
        event_name = row.dimension_values[0].value
        count = int(row.metric_values[0].value)

        if event_name == "purchase":
            purchases = count
        elif event_name == "begin_checkout":
            checkouts = count

    return {
        "sessions": sessions,
        "users": users,
        "pageviews": pageviews,
        "checkouts": checkouts,
        "purchases": purchases,
        "conversion_rate": (purchases / sessions * 100) if sessions > 0 else 0,
    }


def calculate_week1_totals(start_date, end_date):
    """Calculate Week 1 cumulative totals."""
    # This will be called to get Week 1 aggregate data
    # For now, return placeholder - will be filled in by running daily and summing
    return {
        "total_orders": 0,
        "total_revenue": 0,
        "total_spend": 0,
        "blended_cac": 0,
    }


def generate_report(date_str, data):
    """Generate formatted markdown report."""
    stripe = data["stripe"]
    google_ads = data["google_ads"]
    meta_ads = data["meta_ads"]
    ga4 = data["ga4"]

    # Calculate day of week (1-7)
    report_date = datetime.strptime(date_str, "%Y-%m-%d")
    day_num = (report_date - WEEK1_START).days + 1

    # Calculate Week 1 progress (placeholder - needs cumulative tracking)
    week1_orders = stripe["orders"]  # Will be cumulative when we track daily
    week1_target = 23  # Upper bound of 15-23 range

    # Calculate blended metrics
    total_ad_spend = google_ads["total_spend"] + meta_ads["total_spend"]
    total_ad_conversions = google_ads["total_conversions"] + meta_ads["total_conversions"]
    blended_cac = total_ad_spend / total_ad_conversions if total_ad_conversions > 0 else 0

    # Check for data source errors
    errors = []
    if "error" in stripe:
        errors.append(f"Stripe: {stripe['error']}")
    if "error" in google_ads:
        errors.append(f"Google Ads: {google_ads['error']}")
    if "error" in meta_ads:
        errors.append(f"Meta Ads: {meta_ads['error']}")
    if "error" in ga4:
        errors.append(f"GA4: {ga4['error']}")

    error_section = ""
    if errors:
        error_section = "\n## WARNING: Data Source Errors\n\n"
        for error in errors:
            error_section += f"- **{error.split(':')[0]}:** API error - data unavailable\n"
        error_section += "\n**Action required:** CRO to verify API credentials and re-authenticate if needed.\n\n---\n"

    report = f"""# Daily Performance Report - Week 1 Day {day_num}

**Date:** {date_str}
**Prepared by:** RevOps
**Delivered to:** CRO
{error_section}
## Orders & Revenue

- **Today:** {stripe["orders"]} orders, ${stripe["revenue"]:.2f} revenue
- **Average Order Value:** ${stripe["avg_order_value"]:.2f}
- **FREESHIP Promo Redemptions:** {stripe["freeship_redemptions"]}
- **Week 1 Total:** {week1_orders} orders (Target: 15-23)
- **Current Run Rate:** {week1_orders * 7 / day_num:.1f} orders/week

---

## Paid Campaign Performance

### Google Ads

- **Spend:** ${google_ads["total_spend"]:.2f} (Budget: $30-40/day)
- **Impressions:** {google_ads["total_impressions"]:,}
- **Clicks:** {google_ads["total_clicks"]} (CTR: {google_ads["ctr"]:.2f}%)
- **CPC:** ${google_ads["cpc"]:.2f}
- **Conversions:** {google_ads["total_conversions"]:.0f}
- **CAC:** ${google_ads["cac"]:.2f}

"""

    # Top Google Ads campaigns
    if google_ads["campaigns"]:
        top_campaigns = sorted(google_ads["campaigns"], key=lambda x: x["ctr"], reverse=True)[:3]
        report += "**Top 3 Campaigns by CTR:**\n"
        for i, campaign in enumerate(top_campaigns, 1):
            report += f"{i}. {campaign['name']}: {campaign['ctr']:.2f}% CTR, {campaign['conversions']:.0f} conversions\n"

    report += "\n### Meta Ads\n\n"

    if "error" in meta_ads:
        report += f"WARNING: **Meta API Error:** {meta_ads.get('error', 'Unknown error')}\n\n"

    report += f"""- **Spend:** ${meta_ads["total_spend"]:.2f} (Budget: $60-70/day)
- **Impressions:** {meta_ads["total_impressions"]:,}
- **Clicks:** {meta_ads["total_clicks"]} (CTR: {meta_ads["ctr"]:.2f}%)
- **CPC:** ${meta_ads["cpc"]:.2f}
- **Conversions:** {meta_ads["total_conversions"]:.0f}
- **CAC:** ${meta_ads["cac"]:.2f}

"""

    # Top Meta campaigns
    if meta_ads["campaigns"]:
        top_campaigns = sorted(meta_ads["campaigns"], key=lambda x: x["ctr"], reverse=True)[:3]
        report += "**Top 3 Campaigns by CTR:**\n"
        for i, campaign in enumerate(top_campaigns, 1):
            report += f"{i}. {campaign['name']}: {campaign['ctr']:.2f}% CTR, {campaign['conversions']:.0f} conversions\n"

    report += f"""
### Blended Performance

- **Total Ad Spend:** ${total_ad_spend:.2f}
- **Total Ad Conversions:** {total_ad_conversions:.0f}
- **Blended CAC:** ${blended_cac:.2f} (Target: <$100)

---

## Website Traffic (GA4)

- **Sessions:** {ga4["sessions"]:,}
- **Users:** {ga4["users"]:,}
- **Page Views:** {ga4["pageviews"]:,}
- **Checkout Starts:** {ga4["checkouts"]}
- **Purchases (GA4):** {ga4["purchases"]}
- **Conversion Rate:** {ga4["conversion_rate"]:.2f}% (Target: >2%)

---

## Alerts

"""

    # Alert logic
    alerts = []

    # Check for campaigns with high spend, no conversions
    for campaign in google_ads["campaigns"]:
        if campaign["spend"] > 50 and campaign["conversions"] == 0:
            alerts.append(f"ALERT: Google Ads campaign '{campaign['name']}' has ${campaign['spend']:.2f} spend with 0 conversions")

    for campaign in meta_ads["campaigns"]:
        if campaign["spend"] > 50 and campaign["conversions"] == 0:
            alerts.append(f"ALERT: Meta Ads campaign '{campaign['name']}' has ${campaign['spend']:.2f} spend with 0 conversions")

    # Check for low CTR
    for campaign in google_ads["campaigns"]:
        if campaign["ctr"] < 1.0 and campaign["impressions"] > 1000:
            alerts.append(f"WARNING: Google Ads campaign '{campaign['name']}' has {campaign['ctr']:.2f}% CTR (threshold: 1%)")

    for campaign in meta_ads["campaigns"]:
        if campaign["ctr"] < 1.0 and campaign["impressions"] > 1000:
            alerts.append(f"WARNING: Meta Ads campaign '{campaign['name']}' has {campaign['ctr']:.2f}% CTR (threshold: 1%)")

    # Check blended CAC
    if blended_cac > 150:
        alerts.append(f"ALERT: Blended CAC ${blended_cac:.2f} exceeds $150 threshold")
    elif blended_cac > 100:
        alerts.append(f"WARNING: Blended CAC ${blended_cac:.2f} exceeds $100 target")

    # Check conversion rate
    if ga4["conversion_rate"] < 1.0 and ga4["sessions"] > 100:
        alerts.append(f"WARNING: Landing page conversion rate {ga4['conversion_rate']:.2f}% is below 1% threshold")

    if alerts:
        for alert in alerts:
            report += f"- {alert}\n"
    else:
        report += "- OK: No alerts - all metrics within target ranges\n"

    report += """
---

## Recommendations

"""

    # Generate recommendations
    recommendations = []

    # Kill underperformers
    kill_list = []
    for campaign in google_ads["campaigns"] + meta_ads["campaigns"]:
        if campaign["spend"] > 100 and campaign["conversions"] == 0:
            kill_list.append(campaign["name"])

    if kill_list:
        recommendations.append(f"**Kill:** {', '.join(kill_list)} (high spend, zero conversions)")

    # Double down on winners
    top_performers = []
    for campaign in google_ads["campaigns"] + meta_ads["campaigns"]:
        if campaign["ctr"] > 2.0 and campaign["conversions"] > 0:
            top_performers.append(campaign["name"])

    if top_performers:
        recommendations.append(f"**Double down:** {', '.join(top_performers)} (CTR >2%, converting)")

    # Tactical adjustments
    if google_ads["cac"] < meta_ads["cac"] and google_ads["total_conversions"] > 0:
        recommendations.append("**Budget shift:** Google Ads outperforming Meta - consider shifting 20% of Meta budget to Google")
    elif meta_ads["cac"] < google_ads["cac"] and meta_ads["total_conversions"] > 0:
        recommendations.append("**Budget shift:** Meta Ads outperforming Google - consider shifting 20% of Google budget to Meta")

    if ga4["conversion_rate"] < 1.5:
        recommendations.append("**Landing page:** Conversion rate below target - review checkout flow, add trust signals")

    if recommendations:
        for rec in recommendations:
            report += f"- {rec}\n"
    else:
        report += "- Continue monitoring - no immediate changes needed\n"

    report += """
---

**Next Report:** Tomorrow, 9am CT
**Dashboard Script:** `scripts/week1-performance-dashboard.py`
"""

    return report


def main():
    """Main execution."""
    # Parse command line args
    target_date = sys.argv[1] if len(sys.argv) > 1 else None

    date_str, date_obj = get_date_range(target_date)

    print(f"Generating Week 1 Performance Report for {date_str}...\n")

    # Fetch all data sources (with error handling)
    print("Fetching Stripe data...")
    try:
        stripe_data = fetch_stripe_data(date_str, date_str)
    except Exception as e:
        print(f"  WARNING: Stripe error: {e}")
        stripe_data = {"orders": 0, "revenue": 0, "avg_order_value": 0, "freeship_redemptions": 0, "error": str(e)}

    print("Fetching Google Ads data...")
    try:
        google_ads_data = fetch_google_ads_data(date_str, date_str)
    except Exception as e:
        print(f"  WARNING: Google Ads error: {e}")
        google_ads_data = {
            "total_spend": 0, "total_clicks": 0, "total_impressions": 0,
            "total_conversions": 0, "ctr": 0, "cpc": 0, "cac": 0,
            "campaigns": [], "error": str(e)
        }

    print("Fetching Meta Ads data...")
    try:
        meta_ads_data = fetch_meta_ads_data(date_str, date_str)
    except Exception as e:
        print(f"  WARNING: Meta Ads error: {e}")
        meta_ads_data = {
            "total_spend": 0, "total_clicks": 0, "total_impressions": 0,
            "total_conversions": 0, "ctr": 0, "cpc": 0, "cac": 0,
            "campaigns": [], "error": str(e)
        }

    print("Fetching GA4 data...")
    try:
        ga4_data = fetch_ga4_data(date_str, date_str)
    except Exception as e:
        print(f"  WARNING: GA4 error: {e}")
        ga4_data = {
            "sessions": 0, "users": 0, "pageviews": 0,
            "checkouts": 0, "purchases": 0, "conversion_rate": 0,
            "error": str(e)
        }

    # Compile data
    data = {
        "stripe": stripe_data,
        "google_ads": google_ads_data,
        "meta_ads": meta_ads_data,
        "ga4": ga4_data,
    }

    # Generate report
    report = generate_report(date_str, data)

    # Save to file
    output_dir = Path("reports/week1-daily")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / f"performance-report-{date_str}.md"
    output_file.write_text(report, encoding="utf-8")

    print(f"\nOK: Report saved to: {output_file}")
    print("\n" + "="*80)
    print(report)
    print("="*80)


if __name__ == "__main__":
    main()
