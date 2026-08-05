// Supabase Edge Function: sync-reddit  (READ-ONLY)
//
// Deploy:  supabase functions deploy sync-reddit
// Secrets: supabase secrets set REDDIT_CLIENT_ID=... REDDIT_CLIENT_SECRET=... \
//            REDDIT_REFRESH_TOKEN=... REDDIT_AD_ACCOUNT_ID=...
//
// ---------------------------------------------------------------------------
// READ THIS BEFORE DEBUGGING A FAILURE HERE
//
// Reddit gates Ads API access by allow-list, and the criteria are informal and
// weighted toward higher-spend advertisers. An OAuth app with correct
// credentials and the right scopes can still be refused — a 403 here often
// means "not approved", not "misconfigured".
//
// The request shape below follows Reddit's documented v3 reports endpoint, but
// unlike the Google and Meta connectors it has NOT been verified against a
// live account. When access is granted, check the response against the docs
// you get and adjust `REPORT_FIELDS` / the parser if they've moved. The first
// thing to verify is the spend scale — confirm one day against Ads Manager
// before trusting a month of it.
//
// The CSV import path covers Reddit fully in the meantime.
// ---------------------------------------------------------------------------

import {
  corsHeaders,
  dateWindow,
  requestedDays,
  requireEnv,
  runSync,
  type DailyStat,
} from "../_shared/sync.ts";

const API_BASE = "https://ads-api.reddit.com/api/v3";

const REPORT_FIELDS = ["impressions", "clicks", "spend", "conversion_signup"];

/** Reddit access tokens last an hour, so one is fetched per run. */
async function accessToken(): Promise<string> {
  const clientId = requireEnv("REDDIT_CLIENT_ID");
  const clientSecret = requireEnv("REDDIT_CLIENT_SECRET");
  const refreshToken = requireEnv("REDDIT_REFRESH_TOKEN");

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      // Reddit rejects requests with a generic user agent.
      "User-Agent": "loomis-ads-manager/1.0 (by /u/loomisinsurance)",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      `Reddit OAuth ${response.status}: ${body.error ?? "token refresh failed"}`
    );
  }
  return body.access_token as string;
}

interface RedditRow {
  campaign_id?: string;
  campaign_name?: string;
  date?: string;
  impressions?: number;
  clicks?: number;
  spend?: number;
  conversion_signup?: number;
}

async function fetchReddit(days: number): Promise<DailyStat[]> {
  const accountId = requireEnv("REDDIT_AD_ACCOUNT_ID");
  const { since, until } = dateWindow(days);
  const token = await accessToken();

  const response = await fetch(
    `${API_BASE}/ad_accounts/${accountId}/reports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "loomis-ads-manager/1.0 (by /u/loomisinsurance)",
      },
      body: JSON.stringify({
        data: {
          breakdowns: ["campaign_id", "date"],
          fields: REPORT_FIELDS,
          starts_at: `${since}T00:00:00Z`,
          ends_at: `${until}T23:59:59Z`,
          time_zone_id: "UTC",
        },
      }),
    }
  );

  const body = await response.json().catch(() => ({}));

  if (response.status === 403) {
    throw new Error(
      "Reddit returned 403. This usually means the ad account isn't allow-listed " +
        "for Ads API access rather than a credential problem. Use CSV import until " +
        "Reddit approves the account."
    );
  }

  if (!response.ok) {
    const detail = body?.error?.message ?? body?.message ?? response.statusText;
    throw new Error(`Reddit Ads API ${response.status}: ${detail}`);
  }

  const rows = (body?.data ?? body?.metrics ?? []) as RedditRow[];

  if (!Array.isArray(rows)) {
    throw new Error(
      "Unexpected Reddit response shape — the reports endpoint has changed. " +
        "Compare against the current docs and adjust sync-reddit."
    );
  }

  return rows.flatMap((row) => {
    const id = row.campaign_id;
    const date = row.date?.slice(0, 10);
    if (!id || !date) return [];

    return [
      {
        externalCampaignId: String(id),
        campaignName: row.campaign_name ?? `Reddit campaign ${id}`,
        date,
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        // Reddit reports spend in microcurrency. VERIFY this against one known
        // day in Ads Manager before trusting a month of it — if spend comes
        // back 1,000,000x too small, this division is why.
        spend: (Number(row.spend) || 0) / 1_000_000,
        conversions: Number(row.conversion_signup) || 0,
      },
    ];
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const days = await requestedDays(req);
  return runSync("reddit", () => fetchReddit(days));
});
