# Phase 1: Foundation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a runnable Next.js 15 TypeScript scaffold and define the shared type contracts (`SdnEntry`, `ResultRow`, `RunParams`) that every subsequent phase builds against. No UI, no data, no logic — just the scaffold, types, and directory structure.

</domain>

<decisions>
## Implementation Decisions

### Project Scaffold
- Use `create-next-app@latest` with flags: `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- App Router (not Pages Router)
- `src/` directory layout
- TypeScript strict mode enabled (`"strict": true` in tsconfig)
- Include a `.gitignore` that covers `node_modules/`, `.env.local`, `.vercel/`
- Note: orphan `node_modules/` exists in project root from prior work — exclude from git but do not delete (may be needed for something outside this project)

### SdnEntry Type (synthetic dataset row)
Fields to define on `SdnEntry`:
- `id`: string — unique identifier for the entry
- `name`: string — the full name as it would appear in the SDN list
- `entityType`: `'individual' | 'business' | 'vessel' | 'aircraft'`
- `region`: `'arabic' | 'cjk' | 'cyrillic' | 'latin'` — linguistic family used for rule applicability
- `country`: string (optional) — country of origin, for display purposes only

### ResultRow Type (one row in the results table)
Fields to define on `ResultRow` — drives the results table columns in Phase 6:
- `id`: string — stable row key for React rendering
- `originalName`: string
- `entityType`: `SdnEntry['entityType']`
- `region`: `SdnEntry['region']`
- `degradedVariant`: string
- `ruleId`: string — machine identifier of the applied rule
- `ruleLabel`: string — human-readable rule name for display (e.g., "Space Removal")
- `similarityScore`: number — Jaro-Winkler score, 0–1 (populated in Phase 6)
- `caught`: boolean — whether score exceeds the catch threshold (populated in Phase 6)

### RunParams Type (form submission)
Fields to define on `RunParams`:
- `entityCounts`: `{ individual: number; business: number; vessel: number; aircraft: number }` — 0–500 each
- `regions`: array of `SdnEntry['region']` — which linguistic regions to include
- `ruleIds`: string[] — which degradation rules to apply
- `clientName`: string — used in CSV filename

### Catch-Rate Threshold
- Threshold is a compile-time constant for v1: `DEFAULT_CATCH_THRESHOLD = 0.85`
- Not a form parameter in v1 (adding to RunParams would complicate the form; the 85% default is defensible and standard in watchlist screening literature)
- Export from `lib/constants.ts` so it can be referenced by both the engine and UI

### App Structure
- Single-page experience at `/` — no sub-routes in v1
- Single `app/page.tsx` that renders: form above, results below (or results replace a placeholder area after submission)
- The form and results live on the same page — no navigation, no wizard steps
- Keeps the demo frictionless: consultant loads one URL, everything is there

### Component System Setup
- Initialize shadcn/ui in Phase 1 so all subsequent phases (form, results) can use components immediately
- Run `npx shadcn@latest init` as part of foundation setup
- Add the baseline components needed across phases: `button`, `input`, `checkbox`, `label`, `card`
- This avoids Phase 5 (form) and Phase 6 (results) needing a separate setup step mid-build

### Claude's Discretion
- Exact tsconfig options beyond strict mode
- ESLint rule additions beyond Next.js defaults
- Prettier configuration (include it, sensible defaults)
- Exact shadcn/ui theme defaults (neutral, CSS variables — will be overridden in Phase 7 with Crowe branding)

</decisions>

<specifics>
## Specific Ideas

- The `SdnEntry.region` and `ResultRow.region` field values (`'arabic' | 'cjk' | 'cyrillic' | 'latin'`) must be consistent throughout — these string literals are used for rule applicability checks in the engine, display labels in the UI, and filtering in the sampler. Define as a TypeScript `const` object and derive the union type from it.
- `DEFAULT_CATCH_THRESHOLD = 0.85` should be exported from `lib/constants.ts` alongside any other compile-time constants (max entity count, etc.) so the value is never magic-numbered in the codebase.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code to reuse

### Established Patterns
- None yet — Phase 1 establishes the patterns all subsequent phases follow

### Integration Points
- The `node_modules/` directory in the project root is a pre-existing artifact unrelated to this project. Add to `.gitignore` and do not touch.
- The `Sensitivity Degradation Sample Prep PDD V0.9.docx` file is the original RPA design document — add to `.gitignore` (binary, no value in version control)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-03*
