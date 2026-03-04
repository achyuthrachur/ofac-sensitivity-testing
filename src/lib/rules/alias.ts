// RULE-10: Nickname / Alias Substitution
// Applicable regions: arabic only (v1)
import type { SdnEntry } from '@/types';

// Key = canonical given name (uppercase); Value = sorted alternate forms (index 0 first)
const ALIAS_MAP = new Map<string, string[]>([
  ['MOHAMMED', ['MOHAMAD', 'MOHAMMAD', 'MOHAMED', 'MUHAMMAD', 'MUHAMMED', 'MUHAMAD']],
  ['ALI', ['ALEE', 'ALY']],
  ['HASSAN', ['HASAN']],
  ['HUSSEIN', ['HOSSEIN', 'HUSAYN', 'HUSSAIN']],
  ['ABDULLAH', ['ABDALLAH', 'ABDULAH']],
  ['ABDUL', ['ABD AL']],
]);

/** Connector tokens that are not given names — skip these and check the next token */
const SKIP_FIRST: ReadonlySet<string> = new Set(['ABU', 'ABD', 'AL']);

/**
 * RULE-10: Substitute the given name (first token) with a known alias.
 * Applicable regions: arabic only (v1 scope).
 * If first token is a connector (ABU/ABD/AL), check the second token instead.
 * Returns the name with the matched token replaced by variants[0] (deterministic).
 * Returns null if no alias match is found or region is not arabic.
 */
export function alias(entry: SdnEntry): string | null {
  if (entry.region !== 'arabic') return null;
  const tokens = entry.name.split(/\s+/);
  // Determine which token index to check (skip connectors)
  let givenNameIdx = 0;
  if (tokens.length > 1 && SKIP_FIRST.has(tokens[0])) {
    givenNameIdx = 1;
  }
  const givenName = tokens[givenNameIdx];
  const variants = ALIAS_MAP.get(givenName);
  if (!variants || variants.length === 0) return null;
  const newTokens = [...tokens];
  newTokens[givenNameIdx] = variants[0];
  return newTokens.join(' ');
}
