import { useMemo, useState, type FormEvent } from "react";
import {
  DateRangePicker,
  presetRange,
  type DateRange,
  type RangePreset,
} from "@/components/DateRange";
import {
  EmptyState,
  ErrorNote,
  InfoNote,
  PlatformTag,
  Spinner,
  VerdictPill,
} from "@/components/ui";
import { money, money0, count, percent } from "@/lib/format";
import { performanceByCampaign, unitEconomics } from "@/lib/metrics";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SETTINGS, useAdsData } from "@/lib/useAdsData";
import {
  COVERAGE_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
  type CampaignStatus,
  type CoverageLine,
  type Platform,
} from "@/lib/types";

const BLANK = {
  platform: "google" as Platform,
  name: "",
  coverage_line: "auto" as CoverageLine | "mixed",
  utm_campaign: "",
  daily_budget: "",
  status: "active" as CampaignStatus,
};

export default function Campaigns() {
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [range, setRange] = useState<DateRange>(() => presetRange("30d"));
  const { data, loading, error, reload } = useAdsData(range);

  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const settings = data.settings ?? DEFAULT_SETTINGS;
  const econ = unitEconomics(settings);

  const rows = useMemo(
    () =>
      performanceByCampaign(
        data.campaigns,
        data.metrics,
        data.leads,
        settings
      ).sort((a, b) => b.performance.spend - a.performance.spend),
    [data, settings]
  );

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const { error: insertError } = await supabase.from("campaigns").insert({
      platform: form.platform,
      name: form.name.trim(),
      coverage_line: form.coverage_line,
      // Empty string would occupy the tag and match nothing; null is correct.
      utm_campaign: form.utm_campaign.trim() || null,
      daily_budget: form.daily_budget ? Number(form.daily_budget) : null,
      status: form.status,
    });

    if (insertError) {
      setFormError(insertError.message);
    } else {
      setForm(BLANK);
      setShowForm(false);
      await reload();
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: CampaignStatus) {
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({ status })
      .eq("id", id);
    if (!updateError) await reload();
  }

  async function remove(id: string, name: string) {
    const ok = window.confirm(
      `Delete "${name}"?\n\nThis also deletes its daily spend history. Leads stay, but lose their attribution.`
    );
    if (!ok) return;
    const { error: deleteError } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);
    if (!deleteError) await reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary dark:text-ink-primaryDark">
            Campaigns
          </h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondaryDark">
            Performance for the selected range, ranked by spend.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            preset={preset}
            range={range}
            onChange={(nextPreset, nextRange) => {
              setPreset(nextPreset);
              setRange(nextRange);
            }}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "Add campaign"}
          </button>
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="platform">Platform</label>
              <select
                id="platform"
                className="field"
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value as Platform })
                }
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label" htmlFor="name">Campaign name</label>
              <input
                id="name"
                className="field"
                required
                placeholder="Search — Auto Quotes"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="coverage">Coverage line</label>
              <select
                id="coverage"
                className="field"
                value={form.coverage_line}
                onChange={(e) =>
                  setForm({
                    ...form,
                    coverage_line: e.target.value as CoverageLine | "mixed",
                  })
                }
              >
                {(Object.keys(COVERAGE_LABELS) as CoverageLine[]).map((line) => (
                  <option key={line} value={line}>{COVERAGE_LABELS[line]}</option>
                ))}
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="budget">Daily budget</label>
              <input
                id="budget"
                className="field"
                type="number"
                min="0"
                step="0.01"
                placeholder="25.00"
                value={form.daily_budget}
                onChange={(e) =>
                  setForm({ ...form, daily_budget: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label" htmlFor="utm">utm_campaign tag</label>
              <input
                id="utm"
                className="field"
                placeholder="goog-auto-search"
                value={form.utm_campaign}
                onChange={(e) =>
                  setForm({ ...form, utm_campaign: e.target.value })
                }
              />
            </div>
          </div>

          <InfoNote>
            The <code>utm_campaign</code> tag is what links spend to actual
            leads. Put the same value on the end of this campaign's landing page
            URL —{" "}
            <code>?utm_source={form.platform}&amp;utm_campaign={form.utm_campaign || "your-tag"}</code>{" "}
            — and any lead that arrives with it attributes here automatically.
          </InfoNote>

          {formError && <ErrorNote>{formError}</ErrorNote>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Create campaign"}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading campaigns" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          body="Add one for each campaign you're running. You can create them before you spend anything — that way the tracking tags are ready when you launch."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm tabular">
            <thead>
              <tr className="border-b border-black/10 text-xs text-ink-secondary dark:border-white/10 dark:text-ink-secondaryDark">
                <th scope="col" className="py-2 text-left font-medium">Campaign</th>
                <th scope="col" className="py-2 text-left font-medium">Status</th>
                <th scope="col" className="py-2 text-right font-medium">Spend</th>
                <th scope="col" className="py-2 text-right font-medium">Clicks</th>
                <th scope="col" className="py-2 text-right font-medium">CTR</th>
                <th scope="col" className="py-2 text-right font-medium">Leads</th>
                <th scope="col" className="py-2 text-right font-medium">Cost / lead</th>
                <th scope="col" className="py-2 text-left font-medium">Verdict</th>
                <th scope="col" className="py-2 text-right font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ campaign, performance }) => (
                <tr
                  key={campaign.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  <th scope="row" className="max-w-64 py-2.5 text-left font-normal">
                    <div className="truncate text-ink-primary dark:text-ink-primaryDark">
                      {campaign.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                      <PlatformTag platform={campaign.platform} />
                      {campaign.coverage_line && (
                        <span>· {campaign.coverage_line}</span>
                      )}
                      {campaign.utm_campaign && (
                        <span className="truncate">· {campaign.utm_campaign}</span>
                      )}
                    </div>
                  </th>

                  <td className="py-2.5">
                    <select
                      className="field w-auto py-1 text-xs"
                      value={campaign.status}
                      onChange={(e) =>
                        updateStatus(
                          campaign.id,
                          e.target.value as CampaignStatus
                        )
                      }
                      aria-label={`Status for ${campaign.name}`}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="ended">Ended</option>
                      <option value="draft">Draft</option>
                    </select>
                  </td>

                  <td className="py-2.5 text-right">{money(performance.spend)}</td>
                  <td className="py-2.5 text-right">{count(performance.clicks)}</td>
                  <td className="py-2.5 text-right">{percent(performance.ctr)}</td>
                  <td className="py-2.5 text-right">{count(performance.leads.total)}</td>
                  <td className="py-2.5 text-right">{money(performance.cpl)}</td>
                  <td className="py-2.5">
                    <VerdictPill verdict={performance.verdict} />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => remove(campaign.id, campaign.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-3 text-xs text-ink-muted">
            Verdicts compare cost per lead against your target of{" "}
            {money0(econ.targetCpl)} and your break-even of{" "}
            {money0(econ.breakEvenCpl)}. Campaigns with fewer than 3 leads stay
            unjudged — one expensive lead in a slow week isn't evidence.
          </p>
        </div>
      )}
    </div>
  );
}
