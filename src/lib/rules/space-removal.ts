// RULE-01: Space Removal
// Applicable regions: all
import type { SdnEntry } from '@/types';

/**
 * RULE-01: Remove all spaces from the entry name.
 * Applicable to all linguistic regions.
 * Returns null if the name contains no spaces (no-op).
 */
export function spaceRemoval(entry: SdnEntry): string | null {
  if (entry.name.indexOf(' ') === -1) return null;
  return entry.name.replace(/\s+/g, '');
}
