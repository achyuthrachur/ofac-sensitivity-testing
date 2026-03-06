# Research Summary — v3.0 Screening Engine

**Project:** OFAC Sensitivity Testing Tool
**Milestone:** v3.0 — Screening Engine (Screening Mode + Longitudinal Simulation Mode)
**Researched:** 2026-03-06
**Confidence:** MEDIUM-HIGH (stack verified against local node_modules; architecture cross-referenced against live Vercel constraints; pitfalls confirmed via official issue trackers; primary compute-model decision requires Phase 15 benchmark spike to resolve)

---

## Executive Summary

v3.0 transforms an existing Jaro-Winkler degradation demo into a full OFAC screening engine capable of screening real or synthetic name lists against the SDN dataset and simulating how catch rates evolve as adversaries escalate evasion tactics over time. The product is a client-facing compliance demonstration tool, not a production screener, and all architectural decisions must serve the five-step demo narrative first. The existing v2.0 codebase is a stable, shipped Next.js 16 App Router application — the correct approach is strictly additive: two new tabs inside the existing `/tool` route, new isolated directories for v3.0 logic, and zero modifications to the existing degradation engine.

The single highest-risk architectural decision is where the 2.85M comparison computations run (10,000 input names × 285 SDN entries × 3 algorithms). The Architecture researcher and Pitfalls researcher reached opposite conclusions on this point. This synthesis resolves the conflict in favor of a **client-side Web Worker as the primary architecture**, with server-action batching at 1,000 names per call retained as a validated fallback. The Pitfalls researcher has higher-confidence sourcing on Vercel's 10-second Hobby plan timeout as a hard constraint — and the Architecture researcher's own benchmarks show even a 2,000-name server action batch is "borderline" at 8 seconds. A mandatory Phase 15 spike must benchmark both approaches on the actual Vercel deployment before any screening computation code is written.

Two additional conflicts are cleanly resolved by the research. For PDF export: client-side jsPDF with dynamic import is the safe default; @react-pdf/renderer remains a stretch option if jsPDF Unicode font embedding proves difficult, but the Pitfalls researcher has open GitHub issues showing App Router route handler compatibility is unresolved as of early 2026. For Double Metaphone: talisman already contains the implementation at `talisman/phonetics/double-metaphone` verified directly in local node_modules — the Architecture researcher's reference to a standalone `double-metaphone` npm package is superseded by that local verification. No new phonetics or string-distance library is needed; talisman covers all three required algorithms.

---

## Key Findings

### Recommended Stack

The existing talisman package covers all three required string algorithms. Double Metaphone is at `talisman/phonetics/double-metaphone` (verified in node_modules); Jaro-Winkler is already used in `runTest.ts`; Token Sort Ratio is a ~10-line TypeScript utility using the existing Jaro-Winkler import — no fuzzball package is needed. The only new npm packages required for v3.0 are recharts (longitudinal chart), jspdf + jspdf-autotable (PDF export), SheetJS from the CDN (not the npm registry, which carries a high-severity CVE), and use-debounce (threshold slider). Comlink (3KB) wraps the Web Worker for a typed async API.

**Core technologies:**
- `talisman` (already installed, ^1.1.4): All three scoring algorithms — import paths verified locally; add Double Metaphone type shim to `src/types/talisman.d.ts` following the existing jaro-winkler shim pattern
- `recharts@^3.7.0`: ComposedChart with dual Y-axis, ReferenceLine, staggered chart build animation — must be `'use client'` with `dynamic(..., { ssr: false })` wrapper; set explicit `domain` prop on right YAxis or bars render at wrong height
- `jspdf` + `jspdf-autotable`: Client-side PDF generation via dynamic import — always `await import('jspdf')` inside the event handler, never at module top level, never in a route handler
- SheetJS (CDN install — `npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz`): Client-side `.xlsx` parsing; never send raw file bytes to the server
- `comlink` (3KB): Typed async wrapper for the Web Worker — eliminates raw postMessage/onmessage boilerplate
- `use-debounce`: 150ms threshold slider debounce — keeps slider thumb at 60fps while tier re-classification runs via `useDeferredValue`
- `String.prototype.normalize('NFKD')` (Node.js built-in): Unicode normalization for homoglyph detection — no install needed; apply inside the comparison function before any algorithm call, not in the display layer

**What not to install:**
- `npm install xlsx` — npm registry version is 2+ years stale with a high-severity CVE; use the CDN install above
- `double-metaphone` (standalone npm) — already inside talisman
- `fuzzball` — Token Sort Ratio is 10 lines of TypeScript using the existing talisman jaro-winkler import
- `@react-pdf/renderer` — try jsPDF first; App Router compatibility unresolved as of early 2026
- `natural` or `fastest-levenshtein` — talisman covers all needed string metrics

### Expected Features

All features below are P1 for v3.0. The demo narrative is the acceptance test — every feature maps to one or more of the five narrative steps.

**Must have (table stakes — compliance demo requires these to feel credible):**
- 5-tier threshold scoring (EXACT ≥0.97 / HIGH 0.90–0.96 / MEDIUM 0.80–0.89 / LOW 0.70–0.79 / CLEAR <0.70) with five hardcoded recommended action strings from MILESTONE-CONTEXT.md — do not make configurable
- Multi-algorithm scoring (JW + Double Metaphone + Token Sort Ratio) with winning algorithm badge per row — all three algorithms must ship as a unit; partial shipping changes tier assignments on re-run, breaking re-run consistency
- Threshold slider with 200ms live re-tiering — all scores pre-computed at screen-time; re-tiering is a client-side O(n) label pass via `useDeferredValue`; no server call on slider move
- "What would OFAC see?" toggle — locks slider to 0.85 with lock icon and tooltip copy from MILESTONE-CONTEXT.md
- Summary dashboard: tier breakdown counts, average match score, FP/FN rates
- Match detail panel on row click — shows all 19 required schema fields, all three algorithm scores, winning algorithm, recommended action string
- CSV/paste/Excel input with five-step validation flow and row-specific actionable error messages
- PDF compliance memo export (Crowe Indigo header band, Crowe Amber tier label accents, Helvetica Neue for font embedding, legal disclaimer on every page, sorted by risk tier)
- Cost of Miss calculator — transaction value × 4.0 × CLEAR count; multiplier is hardcoded and legally significant; do not allow user configuration
- FP marking toggle per row — drives FP rate counter in dashboard; demonstrates analyst review workflow
- Longitudinal Mode: SURGE preset as default, snapshot data model, catch rate chart with 3 threshold bands + evasion tier markers + cumulative miss secondary Y-axis + recovery line after recalibration event
- Waterfall decomposition table (current snapshot only — MISSED rows first and bold; columns: Entity, Base Name, Transformation, Score, Result, Evasion Tier)
- Detection lag metric per entity with null handling for never-caught entities ("Not detected — enhanced due diligence flag")

**Should have (differentiators — support specific demo narrative moments):**
- Name-length penalty modifier (names ≤6 chars escalate effective tier by 1) — visual indicator on affected rows
- Unicode normalization pre-processing — `transformation_detected` field populated when normalization changed the effective input; must run inside the comparison function before any algorithm call
- Evasion tier markers with hover/click annotation tooltip (bullet list of tactics introduced at each tier)
- Velocity presets (BASELINE/ELEVATED/SURGE) — SURGE is the demo closer; all three presets drive snapshot count and entry rate

**Defer to v3.1:**
- Unicode normalization row badge (pre-processing still runs; only the visual tag defers)
- Per-entity sparkline micro-charts (detection lag metric covers the analytical need)
- Character diff visualization

**Anti-features — explicitly reject in v3.0:**
- Real OFAC SDN API integration (legal/compliance risk in demo context)
- Configurable recommended action strings (legally significant; hardcoding protects Crowe from liability)
- Session persistence / save-and-resume (GDPR exposure even for synthetic data; exports cover the use case)
- Mobile-responsive layout (explicitly out-of-scope in PROJECT.md; add a 1024px minimum viewport gate)
- Excel (.xlsx) output (CSV with UTF-8 BOM opens correctly in Excel; label button "Download for Excel")
- Real-time collaborative review (WebSocket complexity for a single-user demo instrument)

### Architecture Approach

v3.0 extends the existing `/tool` page with two new tabs (Screening Mode, Simulation) using the already-installed shadcn `<Tabs>` component — a 10-line change to `tool/page.tsx` vs. creating new routes, which would require new page files and navigation changes to the minimal header. All v3.0 code lives in new isolated directories (`src/lib/screening/`, `src/lib/simulation/`, `src/types/screening.ts`) — existing files are touched only for three additive modifications to `tool/page.tsx`, `src/lib/constants.ts`, and `src/types/index.ts`. The screening computation runs in a client-side Web Worker (pending Phase 15 benchmark spike); the simulation engine is a pure synchronous function returning `SimulationSnapshot[]` via `useMemo`. PDF export uses jsPDF via dynamic import inside the results panel — no route handler. All file parsing is client-side before any server interaction.

**Major components:**
1. `src/lib/workers/screening.worker.ts` (NEW): Multi-algorithm comparison loop (JW + DM + TS); posts one best `MatchResult` per input name back to main thread via Comlink; posts progress events every 5,000 comparisons for the progress bar; never stores the full 2.85M comparison matrix
2. `src/lib/screening/screeningScorer.ts` (NEW): Scoring logic callable from both Web Worker and server fallback; algorithm guard conditions (skip DM for <4-char inputs, >20% numeric inputs, vessel/aircraft entity types); stop-token filter for TSR on business names; weighted composite formula: JW×0.6 + DM_bonus×0.25 + TSR×0.15
3. `src/lib/simulation/simulationEngine.ts` (NEW): Pure deterministic synchronous function; generates `SimulationSnapshot[]`; evasion tier activation by % of entities processed (not by absolute snapshot index, which would be velocity-dependent and break the demo narrative)
4. `src/components/screening/ThresholdSlider.tsx` (NEW): shadcn Slider with `useDeferredValue` pattern — `sliderValue` updates on every tick for smooth UI; `displayThreshold` on 150ms debounce drives tier re-classification
5. `src/app/_components/tool/ScreeningResultsTable.tsx` (NEW): Separate from existing `ResultsTable.tsx`; 5-column layout; never modify the existing table — column width collision would break the degradation demo
6. `src/app/_components/tool/SimulationChart.tsx` (NEW): Recharts ComposedChart with `dynamic(..., { ssr: false })`; explicit `domain={[0, 'dataMax']}` on right YAxis; prototype dual-axis with mock data before integrating simulation output

### Critical Pitfalls

**Architecture-level pitfalls — must be resolved in Phase 15 before any feature code:**

1. **2.85M comparisons exceeding Vercel 10s timeout** — Web Worker is the primary architecture; server-action batching at ≤1,000 names per call is the validated fallback. Phase 15 spike must benchmark both on the actual Vercel deployment. Never attempt 10,000 names in a single server action call. Warning signs: server action for 1,000 names × 285 SDN entries takes >800ms in dev (extrapolate to 10,000 → timeout in production).

2. **Storing the full 2.85M comparison matrix in React state — browser tab crash** — Store only the top match per input name (one `MatchResult` per input row = max 10,000 objects at ~500 bytes each = ~5MB total). The full result set at 2.85M objects approaches 3–6GB heap. Store raw `{ inputName, score }` arrays; derive tier badges via `useDeferredValue` in the render. Never pre-compute tier assignments for all rows.

3. **Breaking the existing v2.0 degradation demo — isolation violation** — All v3.0 code in new files and directories. Do not modify `sampler.ts`, `ResultsTable.tsx`, `runTest.ts`, or merge v3.0 types into `src/types/index.ts`. Run the full Vitest suite (57+ tests) after every new file addition; zero regressions permitted at any point.

**Implementation-level pitfalls by feature phase:**

4. **Double Metaphone false positives on short/numeric/non-name strings** — Guard before calling DM: skip if input is <4 chars, >20% numeric, or matched against vessel/aircraft entity type. Display `match_algorithm` from the actual winning algorithm, not assumed all-three-ran. Warning: "Al" and "Li" inputs matching many unrelated HIGH-tier SDN entries signals the guard is not firing.

5. **Token Sort Ratio inflating scores on generic business name tokens** — Apply stop-token filter before TSR: `["BANK", "GROUP", "CORP", "LTD", "TRADING", "INTERNATIONAL", "COMPANY", "CO", "THE"]`. Fall back to Jaro-Winkler if stop-token removal leaves fewer than 2 tokens in either string. Use the weighted composite (JW×0.6, not equal weights) to prevent any single algorithm's false positive from dominating tier assignment.

6. **Unicode normalization applied post-scoring — misses homoglyph evasion** — Normalization must be the first operation inside `compareNames()` on both strings. The `transformation_detected` field is populated by comparing raw vs. normalized input — this is how Cyrillic homoglyph detection surfaces. "Рobert" (Cyrillic Р) scoring as CLEAR against "Robert" is the failure mode; normalization before scoring produces EXACT.

7. **File upload hitting Vercel 4.5MB serverless payload limit** — Parse all files client-side (File API, SheetJS, papaparse). The 10MB limit is a client-side guard (`file.size > 10_000_000`), not a server guard. Never POST raw file bytes to a route handler. The failure mode: files >4.5MB succeed in local dev but return 413 on Vercel production.

8. **TanStack Virtual column width collision when building ScreeningResultsTable** — The existing `ResultsTable.tsx` uses hardcoded `COL_WIDTHS` required by the absolute-positioned virtualizer rows. Build `ScreeningResultsTable` as a completely new file with its own column set. Never modify the existing table for screening — column count change without matching container width update breaks visual alignment.

9. **Threshold slider frame rate degradation — full 10,000-row re-render on every tick** — Use `useDeferredValue` to decouple slider position (updates every tick for smooth thumb movement) from tier re-classification (runs as a deferred low-priority React update). Without this, dragging the slider at 60fps with 10,000 rows loaded causes visible frame drops.

10. **jsPDF imported at module level or in a server route** — Always `const { jsPDF } = await import('jspdf')` inside the click handler; never import at module top level. Never use in a route handler or server action. Embed NotoSans as base64-encoded TTF before calling `doc.text()` with Arabic or Cyrillic names — default Helvetica in jsPDF is Latin-only.

11. **Recharts SSR hydration mismatch and dual-axis domain default** — Always `dynamic(() => import('./SimulationChart'), { ssr: false })` in the `'use client'` wrapper. Set `domain={[0, 'dataMax']}` on the right YAxis explicitly — Recharts defaults to `[0, 1]`, making all cumulative miss bars the same tiny height regardless of data values.

12. **Evasion tier sequencing — Tier 2 activating before Tier 1 is fully processed** — Specify tier activation by % of entities processed, not by absolute snapshot index. At SURGE preset, snapshot 10 represents 3,000 cumulative entries; at BASELINE, only 150. Hard-coding Tier 2 at "snapshot 10" produces velocity-dependent behavior that breaks the demo narrative. Add dev-only invariant assertions: every entity must have a resolved Tier 1 status before Tier 2 activates.

---

## Implications for Roadmap

The suggested phase structure follows the dependency chain from the FEATURES.md dependency graph and the PITFALLS.md phase-to-pitfall mapping. Multi-algorithm scoring must ship as a unit (all three algorithms together) because tier assignment uses MAX score — partial shipping would produce inconsistent re-run results. The scoring schema defines the `MatchResult` type that every downstream component depends on, so Phase 16 is the hard prerequisite for Phases 18–21.

### Phase 15: Architecture Foundation + Compute Model Spike
**Rationale:** Architecture-level pitfalls (Vercel timeout, memory model, isolation) must be resolved before any feature code exists. The Web Worker vs. server-action decision is load-bearing — wrong decision discovered in Phase 18 means rewriting the screening engine from scratch.
**Delivers:** Directory isolation structure (`src/lib/screening/`, `src/lib/simulation/`, `src/types/screening.ts`), type schemas (`RiskTier`, `MatchResult`, `SimulationSnapshot`), constants additions (tier thresholds, Cost of Miss multiplier, compliance copy strings), Web Worker scaffold with Comlink, server-action fallback scaffold, benchmark results comparing both approaches on the actual Vercel deployment, decision memo committing to primary architecture.
**Avoids:** Pitfalls 1 (timeout), 2 (memory exhaustion), 3 (isolation violation), type pollution of v2.0 types
**Research flag:** This phase IS the spike. No external research — benchmark against the live deployment.

### Phase 16: Multi-Algorithm Scoring Engine
**Rationale:** All downstream UI (tier badges, threshold slider, match detail panel, PDF export) depends on the `MatchResult` data shape. All three algorithms must ship together; tier assignment uses MAX score across algorithms, so partial shipping changes results on re-run.
**Delivers:** `screeningScorer.ts` with weighted composite (JW×0.6 + DM_bonus×0.25 + TSR×0.15), `tokenSortRatio()` utility (~10 lines using existing talisman import), Double Metaphone type shim extension in `src/types/talisman.d.ts`, Unicode normalization pipeline inside `compareNames()`, algorithm guard conditions (short-string, numeric, entity-type), stop-token filter for TSR business names, Vitest unit tests for all scoring functions in isolation.
**Uses:** `talisman/phonetics/double-metaphone` (already installed — no new package), `talisman/metrics/jaro-winkler` (existing import)
**Avoids:** Pitfalls 4 (DM false positives), 5 (TSR business name inflation), 12 (normalization placement)
**Research flag:** None — talisman usage verified locally; algorithm design is specification-grade from MILESTONE-CONTEXT.md.

### Phase 17: File Upload and Input Parsing
**Rationale:** Input parsing must be client-side and deliver a clean `string[]` before the screening engine receives data. File upload is the entry point for Step 1 of the demo narrative. Independent of scoring — can be developed in parallel with Phase 16.
**Delivers:** `screeningParser.ts`, five-step import flow (drop zone → parse preview → column mapping → validation report → confirm), CSV and `.xlsx` client-side parsing, paste textarea with live name count, actionable row-specific error messages (row number + error type + fix instruction), 10MB client-side size guard.
**Uses:** SheetJS (CDN install), papaparse (called from inside the Web Worker, not main thread — avoid papaparse's own `worker: true` option which conflicts with the Comlink worker)
**Avoids:** Pitfall 7 (Vercel 4.5MB payload limit)
**Research flag:** None — established client-side file parsing patterns.

### Phase 18: Threshold Slider, Results Display, and Dashboard
**Rationale:** The slider and results table are the primary UI surface for Steps 3 and 4 of the demo narrative. The 200ms re-tiering performance target must be validated before adding FP/FN counters that depend on the same data path.
**Delivers:** `ThresholdSlider.tsx` (shadcn Slider + `useDeferredValue` pattern), `ScreeningResultsTable` (new component isolated from `ResultsTable.tsx`), 5-column virtual table (Row#, Input Name, Best Match, Score, Risk Tier), tier badge system (EXACT/HIGH/MEDIUM/LOW/CLEAR with Crowe color coding), algorithm badge per row (JW=indigo, DM=amber, TS=teal), filter controls (tier multi-select, algorithm filter, FP-only toggle), `ScreeningDashboard` (tier counts, FP/FN rates, average score), match detail drawer (all 19 schema fields), "What would OFAC see?" toggle.
**Avoids:** Pitfalls 8 (TanStack column width collision), 9 (slider frame rate)
**Research flag:** None — `useDeferredValue` is a documented React 18+ pattern; TanStack Virtualizer is already in the codebase.

### Phase 19: Screening Mode Integration and Server Action
**Rationale:** After the scoring engine (Phase 16) and UI layer (Phase 18) exist separately, wire them together via the compute architecture chosen in Phase 15. Add the server action as fallback. Integrate the Web Worker into `ScreeningMode.tsx` with batch progress indicator.
**Delivers:** `runScreening.ts` server action (Zod-validated, for small-batch fallback), Web Worker integration in `ScreeningMode.tsx`, batch progress bar ("Screening batch 3 of 10..."), complete end-to-end flow from file upload to populated results table.
**Avoids:** Pitfall 1 (timeout) — Phase 15 spike already resolves the architecture question
**Research flag:** None.

### Phase 20: PDF Export
**Rationale:** PDF memo is the demo leave-behind and requires all 19 schema fields (from Phase 16) and the full result set in client state (from Phase 18). It is the last Screening Mode deliverable before simulation work begins.
**Delivers:** PDF compliance memo via jsPDF dynamic import + jspdf-autotable, Crowe Indigo (#011E41) header band, Crowe Amber (#F5A800) tier label accents, Helvetica Neue for font embedding (not Helvetica Now — PDF embedding requires licensed binaries; Helvetica Neue is universally available as a system font), NotoSans base64 font subset for non-Latin character rendering, all 8 required PDF sections, legal disclaimer on every page.
**Avoids:** Pitfalls 10 (PDF in SSR context), non-Latin font encoding
**Research flag:** Spike recommended on NotoSans font subsetting. The 285 synthetic SDN entries should be audited for which non-Latin character ranges are present to determine the minimum subset size. Full NotoSans TTF is ~3MB — too large for inline base64 without significant generation lag.

### Phase 21: Cost of Miss Calculator and Compliance Framing
**Rationale:** Small self-contained widget shared between Screening Mode and Simulation Mode. Build once as a shared component. Can be slotted into any sprint after Phase 18.
**Delivers:** `CostOfMissCalculator.tsx` shared component (transaction value × 4.0 × CLEAR count, currency-formatted display), three hardcoded compliance framing strings from MILESTONE-CONTEXT.md embedded near Cost of Miss output, FP marking toggle per row wired to FP rate counter in dashboard.
**Avoids:** None (low-risk implementation; formula and copy strings are specification-grade)
**Research flag:** None.

### Phase 22: Longitudinal Simulation Mode
**Rationale:** Simulation depends on no Screening Mode code — it is entirely synthetic data generation. Can be developed in parallel with Phases 19–21. Depends on Phase 16 (scoring engine establishes tier thresholds and type schemas used by the simulation).
**Delivers:** `simulationEngine.ts` (pure deterministic synchronous function, <200ms for any realistic snapshot count), `useSimulation` hook (calls simulationEngine via `useMemo` keyed on preset — no async, no server), velocity presets (BASELINE/ELEVATED/SURGE, default SURGE), snapshot data model with per-entity tracking, `SimulationChart.tsx` (Recharts ComposedChart, `ssr: false`, dual Y-axis with explicit domain props, 5 chart elements), staggered chart build animation (20ms per snapshot interval — "live simulation" feel), `WaterfallTable.tsx` (current snapshot only — not all 300 snapshots simultaneously), detection lag metric with null handling for never-caught entities.
**Avoids:** Pitfalls 11 (Recharts SSR/dual-axis), 12 (evasion tier sequencing), detection lag null crash
**Research flag:** Prototype the 5-element Recharts ComposedChart with mock data before integrating simulation output. The dual-axis domain configuration and the staggered evasion tier marker animation need working prototypes before the full simulation data is connected.

### Phase 23: Tab Integration, Regression Verification, and Production Validation
**Rationale:** Final integration adds the two new tab triggers to `tool/page.tsx` and runs the full regression checklist from PITFALLS.md against the Vercel production deployment.
**Delivers:** Tab wiring (Screening Mode + Simulation tabs added to existing shadcn Tabs in `tool/page.tsx`), minimum 1024px viewport gate with desktop-only notice, full Vitest suite green (57+ existing tests plus new v3.0 tests), production validation on Vercel (10,000-name screening, 5MB+ file upload, PDF with Arabic names, slider drag at 60fps measured in Chrome Performance tab), existing degradation demo baseline regression check.
**Avoids:** Pitfall 3 (isolation regression)
**Research flag:** None — validation and integration phase.

### Phase Ordering Rationale

- **Phase 15 is the hard prerequisite for all other phases.** The Web Worker vs. server-action decision cascades into every screening computation. Starting feature work before the compute model is proven risks a full engine rewrite.
- **Phase 16 before Phases 18–21.** The results table, dashboard, PDF, and Cost of Miss calculator all depend on the `MatchResult` type and `RiskTier` enum defined by the scoring engine.
- **Phases 17 and 16 can run in parallel.** File parsing produces `string[]`; scoring consumes `string[]`. These are isolated concerns with no shared code.
- **Phase 22 can start after Phase 16.** Simulation generates synthetic scores and does not depend on the file upload or UI layer from Phases 17–21. Teams can parallelize Phases 19–21 and Phase 22.
- **Phase 20 (PDF) must come after Phase 18.** The PDF requires the full 19-field result schema populated in client state.
- **Phase 23 is last.** The regression checklist covers all delivered phases and validates the Vercel production deployment end-to-end.

### Research Flags

Phases that benefit from a prototype/spike before implementation:
- **Phase 15 (Architecture):** IS the spike. Benchmark Web Worker vs. server-action batching on the actual Vercel deployment before writing any screening computation code.
- **Phase 20 (PDF):** Spike on NotoSans font subsetting — audit the 285 SDN entries for non-Latin character ranges before choosing base64 subset size.
- **Phase 22 (Simulation):** Prototype the 5-element Recharts ComposedChart with mock data before integrating real simulation output.

Phases with established patterns (skip research, go straight to implementation):
- **Phase 16 (Scoring Engine):** talisman usage verified locally; algorithm design is specification-grade.
- **Phase 17 (File Parsing):** SheetJS and papaparse are well-documented; client-side parsing is an established pattern.
- **Phase 18 (Slider + Results):** `useDeferredValue` and TanStack Virtualizer are both in the existing codebase.
- **Phase 21 (Cost of Miss):** Formula and copy strings are specification-grade from MILESTONE-CONTEXT.md.
- **Phase 23 (Integration):** File moves and tab wiring — no new patterns needed.

---

## Research Conflicts Resolved

| Conflict | Resolution | Rationale |
|----------|-----------|-----------|
| Server action vs. Web Worker for screening computation | Web Worker as primary; server action as fallback for <500 names. Phase 15 spike required before committing. | Pitfalls researcher has higher-confidence sourcing on the 10s Hobby timeout as a hard constraint. Architecture researcher's own benchmarks show 2,000-name batch is "borderline" at 8s. Web Worker eliminates timeout risk. |
| @react-pdf/renderer (server-side) vs. jsPDF (client-side) | jsPDF client-side via dynamic import as the primary path. @react-pdf/renderer is a stretch option only if jsPDF Unicode font embedding proves too difficult. | Pitfalls researcher has open GitHub issues (#2350, #2460, #2402) showing App Router compatibility unresolved as of early 2026. Stack researcher's "confirmed fix" in Next.js 14.1.1+ contradicts these. Lean toward the safer client-side path. |
| `double-metaphone` npm package vs. talisman | Use talisman — no new install needed. | Stack researcher verified directly in local node_modules. Architecture researcher's reference to the standalone npm package is superseded by local verification. |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core finding (talisman covers all algorithms) verified directly in node_modules. New packages (recharts, jsPDF, SheetJS) confirmed via npm search and official docs. SheetJS CDN-vs-npm distinction is critical and well-sourced from official SheetJS documentation. |
| Features | HIGH | Requirements are specification-grade from MILESTONE-CONTEXT.md. Industry platform patterns (5-tier risk, threshold control, multi-algorithm transparency) verified across ComplyAdvantage, LSEG, Fiserv documentation. Hardcoded strings and formulas are quoted directly from the spec. |
| Architecture | MEDIUM | Tab structure decision is HIGH confidence (existing Tabs component, additive 10-line change). Web Worker compute model is MEDIUM — benchmarking against the actual Vercel deployment is required before committing. Component boundary map is well-reasoned but untested at this scale in this codebase. |
| Pitfalls | HIGH | All critical pitfalls sourced from official documentation (Vercel limits, Next.js GitHub issues, React-PDF issues, Recharts issues). Algorithm false-positive patterns sourced from direct library behavior analysis. Recovery strategies are practical and well-defined with explicit warning signs. |

**Overall confidence:** MEDIUM-HIGH. The architecture compute model (Phase 15 spike) is the primary uncertainty. All other decisions are well-founded and ready for implementation planning.

### Gaps to Address

- **Web Worker + Next.js App Router webpack bundling compatibility:** Architecture researcher cites Web Worker support as "not yet stable" in App Router. Pitfalls researcher recommends it as the solution and provides the correct instantiation pattern (`new Worker(new URL('./screening.worker.ts', import.meta.url))`). Phase 15 must confirm this works in the deployed Next.js 16 environment before any screening engine code is written.

- **jsPDF Unicode font subsetting for the specific SDN dataset:** The 285 synthetic SDN entries contain Arabic, CJK, and Cyrillic names. Full NotoSans TTF is ~3MB — too large for inline base64 without significant PDF generation lag. Phase 20 must audit which character ranges are actually present in the dataset and apply subsetting accordingly.

- **Double Metaphone behavior on non-Latin inputs returning empty codes:** The algorithm degrades gracefully for CJK and Arabic (returns empty codes — no phonetic boost, which is correct). Phase 16 must verify that two inputs both returning empty codes do not produce a spurious false-positive match with each other.

- **Recharts dual-axis domain configuration and resize behavior:** Both the Architecture and Pitfalls researchers flag this as a known issue. Phase 22 prototype with mock data before integrating real simulation output.

- **Token Sort stop-token list completeness for the specific SDN dataset:** The stop-token list is derived from common OFAC SDN patterns. The actual 285-entry synthetic dataset should be reviewed during Phase 16 to ensure the list covers the generic tokens present in that specific dataset (business entity suffixes, common geographic tokens).

---

## Sources

### Primary (HIGH confidence)
- `.planning/MILESTONE-CONTEXT.md` — all hardcoded strings, formulas, tier thresholds, 19-field match schema (specification-grade)
- `.planning/PROJECT.md` — existing constraints, out-of-scope items, technical facts
- Local `node_modules/talisman/` inspection (2026-03-06) — double-metaphone at `talisman/phonetics/double-metaphone.js`, jaro-winkler at `talisman/metrics/jaro-winkler.js`
- Vercel Functions Limitations (official) — 10s timeout for Hobby plan: https://vercel.com/docs/functions/limitations
- Next.js GitHub Discussions #70621 and Issue #57501 — 4.5MB serverless payload cap confirmed
- SheetJS Community Docs — CDN install requirement, npm registry CVE: https://docs.sheetjs.com/docs/getting-started/installation/nodejs/
- MDN String.prototype.normalize() — NFKD form, combining diacritic Unicode ranges
- OFAC Civil Penalties 2024 (official) — 4.0× multiplier rationale: https://ofac.treasury.gov/civil-penalties-and-enforcement-information

### Secondary (MEDIUM confidence)
- React-PDF GitHub Issues #2350, #2460, #2402 — App Router route handler compatibility unresolved as of early 2026
- React-PDF GitHub Issue #3074 — "confirmed fix" in Next.js 14.1.1+ (conflicts with unresolved issues above)
- Recharts GitHub Issues #821, #2815 — dual Y-axis synchronization problems confirmed
- recharts npm — version 3.7.0, React 19 compatibility: https://www.npmjs.com/package/recharts
- jsPDF npm — client-side only, dynamic import required: https://www.npmjs.com/package/jspdf
- talisman documentation and npm — double-metaphone API, modular import pattern
- AML screening platform feature surveys (sanctions.io 2025, Fiserv, ComplyAdvantage) — 5-tier risk, threshold customization as table stakes
- CSVBox file upload UX research — five-step import flow, actionable error message patterns

### Tertiary (MEDIUM-LOW confidence — validate at implementation)
- Architecture researcher performance estimates (94,000–400,000 JW ops/second) — extrapolated from existing 53ms benchmark; actual throughput must be measured in Phase 15 spike
- Web Worker + Next.js App Router webpack 5 native support — stated as available in the Pitfalls document but described as "not yet stable" in the Architecture document; requires empirical verification

---

*Research completed: 2026-03-06*
*Synthesized: 2026-03-06*
*Ready for roadmap: yes — pending Phase 15 compute model spike*
