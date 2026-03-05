# Phase 11: Tool Layout + Explanations — Research

**Researched:** 2026-03-05
**Domain:** React two-panel layout, shadcn Tabs, TanStack Virtual table width fix, static engine documentation panel
**Confidence:** HIGH — all findings verified directly from codebase inspection

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAYOUT-01 | User can configure test parameters in a left panel while the right panel displays engine documentation | Two-panel flex layout; left panel fixed ~400px, right panel `flex-1`; both in a single `min-h-screen` wrapper |
| LAYOUT-02 | Right panel shows full engine explanation (all 10 rules, scoring methodology, dataset info) before a test is run | Static `EngineExplanationPanel` component; pre-run conditional rendering; content sourced directly from rule source files |
| LAYOUT-03 | Right panel switches to results table after running a test, with an Explanation tab to return to engine docs | shadcn Tabs (must be installed: `npx shadcn add tabs`); right panel renders `<Tabs>` after `rows.length > 0`; pre-run shows explanation directly |
| TABLE-01 | Results table rows extend to the right border of the table with no horizontal gap on the right side | Root cause confirmed: scroll container div has no explicit width, causing it to exceed 1050px table width; fix is to add `width: 1050px` to the scroll container or switch all column widths to percentages that sum to 100% |
| EXPL-01 | Right panel documents all 10 degradation rules with plain-English descriptions and how each transforms a name | Content verified from rule source files; all 10 rules understood; plain-English descriptions drafted in this document |
| EXPL-02 | Right panel explains how the synthetic SDN dataset is constructed, what entity types and regions mean, and how sampling works | Content verified from `sampler.ts`, `types/index.ts`; 285 entries, 4 entity types, 4 regions, Mulberry32 PRNG, with-replacement sampling |
| EXPL-03 | Right panel explains Jaro-Winkler scoring — what the score means, what catch rate represents, and how to interpret results | Content verified from `runTest.ts`, `constants.ts`, `resultsUtils.ts`; 0.85 threshold, `caught: boolean` on each row, `computeCatchRate()` |
</phase_requirements>

---

## Summary

Phase 11 is a layout restructuring + static content phase with one bug fix. The current tool page is a single-column centered layout (`max-w-2xl`). This phase introduces a two-panel side-by-side layout — left panel holds the existing configurator form, right panel holds either the engine explanation (pre-run) or the results table (post-run) with a tab to switch back to explanations. No new npm packages are required for the layout or explanation content. The only install needed is `shadcn add tabs` for LAYOUT-03.

The table width bug (TABLE-01) is fully understood from codebase inspection: the scroll container `<div>` has no explicit width, so it can grow wider than the 1050px table inside it, producing a right-side gap. The fix is a single inline style addition. The entire phase is pure UI — the server action, sampler, rules, and all `lib/` utilities remain completely unchanged.

The engine documentation content (EXPL-01 through EXPL-03) is sourced directly from the verified rule source files. Every rule description in this research was derived from reading the actual rule implementations — nothing is inferred. The planner can copy the content verbatim into the `EngineExplanationPanel` component.

**Primary recommendation:** Build the two-panel layout first (LAYOUT-01), then fix the table width bug (TABLE-01), then build the explanation panel content (EXPL-01/02/03), then wire the tab switch (LAYOUT-03). This ordering means the layout is verifiable at each step before adding content.

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| React | 19.2.3 | Two-panel state management (`useState` for post-run state) | Already installed |
| Tailwind v4 | ^4 | Panel layout with flexbox utilities | Already configured |
| shadcn Card | installed | Left panel cards (Entity Counts, Regions, Rules, Client Name) | Already in `src/components/ui/card.tsx` |

### Requires Installation

| Library | Install Command | Purpose | Why |
|---------|----------------|---------|-----|
| shadcn Tabs | `NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add tabs` | LAYOUT-03 tab switch between Results and Explanation | Not currently installed — confirmed by `ls src/components/ui/` showing no `tabs.tsx` |

### No New npm Packages

The layout, explanation content, and table fix need zero new npm dependencies. Tabs come via the shadcn CLI (copies owned code to `src/components/ui/tabs.tsx`).

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── app/
│   └── tool/
│       └── page.tsx              # Modified: two-panel layout wrapper
├── components/
│   ├── ui/
│   │   └── tabs.tsx              # NEW: added by `npx shadcn add tabs`
│   ├── ResultsTable.tsx          # Modified: scroll container width fix (TABLE-01)
│   └── EngineExplanationPanel.tsx  # NEW: static content panel (EXPL-01/02/03)
```

### Pattern 1: Two-Panel Layout in tool/page.tsx

**What:** The current `max-w-2xl` single-column layout becomes a full-width flex container. Left panel is fixed ~400px (matches current form card width). Right panel takes remaining space with `flex-1`.

**How to implement:** Replace the current outer `div` with a two-panel flex wrapper. Move the 4 Cards + submit button into a left panel div. Move the results/explanation area into a right panel div.

**Current structure (to replace):**
```tsx
// Current — single centered column
<div className="min-h-screen bg-page py-10">
  <div className="mx-auto max-w-2xl space-y-6 px-4">
    {/* 4 cards + button */}
  </div>
  {/* results full-width below */}
  {rows.length > 0 && (
    <div className="mx-auto max-w-screen-xl px-6 pt-6">
      <ResultsTable rows={rows} clientName={clientName} />
    </div>
  )}
</div>
```

**New structure (target):**
```tsx
// New — two-panel side-by-side
<div className="min-h-screen bg-page">
  <div className="flex h-screen overflow-hidden">
    {/* LEFT PANEL — fixed width, scrollable */}
    <div className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-border bg-page p-6 space-y-6">
      <h1 ...>OFAC Sensitivity Testing</h1>
      {/* 4 cards */}
      {/* Run button card */}
    </div>

    {/* RIGHT PANEL — flex-1, scrollable */}
    <div className="flex-1 overflow-y-auto p-6">
      {rows.length === 0
        ? <EngineExplanationPanel />
        : <RightPanelWithTabs rows={rows} clientName={clientName} />
      }
    </div>
  </div>
</div>
```

**When to use:** Always — the two-panel layout is the permanent structure for the tool page.

**Scroll strategy:** Both panels scroll independently (`overflow-y-auto` on each, container is `h-screen overflow-hidden`). This is correct for a tool/dashboard — left panel stays anchored while user scrolls results. The alternative (whole page scrolls) would cause the form to scroll away during result review.

### Pattern 2: Pre-Run vs. Post-Run Right Panel

**What:** The right panel conditionally renders either the explanation panel (pre-run, `rows.length === 0`) or a tabs component (post-run, `rows.length > 0`).

**State source:** The existing `result` state and derived `rows` array in `tool/page.tsx` are the source of truth. No new state needed.

```tsx
// Right panel content — conditional on rows presence
{rows.length === 0
  ? <EngineExplanationPanel />
  : (
    <Tabs defaultValue="results">
      <TabsList>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="explanation">Engine Docs</TabsTrigger>
      </TabsList>
      <TabsContent value="results">
        <ResultsTable rows={rows} clientName={clientName} />
      </TabsContent>
      <TabsContent value="explanation">
        <EngineExplanationPanel />
      </TabsContent>
    </Tabs>
  )
}
```

**When to use:** This is the LAYOUT-03 requirement implementation.

### Pattern 3: EngineExplanationPanel Component

**What:** A single static Server-safe component (no hooks, no `'use client'`) that renders all explanation content. Because `tool/page.tsx` is already `'use client'`, this component will be imported into a client context — but since it uses no hooks or browser APIs itself, it does not need `'use client'` and can remain a pure function component.

**File location:** `src/components/EngineExplanationPanel.tsx`

**Structure:**
```tsx
// No 'use client' needed — pure presentational
export function EngineExplanationPanel() {
  return (
    <div className="space-y-8">
      {/* Section 1: Dataset overview (EXPL-02) */}
      {/* Section 2: Scoring methodology + catch rate (EXPL-03) */}
      {/* Section 3: All 10 rules (EXPL-01) */}
    </div>
  );
}
```

### Pattern 4: TABLE-01 Width Bug Fix

**Root cause confirmed from codebase inspection:**

The scroll container `<div>` in `ResultsTable.tsx` has no explicit width — it takes whatever width its parent gives it. When the right panel is wider than 1050px, the scroll container grows to fill the available width while the `<table>` inside it stays at exactly `width: 1050px`. This creates a right gap equal to `(container width) - 1050px`.

Current code (lines 101-111 of `ResultsTable.tsx`):
```tsx
<div
  ref={parentRef}
  className="rounded-md border"
  style={{ height: '600px', overflowY: 'auto' }}  // NO width constraint
>
  <table style={{ tableLayout: 'fixed', width: '1050px', ... }}>
```

**Fix option A — Constrain scroll container to table width (recommended):**
```tsx
<div
  ref={parentRef}
  className="rounded-md border"
  style={{ height: '600px', overflowY: 'auto', width: '1050px', overflowX: 'auto' }}
>
```
This pins the scroll container to the table width. Adding `overflowX: 'auto'` provides horizontal scrolling if the right panel is narrower than 1050px. Lowest risk — no column recalculation needed.

**Fix option B — Percentage columns (more complex, don't use):**
Convert all 6 column widths in `COL_WIDTHS` to percentages of the table width, remove the fixed `width: '1050px'` from the table, and let the table fill 100% of the container. This requires recalculating 6 column percentage values and re-testing column alignment — higher risk for minimal gain.

**Recommendation: Use Fix A.** Single style change, zero column recalculation risk, adds horizontal scroll as a bonus for narrow viewports.

### Anti-Patterns to Avoid

- **Full-page scroll with stacked panels:** If the right panel content is below the form, the form scrolls away when results load. Users lose the form context. Use `h-screen + overflow-hidden` on the outer container + `overflow-y-auto` on each panel.
- **`'use client'` on EngineExplanationPanel:** It doesn't need it. Adding it unnecessarily increases the client bundle.
- **Hardcoding right panel height:** The right panel should be `flex-1 overflow-y-auto` — not a fixed `height`. The results table already has a fixed `600px` internal height; the panel should not also have a fixed outer height.
- **Passing rows as a prop to tool/page before they exist:** The `rows` derivation from `result` is already correct. Do not change the state management.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab switch between Results and Explanation | Custom toggle with divs + state | shadcn Tabs | Tabs handles ARIA roles, keyboard nav, and state; one install command |
| Table border radius with border | Manual `rounded` + `border` on table element | Scroll container `<div>` with `rounded-md border` (already the pattern) | Table element border-radius does not render correctly in all browsers |

---

## Common Pitfalls

### Pitfall 1: Tabs Not Installed — Build Error at Import

**What goes wrong:** Importing `@/components/ui/tabs` before running `npx shadcn add tabs` causes a module-not-found error at build time.

**How to avoid:** First task in the plan must be `npx shadcn add tabs`. Verify `src/components/ui/tabs.tsx` exists before any import is added.

**Warning signs:** TypeScript error `Cannot find module '@/components/ui/tabs'`

### Pitfall 2: Left Panel Width Causes Form Overflow

**What goes wrong:** If the left panel is set to `max-w-2xl` (672px) instead of a fixed narrower width, the two-panel layout leaves very little space for the right panel on typical 1440px screens.

**How to avoid:** Left panel width should be `w-[420px]` (fixed, `flex-shrink-0`). The existing 4 cards are designed for a ~400px container — they will lay out correctly at this width. The current `max-w-2xl` wrapper was only the single-column centering mechanism; in the two-panel layout it becomes the left panel and needs a fixed width.

**Verification:** At 1440px viewport, right panel should be at least 900px wide (enough for the 1050px table with horizontal scroll).

### Pitfall 3: TABLE-01 Fix Breaks Virtual Row Alignment

**What goes wrong:** Changing column widths in `COL_WIDTHS` while the table has `width: 1050px` causes misalignment between header `<th>` and data `<td>` cells, because absolutely-positioned rows resolve widths independently from the table width.

**How to avoid:** Fix A (constraining the scroll container to `width: 1050px`) requires NO changes to `COL_WIDTHS` or the table width. The column widths stay exactly as they are. Only the outer scroll container div gets `width: 1050px` added.

### Pitfall 4: h-screen Clips the Tool Footer

**What goes wrong:** Setting `h-screen overflow-hidden` on the two-panel wrapper will clip the slim footer in `tool/layout.tsx` — the footer will be behind the clipped area or force a scrollbar on the `html` element.

**How to avoid:** The `tool/layout.tsx` renders `{children}` then the footer in a fragment. If the page uses `h-screen` inside `{children}`, the footer appears below the full-height area, pushing it off-screen. Solution: include the footer inside the page component's `h-screen` layout (put it inside the page, not the layout), OR change the page to `min-h-screen` with normal document scroll, OR adjust `tool/layout.tsx` to wrap children + footer in a flex-col container.

The **simplest fix:** Keep `tool/layout.tsx` as-is and use `min-h-[calc(100vh-theme(spacing.X))]` on the panels to account for footer height. Alternatively, make the two panels use `calc(100vh - footerHeight)`.

**Recommendation:** Inspect the footer's pixel height (it's `py-4` + one line of text ≈ ~48px). Set panel height to `h-[calc(100vh-48px)]` on both panels. This is robust and explicit.

### Pitfall 5: EngineExplanationPanel Renders Inside Tabs Content With Wrong Padding

**What goes wrong:** `TabsContent` in shadcn has default padding. If `EngineExplanationPanel` also adds top padding, there will be double spacing at the top of the explanation tab.

**How to avoid:** `EngineExplanationPanel` should use `space-y-8` for internal section spacing but no outer `pt-*` padding. Let the `TabsContent` or the right panel container control the top padding.

---

## Engine Documentation Content

This section contains the verified, accurate content for EXPL-01, EXPL-02, and EXPL-03. The planner should reference these for EngineExplanationPanel implementation tasks.

### EXPL-02: Dataset Explanation (verified from sampler.ts, types/index.ts)

**What the dataset is:**
The engine tests against 285 synthetic SDN (Specially Designated Nationals) entries. These are fictitious names constructed to mirror real OFAC watchlist patterns — they are NOT real individuals, businesses, vessels, or aircraft. The dataset is static and lives at `data/sdn.json`.

**Entity types (4 types):**
- Individual — persons with multi-part given/family names
- Business — corporate entities (often with legal suffixes like CO, LTD)
- Vessel — ship and maritime entity names
- Aircraft — tail numbers and aviation registrations

**Linguistic regions (4 regions):**
- Arabic — names from Arabic-speaking countries; uses genealogical connectors (IBN, BIN, ABU) and nisba prefix (AL-)
- Chinese/CJK — names from Chinese, Japanese, Korean scripts; transliterated to uppercase Latin for processing
- Russian/Cyrillic — names from Russian and former Soviet states; transliterated to uppercase Latin
- Latin/European — Western European names

**How sampling works:**
The engine uses a Mulberry32 seeded PRNG (seed=42 in production) to sample entries from the filtered pool. Sampling is WITH replacement — the same entry can appear multiple times in a run. This is intentional: it ensures consistent test sizes even when the pool for a given entity type + region combination is small. The seed guarantees identical results for identical parameters across runs.

**How entity counts interact with regions:**
The engine filters the dataset to entries matching the selected regions, then samples from that filtered pool for each entity type. If you select 10 individuals but only Arabic region, you receive 10 individuals sampled from the Arabic-region individual pool only.

### EXPL-03: Scoring Methodology (verified from runTest.ts, constants.ts, resultsUtils.ts)

**The Jaro-Winkler similarity score:**
Each (original name, degraded variant) pair is scored using the Jaro-Winkler algorithm (via the `talisman` library). The score is a number from 0 to 1 where:
- 1.0 = identical strings
- 0.0 = completely dissimilar
- 0.85 = the catch threshold used in this tool

Jaro-Winkler is optimized for short strings and gives extra weight to matching characters at the beginning of strings. It is widely used in name matching and watchlist screening because it handles common real-world variations (typos, abbreviations, transliteration variants) better than edit-distance metrics.

**The catch threshold (0.85):**
A degraded variant with a Jaro-Winkler score above 0.85 against its original name is considered "caught" — meaning a screening system using this threshold would have flagged the degraded name as a match to the watchlist entry. This threshold is a standard in watchlist screening literature. It is a constant (`DEFAULT_CATCH_THRESHOLD = 0.85`) in `src/lib/constants.ts`.

**What the catch rate means:**
The catch rate (displayed as a percentage) is the fraction of all degraded variants that score above 0.85. A 97% catch rate means 97 out of 100 degraded names — even after being intentionally distorted by the selected rules — would still be flagged by a screening system using this threshold.

A high catch rate is GOOD — it means the screening system is robust to the selected name variations. A low catch rate signals a vulnerability in screening coverage for those rule types.

**Score column color coding:**
- Teal (`text-crowe-teal`) = caught (score > 0.85) — the degraded name would be flagged
- Coral (`text-crowe-coral`) = missed (score ≤ 0.85) — the degraded name would escape detection

### EXPL-01: All 10 Degradation Rules (verified from rule source files)

All descriptions below are derived directly from reading the rule implementation files.

| Rule ID | Label | Regions | What it does | Example |
|---------|-------|---------|-------------|---------|
| space-removal | Space Removal | All | Removes all spaces from the name | "AHMED ALI" → "AHMEDALI" |
| char-substitution | OCR/Leet Substitution | All | Replaces letters with visually similar characters (O→0, I→1, E→3, A→@, S→5, B→8, G→9, T→7) | "BILAL" → "81L@L" |
| diacritic | Diacritic Removal | Latin, Cyrillic | Strips accent marks using Unicode NFD decomposition (ä→a, ö→o, ü→u, é→e, ñ→n) | "MÜLLER" → "MULLER" |
| word-reorder | Word Reorder | All | Rotates name tokens left by one position — last name becomes first | "HASSAN ALI AL-RASHIDI" → "ALI AL-RASHIDI HASSAN" |
| abbreviation | Abbreviation (Vowel Drop) | Arabic, Cyrillic, Latin | Drops vowels from name tokens. Preserves Arabic genealogical connectors (IBN, BIN, ABU, UMM) and the AL- nisba prefix verbatim | "HASSAN IBN ALI" → "HSSN IBN L" |
| truncation | Truncation | All | Drops the last name token | "HASSAN IBN ALI AL-RASHIDI" → "HASSAN IBN ALI" |
| phonetic | Phonetic Variant | Arabic, Cyrillic | Substitutes a name token with an alternate transliteration. Covers common Arabic names (OSAMA→USAMAH, AHMAD→AHMED, KHALID→KHALED) and Russian names (ALEKSANDR→ALEKSANDER, DMITRY→DMITRI, MIKHAIL→MICHAEL) | "OSAMA BIN LADEN" → "USAMAH BIN LADEN" |
| punctuation | Punctuation Removal | All | Strips hyphens, periods, slashes, and all non-word non-space characters | "AL-NOOR TRADING CO." → "ALNOOR TRADING CO" |
| prefix-suffix | Prefix/Suffix Removal | All | Strips recognized honorific prefixes (DR, MR, SHEIKH, IMAM, HAJI) and suffixes (JR, SR, PHD, MD, II, III) | "DR CARLOS RODRIGUEZ JR" → "CARLOS RODRIGUEZ" |
| alias | Alias Substitution | Arabic only | Replaces the given name with a known spelling variant from an alias table. Covers MOHAMMED (→MOHAMAD), HUSSEIN (→HOSSEIN), ABDULLAH (→ABDALLAH), and others | "MOHAMMED ALI HASSAN" → "MOHAMAD ALI HASSAN" |

**Important notes for the panel:**
- Rules that return `null` for a given entry do not produce a result row. This is why some runs produce fewer rows than `entityCount × ruleCount × regionCount` would suggest.
- Each entry is tested against ALL selected rules independently — one entry can appear multiple times in the results table, once per applicable rule.
- Rules are applied in canonical order (space-removal → alias) regardless of checkbox order in the form.
- CJK region entries are only tested against rules that apply to all regions (space-removal, char-substitution, word-reorder, truncation, punctuation, prefix-suffix). Region-specific rules (diacritic, abbreviation, phonetic, alias) exclude CJK and return null for those entries.

---

## Code Examples

### Left Panel Layout Structure

```tsx
// tool/page.tsx — outer layout wrapper
<div className="bg-page h-[calc(100vh-48px)] flex">
  {/* LEFT PANEL */}
  <div className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-border p-6 space-y-6">
    <h1 className="text-2xl font-bold text-crowe-indigo-dark">OFAC Sensitivity Testing</h1>
    <p className="text-sm text-muted-foreground">Synthetic name degradation demo — Crowe AML Practice</p>
    {/* Card 1 — Entity Counts */}
    {/* Card 2 — Linguistic Regions */}
    {/* Card 3 — Degradation Rules */}
    {/* Card 4 — Client Name + Run Button */}
  </div>

  {/* RIGHT PANEL */}
  <div className="flex-1 overflow-y-auto p-6">
    {rows.length === 0
      ? <EngineExplanationPanel />
      : <RightPanelTabs rows={rows} clientName={clientName} />
    }
  </div>
</div>
```

### TABLE-01 Fix — Single Style Addition

```tsx
// ResultsTable.tsx — scroll container (lines 101-106)
// BEFORE:
<div
  ref={parentRef}
  className="rounded-md border"
  style={{ height: '600px', overflowY: 'auto' }}
>

// AFTER (add width: '1050px' and overflowX: 'auto'):
<div
  ref={parentRef}
  className="rounded-md border"
  style={{ height: '600px', overflowY: 'auto', width: '1050px', overflowX: 'auto' }}
>
```

Everything else in `ResultsTable.tsx` stays exactly the same. No column width changes needed.

### shadcn Tabs Usage (after `npx shadcn add tabs`)

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Right panel post-run
<Tabs defaultValue="results">
  <TabsList className="mb-4">
    <TabsTrigger value="results">Results</TabsTrigger>
    <TabsTrigger value="explanation">Engine Docs</TabsTrigger>
  </TabsList>
  <TabsContent value="results">
    <ResultsTable rows={rows} clientName={clientName} />
  </TabsContent>
  <TabsContent value="explanation">
    <EngineExplanationPanel />
  </TabsContent>
</Tabs>
```

### EngineExplanationPanel Structural Pattern

```tsx
// src/components/EngineExplanationPanel.tsx
// No 'use client' — pure presentational, no hooks

export function EngineExplanationPanel() {
  return (
    <div className="space-y-10 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-crowe-indigo-dark">Engine Documentation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How the OFAC sensitivity testing engine works
        </p>
      </div>

      {/* Dataset section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          About the Dataset
        </h3>
        {/* EXPL-02 content */}
      </section>

      {/* Scoring section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          How Scoring Works
        </h3>
        {/* EXPL-03 content — Jaro-Winkler, catch rate, 0.85 threshold */}
        {/* Catch-rate callout card — prominent, EXPL-03 primary goal */}
      </section>

      {/* Rules section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Degradation Rules
        </h3>
        {/* EXPL-01 content — all 10 rules */}
      </section>

    </div>
  );
}
```

### Catch-Rate Callout Card (prominent EXPL-03 treatment)

```tsx
// Inside the scoring section — makes "97% catch rate" immediately interpretable
<div className="rounded-xl bg-crowe-indigo-dark p-6 text-primary-foreground space-y-3">
  <p className="text-lg font-semibold">What does the catch rate mean?</p>
  <p className="text-sm text-white/80">
    A catch rate of <strong className="text-crowe-amber">97%</strong> means that 97 out of
    100 degraded name variants — after being intentionally distorted — would still score
    above the 85% match threshold and be flagged by your screening system.
  </p>
  <p className="text-sm text-white/80">
    A higher catch rate is better. A score near 100% means your screening engine is robust
    to these name variation patterns. A low catch rate signals a coverage gap worth
    investigating.
  </p>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact for This Phase |
|--------------|------------------|--------------|----------------------|
| Single-column centered form | Two-panel side-by-side | Phase 11 (this phase) | Standard tool/dashboard layout pattern |
| Results appear below form (stacked) | Results appear in right panel (side-by-side) | Phase 11 | User keeps form in view while reviewing results |
| No explanation — user guesses what rules do | Static explanation panel in right column | Phase 11 | Eliminates "what does this do?" questions during demos |

---

## Open Questions

1. **Footer height for panel height calculation**
   - What we know: `tool/layout.tsx` footer uses `py-4` + one line of `text-xs` text ≈ 40-48px total height
   - What's unclear: exact rendered height in pixels on different browsers
   - Recommendation: Use `h-[calc(100vh-48px)]` as the initial value; the planner can adjust after visual inspection. Alternatively, move the footer inside the page and remove it from `tool/layout.tsx` — this simplifies the height calculation to `h-screen`.

2. **Right panel minimum width for table**
   - What we know: The results table is 1050px wide with horizontal scroll if the container is narrower
   - What's unclear: Whether 1050px in the right panel at 1440px - 420px = 1020px viewport means horizontal scroll is always present
   - Recommendation: At 1440px viewport, right panel = ~972px (1440 - 420 - 48 for padding). With the Fix A table width of 1050px, a small horizontal scroll will exist. Either (a) accept the 30px scroll as a minor tradeoff — the table is already designed for horizontal scroll, or (b) reduce total column widths from 1050px to ~950px by trimming "Degraded Variant" from 300px to 200px. The planner should decide; either is acceptable.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vite.config.ts` (implied from `package.json` scripts) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYOUT-01 | Left panel renders all form controls | manual-only | visual inspection at /tool | N/A |
| LAYOUT-02 | Right panel shows explanation before run | manual-only | visual inspection — no rows state | N/A |
| LAYOUT-03 | Tab switch between results and explanation | manual-only | click test at /tool after running | N/A |
| TABLE-01 | No horizontal gap in results table | manual-only | run test, inspect table right edge | N/A |
| EXPL-01 | 10 rules displayed with correct descriptions | manual-only | visual inspection of explanation panel | N/A |
| EXPL-02 | Dataset explanation accurate | manual-only | verify numbers against source files | N/A |
| EXPL-03 | Scoring explanation accurate | manual-only | verify threshold value = 0.85 from constants.ts | N/A |

**Note:** All Phase 11 deliverables are UI layout and static content changes. None affect logic tested by the existing test suite (`src/lib/**/__tests__`). The existing unit and integration tests should continue to pass with no changes. Run `npm run test` after each plan to confirm no regressions.

### Sampling Rate

- **Per task commit:** `npm run test` (confirms no engine regressions)
- **Per wave merge:** `npm run test` + `next build` (confirms no TypeScript or build errors)
- **Phase gate:** Full suite green + visual inspection checklist complete before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all engine logic. No new test files needed for Phase 11 deliverables (all changes are layout and static content, not logic).

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `src/app/tool/page.tsx` — confirmed current layout structure, state management, `rows` derivation
- `src/components/ResultsTable.tsx` — confirmed `COL_WIDTHS` (1050px total), scroll container without explicit width, virtualizer `translateY` positioning pattern
- `src/lib/rules/space-removal.ts` — Rule 01 implementation verified
- `src/lib/rules/char-substitution.ts` — Rule 02 implementation + CHAR_MAP verified
- `src/lib/rules/diacritic.ts` — Rule 03 implementation + applicable regions (latin, cyrillic) verified
- `src/lib/rules/word-reorder.ts` — Rule 04 implementation (left-rotate by 1) verified
- `src/lib/rules/abbreviation.ts` — Rule 05 implementation + CONNECTORS + APPLICABLE set verified
- `src/lib/rules/truncation.ts` — Rule 06 implementation (drop last token) verified
- `src/lib/rules/phonetic.ts` — Rule 07 PHONETIC_MAP + applicable regions (arabic, cyrillic) verified
- `src/lib/rules/punctuation.ts` — Rule 08 implementation verified
- `src/lib/rules/prefix-suffix.ts` — Rule 09 PREFIXES + SUFFIXES sets verified
- `src/lib/rules/alias.ts` — Rule 10 ALIAS_MAP + applicable region (arabic only) verified
- `src/lib/rules/index.ts` — CANONICAL_RULE_ORDER, RULE_LABELS verified
- `src/lib/constants.ts` — `DEFAULT_CATCH_THRESHOLD = 0.85`, `MAX_ENTITY_COUNT = 500` verified
- `src/lib/sampler.ts` — Mulberry32 PRNG, seed=42, with-replacement sampling, entity+region filtering verified
- `src/lib/resultsUtils.ts` — `computeCatchRate()`, `caught` boolean usage verified
- `src/app/actions/runTest.ts` — Jaro-Winkler via talisman, `caught: similarityScore > DEFAULT_CATCH_THRESHOLD` verified
- `src/app/globals.css` — Crowe color tokens in `@theme inline` block, no `tabs` component present
- `src/components/ui/` directory listing — confirmed `tabs.tsx` does NOT exist; must be installed
- `src/app/tool/layout.tsx` — footer structure (`py-4`, slim footer) confirmed; metadata ownership confirmed
- `src/types/index.ts` — `Region`, `EntityType`, `SdnEntry`, `ResultRow`, `RunParams` interfaces verified
- `.planning/config.json` — `nyquist_validation: true` confirmed
- `package.json` — Next.js 16.1.6, React 19.2.3, Tailwind v4, no animejs, no iconsax confirmed

### Secondary (MEDIUM confidence)

- `.planning/research/SUMMARY.md` — v2.0 research: stack decisions, architecture patterns, pitfall inventory
- `.planning/research/PITFALLS.md` — all 11 pitfalls; pitfall 10 (virtual row translateY conflict) reconfirmed relevant; pitfall 4 (`metadata` on client component) confirmed already resolved by `tool/layout.tsx`
- `.planning/STATE.md` — confirmed Phase 10 complete; colgroup/position:absolute decision logged
- `.planning/REQUIREMENTS.md` — LAYOUT-01 through EXPL-03 requirements confirmed

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — verified from `package.json` and `src/components/ui/` directory listing
- Architecture (two-panel layout): HIGH — verified from reading `tool/page.tsx` current structure; CSS pattern is standard flexbox
- TABLE-01 Root Cause: HIGH — confirmed from `ResultsTable.tsx` line 103-106: no width on scroll container; table is `width: 1050px`
- Engine Content (EXPL-01/02/03): HIGH — every rule description derived by reading the rule source file directly, not from memory or inference
- Tabs install: HIGH — confirmed by absence of `tabs.tsx` in `src/components/ui/`
- Footer height: MEDIUM — estimated from class names; exact pixel height requires browser render

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack, no external API dependencies)
