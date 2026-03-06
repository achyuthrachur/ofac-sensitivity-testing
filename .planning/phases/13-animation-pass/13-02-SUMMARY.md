---
phase: 13-animation-pass
plan: 02
subsystem: ui
tags: [animejs, animation, landing-page, scroll-reveal, count-up, hover, client-components]

# Dependency graph
requires:
  - phase: 13-01
    provides: animejs v4.3.6 installed; .how-it-works-card, .stat-value[data-value], .cta-button selectors wired in markup
  - phase: 10-landing-page
    provides: HeroSection, HowItWorksSection, FeatureStatsSection as Server Components; page.tsx layout
provides:
  - HowItWorksAnimationShell Client Component (scroll reveal stagger + hover lift on .how-it-works-card)
  - FeatureStatsAnimationShell Client Component (scroll reveal stagger + count-up on .stat-value)
  - HeroAnimationShell Client Component (CTA button breathing amber glow on mouseenter/mouseleave)
  - page.tsx updated to wrap each landing section in its AnimationShell; remains a Server Component
affects:
  - 13-03 (tool page animations — form-card stagger; landing shells are now the pattern to follow)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AnimationShell pattern: thin 'use client' wrapper div with className="contents" wraps Server Component children; all animation logic runs in useEffect with createScope + revert cleanup
    - ReturnType<typeof animate> used to type the glow animation reference (Animatable class exists as runtime export but JSAnimation is the returned type from animate())
    - Loop + alternate on animate() for continuous hover breathing: pause() + null the ref on mouseleave, then a separate fade-out animation resets the shadow

key-files:
  created:
    - src/app/_components/landing/HowItWorksAnimationShell.tsx
    - src/app/_components/landing/FeatureStatsAnimationShell.tsx
    - src/app/_components/landing/HeroAnimationShell.tsx
  modified:
    - src/app/page.tsx (three shell imports + section wrappers; metadata description updated)

key-decisions:
  - "Used ReturnType<typeof animate> (not Animatable type import) for the glow animation ref — animate() returns JSAnimation class instance; this avoids any type import uncertainty"
  - "HeroAnimationShell breathing glow: loop:true + alternate:true pattern with pause() on mouseleave + separate fade-out animate() call to reset shadow to transparent"
  - "All three shells use className='contents' on wrapper div — layout-neutral, preserves Server Component section layout ownership"

patterns-established:
  - "AnimationShell = 'use client' wrapper with className='contents', createScope({ root: rootRef }), revert() on cleanup"
  - "onEnterForward fires once on scroll-in; no replay guard needed — onScroll callback fires only on forward entry"

requirements-completed: [ANIM-01, ANIM-03, ANIM-04]

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 13 Plan 02: Animation Pass — AnimationShells Summary

**Three Anime.js v4 AnimationShell Client Components wired into page.tsx: scroll-reveal stagger on HowItWorks cards and stats, count-up on stat values, and amber breathing glow on the hero CTA button**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T00:43:45Z
- **Completed:** 2026-03-06T00:45:57Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- HowItWorksAnimationShell: cards stagger in from y:50 with 90ms delay on scroll entry, plus mouseenter/mouseleave hover lift (translateY -5px + shadow upgrade)
- FeatureStatsAnimationShell: stat-number spans stagger in from y:40 on scroll entry, .stat-value elements count up from 0 to data-value over 1800ms with outExpo easing
- HeroAnimationShell: CTA button enters continuous amber box-shadow breathing loop on mouseenter (900ms, loop+alternate), paused and faded out on mouseleave
- page.tsx updated to wrap HeroSection, HowItWorksSection, FeatureStatsSection in their shells — still exports metadata, no 'use client' directive

## Task Commits

Each task was committed atomically:

1. **Task 1: Create HowItWorksAnimationShell** - `6bccf78` (feat)
2. **Task 2: Create FeatureStatsAnimationShell, HeroAnimationShell; wire page.tsx** - `74634ec` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/app/_components/landing/HowItWorksAnimationShell.tsx` — scroll reveal stagger + hover lift for HowItWorks cards
- `src/app/_components/landing/FeatureStatsAnimationShell.tsx` — scroll reveal stagger + count-up for stats
- `src/app/_components/landing/HeroAnimationShell.tsx` — CTA button breathing amber glow on hover
- `src/app/page.tsx` — imports all three shells, wraps sections; metadata description updated

## Decisions Made

- `ReturnType<typeof animate>` used for the glow animation ref type in HeroAnimationShell — `animate()` returns a `JSAnimation` class instance; this avoids importing Animatable as a type and handles cases where the type import may not be available
- Glow breathing pattern: `loop: true, alternate: true` on mouseenter animate call; on mouseleave, `glowAnimation.pause()` + null ref + separate `animate()` call fades box-shadow to `rgba(245,168,0,0.00)` for a clean exit
- `className="contents"` on all three wrapper divs — CSS display:contents makes the div layout-neutral, preserving the Server Component section's own layout/grid behavior

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Landing page animations fully wired: ANIM-01 (scroll reveals), ANIM-03 (count-up), ANIM-04 landing portion (CTA glow + card hover)
- Pattern established for Plan 13-03: tool/page.tsx form-card stagger follows the same createScope + useEffect pattern but inside an existing Client Component (no shell wrapper needed)
- Build passes (Next.js 16.1.6 Turbopack), 114 tests green

## Self-Check: PASSED

- FOUND: src/app/_components/landing/HowItWorksAnimationShell.tsx
- FOUND: src/app/_components/landing/FeatureStatsAnimationShell.tsx
- FOUND: src/app/_components/landing/HeroAnimationShell.tsx
- FOUND: src/app/page.tsx
- FOUND: .planning/phases/13-animation-pass/13-02-SUMMARY.md
- Commit 6bccf78 exists (Task 1)
- Commit 74634ec exists (Task 2)
- metadata export confirmed in page.tsx

---
*Phase: 13-animation-pass*
*Completed: 2026-03-06*
