// Shared plumbing for the three read-only platform connectors.
//
// Every connector does the same four things — open an audit row, fetch a date
// range of daily campaign stats, upsert them, close the audit row — and
// differs only in how it authenticates and what shape the response has. That
// difference is all that lives in the per-platform files.
//
// READ-ONLY BY CONSTRUCTION: nothing here writes to an ad platform. The only
// scopes requested are reporting scopes, and there is no code path that issues
// a mutate call. A bug in this app cannot change a budget or pause a campaign.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export type Platform = "google" | "meta" | "reddit";

/** One day of stats for one campaign, normalized across platforms. */
export interface DailyStat {
  externalCampaignId: string;
  campaignName: string;
  date: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    // Service role, because this runs server-side with no user session and
    // still has to satisfy the authenticated-only RLS policies.
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

/** Inclusive date window ending today, as YYYY-MM-DD. */
export function dateWindow(days: number): { since: string; until: string } {
  const until = new Date();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { since: iso(since), until: iso(until) };
}

/** Reads `days` off the request body, clamped to something sane. */
export async function requestedDays(req: Request, fallback = 30) {
  try {
    const body = await req.json();
    const days = Number(body?.days);
    if (Number.isFinite(days)) return Math.min(Math.max(Math.trunc(days), 1), 365);
  } catch {
    // No body, or not JSON — the default is fine.
  }
  return fallback;
}

/**
 * Runs a connector with audit logging and uniform error handling.
 *
 * The sync_runs row is opened before the fetch and closed in a finally, so a
 * connector that throws still leaves a record saying what went wrong. Without
 * that, a silently failing nightly sync looks exactly like a week of no ad
 * spend.
 */
export async function runSync(
  platform: Platform,
  fetchStats: () => Promise<DailyStat[]>
): Promise<Response> {
  const supabase = adminClient();

  const { data: run } = await supabase
    .from("sync_runs")
    .insert({ platform, status: "running" })
    .select("id")
    .single();

  const runId = run?.id as string | undefined;

  const close = async (
    status: "success" | "error",
    rows: number,
    message: string
  ) => {
    if (!runId) return;
    await supabase
      .from("sync_runs")
      .update({
        status,
        rows_written: rows,
        message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
  };

  try {
    const stats = await fetchStats();

    if (stats.length === 0) {
      await close("success", 0, "No rows returned for this window.");
      return json({ ok: true, rows: 0, message: "No data for this window." });
    }

    const campaignIds = await resolveCampaigns(supabase, platform, stats);

    const rows = stats.map((stat) => ({
      campaign_id: campaignIds.get(stat.externalCampaignId)!,
      date: stat.date,
      impressions: Math.round(stat.impressions),
      clicks: Math.round(stat.clicks),
      spend: Number(stat.spend.toFixed(2)),
      platform_conversions: stat.conversions,
      source: "api",
      synced_at: new Date().toISOString(),
    }));

    // Upsert on (campaign_id, date). Platforms restate recent days as late
    // conversions land and invalid clicks are filtered, so re-pulling the same
    // window has to correct rows rather than duplicate them.
    const { error } = await supabase
      .from("metrics_daily")
      .upsert(rows, { onConflict: "campaign_id,date" });

    if (error) throw new Error(`Writing metrics: ${error.message}`);

    const message = `Synced ${rows.length} campaign-days.`;
    await close("success", rows.length, message);
    return json({ ok: true, rows: rows.length, message });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    await close("error", 0, message);
    return json({ ok: false, message }, 500);
  }
}

/**
 * Maps each platform campaign id to a local campaign row, creating rows for
 * campaigns seen for the first time.
 *
 * Matching is on external_id rather than name, so renaming a campaign in the
 * ad platform keeps its history attached instead of silently starting a second
 * campaign with the same spend split across both.
 */
async function resolveCampaigns(
  supabase: ReturnType<typeof adminClient>,
  platform: Platform,
  stats: DailyStat[]
): Promise<Map<string, string>> {
  const seen = new Map<string, string>();
  for (const stat of stats) {
    if (!seen.has(stat.externalCampaignId)) {
      seen.set(stat.externalCampaignId, stat.campaignName);
    }
  }

  const { data: existing, error } = await supabase
    .from("campaigns")
    .select("id, external_id")
    .eq("platform", platform)
    .in("external_id", [...seen.keys()]);

  if (error) throw new Error(`Reading campaigns: ${error.message}`);

  const resolved = new Map<string, string>();
  for (const row of existing ?? []) {
    if (row.external_id) resolved.set(row.external_id as string, row.id as string);
  }

  const missing = [...seen.entries()].filter(([id]) => !resolved.has(id));

  if (missing.length > 0) {
    const { data: created, error: insertError } = await supabase
      .from("campaigns")
      .insert(
        missing.map(([externalId, name]) => ({
          platform,
          external_id: externalId,
          name,
          status: "active",
        }))
      )
      .select("id, external_id");

    if (insertError) throw new Error(`Creating campaigns: ${insertError.message}`);

    for (const row of created ?? []) {
      resolved.set(row.external_id as string, row.id as string);
    }
  }

  return resolved;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Throws a message naming the missing secret rather than failing on undefined. */
export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(
      `Missing secret ${name}. Set it with: supabase secrets set ${name}=...`
    );
  }
  return value;
}
