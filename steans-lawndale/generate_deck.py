"""
Submit the Steans deck markdown to Gamma's public API and poll for completion.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/gamma-config.json")
DECK_PATH = "steans-deck.md"

with open(CONFIG_PATH) as f:
    cfg = json.load(f)

API_KEY = cfg["api_key"]
BASE_URL = cfg["base_url"]

with open(DECK_PATH, encoding="utf-8") as f:
    input_text = f.read()

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "curl/8.0",
}

# Submit generation request
# Use "preserve" so Gamma keeps the content I authored verbatim, just lays it out.
# Slides separated in markdown with `---`.
payload = {
    "inputText": input_text,
    "textMode": "preserve",
    "format": "presentation",
    "cardSplit": "inputTextBreaks",
    "additionalInstructions": (
        "Use a clean, formal investor-presentation aesthetic. "
        "Dark green and gold accent palette (Uncle May's brand). "
        "Tables should remain readable. "
        "Imagery on title and section divider slides only."
    ),
    "textOptions": {
        "amount": "detailed",
        "tone": "professional",
        "audience": "place-based foundation diligence team",
        "language": "en",
    },
    "imageOptions": {
        "source": "aiGenerated",
        "style": "photorealistic, neighborhood grocery store, warm natural lighting",
    },
    "cardOptions": {
        "dimensions": "fluid",
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
        body = e.read().decode("utf-8", errors="replace")
        print(f"HTTPError {e.code}: {body}", file=sys.stderr)
        raise


def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"HTTPError {e.code}: {body}", file=sys.stderr)
        raise


print(f"Submitting deck to Gamma ({len(input_text):,} chars)...")
result = post("/generations", payload)
gen_id = result.get("generationId") or result.get("id")
print(f"Generation ID: {gen_id}")
print(f"Initial response: {json.dumps(result, indent=2)[:500]}")

if not gen_id:
    print("No generation ID returned; aborting.", file=sys.stderr)
    sys.exit(1)

# Poll
print("Polling for completion...")
for attempt in range(60):  # up to ~10 minutes
    time.sleep(10)
    status = get(f"/generations/{gen_id}")
    s = status.get("status", "unknown")
    print(f"  attempt {attempt+1}: status = {s}")
    if s in ("completed", "complete", "succeeded"):
        url = status.get("gammaUrl") or status.get("url") or status.get("shareUrl")
        print()
        print("=" * 70)
        print("DECK READY")
        print("=" * 70)
        print(f"URL: {url}")
        print()
        print(json.dumps(status, indent=2))
        with open("gamma-deck-result.json", "w") as f:
            json.dump(status, f, indent=2)
        sys.exit(0)
    if s in ("failed", "error"):
        print(f"Generation failed: {json.dumps(status, indent=2)}", file=sys.stderr)
        sys.exit(1)

print("Timed out waiting for generation.", file=sys.stderr)
sys.exit(1)
