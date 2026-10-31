/**
 * Builds the illustrator's art guide from the art manifest.
 *
 *   cd risk-manager && npm run art:brief
 *
 * Reads art/assets.ts, checks it against the catalog, writes art/brief.html and
 * prints art/Loomis-Risk-Manager-Art-Brief.pdf with Playwright's Chromium.
 *
 * It fails loudly (and writes nothing) if the manifest has a bad file name, a bad
 * size, an unknown kind, or leaves any catalog kind or life event without art.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ASSETS, expandFiles } from "../art/assets.ts";
import type { ArtAsset, Round } from "../art/assets.ts";
import { THING_KINDS } from "../src/catalog/kinds.ts";
import { LIFE_EVENTS } from "../src/catalog/lifeEvents.ts";
import { buildHtml } from "./art-brief-html.ts";
import type { BriefData } from "./art-brief-html.ts";

const ART_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../art");
const HTML_PATH = resolve(ART_DIR, "brief.html");
const PDF_PATH = resolve(ART_DIR, "Loomis-Risk-Manager-Art-Brief.pdf");
const REFERENCE_IMAGES = ["reference/03-world-empty.png", "reference/s4-mid.png"];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const KEBAB_PNG = /^[a-z0-9]+(-[a-z0-9]+)*\.png$/;
const KEBAB_WORD = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SIZE = /^([1-9][0-9]*)x([1-9][0-9]*)$/;
const MIN_SIDE = 64;
const MAX_SIDE = 4096;

function validate(assets: ArtAsset[]): string[] {
  const problems: string[] = [];
  const add = (message: string): void => {
    problems.push(message);
  };

  // File names: lowercase-kebab, .png, unique once variants are expanded.
  const seen = new Map<string, string>();
  for (const asset of assets) {
    const where = `asset "${asset.file}"`;
    if (!KEBAB_PNG.test(asset.file)) add(`${where}: file name must be lowercase-kebab and end in .png`);
    if (![1, 2, 3].includes(asset.round)) add(`${where}: round must be 1, 2 or 3 (got ${String(asset.round)})`);
    if (asset.group.trim() === "") add(`${where}: group is empty`);
    if (asset.title.trim() === "") add(`${where}: title is empty`);
    if (asset.whatToDraw.trim() === "") add(`${where}: whatToDraw is empty`);

    const match = SIZE.exec(asset.size);
    if (!match) {
      add(`${where}: size "${asset.size}" is not WIDTHxHEIGHT in pixels`);
    } else {
      for (const side of [Number(match[1]), Number(match[2])]) {
        if (side < MIN_SIDE || side > MAX_SIDE) add(`${where}: size "${asset.size}" has a side outside ${MIN_SIDE}-${MAX_SIDE} px`);
      }
    }

    if (asset.variants) {
      if (asset.variants.length < 2) add(`${where}: variants should list at least two (or drop the field)`);
      for (const v of asset.variants) if (!KEBAB_WORD.test(v)) add(`${where}: variant "${v}" must be lowercase-kebab`);
    }

    for (const file of expandFiles(asset)) {
      if (!KEBAB_PNG.test(file)) add(`${where}: expanded file name "${file}" is not lowercase-kebab .png`);
      const earlier = seen.get(file);
      if (earlier !== undefined) add(`file name "${file}" is used twice (by "${earlier}" and "${asset.file}")`);
      else seen.set(file, asset.file);
    }
  }

  // Every catalog kind needs art, and every kind named in the manifest must exist.
  const kindIds = new Set(THING_KINDS.map((k) => k.id));
  const covered = new Set<string>();
  for (const asset of assets) {
    for (const id of asset.kinds ?? []) {
      if (!kindIds.has(id)) add(`asset "${asset.file}": kinds names "${id}", which is not in src/catalog/kinds.ts`);
      covered.add(id);
    }
  }
  const missing = THING_KINDS.filter((k) => !covered.has(k.id));
  if (missing.length > 0) {
    add(`${missing.length} catalog kind(s) have no art listed (add them to some asset's "kinds"): ${missing.map((k) => k.id).join(", ")}`);
  }

  // Every life event gets an (optional) icon named event-<id>.
  for (const event of LIFE_EVENTS) {
    const file = `event-${event.id.replace(/_/g, "-")}.png`;
    if (!seen.has(file)) add(`life event "${event.id}" has no icon: add "${file}" to the manifest`);
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Environment checks
// ---------------------------------------------------------------------------

/** True when an emoji font is installed (or when we can't tell, e.g. on macOS or Windows). */
function hasEmojiFont(): boolean {
  const result = spawnSync("fc-list", [], { encoding: "utf8" });
  if (result.error || result.status !== 0) return true;
  return /emoji/i.test(result.stdout);
}

function pageCount(pdfPath: string): number | undefined {
  const result = spawnSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  if (result.error || result.status !== 0) return undefined;
  const match = /^Pages:\s+(\d+)/m.exec(result.stdout);
  return match ? Number(match[1]) : undefined;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const problems = validate(ASSETS);
  for (const image of REFERENCE_IMAGES) {
    if (!existsSync(resolve(ART_DIR, image))) problems.push(`missing reference screenshot art/${image}`);
  }
  if (problems.length > 0) {
    console.error(`\nart-brief: the art manifest has ${problems.length} problem(s). Nothing was written.\n`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error("");
    process.exit(1);
  }

  const counts: Record<Round, number> = { 1: 0, 2: 0, 3: 0 };
  for (const asset of ASSETS) counts[asset.round] += expandFiles(asset).length;

  const data: BriefData = { assets: ASSETS, expandFiles, counts, showEmoji: hasEmojiFont() };
  mkdirSync(ART_DIR, { recursive: true });
  writeFileSync(HTML_PATH, buildHtml(data));

  // Playwright is installed outside this project, so load it the CommonJS way.
  const require = createRequire(import.meta.url);
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(HTML_PATH).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    await page.pdf({ path: PDF_PATH, format: "Letter", printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }

  const total = counts[1] + counts[2] + counts[3];
  const pages = pageCount(PDF_PATH);
  console.log(`art-brief: ${total} images (round 1: ${counts[1]}, round 2: ${counts[2]}, round 3: ${counts[3]})`);
  console.log(`art-brief: emoji column ${data.showEmoji ? "on" : "off (no emoji font found)"}`);
  console.log(`art-brief: wrote ${HTML_PATH}`);
  console.log(`art-brief: wrote ${PDF_PATH}${pages ? ` (${pages} pages)` : ""}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
