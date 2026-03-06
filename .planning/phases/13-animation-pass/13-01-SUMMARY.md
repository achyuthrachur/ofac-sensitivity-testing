---
phase: 13-animation-pass
plan: 01
subsystem: ui
tags: [animejs, animation, landing-page, tool-page, markup]

# Dependency graph
requires:
  - phase: 12-icon-pass
    provides: Final iconsax icon integration on all landing and tool components
  - phase: 10-landing-page
    provides: FeatureStatsSection, HowItWorksSection, HeroSection, stat-number className
provides:
  - animejs v4.3.6 installed and importable
  - FeatureStatsSection prefix/stat-value/suffix sub-span structure with data-value attribute
  - HowItWorksSection how-it-works-card className on step card divs
  - HeroSection cta-button className on CTA Link
  - tool/page.tsx form-card className on all 4 Card components
affects:
  - 13-02 (AnimationShells — targets .how-it-works-card, .stat-value, .cta-button)
  - 13-03 (tool page animations — targets .form-card)

# Tech tracking
tech-stack:
  added:
    - animejs ^4.3.6
  patterns:
    - Markup-first animation prep: add selectors and data attributes before writing animation logic
    - Split animated values into dedicated sub-spans to isolate prefix/suffix from count-up targets

key-files:
  created: []
  modified:
    - package.json (animejs added to dependencies)
    - src/app/_components/landing/FeatureStatsSection.tsx (sub-span structure + prefix field)
    - src/app/_components/landing/HowItWorksSection.tsx (how-it-works-card className)
    - src/app/_components/landing/HeroSection.tsx (cta-button className)
    - src/app/tool/page.tsx (form-card className on 4 Cards)

key-decisions:
  - "Do NOT install react-animejs-wrapper — it is v3-only and incompatible with animejs v4. Use raw animejs import."
  - "FeatureStatsSection stat number split into prefix+stat-value+suffix sub-spans so ~ and ms remain visible during count-up animation"
  - "STATS array extended with prefix field to avoid conditional rendering ternary in JSX"

patterns-established:
  - "Animation selector prep: classNames and data-value attributes are added in a dedicated markup-prep plan before any animation code"
  - "stat-value class + data-value attribute pattern: Plan 13-02 will read data-value to know the count-up target"

requirements-completed: [ANIM-01, ANIM-02, ANIM-03, ANIM-04]

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 13 Plan 01: Animation Pass — Foundation Summary

**animejs v4.3.6 installed and all Anime.js selector targets wired: stat-value sub-spans, how-it-works-card, cta-button, and form-card classNames across 4 component files**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T00:39:22Z
- **Completed:** 2026-03-06T00:41:17Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- animejs v4.3.6 installed and verified importable via node (no React wrapper — raw package only)
- FeatureStatsSection refactored from single-span to prefix/stat-value/suffix sub-span structure; STATS array extended with prefix field eliminating the value===53 ternary
- how-it-works-card, cta-button, and form-card classNames added to HowItWorksSection, HeroSection, and all 4 tool page Cards respectively
- Build and full 114-test suite remain green

## Task Commits

Each task was committed atomically:

1. **Task 1: Install animejs** - `9dfb203` (chore)
2. **Task 2: Prerequisite markup — classNames and sub-spans** - `ea5fe8a` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `package.json` — animejs ^4.3.6 added to dependencies
- `package-lock.json` — lockfile updated
- `src/app/_components/landing/FeatureStatsSection.tsx` — STATS prefix field, sub-span rendering replacing single stat-number span
- `src/app/_components/landing/HowItWorksSection.tsx` — how-it-works-card className on step card div
- `src/app/_components/landing/HeroSection.tsx` — cta-button className on CTA Link
- `src/app/tool/page.tsx` — form-card className on all 4 Card components

## Decisions Made

- Used raw `animejs` package (not react-animejs-wrapper) — wrapper is v3-only and incompatible with v4 API
- Extended STATS array with a `prefix` field rather than preserving the `value === 53 ? ...` ternary — cleaner data model for future animation code
- Sub-span split (prefix/stat-value/suffix) is necessary because Anime.js count-up will write innerHTML of `.stat-value` from 0 to data-value; prefix (~) and suffix (ms) must be sibling spans to stay visible throughout

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All DOM targets ready: `.stat-value[data-value]`, `.how-it-works-card`, `.cta-button`, `.form-card`
- animejs importable from node_modules
- Plan 13-02 can proceed immediately to add AnimationShell components targeting these selectors
- Plan 13-03 can proceed to add tool page entrance animation targeting .form-card

---
*Phase: 13-animation-pass*
*Completed: 2026-03-06*
