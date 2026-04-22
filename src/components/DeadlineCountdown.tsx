"use client";

import { useState, useEffect } from "react";

/**
 * Returns the next Tuesday 11:59pm (Chicago time as a local JS Date).
 * If today is Tuesday before 11:59pm, returns this Tuesday.
 * Otherwise returns next Tuesday.
 */
function getNextCutoff(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 2=Tue
  const daysUntilTuesday = (2 - day + 7) % 7;
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() + daysUntilTuesday);
  cutoff.setHours(23, 59, 0, 0);
  // If we're past this Tuesday's cutoff, use next Tuesday
  if (cutoff <= now) {
    cutoff.setDate(cutoff.getDate() + 7);
  }
  return cutoff;
}

/**
 * Returns the Wednesday following the next cutoff Tuesday.
 */
function getNextDeliveryDate(): Date {
  const cutoff = getNextCutoff();
  const delivery = new Date(cutoff);
  delivery.setDate(cutoff.getDate() + 1); // Tue -> Wed
  delivery.setHours(0, 0, 0, 0);
  return delivery;
}

function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function getTimeLeft(): TimeLeft {
  const cutoff = getNextCutoff();
  const now = new Date();
  const total = cutoff.getTime() - now.getTime();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, total };
}

interface Props {
  /** "inline" = compact badge for Hero; "box" = full urgency card for Pricing/Checkout */
  variant?: "inline" | "box";
}

export function DeadlineCountdown({ variant = "box" }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const deliveryDate = getNextDeliveryDate();
  const deliveryLabel = formatDeliveryDate(deliveryDate);

  // Urgency color: red < 12h, orange < 48h, green otherwise
  const urgencyColor =
    !timeLeft || timeLeft.total === 0
      ? "text-red-600"
      : timeLeft.total < 12 * 60 * 60 * 1000
      ? "text-red-600"
      : timeLeft.total < 48 * 60 * 60 * 1000
      ? "text-orange-600"
      : "text-primary";

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
        <span>⏰</span>
        {timeLeft ? (
          <span>
            Order cutoff:{" "}
            <span className={urgencyColor}>
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {String(timeLeft.hours).padStart(2, "0")}h{" "}
              {String(timeLeft.minutes).padStart(2, "0")}m
            </span>{" "}
            · Delivers {deliveryLabel}
          </span>
        ) : (
          <span>Order by Tuesday 11:59pm · Delivers {deliveryLabel}</span>
        )}
      </div>
    );
  }

  // "box" variant
  return (
    <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⏰</span>
        <div className="flex-1">
          <p className={`text-sm font-semibold mb-1 ${urgencyColor}`}>
            Order by Tuesday 11:59pm for delivery this Wednesday
          </p>
          {timeLeft && timeLeft.total > 0 ? (
            <div className="flex gap-3 mt-2">
              {timeLeft.days > 0 && (
                <div className="text-center">
                  <div className={`text-xl font-bold tabular-nums ${urgencyColor}`}>
                    {timeLeft.days}
                  </div>
                  <div className="text-xs text-muted-foreground">day{timeLeft.days !== 1 ? "s" : ""}</div>
                </div>
              )}
              <div className="text-center">
                <div className={`text-xl font-bold tabular-nums ${urgencyColor}`}>
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground">hrs</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold tabular-nums ${urgencyColor}`}>
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground">min</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold tabular-nums ${urgencyColor}`}>
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground">sec</div>
              </div>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground mt-2">
            Next delivery: {deliveryLabel} · Limited boxes available this week.
          </p>
        </div>
      </div>
    </div>
  );
}
