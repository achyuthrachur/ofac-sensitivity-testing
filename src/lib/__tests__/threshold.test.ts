import { describe, it, expect } from 'vitest';
import { assignTierDynamic, OFAC_BENCHMARK_THRESHOLD } from '@/lib/screening/tierUtils';

describe('assignTierDynamic', () => {
  it('returns EXACT when score >= mediumFloor + 0.17', () => {
    expect(assignTierDynamic(0.97, 0.80)).toBe('EXACT');
  });

  it('returns HIGH when score >= mediumFloor + 0.10', () => {
    expect(assignTierDynamic(0.90, 0.80)).toBe('HIGH');
  });

  it('returns MEDIUM when score equals mediumFloor exactly', () => {
    expect(assignTierDynamic(0.80, 0.80)).toBe('MEDIUM');
  });

  it('returns LOW when score >= mediumFloor - 0.10', () => {
    expect(assignTierDynamic(0.70, 0.80)).toBe('LOW');
  });

  it('returns CLEAR when score < mediumFloor - 0.10', () => {
    expect(assignTierDynamic(0.69, 0.80)).toBe('CLEAR');
  });

  it('returns HIGH when slider raised so 0.97 < mediumFloor + 0.17', () => {
    // mediumFloor = 0.90, so EXACT threshold = 0.90 + 0.17 = 1.07; 0.97 < 1.07 → HIGH
    expect(assignTierDynamic(0.97, 0.90)).toBe('HIGH');
  });

  it('returns MEDIUM when score equals a raised mediumFloor exactly', () => {
    expect(assignTierDynamic(0.50, 0.50)).toBe('MEDIUM');
  });

  it('returns LOW when score is just below a raised mediumFloor', () => {
    expect(assignTierDynamic(0.49, 0.50)).toBe('LOW');
  });
});

describe('isLocked logic — OFAC_BENCHMARK_THRESHOLD', () => {
  it('OFAC_BENCHMARK_THRESHOLD is 0.85 (the lock target for isLocked state)', () => {
    expect(OFAC_BENCHMARK_THRESHOLD).toBe(0.85);
  });

  it('when isLocked is true, effective threshold equals OFAC_BENCHMARK_THRESHOLD (0.85)', () => {
    const isLocked = true;
    const effectiveThreshold = isLocked ? OFAC_BENCHMARK_THRESHOLD : 0.80;
    expect(effectiveThreshold).toBe(0.85);
  });
});
