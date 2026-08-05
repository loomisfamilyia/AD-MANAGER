import { useState } from "react";
import { CHART } from "@/lib/palette";
import { shortDate } from "@/lib/format";
import { useElementWidth, niceMax, ticksFor } from "./useElementWidth";
import { ChartEmpty, type SeriesSpec } from "./ChartFrame";

export interface StackedPoint {
  date: string;
  values: Record<string, number>;
}

interface TrendChartProps {
  points: StackedPoint[];
  series: SeriesSpec[];
  formatValue: (n: number) => string;
  height?: number;
  emptyMessage?: string;
}

const PAD = { top: 8, right: 8, bottom: 26, left: 60 };

/**
 * Daily stacked bars.
 *
 * Bars rather than an area chart because spend is a discrete daily amount, not
 * a continuous quantity — an area chart implies you can read a value between
 * Tuesday and Wednesday, and you can't.
 *
 * Only one measure is plotted. Spend and leads never share this chart: two
 * scales on one frame is the single most misleading thing a chart can do, and
 * the fix is a second chart, not a second axis.
 */
export function TrendChart({
  points,
  series,
  formatValue,
  height = 220,
  emptyMessage = "No data in this range yet.",
}: TrendChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const totals = points.map((p) =>
    series.reduce((sum, s) => sum + (p.values[s.key] ?? 0), 0)
  );
  const hasData = totals.some((t) => t > 0);

  if (!hasData) return <ChartEmpty message={emptyMessage} />;

  // Render nothing until measured, so bars don't animate in from zero width.
  if (width === 0) {
    return <div ref={ref} style={{ height }} />;
  }

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(...totals));
  const bandW = plotW / points.length;
  const barW = Math.max(2, Math.min(bandW - 2, 44));

  const yFor = (value: number) => PAD.top + plotH - (value / max) * plotH;

  // Roughly six date labels, whatever the range length.
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  const hovered = hover != null ? points[hover] : null;

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Daily spend by platform"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left - PAD.left;
          const index = Math.floor(x / bandW);
          setHover(index >= 0 && index < points.length ? index : null);
        }}
      >
        {/* Gridlines sit behind the marks and stay recessive. */}
        {ticksFor(max).map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke={tick === 0 ? CHART.baseline : CHART.gridline}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={yFor(tick) + 3}
              textAnchor="end"
              fontSize={10}
              fill={CHART.textMuted}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatValue(tick)}
            </text>
          </g>
        ))}

        {/* Hover band, drawn under the bars so it never dims them. */}
        {hover != null && (
          <rect
            x={PAD.left + hover * bandW}
            y={PAD.top}
            width={bandW}
            height={plotH}
            fill={CHART.textPrimary}
            opacity={0.05}
          />
        )}

        {points.map((point, i) => {
          const x = PAD.left + i * bandW + (bandW - barW) / 2;
          let cursor = PAD.top + plotH; // stack upward from the baseline

          // Topmost non-zero segment gets the rounded end.
          const lastNonZero = series.reduce(
            (last, s, index) => ((point.values[s.key] ?? 0) > 0 ? index : last),
            -1
          );

          return (
            <g key={point.date}>
              {series.map((s, index) => {
                const value = point.values[s.key] ?? 0;
                if (value <= 0) return null;

                const rawHeight = (value / max) * plotH;
                // 2px of surface between stacked segments keeps adjacent fills
                // legible without a stroke.
                const h = Math.max(1, rawHeight - (index === lastNonZero ? 0 : 2));
                const y = cursor - rawHeight;
                cursor -= rawHeight;

                const isTop = index === lastNonZero;
                const r = isTop ? Math.min(4, barW / 2, h) : 0;

                return (
                  <path
                    key={s.key}
                    d={
                      r > 0
                        ? `M${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${y + h} L${x},${y + h} Z`
                        : `M${x},${y} L${x + barW},${y} L${x + barW},${y + h} L${x},${y + h} Z`
                    }
                    fill={s.color}
                  />
                );
              })}
            </g>
          );
        })}

        {points.map((point, i) =>
          i % labelEvery === 0 ? (
            <text
              key={point.date}
              x={PAD.left + i * bandW + bandW / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              fill={CHART.textMuted}
            >
              {shortDate(point.date)}
            </text>
          ) : null
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-36 rounded-lg border border-black/10 bg-surface-light p-2 text-xs shadow-lg dark:border-white/10 dark:bg-surface-dark"
          style={{
            left: Math.min(
              Math.max(PAD.left + (hover as number) * bandW + bandW / 2 - 72, 0),
              Math.max(width - 150, 0)
            ),
            top: 0,
          }}
        >
          <div className="mb-1 font-medium text-ink-primary dark:text-ink-primaryDark">
            {shortDate(hovered.date)}
          </div>
          {series.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between gap-3 py-0.5"
            >
              <span className="flex items-center gap-1.5 text-ink-secondary dark:text-ink-secondaryDark">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-sm"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="tabular text-ink-primary dark:text-ink-primaryDark">
                {formatValue(hovered.values[s.key] ?? 0)}
              </span>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between gap-3 border-t border-black/10 pt-1 font-medium dark:border-white/10">
            <span className="text-ink-secondary dark:text-ink-secondaryDark">
              Total
            </span>
            <span className="tabular text-ink-primary dark:text-ink-primaryDark">
              {formatValue(totals[hover as number])}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
