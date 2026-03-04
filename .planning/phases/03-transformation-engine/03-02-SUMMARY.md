---
phase: 03-transformation-engine
plan: 02
subsystem: testing
tags: [vitest, typescript, string-transforms, ofac, degradation-rules, phonetic, alias]

# Dependency graph
requires:
  - phase: 03-transformation-engine
    provides: "RULE-01 through RULE-05 rule functions, Vitest 4 test infrastructure"

provides:
  - RULE-06: truncation — drops last token; single-token null guard
  - RULE-07: phonetic variants — 19-entry PHONETIC_MAP (12 Arabic + 7 Russian); AL- prefix handling
  - RULE-08: punctuation removal — strips /[^\w\s]/g; null when no punctuation
  - RULE-09: prefix/suffix removal — 9-entry PREFIXES + 7-entry SUFFIXES; strips both in one pass
  - RULE-10: alias substitution — 6-entry ALIAS_MAP for Arabic given names only; connector skip
  - Full 10-rule test suite: 52 tests passing across all rule files

affects: [03-03-transformation-engine-plan, phase-04-engine-wiring, phase-05-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lookup-table rule pattern: Map<string, string[]> with index-0 determinism for variant selection"
    - "AL- prefix strip-and-reconstitute for phonetic/transliteration lookups"
    - "SKIP_FIRST connector set for given-name detection in Arabic patronymic names"
    - "Prefix-then-suffix double-strip in a single pass for RULE-09"
    - "ReadonlySet<string> for O(1) applicability and prefix/suffix membership checks"

key-files:
  created:
    - src/lib/rules/truncation.ts
    - src/lib/rules/phonetic.ts
    - src/lib/rules/punctuation.ts
    - src/lib/rules/prefix-suffix.ts
    - src/lib/rules/alias.ts
    - src/lib/rules/__tests__/rule-06.test.ts
    - src/lib/rules/__tests__/rule-07.test.ts
    - src/lib/rules/__tests__/rule-08.test.ts
    - src/lib/rules/__tests__/rule-09.test.ts
    - src/lib/rules/__tests__/rule-10.test.ts
  modified: []

key-decisions:
  - "RULE-07 AL- prefix: strip before PHONETIC_MAP lookup, reconstitute as AL-<variant> if match found — preserves nisba form"
  - "RULE-09 both-strip order: prefix first (first token), then suffix (last remaining token) in single pass — IMAM YUSUF MD -> YUSUF"
  - "RULE-10 SKIP_FIRST set (ABU/ABD/AL): when first token is a connector, check second token for alias lookup"
  - "RULE-09 fixture note: all sdn.json entries have zero honorific prefixes — tests must use synthetic fixture strings"
  - "RULE-10 scope: arabic region only in v1; cyrillic/latin/cjk all return null by region guard"

patterns-established:
  - "Lookup-table rules: Map<canonical, string[]> + index 0 for deterministic variant selection"
  - "Connector detection: ReadonlySet<string> checked before given-name lookup to skip genealogical particles"

requirements-completed: [RULE-06, RULE-07, RULE-08, RULE-09, RULE-10]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 3 Plan 02: Transformation Engine — RULE-06 through RULE-10 Summary

**Five degradation rule functions with lookup-table phonetic/alias variants (19-entry PHONETIC_MAP, 6-entry ALIAS_MAP), punctuation removal, prefix/suffix stripping, and truncation — completing all 10 rules with 52 tests green**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-04T17:38:45Z
- **Completed:** 2026-03-04T17:43:38Z
- **Tasks:** 2 (TDD: RED then GREEN)
- **Files modified:** 10 (5 rule files + 5 test files)

## Accomplishments
- Implemented all 5 remaining degradation rules (RULE-06 through RULE-10) as named TypeScript exports
- Completed 10-rule test suite: 52 total tests, all passing, 0 failures
- PHONETIC_MAP contains all 19 specified entries (12 Arabic + 7 Russian canonical forms)
- ALIAS_MAP contains all 6 specified Arabic given-name alias groups
- PREFIXES (9 entries) and SUFFIXES (7 entries) match locked spec exactly
- TypeScript strict-mode check passes: `npx tsc --noEmit` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Write test files for RULE-06 through RULE-10 (RED state)** - `8ca5765` (test)
2. **Task 2: Implement RULE-06 through RULE-10 rule functions** - `38b2531` (feat)

_Note: TDD tasks — RED commit followed by GREEN commit_

## Files Created/Modified
- `src/lib/rules/truncation.ts` - RULE-06: drops last token; null for single-token names
- `src/lib/rules/phonetic.ts` - RULE-07: 19-entry PHONETIC_MAP; AL- prefix strip+reconstitute
- `src/lib/rules/punctuation.ts` - RULE-08: /[^\w\s]/g strip; null when no punctuation present
- `src/lib/rules/prefix-suffix.ts` - RULE-09: 9 PREFIXES + 7 SUFFIXES; strips both in one pass
- `src/lib/rules/alias.ts` - RULE-10: 6-entry ALIAS_MAP; arabic-only; connector skip for ABU/ABD/AL
- `src/lib/rules/__tests__/rule-06.test.ts` - 5 tests: 4-token drop, 2-token CJK/Latin, single-token null
- `src/lib/rules/__tests__/rule-07.test.ts` - 7 tests: OSAMA/HASSAN/ALEKSANDR, AL- prefix, inapplicable regions
- `src/lib/rules/__tests__/rule-08.test.ts` - 5 tests: AL-RASHIDI, AL-NOOR, AL-QAEDA, no-punctuation null
- `src/lib/rules/__tests__/rule-09.test.ts` - 6 tests: DR/MR/SHEIKH prefixes, JR suffix, both-strip, no-match null
- `src/lib/rules/__tests__/rule-10.test.ts` - 6 tests: MOHAMMED/HUSSEIN/HASSAN, arabic-only guard, no-match null

## Decisions Made

- RULE-07 AL- prefix handling: strip `AL-` prefix before PHONETIC_MAP lookup, reconstruct with `AL-` if a match is found. This preserves the nisba form (e.g., `AL-HASSAN IBN SAID` -> `AL-HASAN IBN SAID` not `HASAN IBN SAID`).
- RULE-09 double-strip order: prefix is stripped first (check `tokens[0]`), then the last remaining token is checked for a suffix. This produces `IMAM YUSUF MD` -> `YUSUF` (both stripped) as specified.
- RULE-10 SKIP_FIRST set: when first token is in `{ABU, ABD, AL}`, check the second token for alias lookup. These are genealogical connectors, not given names.
- RULE-09 test fixtures: all 6 test cases use synthetic strings — the real `sdn.json` has zero honorific prefixes so real entries would all return null.
- RULE-10 scope: arabic region only for v1. Russian diminutives (Aleksandr/Sasha) and CJK romanization variants are deferred to v2.

## Deviations from Plan

None — plan executed exactly as written.

## Vitest Output Confirmation

```
RUN  v4.0.18

 ✓ src/lib/rules/__tests__/rule-09.test.ts (6 tests) 6ms
 ✓ src/lib/rules/__tests__/rule-06.test.ts (5 tests) 5ms
 ✓ src/lib/rules/__tests__/rule-07.test.ts (7 tests) 8ms
 ✓ src/lib/rules/__tests__/rule-05.test.ts (5 tests) 7ms
 ✓ src/lib/rules/__tests__/rule-08.test.ts (5 tests) 5ms
 ✓ src/lib/rules/__tests__/rule-10.test.ts (6 tests) 5ms
 ✓ src/lib/rules/__tests__/rule-03.test.ts (5 tests) 5ms
 ✓ src/lib/rules/__tests__/rule-04.test.ts (5 tests) 6ms
 ✓ src/lib/rules/__tests__/rule-02.test.ts (4 tests) 4ms
 ✓ src/lib/rules/__tests__/rule-01.test.ts (4 tests) 4ms

 Test Files  10 passed (10)
       Tests  52 passed (52)
    Duration  5.89s
```

## Issues Encountered

None.

## Next Phase Readiness
- All 10 degradation rule functions implemented and tested
- Plan 03 (rules/index.ts barrel — `ruleMap`, `CANONICAL_RULE_ORDER`, `RULE_LABELS`) can proceed immediately
- Rule functions follow consistent signature: `(entry: SdnEntry) => string | null`
- No blockers for Phase 3 Plan 03 or Phase 4 engine wiring

## Self-Check: PASSED

All 11 files confirmed present on disk. Commits 8ca5765 (RED) and 38b2531 (GREEN) verified in git log.

---
*Phase: 03-transformation-engine*
*Completed: 2026-03-04*
