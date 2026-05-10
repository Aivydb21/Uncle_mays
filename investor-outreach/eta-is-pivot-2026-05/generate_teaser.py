"""
Render the Uncle May's Wave 1 teaser one-pager to Gamma using the same
institutional pitchbook aesthetic as the parent investor deck. Output is a
short multi-card mini-deck Anthony can export to PDF and attach to email 2
of the cold sequence.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/gamma-config.json")
TEASER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "teaser-one-pager.md")

with open(CONFIG_PATH) as f:
    cfg = json.load(f)

API_KEY = cfg["api_key"]
BASE_URL = cfg["base_url"]

with open(TEASER_PATH, encoding="utf-8") as f:
    input_text = f.read()

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "curl/8.0",
}

payload = {
    "inputText": input_text,
    "textMode": "preserve",
    "format": "presentation",
    "cardSplit": "inputTextBreaks",
    "additionalInstructions": (
        "DESIGN BRIEF: This is a one-page deal teaser, not a full pitchbook. "
        "Render as a short, dense, institutional tear-sheet. Same disciplined "
        "aesthetic as the parent Uncle May's investor deck. Audience is "
        "self-funded searcher LP funds and family offices that back self-funded "
        "searchers; they will read this in under two minutes and decide whether "
        "to ask for the full deck. "
        "\n\n"
        "PALETTE: Conservative institutional. Deep navy primary (#0B2545 or "
        "similar), muted gold accent (#A88A4A or similar), ivory or white "
        "background, charcoal text. No bright or saturated colors. No gradients. "
        "\n\n"
        "TYPOGRAPHY: Classic serif headlines (Garamond, Times, or similar), "
        "clean sans-serif body and tables (Helvetica, Arial). No display fonts. "
        "Generous tracking. "
        "\n\n"
        "LAYOUT: Tear-sheet format. Tables rendered with thin gridlines and "
        "zebra striping, like a pitchbook exhibit. Footer on every card with "
        "'Uncle May's Produce' at left, page number at right, 'Confidential and "
        "Proprietary' centered. Tight internal padding; this is not a "
        "presentation, it is a one-page brief that may run to two or three "
        "pages on export. "
        "\n\n"
        "IMAGERY: Minimal. Cover card may have one tasteful image at most "
        "(produce, Black agricultural heritage, or Hyde Park storefront). All "
        "other cards are data and text only, no decorative photos or icons. "
        "\n\n"
        "DENSITY: Higher than a typical Gamma presentation. Investors expect "
        "numbers, tables, and structured analysis on a teaser. Do not strip "
        "detail to make slides 'cleaner.' Let the tables breathe with padding "
        "but do not collapse columns or summarize away numbers. "
        "\n\n"
        "TYPOGRAPHY RULE (HARD): Do not introduce em dashes (the long dash "
        "character) anywhere in the rendered output. Use commas, colons, "
        "periods, or parentheses instead. En dashes are acceptable only inside "
        "numeric ranges. Preserve the punctuation as written in the source "
        "markdown."
    ),
    "textOptions": {
        "amount": "detailed",
        "tone": "disciplined, operator-investor, measured",
        "audience": "self-funded searcher LP funds and family offices",
        "language": "en",
    },
    "imageOptions": {
        "source": "aiGenerated",
        "style": (
            "Restrained photojournalistic photography, warm natural lighting, "
            "Hyde Park Chicago neighborhood grocery storefront or Black-American "
            "agricultural heritage subject matter on the cover only. Documentary "
            "feel. Never staged stock photography."
        ),
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


print(f"Submitting teaser to Gamma ({len(input_text):,} chars)...")
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
        print("TEASER READY")
        print("=" * 70)
        print(f"URL: {url}")
        print()
        print(json.dumps(status, indent=2))
        out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gamma-teaser-result.json")
        with open(out_path, "w") as f:
            json.dump(status, f, indent=2)
        sys.exit(0)
    if s in ("failed", "error"):
        print(f"Generation failed: {json.dumps(status, indent=2)}", file=sys.stderr)
        sys.exit(1)

print("Timed out waiting for generation.", file=sys.stderr)
sys.exit(1)
