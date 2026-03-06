# Pitfalls Research

**Domain:** Adding Screening Mode and Longitudinal Simulation Mode to an existing Next.js 16 App Router OFAC tool (v3.0 Screening Engine)
**Researched:** 2026-03-06
**Confidence:** HIGH — stack and constraints confirmed via direct codebase inspection (`package.json`, `ResultsTable.tsx`, `runTest.ts`, `types/index.ts`). Performance pitfalls confirmed via Vercel official limits docs, React performance community consensus, and Next.js GitHub issue tracker. Algorithm and PDF pitfalls confirmed from official library issue trackers and AML domain literature.

> **Context:** v2.0 shipped. The existing `/tool` page (Jaro-Winkler degradation demo) must not break. v3.0 adds two new modes — Screening Mode (CSV/Excel/paste input, 10,000 names, multi-algorithm, threshold slider, PDF export) and Longitudinal Simulation Mode (catch rate chart, evasion tier markers, waterfall table, detection lag). This document is scoped exclusively to v3.0 pitfalls — v2.0 pitfalls (Anime.js SSR, TanStack Virtual transforms, Iconsax sizing) are in the prior PITFALLS.md and remain applicable.

---

## Critical Pitfalls

---

### Pitfall 1: 2.85M Comparisons on the Server Action Thread — Vercel 10s Timeout

**What goes wrong:**
10,000 input names × 285 SDN entries × 3 algorithms = 2.85M string comparisons. If this runs synchronously inside a Next.js Server Action, it will exhaust the Vercel Hobby 10-second function timeout and return a 504. Unlike the existing degradation engine (worst case 500 names × 10 rules ≈ 53ms, all in-memory), the screening comparison count is three orders of magnitude larger and the inner loop calls three separate string distance functions.

**Why it happens:**
The existing `runTest` server action pattern works perfectly for its use case. Developers naturally reach for a new server action for the screening computation because the existing architecture uses server actions. The computation model does not translate: the degradation engine applies 10 predefined transforms to each sampled entry (bounded by dataset size, not user input), while screening is a full cross-product of user-provided input (up to 10,000) against all 285 SDN entries with expensive algorithm calls per pair.

**How to avoid:**
Move all screening computation to the browser. The 285-entry SDN dataset is small enough to ship as a static import in the client bundle (it is already imported in `runTest.ts`). The full 2.85M comparison loop with Jaro-Winkler + Double Metaphone + Token Sort runs in a dedicated Web Worker (`screening.worker.ts`) so the main thread is not blocked. The client posts the input array to the worker and receives results via `postMessage`. This eliminates server round-trips entirely and removes Vercel timeout as a concern.

Architecture decision:
- Ship `data/sdn.json` as a static import accessible to client components (it is already bundled via `@data/*` alias)
- Create `src/lib/workers/screening.worker.ts` — a standard Web Worker (not Node.js worker_threads)
- In the Screening Mode component, instantiate the worker with `new Worker(new URL(..., import.meta.url))` inside `useEffect`
- Use `comlink` (3KB) to wrap the worker for a clean TypeScript async API instead of raw `postMessage`/`onmessage`
- Progress reporting: worker posts incremental progress events back to the main thread every 5,000 comparisons for the progress bar

**Warning signs:**
- Server Action computation for 1,000 names × 285 SDN entries takes > 800ms in dev — extrapolating to 10,000 names will breach 10s in production
- Vercel function logs show `FUNCTION_INVOCATION_TIMEOUT` for screening requests
- The screening computation even briefly blocks `next/server` request processing for other concurrent users

**Phase to address:** Phase 15 (Architecture) — establish the client-side Web Worker model before writing any screening logic. This is an architecture-level decision, not an implementation detail.

---

### Pitfall 2: Pre-Computing All 2.85M Results in React State — Browser Memory Exhaustion

**What goes wrong:**
Storing all match results for 10,000 names × 285 SDN entries as a flat array in `useState` would produce approximately 2.85M `MatchResult` objects. Each object (19 fields per the required schema) consumes roughly 1–2KB serialized. The full result set approaches 3–6GB of heap memory — immediately crashing mobile browsers and causing significant slowdown on mid-tier laptops. Even at a more conservative estimate (only top matches stored), storing un-filtered results in state and re-filtering on threshold slider change triggers a full React re-render of a massive array on every slider move.

**Why it happens:**
The existing `ResultsTable` uses the same pattern: server action returns all rows, component stores them in state, virtualizer renders only the visible window. That works for the existing scale (max ~5,000 rows from 500 names × 10 rules). The mistake is assuming the same model scales to 2.85M rows.

**How to avoid:**
Store only the top match per input name (one `MatchResult` per input row = max 10,000 objects, not 2.85M). The Web Worker computes the best-scoring SDN match for each input name and posts back only the winner. Additional detail (second-best match, all algorithm scores) is computed on demand when the user clicks a row for the detail card, not pre-computed for all rows.

For the threshold slider: do not re-run matching on slider change. Store the raw match scores in state (just an array of `{ inputName, sdnMatch, score }`), derive the tier assignment in a `useMemo` that depends on `[results, threshold]`. Tier assignment is a simple comparison (`score >= HIGH_THRESHOLD ? 'HIGH' : ...`), not a 2.85M comparison loop. The `useMemo` runs in microseconds.

**Warning signs:**
- Browser DevTools Memory tab shows heap climbing to hundreds of MB after a screening run
- Chrome tab crashes with "Aw, Snap!" on 10,000-name inputs
- React DevTools profiler shows the entire component tree re-rendering on every threshold slider tick

**Phase to address:** Phase 15 (Architecture) — the "store only top match per input row" data model must be established before any screening state is written.

---

### Pitfall 3: Double Metaphone False Positives on Short Names and Non-Alpha Strings

**What goes wrong:**
Double Metaphone encodes phonetic similarities. For names of 3 characters or fewer, the algorithm produces the same phonetic code for many unrelated names (e.g., "Al", "Ali", "Eli", "Ola" all encode to similar or identical codes depending on the implementation). For strings containing numbers, punctuation, or codes (e.g., vessel IMO numbers like "9876543" or aircraft registration "N12345"), Double Metaphone returns a phonetic code based on the leading characters, producing absurd high-similarity scores between completely unrelated entries. The name-length penalty in the spec (names ≤6 chars escalate tier by 1) compounds this: a false positive from Double Metaphone on a short string gets its tier escalated further.

**Why it happens:**
Double Metaphone was designed for Anglo-American personal names. The algorithm has no concept of "this input is not a name." When applied to vessel names ("EVER GIVEN"), business entity codes, or numeric identifiers in the input list, it treats them as phonetic strings and produces meaningless similarity scores that may still be high enough to match.

**How to avoid:**
Apply algorithm selection logic before scoring rather than always running all three algorithms on every input:
- If the input string contains more than 20% numeric characters: skip Double Metaphone entirely, use Jaro-Winkler only
- If the input string is fewer than 4 characters: skip Double Metaphone (unreliable at short length), use Jaro-Winkler + Token Sort only
- If the input string matches an SDN entry's `entityType` of `vessel` or `aircraft`: skip Double Metaphone, use Token Sort Ratio as primary (vessel names are multi-word, Token Sort handles word-order variants better)
- Use Double Metaphone only for `individual` entity type matches where input appears to be a personal name (contains at least one space or is a single word of 5+ alpha characters)

The display field `match_algorithm` (required in the result schema) should reflect which algorithm actually determined the winning score, not assume all three always ran.

**Warning signs:**
- Vessel names like "EVER GIVEN 7" match SDN individual names like "EVER GIDEON" at HIGH tier purely from Double Metaphone numeric-prefix artifact
- Short inputs like "Ali" return multiple HIGH-tier SDN matches across completely different entity types
- False positive rate spikes dramatically when the input list contains corporate entity codes, account numbers, or registration identifiers mixed with personal names

**Phase to address:** Phase 16 (Multi-Algorithm Scoring Engine) — guard conditions must be built into the algorithm dispatch layer, not added later as hotfixes. The `match_algorithm` field output validates the guard is firing correctly.

---

### Pitfall 4: Token Sort Ratio Inflating Scores for Partial-Match Business Names

**What goes wrong:**
Token Sort Ratio sorts both strings alphabetically by token, then computes edit distance on the sorted result. This means "BANK OF IRAN" and "IRAN BANK INTERNATIONAL CORP" tokenize to ["BANK", "IRAN"] vs ["BANK", "CORP", "INTERNATIONAL", "IRAN"] and compute similarity on "BANK IRAN" vs "BANK CORP INTERNATIONAL IRAN". The edit distance between these sorted forms is artificially high (similar tokens dominate the score) even though the entities are different. In an OFAC screening context, this produces false positives where generic business name components ("BANK", "TRADING", "INTERNATIONAL", "GROUP") anchor high Token Sort scores across unrelated entities.

**Why it happens:**
Token Sort Ratio was designed to handle word-order variants of the same string (e.g., "Mohammed Ali Khan" vs "Khan Mohammed Ali"). When used on business names with common high-frequency tokens, the sort operation collapses multiple distinct entities toward the same canonical token sequence, making them appear more similar than they are.

**How to avoid:**
Apply a stop-token filter before Token Sort Ratio computation. Maintain a list of business entity stop tokens: `["BANK", "GROUP", "CORP", "LTD", "LLC", "INC", "TRADING", "INTERNATIONAL", "COMPANY", "CO", "AND", "OF", "THE"]`. Compute Token Sort Ratio on the token sequences with stop tokens removed. This preserves the word-order normalization benefit while preventing generic tokens from anchoring false similarities. If removing stop tokens reduces both strings to fewer than 2 tokens each, fall back to plain Jaro-Winkler.

Also: weight the final combined score. Do not average the three algorithm scores equally. Use Jaro-Winkler as the primary score (it is calibrated for name matching and is already the existing algorithm), with Double Metaphone and Token Sort as bonus contributors: `finalScore = JW * 0.6 + DM_bonus * 0.25 + TSR * 0.15`. This prevents any single algorithm's false positive from dominating the tier assignment.

**Warning signs:**
- Multiple unrelated SDN business entities matching "BANK OF [COUNTRY]" inputs at HIGH or MEDIUM tier
- Sorting the SDN dataset by Token Sort score for a business name input shows many HIGH-score matches that share only one common token with the input
- FP rate in test runs is significantly higher for `entityType: 'business'` than for `entityType: 'individual'`

**Phase to address:** Phase 16 (Multi-Algorithm Scoring Engine) — the weighted scoring formula and stop-token filter must be established at algorithm design time, not retrofitted.

---

### Pitfall 5: File Upload Bypassing Vercel 4.5MB Serverless Payload Limit

**What goes wrong:**
If CSV/Excel file upload is implemented as a `multipart/form-data` POST to a Next.js App Router route handler (`/api/screening/upload`), Vercel's serverless function payload limit (approximately 4.5MB for request body on the Hobby plan) truncates larger uploads silently or returns a 413. A 10,000-row CSV of names with metadata can easily exceed 4.5MB depending on column count and encoding.

**Why it happens:**
Developers default to server-side file parsing because `'use client'` components historically had limited file parsing capabilities. In the App Router era, client-side file parsing with the File API is fully capable and avoids the serverless payload ceiling entirely.

**How to avoid:**
Parse all uploaded files entirely on the client. The File API (`FileReader`, `File.text()`) is available in all modern browsers. Use:
- `papaparse` (7KB) for CSV parsing: streaming mode handles files up to multiple GB without browser memory issues; `worker: true` option parses on a Web Worker thread
- `xlsx` (SheetJS) for Excel `.xlsx` parsing: call `XLSX.read(arrayBuffer)` on the client; no server round-trip

The parsed name array (plain `string[]`) is passed to the screening Web Worker directly — nothing is sent to the server. This eliminates the upload size limit entirely. The 10MB limit in the MILESTONE-CONTEXT.md is a client-side guard (`if (file.size > 10_000_000) reject()`), not a server limit.

**Warning signs:**
- Files over 4.5MB return 413 on Vercel but succeed in local dev (local dev does not enforce Vercel payload limits)
- Large uploads silently truncate — parsed name count is lower than expected row count in the file
- Console shows `413 Request Entity Too Large` only in production, not in dev

**Phase to address:** Phase 17 (File Upload and Input Parsing) — establish client-side parsing as the architecture from the first line of code in that phase.

---

### Pitfall 6: PDF Generation Attempting Server-Side Rendering — Edge Runtime Incompatibility

**What goes wrong:**
Both `jsPDF` and `@react-pdf/renderer` (React-PDF) access browser APIs (`window`, `canvas`, font rendering) that do not exist in the Next.js edge runtime or serverless Node.js environment. Importing either library in a route handler or server action causes build failures or runtime crashes: `ReferenceError: window is not defined` (jsPDF) or `Error: Cannot read properties of undefined (reading 'createContext')` (React-PDF with canvas). The specific failure mode depends on the runtime, but the root cause is the same: both libraries are browser-only.

React-PDF has a documented history of breaking Next.js App Router route handlers (GitHub issues #2350, #2460, #2402 — all unresolved as of early 2026).

**Why it happens:**
PDF export feels like a "download endpoint" — developers naturally reach for a server route to generate and stream a PDF file. The pattern works in the Pages Router but breaks in App Router, especially with edge runtime functions.

**How to avoid:**
Generate the PDF entirely on the client. Use `jsPDF` with dynamic import and SSR disabled:

```typescript
// Inside the PDF export handler (called from a 'use client' component):
const { jsPDF } = await import('jspdf');
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
// ... build document programmatically ...
doc.save('ofac-compliance-memo.pdf');
```

Never import `jsPDF` at module level — always use dynamic import at call time. The `await import('jspdf')` defers the browser-dependent initialization until the handler runs in the browser.

For the Crowe LLP header and logo: embed the logo as a base64 data URI (`doc.addImage(base64Logo, 'PNG', x, y, w, h)`). Avoid `html2canvas` for content-to-PDF conversion — it is slow and produces blurry output for text-heavy compliance reports. Build the PDF programmatically using `jsPDF` drawing primitives.

For non-Latin characters (Arabic, Cyrillic, CJK) in output: `jsPDF`'s default font (Helvetica) does not support non-Latin scripts. Embed a Unicode font (NotoSans) as a base64-encoded `.ttf` string and register it: `doc.addFont(notoSansBase64, 'NotoSans', 'normal')`. Without this, Arabic and CJK names in the PDF output render as empty boxes or question marks.

**Warning signs:**
- `next build` succeeds but PDF download crashes with `ReferenceError: window is not defined` at runtime when the route handler runs
- PDF renders correctly in dev but crashes on Vercel (edge runtime vs. local Node.js difference)
- Arabic or CJK names in the compliance memo show as `?` characters or blank boxes in the exported PDF

**Phase to address:** Phase 20 (PDF Export) — dynamic import pattern and Unicode font embedding must be established as prerequisites before writing any PDF document structure.

---

### Pitfall 7: Threshold Slider Triggering Full Result Re-Render on Every Tick

**What goes wrong:**
The threshold slider moves continuously (mouse drag). If the slider's `onChange` directly updates a piece of React state that the entire results table depends on (e.g., `setThreshold(value)`) and the results table renders 10,000 rows filtered by that threshold, every slider tick triggers a full re-render pass on 10,000 rows. At 200ms target responsiveness, a debounce of 300ms would feel sluggish. At 0ms debounce, it destroys frame rate. React's batching and `useMemo` reduce but do not eliminate this.

**Why it happens:**
The slider is tied to state, state drives a computed display list, the computed list renders into a component — this is the standard React data flow. The problem is that "computed display list" is O(n) on 10,000 rows, and the virtualizer's `getVirtualItems()` call must also recalculate on every re-render.

**How to avoid:**
Separate the threshold value from the threshold-applied display. Store two pieces of state:
1. `sliderValue` (number) — updates on every tick, drives only the slider display and the threshold label
2. `displayThreshold` (number) — updated via `useTransition` or debounce at 150ms intervals, drives tier derivation

Use `useDeferredValue` on the display threshold: `const deferredThreshold = useDeferredValue(displayThreshold)`. The tier-derivation `useMemo` depends on `deferredThreshold`, not the raw `sliderValue`. React schedules the expensive `useMemo` recalculation as a deferred low-priority update, keeping the slider thumb movement at 60fps while tier re-classification runs asynchronously.

Additionally, tier derivation does not need the full result array — it needs only the scores. Store results as `{ inputName: string, score: number }[]` (compact) and derive tier badges in the render, not in a pre-classified array. The virtualizer only renders ~15 visible rows at any time, so per-row tier badge computation is negligible even for 10,000 rows.

**Warning signs:**
- Slider thumb lags visibly behind mouse cursor during drag
- React DevTools profiler shows full `ScreeningResultsTable` component re-rendering every 16ms during slider drag
- Frame rate drops below 30fps when dragging the slider with 10,000+ results loaded

**Phase to address:** Phase 18 (Threshold Slider and Results Display) — the `useDeferredValue` + compact results store architecture must be established before the first slider render.

---

### Pitfall 8: TanStack Virtual Column Width Breaks with New Result Layout

**What goes wrong:**
The existing `ResultsTable` uses hardcoded pixel widths (`COL_WIDTHS = [260, 110, 130, 300, 160, 90]`) for the virtualizer's absolute-positioned rows. The v3.0 Screening Mode results table has a different schema (19 fields, not 6) and a different layout (split-pane with a detail card on row click, not a full-width table). Reusing the existing `ResultsTable` component for Screening Mode results — or trying to extend the existing `COL_WIDTHS` constant — will produce column misalignment because the new schema requires different column distribution.

**Why it happens:**
The `COL_WIDTHS` constraint is documented in the existing codebase (`src/components/ResultsTable.tsx` lines 31–39: "Explicit pixel widths are required for correct alignment when tbody rows are absolutely positioned"). Developers adding columns to the existing table change the column count without updating the total table width and the corresponding container `style={{ width: 'Xpx' }}`.

**How to avoid:**
Build `ScreeningResultsTable` as a completely separate component from the existing `ResultsTable`. The existing table serves the degradation demo mode and must remain unchanged. The new table has different columns, different row interaction (clickable for detail card), and a different outer container width constraint. Keeping them separate also isolates their respective virtualizer instances from interfering with each other.

For the Screening Mode table: the left pane shows 5 columns (Row#, Input Name, Best Match, Score, Risk Tier) at a fixed total width. The right pane is a detail card that renders outside the virtualizer entirely. Five columns at reasonable widths fit in a ~900px left pane.

**Warning signs:**
- After adding a new column to an existing virtualizer table, headers and data are offset (header column 3 is over data column 4)
- Modifying `COL_WIDTHS` without updating the container `style={{ width }}` causes scroll overflow or compressed columns
- The existing degradation results table breaks (visual regression) after changes made for the new screening table

**Phase to address:** Phase 18 (Threshold Slider and Results Display) — create `ScreeningResultsTable` as a new file from the start, not a modified fork of `ResultsTable.tsx`.

---

### Pitfall 9: Recharts Dual-Axis Chart SSR Hydration Mismatch and Resize Breakage

**What goes wrong:**
The Longitudinal Simulation chart requires 5 elements: catch rate line, 3 threshold band lines, evasion tier vertical markers, cumulative miss count bars on a secondary Y-axis, and a recovery line. Recharts is a common choice but has two confirmed failure modes in this configuration:

1. **SSR hydration mismatch:** Recharts' `ResponsiveContainer` measures the DOM at paint time to determine chart dimensions. When Next.js server-renders the chart, it renders at a default dimension that does not match what the browser computes during hydration, producing React hydration errors. The standard fix is `dynamic(() => import('./Chart'), { ssr: false })` — but this must be called from a `'use client'` file (Pitfall 8 from v2.0 applies here too).

2. **Dual Y-axis synchronization:** The secondary Y-axis (cumulative miss count, absolute numbers 0–N) and the primary Y-axis (catch rate, 0–100%) use completely different scales. Recharts does support `<YAxis yAxisId="left">` and `<YAxis yAxisId="right" orientation="right">`, but the domain computation for the right axis does not automatically track the data maximum — `domain={[0, 'dataMax']}` must be set explicitly on the right `YAxis` or Recharts defaults to `[0, 1]` and renders all bars at the same tiny height.

3. **Chart resize on pane resize:** If the chart lives in a resizable split pane, `ResponsiveContainer` may not detect resize events from CSS flexbox changes. Add `key={containerWidth}` to force a complete chart remount on explicit container width changes.

**Why it happens:**
Recharts is the most commonly recommended React charting library and most Next.js examples show it working. The SSR issue only surfaces in App Router with actual pre-rendering. The dual-axis domain issue only appears when the secondary data range is very different from `[0, 1]`, which is the Recharts default.

**How to avoid:**
Always lazy-load the chart component with `dynamic(..., { ssr: false })` from a `'use client'` wrapper. Set explicit `domain` props on both Y-axes. Test the dual axis in isolation with mock data before integrating the full simulation data.

Consider Chart.js via `react-chartjs-2` as an alternative if the Recharts dual-axis implementation proves problematic — Chart.js has explicit multi-axis support that is more straightforward to configure. However, Chart.js also requires `ssr: false` and has its own canvas-based rendering constraints. The choice between Recharts and Chart.js is implementation-level; the ssr:false requirement is the same for both.

**Warning signs:**
- Hydration error in browser console: "Text content does not match server-rendered HTML" on the chart container
- Secondary Y-axis bars all render at the same height regardless of data values
- Chart does not resize when the browser window is resized (stuck at initial render dimensions)
- In React Strict Mode dev, the chart flickers on initial mount due to double-invocation

**Phase to address:** Phase 22 (Longitudinal Simulation Mode) — the `ssr: false` wrapper and dual-axis domain configuration must be established before adding the 5 chart series.

---

### Pitfall 10: Longitudinal Simulation Evasion Tier Sequencing Bug — Tier 2 Before Tier 1 Complete

**What goes wrong:**
The simulation state machine introduces evasion tiers sequentially across snapshots. Tier 1 starts at snapshot 0. Tier 2 is introduced at some configurable snapshot offset. If the offset calculation does not account for the velocity preset, Tier 2 can become active before all Tier 1 entries have been fully processed (all their variants scored). This produces a data model inconsistency: entity records exist in the `evasion_tier_variants` object for Tier 2 but have no `first_caught_snapshot` in Tier 1, breaking the detection lag calculation (which requires Tier 1 to be fully resolved before Tier 2 lag is computed).

**Why it happens:**
The velocity presets (BASELINE: 15 entries/update, ELEVATED: 75 entries/update, SURGE: 300 entries/update) control how many new SDN entries appear per snapshot. The evasion tier offsets are likely specified as snapshot indices (e.g., "introduce Tier 2 at snapshot 10"). But SURGE runs through 10 snapshots much faster than BASELINE — snapshot 10 in SURGE represents 3,000 cumulative SDN entries added, while snapshot 10 in BASELINE represents only 150 entries. If the Tier 2 introduction is hard-coded at "snapshot 10," the behavior is velocity-dependent in a way that undermines the narrative.

**How to avoid:**
Specify evasion tier introduction by percentage of total entities processed, not by absolute snapshot index. For example: Tier 2 activates when ≥ 60% of the entry set has been through at least one screening cycle. This ensures that Tier 2 is introduced at a meaningfully consistent point relative to data volume regardless of velocity preset.

Additionally: validate the state machine invariant in the simulation engine — before marking a snapshot as "Tier 2 active," assert that every entity that existed in the previous snapshot has a defined `first_caught_snapshot` or has been explicitly marked as "never caught by Tier 1." This assertion runs in development only and is stripped in production.

Detection lag edge case: if an entity is never caught (score never breaches any threshold across all snapshots), `first_caught_snapshot` will be `null`. The detection lag metric must handle this explicitly: `null` translates to "not detected — enhanced due diligence flag" in the UI copy, never to a computed number of days.

**Warning signs:**
- Detection lag metric shows negative values (caught before the entity was formally added to the SDN list)
- Tier 2 entries appear in the waterfall table for snapshots before the Tier 2 marker line on the chart
- `first_caught_snapshot > first_missed_snapshot` for entities that should have been caught immediately
- Changing velocity preset changes which snapshot the evasion tiers appear on the chart (velocity-coupling bug)

**Phase to address:** Phase 22 (Longitudinal Simulation Mode) — the snapshot state machine data model must be fully designed with invariant assertions before writing any rendering code.

---

### Pitfall 11: Breaking the Existing `/tool` Degradation Mode When Adding New Routes

**What goes wrong:**
v3.0 adds new routes (`/tool/screening`, `/tool/simulation`) and new shared utilities. Adding a new shared utility file to `src/lib/` that accidentally re-exports a symbol with the same name as an existing export will break the existing engine. Adding a new server action to `src/app/actions/` that imports SDN data with a different transformation (e.g., normalizing all names to uppercase for screening) will not break the existing `runTest.ts` server action, but if the developer modifies the shared `sampler.ts` to support screening's different sampling logic, it can silently change the behavior of the existing degradation demo.

**Why it happens:**
The natural instinct is to extend existing utilities. `sampler.ts` already samples from `sdn.json` — why not extend it for screening? But the degradation demo sampler does random sampling for a demonstration scenario, while the screening engine needs a full-dataset lookup, not a sample. These are fundamentally different operations. Merging them into one function with a flag parameter creates an untestable conditional mess and risks changing the existing behavior.

**How to avoid:**
Strict isolation: all v3.0 code lives in new files. Do not modify existing files unless fixing a confirmed bug:
- `src/lib/screening/` — new directory for all screening logic (scorer, parser, tier calculator)
- `src/lib/simulation/` — new directory for all longitudinal simulation logic
- `src/app/actions/runScreening.ts` — new server action file (even if it ultimately becomes client-side)
- `src/types/screening.ts` — new types file for v3.0 schemas; do not add v3.0 types to `src/types/index.ts`
- `src/components/ScreeningResultsTable.tsx` — new component; do not modify `ResultsTable.tsx`

Run the full Vitest suite after every new file is added. The existing 57+ tests must remain green throughout v3.0 development. A regression in an existing test from a v3.0 addition indicates an isolation violation.

**Warning signs:**
- An existing Vitest test fails after adding a new v3.0 utility file
- `import { sampleEntries } from '@/lib/sampler'` in the existing `runTest.ts` behaves differently after a screening-motivated change to `sampler.ts`
- The existing `/tool` degradation mode shows different results than before v3.0 development began

**Phase to address:** Phase 15 (Architecture) — establish the directory isolation structure before writing any v3.0 feature code.

---

### Pitfall 12: Unicode Normalization Applied After Algorithm Scoring — Misses Homoglyph Evasion

**What goes wrong:**
The MILESTONE-CONTEXT.md specifies "Unicode normalization pre-processing (catches Cyrillic/Arabic homoglyph substitution — the biggest real-world evasion)." If Unicode normalization (Unicode NFC/NFD form, homoglyph mapping, Cyrillic→Latin lookalike substitution) is applied only to the display layer or only after scoring, the algorithms receive the raw homoglyph-containing string and produce low similarity scores. The tier correctly shows LOW or CLEAR for what is actually an EXACT match, because "Рobert" (Cyrillic Р + Latin obert) and "Robert" look identical in the UI but produce very low algorithmic similarity before normalization.

**Why it happens:**
Developers implement normalization as a sanitization step before storing or displaying the input, not as a pre-processing step in the comparison pipeline. The normalization logic and the scoring logic live in different parts of the codebase and the data flow does not guarantee that normalized forms reach the scorer.

**How to avoid:**
Apply normalization as the first operation inside the comparison function, not before or after it. The pattern:
```
compareNames(raw_input, sdn_name):
  1. normalize(raw_input) → normalized_input
  2. normalize(sdn_name) → normalized_sdn
  3. score(normalized_input, normalized_sdn)
  4. return { score, normalized_input, transformation_detected: raw_input !== normalized_input }
```

The `transformation_detected` field in the result schema is populated by whether normalization changed the input — this is the flag that signals "Cyrillic homoglyph detected" or "diacritic substitution detected" in the compliance output.

The normalization function must handle at minimum: NFC normalization (`String.prototype.normalize('NFC')`), homoglyph lookalike mapping (Cyrillic lookalikes for Latin letters — а→a, е→e, о→o, р→p, с→c, х→x, etc.), and Unicode case folding (not just `.toLowerCase()` — Arabic and CJK have non-trivial case semantics).

**Warning signs:**
- A name containing Cyrillic homoglyphs of Latin letters scores as CLEAR against its exact Latin equivalent
- The `transformation_detected` field is always empty/null even for inputs known to contain non-Latin lookalikes
- Running the tool against a name with copy-pasted Cyrillic characters that look Latin produces no match, while the manually typed version matches at EXACT

**Phase to address:** Phase 16 (Multi-Algorithm Scoring Engine) — normalization must be the first component built and tested in isolation before any scoring logic is written.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Run screening comparison in a Server Action instead of Web Worker | Familiar architecture (mirrors existing runTest.ts) | Hits Vercel 10s timeout above ~1,000 input names; blocks deployment scalability | Never for inputs > 200 names |
| Store all 2.85M comparison results in state | No result is ever "missing" on threshold change | Browser memory exhaustion; tab crash on mobile; 3-6GB heap for 10,000 inputs | Never — store only top match per input row |
| Reuse `ResultsTable.tsx` for Screening Mode results | Less new code | COL_WIDTHS breaks with different column count; existing tests risk regression; virtualizer instance interference | Never — build `ScreeningResultsTable` as a new file |
| Add v3.0 types to `src/types/index.ts` | Single types import | 19-field `MatchResult` type pollutes the v1.0/v2.0 type contract; downstream TypeScript inference widens on existing types | Never — use `src/types/screening.ts` for new types |
| Extend `sampler.ts` with screening logic | One fewer file | Screening uses full-dataset lookup (no sampling); degradation uses random sample; mixing them creates a conditional mess and risks changing existing behavior | Never — create `src/lib/screening/` directory |
| Import `jsPDF` or `@react-pdf/renderer` at module level | Simple import syntax | Crashes `next build` or produces runtime error in SSR context | Never — always use dynamic import inside the event handler |
| Apply Unicode normalization only in the display layer | Inputs look clean in UI | Homoglyph-containing strings still score as non-matching; the biggest real evasion tactic is undetected | Never — normalization must be part of the comparison pipeline |
| Hard-code evasion tier introduction at snapshot index rather than data percentage | Simpler state machine | Tier introduction is velocity-dependent; SURGE scenario introduces Tier 2 in <1 day of simulated time, breaking the narrative | Never for the velocity-sensitive tiers |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `comlink` + Web Worker + Next.js bundler | Worker file not recognized by Next.js webpack config | Use `new Worker(new URL('./screening.worker.ts', import.meta.url))` — Next.js 13+ handles this natively with webpack 5's worker support |
| `papaparse` + Web Worker option in Next.js | `worker: true` option opens its own Worker which conflicts with the wrapping Comlink worker | Use `papaparse` with `worker: false` but call it from inside the screening Web Worker, not the main thread |
| `xlsx` (SheetJS) + large `.xlsx` files in the browser | Sync `XLSX.read()` blocks the main thread for large files | Call `XLSX.read(arrayBuffer, { type: 'array' })` from inside the screening Web Worker, not the main thread |
| `jsPDF` + dynamic import + TypeScript | `import type { jsPDF }` fails because the type and the value have the same name | Use `const { jsPDF } = await import('jspdf'); const doc = new jsPDF(...)` — import the class from the default export, not as a named type |
| `jsPDF` + Arabic/Cyrillic/CJK characters | Default Helvetica font in jsPDF is Latin-only | Register NotoSans or similar Unicode font as base64-embedded TTF before calling `doc.text()` with non-Latin content |
| Recharts `ResponsiveContainer` + Next.js App Router | Server renders chart at wrong dimensions → hydration mismatch | Wrap chart in `dynamic(() => import('./ChartComponent'), { ssr: false })` inside a `'use client'` file |
| Recharts dual Y-axis + `dataMax` | Right axis defaults to `[0, 1]` domain, squishing cumulative miss bars | Set `domain={[0, 'dataMax']}` explicitly on the right `YAxis` component |
| Vitest + new packages with ESM-only exports | `SyntaxError: Cannot use import statement outside a module` in test runner | Add new ESM-only packages to `vitest.config.ts` `server.deps.inline` array to force Vite to transform them |
| Crowe TLS proxy + `npm install papaparse xlsx jspdf` | SSL certificate error blocks install | Prefix all `npm install` and `npx` commands with `NODE_TLS_REJECT_UNAUTHORIZED=0` (same as v1.0/v2.0) |
| TanStack Virtual + Screening results detail card pane | Clicking a virtual row triggers a re-render that changes the container layout, causing virtualizer recalculation on every row click | Keep the detail card as an absolutely-positioned overlay or a fixed right pane outside the scroll container — do not let it resize the virtualizer's scroll parent |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| All 2.85M comparisons in the main JS thread | Tab freezes for 10–30 seconds after "Run Screening"; browser shows "Page Unresponsive" | Web Worker for all comparison computation; progress events every 5,000 comparisons | Above ~500 input names on mid-tier laptop |
| `useMemo` for tier derivation depending on full result array | 10,000-row `useMemo` recalculates on every parent component re-render | Memoize correctly: `useMemo(() => deriveThreshold(results, threshold), [results, threshold])`; avoid adding unrelated dependencies | Immediately when the parent component has other state (e.g., slider position) |
| Recharts tooltip rendering with 300+ data points per series | Tooltip computation on hover causes jank; Recharts calculates nearest point across all series on every mouse move | Limit displayed data points to ~100 per series; aggregate intermediate snapshots before rendering | >200 snapshots on the longitudinal chart x-axis |
| Full waterfall table rendered for all snapshots simultaneously | 300 snapshots × 285 entities = 85,500 rows — same memory problem as unvirtualized results | Waterfall table shows only the currently selected snapshot; pagination or virtualizer for the waterfall rows | Any display of more than ~200 rows without virtualization |
| `xlsx` loading the full SheetJS library (~1.5MB) | Large initial bundle for Excel parsing that only runs when user uploads a `.xlsx` file | Dynamic import: `const XLSX = await import('xlsx')` inside the file handler, not at module top level | Always — SheetJS should never be in the initial bundle |
| jsPDF font embedding with a full Unicode font (NotoSans ~3MB TTF) | PDF generation stalls for several seconds while encoding the font data | Embed only the character ranges needed (Latin Extended, Cyrillic, Arabic Basic — not the full CJK range); use a subsetting approach if the full font is too large | For PDF exports containing Arabic names — unavoidable without subsetting |

---

## "Looks Done But Isn't" Checklist

- [ ] **Vercel timeout guard:** Run screening with exactly 10,000 input names on the deployed Vercel URL (not just localhost). The response completes within 10 seconds and returns all results. If computation is client-side via Web Worker, this check verifies no server round-trip is part of the hot path.
- [ ] **Top-match-only storage:** After running a 10,000-name screening, open Chrome DevTools Memory tab. Total heap after screening must be under 200MB. If heap is > 500MB, the 2.85M full result set is being stored in state.
- [ ] **Double Metaphone short-string guard:** Input "Al" and "Li" — verify neither returns more than 2 SDN matches at MEDIUM or above. If many unrelated entries match, the short-string guard is not firing.
- [ ] **Token Sort stop-token filter:** Input "International Bank Corp" — verify the top matches are all actually named "International Bank" variants on the SDN list, not every entity with "international" anywhere in the name.
- [ ] **Unicode normalization in pipeline:** Copy-paste a name containing Cyrillic homoglyphs of Latin characters (e.g., "Аlexandr Рetrov" with Cyrillic А and Р). The `transformation_detected` field must show "Cyrillic homoglyph detected" and the score must match the normalized Latin form.
- [ ] **File upload client-side only:** Upload a CSV larger than 5MB from the Screening Mode file input on the Vercel deployment. The upload must succeed and all names must parse correctly. No 413 error.
- [ ] **PDF non-Latin characters:** Export a compliance memo containing at least one Arabic name from the SDN dataset. Open the PDF and verify the Arabic name displays correctly, not as empty boxes.
- [ ] **Threshold slider 200ms:** With 10,000 results loaded, drag the threshold slider from 0.70 to 0.95 in one motion. The tier badges must update within 200ms of the slider stopping. Measure with Chrome Performance tab.
- [ ] **Existing tool regression:** After all v3.0 phases are complete, run the existing degradation demo with 500 individuals, all regions, all rules. Results must match the pre-v3.0 baseline (same row count, same scores). The full Vitest suite must pass.
- [ ] **Evasion tier sequencing:** Run the longitudinal simulation with SURGE preset. Tier 2 marker must appear after a meaningful number of snapshots, not at snapshot 1. Tier 3 must appear after Tier 2 on the chart for all three velocity presets.
- [ ] **Detection lag null handling:** In the waterfall table, confirm that any entity never caught across all snapshots shows "Not detected — enhanced due diligence flag" in the lag column, not a crash, blank, or negative number.
- [ ] **Vitest suite green throughout:** Run `npm test` at the end of every phase. Zero regressions from the existing 57+ tests.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Server Action timeout on Vercel for large screening | MEDIUM | Move comparison loop to client Web Worker; server action becomes a data-fetch stub or is removed; test with 10,000 names on Vercel immediately |
| Browser memory exhaustion from full result storage | HIGH | Redesign result store to top-match-only; requires touching the screening engine output contract and the results table component; test with Chrome Memory tab |
| Double Metaphone false positives in production demo | MEDIUM | Add short-string and non-alpha guards to algorithm dispatch; re-run test suite; verify FP rate drops on known-good test inputs |
| PDF crashes with non-Latin characters | LOW | Register NotoSans base64 font in jsPDF before calling doc.text(); affects only the PDF generation handler |
| Recharts SSR hydration error | LOW | Wrap chart in `dynamic(..., { ssr: false })`; confirm no server render of chart component |
| Evasion tier sequencing bug | MEDIUM | Switch from snapshot-index-based tier offsets to percentage-of-data-processed offsets; add invariant assertions to the state machine; regression test with all three velocity presets |
| Existing tool regression from v3.0 isolation violation | MEDIUM-HIGH | Identify the shared file that was modified; revert the change; extract a new function or new file for the v3.0 behavior; run full Vitest suite |
| Unicode normalization only in display layer | MEDIUM | Move normalization call into the comparison function's first line; re-test homoglyph detection; update the `transformation_detected` field population |

---

## Pitfall-to-Phase Mapping

Architecture-level pitfalls must be resolved in Phase 15 before any feature work begins. All others are addressed in their respective feature phase.

| Pitfall | Level | Prevention Phase | Verification |
|---------|-------|------------------|--------------|
| Server Action timeout — 2.85M comparisons | Architecture | Phase 15 | 10,000-name screening on Vercel completes in < 10s |
| Full result storage exhausts browser memory | Architecture | Phase 15 | Heap < 200MB after 10,000-name screening |
| Breaking existing `/tool` mode — isolation violation | Architecture | Phase 15 | Vitest suite green after every new file addition |
| New types polluting `src/types/index.ts` | Architecture | Phase 15 | All v3.0 types in `src/types/screening.ts` |
| Double Metaphone false positives on short/numeric strings | Implementation | Phase 16 | Short-string and non-alpha guard tests in Vitest |
| Token Sort false positives on generic business tokens | Implementation | Phase 16 | Stop-token filter test with known FP inputs |
| Unicode normalization applied post-scoring | Implementation | Phase 16 | Homoglyph detection test in Vitest |
| File upload exceeds Vercel 4.5MB payload limit | Implementation | Phase 17 | 5MB+ CSV upload succeeds on Vercel (not just localhost) |
| TanStack Virtual COL_WIDTHS collision with new schema | Implementation | Phase 18 | Separate `ScreeningResultsTable` component; visual alignment check |
| Threshold slider frame rate — full re-render on each tick | Implementation | Phase 18 | Slider drag at 60fps with 10,000 rows (Chrome Performance tab) |
| PDF generation in SSR context — window is not defined | Implementation | Phase 20 | `next build` succeeds; PDF download works on Vercel |
| PDF non-Latin font encoding | Implementation | Phase 20 | Exported PDF shows Arabic/CJK names correctly |
| Recharts SSR hydration mismatch | Implementation | Phase 22 | No hydration errors in browser console; chart renders |
| Recharts dual-axis domain default `[0,1]` | Implementation | Phase 22 | Cumulative miss bars use full Y range; `domain` prop verified |
| Evasion tier sequencing — Tier 2 before Tier 1 complete | Implementation | Phase 22 | All three velocity presets show correct tier ordering on chart |
| Detection lag null handling — never-caught entity | Implementation | Phase 22 | Null lag shows "enhanced due diligence" flag; no crash or negative value |

---

## Sources

- Vercel Functions Limitations (official) — 10s timeout for Hobby plan: https://vercel.com/docs/functions/limitations
- Next.js GitHub Discussion #70621 — 413 on multipart route handlers, 4.5MB Vercel payload cap: https://github.com/vercel/next.js/discussions/70621
- Next.js GitHub Issue #57501 — App Router body size limit: https://github.com/vercel/next.js/issues/57501
- React-PDF GitHub Issue #2460 — `renderToBuffer` not working in App Router route handlers (unresolved): https://github.com/diegomura/react-pdf/issues/2460
- React-PDF GitHub Issue #2350 — Unable to render in Next.js 13 App Router route handler: https://github.com/diegomura/react-pdf/issues/2350
- jsPDF npm — client-side only, requires dynamic import with SSR disabled: https://www.npmjs.com/package/jspdf
- Recharts GitHub Issue #821 — Multiple Y-axes support and known synchronization problems: https://github.com/recharts/recharts/issues/821
- Recharts GitHub Issue #2815 — Multi-axis synchronization: https://github.com/recharts/recharts/issues/2815
- Papa Parse official — Web Worker support, streaming large files: https://www.papaparse.com/
- Web Workers in Next.js 15 with Comlink — `new Worker(new URL(..., import.meta.url))` pattern: https://park.is/blog_posts/20250417_nextjs_comlink_examples/
- Jaro-Winkler vs Levenshtein in AML Screening (Flagright) — algorithm selection for entity types: https://www.flagright.com/post/jaro-winkler-vs-levenshtein-choosing-the-right-algorithm-for-aml-screening
- Sanctions.io — The Problem of Name Matching in Sanctions Screening (non-Latin transliteration, token issues): https://www.sanctions.io/blog/the-problem-of-name-matching-in-sanctions-screening
- Double Metaphone limitations — short strings and non-English words: https://xlinux.nist.gov/dads/HTML/doubleMetaphone.html
- Codebase inspection — `src/app/actions/runTest.ts`: existing Server Action pattern confirmed; CANONICAL_RULE_ORDER and scoring loop timing context
- Codebase inspection — `src/components/ResultsTable.tsx` lines 31–39: COL_WIDTHS hardcoded pixel constraint documented
- Codebase inspection — `src/types/index.ts`: existing type contracts; isolation strategy for v3.0 types
- Codebase inspection — `package.json`: `talisman: ^1.1.4` (Jaro-Winkler); no string-similarity, fuzzy, or phonetic library yet installed

---

*Pitfalls research for: v3.0 Screening Engine — OFAC Sensitivity Testing Tool*
*Researched: 2026-03-06*
*Supersedes: PITFALLS.md dated 2026-03-05 (v2.0 pitfalls remain applicable and are preserved; this file covers v3.0-specific additions only)*
