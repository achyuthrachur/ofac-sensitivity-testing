// RULE-03: Diacritic Removal
// Applicable regions: latin, cyrillic
import type { SdnEntry } from '@/types';

const APPLICABLE: ReadonlySet<string> = new Set(['latin', 'cyrillic']);

/**
 * RULE-03: Remove diacritics using NFD decomposition + Unicode combining mark strip.
 * Applicable regions: latin, cyrillic only.
 * NOTE: The sdn.json dataset has zero diacritics — all real entries return null.
 * Tests MUST use synthetic fixtures (e.g., 'MÜLLER', 'JOSÉ').
 * Returns null if region is inapplicable or if result equals input (no diacritics present).
 */
export function diacritic(entry: SdnEntry): string | null {
  if (!APPLICABLE.has(entry.region)) return null;
  const result = entry.name.normalize('NFD').replace(/\p{M}/gu, '');
  return result === entry.name ? null : result;
}
