// src/lib/__tests__/scorer.test.ts
// Wave 0 test scaffold for Phase 16 scoring engine.
// All tests import from '@/lib/screening/scorer' — this module does NOT exist
// until Plan 02. All tests will fail with module-not-found until then. That is
// the expected RED state required by VALIDATION.md.
//
// Requirements covered:
//   SCREEN-06 — composite scoring (JW + DM + TSR)
//   SCREEN-07 — tier assignment thresholds
//   SCREEN-08 — name-length penalty and escalateTier
//   SCREEN-09 — normalize (Unicode / diacritic stripping)

import { describe, it, expect } from 'vitest';
import type { SdnEntry } from '@/types';
import {
  normalize,
  tokenSortRatio,
  dmBonus,
  assignTier,
  escalateTier,
  scorePair,
  isShortName,
  screenNames,
} from '@/lib/screening/scorer';

// ─── Minimal mock SDN dataset for integration tests ───────────────────────────

const mockSdn: SdnEntry[] = [
  { id: 'test-001', name: 'ROBERT', entityType: 'individual', region: 'latin' },
  { id: 'test-002', name: 'HASSAN IBN ALI', entityType: 'individual', region: 'arabic' },
  { id: 'test-003', name: 'ALI', entityType: 'individual', region: 'arabic' },
];

// ─── normalize (SCREEN-09) ─────────────────────────────────────────────────────

describe('normalize', () => {
  it('strips diacritics via NFKD — café → CAFE', () => {
    expect(normalize('café')).toBe('CAFE');
  });

  it('trims whitespace and uppercases — "  hello  " → "HELLO"', () => {
    expect(normalize('  hello  ')).toBe('HELLO');
  });

  it('uppercase no-op — HASSAN IBN ALI stays unchanged', () => {
    expect(normalize('HASSAN IBN ALI')).toBe('HASSAN IBN ALI');
  });

  it('Cyrillic homoglyph "Рobert" does not normalize to "ROBERT" — documents known limitation', () => {
    // The Cyrillic Р (U+0420) is not stripped by NFKD diacritic removal;
    // this test documents the known fact that normalize alone cannot fix homoglyphs.
    expect(normalize('Рobert')).not.toBe('ROBERT');
  });
});

// ─── dmBonus (SCREEN-06) ───────────────────────────────────────────────────────

describe('dmBonus', () => {
  it('returns 1.0 for identical inputs — ROBERT vs ROBERT', () => {
    expect(dmBonus('ROBERT', 'ROBERT')).toBe(1.0);
  });

  it('returns 0.0 for phonetically different inputs — SMITH vs JONES', () => {
    expect(dmBonus('SMITH', 'JONES')).toBe(0.0);
  });

  it('returns 0.0 for empty inputs — CJK guard: both produce empty DM codes', () => {
    // Both empty strings produce empty DM code arrays; matching two empties
    // must return 0.0 to avoid spurious false-positive (the CJK/Arabic guard).
    expect(dmBonus('', '')).toBe(0.0);
  });

  it('returns 0.0 for CJK-like placeholder strings that produce empty DM codes', () => {
    // Strings that consist entirely of characters that Double Metaphone cannot
    // encode produce empty code arrays; matching two such strings must return
    // 0.0 (not 1.0) to prevent false positives.
    // Using minimal placeholder strings — actual CJK handled by region guard.
    const cjkLike1 = '东方';
    const cjkLike2 = '西方';
    expect(dmBonus(cjkLike1, cjkLike2)).toBe(0.0);
  });
});

// ─── tokenSortRatio (SCREEN-06) ───────────────────────────────────────────────

describe('tokenSortRatio', () => {
  it('word-reorder scores near-perfect — ALI IBN OMAR vs IBN OMAR ALI', () => {
    expect(tokenSortRatio('ALI IBN OMAR', 'IBN OMAR ALI')).toBeGreaterThan(0.99);
  });

  it('returns 1.0 for identical strings — ROBERT vs ROBERT', () => {
    expect(tokenSortRatio('ROBERT', 'ROBERT')).toBe(1.0);
  });

  it('returns < 0.8 for unrelated names — SMITH vs JONES', () => {
    expect(tokenSortRatio('SMITH', 'JONES')).toBeLessThan(0.8);
  });
});

// ─── assignTier (SCREEN-07) ───────────────────────────────────────────────────

describe('assignTier', () => {
  it('assigns EXACT at boundary (0.97)', () => {
    expect(assignTier(0.97)).toBe('EXACT');
  });

  it('assigns EXACT above boundary (0.98)', () => {
    expect(assignTier(0.98)).toBe('EXACT');
  });

  it('assigns HIGH at boundary (0.90)', () => {
    expect(assignTier(0.90)).toBe('HIGH');
  });

  it('assigns MEDIUM at boundary (0.80)', () => {
    expect(assignTier(0.80)).toBe('MEDIUM');
  });

  it('assigns LOW at boundary (0.70)', () => {
    expect(assignTier(0.70)).toBe('LOW');
  });

  it('assigns CLEAR below LOW boundary (0.69)', () => {
    expect(assignTier(0.69)).toBe('CLEAR');
  });
});

// ─── escalateTier (SCREEN-08) ─────────────────────────────────────────────────

describe('escalateTier', () => {
  it('escalates CLEAR → LOW', () => {
    expect(escalateTier('CLEAR')).toBe('LOW');
  });

  it('escalates LOW → MEDIUM', () => {
    expect(escalateTier('LOW')).toBe('MEDIUM');
  });

  it('escalates MEDIUM → HIGH', () => {
    expect(escalateTier('MEDIUM')).toBe('HIGH');
  });

  it('escalates HIGH → EXACT', () => {
    expect(escalateTier('HIGH')).toBe('EXACT');
  });

  it('caps at EXACT — does not wrap past EXACT', () => {
    expect(escalateTier('EXACT')).toBe('EXACT');
  });
});

// ─── isShortName (SCREEN-08) ──────────────────────────────────────────────────

describe('isShortName', () => {
  it('returns true for ALI — 3 non-space chars', () => {
    expect(isShortName('ALI')).toBe(true);
  });

  it('returns true for HASSAN — 6 non-space chars (boundary inclusive)', () => {
    expect(isShortName('HASSAN')).toBe(true);
  });

  it('returns false for HASSANI — 7 non-space chars', () => {
    expect(isShortName('HASSANI')).toBe(false);
  });

  it('returns true for AL AZIZ — "ALAZIZ" = 6 non-space chars (boundary)', () => {
    // 'AL AZIZ' → remove spaces → 'ALAZIZ' = 6 chars → true
    expect(isShortName('AL AZIZ')).toBe(true);
  });
});

// ─── scorePair — composite formula (SCREEN-06) ────────────────────────────────

describe('scorePair', () => {
  it('composite = jw*0.6 + dm*0.25 + tsr*0.15 for identical inputs ROBERT', () => {
    const result = scorePair('ROBERT', 'ROBERT');
    const expected = result.jw * 0.6 + result.dm * 0.25 + result.tsr * 0.15;
    expect(result.composite).toBeCloseTo(expected, 10);
  });

  it('returns all four score fields', () => {
    const result = scorePair('ROBERT', 'ROBERT');
    expect(result).toHaveProperty('jw');
    expect(result).toHaveProperty('dm');
    expect(result).toHaveProperty('tsr');
    expect(result).toHaveProperty('composite');
  });
});

// ─── name-length penalty integration via screenNames (SCREEN-08) ──────────────

describe('screenNames — name-length penalty', () => {
  it('sets nameLengthPenaltyApplied=true and effectiveTier != riskTier for short name ALI', () => {
    // 'ALI' is a short name (3 chars) — penalty must be applied.
    // effectiveTier should be escalated vs riskTier (unless riskTier is already EXACT).
    const mockShortSdn: SdnEntry[] = [
      { id: 'test-003', name: 'ALI', entityType: 'individual', region: 'arabic' },
    ];
    const results = screenNames(['ALI'], mockShortSdn);
    expect(results[0].nameLengthPenaltyApplied).toBe(true);
    if (results[0].riskTier !== 'EXACT') {
      expect(results[0].effectiveTier).not.toBe(results[0].riskTier);
    }
  });
});

// ─── Cyrillic homoglyph via screenNames (SCREEN-09) ───────────────────────────

describe('screenNames — Cyrillic homoglyph', () => {
  it('Рobert (Cyrillic Р) scores EXACT against ROBERT SDN entry via JW', () => {
    // The Cyrillic Р visually resembles R; JW compares byte strings, so
    // near-identical byte sequences still score ≥ 0.97 even without NFKD fix.
    const results = screenNames(['Рobert'], mockSdn);
    expect(results[0].riskTier).toBe('EXACT');
  });
});

// ─── screenNames — integration completeness ───────────────────────────────────

describe('screenNames — integration', () => {
  it('returns exactly one MatchResult per input name', () => {
    const inputNames = ['ROBERT', 'HASSAN IBN ALI'];
    const results = screenNames(inputNames, mockSdn);
    expect(results).toHaveLength(2);
  });

  it('each MatchResult has all required fields', () => {
    const results = screenNames(['ROBERT'], mockSdn);
    const r = results[0];
    expect(r).toHaveProperty('rawInput');
    expect(r).toHaveProperty('normalizedInput');
    expect(r).toHaveProperty('inputName');
    expect(r).toHaveProperty('matchedSdnName');
    expect(r).toHaveProperty('sdnId');
    expect(r).toHaveProperty('entityType');
    expect(r).toHaveProperty('region');
    expect(r).toHaveProperty('jwScore');
    expect(r).toHaveProperty('dmBonus');
    expect(r).toHaveProperty('tsrScore');
    expect(r).toHaveProperty('compositeScore');
    expect(r).toHaveProperty('matchAlgorithm');
    expect(r).toHaveProperty('riskTier');
    expect(r).toHaveProperty('nameLengthPenaltyApplied');
    expect(r).toHaveProperty('effectiveTier');
    expect(r).toHaveProperty('transformationDetected');
  });
});
