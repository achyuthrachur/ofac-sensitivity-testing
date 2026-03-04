// RULE-02: OCR/Leet Character Substitution
// Applicable regions: all
import type { SdnEntry } from '@/types';

const CHAR_MAP: ReadonlyMap<string, string> = new Map([
  ['O', '0'],
  ['I', '1'],
  ['L', '1'],
  ['E', '3'],
  ['A', '@'],
  ['S', '5'],
  ['B', '8'],
  ['G', '9'],
  ['T', '7'],
]);

/**
 * RULE-02: Replace characters with OCR/leet equivalents (O->0, I->1, A->@, etc.).
 * Applicable to all linguistic regions.
 * Returns null if no characters in the name are in the substitution map.
 */
export function charSubstitution(entry: SdnEntry): string | null {
  let changed = false;
  const result = [...entry.name]
    .map((ch) => {
      const sub = CHAR_MAP.get(ch);
      if (sub !== undefined) {
        changed = true;
        return sub;
      }
      return ch;
    })
    .join('');
  return changed ? result : null;
}
