---
phase: 12-icon-pass
plan: 02
subsystem: ui
tags: [iconsax-reactjs, icons, react, tailwind, landing-page, TwoTone, Bold]

# Dependency graph
requires:
  - phase: 12-icon-pass/12-01
    provides: iconsax-reactjs installed; tool/page.tsx and ResultsTable.tsx already using Iconsax icons

provides:
  - HowItWorksSection step number badges replaced with TwoTone Iconsax icons (Setting4/Refresh/DocumentDownload)
  - FeatureStatsSection stat cards each have a Bold amber icon above the number (Document/Setting4/Global/Refresh2)
  - stat-number className and data-value attributes preserved for Phase 13 count-up animation targeting

affects: [13-animations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TwoTone icon on white card background: wrap in bg-crowe-amber/10 w-12 h-12 rounded-full; color=var(--crowe-indigo-dark) — soft amber ring, readable indigo icon"
    - "Bold icon on dark indigo background: use color=var(--crowe-amber-core) (#F5A800) directly — TwoTone dim on dark, Bold is maximum contrast"
    - "STEP_ICONS/STAT_ICONS const arrays with 'as const': index-based lookup in .map() avoids prop drilling and keeps STEPS/STATS data pure"

key-files:
  created: []
  modified:
    - src/app/_components/landing/HowItWorksSection.tsx
    - src/app/_components/landing/FeatureStatsSection.tsx

key-decisions:
  - "TwoTone variant for HowItWorksSection (white card bg) — amber/10 ring wrapper softens the dual-tone icon and ties to Crowe amber without harsh badge"
  - "Bold variant for FeatureStatsSection (dark indigo bg) — TwoTone secondary path dims on dark; Bold gives full amber fill for maximum contrast"
  - "Icon arrays as 'as const' tuples with index lookup — cleaner than adding icon field to STEPS/STATS data objects"

patterns-established:
  - "Icon array pattern: define parallel STEP_ICONS/STAT_ICONS const arrays with 'as const', look up by index in map() — keeps data objects clean"
  - "Light background icon wrapper: bg-crowe-amber/10 rounded-full for TwoTone icons on white cards"
  - "Dark background icon: explicit color=var(--crowe-amber-core) with Bold variant — no opacity or wrapper needed"

requirements-completed: [ICON-04]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 12 Plan 02: Icon Pass Summary

**TwoTone step concept icons (Setting4/Refresh/DocumentDownload) replace number badges in HowItWorksSection; Bold amber icons (Document/Setting4/Global/Refresh2) added above stats in FeatureStatsSection — all 4 landing-page Iconsax files complete**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-05T22:38:00Z
- **Completed:** 2026-03-05T22:43:00Z
- **Tasks:** 1 (Task 2 is a human visual checkpoint — awaiting approval)
- **Files modified:** 2

## Accomplishments
- HowItWorksSection: amber number badges (1/2/3) replaced with TwoTone Iconsax icons in soft amber/10 circle wrappers — visual hierarchy maintained, more polished look
- FeatureStatsSection: Bold amber icons (32px) added above each stat number on the dark indigo background — Document, Setting4, Global, Refresh2 chosen for semantic alignment with each stat
- stat-number className and data-value attributes preserved exactly for Phase 13 count-up animation targeting
- Build passes (exit 0), 114/114 tests pass, no Lucide imports in any target file

## Task Commits

1. **Task 1: TwoTone icons to HowItWorksSection and Bold icons to FeatureStatsSection** - `292d941` (feat)

## Files Created/Modified
- `src/app/_components/landing/HowItWorksSection.tsx` - Import Setting4/Refresh/DocumentDownload; STEP_ICONS array; index-based map with TwoTone icons in amber/10 wrapper replacing number badges
- `src/app/_components/landing/FeatureStatsSection.tsx` - Import Document/Setting4/Global/Refresh2; STAT_ICONS array; index-based map with Bold amber icons above stat numbers

## Decisions Made
- TwoTone chosen for HowItWorksSection (white cards) — dual-tone indigo reads clearly on white, and the bg-crowe-amber/10 wrapper creates a subtle warm ring referencing the old amber badge without recreating the harsh filled style
- Bold chosen for FeatureStatsSection (dark indigo bg) — TwoTone's secondary path becomes nearly invisible on dark backgrounds; Bold provides full amber fill with maximum visual pop
- Icon arrays use `as const` tuple typing — TypeScript validates array length matches STEPS/STATS count at compile time

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Visual Checkpoint

Task 2 is a `checkpoint:human-verify` — awaiting user confirmation that icons render correctly in browser at http://localhost:3000 (HowItWorksSection and FeatureStatsSection) and http://localhost:3000/tool.

## Next Phase Readiness
- All 4 iconsax-reactjs target files complete: tool/page.tsx, ResultsTable.tsx, HowItWorksSection.tsx, FeatureStatsSection.tsx
- Phase 13 animation targets pre-wired: `.stat-number` className + `data-value` attribute on FeatureStatsSection span elements
- Phase 13 can begin immediately after visual checkpoint approval — no blockers

---
*Phase: 12-icon-pass*
*Completed: 2026-03-05*
