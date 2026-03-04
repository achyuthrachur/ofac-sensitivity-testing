# Phase 4: Server Action - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the `runTest` Next.js Server Action in `app/actions/runTest.ts`. It validates `RunParams` with Zod, calls `sampleEntries` + `ruleMap` from Phase 3, computes Jaro-Winkler similarity scores, populates `ResultRow[]`, and returns a typed result. No form UI, no results table — pure orchestration layer. FORM-05 (loading/disabled state) is a UI concern owned by Phase 5; Phase 4 only needs to deliver a working, tested action contract.

</domain>

<decisions>
## Implementation Decisions

### Error Response Contract
- Return type: discriminated union `{ ok: true; rows: ResultRow[] } | { ok: false; error: string }`
- Same shape for both validation failures (Zod) and runtime engine errors — one code path for Phase 5 to handle
- Zero rows is a success: `{ ok: true; rows: [] }` — not an error condition
- `ActionResult` type defined in `src/types/index.ts` alongside `ResultRow` and `RunParams`
- Action uses `'use server'` directive — true Next.js App Router Server Action (enables `useActionState` / `startTransition` in Phase 5)

### Jaro-Winkler Similarity Scoring
- Library: **talisman** — zero-dependency, tree-shakeable, well-tested Jaro-Winkler implementation (~2KB)
- Comparison: case-insensitive, both sides uppercase-normalized before scoring
- Threshold: hardcode `DEFAULT_CATCH_THRESHOLD` from `src/lib/constants.ts` (0.85) — no `RunParams` field for threshold (interactive slider is v2, ANAL-01)
- `caught` = `similarityScore > DEFAULT_CATCH_THRESHOLD`

### Verification Strategy
- Unit tests only — no placeholder UI wired to page.tsx
- One full pipeline integration test: call `runTest()` with a real fixture `RunParams`, assert `rows.length > 0`, assert each row has `similarityScore` in [0, 1] and `caught` is boolean
- Proves the full chain (sampleEntries → ruleMap → Jaro-Winkler → ResultRow[]) before Phase 5 touches it

### Vercel Timeout Handling
- **Vercel plan: Hobby (10s timeout)**
- Add a timing assertion to the integration test: worst-case run (500 names × 10 rules) must complete in < 5s (half the limit as safety margin)
- If timing assertion fails: lower `MAX_ENTITY_COUNT` in `src/lib/constants.ts` from 500 to 200 per entity type (Zod enforces the cap)
- No explicit in-action abort/timeout guard — benchmark-first approach

### Claude's Discretion
- Exact Zod schema shape for `RunParams` validation (min/max values, required fields)
- Test file location and naming (consistent with Phase 3 pattern: `src/lib/__tests__/` or `app/actions/__tests__/`)
- Error message strings returned in `{ ok: false; error: string }`

</decisions>

<specifics>
## Specific Ideas

- The action file is `app/actions/runTest.ts` — directory already scaffolded in Phase 1
- Imports from Phase 3: `ruleMap`, `CANONICAL_RULE_ORDER`, `sampleEntries` (all from their public API barrels)
- Engine loop: for each sampled entry, iterate `CANONICAL_RULE_ORDER`, skip rule IDs not in `params.ruleIds`, call `ruleMap[ruleId](entry)`, skip `null` results, build a `ResultRow` per non-null result
- `ResultRow.id` should be a stable unique key — `${entry.id}-${ruleId}` works

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/index.ts` — `ResultRow`, `RunParams`, `SdnEntry`, `Region`, `EntityType` — all needed; `ActionResult` type to be added here
- `src/lib/constants.ts` — `DEFAULT_CATCH_THRESHOLD` (0.85), `MAX_ENTITY_COUNT` (500) — used for Zod schema bounds and similarity threshold
- `src/lib/rules/index.ts` — `ruleMap`, `CANONICAL_RULE_ORDER`, `RULE_LABELS`, `RuleId` — Phase 4's engine imports
- `src/lib/sampler.ts` — `sampleEntries(data, params)` — Phase 4's sampler call
- `data/sdn.json` — 290 entries; imported via `@data/sdn.json` alias

### Established Patterns
- Named exports only (no default exports)
- `@/*` alias for `./src/*`, `@data/*` alias for dataset
- No runtime validation on internal data — Zod only at user-input boundaries (Phase 4 is exactly that boundary)
- `'use server'` directive on action files — Next.js App Router convention

### Integration Points
- Phase 5 (Parameter Form): imports `runTest` from `app/actions/runTest.ts` and `ActionResult` from `@/types`
- Phase 5 also imports `RULE_LABELS` from `@/lib/rules` to populate checkboxes (already available)
- Phase 6 (Results Table): consumes `ResultRow[]` from the action result

</code_context>

<deferred>
## Deferred Ideas

- Interactive match threshold slider (ANAL-01) — v2; would require `matchThreshold` in `RunParams` and a slider in Phase 5
- Explicit in-action abort/timeout guard — only needed if benchmark shows > 5s; prefer cap on `MAX_ENTITY_COUNT` first

</deferred>

---

*Phase: 04-server-action*
*Context gathered: 2026-03-04*
