/**
 * Sets Payment Link success redirect to https://unclemays.com/order-success
 * for active links that sell Starter / Family / Community box products.
 *
 * Run: node src/scripts/stripe-sync-success-redirect.mjs
 * Dry run: node src/scripts/stripe-sync-success-redirect.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry-run");
const SUCCESS_URL = "https://unclemays.com/order-success";

function loadKey() {
  if (process.env.STRIPE_API_KEY) return process.env.STRIPE_API_KEY.trim();
  const p = path.join(process.env.USERPROFILE || process.env.HOME, ".claude", "stripe-config.json");
  const raw = fs.readFileSync(p, "utf8");
  const j = JSON.parse(raw);
  if (!j.api_key) throw new Error("No api_key in stripe-config.json");
  return j.api_key.trim();
}

function authHeader(secret) {
  return "Basic " + Buffer.from(`${secret}:`).toString("base64");
}

async function stripeForm(method, url, secret, body) {
  const headers = { Authorization: authHeader(secret) };
  const init = { method, headers };
  if (body && method !== "GET") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = new URLSearchParams(body).toString();
  }
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }
  return data;
}

function classifyProduct(name) {
  const n = (name || "").toLowerCase();
  if (/\bstarter\b/.test(n) && /\bbox\b/.test(n)) return true;
  if (/\bfamily\b/.test(n) && /\bbox\b/.test(n)) return true;
  if (/\bcommunity\b/.test(n) && /\bbox\b/.test(n)) return true;
  if (n.includes("starter") && (n.includes("35") || n.includes("$35"))) return true;
  if (n.includes("family") && (n.includes("65") || n.includes("$65"))) return true;
  if (n.includes("community") && (n.includes("95") || n.includes("$95"))) return true;
  return false;
}

async function main() {
  const secret = loadKey();
  const list = await stripeForm("GET", "https://api.stripe.com/v1/products?limit=100&active=true", secret);
  const boxProductIds = new Set();
  for (const p of list.data || []) {
    if (classifyProduct(p.name)) boxProductIds.add(p.id);
  }
  if (boxProductIds.size === 0) {
    console.error("No Starter/Family/Community box products found.");
    process.exit(1);
  }
  console.log(`Box product IDs: ${[...boxProductIds].join(", ")}`);

  const plList = await stripeForm("GET", "https://api.stripe.com/v1/payment_links?limit=50&active=true", secret);
  const toFix = [];

  for (const pl of plList.data || []) {
    const full = await stripeForm(
      "GET",
      `https://api.stripe.com/v1/payment_links/${pl.id}?expand[]=line_items.data.price.product`,
      secret
    );
    const li = full.line_items?.data?.[0];
    const prod = li?.price?.product;
    const pid = typeof prod === "object" ? prod?.id : prod;
    if (!pid || !boxProductIds.has(pid)) continue;

    const ac = full.after_completion;
    const current =
      ac?.type === "redirect" && ac.redirect?.url ? ac.redirect.url : null;
    if (current === SUCCESS_URL) {
      console.log(`[skip] ${pl.id} already -> ${SUCCESS_URL}`);
      continue;
    }
    toFix.push({ id: pl.id, url: pl.url, current: current || `(type=${ac?.type || "?"})` });
  }

  if (toFix.length === 0) {
    console.log("No box payment links needed redirect updates.");
    return;
  }

  for (const x of toFix) {
    console.log(`${DRY ? "[dry-run] " : ""}${x.id} ${x.url}`);
    console.log(`  from: ${x.current}`);
    console.log(`  to:   ${SUCCESS_URL}`);
    if (!DRY) {
      await stripeForm("POST", `https://api.stripe.com/v1/payment_links/${x.id}`, secret, {
        "after_completion[type]": "redirect",
        "after_completion[redirect][url]": SUCCESS_URL,
      });
      console.log(`  OK`);
    }
  }

  if (DRY) console.log("\nDry run only. Run without --dry-run to apply.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
