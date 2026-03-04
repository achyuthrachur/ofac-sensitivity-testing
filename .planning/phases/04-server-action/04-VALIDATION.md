---
phase: 4
slug: server-action
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (project root — exists) |
| **Quick run command** | `npm test -- src/lib/__tests__/runTest.integration.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~6 seconds (integration test includes 500×10 benchmark) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/lib/__tests__/runTest.integration.test.ts`
- **After every plan wave:** Run `npm test` (full suite — all Phase 3 rules + sampler + new integration test)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~6 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | FORM-05 | integration | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | FORM-05 | integration | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | FORM-05 | integration | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-04 | 01 | 2 | FORM-05 | integration (timed) | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/runTest.integration.test.ts` — test stubs for all FORM-05 behaviors (valid params, invalid params, empty rows, benchmark timing)
- [ ] `npm install talisman` — talisman not yet in package.json; must be installed before action code compiles
- [ ] `src/types/talisman.d.ts` — type declaration shim for `talisman/metrics/jaro-winkler` deep import (create only if TypeScript reports "Could not find a declaration file")

*Wave 0 must complete before any Wave 1 task is started.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | — | — | — |

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 6s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
