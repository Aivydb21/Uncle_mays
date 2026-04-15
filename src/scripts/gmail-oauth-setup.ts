/**
 * Gmail OAuth Setup Script
 *
 * Generates a refresh token for the Trigger.dev daily report task.
 *
 * Prerequisites:
 *   1. Google Cloud project with Gmail API enabled
 *   2. OAuth 2.0 Client ID (Desktop app type)
 *
 * Usage:
 *   npx tsx src/scripts/gmail-oauth-setup.ts <client_id> <client_secret>
 */

import http from "node:http";
import { URL } from "node:url";

const CLIENT_ID = process.argv[2];
const CLIENT_SECRET = process.argv[3];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log(`
Gmail OAuth Setup for Trigger.dev Daily Report
===============================================

Usage: npx tsx src/scripts/gmail-oauth-setup.ts <client_id> <client_secret>

Steps to get your Client ID and Secret:
1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Enable the Gmail API:
   - APIs & Services > Library > search "Gmail API" > Enable
4. Configure OAuth consent screen:
   - APIs & Services > OAuth consent screen
   - User type: Internal (if Workspace) or External
   - Add scope: https://www.googleapis.com/auth/gmail.send
   - Add yourself as a test user (if External)
5. Create OAuth credentials:
   - APIs & Services > Credentials > Create Credentials > OAuth client ID
   - Application type: Desktop app
   - Copy the Client ID and Client Secret

Then run this script again with those values.
  `);
  process.exit(1);
}

const REDIRECT_URI = "http://localhost:3847/callback";
const SCOPES = "https://www.googleapis.com/auth/gmail.send";

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent(SCOPES)}&` +
  `access_type=offline&` +
  `prompt=consent`;

console.log("\n1. Opening browser for Google sign-in...\n");
console.log("   If the browser doesn't open, go to this URL:\n");
console.log(`   ${authUrl}\n`);

// Open browser
import("child_process").then((cp) => {
  cp.exec(`start "" "${authUrl}"`);
});

// Start local server to catch the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:3847`);

  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<h1>Error: ${error}</h1><p>Please try again.</p>`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>No authorization code received</h1>");
    return;
  }

  // Exchange code for tokens
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h1>Token Error</h1><p>${tokens.error_description}</p>`);
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <h1 style="color: green;">Success!</h1>
      <p>You can close this window and return to your terminal.</p>
    `);

    console.log("\n===========================================");
    console.log("  Gmail OAuth Setup Complete!");
    console.log("===========================================\n");
    console.log("Set these environment variables in Trigger.dev:\n");
    console.log(`  GMAIL_CLIENT_ID     = ${CLIENT_ID}`);
    console.log(`  GMAIL_CLIENT_SECRET = ${CLIENT_SECRET}`);
    console.log(`  GMAIL_REFRESH_TOKEN = ${tokens.refresh_token}`);
    console.log(`\nAlso set these (you already have the values):\n`);
    console.log(`  STRIPE_API_KEY  = (your sk_live_... key)`);
    console.log(`  APOLLO_API_KEY  = (your Apollo key)`);
    console.log(`  REPORT_EMAIL    = anthony@unclemays.com`);
    console.log("\nDashboard: https://cloud.trigger.dev/projects/v3/proj_mgkoedwrgnjwbckanbbx\n");

    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h1>Error exchanging code</h1><p>${err}</p>`);
    server.close();
    process.exit(1);
  }
});

server.listen(3847, () => {
  console.log("2. Waiting for Google callback on http://localhost:3847 ...\n");
});
