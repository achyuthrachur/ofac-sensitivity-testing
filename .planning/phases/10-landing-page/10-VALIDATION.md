---
phase: 10
slug: landing-page
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-05
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + `next build` passes
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | LAND-01 | build | `npm run build` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | LAND-01 | build | `npm run build` | ✅ | ⬜ pending |
| 10-02-01 | 02 | 1 | LAND-01 | manual | see manual table | — | ⬜ pending |
| 10-02-02 | 02 | 1 | LAND-02 | manual | see manual table | — | ⬜ pending |
| 10-02-03 | 02 | 1 | LAND-03 | manual | see manual table | — | ⬜ pending |
| 10-02-04 | 02 | 1 | LAND-04 | manual | see manual table | — | ⬜ pending |
| 10-02-05 | 02 | 1 | EXPL-04 | manual | see manual table | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no new test file stubs needed.

Phase 10 is UI-only (Server Components, static markup). The existing 57+ unit tests cover the tool engine and are unaffected by this phase. Gate is `next build` passing + manual visual checks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero section renders with headline and CTA at "/" | LAND-01 | Visual layout — no automated DOM assertion for landing | `npm run dev` → visit http://localhost:3000/ → verify hero headline visible + CTA button present |
| CTA navigates to /tool | LAND-01 | Navigation behavior | Click "Configure Your Test" → verify URL changes to /tool and form loads |
| How It Works 3-step section visible | LAND-02 | Visual layout | Scroll below hero → verify 3 steps with icons and methodology text |
| Stats section shows correct numbers | LAND-03 | Content accuracy | Verify "285 entries", "10 rules", "4 regions", "~53ms" appear |
| Footer renders with Crowe branding | LAND-04 | Visual check | Scroll to bottom → verify Crowe footer with nav links |
| Tool at /tool has no regressions | LAND-01 | End-to-end | Visit /tool → configure params → run test → verify results table loads |
| EXPL-04 methodology text on How It Works | EXPL-04 | Content check | Verify each step card has 2-3 sentence methodology explanation |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-05
