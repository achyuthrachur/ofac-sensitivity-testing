---
phase: 02-synthetic-dataset
verified: 2026-03-04T17:15:00Z
status: passed
score: 10/10 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 9/10
  gaps_closed:
    - "All four entity types have minimum 20 entries — aircraft increased from 15 to 20 (acft-latin-016 through acft-latin-020 added)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Open data/sdn.json and scan 10 Arabic individual entries at random"
    expected: "Each name shows a recognizable Arabic naming structure — ism+nasab chain (IBN/BIN), BINT feminine form, ABU kunya, or ABD theophoric — followed by an al-nisba (AL-surname)"
    why_human: "TypeScript verifies structure, not linguistic authenticity. Automated pattern check confirms tokens are present but cannot confirm cultural correctness of specific name combinations. Domain reviewer signed off 2026-03-04 in 02-03-SUMMARY.md."
  - test: "Scan 5 CJK individual entries covering China, North Korea, and Vietnam"
    expected: "Chinese names: surname (single character) then given name. Korean names: surname (KIM/RI/JANG/CHOE/PARK/KANG/YUN/LEE/CHO) then given name(s). Vietnamese names: family name (NGUYEN/TRAN/LE/PHAM/HOANG) then middle then given."
    why_human: "Automated check confirmed surname-first token ordering but cannot validate that specific surnames are culturally plausible for each country. Domain reviewer approved 2026-03-04."
  - test: "Scan 5 Cyrillic individual entries including at least one Ukrainian entry"
    expected: "Russian entries: given name + patronymic (-OVICH/-EVICH for males, -OVNA/-EVNA for females) + surname. Ukrainian entries: given name + patronymic (-OVYCH/-IVNA/-YIVNA) + surname."
    why_human: "Automated regex confirmed patronymic suffix presence for all 40 entries. Human review confirmed and approved 2026-03-04 in 02-03-SUMMARY.md — included here for completeness only."
---

# Phase 2: Synthetic Dataset Verification Report

**Phase Goal:** A built-in synthetic SDN dataset covers all four entity types and all required linguistic regions with culturally authentic naming conventions
**Verified:** 2026-03-04T17:15:00Z
**Status:** passed
**Re-verification:** Yes — after gap closure (aircraft count raised from 15 to 20)

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `data/sdn.json` exists as a flat `SdnEntry[]` array | VERIFIED | File opens with `[`; 290 entries confirmed by `require('./data/sdn.json').length` |
| 2 | Individual entries present, >= 20 (DATA-01) | VERIFIED | 160 individual entries; 40 per each of the four regions |
| 3 | Business entries present, >= 20 (DATA-02) | VERIFIED | 80 business entries; 20 per region |
| 4 | Vessel entries present, >= 20 (DATA-03) | VERIFIED | 30 vessel entries: latin 18, arabic 8, cjk 4 |
| 5 | Aircraft entries present, >= 20 (DATA-04) | VERIFIED | 20 aircraft entries — gap fix confirmed; acft-latin-016 through acft-latin-020 present and valid |
| 6 | All four regions covered (DATA-05) | VERIFIED | arabic (68), cjk (64), cyrillic (60), latin (98) — all four present |
| 7 | Arabic naming: ism+nasab/kunya patterns (DATA-06) | VERIFIED | 40/40 Arabic individuals have IBN, BIN, BINT, ABU, or ABD token; 40/40 have AL- nisba |
| 8 | CJK naming: surname-first order (DATA-06) | VERIFIED | ZHANG WEI, KIM JONG SU, NGUYEN VAN HUNG — surname leads; confirmed for China, North Korea, Vietnam |
| 9 | Cyrillic naming: given+patronymic+surname (DATA-06) | VERIFIED | 40/40 Cyrillic individuals match `/OVICH\|EVICH\|OVNA\|EVNA\|OVYCH\|IVNA\|YIVNA/`; Ukrainian variants present |
| 10 | All entity types have >= 20 entries (Plan 02-02 threshold) | VERIFIED | individual 160, business 80, vessel 30, aircraft 20 — all meet threshold |

**Score:** 10/10 truths verified

---

### Re-verification: Gap Closure Evidence

**Previous gap:** Aircraft count was 15 — below the >= 20 minimum asserted in the Plan 02-02 verification script.

**Fix applied:** Five aircraft entries (acft-latin-016 through acft-latin-020) added to `data/sdn.json`.

**New entries confirmed present and valid:**

| ID | Name | Region | Country |
|----|------|--------|---------|
| acft-latin-016 | YK-BAD | latin | Syria |
| acft-latin-017 | RA-86524 | latin | Russia |
| acft-latin-018 | EP-AGA | latin | Iran |
| acft-latin-019 | POUYA AIR BOEING 747 | latin | Iran |
| acft-latin-020 | UN-76435 | latin | Uzbekistan |

All five entries pass required field validation (id, name, entityType, region, country all present). All five have valid `entityType: "aircraft"` and `region: "latin"`. No duplicate IDs introduced — 290 total entries, 290 unique IDs.

**Regression check:** All previously-passing truths (1-9) confirmed unchanged. Entity type counts, region coverage, naming patterns, and ID uniqueness all hold at the same values.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tsconfig.json` | `@data/*` path alias pointing to `./data/*` | VERIFIED | `"@data/*": ["./data/*"]` present at line 28; `resolveJsonModule: true` at line 12 |
| `data/sdn.json` | Flat `SdnEntry[]` array, >= 285 entries | VERIFIED | 290 entries; flat array confirmed; all required fields present on all 290 entries |
| `src/types/index.ts` | `SdnEntry` interface with correct union types | VERIFIED | Interface exported with `EntityType` and `Region` union types derived via `as const` pattern; `country` correctly typed as optional |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `data/sdn.json` | `src/types/index.ts SdnEntry` | `npx tsc --noEmit` | WIRED | `npx tsc --noEmit` exits with code 0 — zero errors; JSON is structurally conformant to the interface |
| `tsconfig.json @data/*` | `./data/*` | Path alias + resolveJsonModule | WIRED | Alias present; `resolveJsonModule: true` enables JSON imports; sdn.json in correct location |
| `src/lib/sdn-data.ts` (Phase 4) | `data/sdn.json` | `import sdnData from '@data/sdn.json'` | DEFERRED | Phase 4 consumer does not exist yet — deferred dependency, not a Phase 2 deliverable |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DATA-01 | 02-01 | Individual entity type present | SATISFIED | 160 individual entries (40 per region) |
| DATA-02 | 02-02 | Business/Organization entity type present | SATISFIED | 80 business entries (20 per region) |
| DATA-03 | 02-02 | Vessel entity type present | SATISFIED | 30 vessel entries; region-tagged by vessel name |
| DATA-04 | 02-02 | Aircraft entity type present | SATISFIED | 20 aircraft entries — gap resolved; type present and >= 20 |
| DATA-05 | 02-01, 02-02 | All four linguistic regions covered | SATISFIED | arabic, cjk, cyrillic, latin all present across entity types |
| DATA-06 | 02-01, 02-03 | Culturally authentic naming conventions | SATISFIED | Automated patterns confirmed + human domain reviewer signed off 2026-03-04 |

All six DATA-0x requirements are satisfied.

---

### Anti-Patterns Found

No blocker anti-patterns found. No TODO/FIXME/placeholder comments. No stub implementations. No empty returns. TypeScript compiles clean with `npx tsc --noEmit` exit code 0.

The previous warning (aircraft pool of 15 below plan threshold) is resolved — aircraft count is now 20.

---

### Human Verification Required

The following items require human judgment to confirm linguistic authenticity. All three were reviewed and approved by the domain reviewer on 2026-03-04 (documented in 02-03-SUMMARY.md). They are listed here for completeness and audit trail only — they do not block the `passed` status.

#### 1. Arabic Naming Authenticity (DATA-06)

**Test:** Open `data/sdn.json`, filter entries where `region === "arabic"` and `entityType === "individual"`. Review 10 entries at random.
**Expected:** Each name shows a recognizable Arabic naming structure — a nasab chain using IBN (son of) or BIN with al-nisba, a kunya using ABU (father of), a BINT feminine form, or a theophoric ABD AL- (servant of God) prefix.
**Why human:** TypeScript cannot verify linguistic authenticity. Automated checks confirmed 100% of Arabic individuals contain at least one structural token. Domain reviewer approved 2026-03-04.

#### 2. CJK Surname-First Confirmation (DATA-06)

**Test:** Review the first 5 Chinese entries (ZHANG WEI, LI HONG MEI, WANG JIANGUO, LIU BIAO, CHEN GANG), the first 3 Korean entries (KIM JONG SU, RI SONG JIN, JANG SONG THAEK), and the first 3 Vietnamese entries (NGUYEN VAN HUNG, TRAN THI HOA, LE VAN THANH).
**Expected:** Surname appears first in each name. Chinese: ZHANG/LI/WANG/LIU/CHEN are common Han surnames. Korean: KIM/RI/JANG are Korean surnames. Vietnamese: NGUYEN/TRAN/LE are top Vietnamese family names.
**Why human:** Domain reviewer reviewed and approved 2026-03-04.

#### 3. Cyrillic Patronymic Authenticity (DATA-06)

**Test:** Scan 5 Cyrillic entries including at least one Ukrainian entry.
**Expected:** Russian entries: given name + patronymic (-OVICH/-EVICH males, -OVNA/-EVNA females) + surname. Ukrainian entries: given name + patronymic (-OVYCH/-IVNA/-YIVNA) + surname.
**Why human:** Automated regex confirmed patronymic suffix presence for 40/40. Domain reviewer approved 2026-03-04.

---

## Data Quality Summary

| Check | Result |
|-------|--------|
| Total entries | 290 |
| Unique IDs | 290 (no duplicates) |
| ID format compliance | 290/290 (all match `(ind\|biz\|vsl\|acft)-(region)-[0-9]{3}`) |
| Required fields present | 290/290 (id, name, entityType, region, country all present) |
| Valid entityType values | 290/290 (no invalid values) |
| Valid region values | 290/290 (no invalid values) |
| `npx tsc --noEmit` | Zero errors (exit code 0) |
| Root structure | Flat array (not wrapper object) |
| Arabic naming patterns | 40/40 individuals have structural tokens |
| Arabic AL- nisba | 40/40 individuals have AL- nisba |
| Cyrillic patronymics | 40/40 individuals match patronymic regex |
| Aircraft count | 20 (was 15 — gap resolved) |
| Aircraft region | 20/20 aircraft tagged `region: "latin"` |
| Vessel count | 30 |
| Vessel region tagging | Confirmed correct by name script |

---

_Verified: 2026-03-04T17:15:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes — gap closure confirmed_
