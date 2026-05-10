import { NextResponse } from "next/server";
import { readConfig } from "@/lib/quickbooks/config";
import { revokeTokens } from "@/lib/quickbooks/oauth";

export async function POST() {
  const cfg = readConfig();
  await revokeTokens(cfg);
  return NextResponse.redirect(new URL("/admin/quickbooks?disconnected=1", "http://localhost:3000"));
}
