---
phase: 6
slug: results-table-and-csv-export
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (project root — exists) |
| **Quick run command** | `npm test -- src/lib/__tests__/resultsUtils.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/lib/__tests__/resultsUtils.test.ts`
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~4 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 0 | EXPO-01,02,03 / RSLT-02,03 | unit (pure logic) | `npm test -- src/lib/__tests__/resultsUtils.test.ts` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 1 | EXPO-01,02,03 / RSLT-02,03 | unit (pure logic) | `npm test -- src/lib/__tests__/resultsUtils.test.ts` | ❌ W0 | ⬜ pending |
| 6-02-01 | 02 | 2 | RSLT-01,04 / EXPO-01 | typecheck + lint + full suite | `npm run typecheck && npm run lint && npm test` | — | ⬜ pending |
| 6-02-02 | 02 | 2 | RSLT-01,02,03,04 / EXPO-01,02,03 | human verify | manual — no DOM in Vitest node | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install @tanstack/react-virtual` — not yet in package.json; required before ResultsTable.tsx compiles
- [ ] `src/lib/__tests__/resultsUtils.test.ts` — test stubs for all pure helper functions:
  - `escapeCsvField(value)` — EXPO-01 (handles commas, quotes, newlines)
  - `buildCsvString(rows, clientName)` — EXPO-01,02 (BOM prefix, 6-column header + data rows)
  - `sanitizeClientName(clientName)` — EXPO-03 (spaces→hyphens, strip special chars)
  - `buildCsvFilename(clientName)` — EXPO-03 (full filename format)
  - `computeCatchRate(rows)` — RSLT-03 (caught count, total, percentage)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Table renders 2000+ rows without visible lag | RSLT-04 | No DOM in Vitest | `npm run dev`, submit 500×4 entity types, scroll rapidly, no jank |
| Score column shows "94% ✓" / "61% ✗" format | RSLT-01,02 | No DOM in Vitest | Verify cell formatting matches spec in browser |
| Download CSV button triggers file download | EXPO-01 | Blob/URL APIs not in Node | Click Download CSV, verify file appears in Downloads |
| Downloaded CSV opens in Excel with correct Arabic/CJK chars | EXPO-02 | Excel required | Open CSV in Excel, verify non-Latin characters render |
| CSV filename includes client name and date | EXPO-03 | File system | Check filename in Downloads folder |
| Catch-rate sentence shows correct numbers | RSLT-03 | No DOM in Vitest | Verify sentence text matches row data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 4s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
