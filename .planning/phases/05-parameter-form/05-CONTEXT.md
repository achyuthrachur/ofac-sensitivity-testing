# Phase 5: Parameter Form - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the parameter form UI on `src/app/page.tsx`. The form collects `RunParams` (entity counts, regions, rule selections, client name), submits to the `runTest` server action, shows a loading/disabled state while running, and displays either a placeholder result count or an error banner. No results table — that is Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Page Layout
- Four cards stacked vertically: Entity Counts, Linguistic Regions, Degradation Rules, Client Name
- Page width: centered, `max-w-2xl` (~672px)
- Entity count inputs: 2-column grid (Individual | Business on row 1, Vessel | Aircraft on row 2)
- Region checkboxes: 2-column grid (Arabic | Chinese on row 1, Russian/Cyrillic | Latin/European on row 2)
- Rule checkboxes: 2-column grid (5 rules per column), with "Select All" toggle above the grid
- Submit button: in the Client Name card footer (last card, bottom of form)

### Default Values on Load
- All 10 degradation rules: pre-checked
- All 4 linguistic regions: pre-checked
- Entity counts: 10 for each type (Individual, Business, Vessel, Aircraft) — 40 total names
- Client name: empty with placeholder text `e.g. Acme Financial Corp`
- "Select All" checkbox reflects true (all rules checked) on initial render

### Loading & Submit State (FORM-05)
- Submit button: disabled + spinner + label changes to `Running…` while `runTest` is pending
- Implemented via `useActionState` / `startTransition` — true Next.js App Router pattern
- Form stays interactive and re-runnable after a completed run (no page refresh required)
- Re-submitting replaces previous placeholder/results with new ones

### Post-Submit State
- On success (`ok: true`): show placeholder below the form — `{N} results generated` — Phase 6 replaces this with the real table
- Form remains fully editable after a successful run
- `rows` state held in the page component — passed down to wherever Phase 6 mounts its results table

### Error Display
- On failure (`ok: false`): red destructive alert banner inside the Client Name card, just above the Submit button
- Error message: the full `error` string from `ActionResult` (Zod prettified message)
- Banner persists until the user re-submits (does not auto-dismiss)
- No client-side inline field validation — server error banner only (Zod handles all validation)

### Claude's Discretion
- Exact Tailwind classes and spacing within each card
- Whether to use `useActionState` or manual `useState` + `startTransition` for the pending state (both valid; choose whichever is simpler)
- Spinner implementation (inline SVG or a simple CSS animation)
- Exact placeholder wording for the post-submit count display

</decisions>

<specifics>
## Specific Ideas

- The "Select All" checkbox in the Rules card should be a controlled checkbox that: checks all when indeterminate/unchecked, unchecks all when fully checked. Indeterminate state when only some rules are selected.
- The entity count inputs have a hard max of `MAX_ENTITY_COUNT` (500) from `src/lib/constants.ts` — use as the `max` attribute on `<input type="number">`.
- `CANONICAL_RULE_ORDER` from `@/lib/rules` is the source of truth for rule order in the checkboxes — don't hardcode a different order.
- `RULE_LABELS` from `@/lib/rules` provides the human-readable label for each rule ID.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` — use for all four form sections
- `src/components/ui/button.tsx` — `Button` — submit button, with `disabled` prop support
- `src/components/ui/input.tsx` — `Input` — number inputs for entity counts, text input for client name
- `src/components/ui/checkbox.tsx` — `Checkbox` — region checkboxes, rule checkboxes, Select All
- `src/components/ui/label.tsx` — `Label` — all form field labels
- `src/app/actions/runTest.ts` — `runTest(params: unknown): Promise<ActionResult>` — the server action to call
- `src/types/index.ts` — `ActionResult`, `RunParams`, `REGION_VALUES`, `ENTITY_TYPE_VALUES` — form state types
- `src/lib/rules/index.ts` — `CANONICAL_RULE_ORDER`, `RULE_LABELS` — rule checkbox population
- `src/lib/constants.ts` — `MAX_ENTITY_COUNT` (500) — number input max attribute

### Established Patterns
- Named exports only (no default exports from component files — but `page.tsx` uses default export per Next.js convention)
- `@/*` alias for `./src/*`
- Tailwind CSS + shadcn theme tokens (`bg-card`, `text-card-foreground`, etc.)
- `'use client'` directive required on the page component since it uses `useState` / `useActionState`

### Integration Points
- `src/app/page.tsx` — the entire Phase 5 output goes here (currently just a placeholder `<h1>`)
- Phase 6 (Results Table): will consume `rows: ResultRow[]` stored in page state — Phase 5 should keep `rows` in component state so Phase 6 can mount its table component in the same page
- `layout.tsx` — may need metadata title updated from "Create Next App" to something meaningful (Claude's discretion)

</code_context>

<deferred>
## Deferred Ideas

- Client-side inline field validation (per-field error messages) — Phase 7 polish; server error banner is sufficient for v1 demo
- Full-page loading overlay — overkill for this form
- Toast notifications — no toast system installed; not needed for single error display

</deferred>

---

*Phase: 05-parameter-form*
*Context gathered: 2026-03-04*
