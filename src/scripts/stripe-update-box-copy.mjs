/**
 * Updates Uncle May's box product descriptions in Stripe (Wednesday delivery, Tuesday cutoff).
 * Reads API key from STRIPE_API_KEY env or ~/.claude/stripe-config.json (not committed).
 * Run: node src/scripts/stripe-update-box-copy.mjs
 * Dry run: node src/scripts/stripe-update-box-copy.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry-run");

const DESCRIPTIONS = {
  starter: `Seasonal spring and summer produce from Black farmers, delivered fresh to your door. The Starter Box brings you the best of what's growing right now. Perfect for 1-2 people.\n\nWhat's inside (current rotation):\n- Collard greens — 1 bunch\n- Asparagus — 1 lb\n- Spring onions — 1 bunch\n- Heirloom cherry tomatoes — 1 pint\n- Persian cucumbers — 4 ct\n- Snap peas — 1/2 lb\n\nChicago delivery on Wednesdays. Order by Tuesday night. ~12-15 lbs. Contents rotate based on seasonal availability.`,
  family: `Feeds a family of 4 with seasonal produce and protein. The Family Box includes 10 seasonal produce items plus pasture-raised whole chicken. Sourced directly from Black-owned farms.\n\nWhat's inside (current rotation):\n- Collard greens — 2 bunches\n- Asparagus — 1.5 lb\n- Spring onions — 2 bunches\n- Heirloom cherry tomatoes — 1 pint\n- Persian cucumbers — 6 ct\n- Snap peas — 1 lb\n- Rainbow chard — 1 bunch\n- Strawberries — 1 quart\n- Early beets with tops — 1 bunch\n- Zucchini — 2 ct\n- Farm eggs — 1 dozen\n- Pasture-raised whole chicken — included\n\nChicago delivery on Wednesdays. Order by Tuesday night. ~22-26 lbs. Produce contents rotate based on seasonal availability.`,
  community: `Specialty and heirloom varieties for the adventurous cook. The Community Box features 10 unique seasonal items plus your choice of premium protein. Perfect for large families or splitting across households.\n\nWhat's inside (current rotation):\n- Watermelon radishes — 1 bunch\n- Fairy tale eggplant — 1/2 lb\n- Shishito peppers — 1/2 lb\n- Hakurei turnips with greens — 1 bunch\n- Sunburst cherry tomatoes — 1 pint\n- Pattypan squash — 1/2 lb\n- Dragon tongue beans — 1/2 lb\n- Rainbow chard — 1 bunch\n- Heirloom cucumber — 2 ct\n- Ramps — 1/2 lb\n- Farm eggs — 1 dozen\n- Your choice of protein: pasture-raised whole chicken, heritage pork chops, grass-fed beef short ribs, or wild-caught salmon\n\nChicago delivery on Wednesdays. Order by Tuesday night. ~30-35 lbs. Produce contents rotate based on seasonal availability.`,
};

/** Shown on Payment Link checkout above the pay button */
const PAYMENT_LINK_SUBMIT_MESSAGE = `Chicago delivery on Wednesdays. Order by Tuesday night when you can for this week's route.`;

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
  // Match by actual Stripe product names
  if (/\bstarter\b/.test(n) && /\bbox\b/.test(n)) return "starter";
  if (/\bessentials\b/.test(n) && /\bbox\b/.test(n)) return "starter"; // legacy name before rename
  if (/\bfamily\b/.test(n) && /\bbox\b/.test(n)) return "family";
  if (/\bcommunity\b/.test(n) && /\bbox\b/.test(n)) return "community";
  if (/\bpremium\b/.test(n) && /\bbox\b/.test(n)) return "community"; // legacy name before rename
  if (n.includes("starter") && (n.includes("35") || n.includes("$35"))) return "starter";
  if (n.includes("family") && (n.includes("65") || n.includes("$65"))) return "family";
  if (n.includes("community") && (n.includes("95") || n.includes("$95"))) return "community";
  return null;
}

async function main() {
  const secret = loadKey();
  const list = await stripeForm(
    "GET",
    "https://api.stripe.com/v1/products?limit=100&active=true",
    secret
  );

  const products = list.data || [];
  console.log(`Found ${products.length} active products.`);

  const matched = [];
  for (const p of products) {
    const tier = classifyProduct(p.name);
    if (!tier) continue;
    const desc = DESCRIPTIONS[tier];
    if (desc == null) {
      console.log(`[hold] ${p.name} (${tier}) — update held pending ops confirmation`);
      continue;
    }
    matched.push({ id: p.id, name: p.name, tier, description: desc, needsUpdate: p.description !== desc });
  }

  if (matched.length === 0) {
    console.log("No matching Starter/Family/Community box products found by name.");
    console.log("Product names in Stripe:");
    for (const p of products) console.log(`  - ${p.id}: ${p.name}`);
    process.exit(0);
  }

  for (const m of matched) {
    if (!m.needsUpdate) {
      console.log(`[skip] ${m.id} ${m.name} (description already matches)`);
      continue;
    }
    console.log(`${DRY ? "[dry-run] " : ""}Update product ${m.tier}: ${m.id} "${m.name}"`);
    if (!DRY) {
      await stripeForm("POST", `https://api.stripe.com/v1/products/${m.id}`, secret, {
        description: m.description,
      });
      console.log(`  OK`);
    }
  }

  const boxProductIds = new Set(matched.map((m) => m.id));

  const plList = await stripeForm(
    "GET",
    "https://api.stripe.com/v1/payment_links?limit=50&active=true",
    secret
  );
  const links = plList.data || [];
  const linkUpdates = [];
  for (const pl of links) {
    const full = await stripeForm(
      "GET",
      `https://api.stripe.com/v1/payment_links/${pl.id}?expand[]=line_items.data.price.product`,
      secret
    );
    const li = full.line_items?.data?.[0];
    const prod = li?.price?.product;
    const pid = typeof prod === "object" ? prod?.id : prod;
    if (!pid || !boxProductIds.has(pid)) continue;
    if (full.custom_text?.submit?.message === PAYMENT_LINK_SUBMIT_MESSAGE) {
      console.log(`[skip] payment_link ${pl.id} (submit message already set)`);
      continue;
    }
    linkUpdates.push({ id: pl.id, url: pl.url, productId: pid });
  }

  for (const l of linkUpdates) {
    console.log(`${DRY ? "[dry-run] " : ""}Payment link ${l.id} (${l.url})`);
    if (!DRY) {
      await stripeForm("POST", `https://api.stripe.com/v1/payment_links/${l.id}`, secret, {
        "custom_text[submit][message]": PAYMENT_LINK_SUBMIT_MESSAGE,
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
