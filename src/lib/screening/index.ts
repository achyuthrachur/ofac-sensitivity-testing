// src/lib/screening/index.ts
// Phase 15 stub — Phase 16 replaces with real multi-algorithm scorer.
// All call sites import from this path; Phase 16 fills in the implementation
// without changing import paths.

export type { MatchResult, MatchResultStub, RiskTier, ScreeningWorkerApi } from '@/types/screening';
export { RISK_TIER_VALUES, TIER_THRESHOLDS } from '@/types/screening';

/**
 * Screen a list of input names against the SDN dataset.
 * @throws {Error} Not implemented — Phase 16
 */
export function screenNames(
  _inputNames: string[],
  _sdnEntries: unknown[]
): never {
  throw new Error('screenNames: Not implemented — Phase 16');
}
