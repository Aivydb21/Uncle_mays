"""Generate AI plated-dish hero images for the UNC-1187 dish-poll campaign.

Five plated finished dishes, square format, ready for IG/FB carousel post.
Saves to public/social/2026-05-18/dish-{N}-{slug}.jpg.

Pattern mirrors scripts/generate_catalog_images.py (gpt-image-1, medium
quality, ~$0.04/image, ~$0.21 total for 5 images). Uses the same
~/.claude/openai-config.json key.

Run: python scripts/generate_dish_poll_images.py
     python scripts/generate_dish_poll_images.py --force
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
import time
from io import BytesIO
from pathlib import Path

import httpx
from PIL import Image

REPO = Path(__file__).resolve().parents[1]
OUT_DIR = REPO / "public" / "social" / "2026-05-18"
OUT_DIR.mkdir(parents=True, exist_ok=True)

OPENAI_CFG = Path.home() / ".claude" / "openai-config.json"

COST_PER_IMAGE_USD = 0.042
DEFAULT_BUDGET_USD = 2.0


DISHES: list[dict] = [
    {
        "n": 1,
        "slug": "short-ribs-sweet-potato-mash",
        "title": "Smothered Short Ribs over Sweet Potato Mash",
        "prompt": (
            "Top-down food photograph of a single rustic dinner plate of smothered "
            "braised beef short ribs in a deep dark onion gravy, plated over a "
            "swirl of bright orange garlic-smashed sweet potato mash, garnished "
            "with a few roasted candy orange carrots and a small sprig of fresh "
            "thyme. Warm natural window light. White ceramic plate on a dark "
            "weathered wood table with a brown linen napkin in the corner. "
            "Hyper-realistic editorial food photography, shallow depth of field, "
            "rich saturated colors, no text, no people, no hands."
        ),
    },
    {
        "n": 2,
        "slug": "pembroke-greens-and-beans",
        "title": "Pembroke Greens & Beans (vegan)",
        "prompt": (
            "Top-down food photograph of a rustic ceramic bowl of slow-cooked "
            "Tuscan kale leaves over creamy stewed pinto beans in their broth, "
            "topped with a few pickled orange carrot ribbons and a drizzle of "
            "olive oil. Warm natural window light. Deep teal stoneware bowl on a "
            "dark weathered wood table, a wooden spoon resting beside the bowl. "
            "Hyper-realistic editorial food photography, shallow depth of field, "
            "rich greens and creamy beans, no text, no people, no hands."
        ),
    },
    {
        "n": 3,
        "slug": "black-bean-sweet-potato-chili",
        "title": "Black Bean & Sweet Potato Chili",
        "prompt": (
            "Top-down food photograph of a single bowl of hearty black bean and "
            "charred sweet potato chili, with visible cubes of roasted orange "
            "sweet potato, shiny black turtle beans, and slivers of candy orange "
            "carrot in a deep red-brown broth, garnished with chopped cilantro "
            "and a small wedge of lime. Warm natural window light. Cream-colored "
            "enamel bowl on a dark weathered wood table, a folded brown linen "
            "napkin to one side. Hyper-realistic editorial food photography, "
            "shallow depth of field, no text, no people, no hands."
        ),
    },
    {
        "n": 4,
        "slug": "lamb-chops-pea-shoot-salad",
        "title": "Lamb Chops with Pea-Shoot Salad",
        "prompt": (
            "Top-down food photograph of two pan-seared bone-in lamb rib chops "
            "with a beautifully crusted seared exterior and pink medium-rare "
            "interior, plated alongside a bright fresh pea-shoot salad with "
            "purple radish microgreens and a few honey-roasted candy orange "
            "carrots. Small dollop of mint-yogurt sauce on the plate. Warm "
            "natural window light. White ceramic plate on a dark weathered wood "
            "table. Hyper-realistic editorial food photography, shallow depth of "
            "field, no text, no people, no hands."
        ),
    },
    {
        "n": 5,
        "slug": "one-pan-chicken-kale-sweet-potato",
        "title": "One-Pan Chicken, Kale & Sweet Potato",
        "prompt": (
            "Top-down food photograph of a rustic cast-iron skillet filled with "
            "golden-skinned roasted bone-in chicken thighs nestled over cubes of "
            "roasted orange sweet potato and wilted dark green Tuscan kale, with "
            "a few candy orange carrots tucked among the chicken. Pan juices "
            "visible in the bottom of the skillet, fresh thyme sprigs on top. "
            "Warm natural window light. Black cast-iron skillet on a dark "
            "weathered wood table, a small linen towel folded beside it. "
            "Hyper-realistic editorial food photography, shallow depth of field, "
            "no text, no people, no hands."
        ),
    },
]


def load_openai_key() -> str:
    cfg = json.loads(OPENAI_CFG.read_text())
    return cfg["api_key"]


def gen_image(client: httpx.Client, prompt: str) -> bytes:
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
    img.save(dest, format="JPEG", quality=88, optimize=True)
    return dest.stat().st_size


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="regenerate even if jpg exists")
    ap.add_argument("--budget", type=float, default=DEFAULT_BUDGET_USD)
    args = ap.parse_args()

    key = load_openai_key()
    spent = 0.0
    successes: list[str] = []
    failures: list[tuple[str, str]] = []

    h = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    with httpx.Client(headers=h) as c:
        for d in DISHES:
            slug = d["slug"]
            dest = OUT_DIR / f"dish-{d['n']}-{slug}.jpg"
            if dest.exists() and not args.force:
                print(f"SKIP (exists): {dest.name}")
                successes.append(slug)
                continue
            if spent + COST_PER_IMAGE_USD > args.budget:
                print(f"BUDGET HIT (${spent:.2f} of ${args.budget:.2f}). Stopping.")
                break
            t0 = time.time()
            try:
                png = gen_image(c, d["prompt"])
                size = save_jpeg(png, dest)
                spent += COST_PER_IMAGE_USD
                dt = time.time() - t0
                successes.append(slug)
                print(f"OK   {dest.name:55}  {size//1024}KB  {dt:5.1f}s  (cum ${spent:.2f})")
            except Exception as e:
                failures.append((slug, str(e)[:300]))
                print(f"FAIL {slug}: {e}")

    print()
    print(f"Generated {len(successes)} images, {len(failures)} failures, est cost ${spent:.2f}")
    if failures:
        for slug, err in failures:
            print(f"  {slug}: {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
