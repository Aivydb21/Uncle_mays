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
  starter: `The freshest roots in Hyde Park. Every Starter Box is curated directly from a Black-owned farm that takes quality personally. You're getting sweet potatoes with real depth of flavor, crisp Candy orange carrots that taste like they were pulled yesterday, and farm-cut salad greens ready for tonight. This is what produce is supposed to look like, taste like, and come from.\n\nWhat's inside:\n- 3 lb sweet potatoes, honey-sweet and versatile; roast them, mash them, or keep them whole\n- 2 lb Carola potatoes, farm-select, buttery, all-purpose, and picked to order\n- 2 lb Candy orange carrots, vibrant, naturally sweet, and crisp all the way through\n- 1 bunch green curly kale, farm-fresh and ready for the pan, the pot, or the blender\n- 5 oz fresh salad mix, cut and packed ready to dress\n\nChicago delivery on Wednesdays. Order by Tuesday night. ~12-15 lbs.`,
  // Family Box inventory confirmed by board via UNC-159.
  family: `Sunday dinner starts here. The Family Box is built for the table where the food is always real and everyone comes back for seconds. Sourced directly from a Black-owned farm, it brings together roots, stacked greens, a dozen farm eggs, and your choice of protein. Everything you need to cook a full, intentional meal.\n\nWhat's inside:\n- 4 lb sweet potatoes, the anchor of any great spread\n- 2 lb Carola potatoes, farm-select, buttery all-purpose potatoes for any preparation\n- 2 lb Candy orange carrots, vibrant, sweet, and crisp\n- 1 bunch green curly kale, hearty and ready for anything\n- 1 lb Tuscan kale, rich, deep, and beautiful in any braise or saute\n- 1 lb rainbow chard, colorful, tender, and versatile\n- Fresh salad mix, ready to dress and serve\n- 1 dozen farm eggs\n- Your choice of protein: whole chicken, beef short ribs, or lamb chops\n\nChicago delivery on Wednesdays. Order by Tuesday night. ~22-26 lbs.`,
  community: `The full harvest, from one Black farm. The Community Box is for the cook who stocks her kitchen with intention: real roots, stacked greens, two kinds of pantry beans, and a premium protein, all sourced from a Black-owned farm. Four stunning greens. Organic pinto and black turtle beans. Your choice of whole chicken, beef short ribs, or lamb chops. This is the box you build an entire week of meals around.\n\nWhat's inside:\n- 4 lb sweet potatoes, the foundation of a full week of cooking\n- 3 lb Carola potatoes, farm-select, buttery, hand-selected, and ready for anything\n- 2 lb Candy orange carrots, sweet, vibrant, and crisp\n- 1 bunch green curly kale, farm-fresh and versatile\n- 1 lb Tuscan kale, rich and hearty, built for braising\n- 1 lb rainbow chard, colorful, tender, and beautiful in any dish\n- Fresh salad mix, cut and ready to serve\n- 1 lb organic pinto beans, pantry gold, sourced right\n- 1 bag organic black turtle beans, earthy, rich, and endlessly useful\n- Your choice of protein: whole chicken, beef short ribs, or lamb chops\n\nChicago delivery on Wednesdays. Order by Tuesday night. ~30-35 lbs.`,
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
