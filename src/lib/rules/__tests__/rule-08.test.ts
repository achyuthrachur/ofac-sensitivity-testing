import { describe, it, expect } from 'vitest';
import { punctuation } from '../punctuation';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('punctuation (RULE-08)', () => {
  it('removes hyphen from AL-RASHIDI', () => {
    expect(punctuation(makeEntry('AL-RASHIDI'))).toBe('ALRASHIDI');
  });

  it('removes hyphen from multi-token business name AL-NOOR TRADING LLC', () => {
    expect(punctuation(makeEntry('AL-NOOR TRADING LLC', 'arabic', 'business'))).toBe(
      'ALNOOR TRADING LLC',
    );
  });

  it('returns null for Arabic name with no punctuation', () => {
    expect(punctuation(makeEntry('HASSAN IBN ALI'))).toBeNull();
  });

  it('returns null for Latin name with no punctuation', () => {
    expect(punctuation(makeEntry('CARLOS RODRIGUEZ', 'latin'))).toBeNull();
  });

  it('removes hyphen from AL-QAEDA ORGANIZATION', () => {
    expect(punctuation(makeEntry('AL-QAEDA ORGANIZATION', 'arabic', 'business'))).toBe(
      'ALQAEDA ORGANIZATION',
    );
  });
});
