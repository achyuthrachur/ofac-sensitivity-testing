# Roadmap: OFAC Sensitivity Testing Tool

## Milestones

- ✅ **v1.0 MVP** — Phases 1–9 (shipped 2026-03-05)
- ✅ **v2.0 Production Face** — Phases 10–14 (shipped 2026-03-06)
- 📋 **v3.0 Screening Engine** — Phases 15–23 (planned)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–9) — SHIPPED 2026-03-05</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-04
- [x] Phase 2: Synthetic Dataset (3/3 plans) — completed 2026-03-04
- [x] Phase 3: Transformation Engine (3/3 plans) — completed 2026-03-04
- [x] Phase 4: Server Action (1/1 plan) — completed 2026-03-04
- [x] Phase 5: Parameter Form (2/2 plans) — completed 2026-03-04
- [x] Phase 6: Results Table and CSV Export (2/2 plans) — completed 2026-03-04
- [x] Phase 7: Polish and Deployment (2/2 plans) — completed 2026-03-05
- [x] Phase 8: Table & Form UX Fixes (1/1 plan) — completed 2026-03-05 (gap closure)
- [x] Phase 9: Verification Coverage (1/1 plan) — completed 2026-03-05 (gap closure)

Full phase details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v2.0 Production Face (Phases 10–14) — SHIPPED 2026-03-06</summary>

- [x] Phase 10: Landing Page (2/2 plans) — completed 2026-03-05
- [x] Phase 11: Tool Layout + Explanations (2/2 plans) — completed 2026-03-05
- [x] Phase 12: Icon Pass (2/2 plans) — completed 2026-03-06
- [x] Phase 13: Animation Pass (4/4 plans) — completed 2026-03-06
- [x] Phase 14: Premium UI (5/5 plans) — completed 2026-03-06

Full phase details: `.planning/milestones/v2.0-ROADMAP.md`

</details>

### 📋 v3.0 Screening Engine (Phases 15–23)

**Milestone Goal:** Transform the tool from a degradation demonstration into a full OFAC screening engine with two new operational modes: Screening Mode (screen real or synthetic name lists against the SDN dataset with tiered compliance framing) and Longitudinal Simulation Mode (simulate how catch rates evolve as evasion tactics escalate over time).

- [x] **Phase 15: Architecture Foundation** — Compute model spike, type contracts, directory structure, synthetic client name list (completed 2026-03-06)
- [ ] **Phase 16: Scoring Engine** — Multi-algorithm scorer, 5-tier logic, name-length penalty, Unicode normalization
- [ ] **Phase 17: Input Parsing** — CSV/Excel/paste parsing, five-step import flow, client-side file validation
- [ ] **Phase 18: Results Display + Threshold** — Split-pane results table, threshold slider, detail card, OFAC toggle
- [ ] **Phase 19: Dashboard + Cost of Miss** — Summary dashboard, FP/FN rates, Cost of Miss calculator (shared component)
- [ ] **Phase 20: Export** — CSV download and PDF compliance memo with Crowe branding and Unicode font
- [ ] **Phase 21: Simulation Engine** — Snapshot data model, velocity presets, evasion tiers, detection lag metric
- [ ] **Phase 22: Simulation Chart + Table** — Recharts ComposedChart, waterfall decomposition table, recalibration event
- [ ] **Phase 23: Integration + Regression** — Tab wiring, viewport gate, regression suite, production validation

## Phase Details

### Phase 15: Architecture Foundation
**Goal**: The compute model for 2.85M comparisons is proven feasible on the actual Vercel deployment, and all v3.0 code has an isolated directory structure, type contracts, and a pre-loaded synthetic client name list that lets the demo run without a file upload.
**Depends on**: Nothing (first v3.0 phase)
**Requirements**: SCREEN-01, SCREEN-06 (foundation only — types and Web Worker scaffold), SCREEN-07 (foundation only — RiskTier enum and tier threshold constants)
**Success Criteria** (what must be TRUE):
  1. Navigating to the Screening Mode tab shows a pre-loaded name list ready to screen — no upload step required for a demo
  2. A benchmark commit proves Web Worker or server-action batching completes 10,000-name screening on the actual Vercel production deployment within 10 seconds
  3. `src/types/screening.ts`, `src/lib/screening/`, and `src/lib/simulation/` directories exist with stub modules — TypeScript strict build passes with zero errors
  4. The existing degradation demo (Sensitivity Test tab) still produces correct results after all Phase 15 file additions — Vitest suite remains green
**Plans**: 2 plans
Plans:
- [ ] 15-01-PLAN.md — Type contracts, stub modules, client name list, and test scaffold
- [ ] 15-02-PLAN.md — Benchmark spike (Web Worker + server action), Screening Mode tab wiring

### Phase 16: Scoring Engine
**Goal**: Every input name produces a single `MatchResult` with the best SDN match score, the winning algorithm, a risk tier, and a name-length penalty flag — all three algorithms ship as an atomic unit so tier assignments are stable across re-runs.
**Depends on**: Phase 15
**Requirements**: SCREEN-06, SCREEN-07, SCREEN-08, SCREEN-09
**Success Criteria** (what must be TRUE):
  1. Running the scorer on a test name produces a `MatchResult` with `jw_score`, `dm_bonus`, `tsr_score`, `composite_score`, `match_algorithm`, and `risk_tier` fields — all populated correctly per the weighted formula (JW×0.6 + DM_bonus×0.25 + TSR×0.15)
  2. A name of 6 characters or fewer shows its effective tier escalated by one level compared to the raw composite score tier
  3. A Cyrillic homoglyph input (e.g., "Рobert" with Cyrillic Р) scores EXACT against "Robert" — confirming NFKD normalization fires before any algorithm call
  4. Vitest unit tests cover all three algorithms in isolation, the composite formula, the name-length penalty, and the Unicode normalization path — all tests green
**Plans**: TBD

### Phase 17: Input Parsing
**Goal**: A user can replace the pre-loaded name list via CSV file upload, Excel file upload, or paste — the result in all cases is a validated `string[]` ready for the scoring engine, with actionable per-row error messages when the input is malformed.
**Depends on**: Phase 15 (can be built in parallel with Phase 16)
**Requirements**: SCREEN-02, SCREEN-03, SCREEN-04, SCREEN-05
**Success Criteria** (what must be TRUE):
  1. Uploading a CSV file (with or without a header row) replaces the pre-loaded list and shows the parsed name count in the UI
  2. Uploading an .xlsx file parses correctly client-side — no file bytes are sent to the server; a 5MB+ xlsx file uploads and parses without a Vercel 413 error
  3. Pasting names (one-per-line and comma-separated formats both accepted) populates the input list with a live count shown as the user types
  4. A list of 10,001 names shows a validation error stopping the user before screening runs
  5. Malformed rows (empty lines, duplicate names, oversized entries) show per-row error messages with the row number and a specific fix instruction
**Plans**: TBD

### Phase 18: Results Display + Threshold
**Goal**: After screening runs, the user sees a color-coded split-pane results view where every name has a tier badge, clicking any row opens a full detail card, and dragging the threshold slider re-tiers all results client-side within 200ms without re-running the scoring engine.
**Depends on**: Phase 16
**Requirements**: SCREEN-10, SCREEN-11, SCREEN-12, SCREEN-14
**Success Criteria** (what must be TRUE):
  1. The left pane lists all screened names with color-coded tier badges (EXACT/HIGH/MEDIUM/LOW/CLEAR) — clicking any row opens its detail card in the right pane without a page reload
  2. The detail card shows: input name, matched SDN name, match score, winning algorithm, risk tier, and the hardcoded recommended action string for that tier
  3. Dragging the threshold slider re-tiers all visible rows within 200ms — the slider thumb moves at 60fps with no visible frame drops when 10,000 names are loaded
  4. Clicking "What would OFAC see?" locks the threshold to 0.85 and shows a lock icon — the slider becomes non-interactive while the toggle is active
**Plans**: TBD

### Phase 19: Dashboard + Cost of Miss
**Goal**: The summary dashboard shows compliance-meaningful aggregate metrics (tier breakdown, FP/FN rates, average score), and the Cost of Miss calculator translates missed hits into a concrete OFAC penalty exposure figure — the same calculator is available in both Screening Mode and Simulation Mode.
**Depends on**: Phase 18
**Requirements**: SCREEN-13, SCREEN-15, SIM-08
**Success Criteria** (what must be TRUE):
  1. The dashboard shows: total names screened, count for each of the five tiers, average composite match score, and false positive / false negative rates — all values update when the threshold slider moves
  2. Entering a transaction value in the Cost of Miss calculator shows the OFAC penalty exposure (transaction value × 4.0) formatted as a currency figure
  3. The Cost of Miss calculator component renders identically inside Screening Mode and inside Simulation Mode — it is one shared component, not two copies
**Plans**: TBD

### Phase 20: Export
**Goal**: A user can download the full match results as a CSV and export a Crowe-branded PDF compliance memo that contains all match records sorted by risk tier — including non-Latin names rendered correctly with a Unicode font.
**Depends on**: Phase 18
**Requirements**: SCREEN-16, SCREEN-17
**Success Criteria** (what must be TRUE):
  1. Clicking "Download CSV" produces a UTF-8 BOM CSV file containing all 19 match result schema fields for every screened name — the file opens correctly in Excel with non-Latin characters visible
  2. Clicking "Export PDF" generates a compliance memo with a Crowe Indigo header band, Crowe Amber tier label accents, match records sorted by risk tier, hardcoded recommended action strings, and a legal disclaimer on every page
  3. The PDF renders Arabic and Cyrillic names correctly — not as empty boxes or question marks — confirming the NotoSans Unicode font subset is embedded
  4. Both exports are generated entirely client-side — no file bytes pass through a server route handler
**Plans**: TBD

### Phase 21: Simulation Engine
**Goal**: The user can select a velocity preset, run the simulation, and receive a deterministic array of snapshots where each snapshot tracks catch rates, missed entities, and evasion tier activations — including a per-entity detection lag metric.
**Depends on**: Phase 16
**Requirements**: SIM-01, SIM-07
**Success Criteria** (what must be TRUE):
  1. Selecting BASELINE, ELEVATED, or SURGE preset and running the simulation completes synchronously in under 200ms and produces a non-empty `SimulationSnapshot[]` array
  2. The three presets produce visibly different simulation shapes — SURGE shows more snapshots and a steeper catch-rate decline than BASELINE
  3. Each entity in the simulation output has a `detection_lag` value showing the number of snapshots from SDN add date to first 100%-caught snapshot — entities never caught show the string "Not detected — enhanced due diligence flag" rather than crashing
  4. Evasion tiers activate based on the percentage of entities processed (not absolute snapshot index), so the activation points shift correctly across presets
**Plans**: TBD

### Phase 22: Simulation Chart + Table
**Goal**: The simulation data is rendered as a live-building Recharts chart showing catch rate evolution across all three threshold bands, evasion tier markers, and a cumulative miss bar overlay — plus a waterfall decomposition table for the currently selected snapshot.
**Depends on**: Phase 21
**Requirements**: SIM-02, SIM-03, SIM-04, SIM-05, SIM-06
**Success Criteria** (what must be TRUE):
  1. The chart displays three simultaneous catch rate lines (one per threshold band: 0.75, 0.85, 0.95) as overlapping lines on the primary Y-axis
  2. Vertical dashed markers appear at the correct snapshots where Tier 1, Tier 2, and Tier 3 evasion are introduced — each marker is labeled with its tier name
  3. Cumulative miss count renders as a bar overlay on a secondary right Y-axis — bars visibly grow across snapshots (not all the same tiny height)
  4. Setting a recalibration event at snapshot N causes the chart to show a catch rate recovery line beginning at that snapshot
  5. The waterfall decomposition table shows per-row data for the current snapshot with green rows for caught entities and red bold rows for missed entities — columns: Entity, Base Name, Transformation, Score, Result, Evasion Tier
**Plans**: TBD

### Phase 23: Integration + Regression
**Goal**: The two new tabs (Screening Mode, Simulation Mode) are wired into the existing tool page, the full test suite passes with zero regressions, and the production Vercel deployment is validated end-to-end including a 10,000-name screening run, a 5MB+ file upload, a PDF with Arabic names, and the existing degradation demo working correctly.
**Depends on**: Phase 20, Phase 22
**Requirements**: (no new v3.0 requirements — integration and validation of all 25 prior requirements)
**Success Criteria** (what must be TRUE):
  1. The tool page shows three tabs: "Sensitivity Test" (existing, unchanged), "Screening Mode", and "Simulation" — switching tabs does not reset state in the other tabs
  2. Visiting the tool URL on a screen narrower than 1024px shows a desktop-only notice rather than a broken layout
  3. The full Vitest suite (57+ existing tests plus all new v3.0 tests) runs green with zero failures — no existing degradation demo behavior changed
  4. On the live Vercel production URL: a 10,000-name screening run completes within 10 seconds, a PDF with Arabic names renders those names correctly, and the existing Sensitivity Test tab produces identical results to pre-v3.0
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-04 |
| 2. Synthetic Dataset | v1.0 | 3/3 | Complete | 2026-03-04 |
| 3. Transformation Engine | v1.0 | 3/3 | Complete | 2026-03-04 |
| 4. Server Action | v1.0 | 1/1 | Complete | 2026-03-04 |
| 5. Parameter Form | v1.0 | 2/2 | Complete | 2026-03-04 |
| 6. Results Table and CSV Export | v1.0 | 2/2 | Complete | 2026-03-04 |
| 7. Polish and Deployment | v1.0 | 2/2 | Complete | 2026-03-05 |
| 8. Table & Form UX Fixes | v1.0 | 1/1 | Complete | 2026-03-05 |
| 9. Verification Coverage | v1.0 | 1/1 | Complete | 2026-03-05 |
| 10. Landing Page | v2.0 | 2/2 | Complete | 2026-03-05 |
| 11. Tool Layout + Explanations | v2.0 | 2/2 | Complete | 2026-03-05 |
| 12. Icon Pass | v2.0 | 2/2 | Complete | 2026-03-06 |
| 13. Animation Pass | v2.0 | 4/4 | Complete | 2026-03-06 |
| 14. Premium UI | v2.0 | 5/5 | Complete | 2026-03-06 |
| 15. Architecture Foundation | 2/2 | Complete   | 2026-03-06 | — |
| 16. Scoring Engine | v3.0 | 0/TBD | Not started | — |
| 17. Input Parsing | v3.0 | 0/TBD | Not started | — |
| 18. Results Display + Threshold | v3.0 | 0/TBD | Not started | — |
| 19. Dashboard + Cost of Miss | v3.0 | 0/TBD | Not started | — |
| 20. Export | v3.0 | 0/TBD | Not started | — |
| 21. Simulation Engine | v3.0 | 0/TBD | Not started | — |
| 22. Simulation Chart + Table | v3.0 | 0/TBD | Not started | — |
| 23. Integration + Regression | v3.0 | 0/TBD | Not started | — |
