---
phase: 14-premium-ui
plan: 01
subsystem: ui
tags: [motion, react-bits, animation, blur-text, spotlight-card, tilt-card, framer-motion]

# Dependency graph
requires:
  - phase: 13-animation-pass
    provides: AnimationShell pattern, Anime.js animation infrastructure
provides:
  - motion@12 installed (motion/react import path)
  - BlurText component with word-by-word blur-to-sharp reveal, as prop, IntersectionObserver trigger
  - SpotlightCard component with cursor-following amber radial gradient, no hardcoded dark styles
  - StatTiltCard component with spring-physics 3D tilt using motion/react useSpring
affects: [14-02, 14-03, 14-05]

# Tech tracking
tech-stack:
  added:
    - motion@^12.35.0 (motion/react — modern canonical package replacing framer-motion name)
  patterns:
    - "'use client' required on all motion/react components — server components use wrapper shells"
    - "React.JSX.IntrinsicElements (not JSX.IntrinsicElements) for React 19 type safety"
    - "as prop pattern for semantic HTML flexibility on animated text components"

key-files:
  created:
    - src/components/ui/blur-text.tsx
    - src/components/ui/spotlight-card.tsx
    - src/components/ui/stat-tilt-card.tsx
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Use React.JSX.IntrinsicElements instead of JSX.IntrinsicElements — global JSX namespace removed in React 19"
  - "SpotlightCard has no hardcoded dark styles — caller controls card surface (bg, border-radius, padding)"
  - "StatTiltCard uses named export (not default) to match plan spec and allow tree-shaking"
  - "motion package (v12) not framer-motion — canonical modern name with React 19 support"

patterns-established:
  - "motion/react components must be 'use client' — wrap in AnimationShell if parent is Server Component"
  - "SpotlightCard className pattern: relative overflow-hidden + caller styles — never internal dark theme"

requirements-completed:
  - UIPOL-01
  - UIPOL-02
  - UIPOL-04

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 14 Plan 01: Premium UI Foundation Summary

**motion@12 installed and three React Bits UI primitives created (BlurText, SpotlightCard, StatTiltCard) that unblock all three Wave 2 wiring plans**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-06T02:32:11Z
- **Completed:** 2026-03-06T02:35:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Installed motion@12.35.0 — the modern canonical React animation package (replaces framer-motion name) with full React 19 support
- Created BlurText with word-by-word blur-to-sharp reveal, IntersectionObserver scroll trigger, `as` prop for semantic HTML (h1 support), and `onAnimationComplete` callback for sequencing
- Created SpotlightCard with cursor-following radial amber gradient spotlight — no hardcoded dark styles so caller controls card surface
- Created StatTiltCard with spring-physics 3D tilt (damping:30, stiffness:100, mass:2), perspective:800px wrapper without overflow-hidden to show card edge depth

## Task Commits

Each task was committed atomically:

1. **Task 1: Install motion package** - `da0765a` (chore)
2. **Task 2: Create BlurText component** - `3f23197` (feat)
3. **Task 3: Create SpotlightCard and StatTiltCard components** - `ec514c7` (feat)

## Files Created/Modified
- `src/components/ui/blur-text.tsx` - Word-by-word blur-to-sharp reveal with IntersectionObserver, `as` prop, `onAnimationComplete`
- `src/components/ui/spotlight-card.tsx` - Cursor-tracking radial gradient spotlight, no internal dark styling
- `src/components/ui/stat-tilt-card.tsx` - Spring-physics 3D tilt wrapper with named export, useSpring + useMotionValue
- `package.json` - Added motion@^12.35.0 dependency
- `package-lock.json` - Lockfile updated (+4 packages)

## Decisions Made
- Used `React.JSX.IntrinsicElements` instead of the bare `JSX.IntrinsicElements` for the `as` prop — the global JSX namespace was removed in React 19 and the build failed with the stock React Bits code
- SpotlightCard className string kept as `relative overflow-hidden ${className}` with no internal dark theme — Wave 2 plans supply their own card styling
- StatTiltCard uses a named export per plan spec (not default) to match the Wave 2 import pattern
- `motion` package (not `framer-motion`) — plan explicitly calls out that framer-motion is the legacy name

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed JSX.IntrinsicElements -> React.JSX.IntrinsicElements**
- **Found during:** Task 2 (BlurText build verification)
- **Issue:** TypeScript build error "Cannot find namespace 'JSX'" — React 19 removed the global JSX namespace; stock React Bits source uses `keyof JSX.IntrinsicElements`
- **Fix:** Changed `as?: keyof JSX.IntrinsicElements` to `as?: keyof React.JSX.IntrinsicElements`
- **Files modified:** src/components/ui/blur-text.tsx
- **Verification:** `npm run build` passed cleanly after fix
- **Committed in:** `3f23197` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required fix for React 19 compatibility. No scope creep.

## Issues Encountered
- React Bits BlurText source uses the pre-React-19 global JSX namespace which is no longer available. Fixed inline per deviation Rule 1.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Wave 2 plans (14-02, 14-03, 14-05) can now run in parallel — each has the component it depends on
- BlurText ready for ClientHeroHeadline wiring (14-02)
- StatTiltCard ready for FeatureStatsSection wiring (14-02)
- SpotlightCard ready for tool/page.tsx form card wiring (14-03)
- HeroAnimationShell ambient glow update ready (14-05)

---
*Phase: 14-premium-ui*
*Completed: 2026-03-06*

## Self-Check: PASSED

- FOUND: src/components/ui/blur-text.tsx
- FOUND: src/components/ui/spotlight-card.tsx
- FOUND: src/components/ui/stat-tilt-card.tsx
- FOUND: .planning/phases/14-premium-ui/14-01-SUMMARY.md
- FOUND: commit da0765a (motion install)
- FOUND: commit 3f23197 (BlurText)
- FOUND: commit ec514c7 (SpotlightCard + StatTiltCard)
