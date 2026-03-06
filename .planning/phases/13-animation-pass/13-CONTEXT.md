# Phase 13: Animation Pass - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Anime.js v4 motion to the existing landing page and tool form. Four requirements:
- ANIM-01: Scroll-triggered reveal animations on landing page sections (How It Works, Stats, Features)
- ANIM-02: 4 parameter form cards at /tool stagger in on page load
- ANIM-03: Stats numbers count up when the stats section scrolls into view
- ANIM-04: CTA buttons show amber glow on hover; feature cards lift on hover

No new layout changes, no new sections, no new routes. This phase is motion-only on top of the existing UI.

</domain>

<decisions>
## Implementation Decisions

### Animation intensity
- Overall feel: **expressive + noticeable** — 600–800ms durations, 40–60px vertical offset
- Easing: **curve-based ease-out** (outQuint or outExpo) — smooth deceleration, no spring bounce
- Every animation uses the same easing curve for consistency

### Form card stagger (ANIM-02)
- 80ms delay between cards (as specified in roadmap)
- Plays **every page load** — no sessionStorage guard needed (page resets state on every navigation)
- Cards animate from y:40–60 to y:0 with opacity 0→1

### Hover glow — CTA button (ANIM-04)
- Use **Anime.js** (not CSS-only)
- Glow is a **continuous breathing loop** while hovered — box-shadow pulses in and out
- Loop stops and glow fades on mouse leave

### Card lift — How It Works cards (ANIM-04)
- Use **Anime.js on mouseenter/mouseleave** (not CSS transition)
- translateY(-4px to -6px) + shadow upgrade on enter, reverse on leave

### Scroll reveal variety (ANIM-01)
- **Differentiated per section** — each section has its own entrance style:
  - How It Works: 3 cards stagger in left-to-right (each delayed ~80–100ms)
  - Stats (By the Numbers): stat items pop in from y:40 individually with stagger
  - Hero: no scroll reveal — already in viewport on load
- Scroll trigger threshold: **section enters at 80% down the viewport**
- **Play once only** — elements stay revealed after first animation, do not replay on scroll-up

### Count-up animation (ANIM-03)
- Start: **from 0** (classic — most impactful for 285)
- Duration: **1.5–2 seconds**, ease-out expo (fast ramp, dramatic deceleration at end)
- Suffix/prefix: **visible throughout count** — display "~0ms" counting to "~53ms"; "0" to "285" with no suffix
- Targets the pre-wired `stat-number` className + `data-value` attribute in FeatureStatsSection

### Claude's Discretion
- Exact duration values within 600–800ms range for each animation
- Whether animation shell wrappers are per-section or a single page-level wrapper
- Anime.js `onScroll` callback API details (verify against installed v4.3.6)
- Exact box-shadow values for amber glow loop (within `rgba(245,168,0,0.xx)` range)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `stat-number` className + `data-value` attribute: Pre-wired in `FeatureStatsSection.tsx` — Anime.js count-up can target `.stat-number` and read `data-value` for the end value
- `tool/page.tsx`: Already a Client Component (`'use client'`) — form card stagger just needs a `useEffect` + `createScope` block; no wrapper needed
- `HeroSection.tsx`: CTA button has `hover:bg-crowe-amber-dark transition-colors duration-200` — the CSS color-swap can remain; Anime.js adds the glow on top
- `HowItWorksSection.tsx`: Cards have inline `boxShadow` style — Anime.js mouseenter can animate this property directly

### Established Patterns
- **Landing sections are Server Components** — Anime.js requires `'use client'` + `useEffect`. Pattern: create a thin `AnimationShell` Client Component wrapper that wraps the Server Component children; the shell runs animation logic while the section markup stays server-rendered
- **`createScope({ root: rootRef }) + revert()` on unmount** is mandatory — required by project decisions to avoid memory leaks and next build crashes
- **Never animate TanStack virtual rows** — `ResultsTable.tsx` uses TanStack Virtual which writes `translateY` to `<tr>` directly; do not touch it

### Integration Points
- `src/app/page.tsx` (landing) — wraps `HeroSection`, `HowItWorksSection`, `FeatureStatsSection`, `CroweBrandedFooter`; animation shells would be added here or as wrappers around individual sections
- `src/app/tool/page.tsx` — already Client Component; card stagger added via `useEffect` inside existing component
- `animejs` not yet installed — `NODE_TLS_REJECT_UNAUTHORIZED=0 npm install animejs` required on Crowe network

</code_context>

<specifics>
## Specific Ideas

- Stats count-up should feel like a performance benchmark reveal — fast ramp, dramatic slowdown at the final number
- Hover glow on CTA is the premium touch — it should feel like the button is alive/warm (amber breathing)
- How It Works card lift via Anime.js (not CSS) so it stays consistent with the overall animation system

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-animation-pass*
*Context gathered: 2026-03-06*
