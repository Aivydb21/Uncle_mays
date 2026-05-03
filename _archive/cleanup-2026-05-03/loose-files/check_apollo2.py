import json, os, urllib.request

config_path = os.path.expanduser("~/.claude/apollo-config.json")
with open(config_path) as f:
    config = json.load(f)

API_KEY = config["api_key"]
BASE_URL = config["base_url"]

# List all campaigns
print("=== Listing all campaigns ===")
req = urllib.request.Request(
    f"{BASE_URL}/emailer_campaigns",
    headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"}
)
try:
    resp = urllib.request.urlopen(req, timeout=30)
    data = json.loads(resp.read())
    campaigns = data.get('emailer_campaigns', [])
    print(f"Total campaigns: {len(campaigns)}")

    for c in campaigns[:10]:
        print(f"\n{c.get('id')}: {c.get('name')}")
        print(f"  Active: {c.get('active')}, Contacts: {c.get('num_contacts')}")
        print(f"  Sent: {c.get('num_sent_emails', 0)}, Delivered: {c.get('num_delivered', 0)}")
        print(f"  Opens: {c.get('num_opens', 0)}, Replies: {c.get('num_replies', 0)}")

except Exception as e:
    print(f"Error: {e}")

# Try a simpler call - check if the key is working at all
print("\n=== Checking API auth ===")
req = urllib.request.Request(
    f"{BASE_URL}/auth/health",
    headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0"}
)
try:
    resp = urllib.request.urlopen(req, timeout=30)
    print("API key is valid")
except Exception as e:
    print(f"API error: {e}")
