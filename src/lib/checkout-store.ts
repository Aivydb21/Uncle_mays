import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORE_PATH = path.join(process.cwd(), "data", "checkout-sessions.json");

export interface CheckoutSession {
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
  proteins?: string[];
  paymentIntentId?: string;
  completedAt?: string;
  recoveryEmailSent?: boolean;
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

export function createSession(
  data: Omit<CheckoutSession, "id" | "createdAt" | "updatedAt">
): CheckoutSession {
  const store = readStore();
  const now = new Date().toISOString();
  const session: CheckoutSession = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  store.sessions.push(session);
  writeStore(store);
  return session;
}

export function updateSession(
  id: string,
  patch: Partial<CheckoutSession>
): CheckoutSession | null {
  const store = readStore();
  const idx = store.sessions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.sessions[idx] = {
    ...store.sessions[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store.sessions[idx];
}

export function getAbandonedSessions(since?: Date): CheckoutSession[] {
  const store = readStore();
  const cutoff = since ?? new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h default
  return store.sessions.filter(
    (s) => !s.completedAt && new Date(s.createdAt) >= cutoff
  );
}
