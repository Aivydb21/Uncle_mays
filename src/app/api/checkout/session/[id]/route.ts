import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const store = readStore();
    const session = store.sessions.find((s) => s.id === sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
