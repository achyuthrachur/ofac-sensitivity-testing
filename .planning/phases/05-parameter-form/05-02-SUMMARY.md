---
phase: 05-parameter-form
plan: 02
subsystem: ui
tags: [react, nextjs, shadcn, useTransition, server-action, form]

# Dependency graph
requires:
  - phase: 05-01
    provides: formUtils helpers (parseEntityCount, toggleRegion, toggleRule, deriveSelectAllState, buildRunParams)
  - phase: 04-server-action
    provides: runTest server action and ActionResult/ResultRow types
  - phase: 03-transformation-engine
    provides: CANONICAL_RULE_ORDER and RULE_LABELS from rules/index.ts barrel
provides:
  - src/app/page.tsx — complete interactive 4-card parameter form with all states
  - rows: ResultRow[] in page state — Phase 6 mounts ResultsTable here without refactor
  - Browser tab title "OFAC Sensitivity Testing — Crowe" via updated layout metadata
affects:
  - 06-results-table — mounts ResultsTable into the rows state defined here

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useTransition wrapping async server action call for pending/loading state
    - Radix Checkbox indeterminate tri-state via deriveSelectAllState helper
    - Module-level REGION_LABELS and ENTITY_DISPLAY const maps for render-time lookup
    - Error banner conditional render inside Client Name card (result?.ok === false guard)
    - Phase 6 placeholder comment marks exact JSX insertion point for ResultsTable

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/layout.tsx

key-decisions:
  - "No client-side inline field validation — deferred per CONTEXT.md; Zod handles server-side"
  - "No toast notifications — deferred per CONTEXT.md; error banner inside card is sufficient"
  - "rows: ResultRow[] exposed in page state (not derived inside action callback) so Phase 6 can mount ResultsTable without refactoring handleSubmit"

patterns-established:
  - "useTransition pattern: startTransition(async () => { const r = await serverAction(params); setState(r); }) — isPending drives all disabled props and button label"
  - "Tri-state Select All: deriveSelectAllState(ruleIds) returns true | false | 'indeterminate'; Radix Checkbox accepts all three natively"

requirements-completed: [FORM-01, FORM-02, FORM-03, FORM-04]

# Metrics
duration: ~30min
completed: 2026-03-04
---

# Phase 5 Plan 02: Parameter Form (page.tsx + layout metadata) Summary

**4-card interactive parameter form wired to runTest server action via useTransition, with tri-state Select All, loading spinner, red error banner, and success count placeholder**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-04
- **Completed:** 2026-03-04
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Replaced Next.js scaffold page.tsx with full 4-card form: Entity Counts (number inputs), Linguistic Regions (checkboxes), Degradation Rules (Select All + 10 individual checkboxes), Client Name (text input + submit)
- Wired form to runTest server action using useTransition — button disables with Loader2 spinner and "Running..." label while pending; all inputs also disabled during run
- Implemented tri-state Select All checkbox (true / false / 'indeterminate') backed by deriveSelectAllState; indeterminate state renders the Radix dash indicator correctly
- Error path: result.ok === false renders red banner inside Client Name card above submit button
- Success path: "{N} results generated" message below all cards; rows: ResultRow[] populated in state for Phase 6's ResultsTable mount point
- Updated layout.tsx metadata title to "OFAC Sensitivity Testing — Crowe"
- Human checkpoint: all 15 verification items passed by reviewer

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement page.tsx form and update layout.tsx metadata** - `0a3be9e` (feat)
2. **Task 2: Human-verify checkpoint** - approved by reviewer (no commit — verification only)

## Files Created/Modified

- `src/app/page.tsx` — Full interactive 4-card parameter form with useTransition, error/success states, and Phase 6 placeholder comment
- `src/app/layout.tsx` — Updated metadata.title to "OFAC Sensitivity Testing — Crowe" and metadata.description

## Decisions Made

- No client-side inline field validation: deferred per CONTEXT.md; Zod on the server action handles all validation and surfaces errors via result.ok === false
- No toast notifications: deferred per CONTEXT.md; inline error banner inside the Client Name card is the approved UX
- rows state declared at page level (not inside the transition callback) so Phase 6 can mount `<ResultsTable rows={rows} />` at the JSX placeholder comment without restructuring handleSubmit

## Deviations from Plan

None — plan executed exactly as written. All 15 human-verify checklist items confirmed on first review pass.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 (Results Table) can mount `<ResultsTable rows={rows} />` at the JSX placeholder comment in page.tsx without any refactor
- rows: ResultRow[] is already typed and populated on successful runTest calls
- No blockers for Phase 6

---
*Phase: 05-parameter-form*
*Completed: 2026-03-04*
