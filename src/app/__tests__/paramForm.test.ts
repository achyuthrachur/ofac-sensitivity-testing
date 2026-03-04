// src/app/__tests__/paramForm.test.ts
// Unit tests for pure form state helper functions.
// TDD RED phase: these tests fail until src/lib/formUtils.ts is created.

import { describe, it, expect } from 'vitest';
import {
  parseEntityCount,
  toggleRegion,
  toggleRule,
  deriveSelectAllState,
  buildRunParams,
} from '@/lib/formUtils';
import { CANONICAL_RULE_ORDER } from '@/lib/rules';

// ─── parseEntityCount ──────────────────────────────────────────────────────────

describe('parseEntityCount', () => {
  it('returns 0 for empty string', () => {
    expect(parseEntityCount('')).toBe(0);
  });

  it('returns 0 for non-numeric string (NaN guard)', () => {
    expect(parseEntityCount('abc')).toBe(0);
  });

  it('returns the parsed integer for a valid string', () => {
    expect(parseEntityCount('10')).toBe(10);
  });

  it('returns MAX_ENTITY_COUNT (500) for exactly "500"', () => {
    expect(parseEntityCount('500')).toBe(500);
  });

  it('clamps to MAX_ENTITY_COUNT (500) for values above max', () => {
    expect(parseEntityCount('501')).toBe(500);
  });

  it('clamps to 0 for negative values', () => {
    expect(parseEntityCount('-5')).toBe(0);
  });

  it('returns 0 for "0"', () => {
    expect(parseEntityCount('0')).toBe(0);
  });

  it('returns integer value for float-like string (uses parseInt)', () => {
    expect(parseEntityCount('42.9')).toBe(42);
  });
});

// ─── toggleRegion ─────────────────────────────────────────────────────────────

describe('toggleRegion', () => {
  it('removes a region that is already present', () => {
    expect(toggleRegion(['arabic', 'cjk'], 'arabic')).toEqual(['cjk']);
  });

  it('adds a region that is not present', () => {
    expect(toggleRegion(['arabic'], 'cjk')).toEqual(['arabic', 'cjk']);
  });

  it('adds first region to empty array', () => {
    expect(toggleRegion([], 'arabic')).toEqual(['arabic']);
  });

  it('removes last region leaving empty array', () => {
    expect(toggleRegion(['arabic'], 'arabic')).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const input: import('@/types').Region[] = ['arabic', 'cjk'];
    const inputCopy = [...input];
    toggleRegion(input, 'arabic');
    expect(input).toEqual(inputCopy);
  });
});

// ─── toggleRule ───────────────────────────────────────────────────────────────

describe('toggleRule', () => {
  it('removes a rule ID that is already present', () => {
    expect(toggleRule(['space-removal'], 'space-removal')).toEqual([]);
  });

  it('adds a rule ID that is not present', () => {
    expect(toggleRule(['space-removal'], 'char-substitution')).toEqual([
      'space-removal',
      'char-substitution',
    ]);
  });

  it('adds first rule ID to empty array', () => {
    expect(toggleRule([], 'space-removal')).toEqual(['space-removal']);
  });

  it('does not mutate the input array', () => {
    const input = ['space-removal'];
    const inputCopy = [...input];
    toggleRule(input, 'space-removal');
    expect(input).toEqual(inputCopy);
  });
});

// ─── deriveSelectAllState ─────────────────────────────────────────────────────

describe('deriveSelectAllState', () => {
  it('returns false when no rules are selected (empty array)', () => {
    expect(deriveSelectAllState([])).toBe(false);
  });

  it('returns true when all 10 rules are selected', () => {
    expect(deriveSelectAllState([...CANONICAL_RULE_ORDER])).toBe(true);
  });

  it('returns "indeterminate" when 1 rule is selected', () => {
    expect(deriveSelectAllState(['space-removal'])).toBe('indeterminate');
  });

  it('returns "indeterminate" when 5 rules are selected', () => {
    expect(deriveSelectAllState(CANONICAL_RULE_ORDER.slice(0, 5))).toBe('indeterminate');
  });

  it('returns "indeterminate" when 9 rules are selected', () => {
    expect(deriveSelectAllState(CANONICAL_RULE_ORDER.slice(0, 9))).toBe('indeterminate');
  });
});

// ─── buildRunParams ───────────────────────────────────────────────────────────

describe('buildRunParams', () => {
  const entityCounts = { individual: 10, business: 5, vessel: 2, aircraft: 1 };
  const regions = ['arabic', 'latin'] as import('@/types').Region[];
  const ruleIds = ['space-removal', 'diacritic'];
  const clientName = 'Acme Corp';

  it('assembles a valid RunParams object from the four inputs', () => {
    const result = buildRunParams(entityCounts, regions, ruleIds, clientName);
    expect(result).toEqual({
      entityCounts,
      regions,
      ruleIds,
      clientName,
    });
  });

  it('passes clientName through unchanged (no trimming)', () => {
    const result = buildRunParams(entityCounts, regions, ruleIds, '  Acme  ');
    expect(result.clientName).toBe('  Acme  ');
  });

  it('returns an object with all four RunParams keys present', () => {
    const result = buildRunParams(entityCounts, regions, ruleIds, clientName);
    expect(result).toHaveProperty('entityCounts');
    expect(result).toHaveProperty('regions');
    expect(result).toHaveProperty('ruleIds');
    expect(result).toHaveProperty('clientName');
  });

  it('passes entity counts through exactly', () => {
    const result = buildRunParams(entityCounts, regions, ruleIds, clientName);
    expect(result.entityCounts).toEqual({ individual: 10, business: 5, vessel: 2, aircraft: 1 });
  });
});
