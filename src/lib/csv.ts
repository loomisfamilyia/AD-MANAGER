import type { Platform } from "./types";

/**
 * CSV import for native platform report exports.
 *
 * This is the day-one data path and stays useful forever. API access to all
 * three platforms is gated to varying degrees — Google needs an approved
 * developer token, Reddit informally allow-lists campaign endpoints — but
 * every one of them lets you download a report as CSV from the web UI today.
 *
 * Rather than three parsers, there is one parser plus a table of column
 * aliases, because the three exports differ only in what they name things.
 */

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * A real CSV parser, not `split(",")`.
 *
 * Campaign names routinely contain commas ("Auto — Springfield, IL") and Meta
 * quotes any field containing one. Splitting naively shifts every later column
 * by one and silently imports garbage numbers.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Strip a UTF-8 BOM — Google Ads exports include one and it would otherwise
  // become part of the first header name.
  const input = text.replace(/^﻿/, "");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'; // escaped quote
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // Handle CRLF as one break, not two.
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);

  return rows;
}

// ---------------------------------------------------------------------------
// Column matching
// ---------------------------------------------------------------------------

/**
 * Header aliases across the three platforms' exports.
 *
 * Matching is case-insensitive and ignores punctuation, so "Amount spent (USD)"
 * and "amount_spent_usd" both land on `spend`. Longest alias wins, so
 * "link clicks" is preferred over a bare "clicks" when both are present.
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  date: ["day", "date", "reporting starts", "reportingstarts"],
  campaign: ["campaign", "campaign name", "campaignname"],
  impressions: ["impressions", "impr", "impressions total"],
  clicks: ["clicks", "link clicks", "clicks all", "clicks (all)"],
  spend: [
    "cost",
    "spend",
    "amount spent",
    "amount spent usd",
    "amount spent (usd)",
    "total spend",
  ],
  conversions: [
    "conversions",
    "results",
    "conversions total",
    "total conversions",
  ],
};

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findColumn(headers: string[], field: string): number {
  const normalized = headers.map(normalizeHeader);
  const aliases = [...(COLUMN_ALIASES[field] ?? [])].sort(
    (a, b) => b.length - a.length
  );

  for (const alias of aliases) {
    const exact = normalized.indexOf(alias);
    if (exact !== -1) return exact;
  }
  // Fall back to a prefix match — "cost (usd)" normalizes to "cost usd".
  for (const alias of aliases) {
    const partial = normalized.findIndex((h) => h.startsWith(alias));
    if (partial !== -1) return partial;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Value coercion
// ---------------------------------------------------------------------------

/**
 * Currency and thousands separators come through in exports; "$1,234.56" must
 * not parse as 1. A blank or a literal "--" (Google's placeholder) is zero.
 */
export function parseNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Normalizes the date formats the three exports actually emit:
 * ISO (2026-03-04), US slash (3/4/2026), and long form (Mar 4, 2026).
 *
 * Returns null rather than guessing when the format is unrecognized — a
 * misparsed date silently files spend under the wrong day, which is worse
 * than a visible import error.
 */
export function parseDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return `${slash[3]}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`;
  }

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export interface ImportedRow {
  date: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface ImportResult {
  rows: ImportedRow[];
  /** Human-readable problems, one per skipped row plus any header issues. */
  errors: string[];
  /** Which header each field matched, for the confirmation screen. */
  mapping: Record<string, string>;
  /** Distinct campaign names found — the app offers to create missing ones. */
  campaignNames: string[];
}

export function importReport(text: string, platform: Platform): ImportResult {
  const errors: string[] = [];
  const rows: ImportedRow[] = [];
  const mapping: Record<string, string> = {};

  const table = parseCSV(text);
  if (table.length < 2) {
    return {
      rows,
      errors: ["The file has no data rows."],
      mapping,
      campaignNames: [],
    };
  }

  // Platform exports often prefix a title block ("Campaign report (Mar 1 -
  // Mar 31)") before the real header. Find the first row that looks like
  // headers rather than assuming row 0.
  let headerIndex = table.findIndex(
    (r) => findColumn(r, "date") !== -1 && findColumn(r, "campaign") !== -1
  );
  if (headerIndex === -1) {
    // Some exports omit a campaign column when the report is already scoped to
    // one campaign; still importable if there's a date.
    headerIndex = table.findIndex((r) => findColumn(r, "date") !== -1);
  }
  if (headerIndex === -1) {
    return {
      rows,
      errors: [
        "Could not find a header row with a date column. Export the report with " +
          "a date/day breakdown — a summary export with no per-day rows can't be imported.",
      ],
      mapping,
      campaignNames: [],
    };
  }

  const headers = table[headerIndex];
  const idx = {
    date: findColumn(headers, "date"),
    campaign: findColumn(headers, "campaign"),
    impressions: findColumn(headers, "impressions"),
    clicks: findColumn(headers, "clicks"),
    spend: findColumn(headers, "spend"),
    conversions: findColumn(headers, "conversions"),
  };

  for (const [field, column] of Object.entries(idx)) {
    if (column !== -1) mapping[field] = headers[column];
  }

  if (idx.spend === -1) {
    errors.push(
      "No cost/spend column found — spend will import as 0. Check the export includes a cost column."
    );
  }

  const names = new Set<string>();
  const fallbackName = `${platform} import`;

  for (let i = headerIndex + 1; i < table.length; i++) {
    const raw = table[i];
    // Export footers ("Total", "--") have far fewer columns than the header.
    if (raw.length < headers.length - 2) continue;

    const dateRaw = raw[idx.date] ?? "";
    if (/^(total|grand total|--)$/i.test(dateRaw.trim())) continue;

    const date = parseDate(dateRaw);
    if (!date) {
      errors.push(`Row ${i + 1}: unrecognized date "${dateRaw}" — skipped.`);
      continue;
    }

    const campaignName =
      idx.campaign !== -1 ? (raw[idx.campaign] ?? "").trim() : "";
    const name = campaignName || fallbackName;
    names.add(name);

    rows.push({
      date,
      campaignName: name,
      impressions: idx.impressions !== -1 ? parseNumber(raw[idx.impressions]) : 0,
      clicks: idx.clicks !== -1 ? parseNumber(raw[idx.clicks]) : 0,
      spend: idx.spend !== -1 ? parseNumber(raw[idx.spend]) : 0,
      conversions:
        idx.conversions !== -1 ? parseNumber(raw[idx.conversions]) : 0,
    });
  }

  if (rows.length === 0 && errors.length === 0) {
    errors.push("No importable rows found below the header.");
  }

  return { rows, errors, mapping, campaignNames: [...names].sort() };
}

/**
 * Collapses duplicate campaign/date pairs by summing them.
 *
 * Exports broken down by ad group or device emit several rows per campaign per
 * day. The database holds one row per campaign per day, so they must be summed
 * before upserting — otherwise each row overwrites the last and only the final
 * ad group's spend survives.
 */
export function collapseByCampaignDate(rows: ImportedRow[]): ImportedRow[] {
  const map = new Map<string, ImportedRow>();

  for (const row of rows) {
    const key = `${row.campaignName} ${row.date}`;
    const existing = map.get(key);
    if (existing) {
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.spend += row.spend;
      existing.conversions += row.conversions;
    } else {
      map.set(key, { ...row });
    }
  }

  return [...map.values()];
}
