// Shared delivery-window definitions used by the scheduler UI and downstream
// surfaces (Stripe metadata, order-confirmation email, GA4 events).
//
// EXP-002 painted door (2026-05-09): customers see 7 days × 4 windows.
// Real fulfillment is still Wednesday-only; the selected slot is captured as
// a preference and surfaced honestly in the order-confirmation email.

// Platform-wide minimum lead time, in days. Customers cannot select a
// delivery date earlier than today + MIN_LEAD_DAYS. Made-to-order SKUs
// with their own vendor lead time push this higher per-cart.
export const MIN_LEAD_DAYS = 4;

export type WindowKey = "morning" | "midday" | "afternoon" | "evening";

export interface DeliveryWindow {
  key: WindowKey;
  label: string;
  startHour: number;
  endHour: number;
}

export const DELIVERY_WINDOWS: DeliveryWindow[] = [
  { key: "morning", label: "8:00 AM – 11:00 AM", startHour: 8, endHour: 11 },
  { key: "midday", label: "11:00 AM – 2:00 PM", startHour: 11, endHour: 14 },
  { key: "afternoon", label: "2:00 PM – 5:00 PM", startHour: 14, endHour: 17 },
  { key: "evening", label: "5:00 PM – 8:00 PM", startHour: 17, endHour: 20 },
];

export interface DeliveryDay {
  isoDate: string;
  dayOffset: number;
  weekdayShort: string;
  weekdayLong: string;
  monthShort: string;
  dayOfMonth: number;
}

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns the next 7 calendar days starting today. Day offsets 0..6.
// Earliest selectable day is today + MIN_LEAD_DAYS so we have time to
// place the supplier PO, receive, stage, and route. Earlier offsets are
// included for display continuity but should be marked unavailable by the
// caller.
export function nextSevenDays(now: Date = new Date()): DeliveryDay[] {
  const out: DeliveryDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      isoDate: isoDate(d),
      dayOffset: i,
      weekdayShort: WEEKDAYS_SHORT[d.getDay()],
      weekdayLong: WEEKDAYS_LONG[d.getDay()],
      monthShort: MONTHS_SHORT[d.getMonth()],
      dayOfMonth: d.getDate(),
    });
  }
  return out;
}

export function findWindowByKey(key: string | null | undefined): DeliveryWindow | null {
  if (!key) return null;
  return DELIVERY_WINDOWS.find((w) => w.key === key) ?? null;
}

// Format a long human-readable label for use in the order confirmation
// email. Example: "Friday, May 16, 2:00 PM – 5:00 PM"
export function formatPreferredSlotLabel(
  isoDateStr: string | null | undefined,
  windowKey: string | null | undefined
): string | null {
  if (!isoDateStr || !windowKey) return null;
  const win = findWindowByKey(windowKey);
  if (!win) return null;
  const [y, m, d] = isoDateStr.split("-").map((s) => Number(s));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  const weekday = WEEKDAYS_LONG[date.getDay()];
  const month = MONTHS_SHORT[date.getMonth()];
  return `${weekday}, ${month} ${d}, ${win.label}`;
}
