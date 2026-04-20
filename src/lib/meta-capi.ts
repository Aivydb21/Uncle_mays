import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID || "2276705169443313";
const CAPI_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

function hashSHA256(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export interface CapiUserData {
  email?: string;
  phone?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
}

export interface CapiCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  order_id?: string;
}

export interface SendCapiEventParams {
  eventName: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData?: CapiCustomData;
  eventId?: string;
  actionSource?: string;
}

export async function sendCapiEvent(params: SendCapiEventParams): Promise<void> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.warn("[CAPI] META_ACCESS_TOKEN not configured, skipping");
    return;
  }

  const userData: Record<string, string> = {};

  if (params.userData.email) {
    userData.em = hashSHA256(params.userData.email);
  }
  if (params.userData.phone) {
    const normalized = params.userData.phone.replace(/\D/g, "");
    if (normalized) userData.ph = hashSHA256(normalized);
  }
  if (params.userData.client_ip_address) {
    userData.client_ip_address = params.userData.client_ip_address;
  }
  if (params.userData.client_user_agent) {
    userData.client_user_agent = params.userData.client_user_agent;
  }
  if (params.userData.fbc) userData.fbc = params.userData.fbc;
  if (params.userData.fbp) userData.fbp = params.userData.fbp;

  const eventData: Record<string, unknown> = {
    event_name: params.eventName,
    event_time: params.eventTime ?? Math.floor(Date.now() / 1000),
    action_source: params.actionSource ?? "website",
    user_data: userData,
  };

  if (params.eventSourceUrl) eventData.event_source_url = params.eventSourceUrl;
  if (params.customData) eventData.custom_data = params.customData;
  if (params.eventId) eventData.event_id = params.eventId;

  const payload = { data: [eventData] };

  try {
    const res = await fetch(`${CAPI_URL}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json() as { events_received?: number };
      console.log(`[CAPI] ${params.eventName} sent, events_received=${data.events_received}`);
    } else {
      const text = await res.text();
      console.error(`[CAPI] ${params.eventName} failed: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error(`[CAPI] Error sending ${params.eventName}:`, err);
  }
}
