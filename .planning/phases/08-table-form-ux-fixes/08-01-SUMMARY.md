---
phase: 08-table-form-ux-fixes
plan: 01
subsystem: ui
tags: [react, tanstack-virtual, table, colgroup, virtualizer, select-all, vercel]

# Dependency graph
requires:
  - phase: 07-polish-and-deployment
    provides: Live Vercel deployment, Crowe-branded page.tsx and ResultsTable.tsx

provides:
  - ResultsTable with correctly aligned columns on live Vercel URL (pixel-width grid, fixed 1050px table)
  - Corrected Select All toggle — checked=true selects all rules, checked=false clears all
  - ResultsTable moved outside narrow max-w-2xl form container into its own max-w-screen-xl wrapper

affects: [09-verification-coverage]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Virtual-table alignment: with position:absolute tbody rows (TanStack virtualizer), colgroup
      widths do NOT propagate — every th and td must carry explicit pixel width inline styles;
      the table itself must be a fixed pixel width (not 100%) so header and body rows share
      the same pixel reference frame"
    - "Radix Checkbox onCheckedChange semantics: checked=true fires when user selects (including
      indeterminate->checked promotion); handler must respond by adding items, not removing them"
    - "Layout separation: form cards stay in narrow max-w-2xl container; data-heavy results table
      lives in its own max-w-screen-xl wrapper outside the form div"

key-files:
  created: []
  modified:
    - src/components/ResultsTable.tsx
    - src/app/page.tsx

key-decisions:
  - "colgroup does not propagate to position:absolute virtual rows — every th/td must carry its
    own explicit px width inline style for header and data rows to share the same pixel grid"
  - "Table set to fixed 1050px width (not 100%) so header and body rows reference the same
    pixel baseline; percentage widths on col elements produce header/data misalignment with
    absolute-positioned virtualizer rows"
  - "handleSelectAll fix: checked === true must map to [...CANONICAL_RULE_ORDER]; original code
    had the branches inverted — Select All was clearing rules and deselect was selecting them"
  - "ResultsTable moved outside the max-w-2xl form container into its own max-w-screen-xl px-6
    wrapper so the table has ~1280px of horizontal space for 6 columns"

patterns-established:
  - "Virtual table columns: use explicit px width on every th and td; set table to a fixed px
    width; do not rely on colgroup or percentage widths when tbody rows are absolutely positioned"

requirements-completed:
  - RSLT-04
  - FORM-03

# Metrics
duration: 87min
completed: 2026-03-05
---

# Phase 8 Plan 01: Table & Form UX Fixes Summary

**Virtualizer column alignment fixed with explicit per-cell px widths and fixed 1050px table; Select All toggle inversion corrected in one-line swap**

## Performance

- **Duration:** 87 min (including 3 human-verify iterations)
- **Started:** 2026-03-05T02:14:39Z
- **Completed:** 2026-03-05T03:41:08Z
- **Tasks:** 4 (Tasks 1-3 automated, Task 4 human-verify — approved on 3rd iteration)
- **Files modified:** 2

## Accomplishments

- Corrected `handleSelectAll` in `page.tsx` — one-character logic inversion fix; Select All now selects all rules when clicked, clears when clicked again
- Fixed ResultsTable column alignment for TanStack virtualizer: switched from `colgroup` percentage widths to explicit pixel widths on every `th` and `td`; set table to `1050px` fixed width
- Moved `ResultsTable` outside the narrow `max-w-2xl` form container into a `max-w-screen-xl` wrapper so the table has room to render 6 columns
- Deployed 5 commits to Vercel production; human verified on live URL https://ofac-sensitivity-testing.vercel.app

## Task Commits

Each task committed atomically:

1. **Task 1: Fix ResultsTable colgroup widths + thead sticky bg** - `dec745c` (fix)
2. **Task 2: Fix handleSelectAll inversion** - `85b7884` (fix)
3. **Task 3: Deploy to Vercel production** - `85b7884` pushed + deployed
4. **Deviation 3b: Break ResultsTable out of narrow form container** - `0fae85d` (fix)
5. **Deviation 3c: Switch COL_WIDTHS to explicit pixel values** - `a145f06` (fix)
6. **Deviation 3d: Apply explicit px width to every th/td; fixed table width** - `eae0a90` (fix)

## Files Created/Modified

- `src/components/ResultsTable.tsx` — Removed colgroup; added explicit `style={{ width }}` on every `th` and `td` matching `COL_WIDTHS`; changed table from `width: '100%'` to `width: '1050px'`; removed inner `mx-auto max-w-5xl px-4` wrapper div
- `src/app/page.tsx` — Fixed `handleSelectAll` branch inversion; moved `<ResultsTable>` outside `max-w-2xl` form div into a separate `max-w-screen-xl px-6` container

## Decisions Made

- **colgroup does not propagate to absolutely-positioned rows.** With TanStack virtualizer, `<tbody>` rows are `position: absolute` — they exist outside the normal table flow. `colgroup` widths are resolved at table-flow layout time and do not apply to absolutely-positioned elements. The only reliable fix is to put explicit pixel widths on every `th` and `td` individually.
- **Fixed pixel table width (1050px) over 100%.** When the table uses `width: 100%`, the "100%" reference changes between the header (table container width) and the absolutely-positioned rows (which also say `width: 100%` but against their own positioning context). Setting a concrete `1050px` gives both header and data rows the same fixed reference.
- **handleSelectAll inversion.** Radix `onCheckedChange(true)` fires when the user clicks to select — meaning "I want all rules on." The original code responded to `checked === true` by clearing `ruleIds`. Swapping the branches (one character: swap `[]` and `[...CANONICAL_RULE_ORDER]`) is the complete fix.
- **Layout separation.** Form cards staying in `max-w-2xl` is intentional — they're input forms that should be narrow and centered. The results table is data-heavy and benefits from maximum horizontal space, so it lives in its own `max-w-screen-xl` container.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Table not filling screen width — ResultsTable inside narrow form container**
- **Found during:** Task 4 human verify (first iteration)
- **Issue:** `<ResultsTable>` was rendered inside the same `max-w-2xl` (672px) div as the form cards. A 6-column table in 672px is too narrow for balanced column proportions
- **Fix:** Moved `<ResultsTable>` outside the form div; created a separate `max-w-screen-xl px-6` wrapper at the bottom of the page JSX. Removed the internal `mx-auto max-w-5xl px-4` wrapper from `ResultsTable` itself
- **Files modified:** `src/app/page.tsx`, `src/components/ResultsTable.tsx`
- **Verification:** Human verify iteration 2 confirmed table spans page width
- **Committed in:** `0fae85d`

**2. [Rule 1 - Bug] Header and data rows misaligned — colgroup percentages don't apply to absolute-positioned rows**
- **Found during:** Task 4 human verify (second iteration — screenshot showed misaligned columns)
- **Issue:** Percentage `<col>` widths are resolved against the table's intrinsic width at layout time, before virtualizer rows are painted absolutely. Header cells and virtual data cells ended up in different pixel positions
- **Fix (iteration 1):** Switched `COL_WIDTHS` from percentage strings to explicit pixel objects `{ width: '260px', minWidth: '260px' }` etc.; `colgroup` retained
- **Fix (iteration 2 — final):** Removed `colgroup` entirely; applied explicit `style={{ width: COL_WIDTHS[i].width }}` inline on every `th` and every `td`; changed table `width` from `'100%'` to `'1050px'` (sum of all column widths)
- **Files modified:** `src/components/ResultsTable.tsx`
- **Verification:** Human verify iteration 3 confirmed correct alignment on live URL
- **Committed in:** `a145f06` (pixel COL_WIDTHS), `eae0a90` (per-cell inline styles + fixed table width)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs found during human verification)
**Impact on plan:** Both fixes were directly caused by the original task's changes and feedback. No scope creep. The final implementation is more robust than the plan specified — explicit per-cell widths are the canonical solution for virtualizer column alignment.

## Issues Encountered

- The plan specified `colgroup` with `minWidth` fallbacks as the fix for column widths. This was insufficient: `colgroup` does not propagate to `position: absolute` rows. Three human-verify iterations were required to converge on the correct fix (per-cell explicit px widths + fixed table pixel width). Each iteration was a targeted one-file edit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 8 complete — both RSLT-04 (table column rendering) and FORM-03 (Select All toggle) gaps closed
- Phase 9 (Verification Coverage) can now proceed: run gsd-verifier for phases 03 and 07; run Nyquist wave-0 for transformation engine
- Live demo at https://ofac-sensitivity-testing.vercel.app is client-presentation ready

## Self-Check: PASSED

- FOUND: `.planning/phases/08-table-form-ux-fixes/08-01-SUMMARY.md`
- FOUND: commit `dec745c` (Task 1 — colgroup minWidth + thead bg)
- FOUND: commit `85b7884` (Task 2 — handleSelectAll inversion fix)
- FOUND: commit `0fae85d` (Deviation 3b — table outside form container)
- FOUND: commit `a145f06` (Deviation 3c — explicit pixel COL_WIDTHS)
- FOUND: commit `eae0a90` (Deviation 3d — per-cell inline widths + fixed table px)

---
*Phase: 08-table-form-ux-fixes*
*Completed: 2026-03-05*
