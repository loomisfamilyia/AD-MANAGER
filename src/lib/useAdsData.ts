import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Campaign, Lead, MetricRow, Settings } from "./types";
import type { DateRange } from "@/components/DateRange";

export interface AdsData {
  campaigns: Campaign[];
  metrics: MetricRow[];
  leads: Lead[];
  settings: Settings | null;
}

const EMPTY: AdsData = {
  campaigns: [],
  metrics: [],
  leads: [],
  settings: null,
};

/**
 * Loads everything the dashboard needs for a date range in one pass.
 *
 * All four queries run in parallel and the aggregation happens client-side. At
 * agency scale that is a few thousand rows at most, and it buys a single code
 * path for the metrics math instead of one in SQL and another in TypeScript
 * that quietly drift apart.
 */
export function useAdsData(range: DateRange) {
  const [data, setData] = useState<AdsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Local midnight boundaries converted to instants, so a lead created at
    // 11pm counts toward that day rather than the next one in UTC.
    const fromInstant = new Date(`${range.from}T00:00:00`).toISOString();
    const toInstant = new Date(`${range.to}T23:59:59.999`).toISOString();

    const [campaigns, metrics, leads, settings] = await Promise.all([
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase
        .from("metrics_daily")
        .select("*")
        .gte("date", range.from)
        .lte("date", range.to),
      supabase
        .from("leads")
        .select("*")
        .gte("created_at", fromInstant)
        .lte("created_at", toInstant)
        .order("created_at", { ascending: false }),
      supabase.from("settings").select("*").limit(1).maybeSingle(),
    ]);

    const failure =
      campaigns.error ?? metrics.error ?? leads.error ?? settings.error;

    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }

    setData({
      campaigns: (campaigns.data ?? []) as Campaign[],
      metrics: (metrics.data ?? []) as MetricRow[],
      leads: (leads.data ?? []) as Lead[],
      settings: (settings.data ?? null) as Settings | null,
    });
    setLoading(false);
  }, [range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/**
 * Fallback economics used only if the settings row is missing.
 *
 * Mirrors the schema defaults so a dashboard rendered before Settings is
 * visited shows the same targets it will show afterward.
 */
export const DEFAULT_SETTINGS: Settings = {
  id: true,
  agency_name: "Loomis Family Insurance Agency",
  default_commission_rate: 0.12,
  expected_close_rate: 0.2,
  avg_annual_premium: 1800,
  avg_retention_years: 3,
  target_cpl_ratio: 0.5,
  target_cpl_override: null,
  updated_at: new Date().toISOString(),
};
