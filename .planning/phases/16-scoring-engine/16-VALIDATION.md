---
phase: 16
slug: scoring-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 16 — Validation Strategy

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

- **After every task commit:** Run `npm test` (regression guard — all 128+ existing tests must stay green)
- **After every plan wave:** Run `npm run build && npm test`
- **Before `/gsd:verify-work`:** Full suite green + TypeScript strict clean
- **Max feedback latency:** ~10 seconds (test) / ~30 seconds (build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-T-types | 01 | 1 | SCREEN-06, SCREEN-07 | type-check | `npm run build` | existing | pending |
| 16-T-scorer | 01 | 1 | SCREEN-06, SCREEN-07, SCREEN-08, SCREEN-09 | unit | `npm test -- scorer` | ❌ W0 | pending |
| 16-T-worker | 01 | 1 | SCREEN-06 | build + unit | `npm run build && npm test` | existing | pending |
| 16-T-server | 01 | 1 | SCREEN-06 | build | `npm run build` | existing | pending |
| 16-T-regression | all | all | (none) | regression | `npm test` | ✅ exists | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/screening/scorer.test.ts` — unit tests for all four areas:
  - JW, DM, TSR in isolation
  - composite formula (JW×0.6 + DM_bonus×0.25 + TSR×0.15)
  - name-length penalty: input ≤6 chars → effective_tier escalated one level
  - NFKD normalization: Cyrillic "Рobert" scores HIGH or better vs "ROBERT"
  - DM empty-code guard: two CJK names do NOT produce dmBonus = 1.0

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Web Worker produces MatchResult[] for CLIENT_NAMES | SCREEN-06 | Requires browser + live Vercel deployment; worker runs off-main-thread | Open /tool → Screening Mode tab → (Phase 18 will add Run button; Phase 16 verifies via unit tests only) |

*All Phase 16 scorer logic has automated unit test coverage. Worker integration is verified via build only in this phase.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
