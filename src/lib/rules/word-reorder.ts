// RULE-04: Word Reorder (Left-Rotate by 1)
// Applicable regions: all
import type { SdnEntry } from '@/types';

/**
 * RULE-04: Left-rotate name tokens by 1 position.
 * ['A', 'B', 'C', 'D'] -> ['B', 'C', 'D', 'A']
 * Applicable to all linguistic regions.
 * Returns null if fewer than 2 tokens (single-token names — aircraft, some vessels).
 */
export function wordReorder(entry: SdnEntry): string | null {
  const tokens = entry.name.split(/\s+/);
  if (tokens.length < 2) return null;
  return [...tokens.slice(1), tokens[0]].join(' ');
}
