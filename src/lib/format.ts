/**
 * Formatting helpers.
 *
 * Every function here accepts `null` and renders an em dash. That is
 * deliberate: most rates in this app are divisions that are genuinely
 * undefined before the first campaign runs, and "—" is honest where "0.0%"
 * or "$0.00 CPL" would be a lie.
 */

const EMPTY = "—";

export function money(n: number | null | undefined, decimals = 2): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Whole dollars — for headline figures where cents are noise. */
export function money0(n: number | null | undefined): string {
  return money(n, 0);
}

export function count(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  return n.toLocaleString("en-US");
}

export function percent(
  fraction: number | null | undefined,
  decimals = 1
): string {
  if (fraction == null || !Number.isFinite(fraction)) return EMPTY;
  return `${(fraction * 100).toFixed(decimals)}%`;
}

export function ratio(n: number | null | undefined, decimals = 2): string {
  if (n == null || !Number.isFinite(n)) return EMPTY;
  return `${n.toFixed(decimals)}×`;
}

// --- dates -----------------------------------------------------------------

/** Local-time YYYY-MM-DD. Avoids toISOString(), which silently shifts to UTC. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** "Mar 4" — compact enough for an axis tick. */
export function shortDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function mediumDate(iso: string): string {
  const d = iso.includes("T") ? new Date(iso) : parseISODate(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}
