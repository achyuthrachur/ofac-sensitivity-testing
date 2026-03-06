---
phase: 13
slug: animation-pass
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-06
---

# Phase 13 — Validation Strategy

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
| 13-01-01 | 01 | 1 | ANIM-02 | build | `npm run build` | ⬜ pending |
| 13-01-02 | 01 | 1 | ANIM-01/03/04 | build | `npm run build` | ⬜ pending |
| 13-02-01 | 02 | 2 | ANIM-01–04 | manual | see manual table | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

Phase 13 adds animation wrappers and Client Component shells — no new logic, no new routes, no new test files required. The existing 57+ unit tests cover the engine and are unaffected. Gate is `next build` passing + manual visual checkpoint.

One new install: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm install animejs` (Crowe TLS proxy).

One markup prerequisite: split `FeatureStatsSection` stat rendering into prefix/number/suffix sub-spans to enable per-number count-up targeting.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| How It Works cards stagger in from left-to-right on scroll | ANIM-01 | Visual animation — no DOM assertion available | Visit / → scroll to How It Works — 3 cards animate in with stagger |
| Stats section numbers count from 0 to target (285, 10, 4, ~53ms) | ANIM-03 | Visual animation — requires live observation | Visit / → scroll to Stats section — numbers count up with expo ease |
| CTA button shows continuous breathing amber glow while hovered | ANIM-04 | Interaction state + visual effect | Visit / → hover "Configure Your Test" button — amber glow pulses continuously |
| How It Works cards lift via Anime.js on hover | ANIM-04 | Interaction state — Anime.js mouseenter/mouseleave | Visit / → hover each step card — card lifts with shadow upgrade |
| 4 form cards at /tool stagger in on page load (80ms between) | ANIM-02 | Visual animation — requires live observation | Visit /tool → observe cards arriving sequentially with ~80ms gaps |
| Scroll reveals play once only (no replay on scroll-up) | ANIM-01 | Behavior check | Visit / → scroll down past sections, scroll back up — sections stay visible, no re-animation |
| No console errors from Anime.js or missing animejs import | All | Runtime check | Open DevTools → visit / and /tool — zero console errors |
| No Lucide or broken icon imports remain | All | Code audit | `grep -r "lucide-react" src/` — should return zero matches for new files |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-06
