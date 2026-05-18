"use client";

/**
 * Defensive wrappers around browser storage.
 *
 * Why this exists: Facebook and Instagram in-app browsers (FBAN/FBAV, plus
 * some Android Chrome WebView builds) can throw NotSupportedError or
 * QuotaExceededError on localStorage.setItem when storage is restricted
 * (private mode, container isolation, low disk, vendor-specific quirks).
 * Unguarded callers propagate the exception up the click handler and the
 * UI silently dies. This wrapper catches all storage exceptions, falls back
 * to an in-memory Map for the rest of the session, and emits a one-shot
 * diagnostic event so we can see the rate in Galileo.
 *
 * Use safeLocal / safeSession from anywhere in the app. Do not import
 * window.localStorage / window.sessionStorage directly; ESLint enforces.
 */

import { trackDiagnostic } from "./diagnostics";

type StorageKind = "local" | "session";

type Memory = Map<string, string>;

interface SafeStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  /** True after we've fallen back to in-memory for the rest of the session. */
  isDegraded: () => boolean;
}

function makeSafe(kind: StorageKind): SafeStorage {
  const memory: Memory = new Map();
  let degraded = false;

  function realStorage(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
      return kind === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  function degrade(reason: string): void {
    if (degraded) return;
    degraded = true;
    trackDiagnostic("cart_storage_unavailable", {
      kind,
      reason: reason.slice(0, 120),
      ua: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "",
    });
  }

  return {
    getItem(key) {
      const s = realStorage();
      if (s && !degraded) {
        try {
          return s.getItem(key);
        } catch (e) {
          degrade(e instanceof Error ? e.name : "get_error");
        }
      }
      return memory.get(key) ?? null;
    },
    setItem(key, value) {
      const s = realStorage();
      if (s && !degraded) {
        try {
          s.setItem(key, value);
          // Keep the memory mirror current so reads after a successful write
          // are consistent if storage later starts throwing mid-session.
          memory.set(key, value);
          return;
        } catch (e) {
          degrade(e instanceof Error ? e.name : "set_error");
        }
      }
      memory.set(key, value);
    },
    removeItem(key) {
      const s = realStorage();
      if (s && !degraded) {
        try {
          s.removeItem(key);
        } catch (e) {
          degrade(e instanceof Error ? e.name : "remove_error");
        }
      }
      memory.delete(key);
    },
    isDegraded() {
      return degraded;
    },
  };
}

export const safeLocal = makeSafe("local");
export const safeSession = makeSafe("session");
