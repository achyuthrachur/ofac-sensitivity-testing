---
phase: 03-transformation-engine
plan: 01
subsystem: testing
tags: [vitest, typescript, string-transforms, tdd, rules-engine]

# Dependency graph
requires:
  - phase: 02-synthetic-dataset
    provides: sdn.json frozen dataset and SdnEntry type interface
provides:
  - Vitest 4 test infrastructure with tsconfigPaths plugin
  - RULE-01 spaceRemoval — removes whitespace from all-region names
  - RULE-02 charSubstitution — OCR/leet char substitution (O->0, A->@, etc.)
  - RULE-03 diacritic — NFD diacritic stripping for latin/cyrillic regions
  - RULE-04 wordReorder — left-rotate tokens by 1 for all regions
  - RULE-05 abbreviation — vowel-drop with connector/AL-prefix preservation for arabic/cyrillic/latin
affects:
  - 03-transformation-engine (plans 02 and 03 build on same rule function signature)
  - 04-api-layer (imports rule functions for pipeline execution)

# Tech tracking
tech-stack:
  added:
    - vitest@4.0.18
    - "@vitest/coverage-v8@4"
    - vite@6
    - vite-tsconfig-paths
  patterns:
    - TDD red-green cycle — test scaffolds committed before implementations
    - RuleFunction signature: (entry: SdnEntry) => string | null
    - Named exports only — no default exports on rule files
    - Region guard pattern — return null early for inapplicable regions
    - Null-if-no-op contract — every rule returns null when output equals input

key-files:
  created:
    - vitest.config.ts
    - src/lib/rules/space-removal.ts
    - src/lib/rules/char-substitution.ts
    - src/lib/rules/diacritic.ts
    - src/lib/rules/word-reorder.ts
    - src/lib/rules/abbreviation.ts
    - src/lib/rules/__tests__/rule-01.test.ts
    - src/lib/rules/__tests__/rule-02.test.ts
    - src/lib/rules/__tests__/rule-03.test.ts
    - src/lib/rules/__tests__/rule-04.test.ts
    - src/lib/rules/__tests__/rule-05.test.ts
  modified:
    - package.json (added "test" and "test:watch" scripts)

key-decisions:
  - "CONNECTORS set includes IBN, BINT, BIN, BT, ABU, ABI, UMM — Arabic genealogical particles preserved verbatim by RULE-05"
  - "AL-XXXX nisba form: vowels stripped from suffix only, AL- prefix preserved — produces AL-RSHD not L-RSHD"
  - "RULE-03 diacritic test fixtures are synthetic (MÜLLER, JOSÉ) because sdn.json has zero pre-existing diacritics"
  - "CHAR_MAP is ReadonlyMap — 9 OCR/leet substitutions: O->0, I->1, L->1, E->3, A->@, S->5, B->8, G->9, T->7"
  - "Vitest 4 + vite-tsconfig-paths resolves @/ path alias from tsconfig.json without any Next.js bundler involvement"

patterns-established:
  - "Rule null contract: every rule must return null (not input string) when the transform produces no change"
  - "Region guard first: check entry.region before any string work — fail fast for inapplicable regions"
  - "Pure functions: no async, no side effects, no React — rule files are plain TypeScript modules"
  - "makeEntry helper in every test file: const makeEntry = (name, region='arabic', entityType='individual') => ({id:'test', name, entityType, region})"

requirements-completed: [RULE-01, RULE-02, RULE-03, RULE-04, RULE-05]

# Metrics
duration: ~20min
completed: 2026-03-04
---

# Phase 3 Plan 01: Transformation Engine Rules 01-05 Summary

**Vitest 4 test infrastructure installed and five degradation rule functions (RULE-01 through RULE-05) implemented with 23 passing unit tests covering space removal, OCR substitution, diacritic stripping, word reorder, and vowel-drop with Arabic connector preservation.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-03-04
- **Tasks:** 2 (TDD — test scaffolds then implementations)
- **Files modified:** 13

## Accomplishments

- Installed Vitest 4 with vite-tsconfig-paths so @/ aliases resolve in tests without Next.js
- Wrote 5 test files (23 tests total) in RED state before any implementations
- Implemented all 5 rule functions to GREEN — all 23 tests pass, `tsc --noEmit` exits 0
- Established the `(entry: SdnEntry) => string | null` rule function contract used by all subsequent rules

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Vitest 4 infrastructure and write test scaffolds** - `7c6453e` (test)
2. **Task 2: Implement RULE-01 through RULE-05 rule functions** - `e5688cf` (feat)

_Note: TDD pattern — test commit first (RED), implementation commit second (GREEN)_

## Files Created/Modified

- `vitest.config.ts` - Vitest 4 config with tsconfigPaths plugin, node environment, src/**/__tests__ include glob
- `package.json` - Added "test": "vitest run" and "test:watch": "vitest" scripts
- `src/lib/rules/space-removal.ts` - RULE-01: removes all whitespace; null for single-token names
- `src/lib/rules/char-substitution.ts` - RULE-02: OCR/leet char map (9 substitutions); null if no chars in map
- `src/lib/rules/diacritic.ts` - RULE-03: NFD diacritic strip for latin/cyrillic; null if no change or wrong region
- `src/lib/rules/word-reorder.ts` - RULE-04: left-rotate tokens by 1; null for single-token names
- `src/lib/rules/abbreviation.ts` - RULE-05: vowel-drop with CONNECTORS set + AL-prefix handling; null if no change
- `src/lib/rules/__tests__/rule-01.test.ts` - 4 tests: space removal, hyphen survival, single-token null
- `src/lib/rules/__tests__/rule-02.test.ts` - 4 tests: OSAMA, BILAL, ZHANG WEI, no-match null
- `src/lib/rules/__tests__/rule-03.test.ts` - 5 tests: MÜLLER, JOSÉ, CJK null, arabic null, no-diacritic null
- `src/lib/rules/__tests__/rule-04.test.ts` - 5 tests: 3-token, 2-token, Arabic name, aircraft null, single-token null
- `src/lib/rules/__tests__/rule-05.test.ts` - 5 tests: Arabic with connectors, Latin, Cyrillic, CJK null, all-connector null

## Decisions Made

- CONNECTORS set for RULE-05 includes 7 Arabic genealogical particles: IBN, BINT, BIN, BT, ABU, ABI, UMM — these are preserved verbatim when they appear as standalone tokens
- AL-XXXX nisba prefix handling: vowels stripped from suffix only, producing AL-RSHD from AL-RASHIDI (not L-RSHD which would lose the prefix entirely)
- CHAR_MAP uses ReadonlyMap for type safety; 9 entries covering the most common OCR/leet confusables
- Diacritic tests use synthetic fixtures (MÜLLER, JOSÉ FERNANDEZ) because sdn.json contains zero pre-existing diacritics — tests on the real dataset would all trivially pass without exercising the logic
- vite-tsconfig-paths resolves @/types alias in test files so the same import paths work in both Next.js and Vitest environments without any duplication

## Deviations from Plan

None — plan executed exactly as written. TDD cycle followed: test scaffolds committed in RED state, then implementations committed to GREEN.

## Issues Encountered

None. All 23 tests passed on first implementation attempt with zero TypeScript errors.

## User Setup Required

None — no external service configuration required. Tests run with `npm test`.

## Next Phase Readiness

- All 5 rule functions are complete, tested, and frozen
- Rule function signature `(entry: SdnEntry) => string | null` is established — plans 03-02 and 03-03 must follow it
- Test infrastructure is in place — new rule test files only need to add a test file in `src/lib/rules/__tests__/`
- Phase 4 (API layer) can import any rule function via `@/lib/rules/{filename}`

---
*Phase: 03-transformation-engine*
*Completed: 2026-03-04*
