# Architecture Patterns — v3.0 Screening Engine

**Domain:** OFAC screening engine — Screening Mode + Longitudinal Simulation Mode
**Researched:** 2026-03-06
**Confidence:** HIGH — based on direct codebase inspection plus verified external library and platform constraints.
**Supersedes:** Prior ARCHITECTURE.md dated 2026-03-05 (v2.0 Production Face milestone)

---

## Context: What Already Exists (v2.0)

```
src/app/
  layout.tsx                        ← slim indigo nav header (server component)
  page.tsx                          ← landing page (server component, animation shells)
  tool/
    page.tsx                        ← "use client" — two-panel layout, form state, useTransition
    layout.tsx                      ← tool route layout
  actions/
    runTest.ts                      ← "use server" — Zod validation, sampler, rules, JW scoring
  _components/
    landing/                        ← HeroSection, HowItWorks, FeatureStats, Footer (server)
    tool/                           ← EntityTypeTooltip, RuleInfoPopover, etc. ("use client")

src/components/
  ResultsTable.tsx                  ← "use client" — TanStack virtual, sort, CSV export
  EngineExplanationPanel.tsx        ← documentation panel
  ui/                               ← shadcn Button, Card, Checkbox, Input, Label, Tabs, etc.

src/lib/
  constants.ts                      ← DEFAULT_CATCH_THRESHOLD = 0.85, MAX_ENTITY_COUNT = 500
  rules/                            ← 10 pure-function rule modules + index.ts (ruleMap, CANONICAL_RULE_ORDER)
  sampler.ts                        ← Mulberry32 PRNG, seeded sampling
  formUtils.ts / resultsUtils.ts    ← form helpers, CSV builder

src/types/index.ts                  ← SdnEntry, ResultRow, RunParams, ActionResult, Region, EntityType
data/sdn.json                       ← 285 synthetic SDN entries (imported via @data/* alias)
```

The tool page uses `Tabs` (already installed from shadcn) to switch between Results and Engine Docs. v3.0 adds two new tabs — or new routes — to this surface. The decision is addressed in Question 1 below.

---

## System Overview — v3.0 Target

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                  Browser                                     │
│                                                                              │
│  "/" — Landing page (unchanged — Server Components + AnimationShells)       │
│                                                                              │
│  "/tool" — Tool (extended with 3 tabs: Sensitivity | Screening | Simulate)  │
│    ├── Tab: Sensitivity Test (existing — unchanged form + results table)     │
│    ├── Tab: Screening Mode                                                   │
│    │     ├── ScreeningInputPanel ("use client" — file/paste input)          │
│    │     ├── ScreeningResultsPanel ("use client" — tier table, detail card) │
│    │     └── ScreeningDashboard ("use client" — tier badges, FP/FN, CoM)   │
│    └── Tab: Longitudinal Simulation                                          │
│          ├── SimulationConfigPanel ("use client" — preset selector)         │
│          ├── SimulationChart ("use client" — Recharts multi-line)           │
│          └── WaterfallTable ("use client" — per-snapshot decomposition)     │
│                                                                              │
│  Shared components (used in both Screening + Simulation tabs):              │
│    ├── ThresholdSlider — shadcn Slider, debounced 200ms                     │
│    ├── CostOfMissCalculator — input + formula display                       │
│    └── TierBadge — EXACT/HIGH/MEDIUM/LOW/CLEAR color chip                  │
└──────────────────────────────────────────────────────────────────────────────┘
                    ↕ server action           ↕ Route Handler
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Next.js Server                                  │
│                                                                              │
│  app/actions/runTest.ts        ← UNCHANGED                                  │
│  app/actions/runScreening.ts   ← NEW "use server" — validates + runs engine │
│                                   Returns raw MatchResult[] (all scores)    │
│                                                                              │
│  app/api/pdf/route.ts          ← NEW Route Handler — PDF generation         │
│    (POST — accepts MatchResult[], threshold, clientName → returns PDF blob) │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Question 1: Route Structure

**Decision: Three tabs within `/tool`, NOT new routes `/screen` and `/simulate`.**

The existing `/tool/page.tsx` already uses `<Tabs>` from shadcn (imported and rendered). Adding two new `<TabsTrigger>` + `<TabsContent>` entries to the existing tab set is the lowest-friction integration. It requires no new route files, no changes to `layout.tsx`, and preserves navigation context — the consultant stays on `/tool` throughout a demo session, switching modes without page transitions.

**Why not `/screen` and `/simulate` routes:**
- New routes require new page files, new layouts, and a navigation mechanism (header links or sidebar). The existing header is minimal and not designed for multi-route navigation.
- The demo narrative flows between modes (run sensitivity → run screening → show simulation). Tab switching keeps all three accessible in one context without back/forward navigation.
- The existing Tabs component and its state are already managed in `tool/page.tsx`. Extending tab count is a 10-line change vs. a new route being a 50+ line new page.

**What changes in `tool/page.tsx`:**
- Add `TabsTrigger value="screening"` and `TabsTrigger value="simulation"` to the `<TabsList>`
- Add `TabsContent value="screening"` pointing to `<ScreeningMode />` component
- Add `TabsContent value="simulation"` pointing to `<SimulationMode />` component
- Rename existing tab trigger from `"results"` to `"sensitivity"` for clarity (cosmetic only)

**Tab labels:**
- "Sensitivity Test" (existing)
- "Screening Mode" (new)
- "Simulation" (new)

---

## Question 2: Screening Mode Data Flow

**Decision: New "use server" action `runScreening.ts`. No Web Workers. No API route handler for the computation itself.**

The data flow for Screening Mode is:

```
User uploads CSV / pastes names
  → Client parses text into string[] (fully client-side, no server round-trip)
  → Client calls runScreening(inputNames: string[], threshold: number)  ← server action
  → Server: normalize each input name (Unicode NFC + toUpperCase)
  → Server: for each (inputName × 285 sdnEntry) pair:
      - score_jw = jaroWinkler(inputName, sdnEntry.name)
      - score_dm = doubleMetaphoneMatch(inputName, sdnEntry.name) → 0 or 1
      - score_ts = tokenSortRatio(inputName, sdnEntry.name)
      - composite = max(score_jw, score_ts) boosted by dm_match
      - Record (inputName, sdnEntry, composite, winning_algorithm)
  → Server: keep only the best-scoring SDN match per input name
  → Server: return MatchResult[] — one record per input name (best match only)
  → Client stores MatchResult[] in useState
  → Client re-tiers using threshold: purely a filter on MatchResult[].composite_score
  → Threshold slider change → client re-tiers (no server round-trip, under 200ms)
```

**Why a server action and not a Web Worker:**
The official Next.js documentation notes that the `worker` script strategy is not yet stable and does not work with the App Router. Web Workers in Next.js require manual webpack configuration for worker bundles, which is fragile and poorly documented for App Router. The computation fits within the Vercel Hobby 10s timeout for the required input size (analysis in Question 3 and 4). Server action is the established pattern in this codebase.

**Why not an API Route Handler for the computation:**
API Route Handlers (`app/api/*/route.ts`) are appropriate for external HTTP clients and streaming. A server action is simpler for a same-origin Client → Server call with a typed return value. The existing `runTest.ts` uses a server action — keeping the same pattern reduces cognitive load.

**File parsing is client-side:**
CSV and plain text parsing happens in the browser before the server call. The server action receives `string[]` — a clean, uniform input regardless of whether the user uploaded a file or pasted names. This keeps the server action's validation boundary simple. Excel (.xlsx) parsing requires `xlsx` or `exceljs` on the client — the parsed output is also `string[]` passed to the server action.

**Return shape: best match per input name, not full matrix:**
The server returns one `MatchResult` per input name (the highest-scoring SDN entry). This keeps the response payload small. The full 2.85M comparison matrix is computed server-side and discarded — only the winning row per input name is returned.

---

## Question 3: Multi-Algorithm Scoring Engine

**Decision: New `src/lib/screeningScorer.ts` — composites JW + DM + Token Sort into one score per (input, sdn) pair.**

```
src/lib/screeningScorer.ts    ← NEW
src/lib/scorer.ts             ← NOTE: scorer.ts does not exist in current codebase;
                                 JW scoring is done inline in runTest.ts via talisman import.
                                 screeningScorer.ts follows the same inline pattern.
```

**Algorithm architecture:**

```typescript
// Pseudocode — not implementation, illustrates the scoring model
function scoreNamePair(input: string, candidate: string): ScoringResult {
  // 1. Normalize both (Unicode NFC + uppercase) — done before this function
  // 2. Jaro-Winkler (existing: talisman/metrics/jaro-winkler)
  const jw = jaroWinkler(input, candidate);
  // 3. Double Metaphone phonetic match (double-metaphone npm package)
  //    Returns 1.0 if primary codes match, 0.85 if secondary codes match, 0.0 otherwise
  const dm = doubleMetaphoneScore(input, candidate);
  // 4. Token Sort Ratio (fuzzball npm package — fuzz.token_sort_ratio / 100)
  const ts = tokenSortRatio(input, candidate);
  // 5. Composite: take maximum, with DM as a boost not a standalone score
  const composite = Math.max(jw, ts, dm > 0 ? jw * 1.05 : 0);
  const clampedComposite = Math.min(1.0, composite);
  // 6. Name-length penalty: names ≤6 chars escalate tier by 1 (apply at tier assignment, not here)
  // 7. Winning algorithm: whichever produced the highest individual score
  const winningAlgorithm = ... ;
  return { composite: clampedComposite, jw, dm, ts, winningAlgorithm };
}
```

**Library choices:**
- Jaro-Winkler: `talisman/metrics/jaro-winkler` — already installed and used in `runTest.ts`
- Double Metaphone: `double-metaphone` npm package (ESM, TypeScript typed, from the `words/` family — well-maintained). Note: this is a phonetic encoder, not a scorer. The score is derived by comparing the two-code output arrays.
- Token Sort Ratio: `fuzzball` npm package (JavaScript port of Python's thefuzz library). `fuzz.token_sort_ratio` sorts tokens alphabetically before comparing, catching word-order variations like "HUSSEIN SADDAM" vs "SADDAM HUSSEIN".

**Important caveat — Double Metaphone is English-optimized:**
Double Metaphone was designed for English and Romance language phonetics. It degrades gracefully for CJK and Arabic (returns empty codes → no phonetic boost, which is correct behavior). For the 285-entry synthetic dataset with Arabic, CJK, Cyrillic, and Latin names, DM will boost Latin matches and be neutral for non-Latin — this is the correct behavior for a real compliance tool.

---

## Question 4: Performance Analysis — 2.85M Comparisons

**Decision: Full matrix computation server-side is feasible for up to 10,000 inputs under the Vercel Hobby 10s timeout at a batch ceiling of approximately 3,500–5,000 names. Above that, the architecture needs adjustment.**

### Raw compute estimate

The existing `runTest.ts` handles 500 names × 10 rules = 5,000 JW comparisons in ~53ms (from PROJECT.md). That is approximately 94,000 JW operations/second on the Vercel server environment.

Scaling to Screening Mode:
- 3 algorithms instead of 1 — roughly 3× compute per pair
- At 3,500 input names × 285 SDN entries = 997,500 pairs × 3 = ~3M operations
- Estimated time: ~32 seconds at the same rate → **EXCEEDS 10s Hobby timeout**

Adjusted estimate (accounting for Double Metaphone being faster than JW for non-Latin and Token Sort being a simple sort + dice ratio):
- Effective operations/second for 3-algorithm composite: approximately 200,000–400,000/second
- At 2,000 inputs × 285 × 3 = 1.71M operations: ~4–9 seconds → borderline
- At 1,000 inputs × 285 × 3 = 855,000 operations: ~2–4 seconds → safe

**Concrete recommendation: cap server action input at 2,000 names per call, not 10,000.**

The 10,000 name limit is a UI feature, not a single server call limit. Architecture to make it work:

### Architecture for large lists: client-side batching

```
User uploads 8,000 names
  → Client splits into batches of 1,000
  → Client calls runScreening() 8 times in sequence (not parallel — avoid Vercel cold start cascade)
  → Client accumulates MatchResult[] across all batches
  → Client shows progress bar (batch N of M)
  → All 8,000 results available in client state for threshold slider re-tiering
```

This stays within the timeout on each call and handles the 10,000 name requirement without a streaming architecture or a paid Vercel plan.

### Client-side threshold slider re-tiering

After all batches complete, the client holds `MatchResult[]` in `useState`. Each entry has a `composite` score (0–1). The threshold slider moves a cutoff value in state. Re-tiering is a pure client-side `.map()`:

```typescript
// O(N) scan of stored results — no server round-trip
const tiered = results.map(r => ({
  ...r,
  tier: assignTier(r.composite, threshold, r.inputName.length <= 6)
}));
```

At 10,000 results, this `.map()` takes under 5ms in V8. The 200ms target is easily achievable.

### Memory ceiling

Each `MatchResult` object has approximately 15 fields. At 10,000 results × 500 bytes per object = ~5MB in client JavaScript heap. Modern browsers handle this without issue. The full 2.85M comparison matrix is **never** stored — only the best match per input name is returned from the server.

---

## Question 5: PDF Generation

**Decision: Client-side with jsPDF, triggered from a button in the Screening results panel. NOT a server-side Route Handler.**

**Why client-side:**
- jsPDF is designed for browser use. Server-side use requires the Node.js variant and careful import management. The client already has all the data needed for the PDF (MatchResult[] is in useState).
- No server round-trip needed — all PDF data is already in the browser.
- Simpler: `import('jspdf')` as a dynamic import (to avoid SSR issues) → call `doc.save()` → triggers browser download.
- Avoids adding a Route Handler and dealing with binary response headers in Next.js.

**Why not a Route Handler:**
A POST route handler at `app/api/pdf/route.ts` would require serializing all MatchResult[] data to JSON, sending it to the server, generating the PDF there, and streaming the binary response back. This is unnecessary round-trip complexity when jsPDF can do everything client-side.

**Implementation pattern:**

```typescript
// In ScreeningResultsPanel.tsx ("use client")
const handleExportPDF = async () => {
  const { jsPDF } = await import('jspdf');  // dynamic import — avoids SSR
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  // Crowe LLP header: indigo rectangle, Helvetica Now fallback (Arial), amber accent line
  // Match records table: jsPDF autoTable plugin
  // Sort by risk tier (EXACT first, CLEAR last)
  doc.save(`OFAC-Compliance-Memo-${clientName}-${date}.pdf`);
};
```

**Install:** `npm install jspdf jspdf-autotable`

The `jspdf-autotable` plugin is the standard companion for structured table output in jsPDF. It handles column widths, pagination, and row striping automatically.

---

## Question 6: Longitudinal Simulation — Where Does Computation Live?

**Decision: Fully client-side state machine in a custom hook `useSimulation`. No server action, no Web Worker.**

The simulation generates synthetic data — it does not query the SDN dataset, does not call external APIs, and does not depend on the 285 SDN entries except as a count reference. The entire computation is deterministic math over a configurable snapshot model.

**Why not a server action:**
The simulation produces hundreds of snapshots per run. Sending each snapshot to the server is unnecessary network overhead for purely synthetic computation. The data model is small (N snapshots × 285 entities × tier classification = well under 1MB at SURGE velocity for 60 snapshots).

**Why not a Web Worker:**
Web Worker support in Next.js App Router requires manual webpack configuration and is documented as unstable. The simulation math (iterating snapshots, applying evasion tier degradation probabilities, computing catch rates per threshold) runs in under 200ms client-side for any realistic snapshot count. It does not block the UI thread long enough to justify a Worker.

**Simulation state machine:**

```
useSimulation(preset: VelocityPreset, recalibrationSnapshot: number | null)
  → returns: SimulationSnapshot[], isRunning: boolean, reset()

SimulationSnapshot = {
  snapshotIndex: number,
  sdnAddCount: number,         // cumulative SDN entries added
  catchRate_075: number,       // catch rate at 0.75 threshold
  catchRate_085: number,       // catch rate at 0.85 threshold
  catchRate_095: number,       // catch rate at 0.95 threshold
  cumulativeMissCount: number, // absolute misses
  activeEvasionTier: 1 | 2 | 3,
  entities: EntitySnapshot[],  // per-entity tracking (tier1/2/3 variants)
}
```

The hook runs the state machine synchronously on `useEffect` when preset changes, stores the full snapshot array in state, and passes it to the chart component and waterfall table.

---

## Question 7: Shared Components

**Decision: Shared components live in `src/components/screening/` — NOT in `src/app/_components/tool/`.**

The `src/app/_components/tool/` convention (established in v2.0 ARCHITECTURE.md) is for tool-route-specific components. Components shared across two modes within the tool warrant their own directory at the `src/components/` level — this matches the existing pattern where `ResultsTable.tsx` and `EngineExplanationPanel.tsx` live in `src/components/`.

```
src/components/
  ResultsTable.tsx              ← UNCHANGED
  EngineExplanationPanel.tsx    ← UNCHANGED
  screening/                    ← NEW directory for v3.0 shared components
    ThresholdSlider.tsx         ← "use client" — shadcn Slider, debounced onChange
    TierBadge.tsx               ← "use client" or server — color chip (EXACT/HIGH/etc.)
    CostOfMissCalculator.tsx    ← "use client" — transaction value input + formula display
    MatchScoreBar.tsx           ← server or "use client" — visual score indicator
```

**ThresholdSlider:**
Uses `shadcn/ui` Slider component (install: `npx shadcn add slider`). The `onChange` must be debounced at 200ms — use `useMemo` + a debounce utility or the `use-debounce` npm package. Lifting the debounced threshold value into the parent component via a callback triggers the re-tiering `.map()` in Question 4.

**TierBadge:**
A pure display component — maps a `RiskTier` string to a background color and label. Can be a server component if used in server-rendered contexts, but since it will always be used within "use client" components (the results panels), it does not need to be constrained.

**CostOfMissCalculator:**
Stateful: holds `transactionValue` in local state, displays `transactionValue × 4.0`. Used in both Screening results panel and the Simulation sidebar. The `× 4.0` multiplier and compliance copy strings are constants imported from `src/lib/constants.ts` (add them there).

---

## Question 8: Compute Time — Realistic Estimate

**Based on existing measured performance (53ms for 5,000 JW ops) and scaling analysis.**

| Scenario | Inputs | Pairs | Algorithms | Est. Operations | Est. Time | Verdict |
|----------|--------|-------|-----------|----------------|-----------|---------|
| Small batch | 200 | 57,000 | 3 | 171,000 | ~1s | Safe |
| Medium batch | 1,000 | 285,000 | 3 | 855,000 | ~4s | Safe |
| Max recommended | 2,000 | 570,000 | 3 | 1.71M | ~8s | Borderline |
| Full 10K (single call) | 10,000 | 2.85M | 3 | 8.55M | ~40s | Exceeds timeout |

**The 10s timeout is the binding constraint.** The correct architecture is client-side batching (1,000 names per server action call). The UI shows a progress indicator ("Screening batch 3 of 10...").

**No streaming results needed.** Each batch completes in under 10s and returns its results. The client accumulates results in a ref during batching, then sets state once all batches are complete. This is simpler than streaming (which would require a Route Handler with `ReadableStream`, not a server action).

**Optimization available if needed:**
If benchmarking shows single-batch time exceeds 8s, the server action can short-circuit: for each input name, once a JW score > 0.97 is found, skip the remaining SDN entries for that input (an EXACT match cannot be beaten). This early-exit optimization can reduce effective comparisons by 20–40% for lists with many near-exact matches.

---

## Component Boundaries — Complete v3.0 Map

| Component | `"use client"` | New/Modified | Reason |
|-----------|---------------|-------------|--------|
| `app/tool/page.tsx` | Yes | MODIFIED | Add Screening + Simulation tab triggers/content |
| `ScreeningMode.tsx` | Yes | NEW | Top-level wrapper for screening tab |
| `ScreeningInputPanel.tsx` | Yes | NEW | File upload, paste textarea, submit button |
| `ScreeningResultsPanel.tsx` | Yes | NEW | Split-pane: tier list + detail card on click |
| `ScreeningDashboard.tsx` | Yes | NEW | Summary: tier breakdown, FP/FN counters |
| `SimulationMode.tsx` | Yes | NEW | Top-level wrapper for simulation tab |
| `SimulationConfigPanel.tsx` | Yes | NEW | Velocity preset picker, recalibration input |
| `SimulationChart.tsx` | Yes | NEW | Recharts LineChart with 3 threshold bands |
| `WaterfallTable.tsx` | Yes | NEW | Per-snapshot entity decomposition table |
| `ThresholdSlider.tsx` | Yes | NEW | shadcn Slider + 200ms debounce |
| `TierBadge.tsx` | No | NEW | Pure display, no state |
| `CostOfMissCalculator.tsx` | Yes | NEW | Local state for transaction value |
| `MatchScoreBar.tsx` | No | NEW | Pure display |
| `app/actions/runTest.ts` | N/A | UNCHANGED | Existing degradation test action |
| `app/actions/runScreening.ts` | N/A | NEW | Multi-algorithm screening action |
| `src/lib/screeningScorer.ts` | N/A | NEW | JW + DM + TokenSort composite scorer |
| `src/lib/screeningParser.ts` | N/A | NEW | CSV/paste text → string[] parser |
| `src/lib/simulationEngine.ts` | N/A | NEW | Snapshot generator (pure function) |
| `src/lib/constants.ts` | N/A | MODIFIED | Add tier thresholds, CoM multiplier, compliance copy |
| `src/types/index.ts` | N/A | MODIFIED | Add MatchResult, SimulationSnapshot, RiskTier |
| `ResultsTable.tsx` | Yes | UNCHANGED | Existing degradation results |
| `EngineExplanationPanel.tsx` | N/A | UNCHANGED | Existing engine docs |

---

## Data Flow — Complete v3.0

### Screening Mode Flow

```
User → ScreeningInputPanel (paste/upload names)
  → screeningParser.ts (client) → string[]
  → [batch 1 of N] runScreening(batch, threshold=0.85) → server action
  → screeningScorer.ts (server): normalize → JW + DM + TS per pair → best match per input
  → MatchResult[] returned to client
  → Client accumulates batches → setResults(allMatchResults)
  → ScreeningResultsPanel renders tier list (sorted by composite desc)
  → ScreeningDashboard renders tier breakdown + FP/FN counters
  → ThresholdSlider onChange (debounced 200ms) → client re-tiers in-memory results
  → User clicks row → detail card shows all 19 match schema fields
  → User clicks Export PDF → jsPDF (dynamic import) → browser download
```

### Longitudinal Simulation Flow

```
User → SimulationConfigPanel (picks preset: BASELINE/ELEVATED/SURGE)
  → useSimulation(preset, recalibrationAt) hook
  → simulationEngine.ts (pure function, synchronous, client-side)
     → generates SimulationSnapshot[] deterministically
  → SimulationChart receives snapshot array → Recharts renders
     - 3 threshold band lines (0.75, 0.85, 0.95)
     - catch rate primary Y-axis
     - cumulative miss bar overlay secondary Y-axis
     - vertical dashed evasion tier markers
     - recovery line after recalibration snapshot
  → WaterfallTable receives selected snapshot index → renders entity decomposition
  → ThresholdSlider changes → SimulationChart re-renders with updated band highlight
```

---

## New Files Required (Build Order)

```
Phase 1 — Types and constants foundation (prerequisite for everything)
  src/types/index.ts              MODIFY — add RiskTier, MatchResult, SimulationSnapshot
  src/lib/constants.ts            MODIFY — add TIER_THRESHOLDS, COST_OF_MISS_MULTIPLIER, compliance strings

Phase 2 — Core scoring library (prerequisite for server action)
  src/lib/screeningScorer.ts      NEW — JW + DM + TokenSort composite
  src/lib/screeningParser.ts      NEW — CSV/paste text to string[]
  src/lib/simulationEngine.ts     NEW — snapshot generator (pure function)

Phase 3 — Server action (prerequisite for Screening UI)
  src/app/actions/runScreening.ts NEW — Zod-validated, calls screeningScorer.ts

Phase 4 — Shared components (prerequisite for mode panels)
  src/components/screening/ThresholdSlider.tsx   NEW
  src/components/screening/TierBadge.tsx          NEW
  src/components/screening/CostOfMissCalculator.tsx NEW
  src/components/screening/MatchScoreBar.tsx       NEW

Phase 5 — Screening Mode UI (depends on Phase 3 + Phase 4)
  src/app/_components/tool/ScreeningMode.tsx       NEW
  src/app/_components/tool/ScreeningInputPanel.tsx NEW
  src/app/_components/tool/ScreeningResultsPanel.tsx NEW
  src/app/_components/tool/ScreeningDashboard.tsx  NEW

Phase 6 — Simulation Mode UI (depends on Phase 2 + Phase 4)
  src/app/_components/tool/SimulationMode.tsx      NEW
  src/app/_components/tool/SimulationConfigPanel.tsx NEW
  src/app/_components/tool/SimulationChart.tsx     NEW (install: npm install recharts)
  src/app/_components/tool/WaterfallTable.tsx      NEW
  src/lib/hooks/useSimulation.ts                   NEW

Phase 7 — Integration into tool/page.tsx
  src/app/tool/page.tsx           MODIFY — add 2 new TabsTrigger + TabsContent entries

Phase 8 — PDF export
  (jsPDF dynamic import inside ScreeningResultsPanel — no new file needed)
  npm install jspdf jspdf-autotable
```

---

## Integration Points — New vs Modified

### Modified (existing files touched)

| File | Change | Impact |
|------|--------|--------|
| `src/app/tool/page.tsx` | Add 2 tab triggers + content wrappers | Low — additive only, no existing logic changed |
| `src/types/index.ts` | Add `RiskTier`, `MatchResult`, `SimulationSnapshot` types | Low — additive, no existing types changed |
| `src/lib/constants.ts` | Add tier thresholds, CoM multiplier, compliance copy | Low — additive |

### New (no existing files changed)

All server action logic, scoring logic, simulation engine, shared components, and mode panels are new files. The existing `runTest.ts`, `sampler.ts`, `rules/`, and `ResultsTable.tsx` are untouched.

### Existing integration points that must be preserved

| Integration | Status | Risk |
|-------------|--------|------|
| `@data/sdn.json` tsconfig alias | Must remain — `runScreening.ts` imports same dataset | Low |
| `talisman/metrics/jaro-winkler` | Already installed — `screeningScorer.ts` reuses same import | Low |
| TanStack virtualizer explicit px widths | WaterfallTable may need TanStack Virtual — same constraint applies | Medium |
| Vitest test suite | New `screeningScorer.ts` and `simulationEngine.ts` are pure functions → easy to test | Low |
| Tailwind v4 `@theme` | No new tokens needed — existing Crowe palette covers all tier colors | Low |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Computing the Full 2.85M Matrix Client-Side

**What it looks like:** Passing the 285 SDN entries to the client and running the triple-algorithm scoring in the browser.

**Why it's wrong:** Downloads 285 SDN entries to the browser (minor), but more importantly, 2.85M string comparisons in the main JS thread will block rendering for 10–40 seconds. Web Workers would help but require fragile Next.js configuration (documented as unstable in App Router).

**Do this instead:** Run all comparisons server-side in the server action. Return only the best match per input name. Client-side threshold re-tiering is then O(N) on a small in-memory array.

### Anti-Pattern 2: Re-Running the Server Action on Every Threshold Slider Move

**What it looks like:** The threshold slider `onChange` handler calls `runScreening()` with the new threshold. The server recomputes everything.

**Why it's wrong:** At 200ms debounce, this means the user would wait 200ms + network latency + server compute time on every slider move. The 200ms target is for the full UI update, not just the debounce timer.

**Do this instead:** The server action returns raw scores. The threshold is applied client-side as a tier assignment function on the cached `MatchResult[]`. Slider moves never hit the server.

### Anti-Pattern 3: New Routes `/screen` and `/simulate`

**What it looks like:** Creating `src/app/screen/page.tsx` and `src/app/simulate/page.tsx`.

**Why it's wrong:** Requires nav changes to the global header (currently minimal), forces page transitions between modes during a demo, and splits related state that the consultant needs simultaneously (running a screening then immediately transitioning to cost-of-miss context).

**Do this instead:** Tabs within `/tool`. The existing `<Tabs>` component is already present and working.

### Anti-Pattern 4: Server-Side PDF Generation via Route Handler

**What it looks like:** Posting all MatchResult[] to `app/api/pdf/route.ts`, generating the PDF on the server, returning `application/pdf` binary.

**Why it's wrong:** Adds a Route Handler, binary response headers, and streaming complexity. The client already has all the data. jsPDF is designed for browser use and works cleanly with a dynamic import.

**Do this instead:** Dynamic import of jsPDF inside the "use client" results panel component. Call `doc.save()` directly.

### Anti-Pattern 5: useSimulation as a Heavy useEffect with Expensive Async Logic

**What it looks like:** `useSimulation` fires an async `useEffect` that awaits a server action to generate simulation snapshots.

**Why it's wrong:** The simulation is synthetic — it generates data algorithmically, not fetches it. The computation runs in under 200ms client-side. Involving the server adds unnecessary latency and complexity.

**Do this instead:** `simulationEngine.ts` is a pure function. `useSimulation` calls it synchronously in a `useMemo` keyed on the preset and recalibration inputs. No async, no server.

### Anti-Pattern 6: Installing a Separate Jaro-Winkler Package for Screening

**What it looks like:** `npm install jaro-winkler` alongside `talisman`.

**Why it's wrong:** `talisman/metrics/jaro-winkler` is already installed and verified (57+ passing tests depend on its output). Introducing a second JW implementation risks subtle scoring differences between the existing degradation test and the new screening engine, making the demo narrative inconsistent.

**Do this instead:** `screeningScorer.ts` imports `jaroWinkler` from `talisman/metrics/jaro-winkler` — the same import already in `runTest.ts`.

---

## New Dependencies Required

| Package | Purpose | Install |
|---------|---------|---------|
| `double-metaphone` | Phonetic encoding for DM algorithm | `npm install double-metaphone` |
| `fuzzball` | Token Sort Ratio algorithm | `npm install fuzzball` |
| `recharts` | Simulation catch rate chart | `npm install recharts` |
| `jspdf` | Client-side PDF generation | `npm install jspdf jspdf-autotable` |
| `use-debounce` | 200ms threshold slider debounce | `npm install use-debounce` |

Shadcn components to add:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn add slider
```
(Slider is used by ThresholdSlider. All other required shadcn components — Tabs, Badge — are already installed.)

---

## Sources

- Next.js App Router — Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Next.js — Web Worker script strategy (unstable in App Router): https://nextjs.org/docs/pages/guides/scripts
- Vercel Hobby plan function timeout (10s serverless, 60s Fluid Compute): https://vercel.com/docs/functions/limitations
- `double-metaphone` npm package (words/ family, ESM, TypeScript): https://www.npmjs.com/package/double-metaphone
- `fuzzball` npm package (JavaScript port of thefuzz, includes token_sort_ratio): https://www.npmjs.com/package/fuzzball
- jsPDF — client-side only by default, dynamic import required in Next.js: https://www.npmjs.com/package/jspdf
- Recharts — React chart library: https://recharts.org/en-US/
- Talisman — existing JW implementation: https://yomguithereal.github.io/talisman/

---

*Architecture research for: OFAC Sensitivity Testing Tool — v3.0 Screening Engine milestone*
*Researched: 2026-03-06*
*Supersedes: prior ARCHITECTURE.md dated 2026-03-05 (v2.0 Production Face)*
