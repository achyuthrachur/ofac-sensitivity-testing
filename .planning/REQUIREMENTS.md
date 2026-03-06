# Requirements: OFAC Sensitivity Testing Tool

**Defined:** 2026-03-06
**Milestone:** v3.0 Screening Engine
**Core Value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.

## v3.0 Requirements

### Screening Mode — Input & Data

- [x] **SCREEN-01**: Screening Mode opens with a pre-loaded synthetic client name list already loaded and ready to screen (standalone demo — no upload required)
- [ ] **SCREEN-02**: User can upload a CSV file to replace the pre-loaded list (client-side parsing, column detection for files with/without headers)
- [ ] **SCREEN-03**: User can upload an .xlsx file to replace the pre-loaded list (SheetJS CDN, client-side parsing)
- [ ] **SCREEN-04**: User can paste names (one per line or comma-separated) to replace the pre-loaded list
- [ ] **SCREEN-05**: Input supports up to 10,000 names; displays count and validation errors (format, duplicates, oversized file)

### Screening Mode — Scoring Engine

- [x] **SCREEN-06**: Each input name is scored against all SDN entries using Jaro-Winkler + Double Metaphone + Token Sort Ratio; best match per input name is retained with winning algorithm noted
- [x] **SCREEN-07**: Results are assigned to one of five risk tiers based on match score: EXACT (≥0.97) / HIGH (0.90–0.96) / MEDIUM (0.80–0.89) / LOW (0.70–0.79) / CLEAR (<0.70)
- [x] **SCREEN-08**: Names ≤6 characters have their effective tier escalated by one level (name-length penalty)
- [x] **SCREEN-09**: Input names are Unicode-normalized (NFKD) before comparison to catch homoglyph substitution evasion
- [ ] **SCREEN-10**: Threshold slider re-tiers all results client-side within 200ms without re-running the scoring engine

### Screening Mode — Results UX

- [ ] **SCREEN-11**: Left pane shows full input list with color-coded tier badges; clicking any row opens a detail card in the right pane
- [ ] **SCREEN-12**: Detail card shows: input name, matched SDN name, match score, winning algorithm, risk tier, and hardcoded recommended action string
- [ ] **SCREEN-13**: Summary dashboard shows: total names screened, count per tier, average match score, and false positive / false negative rates
- [ ] **SCREEN-14**: "What would OFAC see?" toggle locks the threshold to 0.85 (industry benchmark) with a single click
- [ ] **SCREEN-15**: Cost of Miss calculator: user enters transaction value and sees OFAC penalty exposure (transaction value × 4.0)

### Screening Mode — Export

- [ ] **SCREEN-16**: User can export a PDF compliance memo: Crowe LLP header, threshold used, match records sorted by risk tier, recommended action strings (jsPDF client-side with Unicode font)
- [ ] **SCREEN-17**: User can export full match results as a UTF-8 BOM CSV containing all fields from the match result schema

### Longitudinal Simulation Mode

- [ ] **SIM-01**: User can select a velocity preset (BASELINE: 15 entries/update every 3 days / ELEVATED: 75 entries/update every 2 days / SURGE: 300 entries/update daily) and run the simulation
- [ ] **SIM-02**: Simulation chart shows catch rate line over snapshots with three simultaneous threshold bands (0.75, 0.85, 0.95) as overlapping lines
- [ ] **SIM-03**: Chart shows vertical dashed markers where each evasion tier is introduced (Tier 1: immediate / Tier 2: short-term / Tier 3: long-term), labeled
- [ ] **SIM-04**: Cumulative miss count is displayed as a bar overlay on a secondary right Y-axis
- [ ] **SIM-05**: User can set a recalibration event at snapshot N; chart shows catch rate recovery line after that snapshot
- [ ] **SIM-06**: Waterfall decomposition table shows per-snapshot breakdown: Entity | Base Name | Transformation | Score | CAUGHT/MISSED | Evasion Tier (green rows = caught, red bold rows = missed)
- [ ] **SIM-07**: Detection lag metric per entity: number of snapshots from SDN add date to the first snapshot where 100% of variants are caught
- [ ] **SIM-08**: Cost of Miss calculator is available in Simulation Mode (shared component with Screening Mode)

## v4.0 Requirements (Deferred)

### Analyst Workflow
- **ANLST-01**: User can mark a result as a false positive inline and add analyst notes
- **ANLST-02**: FP markings persist within the session and are included in PDF export

### Enhanced Visualization
- **VIZ-01**: Per-entity sparkline micro-chart showing catch rate history
- **VIZ-02**: Character diff visualization showing exactly which characters were substituted
- **VIZ-03**: Batch multi-threshold comparison (same list screened at 3 thresholds simultaneously)

### Advanced Export
- **EXP-01**: Export Longitudinal Simulation as animated GIF
- **EXP-02**: Real OFAC XML delta file import for simulation data

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real OFAC SDN list integration | Synthetic data only — compliance and demo safety |
| Authentication / access control | Public demo tool |
| Configurable recommended action strings | Legal framing must remain hardcoded (liability risk) |
| Configurable evasion tier timing | Destroys demo narrative coherence |
| Configurable Cost of Miss multiplier | 4.0× is grounded in OFAC civil penalty guidelines — must stay fixed |
| Real client data persistence | Stateless per-run, no session storage |
| Mobile-responsive design | Desktop-first demo context |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCREEN-01 | Phase 15 | Complete |
| SCREEN-02 | Phase 17 | Pending |
| SCREEN-03 | Phase 17 | Pending |
| SCREEN-04 | Phase 17 | Pending |
| SCREEN-05 | Phase 17 | Pending |
| SCREEN-06 | Phase 16 | Complete |
| SCREEN-07 | Phase 16 | Complete |
| SCREEN-08 | Phase 16 | Complete |
| SCREEN-09 | Phase 16 | Complete |
| SCREEN-10 | Phase 18 | Pending |
| SCREEN-11 | Phase 18 | Pending |
| SCREEN-12 | Phase 18 | Pending |
| SCREEN-13 | Phase 19 | Pending |
| SCREEN-14 | Phase 18 | Pending |
| SCREEN-15 | Phase 19 | Pending |
| SCREEN-16 | Phase 20 | Pending |
| SCREEN-17 | Phase 20 | Pending |
| SIM-01 | Phase 21 | Pending |
| SIM-02 | Phase 22 | Pending |
| SIM-03 | Phase 22 | Pending |
| SIM-04 | Phase 22 | Pending |
| SIM-05 | Phase 22 | Pending |
| SIM-06 | Phase 22 | Pending |
| SIM-07 | Phase 21 | Pending |
| SIM-08 | Phase 19 | Pending |

**Coverage:**
- v3.0 requirements: 25 total
- Mapped to phases: 25 (Phases 15–22)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 — traceability filled after roadmap creation (Phases 15–23)*
