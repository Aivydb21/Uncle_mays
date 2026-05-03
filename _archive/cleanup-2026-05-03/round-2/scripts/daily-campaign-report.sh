#!/bin/bash
# Hyde Park Local Campaign - Daily ROI Dashboard
# Run daily during campaign period (April 18-28, 2026)

set -e

CAMPAIGN_START="2026-04-18"
CAMPAIGN_END="2026-04-28"
CAMPAIGN_NAME="hyde-park-local"
CAMPAIGN_BUDGET_WEEKLY=200
TARGET_CAC=20

echo "==================================================================="
echo "HYDE PARK LOCAL CAMPAIGN - DAILY REPORT"
echo "Campaign: $CAMPAIGN_NAME (${CAMPAIGN_START} to ${CAMPAIGN_END})"
echo "Date: $(date +%Y-%m-%d)"
echo "==================================================================="
echo ""

# Load Stripe config
STRIPE_KEY=$(cat ~/.claude/stripe-config.json | python3 -c "import sys, json; print(json.load(sys.stdin)['api_key'])")

# Calculate campaign days elapsed
DAYS_ELAPSED=$(( ( $(date +%s) - $(date -d "$CAMPAIGN_START" +%s) ) / 86400 + 1 ))
if [ $DAYS_ELAPSED -lt 1 ]; then
    DAYS_ELAPSED=0
fi
CAMPAIGN_DAYS_TOTAL=11
DAYS_REMAINING=$(( CAMPAIGN_DAYS_TOTAL - DAYS_ELAPSED ))

# Fetch campaign orders from Stripe (last 30 days, filter by metadata)
echo "📊 CAMPAIGN PERFORMANCE"
echo "-------------------------------------------------------------------"

# Get charges with campaign metadata
CHARGES=$(curl -sS "https://api.stripe.com/v1/charges?limit=100&created[gte]=$(date -d "$CAMPAIGN_START" +%s)" \
  -u "${STRIPE_KEY}:")

# Parse campaign-specific charges
CAMPAIGN_ORDERS=$(echo "$CHARGES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
campaign_charges = [c for c in data.get('data', []) if c.get('metadata', {}).get('campaign') == '$CAMPAIGN_NAME' and c.get('status') == 'succeeded']
print(len(campaign_charges))
")

CAMPAIGN_REVENUE=$(echo "$CHARGES" | python3 -c "
import sys, json
data = json.load(sys.stdin)
campaign_charges = [c for c in data.get('data', []) if c.get('metadata', {}).get('campaign') == '$CAMPAIGN_NAME' and c.get('status') == 'succeeded']
total = sum(c['amount'] for c in campaign_charges) / 100
print(f'{total:.2f}')
")

# Calculate CAC
TOTAL_SPEND=$(echo "$CAMPAIGN_BUDGET_WEEKLY * $DAYS_ELAPSED / 7" | bc -l)
if [ "$CAMPAIGN_ORDERS" -gt 0 ]; then
    CAC=$(echo "$TOTAL_SPEND / $CAMPAIGN_ORDERS" | bc -l)
else
    CAC=0
fi

echo "Orders: $CAMPAIGN_ORDERS"
echo "Revenue: \$${CAMPAIGN_REVENUE}"
echo "Estimated Spend: \$$(printf '%.2f' $TOTAL_SPEND) (${DAYS_ELAPSED}d @ \$${CAMPAIGN_BUDGET_WEEKLY}/week)"
echo "CAC: \$$(printf '%.2f' $CAC) (target: <\$${TARGET_CAC})"
echo "Days Elapsed: $DAYS_ELAPSED / $CAMPAIGN_DAYS_TOTAL (${DAYS_REMAINING} remaining)"
echo ""

# Promo code redemptions
echo "💳 PROMO CODE USAGE"
echo "-------------------------------------------------------------------"
PROMO_REDEMPTIONS=$(curl -sS "https://api.stripe.com/v1/promotion_codes/promo_1TMEpBG67LsNxpToOls0tXOn" \
  -u "${STRIPE_KEY}:" | python3 -c "import sys, json; print(json.load(sys.stdin)['times_redeemed'])")

echo "NEIGHBOR20 Redemptions: $PROMO_REDEMPTIONS"
echo ""

# GA4 traffic (requires GA4 API setup)
echo "🌐 TRAFFIC SOURCES (GA4)"
echo "-------------------------------------------------------------------"
echo "Campaign UTM traffic data requires GA4 API integration"
echo "Manual check: https://analytics.google.com"
echo ""

# Phone orders (from manual log)
echo "📞 PHONE ORDERS"
echo "-------------------------------------------------------------------"
if [ -f "phone-order-log.csv" ]; then
    PHONE_ORDERS=$(tail -n +2 phone-order-log.csv | wc -l)
    echo "Phone orders logged: $PHONE_ORDERS"
else
    echo "No phone orders logged (phone-order-log.csv not found)"
fi
echo ""

# Action items
echo "⚠️  ACTION ITEMS"
echo "-------------------------------------------------------------------"
if (( $(echo "$CAC > $TARGET_CAC" | bc -l) )); then
    echo "❌ CAC (\$$(printf '%.2f' $CAC)) is ABOVE target (<\$${TARGET_CAC})"
    echo "   → Review ad targeting and creative performance"
else
    echo "✅ CAC is within target"
fi

if [ "$CAMPAIGN_ORDERS" -eq 0 ]; then
    echo "❌ No orders yet for this campaign"
    echo "   → Verify QR codes are live and working"
    echo "   → Check GA4 for traffic to campaign URLs"
fi

echo ""
echo "==================================================================="
echo "Report generated: $(date)"
echo "==================================================================="
