---
phase: 16-scoring-engine
plan: 02
subsystem: api
tags: [talisman, jaro-winkler, double-metaphone, token-sort-ratio, unicode, ofac, scoring, vitest, comlink, webworker]

# Dependency graph
requires:
  - phase: 16-01
    provides: effectiveTier in MatchResult, ScreeningWorkerApi returning Promise<MatchResult[]>, Wave 0 scorer.test.ts scaffold (32 failing tests)

provides:
  - src/lib/screening/scorer.ts — pure multi-algorithm scoring module (normalize, dmBonus, tokenSortRatio, assignTier, escalateTier, isShortName, scorePair, screenNames)
  - src/lib/screening/index.ts — server-side screenNames() delegating to scorer.ts (Phase 15 stub replaced)
  - src/lib/workers/screening.worker.ts — Comlink-exposed worker calling scorer.ts with isSdnEntry shape guard (Phase 15 stub replaced)

affects:
  - 16-03 (if it exists — scorer.ts is the implementation; all downstream phases use it)
  - 17-screening-ui (consumes screenNames return type MatchResult[])
  - 18-screening-ui (effectiveTier available for display)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure scorer module pattern: all scoring logic in scorer.ts — importable by both server path and Web Worker without server-only imports"
    - "Cyrillic-to-Latin confusable map in normalize(): explicit character table for OFAC-relevant homoglyphs; NFKD alone does not map Cyrillic Р→R"
    - "Pre-normalization optimization: normalize SDN names once before outer loop (saves ~2.85M redundant calls for 10K inputs × 285 entries)"
    - "CJK/Arabic empty-code guard in dmBonus(): if either input produces ['',''] from doubleMetaphone, return 0.0 to prevent false-positive phonetic matches"

key-files:
  created:
    - src/lib/screening/scorer.ts
  modified:
    - src/lib/screening/index.ts
    - src/lib/workers/screening.worker.ts
    - src/lib/__tests__/scorer.test.ts

key-decisions:
  - "Cyrillic confusable map in normalize(): NFKD alone cannot map Cyrillic Р (U+0420) to Latin R — added explicit Cyrillic-to-Latin table for 18 common homoglyphs; this makes normalize('Рobert') === 'ROBERT', enabling EXACT tier match for homoglyph evasion detection"
  - "Worker imports from @/lib/screening/scorer (not from @/lib/screening barrel): avoids potential server-only import chain in worker bundle"
  - "isSdnEntry uses explicit typeof checks on property values (not just 'in' operator): stricter shape validation per plan spec"

patterns-established:
  - "Confusable map position: apply before NFKD, not after — ensures homoglyphs are ASCII before diacritic stripping"
  - "Worker shape guard: filter(isSdnEntry) on unknown[] before passing to scorer — never cast without validation"

requirements-completed: [SCREEN-06, SCREEN-07, SCREEN-08, SCREEN-09]

# Metrics
duration: 21min
completed: 2026-03-06
---

# Phase 16 Plan 02: Scoring Engine Implementation Summary

**Three-algorithm fuzzy scorer (Jaro-Winkler + Double Metaphone + Token Sort Ratio) implemented as pure module with Cyrillic homoglyph detection, making all 32 scorer.test.ts tests green and replacing both Phase 15 stubs**

## Performance

- **Duration:** 21 min
- **Started:** 2026-03-06T17:03:41Z
- **Completed:** 2026-03-06T17:25:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `src/lib/screening/scorer.ts` created — 166 lines, 8 exports (normalize, dmBonus, tokenSortRatio, assignTier, escalateTier, isShortName, scorePair, screenNames) with pre-normalization optimization
- All 32 scorer.test.ts tests pass green; full suite of 160 tests passes across 17 test files
- Phase 15 stubs in `index.ts` and `screening.worker.ts` fully replaced — zero "Not implemented" throws remain
- `npm run build` passes with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pure scorer module** - `2380404` (feat)
2. **Task 2: Replace stubs in index.ts and screening.worker.ts** - `501fc7c` (feat)

## Files Created/Modified

- `src/lib/screening/scorer.ts` - Pure scoring module: all 8 exported functions including screenNames with 2.85M-call pre-normalization optimization
- `src/lib/__tests__/scorer.test.ts` - Updated normalize test to reflect confusable map (Rule 1 auto-fix)
- `src/lib/screening/index.ts` - Server-side path: re-exports screenNames from scorer.ts (stub replaced)
- `src/lib/workers/screening.worker.ts` - Worker path: Comlink-exposed API with isSdnEntry guard, imports from scorer.ts directly

## Decisions Made

- **Cyrillic confusable map added to normalize()**: Research doc incorrectly stated that JW('РOBERT', 'ROBERT') ≥ 0.97 — empirically measured at 0.889, giving composite 0.667 (CLEAR). The confusable map correctly resolves Cyrillic homoglyph detection at the normalization stage, producing EXACT tier as required by must_haves
- **Worker imports scorer.ts directly**: `from '@/lib/screening/scorer'` not `from '@/lib/screening'` — prevents potential barrel re-export pulling server-only imports into worker bundle

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Cyrillic homoglyph test would not pass with NFKD-only normalize**
- **Found during:** Task 1 (scorer.ts implementation, GREEN phase)
- **Issue:** Research doc (16-RESEARCH.md) incorrectly asserted JW('РOBERT', 'ROBERT') ≥ 0.97 — actual measurement: 0.889. With no DM match (codes: ['PRT','PRT'] vs ['RPRT','RPRT']), composite = 0.667 → CLEAR. This made the screenNames Cyrillic homoglyph test fail (expected EXACT, got CLEAR). Additionally, the normalize test #4 in scorer.test.ts asserted `.not.toBe('ROBERT')` based on NFKD-only behavior, which created a contradiction: test 4 would pass but the screenNames EXACT test would fail.
- **Fix:** Added Cyrillic-to-Latin confusable character map (18 entries for common homoglyphs) to normalize() — applied before NFKD. normalize('Рobert') now returns 'ROBERT'. Updated scorer.test.ts normalize test #4 from `.not.toBe('ROBERT')` to `.toBe('ROBERT')` to document that confusable mapping is applied (not just NFKD).
- **Files modified:** `src/lib/screening/scorer.ts`, `src/lib/__tests__/scorer.test.ts`
- **Verification:** All 32 scorer.test.ts tests pass; full 160-test suite green
- **Committed in:** `2380404` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was necessary to satisfy the plan's must_have ("screenNames(['Рobert'], sdnWithROBERT) returns riskTier=EXACT via high JW score") and the SCREEN-09 requirement for homoglyph detection. The confusable map is the correct implementation — NFKD alone cannot handle Cyrillic-to-Latin homoglyphs. No scope creep.

## Issues Encountered

- The RESEARCH.md contained an incorrect empirical claim about JW score for Cyrillic homoglyphs. The fix (confusable map) is the standard OFAC industry approach for homoglyph detection and aligns with the SCREEN-09 requirement objective. Documented for future reference.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- scoring engine complete; all 4 requirements (SCREEN-06/07/08/09) implemented and verified
- screenNames() returns MatchResult[] with all 19 fields populated including effectiveTier
- Web Worker roundtrip requires browser environment — Phase 18 Run button will provide live validation
- Full test suite (160 tests, 17 files) green; zero TypeScript build errors

---
*Phase: 16-scoring-engine*
*Completed: 2026-03-06*

## Self-Check: PASSED

- FOUND: src/lib/screening/scorer.ts (166 lines, 8 exports)
- FOUND: src/lib/screening/index.ts (stub replaced)
- FOUND: src/lib/workers/screening.worker.ts (stub replaced)
- FOUND: src/lib/__tests__/scorer.test.ts (updated normalize test)
- FOUND: .planning/phases/16-scoring-engine/16-02-SUMMARY.md
- FOUND: commit 2380404 (Task 1 — pure scorer module)
- FOUND: commit 501fc7c (Task 2 — stubs replaced)
