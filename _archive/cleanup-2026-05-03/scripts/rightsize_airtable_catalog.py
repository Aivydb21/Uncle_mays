"""Right-size the Catalog table per notes/catalog-right-sizing-2026-05-03.md.

Steps (idempotent):
  1. Add new single-select options to Unit (head, pair, bird, pack, jar, bag).
  2. Add three new fields if missing: UnitLabel (text), DefaultAddQty (number),
     PriceOverrideCents (number).
  3. PATCH each SKU with its new Unit / UnitLabel / DefaultAddQty /
     PriceOverrideCents per the research doc.

Wholesale CostCents stays untouched — that's supplier wholesale per their
unit and we still want it for margin reporting. The customer-facing price
is now driven by PriceOverrideCents (when set) per src/lib/catalog/airtable.ts.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import httpx

CONFIG_PATH = Path.home() / ".claude" / "airtable-config.json"
BASE_ID = "appm6F6H9obydzAM2"
TABLE_NAME = "Catalog"
API = "https://api.airtable.com/v0"


def load_pat() -> str:
    cfg = json.loads(CONFIG_PATH.read_text())
    return cfg["api_key"]


# ---------------------------------------------------------------------------
# Right-sized SKU updates
# ---------------------------------------------------------------------------
# Each entry is keyed by SKU. Fields not specified are left untouched.
# Unit values must be one of the allowed single-select choices (extended
# below). PriceOverrideCents = customer-facing price for one displayUnit
# (i.e. the per-step price). DefaultAddQty defaults to 1 when omitted.
#
# UPDATES intentionally omits SKUs that don't change (microgreens packs,
# beans, jars, packaged lettuce clamshells, eggs, all-blue 10lb bag).

UPDATES: list[dict] = [
    # ---- Greens ----
    {"SKU": "asparagus-green-lb",            "Unit": "lb",    "UnitLabel": "1/2 lb",       "DefaultAddQty": 1, "PriceOverrideCents": 469},
    # kale-green-curly already bunch @ $10 — no change
    # kale-red             already bunch @ $10 — no change
    {"SKU": "kale-tuscan-lb",                "Unit": "bunch", "UnitLabel": None,           "DefaultAddQty": 1, "PriceOverrideCents": 500},
    {"SKU": "chard-rainbow-lb",              "Unit": "bunch", "UnitLabel": None,           "DefaultAddQty": 1, "PriceOverrideCents": 750},
    # salad-mix-5oz-clam   packaged — no change
    {"SKU": "lettuce-green-leaf-lb",         "Unit": "each",  "UnitLabel": "head",         "DefaultAddQty": 1, "PriceOverrideCents": 565},
    {"SKU": "lettuce-romaine-lb",            "Unit": "each",  "UnitLabel": "head",         "DefaultAddQty": 1, "PriceOverrideCents": 1000},
    # lettuce-romaine-5oz-clam packaged — no change
    {"SKU": "lettuce-summer-crisp-lb",       "Unit": "each",  "UnitLabel": "head",         "DefaultAddQty": 1, "PriceOverrideCents": 1000},
    # lettuce-summer-crisp-5oz-clam packaged — no change
    {"SKU": "ramps-lb",                      "Unit": "lb",    "UnitLabel": "1/4 lb",       "DefaultAddQty": 1, "PriceOverrideCents": 438},
    {"SKU": "greens-mixed-mustards-lb",      "Unit": "bunch", "UnitLabel": None,           "DefaultAddQty": 1, "PriceOverrideCents": 1125},

    # ---- Roots ----
    # carrots-candy-orange-lb keep per-lb @ $3.13
    # garlic-black-5oz-jar    packaged — set unit jar for clarity
    {"SKU": "garlic-black-5oz-jar",          "Unit": "each",  "UnitLabel": "5 oz jar",     "DefaultAddQty": 1, "PriceOverrideCents": 1094},
    {"SKU": "potatoes-all-blue-10lb-bag",    "Unit": "each",  "UnitLabel": "10 lb bag",    "DefaultAddQty": 1, "PriceOverrideCents": 3125},
    {"SKU": "potatoes-carola-seconds-lb",    "Unit": "lb",    "UnitLabel": None,           "DefaultAddQty": 2, "PriceOverrideCents": 406},
    {"SKU": "potatoes-white-eva-lb",         "Unit": "lb",    "UnitLabel": None,           "DefaultAddQty": 2, "PriceOverrideCents": 563},
    {"SKU": "radishes-alpine-lb",            "Unit": "bunch", "UnitLabel": None,           "DefaultAddQty": 1, "PriceOverrideCents": 250},
    {"SKU": "radishes-green-meat-daikon-lb", "Unit": "each",  "UnitLabel": "each (~1 lb)", "DefaultAddQty": 1, "PriceOverrideCents": 500},
    {"SKU": "radishes-purple-daikon-lb",     "Unit": "each",  "UnitLabel": "each (~1 lb)", "DefaultAddQty": 1, "PriceOverrideCents": 500},
    {"SKU": "sunchokes-lb",                  "Unit": "lb",    "UnitLabel": "1/2 lb",       "DefaultAddQty": 1, "PriceOverrideCents": 282},
    {"SKU": "sweet-potatoes-lb",             "Unit": "each",  "UnitLabel": "each (~1/2 lb)", "DefaultAddQty": 2, "PriceOverrideCents": 282},
    {"SKU": "sweet-potatoes-smalls-lb",      "Unit": "each",  "UnitLabel": "each (~1/4 lb)", "DefaultAddQty": 4, "PriceOverrideCents": 188},
    {"SKU": "sweet-potatoes-white-fingerling-lb", "Unit": "lb", "UnitLabel": "1/2 lb",     "DefaultAddQty": 2, "PriceOverrideCents": 313},

    # ---- Pantry / Beans ----
    # All beans stay as-is (1 lb bag / 5 lb bag is correct sell unit).
    # Add UnitLabel for clarity even though Unit stays "each".
    {"SKU": "beans-great-northern-1lb",         "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-navy-1lb",                   "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-organic-black-turtle-1lb",   "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-organic-kidney-1lb",         "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-organic-pinto-1lb",          "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-organic-pinto-5lb",          "UnitLabel": "5 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-pink-1lb",                   "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-small-reds-1lb",             "UnitLabel": "1 lb bag", "DefaultAddQty": 1},
    {"SKU": "beans-yellow-canary-1lb",          "UnitLabel": "1 lb bag", "DefaultAddQty": 1},

    # ---- Protein ----
    {"SKU": "chicken-pastured-whole-lb",     "Unit": "each", "UnitLabel": "whole bird (~4.5 lb)", "DefaultAddQty": 1, "PriceOverrideCents": 3938},
    {"SKU": "beef-short-ribs-bone-in-lb",    "Unit": "each", "UnitLabel": "2.5 lb pack",          "DefaultAddQty": 1, "PriceOverrideCents": 2625},
    {"SKU": "beef-short-ribs-boneless-lb",   "Unit": "each", "UnitLabel": "2 lb pack",            "DefaultAddQty": 1, "PriceOverrideCents": 3125},
    {"SKU": "lamb-chops-lb",                 "Unit": "each", "UnitLabel": "pair (2 chops)",       "DefaultAddQty": 1, "PriceOverrideCents": 1188},
    # eggs-farm-fresh-dozen — keep dozen @ $5.99
]


# ---------------------------------------------------------------------------
# Airtable Meta API helpers
# ---------------------------------------------------------------------------

def _meta_url(*parts: str) -> str:
    return f"https://api.airtable.com/v0/meta/bases/{BASE_ID}/" + "/".join(parts)


def get_table(client: httpx.Client) -> dict:
    """Find the Catalog table in the base schema."""
    r = client.get(_meta_url("tables"))
    r.raise_for_status()
    for t in r.json().get("tables", []):
        if t.get("name") == TABLE_NAME:
            return t
    sys.exit(f"Table {TABLE_NAME!r} not found in base {BASE_ID}")


def ensure_unit_options(client: httpx.Client, table: dict) -> None:
    """Make sure Unit single-select includes head/pair/bird/pack/jar/bag."""
    unit_field = next((f for f in table["fields"] if f["name"] == "Unit"), None)
    if not unit_field:
        sys.exit("Unit field missing from Catalog table")
    existing = {c["name"] for c in unit_field["options"]["choices"]}
    needed = ["head", "pair", "bird", "pack", "jar", "bag"]
    to_add = [n for n in needed if n not in existing]
    if not to_add:
        print(f"  · Unit options already complete ({sorted(existing)})")
        return
    # Existing choices need their {id, name, color} preserved; new ones go
    # in by name only. Airtable rejects requests that drop existing IDs.
    keep = [
        {k: c[k] for k in ("id", "name", "color") if k in c}
        for c in unit_field["options"]["choices"]
    ]
    new_choices = keep + [{"name": n} for n in to_add]
    body = {"options": {"choices": new_choices}}
    r = client.patch(_meta_url("tables", table["id"], "fields", unit_field["id"]), json=body)
    if r.status_code >= 300:
        sys.exit(f"Failed to extend Unit options: {r.status_code} {r.text}")
    print(f"  · Added Unit options: {to_add}")


def ensure_field(client: httpx.Client, table: dict, name: str, type_: str, options: dict | None = None) -> None:
    if any(f["name"] == name for f in table["fields"]):
        print(f"  · Field {name!r} already exists")
        return
    body = {"name": name, "type": type_}
    if options:
        body["options"] = options
    r = client.post(_meta_url("tables", table["id"], "fields"), json=body)
    if r.status_code >= 300:
        sys.exit(f"Failed to create field {name!r}: {r.status_code} {r.text}")
    print(f"  · Created field {name!r} ({type_})")


def list_records_by_sku(client: httpx.Client) -> dict[str, str]:
    """Return SKU -> Airtable record ID for every row in Catalog."""
    sku_to_id: dict[str, str] = {}
    offset: str | None = None
    while True:
        params: dict[str, str] = {"pageSize": "100", "fields[]": "SKU"}
        if offset:
            params["offset"] = offset
        r = client.get(f"{API}/{BASE_ID}/{TABLE_NAME}", params=params)
        r.raise_for_status()
        data = r.json()
        for rec in data.get("records", []):
            sku = (rec.get("fields", {}).get("SKU") or "").strip()
            if sku:
                sku_to_id[sku] = rec["id"]
        offset = data.get("offset")
        if not offset:
            break
    return sku_to_id


def patch_records(client: httpx.Client, updates: list[dict], sku_to_id: dict[str, str]) -> None:
    """PATCH up to 10 records per request per Airtable batch limit."""
    queue: list[dict] = []
    for u in updates:
        sku = u["SKU"]
        rec_id = sku_to_id.get(sku)
        if not rec_id:
            print(f"  · SKIP (sku not in table): {sku}")
            continue
        fields: dict = {}
        for k, v in u.items():
            if k == "SKU":
                continue
            fields[k] = v
        queue.append({"id": rec_id, "fields": fields})

    print(f"  · {len(queue)} record updates queued")
    for i in range(0, len(queue), 10):
        batch = queue[i : i + 10]
        body = {"records": batch}
        r = client.patch(f"{API}/{BASE_ID}/{TABLE_NAME}", json=body)
        if r.status_code >= 300:
            sys.exit(f"Batch {i//10 + 1} failed: {r.status_code} {r.text}")
        print(f"  · Batch {i//10 + 1}: PATCHED {len(batch)} records")
        time.sleep(0.25)


def main() -> None:
    pat = load_pat()
    headers = {"Authorization": f"Bearer {pat}", "Content-Type": "application/json"}
    with httpx.Client(headers=headers, timeout=30.0) as client:
        print("Loading Catalog table schema...")
        table = get_table(client)

        print("Step 1: ensuring new fields exist")
        ensure_field(client, table, "UnitLabel", "singleLineText")
        table = get_table(client)
        ensure_field(client, table, "DefaultAddQty", "number", {"precision": 0})
        table = get_table(client)
        ensure_field(client, table, "PriceOverrideCents", "number", {"precision": 0})

        print("Step 2: loading existing records by SKU")
        sku_to_id = list_records_by_sku(client)
        print(f"  · {len(sku_to_id)} records found")

        print("Step 3: applying right-sized updates")
        patch_records(client, UPDATES, sku_to_id)

    print("Done.")


if __name__ == "__main__":
    main()
