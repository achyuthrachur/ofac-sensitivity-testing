import { describe, it, expect } from 'vitest';
import { alias } from '../alias';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('alias (RULE-10)', () => {
  it('substitutes MOHAMMED with MOHAMAD (index 0 variant)', () => {
    expect(alias(makeEntry('MOHAMMED ALI'))).toBe('MOHAMAD ALI');
  });

  it('substitutes HUSSEIN with HOSSEIN (index 0 variant)', () => {
    expect(alias(makeEntry('HUSSEIN IBRAHIM'))).toBe('HOSSEIN IBRAHIM');
  });

  it('substitutes HASSAN with HASAN (only variant, index 0)', () => {
    expect(alias(makeEntry('HASSAN IBN ALI'))).toBe('HASAN IBN ALI');
  });

  it('returns null for Latin region (inapplicable)', () => {
    expect(alias(makeEntry('CARLOS RODRIGUEZ', 'latin'))).toBeNull();
  });

  it('returns null for CJK region (inapplicable)', () => {
    expect(alias(makeEntry('ZHANG WEI', 'cjk'))).toBeNull();
  });

  it('returns null for Arabic name with no alias match', () => {
    expect(alias(makeEntry('FAJR'))).toBeNull();
  });
});
