// src/lib/formUtils.ts
// Pure, side-effect-free helper functions for form state management.
// Imported by page.tsx (Phase 5) and tested independently without DOM or React.

import type { Region, RunParams } from '@/types';
import { CANONICAL_RULE_ORDER } from '@/lib/rules';
import { MAX_ENTITY_COUNT } from '@/lib/constants';

/**
 * Parses a raw form input string into a valid entity count integer.
 *
 * - Empty string or non-numeric input → 0
 * - Negative values → 0 (clamped)
 * - Values above MAX_ENTITY_COUNT → MAX_ENTITY_COUNT (clamped)
 * - Uses parseInt (not parseFloat) — Zod validates .int() server-side
 */
export function parseEntityCount(raw: string): number {
  const val = parseInt(raw, 10);
  if (Number.isNaN(val)) return 0;
  return Math.max(0, Math.min(val, MAX_ENTITY_COUNT));
}

/**
 * Toggles a region in/out of the current selection array.
 *
 * - If target is already present → returns new array with target removed
 * - If target is absent → returns new array with target appended
 * - Does NOT mutate the input array (returns new reference)
 */
export function toggleRegion(current: Region[], target: Region): Region[] {
  if (current.includes(target)) {
    return current.filter((r) => r !== target);
  }
  return [...current, target];
}

/**
 * Toggles a rule ID in/out of the current selection array.
 *
 * - If target is already present → returns new array with target removed
 * - If target is absent → returns new array with target appended
 * - Does NOT mutate the input array (returns new reference)
 */
export function toggleRule(current: string[], target: string): string[] {
  if (current.includes(target)) {
    return current.filter((id) => id !== target);
  }
  return [...current, target];
}

/**
 * Derives the "select all" checkbox tri-state from the current rule selection.
 *
 * - 0 rules selected → false (unchecked)
 * - All 10 rules selected → true (checked)
 * - 1–9 rules selected → 'indeterminate'
 *
 * Uses length comparison against CANONICAL_RULE_ORDER — sufficient for UI purposes.
 */
export function deriveSelectAllState(ruleIds: string[]): boolean | 'indeterminate' {
  const total = CANONICAL_RULE_ORDER.length;
  if (ruleIds.length === 0) return false;
  if (ruleIds.length === total) return true;
  return 'indeterminate';
}

/**
 * Assembles a RunParams object from the four form state slices.
 *
 * clientName is passed through unchanged — Zod performs validation server-side.
 * This function is a pure factory; it applies no transformation to any argument.
 */
export function buildRunParams(
  entityCounts: RunParams['entityCounts'],
  regions: Region[],
  ruleIds: string[],
  clientName: string,
): RunParams {
  return { entityCounts, regions, ruleIds, clientName };
}
