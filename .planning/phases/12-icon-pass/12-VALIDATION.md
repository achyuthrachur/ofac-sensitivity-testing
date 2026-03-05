---
phase: 12
slug: icon-pass
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-05
---

# Phase 12 — Validation Strategy

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
| 12-01-01 | 01 | 1 | ICON-01/02/03 | build | `npm run build` | ⬜ pending |
| 12-02-01 | 02 | 2 | ICON-04 | build | `npm run build` | ⬜ pending |
| 12-02-02 | 02 | 2 | ICON-01–04 | manual | see manual table | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

Phase 12 replaces icon components — no new logic, no new routes. The existing 57+ unit tests cover the engine and are unaffected. Gate is `next build` passing + manual visual checkpoint.

One new install: `npm install iconsax-reactjs` (with NODE_TLS_REJECT_UNAUTHORIZED=0).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Entity Counts section has People icon, Regions has Global, Rules has Setting4, Download has DocumentDownload | ICON-01/02 | Visual icon identity | Visit /tool — inspect each form section heading icon |
| Run Test button shows Refresh2 spinner when loading | ICON-02 | Interaction state | Click Run Test — verify spinner animation during loading |
| Results table ✓/✗ replaced with TickCircle/CloseCircle | ICON-03 | Visual check | Run test → inspect Caught column — Iconsax icons, no Unicode |
| Landing How It Works steps have TwoTone icons | ICON-04 | Visual check | Visit / → How It Works section — 3 TwoTone icons visible |
| Landing Stats section has Bold amber icons above each stat number | ICON-04 | Visual check | Stats section — 4 Bold amber feature icons visible above each stat |
| No Lucide imports remain in the codebase | All | Code audit | `grep -r "lucide-react" src/` returns no matches |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-05
