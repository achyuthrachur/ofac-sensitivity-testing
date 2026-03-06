---
phase: 8
slug: table-form-ux-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green + human verify on live URL
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | RSLT-04 | regression | `npm test -- --run` | ✅ | ⬜ pending |
| 08-01-02 | 01 | 1 | FORM-03 | unit (formUtils) | `npm test -- --run` | ✅ | ⬜ pending |
| 08-01-03 | 01 | 1 | RSLT-04, FORM-03 | manual | human verify on live Vercel URL | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — the fixes are surgical edits to two existing files (`ResultsTable.tsx`, `page.tsx`). Existing test suite (114 tests) will catch regressions.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Results table columns visible and proportionate on live Vercel | RSLT-04 | Browser rendering / Vercel CDN CSS — cannot verify in Node/Vitest | Open live URL, run a test, inspect table column widths |
| Select All selects all when unchecked, clears when all checked | FORM-03 | DOM checkbox interaction + Radix state — no DOM in Vitest node mode | Click Select All when no rules checked → all checked; click again → all cleared |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
