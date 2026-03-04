import { describe, it, expect } from 'vitest';
import { truncation } from '../truncation';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('truncation (RULE-06)', () => {
  it('drops the last token from a 4-token Arabic name', () => {
    expect(truncation(makeEntry('HASSAN IBN ALI AL-RASHIDI'))).toBe('HASSAN IBN ALI');
  });

  it('drops the last token from a 2-token CJK name', () => {
    expect(truncation(makeEntry('ZHANG WEI', 'cjk'))).toBe('ZHANG');
  });

  it('drops the last token from a 2-token Latin name', () => {
    expect(truncation(makeEntry('CARLOS RODRIGUEZ', 'latin'))).toBe('CARLOS');
  });

  it('returns null for a single-token Arabic name', () => {
    expect(truncation(makeEntry('FAJR'))).toBeNull();
  });

  it('returns null for a single-token aircraft name (latin, single-token)', () => {
    expect(truncation(makeEntry('EP-TQA', 'latin', 'aircraft'))).toBeNull();
  });
});
