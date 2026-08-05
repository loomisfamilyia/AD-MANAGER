import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ErrorNote, InfoNote, Spinner } from "@/components/ui";
import { money, count, toISODate } from "@/lib/format";
import {
  collapseByCampaignDate,
  importReport,
  type ImportResult,
} from "@/lib/csv";
import { supabase } from "@/lib/supabase";
import {
  PLATFORMS,
  PLATFORM_LABELS,
  type Campaign,
  type Platform,
} from "@/lib/types";

const CREATE_NEW = "__create__";
const SKIP = "__skip__";

export default function Import() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadCampaigns() {
    const { data, error: loadError } = await supabase
      .from("campaigns")
      .select("*")
      .order("name");
    if (loadError) setError(loadError.message);
    else setCampaigns((data ?? []) as Campaign[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary dark:text-ink-primaryDark">
          Import
        </h1>
        <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondaryDark">
          Get numbers in without waiting on API approvals. Both paths write to
          the same place the connectors do.
        </p>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <InfoNote>{notice}</InfoNote>}

      {loading ? (
        <Spinner label="Loading campaigns" />
      ) : campaigns.length === 0 ? (
        <InfoNote>
          Add a campaign first — imported numbers have to attach to one.
        </InfoNote>
      ) : (
        <>
          <ManualEntry
            campaigns={campaigns}
            onSaved={(message) => {
              setNotice(message);
              setError(null);
            }}
            onError={setError}
          />
          <CsvImport
            campaigns={campaigns}
            onSaved={async (message) => {
              setNotice(message);
              setError(null);
              await loadCampaigns();
            }}
            onError={setError}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manual entry
// ---------------------------------------------------------------------------

function ManualEntry({
  campaigns,
  onSaved,
  onError,
}: {
  campaigns: Campaign[];
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [spend, setSpend] = useState("");
  const [conversions, setConversions] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    // Upsert, not insert: re-entering a day you already logged corrects it
    // rather than failing on the unique constraint.
    const { error } = await supabase.from("metrics_daily").upsert(
      {
        campaign_id: campaignId,
        date,
        impressions: Number(impressions) || 0,
        clicks: Number(clicks) || 0,
        spend: Number(spend) || 0,
        platform_conversions: Number(conversions) || 0,
        source: "manual",
        synced_at: new Date().toISOString(),
      },
      { onConflict: "campaign_id,date" }
    );

    if (error) onError(error.message);
    else {
      onSaved(`Saved ${date}.`);
      setImpressions("");
      setClicks("");
      setSpend("");
      setConversions("");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
          Enter a day by hand
        </h2>
        <p className="mt-0.5 text-xs text-ink-secondary dark:text-ink-secondaryDark">
          Re-entering a date you already saved overwrites it, so correcting a
          typo is just entering it again.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="label" htmlFor="m-campaign">Campaign</label>
          <select
            id="m-campaign"
            className="field"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {PLATFORM_LABELS[campaign.platform]} — {campaign.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="m-date">Date</label>
          <input
            id="m-date"
            type="date"
            className="field"
            required
            max={toISODate(new Date())}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="m-spend">Spend</label>
          <input
            id="m-spend"
            type="number"
            min="0"
            step="0.01"
            className="field"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="m-clicks">Clicks</label>
          <input
            id="m-clicks"
            type="number"
            min="0"
            className="field"
            value={clicks}
            onChange={(e) => setClicks(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="m-impr">Impressions</label>
          <input
            id="m-impr"
            type="number"
            min="0"
            className="field"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="w-40">
          <label className="label" htmlFor="m-conv">
            Platform conversions
          </label>
          <input
            id="m-conv"
            type="number"
            min="0"
            step="0.01"
            className="field"
            value={conversions}
            onChange={(e) => setConversions(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save day"}
        </button>
      </div>

      <p className="text-xs text-ink-muted">
        Platform conversions are what the ad platform claims. They're stored but
        never mixed with your own lead count — each platform counts differently,
        and comparing their numbers to each other is meaningless.
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// CSV import
// ---------------------------------------------------------------------------

function CsvImport({
  campaigns,
  onSaved,
  onError,
}: {
  campaigns: Campaign[];
  onSaved: (message: string) => Promise<void> | void;
  onError: (message: string) => void;
}) {
  const [platform, setPlatform] = useState<Platform>("google");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const collapsed = useMemo(
    () => (result ? collapseByCampaignDate(result.rows) : []),
    [result]
  );

  const totalSpend = collapsed.reduce((sum, row) => sum + row.spend, 0);

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = importReport(text, platform);
    setResult(parsed);
    setFileName(file.name);

    // Pre-match by name so an unchanged export maps itself.
    const next: Record<string, string> = {};
    for (const name of parsed.campaignNames) {
      const match = campaigns.find(
        (c) =>
          c.platform === platform &&
          c.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
      next[name] = match ? match.id : CREATE_NEW;
    }
    setAssignments(next);
  }

  async function commit() {
    if (!result) return;
    setSaving(true);

    try {
      // Create any campaigns the user asked for, then resolve every name to an id.
      const resolved = new Map<string, string>();

      for (const [name, target] of Object.entries(assignments)) {
        if (target === SKIP) continue;
        if (target === CREATE_NEW) {
          const { data, error } = await supabase
            .from("campaigns")
            .insert({ platform, name, status: "active" })
            .select("id")
            .single();
          if (error) throw new Error(`Creating "${name}": ${error.message}`);
          resolved.set(name, data.id as string);
        } else {
          resolved.set(name, target);
        }
      }

      const rows = collapsed
        .filter((row) => resolved.has(row.campaignName))
        .map((row) => ({
          campaign_id: resolved.get(row.campaignName)!,
          date: row.date,
          impressions: Math.round(row.impressions),
          clicks: Math.round(row.clicks),
          spend: Number(row.spend.toFixed(2)),
          platform_conversions: row.conversions,
          source: "csv" as const,
          synced_at: new Date().toISOString(),
        }));

      if (rows.length === 0) {
        throw new Error("Every campaign in the file is set to skip.");
      }

      const { error } = await supabase
        .from("metrics_daily")
        .upsert(rows, { onConflict: "campaign_id,date" });
      if (error) throw new Error(error.message);

      await onSaved(
        `Imported ${rows.length} day${rows.length === 1 ? "" : "s"} from ${fileName}.`
      );
      setResult(null);
      setFileName(null);
      setAssignments({});
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
          Import a report export
        </h2>
        <p className="mt-0.5 text-xs text-ink-secondary dark:text-ink-secondaryDark">
          Download a report with a day-by-day breakdown from the platform, then
          drop the CSV here. Column names are matched automatically.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="label" htmlFor="csv-platform">Platform</label>
          <select
            id="csv-platform"
            className="field w-auto"
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value as Platform);
              setResult(null);
            }}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="csv-file">CSV file</label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            className="field w-auto file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-brand-700"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          {result.errors.length > 0 && (
            <ErrorNote>
              <ul className="list-inside list-disc space-y-0.5">
                {result.errors.slice(0, 6).map((message, i) => (
                  <li key={i}>{message}</li>
                ))}
                {result.errors.length > 6 && (
                  <li>…and {result.errors.length - 6} more.</li>
                )}
              </ul>
            </ErrorNote>
          )}

          {collapsed.length > 0 && (
            <>
              <div className="rounded-lg bg-black/[0.03] p-3 text-xs dark:bg-white/5">
                <div className="font-medium text-ink-primary dark:text-ink-primaryDark">
                  Matched columns
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-ink-secondary dark:text-ink-secondaryDark">
                  {Object.entries(result.mapping).map(([field, header]) => (
                    <span key={field}>
                      {field} ← <code>{header}</code>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-ink-primary dark:text-ink-primaryDark">
                  Where should each campaign go?
                </div>
                <div className="space-y-2">
                  {result.campaignNames.map((name) => (
                    <div
                      key={name}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span className="min-w-48 truncate text-ink-secondary dark:text-ink-secondaryDark">
                        {name}
                      </span>
                      <span className="text-ink-muted">→</span>
                      <select
                        className="field w-auto py-1 text-xs"
                        value={assignments[name] ?? CREATE_NEW}
                        onChange={(e) =>
                          setAssignments({
                            ...assignments,
                            [name]: e.target.value,
                          })
                        }
                        aria-label={`Destination for ${name}`}
                      >
                        <option value={CREATE_NEW}>
                          Create new {PLATFORM_LABELS[platform]} campaign
                        </option>
                        {campaigns
                          .filter((c) => c.platform === platform)
                          .map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        <option value={SKIP}>Skip this one</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={commit}
                  disabled={saving}
                >
                  {saving
                    ? "Importing…"
                    : `Import ${count(collapsed.length)} days`}
                </button>
                <span className="text-xs text-ink-muted">
                  {money(totalSpend)} total spend ·{" "}
                  {collapsed[0]?.date} to {collapsed[collapsed.length - 1]?.date}
                </span>
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer text-ink-secondary dark:text-ink-secondaryDark">
                  Preview first 10 rows
                </summary>
                <table className="mt-2 w-full text-left tabular">
                  <thead className="text-ink-muted">
                    <tr>
                      <th scope="col" className="py-1 font-medium">Date</th>
                      <th scope="col" className="py-1 font-medium">Campaign</th>
                      <th scope="col" className="py-1 text-right font-medium">Spend</th>
                      <th scope="col" className="py-1 text-right font-medium">Clicks</th>
                      <th scope="col" className="py-1 text-right font-medium">Impr.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collapsed.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-black/5 dark:border-white/5">
                        <td className="py-1">{row.date}</td>
                        <td className="max-w-48 truncate py-1">{row.campaignName}</td>
                        <td className="py-1 text-right">{money(row.spend)}</td>
                        <td className="py-1 text-right">{count(row.clicks)}</td>
                        <td className="py-1 text-right">{count(row.impressions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </div>
      )}
    </section>
  );
}
