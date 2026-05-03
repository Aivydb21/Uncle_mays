import json, os, urllib.request

# Load Apollo config
config_path = os.path.expanduser("~/.claude/apollo-config.json")
with open(config_path) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]

# Get Tier 1 campaign stats
campaign_id = "69d2a0b2c2e0c6000d1608d4"
req = urllib.request.Request(
    f"{BASE_URL}/emailer_campaigns/{campaign_id}",
    headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"}
)
resp = urllib.request.urlopen(req, timeout=30)
campaign = json.loads(resp.read())

print("=== Tier 1 Campaign (Thesis-Aligned Investors) ===")
print(f"Campaign: {campaign.get('name')}")
print(f"Active: {campaign.get('active')}")
print(f"Contacts: {campaign.get('num_contacts')}")
print(f"Sent: {campaign.get('num_sent_emails', 0)}")
print(f"Delivered: {campaign.get('num_delivered', 0)}")
print(f"Opens: {campaign.get('num_opens', 0)}")
print(f"Replies: {campaign.get('num_replies', 0)}")
print(f"Bounces: {campaign.get('num_bounces', 0)}")
print(f"Unsubscribes: {campaign.get('num_unsubscribes', 0)}")

# Get email accounts to check for stalls
req = urllib.request.Request(
    f"{BASE_URL}/email_accounts",
    headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"}
)
resp = urllib.request.urlopen(req, timeout=30)
accounts = json.loads(resp.read())

print("\n=== Email Account Status ===")
for acc in accounts.get('email_accounts', []):
    if acc.get('email') == 'anthony@unclemays.com':
        print(f"anthony@: sending_enabled={acc.get('sending_enabled')}, daily_limit={acc.get('daily_email_send_limit')}")
