---
phase: 14-premium-ui
plan: "02"
subsystem: landing-page-animation
tags: [blur-text, hero, framer-motion, server-client-boundary, animation]
dependency_graph:
  requires: [14-01]
  provides: [animated-hero-headline]
  affects: [src/app/_components/landing/HeroSection.tsx, src/app/_components/landing/ClientHeroHeadline.tsx]
tech_stack:
  added: []
  patterns: [server-client-boundary, onAnimationComplete-handoff, motion-p-fade]
key_files:
  created:
    - src/app/_components/landing/ClientHeroHeadline.tsx
  modified:
    - src/app/_components/landing/HeroSection.tsx
decisions:
  - BlurText as="h1" preserves semantic h1 for SEO while using motion.span internally — no wrapper div needed
  - HeroSection.tsx remains a Server Component — 'use client' boundary isolated to ClientHeroHeadline.tsx
  - Subtitle opacity-fade triggered by onAnimationComplete callback chained through headlineDone state
metrics:
  duration: "5 minutes"
  completed: "2026-03-06"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 14 Plan 02: Hero Headline BlurText Animation Summary

**One-liner:** Word-by-word blur-to-sharp h1 animation at 90ms stagger with chained subtitle opacity fade via onAnimationComplete.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create ClientHeroHeadline client wrapper | d77871f | src/app/_components/landing/ClientHeroHeadline.tsx (created) |
| 2 | Update HeroSection to use ClientHeroHeadline | 3751d69 | src/app/_components/landing/HeroSection.tsx (modified) |

## What Was Built

**ClientHeroHeadline.tsx** — a new `'use client'` component that:
- Renders the hero h1 via `BlurText` with `as="h1"`, `animateBy="words"`, `delay={90}`, `direction="top"`, `stepDuration={0.35}`
- Manages `headlineDone` state via `useState(false)`, flipped to `true` via `onAnimationComplete`
- Fades in a `motion.p` subtitle (opacity 0 -> 1, 0.6s easeOut) only after the headline completes

**HeroSection.tsx** — updated Server Component that:
- Imports and renders `<ClientHeroHeadline />` in place of the static `<h1>` and `<p>` elements
- Retains the CTA button `<Link>` unchanged for Plan 04's always-on glow targeting
- Has no `'use client'` directive — the animation boundary lives exclusively in ClientHeroHeadline

## Animation Behavior

The headline "Test your OFAC screening before your client does." splits into 9 words:
- Each word blurs in from slightly above (y: -20 -> 0, filter: blur(10px) -> 0px)
- Stagger: 90ms between words — word 9 starts at ~810ms, completes at ~1160ms
- After word 9 completes, `onAnimationComplete` fires, setting `headlineDone = true`
- Subtitle fades in smoothly over 600ms easeOut

## Decisions Made

1. **BlurText as="h1" for semantic HTML:** The `as` prop renders the container as `<h1>` while BlurText's internal `motion.span` elements handle animation — exactly one h1 on the page, SEO intact.
2. **Server Component boundary preserved:** HeroSection.tsx has no animation logic and no `'use client'` — the RSC tree is clean and the client bundle is minimal.
3. **onAnimationComplete chaining:** Rather than using a fixed delay for the subtitle, the fade is triggered by the actual completion callback — so timing adjusts automatically if animation params change.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SpotlightCard spotlightColor type error in tool/page.tsx**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `spotlightColor="rgba(245,168,0,0.08)"` failed TypeScript because the template literal type `rgba(${number}, ${number}, ${number}, ${number})` requires spaces after commas. Introduced in Phase 14-01 but surfaced during this plan's build.
- **Fix:** Changed all 3 (later 4) occurrences in `tool/page.tsx` to `"rgba(245, 168, 0, 0.08)"` (with spaces).
- **Files modified:** src/app/tool/page.tsx
- **Effect:** Build now passes TypeScript cleanly.

## Verification Results

- `npm run build` — passes clean, all 3 routes static prerendered
- `npm test` — 14 test files, 114 tests, all passing, no regressions

## Self-Check: PASSED

- src/app/_components/landing/ClientHeroHeadline.tsx — FOUND
- src/app/_components/landing/HeroSection.tsx — FOUND
- Commit d77871f (Task 1) — FOUND
- Commit 3751d69 (Task 2) — FOUND
