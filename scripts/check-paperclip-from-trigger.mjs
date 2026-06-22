// Quick check: can the script reach the Paperclip API using the same envs as Trigger.dev?
const apiUrl = process.env.PAPERCLIP_API_URL;
const apiKey = process.env.PAPERCLIP_API_KEY;
const companyId = process.env.PAPERCLIP_COMPANY_ID;
console.log("PAPERCLIP_API_URL:", apiUrl || "(unset)");
console.log("PAPERCLIP_API_KEY:", apiKey ? `(${apiKey.length} chars, prefix=${apiKey.slice(0,8)}...)` : "(unset)");
console.log("PAPERCLIP_COMPANY_ID:", companyId || "(unset)");
console.log("PAPERCLIP_CTO_AGENT_ID:", process.env.PAPERCLIP_CTO_AGENT_ID || "(unset)");
