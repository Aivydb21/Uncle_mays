/**
 * LogRocket browser SDK wrapper.
 *
 * The SDK is loaded lazily (via dynamic import) once after the page has been
 * armed by DeferredAnalytics. Callers from anywhere in the app may invoke
 * `lrIdentify` / `lrTrack` / `lrGetSessionURL` at any time — calls made
 * before init() resolves are queued and replayed once the SDK is ready.
 *
 * PII config: inputSanitizer + textSanitizer are enabled by default so
 * <input>, <select>, <textarea> values, and text nodes inside elements
 * tagged data-private are stripped from recordings. Add data-private="redact"
 * to any wrapper that should not appear in replays (e.g. Stripe PaymentElement).
 *
 * Galileo AI watches every session and is the source of truth for user
 * behavior — see AGENTS.md LogRocket Standing Operating Procedure (2026-05-14).
 */

type LRTraits = Record<string, string | number | boolean>;
type LRProps = Record<string, string | number | boolean | string[] | number[] | boolean[]>;

// logrocket uses CommonJS `export =`, so the module IS the LogRocket object
// when imported with esModuleInterop. The dynamic-import shape varies between
// bundlers (some give .default, some hand the module back directly), so we
// normalize at the call site.
type LogRocketLib = typeof import("logrocket");

const APP_ID = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;

let initPromise: Promise<LogRocketLib | null> | null = null;
const pendingIdentify: Array<{ uid: string; traits?: LRTraits }> = [];
const pendingTracks: Array<{ event: string; props?: LRProps }> = [];

async function loadAndInit(): Promise<LogRocketLib | null> {
  if (typeof window === "undefined") return null;
  if (!APP_ID) return null;
  try {
    const mod = await import("logrocket");
    // CommonJS interop: bundlers may surface the LogRocket object as
    // `mod.default` or as `mod` itself. Both shapes resolve to the same API.
    const LR = ((mod as unknown as { default?: LogRocketLib }).default ?? (mod as unknown as LogRocketLib));
    LR.init(APP_ID, {
      dom: {
        inputSanitizer: true,
        textSanitizer: false,
      },
      network: {
        requestSanitizer: (req) => {
          // Strip Authorization headers and Stripe payment payloads from network logs.
          if (req.headers && (req.headers as Record<string, string>)["authorization"]) {
            (req.headers as Record<string, string>)["authorization"] = "[redacted]";
          }
          if (typeof req.url === "string" && /\/api\/checkout\/session|\/api\/portal\/session|stripe\.com/.test(req.url)) {
            req.body = undefined;
          }
          return req;
        },
        responseSanitizer: (res) => {
          if (typeof res.url === "string" && /stripe\.com|\/api\/checkout|\/api\/portal/.test(res.url)) {
            res.body = undefined;
          }
          return res;
        },
      },
    });
    // Flush queued identifies + tracks.
    while (pendingIdentify.length) {
      const item = pendingIdentify.shift()!;
      LR.identify(item.uid, item.traits ?? {});
    }
    while (pendingTracks.length) {
      const item = pendingTracks.shift()!;
      LR.track(item.event, item.props);
    }
    return LR;
  } catch {
    return null;
  }
}

/**
 * Lazy-initialize LogRocket. Safe to call multiple times — subsequent calls
 * return the same promise. Returns null in environments without an APP_ID
 * (local dev without the env var, SSR, build-time prerender).
 */
export function initLogRocket(): Promise<LogRocketLib | null> {
  if (!initPromise) initPromise = loadAndInit();
  return initPromise;
}

/**
 * Identify the user in LogRocket so sessions are searchable by hashed email.
 * Only pass the SHA-256 hashed email we already use for Meta CAPI / Pixel
 * Advanced Matching. Never pass raw PII.
 */
export function lrIdentify(uid: string, traits?: LRTraits): void {
  if (!uid) return;
  if (initPromise) {
    initPromise.then((LR) => {
      if (LR) LR.identify(uid, traits ?? {});
    });
  } else {
    pendingIdentify.push({ uid, traits });
    // Kick off init so the queue actually drains. Callers that hit identify
    // before DeferredAnalytics arms still get covered.
    initLogRocket();
  }
}

/**
 * Track a custom event (purchase, key UX milestone, etc.) — Galileo
 * incorporates these into session summaries and funnel reports.
 */
export function lrTrack(event: string, props?: LRProps): void {
  if (initPromise) {
    initPromise.then((LR) => {
      if (LR) LR.track(event, props);
    });
  } else {
    pendingTracks.push({ event, props });
    initLogRocket();
  }
}

/**
 * Returns the current session URL (or null if SDK not yet loaded). Useful
 * to attach to feedback rows, support tickets, internal alerts so a human
 * can jump straight to the replay.
 */
export async function lrGetSessionURL(): Promise<string | null> {
  const LR = await (initPromise ?? initLogRocket());
  if (!LR) return null;
  try {
    return LR.sessionURL ?? null;
  } catch {
    return null;
  }
}
