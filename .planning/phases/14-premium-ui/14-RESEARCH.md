# Phase 14: Premium UI - Research

**Researched:** 2026-03-06
**Domain:** React Bits premium components (BlurText, TiltedCard, SpotlightCard) + Framer Motion / motion/react dependency integration with Next.js 16 + Tailwind v4
**Confidence:** HIGH — all three component source files fetched directly from GitHub; registry JSON files verified; motion dependency confirmed; existing AnimationShell patterns read from codebase

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**BlurText hero headline (UIPOL-01)**
- Reveal mode: word-by-word blur-to-sharp (not character or full-line)
- Timing: measured and deliberate — ~80–100ms stagger between words
- Target: `<h1>` in HeroSection.tsx — "Test your OFAC screening before your client does."
- Subtitle (`<p>`) also animates in — simple opacity fade (not BlurText) with a delay after the headline finishes
- Implementation: BlurText needs `'use client'` — wrap HeroSection in a Client Component shell or convert HeroSection to Client Component

**CTA button glow (UIPOL-03)**
- Treatment: always-on static ambient glow — button radiates amber box-shadow at rest, no hover required
- At rest: soft amber box-shadow (e.g. `0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)`)
- On hover: Phase 13 breathing loop amplifies the existing glow — the always-on base + hover intensification = layered effect
- Result: button is visually dominant at all times, not just on hover
- Update the `cta-button` Anime.js glow values in HeroAnimationShell to layer on top of a CSS base shadow

**TiltCard — stats section (UIPOL-02)**
- Apply to: Stats section only (FeatureStatsSection.tsx — "By the Numbers") — How It Works cards already have Phase 13 Anime.js hover lift, leave them unchanged
- Card surface: light card against dark indigo background (upgrade current `bg-white/10` to `bg-white/15` or `bg-white/20`)
- Tilt intensity: subtle professional — 5–10° max angle, gentle perspective. Not exaggerated
- FeatureStatsSection is a Server Component — TiltCard needs `'use client'` wrapper
- Interaction note: TiltCard wraps the existing card div including the count-up `.stat-value` spans — the Anime.js count-up from Phase 13 (FeatureStatsAnimationShell) must remain wired

**SpotlightCard — form cards (UIPOL-04)**
- Apply to: all 4 form cards in `tool/page.tsx` (Entity Counts, Linguistic Regions, Degradation Rules, Client Name)
- Spotlight area: full card — cursor-following radial gradient across the entire card surface
- Spotlight color: amber — `rgba(245,168,0,0.08)` — subtle warm amber follows cursor
- All form inputs, checkboxes, and labels remain fully interactive — spotlight is purely visual (pointer-events pass through)
- SpotlightCard wraps or replaces shadcn `<Card>` — existing `form-card` className and Phase 13 stagger must be preserved on the outermost wrapper

### Claude's Discretion
- Whether to install React Bits via shadcn CLI (`npx shadcn@latest add @react-bits/BlurText-TS-TW`) or copy component code directly
- Exact CSS box-shadow values for the always-on CTA ambient glow (within amber palette)
- How to preserve FeatureStatsAnimationShell count-up targeting after TiltCard wraps the stat card divs
- Whether HeroSection needs to convert to Client Component or use a wrapper shell for BlurText

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UIPOL-01 | BlurText animated hero headline entrance — word-by-word blur-to-sharp, ~80–100ms stagger, subtitle opacity-fades in after headline finishes | BlurText component source verified; `animateBy="words"`, `delay={90}`, `onAnimationComplete` callback confirmed; motion/react@^12.23.12 dependency required |
| UIPOL-02 | TiltCard hover depth effect on stats section cards — 5–10° max tilt, `bg-white/15` or `bg-white/20` card surface | TiltedCard source verified; `rotateAmplitude` prop controls angle; CRITICAL: TiltedCard is image-only component — must build a custom `StatTiltCard` from the tilt pattern instead |
| UIPOL-03 | Persistent amber glow treatment on primary CTA button — always-on base shadow + Phase 13 breathing amplification on hover | HeroAnimationShell.tsx read; always-on glow = CSS class on `.cta-button`; Anime.js hover loop update confirmed; no new library needed |
| UIPOL-04 | SpotlightCard cursor-following light on tool form cards — amber `rgba(245,168,0,0.08)`, full card, pointer-events pass-through, `form-card` className preserved | SpotlightCard source verified; zero dependencies; `spotlightColor` prop + `className` prop; outermost div renders → `form-card` goes on that div |
</phase_requirements>

---

## Summary

Phase 14 replaces four static elements with React Bits premium components. The research reveals one critical finding: **the stock React Bits `TiltedCard` is an image-display component and cannot be used as a general card wrapper for UIPOL-02**. It requires `imageSrc` and renders a `<figure>/<motion.img>` layout. The tilt animation pattern from that component (motion/react `useMotionValue` + `useSpring`) must be extracted into a custom `StatTiltCard` wrapper that accepts `children` instead of `imageSrc`. This is the single most important planning risk.

BlurText and SpotlightCard are both straightforward. BlurText has all required props (`animateBy="words"`, `delay`, `onAnimationComplete`) and simply needs `motion/react` installed. SpotlightCard has zero npm dependencies, renders a plain `<div>` as its outermost element (preserving `form-card` className), and accepts `spotlightColor` for amber tuning. Both are copy-paste components from the React Bits TS-TW variants.

The motion/react package (v12) is the modern successor to framer-motion. It is React 19 compatible and is what React Bits' registry JSON files declare as their dependency. Neither `motion` nor `framer-motion` is currently installed in the project — this is a new npm install.

**Primary recommendation:** Install `motion` (not `framer-motion`). Copy BlurText-TS-TW and SpotlightCard-TS-TW source verbatim. Build `StatTiltCard` as a custom `children`-accepting component using the tilt pattern from TiltedCard-TS-TW. Apply UIPOL-03 as a CSS `box-shadow` addition to the existing `.cta-button` element, then update the Anime.js hover loop to animate from the base shadow level.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion (motion/react) | ^12.23.12 | Powers BlurText motion.span and TiltedCard useMotionValue/useSpring | Required by React Bits registry; React 19 compatible; successor to framer-motion |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| animejs | ^4.3.6 (already installed) | Phase 13 glow loop update for UIPOL-03 | No new install — update existing HeroAnimationShell.tsx |
| React Bits (copy-paste) | n/a | BlurText-TS-TW, SpotlightCard-TS-TW source | Copy into `src/components/ui/` — not installed as npm package |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion/react | framer-motion | framer-motion is the legacy name; same package maintained by same team; motion is newer, leaner, fully compatible — use motion |
| Custom StatTiltCard | Stock TiltedCard | Stock TiltedCard is image-only; custom StatTiltCard copies only the mouseMove/spring logic and wraps arbitrary children — required |
| shadcn CLI install | Copy source directly | CLI would work but may fail on Crowe network (NODE_TLS_REJECT_UNAUTHORIZED=0 required); direct copy is safer and avoids registry connectivity issues during planning/implementation |

**Installation:**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install motion
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── ui/
│       ├── BlurText.tsx           # React Bits BlurText-TS-TW (copy verbatim)
│       ├── SpotlightCard.tsx      # React Bits SpotlightCard-TS-TW (copy verbatim)
│       └── StatTiltCard.tsx       # Custom children-accepting tilt wrapper (new)
└── app/
    └── _components/
        └── landing/
            ├── HeroSection.tsx                    # HeroSection stays Server Component
            ├── HeroAnimationShell.tsx             # UPDATE: add always-on base glow
            ├── FeatureStatsSection.tsx            # UPDATE: wrap cards with StatTiltCard
            └── FeatureStatsAnimationShell.tsx     # UNCHANGED — count-up wiring survives
```

---

### Pattern 1: BlurText Integration (UIPOL-01)

**What:** BlurText renders as a `<p>` element wrapping `motion.span` children. Each word gets its own spring animation driven by IntersectionObserver.

**When to use:** Hero headline only. Subtitle uses a plain opacity fade via CSS/Tailwind `animate-fade-in` or a minimal motion.div wrapper.

**Critical facts from source:**
- BlurText renders a `<p>` tag (not a `<span>` or `<div>`) — the existing `<h1>` in HeroSection.tsx must be replaced or the BlurText `<p>` must be styled to match `<h1>` with `className`
- `animateBy="words"` splits on space — the headline "Test your OFAC screening before your client does." = 9 words = 9 motion.span children
- `delay={90}` gives 90ms between words: word 9 starts at 810ms, total animation finishes at ~810ms + 350ms stepDuration = ~1160ms ≈ a 1.2s reveal
- `onAnimationComplete` fires after the last word finishes — use this to trigger subtitle fade
- IntersectionObserver threshold defaults to 0.1 — at the top of the page the hero is always in view on load, so animation fires immediately on mount
- Component uses `useEffect` + `useState` — **requires `'use client'`**
- BlurText uses `motion/react` internally — only import `motion/react` is needed (not animejs)

**Recommended wrapper approach:** Create `ClientHeroHeadline.tsx` as a thin `'use client'` component that renders only the `<h1>` content via BlurText + subtitle fade. HeroSection.tsx stays a Server Component. This matches the established AnimationShell pattern.

```tsx
// Source: DavidHDev/react-bits BlurText-TS-TW (verified from GitHub raw)
// src/app/_components/landing/ClientHeroHeadline.tsx
'use client';
import BlurText from '@/components/ui/BlurText';
import { motion } from 'motion/react';
import { useState } from 'react';

export function ClientHeroHeadline() {
  const [headlineDone, setHeadlineDone] = useState(false);

  return (
    <>
      <BlurText
        text="Test your OFAC screening before your client does."
        animateBy="words"
        delay={90}
        direction="top"
        stepDuration={0.35}
        onAnimationComplete={() => setHeadlineDone(true)}
        className="text-4xl md:text-5xl lg:text-6xl text-white font-bold max-w-3xl leading-tight mx-auto justify-center"
      />
      <motion.p
        className="text-lg text-white/80 mt-6 max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: headlineDone ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        A live sensitivity-testing tool that degrades real-world name variations against 285 synthetic
        SDN entries. No file prep. No waiting.
      </motion.p>
    </>
  );
}
```

---

### Pattern 2: StatTiltCard (custom — UIPOL-02)

**What:** The stock `TiltedCard` component from React Bits is image-only (renders `<figure>/<motion.img>`). It cannot wrap arbitrary card content. The tilt animation pattern must be extracted and adapted into a `StatTiltCard` that accepts `children`.

**The tilt pattern (from TiltedCard source):**
- Uses `useMotionValue(0)` for raw X/Y position
- Uses `useSpring(useMotionValue(0), { damping: 30, stiffness: 100, mass: 2 })` for smooth rotateX/rotateY
- `onMouseMove` maps cursor offset to rotation angle via `rotateAmplitude`
- `[perspective:800px]` CSS on container, `[transform-style:preserve-3d]` on inner div
- `rotateAmplitude` controls max degrees — use `7` for 5–10° professional subtlety

**Critical for FeatureStatsAnimationShell compatibility:** FeatureStatsAnimationShell uses `rootRef.current.querySelectorAll('.stat-value')` to target count-up spans. As long as StatTiltCard renders a standard `<div>` wrapper that does not change the DOM structure inside the card, the querySelector chain will continue to work. The existing `stat-value`, `stat-number` selectors are descendant selectors — they survive any number of wrapper div layers.

**Key:** StatTiltCard's outermost element must NOT have `overflow-hidden` — the 3D tilt needs to be visible at card edges.

```tsx
// Source: Pattern extracted from DavidHDev/react-bits TiltedCard-TS-TW
// src/components/ui/StatTiltCard.tsx
'use client';
import type { SpringOptions } from 'motion/react';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface StatTiltCardProps {
  children: React.ReactNode;
  className?: string;
  rotateAmplitude?: number;
}

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

export function StatTiltCard({ children, className = '', rotateAmplitude = 7 }: StatTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      className={`[perspective:800px] ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

**Usage in FeatureStatsSection.tsx:**
```tsx
// Wrap existing card div — replace:
<div key={stat.label} className="rounded-xl p-8 text-center bg-white/10">

// With:
<StatTiltCard key={stat.label} className="rounded-xl">
  <div className="p-8 text-center bg-white/15 rounded-xl [transform-style:preserve-3d]">
    {/* card content unchanged */}
  </div>
</StatTiltCard>
```

The `FeatureStatsAnimationShell` wraps the entire section with `rootRef`. Its `querySelectorAll('.stat-value')` will traverse through the new StatTiltCard wrapper divs — no changes needed to FeatureStatsAnimationShell.

---

### Pattern 3: SpotlightCard (UIPOL-04)

**What:** SpotlightCard is a `<div>` wrapper with zero npm dependencies. It tracks cursor position and renders a `pointer-events-none` radial gradient overlay.

**Source facts (verified):**
- Outermost element: `<div ref={divRef} ... className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}>`
- Accepts: `children`, `className` (string), `spotlightColor` (typed as `` `rgba(${number}, ${number}, ${number}, ${number})` ``)
- Spotlight overlay uses `pointer-events-none` — form inputs, checkboxes, and labels inside are fully interactive
- The gradient uses `transition-opacity duration-500` — smooth fade in/out on mouse enter/leave
- `isFocused` state: when a child element gains focus (e.g., clicking an input), the spotlight locks in place at current position until blur

**Critical:** The stock component has default styles `bg-neutral-900 border border-neutral-800 rounded-3xl p-8` baked into its className string. These must be overridden via the `className` prop — Tailwind utility classes in `className` will override the defaults IF they come later in the cascade (Tailwind v4 cascade order depends on specificity). The safest approach: override via the className prop AND strip the default styles from the copied component source.

**Integration with tool/page.tsx `form-card` className:**
The stock SpotlightCard renders its outermost `<div>` with `className={`relative ... ${className}`}`. Passing `className="form-card"` appends `form-card` to the div. The Phase 13 stagger (`animate('.form-card', ...)`) uses a CSS selector — it finds the first element matching `.form-card`, which will be SpotlightCard's outermost div. This is correct behavior.

The shadcn `<Card>` is replaced by SpotlightCard. `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` remain as children inside SpotlightCard.

```tsx
// Source: DavidHDev/react-bits SpotlightCard-TS-TW (verified)
// In tool/page.tsx — replace:
<Card className="form-card">
  <CardHeader>...</CardHeader>
  ...
</Card>

// With:
<SpotlightCard
  className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
  spotlightColor="rgba(245,168,0,0.08)"
>
  <CardHeader>...</CardHeader>
  ...
</SpotlightCard>
```

The SpotlightCard source must be modified to remove the hardcoded dark styles (`bg-neutral-900 border border-neutral-800`) from the className string — these conflict with the light Crowe card surface.

---

### Pattern 4: Always-On CTA Glow (UIPOL-03)

**What:** UIPOL-03 adds a CSS `box-shadow` to the `.cta-button` Link element at rest. The Phase 13 Anime.js hover loop in `HeroAnimationShell.tsx` currently animates from `rgba(245,168,0,0.00)` to `rgba(245,168,0,0.50)` — this must be updated to animate FROM the always-on base level TO an amplified level.

**No new library.** Pure CSS + update to existing Anime.js hover loop.

**Two-part implementation:**

1. Add CSS `box-shadow` to the `.cta-button` Link element in `HeroSection.tsx` (or via `className`):
```tsx
className="cta-button ... shadow-[0_0_20px_rgba(245,168,0,0.35),_0_4px_16px_rgba(245,168,0,0.25)]"
```

2. Update `HeroAnimationShell.tsx` hover loop to animate from base to amplified (not from zero):
```tsx
// mouseleave: restore to base glow (not to 0)
animate(ctaButton, {
  boxShadow: '0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)',
  duration: 300,
  ease: 'outQuad',
});

// mouseenter loop: animate FROM base TO amplified
glowAnimation = animate(ctaButton, {
  boxShadow: [
    '0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)',  // base
    '0 0 32px rgba(245,168,0,0.65), 0 6px 28px rgba(245,168,0,0.45)',  // amplified
  ],
  duration: 900,
  loop: true,
  alternate: true,
  ease: 'inOutSine',
});
```

**Layering concern:** Tailwind `shadow-lg` is already on the `.cta-button` Link. Anime.js `boxShadow` animation sets inline style `box-shadow`, which overrides Tailwind's class. This is the current Phase 13 behavior (already doing this). Adding the always-on base by replacing `shadow-lg` with the amber shadow value is correct.

---

### Anti-Patterns to Avoid

- **Using stock TiltedCard for stats section:** It renders `<figure>/<motion.img>` — will crash without `imageSrc` and cannot display card content. Use custom StatTiltCard.
- **Installing framer-motion instead of motion:** `framer-motion` is the legacy package name. The motion/react import path only works with the `motion` package. React Bits source files import from `'motion/react'` — install `motion`.
- **Adding `overflow-hidden` to StatTiltCard outer div:** Clips the 3D tilt effect at card edges. The inner card div can have `overflow-hidden` if needed, but the perspective container must not.
- **Forgetting `'use client'` on BlurText and StatTiltCard:** Both use React hooks (`useState`, `useEffect`, `useMotionValue`). Any file importing them must also be a Client Component or be wrapped in one.
- **Using shadcn CLI on Crowe network without NODE_TLS_REJECT_UNAUTHORIZED=0:** The Crowe SSL proxy will block the registry fetch. Either use the env var or copy source directly.
- **Hardcoding the word count in BlurText:** BlurText splits `text` on spaces internally — pass the raw string and let it split. Do not pre-split.
- **Applying SpotlightCard to TanStack virtual table rows:** The virtualizer writes `translateY` to `tr` children. SpotlightCard must stay in the left panel only. The `form-card` selector is scoped to `toolRoot` ref, which is the left panel div.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cursor-following spotlight gradient | Custom onMouseMove state component | SpotlightCard-TS-TW (copy) | Already handles focus/blur states, pointer-events-none overlay, opacity transition |
| Blur-to-sharp text entrance | Custom CSS keyframe animation | BlurText-TS-TW (copy) | IntersectionObserver wiring, multi-step keyframe building, onAnimationComplete callback already solved |
| Spring-based card tilt physics | CSS transform on mousemove | StatTiltCard with motion/react useSpring | Spring values (damping 30, stiffness 100) create natural deceleration that manual CSS cannot replicate |
| Ambient amber glow | Third-party glow library | CSS box-shadow value on className | Two CSS shadow layers achieve the effect in 0 dependencies |

---

## Common Pitfalls

### Pitfall 1: TiltedCard DOM structure breaks querySelector
**What goes wrong:** StatTiltCard wraps stat cards in extra `<div>` layers. Developer worries `.stat-value` querySelector will stop working.
**Why it happens:** `querySelectorAll` is a descendant selector — it traverses the full subtree. Extra wrapper divs do not break it.
**How to avoid:** Keep the `.stat-value` spans inside the card content. FeatureStatsAnimationShell's `rootRef.current.querySelectorAll('.stat-value')` traverses the entire section subtree and will find them regardless of wrapper depth.
**Warning signs:** If count-up stops after TiltCard wrapping, check that `FeatureStatsAnimationShell` still wraps the entire `<FeatureStatsSection />` in page.tsx. Do not remove or reorder the shell.

### Pitfall 2: motion/react SSR serialization warning
**What goes wrong:** Next.js may warn about `useMotionValue` or `useSpring` values being used in a Server Component context.
**Why it happens:** All React Bits components using motion/react require `'use client'`. If BlurText or StatTiltCard is imported into a Server Component directly (not through a shell), Next.js build fails.
**How to avoid:** BlurText must be in a `'use client'` file. `ClientHeroHeadline.tsx` shell isolates this. StatTiltCard has `'use client'` at top. SpotlightCard has no motion dependency — safe to import, but it uses `useState`/`useRef` so still requires `'use client'`.
**Warning signs:** `Error: Hooks can only be called inside of the body of a function component` during `next build`.

### Pitfall 3: SpotlightCard default dark styles conflict
**What goes wrong:** SpotlightCard renders with `bg-neutral-900 border border-neutral-800` from its hardcoded className string, making the card dark even though Crowe form cards are light.
**Why it happens:** The stock component embeds default dark styles directly in the JSX className string, not via CSS variables or props.
**How to avoid:** When copying SpotlightCard-TS-TW source, remove the hardcoded `bg-neutral-900 border border-neutral-800 rounded-3xl p-8` from the component's className string. The `${className}` interpolation at the end allows the caller to supply the correct surface class. Keep only `relative overflow-hidden ${className}`.
**Warning signs:** Form cards appear dark/opaque after SpotlightCard integration.

### Pitfall 4: BlurText renders as `<p>` not `<h1>`
**What goes wrong:** BlurText renders a `<p>` element. The existing HeroSection `<h1>` is replaced. Screen readers and SEO tools no longer see an `<h1>` on the page.
**Why it happens:** BlurText is hardcoded to render `<p ref={ref}>`. The tag is not configurable.
**How to avoid:** Two options: (a) Wrap BlurText in an `<h1>` in `ClientHeroHeadline.tsx` and set BlurText className to remove its default block display so it renders inline; or (b) copy the BlurText source and change `<p ref={ref}>` to accept a configurable `as` prop, defaulting to `p` but accepting `h1`. Option (b) is cleaner for semantic HTML. Recommended: add `as?: 'p' | 'h1'` prop to the copied BlurText.
**Warning signs:** Lighthouse accessibility audit flags "Page missing h1".

### Pitfall 5: Always-on glow fights Tailwind `shadow-lg`
**What goes wrong:** HeroSection.tsx currently has `shadow-lg` on `.cta-button`. Anime.js `boxShadow` sets inline style which overrides Tailwind. But if the developer adds the always-on amber glow only via Tailwind, Anime.js `mouseleave` handler resets `boxShadow` to `rgba(245,168,0,0.00)`, removing the Tailwind shadow.
**Why it happens:** Inline `style.boxShadow` takes precedence over class-based shadows. Once Anime.js touches `boxShadow`, the Tailwind shadow is effectively overridden for the element's lifetime.
**How to avoid:** Remove `shadow-lg` from the Link className. Express the entire box-shadow through Anime.js — both the always-on base (applied in the `useEffect` setup, not just on mouseleave) and the hover-amplified version. Set the base shadow on mount: `animate(ctaButton, { boxShadow: 'base-value', duration: 0 })` immediately when the effect runs.
**Warning signs:** CTA button loses its glow after the first mouseleave event.

---

## Code Examples

### BlurText-TS-TW Complete Source (verified)
```tsx
// Source: raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx
// Dependencies: motion@^12.23.12
import { motion, Transition, Easing } from 'motion/react';
import { useEffect, useRef, useState, useMemo } from 'react';

type BlurTextProps = {
  text?: string;
  delay?: number;           // ms between each word/letter, default 200
  className?: string;
  animateBy?: 'words' | 'letters';  // default 'words'
  direction?: 'top' | 'bottom';     // default 'top'
  threshold?: number;               // IntersectionObserver threshold, default 0.1
  rootMargin?: string;              // default '0px'
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void; // fires after LAST element completes
  stepDuration?: number;            // seconds per step, default 0.35
};
// Renders: <p ref={ref} className={`blur-text ${className} flex flex-wrap`}>
// Each element: <motion.span style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}>
```

### SpotlightCard-TS-TW Complete Source (verified — no dependencies)
```tsx
// Source: raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Components/SpotlightCard/SpotlightCard.tsx
// Dependencies: NONE
interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;  // default: 'rgba(255,255,255,0.25)'
}
// Renders: <div ref={divRef} onMouseMove onFocus onBlur onMouseEnter onMouseLeave className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}>
// Overlay:  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out" style={{ opacity, background: `radial-gradient(circle at Xpx Ypx, ${spotlightColor}, transparent 80%)` }} />
// NOTE: Remove hardcoded "bg-neutral-900 border border-neutral-800 rounded-3xl p-8" from the className string when copying
```

### StatTiltCard Pattern (from TiltedCard-TS-TW, adapted for children)
```tsx
// Source: Pattern from raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx
// Dependencies: motion@^12.23.12
import type { SpringOptions } from 'motion/react';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };
// rotateAmplitude={7} gives ~7° max tilt (5-10° range)
// Container needs [perspective:800px], inner needs [transform-style:preserve-3d]
```

### HeroAnimationShell.tsx Update Pattern (UIPOL-03)
```tsx
// Always-on base glow: set on mount immediately
const baseGlow = '0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)';
const amplifiedGlow1 = '0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)';
const amplifiedGlow2 = '0 0 32px rgba(245,168,0,0.65), 0 6px 28px rgba(245,168,0,0.45)';

// On mount:
animate(ctaButton, { boxShadow: baseGlow, duration: 0 });

// mouseleave: restore to base (not to 0)
animate(ctaButton, { boxShadow: baseGlow, duration: 300, ease: 'outQuad' });

// mouseenter loop: base -> amplified -> base (looping)
glowAnimation = animate(ctaButton, {
  boxShadow: [amplifiedGlow1, amplifiedGlow2],
  duration: 900, loop: true, alternate: true, ease: 'inOutSine',
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion package | motion package (motion/react import) | 2024 — Framer open-sourced Motion as standalone | framer-motion@11+ = thin re-export of motion; React Bits uses motion directly; install motion not framer-motion |
| React Bits shadcn CLI install | Copy source files + npm install motion | Phase 14 planning | CLI may work (with NODE_TLS_REJECT_UNAUTHORIZED=0) but copy-paste is reliable on Crowe network |

**Deprecated/outdated:**
- `framer-motion` package: superseded by `motion` — same maintainer, same API, `motion/react` import path is canonical going forward
- React Bits `npx shadcn@latest add @react-bits/BlurText-TS-TW`: still works but on Crowe network requires `NODE_TLS_REJECT_UNAUTHORIZED=0`; direct copy is equivalent

---

## Open Questions

1. **BlurText `<p>` tag vs semantic `<h1>`**
   - What we know: BlurText renders `<p>` hardcoded; cannot be configured via props
   - What's unclear: Whether adding an `as` prop to the copied source is preferred, or wrapping BlurText in a styled `<h1>` container
   - Recommendation: Add `as?: keyof JSX.IntrinsicElements` prop to the copied source and default it to `'p'`. Use `as="h1"` in ClientHeroHeadline to preserve semantic HTML. This is a one-line change to the copied source.

2. **motion/react + animejs coexistence**
   - What we know: motion/react (Framer Motion successor) and animejs are both animation libraries operating on DOM elements; they target different elements in this project (motion/react = BlurText spans + StatTiltCard; animejs = CTA glow, count-up, scroll reveals, form card stagger)
   - What's unclear: Whether they will conflict on the same element if both try to animate it simultaneously
   - Recommendation: Keep strict separation — motion/react animates only the headline words and stat card transforms; animejs animates only the CTA button glow and count-up numbers. No overlap. STATE.md noted this risk: "React Bits components may install framer-motion alongside Anime.js — review CLI output after each add to avoid duplicate animation libraries." Since we install `motion` (not `framer-motion`), there is no duplicate; they are different libraries.

3. **SpotlightCard `overflow-hidden` vs form inputs**
   - What we know: SpotlightCard has `overflow-hidden` in its className string; this clips content to the card boundary
   - What's unclear: Whether any form inputs (dropdown popovers, tooltips) need to overflow the card boundary
   - Recommendation: The form cards use basic `<Input>`, `<Checkbox>`, and `<Label>` — none of these produce overflow popovers. `overflow-hidden` is safe to keep. If needed, it can be removed in the copied source.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test` (runs `vitest run`) |
| Full suite command | `npm test` |
| Environment | node (not jsdom — no React component tests in current suite) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UIPOL-01 | BlurText component renders without error, `animateBy="words"` splits text | Build-time (TypeScript) | `npm run build` | ❌ Wave 0 |
| UIPOL-01 | `onAnimationComplete` prop accepted by BlurText type | TypeScript check | `npm run typecheck` (if configured) or `npm run build` | ❌ Wave 0 |
| UIPOL-02 | StatTiltCard renders children correctly, `rotateAmplitude` prop typed | Build-time (TypeScript) | `npm run build` | ❌ Wave 0 |
| UIPOL-02 | `.stat-value[data-value]` selectors still queryable inside TiltCard wrapper | Manual only | browser: verify count-up still fires | N/A — manual |
| UIPOL-03 | CTA button has box-shadow applied in DOM | Manual only | browser: inspect computed styles on `.cta-button` | N/A — manual |
| UIPOL-03 | Hover loop does not reset to transparent on mouseleave | Manual only | browser: hover and unhover CTA button | N/A — manual |
| UIPOL-04 | SpotlightCard `form-card` className on outermost div | Build-time + manual | `npm run build` (TypeScript pass) + browser: inspect DOM | ❌ Wave 0 |
| UIPOL-04 | form inputs inside SpotlightCard remain interactive | Manual only | browser: type in inputs, check checkboxes | N/A — manual |

### Automated Validation Summary
The existing Vitest suite runs in `node` environment with no jsdom — no React component unit tests exist. Phase 14 validation is therefore **primarily build-time (TypeScript clean + next build) plus manual browser verification**. The current test suite (rule engine, sampler, integration, form utils) is unaffected by Phase 14 changes and must continue passing.

**Automated checks (fast):**
- `npm test` — existing 14 test files must remain green (no regressions from new components)
- `npm run build` — TypeScript clean + Next.js build must pass (validates all imports, prop types)

**Manual checks (browser required):**
- BlurText: word-by-word blur-to-sharp plays on page load; subtitle fades in after headline finishes
- TiltCard: stats cards tilt 5–10° on hover; count-up still runs when section scrolls into view
- SpotlightCard: amber cursor glow follows mouse across all 4 form cards; inputs/checkboxes clickable
- CTA glow: amber box-shadow visible at rest (no hover); intensifies on hover; restores to base on mouseleave

### Sampling Rate
- **Per task commit:** `npm test` (ensures rule engine/integration tests unchanged)
- **Per wave merge:** `npm run build` (TypeScript + Next.js build)
- **Phase gate:** `npm run build` passes green + all 4 manual browser checks pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/ui/BlurText.tsx` — new file, Wave 0 creates it
- [ ] `src/components/ui/SpotlightCard.tsx` — new file, Wave 0 creates it
- [ ] `src/components/ui/StatTiltCard.tsx` — new file, Wave 0 creates it
- [ ] `src/app/_components/landing/ClientHeroHeadline.tsx` — new file, Wave 0 creates it
- [ ] `npm install motion` — new dependency, Wave 0 installs it

---

## Sources

### Primary (HIGH confidence)
- `raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx` — full BlurText source, fetched directly
- `raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Components/SpotlightCard/SpotlightCard.tsx` — full SpotlightCard source, fetched directly
- `raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Components/TiltedCard/TiltedCard.tsx` — full TiltedCard source, fetched directly
- `raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/BlurText-TS-TW.json` — registry JSON confirming `motion@^12.23.12` dependency
- `raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/SpotlightCard-TS-TW.json` — registry JSON confirming zero npm dependencies
- `raw.githubusercontent.com/DavidHDev/react-bits/main/public/r/TiltedCard-TS-TW.json` — registry JSON confirming `motion@^12.23.12` dependency
- `src/app/_components/landing/HeroSection.tsx` — existing `<h1>`, `cta-button` className, current Link structure (read directly)
- `src/app/_components/landing/FeatureStatsSection.tsx` — existing card div structure, `.stat-value[data-value]` spans (read directly)
- `src/app/_components/landing/HeroAnimationShell.tsx` — Phase 13 hover glow loop (read directly)
- `src/app/_components/landing/FeatureStatsAnimationShell.tsx` — count-up querySelector pattern (read directly)
- `src/app/tool/page.tsx` — 4 shadcn `<Card className="form-card">` pattern, Phase 13 stagger scope (read directly)

### Secondary (MEDIUM confidence)
- WebSearch: React Bits BlurText props — confirmed `animateBy`, `delay`, `direction`, `onAnimationComplete`, `stepDuration` props (corroborated by source fetch)
- WebSearch: motion vs framer-motion — confirmed motion is successor package, React 19 compatible, same maintainer
- `motion.dev/docs/react-upgrade-guide` — confirms `motion` package replaces `framer-motion`, import from `motion/react`

### Tertiary (LOW confidence)
- None — all critical claims verified by primary sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — motion dependency confirmed via registry JSON; no speculation
- BlurText API: HIGH — full source fetched from GitHub
- SpotlightCard API: HIGH — full source fetched from GitHub; zero dependency confirmed
- TiltedCard / StatTiltCard: HIGH (for source pattern) — stock component is image-only (confirmed); custom StatTiltCard pattern derived from verified source
- UIPOL-03 glow approach: HIGH — HeroAnimationShell.tsx read directly; approach is CSS + Anime.js update only
- Architecture (ClientHeroHeadline shell): HIGH — follows established Phase 13 AnimationShell pattern
- Pitfalls: HIGH — all derived from reading actual source code, not speculation

**Research date:** 2026-03-06
**Valid until:** 2026-04-05 (React Bits components are stable copy-paste; motion library is stable; 30-day window)
