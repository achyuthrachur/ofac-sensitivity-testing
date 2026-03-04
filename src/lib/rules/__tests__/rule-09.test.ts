import { describe, it, expect } from 'vitest';
import { prefixSuffix } from '../prefix-suffix';
import type { SdnEntry } from '@/types';

// NOTE: sdn.json has ZERO honorific prefixes — ALL tests use SYNTHETIC fixture strings.
// These entries do not correspond to real sdn.json entries.
const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('prefixSuffix (RULE-09)', () => {
  it('strips DR prefix from Latin name', () => {
    expect(prefixSuffix(makeEntry('DR CARLOS RODRIGUEZ', 'latin'))).toBe('CARLOS RODRIGUEZ');
  });

  it('strips MR prefix from Arabic name', () => {
    expect(prefixSuffix(makeEntry('MR HASSAN ALI'))).toBe('HASSAN ALI');
  });

  it('strips SHEIKH prefix from Arabic name', () => {
    expect(prefixSuffix(makeEntry('SHEIKH IBRAHIM AL-RASHIDI'))).toBe('IBRAHIM AL-RASHIDI');
  });

  it('strips JR suffix from Latin name', () => {
    expect(prefixSuffix(makeEntry('CARLOS RODRIGUEZ JR', 'latin'))).toBe('CARLOS RODRIGUEZ');
  });

  it('strips both IMAM prefix and MD suffix: IMAM YUSUF MD -> YUSUF', () => {
    // Implementation strips prefix first, then checks suffix of remaining tokens
    expect(prefixSuffix(makeEntry('IMAM YUSUF MD'))).toBe('YUSUF');
  });

  it('returns null when no recognized prefix or suffix present', () => {
    expect(prefixSuffix(makeEntry('HASSAN IBN ALI'))).toBeNull();
  });
});
