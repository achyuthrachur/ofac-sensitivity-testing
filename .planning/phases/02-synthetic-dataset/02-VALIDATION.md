---
phase: 2
slug: synthetic-dataset
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (tsc) — no Vitest installed yet |
| **Config file** | `tsconfig.json` (exists, `strict: true`) |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` + Node.js count check (see below) |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit` + Node.js region/type count check
- **Before `/gsd:verify-work`:** Full suite must be green + manual name review
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| tsconfig-fix | 01 | 0 | DATA-01–05 | compile-check | `npx tsc --noEmit` | ✅ exists | ⬜ pending |
| sdn-individuals | 01 | 1 | DATA-01, DATA-05, DATA-06 | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| sdn-businesses | 01 | 1 | DATA-02, DATA-05, DATA-06 | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| sdn-vessels | 01 | 1 | DATA-03, DATA-05 | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| sdn-aircraft | 01 | 1 | DATA-04, DATA-05 | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| count-check | 01 | 1 | DATA-01–05 | count-script | `node -e "const d=require('./data/sdn.json');const r=new Set(d.map(e=>e.region));console.log([...r].sort().join(','))"` | ❌ W0 | ⬜ pending |
| naming-review | 01 | CP | DATA-06 | manual | Human review against RESEARCH.md name tables | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tsconfig.json` — add `"@data/*": ["./data/*"]` to `paths` so `data/sdn.json` is importable as `@data/sdn.json`
- [ ] `data/sdn.json` — replace `.gitkeep` placeholder with the actual dataset (created in Wave 1 tasks)

*Note: No test runner framework in Phase 2 — static JSON with TypeScript compile-time validation only. Test framework deferred to Phase 3.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Arabic names follow ism+nasab or kunya conventions | DATA-06 | No automated linguistic validator | Cross-check 5 random Arabic individuals against RESEARCH.md name tables: confirm pattern (given + ibn/bint + surname) |
| Chinese names appear surname-first | DATA-06 | No automated linguistic validator | Verify CJK individual entries use SURNAME GIVEN format |
| Russian names include patronymics | DATA-06 | No automated linguistic validator | Verify Cyrillic individual entries have 3 tokens (given + patronymic + surname) |
| Entry count meets minimums | DATA-01–04 | Manual count | Run: `node -e "const d=require('./data/sdn.json'); const counts={}; d.forEach(e=>counts[e.entityType]=(counts[e.entityType]||0)+1); console.log(counts)"` — confirm ≥20 per type |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
