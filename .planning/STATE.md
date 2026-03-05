---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Production Face
status: planning
stopped_at: Completed 11-tool-layout-explanations-01-PLAN.md
last_updated: "2026-03-05T18:11:53.358Z"
last_activity: 2026-03-05 — v2.0 roadmap created; 5 phases defined (10–14)
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 4
  completed_plans: 3
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-05)

**Core value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.
**Current focus:** Phase 10 — Landing Page (v2.0 start)

## Current Position

Phase: 10 of 14 — Landing Page
Plan: Not started
Status: Ready to plan
Last activity: 2026-03-05 — v2.0 roadmap created; 5 phases defined (10–14)

Progress: [░░░░░░░░░░] 0% (v2.0)

## Performance Metrics

**Velocity (v1.0 baseline):**
- Total plans completed: 17
- Average duration: ~18 min
- Total execution time: ~5 hours

**Recent Trend:**
- Last 5 plans: 87, 4, 30, 25, 8 min
- Trend: Stable (excluding Phase 8 outlier)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting v2.0 work:

- [Phase 08]: colgroup does not propagate to position:absolute virtual rows — every th/td needs explicit px width
- [Phase 07]: Remove next/font/google — Crowe TLS proxy blocks googleapis.com at build time
- [Phase 07]: Register Crowe color tokens in @theme inline block (not just :root) for Tailwind v4 utility generation
- [Roadmap v2.0]: Phase 10 must restructure routes FIRST — move app/page.tsx to app/tool/page.tsx before any landing page work
- [Roadmap v2.0]: iconsax-react-19 (React 19 fork) — verify package health before committing; fallback: pass explicit size+color to original iconsax-react
- [Roadmap v2.0]: Anime.js v4 requires 'use client' + useEffect wrapping — every animation file must follow this pattern or next build crashes
- [Roadmap v2.0]: Never animate TanStack virtual rows with translateY — virtualizer writes translateY to each tr; animate container wrapper only
- [Roadmap v2.0]: Patch button.tsx [&_svg]:size-4 to [&_svg]:size-auto BEFORE starting Phase 12 icon pass
- [Phase 10-landing-page]: git mv used for page.tsx move to preserve git rename history
- [Phase 10-landing-page]: tool/layout.tsx is authoritative footer owner — root layout.tsx is now header-only
- [Phase 10-landing-page]: No metadata export on tool/page.tsx (has use client) — metadata lives in tool/layout.tsx only
- [Phase 10-landing-page]: All landing sections are pure Server Components — animations deferred to Phase 13 (Anime.js v4 with use client + useEffect)
- [Phase 10-landing-page]: stat-number className + data-value attribute pre-wired in FeatureStatsSection for Phase 13 count-up animation targeting
- [Phase 11-tool-layout-explanations]: Pin ResultsTable scroll container to width:1050px matching inner table to fix virtualizer right-side gap
- [Phase 11-tool-layout-explanations]: tool/page.tsx two-panel: left w-[420px] flex-shrink-0, right flex-1, outer h-[calc(100vh-48px)] to account for footer

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 12]: shadcn Button.tsx forces SVG children to 16px via [&_svg]:size-4 — must patch button.tsx as first step of Phase 12 before any icon work
- [Phase 13]: Anime.js v4 onScroll callback name (onEnter vs onEnterForward) — verify against installed v4.3.6 at implementation time
- [Phase 14]: React Bits components may install framer-motion alongside Anime.js — review CLI output after each add to avoid duplicate animation libraries

## Session Continuity

Last session: 2026-03-05T18:11:53.347Z
Stopped at: Completed 11-tool-layout-explanations-01-PLAN.md
Resume file: None
