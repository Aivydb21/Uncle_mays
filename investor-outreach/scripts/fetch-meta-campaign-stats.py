#!/usr/bin/env python3
"""
Meta Campaign Stats Fetcher
Pulls performance data for the active Meta campaign (Subscription Launch Apr 2026)
Used by daily report to track ad performance and spending.
"""

import json
import sys
import urllib.request
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Config
CONFIG_PATH = "c:/Users/Anthony/.claude/meta-config.json"
CAMPAIGN_ID = "120243219649250762"  # Subscription Launch Apr 2026

# Alert thresholds (from UNC-380)
TARGET_CPA = 15.0  # Target cost per initiated checkout
WARNING_CPA = 20.0  # Alert if CPA exceeds this
DAILY_BUDGET = 67.0  # Expected daily spend


def load_config() -> Dict[str, Any]:
    """Load Meta API configuration"""
    try:
        with open(CONFIG_PATH) as f:
            return json.load(f)
    except FileNotFoundError:
        print(json.dumps({"error": "Meta config not found"}), file=sys.stderr)
        sys.exit(1)


def fetch_meta_api(url: str, access_token: str) -> Dict[str, Any]:
    """Fetch data from Meta Marketing API"""
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}


def get_campaign_insights(
    campaign_id: str,
    access_token: str,
    time_range: str = "last_24h"
) -> Dict[str, Any]:
    """
    Fetch campaign insights from Meta Marketing API

    Args:
        campaign_id: Meta campaign ID
        access_token: Meta API access token
        time_range: One of: last_24h, last_7d, last_30d

    Returns:
        Campaign insights with spend, impressions, clicks, conversions
    """
    # Map time range to date_preset
    date_preset_map = {
        "last_24h": "yesterday",
        "last_7d": "last_7d",
        "last_30d": "last_30d"
    }
    date_preset = date_preset_map.get(time_range, "yesterday")

    # Fetch campaign insights
    # Docs: https://developers.facebook.com/docs/marketing-api/insights
    fields = [
        "campaign_id",
        "campaign_name",
        "spend",
        "impressions",
        "reach",
        "frequency",
        "clicks",
        "actions",  # Includes initiated_checkout, purchase, etc
        "cost_per_action_type",
        "action_values",  # For ROAS calculation
    ]

    params = {
        "fields": ",".join(fields),
        "date_preset": date_preset,
        "level": "campaign",
        "access_token": access_token,
    }

    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"https://graph.facebook.com/v21.0/{campaign_id}/insights?{query_string}"

    return fetch_meta_api(url, access_token)


def get_campaign_details(campaign_id: str, access_token: str) -> Dict[str, Any]:
    """Fetch campaign status and configuration"""
    fields = "id,name,status,daily_budget,effective_status,configured_status"
    url = f"https://graph.facebook.com/v21.0/{campaign_id}?fields={fields}&access_token={access_token}"
    return fetch_meta_api(url, access_token)


def extract_action_value(actions: List[Dict], action_type: str) -> int:
    """Extract specific action count from Meta actions array"""
    if not actions:
        return 0
    for action in actions:
        if action.get("action_type") == action_type:
            return int(action.get("value", 0))
    return 0


def extract_cost_per_action(cost_per_actions: List[Dict], action_type: str) -> float:
    """Extract specific cost per action from Meta cost_per_action_type array"""
    if not cost_per_actions:
        return 0.0
    for cpa in cost_per_actions:
        if cpa.get("action_type") == action_type:
            return float(cpa.get("value", 0))
    return 0.0


def calculate_roas(actions: List[Dict], action_values: List[Dict], spend: float) -> float:
    """Calculate ROAS (Return on Ad Spend)"""
    if spend == 0:
        return 0.0

    # Get purchase value
    purchase_value = 0.0
    if action_values:
        for av in action_values:
            if av.get("action_type") == "purchase":
                purchase_value = float(av.get("value", 0))

    if purchase_value == 0:
        return 0.0

    return purchase_value / spend


def format_report(
    campaign_details: Dict[str, Any],
    insights_24h: Dict[str, Any],
    insights_7d: Dict[str, Any]
) -> Dict[str, Any]:
    """Format campaign data into a structured report"""

    # Extract 24h metrics
    data_24h = insights_24h.get("data", [{}])[0] if insights_24h.get("data") else {}
    spend_24h = float(data_24h.get("spend", 0))
    impressions_24h = int(data_24h.get("impressions", 0))
    reach_24h = int(data_24h.get("reach", 0))
    frequency_24h = float(data_24h.get("frequency", 0))
    clicks_24h = int(data_24h.get("clicks", 0))
    actions_24h = data_24h.get("actions", [])
    cost_per_actions_24h = data_24h.get("cost_per_action_type", [])
    action_values_24h = data_24h.get("action_values", [])

    # Extract 7d metrics for rolling averages
    data_7d = insights_7d.get("data", [{}])[0] if insights_7d.get("data") else {}
    spend_7d = float(data_7d.get("spend", 0))
    impressions_7d = int(data_7d.get("impressions", 0))
    reach_7d = int(data_7d.get("reach", 0))
    frequency_7d = float(data_7d.get("frequency", 0))
    clicks_7d = int(data_7d.get("clicks", 0))
    actions_7d = data_7d.get("actions", [])
    cost_per_actions_7d = data_7d.get("cost_per_action_type", [])
    action_values_7d = data_7d.get("action_values", [])

    # Extract key actions
    checkouts_24h = extract_action_value(actions_24h, "omni_initiated_checkout")
    purchases_24h = extract_action_value(actions_24h, "purchase")
    landing_page_views_24h = extract_action_value(actions_24h, "landing_page_view")

    checkouts_7d = extract_action_value(actions_7d, "omni_initiated_checkout")
    purchases_7d = extract_action_value(actions_7d, "purchase")
    landing_page_views_7d = extract_action_value(actions_7d, "landing_page_view")

    # Calculate CPA (cost per initiated checkout)
    cpa_24h = spend_24h / checkouts_24h if checkouts_24h > 0 else 0.0
    cpa_7d_avg = (spend_7d / 7) / (checkouts_7d / 7) if checkouts_7d > 0 else 0.0

    # Calculate ROAS
    roas_24h = calculate_roas(actions_24h, action_values_24h, spend_24h)
    roas_7d = calculate_roas(actions_7d, action_values_7d, spend_7d)

    # Campaign status
    campaign_name = campaign_details.get("name", "Unknown")
    campaign_status = campaign_details.get("effective_status", "UNKNOWN")
    daily_budget = float(campaign_details.get("daily_budget", 0)) / 100  # Convert cents to dollars

    # Generate alerts
    alerts = []

    if campaign_status != "ACTIVE":
        alerts.append(f"CRITICAL: Campaign is {campaign_status}, not ACTIVE")

    if spend_24h == 0:
        alerts.append("WARNING: No spend in last 24 hours")

    if cpa_24h > WARNING_CPA and checkouts_24h > 0:
        alerts.append(f"WARNING: CPA ${cpa_24h:.2f} exceeds target ${WARNING_CPA:.2f}")

    if spend_24h > 0 and spend_24h < daily_budget * 0.5:
        alerts.append(f"WARNING: Underspending - only ${spend_24h:.2f} of ${daily_budget:.2f} daily budget")

    # Return structured data
    return {
        "campaign": {
            "id": CAMPAIGN_ID,
            "name": campaign_name,
            "status": campaign_status,
            "daily_budget": daily_budget,
        },
        "metrics_24h": {
            "spend": spend_24h,
            "impressions": impressions_24h,
            "reach": reach_24h,
            "frequency": frequency_24h,
            "clicks": clicks_24h,
            "landing_page_views": landing_page_views_24h,
            "initiated_checkouts": checkouts_24h,
            "purchases": purchases_24h,
            "cpa": cpa_24h,
            "roas": roas_24h,
        },
        "metrics_7d_avg": {
            "spend_per_day": spend_7d / 7,
            "impressions_per_day": impressions_7d / 7,
            "reach_per_day": reach_7d / 7,
            "frequency": frequency_7d,
            "clicks_per_day": clicks_7d / 7,
            "landing_page_views_per_day": landing_page_views_7d / 7,
            "initiated_checkouts_per_day": checkouts_7d / 7,
            "purchases_per_day": purchases_7d / 7,
            "cpa": cpa_7d_avg,
            "roas": roas_7d,
        },
        "alerts": alerts,
        "links": {
            "ads_manager": f"https://business.facebook.com/adsmanager/manage/campaigns?act=814877604473301&selected_campaign_ids={CAMPAIGN_ID}"
        }
    }


def main():
    """Main entry point"""
    config = load_config()
    access_token = config["access_token"]

    # Fetch campaign details and insights
    campaign_details = get_campaign_details(CAMPAIGN_ID, access_token)

    if "error" in campaign_details:
        print(json.dumps({"error": f"Failed to fetch campaign details: {campaign_details['error']}"}))
        sys.exit(1)

    insights_24h = get_campaign_insights(CAMPAIGN_ID, access_token, "last_24h")
    insights_7d = get_campaign_insights(CAMPAIGN_ID, access_token, "last_7d")

    if "error" in insights_24h:
        print(json.dumps({"error": f"Failed to fetch 24h insights: {insights_24h['error']}"}))
        sys.exit(1)

    if "error" in insights_7d:
        print(json.dumps({"error": f"Failed to fetch 7d insights: {insights_7d['error']}"}))
        sys.exit(1)

    # Format and output report
    report = format_report(campaign_details, insights_24h, insights_7d)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
