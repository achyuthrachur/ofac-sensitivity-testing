---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Screening Engine
status: completed
stopped_at: Completed 18-01-PLAN.md
last_updated: "2026-03-10T15:55:58.410Z"
last_activity: 2026-03-07 — Phase 17.1 complete (/guide page shipped)
progress:
  total_phases: 10
  completed_phases: 4
  total_plans: 10
  completed_plans: 8
  percent: 44
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.
**Current focus:** v3.0 Screening Engine — Phases 15–17.1 complete; Phase 18 (Results Display + Threshold) is next

## Current Position

Phase: Phase 18 (ready to discuss/plan)
Plan: All Phase 17.1 plans complete (17.1-01)
Status: Phases 15, 16, 17, 17.1 all complete — no CONTEXT.md for Phase 18 yet
Last activity: 2026-03-07 — Phase 17.1 complete (/guide page shipped)

Progress: [████░░░░░░] 44% v3.0 (4/9 phases complete)

## Performance Metrics

**Velocity (v1.0 baseline):**
- Total plans completed: 17 (v1.0) + ~15 (v2.0) = ~32 total
- Average duration: ~18 min
- Total execution time: ~5 hours (v1.0)

**Recent Trend:**
- Last 5 plans: 87, 4, 30, 25, 8 min
- Trend: Stable (excluding Phase 8 outlier)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

**v3.0 architecture decisions (from research):**

- [Roadmap v3.0]: Web Worker (primary) + server-action batching at ≤1,000 names (fallback) for 2.85M comparison compute — Phase 15 spike must benchmark both on live Vercel before any screening code is written
- [Roadmap v3.0]: talisman covers all three scoring algorithms — Double Metaphone at `talisman/phonetics/double-metaphone`, no new phonetics library needed
- [Roadmap v3.0]: Token Sort Ratio is ~10 lines of TypeScript using the existing talisman JW import — no fuzzball install
- [Roadmap v3.0]: SheetJS must be CDN install (`npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz`) — npm registry version has high-severity CVE
- [Roadmap v3.0]: jsPDF via dynamic import inside click handler only — never at module level, never in a route handler
- [Roadmap v3.0]: Recharts SimulationChart must use `dynamic(..., { ssr: false })` and set explicit `domain={[0, 'dataMax']}` on right YAxis
- [Roadmap v3.0]: All v3.0 code in new isolated directories — never modify `sampler.ts`, `ResultsTable.tsx`, `runTest.ts`, or merge v3.0 types into `src/types/index.ts`
- [Roadmap v3.0]: @react-pdf/renderer deferred — App Router compatibility unresolved; jsPDF is the primary PDF path
- [Roadmap v3.0]: ScreeningResultsTable is a new file separate from ResultsTable.tsx — column count change would break TanStack Virtual alignment in the existing table
- [Roadmap v3.0]: Evasion tier activation by % of entities processed (not absolute snapshot index) — velocity-invariant for demo narrative coherence
- [Roadmap v3.0]: Multi-algorithm scoring (Phases 16 SCREEN-06/07/08/09) ships as an atomic unit — partial shipping changes tier assignments on re-run, breaking consistency
- [Roadmap v3.0]: Phase 23 adds minimum 1024px viewport gate with desktop-only notice — mobile layout explicitly out of scope

**Decisions carried from v2.0:**

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
- [Phase 14-premium-ui]: HeroAnimationShell owns the entire box-shadow expression for .cta-button — shadow-lg removed from HeroSection to eliminate Tailwind/Anime.js inline-style conflict
- [Phase 14-premium-ui]: baseGlow set with duration:0 on mount so CTA button is visually lit from first render without requiring hover
- [Phase 15-01]: All v3.0 types isolated to src/types/screening.ts — src/types/index.ts unchanged per isolation constraint
- [Phase 15-01]: Comlink worker accepts sdnEntries as argument — avoids @data/* alias resolution failure in worker bundler
- [Phase 15-01]: screenNames/runSimulation return never in Phase 15 stubs — signals unimplemented path to TypeScript callers
- [Phase 15-architecture-foundation]: BenchmarkPanel catches Phase 15 stub 'Not implemented' error and interprets it as worker roundtrip confirmed — correct interpretation for Phase 15 connectivity test
- [Phase 15-architecture-foundation]: Outer tabs defaultValue=sensitivity ensures zero behavior change on first load — Screening Mode tab is additive, not breaking
- [Phase 16-scoring-engine]: effectiveTier: RiskTier added to MatchResult — post-penalty tier for Phase 18 UI (separated from riskTier to show both raw and compliance-effective tiers)
- [Phase 16-scoring-engine]: ScreeningWorkerApi.screenNames changed to Promise<MatchResult[]> — MatchResultStub retained during Plan 02 wave, removed after
- [Phase 16-scoring-engine]: Wave 0 TDD: scorer.test.ts written before scorer.ts exists — module-not-found failure is the intentional RED state; 29 tests specify the behavioral contract for Plan 02
- [Phase 16-scoring-engine]: Cyrillic confusable map added to normalize(): NFKD alone cannot map Cyrillic Р to Latin R — added explicit table for 18 homoglyphs; required for SCREEN-09 EXACT tier detection
- [Phase 16-scoring-engine]: Worker imports scorer.ts directly via @/lib/screening/scorer to avoid barrel re-export chain pulling server-only imports into worker bundle
- [Phase 17-input-parsing]: ZIP magic byte pre-validation before XLSX.read — SheetJS silently CSV-parses any buffer rather than throwing; PK 0x03 0x04 check required for non-XLSX detection
- [Phase 17-input-parsing]: SheetJS CDN install on Crowe network: curl downloads tgz fine (proxy handled); npm install --save https://... fails with SELF_SIGNED_CERT_IN_CHAIN even with NODE_TLS_REJECT_UNAUTHORIZED=0; workaround: install from local file, update package.json to CDN URL
- [Phase 17-input-parsing]: InputPanel does not import XLSX directly — parseInput.ts encapsulates SheetJS; noUnusedLocals would fail build otherwise
- [Phase 17.1-01]: Scrollspy uses IntersectionObserver with rootMargin -20%/-70%; Quick Start intro in OfacContextSection above section heading; secondary hero link in div wrapper to force block stacking; header right side restructured to nav element
- [Phase 18-results-display-threshold]: assignTierDynamic uses 4-decimal r() rounding to prevent IEEE 754 drift in threshold comparisons
- [Phase 18-results-display-threshold]: Tier-collapse: when EXACT threshold > 1.0, HIGH absorbs all scores above mediumFloor — preserves meaningful tier assignment across all slider positions
- [Phase 18-results-display-threshold]: shadcn Slider installed manually from registry JSON — Crowe TLS proxy blocks npm install for CDN-hosted packages; radix-ui already present so no new dep needed

### Roadmap Evolution

- Phase 17.1 inserted after Phase 17: User Guide Page — /guide route, sidebar+content layout, covers Sensitivity Test + Screening Mode + Scoring Engine + OFAC compliance context (INSERTED)

### Pending Todos

- ~~Phase 15 spike: benchmark confirmed — Web Worker primary for Phase 16~~ (DONE)
- Phase 20 spike: audit 285 SDN entries for non-Latin character ranges before choosing NotoSans base64 subset size (full TTF ~3MB is too large)
- Phase 22 prototype: mock Recharts ComposedChart with dual-axis and mock data before integrating real simulation output

### Blockers/Concerns

- [Roadmap v3.0]: Web Worker + Next.js App Router webpack 5 bundling compatibility — stated available but described as "not yet stable" in research; Phase 15 must confirm empirically on the live Next.js 16 environment
- [Roadmap v3.0]: Double Metaphone returning empty codes for CJK/Arabic inputs — two empty-code inputs must not produce a spurious false-positive match; Phase 16 must add guard
- [Roadmap v3.0]: Token Sort stop-token list completeness — derived from common OFAC patterns; actual 285-entry dataset should be reviewed during Phase 16 to confirm coverage of all generic business tokens present

## Session Continuity

Last session: 2026-03-10T15:55:58.401Z
Stopped at: Completed 18-01-PLAN.md
Resume file: None
Next action: Run /gsd:discuss-phase 18 to gather context, then /gsd:plan-phase 18
