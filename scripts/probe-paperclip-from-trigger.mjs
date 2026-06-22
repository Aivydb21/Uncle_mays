import { envvars, configure } from "@trigger.dev/sdk/v3";
configure({ secretKey: process.env.TRIGGER_SECRET_KEY });
const projectRef = "proj_mgkoedwrgnjwbckanbbx";
const list = await envvars.list(projectRef, "prod");
const env = Object.fromEntries(list.map((e) => [e.name, e.value]));
const url = env.PAPERCLIP_API_URL;
const key = env.PAPERCLIP_API_KEY;
const companyId = env.PAPERCLIP_COMPANY_ID;

// Try a benign GET first
const meRes = await fetch(`${url}/agents/me`, {
  headers: { Authorization: `Bearer ${key}` },
});
console.log("GET /agents/me:", meRes.status, (await meRes.text()).slice(0, 300));

// Try a POST that mirrors the actual call
const issueRes = await fetch(`${url}/companies/${companyId}/issues`, {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "[probe] UNC-1336 diagnostic — paperclip-write path test",
    description: "Probe issue to test whether Trigger.dev credentials can reach Paperclip. Cancel immediately.",
    status: "cancelled",
    priority: "low",
  }),
});
console.log("POST /companies/.../issues:", issueRes.status, (await issueRes.text()).slice(0, 500));
