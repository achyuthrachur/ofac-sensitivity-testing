// src/lib/sampler.ts
// Pure function: sample entries from the dataset per RunParams.
// Uses Mulberry32 seeded PRNG for deterministic, reproducible results.
import type { SdnEntry, RunParams } from '@/types';

/**
 * Mulberry32 — 32-bit seeded PRNG.
 * Returns a function producing floats in [0, 1).
 * Source: public domain algorithm; no npm dependency needed.
 */
function mulberry32(seed: number): () => number {
  let s = seed;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample entries from data according to RunParams.
 * Filters by params.regions and params.entityCounts before sampling.
 * Samples WITH replacement (pool index picked by PRNG — same entry may appear multiple times).
 * Deterministic: same seed + same params -> identical result.
 *
 * @param data   Full SdnEntry dataset (e.g., from data/sdn.json)
 * @param params RunParams specifying counts per entity type and allowed regions
 * @param seed   PRNG seed — defaults to 42 for production; tests pass explicit seed
 * @returns      Flat array of sampled entries in entity-type order
 */
export function sampleEntries(
  data: SdnEntry[],
  params: RunParams,
  seed = 42,
): SdnEntry[] {
  const rand = mulberry32(seed);
  const result: SdnEntry[] = [];
  const entityTypes = ['individual', 'business', 'vessel', 'aircraft'] as const;
  for (const entityType of entityTypes) {
    const count = params.entityCounts[entityType];
    if (count === 0) continue;
    const pool = data.filter(
      (e) => e.entityType === entityType && params.regions.includes(e.region),
    );
    if (pool.length === 0) continue;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rand() * pool.length);
      result.push(pool[idx]);
    }
  }
  return result;
}
