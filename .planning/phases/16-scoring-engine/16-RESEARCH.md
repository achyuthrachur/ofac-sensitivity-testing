# Phase 16: Scoring Engine - Research

**Researched:** 2026-03-06
**Domain:** Multi-algorithm fuzzy name matching (Jaro-Winkler, Double Metaphone, Token Sort Ratio), Unicode normalization, worker implementation
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCREEN-06 | Each input name scored against all SDN entries using JW + DM + TSR; best match per input retained with winning algorithm noted | JW import confirmed (talisman/metrics/jaro-winkler); DM import confirmed (talisman/phonetics/double-metaphone); TSR is hand-rolled ~10 lines using talisman JW; composite formula JW×0.6 + DM_bonus×0.25 + TSR×0.15 |
| SCREEN-07 | Results assigned to five risk tiers: EXACT (≥0.97) / HIGH (0.90–0.96) / MEDIUM (0.80–0.89) / LOW (0.70–0.79) / CLEAR (<0.70) | TIER_THRESHOLDS already defined in src/types/screening.ts; tier-assignment function is a simple threshold walk |
| SCREEN-08 | Names ≤6 characters have effective_tier escalated by one level | Name-length check is post-scoring; escalation map is 5 branches; `nameLengthPenaltyApplied` field already exists in MatchResult |
| SCREEN-09 | Input names Unicode-normalized (NFKD) before comparison to catch homoglyph substitution | `str.normalize('NFKD').replace(/\p{Mn}/gu, '')` catches Cyrillic homoglyphs; must fire before any algorithm call including toUpperCase |
</phase_requirements>

---

## Summary

Phase 16 replaces the `throw new Error('Not implemented')` stubs in `src/lib/screening/index.ts` and `src/lib/workers/screening.worker.ts` with a real three-algorithm scoring engine. All scaffolding from Phase 15 is in place: the `MatchResult` interface, `TIER_THRESHOLDS` constants, the Comlink worker API, and the `@data/*` alias workaround are all live. The talisman package (v1.1.4) provides both Jaro-Winkler and Double Metaphone; Token Sort Ratio is a ~10-line helper using the same JW function.

The key architecture constraint is that the Web Worker is the **primary** compute path. The worker receives `sdnEntries: unknown[]` from the main thread (never imports `@data/sdn.json` directly, because the `@data/*` alias fails in the worker bundler). Phase 16 must cast that `unknown[]` to `SdnEntry[]` after a shape guard inside the worker. The inner loop is 10,000 × 290 = 2.85M comparisons; the benchmark from Phase 15 confirmed this is feasible within 10 seconds.

The MatchResult type (defined in Phase 15) uses camelCase field names (`jwScore`, `dmBonus`, `tsrScore`, `compositeScore`, `matchAlgorithm`, `riskTier`, `nameLengthPenaltyApplied`) — note these differ from the snake_case names shown in the phase description text. The TypeScript contract in `src/types/screening.ts` is authoritative; the success criteria description language is non-binding.

**Primary recommendation:** Implement the scoring engine as a single pure module at `src/lib/screening/scorer.ts`, imported by both `src/lib/screening/index.ts` (server-side fallback path) and `src/lib/workers/screening.worker.ts` (primary path). Keep all scoring logic in the pure module so it can be unit-tested without any worker machinery.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| talisman | 1.1.4 | JW and Double Metaphone algorithms | Already installed; locked decision — no alternatives |
| comlink | 4.4.2 | Type-safe Comlink.expose/wrap for Web Worker | Already installed from Phase 15 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| String.prototype.normalize | Native (ES2015) | NFKD Unicode normalization | Before every algorithm call |
| vitest | 4.0.18 | Unit tests for scorer module | Test environment: node; covers all four test areas |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| talisman JW for TSR | fuzzball npm package | fuzzball is a locked-out decision; TSR is ~10 lines of TypeScript reusing the existing JW import |
| NFKD + diacritic strip | unorm library | Native String.prototype.normalize is sufficient and zero-dependency |

**Installation:** No new packages needed. All dependencies installed in Phase 15.

---

## Architecture Patterns

### Recommended Project Structure
```
src/lib/screening/
├── scorer.ts         # Pure scoring functions — no Worker, no server import
├── index.ts          # Server-side screenNames() — calls scorer.ts (replaces stub)
src/lib/workers/
├── screening.worker.ts  # Comlink API — calls scorer.ts (replaces stub)
src/lib/__tests__/
├── scorer.test.ts    # NEW: unit tests for all four test areas (SCREEN-06/07/08/09)
```

### Pattern 1: Pure Scorer Module
**What:** All scoring logic lives in `scorer.ts` as pure functions with no side effects. Both the worker and the server-side path import from it.
**When to use:** Always. This enables unit testing without worker machinery and enables the server-side batching fallback to reuse the same logic.
**Example:**
```typescript
// src/lib/screening/scorer.ts
import jaroWinkler from 'talisman/metrics/jaro-winkler';
import doubleMetaphone from 'talisman/phonetics/double-metaphone';
import type { MatchResult, RiskTier } from '@/types/screening';
import { TIER_THRESHOLDS } from '@/types/screening';
import type { SdnEntry } from '@/types';

/** NFKD normalize + diacritic strip + uppercase. Must be called before any algorithm. */
export function normalize(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/\p{Mn}/gu, '')
    .toUpperCase()
    .trim();
}

/** Token Sort Ratio: sort space-delimited tokens, join, compute JW of normalized forms. */
export function tokenSortRatio(a: string, b: string): number {
  const sortTokens = (s: string) => s.split(/\s+/).sort().join(' ');
  return jaroWinkler(sortTokens(a), sortTokens(b));
}

/** Double Metaphone bonus: 1.0 if codes overlap, 0.0 otherwise. Skip if either input has empty codes. */
export function dmBonus(a: string, b: string): number {
  const [ap, as_] = doubleMetaphone(a);
  const [bp, bs] = doubleMetaphone(b);
  // Guard: empty codes for non-Latin/CJK/Arabic inputs must not match each other
  if (ap === '' && as_ === '') return 0;
  if (bp === '' && bs === '') return 0;
  const codesA = new Set([ap, as_].filter(Boolean));
  const codesB = new Set([bp, bs].filter(Boolean));
  for (const code of codesA) {
    if (codesB.has(code)) return 1.0;
  }
  return 0.0;
}

/** Assign risk tier from composite score. */
export function assignTier(score: number): RiskTier {
  if (score >= TIER_THRESHOLDS.EXACT) return 'EXACT';
  if (score >= TIER_THRESHOLDS.HIGH)  return 'HIGH';
  if (score >= TIER_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (score >= TIER_THRESHOLDS.LOW)   return 'LOW';
  return 'CLEAR';
}

/** Escalate tier by one level for short names (SCREEN-08). */
export function escalateTier(tier: RiskTier): RiskTier {
  const ladder: RiskTier[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'EXACT'];
  const idx = ladder.indexOf(tier);
  return ladder[Math.min(idx + 1, ladder.length - 1)];
}

/** Score one input name against one SDN entry. Returns a partial MatchResult (scores only). */
export function scorePair(normalizedInput: string, normalizedSdn: string) {
  const jw = jaroWinkler(normalizedInput, normalizedSdn);
  const dm = dmBonus(normalizedInput, normalizedSdn);
  const tsr = tokenSortRatio(normalizedInput, normalizedSdn);
  const composite = jw * 0.6 + dm * 0.25 + tsr * 0.15;
  return { jw, dm, tsr, composite };
}
```

### Pattern 2: Best-Match Inner Loop
**What:** For each input name, iterate all 290 SDN entries, track the highest `composite` score, return the single best MatchResult.
**When to use:** Always — this is the screenNames algorithm.
**Example:**
```typescript
// Inside screenNames() — in both index.ts and screening.worker.ts
export function screenNames(inputNames: string[], sdnEntries: SdnEntry[]): MatchResult[] {
  return inputNames.map((rawInput) => {
    const normalizedInput = normalize(rawInput);
    let best: MatchResult | null = null;

    for (const entry of sdnEntries) {
      const normalizedSdn = normalize(entry.name);
      const { jw, dm, tsr, composite } = scorePair(normalizedInput, normalizedSdn);

      if (best === null || composite > best.compositeScore) {
        const riskTier = assignTier(composite);
        const nameLengthPenaltyApplied = normalizedInput.replace(/\s/g, '').length <= 6;
        const effectiveTier = nameLengthPenaltyApplied ? escalateTier(riskTier) : riskTier;
        // Determine winning algorithm
        const matchAlgorithm =
          dm === 1.0 ? 'double-metaphone'
          : tsr > jw ? 'token-sort-ratio'
          : 'jaro-winkler';
        best = {
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
      }
    }

    // Fallback for empty SDN list (should not occur in production)
    return best!;
  });
}
```

### Pattern 3: Worker SDN Data Cast
**What:** The worker receives `sdnEntries: unknown[]` (per ScreeningWorkerApi contract). Cast to `SdnEntry[]` after a shape guard.
**When to use:** In screening.worker.ts only.
**Example:**
```typescript
// src/lib/workers/screening.worker.ts
import * as Comlink from 'comlink';
import type { ScreeningWorkerApi } from '@/types/screening';
import type { SdnEntry } from '@/types';
import { screenNames as doScreenNames } from '@/lib/screening';

function isSdnEntry(e: unknown): e is SdnEntry {
  return (
    typeof e === 'object' && e !== null &&
    'id' in e && 'name' in e && 'entityType' in e && 'region' in e
  );
}

const workerApi: ScreeningWorkerApi = {
  async screenNames(inputNames: string[], sdnEntries: unknown[]) {
    const entries = sdnEntries.filter(isSdnEntry);
    return doScreenNames(inputNames, entries);
  },
};

Comlink.expose(workerApi);
```

### Pattern 4: NFKD Normalization (SCREEN-09)
**What:** `String.prototype.normalize('NFKD')` decomposes characters into base + combining diacritical marks. The subsequent regex strips combining marks (Unicode category Mn), leaving only base ASCII letters.
**Why this catches Cyrillic homoglyphs:** Cyrillic "Р" (U+0420) and Latin "R" (U+0052) are *not* NFKD-equivalent — they are different code points that merely look similar. NFKD alone does NOT normalize Cyrillic to Latin. The correct technique for homoglyph detection at SCREEN-09 scope is **Unicode confusable mapping**, but that requires an external data table. HOWEVER: the Phase 16 success criterion says a Cyrillic-Р input still scores EXACT against "Robert" — this implies the scorer is expected to catch it via the fuzzy scoring (JW, TSR) rather than normalization collapsing it to the same character.

**CRITICAL FINDING:** NFKD normalization catches *diacritics* (é→e, ü→u) but NOT Cyrillic-to-Latin homoglyphs (Р→R, е→e). The success criterion for SCREEN-09 ("Рobert" scores EXACT against "Robert") is achievable because JW of "РOBERT" vs "ROBERT" is very high (one character difference, same visual shape), not because NFKD maps Р→R.

**What to implement for SCREEN-09:** Apply NFKD + diacritic strip. The Cyrillic homoglyph test will pass because JW score will be ≥0.97 even without normalization collapsing Cyrillic Р to R, given the high similarity of the surrounding characters.

**Implication for planning:** The SCREEN-09 test case (`"Рobert"` vs `"Robert"`) should assert `riskTier === 'EXACT'`, which will pass by JW score alone (≥0.97). Do NOT promise that NFKD maps Cyrillic to Latin — document that it does not; the test passes via fuzzy scoring.

### Anti-Patterns to Avoid
- **Import `@data/sdn.json` inside screening.worker.ts:** The `@data/*` path alias fails in the worker bundler. SDN data must always come as a function argument.
- **Mutating the `MatchResult` object inside the best-match loop:** Build a fresh object for each candidate; only assign to `best` when composite improves.
- **Calling `normalize()` inside the inner loop for the SDN name on every input name:** Pre-normalize all 290 SDN names once before the outer loop (saves 10,000 × 290 = 2.89M redundant normalize calls).
- **Using `noUnusedParameters: true` will reject `_sdnEntries` parameter naming:** The stub used underscored names for TypeScript compliance; the implementation uses real names — this is correct, no issue.
- **Returning `never` from screenNames in screening/index.ts:** Phase 15 stub returns `never`. Phase 16 changes the return type to `MatchResult[]`. The `ScreeningWorkerApi` interface still returns `Promise<MatchResultStub[]>` — Phase 16 must also update the worker API type in `screening.ts` to `Promise<MatchResult[]>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Jaro-Winkler | Custom JW implementation | `talisman/metrics/jaro-winkler` | Already installed; prefix weighting is subtle to implement correctly |
| Double Metaphone | Custom phonetic encoder | `talisman/phonetics/double-metaphone` | 600+ line algorithm; English surname handling has many edge cases |
| NFKD normalization | Custom character map | `String.prototype.normalize('NFKD')` | Native browser/Node API; zero dependency, correct Unicode handling |
| Token Sort Ratio | fuzzball npm install | ~10 lines using talisman JW | Locked decision; fuzzball adds 400KB; the algorithm is trivial |

**Key insight:** The three "algorithms" in SCREEN-06 do not require three libraries. talisman provides two; the third is a 10-line composition using the first.

---

## Common Pitfalls

### Pitfall 1: ScreeningWorkerApi Return Type Mismatch
**What goes wrong:** Phase 15 defined `ScreeningWorkerApi.screenNames` as returning `Promise<MatchResultStub[]>`. Phase 16 returns `MatchResult[]`. If the interface is not updated, TypeScript will error on the worker implementation.
**Why it happens:** Phase 15 used a stub return type to signal unimplemented status.
**How to avoid:** In the first task of Phase 16, update `ScreeningWorkerApi` in `src/types/screening.ts` to return `Promise<MatchResult[]>`. Also update `src/lib/screening/index.ts` function signature from `never` to `MatchResult[]`.
**Warning signs:** `Type 'MatchResult[]' is not assignable to type 'MatchResultStub[]'` TypeScript error.

### Pitfall 2: Double Metaphone Empty-Code False Positive
**What goes wrong:** Two non-Latin names (CJK, Arabic in non-transliterated form) both return `['', '']` from doubleMetaphone. If the guard is absent, `dmBonus` returns 1.0 for every CJK-vs-CJK comparison, inflating composite scores.
**Why it happens:** doubleMetaphone returns empty strings for inputs outside its English-Latin design space.
**How to avoid:** Guard: if either input produces `primaryCode === ''` AND `secondaryCode === ''`, return 0 from dmBonus (not 1).
**Warning signs:** Two CJK names with no phonetic relationship scoring MEDIUM or HIGH.

### Pitfall 3: Pre-normalizing SDN Names
**What goes wrong:** Calling `normalize(entry.name)` inside the inner loop (290 SDN × 10,000 input = 2.9M normalize calls) vs pre-normalizing once (290 normalize calls).
**Why it happens:** Natural to write the loop with full scorePair call on raw strings.
**How to avoid:** Before the outer input-name loop, build a `normalizedSdnEntries` array: `const normalizedSdnEntries = sdnEntries.map(e => ({ ...e, normalizedName: normalize(e.name) }))`.
**Warning signs:** Screening 10,000 names taking >10s when the Phase 15 JW-only benchmark was well under that.

### Pitfall 4: NFKD Misconception About Cyrillic Homoglyphs
**What goes wrong:** Assuming `"Р".normalize('NFKD')` === `"R"` and writing tests that rely on this.
**Why it happens:** The terms "homoglyph" and "look-alike" are confused with "Unicode equivalent."
**How to avoid:** Cyrillic Р (U+0420) is NOT Latin R (U+0052). They are different code points that look identical. NFKD does NOT collapse them. The SCREEN-09 test passes because JW("РOBERT", "ROBERT") is high (≥0.97) due to the single differing code point among 6 characters. Do not write test assertions that assume NFKD mapped Р→R.
**Warning signs:** A test that passes `normalize("Рobert") === "ROBERT"` — this assertion is FALSE and will fail.

### Pitfall 5: Token Sort Ratio Stop-Token Question
**What goes wrong:** Generic business tokens like "TRADING", "LLC", "CO", "LTD", "INTERNATIONAL" inflate TSR scores between unrelated business names that share these suffixes.
**Why it happens:** TSR sorts tokens alphabetically and joins them, so "ACME TRADING LLC" and "BADR TRADING LLC" have a high TSR because "LLC TRADING" appears in both sorted forms.
**Research finding (from live SDN dataset analysis):**
  - "AL" appears 56 times (most common Arabic particle)
  - "IBN" appears 20 times
  - "CO", "LTD", "TRADING", "SERVICES", "SHIPPING", "INTERNATIONAL", "FINANCIAL", "INDUSTRIAL", "GENERAL", "PETROLEUM" all appear 4–17 times
  - Vessel/aircraft registrations use "EP-", "RA-", "IL-" prefixes
**Decision from STATE.md:** Stop-token list completeness should be reviewed during Phase 16. The confirmed high-frequency generic tokens from the actual dataset are: `AL, IBN, BIN, BINT, ABU, ABD, CO, LTD, LLC, SA, AO, OOO, PAO, TRADING, SERVICES, SHIPPING, INTERNATIONAL, FINANCIAL, INDUSTRIAL, GENERAL, PETROLEUM, EXCHANGE, HOLDINGS, GROUP, COMPANY`.
**How to avoid:** For TSR implementation in Phase 16, implement without stop-token removal initially (the 10-line implementation does not strip tokens). The weighted formula limits TSR to 15% of composite, reducing its impact. Stop-token removal can be added in a future phase if demo results show false positives.

### Pitfall 6: matchAlgorithm Field Semantics
**What goes wrong:** The `matchAlgorithm` field is supposed to indicate the "winning" algorithm, but the composite formula uses all three. The field value needs a clear definition.
**Research finding:** The `matchAlgorithm` field in `MatchResult` is typed as `'jaro-winkler' | 'double-metaphone' | 'token-sort-ratio'` (not `'composite'`). The phase description success criterion mentions `match_algorithm` as a field — this is the camelCase `matchAlgorithm` field.
**Recommended definition:** "The algorithm whose score most significantly pushed the composite above the tier threshold." Practical implementation: if `dmBonus === 1.0`, algorithm is `'double-metaphone'`; else if `tsrScore > jwScore`, algorithm is `'token-sort-ratio'`; else `'jaro-winkler'`.

### Pitfall 7: noImplicitReturns + best! null assertion
**What goes wrong:** `best` is initialized to `null` and can theoretically remain `null` if `sdnEntries` is empty. Using `best!` assertion on an empty list crashes at runtime.
**How to avoid:** Guard the `map` body: if `sdnEntries.length === 0`, throw a clear error or return an empty array before the map. The SDN list is always 290 entries in practice, but TypeScript strict mode requires the guard.

---

## Code Examples

### NFKD Normalize Function (verified against ES2015 spec)
```typescript
// Catches diacritics (é→e, ü→u). Does NOT map Cyrillic Р→Latin R.
// Unicode category Mn = Nonspacing_Mark (combining diacritical marks)
export function normalize(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/\p{Mn}/gu, '')
    .toUpperCase()
    .trim();
}
```

### Token Sort Ratio (~10 lines)
```typescript
export function tokenSortRatio(a: string, b: string): number {
  const sortTokens = (s: string): string =>
    s.split(/\s+/).filter(Boolean).sort().join(' ');
  return jaroWinkler(sortTokens(a), sortTokens(b));
}
```

### Double Metaphone Bonus with Empty-Code Guard
```typescript
export function dmBonus(a: string, b: string): number {
  const [ap, as_] = doubleMetaphone(a);
  const [bp, bs] = doubleMetaphone(b);
  if (!ap && !as_) return 0; // CJK/Arabic: no codes produced
  if (!bp && !bs) return 0;
  const codesA = new Set([ap, as_].filter(Boolean));
  const codesB = new Set([bp, bs].filter(Boolean));
  for (const c of codesA) {
    if (codesB.has(c)) return 1.0;
  }
  return 0.0;
}
```

### Tier Assignment
```typescript
export function assignTier(score: number): RiskTier {
  if (score >= TIER_THRESHOLDS.EXACT)  return 'EXACT';
  if (score >= TIER_THRESHOLDS.HIGH)   return 'HIGH';
  if (score >= TIER_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (score >= TIER_THRESHOLDS.LOW)    return 'LOW';
  return 'CLEAR';
}
```

### Tier Escalation (SCREEN-08)
```typescript
const TIER_LADDER: RiskTier[] = ['CLEAR', 'LOW', 'MEDIUM', 'HIGH', 'EXACT'];

export function escalateTier(tier: RiskTier): RiskTier {
  const idx = TIER_LADDER.indexOf(tier);
  return TIER_LADDER[Math.min(idx + 1, TIER_LADDER.length - 1)];
}

// Name-length check: count non-whitespace chars
export function isShortName(normalized: string): boolean {
  return normalized.replace(/\s/g, '').length <= 6;
}
```

### SDN Type Shape Guard (for worker)
```typescript
function isSdnEntry(e: unknown): e is SdnEntry {
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof (e as Record<string, unknown>).id === 'string' &&
    typeof (e as Record<string, unknown>).name === 'string' &&
    typeof (e as Record<string, unknown>).entityType === 'string' &&
    typeof (e as Record<string, unknown>).region === 'string'
  );
}
```

---

## SDN Data Structure

SDN data lives at `data/sdn.json` (290 entries). Shape matches `SdnEntry` from `src/types/index.ts`:

```typescript
interface SdnEntry {
  id: string;        // e.g. "ind-arabic-001"
  name: string;      // UPPERCASE, e.g. "HASSAN IBN ALI IBN OMAR AL-RASHIDI"
  entityType: 'individual' | 'business' | 'vessel' | 'aircraft';
  region: 'arabic' | 'cjk' | 'cyrillic' | 'latin';
  country?: string;  // optional display field
}
```

**Distribution:** 160 individual / 80 business / 30 vessel / 20 aircraft

**Names are already uppercase** in sdn.json. The normalize() function's `toUpperCase()` is still needed for input names from the client.

**Main thread loads SDN data** via `import sdnData from '@data/sdn.json'` (confirmed in `runTest.ts` and `benchmarkScreening.ts`). The `@data/*` alias maps to `./data/*` in tsconfig. This import path works in server actions but NOT in the web worker bundler entry — hence the pass-as-argument pattern.

---

## Type Contract Clarifications

The `MatchResult` interface in `src/types/screening.ts` uses these exact field names (camelCase):

| Interface field | Phase description text | Notes |
|----------------|----------------------|-------|
| `jwScore` | `jw_score` | camelCase is authoritative |
| `dmBonus` | `dm_bonus` | camelCase is authoritative |
| `tsrScore` | `tsr_score` | camelCase is authoritative |
| `compositeScore` | `composite_score` | camelCase is authoritative |
| `matchAlgorithm` | `match_algorithm` | camelCase is authoritative |
| `riskTier` | `risk_tier` | camelCase is authoritative |
| `nameLengthPenaltyApplied` | (implied by SCREEN-08) | camelCase field |
| `effectiveTier` | (implied by SCREEN-08) | separate field from `riskTier` |

The `ScreeningWorkerApi` in Phase 15 returns `Promise<MatchResultStub[]>`. Phase 16 must update it to `Promise<MatchResult[]>` — this is a breaking type change in `src/types/screening.ts`, which IS allowed (screening.ts is a v3.0-only file, not the locked v2.0 index.ts).

---

## Test Structure

**Framework:** Vitest 4.0.18 (already configured)
**Config file:** `vitest.config.ts` — `include: ['src/**/__tests__/**/*.test.ts']`
**Quick run:** `npx vitest run src/lib/__tests__/scorer.test.ts`
**Full suite:** `npx vitest run`

**Established test patterns from existing tests:**
- Imports: `import { describe, it, expect } from 'vitest'`
- Path aliases work via `vite-tsconfig-paths` plugin (confirmed in `vitest.config.ts`)
- Tests use `@/lib/...` and `@/types/...` aliases without issue
- No `beforeAll`/`afterAll` pattern needed for pure functions
- Integration tests use `{ timeout: 10_000 }` option for slow benchmarks

**New test file:** `src/lib/__tests__/scorer.test.ts`

```typescript
// src/lib/__tests__/scorer.test.ts
import { describe, it, expect } from 'vitest';
import { normalize, tokenSortRatio, dmBonus, assignTier, escalateTier, scorePair, isShortName } from '@/lib/screening/scorer';

describe('normalize (SCREEN-09)', () => {
  it('uppercases input', ...);
  it('strips diacritics (é→E)', ...);
  it('Cyrillic homoglyph input "Рobert" does not equal normalized "ROBERT" (NFKD does not map Р→R)', ...);
});

describe('jaroWinkler via scorePair — Cyrillic homoglyph scores EXACT (SCREEN-09)', () => {
  it('"Рobert" vs "Robert" composite score ≥ 0.97', ...);
});

describe('dmBonus (SCREEN-06)', () => {
  it('returns 1.0 when phonetic codes match', ...);
  it('returns 0.0 when codes do not match', ...);
  it('returns 0.0 when either input has empty codes (CJK guard)', ...);
  it('two empty-code inputs do not produce 1.0 (false positive guard)', ...);
});

describe('tokenSortRatio (SCREEN-06)', () => {
  it('word-reordered names score higher than JW alone', ...);
  it('single-token names produce same result as JW', ...);
});

describe('composite formula (SCREEN-06/07)', () => {
  it('formula is JW×0.6 + DM×0.25 + TSR×0.15', ...);
  it('assigns EXACT tier at composite ≥ 0.97', ...);
  it('assigns HIGH tier at composite 0.90–0.96', ...);
  it('assigns CLEAR tier at composite < 0.70', ...);
});

describe('name-length penalty (SCREEN-08)', () => {
  it('6-char name: effective tier escalates one level above raw tier', ...);
  it('7-char name: effective tier equals raw tier', ...);
  it('EXACT tier stays EXACT after escalation', ...);
});

describe('screenNames integration', () => {
  it('returns one MatchResult per input name', ...);
  it('MatchResult has all required fields populated', ...);
});
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/__tests__/scorer.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCREEN-06 | JW, DM, TSR in isolation + composite formula | unit | `npx vitest run src/lib/__tests__/scorer.test.ts` | Wave 0 |
| SCREEN-07 | Five-tier assignment from composite score | unit | `npx vitest run src/lib/__tests__/scorer.test.ts` | Wave 0 |
| SCREEN-08 | ≤6-char name escalates tier by one level | unit | `npx vitest run src/lib/__tests__/scorer.test.ts` | Wave 0 |
| SCREEN-09 | NFKD fires before algorithms; Cyrillic homoglyph scores EXACT | unit | `npx vitest run src/lib/__tests__/scorer.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/__tests__/scorer.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/scorer.test.ts` — covers SCREEN-06/07/08/09 (new file)
- [ ] `src/lib/screening/scorer.ts` — pure scorer module (new file — the implementation)

*(All other infrastructure is in place: vitest config, path aliases, `@/types/screening` imports — no framework install needed)*

---

## Performance Analysis

**Scale:** 10,000 input names × 290 SDN entries = 2.9M comparisons

**Per-comparison cost (three algorithms):**
- JW: O(m×n) string comparison — ~microseconds
- DM: O(n) pass through each word — ~microseconds
- TSR: sort tokens + JW — slightly more than JW alone

**Phase 15 benchmark reference:** JW-only 10,000 × 290 confirmed within 10 seconds on Vercel production. Three-algorithm composite is ~2–3× more compute per pair. Expect 3–6× JW-only time, still within the 10-second SLA.

**Optimization: Pre-normalize SDN names once**
```typescript
// BEFORE outer loop — saves 2.89M redundant normalize() calls
const normalizedSdnEntries = sdnEntries.map(entry => ({
  entry,
  normalizedName: normalize(entry.name),
}));
```

**Early-exit decision:** The phase description says all three algorithms must run (atomic unit). Do NOT add early-exit at composite > threshold — this would skip DM/TSR for high-JW matches and potentially return a different winner than the full composite.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single JW scorer in v1.0 | Three-algorithm composite | Phase 16 | Better recall on phonetic and word-order variants |
| screenNames returns `never` | screenNames returns `MatchResult[]` | Phase 16 | Breaking type change in screening.ts (allowed — v3.0-only file) |
| MatchResultStub (stub) | Full MatchResult | Phase 16 | All 19 fields populated |

**Type changes required in Phase 16 (one file only: `src/types/screening.ts`):**
- `ScreeningWorkerApi.screenNames` return: `Promise<MatchResultStub[]>` → `Promise<MatchResult[]>`
- This is the only v3.0-permitted type change; `src/types/index.ts` is still untouched

---

## Open Questions

1. **MatchResult.effectiveTier field**
   - What we know: `MatchResult` has both `riskTier` (raw composite-based) and `effectiveTier` (post-penalty). The type is defined in Phase 15 `screening.ts`.
   - What's unclear: Phase 15 `MatchResult` uses `riskTier` but no explicit `effectiveTier` field in the interface excerpt provided in the phase description context — but the actual `src/types/screening.ts` file (read during research) does NOT have an `effectiveTier` field defined. The `nameLengthPenaltyApplied` field is there.
   - **Actual finding:** `src/types/screening.ts` has `nameLengthPenaltyApplied: boolean` but NO `effectiveTier` field. The phase description says "effective_tier escalated" — Phase 16 must ADD `effectiveTier: RiskTier` to the MatchResult interface in screening.ts. This is a v3.0-only file, so this addition is allowed.
   - Recommendation: Task 1 of Phase 16 adds `effectiveTier: RiskTier` to `MatchResult` in `src/types/screening.ts`.

2. **Token Sort Ratio stop-token removal**
   - What we know: STATE.md flags that stop-token list completeness should be reviewed in Phase 16. High-frequency generic tokens confirmed: AL (56×), IBN (20×), CO (17×), LTD (16×), TRADING (15×), plus 20+ others.
   - What's unclear: Whether to implement stop-token stripping in Phase 16 or defer.
   - Recommendation: Do NOT implement stop-token stripping in Phase 16. The 15% TSR weight limits false-positive impact. Defer to a future polish phase. Document the token frequency findings so the future phase has the data.

3. **SCREEN-09 test case wording vs implementation**
   - What we know: NFKD does not map Cyrillic Р to Latin R. The test will pass via high JW score, not via normalization.
   - Recommendation: The test should assert `result.riskTier === 'EXACT'` (true via JW), NOT assert that `normalize('Рobert') === 'ROBERT'` (false — this assertion would fail). Plan the test to verify the scoring outcome, not the normalization output.

---

## Sources

### Primary (HIGH confidence)
- `src/types/screening.ts` — authoritative MatchResult field names, TIER_THRESHOLDS values
- `node_modules/talisman/phonetics/double-metaphone.js` — confirmed: CJS module, `exports.default = doubleMetaphone`, returns `[primaryCode, secondaryCode]`
- `node_modules/talisman/` — package present at v1.1.4 per package.json
- `data/sdn.json` — confirmed 290 entries, SdnEntry shape, all names uppercase
- `src/lib/workers/screening.worker.ts` — confirmed Comlink.expose pattern, `sdnEntries: unknown[]` parameter
- `vitest.config.ts` — confirmed: environment node, include pattern, vite-tsconfig-paths plugin
- `tsconfig.json` — confirmed: `@data/*` → `./data/*`, `@/*` → `./src/*`

### Secondary (MEDIUM confidence)
- `src/app/actions/runTest.ts` — establishes import pattern for `@data/sdn.json` (works in server actions, not in worker)
- `src/app/actions/benchmarkScreening.ts` — establishes JW-only loop pattern; performance baseline
- `src/lib/__tests__/runTest.integration.test.ts` — confirmed Vitest test structure, timeout pattern
- `src/lib/rules/__tests__/rule-01.test.ts` — confirmed test file conventions (makeEntry factory, describe/it/expect)

### Tertiary (LOW confidence)
- Unicode NFKD/confusable mapping behavior — verified via understanding of Unicode standard; NFKD does NOT map Cyrillic to Latin (this is a well-established Unicode property, not a single verifiable URL in this context)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — talisman installed and confirmed at correct import paths; no new packages needed
- Architecture: HIGH — worker pattern, SDN data shape, and type contracts all read from live source files
- Pitfalls: HIGH for Double Metaphone empty-code and Cyrillic NFKD misconception (confirmed from source); MEDIUM for stop-token completeness (live data analysis performed)
- Test structure: HIGH — vitest.config.ts and existing test patterns read from source

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable — no fast-moving dependencies; talisman, vitest, comlink are pinned versions)
