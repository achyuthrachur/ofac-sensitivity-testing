# Retrospective

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-05
**Phases:** 9 | **Plans:** 17 | **Commits:** 98 | **Duration:** 2 days

### What Was Built

- Next.js 15 scaffold with shared TypeScript type contracts (SdnEntry, ResultRow, RunParams)
- 285-entry synthetic SDN dataset covering 4 entity types and 4 linguistic regions with culturally authentic naming
- 10 degradation rules as pure TypeScript functions with 57+ unit tests (deterministic via CANONICAL_RULE_ORDER)
- Zod-validated `runTest` server action — ~53ms worst-case, 14x under Vercel Hobby 10s timeout
- Full parameter form: entity counts, region/rule checkboxes with Select All, client name input
- Virtualized results table (TanStack Virtual) with Jaro-Winkler catch-rate scoring, sort by score, UTF-8 BOM CSV download
- Crowe-branded UI (indigo/amber) deployed live at https://ofac-sensitivity-testing.vercel.app
- Two gap-closure phases: table column alignment fix + formal VERIFICATION.md for phases 03/07

### What Worked

- **Strict dependency chain planning** — each phase had exactly one well-defined output consumed by the next; no phase waited on something it hadn't seen yet
- **TDD RED→GREEN discipline** — pure helper functions (formUtils, resultsUtils) had stubs written first; made the execution fast and regressions obvious
- **Synthetic data human review gate** — domain reviewer approval before Phase 3 began caught naming authenticity issues early; DATA-06 held firm
- **Gap closure as first-class phases** — treating the table fix and verification gaps as proper phases (8 + 9) rather than ad-hoc hotfixes kept the audit trail clean
- **Single Vercel deployment** — the decision to stay in Next.js (no Python backend) made deployment trivial; one `vercel --prod` and it worked

### What Was Inefficient

- **Table column alignment took 3 human-verify iterations** — the colgroup/percentage approach was tried first (plausible but wrong), then pixel widths without explicit td widths (still wrong), then finally explicit px on every th/td with display:flex on virtual rows. The root cause (colgroup doesn't propagate to position:absolute rows) could have been researched upfront
- **STATE.md progress percent was stale for much of the project** — the metadata drifted from reality and needed manual correction; a phase completion hook would help
- **Phase 3 skipped gsd-verifier** — VERIFICATION.md was only created retroactively in Phase 9; the pattern of running the verifier at phase completion should be a hard habit

### Patterns Established

- TanStack Virtual alignment: explicit px width on every `<th>` and `<td>` + `display:flex` on `<tr>` + fixed pixel table width (not 100%)
- Crowe TLS proxy: prefix all Vercel CLI and shadcn CLI commands with `NODE_TLS_REJECT_UNAUTHORIZED=0`
- Tailwind v4 + Crowe tokens: register in `@theme` inline block (not just `:root`) for utility class generation
- `next/font/google` removal pattern: replace with plain CSS font-family stack on Crowe network
- Mulberry32 PRNG (5 lines, no npm dep) for deterministic seeded sampling

### Key Lessons

- **Diagnose virtualizer alignment at research time, not fix time** — the colgroup behaviour under `position:absolute` is documented; a 10-minute read would have saved 3 deploy cycles
- **Run gsd-verifier immediately after phase execution** — not retroactively; each phase's evidence is freshest at completion
- **The gap closure workflow works well** — audit → plan-milestone-gaps → execute phases 8/9 was clean and traceable. No shortcuts needed

### Cost Observations

- Sessions: ~6 focused sessions over 2 days
- Notable: wave-based parallel execution (phases with multiple plans) was the biggest speed multiplier; single-plan phases ran in under 10 minutes each

---

## Milestone: v2.0 — Production Face

**Shipped:** 2026-03-06
**Phases:** 5 (10–14) | **Plans:** 15 | **Duration:** 4 days

### What Was Built

- Full marketing landing page — HeroSection, HowItWorks (3-step), FeatureStats (real engine numbers), CroweBrandedFooter (Server Components)
- Two-panel tool layout — fixed-width configurator left, scrollable engine docs/results right; shadcn Tabs for post-run switching
- EngineExplanationPanel documenting all 10 degradation rules, Jaro-Winkler scoring methodology, and dataset construction
- Complete Iconsax icon pass — Linear (form headings), Bold (CTA/nav), TwoTone (landing features), TickCircle/CloseCircle (results table)
- Anime.js animation pass — AnimationShell pattern per section, onEnterForward scroll reveals, 80ms form stagger, count-up stats, CTA amber breathing glow, hover lift
- React Bits premium components — BlurText hero (word-by-word, 90ms stagger), custom StatTiltCard (spring-physics tilt), always-on CTA amber glow, SpotlightCard form cards

### What Worked

- **AnimationShell pattern** — thin `'use client'` wrapper around Server Component children with `createScope({ root: rootRef }) + revert()` proved clean and reusable; each section got its own isolated scope with no leaks
- **Research gate catching API issues** — `onEnterForward` (not `onEnter`) for play-once scroll reveals was caught in RESEARCH.md before planning; saved a likely bug in execution
- **Wave-based parallel execution** — Phase 14's Wave 2 (BlurText, StatTiltCard, SpotlightCard wiring) ran 3 agents in parallel; total execution time cut by ~60% vs sequential
- **Treat "deploy it" as implicit checkpoint approval** — user intent was unambiguous; completing Wave 3 before deploying was the right call (UIPOL-03 would have been missing)

### What Was Inefficient

- **Stock TiltedCard image-only limitation** — React Bits `TiltedCard` accepts `imageSrc` only; discovered in research and required a custom `StatTiltCard` build. Could have been caught earlier if React Bits component APIs were pre-screened during discuss-phase
- **SpotlightCard mid-stash JSX parse error** — parallel Wave 2 execution left `tool/page.tsx` with mismatched open/close tags (SpotlightCard open, Card close) because two agents touched the same file. The 14-03 agent auto-fixed it, but it was an avoidable conflict
- **14-05 continuation agent lost Bash access** — the checkpoint continuation agent couldn't run gsd-tools commands and had to return asking for Bash; orchestrator ran the remaining commands directly. Consider always granting Bash in continuation agent prompts

### Patterns Established

- AnimationShell pattern: `'use client'` shell wrapping Server Component children; `createScope({ root: rootRef })` scoped to section root; `revert()` on unmount
- Anime.js v4: `onEnterForward` for play-once downward-scroll reveals; named imports only (`animate`, `onScroll`, `stagger`, `createScope`)
- motion v12 (`motion/react`): correct package for React Bits components; not framer-motion
- Custom React Bits components: when stock component accepts only primitives (imageSrc), extract the `useMotionValue`/`useSpring` tilt pattern and build a children-accepting wrapper
- SpotlightCard adaptation: strip `bg-neutral-900 border border-neutral-800` from copied source; caller supplies Crowe surface classes
- BlurText adaptation: add `as` prop to copied source for semantic h1 rendering; use `onAnimationComplete` for post-headline subtitle fade

### Key Lessons

- **Pre-screen React Bits component APIs during discuss-phase** — knowing TiltedCard is image-only earlier would have shaped the discuss-phase decision (children-accepting from the start) and avoided the surprise in research
- **Single-file parallel writes need collision detection** — when two Wave 2 plans touch the same file (e.g., tool/page.tsx), plan them to touch different sections or serialize them
- **Checkpoint continuation agents need Bash in their prompt** — include Bash-accessible gsd-tools commands in the continuation prompt rather than relying on the agent to ask

### Cost Observations

- Sessions: ~3 focused sessions over 4 days (discuss-phase 13, discuss-phase 14 + plan, execute + deploy)
- Notable: research-first workflow (discuss → research → plan → execute) added ~20 min per phase but prevented 2 confirmed bugs (onEnterForward, TiltedCard limitation)

---

## Cross-Milestone Trends

| Metric | v1.0 | v2.0 |
|--------|------|------|
| Phases | 9 | 5 |
| Plans | 17 | 15 |
| Duration | 2 days | 4 days |
| Gap closure phases | 2 (8, 9) | 0 |
| Human verify iterations | 3 (table alignment) | 1 (checkpoint) |
| Tests at completion | 57+ | 57+ (no regressions) |
| New packages | — | animejs, motion, iconsax-reactjs |
