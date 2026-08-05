import { useEffect, useState, type FormEvent } from "react";
import { ErrorNote, InfoNote, Spinner, StatTile } from "@/components/ui";
import { money, money0, percent } from "@/lib/format";
import { unitEconomics } from "@/lib/metrics";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SETTINGS } from "@/lib/useAdsData";
import type { Settings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data, error: loadError } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (loadError) setError(loadError.message);
      setSettings((data as Settings) ?? DEFAULT_SETTINGS);
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: saveError } = await supabase.from("settings").upsert(
      {
        id: true,
        agency_name: settings.agency_name,
        default_commission_rate: settings.default_commission_rate,
        expected_close_rate: settings.expected_close_rate,
        avg_annual_premium: settings.avg_annual_premium,
        avg_retention_years: settings.avg_retention_years,
        target_cpl_ratio: settings.target_cpl_ratio,
        target_cpl_override: settings.target_cpl_override,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (saveError) setError(saveError.message);
    else setSaved(true);
    setSaving(false);
  }

  if (loading) return <Spinner label="Loading settings" />;
  if (!settings) return <ErrorNote>Could not load settings.</ErrorNote>;

  const econ = unitEconomics(settings);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary dark:text-ink-primaryDark">
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondaryDark">
          Five numbers that turn a cost-per-click into a decision. Every verdict
          in this app derives from them.
        </p>
      </div>

      {/* The output of the calculation, shown above the inputs so the effect of
          a change is visible while making it. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Value of one policy"
          value={money0(econ.policyValue)}
          sub="Commission across the retention window"
        />
        <StatTile
          label="Value of one lead"
          value={money0(econ.leadValue)}
          sub="Policy value × close rate"
        />
        <StatTile
          label="Break-even cost per lead"
          value={money0(econ.breakEvenCpl)}
          sub="Pay more than this and you lose money"
        />
        <StatTile
          label="Target cost per lead"
          value={money0(econ.targetCpl)}
          tone="good"
          sub={econ.isOverride ? "Manual override" : "Break-even × your margin"}
        />
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="agency">Agency name</label>
          <input
            id="agency"
            className="field max-w-md"
            value={settings.agency_name}
            onChange={(e) => update("agency_name", e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="premium">
              Average annual premium
            </label>
            <input
              id="premium"
              type="number"
              min="0"
              step="1"
              className="field"
              value={settings.avg_annual_premium}
              onChange={(e) =>
                update("avg_annual_premium", Number(e.target.value))
              }
            />
            <p className="mt-1 text-xs text-ink-muted">
              Across the policies these ads actually sell.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="commission">
              Commission rate ({percent(settings.default_commission_rate, 0)})
            </label>
            <input
              id="commission"
              type="range"
              min="0"
              max="0.4"
              step="0.005"
              className="w-full"
              value={settings.default_commission_rate}
              onChange={(e) =>
                update("default_commission_rate", Number(e.target.value))
              }
            />
            <p className="mt-1 text-xs text-ink-muted">
              Your share of premium, year one.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="retention">
              Average years retained
            </label>
            <input
              id="retention"
              type="number"
              min="1"
              max="20"
              step="0.5"
              className="field"
              value={settings.avg_retention_years}
              onChange={(e) =>
                update("avg_retention_years", Number(e.target.value))
              }
            />
            <p className="mt-1 text-xs text-ink-muted">
              Renewals are most of what a customer is worth. Setting this to 1
              will make every campaign look unprofitable.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="close">
              Close rate ({percent(settings.expected_close_rate, 0)})
            </label>
            <input
              id="close"
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              className="w-full"
              value={settings.expected_close_rate}
              onChange={(e) =>
                update("expected_close_rate", Number(e.target.value))
              }
            />
            <p className="mt-1 text-xs text-ink-muted">
              Share of leads that eventually buy. Be honest — optimism here is
              how agencies talk themselves into overpaying for clicks.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="ratio">
              Margin held back ({percent(1 - settings.target_cpl_ratio, 0)})
            </label>
            <input
              id="ratio"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              className="w-full"
              value={settings.target_cpl_ratio}
              onChange={(e) =>
                update("target_cpl_ratio", Number(e.target.value))
              }
            />
            <p className="mt-1 text-xs text-ink-muted">
              Target lands at {money(econ.breakEvenCpl)} ×{" "}
              {settings.target_cpl_ratio.toFixed(2)} ={" "}
              {money(econ.breakEvenCpl * settings.target_cpl_ratio)}.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="override">
              Target CPL override
            </label>
            <input
              id="override"
              type="number"
              min="0"
              step="0.01"
              className="field"
              placeholder="Leave blank to calculate"
              value={settings.target_cpl_override ?? ""}
              onChange={(e) =>
                update(
                  "target_cpl_override",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            />
            <p className="mt-1 text-xs text-ink-muted">
              Bypasses the calculation entirely.
            </p>
          </div>
        </div>

        <InfoNote>
          <strong>How this reads:</strong> a {money0(settings.avg_annual_premium)}{" "}
          policy at {percent(settings.default_commission_rate, 0)} commission
          earns {money0(settings.avg_annual_premium * settings.default_commission_rate)} a
          year, and {money0(econ.policyValue)} over{" "}
          {settings.avg_retention_years} years. At a{" "}
          {percent(settings.expected_close_rate, 0)} close rate, each lead is
          worth {money0(econ.leadValue)} — so paying more than that per lead
          loses money, and you're aiming to pay under {money0(econ.targetCpl)}.
        </InfoNote>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && (
            <span className="text-sm text-status-good">Saved.</span>
          )}
        </div>
      </form>
    </div>
  );
}
