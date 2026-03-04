# Phase 3: Transformation Engine - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement all 10 degradation rule functions as pure TypeScript modules in `src/lib/rules/`, add a `src/lib/sampler.ts` that draws entries from the dataset, and install + configure Vitest with unit tests covering all 10 rules. No UI, no Server Actions, no data fetching — pure logic only.

</domain>

<decisions>
## Implementation Decisions

### Script-Awareness Policy
- Rule functions return **`null`** when the rule is not applicable to the entry's script/region
- The engine (Phase 4) skips `(rule, entry)` pairs where the rule returns `null` — **no row is generated** for inapplicable combinations
- Rationale: returning original-unchanged inflates the catch rate (similarity = 1.0 always passes the 0.85 threshold); skipping keeps results meaningful for the compliance demo
- Each rule file documents its applicable regions in a JSDoc comment
- Rule applicability matrix (as implemented):
  - RULE-01 (space removal): all regions
  - RULE-02 (char substitution / OCR leet): all regions
  - RULE-03 (diacritic): `latin` and `cyrillic` only (CJK and Arabic have no Latin diacritics)
  - RULE-04 (word reorder): all regions (even single-word names produce no-op → return null if fewer than 2 tokens)
  - RULE-05 (abbreviation / vowel-drop): `arabic`, `cyrillic`, `latin` only (CJK characters cannot have vowels dropped)
  - RULE-06 (truncation): all regions
  - RULE-07 (phonetic / transliteration): `arabic` and `cyrillic` only (lookup table covers those scripts)
  - RULE-08 (punctuation insert/remove): all regions
  - RULE-09 (prefix/suffix removal): all regions
  - RULE-10 (nickname / alias): `arabic` only for v1 (Arabic given-name variants are the highest-value OFAC use case)

### RULE-07 Phonetic Lookup Table
- **Priority: Arabic first names + Russian first names** — these dominate the OFAC SDN list
- Arabic variants to include (minimum):
  - Osama / Usama / Usamah
  - Omar / Umar / Omr
  - Qaddafi / Gaddafi / Kadafi / Kadhafi / Qadhafi
  - Ahmad / Ahmed / Ahamed
  - Khalid / Khaled / Khaalid
  - Hassan / Hasan / Hassaan
  - Ibrahim / Ebrahim / Ibraahim
  - Yusuf / Yousef / Josef
  - Mustafa / Mustapha / Mostafa
  - Tariq / Tarek / Tarik
  - Bilal / Bilaal / Belal
  - Saleh / Salih / Salah
- Russian/Cyrillic variants to include (minimum):
  - Aleksandr / Alexander / Alexandre / Aleksander
  - Yuliya / Yulia / Julia
  - Pyotr / Piotr / Peter
  - Dmitry / Dmitri / Dmitriy / Dmytro
  - Mikhail / Mikhael / Michael
  - Nikolai / Nikolay / Nikolaos
  - Sergei / Sergey / Sergii
- Lookup structure: `Map<string, string[]>` keyed on canonical form, values are variant spellings
- Rule applies the first matching variant found (deterministic: variants sorted alphabetically, pick index 0)
- If no lookup match found for the name or any token, return `null` (do not apply rule)

### RULE-10 Alias Table Scope
- **Arabic given names only for v1** — Mohammed variants are the highest-value OFAC screening edge case
- Alias table entries (minimum):
  - Mohammed / Mohamed / Muhammad / Mohammad / Mohamad / Muhammed / Muhamad
  - Ali / Aly / Alee
  - Hassan / Hasan
  - Hussein / Hussain / Hossein / Husayn
  - Abdullah / Abdallah / Abdulah
  - Abdul / Abd Al (prefix normalization)
- Applied to given names (first token or post-ibn token), not surnames/nisba
- Rule returns the first alternative spelling that differs from the input (alphabetically sorted, deterministic)
- If no alias match → return `null`
- Russian diminutives (Aleksandr/Sasha) and CJK romanization variants deferred to v2

### Test Framework
- **Vitest** — standard for Next.js 15, ESM-native, zero-config with TypeScript, fast (no separate babel transform)
- Install: `npm install -D vitest @vitest/coverage-v8`
- Config: `vitest.config.ts` at project root (minimal — just `test: { environment: 'node' }`)
- Test files: `src/lib/rules/__tests__/rule-XX.test.ts` — one file per rule
- Test script: add `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`
- Each test file covers: (a) Latin fixture producing expected output, (b) at least one multi-script fixture (Arabic or CJK or Cyrillic), (c) inapplicable-script case returning `null`

### Sampler
- `src/lib/sampler.ts` — pure function `sampleEntries(data: SdnEntry[], params: RunParams): SdnEntry[]`
- Samples with replacement (random, seeded for reproducibility in tests)
- Filters by `params.regions` and `params.entityCounts` before sampling
- Returns exactly `sum(entityCounts)` entries with correct type×region distribution
- Test: given a fixture `RunParams` with `{individual: 5, business: 3}`, returns array with 5 individuals and 3 businesses

### Determinism
- **`CANONICAL_RULE_ORDER`** exported constant in `src/lib/rules/index.ts` — array of all 10 rule IDs in fixed order
- Engine applies rules in this order, not in user-selection order
- Ensures identical results for identical `RunParams` regardless of UI checkbox order
- RULE-XX IDs follow pattern: `'space-removal' | 'char-substitution' | 'diacritic' | 'word-reorder' | 'abbreviation' | 'truncation' | 'phonetic' | 'punctuation' | 'prefix-suffix' | 'alias'`

### Rule File Structure
- Each rule: `src/lib/rules/{rule-id}.ts` — exports a single function `(entry: SdnEntry) => string | null`
- `src/lib/rules/index.ts` — exports `CANONICAL_RULE_ORDER`, `RULE_LABELS` (id → display name), and all rule functions as `ruleMap: Record<RuleId, RuleFunction>`
- No barrel re-exports of individual functions — consumers use `ruleMap[ruleId](entry)`

</decisions>

<specifics>
## Specific Ideas

- RULE-05 (abbreviation) for Arabic names should drop vowels from the transliterated form. Example: `HASSAN IBN ALI AL-RASHIDI` → `HSSN IBN AL AL-RSHD`. The ibn/bint connectors and nisba prefix (AL-) are preserved — only the given names and surname tokens get vowel-stripped.
- RULE-04 (word reorder) should rotate tokens, not randomly shuffle — rotation is deterministic without a seed. `A B C D` → `B C D A` (left-rotate by 1). This avoids needing a random seed for this rule.
- RULE-06 (truncation) drops the LAST token. `HASSAN IBN ALI AL-RASHIDI` → `HASSAN IBN ALI`. Single-token names return `null`.
- RULE-09 (prefix/suffix removal): Prefix table: `Mr`, `Mrs`, `Dr`, `Prof`, `Sheikh`, `Sheikha`, `Imam`, `Haji`, `Hajj`. Suffix table: `Jr`, `Sr`, `II`, `III`, `IV`, `PhD`, `MD`. These are the patterns that appear in real OFAC entries.
- The `ruleLabel` in `ResultRow` should come from `RULE_LABELS` in the index — e.g., `'Space Removal'`, `'OCR/Leet Substitution'`, `'Diacritic Removal'`, `'Word Reorder'`, `'Abbreviation'`, `'Truncation'`, `'Phonetic Variant'`, `'Punctuation'`, `'Prefix/Suffix Removal'`, `'Alias Substitution'`.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/index.ts` — `SdnEntry`, `Region`, `EntityType`, `REGION_VALUES`, `ENTITY_TYPE_VALUES` — import `@/types`
- `src/lib/constants.ts` — `DEFAULT_CATCH_THRESHOLD`, `MAX_ENTITY_COUNT` — available for sampler upper-bound validation
- `data/sdn.json` — 290 entries; `@data/sdn.json` import path alias via tsconfig
- `src/lib/rules/` directory — already exists (`.gitkeep` placeholder)

### Established Patterns
- Pure TypeScript, strict mode, `@/*` alias for `./src/*`
- No runtime schema validation for internal data (Zod deferred to Phase 4 user-input boundaries)
- Named exports only (no default exports) — established in Phase 1

### Integration Points
- Phase 4 (Server Action): imports `ruleMap`, `CANONICAL_RULE_ORDER`, `sampleEntries` from this phase
- Phase 5 (Form): needs `RULE_LABELS` to populate the rule checkbox list with human-readable names
- Phase 6 (Results Table): `ResultRow.ruleLabel` populated from `RULE_LABELS`

</code_context>

<deferred>
## Deferred Ideas

- **Russian diminutives in RULE-10** (Aleksandr/Sasha/Shura) — v2 enhancement; alias table complexity and vetting effort exceeds v1 demo value
- **CJK romanization variants in RULE-10** (Zheng/Cheng, Mao/Mau) — v2; would require a separate lookup table per romanization standard
- **Compound/chained degradations** (apply multiple rules simultaneously) — explicitly listed as v2 in REQUIREMENTS.md (ANAL-02)
- **Rule severity ratings** (High/Medium/Low based on real-world evasion frequency) — v2 (ANAL-04)

</deferred>

---

*Phase: 03-transformation-engine*
*Context gathered: 2026-03-04*
