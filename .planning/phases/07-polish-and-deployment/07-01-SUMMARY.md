---
phase: 07-polish-and-deployment
plan: 01
subsystem: ui
tags: [tailwind, crowe-brand, css-tokens, shadcn, next.js]

# Dependency graph
requires:
  - phase: 06-results-table-and-csv-export
    provides: ResultsTable component, page.tsx with rows state, layout scaffolding
provides:
  - Crowe brand CSS tokens in globals.css @theme inline and :root
  - Branded slim indigo header (Crowe wordmark) and footer (2026 disclaimer)
  - Amber Run Test button with hover glow
  - Score column color-coded teal (caught) / coral (missed)
  - Build-clean with no Google Fonts network dependency
affects: [07-02-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@theme inline registration for Tailwind v4 utility class generation from CSS custom properties"
    - "[data-slot='card'] selector for shadcn card shadow overrides"
    - "NODE_TLS_REJECT_UNAUTHORIZED=0 for builds on Crowe corporate network"

key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/components/ResultsTable.tsx

key-decisions:
  - "Remove next/font/google entirely; substitute plain CSS font-family stack — Crowe TLS proxy blocks googleapis.com at build time"
  - "Register Crowe color tokens in @theme inline (not just :root) so Tailwind v4 generates bg-crowe-* and text-crowe-* utility classes"
  - "Use [data-slot='card'] selector (not .card) — shadcn v3.8.5 adds this data attribute to Card root element"
  - "Replace entire :root block with hex values (no oklch) — RESEARCH.md warns against manual oklch conversion"

patterns-established:
  - "Crowe brand integration: @theme inline for Tailwind utilities + :root for shadcn component vars"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 7 Plan 01: Crowe Brand Polish Summary

**Crowe brand CSS tokens applied via Tailwind v4 @theme inline, Google Fonts build blocker removed, indigo header/footer added, amber Run Test button, and teal/coral score column color-coding.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T01:13:12Z
- **Completed:** 2026-03-05T01:16:50Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Eliminated build-blocking `next/font/google` import (Crowe TLS proxy blocks `fonts.googleapis.com`)
- Applied full Crowe brand token system: warm off-white page background (#f8f9fc), Indigo Dark primary (#011E41), Amber accent (#F5A800), indigo-tinted card shadows
- Added branded slim indigo header (Crowe wordmark left, app title right) and footer (2026 disclaimer) via layout.tsx
- Replaced default Run Test button with amber background + dark indigo text + hover amber glow
- Color-coded score column: teal (#05AB8C) for caught rows, coral (#E5376B) for missed rows
- Removed "N results generated" placeholder paragraph
- All 114 tests remain green — no regressions from CSS/JSX changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix build-blocking Geist font import** - `578fd09` (fix)
2. **Task 2: Apply Crowe brand tokens to globals.css** - `0e7d633` (feat)
3. **Task 3: Header/footer, amber button, color-coded score column** - `51f815d` (feat)

## Files Created/Modified

- `src/app/globals.css` - Crowe brand tokens in @theme inline; Crowe hex :root block; [data-slot="card"] shadow; Helvetica Neue font stack
- `src/app/layout.tsx` - Geist imports removed; slim indigo header + footer added; metadata preserved
- `src/app/page.tsx` - Run Test button styled amber; "N results generated" placeholder removed
- `src/components/ResultsTable.tsx` - Score cell color-coded by row.caught (teal/coral)

## Decisions Made

- **Remove next/font/google entirely:** The Crowe corporate SSL proxy intercepts TLS and blocks `fonts.googleapis.com` at build time, causing `CERT_UNTRUSTED` failures. Solution is a plain CSS font-family fallback stack (`'Helvetica Neue', Arial, system-ui, sans-serif`) with no network dependency.
- **@theme inline registration is mandatory for Tailwind v4 utilities:** Colors defined only in `:root` do not generate utility classes like `bg-crowe-indigo-dark`. They must also appear in `@theme inline` as `--color-*` variables.
- **Hex values in :root, not oklch:** The RESEARCH.md anti-patterns section explicitly warns against manual oklch conversion. Tailwind v4 and shadcn both accept hex directly.
- **[data-slot="card"] selector:** shadcn/ui v3.8.5 adds this data attribute to its Card root element, making it a safe and precise target for card shadow overrides.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Build is clean: `npm run build` exits 0, no font/network errors
- All 114 tests green: CSS and JSX changes do not affect pure-logic unit tests
- Crowe brand visual identity applied: warm backgrounds, indigo header/footer, amber CTA, color-coded results
- Ready for Phase 7 Plan 02: Vercel deployment

---
*Phase: 07-polish-and-deployment*
*Completed: 2026-03-05*
