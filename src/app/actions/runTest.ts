'use server';
// src/app/actions/runTest.ts
// Next.js Server Action: orchestrates sample + rules + Jaro-Winkler scoring.
// Returns a typed ActionResult discriminated union — never throws.

import { z } from 'zod';
import sdnData from '@data/sdn.json';
import type { SdnEntry, RunParams, ResultRow, ActionResult } from '@/types';
import { REGION_VALUES } from '@/types';
import { sampleEntries } from '@/lib/sampler';
import { ruleMap, CANONICAL_RULE_ORDER, RULE_LABELS } from '@/lib/rules';
import { DEFAULT_CATCH_THRESHOLD, MAX_ENTITY_COUNT } from '@/lib/constants';
import jaroWinkler from 'talisman/metrics/jaro-winkler';

/** Zod schema mirroring the RunParams interface — defines the validation boundary. */
const RunParamsSchema = z.object({
  entityCounts: z.object({
    individual: z.number().int().min(0).max(MAX_ENTITY_COUNT),
    business: z.number().int().min(0).max(MAX_ENTITY_COUNT),
    vessel: z.number().int().min(0).max(MAX_ENTITY_COUNT),
    aircraft: z.number().int().min(0).max(MAX_ENTITY_COUNT),
  }),
  regions: z
    .array(
      z.enum([
        REGION_VALUES.arabic,
        REGION_VALUES.cjk,
        REGION_VALUES.cyrillic,
        REGION_VALUES.latin,
      ]),
    )
    .min(1),
  ruleIds: z.array(z.string()).min(1),
  clientName: z.string().trim().min(1).max(100),
});

/**
 * Run an OFAC sensitivity test.
 *
 * @param params - Unknown input — validated via Zod before processing.
 * @returns      ActionResult: { ok: true; rows: ResultRow[] } on success,
 *               or { ok: false; error: string } on validation failure.
 *               Never throws — all errors are captured in the return value.
 */
export async function runTest(params: unknown): Promise<ActionResult> {
  // 1. Validate input
  const parsed = RunParamsSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, error: z.prettifyError(parsed.error) };
  }
  const validParams = parsed.data as RunParams;

  // 2. Sample entries from the synthetic dataset
  const sampled = sampleEntries(sdnData as SdnEntry[], validParams);
  if (sampled.length === 0) {
    return { ok: true, rows: [] };
  }

  // 3. Apply each requested rule in canonical order and score pairs
  const rows: ResultRow[] = [];
  for (const entry of sampled) {
    for (const ruleId of CANONICAL_RULE_ORDER) {
      if (!validParams.ruleIds.includes(ruleId)) continue;
      const degraded = ruleMap[ruleId](entry);
      if (degraded === null) continue;
      const a = entry.name.toUpperCase();
      const b = degraded.toUpperCase();
      const raw = jaroWinkler(a, b);
      // Guard against NaN — CJK empty-string edge case (see RESEARCH.md Pitfall 5)
      const similarityScore = Number.isFinite(raw) ? raw : 0;
      rows.push({
        id: `${entry.id}-${ruleId}`,
        originalName: entry.name,
        entityType: entry.entityType,
        region: entry.region,
        degradedVariant: degraded,
        ruleId,
        ruleLabel: RULE_LABELS[ruleId],
        similarityScore,
        caught: similarityScore > DEFAULT_CATCH_THRESHOLD,
      });
    }
  }

  return { ok: true, rows };
}
