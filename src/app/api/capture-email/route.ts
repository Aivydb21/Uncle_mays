import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const { email, product } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !listId) {
    // Not configured yet — silently succeed so checkout is never blocked
    console.warn("Mailchimp not configured (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID missing)");
    return NextResponse.json({ ok: true });
  }

  const serverPrefix = apiKey.split("-").pop();
  const emailHash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${emailHash}`;

  const body = {
    email_address: email.trim().toLowerCase(),
    status_if_new: "subscribed",
    merge_fields: {
      PRODUCT: product || "",
    },
  };

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Mailchimp error:", res.status, text);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Mailchimp fetch error:", err);
    // Non-fatal — never block checkout
    return NextResponse.json({ ok: true });
  }
}
