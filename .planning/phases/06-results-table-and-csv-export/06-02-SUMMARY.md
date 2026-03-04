---
phase: 06-results-table-and-csv-export
plan: 02
subsystem: ui
tags: [react, virtualization, tanstack-react-virtual, csv, typescript, nextjs]

# Dependency graph
requires:
  - phase: 06-results-table-and-csv-export-01
    provides: resultsUtils.ts pure helpers (computeCatchRate, buildCsvString, buildCsvFilename, triggerCsvDownload)
  - phase: 05-parameter-form
    provides: rows: ResultRow[] and clientName state exposed in page.tsx for Phase 6 mount
provides:
  - Virtualized 6-column ResultsTable client component with sort, catch-rate summary, and CSV download
  - page.tsx Phase 6 mount point replaced — full end-to-end flow complete
affects:
  - 07-polish-and-deployment

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useVirtualizer pattern: fixed-height scroll container + absolute-positioned tbody rows + colgroup for column widths"
    - "Early-return null guard after hooks — hooks declared unconditionally, guard placed post-declaration"
    - "useMemo sorted copy — [... rows].sort() never mutates prop; sortedRows fed to virtualizer count"
    - "CSV download as pure side-effect in onClick — buildCsvString + triggerCsvDownload called only in handler, not during render"

key-files:
  created:
    - src/components/ResultsTable.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "Sort default is descending (highest score first) — highest-risk matches surface immediately"
  - "Scroll container fixed at 600px height — locked in CONTEXT.md"
  - "Table container max-w-5xl — locked decision for readable column widths"
  - "Download uses unsorted original rows, not sortedRows — full dataset, not just current view"
  - "Sticky header requires explicit bg-white Tailwind class — without it transparent header shows rows scrolling beneath"
  - "colgroup with percentage column widths required — absolute-positioned tr elements collapse without explicit column dimensions"

patterns-established:
  - "ResultsTable returns null when rows.length === 0 — no empty table shell ever shown"
  - "Catch-rate sentence uses DEFAULT_CATCH_THRESHOLD from constants — single source of truth for threshold value"
  - "Score cell: Math.round(score * 100)% + caught indicator — integer percent display matches human-readable expectation"

requirements-completed: [RSLT-01, RSLT-02, RSLT-03, RSLT-04, EXPO-01, EXPO-02, EXPO-03]

# Metrics
duration: ~25min
completed: 2026-03-04
---

# Phase 6 Plan 02: Results Table and CSV Export Summary

**Virtualized 6-column ResultsTable with @tanstack/react-virtual, sortable Score column, catch-rate summary, and UTF-8 BOM CSV download — all 7 requirements verified by human walkthrough**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-04T22:00:00Z (estimated)
- **Completed:** 2026-03-04T22:22:18Z
- **Tasks:** 2 implementation tasks + 1 human-verify checkpoint
- **Files modified:** 2

## Accomplishments

- Built `ResultsTable` with `useVirtualizer` — 2,000+ row datasets scroll smoothly with ~15 DOM rows at any time
- Score column header is click-sortable (asc/desc), defaulting to highest score first; catch-rate summary sentence auto-calculates from `computeCatchRate`
- CSV download produces a `ofac-sensitivity-{clientName}-{date}.csv` file with UTF-8 BOM so Arabic, Chinese, and Cyrillic characters open correctly in Microsoft Excel
- Human verified all 6 checklist items (RSLT-01 through RSLT-04, EXPO-01 through EXPO-03) — approved with no issues

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement ResultsTable.tsx** - `5842aef` (feat)
2. **Task 2: Wire ResultsTable into page.tsx** - `6d2851b` (feat)
3. **Task 3: Human verify checkpoint** - approved by user (no commit)

## Files Created/Modified

- `src/components/ResultsTable.tsx` - Named-export client component: useVirtualizer, sort state, catch-rate display, CSV download trigger
- `src/app/page.tsx` - Phase 6 mount comment replaced with `<ResultsTable rows={rows} clientName={clientName} />`

## Decisions Made

- **Sticky header needs explicit background:** Without `bg-white` on `<thead>`, the sticky header is transparent and rows scroll visibly beneath it — added Tailwind class.
- **colgroup required for absolute-positioned rows:** Virtual rows use `position: absolute` which collapses all columns to zero width without explicit `<colgroup><col>` percentage widths.
- **Download uses original `rows`, not `sortedRows`:** The CSV export always delivers the full unsorted dataset; sort state is a view-only concern.
- **Score cell as integer percent:** `Math.round(similarityScore * 100)%` with `✓`/`✗` indicator — matches what was confirmed working in the human verify step.

## Deviations from Plan

None — plan executed exactly as written. All critical implementation pitfalls (colgroup, sticky header background, tbody height for virtualizer) were pre-documented in the plan and applied correctly on first attempt.

## Issues Encountered

None — `npm run build` passed clean, `npx tsc --noEmit` zero errors, `npx vitest run` full suite green, and human verify approved all 6 items.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 is fully complete: all 7 requirements (RSLT-01 through RSLT-04, EXPO-01 through EXPO-03) satisfied and human-verified
- The application end-to-end flow is working: consultant fills form → submits → sees virtualized results table → downloads CSV
- Phase 7 (Polish and Deployment) is unblocked — Crowe branding, UX refinements, and Vercel production deployment are the remaining deliverables

---
*Phase: 06-results-table-and-csv-export*
*Completed: 2026-03-04*

## Self-Check: PASSED

- FOUND: `.planning/phases/06-results-table-and-csv-export/06-02-SUMMARY.md`
- FOUND: commit `5842aef` (Task 1 — implement ResultsTable.tsx)
- FOUND: commit `6d2851b` (Task 2 — wire ResultsTable into page.tsx)
