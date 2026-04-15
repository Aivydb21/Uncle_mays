#!/usr/bin/env python3
"""
Checkout Recovery Monitoring Script
Tracks post-fix checkout performance vs. the broken baseline (0% conversion, April 7-14)

Run daily for 48 hours after fix deployment (2026-04-14 15:45 UTC)
"""

import json
import os
import urllib.request
import base64
from datetime import datetime, timedelta

# Load Stripe config
stripe_config = json.load(open(os.path.expanduser("~/.claude/stripe-config.json")))
STRIPE_KEY = stripe_config["api_key"]
STRIPE_URL = stripe_config["base_url"]

def stripe_get(endpoint):
    """Make authenticated GET request to Stripe API."""
    auth = base64.b64encode(f'{STRIPE_KEY}:'.encode()).decode()
    req = urllib.request.Request(
        f'{STRIPE_URL}/{endpoint}',
        headers={"Authorization": f"Basic {auth}"}
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())

def main():
    print("=" * 80)
    print("CHECKOUT RECOVERY MONITORING - Post-Fix Performance")
    print("=" * 80)
    print(f"Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Fix deployed: 2026-04-14 15:45 UTC (commit 14965a2)")
    print()

    # Get sessions since fix deployment (calculate from known date)
    # Fix deployed: April 14, 2026 at 15:45 UTC
    fix_datetime = datetime(2026, 4, 14, 15, 45, 0)
    fix_timestamp = int(fix_datetime.timestamp())
    post_fix_sessions = stripe_get(f"checkout/sessions?created[gte]={fix_timestamp}&limit=100")

    # Get 7-day baseline (before fix) for comparison
    week_ago = int((datetime.now() - timedelta(days=7)).timestamp())
    baseline_sessions = stripe_get(f"checkout/sessions?created[gte]={week_ago}&created[lt]={fix_timestamp}&limit=100")

    # Analyze post-fix sessions
    post_fix_total = len(post_fix_sessions.get("data", []))
    post_fix_completed = [s for s in post_fix_sessions.get("data", []) if s["status"] == "complete"]
    post_fix_expired = [s for s in post_fix_sessions.get("data", []) if s["status"] == "expired"]
    post_fix_open = [s for s in post_fix_sessions.get("data", []) if s["status"] == "open"]

    # Check if new sessions are using fixed payment links
    new_payment_links = [
        "plink_1TL88uG67LsNxpTo22RcsjJx",  # Starter $35
        "plink_1TL88vG67LsNxpTokErPsWBS",  # Family $55
        "plink_1TL88wG67LsNxpTojxjOvhTQ",  # Premium $75
    ]

    post_fix_using_new_links = 0
    post_fix_has_shipping = 0
    post_fix_has_phone = 0

    for s in post_fix_sessions.get("data", []):
        link_id = s.get("payment_link")
        if link_id in new_payment_links:
            post_fix_using_new_links += 1
        if s.get("shipping_address_collection"):
            post_fix_has_shipping += 1
        if s.get("phone_number_collection", {}).get("enabled"):
            post_fix_has_phone += 1

    # Baseline metrics (broken period)
    baseline_total = len(baseline_sessions.get("data", []))
    baseline_completed = [s for s in baseline_sessions.get("data", []) if s["status"] == "complete"]

    print("POST-FIX PERFORMANCE (Since 2026-04-14 15:45 UTC)")
    print("-" * 80)
    print(f"Total sessions: {post_fix_total}")
    print(f"Completed: {len(post_fix_completed)}")
    print(f"Abandoned (expired): {len(post_fix_expired)}")
    print(f"Still open: {len(post_fix_open)}")

    if post_fix_total > 0:
        conversion_rate = (len(post_fix_completed) / post_fix_total) * 100
        print(f"Conversion rate: {conversion_rate:.1f}%")

        # Revenue
        revenue = sum([s.get("amount_total", 0) for s in post_fix_completed]) / 100
        print(f"Revenue: ${revenue:.2f}")
        print(f"Average order value: ${(revenue / len(post_fix_completed)) if post_fix_completed else 0:.2f}")

        print()
        print("FIX VERIFICATION")
        print("-" * 80)
        print(f"Sessions using NEW payment links: {post_fix_using_new_links}/{post_fix_total} ({post_fix_using_new_links/post_fix_total*100:.1f}%)")
        print(f"Sessions with shipping collection: {post_fix_has_shipping}/{post_fix_total} ({post_fix_has_shipping/post_fix_total*100:.1f}%)")
        print(f"Sessions with phone collection: {post_fix_has_phone}/{post_fix_total} ({post_fix_has_phone/post_fix_total*100:.1f}%)")

        if post_fix_using_new_links == post_fix_total:
            print("[OK] All sessions using fixed payment links")
        else:
            print(f"[WARNING] {post_fix_total - post_fix_using_new_links} sessions still using OLD links")

        if post_fix_has_shipping == post_fix_total:
            print("[OK] All sessions collecting shipping addresses")
        else:
            print(f"[WARNING] {post_fix_total - post_fix_has_shipping} sessions NOT collecting shipping")
    else:
        print("[WAITING] No new checkout sessions yet (fix deployed <24 hours ago)")
        print("   Check back tomorrow for first metrics.")

    print()
    print("BASELINE (7 Days Before Fix, Broken Period)")
    print("-" * 80)
    print(f"Total sessions: {baseline_total}")
    print(f"Completed: {len(baseline_completed)}")
    baseline_conversion = (len(baseline_completed) / baseline_total * 100) if baseline_total > 0 else 0
    print(f"Conversion rate: {baseline_conversion:.1f}%")

    print()
    print("PROGRESS TOWARD TARGET")
    print("-" * 80)
    print(f"Baseline (broken): {baseline_conversion:.1f}%")
    if post_fix_total > 0:
        print(f"Current (post-fix): {conversion_rate:.1f}%")
        print(f"Target (48h): 25-30%")
        print(f"Target (week 1): 30-35%")

        if conversion_rate >= 25:
            print("[SUCCESS] TARGET MET! Fix is working.")
        elif conversion_rate >= 15:
            print("[PROGRESS] Trending positive. Monitor for 24 more hours.")
        elif conversion_rate < 5:
            print("[CRITICAL] Fix not working. Investigate additional blockers.")
    else:
        print("Target (48h): 25-30%")
        print("[WAITING] Awaiting first post-fix data")

    print()
    print("=" * 80)
    print("Next check: Run this script again in 24 hours")
    print("=" * 80)

if __name__ == "__main__":
    main()
