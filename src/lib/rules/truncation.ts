// RULE-06: Truncation (Drop Last Token)
// Applicable regions: all
import type { SdnEntry } from '@/types';

/**
 * RULE-06: Drop the last name token.
 * 'HASSAN IBN ALI AL-RASHIDI' -> 'HASSAN IBN ALI'
 * Returns null for single-token names (aircraft tail numbers, single-word vessels).
 */
export function truncation(entry: SdnEntry): string | null {
  const tokens = entry.name.split(/\s+/);
  if (tokens.length < 2) return null;
  return tokens.slice(0, -1).join(' ');
}
