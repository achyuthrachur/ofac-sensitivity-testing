import { describe, it, expect } from 'vitest';
import { spaceRemoval } from '../space-removal';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('spaceRemoval (RULE-01)', () => {
  it('removes spaces from multi-token Arabic name', () => {
    expect(spaceRemoval(makeEntry('AL QAEDA'))).toBe('ALQAEDA');
  });

  it('removes spaces from CJK name', () => {
    expect(spaceRemoval(makeEntry('ZHANG WEI', 'cjk'))).toBe('ZHANGWEI');
  });

  it('removes spaces but preserves hyphens in AL- nisba form', () => {
    // HASSAN + IBN + ALI + AL-RASHIDI -> HASSANIBNALIAL-RASHIDI (hyphen preserved)
    expect(spaceRemoval(makeEntry('HASSAN IBN ALI AL-RASHIDI'))).toBe('HASSANIBNALIAL-RASHIDI');
  });

  it('returns null for single-token name (no spaces)', () => {
    expect(spaceRemoval(makeEntry('FAJR'))).toBeNull();
  });
});
