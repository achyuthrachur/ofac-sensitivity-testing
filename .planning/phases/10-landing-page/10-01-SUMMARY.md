---
phase: 10-landing-page
plan: 01
subsystem: ui
tags: [nextjs, routing, app-router, layout, metadata]

# Dependency graph
requires: []
provides:
  - "/tool route with tool form (moved from /)"
  - "src/app/tool/layout.tsx with metadata and slim indigo footer"
  - "src/app/layout.tsx footer-free (header only)"
  - "src/app/page.tsx placeholder for landing page (Wave 2)"
affects: [10-02-landing-page-content, 10-03-landing-page-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route-layout co-location: tool/layout.tsx owns tool metadata + footer"
    - "Server Component layout wraps Client Component page for metadata export"

key-files:
  created:
    - src/app/tool/layout.tsx
    - src/app/page.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "git mv used for page.tsx move to preserve git rename history"
  - "tool/layout.tsx is the authoritative footer owner — root layout.tsx is now header-only"
  - "Root placeholder page.tsx returns null — Wave 2 will replace it with the landing page"
  - "No metadata export on tool/page.tsx (has 'use client') — metadata lives in tool/layout.tsx only"

patterns-established:
  - "Pattern: For any Client Component page that needs metadata, create a co-located layout.tsx Server Component to own the metadata export"
  - "Pattern: Route-scoped footers belong in route layout.tsx, not root layout.tsx"

requirements-completed: [LAND-01]

# Metrics
duration: 8min
completed: 2026-03-05
---

# Phase 10 Plan 01: Route Restructuring Summary

**Tool form moved from "/" to "/tool" via git mv; tool/layout.tsx owns metadata and slim indigo footer; root layout is now header-only; next build passes clean with both routes static.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-05T15:56:28Z
- **Completed:** 2026-03-05T16:04:00Z
- **Tasks:** 2
- **Files modified:** 3 (layout.tsx edited) + 2 created (tool/layout.tsx, page.tsx placeholder)

## Accomplishments
- Tool form at /tool with correct metadata title "Run Test — OFAC Sensitivity Testing | Crowe"
- Slim indigo footer with "Back to overview" link now lives in tool/layout.tsx only
- Root layout.tsx is footer-free — header + children only
- next build exits 0 with routes `/` (placeholder) and `/tool` (form) both compiling as static

## Task Commits

Each task was committed atomically:

1. **Task 1: Move tool page to /tool route and create tool/layout.tsx** - `80b2694` (feat)
2. **Task 2: Remove footer from root layout.tsx and verify build** - `559d28a` (feat)

## Files Created/Modified
- `src/app/tool/page.tsx` - Client Component tool form (moved from src/app/page.tsx via git mv)
- `src/app/tool/layout.tsx` - Server Component layout for /tool: exports metadata, renders children + slim indigo footer with "Back to overview" Link
- `src/app/layout.tsx` - Root layout: footer block removed, now renders header + children only
- `src/app/page.tsx` - Temporary placeholder returning null; Wave 2 (10-02) will replace with landing page

## Decisions Made
- Used `git mv` instead of copy+delete to preserve file rename history in git log
- Created `src/app/page.tsx` placeholder proactively (plan documented this as a known failure mode if root route is missing during build)
- tool/layout.tsx uses exact template from plan interfaces block — the RESEARCH.md Pattern 4 no-footer variant was explicitly overridden by must_haves

## Deviations from Plan

None — plan executed exactly as written. The root placeholder was documented in the plan's action block as the expected fix if "/" had no page.tsx at build time; adding it proactively is within plan scope.

## Issues Encountered
None. Build passed first attempt with all routes clean.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- /tool route is clean and correct — Wave 2 (10-02) can now build the landing page at "/"
- src/app/page.tsx placeholder is in place and ready to be replaced
- Root layout.tsx is header-only — Wave 2 can add landing-page-specific layout elements without footer conflicts

## Self-Check: PASSED

- FOUND: src/app/tool/page.tsx
- FOUND: src/app/tool/layout.tsx
- FOUND: src/app/layout.tsx
- FOUND: src/app/page.tsx (placeholder)
- FOUND: .planning/phases/10-landing-page/10-01-SUMMARY.md
- FOUND: commit 80b2694 (Task 1)
- FOUND: commit 559d28a (Task 2)

---
*Phase: 10-landing-page*
*Completed: 2026-03-05*
