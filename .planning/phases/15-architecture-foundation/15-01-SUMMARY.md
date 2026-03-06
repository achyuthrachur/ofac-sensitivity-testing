---
phase: 15-architecture-foundation
plan: 01
subsystem: api
tags: [typescript, comlink, web-worker, talisman, tdd, screening, ofac]

# Dependency graph
requires: []
provides:
  - RiskTier union type and RISK_TIER_VALUES const (EXACT/HIGH/MEDIUM/LOW/CLEAR)
  - TIER_THRESHOLDS constants (0.97/0.90/0.80/0.70)
  - MAX_SCREENING_NAMES (10_000) and COST_OF_MISS_MULTIPLIER (4.0)
  - MatchResult and MatchResultStub interfaces
  - SimulationSnapshot and ScreeningWorkerApi interfaces
  - Double Metaphone type declaration in talisman.d.ts
  - CLIENT_NAMES: string[] with 50 synthetic names (12 near-match, 28 clear, 10 edge)
  - src/lib/screening/index.ts stub — Phase 16 fills implementation
  - src/lib/simulation/index.ts stub — Phase 21 fills implementation
  - src/lib/workers/screening.worker.ts Comlink-exposed stub
  - comlink installed in package.json
affects:
  - Phase 16 (screening engine — imports from screening/index.ts and types/screening.ts)
  - Phase 17 (screening tab UI — imports MatchResultStub and RiskTier)
  - Phase 18 (results table — imports MatchResult)
  - Phase 21 (simulation engine — imports from simulation/index.ts)

# Tech tracking
tech-stack:
  added: [comlink]
  patterns:
    - "TDD red-green cycle for constants and data shape tests"
    - "Isolation: all v3.0 types in src/types/screening.ts only — never merged into index.ts"
    - "Re-export pattern: constants.ts re-exports from screening.ts so both import paths work"
    - "Stub pattern: never return type on stub functions signals Phase 16+ fills implementation"
    - "Worker pattern: main thread passes SDN data as argument — avoids @data/* alias in worker bundler"

key-files:
  created:
    - src/types/screening.ts
    - src/data/clientNames.ts
    - src/lib/screening/index.ts
    - src/lib/simulation/index.ts
    - src/lib/workers/screening.worker.ts
    - src/lib/__tests__/screening-types.test.ts
    - src/lib/__tests__/clientNames.test.ts
  modified:
    - src/types/talisman.d.ts (appended double-metaphone declaration)
    - src/lib/constants.ts (appended v3.0 re-exports)
    - package.json (comlink added)

key-decisions:
  - "All v3.0 types isolated to src/types/screening.ts — src/types/index.ts is byte-for-byte unchanged"
  - "Comlink.expose() worker API accepts sdnEntries as argument parameter — avoids @data/* alias resolution failure in worker bundler"
  - "constants.ts re-exports from screening.ts so downstream can use either import path without divergence"
  - "screenNames and runSimulation return never in Phase 15 stubs — TypeScript signals unimplemented"

patterns-established:
  - "Phase isolation: new phases create new files; never modify v2.0 type contracts"
  - "TDD green cycle: test written first against nonexistent file, failure confirmed, then implementation written"
  - "Worker SDN data injection: main thread imports sdn.json and passes it as message argument to worker"

requirements-completed: [SCREEN-01, SCREEN-06, SCREEN-07]

# Metrics
duration: 34min
completed: 2026-03-06
---

# Phase 15 Plan 01: Architecture Foundation Summary

**RiskTier union, TIER_THRESHOLDS constants, MatchResult/MatchResultStub interfaces, Comlink worker stub, and 50-name synthetic CLIENT_NAMES dataset — all v3.0 type contracts isolated from v2.0 index.ts**

## Performance

- **Duration:** 34 min
- **Started:** 2026-03-06T10:22:49Z
- **Completed:** 2026-03-06T10:56:49Z
- **Tasks:** 3
- **Files modified:** 9 (7 created, 2 appended)

## Accomplishments

- All v3.0 type contracts established in src/types/screening.ts — 8 exports covering RiskTier, thresholds, constants, MatchResult, MatchResultStub, SimulationSnapshot, ScreeningWorkerApi
- 50-name synthetic CLIENT_NAMES array with intentional composition (12 near-match SDN entries, 28 clear names, 10 algorithm edge cases)
- Comlink-exposed Web Worker stub and module stubs for screening/simulation — Phase 16+ can fill implementations without changing import paths
- 128/128 tests green (114 pre-existing + 14 new); npm run build passes with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create v3.0 type contracts** - `a43d7d0` (feat)
2. **Task 2: Create synthetic client name list** - `f944292` (feat)
3. **Task 3: Create stub modules and append constants** - `3406f24` (feat)

_Note: TDD tasks had RED confirmation runs before GREEN commits_

## Files Created/Modified

- `src/types/screening.ts` — RiskTier, RISK_TIER_VALUES, TIER_THRESHOLDS, MAX_SCREENING_NAMES, COST_OF_MISS_MULTIPLIER, MatchResult, MatchResultStub, SimulationSnapshot, ScreeningWorkerApi
- `src/types/talisman.d.ts` — Appended double-metaphone module declaration for Phase 16
- `src/data/clientNames.ts` — CLIENT_NAMES string[] with 50 synthetic names
- `src/lib/constants.ts` — Appended re-exports of v3.0 constants from screening.ts
- `src/lib/screening/index.ts` — screenNames stub (return never, throws NotImplemented)
- `src/lib/simulation/index.ts` — runSimulation stub (return never, throws NotImplemented)
- `src/lib/workers/screening.worker.ts` — Comlink.expose() Web Worker stub
- `src/lib/__tests__/screening-types.test.ts` — 8 assertions for TIER_THRESHOLDS and RiskTier values
- `src/lib/__tests__/clientNames.test.ts` — 6 assertions for CLIENT_NAMES shape and constraints

## Decisions Made

- All v3.0 types in src/types/screening.ts only — src/types/index.ts is byte-for-byte unchanged per isolation constraint
- Worker receives SDN entries as a function argument — avoids @data/* path alias resolution failures inside worker bundler entry
- constants.ts re-exports from screening.ts so downstream code can import from either location without divergence
- screenNames and runSimulation return `never` in Phase 15 stubs — signals to TypeScript callers that the path is unimplemented; Phase 16 changes the return to the real type

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 16 (Multi-Algorithm Scorer) can import from `@/lib/screening`, `@/types/screening`, `@/data/clientNames` immediately — all import paths are live
- Phase 16 replaces the `throw new Error('Not implemented')` in screening.worker.ts and screening/index.ts with real JW + Double Metaphone + TSR scoring logic
- Double Metaphone type declaration is ready — `import doubleMetaphone from 'talisman/phonetics/double-metaphone'` will resolve without TS error
- Blocker from STATE.md still relevant: Web Worker + Next.js App Router webpack 5 bundling compatibility must be confirmed empirically in Phase 16

---
*Phase: 15-architecture-foundation*
*Completed: 2026-03-06*
