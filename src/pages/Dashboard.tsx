import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DateRangePicker,
  presetRange,
  type DateRange,
  type RangePreset,
} from "@/components/DateRange";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { TrendChart } from "@/components/charts/TrendChart";
import { ComparisonBars } from "@/components/charts/ComparisonBars";
import {
  EmptyState,
  ErrorNote,
  PlatformTag,
  Spinner,
  StatTile,
  VerdictPill,
} from "@/components/ui";
import { SERIES } from "@/lib/palette";
import { money, money0, count, percent, ratio } from "@/lib/format";
import {
  computePerformance,
  performanceByPlatform,
  stackedDailyByPlatform,
  unitEconomics,
} from "@/lib/metrics";
import { DEFAULT_SETTINGS, useAdsData } from "@/lib/useAdsData";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/types";

export default function Dashboard() {
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [range, setRange] = useState<DateRange>(() => presetRange("30d"));
  const { data, loading, error } = useAdsData(range);

  const settings = data.settings ?? DEFAULT_SETTINGS;

  const view = useMemo(() => {
    const overall = computePerformance(data.metrics, data.leads, settings);
    const byPlatform = performanceByPlatform(
      data.campaigns,
      data.metrics,
      data.leads,
      settings
    );
    const daily = stackedDailyByPlatform(
      data.campaigns,
      data.metrics,
      range.from,
      range.to
    );
    return { overall, byPlatform, daily, econ: unitEconomics(settings) };
  }, [data, settings, range.from, range.to]);

  const { overall, byPlatform, daily, econ } = view;

  const series = PLATFORMS.map((platform) => ({
    key: platform,
    label: PLATFORM_LABELS[platform],
    color: SERIES[platform],
  }));

  const hasAnyCampaign = data.campaigns.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary dark:text-ink-primaryDark">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondaryDark">
            Every platform in one place, measured against what a customer is
            worth to you.
          </p>
        </div>
        <DateRangePicker
          preset={preset}
          range={range}
          onChange={(nextPreset, nextRange) => {
            setPreset(nextPreset);
            setRange(nextRange);
          }}
        />
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading ? (
        <Spinner label="Loading campaign data" />
      ) : !hasAnyCampaign ? (
        <EmptyState
          title="No campaigns yet"
          body="Add your campaigns and enter what you've spent so far, or import a report straight from a platform's export. You don't need API access to start."
          action={
            <div className="flex justify-center gap-2">
              <Link className="btn-primary" to="/campaigns">
                Add a campaign
              </Link>
              <Link className="btn-secondary" to="/import">
                Import a report
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {/* Headline figures. Cost per lead leads because it is the number
              that decides next month's budget. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Cost per lead"
              value={money(overall.cpl)}
              tone={
                overall.verdict === "good"
                  ? "good"
                  : overall.verdict === "critical"
                    ? "critical"
                    : "neutral"
              }
              sub={
                <span className="flex items-center gap-1.5">
                  <VerdictPill verdict={overall.verdict} />
                  <span>target {money0(econ.targetCpl)}</span>
                </span>
              }
            />
            <StatTile
              label="Total spend"
              value={money0(overall.spend)}
              sub={`${count(overall.clicks)} clicks · ${money(overall.cpc)} per click`}
            />
            <StatTile
              label="Leads"
              value={count(overall.leads.total)}
              sub={`${count(overall.leads.sold)} sold · ${percent(overall.closeRate)} close rate`}
            />
            <StatTile
              label="Return on spend"
              value={ratio(overall.roas)}
              tone={
                overall.roas == null
                  ? "neutral"
                  : overall.roas >= 1
                    ? "good"
                    : "critical"
              }
              sub={`${money0(overall.leads.estCommission)} est. commission`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartFrame
              title="Daily spend by platform"
              subtitle={`${money0(overall.spend)} across ${daily.length} days`}
              series={series}
              tableHeaders={["Date", ...PLATFORMS.map((p) => PLATFORM_LABELS[p]), "Total"]}
              tableRows={daily.map((day) => [
                day.date,
                ...PLATFORMS.map((p) => money(day.values[p] ?? 0)),
                money(
                  PLATFORMS.reduce((sum, p) => sum + (day.values[p] ?? 0), 0)
                ),
              ])}
            >
              <TrendChart
                points={daily}
                series={series}
                formatValue={(n) => money0(n)}
                emptyMessage="No spend recorded in this range."
              />
            </ChartFrame>

            <ChartFrame
              title="Cost per lead by platform"
              subtitle="Measured against your target — the dashed line"
              series={series}
              tableHeaders={["Platform", "Spend", "Leads", "Cost per lead"]}
              tableRows={PLATFORMS.map((platform) => {
                const p = byPlatform.get(platform)!;
                return [
                  PLATFORM_LABELS[platform],
                  money(p.spend),
                  count(p.leads.total),
                  money(p.cpl),
                ];
              })}
            >
              <ComparisonBars
                bars={PLATFORMS.map((platform) => {
                  const p = byPlatform.get(platform)!;
                  return {
                    key: platform,
                    label: PLATFORM_LABELS[platform],
                    value: p.cpl,
                    color: SERIES[platform],
                    sublabel: `${money0(p.spend)} · ${count(p.leads.total)} leads`,
                  };
                })}
                reference={{
                  value: econ.targetCpl,
                  label: `target ${money0(econ.targetCpl)}`,
                }}
                formatValue={(n) => money(n)}
              />
            </ChartFrame>
          </div>

          <section className="card overflow-x-auto">
            <h2 className="mb-3 text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
              Platform breakdown
            </h2>
            <table className="w-full min-w-[720px] text-sm tabular">
              <thead>
                <tr className="border-b border-black/10 text-xs text-ink-secondary dark:border-white/10 dark:text-ink-secondaryDark">
                  <th scope="col" className="py-2 text-left font-medium">Platform</th>
                  <th scope="col" className="py-2 text-right font-medium">Spend</th>
                  <th scope="col" className="py-2 text-right font-medium">Clicks</th>
                  <th scope="col" className="py-2 text-right font-medium">CPC</th>
                  <th scope="col" className="py-2 text-right font-medium">Leads</th>
                  <th scope="col" className="py-2 text-right font-medium">Cost / lead</th>
                  <th scope="col" className="py-2 text-right font-medium">Sold</th>
                  <th scope="col" className="py-2 text-right font-medium">Cost / policy</th>
                  <th scope="col" className="py-2 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORMS.map((platform) => {
                  const p = byPlatform.get(platform)!;
                  return (
                    <tr
                      key={platform}
                      className="border-b border-black/5 last:border-0 dark:border-white/5"
                    >
                      <th scope="row" className="py-2 text-left font-normal">
                        <PlatformTag platform={platform} />
                      </th>
                      <td className="py-2 text-right">{money(p.spend)}</td>
                      <td className="py-2 text-right">{count(p.clicks)}</td>
                      <td className="py-2 text-right">{money(p.cpc)}</td>
                      <td className="py-2 text-right">{count(p.leads.total)}</td>
                      <td className="py-2 text-right">{money(p.cpl)}</td>
                      <td className="py-2 text-right">{count(p.leads.sold)}</td>
                      <td className="py-2 text-right">{money(p.costPerPolicy)}</td>
                      <td
                        className={`py-2 text-right ${
                          p.spend === 0
                            ? ""
                            : p.netContribution >= 0
                              ? "text-status-good"
                              : "text-status-critical"
                        }`}
                      >
                        {p.spend === 0 ? "—" : money0(p.netContribution)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-ink-muted">
              Net is estimated commission minus spend, using{" "}
              {percent(settings.default_commission_rate, 0)} commission over{" "}
              {settings.avg_retention_years} years of renewals. Adjust those on{" "}
              <Link className="underline" to="/settings">
                Settings
              </Link>
              .
            </p>
          </section>
        </>
      )}
    </div>
  );
}
