// Supabase Edge Function: sync-meta  (READ-ONLY)
//
// Deploy:  supabase functions deploy sync-meta
// Secrets: supabase secrets set META_ACCESS_TOKEN=... META_AD_ACCOUNT_ID=act_123456
//
// The easiest of the three connectors: a System User token from Business
// Manager reads your own ad accounts with no App Review, because App Review
// only governs access to *other people's* accounts. Ask for `ads_read` and
// nothing else — `ads_management` would grant write access this app has no use
// for.

import {
  corsHeaders,
  dateWindow,
  requestedDays,
  requireEnv,
  runSync,
  type DailyStat,
} from "../_shared/sync.ts";

// Bump when Meta deprecates a version; they sunset roughly every two years.
const API_VERSION = "v26.0";

interface MetaInsight {
  campaign_id: string;
  campaign_name: string;
  date_start: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
  actions?: { action_type: string; value: string }[];
}

/**
 * Meta returns every number as a string, and `actions` as a list of every
 * event type it tracked. Leads are what matter for an insurance agency, so
 * that is what gets counted — `offsite_conversion.fb_pixel_lead` for a pixel
 * fire, `lead` for a native Lead Ad form.
 */
function countLeads(actions: MetaInsight["actions"]): number {
  if (!actions) return 0;
  return actions
    .filter(
      (a) =>
        a.action_type === "lead" ||
        a.action_type === "offsite_conversion.fb_pixel_lead"
    )
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);
}

async function fetchMeta(days: number): Promise<DailyStat[]> {
  const token = requireEnv("META_ACCESS_TOKEN");
  const accountId = requireEnv("META_AD_ACCOUNT_ID");
  const { since, until } = dateWindow(days);

  // `time_increment=1` is what makes this a daily breakdown rather than one
  // aggregate row for the whole window.
  const url = new URL(
    `https://graph.facebook.com/${API_VERSION}/${accountId}/insights`
  );
  url.searchParams.set("level", "campaign");
  url.searchParams.set(
    "fields",
    "campaign_id,campaign_name,impressions,clicks,spend,actions"
  );
  url.searchParams.set("time_range", JSON.stringify({ since, until }));
  url.searchParams.set("time_increment", "1");
  url.searchParams.set("limit", "500");
  url.searchParams.set("access_token", token);

  const stats: DailyStat[] = [];
  let next: string | null = url.toString();
  let pages = 0;

  // Meta paginates with cursors. The page cap stops a malformed cursor from
  // looping this function until it times out.
  while (next && pages < 25) {
    const response: Response = await fetch(next);
    const body = await response.json();

    if (!response.ok) {
      const detail = body?.error?.message ?? response.statusText;
      throw new Error(`Meta API ${response.status}: ${detail}`);
    }

    for (const row of (body.data ?? []) as MetaInsight[]) {
      stats.push({
        externalCampaignId: row.campaign_id,
        campaignName: row.campaign_name,
        date: row.date_start,
        impressions: Number(row.impressions) || 0,
        clicks: Number(row.clicks) || 0,
        spend: Number(row.spend) || 0,
        conversions: countLeads(row.actions),
      });
    }

    next = body.paging?.next ?? null;
    pages++;
  }

  return stats;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const days = await requestedDays(req);
  return runSync("meta", () => fetchMeta(days));
});
