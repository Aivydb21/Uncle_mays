"""Apply the FINAL: Single-Unit Pricing Table from 2026-05-03.

Operations:
  1. PATCH 30+ existing SKUs with new Unit / UnitLabel / DefaultAddQty /
     PriceOverrideCents / Active values.
  2. POST 2 new SKUs (Spruce Branches, Black Turtle Beans 1/2 lb).
  3. Reactivate carola + white-eva potatoes that were briefly disabled.

Idempotent: safe to re-run; PATCH is by record id, POST checks for SKU
collisions before creating.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import httpx

CONFIG_PATH = Path.home() / ".claude" / "airtable-config.json"
BASE_ID = "appm6F6H9obydzAM2"
TABLE = "Catalog"
API = "https://api.airtable.com/v0"


def load_pat() -> str:
    return json.loads(CONFIG_PATH.read_text())["api_key"]


# ---- Updates to existing SKUs --------------------------------------------
# Each entry: SKU -> dict of fields to patch.
UPDATES: dict[str, dict] = {
    # Greens
    "asparagus-green-lb":           {"Unit":"lb","UnitLabel":"1/4 lb (handful)","DefaultAddQty":1,"PriceOverrideCents":250},
    "kale-green-curly":             {"Unit":"bunch","UnitLabel":"1/2 bunch","DefaultAddQty":1,"PriceOverrideCents":400},
    "kale-red":                     {"Unit":"bunch","UnitLabel":"1/2 bunch","DefaultAddQty":1,"PriceOverrideCents":400},
    "kale-tuscan-lb":               {"Unit":"bunch","UnitLabel":"0.3 lb","DefaultAddQty":1,"PriceOverrideCents":300},
    "chard-rainbow-lb":             {"Unit":"bunch","UnitLabel":"0.3 lb","DefaultAddQty":1,"PriceOverrideCents":300},
    "salad-mix-5oz-clam":           {"Unit":"each","UnitLabel":"5 oz clamshell","DefaultAddQty":1,"PriceOverrideCents":600},
    "lettuce-green-leaf-lb":        {"Unit":"each","UnitLabel":"5 oz","DefaultAddQty":1,"PriceOverrideCents":250},
    "lettuce-romaine-lb":           {"Unit":"each","UnitLabel":"5 oz","DefaultAddQty":1,"PriceOverrideCents":300},
    "lettuce-romaine-5oz-clam":     {"Unit":"each","UnitLabel":"5 oz clamshell","DefaultAddQty":1},  # keep $5
    "lettuce-summer-crisp-lb":      {"Unit":"each","UnitLabel":"5 oz","DefaultAddQty":1,"PriceOverrideCents":300},
    "lettuce-summer-crisp-5oz-clam":{"Unit":"each","UnitLabel":"5 oz clamshell","DefaultAddQty":1},  # keep $7.50
    "ramps-lb":                     {"Unit":"lb","UnitLabel":"0.15 lb","DefaultAddQty":1,"PriceOverrideCents":300},
    "greens-mixed-mustards-lb":     {"Unit":"lb","UnitLabel":"1/4 lb","DefaultAddQty":1,"PriceOverrideCents":350},

    # Microgreens (lower prices; convert 2oz packs to 1oz)
    "microgreens-broccoli-1oz":         {"PriceOverrideCents":575},
    "microgreens-confetti-radish-1oz":  {"PriceOverrideCents":575},
    "microgreens-spicy-mix-1oz":        {"PriceOverrideCents":675},
    "microgreens-sunflower-1oz":        {"PriceOverrideCents":675},
    "microgreens-pea-shoots-2oz":       {"Name":"Pea Shoot Microgreens (1 oz)","UnitLabel":"1 oz","PriceOverrideCents":500},
    "microgreens-purple-radish-2oz":    {"Name":"Purple Radish Microgreens (1 oz)","UnitLabel":"1 oz","PriceOverrideCents":500},

    # Roots
    "carrots-candy-orange-lb":      {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":150},
    "radishes-alpine-lb":           {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":225},
    "radishes-green-meat-daikon-lb":{"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":225},
    "radishes-purple-daikon-lb":    {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":225},
    "sunchokes-lb":                 {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":250},
    "sweet-potatoes-lb":            {"Unit":"each","UnitLabel":"1 potato (~0.5 lb)","DefaultAddQty":1,"PriceOverrideCents":250},
    "sweet-potatoes-smalls-lb":     {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":300},
    "sweet-potatoes-white-fingerling-lb": {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":275},
    "potatoes-white-eva-lb":        {"Active":True,"Unit":"lb","UnitLabel":"1 lb","DefaultAddQty":1,"PriceOverrideCents":450},
    "potatoes-carola-seconds-lb":   {"Active":True,"Unit":"lb","UnitLabel":"1 lb","DefaultAddQty":1,"PriceOverrideCents":325},
    # Break the 10-lb bag down to per-lb pricing
    "potatoes-all-blue-10lb-bag":   {"Name":"All Blue Potatoes","Unit":"lb","UnitLabel":"1 lb","DefaultAddQty":1,"PriceOverrideCents":500},

    # Specialty
    "garlic-black-5oz-jar":         {"Unit":"each","UnitLabel":"5 oz jar","DefaultAddQty":1,"PriceOverrideCents":875},

    # Beans (drop pricing into the $6-6.65 band)
    "beans-great-northern-1lb":     {"PriceOverrideCents":665},
    "beans-navy-1lb":               {"PriceOverrideCents":665},
    "beans-organic-black-turtle-1lb":{"PriceOverrideCents":600},
    "beans-organic-kidney-1lb":     {"PriceOverrideCents":650},
    "beans-organic-pinto-1lb":      {"PriceOverrideCents":600},
    "beans-organic-pinto-5lb":      {"PriceOverrideCents":1979},
    "beans-pink-1lb":               {"PriceOverrideCents":665},
    "beans-small-reds-1lb":         {"PriceOverrideCents":600},
    "beans-yellow-canary-1lb":      {"PriceOverrideCents":665},

    # Protein
    "chicken-pastured-whole-lb":    {"Unit":"each","UnitLabel":"whole bird (~4-5 lb, est.)","DefaultAddQty":1,"PriceOverrideCents":3200},
    "beef-short-ribs-bone-in-lb":   {"Unit":"lb","UnitLabel":"1 lb pack","DefaultAddQty":1,"PriceOverrideCents":850},
    "beef-short-ribs-boneless-lb":  {"Unit":"lb","UnitLabel":"1 lb pack","DefaultAddQty":1,"PriceOverrideCents":1250},
    "lamb-chops-lb":                {"Unit":"lb","UnitLabel":"0.5 lb","DefaultAddQty":1,"PriceOverrideCents":1000},
    # eggs unchanged
}


# ---- New SKUs to create --------------------------------------------------
NEW_SKUS: list[dict] = [
    {
        "SKU":"spruce-branches-bag",
        "Name":"Spruce Branches",
        "Category":"Pantry",
        "Unit":"each",
        "UnitLabel":"1 bag",
        "CostCents":800,
        "PriceOverrideCents":1000,
        "DefaultAddQty":1,
        "Active":True,
        "SortOrder":590,
        "TaxCategory":"grocery",
    },
    {
        "SKU":"beans-organic-black-turtle-half-lb",
        "Name":"Organic Black Turtle Beans (1/2 lb)",
        "Category":"Pantry",
        "Unit":"each",
        "UnitLabel":"1/2 lb bag",
        "CostCents":300,
        "PriceOverrideCents":350,
        "DefaultAddQty":1,
        "Active":True,
        "SortOrder":515,
        "TaxCategory":"grocery",
    },
]


def list_records_by_sku(client: httpx.Client) -> dict[str, str]:
    sku_to_id: dict[str, str] = {}
    offset: str | None = None
    while True:
        params: dict[str, str] = {"pageSize":"100","fields[]":"SKU"}
        if offset: params["offset"] = offset
        r = client.get(f"{API}/{BASE_ID}/{TABLE}", params=params)
        r.raise_for_status()
        d = r.json()
        for rec in d.get("records", []):
            s = (rec.get("fields",{}).get("SKU") or "").strip()
            if s: sku_to_id[s] = rec["id"]
        offset = d.get("offset")
        if not offset: break
    return sku_to_id


def patch_records(client: httpx.Client, updates: dict[str, dict], sku_to_id: dict[str, str]) -> None:
    queue: list[dict] = []
    for sku, fields in updates.items():
        rec_id = sku_to_id.get(sku)
        if not rec_id:
            print(f"  · SKIP (sku not in table): {sku}")
            continue
        queue.append({"id": rec_id, "fields": fields})
    print(f"  · {len(queue)} record updates queued")
    for i in range(0, len(queue), 10):
        batch = queue[i:i+10]
        r = client.patch(f"{API}/{BASE_ID}/{TABLE}", json={"records": batch})
        if r.status_code >= 300:
            sys.exit(f"Batch {i//10 + 1} failed: {r.status_code} {r.text[:500]}")
        print(f"  · Batch {i//10 + 1}: PATCHED {len(batch)} records")
        time.sleep(0.25)


def create_records(client: httpx.Client, recs: list[dict], existing: dict[str, str]) -> None:
    to_create = [r for r in recs if r["SKU"] not in existing]
    if not to_create:
        print("  · No new SKUs to create (all already exist)")
        return
    body = {"records": [{"fields": r} for r in to_create]}
    r = client.post(f"{API}/{BASE_ID}/{TABLE}", json=body)
    if r.status_code >= 300:
        sys.exit(f"Create failed: {r.status_code} {r.text[:500]}")
    print(f"  · Created {len(to_create)} new SKUs: {[r['SKU'] for r in to_create]}")


def main() -> None:
    pat = load_pat()
    h = {"Authorization": f"Bearer {pat}", "Content-Type":"application/json"}
    with httpx.Client(headers=h, timeout=30.0) as c:
        print("Loading existing SKUs...")
        sku_to_id = list_records_by_sku(c)
        print(f"  · {len(sku_to_id)} SKUs in table")

        print("Step 1: PATCH existing SKUs")
        patch_records(c, UPDATES, sku_to_id)

        print("Step 2: CREATE new SKUs")
        create_records(c, NEW_SKUS, sku_to_id)

    print("Done.")


if __name__ == "__main__":
    main()
