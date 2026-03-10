import { describe, it, expect } from 'vitest';
import {
  RISK_TIER_VALUES,
  TIER_THRESHOLDS,
  MAX_SCREENING_NAMES,
  COST_OF_MISS_MULTIPLIER,
  RECOMMENDED_ACTIONS,
  TIER_COLORS,
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

describe('RECOMMENDED_ACTIONS', () => {
  it('has exactly 5 keys', () => {
    expect(Object.keys(RECOMMENDED_ACTIONS).length).toBe(5);
  });

  it('EXACT action is "Block transaction and file SAR."', () => {
    expect(RECOMMENDED_ACTIONS['EXACT']).toBe('Block transaction and file SAR.');
  });

  it('HIGH action is "Escalate for manual review before clearing."', () => {
    expect(RECOMMENDED_ACTIONS['HIGH']).toBe('Escalate for manual review before clearing.');
  });

  it('MEDIUM action is "Flag for enhanced due diligence."', () => {
    expect(RECOMMENDED_ACTIONS['MEDIUM']).toBe('Flag for enhanced due diligence.');
  });

  it('LOW action is "Log and monitor — no immediate action required."', () => {
    expect(RECOMMENDED_ACTIONS['LOW']).toBe('Log and monitor — no immediate action required.');
  });

  it('CLEAR action is "No match — clear to proceed."', () => {
    expect(RECOMMENDED_ACTIONS['CLEAR']).toBe('No match — clear to proceed.');
  });
});

describe('TIER_COLORS', () => {
  it('has exactly 5 keys', () => {
    expect(Object.keys(TIER_COLORS).length).toBe(5);
  });

  it('EXACT color is #DC2626', () => {
    expect(TIER_COLORS['EXACT']).toBe('#DC2626');
  });

  it('HIGH color is #EA580C', () => {
    expect(TIER_COLORS['HIGH']).toBe('#EA580C');
  });

  it('MEDIUM color is #F5A800', () => {
    expect(TIER_COLORS['MEDIUM']).toBe('#F5A800');
  });

  it('LOW color is #0075C9', () => {
    expect(TIER_COLORS['LOW']).toBe('#0075C9');
  });

  it('CLEAR color is #05AB8C', () => {
    expect(TIER_COLORS['CLEAR']).toBe('#05AB8C');
  });
});
