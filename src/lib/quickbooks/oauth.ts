import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readConfig, updateTokens, type QboConfig } from "./config";

interface DiscoveryDoc {
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint: string;
  userinfo_endpoint: string;
  issuer: string;
}

interface CachedDiscovery {
  doc: DiscoveryDoc;
  fetchedAt: number;
}

let discoveryCache: CachedDiscovery | null = null;
const DISCOVERY_TTL_MS = 24 * 60 * 60 * 1000;

export async function getDiscovery(cfg: QboConfig): Promise<DiscoveryDoc> {
  const now = Date.now();
  if (discoveryCache && now - discoveryCache.fetchedAt < DISCOVERY_TTL_MS) {
    return discoveryCache.doc;
  }
  const res = await fetch(cfg.discovery_url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Intuit discovery doc fetch failed: ${res.status}`);
  const doc = (await res.json()) as DiscoveryDoc;
  discoveryCache = { doc, fetchedAt: now };
  return doc;
}

const STATE_SECRET = process.env.QBO_STATE_SECRET || "qbo-local-dev-state-secret-change-in-prod";

export function createState(): { value: string; signed: string } {
  const value = randomBytes(24).toString("base64url");
  const sig = createHmac("sha256", STATE_SECRET).update(value).digest("base64url");
  return { value, signed: `${value}.${sig}` };
}

export function verifyState(signed: string): boolean {
  const parts = signed.split(".");
  if (parts.length !== 2) return false;
  const [value, sig] = parts;
  const expected = createHmac("sha256", STATE_SECRET).update(value).digest("base64url");
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function buildAuthUrl(cfg: QboConfig, signedState: string): Promise<string> {
  const disc = await getDiscovery(cfg);
  const params = new URLSearchParams({
    client_id: cfg.client_id,
    response_type: "code",
    scope: cfg.scopes.join(" "),
    redirect_uri: cfg.redirect_uri,
    state: signedState,
  });
  return `${disc.authorization_endpoint}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  token_type: string;
}

function basicAuth(cfg: QboConfig): string {
  return Buffer.from(`${cfg.client_id}:${cfg.client_secret}`).toString("base64");
}

export async function exchangeCodeForTokens(cfg: QboConfig, code: string, realmId: string): Promise<QboConfig> {
  const disc = await getDiscovery(cfg);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirect_uri,
  });
  const res = await fetch(disc.token_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(cfg)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  const tokens = (await res.json()) as TokenResponse;
  const now = new Date();
  return updateTokens({
    realm_id: realmId,
    access_token: tokens.access_token,
    access_token_expires_at: new Date(now.getTime() + tokens.expires_in * 1000).toISOString(),
    refresh_token: tokens.refresh_token,
    refresh_token_updated_at: now.toISOString(),
  });
}

export async function refreshAccessToken(cfg: QboConfig): Promise<QboConfig> {
  if (!cfg.refresh_token) throw new Error("No refresh token; user must reconnect");
  const disc = await getDiscovery(cfg);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: cfg.refresh_token,
  });
  const res = await fetch(disc.token_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(cfg)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 400 && text.includes("invalid_grant")) {
      updateTokens({
        access_token: null,
        access_token_expires_at: null,
        refresh_token: null,
        refresh_token_updated_at: null,
      });
      throw new Error("Refresh token rejected (invalid_grant); user must reconnect");
    }
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  const tokens = (await res.json()) as TokenResponse;
  const now = new Date();
  return updateTokens({
    access_token: tokens.access_token,
    access_token_expires_at: new Date(now.getTime() + tokens.expires_in * 1000).toISOString(),
    refresh_token: tokens.refresh_token,
    refresh_token_updated_at: now.toISOString(),
  });
}

export async function revokeTokens(cfg: QboConfig): Promise<void> {
  const disc = await getDiscovery(cfg);
  const token = cfg.refresh_token || cfg.access_token;
  if (!token) return;
  await fetch(disc.revocation_endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(cfg)}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token }),
  });
  updateTokens({
    realm_id: null,
    access_token: null,
    access_token_expires_at: null,
    refresh_token: null,
    refresh_token_updated_at: null,
  });
}

export async function ensureValidAccessToken(): Promise<QboConfig> {
  const cfg = readConfig();
  if (!cfg.access_token || !cfg.access_token_expires_at) {
    return refreshAccessToken(cfg);
  }
  const expiresAt = new Date(cfg.access_token_expires_at).getTime();
  const skewMs = 5 * 60 * 1000;
  if (Date.now() >= expiresAt - skewMs) {
    return refreshAccessToken(cfg);
  }
  return cfg;
}
