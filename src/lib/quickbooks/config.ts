import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface QboConfig {
  environment: "sandbox" | "production";
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  discovery_url: string;
  api_base_sandbox: string;
  api_base_production: string;
  scopes: string[];
  realm_id: string | null;
  access_token: string | null;
  access_token_expires_at: string | null;
  refresh_token: string | null;
  refresh_token_updated_at: string | null;
}

const CONFIG_PATH = path.join(os.homedir(), ".claude", "quickbooks-config.json");

export function readConfig(): QboConfig {
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return JSON.parse(raw) as QboConfig;
}

export function writeConfig(next: QboConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
}

export function updateTokens(updates: Partial<Pick<QboConfig,
  "realm_id" | "access_token" | "access_token_expires_at" | "refresh_token" | "refresh_token_updated_at"
>>): QboConfig {
  const current = readConfig();
  const next = { ...current, ...updates };
  writeConfig(next);
  return next;
}

export function apiBase(cfg: QboConfig): string {
  return cfg.environment === "production" ? cfg.api_base_production : cfg.api_base_sandbox;
}

export function isConnected(cfg: QboConfig): boolean {
  return Boolean(cfg.realm_id && cfg.refresh_token);
}
