#!/usr/bin/env python3
"""
Gmail Follow-up Analyzer
Reviews Gmail inbox and sent messages to identify conversations needing follow-ups
"""

import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict
import re
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64

CONFIG_DIR = Path.home() / '.claude'
GMAIL_TOKEN_PATH = CONFIG_DIR / 'gmail-oauth-token.json'
INVESTOR_KEYWORDS = [
    'venture', 'capital', 'investment', 'fund', 'vc', 'angel', 'investor',
    'safe', 'equity', 'round', 'raising', 'seed', 'series', 'partner',
    'portfolio', 'thesis', 'diligence', 'term sheet', 'valuation'
]

def load_gmail_service():
    """Load Gmail API service"""
    if not GMAIL_TOKEN_PATH.exists():
        print(f"Error: Gmail token not found at {GMAIL_TOKEN_PATH}")
        print("Run setup-gmail-access.py first")
        return None

    with open(GMAIL_TOKEN_PATH, 'r') as f:
        creds = Credentials.from_authorized_user_info(json.load(f))

    return build('gmail', 'v1', credentials=creds)

def get_message_details(service, msg_id):
    """Get full message details"""
    try:
        msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
        return msg
    except Exception as e:
        print(f"Error fetching message {msg_id}: {e}")
        return None

def parse_message(msg):
    """Parse message to extract key details"""
    headers = {h['name'].lower(): h['value'] for h in msg['payload']['headers']}

    # Get body
    body = ""
    if 'parts' in msg['payload']:
        for part in msg['payload']['parts']:
            if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                break
    elif 'body' in msg['payload'] and 'data' in msg['payload']['body']:
        body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode('utf-8', errors='ignore')

    return {
        'id': msg['id'],
        'thread_id': msg['threadId'],
        'from': headers.get('from', ''),
        'to': headers.get('to', ''),
        'subject': headers.get('subject', ''),
        'date': headers.get('date', ''),
        'timestamp': int(msg['internalDate']) / 1000,
        'body': body[:1000],  # First 1000 chars
        'snippet': msg.get('snippet', ''),
        'labels': msg.get('labelIds', [])
    }

def is_investor_related(msg_data):
    """Check if message is investor-related"""
    text = f"{msg_data['subject']} {msg_data['snippet']} {msg_data['body']}".lower()
    return any(keyword in text for keyword in INVESTOR_KEYWORDS)

def analyze_thread(service, thread_id, messages):
    """Analyze a thread to determine if follow-up is needed"""
    # Sort by timestamp
    thread_msgs = sorted([m for m in messages if m['thread_id'] == thread_id],
                         key=lambda x: x['timestamp'])

    if not thread_msgs:
        return None

    first_msg = thread_msgs[0]
    last_msg = thread_msgs[-1]

    # Check if last message was from Anthony (sent)
    anthony_sent_last = 'SENT' in last_msg['labels']

    # Days since last message
    days_since = (datetime.now().timestamp() - last_msg['timestamp']) / 86400

    # Extract contact email
    if anthony_sent_last:
        # Last message was from Anthony, extract recipient
        contact_email = last_msg['to'].split('<')[-1].rstrip('>')
    else:
        # Last message was from contact
        contact_email = last_msg['from'].split('<')[-1].rstrip('>')

    # Extract name
    contact_name = contact_email.split('@')[0].replace('.', ' ').title()
    if '<' in (last_msg['from'] if not anthony_sent_last else last_msg['to']):
        name_part = (last_msg['from'] if not anthony_sent_last else last_msg['to']).split('<')[0].strip().strip('"')
        if name_part:
            contact_name = name_part

    return {
        'thread_id': thread_id,
        'contact_name': contact_name,
        'contact_email': contact_email,
        'subject': first_msg['subject'],
        'message_count': len(thread_msgs),
        'last_message_date': datetime.fromtimestamp(last_msg['timestamp']).strftime('%Y-%m-%d'),
        'days_since_last': int(days_since),
        'anthony_sent_last': anthony_sent_last,
        'needs_followup': anthony_sent_last and days_since >= 5,  # 5+ days since Anthony sent
        'last_snippet': last_msg['snippet']
    }

def main():
    print("Gmail Follow-up Analyzer")
    print("=" * 70)

    service = load_gmail_service()
    if not service:
        return

    # Fetch last 400 messages
    print("\nFetching last 400 messages...")
    results = service.users().messages().list(userId='me', maxResults=400).execute()
    messages = results.get('messages', [])

    print(f"Found {len(messages)} messages")

    # Parse all messages
    print("\nParsing messages...")
    parsed_messages = []
    for i, msg in enumerate(messages):
        if i % 50 == 0:
            print(f"  Processed {i}/{len(messages)}...")
        msg_data = get_message_details(service, msg['id'])
        if msg_data:
            parsed = parse_message(msg_data)
            parsed_messages.append(parsed)

    print(f"Parsed {len(parsed_messages)} messages")

    # Filter investor-related messages
    investor_msgs = [m for m in parsed_messages if is_investor_related(m)]
    print(f"\nFound {len(investor_msgs)} investor-related messages")

    # Group by thread
    threads = defaultdict(list)
    for msg in investor_msgs:
        threads[msg['thread_id']].append(msg)

    print(f"Organized into {len(threads)} conversation threads")

    # Analyze each thread
    print("\nAnalyzing threads...")
    thread_analyses = []
    for thread_id in threads:
        analysis = analyze_thread(service, thread_id, investor_msgs)
        if analysis:
            thread_analyses.append(analysis)

    # Sort by priority: needs follow-up, then days since last
    thread_analyses.sort(key=lambda x: (not x['needs_followup'], -x['days_since_last']))

    # Generate report
    print("\n" + "=" * 70)
    print("FOLLOW-UP REPORT")
    print("=" * 70)

    needs_followup = [t for t in thread_analyses if t['needs_followup']]
    print(f"\nNEEDS FOLLOW-UP ({len(needs_followup)} threads)")
    print("-" * 70)

    for t in needs_followup[:20]:  # Top 20
        print(f"\n{t['contact_name']} <{t['contact_email']}>")
        print(f"  Subject: {t['subject']}")
        print(f"  Last message: {t['last_message_date']} ({t['days_since_last']} days ago)")
        print(f"  Thread: {t['message_count']} messages")
        print(f"  Snippet: {t['last_snippet'][:100]}...")

    # Save full report
    report_path = Path('C:/Users/Anthony/Desktop/um_website/investor-outreach/reports/gmail-followup-analysis.json')
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w') as f:
        json.dump({
            'generated_at': datetime.now().isoformat(),
            'total_messages': len(parsed_messages),
            'investor_messages': len(investor_msgs),
            'total_threads': len(threads),
            'needs_followup_count': len(needs_followup),
            'threads': thread_analyses
        }, f, indent=2)

    print(f"\n\nFull report saved to: {report_path}")
    print(f"{len(needs_followup)} threads need follow-up")


# ---------------------------------------------------------------------------
# Thin CLI wrapper — adds --mode dormant-json for Trigger.dev dormant revival
# and exposes extract_thread_for_contact() for build-contact-file.py.
# Do not modify existing logic above; only add below.
# ---------------------------------------------------------------------------

import argparse as _argparse
import sys as _sys


def _get_all_threads(service):
    """Shared helper: fetch + parse investor threads. Returns (parsed_msgs, thread_analyses)."""
    results = service.users().messages().list(userId='me', maxResults=500).execute()
    messages = results.get('messages', [])
    parsed_messages = []
    for msg in messages:
        msg_data = get_message_details(service, msg['id'])
        if msg_data:
            parsed = parse_message(msg_data)
            parsed_messages.append(parsed)

    investor_msgs = [m for m in parsed_messages if is_investor_related(m)]
    threads = defaultdict(list)
    for msg in investor_msgs:
        threads[msg['thread_id']].append(msg)

    thread_analyses = []
    for thread_id in threads:
        analysis = analyze_thread(service, thread_id, investor_msgs)
        if analysis:
            thread_analyses.append(analysis)
    return investor_msgs, thread_analyses


def _enrich_dormant_thread(service, thread_id: str, investor_msgs: list, thread_summary: dict) -> dict:
    """Add inbound/outbound quote fields required by DormantCandidate schema."""
    thread_msgs = sorted(
        [m for m in investor_msgs if m['thread_id'] == thread_id],
        key=lambda x: x['timestamp']
    )
    last_inbound = None
    last_outbound = None
    for m in thread_msgs:
        if 'SENT' in m['labels']:
            last_outbound = m
        else:
            last_inbound = m

    def fmt_date(ts):
        if not ts:
            return ""
        return datetime.fromtimestamp(ts).strftime('%Y-%m-%d')

    return {
        "email": thread_summary['contact_email'],
        "name": thread_summary['contact_name'],
        "firm": None,
        "thread_id": thread_id,
        "subject": thread_summary['subject'],
        "last_inbound_quote": (last_inbound['body'][:300] if last_inbound else ""),
        "last_inbound_date": fmt_date(last_inbound['timestamp'] if last_inbound else None),
        "last_outbound_date": fmt_date(last_outbound['timestamp'] if last_outbound else None),
        "days_dormant": thread_summary['days_since_last'],
        "pending_ask": None,
        "prior_objections": [],
    }


def dormant_json_mode(min_days: int = 120, max_days: int = 210, require_inbound: bool = True):
    """
    --mode dormant-json entry point.
    Prints a JSON array of DormantCandidate objects to stdout.
    """
    service = load_gmail_service()
    if not service:
        print("[]")
        return

    investor_msgs, thread_analyses = _get_all_threads(service)

    candidates = []
    for t in thread_analyses:
        days = t['days_since_last']
        if not (min_days <= days <= max_days):
            continue
        # require_inbound: thread must have at least one non-SENT message
        if require_inbound:
            has_inbound = any(
                m['thread_id'] == t['thread_id'] and 'SENT' not in m['labels']
                for m in investor_msgs
            )
            if not has_inbound:
                continue
        enriched = _enrich_dormant_thread(service, t['thread_id'], investor_msgs, t)
        candidates.append(enriched)

    print(json.dumps(candidates, indent=2))


def extract_thread_for_contact(email: str, thread_id: str | None = None) -> dict:
    """
    Called by build-contact-file.py to pull Gmail thread data for a specific contact.
    Returns a dict matching the ThreadExtract field names.
    """
    service = load_gmail_service()
    if not service:
        return {}

    investor_msgs, thread_analyses = _get_all_threads(service)

    # Find threads involving this email
    matching = [
        t for t in thread_analyses
        if t['contact_email'].lower() == email.lower()
    ]
    if not matching:
        return {}

    t = matching[0]  # most recent or first match
    enriched = _enrich_dormant_thread(service, t['thread_id'], investor_msgs, t)

    # Build all touch log rows
    thread_msgs = sorted(
        [m for m in investor_msgs if m['thread_id'] == t['thread_id']],
        key=lambda x: x['timestamp']
    )
    touch_log = []
    for m in thread_msgs:
        direction = "out" if 'SENT' in m['labels'] else "in"
        touch_log.append({
            "date": datetime.fromtimestamp(m['timestamp']).strftime('%Y-%m-%d'),
            "channel": "email",
            "direction": direction,
            "summary": m['snippet'][:80] if m.get('snippet') else "",
            "next_step": "",
        })

    return {
        "subject": t['subject'],
        "first_touch": touch_log[0]['date'] if touch_log else "",
        "last_touch": touch_log[-1]['date'] if touch_log else "",
        "last_inbound_quote": enriched['last_inbound_quote'],
        "last_inbound_date": enriched['last_inbound_date'],
        "last_outbound_quote": touch_log[-1]['summary'] if touch_log and touch_log[-1]['direction'] == 'out' else "",
        "last_outbound_date": enriched['last_outbound_date'],
        "pending_ask": None,
        "objections": [],
        "touch_log": touch_log,
        "summary_seed": f"Contact email: {email}. {t['message_count']} messages. Last activity: {t['last_message_date']}.",
    }


def _cli_main():
    ap = _argparse.ArgumentParser(description="Gmail Follow-up Analyzer")
    ap.add_argument("--mode", choices=["followup", "dormant-json"], default="followup")
    ap.add_argument("--min-days", type=int, default=120)
    ap.add_argument("--max-days", type=int, default=210)
    ap.add_argument("--require-inbound", action="store_true")
    args = ap.parse_args()

    if args.mode == "dormant-json":
        dormant_json_mode(
            min_days=args.min_days,
            max_days=args.max_days,
            require_inbound=args.require_inbound,
        )
    else:
        main()


if __name__ == '__main__':
    _cli_main()
