import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "checkout-sessions.json");

interface CheckoutSession {
  id: string;
  product: string;
  price: number;
  productName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryNotes?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  proteins?: string[];
  paymentIntentId?: string;
  completedAt?: string;
  recoveryEmailSent?: boolean;
  smsConfirmationSent?: boolean;
  smsConfirmationResponse?: "pending" | "confirmed" | "declined" | null;
  smsConfirmationSentAt?: string;
  smsConfirmationRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  sessions: CheckoutSession[];
}

function readStore(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return { sessions: [] };
  }
}

function writeStore(store: Store): void {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("checkout-store write error:", err);
  }
}

function updateSessionSmsResponse(
  phone: string,
  response: "confirmed" | "declined"
): CheckoutSession | null {
  const store = readStore();

  // Find the most recent session with this phone number that has SMS pending
  const normalizedPhone = phone.replace(/\D/g, ""); // Remove non-digits
  const session = store.sessions
    .filter((s) => {
      const sessionPhone = s.phone?.replace(/\D/g, "");
      return (
        sessionPhone === normalizedPhone &&
        s.smsConfirmationSent &&
        s.smsConfirmationResponse === "pending"
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!session) {
    return null;
  }

  const idx = store.sessions.findIndex((s) => s.id === session.id);
  if (idx === -1) return null;

  store.sessions[idx] = {
    ...store.sessions[idx],
    smsConfirmationResponse: response,
    smsConfirmationRespondedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeStore(store);
  return store.sessions[idx];
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const from = params.get("From") || "";
  const messageBody = (params.get("Body") || "").trim().toLowerCase();

  console.log(`[SMS WEBHOOK] Received from ${from}: "${messageBody}"`);

  // Parse response: YES/Y/CONFIRM = confirmed, NO/N/CANCEL = declined
  let response: "confirmed" | "declined" | null = null;
  if (["yes", "y", "confirm", "confirmed"].includes(messageBody)) {
    response = "confirmed";
  } else if (["no", "n", "cancel", "reschedule"].includes(messageBody)) {
    response = "declined";
  }

  if (!response) {
    // Unknown response, send help message
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(
      "Sorry, I didn't understand that. Please reply YES to confirm delivery or NO to reschedule. For questions, call (312) 972-2595."
    );
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Update session with response
  const session = updateSessionSmsResponse(from, response);

  if (!session) {
    console.warn(`[SMS WEBHOOK] No pending SMS confirmation found for ${from}`);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(
      "We couldn't find your order. Please call us at (312) 972-2595 for assistance."
    );
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  console.log(
    `[SMS WEBHOOK] Updated session ${session.id} with response: ${response}`
  );

  // Send confirmation message back to customer
  const twiml = new twilio.twiml.MessagingResponse();
  if (response === "confirmed") {
    twiml.message(
      `Thanks ${session.firstName}! Your delivery is confirmed. See you soon!`
    );
  } else {
    twiml.message(
      `Got it ${session.firstName}. We'll contact you to reschedule. Call (312) 972-2595 if needed.`
    );
  }

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
