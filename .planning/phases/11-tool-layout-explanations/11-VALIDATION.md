---
phase: 11
slug: tool-layout-explanations
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-05
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run && npm run build` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + `next build` passes
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 11-01-01 | 01 | 1 | TABLE-01 | build | `npm run build` | ⬜ pending |
| 11-01-02 | 01 | 1 | LAYOUT-01 | build | `npm run build` | ⬜ pending |
| 11-02-01 | 02 | 2 | EXPL-01/02/03 | build | `npm run build` | ⬜ pending |
| 11-02-02 | 02 | 2 | LAYOUT-02/03 | manual | see manual table | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

Phase 11 modifies existing UI components and adds new presentational components. The existing 57+ unit/integration tests cover the engine and server action — these are unaffected. Gate is `next build` passing + manual visual checkpoint.

One new install required: `npx shadcn add tabs` (copies `src/components/ui/tabs.tsx` into the project — owned code, no test needed).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Left panel shows configurator, right panel shows engine docs | LAYOUT-01 | Visual layout | `npm run dev` → visit /tool → verify two-panel layout renders |
| Right panel lists all 10 rules with descriptions | EXPL-01 | Content accuracy | Scroll through right panel — verify all 10 rule names and descriptions visible |
| Right panel explains dataset construction | EXPL-02 | Content accuracy | Verify dataset section explains entity types, regions, sampling |
| Right panel explains scoring methodology | EXPL-03 | Content accuracy | Verify scoring section explains Jaro-Winkler and catch rate |
| Right panel switches to results after run | LAYOUT-03 | Interaction | Run a test → verify right panel shows results table |
| Explanation tab returns to engine docs | LAYOUT-03 | Interaction | After run → click Explanation tab → verify engine docs return |
| Table rows reach right border | TABLE-01 | Visual check | Run test → inspect table — no gap between last column and right border |
| Tool form still works end-to-end | LAYOUT-01 | Regression | Configure params → run → verify results appear in right panel |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-05
