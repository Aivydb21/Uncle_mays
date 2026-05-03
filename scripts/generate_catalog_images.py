"""Generate AI catalog photos for every active SKU and push to Airtable.

Pipeline:
  1. Read OpenAI key + Airtable PAT from ~/.claude/.
  2. Per SKU, build a portion-aware prompt (handful of asparagus, half a
     bunch of kale, etc.) and call gpt-image-1 at medium quality.
  3. Save JPEG to public/catalog/{sku}.jpg (resize to 1024 wide, 85% q).
  4. After all images succeed, PATCH each Airtable record's ImageURL to
     the eventual production URL https://unclemays.com/catalog/{sku}.jpg.

Cost: ~$0.04 per medium 1024x1024 image. 45-47 SKUs ≈ $1.80-$2. Hard cap
at $12 (env override BUDGET_USD). Skips SKUs whose JPG already exists
unless --force is passed (safe to re-run).

Usage:
  python scripts/generate_catalog_images.py            # generate missing
  python scripts/generate_catalog_images.py --force    # regen everything
  python scripts/generate_catalog_images.py --sku asparagus-green-lb,kale-tuscan-lb
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
from io import BytesIO
from pathlib import Path

import httpx
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
PUBLIC_DIR = REPO / "public" / "catalog"
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

OPENAI_CFG = Path.home() / ".claude" / "openai-config.json"
AIRTABLE_CFG = Path.home() / ".claude" / "airtable-config.json"
BASE_ID = "appm6F6H9obydzAM2"
TABLE = "Catalog"

# gpt-image-1 medium quality price per 1024x1024 image, ballpark
COST_PER_IMAGE_USD = 0.042
DEFAULT_BUDGET_USD = 12.0

PROD_URL_PREFIX = "https://unclemays.com/catalog"

# ---- Per-SKU subjects -----------------------------------------------------
# Each entry describes the subject so the prompt template can drop it in.
# `style_kind`:
#   "loose"   = loose produce, top-down on white
#   "package" = retail package (clamshell, jar, bag), 3/4 angle
#   "single"  = a single whole item or pair (chicken, daikon), 3/4 angle
SUBJECTS: dict[str, dict] = {
    # Greens
    "asparagus-green-lb":            {"style_kind":"loose",   "subject":"a small handful of about 8 to 10 fresh green asparagus spears arranged in a neat bundle, tied loosely with twine"},
    "kale-green-curly":              {"style_kind":"loose",   "subject":"half of a small bunch of fresh curly green kale leaves with stems"},
    "kale-red":                      {"style_kind":"loose",   "subject":"half of a small bunch of fresh red Russian kale leaves with reddish-purple stems"},
    "kale-tuscan-lb":                {"style_kind":"loose",   "subject":"a small handful of dark green Tuscan (lacinato) kale leaves, about 4 to 5 long flat leaves"},
    "chard-rainbow-lb":              {"style_kind":"loose",   "subject":"a small handful of rainbow Swiss chard with vivid red, yellow, and pink stems, about 4 to 5 stalks"},
    "salad-mix-5oz-clam":            {"style_kind":"package", "subject":"a clear plastic clamshell container of mixed baby greens salad, lid closed"},
    "lettuce-green-leaf-lb":         {"style_kind":"loose",   "subject":"a small head of bright green leaf lettuce with curly tender leaves"},
    "lettuce-romaine-lb":            {"style_kind":"loose",   "subject":"a small head of crisp romaine lettuce with long upright green leaves"},
    "lettuce-romaine-5oz-clam":      {"style_kind":"package", "subject":"a clear plastic clamshell container of chopped romaine lettuce, lid closed"},
    "lettuce-summer-crisp-lb":       {"style_kind":"loose",   "subject":"a small head of summer crisp lettuce with tender pale green leaves"},
    "lettuce-summer-crisp-5oz-clam": {"style_kind":"package", "subject":"a clear plastic clamshell container of summer crisp lettuce leaves, lid closed"},
    "ramps-lb":                      {"style_kind":"loose",   "subject":"a small bundle of 5 to 6 wild ramps (wild leeks) with smooth white bulbs and broad green leaves"},
    "greens-mixed-mustards-lb":      {"style_kind":"loose",   "subject":"a small handful of mixed mustard greens, about 4 to 5 large dark green leaves with white stems"},

    # Microgreens
    "microgreens-broccoli-1oz":         {"style_kind":"package", "subject":"a small clear plastic clamshell of fresh green broccoli microgreens"},
    "microgreens-confetti-radish-1oz":  {"style_kind":"package", "subject":"a small clear plastic clamshell of confetti radish microgreens with green and pink stems"},
    "microgreens-spicy-mix-1oz":        {"style_kind":"package", "subject":"a small clear plastic clamshell of spicy mix microgreens with mixed green and reddish leaves"},
    "microgreens-sunflower-1oz":        {"style_kind":"package", "subject":"a small clear plastic clamshell of sunflower microgreens with broad pale green leaves"},
    "microgreens-pea-shoots-2oz":       {"style_kind":"package", "subject":"a small clear plastic clamshell of fresh green pea shoot microgreens with curly tendrils"},
    "microgreens-purple-radish-2oz":    {"style_kind":"package", "subject":"a small clear plastic clamshell of purple radish microgreens with magenta-pink stems"},

    # Roots
    "carrots-candy-orange-lb":       {"style_kind":"loose",   "subject":"a small bunch of about 4 to 5 medium-size bright orange carrots with green tops"},
    "garlic-black-5oz-jar":          {"style_kind":"package", "subject":"a small glass jar of black garlic cloves with a plain kraft-paper label"},
    "potatoes-all-blue-10lb-bag":    {"style_kind":"loose",   "subject":"three or four whole blue-purple potatoes with deep indigo skins"},
    "potatoes-carola-seconds-lb":    {"style_kind":"loose",   "subject":"three or four whole creamy yellow Carola potatoes, slightly imperfect (a few small marks)"},
    "potatoes-white-eva-lb":         {"style_kind":"loose",   "subject":"three or four whole creamy white-skinned potatoes"},
    "radishes-alpine-lb":            {"style_kind":"loose",   "subject":"a small handful of about 8 to 10 small bright red Alpine radishes with green tops still attached"},
    "radishes-green-meat-daikon-lb": {"style_kind":"single",  "subject":"a single green meat daikon radish (about the size of a large carrot), one half cut to show the pale interior"},
    "radishes-purple-daikon-lb":     {"style_kind":"single",  "subject":"a single purple daikon radish (about the size of a large carrot), one half cut to show the magenta-pink interior"},
    "sunchokes-lb":                  {"style_kind":"loose",   "subject":"a small handful of fresh sunchokes (Jerusalem artichokes) with knobbly tan-brown skins"},
    "sweet-potatoes-lb":             {"style_kind":"single",  "subject":"one medium orange-fleshed sweet potato with smooth orange-brown skin"},
    "sweet-potatoes-smalls-lb":      {"style_kind":"loose",   "subject":"about 4 to 5 small orange-fleshed sweet potatoes"},
    "sweet-potatoes-white-fingerling-lb": {"style_kind":"loose", "subject":"a small handful of pale yellow fingerling sweet potatoes with elongated tapered shape"},

    # Pantry
    "beans-great-northern-1lb":            {"style_kind":"package", "subject":"a small clear plastic bag of dried Great Northern beans (small white oval beans), about 1 pound"},
    "beans-navy-1lb":                      {"style_kind":"package", "subject":"a small clear plastic bag of dried navy beans (small white round beans), about 1 pound"},
    "beans-organic-black-turtle-1lb":      {"style_kind":"package", "subject":"a small clear plastic bag of dried black turtle beans (shiny black beans), about 1 pound"},
    "beans-organic-black-turtle-half-lb":  {"style_kind":"package", "subject":"a small clear plastic bag of dried black turtle beans (shiny black beans), about half a pound (smaller bag)"},
    "beans-organic-kidney-1lb":            {"style_kind":"package", "subject":"a small clear plastic bag of dried red kidney beans (deep red curved beans), about 1 pound"},
    "beans-organic-pinto-1lb":             {"style_kind":"package", "subject":"a small clear plastic bag of dried pinto beans (mottled pink and brown beans), about 1 pound"},
    "beans-organic-pinto-5lb":             {"style_kind":"package", "subject":"a large clear plastic bag of dried pinto beans (mottled pink and brown beans), about 5 pounds, noticeably larger bag"},
    "beans-pink-1lb":                      {"style_kind":"package", "subject":"a small clear plastic bag of dried pink beans (pale pink curved beans), about 1 pound"},
    "beans-small-reds-1lb":                {"style_kind":"package", "subject":"a small clear plastic bag of dried small red beans (deep red small round beans), about 1 pound"},
    "beans-yellow-canary-1lb":             {"style_kind":"package", "subject":"a small clear plastic bag of dried yellow canary beans (pale yellow oval beans), about 1 pound"},

    # Specialty
    "spruce-branches-bag":           {"style_kind":"loose",   "subject":"a small bundle of fresh fragrant green spruce evergreen branches with short needles, tied with twine"},

    # Protein
    "chicken-pastured-whole-lb":     {"style_kind":"single",  "subject":"a whole raw plucked pastured chicken, dressed and oven-ready, about 4 to 5 pounds"},
    "beef-short-ribs-bone-in-lb":    {"style_kind":"package", "subject":"a one-pound package of raw bone-in beef short ribs in clear vacuum-sealed plastic, deep red marbled meat"},
    "beef-short-ribs-boneless-lb":   {"style_kind":"package", "subject":"a one-pound package of raw boneless beef short ribs in clear vacuum-sealed plastic, deep red meat"},
    "lamb-chops-lb":                 {"style_kind":"loose",   "subject":"two raw lamb rib chops with bone-in, deep pink meat with white fat trim"},
    "eggs-farm-fresh-dozen":         {"style_kind":"package", "subject":"a dozen brown farm-fresh eggs in an open recyclable paper egg carton"},
}


STYLE_TEMPLATES = {
    "loose":   "Studio product photograph of {subject}. Clean white seamless background. Soft natural studio lighting. Top-down view (flat lay). Sharp focus, vibrant fresh appearance. No text, no labels, no people, no hands. Hyper-realistic grocery e-commerce product photography style.",
    "package": "Studio product photograph of {subject}. Clean white seamless background. Soft natural studio lighting. Three-quarter angle product shot. Sharp focus, clean composition. No text, no readable labels, no people, no hands. Hyper-realistic grocery e-commerce product photography style.",
    "single":  "Studio product photograph of {subject}. Clean white seamless background. Soft natural studio lighting. Three-quarter angle. Sharp focus, vibrant fresh appearance. No text, no labels, no people, no hands. Hyper-realistic grocery e-commerce product photography style.",
}


def build_prompt(sku: str) -> str | None:
    spec = SUBJECTS.get(sku)
    if not spec:
        return None
    tmpl = STYLE_TEMPLATES[spec["style_kind"]]
    return tmpl.format(subject=spec["subject"])


def load_openai_key() -> str:
    cfg = json.loads(OPENAI_CFG.read_text())
    return cfg["api_key"]


def load_airtable_pat() -> str:
    cfg = json.loads(AIRTABLE_CFG.read_text())
    return cfg["api_key"]


def list_active_skus(pat: str) -> dict[str, str]:
    """Return SKU -> Airtable record id for every Active row."""
    h = {"Authorization": f"Bearer {pat}"}
    out: dict[str, str] = {}
    offset: str | None = None
    with httpx.Client(headers=h, timeout=30) as c:
        while True:
            params: dict[str, str] = {"pageSize": "100", "fields[]": "SKU", "filterByFormula": "Active=TRUE()"}
            if offset:
                params["offset"] = offset
            r = c.get(f"https://api.airtable.com/v0/{BASE_ID}/{TABLE}", params=params)
            r.raise_for_status()
            d = r.json()
            for rec in d.get("records", []):
                sku = (rec.get("fields", {}).get("SKU") or "").strip()
                if sku:
                    out[sku] = rec["id"]
            offset = d.get("offset")
            if not offset:
                break
    return out


def gen_image(client: httpx.Client, prompt: str) -> bytes:
    """Call gpt-image-1, return PNG bytes."""
    body = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "quality": "medium",
    }
    r = client.post("https://api.openai.com/v1/images/generations", json=body, timeout=120)
    if r.status_code >= 300:
        raise RuntimeError(f"OpenAI {r.status_code}: {r.text[:500]}")
    data = r.json()
    item = data["data"][0]
    if "b64_json" in item:
        return base64.b64decode(item["b64_json"])
    if "url" in item:
        ir = client.get(item["url"], timeout=60)
        ir.raise_for_status()
        return ir.content
    raise RuntimeError(f"Unknown response shape: {list(item.keys())}")


def save_jpeg(png_bytes: bytes, dest: Path) -> int:
    img = Image.open(BytesIO(png_bytes)).convert("RGB")
    img.save(dest, format="JPEG", quality=85, optimize=True)
    return dest.stat().st_size


def patch_airtable_image_urls(pat: str, sku_to_id: dict[str, str], skus: list[str]) -> None:
    h = {"Authorization": f"Bearer {pat}", "Content-Type": "application/json"}
    queue = [
        {"id": sku_to_id[s], "fields": {"ImageURL": f"{PROD_URL_PREFIX}/{s}.jpg"}}
        for s in skus
        if s in sku_to_id
    ]
    print(f"  · {len(queue)} ImageURL patches queued")
    with httpx.Client(headers=h, timeout=30) as c:
        for i in range(0, len(queue), 10):
            batch = queue[i : i + 10]
            r = c.patch(f"https://api.airtable.com/v0/{BASE_ID}/{TABLE}", json={"records": batch})
            if r.status_code >= 300:
                sys.exit(f"PATCH batch {i//10 + 1} failed: {r.status_code} {r.text[:300]}")
            print(f"  · Batch {i//10 + 1}: PATCHED {len(batch)} records")
            time.sleep(0.25)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="regenerate even if jpg exists")
    ap.add_argument("--sku", default="", help="comma-separated SKUs to process (overrides default 'all active')")
    ap.add_argument("--budget", type=float, default=DEFAULT_BUDGET_USD)
    ap.add_argument("--no-airtable", action="store_true", help="skip Airtable URL patch")
    args = ap.parse_args()

    openai_key = load_openai_key()
    airtable_pat = load_airtable_pat()

    print("Loading active SKUs from Airtable...")
    sku_to_id = list_active_skus(airtable_pat)
    print(f"  · {len(sku_to_id)} active SKUs")

    if args.sku:
        target = [s.strip() for s in args.sku.split(",") if s.strip()]
    else:
        target = list(sku_to_id.keys())

    spent = 0.0
    successes: list[str] = []
    failures: list[tuple[str, str]] = []

    h = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
    with httpx.Client(headers=h) as c:
        for i, sku in enumerate(target, 1):
            dest = PUBLIC_DIR / f"{sku}.jpg"
            if dest.exists() and not args.force:
                print(f"[{i}/{len(target)}] SKIP (exists): {sku}")
                successes.append(sku)
                continue
            prompt = build_prompt(sku)
            if not prompt:
                print(f"[{i}/{len(target)}] SKIP (no prompt mapping): {sku}")
                continue
            if spent + COST_PER_IMAGE_USD > args.budget:
                print(f"BUDGET HIT (${spent:.2f} of ${args.budget:.2f}). Stopping.")
                break
            t0 = time.time()
            try:
                png = gen_image(c, prompt)
                size = save_jpeg(png, dest)
                spent += COST_PER_IMAGE_USD
                successes.append(sku)
                dt = time.time() - t0
                print(f"[{i}/{len(target)}] OK   {sku:42}  {size//1024}KB  {dt:5.1f}s  (cum ${spent:.2f})")
            except Exception as e:
                failures.append((sku, str(e)[:200]))
                print(f"[{i}/{len(target)}] FAIL {sku}: {e}")

    print()
    print(f"Generated {len(successes)} images, {len(failures)} failures, est cost ${spent:.2f}")
    if failures:
        print("Failures:")
        for sku, err in failures:
            print(f"  {sku}: {err}")

    if successes and not args.no_airtable:
        print("Patching Airtable ImageURL...")
        patch_airtable_image_urls(airtable_pat, sku_to_id, successes)

    print("Done.")


if __name__ == "__main__":
    main()
