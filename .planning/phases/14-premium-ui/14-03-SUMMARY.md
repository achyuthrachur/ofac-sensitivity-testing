---
phase: 14-premium-ui
plan: 03
subsystem: ui
tags: [framer-motion, motion, tilt-card, stats, 3d-hover, server-component]

# Dependency graph
requires:
  - phase: 14-01
    provides: StatTiltCard component with spring-damped 3D tilt using motion/react
  - phase: 13-animation-pass
    provides: stat-value/stat-number class names and count-up animation wiring in FeatureStatsSection

provides:
  - FeatureStatsSection with StatTiltCard wrapping each of the 4 stat cards for 3D hover tilt
  - bg-white/15 surface opacity upgrade for better tilt readability on dark indigo background

affects: [14-04, 14-05, phase-15-if-any]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "StatTiltCard as Client Component island inside Server Component — use client stays isolated in the leaf component"
    - "key prop moves to the outermost mapped element (StatTiltCard) not the inner content div"
    - "[transform-style:preserve-3d] on inner content div so content participates in 3D space created by StatTiltCard's perspective container"

key-files:
  created: []
  modified:
    - src/app/_components/landing/FeatureStatsSection.tsx
    - src/app/tool/page.tsx

key-decisions:
  - "bg-white/15 on inner div (upgraded from bg-white/10) so the tilt depth effect is visible against the dark crowe-indigo-dark section background"
  - "SpotlightCard migration in tool/page.tsx completed — Cards 3 and 4 were left with mismatched closing tags from stashed 14-02 work; fixed as Rule 3 deviation"

patterns-established:
  - "Server Component wrapping Client Component island: StatTiltCard has 'use client' but FeatureStatsSection remains a Server Component — React treats imported Client Components as leaf islands"

requirements-completed:
  - UIPOL-02

# Metrics
duration: 8min
completed: 2026-03-06
---

# Phase 14 Plan 03: Stat Cards 3D Tilt Summary

**StatTiltCard spring-damped 3D tilt applied to all 4 stats cards in FeatureStatsSection, with bg-white/15 surface upgrade and Phase 13 count-up animation wiring preserved**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-06T02:33:00Z
- **Completed:** 2026-03-06T02:41:08Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Wrapped all 4 stat cards in `StatTiltCard` — each card now tilts up to 7 degrees following the cursor with spring-damped rotation
- Upgraded inner div opacity from `bg-white/10` to `bg-white/15` so the 3D tilt depth reads clearly against the dark indigo section background
- `FeatureStatsSection.tsx` remains a pure Server Component — `StatTiltCard` with its `'use client'` directive acts as an isolated Client Component island
- All `.stat-value`, `.stat-number`, `.stat-prefix`, `.stat-suffix` class names are unchanged — Phase 13 count-up animation targeting via `querySelectorAll` continues to work through wrapper divs

## Task Commits

Each task was committed atomically:

1. **Task 1: Wrap stat cards with StatTiltCard** - `3c2da2d` (feat)

**Plan metadata:** (created after this entry)

## Files Created/Modified

- `src/app/_components/landing/FeatureStatsSection.tsx` — Added StatTiltCard import, wrapped each mapped card div in StatTiltCard with key on outer component, upgraded bg-white/10 to bg-white/15, added [transform-style:preserve-3d] to inner div
- `src/app/tool/page.tsx` — Completed incomplete SpotlightCard migration: fixed mismatched </Card> closing tag on Card 3 and converted Card 4 from Card to SpotlightCard (deviation fix)

## Decisions Made

- `bg-white/15` (not `bg-white/10`) — the tilt effect needs slightly more surface opacity to create visible depth contrast as the card rotates against the dark indigo background
- `key={stat.label}` moves to `StatTiltCard` because it is now the outermost element in the map iteration — React requires the key on the outermost rendered element

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Completed incomplete SpotlightCard migration in tool/page.tsx**
- **Found during:** Task 1 build verification
- **Issue:** A stashed work-in-progress from plan 14-02 was restored by `git stash pop`. It had partially replaced `Card` with `SpotlightCard` for tool form cards (Cards 1 and 2 correctly migrated, Card 3 had its opening tag updated but closing tag left as `</Card>`, Card 4 still used `<Card>`). This caused a JSX parse error that failed the build.
- **Fix:** Changed Card 3's `</Card>` closing tag to `</SpotlightCard>`, and converted Card 4's `<Card>` / `</Card>` to `<SpotlightCard>` / `</SpotlightCard>` with matching className and spotlightColor props consistent with cards 1-3
- **Files modified:** `src/app/tool/page.tsx`
- **Verification:** `npm run build` passed cleanly after fix
- **Committed in:** `3c2da2d` (included in task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to unblock build verification. No scope creep — only completed work that was already partially applied to the file.

## Issues Encountered

- Build failed on first attempt due to pre-existing parse error in `tool/page.tsx` from a stashed partial migration (plan 14-02 work). Stash restored the half-done state when the continuation agent ran `git stash pop`. Fixed under Rule 3.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Stats section 3D tilt is live alongside Phase 13 count-up animation
- All tool form cards now use SpotlightCard consistently (amber glow spotlight on hover)
- Phase 14 plan 04 (if any) can build on the established StatTiltCard + SpotlightCard patterns

---
*Phase: 14-premium-ui*
*Completed: 2026-03-06*
