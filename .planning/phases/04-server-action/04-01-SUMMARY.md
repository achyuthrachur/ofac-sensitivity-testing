---
phase: 04-server-action
plan: 01
subsystem: api
tags: [server-action, zod, jaro-winkler, talisman, vitest, tdd]

# Dependency graph
requires:
  - phase: 03-transformation-engine
    provides: ruleMap, CANONICAL_RULE_ORDER, RULE_LABELS, sampleEntries
  - phase: 02-synthetic-dataset
    provides: sdn.json dataset, SdnEntry type, @data/* alias
  - phase: 01-foundation
    provides: Next.js scaffold, TypeScript config, Vitest setup

provides:
  - runTest Next.js Server Action (src/app/actions/runTest.ts)
  - ActionResult discriminated union type (src/types/index.ts)
  - Integration test suite proving all 6 FORM-05 behaviors
  - talisman Jaro-Winkler scoring integrated into action pipeline
  - talisman.d.ts type shim for deep CJS import

affects:
  - 05-parameter-form (useActionState wires to runTest)
  - 06-results-table (ResultRow shape drives column definitions)

# Tech tracking
tech-stack:
  added:
    - talisman ^1.1.4 (Jaro-Winkler string similarity metric)
  patterns:
    - Server Action always returns ActionResult (never throws)
    - Zod safeParse at the boundary — errors become { ok: false; error: string }
    - z.prettifyError for human-readable Zod error messages
    - NaN guard on jaroWinkler output for CJK empty-string edge case
    - CANONICAL_RULE_ORDER drives loop order; user ruleIds filter which rules run

key-files:
  created:
    - src/app/actions/runTest.ts
    - src/lib/__tests__/runTest.integration.test.ts
    - src/types/talisman.d.ts
  modified:
    - src/types/index.ts (ActionResult type appended)
    - package.json (talisman dependency added)
    - package-lock.json

key-decisions:
  - "talisman.d.ts shim required — talisman has no TypeScript types and no @types package"
  - "Vitest 4 changed it() API — timeout option is second argument, not third; auto-fixed during RED->GREEN transition"
  - "Benchmark result: 500 individuals + all 10 rules completes in ~53ms (no need to lower MAX_ENTITY_COUNT)"
  - "ENTITY_TYPE_VALUES not imported in runTest.ts — not needed in action body (Zod schema uses REGION_VALUES only)"

patterns-established:
  - "ActionResult pattern: { ok: true; rows } | { ok: false; error } — discriminated union, never throws"
  - "runTest accepts unknown input and validates via Zod — safe for direct form action binding"
  - "Rule loop uses CANONICAL_RULE_ORDER, filters by validParams.ruleIds — deterministic output"

requirements-completed: [FORM-05]

# Metrics
duration: ~15min
completed: 2026-03-04
---

# Phase 4 Plan 01: runTest Server Action Summary

**Jaro-Winkler-scored OFAC sensitivity test server action with Zod validation, 6-test integration suite, and ActionResult discriminated union — 63/63 tests green**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-04T20:05:00Z
- **Completed:** 2026-03-04T20:13:58Z
- **Tasks:** 2 (TDD: RED then GREEN)
- **Files modified:** 6

## Accomplishments

- Implemented `runTest` Next.js Server Action: validates RunParams via Zod, samples entries from sdn.json, applies degradation rules in CANONICAL_RULE_ORDER, scores each pair with Jaro-Winkler, returns typed ActionResult
- Added `ActionResult` discriminated union to `src/types/index.ts` — provides typed contract for Phase 5 form wiring
- Created 6-test integration suite covering all FORM-05 behaviors: valid params, row shape, invalid params, null input, zero counts, and benchmark
- Benchmark: 500 individuals + all 10 rules completes in ~53ms — well under the 5000ms plan threshold and Vercel 10s timeout

## Task Commits

Each task was committed atomically:

1. **Task 1: Install talisman and create failing integration test stub** - `7255bca` (test)
2. **Task 2: Add ActionResult type + implement runTest server action** - `9d1e0be` (feat)

_Note: TDD — Task 1 establishes RED state, Task 2 turns GREEN_

## Files Created/Modified

- `src/app/actions/runTest.ts` — Next.js Server Action with Zod validation, sampleEntries, rule loop, Jaro-Winkler scoring
- `src/lib/__tests__/runTest.integration.test.ts` — 6-test integration suite proving all FORM-05 behaviors
- `src/types/talisman.d.ts` — TypeScript type shim for `talisman/metrics/jaro-winkler` deep import
- `src/types/index.ts` — ActionResult discriminated union appended after RunParams interface
- `package.json` — talisman ^1.1.4 added to dependencies
- `package-lock.json` — lockfile updated with talisman and its 10 transitive packages

## Decisions Made

- **talisman.d.ts shim required:** talisman has no built-in TypeScript types and no `@types/talisman` package on npm. Type shim created to declare the default export as `(a: string, b: string) => number`.
- **Benchmark passes without MAX_ENTITY_COUNT reduction:** Worst-case run (500 individuals, all 4 regions, all 10 rules) completed in ~53ms. No need to lower MAX_ENTITY_COUNT from 500.
- **ENTITY_TYPE_VALUES not imported:** Not needed in the action body — Zod schema uses REGION_VALUES only; omitted per `noUnusedLocals` TypeScript strict mode.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Vitest 4 removed deprecated 3-argument it() API**
- **Found during:** Task 2 (implementation, first test run)
- **Issue:** Plan specified `it(name, fn, { timeout: 10_000 })` (3-argument form). Vitest 4 removed this — it was deprecated in v3 and removed in v4. Test suite failed with TypeError at parse time.
- **Fix:** Changed benchmark test signature to `it(name, { timeout: 10_000 }, fn)` — timeout as second argument per Vitest 4 API
- **Files modified:** src/lib/__tests__/runTest.integration.test.ts
- **Verification:** All 6 tests pass after fix; full suite 63/63 green
- **Committed in:** 9d1e0be (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Bug)
**Impact on plan:** Fix was necessary for tests to run. No scope creep. API change is well-documented in Vitest 4 migration guide.

## Issues Encountered

- talisman's `jaro-winkler.js` sets `__esModule: false` while also doing `module.exports = exports['default']` (CJS pattern). With `esModuleInterop: true` in tsconfig, `import jaroWinkler from 'talisman/metrics/jaro-winkler'` works correctly at runtime — the interop layer handles it. The type shim documents the same default-export contract.

## User Setup Required

None — no external service configuration required. talisman is a pure JS npm package with no external dependencies.

## Next Phase Readiness

- `runTest` server action is ready for Phase 5 to bind via `useActionState`/`startTransition`
- `ActionResult` type contract is established — Phase 5 form state management can use `ActionResult` directly
- All integration tests green — no regressions from Phase 3 rule implementations
- Concern still pending: Vercel account tier (10s Hobby / 60s Pro) — benchmark at 53ms gives ample headroom on all tiers

---
*Phase: 04-server-action*
*Completed: 2026-03-04*
