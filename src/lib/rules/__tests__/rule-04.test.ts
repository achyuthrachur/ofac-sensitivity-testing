import { describe, it, expect } from 'vitest';
import { wordReorder } from '../word-reorder';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('wordReorder (RULE-04)', () => {
  it('left-rotates 3-token CJK name by 1', () => {
    expect(wordReorder(makeEntry('KIM JONG UN', 'cjk'))).toBe('JONG UN KIM');
  });

  it('left-rotates 2-token CJK name by 1', () => {
    expect(wordReorder(makeEntry('ZHANG WEI', 'cjk'))).toBe('WEI ZHANG');
  });

  it('left-rotates 4-token Arabic name by 1', () => {
    expect(wordReorder(makeEntry('HASSAN IBN ALI AL-RASHIDI'))).toBe('IBN ALI AL-RASHIDI HASSAN');
  });

  it('returns null for single-token Arabic name', () => {
    expect(wordReorder(makeEntry('FAJR'))).toBeNull();
  });

  it('returns null for single-token aircraft tail number (Latin)', () => {
    expect(wordReorder(makeEntry('EP-TQA', 'latin', 'aircraft'))).toBeNull();
  });
});
