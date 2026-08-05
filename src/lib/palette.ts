import type { Platform } from "./types";

/**
 * Chart colors, referenced by role.
 *
 * The hex values live in index.css as custom properties so light and dark
 * steps swap in one place. Chart code reads them through these constants and
 * never hardcodes hex — that way a palette change is a one-file change.
 *
 * Slot assignment is FIXED. It follows the entity, not its rank: if Reddit
 * outspends Meta next month, Reddit does not become blue. A filter that drops
 * a platform must not repaint the survivors.
 *
 * Why only three platforms get series colors: the validated palette's first
 * three categorical slots are the ones that clear the colorblind separation
 * floors when every pair can appear together. A fourth would put yellow beside
 * orange and fail. Three platforms, three safe slots.
 */
export const SERIES: Record<Platform, string> = {
  meta: "var(--series-meta)", // slot 1 — blue
  reddit: "var(--series-reddit)", // slot 2 — orange
  google: "var(--series-google)", // slot 3 — aqua
};

export const CHART = {
  surface: "var(--surface-1)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  gridline: "var(--gridline)",
  baseline: "var(--baseline)",
} as const;

/**
 * Status colors are reserved. They mean state — never "series 4" — and always
 * ship with a label beside them so meaning never rides on hue alone.
 */
export const STATUS = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
} as const;

/** Tailwind text classes for platform names in tables and legends. */
export const PLATFORM_DOT: Record<Platform, string> = {
  meta: "bg-[var(--series-meta)]",
  reddit: "bg-[var(--series-reddit)]",
  google: "bg-[var(--series-google)]",
};
