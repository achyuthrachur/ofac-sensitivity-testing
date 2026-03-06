# Phase 14: Premium UI - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace static landing/form elements with React Bits premium components:
- UIPOL-01: BlurText animated hero headline entrance
- UIPOL-02: TiltCard hover depth effect on stats/features section cards
- UIPOL-03: Persistent amber glow treatment on primary CTA button
- UIPOL-04: SpotlightCard cursor-following light on tool form cards

No new sections, no new routes, no copy changes. This phase is visual component upgrades only.

</domain>

<decisions>
## Implementation Decisions

### BlurText hero headline (UIPOL-01)
- Reveal mode: **word-by-word** blur-to-sharp (not character or full-line)
- Timing: **measured and deliberate** — ~80–100ms stagger between words
- Target: `<h1>` in HeroSection.tsx — "Test your OFAC screening before your client does."
- Subtitle (`<p>`) also animates in — simple **opacity fade** (not BlurText) with a delay after the headline finishes
- Implementation: BlurText needs `'use client'` — wrap HeroSection in a Client Component shell or convert HeroSection to Client Component

### CTA button glow (UIPOL-03)
- Treatment: **always-on static ambient glow** — button radiates amber box-shadow at rest, no hover required
- At rest: soft amber box-shadow (e.g. `0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)`)
- On hover: Phase 13 breathing loop **amplifies** the existing glow — the always-on base + hover intensification = layered effect
- Result: button is visually dominant at all times, not just on hover
- Update the `cta-button` Anime.js glow values in HeroAnimationShell to layer on top of a CSS base shadow

### TiltCard — stats section (UIPOL-02)
- Apply to: **Stats section only** (`FeatureStatsSection.tsx` — "By the Numbers") — How It Works cards already have Phase 13 Anime.js hover lift, leave them unchanged
- Card surface: **light card** against dark indigo background (upgrade current `bg-white/10` to a more opaque white, e.g. `bg-white/15` or `bg-white/20` so the tilt effect reads well)
- Tilt intensity: **subtle professional** — 5–10° max angle, gentle perspective. Not exaggerated
- FeatureStatsSection is a Server Component — TiltCard needs `'use client'` wrapper
- **Interaction note:** TiltCard wraps the existing card div including the count-up `.stat-value` spans — the Anime.js count-up from Phase 13 (FeatureStatsAnimationShell) must remain wired

### SpotlightCard — form cards (UIPOL-04)
- Apply to: all 4 form cards in `tool/page.tsx` (Entity Counts, Linguistic Regions, Degradation Rules, Client Name)
- Spotlight area: **full card** — cursor-following radial gradient across the entire card surface
- Spotlight color: **amber** — `rgba(245,168,0,0.08)` — subtle warm amber follows cursor
- All form inputs, checkboxes, and labels remain fully interactive — spotlight is purely visual (pointer-events pass through)
- SpotlightCard wraps or replaces shadcn `<Card>` — existing `form-card` className and Phase 13 stagger must be preserved on the outermost wrapper

### Claude's Discretion
- Whether to install React Bits via shadcn CLI (`npx shadcn@latest add @react-bits/BlurText-TS-TW`) or copy component code directly
- Exact CSS box-shadow values for the always-on CTA ambient glow (within amber palette)
- How to preserve FeatureStatsAnimationShell count-up targeting after TiltCard wraps the stat card divs
- Whether HeroSection needs to convert to Client Component or use a wrapper shell for BlurText

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HeroSection.tsx` (Server Component) — `<h1>` is a plain static string; `cta-button` className already on CTA Link for Phase 13 glow targeting
- `FeatureStatsSection.tsx` (Server Component) — cards are `<div className="rounded-xl p-8 bg-white/10">`; `.stat-value[data-value]` sub-spans wired for count-up
- `tool/page.tsx` (Client Component) — 4 shadcn `<Card className="form-card">` — `form-card` className required by Phase 13 stagger animation
- `HeroAnimationShell.tsx` — Client Component shell from Phase 13 — currently holds the breathing glow loop; will need update for always-on base glow
- `FeatureStatsAnimationShell.tsx` — Client Component shell — holds count-up targeting `.stat-value[data-value]`; must survive TiltCard wrapping

### Established Patterns
- Phase 13 AnimationShell pattern: thin `'use client'` wrapper around Server Component children using `createScope({ root: rootRef }) + revert()` on unmount
- `NODE_TLS_REJECT_UNAUTHORIZED=0` required for all npm installs on Crowe network
- Landing sections are Server Components — any React Bits component requiring `'use client'` follows AnimationShell wrapper pattern
- TanStack virtual rows must NOT be targeted — `ResultsTable.tsx` in right panel of tool/page.tsx is off-limits

### Integration Points
- `src/app/page.tsx` (landing) — wraps HeroSection, HowItWorksSection, FeatureStatsSection, CroweBrandedFooter — BlurText + TiltCard wiring goes here or in section files
- `src/app/tool/page.tsx` — SpotlightCard replaces/wraps the 4 shadcn Card components; `form-card` className must stay on outermost wrapper
- `src/app/_components/landing/HeroAnimationShell.tsx` — update glow base values for always-on treatment
- `src/app/_components/landing/FeatureStatsAnimationShell.tsx` — must remain wired after TiltCard wraps stat card divs

</code_context>

<specifics>
## Specific Ideas

- BlurText reveal should feel like the headline is confidently forming — not rushed, not slow. A measured reveal that has gravitas
- The CTA glow at rest should make the button feel warm and unmissable against the dark hero background — like a lit button in a dark room
- TiltCard on stats: the depth effect should make each stat feel like a physical tile you could pick up — premium data presentation
- SpotlightCard: the amber cursor glow should feel like a desk lamp following your hand — subtle warmth, not a disco effect

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-premium-ui*
*Context gathered: 2026-03-06*
