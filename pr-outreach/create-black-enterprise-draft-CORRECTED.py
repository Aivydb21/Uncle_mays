#!/usr/bin/env python3
"""
Create CORRECTED Gmail draft for Black Enterprise with proper email address
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

# CORRECTED Email: Black Enterprise Editorial Team
email_to = 'beeditors@blackenterprise.com'  # CORRECTED ADDRESS
email_subject = "Award-winning Black entrepreneur: First data platform for Black food consumption, SXSW speaker"
email_body = """Hi Black Enterprise Editorial Team,

Uncle May's Produce is building something I think aligns well with Black Enterprise's mission around wealth creation and economic participation. We're launching the first data and distribution platform specifically designed for Black food consumption, starting with a 10,000 sq ft neighborhood grocery store in Chicago's Hyde Park. The model just won us the 2025 Chicago TechRise Award and World Business Chicago Food Innovation Award, and I spoke about the broader implications at South by Southwest this year.

The model challenges the typical food desert framing. We're not targeting underserved areas, we're targeting affluent Black communities with higher willingness to pay. The thesis is that Black consumers have been underserved by grocery not because of location, but because no one has built a data platform to understand their preferences, purchasing patterns, and cultural needs at scale. I'm a Chicago Booth MBA with a PE and M&A background, we've secured $2M in SBA financing from Busey Bank, and we're projecting $6.3M in Year 1 revenue at 35% gross margins. The long-term vision is 82 stores nationwide, creating $625M in revenue by Year 10 and building generational wealth in the communities we serve.

I'd love to offer Black Enterprise an exclusive first look at the model, the unit economics, and the broader vision for how this creates wealth and economic participation at scale. You can reach me at (312) 972-2595 or anthony@unclemays.com.

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

# Create CORRECTED draft
print("Creating CORRECTED Gmail draft for Black Enterprise...")
print(f"To: {email_to}")
draft = create_draft(email_to, email_subject, email_body)
print(f"[OK] Draft created - Draft ID: {draft['id']}")

print("\n[SUCCESS] CORRECTED Black Enterprise draft created!")
print("\nNOTE: Previous draft to derek.dingle@blackenterprise.com should be deleted.")
print("This draft goes to beeditors@blackenterprise.com (editorial team).")
