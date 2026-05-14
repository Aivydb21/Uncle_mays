"""Generate the Fifth Star deck in Gamma via the public REST API.

Usage:  python reports/gamma_generate_fifth_star.py

Reads:
  - ~/.claude/gamma-config.json (api_key, base_url)
  - fifth-star-application/deck-rework-2026-05/fifth-star-deck.md (source markdown)

Posts to https://public-api.gamma.app/v1.0/generations, polls for completion,
prints the Gamma editor URL.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CONFIG = os.path.expanduser("~/.claude/gamma-config.json")
DECK = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "fifth-star-application", "deck-rework-2026-05", "fifth-star-deck.md",
)

with open(CONFIG) as f:
    cfg = json.load(f)
API_KEY = cfg["api_key"]
BASE = cfg["base_url"].rstrip("/")

with open(DECK, encoding="utf-8") as f:
    input_text = f.read()

THEME_PROMPT = (
    "Investment banker offering document style. Conservative palette: deep navy "
    "headers, ivory backgrounds, soft purple callout boxes for context notes, "
    "sage green callout boxes for positive points. Sans-serif headers, serif body. "
    "Each slide opens with a small italic uppercase category pill above the title "
    "in a muted color. Slim 1px horizontal divider directly under each title. "
    "Tables use light gray borders, no zebra striping, no shadows. Restrained use "
    "of color and no gradients. Every slide footer reads 'Uncle May's Produce. "
    "Confidential and Proprietary. Fifth Star Funds Application. May 2026.' in "
    "9pt muted gray, right-aligned with page number. Reference register: "
    "institutional private placement memorandum."
)

payload = {
    "inputText": input_text,
    "textMode": "preserve",
    "format": "presentation",
    "numCards": 20,
    "additionalInstructions": THEME_PROMPT,
    "textOptions": {
        "amount": "detailed",
        "tone": "professional, formal, investment banker, conservative",
    },
    "imageOptions": {
        "source": "aiGenerated",
        "style": "professional photography, conservative, no illustrations",
    },
    "cardOptions": {"dimensions": "16x9"},
}


def http(method, path, body=None):
    url = f"{BASE}{path}"
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("X-API-KEY", API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "curl/8.0")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, {"error_body": body}


print(f"Source: {DECK}")
print(f"Length: {len(input_text):,} chars")
print(f"POST {BASE}/generations ...")

status, body = http("POST", "/generations", payload)
print(f"  -> status {status}")
print(f"  -> body: {json.dumps(body, indent=2)[:1200]}")

generation_id = body.get("generationId") or body.get("id")
if not generation_id:
    print("\n[ERROR] No generationId in response. Aborting poll.")
    sys.exit(1)

print(f"\nPolling /generations/{generation_id} ...")
deadline = time.time() + 360  # 6 minutes max
while time.time() < deadline:
    status, body = http("GET", f"/generations/{generation_id}")
    state = body.get("status") or body.get("generationStatus") or "unknown"
    print(f"  status={status} state={state}")
    if state in ("completed", "succeeded", "done"):
        print("\n=== COMPLETED ===")
        print(json.dumps(body, indent=2))
        url = body.get("gammaUrl") or body.get("url") or body.get("editorUrl")
        if url:
            print(f"\n>>> Gamma editor URL: {url}")
        break
    if state in ("failed", "error"):
        print("\n=== FAILED ===")
        print(json.dumps(body, indent=2))
        sys.exit(1)
    time.sleep(10)
else:
    print("\n[TIMEOUT] Generation did not complete within 6 minutes.")
    sys.exit(1)
