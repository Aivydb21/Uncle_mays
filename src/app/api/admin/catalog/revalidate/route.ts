import { NextRequest, NextResponse } from "next/server";
import { revalidateCatalog } from "@/lib/catalog/airtable";
import { revalidatePickupSlots } from "@/lib/catalog/pickup-slots";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 500 });
  }
  const provided =
    req.headers.get("x-admin-token") ||
    new URL(req.url).searchParams.get("token");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidateCatalog();
  revalidatePickupSlots();
  return NextResponse.json({ ok: true, revalidated: ["catalog", "pickup-slots"] });
}
