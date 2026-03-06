---
phase: 13-animation-pass
plan: "03"
subsystem: tool-ui
tags: [animation, anime-js, stagger, form-cards, tool-page]
dependency_graph:
  requires: [13-01]
  provides: [ANIM-02]
  affects: [src/app/tool/page.tsx]
tech_stack:
  added: []
  patterns: [createScope-useEffect, stagger-on-mount, ref-scoped-animation]
key_files:
  created: []
  modified:
    - src/app/tool/page.tsx
decisions:
  - "createScope({ root: toolRoot }) scopes .form-card selector to left panel only — safe alongside TanStack virtual rows"
  - "stagger(80) with 700ms duration per card — plays on every page load, no sessionStorage guard"
  - "revert() in useEffect cleanup prevents memory leaks on unmount"
metrics:
  duration: 80s
  completed: "2026-03-05"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 13 Plan 03: Form Card Stagger Animation Summary

**One-liner:** Anime.js createScope + stagger(80) animates the 4 .form-card elements into view sequentially on every page load at /tool.

## What Was Built

Added a mount animation to `src/app/tool/page.tsx` that staggers the 4 parameter form cards (Entity Counts, Linguistic Regions, Degradation Rules, Client Name) into view on every page load. Each card slides up from translateY:50 to translateY:0 while fading in from opacity:0, with 80ms between each card and a 700ms duration using outQuint easing.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add form card stagger animation to tool/page.tsx | f295e99 | src/app/tool/page.tsx |

## Implementation Details

Five targeted changes were made to `tool/page.tsx`:

1. Added `useEffect` and `useRef` to the React import
2. Added `import { createScope, animate, stagger } from 'animejs'`
3. Added `toolRoot` and `scope` ref declarations after existing state
4. Added `useEffect` block with `createScope({ root: toolRoot })` + stagger animation + `revert()` cleanup
5. Added `ref={toolRoot}` to the left panel div

The animation is scoped to the left panel only via `createScope({ root: toolRoot })`, ensuring `.form-card` selectors never match elements outside that div. The TanStack virtual rows in the right panel are untouched.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `src/app/tool/page.tsx` modified with all 5 changes
- [x] `next build` exits 0 — TypeScript clean, Turbopack compiled successfully
- [x] `npm run test -- --run` exits 0 — 114/114 tests pass
- [x] `grep "createScope\|stagger\|form-card" src/app/tool/page.tsx` returns matches for all three
- [x] `grep "ref={toolRoot}" src/app/tool/page.tsx` returns a match
- [x] Commit f295e99 exists

## Self-Check: PASSED
