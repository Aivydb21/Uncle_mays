import { apiBase, type QboConfig } from "./config";
import { ensureValidAccessToken, refreshAccessToken } from "./oauth";

interface QboFault {
  Fault?: { Error?: Array<{ Message: string; Detail?: string; code?: string }> };
}

export class QboApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly intuitTid: string | null,
    public readonly fault: QboFault | null,
    public readonly path: string,
  ) {
    super(`QBO ${status} on ${path} [tid=${intuitTid}] ${fault?.Fault?.Error?.[0]?.Message ?? ""}`);
    this.name = "QboApiError";
  }
}

interface QboFetchOptions {
  method?: "GET" | "POST";
  query?: Record<string, string>;
  json?: unknown;
  retryOn401?: boolean;
}

async function callOnce(cfg: QboConfig, path: string, opts: QboFetchOptions): Promise<Response> {
  if (!cfg.realm_id || !cfg.access_token) {
    throw new Error("QBO not connected; run /admin/quickbooks/connect first");
  }
  const url = new URL(`${apiBase(cfg)}/v3/company/${cfg.realm_id}${path}`);
  if (opts.query) for (const [k, v] of Object.entries(opts.query)) url.searchParams.set(k, v);
  url.searchParams.set("minorversion", "70");

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${cfg.access_token}`,
      Accept: "application/json",
      ...(opts.json ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.json ? JSON.stringify(opts.json) : undefined,
  });
  return res;
}

export async function qboFetch<T = unknown>(path: string, opts: QboFetchOptions = {}): Promise<T> {
  let cfg = await ensureValidAccessToken();
  let res = await callOnce(cfg, path, opts);

  if (res.status === 401 && opts.retryOn401 !== false) {
    cfg = await refreshAccessToken(cfg);
    res = await callOnce(cfg, path, { ...opts, retryOn401: false });
  }

  const intuitTid = res.headers.get("intuit_tid");

  if (!res.ok) {
    let fault: QboFault | null = null;
    try { fault = (await res.json()) as QboFault; } catch { /* non-JSON body */ }
    console.error("[qbo]", JSON.stringify({
      path,
      method: opts.method ?? "GET",
      status: res.status,
      intuit_tid: intuitTid,
      fault: fault?.Fault?.Error ?? null,
    }));
    throw new QboApiError(res.status, intuitTid, fault, path);
  }

  return (await res.json()) as T;
}

export async function qboQuery<T = unknown>(sql: string): Promise<T> {
  return qboFetch<T>("/query", { method: "GET", query: { query: sql } });
}
