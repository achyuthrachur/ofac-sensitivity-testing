// RULE-08: Punctuation Removal
// Applicable regions: all
import type { SdnEntry } from '@/types';

/**
 * RULE-08: Remove all punctuation characters (hyphens, periods, slashes, etc.).
 * Primary OFAC value: 'AL-NOOR TRADING' -> 'ALNOOR TRADING'
 * Uses /[^\w\s]/g to strip non-word non-space characters.
 * Returns null if the name contains no punctuation (result equals input).
 */
export function punctuation(entry: SdnEntry): string | null {
  const result = entry.name
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return result === entry.name ? null : result;
}
