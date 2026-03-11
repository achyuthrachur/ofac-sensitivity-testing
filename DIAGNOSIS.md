# DIAGNOSIS

## 1. DEAD OR UNUSED PACKAGES

Packages with zero import statements anywhere in `src/`:

| Package | Likely installed for | Evidence outside `src/` | Verdict |
| --- | --- | --- | --- |
| `next-themes` | Theme switching / dark mode | No references found in app code, config, or layout files | `remove` |
| `react-dom` | React DOM runtime required by Next.js | Framework runtime dependency for `next@16` + `react@19`; direct app imports are not required in App Router projects | `keep` |
| `@tailwindcss/postcss` | Tailwind PostCSS plugin | `postcss.config.mjs:3` | `keep` |
| `@types/node` | Node typings for config/test files | Needed by TS tooling/config files such as `vitest.config.ts` and `postcss.config.mjs` | `keep` |
| `@types/react` | React typings | Used implicitly by the TypeScript compiler (`tsconfig.json`) | `keep` |
| `@types/react-dom` | React DOM typings | Used implicitly by the TypeScript compiler (`tsconfig.json`) | `keep` |
| `@vitest/coverage-v8` | Vitest coverage provider | `vitest.config.ts:8` sets `provider: 'v8'` | `keep` |
| `eslint` | Lint CLI | `eslint.config.mjs` + `npm run lint` | `keep` |
| `eslint-config-next` | Next.js ESLint presets | `eslint.config.mjs:2-3` | `keep` |
| `prettier` | Formatting | `.prettierrc` / `.prettierignore` in repo root | `keep` |
| `typescript` | TS compiler + language service | `tsconfig.json` | `keep` |
| `vite` | Vitest's underlying bundler/runtime | Required by `vitest` even though app code does not import it directly | `keep` |
| `vite-tsconfig-paths` | Vitest path alias plugin | Imported in `vitest.config.ts:2` | `keep` |

Not dead despite looking close: `tailwindcss`, `tw-animate-css`, and `shadcn` are referenced by `src/app/globals.css:1-3`, so they do not meet the "zero import statements in src/" rule.

## 2. UNUSED COMPONENTS

Files under `src/components/` that are never imported by any other file:

| File | Note |
| --- | --- |
| `src/components/ui/animated-tooltip.tsx` | Dead 21st.dev copy; never imported |
| `src/components/ui/empty-state.tsx` | Dead 21st.dev copy; never imported |
| `src/components/ui/floating-action-menu.tsx` | Dead 21st.dev copy; never imported |
| `src/components/ui/sheet.tsx` | Dead duplicate drawer/sheet primitive; never imported |
| `src/components/ui/toaster.tsx` | Dead duplicate toaster; app uses `src/components/ui/sonner.tsx` from `src/app/layout.tsx:5,23` |
| `src/components/ui/tubelight-navbar.tsx` | Dead 21st.dev navbar copy; never imported |

## 3. BRANDING VIOLATIONS

### Unapproved hardcoded hex values

Every hardcoded hex color in `src/` that is not in the approved Crowe palette:

| File | Line(s) | Value | Replace with |
| --- | --- | --- | --- |
| `src/app/globals.css` | `51` | `#003F9F` | `#0075C9` |
| `src/app/globals.css` | `53` | `#D7761D` | `#FFD231` |
| `src/app/globals.css` | `57, 66, 68, 70, 89` | `#2d3142` | `#333333` |
| `src/app/globals.css` | `58, 76` | `#545968` | `#4F4F4F` |
| `src/app/globals.css` | `59, 72, 91` | `#f6f7fa` | `#FFFFFF` |
| `src/app/globals.css` | `60, 65, 88` | `#f8f9fc` | `#FFFFFF` |
| `src/app/globals.css` | `73, 75, 92` | `#f0f2f8` | `#E0E0E0` |
| `src/app/globals.css` | `80, 81, 94` | `#dfe1e8` | `#E0E0E0` |
| `src/components/ui/toaster.tsx` | `12` | `#1e2a4a` | `#011E41` |
| `src/types/screening.ts` | `99` | `#DC2626` | `#E5376B` |
| `src/types/screening.ts` | `100` | `#EA580C` | `#FFD231` |
| `src/lib/exportUtils.ts` | `92` | `#2B2D6E` | `#002E62` |
| `src/components/simulation/SimulationChart.tsx` | `30` | `#DC2626` | `#E5376B` |
| `src/components/simulation/SimulationChart.tsx` | `32` | `#2B2D6E` | `#002E62` |
| `src/components/simulation/SimulationChart.tsx` | `36` | `#EA580C` | `#FFD231` |
| `src/components/simulation/SimulationChart.tsx` | `37` | `#DC2626` | `#E5376B` |
| `src/components/simulation/SimulationChart.tsx` | `38` | `#7C2D12` | `#B14FC5` |
| `src/components/screening/ScreeningDashboard.tsx` | `95` | `#EA580C` | `#FFD231` |
| `src/components/screening/ScreeningDashboard.tsx` | `103` | `#DC2626` | `#E5376B` |
| `src/components/ui/floating-action-menu.tsx` | `32, 78` | `#11111198` | `rgba(1, 30, 65, 0.60)` |
| `src/components/ui/floating-action-menu.tsx` | `32, 78` | `#111111d1` | `rgba(1, 30, 65, 0.82)` |

Test mirror that will also need updating once the runtime colors change: `src/lib/__tests__/screening-types.test.ts:72-89`.

### Box-shadows using black RGBA

These should use an indigo-tinted shadow such as `rgba(1, 30, 65, ...)`:

| File | Line | Current value | Replace with |
| --- | --- | --- | --- |
| `src/components/ui/floating-action-menu.tsx` | `32` | `shadow-[0_0_20px_rgba(0,0,0,0.2)]` | `shadow-[0_0_20px_rgba(1,30,65,0.20)]` |
| `src/components/ui/floating-action-menu.tsx` | `78` | `shadow-[0_0_20px_rgba(0,0,0,0.2)]` | `shadow-[0_0_20px_rgba(1,30,65,0.20)]` |

### Broken brand token references

These are not hex violations, but they are active branding bugs because the referenced CSS variables do not exist in `src/app/globals.css`. Tailwind defines `--color-crowe-*`, not `--crowe-*`.

| File | Line(s) | Current value | Replace with |
| --- | --- | --- | --- |
| `src/app/tool/page.tsx` | `99, 150, 326, 365, 398, 450` | `var(--crowe-indigo-dark)` | `var(--color-crowe-indigo-dark)` or `currentColor` + `text-crowe-indigo-dark` |
| `src/app/_components/landing/HowItWorksSection.tsx` | `49` | `var(--crowe-indigo-dark)` | `var(--color-crowe-indigo-dark)` or `currentColor` + `text-crowe-indigo-dark` |
| `src/components/education/SectionCallout.tsx` | `39` | `var(--crowe-indigo-dark)` | `var(--color-crowe-indigo-dark)` or `currentColor` + `text-crowe-indigo-dark` |
| `src/app/_components/landing/FeatureStatsSection.tsx` | `23` | `var(--crowe-amber-core)` | `var(--color-crowe-amber)` or `currentColor` + `text-crowe-amber` |
| `src/components/ui/toaster.tsx` | `12` | `var(--crowe-indigo-dark, #1e2a4a)` | `var(--color-crowe-indigo-dark)` |

### Additional non-hex palette violations

These are visible brand violations even though they are Tailwind utility colors rather than hex literals:

- `src/components/education/TierLegend.tsx:2-6` uses `red`, `orange`, `yellow`, `blue`, and `green` badge utilities instead of Crowe tokens.
- `src/app/guide/_components/sections/ScoringEngineSection.tsx:125-180` uses `bg-red-600`, `bg-orange-500`, `bg-yellow-500`, `bg-blue-500`, and `bg-green-600` for tier badges.
- `src/components/screening/InputPanel.tsx:191, 285` uses `green-100` / `green-700` success colors.
- `src/components/simulation/WaterfallTable.tsx:42-60` uses red/green success-failure utilities instead of Crowe coral/teal.
- `src/components/ui/animated-tooltip.tsx:72-73` uses `emerald-500` and `sky-500` accent gradients.

## 4. MISSING LOGO

The nav is rendering plain text, not an SVG.

- `src/components/nav/SiteNav.tsx:21-23` renders `Crowe` as text inside the home link.
- `src/components/nav/ViewportGate.tsx:7-9` also renders `Crowe` as text in the mobile gate state.

Important mismatch with the prompt: there is no `crowe-logo.svg` or `crowe-logo-white.svg` anywhere in the current repo. `rg --files -g "*crowe-logo*"` returns nothing, so the fix is blocked until the actual asset files are added.

## 5. LAYOUT PROBLEMS

- Landing page: `src/app/_components/landing/HowItWorksSection.tsx:34-45` uses `gap-0` on the grid and `mx-2` on each card. That creates inconsistent outer gutters and means the connector circles at `39-40` are positioned relative to wrapper edges instead of the visual card edges, so they will read slightly off-center between cards.
- Landing page: no table/results container issue; there is no centered data container on `/`.
- Tool page: `src/app/tool/page.tsx:506-610`, `src/components/screening/InputPanel.tsx:177`, `src/components/screening/ScreeningResultsPane.tsx:93, 128, 214`, and `src/components/simulation/SimulationPane.tsx:143, 180` mix `p-3`, `p-4`, `p-5`, and `p-6` across sibling panels that should share one spacing rhythm.
- Tool page: the docs tab content is not centered. `src/app/tool/page.tsx:610-611` renders `EngineExplanationPanel`, but `src/components/EngineExplanationPanel.tsx:7` only sets `max-w-3xl` and never adds `mx-auto`, so the documentation column hugs the left edge while the sensitivity results table centers itself correctly at `src/components/ResultsTable.tsx:86`.
- Tool page: the sensitivity results table itself is fine. `src/components/ResultsTable.tsx:86` already has `mx-auto`, so the centering problem is specific to docs and the inconsistent panel spacing.
- Guide page: `src/app/guide/page.tsx:17-21` gives the main column the full remaining width without a separate prose-width constraint. On larger desktop widths this will produce longer line lengths than the rest of the app. This is an inference from the layout code.
- Guide page: card padding is inconsistent across peer guide sections. Example: `src/app/guide/_components/sections/ScreeningModeSection.tsx:43, 53, 64` uses `p-4`, `src/app/guide/_components/sections/ScoringEngineSection.tsx:31, 51, 77` uses `p-5`, and `src/app/guide/_components/sections/OfacContextSection.tsx:84` uses `p-6`.

## 6. MISSING INLINE HELP

Controls on `/tool` that do not have enough inline helper text, tooltip coverage, or programmatic labeling:

- `src/app/tool/page.tsx:391-439` - the "Degradation Rules" checkbox group has no inline explainer or per-rule tooltip describing what each rule actually does; users have to leave the page to understand the choices.
- `src/components/screening/InputPanel.tsx:248-256` - the paste textarea has no visible label, `aria-label`, or helper text beyond placeholder copy.
- `src/components/screening/ScreeningResultsPane.tsx:131-147` - the threshold slider is labeled only as `Threshold`; there is no helper text explaining the alert-volume tradeoff when the user moves it.
- `src/components/simulation/SimulationPane.tsx:101-130` - the recalibration input is introduced by a `<span>`, not a `<label>`, and there is no inline explanation of what setting a recalibration snapshot actually changes.
- `src/components/shared/CostOfMissCalculator.tsx:42-51` - the transaction-value input has no `<label>` or `aria-label`; it relies only on placeholder text. This component appears in both `src/components/screening/ScreeningResultsPane.tsx:214-218` and `src/components/simulation/SimulationPane.tsx:176-177`.

## 7. USER-FACING INTERNAL LANGUAGE

Visible copy that reads like internal notes, release notes, or implementation details:

- `src/app/tool/page.tsx:84-85, 517` - `Engine Docs`
- `src/components/EngineExplanationPanel.tsx:25-29` - `The dataset is static and lives at data/sdn.json.`
- `src/components/EngineExplanationPanel.tsx:52-58` - `The engine uses a Mulberry32 seeded PRNG (seed=42)...`
- `src/components/EngineExplanationPanel.tsx:129-132` - `Rules are applied in canonical order regardless of checkbox order.`
- `src/app/guide/_components/sections/SensitivityTestSection.tsx:47-49` - `The slider controls how many SDN entries to sample (1-285). The engine samples with replacement using a seeded PRNG (seed=42)...`
- `src/app/guide/_components/sections/ScreeningModeSection.tsx:94-97` - `The engine runs in a background Web Worker...`
- `src/app/guide/_components/sections/ScreeningModeSection.tsx:104-107` - `...coming in the next release. The current release shows screening results in the benchmark panel.`
- `src/app/guide/_components/sections/OfacContextSection.tsx:87-92` - `...is hardcoded into the tool's Cost of Miss calculation.`

The worst offender is `ScreeningModeSection.tsx:104-107`, because it is both internal-sounding and factually stale: the full results view is already live in `src/components/screening/ScreeningResultsPane.tsx`.

## 8. MISSING DEMO GUIDANCE

No component on `/tool` gives a first-time user a recommended place to start or a "good demo configuration."

Closest current guidance:

- `src/components/education/OnboardingBanner.tsx` only points the user to the guide.
- `src/components/education/SectionCallout.tsx` explains what each tab is, but not what settings to pick for a demo.

Best place to add demo guidance:

- Add a starter banner/callout directly under the left-panel header in `src/app/tool/page.tsx:311-314`, before the first `SpotlightCard`. That is where the user makes the first configuration choices.

## 9. ANIMATION AUDIT

Animation libraries imported in the codebase:

| Library | Imported in | Visible in rendered UI? | Notes |
| --- | --- | --- | --- |
| `animejs` | `src/app/tool/page.tsx`, `src/app/_components/landing/HeroAnimationShell.tsx`, `src/app/_components/landing/HowItWorksAnimationShell.tsx`, `src/app/_components/landing/FeatureStatsAnimationShell.tsx` | Yes | Powers form-card entrance, CTA glow, landing scroll-reveals, and stat count-up |
| `motion` (`motion/react`) | `src/app/_components/landing/ClientHeroHeadline.tsx`, `src/components/sticky-banner.tsx`, `src/components/ui/blur-text.tsx`, `src/components/ui/stat-tilt-card.tsx` | Yes | Hero word reveal/subcopy fade, onboarding banner motion, stat tilt |
| `framer-motion` | `src/components/nav/SiteNav.tsx`, `src/components/ui/animated-tooltip.tsx`, `src/components/ui/floating-action-menu.tsx`, `src/components/ui/tubelight-navbar.tsx` | Yes, but only partly | `SiteNav` is live; the three UI copies are dead files |

No animation library is imported while producing zero visible animation overall. The closest cleanup candidate is `framer-motion`, because only `SiteNav` is currently live while its other import sites are dead components.

## 10. 21ST.DEV / REACT BITS COMPONENT AUDIT

Relevant copied components in `src/components/ui/`:

| Component file | Imported / used in | Rendering check | Dependency check | Verdict | What to do |
| --- | --- | --- | --- | --- | --- |
| `src/components/ui/blur-text.tsx` | `src/app/_components/landing/ClientHeroHeadline.tsx:5, 12-20` | Yes. Returns a real heading tag with animated `motion.span` children at `blur-text.tsx:99-123`. | Imports `motion/react`; `motion` is present in `package.json`. | `ACTIVE` | Keep |
| `src/components/ui/stat-tilt-card.tsx` | `src/app/_components/landing/FeatureStatsSection.tsx:2, 21-34` | Yes. Renders a perspective wrapper and animated `motion.div` at `stat-tilt-card.tsx:38-50`. | Imports `motion/react`; `motion` is present in `package.json`. | `ACTIVE` | Keep |
| `src/components/ui/spotlight-card.tsx` | `src/app/tool/page.tsx:24, 93-190, 320-493` | Yes. Renders children plus a radial spotlight overlay at `spotlight-card.tsx:44-61`. | React-only; `react` is present in `package.json`. | `ACTIVE` | Keep |
| `src/components/ui/drawer.tsx` | `src/components/help/HelpDrawer.tsx:5, 36-97` | Yes. Renders a Radix dialog overlay/content pair at `drawer.tsx:15-64`. | Imports `@radix-ui/react-dialog` and `class-variance-authority`; both are present in `package.json`. | `ACTIVE` | Keep |
| `src/components/ui/animated-tooltip.tsx` | No imports | Would render visible avatar tooltip UI if mounted; currently never enters the tree. | Imports `framer-motion`; package is present. | `DEAD` | Safe remove: delete the file. If you keep it for later, rebrand the `emerald` / `sky` gradients first. |
| `src/components/ui/empty-state.tsx` | No imports | Would render visible empty-state JSX if mounted; currently never enters the tree. | Imports `lucide-react`; package is present. | `DEAD` | Safe remove: delete the file. The app already has custom empty states in `src/components/states/`. |
| `src/components/ui/floating-action-menu.tsx` | No imports | Would render a visible FAB and animated action stack if mounted; currently never enters the tree. | Imports `framer-motion` and `lucide-react`; both packages are present. | `DEAD` | Safe remove: delete the file. If retained, it also needs a brand pass because of black overlays and black shadows at `32` and `78`. |
| `src/components/ui/tubelight-navbar.tsx` | No imports | Would render a visible navbar if mounted; currently never enters the tree. | Imports `framer-motion`, `next/link`, and `lucide-react`; all packages are present. | `DEAD` | Safe remove: delete the file. Its job is already covered by `src/components/nav/SiteNav.tsx`. |

Specific components requested by the prompt:

- `BlurText` - active on the landing hero
- `StatTiltCard` - active in the landing stats section
- `SpotlightCard` - active throughout the tool page
- Particle / aurora / animated background component - none found in `src/components/ui/`
- Scroll-reveal / intersection-observer wrapper - `BlurText` uses `IntersectionObserver` and is active
- Counter / countUp component - no standalone UI component in `src/components/ui/`; the count-up is implemented in `src/app/_components/landing/FeatureStatsAnimationShell.tsx`

No copied `src/components/ui/` component looks `BROKEN` right now; the problem set is dead copies plus active components that still need brand cleanup.

## 11. FIX PRIORITY LIST

- 🔴 HIGH - Replace the text-only brand mark in `src/components/nav/SiteNav.tsx:21-23` and `src/components/nav/ViewportGate.tsx:7-9`; add the real Crowe SVG asset first, then render it with `next/image` or inline SVG.
- 🔴 HIGH - Remove stale/internal guide copy in `src/app/guide/_components/sections/ScreeningModeSection.tsx:94-107` and `src/app/guide/_components/sections/SensitivityTestSection.tsx:47-49`; rewrite the guide so it matches the current UI and removes release-note language.
- 🔴 HIGH - Fix the broken brand token references in `src/app/tool/page.tsx`, `src/app/_components/landing/HowItWorksSection.tsx`, `src/app/_components/landing/FeatureStatsSection.tsx`, `src/components/education/SectionCallout.tsx`, and `src/components/ui/toaster.tsx`; use valid `--color-crowe-*` variables or Tailwind text classes.
- 🔴 HIGH - Replace non-brand risk/status colors in `src/types/screening.ts`, `src/components/simulation/SimulationChart.tsx`, `src/components/screening/ScreeningDashboard.tsx`, `src/components/education/TierLegend.tsx`, `src/components/simulation/WaterfallTable.tsx`, and `src/app/guide/_components/sections/ScoringEngineSection.tsx`; map them to Crowe coral/amber/blue/teal/violet and update the mirrored test expectations.
- 🔴 HIGH - Add first-run demo guidance to `src/app/tool/page.tsx` (best placement: right under the left-panel header at `311-314`); tell the user what default settings make for a good demo.
- 🟡 MEDIUM - Add inline help/labels/tooltips for the degradation rules group, paste textarea, threshold slider, recalibration input, and transaction-value input across `src/app/tool/page.tsx`, `src/components/screening/InputPanel.tsx`, `src/components/screening/ScreeningResultsPane.tsx`, `src/components/simulation/SimulationPane.tsx`, and `src/components/shared/CostOfMissCalculator.tsx`.
- 🟡 MEDIUM - Normalize panel padding and center the docs tab content in `src/app/tool/page.tsx`, `src/components/EngineExplanationPanel.tsx`, `src/components/screening/ScreeningResultsPane.tsx`, and `src/components/simulation/SimulationPane.tsx`.
- 🟡 MEDIUM - Fix the landing card/connector alignment in `src/app/_components/landing/HowItWorksSection.tsx`; use real grid gaps instead of `gap-0` + `mx-2`, and center the connector circles between the actual cards.
- 🟢 LOW - Remove dead UI files `src/components/ui/animated-tooltip.tsx`, `src/components/ui/empty-state.tsx`, `src/components/ui/floating-action-menu.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/toaster.tsx`, and `src/components/ui/tubelight-navbar.tsx`.
- 🟢 LOW - Remove `next-themes` from `package.json`; keep the other zero-import packages because they are build, lint, type, or test tooling rather than dead runtime code.
