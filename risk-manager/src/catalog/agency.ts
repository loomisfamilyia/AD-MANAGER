/**
 * Who the agency is, and where it is licensed.
 *
 * `licensedStates` drives which state-specific coverages appear. A coverage
 * with `states: ["NY"]` (see types.ts) is only offered to a client whose home
 * state is New York, and the validator refuses any coverage that names a state
 * not listed here.
 *
 * A client whose home is outside these states can still build a world and
 * plan their protection. They just get a friendly "Loomis is licensed in New
 * York and Pennsylvania" note instead of a quote button. The app implements
 * that note; the catalog only supplies `isLicensedState()` to decide it.
 *
 * To add a state, add its two-letter USPS code here, then add any
 * state-specific coverages it needs. Confirmed by the agency on 2026-10-31:
 * licensed in NY and PA for life, property and casualty, personal and
 * commercial.
 */
export const AGENCY = {
  name: "Loomis Family Insurance Agency",
  licensedStates: ["NY", "PA"],
  mascot: "Roxie",
} as const;

/** A two-letter USPS code the agency is licensed in. */
export type LicensedState = (typeof AGENCY.licensedStates)[number];

/**
 * True when Loomis can quote a home in this state. Case-insensitive, and
 * false for a missing state, so "we don't know yet" never promises a quote.
 */
export function isLicensedState(state: string | null | undefined): boolean {
  if (!state) return false;
  return (AGENCY.licensedStates as readonly string[]).includes(state.trim().toUpperCase());
}
