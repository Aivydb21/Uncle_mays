"use client";

import { useState } from "react";
import { SERVICE_AREA_ZIPS } from "@/lib/service-area";

// Static informational header above the catalog. The Chicago-delivery badge
// was previously a span styled like an interactive pill — Galileo daily
// briefing 2026-05-17 flagged it as a dead-click magnet (users tapping it
// expecting a ZIP check). Now it's a real button that expands an inline ZIP
// input; service area is imported from the single source of truth.
const ZIP_SET = new Set(SERVICE_AREA_ZIPS);

export function ShopHeader() {
  const [open, setOpen] = useState(false);
  const [zip, setZip] = useState("");

  const trimmed = zip.trim();
  const isValidLen = /^\d{5}$/.test(trimmed);
  const inZone = isValidLen && ZIP_SET.has(trimmed);
  const outOfZone = isValidLen && !inZone;

  return (
    <header className="mb-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
        Build Your Own Box
      </div>
      <h1 className="mt-4 text-4xl font-bold md:text-5xl">Shop the catalog</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
        Pick exactly what you want, in whatever quantity you want. $20 minimum.
        <strong>Chicago-area delivery</strong> 7 days a week with a window of
        your choice, or free pickup at Polsky Center in Hyde Park.
      </p>
      <div className="mx-auto mt-4 inline-block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="shop-zip-check"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 active:bg-primary/15"
        >
          <span aria-hidden="true">📍</span>
          <span>
            {open ? "Check your ZIP" : "Chicago delivery — tap to check your ZIP"}
          </span>
        </button>
        {open && (
          <div
            id="shop-zip-check"
            className="mx-auto mt-3 flex max-w-xs flex-col items-center gap-2"
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              pattern="\d{5}"
              placeholder="Enter ZIP"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
              aria-label="ZIP code"
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-center text-base focus:border-primary focus:outline-none"
            />
            {inZone && (
              <p className="text-xs font-semibold text-primary">
                ✓ We deliver to {trimmed}. Build your box and check out.
              </p>
            )}
            {outOfZone && (
              <p className="text-xs text-muted-foreground">
                We don&apos;t deliver to {trimmed} yet — free pickup at Polsky
                Center in Hyde Park works for any address.
              </p>
            )}
            {!isValidLen && trimmed.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Enter all 5 digits.
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
