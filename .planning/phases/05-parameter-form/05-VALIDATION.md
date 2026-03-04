---
phase: 5
slug: parameter-form
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (project root — exists) |
| **Quick run command** | `npm test -- src/app/__tests__/paramForm.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/app/__tests__/paramForm.test.ts`
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~4 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 0 | FORM-01,02,03,04 | unit (pure logic) | `npm test -- src/app/__tests__/paramForm.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 1 | FORM-01,02,03,04 | unit (pure logic) | `npm test -- src/app/__tests__/paramForm.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/__tests__/paramForm.test.ts` — test stubs covering pure helper functions for FORM-01 through FORM-04:
  - `parseEntityCount(raw)` — FORM-01 (accepts 0–500, coerces NaN to 0)
  - `toggleRegion(current, target)` — FORM-02 (adds/removes region from array)
  - `toggleRule(current, target)` — FORM-03 (adds/removes rule from array)
  - `deriveSelectAllState(ruleIds)` — FORM-03 (true / false / 'indeterminate')
  - `buildRunParams(counts, regions, ruleIds, clientName)` — FORM-04 (assembles RunParams)

*No new test framework or dependencies needed — existing Vitest 4 + node environment covers pure function tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Submit button disables + shows spinner during runTest | FORM-05 | No DOM environment in Vitest | Run `npm run dev`, open browser, submit form, observe button state |
| Error banner appears for invalid params | FORM-01–04 | No DOM environment | Submit with entity count > 500, confirm red banner appears |
| "N results generated" placeholder appears on success | — | No DOM environment | Submit with valid params, confirm placeholder text below form |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 4s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
