import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import type { PickupSlot } from "./types";

const PICKUP_TAG = "pickup-slots";
const PICKUP_REVALIDATE_SECONDS = 60;

const DEFAULT_LOCATION_LABEL =
  "Polsky Center, 1452 E 53rd St, Hyde Park";

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
    process.env.AIRTABLE_PICKUP_SLOTS_TABLE || "PickupSlots";
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

function mapSlot(record: AirtableRecord): PickupSlot | null {
  const f = record.fields;
  const slotId = asString(f.SlotID);
  const startsAt = asString(f.StartsAt);
  const endsAt = asString(f.EndsAt);
  const capacity = asNumber(f.Capacity) ?? 0;
  const booked = asNumber(f.Booked) ?? 0;
  const active = f.Active === true;
  const locationLabel = asString(f.LocationLabel) ?? DEFAULT_LOCATION_LABEL;
  if (!slotId || !startsAt || !endsAt) return null;
  return {
    slotId,
    startsAt,
    endsAt,
    capacity,
    booked,
    active,
    locationLabel,
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
        `Airtable pickup-slots fetch failed: ${res.status} ${res.statusText}`
      );
    }
    const json = (await res.json()) as AirtableListResponse;
    out.push(...json.records);
    offset = json.offset;
  } while (offset);
  return out;
}

async function fetchAllSlotsUncached(): Promise<PickupSlot[]> {
  const records = await fetchAllRecords();
  const slots: PickupSlot[] = [];
  for (const r of records) {
    const mapped = mapSlot(r);
    if (mapped) slots.push(mapped);
  }
  slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return slots;
}

const getAllSlotsCached = unstable_cache(
  fetchAllSlotsUncached,
  ["pickup-slots-all"],
  { revalidate: PICKUP_REVALIDATE_SECONDS, tags: [PICKUP_TAG] }
);

export async function fetchActiveSlots(): Promise<PickupSlot[]> {
  const all = await getAllSlotsCached();
  const now = new Date().toISOString();
  return all.filter(
    (s) => s.active && s.startsAt >= now && s.booked < s.capacity
  );
}

export async function getSlot(slotId: string): Promise<PickupSlot | null> {
  const all = await getAllSlotsCached();
  return all.find((s) => s.slotId === slotId) ?? null;
}

export function revalidatePickupSlots(): void {
  revalidateTag(PICKUP_TAG);
}
