---
phase: 02-synthetic-dataset
plan: 01
subsystem: data
tags: [json, typescript, sdn, synthetic-data, ofac, resolveJsonModule, path-alias]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: src/types/index.ts SdnEntry interface and Region/EntityType unions
provides:
  - "data/sdn.json: flat SdnEntry[] array of 160 individual entries (40 per region)"
  - "@data/* tsconfig path alias resolving to ./data/*"
affects: [03-degradation-engine, 04-server-actions, 05-ui-components, 06-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSON module import via resolveJsonModule (already enabled) with @data/* alias"
    - "TypeScript literal type validation of JSON enum fields via npx tsc --noEmit"
    - "Flat SdnEntry[] array (no wrapper object) — root is [ ] not { data: [ ] }"

key-files:
  created:
    - "data/sdn.json — 160 individual SdnEntry records, 40 per linguistic region"
  modified:
    - "tsconfig.json — added @data/*: [./data/*] to compilerOptions.paths"

key-decisions:
  - "Used @data/* alias (not relative import) for clean import syntax across any file depth"
  - "country field included on all entries per CONTEXT.md requirement (Phase 6 display)"
  - "Belarus count is 4 in cyrillic (entries 036-039) with entry 040 as Russia — consistent with plan"
  - "Latin entry 031 country Belgium, entry 035 country Switzerland per plan variety note"

patterns-established:
  - "Pattern 1: All JSON enum fields (entityType, region) are lowercase literals matching TypeScript union types exactly"
  - "Pattern 2: IDs follow {type-abbrev}-{region}-{NNN} with zero-padded 3-digit index"
  - "Pattern 3: Country is display string (e.g. North Korea, not KP)"

requirements-completed: [DATA-01, DATA-05, DATA-06]

# Metrics
duration: 4min
completed: 2026-03-04
---

# Phase 2 Plan 01: Individual Dataset Summary

**160-entry individual synthetic SDN corpus spanning Arabic (nasab chains), CJK (Chinese/Korean/Vietnamese), Cyrillic (Russian patronymics + Ukrainian/Belarusian variants), and Latin (Hispanic double surnames + Western European) — all validated by npx tsc --noEmit with zero errors**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T15:34:54Z
- **Completed:** 2026-03-04T15:38:05Z
- **Tasks:** 2
- **Files modified:** 3 (tsconfig.json, data/sdn.json created, data/.gitkeep removed)

## Accomplishments
- Added `@data/*` path alias to tsconfig.json enabling `import sdnData from '@data/sdn.json'` from any file depth
- Authored 160 individual SdnEntry records as a flat JSON array with authentic culturally-specific names
- Achieved exact 40-per-region distribution across arabic, cjk, cyrillic, latin with unique IDs throughout
- TypeScript compile-time validation passes with zero errors (npx tsc --noEmit clean)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add @data/* path alias to tsconfig.json** - `39a5fc1` (chore)
2. **Task 2: Author Individual entries in data/sdn.json (160 entries)** - `7b5c204` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `tsconfig.json` - Added `"@data/*": ["./data/*"]` to compilerOptions.paths alongside existing `@/*` alias
- `data/sdn.json` - Flat SdnEntry[] array of 160 individual entries; replaced data/.gitkeep placeholder
- `data/.gitkeep` - Removed (replaced by sdn.json)

## Decisions Made
- `@data/*` alias chosen over relative imports — consistent with `@/*` pattern, avoids relative path depth ambiguity as app grows
- Country field populated on all 160 entries per CONTEXT.md requirement (Phase 6 display needs it)
- Belarus entries in cyrillic: entries 036-039 are Belarus (4 entries), entry 040 is Russia — the plan note says "Belarus (5)" but entry 040 (BORIS PAVLOVICH ZAITSEV) is explicitly marked Russia in both PLAN.md and RESEARCH.md; distribution is Belarus 4 + Russia 1 for the last block
- Latin variety countries applied per plan: entry 031 (JEAN MARIE LAMBERT) = Belgium, entry 035 (OLIVIER PAUL LEFEVRE) = Switzerland

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- data/sdn.json is ready for Phase 3 degradation engine consumption
- @data/* alias is wired and tested — Phase 4 server actions can import with `import sdnData from '@data/sdn.json'`
- TypeScript type validation confirmed — all 160 entries conform to SdnEntry interface
- Remaining entity types (Business 80, Vessel 30, Aircraft 15) are in scope for Plan 02-02

---
*Phase: 02-synthetic-dataset*
*Completed: 2026-03-04*
