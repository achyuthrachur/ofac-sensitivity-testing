---
phase: 17
slug: input-parsing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run build && npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (regression guard — all 160+ existing tests must stay green)
- **After every plan wave:** Run `npm run build && npm test`
- **Before `/gsd:verify-work`:** Full suite green + TypeScript strict clean
- **Max feedback latency:** ~10 seconds (test) / ~30 seconds (build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-T-install | 01 | 1 | SCREEN-03 | build | `npm run build` | ❌ W0 | pending |
| 17-T-parseinput | 01 | 1 | SCREEN-02, SCREEN-03, SCREEN-04, SCREEN-05 | unit | `npm test -- parseInput` | ❌ W0 | pending |
| 17-T-inputpanel | 02 | 2 | SCREEN-02, SCREEN-03, SCREEN-04 | build | `npm run build` | ❌ W0 | pending |
| 17-T-wire | 02 | 2 | SCREEN-02, SCREEN-03, SCREEN-04, SCREEN-05 | build + unit | `npm run build && npm test` | existing | pending |
| 17-T-regression | all | all | (none) | regression | `npm test` | ✅ exists | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `npm install --save https://cdn.sheetjs.com/xlsx-latest/xlsx-.tgz` — SheetJS CDN install (NODE_TLS_REJECT_UNAUTHORIZED=0 required on Crowe network)
- [ ] `src/lib/screening/parseInput.ts` — pure parsing module (CSV, Excel ArrayBuffer, paste text → ParseResult)
- [ ] `src/__tests__/screening/parseInput.test.ts` — unit tests for all parsing paths

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 5MB+ .xlsx upload on live Vercel | SCREEN-03 | Requires browser + actual file upload to Vercel serverless; 413 risk only on production | Upload a real 5MB+ xlsx to /tool → Screening Mode → verify name count shown, no 413 error |
| File drag-and-drop into upload zone | SCREEN-02, SCREEN-03 | Browser drag event simulation unreliable in jsdom | Drag a CSV and an xlsx onto the upload drop zone; verify both are accepted |
| Paste live count updates as user types | SCREEN-04 | DOM event timing in jsdom unreliable for textarea onChange | Open paste tab, type 10 names one per line, verify count updates in real time |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
