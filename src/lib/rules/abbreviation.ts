// RULE-05: Abbreviation (Vowel-Drop)
// Applicable regions: arabic, cyrillic, latin
import type { SdnEntry } from '@/types';

const APPLICABLE: ReadonlySet<string> = new Set(['arabic', 'cyrillic', 'latin']);

/** Tokens that must NOT have vowels stripped — Arabic genealogical connectors */
const CONNECTORS: ReadonlySet<string> = new Set(['IBN', 'BINT', 'BIN', 'BT', 'ABU', 'ABI', 'UMM']);

const VOWELS = /[AEIOU]/g;

function dropVowels(token: string): string {
  // AL-XXXX nisba form: preserve 'AL-', strip vowels only from the suffix
  if (token.startsWith('AL-')) {
    const suffix = token.slice(3).replace(VOWELS, '');
    // Don't produce 'AL-' with empty suffix
    return suffix.length > 0 ? `AL-${suffix}` : token;
  }
  // Genealogical connectors: preserve verbatim
  if (CONNECTORS.has(token)) return token;
  const stripped = token.replace(VOWELS, '');
  // Don't return empty string (single-vowel tokens like 'A')
  return stripped.length > 0 ? stripped : token;
}

/**
 * RULE-05: Drop vowels from name tokens (abbreviation / compression).
 * Preserves IBN/BINT/BIN/BT/ABU/ABI/UMM connectors verbatim.
 * Preserves AL- nisba prefix; strips vowels only from the suffix part.
 * Applicable regions: arabic, cyrillic, latin.
 * Returns null if region is inapplicable or if output equals input.
 */
export function abbreviation(entry: SdnEntry): string | null {
  if (!APPLICABLE.has(entry.region)) return null;
  const tokens = entry.name.split(/\s+/);
  const result = tokens.map(dropVowels).join(' ');
  return result === entry.name ? null : result;
}
