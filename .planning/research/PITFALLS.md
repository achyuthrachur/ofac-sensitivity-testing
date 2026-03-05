# Pitfalls Research

**Domain:** Adding landing page, animations, premium UI, and icon pass to an existing Next.js 15/16 App Router production app (OFAC Sensitivity Testing Tool — v2.0 Production Face)
**Researched:** 2026-03-05
**Confidence:** HIGH — stack confirmed via `package.json` + direct codebase inspection; pitfalls confirmed via official Anime.js v4 docs, Next.js App Router docs, shadcn GitHub issues, TanStack Virtual community discussions, Tailwind v4 migration guides.

> **Context:** v1.0 shipped. The tool at `/` works correctly. v2.0 adds a landing page, moves the tool to `/tool`, adds animations (Anime.js v4), replaces icons with Iconsax, and introduces React Bits / 21st.dev premium UI components. The constraint is: the existing app must not break.

---

## Critical Pitfalls

---

### Pitfall 1: Anime.js v4 Accessed During SSR — "window is not defined" Build Crash

**What goes wrong:**
Anime.js v4 is a browser-only animation engine. Any file that imports animejs at module level and then calls `animate()`, `onScroll()`, or `createScope()` — even indirectly — will throw `ReferenceError: window is not defined` during Next.js server rendering. This crashes `next build` or produces a 500 at runtime.

**Why it happens:**
Animejs v4 resolves selector targets against the live `document` on import in some environments. Even if the call is inside a function body, importing from animejs inside a Server Component (or any file without `'use client'`) pulls it into the SSR bundle where `window` and `document` do not exist.

**How to avoid:**
- Mark every file that imports animejs with `'use client'` at the top — no exceptions.
- Call `animate()`, `onScroll()`, and `createScope()` only inside `useEffect` — never at module level, never in the render function body.
- The canonical Anime.js v4 + React pattern (from official docs):
  ```
  const root = useRef(null);
  const scope = useRef(null);
  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      animate('.hero-element', { opacity: [0, 1], translateY: [30, 0], duration: 700 });
    });
    return () => scope.current?.revert();
  }, []);
  ```
- If the parent component cannot be a Client Component (e.g., the landing page root that needs to export `metadata`), wrap the animated section in a separate `'use client'` child component. The parent Server Component imports the child.

**Warning signs:**
- `next build` fails with `ReferenceError: window is not defined` or `document is not defined`
- Hydration mismatch warning in the browser console after first render
- Animation fires against server-rendered HTML producing a visible flash

**Phase to address:** Animation pass phase — enforce `'use client'` as the first step before adding any animations

---

### Pitfall 2: Anime.js v4 Scope Not Reverted on Unmount — Zombie Animations

**What goes wrong:**
If `scope.current.revert()` is not returned from `useEffect`, Anime.js timelines and scroll listeners continue running after the component unmounts. On the landing page → `/tool` route transition: hero animations may re-fire against stale DOM nodes, `onScroll()` listeners trigger against elements that no longer exist, and React Strict Mode (enabled in Next.js dev) double-invokes effects — making missing cleanup immediately visible as doubled or stuttering animations.

**Why it happens:**
Developers omit the cleanup return from `useEffect`, either by forgetting or by assuming Anime.js cleans itself up. It does not — `createScope` must have an explicit `revert()` call in the cleanup.

**How to avoid:**
```
useEffect(() => {
  scope.current = createScope({ root }).add(() => {
    animate(/* ... */);
  });
  return () => scope.current?.revert();  // mandatory
}, []);
```
For `onScroll()` instances: store the returned object and call `.revert()` on it in the cleanup.

**Warning signs:**
- Animation plays again after navigating away and back to the landing page
- Console errors about animating detached DOM nodes
- In dev mode (Strict Mode double-invocation): animation stutters or appears twice on mount

**Phase to address:** Animation pass phase — establish this pattern before writing any individual animations

---

### Pitfall 3: Moving "/" to "/tool" — Old Route Not Replaced, Two Copies of Tool Exist

**What goes wrong:**
The existing tool lives at `src/app/page.tsx` (route `/`). If a new `src/app/tool/page.tsx` is created but `src/app/page.tsx` is not replaced with the landing page, both routes show the tool. The landing page never appears at `/`.

**Why it happens:**
Developers create the new directory `src/app/tool/` and copy the tool there but forget to remove or replace the existing root `page.tsx`. The App Router serves whichever `page.tsx` is in the directory — the original at `/` takes precedence for the root route.

**How to avoid:**
Execute the route move in this exact order:
1. Create `src/app/tool/page.tsx` (move the tool component here).
2. Replace `src/app/page.tsx` with the new landing page component.
3. There is no step 3 — the existing `layout.tsx` wraps both routes automatically.
4. Do NOT add a redirect from `/` to `/tool` — the landing page IS the root now. A redirect would bypass the landing page entirely.

**Warning signs:**
- Visiting `/` shows the old tool form instead of the landing page hero
- Visiting `/tool` returns a 404
- Both `/` and `/tool` show the same tool UI simultaneously

**Phase to address:** Route restructuring (must be the very first structural change before any UI work begins)

---

### Pitfall 4: `'use client'` Page Cannot Export `metadata` — Hard Build Error

**What goes wrong:**
The existing `src/app/page.tsx` has `'use client'` at line 1. After moving the tool to `src/app/tool/page.tsx`, that file keeps `'use client'` because it uses `useState`, `useTransition`, and event handlers throughout. If a developer adds `export const metadata = { ... }` to the tool's Client Component file, Next.js throws a hard build error: `"metadata" is not supported in a Client Component`. The build does not complete.

**Why it happens:**
App Router enforces that `metadata` exports exist only in Server Components. This is not a warning — it is a build-time failure.

**How to avoid:**
Add a `src/app/tool/layout.tsx` that is a Server Component (no `'use client'`) and exports `metadata` for the tool route. The tool's `page.tsx` stays as a `'use client'` Client Component with zero metadata exports.

```
// src/app/tool/layout.tsx — Server Component, no 'use client'
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Run Test — OFAC Sensitivity Testing | Crowe',
  description: 'Configure and run synthetic OFAC name degradation tests.',
};
export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**Warning signs:**
- `next build` fails with: `"metadata" is not supported in a Client Component`
- TypeScript error if `Metadata` type is imported into a `'use client'` file

**Phase to address:** Route restructuring phase — resolve before any content work

---

### Pitfall 5: Landing Page Exports `metadata` Incorrectly — Root Layout Conflict

**What goes wrong:**
The root `layout.tsx` already exports a `metadata` object. If the new landing page `src/app/page.tsx` also exports a `metadata` object, the page-level metadata should override the layout-level. But if the developer puts the landing page `metadata` inside a `'use client'` component (because they added interactivity to the hero), the override fails silently and the root layout's generic metadata appears on the landing page.

**Why it happens:**
The new landing page starts as a Server Component, then the developer adds a `'use client'` animation component at the top level, accidentally converting the whole page to a Client Component and stripping the `metadata` export capability.

**How to avoid:**
The landing page (`src/app/page.tsx`) must remain a Server Component — it composes Client Component children (animated hero, feature section) but does not itself use hooks. Keep `export const metadata` in `src/app/page.tsx` with no `'use client'` directive.

**Warning signs:**
- Browser tab shows the root layout's title ("OFAC Sensitivity Testing — Crowe") on the landing page instead of landing-specific copy
- `<meta name="description">` shows tool description on landing page hero

**Phase to address:** Landing page phase

---

### Pitfall 6: React Bits / 21st.dev Components Using Tailwind v3 Syntax — Silent Visual Breakage in v4

**What goes wrong:**
React Bits and 21st.dev components are copy-paste code often written for Tailwind v3. In this project's Tailwind v4 setup, several v3 patterns no longer work:
- `bg-opacity-*` and `text-opacity-*` utilities are removed — replaced by slash syntax (`bg-white/50`)
- `border` defaults to `currentColor` in v4 instead of `gray-200` — elements with unspecified border color turn dark/black
- Custom colors not registered in the project's `@theme inline` block will not generate utility classes — a `bg-slate-900` class from a copied component may render transparent if the project does not define `slate` colors
- `tailwind.config.js` plugin references in copied component instructions do not apply (the project has no `tailwind.config.js`)

These failures are silent — no build error, just wrong visual output.

**Why it happens:**
Developers paste component code verbatim without auditing for v3-specific class patterns. The broken classes produce no error in the browser console.

**How to avoid:**
After pasting any React Bits or 21st.dev component:
1. Search for `bg-opacity-`, `text-opacity-`, `border-opacity-` — replace with slash syntax.
2. Search for any color class not in the project's Crowe color palette (`slate-*`, `gray-*`, `zinc-*`) — replace with project tokens (`crowe-tint-*`, `bg-page`, etc.).
3. Check any `border` class without an explicit color — add `border-border` or remove the border.
4. Run `next build` — CSS compilation surface issues there, not at dev runtime.
5. Visually inspect on the warm `#f8f9fc` page background (not pure white) where subtle color differences are visible.

**Warning signs:**
- Component background is transparent when it should be opaque
- Borders appear dark/black unexpectedly
- Colors from the component do not match what the component preview shows
- Component looks correct in isolation but wrong on the warm page background

**Phase to address:** Premium UI components phase — audit immediately after every paste, before committing

---

### Pitfall 7: React Bits / 21st.dev Animated Components Missing `'use client'` — Build Error

**What goes wrong:**
Animated components from React Bits (BlurText, TiltCard, Aurora, SpotlightCard) and 21st.dev heroes use `useEffect`, `useRef`, `useState`, or WebGL/canvas APIs. If the landing page (`src/app/page.tsx`) is correctly a Server Component and a React Bits component is imported directly without a `'use client'` wrapper, Next.js throws: "You're importing a component that needs ... a client environment. It only works in a Client Component but none of its parents are marked with 'use client'."

**Why it happens:**
The component file from React Bits does not include `'use client'` at the top — it is provided as raw code for the developer to place. Developers paste it into a Server Component context.

**How to avoid:**
Every animated component file must begin with `'use client'`. Structure:
- `src/app/page.tsx` — Server Component (exports `metadata`, no hooks)
- `src/components/landing/HeroSection.tsx` — `'use client'` — contains animated hero, CTA
- `src/components/landing/FeatureSection.tsx` — `'use client'` — contains TiltCards, stagger animations
- `src/components/landing/HowItWorks.tsx` — `'use client'` — contains scroll-reveal steps

The Server Component composes these Client Component islands. This is the correct App Router boundary pattern.

**Warning signs:**
- Build error: hooks used in Server Component context
- Developer adds `'use client'` to `src/app/page.tsx` to "fix" the error — this converts the entire tree to client, making `metadata` export impossible (creates Pitfall 5)

**Phase to address:** Landing page phase — establish the component boundary structure before any content

---

### Pitfall 8: `next/dynamic` with `ssr: false` Called Inside a Server Component — Hard Build Error

**What goes wrong:**
In Next.js App Router, calling `dynamic(() => import('./Component'), { ssr: false })` inside a Server Component throws a hard build error: "Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component." This is not a warning — the build fails.

**Why it happens:**
Developers used to Pages Router assume `dynamic({ ssr: false })` can be used anywhere to suppress SSR. In App Router, it must be called from inside a `'use client'` file.

**How to avoid:**
For any component that needs `ssr: false` (e.g., a WebGL or canvas-heavy animation background), create a Client Component wrapper:
```
// src/components/landing/ClientOnlyCanvas.tsx
'use client';
import dynamic from 'next/dynamic';
const CanvasBackground = dynamic(() => import('./CanvasBackground'), { ssr: false });
export { CanvasBackground };
```
Then import `CanvasBackground` from the wrapper in the Server Component parent.

For Anime.js specifically: because all animation code already lives in `'use client'` components inside `useEffect`, `ssr: false` is almost never needed. Reserve it only for libraries that cannot be imported on the server at all (WebGL, canvas-only renderers).

**Warning signs:**
- `next build` fails with the `ssr: false` Server Component error
- Developer wraps the layout or page in `'use client'` to escape the error — kills RSC and metadata

**Phase to address:** Landing page phase + Animation pass phase

---

### Pitfall 9: Iconsax SVG Size Forced to 16px Inside shadcn Buttons — `[&_svg]:size-4` Override

**What goes wrong:**
The shadcn Button component (`src/components/ui/button.tsx`) includes `[&_svg]:size-4` in its base Tailwind classes. This forces ALL SVG children inside a `<Button>` to `width: 1rem; height: 1rem` (16px) regardless of the `size` prop passed to the Iconsax component. Passing `size={24}` to an Iconsax icon inside a Button renders at 16px. Trying to override with `className="h-6 w-6"` on the icon fails because the Button's selector specificity wins.

This is a confirmed known issue in the shadcn GitHub issues tracker (issue #6316, discussion #6250), not an Iconsax-specific bug.

**Why it happens:**
shadcn hardcodes icon sizing on the Button for consistency with Lucide icons. Iconsax renders standard SVG elements, so it is affected by the same selector.

**How to avoid:**
Before starting the Iconsax icon pass, edit `src/components/ui/button.tsx` (the project-owned copy):
- Option A: Remove `[&_svg]:size-4` from the `buttonVariants` base class entirely and set explicit sizes per button.
- Option B: Change to `[&_svg]:size-auto` to remove the forced constraint while preserving the general pattern.
- Option C: Keep `[&_svg]:size-4` but override per-button: `<Button className="[&_svg]:size-5">`.

Option A is recommended — make the edit once before any icon replacement, then all buttons behave predictably.

**Warning signs:**
- All icons inside Buttons render at exactly 16px regardless of `size` prop
- `<Chart size={24} />` inside `<Button>` shows a 16px icon in DevTools
- Passing `className="h-6 w-6"` directly on the Iconsax component has no effect inside a Button

**Phase to address:** Iconsax icon pass phase — fix `button.tsx` before touching any icons

---

### Pitfall 10: Animating TanStack Virtual Rows with `translateY` — Virtualizer Transform Conflict

**What goes wrong:**
The existing `ResultsTable` positions each `<tr>` with `position: absolute; transform: translateY(${virtualRow.start}px)` — this is the virtualizer's mechanism for placing rows in the correct scroll position. If Anime.js (or Framer Motion) is used to animate individual rows with a `translateY` entrance (e.g., `translateY: [20, 0]`), the animation overwrites the virtualizer's positioning transform. Result: all animated rows collapse to `y=0`, stacking on top of each other and destroying the table layout.

A secondary issue: the virtualizer only renders the visible window of rows and unmounts/remounts rows on scroll. Any per-row enter/exit animation fires on every scroll event, producing constant jitter.

**Why it happens:**
Both the virtualizer and the animation library write `transform: translateY(Xpx)` to the same element's inline style. The last write wins, breaking positioning. This is a documented conflict with Framer Motion and generalizes to any animation library that writes transform properties.

Confirmed from TanStack Virtual GitHub discussions (discussion #476, #482) and community posts — this conflict exists with both Framer Motion and other animation libraries that set transforms on virtual row elements.

**How to avoid:**
- Never animate individual `<tr>` rows with `translateY`, `y`, `top`, or `transform` properties. The virtualizer owns the `transform` on those elements — do not touch it.
- Animate the container and wrapper elements instead:
  - Fade in the entire results section (`div.space-y-3`) on first appearance
  - Animate the summary statistics paragraph (catch rate text) with a count-up using Anime.js `innerHTML` animation
  - Animate the scroll container's shadow or border appearance
  - Animate the Download CSV button entrance
- For a subtle "rows appear" effect: animate `opacity` only on the `<tbody>` container — opacity does not conflict with the virtualizer's `transform` positioning.
- For score column color indicators: use CSS `transition: color 150ms ease` — zero conflict, minimal code.

**Warning signs:**
- After clicking "Run Test," the results table shows rows stacked at the top of the scroll container
- Rows appear at wrong positions during scrolling after animation fires
- Console error: animating a detached element (when virtualizer unmounts a row mid-animation)

**Phase to address:** Animation pass phase — establish the "no translateY on virtual rows" rule before writing any table animations

---

### Pitfall 11: Global Anime.js Selector Without Scope Root — Cross-Component Animation Leakage

**What goes wrong:**
`animate('.card', { opacity: [0, 1] })` without a scope root targets every element matching `.card` in the entire document. When both the landing page and the tool page are mounted during a soft navigation transition, the animation fires against cards on the wrong page. As more animated sections are added, global selectors become unpredictable.

**Why it happens:**
Developers write selectors based on what they see in the component template without scoping them to the component's DOM subtree. Works fine with one page; breaks with multiple pages or re-renders.

**How to avoid:**
Always use `createScope({ root })` where `root` is a `useRef` attached to the component's root element. All selectors inside the scope are resolved relative to `root`, not the document.

```
const root = useRef(null);
// ...
<div ref={root}>
  <div className="card">...</div>
</div>
```

The scope confines all animations to within `root`. Selectors outside `root` are never touched.

**Warning signs:**
- Cards on the tool page animate when the landing page mounts
- Adding a second animated section causes the first section's animations to fire again
- Animations fire for elements that are not visible or not in the current route

**Phase to address:** Animation pass phase — use scoped animations from the very first animation written

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline `style={{ opacity: 0 }}` as initial state for animations | Quick setup | Fights with Anime.js which also writes inline styles; double-apply causes flicker on mount | Never for animation targets — use CSS class with initial state instead |
| `suppressHydrationWarning` on animated elements | Silences hydration mismatch warnings | Masks real bugs; animated content may differ between server and client in meaningful ways | Only as last resort after confirming the mismatch is purely cosmetic (e.g., a timestamp) |
| Copy React Bits components without auditing Tailwind classes | Faster iteration | Silent style breakage in v4; wrong colors, broken opacity, dark borders | Never — always audit before commit |
| Global `animate('.card', ...)` without `createScope` root | Less boilerplate | Leaks across components; breaks with multiple pages or Strict Mode double-invocation | Never |
| Skip `revert()` in `useEffect` cleanup | Simpler code | Zombie animations; memory leaks; immediate failure in React Strict Mode | Never |
| Keep tool at `/` and add landing at `/landing` instead of restructuring | Avoids route move risk | No true landing page at the canonical URL; CTA links are confusing; brand impact diminished | Never for a Production Face milestone |
| Use `suppressHydrationWarning` instead of fixing SSR/client mismatch | Hides error immediately | Root cause remains; may manifest as real visual bugs on slower networks | Only temporarily during debugging, never shipped |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Anime.js v4 + Next.js App Router | Import animejs in a Server Component file | Only import in `'use client'` files; call animate only inside `useEffect` |
| Anime.js v4 + React component lifecycle | Omit `revert()` in `useEffect` cleanup | Every `createScope` has a matching `return () => scope.current?.revert()` |
| Anime.js v4 + TanStack Virtual rows | Apply `translateY` animation to `<tr>` elements | Animate container/wrapper only; never touch the transform that the virtualizer owns |
| Anime.js v4 + multiple pages | Use global class selectors without scope | Always use `createScope({ root })` with a ref attached to the component root |
| Iconsax + shadcn Button | Expect `size` prop to control icon size inside `<Button>` | Remove or override `[&_svg]:size-4` from `button.tsx` before the icon pass |
| React Bits + Tailwind v4 | Use v3 opacity utilities (`bg-opacity-*`) or undefined color names | Audit and replace with v4 slash syntax; use project Crowe color tokens |
| React Bits + App Router landing page | Place animated component directly in Server Component | Wrap in `'use client'` Client Component file; Server Component imports the wrapper |
| `dynamic({ ssr: false })` + App Router | Call from a Server Component file | Wrap in a `'use client'` file; call from there |
| App Router + Client Component page + `metadata` | Export `metadata` from a `'use client'` file | Add a co-located `layout.tsx` (Server Component) in the same route directory that exports the metadata |
| Crowe TLS proxy + `npm install` / `npx shadcn add` | Run without SSL bypass | Prefix all install commands with `NODE_TLS_REJECT_UNAUTHORIZED=0` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `onScroll()` without cleanup on landing page | Scroll listener accumulates on each soft navigation; CPU spikes on scroll after several route transitions | Store the `onScroll` return value; call `.revert()` in `useEffect` cleanup | Immediately visible with React Strict Mode; in production after several navigations |
| Per-row animation on virtual table rows | Anime.js fires on every scroll event as rows mount/unmount; continuous jitter during scroll | Attach animations to container mount only (empty `useEffect` dependency array); never to individual row lifecycle | Any table with > 50 visible rows during continuous scroll |
| Large React Bits background components (Aurora, particles) without GPU hint | Janky scroll on consultant laptops (which are mid-tier) | Add `will-change: transform` or `will-change: opacity` to animated canvas/div; test on integrated graphics | Demo context on corporate laptops — this is a real risk |
| Importing all of animejs at once | Marginal bundle increase | Minimal impact for this single-URL app; not worth optimizing | Not a practical concern at this project's scale |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Landing page CTA scrolls to form on same page instead of navigating to `/tool` | Browser back button broken; tool has no clean URL to share; consultant cannot bookmark the tool directly | CTA uses `<Link href="/tool">` — full route navigation |
| Scroll-triggered animations already played because user scrolled past them | User misses the "How It Works" reveal entirely | Use `viewport: { once: true }` equivalent in Anime.js `onScroll` — fire once when element first enters view |
| Iconsax icons in form labels without accessible text | Screen readers announce nothing for icon-only controls | Pair all icons with visible text labels OR explicit `aria-label`; the existing checkbox labels already have text — preserve this |
| Animated score column distracts during table review | User cannot read scores while colors are transitioning | Animate score appearance only on first load of a result set via CSS transition; do not re-animate on sort clicks |
| Hero entrance animation blocks CTA click during first second | User clicks CTA immediately on page load but the button is animating out of its click target area | Never animate the position of interactive elements; animate opacity/scale in-place only on CTAs |
| Landing page animations play immediately before user has scrolled | Entire page appears pre-animated; no sense of discovery | Trigger reveal animations with `onScroll` intersection, not on page mount |

---

## "Looks Done But Isn't" Checklist

- [ ] **Anime.js cleanup:** Every `createScope` has a corresponding `revert()` in the `useEffect` return — verify by navigating away and back; no double-animation in React Strict Mode dev
- [ ] **Route move complete:** Visit `/` — landing page hero loads, not the tool form. Visit `/tool` — tool form loads. Neither returns 404.
- [ ] **Metadata per route:** Inspect `<title>` in browser source on `/` and on `/tool` — they differ. The tool's title is NOT the landing page title.
- [ ] **Iconsax in buttons:** Open DevTools, inspect an Iconsax icon inside a `<Button>` — the rendered SVG `width` and `height` match the `size` prop, not a fixed 16px
- [ ] **Virtual table after animation:** After running a test, scroll the results table to the bottom — all rows are correctly positioned at their expected scroll offsets, none stacking at y=0
- [ ] **Tailwind v4 classes in copied components:** Run `next build` after pasting every React Bits component — no build errors. Visual inspection on warm off-white background confirms expected colors.
- [ ] **Landing page is a Server Component:** `src/app/page.tsx` has no `'use client'` at top. Animated children are imported Client Component files.
- [ ] **`prefers-reduced-motion` respected:** Toggle OS "Reduce Motion" setting; all Anime.js animations do not play; page remains fully usable
- [ ] **TLS-prefixed installs:** Every `npm install`, `npx shadcn add`, and `vercel` CLI call during development prefixed with `NODE_TLS_REJECT_UNAUTHORIZED=0` — no SSL errors on Crowe network
- [ ] **No redirect from `/` to `/tool`:** The landing page IS the root. Visiting `/` shows the landing page, not a redirect.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SSR crash from Anime.js in Server Component | LOW | Add `'use client'` to the offending file; move animate calls into `useEffect` |
| Zombie animations — missing `revert()` | LOW | Add `return () => scope.current?.revert()` to the `useEffect`; Strict Mode confirms fix |
| Route move left tool at `/` | LOW | Move `page.tsx` content to `app/tool/page.tsx`; replace root `page.tsx` with landing page |
| `metadata` on Client Component page | LOW | Add `src/app/tool/layout.tsx` (Server Component) exporting metadata; remove from `page.tsx` |
| Iconsax forced to 16px inside buttons | LOW | Edit `src/components/ui/button.tsx` — remove or override `[&_svg]:size-4`; one file, immediate fix |
| Tailwind v4 class breakage in copied component | MEDIUM | Audit all class names in the component; replace v3 patterns with v4 equivalents and Crowe tokens; may require redesigning element colors |
| Virtual table rows stacked at y=0 from animation | MEDIUM | Remove `translateY` from all row-level animation targets; scope animations to container wrapper; regression test by running 500-row test and scrolling |
| `ssr: false` called in Server Component | LOW | Extract `dynamic()` call into a `'use client'` wrapper file; Server Component imports from wrapper |
| Global Anime.js selector animating wrong elements | LOW-MEDIUM | Wrap all animate calls in `createScope({ root })` with ref; re-test each animation section |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Route move leaves tool at `/` | Route restructuring (Phase 1) | Visit `/` — hero loads. Visit `/tool` — form loads. |
| Client Component cannot export `metadata` | Route restructuring (Phase 1) | `next build` succeeds; `<title>` in browser source differs between routes |
| Landing page accidentally becomes Client Component | Landing page implementation | `src/app/page.tsx` has no `'use client'`; metadata exports work |
| Anime.js SSR crash | Animation pass (enforce `'use client'` first) | `next build` completes with no `window`/`document` errors |
| Anime.js zombie animations — missing revert | Animation pass (establish pattern before any animations) | Navigate away and back — no double animation in dev Strict Mode |
| `ssr: false` in Server Component | Animation pass + Landing page phase | `next build` succeeds without ssr:false error |
| React Bits Tailwind v4 class breakage | Premium UI phase (audit immediately after paste) | `next build` succeeds; visual inspection confirms correct colors on warm background |
| React Bits needs `'use client'` | Landing page phase + Premium UI phase | No build errors; no hooks-in-Server-Component errors |
| Iconsax size forced by Button | Iconsax pass phase (fix `button.tsx` first) | DevTools SVG width matches `size` prop inside `<Button>` |
| Virtual table animation destroys row positions | Animation pass (no-translateY-on-rows rule established first) | Run 500-row test; scroll table from top to bottom — all rows correctly positioned |
| Global Anime.js selector leaking across components | Animation pass (createScope pattern enforced from day 1) | Navigate between landing and tool; no cross-component animation leakage |

---

## Sources

- Anime.js v4 official — Using with React (createScope + useEffect + revert pattern): https://animejs.com/documentation/getting-started/using-with-react/
- Anime.js v4 official — `revert()` method: https://animejs.com/documentation/scope/scope-methods/revert/
- Next.js App Router — `permanentRedirect` and redirect docs: https://nextjs.org/docs/app/api-reference/functions/permanentRedirect
- Next.js App Router — `generateMetadata` and metadata per route: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js App Router — lazy loading and `ssr: false` constraint: https://nextjs.org/docs/app/guides/lazy-loading
- Next.js App Router — hydration error reference: https://nextjs.org/docs/messages/react-hydration-error
- shadcn/ui — Button SVG forced to size-4, icon resize impossible (confirmed issue): https://github.com/shadcn-ui/ui/issues/6316
- shadcn/ui — `[&_svg]:size-4` design decision discussion: https://github.com/shadcn-ui/ui/discussions/6250
- TanStack Virtual — `position:absolute` conflict with animation libraries: https://github.com/TanStack/virtual/discussions/476
- TanStack Virtual — animate virtual list discussion: https://github.com/TanStack/virtual/discussions/482
- TanStack Virtual + framer-motion transform conflict: https://www.answeroverflow.com/m/1277664625298768012
- Tailwind v4 arbitrary values and breaking changes: https://tailwindcss.com/docs/upgrade-guide
- Tailwind v4 `border` default changed from gray-200 to currentColor: Tailwind v4 changelog
- Codebase inspection — `src/components/ResultsTable.tsx` lines 149–151: `position: absolute; transform: translateY(${virtualRow.start}px)` confirmed on every `<tr>`
- Codebase inspection — `src/app/page.tsx` line 1: `'use client'` confirmed — tool is a Client Component
- Codebase inspection — `package.json`: `next: 16.1.6`, `tailwindcss: ^4`, `@tanstack/react-virtual: ^3.13.19`, no animejs (not yet installed)
- Codebase inspection — `src/app/globals.css`: Crowe tokens in `@theme inline` block confirmed; project-specific color approach documented

---
*Pitfalls research for: v2.0 Production Face — OFAC Sensitivity Testing Tool*
*Researched: 2026-03-05*
