"""One-shot Airtable provisioning for the custom-cart launch.

Creates two tables in the Contacts base (appm6F6H9obydzAM2):
  - Catalog       per-item product catalog (CostCents only; PriceCents is
                  computed in src/lib/catalog/airtable.ts as cost × 1.25)
  - PickupSlots   Polsky Center pickup window slots

Then seeds:
  - Catalog with 45 SKUs from Run A Way Buckers' produce list + farm eggs
  - PickupSlots with 12 slots (Wed 4-6pm, Fri 4-6pm, Sat 10am-12pm × 4 weeks)

Idempotent: if a table with the same name already exists, the script
skips creation and proceeds to seed (records are appended, not deduped —
delete in Airtable UI if you need to re-seed).
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

CONFIG_PATH = Path.home() / ".claude" / "airtable-config.json"
BASE_ID = "appm6F6H9obydzAM2"
API = "https://api.airtable.com/v0"


def load_pat() -> str:
    cfg = json.loads(CONFIG_PATH.read_text())
    return cfg["api_key"]


# ---------------------------------------------------------------------------
# Schema definitions (mirror src/lib/catalog/types.ts CatalogCategory/Unit)
# ---------------------------------------------------------------------------

CATALOG_TABLE = {
    "name": "Catalog",
    "description": "Customer-facing product catalog. CostCents is the only "
                   "operator-edited price field; PriceCents is computed in "
                   "src/lib/catalog/airtable.ts as ROUND(CostCents * 1.25).",
    "fields": [
        {"name": "SKU",         "type": "singleLineText"},
        {"name": "Name",        "type": "singleLineText"},
        {"name": "Description", "type": "multilineText"},
        {"name": "Category", "type": "singleSelect", "options": {"choices": [
            {"name": "Greens"},
            {"name": "Roots"},
            {"name": "Pantry"},
            {"name": "Protein"},
            {"name": "Microgreens"},
        ]}},
        {"name": "Unit", "type": "singleSelect", "options": {"choices": [
            {"name": "lb"}, {"name": "bunch"}, {"name": "each"},
            {"name": "dozen"}, {"name": "pint"}, {"name": "oz"},
        ]}},
        {"name": "CostCents",     "type": "number", "options": {"precision": 0}},
        {"name": "Active",        "type": "checkbox", "options": {"color": "greenBright", "icon": "check"}},
        {"name": "AvailableQty",  "type": "number", "options": {"precision": 0}},
        {"name": "ImageURL",      "type": "url"},
        {"name": "SortOrder",     "type": "number", "options": {"precision": 0}},
        {"name": "TaxCategory", "type": "singleSelect", "options": {"choices": [
            {"name": "grocery"}, {"name": "prepared"},
        ]}},
    ],
}

PICKUP_SLOTS_TABLE = {
    "name": "PickupSlots",
    "description": "Polsky Center pickup window slots. Operator maintains "
                   "Capacity and Booked manually at MVP.",
    "fields": [
        {"name": "SlotID",        "type": "singleLineText"},
        {"name": "StartsAt",      "type": "dateTime", "options": {
            "dateFormat": {"name": "iso"},
            "timeFormat": {"name": "24hour"},
            "timeZone":   "America/Chicago",
        }},
        {"name": "EndsAt",        "type": "dateTime", "options": {
            "dateFormat": {"name": "iso"},
            "timeFormat": {"name": "24hour"},
            "timeZone":   "America/Chicago",
        }},
        {"name": "Capacity",      "type": "number", "options": {"precision": 0}},
        {"name": "Booked",        "type": "number", "options": {"precision": 0}},
        {"name": "Active",        "type": "checkbox", "options": {"color": "greenBright", "icon": "check"}},
        {"name": "LocationLabel", "type": "singleLineText"},
    ],
}


# ---------------------------------------------------------------------------
# Catalog seed — 45 SKUs from Run A Way Buckers Club produce list + eggs
# ---------------------------------------------------------------------------
# CostCents below = supplier wholesale (per RAB PDF). Customer price will
# be computed as round(CostCents * 1.25) in airtable.ts.
# Eggs: Anthony said customer-facing "$5.99/dozen" — backsolve COGS = 479c.

CATALOG_SEED: list[dict] = [
    # ---- Greens ----
    {"SKU":"asparagus-green-lb","Name":"Asparagus, Green","Category":"Greens","Unit":"lb","CostCents":750,"SortOrder":10},
    {"SKU":"kale-green-curly","Name":"Kale, Green Curly (bunch)","Category":"Greens","Unit":"bunch","CostCents":800,"SortOrder":20},
    {"SKU":"kale-red","Name":"Kale, Red (bunch)","Category":"Greens","Unit":"bunch","CostCents":800,"SortOrder":30},
    {"SKU":"kale-tuscan-lb","Name":"Tuscan Kale","Category":"Greens","Unit":"lb","CostCents":800,"SortOrder":40},
    {"SKU":"chard-rainbow-lb","Name":"Rainbow Chard","Category":"Greens","Unit":"lb","CostCents":800,"SortOrder":50},
    {"SKU":"salad-mix-5oz-clam","Name":"Salad Mix (5 oz clamshell)","Category":"Greens","Unit":"each","CostCents":600,"SortOrder":60},
    {"SKU":"lettuce-green-leaf-lb","Name":"Green Leaf Lettuce","Category":"Greens","Unit":"lb","CostCents":600,"SortOrder":70},
    {"SKU":"lettuce-romaine-lb","Name":"Romaine Lettuce","Category":"Greens","Unit":"lb","CostCents":800,"SortOrder":80},
    {"SKU":"lettuce-romaine-5oz-clam","Name":"Romaine Lettuce (5 oz clamshell)","Category":"Greens","Unit":"each","CostCents":400,"SortOrder":90},
    {"SKU":"lettuce-summer-crisp-lb","Name":"Summer Crisp Lettuce","Category":"Greens","Unit":"lb","CostCents":800,"SortOrder":100},
    {"SKU":"lettuce-summer-crisp-5oz-clam","Name":"Summer Crisp Lettuce (5 oz clamshell)","Category":"Greens","Unit":"each","CostCents":600,"SortOrder":110},
    {"SKU":"ramps-lb","Name":"Ramps (wild leeks)","Category":"Greens","Unit":"lb","CostCents":1400,"SortOrder":120},
    {"SKU":"greens-mixed-mustards-lb","Name":"Mixed Mustard Greens","Category":"Greens","Unit":"lb","CostCents":1200,"SortOrder":130},

    # ---- Microgreens ----
    {"SKU":"microgreens-broccoli-1oz","Name":"Broccoli Microgreens (1 oz)","Category":"Microgreens","Unit":"each","CostCents":575,"SortOrder":200},
    {"SKU":"microgreens-confetti-radish-1oz","Name":"Confetti Radish Microgreens (1 oz)","Category":"Microgreens","Unit":"each","CostCents":575,"SortOrder":210},
    {"SKU":"microgreens-pea-shoots-2oz","Name":"Pea Shoot Microgreens (2 oz)","Category":"Microgreens","Unit":"each","CostCents":950,"SortOrder":220},
    {"SKU":"microgreens-purple-radish-2oz","Name":"Purple Radish Microgreens (2 oz)","Category":"Microgreens","Unit":"each","CostCents":950,"SortOrder":230},
    {"SKU":"microgreens-spicy-mix-1oz","Name":"Spicy Mix Microgreens (1 oz)","Category":"Microgreens","Unit":"each","CostCents":675,"SortOrder":240},
    {"SKU":"microgreens-sunflower-1oz","Name":"Sunflower Microgreens (1 oz)","Category":"Microgreens","Unit":"each","CostCents":675,"SortOrder":250},

    # ---- Roots ----
    {"SKU":"carrots-candy-orange-lb","Name":"Candy Orange Carrots","Category":"Roots","Unit":"lb","CostCents":250,"SortOrder":300},
    {"SKU":"garlic-black-5oz-jar","Name":"Black Garlic (5 oz jar)","Category":"Roots","Unit":"each","CostCents":875,"SortOrder":310},
    {"SKU":"potatoes-all-blue-10lb-bag","Name":"All Blue Potatoes (10 lb bag)","Category":"Roots","Unit":"each","CostCents":2500,"SortOrder":320},
    {"SKU":"potatoes-carola-seconds-lb","Name":"Carola Potatoes (seconds)","Category":"Roots","Unit":"lb","CostCents":325,"SortOrder":330},
    {"SKU":"potatoes-white-eva-lb","Name":"White Eva Potatoes","Category":"Roots","Unit":"lb","CostCents":450,"SortOrder":340},
    {"SKU":"radishes-alpine-lb","Name":"Alpine Radishes","Category":"Roots","Unit":"lb","CostCents":400,"SortOrder":350},
    {"SKU":"radishes-green-meat-daikon-lb","Name":"Green Meat Daikon Radishes","Category":"Roots","Unit":"lb","CostCents":400,"SortOrder":360},
    {"SKU":"radishes-purple-daikon-lb","Name":"Purple Daikon Radishes","Category":"Roots","Unit":"lb","CostCents":400,"SortOrder":370},
    {"SKU":"sunchokes-lb","Name":"Sunchokes","Category":"Roots","Unit":"lb","CostCents":450,"SortOrder":380},
    {"SKU":"sweet-potatoes-lb","Name":"Sweet Potatoes","Category":"Roots","Unit":"lb","CostCents":450,"SortOrder":390},
    {"SKU":"sweet-potatoes-smalls-lb","Name":"Sweet Potatoes (smalls)","Category":"Roots","Unit":"lb","CostCents":600,"SortOrder":400},
    {"SKU":"sweet-potatoes-white-fingerling-lb","Name":"White Fingerling Sweet Potatoes","Category":"Roots","Unit":"lb","CostCents":500,"SortOrder":410},

    # ---- Pantry (beans) ----
    {"SKU":"beans-great-northern-1lb","Name":"Great Northern Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":665,"SortOrder":500},
    {"SKU":"beans-navy-1lb","Name":"Navy Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":665,"SortOrder":510},
    {"SKU":"beans-organic-black-turtle-1lb","Name":"Organic Black Turtle Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":615,"SortOrder":520},
    {"SKU":"beans-organic-kidney-1lb","Name":"Organic Kidney Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":659,"SortOrder":530},
    {"SKU":"beans-organic-pinto-1lb","Name":"Organic Pinto Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":615,"SortOrder":540},
    {"SKU":"beans-organic-pinto-5lb","Name":"Organic Pinto Beans (5 lb)","Category":"Pantry","Unit":"each","CostCents":1979,"SortOrder":550},
    {"SKU":"beans-pink-1lb","Name":"Pink Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":665,"SortOrder":560},
    {"SKU":"beans-small-reds-1lb","Name":"Small Red Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":615,"SortOrder":570},
    {"SKU":"beans-yellow-canary-1lb","Name":"Yellow Canary Beans (1 lb)","Category":"Pantry","Unit":"each","CostCents":665,"SortOrder":580},

    # ---- Protein ----
    {"SKU":"chicken-pastured-whole-lb","Name":"Pastured Whole Chicken (4-5 lb)","Category":"Protein","Unit":"lb","CostCents":700,"SortOrder":600},
    {"SKU":"beef-short-ribs-bone-in-lb","Name":"Beef Short Ribs, Bone-In","Category":"Protein","Unit":"lb","CostCents":840,"SortOrder":610},
    {"SKU":"beef-short-ribs-boneless-lb","Name":"Beef Short Ribs, Boneless","Category":"Protein","Unit":"lb","CostCents":1250,"SortOrder":620},
    {"SKU":"lamb-chops-lb","Name":"Lamb Chops","Category":"Protein","Unit":"lb","CostCents":1900,"SortOrder":630},
    {"SKU":"eggs-farm-fresh-dozen","Name":"Farm Fresh Eggs (dozen)","Category":"Protein","Unit":"dozen","CostCents":479,"SortOrder":640},
]


# ---------------------------------------------------------------------------
# PickupSlots seed — Wed 4-6p, Fri 4-6p, Sat 10a-12p × next 4 weeks
# ---------------------------------------------------------------------------

def build_pickup_slots(weeks: int = 4) -> list[dict]:
    """Generate Wed/Fri/Sat slots starting next Wed."""
    today = datetime.now(timezone.utc).date()
    days_until_wed = (2 - today.weekday()) % 7  # Mon=0, Wed=2
    if days_until_wed == 0:
        days_until_wed = 7
    next_wed = today + timedelta(days=days_until_wed)

    slots: list[dict] = []
    for week in range(weeks):
        wed = next_wed + timedelta(weeks=week)
        fri = wed + timedelta(days=2)
        sat = wed + timedelta(days=3)

        for day, start_h, end_h, capacity in [
            (wed, 16, 18, 20),  # Wed 4-6 PM
            (fri, 16, 18, 20),  # Fri 4-6 PM
            (sat, 10, 12, 30),  # Sat 10 AM-12 PM
        ]:
            # Build "America/Chicago" local time then convert to UTC ISO.
            # Chicago is UTC-5 (CDT) most of the year; UTC-6 in winter.
            # April 2026 → CDT (UTC-5).
            slot_id = f"{day.isoformat()}-{day.strftime('%a').lower()}-{start_h:02d}to{end_h:02d}"
            local_start = datetime(day.year, day.month, day.day, start_h, 0, 0)
            local_end = datetime(day.year, day.month, day.day, end_h, 0, 0)
            cdt_offset = timedelta(hours=5)
            slots.append({
                "SlotID":        slot_id,
                "StartsAt":      (local_start + cdt_offset).isoformat() + "Z",
                "EndsAt":        (local_end + cdt_offset).isoformat() + "Z",
                "Capacity":      capacity,
                "Booked":        0,
                "Active":        True,
                "LocationLabel": "Polsky Center, 1452 E 53rd St, Hyde Park",
            })
    return slots


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def list_existing_tables(cli: httpx.Client) -> dict[str, str]:
    r = cli.get(f"/meta/bases/{BASE_ID}/tables")
    r.raise_for_status()
    return {t["name"]: t["id"] for t in r.json().get("tables", [])}


def create_table(cli: httpx.Client, schema: dict) -> str:
    r = cli.post(f"/meta/bases/{BASE_ID}/tables", json=schema)
    if r.status_code >= 400:
        print(f"  [ERROR creating {schema['name']}] {r.status_code}: {r.text[:400]}")
        r.raise_for_status()
    body = r.json()
    print(f"  -> created table {schema['name']} ({body['id']})")
    return body["id"]


def insert_records(cli: httpx.Client, table_id: str, records: list[dict], batch: int = 10) -> int:
    """Insert records in batches of 10 (Airtable cap). Returns total inserted."""
    inserted = 0
    for i in range(0, len(records), batch):
        chunk = records[i:i + batch]
        body = {"records": [{"fields": rec} for rec in chunk], "typecast": True}
        r = cli.post(f"/{BASE_ID}/{table_id}", json=body)
        if r.status_code >= 400:
            print(f"  [ERROR inserting batch {i//batch}] {r.status_code}: {r.text[:400]}")
            r.raise_for_status()
        inserted += len(r.json().get("records", []))
        time.sleep(0.25)  # 5 req/s/base ceiling — stay well under
    return inserted


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    pat = load_pat()
    headers = {
        "Authorization": f"Bearer {pat}",
        "Content-Type":  "application/json",
    }

    with httpx.Client(base_url=API, headers=headers, timeout=60.0) as cli:
        print("[1/5] inventory existing tables")
        existing = list_existing_tables(cli)
        print(f"  current tables in {BASE_ID}: {list(existing.keys())}")

        # ---- Catalog ----
        if "Catalog" in existing:
            cat_id = existing["Catalog"]
            print(f"[2/5] Catalog table already exists ({cat_id}); skipping create")
        else:
            print("[2/5] creating Catalog table")
            cat_id = create_table(cli, CATALOG_TABLE)

        # ---- PickupSlots ----
        if "PickupSlots" in existing:
            slots_id = existing["PickupSlots"]
            print(f"[3/5] PickupSlots table already exists ({slots_id}); skipping create")
        else:
            print("[3/5] creating PickupSlots table")
            slots_id = create_table(cli, PICKUP_SLOTS_TABLE)

        # ---- Seed Catalog ----
        print(f"[4/5] seeding Catalog with {len(CATALOG_SEED)} SKUs")
        # Mark every SKU active by default; operator can deactivate later.
        seed_records = [{**s, "Active": True, "TaxCategory": "grocery"} for s in CATALOG_SEED]
        n_cat = insert_records(cli, cat_id, seed_records)
        print(f"  -> inserted {n_cat} Catalog rows")

        # ---- Seed PickupSlots ----
        slots = build_pickup_slots(weeks=4)
        print(f"[5/5] seeding PickupSlots with {len(slots)} slots (next 4 weeks)")
        n_slots = insert_records(cli, slots_id, slots)
        print(f"  -> inserted {n_slots} PickupSlots rows")

        print("\n" + "=" * 60)
        print("DONE. Vercel env vars to confirm:")
        print(f"  AIRTABLE_PAT                  = <your existing PAT>")
        print(f"  AIRTABLE_CATALOG_BASE_ID      = {BASE_ID}")
        print(f"  AIRTABLE_CATALOG_TABLE        = Catalog")
        print(f"  AIRTABLE_PICKUP_SLOTS_TABLE   = PickupSlots")
        print(f"  ADMIN_TOKEN                   = <generate a random secret>")
        print(f"  NEXT_PUBLIC_CART_ENABLED      = false (flip to true after smoke test)")
        print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"FAILED: {e}", file=sys.stderr)
        sys.exit(1)
