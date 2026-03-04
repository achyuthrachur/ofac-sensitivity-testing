---
phase: 7
slug: polish-and-deployment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (project root — exists) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (CSS-only changes cannot break pure-logic tests; confirms no regressions)
- **After every plan wave:** Run `npm run build` (confirms build is clean before deployment)
- **Before `/gsd:verify-work`:** Build must pass + live URL must be accessible
- **Max feedback latency:** ~5 seconds (test suite) / ~60 seconds (build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | Build fix | build | `npm run build 2>&1 \| tail -5` | ✅ | ⬜ pending |
| 7-01-02 | 01 | 1 | Brand tokens | build + regression | `npm run build && npm test` | ✅ | ⬜ pending |
| 7-01-03 | 01 | 1 | Header/footer/UX | build + regression | `npm run build && npm test` | ✅ | ⬜ pending |
| 7-02-01 | 02 | 2 | Deployment | human verify | manual — confirm live URL accessible | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None — no new test files needed. All Phase 7 changes are CSS/JSX styling. Existing 114-test suite is the regression gate. Build success is the deployment gate.*

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Page background is warm off-white (not pure white) | No DOM in Vitest | `npm run dev`, visually confirm `#f8f9fc` background |
| Run Test button is amber with glow on hover | No DOM in Vitest | Hover the button, confirm amber color and shadow |
| Caught scores appear in teal, missed in coral | No DOM in Vitest | Submit a run, inspect Score column colors |
| Indigo header bar with Crowe wordmark renders | No DOM in Vitest | Confirm top bar appearance |
| Indigo footer with disclaimer text renders | No DOM in Vitest | Scroll to bottom, confirm footer |
| Live Vercel URL is accessible | Deployment | Open URL in browser, confirm app loads |
| Live URL title reads "OFAC Sensitivity Testing — Crowe" | Deployment | Check browser tab title |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or explicit manual justification
- [ ] No 3 consecutive implementation tasks without automated verify
- [ ] `npm run build` passes before deployment task
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
