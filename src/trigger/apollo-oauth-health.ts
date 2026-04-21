import { schedules, task } from "@trigger.dev/sdk/v3";

// --- Apollo API helpers ---

async function fetchApolloAccounts(apiKey: string) {
  const res = await fetch("https://api.apollo.io/api/v1/email_accounts", {
    headers: { "X-Api-Key": apiKey },
  });
  if (!res.ok) {
    throw new Error(`Apollo API error: ${res.status} ${res.statusText}`);
  }
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
        per_page: 50,
        sort_by_key: "campaign_last_activity",
        sort_ascending: false,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Apollo API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Paperclip API helper ---

async function postPaperclipComment(issueId: string, message: string) {
  const paperclipUrl = process.env.PAPERCLIP_API_URL || "http://localhost:3100";
  const paperclipKey = process.env.PAPERCLIP_API_KEY || "";
  const res = await fetch(`${paperclipUrl}/api/issues/${issueId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(paperclipKey ? { Authorization: `Bearer ${paperclipKey}` } : {}),
    },
    body: JSON.stringify({ body: message }),
  });
  if (!res.ok) {
    console.error(`Failed to post Paperclip comment: ${res.status}`);
  }
  return res.json();
}

// --- Health check logic ---

interface AccountHealth {
  email: string;
  status: "healthy" | "warning" | "critical";
  issues: string[];
  deliverability: number;
  domainHealth: number;
  revokedAt: string | null;
  dailyLimit: number;
}

interface CampaignHealth {
  id: string;
  name: string;
  active: boolean;
  emailAccount: string | null;
  scheduled: number;
  delivered: number;
  bounced: number;
  bounceRate: number;
  status: "healthy" | "warning" | "critical";
  issues: string[];
}

function analyzeAccountHealth(account: any): AccountHealth {
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  const deliverability = account.deliverability_score?.deliverability_score || 0;
  const domainHealth = account.deliverability_score?.domain_health_score || 0;
  const revokedAt = account.revoked_at;
  const dailyLimit = account.daily_email_limit || 0;

  // Critical: OAuth revoked
  if (revokedAt) {
    status = "critical";
    const revokedDate = new Date(revokedAt).toLocaleDateString("en-US");
    issues.push(`OAuth revoked on ${revokedDate}`);
  }

  // Warning: Low deliverability scores
  if (deliverability < 50 && deliverability > 0) {
    if (status !== "critical") status = "warning";
    issues.push(`Low deliverability score: ${deliverability.toFixed(1)}`);
  }

  if (domainHealth < 50 && domainHealth > 0) {
    if (status !== "critical") status = "warning";
    issues.push(`Low domain health: ${domainHealth.toFixed(1)}`);
  }

  // Warning: Low daily limit
  if (dailyLimit < 50) {
    if (status !== "critical") status = "warning";
    issues.push(`Low daily limit: ${dailyLimit}`);
  }

  return {
    email: account.email,
    status,
    issues,
    deliverability,
    domainHealth,
    revokedAt,
    dailyLimit,
  };
}

function analyzeCampaignHealth(campaign: any): CampaignHealth {
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  const scheduled = campaign.num_steps || 0;
  const delivered = campaign.unique_delivered || 0;
  const bounced = campaign.unique_bounced || 0;
  const bounceRate = delivered > 0 ? (bounced / delivered) * 100 : 0;

  // Critical: >5% bounce rate (killswitch threshold)
  if (bounceRate > 5 && delivered > 0) {
    status = "critical";
    issues.push(`Bounce rate ${bounceRate.toFixed(1)}% exceeds 5% killswitch threshold`);
  }

  // Critical: Active campaign with scheduled sends but 0 delivered
  if (campaign.active && scheduled > 0 && delivered === 0) {
    status = "critical";
    issues.push(`Campaign active with ${scheduled} scheduled but 0 delivered (account likely stalled)`);
  }

  // Warning: Inactive campaign that was recently active
  if (!campaign.active && campaign.campaign_last_activity) {
    const lastActivity = new Date(campaign.campaign_last_activity);
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity < 7) {
      if (status !== "critical") status = "warning";
      issues.push(`Campaign became inactive ${Math.floor(daysSinceActivity)} days ago`);
    }
  }

  return {
    id: campaign.id,
    name: campaign.name || "Unnamed",
    active: campaign.active || false,
    emailAccount: campaign.email_account?.email || null,
    scheduled,
    delivered,
    bounced,
    bounceRate,
    status,
    issues,
  };
}

function generateHealthReport(
  accounts: AccountHealth[],
  campaigns: CampaignHealth[],
  timestamp: string
): string {
  const criticalAccounts = accounts.filter((a) => a.status === "critical");
  const warningAccounts = accounts.filter((a) => a.status === "warning");
  const healthyAccounts = accounts.filter((a) => a.status === "healthy");

  const criticalCampaigns = campaigns.filter((c) => c.status === "critical");
  const warningCampaigns = campaigns.filter((c) => c.status === "warning");
  const activeCampaigns = campaigns.filter((c) => c.active);

  let report = `## Apollo OAuth Health Check - ${timestamp}\n\n`;

  // Summary
  report += `### Summary\n`;
  report += `- **Accounts:** ${accounts.length} total (${healthyAccounts.length} healthy, ${warningAccounts.length} warnings, ${criticalAccounts.length} critical)\n`;
  report += `- **Campaigns:** ${campaigns.length} total (${activeCampaigns.length} active, ${criticalCampaigns.length} critical, ${warningCampaigns.length} warnings)\n\n`;

  // Critical issues
  if (criticalAccounts.length > 0 || criticalCampaigns.length > 0) {
    report += `### 🚨 Critical Issues\n\n`;

    if (criticalAccounts.length > 0) {
      report += `**Accounts Requiring Immediate Attention:**\n`;
      for (const acc of criticalAccounts) {
        report += `- **${acc.email}**\n`;
        for (const issue of acc.issues) {
          report += `  - ${issue}\n`;
        }
      }
      report += `\n`;
    }

    if (criticalCampaigns.length > 0) {
      report += `**Campaigns Requiring Immediate Attention:**\n`;
      for (const camp of criticalCampaigns) {
        report += `- **${camp.name}** (${camp.emailAccount || "no account"})\n`;
        for (const issue of camp.issues) {
          report += `  - ${issue}\n`;
        }
      }
      report += `\n`;
    }

    report += `**Action Required:**\n`;
    if (criticalAccounts.some((a) => a.revokedAt)) {
      report += `1. Re-authenticate Gmail OAuth in Apollo Settings > Email Accounts\n`;
      report += `2. Wait 24h+ between re-auth attempts to avoid bulk Google revocation\n`;
    }
    if (criticalCampaigns.some((c) => c.bounceRate > 5)) {
      report += `3. STOP campaigns with >5% bounce rate immediately\n`;
      report += `4. Review and clean contact lists before resuming\n`;
    }
    if (criticalCampaigns.some((c) => c.active && c.scheduled > 0 && c.delivered === 0)) {
      report += `5. Check campaign email account assignment in Apollo UI\n`;
      report += `6. Verify account OAuth status and re-link if needed\n`;
    }
    report += `\n`;
  }

  // Warnings
  if (warningAccounts.length > 0 || warningCampaigns.length > 0) {
    report += `### ⚠️ Warnings\n\n`;

    if (warningAccounts.length > 0) {
      report += `**Accounts Needing Attention:**\n`;
      for (const acc of warningAccounts) {
        report += `- **${acc.email}**: ${acc.issues.join(", ")}\n`;
      }
      report += `\n`;
    }

    if (warningCampaigns.length > 0) {
      report += `**Campaigns Needing Attention:**\n`;
      for (const camp of warningCampaigns) {
        report += `- **${camp.name}**: ${camp.issues.join(", ")}\n`;
      }
      report += `\n`;
    }
  }

  // Healthy status
  if (criticalAccounts.length === 0 && criticalCampaigns.length === 0 && warningAccounts.length === 0) {
    report += `### ✅ All Systems Healthy\n\n`;
    report += `All Apollo email accounts and campaigns are operating normally.\n\n`;
  }

  // Account details table
  report += `### Account Details\n\n`;
  report += `| Account | Status | Deliverability | Domain Health | Daily Limit | OAuth |\n`;
  report += `|---------|--------|----------------|---------------|-------------|-------|\n`;
  for (const acc of accounts) {
    const statusEmoji = acc.status === "healthy" ? "✅" : acc.status === "warning" ? "⚠️" : "🚨";
    const oauthStatus = acc.revokedAt ? `Revoked ${new Date(acc.revokedAt).toLocaleDateString()}` : "Active";
    report += `| ${acc.email} | ${statusEmoji} ${acc.status} | ${acc.deliverability.toFixed(1)} | ${acc.domainHealth.toFixed(1)} | ${acc.dailyLimit} | ${oauthStatus} |\n`;
  }
  report += `\n`;

  // Active campaign details
  if (activeCampaigns.length > 0) {
    report += `### Active Campaign Details\n\n`;
    report += `| Campaign | Account | Status | Delivered | Bounced | Bounce Rate |\n`;
    report += `|----------|---------|--------|-----------|---------|-------------|\n`;
    for (const camp of activeCampaigns) {
      const statusEmoji = camp.status === "healthy" ? "✅" : camp.status === "warning" ? "⚠️" : "🚨";
      const accountShort = camp.emailAccount?.split("@")[0] || "none";
      report += `| ${camp.name.substring(0, 40)} | ${accountShort} | ${statusEmoji} | ${camp.delivered} | ${camp.bounced} | ${camp.bounceRate.toFixed(1)}% |\n`;
    }
    report += `\n`;
  }

  report += `---\n`;
  report += `*Generated by CIO Apollo OAuth Health Check*\n`;

  return report;
}

// --- Scheduled task: runs daily at 9 AM Central (14:00 UTC) ---

export const apolloOAuthHealthCheck = schedules.task({
  id: "apollo-oauth-health-check",
  // Runs daily at 9:00 AM Central Time (14:00 UTC)
  cron: "0 14 * * *",
  run: async () => {
    const apolloKey = process.env.APOLLO_API_KEY;
    if (!apolloKey) {
      throw new Error("APOLLO_API_KEY environment variable not set");
    }

    console.log("Starting Apollo OAuth health check...");

    // Fetch data
    const [accountsData, campaignsData] = await Promise.all([
      fetchApolloAccounts(apolloKey),
      fetchApolloCampaigns(apolloKey),
    ]);

    const accounts = accountsData?.email_accounts || [];
    const campaigns = campaignsData?.emailer_campaigns || [];

    // Analyze health
    const accountHealth = accounts.map(analyzeAccountHealth);
    const campaignHealth = campaigns.map(analyzeCampaignHealth);

    // Generate report
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
    });

    const report = generateHealthReport(accountHealth, campaignHealth, timestamp);

    console.log(report);

    // Post to Paperclip if there are critical issues
    const hasCritical =
      accountHealth.some((a) => a.status === "critical") ||
      campaignHealth.some((c) => c.status === "critical");

    if (hasCritical) {
      try {
        await postPaperclipComment("UNC-375", report);
        console.log("Critical issues detected - posted to Paperclip UNC-375");
      } catch (err) {
        console.error("Failed to post to Paperclip:", err);
      }
    }

    return {
      timestamp,
      accounts: {
        total: accountHealth.length,
        healthy: accountHealth.filter((a) => a.status === "healthy").length,
        warnings: accountHealth.filter((a) => a.status === "warning").length,
        critical: accountHealth.filter((a) => a.status === "critical").length,
      },
      campaigns: {
        total: campaignHealth.length,
        active: campaignHealth.filter((c) => c.active).length,
        warnings: campaignHealth.filter((c) => c.status === "warning").length,
        critical: campaignHealth.filter((c) => c.status === "critical").length,
      },
      hasCritical,
      report,
    };
  },
});

// --- Manual trigger for testing ---

export const checkApolloHealthNow = task({
  id: "check-apollo-health-now",
  run: async () => {
    const apolloKey = process.env.APOLLO_API_KEY;
    if (!apolloKey) {
      throw new Error("APOLLO_API_KEY environment variable not set");
    }

    console.log("Running manual Apollo OAuth health check...");

    const [accountsData, campaignsData] = await Promise.all([
      fetchApolloAccounts(apolloKey),
      fetchApolloCampaigns(apolloKey),
    ]);

    const accounts = accountsData?.email_accounts || [];
    const campaigns = campaignsData?.emailer_campaigns || [];

    const accountHealth = accounts.map(analyzeAccountHealth);
    const campaignHealth = campaigns.map(analyzeCampaignHealth);

    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
    });

    const report = generateHealthReport(accountHealth, campaignHealth, timestamp);

    console.log(report);

    return {
      timestamp,
      accounts: {
        total: accountHealth.length,
        healthy: accountHealth.filter((a) => a.status === "healthy").length,
        warnings: accountHealth.filter((a) => a.status === "warning").length,
        critical: accountHealth.filter((a) => a.status === "critical").length,
      },
      campaigns: {
        total: campaignHealth.length,
        active: campaignHealth.filter((c) => c.active).length,
        warnings: campaignHealth.filter((c) => c.status === "warning").length,
        critical: campaignHealth.filter((c) => c.status === "critical").length,
      },
      report,
    };
  },
});
