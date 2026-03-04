---
phase: 06-results-table-and-csv-export
plan: 01
subsystem: testing
tags: [csv, vitest, tdd, resultsUtils, tanstack-virtual, catch-rate, filename-sanitization]

# Dependency graph
requires:
  - phase: 04-server-action
    provides: ResultRow type with caught boolean and similarityScore fields
  - phase: 05-parameter-form
    provides: clientName from RunParams for CSV filename generation
provides:
  - Pure helper library for CSV generation, filename building, and catch-rate computation
  - escapeCsvField (RFC 4180 compliant)
  - buildCsvString (header + data, score as integer)
  - sanitizeClientName (trim/replace/strip/collapse/fallback)
  - buildCsvFilename (ofac-sensitivity-{client}-YYYY-MM-DD.csv)
  - computeCatchRate (caught/total/percent via row.caught boolean)
  - triggerCsvDownload (BOM-prefixed, browser-only)
affects:
  - 06-02-results-table (imports from @/lib/resultsUtils)
  - 06-03-csv-export (uses buildCsvString, buildCsvFilename, triggerCsvDownload)

# Tech tracking
tech-stack:
  added:
    - "@tanstack/react-virtual ^3.13.19 — virtualised row rendering for ResultsTable (Plan 02)"
  patterns:
    - "TDD RED-GREEN: failing import triggers RED, implementation achieves GREEN in single pass"
    - "All business logic extracted to pure helpers in resultsUtils.ts — component stays thin"
    - "RFC 4180 CSV escaping — wrap on comma/double-quote/newline, double embedded quotes"
    - "Math.round(score * 100) for integer similarity score in CSV output"
    - "sanitizeClientName: trim → spaces-to-hyphens → strip non-alphanum → collapse → trim-hyphens → fallback"

key-files:
  created:
    - src/lib/resultsUtils.ts
    - src/lib/__tests__/resultsUtils.test.ts
  modified:
    - package.json (added @tanstack/react-virtual)
    - package-lock.json

key-decisions:
  - "triggerCsvDownload has no typeof window guard — it is only called from onClick handlers, not SSR paths"
  - "buildCsvString does not sort rows — caller passes pre-ordered array; no internal sort"
  - "sanitizeClientName collapses \\s+ before stripping non-alphanum to prevent double-hyphens from multi-char symbols"
  - "Similarity Score in CSV is an integer (Math.round * 100), not a 0-1 float — matches human-readable expectations"
  - "UTF-8 BOM prepended in triggerCsvDownload so Excel opens CSV with correct encoding on Windows"

patterns-established:
  - "resultsUtils import pattern: named imports from '@/lib/resultsUtils'"
  - "makeRow() test helper: Partial<ResultRow> overrides with safe defaults — reuse in Plan 02 and 03 tests"
  - "triggerCsvDownload: prepend BOM, Blob type 'text/csv;charset=utf-8;', removeChild then revokeObjectURL"

requirements-completed: [RSLT-02, RSLT-03, EXPO-01, EXPO-02, EXPO-03]

# Metrics
duration: 8min
completed: 2026-03-04
---

# Phase 6 Plan 01: Results Utils Summary

**RFC 4180 CSV helpers, catch-rate computation, and sanitized filename builder extracted to a pure resultsUtils.ts library — 25 tests green, @tanstack/react-virtual installed for Plan 02**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-04T22:01:00Z
- **Completed:** 2026-03-04T22:09:19Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Installed `@tanstack/react-virtual` so Plan 02 (ResultsTable) can start without an install step
- Implemented all 6 exported helpers in `resultsUtils.ts` with zero type errors
- Wrote 25 Vitest tests covering every behaviour clause in the plan spec — all green, no regressions across the 114-test full suite

## Task Commits

1. **Task 1: Wave 0 — install dependency and create RED test stub** - `e47f01f` (test)
2. **Task 2: Wave 1 — implement resultsUtils.ts (GREEN)** - `d817af7` (feat)

## Files Created/Modified

- `src/lib/resultsUtils.ts` — Six exported pure helpers: escapeCsvField, buildCsvString, sanitizeClientName, buildCsvFilename, computeCatchRate, triggerCsvDownload
- `src/lib/__tests__/resultsUtils.test.ts` — 25 Vitest unit tests covering all pure helpers; makeRow() helper for safe ResultRow construction
- `package.json` — Added `@tanstack/react-virtual ^3.13.19` to dependencies
- `package-lock.json` — Lockfile updated after install

## Decisions Made

- `triggerCsvDownload` has no `typeof window` guard — called only from click handlers, never from SSR; guard would add noise without value
- `buildCsvString` does not sort rows internally — caller controls ordering; function is a pure serializer
- Score written as `Math.round(score * 100)` integer — avoids floating-point noise like `0.9300000000001` in CSV cells; easier for analysts to read
- UTF-8 BOM prepended so Excel on Windows opens the CSV with correct encoding out of the box

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/lib/resultsUtils.ts` is ready for import by `ResultsTable.tsx` (Plan 02) via `from '@/lib/resultsUtils'`
- `@tanstack/react-virtual` is installed and available for the virtualised table component
- `makeRow()` test helper pattern can be reused in Plan 02 and 03 test files

---
*Phase: 06-results-table-and-csv-export*
*Completed: 2026-03-04*

## Self-Check: PASSED

- FOUND: src/lib/resultsUtils.ts
- FOUND: src/lib/__tests__/resultsUtils.test.ts
- FOUND: .planning/phases/06-results-table-and-csv-export/06-01-SUMMARY.md
- FOUND: commit e47f01f (RED test stubs)
- FOUND: commit d817af7 (GREEN implementation)
- All 6 functions exported: escapeCsvField, buildCsvString, sanitizeClientName, buildCsvFilename, computeCatchRate, triggerCsvDownload
- @tanstack/react-virtual ^3.13.19 present in package.json
