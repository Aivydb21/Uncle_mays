import json, os, urllib.request

home = os.path.expanduser("~")
with open(home + "/.claude/apollo-config.json", encoding="utf-8-sig") as f:
    cfg = json.load(f)

req = urllib.request.Request(
    f"{cfg['base_url']}/email_accounts",
    headers={"X-Api-Key": cfg["api_key"], "User-Agent": "curl/8.0"},
)
data = json.loads(urllib.request.urlopen(req).read())
accounts = data.get("email_accounts") or data.get("emailer_accounts") or data
if isinstance(accounts, dict):
    accounts = accounts.get("data", accounts)

for a in accounts if isinstance(accounts, list) else []:
    print(f"{a.get('email'):40} active={a.get('active')} revoked_at={a.get('revoked_at')} daily_limit={a.get('daily_send_limit') or a.get('daily_limit')} provider={a.get('provider') or a.get('email_provider')}")
