# Phase 6: Results Table and CSV Export - Research

**Researched:** 2026-03-04
**Domain:** React virtualized tables, client-side CSV generation, Node-only Vitest testing of browser-free pure logic
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Table Layout**
- Table appears below the form on the same page, at the Phase 6 mount comment (page.tsx line 251)
- Table container width: `max-w-5xl` (~1024px)
- Column order: Original Name → Entity Type → Linguistic Region → Degraded Variant → Rule Applied → Score
- Sort: Score column only, ascending/descending toggle; default sort descending (highest score first)
- Score column display: percentage with caught indicator — e.g. `94% ✓` (caught) or `61% ✗` (missed)
- Table container: fixed height (600px), scrollable

**Catch-Rate Summary**
- Position: above the table, between form cards and table
- Format: single sentence — `{N} of {M} degraded variants ({P}%) would be caught at the 85% match threshold`
- Layout: catch-rate sentence left-aligned, Download CSV button right-aligned in the same row

**Virtualization**
- Library: `@tanstack/react-virtual` — NOT `@tanstack/react-table`
- Approach: plain HTML `<table>` with `useVirtualizer`, fixed 600px container
- Sorting via simple `useState` sort state only

**CSV Export**
- Filename: `ofac-sensitivity-{sanitized-clientName}-{YYYY-MM-DD}.csv`
  - Sanitize: spaces → hyphens, strip non-alphanumeric except hyphens
- Encoding: UTF-8 with BOM (`\uFEFF` prepended)
- CSV columns: Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied, Similarity Score
  - Score in CSV: raw integer percentage (e.g. `94`), no ✓/✗
  - Header row included
- Mechanism: client-side Blob + anchor click
- Button: disabled when `rows.length === 0`

### Claude's Discretion
- Exact Tailwind classes for summary row and table header
- Row height estimate for the virtualizer (typically 40–48px per row)
- Column widths (table-fixed layout or auto)
- `ResultsTable` component location: use `src/components/ResultsTable.tsx` (separate component for testability)

### Deferred Ideas (OUT OF SCOPE)
- Filtering / search within the table — v2
- Column resizing — v2
- Per-rule catch-rate breakdown table — v2 (ANAL-03)
- Interactive match threshold slider — v2 (ANAL-01)
- Sticky summary bar while scrolling — not needed with fixed-height container
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RSLT-01 | Results display in a table showing Original Name, Entity Type, Linguistic Region, Degraded Variant, and Rule Applied | `useVirtualizer` renders plain `<table>` rows from `ResultRow[]`; all fields exist on the type |
| RSLT-02 | Results table shows Jaro-Winkler similarity score for each pair | `row.similarityScore` (0–1 float) × 100 → integer percentage; `row.caught` boolean drives ✓/✗ icon |
| RSLT-03 | Results page shows catch-rate summary stat | Derived from `rows.filter(r => r.caught).length` vs `rows.length`; `DEFAULT_CATCH_THRESHOLD` (0.85) sourced from constants |
| RSLT-04 | Results table remains usable with thousands of rows (virtualized rendering) | `@tanstack/react-virtual` `useVirtualizer` renders only ~15 visible rows at any time regardless of array size |
| EXPO-01 | User can download all results as a CSV file | Client-side `Blob` + `URL.createObjectURL` + programmatic `<a>` click — no server roundtrip |
| EXPO-02 | CSV uses UTF-8 encoding with BOM so non-Latin characters display correctly in Excel | `\uFEFF` prepended to CSV string before Blob creation; `type: 'text/csv;charset=utf-8;'` on Blob |
| EXPO-03 | CSV filename includes the client name entered in the parameter form | `clientName` prop passed to `ResultsTable`; sanitized before interpolation into filename |
</phase_requirements>

---

## Summary

Phase 6 adds two capabilities to the existing Next.js 16/React 19 single-page app: a virtualized results table and a CSV download. Both are pure client-side — no new routes, no server calls, no new database. The only new npm dependency is `@tanstack/react-virtual` (not yet installed; must be added via `npm install`).

The table requirement is clear-cut: a plain HTML `<table>` controlled by `useVirtualizer` from `@tanstack/react-virtual`. The virtualizer owns the scroll container and injects `transform: translateY(...)` on each row so only ~15 rows are in the DOM at once regardless of array size. Sorting is a single `useState({ column: 'score', dir: 'desc' })` state with a `useMemo`-derived sorted copy — no library overhead.

The CSV requirement is equally straightforward: build a string, prepend `\uFEFF`, wrap in a `Blob`, call `URL.createObjectURL`, click a temporary `<a>`, revoke the object URL. This is browser-native and requires zero additional dependencies. The node-only Vitest environment means the component itself cannot be rendered in tests, but all pure logic (catch-rate calculation, filename sanitization, CSV string building) can be extracted into a `src/lib/resultsUtils.ts` module and tested directly in Vitest without a DOM.

**Primary recommendation:** Implement `ResultsTable.tsx` as a named-export client component wrapping a `useVirtualizer`-driven plain `<table>`, with all pure logic extracted to `src/lib/resultsUtils.ts` so Vitest node tests can cover business logic without needing a browser environment.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-virtual` | ^3.x (latest) | Row virtualization — renders only visible rows into the DOM | Locked decision; lightest-weight virtualizer, no opinion on table markup |
| React 19 (already installed) | 19.2.3 | Component model | Already in project |
| Tailwind CSS v4 (already installed) | ^4 | Utility styling | Already in project |
| shadcn Button (already installed) | — | Download CSV button | Already themed; `Button` from `@/components/ui/button` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` (already installed as transitive) | — | Not needed here directly | Already used in runTest; not needed in ResultsTable |

### Not Needed / Explicitly Excluded

| Excluded | Reason |
|----------|--------|
| `@tanstack/react-table` | Locked out — adds 50KB+ for features (filtering, pagination) not in v1 scope |
| `papaparse` / `fast-csv` | Overkill — no CSV parsing needed; client-side string building is sufficient |
| `react-window` / `react-virtuoso` | Not the locked choice; `@tanstack/react-virtual` is locked |
| Server-side CSV generation | Client Blob approach requires zero server resources and no new API route |

**Installation required:**
```bash
npm install @tanstack/react-virtual
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── ResultsTable.tsx       # Named export: ResultsTable — 'use client' directive
├── lib/
│   ├── resultsUtils.ts        # Pure helpers: buildCsvString, sanitizeClientName,
│   │                          #   computeCatchRate, formatScoreDisplay, triggerCsvDownload
│   └── __tests__/
│       └── resultsUtils.test.ts  # Vitest node tests covering all pure helpers
└── app/
    └── page.tsx               # Replace line 251 comment with <ResultsTable rows={rows} clientName={clientName} />
```

### Pattern 1: useVirtualizer with Fixed-Height Scroll Container

**What:** `useVirtualizer` measures a fixed-height outer `div` and reports which rows are in the viewport. Each virtual item gets an absolute `translateY` position. The `<tbody>` height is set to `totalSize` so the scrollbar is correctly proportioned.

**When to use:** Any list/table where row count may exceed ~200 items. With 2,000 rows at 44px each = 88KB of DOM nodes without virtualization.

**Example (verified against @tanstack/react-virtual v3 README):**
```typescript
// Source: https://tanstack.com/virtual/v3/docs/introduction
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualTable({ rows }: { rows: ResultRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,   // px per row — 44px fits content comfortably
    overscan: 5,              // render 5 extra rows above/below viewport
  });

  return (
    // Outer scroll container — fixed height, overflow-y scroll
    <div ref={parentRef} style={{ height: '600px', overflowY: 'auto' }}>
      <table style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          {/* header row */}
        </thead>
        <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                <td>{row.originalName}</td>
                {/* ... */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**Critical detail:** The `<thead>` must be `position: sticky; top: 0` so it stays visible while the tbody scrolls inside the fixed-height container. Without this the header scrolls away.

**Critical detail:** `tbody` must be `position: relative` and each `<tr>` must be `position: absolute` for the `translateY` positioning to work. Standard table flow layout does not support absolute positioning — this is the core trick of `@tanstack/react-virtual` with tables.

### Pattern 2: Sort State with useMemo

**What:** A single `useState` for sort direction. A `useMemo` computes a sorted copy of `rows` whenever `rows` or sort direction changes. The virtualizer receives the sorted copy, not the original.

**When to use:** Score-only sort with two states (asc/desc) — no need for multi-column sort infrastructure.

```typescript
type SortDir = 'asc' | 'desc';

const [sortDir, setSortDir] = useState<SortDir>('desc');  // default: highest score first

const sortedRows = useMemo(() => {
  return [...rows].sort((a, b) =>
    sortDir === 'desc'
      ? b.similarityScore - a.similarityScore
      : a.similarityScore - b.similarityScore
  );
}, [rows, sortDir]);

// Pass sortedRows to useVirtualizer, not rows
```

### Pattern 3: Client-Side CSV Blob Download

**What:** Build the CSV string in JS, wrap in a `Blob`, create an object URL, click a hidden `<a>`, then revoke the URL to free memory.

**When to use:** Any client-side file download with no server involvement needed.

```typescript
// Source: MDN Web Docs — URL.createObjectURL, Blob
function triggerCsvDownload(csvContent: string, filename: string): void {
  const BOM = '\uFEFF';  // UTF-8 BOM — Excel requires this for non-Latin chars
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);  // free memory — do not skip
}
```

**Note:** `URL.revokeObjectURL` MUST be called after the click. Without it, the Blob stays in memory for the lifetime of the page. In a long-running demo session this causes a slow memory leak.

### Pattern 4: CSV String Building (No Library)

**What:** Build CSV rows by joining fields with commas, quoting any field that contains a comma, double-quote, or newline.

```typescript
// Pure function — testable in Node without DOM
function escapeCsvField(value: string | number): string {
  const str = String(value);
  // RFC 4180: enclose in double-quotes if field contains comma, DQUOTE, or newline
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;  // double any embedded quotes
  }
  return str;
}

function buildCsvString(rows: ResultRow[]): string {
  const header = [
    'Original Name',
    'Entity Type',
    'Linguistic Region',
    'Degraded Variant',
    'Rule Applied',
    'Similarity Score',
  ].join(',');

  const dataRows = rows.map((row) =>
    [
      escapeCsvField(row.originalName),
      escapeCsvField(row.entityType),
      escapeCsvField(row.region),
      escapeCsvField(row.degradedVariant),
      escapeCsvField(row.ruleLabel),
      Math.round(row.similarityScore * 100),  // integer, no quoting needed
    ].join(',')
  );

  return [header, ...dataRows].join('\n');
}
```

**Why integer score:** The locked decision says "raw percentage integer (e.g. 94) — no ✓/✗ symbol" in the CSV. `Math.round(row.similarityScore * 100)` is safe because `similarityScore` is 0–1 from talisman's Jaro-Winkler output.

### Pattern 5: Filename Sanitization

```typescript
// Pure function — testable in Node without DOM
function sanitizeClientName(clientName: string): string {
  return clientName
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // strip non-alphanumeric, non-hyphen
    .replace(/-+/g, '-')            // collapse consecutive hyphens
    .replace(/^-|-$/g, '')          // trim leading/trailing hyphens
    || 'client';                    // fallback if empty after sanitization
}

function buildCsvFilename(clientName: string): string {
  const sanitized = sanitizeClientName(clientName);
  const date = new Date().toISOString().slice(0, 10);  // YYYY-MM-DD
  return `ofac-sensitivity-${sanitized}-${date}.csv`;
}
```

**Edge case:** Empty `clientName` (user left the field blank) — the `|| 'client'` fallback produces `ofac-sensitivity-client-2026-03-04.csv` rather than `ofac-sensitivity--2026-03-04.csv`.

### Pattern 6: Catch-Rate Computation

```typescript
// Pure function — testable in Node without DOM
function computeCatchRate(rows: ResultRow[]): {
  caught: number;
  total: number;
  percent: number;
} {
  if (rows.length === 0) return { caught: 0, total: 0, percent: 0 };
  const caught = rows.filter((r) => r.caught).length;
  const percent = Math.round((caught / rows.length) * 100);
  return { caught, total: rows.length, percent };
}
```

**Display sentence:** `{caught} of {total} degraded variants ({percent}%) would be caught at the 85% match threshold`

The threshold label "85%" is derived from `DEFAULT_CATCH_THRESHOLD` (0.85) — not hardcoded as a string but computed: `Math.round(DEFAULT_CATCH_THRESHOLD * 100)`.

### Anti-Patterns to Avoid

- **Putting `triggerCsvDownload` inside `ResultsTable` directly:** Makes the component untestable in Node. Extract to `resultsUtils.ts` and call from the `onClick` handler in the component.
- **Using `position: static` on tbody rows with `@tanstack/react-virtual`:** Standard table layout does not support `translateY`. Must use `position: absolute` on each `<tr>` within a `position: relative` `<tbody>`.
- **Forgetting sticky thead:** Without `position: sticky; top: 0` on `<thead>`, the column headers scroll out of view when the user scrolls the 600px container.
- **Virtualized rows without `height` style on `<tr>`:** The virtualizer sets `virtualRow.size` which must be applied as the `<tr>` height, otherwise row heights collapse and the layout breaks.
- **Building the CSV string inside the React render function:** Large arrays (2,000 rows) serialized on every render will stutter. Build only on button click (inside the `onClick` handler).
- **Not calling `URL.revokeObjectURL`:** Memory leak; the Blob object persists in browser memory.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Row virtualization math | Custom scroll offset → visible slice calculation | `useVirtualizer` from `@tanstack/react-virtual` | Off-by-one errors in scroll math; overscan, resize observer, dynamic heights are all non-trivial |
| RFC 4180 CSV escaping | Custom regex replace | `escapeCsvField` per Pattern 4 above | Embedded commas, newlines, and double-quotes in names (Arabic / Chinese names may have transliteration with commas) all need correct quoting |
| BOM injection | Manual hex bytes | `'\uFEFF'` string prefix | JS string '\uFEFF' is the correct UTF-8 BOM when encoded by the Blob API with charset=utf-8 |

**Key insight:** The DOM/Blob API for CSV download is so simple (~10 lines) that no library is warranted. The virtualizer math is complex enough that the library pays for itself immediately.

---

## Common Pitfalls

### Pitfall 1: `position: absolute` tbody rows break table column widths

**What goes wrong:** When `<tr>` elements are `position: absolute`, they are removed from normal table layout flow. The table does not auto-size columns based on content — every column collapses to zero width.

**Why it happens:** `position: absolute` takes an element out of the table formatting context. The browser cannot measure cell content to determine column widths.

**How to avoid:** Use `table-layout: fixed` on the `<table>` element and set explicit column widths via `<colgroup>` or `width` on `<th>` elements. Example distribution for 6 columns in max-w-5xl (~1024px):

```html
<colgroup>
  <col style={{ width: '22%' }} />  {/* Original Name */}
  <col style={{ width: '12%' }} />  {/* Entity Type */}
  <col style={{ width: '16%' }} />  {/* Linguistic Region */}
  <col style={{ width: '22%' }} />  {/* Degraded Variant */}
  <col style={{ width: '18%' }} />  {/* Rule Applied */}
  <col style={{ width: '10%' }} />  {/* Score */}
</colgroup>
```

**Warning signs:** All cell content overlaps in the first column; table appears as a single narrow strip.

### Pitfall 2: Sticky thead clips the first visible row

**What goes wrong:** With `position: sticky; top: 0` on `<thead>`, the first virtual row scrolls underneath the header. The header height (e.g. 48px) must be accounted for when the scroll container is sized.

**Why it happens:** The virtualizer measures the scroll container height and positions rows starting at `y=0` relative to the container top. The sticky header overlaps this area.

**How to avoid:** The 600px container height already accounts for the header by design (the header is inside the scroll container, not above it). Ensure the `<thead>` `background` is set (e.g. `bg-white` or the page background color) so it visually covers rows scrolling beneath it.

**Warning signs:** First data row is half-hidden behind the header when at the top of the scroll position.

### Pitfall 3: UTF-8 BOM not detected by Excel when Blob type is wrong

**What goes wrong:** Excel ignores the BOM and shows garbled characters for Arabic/Chinese/Cyrillic names.

**Why it happens:** Excel uses the MIME type and BOM together to determine encoding. If the Blob `type` is `'text/plain'` or omitted, some Excel versions ignore the BOM.

**How to avoid:** Always use `type: 'text/csv;charset=utf-8;'` — the exact string, with the semicolon before charset. Verified behavior from MDN and multiple Stack Overflow reports.

**Warning signs:** Opening CSV in Excel shows `Ã¢Â€` style garbage for non-Latin characters.

### Pitfall 4: `rows.length === 0` Download CSV button not disabled

**What goes wrong:** User clicks Download CSV before running a test. The resulting file is a headers-only CSV with zero data rows — confusing in a demo context.

**How to avoid:** `<Button disabled={rows.length === 0}>Download CSV</Button>`. The locked decision specifies this behavior explicitly.

### Pitfall 5: `toISOString()` date is UTC, not local date

**What goes wrong:** A consultant runs the tool at 10 PM EST. `new Date().toISOString().slice(0, 10)` returns tomorrow's date in UTC (e.g. `2026-03-05` when local date is `2026-03-04`). The filename is confusing.

**Why it happens:** `toISOString()` always returns UTC. EST is UTC-5, so after 7 PM EST the UTC date rolls to the next day.

**How to avoid:** For a demo tool, this is an acceptable known limitation — do not add timezone complexity. If it matters in Phase 7 polish, use `new Date().toLocaleDateString('en-CA')` which returns `YYYY-MM-DD` in local time. Document the decision.

---

## Code Examples

### Complete ResultsTable component skeleton

```typescript
// Source: pattern derived from @tanstack/react-virtual v3 docs + project constraints
// src/components/ResultsTable.tsx
'use client';

import { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import type { ResultRow } from '@/types';
import { DEFAULT_CATCH_THRESHOLD } from '@/lib/constants';
import {
  computeCatchRate,
  buildCsvString,
  buildCsvFilename,
  triggerCsvDownload,
} from '@/lib/resultsUtils';

interface ResultsTableProps {
  rows: ResultRow[];
  clientName: string;
}

type SortDir = 'asc' | 'desc';

export function ResultsTable({ rows, clientName }: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        sortDir === 'desc'
          ? b.similarityScore - a.similarityScore
          : a.similarityScore - b.similarityScore,
      ),
    [rows, sortDir],
  );

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 5,
  });

  const { caught, total, percent } = computeCatchRate(rows);
  const threshold = Math.round(DEFAULT_CATCH_THRESHOLD * 100);

  const handleDownload = () => {
    const csv = buildCsvString(rows);  // unsorted — download full dataset
    triggerCsvDownload(csv, buildCsvFilename(clientName));
  };

  if (rows.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-3 px-4">
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {caught} of {total} degraded variants ({percent}%) would be caught at the {threshold}% match threshold
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={rows.length === 0}
        >
          Download CSV
        </Button>
      </div>

      {/* Table scroll container */}
      <div ref={parentRef} style={{ height: '600px', overflowY: 'auto' }} className="rounded-md border">
        <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Original Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Entity Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Linguistic Region</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Degraded Variant</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Rule Applied</th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none"
                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              >
                Score {sortDir === 'desc' ? '↓' : '↑'}
              </th>
            </tr>
          </thead>
          <tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = sortedRows[virtualRow.index];
              const pct = Math.round(row.similarityScore * 100);
              return (
                <tr
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                  className="border-b"
                >
                  <td className="px-3 py-2 text-sm truncate">{row.originalName}</td>
                  <td className="px-3 py-2 text-sm">{row.entityType}</td>
                  <td className="px-3 py-2 text-sm">{row.region}</td>
                  <td className="px-3 py-2 text-sm truncate">{row.degradedVariant}</td>
                  <td className="px-3 py-2 text-sm">{row.ruleLabel}</td>
                  <td className="px-3 py-2 text-sm font-mono">
                    {pct}% {row.caught ? '✓' : '✗'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Complete resultsUtils.ts module (all testable pure functions)

```typescript
// src/lib/resultsUtils.ts
import type { ResultRow } from '@/types';

export function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvString(rows: ResultRow[]): string {
  const header = [
    'Original Name',
    'Entity Type',
    'Linguistic Region',
    'Degraded Variant',
    'Rule Applied',
    'Similarity Score',
  ].join(',');

  const dataRows = rows.map((row) =>
    [
      escapeCsvField(row.originalName),
      escapeCsvField(row.entityType),
      escapeCsvField(row.region),
      escapeCsvField(row.degradedVariant),
      escapeCsvField(row.ruleLabel),
      Math.round(row.similarityScore * 100),
    ].join(',')
  );

  return [header, ...dataRows].join('\n');
}

export function sanitizeClientName(clientName: string): string {
  return (
    clientName
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'client'
  );
}

export function buildCsvFilename(clientName: string): string {
  const sanitized = sanitizeClientName(clientName);
  const date = new Date().toISOString().slice(0, 10);
  return `ofac-sensitivity-${sanitized}-${date}.csv`;
}

export function computeCatchRate(rows: ResultRow[]): {
  caught: number;
  total: number;
  percent: number;
} {
  if (rows.length === 0) return { caught: 0, total: 0, percent: 0 };
  const caught = rows.filter((r) => r.caught).length;
  return { caught, total: rows.length, percent: Math.round((caught / rows.length) * 100) };
}

/** Browser-only — do not call in Node/Vitest context */
export function triggerCsvDownload(csvContent: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-window` / `react-virtualized` | `@tanstack/react-virtual` v3 | ~2022 | Smaller, framework-agnostic, no opinion on markup |
| `@tanstack/react-table` (full suite) | Plain `<table>` + `useVirtualizer` only | Locked decision | Removes 50KB+ of table-management overhead for features not needed |
| FileSaver.js for Blob downloads | Native `URL.createObjectURL` + `<a>.click()` | ~2019 (broad browser support) | Zero dependency; works in all modern browsers |
| `papaparse` for CSV building | Manual RFC 4180 string building | — | Sufficient for structured data; papaparse is needed for parsing, not generation |

**Deprecated/outdated:**
- `react-virtualized`: No longer maintained; replaced by `@tanstack/react-virtual`
- `react-window`: Lower adoption than `@tanstack/react-virtual` for new projects in 2025–2026
- `saveAs` from `file-saver`: Unnecessary wrapper around browser-native APIs that now have broad support

---

## Open Questions

1. **`toISOString()` UTC date vs local date in filename**
   - What we know: `new Date().toISOString().slice(0, 10)` returns UTC date, which can be one day ahead of local date after ~7 PM EST
   - What's unclear: Whether consultants will notice or care in demo context
   - Recommendation: Use `toISOString()` in Phase 6 (simpler, no timezone complexity). Document as known limitation. If raised in Phase 7 polish, switch to `toLocaleDateString('en-CA')`.

2. **Row height for virtualizer `estimateSize`**
   - What we know: CONTEXT.md says "typically 40–48px per row" — this is Claude's discretion area
   - What's unclear: Actual rendered height depends on font size, padding, and whether names wrap
   - Recommendation: Use `estimateSize: () => 44` (middle of range). Truncate long cell content with `overflow: hidden; text-overflow: ellipsis` to prevent row height variation. `@tanstack/react-virtual` v3 supports `measureElement` for dynamic heights but that adds complexity — not needed if content is truncated.

3. **`ResultsTable` renders `null` when `rows.length === 0` vs. showing an empty state**
   - What we know: CONTEXT.md does not specify behavior when rows are empty (before first run)
   - What's unclear: Should there be a "Run the test above to see results" placeholder?
   - Recommendation: Return `null` for `rows.length === 0` (no placeholder) — keeps Phase 6 minimal; Phase 7 can add a placeholder if desired.

---

## Validation Architecture

> `nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (existing) |
| Quick run command | `npx vitest run src/lib/__tests__/resultsUtils.test.ts` |
| Full suite command | `npx vitest run` |

### The Node Environment Constraint

The Vitest config uses `environment: 'node'` and `include: 'src/**/__tests__/**/*.test.ts'`. This means:

- **Cannot test:** React component rendering (`ResultsTable.tsx`), DOM APIs (`document.createElement`, `URL.createObjectURL`, `Blob`), `useVirtualizer` hook
- **Can test:** All pure TypeScript functions in `resultsUtils.ts` — `escapeCsvField`, `buildCsvString`, `sanitizeClientName`, `buildCsvFilename`, `computeCatchRate`
- **Strategy:** Extract all business logic to `src/lib/resultsUtils.ts`. The component (`ResultsTable.tsx`) is not unit-tested in this project (consistent with how `page.tsx` and other components have been treated — only pure helpers in `lib/` get tests). Human verification substitutes for component-level automated testing.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RSLT-01 | Table displays all 6 columns with correct field mapping | manual-only | N/A — component render not testable in node env | N/A |
| RSLT-02 | Score displayed as `{pct}% ✓/✗` with correct percentage | unit | `npx vitest run src/lib/__tests__/resultsUtils.test.ts` | ❌ Wave 0 |
| RSLT-03 | Catch-rate sentence shows correct N/M/P values | unit | `npx vitest run src/lib/__tests__/resultsUtils.test.ts` | ❌ Wave 0 |
| RSLT-04 | Table handles 2000+ rows without layout thrashing | manual-only | N/A — DOM performance not testable in node env | N/A |
| EXPO-01 | Download CSV button triggers file download | manual-only | N/A — Blob/URL APIs not available in node env | N/A |
| EXPO-02 | CSV contains UTF-8 BOM; string starts with `\uFEFF` | unit | `npx vitest run src/lib/__tests__/resultsUtils.test.ts` | ❌ Wave 0 |
| EXPO-03 | Filename contains sanitized clientName | unit | `npx vitest run src/lib/__tests__/resultsUtils.test.ts` | ❌ Wave 0 |

**Manual verification checklist (for human sign-off):**
- [ ] RSLT-01: All 6 columns visible with correct labels
- [ ] RSLT-04: Scroll 2000-row table — no visible lag, scrollbar proportional
- [ ] EXPO-01: Click Download CSV — browser file save dialog appears
- [ ] EXPO-02: Open CSV in Excel — Arabic/Chinese/Cyrillic names render correctly
- [ ] RSLT-02 (visual): Score column shows `94% ✓` / `61% ✗` format

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/__tests__/resultsUtils.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + manual checklist complete before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/resultsUtils.test.ts` — covers RSLT-02, RSLT-03, EXPO-02, EXPO-03 unit assertions
  - `escapeCsvField` — comma/quote/newline escaping
  - `buildCsvString` — header row present, correct column order, score is integer
  - `sanitizeClientName` — spaces → hyphens, strips special chars, empty string fallback
  - `buildCsvFilename` — contains sanitized clientName and YYYY-MM-DD date
  - `computeCatchRate` — correct caught/total/percent; empty array returns zeros

*(No new test framework install needed — Vitest 4 already configured and running.)*

---

## Sources

### Primary (HIGH confidence)
- `@tanstack/react-virtual` v3 README and docs at https://tanstack.com/virtual/v3/docs/introduction — virtualizer hook API, tbody/tr position:absolute pattern
- MDN Web Docs — `Blob`, `URL.createObjectURL`, `URL.revokeObjectURL` — browser-native CSV download
- RFC 4180 (CSV spec) — field quoting rules (double-quote escaping)
- Project source files read directly: `src/types/index.ts`, `src/lib/constants.ts`, `src/app/page.tsx`, `vitest.config.ts`, `package.json`

### Secondary (MEDIUM confidence)
- Excel UTF-8 BOM behavior: widely documented pattern; `\uFEFF` prefix + `text/csv;charset=utf-8;` Blob type — confirmed by multiple developer community sources
- `table-layout: fixed` + absolute-positioned tbody rows: documented limitation of CSS table model requiring explicit column widths via `<colgroup>`

### Tertiary (LOW confidence — needs validation)
- Row height 44px estimate: Claude's discretion area per CONTEXT.md; actual height depends on Tailwind `text-sm` + `py-2` padding = ~12px content + ~16px padding = ~40-44px. Validate visually.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@tanstack/react-virtual` is locked; no alternatives considered; verified not yet installed
- Architecture: HIGH — virtualizer pattern is from official docs; CSV pattern is browser-native with no ambiguity
- Pitfalls: HIGH — `position: absolute` tbody behavior, sticky thead, BOM type string are all well-documented
- Test strategy: HIGH — node-only Vitest constraint is a hard fact from `vitest.config.ts`; pure-function extraction strategy is verified against existing project test patterns

**Research date:** 2026-03-04
**Valid until:** 2026-09-04 (stable APIs; `@tanstack/react-virtual` v3 has been stable since 2023)
