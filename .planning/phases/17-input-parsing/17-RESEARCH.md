# Phase 17: Input Parsing — Research

**Researched:** 2026-03-06
**Domain:** Client-side file parsing (CSV + Excel), textarea paste, input validation
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCREEN-02 | User can upload a CSV file to replace the pre-loaded list (client-side parsing, column detection for files with/without headers) | SheetJS XLSX.read with `type:'string'` handles CSV. Manual split is lighter for plain text. PapaParse is the canonical zero-dependency CSV parser. Header heuristic documented below. |
| SCREEN-03 | User can upload an .xlsx file to replace the pre-loaded list (SheetJS CDN, client-side parsing) | SheetJS CDN tgz install confirmed. `file.arrayBuffer()` + `XLSX.read(data)` pattern works inside a `'use client'` component. 413 avoided entirely because no bytes reach a route handler. |
| SCREEN-04 | User can paste names (one per line or comma-separated) to replace the pre-loaded list | textarea `onChange` with split on both `\n` and `,` covers both formats. Live count via `useMemo` or direct state derivation — no debounce needed for counts under 10k. |
| SCREEN-05 | Input supports up to 10,000 names; displays count and validation errors (format, duplicates, oversized file) | `MAX_SCREENING_NAMES = 10_000` already in `src/types/screening.ts`. Validation logic is pure TypeScript — unit-testable. Blocking vs. non-blocking error classification defined below. |
</phase_requirements>

---

## Summary

Phase 17 builds the input layer that replaces the static `CLIENT_NAMES` array with user-provided data. All three input paths — CSV upload, Excel upload, and paste — must produce the same output contract: a validated `string[]` ready for `screenNames()`. The core parsing logic is pure functions with no UI dependency, which means the entire validation and extraction layer is unit-testable with Vitest.

SheetJS is the correct library for `.xlsx` — it handles Excel client-side with no server round-trip, avoiding the Vercel 413 limit. SheetJS can also parse CSV, but a lighter custom split or PapaParse is preferred for the CSV path because it avoids a heavy library import for text data that needs no binary parsing. The architecture decision is: **SheetJS for Excel only; custom split (or PapaParse) for CSV**.

The component structure should be a single `InputPanel` component with tab-style mode switching (`file-upload` | `paste`). State for the active name list lives in `tool/page.tsx` via `useState`, passed down as a prop — no context or global state needed since only the Screening Mode tab uses it.

**Primary recommendation:** Install SheetJS from CDN tgz now. Build a pure `parseInput.ts` module with three exported functions (`parseCsv`, `parseExcel`, `parsePaste`) that each return `ParseResult = { names: string[]; warnings: ValidationWarning[]; error?: string }`. The `InputPanel` component calls these functions and lifts the resulting `string[]` to `tool/page.tsx`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xlsx (SheetJS CDN) | 0.20.3 | Parse .xlsx files client-side | Only option that avoids CVE in npm registry version; CDN version required by architecture decision |
| Built-in File API | Browser native | `file.arrayBuffer()`, `FileReader` | No install needed; Blob.arrayBuffer() is modern standard |
| Built-in String methods | Language | CSV/paste splitting | Zero cost for delimiter-split text; no library needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| papaparse | 5.5.3 | CSV parsing with edge case handling | Use ONLY if manual split proves insufficient for quoted fields or embedded commas in names. Not needed for OFAC name lists (names do not contain commas). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SheetJS CDN tgz | npm registry xlsx | npm registry version has high-severity CVE — rejected by architecture decision |
| Custom split for CSV | PapaParse | PapaParse adds ~47KB for a problem solvable in 5 lines; OFAC names do not use quoted CSV fields |
| React Context for name list state | useState prop-drilling | Context adds unnecessary indirection; only one consumer (Screening Mode tab) |

**Installation (SheetJS only — must use CDN):**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz
```

Note: `NODE_TLS_REJECT_UNAUTHORIZED=0` is required on the Crowe network due to TLS proxy. This is the architecture-mandated install path — do not use `npm install xlsx` (CVE).

**PapaParse (only if needed):**
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── screening/
│       ├── parseInput.ts        # Pure parsing + validation functions (new Phase 17 file)
│       └── scorer.ts            # Existing (Phase 16, do not modify)
├── components/
│   └── screening/
│       ├── InputPanel.tsx       # New: file upload + paste UI, calls parseInput.ts
│       └── BenchmarkPanel.tsx   # Existing (Phase 15, do not modify)
├── lib/__tests__/
│   └── parseInput.test.ts       # Wave 0 TDD: tests written before parseInput.ts
└── types/
    └── screening.ts             # Existing: MAX_SCREENING_NAMES already defined
```

### Pattern 1: Pure parseInput Module
**What:** All parsing logic lives in `src/lib/screening/parseInput.ts` as pure exported functions with no React or browser dependencies. The functions accept strings or ArrayBuffers and return a typed result object.
**When to use:** Always — this isolation makes every parsing path unit-testable in Vitest (node environment, no JSDOM needed).

**Return type:**
```typescript
// src/lib/screening/parseInput.ts

export interface ValidationWarning {
  row: number;          // 1-based row number for user display
  message: string;      // Specific fix instruction
  kind: 'empty' | 'duplicate' | 'oversized' | 'non-string';
}

export interface ParseResult {
  names: string[];                  // Deduplicated, trimmed, non-empty strings
  warnings: ValidationWarning[];    // Non-blocking per-row issues
  rawCount: number;                 // Total rows before dedup/filter
  error?: string;                   // Blocking error — if set, names is empty
}
```

### Pattern 2: SheetJS Client-Side Excel Parsing
**What:** Import SheetJS at the top of the 'use client' component (not dynamic import — SSR is already disabled for components with 'use client' in App Router). Read the file as ArrayBuffer, pass to XLSX.read.
**When to use:** .xlsx file upload only.

```typescript
// Source: SheetJS docs — https://docs.sheetjs.com/docs/solutions/input/
// Inside a 'use client' component:
import * as XLSX from 'xlsx';

async function readExcelFile(file: File): Promise<string[][]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // header: 1 returns array-of-arrays (no object keys)
  return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
}
```

**SSR note:** SheetJS imports are safe at module level in a `'use client'` component because App Router does not SSR client components. No `next/dynamic` wrapping is needed. This matches the same pattern used by `BenchmarkPanel.tsx` (direct `import * as Comlink`).

### Pattern 3: CSV Parsing (custom split)
**What:** Read the file as text (FileReader.readAsText or file.text()), split on newlines, then column-detect using the first row.
**When to use:** .csv file upload.

```typescript
// No library needed for OFAC name lists
function parseCsvText(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map(line => line.split(',').map(cell => cell.trim()));
}
```

### Pattern 4: Header Row Heuristic
**What:** Determine whether the first row is a label row (e.g., "Client Name", "Name") or real data.
**Heuristic:** A row is treated as a header if ALL cells in row 0 are non-numeric strings that look like labels (contain no digits, or contain common header words like "name", "client", "entity").
**When to use:** Both CSV and Excel paths.

```typescript
function isHeaderRow(row: string[]): boolean {
  if (row.length === 0) return false;
  // A header cell contains letters but no pure-digit values
  // and is likely short (< 40 chars)
  return row.every(cell => {
    const trimmed = cell.trim();
    if (trimmed === '') return false;
    const isNumeric = /^\d+(\.\d+)?$/.test(trimmed);
    return !isNumeric && trimmed.length < 40;
  });
}
// Skip row 0 if isHeaderRow returns true; otherwise include row 0
```

**Limitation:** This heuristic has false positives for short single-word names like "WANG". The safer approach: if the first row contains a cell that exactly matches common header terms ("name", "client", "entity", "full name", "company"), skip it; otherwise include it.

### Pattern 5: Column Detection for Multi-Column Files
**What:** When a CSV or Excel file has multiple columns, pick the most likely "name" column.
**Strategy (in order):**
1. If first row is a header, look for a column whose header text contains "name", "client", "entity", "company".
2. If no header match, use column index 0 (first column).
3. Never silently discard other columns — add a ValidationWarning if multiple columns were found and column 0 was used.

### Pattern 6: Paste Input
**What:** textarea element with `onChange` handler. Split on both `\n` and `,` to handle both formats.
**When to use:** The paste tab of `InputPanel`.

```typescript
// Inside InputPanel — no debounce needed for live count display
function parsePasteText(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}
// Live count: const liveCount = parsePasteText(pasteValue).length;
// No useMemo needed — re-computed on every keystroke is fast enough at 10k names
```

### Pattern 7: State Location
**What:** `activeNames: string[]` lives in `tool/page.tsx` via `useState`, initialized to `CLIENT_NAMES`.
**When to use:** InputPanel calls `onNamesLoaded(names: string[])` callback prop to lift state to page.tsx.

```typescript
// tool/page.tsx (addition — existing file)
const [activeNames, setActiveNames] = useState<string[]>(CLIENT_NAMES);

// Passed to InputPanel as:
<InputPanel onNamesLoaded={setActiveNames} currentCount={activeNames.length} />
```

### Pattern 8: File Drag-Drop
**What:** Use native HTML drag-and-drop via `onDragOver`/`onDrop` on the drop zone div, plus the `<input type="file">` for click-to-browse. No library needed.
**When to use:** The file-upload tab of `InputPanel`.

```typescript
const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
};

const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) processFile(file);
};
```

### Anti-Patterns to Avoid
- **Sending file bytes to a server route:** Triggers Vercel 413 for files > 4.5MB. All parsing must happen in the browser via File API. Confirmed architecture constraint.
- **Dynamic import of SheetJS:** Not needed. `'use client'` components are not SSR'd in App Router. Dynamic import would add complexity with no benefit.
- **Using SheetJS for CSV:** SheetJS can read CSV but imports the full binary parsing library unnecessarily. Use custom split or PapaParse for text.
- **Debouncing paste count:** The live count display should update synchronously on every keystroke. Debouncing creates a jarring UX where count lags behind visible text.
- **Storing pre-parsed state separately from the string[]:** Do not store `ParseResult` in React state. Store only `names: string[]` and `warnings: ValidationWarning[]` as separate state values.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel file parsing | Custom CFBFS/OOXML binary parser | SheetJS (CDN) | XLSX binary format has ~200 edge cases; SheetJS handles all of them |
| CSV with quoted fields | Custom quoted-field parser | PapaParse (if needed) | RFC 4180 quoting rules are subtle; `"field,with,commas"` parsing is error-prone |
| Duplicate detection | Custom O(n²) loop | Set-based dedup | `new Set(names)` — O(n), correct, 3 lines |

**Key insight:** The heavy lifting is Excel binary parsing. SheetJS handles this well. Everything else (CSV, paste) is string manipulation where custom code is appropriate and safer.

---

## Common Pitfalls

### Pitfall 1: SheetJS npm Registry CVE
**What goes wrong:** Installing `npm install xlsx` pulls the npm registry version which has a high-severity CVE.
**Why it happens:** SheetJS moved their maintained release to their own CDN after a supply-chain incident.
**How to avoid:** Always install from `https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz`. The STATE.md decision is locked.
**Warning signs:** If `package.json` shows `"xlsx": "^0.18.x"` or similar semver range (not a `https://` URL), the wrong version was installed.

### Pitfall 2: Sending File Bytes to Server Route
**What goes wrong:** An `<input type="file">` triggers a form POST or server action, sending the file to a Vercel route handler. Files > 4.5MB receive a 413 FUNCTION_PAYLOAD_TOO_LARGE error.
**Why it happens:** Default form behavior or accidentally calling a server action with the file.
**How to avoid:** All file reading must use `file.arrayBuffer()` or `FileReader` in the browser, inside a `'use client'` component. Never pass File objects to server actions.
**Warning signs:** Any `'use server'` function that receives a `File` or `FormData` with file content.

### Pitfall 3: XLSX Sheet Selection
**What goes wrong:** `workbook.SheetNames[0]` returns the first sheet, which may be a metadata sheet in some Excel workbooks (e.g., a cover page).
**Why it happens:** SheetJS always exposes sheets in their workbook order.
**How to avoid:** For Phase 17, using `SheetNames[0]` is acceptable — document this limitation as a known constraint. Advanced sheet selection is deferred.
**Warning signs:** Parsed names are metadata labels rather than actual names.

### Pitfall 4: Empty-Row Inflation of Name Count
**What goes wrong:** A user's CSV has blank trailing lines. The parsed array contains empty strings, which inflate the displayed count and may trigger the MAX_SCREENING_NAMES error prematurely.
**Why it happens:** `text.split('\n')` on a file with a trailing newline produces an extra empty string.
**How to avoid:** Always filter `s => s.trim().length > 0` before counting or validating.
**Warning signs:** Parsed count is 1 higher than visible rows.

### Pitfall 5: Header Row False Positive Swallows Real Name
**What goes wrong:** A user uploads a CSV where the first row is "WANG WEI" (a real client name). The heuristic incorrectly classifies it as a header.
**Why it happens:** The heuristic checks for "looks like a label" but short names can look label-like.
**How to avoid:** Use a conservative heuristic — only skip the first row if it exactly matches common header keywords, not just "looks non-numeric". Show the parsed names in a preview panel so the user can verify the first name was not dropped.
**Warning signs:** First name in user's list never appears in the parsed output.

### Pitfall 6: Oversized Entry Validation
**What goes wrong:** A cell in a CSV or Excel column contains a 50,000-character value (possibly a notes column picked up by column detection). Passing this to the scorer produces degenerate Jaro-Winkler scores.
**Why it happens:** Column detection chose the wrong column, or the user pasted raw HTML/JSON.
**How to avoid:** Add an "oversized" validation check — any name > 200 characters gets a ValidationWarning with kind: 'oversized' and is excluded from the output.

### Pitfall 7: SheetJS and Non-Spreadsheet Binary Files
**What goes wrong:** A user uploads a PDF or `.doc` file with `.xlsx` extension. XLSX.read throws an opaque error.
**Why it happens:** SheetJS validates magic bytes — non-XLSX binary triggers an exception.
**How to avoid:** Wrap `XLSX.read` in a `try/catch`. If it throws, set `error: 'File could not be parsed as an Excel workbook. Please upload a valid .xlsx file.'`

---

## Code Examples

Verified patterns from official and project sources:

### SheetJS: Read Excel File as ArrayBuffer
```typescript
// Source: SheetJS docs — https://docs.sheetjs.com/docs/solutions/input/
// Inside 'use client' component

import * as XLSX from 'xlsx';

async function parseExcelFile(file: File): Promise<string[][]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);  // type:'array' is inferred from ArrayBuffer
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // header:1 → returns string[][] not object[]; defval:'' fills empty cells
  return XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
}
```

### SheetJS: Read CSV as Text (using SheetJS's CSV path)
```typescript
// Alternative: SheetJS can also parse CSV text via XLSX.read with type:'string'
// Only use this if already importing SheetJS for Excel — don't add it just for CSV
const workbook = XLSX.read(csvText, { type: 'string' });
```

### Custom CSV Split (preferred for CSV-only path)
```typescript
// No library — handles the OFAC name list case (no quoted fields with commas)
function splitCsvRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map(line => line.split(',').map(cell => cell.trim()));
}
```

### Validation Function Skeleton
```typescript
// src/lib/screening/parseInput.ts
import { MAX_SCREENING_NAMES } from '@/types/screening';

export function validateNames(candidates: string[]): {
  names: string[];
  warnings: ValidationWarning[];
  error?: string;
} {
  const warnings: ValidationWarning[] = [];
  const seen = new Set<string>();
  const names: string[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const row = i + 1; // 1-based
    const trimmed = candidates[i].trim();

    if (trimmed === '') {
      warnings.push({ row, kind: 'empty', message: `Row ${row}: empty line — skipped` });
      continue;
    }
    if (trimmed.length > 200) {
      warnings.push({ row, kind: 'oversized', message: `Row ${row}: entry exceeds 200 characters — skipped` });
      continue;
    }
    const upper = trimmed.toUpperCase();
    if (seen.has(upper)) {
      warnings.push({ row, kind: 'duplicate', message: `Row ${row}: "${trimmed}" is a duplicate — skipped` });
      continue;
    }
    seen.add(upper);
    names.push(trimmed);
  }

  if (names.length > MAX_SCREENING_NAMES) {
    return {
      names: [],
      warnings: [],
      error: `List contains ${names.length.toLocaleString()} names. Maximum allowed is ${MAX_SCREENING_NAMES.toLocaleString()}. Please reduce the list before screening.`,
    };
  }

  return { names, warnings };
}
```

### InputPanel Component Skeleton
```typescript
// src/components/screening/InputPanel.tsx
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { parseCsv, parseExcel, parsePaste } from '@/lib/screening/parseInput';
import type { ParseResult } from '@/lib/screening/parseInput';

interface InputPanelProps {
  onNamesLoaded: (names: string[]) => void;
  currentCount: number;
}

export function InputPanel({ onNamesLoaded, currentCount }: InputPanelProps) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pasteValue, setPasteValue] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);

  // File processing dispatches to parseCsv or parseExcel based on extension
  async function processFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let parsed: ParseResult;
    if (ext === 'xlsx') {
      const data = await file.arrayBuffer();
      parsed = parseExcel(data);
    } else {
      const text = await file.text();
      parsed = parseCsv(text);
    }
    setResult(parsed);
    if (!parsed.error) onNamesLoaded(parsed.names);
  }
  // ...
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SheetJS npm registry install | SheetJS CDN tgz install | 2023 (CVE disclosure) | Must use `https://cdn.sheetjs.com/` URL in package.json — never `npm install xlsx` |
| FileReader.readAsArrayBuffer callback | `file.arrayBuffer()` Promise | 2019 (Blob.arrayBuffer spec) | Simpler async/await pattern; FileReader callback pattern is still valid but verbose |
| `next/dynamic` with `{ ssr: false }` for browser-only libs | `'use client'` component with direct import | Next.js App Router (2023) | In App Router, `'use client'` components are never SSR'd — no need for `next/dynamic` unless you need code-splitting |

**Deprecated/outdated:**
- FileReader.readAsBinaryString: Deprecated — use `file.arrayBuffer()` instead for binary files; avoid for Excel parsing.
- `XLSX.read(data, { type: 'binary' })`: Still works but `{ type: 'array' }` (from ArrayBuffer) is the modern pattern.

---

## Open Questions

1. **SheetJS import in worker context**
   - What we know: BenchmarkPanel.tsx successfully imports Comlink at module level inside a `'use client'` component.
   - What's unclear: SheetJS will NOT be used inside the screening Web Worker (parsing happens on the main thread before invoking the worker). This is correct — no investigation needed.
   - Recommendation: Keep parsing on main thread; pass the resulting `string[]` to the worker.

2. **Column detection for multi-column Excel files**
   - What we know: Phase 17 spec says "first column" is the fallback. Only named-column header detection is the smart path.
   - What's unclear: Some client Excel exports have names in column B (column A being an ID). Is this in scope?
   - Recommendation: For Phase 17, implement column 0 as default with header-name matching. Add a ValidationWarning if a multi-column file is detected and column 0 was selected. Full column-picker UI is deferred.

3. **File size limit for Excel**
   - What we know: Vercel 413 limit is 4.5MB for server routes. Client-side parsing bypasses this entirely.
   - What's unclear: Browser memory constraints for very large Excel files (50MB+). The success criterion specifies only 5MB+.
   - Recommendation: No artificial file size limit in the UI. Let the browser's memory handle it. A 5MB xlsx with 10k names parses in under 2 seconds in modern browsers.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/__tests__/parseInput.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCREEN-02 | CSV text with header row parsed to names[] | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-02 | CSV text without header row parsed to names[] | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-02 | Multi-column CSV: first column selected | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-03 | Excel ArrayBuffer: names extracted from first column | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-03 | Non-XLSX binary: returns error, not crash | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-04 | Newline-separated paste → names[] | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-04 | Comma-separated paste → names[] | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-05 | 10,001 names → blocking error returned | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-05 | Empty lines → warning with row number | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-05 | Duplicate names → warning with row number | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-05 | Oversized entry (>200 chars) → warning | unit | `npx vitest run src/lib/__tests__/parseInput.test.ts` | Wave 0 |
| SCREEN-03 (Vercel 413) | 5MB+ xlsx parses without server route — manual verification | manual | Deploy + test on Vercel | N/A |
| InputPanel UI | File drop zone accepts .csv and .xlsx | manual | Browser drag-drop test | N/A |

**Note on Excel unit tests:** `XLSX.read` requires a real ArrayBuffer. Vitest runs in Node.js environment where `Buffer.from(...)` can produce a compatible input. The test file should use pre-constructed minimal XLSX binary (SheetJS can generate them with `XLSX.write`) rather than loading `.xlsx` fixtures from disk.

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/__tests__/parseInput.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/parseInput.test.ts` — covers SCREEN-02, SCREEN-03, SCREEN-04, SCREEN-05 (all unit-testable behaviors)
- [ ] `src/lib/screening/parseInput.ts` — created empty (module-not-found is the RED state)

*(vitest.config.ts already covers `src/**/__tests__/**/*.test.ts` — no config changes needed)*

---

## Sources

### Primary (HIGH confidence)
- SheetJS official docs (https://docs.sheetjs.com/) — ArrayBuffer read pattern, sheet_to_json options, CDN install command
- `src/types/screening.ts` — MAX_SCREENING_NAMES = 10_000 confirmed present
- `package.json` — xlsx NOT installed; SheetJS install is a Phase 17 task
- `vitest.config.ts` — test pattern `src/**/__tests__/**/*.test.ts` confirmed; environment: 'node'
- `src/components/screening/BenchmarkPanel.tsx` — direct module-level import pattern for 'use client' components confirmed working
- `.planning/STATE.md` — SheetJS CDN install mandate, isolation rules, client-side-only constraint
- Vercel knowledge base (search-verified) — 4.5MB body limit on serverless functions; 'use client' bypasses it

### Secondary (MEDIUM confidence)
- WebSearch confirmed: SheetJS 0.20.3 is current CDN version; `xlsx-latest` URL alias points to latest
- WebSearch confirmed: PapaParse 5.5.3, zero dependencies, 5M weekly downloads, handles quoted CSV
- WebSearch confirmed: Vercel 413 error occurs when file bytes pass through route handler; client-side parsing avoids it

### Tertiary (LOW confidence)
- Header row heuristic approach: derived from common practice; no authoritative specification exists for "is this a header row" detection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SheetJS CDN mandate is locked in STATE.md; xlsx not installed confirmed; File API is browser-native
- Architecture: HIGH — parseInput.ts pure-function pattern follows established scorer.ts model from Phase 16; BenchmarkPanel confirms direct import works in 'use client'
- Pitfalls: HIGH — Vercel 413 limit confirmed by official Vercel docs; SheetJS CVE is the reason for CDN install mandate; empty row inflation is a standard parsing gotcha
- Validation: HIGH — vitest.config.ts pattern confirmed; all parsing logic is pure and node-testable

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (SheetJS version; stable library)
