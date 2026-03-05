# Phase 10: Landing Page - Research

**Researched:** 2026-03-05
**Domain:** Next.js 15 App Router route restructuring + static landing page sections (Server Components)
**Confidence:** HIGH — all findings drawn from milestone research verified against codebase inspection; no new unknowns for this phase.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | User can view a landing page at "/" with a hero section and primary CTA button that navigates to the tool | Route restructuring + HeroSection Server Component + Next.js Link to /tool |
| LAND-02 | User can read a "How It Works" 3-step methodology section explaining configure → run → export | HowItWorksSection Server Component — static HTML/Tailwind only, no animation in this phase |
| LAND-03 | User can view a features/stats section showing real engine numbers (285 entries, 10 rules, ~53ms, 4 regions) | FeatureStatsSection Server Component with hardcoded constants |
| LAND-04 | User can see a Crowe-branded footer with navigation links | CroweBrandedFooter Server Component replacing layout.tsx slim footer for landing route |
| EXPL-04 | User can read a methodology explanation on the landing "How It Works" section that educates clients before they see the form | Inline copy inside HowItWorksSection — plain text expansion of each 3-step card |
</phase_requirements>

---

## Summary

Phase 10 has two distinct sub-tasks that must be executed in order. First, restructure routes: move `src/app/page.tsx` to `src/app/tool/page.tsx` and create a new `src/app/page.tsx` for the landing page. The tool is currently the only page and owns the root route — nothing else can happen until this move is complete and `next build` passes. Second, build the landing page as a composition of Server Components: HeroSection, HowItWorksSection (with EXPL-04 methodology copy), FeatureStatsSection, and CroweBrandedFooter.

This phase deliberately excludes animations (Phase 13), Iconsax icons (Phase 12), and premium React Bits components (Phase 14). The deliverable is a fully functional, static, Crowe-branded landing page that can be reviewed and shipped before the enhancement layers are added. All landing sections are Server Components — no `'use client'` in any landing section file. The `AnimationShell` client wrapper is intentionally deferred to Phase 13.

The layout.tsx slim footer is currently shared across all routes. Phase 10 builds a richer `CroweBrandedFooter` for the landing page while retaining the layout.tsx footer for the tool route. This means the landing page composes its own footer inline, and layout.tsx continues serving the tool route's minimal footer — no layout.tsx modification is required.

**Primary recommendation:** Do route restructuring as Wave 1, landing page static content as Wave 2. Each wave ends with `next build` verification before proceeding. Do not merge the waves.

---

## Standard Stack

### Core (Already Installed — Do Not Reinstall)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App Router, Server Components, Link navigation | Existing stack |
| react | 19.2.3 | Server Component rendering | Existing stack |
| tailwindcss | ^4 | Utility styling with Crowe @theme tokens | Existing stack |
| clsx + tailwind-merge | current | Class composition utilities | Already in package.json |

### No New Installs Required for Phase 10

Phase 10 uses only what is already installed. Iconsax and Anime.js are deferred to Phase 12 and Phase 13 respectively. The landing page is static HTML/Tailwind.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static Server Components | Client Components with useState for hero interactivity | Client Components increase hydration cost for content that is purely static. Server Components give faster TTFB and zero client JS for the landing sections. |
| Composing own footer on landing page | Modifying layout.tsx to conditionally render richer footer | Conditional layout is harder to maintain and couples landing concerns into the shared layout. Composing the footer in the landing page keeps concerns separated. |

---

## Architecture Patterns

### Recommended Project Structure After Phase 10

```
src/app/
  page.tsx                         (NEW — landing page, Server Component, exports metadata)
  layout.tsx                       (UNCHANGED — slim header + slim footer still serves /tool)
  tool/
    page.tsx                       (MOVED from src/app/page.tsx — Client Component, unchanged logic)
    layout.tsx                     (NEW — Server Component, exports metadata for /tool route)
  _components/
    landing/
      HeroSection.tsx              (NEW — Server Component)
      HowItWorksSection.tsx        (NEW — Server Component, includes EXPL-04 methodology copy)
      FeatureStatsSection.tsx      (NEW — Server Component, hardcoded engine numbers)
      CroweBrandedFooter.tsx       (NEW — Server Component)
  actions/
    runTest.ts                     (UNCHANGED — path stays, import from tool/page.tsx works)
```

### Pattern 1: Route File Move (git mv)

**What:** Move `src/app/page.tsx` to `src/app/tool/page.tsx` using `git mv` so git tracks the rename. Create new `src/app/page.tsx` for the landing page. Create `src/app/tool/layout.tsx` (Server Component) to own tool-route metadata since `tool/page.tsx` keeps its `'use client'` directive and cannot export metadata.

**When to use:** The prerequisite for all Phase 10 work. Must be done before any landing page content is written.

**Key constraint:** The only required edit to `tool/page.tsx` after the move is verifying the server action import path. The import `import { runTest } from '@/app/actions/runTest'` is path-based and works from any route — it does not need to change.

```typescript
// src/app/tool/layout.tsx — NEW, Server Component, no 'use client'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Run Test — OFAC Sensitivity Testing | Crowe',
  description: 'Configure and run synthetic OFAC name degradation tests against 285 synthetic SDN entries.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### Pattern 2: Server Component Landing Page Compositor

**What:** `src/app/page.tsx` is a Server Component (no `'use client'`) that exports its own `metadata` and composes the four landing sections as children. It does not import AnimationShell (Phase 13 concern).

**When to use:** The root landing page file.

```typescript
// src/app/page.tsx — NEW, Server Component
import type { Metadata } from 'next';
import { HeroSection } from './_components/landing/HeroSection';
import { HowItWorksSection } from './_components/landing/HowItWorksSection';
import { FeatureStatsSection } from './_components/landing/FeatureStatsSection';
import { CroweBrandedFooter } from './_components/landing/CroweBrandedFooter';

export const metadata: Metadata = {
  title: 'OFAC Sensitivity Testing — Crowe',
  description: 'Run live OFAC sensitivity testing demonstrations with synthetic data. No file prep required.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-page">
      <HeroSection />
      <HowItWorksSection />
      <FeatureStatsSection />
      <CroweBrandedFooter />
    </main>
  );
}
```

### Pattern 3: Landing Section as Server Component

**What:** Each landing section is a pure Server Component — no hooks, no client APIs, no `'use client'`. They receive no props (all content is static). Class names target the Crowe @theme tokens already defined in globals.css.

**When to use:** HeroSection, HowItWorksSection, FeatureStatsSection, CroweBrandedFooter.

**Critical rule:** Do NOT add `'use client'` to any landing section in Phase 10. Animated wrappers are Phase 13. Adding `'use client'` now would prevent future `AnimationShell` children composition (the server-component-as-children pattern) and remove the ability to export metadata from the page.

```typescript
// src/app/_components/landing/HeroSection.tsx — Server Component
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-page px-6 py-20 flex flex-col items-center text-center">
      <h1 className="hero-headline font-bold text-5xl text-crowe-indigo-dark max-w-3xl leading-tight">
        Test your OFAC screening before your client does.
      </h1>
      <p className="hero-sub mt-6 text-lg text-tint-700 max-w-xl">
        A live sensitivity-testing tool that degrades real-world name variations
        against 285 synthetic SDN entries. No file prep. No waiting.
      </p>
      <Link
        href="/tool"
        className="mt-10 inline-flex items-center gap-2 bg-crowe-amber px-8 py-4 rounded-md font-bold text-crowe-indigo-dark hover:bg-crowe-amber-dark transition-colors duration-200"
      >
        Configure Your Test
      </Link>
    </section>
  );
}
```

### Pattern 4: HowItWorksSection with EXPL-04 Methodology Copy

**What:** Three-card section with methodology explanation inline. Each card has a step number, a short action title (Configure / Run / Export), and a 2-3 sentence explanation of what the step does and why it matters for OFAC screening accuracy. This satisfies both LAND-02 (3-step section) and EXPL-04 (methodology context).

**When to use:** The second section on the landing page.

**Copy for each step (authoritative for planners to use verbatim):**

- **Configure:** Set entity count, linguistic regions, and degradation rules. Each rule simulates a real-world data-entry error — typos, transliterations, dropped characters — that screening systems encounter in practice.
- **Run:** The engine applies your selected rules to 285 synthetic SDN entries and scores each name pair using Jaro-Winkler similarity. Results are returned in under 60ms.
- **Export:** Download a CSV of all results showing original name, degraded variant, similarity score, and match/no-match status. The catch rate tells you what percentage of degraded names your screening threshold would have flagged.

### Pattern 5: FeatureStatsSection with Engine Numbers

**What:** A grid of 4 stat cards displaying hardcoded engine numbers. Values are constants, not fetched from the server. No animation in Phase 10 — count-up animation is Phase 13. Each card has a large number, a label, and optionally a sub-label.

**The four stats:**
| Stat | Display Value | Label |
|------|--------------|-------|
| SDN entries | 285 | Synthetic SDN Entries |
| Degradation rules | 10 | Degradation Rules |
| Linguistic regions | 4 | Linguistic Regions |
| Processing time | ~53ms | Avg. Processing Time |

**Implementation note:** Wrap each stat number in a `data-value` attribute and a class like `stat-number` for Phase 13 animation to target. Phase 10 renders the number as static text.

```typescript
// Stat card markup pattern for Phase 13 compatibility
<span className="stat-number text-5xl font-bold text-crowe-indigo-dark" data-value="285">
  285
</span>
```

### Pattern 6: CroweBrandedFooter

**What:** A richer footer than the slim layout.tsx footer. Contains: Crowe wordmark, navigation links (back to landing, link to tool), legal disclaimer, copyright. Replaces the slim `<footer>` for the landing page context while the tool route continues using layout.tsx's footer.

**Navigation links in footer:**
- "Run a Test" → `/tool`
- "Crowe.com" → `https://crowe.com` (target `_blank`)
- Disclaimer: "For demonstration purposes only. Not for compliance use."

### Anti-Patterns to Avoid

- **Adding `'use client'` to any landing section:** Prevents AnimationShell children composition in Phase 13 and blocks metadata export.
- **Modifying layout.tsx footer or header:** Layout serves both routes. The landing page composes its own footer. Do not add route-conditional logic to layout.tsx.
- **Moving `src/app/actions/runTest.ts`:** The path is imported by tool/page.tsx. Moving it requires updating all test imports — zero benefit.
- **Adding a redirect from "/" to "/tool":** The landing page IS the root. A redirect would bypass it.
- **Importing Anime.js in any Phase 10 file:** Anime.js is Phase 13. Importing it in a Server Component causes SSR crash.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation to /tool | Custom router.push or window.location | Next.js `<Link href="/tool">` | Link enables prefetching and client-side navigation; no page reload |
| Background color layers | Custom CSS on individual elements | Crowe @theme tokens already in globals.css | `bg-page` (#f8f9fc), `bg-crowe-indigo-dark`, `text-crowe-amber` all resolve from existing @theme block |
| Card layout | CSS Grid from scratch | Tailwind `grid grid-cols-3 gap-6` or `flex` utilities | Already available via Tailwind v4 |

**Key insight:** Phase 10 is pure markup and token application. The Crowe design system, Tailwind utilities, and Next.js Link are all the tools needed.

---

## Common Pitfalls

### Pitfall 1: Route Move Left Tool at "/" — Two Copies or 404

**What goes wrong:** If `src/app/page.tsx` is not replaced with the landing page after moving its content to `tool/page.tsx`, the tool remains at "/" and "/tool" returns 404. Or if the developer copies instead of moves, both routes show the tool.

**Why it happens:** Confusion between copy and move. Not replacing the root page.tsx.

**How to avoid:** Execute in exact order: (1) create `src/app/tool/` directory, (2) `git mv src/app/page.tsx src/app/tool/page.tsx`, (3) create new `src/app/page.tsx` as landing page. Run `next build` before adding any content. Verify: "/" loads landing hero, "/tool" loads form.

**Warning signs:** "/" shows tool form. "/tool" returns 404. `next build` completes but wrong content at each route.

### Pitfall 2: `metadata` Export in `'use client'` Page — Hard Build Error

**What goes wrong:** `tool/page.tsx` keeps `'use client'`. If a developer adds `export const metadata` to it, `next build` fails: `"metadata" is not supported in a Client Component`.

**Why it happens:** Developer wants to set the tool route's page title but forgets the Client Component constraint.

**How to avoid:** Create `src/app/tool/layout.tsx` as a Server Component that exports the tool route's metadata. The layout.tsx file is the correct place — it wraps tool/page.tsx without needing `'use client'`.

**Warning signs:** `next build` fails with the metadata-in-Client-Component error.

### Pitfall 3: Landing page accidentally becomes Client Component — metadata silently broken

**What goes wrong:** Developer adds `'use client'` to `src/app/page.tsx` to use some interaction. The page-level `metadata` export silently stops working. The root layout.tsx metadata is used instead on the landing page.

**Why it happens:** Developer needs an interactive element on the landing page and adds `'use client'` to the page file instead of extracting the interactive part to a child component.

**How to avoid:** `src/app/page.tsx` must never have `'use client'`. Any interactive element (if needed — none required in Phase 10) must be extracted to a child Client Component file.

**Warning signs:** Browser tab shows "OFAC Sensitivity Testing — Crowe" instead of the landing-specific title. `<meta name="description">` shows the layout.tsx description.

### Pitfall 4: Tailwind Color Classes Not Resolving

**What goes wrong:** Classes like `text-crowe-indigo-dark` render as transparent/missing.

**Why it happens:** Tailwind v4 generates utilities from the `@theme inline` block in globals.css. If a developer uses a color token name that is slightly different from the registered name, no error is thrown — the class just does nothing.

**How to avoid:** Before writing any markup, verify the token names by checking `src/app/globals.css` `@theme inline` block. Use only tokens defined there. The project uses `crowe-indigo-dark`, `crowe-amber`, `tint-700`, `bg-page` etc. Do not use `bg-crowe-indigo` if only `crowe-indigo-dark` is in @theme.

**Warning signs:** Text is invisible, background is transparent, colors don't match design.

### Pitfall 5: layout.tsx Footer Appears Below Landing CroweBrandedFooter

**What goes wrong:** The landing page renders its own `<CroweBrandedFooter>` inside `<main>`, but the root `layout.tsx` also renders its `<footer>` below `{children}`. Result: two footers stack on the landing page.

**Why it happens:** The layout.tsx footer wraps all routes. The landing page adds its own footer without accounting for this.

**How to avoid:** Two options: (A) Remove the slim footer from layout.tsx and ensure `tool/page.tsx` or `tool/layout.tsx` includes its own footer, or (B) Keep the landing footer outside `<main>` but check how layout.tsx wraps content. Option A is cleaner for the long term.

**Recommended approach for Phase 10:** Remove the slim `<footer>` from `layout.tsx` and add a matching slim footer inside the tool route area (either in `tool/layout.tsx` or `tool/page.tsx`). The landing page then owns its full-featured footer exclusively.

**Warning signs:** Two footers visible at the bottom of the landing page.

---

## Code Examples

### Hero CTA Button Using Next.js Link

```typescript
// Source: Next.js official docs — Link component
// Renders as <a> tag, enables client-side navigation with prefetch
import Link from 'next/link';

<Link
  href="/tool"
  className="inline-flex items-center gap-2 bg-crowe-amber px-8 py-4 rounded-md font-bold text-crowe-indigo-dark hover:bg-crowe-amber-dark transition-colors duration-200 shadow-amber-glow hover:shadow-amber-glow-hover"
>
  Configure Your Test
</Link>
```

### Tool Layout for Metadata Export

```typescript
// src/app/tool/layout.tsx — Server Component, no 'use client'
// Source: Next.js App Router — metadata in layouts pattern
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Run Test — OFAC Sensitivity Testing | Crowe',
  description: 'Configure and run synthetic OFAC name degradation tests against 285 synthetic SDN entries.',
};

export default function ToolLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

### FeatureStatsSection Data-Value Pattern (Phase 13 Compatibility)

```typescript
// stat-number class + data-value attribute lets Phase 13 target count-up animation
// without any changes to Phase 10's markup
const STATS = [
  { value: 285, label: 'Synthetic SDN Entries', dataValue: '285' },
  { value: 10, label: 'Degradation Rules', dataValue: '10' },
  { value: 4, label: 'Linguistic Regions', dataValue: '4' },
  { value: 53, label: 'Avg. Processing Time (ms)', dataValue: '53' },
];

// In JSX:
<span className="stat-number block text-5xl font-bold text-crowe-indigo-dark" data-value={stat.dataValue}>
  {stat.value}{stat.value === 53 ? 'ms' : ''}
</span>
```

### CroweBrandedFooter Navigation Link Structure

```typescript
// Footer links — both Next.js Link (internal) and <a> (external)
import Link from 'next/link';

// Internal
<Link href="/tool" className="text-white/70 hover:text-crowe-amber transition-colors text-sm">
  Run a Test
</Link>

// External
<a
  href="https://www.crowe.com"
  target="_blank"
  rel="noopener noreferrer"
  className="text-white/70 hover:text-crowe-amber transition-colors text-sm"
>
  Crowe.com
</a>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `getStaticProps` for static landing pages | App Router Server Components | Next.js 13+ | No need for `getStaticProps` — Server Components are static by default. Just return JSX. |
| layout.tsx as only place for route metadata | Per-route `metadata` export in page.tsx or layout.tsx | App Router | Phase 10 uses page.tsx metadata for landing; tool/layout.tsx metadata for tool route. |
| Single `page.tsx` for entire app | Route-based `page.tsx` files in subdirectories | App Router | Tool moves to `app/tool/page.tsx` with zero configuration changes. |

**Deprecated/outdated:**
- `getStaticProps` / `getServerSideProps`: Not applicable in App Router. Landing page is a Server Component with no data fetching needed.
- `_app.tsx` / `_document.tsx`: Pages Router patterns. This project uses App Router `layout.tsx`.

---

## Open Questions

1. **Footer duplication between layout.tsx and CroweBrandedFooter**
   - What we know: layout.tsx renders a slim `<footer>` for all routes. Landing page needs a richer footer.
   - What's unclear: Whether to (A) remove layout.tsx footer and let each route own its footer, or (B) suppress layout.tsx footer only on the landing page.
   - Recommendation: Option A — remove the slim footer from layout.tsx and add it back inside `src/app/tool/layout.tsx`. This is a clean separation. The root layout.tsx becomes header-only. The planner should make this call explicit in the plan.

2. **Header behavior on landing page vs tool page**
   - What we know: layout.tsx header shows "Crowe" and "OFAC Sensitivity Testing" on the right for all routes.
   - What's unclear: Whether the landing page header should have a CTA link to "/tool" instead of the static sub-label.
   - Recommendation: Phase 10 can keep the header static — adding nav behavior to the header is a polish concern. The prominent hero CTA is sufficient for Phase 10.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | vite.config.ts (at project root, assumed — paramForm.test.ts exists and runs) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAND-01 | "/" route returns landing page (hero + CTA) | smoke — `next build` passes, manual browser check | `npm run build` | N/A — verified by build success |
| LAND-02 | HowItWorksSection renders 3 step cards | visual-manual | `npm run build` then inspect | ❌ Wave 0 (build-only gate) |
| LAND-03 | FeatureStatsSection renders correct numbers | visual-manual | `npm run build` then inspect | ❌ Wave 0 (build-only gate) |
| LAND-04 | CroweBrandedFooter renders with links | visual-manual | `npm run build` then inspect | ❌ Wave 0 (build-only gate) |
| EXPL-04 | HowItWorksSection contains methodology copy | visual-manual | `npm run build` then inspect | ❌ Wave 0 (build-only gate) |

**Note on test scope:** Phase 10 is purely presentational Server Component markup. The existing test suite (`paramForm.test.ts`) covers form logic — it is unaffected by the route move. No new unit tests are required for static landing sections. The gate is `next build` passing and manual browser verification of each section.

### Sampling Rate

- **Per task commit:** `npm run build` (surface any import/type errors introduced)
- **Per wave merge:** `npm run build` + manual browser verification of "/" and "/tool"
- **Phase gate:** Full suite green (`npm test`) + `next build` passes + both routes visually verified before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No new test files required — existing `paramForm.test.ts` is unaffected by route move
- [ ] `next build` is the primary gate — must pass at end of Wave 1 (route move) and Wave 2 (landing content)
- [ ] No framework install needed — Vitest is already installed

---

## Sources

### Primary (HIGH confidence)

- `src/app/page.tsx` codebase inspection — confirmed `'use client'` at line 1; exact import paths for server action; Loader2 from lucide-react confirmed
- `src/app/layout.tsx` codebase inspection — slim header and slim footer confirmed; metadata object at root layout confirmed
- `package.json` codebase inspection — next 16.1.6, react 19.2.3, tailwindcss ^4, no animejs, no iconsax confirmed
- `.planning/research/ARCHITECTURE.md` — App Router route move checklist, Server/Client component boundary patterns, AnimationShell deferred architecture
- `.planning/research/STACK.md` — route architecture: standard `app/tool/page.tsx` subfolder pattern confirmed, no rewrites needed
- `.planning/research/PITFALLS.md` — Pitfalls 3, 4, 5 directly address Phase 10 risks
- `.planning/research/SUMMARY.md` — Phase 2 (Landing Page Static Structure) scope and rationale
- Next.js App Router official docs — route colocation: https://nextjs.org/docs/app/building-your-application/routing/colocation
- Next.js — metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js — Link component: https://nextjs.org/docs/app/api-reference/components/link

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — LAND-01 through LAND-04 and EXPL-04 requirement text
- `.planning/STATE.md` — accumulated decisions: route restructuring must be first, layout.tsx metadata at root level

---

## Metadata

**Confidence breakdown:**
- Route restructuring: HIGH — standard App Router file move, documented in official Next.js docs and confirmed in milestone research
- Landing sections as Server Components: HIGH — confirmed pattern from ARCHITECTURE.md and official Next.js composition docs
- Crowe brand token usage: HIGH — @theme inline block confirmed in codebase, token names verified
- Footer duplication risk: HIGH — flagged in Open Questions; plan must make an explicit call
- Test scope: HIGH — existing suite is path-based, unaffected by route move; build is the gate

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable Next.js App Router patterns; no fast-moving dependencies in this phase)
