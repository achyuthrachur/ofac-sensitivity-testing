---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Production Face
status: planning
stopped_at: "Checkpoint: 14-premium-ui/14-05 — awaiting visual verification of all 4 UIPOL requirements"
last_updated: "2026-03-06T02:43:46.905Z"
last_activity: 2026-03-05 — Phase 12 icon pass complete; all 4 iconsax target files updated; visual checkpoint approved
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 15
  completed_plans: 14
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-05)

**Core value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.
**Current focus:** Phase 13 — Animation Pass (next up)

## Current Position

Phase: 13 of 14 — Animation Pass
Plan: Not started
Status: Ready to plan
Last activity: 2026-03-05 — Phase 12 icon pass complete; all 4 iconsax target files updated; visual checkpoint approved

Progress: [██████████] 100% (v2.0 phases 10-12 complete)

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
- [Phase 11-tool-layout-explanations]: EngineExplanationPanel is a pure Server Component (no use client) — safe to render in both pre-run path and Engine Docs tab without duplication concerns
- [Phase 11-tool-layout-explanations]: Tabs defaultValue=results ensures Results tab is active immediately after a run, matching user expectation
- [Phase 12-icon-pass]: Iconsax inside shadcn Button requires className='size-auto' to bypass [&_svg:not([class*='size-'])]:size-4 selector
- [Phase 12-icon-pass]: No animate-* or transform on icons in TanStack virtualizer tr children — virtualizer writes translateY to tr directly
- [Phase 12-icon-pass]: TwoTone variant for HowItWorksSection (white cards), Bold variant for FeatureStatsSection (dark indigo bg) — TwoTone dims on dark, Bold gives full amber fill
- [Phase 13-animation-pass]: Do NOT install react-animejs-wrapper — v3-only, incompatible with animejs v4; use raw animejs import
- [Phase 13-animation-pass]: FeatureStatsSection stat number split into prefix+stat-value+suffix sub-spans so ~ and ms remain visible during count-up animation
- [Phase 13-animation-pass]: createScope scopes .form-card selector to left panel only — safe alongside TanStack virtual rows
- [Phase 13-animation-pass]: stagger(80) 700ms plays on every page load, no sessionStorage guard per user decision
- [Phase 13-animation-pass]: ReturnType<typeof animate> used for glow animation ref type — animate() returns JSAnimation class instance, avoids Animatable type import uncertainty
- [Phase 13-animation-pass]: AnimationShell pattern: className='contents' wrapper div is layout-neutral; createScope + revert() in useEffect is mandatory for all Anime.js Client Components
- [Phase 13-animation-pass]: All 7 Phase 13 visual checks passed on first review — scroll reveals, count-up, CTA glow, form card stagger all confirmed working
- [Phase 14-premium-ui]: React.JSX.IntrinsicElements (not JSX.IntrinsicElements) required for React 19 — global JSX namespace removed
- [Phase 14-premium-ui]: motion package (v12) installed as canonical framer-motion replacement — motion/react import path required by BlurText and StatTiltCard
- [Phase 14-premium-ui]: bg-white/15 on stat cards (upgraded from bg-white/10) so tilt depth reads clearly against dark indigo background
- [Phase 14-premium-ui]: SpotlightCard migration in tool/page.tsx completed — Cards 3+4 closing tags fixed (stashed 14-02 work restored partial state)
- [Phase 14-premium-ui]: BlurText as="h1" preserves semantic HTML for SEO while HeroSection.tsx remains a Server Component — 'use client' boundary isolated to ClientHeroHeadline.tsx
- [Phase 14-premium-ui]: SpotlightCard wraps all 4 form cards with amber spotlight at rgba(245,168,0,0.08); form-card className on outermost div preserves Phase 13 stagger; bg-card text-card-foreground restores shadcn surface styling

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 13]: Anime.js v4 onScroll callback name (onEnter vs onEnterForward) — verify against installed v4.3.6 at implementation time
- [Phase 14]: React Bits components may install framer-motion alongside Anime.js — review CLI output after each add to avoid duplicate animation libraries

## Session Continuity

Last session: 2026-03-06T02:43:46.900Z
Stopped at: Checkpoint: 14-premium-ui/14-05 — awaiting visual verification of all 4 UIPOL requirements
Resume file: None
