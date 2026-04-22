import { NextRequest, NextResponse } from "next/server";
import { addSignupLead } from "@/lib/mailchimp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await addSignupLead(email.trim(), typeof source === "string" ? source : undefined);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error ?? "Signup failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("email-capture error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
