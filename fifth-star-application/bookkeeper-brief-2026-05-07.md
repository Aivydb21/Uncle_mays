# Bookkeeper Brief: QBO Realm Switched from Sandbox to Production

**Date:** 2026-05-07
**Priority:** high
**Owner:** Bookkeeper agent (Paperclip)
**Sign-off required from:** Anthony Ivy on items 2 and 4 before any journal entry is posted

## Background

Until 2026-05-07, the QuickBooks Online connection in `~/.claude/quickbooks-config.json` pointed at Intuit's auto-issued sandbox demo company:

- `environment: "sandbox"`
- `realm_id: 9341457029008895` (Intuit's "Sandbox Company US 3209" dummy)
- Sandbox client_id/secret

Any prior bookkeeping work (journal entries, account creation, transaction syncs, report pulls) happened inside that sandbox realm. **None of it is recoverable, none of it is reflected in real Uncle May's books, and none of it should be migrated**: sandbox companies are owned by Intuit, get rotated periodically, and cannot be cross-referenced from production. Treat all sandbox-era work as throwaway.

## Current production state

The OAuth flow has been completed against the real QBO Simple Start company. The config now contains:

- `environment: "production"`
- `realm_id: 9341457028491148` (Uncle Mays Produce Inc, legal name same, country US, fiscal year starts January, created 2026-05-05)
- New production `client_id: ABVurpoillkUWGYCufQZcHg602mdXZB28mLFfLWNH5Avh6go5v`
- Fresh access + refresh tokens (rotated 2026-05-07, refresh expires in ~101 days)

Verified by `GET /v3/company/9341457028491148/companyinfo/9341457028491148` returning `Uncle Mays Produce Inc`.

## What is in the real books today

Pulled 2026-05-07 to [reports/quickbooks/](../reports/quickbooks/):

- **Income Statement (P&L) 2026-01-01 to 2026-05-07:** $0 income, $0 expenses, $0 net income.
- **Balance Sheet:** Total assets $6,089.90 (single bank account "x4738 - UNCLE MAY'S PRODUCE INC - 1"); total liabilities $0; equity $6,089.90 sitting entirely in "Opening Balance Equity"; retained earnings $0; net income $0.
- **Cash Flow:** Operating $0, Investing $0, Financing $6,089.90, Net change $6,089.90.

The bank feed has connected and reported its current balance, but no individual transactions are categorized. Stripe is not connected. There is no chart of accounts beyond the QBO defaults. The $6,089.90 in Opening Balance Equity is QBO's auto-created placeholder for the bank balance at connection time and must be reclassified.

## Tasks, in priority order

### 1. Confirm production realm access

Re-read `~/.claude/quickbooks-config.json`, call `GET /v3/company/{realm_id}/companyinfo/{realm_id}` against `api_base_production`, confirm response shows `Uncle Mays Produce Inc`. If access fails, escalate to Anthony — do not retry against sandbox.

### 2. Propose a DTC-grocery chart of accounts (sign-off required)

Draft a chart of accounts that fits the actual business model (DTC grocery delivery boxes, hyperlocal Black-owned farm sourcing, Stripe primary payment processor, Trigger.dev/Resend/Vercel infra, Meta + Google Ads paid acquisition). Recommended top-level structure:

- **Revenue:** subscription orders, one-time orders, delivery fee revenue
- **COGS:** produce wholesale (RAB Pembroke), protein landed cost, packaging, last-mile delivery, Stripe processing
- **OpEx:** ads (Meta, Google), infrastructure/SaaS (Trigger.dev, Resend, Vercel, Mailchimp, Apollo, Canva, Firecrawl), professional services (legal, bookkeeping), salaries (when applicable), promo amortization (FRESH10), software subscriptions, other
- **Equity:** Owner Contribution, Retained Earnings, (eventually) SAFE Notes Payable

Post the proposed chart of accounts as a comment on this brief (or a Paperclip subtask) and tag Anthony for sign-off **before** creating any accounts in QBO.

### 3. Confirm or install QBO's "Connect to Stripe" first-party app

Touching financial infra requires board approval per the standing order in `um_website/CLAUDE.md`. Before installing the connector:

- Check whether it is already installed under Apps in QBO.
- If not installed, file a board approval request (`POST /api/companies/{companyId}/approvals` with `type: "request_board_approval"`) describing: what gets installed (Intuit's first-party Stripe sync), what data flows (Stripe charges, refunds, payouts, processing fees → QBO journal entries), expected cost (free), rollback plan (uninstall + revoke).
- Do not install until the approval resolves.

### 4. Reclassify the $6,089.90 Opening Balance Equity (sign-off required)

The current $6,089.90 in Opening Balance Equity is a placeholder that must be reclassified to whatever it actually represents (most likely Owner Contribution from Anthony's personal funds, but possibly a transfer from a prior business account). **Do not assume.** Post a comment on this brief asking Anthony for the source of the $6,089.90 opening bank balance and the desired equity classification before posting the reclass JE.

### 5. Lay out a backfill plan for historical Stripe activity

Once the Stripe connector is approved and installed, design a plan to ingest historical Stripe transactions covering the period from launch through 2026-05-07. Output as a written plan (not yet executed) covering:

- Date range to backfill
- How the connector handles historical vs go-forward (most QBO-Stripe connectors only sync forward by default; historical may need manual import)
- Categorization rules to apply (mapping Stripe charge metadata → revenue accounts)
- How to reconcile Stripe gross vs Stripe net vs QBO bank deposits
- Estimated journal entry volume

Tag Anthony for review before executing.

## Out of scope for this brief

- Migrating any data from the sandbox realm (impossible and not desired).
- Setting up payroll, AP, AR, fixed assets, or inventory until #1–#5 are complete.
- Producing investor-grade financial statements until #2–#5 land. The current pulled statements are technically valid but operationally empty; flagging that to Anthony before any external sharing.

## Links

- Saved reports: [reports/quickbooks/profit-and-loss.json](../reports/quickbooks/profit-and-loss.json), [balance-sheet.json](../reports/quickbooks/balance-sheet.json), [cash-flow.json](../reports/quickbooks/cash-flow.json)
- QBO config: `~/.claude/quickbooks-config.json`
- Standing order on financial infrastructure: `um_website/CLAUDE.md` (the "Marketing & Advertising Infrastructure" block applies analogously to financial infra; if there is any ambiguity, escalate)
