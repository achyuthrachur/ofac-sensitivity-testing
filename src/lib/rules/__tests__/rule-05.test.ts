import { describe, it, expect } from 'vitest';
import { abbreviation } from '../abbreviation';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('abbreviation (RULE-05)', () => {
  it('drops vowels from Arabic name preserving IBN connector and AL- prefix', () => {
    // HASSAN -> HSSN, IBN -> IBN (connector), ALI -> L, AL-RASHIDI -> AL-RSHD
    expect(abbreviation(makeEntry('HASSAN IBN ALI AL-RASHIDI'))).toBe('HSSN IBN L AL-RSHD');
  });

  it('drops vowels from Latin name', () => {
    // CARLOS -> CRLS, RODRIGUEZ -> RDRGZ
    expect(abbreviation(makeEntry('CARLOS RODRIGUEZ', 'latin'))).toBe('CRLS RDRGZ');
  });

  it('drops vowels from Cyrillic region name (transliterated)', () => {
    // IGOR -> GR, VLADIMIROVICH -> VLDMRVCH, PETROV -> PTRV
    expect(abbreviation(makeEntry('IGOR VLADIMIROVICH PETROV', 'cyrillic'))).toBe(
      'GR VLDMRVCH PTRV',
    );
  });

  it('returns null for CJK region (inapplicable)', () => {
    expect(abbreviation(makeEntry('ZHANG WEI', 'cjk'))).toBeNull();
  });

  it('returns null when output equals input (all-connector name)', () => {
    // IBN and BINT are both connectors — they are preserved verbatim, so output = input
    expect(abbreviation(makeEntry('IBN BINT'))).toBeNull();
  });
});
