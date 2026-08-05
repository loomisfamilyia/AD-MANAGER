import { useState, type ReactNode } from "react";

export interface SeriesSpec {
  key: string;
  label: string;
  color: string;
}

interface ChartFrameProps {
  title: string;
  subtitle?: string;
  series: SeriesSpec[];
  /** Column headers for the table view. */
  tableHeaders: string[];
  /** Pre-formatted cells — the table shows the same values the chart encodes. */
  tableRows: string[][];
  children: ReactNode;
}

/**
 * Shared chrome for every chart: title, legend, and a table toggle.
 *
 * The table view is not a nicety. Several colors in the palette sit below 3:1
 * contrast against a light surface, and the rule that comes with them is that
 * the values must be reachable some other way. It also covers screen readers,
 * printing, and the ordinary case of someone wanting to read an exact number
 * off a chart instead of estimating it against an axis.
 *
 * The legend is always present for two or more series, so identity is never
 * carried by color alone.
 */
export function ChartFrame({
  title,
  subtitle,
  series,
  tableHeaders,
  tableRows,
  children,
}: ChartFrameProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className="card">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-ink-secondary dark:text-ink-secondaryDark">
              {subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="rounded-md border border-black/10 px-2 py-1 text-xs font-medium text-ink-secondary transition hover:bg-black/5 dark:border-white/10 dark:text-ink-secondaryDark dark:hover:bg-white/5"
          aria-pressed={showTable}
        >
          {showTable ? "Chart" : "Table"}
        </button>
      </div>

      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <li
              key={s.key}
              className="flex items-center gap-1.5 text-xs text-ink-secondary dark:text-ink-secondaryDark"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: s.color }}
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {showTable ? (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-left text-xs tabular">
            <thead className="sticky top-0 bg-surface-light dark:bg-surface-dark">
              <tr className="border-b border-black/10 dark:border-white/10">
                {tableHeaders.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`py-1.5 font-medium text-ink-secondary dark:text-ink-secondaryDark ${
                      i === 0 ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`py-1.5 ${
                        j === 0
                          ? "text-left text-ink-secondary dark:text-ink-secondaryDark"
                          : "text-right text-ink-primary dark:text-ink-primaryDark"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/** Shown in place of a chart when there is genuinely nothing to draw. */
export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-black/10 text-sm text-ink-muted dark:border-white/10">
      {message}
    </div>
  );
}
