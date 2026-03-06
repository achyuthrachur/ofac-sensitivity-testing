---
phase: 14-premium-ui
plan: "04"
subsystem: landing-page-animations
tags: [anime.js, cta-button, glow, uipol-03, hero]
dependency_graph:
  requires: [14-02]
  provides: [UIPOL-03-always-on-glow]
  affects: [landing-page-hero]
tech_stack:
  added: []
  patterns: [always-on-glow-via-anime-mount, shadow-ownership-transfer]
key_files:
  created: []
  modified:
    - src/app/_components/landing/HeroAnimationShell.tsx
    - src/app/_components/landing/HeroSection.tsx
decisions:
  - "HeroAnimationShell owns the entire box-shadow expression for .cta-button — shadow-lg removed from HeroSection to eliminate Tailwind/Anime.js inline-style conflict"
  - "baseGlow set with duration:0 on mount so the button is visually lit from first render, not only on hover"
  - "mouseleave restores to baseGlow (not to transparent zero) — button never goes dark after first hover interaction"
metrics:
  duration: "~4 min"
  completed: "2026-03-05"
  tasks_completed: 2
  files_modified: 2
---

# Phase 14 Plan 04: Always-On CTA Amber Glow Summary

**One-liner:** Always-on amber glow for CTA button via Anime.js mount-time baseGlow constant, with hover amplification loop and base-restore on mouseleave.

## What Was Built

UIPOL-03 implemented: the CTA "Configure Your Test" button now radiates an amber box-shadow at rest (visible without hover), intensifies into a breathing loop on mouseenter, and restores to the base amber level (not zero) on mouseleave.

Two files changed:

1. **HeroSection.tsx** — `shadow-lg` removed from the Link className. Anime.js owns the box-shadow property for `.cta-button` after mount; leaving Tailwind's `shadow-lg` in place would create a competing style during the restore transition.

2. **HeroAnimationShell.tsx** — Three changes to the glow logic:
   - `baseGlow` constant (`0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)`) set on mount with `duration: 0`
   - `mouseleave` now restores to `baseGlow` instead of `'0 4px 16px rgba(245,168,0,0.00)'`
   - `mouseenter` loop pulses between `amplifiedGlow1` (= baseGlow) and `amplifiedGlow2` (`0 0 32px rgba(245,168,0,0.65), 0 6px 28px rgba(245,168,0,0.45)`)

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Remove shadow-lg from CTA Link | 7565dfd | HeroSection.tsx |
| 2 | Update HeroAnimationShell for always-on amber glow | 88b9cfb | HeroAnimationShell.tsx |

## Verification

- `npm run build` — TypeScript clean, static routes generated
- `npm test` — 114 tests passing across 14 test files
- Manual browser verification pending (part of phase-level 14-05 checkpoint)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/_components/landing/HeroSection.tsx` — exists, shadow-lg removed
- `src/app/_components/landing/HeroAnimationShell.tsx` — exists, baseGlow constant present
- Commit `7565dfd` — verified in git log
- Commit `88b9cfb` — verified in git log
