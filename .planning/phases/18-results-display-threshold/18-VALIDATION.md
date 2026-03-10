---
phase: 18
slug: results-display-threshold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/__tests__/threshold.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 0 | SCREEN-10 | unit | `npx vitest run src/lib/__tests__/threshold.test.ts -t "assignTierDynamic"` | ❌ Wave 0 | ⬜ pending |
| 18-01-02 | 01 | 0 | SCREEN-12 | unit | `npx vitest run src/lib/__tests__/screening-types.test.ts -t "RECOMMENDED_ACTIONS"` | ❌ Wave 0 (extend) | ⬜ pending |
| 18-01-03 | 01 | 0 | SCREEN-14 | unit | `npx vitest run src/lib/__tests__/threshold.test.ts -t "isLocked"` | ❌ Wave 0 | ⬜ pending |
| 18-02-01 | 02 | 1 | SCREEN-11 | manual | Run dev server, navigate Screening Mode, click rows | N/A | ⬜ pending |
| 18-02-02 | 02 | 1 | SCREEN-12 | manual | Verify detail card fields render correctly | N/A | ⬜ pending |
| 18-02-03 | 02 | 1 | SCREEN-10 | manual | Drag slider — verify rows re-tier within 200ms | N/A | ⬜ pending |
| 18-02-04 | 02 | 1 | SCREEN-14 | manual | Click "What would OFAC see?" — verify lock/unlock | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/threshold.test.ts` — NEW: `assignTierDynamic(score, mediumFloor)` boundary value tests (SCREEN-10) and `isLocked` state logic tests (SCREEN-14)
- [ ] Extend `src/lib/__tests__/screening-types.test.ts` — add `RECOMMENDED_ACTIONS` constant completeness test (all 5 RiskTier keys present with non-empty strings) (SCREEN-12)

*Note: Existing infrastructure (Vitest, vitest.config.ts) covers all Phase 18 requirements. Only test file creation is needed in Wave 0 — no new framework install.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Left pane renders color-coded tier badges; row click opens detail card | SCREEN-11 | No jsdom/React Testing Library — consistent with all prior UI phases | Run `npm run dev`, navigate to /tool, Screening Mode tab, run a screening, verify pill badges and click behavior |
| Detail card shows all 6 required fields | SCREEN-12 | React component rendering — no RTL setup | Verify: input name, matched SDN name, score, algorithm, tier callout, recommended action string |
| Slider re-tiers 10k rows within 200ms | SCREEN-10 | Performance test requires browser DevTools | Load 10k names, drag slider, use DevTools Performance tab to confirm frame budget |
| OFAC toggle snaps+locks to 0.85 | SCREEN-14 | UI interaction state — no RTL setup | Click "What would OFAC see?", verify slider snaps to 0.85 and is disabled; click "Unlock", verify slider re-enables |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
