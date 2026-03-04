# Phase 3: Transformation Engine - Research

**Researched:** 2026-03-04
**Domain:** Pure TypeScript string transformation — Unicode text processing, multi-script name degradation, Vitest test framework
**Confidence:** HIGH (core patterns), MEDIUM (Vitest 4 config specifics — latest major version released Oct 2025)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Rule functions return `null` when the rule is not applicable to the entry's script/region (engine skips that pair, no row generated)
- Rule function signature: `(entry: SdnEntry) => string | null`
- Vitest as test framework — `vitest.config.ts` at project root, test files in `src/lib/rules/__tests__/`
- `CANONICAL_RULE_ORDER` and `ruleMap` exported from `src/lib/rules/index.ts`
- No barrel re-exports of individual functions — consumers use `ruleMap[ruleId](entry)`
- RULE-07 phonetic lookup: Arabic + Russian variants (specific names listed in CONTEXT.md)
- RULE-10 alias: Arabic given names only — Mohammed variants + 5 more (listed in CONTEXT.md)
- RULE-04 word reorder: left-rotate by 1 — deterministic, no random seed
- RULE-05 abbreviation: vowel-drop on transliterated tokens; preserve ibn/bint/AL- connectors
- RULE-06 truncation: drop the LAST token; single-token names return null
- RULE-09 prefix/suffix: specific tables — Prefix: Mr, Mrs, Dr, Prof, Sheikh, Sheikha, Imam, Haji, Hajj; Suffix: Jr, Sr, II, III, IV, PhD, MD
- Script applicability matrix is locked (see CONTEXT.md for full table)
- `src/lib/sampler.ts` — pure function `sampleEntries(data: SdnEntry[], params: RunParams): SdnEntry[]`, seeded, filters by regions + entityCounts

### Claude's Discretion
- None explicitly listed — all major decisions are locked.

### Deferred Ideas (OUT OF SCOPE)
- Russian diminutives in RULE-10 (Aleksandr/Sasha/Shura) — v2
- CJK romanization variants in RULE-10 (Zheng/Cheng) — v2
- Compound/chained degradations — v2 (ANAL-02)
- Rule severity ratings — v2 (ANAL-04)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RULE-01 | Space removal / insertion (`AL QAEDA` → `ALQAEDA`) | String split/join; applies to all regions |
| RULE-02 | Character substitution — OCR/leet (`O`→`0`, `I`→`1`, `S`→`5`, `A`→`@`) | Map-based character replacement; applies to all regions |
| RULE-03 | Diacritic removal (`Müller` → `Muller`) | NFD decomposition + combining mark strip; latin + cyrillic only |
| RULE-04 | Word reordering — left-rotate by 1 | Array rotation; null if fewer than 2 tokens; all regions |
| RULE-05 | Abbreviation — vowel-drop on transliterated tokens | Regex vowel strip; preserve ibn/bint/AL- connectors; arabic + cyrillic + latin |
| RULE-06 | Truncation — drop last token | Pop last token; null if single-token; all regions |
| RULE-07 | Phonetic / transliteration variants lookup | Map<string, string[]> keyed on canonical form; arabic + cyrillic only |
| RULE-08 | Punctuation insertion / removal | Regex strip non-word chars; all regions |
| RULE-09 | Prefix / suffix removal | Exact-match lookup tables at string boundaries; all regions |
| RULE-10 | Nickname / alias substitution | Alias Map<string, string[]> for Arabic given names; arabic only |
</phase_requirements>

---

## Summary

Phase 3 is a pure logic phase — no UI, no server, no data fetching. The ten degradation rule functions are standalone TypeScript modules that accept an `SdnEntry` and return a string or null. All complexity is string transformation, and all data is already in memory. This is the simplest phase architecturally, but the most dense in business logic.

The key implementation challenge is script-awareness: rules must detect applicable vs. inapplicable inputs and return null cleanly. The synthetic data is all-caps transliterated ASCII (the dataset has zero diacritics or non-Latin characters — all names are stored in their romanized forms). This simplifies RULE-03 (no diacritics present to remove in the test data) and means Arabic/Cyrillic entry names are already in Latin script. The rules operate on the `region` field to determine applicability, not on actual Unicode character content.

Vitest 4.0.18 is the current stable version (released October 2025). It requires Vite >= 6.0.0. Since Vite is not currently installed in this project (Next.js 16 uses its own bundler), Vite must be added as a dev dependency. The recommended install is `vitest@^4` + `@vitest/coverage-v8@^4` + `vite@^6` + `vite-tsconfig-paths`. No React or jsdom plugins are needed since all rule functions are pure Node.js logic — `environment: 'node'` is sufficient.

**Primary recommendation:** Implement all 10 rules as straight-line string transforms operating on the ASCII transliterated `entry.name` field. Use `entry.region` for all applicability checks. Install Vitest 4 with Vite 6. Keep each rule file under 50 lines.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^4.0.18 | Test runner — ESM-native, no babel transform, fast | Official Next.js recommendation; zero-config TypeScript |
| @vitest/coverage-v8 | ^4.0.18 | Coverage via V8 (same major as vitest) | Must match vitest major version exactly |
| vite | ^6.0.0 | Vitest peer dependency | Vitest 4 requires Vite 6 minimum |
| vite-tsconfig-paths | ^5.x | Resolves `@/*` and `@data/*` aliases in tests | Without this, `import { SdnEntry } from '@/types'` fails in test files |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none additional) | — | — | All rule logic uses built-in JS string APIs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vite-tsconfig-paths | Manual `resolve.alias` in vitest.config.ts | vite-tsconfig-paths reads tsconfig automatically; manual aliases require duplicating every path entry |
| @vitest/coverage-v8 | @vitest/coverage-istanbul | V8 is faster, no extra instrumentation transform; Istanbul is more accurate for complex branching but overkill here |
| Vitest 4 | Vitest 3 | Vitest 3 is no longer the current stable; Vitest 4 requires Vite 6 but that is a dev-time dependency only |

**Installation:**
```bash
npm install -D vitest@^4 @vitest/coverage-v8@^4 vite@^6 vite-tsconfig-paths
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/lib/rules/
├── space-removal.ts        # RULE-01
├── char-substitution.ts    # RULE-02
├── diacritic.ts            # RULE-03
├── word-reorder.ts         # RULE-04
├── abbreviation.ts         # RULE-05
├── truncation.ts           # RULE-06
├── phonetic.ts             # RULE-07  (contains lookup Map)
├── punctuation.ts          # RULE-08
├── prefix-suffix.ts        # RULE-09  (contains prefix/suffix tables)
├── alias.ts                # RULE-10  (contains alias Map)
└── index.ts                # CANONICAL_RULE_ORDER, RULE_LABELS, ruleMap

src/lib/rules/__tests__/
├── rule-01.test.ts
├── rule-02.test.ts
├── rule-03.test.ts
├── rule-04.test.ts
├── rule-05.test.ts
├── rule-06.test.ts
├── rule-07.test.ts
├── rule-08.test.ts
├── rule-09.test.ts
└── rule-10.test.ts

src/lib/
└── sampler.ts              # sampleEntries() — seeded random sampling

vitest.config.ts            # At project root
```

### Pattern 1: Rule Function Signature
**What:** Each rule file exports a single named function matching `RuleFunction = (entry: SdnEntry) => string | null`
**When to use:** Universal — every rule file follows this pattern
**Example:**
```typescript
// src/lib/rules/space-removal.ts
// Applicable regions: all
// RULE-01: Remove all spaces from the name

import type { SdnEntry } from '@/types';

export function spaceRemoval(entry: SdnEntry): string | null {
  const result = entry.name.replace(/\s+/g, '');
  // Guard: if result equals input (no spaces existed), still return it
  // Space removal always produces a different result if spaces exist
  return result === entry.name ? null : result;
}
```

### Pattern 2: Null Guard for Inapplicable Script
**What:** Check `entry.region` first; return null immediately if rule does not apply
**When to use:** RULE-03 (latin+cyrillic only), RULE-05 (arabic+cyrillic+latin), RULE-07 (arabic+cyrillic), RULE-10 (arabic only)
**Example:**
```typescript
// src/lib/rules/diacritic.ts
// Applicable regions: latin, cyrillic
// RULE-03: Remove diacritics via NFD decomposition

import type { SdnEntry } from '@/types';

const APPLICABLE: ReadonlySet<string> = new Set(['latin', 'cyrillic']);

export function diacritic(entry: SdnEntry): string | null {
  if (!APPLICABLE.has(entry.region)) return null;
  const result = entry.name
    .normalize('NFD')
    .replace(/\p{M}/gu, '');           // strip all combining marks
  return result === entry.name ? null : result;
}
```

### Pattern 3: Lookup Table Rule (RULE-07 and RULE-10)
**What:** Canonical form as Map key, variants as sorted string array; pick first match
**When to use:** RULE-07 phonetic variants, RULE-10 alias substitution
**Example:**
```typescript
// src/lib/rules/phonetic.ts
// Applicable regions: arabic, cyrillic

import type { SdnEntry } from '@/types';

// Key = canonical spelling (uppercase); Value = sorted alternate spellings
const PHONETIC_MAP = new Map<string, string[]>([
  ['OSAMA',  ['USAMAH', 'USAMA']],   // sorted alphabetically
  ['OMAR',   ['OMR', 'UMAR']],
  // ... (full table in implementation)
]);

const APPLICABLE: ReadonlySet<string> = new Set(['arabic', 'cyrillic']);

export function phonetic(entry: SdnEntry): string | null {
  if (!APPLICABLE.has(entry.region)) return null;
  const tokens = entry.name.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].replace(/-/g, ''); // strip hyphen for lookup
    const variants = PHONETIC_MAP.get(token);
    if (variants && variants.length > 0) {
      const replacement = variants[0]; // deterministic: sorted, pick index 0
      const newTokens = [...tokens];
      newTokens[i] = replacement;
      return newTokens.join(' ');
    }
  }
  return null; // no matching token found
}
```

### Pattern 4: Index Barrel (no re-export of individual functions)
**What:** Consumers import through `ruleMap[ruleId](entry)` — not individual named imports
**When to use:** Always — do not export individual rule functions from index.ts
**Example:**
```typescript
// src/lib/rules/index.ts

import type { SdnEntry } from '@/types';
import { spaceRemoval } from './space-removal';
import { charSubstitution } from './char-substitution';
// ... all 10 imports

export type RuleId =
  | 'space-removal' | 'char-substitution' | 'diacritic' | 'word-reorder'
  | 'abbreviation' | 'truncation' | 'phonetic' | 'punctuation'
  | 'prefix-suffix' | 'alias';

export type RuleFunction = (entry: SdnEntry) => string | null;

export const CANONICAL_RULE_ORDER: RuleId[] = [
  'space-removal', 'char-substitution', 'diacritic', 'word-reorder',
  'abbreviation', 'truncation', 'phonetic', 'punctuation',
  'prefix-suffix', 'alias',
];

export const RULE_LABELS: Record<RuleId, string> = {
  'space-removal':    'Space Removal',
  'char-substitution': 'OCR/Leet Substitution',
  'diacritic':        'Diacritic Removal',
  'word-reorder':     'Word Reorder',
  'abbreviation':     'Abbreviation',
  'truncation':       'Truncation',
  'phonetic':         'Phonetic Variant',
  'punctuation':      'Punctuation',
  'prefix-suffix':    'Prefix/Suffix Removal',
  'alias':            'Alias Substitution',
};

export const ruleMap: Record<RuleId, RuleFunction> = {
  'space-removal':    spaceRemoval,
  'char-substitution': charSubstitution,
  // ...
};
```

### Pattern 5: Seeded Sampler (no external library needed)
**What:** Mulberry32 PRNG implemented as a 5-line pure function — no npm dependency required
**When to use:** `sampleEntries()` in sampler.ts
**Example:**
```typescript
// src/lib/sampler.ts

import type { SdnEntry, RunParams } from '@/types';

/** Mulberry32 — 32-bit seeded PRNG. Returns a function returning floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleEntries(
  data: SdnEntry[],
  params: RunParams,
  seed = 42,
): SdnEntry[] {
  const rand = mulberry32(seed);
  const result: SdnEntry[] = [];
  const entityTypes = Object.keys(params.entityCounts) as Array<keyof typeof params.entityCounts>;
  for (const entityType of entityTypes) {
    const count = params.entityCounts[entityType];
    if (count === 0) continue;
    const pool = data.filter(
      (e) => e.entityType === entityType && params.regions.includes(e.region),
    );
    if (pool.length === 0) continue;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rand() * pool.length);
      result.push(pool[idx]); // sampling with replacement
    }
  }
  return result;
}
```

### Anti-Patterns to Avoid
- **Returning entry.name unchanged:** If a rule cannot meaningfully transform the input, return `null`. Never return the original string — that inflates catch rate to 1.0.
- **Using `Math.random()` in sampler:** The sampler must be deterministic; use Mulberry32 with a fixed seed.
- **Default exports:** The project convention is named exports only. Each rule file: `export function ruleName(...)`.
- **Using entry.name character content to determine script:** All names in sdn.json are romanized ASCII. Use `entry.region` field exclusively for script-applicability checks.
- **Re-exporting individual rule functions from index.ts:** Only `ruleMap`, `CANONICAL_RULE_ORDER`, and `RULE_LABELS` are exported from index.ts.
- **Mutating the tokens array in-place:** Always create a new array (spread operator) to avoid shared-reference bugs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Seeded PRNG | Custom LCG or depend on a library | Mulberry32 inline (5 lines) | Mulberry32 is well-characterized, no npm dependency needed, TypeScript-safe |
| Path alias resolution in tests | Manual `resolve.alias` entries in vitest.config | `vite-tsconfig-paths` plugin | tsconfig already has paths; plugin reads them automatically, stays in sync |
| Arabic diacritic (tashkeel) removal | Custom Unicode range regex | `normalize('NFD').replace(/\p{M}/gu, '')` | The `\p{M}` Unicode property class catches all combining marks across all scripts with the `u` flag |
| Phonetic lookup | Levenshtein/soundex algorithm | Static `Map<string, string[]>` | Domain-specific OFAC name variants cannot be algorithmically derived; the compliance value comes from the curated list |

**Key insight:** All 10 rules are 10–50 lines of string manipulation. The complexity budget belongs to correctness (edge cases) and test coverage, not architectural patterns.

---

## Common Pitfalls

### Pitfall 1: The Data Is All Romanized ASCII — No Raw Unicode Content
**What goes wrong:** Developer checks for Arabic Unicode codepoints (`\u0600-\u06FF`) or Cyrillic codepoints (`\u0400-\u04FF`) in the name string to determine script, finds none, and concludes the rule should always return null.
**Why it happens:** `sdn.json` stores all names as transliterated uppercase ASCII (e.g., `"HASSAN IBN ALI AL-RASHIDI"`, not Arabic script). The region field is the only reliable signal.
**How to avoid:** Always use `entry.region` for script checks. Never inspect character codepoints.
**Warning signs:** If your `diacritic` rule returns null for every entry (dataset has zero pre-existing diacritics), that is correct behavior for the current dataset, but the rule should still produce output for synthetic diacritic test fixtures.

### Pitfall 2: RULE-03 Diacritic — NFD Covers Latin Combining Marks, Not Cyrillic Inherently
**What goes wrong:** Developer expects `normalize('NFD')` to decompose Cyrillic characters like `Ё` (U+0401) into a base + combining mark. In practice, `Ё` does NOT decompose under NFD — it remains a single codepoint. Only some Cyrillic characters with diacritics (rare) decompose.
**Why it happens:** Most standard Cyrillic letters are precomposed forms that have no NFD decomposition in Unicode.
**How to avoid:** For `cyrillic` region in this project, RULE-03 will typically return `null` because the names in the dataset are already Latin-script transliterations. The rule is still marked applicable to `cyrillic` to handle future data. In tests, use a Latin fixture with actual diacritics (`Müller`, `José`) to verify the function.
**Warning signs:** Test expects `IGOR VLADIMIROVICH PETROV` → diacritic result, but the name has no diacritics → correctly returns null.

### Pitfall 3: RULE-05 Vowel-Drop — Define Vowels Precisely
**What goes wrong:** Stripping vowels from `IBN` produces `BN`, from `AL-RASHIDI` produces `L-RSHD`. The connectors and nisba prefix become unrecognizable.
**Why it happens:** A blanket vowel regex applied to every token breaks the semantic value of preserved connectors.
**How to avoid:** Split into tokens first. Apply vowel-drop only to tokens that are NOT in a protected set. Protected tokens: `{'IBN', 'BINT', 'BIN', 'BT', 'ABU', 'ABI', 'UMM'}`. For tokens starting with `AL-` (nisba prefix), preserve the `AL-` and strip vowels only from the part after the hyphen: `AL-RASHIDI` → `AL-RSHD`. Vowels to strip (from transliterated names): `A`, `E`, `I`, `O`, `U`.
**Warning signs:** Output contains `BN` or `L-` — connectors are being stripped.

### Pitfall 4: RULE-04 Word Reorder — Single-Token Edge Case (Aircraft and Some Vessels)
**What goes wrong:** Left-rotating a single-element array produces the same array. The function returns the unchanged original name, inflating catch rate.
**Why it happens:** 19 entries in the dataset are single-token names (aircraft tail numbers like `EP-TQA`, single-word vessels like `FAJR`). These all have `name.split(' ').length === 1`.
**How to avoid:** Explicitly check `tokens.length < 2` and return `null`.
**Warning signs:** Output equals input for aircraft entries.

### Pitfall 5: RULE-07 Phonetic — Lookup on Token Without Hyphen Prefix
**What goes wrong:** Searching `AL-RASHIDI` as a full string in the phonetic map finds nothing, even if `RASHIDI` has a variant.
**Why it happens:** The nisba prefix `AL-` is prepended to the base name. The phonetic table keys are the base names.
**How to avoid:** Strip the `AL-` prefix before looking up in the map. If a variant is found, reconstruct with `AL-` prepended.
**Warning signs:** No Arabic multi-token names ever match the phonetic rule despite having covered base names.

### Pitfall 6: Vitest 4 Requires Vite 6 — Not Currently Installed
**What goes wrong:** Running `npm install -D vitest @vitest/coverage-v8` without explicitly adding `vite@^6` may resolve to Vite 5 (Vitest's minimum peer dependency is Vite 5.x in older releases) or cause a peer dependency conflict.
**Why it happens:** Vite is not currently in the project's dependencies. npm will resolve the minimum compatible version.
**How to avoid:** Install all four packages together in one command: `npm install -D vitest@^4 @vitest/coverage-v8@^4 vite@^6 vite-tsconfig-paths`. Pin the Vite major to 6 explicitly.
**Warning signs:** `peer dependency` warnings during install; or `Error: Vitest requires Vite@^6.0.0`.

### Pitfall 7: Path Aliases Fail in Tests Without vite-tsconfig-paths
**What goes wrong:** Test files import `import type { SdnEntry } from '@/types'` and Vitest throws `Cannot find module '@/types'`.
**Why it happens:** Vitest runs via Vite, which does not automatically read `tsconfig.json` path mappings. Next.js sets up these aliases separately for the Next.js build pipeline.
**How to avoid:** Add `vite-tsconfig-paths` to vitest.config.ts plugins. This plugin reads `tsconfig.json` and maps all `paths` entries into Vite's resolve layer.

### Pitfall 8: `noUnusedLocals` / `noUnusedParameters` — Strict TypeScript in Tests
**What goes wrong:** The project tsconfig has `noUnusedLocals: true` and `noUnusedParameters: true`. If a test callback receives a context parameter it doesn't use, TypeScript errors out.
**Why it happens:** TypeScript's strict flags apply to all `.ts` files including test files unless excluded.
**How to avoid:** Prefix unused parameters with `_` (e.g., `_ctx`) — TypeScript ignores parameters starting with underscore. Alternatively, create a `tsconfig.test.json` that extends root config with those two flags disabled. Since the rule functions are pure and tests are simple, this is unlikely to be a real problem in practice.

### Pitfall 9: RULE-09 Prefix/Suffix — Prefix/Suffix Not Present in Current Dataset
**What goes wrong:** Developer writes tests that expect prefix removal to produce different output, but no entries in `sdn.json` start with `Mr`, `Dr`, etc.
**Why it happens:** The synthetic dataset does not include honorific prefixes — they are real-world OFAC data patterns.
**How to avoid:** The rule is still valid and must be implemented. Tests must use synthetic fixture strings (not entries from `sdn.json`) to cover the positive case: `entry.name = 'DR CARLOS RODRIGUEZ'` → `'CARLOS RODRIGUEZ'`. The inapplicable test is simply a name with no recognized prefix.

---

## Code Examples

Verified patterns for this phase:

### Vitest Configuration (vitest.config.ts at project root)
```typescript
// Source: https://vitest.dev/config/ + https://vitest.dev/guide/
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/rules/**', 'src/lib/sampler.ts'],
    },
  },
});
```

### Test File Pattern — Pure Function
```typescript
// src/lib/rules/__tests__/rule-01.test.ts
import { describe, it, expect } from 'vitest';
import { spaceRemoval } from '../space-removal';
import type { SdnEntry } from '@/types';

const makeEntry = (name: string, region: SdnEntry['region'] = 'arabic'): SdnEntry => ({
  id: 'test-001',
  name,
  entityType: 'individual',
  region,
});

describe('spaceRemoval (RULE-01)', () => {
  it('removes spaces from multi-token Arabic name', () => {
    const result = spaceRemoval(makeEntry('AL QAEDA'));
    expect(result).toBe('ALQAEDA');
  });

  it('removes spaces from CJK name', () => {
    const result = spaceRemoval(makeEntry('ZHANG WEI', 'cjk'));
    expect(result).toBe('ZHANGWEI');
  });

  it('returns null for single-token name (no spaces to remove)', () => {
    const result = spaceRemoval(makeEntry('FAJR'));
    expect(result).toBeNull();
  });
});
```

### NFD Diacritic Removal
```typescript
// Source: MDN Web Docs — String.prototype.normalize()
// Using Unicode property escapes (\p{M}) with u flag — more robust than fixed range
const removeDiacritics = (s: string): string =>
  s.normalize('NFD').replace(/\p{M}/gu, '');

// Examples:
// 'Müller' → 'Muller'
// 'José'   → 'Jose'
// 'HASSAN' → 'HASSAN' (no change — correctly returns original)
```

### RULE-02 OCR/Leet Substitution Map
```typescript
// Character substitution table for OCR/leet transforms
const CHAR_MAP: ReadonlyMap<string, string> = new Map([
  ['O', '0'],
  ['I', '1'],
  ['L', '1'],
  ['E', '3'],
  ['A', '@'],
  ['S', '5'],
  ['B', '8'],
  ['G', '9'],
  ['T', '7'],
]);

// Apply: iterate character by character, replace if in map
const applyCharSub = (name: string): string =>
  [...name].map((ch) => CHAR_MAP.get(ch) ?? ch).join('');
```

### RULE-05 Vowel-Drop With Connector Preservation
```typescript
const VOWELS = /[AEIOU]/g;

// Tokens that must NOT have vowels stripped
const CONNECTORS = new Set(['IBN', 'BINT', 'BIN', 'BT', 'ABU', 'ABI', 'UMM']);

const dropVowels = (token: string): string => {
  // Handle AL-XXXX nisba form: preserve AL-, strip vowels from suffix
  if (token.startsWith('AL-')) {
    const suffix = token.slice(3).replace(VOWELS, '');
    return suffix.length > 0 ? `AL-${suffix}` : token; // don't produce 'AL-'
  }
  if (CONNECTORS.has(token)) return token;
  const stripped = token.replace(VOWELS, '');
  // Don't return empty string (e.g., single-vowel tokens)
  return stripped.length > 0 ? stripped : token;
};
```

### RULE-08 Punctuation Insert/Remove
```typescript
// Remove: strip all punctuation (hyphens, periods, slashes)
const removePunctuation = (name: string): string =>
  name.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

// Insert: add hyphen between first and second token
const insertHyphen = (name: string): string => {
  const tokens = name.split(/\s+/);
  if (tokens.length < 2) return name;
  return `${tokens[0]}-${tokens.slice(1).join(' ')}`;
};
// RULE-08 should pick one transform — removal is higher demo value
// Return null if name has no punctuation to remove
```

### Sampler — Mulberry32 PRNG
```typescript
// Source: https://github.com/cprosche/mulberry32 (public domain algorithm)
// No npm package needed — 5-line implementation
function mulberry32(seed: number): () => number {
  let s = seed;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

---

## Implementation Notes Per Rule

Concrete guidance for each of the 10 rules, including edge cases specific to the `sdn.json` dataset.

### RULE-01: Space Removal
- Input: `"HASSAN IBN ALI AL-RASHIDI"` → `"HASSANIBNAIAL-RASHIDI"`
- Note: the hyphen in `AL-` is NOT a space — it survives space removal
- Guard: if `name.indexOf(' ') === -1` the name has no spaces; return `null`
- Aircraft tail numbers (single token, no spaces) → `null`
- Applies to all regions

### RULE-02: Character Substitution
- Apply to the entire name string character by character
- All entries are uppercase ASCII — no case handling needed
- Guard: if no character in the name is in `CHAR_MAP`, return `null`
- `'ZHANG WEI'` → `'ZH@NG W31'` (A→@, I→1, E→3)
- Applies to all regions

### RULE-03: Diacritic Removal
- Dataset has ZERO pre-existing diacritics — every real entry will return `null`
- Test using synthetic fixtures with diacritics: `"MÜLLER"`, `"JOSÉ FERNANDEZ"`
- Applicable regions: `latin`, `cyrillic` only
- Implementation: `normalize('NFD').replace(/\p{M}/gu, '')`
- CJK and Arabic entries → `null` by region check

### RULE-04: Word Reorder (Left-Rotate by 1)
- `['A', 'B', 'C', 'D']` → `['B', 'C', 'D', 'A']`
- Implementation: `[...tokens.slice(1), tokens[0]].join(' ')`
- Guard: `tokens.length < 2` → return `null`
- 19 single-token entries in dataset will return `null` (aircraft + some vessels)
- Two-token names: `'ZHANG WEI'` → `'WEI ZHANG'`
- Applies to all regions

### RULE-05: Abbreviation (Vowel-Drop)
- Input: `"HASSAN IBN ALI AL-RASHIDI"` → `"HSSN IBN L AL-RSHD"`
- Connector tokens (`IBN`, `BINT`, `BIN`, `BT`, `ABU`, `ABI`, `UMM`) are preserved verbatim
- `AL-` prefix: preserved; only the nisba suffix loses vowels (`AL-RASHIDI` → `AL-RSHD`)
- Single-letter tokens after stripping become empty string → preserve original token
- Guard: if output equals input (all tokens were connectors or single-consonants), return `null`
- Applicable regions: `arabic`, `cyrillic`, `latin`
- CJK entries → `null` by region check

### RULE-06: Truncation (Drop Last Token)
- `"HASSAN IBN ALI AL-RASHIDI"` → `"HASSAN IBN ALI"`
- Implementation: `tokens.slice(0, -1).join(' ')`
- Guard: `tokens.length < 2` → return `null`
- Same 19 single-token entries as RULE-04 → `null`
- Applies to all regions

### RULE-07: Phonetic Variants (Arabic + Cyrillic only)
- Lookup: split `entry.name` into space-separated tokens, check each token against `PHONETIC_MAP`
- For each token, strip `AL-` prefix before looking up; reconstitute with prefix after
- Apply first match found (left-to-right), pick `variants[0]` (alphabetically sorted)
- Return the modified name with ONE token replaced
- If no token matches any key in `PHONETIC_MAP`, return `null`
- The 12 Arabic canonical forms and 7 Russian canonical forms from CONTEXT.md are the complete table for v1
- Latin and CJK entries → `null` by region check

**RULE-07 Lookup Map Structure:**
```typescript
// Key: canonical uppercase form
// Value: sorted alternative spellings (index 0 = first alternative to apply)
const PHONETIC_MAP = new Map<string, string[]>([
  ['OSAMA',     ['USAMAH', 'USAMA']],
  ['OMAR',      ['OMR', 'UMAR']],
  ['QADDAFI',   ['GADDAFI', 'KADAFI', 'KADHAFI', 'QADHAFI']],
  ['AHMAD',     ['AHAMED', 'AHMED']],
  ['KHALID',    ['KHAALID', 'KHALED']],
  ['HASSAN',    ['HASAN', 'HASSAAN']],
  ['IBRAHIM',   ['EBRAHIM', 'IBRAAHIM']],
  ['YUSUF',     ['JOSEF', 'YOUSEF']],
  ['MUSTAFA',   ['MOSTAFA', 'MUSTAPHA']],
  ['TARIQ',     ['TAREK', 'TARIK']],
  ['BILAL',     ['BELAL', 'BILAAL']],
  ['SALEH',     ['SALAH', 'SALIH']],
  // Russian
  ['ALEKSANDR', ['ALEKSANDER', 'ALEXANDER', 'ALEXANDRE']],
  ['YULIYA',    ['JULIA', 'YULIA']],
  ['PYOTR',     ['PETER', 'PIOTR']],
  ['DMITRY',    ['DMITRI', 'DMITRIY', 'DMYTRO']],
  ['MIKHAIL',   ['MICHAEL', 'MIKHAEL']],
  ['NIKOLAI',   ['NIKOLAOS', 'NIKOLAY']],
  ['SERGEI',    ['SERGEY', 'SERGII']],
]);
```

### RULE-08: Punctuation Insert / Remove
- Dataset: 48 Arabic entries and many business entries contain hyphens (`AL-NOOR`, `AL-RASHIDI`)
- Primary transform: remove all punctuation (`/[^\w\s]/g` → `''`), then collapse double spaces
- `"AL-NOOR TRADING LLC"` → `"ALNOOR TRADING LLC"`
- `"AL-RASHIDI"` → `"ALRASHIDI"`
- Guard: if name has no punctuation characters (i.e., `name === removePunctuation(name)`), return `null`
- Do NOT also apply insertion in the same call — pick removal only for v1
- Applies to all regions

### RULE-09: Prefix / Suffix Removal
- Zero entries in current `sdn.json` have honorific prefixes — all real entries return `null`
- Tests MUST use synthetic fixture strings: `entry.name = 'DR CARLOS RODRIGUEZ'`
- Prefix table (case-insensitive match at string start): `Mr`, `Mrs`, `Dr`, `Prof`, `Sheikh`, `Sheikha`, `Imam`, `Haji`, `Hajj`
- Suffix table (case-insensitive match at string end): `Jr`, `Sr`, `II`, `III`, `IV`, `PhD`, `MD`
- Implementation: split into tokens, check first token against prefix set and last token against suffix set; strip if found, rejoin
- Guard: if neither prefix nor suffix found → return `null`
- Applies to all regions

### RULE-10: Alias Substitution (Arabic only)
- Lookup structure: same pattern as RULE-07 — `Map<string, string[]>`
- Applied to first token (given name) of the entry name
- Exception: if first token is a connector (`ABU`, `ABD`, `AL`), check second token
- Guard: no match found → return `null`
- All Arabic variants → null by region check for non-arabic entries

**RULE-10 Alias Map:**
```typescript
const ALIAS_MAP = new Map<string, string[]>([
  ['MOHAMMED',  ['MOHAMAD', 'MOHAMMAD', 'MOHAMED', 'MUHAMMAD', 'MUHAMMED', 'MUHAMAD']],
  ['ALI',       ['ALEE', 'ALY']],
  ['HASSAN',    ['HASAN']],
  ['HUSSEIN',   ['HOSSEIN', 'HUSAYN', 'HUSSAIN']],
  ['ABDULLAH',  ['ABDALLAH', 'ABDULAH']],
  ['ABDUL',     ['ABD AL']],
]);
// Pick variants[0] (alphabetically sorted) as the first alternative
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest for Next.js testing | Vitest 4 | 2023-2025 | Native ESM, no babel transform, 2-5x faster |
| `/[\u0300-\u036f]/g` for combining marks | `/\p{M}/gu` Unicode property escapes | ES2018 `u` flag | More complete — catches combining marks outside the BCD range |
| `Math.random()` for test sampling | Seeded PRNG (Mulberry32) | — | Reproducible test fixtures |
| Separate Jest/Babel transform config | `vitest.config.ts` unified with Vite | Vitest 1.x+ | Single config file, no babel transform step |

**Deprecated/outdated:**
- `@vitest/ui` is optional — not needed for CI or this phase
- `@vitejs/plugin-react` is NOT needed for pure Node.js logic tests (no JSX)
- `jsdom` environment is NOT needed — `environment: 'node'` is correct for pure functions

---

## Open Questions

1. **RULE-02 — Which direction for char substitution?**
   - What we know: substitution from clean → leet (O→0) is the evasion direction
   - What's unclear: should the rule also work in reverse (leet → clean)? CONTEXT.md says "OCR/leet variants" but only gives one direction
   - Recommendation: implement O→0 direction (clean→leet) as that is the evasion scenario; reverse is Phase 4+ concern

2. **RULE-08 — Insert or remove, or both?**
   - What we know: CONTEXT.md example shows both `Al-Qaeda → Al Qaeda` (removal) and `Al Qaeda → AlQaeda` (combination)
   - What's unclear: should a single rule application do both, or pick one?
   - Recommendation: implement punctuation REMOVAL only (one deterministic transform per rule call). Insertion can be a second pass if needed in Phase 4.

3. **Vitest 4 + Vite 6 peer conflict check**
   - What we know: project uses Next.js 16.1.6, no Vite currently installed
   - What's unclear: whether Next.js 16 has any Vite in its dependency tree that could conflict
   - Recommendation: install `vite@^6` explicitly as a dev dependency; Vite is dev-only, Next.js uses its own compiler for production

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` at project root — does NOT exist yet (Wave 0 gap) |
| Quick run command | `npx vitest run src/lib/rules/__tests__/` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RULE-01 | Space removal from multi-token name | unit | `npx vitest run src/lib/rules/__tests__/rule-01.test.ts` | Wave 0 |
| RULE-02 | OCR/leet char substitution | unit | `npx vitest run src/lib/rules/__tests__/rule-02.test.ts` | Wave 0 |
| RULE-03 | Diacritic removal via NFD | unit | `npx vitest run src/lib/rules/__tests__/rule-03.test.ts` | Wave 0 |
| RULE-04 | Word reorder left-rotate; null for single token | unit | `npx vitest run src/lib/rules/__tests__/rule-04.test.ts` | Wave 0 |
| RULE-05 | Vowel-drop; connectors preserved; AL- preserved | unit | `npx vitest run src/lib/rules/__tests__/rule-05.test.ts` | Wave 0 |
| RULE-06 | Last token dropped; null for single token | unit | `npx vitest run src/lib/rules/__tests__/rule-06.test.ts` | Wave 0 |
| RULE-07 | Phonetic lookup match; null when no match | unit | `npx vitest run src/lib/rules/__tests__/rule-07.test.ts` | Wave 0 |
| RULE-08 | Punctuation removed; null when no punctuation | unit | `npx vitest run src/lib/rules/__tests__/rule-08.test.ts` | Wave 0 |
| RULE-09 | Prefix/suffix stripped; null when absent | unit | `npx vitest run src/lib/rules/__tests__/rule-09.test.ts` | Wave 0 |
| RULE-10 | Alias substitution; arabic only; null when no match | unit | `npx vitest run src/lib/rules/__tests__/rule-10.test.ts` | Wave 0 |

### Per-Test Coverage Requirements
Each of the 10 test files must cover:
1. **Latin fixture** producing expected output (or correct `null` for inapplicable rules)
2. **Multi-script fixture** (Arabic or Cyrillic based on rule's applicable regions)
3. **Inapplicable-script case** returning `null` (e.g., CJK entry for RULE-03)
4. **Edge case** specific to the rule (single-token for RULE-04/RULE-06, no-match for RULE-07/RULE-10)

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/rules/__tests__/` (the file for the rule just written)
- **Per wave merge:** `npx vitest run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Vitest configuration file at project root
- [ ] `src/lib/rules/__tests__/rule-01.test.ts` — covers RULE-01
- [ ] `src/lib/rules/__tests__/rule-02.test.ts` — covers RULE-02
- [ ] `src/lib/rules/__tests__/rule-03.test.ts` — covers RULE-03
- [ ] `src/lib/rules/__tests__/rule-04.test.ts` — covers RULE-04
- [ ] `src/lib/rules/__tests__/rule-05.test.ts` — covers RULE-05
- [ ] `src/lib/rules/__tests__/rule-06.test.ts` — covers RULE-06
- [ ] `src/lib/rules/__tests__/rule-07.test.ts` — covers RULE-07
- [ ] `src/lib/rules/__tests__/rule-08.test.ts` — covers RULE-08
- [ ] `src/lib/rules/__tests__/rule-09.test.ts` — covers RULE-09
- [ ] `src/lib/rules/__tests__/rule-10.test.ts` — covers RULE-10
- [ ] `src/lib/rules/__tests__/sampler.test.ts` — covers `sampleEntries()` determinism and distribution
- [ ] Framework install: `npm install -D vitest@^4 @vitest/coverage-v8@^4 vite@^6 vite-tsconfig-paths`
- [ ] `package.json` — add `"test": "vitest run"` and `"test:watch": "vitest"` scripts

---

## Sources

### Primary (HIGH confidence)
- MDN Web Docs — `String.prototype.normalize()` — NFD decomposition and `\p{M}` Unicode property
- Vitest official docs (vitest.dev/config/) — configuration API, include patterns, coverage
- Project `data/sdn.json` (direct inspection) — confirmed all 290 entries are romanized ASCII; 19 single-token entries; 48 Arabic entries with hyphens
- Project `tsconfig.json` (direct read) — `paths: { "@/*": ["./src/*"], "@data/*": ["./data/*"] }`, `strict: true`, `noUnusedLocals: true`

### Secondary (MEDIUM confidence)
- WebSearch: Vitest 4.0.18 is current stable (October 2025 release) — requires Vite >= 6.0.0, Node >= 20.0.0
- WebSearch: `vite-tsconfig-paths` plugin reads tsconfig paths automatically — standard solution for Vitest + Next.js path aliases
- WebSearch: Mulberry32 PRNG — well-characterized 32-bit seeded PRNG suitable for inline implementation without npm dependency
- WebSearch: Vitest 4 breaking changes — `poolMatchGlobs`/`environmentMatchGlobs` removed; no impact for this project (not using those options)

### Tertiary (LOW confidence — flag for validation)
- Claim: Cyrillic characters do not decompose via NFD (most are precomposed) — not tested against all Cyrillic codepoints; verify in implementation
- Claim: No Vite version conflict with Next.js 16 when adding `vite@^6` as dev dependency — should be verified by running `npm install` and checking for peer dependency warnings

---

## Metadata

**Confidence breakdown:**
- Standard stack (Vitest 4 + vite-tsconfig-paths): HIGH — confirmed from official docs and npm registry
- Architecture (rule function patterns, index barrel): HIGH — directly derived from locked CONTEXT.md decisions
- Data shape (romanized ASCII, 19 single-token, 48 hyphenated): HIGH — confirmed by direct file inspection
- Pitfalls: HIGH for dataset-specific (direct inspection), MEDIUM for NFD/Cyrillic (research-verified)
- RULE implementations (logic, edge cases): HIGH — deterministic string operations

**Research date:** 2026-03-04
**Valid until:** 2026-06-04 (Vitest and Vite APIs stable; Unicode string behavior does not change)
