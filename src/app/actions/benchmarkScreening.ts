'use server';
// src/app/actions/benchmarkScreening.ts
// Phase 15 benchmark server action.
// Receives up to 1,000 names, runs JW-only scoring against all SDN entries,
// and returns elapsed milliseconds. Used to measure server-action viability
// for the screening compute model before Phase 16 is built.
//
// JW-only (not the full 3-algorithm composite) is intentional — the bottleneck
// is the comparison count (1,000 × 290 = 290,000 ops), not per-pair complexity.
// Phase 16 must re-benchmark with 3x compute factor.

import sdnData from '@data/sdn.json';
import type { SdnEntry } from '@/types';
import jaroWinkler from 'talisman/metrics/jaro-winkler';

export interface BenchmarkResult {
  elapsedMs: number;
  nameCount: number;
  sdnCount: number;
  comparisons: number;
}

/**
 * Run a JW-only benchmark against the full SDN dataset.
 * @param names - Input names (max 1,000 — enforced server-side)
 * @returns Timing result with comparison count for transparency.
 */
export async function benchmarkScreening(names: string[]): Promise<BenchmarkResult> {
  const entries = sdnData as SdnEntry[];
  // Hard cap — never allow caller to bypass the 1,000-name limit for this action
  const safeNames = names.slice(0, 1000);

  const start = performance.now();

  // JW-only loop — 1,000 × 290 = 290,000 comparisons per call
  for (const name of safeNames) {
    const normalized = name.toUpperCase();
    for (const entry of entries) {
      const raw = jaroWinkler(normalized, entry.name.toUpperCase());
      // Result intentionally discarded — this is a timing-only benchmark
      void raw;
    }
  }

  const elapsedMs = performance.now() - start;

  return {
    elapsedMs: Math.round(elapsedMs),
    nameCount: safeNames.length,
    sdnCount: entries.length,
    comparisons: safeNames.length * entries.length,
  };
}
