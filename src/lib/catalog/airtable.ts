import "server-only";
import fs from "fs";
import path from "path";
import { unstable_cache, revalidateTag } from "next/cache";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemInternal,
  CatalogUnit,
  TaxCategory,
} from "./types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "catalog-snapshot.json");
const CATALOG_TAG = "catalog";
const CATALOG_REVALIDATE_SECONDS = 300;

const VALID_CATEGORIES: ReadonlySet<CatalogCategory> = new Set([
  "Greens",
  "Roots",
  "Pantry",
  "Protein",
  "Microgreens",
]);

const VALID_UNITS: ReadonlySet<CatalogUnit> = new Set([
  "lb",
  "bunch",
  "each",
  "dozen",
  "pint",
  "oz",
]);

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

function getEnv() {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_CATALOG_BASE_ID;
  const tableName =
    process.env.AIRTABLE_CATALOG_TABLE || "Catalog";
  if (!pat || !baseId) {
    throw new Error("AIRTABLE_PAT and AIRTABLE_CATALOG_BASE_ID must be set");
  }
  return { pat, baseId, tableName };
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function mapRecord(record: AirtableRecord): CatalogItemInternal | null {
  const f = record.fields;
  const sku = asString(f.SKU);
  const name = asString(f.Name);
  const categoryRaw = asString(f.Category);
  const unitRaw = asString(f.Unit);
  const costCents = asNumber(f.CostCents);
  const active = asBoolean(f.Active);
  if (!sku || !name || !categoryRaw || !unitRaw) return null;
  if (costCents == null) return null;
  if (!VALID_CATEGORIES.has(categoryRaw as CatalogCategory)) return null;
  if (!VALID_UNITS.has(unitRaw as CatalogUnit)) return null;
  const taxCategoryRaw = asString(f.TaxCategory);
  const taxCategory: TaxCategory =
    taxCategoryRaw === "prepared" ? "prepared" : "grocery";
  // Markup multiplier (single source of truth) — Airtable holds CostCents
  // only; we compute customer-facing PriceCents in code so the markup is
  // tunable in one place without touching every Airtable row.
  const priceCents = Math.round(costCents * 1.25);
  return {
    sku,
    name,
    description: asString(f.Description),
    category: categoryRaw as CatalogCategory,
    unit: unitRaw as CatalogUnit,
    priceCents,
    costCents: Math.round(costCents),
    active,
    availableQty: asNumber(f.AvailableQty),
    imageUrl: asString(f.ImageURL),
    sortOrder: asNumber(f.SortOrder) ?? 999,
    taxCategory,
    freshnessLabel: asString(f.FreshnessLabel),
    scarcityNote: asString(f.ScarcityNote),
  };
}

async function fetchAllRecords(): Promise<AirtableRecord[]> {
  const { pat, baseId, tableName } = getEnv();
  const out: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
    );
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${pat}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        `Airtable catalog fetch failed: ${res.status} ${res.statusText}`
      );
    }
    const json = (await res.json()) as AirtableListResponse;
    out.push(...json.records);
    offset = json.offset;
  } while (offset);
  return out;
}

function readSnapshot(): CatalogItemInternal[] | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as CatalogItemInternal[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSnapshot(items: CatalogItemInternal[]): void {
  try {
    fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error("[catalog] snapshot write error:", err);
  }
}

async function fetchInternalCatalogUncached(): Promise<CatalogItemInternal[]> {
  try {
    const records = await fetchAllRecords();
    const items: CatalogItemInternal[] = [];
    for (const r of records) {
      const mapped = mapRecord(r);
      if (mapped) items.push(mapped);
    }
    items.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });
    writeSnapshot(items);
    return items;
  } catch (err) {
    console.error("[catalog] live fetch failed, attempting snapshot:", err);
    const snap = readSnapshot();
    if (snap) return snap;
    throw err;
  }
}

const getInternalCatalogCached = unstable_cache(
  fetchInternalCatalogUncached,
  ["catalog-internal"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] }
);

export async function fetchCatalog(): Promise<CatalogItem[]> {
  const internal = await getInternalCatalogCached();
  return internal.map(stripCost).filter((it) => it.active);
}

export async function fetchCatalogIncludingInactive(): Promise<CatalogItem[]> {
  const internal = await getInternalCatalogCached();
  return internal.map(stripCost);
}

export async function getCatalogItem(
  sku: string
): Promise<CatalogItem | null> {
  const internal = await getInternalCatalogCached();
  const found = internal.find((it) => it.sku === sku);
  if (!found || !found.active) return null;
  return stripCost(found);
}

export async function getInternalCatalogItem(
  sku: string
): Promise<CatalogItemInternal | null> {
  const internal = await getInternalCatalogCached();
  return internal.find((it) => it.sku === sku) ?? null;
}

export async function getInternalCatalogMap(): Promise<
  Map<string, CatalogItemInternal>
> {
  const internal = await getInternalCatalogCached();
  return new Map(internal.map((it) => [it.sku, it]));
}

export function revalidateCatalog(): void {
  revalidateTag(CATALOG_TAG);
}

function stripCost(item: CatalogItemInternal): CatalogItem {
  const { costCents: _costCents, ...rest } = item;
  void _costCents;
  return rest;
}
