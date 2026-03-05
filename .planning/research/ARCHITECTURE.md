# Architecture Research

**Domain:** Form-driven data processing tool — v2.0 Production Face (landing page + animation + explanation layer)
**Researched:** 2026-03-05
**Confidence:** HIGH — App Router routing patterns and Anime.js v4 scope patterns are stable and verified against official docs.

---

## Context: What Already Exists (v1.0)

The codebase is a single-route Next.js 15 App Router app. The entire product lives at `"/"`:

```
src/app/
  layout.tsx          ← slim indigo header + footer (server component)
  page.tsx            ← "use client" — full form + inline results (one component, ~255 lines)
  actions/
    runTest.ts        ← "use server" server action — Zod validation, sampler, rules, Jaro-Winkler
  globals.css         ← Tailwind v4 @theme inline block with Crowe tokens

src/components/
  ResultsTable.tsx    ← "use client" — TanStack virtualizer, sort, CSV download
  ui/                 ← shadcn base components (Button, Card, Checkbox, Input, Label)

src/lib/
  constants.ts / formUtils.ts / resultsUtils.ts / sampler.ts / utils.ts
  rules/              ← 10 pure-function rule modules + index.ts (CANONICAL_RULE_ORDER, ruleMap)

src/types/index.ts    ← SdnEntry, ResultRow, RunParams, ActionResult, Region, EntityType
data/sdn.json         ← 285 synthetic SDN entries (imported via @data/* tsconfig alias)
```

The v2.0 task is additive: introduce a landing page at `"/"`, move the tool to `"/tool"`, add contextual explanations, animate everything, and upgrade UI components.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Browser                                     │
│                                                                          │
│  "/" — Landing Page (server-rendered sections, client animation shell)   │
│    ├── HeroSection (SC + client AnimationShell for scroll reveals)       │
│    ├── HowItWorksSection (SC — 3 steps, stagger on scroll)              │
│    ├── FeatureStatsSection (SC — 4 stat cards, count-up animation)      │
│    └── CroweBrandedFooter (SC, replaces layout.tsx slim footer)         │
│                                                                          │
│  "/tool" — The Tool (unchanged logic, upgraded UI + explanations)       │
│    ├── ToolPage (client component — form state + useTransition)         │
│    │     ├── EntityCountsCard + EntityTypeTooltip                       │
│    │     ├── LinguisticRegionsCard + RegionTooltip                      │
│    │     ├── DegradationRulesCard + RuleInfoPopover                     │
│    │     └── ClientNameCard + RunButton                                 │
│    └── ResultsTable + CatchRatePanel (score interpretation)             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                          ↕ server action (unchanged)
┌──────────────────────────────────────────────────────────────────────────┐
│                           Next.js Server                                 │
│                                                                          │
│  app/actions/runTest.ts  (no changes needed for v2.0)                   │
│    ├── lib/sampler.ts                                                    │
│    ├── lib/rules/ (10 rule modules)                                      │
│    └── @data/sdn.json                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Question 1: Routing — File Moves and New Files

### The Core Decision

"/" becomes the landing page. "/tool" becomes the tool. This is a pure file-system move in App Router — no configuration required beyond creating the new directory.

### What Moves

| Current | New Location | Change Type |
|---------|-------------|-------------|
| `src/app/page.tsx` | `src/app/tool/page.tsx` | Move — minimal edits needed |
| `src/app/layout.tsx` | `src/app/layout.tsx` | Stay — but strip the slim header/footer; landing page owns its own footer |

The tool page (`page.tsx`) keeps its `"use client"` directive, all imports, and all state logic unchanged. The only required edit is removing the outer `<div className="min-h-screen bg-page py-10">` wrapper that duplicated layout concerns — that wrapper will belong to the route layout instead.

### New Files Required

```
src/app/
  page.tsx                          ← NEW: landing page (replaces current tool page at "/")
  tool/
    page.tsx                        ← MOVED: current src/app/page.tsx
    layout.tsx                      ← NEW (optional): tool-specific layout if header variant needed
  _components/                      ← NEW: route-private components (underscore = Next.js colocation)
    landing/
      HeroSection.tsx               ← server component
      HowItWorksSection.tsx         ← server component
      FeatureStatsSection.tsx       ← server component
      AnimationShell.tsx            ← "use client" wrapper for Anime.js scroll reveals
    tool/
      EntityTypeTooltip.tsx         ← "use client" (popover needs interaction)
      RegionTooltip.tsx             ← "use client"
      RuleInfoPopover.tsx           ← "use client"
      CatchRatePanel.tsx            ← "use client" or server (display only)

src/components/
  ui/
    tooltip.tsx                     ← NEW: shadcn Tooltip component (npx shadcn add tooltip)
    popover.tsx                     ← NEW: shadcn Popover component (npx shadcn add popover)
```

**Why `_components/` not `components/`:** App Router treats files in `app/` folders as route segments unless prefixed with `_`. Using `src/app/_components/landing/` keeps landing sections colocated with the landing route without accidentally creating a route at `/landing/`.

### Navigation

The landing page CTA button navigates to `"/tool"` using Next.js `<Link href="/tool">`. No router configuration needed. The global layout (`src/app/layout.tsx`) can optionally add a nav link. Since this is a single-CTA demo tool, a minimal "Try it" link in the header is sufficient — no full nav menu needed.

The slim indigo header in `layout.tsx` currently reads "OFAC Sensitivity Testing" on the right. For v2.0 it should add a `<Link href="/tool">` CTA on the right when on the landing page, and a `<Link href="/">` back-link when on the tool page. This can be handled with `usePathname()` in a client component wrapper for the header, or more simply by keeping the header server-rendered with static content and a persistent link.

---

## Question 2: Anime.js v4 Animation Architecture in App Router

### The Pattern: "AnimationShell" Client Wrapper

App Router server components cannot use `useEffect`, `useRef`, or any browser API. Anime.js v4's `createScope` and `revert()` are browser-only. The correct pattern is a thin `"use client"` wrapper that owns all animation lifecycle, wrapping server-rendered markup.

```typescript
// src/app/_components/landing/AnimationShell.tsx
'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger, onScroll, createScope } from 'animejs';

interface AnimationShellProps {
  children: React.ReactNode;
  animationType: 'hero' | 'how-it-works' | 'stats';
}

export function AnimationShell({ children, animationType }: AnimationShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scopeRef.current = createScope({ root: rootRef }).add(() => {
      if (animationType === 'hero') {
        animate('.hero-headline', {
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800,
          delay: 200,
          ease: 'outQuint',
        });
        animate('.hero-sub', {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 700,
          delay: 400,
          ease: 'outQuint',
        });
      }

      if (animationType === 'how-it-works') {
        onScroll({
          target: rootRef.current!,
          enter: 'bottom 80%',
          onEnter: () => {
            animate('.step-card', {
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 600,
              delay: stagger(120),
              ease: 'outQuint',
            });
          },
        });
      }

      if (animationType === 'stats') {
        onScroll({
          target: rootRef.current!,
          enter: 'bottom 80%',
          onEnter: () => {
            animate('.stat-number', {
              innerHTML: (el) => [0, parseInt(el.getAttribute('data-value') ?? '0')],
              round: 1,
              duration: 1800,
              delay: stagger(100),
              ease: 'outExpo',
            });
          },
        });
      }
    });

    return () => {
      scopeRef.current?.revert();
    };
  }, [animationType]);

  return <div ref={rootRef}>{children}</div>;
}
```

**Why `createScope` is mandatory:** `createScope` scopes all Anime.js selectors to the `root` element. Without it, `.step-card` would match every `.step-card` in the document, not just the ones in this section. `revert()` in cleanup removes all animation instances and restores the original DOM state — critical for React StrictMode (double mount) and React's fast-refresh cycle.

**Alternative — section-specific hooks:** Each animated section can have its own dedicated `useAnimationEffect` hook instead of a generic `AnimationShell`. This avoids the `animationType` switch and is cleaner for complex sections, but means more files. For 3-4 landing sections, a shared `AnimationShell` with a type prop is the right balance.

### Tool-Route Animation

The tool page already uses `"use client"` for form state. Micro-interactions (button hover, card entrance) can be added directly in the existing `page.tsx` or in `ResultsTable.tsx` using the same `useEffect` + `createScope` + `revert()` pattern. No new wrapper needed.

For hover micro-interactions on the Run button (amber glow pulse), Tailwind `transition-all` + the existing inline hover classes in `page.tsx` are sufficient — Anime.js is overkill for simple hover states. Reserve Anime.js for scroll reveals and stagger entrances.

### Scroll Reveal on Tool Page

Result rows appearing after a test run can be revealed with a staggered entrance via `useEffect` that fires when `rows.length > 0`. This is a `useEffect` with `[rows.length]` dependency in `page.tsx` (or `ResultsTable.tsx`), using `createScope` scoped to the results container ref.

---

## Question 3: Explanation Components — Shared vs Inline Per-Section

### Decision: Shared Tooltip + Popover Primitives, Per-Section Content Components

**Pattern:** shadcn Tooltip for short inline labels (one sentence), shadcn Popover for richer explanations (paragraph + examples). Both are shared primitives. The content (what the tooltip/popover says) lives in dedicated per-section components.

```
Shared primitives (install once):
  src/components/ui/tooltip.tsx       ← shadcn Tooltip
  src/components/ui/popover.tsx       ← shadcn Popover

Per-section content components:
  src/app/_components/tool/EntityTypeTooltip.tsx
  src/app/_components/tool/RegionTooltip.tsx
  src/app/_components/tool/RuleInfoPopover.tsx
  src/app/_components/tool/CatchRatePanel.tsx
```

**Why not inline:** If explanation content is written inline in `page.tsx`, the already-255-line component grows unmanageably. Extracting content to named components also makes the content updatable without touching form logic.

**Why not fully shared generic components:** The explanations are domain-specific. A `<RuleInfoPopover ruleId="rule-01" />` that knows about the 10 rules is more readable than a generic `<Popover content={RULE_DESCRIPTIONS[ruleId]} />`. The per-section component pattern is the right granularity.

### Tooltip Use Cases (short, 1-sentence)

- Entity type label hover: "Individual — a natural person listed on the SDN"
- Region label hover: "CJK — Chinese, Japanese, Korean character sets"
- Score column header hover: "Jaro-Winkler similarity — higher = more similar to original"

### Popover Use Cases (richer, triggered by an info icon)

- Each degradation rule: rule name, what it does, example input→output, why OFAC screening cares
- Score interpretation in results: what 85% means, where the 80% threshold came from

### `"use client"` Requirement

Both Tooltip and Popover from shadcn require `"use client"` because they use Radix UI primitives that manage focus, open/close state, and portal rendering. Wrapping them in the per-section components means those components are also client components. This is correct — the explanation components are small and add negligible bundle size.

---

## Question 4: Landing Page — Server vs Client Components

### Decision: Sections Are Server Components, Animation Wrapping Is Client

The landing page sections are largely static content (marketing copy, stats, step descriptions). They should be server components by default — faster TTFB, no hydration cost for content that never changes.

| Section | Component Type | Reason |
|---------|---------------|--------|
| HeroSection | Server Component (content) + `AnimationShell` (client wrapper) | Hero text is static; animations add motion without client state |
| HowItWorksSection | Server Component (content) + `AnimationShell` (client wrapper) | 3-step content is static; stagger reveal on scroll needs client |
| FeatureStatsSection | Server Component (content) + `AnimationShell` (client wrapper) | Numbers are hardcoded; count-up animation needs client |
| CroweBrandedFooter | Server Component | Pure HTML/CSS, no interaction needed |
| LandingCTA Button | Client Component (`"use client"` `<Link>`) | Could be a server `<Link>` — Next.js `Link` is a server-compatible component, no `"use client"` needed |

**The "islands" pattern:** Render the full section as a server component, then wrap it in `AnimationShell` (client component) which adds `useEffect` scroll reveal without making the content itself a client component. Next.js supports this — a server component can be a child of a client component, but only if passed as `children` or props (not imported directly inside the client component).

```typescript
// src/app/page.tsx — Landing page, server component
import { HeroSection } from './_components/landing/HeroSection';
import { AnimationShell } from './_components/landing/AnimationShell';

export default function LandingPage() {
  return (
    <main>
      <AnimationShell animationType="hero">
        <HeroSection />   {/* ← server component passed as children */}
      </AnimationShell>
      <AnimationShell animationType="how-it-works">
        <HowItWorksSection />
      </AnimationShell>
      <AnimationShell animationType="stats">
        <FeatureStatsSection />
      </AnimationShell>
      <CroweBrandedFooter />
    </main>
  );
}
```

**Important constraint:** `HeroSection`, `HowItWorksSection`, and `FeatureStatsSection` must be server components that do NOT contain any `"use client"` code — they're passed through `AnimationShell` as `children`, not imported by it. If they need client features, they should be split further (server shell + client interactive part).

### Component Boundaries Summary

| Component | `"use client"` | Reason |
|-----------|---------------|--------|
| `app/page.tsx` (landing) | No | Static layout, delegates to sections |
| `HeroSection.tsx` | No | Static content |
| `HowItWorksSection.tsx` | No | Static content |
| `FeatureStatsSection.tsx` | No | Numbers are hardcoded constants |
| `AnimationShell.tsx` | Yes | `useEffect`, `useRef`, Anime.js |
| `CroweBrandedFooter.tsx` | No | Static content |
| `app/tool/page.tsx` | Yes | Form state, `useTransition` (existing) |
| `ResultsTable.tsx` | Yes | Virtualizer, sort state (existing) |
| `EntityTypeTooltip.tsx` | Yes | Radix/shadcn Tooltip needs client |
| `RegionTooltip.tsx` | Yes | Radix/shadcn Tooltip needs client |
| `RuleInfoPopover.tsx` | Yes | Radix/shadcn Popover needs client |
| `CatchRatePanel.tsx` | No | Display-only, no interaction |

---

## Question 5: Build Order — Phases and Dependencies

### Dependency Graph

```
Landing page content (server, static)
    ← no deps beyond Tailwind/Crowe tokens

Landing page CTA navigation
    ← depends on /tool route existing

Tool page at /tool
    ← depends on page.tsx move (trivial, ~30min)

Explanation content (tooltips/popovers)
    ← depends on shadcn Tooltip + Popover installed
    ← independent of animation

Iconsax icon pass
    ← independent of everything, purely cosmetic

Animation pass (Anime.js scroll reveals)
    ← depends on landing page sections existing
    ← can be added to any already-shipped section

Premium UI components (React Bits / 21st.dev)
    ← enhancement layer, can overlay on existing markup
```

### Recommended Build Order

**Phase A: Route Migration** (prerequisite for everything — 1 session)
1. Create `src/app/tool/` directory
2. Move `src/app/page.tsx` to `src/app/tool/page.tsx` (git mv)
3. Update any internal `href="/"` links that should now point to `"/tool"` (there are none in v1.0)
4. Create new `src/app/page.tsx` as a minimal placeholder ("Coming soon" or direct redirect) — deploy and verify `/tool` works before building the landing page

**Phase B: Landing Page — Static Structure** (can ship before animations)
1. Install: `npm install iconsax-react` (needed for hero icons)
2. Build `HeroSection.tsx` — headline, sub, CTA button linking to `/tool`, hero visual
3. Build `HowItWorksSection.tsx` — 3 steps: Configure → Run → Download
4. Build `FeatureStatsSection.tsx` — 4 stats: 285 names, 10 rules, 4 entity types, ~53ms runtime
5. Build `CroweBrandedFooter.tsx` — replace layout.tsx slim footer for landing page context
6. Assemble in `src/app/page.tsx`
7. Deploy and verify — landing page ships before any animation work

**Phase C: Explanation Layer** (independent of landing, can run in parallel with B)
1. `npx shadcn add tooltip popover` (one command)
2. Build `EntityTypeTooltip.tsx`, `RegionTooltip.tsx`, `RuleInfoPopover.tsx`
3. Integrate into `src/app/tool/page.tsx` — add info icons next to form labels
4. Build `CatchRatePanel.tsx` — score interpretation below results summary row

**Phase D: Animation Pass**
1. Install: `npm install animejs` (if not already installed)
2. Build `AnimationShell.tsx` with `createScope` + `revert()` cleanup
3. Add hero entrance animation (page load, no scroll trigger needed)
4. Add scroll-reveal stagger for HowItWorksSection steps
5. Add count-up for FeatureStatsSection numbers
6. Add hover micro-interactions to Run button (amber glow — Tailwind transitions sufficient, no Anime.js)
7. Add results stagger reveal in `ResultsTable.tsx` when rows first appear
8. Test `prefers-reduced-motion` — add `@media` guard

**Phase E: Premium UI Upgrade**
1. Upgrade hero button with React Bits animated CTA component
2. Upgrade step cards with React Bits TiltCard or 21st.dev card variant
3. Iconsax pass on tool page — replace Lucide `Loader2` and any `lucide-react` icons
4. Iconsax pass on landing page — icons in step cards, feature stats, footer

---

## Recommended File Structure (v2.0 Target)

```
src/
  app/
    layout.tsx                        ← MODIFIED: header updated, slim footer removed
    globals.css                       ← UNCHANGED
    page.tsx                          ← NEW: landing page (server component)
    _components/
      landing/
        HeroSection.tsx               ← NEW (server)
        HowItWorksSection.tsx         ← NEW (server)
        FeatureStatsSection.tsx       ← NEW (server)
        CroweBrandedFooter.tsx        ← NEW (server)
        AnimationShell.tsx            ← NEW ("use client" — Anime.js scope wrapper)
      tool/
        EntityTypeTooltip.tsx         ← NEW ("use client" — shadcn Tooltip)
        RegionTooltip.tsx             ← NEW ("use client" — shadcn Tooltip)
        RuleInfoPopover.tsx           ← NEW ("use client" — shadcn Popover)
        CatchRatePanel.tsx            ← NEW (server or client — display only)
    tool/
      page.tsx                        ← MOVED from src/app/page.tsx
    actions/
      runTest.ts                      ← UNCHANGED

  components/
    ResultsTable.tsx                  ← MODIFIED: CatchRatePanel integrated, icons upgraded
    ui/
      button.tsx                      ← UNCHANGED
      card.tsx                        ← UNCHANGED
      checkbox.tsx                    ← UNCHANGED
      input.tsx                       ← UNCHANGED
      label.tsx                       ← UNCHANGED
      tooltip.tsx                     ← NEW (shadcn add tooltip)
      popover.tsx                     ← NEW (shadcn add popover)

  lib/                                ← UNCHANGED (all pure functions)
  types/                              ← UNCHANGED
  data/                               ← UNCHANGED (via @data/* alias)
```

---

## Data Flow — v2.0 Changes

The core data flow (form → server action → results) is completely unchanged. v2.0 adds two new flows:

**Landing → Tool Navigation:**
```
User lands at "/" (landing page, server-rendered)
  → Clicks "Run a Test" CTA
  → Next.js Link navigates to "/tool" (client-side navigation, no page reload)
  → Tool page hydrates with existing form state (empty, fresh session)
```

**Explanation Content:**
```
User hovers info icon next to "Entity Counts" label
  → EntityTypeTooltip renders (Radix Tooltip portal)
  → Tooltip content: static string constant from constants.ts or inline
  → No server round-trip, no state change
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Making Landing Sections Client Components

**What people do:** Add `"use client"` to `HeroSection.tsx` to use Anime.js directly inside the component.

**Why it's wrong:** Forces the entire section tree to hydrate on the client, defeating the SEO and TTFB benefits of server rendering. The marketing content is static — there's no reason to ship it as a client component.

**Do this instead:** Keep sections as server components. Wrap them in `AnimationShell` (client) as `children`. Anime.js targets DOM elements by class name after mount — it doesn't need the component to be a client component.

### Anti-Pattern 2: Skipping `createScope` in Anime.js

**What people do:** Call `animate('.step-card', {...})` directly in `useEffect` without `createScope`.

**Why it's wrong:** Without scope, the selector matches ALL `.step-card` elements in the document. If the user navigates back to the landing page, React re-mounts and a second animation runs on already-animated elements. Also breaks if multiple `AnimationShell` instances have overlapping class names.

**Do this instead:** Always wrap Anime.js animations in `createScope({ root: rootRef })` and call `scopeRef.current?.revert()` in the `useEffect` cleanup.

### Anti-Pattern 3: One Giant Tooltip Component With All Explanation Content

**What people do:** Build a single `<ExplanationTooltip type="entity" | "region" | "rule" />` with a giant switch statement of content.

**Why it's wrong:** Creates a single file that owns all domain explanation content — hard to update, hard to test, large import footprint. Also couples explanation delivery mechanism (tooltip vs popover) to a single component decision.

**Do this instead:** Separate components per form section. `EntityTypeTooltip.tsx` uses a Tooltip. `RuleInfoPopover.tsx` uses a Popover (different delivery mechanism because rule explanations are longer). Keep content co-located with the relevant component.

### Anti-Pattern 4: Moving `runTest.ts` During Route Migration

**What people do:** Move `src/app/actions/runTest.ts` to `src/app/tool/actions/runTest.ts` to keep it colocated with the `/tool` route.

**Why it's wrong:** All 57+ tests import from the current path. `page.tsx` imports from `@/app/actions/runTest`. Moving it requires updating every test file and every import. Zero benefit — server actions don't need to be colocated with their invoking route in App Router.

**Do this instead:** Leave `src/app/actions/runTest.ts` exactly where it is. The import `import { runTest } from '@/app/actions/runTest'` in `tool/page.tsx` works fine from any route.

### Anti-Pattern 5: Adding Animation to Every Interactive Element

**What people do:** Reach for Anime.js for every hover state and button press.

**Why it's wrong:** Tailwind CSS transitions are zero-JS, GPU-composited, and respect `prefers-reduced-motion` automatically when using standard Tailwind transition utilities. Adding Anime.js for hover states adds JavaScript overhead with no visual advantage.

**Do this instead:** Use Tailwind `transition-all duration-200` for hover states. Use Anime.js only for: page/section entrance animations, scroll-triggered reveals, staggered list entrances, and the count-up number animation.

---

## Integration Points

### Unchanged Integration Points

| Integration | Status | Notes |
|-------------|--------|-------|
| `@data/sdn.json` tsconfig alias | Unchanged | `runTest.ts` import unaffected by route migration |
| Tailwind v4 `@theme` inline block | Unchanged | All Crowe color tokens still generate utility classes |
| shadcn/ui components in `src/components/ui/` | Unchanged | Add Tooltip + Popover via shadcn CLI |
| TanStack virtualizer in `ResultsTable.tsx` | Unchanged | Explicit px widths still required |
| Vitest test suite | Unchanged | Tests target `@/lib/*` and `@/app/actions/*` — not affected by route move |

### New Integration Points

| Integration | How | Notes |
|-------------|-----|-------|
| Anime.js v4 | `npm install animejs` | Import modularly — only `animate`, `stagger`, `onScroll`, `createScope` |
| Iconsax | `npm install iconsax-react` | Replace Lucide `Loader2` — use `Refresh2` or `Loading` variant from Iconsax |
| shadcn Tooltip | `npx shadcn add tooltip` (with `NODE_TLS_REJECT_UNAUTHORIZED=0`) | Radix-based, needs `"use client"` in consuming component |
| shadcn Popover | `npx shadcn add popover` (with `NODE_TLS_REJECT_UNAUTHORIZED=0`) | Radix-based, needs `"use client"` in consuming component |
| React Bits / 21st.dev components | Copy-paste, no install | Apply Crowe token overrides after copying |

---

## Sources

- Next.js App Router documentation — route colocation, private folders (`_`), server vs client components: https://nextjs.org/docs/app/building-your-application/routing/colocation
- Next.js — passing server components as children to client components: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#passing-server-components-to-client-components-as-props
- Anime.js v4 `createScope` documentation: https://animejs.com/documentation/scope/
- Anime.js v4 `onScroll` documentation: https://animejs.com/documentation/scroll/
- shadcn/ui Tooltip: https://ui.shadcn.com/docs/components/tooltip
- shadcn/ui Popover: https://ui.shadcn.com/docs/components/popover

---

*Architecture research for: OFAC Sensitivity Testing Tool — v2.0 Production Face milestone*
*Researched: 2026-03-05*
*Supersedes: prior ARCHITECTURE.md dated 2026-03-03 (v1.0 greenfield architecture)*
