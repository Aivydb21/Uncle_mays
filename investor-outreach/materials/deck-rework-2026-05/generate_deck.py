"""
Submit the restructured Uncle May's investor deck to Gamma's public API and
poll for completion. Adapted from steans-lawndale/generate_deck.py.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/gamma-config.json")
DECK_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uncle-mays-deck.md")

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

payload = {
    "inputText": input_text,
    "textMode": "preserve",
    "format": "presentation",
    "cardSplit": "inputTextBreaks",
    "additionalInstructions": (
        "DESIGN BRIEF: This deck must look and feel like a Goldman Sachs, Morgan Stanley, "
        "or Houlihan Lokey institutional pitchbook. Investment banking aesthetic, not a "
        "startup deck. The audience is family offices, ETA buyers, institutional limited "
        "partners, and catalytic capital allocators who read pitchbooks daily. "
        "\n\n"
        "PALETTE: Conservative institutional palette only. Primary: deep navy (#0B2545 or "
        "similar). Accent: muted gold or warm tan (#A88A4A or similar). Background: "
        "white or ivory (#FAFAF7). Text: charcoal (#1A1A1A) or near-black. Avoid bright "
        "or saturated colors. No gradients. No neon. No purple, pink, or trendy startup "
        "colors. Charts and tables use the same restricted palette. "
        "\n\n"
        "TYPOGRAPHY: Classic serif for headlines and slide titles (Garamond, Times, or "
        "similar institutional serif). Clean sans-serif for body and tables (Helvetica, "
        "Arial, or similar). Generous tracking. No display fonts. No script fonts. "
        "\n\n"
        "LAYOUT: White space generous. Each slide should breathe. Tables rendered with "
        "thin gridlines and zebra striping like a pitchbook exhibit; do not collapse or "
        "summarize numerical content. Section dividers (slides 9, 16) are simple title "
        "pages. Cover slide is restrained, not splashy. Footer on every content slide "
        "with the words 'Uncle May's Produce' at left, page number at right, and "
        "'Confidential and Proprietary' centered. No decorative graphics in margins. "
        "\n\n"
        "IMAGERY: Use imagery extremely sparingly. Cover slide may have one tasteful "
        "full-bleed photograph. Section dividers and the closing slide may have one "
        "restrained image each. All other content slides are data and text only, no "
        "decorative photos or icons. When images are used, they should be photorealistic, "
        "warm natural lighting, neighborhood-grocery or 1930s Black-American agricultural "
        "heritage themes. Never use generic stock business photography. "
        "\n\n"
        "DENSITY: This is a pitchbook, not a startup deck. Tolerate higher information "
        "density than a typical Gamma presentation. Investors expect numbers, tables, and "
        "structured analysis. Do not strip detail to make slides 'cleaner.' "
        "However, on slides with dense tables or multiple sub-sections (especially the "
        "use-of-funds, defensible-cost, future-cost, capitalization-by-phase, "
        "sources-and-uses, and investor-alignment slides), use generous internal padding, "
        "consistent column widths, and zebra striping to preserve readability. If a "
        "single card would render too tight, split it across two cards rather than "
        "shrinking type. Body type minimum 11pt equivalent, table type minimum 10pt. "
        "\n\n"
        "TYPOGRAPHY RULE (HARD): Do not introduce em dashes (the long dash character) "
        "anywhere in the rendered output. Use commas, colons, periods, or parentheses "
        "instead. En dashes are acceptable only inside numeric ranges. Preserve the "
        "punctuation as written in the source markdown."
    ),
    "textOptions": {
        "amount": "detailed",
        "tone": "disciplined, operator-investor, measured",
        "audience": "family offices, ETA buyers, operator-investors, catalytic impact capital",
        "language": "en",
    },
    "imageOptions": {
        "source": "aiGenerated",
        "style": (
            "Restrained photojournalistic photography, warm natural lighting, "
            "Mississippi-deco / 1930s Black-American agricultural heritage where "
            "appropriate, neighborhood grocery store interiors and produce displays. "
            "Documentary feel. Never staged or generic stock photography. Composition "
            "should leave negative space for typography overlay."
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


print(f"Submitting Uncle May's deck to Gamma ({len(input_text):,} chars)...")
result = post("/generations", payload)
gen_id = result.get("generationId") or result.get("id")
print(f"Generation ID: {gen_id}")
print(f"Initial response: {json.dumps(result, indent=2)[:500]}")

if not gen_id:
    print("No generation ID returned; aborting.", file=sys.stderr)
    sys.exit(1)

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
        out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gamma-deck-result.json")
        with open(out_path, "w") as f:
            json.dump(status, f, indent=2)
        sys.exit(0)
    if s in ("failed", "error"):
        print(f"Generation failed: {json.dumps(status, indent=2)}", file=sys.stderr)
        sys.exit(1)

print("Timed out waiting for generation.", file=sys.stderr)
sys.exit(1)
