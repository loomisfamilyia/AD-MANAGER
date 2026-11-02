/**
 * The catalog: every kind of "thing" a client can add to their world, the
 * questions we ask about it, and every coverage that can protect it.
 *
 * It lives in code rather than the database on purpose. The ids here are the
 * join keys the database stores (`assets.kind`, `coverage_choices.coverage_id`,
 * `budget_lines.line`), so renaming an id is a migration, not a copy edit.
 * Labels and help text can change freely.
 *
 * Writing rules for anything a client reads (label, prompt, plainEnglish):
 *   - 6th-grade reading level. "Pays to fix your car" — not "first-party
 *     physical damage coverage".
 *   - No fear. We point out gaps; we don't threaten people with them.
 *   - Never promise coverage. Everything the client builds is a *plan* until
 *     Loomis verifies a real policy.
 */

// ---------------------------------------------------------------------------
// Lines of business — the buckets a budget is split across
// ---------------------------------------------------------------------------

export type LineId =
  | "auto"
  | "home"
  | "renters"
  | "condo"
  | "landlord"
  | "flood"
  | "earthquake"
  | "umbrella"
  | "valuables"
  | "motorcycle"
  | "recreational" // ATV/UTV, snowmobile, golf cart, dirt bike
  | "watercraft"
  | "rv"
  | "collector_vehicle"
  | "pet"
  | "life"
  | "disability"
  | "long_term_care"
  | "health"
  | "medicare"
  | "supplemental_health" // accident, critical illness, hospital indemnity
  | "dental_vision"
  | "travel"
  | "cyber" // personal cyber: identity restoration, online fraud, extortion
  | "event"
  | "commercial"; // v1 hard stop: we record the business, we don't quote it

export interface Line {
  id: LineId;
  label: string;
  /** One sentence, plain English. Shown on the budget screen. */
  plainEnglish: string;
  emoji: string;
  /**
   * Whether Loomis writes this line today. Lines set to false still appear in
   * the client's plan (the need is real), but the quote button becomes
   * "Ask Loomis about this" so nobody is promised a product we don't sell.
   * Loomis staff should review every one of these before launch.
   */
  agencyWrites: boolean;
}

// ---------------------------------------------------------------------------
// Categories — the big tiles in the "Add" menu
// ---------------------------------------------------------------------------

export type CategoryId =
  | "people"
  | "home"
  | "vehicles"
  | "toys"
  | "pets"
  | "valuables"
  | "work";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Short invitation under the tile: "Who lives with you?" */
  tagline: string;
}

// ---------------------------------------------------------------------------
// Questions — asked one per screen, easiest first
// ---------------------------------------------------------------------------

export type QuestionType =
  | "text"
  | "number"
  | "money" // whole dollars
  | "year"
  | "date"
  | "yesno"
  | "choice" // single select from `choices`
  | "multi" // multi select from `choices`
  | "photo"
  | "vin" // 17 chars; decoded against NHTSA vPIC
  | "address"; // triggers the public-records lookup

export interface Choice {
  value: string;
  label: string;
  emoji?: string;
}

export interface Question {
  /** Key inside `assets.details` (or a `people` column for person kinds). */
  id: string;
  prompt: string;
  type: QuestionType;
  choices?: Choice[];
  /** One line shown under the prompt. Why we ask, in plain English. */
  help?: string;
  /**
   * Required questions are the minimum to place the thing on the map —
   * usually just a name. Everything else offers "Skip for now" and
   * "I don't know", and both are always acceptable answers.
   */
  required?: boolean;
  /** Only ask when an earlier answer matches, e.g. ask pool fencing only if pool = yes. */
  askIf?: { questionId: string; equals: string | boolean };
  /** Suggested quick-tap answers for text questions ("Mom's car", "The truck"). */
  suggestions?: string[];
  /** Placeholder or example shown in the input. */
  example?: string;
}

// ---------------------------------------------------------------------------
// Thing kinds — everything that can be placed in the world
// ---------------------------------------------------------------------------

/**
 * Where a thing appears in the world. The world is laid out in zones around
 * the player's home so a crowded world still reads at a glance.
 */
export type WorldZone =
  | "home" // the house itself, centered
  | "yard" // features, pets, small toys around the house
  | "driveway" // cars, trucks, motorcycles
  | "garage" // toys stored at home: ATVs, snowmobiles, golf carts
  | "water" // boats and PWC — adding one makes a lake appear
  | "pasture" // horses and livestock-adjacent pets
  | "town" // jobs, businesses, other properties
  | "vault" // valuables, shown as a treasure chest next to the house
  | "inside"; // never on the map: inventory and home systems live in the home's detail view

export interface ThingKind {
  /** Stable id. Stored in `assets.kind` (or `people.kind` for person kinds). */
  id: string;
  category: CategoryId;
  label: string;
  emoji: string;
  zone: WorldZone;
  /**
   * For things that only exist inside another thing: a home system or an
   * inventory item belongs to a residence. Stored as `assets.parent_id`.
   */
  parentKinds?: string[];
  questions: Question[];
  /** Coverage ids that can protect this thing. Order = display order. */
  coverages: string[];
  /** Points for placing it. Completeness points come from answered questions. */
  xp: number;
  /**
   * What the world does when the first one of these appears — the "wow"
   * moment. e.g. a boat: "A lake appears!" Optional; most kinds just drop in.
   */
  firstTimeReveal?: string;
  /**
   * Gentle, factual notes we can surface once enough is known. Shown as a
   * "Good to know" card, never as a warning. e.g. a trampoline: "Some home
   * policies limit trampoline coverage. Worth asking Loomis."
   */
  goodToKnow?: string[];
}

// ---------------------------------------------------------------------------
// Coverages — the leaves of the protection tree
// ---------------------------------------------------------------------------

/**
 * Our suggestion, not the client's choice. The client marks each coverage
 * Need / Want / Not now; tier only decides the default order and which ones we
 * pre-highlight.
 *
 *   essential   — commonly required (by law or a lender) or protects against
 *                 a loss most families couldn't absorb
 *   recommended — most households in this situation carry it
 *   extra       — nice to have; the "dream policy" layer
 */
export type CoverageTier = "essential" | "recommended" | "extra";

export interface CoverageOption {
  value: string;
  label: string; // "$100,000 / $300,000"
}

export interface Coverage {
  /** Stable id. Stored in `coverage_choices.coverage_id`. */
  id: string;
  line: LineId;
  label: string;
  /** One sentence a 10-year-old and an 80-year-old both understand. */
  plainEnglish: string;
  tier: CoverageTier;
  /**
   * Thing kind ids this coverage can attach to. Two ids are special:
   *   "person"    — any person in the household (life, disability, health)
   *   "household" — the family as a whole (umbrella, personal cyber, travel)
   */
  protects: string[];
  /**
   * Only offered when the client's home state is one of these. Omit for
   * coverages offered everywhere. Two-letter USPS codes, and every one must be
   * a state the agency is licensed in (see agency.ts); the validator checks.
   */
  states?: string[];
  /** Limit choices, when picking one makes sense for a quote. */
  limitOptions?: CoverageOption[];
  /** Deductible choices, when relevant. */
  deductibleOptions?: CoverageOption[];
  /** Coverage ids that only make sense alongside this one, e.g. rental needs collision. */
  requires?: string[];
}

// ---------------------------------------------------------------------------
// Life events — quests that suggest what to add next
// ---------------------------------------------------------------------------

export interface LifeEvent {
  id: string;
  label: string; // "We're having a baby"
  emoji: string;
  /** What we suggest adding or reviewing, in order. */
  suggestKinds: string[];
  suggestCoverages: string[];
  /** One warm sentence shown when the event is chosen. */
  message: string;
}

// ---------------------------------------------------------------------------
// The client's answers about a coverage
// ---------------------------------------------------------------------------

export type Stance = "need" | "want" | "not_now";

/**
 * How protected a thing actually is. Only `verified` means a real policy, and
 * only Loomis staff can set it — the client-side app can never produce it.
 * The art must make these impossible to confuse.
 */
export type ProtectionState =
  | "none" // nothing chosen yet
  | "planned" // client marked Need/Want — dashed shield outline
  | "requested" // included in a sent quote request — pulsing shield
  | "verified"; // Loomis linked an in-force policy — solid gold shield
