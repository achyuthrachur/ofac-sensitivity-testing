# Stack Research

**Domain:** v2.0 Production Face — animation, icons, premium UI components, landing page route
**Researched:** 2026-03-05
**Confidence:** HIGH (critical claims verified via official GitHub issue tracker and multiple sources; version numbers from npm search results dated 2026-02-15)

---

## Context: What Already Exists (Do NOT Re-Install)

This document covers only NEW additions for v2.0. The following are already in `package.json` and validated.

| Already Installed | Version | Status |
|-------------------|---------|--------|
| next | 16.1.6 | Validated — do not upgrade |
| react + react-dom | 19.2.3 | React 19 — affects icon library choice |
| tailwindcss | ^4 | Tailwind v4 — affects React Bits token compatibility |
| shadcn (dev) | ^3.8.5 | Used for React Bits CLI installs |
| lucide-react | ^0.576.0 | Keep until icon pass is complete |
| clsx, tailwind-merge, class-variance-authority | current | Already present — used by React Bits components |
| @tanstack/react-virtual | ^3.13.19 | Unchanged |

---

## Recommended Stack Additions

### New npm Dependencies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| animejs | ^4.3.6 | Scroll-triggered reveals, stagger entrances, hover micro-interactions | v4 is current (released 2025, latest 4.3.6 as of 2026-02-15, active release cadence). ES Module named exports enable tree-shaking — ship only `animate`, `onScroll`, `stagger`, `createScope` (~25KB total). Framework-agnostic: integrates with Next.js App Router via `useEffect` with no configuration. No React 19 peer dep issues. |
| iconsax-react-19 | ^1.2.5 | Crowe-aligned icon set replacing generic lucide-react icons | The original `iconsax-react` (v0.0.8, unmaintained 4+ years) has a **confirmed React 19 breakage**: icons do not render because React 19 removed `defaultProps` for function components, which the original package relied on for `size` and `color` defaults. `iconsax-react-19` is the community fork that fixes this. Same component API — swap the import. 6 style variants × 1000 icons. |

### Copy-Paste Component Libraries (Zero npm Impact Unless Deps Required)

| Library | Install Method | Purpose | Notes |
|---------|---------------|---------|-------|
| React Bits | `npx shadcn@latest add @react-bits/<ComponentName>-TS-TW` | Animated hero text, tilt cards, animated lists, spotlight cards, backgrounds | Components install to `src/components/` as owned code — not a node_module. TS-TW variant is TypeScript + Tailwind, matching existing stack. Per-component deps (e.g., `motion` for text animations) are installed automatically by the shadcn CLI only when that component is added. |
| 21st.dev | Browse https://21st.dev/community/components, copy-paste source | Premium animated hero elements, CTA buttons, feature cards | No registry or install command. Copy source into `src/components/landing/`, adapt Crowe color tokens, add `'use client'` if component uses hooks. Any deps listed in the component's imports must be installed manually. `clsx` (already installed) covers the most common dep. |

---

## Installation Commands

```bash
# 1. Anime.js v4 — one install covers all animation needs
npm install animejs

# 2. Iconsax React 19-compatible fork
npm install iconsax-react-19
# No --legacy-peer-deps needed — fork declares React 19 in peer deps

# 3. React Bits — install per component at point of use, examples:
npx shadcn@latest add @react-bits/BlurText-TS-TW        # hero headline reveal
npx shadcn@latest add @react-bits/SplitText-TS-TW       # per-word text animation
npx shadcn@latest add @react-bits/CountUp-TS-TW         # animated stats
npx shadcn@latest add @react-bits/TiltCard-TS-TW        # 3D hover feature cards
npx shadcn@latest add @react-bits/SpotlightCard-TS-TW   # cursor-tracked spotlight card
npx shadcn@latest add @react-bits/AnimatedList-TS-TW    # staggered list entrance
# Check install output for any new packages added to package.json

# 4. 21st.dev — no install, copy paste from browser
# https://21st.dev/community/components

# DO NOT install:
# npm install iconsax-react   ← broken on React 19 (defaultProps removed)
# npm install framer-motion   ← only install if a React Bits component requires it and CLI doesn't add it automatically
```

---

## Route Architecture: "/" Landing + "/tool" App

### Current State

`src/app/page.tsx` is the OFAC tool. Adding a landing page at `/` means the tool must move to `/tool`.

### Solution — Standard App Router Subfolder

No config changes, no rewrites, no parallel routes. This is a file move.

```
src/app/
├── page.tsx              ← NEW file: landing page (Hero, How It Works, Features, Footer)
├── layout.tsx            ← unchanged: root layout wraps both routes automatically
├── tool/
│   └── page.tsx          ← MOVED: current src/app/page.tsx content
└── actions/
    └── runTest.ts        ← unchanged: server actions are not route-scoped
```

**Migration checklist:**
1. Move `src/app/page.tsx` → `src/app/tool/page.tsx`
2. Create new `src/app/page.tsx` for the landing page
3. Update any `href="/"` links inside the tool UI to `href="/tool"`
4. Update the CTA button on the landing page to link to `href="/tool"`
5. Verify `src/app/__tests__/` test imports — these reference source file paths, not URL routes, so they are unaffected

**What does NOT change:**
- `src/app/layout.tsx` — wraps both routes without modification
- `src/app/actions/runTest.ts` — server actions import by file path, not by URL
- All test files in `__tests__/` — test imports are path-based
- `next.config` — no rewrites or redirects needed

**Why not parallel routes (`@slot`)?**
Parallel routes (`@analytics/` folder convention) are for simultaneously rendering independent UI panels at the same URL. Two distinct pages at two distinct URLs is just two `page.tsx` files in two folders — the standard App Router pattern.

---

## Anime.js v4: App Router Integration Pattern

### The SSR Constraint

Anime.js v4 accesses the DOM (`window`, `document`, `IntersectionObserver`). Next.js App Router components are React Server Components by default — they run on the server where these APIs do not exist.

**Required:** Mark every component containing anime.js as a Client Component.

### Correct Pattern

```tsx
'use client'; // REQUIRED — top of every file using animejs

import { useEffect, useRef } from 'react';
import { animate, stagger, onScroll, createScope } from 'animejs';

export function AnimatedHeroSection() {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!root.current) return;
    scope.current = createScope({ root: root.current }).add(() => {
      animate('.hero-card', {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 600,
        delay: stagger(80),
        ease: 'outQuint',
      });
    });
    return () => scope.current?.revert(); // cleanup on unmount/navigation
  }, []);

  return <div ref={root}>{/* content */}</div>;
}
```

**Rules:**
1. `'use client'` directive at the top of any file importing animejs — non-negotiable
2. All animation initialization inside `useEffect` — never at module level or in render body
3. Always return cleanup from `useEffect` (`scope.current?.revert()`) — prevents memory leaks across App Router navigations
4. `onScroll` uses `IntersectionObserver` — client-only, must be in `useEffect`
5. Server Component pages (`app/page.tsx`) can import these Client Components directly — Next.js handles the RSC/Client boundary automatically

### Tree-Shaking Imports

Only import the modules used in each file:

```typescript
// Landing page: scroll reveals + stagger entrance
import { animate, stagger, onScroll, createScope } from 'animejs';

// Tool page: hover micro-interactions only
import { animate } from 'animejs';

// NEVER: import anime from 'animejs'
// ↑ This is the v3 default export — it does not exist in v4 and will throw
```

---

## Iconsax React 19 Fork: Integration Pattern

```tsx
// Import from iconsax-react-19, NOT iconsax-react
import { ArrowRight, Chart, SearchNormal, Shield } from 'iconsax-react-19';

// Always provide size and color — React 19 removed defaultProps
<ArrowRight size={20} color="currentColor" variant="Linear" />
<Chart size={24} color="var(--crowe-indigo-dark)" variant="Bold" />
<Shield size={32} color="var(--crowe-amber-core)" variant="TwoTone" />
```

**Coexistence with lucide-react:** Keep `lucide-react` installed throughout the icon pass. Remove it only after all icons have been audited and replaced. The two libraries do not conflict.

**Confidence note:** `iconsax-react-19` has low weekly download counts (the fix is recent). Before committing, verify the package is not deprecated and that the latest version renders correctly in the dev environment. Alternative if the fork is abandoned: explicitly pass `size={24} color="currentColor"` to every `iconsax-react` icon — this also fixes the React 19 issue on the original package at the cost of more boilerplate.

---

## React Bits: Integration Pattern

React Bits components install into `src/components/` as owned code. They include `'use client'` by default (they contain hooks and browser animations). Server Component page files can import them directly.

```tsx
// src/app/page.tsx — Server Component (landing page)
import { BlurText } from '@/components/BlurText';   // installed by shadcn CLI
import { TiltCard } from '@/components/TiltCard';

export default function LandingPage() {
  return (
    <main>
      <BlurText text="OFAC Sensitivity Testing" className="text-4xl font-bold" />
      <TiltCard>...</TiltCard>
    </main>
  );
}
```

Tailwind v4 compatibility: React Bits TS-TW components use Tailwind utility classes. Tailwind v4 reads CSS-native configuration — verify that any Crowe custom color tokens used inside React Bits components are defined in `@theme` (not just `:root`) to ensure utility class generation.

---

## 21st.dev: Integration Pattern

Workflow — no CLI:
1. Browse https://21st.dev/community/components (Hero, Buttons, Cards categories are most relevant)
2. Preview in browser — identify what requires adapting vs. what ships clean
3. Copy source code
4. Paste into `src/components/landing/` (create directory if it doesn't exist)
5. Replace all hardcoded hex colors with Crowe tokens (`var(--crowe-indigo-dark)`, `var(--crowe-amber-core)`, warm tint variables)
6. Add `'use client'` if the component uses `useState`, `useEffect`, or event handlers
7. Install any peer deps listed in import statements that are not already in `package.json`

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| animejs v4 | Framer Motion (full install) | If the project were React-only and gesture-heavy (drag, complex layout animations). Framer Motion is ~50KB and React-specific. Anime.js v4 is framework-agnostic and smaller for DOM animations. CLAUDE.md names anime.js as the preferred animation engine. |
| animejs v4 | GSAP | GSAP's ScrollTrigger plugin requires a paid commercial license. Anime.js v4's `onScroll` covers needed scroll-trigger use cases and is fully MIT. |
| iconsax-react-19 | Keep lucide-react (existing) | If the icon pass is explicitly descoped. Lucide is already installed, works on React 19, and is fine functionally. Iconsax is the CLAUDE.md-approved Crowe brand icon library. |
| iconsax-react-19 | react-icons | react-icons bundles many icon families and is heavier. Iconsax is purpose-specific and matches Crowe brand guidelines. |
| React Bits via shadcn CLI | Manual copy-paste of React Bits | Manual copy-paste is acceptable if the CLI fails (corporate TLS proxy). Remember `NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add ...` on Crowe network. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `iconsax-react` (original) | Confirmed React 19 breakage — icons do not render; `defaultProps` removed in React 19; package unmaintained 4+ years | `iconsax-react-19` |
| `framer-motion` as a top-level npm install | Duplicates animation responsibility with anime.js; adds ~50KB; two competing animation systems in one project | Anime.js v4 for all custom animations. React Bits components that need `motion` will install it per-component via the shadcn CLI. |
| `@react-spring/web`, `react-spring` | Not in CLAUDE.md approved library list; not needed given anime.js v4 | Anime.js v4 |
| Module-level animejs imports in Server Components | `window is not defined` error at build/SSR time | Always `'use client'` + `useEffect` wrapper |
| Next.js rewrites or redirects for the route split | Unnecessary complexity — the route split is a file structure change only | Move `app/page.tsx` → `app/tool/page.tsx`, create new landing `app/page.tsx` |
| Parallel routes (`@slot` folders) for the landing/tool split | Parallel routes solve simultaneous UI at one URL — wrong pattern for two distinct pages at two URLs | Standard `app/tool/page.tsx` subfolder pattern |
| `import anime from 'animejs'` | v3 default export — does not exist in v4; throws at runtime | Named imports: `import { animate, stagger, onScroll, createScope } from 'animejs'` |

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| animejs | ^4.3.6 | React 19, Next.js 16, Tailwind v4, Node 20 | No peer deps declared. DOM access requires `'use client'` + `useEffect`. |
| iconsax-react-19 | ^1.2.5 | React 19 | Fix for `defaultProps` removal. Always pass `size` and `color` explicitly. Verify not abandoned before committing. |
| React Bits TS-TW components | Latest via shadcn CLI | React 19, Tailwind v4, shadcn 3.8.5 | Owned code — no version lock. Per-component peer dep requirements vary; review CLI output after each add. |
| 21st.dev components | Copy-paste (no version) | Depends on component | Common dep: `framer-motion` (not yet installed), `clsx` (already installed). Assess per component. |

---

## Sources

- [animejs npm](https://www.npmjs.com/package/animejs) — version 4.3.6, last published 2026-02-15 (MEDIUM confidence — search result summary)
- [anime.js GitHub wiki: What's new in v4](https://github.com/juliangarnier/anime/wiki/What's-new-in-Anime.js-V4) — ES module architecture, `onScroll`, `stagger`, `createScope` confirmed (MEDIUM confidence)
- [anime.js GitHub releases](https://github.com/juliangarnier/anime/releases) — release cadence confirmed active (MEDIUM confidence)
- [iconsax-react GitHub issue #18](https://github.com/rendinjast/iconsax-react/issues/18) — React 19 `defaultProps` breakage confirmed on original package (HIGH confidence — official issue tracker)
- [iconsax-react-19 GitHub](https://github.com/MohamedRagheb/iconsax-react-19) — React 19 compatible fork, v1.2.5 (MEDIUM confidence — low download count, verify not abandoned)
- [react-bits GitHub](https://github.com/DavidHDev/react-bits) — shadcn CLI install pattern `@react-bits/<Component>-TS-TW` confirmed (HIGH confidence)
- [Next.js App Router — layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) — `app/tool/page.tsx` subfolder pattern for `/tool` route confirmed (HIGH confidence — official docs)
- Community consensus — anime.js SSR fix via `'use client'` + `useEffect` — confirmed across multiple Next.js SSR discussions (HIGH confidence)

---

*Stack research for: OFAC Sensitivity Testing v2.0 Production Face*
*Researched: 2026-03-05*
