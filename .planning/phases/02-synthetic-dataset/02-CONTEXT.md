# Phase 2: Synthetic Dataset - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build `data/sdn.json` — a built-in synthetic SDN dataset covering all four entity types (Individual, Business, Vessel, Aircraft) across all four linguistic regions (Arabic, CJK, Cyrillic, Latin) with culturally authentic naming conventions. No UI, no logic, no sampling — just the data file that the sampler in Phase 4 will draw from.

</domain>

<decisions>
## Implementation Decisions

### Dataset Scale
- **Total target: ~300 entries** across all entity types and regions
- **Individual**: 40 entries per region × 4 regions = 160 entries — the largest pool since consultants typically show the highest counts for individuals
- **Business**: 20 entries per region × 4 regions = 80 entries — mix of holding companies, shell names, front organizations
- **Vessel**: 30 entries total — distributed across regions based on realistic OFAC vessel name distribution (heavier Arabic and Latin, some CJK); tagged by the **script of the vessel name** not the operator nationality
- **Aircraft**: 15 entries total — mostly Latin-script registration-style names (e.g. `EP-TQA`, `RA-76503`), a few Arabic/CJK operator names in Latin transliteration
- Rationale: Sampler in Phase 4 will pick **with replacement**, so 20 unique names per type is mathematically sufficient for 500 samples — but 30–40+ per type provides visible variety in demo results

### Naming Authenticity Level
- **Domain-realistic, not just structurally valid** — names should look like entries a compliance professional would recognize from the actual SDN list
- Individual naming conventions:
  - **Arabic**: ism (given name) + nasab (ibn/bint chain) or kunya (Abu/Umm) patterns. Examples: `HASSAN IBN ALI AL-RASHID`, `ABU BAKR AL-BAGHDADI`, `UMAYMA BINT OSAMA`. Use authentic Arabic-origin given names (Omar, Hassan, Ahmad, Fatima, Zaynab, Khadijah, etc.)
  - **CJK**: Surname-first, two or three syllables. Chinese examples: `ZHANG WEI`, `LI HONG MEI`, `WANG JIANGUO`. Korean: `KIM JONG IL`, `CHOE SUN HUI`. Vietnamese (tagged as CJK): `NGUYEN THI HOA`
  - **Cyrillic**: Russian patronymic pattern — given name + patronymic + surname. Examples: `IGOR VLADIMIROVICH PETROV`, `NATALIA ALEKSEYEVNA IVANOVA`. Also include Belarusian, Ukrainian variants. Transliterated to Latin script (OFAC uses Latin transliteration)
  - **Latin**: Mix of Western European (French, German, Spanish, Italian) and Latin American. Examples: `JEAN-PIERRE MÜLLER`, `CARLOS EDUARDO RODRIGUEZ GARCIA`, `GIOVANNI RICCI`
- Business naming conventions:
  - **Arabic**: `AL-NOOR TRADING LLC`, `BADR INTERNATIONAL GROUP`, `FADL SHIPPING COMPANY`
  - **CJK**: `HONG XIANG INDUSTRIAL CO LTD`, `BEIJING WANTONG REAL ESTATE`, `DAESUNG GENERAL BUREAU`
  - **Cyrillic**: `STROYTRANSGAZ OOO`, `VNESHTORGBANK JSC`, `ROSATOM STATE CORPORATION`
  - **Latin**: `GLOBAL TRADE SOLUTIONS SA`, `EMPRESA DE IMPORTACIONES Y EXPORTACIONES`, `KREBS CONSULTING GMBH`
- Keep names fictional but plausible — avoid names of real sanctioned individuals

### Vessel & Aircraft Naming
- **Vessels**: Tagged by script of vessel name (not operator nationality)
  - Latin-tagged vessels: `ATLANTIC SPIRIT`, `BUENA VISTA`, `SEA EAGLE`
  - Arabic-tagged vessels: `AL NOOR`, `BADR AL DIN`, `FAJR`
  - CJK-tagged vessels: `HONG XIANG`, `BLUE DIAMOND`, `PACIFIC STAR` (romanized CJK origin names)
  - No Cyrillic-tagged vessels (uncommon in OFAC list — skip that combo)
  - Vessels do NOT include IMO numbers or call signs — `name` field is the vessel name only (e.g. `M/V ATLANTIC SPIRIT` or just `ATLANTIC SPIRIT`)
- **Aircraft**: All tagged as `latin` region — aircraft registration codes are always Latin-script
  - Mix registration-style names: `EP-TQA`, `RA-76503`, `UP-B1601`
  - And operator-name style: `MAHAN AIR BOEING 747`, `CHAM WINGS AIRLINES A320`
  - Country coverage: Iran (`EP-`), Russia (`RA-`), Kazakhstan (`UP-`), Syria (operator name style)

### Country Field
- **Include country for all Individual and Business entries** — makes the demo more informative (compliance professionals want to see the country of origin)
- **Vessels and Aircraft**: include country field as the flag state / operator country
- Country values are **display strings** (not ISO codes) — e.g. `"Iran"`, `"Russia"`, `"North Korea"`, `"Syria"`, `"Cuba"`, `"Libya"`, `"Venezuela"`, `"Belarus"`, `"China"`, `"Lebanon"`
- Coverage should skew toward current top OFAC sanction targets
- Not exhaustive — it's OK if some entries share the same country

### ID Convention
- Entry IDs use pattern: `{type}-{region}-{padded_index}` e.g. `ind-arabic-001`, `biz-cjk-007`, `vsl-latin-003`, `acft-latin-002`
- Purely for React key stability and debugging — not shown in UI

### File Format
- Plain JSON array: `SdnEntry[]`
- No wrapper object (direct array) — simplest to `import sdn from '@/data/sdn.json'`
- Committed to git (not gitignored) — it is the built-in dataset, not generated output

### Validation
- TypeScript type-checks the import via `data satisfies SdnEntry[]` in a type-check-only file, OR the executor simply imports it and verifies `npx tsc --noEmit` passes — both are acceptable
- No runtime schema library needed (Zod validation is Phase 4 for user input, not for static data)

</decisions>

<specifics>
## Specific Ideas

- The dataset is imported as a static JSON module: `import sdnData from '@/data/sdn.json'`. The tsconfig `resolveJsonModule: true` must be confirmed (Next.js enables this by default).
- The `data/` directory already exists (`.gitkeep` placeholder from Phase 1) — replace the placeholder with `sdn.json`.
- For the demo, the most visually compelling entries are Arabic individuals with long ism+nasab chains (e.g. `HASSAN IBN ALI IBN OMAR AL-RASHIDI`) — degradation rules like space removal and abbreviation produce dramatic changes on these.
- Cyrillic-region individuals should use the standard US transliteration that OFAC uses (not BGN/PCGN) — e.g. `PUTIN` not `PUTIN` (same in this case), `IGOR` not `IGOR`, `ALEKSEY` not `ALEKSEI`. The key convention is that these are the OFAC-style transliterations the screening system would see.
- A TypeScript `satisfies` assertion is the cleanest validation: at the top of a type-check file or inline in the data file via a cast. Recommend adding `as SdnEntry[]` to the import and letting TSC validate the shape.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/index.ts` — `SdnEntry`, `Region`, `EntityType`, `REGION_VALUES`, `ENTITY_TYPE_VALUES` are all defined; import from `@/types`
- `data/.gitkeep` — placeholder exists; replace with `sdn.json`
- `tsconfig.json` — `strict: true`, `@/*` alias wired to `./src/*`; Next.js enables `resolveJsonModule` by default

### Established Patterns
- Entry IDs follow `{type}-{region}-{padded_index}` convention
- Regions: `arabic | cjk | cyrillic | latin` (string literals from `REGION_VALUES`)
- Entity types: `individual | business | vessel | aircraft` (string literals from `ENTITY_TYPE_VALUES`)
- Country field is `string | undefined` — include it for all entries in this dataset

### Integration Points
- Phase 3 (Transformation Engine): the degradation rules will receive `SdnEntry.name` strings — the richer and more varied the names, the more interesting the demo results
- Phase 4 (Server Action / Sampler): will `import sdnData from '@/data/sdn.json'` and filter by `entityType` and `region` before sampling; the JSON must be a flat array
- Phase 7 (Polish): dataset is immutable — no changes expected after Phase 2

</code_context>

<deferred>
## Deferred Ideas

- **Aliases array on SdnEntry**: Real SDN entries have multiple alternate spellings listed. Adding `aliases?: string[]` would enrich Phase 3 (phonetic rules could draw from aliases). Deferred to v2 — adds complexity to the type and sampler.
- **Real SDN name sampling**: Cross-referencing actual OFAC SDN XML to pick the most common name patterns per region. Deferred — legal/compliance risk consideration, synthetic is sufficient for v1 demo.
- **500+ entries per entity type** (without replacement sampling): Would require ~2,000 total entries. Deferred — with-replacement sampling makes this unnecessary for v1.

</deferred>

---

*Phase: 02-synthetic-dataset*
*Context gathered: 2026-03-04*
