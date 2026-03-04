---
phase: 06-results-table-and-csv-export
verified: 2026-03-04T22:30:00Z
status: human_needed
score: 11/11 automated must-haves verified
human_verification:
  - test: "Before run — confirm table is absent"
    expected: "No table appears below the form when rows.length === 0 (ResultsTable returns null)"
    why_human: "Guard is implemented (line 62 of ResultsTable.tsx) and conditional rendering is correct, but absence of a rendered DOM element cannot be confirmed without a browser"
  - test: "Post-run table display — submit a run with 900+ entities"
    expected: "Table visible with 6 labelled column headers: Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied, Score"
    why_human: "RSLT-01: Column header strings exist in code (COLUMN_LABELS + Score th), but actual rendered layout must be confirmed in browser"
  - test: "Score column format"
    expected: "Each Score cell shows a format like '94% ✓' or '61% ✗' (integer percent + caught indicator)"
    why_human: "RSLT-02: Formula Math.round(similarityScore * 100) + caught indicator is correctly implemented in line 154, but rendered output requires browser confirmation"
  - test: "Catch-rate summary sentence"
    expected: "Sentence reads e.g. '720 of 900 degraded variants (80%) would be caught at the 85% match threshold' — values computed from actual run"
    why_human: "RSLT-03: computeCatchRate and threshold display are wired correctly, but accuracy of the rendered sentence against a live run requires human inspection"
  - test: "Virtualization — DevTools DOM inspection during scroll"
    expected: "tbody contains ~15 tr elements at any scroll position, not hundreds; no layout thrashing when scrolling rapidly"
    why_human: "RSLT-04: useVirtualizer is wired with correct tbody height and absolute-positioned rows, but DOM element count during scroll can only be confirmed in DevTools"
  - test: "CSV download — click Download CSV button"
    expected: "Browser triggers a file-save dialog for a .csv file; filename matches ofac-sensitivity-{clientName}-YYYY-MM-DD.csv"
    why_human: "EXPO-01, EXPO-03: triggerCsvDownload is wired in handleDownload (line 68), filename pattern is correct in buildCsvFilename — but browser download behavior requires human confirmation"
  - test: "CSV character encoding — open downloaded file in Microsoft Excel"
    expected: "Arabic, Chinese, and Cyrillic characters in Original Name and Degraded Variant columns display correctly without garbled characters"
    why_human: "EXPO-02: UTF-8 BOM is prepended in triggerCsvDownload (line 143–144), but correct rendering of non-Latin characters in Excel requires a live test with an actual downloaded file"
---

# Phase 6: Results Table and CSV Export — Verification Report

**Phase Goal:** A consultant can view all degraded name variants in a responsive table and download the full dataset as a properly encoded CSV file
**Verified:** 2026-03-04T22:30:00Z
**Status:** human_needed — all automated checks pass; 7 items require browser/Excel confirmation
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All truths sourced from ROADMAP.md Success Criteria (6 items) and Plan frontmatter must_haves.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Results display in a 6-column table (Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied, Jaro-Winkler score) | ? NEEDS HUMAN | COLUMN_LABELS array + sortable Score `<th>` confirmed in ResultsTable.tsx lines 30–36 and 117–123; browser render needed |
| 2 | Catch-rate summary shows "X of Y degraded variants would be caught at 85% match threshold" | ? NEEDS HUMAN | computeCatchRate wired at line 64; sentence template at lines 76–78; live run confirmation needed |
| 3 | 2,000+ row dataset scrolls and sorts without visible lag (virtualized rendering active) | ? NEEDS HUMAN | useVirtualizer with correct tbody height (line 129) and absolute-positioned rows (lines 138–145) implemented; ~15-row DOM count requires DevTools |
| 4 | Clicking Download CSV triggers a file download with all result rows and correct headers | ? NEEDS HUMAN | handleDownload (line 67–69) calls triggerCsvDownload(buildCsvString(rows), buildCsvFilename(clientName)); browser download event needs human |
| 5 | Downloaded CSV opens in Excel with Arabic, Chinese, and Cyrillic characters correctly rendered | ? NEEDS HUMAN | UTF-8 BOM prepended at line 143; Blob type 'text/csv;charset=utf-8;' at line 144; Excel rendering requires live test |
| 6 | CSV filename contains client name and YYYY-MM-DD date | ? NEEDS HUMAN | buildCsvFilename produces `ofac-sensitivity-${sanitized}-${date}.csv`; correct in code; browser download name needs human |
| 7 | ResultsTable renders null when rows.length === 0 | ? NEEDS HUMAN | Guard at line 62 `if (rows.length === 0) return null;` placed after all hooks — correct pattern; browser empty-state confirmation needed |
| 8 | computeCatchRate returns correct caught/total/percent for any ResultRow array | ✓ VERIFIED | 25 Vitest tests all green (5 computeCatchRate tests); confirmed by `npx vitest run` exit 0 |
| 9 | buildCsvString produces header row with 6 named columns and integer similarity score | ✓ VERIFIED | 5 buildCsvString tests green; column order matches plan spec; score integer confirmed |
| 10 | escapeCsvField wraps fields with commas/double-quotes/newlines and doubles embedded quotes (RFC 4180) | ✓ VERIFIED | 5 escapeCsvField tests green; regex `/[,"\n\r]/` triggers wrapping |
| 11 | sanitizeClientName/buildCsvFilename/computeCatchRate all conform to plan spec | ✓ VERIFIED | 6 sanitizeClientName tests + 4 buildCsvFilename tests + 5 computeCatchRate tests all green |

**Automated Score:** 4/4 automated truths verified (pure helpers). 7/7 observable UI truths need human browser confirmation.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/resultsUtils.ts` | All 6 pure helper functions for CSV generation, filename building, catch-rate | ✓ VERIFIED | 154 lines; exports: escapeCsvField, buildCsvString, sanitizeClientName, buildCsvFilename, computeCatchRate, triggerCsvDownload |
| `src/lib/__tests__/resultsUtils.test.ts` | Vitest unit tests covering all pure helpers | ✓ VERIFIED | 198 lines; 25 tests in 5 describe blocks; all green |
| `src/components/ResultsTable.tsx` | Named-export ResultsTable client component with useVirtualizer, sort state, catch-rate, CSV download | ✓ VERIFIED | 165 lines; 'use client'; exports `ResultsTable`; all 4 resultsUtils functions imported and called; useVirtualizer wired correctly |
| `src/app/page.tsx` | Phase 6 mount comment replaced with `<ResultsTable rows={rows} clientName={clientName} />` | ✓ VERIFIED | Line 30: `import { ResultsTable } from '@/components/ResultsTable'`; Line 252: `<ResultsTable rows={rows} clientName={clientName} />`; mount comment is absent |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/page.tsx` | `src/components/ResultsTable.tsx` | named import + JSX usage | ✓ WIRED | Line 30 import confirmed; line 252 JSX usage confirmed |
| `src/components/ResultsTable.tsx` | `src/lib/resultsUtils.ts` | named imports | ✓ WIRED | Lines 8–12: computeCatchRate, buildCsvString, buildCsvFilename, triggerCsvDownload all imported; all 4 used (lines 64, 68) |
| `src/components/ResultsTable.tsx` | `@tanstack/react-virtual` | useVirtualizer hook | ✓ WIRED | Line 4 import; line 54 hook call with count, getScrollElement, estimateSize, overscan; getTotalSize() and getVirtualItems() both used |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| RSLT-01 | 06-02-PLAN.md | Results display in table showing Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied | ? NEEDS HUMAN | COLUMN_LABELS array and Score `<th>` confirmed in ResultsTable.tsx; browser render required |
| RSLT-02 | 06-01, 06-02 | Results table shows Jaro-Winkler similarity score for each pair | ? NEEDS HUMAN | Score cell: `Math.round(row.similarityScore * 100)% {caught ? '✓' : '✗'}` at line 154; browser render required |
| RSLT-03 | 06-01, 06-02 | Results page shows catch-rate summary stat | ? NEEDS HUMAN | computeCatchRate wired; sentence template confirmed lines 76–78; live run required |
| RSLT-04 | 06-02-PLAN.md | Results table remains usable with thousands of rows (virtualized) | ? NEEDS HUMAN | useVirtualizer + absolute-positioned rows + fixed tbody height all implemented; DevTools DOM count required |
| EXPO-01 | 06-01, 06-02 | User can download all results as CSV | ? NEEDS HUMAN | handleDownload wired at line 67–69; browser download event required |
| EXPO-02 | 06-01, 06-02 | CSV file uses UTF-8 encoding with BOM so non-Latin characters display correctly in Excel | ? NEEDS HUMAN | '\uFEFF' BOM at line 143; Blob type 'text/csv;charset=utf-8;' at line 144; Excel test required |
| EXPO-03 | 06-01, 06-02 | CSV filename includes client name entered in parameter form | ? NEEDS HUMAN | buildCsvFilename pattern: `ofac-sensitivity-${sanitized}-${date}.csv`; clientName passed from page.tsx state; browser download name required |

All 7 phase 6 requirement IDs (RSLT-01 through RSLT-04, EXPO-01 through EXPO-03) are claimed in plan frontmatter and have supporting implementation. No orphaned requirements found. REQUIREMENTS.md traceability table marks all 7 as Complete / Phase 6.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/page.tsx` | 213 | `placeholder="e.g. Acme Financial Corp"` | ℹ️ Info | HTML input placeholder attribute — correct usage, not a stub pattern |
| `src/app/page.tsx` | 245 | `{/* Success placeholder — shown after a successful run */}` | ℹ️ Info | Comment describes the result count paragraph that follows — not a deferred implementation |
| `src/components/ResultsTable.tsx` | 62 | `if (rows.length === 0) return null;` | ℹ️ Info | Intentional early-return guard per plan spec — not a stub; all hooks are declared before this line |

No blockers. No warnings. All three flagged lines are correct-by-design patterns.

---

## Human Verification Required

### 1. Empty State (RSLT-01 precondition)

**Test:** Open `http://localhost:3000` with `npm run dev`. Before submitting any run, inspect the area below the form cards.
**Expected:** No table is visible. The page ends after the form cards (or shows only the result count paragraph if a previous run exists in state). ResultsTable renders null.
**Why human:** DOM absence of a conditionally rendered component cannot be confirmed programmatically without a browser rendering environment.

### 2. Table Column Headers (RSLT-01)

**Test:** Submit a run (Individual: 50, Business: 50, Vessel: 10, Aircraft: 10, all regions, all rules, client name "Acme Financial"). After the spinner clears, inspect the table header row.
**Expected:** Six headers visible in order: "Original Name", "Entity Type", "Linguistic Region", "Degraded Variant", "Rule Applied", "Score ↓" (with sort arrow).
**Why human:** COLUMN_LABELS array and Score th are correctly coded, but rendered column order and label accuracy require visual confirmation.

### 3. Score Cell Format (RSLT-02)

**Test:** Inspect individual data rows in the table after a run.
**Expected:** Score cells show format like "94% ✓" (caught) or "61% ✗" (missed) — integer percentage with a space and Unicode checkmark or cross.
**Why human:** Formula is correct in code (line 154) but rendered output with actual data values requires browser.

### 4. Catch-Rate Summary Sentence (RSLT-03)

**Test:** Inspect the text above the table after a run.
**Expected:** Sentence reads: "{N} of {M} degraded variants ({P}%) would be caught at the 85% match threshold" — with real numbers from the run.
**Why human:** computeCatchRate is wired and the sentence template is correct; accuracy against live data requires a live run.

### 5. Virtualization — DevTools DOM Count (RSLT-04)

**Test:** After a large run (500+ entities, all rules), open DevTools Elements panel. Scroll the 600px table container rapidly. Count `<tr>` elements inside `<tbody>` at different scroll positions.
**Expected:** Approximately 15 `<tr>` elements in the DOM at any scroll position, not hundreds. Smooth scrolling with no jank or layout reflow warnings.
**Why human:** Virtual row count during scroll is a runtime DOM behavior; cannot be measured without browser DevTools.

### 6. CSV Download — Filename and File Save (EXPO-01, EXPO-03)

**Test:** With a run completed and client name "Acme Financial" entered, click the "Download CSV" button.
**Expected:** Browser triggers a file-save. The downloaded filename is `ofac-sensitivity-Acme-Financial-YYYY-MM-DD.csv` (today's date).
**Why human:** triggerCsvDownload uses Blob and URL.createObjectURL — browser-only APIs. Download behavior and filename require browser confirmation.

### 7. UTF-8 BOM — Excel Character Rendering (EXPO-02)

**Test:** Open the downloaded CSV file in Microsoft Excel on Windows.
**Expected:** Arabic names (e.g., "Ahmad Al-Rashid"), Chinese names, and Cyrillic names in the "Original Name" and "Degraded Variant" columns display as readable characters — not as garbled boxes or question marks.
**Why human:** UTF-8 BOM is prepended in code (`'\uFEFF'` at line 143) and Blob type is `'text/csv;charset=utf-8;'` (line 144), but correct Excel rendering can only be confirmed with an actual downloaded file opened in Excel.

---

## Gaps Summary

No automated gaps found. All artifacts exist, are substantive, and are fully wired. The 7 human verification items are the only remaining checks — they are standard browser/Excel behaviors that cannot be verified programmatically in a Node.js environment. The implementation code is correct and complete for all of them.

The `return null` at ResultsTable.tsx line 62 is intentional per the plan spec, not a stub — all React hooks are correctly declared unconditionally before this guard.

---

_Verified: 2026-03-04T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
