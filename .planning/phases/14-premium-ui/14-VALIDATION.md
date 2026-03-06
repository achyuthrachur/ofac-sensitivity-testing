---
phase: 14
slug: premium-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` + `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + `npm run build` clean
- **Max feedback latency:** ~30 seconds (build) / ~5 seconds (test)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | UIPOL-01 | build | `npm run build` | ❌ W0 | pending |
| 14-01-02 | 01 | 1 | UIPOL-01 | build | `npm run build` | ❌ W0 | pending |
| 14-02-01 | 02 | 1 | UIPOL-02 | build | `npm run build` | ❌ W0 | pending |
| 14-03-01 | 03 | 1 | UIPOL-03 | build | `npm run build` | ❌ W0 | pending |
| 14-04-01 | 04 | 1 | UIPOL-04 | build | `npm run build` | ❌ W0 | pending |
| 14-04-02 | 04 | 1 | UIPOL-04 | regression | `npm test` | existing | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `NODE_TLS_REJECT_UNAUTHORIZED=0 npm install motion` — motion/react not currently installed (required by BlurText + StatTiltCard)
- [ ] Copy BlurText-TS-TW source into `src/components/ui/blur-text.tsx` (add `as` prop for h1 semantics)
- [ ] Copy SpotlightCard-TS-TW source into `src/components/ui/spotlight-card.tsx` (remove hardcoded dark styles)
- [ ] Create `src/components/ui/stat-tilt-card.tsx` — custom TiltCard accepting children (not image-only)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| BlurText word-by-word animation visible | UIPOL-01 | CSS animation — no jsdom | Load /, observe h1 words blur-to-sharp sequentially |
| Subtitle fades in after headline completes | UIPOL-01 | onAnimationComplete timing | After last word renders, verify `<p>` fades in |
| TiltCard depth effect on stat cards | UIPOL-02 | pointer events / 3D CSS | Hover each stat card, verify 3D tilt follows cursor |
| .stat-value count-up still fires inside TiltCard | UIPOL-02 | Anime.js + DOM traversal | Load /, scroll to stats, verify numbers count up |
| CTA button ambient glow visible at rest | UIPOL-03 | box-shadow computed style | Load /, inspect .cta-button — box-shadow should show amber value |
| CTA hover breathing amplifies (not resets) glow | UIPOL-03 | Anime.js hover interaction | Hover CTA, verify glow intensifies then softens on leave |
| SpotlightCard amber cursor glow follows mouse | UIPOL-04 | pointer events + radial gradient | Hover tool form cards, verify amber spotlight follows cursor |
| Form inputs/checkboxes remain interactive | UIPOL-04 | pointer-events passthrough | Tab through inputs, check checkboxes — all must respond |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
