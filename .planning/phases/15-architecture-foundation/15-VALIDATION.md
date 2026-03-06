---
phase: 15
slug: architecture-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (regression guard — all 57+ existing tests must stay green)
- **After every plan wave:** Run `npm run build && npm test`
- **Before `/gsd:verify-work`:** Full suite green + benchmark deployed to Vercel + timing recorded
- **Max feedback latency:** ~30 seconds (build) / ~5 seconds (test)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-T-types | 01 | 1 | SCREEN-06, SCREEN-07 (foundation) | type-check + unit | `npm run build && npm test` | ❌ W0 | pending |
| 15-T-stubs | 01 | 1 | SCREEN-06, SCREEN-07 (foundation) | build | `npm run build` | ❌ W0 | pending |
| 15-T-clientnames | 01 | 1 | SCREEN-01 | unit | `npm test -- clientNames` | ❌ W0 | pending |
| 15-T-benchmark | 02 | 2 | SCREEN-06 (foundation) | manual | deploy + Vercel timing | ❌ W0 | pending |
| 15-T-tab | 02 | 2 | SCREEN-01 | build | `npm run build` | existing | pending |
| 15-T-regression | all | all | (none) | regression | `npm test` | ✅ exists | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `src/types/screening.ts` — `MatchResult` interface, `RiskTier` union, `TIER_THRESHOLDS` constants
- [ ] `src/lib/screening/index.ts` — stub exports (`screenNames`, `computeMatchResult`)
- [ ] `src/lib/simulation/index.ts` — stub exports (`runSimulation`)
- [ ] `src/data/clientNames.ts` — `CLIENT_NAMES: string[]` export with 30–50 synthetic demo names
- [ ] `src/__tests__/screening/clientNames.test.ts` — unit test: array non-empty, all strings, count ≤10000
- [ ] `src/__tests__/screening/constants.test.ts` — unit test: `TIER_THRESHOLDS` values and `RiskTier` values

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Web Worker benchmark timing on Vercel | SCREEN-06 (foundation) | Requires live Vercel production deployment + timing UI | Deploy, open /tool → Screening Mode tab, click "Run Benchmark", record ms displayed |
| Server-action batch timing on Vercel | SCREEN-06 (foundation) | Requires live Vercel production deployment | Click "Run Server Action Benchmark", record per-batch ms |
| Screening Mode tab visible without breaking existing tab | SCREEN-01 | Visual layout check | Open /tool, confirm three tabs present, click Sensitivity Test — existing form still works |
| Existing Sensitivity Test produces correct results | (regression) | Requires browser + full UI verification | Run a test on existing tab, compare output to pre-Phase-15 baseline |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
