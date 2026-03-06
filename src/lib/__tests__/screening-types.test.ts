import { describe, it, expect } from 'vitest';
import {
  RISK_TIER_VALUES,
  TIER_THRESHOLDS,
  MAX_SCREENING_NAMES,
  COST_OF_MISS_MULTIPLIER,
} from '@/types/screening';

describe('RISK_TIER_VALUES', () => {
  it('contains all five tier keys', () => {
    expect(Object.keys(RISK_TIER_VALUES)).toEqual(
      expect.arrayContaining(['EXACT', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'])
    );
  });
  it('values match keys', () => {
    expect(RISK_TIER_VALUES.EXACT).toBe('EXACT');
    expect(RISK_TIER_VALUES.HIGH).toBe('HIGH');
    expect(RISK_TIER_VALUES.MEDIUM).toBe('MEDIUM');
    expect(RISK_TIER_VALUES.LOW).toBe('LOW');
    expect(RISK_TIER_VALUES.CLEAR).toBe('CLEAR');
  });
});

describe('TIER_THRESHOLDS', () => {
  it('EXACT threshold is 0.97', () => expect(TIER_THRESHOLDS.EXACT).toBe(0.97));
  it('HIGH threshold is 0.90', () => expect(TIER_THRESHOLDS.HIGH).toBe(0.90));
  it('MEDIUM threshold is 0.80', () => expect(TIER_THRESHOLDS.MEDIUM).toBe(0.80));
  it('LOW threshold is 0.70', () => expect(TIER_THRESHOLDS.LOW).toBe(0.70));
});

describe('MAX_SCREENING_NAMES', () => {
  it('is 10000', () => expect(MAX_SCREENING_NAMES).toBe(10_000));
});

describe('COST_OF_MISS_MULTIPLIER', () => {
  it('is 4.0', () => expect(COST_OF_MISS_MULTIPLIER).toBe(4.0));
});
