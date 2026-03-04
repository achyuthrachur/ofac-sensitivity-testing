---
phase: 05-parameter-form
plan: "01"
subsystem: ui
tags: [formUtils, pure-functions, vitest, tdd, typescript]

# Dependency graph
requires:
  - phase: 03-transformation-engine
    provides: CANONICAL_RULE_ORDER from rules/index.ts used in deriveSelectAllState
  - phase: 02-synthetic-dataset
    provides: Region type and REGION_VALUES from types/index.ts
provides:
  - src/lib/formUtils.ts — 5 pure exported helpers (parseEntityCount, toggleRegion, toggleRule, deriveSelectAllState, buildRunParams)
  - src/app/__tests__/paramForm.test.ts — 26 unit tests, all green
affects:
  - 05-parameter-form (plan 02 — page.tsx imports all 5 functions from @/lib/formUtils)
  - 06-results-table (RunParams shape consumed by server action and results display)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure helper extraction: all form state logic lives in src/lib/formUtils.ts — page.tsx is a rendering-only component"
    - "TDD RED→GREEN: test file committed first (failing), implementation committed second (passing)"
    - "parseInt over parseFloat for entity counts — matches Zod .int() validation on server"

key-files:
  created:
    - src/lib/formUtils.ts
    - src/app/__tests__/paramForm.test.ts
  modified: []

key-decisions:
  - "formUtils.ts uses length comparison for deriveSelectAllState — sufficient for UI tri-state without checking actual IDs"
  - "buildRunParams passes clientName through untrimmed — Zod handles server-side validation"
  - "parseEntityCount uses parseInt (not parseFloat) to match Zod .int() contract"

patterns-established:
  - "Form helpers: extract all state mutation/derivation to pure functions in src/lib/ — page.tsx stays rendering-only"
  - "TDD pattern in node environment: tests use import('@/types') for inline type imports to avoid readonly tuple cast errors"

requirements-completed: [FORM-01, FORM-02, FORM-03, FORM-04]

# Metrics
duration: 6min
completed: 2026-03-04
---

# Phase 05 Plan 01: Form State Helpers Summary

**5 pure form state helper functions (parseEntityCount, toggleRegion, toggleRule, deriveSelectAllState, buildRunParams) extracted to src/lib/formUtils.ts with 26 Vitest unit tests — all green**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-04T21:02:52Z
- **Completed:** 2026-03-04T21:08:50Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Created `src/lib/formUtils.ts` with 5 typed pure functions, zero `any`, explicit param/return types
- Created `src/app/__tests__/paramForm.test.ts` with 26 test cases covering all behavioral contracts
- Full test suite still green (89/89 tests across 13 test files)
- TypeScript `tsc --noEmit` clean after auto-fixing a readonly tuple cast error in test file

## Task Commits

Each task was committed atomically:

1. **RED: Failing test suite** - `54cea4d` (test)
2. **GREEN: formUtils implementation + TS fix** - `90f2f70` (feat)

**Plan metadata:** (docs commit forthcoming)

_Note: TDD tasks — test committed first (RED), implementation committed second (GREEN)_

## Files Created/Modified
- `src/lib/formUtils.ts` — 5 exported pure helpers: parseEntityCount, toggleRegion, toggleRule, deriveSelectAllState, buildRunParams
- `src/app/__tests__/paramForm.test.ts` — 26 unit tests covering all function behaviors and edge cases

## Decisions Made
- `deriveSelectAllState` uses `ruleIds.length` vs `CANONICAL_RULE_ORDER.length` — length comparison sufficient for UI tri-state (no need to compare actual IDs)
- `buildRunParams` passes `clientName` through without trimming — Zod handles server-side `.trim()` validation
- `parseEntityCount` uses `parseInt(raw, 10)` not `parseFloat` — consistent with Zod `.int()` server contract

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in readonly tuple cast**
- **Found during:** Task 2 (GREEN phase, post-implementation typecheck)
- **Issue:** `const input = ['arabic', 'cjk'] as const` created a `readonly` tuple that could not be double-cast to `string[] as Region[]` — TypeScript error TS2352
- **Fix:** Changed declaration to `const input: Region[] = ['arabic', 'cjk']` — mutable typed array, no cast needed
- **Files modified:** `src/app/__tests__/paramForm.test.ts`
- **Verification:** `npx tsc --noEmit` passes with zero errors; 26 tests still green
- **Committed in:** `90f2f70` (GREEN task commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — TypeScript correctness)
**Impact on plan:** Trivial cast issue in test code; no logic change. Green was already achieved before the fix.

## Issues Encountered
None beyond the TS cast fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `src/lib/formUtils.ts` is the complete contract for the page.tsx form component
- All 5 helper functions typed and tested — page.tsx can import them directly via `@/lib/formUtils`
- `RULE_LABELS` from `src/lib/rules/index.ts` is available for populating the rules checkbox list in plan 05-02
- No blockers for Phase 05 Plan 02 (ParameterForm UI component)

---
*Phase: 05-parameter-form*
*Completed: 2026-03-04*

## Self-Check: PASSED

- src/lib/formUtils.ts — FOUND
- src/app/__tests__/paramForm.test.ts — FOUND
- .planning/phases/05-parameter-form/05-01-SUMMARY.md — FOUND
- Commit 54cea4d (RED) — FOUND
- Commit 90f2f70 (GREEN) — FOUND
