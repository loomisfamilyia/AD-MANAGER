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
  LeadStatusPill,
  PlatformTag,
  Spinner,
} from "@/components/ui";
import { money, count, percent, mediumDate } from "@/lib/format";
import { sumLeads, safeDiv } from "@/lib/metrics";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SETTINGS, useAdsData } from "@/lib/useAdsData";
import {
  COVERAGE_LABELS,
  LEAD_STATUS_LABELS,
  PIPELINE_ORDER,
  type CoverageLine,
  type LeadStatus,
} from "@/lib/types";

const BLANK = {
  full_name: "",
  email: "",
  phone: "",
  coverage_line: "auto" as CoverageLine,
  campaign_id: "",
  status: "new" as LeadStatus,
  quoted_premium: "",
  sold_premium: "",
  notes: "",
};

export default function Leads() {
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [range, setRange] = useState<DateRange>(() => presetRange("30d"));
  const { data, loading, error, reload } = useAdsData(range);

  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const settings = data.settings ?? DEFAULT_SETTINGS;
  const campaignById = useMemo(
    () => new Map(data.campaigns.map((c) => [c.id, c])),
    [data.campaigns]
  );

  const totals = useMemo(
    () => sumLeads(data.leads, settings),
    [data.leads, settings]
  );

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const { error: insertError } = await supabase.from("leads").insert({
      full_name: form.full_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      coverage_line: form.coverage_line,
      campaign_id: form.campaign_id || null,
      status: form.status,
      quoted_premium: form.quoted_premium ? Number(form.quoted_premium) : null,
      sold_premium: form.sold_premium ? Number(form.sold_premium) : null,
      notes: form.notes.trim() || null,
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

  async function patch(id: string, changes: Record<string, unknown>) {
    const { error: updateError } = await supabase
      .from("leads")
      .update(changes)
      .eq("id", id);
    if (!updateError) await reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary dark:text-ink-primaryDark">
            Leads
          </h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondaryDark">
            Where the ad money actually lands. Keep statuses current — every
            cost-per-policy number on the dashboard reads from this table.
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
            {showForm ? "Cancel" : "Add lead"}
          </button>
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {/* Funnel counts. Shown as a labeled row rather than a funnel chart —
          four numbers don't need a chart, and a funnel shape would imply the
          stages are proportional areas when they're just counts. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {PIPELINE_ORDER.map((status) => (
          <div key={status} className="card">
            <div className="text-xs font-medium text-ink-secondary dark:text-ink-secondaryDark">
              {LEAD_STATUS_LABELS[status]}
            </div>
            <div className="mt-1 text-2xl font-semibold text-ink-primary dark:text-ink-primaryDark">
              {count(totals.byStatus[status])}
            </div>
            {status === "sold" && (
              <div className="mt-1 text-xs text-ink-muted">
                {percent(safeDiv(totals.sold, totals.total))} of all leads
              </div>
            )}
          </div>
        ))}
        <div className="card">
          <div className="text-xs font-medium text-ink-secondary dark:text-ink-secondaryDark">
            Written premium
          </div>
          <div className="mt-1 text-2xl font-semibold text-ink-primary dark:text-ink-primaryDark">
            {money(totals.writtenPremium, 0)}
          </div>
          <div className="mt-1 text-xs text-ink-muted">
            {count(totals.byStatus.lost)} lost
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="lead-name">Name</label>
              <input
                id="lead-name"
                className="field"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="lead-email">Email</label>
              <input
                id="lead-email"
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="lead-phone">Phone</label>
              <input
                id="lead-phone"
                className="field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="lead-coverage">Coverage</label>
              <select
                id="lead-coverage"
                className="field"
                value={form.coverage_line}
                onChange={(e) =>
                  setForm({
                    ...form,
                    coverage_line: e.target.value as CoverageLine,
                  })
                }
              >
                {(Object.keys(COVERAGE_LABELS) as CoverageLine[]).map((line) => (
                  <option key={line} value={line}>{COVERAGE_LABELS[line]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="lead-campaign">Came from</label>
              <select
                id="lead-campaign"
                className="field"
                value={form.campaign_id}
                onChange={(e) =>
                  setForm({ ...form, campaign_id: e.target.value })
                }
              >
                <option value="">Unknown / not from an ad</option>
                {data.campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="lead-status">Status</label>
              <select
                id="lead-status"
                className="field"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as LeadStatus })
                }
              >
                {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="lead-quoted">
                Quoted premium (annual)
              </label>
              <input
                id="lead-quoted"
                type="number"
                min="0"
                step="0.01"
                className="field"
                value={form.quoted_premium}
                onChange={(e) =>
                  setForm({ ...form, quoted_premium: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="lead-sold">
                Sold premium (annual)
              </label>
              <input
                id="lead-sold"
                type="number"
                min="0"
                step="0.01"
                className="field"
                value={form.sold_premium}
                onChange={(e) =>
                  setForm({ ...form, sold_premium: e.target.value })
                }
              />
            </div>
            <div className="lg:col-span-3">
              <label className="label" htmlFor="lead-notes">Notes</label>
              <input
                id="lead-notes"
                className="field"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          {formError && <ErrorNote>{formError}</ErrorNote>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Add lead"}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading leads" />
      ) : data.leads.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="No leads in this range"
            body="Add leads as they come in, or widen the date range. Leads that arrive through a tagged landing-page link attribute to their campaign automatically."
          />
          <InfoNote>
            Already collecting quote requests on your landing page? Point that
            form at this project's <code>leads</code> table, or paste the
            weekly export into the Import page. Either way the attribution
            math starts working the moment leads carry a{" "}
            <code>utm_campaign</code> value.
          </InfoNote>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs text-ink-secondary dark:border-white/10 dark:text-ink-secondaryDark">
                <th scope="col" className="py-2 text-left font-medium">Lead</th>
                <th scope="col" className="py-2 text-left font-medium">Source</th>
                <th scope="col" className="py-2 text-left font-medium">Status</th>
                <th scope="col" className="py-2 text-right font-medium">Sold premium</th>
                <th scope="col" className="py-2 text-right font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map((lead) => {
                const campaign = lead.campaign_id
                  ? campaignById.get(lead.campaign_id)
                  : undefined;

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-black/5 last:border-0 dark:border-white/5"
                  >
                    <th scope="row" className="py-2.5 text-left font-normal">
                      <div className="text-ink-primary dark:text-ink-primaryDark">
                        {lead.full_name || lead.email || lead.phone || "Unnamed lead"}
                      </div>
                      <div className="mt-0.5 text-xs text-ink-muted">
                        {[lead.email, lead.phone].filter(Boolean).join(" · ") ||
                          "No contact details"}
                        {lead.coverage_line && ` · ${COVERAGE_LABELS[lead.coverage_line]}`}
                      </div>
                    </th>

                    <td className="py-2.5 text-xs">
                      {campaign ? (
                        <>
                          <PlatformTag platform={campaign.platform} />
                          <div className="mt-0.5 max-w-48 truncate text-ink-muted">
                            {campaign.name}
                          </div>
                        </>
                      ) : (
                        <span className="text-ink-muted">
                          {lead.utm_campaign
                            ? `${lead.utm_campaign} (no matching campaign)`
                            : "Not attributed"}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <LeadStatusPill status={lead.status} />
                        <select
                          className="field w-auto py-1 text-xs"
                          value={lead.status}
                          onChange={(e) =>
                            patch(lead.id, { status: e.target.value })
                          }
                          aria-label={`Change status for ${lead.full_name ?? "lead"}`}
                        >
                          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(
                            (s) => (
                              <option key={s} value={s}>
                                {LEAD_STATUS_LABELS[s]}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </td>

                    <td className="py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="field w-28 py-1 text-right text-xs tabular"
                        defaultValue={lead.sold_premium ?? ""}
                        placeholder="—"
                        aria-label={`Sold premium for ${lead.full_name ?? "lead"}`}
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const next = raw === "" ? null : Number(raw);
                          if (next !== (lead.sold_premium ?? null)) {
                            void patch(lead.id, { sold_premium: next });
                          }
                        }}
                      />
                    </td>

                    <td className="py-2.5 text-right text-xs text-ink-muted tabular">
                      {mediumDate(lead.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
