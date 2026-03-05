---
phase: 11-tool-layout-explanations
plan: "01"
subsystem: tool-ui
tags: [layout, shadcn, table-fix, two-panel]
dependency_graph:
  requires: []
  provides: [tabs-component, two-panel-layout, table-width-fix]
  affects: [src/app/tool/page.tsx, src/components/ResultsTable.tsx, src/components/ui/tabs.tsx]
tech_stack:
  added: [shadcn-tabs, radix-ui-tabs]
  patterns: [two-panel-flex-layout, independent-panel-scroll, virtualizer-scroll-container-pinning]
key_files:
  created:
    - src/components/ui/tabs.tsx
  modified:
    - src/components/ResultsTable.tsx
    - src/app/tool/page.tsx
decisions:
  - "Pin ResultsTable scroll container to explicit width:1050px (matching inner table) to eliminate right-side gap when virtualizer uses position:absolute rows"
  - "h-[calc(100vh-48px)] for tool panel height to account for tool/layout.tsx footer without overflow"
  - "Left panel w-[420px] flex-shrink-0 — fixed width prevents form reflow as right panel content changes"
metrics:
  duration: "16 min"
  completed: "2026-03-05T18:10:03Z"
  tasks_completed: 2
  files_changed: 3
---

# Phase 11 Plan 01: Tabs Install + Table Fix + Two-Panel Layout Summary

**One-liner:** shadcn Tabs installed, TABLE-01 scroll-container gap fixed with explicit width:1050px, tool/page.tsx restructured into a 420px left panel + flex-1 right panel layout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install shadcn Tabs + fix ResultsTable scroll container width | 0f39c7c | src/components/ui/tabs.tsx, src/components/ResultsTable.tsx |
| 2 | Restructure tool/page.tsx into two-panel layout | 689fd80 | src/app/tool/page.tsx |

## What Was Built

### Task 1: shadcn Tabs + TABLE-01 Fix

**shadcn Tabs** (`src/components/ui/tabs.tsx`) was installed via `npx shadcn@latest add tabs`. The component exports `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` built on Radix UI primitives — ready for Plan 02 to wire up.

**TABLE-01 bug** fixed in `ResultsTable.tsx`: the outer scroll container `div` now has `width: '1050px', overflowX: 'auto'` in addition to `height: '600px', overflowY: 'auto'`. The inner `<table>` was already fixed at `width: 1050px` and the virtualizer's absolutely-positioned `<tr>` elements each declared `width: '1050px'`. Without pinning the container to the same 1050px, the container grew to fill available space but the scroll track stopped at the table edge — leaving a blank strip on the right. This fix makes container and content the same width, eliminating the gap.

### Task 2: Two-Panel Layout

`tool/page.tsx` return block was replaced entirely:

- **Outer wrapper:** `div.bg-page.flex.h-[calc(100vh-48px)]` — fills viewport height minus the 48px footer from `tool/layout.tsx`, preventing the footer from being pushed off-screen.
- **Left panel:** `div.w-[420px].flex-shrink-0.overflow-y-auto.border-r.border-border.p-6.space-y-6` — fixed 420px width, independently scrollable, contains: page heading, all 4 Cards (Entity Counts, Linguistic Regions, Degradation Rules, Client Name), and Run button.
- **Right panel:** `div.flex-1.overflow-y-auto.p-6` — grows to fill remaining width, independently scrollable, shows `ResultsTable` when `rows.length > 0`, otherwise shows placeholder text.

All state, handlers, and component imports are unchanged. No new imports were added (Tabs will be wired in Plan 02).

## Verification Results

- `npm run build` — passes, no TypeScript errors
- `npm run test -- --run` — 114 tests, 14 test files, all green
- No `max-w-2xl` remains in tool/page.tsx
- `src/components/ui/tabs.tsx` exists with correct exports
- Scroll container in ResultsTable.tsx contains `width: '1050px', overflowX: 'auto'`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All created files confirmed on disk. All task commits confirmed in git log.
