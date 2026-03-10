/**
 * simulation.ts — Phase 21 type contracts for Simulation Mode.
 * Replaces the SimulationSnapshot stub in types/screening.ts.
 */

// ─── Velocity Presets ─────────────────────────────────────────────────────────

export type SimulationPresetId = 'BASELINE' | 'ELEVATED' | 'SURGE';

export interface SimulationPresetConfig {
  id: SimulationPresetId;
  label: string;
  description: string;
  snapshotCount: number;   // total number of time steps
  entityCount: number;     // number of synthetic SDN targets
  /** Fraction of snapshotCount at which each evasion tier activates */
  evasionActivationPct: [number, number, number]; // [tier1, tier2, tier3]
  /** Score multiplier per evasion tier: [tier0, tier1, tier2, tier3] */
  evasionPenalty: [number, number, number, number];
}

// ─── Entity ───────────────────────────────────────────────────────────────────

export interface SimulationEntity {
  id: string;
  baseName: string;
  baseScore: number;          // composite score at Tier 0 (no evasion)
  addedAtSnapshot: number;    // snapshot index when entity first appeared
}

// ─── Snapshot ─────────────────────────────────────────────────────────────────

export interface SimulationEntityRow {
  entityId: string;
  baseName: string;
  transformation: string;       // human-readable evasion description
  score: number;                // effective composite score at this snapshot
  result: 'CAUGHT' | 'MISSED'; // based on 0.85 benchmark threshold
  evasionTier: 0 | 1 | 2 | 3;
}

export interface SimulationSnapshot {
  snapshotIndex: number;
  catchRate75: number;      // catch rate at 0.75 threshold
  catchRate85: number;      // catch rate at 0.85 benchmark threshold
  catchRate95: number;      // catch rate at 0.95 threshold
  cumulativeMissed: number; // cumulative missed entities at 0.85 threshold
  evasionTierActive: 0 | 1 | 2 | 3;
  entityRows: SimulationEntityRow[];
}

// ─── Result ───────────────────────────────────────────────────────────────────

export interface SimulationResult {
  preset: SimulationPresetId;
  snapshots: SimulationSnapshot[];
  entities: (SimulationEntity & { detectionLag: number | null })[];
}

// ─── Evasion tier labels ──────────────────────────────────────────────────────

export const EVASION_TIER_LABELS: Record<0 | 1 | 2 | 3, string> = {
  0: 'None',
  1: 'Transliteration variant',
  2: 'Homoglyph substitution',
  3: 'Combined transliteration + insertion',
};

export const EVASION_TIER_DESCRIPTIONS: Record<0 | 1 | 2 | 3, string> = {
  0: 'Original name — no evasion applied',
  1: 'Tier 1 — common transliteration substitutions (e.g. "ph" for "f")',
  2: 'Tier 2 — Unicode homoglyph substitution (Cyrillic/Latin lookalikes)',
  3: 'Tier 3 — combined transliteration, homoglyph insertion, and token reordering',
};
