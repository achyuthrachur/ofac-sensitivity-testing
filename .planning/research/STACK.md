# Stack Research

**Domain:** v3.0 Screening Engine — OFAC multi-algorithm matching, file upload, PDF export, longitudinal chart
**Researched:** 2026-03-06
**Confidence:** HIGH for phonetics/metrics (talisman already installed, verified locally); MEDIUM for PDF/chart/upload (WebSearch + issue tracker cross-reference)

---

## Context: What Already Exists (Do NOT Re-Install)

This document covers only NEW additions for v3.0. Everything below is already validated in `package.json`.

| Already Installed | Version | Relevant to v3.0 |
|-------------------|---------|------------------|
| next | 16.1.6 | Route handlers for file upload + PDF export endpoints |
| react + react-dom | 19.2.3 | Chart components must declare `'use client'` |
| talisman | ^1.1.4 | **Contains Double Metaphone AND all fuzzy metrics — no new phonetics/distance library needed** |
| tailwindcss | ^4 | Unchanged |
| @tanstack/react-virtual | ^3.13.19 | Reuse for screening results virtualized table |
| animejs | ^4.3.6 | Reuse for chart entrance animations |
| motion | ^12.35.0 | Unchanged |

---

## Critical Discovery: talisman Already Covers Questions 1 and 2

**Verified locally** (`node_modules/talisman/phonetics/` and `node_modules/talisman/metrics/`):

- `talisman/phonetics/double-metaphone` — exports `doubleMetaphone(str): [primary4char, secondary4char]`
- `talisman/metrics/jaro-winkler` — already in use (confirmed in `src/app/actions/runTest.ts`)

There is **no Token Sort Ratio** in talisman. That is a fuzzywuzzy pattern — requires sorting tokens, joining, then scoring. It must be implemented as a pure TypeScript helper function (~10 lines) using talisman's Levenshtein or Jaro-Winkler metric on the pre-sorted token strings. No new library needed.

---

## New npm Dependencies for v3.0

### Core New Additions

| Technology | Version to Install | Purpose | Why Recommended |
|------------|-------------------|---------|-----------------|
| recharts | ^3.7.0 | Longitudinal simulation chart — catch rate lines, threshold bands, evasion tier markers, secondary bar axis | Current version 3.7.0 (verified npm search 2026-03-06). `ComposedChart` supports `Line` + `Bar` + dual `YAxis` + `ReferenceLine` with `strokeDasharray` for dashed markers. React 19 compatible. SVG-based so no canvas memory issues. Works as `'use client'` component — no SSR constraint since the chart is always interactive. Most widely adopted React chart library (~4M weekly downloads). Lowest integration cost for this stack. |
| @react-pdf/renderer | ^4.x | PDF compliance memo export with Crowe header, tiered match records | Server-side `renderToBuffer` in a route handler (`app/api/pdf/route.ts`) works on Next.js 14.1.1+ (confirmed fix). Next.js 16.1.6 is well past the fixed version. React component-based PDF layout matches existing code style. Declarative document structure (`<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>`) is straightforward for a compliance memo format. jsPDF is browser-only by default; pdfmake has worse TypeScript support. |
| xlsx | (SheetJS CDN install — see below) | Parse uploaded .xlsx files server-side or client-side | The npm registry version of `xlsx` is 2+ years stale with a high-severity vulnerability — **do not `npm install xlsx`**. Install from SheetJS CDN: `npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz`. Provides `XLSX.read(buffer, {type:'buffer'})` and `XLSX.utils.sheet_to_json()`. Handles .xlsx client-side in a browser `FileReader.readAsArrayBuffer()` flow, meaning the file never needs to hit the server — critical for staying under Vercel's 4.5MB serverless body limit. |

### Not Needed (Eliminate from Consideration)

| Rejected | Why |
|----------|-----|
| `double-metaphone` (standalone npm) | Already inside `talisman` — `import doubleMetaphone from 'talisman/phonetics/double-metaphone'`. Zero new install. |
| `fuzzball` | Token Sort Ratio is 10 lines of TypeScript using talisman's existing `jaro-winkler` on sorted tokens. No new dependency warranted. |
| `natural` | General NLP library, heavy, adds ~3MB. talisman already covers all needed string metrics. |
| `fastest-levenshtein` | talisman includes Levenshtein (`talisman/metrics/levenshtein`). Adding a second Levenshtein library is over-engineering. |
| `jsPDF` | Requires browser DOM for initialization by default; server-side Node workaround is fragile and poorly documented. @react-pdf/renderer is the correct server-side PDF choice for React + Next.js. |
| `pdfmake` | Imperative JSON format, not component-based; weaker TypeScript types; no React integration advantage. |
| `exceljs` | Heavier than SheetJS (designed for Excel generation with styling). v3.0 only needs to READ .xlsx uploads — SheetJS is the right tool for read-only parsing. |
| `@3leaps/string-metrics-wasm` | WASM-based, adds complexity. Talisman pure-JS is sufficient for 10,000-name screening within Vercel timeout. |
| `Playwright` for PDF | Launches a browser process — incompatible with Vercel serverless functions (no chromium in Vercel sandbox). |
| `Nivo` | Feature-rich but 300KB+ bundle. Overkill for a single longitudinal chart. Recharts covers all 5 required chart elements at 1/3 the size. |
| `Visx` | D3 primitives — too low-level for this use case. Requires building axis, scale, and interaction logic from scratch. Recharts provides all of it pre-built. |

---

## Implementation Details by Feature

### 1. Double Metaphone (Phonetic Matching)

**No new install.** talisman is already in `package.json`.

```typescript
import doubleMetaphone from 'talisman/phonetics/double-metaphone';
// Returns [primary: string, secondary: string] — both are max 4 chars

// Example: "Smith" → ["SM0", "XMT"]
// Matching logic: codes intersect = phonetic match
function phoneticsMatch(a: string, b: string): boolean {
  const [p1, s1] = doubleMetaphone(a);
  const [p2, s2] = doubleMetaphone(b);
  return p1 === p2 || p1 === s2 || s1 === p2 || s1 === s2;
}
```

**Type shim required** — extend `src/types/talisman.d.ts` (the existing shim file):

```typescript
declare module 'talisman/phonetics/double-metaphone' {
  const doubleMetaphone: (word: string) => [string, string];
  export default doubleMetaphone;
}
```

**Limitation:** Double Metaphone is English-optimized. It degrades on Arabic and CJK names. The MILESTONE-CONTEXT.md requirement for phonetic matching should target Latin-alphabet names; CJK/Arabic names should fall back to Jaro-Winkler-only scoring. Flag this clearly in the matching engine.

### 2. Token Sort Ratio (Word-Order-Invariant Matching)

**No new install.** Implement as a pure TypeScript utility using talisman's existing `jaro-winkler`.

```typescript
import jaroWinkler from 'talisman/metrics/jaro-winkler';

/**
 * Token Sort Ratio: sorts tokens alphabetically before scoring.
 * "HASSAN AL-RASHID" and "AL-RASHID HASSAN" → score ≈ 1.0
 * Mirrors fuzzywuzzy's token_sort_ratio but returns 0.0–1.0 (not 0–100).
 */
export function tokenSortRatio(a: string, b: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')   // strip punctuation
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(' ');
  return jaroWinkler(normalize(a), normalize(b));
}
```

No type shim needed — `jaroWinkler` shim already exists in `src/types/talisman.d.ts`.

### 3. Unicode Normalization

**No new install.** Node.js built-in `String.prototype.normalize()` is sufficient for the v3.0 use case — but the form matters:

```typescript
/**
 * Pre-processing pipeline for screening engine input.
 * NFKD decomposes compatibility characters (e.g., ﬁ → fi, ① → 1).
 * The .replace strips combining diacritical marks after decomposition.
 * This catches the most common homoglyph substitution vectors.
 *
 * NOTE: True confusable detection (Cyrillic А vs. Latin A) requires
 * a confusables table lookup — normalize() alone does NOT catch these.
 * For v3.0: normalize + Unicode category folding is acceptable.
 * For v3.1+: consider `decancer` npm package for deep homoglyph stripping.
 */
export function normalizeForScreening(name: string): string {
  return name
    .normalize('NFKD')                              // decompose compatibility chars
    .replace(/[\u0300-\u036f]/g, '')                // strip combining diacritics
    .replace(/[\u200B-\u200D\uFEFF]/g, '')          // strip zero-width chars (evasion vector)
    .trim();
}
```

**Confidence note:** `normalize('NFKD')` + diacritic strip catches most Latin-script evasion (accented names, ligatures). It does NOT catch Cyrillic/Greek homoglyphs that look identical to Latin letters. This is documented as an acknowledged limitation for v3.0; a future phase can add a confusables table (`decancer` or `unhomoglyph` npm packages).

### 4. PDF Generation

**Install:** `npm install @react-pdf/renderer`

**Architecture:** Server-side generation in a route handler. The PDF is generated on the server so it can include Crowe branding assets and full match records without size limits from client-side rendering.

```typescript
// app/api/pdf/route.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { ComplianceMemo } from '@/components/pdf/ComplianceMemo';

export async function POST(request: Request) {
  const data = await request.json();
  const buffer = await renderToBuffer(<ComplianceMemo {...data} />);
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="ofac-screening-memo.pdf"',
    },
  });
}
```

**Known gotcha:** `@react-pdf/renderer` uses its own React renderer — it is NOT the same as `react-dom`. JSX for PDF components must use `@react-pdf/renderer`'s primitives (`<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>`, `<Link>`) — not HTML elements. This is a different mental model but well-documented.

**Crowe branding:** Embed a base64-encoded Crowe logo PNG in the PDF using `<Image src={base64Logo} />`. Store the base64 string as a constant in `src/lib/pdf/assets.ts`. This avoids filesystem path issues in Vercel's serverless environment.

**Next.js 16 compatibility:** Confirmed working pattern on Next.js 14.1.1+ per GitHub issue #3074 discussion. Next.js 16.1.6 is beyond this threshold. The `renderToBuffer` Node.js API works in route handlers (not in middleware or Edge runtime — use `runtime = 'nodejs'` if needed).

### 5. Excel Upload Parsing

**Install:** `npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz`

**Do NOT use:** `npm install xlsx` — the npm registry version is 2+ years stale with a high-severity vulnerability (confirmed by SheetJS docs and multiple community sources).

**Architecture recommendation: Client-side parsing.** Parse the .xlsx file in the browser using `FileReader.readAsArrayBuffer()` before sending data to the server. This keeps the file bytes local and sends only a JSON array of name strings to the server action — staying well under Vercel's 4.5MB body limit even for 10,000 names.

```typescript
// Client-side component — 'use client'
import * as XLSX from 'xlsx';

async function parseXlsxFile(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<{ [key: string]: unknown }>(sheet, { header: 1 });
  // First column of each row, skip header
  return rows
    .slice(1)
    .map(row => String((row as unknown[])[0] ?? '').trim())
    .filter(Boolean);
}
```

**Fallback for CSV:** CSV parsing requires no library — `text.split('\n').map(line => line.split(',')[0].trim())` is sufficient for single-column input.

### 6. File Upload Handling in Next.js App Router

**No new library needed.** Next.js App Router route handlers accept multipart/form-data natively via the Web Fetch API `FormData`.

```typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  // pass buffer to XLSX.read() or CSV parser
}
```

**Vercel limits:**
- Serverless function body limit: **4.5MB** (hard limit, not configurable on Hobby plan)
- Max .xlsx file that safely parses server-side: ~2MB (leaves buffer for response overhead)
- Recommended: parse client-side (see section 5), send only the extracted string array

**For paste/manual entry:** No upload needed — controlled textarea input, split on newlines, validate row count ≤ 10,000 client-side before submitting.

**`busboy` / `multer` not needed** for this use case. The native `formData.get('file')` API is sufficient for single-file uploads under 4.5MB.

### 7. Recharts for Longitudinal Chart

**Install:** `npm install recharts`

**Version:** 3.7.0 (current as of 2026-03-06, active release cadence)

**All 5 required chart elements map cleanly to Recharts primitives:**

| Required Element | Recharts Component | Notes |
|-----------------|-------------------|-------|
| Catch rate line | `<Line dataKey="catchRate" yAxisId="left" />` | Primary left Y-axis, 0–100% |
| Three threshold bands | `<Line dataKey="threshold_75" />`, `<Line dataKey="threshold_85" />`, `<Line dataKey="threshold_95" />` | Same yAxisId="left", different colors, `strokeDasharray="4 2"` |
| Vertical evasion tier markers | `<ReferenceLine x={snapshotIndex} strokeDasharray="6 3" label={<CustomLabel />} />` | One per tier introduction event |
| Cumulative miss count bars | `<Bar dataKey="cumulativeMisses" yAxisId="right" />` | Secondary right Y-axis, absolute count |
| Recovery line | `<ReferenceLine x={recoverySnapshot} stroke="#F5A800" />` + data series line | Amber line for recalibration event |

```tsx
// Minimum viable structure
<ComposedChart data={snapshots}>
  <YAxis yAxisId="left" domain={[0, 100]} unit="%" />
  <YAxis yAxisId="right" orientation="right" />
  <XAxis dataKey="snapshotIndex" />
  <Line yAxisId="left" dataKey="catchRate" stroke="#011E41" strokeWidth={2} />
  <Line yAxisId="left" dataKey="t75" stroke="#8b90a0" strokeDasharray="4 2" dot={false} />
  <Line yAxisId="left" dataKey="t85" stroke="#545968" strokeDasharray="4 2" dot={false} />
  <Line yAxisId="left" dataKey="t95" stroke="#2d3142" strokeDasharray="4 2" dot={false} />
  <Bar yAxisId="right" dataKey="cumulativeMisses" fill="#F5A800" opacity={0.3} />
  {evasionTiers.map(t => (
    <ReferenceLine key={t.snapshot} x={t.snapshot} yAxisId="left"
      strokeDasharray="6 3" stroke="#E5376B"
      label={<Label value={`Tier ${t.tier}`} angle={-90} />}
    />
  ))}
  <Tooltip />
  <Legend />
</ComposedChart>
```

**SSR note:** Recharts uses D3 internally which requires browser DOM. Wrap all Recharts components with `'use client'`. Server Component page files import them normally — Next.js handles the RSC boundary.

**React 19 compatibility:** Confirmed by multiple 2025 guides; no issues reported.

---

## Installation Commands

```bash
# Install recharts for longitudinal chart
npm install recharts

# Install @react-pdf/renderer for PDF export
npm install @react-pdf/renderer

# Install SheetJS from CDN (NOT npm registry — security vulnerability in registry version)
npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz

# No install needed for:
# - Double Metaphone (already in talisman)
# - Token Sort Ratio (implement as TypeScript utility)
# - Unicode normalization (Node.js built-in String.prototype.normalize)
# - File upload multipart parsing (Next.js native FormData API)
```

**Crowe network note:** All npm installs require `NODE_TLS_REJECT_UNAUTHORIZED=0` prefix on Crowe corporate network.

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install recharts
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install @react-pdf/renderer
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `recharts` 3.7.0 | `nivo` | If the project needed SSR-rendered chart thumbnails in email or image export. Nivo has an HTTP rendering API for server-side chart images. For an interactive browser chart, Recharts is simpler. |
| `recharts` 3.7.0 | `visx` | If the chart required custom D3 scales, complex brush interactions, or bespoke voronoi overlays. v3.0 chart is standard line/bar — Recharts covers it fully without D3 knowledge. |
| `@react-pdf/renderer` | `jsPDF` | If the PDF needed to be generated entirely client-side (no server route). jsPDF has a Node build but it's poorly documented. Use jsPDF only if the server route proves problematic on Vercel. |
| SheetJS from CDN | `exceljs` | If the project needed to both READ and WRITE .xlsx files with styling (conditional formatting, cell colors). exceljs shines for Excel generation. v3.0 is read-only import — SheetJS is sufficient. |
| Token Sort Ratio as utility function | `fuzzball` | If the project needed the full suite of fuzzywuzzy algorithms (token set ratio, partial ratio, WRatio). v3.0 needs only Token Sort — 10 lines of TypeScript is less overhead than an 15KB npm package. |
| `String.prototype.normalize()` | `decancer` npm | If v3.1+ requirements include full Cyrillic/Greek confusable detection. `decancer` (Rust-WASM) does deep homoglyph stripping. v3.0 NFKD normalization is sufficient for demo purposes. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `npm install xlsx` | npm registry version stale 2+ years, high-severity vulnerability confirmed | `npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz` |
| `double-metaphone` (standalone npm pkg) | Already inside installed `talisman` — redundant dependency | `import doubleMetaphone from 'talisman/phonetics/double-metaphone'` |
| `fuzzball` | Adds 15KB for a single function trivially implemented in TypeScript | Custom `tokenSortRatio` utility using existing talisman `jaro-winkler` |
| Playwright PDF generation | Launches Chromium — not available in Vercel serverless sandbox | `@react-pdf/renderer` with `renderToBuffer` in a Node.js route handler |
| `natural` NLP library | ~3MB, designed for full NLP pipelines; all needed string metrics already in talisman | Talisman (already installed) |
| Chart.js / `react-chartjs-2` | Imperative API, not React-component-based; harder to integrate dual-axis + custom reference lines than Recharts | `recharts` ComposedChart |
| `nivo` for this chart | 300KB+ bundle for a single chart in a larger application | `recharts` at ~80KB |
| Edge runtime for PDF route | `@react-pdf/renderer` uses Node.js APIs (Buffer, etc.) incompatible with Edge | Set `export const runtime = 'nodejs'` in the PDF route handler |
| Sending raw .xlsx bytes to server action | 4.5MB Vercel body limit; a 10,000-row .xlsx can exceed this | Parse .xlsx client-side, send extracted string array via server action |

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| recharts | ^3.7.0 | React 19, Next.js 16, Tailwind v4 | Must be `'use client'` — uses DOM APIs. No SSR. |
| @react-pdf/renderer | ^4.x | Next.js 14.1.1+ (confirmed fix), Node.js 20 | `renderToBuffer` in route handler. NOT in Edge runtime. Add `export const runtime = 'nodejs'` to route if needed. |
| xlsx (SheetJS CDN) | latest | Browser + Node.js | Client-side: `FileReader.readAsArrayBuffer()`. Server-side: `Buffer.from(await file.arrayBuffer())`. Both paths use `XLSX.read(buffer, { type: 'array' })`. |
| talisman | ^1.1.4 (already installed) | TypeScript (needs shim) | Add `double-metaphone` shim to `src/types/talisman.d.ts` — pattern matches existing jaro-winkler shim. |

---

## Type Shim Additions (src/types/talisman.d.ts)

The existing shim declares only `jaro-winkler`. Add:

```typescript
declare module 'talisman/phonetics/double-metaphone' {
  /**
   * Returns [primaryCode, secondaryCode] — both max 4 uppercase chars.
   * English-optimized. Falls back gracefully on non-Latin input (returns empty strings).
   */
  const doubleMetaphone: (word: string) => [string, string];
  export default doubleMetaphone;
}
```

---

## Sources

- Local `node_modules/talisman/` inspection (2026-03-06) — double-metaphone at `talisman/phonetics/double-metaphone.js`, jaro-winkler at `talisman/metrics/jaro-winkler.js` — HIGH confidence (verified directly)
- [talisman npm page](https://www.npmjs.com/package/talisman) — version 1.1.4, modular imports confirmed — HIGH confidence
- [talisman documentation — Phonetics](https://yomguithereal.github.io/talisman/phonetics/) — double-metaphone API confirmed — HIGH confidence
- [recharts npm](https://www.npmjs.com/package/recharts) — version 3.7.0, last published ~1 month ago, active — HIGH confidence (npm search result)
- [recharts ReferenceLine API](https://recharts.github.io/en-US/api/ReferenceLine/) — `strokeDasharray`, `yAxisId`, custom `Label` child — MEDIUM confidence (WebSearch, official docs URL)
- [react-pdf GitHub issue #3074](https://github.com/diegomura/react-pdf/issues/3074) — Next.js 15 `renderToBuffer` compatibility documented; Next.js 16 is beyond the fixed version (14.1.1) — MEDIUM confidence
- [react-pdf GitHub issue #2460](https://github.com/diegomura/react-pdf/issues/2460) — historical App Router issue; resolved for Next.js 14.1.1+ — MEDIUM confidence
- [SheetJS Community Docs](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/) — CDN install instruction, npm registry deprecation warning — HIGH confidence (official docs)
- [SheetJS npm page](https://www.npmjs.com/package/xlsx) — stale registry version warning confirmed — HIGH confidence
- [MDN String.prototype.normalize()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) — NFKD form, combining diacritic range — HIGH confidence (official spec)
- Vercel serverless body limit 4.5MB — [Next.js docs](https://nextjs.org/docs/messages/api-routes-response-size-limit) — HIGH confidence (official docs)
- Token Sort Ratio algorithm — [fuzzball.js README](https://github.com/nol13/fuzzball.js/blob/master/README.md) — confirmed as sort-tokens-then-score pattern; reimplemented in pure TS using existing talisman JW — HIGH confidence (algorithm is simple, well-documented)

---

*Stack research for: OFAC Sensitivity Testing v3.0 Screening Engine*
*Researched: 2026-03-06*
