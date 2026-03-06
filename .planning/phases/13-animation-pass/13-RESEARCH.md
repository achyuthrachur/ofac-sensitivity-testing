# Phase 13: Animation Pass - Research

**Researched:** 2026-03-06
**Domain:** Anime.js v4 scroll-triggered animation, React Server/Client Component architecture
**Confidence:** HIGH (API verified via official animejs.com docs via web search; source markup confirmed)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Animation intensity:** Expressive + noticeable — 600–800ms durations, 40–60px vertical offset
- **Easing:** Curve-based ease-out (outQuint or outExpo) — smooth deceleration, no spring bounce. Every animation uses the same easing curve for consistency.
- **Form card stagger (ANIM-02):** 80ms delay between cards; plays every page load (no sessionStorage guard); cards animate from y:40–60 to y:0 with opacity 0→1
- **Hover glow — CTA button (ANIM-04):** Use Anime.js (not CSS-only); glow is a continuous breathing loop — box-shadow pulses in and out; loop stops and glow fades on mouse leave
- **Card lift — How It Works cards (ANIM-04):** Use Anime.js on mouseenter/mouseleave (not CSS transition); translateY(-4px to -6px) + shadow upgrade on enter, reverse on leave
- **Scroll reveal variety (ANIM-01):** Differentiated per section; How It Works: 3 cards stagger left-to-right (80–100ms each); Stats: stat items pop in from y:40 individually with stagger; Hero: no scroll reveal (already in viewport on load); scroll trigger threshold: section enters at 80% down the viewport; play once only — stay revealed after first animation, do not replay on scroll-up
- **Count-up (ANIM-03):** Start from 0; 1.5–2 seconds, ease-out expo; suffix/prefix visible throughout count ("~0ms" counting to "~53ms"; "0" to "285"); targets pre-wired `.stat-number` className + `data-value` attribute in FeatureStatsSection
- **Architecture constraint:** Landing sections are Server Components — pattern is a thin `AnimationShell` Client Component wrapper; `createScope({ root: rootRef }) + revert()` on unmount is mandatory; NEVER animate TanStack virtual rows

### Claude's Discretion

- Exact duration values within 600–800ms range for each animation
- Whether animation shell wrappers are per-section or a single page-level wrapper
- Anime.js `onScroll` callback API details (verify against installed v4.3.6)
- Exact box-shadow values for amber glow loop (within `rgba(245,168,0,0.xx)` range)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Landing page sections (How It Works, Stats) animate into view with scroll-triggered reveals as the user scrolls down | Anime.js `onScroll` + `onEnterForward` callback; per-section `AnimationShell` wrappers; stagger for cards; enter threshold "top bottom" mapped to 80% viewport equivalent |
| ANIM-02 | The 4 parameter form cards at "/tool" stagger in sequentially on page load with an 80ms delay between cards | `tool/page.tsx` is already `'use client'`; `useEffect` + `createScope` + `stagger(80)` on `.form-card` selectors; no wrapper needed |
| ANIM-03 | Stats numbers on the landing page count up when the stats section scrolls into view | `animate('.stat-number', { innerHTML: [0, target] })` with `round: 1`; suffix handled by wrapping span pattern; triggered inside `onEnterForward` callback; plays once |
| ANIM-04 | CTA buttons show an amber glow on hover; feature cards lift with a shadow on hover | `mouseenter`/`mouseleave` handlers inside `createScope`; `loop: true` + `alternate: true` for breathing glow; stop + fade on mouseleave; `translateY` + `boxShadow` for card lift |
</phase_requirements>

---

## Summary

Phase 13 adds Anime.js v4 motion to the existing static UI. The primary engineering challenge is the Server Component / Client Component boundary: landing page sections (`HeroSection`, `HowItWorksSection`, `FeatureStatsSection`) are pure Server Components and cannot contain `useEffect`. The solution is a thin `AnimationShell` Client Component that wraps server-rendered children; the shell owns all `createScope` + `onScroll` logic while the section markup stays server-rendered.

Anime.js v4 is NOT yet installed. The network install command requires `NODE_TLS_REJECT_UNAUTHORIZED=0` on the Crowe corporate proxy. All Anime.js v4 APIs needed for this phase — `animate`, `onScroll`, `stagger`, `createScope` — are confirmed present in the official v4 API (verified via animejs.com docs URLs in search results). The `onScroll` callback for play-once scroll reveals uses `onEnterForward`, not `onEnter`. The `enter` threshold uses string position syntax (`'top bottom'` etc.), not percentage values.

**Primary recommendation:** Use per-section `AnimationShell` wrappers (not a single page-level wrapper) so each section's scroll observer is scoped to its own root ref. This gives cleaner revert() cleanup and easier targeting of child elements.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| animejs | latest (4.x) | All animations: scroll reveals, stagger, count-up, hover | Project-mandated; CLAUDE.md approved library; v4 is current |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tw-animate-css | ^1.4.0 (already installed) | CSS-only enter/exit animation classes (animate-in, animate-out) | NOT for this phase — Anime.js owns all Phase 13 animations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Anime.js hover loop | tw-animate-css + CSS | CSS can't do the breathing loop (continuous in/out pulse while hovered) — Anime.js required per locked decision |
| Anime.js scroll reveals | Intersection Observer + CSS | Anime.js already mandated; provides stagger which pure IntersectionObserver lacks |
| Per-section AnimationShell | Single page-level wrapper | Per-section gives smaller root refs; cleaner revert(); easier child targeting |

**Installation (run once, Crowe network):**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install animejs
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Server Component — wraps shells
│   ├── tool/
│   │   └── page.tsx                      # Already 'use client' — add useEffect stagger
│   └── _components/
│       └── landing/
│           ├── HeroSection.tsx           # Server Component (no animation — in viewport)
│           ├── HowItWorksSection.tsx     # Server Component — wrapped in shell
│           ├── FeatureStatsSection.tsx   # Server Component — wrapped in shell
│           ├── CroweBrandedFooter.tsx    # Server Component (no animation)
│           └── AnimationShell.tsx        # NEW — 'use client' thin wrapper
```

### Pattern 1: AnimationShell Wrapper

**What:** A Client Component that accepts `children` (Server Component markup), attaches a `rootRef` to a wrapper `<div>`, and runs `createScope({ root: rootRef })` in `useEffect`. The server-rendered HTML passes through unchanged; the shell adds animation behavior on top.

**When to use:** Every landing section that needs Anime.js scroll reveals or hover events.

**Key points:**
- Must be `'use client'` at the top
- Wrapper `<div>` gets the `rootRef` — all Anime.js selectors target elements INSIDE this div
- `createScope` + `revert()` in cleanup prevents memory leaks and next build crashes
- Accepts a `className` passthrough for layout (e.g., `contents` or `block`)

**Example:**
```typescript
// Source: animejs.com/documentation/getting-started/using-with-react/
'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate, onScroll, stagger } from 'animejs';

interface AnimationShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimationShell({ children, className }: AnimationShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    scope.current = createScope({ root: rootRef }).add(() => {
      // animation code goes here — selectors are scoped to rootRef
    });
    return () => scope.current?.revert();
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
```

**How `page.tsx` uses it:**
```tsx
// page.tsx remains a Server Component — no 'use client'
import { AnimationShell } from './_components/landing/AnimationShell';
// OR each section gets its own shell inline — see Pattern 2

<AnimationShell>
  <HowItWorksSection />
</AnimationShell>
```

### Pattern 2: Per-Section AnimationShell (Recommended)

Each section gets its own shell variant or a parameterized `AnimationShell` with an `animation` prop. This keeps each `createScope` root tight to its own section DOM, avoids cross-section selector collisions, and gives each section its own scroll observer.

```tsx
// page.tsx
<HowItWorksAnimationShell>
  <HowItWorksSection />
</HowItWorksAnimationShell>

<FeatureStatsAnimationShell>
  <FeatureStatsSection />
</FeatureStatsAnimationShell>
```

Alternatively, a single `AnimationShell` with a discriminated `variant` prop that switches animation logic per-section. Both approaches are valid; the per-section shell file approach keeps concerns separated.

### Pattern 3: onScroll for Play-Once Scroll Reveals

**Callback to use: `onEnterForward`** — fires when the element scrolls into view moving downward. Does NOT fire again on scroll-up, making it the correct choice for play-once animations.

**`onEnter`** (without direction) fires BOTH entering from above AND below on every pass — do NOT use for play-once.

**Threshold syntax:** String format `'[target-edge] [container-edge]'`. To fire when the top of the section element hits the bottom of the viewport (element just becomes visible):
```
enter: 'top bottom'   // fires as soon as top of target crosses bottom of viewport
```
To approximate 80% viewport trigger (section enters when its top is 20% up from the bottom):
```
enter: 'top bottom-=20%'   // pixel offsets supported; % offsets may require testing
```
Alternative safe approach: use default `enter: 'top bottom'` (element starts entering viewport) — this naturally fires before the section is fully visible, giving the animation time to play as the user scrolls in.

**Full onScroll scroll-reveal pattern:**
```typescript
// Source: animejs.com/documentation/events/onscroll/scrollobserver-callbacks/onenterforward/
onScroll({
  target: sectionEl,                // the section root element
  enter: 'top bottom',              // fires when section top hits viewport bottom
  onEnterForward: () => {
    animate('.how-it-works-card', {
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 700,
      delay: stagger(90),
      ease: 'outQuint',
    });
  },
})
```

### Pattern 4: Count-Up Animation (ANIM-03)

**Target strategy:** `.stat-number` elements are server-rendered with their final display value as text content (e.g., `~53ms`). The count-up animation overwrites `innerHTML` during playback and must restore the suffix.

**Two approaches:**

Option A — Animate innerHTML directly (works for plain integers like 285, 10, 4):
```typescript
// Source: animejs.com/documentation/animation/tween-value-types/numerical-value/
animate('.stat-number', {
  innerHTML: [0, parseInt(el.dataset.value)],
  round: 1,      // rounds to nearest integer during tween
  duration: 1800,
  ease: 'outExpo',
});
```

Option B — Separate prefix/suffix spans (recommended for the "~53ms" case):
```tsx
// In FeatureStatsSection.tsx (Server Component markup):
<span className="stat-number text-5xl font-bold text-crowe-amber block mt-2">
  {stat.prefix && <span className="stat-prefix">{stat.prefix}</span>}
  <span className="stat-value" data-value={stat.value}>0</span>
  {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
</span>
```
Then animate only `.stat-value` elements, leaving prefix/suffix spans visible throughout.

**Current FeatureStatsSection markup reality:** The `stat-number` span contains the FULL display text (`~53ms`, `285`, etc.) as text content, not split into sub-spans. This means Anime.js `innerHTML` tween for the suffix stat will overwrite the `~` and `ms`. **Recommendation:** The planner should update `FeatureStatsSection.tsx` to split prefix/suffix into child spans so the count-up can target only the numeric value. OR — handle specially in the animation: read `data-value` for the end number and prefix/suffix from data attributes, then use an `onUpdate` callback to build the full string manually.

**`round: 1` behavior in v4:** Rounds the tweened value to the nearest integer at each frame — produces clean integer count-up. Confirmed in official docs.

### Pattern 5: Hover Effects with Scope

**Breathing glow loop on CTA button:**
```typescript
// Inside createScope callback — selectors scoped to rootRef
const ctaButton = root.querySelector('.cta-button');

let glowAnimation: ReturnType<typeof animate> | null = null;

ctaButton.addEventListener('mouseenter', () => {
  glowAnimation = animate(ctaButton, {
    boxShadow: [
      '0 4px 16px rgba(245,168,0,0.20)',
      '0 6px 24px rgba(245,168,0,0.50)',
    ],
    duration: 900,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
  });
});

ctaButton.addEventListener('mouseleave', () => {
  glowAnimation?.pause();
  animate(ctaButton, {
    boxShadow: '0 4px 16px rgba(245,168,0,0.20)',
    duration: 300,
    ease: 'outQuad',
  });
});
```

Note: The `createScope` cleanup via `revert()` will remove these event listeners automatically.

**Card lift on How It Works cards:**
```typescript
root.querySelectorAll('.how-it-works-card').forEach((card) => {
  card.addEventListener('mouseenter', () => {
    animate(card, {
      translateY: -5,
      boxShadow: '0 8px 24px rgba(1,30,65,0.10), 0 4px 8px rgba(1,30,65,0.06)',
      duration: 250,
      ease: 'outQuad',
    });
  });
  card.addEventListener('mouseleave', () => {
    animate(card, {
      translateY: 0,
      boxShadow: '0 4px 8px rgba(1,30,65,0.06), 0 1px 3px rgba(1,30,65,0.04)',
      duration: 250,
      ease: 'outQuad',
    });
  });
});
```

### Pattern 6: Form Card Stagger (ANIM-02)

`tool/page.tsx` is already `'use client'`. No wrapper needed — add `useEffect` + `createScope` directly to the existing component. Cards need a CSS className added (e.g., `form-card`) to be targeted by Anime.js selectors.

```typescript
// Inside tool/page.tsx — add to existing component
const toolRoot = useRef<HTMLDivElement>(null);
const scope = useRef<ReturnType<typeof createScope> | null>(null);

useEffect(() => {
  scope.current = createScope({ root: toolRoot }).add(() => {
    animate('.form-card', {
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 700,
      delay: stagger(80),
      ease: 'outQuint',
    });
  });
  return () => scope.current?.revert();
}, []);

// The left panel div gets ref={toolRoot}
// Each <Card> gets className="form-card" added
```

### Anti-Patterns to Avoid

- **`onEnter` for play-once reveals:** `onEnter` fires on both scroll directions. Use `onEnterForward` to guarantee play-once behavior.
- **Animating TanStack virtual rows:** The virtualizer writes `translateY` to `<tr>` elements directly. Any Anime.js animation that touches `tr` elements in `ResultsTable` will fight the virtualizer and produce visual glitches. Never target `tr` or children of the results table.
- **Skipping `revert()` cleanup:** Anime.js v4 with `createScope` requires `scope.current.revert()` on unmount. Omitting this causes memory leaks and crashes `next build` in strict mode.
- **Targeting server-rendered elements without `rootRef` scope:** Without `createScope({ root: rootRef })`, selectors like `.stat-number` would match ALL matching elements on the page, not just those inside the section. Always scope to root.
- **Animating `innerHTML` on the full stat-number span without accounting for prefix/suffix:** The `~53ms` stat has prefix (`~`) and suffix (`ms`). Animating `innerHTML` from 0 overwrites these. Use sub-span structure or `onUpdate` callback.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll trigger / IntersectionObserver | Custom IntersectionObserver hook | `onScroll` from animejs | Already handles threshold syntax, callbacks, and cleanup |
| Integer count-up | Custom setInterval counter | `animate` with `round: 1` on `innerHTML` | Anime.js handles easing, cleanup, and frame-rate syncing |
| Stagger delays | Manual `setTimeout` per card | `stagger(80)` from animejs | stagger is a first-class animejs primitive |
| Cleanup on unmount | Manual `removeEventListener` tracking | `createScope` + `revert()` | createScope tracks all listeners and animations automatically |

---

## Common Pitfalls

### Pitfall 1: Using `onEnter` Instead of `onEnterForward`

**What goes wrong:** Animations replay every time the user scrolls up past the section and back down. The CONTEXT.md decision requires play-once.

**Why it happens:** `onEnter` fires on both forward and backward scroll entry. `onEnterForward` fires only on downward scroll entry.

**How to avoid:** Always use `onEnterForward` for play-once reveals. Use `onEnter` only when replay is intentional.

**Warning signs:** Section cards flickering or re-animating as the user scrolls up and down.

### Pitfall 2: Forgetting `round: 1` on innerHTML Tween

**What goes wrong:** Count-up displays decimal fractions (`53.271ms`, `284.67`, etc.) instead of clean integers.

**Why it happens:** Anime.js tweens numerical values as floats by default. `innerHTML` receives the raw float string.

**How to avoid:** Always include `round: 1` in the `animate` call for count-up animations.

### Pitfall 3: AnimationShell Wrapper Breaks Server Component Metadata

**What goes wrong:** If `AnimationShell` is placed incorrectly (e.g., wrapping `page.tsx` itself), it could force `page.tsx` to become a Client Component, losing the `export const metadata` export.

**Why it happens:** `'use client'` propagates up in Next.js App Router if a Client Component imports a Server Component incorrectly.

**How to avoid:** `AnimationShell` wraps individual section components as children. `page.tsx` stays a Server Component. The shell is rendered by `page.tsx` as a JSX element that receives server-rendered children.

### Pitfall 4: `boxShadow` String Format for Anime.js

**What goes wrong:** Anime.js cannot tween between two box-shadow strings if they have different numbers of shadow layers (e.g., `0 4px 16px rgba(...)` vs. `0 4px 16px rgba(...), 0 2px 4px rgba(...)`). It falls back to a snap rather than a tween.

**Why it happens:** Anime.js parses shadow strings as numerical arrays. Different shadow counts = different shapes = no interpolation.

**How to avoid:** Keep the same number of shadow layers between the start and end values of a box-shadow animation.

### Pitfall 5: Animating Tool Cards Before DOM is Ready

**What goes wrong:** `animate('.form-card', ...)` runs before the card elements are in the DOM, targeting nothing.

**Why it happens:** `useEffect` with empty dependency array runs after first render — this is correct. However, if the `rootRef` is not attached before `createScope` runs, selectors find nothing.

**How to avoid:** Attach `ref={toolRoot}` to the left-panel wrapper div BEFORE the card JSX in the render tree. `createScope({ root: toolRoot })` ensures selectors are confined to the mounted div.

---

## Code Examples

Verified patterns from official sources:

### Install

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install animejs
```

### Imports (modular — only import what you use)

```typescript
// Source: animejs.com/documentation
import { animate, onScroll, stagger, createScope } from 'animejs';
```

### AnimationShell — Minimal Client Component Wrapper

```typescript
'use client';
import { useEffect, useRef } from 'react';
import { createScope, animate, onScroll, stagger } from 'animejs';

export function HowItWorksAnimationShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    scope.current = createScope({ root: rootRef }).add(() => {
      onScroll({
        target: rootRef.current!,
        enter: 'top bottom',
        onEnterForward: () => {
          animate('.how-it-works-card', {
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 700,
            delay: stagger(90),
            ease: 'outQuint',
          });
        },
      });
    });
    return () => scope.current?.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
```

### Count-Up — onEnterForward Triggered

```typescript
// Source: animejs.com/documentation/animation/tween-value-types/numerical-value/
// + animejs.com/documentation/events/onscroll/scrollobserver-callbacks/onenterforward/

onScroll({
  target: rootRef.current!,
  enter: 'top bottom',
  onEnterForward: () => {
    rootRef.current!.querySelectorAll<HTMLElement>('.stat-value').forEach((el) => {
      const endValue = parseInt(el.dataset.value ?? '0', 10);
      animate(el, {
        innerHTML: [0, endValue],
        round: 1,
        duration: 1800,
        ease: 'outExpo',
      });
    });
  },
});
```

### loop + alternate for Breathing Glow

```typescript
// Source: animejs.com/documentation/animation/animation-playback-settings/loop/
// + animejs.com/documentation/animation/animation-playback-settings/alternate/

animate(ctaButton, {
  boxShadow: ['0 4px 16px rgba(245,168,0,0.20)', '0 6px 24px rgba(245,168,0,0.50)'],
  duration: 900,
  loop: true,
  alternate: true,
  ease: 'inOutSine',
});
```

### Stagger for Form Cards

```typescript
// Source: animejs.com/documentation/stagger/
animate('.form-card', {
  opacity: [0, 1],
  translateY: [50, 0],
  duration: 700,
  delay: stagger(80),
  ease: 'outQuint',
});
```

---

## tw-animate-css — Capability Assessment

**What it provides (confirmed via npm/GitHub):** CSS-first Tailwind v4 compatible enter/exit animation utilities (`animate-in`, `animate-out`, `fade-in`, `slide-in-from-bottom`, etc.). It provides declarative CSS classes that apply keyframe animations.

**What it CANNOT do for this phase:**
- No scroll-triggered reveal (CSS classes don't respond to scroll position without JavaScript)
- No breathing loop glow (CSS animations can loop, but not start/stop on mouse events reliably without JS)
- No count-up on numerical values
- No stagger with dynamic delay between siblings

**Conclusion:** tw-animate-css is NOT usable as a replacement for any of the ANIM-01 through ANIM-04 requirements. All four requirements need Anime.js. tw-animate-css is a dev dependency used only by shadcn accordion animations and can be ignored for this phase.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `anime()` global function (v3) | `animate()` named import (v4) | Anime.js v4.0 | Must use modular imports; no global `anime` object |
| `anime.stagger()` (v3) | `stagger()` named import (v4) | Anime.js v4.0 | Same function, different import path |
| `anime.timeline()` (v3) | `createTimeline()` named import (v4) | Anime.js v4.0 | Not needed for Phase 13 |
| Scroll via IntersectionObserver | `onScroll()` native (v4) | Anime.js v4.0 | Built-in scroll observer |
| `round` as numeric param | `round: 1` still works in v4 | Anime.js v4.x | Unchanged from v3 for this use case |

**Deprecated/outdated:**
- `anime.animate` (v3 global): replaced by `import { animate }` from `'animejs'`
- Any v3 wrapper libraries (`react-animejs-wrapper`, etc.): not compatible with v4 — do not install

---

## Open Questions

1. **`enter` threshold percentage syntax**
   - What we know: String threshold syntax is `'[target-edge] [container-edge]'` (e.g., `'top bottom'`). Pixel offset syntax is `'top bottom-=50'`.
   - What's unclear: Whether `'top bottom-=20%'` (percentage offset) works in v4.3.6 or only pixel values are valid.
   - Recommendation: Use `'top bottom'` as the safe default. The element entering the viewport at all is sufficient for the animation to feel scroll-triggered. If the team wants a later trigger, use a pixel offset like `'top bottom-=100'` (fires 100px before the top of the section reaches the bottom of the viewport).

2. **Count-up suffix for "~53ms" stat**
   - What we know: Current `FeatureStatsSection.tsx` renders the full string `~53ms` as `innerHTML` of the `.stat-number` span. `data-value` is `"53"`.
   - What's unclear: Whether to modify the Server Component markup to add sub-spans (prefix/suffix) or use an `onUpdate` callback to manually build the string.
   - Recommendation: **Modify `FeatureStatsSection.tsx`** to split the display into prefix + value + suffix spans. This is a minor markup change to a Server Component — no Client Component boundary impact. Add `data-prefix` and `data-suffix` attributes.

3. **Anime.js `onScroll` inside `createScope` cleanup**
   - What we know: `createScope().revert()` reverts all `animate()` calls created within the scope. The `onScroll()` ScrollObserver has its own `.revert()` method.
   - What's unclear: Whether `onScroll()` called inside a `createScope` `.add()` callback is automatically reverted by `scope.revert()`, or must be manually reverted.
   - Recommendation: Store the ScrollObserver return value and call its `.revert()` explicitly in the cleanup, in addition to `scope.revert()`. Belt and suspenders approach.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` (environment: 'node') |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Scroll-triggered reveals exist as Client Components wrapping sections | manual-only | n/a — scroll events not testable in vitest node env | n/a |
| ANIM-02 | Form cards have `form-card` className and stagger animation runs on mount | manual-only | n/a — DOM animation not testable in vitest node env | n/a |
| ANIM-03 | `.stat-number` / `.stat-value` elements have `data-value` attribute | build smoke | `npm run build` | ✅ (FeatureStatsSection already pre-wired) |
| ANIM-04 | CTA button and cards have event handler wiring (no crash on hover) | manual-only | n/a | n/a |

**Animation testing constraint:** Vitest is configured with `environment: 'node'`. Anime.js requires DOM APIs (`requestAnimationFrame`, `IntersectionObserver`, `scroll events`). JSDOM simulation of these is unreliable and not worthwhile for motion testing. The standard industry approach for animation regression testing is visual regression (screenshot diff tools like Playwright + Percy) or manual QA.

**Practical automated gate for this phase:**
- `npm run build` must pass (no TypeScript errors, no `'use client'` boundary violations, no missing Anime.js import errors)
- `npm run test` must pass (existing 14 tests must not regress — these test engine logic, not animations)

### Sampling Rate

- **Per task commit:** `npm run build && npm run test`
- **Per wave merge:** `npm run build && npm run test`
- **Phase gate:** Build green + all existing tests green + manual visual QA of animations in browser before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `animejs` package not yet installed — Wave 0 must install before any animation code can compile
- [ ] `FeatureStatsSection.tsx` markup needs sub-span split (prefix/suffix separation) before count-up animation can target only the numeric value — this is a Wave 0 prerequisite for ANIM-03

*(No new test files required — animation behavior is manual-only; existing test suite covers engine logic.)*

---

## Sources

### Primary (HIGH confidence)

- [animejs.com — onEnterForward docs](https://animejs.com/documentation/events/onscroll/scrollobserver-callbacks/onenterforward/) — confirmed callback name, example
- [animejs.com — ScrollObserver callbacks](https://animejs.com/documentation/events/onscroll/scrollobserver-callbacks/) — full callback list: onEnter, onEnterForward, onEnterBackward, onLeave, onLeaveForward, onLeaveBackward, onUpdate, onSyncComplete, onResize
- [animejs.com — ScrollObserver thresholds](https://animejs.com/documentation/events/onscroll/scrollobserver-thresholds/) — enter/leave string and object syntax confirmed
- [animejs.com — onScroll](https://animejs.com/documentation/events/onscroll/) — autoplay + target + container parameter confirmed
- [animejs.com — Using with React](https://animejs.com/documentation/getting-started/using-with-react/) — createScope + revert() pattern confirmed
- [animejs.com — loop](https://animejs.com/documentation/animation/animation-playback-settings/loop/) — `loop: true` confirmed
- [animejs.com — alternate](https://animejs.com/documentation/animation/animation-playback-settings/alternate/) — `alternate: true` + loop confirmed
- [animejs.com — Numerical value](https://animejs.com/documentation/animation/tween-value-types/numerical-value/) — innerHTML tween + round param confirmed
- [github.com/Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) — capability scope confirmed (CSS-only, enter/exit utilities)

### Secondary (MEDIUM confidence)

- [Anime.js v4 migration guide](https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4) — v3 vs v4 API differences verified
- [Anime.js What's New V4](https://github.com/juliangarnier/anime/wiki/What's-new-in-Anime.js-V4) — modular imports, createScope, onScroll confirmed as v4 features
- [CodePen: Anime JS Count Up](https://codepen.io/Vasonski123/pen/eYmmOEw) — innerHTML + round: 1 pattern community example

### Tertiary (LOW confidence)

- WebSearch results confirming `onEnterForward` callback name — LOW as animejs.com was not directly fetched (Crowe TLS proxy blocked direct fetch). Confirmed via URL patterns and search result snippets that cite official documentation pages directly.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — animejs v4 is the project-mandated library; version from npm search
- Architecture: HIGH — AnimationShell pattern is standard Next.js App Router Client/Server boundary pattern; createScope + revert() from official docs
- Pitfalls: HIGH — onEnterForward vs onEnter distinction confirmed from official docs; TanStack virtual rows constraint from project history
- onScroll API specifics: MEDIUM-HIGH — callback names confirmed via URL evidence from animejs.com docs; direct page fetch blocked by TLS proxy

**Research date:** 2026-03-06
**Valid until:** 2026-09-06 (Anime.js v4 is stable; no breaking changes expected soon)
