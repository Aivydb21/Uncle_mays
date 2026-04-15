import { task } from "@trigger.dev/sdk/v3";

/**
 * Google Ads Conversion Tracking for Uncle May's Produce
 *
 * This task sends conversion data to Google Ads via the Enhanced Conversions API
 * when a Stripe purchase completes. It supplements GA4 conversion import with
 * server-side tracking for maximum accuracy.
 *
 * Called by: stripe-purchase-sync (after successful purchase processing)
 * Frequency: Real-time (triggered per purchase)
 *
 * Requirements:
 * - GOOGLE_ADS_DEVELOPER_TOKEN
 * - GOOGLE_ADS_CLIENT_ID
 * - GOOGLE_ADS_CLIENT_SECRET
 * - GOOGLE_ADS_REFRESH_TOKEN
 * - GOOGLE_ADS_CUSTOMER_ID
 * - GOOGLE_ADS_LOGIN_CUSTOMER_ID
 * - GOOGLE_ADS_CONVERSION_ACTION_ID (set after creating conversion action)
 */

interface ConversionPayload {
  email: string;
  orderId: string;
  value: number; // in cents
  currency: string;
  timestamp: number; // Unix timestamp in seconds
  phone?: string;
  firstName?: string;
  lastName?: string;
  userAgent?: string;
}

async function getGoogleAdsAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to get Google Ads access token: ${error}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function uploadConversionToGoogleAds(
  accessToken: string,
  customerId: string,
  loginCustomerId: string,
  conversionActionId: string,
  payload: ConversionPayload
): Promise<any> {
  // Format: customers/{customer_id}/conversionActions/{conversion_action_id}
  const conversionActionResource = `customers/${customerId}/conversionActions/${conversionActionId}`;

  // Hash email for enhanced conversions (SHA-256)
  const emailHash = await hashSHA256(payload.email.toLowerCase().trim());

  // Build the conversion upload request
  const conversionData = {
    conversions: [
      {
        conversionAction: conversionActionResource,
        conversionDateTime: new Date(payload.timestamp * 1000).toISOString(),
        conversionValue: (payload.value / 100).toFixed(2), // Convert cents to dollars
        currencyCode: payload.currency,
        orderId: payload.orderId,
        // Enhanced conversion data (hashed)
        userIdentifiers: [
          {
            hashedEmail: emailHash,
          },
        ],
      },
    ],
    partialFailure: true,
  };

  const apiUrl = `https://googleads.googleapis.com/v22/customers/${customerId}:uploadClickConversions`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      "login-customer-id": loginCustomerId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversionData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google Ads conversion upload failed (${res.status}): ${error}`);
  }

  return res.json();
}

async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Upload Conversion to Google Ads
 *
 * Sends purchase conversion data to Google Ads Enhanced Conversions API.
 * This provides server-side conversion tracking that supplements GA4 import.
 */
export const uploadGoogleAdsConversion = task({
  id: "upload-google-ads-conversion",
  retry: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },
  run: async (payload: ConversionPayload) => {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
    const conversionActionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;

    if (!clientId || !clientSecret || !refreshToken || !customerId || !loginCustomerId) {
      throw new Error("Missing required Google Ads environment variables");
    }

    if (!conversionActionId) {
      console.warn(
        "GOOGLE_ADS_CONVERSION_ACTION_ID not set. Skipping conversion upload. " +
        "Run setup-google-ads-conversion-action task first."
      );
      return { skipped: true, reason: "conversion_action_not_configured" };
    }

    console.log(`Uploading conversion for order ${payload.orderId} to Google Ads`);

    // Get fresh access token
    const accessToken = await getGoogleAdsAccessToken(clientId, clientSecret, refreshToken);

    // Upload conversion
    const result = await uploadConversionToGoogleAds(
      accessToken,
      customerId,
      loginCustomerId,
      conversionActionId,
      payload
    );

    console.log(`✓ Conversion uploaded | order=${payload.orderId} value=$${(payload.value / 100).toFixed(2)}`);

    return {
      success: true,
      orderId: payload.orderId,
      conversionValue: payload.value,
      result,
    };
  },
});

/**
 * Set up Google Ads Conversion Action
 *
 * Creates the "Purchase" conversion action in Google Ads if it doesn't exist.
 * This is a one-time setup task. Run this before enabling conversion tracking.
 *
 * Returns the conversion action ID to set as GOOGLE_ADS_CONVERSION_ACTION_ID
 */
export const setupGoogleAdsConversionAction = task({
  id: "setup-google-ads-conversion-action",
  run: async () => {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

    if (!clientId || !clientSecret || !refreshToken || !customerId || !loginCustomerId) {
      throw new Error("Missing required Google Ads environment variables");
    }

    const accessToken = await getGoogleAdsAccessToken(clientId, clientSecret, refreshToken);

    // First, check if conversion action already exists
    const searchQuery = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.status
      FROM conversion_action
      WHERE conversion_action.name = 'Purchase - Uncle May\\'s Produce Box'
    `;

    const searchUrl = `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`;
    const searchRes = await fetch(searchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        "login-customer-id": loginCustomerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: searchQuery }),
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.results && searchData.results.length > 0) {
        const existing = searchData.results[0].conversionAction;
        console.log(`✓ Conversion action already exists: ${existing.name} (ID: ${existing.id})`);
        return {
          exists: true,
          conversionActionId: existing.id.toString(),
          name: existing.name,
          status: existing.status,
          message: `Set GOOGLE_ADS_CONVERSION_ACTION_ID=${existing.id} in your environment`,
        };
      }
    }

    // Create new conversion action
    const conversionActionData = {
      operations: [
        {
          create: {
            name: "Purchase - Uncle May's Produce Box",
            type: "WEBPAGE",
            category: "PURCHASE",
            status: "ENABLED",
            valueSettings: {
              defaultValue: 0,
              alwaysUseDefaultValue: false,
            },
            countingType: "ONE_PER_CLICK",
            attributionModelSettings: {
              attributionModel: "POSITION_BASED",
            },
            clickThroughLookbackWindowDays: 30,
          },
        },
      ],
    };

    const createUrl = `https://googleads.googleapis.com/v22/customers/${customerId}/conversionActions:mutate`;
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        "login-customer-id": loginCustomerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conversionActionData),
    });

    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Failed to create conversion action: ${error}`);
    }

    const createData = await createRes.json();
    const resourceName = createData.results[0].resourceName;
    // Extract ID from resource name: customers/123/conversionActions/456
    const conversionActionId = resourceName.split("/").pop();

    console.log(`✓ Created conversion action: ${resourceName}`);
    console.log(`✓ Conversion Action ID: ${conversionActionId}`);

    return {
      created: true,
      conversionActionId,
      resourceName,
      message: `Set GOOGLE_ADS_CONVERSION_ACTION_ID=${conversionActionId} in your environment`,
    };
  },
});

/**
 * Set up Google Ads Remarketing Audiences
 *
 * Creates remarketing audiences in Google Ads:
 * 1. All website visitors (30-day window)
 * 2. Cart abandoners (exclude purchasers)
 * 3. Past purchasers (exclude from acquisition campaigns)
 *
 * Prerequisites:
 * - Google Ads account must be linked to GA4
 * - GA4 audience sharing must be enabled
 */
export const setupGoogleAdsAudiences = task({
  id: "setup-google-ads-audiences",
  run: async () => {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

    if (!clientId || !clientSecret || !refreshToken || !customerId || !loginCustomerId) {
      throw new Error("Missing required Google Ads environment variables");
    }

    const accessToken = await getGoogleAdsAccessToken(clientId, clientSecret, refreshToken);

    const audiences = [
      {
        name: "All Website Visitors (30 days)",
        description: "All visitors to unclemays.com in the last 30 days",
        membershipLifespan: 30,
        rules: {
          inclusionRuleOperator: "OR",
          inclusionRules: [
            {
              ruleItems: [
                {
                  urlStringList: {
                    urlMatchType: "CONTAINS",
                    urls: ["unclemays.com"],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        name: "Cart Abandoners",
        description: "Visitors who added items to cart but didn't purchase",
        membershipLifespan: 7,
        rules: {
          inclusionRuleOperator: "AND",
          inclusionRules: [
            {
              ruleItems: [
                {
                  urlStringList: {
                    urlMatchType: "CONTAINS",
                    urls: ["unclemays.com/boxes"],
                  },
                },
              ],
            },
          ],
          exclusionRules: [
            {
              ruleItems: [
                {
                  urlStringList: {
                    urlMatchType: "CONTAINS",
                    urls: ["unclemays.com/thank-you"],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        name: "Past Purchasers",
        description: "Customers who completed a purchase",
        membershipLifespan: 180,
        rules: {
          inclusionRuleOperator: "OR",
          inclusionRules: [
            {
              ruleItems: [
                {
                  urlStringList: {
                    urlMatchType: "CONTAINS",
                    urls: ["unclemays.com/thank-you"],
                  },
                },
              ],
            },
          ],
        },
      },
    ];

    const results = [];

    for (const audience of audiences) {
      try {
        // Check if audience already exists
        const searchQuery = `
          SELECT
            user_list.id,
            user_list.name,
            user_list.type
          FROM user_list
          WHERE user_list.name = '${audience.name}'
        `;

        const searchUrl = `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`;
        const searchRes = await fetch(searchUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
            "login-customer-id": loginCustomerId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            const existing = searchData.results[0].userList;
            console.log(`✓ Audience already exists: ${existing.name} (ID: ${existing.id})`);
            results.push({
              name: audience.name,
              exists: true,
              audienceId: existing.id.toString(),
            });
            continue;
          }
        }

        // Create new audience
        const audienceData = {
          operations: [
            {
              create: {
                name: audience.name,
                description: audience.description,
                membershipLifeSpan: audience.membershipLifespan,
                ruleBasedUserList: {
                  prepopulationStatus: "REQUESTED",
                  flexibleRuleUserList: {
                    ...audience.rules,
                  },
                },
              },
            },
          ],
        };

        const createUrl = `https://googleads.googleapis.com/v22/customers/${customerId}/userLists:mutate`;
        const createRes = await fetch(createUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
            "login-customer-id": loginCustomerId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(audienceData),
        });

        if (!createRes.ok) {
          const error = await createRes.text();
          console.error(`Failed to create audience ${audience.name}: ${error}`);
          results.push({
            name: audience.name,
            created: false,
            error,
          });
          continue;
        }

        const createData = await createRes.json();
        const resourceName = createData.results[0].resourceName;
        const audienceId = resourceName.split("/").pop();

        console.log(`✓ Created audience: ${audience.name} (ID: ${audienceId})`);
        results.push({
          name: audience.name,
          created: true,
          audienceId,
          resourceName,
        });
      } catch (error: any) {
        console.error(`Error creating audience ${audience.name}:`, error.message);
        results.push({
          name: audience.name,
          created: false,
          error: error.message,
        });
      }
    }

    return {
      audiencesProcessed: audiences.length,
      results,
    };
  },
});
