#!/usr/bin/env python3
"""
Create Gmail draft for summit organizers
"""

import json
import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Load Gmail OAuth token
token_path = 'C:/Users/Anthony/.claude/gmail-oauth-token.json'
with open(token_path, 'r') as f:
    token_data = json.load(f)

# Create credentials
creds = Credentials(
    token=token_data.get('access_token'),
    refresh_token=token_data.get('refresh_token'),
    token_uri='https://oauth2.googleapis.com/token',
    client_id=token_data.get('client_id'),
    client_secret=token_data.get('client_secret')
)

# Build Gmail service
service = build('gmail', 'v1', credentials=creds)

# Email to summit organizers
email_to = 'GRS2026@fsfinstitute.net'
email_subject = "Speaker/Panelist Request: Award-Winning Chicago Grocer - Data Platform, SBA Financing, SXSW 2026"
email_body = """Dear Grocery Retail for All Summit Organizers,

I'm reaching out to express interest in speaking or participating as a panelist at the 2026 Grocery Retail for All Summit on June 18. I founded Uncle May's Produce, a Chicago-based grocery model that I believe aligns closely with the summit's focus on innovative, sustainable approaches to grocery retail in underserved communities.

Uncle May's is building the first data and distribution platform specifically designed for Black food consumption, starting with a 10,000 sq ft store in Chicago's Hyde Park. The model won us the 2025 Chicago TechRise Award and World Business Chicago Food Innovation Award, and I spoke about these food systems innovations as a panelist at SXSW 2026's Midwest House programming alongside Dion's Chicago Dream.

What makes our model relevant to your audience is the intersection of data, financing, and economic sustainability. We've secured $2M in SBA financing from Busey Bank, and we're projecting $6.3M in Year 1 revenue at 35% gross margins. The thesis challenges the typical food desert framing by targeting affluent Black communities with a data-driven approach to product selection, pricing, and cultural relevance. The broader vision is an 82-store national rollout, proving that independent grocery in historically underinvested Black communities can be both impactful and financially sustainable.

I'd be honored to share insights on any of these topics at the summit:
- How to secure SBA financing for grocery retail (replicable model)
- Using data and technology to optimize neighborhood grocery operations
- Building economically sustainable models in underserved communities
- The role of PE/M&A thinking in independent grocery (I'm a Chicago Booth MBA)

I've attached a one-sheet with additional details about Uncle May's model, team, and unit economics. Happy to provide any other materials that would be helpful. You can reach me at (312) 972-2595 or anthony@unclemays.com.

Thank you for considering this request, and for organizing what looks to be an essential gathering for the future of community-centered grocery retail.

Best,
Anthony Ivy
Founder & CEO, Uncle May's Produce
2025 Chicago TechRise Award Winner
2025 World Business Chicago Food Innovation Award Winner
SXSW 2026 Speaker
Chicago Booth MBA
(312) 972-2595
anthony@unclemays.com"""

def create_draft(to, subject, body):
    """Create a Gmail draft"""
    message = MIMEText(body)
    message['to'] = to
    message['subject'] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    draft = service.users().drafts().create(
        userId='me',
        body={'message': {'raw': raw}}
    ).execute()

    return draft

# Create draft
print("Creating Gmail draft for summit organizers...")
print(f"To: {email_to}")
draft = create_draft(email_to, email_subject, email_body)
print(f"[OK] Draft created - Draft ID: {draft['id']}")

print("\n[SUCCESS] Summit organizer email draft created!")
print("\nIMPORTANT REMINDERS:")
print("1. Convert uncle-mays-one-sheet.md to Uncle-Mays-One-Sheet.pdf")
print("2. Attach the PDF to this draft before sending")
print("3. Gmail drafts do not support attachments via API - you must add it manually in Gmail")
print("4. Review and send when ready")
