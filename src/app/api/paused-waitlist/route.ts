import { NextRequest, NextResponse } from "next/server";
import { addPausedWaitlist } from "@/lib/mailchimp";
import { getStoreStatus } from "@/lib/store-status";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Accepts email captures from the store-paused banner (UNC-1755). Tags the
// contact `paused_waitlist`. The reopen broadcast is operator-triggered in
// Mailchimp — we do not auto-send when the toggle flips back.
export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    const result = await addPausedWaitlist(
      email.trim(),
      typeof source === "string" ? source : "store_paused_banner"
    );
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? "Signup failed" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("paused-waitlist error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Exposed so the public banner can fetch reason text without leaking other
// env. Used as a fallback when the banner is rendered from a client-only
// surface (e.g. older cached HTML).
export async function GET() {
  const status = getStoreStatus();
  return NextResponse.json(status);
}
