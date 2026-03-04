---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed yet (Phase 1 is scaffolding only — no pure functions to unit test) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx tsc --noEmit && npm run lint` |
| **Full suite command** | `npx tsc --noEmit && npm run lint` (dev server smoke check: `npm run dev`) |
| **Estimated runtime** | ~10 seconds (type check + lint) |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit && npm run lint`
- **After every plan wave:** Run `npx tsc --noEmit && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green + dev server starts
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| scaffold | 01 | 1 | scaffold | smoke | `npm run dev -- --port 3001` | ❌ W0 | ⬜ pending |
| types | 01 | 1 | types | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| lint | 01 | 1 | lint | lint | `npm run lint` | ❌ W0 | ⬜ pending |
| constants | 01 | 1 | constants | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| dirs | 01 | 1 | directories | file-system | manual `ls` check | ❌ W0 | ⬜ pending |
| shadcn | 02 | 2 | components | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/types/index.ts` — defines `SdnEntry`, `ResultRow`, `RunParams`, `Region`, `EntityType`
- [ ] `src/lib/constants.ts` — exports `DEFAULT_CATCH_THRESHOLD = 0.85`, `MAX_ENTITY_COUNT = 500`
- [ ] `src/lib/rules/.gitkeep` — empty placeholder so directory is tracked by git
- [ ] `src/app/actions/.gitkeep` — empty placeholder
- [ ] `src/data/.gitkeep` — empty placeholder
- [ ] `.prettierrc` — formatting config
- [ ] `.prettierignore` — exclude `.next/`, `node_modules/`, `data/sdn.json`
- [ ] `.gitignore` additions — covers `node_modules/`, `.vercel/`, `.env.local`, `*.docx`

*Note: No test runner framework in Wave 0 — Phase 1 has no pure functions to unit test. Test framework setup deferred to Phase 3.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dev server starts | scaffold success criterion | Requires running process | Run `npm run dev`, confirm no errors in terminal, visit localhost:3000 |
| shadcn components render | Phase 1 component setup | Requires browser | Import a shadcn Button in page.tsx, confirm renders at localhost:3000 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
