import { NextRequest, NextResponse } from "next/server";
import { readConfig } from "@/lib/quickbooks/config";
import { exchangeCodeForTokens, verifyState } from "@/lib/quickbooks/oauth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const realmId = url.searchParams.get("realmId");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/admin/quickbooks?error=${encodeURIComponent(error)}`, req.url));
  }
  if (!code || !state || !realmId) {
    return NextResponse.redirect(new URL("/admin/quickbooks?error=missing_params", req.url));
  }

  const cookieState = req.cookies.get("qbo_oauth_state")?.value;
  if (!cookieState || cookieState !== state || !verifyState(state)) {
    return NextResponse.redirect(new URL("/admin/quickbooks?error=csrf_mismatch", req.url));
  }

  try {
    const cfg = readConfig();
    await exchangeCodeForTokens(cfg, code, realmId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "exchange_failed";
    return NextResponse.redirect(new URL(`/admin/quickbooks?error=${encodeURIComponent(msg)}`, req.url));
  }

  const res = NextResponse.redirect(new URL("/admin/quickbooks?connected=1", req.url));
  res.cookies.delete("qbo_oauth_state");
  return res;
}
