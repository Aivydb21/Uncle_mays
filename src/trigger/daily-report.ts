import { schedules, task } from "@trigger.dev/sdk/v3";

// --- Configuration ---

// Daily report recipients. Gmail accepts comma-separated addresses in the To: header
// per RFC 2822. To temporarily send to a single recipient (e.g. for testing), set
// the REPORT_EMAIL env var and it will override this list.
const DAILY_REPORT_RECIPIENTS = [
  "anthony@unclemays.com",
  "peter@unclemays.com",
  "joe.harwood@kellogg.northwestern.edu",
].join(", ");

// --- API helpers ---

async function fetchStripeBalance(apiKey: string) {
  const res = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Basic ${btoa(apiKey + ":")}` },
  });
  return res.json();
}

async function fetchStripeCharges(apiKey: string, since: number) {
  const res = await fetch(
    `https://api.stripe.com/v1/charges?limit=15&created[gte]=${since}`,
    { headers: { Authorization: `Basic ${btoa(apiKey + ":")}` } }
  );
  return res.json();
}

async function fetchStripePayouts(apiKey: string) {
  const res = await fetch("https://api.stripe.com/v1/payouts?limit=5", {
    headers: { Authorization: `Basic ${btoa(apiKey + ":")}` },
  });
  return res.json();
}

async function fetchApolloAccounts(apiKey: string) {
  const res = await fetch("https://api.apollo.io/api/v1/email_accounts", {
    headers: { "X-Api-Key": apiKey },
  });
  return res.json();
}

async function fetchApolloCampaigns(apiKey: string) {
  const res = await fetch(
    "https://api.apollo.io/api/v1/emailer_campaigns/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        page: 1,
        per_page: 20,
        sort_by_key: "campaign_last_activity",
        sort_ascending: false,
      }),
    }
  );
  return res.json();
}

async function fetchMailchimpCampaigns(apiKey: string) {
  const dc = apiKey.split("-")[1] || "us19";
  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/campaigns?count=5&sort_field=send_time&sort_dir=DESC`,
    { headers: { Authorization: `Basic ${btoa("anystring:" + apiKey)}` } }
  );
  return res.json();
}

async function fetchMailchimpReports(apiKey: string, campaignIds: string[]) {
  const dc = apiKey.split("-")[1] || "us19";
  const reports = await Promise.all(
    campaignIds.map(async (id) => {
      const res = await fetch(
        `https://${dc}.api.mailchimp.com/3.0/reports/${id}`,
        { headers: { Authorization: `Basic ${btoa("anystring:" + apiKey)}` } }
      );
      return res.json();
    })
  );
  return reports;
}

async function fetchMailchimpList(apiKey: string, listId: string) {
  const dc = apiKey.split("-")[1] || "us19";
  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${listId}`,
    { headers: { Authorization: `Basic ${btoa("anystring:" + apiKey)}` } }
  );
  return res.json();
}

async function fetchMetaCampaignStats(
  accessToken: string,
  campaignId: string
): Promise<any> {
  const baseUrl = "https://graph.facebook.com/v21.0";

  // Fetch campaign details
  const campaignFields = "id,name,status,daily_budget,effective_status,configured_status";
  const campaignRes = await fetch(
    `${baseUrl}/${campaignId}?fields=${campaignFields}&access_token=${accessToken}`
  );
  const campaign = await campaignRes.json();

  // Fetch 24h insights
  const insightsFields = [
    "campaign_id",
    "campaign_name",
    "spend",
    "impressions",
    "reach",
    "frequency",
    "clicks",
    "actions",
    "cost_per_action_type",
    "action_values",
  ].join(",");

  const insights24hRes = await fetch(
    `${baseUrl}/${campaignId}/insights?fields=${insightsFields}&date_preset=yesterday&level=campaign&access_token=${accessToken}`
  );
  const insights24h = await insights24hRes.json();

  // Fetch 7d insights
  const insights7dRes = await fetch(
    `${baseUrl}/${campaignId}/insights?fields=${insightsFields}&date_preset=last_7d&level=campaign&access_token=${accessToken}`
  );
  const insights7d = await insights7dRes.json();

  return { campaign, insights24h, insights7d };
}

function extractActionValue(actions: any[] | undefined, actionType: string): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseInt(action.value, 10) : 0;
}

function formatMetaStats(data: any) {
  const { campaign, insights24h, insights7d } = data;

  const data24h = insights24h?.data?.[0] || {};
  const data7d = insights7d?.data?.[0] || {};

  const spend24h = parseFloat(data24h.spend || "0");
  const impressions24h = parseInt(data24h.impressions || "0", 10);
  const reach24h = parseInt(data24h.reach || "0", 10);
  const clicks24h = parseInt(data24h.clicks || "0", 10);
  const checkouts24h = extractActionValue(data24h.actions, "omni_initiated_checkout");
  const purchases24h = extractActionValue(data24h.actions, "purchase");
  const landingPageViews24h = extractActionValue(data24h.actions, "landing_page_view");

  const spend7d = parseFloat(data7d.spend || "0");
  const checkouts7d = extractActionValue(data7d.actions, "omni_initiated_checkout");

  const cpa24h = checkouts24h > 0 ? spend24h / checkouts24h : 0;
  const cpa7dAvg = checkouts7d > 0 ? spend7d / 7 / (checkouts7d / 7) : 0;

  const campaignStatus = campaign.effective_status || "UNKNOWN";
  const dailyBudget = parseFloat(campaign.daily_budget || "0") / 100;

  const alerts: string[] = [];
  if (campaignStatus !== "ACTIVE") {
    alerts.push(`Campaign is ${campaignStatus}, not ACTIVE`);
  }
  if (spend24h === 0) {
    alerts.push("No spend in last 24 hours");
  }
  if (cpa24h > 20 && checkouts24h > 0) {
    alerts.push(`CPA $${cpa24h.toFixed(2)} exceeds target $20`);
  }
  if (spend24h > 0 && spend24h < dailyBudget * 0.5) {
    alerts.push(`Underspending - only $${spend24h.toFixed(2)} of $${dailyBudget.toFixed(2)} daily budget`);
  }

  return {
    campaignName: campaign.name || "Unknown",
    campaignStatus,
    dailyBudget,
    spend24h,
    impressions24h,
    reach24h,
    clicks24h,
    checkouts24h,
    purchases24h,
    landingPageViews24h,
    cpa24h,
    spend7dAvg: spend7d / 7,
    checkouts7dAvg: checkouts7d / 7,
    cpa7dAvg,
    alerts,
  };
}

async function sendGmail(
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
) {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    htmlBody,
  ].join("\r\n");

  const encoded = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    }
  );
  return res.json();
}

async function getGmailAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token as string;
}

// --- Formatting helpers ---

function fmtMoney(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- Build the report HTML ---

function buildReport(data: {
  apolloAccounts: any;
  apolloCampaigns: any;
  stripeBalance: any;
  stripeCharges: any;
  stripePayouts: any;
  mailchimpCampaigns: any;
  mailchimpReports: any[];
  mailchimpList: any;
  metaStats?: any;
  date: string;
}) {
  const { apolloAccounts, apolloCampaigns, stripeBalance, stripeCharges, stripePayouts, mailchimpCampaigns, mailchimpReports, mailchimpList, metaStats, date } = data;

  // Apollo accounts table
  const accounts = apolloAccounts?.email_accounts || [];
  const accountRows = accounts
    .map((a: any) => {
      const email = a.email;
      const health = a.deliverability_score?.domain_health_score || 0;
      const deliver = a.deliverability_score?.deliverability_score || 0;
      const revoked = a.revoked_at ? "Revoked" : "Active";
      return `<tr><td>${email}</td><td>${health.toFixed(1)}</td><td>${deliver.toFixed(1)}</td><td>${revoked}</td></tr>`;
    })
    .join("");

  // Apollo campaigns table (active only)
  const campaigns = (apolloCampaigns?.emailer_campaigns || []).filter((c: any) => c.active);
  const campaignRows = campaigns
    .map((c: any) => {
      const name = c.name?.substring(0, 40) || "Unnamed";
      const active = c.active ? "Yes" : "No";
      const delivered = c.unique_delivered || 0;
      const opened = c.unique_opened || 0;
      const replied = c.unique_replied || 0;
      const bounced = c.unique_bounced || 0;
      return `<tr><td>${name}</td><td>${active}</td><td>${delivered}</td><td>${opened}</td><td>${replied}</td><td>${bounced}</td></tr>`;
    })
    .join("");

  // Stripe balance
  const available = stripeBalance?.available?.[0]?.amount || 0;
  const pending = stripeBalance?.pending?.[0]?.amount || 0;

  // Stripe charges
  const charges = stripeCharges?.data || [];
  const succeeded = charges.filter((c: any) => c.status === "succeeded");
  const totalRevenue = succeeded.reduce((sum: number, c: any) => sum + c.amount, 0);
  const chargeRows = charges
    .map((c: any) => {
      const dt = fmtDate(c.created);
      const amt = fmtMoney(c.amount);
      const name = c.billing_details?.name || "N/A";
      const status = c.status;
      return `<tr><td>${dt}</td><td>${amt}</td><td>${status}</td><td>${name}</td></tr>`;
    })
    .join("");

  // Stripe payouts
  const payouts = stripePayouts?.data || [];
  const payoutRows = payouts
    .map((p: any) => {
      const amt = fmtMoney(p.amount);
      const status = p.status;
      const arrival = new Date(p.arrival_date * 1000).toLocaleDateString("en-US");
      return `<tr><td>${amt}</td><td>${status}</td><td>${arrival}</td></tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 700px; margin: 0 auto; padding: 20px; }
  h1 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 8px; }
  h2 { color: #333; margin-top: 28px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
  th { background: #f5f5f5; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }
  .metric { display: inline-block; background: #f0f7e6; border-radius: 8px; padding: 12px 20px; margin: 4px 8px 4px 0; }
  .metric .label { font-size: 11px; color: #666; text-transform: uppercase; }
  .metric .value { font-size: 20px; font-weight: 700; color: #2d5016; }
  .section { margin-bottom: 24px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
</style>
</head>
<body>
<h1>Uncle May's Daily Report - ${date}</h1>

<div class="section">
<h2>Warmup &amp; Deliverability</h2>
<table>
  <tr><th>Account</th><th>Health</th><th>Deliverability</th><th>OAuth</th></tr>
  ${accountRows || '<tr><td colspan="4">No account data</td></tr>'}
</table>
<p style="font-size:13px;color:#666;">Warmbox warmup running independently from Apollo. Do not re-authenticate until scores approach 70.</p>
</div>

<div class="section">
<h2>Apollo Campaigns</h2>
<table>
  <tr><th>Campaign</th><th>Active</th><th>Sent</th><th>Opens</th><th>Replies</th><th>Bounced</th></tr>
  ${campaignRows || '<tr><td colspan="6">No campaign data</td></tr>'}
</table>
</div>

<div class="section">
<h2>Stripe - Balance &amp; Transactions</h2>
<div>
  <div class="metric"><div class="label">Available</div><div class="value">${fmtMoney(available)}</div></div>
  <div class="metric"><div class="label">Pending</div><div class="value">${fmtMoney(pending)}</div></div>
  <div class="metric"><div class="label">Last 48h Revenue</div><div class="value">${fmtMoney(totalRevenue)}</div></div>
</div>

<h3 style="font-size:14px;margin-top:16px;">Recent Transactions</h3>
<table>
  <tr><th>Date</th><th>Amount</th><th>Status</th><th>Customer</th></tr>
  ${chargeRows || '<tr><td colspan="4">No recent charges</td></tr>'}
</table>

${payoutRows ? `
<h3 style="font-size:14px;">Recent Payouts</h3>
<table>
  <tr><th>Amount</th><th>Status</th><th>Arrival</th></tr>
  ${payoutRows}
</table>
` : ""}
</div>

<div class="section">
<h2>Mailchimp - Newsletter</h2>
<div>
  <div class="metric"><div class="label">Subscribers</div><div class="value">${mailchimpList?.stats?.member_count || 0}</div></div>
  <div class="metric"><div class="label">Avg Open Rate</div><div class="value">${(mailchimpList?.stats?.open_rate || 0).toFixed(1)}%</div></div>
  <div class="metric"><div class="label">Avg Click Rate</div><div class="value">${(mailchimpList?.stats?.click_rate || 0).toFixed(1)}%</div></div>
  <div class="metric"><div class="label">Campaigns Sent</div><div class="value">${mailchimpList?.stats?.campaign_count || 0}</div></div>
</div>

<h3 style="font-size:14px;margin-top:16px;">Recent Campaigns</h3>
<table>
  <tr><th>Campaign</th><th>Sent</th><th>Opens</th><th>Clicks</th><th>Unsubs</th><th>Open Rate</th></tr>
  ${mailchimpReports.length > 0 ? mailchimpReports.map((r: any) => {
    const title = (r.campaign_title || "Untitled").substring(0, 40);
    const sent = r.emails_sent || 0;
    const opens = r.opens?.unique_opens || 0;
    const clicks = r.clicks?.unique_clicks || 0;
    const unsubs = r.unsubscribed || 0;
    const openRate = sent > 0 ? ((opens / sent) * 100).toFixed(1) + "%" : "N/A";
    return "<tr><td>" + title + "</td><td>" + sent + "</td><td>" + opens + "</td><td>" + clicks + "</td><td>" + unsubs + "</td><td>" + openRate + "</td></tr>";
  }).join("") : '<tr><td colspan="6">No recent campaigns</td></tr>'}
</table>
</div>

${metaStats ? `
<div class="section">
<h2>Meta Ads - Subscription Launch</h2>
<div style="background: ${metaStats.alerts.length > 0 ? '#fff3cd' : '#f0f7e6'}; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
  <div style="font-weight: 600; margin-bottom: 8px;">${metaStats.campaignName}</div>
  <div style="font-size: 13px; color: #666;">
    Status: <strong>${metaStats.campaignStatus}</strong> |
    Daily Budget: <strong>$${metaStats.dailyBudget.toFixed(2)}</strong>
  </div>
  ${metaStats.alerts.length > 0 ? `
  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">
    <div style="font-weight: 600; color: #856404; margin-bottom: 4px;">⚠️ Alerts:</div>
    ${metaStats.alerts.map((alert: string) => `<div style="font-size: 12px; color: #856404;">• ${alert}</div>`).join('')}
  </div>
  ` : ''}
</div>

<div>
  <div class="metric"><div class="label">24h Spend</div><div class="value">$${metaStats.spend24h.toFixed(2)}</div></div>
  <div class="metric"><div class="label">24h Impressions</div><div class="value">${metaStats.impressions24h.toLocaleString()}</div></div>
  <div class="metric"><div class="label">24h Clicks</div><div class="value">${metaStats.clicks24h}</div></div>
  <div class="metric"><div class="label">24h Checkouts</div><div class="value">${metaStats.checkouts24h}</div></div>
</div>

<div style="margin-top: 12px;">
  <div class="metric"><div class="label">CPA (24h)</div><div class="value">$${metaStats.cpa24h.toFixed(2)}</div></div>
  <div class="metric"><div class="label">CPA (7d avg)</div><div class="value">$${metaStats.cpa7dAvg.toFixed(2)}</div></div>
  <div class="metric"><div class="label">7d Avg Spend/Day</div><div class="value">$${metaStats.spend7dAvg.toFixed(2)}</div></div>
  <div class="metric"><div class="label">7d Avg Checkouts/Day</div><div class="value">${metaStats.checkouts7dAvg.toFixed(1)}</div></div>
</div>

<p style="font-size:13px;margin-top:16px;">
  <a href="https://business.facebook.com/adsmanager/manage/campaigns?act=814877604473301&selected_campaign_ids=120243219649250762" target="_blank">View in Ads Manager →</a>
</p>
</div>
` : ''}

<div class="section">
<h2>Action Items</h2>
<ul>
  <li>Check Gmail for investor replies</li>
  <li>Draft 5-10 new personalized outreach emails</li>
  <li>Monitor warmup progress (Warmbox)</li>
  ${metaStats && metaStats.alerts.length > 0 ? '<li><strong>Review Meta Ads Manager</strong> — campaign needs attention</li>' : ''}
</ul>
</div>

<div class="footer">
  Generated by Trigger.dev scheduled task at ${new Date().toISOString()}<br>
  Uncle May's Produce - Investor Outreach Automation
</div>
</body>
</html>`;
}

// --- The task ---
// Schedule disabled 2026-04-28 by CEO: the daily morning report email to
// anthony@/peter@/joe.harwood@kellogg was no longer wanted. Task definition
// is retained so it can be triggered manually (via Trigger.dev dashboard
// or `tasks.trigger("daily-report", {})`) if a future need arises.
// To re-enable the cron, restore `schedules.task({ id, cron: "0 13 * * 1-5", run })`
// and redeploy.

export const dailyReport = task({
  id: "daily-report",
  run: async () => {
    const stripeKey = process.env.STRIPE_API_KEY!;
    const apolloKey = process.env.APOLLO_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;
    const gmailClientId = process.env.GMAIL_CLIENT_ID!;
    const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET!;
    const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN!;
    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    const reportEmail = process.env.REPORT_EMAIL || DAILY_REPORT_RECIPIENTS;
    const mailchimpListId = "2645503d11";
    const metaCampaignId = "120243219649250762";

    const since48h = Math.floor(Date.now() / 1000) - 172800;
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Fetch all data in parallel
    const [apolloAccounts, apolloCampaigns, stripeBalance, stripeCharges, stripePayouts, mailchimpCampaigns, mailchimpList] =
      await Promise.all([
        fetchApolloAccounts(apolloKey),
        fetchApolloCampaigns(apolloKey),
        fetchStripeBalance(stripeKey),
        fetchStripeCharges(stripeKey, since48h),
        fetchStripePayouts(stripeKey),
        fetchMailchimpCampaigns(mailchimpKey),
        fetchMailchimpList(mailchimpKey, mailchimpListId),
      ]);

    // Fetch reports for recent sent campaigns
    const sentCampaignIds = (mailchimpCampaigns?.campaigns || [])
      .filter((c: any) => c.status === "sent")
      .slice(0, 5)
      .map((c: any) => c.id);
    const mailchimpReports = sentCampaignIds.length > 0
      ? await fetchMailchimpReports(mailchimpKey, sentCampaignIds)
      : [];

    // Fetch Meta campaign stats (optional, won't break if Meta is down)
    let metaStats: ReturnType<typeof formatMetaStats> | undefined = undefined;
    if (metaAccessToken) {
      try {
        const metaData = await fetchMetaCampaignStats(metaAccessToken, metaCampaignId);
        metaStats = formatMetaStats(metaData);
      } catch (error) {
        console.error("Failed to fetch Meta stats:", error);
        // Continue without Meta stats rather than failing the whole report
      }
    }

    // Build HTML report
    const html = buildReport({
      apolloAccounts,
      apolloCampaigns,
      stripeBalance,
      stripeCharges,
      stripePayouts,
      mailchimpCampaigns,
      mailchimpReports,
      mailchimpList,
      metaStats,
      date: today,
    });

    // Send via Gmail
    const accessToken = await getGmailAccessToken(
      gmailClientId,
      gmailClientSecret,
      gmailRefreshToken
    );

    const result = await sendGmail(
      accessToken,
      reportEmail,
      `Uncle May's Daily Report - ${today}`,
      html
    );

    console.log(`Daily report sent to ${reportEmail}`, result);

    return {
      sent: true,
      to: reportEmail,
      date: today,
      stripeCharges: stripeCharges?.data?.length || 0,
      apolloAccounts: apolloAccounts?.email_accounts?.length || 0,
      mailchimpSubscribers: mailchimpList?.stats?.member_count || 0,
    };
  },
});

// --- Manual trigger (for testing) ---

export const sendDailyReportNow = task({
  id: "send-daily-report-now",
  run: async () => {
    // Same logic, just callable on demand
    const stripeKey = process.env.STRIPE_API_KEY!;
    const apolloKey = process.env.APOLLO_API_KEY!;
    const mailchimpKey = process.env.MAILCHIMP_API_KEY!;
    const gmailClientId = process.env.GMAIL_CLIENT_ID!;
    const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET!;
    const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN!;
    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    const reportEmail = process.env.REPORT_EMAIL || DAILY_REPORT_RECIPIENTS;
    const mailchimpListId = "2645503d11";
    const metaCampaignId = "120243219649250762";

    const since48h = Math.floor(Date.now() / 1000) - 172800;
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const [apolloAccounts, apolloCampaigns, stripeBalance, stripeCharges, stripePayouts, mailchimpCampaigns, mailchimpList] =
      await Promise.all([
        fetchApolloAccounts(apolloKey),
        fetchApolloCampaigns(apolloKey),
        fetchStripeBalance(stripeKey),
        fetchStripeCharges(stripeKey, since48h),
        fetchStripePayouts(stripeKey),
        fetchMailchimpCampaigns(mailchimpKey),
        fetchMailchimpList(mailchimpKey, mailchimpListId),
      ]);

    const sentCampaignIds = (mailchimpCampaigns?.campaigns || [])
      .filter((c: any) => c.status === "sent")
      .slice(0, 5)
      .map((c: any) => c.id);
    const mailchimpReports = sentCampaignIds.length > 0
      ? await fetchMailchimpReports(mailchimpKey, sentCampaignIds)
      : [];

    // Fetch Meta campaign stats (optional)
    let metaStats: ReturnType<typeof formatMetaStats> | undefined = undefined;
    if (metaAccessToken) {
      try {
        const metaData = await fetchMetaCampaignStats(metaAccessToken, metaCampaignId);
        metaStats = formatMetaStats(metaData);
      } catch (error) {
        console.error("Failed to fetch Meta stats:", error);
      }
    }

    const html = buildReport({
      apolloAccounts,
      apolloCampaigns,
      stripeBalance,
      stripeCharges,
      stripePayouts,
      mailchimpCampaigns,
      mailchimpReports,
      mailchimpList,
      metaStats,
      date: today,
    });

    const accessToken = await getGmailAccessToken(
      gmailClientId,
      gmailClientSecret,
      gmailRefreshToken
    );

    const result = await sendGmail(
      accessToken,
      reportEmail,
      `Uncle May's Daily Report - ${today}`,
      html
    );

    console.log(`Manual daily report sent to ${reportEmail}`, result);
    return { sent: true, to: reportEmail, date: today };
  },
});
