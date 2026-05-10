"""Quick schema dump for the tables that failed."""
import os, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from google.auth.transport.requests import Request
from google.oauth2 import service_account
import urllib.request, urllib.error

PROJECT = "uncle-mays-automation"
SA = os.path.expanduser("~/.claude/ga-service-account.json")
creds = service_account.Credentials.from_service_account_file(SA, scopes=["https://www.googleapis.com/auth/bigquery"])
creds.refresh(Request())

def query(sql):
    req = urllib.request.Request(
        f"https://bigquery.googleapis.com/bigquery/v2/projects/{PROJECT}/queries",
        data=json.dumps({"query": sql, "useLegacySql": False, "timeoutMs": 30000}).encode(),
        headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        resp = json.loads(urllib.request.urlopen(req).read())
        fields = [f["name"] for f in resp.get("schema", {}).get("fields", [])]
        return [{fields[i]: c.get("v") for i, c in enumerate(r["f"])} for r in resp.get("rows", [])]
    except urllib.error.HTTPError as e:
        return [{"err": e.read().decode()[:200]}]

for tbl in ["charges", "checkout_sessions", "subscriptions", "customers"]:
    print(f"\n--- stripe_raw.{tbl} ---")
    for r in query(f"SELECT column_name, data_type FROM `{PROJECT}.stripe_raw.INFORMATION_SCHEMA.COLUMNS` WHERE table_name='{tbl}' ORDER BY ordinal_position LIMIT 40"):
        print(f"  {r}")

for tbl in ["meta_campaign_insights", "google_ads_campaign_insights"]:
    print(f"\n--- ads_raw.{tbl} ---")
    for r in query(f"SELECT column_name, data_type FROM `{PROJECT}.ads_raw.INFORMATION_SCHEMA.COLUMNS` WHERE table_name='{tbl}' ORDER BY ordinal_position LIMIT 60"):
        print(f"  {r}")
