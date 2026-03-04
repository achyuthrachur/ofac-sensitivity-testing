// RULE-07: Phonetic / Transliteration Variants
// Applicable regions: arabic, cyrillic
import type { SdnEntry } from '@/types';

// Key = canonical uppercase spelling; Value = sorted alternate spellings (index 0 first)
const PHONETIC_MAP = new Map<string, string[]>([
  // Arabic canonical forms -> sorted variant spellings
  ['OSAMA', ['USAMAH', 'USAMA']],
  ['OMAR', ['OMR', 'UMAR']],
  ['QADDAFI', ['GADDAFI', 'KADAFI', 'KADHAFI', 'QADHAFI']],
  ['AHMAD', ['AHAMED', 'AHMED']],
  ['KHALID', ['KHAALID', 'KHALED']],
  ['HASSAN', ['HASAN', 'HASSAAN']],
  ['IBRAHIM', ['EBRAHIM', 'IBRAAHIM']],
  ['YUSUF', ['JOSEF', 'YOUSEF']],
  ['MUSTAFA', ['MOSTAFA', 'MUSTAPHA']],
  ['TARIQ', ['TAREK', 'TARIK']],
  ['BILAL', ['BELAL', 'BILAAL']],
  ['SALEH', ['SALAH', 'SALIH']],
  // Russian canonical forms -> sorted variant spellings
  ['ALEKSANDR', ['ALEKSANDER', 'ALEXANDER', 'ALEXANDRE']],
  ['YULIYA', ['JULIA', 'YULIA']],
  ['PYOTR', ['PETER', 'PIOTR']],
  ['DMITRY', ['DMITRI', 'DMITRIY', 'DMYTRO']],
  ['MIKHAIL', ['MICHAEL', 'MIKHAEL']],
  ['NIKOLAI', ['NIKOLAOS', 'NIKOLAY']],
  ['SERGEI', ['SERGEY', 'SERGII']],
]);

const APPLICABLE: ReadonlySet<string> = new Set(['arabic', 'cyrillic']);

/**
 * RULE-07: Replace a name token with its phonetic/transliteration variant.
 * Lookup table covers top Arabic and Russian names from OFAC SDN list.
 * Strips AL- prefix before lookup; reconstitutes with AL- if match found.
 * Returns the name with the FIRST matching token replaced (left-to-right, variants[0]).
 * Returns null if no token matches the phonetic map or region is inapplicable.
 */
export function phonetic(entry: SdnEntry): string | null {
  if (!APPLICABLE.has(entry.region)) return null;
  const tokens = entry.name.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // Handle AL-XXXX: strip prefix before lookup, reconstitute after
    const hasAlPrefix = token.startsWith('AL-');
    const lookupKey = hasAlPrefix ? token.slice(3) : token;
    const variants = PHONETIC_MAP.get(lookupKey);
    if (variants && variants.length > 0) {
      const replacement = hasAlPrefix ? `AL-${variants[0]}` : variants[0];
      const newTokens = [...tokens];
      newTokens[i] = replacement;
      return newTokens.join(' ');
    }
  }
  return null;
}
