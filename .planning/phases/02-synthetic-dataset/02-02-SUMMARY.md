---
phase: 02-synthetic-dataset
plan: 02
subsystem: data
tags: [json, typescript, sdn, synthetic-data, ofac]

# Dependency graph
requires:
  - phase: 02-synthetic-dataset-01
    provides: 160 individual SdnEntry records in data/sdn.json with all four regions

provides:
  - Complete 285-entry SdnEntry[] dataset covering all four entity types and four linguistic regions
  - 80 business entries (20 per region — arabic, cjk, cyrillic, latin)
  - 30 vessel entries (latin:18, arabic:8, cjk:4 — tagged by vessel name script)
  - 15 aircraft entries (all region latin — ICAO registration and operator-name styles)

affects:
  - 03-degradation-rules (samples from this dataset for rule testing)
  - 04-sampler-and-scoring (uses full 285-entry dataset for entity counts)
  - 05-ui (displays entity type distribution from this dataset)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Flat SdnEntry[] JSON array extended by replacing closing bracket with comma-continued entries
    - Vessel region tagged by script of vessel name (not operator nationality)
    - Aircraft always tagged region latin regardless of country of registration

key-files:
  created: []
  modified:
    - data/sdn.json

key-decisions:
  - "Aircraft tagged region latin per locked CONTEXT.md decision — ICAO registration strings are Latin-script regardless of issuing country"
  - "Vessel region set by script of vessel name (AL NOOR = arabic, HONG XIANG = cjk, ATLANTIC SPIRIT = latin) — not by operator nationality"
  - "No cyrillic-tagged vessels per CONTEXT.md constraint"
  - "Aircraft count is 15 (not 20) — intentional per must_haves spec; Phase 4 sampling uses with-replacement so 15 is sufficient"

patterns-established:
  - "Pattern: Append-only JSON extension — new entity type blocks appended after last individual entry, no structural reorganization"
  - "Pattern: IDs follow {type}-{region}-{padded-3-digit} format consistently across all entity types"

requirements-completed: [DATA-02, DATA-03, DATA-04, DATA-05]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 2 Plan 02: Synthetic Dataset Extension Summary

**285-entry SdnEntry[] dataset complete: 160 individuals + 80 businesses (20/region) + 30 vessels (latin/arabic/cjk) + 15 aircraft (all latin) — npx tsc --noEmit clean**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-04T15:44:00Z
- **Completed:** 2026-03-04T15:44:50Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Extended data/sdn.json from 160 to 285 entries by appending 80 business + 30 vessel + 15 aircraft entries
- Business entries: exactly 20 per region covering authentic Arabic trading/financial companies, CJK Chinese/DPRK corporations, Russian OOO/AO/PAO legal entities, and Latin European front-company patterns
- Vessel entries: 18 Latin-script vessels (English names), 8 Arabic-script vessels (AL NOOR, BADR AL DIN, etc.), 4 CJK-script vessels (HONG XIANG, ORIENT GLORY, etc.) — all tagged by vessel name script
- Aircraft entries: 15 entries all region latin — ICAO registration style (EP-TQA, RA-76503, UP-B1601, YK-ATD) and operator-name style (MAHAN AIR BOEING 747, CHAM WINGS A320)
- TypeScript compile passes with zero errors on complete 285-entry dataset

## Task Commits

Each task was committed atomically:

1. **Task 1: Append Business, Vessel, and Aircraft entries to data/sdn.json** - `4c2e78f` (feat)

**Plan metadata:** (docs commit — follows this SUMMARY creation)

## Files Created/Modified

- `data/sdn.json` - Extended from 160 individual entries to 285 total entries covering all four entity types

## Decisions Made

- Vessel HONG XIANG appears as both a business entity (biz-cjk-001) and a vessel (vsl-cjk-001) — this is intentional and mirrors real OFAC list patterns where a vessel and operator share a name; IDs are distinct so there are no duplicate ID collisions
- Aircraft count is 15 (not 20) — this is the plan-specified count per must_haves truths; the validation script's "all types >= 20" check was a generic threshold but aircraft = 15 is the locked contract
- No changes required to tsconfig.json or any TypeScript source — the JSON module import path alias (@data/*) was established in Plan 01

## Deviations from Plan

None - plan executed exactly as written. All 125 new entries matched verbatim name and ID specifications from the plan.

## Issues Encountered

None. The Edit tool approach (replacing closing `]` with comma-continued entries + new closing `]`) worked cleanly. TypeScript resolved with zero errors on the first compile attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full 285-entry synthetic dataset is ready for Phase 3 degradation rule development
- All four entity types present with sufficient counts for Phase 4 sampling (160/80/30/15)
- All four linguistic regions present with authentic naming patterns
- data/sdn.json is a valid flat SdnEntry[] array importable via `import sdnData from '@data/sdn.json'` (alias set in Phase 2 Plan 01)

## Self-Check: PASSED

- data/sdn.json: FOUND
- .planning/phases/02-synthetic-dataset/02-02-SUMMARY.md: FOUND
- Commit 4c2e78f: FOUND
- Total entries: 285, Unique IDs: 285, Match: true
- By type: individual:160, business:80, vessel:30, aircraft:15
- By region: arabic:68, cjk:64, cyrillic:60, latin:93
- All have country: true
- Aircraft all latin: true
- No cyrillic vessels: true
- npx tsc --noEmit: PASSED (zero errors)

---
*Phase: 02-synthetic-dataset*
*Completed: 2026-03-04*
