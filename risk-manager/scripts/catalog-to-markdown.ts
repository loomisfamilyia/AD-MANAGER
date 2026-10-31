/**
 * Writes docs/COVERAGE_TREE.md, the review document for Loomis staff.
 *
 *   cd risk-manager && npm run catalog:check
 *
 * Runs validateCatalog() first and exits non-zero (writing nothing) if the
 * catalog has problems, so a broken catalog can never produce a clean-looking
 * review document.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENCY,
  CATEGORIES,
  COVERAGES,
  LIFE_EVENTS,
  LINES,
  THING_KINDS,
  kindById,
  validateCatalog,
} from "../src/catalog/index.ts";
import type { Coverage, CoverageOption, Question, ThingKind } from "../src/catalog/index.ts";

// ---------------------------------------------------------------------------

const TIER_LABEL: Record<Coverage["tier"], string> = {
  essential: "Essential",
  recommended: "Recommended",
  extra: "Extra",
};

/** Escape characters that would break a markdown table cell or list item. */
const esc = (s: string): string => s.replace(/\|/g, "\\|");

/** "NY only", "NY and PA only", "NY, PA and NJ only". */
function statesLabel(states: string[]): string {
  const list = states.length <= 2 ? states.join(" and ") : `${states.slice(0, -1).join(", ")} and ${states[states.length - 1]}`;
  return `${list} only`;
}

const options = (list: CoverageOption[] | undefined): string => (list ? list.map((o) => o.label).join("; ") : "");

/** Names of the things a coverage attaches to, in catalog order. */
function protectsLabel(coverage: Coverage): string {
  return coverage.protects
    .map((id) => {
      if (id === "household") return "The whole household";
      const kind = kindById(id);
      return kind ? `${kind.emoji} ${kind.label}` : id;
    })
    .join(", ");
}

function describeQuestion(q: Question, index: number, kind: ThingKind): string {
  const bits: string[] = [q.type];
  if (q.required) bits.push("**required**");
  if (q.askIf) {
    const target = kind.questions.find((x) => x.id === q.askIf!.questionId);
    const answer =
      typeof q.askIf.equals === "boolean"
        ? q.askIf.equals
          ? "Yes"
          : "No"
        : (target?.choices?.find((c) => c.value === q.askIf!.equals)?.label ?? String(q.askIf.equals));
    const verb = target?.type === "multi" ? "includes" : "is";
    bits.push(`only if "${target?.prompt ?? q.askIf.questionId}" ${verb} ${answer}`);
  }
  const lines = [`${index + 1}. ${esc(q.prompt)} _(${bits.join(", ")})_`];
  if (q.help) lines.push(`   - Help: ${esc(q.help)}`);
  if (q.suggestions?.length) lines.push(`   - Quick taps: ${q.suggestions.map(esc).join("; ")}`);
  if (q.choices?.length) lines.push(`   - Choices: ${q.choices.map((c) => esc(c.label)).join("; ")}`);
  return lines.join("\n");
}

function render(): string {
  const out: string[] = [];
  const push = (...parts: string[]): void => {
    out.push(...parts);
  };

  push(
    "# Coverage tree for Loomis staff",
    "",
    "_This file is generated. Do not edit it by hand._",
    "",
    `**Licensed states:** ${AGENCY.licensedStates.join(", ")}`,
    "",
    "## How to review this",
    "",
    "This is everything a client can add in the Personal Risk Manager and every coverage that can protect it. Please read it with an agent's eye and check three things:",
    "",
    "1. **Which lines we write.** Each line below has a checkbox. `- [x] We write this` means the app will offer a real quote request. `- [ ] We write this` means the app will say \"Ask Loomis about this\" instead. The agency confirmed these on 2026-10-31, except Earthquake and Weddings & events, which are property and casualty lines we assumed Loomis can place. Please confirm those two, and correct anything else that is off.",
    "2. **Is each coverage accurate and fair?** Check the plain-English text. It is written for a 6th-grade reading level, never promises coverage, and says \"Rules vary by state\" where the rules differ. A coverage marked **States** is only offered to clients who live there (for example, New York and Pennsylvania each have their own auto rules). Suggest better words if something is off.",
    "3. **Are we asking the right questions?** The last section lists every question a client sees, in order. We deliberately do not ask about health, tobacco, Social Security numbers, license numbers or bank details. Agents collect those while quoting.",
    "",
    "To make a change, edit the source files and run the script again:",
    "",
    "- Licensed states: `risk-manager/src/catalog/agency.ts`",
    "- Lines and the \"We write this\" setting: `risk-manager/src/catalog/lines.ts`",
    "- Coverages and their wording: `risk-manager/src/catalog/coverages.ts`",
    "- Things clients can add and their questions: `risk-manager/src/catalog/kinds.ts`",
    "- Life events: `risk-manager/src/catalog/lifeEvents.ts`",
    "- Re-run: `cd risk-manager && npm run catalog:check`",
    "",
    "The script checks the catalog for mistakes first and stops with a list if it finds any.",
    "",
    `**At a glance:** ${LINES.length} lines, ${COVERAGES.length} coverages, ${THING_KINDS.length} kinds of things, ${LIFE_EVENTS.length} life events. We write ${LINES.filter((l) => l.agencyWrites).length} of the ${LINES.length} lines today.`,
    "",
    "**Tiers:** Essential means commonly required by law or a lender, or protects against a loss most families could not absorb. Recommended means most households in this situation carry it. Extra means nice to have.",
    "",
    "---",
    "",
    "# Part 1. Coverages, by line",
    "",
  );

  for (const line of LINES) {
    const coverages = COVERAGES.filter((c) => c.line === line.id);
    push(`## ${line.emoji} ${line.label} (\`${line.id}\`)`, "");
    push(line.agencyWrites ? "- [x] We write this" : "- [ ] We write this", "");
    push(`_${line.plainEnglish}_`, "");

    for (const coverage of coverages) {
      push(`### ${coverage.label}`, "");
      push(`- **Id:** \`${coverage.id}\``);
      push(`- **Tier:** ${TIER_LABEL[coverage.tier]}`);
      if (coverage.states?.length) push(`- **States:** ${statesLabel(coverage.states)}`);
      push(`- **What the client reads:** ${coverage.plainEnglish}`);
      push(`- **Protects:** ${protectsLabel(coverage)}`);
      if (coverage.limitOptions) push(`- **Limit choices:** ${options(coverage.limitOptions)}`);
      if (coverage.deductibleOptions) push(`- **Deductible choices:** ${options(coverage.deductibleOptions)}`);
      if (coverage.requires?.length) {
        const names = coverage.requires.map((id) => COVERAGES.find((c) => c.id === id)?.label ?? id);
        push(`- **Needs first:** ${names.join(" and ")}`);
      }
      push("");
    }
  }

  push("---", "", "# Part 2. What clients can add, and what we ask", "");

  for (const category of CATEGORIES) {
    push(`## ${category.emoji} ${category.label}`, "", `_${category.tagline}_`, "");
    for (const kind of THING_KINDS.filter((k) => k.category === category.id)) {
      push(`### ${kind.emoji} ${kind.label} (\`${kind.id}\`)`, "");
      push(`- **Shows up in the world:** zone \`${kind.zone}\``);
      if (kind.parentKinds?.length) {
        const parents = kind.parentKinds.map((id) => kindById(id)?.label ?? id);
        push(`- **Lives inside:** ${parents.join(", ")}`);
      }
      push(`- **Points for adding it:** ${kind.xp} XP`);
      if (kind.firstTimeReveal) push(`- **First-time surprise:** "${kind.firstTimeReveal}"`);
      if (kind.coverages.length) {
        const labels = kind.coverages.map((id) => {
          const coverage = COVERAGES.find((c) => c.id === id);
          if (!coverage) return id;
          return coverage.states?.length ? `${coverage.label} (${coverage.states.join(", ")})` : coverage.label;
        });
        push(`- **Coverages offered:** ${labels.join("; ")}`);
      } else {
        push("- **Coverages offered:** none");
      }
      push("");
      if (kind.goodToKnow?.length) {
        push("**Good to know notes:**", "");
        for (const note of kind.goodToKnow) push(`- ${note}`);
        push("");
      }
      push("**Questions, in order:**", "");
      kind.questions.forEach((q, i) => push(describeQuestion(q, i, kind)));
      push("");
    }
  }

  push("---", "", "# Part 3. Life events", "");
  push("Each one is a moment a client can pick. It suggests what to add and which coverages to look at.", "");
  for (const event of LIFE_EVENTS) {
    const kinds = event.suggestKinds.map((id) => kindById(id)?.label ?? id);
    const coverages = event.suggestCoverages.map((id) => COVERAGES.find((c) => c.id === id)?.label ?? id);
    push(`### ${event.emoji} ${event.label}`, "");
    push(`- **Message:** ${event.message}`);
    push(`- **Suggests adding:** ${kinds.length ? kinds.join(", ") : "nothing in particular"}`);
    push(`- **Suggests looking at:** ${coverages.join("; ")}`);
    push("");
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

// ---------------------------------------------------------------------------
// Entry point. Last on purpose: it uses the consts above.
// ---------------------------------------------------------------------------

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(root, "docs", "COVERAGE_TREE.md");

const problems = validateCatalog();
if (problems.length > 0) {
  console.error(`Catalog has ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exitCode = 1;
} else {
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, render(), "utf8");
  console.log(`Wrote ${relative(resolve(root, ".."), outFile)}`);
}
