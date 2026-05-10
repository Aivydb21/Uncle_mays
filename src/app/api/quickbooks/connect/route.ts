import { NextResponse } from "next/server";
import { readConfig } from "@/lib/quickbooks/config";
import { buildAuthUrl, createState } from "@/lib/quickbooks/oauth";

export async function GET() {
  const cfg = readConfig();
  const { signed } = createState();
  const url = await buildAuthUrl(cfg, signed);

  const res = NextResponse.redirect(url);
  res.cookies.set("qbo_oauth_state", signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 600,
    path: "/",
  });
  return res;
}
