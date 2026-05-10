"""
Submit the restructured Fifth Star Funds application deck to Gamma's public
API and poll for completion. Uses the institutional pitchbook aesthetic from
the parent investor deck, with audience-specific imagery direction for the
F&F equity / impact-capital reviewer.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

CONFIG_PATH = os.path.expanduser("~/.claude/gamma-config.json")
DECK_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fifth-star-deck.md")

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
        "DESIGN BRIEF: Institutional pitchbook aesthetic, same disciplined feel "
        "as the parent investor deck for Uncle May's. The audience is Fifth Star "
        "Funds reviewers (F&F equity, Black-founder focused, mission and impact "
        "aware) plus a Polsky Center referrer. The deck must read as serious and "
        "rigorous, not as a startup pitch deck. "
        "\n\n"
        "PALETTE: Conservative palette only. Primary: deep navy (#0B2545 or "
        "similar). Accent: muted gold or warm tan (#A88A4A or similar). "
        "Background: white or ivory (#FAFAF7). Text: charcoal (#1A1A1A) or "
        "near-black. No bright or saturated colors. No gradients. No neon. "
        "\n\n"
        "TYPOGRAPHY: Classic serif for headlines and slide titles (Garamond, "
        "Times, or similar institutional serif). Clean sans-serif for body and "
        "tables (Helvetica, Arial, or similar). Generous tracking. No display "
        "fonts. No script fonts. "
        "\n\n"
        "LAYOUT: Generous white space. Tables rendered with thin gridlines and "
        "zebra striping like a pitchbook exhibit. Footer on every content slide "
        "with 'Uncle May's Produce' at left, page number at right, and "
        "'Confidential and Proprietary, Fifth Star Funds Application, May 2026' "
        "centered. "
        "\n\n"
        "IMAGERY: This is a food business. Use imagery noticeably more than the "
        "parent institutional deck. The brief explicitly calls for: close-up "
        "produce photos, proteins, customers unpacking boxes, prepared meals, "
        "ordering screenshots, delivery photos. Where the markdown contains "
        "[Slide image: ...] or [Slide visuals: ...] cues, generate imagery that "
        "matches the cue. Photorealistic, warm natural lighting, documentary "
        "feel, never staged stock photography. Composition should leave room "
        "for typography overlay. Specific recurring subjects: a Chicago bungalow "
        "doorstep with a delivered produce box; a Black farmer harvesting at a "
        "small Pembroke Illinois farm; hand-packed boxes on a counter; a build-"
        "your-own catalog screen on a phone; a Wednesday delivery van in a "
        "Chicago neighborhood. "
        "\n\n"
        "EMOTIONAL TONE: Slightly warmer than the institutional pitchbook. "
        "Reviewers care about impact, mission, and customer experience as much "
        "as they care about unit economics. The 'Why This Matters' slide should "
        "feel weighty without being sentimental. Customer-quote slides should "
        "let the quotes breathe in large type, not be crammed in among bullets. "
        "\n\n"
        "DENSITY: Tolerate higher information density than a typical Gamma "
        "presentation, this is still a pitchbook. But on slides with dense "
        "tables (Use of Funds, Unit Economics, Competitive Landscape, Growth "
        "Targets, TAM appendix), use generous internal padding, consistent "
        "column widths, and zebra striping. If a single card would render too "
        "tight, split it across two cards rather than shrinking type. Body type "
        "minimum 11pt equivalent, table type minimum 10pt. "
        "\n\n"
        "TYPOGRAPHY RULE (HARD): Do not introduce em dashes (the long dash "
        "character) anywhere in the rendered output. Use commas, colons, "
        "periods, or parentheses instead. En dashes are acceptable only inside "
        "numeric ranges. Preserve the punctuation as written in the source "
        "markdown."
    ),
    "textOptions": {
        "amount": "detailed",
        "tone": "disciplined, founder-voice, measured, mission-aware",
        "audience": "Fifth Star Funds reviewers, F&F equity, Polsky Center referrer",
        "language": "en",
    },
    "imageOptions": {
        "source": "aiGenerated",
        "style": (
            "Documentary-style photography, warm natural lighting, food-business "
            "imagery (produce, proteins, packaged boxes, customer unboxing, "
            "Chicago neighborhood delivery), Black farmer subjects in field "
            "settings where appropriate, never staged or generic stock. "
            "Composition should leave negative space for typography overlay."
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


print(f"Submitting Fifth Star deck to Gamma ({len(input_text):,} chars)...")
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
