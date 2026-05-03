#!/usr/bin/env bash
# fix-heartbeat-intervals.sh
# Updates all Paperclip agent heartbeat intervals to 2x/day (43200s = 12h)
# Agents still wake immediately for task assignments (wakeOnDemand remains true)
#
# Run this after Paperclip server starts: bash scripts/fix-heartbeat-intervals.sh
# Requires: Paperclip API running on localhost:3100

set -euo pipefail

API="http://localhost:3100/api"

# Verify server is up
if ! curl -s --max-time 5 "$API/agents/instance/scheduler-heartbeats" > /dev/null 2>&1; then
  echo "ERROR: Paperclip server not responding on localhost:3100"
  echo "Start Paperclip first, then re-run this script."
  exit 1
fi

echo "=== Current heartbeat intervals ==="
curl -s "$API/agents/instance/scheduler-heartbeats" | python3 -c "
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(sys.stdin)
for a in sorted(data, key=lambda x: x.get('role','')):
    hrs = a.get('intervalSec',0) / 3600
    print(f\"  {a.get('role','?'):12} | {a.get('agentName','?'):30} | {a.get('intervalSec',0):>6}s ({hrs:.1f}h) | active: {a.get('schedulerActive')}\")
"

echo ""
echo "=== Updating intervals to 43200s (12h = 2x/day) ==="

# Agent IDs and roles (excluding terminated agents)
declare -A AGENTS=(
  ["204674de-ee80-43d7-9930-bd81b1737d1f"]="CEO"
  ["e0a9c673-891c-40eb-8fa3-8410dedcbd31"]="CMO"
  ["0df6fe9a-9676-41e7-89e9-724d05272a51"]="CRO"
  ["3f827c01-38a9-435b-826c-64192188a8cb"]="CTO"
  ["38bcd8e4-2d20-46ec-8bf2-adb256ee5291"]="CIO"
  ["b8496569-99a4-47cb-8978-c4652c7d14f5"]="RevOps"
  ["bfcf59d8-ca78-4306-872f-4e5a53f5c650"]="CFO"
  ["ed268a60-d566-4750-8ad0-8dfe79b27212"]="COO"
)

NEW_INTERVAL=43200  # 12 hours

for id in "${!AGENTS[@]}"; do
  role="${AGENTS[$id]}"
  echo -n "  Updating $role ($id)... "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PATCH "$API/agents/$id" \
    -H "Content-Type: application/json" \
    -d "{\"runtimeConfig\":{\"heartbeat\":{\"intervalSec\":$NEW_INTERVAL}}}")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "OK (${NEW_INTERVAL}s)"
  else
    echo "FAILED (HTTP $HTTP_CODE)"
  fi
done

echo ""
echo "=== Updated intervals ==="
curl -s "$API/agents/instance/scheduler-heartbeats" | python3 -c "
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(sys.stdin)
for a in sorted(data, key=lambda x: x.get('role','')):
    hrs = a.get('intervalSec',0) / 3600
    print(f\"  {a.get('role','?'):12} | {a.get('agentName','?'):30} | {a.get('intervalSec',0):>6}s ({hrs:.1f}h) | active: {a.get('schedulerActive')}\")
"

echo ""
echo "Done. All agents now heartbeat every 12 hours (2x/day)."
echo "Agents still wake immediately for task assignments and @mentions (wakeOnDemand=true)."
