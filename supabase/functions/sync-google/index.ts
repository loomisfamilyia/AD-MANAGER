// Supabase Edge Function: sync-google  (READ-ONLY)
//
// Deploy:  supabase functions deploy sync-google
// Secrets: supabase secrets set \
//            GOOGLE_ADS_DEVELOPER_TOKEN=... \
//            GOOGLE_ADS_CLIENT_ID=... GOOGLE_ADS_CLIENT_SECRET=... \
//            GOOGLE_ADS_REFRESH_TOKEN=... \
//            GOOGLE_ADS_CUSTOMER_ID=1234567890 \
//            GOOGLE_ADS_LOGIN_CUSTOMER_ID=0987654321
//
// This one cannot work until Google approves a Basic Access developer token.
// That review is mandatory and takes days. Until it clears, the CSV import
// path covers the same ground — see the README.

import {
  corsHeaders,
  dateWindow,
  requestedDays,
  requireEnv,
  runSync,
  type DailyStat,
} from "../_shared/sync.ts";

// v19 stopped answering in February 2026; v23 is the current major.
const API_VERSION = "v23";

/**
 * Exchanges the long-lived refresh token for a short-lived access token.
 *
 * Refresh tokens are what get stored; access tokens last an hour and are
 * fetched per run. A refresh token obtained from a Google Cloud project in
 * "Testing" publishing status expires after seven days — publish the consent
 * screen, or this will fail every week with an invalid_grant.
 */
async function accessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_ADS_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_ADS_CLIENT_SECRET"),
      refresh_token: requireEnv("GOOGLE_ADS_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      `Google OAuth ${response.status}: ${body.error_description ?? body.error ?? "token refresh failed"}`
    );
  }
  return body.access_token as string;
}

interface GoogleRow {
  campaign?: { id?: string; name?: string };
  segments?: { date?: string };
  metrics?: {
    impressions?: string;
    clicks?: string;
    costMicros?: string;
    conversions?: number;
  };
}

async function fetchGoogle(days: number): Promise<DailyStat[]> {
  const developerToken = requireEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
  // Digits only — the dashed form from the UI is rejected.
  const customerId = requireEnv("GOOGLE_ADS_CUSTOMER_ID").replace(/\D/g, "");
  const loginCustomerId = requireEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID").replace(
    /\D/g,
    ""
  );
  const { since, until } = dateWindow(days);
  const token = await accessToken();

  // GAQL. `segments.date` is what makes each row one campaign-day; without it
  // the API returns one aggregate row per campaign for the whole window.
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${since}' AND '${until}'
  `;

  const response = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "developer-token": developerToken,
        "login-customer-id": loginCustomerId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    const detail =
      body?.error?.message ??
      body?.[0]?.error?.message ??
      response.statusText;
    throw new Error(`Google Ads API ${response.status}: ${detail}`);
  }

  // searchStream returns an ARRAY of chunks, each holding its own `results`.
  const chunks = Array.isArray(body) ? body : [body];
  const stats: DailyStat[] = [];

  for (const chunk of chunks) {
    for (const row of (chunk.results ?? []) as GoogleRow[]) {
      const id = row.campaign?.id;
      const date = row.segments?.date;
      if (!id || !date) continue;

      stats.push({
        externalCampaignId: String(id),
        campaignName: row.campaign?.name ?? `Campaign ${id}`,
        date,
        impressions: Number(row.metrics?.impressions) || 0,
        clicks: Number(row.metrics?.clicks) || 0,
        // Google reports cost in micros — a millionth of a currency unit.
        // Divide by 1e6 or every campaign will look a million times pricier.
        spend: (Number(row.metrics?.costMicros) || 0) / 1_000_000,
        conversions: Number(row.metrics?.conversions) || 0,
      });
    }
  }

  return stats;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const days = await requestedDays(req);
  return runSync("google", () => fetchGoogle(days));
});
