"""Pull Airtable: Catalog, Suppliers, and PickupSlots tables.

Base: appm6F6H9obydzAM2 (contacts/operations base).
Config: ~/.claude/airtable-config.json or AIRTABLE_CONFIG_PATH env var.

Tables extracted:
  - Catalog: 45 active SKUs with pricing, units, availability
  - Suppliers: vendor contacts and category metadata
  - PickupSlots: scheduled pickup capacity and booking state
"""

from __future__ import annotations

import time
from pathlib import Path

import httpx
import polars as pl

from ._common import (
    load_dotenv_if_present,
    load_json_config,
    raw_path,
)

AIRTABLE_API = "https://api.airtable.com/v0"
PAGE_SIZE = 100


def _fetch_table(client: httpx.Client, base_id: str, table_name: str) -> list[dict]:
    """Fetch all records from an Airtable table via cursor pagination."""
    records: list[dict] = []
    offset: str | None = None
    while True:
        params: dict = {"pageSize": PAGE_SIZE}
        if offset:
            params["offset"] = offset
        r = client.get(f"{AIRTABLE_API}/{base_id}/{table_name}", params=params)
        r.raise_for_status()
        body = r.json()
        records.extend(body.get("records", []))
        offset = body.get("offset")
        if not offset:
            break
        time.sleep(0.2)
    return records


def _flatten_record(record: dict) -> dict:
    """Flatten Airtable record: promote fields to top level, keep id + createdTime."""
    row = {"airtable_id": record["id"], "created_time": record.get("createdTime")}
    fields = record.get("fields", {})
    for k, v in fields.items():
        # Normalize field names: lowercase, replace spaces with underscores
        key = k.lower().replace(" ", "_").replace("-", "_")
        # Single-select fields are dicts with {name, id, color} — keep name only
        if isinstance(v, dict) and "name" in v:
            row[key] = v["name"]
        # Multi-select fields are lists of dicts — join names
        elif isinstance(v, list) and all(isinstance(x, dict) and "name" in x for x in v):
            row[key] = ",".join(x["name"] for x in v)
        else:
            row[key] = v
    return row


def extract_catalog(client: httpx.Client, base_id: str) -> Path:
    records = _fetch_table(client, base_id, "Catalog")
    rows = [_flatten_record(r) for r in records]
    df = pl.DataFrame(rows, infer_schema_length=len(rows) or 1)
    out = raw_path("airtable_catalog")
    df.write_parquet(out)
    active = sum(1 for r in rows if r.get("active") is True)
    print(f"[airtable.catalog] {len(rows)} rows ({active} active SKUs) -> {out}")
    return out


def extract_suppliers(client: httpx.Client, base_id: str) -> Path:
    records = _fetch_table(client, base_id, "Suppliers")
    rows = [_flatten_record(r) for r in records]
    df = pl.DataFrame(rows, infer_schema_length=len(rows) or 1)
    out = raw_path("airtable_suppliers")
    df.write_parquet(out)
    print(f"[airtable.suppliers] {len(rows)} rows -> {out}")
    return out


def extract_pickup_slots(client: httpx.Client, base_id: str) -> Path:
    records = _fetch_table(client, base_id, "PickupSlots")
    rows = [_flatten_record(r) for r in records]
    df = pl.DataFrame(rows, infer_schema_length=len(rows) or 1)
    out = raw_path("airtable_pickup_slots")
    df.write_parquet(out)
    print(f"[airtable.pickup_slots] {len(rows)} rows -> {out}")
    return out


def extract() -> list[Path]:
    """Pull all three Airtable tables. Returns list of output paths."""
    load_dotenv_if_present()
    cfg = load_json_config("AIRTABLE_CONFIG_PATH", "~/.claude/airtable-config.json")
    api_key = cfg["api_key"]
    base_id = cfg["bases"]["contacts"]  # appm6F6H9obydzAM2

    with httpx.Client(
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=httpx.Timeout(30.0),
    ) as client:
        catalog_path = extract_catalog(client, base_id)
        suppliers_path = extract_suppliers(client, base_id)
        slots_path = extract_pickup_slots(client, base_id)

    return [catalog_path, suppliers_path, slots_path]


if __name__ == "__main__":
    paths = extract()
    for p in paths:
        print(f"Written: {p}")
