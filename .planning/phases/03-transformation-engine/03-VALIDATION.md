---
phase: 3
slug: transformation-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (`vitest@^4`, peer: `vite@^6`) |
| **Config file** | `vitest.config.ts` at project root — ❌ Wave 0 installs |
| **Quick run command** | `npx vitest run src/lib/rules/__tests__/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds (pure logic, no I/O) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/rules/__tests__/` (scoped to just-written test file)
- **After every plan wave:** Run `npx vitest run` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green + `npx tsc --noEmit` clean
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| vitest-setup | 01 | 0 | RULE-01–10 | framework | `npx vitest run` | ❌ W0 | ⬜ pending |
| rule-01 | 01 | 1 | RULE-01 | unit | `npx vitest run src/lib/rules/__tests__/rule-01.test.ts` | ❌ W0 | ⬜ pending |
| rule-02 | 01 | 1 | RULE-02 | unit | `npx vitest run src/lib/rules/__tests__/rule-02.test.ts` | ❌ W0 | ⬜ pending |
| rule-03 | 01 | 1 | RULE-03 | unit | `npx vitest run src/lib/rules/__tests__/rule-03.test.ts` | ❌ W0 | ⬜ pending |
| rule-04 | 01 | 1 | RULE-04 | unit | `npx vitest run src/lib/rules/__tests__/rule-04.test.ts` | ❌ W0 | ⬜ pending |
| rule-05 | 01 | 1 | RULE-05 | unit | `npx vitest run src/lib/rules/__tests__/rule-05.test.ts` | ❌ W0 | ⬜ pending |
| rule-06 | 02 | 2 | RULE-06 | unit | `npx vitest run src/lib/rules/__tests__/rule-06.test.ts` | ❌ W0 | ⬜ pending |
| rule-07 | 02 | 2 | RULE-07 | unit | `npx vitest run src/lib/rules/__tests__/rule-07.test.ts` | ❌ W0 | ⬜ pending |
| rule-08 | 02 | 2 | RULE-08 | unit | `npx vitest run src/lib/rules/__tests__/rule-08.test.ts` | ❌ W0 | ⬜ pending |
| rule-09 | 02 | 2 | RULE-09 | unit | `npx vitest run src/lib/rules/__tests__/rule-09.test.ts` | ❌ W0 | ⬜ pending |
| rule-10 | 02 | 2 | RULE-10 | unit | `npx vitest run src/lib/rules/__tests__/rule-10.test.ts` | ❌ W0 | ⬜ pending |
| sampler | 03 | 3 | RULE-01–10 | unit | `npx vitest run src/lib/rules/__tests__/sampler.test.ts` | ❌ W0 | ⬜ pending |
| index | 03 | 3 | RULE-01–10 | compile-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest@^4 @vitest/coverage-v8@^4 vite@^6 vite-tsconfig-paths` — framework install
- [ ] `vitest.config.ts` — project root config with `test: { environment: 'node' }` and tsconfig-paths plugin
- [ ] `package.json` — add `"test": "vitest run"` and `"test:watch": "vitest"` scripts
- [ ] `src/lib/rules/__tests__/` — directory created
- [ ] Stub test files for all 10 rules + sampler (created as part of Wave 1 / Wave 2 tasks — not pre-stubs)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RULE-07 phonetic output looks plausible | RULE-07 | Semantic quality check | Run: `node -e "const {ruleMap}=require('./src/lib/rules/index.js'); console.log(ruleMap['phonetic']({id:'t',name:'OSAMA IBN LADEN',entityType:'individual',region:'arabic'}))"` — confirm output contains `USAMA` |
| RULE-10 alias output matches OFAC convention | RULE-10 | Semantic quality check | Run: same pattern for `MOHAMMED` entry — confirm output contains a known variant (MOHAMED, MUHAMMAD) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
