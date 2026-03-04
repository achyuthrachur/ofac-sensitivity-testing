# Phase 6: Results Table and CSV Export - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Mount a virtualized results table and catch-rate summary below the parameter form on `src/app/page.tsx`, and provide a CSV download with UTF-8 BOM encoding. No new pages, no routing. The `rows: ResultRow[]` state and the Phase 6 mount comment are already in `page.tsx` — this phase fills them in.

</domain>

<decisions>
## Implementation Decisions

### Table Layout
- Table appears below the form on the same page, at the Phase 6 mount comment
- Table container width: `max-w-5xl` (~1024px) — wider than the max-w-2xl form to give 6 columns room to breathe
- Column order: Original Name → Entity Type → Linguistic Region → Degraded Variant → Rule Applied → Score
- Sort: Score column only, ascending/descending toggle; default sort descending (highest score first)
- Score column display: percentage with caught indicator — e.g. `94% ✓` (caught) or `61% ✗` (missed)
- Table container: fixed height (600px), scrollable — form stays visible above

### Catch-Rate Summary
- Position: above the table, below the form cards (between form and table)
- Format: single sentence stat — `{N} of {M} degraded variants ({P}%) would be caught at the 85% match threshold`
- Layout: catch-rate sentence left-aligned, Download CSV button right-aligned in the same row

### Virtualization
- Library: `@tanstack/react-virtual` — lightweight row virtualizer (~10KB), renders only visible rows
- Approach: fixed height 600px container, `useVirtualizer` hook with estimated row height
- No full TanStack Table — plain HTML `<table>` with virtual rows; sorting handled with simple `useState` sort state

### CSV Export
- Filename format: `ofac-sensitivity-{sanitized-clientName}-{YYYY-MM-DD}.csv`
  - Sanitize: spaces → hyphens, strip non-alphanumeric (except hyphens)
  - Example: `ofac-sensitivity-Acme-Financial-Corp-2026-03-04.csv`
- Encoding: UTF-8 with BOM (`\uFEFF` prepended) — Excel reads non-Latin characters correctly (EXPO-02)
- Columns: Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied, Similarity Score
  - Score in CSV: raw percentage integer (e.g. `94`) — no ✓/✗ symbol
  - Header row included
- Download mechanism: client-side Blob + anchor click — no server roundtrip needed
- Button: "Download CSV" in the summary row, right-aligned, disabled when `rows.length === 0`

### Claude's Discretion
- Exact Tailwind classes for the summary row and table header
- Row height estimate for the virtualizer (typically 40–48px per row)
- Column widths (table-fixed layout or auto)
- `ResultsTable` component location: `src/components/ResultsTable.tsx` or inline in page.tsx — use a separate component for testability

</decisions>

<specifics>
## Specific Ideas

- The `rows` array from `page.tsx` state is already typed as `ResultRow[]` — no prop drilling needed beyond passing it to `<ResultsTable rows={rows} clientName={clientName} />`
- The Phase 6 mount comment in page.tsx is: `{/* Phase 6: mount <ResultsTable rows={rows} /> here */}` — replace this with the actual component
- `clientName` must also be passed to `ResultsTable` for the CSV filename (or accessible from a closure)
- Score percentage: `Math.round(row.similarityScore * 100)` — no decimal places in the display
- Caught threshold: `row.caught` boolean is already pre-computed by the server action at 0.85 — use it directly rather than re-computing

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/page.tsx` line 251: `{/* Phase 6: mount <ResultsTable rows={rows} /> here */}` — exact mount point
- `src/app/page.tsx` line 69: `const rows: ResultRow[] = result?.ok ? result.rows : []` — already in state
- `src/app/page.tsx` line 65: `const [clientName, setClientName] = useState('')` — available to pass as prop
- `src/types/index.ts` — `ResultRow` fields: `id`, `originalName`, `entityType`, `region`, `degradedVariant`, `ruleLabel`, `similarityScore`, `caught`
- `src/lib/constants.ts` — `DEFAULT_CATCH_THRESHOLD` (0.85) — display in the catch-rate sentence
- `src/components/ui/button.tsx` — `Button` for Download CSV
- shadcn Card components — optionally wrap table section in a Card for visual consistency

### Established Patterns
- Named exports (ResultsTable as named export from its file; default export only for Next.js pages)
- `@/*` alias for `./src/*`
- Tailwind CSS + shadcn theme tokens
- `'use client'` on page.tsx already — ResultsTable is a client component too (needs useVirtualizer)

### Integration Points
- `src/app/page.tsx` — replace Phase 6 comment with `<ResultsTable rows={rows} clientName={clientName} />`
- Phase 7 (Polish): ResultsTable will receive Crowe brand styling overrides — keep Tailwind classes accessible (no deeply nested inline styles)

</code_context>

<deferred>
## Deferred Ideas

- Filtering / search within the table — v2 (no requirement in v1)
- Column resizing — v2
- Per-rule catch-rate breakdown table — v2 (ANAL-03 in REQUIREMENTS.md)
- Interactive match threshold slider — v2 (ANAL-01)
- Sticky summary bar while scrolling the table — not needed with fixed-height scrollable container

</deferred>

---

*Phase: 06-results-table-and-csv-export*
*Context gathered: 2026-03-04*
