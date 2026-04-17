#!/usr/bin/env python3
"""
Gmail API Setup for Investor Outreach
Sets up OAuth authentication for Gmail API access
"""

import json
import os
from pathlib import Path
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.modify'
]

CONFIG_DIR = Path.home() / '.claude'
GMAIL_TOKEN_PATH = CONFIG_DIR / 'gmail-oauth-token.json'
GMAIL_CREDS_PATH = CONFIG_DIR / 'ga-oauth-credentials.json'  # Reuse GA OAuth client

def setup_gmail_auth():
    """Set up Gmail API authentication"""
    creds = None

    # Check if we already have a token
    if GMAIL_TOKEN_PATH.exists():
        with open(GMAIL_TOKEN_PATH, 'r') as token:
            creds = Credentials.from_authorized_user_info(json.load(token), SCOPES)

    # If no valid credentials, start OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            print("Starting OAuth flow...")
            if not GMAIL_CREDS_PATH.exists():
                print(f"Error: OAuth credentials not found at {GMAIL_CREDS_PATH}")
                print("Please ensure ga-oauth-credentials.json exists")
                return None

            flow = InstalledAppFlow.from_client_secrets_file(
                str(GMAIL_CREDS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)

        # Save credentials
        with open(GMAIL_TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())
        print(f"Credentials saved to {GMAIL_TOKEN_PATH}")

    return creds

def test_gmail_connection(creds):
    """Test Gmail API connection"""
    try:
        service = build('gmail', 'v1', credentials=creds)
        profile = service.users().getProfile(userId='me').execute()
        print(f"\n✓ Gmail API connected successfully!")
        print(f"  Email: {profile['emailAddress']}")
        print(f"  Messages: {profile.get('messagesTotal', 'N/A')}")
        print(f"  Threads: {profile.get('threadsTotal', 'N/A')}")
        return True
    except Exception as e:
        print(f"\n✗ Gmail API connection failed: {e}")
        return False

if __name__ == '__main__':
    print("Gmail API Setup")
    print("=" * 50)

    # Ensure config directory exists
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    # Set up authentication
    creds = setup_gmail_auth()

    if creds:
        # Test connection
        if test_gmail_connection(creds):
            print("\n✓ Gmail API is ready to use!")
            print(f"\nToken saved to: {GMAIL_TOKEN_PATH}")
        else:
            print("\n✗ Setup completed but connection test failed")
    else:
        print("\n✗ Setup failed")
