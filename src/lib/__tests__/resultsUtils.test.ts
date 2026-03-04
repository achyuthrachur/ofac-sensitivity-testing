// src/lib/__tests__/resultsUtils.test.ts
// Unit tests for all pure helpers in resultsUtils.ts
// triggerCsvDownload — browser-only, not testable in node env

import { describe, expect, it } from 'vitest';
import {
  buildCsvFilename,
  buildCsvString,
  computeCatchRate,
  escapeCsvField,
  sanitizeClientName,
} from '@/lib/resultsUtils';
import type { ResultRow } from '@/types';

// ---------------------------------------------------------------------------
// Test helper — provides safe defaults so tests only set the field they care about
// ---------------------------------------------------------------------------
function makeRow(overrides: Partial<ResultRow> = {}): ResultRow {
  return {
    id: 'row-1',
    originalName: 'Test Name',
    entityType: 'individual',
    region: 'latin',
    degradedVariant: 'Test Nme',
    ruleId: 'RULE-01',
    ruleLabel: 'Space Removal',
    similarityScore: 0.9,
    caught: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. escapeCsvField
// ---------------------------------------------------------------------------
describe('escapeCsvField', () => {
  it('returns plain string unchanged when no special characters', () => {
    expect(escapeCsvField('Hello World')).toBe('Hello World');
  });

  it('wraps field in double-quotes when it contains a comma', () => {
    expect(escapeCsvField('Smith, John')).toBe('"Smith, John"');
  });

  it('wraps field in double-quotes and doubles embedded double-quotes per RFC 4180', () => {
    expect(escapeCsvField('ab"cd')).toBe('"ab""cd"');
  });

  it('wraps field in double-quotes when it contains a newline', () => {
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });

  it('converts a number to its string representation without wrapping', () => {
    expect(escapeCsvField(42)).toBe('42');
  });
});

// ---------------------------------------------------------------------------
// 2. buildCsvString
// ---------------------------------------------------------------------------
describe('buildCsvString', () => {
  it('returns just the header row when given an empty array', () => {
    const result = buildCsvString([]);
    expect(result).toBe(
      'Original Name,Entity Type,Linguistic Region,Degraded Variant,Rule Applied,Similarity Score'
    );
  });

  it('produces header + 1 data row separated by newline for a single ResultRow', () => {
    const row = makeRow({
      originalName: 'Ahmad Al-Rashid',
      entityType: 'individual',
      region: 'arabic',
      degradedVariant: 'Ahmad AlRashid',
      ruleLabel: 'Space Removal',
      similarityScore: 0.95,
    });
    const result = buildCsvString([row]);
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      'Original Name,Entity Type,Linguistic Region,Degraded Variant,Rule Applied,Similarity Score'
    );
    expect(lines[1]).toContain('Ahmad Al-Rashid');
  });

  it('writes the similarity score as an integer (no decimal point)', () => {
    const row = makeRow({ similarityScore: 0.9342 });
    const result = buildCsvString([row]);
    const dataLine = result.split('\n')[1];
    // Math.round(0.9342 * 100) = 93
    expect(dataLine).toContain('93');
    expect(dataLine).not.toMatch(/0\.93/);
  });

  it('uses the correct column order', () => {
    const result = buildCsvString([]);
    expect(result).toBe(
      'Original Name,Entity Type,Linguistic Region,Degraded Variant,Rule Applied,Similarity Score'
    );
  });

  it('wraps field in double-quotes when it contains a comma', () => {
    const row = makeRow({ ruleLabel: 'Swap, Transpose' });
    const result = buildCsvString([row]);
    expect(result).toContain('"Swap, Transpose"');
  });
});

// ---------------------------------------------------------------------------
// 3. sanitizeClientName
// ---------------------------------------------------------------------------
describe('sanitizeClientName', () => {
  it('converts spaces to hyphens', () => {
    expect(sanitizeClientName('Acme Financial Corp')).toBe('Acme-Financial-Corp');
  });

  it('trims leading and trailing whitespace before converting', () => {
    expect(sanitizeClientName('  Crowe LLP  ')).toBe('Crowe-LLP');
  });

  it('strips non-alphanumeric characters (except hyphens)', () => {
    expect(sanitizeClientName('Client & Partners, Inc.')).toBe('Client-Partners-Inc');
  });

  it('falls back to "client" when given an empty string', () => {
    expect(sanitizeClientName('')).toBe('client');
  });

  it('falls back to "client" when result contains only hyphens after stripping', () => {
    expect(sanitizeClientName('---')).toBe('client');
  });

  it('collapses consecutive spaces into a single hyphen', () => {
    expect(sanitizeClientName('Foo  Bar')).toBe('Foo-Bar');
  });
});

// ---------------------------------------------------------------------------
// 4. buildCsvFilename
// ---------------------------------------------------------------------------
describe('buildCsvFilename', () => {
  it('starts with the ofac-sensitivity- prefix', () => {
    expect(buildCsvFilename('Acme Corp')).toMatch(/^ofac-sensitivity-/);
  });

  it('contains the sanitized client name in the middle', () => {
    expect(buildCsvFilename('Acme Corp')).toContain('Acme-Corp');
  });

  it('ends with .csv', () => {
    expect(buildCsvFilename('Acme Corp')).toMatch(/\.csv$/);
  });

  it('contains a date segment in YYYY-MM-DD format', () => {
    expect(buildCsvFilename('Acme Corp')).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

// ---------------------------------------------------------------------------
// 5. computeCatchRate
// ---------------------------------------------------------------------------
describe('computeCatchRate', () => {
  it('returns zeros for an empty array', () => {
    expect(computeCatchRate([])).toEqual({ caught: 0, total: 0, percent: 0 });
  });

  it('returns 100% when all rows are caught', () => {
    const rows = [makeRow({ caught: true }), makeRow({ caught: true }), makeRow({ caught: true })];
    expect(computeCatchRate(rows)).toEqual({ caught: 3, total: 3, percent: 100 });
  });

  it('returns 50% when 2 of 4 rows are caught', () => {
    const rows = [
      makeRow({ caught: true }),
      makeRow({ caught: true }),
      makeRow({ caught: false }),
      makeRow({ caught: false }),
    ];
    expect(computeCatchRate(rows)).toEqual({ caught: 2, total: 4, percent: 50 });
  });

  it('rounds percent to nearest integer (1 of 3 = 33%)', () => {
    const rows = [
      makeRow({ caught: true }),
      makeRow({ caught: false }),
      makeRow({ caught: false }),
    ];
    expect(computeCatchRate(rows)).toEqual({ caught: 1, total: 3, percent: 33 });
  });

  it('uses row.caught boolean directly and does not recompute from similarityScore', () => {
    // row.caught=true but score below threshold — should still count as caught
    const rows = [makeRow({ caught: true, similarityScore: 0.5 })];
    expect(computeCatchRate(rows)).toEqual({ caught: 1, total: 1, percent: 100 });
  });
});
