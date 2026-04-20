import { schedules, task } from "@trigger.dev/sdk/v3";
import { createHash } from "crypto";
import { uploadGoogleAdsConversion } from "./google-ads-conversion-tracking";

const MAILCHIMP_DC = "us19";
const MAILCHIMP_LIST_ID = "2645503d11";
const CUSTOMER_TAG = "Customers";
const POLL_WINDOW_SECONDS = 9000; // 2.5h — covers 2h cron interval with overlap

function md5(s: string) {
  return createHash("md5").update(s).digest("hex");
}

// --- Stripe ---

async function fetchCompletedSessions(stripeKey: string, since: number) {
  const all: any[] = [];
  let lastId: string | null = null;

  while (true) {
    let url = `https://api.stripe.com/v1/checkout/sessions?status=complete&limit=100&created[gte]=${since}`;
    if (lastId) url += `&starting_after=${lastId}`;

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${btoa(stripeKey + ":")}` },
    });
    const data = await res.json();
    const batch: any[] = data.data || [];
    all.push(...batch);

    if (!data.has_more || batch.length === 0) break;
    lastId = batch[batch.length - 1].id;
  }
  return all;
}

// --- Mailchimp ---

async function upsertMailchimpCustomer(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const emailHash = md5(email.toLowerCase());
  const authHeader = `Basic ${btoa("anystring:" + apiKey)}`;

  const body: any = { email_address: email, status_if_new: "subscribed" };
  const mergeFields: any = {};
  if (name.first) mergeFields.FNAME = name.first;
  if (name.last) mergeFields.LNAME = name.last;
  if (Object.keys(mergeFields).length > 0) body.merge_fields = mergeFields;

  const upsertRes = await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`,
    {
      method: "PUT",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const member = await upsertRes.json();

  // Apply customers tag
  await fetch(
    `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}/tags`,
    {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: [{ name: CUSTOMER_TAG, status: "active" }] }),
    }
  );

  return { id: member.id, status: member.status };
}

// --- Apollo ---

async function upsertApolloCustomer(
  apiKey: string,
  email: string,
  name: { first?: string; last?: string }
) {
  const headers = { "Content-Type": "application/json", "X-Api-Key": apiKey };

  const searchRes = await fetch("https://api.apollo.io/api/v1/contacts/search", {
    method: "POST",
    headers,
    body: JSON.stringify({ q_keywords: email, page: 1, per_page: 1 }),
  });
  const searchData = await searchRes.json();
  const existing = searchData.contacts?.[0];

  if (existing) {
    const labels: string[] = existing.label_names || [];
    if (!labels.includes(CUSTOMER_TAG)) {
      await fetch(`https://api.apollo.io/api/v1/contacts/${existing.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ label_names: [...labels, CUSTOMER_TAG] }),
      });
    }
    return { action: "tagged", id: existing.id };
  }

  const createRes = await fetch("https://api.apollo.io/api/v1/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      first_name: name.first || "",
      last_name: name.last || "",
      label_names: [CUSTOMER_TAG],
    }),
  });
  const created = await createRes.json();
  return { action: "created", id: created.contact?.id };
}

// --- Core processing logic ---

async function processCompletedPurchases(
  stripeKey: string,
  apolloKey: string,
  mailchimpKey: string,
  since: number
) {
  const sessions = await fetchCompletedSessions(stripeKey, since);

  const withEmail = sessions.filter(
    (s: any) => s.customer_details?.email || s.customer_email
  );

  console.log(`Completed sessions: ${sessions.length}, with email: ${withEmail.length}`);

  const results: any[] = [];
  for (const session of withEmail) {
    const email = (session.customer_details?.email || session.customer_email).toLowerCase();
    const fullName: string = session.customer_details?.name || "";
    const nameParts = fullName.trim().split(/\s+/);
    const name = {
      first: nameParts[0] || "",
      last: nameParts.slice(1).join(" ") || "",
    };

    const [mc, apollo, gads] = await Promise.allSettled([
      upsertMailchimpCustomer(mailchimpKey, email, name),
      upsertApolloCustomer(apolloKey, email, name),
      // Trigger Google Ads conversion upload
      uploadGoogleAdsConversion.trigger({
        email,
        orderId: session.id,
        value: session.amount_total || 0,
        currency: session.currency || "usd",
        timestamp: session.created,
      }),
    ]);

    results.push({
      email,
      amountCents: session.amount_total,
      sessionId: session.id,
      mailchimp: mc.status === "fulfilled" ? mc.value : { error: (mc as any).reason?.message },
      apollo: apollo.status === "fulfilled" ? apollo.value : { error: (apollo as any).reason?.message },
      googleAds: gads.status === "fulfilled" ? gads.value : { error: (gads as any).reason?.message },
    });
  }

  return {
    polledSessions: sessions.length,
    withEmail: withEmail.length,
    processed: results.length,
    results,
  };
}

// --- Scheduled task: runs every 2 hours ---

export const stripePurchaseSync = schedules.task({
  id: "stripe-purchase-sync",
  cron: "0 */2 * * *",
  run: async () => {
    const since = Math.floor(Date.now() / 1000) - POLL_WINDOW_SECONDS;
    return processCompletedPurchases(
      process.env.STRIPE_API_KEY!,
      process.env.APOLLO_API_KEY!,
      process.env.MAILCHIMP_API_KEY!,
      since
    );
  },
});

// --- Manual backfill task ---

export const backfillStripePurchases = task({
  id: "backfill-stripe-purchases",
  run: async (payload?: { lookbackHours?: number }) => {
    const hours = payload?.lookbackHours ?? 720; // default: 30 days to catch all existing customers
    const since = Math.floor(Date.now() / 1000) - hours * 3600;
    return processCompletedPurchases(
      process.env.STRIPE_API_KEY!,
      process.env.APOLLO_API_KEY!,
      process.env.MAILCHIMP_API_KEY!,
      since
    );
  },
});
