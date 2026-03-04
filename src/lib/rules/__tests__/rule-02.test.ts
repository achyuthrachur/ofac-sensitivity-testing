import { describe, it, expect } from 'vitest';
import { charSubstitution } from '../char-substitution';
import type { SdnEntry } from '@/types';

const makeEntry = (
  name: string,
  region: SdnEntry['region'] = 'arabic',
  entityType: SdnEntry['entityType'] = 'individual',
): SdnEntry => ({ id: 'test', name, entityType, region });

describe('charSubstitution (RULE-02)', () => {
  it('substitutes O->0 and A->@ in Arabic name', () => {
    // OSAMA: O->0, S->5, A->@, M stays, A->@
    expect(charSubstitution(makeEntry('OSAMA'))).toBe('05@M@');
  });

  it('substitutes B->8, I->1, L->1, A->@ in BILAL', () => {
    // BILAL: B->8, I->1, L->1, A->@, L->1
    expect(charSubstitution(makeEntry('BILAL'))).toBe('811@1');
  });

  it('substitutes A->@, E->3, I->1 in CJK name', () => {
    // ZHANG WEI: Z H A->@ N G->9  W E->3 I->1
    expect(charSubstitution(makeEntry('ZHANG WEI', 'cjk'))).toBe('ZH@N9 W31');
  });

  it('returns null when no characters are in the substitution map', () => {
    // HHH: H not in CHAR_MAP
    expect(charSubstitution(makeEntry('HHH', 'latin'))).toBeNull();
  });
});
