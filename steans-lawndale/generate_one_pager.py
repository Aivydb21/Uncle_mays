"""
Submit the workforce one-pager to Gamma's public API as a DOCUMENT (not a deck)
and poll for completion. Leave-behind for Justeen Robinson, Steans Family Foundation.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/gamma-config.json")
DOC_PATH = "workforce-one-pager.md"

with open(CONFIG_PATH) as f:
    cfg = json.load(f)

API_KEY = cfg["api_key"]
BASE_URL = cfg["base_url"]

with open(DOC_PATH, encoding="utf-8") as f:
    input_text = f.read()

# Strip the `---` horizontal-rule separators so Gamma treats this as one
# continuous document and does not break the content into pages.
input_text = "\n".join(
    line for line in input_text.splitlines() if line.strip() != "---"
)

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "curl/8.0",
}

payload = {
    "inputText": input_text,
    "textMode": "preserve",
    "format": "document",
    "cardSplit": "auto",
    "additionalInstructions": (
        "Format as a single-page leave-behind document for a foundation diligence officer. "
        "Clean, formal aesthetic. Dark green (#1F4E2C) and gold (#C9A02E) accent palette, "
        "matching Uncle May's brand. Tables must remain readable and not be reformatted. "
        "Do not add filler imagery; this is a substantive workforce-development memo, not a deck. "
        "Preserve all numbers, names, and program references exactly as written."
    ),
    "textOptions": {
        "amount": "detailed",
        "tone": "professional",
        "audience": "place-based foundation workforce-development officer",
        "language": "en",
    },
    "imageOptions": {
        "source": "noImages",
    },
    "cardOptions": {
        "dimensions": "letter",
    },
    "sharingOptions": {
        "workspaceAccess": "view",
        "externalAccess": "noAccess",
    },
}


def post(path, body):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"HTTPError {e.code}: {body_text}", file=sys.stderr)
        raise


def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"HTTPError {e.code}: {body_text}", file=sys.stderr)
        raise


print(f"Submitting workforce one-pager to Gamma ({len(input_text):,} chars)...")
result = post("/generations", payload)
gen_id = result.get("generationId") or result.get("id")
print(f"Generation ID: {gen_id}")
print(f"Initial response: {json.dumps(result, indent=2)[:500]}")

if not gen_id:
    print("No generation ID returned; aborting.", file=sys.stderr)
    sys.exit(1)

print("Polling for completion...")
for attempt in range(60):
    time.sleep(10)
    status = get(f"/generations/{gen_id}")
    s = status.get("status", "unknown")
    print(f"  attempt {attempt+1}: status = {s}")
    if s in ("completed", "complete", "succeeded"):
        url = status.get("gammaUrl") or status.get("url") or status.get("shareUrl")
        print()
        print("=" * 70)
        print("ONE-PAGER READY")
        print("=" * 70)
        print(f"URL: {url}")
        print()
        print(json.dumps(status, indent=2))
        with open("gamma-one-pager-result.json", "w") as f:
            json.dump(status, f, indent=2)
        sys.exit(0)
    if s in ("failed", "error"):
        print(f"Generation failed: {json.dumps(status, indent=2)}", file=sys.stderr)
        sys.exit(1)

print("Timed out waiting for generation.", file=sys.stderr)
sys.exit(1)
