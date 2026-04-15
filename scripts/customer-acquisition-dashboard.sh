#!/bin/bash
# Customer Acquisition Dashboard
# Daily performance tracking across Meta Ads, Google Ads, Stripe, and GA4

set -e

TARGET_CAC=20
LOOKBACK_DAYS=${1:-7}  # Default 7 days, can override with argument

echo "==================================================================="
echo "CUSTOMER ACQUISITION DASHBOARD"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Reporting Window: Last ${LOOKBACK_DAYS} days"
echo "==================================================================="
echo ""

# Calculate dates using Python for cross-platform compatibility
START_DATE=$(python3 -c "from datetime import datetime, timedelta; print(int((datetime.now() - timedelta(days=${LOOKBACK_DAYS})).timestamp()))")

# ===================================================================
# STRIPE: Revenue & Orders
# ===================================================================
echo "STRIPE - REVENUE & ORDERS"
echo "-------------------------------------------------------------------"

STRIPE_KEY=$(python3 -c "import json, os; print(json.load(open(os.path.expanduser('~/.claude/stripe-config.json')))['api_key'])")

STRIPE_DATA=$(curl -sS -G "https://api.stripe.com/v1/charges" \
  --data-urlencode "limit=100" \
  --data-urlencode "created[gte]=${START_DATE}" \
  -u "${STRIPE_KEY}:")

# Parse and display Stripe data
printf '%s\n' "$STRIPE_DATA" | python3 -c '
import sys, json

data = json.load(sys.stdin)
charges = [c for c in data.get("data", []) if c.get("status") == "succeeded"]

total_orders = len(charges)
total_revenue = sum(c["amount"] for c in charges) / 100
avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

# Group by campaign/source
by_campaign = {}
for c in charges:
    campaign = c.get("metadata", {}).get("campaign", "organic")
    if campaign not in by_campaign:
        by_campaign[campaign] = {"orders": 0, "revenue": 0}
    by_campaign[campaign]["orders"] += 1
    by_campaign[campaign]["revenue"] += c["amount"] / 100

print(f"Total Orders: {total_orders}")
print(f"Total Revenue: ${total_revenue:.2f}")
print(f"Average Order Value: ${avg_order_value:.2f}")

if by_campaign:
    print("\nBy Campaign/Source:")
    for campaign, stats in sorted(by_campaign.items(), key=lambda x: x[1]["revenue"], reverse=True):
        orders = stats["orders"]
        revenue = stats["revenue"]
        print(f"  {campaign}: {orders} orders, ${revenue:.2f}")
'

echo ""

# ===================================================================
# META ADS: Campaign Performance
# ===================================================================
echo "META ADS - CAMPAIGN PERFORMANCE"
echo "-------------------------------------------------------------------"
echo "Integration in progress"
echo "Manual check: https://business.facebook.com/adsmanager"
META_SPEND=0
echo ""

# ===================================================================
# GOOGLE ADS: Campaign Performance
# ===================================================================
echo "GOOGLE ADS - CAMPAIGN PERFORMANCE"
echo "-------------------------------------------------------------------"
echo "Integration in progress"
echo "Manual check: https://ads.google.com"
GADS_SPEND=0
echo ""

# ===================================================================
# GA4: Traffic & Attribution
# ===================================================================
echo "GA4 - TRAFFIC & ATTRIBUTION"
echo "-------------------------------------------------------------------"
echo "Integration in progress"
echo "Manual check: https://analytics.google.com"
echo ""

# ===================================================================
# SUMMARY METRICS
# ===================================================================
echo "SUMMARY - CUSTOMER ACQUISITION METRICS"
echo "==================================================================="

# Re-parse Stripe for summary (avoid temp files)
STRIPE_SUMMARY=$(printf '%s\n' "$STRIPE_DATA" | python3 -c '
import sys, json
data = json.load(sys.stdin)
charges = [c for c in data.get("data", []) if c.get("status") == "succeeded"]
total_orders = len(charges)
total_revenue = sum(c["amount"] for c in charges) / 100
print(f"{total_orders}|{total_revenue:.2f}")
')

TOTAL_ORDERS=$(echo "$STRIPE_SUMMARY" | cut -d'|' -f1)
TOTAL_REVENUE=$(echo "$STRIPE_SUMMARY" | cut -d'|' -f2)

# Calculate total spend (currently just placeholders)
TOTAL_SPEND=$(python3 -c "print(f'{${META_SPEND} + ${GADS_SPEND}:.2f}')")

# Calculate CAC
if [ "$TOTAL_ORDERS" -gt 0 ] && [ "$TOTAL_SPEND" != "0.00" ]; then
    CAC=$(python3 -c "print(f'{${TOTAL_SPEND} / ${TOTAL_ORDERS}:.2f}')")
    CAC_STATUS="calculated"
else
    CAC="N/A"
    CAC_STATUS="no_spend"
fi

# Calculate ROAS
if [ "$TOTAL_SPEND" != "0.00" ]; then
    ROAS=$(python3 -c "print(f'{${TOTAL_REVENUE} / ${TOTAL_SPEND}:.2f}')")
    ROAS_STATUS="calculated"
else
    ROAS="N/A"
    ROAS_STATUS="no_spend"
fi

echo "Total Ad Spend: \$${TOTAL_SPEND}"
echo "  - Meta Ads: \$${META_SPEND} (integration pending)"
echo "  - Google Ads: \$${GADS_SPEND} (integration pending)"
echo ""
echo "Total Orders: ${TOTAL_ORDERS}"
echo "Total Revenue: \$${TOTAL_REVENUE}"
echo ""
echo "Customer Acquisition Cost (CAC): \$${CAC}"
if [ "$CAC_STATUS" = "calculated" ]; then
    if (( $(python3 -c "print(1 if ${CAC} > ${TARGET_CAC} else 0)") )); then
        echo "  [!] Above target (<\$${TARGET_CAC})"
    else
        echo "  [OK] Within target"
    fi
elif [ "$CAC_STATUS" = "no_spend" ] && [ "$TOTAL_ORDERS" -gt 0 ]; then
    echo "  [!] All orders are organic (no ad spend tracked)"
fi
echo ""
echo "Return on Ad Spend (ROAS): ${ROAS}x"
if [ "$ROAS_STATUS" = "calculated" ]; then
    if (( $(python3 -c "print(1 if ${ROAS} > 2.0 else 0)") )); then
        echo "  [OK] Healthy ROAS (>2.0x)"
    else
        echo "  [!] ROAS below 2.0x benchmark"
    fi
fi
echo ""

# ===================================================================
# COHORT ANALYSIS
# ===================================================================
echo "COHORT ANALYSIS - REPEAT PURCHASE TRACKING"
echo "-------------------------------------------------------------------"
echo "Coming soon: Week 1-8 customer tracking and repeat purchase rate"
echo ""

# ===================================================================
# ACTION ITEMS
# ===================================================================
echo "ACTION ITEMS"
echo "-------------------------------------------------------------------"

if [ "$TOTAL_ORDERS" -eq 0 ]; then
    echo "[X] No orders in the last ${LOOKBACK_DAYS} days"
    echo "    -> Check website and checkout flow"
    echo "    -> Verify Stripe integration"
elif [ "$CAC_STATUS" = "calculated" ] && (( $(python3 -c "print(1 if ${CAC} > ${TARGET_CAC} else 0)") )); then
    echo "[!] CAC (\$${CAC}) is above target (<\$${TARGET_CAC})"
    echo "    -> Review ad targeting and creative performance"
    echo "    -> Consider pausing underperforming campaigns"
elif [ "$TOTAL_SPEND" = "0.00" ] && [ "$TOTAL_ORDERS" -gt 0 ]; then
    echo "[i] All ${TOTAL_ORDERS} orders are organic"
    echo "    -> Consider launching paid campaigns to scale"
    echo "    -> Integrate Meta/Google Ads tracking"
else
    echo "[OK] No critical action items"
fi

echo ""
echo "==================================================================="
echo "Report generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==================================================================="
