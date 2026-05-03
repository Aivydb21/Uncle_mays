import json
import sys
from datetime import datetime

data = json.load(sys.stdin)
sessions = data["data"]

print(f"Total sessions (last 14d): {len(sessions)}")
print()

by_status = {}
for s in sessions:
    status = s["status"]
    by_status[status] = by_status.get(status, 0) + 1

print("By status:")
for status, count in sorted(by_status.items()):
    print(f"  {status}: {count}")

completed = by_status.get("complete", 0)
expired = by_status.get("expired", 0)
open_sessions = by_status.get("open", 0)
total_terminal = completed + expired

if total_terminal > 0:
    conv_rate = (completed / total_terminal) * 100
    print(f"\nConversion rate (terminal only): {completed}/{total_terminal} = {conv_rate:.1f}%")
    print(f"Abandonment rate: {100-conv_rate:.1f}%")
else:
    print("\nNo terminal sessions yet")

with_email = sum(1 for s in sessions if s.get("customer_email"))
print(f"\nSessions with email: {with_email}/{len(sessions)} ({with_email/len(sessions)*100:.1f}%)")

completed_sessions = [s for s in sessions if s["status"] == "complete"]
if completed_sessions:
    print(f"\nCompleted sessions ({len(completed_sessions)}):")
    for s in completed_sessions[:10]:
        dt = datetime.fromtimestamp(s["created"]).strftime("%Y-%m-%d %H:%M")
        email = s.get("customer_email", "no email")
        amount = s["amount_total"] / 100
        print(f"  {dt} - {email} - ${amount:.2f}")
else:
    print("\n⚠️  NO COMPLETED SESSIONS in last 14 days")

print(f"\nMost recent session:")
if sessions:
    s = sessions[0]
    dt = datetime.fromtimestamp(s["created"]).strftime("%Y-%m-%d %H:%M")
    print(f"  {dt} - {s['status']} - {s.get('customer_email', 'no email')}")
