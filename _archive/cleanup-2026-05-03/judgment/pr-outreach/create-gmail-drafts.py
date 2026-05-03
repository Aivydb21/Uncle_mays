#!/usr/bin/env python3
"""
Create Gmail drafts for PR pitch emails
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

# Email 1: Ally Marotti (Crain's)
email1_to = 'ally.marotti@crain.com'
email1_subject = "Chicago story: Data-driven grocery platform targeting Black consumers, $6.3M Year 1 revenue projected"
email1_body = """Hi Ally,

I'm reaching out because Uncle May's Produce is launching a new model in Chicago grocery that I think fits your beat perfectly. We're opening a 10,000 sq ft store in Hyde Park with a thesis that challenges the typical food desert narrative: we're targeting affluent Black communities with a data-driven approach to product selection, pricing, and experience.

The fundamentals are unusual for grocery. I'm a Chicago Booth MBA with a PE/M&A background, we've secured a $2M SBA loan from Busey Bank, and we're projecting $6.3M in Year 1 revenue at 35% gross margins. The store is effectively a data platform, the first built specifically to understand and serve Black food consumption patterns. We have architectural plans from Civic Projects and Food Market Designs, and we're finalizing our Hyde Park location. The broader vision is an 82-store rollout across historically Black American communities nationwide, but the Chicago story is the starting point.

I'd love to offer you an exclusive first look as we move toward opening. Happy to share our unit economics, the SBA approval story, or our take on why the industry has missed this segment. You can reach me at (312) 972-2595 or anthony@unclemays.com.

Best,
Anthony Ivy
Founder & CEO, Uncle May's Produce
(312) 972-2595
anthony@unclemays.com"""

# Email 2: Derek Dingle (Black Enterprise)
email2_to = 'derek.dingle@blackenterprise.com'  # May need to verify this email
email2_subject = "Black-owned grocery platform challenging food desert narrative, $6.3M Year 1 revenue"
email2_body = """Hi Derek,

Uncle May's Produce is building something I think aligns well with Black Enterprise's mission around wealth creation and economic participation. We're launching the first data and distribution platform specifically designed for Black food consumption, starting with a 10,000 sq ft neighborhood grocery store in Chicago's Hyde Park.

The model challenges the typical food desert framing. We're not targeting underserved areas, we're targeting affluent Black communities with higher willingness to pay. The thesis is that Black consumers have been underserved by grocery not because of location, but because no one has built a data platform to understand their preferences, purchasing patterns, and cultural needs at scale. I'm a Chicago Booth MBA with a PE and M&A background, we've secured $2M in SBA financing, and we're projecting $6.3M in Year 1 revenue at 35% gross margins. The long-term vision is 82 stores nationwide, creating $625M in revenue by Year 10 and building generational wealth in the communities we serve.

I'd love to offer Black Enterprise an exclusive first look at the model, the unit economics, and the broader vision for how this creates wealth and economic participation at scale. You can reach me at (312) 972-2595 or anthony@unclemays.com.

Best,
Anthony Ivy
Founder & CEO, Uncle May's Produce
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

# Create both drafts
print("Creating Gmail drafts...")
draft1 = create_draft(email1_to, email1_subject, email1_body)
print(f"[OK] Draft created for Ally Marotti (Crain's) - Draft ID: {draft1['id']}")

draft2 = create_draft(email2_to, email2_subject, email2_body)
print(f"[OK] Draft created for Derek Dingle (Black Enterprise) - Draft ID: {draft2['id']}")

print("\n[SUCCESS] Both drafts created successfully!")
print("Check Gmail drafts folder to review and send.")
