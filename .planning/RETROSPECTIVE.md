# Retrospective

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-05
**Phases:** 9 | **Plans:** 17 | **Commits:** 98 | **Duration:** 2 days

### What Was Built

- Next.js 15 scaffold with shared TypeScript type contracts (SdnEntry, ResultRow, RunParams)
- 285-entry synthetic SDN dataset covering 4 entity types and 4 linguistic regions with culturally authentic naming
- 10 degradation rules as pure TypeScript functions with 57+ unit tests (deterministic via CANONICAL_RULE_ORDER)
- Zod-validated `runTest` server action — ~53ms worst-case, 14x under Vercel Hobby 10s timeout
- Full parameter form: entity counts, region/rule checkboxes with Select All, client name input
- Virtualized results table (TanStack Virtual) with Jaro-Winkler catch-rate scoring, sort by score, UTF-8 BOM CSV download
- Crowe-branded UI (indigo/amber) deployed live at https://ofac-sensitivity-testing.vercel.app
- Two gap-closure phases: table column alignment fix + formal VERIFICATION.md for phases 03/07

### What Worked

- **Strict dependency chain planning** — each phase had exactly one well-defined output consumed by the next; no phase waited on something it hadn't seen yet
- **TDD RED→GREEN discipline** — pure helper functions (formUtils, resultsUtils) had stubs written first; made the execution fast and regressions obvious
- **Synthetic data human review gate** — domain reviewer approval before Phase 3 began caught naming authenticity issues early; DATA-06 held firm
- **Gap closure as first-class phases** — treating the table fix and verification gaps as proper phases (8 + 9) rather than ad-hoc hotfixes kept the audit trail clean
- **Single Vercel deployment** — the decision to stay in Next.js (no Python backend) made deployment trivial; one `vercel --prod` and it worked

### What Was Inefficient

- **Table column alignment took 3 human-verify iterations** — the colgroup/percentage approach was tried first (plausible but wrong), then pixel widths without explicit td widths (still wrong), then finally explicit px on every th/td with display:flex on virtual rows. The root cause (colgroup doesn't propagate to position:absolute rows) could have been researched upfront
- **STATE.md progress percent was stale for much of the project** — the metadata drifted from reality and needed manual correction; a phase completion hook would help
- **Phase 3 skipped gsd-verifier** — VERIFICATION.md was only created retroactively in Phase 9; the pattern of running the verifier at phase completion should be a hard habit

### Patterns Established

- TanStack Virtual alignment: explicit px width on every `<th>` and `<td>` + `display:flex` on `<tr>` + fixed pixel table width (not 100%)
- Crowe TLS proxy: prefix all Vercel CLI and shadcn CLI commands with `NODE_TLS_REJECT_UNAUTHORIZED=0`
- Tailwind v4 + Crowe tokens: register in `@theme` inline block (not just `:root`) for utility class generation
- `next/font/google` removal pattern: replace with plain CSS font-family stack on Crowe network
- Mulberry32 PRNG (5 lines, no npm dep) for deterministic seeded sampling

### Key Lessons

- **Diagnose virtualizer alignment at research time, not fix time** — the colgroup behaviour under `position:absolute` is documented; a 10-minute read would have saved 3 deploy cycles
- **Run gsd-verifier immediately after phase execution** — not retroactively; each phase's evidence is freshest at completion
- **The gap closure workflow works well** — audit → plan-milestone-gaps → execute phases 8/9 was clean and traceable. No shortcuts needed

### Cost Observations

- Sessions: ~6 focused sessions over 2 days
- Notable: wave-based parallel execution (phases with multiple plans) was the biggest speed multiplier; single-plan phases ran in under 10 minutes each

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 9 |
| Plans | 17 |
| Commits | 98 |
| Duration | 2 days |
| Gap closure phases | 2 (8, 9) |
| Human verify iterations | 3 (table alignment) |
| Tests at completion | 57+ |
