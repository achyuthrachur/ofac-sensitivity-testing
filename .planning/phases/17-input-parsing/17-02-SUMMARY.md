---
phase: 17-input-parsing
plan: 02
subsystem: ui
tags: [react, sheetjs, xlsx, file-upload, drag-drop, validation, screening]

# Dependency graph
requires:
  - phase: 17-01
    provides: parseCsv, parseExcel, parsePaste, ParseResult, ValidationWarning — pure parsing module InputPanel delegates to
  - phase: 15-architecture-foundation
    provides: BenchmarkPanel pattern for styling, tool/page.tsx tab structure for placement
provides:
  - InputPanel component (CSV Upload / Excel Upload / Paste tabs) at src/components/screening/InputPanel.tsx
  - activeNames state in tool/page.tsx initialized to CLIENT_NAMES, updateable via InputPanel
  - User-facing entry point for Screening Mode — replaces hardcoded 50-name list with live upload/paste UI
affects:
  - 18-screening-worker (activeNames flows to worker as names-to-screen in Phase 18)
  - 19-results-display (activeNames.length informs result count in Phase 19)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DropZone pattern: native HTML drag-drop + click-to-browse, no library, shared between CSV/Excel tabs"
    - "Delegation pattern: UI component owns zero parsing logic — all delegates to parseInput.ts"
    - "Live-count pattern: inline parsePaste() derivation on every textarea keystroke, no debounce, no extra state"
    - "XLSX import isolation: parseInput.ts owns SheetJS, InputPanel never imports xlsx directly"

key-files:
  created:
    - src/components/screening/InputPanel.tsx
  modified:
    - src/app/tool/page.tsx

key-decisions:
  - "InputPanel does not import XLSX directly — parseInput.ts encapsulates SheetJS; noUnusedLocals would fail the build otherwise"
  - "Tab switch clears result state and resets pasteValue to prevent stale parse results showing under the wrong tab"
  - "DropZone resets input.value after selection so same file can be re-uploaded without a page refresh"
  - "WarningList shows 5 rows by default with expand toggle — avoids wall of text for lists with many duplicates"

patterns-established:
  - "Screening input delegation: UI collects file/text, passes to parseInput.ts, lifts string[] to parent via onNamesLoaded callback"
  - "Count badge: green when > 0, muted when 0, always shows activeNames.length from parent (not local parsed count)"

requirements-completed: [SCREEN-02, SCREEN-03, SCREEN-04, SCREEN-05]

# Metrics
duration: 24min
completed: 2026-03-07
---

# Phase 17 Plan 02: Input Parsing Summary

**Three-tab InputPanel (CSV / Excel / Paste) wired into tool/page.tsx with activeNames state replacing the hardcoded 50-name CLIENT_NAMES display — client-side XLSX parsing via SheetJS, live paste counts, and per-row validation warnings**

NOTE: Plan paused at Task 3 (checkpoint:human-verify). Tasks 1 and 2 complete; browser verification pending user approval.

## Performance

- **Duration:** 24 min
- **Started:** 2026-03-07T04:56:35Z
- **Completed:** 2026-03-07T05:20:01Z (partial — at checkpoint)
- **Tasks:** 2/3 complete (Task 3 is human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- InputPanel component with three tabs (CSV Upload, Excel Upload, Paste) + shared DropZone
- Client-side XLSX parsing via parseExcel() — no server round-trip, no 413 error risk
- Live paste count updates on every keystroke, blocking error for > 10,000 names
- activeNames state in tool/page.tsx initialized to CLIENT_NAMES (50 names), updated via setActiveNames
- BenchmarkPanel unchanged below InputPanel; Sensitivity Test tab untouched
- npm run build: zero TypeScript errors; 174/174 vitest tests green

## Task Commits

1. **Task 1: Build InputPanel component** - `31d2a0c` (feat)
2. **Task 2: Wire activeNames state into tool/page.tsx** - `be800d8` (feat)
3. **Task 3: Verify InputPanel in browser** - PENDING (checkpoint:human-verify)

## Files Created/Modified
- `src/components/screening/InputPanel.tsx` - Three-tab upload/paste UI; delegates all parsing to parseInput.ts; calls onNamesLoaded(names) when no blocking error
- `src/app/tool/page.tsx` - Added activeNames state (initialized to CLIENT_NAMES), InputPanel import, replaced Pre-loaded Names block with InputPanel

## Decisions Made
- InputPanel does not import XLSX directly — parseInput.ts owns SheetJS entirely. The plan spec listed XLSX as a key_link from InputPanel, but noUnusedLocals in tsconfig would fail the build. Delegation is the correct pattern since parseExcel() accepts ArrayBuffer and InputPanel only calls file.arrayBuffer().
- Tab switching clears result state to prevent a CSV result persisting when user switches to the Paste tab.
- DropZone resets input.value after file selection so the same file can be re-selected without refreshing.
- WarningList truncates at 5 visible items with an expand toggle — avoids overwhelming UI for lists with many duplicate/empty rows.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused XLSX import causing TypeScript build failure**
- **Found during:** Task 1 (InputPanel.tsx build check)
- **Issue:** Plan spec listed `import * as XLSX from 'xlsx'` in InputPanel. TypeScript's noUnusedLocals: true caused `'XLSX' is declared but its value is never read` build error.
- **Fix:** Removed the XLSX import from InputPanel. parseInput.ts already imports and uses XLSX internally. InputPanel calls parseExcel(buffer) which returns ParseResult — no direct XLSX usage needed.
- **Files modified:** src/components/screening/InputPanel.tsx
- **Verification:** npm run build exits 0 after removal
- **Committed in:** 31d2a0c (Task 1 commit, fix applied before commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Necessary correctness fix — plan's XLSX import was for a link-verification pattern that doesn't apply to the compiled code. Delegation pattern is cleaner and correct.

## Issues Encountered
- TypeScript noUnusedLocals rejected the XLSX module-level import specified in plan interfaces. Resolved by removing the import from InputPanel (parseInput.ts owns SheetJS — InputPanel never calls XLSX directly).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- InputPanel complete; awaiting browser verification (Task 3 checkpoint)
- After approval: activeNames string[] is ready to flow to Phase 18 screening worker
- Phase 18 will receive activeNames as the names-to-screen argument to screenNames()

---
*Phase: 17-input-parsing*
*Completed: 2026-03-07*
