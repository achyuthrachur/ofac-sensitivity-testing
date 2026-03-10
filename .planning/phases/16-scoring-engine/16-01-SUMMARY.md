---
phase: 16-scoring-engine
plan: 01
subsystem: testing
tags: [vitest, typescript, scoring, ofac, tdd, types]

# Dependency graph
requires:
  - phase: 15-architecture-foundation
    provides: MatchResult/MatchResultStub types, ScreeningWorkerApi interface, Comlink worker stub

provides:
  - effectiveTier field in MatchResult interface (post-penalty tier for Phase 18 UI)
  - ScreeningWorkerApi.screenNames return type updated to Promise<MatchResult[]>
  - Wave 0 failing test scaffold for scorer.ts covering SCREEN-06/07/08/09

affects:
  - 16-02 (scorer.ts implementation must pass these tests)
  - 18-screening-ui (effectiveTier now available in MatchResult for display)
  - All files that implement ScreeningWorkerApi (must return MatchResult[])

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 0 TDD: write failing tests before any implementation exists — scorer.test.ts is the behavioral contract for scorer.ts"
    - "effectiveTier separate from riskTier: raw score tier vs compliance-effective tier after name-length escalation"

key-files:
  created:
    - src/lib/__tests__/scorer.test.ts
  modified:
    - src/types/screening.ts
    - src/lib/workers/screening.worker.ts

key-decisions:
  - "effectiveTier: RiskTier added to MatchResult between nameLengthPenaltyApplied and transformationDetected — post-penalty tier for Phase 18 UI to show both raw and compliance-effective tiers"
  - "ScreeningWorkerApi.screenNames return type changed to Promise<MatchResult[]> — MatchResultStub retained for backward compatibility during Plan 02 wave"
  - "screening.worker.ts stub updated to return Promise<MatchResult[]> — always throws Not implemented so return type is cosmetic but required for TypeScript compliance"
  - "scorer.test.ts imports from @/lib/screening/scorer which does not exist — intentional Wave 0 RED state; module-not-found is the expected failure until Plan 02"

patterns-established:
  - "Wave 0 test scaffold: create test file before implementation; all tests fail with module-not-found; existing suite stays green"
  - "CJK guard in dmBonus tests: two empty DM code inputs must return 0.0, not 1.0 — prevents false-positive matches"
  - "isShortName boundary: ≤6 non-space characters = short name; AL AZIZ (6 chars after space removal) is the edge case"

requirements-completed: [SCREEN-06, SCREEN-07, SCREEN-08, SCREEN-09]

# Metrics
duration: 53min
completed: 2026-03-06
---

# Phase 16 Plan 01: Scoring Engine Type Contracts and Test Scaffold Summary

**MatchResult effectiveTier field added and full Wave 0 failing test suite written for scorer.ts covering SCREEN-06/07/08/09 composite scoring, tier assignment, name-length penalty, and Unicode normalization**

## Performance

- **Duration:** 53 min
- **Started:** 2026-03-06T21:57:06Z
- **Completed:** 2026-03-06T22:50:09Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `effectiveTier: RiskTier` added to MatchResult interface — enables Phase 18 UI to display both the raw score tier and the compliance-effective tier after name-length escalation
- `ScreeningWorkerApi.screenNames` return type updated from `Promise<MatchResultStub[]>` to `Promise<MatchResult[]>` — unblocks Plan 02 implementation
- 248-line Wave 0 test scaffold created in `scorer.test.ts` — covers all four requirement areas (normalize, dmBonus/tokenSortRatio, assignTier/escalateTier/isShortName, screenNames integration); all tests fail with module-not-found until Plan 02 creates scorer.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Update type contracts in src/types/screening.ts** - `7b45514` (feat)
2. **Task 2: Write failing test suite for scorer.ts** - `7e1b519` (test)

## Files Created/Modified

- `src/types/screening.ts` - Added `effectiveTier: RiskTier` to MatchResult; updated ScreeningWorkerApi.screenNames return to `Promise<MatchResult[]>`; updated JSDoc
- `src/lib/workers/screening.worker.ts` - Updated stub return type annotation from `Promise<MatchResultStub[]>` to `Promise<MatchResult[]>` (deviation fix — see below)
- `src/lib/__tests__/scorer.test.ts` - Wave 0 failing test suite for SCREEN-06/07/08/09 (248 lines, 29 test cases across 9 describe blocks)

## Decisions Made

- `effectiveTier` is placed between `nameLengthPenaltyApplied` and `transformationDetected` in the Classification block — semantically it is the result of applying the penalty, so it logically follows the boolean flag that indicates whether the penalty was applied
- MatchResultStub retained in types — still used in Phase 15 stubs during this plan's wave; Plan 02 will clean up remaining usages
- CJK homoglyph test uses placeholder strings (`东方` / `西方`) rather than null strings — documents the empty DM code guard requirement explicitly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated screening.worker.ts stub to match new interface return type**
- **Found during:** Task 1 verification (`npx tsc --noEmit`)
- **Issue:** After changing `ScreeningWorkerApi.screenNames` to return `Promise<MatchResult[]>`, the worker stub still declared `Promise<MatchResultStub[]>`, causing a TypeScript error: `Type 'MatchResultStub[]' is not assignable to type 'MatchResult[]'`
- **Fix:** Updated import in screening.worker.ts from `MatchResultStub` to `MatchResult`; updated return type annotation on the stub function to `Promise<MatchResult[]>`. The stub always throws `Not implemented` so this is purely cosmetic for TypeScript compliance.
- **Files modified:** `src/lib/workers/screening.worker.ts`
- **Verification:** `npx tsc --noEmit` returned zero errors (excluding the expected scorer.test.ts module-not-found)
- **Committed in:** `7b45514` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for TypeScript compliance. The plan noted screening.worker.ts would be updated in Plan 02 but the interface change made it fail immediately. No scope creep.

## Issues Encountered

- The `scorer.test.ts` module-not-found error also appears in `npx tsc --noEmit` output. This is expected — the test file imports from a module that doesn't exist yet. All production code is clean; only the test file references the unimplemented module.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 has a concrete behavioral specification: implement `src/lib/screening/scorer.ts` with all exported functions to turn 29 failing tests green
- Type contracts are stable — MatchResult with effectiveTier is the authoritative shape for all of Phase 16
- Existing test suite (128 tests, 16 files) remains green — regression protected

---
*Phase: 16-scoring-engine*
*Completed: 2026-03-06*

## Self-Check: PASSED

- FOUND: src/types/screening.ts (effectiveTier added, ScreeningWorkerApi updated)
- FOUND: src/lib/__tests__/scorer.test.ts (Wave 0 failing test scaffold, 248 lines)
- FOUND: src/lib/workers/screening.worker.ts (return type annotation updated)
- FOUND: .planning/phases/16-scoring-engine/16-01-SUMMARY.md
- FOUND: commit 7b45514 (Task 1 — type contracts)
- FOUND: commit 7e1b519 (Task 2 — test scaffold)
- FOUND: commit 91c66d2 (metadata — SUMMARY + STATE + ROADMAP)
