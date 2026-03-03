# Project Research Summary

**Project:** OFAC Sensitivity Testing Web Tool
**Domain:** Form-driven string transformation demo tool / compliance consulting aid
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

The OFAC Sensitivity Testing tool is a client-facing demo application that generates degraded variants of sanctions watchlist names to illustrate how evasion techniques can defeat screening systems. This is a form-driven, compute-on-demand tool — not a screening engine, not a database-backed SaaS product. The established pattern for this type of application is a Next.js App Router single-page tool: a parameter form triggers a Server Action that processes a static synthetic dataset through a rule engine, returns a typed result array, and the client renders results in a virtualized table with CSV export. All computation belongs server-side to protect rule logic and keep the client bundle small.

The recommended approach is a narrow, high-quality v1 that covers all 10 degradation rule categories with plain-English descriptions, a synthetic SDN dataset spanning all entity types and linguistic regions, and a clean professional UI. The stack is mature and opinionated: Next.js 15 + TypeScript, React Hook Form + Zod for form validation, TanStack Table v8 with virtualization for results, and shadcn/ui for accessible components. The entire application lives on a single route, deployed to Vercel with zero-config CI/CD. Jaro-Winkler scoring, catch-rate statistics, and compound degradations are v2 features — they require scoring infrastructure as a prerequisite and should not be conflated with the v1 demo goal.

The critical risks are Unicode corruption (rules silently no-oping or mangling non-Latin scripts), non-deterministic output from unstable rule ordering, and CSV files that display as mojibake in Excel. All three are pre-emptable by design decisions made before any UI work begins: script-aware rule declarations, a canonical rule order constant, and UTF-8 BOM on every CSV export. Vercel timeout risk is real but manageable — worst-case processing (500 names, all rules active) should be benchmarked before deployment, with a client-side fallback if needed.

---

## Key Findings

### Recommended Stack

The stack is a well-established combination for a TypeScript-first Next.js tool. Next.js 15 with App Router and Server Actions eliminates the need for a separate API layer — the Server Action is co-located with the form, integrates with `useTransition` for pending state, and runs in the Node.js runtime (not Edge, which lacks the CPU budget for Unicode normalization). React Hook Form 7 + Zod 3 is the de facto standard for form validation in this stack, providing a single schema that serves both frontend validation and server-side input parsing.

TanStack Table v8 (headless, Tailwind-compatible) paired with `@tanstack/react-virtual` is non-negotiable for the results display — the tool can produce several thousand rows and DOM-rendering them without virtualization causes layout thrashing. CSV export is zero-dependency using the native Blob API with a UTF-8 BOM prepended for Excel compatibility.

**Core technologies:**
- **Next.js 15 (App Router):** Full-stack framework — Server Actions eliminate API route boilerplate; Vercel-native
- **TypeScript 5.x:** Enforces contract between form schema, Server Action payload, and result types
- **React Hook Form 7 + Zod 3:** Form validation — zero re-renders on keystroke; single schema for frontend and server
- **TanStack Table v8 + react-virtual:** Headless virtualized table — required for 2,000–5,000 result rows
- **shadcn/ui + Tailwind CSS:** Accessible components with no style conflicts; no vendor lock-in
- **Vercel:** Zero-config deployment with automatic preview builds

**Do not use:** Formik, AG Grid, MUI DataGrid, SheetJS/xlsx for CSV-only, Edge Runtime for the Server Action.

### Expected Features

The feature set is clearly scoped. The v1 must deliver a complete demo experience: all 10 degradation rule categories, a synthetic dataset covering all entity types and regions, a side-by-side results table, and CSV download. Any missing degradation category makes the tool look incomplete to compliance professionals. Phonetic/transliteration variants are the most complex rule — the v1 approach is a manually curated lookup table of the 20–30 most common variant spellings (Mohammed variants, Osama/Usama, Qaddafi variants), covering 80% of client questions.

**Must have (table stakes):**
- Synthetic SDN name library covering all entity types (individual, business, vessel, aircraft) and linguistic regions
- Entity type count + linguistic region + degradation rule selection form
- All 10 degradation rule categories with plain-English descriptions and tooltips
- Side-by-side results table: Original Name, Entity Type, Region, Degraded Variant, Rule Applied
- CSV download with UTF-8 BOM (Excel-safe)
- Deterministic output (same inputs always produce same results)
- Professional, clean UI reflecting Crowe brand

**Should have (v2 differentiators):**
- Jaro-Winkler match score column — shows numeric proximity of degraded name to original
- Catch rate summary stat — "X of Y degradations would be caught at 85% threshold"
- Compound / chained degradation rules — multiple rules applied simultaneously per name
- Rule severity / risk ratings — editorial content labeling rules High/Medium/Low risk

**Defer (v2+ or indefinitely):**
- Interactive threshold slider (requires scoring infrastructure)
- PDF summary slide export (use browser print-to-PDF as workaround)
- Screening system profile selector (requires vendor threshold research)
- User authentication, database persistence, bulk async job queue, real SDN list integration

### Architecture Approach

The architecture is a single-route Next.js application where a client-side `ParameterForm` submits to a `runTest` Server Action, which filters a static `sdn.json` dataset through `sampler.ts` and applies transformation rules via `degrader.ts`. The result array is returned to the client and rendered in a virtualized `ResultsTable`. CSV export happens entirely client-side from the already-fetched result array — no second server round-trip. The degradation engine (rule registry + sampler + degrader) lives exclusively server-side to keep rule logic out of the client bundle and allow future rules to call external services without exposing credentials.

**Major components:**
1. `ParameterForm` — collects entity counts, regions, rule selection, client name; invokes Server Action via `useTransition`
2. `runTest` (Server Action) — validates params with Zod, calls sampler then degrader, returns `ResultRow[]`
3. `sampler` / `degrader` + rule registry — pure functions; independently testable; rule order governed by `CANONICAL_ORDER` constant
4. `ResultsTable` — virtualized display using `@tanstack/react-virtual`; renders only visible viewport rows
5. `CSVDownloadButton` — client-side Blob generation; UTF-8 BOM; no server round-trip
6. `sdn.json` — static synthetic dataset imported as a TypeScript module at build time; zero I/O latency

### Critical Pitfalls

1. **Unicode corruption of non-Latin names** — Arabic, Chinese, and Cyrillic names silently mangled by Latin-targeting rules. Prevention: classify each name by script at ingestion; each rule declares `applicableScripts`; rules are no-ops when the script is not in scope. Address in transformation engine design, before any rule implementations.

2. **Non-deterministic output from unstable rule ordering** — rules applied in object key iteration order or checkbox render order produce different outputs for the same inputs. Prevention: define a `CANONICAL_ORDER` constant (array, not object) before writing any rule; always apply in canonical order regardless of which rules are active. Address in transformation engine design.

3. **CSV displaying as mojibake in Excel** — missing UTF-8 BOM causes Excel to misread UTF-8. Prevention: always prepend `\uFEFF` to CSV blob; validate by opening in actual Excel (not just a text editor). Address in CSV export phase.

4. **Vercel serverless timeout at scale** — 500 names × 10+ rules with Unicode normalization may exceed function timeout. Prevention: benchmark worst-case input before Vercel deployment; if timeout risk is real, move transformation to client-side (10,000 string operations is <200ms in the browser). Address before first Vercel deployment.

5. **React re-render cascade on checkbox interaction** — form state and results state in the same atom causes results table (2,000+ rows) to re-render on every checkbox click. Prevention: separate state atoms for form vs. results; `React.memo` on results component; virtualize from day one. Address in UI component architecture phase.

---

## Implications for Roadmap

Based on research, the build order follows a strict dependency chain: types first, then the core engine (independently testable), then the Server Action, then the UI shell, then form integration, then results display, then CSV. This order is non-negotiable — the shared `SdnEntry` and `ResultRow` types are the contract that every other module depends on.

### Phase 1: Project Foundation and Type Contracts

**Rationale:** Every other module depends on `SdnEntry` and `ResultRow` type definitions. Setting up the project scaffold and defining these contracts first prevents rework and establishes the shared language for all subsequent phases.
**Delivers:** Initialized Next.js 15 TypeScript project with all dependencies installed; `SdnEntry`, `ResultRow`, and `RunParams` type definitions; directory structure matching the architecture spec.
**Addresses:** TypeScript contract enforcement (STACK.md); shared type contract dependency (ARCHITECTURE.md)
**Avoids:** Untyped SDN data (ARCHITECTURE.md anti-pattern #4); type drift between form, action, and result layers

### Phase 2: Synthetic SDN Dataset

**Rationale:** The degradation engine must be built against a real dataset. Linguistically invalid synthetic names are a critical pitfall that cannot be patched after the engine is built — it requires domain review of the data itself before anything is built on top of it.
**Delivers:** `data/sdn.json` with entries spanning all entity types (individual, business, vessel, aircraft) and all linguistic regions (Latin, Arabic, CJK, Cyrillic); each entry typed against `SdnEntry`; names that pass domain review.
**Addresses:** Synthetic SDN library (FEATURES.md table stakes); linguistic region coverage
**Avoids:** Linguistically invalid synthetic names (Pitfall 5); UTF-8 handling failures (Pitfall 2)
**Research flag:** NEEDS RESEARCH — sourcing culturally valid name components per script requires domain input. Review against public OFAC SDN list structure.

### Phase 3: Transformation Engine (Core, No UI)

**Rationale:** The degradation engine is the core value of the tool. It must be built as pure functions with unit tests before any UI is attached — this makes it independently verifiable and keeps rule logic off the client bundle.
**Delivers:** `lib/rules/index.ts` (rule registry with `CANONICAL_ORDER`); all 10 degradation rule modules; `lib/sampler.ts`; `lib/degrader.ts`; unit tests covering all rules against multi-script fixtures (at minimum 5 names per script per rule).
**Addresses:** All 10 degradation rule categories (FEATURES.md); deterministic output requirement
**Avoids:** Non-deterministic rule ordering (Pitfall 7 — canonical order defined first); Unicode corruption (Pitfall 2 — script classification + per-rule script declarations); rules as untestable monolith (ARCHITECTURE.md anti-pattern #3)
**Research flag:** STANDARD PATTERNS for most rule categories. Phonetic/transliteration variants need curated lookup table — requires domain input for the top 20–30 variant spellings.

### Phase 4: Server Action Integration

**Rationale:** With types and engine complete, the Server Action is a thin validation + orchestration layer. Building it before the UI lets it be tested independently (e.g., via `curl` or direct function invocation) before any UI is involved.
**Delivers:** `app/actions/runTest.ts` with Zod validation matching `RunParamsSchema`; confirmed working end-to-end from raw params to `ResultRow[]`; worst-case benchmark (500 names, all rules) run to validate Vercel timeout risk.
**Addresses:** Server Action pattern (ARCHITECTURE.md Decision 1); Zod reuse for API validation (STACK.md)
**Avoids:** Vercel timeout (Pitfall 1 — benchmark before deployment); Pages Router legacy pattern (STACK.md)

### Phase 5: Parameter Form UI

**Rationale:** Form is now wired to a working Server Action, making integration straightforward. State architecture must be correct from the start — form state and results state isolated, `useTransition` used for pending state.
**Delivers:** `ParameterForm.tsx` with entity count inputs, region checkboxes, rule selection checkboxes (with plain-English descriptions), client name field; form state preserved across runs; processing state machine (`idle | processing | complete | error`); submit disabled during processing.
**Addresses:** Parameter form (FEATURES.md table stakes); plain-English rule labels; client name labeling
**Avoids:** Re-render cascade (Pitfall 3 — isolated state atoms); form state reset on re-run (Pitfall 9); no loading feedback (Pitfall 6 — state machine is Phase 5 work, not polish)

### Phase 6: Results Table and CSV Export

**Rationale:** Results display and CSV are both consumers of the `ResultRow[]` shape — building them together ensures column names are consistent between UI and export, driven from a single `COLUMNS` constant.
**Delivers:** `ResultsTable.tsx` with `@tanstack/react-virtual` virtualization (active from day one); `ResultsPanel.tsx` with React.memo; `CSVDownloadButton.tsx` with UTF-8 BOM; sorting with `useMemo`; error boundary around results table; column definitions shared between UI and CSV headers.
**Addresses:** Side-by-side results table (FEATURES.md table stakes); CSV download; UTF-8/non-Latin script support
**Avoids:** No table virtualization (ARCHITECTURE.md anti-pattern #6); CSV mojibake in Excel (Pitfall 4 — BOM + test in actual Excel); table freeze on sort/filter (Pitfall 8); CSV headers mismatching UI labels (Pitfall 13); white-screen on malformed name (Pitfall 12 — error boundary)

### Phase 7: Polish, Branding, and Deployment

**Rationale:** All functional requirements are complete. Final phase focuses on professional presentation and production readiness.
**Delivers:** Crowe branding applied; loading skeleton during processing; rule help text/tooltips; error message UX; Vercel deployment with preview builds configured; final validation of CSV in actual Excel with non-Latin names.
**Addresses:** Professional clean UI (FEATURES.md table stakes); Vercel deployment (STACK.md)
**Avoids:** Late-discovered CSV encoding issues (acceptance criterion: open in actual Excel)

### Phase Ordering Rationale

- **Types before engine:** `SdnEntry` and `ResultRow` are the shared contract; every module depends on them. Writing any module before defining these guarantees rework.
- **Dataset before engine:** The engine is built against dataset structure. Discovering that dataset names are linguistically invalid after the engine is complete is expensive.
- **Engine before UI:** Pure functions are independently testable. Attaching untested rule logic to a UI makes debugging exponentially harder.
- **Server Action before form:** Lets the action be verified in isolation; avoids debugging form + action simultaneously.
- **Form before results display:** `useTransition` and state isolation must be correct before results rendering is added — adding results display to a broken state architecture creates compound bugs.
- **Results + CSV together:** Shared `COLUMNS` constant prevents column name divergence (Pitfall 13).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Synthetic Dataset):** Culturally valid name components per script; Arabic naming conventions (ism + nasab); Chinese surname-first patterns; Russian patronymic structure. Requires domain knowledge and reference to public OFAC SDN list structure.
- **Phase 3 (Phonetic/transliteration rule):** Curated lookup table of top 20–30 variant spellings for high-frequency SDN name components. Needs compliance domain input to prioritize variants with highest real-world occurrence.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js 15 scaffold with TypeScript, Tailwind, shadcn/ui is a documented one-command setup.
- **Phase 4 (Server Action):** App Router Server Action + Zod pattern is well-documented with stable API.
- **Phase 5 (Form UI):** React Hook Form + Zod resolver is the dominant standard; pattern is extensively documented.
- **Phase 6 (Table + CSV):** TanStack Table v8 + react-virtual patterns are stable and well-documented; CSV Blob pattern is standard browser API.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | RHF+Zod, TanStack Table v8, shadcn/ui, Vercel — all dominant standards with stable APIs. Next.js 15 version should be verified on npm before install. |
| Features | HIGH | OFAC/sanctions compliance domain is well-established; degradation rule categories are documented evasion techniques. Competitor feature set is MEDIUM confidence. |
| Architecture | HIGH | Next.js App Router patterns (Server Actions, useTransition, virtualization) are stable since Next.js 13.4. Data flow and component boundaries are well-established. |
| Pitfalls | MEDIUM-HIGH | Core platform constraints (Vercel timeout, React re-render, UTF-8 BOM for Excel) are HIGH confidence. Unicode script handling edge cases are MEDIUM — real-world behavior may surface additional cases. |

**Overall confidence:** HIGH

### Gaps to Address

- **Synthetic dataset quality:** No automated validation exists for "linguistic authenticity" of synthetic names. Requires a human domain review step — flag as acceptance criterion for Phase 2 before Phase 3 begins.
- **Phonetic variant coverage:** The curated lookup table for v1 needs prioritization from someone with compliance domain knowledge. The 20–30 variant spellings chosen must reflect actual SDN list patterns, not arbitrary examples.
- **Vercel timeout threshold:** Current Vercel plan determines timeout limit (10s Hobby, 60s Pro, 300s Enterprise). This must be confirmed against the actual Crowe Vercel account before Phase 4 deployment. If on Hobby tier, client-side computation fallback becomes mandatory.
- **Tailwind version:** Tailwind v4 was in RC at knowledge cutoff. Verify stable release status before installation; v3 is the safe choice if v4 is still in pre-release.

---

## Sources

### Primary (HIGH confidence)
- Next.js App Router official docs — Server Actions, useTransition, component boundaries
- Vercel platform docs — function timeout limits, response size limits, Node.js runtime
- React official docs — re-render behavior, memo, transitions
- TanStack Table v8 + react-virtual — headless table API, virtualization patterns
- ECMA-262 spec — Unicode normalization behavior in JavaScript

### Secondary (MEDIUM confidence)
- npm ecosystem community consensus — React Hook Form 7 + Zod 3 as dominant form validation standard
- shadcn/ui documentation — copy-on-demand component model, Radix UI primitives
- OFAC SDN list public data — name component patterns, entity type categories, linguistic region distribution

### Tertiary (LOW confidence)
- Competitor feature analysis — OFAC screening vendor capabilities (needs validation against current vendor docs)
- Phonetic variant lookup table content — requires compliance domain expert review for accuracy

---
*Research completed: 2026-03-03*
*Ready for roadmap: yes*
