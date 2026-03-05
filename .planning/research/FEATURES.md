# Feature Research

**Domain:** B2B Demo Tool — Production Face (v2.0 UI Layer over existing OFAC engine)
**Researched:** 2026-03-05
**Confidence:** HIGH on landing page and inline help patterns (well-established SaaS conventions); HIGH on animation API (official Anime.js v4 docs); MEDIUM on specific icon-style conventions (library docs are sparse on prescriptive guidance)

---

## Context: What Already Exists

v1.0 shipped with these features (do NOT re-research or re-build):
- Parameter form: 4 shadcn Cards (Entity Counts, Linguistic Regions, Degradation Rules, Client Name)
- Virtualized results table: TanStack Virtualizer, 6 columns, sortable Score column, catch-rate summary line
- CSV download: UTF-8 BOM, client name in filename
- Crowe brand: indigo/amber tokens in `@theme` block, shadcn themed, warm backgrounds
- Global layout: slim indigo header (`Crowe` wordmark + tool name), minimal indigo footer

Current gaps this milestone fills:
- No landing page — tool opens directly on the form (no context for first-time visitors)
- No inline explanations — form cards have only brief `CardDescription` text, no per-item guidance
- No results context — catch-rate line is a single sentence with no interpretation guidance
- No animations — static render, no scroll reveals, no stagger, no micro-interactions
- Icons: uses Lucide `Loader2` only — no systematic icon language across the form
- UI components: base shadcn only — no premium animated elements

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a production-facing Crowe tool must have. Missing these makes the tool look unfinished for an in-person consulting demo.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Landing page hero with clear headline and CTA | B2B SaaS standard; first-time visitors (clients) need immediate context before the form | LOW | Single page, scroll to form — no separate route needed. Headline must answer "what is this for?" in one line. |
| "How It Works" 3-step section | Compliance tools are unfamiliar to most clients; a visible process flow earns trust before asking them to interact | LOW | Steps: Configure, Run, Export. Icon + number + short label per step. |
| Features/value stats section | B2B landing pages use concrete metrics to build credibility; clients want to know scale | LOW | 4-6 stats: 285 SDN entries, 10 degradation rules, 4 entity types, 4 linguistic regions, sub-second processing. Real numbers from the existing engine. |
| Crowe-branded footer with disclaimer | Client-facing tools must disclaim synthetic data; footer anchors the page as an official Crowe asset | LOW | "For demonstration purposes only. Synthetic data only — no real sanctioned names." Already in layout.tsx but needs expansion. |
| Inline helper text on every form field/group | Forms with 10+ inputs require contextual guidance; users should not need to guess what a parameter does | MEDIUM | See inline help pattern section below. |
| Score interpretation legend near results | The Jaro-Winkler percentage means nothing to compliance officers without reference ranges | LOW | Color-coded legend: >=85% caught (teal), <85% missed (coral). Already color-coded in table — just needs a key. |
| Catch-rate summary as a prominent stat block | Single sentence is easy to miss; the catch rate IS the deliverable — it should command visual weight | LOW | Elevate from `text-sm text-muted-foreground` to a stat card above the table. |
| Scroll-to-form CTA | Hero section must link to the form; users should not have to scroll blind | LOW | Anchor link from hero button to `#configure` section. |

### Differentiators (Competitive Advantage)

Features that make this feel like a premium Crowe deliverable, not a generic internal tool.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Staggered card entrance animations | Form cards appearing in sequence creates a polished first impression; reinforces that inputs are sequential steps | LOW | Anime.js `stagger()` on scroll into view. 4 cards, 80ms delay between. |
| Scroll-triggered section reveals | Landing sections animate in as the user scrolls — standard premium SaaS pattern that signals quality | LOW | `onScroll` with `enter: 'bottom 85%'` threshold; `opacity + translateY` pattern. |
| Hover micro-interactions on form cards | Subtle lift on card hover signals interactivity and keeps the tool feeling alive during live demos | LOW | `translateY(-2px)` + shadow increase on hover; CSS transition preferred over Anime.js. |
| BlurText animated headline in hero | Character-by-character or word-by-word reveal on the hero headline creates immediate visual engagement | LOW | React Bits `BlurText` — install via `npx shadcn@latest add "https://reactbits.dev/registry/blur-text.json"` |
| CountUp animation on stats | Numbers counting up on scroll are a proven engagement pattern for metrics sections | LOW | React Bits `CountUp` or Anime.js `innerHTML` numeric interpolation on scroll enter. |
| Iconsax icons throughout form | Replacing generic Lucide icons with consistent Iconsax variants upgrades the visual language | LOW | `npm i iconsax-react`. See icon conventions section below. |
| SpotlightCard on "How It Works" steps | Subtle spotlight that follows cursor adds interactivity to an otherwise static section | LOW | React Bits `SpotlightCard` — minimal Framer Motion peer dep. |
| Inline expandable "Learn more" for degradation rules | Compliance consultants appreciate depth; rules like "phonetic variant" benefit from one-sentence explanation | MEDIUM | Shadcn `Tooltip` on an info icon adjacent to each rule checkbox. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Separate `/landing` route with redirect | Seems like cleaner architecture | Adds routing complexity for zero benefit — there is one app, one URL | Scroll-based single page: hero at top, form below, results below that |
| Video demo in hero | Modern SaaS uses product videos | Tool is interactive; playing a video of a form is less impressive than the form itself | Use animated stats + live CTA that scrolls to form |
| Animated background particles or aurora in hero | React Bits has Aurora/Particles — visually impressive | Distracts from professional compliance context; Crowe brand is warm, not flashy | Subtle indigo-wash background or soft dot pattern (bg-dots from CLAUDE.md) |
| Full modal for score interpretation | Feels comprehensive | Interrupts the table flow; clients want to stay in results context | Inline legend above or below the catch-rate stat block |
| Tooltip on every single element | "More help is better" impulse | Tooltip overload creates visual noise and accessibility issues on dense forms | Reserve tooltips for non-obvious fields; use static helper text for routine ones |
| Framer Motion AnimatePresence for results table rows | Seems like clean React animation | Virtual rows are absolutely positioned — AnimatePresence cannot track them; causes layout corruption | Use Anime.js stagger on container appearance only, NOT on virtual scroll rows |
| Custom scrollbar styling in results table | Aesthetic preference | Tailwind v4 + TanStack virtualizer: custom scrollbar CSS can conflict with overflow:auto container | Leave browser default scrollbar in the results table container |
| Page transition animations | Feels polished | There is only one page — no transitions to animate | Use scroll-triggered reveals instead |

---

## Pattern Details by Feature Area

### Landing Page

**Recommended structure (single scroll page, no new routes):**

```
[Slim indigo header — already exists in layout.tsx]
[1. Hero]          — Headline, subheadline, primary CTA (scrolls to form)
[2. How It Works]  — 3 numbered steps with icons
[3. Stats]         — 4-6 metric tiles with CountUp
[4. Form section]  — Existing 4 cards, id="configure"
[5. Results]       — Existing virtualized table (conditional on run)
[Indigo footer     — expand existing]
```

**Hero headline pattern (B2B consulting tool):** Lead with the outcome, not the mechanism.
- GOOD: "See how your screening system handles name obfuscation — before an exam does."
- BAD: "OFAC Sensitivity Testing Tool"
- Subheadline: 1-2 sentences describing what the tool does and for whom.

**CTA button:** Single primary action — "Configure Your Test" — using the existing amber button style. No secondary CTA needed; this is a demo tool, not a lead-gen page.

**Stats section — use real numbers from the existing engine (no made-up figures):**
- 285 synthetic SDN entries
- 10 degradation transformation rules
- 4 entity types (Individual, Business, Vessel, Aircraft)
- 4 linguistic regions (Arabic, Chinese, Russian, Latin)
- Sub-second processing (worst-case ~53ms per PROJECT.md)

### Inline Form Explanations

**Recommended pattern: Static helper text as default; tooltip for supplementary detail only.**

Research principle: If information is necessary for correct field use, it must be statically visible (inline text). Tooltips are for supplementary or optional context only — never for critical information users need to complete the task correctly.

**Applied to each form card:**

| Card | Pattern | Implementation |
|------|---------|----------------|
| Entity Counts | Static helper text under each input describing what that entity type means | Expand existing `CardDescription`; add per-input `<p className="text-xs text-muted-foreground">` |
| Linguistic Regions | Static description in CardDescription + tooltip per region label for a one-liner description | Shadcn `Tooltip` on each region label — region descriptions are supplementary |
| Degradation Rules | Tooltip icon (InfoCircle) per rule row, hover reveals 1-sentence description | Rules are non-obvious to compliance officers; tooltip on adjacent info icon (not on checkbox) |
| Client Name | Expand existing placeholder with a visible below-input note: "Used in the CSV filename and report header" | Style change only — make helper text visible, not placeholder-only |

**Rule descriptions (content for tooltip text):**
- Space Removal: "Removes spaces between name parts (AL QAEDA to ALQAEDA)"
- Char Substitution: "Replaces letters with look-alike characters (O to 0, I to 1)"
- Diacritics: "Adds or removes accent marks (Muller to Muller without umlaut)"
- Word Reorder: "Rearranges name components (Kim Jong Un to Jong Un Kim)"
- Abbreviation: "Shortens name parts using common abbreviations (Mohammed to Mhd)"
- Truncation: "Cuts names short at natural boundaries (Abdulrahman to Abdul)"
- Phonetic Variant: "Substitutes phonetically equivalent spellings (Osama to Usama)"
- Punctuation: "Adds or removes hyphens, periods, apostrophes (Al-Qaeda to Al Qaeda)"
- Prefix/Suffix: "Strips titles and generational suffixes (Mr. John Smith Jr. to John Smith)"
- Alias: "Substitutes common alternate forms of the same name"

### Results Context Panel

**Recommended pattern: Stat block above the table, legend inline.**

The current single-line catch-rate summary is rendered as `text-sm text-muted-foreground`. For a demo context, the catch rate is the headline result — it must command visual weight.

**Recommended structure above the table:**

```
[Left: Large number + "of Y degraded variants caught (Z%)"]
[Center: "At the 85% Jaro-Winkler match threshold"]
[Right: Download CSV button — existing]
[Full-width legend strip below: teal square = Caught, coral square = Missed]
```

Implementation: Elevate the existing `<p>` summary to a shadcn `Card` with `CardContent`. The large number + small label layout is the same visual pattern as the stats section — consistent language across the page.

**Do NOT add:**
- A sidebar panel (results are 1050px wide; sidebar requires layout restructuring of the virtualizer container)
- A modal with score interpretation (interrupts flow during live demo)
- Row-level expandable detail (virtual rows are absolutely positioned; expandable rows break the virtualizer)

### Animation Pass (Anime.js v4)

**Confirmed Anime.js v4 scroll API pattern:**

```javascript
import { animate, stagger, onScroll, createScope } from 'animejs';

// Scroll-triggered entrance — fires once when element enters viewport
onScroll({
  target: '.section-card',
  enter: 'bottom 85%',
  onEnterForward: () => {
    animate('.section-card', {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 600,
      delay: stagger(80),
      ease: 'outQuint'
    });
  }
});
```

**Specific animation assignments:**

| Element | Animation | Parameters | Notes |
|---------|-----------|------------|-------|
| Hero headline | BlurText (React Bits) | word-level, 120ms delay | Use React Bits component |
| Hero subheadline | opacity + translateY | delay 300ms after headline | Plain Anime.js |
| Stats tiles | CountUp (React Bits) | on scroll enter, stagger 100ms | Numbers count up: 0 to 285, 0 to 10, etc. |
| How It Works steps | opacity + translateY stagger | 3 items, 100ms between | Triggered by scroll enter |
| Form cards | opacity + translateY stagger on mount | 4 cards, 80ms between | On page load or scroll into view |
| Results stat block | opacity + scale(0.97 to 1) | on first render | Signals "new result available" |
| Run button hover | CSS transition (not Anime.js) | translateY(-1px) + amber glow | Already has hover class; keep as CSS |
| Card hover | CSS transition | translateY(-2px) + shadow increase | CLAUDE.md card pattern; use CSS not Anime.js |

**Critical constraint — results table:** Do NOT apply Anime.js stagger to virtual table rows. TanStack virtualizer creates and destroys DOM nodes as the user scrolls; targeting `.tr` elements will animate rows on every scroll tick, causing jank and visual glitches. Animate only the table wrapper container on first appearance.

**Scope cleanup pattern (required for React):**
```javascript
useEffect(() => {
  const scope = createScope({ root: containerRef }).add(() => {
    // all animations here
  });
  return () => scope.revert();
}, []);
```

### Icon Conventions (Iconsax)

**Installation:** `npm i iconsax-react`

**Style assignments:**

| Context | Iconsax Style | Reasoning |
|---------|--------------|-----------|
| Form card labels (Entity, Region, Rule, Client) | Linear | Neutral, thin — does not compete with label text |
| Info/tooltip trigger icons | Linear | Small, unobtrusive |
| CTA buttons (Run Test, Download CSV) | Bold | Filled icons read clearly on colored/outlined buttons |
| Navigation / header | Linear | Minimal; header is already indigo and busy |
| How It Works step icons | TwoTone | Large enough to carry visual weight; TwoTone works well with indigo+amber |
| Score indicator (caught/missed) | Bold | Replace Unicode checkmark/cross with TickCircle and CloseCircle |
| Loading state (Run Test pending) | Linear with CSS spin | Replace Lucide Loader2 with Iconsax Refresh or Loading2 |

**Specific icon mappings:**

| UI Element | Iconsax Icon | Style | Color Token |
|------------|-------------|-------|-------------|
| Entity count card header | People | Linear | currentColor |
| Linguistic regions card header | Global | Linear | currentColor |
| Degradation rules card header | Setting4 | Linear | currentColor |
| Client name card header | Building | Linear | currentColor |
| Info tooltip trigger | InfoCircle | Linear | --crowe-tint-500 |
| Download CSV button | DocumentDownload | Bold | currentColor |
| Caught row indicator | TickCircle | Bold | --crowe-teal |
| Missed row indicator | CloseCircle | Bold | --crowe-coral |
| Step 1 (Configure) | Setting2 | TwoTone | --crowe-indigo-dark primary |
| Step 2 (Run) | Play | TwoTone | --crowe-indigo-dark primary |
| Step 3 (Export) | Export | TwoTone | --crowe-indigo-dark primary |
| CTA arrow | ArrowRight | Bold | currentColor |

**Size conventions:** 20px for inline/label icons, 24px for standalone/button icons, 40-48px for How It Works step icons.

---

## Feature Dependencies

```
Landing page hero
    └──scrolls to──> Form section (id="configure")
                         └──depends on──> Existing form (already built in page.tsx)

Inline form explanations
    └──depends on──> Existing form card structure (already built)
    └──adds──> Shadcn Tooltip (already in shadcn init — unused in v1.0)
    └──adds──> InfoCircle icon (Iconsax — new dep)

Results context panel
    └──depends on──> Existing computeCatchRate() in resultsUtils.ts (already built)
    └──elevates──> Existing catch-rate summary line (style change only)
    └──adds──> Score legend (new static element, no new deps)

Animation pass
    └──depends on──> Anime.js v4 (confirm installed: check package.json)
    └──depends on──> React Bits (new dep — BlurText, CountUp, SpotlightCard)
    └──MUST NOT touch──> Virtual table rows (TanStack virtualizer constraint)

Icon pass
    └──depends on──> iconsax-react (new dep — npm i iconsax-react)
    └──replaces──> Lucide Loader2 in page.tsx (existing)
    └──replaces──> Unicode checkmark/cross in ResultsTable.tsx (existing)

Premium components (BlurText, CountUp, SpotlightCard)
    └──depends on──> React Bits (same dep as animation pass — install once)
    └──depends on──> Landing page section (hero and How It Works hosts)
    └──may require──> framer-motion as peer dep (check React Bits install output)
```

### Dependency Notes

- **Landing page requires no new routes:** The existing `page.tsx` is a single client component. The landing section is added above the form — same file or extracted into a `<LandingSection />` component rendered before the form cards.
- **Inline explanations have no new library deps:** Shadcn `Tooltip` and `TooltipProvider` are already available from v1.0 shadcn init — confirmed not yet used in the codebase.
- **Animation pass must happen after landing page exists:** Scroll-triggered animations on How It Works and stats sections require those DOM elements to exist first. Sequence: landing page markup first, then wire animations.
- **Icon pass is independent:** Can be done in any order relative to other features. No layout changes required.
- **React Bits is a new dep:** Install before starting animation pass or premium component work. Check if `framer-motion` is already present before installing; avoid duplicate installs.
- **Tailwind v4 note:** React Bits components use Tailwind class names. Confirm they resolve correctly against the existing `@theme` block — may need to verify class generation after install.

---

## MVP Definition (v2.0 scope — all features are confirmed in-scope for this milestone)

### Launch With (v2.0)

- [ ] Landing page — Hero with BlurText headline, How It Works (3 steps with SpotlightCard), Stats with CountUp, expanded footer
- [ ] Inline form explanations — static helper text per card + tooltips on degradation rule info icons
- [ ] Results context — elevated catch-rate stat block + score legend (teal/coral key)
- [ ] Animation pass — scroll reveals on landing sections, stagger on form cards, CountUp on stats
- [ ] Icon pass — Iconsax throughout per the mapping table above
- [ ] Premium components — BlurText (hero), SpotlightCard (steps), CountUp (stats)

### Explicit Deferrals (not in v2.0)

- [ ] Interactive threshold slider — requires state wiring to ResultsTable; too large for this milestone's UI focus
- [ ] Row-level drill-down in results table — virtual rows cannot expand; would require table architecture refactor
- [ ] Mobile responsive layout — desktop-first per PROJECT.md constraints
- [ ] PDF/print export — browser print-to-PDF is the established workaround

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Landing hero + CTA | HIGH — first impression for clients | LOW — static markup + BlurText | P1 |
| Inline rule tooltips + helper text | HIGH — rules are opaque without explanation | MEDIUM — 10 tooltip instances + content writing | P1 |
| Elevated catch-rate stat block | HIGH — the deliverable must be visually prominent | LOW — style elevation only | P1 |
| Score interpretation legend | HIGH — threshold is unexplained today | LOW — static color key | P1 |
| How It Works section | MEDIUM — helpful for first-time clients | LOW — 3 static step cards | P2 |
| Stats section with CountUp | MEDIUM — reinforces tool credibility with real numbers | LOW — React Bits CountUp | P2 |
| Scroll-reveal animations | MEDIUM — premium feel | LOW — Anime.js onScroll | P2 |
| Form card stagger on mount | MEDIUM — polished first impression | LOW — Anime.js stagger | P2 |
| Iconsax icon pass | MEDIUM — visual polish, not functional | LOW — drop-in replacements | P2 |
| SpotlightCard on steps | LOW — nice interactive detail | LOW — React Bits | P3 |
| Hover micro-interactions | LOW — subtle; CSS handles most of it | LOW — CSS transitions | P3 |

---

## Sources

- B2B landing page patterns: [High-Performing B2B SaaS Landing Page Best Practices](https://www.flow-agency.com/blog/b2b-saas-landing-page-best-practices/), [Top Landing Page Trends for B2B SaaS 2026](https://www.saashero.net/content/top-landing-page-design-trends/), [20 Best B2B SaaS Landing Page Examples 2025](https://www.caffeinemarketing.com/blog/20-best-b2b-saas-landing-page-examples)
- Inline help UX: [Help Text vs Tooltips — UX Movement](https://uxmovement.substack.com/p/help-text-vs-tooltips-which-is-better), [Contextual Help Patterns — Userpilot](https://userpilot.com/blog/contextual-help/), [Tooltip Best Practices — LogRocket](https://blog.logrocket.com/ux-design/designing-better-tooltips-improved-ux/)
- Results table UX: [Data Table UX Patterns — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables), [Data Tables: Four Major User Tasks — NNGroup](https://www.nngroup.com/articles/data-tables/)
- Anime.js v4 scroll API: [onScroll official docs](https://animejs.com/documentation/events/onscroll/), [onEnterForward callback](https://animejs.com/documentation/events/onscroll/scrollobserver-callbacks/onenterforward/), [ScrollObserver thresholds](https://animejs.com/documentation/events/onscroll/scrollobserver-thresholds/)
- React Bits: [reactbits.dev](https://reactbits.dev/), [GitHub DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)
- Iconsax: [iconsax-react.pages.dev](https://iconsax-react.pages.dev/), [iconsax.io](https://iconsax.io/)
- Social proof and stats section patterns: [Social Proof on Landing Pages — MailerLite](https://www.mailerlite.com/blog/social-proof-examples-for-landing-pages)

---

*Feature research for: OFAC Sensitivity Testing — v2.0 Production Face UI layer*
*Researched: 2026-03-05*
