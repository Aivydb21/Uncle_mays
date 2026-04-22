#!/usr/bin/env python3
"""
Generate Priority Follow-up List
Identifies and categorizes investor threads needing immediate attention
"""

import json
from pathlib import Path
from datetime import datetime

REPORT_PATH = Path('C:/Users/Anthony/Desktop/um_website/investor-outreach/reports/gmail-followup-analysis.json')
OUTPUT_PATH = Path('C:/Users/Anthony/Desktop/um_website/investor-outreach/drafts/PRIORITY-FOLLOWUPS-2026-04-17.md')

def main():
    with open(REPORT_PATH) as f:
        data = json.load(f)

    # Categorize threads
    contact_replied = [t for t in data['threads'] if not t['anthony_sent_last']]
    anthony_sent = [t for t in data['threads'] if t['anthony_sent_last']]

    awaiting_reply = sorted([t for t in contact_replied if t['days_since_last'] >= 2],
                           key=lambda x: -x['days_since_last'])

    approaching_followup = sorted([t for t in anthony_sent if 3 <= t['days_since_last'] < 5],
                                 key=lambda x: -x['days_since_last'])

    ready_for_followup = [t for t in anthony_sent if t['days_since_last'] >= 5]

    # Filter out automated/system emails
    skip_domains = ['business.facebook.com', 'calendly.com', 'jotform.com', 'stripe.com',
                   'mailchimp.com', 'apollo.io', 'github.com', 'vercel.com']

    awaiting_reply_investors = [
        t for t in awaiting_reply
        if not any(domain in t['contact_email'] for domain in skip_domains)
    ]

    # Generate markdown report
    output = []
    output.append("# Priority Follow-ups — April 17, 2026\n")
    output.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
    output.append("---\n\n")

    # Section 1: Awaiting Anthony's Reply
    output.append(f"## 🔴 URGENT: Awaiting Your Reply ({len(awaiting_reply_investors)} threads)\n\n")
    output.append("These contacts replied and are waiting for your response (2+ days):\n\n")

    for i, t in enumerate(awaiting_reply_investors, 1):
        output.append(f"### {i}. {t['contact_name']}\n\n")
        output.append(f"- **Email:** {t['contact_email']}\n")
        output.append(f"- **Subject:** {t['subject']}\n")
        output.append(f"- **Last message:** {t['last_message_date']} ({t['days_since_last']} days ago)\n")
        output.append(f"- **Thread:** {t['message_count']} messages\n")
        output.append(f"- **Snippet:** {t['last_snippet'][:200]}\n\n")
        output.append("---\n\n")

    # Section 2: Ready for Follow-up
    if ready_for_followup:
        output.append(f"## Ready for Follow-up (5+ days, {len(ready_for_followup)} threads)\n\n")
        for i, t in enumerate(ready_for_followup, 1):
            output.append(f"### {i}. {t['contact_name']}\n\n")
            output.append(f"- **Email:** {t['contact_email']}\n")
            output.append(f"- **Subject:** {t['subject']}\n")
            output.append(f"- **Last message:** {t['last_message_date']} ({t['days_since_last']} days ago)\n")
            output.append("---\n\n")

    # Section 3: Approaching Follow-up
    output.append(f"## ⚠️ Approaching Follow-up Window ({len(approaching_followup[:20])} of {len(approaching_followup)} threads)\n\n")
    output.append("You sent last, will need follow-up soon (3-4 days):\n\n")

    for i, t in enumerate(approaching_followup[:20], 1):  # Top 20
        output.append(f"{i}. **{t['contact_name']}** ({t['contact_email']}) — {t['subject'][:60]} — {t['days_since_last']} days\n")

    # Write to file
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write(''.join(output))

    print(f"Priority follow-up report saved to: {OUTPUT_PATH}")
    print(f"\nSummary:")
    print(f"  - URGENT (awaiting reply): {len(awaiting_reply_investors)}")
    print(f"  - Ready for follow-up (5+ days): {len(ready_for_followup)}")
    print(f"  - Approaching follow-up (3-4 days): {len(approaching_followup)}")

if __name__ == '__main__':
    main()
