# Project Research Summary

**Project:** OFAC Sensitivity Testing Tool — v2.0 Production Face
**Domain:** B2B compliance demo tool — UI layer upgrade over existing v1.0 engine
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

The v2.0 milestone is an additive UI layer over a fully functional v1.0 engine. The core logic — server action, Jaro-Winkler scoring, 10 degradation rules, 285 synthetic SDN entries, virtualized results table — is complete and must not be touched. The work is: introduce a landing page at `/`, move the tool to `/tool`, add contextual explanations to the form, animate the page with Anime.js v4, replace Lucide icons with Iconsax, and upgrade select UI elements with React Bits / 21st.dev premium components. This is a well-bounded, additive scope with no architectural risk to the existing engine.

The recommended approach is a strict phased build order driven by hard dependency chains: route restructuring must come first (the landing page cannot exist until `/` is freed from the tool), then static landing page content, then the explanation layer and icon pass (independent of each other), then the animation pass last (animations require DOM elements to exist before they can be targeted). The stack additions are minimal: `animejs@^4.3.6`, `iconsax-react-19@^1.2.5` (React 19-compatible fork), and React Bits components installed per-component via the shadcn CLI. No new backend dependencies, no schema changes, no test changes.

The primary risks are all on the client-boundary and animation side, and all have established prevention patterns. Anime.js v4 requires `'use client'` + `useEffect` wrapping — failing this crashes the build. TanStack virtualizer rows must never be animated with `translateY` — doing so stacks all rows at y=0. The shadcn Button forces SVG children to 16px via `[&_svg]:size-4` — `button.tsx` must be patched before any icon work. Every risk is LOW recovery cost when caught early, and MEDIUM-HIGH cost if discovered after several features are built on top. The mitigation strategy is a specific verification checklist at the end of each phase.

---

## Key Findings

### Recommended Stack

The existing stack (Next.js 16.1.6, React 19.2.3, Tailwind v4, shadcn 3.8.5, TanStack Virtualizer 3.13.19) is confirmed and stable — no upgrades or changes needed. Two npm additions are required: `animejs@^4.3.6` for scroll-triggered reveals and stagger entrances (framework-agnostic, ES module named exports, ~25KB tree-shakeable), and `iconsax-react-19@^1.2.5` (React 19-compatible community fork of the original iconsax-react, which has a confirmed React 19 breakage due to `defaultProps` removal). React Bits and 21st.dev components are installed as owned code via the shadcn CLI or copy-paste — they are not node_modules.

The route architecture requires one structural change: move `src/app/page.tsx` to `src/app/tool/page.tsx` and create a new server-component landing page at `src/app/page.tsx`. This is a file-system move with no Next.js configuration changes, no rewrites, no redirects.

**Core technologies:**
- `animejs@^4.3.6`: Scroll-triggered reveals, stagger entrances, count-up numbers — ES module tree-shaking, no React 19 peer dep issues, MIT licensed
- `iconsax-react-19@^1.2.5`: React 19-compatible Iconsax fork — same API as original, fixes `defaultProps` removal; always pass `size` and `color` explicitly; verify not abandoned before committing
- React Bits (via `npx shadcn@latest add @react-bits/<Component>-TS-TW`): BlurText (hero headline), CountUp (stats section), SpotlightCard (How It Works steps) — installs to `src/components/` as owned code
- 21st.dev (copy-paste from browser): Premium hero elements and CTA buttons if needed — no npm install, adapt Crowe color tokens after paste
- shadcn Tooltip + Popover (`npx shadcn add tooltip popover`): Already available from v1.0 init but unused — wire for form explanations

### Expected Features

**Must have (table stakes — P1):**
- Landing page hero with outcome-driven headline, subheadline, and single CTA ("Configure Your Test") linking to `/tool`
- "How It Works" 3-step section (Configure → Run → Export) with icons
- Inline helper text and tooltips on every form card — static text for routine fields, tooltip popover for the 10 degradation rules
- Elevated catch-rate stat block above results table — promote from single `text-sm` line to a stat card with visual weight
- Score interpretation legend (teal = caught at >=85%, coral = missed <85%)

**Should have (differentiators — P2):**
- Stats section with real engine numbers (285 SDN entries, 10 rules, 4 entity types, 4 regions, ~53ms processing) with CountUp animation
- Scroll-triggered section reveals via Anime.js `onScroll` + stagger
- Form card stagger entrance on tool page load (4 cards, 80ms delay)
- BlurText animated hero headline (React Bits)
- Iconsax icon pass throughout (replacing Lucide Loader2 and Unicode symbols)
- SpotlightCard on How It Works steps (React Bits)

**Defer to v3+ (explicitly out of v2.0 scope):**
- Interactive threshold slider (requires state wiring to ResultsTable — architectural scope)
- Row-level drill-down (virtual rows cannot expand without architecture refactor)
- Mobile responsive layout (desktop-first per PROJECT.md)
- PDF/print export (browser print-to-PDF is the accepted workaround)

### Architecture Approach

The architecture uses the App Router "islands" pattern: static content sections (Hero, HowItWorks, FeatureStats, Footer) are Server Components for fast TTFB and zero hydration cost. Animations are added via a thin `AnimationShell` client component wrapper that receives server-rendered sections as `children` and attaches Anime.js `createScope` + `onScroll` listeners via `useEffect`. The tool page stays `'use client'` as it was in v1.0. Explanation components (tooltips, popovers) are separate client component files colocated in `src/app/_components/tool/`, keeping domain content out of the 255-line tool page. The server action (`src/app/actions/runTest.ts`) and all `lib/` utilities are completely unchanged.

**Major components:**
1. `src/app/page.tsx` (NEW, Server Component) — landing page compositor; exports `metadata`; imports section components and `AnimationShell`
2. `src/app/_components/landing/AnimationShell.tsx` (NEW, `'use client'`) — single animation wrapper; `createScope` + `revert()` lifecycle for hero, how-it-works, and stats section types
3. `src/app/tool/page.tsx` (MOVED from `src/app/page.tsx`) — tool form; unchanged logic; gains explanation components and icon upgrades
4. `src/app/_components/tool/RuleInfoPopover.tsx`, `EntityTypeTooltip.tsx`, `RegionTooltip.tsx`, `CatchRatePanel.tsx` (NEW, `'use client'`) — domain-specific explanation content; keeps `tool/page.tsx` manageable
5. `src/app/actions/runTest.ts` (UNCHANGED) — stays at current path; import continues to work from `tool/page.tsx`

### Critical Pitfalls

1. **Anime.js v4 SSR crash (`window is not defined`)** — Every file importing animejs must have `'use client'` at top; all `animate()` / `onScroll()` / `createScope()` calls must be inside `useEffect`. Violations crash `next build` with no graceful recovery.

2. **Missing `scope.revert()` on unmount — zombie animations** — Every `createScope` must have a matching `return () => scope.current?.revert()` in the `useEffect` cleanup. Omitting this causes doubled/stuttering animations in React Strict Mode dev and memory leaks in production across route navigations.

3. **Animating TanStack virtual rows with `translateY` — rows stack at y=0** — The virtualizer writes `transform: translateY(${virtualRow.start}px)` to every `<tr>` (confirmed in `ResultsTable.tsx` lines 149-151). Any animation that also writes `translateY` to `<tr>` overwrites virtualizer positioning. Animate only the results container wrapper — never individual rows.

4. **Iconsax SVG forced to 16px inside shadcn Button (`[&_svg]:size-4`)** — shadcn's `button.tsx` (owned code) hardcodes `[&_svg]:size-4` on all SVG children. Remove or change to `[&_svg]:size-auto` in `button.tsx` before starting the icon pass — one-file fix, must come first.

5. **React Bits / 21st.dev components using Tailwind v3 syntax — silent visual breakage** — `bg-opacity-*` utilities and undefined color names from copy-pasted components render silently wrong in Tailwind v4. Audit every pasted component: replace `bg-opacity-*` with slash syntax, replace all non-Crowe color classes with project tokens, then run `next build` to surface any remaining issues.

---

## Implications for Roadmap

Based on the research dependency graph and pitfall severity, the recommended phase structure is:

### Phase 1: Route Restructuring

**Rationale:** Everything else depends on `/tool` existing and `/` being free for the landing page. This is a 1-session file move but it is the hard prerequisite — landing page content, CTA links, and `metadata` exports all require this to be correct first. Route correctness must be verified before any UI work starts.
**Delivers:** Tool accessible at `/tool`; `/` returns a minimal placeholder; `next build` passes with the new structure; `tool/layout.tsx` (Server Component) in place to export route-specific `metadata` without conflicting with the `'use client'` tool page
**Addresses:** Pitfall 3 (two copies of tool if move is incomplete), Pitfall 4 (Client Component cannot export `metadata`)
**Avoids:** Building landing page content on top of an unchecked route structure

### Phase 2: Landing Page Static Structure

**Rationale:** With the route in place, build all landing page sections as static Server Components first — no animations, no premium components. This lets the page ship and be reviewed before the animation layer complicates debugging.
**Delivers:** Complete landing page at `/` with Hero, How It Works (3 steps), Stats (real engine numbers), expanded Footer with disclaimer; CTA links to `/tool`; page-level `metadata`
**Addresses:** All P1 table-stakes landing features (hero, 3-step process, stats, footer disclaimer)
**Uses:** `iconsax-react-19` for step icons and stat section (install here); Next.js `<Link>` for CTA
**Avoids:** Pitfall 5 (landing page accidentally becoming a Client Component — keep `src/app/page.tsx` free of `'use client'`); Pitfall 7 (React Bits without `'use client'`)

### Phase 3: Form Explanation Layer

**Rationale:** Independent of animation — static content and Radix UI primitives only. Addresses the highest user-value gap (10 degradation rules are opaque without explanation). Can be developed immediately after Phase 1 in parallel with Phase 2 if bandwidth allows.
**Delivers:** Static helper text on all 4 form cards; 10 degradation rule tooltip popovers with the full description set from FEATURES.md; `CatchRatePanel` promoting catch-rate stat to visual prominence; score legend (teal/coral key)
**Addresses:** P1 features — inline help, score interpretation legend, elevated catch-rate stat block
**Uses:** `npx shadcn add tooltip popover`; InfoCircle Iconsax icon

### Phase 4: Icon Pass

**Rationale:** Icon replacement is cosmetic, independent, and zero logic risk. Do it after the explanation layer (which introduces new icon placements) so all placements are known before doing a systematic audit. Patch `button.tsx` as the very first step of this phase.
**Delivers:** Consistent Iconsax icon language throughout — form card headers (People, Global, Setting4, Building), CTA buttons (ArrowRight, DocumentDownload), step icons (Setting2, Play, Export — TwoTone), caught/missed indicators (TickCircle/CloseCircle Bold), loading state; `lucide-react` fully replaced
**Addresses:** P2 icon pass per the specific mapping table in FEATURES.md
**Avoids:** Pitfall 9 (shadcn Button SVG forced to 16px) — patch `button.tsx` before touching any icons

### Phase 5: Animation Pass

**Rationale:** Animations are the last layer before the premium UI upgrade — they require all DOM elements (landing sections, form cards, results area) to exist. The `AnimationShell` pattern must be established once with correct scope + cleanup before any individual animations are written.
**Delivers:** `AnimationShell.tsx` with `createScope` + `revert()` lifecycle; scroll-triggered reveals on How It Works and Stats sections (`onScroll` + stagger); hero entrance on page load; form card stagger on tool page mount; count-up on stat numbers via Anime.js `innerHTML` interpolation; results section fade-in on test completion; `prefers-reduced-motion` guard
**Addresses:** P2 animation features
**Uses:** `npm install animejs` (v4.3.6)
**Avoids:** Pitfall 1 (SSR crash — `'use client'` + `useEffect` enforced from the start), Pitfall 2 (zombie animations — `revert()` required), Pitfall 10 (virtual row `translateY` conflict — animate container only), Pitfall 11 (global selectors — `createScope` required on every animation)

### Phase 6: Premium UI Upgrade

**Rationale:** React Bits and 21st.dev components are an enhancement layer over already-working markup. Installing them last means the page is fully functional before any third-party component introduces Tailwind v4 class incompatibilities or peer dep surprises.
**Delivers:** BlurText animated hero headline; SpotlightCard on How It Works steps; CountUp for stat numbers (replacing plain `innerHTML` Anime.js approach if desired); any 21st.dev hero or CTA button upgrades; full visual polish pass
**Addresses:** P2/P3 differentiator features; premium Crowe brand presentation
**Avoids:** Pitfall 6 (Tailwind v4 class breakage — audit every paste before committing); Pitfall 7 (`'use client'` required on all animated components)

### Phase Ordering Rationale

- Phases 1 and 2 are strictly sequential: routing unlocks landing page, landing page unlocks animations.
- Phases 3 and 4 are independent of each other and of Phase 2, but both depend on Phase 1. They can run concurrently with Phase 2 if bandwidth allows.
- Phase 5 (animation) is gated on Phases 2 and 3 — animations must target elements that already exist in the DOM.
- Phase 6 (premium UI) is purely additive and lowest-risk when done last — it overlays on already-verified markup.
- Pitfall-prevention actions (patch `button.tsx`, establish `AnimationShell` pattern, verify `next build` after each React Bits paste) are phase-level gates, not optional cleanup steps.

### Research Flags

Phases with well-documented patterns (skip `/gsd:research-phase`):
- **Phase 1 (Route Restructuring):** Standard App Router file move — Next.js official docs cover this completely. ARCHITECTURE.md has the exact 4-step checklist.
- **Phase 3 (Explanation Layer):** shadcn Tooltip and Popover are well-documented; the 10 rule descriptions are already fully written in FEATURES.md.
- **Phase 4 (Icon Pass):** Direct replacement per the icon mapping table in FEATURES.md. One prerequisite patch to `button.tsx`.

Phases that benefit from targeted pre-phase verification (not full research):
- **Phase 2 (Landing Page):** Hero visual design choices (background treatment, stat layout) benefit from 30 minutes browsing the 21st.dev hero category before starting markup.
- **Phase 5 (Animation Pass):** The Anime.js v4 `onScroll` callback name (`onEnter` vs `onEnterForward`) should be verified against the installed v4.3.6 package at implementation time — FEATURES.md shows both variants across examples.
- **Phase 6 (Premium UI):** Each React Bits component may bring different peer dep requirements. Check the shadcn CLI output after each `add` command for unexpected packages (particularly `framer-motion`).

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions confirmed from `package.json` codebase inspection; `iconsax-react` React 19 breakage confirmed via official GitHub issue tracker; `animejs` v4.3.6 confirmed on npm (published 2026-02-15) |
| Features | HIGH | B2B landing page patterns confirmed from multiple sources; Anime.js v4 scroll API confirmed from official docs; icon style assignments are inferred from library docs — LOW confidence on exact style variant choices per context, but easily adjusted |
| Architecture | HIGH | App Router server/client boundary patterns confirmed from official Next.js docs; `createScope` + `revert()` pattern confirmed from Anime.js v4 official docs; `position:absolute` virtualizer conflict confirmed from codebase inspection and TanStack community |
| Pitfalls | HIGH | All 11 pitfalls confirmed from codebase inspection + official issue trackers (shadcn #6316, TanStack Virtual #476/#482, iconsax-react #18) + Next.js official docs |

**Overall confidence:** HIGH

### Gaps to Address

- **`iconsax-react-19` package health:** Low weekly downloads — community fork, not officially maintained. Before committing to the install, verify the package is not deprecated and renders correctly in the dev environment. Fallback: pass explicit `size` and `color` to every original `iconsax-react` icon directly — this also fixes the React 19 issue without the fork.
- **React Bits peer deps per component:** Each `npx shadcn add @react-bits/<Component>-TS-TW` command may install unexpected packages (notably `framer-motion` for text animation components). Review CLI output after each add to avoid duplicate animation libraries alongside Anime.js.
- **Tailwind v4 `@theme` class generation for React Bits:** React Bits TS-TW components use Tailwind utility classes. Crowe custom color tokens are already in the `@theme` block in `globals.css` — verify after the first React Bits install that classes like `text-crowe-indigo-dark` resolve correctly.
- **`onScroll` callback name:** FEATURES.md examples show both `onEnter` and `onEnterForward`. Verify exact callback signature against the installed v4.3.6 package at implementation time before writing any scroll-triggered animations.

---

## Sources

### Primary (HIGH confidence)
- `package.json` codebase inspection — stack versions (Next.js 16.1.6, React 19.2.3, Tailwind v4, TanStack Virtualizer 3.13.19)
- `src/app/page.tsx` codebase inspection — `'use client'` at line 1; existing tool component structure confirmed
- `src/components/ResultsTable.tsx` lines 149-151 — `position: absolute; transform: translateY(${virtualRow.start}px)` on every virtual row confirmed
- Next.js App Router official docs — route colocation, private `_` folders, server/client composition patterns, `metadata` export constraints
- Anime.js v4 official docs — `createScope`, `onScroll`, `revert()`, `stagger`, named imports, React integration pattern
- shadcn/ui GitHub issue #6316 and discussion #6250 — `[&_svg]:size-4` Button SVG override confirmed
- iconsax-react GitHub issue #18 — React 19 `defaultProps` breakage confirmed on original package
- TanStack Virtual GitHub discussions #476, #482 — `position:absolute` transform conflict with animation libraries confirmed

### Secondary (MEDIUM confidence)
- animejs npm (last published 2026-02-15, v4.3.6) — version and release cadence
- anime.js GitHub wiki "What's new in v4" — ES module architecture, scroll API
- iconsax-react-19 GitHub (MohamedRagheb) — React 19 compatible fork, v1.2.5
- react-bits GitHub (DavidHDev/react-bits) — shadcn CLI install pattern confirmed
- B2B SaaS landing page best practices (flow-agency.com, saashero.net, caffeinemarketing.com) — hero structure, stats section patterns, CTA copy guidance
- UX research on inline help vs tooltip (UX Movement, Userpilot, LogRocket) — static text for required info, tooltip for supplementary info

### Tertiary (LOW confidence — validate at implementation)
- `onScroll` `onEnterForward` vs `onEnter` callback name — seen in different examples; verify against installed package
- Tailwind v4 `@theme` compatibility with React Bits utility classes — inferred from Tailwind v4 upgrade guide; verify empirically after first install

---

*Research completed: 2026-03-05*
*Ready for roadmap: yes*
