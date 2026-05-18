"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DELIVERY_WINDOWS, type WindowKey } from "@/lib/delivery-windows";

// Calendly-style monthly calendar with time-window slots. EXP-002 painted
// door (2026-05-09): every selectable date appears available; the order
// confirmation email honestly notes that the first delivery ships the
// upcoming Wednesday and the preference is filed for future weeks.

export interface DeliverySchedulerSelection {
  isoDate: string;
  windowKey: WindowKey;
  windowLabel: string;
  dayOffset: number;
}

interface Props {
  value: DeliverySchedulerSelection | null;
  onChange: (selection: DeliverySchedulerSelection | null) => void;
  className?: string;
}

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

// EXP-002 verification helper. Append `?debug_exp=1` to any URL with the
// scheduler to (a) console-log every fired event and (b) flip GA4 into
// debug_mode so the events appear in DebugView for live verification.
function debugLogEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("debug_exp");
  } catch {
    return false;
  }
}

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// 30-day booking horizon. Anything past this is hidden, matching most
// grocery delivery apps and limiting the painted door to a credible window.
const MAX_DAY_OFFSET = 30;

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface CalendarCell {
  isoDate: string;
  date: Date;
  inMonth: boolean;
  selectable: boolean;
  isToday: boolean;
}

function buildCalendarGrid(
  year: number,
  month: number,
  today: Date,
  maxDate: Date
): CalendarCell[] {
  const first = startOfMonth(year, month);
  const leadingBlanks = first.getDay();
  const total = daysInMonth(year, month);
  const cells: CalendarCell[] = [];
  // Leading days from previous month
  for (let i = leadingBlanks - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({
      isoDate: isoDate(d),
      date: d,
      inMonth: false,
      selectable: false,
      isToday: false,
    });
  }
  // Days in this month
  for (let day = 1; day <= total; day++) {
    const d = new Date(year, month, day);
    const isToday = isoDate(d) === isoDate(today);
    const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isFuture = d > maxDate;
    cells.push({
      isoDate: isoDate(d),
      date: d,
      inMonth: true,
      // Same-day not offered (overpromise risk); past disabled; beyond
      // booking horizon disabled.
      selectable: !isPast && !isToday && !isFuture,
      isToday,
    });
  }
  // Trailing blanks to fill the last week row
  while (cells.length % 7 !== 0) {
    const lastIso = cells[cells.length - 1].isoDate;
    const [y, m, d] = lastIso.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    cells.push({
      isoDate: isoDate(next),
      date: next,
      inMonth: false,
      selectable: false,
      isToday: false,
    });
  }
  return cells;
}

function dayOffsetFromToday(target: Date, today: Date): number {
  const a = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function DeliveryScheduler({ value, onChange, className }: Props) {
  // Lock today on mount so a long-open tab past midnight does not silently
  // re-disable the user's already-selected day.
  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + MAX_DAY_OFFSET);
    return d;
  }, [today]);

  // Calendar shows the month containing the user's selected day, falling
  // back to the current month.
  const initialMonthDate = useMemo(() => {
    if (value?.isoDate) {
      const [y, m] = value.isoDate.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [today, value?.isoDate]);

  const [viewYear, setViewYear] = useState(initialMonthDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonthDate.getMonth());
  const [selectedIso, setSelectedIso] = useState<string | null>(value?.isoDate ?? null);

  const cells = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth, today, maxDate),
    [viewYear, viewMonth, today, maxDate]
  );

  // Allow navigating to the next month if any day in it is still within the
  // booking horizon.
  const canGoPrev = useMemo(() => {
    const firstOfView = new Date(viewYear, viewMonth, 1);
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstOfView > firstOfThisMonth;
  }, [viewYear, viewMonth, today]);

  const canGoNext = useMemo(() => {
    const firstOfNext = new Date(viewYear, viewMonth + 1, 1);
    return firstOfNext <= maxDate;
  }, [viewYear, viewMonth, maxDate]);

  // Fire scheduler view exactly once per mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const debug = debugLogEnabled();
    const gtag = (window as GtagWindow).gtag;
    const params: Record<string, unknown> = {
      event_category: "experiment",
      event_label: "EXP-002",
    };
    if (debug) params.debug_mode = true;
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[EXP-002] delivery_scheduler_view", params, {
        gtag_present: typeof gtag === "function",
      });
    }
    if (typeof gtag !== "function") return;
    gtag("event", "delivery_scheduler_view", params);
  }, []);

  function pickDate(iso: string) {
    setSelectedIso(iso);
    // If the user switches to a new date, clear the parent's stored
    // selection so canProceed flips back to false until they pick a
    // window for the new date.
    if (value && value.isoDate !== iso) {
      onChange(null);
    }
  }

  function pickWindow(windowKey: WindowKey, windowLabel: string) {
    if (!selectedIso) return;
    const [y, m, d] = selectedIso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayOffset = dayOffsetFromToday(date, today);
    const next: DeliverySchedulerSelection = {
      isoDate: selectedIso,
      windowKey,
      windowLabel,
      dayOffset,
    };
    onChange(next);
    if (typeof window !== "undefined") {
      const debug = debugLogEnabled();
      const gtag = (window as GtagWindow).gtag;
      const params: Record<string, unknown> = {
        event_category: "experiment",
        event_label: "EXP-002",
        day_offset: dayOffset,
        weekday: WEEKDAYS_LONG[date.getDay()],
        window_key: windowKey,
      };
      if (debug) params.debug_mode = true;
      if (debug) {
        // eslint-disable-next-line no-console
        console.log("[EXP-002] delivery_slot_selected", params, {
          gtag_present: typeof gtag === "function",
        });
      }
      if (typeof gtag === "function") {
        gtag("event", "delivery_slot_selected", params);
      }
    }
  }

  const selectedDateLabel = useMemo(() => {
    if (!selectedIso) return null;
    const [y, m, d] = selectedIso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${WEEKDAYS_LONG[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  }, [selectedIso]);

  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          Pick your delivery date & time
        </h3>
        <span className="text-xs text-muted-foreground">
          7 days a week
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
        {/* Calendar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (!canGoPrev) return;
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else {
                  setViewMonth((m) => m - 1);
                }
              }}
              disabled={!canGoPrev}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-foreground">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={() => {
                if (!canGoNext) return;
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else {
                  setViewMonth((m) => m + 1);
                }
              }}
              disabled={!canGoNext}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_HEADERS.map((d, i) => (
              <div
                key={`${d}-${i}`}
                className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {cells.map((cell, i) => {
              const isSelected = selectedIso === cell.isoDate;
              const baseClass =
                "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors mx-auto";
              if (!cell.inMonth) {
                return (
                  <div key={`blank-${i}`} className="h-9 w-9 mx-auto" aria-hidden />
                );
              }
              if (!cell.selectable) {
                return (
                  <div
                    key={cell.isoDate}
                    className={`${baseClass} cursor-not-allowed text-muted-foreground/40`}
                    aria-disabled="true"
                  >
                    {cell.date.getDate()}
                  </div>
                );
              }
              return (
                <button
                  key={cell.isoDate}
                  type="button"
                  onClick={() => pickDate(cell.isoDate)}
                  aria-pressed={isSelected}
                  aria-label={`${WEEKDAYS_LONG[cell.date.getDay()]}, ${MONTH_NAMES[cell.date.getMonth()]} ${cell.date.getDate()}`}
                  className={`${baseClass} font-medium ${
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-foreground hover:bg-primary/10"
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Earliest delivery: tomorrow. Book up to 30 days out.
          </p>
        </div>

        {/* Time-window cards */}
        <div>
          {selectedDateLabel ? (
            <p className="mb-3 text-sm font-semibold text-foreground">
              {selectedDateLabel}
            </p>
          ) : (
            <p className="mb-3 text-sm text-muted-foreground">
              Pick a date to see available windows.
            </p>
          )}
          <div
            role="radiogroup"
            aria-label="Delivery time window"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {DELIVERY_WINDOWS.map((win) => {
              const selected =
                value?.isoDate === selectedIso && value?.windowKey === win.key;
              const disabled = !selectedIso;
              return (
                <button
                  key={win.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => pickWindow(win.key, win.label)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                    disabled
                      ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                      : selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {win.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {labelFor(win.key)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : disabled
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {selected ? "Selected" : disabled ? "Pick date" : "Available"}
                  </span>
                </button>
              );
            })}
          </div>

          {value && value.isoDate === selectedIso && (
            <p className="mt-3 text-xs text-muted-foreground">
              Confirmed:{" "}
              <span className="font-semibold text-foreground">
                {selectedDateLabel} · {value.windowLabel}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function labelFor(key: WindowKey): string {
  switch (key) {
    case "morning":
      return "Morning delivery";
    case "midday":
      return "Lunchtime delivery";
    case "afternoon":
      return "Afternoon delivery";
    case "evening":
      return "After-work delivery";
  }
}
