import { NextRequest, NextResponse } from "next/server";
import { addSignupLead } from "@/lib/mailchimp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Called from the checkout page (step 1) when the customer types their email.
// Adds them to the Mailchimp audience with the `new_signup` tag so the welcome
// series fires, plus a source marker (`source:checkout-<product>`) for segmentation.
// The Stripe webhook later adds the `order_completed` tag on successful purchase,
// which the welcome journey checks to end early.
export async function POST(req: NextRequest) {
  try {
    const { email, product } = await req.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const source = typeof product === "string" && product
      ? `checkout-${product}`
      : "checkout";

    const result = await addSignupLead(email.trim(), source);
    if (!result.ok) {
      // Don't block checkout on Mailchimp errors — always succeed to the client.
      console.warn("capture-email: Mailchimp signup failed:", result.error);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("capture-email error:", err);
    // Never block checkout for capture failures.
    return NextResponse.json({ ok: true });
  }
}
