# Milestones

## v2.0 Production Face (Shipped: 2026-03-06)

**Phases completed:** 5 phases, 15 plans, 4 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.0 MVP (Shipped: 2026-03-05)

**Phases completed:** 9 phases, 17 plans
**Timeline:** 2026-03-03 → 2026-03-05 (2 days) | **Commits:** 98 | **LOC:** ~2,410 TypeScript/TSX

**Key accomplishments:**
- Next.js 15 scaffold with SdnEntry, ResultRow, RunParams type contracts powering every phase
- 285-entry synthetic SDN dataset — 4 entity types, 4 linguistic regions, domain-reviewer-approved authenticity
- 10 degradation rules as pure TypeScript functions, deterministic via CANONICAL_RULE_ORDER, 57+ tests
- Zod-validated server action completing worst-case 500 names × 10 rules in ~53ms
- Full parameter form with entity counts, region/rule checkboxes, Select All toggle, client name input
- Virtualized results table with Jaro-Winkler catch-rate scoring, sort, and UTF-8 BOM CSV download
- Crowe-branded UI (indigo/amber design system) deployed live at https://ofac-sensitivity-testing.vercel.app
- Gap closure: TanStack Virtual column alignment fixed; VERIFICATION.md coverage completed for all phases

**Live URL:** https://ofac-sensitivity-testing.vercel.app
**GitHub:** https://github.com/achyuthrachur/ofac-sensitivity-testing

---

