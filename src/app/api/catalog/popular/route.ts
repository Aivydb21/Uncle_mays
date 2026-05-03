import { NextResponse } from "next/server";
import { fetchCatalog } from "@/lib/catalog/airtable";

// Returns the top-N items by SortOrder (lowest = most prominent). Used
// by the cart drawer's empty state to recommend something to add.
//
// Caches for 5 minutes (matches the underlying Airtable cache window).
export const revalidate = 300;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(10, Number(searchParams.get("limit")) || 4));
  try {
    const catalog = await fetchCatalog();
    const popular = [...catalog]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, limit);
    return NextResponse.json({ ok: true, items: popular });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 503 }
    );
  }
}
