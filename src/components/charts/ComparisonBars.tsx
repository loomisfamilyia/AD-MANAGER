import { useState } from "react";
import { CHART, STATUS } from "@/lib/palette";
import { useElementWidth, niceMax } from "./useElementWidth";
import { ChartEmpty } from "./ChartFrame";

export interface ComparisonBar {
  key: string;
  label: string;
  /** null means the rate is undefined (no leads yet), not zero. */
  value: number | null;
  color: string;
  /** Small print under the label — usually the counts behind the rate. */
  sublabel?: string;
}

interface ComparisonBarsProps {
  bars: ComparisonBar[];
  /** A vertical rule to judge the bars against, e.g. your target CPL. */
  reference?: { value: number; label: string };
  formatValue: (n: number) => string;
  emptyMessage?: string;
}

const ROW_H = 44;
const BAR_H = 16;
const LABEL_W = 108;

/**
 * Horizontal bars with a reference line.
 *
 * Horizontal because the labels are words ("Google Ads") — vertical bars would
 * force them to rotate or truncate. Every bar is directly labeled with its
 * value, which is affordable at three or four marks and removes the need to
 * measure against an axis.
 *
 * The reference line is what makes this chart a decision rather than a
 * ranking: knowing Meta is cheaper than Google is interesting, knowing both
 * are above what a lead is worth to you is actionable.
 */
export function ComparisonBars({
  bars,
  reference,
  formatValue,
  emptyMessage = "No leads attributed yet — cost per lead needs at least one.",
}: ComparisonBarsProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);

  const values = bars
    .map((b) => b.value)
    .filter((v): v is number => v != null && v > 0);

  if (values.length === 0) return <ChartEmpty message={emptyMessage} />;
  if (width === 0)
    return <div ref={ref} style={{ height: bars.length * ROW_H + 24 }} />;

  const height = bars.length * ROW_H + 24;
  const plotW = Math.max(0, width - LABEL_W - 72);
  // The reference line must stay on screen even when every bar is short.
  const max = niceMax(Math.max(...values, reference?.value ?? 0));
  const xFor = (value: number) => LABEL_W + (value / max) * plotW;

  return (
    <div ref={ref} className="relative">
      <svg width={width} height={height} role="img" aria-label="Cost comparison">
        {reference && (
          <g>
            <line
              x1={xFor(reference.value)}
              x2={xFor(reference.value)}
              y1={4}
              y2={bars.length * ROW_H}
              stroke={CHART.textSecondary}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={xFor(reference.value)}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill={CHART.textSecondary}
            >
              {reference.label}
            </text>
          </g>
        )}

        {bars.map((bar, i) => {
          const y = i * ROW_H + 8;
          const barY = y + (ROW_H - BAR_H) / 2 - 8;
          const hasValue = bar.value != null && bar.value > 0;
          const w = hasValue ? Math.max(2, xFor(bar.value as number) - LABEL_W) : 0;
          const r = Math.min(4, w / 2, BAR_H / 2);
          // Over the reference line is a warning state, and it ships with the
          // value beside it — the color is never the only signal.
          const overReference =
            reference != null && hasValue && (bar.value as number) > reference.value;

          return (
            <g
              key={bar.key}
              onMouseEnter={() => setHover(bar.key)}
              onMouseLeave={() => setHover(null)}
            >
              {/* Full-row hit target, larger than the mark itself. */}
              <rect
                x={0}
                y={y - 8}
                width={width}
                height={ROW_H}
                fill={hover === bar.key ? CHART.textPrimary : "transparent"}
                opacity={hover === bar.key ? 0.04 : 0}
              />

              <text
                x={0}
                y={barY + 8}
                fontSize={12}
                fill={CHART.textPrimary}
                dominantBaseline="middle"
              >
                {bar.label}
              </text>
              {bar.sublabel && (
                <text
                  x={0}
                  y={barY + 22}
                  fontSize={10}
                  fill={CHART.textMuted}
                  dominantBaseline="middle"
                >
                  {bar.sublabel}
                </text>
              )}

              {hasValue ? (
                <>
                  <path
                    d={`M${LABEL_W},${barY} L${LABEL_W + w - r},${barY} Q${LABEL_W + w},${barY} ${LABEL_W + w},${barY + r} L${LABEL_W + w},${barY + BAR_H - r} Q${LABEL_W + w},${barY + BAR_H} ${LABEL_W + w - r},${barY + BAR_H} L${LABEL_W},${barY + BAR_H} Z`}
                    fill={bar.color}
                  />
                  <text
                    x={LABEL_W + w + 8}
                    y={barY + BAR_H / 2}
                    fontSize={12}
                    fill={CHART.textPrimary}
                    dominantBaseline="middle"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatValue(bar.value as number)}
                    {overReference && (
                      <tspan fill={STATUS.critical} fontSize={10}>
                        {"  over"}
                      </tspan>
                    )}
                  </text>
                </>
              ) : (
                <text
                  x={LABEL_W}
                  y={barY + BAR_H / 2}
                  fontSize={12}
                  fill={CHART.textMuted}
                  dominantBaseline="middle"
                >
                  — no leads yet
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
