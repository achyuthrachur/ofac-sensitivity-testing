import { describe, it, expect } from 'vitest';
import { phonetic } from '../phonetic';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('phonetic (RULE-07)', () => {
  it('replaces OSAMA with USAMAH (index 0 variant) in Arabic name', () => {
    expect(phonetic(makeEntry('OSAMA IBN LADEN'))).toBe('USAMAH IBN LADEN');
  });

  it('replaces HASSAN with HASAN in 2-token Arabic name', () => {
    expect(phonetic(makeEntry('HASSAN ALI'))).toBe('HASAN ALI');
  });

  it('replaces ALEKSANDR with ALEKSANDER (index 0 variant) in Cyrillic name', () => {
    expect(phonetic(makeEntry('ALEKSANDR PETROV', 'cyrillic'))).toBe('ALEKSANDER PETROV');
  });

  it('returns null for Latin region (inapplicable)', () => {
    expect(phonetic(makeEntry('CARLOS RODRIGUEZ', 'latin'))).toBeNull();
  });

  it('returns null for CJK region (inapplicable)', () => {
    expect(phonetic(makeEntry('ZHANG WEI', 'cjk'))).toBeNull();
  });

  it('returns null for Arabic name with no phonetic match', () => {
    expect(phonetic(makeEntry('FAJR'))).toBeNull();
  });

  it('strips AL- prefix before lookup and reconstitutes: AL-HASSAN -> AL-HASAN', () => {
    expect(phonetic(makeEntry('AL-HASSAN IBN SAID'))).toBe('AL-HASAN IBN SAID');
  });
});
