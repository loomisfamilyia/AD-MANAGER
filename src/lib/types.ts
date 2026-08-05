export type Platform = "google" | "meta" | "reddit";

export type CampaignStatus = "active" | "paused" | "ended" | "draft";

export type LeadStatus = "new" | "contacted" | "quoted" | "sold" | "lost";

export type CoverageLine = "auto" | "home" | "life" | "business";

export interface Campaign {
  id: string;
  platform: Platform;
  external_id: string | null;
  name: string;
  status: CampaignStatus;
  objective: string | null;
  daily_budget: number | null;
  coverage_line: CoverageLine | "mixed" | null;
  utm_campaign: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetricRow {
  id: string;
  campaign_id: string;
  date: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  spend: number;
  platform_conversions: number;
  source: "manual" | "csv" | "api";
  synced_at: string;
}

export interface Lead {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  coverage_line: CoverageLine | null;
  status: LeadStatus;
  campaign_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  quoted_premium: number | null;
  sold_premium: number | null;
  commission_rate: number | null;
  notes: string | null;
  created_at: string;
  status_changed_at: string;
}

export interface Settings {
  id: boolean;
  agency_name: string;
  default_commission_rate: number;
  expected_close_rate: number;
  avg_annual_premium: number;
  avg_retention_years: number;
  target_cpl_ratio: number;
  target_cpl_override: number | null;
  updated_at: string;
}

export interface SyncRun {
  id: string;
  platform: Platform;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "error";
  rows_written: number;
  message: string | null;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  google: "Google Ads",
  meta: "Meta",
  reddit: "Reddit",
};

export const PLATFORMS: Platform[] = ["google", "meta", "reddit"];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  sold: "Sold",
  lost: "Lost",
};

/** Pipeline order. `lost` is terminal and deliberately outside the ladder. */
export const PIPELINE_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "sold",
];

export const COVERAGE_LABELS: Record<CoverageLine, string> = {
  auto: "Auto",
  home: "Home",
  life: "Life",
  business: "Business",
};
