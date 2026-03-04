# Roadmap: OFAC Sensitivity Testing Tool

## Overview

Seven phases deliver a complete client-facing demo tool. The build order follows a strict dependency chain: shared type contracts first, then the synthetic dataset (built against those types), then the transformation engine (built against the dataset), then the server action that orchestrates engine calls, then the form UI wired to that action, then the results table and CSV export consuming the result array, and finally polish and Vercel deployment. Each phase delivers a coherent, independently verifiable capability. Nothing is split across arbitrary technical layers.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js 15 TypeScript project scaffold with shared type contracts (completed 2026-03-04)
- [x] **Phase 2: Synthetic Dataset** - Built-in SDN names spanning all entity types and linguistic regions (completed 2026-03-04)
- [x] **Phase 3: Transformation Engine** - All 10 degradation rules as pure, independently testable functions (completed 2026-03-04)
- [x] **Phase 4: Server Action** - Zod-validated orchestration layer connecting engine to UI with loading state (completed 2026-03-04)
- [x] **Phase 5: Parameter Form** - Entity counts, region selection, rule checkboxes, and client name input (completed 2026-03-04)
- [ ] **Phase 6: Results Table and CSV Export** - Virtualized results table and UTF-8 BOM CSV download
- [ ] **Phase 7: Polish and Deployment** - Crowe branding, UX refinements, and Vercel production deployment

## Phase Details

### Phase 1: Foundation
**Goal**: A runnable Next.js 15 TypeScript project exists with shared type contracts that every subsequent module depends on
**Depends on**: Nothing (first phase)
**Requirements**: None (scaffolding prerequisite — enables all 27 v1 requirements)
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` starts the dev server without errors
  2. `SdnEntry`, `ResultRow`, and `RunParams` TypeScript types are defined and importable by any module
  3. ESLint and TypeScript strict mode pass with zero errors on the empty scaffold
  4. Directory structure for `lib/rules/`, `data/`, `app/actions/`, and `components/` exists
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js 15 in-place, configure git safety, add Prettier
- [ ] 01-02-PLAN.md — Define type contracts, constants, directory skeleton, and initialize shadcn/ui

### Phase 2: Synthetic Dataset
**Goal**: A built-in synthetic SDN dataset covers all four entity types and all required linguistic regions with culturally authentic naming conventions
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. `data/sdn.json` contains entries for all four entity types: Individual, Business, Vessel, Aircraft
  2. The dataset includes entries tagged for each linguistic region: Arabic, Chinese, Russian/Cyrillic, Latin/European
  3. Arabic Individual names follow ism+nasab or kunya conventions; Chinese names appear surname-first; Russian names include patronymics — a domain reviewer can confirm authenticity
  4. All entries conform to the `SdnEntry` TypeScript type with no type errors
  5. The dataset contains enough entries per entity type (minimum 20 per type) to support sampling up to 500 per run without exhaustion
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Add @data/* tsconfig alias; author 160 Individual entries (Arabic, CJK, Cyrillic, Latin)
- [ ] 02-02-PLAN.md — Author 125 Business, Vessel, and Aircraft entries; validate complete 285-entry dataset
- [ ] 02-03-PLAN.md — Human verify naming authenticity (DATA-06 checkpoint)

### Phase 3: Transformation Engine
**Goal**: All 10 degradation rules are implemented as pure TypeScript functions, script-aware, deterministically ordered, and independently unit-tested
**Depends on**: Phase 2
**Requirements**: RULE-01, RULE-02, RULE-03, RULE-04, RULE-05, RULE-06, RULE-07, RULE-08, RULE-09, RULE-10
**Success Criteria** (what must be TRUE):
  1. Each of the 10 degradation rules produces the expected output for a Latin-script name fixture (e.g., RULE-01 transforms `AL QAEDA` to `ALQAEDA`)
  2. Rules that do not apply to a given script (e.g., diacritic rules on CJK names) return the original name unchanged rather than corrupting it
  3. Given the same input and rule selection, the engine always produces identical output (deterministic via `CANONICAL_ORDER`)
  4. `lib/sampler.ts` returns the correct entity type and region distribution from a given `RunParams` fixture
  5. Unit tests cover all 10 rules against at minimum one multi-script fixture (Arabic, Chinese, or Cyrillic name) per rule
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Install Vitest 4 + config; implement RULE-01 through RULE-05 with unit tests
- [ ] 03-02-PLAN.md — Implement RULE-06 through RULE-10 with unit tests (all 10 rules green)
- [ ] 03-03-PLAN.md — Create rules/index.ts public API barrel and sampler.ts; full suite gate

### Phase 4: Server Action
**Goal**: The `runTest` server action validates parameters, invokes the engine, and returns a `ResultRow[]` array — end-to-end flow confirmed working and Vercel timeout risk assessed
**Depends on**: Phase 3
**Requirements**: FORM-05
**Success Criteria** (what must be TRUE):
  1. Invoking `runTest` with valid `RunParams` returns a non-empty `ResultRow[]` array with correct fields (Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied)
  2. Invoking `runTest` with invalid params (e.g., sample count above 500) returns a validation error, not a crash
  3. The UI transitions to a loading/disabled state while `runTest` is pending and returns to interactive state on completion — no duplicate submissions possible
  4. A worst-case benchmark (500 names, all 10 rules active) completes within the Vercel function timeout for the project's plan tier
**Plans**: 1 plan

Plans:
- [ ] 04-01-PLAN.md — Install talisman, create integration test stub (RED), add ActionResult type, implement runTest action (GREEN)

### Phase 5: Parameter Form
**Goal**: A consultant can configure all test parameters through a usable form and submit it to generate results
**Depends on**: Phase 4
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04
**Success Criteria** (what must be TRUE):
  1. User can set a numeric sample count (0–500) for each of the four entity types (Individual, Business, Vessel, Aircraft)
  2. User can check/uncheck one or more linguistic regions (Arabic, Chinese, Russian/Cyrillic, Latin/European) to include in the sample
  3. User can select any combination of the 10 degradation rules via checkboxes, including a "Select All" shortcut that toggles all rules at once
  4. User can type a client name into a text field and it appears as a label in the output CSV filename
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Implement formUtils pure helpers (TDD: RED then GREEN)
- [ ] 05-02-PLAN.md — Build page.tsx form + layout.tsx metadata + human verify

### Phase 6: Results Table and CSV Export
**Goal**: A consultant can view all degraded name variants in a responsive table and download the full dataset as a properly encoded CSV file
**Depends on**: Phase 5
**Requirements**: RSLT-01, RSLT-02, RSLT-03, RSLT-04, EXPO-01, EXPO-02, EXPO-03
**Success Criteria** (what must be TRUE):
  1. Results display in a table with columns: Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied, and Jaro-Winkler similarity score
  2. The results page shows a catch-rate summary stat (e.g., "X of Y degraded variants would be caught at 85% match threshold") above the table
  3. A table with 2,000+ rows scrolls and sorts without visible lag or layout thrashing (virtualized rendering active)
  4. Clicking "Download CSV" triggers a file download containing all result rows with correct column headers
  5. Opening the downloaded CSV in Microsoft Excel displays Arabic, Chinese, and Cyrillic characters correctly (UTF-8 BOM present)
  6. The downloaded CSV filename includes the client name entered in the parameter form
**Plans**: TBD

### Phase 7: Polish and Deployment
**Goal**: The application is deployed to Vercel, Crowe-branded, and ready for a live client demonstration
**Depends on**: Phase 6
**Requirements**: None (addresses PROJECT.md deployment constraint and Crowe branding specification)
**Success Criteria** (what must be TRUE):
  1. The application is accessible at a live Vercel URL with no build or runtime errors
  2. The UI reflects Crowe brand colors, typography, and design language as defined in CLAUDE.md
  3. Form submission shows a loading skeleton or spinner during processing, and an error message if the action fails
  4. The page title and any visible labeling identify this as a Crowe OFAC Sensitivity Testing tool
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-03-04 |
| 2. Synthetic Dataset | 3/3 | Complete   | 2026-03-04 |
| 3. Transformation Engine | 3/3 | Complete   | 2026-03-04 |
| 4. Server Action | 1/1 | Complete    | 2026-03-04 |
| 5. Parameter Form | 2/2 | Complete   | 2026-03-04 |
| 6. Results Table and CSV Export | 0/TBD | Not started | - |
| 7. Polish and Deployment | 0/TBD | Not started | - |
