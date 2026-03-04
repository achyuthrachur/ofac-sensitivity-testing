import { describe, it, expect } from 'vitest';
import { diacritic } from '../diacritic';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'latin',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('diacritic (RULE-03)', () => {
  it('removes umlauts from Latin name (synthetic fixture)', () => {
    expect(diacritic(makeEntry('MÜLLER'))).toBe('MULLER');
  });

  it('removes acute accent from Latin name (synthetic fixture)', () => {
    expect(diacritic(makeEntry('JOSÉ FERNANDEZ'))).toBe('JOSE FERNANDEZ');
  });

  it('returns null for CJK region (inapplicable)', () => {
    expect(diacritic(makeEntry('ZHANG WEI', 'cjk'))).toBeNull();
  });

  it('returns null for Arabic region (inapplicable)', () => {
    expect(diacritic(makeEntry('HASSAN IBN ALI', 'arabic'))).toBeNull();
  });

  it('returns null when Latin name has no diacritics (result equals input)', () => {
    expect(diacritic(makeEntry('HASSAN'))).toBeNull();
  });
});
