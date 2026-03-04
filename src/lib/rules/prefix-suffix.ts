// RULE-09: Prefix / Suffix Removal
// Applicable regions: all
import type { SdnEntry } from '@/types';

// All uppercase — names in dataset are uppercase; comparison done after toUpperCase()
const PREFIXES: ReadonlySet<string> = new Set([
  'MR',
  'MRS',
  'DR',
  'PROF',
  'SHEIKH',
  'SHEIKHA',
  'IMAM',
  'HAJI',
  'HAJJ',
]);

const SUFFIXES: ReadonlySet<string> = new Set(['JR', 'SR', 'II', 'III', 'IV', 'PHD', 'MD']);

/**
 * RULE-09: Strip recognized honorific prefixes and/or suffixes.
 * Prefix table: MR, MRS, DR, PROF, SHEIKH, SHEIKHA, IMAM, HAJI, HAJJ
 * Suffix table: JR, SR, II, III, IV, PHD, MD
 * NOTE: sdn.json has zero honorific prefixes — all real entries return null.
 * Tests MUST use synthetic fixtures: entry.name = 'DR CARLOS RODRIGUEZ'
 * Strips prefix first (first token), then suffix (last remaining token).
 * Returns null if neither prefix nor suffix is found.
 */
export function prefixSuffix(entry: SdnEntry): string | null {
  const tokens = entry.name.split(/\s+/);
  if (tokens.length === 0) return null;
  let start = 0;
  let end = tokens.length;
  // Strip prefix (check first token)
  if (PREFIXES.has(tokens[0].toUpperCase())) {
    start = 1;
  }
  // Strip suffix (check last remaining token after prefix strip)
  if (end - start > 0 && SUFFIXES.has(tokens[end - 1].toUpperCase())) {
    end = end - 1;
  }
  if (start === 0 && end === tokens.length) return null;
  const result = tokens.slice(start, end).join(' ');
  return result.length > 0 ? result : null;
}
