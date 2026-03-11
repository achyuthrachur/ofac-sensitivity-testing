# UX-FIXES-FRESH-SESSION.md
> Written by inspection session on 2026-03-10.
> Hand this file to the next session as a complete brief. All issues are catalogued here with exact file paths, root causes, and precise fixes. Work through them in the order given — they build on each other.

---

## Orientation

The app has three routes: `/` (landing), `/tool` (main tool), `/guide` (user guide).

The tool layout (`src/app/tool/page.tsx`) is a fixed horizontal split:
- **Left panel** — `w-[420px]`, always visible, holds Sensitivity Test form cards
- **Right panel** — `flex-1`, holds `OnboardingBanner` + three-tab layout (Sensitivity Test / Screening Mode / Simulation)

---

## Issue 1 — Results Table: Not Centered, Appears Left-Aligned

**Symptom:** After running a Sensitivity Test, the results table sits left-aligned with a blank column of dead space to its right. On wide displays (1440px+ viewport), the right panel is ~1000px wide but the table container is hardcoded to `width: 1050px` — there is no centering, so the table juts against the left edge.

**Root cause:** `src/components/ResultsTable.tsx` line 108:
```tsx
style={{ height: '600px', overflowY: 'auto', width: '1050px', overflowX: 'auto' }}
```
The scroll container is hardcoded at 1050px instead of being a full-width container that can scroll horizontally if needed.

**Fix — `src/components/ResultsTable.tsx`:**

Wrap the entire return in a centering shell and change the scroll container:

```tsx
// BEFORE (line 86):
return (
  <div className="space-y-3">
    ...
    <div ref={parentRef} className="rounded-md border"
      style={{ height: '600px', overflowY: 'auto', width: '1050px', overflowX: 'auto' }}>

// AFTER:
return (
  <div className="space-y-3 w-full max-w-[1100px] mx-auto">
    ...
    <div className="w-full overflow-x-auto rounded-md border">
      <div ref={parentRef} style={{ height: '600px', overflowY: 'auto', width: '1050px' }}>
```

This centers the whole table block when the right panel is wider than 1100px, and horizontally scrolls when the panel is narrower than 1050px. The inner `1050px` div preserves the TanStack virtualizer requirement for explicit pixel widths.

**The summary row above the table** (the catch-rate + Download CSV row) is inside the same `space-y-3` wrapper, so it automatically aligns with the centered table.

---

## Issue 2 — Left Panel Mismatch: Sensitivity Test Controls Always Visible

**Symptom:** The left panel contains four form cards — Entity Counts, Linguistic Regions, Degradation Rules, Client Name — and a "Run Test" button. These controls are **only meaningful for the Sensitivity Test tab**, but the left panel is **always visible** regardless of which tab is active. When a user switches to Screening Mode or Simulation, they see four irrelevant form cards, no guidance for the current tab, and a "Run Test" button that doesn't even apply.

This makes the product feel like a form tool that was awkwardly bolted onto other features.

**Root cause:** `src/app/tool/page.tsx` — the left panel `<div>` (lines 181–366) renders unconditionally. There is no `activeTab` check around its content.

**Fix — `src/app/tool/page.tsx`:**

Make the left panel tab-aware. Three approaches (choose the cleanest):

### Option A — Preferred: Context-Aware Left Panel

Show the Sensitivity Test form cards only when `activeTab === 'sensitivity'`. For the other two tabs, replace the left panel content with a tab-specific mini-guide.

```tsx
{/* LEFT PANEL */}
<div ref={toolRoot} className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-border p-6 space-y-6">
  {activeTab === 'sensitivity' && (
    <>
      {/* existing form cards — Entity Counts, Regions, Rules, Client Name, Run Test */}
    </>
  )}
  {activeTab === 'screening' && (
    <ScreeningGuidePanel />
  )}
  {activeTab === 'simulation' && (
    <SimulationGuidePanel />
  )}
</div>
```

Create two new simple components (inline in `tool/page.tsx` or in `src/components/`):

**ScreeningGuidePanel** — should contain:
- Heading: "Screening Mode"
- Sub-copy: "Upload a CSV or paste a name list. The engine scores each name against 285 synthetic SDN entries using three algorithms and assigns a risk tier."
- Step list (numbered): 1. Upload a CSV or paste names. 2. Click Run Screening. 3. Use the threshold slider to model different alert cutoffs. 4. Export results as CSV or PDF.
- CTA link to `/guide#screening-mode`
- Use iconsax icons: `DocumentUpload`, `ArrowRight`, `Setting4`

**SimulationGuidePanel** — should contain:
- Heading: "Simulation Mode"
- Sub-copy: "Model how catch rates degrade over time as sanctioned entities adopt increasingly sophisticated evasion tactics."
- Step list (numbered): 1. Select a velocity preset (Baseline, Elevated, Surge). 2. Optionally enter a recalibration point. 3. Click Run Simulation. 4. Inspect the catch rate chart and snapshot table.
- CTA link to `/guide#simulation`
- Use iconsax icons: `Chart`, `Refresh2`, `ArrowRight`

### Option B — Simpler: Collapse the Panel on Non-Sensitivity Tabs

Add `activeTab !== 'sensitivity' ? 'w-0 p-0 overflow-hidden border-0' : 'w-[420px] ...'` to the left panel div. This hides the panel entirely when it's not relevant and lets the right panel use full width.

---

## Issue 3 — Left Panel: Cramped UI in Degradation Rules Card

**Symptom:** The Degradation Rules card (Card 3 in the left panel) renders 10 rules in a `grid-cols-2` layout. Each rule has a `ClipboardTick` icon (16px) plus the rule label text, all within a 186px column (420px panel − 48px padding = 372px ÷ 2 = 186px). Labels like "Alias Substitution", "Abbreviation Expansion", "Char Substitution" are long enough to crowd the icon and wrap awkwardly.

**Root cause:** `src/app/tool/page.tsx` lines 291–311 — `grid-cols-2` combined with `ClipboardTick` icon inside each label.

**Two fixes — apply both:**

### Fix A — Remove icon from rule labels

The `ClipboardTick` icon inside each rule label adds no semantic value (every row has it identically) and consumes 20px of each cell's width. Remove it.

```tsx
// BEFORE (line 304):
<Label htmlFor={`rule-${ruleId}`} className="flex items-center gap-1 cursor-pointer">
  <ClipboardTick variant="Linear" size={16} color="currentColor" />
  {RULE_LABELS[ruleId as RuleId]}
</Label>

// AFTER:
<Label htmlFor={`rule-${ruleId}`} className="cursor-pointer text-sm leading-tight">
  {RULE_LABELS[ruleId as RuleId]}
</Label>
```

### Fix B — Increase left panel width

Change `w-[420px]` to `w-[460px]` on the left panel div (line 181). This gives each rule column 207px — enough for all label text without wrapping. Also helps Entity Counts and Regions breathe.

```tsx
// BEFORE:
<div ref={toolRoot} className="w-[420px] flex-shrink-0 ...">

// AFTER:
<div ref={toolRoot} className="w-[460px] flex-shrink-0 ...">
```

---

## Issue 4 — Empty States: Wrong Icon Library (Lucide instead of iconsax)

**Symptom:** All three empty state components import icons from `lucide-react` instead of `iconsax-reactjs`. This breaks the project convention that iconsax is the sole icon library.

**Affected files:**
- `src/components/states/EmptyResultsState.tsx` — uses `SlidersHorizontal` from `lucide-react`
- `src/components/states/EmptyScreeningState.tsx` — uses `ClipboardCheck` from `lucide-react`
- `src/components/states/EmptySimulationState.tsx` — uses `Globe` from `lucide-react`

**Root cause:** The implementations used Lucide icons instead of following the UX-GAPS-PRD spec which explicitly requires iconsax icons for all three:

> EmptyResultsState: `Setting4 variant="Linear"` from iconsax
> EmptyScreeningState: `ClipboardTick variant="Linear"` from iconsax
> EmptySimulationState: `Global variant="Linear"` from iconsax

The `EmptyState` component from `src/components/ui/empty-state.tsx` accepts an `icons` array and renders them — but it was designed for Lucide (which renders an SVG directly as a component with `className`). iconsax components have different props (`variant`, `size`, `color`). The wrapper may not render them correctly.

**Fix — rewrite all three empty states without the EmptyState wrapper:**

**`src/components/states/EmptyResultsState.tsx`:**
```tsx
import { Setting4 } from 'iconsax-reactjs';

export function EmptyResultsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <Setting4 variant="Linear" size={40} color="currentColor" className="text-muted-foreground/40" />
      <p className="text-muted-foreground text-lg font-medium">No results yet</p>
      <p className="text-muted-foreground/60 text-sm max-w-xs">
        Configure entity types, regions, and degradation rules in the panel on the left, then click Run Test to see results here.
      </p>
    </div>
  );
}
```

**`src/components/states/EmptyScreeningState.tsx`:**
```tsx
import { ClipboardTick } from 'iconsax-reactjs';

export function EmptyScreeningState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <ClipboardTick variant="Linear" size={40} color="currentColor" className="text-muted-foreground/40" />
      <p className="text-muted-foreground text-lg font-medium">No names loaded</p>
      <p className="text-muted-foreground/60 text-sm max-w-xs">
        Upload a CSV or Excel file, or paste names directly in the input panel, to begin screening against the SDN dataset.
      </p>
    </div>
  );
}
```

**`src/components/states/EmptySimulationState.tsx`:**
```tsx
import { Global } from 'iconsax-reactjs';

export function EmptySimulationState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <Global variant="Linear" size={40} color="currentColor" className="text-muted-foreground/40" />
      <p className="text-muted-foreground text-lg font-medium">No simulation run yet</p>
      <p className="text-muted-foreground/60 text-sm max-w-xs">
        Select a velocity preset (Baseline, Elevated, or Surge) and click Run Simulation to model catch rate evolution over time.
      </p>
    </div>
  );
}
```

---

## Issue 5 — TierLegend: Wrong Color Mode (Light Instead of Dark)

**Symptom:** The `TierLegend` component inside `ScreeningResultsPane` uses light-mode badge colors (`bg-red-50 text-red-700`, `bg-orange-50 text-orange-700` etc). The screening results area has a dark/neutral background, making these light badges visually jarring and inconsistent with the rest of the tool.

**Root cause:** `src/components/education/TierLegend.tsx` lines 2–26 — badge classes are light-mode Tailwind utilities. The UX-GAPS-PRD spec (Phase 18.2) explicitly specifies dark-mode variants:

```
EXACT  — bg-red-900/60 text-red-200 border-red-700/50
HIGH   — bg-orange-900/60 text-orange-200 border-orange-700/50
MEDIUM — bg-yellow-900/60 text-yellow-200 border-yellow-700/50
LOW    — bg-blue-900/60 text-blue-200 border-blue-700/50
CLEAR  — bg-green-900/60 text-green-200 border-green-700/50
```

**Fix — `src/components/education/TierLegend.tsx`:**

Replace the TIERS array:
```tsx
const TIERS = [
  { label: 'EXACT',  badge: 'bg-red-900/60 text-red-200 border-red-700/50',       caption: 'Immediate block required' },
  { label: 'HIGH',   badge: 'bg-orange-900/60 text-orange-200 border-orange-700/50', caption: 'Enhanced due diligence' },
  { label: 'MEDIUM', badge: 'bg-yellow-900/60 text-yellow-200 border-yellow-700/50', caption: 'Manual review required' },
  { label: 'LOW',    badge: 'bg-blue-900/60 text-blue-200 border-blue-700/50',     caption: 'Monitor and document' },
  { label: 'CLEAR',  badge: 'bg-green-900/60 text-green-200 border-green-700/50',  caption: 'No action required' },
] as const;
```

Also update the wrapper background to match:
```tsx
// BEFORE:
<div className="flex flex-wrap gap-3 py-3 px-4 mb-3 bg-muted/50 rounded-lg border border-border">

// AFTER:
<div className="flex flex-wrap gap-3 py-3 px-4 mb-3 bg-crowe-indigo-dark/20 rounded-lg border border-crowe-indigo-dark/30">
```

---

## Issue 6 — ScreeningProgressBar: Progress Always Shows 0%

**Symptom:** When Run Screening is clicked, the progress bar appears but always shows 0% progress and "Screening 0 of N names…" because the props are hardcoded to zero.

**Root cause:** `src/app/tool/page.tsx` line 419:
```tsx
<ScreeningProgressBar progress={0} nameCount={activeNames.length} processedCount={0} />
```

The Comlink Web Worker (`screening.worker.ts`) runs synchronously from the UI thread's perspective — the worker processes all names and returns the array. There is no progress callback wired up.

**Fix:** Replace the determinate progress bar with an indeterminate pulsing state:

In `src/components/screening/ScreeningProgressBar.tsx`, change the rendering to show an indeterminate animation when `progress === 0`:

```tsx
export function ScreeningProgressBar({ progress, nameCount, processedCount }: ScreeningProgressBarProps) {
  const isIndeterminate = progress === 0 && processedCount === 0;
  return (
    <div className="px-6 py-10 flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-sm">
        {isIndeterminate
          ? `Screening ${nameCount.toLocaleString()} names…`
          : `Screening ${processedCount} of ${nameCount} names…`}
      </p>
      {isIndeterminate ? (
        <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-crowe-amber rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
      ) : (
        <Progress value={progress} className="w-full max-w-md" />
      )}
    </div>
  );
}
```

Add the shimmer keyframe to `src/app/globals.css`:
```css
@keyframes shimmer {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(350%); }
}
```

---

## Issue 7 — No User Flow: The App Feels Like Disconnected Tools

This is the most impactful issue. The app has three powerful tools but they feel like three separate things with no connecting thread. A first-time user opening `/tool` sees a form on the left, three mystery tabs on the right, and no guidance about what to do or in what order.

### 7a — Landing Page: Missing Workflow Narrative

**Current state:** The landing page has:
1. `HeroSection` — headline + sub-copy + CTA button
2. `HowItWorksSection` — three cards: Configure / Run / Export (only describes Sensitivity Test)
3. `FeatureStatsSection` — four stat cards (285 entries, 10 rules, 4 regions, ~53ms)

**Problem:** The "How It Works" section only describes the Sensitivity Test workflow. It doesn't mention Screening Mode or Simulation at all. A visitor reading the landing page would have no idea the tool has three distinct capabilities. There is also no suggested order of operations.

**Fix — `src/app/_components/landing/HowItWorksSection.tsx`:**

Expand the section to show **three tools** not three steps. Rename the section to "Three Tools, One Workflow" and show the three tabs as a progression:

```
Tool 1 → Sensitivity Test
"Run a synthetic stress test on your screening engine. Apply 10 real-world name-degradation rules to 285 SDN entries and see your catch rate."

Tool 2 → Screening Mode
"Upload your actual name list (synthetic demo data provided). The engine scores each name across three algorithms and assigns a risk tier."

Tool 3 → Simulation
"Project how catch rates decay over time as sanctioned entities evolve their evasion tactics. Three velocity presets: Baseline, Elevated, Surge."
```

Icons: use iconsax `Setting4` (Tool 1), `ClipboardTick` (Tool 2), `Chart` (Tool 3).

Add a visual numbered connector between them (e.g., a row of 1 → 2 → 3 with arrows).

### 7b — Tool Page: No Tab-to-Tab Handoff

**Current state:** After running a Sensitivity Test and seeing results, there is no prompt to try Screening Mode. After running Screening Mode, there is no prompt to try Simulation. Each tab is a dead end.

**Fix — Add "Next step" banners at the bottom of each tab's results:**

**Sensitivity Test → Screening Mode:** After `ResultsTable` renders (i.e. `rows.length > 0`), add below it:

```tsx
<div className="mt-6 rounded-lg border border-crowe-amber/20 bg-crowe-amber/5 p-4 flex items-center justify-between">
  <div>
    <p className="text-sm font-semibold text-foreground">Next: Try Screening Mode</p>
    <p className="text-xs text-muted-foreground mt-0.5">
      Upload real names and see how the engine scores them against the SDN dataset.
    </p>
  </div>
  <button
    onClick={() => setActiveTab('screening')}
    className="text-xs font-semibold text-crowe-amber hover:text-crowe-amber-bright flex items-center gap-1 transition-colors"
  >
    Go to Screening <ArrowRight size={14} color="currentColor" />
  </button>
</div>
```

**Screening Mode → Simulation:** After `ScreeningResultsPane` renders (i.e. `matchResults.length > 0`), add a similar prompt at the bottom of the screening results pointing to the Simulation tab.

### 7c — Left Panel: Tab-Aware Title and CTA

The left panel title ("OFAC Sensitivity Testing") and subtitle ("Synthetic name degradation demo — Crowe AML Practice") are always shown regardless of the active tab. When a user is in Screening Mode, the sub-copy is wrong — screening mode is not a "degradation demo."

**Fix:** Make the panel header update based on `activeTab`:

```tsx
const PANEL_HEADERS = {
  sensitivity: {
    title: 'Sensitivity Test',
    sub: 'Configure degradation rules and run against the synthetic SDN dataset',
  },
  screening: {
    title: 'Screening Mode',
    sub: 'Upload names and score them against 285 synthetic SDN entries',
  },
  simulation: {
    title: 'Simulation Mode',
    sub: 'Model catch rate decay under three evasion velocity presets',
  },
};
```

Use `PANEL_HEADERS[activeTab]` to render the title and subtitle.

### 7d — Add Workflow Step Indicator to Tool Page

Add a subtle horizontal step indicator **above the tab bar** (not replacing it) that shows where the user is in the suggested workflow:

```
[1 Sensitivity Test] → [2 Screening Mode] → [3 Simulation]
```

This replaces the current plain `TabsList` with one that has numbered prefixes. The active tab highlights the number.

**Implementation:** Modify the `TabsTrigger` elements to include a step number:

```tsx
<TabsTrigger value="sensitivity">
  <span className="mr-1.5 text-xs opacity-50">1</span>Sensitivity Test
</TabsTrigger>
<TabsTrigger value="screening">
  <span className="mr-1.5 text-xs opacity-50">2</span>Screening Mode
</TabsTrigger>
<TabsTrigger value="simulation">
  <span className="mr-1.5 text-xs opacity-50">3</span>Simulation
</TabsTrigger>
```

---

## Issue 8 — "Engine Docs" Tab: Buried and Inaccessible

**Symptom:** The `EngineExplanationPanel` (documentation on the scoring algorithms) is hidden behind a nested tab inside the Sensitivity Test tab. Users who don't run a test first will never see it (it only appears after results exist).

**Root cause:** `src/app/tool/page.tsx` lines 385–396 — nested `<Tabs defaultValue="results">` with "Results" and "Engine Docs" tabs only renders when `rows.length > 0`.

**Fix:** Move "Engine Docs" to the top-level tab bar as a fourth tab, always visible. This also makes the left panel's "Run Test" button the only control needed for the Sensitivity Test tab, keeping the layout clean.

```tsx
// Add to main TabsList:
<TabsTrigger value="docs">Engine Docs</TabsTrigger>

// Add TabsContent:
<TabsContent value="docs" className="flex-1 overflow-y-auto p-6">
  <EngineExplanationPanel />
</TabsContent>
```

Remove the nested tabs from the Sensitivity Test content. The Results tab content just renders `<ResultsTable>` directly.

---

## Issue 9 — TermTooltip: Broken Import (Possible)

**Current state:** `src/components/education/TermTooltip.tsx` line 3 imports:
```tsx
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
```

Standard shadcn/ui tooltip exports are `Tooltip` (not `TooltipRoot`). If `tooltip.tsx` was generated by 21st.dev with non-standard exports, this may work — but verify by checking `src/components/ui/tooltip.tsx` exports match what `TermTooltip` imports. If there's a mismatch, fix the import to use whatever names `tooltip.tsx` actually exports.

---

## Issue 10 — SectionCallout: No Icon, Blends Into Background

**Symptom:** The `SectionCallout` component (shown at the top of each tab) uses a plain `<Alert>` with very subtle styling (`border-crowe-indigo-dark/15 bg-crowe-indigo-dark/5`). On the light-background tool page, this callout nearly disappears — users often don't notice it.

**Root cause:** `src/components/education/SectionCallout.tsx` — the Alert has no icon, no left border accent, and very low contrast styling.

**Fix:** Add an iconsax icon to each callout and increase visual weight:

```tsx
import { InfoCircle } from 'iconsax-reactjs';

const ICONS = {
  sensitivity: Setting4,
  screening: ClipboardTick,
  simulation: Chart,
} as const;

export function SectionCallout({ tab }: SectionCalloutProps) {
  const { title, body, link } = CONTENT[tab];
  const Icon = ICONS[tab];

  return (
    <Alert className="mb-4 border-l-4 border-l-crowe-indigo-dark border-crowe-indigo-dark/15 bg-crowe-indigo-dark/5">
      <Icon variant="Linear" size={16} color="var(--crowe-indigo-dark)" />
      <AlertTitle className="text-foreground font-semibold">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground mt-1">
        {body}{' '}
        <Link href={link.href} className="text-crowe-amber hover:text-crowe-amber-bright transition-colors">
          {link.label}
        </Link>
      </AlertDescription>
    </Alert>
  );
}
```

---

## Execution Order

Work through issues in this order. Run `npm run build` after each one.

| # | File(s) | Risk | Time Estimate |
|---|---------|------|---------------|
| 4 | EmptyResultsState, EmptyScreeningState, EmptySimulationState | Low | 5 min |
| 5 | TierLegend.tsx | Low | 3 min |
| 6 | ScreeningProgressBar.tsx + globals.css | Low | 5 min |
| 1 | ResultsTable.tsx | Low | 5 min |
| 3 | tool/page.tsx (left panel width + rules grid) | Low | 5 min |
| 9 | TermTooltip.tsx (verify imports) | Low | 2 min |
| 10 | SectionCallout.tsx (add icon + border) | Low | 5 min |
| 8 | tool/page.tsx (promote Engine Docs to top tab) | Medium | 10 min |
| 7c | tool/page.tsx (tab-aware panel header) | Low | 5 min |
| 7d | tool/page.tsx (numbered tab triggers) | Low | 5 min |
| 2 | tool/page.tsx (tab-aware left panel) | Medium | 20 min |
| 7b | tool/page.tsx (next-step cross-tab CTAs) | Medium | 15 min |
| 7a | HowItWorksSection.tsx (three-tools narrative) | Medium | 20 min |

---

## Files Touched Summary

| File | Issues Addressed |
|------|-----------------|
| `src/components/states/EmptyResultsState.tsx` | Issue 4 |
| `src/components/states/EmptyScreeningState.tsx` | Issue 4 |
| `src/components/states/EmptySimulationState.tsx` | Issue 4 |
| `src/components/education/TierLegend.tsx` | Issue 5 |
| `src/components/screening/ScreeningProgressBar.tsx` | Issue 6 |
| `src/app/globals.css` | Issue 6 |
| `src/components/ResultsTable.tsx` | Issue 1 |
| `src/components/education/SectionCallout.tsx` | Issue 10 |
| `src/components/education/TermTooltip.tsx` | Issue 9 |
| `src/app/tool/page.tsx` | Issues 2, 3, 7b, 7c, 7d, 8 |
| `src/app/_components/landing/HowItWorksSection.tsx` | Issue 7a |

---

## What NOT to Touch

- `src/lib/screening/` — scoring engine is correct, do not alter
- `src/lib/simulation/` — simulation engine is correct, do not alter
- `CANONICAL_RULE_ORDER` — authoritative, never reorder
- `src/lib/__tests__/` — tests pass, don't break them
- `data/sdn.json` — synthetic dataset, do not modify
- `src/app/guide/` — user guide is separate, out of scope for this pass

---

## Done Criteria

The session is done when:
1. `npm run build` passes with zero TypeScript errors
2. All three empty state components use iconsax icons with no lucide-react import
3. The TierLegend shows dark-mode badge colors
4. The ResultsTable is centered (no dead space on the right on a 1440px display)
5. Switching to Screening Mode or Simulation tab either hides the Sensitivity Test form OR shows a tab-relevant panel on the left
6. Each tab trigger has a step number prefix (1/2/3)
7. After running a Sensitivity Test, a "Next: Try Screening Mode" prompt appears below results
8. The HowItWorks section describes all three tools, not just Sensitivity Test
