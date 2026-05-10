import { readConfig, isConnected } from "@/lib/quickbooks/config";
import { qboFetch } from "@/lib/quickbooks/client";

export const dynamic = "force-dynamic";

interface CompanyInfoResponse {
  CompanyInfo?: {
    CompanyName?: string;
    LegalName?: string;
    CompanyAddr?: { City?: string; CountrySubDivisionCode?: string };
    FiscalYearStartMonth?: string;
  };
}

async function fetchCompanyInfo(realmId: string): Promise<CompanyInfoResponse["CompanyInfo"] | null> {
  try {
    const res = await qboFetch<CompanyInfoResponse>(`/companyinfo/${realmId}`);
    return res.CompanyInfo ?? null;
  } catch {
    return null;
  }
}

export default async function QuickBooksAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; disconnected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const cfg = readConfig();
  const connected = isConnected(cfg);
  const company = connected && cfg.realm_id ? await fetchCompanyInfo(cfg.realm_id) : null;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>QuickBooks Online</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Environment: <strong>{cfg.environment}</strong> · Scopes: {cfg.scopes.join(", ")}
      </p>

      {params.connected && (
        <div style={{ background: "#e6f7ed", border: "1px solid #9bd2b3", padding: 12, marginBottom: 16, borderRadius: 6 }}>
          Connected to QuickBooks. Realm ID stored, tokens persisted.
        </div>
      )}
      {params.disconnected && (
        <div style={{ background: "#fff7e6", border: "1px solid #f0c97a", padding: 12, marginBottom: 16, borderRadius: 6 }}>
          Disconnected. Tokens revoked at Intuit and cleared locally.
        </div>
      )}
      {params.error && (
        <div style={{ background: "#fdecec", border: "1px solid #e9a3a3", padding: 12, marginBottom: 16, borderRadius: 6 }}>
          Error: {params.error}
        </div>
      )}

      <section style={{ border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Connection Status</h2>
        {connected ? (
          <>
            <p>
              <strong>Connected.</strong> Realm ID: <code>{cfg.realm_id}</code>
            </p>
            {company && (
              <p style={{ marginTop: 8 }}>
                Company: <strong>{company.CompanyName ?? company.LegalName ?? "(no name)"}</strong>
                {company.CompanyAddr?.City ? ` · ${company.CompanyAddr.City}, ${company.CompanyAddr.CountrySubDivisionCode}` : ""}
                {company.FiscalYearStartMonth ? ` · FY starts ${company.FiscalYearStartMonth}` : ""}
              </p>
            )}
            <p style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
              Access token expires: {cfg.access_token_expires_at ? new Date(cfg.access_token_expires_at).toLocaleString() : "—"}
              <br />
              Refresh token last rotated: {cfg.refresh_token_updated_at ? new Date(cfg.refresh_token_updated_at).toLocaleString() : "—"}
            </p>
            <form action="/api/quickbooks/disconnect" method="post" style={{ marginTop: 16 }}>
              <button type="submit" style={{ background: "#c0392b", color: "white", border: 0, padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}>
                Disconnect
              </button>
            </form>
          </>
        ) : (
          <>
            <p>Not connected to a QuickBooks Online company yet.</p>
            <a
              href="/api/quickbooks/connect"
              style={{ display: "inline-block", background: "#2ca01c", color: "white", padding: "10px 18px", borderRadius: 4, textDecoration: "none", marginTop: 8 }}
            >
              Connect to QuickBooks
            </a>
          </>
        )}
      </section>
    </main>
  );
}
