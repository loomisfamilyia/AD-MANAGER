import type { ReactNode } from "react";
import { PLATFORM_DOT } from "@/lib/palette";
import type { LeadStatus, Platform } from "@/lib/types";
import { LEAD_STATUS_LABELS, PLATFORM_LABELS } from "@/lib/types";
import type { Verdict } from "@/lib/metrics";

/**
 * A headline figure.
 *
 * Proportional figures, not tabular — tabular numerals exist to align columns,
 * and a standalone number just looks loosely spaced in them. Table cells
 * elsewhere in the app do use `.tabular`.
 */
export function StatTile({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  tone?: "neutral" | "good" | "warning" | "critical";
}) {
  const toneClass =
    tone === "good"
      ? "text-status-good"
      : tone === "warning"
        ? "text-status-warning"
        : tone === "critical"
          ? "text-status-critical"
          : "text-ink-primary dark:text-ink-primaryDark";

  return (
    <div className="card">
      <div className="text-xs font-medium text-ink-secondary dark:text-ink-secondaryDark">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
      {sub && (
        <div className="mt-1 text-xs text-ink-muted">{sub}</div>
      )}
    </div>
  );
}

export function PlatformTag({ platform }: { platform: Platform }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-sm ${PLATFORM_DOT[platform]}`}
      />
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

const VERDICT_COPY: Record<Verdict, { label: string; className: string }> = {
  good: {
    label: "On target",
    className: "bg-status-good/12 text-status-good ring-status-good/30",
  },
  warning: {
    label: "Thin margin",
    // Warning sits below 3:1 on a light surface, so it always carries a word.
    className: "bg-status-warning/15 text-yellow-800 ring-status-warning/40 dark:text-status-warning",
  },
  critical: {
    label: "Losing money",
    className: "bg-status-critical/12 text-status-critical ring-status-critical/30",
  },
  "no-data": {
    label: "Too early",
    className: "bg-black/5 text-ink-secondary ring-black/10 dark:bg-white/5 dark:text-ink-secondaryDark dark:ring-white/10",
  },
};

/**
 * Status is never carried by color alone — every pill states its meaning in
 * words, which is also what makes "Too early" readable as a real state rather
 * than a rendering gap.
 */
export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const { label, className } = VERDICT_COPY[verdict];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

const LEAD_STATUS_CLASS: Record<LeadStatus, string> = {
  new: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800",
  contacted:
    "bg-black/5 text-ink-secondary ring-black/10 dark:bg-white/5 dark:text-ink-secondaryDark dark:ring-white/10",
  quoted:
    "bg-status-warning/15 text-yellow-800 ring-status-warning/40 dark:text-status-warning",
  sold: "bg-status-good/12 text-status-good ring-status-good/30",
  lost: "bg-black/5 text-ink-muted ring-black/10 dark:bg-white/5 dark:ring-white/10",
};

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${LEAD_STATUS_CLASS[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 p-8 text-center dark:border-white/15">
      <h3 className="text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
        {title}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-secondary dark:text-ink-secondaryDark">
        {body}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-status-critical/30 bg-status-critical/8 px-3 py-2 text-sm text-status-critical"
    >
      {children}
    </div>
  );
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 dark:border-brand-800 dark:bg-brand-900/25 dark:text-brand-100">
      {children}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-ink-muted">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-brand-600 dark:border-white/15 dark:border-t-brand-100"
      />
      {label}…
    </div>
  );
}
