import { addDays, toISODate } from "@/lib/format";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
}

export type RangePreset = "7d" | "30d" | "90d" | "mtd" | "custom";

export const PRESET_LABELS: Record<RangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  mtd: "Month to date",
  custom: "Custom range",
};

/**
 * Ranges end today rather than yesterday.
 *
 * Today's numbers are always incomplete, but hiding the current day makes the
 * dashboard look stale to someone who just launched a campaign an hour ago.
 * The trend chart shows the partial day honestly as a short bar.
 */
export function presetRange(preset: Exclude<RangePreset, "custom">): DateRange {
  const today = new Date();
  const to = toISODate(today);

  switch (preset) {
    case "7d":
      return { from: toISODate(addDays(today, -6)), to };
    case "30d":
      return { from: toISODate(addDays(today, -29)), to };
    case "90d":
      return { from: toISODate(addDays(today, -89)), to };
    case "mtd":
      return {
        from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to,
      };
  }
}

interface DateRangePickerProps {
  preset: RangePreset;
  range: DateRange;
  onChange: (preset: RangePreset, range: DateRange) => void;
}

export function DateRangePicker({
  preset,
  range,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="range-preset">
        Date range
      </label>
      <select
        id="range-preset"
        className="field w-auto"
        value={preset}
        onChange={(event) => {
          const next = event.target.value as RangePreset;
          if (next === "custom") onChange(next, range);
          else onChange(next, presetRange(next));
        }}
      >
        {(Object.keys(PRESET_LABELS) as RangePreset[]).map((key) => (
          <option key={key} value={key}>
            {PRESET_LABELS[key]}
          </option>
        ))}
      </select>

      {preset === "custom" && (
        <>
          <input
            type="date"
            className="field w-auto"
            value={range.from}
            max={range.to}
            onChange={(event) =>
              onChange("custom", { ...range, from: event.target.value })
            }
            aria-label="From date"
          />
          <span className="text-sm text-ink-muted">to</span>
          <input
            type="date"
            className="field w-auto"
            value={range.to}
            min={range.from}
            onChange={(event) =>
              onChange("custom", { ...range, to: event.target.value })
            }
            aria-label="To date"
          />
        </>
      )}
    </div>
  );
}
