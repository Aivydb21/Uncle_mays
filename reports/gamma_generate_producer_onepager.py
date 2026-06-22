"""Generate the Potlikker producer-facing one-pager in Gamma (single-page document).

Matches the house style used for the investor one-pager: textMode preserve
(protects figures), single card via cardSplit inputTextBreaks, noImages (add
photos in the editor), conservative navy/ivory institutional palette.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CONFIG = os.path.expanduser("~/.claude/gamma-config.json")
SRC = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "investor-outreach", "materials", "producer-one-pager-copy-2026-06-22.md",
)

with open(CONFIG) as f:
    cfg = json.load(f)
API_KEY = cfg["api_key"]
BASE = cfg["base_url"].rstrip("/")

with open(SRC, encoding="utf-8") as f:
    input_text = f.read()

THEME_PROMPT = (
    "Single-page partnership one-pager, same house style as the Uncle May's "
    "investor one-pager. Conservative institutional palette: deep navy headers, "
    "ivory background, soft sage-green callout boxes for producer-benefit points, "
    "soft purple callout box for the 'Why It Fits Potlikker' note. Sans-serif "
    "headers, serif body. Small italic uppercase category pill above the title. "
    "Slim 1px horizontal divider directly under the title. No gradients, no "
    "shadows, restrained color. Footer in 9pt muted gray, right-aligned: "
    "\"Uncle May's Produce. Confidential. Prepared for Potlikker Capital. "
    "June 2026.\" Register: partnership and mission, warm and credible, not a "
    "sales pitch. Keep everything on a single page."
)

payload = {
    "inputText": input_text,
    "textMode": "preserve",
    "format": "document",
    "cardSplit": "inputTextBreaks",
    "additionalInstructions": THEME_PROMPT,
    "imageOptions": {"source": "noImages"},
    "exportAs": "pdf",
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
        return e.code, {"error_body": e.read().decode("utf-8", errors="replace")}


print(f"Source: {SRC}  ({len(input_text):,} chars)")
status, body = http("POST", "/generations", payload)
print(f"POST /generations -> {status}: {json.dumps(body)[:600]}")

gen_id = body.get("generationId") or body.get("id")
if not gen_id:
    print("[ERROR] no generationId")
    sys.exit(1)

print(f"Polling /generations/{gen_id} ...")
deadline = time.time() + 360
while time.time() < deadline:
    status, body = http("GET", f"/generations/{gen_id}")
    state = body.get("status") or "unknown"
    print(f"  status={status} state={state}")
    if state in ("completed", "succeeded", "done"):
        print("\n=== COMPLETED ===")
        print(json.dumps(body, indent=2))
        break
    if state in ("failed", "error"):
        print("\n=== FAILED ===")
        print(json.dumps(body, indent=2))
        sys.exit(1)
    time.sleep(10)
else:
    print("[TIMEOUT]")
    sys.exit(1)
