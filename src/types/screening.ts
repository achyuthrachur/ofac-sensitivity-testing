// src/types/screening.ts
// All v3.0 type contracts. Never import from or merge with src/types/index.ts.

// ─── Risk Tier ────────────────────────────────────────────────────────────────

export const RISK_TIER_VALUES = {
  EXACT: 'EXACT',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  CLEAR: 'CLEAR',
} as const;

export type RiskTier = (typeof RISK_TIER_VALUES)[keyof typeof RISK_TIER_VALUES];

// ─── Tier Thresholds ──────────────────────────────────────────────────────────

/** Composite score thresholds for tier assignment. Scores at-or-above boundary = that tier. */
export const TIER_THRESHOLDS = {
  EXACT: 0.97,
  HIGH: 0.90,
  MEDIUM: 0.80,
  LOW: 0.70,
  // CLEAR: composite score below LOW
} as const;

// ─── Screening Constants ──────────────────────────────────────────────────────

/** Maximum names a single screening run may contain. */
export const MAX_SCREENING_NAMES = 10_000;

/**
 * OFAC civil penalty multiplier. A missed SDN hit on a $X transaction may
 * expose the institution to $X * COST_OF_MISS_MULTIPLIER in penalties.
 * Source: OFAC civil penalty guidelines. Not configurable.
 */
export const COST_OF_MISS_MULTIPLIER = 4.0;

// ─── Match Result ─────────────────────────────────────────────────────────────

/** Full match record produced by the Phase 16 scoring engine. */
export interface MatchResult {
  // Input
  rawInput: string;
  normalizedInput: string;
  // Best SDN match
  inputName: string;        // alias of rawInput for display
  matchedSdnName: string;
  sdnId: string;
  entityType: string;
  region: string;
  country: string | null;
  // Scores (Phase 16 populates; Phase 15 stubs may use 0)
  jwScore: number;
  dmBonus: number;
  tsrScore: number;
  compositeScore: number;
  matchAlgorithm: 'jaro-winkler' | 'double-metaphone' | 'token-sort-ratio';
  // Classification
  riskTier: RiskTier;
  nameLengthPenaltyApplied: boolean;
  effectiveTier: RiskTier;
  transformationDetected: boolean;
}

/**
 * Minimal match record used during Phase 15 tab stub rendering.
 * Phase 16 replaces all usages with the full MatchResult.
 */
export interface MatchResultStub {
  inputName: string;
  compositeScore: number;
  riskTier: RiskTier;
}

// ─── Simulation (stub types — Phase 21 adds body) ────────────────────────────

/** Placeholder — Phase 21 expands this with full snapshot fields. */
export interface SimulationSnapshot {
  snapshotIndex: number;
  catchRate: number;
  missedCount: number;
  evasionTierActive: 0 | 1 | 2 | 3;
}

// ─── Worker API ───────────────────────────────────────────────────────────────

/** Interface for the Comlink-exposed Web Worker — Phase 16 implements the body. */
export interface ScreeningWorkerApi {
  /**
   * Screen a list of input names against all SDN entries.
   * @param inputNames - Names to screen (max MAX_SCREENING_NAMES)
   * @param sdnEntries - Full SDN dataset passed from main thread (avoids @data/* alias in worker)
   * @returns Populated MatchResult[] — Phase 16 implementation required
   */
  screenNames(
    inputNames: string[],
    sdnEntries: unknown[]
  ): Promise<MatchResult[]>;
}
