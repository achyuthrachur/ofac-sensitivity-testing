// src/lib/__tests__/runTest.integration.test.ts
// Integration test suite for the runTest server action.
// Covers: valid params, row shape, invalid params, null input, zero counts, benchmark.

import { describe, it, expect } from 'vitest';
import { runTest } from '@/app/actions/runTest';
import type { ActionResult } from '@/types';
import { CANONICAL_RULE_ORDER } from '@/lib/rules';

/** Reusable valid params fixture. */
const FIXTURE_PARAMS = {
  entityCounts: { individual: 10, business: 0, vessel: 0, aircraft: 0 },
  regions: ['arabic', 'latin'] as const,
  ruleIds: CANONICAL_RULE_ORDER as string[],
  clientName: 'Test Client',
};

describe('runTest integration', () => {
  it('valid RunParams returns { ok: true } with at least one row', async () => {
    const result: ActionResult = await runTest(FIXTURE_PARAMS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows.length).toBeGreaterThan(0);
    }
  });

  it('every row has a finite similarityScore in [0,1] and a boolean caught field', async () => {
    const result: ActionResult = await runTest(FIXTURE_PARAMS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      for (const row of result.rows) {
        expect(Number.isFinite(row.similarityScore)).toBe(true);
        expect(row.similarityScore).toBeGreaterThanOrEqual(0);
        expect(row.similarityScore).toBeLessThanOrEqual(1);
        expect(typeof row.caught).toBe('boolean');
      }
    }
  });

  it('invalid params (individual count above MAX_ENTITY_COUNT) returns { ok: false } with non-empty error string', async () => {
    const invalidParams = {
      ...FIXTURE_PARAMS,
      entityCounts: { individual: 9999, business: 0, vessel: 0, aircraft: 0 },
    };
    const result: ActionResult = await runTest(invalidParams);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('null input returns { ok: false } without throwing', async () => {
    const result: ActionResult = await runTest(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(typeof result.error).toBe('string');
    }
  });

  it('all-zero entity counts returns { ok: true } with zero rows', async () => {
    const zeroParams = {
      ...FIXTURE_PARAMS,
      entityCounts: { individual: 0, business: 0, vessel: 0, aircraft: 0 },
    };
    const result: ActionResult = await runTest(zeroParams);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows.length).toBe(0);
    }
  });

  it(
    'worst-case run (500 individuals, all 4 regions, all 10 rules) completes in under 5000ms',
    { timeout: 10_000 },
    async () => {
      const benchParams = {
        entityCounts: { individual: 500, business: 0, vessel: 0, aircraft: 0 },
        regions: ['arabic', 'cjk', 'cyrillic', 'latin'] as const,
        ruleIds: CANONICAL_RULE_ORDER as string[],
        clientName: 'Benchmark Client',
      };
      const start = Date.now();
      const result: ActionResult = await runTest(benchParams);
      const elapsed = Date.now() - start;
      expect(result.ok).toBe(true);
      expect(elapsed).toBeLessThan(5000);
    },
  );
});
