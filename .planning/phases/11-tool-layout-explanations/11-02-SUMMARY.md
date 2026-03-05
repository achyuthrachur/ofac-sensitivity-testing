---
phase: 11-tool-layout-explanations
plan: "02"
subsystem: tool-ui
tags: [engine-documentation, explanation-panel, shadcn-tabs, expl-01, expl-02, expl-03]
dependency_graph:
  requires: [11-01]
  provides: [engine-explanation-panel, tabs-wired-post-run, pre-run-documentation]
  affects: [src/components/EngineExplanationPanel.tsx, src/app/tool/page.tsx]
tech_stack:
  added: []
  patterns: [pure-presentational-server-component, shadcn-tabs-conditional-render, pre-run-docs-post-run-tabs]
key_files:
  created:
    - src/components/EngineExplanationPanel.tsx
  modified:
    - src/app/tool/page.tsx
decisions:
  - "EngineExplanationPanel is a pure Server Component (no use client) — safe to render in both pre-run path and Engine Docs tab without duplication concerns"
  - "Tabs defaultValue=results ensures Results tab is active immediately after a run, matching user expectation"
  - "entry's apostrophe in JSX escaped as &apos; to satisfy React unescaped entity lint rule"
metrics:
  duration: "12 min"
  completed: "2026-03-05T18:28:00Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase 11 Plan 02: EngineExplanationPanel + Tabs Wiring Summary

**One-liner:** EngineExplanationPanel.tsx created with all three explanation sections (dataset, scoring, all 10 rules) and wired into tool/page.tsx as pre-run documentation and post-run Engine Docs tab via shadcn Tabs.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create EngineExplanationPanel.tsx with verified content | 91dd5ba | src/components/EngineExplanationPanel.tsx |
| 2 | Wire EngineExplanationPanel and Tabs into tool/page.tsx | 69ba94e | src/app/tool/page.tsx |

## What Was Built

### Task 1: EngineExplanationPanel.tsx

Pure presentational component at `src/components/EngineExplanationPanel.tsx` — no `'use client'`, no hooks, no browser APIs. Three content sections:

**About the Dataset (EXPL-02):**
- 285 synthetic SDN entries, not real individuals
- Entity types grid: Individual, Business, Vessel, Aircraft
- Linguistic regions grid: Arabic (IBN/BIN/ABU/AL-), Chinese/CJK, Russian/Cyrillic, Latin/European
- Sampling explanation: Mulberry32 PRNG seed=42, with-replacement sampling for consistent test sizes

**How Scoring Works (EXPL-03):**
- Jaro-Winkler similarity, 0 to 1 scale
- Three score landmark cards: 1.0 (identical), 0.85 (catch threshold), 0.0 (dissimilar)
- Why Jaro-Winkler: optimized for short strings, prefix weighting, handles typos/abbreviations/transliterations
- Dark indigo callout card with catch-rate explanation: "97% means 97 of 100 degraded variants still score above 0.85 threshold"
- Color coding reminder: Teal = caught, Coral = missed

**Degradation Rules (EXPL-01):**
All 10 rules listed with region badge, plain-English description, and example:
1. Space Removal (All regions) — AHMED ALI → AHMEDALI
2. OCR/Leet Substitution (All regions) — BILAL → 81L@L; O→0, I→1, E→3, A→@, S→5, B→8, G→9, T→7
3. Diacritic Removal (Latin · Cyrillic) — MÜLLER → MULLER; NFD decomposition
4. Word Reorder (All regions) — HASSAN ALI AL-RASHIDI → ALI AL-RASHIDI HASSAN
5. Abbreviation/Vowel Drop (Arabic · Cyrillic · Latin) — HASSAN IBN ALI → HSSN IBN L; connectors preserved
6. Truncation (All regions) — HASSAN IBN ALI AL-RASHIDI → HASSAN IBN ALI
7. Phonetic Variant (Arabic · Cyrillic) — OSAMA BIN LADEN → USAMAH BIN LADEN
8. Punctuation Removal (All regions) — AL-NOOR TRADING CO. → ALNOOR TRADING CO
9. Prefix/Suffix Removal (All regions) — DR CARLOS RODRIGUEZ JR → CARLOS RODRIGUEZ
10. Alias Substitution (Arabic only) — MOHAMMED ALI HASSAN → MOHAMAD ALI HASSAN

Footer note explains CJK entries only get the 6 all-region rules.

### Task 2: tool/page.tsx Wiring

Added two imports after existing imports:
- `EngineExplanationPanel` from `@/components/EngineExplanationPanel`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`

Right panel conditional updated:
- `rows.length === 0` path: renders `<EngineExplanationPanel />` directly
- `rows.length > 0` path: renders `<Tabs defaultValue="results">` with two tabs:
  - Results tab: `<ResultsTable rows={rows} clientName={clientName} />`
  - Engine Docs tab: `<EngineExplanationPanel />`

All state, handlers, and left panel content are unchanged.

## Verification Results

- `npm run build` — passes, no TypeScript errors
- `npm run test -- --run` — 114 tests, 14 test files, all green
- `EngineExplanationPanel.tsx` has no `'use client'` directive
- Exports `EngineExplanationPanel` named function
- All 10 rules present with labels, region badges, descriptions, examples
- `tool/page.tsx` imports both EngineExplanationPanel and Tabs
- Pre-run renders `<EngineExplanationPanel />`, post-run renders `<Tabs defaultValue="results">`

## Visual Checkpoint: APPROVED

Task 3 `checkpoint:human-verify` approved by user on 2026-03-05. All 8 verification checks passed:
1. Two-panel layout renders correctly
2. Dataset section content accurate (285 entries, 4 entity types, 4 regions, seed=42)
3. Scoring section shows 0.85 threshold and dark indigo catch-rate callout card with "97%"
4. All 10 degradation rules visible with region badges, descriptions, and examples
5. After running a test, Results tab is default and Engine Docs tab switches back to docs
6. Results table has no right-side gap
7. Both panels scroll independently

## Deviations from Plan

**1. [Rule 2 - Auto-fix] Escaped apostrophe in JSX**
- **Found during:** Task 1
- **Issue:** `entry's` in the JSX text would trigger unescaped entity lint error
- **Fix:** Replaced with `entry&apos;s` to satisfy React JSX lint rule
- **Files modified:** src/components/EngineExplanationPanel.tsx
- **Commit:** 91dd5ba (included in Task 1 commit)

## Self-Check: PASSED

All created/modified files confirmed on disk. All task commits confirmed in git log.
