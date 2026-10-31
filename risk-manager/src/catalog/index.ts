/**
 * Public face of the catalog: the data, a few pure lookups, and a validator.
 * Everything here is plain data and pure functions so it runs the same in the
 * app, in tests and in the staff-review script.
 */
import { CATEGORIES } from "./categories.ts";
import { COVERAGES } from "./coverages.ts";
import { THING_KINDS } from "./kinds.ts";
import { LIFE_EVENTS } from "./lifeEvents.ts";
import { LINES } from "./lines.ts";
import type { Category, CategoryId, Coverage, Line, LineId, Question, ThingKind } from "./types.ts";

export { CATEGORIES, COVERAGES, LIFE_EVENTS, LINES, THING_KINDS };
export type {
  Category,
  CategoryId,
  Choice,
  Coverage,
  CoverageOption,
  CoverageTier,
  LifeEvent,
  Line,
  LineId,
  ProtectionState,
  Question,
  QuestionType,
  Stance,
  ThingKind,
  WorldZone,
} from "./types.ts";

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const kindIndex = new Map<string, ThingKind>(THING_KINDS.map((k) => [k.id, k]));
const coverageIndex = new Map<string, Coverage>(COVERAGES.map((c) => [c.id, c]));
const lineIndex = new Map<string, Line>(LINES.map((l) => [l.id, l]));

export function kindById(id: string): ThingKind | undefined {
  return kindIndex.get(id);
}

export function coverageById(id: string): Coverage | undefined {
  return coverageIndex.get(id);
}

export function lineById(id: string): Line | undefined {
  return lineIndex.get(id);
}

/**
 * Coverages that can protect a kind. `coverage.protects` decides membership;
 * `kind.coverages` only decides display order (anything it forgot to list goes
 * last). Works for the two virtual targets too: "person" is a real kind, and
 * "household" has no kind at all, so it is answered straight from `protects`.
 */
export function coveragesFor(kindId: string): Coverage[] {
  const order = kindIndex.get(kindId)?.coverages ?? [];
  const rank = (id: string): number => {
    const i = order.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return COVERAGES.filter((c) => c.protects.includes(kindId)).sort((a, b) => rank(a.id) - rank(b.id));
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Exhaustive on purpose: adding a LineId or CategoryId to types.ts makes these
 * objects fail to compile until someone writes the matching catalog entry.
 */
const LINE_IDS: Record<LineId, true> = {
  auto: true,
  home: true,
  renters: true,
  condo: true,
  landlord: true,
  flood: true,
  earthquake: true,
  umbrella: true,
  valuables: true,
  motorcycle: true,
  recreational: true,
  watercraft: true,
  rv: true,
  collector_vehicle: true,
  pet: true,
  life: true,
  disability: true,
  long_term_care: true,
  health: true,
  medicare: true,
  supplemental_health: true,
  dental_vision: true,
  travel: true,
  identity_theft: true,
  event: true,
  commercial: true,
};

const CATEGORY_IDS: Record<CategoryId, true> = {
  people: true,
  home: true,
  vehicles: true,
  toys: true,
  pets: true,
  valuables: true,
  work: true,
};

/** Coverage targets that are not a kind in THING_KINDS. */
const VIRTUAL_TARGETS = new Set(["household"]);

/** Labels become big phone buttons. */
const MAX_LABEL_LENGTH = 28;
const MIN_XP = 50;
const MAX_XP = 150;

const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;

/** The v1 commercial hard stop, spelled out so a stray edit can't widen it. */
const BUSINESS_QUESTION_IDS = ["business_name", "description"];
const COMMERCIAL_COVERAGE_ID = "commercial_review";

/** Fear, guarantees and pressure. We point out gaps; we don't threaten anyone. */
const TONE_PATTERNS: RegExp[] = [
  /not covered/i,
  /isn't covered/i,
  /aren't covered/i,
  /guarantee/i,
  /devastat/i,
  /catastroph/i,
  /\bruin/i,
  /tragic/i,
  /too late/i,
  /don't wait/i,
];

/** Things only a licensed agent should ask while quoting. */
const DATA_MINIMIZATION_PATTERNS: RegExp[] = [
  /social security/i,
  /\bssn\b/i,
  /license (number|#)/i,
  /tobacco/i,
  /cigarette/i,
  /\bsmoker\b/i,
  /medical (condition|history)/i,
  /health (condition|history)/i,
  /diagnos/i,
  /\bbank\b/i,
  /routing number/i,
  /account number/i,
  /credit card/i,
  /card number/i,
];

const GUN_EMOJI = "🔫";

const duplicates = (values: string[]): string[] => [...new Set(values.filter((v, i) => values.indexOf(v) !== i))];

/** Every string a client can read on a question, with a short name for error messages. */
function questionStrings(q: Question): string[] {
  return [q.prompt, q.help ?? "", q.example ?? "", ...(q.suggestions ?? []), ...(q.choices ?? []).map((c) => c.label)];
}

/**
 * Returns a list of problems; an empty list means the catalog is consistent.
 *
 * Decision: a coverage and a kind that disagree about each other is an ERROR,
 * in both directions, not a warning. The two lists are the same fact written
 * twice, and a mismatch means a button that shows in one place and not the
 * other.
 */
export function validateCatalog(): string[] {
  const problems: string[] = [];
  const add = (message: string): void => {
    problems.push(message);
  };

  const checkIds = (what: string, ids: string[]): void => {
    for (const id of duplicates(ids)) add(`${what}: duplicate id "${id}"`);
    for (const id of ids) if (!SNAKE_CASE.test(id)) add(`${what}: id "${id}" is not lowercase snake_case`);
  };

  // --- Lines and categories --------------------------------------------------
  checkIds("line", LINES.map((l) => l.id));
  for (const id of Object.keys(LINE_IDS)) {
    if (!lineIndex.has(id)) add(`line "${id}" is a LineId but has no entry in LINES`);
  }
  for (const line of LINES) {
    if (!(line.id in LINE_IDS)) add(`line "${line.id}" is not a known LineId`);
    if (!COVERAGES.some((c) => c.line === line.id)) add(`line "${line.id}" has no coverages`);
  }

  checkIds("category", CATEGORIES.map((c) => c.id));
  const categoryIds = new Set<string>(CATEGORIES.map((c) => c.id));
  for (const id of Object.keys(CATEGORY_IDS)) {
    if (!categoryIds.has(id)) add(`category "${id}" is a CategoryId but has no entry in CATEGORIES`);
  }
  for (const category of CATEGORIES as Category[]) {
    if (!(category.id in CATEGORY_IDS)) add(`category "${category.id}" is not a known CategoryId`);
  }

  // --- Kinds -----------------------------------------------------------------
  checkIds("kind", THING_KINDS.map((k) => k.id));

  for (const kind of THING_KINDS) {
    const where = `kind "${kind.id}"`;

    if (!categoryIds.has(kind.category)) add(`${where}: unknown category "${kind.category}"`);
    if (kind.label.length > MAX_LABEL_LENGTH) {
      add(`${where}: label "${kind.label}" is ${kind.label.length} characters (max ${MAX_LABEL_LENGTH})`);
    }
    if (kind.xp < MIN_XP || kind.xp > MAX_XP) add(`${where}: xp ${kind.xp} is outside ${MIN_XP}-${MAX_XP}`);

    for (const parent of kind.parentKinds ?? []) {
      if (parent === kind.id) add(`${where}: lists itself as a parent`);
      else if (!kindIndex.has(parent)) add(`${where}: parentKinds references unknown kind "${parent}"`);
    }

    // Questions
    for (const id of duplicates(kind.questions.map((q) => q.id))) add(`${where}: duplicate question id "${id}"`);
    kind.questions.forEach((q, qi) => {
      const qWhere = `${where}, question "${q.id}"`;
      if (!SNAKE_CASE.test(q.id)) add(`${qWhere}: id is not lowercase snake_case`);
      if (q.prompt.trim() === "") add(`${qWhere}: empty prompt`);

      if (q.required && qi !== 0) add(`${qWhere}: only the first question (the name) may be required`);

      const hasChoices = q.type === "choice" || q.type === "multi";
      if (hasChoices && (!q.choices || q.choices.length === 0)) add(`${qWhere}: ${q.type} question has no choices`);
      if (!hasChoices && q.choices) add(`${qWhere}: ${q.type} question should not have choices`);
      for (const value of duplicates((q.choices ?? []).map((c) => c.value))) {
        add(`${qWhere}: duplicate choice value "${value}"`);
      }

      if (q.askIf) {
        const targetIndex = kind.questions.findIndex((x) => x.id === q.askIf!.questionId);
        const target = kind.questions[targetIndex];
        if (!target) {
          add(`${qWhere}: askIf references unknown question "${q.askIf.questionId}"`);
        } else if (targetIndex >= qi) {
          add(`${qWhere}: askIf references "${q.askIf.questionId}", which is not asked earlier`);
        } else if (target.type === "yesno") {
          if (typeof q.askIf.equals !== "boolean") add(`${qWhere}: askIf on a yes/no question must equal true or false`);
        } else if (target.type === "choice" || target.type === "multi") {
          const values = (target.choices ?? []).map((c) => c.value);
          if (!values.includes(String(q.askIf.equals))) {
            add(`${qWhere}: askIf value "${String(q.askIf.equals)}" is not a choice of "${target.id}"`);
          }
        } else {
          add(`${qWhere}: askIf points at a ${target.type} question, which can't be matched`);
        }
      }

      for (const s of questionStrings(q)) {
        for (const pattern of DATA_MINIMIZATION_PATTERNS) {
          if (pattern.test(s)) add(`${qWhere}: "${s}" asks for something agents collect while quoting (${pattern})`);
        }
      }
    });

    // Coverage list, mirrored against coverage.protects
    for (const id of duplicates(kind.coverages)) add(`${where}: coverage "${id}" is listed twice`);
    for (const id of kind.coverages) {
      const coverage = coverageIndex.get(id);
      if (!coverage) add(`${where}: coverages references unknown coverage "${id}"`);
      else if (!coverage.protects.includes(kind.id)) {
        add(`${where}: lists coverage "${id}", but that coverage does not list "${kind.id}" in protects`);
      }
    }

    for (const text of [kind.label, kind.firstTimeReveal ?? "", ...(kind.goodToKnow ?? [])]) {
      for (const pattern of TONE_PATTERNS) if (pattern.test(text)) add(`${where}: "${text}" breaks the tone rules (${pattern})`);
    }
    if (kind.emoji.includes(GUN_EMOJI)) add(`${where}: uses the gun emoji (use 🎯 for firearms)`);
  }

  // --- Coverages -------------------------------------------------------------
  checkIds("coverage", COVERAGES.map((c) => c.id));

  for (const coverage of COVERAGES) {
    const where = `coverage "${coverage.id}"`;

    if (!(coverage.line in LINE_IDS)) add(`${where}: unknown line "${coverage.line}"`);
    if (coverage.label.length > MAX_LABEL_LENGTH) {
      add(`${where}: label "${coverage.label}" is ${coverage.label.length} characters (max ${MAX_LABEL_LENGTH})`);
    }
    if (coverage.protects.length === 0) add(`${where}: protects nothing`);
    for (const id of duplicates(coverage.protects)) add(`${where}: protects "${id}" twice`);

    for (const target of coverage.protects) {
      if (VIRTUAL_TARGETS.has(target)) continue;
      const kind = kindIndex.get(target);
      if (!kind) add(`${where}: protects unknown kind "${target}"`);
      else if (!kind.coverages.includes(coverage.id)) {
        add(`${where}: protects "${target}", but that kind does not list it in coverages`);
      }
    }

    for (const [name, list] of [
      ["limitOptions", coverage.limitOptions],
      ["deductibleOptions", coverage.deductibleOptions],
    ] as const) {
      if (!list) continue;
      if (list.length === 0) add(`${where}: ${name} is empty`);
      for (const value of duplicates(list.map((o) => o.value))) add(`${where}: duplicate ${name} value "${value}"`);
    }

    for (const required of coverage.requires ?? []) {
      const base = coverageIndex.get(required);
      if (required === coverage.id) add(`${where}: requires itself`);
      else if (!base) add(`${where}: requires unknown coverage "${required}"`);
      else {
        // A client can only pick the base on a thing that offers it.
        for (const target of coverage.protects) {
          if (!base.protects.includes(target)) {
            add(`${where}: requires "${required}", which does not protect "${target}"`);
          }
        }
      }
    }

    const clientText = [
      coverage.label,
      coverage.plainEnglish,
      ...(coverage.limitOptions ?? []).map((o) => o.label),
      ...(coverage.deductibleOptions ?? []).map((o) => o.label),
    ];
    for (const text of clientText) {
      for (const pattern of TONE_PATTERNS) if (pattern.test(text)) add(`${where}: "${text}" breaks the tone rules (${pattern})`);
    }
  }

  // --- Lines and categories: client-facing text and emoji ---------------------
  for (const line of LINES) {
    for (const pattern of TONE_PATTERNS) {
      if (pattern.test(line.plainEnglish)) add(`line "${line.id}": "${line.plainEnglish}" breaks the tone rules (${pattern})`);
    }
  }
  for (const item of [...LINES, ...CATEGORIES, ...LIFE_EVENTS]) {
    if (item.emoji.includes(GUN_EMOJI)) add(`"${item.id}": uses the gun emoji`);
  }

  // --- Commercial hard stop --------------------------------------------------
  for (const coverage of COVERAGES) {
    if (coverage.line === "commercial" && coverage.id !== COMMERCIAL_COVERAGE_ID) {
      add(`coverage "${coverage.id}": the commercial line may only hold "${COMMERCIAL_COVERAGE_ID}" in v1`);
    }
  }
  const business = kindIndex.get("business");
  if (!business) {
    add(`kind "business" is missing`);
  } else {
    const ids = business.questions.map((q) => q.id);
    if (ids.length !== BUSINESS_QUESTION_IDS.length || ids.some((id, i) => id !== BUSINESS_QUESTION_IDS[i])) {
      add(`kind "business": v1 may only ask ${BUSINESS_QUESTION_IDS.join(" and ")}`);
    }
    if (business.coverages.length !== 1 || business.coverages[0] !== COMMERCIAL_COVERAGE_ID) {
      add(`kind "business": its only coverage in v1 is "${COMMERCIAL_COVERAGE_ID}"`);
    }
  }

  // --- Life events -----------------------------------------------------------
  checkIds("life event", LIFE_EVENTS.map((e) => e.id));
  for (const event of LIFE_EVENTS) {
    const where = `life event "${event.id}"`;
    for (const id of event.suggestKinds) if (!kindIndex.has(id)) add(`${where}: suggests unknown kind "${id}"`);
    for (const id of event.suggestCoverages) {
      if (!coverageIndex.has(id)) add(`${where}: suggests unknown coverage "${id}"`);
    }
    for (const pattern of TONE_PATTERNS) {
      if (pattern.test(event.message)) add(`${where}: "${event.message}" breaks the tone rules (${pattern})`);
    }
  }

  return problems;
}
