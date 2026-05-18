"use client";

/**
 * Typed diagnostic events for the LogRocket / Galileo pipeline.
 *
 * Galileo's daily briefing can filter by event name, so prefer these tagged
 * helpers over ad-hoc lrTrack calls when you're instrumenting a regression
 * tripwire (storage failures, UX dead-ends, image fallbacks, etc.).
 *
 * Event taxonomy is defined here so the Decision Scientist can dashboard
 * each tag and so future contributors don't invent parallel names.
 */

import { lrTrack } from "./logrocket";

export type DiagnosticEvent =
  /** Storage layer threw on read/write and we fell back to in-memory. */
  | "cart_storage_unavailable"
  /** Add-to-cart click handler threw past the storage layer. */
  | "cart_add_failed"
  /** Many /api/cart/quote calls in a short window, debounce regression. */
  | "checkout_zip_keystroke_burst"
  /** Catalog SKU fell back to Airtable attachment URL (no local image). */
  | "catalog_airtable_fallback"
  /** Snapshot of local-vs-Airtable image coverage at module init. */
  | "catalog_local_image_coverage"
  /** Category nav IntersectionObserver fired late vs click. */
  | "nav_observer_lag";

type EventProps = Record<string, string | number | boolean | string[] | number[] | boolean[]>;

export function trackDiagnostic(event: DiagnosticEvent, props?: EventProps): void {
  try {
    lrTrack(event, props);
  } catch {
    // Diagnostics must never affect UX. Swallow.
  }
}
