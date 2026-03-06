// src/lib/constants.ts
// Compile-time constants shared across engine and UI.
// Add all magic numbers here — never inline them in feature code.

/** Jaro-Winkler score above which a degraded variant is considered "caught".
 *  Standard in watchlist screening literature. Not a form parameter in v1. */
export const DEFAULT_CATCH_THRESHOLD = 0.85;

/** Maximum names per entity type the form allows. */
export const MAX_ENTITY_COUNT = 500;

// ─── v3.0 additions — Phase 15 ────────────────────────────────────────────────

export { TIER_THRESHOLDS, MAX_SCREENING_NAMES, COST_OF_MISS_MULTIPLIER } from '@/types/screening';
