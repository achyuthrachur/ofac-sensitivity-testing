---
phase: 03-transformation-engine
plan: "03"
subsystem: transformation-engine
tags: [rules, sampler, barrel, api, prng, tdd]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [src/lib/rules/index.ts, src/lib/sampler.ts]
  affects: [Phase 4 Server Action — imports ruleMap, CANONICAL_RULE_ORDER, sampleEntries]
tech_stack:
  added: []
  patterns: [barrel-module, seeded-prng, tdd-red-green]
key_files:
  created:
    - src/lib/rules/index.ts
    - src/lib/sampler.ts
    - src/lib/rules/__tests__/sampler.test.ts
  modified: []
decisions:
  - "CANONICAL_RULE_ORDER is the authoritative fixed sequence — Phase 4 uses this to guarantee deterministic output regardless of user checkbox order"
  - "ruleMap uses Record<RuleId, RuleFunction> so TypeScript enforces all 10 rule IDs are present at compile time"
  - "sampleEntries uses Mulberry32 inline (5 lines, no npm dep) — deterministic seeded PRNG, seed defaults to 42"
  - "Sampling WITH replacement — same entry can appear multiple times when pool is small"
  - "index.ts does NOT re-export individual rule functions — consumers always go through ruleMap[ruleId](entry)"
metrics:
  duration: "9 min"
  completed_date: "2026-03-04"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
requirements: [RULE-01, RULE-02, RULE-03, RULE-04, RULE-05, RULE-06, RULE-07, RULE-08, RULE-09, RULE-10]
---

# Phase 3 Plan 03: Public API Barrel and Sampler Summary

**One-liner:** Rules barrel (index.ts) and seeded Mulberry32 sampler (sampler.ts) providing the three Phase 4 integration points — `ruleMap`, `CANONICAL_RULE_ORDER`, and `sampleEntries`.

## What Was Built

### src/lib/rules/index.ts — Public API Barrel

The single entry point Phase 4 imports from. Internally imports all 10 rule functions and re-exposes them only through `ruleMap`. No individual rule functions are exported.

Exports:
- `RuleId` — union type of all 10 rule identifier strings
- `RuleFunction` — `(entry: SdnEntry) => string | null` function signature
- `CANONICAL_RULE_ORDER: RuleId[]` — 10-entry fixed array enforcing deterministic rule execution order
- `RULE_LABELS: Record<RuleId, string>` — human-readable display strings for UI components
- `ruleMap: Record<RuleId, RuleFunction>` — dispatch table; `ruleMap[ruleId](entry)` is the only call pattern

### src/lib/sampler.ts — Seeded Entry Sampler

Pure function with Mulberry32 PRNG. Accepts `(data: SdnEntry[], params: RunParams, seed = 42)`.

Algorithm:
1. For each entity type in fixed order `[individual, business, vessel, aircraft]`
2. Filter data by `params.regions` and current entity type to build a `pool`
3. Sample `params.entityCounts[entityType]` entries from pool WITH replacement
4. Concatenate results in entity-type order

Key properties:
- Deterministic: same seed + same params = identical result array
- Sampling with replacement: handles small pools (pool.length < requested count)
- Zero npm dependencies: Mulberry32 is 5-line inline implementation

### src/lib/rules/__tests__/sampler.test.ts — Sampler Unit Tests

5 tests covering all contracts:
1. Returns correct total count (individual:5 + business:3 = 8)
2. Returns correct entity type distribution
3. Is deterministic: same seed produces same result
4. Filters by regions: arabic-only yields only arabic entries
5. Returns empty array when all counts are zero

## Test Results

### Full Suite: npx vitest run

```
 RUN  v4.0.18

 ✓ src/lib/rules/__tests__/rule-07.test.ts (7 tests)
 ✓ src/lib/rules/__tests__/rule-05.test.ts (5 tests)
 ✓ src/lib/rules/__tests__/rule-09.test.ts (6 tests)
 ✓ src/lib/rules/__tests__/sampler.test.ts (5 tests)
 ✓ src/lib/rules/__tests__/rule-04.test.ts (5 tests)
 ✓ src/lib/rules/__tests__/rule-06.test.ts (5 tests)
 ✓ src/lib/rules/__tests__/rule-08.test.ts (5 tests)
 ✓ src/lib/rules/__tests__/rule-03.test.ts (5 tests)
 ✓ src/lib/rules/__tests__/rule-10.test.ts (6 tests)
 ✓ src/lib/rules/__tests__/rule-01.test.ts (4 tests)
 ✓ src/lib/rules/__tests__/rule-02.test.ts (4 tests)

 Test Files  11 passed (11)
       Tests  57 passed (57)
    Duration  8.32s
```

### TypeScript: npx tsc --noEmit

```
(no output — exits 0)
```

## Phase 3 Complete File Manifest

All files created across Phase 3 (Plans 01 through 03):

| File | Plan | Description |
|------|------|-------------|
| vitest.config.ts | 03-01 | Vitest 4 config with vite-tsconfig-paths |
| src/lib/rules/space-removal.ts | 03-01 | RULE-01: Remove all spaces |
| src/lib/rules/char-substitution.ts | 03-01 | RULE-02: OCR/leet char substitution |
| src/lib/rules/diacritic.ts | 03-01 | RULE-03: NFD diacritic removal (latin/cyrillic) |
| src/lib/rules/word-reorder.ts | 03-01 | RULE-04: Left-rotate tokens by 1 |
| src/lib/rules/abbreviation.ts | 03-01 | RULE-05: Vowel-drop, connector-preserving |
| src/lib/rules/__tests__/rule-01.test.ts | 03-01 | 4 tests |
| src/lib/rules/__tests__/rule-02.test.ts | 03-01 | 4 tests |
| src/lib/rules/__tests__/rule-03.test.ts | 03-01 | 5 tests |
| src/lib/rules/__tests__/rule-04.test.ts | 03-01 | 5 tests |
| src/lib/rules/__tests__/rule-05.test.ts | 03-01 | 5 tests |
| src/lib/rules/truncation.ts | 03-02 | RULE-06: Drop last token |
| src/lib/rules/phonetic.ts | 03-02 | RULE-07: Phonetic lookup (arabic/cyrillic) |
| src/lib/rules/punctuation.ts | 03-02 | RULE-08: Punctuation removal |
| src/lib/rules/prefix-suffix.ts | 03-02 | RULE-09: Prefix/suffix strip |
| src/lib/rules/alias.ts | 03-02 | RULE-10: Arabic given name aliases |
| src/lib/rules/__tests__/rule-06.test.ts | 03-02 | 5 tests |
| src/lib/rules/__tests__/rule-07.test.ts | 03-02 | 7 tests |
| src/lib/rules/__tests__/rule-08.test.ts | 03-02 | 5 tests |
| src/lib/rules/__tests__/rule-09.test.ts | 03-02 | 6 tests |
| src/lib/rules/__tests__/rule-10.test.ts | 03-02 | 6 tests |
| src/lib/rules/index.ts | 03-03 | Public API barrel (this plan) |
| src/lib/sampler.ts | 03-03 | Seeded entry sampler (this plan) |
| src/lib/rules/__tests__/sampler.test.ts | 03-03 | 5 sampler tests (this plan) |

## Integration Notes for Phase 4

Phase 4 (Server Action) imports exactly three things from Phase 3:

```typescript
import { ruleMap, CANONICAL_RULE_ORDER, RULE_LABELS } from '@/lib/rules';
import type { RuleId, RuleFunction } from '@/lib/rules';
import { sampleEntries } from '@/lib/sampler';

// Usage pattern in Phase 4:
const entries = sampleEntries(sdnData, params);      // seed defaults to 42
for (const entry of entries) {
  for (const ruleId of CANONICAL_RULE_ORDER) {
    if (!params.ruleIds.includes(ruleId)) continue;  // user checkbox filter
    const result = ruleMap[ruleId](entry);
    if (result === null) continue;                   // skip inapplicable pairs
    // create ResultRow with result, ruleId, RULE_LABELS[ruleId]...
  }
}
```

Import paths:
- `@/lib/rules` — all rule types and constants
- `@/lib/sampler` — sampleEntries function

The `RULE_LABELS` record is also consumed by Phase 5 (Parameter Form checkboxes) and Phase 6 (Results Table column).

## Decisions Made

1. **Fixed CANONICAL_RULE_ORDER** — Phase 4 uses this to guarantee deterministic output. User checkbox selections filter which rules run, but those that do run always execute in canonical order.

2. **Record<RuleId, RuleFunction> enforces completeness** — TypeScript compile error if any of the 10 rule IDs is missing from `ruleMap` or `RULE_LABELS`. This prevents silent omissions.

3. **Mulberry32 inline, seed defaults to 42** — Production runs are deterministic by default. Tests can pass explicit seeds for isolation. No npm dependency added.

4. **Sampling with replacement** — Handles edge case where requested count exceeds pool size (e.g., 50 vessels requested but only 30 vessels in the dataset for the selected regions).

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] src/lib/rules/index.ts exists
- [x] src/lib/sampler.ts exists
- [x] src/lib/rules/__tests__/sampler.test.ts exists
- [x] All 57 tests pass (11 files)
- [x] tsc --noEmit exits 0
- [x] CANONICAL_RULE_ORDER has exactly 10 entries
- [x] ruleMap has exactly 10 entries
- [x] RULE_LABELS has exactly 10 entries
- [x] No individual rule functions exported from index.ts module level
