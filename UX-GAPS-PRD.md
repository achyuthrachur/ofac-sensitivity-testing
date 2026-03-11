# UX Gaps PRD — Phases 18.1–18.4
## OFAC Sensitivity Testing Tool

**Version:** 1.0  
**Date:** 2026-03-10  
**Milestone:** v3.0 Screening Engine — UX gap closure before Phase 19  
**Status:** Ready for implementation

---

## Problem Statement

The v3.0 Screening Engine is functionally complete through Phase 18. The scoring engine, input parsing, and results display all work correctly. However the application shell is incomplete as a product:

- The global header has "Crowe" (not a link), one nav link, and static text — no structured navigation
- Technical terms (OFAC, SDN, Jaro-Winkler, risk tier, false positive, Cost of Miss) are never explained inline — only on `/guide`, which most users will not find on their own
- Every zero-data state in the tool renders blank space with no guidance
- There is no feedback when async operations complete (upload, screening run, export)
- There is no branded 404 page
- A first-time user opening the tool has no orientation, no explanation of what each tab does, and no way to get help without knowing `/guide` exists

These four phases close all those gaps without touching the screening engine, scoring logic, or test suite.

---

## Goals

1. Every page has a persistent, functional top navbar with correct links and active states
2. Every technical term in the UI is explained inline via tooltip — no prior OFAC knowledge required
3. Every zero-data surface shows an instructional empty state instead of blank space
4. Every user-initiated action (upload, run, export) produces visible feedback
5. Users can access help from any page without navigating away
6. No page in the application is unbranded or returns a default Next.js error

## Non-Goals

- Mobile-responsive layout (desktop-first; viewport gate already planned)
- Real OFAC SDN data integration
- Authentication or access control
- Saving or loading sessions
- Changes to the screening engine, scoring algorithms, or test suite

---

## Scope

These phases insert between Phase 18 (complete) and Phase 19 (not started). They are numbered 18.1–18.4 in the roadmap.

| Phase | Title | Components Needed |
|-------|-------|-------------------|
| 18.1 | Global Navigation | Navbar |
| 18.2 | Contextual Education Layer | Tooltip, Callout, Banner |
| 18.3 | Empty States + Loading + Feedback | Empty State, Progress Bar, Toast |
| 18.4 | Help Drawer + 404 + Polish | Drawer/Sheet, Floating Action Button |

---

## Part 1 — Component Collection Interview

**Run this before writing a single line of implementation code.**

All 9 UI components must be sourced from 21st.dev before any phase begins. The interview below is a verbatim prompt to paste into a new Claude Code session. Claude Code will ask for each component one at a time, save it to the correct path, and confirm before moving on.

### Verbatim prompt — paste this to start a new Claude Code session:

---

> I am building the UX layer for an OFAC screening tool built with Next.js 16, TypeScript strict, Tailwind v4, and shadcn/ui. I need to collect 9 UI components from 21st.dev before I implement 4 UX phases. Please interview me for each component one at a time.
>
> For each component, do the following in order:
> 1. Tell me "Component N of 9 — [Name] (needed for Phase 18.X)"
> 2. Describe in one sentence what we need it to do
> 3. Tell me the exact file path where it will be saved
> 4. Ask me to paste the code from 21st.dev
> 5. When I paste it, write it to the file path, confirm what you saved, and immediately ask for the next component
>
> Do not start any implementation until all 9 components are collected and saved. Do not ask any other questions — just collect the components in order.
>
> Here is the ordered list:
>
> **Component 1 of 9 — Sticky Navbar** (needed for Phase 18.1)
> Save to: `src/components/nav/SiteNav.tsx`
> A sticky top navbar with logo slot on the left and nav links on the right, with an active link state.
>
> **Component 2 of 9 — Tooltip** (needed for Phase 18.2)
> Save to: `src/components/ui/tooltip.tsx`
> An accessible hover/focus tooltip that wraps inline text and shows a short definition string.
>
> **Component 3 of 9 — Callout / Info Block** (needed for Phase 18.2)
> Save to: `src/components/ui/callout.tsx`
> A bordered info callout with an icon slot, title, body text, and an optional link — used at the top of each tool tab.
>
> **Component 4 of 9 — Dismissible Banner** (needed for Phase 18.2)
> Save to: `src/components/ui/banner.tsx`
> A full-width dismissible banner with text, a CTA link, and an X close button.
>
> **Component 5 of 9 — Empty State** (needed for Phase 18.3)
> Save to: `src/components/ui/empty-state.tsx`
> A centered empty state with an icon slot, headline, body text, and optional action button.
>
> **Component 6 of 9 — Determinate Progress Bar** (needed for Phase 18.3)
> Save to: `src/components/ui/progress.tsx`
> A horizontal progress bar that accepts a 0–100 `value` prop and an optional `label` string.
>
> **Component 7 of 9 — Toast / Sonner** (needed for Phase 18.3)
> Save to: `src/components/ui/toaster.tsx`
> The Sonner `<Toaster />` component configured for this app (dark theme, top-right position).
>
> **Component 8 of 9 — Drawer / Sheet** (needed for Phase 18.4)
> Save to: `src/components/ui/drawer.tsx`
> A right-side slide-in panel with a trigger slot, title, close button, and scrollable body.
>
> **Component 9 of 9 — Floating Action Button** (needed for Phase 18.4)
> Save to: `src/components/ui/fab.tsx`
> A fixed bottom-right circular button with an icon slot, used to trigger the help drawer.
>
> Start with Component 1 of 9 now.

---

---

## Part 2 — Phase Definitions

### Phase 18.1 — Global Navigation

**Goal:** Every page has a consistent sticky top navbar with correct links, active states, and a viewport gate that prevents sub-1024px users from seeing a broken layout.

#### Files to Create

| File | Purpose |
|------|---------|
| `src/components/nav/SiteNav.tsx` | Sticky navbar — sourced from 21st.dev, adapted per spec below |
| `src/components/nav/ViewportGate.tsx` | Desktop-only gate wrapper |

#### Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Replace existing `<header>` block with `<SiteNav />`. Wrap `{children}` in `<ViewportGate>`. |

#### SiteNav — Full Specification

```tsx
// src/components/nav/SiteNav.tsx
'use client';
// Uses usePathname() from next/navigation to determine active link
// Props: none

// Links (left to right):
// - "Crowe" wordmark — href="/" — always white, font-bold text-lg tracking-tight
// - "Home"           — href="/"
// - "Tool"           — href="/tool"
// - "User Guide"     — href="/guide"

// Active link detection:
//   pathname === "/" → "Home" and "Crowe" are active
//   pathname.startsWith("/tool") → "Tool" is active
//   pathname.startsWith("/guide") → "User Guide" is active

// Active link class:    text-crowe-amber font-semibold
// Inactive link class:  text-white/70 hover:text-white transition-colors text-sm
// Wrapper:              sticky top-0 z-40 bg-crowe-indigo-dark px-6 py-3
//                       flex items-center justify-between
```

#### ViewportGate — Full Specification

```tsx
// src/components/nav/ViewportGate.tsx
// Props: { children: React.ReactNode }
// Uses CSS classes only — NO JavaScript resize listener

// On screens >= 1024px: renders children normally
// On screens < 1024px:  renders gate message only, children are hidden

// Gate content:
//   Wrapper:  bg-crowe-indigo-dark min-h-screen flex flex-col items-center
//             justify-center text-center px-6
//   Logo:     "Crowe" — text-white font-bold text-2xl mb-8
//   Heading:  "This tool is designed for desktop screens"
//             text-white text-xl font-semibold mb-3
//   Body:     "Please open this URL on a device with a screen width of at
//             least 1,024 px to access the OFAC Sensitivity Testing Tool."
//             text-white/70 text-sm max-w-sm

// Implementation pattern:
//   <div className="block lg:hidden">{gate content}</div>
//   <div className="hidden lg:block">{children}</div>
```

#### Success Criteria

1. On all three routes (`/`, `/tool`, `/guide`), the current page link renders `text-crowe-amber font-semibold`; all other links render `text-white/70`
2. Clicking "Crowe" from `/tool` or `/guide` navigates to `/`
3. Visiting on a viewport narrower than 1024px shows only the gate message — no tool content is visible
4. `npm run build` passes with zero TypeScript errors after this phase

---

### Phase 18.2 — Contextual Education Layer

**Goal:** A user who has never heard of OFAC can open the tool and understand what they are doing at every step, without leaving the page.

#### Files to Create

| File | Purpose |
|------|---------|
| `src/components/education/GlossaryTerms.ts` | Constant map of 11 term definitions — not a component |
| `src/components/education/TermTooltip.tsx` | Wraps any inline text with a hover/focus definition tooltip |
| `src/components/education/SectionCallout.tsx` | Tab-level explanation block |
| `src/components/education/TierLegend.tsx` | Five-tier color strip with compliance labels |
| `src/components/education/OnboardingBanner.tsx` | Dismissible first-visit banner |

#### Files to Modify

| File | Change |
|------|--------|
| `src/app/tool/page.tsx` | Add `<OnboardingBanner />` above the `<Tabs>` block. Add `<SectionCallout tab="sensitivity" />` as first child of the Sensitivity Test `<TabsContent>`. Add `<SectionCallout tab="screening" />` as first child of Screening Mode `<TabsContent>`. Add `<SectionCallout tab="simulation" />` as first child of Simulation `<TabsContent>`. |
| `src/components/screening/ScreeningResultsPane.tsx` | Add `<TierLegend />` directly above the `<ScreeningNameList>` component. |
| `src/components/EngineExplanationPanel.tsx` | Wrap the text "Jaro-Winkler" with `<TermTooltip term="jaro-winkler">`. Wrap "Double Metaphone" with `<TermTooltip term="double-metaphone">`. Wrap "Token Sort Ratio" with `<TermTooltip term="token-sort-ratio">`. |

#### GlossaryTerms.ts — Complete Content (copy verbatim)

```ts
// src/components/education/GlossaryTerms.ts

export const GLOSSARY = {
  ofac: {
    label: 'OFAC',
    definition:
      'The Office of Foreign Assets Control — a U.S. Treasury agency that administers economic sanctions. Businesses must screen counterparties against the OFAC SDN list before transacting.',
  },
  sdn: {
    label: 'SDN',
    definition:
      'Specially Designated Nationals list — the master OFAC list of sanctioned individuals, companies, and entities. A confirmed match requires immediate escalation.',
  },
  'jaro-winkler': {
    label: 'Jaro-Winkler',
    definition:
      'A string similarity algorithm that scores two names 0–1, giving extra weight to matching prefixes. Used to catch spelling variants of sanctioned names.',
  },
  'composite-score': {
    label: 'Composite Score',
    definition:
      'A weighted blend of three match algorithms: Jaro-Winkler (60%) + Double Metaphone (25%) + Token Sort Ratio (15%). Scores above the threshold trigger an alert.',
  },
  'false-positive': {
    label: 'False Positive',
    definition:
      'A name flagged as a potential SDN match that is actually a legitimate counterparty. High false positive rates create compliance workload without adding protection.',
  },
  'false-negative': {
    label: 'False Negative',
    definition:
      'A genuine SDN match that the screening engine missed — the most dangerous failure mode. Can result in a civil monetary penalty from OFAC.',
  },
  'risk-tier': {
    label: 'Risk Tier',
    definition:
      'One of five escalating alert levels (EXACT / HIGH / MEDIUM / LOW / CLEAR) assigned to each screened name based on its composite match score.',
  },
  'cost-of-miss': {
    label: 'Cost of Miss',
    definition:
      "Estimated OFAC civil penalty if a false negative allows a sanctioned transaction to proceed. Calculated as transaction value × 4.0 (OFAC's standard penalty multiplier).",
  },
  threshold: {
    label: 'Threshold',
    definition:
      'The composite score cutoff above which a name is flagged for review. Lower threshold = fewer false negatives but more false positives.',
  },
  'double-metaphone': {
    label: 'Double Metaphone',
    definition:
      'A phonetic encoding algorithm that converts names to their sound representation, catching matches like "Smith" and "Smyth" that differ in spelling but sound identical.',
  },
  'token-sort-ratio': {
    label: 'Token Sort Ratio',
    definition:
      'A fuzzy match technique that sorts name tokens alphabetically before comparing — catching matches like "Al Rashid Omar" vs "Omar Al Rashid".',
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
```

#### TermTooltip — Full Specification

```tsx
// src/components/education/TermTooltip.tsx
// Props: { term: GlossaryKey; children?: React.ReactNode }
// If children is omitted, renders GLOSSARY[term].label as the visible text

// Visible text style:
//   border-b border-dotted border-white/50 cursor-help inline

// Tooltip content:
//   Renders the definition string from GLOSSARY[term].definition
//   Max width: 280px
//   Background: bg-crowe-indigo-dark border border-white/20 rounded-md
//   Text: text-white text-xs leading-relaxed p-3
//   Must be accessible via keyboard focus (not mouse-only)

// Uses the 21st.dev Tooltip component as the rendering primitive.
// Wrap like: <Tooltip content={GLOSSARY[term].definition}><span ...>{label}</span></Tooltip>
```

#### SectionCallout — Full Specification

```tsx
// src/components/education/SectionCallout.tsx
// Props: { tab: 'sensitivity' | 'screening' | 'simulation' }

// Uses the 21st.dev Callout component as the rendering primitive.
// Renders with mb-4 spacing below it.

// Content by tab:
//
// tab="sensitivity"
//   title: "Sensitivity Test"
//   body:  "This tab tests how your current screening engine handles deliberate
//           name degradations. Configure entity types and rules, then run a test
//           to see how many degraded names your engine would catch vs. miss."
//   link:  { label: "Learn more in the User Guide →", href: "/guide#sensitivity-test" }
//
// tab="screening"
//   title: "Screening Mode"
//   body:  "Upload a list of names to screen against the 285-entry synthetic SDN
//           dataset. The engine scores each name across three algorithms and assigns
//           a risk tier — use this to demonstrate screening coverage to a client."
//   link:  { label: "Learn more in the User Guide →", href: "/guide#screening-mode" }
//
// tab="simulation"
//   title: "Simulation Mode"
//   body:  "Model how catch rates evolve over time as sanctioned entities adopt
//           increasingly sophisticated evasion tactics. Select a velocity preset
//           to see how your threshold holds up under sustained evasion pressure."
//   link:  { label: "Learn more in the User Guide →", href: "/guide#simulation" }
```

#### TierLegend — Full Specification

```tsx
// src/components/education/TierLegend.tsx
// Props: none

// Layout wrapper:
//   flex flex-wrap gap-3 py-3 px-4 mb-3
//   bg-white/5 rounded-lg border border-white/10

// Five entries, left to right:
//
// EXACT  — badge bg: bg-red-900/60    text: text-red-200    border: border-red-700/50
//           label below badge: "Immediate block required"
//
// HIGH   — badge bg: bg-orange-900/60 text: text-orange-200 border: border-orange-700/50
//           label below badge: "Enhanced due diligence"
//
// MEDIUM — badge bg: bg-yellow-900/60 text: text-yellow-200 border: border-yellow-700/50
//           label below badge: "Manual review required"
//
// LOW    — badge bg: bg-blue-900/60   text: text-blue-200   border: border-blue-700/50
//           label below badge: "Monitor and document"
//
// CLEAR  — badge bg: bg-green-900/60  text: text-green-200  border: border-green-700/50
//           label below badge: "No action required"
//
// Each entry layout: flex flex-col items-center gap-0.5
// Badge: text-xs font-semibold px-2 py-0.5 rounded border
// Label: text-[10px] text-white/60 text-center
```

#### OnboardingBanner — Full Specification

```tsx
// src/components/education/OnboardingBanner.tsx
// 'use client' — reads and writes localStorage
// Props: none

// localStorage key: "ofac_tool_onboarding_dismissed"
// On mount: if localStorage.getItem("ofac_tool_onboarding_dismissed") === "true",
//           render null immediately (no flash)
// On dismiss click: localStorage.setItem("ofac_tool_onboarding_dismissed", "true"),
//                   hide the banner

// Banner layout:
//   bg-crowe-indigo/40 border-b border-white/10
//   px-6 py-3 flex items-center justify-between gap-4

// Left text:
//   "New to OFAC screening? Learn what each result tier means and how to
//    interpret match scores."
//   text-white/80 text-sm

// Center CTA (Next.js Link):
//   href="/guide"
//   text: "Open User Guide →"
//   className: text-crowe-amber hover:text-crowe-amber-bright text-sm font-medium
//              transition-colors whitespace-nowrap

// Right dismiss button:
//   aria-label="Dismiss"
//   renders an X icon (use CloseCircle from iconsax-reactjs, size 18)
//   text-white/50 hover:text-white transition-colors
```

#### Success Criteria

1. Hovering "Jaro-Winkler" in `EngineExplanationPanel` shows the tooltip definition within 300ms
2. Each of the three tabs shows its `<SectionCallout>` as the topmost element inside `<TabsContent>`
3. `<TierLegend>` is visible above the screening name list with all 5 tiers and their compliance labels
4. The onboarding banner appears on first visit to `/tool`; clicking X dismisses it and it does not reappear on reload
5. `npm run build` passes with zero TypeScript errors after this phase

---

### Phase 18.3 — Empty States, Loading States, and Feedback

**Goal:** The tool never shows blank space or silent failures. Every zero-data surface has instructional copy. Every async operation has visible progress. Every user action has feedback.

#### Files to Create

| File | Purpose |
|------|---------|
| `src/components/states/EmptyResultsState.tsx` | Sensitivity Test tab — no results yet |
| `src/components/states/EmptyScreeningState.tsx` | Screening Mode — no upload yet |
| `src/components/states/EmptySimulationState.tsx` | Simulation tab — not run yet |
| `src/components/screening/ScreeningProgressBar.tsx` | Progress indicator during screening run |

#### Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `<Toaster />` from `src/components/ui/toaster.tsx` as last child of `<body>`, after `{children}` |
| `src/components/ResultsTable.tsx` | When `rows` prop is an empty array, render `<EmptyResultsState />` instead of the table |
| `src/components/screening/ScreeningResultsPane.tsx` | When `results` is empty and `isRunning` is false, render `<EmptyScreeningState />`. When `isRunning` is true, render `<ScreeningProgressBar progress={progress} nameCount={nameCount} processedCount={processedCount} />` instead of the name list. |
| `src/components/simulation/SimulationPane.tsx` | When no simulation data is present, render `<EmptySimulationState />` |
| `src/app/tool/page.tsx` | Add toast calls at the four trigger points listed below |

#### Empty State Specifications

All three empty states share the same base layout:
```
flex flex-col items-center justify-center gap-4 py-20 text-center px-6
```

**EmptyResultsState**
- Icon: `<Setting4 variant="Linear" size={40} color="currentColor" className="text-white/30" />`
- Heading: `"No results yet"` — `text-white/60 text-lg font-medium`
- Body: `"Configure entity types, regions, and degradation rules in the panel on the left, then click Run Test to see results here."` — `text-white/40 text-sm max-w-xs`
- No action button

**EmptyScreeningState**
- Icon: `<ClipboardTick variant="Linear" size={40} color="currentColor" className="text-white/30" />`
- Heading: `"No names loaded"` — `text-white/60 text-lg font-medium`
- Body: `"Upload a CSV or Excel file, or paste names directly in the input panel, to begin screening against the SDN dataset."` — `text-white/40 text-sm max-w-xs`
- No action button

**EmptySimulationState**
- Icon: `<Global variant="Linear" size={40} color="currentColor" className="text-white/30" />`
- Heading: `"No simulation run yet"` — `text-white/60 text-lg font-medium`
- Body: `"Select a velocity preset (Baseline, Elevated, or Surge) and click Run Simulation to model catch rate evolution over time."` — `text-white/40 text-sm max-w-xs`
- No action button

#### ScreeningProgressBar — Full Specification

```tsx
// src/components/screening/ScreeningProgressBar.tsx
// Props: { progress: number; nameCount: number; processedCount: number }
//   progress: 0–100 (passed to the 21st.dev Progress component)
//   nameCount: total names being screened
//   processedCount: names completed so far

// Layout: px-6 py-10 flex flex-col items-center gap-4

// Label: "Screening {processedCount} of {nameCount} names…"
//        text-white/70 text-sm

// Renders: the 21st.dev Progress bar component at the given value
//          width: w-full max-w-md
```

#### Toast Calls — Exact Strings

Add these `toast` calls in `src/app/tool/page.tsx`. Import `toast` from `sonner`.

```tsx
// 1. After InputPanel reports a successful file upload (in the onNamesChange handler,
//    when the new list length > 0 for the first time):
toast.success(`Name list loaded — ${names.length} names ready to screen`);

// 2. After the screening Web Worker returns results (in the onMessage / Comlink
//    callback where matchResults are set):
toast.success(
  `Screening complete — ${results.length} names processed in ${elapsed.toFixed(1)}s`
);

// 3. After CSV download is triggered (in the existing CSV export handler):
toast.success('Exported results.csv');

// 4. On file parse validation error (in the catch block of the file parsing path):
toast.error(`Upload failed — ${error.message}`);
```

#### Success Criteria

1. Before any Sensitivity Test is run, the results area shows `<EmptyResultsState />` with the exact heading and body copy above — no blank space
2. Before any file is uploaded in Screening Mode, the results area shows `<EmptyScreeningState />` with the exact heading and body copy above
3. Before any simulation is run, the simulation area shows `<EmptySimulationState />` with the exact heading and body copy above
4. During a screening run, `<ScreeningProgressBar />` replaces the name list and updates as names are processed
5. After a CSV export, a success toast appears top-right: `"Exported results.csv"`
6. `npm run build` passes with zero TypeScript errors after this phase

---

### Phase 18.4 — Help Drawer + 404 + Polish

**Goal:** Users can always access help from any page. No page is unbranded. Power users get a keyboard shortcut.

#### Files to Create

| File | Purpose |
|------|---------|
| `src/components/help/HelpDrawer.tsx` | Slide-in help panel content |
| `src/components/help/HelpFab.tsx` | Floating `?` button |
| `src/components/help/HelpFabWithDrawer.tsx` | Parent wrapper that owns open/close state |
| `src/app/not-found.tsx` | Branded 404 page |

#### Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `<HelpFabWithDrawer />` after `<Toaster />`, just before `</body>` |
| `src/app/tool/page.tsx` | Add `Cmd+Enter` / `Ctrl+Enter` keyboard shortcut (see spec below) |

#### HelpDrawer — Full Specification

```tsx
// src/components/help/HelpDrawer.tsx
// Props: { open: boolean; onClose: () => void }
// Uses the 21st.dev Drawer component as the rendering primitive
// Side: right
// Width: w-[380px]

// Title: "Help & Reference"

// Section 1 — Quick Links (heading: "Quick Links")
// Four Next.js <Link> items, each on its own line:
//   "What is OFAC screening?"          → href="/guide#ofac-context"
//   "Running a Sensitivity Test"       → href="/guide#sensitivity-test"
//   "Using Screening Mode"             → href="/guide#screening-mode"
//   "Understanding match scores"       → href="/guide#scoring-engine"
// Link style: text-crowe-amber hover:text-crowe-amber-bright text-sm transition-colors
// On link click: call onClose() then navigate (so the drawer closes before route change)

// Section 2 — Glossary (heading: "Glossary")
// Render all 11 terms from GLOSSARY in this order:
//   OFAC, SDN, Threshold, Risk Tier, Composite Score, Jaro-Winkler,
//   Double Metaphone, Token Sort Ratio, False Positive, False Negative, Cost of Miss
// Each term:
//   Term label: text-white text-sm font-semibold
//   Definition: text-white/70 text-xs leading-relaxed mt-0.5
//   Spacing between terms: mb-4
```

#### HelpFab — Full Specification

```tsx
// src/components/help/HelpFab.tsx
// Props: { onClick: () => void }

// Fixed position: fixed bottom-6 right-6 z-50
// Button: 48×48px circle
//   bg-crowe-indigo-dark border border-white/20
//   hover:border-crowe-amber hover:text-crowe-amber
//   text-white transition-colors rounded-full
//   flex items-center justify-center
// Icon: <InfoCircle variant="Linear" size={20} color="currentColor" /> from iconsax-reactjs
// aria-label: "Open help"
```

#### HelpFabWithDrawer — Full Specification

```tsx
// src/components/help/HelpFabWithDrawer.tsx
// 'use client'
// Owns the open boolean state
// Renders:
//   <HelpFab onClick={() => setOpen(true)} />
//   <HelpDrawer open={open} onClose={() => setOpen(false)} />
```

#### Keyboard Shortcut — Full Specification

Add to `src/app/tool/page.tsx` inside the component body:

```tsx
// Cmd+Enter / Ctrl+Enter submits the Sensitivity Test form
// Only fires when activeTab === 'sensitivity' and isPending is false
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (activeTab === 'sensitivity' && !isPending) {
        e.preventDefault();
        // Call the same submit handler used by the Run Test button
        handleSubmit();
      }
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [activeTab, isPending]);
```

Also add a keyboard hint label on the Run Test button:

```tsx
// Inside the Run Test <Button>, after the button text, add:
<span className="ml-2 text-xs text-white/40 hidden lg:inline">⌘↵</span>
```

#### 404 Page — Full Specification

```tsx
// src/app/not-found.tsx
// Server component — no 'use client'

// Full page layout: bg-crowe-indigo-dark min-h-screen flex flex-col

// Top bar (same height as SiteNav):
//   px-6 py-3 flex items-center
//   "Crowe" — Link href="/" — text-white font-bold text-lg tracking-tight

// Center content:
//   flex-1 flex flex-col items-center justify-center text-center px-6

//   Heading: "404 — Page not found"
//     text-white text-4xl font-bold mb-4

//   Body: "The page you're looking for doesn't exist or has been moved."
//     text-white/60 text-base mb-10 max-w-sm

//   Two buttons side by side (gap-4):
//     Button 1: "Back to Home"  → href="/"
//       variant: outline, white border, white text
//     Button 2: "Open the Tool" → href="/tool"
//       variant: filled amber (bg-crowe-amber text-crowe-indigo-dark font-semibold)
```

#### Success Criteria

1. Clicking `?` from any page opens the help drawer without a page navigation
2. The drawer shows all 11 glossary terms in the correct order with correct definitions
3. Visiting `/nonexistent` shows the branded 404 page — not the default Next.js error page
4. Pressing `Cmd+Enter` (macOS) or `Ctrl+Enter` (Windows) while on the Sensitivity Test tab submits the form — the Run Test button shows `⌘↵` hint
5. `npm run build` passes with zero TypeScript errors after this phase

---

## Build Order

Execute strictly in this sequence. Do not start a phase until the previous phase's `npm run build` is clean.

1. Run the Component Collection Interview — collect all 9 components from 21st.dev
2. Phase 18.1 — implement, `npm run build`, verify all success criteria
3. Phase 18.2 — implement, `npm run build`, verify all success criteria
4. Phase 18.3 — implement, `npm run build`, verify all success criteria
5. Phase 18.4 — implement, `npm run build`, verify all success criteria
6. Update `ROADMAP.md`: mark phases 18.1–18.4 complete, change Phase 19 status to "Next"

Do not rewrite entire files. Make targeted edits only. Each phase should touch only the files listed in its "Files to Modify" table.
