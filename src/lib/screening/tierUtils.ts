import type { RiskTier } from '@/types/screening';

/** The OFAC industry benchmark threshold — "What would OFAC see?" lock target. */
export const OFAC_BENCHMARK_THRESHOLD = 0.85;

/** Round a score to 4 decimal places to avoid floating-point drift (e.g. 0.80+0.17 = 0.9700000000000001). */
function r(x: number): number {
  return Math.round(x * 10_000) / 10_000;
}

/**
 * Assign a risk tier based on a dynamic medium floor (from the threshold slider).
 * The slider value IS the MEDIUM floor. Other tiers maintain fixed spacing:
 *   EXACT  = mediumFloor + 0.17
 *   HIGH   = mediumFloor + 0.10
 *   MEDIUM = mediumFloor
 *   LOW    = mediumFloor - 0.10
 *   CLEAR  = below LOW
 *
 * Tier collapse: when the EXACT floor exceeds 1.0 (all real scores are unreachable for EXACT),
 * EXACT is treated as unreachable and HIGH absorbs that band. Similarly if HIGH > 1.0,
 * MEDIUM absorbs the HIGH band. This maintains meaningful tier assignment across all slider positions.
 *
 * All comparisons use 4-decimal rounding to avoid IEEE 754 drift
 * (e.g. 0.80 + 0.17 = 0.9700000000000001 in JavaScript).
 */
export function assignTierDynamic(score: number, mediumFloor: number): RiskTier {
  const s = r(score);
  const m = r(mediumFloor);
  const exactFloor = r(m + 0.17);
  const highFloor  = r(m + 0.10);
  const lowFloor   = r(m - 0.10);

  // Tier collapse: when EXACT is unreachable (> 1.0), HIGH absorbs the entire band above MEDIUM.
  // This means the effective HIGH floor collapses to mediumFloor when exactFloor > 1.
  const exactReachable = exactFloor <= 1;

  if (exactReachable && s >= exactFloor)           return 'EXACT';
  if (!exactReachable && s > m)                    return 'HIGH';   // collapse: HIGH absorbs all above MEDIUM
  if (exactReachable && s >= highFloor)            return 'HIGH';
  if (s >= m)                                      return 'MEDIUM';
  if (s >= lowFloor)                               return 'LOW';
  return 'CLEAR';
}
