#!/usr/bin/env python3
"""
Daily Checkout Conversion Report
Growth & Conversion Operator

Pulls Stripe checkout session data and calculates:
- Sessions started (last 24h, last 7d, last 30d)
- Sessions completed
- Checkout completion rate
- Orders/week run rate
- Revenue/week run rate

Usage: python3 daily-checkout-report.py
"""

import json
import os
import urllib.request
import base64
import datetime
from typing import Dict, List

def load_stripe_config() -> Dict:
    """Load Stripe API config."""
    config_path = os.path.expanduser("~/.claude/stripe-config.json")
    with open(config_path) as f:
        return json.load(f)

def stripe_request(endpoint: str, config: Dict) -> Dict:
    """Make authenticated request to Stripe API."""
    auth_str = base64.b64encode(f'{config["api_key"]}:'.encode()).decode()
    req = urllib.request.Request(
        f'{config["base_url"]}/{endpoint}',
        headers={"Authorization": f"Basic {auth_str}"}
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())

def get_checkout_sessions(since_timestamp: int, config: Dict) -> List[Dict]:
    """Get all checkout sessions since a given timestamp."""
    all_sessions = []
    starting_after = None

    while True:
        endpoint = f"checkout/sessions?created[gte]={since_timestamp}&limit=100"
        if starting_after:
            endpoint += f"&starting_after={starting_after}"

        data = stripe_request(endpoint, config)
        all_sessions.extend(data['data'])

        if not data['has_more']:
            break

        starting_after = data['data'][-1]['id']

    return all_sessions

def calculate_metrics(sessions: List[Dict]) -> Dict:
    """Calculate conversion metrics from checkout sessions."""
    total = len(sessions)
    completed = sum(1 for s in sessions if s['status'] == 'complete')

    # Calculate revenue from completed sessions
    revenue = sum(s.get('amount_total', 0) for s in sessions if s['status'] == 'complete') / 100

    # Calculate completion rate
    completion_rate = (completed / total * 100) if total > 0 else 0

    return {
        'total': total,
        'completed': completed,
        'abandoned': total - completed,
        'completion_rate': completion_rate,
        'revenue': revenue,
        'avg_order_value': revenue / completed if completed > 0 else 0,
    }

def print_report():
    """Generate and print daily checkout conversion report."""
    config = load_stripe_config()

    # Calculate timestamps
    now = int(datetime.datetime.now().timestamp())
    one_day_ago = now - (24 * 60 * 60)
    seven_days_ago = now - (7 * 24 * 60 * 60)
    thirty_days_ago = now - (30 * 24 * 60 * 60)

    print("=" * 60)
    print("DAILY CHECKOUT CONVERSION REPORT")
    print(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    # 24-hour metrics
    sessions_24h = get_checkout_sessions(one_day_ago, config)
    metrics_24h = calculate_metrics(sessions_24h)

    print("LAST 24 HOURS")
    print(f"  Sessions Started:     {metrics_24h['total']}")
    print(f"  Sessions Completed:   {metrics_24h['completed']}")
    print(f"  Sessions Abandoned:   {metrics_24h['abandoned']}")
    print(f"  Completion Rate:      {metrics_24h['completion_rate']:.1f}%")
    print(f"  Revenue:              ${metrics_24h['revenue']:.2f}")
    print(f"  Avg Order Value:      ${metrics_24h['avg_order_value']:.2f}")
    print()

    # 7-day metrics
    sessions_7d = get_checkout_sessions(seven_days_ago, config)
    metrics_7d = calculate_metrics(sessions_7d)

    print("LAST 7 DAYS")
    print(f"  Sessions Started:     {metrics_7d['total']}")
    print(f"  Sessions Completed:   {metrics_7d['completed']}")
    print(f"  Sessions Abandoned:   {metrics_7d['abandoned']}")
    print(f"  Completion Rate:      {metrics_7d['completion_rate']:.1f}%")
    print(f"  Revenue:              ${metrics_7d['revenue']:.2f}")
    print(f"  Orders/Week:          {metrics_7d['completed']:.1f}")
    print(f"  Revenue/Week:         ${metrics_7d['revenue']:.2f}")
    print()

    # 30-day metrics (baseline comparison)
    sessions_30d = get_checkout_sessions(thirty_days_ago, config)
    metrics_30d = calculate_metrics(sessions_30d)

    print("LAST 30 DAYS (BASELINE)")
    print(f"  Sessions Started:     {metrics_30d['total']}")
    print(f"  Sessions Completed:   {metrics_30d['completed']}")
    print(f"  Sessions Abandoned:   {metrics_30d['abandoned']}")
    print(f"  Completion Rate:      {metrics_30d['completion_rate']:.1f}%")
    print(f"  Revenue:              ${metrics_30d['revenue']:.2f}")
    print(f"  Orders/Week:          {metrics_30d['completed'] * 7 / 30:.1f}")
    print(f"  Revenue/Week:         ${metrics_30d['revenue'] * 7 / 30:.2f}")
    print()

    # Phase 1 target comparison
    print("PHASE 1 TARGETS")
    print(f"  Completion Rate Target:  25-30%")
    print(f"  Current (7-day):         {metrics_7d['completion_rate']:.1f}%")

    if metrics_7d['completion_rate'] >= 25:
        print(f"  Status:                  [PASS] TARGET MET!")
    elif metrics_7d['completion_rate'] >= 20:
        print(f"  Status:                  [WARN] APPROACHING TARGET")
    else:
        print(f"  Status:                  [FAIL] BELOW TARGET")

    print()
    print(f"  Orders/Week Target:      2.9-3.5")
    print(f"  Current (7-day):         {metrics_7d['completed']:.1f}")

    if metrics_7d['completed'] >= 2.9:
        print(f"  Status:                  [PASS] TARGET MET!")
    elif metrics_7d['completed'] >= 2.0:
        print(f"  Status:                  [WARN] APPROACHING TARGET")
    else:
        print(f"  Status:                  [FAIL] BELOW TARGET")

    print()

    # Alert on regression
    if metrics_7d['completion_rate'] < 20 and metrics_30d['total'] > 10:
        print("ALERT: Completion rate below 20% threshold!")
        print("    Investigate for checkout regressions or blocking issues.")
        print()

    # Improvement calculation
    if metrics_30d['completion_rate'] > 0:
        improvement = metrics_7d['completion_rate'] - metrics_30d['completion_rate']
        improvement_pct = (improvement / metrics_30d['completion_rate']) * 100

        print("IMPROVEMENT SINCE PHASE 1 DEPLOYMENT")
        print(f"  Completion Rate Change:  {improvement:+.1f} percentage points")
        print(f"  Relative Improvement:    {improvement_pct:+.1f}%")

        if improvement > 0:
            print(f"  Impact:                  [PASS] POSITIVE")
        else:
            print(f"  Impact:                  [WARN] NEEDS INVESTIGATION")

    print()
    print("=" * 60)

if __name__ == "__main__":
    print_report()
