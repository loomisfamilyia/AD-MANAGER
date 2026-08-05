import type {
  Campaign,
  Lead,
  LeadStatus,
  MetricRow,
  Platform,
  Settings,
} from "./types";

/**
 * The metrics engine.
 *
 * Ad platforms report cost per click. Nobody buys a click. This module turns
 * spend into the numbers an insurance agency actually decides on: what a lead
 * costs, what a policy costs, and whether that is above or below what a
 * customer is worth to you.
 *
 * All aggregation happens here rather than in SQL. At agency scale the whole
 * dataset is a few thousand rows, and keeping the math in one testable place
 * beats scattering it across queries and components.
 */

/**
 * Division that refuses to invent numbers.
 *
 * Returns null rather than 0, Infinity, or NaN when the denominator is zero.
 * This matters more than it looks: before the first campaign runs, *every*
 * rate in this app is 0/0, and a dashboard that renders "$0.00 cost per lead"
 * reads as "leads are free" rather than "no data yet".
 */
export function safeDiv(
  numerator: number,
  denominator: number
): number | null {
  if (!denominator || !Number.isFinite(denominator)) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

// ---------------------------------------------------------------------------
// Unit economics
// ---------------------------------------------------------------------------

export interface UnitEconomics {
  /** Lifetime commission from one sold policy, before acquisition cost. */
  policyValue: number;
  /** What one raw lead is worth, discounted by how often leads close. */
  leadValue: number;
  /** Pay more than this per lead and the campaign loses money. */
  breakEvenCpl: number;
  /** What you're aiming for — break-even with your margin held back. */
  targetCpl: number;
  /** True when targetCpl came from a manual override, not the calculation. */
  isOverride: boolean;
}

/**
 * The chain that turns five settings into a spending limit:
 *
 *   policy value = annual premium x commission rate x years retained
 *   lead value   = policy value x close rate
 *   break-even   = lead value          (spend this much, earn it back, net zero)
 *   target       = break-even x ratio  (hold back a margin)
 *
 * The retention term is the one people leave out, and leaving it out makes
 * every campaign look like a loser. An auto policy paying $216/yr in
 * commission is worth $216 if you ignore renewals and $648 if it stays three
 * years. Agencies that budget off year-one commission alone systematically
 * underbid and lose the auction to competitors doing the full sum.
 */
export function unitEconomics(settings: Settings): UnitEconomics {
  const policyValue =
    settings.avg_annual_premium *
    settings.default_commission_rate *
    settings.avg_retention_years;

  const leadValue = policyValue * settings.expected_close_rate;
  const breakEvenCpl = leadValue;

  const isOverride = settings.target_cpl_override != null;
  const targetCpl = isOverride
    ? (settings.target_cpl_override as number)
    : breakEvenCpl * settings.target_cpl_ratio;

  return { policyValue, leadValue, breakEvenCpl, targetCpl, isOverride };
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export interface SpendTotals {
  impressions: number;
  clicks: number;
  spend: number;
  platformConversions: number;
}

export function emptySpend(): SpendTotals {
  return { impressions: 0, clicks: 0, spend: 0, platformConversions: 0 };
}

export function sumMetrics(rows: MetricRow[]): SpendTotals {
  return rows.reduce<SpendTotals>((acc, r) => {
    acc.impressions += Number(r.impressions) || 0;
    acc.clicks += Number(r.clicks) || 0;
    acc.spend += Number(r.spend) || 0;
    acc.platformConversions += Number(r.platform_conversions) || 0;
    return acc;
  }, emptySpend());
}

export interface LeadTotals {
  total: number;
  byStatus: Record<LeadStatus, number>;
  /** Reached the quoted stage or beyond — quoting is real work, so it's a KPI. */
  quotedOrBetter: number;
  sold: number;
  /** Annual premium actually written. */
  writtenPremium: number;
  /** Estimated commission across the retention window. */
  estCommission: number;
}

export function emptyLeads(): LeadTotals {
  return {
    total: 0,
    byStatus: { new: 0, contacted: 0, quoted: 0, sold: 0, lost: 0 },
    quotedOrBetter: 0,
    sold: 0,
    writtenPremium: 0,
    estCommission: 0,
  };
}

export function sumLeads(leads: Lead[], settings: Settings): LeadTotals {
  const totals = emptyLeads();

  for (const lead of leads) {
    totals.total += 1;
    totals.byStatus[lead.status] += 1;

    if (lead.status === "quoted" || lead.status === "sold") {
      totals.quotedOrBetter += 1;
    }

    if (lead.status === "sold") {
      totals.sold += 1;
      const premium = Number(lead.sold_premium) || 0;
      totals.writtenPremium += premium;
      // A per-lead rate wins when set — commercial and life policies pay very
      // differently from auto, and averaging them hides which one pays.
      const rate =
        lead.commission_rate != null
          ? Number(lead.commission_rate)
          : settings.default_commission_rate;
      totals.estCommission += premium * rate * settings.avg_retention_years;
    }
  }

  return totals;
}

// ---------------------------------------------------------------------------
// Derived performance
// ---------------------------------------------------------------------------

export type Verdict = "no-data" | "good" | "warning" | "critical";

export interface Performance extends SpendTotals {
  leads: LeadTotals;

  // Platform-native efficiency
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;

  // The ones that matter
  cpl: number | null;
  costPerQuote: number | null;
  costPerPolicy: number | null;

  /** Estimated commission divided by spend. Above 1.0 means it paid for itself. */
  roas: number | null;

  closeRate: number | null;
  quoteRate: number | null;

  /** Estimated commission minus spend. Negative means it cost you money. */
  netContribution: number;

  verdict: Verdict;
}

/**
 * Grades a campaign against its target CPL.
 *
 * Deliberately conservative about calling something bad: with fewer than
 * `MIN_LEADS_FOR_VERDICT` leads the sample is too small to distinguish a bad
 * campaign from an unlucky week, so it stays unjudged. Pausing a campaign on
 * one expensive lead is the most common way to kill a profitable one.
 */
const MIN_LEADS_FOR_VERDICT = 3;

function gradeCpl(
  cpl: number | null,
  leadCount: number,
  targetCpl: number,
  breakEvenCpl: number
): Verdict {
  if (cpl == null || leadCount < MIN_LEADS_FOR_VERDICT) return "no-data";
  if (cpl <= targetCpl) return "good";
  // Between target and break-even: thinner margin than you wanted, but each
  // lead still earns more than it cost.
  if (cpl <= breakEvenCpl) return "warning";
  return "critical";
}

export function computePerformance(
  metrics: MetricRow[],
  leads: Lead[],
  settings: Settings
): Performance {
  const spend = sumMetrics(metrics);
  const leadTotals = sumLeads(leads, settings);
  const econ = unitEconomics(settings);

  const cpl = safeDiv(spend.spend, leadTotals.total);

  return {
    ...spend,
    leads: leadTotals,

    ctr: safeDiv(spend.clicks, spend.impressions),
    cpc: safeDiv(spend.spend, spend.clicks),
    cpm: safeDiv(spend.spend * 1000, spend.impressions),

    cpl,
    costPerQuote: safeDiv(spend.spend, leadTotals.quotedOrBetter),
    costPerPolicy: safeDiv(spend.spend, leadTotals.sold),

    roas: safeDiv(leadTotals.estCommission, spend.spend),

    closeRate: safeDiv(leadTotals.sold, leadTotals.total),
    quoteRate: safeDiv(leadTotals.quotedOrBetter, leadTotals.total),

    netContribution: leadTotals.estCommission - spend.spend,

    verdict: gradeCpl(cpl, leadTotals.total, econ.targetCpl, econ.breakEvenCpl),
  };
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

export interface CampaignPerformance {
  campaign: Campaign;
  performance: Performance;
}

export function performanceByCampaign(
  campaigns: Campaign[],
  metrics: MetricRow[],
  leads: Lead[],
  settings: Settings
): CampaignPerformance[] {
  const metricsByCampaign = groupBy(metrics, (m) => m.campaign_id);
  const leadsByCampaign = groupBy(leads, (l) => l.campaign_id ?? "__none__");

  return campaigns.map((campaign) => ({
    campaign,
    performance: computePerformance(
      metricsByCampaign.get(campaign.id) ?? [],
      leadsByCampaign.get(campaign.id) ?? [],
      settings
    ),
  }));
}

export function performanceByPlatform(
  campaigns: Campaign[],
  metrics: MetricRow[],
  leads: Lead[],
  settings: Settings
): Map<Platform, Performance> {
  const platformOf = new Map(campaigns.map((c) => [c.id, c.platform]));
  const result = new Map<Platform, Performance>();

  for (const platform of ["google", "meta", "reddit"] as Platform[]) {
    const platformMetrics = metrics.filter(
      (m) => platformOf.get(m.campaign_id) === platform
    );
    const platformLeads = leads.filter(
      (l) => l.campaign_id && platformOf.get(l.campaign_id) === platform
    );
    result.set(
      platform,
      computePerformance(platformMetrics, platformLeads, settings)
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Time series
// ---------------------------------------------------------------------------

export interface DayPoint {
  date: string;
  spend: number;
  clicks: number;
  impressions: number;
  leads: number;
}

/**
 * One point per day across the range, including days with no activity.
 *
 * Zero-filling matters: a line chart built only from days that have rows draws
 * a straight line across a weekend you didn't spend on, which reads as steady
 * spending rather than a gap.
 */
export function dailySeries(
  metrics: MetricRow[],
  leads: Lead[],
  fromISO: string,
  toISO: string
): DayPoint[] {
  const byDate = new Map<string, DayPoint>();

  for (
    let d = new Date(`${fromISO}T00:00:00`);
    toISODateLocal(d) <= toISO;
    d.setDate(d.getDate() + 1)
  ) {
    const key = toISODateLocal(d);
    byDate.set(key, {
      date: key,
      spend: 0,
      clicks: 0,
      impressions: 0,
      leads: 0,
    });
  }

  for (const m of metrics) {
    const point = byDate.get(m.date);
    if (!point) continue;
    point.spend += Number(m.spend) || 0;
    point.clicks += Number(m.clicks) || 0;
    point.impressions += Number(m.impressions) || 0;
  }

  for (const lead of leads) {
    const key = toISODateLocal(new Date(lead.created_at));
    const point = byDate.get(key);
    if (point) point.leads += 1;
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface StackedDay {
  date: string;
  values: Record<string, number>;
}

/**
 * Daily spend split by platform, zero-filled across the whole range.
 *
 * Shaped for the stacked bar chart: one entry per day, each holding a value
 * per platform. Days with no spend are present with zeros so the x-axis stays
 * a real timeline rather than a list of days that happened to have activity.
 */
export function stackedDailyByPlatform(
  campaigns: Campaign[],
  metrics: MetricRow[],
  fromISO: string,
  toISO: string,
  field: "spend" | "clicks" | "impressions" = "spend"
): StackedDay[] {
  const platformOf = new Map(campaigns.map((c) => [c.id, c.platform]));
  const byDate = new Map<string, StackedDay>();

  for (
    let d = new Date(`${fromISO}T00:00:00`);
    toISODateLocal(d) <= toISO;
    d.setDate(d.getDate() + 1)
  ) {
    byDate.set(toISODateLocal(d), {
      date: toISODateLocal(d),
      values: { google: 0, meta: 0, reddit: 0 },
    });
  }

  for (const row of metrics) {
    const day = byDate.get(row.date);
    const platform = platformOf.get(row.campaign_id);
    if (!day || !platform) continue;
    day.values[platform] += Number(row[field]) || 0;
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}
