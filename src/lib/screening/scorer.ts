// src/lib/screening/scorer.ts
// Pure scoring functions — no side effects, importable by both index.ts and the
// Web Worker. Phase 16 implementation of SCREEN-06/07/08/09.

import jaroWinkler from 'talisman/metrics/jaro-winkler';
import doubleMetaphone from 'talisman/phonetics/double-metaphone';
import type { MatchResult, RiskTier } from '@/types/screening';
import { TIER_THRESHOLDS } from '@/types/screening';
import type { SdnEntry } from '@/types';

// ─── normalize (SCREEN-09) ────────────────────────────────────────────────────

/**
 * Cyrillic-to-Latin confusable character map.
 * These Cyrillic code points are visually identical to Latin letters.
 * NFKD alone does NOT collapse Cyrillic→Latin — they are distinct Unicode code
 * points. This map explicitly handles the OFAC-relevant homoglyphs.
 *
 * Source: Unicode Consortium confusables.txt (subset relevant to Cyrillic→Latin)
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  '\u0410': 'A', // А → A
  '\u0412': 'B', // В → B
  '\u0415': 'E', // Е → E
  '\u041A': 'K', // К → K
  '\u041C': 'M', // М → M
  '\u041D': 'H', // Н → H
  '\u041E': 'O', // О → O
  '\u0420': 'R', // Р → R
  '\u0421': 'C', // С → C
  '\u0422': 'T', // Т → T
  '\u0423': 'Y', // У → Y
  '\u0425': 'X', // Х → X
  '\u0430': 'A', // а → A (lowercase Cyrillic а)
  '\u0435': 'E', // е → E (lowercase Cyrillic е)
  '\u043E': 'O', // о → O (lowercase Cyrillic о)
  '\u0440': 'P', // р → P (lowercase Cyrillic р — maps to P, not R)
  '\u0441': 'C', // с → C (lowercase Cyrillic с)
  '\u0445': 'X', // х → X (lowercase Cyrillic х)
};

/**
 * NFKD-decompose → strip combining marks (\p{Mn}) → map Cyrillic homoglyphs
 * to Latin equivalents → uppercase → trim.
 * Strips diacritics (é→E, ü→U) AND maps Cyrillic visual homoglyphs (Р→R, etc.)
 * to their Latin equivalents for reliable fuzzy matching.
 */
export function normalize(input: string): string {
  // Map Cyrillic homoglyphs before NFKD (uppercase Cyrillic Р is the key case)
  const homoglyphMapped = [...input]
    .map(ch => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('');
  return homoglyphMapped.normalize('NFKD').replace(/\p{Mn}/gu, '').toUpperCase().trim();
}

// ─── dmBonus (SCREEN-06 + CJK guard) ─────────────────────────────────────────

/**
 * Returns 1.0 if any Double Metaphone code overlaps between a and b.
 * Returns 0.0 if either input produces empty codes (CJK/Arabic guard —
 * prevents two unencodable strings from matching each other as phonetic hits).
 */
export function dmBonus(a: string, b: string): number {
  const [ap, as_] = doubleMetaphone(a);
  const [bp, bs] = doubleMetaphone(b);
  if (!ap && !as_) return 0; // Guard: CJK/Arabic produces empty codes
  if (!bp && !bs) return 0;  // Guard: prevents ['',''] vs ['',''] = false positive
  const codesA = new Set([ap, as_].filter(Boolean));
  const codesB = new Set([bp, bs].filter(Boolean));
  for (const code of codesA) {
    if (codesB.has(code)) return 1.0;
  }
  return 0.0;
}

// ─── tokenSortRatio (SCREEN-06) ───────────────────────────────────────────────

/**
 * Token Sort Ratio: split on whitespace, sort tokens, rejoin, compute JW.
 * Handles word-order variations: "ALI IBN OMAR" == "IBN OMAR ALI".
 */
export function tokenSortRatio(a: string, b: string): number {
  const sortTokens = (s: string): string =>
    s.split(/\s+/).filter(Boolean).sort().join(' ');
  return jaroWinkler(sortTokens(a), sortTokens(b));
}

// ─── Tier assignment (SCREEN-07) ─────────────────────────────────────────────

const TIER_LADDER: RiskTier[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'EXACT'];

/**
 * Walk TIER_THRESHOLDS boundaries in descending order and return the matching tier.
 * Score of exactly 0.97 → EXACT; 0.90 → HIGH; etc.
 */
export function assignTier(score: number): RiskTier {
  if (score >= TIER_THRESHOLDS.EXACT)  return 'EXACT';
  if (score >= TIER_THRESHOLDS.HIGH)   return 'HIGH';
  if (score >= TIER_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (score >= TIER_THRESHOLDS.LOW)    return 'LOW';
  return 'CLEAR';
}

/**
 * Escalate one step up the tier ladder (CLEAR→LOW→MEDIUM→HIGH→EXACT).
 * Caps at EXACT — does not wrap past the top.
 */
export function escalateTier(tier: RiskTier): RiskTier {
  const idx = TIER_LADDER.indexOf(tier);
  return TIER_LADDER[Math.min(idx + 1, TIER_LADDER.length - 1)];
}

// ─── isShortName (SCREEN-08) ─────────────────────────────────────────────────

/**
 * Returns true if the normalized name has 6 or fewer non-whitespace characters.
 * Used to trigger the name-length penalty (effectiveTier escalation).
 */
export function isShortName(normalized: string): boolean {
  return normalized.replace(/\s/g, '').length <= 6;
}

// ─── scorePair (SCREEN-06) ───────────────────────────────────────────────────

/**
 * Compute all three algorithm scores and the weighted composite for a single pair.
 * Formula: composite = JW×0.6 + DM_bonus×0.25 + TSR×0.15
 */
export function scorePair(
  normalizedInput: string,
  normalizedSdn: string
): { jw: number; dm: number; tsr: number; composite: number } {
  const jw  = jaroWinkler(normalizedInput, normalizedSdn);
  const dm  = dmBonus(normalizedInput, normalizedSdn);
  const tsr = tokenSortRatio(normalizedInput, normalizedSdn);
  const composite = jw * 0.6 + dm * 0.25 + tsr * 0.15;
  return { jw, dm, tsr, composite };
}

// ─── Internal DM cache helper ─────────────────────────────────────────────────

/**
 * Compute DM bonus from pre-computed code pairs — avoids re-running
 * doubleMetaphone() on the same SDN entry for every input name.
 */
function dmBonusFromCodes(
  [ap, as_]: [string, string],
  [bp, bs]: [string, string]
): number {
  if (!ap && !as_) return 0; // Guard: CJK/Arabic
  if (!bp && !bs)  return 0;
  const codesA = new Set([ap, as_].filter(Boolean));
  const codesB = new Set([bp, bs].filter(Boolean));
  for (const code of codesA) {
    if (codesB.has(code)) return 1.0;
  }
  return 0.0;
}

// ─── screenNames (SCREEN-06/07/08/09) ────────────────────────────────────────

/**
 * Screen a list of input names against an SDN dataset.
 *
 * PERFORMANCE: SDN names are pre-normalized AND DM codes pre-computed ONCE
 * before any loops. This reduces doubleMetaphone() calls from ~5.8M to ~10k
 * for a 10,000-name run against 290 SDN entries.
 *
 * @throws {Error} if sdnEntries is empty (guard against silent empty results)
 */
export function screenNames(
  inputNames: string[],
  sdnEntries: SdnEntry[]
): MatchResult[] {
  if (sdnEntries.length === 0) {
    throw new Error('screenNames: sdnEntries must not be empty');
  }

  // Pre-normalize AND pre-compute DM codes for SDN entries ONCE
  const sdnCache = sdnEntries.map(entry => {
    const normalizedName = normalize(entry.name);
    const [dmP, dmS] = doubleMetaphone(normalizedName) as [string, string];
    return { entry, normalizedName, dmCodes: [dmP, dmS] as [string, string] };
  });

  return inputNames.map((rawInput): MatchResult => {
    const normalizedInput = normalize(rawInput);
    // Compute DM codes for input name ONCE (not once per SDN entry)
    const inputDmCodes = doubleMetaphone(normalizedInput) as [string, string];

    let best: {
      composite: number;
      jw: number;
      dm: number;
      tsr: number;
      entry: SdnEntry;
    } | null = null;

    for (const { entry, normalizedName, dmCodes } of sdnCache) {
      const jw  = jaroWinkler(normalizedInput, normalizedName);
      const dm  = dmBonusFromCodes(inputDmCodes, dmCodes);
      const tsr = tokenSortRatio(normalizedInput, normalizedName);
      const composite = jw * 0.6 + dm * 0.25 + tsr * 0.15;
      if (best === null || composite > best.composite) {
        best = { composite, jw, dm, tsr, entry };
      }
    }

    // best cannot be null here — sdnEntries.length === 0 is guarded above
    const { composite, jw, dm, tsr, entry } = best!;
    const riskTier = assignTier(composite);
    const nameLengthPenaltyApplied = isShortName(normalizedInput);
    const effectiveTier = nameLengthPenaltyApplied ? escalateTier(riskTier) : riskTier;

    // Winning algorithm: DM wins if it fired; TSR wins if it beat JW; else JW
    const matchAlgorithm: MatchResult['matchAlgorithm'] =
      dm === 1.0 ? 'double-metaphone'
      : tsr > jw  ? 'token-sort-ratio'
      : 'jaro-winkler';

    return {
      rawInput,
      normalizedInput,
      inputName: rawInput,
      matchedSdnName: entry.name,
      sdnId: entry.id,
      entityType: entry.entityType,
      region: entry.region,
      country: entry.country ?? null,
      jwScore: jw,
      dmBonus: dm,
      tsrScore: tsr,
      compositeScore: composite,
      matchAlgorithm,
      riskTier,
      nameLengthPenaltyApplied,
      effectiveTier,
      transformationDetected: false,
    };
  });
}
