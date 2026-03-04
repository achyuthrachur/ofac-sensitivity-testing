# Phase 2: Synthetic Dataset - Research

**Researched:** 2026-03-04
**Domain:** Culturally authentic SDN name corpus, JSON module import, TypeScript compile-time validation
**Confidence:** HIGH (naming conventions) / HIGH (JSON/TS mechanics)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Total target: ~300 entries** — Individual 160 (40/region × 4), Business 80 (20/region × 4), Vessel 30, Aircraft 15
- **Naming authenticity level:** Domain-realistic, not just structurally valid — names must look like entries a compliance professional would recognize from the actual SDN list
- **Arabic individuals:** ism + nasab (IBN/BINT chain) or kunya (ABU/UMM) patterns
- **CJK individuals:** Surname-first, two or three syllables; includes Vietnamese (tagged CJK)
- **Cyrillic individuals:** Given name + patronymic + surname in OFAC-style Latin transliteration (not BGN/PCGN)
- **Latin individuals:** Mix of Western European and Latin American, including compound surnames
- **Vessels:** Tagged by script of vessel name (not operator nationality); no IMO numbers; Latin/Arabic/CJK only (no Cyrillic-tagged vessels)
- **Aircraft:** All tagged `latin` region; mix of registration-style (EP-TQA, RA-76503, UP-B1601) and operator-name style
- **Country field:** Display strings (not ISO codes) for all entries; top OFAC sanction targets
- **ID convention:** `{type}-{region}-{padded_index}` (e.g. `ind-arabic-001`, `biz-cjk-007`)
- **File format:** Flat `SdnEntry[]` JSON array — no wrapper object
- **Location:** `data/sdn.json` (replaces `data/.gitkeep`)
- **Import pattern:** `import sdnData from '@/data/sdn.json'` — NOT valid with current `@/*` → `./src/*` alias; must use relative or `../../data/sdn.json` or add new path alias (see Architecture section)
- **Validation:** TypeScript `satisfies SdnEntry[]` assertion or `npx tsc --noEmit` — no Zod or runtime schema library

### Claude's Discretion

None documented in CONTEXT.md — all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- Aliases array (`aliases?: string[]`) on SdnEntry — deferred to v2
- Real SDN name sampling from actual OFAC XML — deferred (compliance risk)
- 500+ entries per entity type — deferred (with-replacement sampling makes it unnecessary)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | App includes built-in synthetic SDN names for Individual entity type | 160-entry name corpus with authentic patterns documented below |
| DATA-02 | App includes built-in synthetic SDN names for Business/Organization entity type | 80-entry business name corpus with legal-entity suffix patterns documented below |
| DATA-03 | App includes built-in synthetic SDN names for Vessel entity type | 30-entry vessel corpus with M/V prefix conventions and script tagging |
| DATA-04 | App includes built-in synthetic SDN names for Aircraft entity type | 15-entry aircraft corpus with ICAO registration prefix patterns |
| DATA-05 | Synthetic names span Arabic, Chinese, Russian/Cyrillic, and Latin/European linguistic regions | Four-region coverage with country skew toward OFAC priority targets |
| DATA-06 | Synthetic names follow culturally authentic naming conventions per region (ism+nasab for Arabic, surname-first for Chinese, etc.) | Detailed per-region naming rules with concrete verbatim examples below |
</phase_requirements>

---

## Summary

Phase 2 produces a single static file — `data/sdn.json` — that is a flat `SdnEntry[]` array of ~300 synthetic entries covering four entity types (Individual, Business, Vessel, Aircraft) and four linguistic regions (Arabic, CJK, Cyrillic, Latin). No code is written; the deliverable is purely the data file.

The two hard problems are (1) naming authenticity — names must pass a compliance professional's eye test as plausible SDN list entries — and (2) correct JSON module import wiring in Next.js 16 with TypeScript strict mode. Both are solved: naming conventions are comprehensively documented with verbatim examples below, and the import path issue (the `@/*` alias only covers `./src/*`) has a straightforward fix.

**Primary recommendation:** Write `data/sdn.json` directly as a hand-authored JSON file using the verbatim name tables below, then validate with `npx tsc --noEmit`. Do NOT add a runtime schema library. Add a `@/data/*` → `./data/*` path alias to `tsconfig.json` paths if the `import sdnData from '@/data/sdn.json'` import style is desired; otherwise use a relative import.

---

## Standard Stack

### Core

| Library/Tool | Version | Purpose | Why Standard |
|---|---|---|---|
| TypeScript `satisfies` operator | TS 4.9+ (project has TS 5) | Compile-time shape validation of JSON import | Catches type errors without runtime overhead; preserves inferred type |
| `resolveJsonModule` tsconfig flag | Already enabled in project | Allows `import x from '*.json'` with type inference | Default in Next.js; already set in this project's tsconfig.json |
| `npx tsc --noEmit` | TypeScript 5 | Full project type-check including JSON imports | Catches all shape errors; use as CI validation command |

### Supporting

| Tool | Version | Purpose | When to Use |
|---|---|---|---|
| VS Code JSON schema | Built-in | Authoring-time linting of sdn.json | During hand-authoring — immediate red squiggles on bad field names |
| Node.js `JSON.parse` | Runtime | Not needed — static import preferred | Only if file is read at runtime (not the case here) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| `import sdnData from '...'` static import | `fs.readFileSync` in server component | Static import is tree-shakeable and type-inferred; fs.readFile is runtime-only, loses compile-time shape |
| `satisfies SdnEntry[]` | Zod `z.array(SdnEntrySchema).parse(data)` | satisfies has zero runtime cost; Zod adds bundle size and is overkill for immutable static data |
| Hand-authored JSON | Code-generated JSON | Hand-authoring is perfectly maintainable at 300 entries; no generator needed |

---

## Architecture Patterns

### Recommended Project Structure

```
data/
└── sdn.json              # Replace .gitkeep — flat SdnEntry[] array
src/
├── types/
│   └── index.ts          # SdnEntry interface (already exists — no changes needed)
└── lib/
    └── constants.ts      # MAX_ENTITY_COUNT (already exists — no changes needed)
```

### Pattern 1: JSON Module Import with Type Safety

**What:** Import `data/sdn.json` as a static typed module in Next.js server and client components.

**Critical issue:** The current `tsconfig.json` defines `"@/*": ["./src/*"]`. This means `import x from '@/data/sdn.json'` would try to resolve to `./src/data/sdn.json` which does not exist. The file lives at `./data/sdn.json` (project root level, not inside `src/`).

**Two valid approaches:**

**Option A — Add a second path alias (recommended):**

Add to `tsconfig.json` `paths` section:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@data/*": ["./data/*"]
    }
  }
}
```

Then import as:
```typescript
// In any component or server action
import sdnData from '@data/sdn.json';
import type { SdnEntry } from '@/types';

const entries = sdnData as SdnEntry[];
```

**Option B — Relative import (simpler, no tsconfig change):**
```typescript
// From src/app/... files — adjust dots based on depth
import sdnData from '../../data/sdn.json';
import type { SdnEntry } from '@/types';

const entries = sdnData as SdnEntry[];
```

The CONTEXT.md specifies the intent as `import sdnData from '@/data/sdn.json'` — but `@/` maps to `./src/`. Option A with `@data/` is the cleanest fix. The planner should pick one approach and document it.

**Pattern 2: TypeScript Validation via `satisfies`**

**What:** Catch shape mismatches in sdn.json at compile time without runtime overhead.

**How to use:**

Create `src/lib/sdn-data.ts` (a thin validated re-export):
```typescript
// src/lib/sdn-data.ts
// Source: TypeScript 4.9+ satisfies operator
import rawData from '../../data/sdn.json';
import type { SdnEntry } from '@/types';

// satisfies validates shape at compile time; 'as' is needed for JSON import
// because TypeScript infers the JSON literally (literal types), not as SdnEntry[]
export const sdnData: SdnEntry[] = rawData as SdnEntry[];

// ALTERNATIVE: if you want satisfies without the cast (requires explicit typing):
// const _typeCheck = (rawData as unknown) satisfies SdnEntry[];
```

The simpler approach (acceptable per CONTEXT.md): just run `npx tsc --noEmit` after writing the file. If the JSON has a field with a wrong value (e.g., `"region": "latin-american"` instead of `"latin"`), TypeScript will error because `resolveJsonModule` infers literal types and the union check fails.

**Validation command (CI):**
```bash
npx tsc --noEmit
```

### Pattern 3: JSON File Structure

**What:** The exact file format that satisfies `SdnEntry[]`.

```json
[
  {
    "id": "ind-arabic-001",
    "name": "HASSAN IBN ALI AL-RASHIDI",
    "entityType": "individual",
    "region": "arabic",
    "country": "Iraq"
  },
  {
    "id": "biz-cjk-001",
    "name": "HONG XIANG INDUSTRIAL CO LTD",
    "entityType": "business",
    "region": "cjk",
    "country": "China"
  },
  {
    "id": "vsl-latin-001",
    "name": "ATLANTIC SPIRIT",
    "entityType": "vessel",
    "region": "latin",
    "country": "Panama"
  },
  {
    "id": "acft-latin-001",
    "name": "EP-TQA",
    "entityType": "aircraft",
    "region": "latin",
    "country": "Iran"
  }
]
```

Key structural rules:
- Root element is a JSON array `[...]` — not `{ "data": [...] }`
- Every entry has exactly: `id`, `name`, `entityType`, `region` (required) plus optional `country`
- `entityType` must be exactly one of: `"individual"`, `"business"`, `"vessel"`, `"aircraft"`
- `region` must be exactly one of: `"arabic"`, `"cjk"`, `"cyrillic"`, `"latin"`
- `id` uses zero-padded 3-digit index: `ind-arabic-001` through `ind-arabic-040`

### Anti-Patterns to Avoid

- **Using an object wrapper:** `{ "data": [...] }` — breaks `import x from 'sdn.json'` because the inferred type becomes `{ data: SdnEntry[] }` not `SdnEntry[]`
- **Non-literal region values:** `"region": "Latin"` (capitalized) or `"region": "latin-american"` — TypeScript will catch this, but it will fail at build time
- **Wrong ID format:** `ind_arabic_1` — must be hyphens and padded to 3 digits
- **Omitting country:** CONTEXT.md specifies to include country for all entries; omitting it on some will break Phase 6 display

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Schema validation | Custom JSON validator | TypeScript `satisfies` + `tsc --noEmit` | TSC validates JSON literal types exactly against the union; no code needed |
| Name generation | Random name generator script | Hand-authored verbatim names | At 300 entries, hand-authoring is faster and produces more authentic results than a generator |
| ICAO prefix lookup | Country-to-prefix table | Use the definitive list in this document | ICAO prefixes are stable; inline them in the data |

**Key insight:** This entire phase produces zero TypeScript/JavaScript code. The only file created is `data/sdn.json`. Tooling (TypeScript) validates it automatically. Any plan task that proposes writing a data-generation script is over-engineering.

---

## Common Pitfalls

### Pitfall 1: `@/data/sdn.json` alias does not resolve

**What goes wrong:** Developer writes `import sdnData from '@/data/sdn.json'` expecting it to work. TypeScript errors: "Cannot find module '@/data/sdn.json'". The `@/*` alias in tsconfig resolves to `./src/*`, so `@/data` resolves to `./src/data/`, not `./data/`.

**Why it happens:** The `data/` directory is at the project root, not inside `src/`. The alias is narrowly scoped to `src/`.

**How to avoid:** Either (a) add `"@data/*": ["./data/*"]` to tsconfig paths, or (b) use relative imports like `'../../data/sdn.json'`. Document the chosen approach in comments at the import site.

**Warning signs:** TypeScript error "Module not found" on a path containing `@/data`.

---

### Pitfall 2: JSON BOM breaks `JSON.parse`

**What goes wrong:** If `sdn.json` is saved with a UTF-8 BOM (Byte Order Mark, `\uFEFF` prefix), `JSON.parse()` throws "Unexpected token" at runtime. This doesn't affect the static import in Next.js (Webpack/Turbopack handles it) but would break any fs.readFileSync usage.

**Why it happens:** Some Windows editors (Notepad, older VS Code settings) default to UTF-8 BOM.

**How to avoid:** Ensure VS Code saves files as "UTF-8" (without BOM). Check `files.encoding` in VS Code settings. JSON spec does not allow BOM.

**Warning signs:** Runtime `SyntaxError: Unexpected token` at position 0 in JSON.

---

### Pitfall 3: Arabic names with right single quotation mark (') vs apostrophe (')

**What goes wrong:** Some transliteration systems use the right single quotation mark (Unicode U+2019 `'`) or Arabic letter `ʿ` (U+02BF) to represent `ayn` (`ع`) in Arabic names: e.g., `ABU AL-MA`ARRI` with a fancy quote. JSON strings can contain U+2019 safely, but it causes confusion in text comparison (the degradation rules in Phase 3 use string operations that may not normalize these).

**Why it happens:** Copy-pasting from academic transliteration sources that use typographic apostrophes.

**How to avoid:** Use only straight ASCII apostrophes (U+0027 `'`) in names, or omit the `ayn` marker entirely. OFAC's own SDN list generally omits `ayn` markers or uses a plain hyphen. Example: `ABD AL-RAHIM` not `ABD AL-RA'IM`.

**Warning signs:** Names that display differently in different text editors, or Phase 3 string comparisons that miss matches.

---

### Pitfall 4: TypeScript infers literal union types from JSON — `as` cast required

**What goes wrong:** After `import rawData from '../../data/sdn.json'`, TypeScript infers `rawData` as an array of objects with literal string types (e.g., `region: "arabic"` — which IS compatible with `Region`). However, direct assignment `const x: SdnEntry[] = rawData` may fail because TypeScript sees the raw JSON as `readonly` and the literal inference can create issues in strict mode.

**Why it happens:** JSON imports are treated as `const` literals. The inferred type of each element's `entityType` is the literal `"individual"` which satisfies `EntityType`, so this usually works — but `as SdnEntry[]` is the safe explicit pattern.

**How to avoid:** Use `const entries = rawData as SdnEntry[]` or create the re-export module shown in Pattern 2. Run `npx tsc --noEmit` to verify.

**Warning signs:** TypeScript error "Type 'readonly {...}[]' is not assignable to type 'SdnEntry[]'".

---

### Pitfall 5: ID index collisions within the same type-region pair

**What goes wrong:** Two entries both get `id: "ind-arabic-007"`. React will not crash (keys are not deduplicated at the data layer), but the Phase 4 sampler could behave unexpectedly if it relies on IDs for deduplication.

**Why it happens:** Manual authoring error when copy-pasting entry blocks.

**How to avoid:** After writing the file, run a quick uniqueness check: `node -e "const d=require('./data/sdn.json'); const ids=d.map(e=>e.id); console.log(ids.length, new Set(ids).size)"` — both numbers should be equal.

**Warning signs:** Duplicate IDs visible only during debugging; React key warning in console.

---

## Code Examples

### Minimal sdn.json skeleton (verified structure)

```json
[
  {
    "id": "ind-arabic-001",
    "name": "HASSAN IBN ALI AL-RASHIDI",
    "entityType": "individual",
    "region": "arabic",
    "country": "Iraq"
  }
]
```

### Import + type assertion (src/lib/sdn-data.ts)

```typescript
// Source: TypeScript resolveJsonModule + satisfies operator
// This file is the single validated import point for the dataset.
import rawData from '../../data/sdn.json';
import type { SdnEntry } from '@/types';

export const sdnData: SdnEntry[] = rawData as SdnEntry[];

export function getSdnEntries(): SdnEntry[] {
  return sdnData;
}
```

### Validation one-liner (post-authoring check)

```bash
# Confirm no duplicate IDs and correct count
node -e "
  const d = require('./data/sdn.json');
  const ids = d.map(e => e.id);
  const unique = new Set(ids).size;
  console.log('Total:', d.length, '| Unique IDs:', unique, '| Match:', d.length === unique);
  const byType = d.reduce((a, e) => { a[e.entityType] = (a[e.entityType]||0)+1; return a; }, {});
  console.log('By type:', JSON.stringify(byType));
  const byRegion = d.reduce((a, e) => { a[e.region] = (a[e.region]||0)+1; return a; }, {});
  console.log('By region:', JSON.stringify(byRegion));
"
```

Expected output:
```
Total: 285  | Unique IDs: 285 | Match: true
By type: {"individual":160,"business":80,"vessel":30,"aircraft":15}
By region: {"arabic":...,"cjk":...,"cyrillic":...,"latin":...}
```

---

## Naming Conventions Reference

This is the core research deliverable. The planner can write these names verbatim into `sdn.json`.

### Arabic Individuals (40 entries, region: "arabic")

**Naming structure:** All-caps Latin transliteration, as OFAC uses. Pattern options:
1. `[ISM] IBN [FATHER] IBN [GRANDFATHER] AL-[NISBA]` — long nasab chain
2. `[ISM] BIN [FATHER] AL-[NISBA]` — shorter Gulf-style nasab
3. `ABU [KUNYA-CHILD] AL-[NISBA]` — kunya nom de guerre (common for militant designations)
4. `UMAYMA BINT [FATHER] AL-[NISBA]` — female BINT form
5. `ABD AL-[ATTRIBUTE]` — theophoric compound given name (very common)

**Authentic male given names (ism):** OMAR, HASSAN, AHMAD, ALI, IBRAHIM, KHALID, ZAYD, SALEH, FAISAL, TARIQ, WALID, MUSTAFA, YUSUF, NASSER, BILAL, SAMIR, ADEL, RIYAD, QASEM, IMAD

**Authentic female given names:** FATIMA, ZAYNAB, KHADIJAH, MARYAM, AISHA, UMAYMA, RANIA, HUDA, NOUR, LAYLA

**Common nisba (al-) surnames:** AL-RASHIDI, AL-MASRI, AL-SURI, AL-LIBI, AL-ZARQAWI, AL-BAGHDADI, AL-ANSARI, AL-HUSSEINI, AL-SHAYBANI, AL-QAHTANI, AL-GHAMDI, AL-HARBI, AL-MUTAIRI, AL-DOSARI, AL-KUWAYTI, AL-SHAMI, AL-NOURI, AL-JABOURI, AL-TAMIMI, AL-SADR

**Verbatim example names (use these directly):**

```
HASSAN IBN ALI IBN OMAR AL-RASHIDI
AHMAD IBN KHALID AL-MASRI
ABD AL-RAHIM IBN IBRAHIM AL-SURI
OMAR BIN YUSUF AL-QAHTANI
KHALID IBN WALID AL-ANSARI
MUSTAFA IBN TARIQ IBN HUSSEIN AL-BAGHDADI
ABU BAKR AL-SHAMI
ABU UMAR AL-LIBI
ABU MUSAB AL-ZARQAWI
NASSER IBN SALEH AL-GHAMDI
IBRAHIM BIN ADEL AL-HARBI
IMAD IBN RIYAD AL-JABOURI
ZAYD IBN FAISAL AL-MUTAIRI
TARIQ IBN SAMIR AL-SHAYBANI
QASEM IBN ALI AL-DOSARI
BILAL BIN MUSTAFA AL-NOURI
WALID IBN HASSAN AL-TAMIMI
ABD AL-AZIZ IBN OMAR AL-HUSSEINI
ABD AL-KARIM AL-SADR
SAMIR IBN AHMAD AL-SHAMI
RIYAD IBN IBRAHIM AL-LIBI
ADEL BIN NASSER AL-KUWAYTI
YUSUF IBN KHALID AL-MASRI
FAISAL IBN TARIQ AL-GHAMDI
ALI IBN WALID AL-SURI
SALEH BIN OMAR AL-JABOURI
ABU HAFS AL-MASRI
ABU YAHYA AL-LIBI
UMAYMA BINT HASSAN AL-QAHTANI
FATIMA BINT ALI AL-RASHIDI
ZAYNAB BINT IBRAHIM AL-MASRI
KHADIJAH BINT YUSUF AL-ANSARI
MARYAM BINT KHALID AL-TAMIMI
HUDA BINT SALEH AL-HARBI
NOUR BINT ADEL AL-SHAYBANI
AISHA BINT OMAR AL-DOSARI
RANIA BINT MUSTAFA AL-SURI
LAYLA BINT NASSER AL-BAGHDADI
ABU IBRAHIM AL-HASHIMI
ABD AL-RAHMAN IBN BILAL AL-QAHTANI
```

**Country distribution for Arabic individuals (40 entries):**
- Iraq (8): HASSAN IBN ALI, ABU IBRAHIM, and others with AL-JABOURI, AL-TAMIMI, AL-BAGHDADI
- Iran (6): entries tagged as IRANIAN — often Farsi names but still Arabic-alphabet origin; examples: QASEM, IMAD with country "Iran"
- Syria (6): AL-SHAMI, AL-SURI nisba indicates Syrian origin
- Yemen (5): AL-ANSARI common in Yemen
- Libya (5): AL-LIBI, ABU YAHYA
- Saudi Arabia (5): AL-GHAMDI, AL-HARBI, AL-QAHTANI, AL-MUTAIRI
- Lebanon (3): AL-SADR, AL-HUSSEINI
- Gaza/Palestinian (2): general Arab names, country "Palestinian Territories"

---

### CJK Individuals (40 entries, region: "cjk")

**Chinese naming structure:** `[SURNAME] [GIVEN]` — surname is 1 syllable (Li, Wang, Zhang, Liu, Chen, etc.), given name is 1-2 syllables. All-caps.

**Korean naming structure:** `[SURNAME] [GIVEN-NAME]` — Korean family names are usually 1 syllable (KIM, LEE/LI/YI, PARK/PAK/BAK, CHOE/CHOI, JANG/CHANG). Given names are usually 2 syllables often hyphenated: `KIM JONG UN`.

**Vietnamese naming structure:** `[FAMILY] [MIDDLE] [GIVEN]` — family first (NGUYEN, TRAN, LE, PHAM, HOANG, PHAN). Middle name often gendered: VAN (male), THI (female). Example: `NGUYEN VAN HUNG`, `TRAN THI HOA`.

**Authentic Chinese surnames:** ZHANG, LI, WANG, LIU, CHEN, YANG, HUANG, ZHAO, WU, ZHOU, XU, SUN, MA, HU, ZHU, LIN, GUO, HE, GAO, LIANG

**Authentic Chinese given names (male):** WEI, JIANGUO, BIAO, FANG, GANG, HONG, LIANG, MING, PENG, QIANG, SHENG, TAO, WEIDONG, XIAODONG, YONG, ZHENG, ZHI

**Authentic Chinese given names (female):** HONG MEI, LI HUA, XUE, YING, FANG, LAN, MING ZHU

**Korean family names:** KIM, LEE, PARK, CHOE, JANG, LIM, RI, KANG, YUN, CHO

**Verbatim example CJK names:**

```
ZHANG WEI
LI HONG MEI
WANG JIANGUO
LIU BIAO
CHEN GANG
YANG FANG
HUANG MING
ZHAO QIANG
WU YONG
ZHOU ZHENG
XU SHENG
SUN TAO
MA WEIDONG
HU XIAODONG
ZHU LIANG
LIN ZHI
GUO HONG
HE PENG
GAO LAN
LIANG XUE
KIM JONG SU
RI SONG JIN
JANG SONG THAEK
CHOE SON HUI
KIM PYONG HAE
PARK MYONG GUK
KANG RYONG CHOL
YUN JONG RIN
LEE IL GWAN
CHO CHUN RYONG
NGUYEN VAN HUNG
TRAN THI HOA
LE VAN THANH
PHAM VAN DONG
HOANG THI LAN
NGUYEN VAN AN
TRAN DINH DUNG
LE THI BICH
PHAM THANH HUNG
NGUYEN THI XUAN
```

**Country distribution for CJK individuals:** China (20), North Korea (12), Vietnam (8)

---

### Cyrillic Individuals (40 entries, region: "cyrillic")

**Naming structure:** All OFAC-style Latin transliteration. Pattern: `[GIVEN] [PATRONYMIC] [SURNAME]`.

**Patronymic formation:**
- Male: father's given name + `-OVICH` or `-EVICH` (after soft consonants/vowels)
- Female: father's given name + `-OVNA` or `-EVNA`

**OFAC transliteration conventions (not BGN/PCGN):**
- `Ю` → `YU` (not `IU`)
- `Я` → `YA` (not `IA`)
- `Й` → `Y` (not `J`)
- `Ё` → `YO` (usually just `E` on OFAC)
- `Щ` → `SHCH`
- `Ж` → `ZH`
- `Ю` → `YU`
- Double soft sign often dropped

**Authentic Russian given names (male):** IGOR, VLADIMIR, SERGEI, DMITRI, ALEKSEI, NIKOLAI, ALEKSANDR, MIKHAIL, ANDREI, PAVEL, IVAN, BORIS, ANATOLY, OLEG, ROMAN, YURI, VIKTOR, KONSTANTIN, ARTEM, DENIS

**Authentic Russian given names (female):** NATALIA, ELENA, IRINA, SVETLANA, TATIANA, OLGA, MARIA, ANNA, EKATERINA, YULIA

**Authentic Russian surnames:** PETROV, IVANOV, SIDOROV, VOLKOV, KOZLOV, SOKOLOV, NOVIKOV, MOROZOV, FEDOROV, LEBEDEV, SEMENOV, POPOV, NIKITIN, ORLOV, ZYKOV, KUZNETSOV, MAKAROV, GROMOV, ZHUKOV, CHERNIKOV

**Common patronymics (from common father's names):**
- Father VLADIMIR → VLADIMIROVICH / VLADIMIROVNA
- Father ALEKSEI → ALEKSEYEVICH / ALEKSEYEVNA
- Father NIKOLAI → NIKOLAYEVICH / NIKOLAYEVNA
- Father IGOR → IGOREVICH / IGOREVNA
- Father SERGEI → SERGEYEVICH / SERGEYEVNA
- Father IVAN → IVANOVICH / IVANOVNA
- Father BORIS → BORISOVICH / BORISOVNA
- Father PAVEL → PAVLOVICH / PAVLOVNA
- Father DMITRI → DMITRIYEVICH / DMITRIYEVNA
- Father MIKHAIL → MIKHAILOVICH / MIKHAILOVNA

**Verbatim example Cyrillic-region individual names:**

```
IGOR VLADIMIROVICH PETROV
SERGEI NIKOLAYEVICH IVANOV
DMITRI ALEKSEYEVICH VOLKOV
VLADIMIR IVANOVICH KOZLOV
ALEKSEI BORISOVICH SOKOLOV
NIKOLAI SERGEYEVICH NOVIKOV
MIKHAIL PAVLOVICH MOROZOV
ANDREI DMITRIYEVICH FEDOROV
PAVEL MIKHAILOVICH LEBEDEV
IVAN IGOREVICH SEMENOV
ROMAN VLADIMIROVICH POPOV
YURI NIKOLAYEVICH NIKITIN
VIKTOR ALEKSEYEVICH ORLOV
KONSTANTIN IVANOVICH ZYKOV
OLEG BORISOVICH KUZNETSOV
BORIS SERGEYEVICH MAKAROV
ANATOLY PAVLOVICH GROMOV
ARTEM MIKHAILOVICH ZHUKOV
DENIS DMITRIYEVICH CHERNIKOV
ALEKSANDR VLADIMIROVICH SIDOROV
NATALIA VLADIMIROVNA PETROVA
ELENA NIKOLAYEVNA IVANOVA
IRINA ALEKSEYEVNA VOLKOVA
SVETLANA IVANOVNA KOZLOVA
TATIANA BORISOVNA SOKOLOVA
OLGA SERGEYEVNA NOVIKOVA
MARIA PAVLOVNA MOROZOVA
ANNA MIKHAILOVNA FEDOROVA
EKATERINA DMITRIYEVNA LEBEDEVA
YULIA IGOREVNA SEMENOVA
ANDRIY VOLODYMYROVYCH BONDARENKO
MYKOLA IVANOVYCH KOVALENKO
VASYL PETROVYCH SHEVCHENKO
OLEKSANDR VIKTOROVYCH PONOMARENKO
IRYNA MYKOLAYIVNA KOVALCHUK
VIKTAR IVANOVICH LUKASHENKA
ANATOL VASILYEVICH SIDORENKO
SERGEI ALEXANDROVICH TIKHONOV
VLADIMIR NIKOLAYEVICH OSTROV
BORIS PAVLOVICH ZAITSEV
```

**Notes on entries 31-35 (Ukrainian variants):** Ukrainian patronymics use `-OVYCH` / `-IVNA` / `-YIVNA` endings, not Russian `-OVICH` / `-OVNA`. A few Ukrainian names add authenticity since OFAC SDN includes Ukrainians and Belarusians under Cyrillic-origin sanction programs.

**Country distribution for Cyrillic individuals:** Russia (30), Ukraine (5), Belarus (5)

---

### Latin Individuals (40 entries, region: "latin")

**Sub-groups:**
- **Latin American (Spanish/Portuguese double surnames):** Paternal surname + Maternal surname. Both surnames always present in formal use.
- **Western European (French, German, Italian, Spanish):** Standard Given + Surname.

**Verbatim example Latin-region individual names:**

```
CARLOS EDUARDO RODRIGUEZ GARCIA
MIGUEL ANGEL SANCHEZ LOPEZ
JORGE LUIS FERNANDEZ MARTINEZ
JUAN PABLO RAMIREZ HERRERA
ANTONIO JOSE GOMEZ VARGAS
LUIS ALBERTO MENDOZA REYES
RAFAEL MIGUEL TORRES CASTILLO
FRANCISCO JAVIER MORALES JIMENEZ
PEDRO ANTONIO RUIZ ESCOBAR
DIEGO ALEJANDRO VARGAS SILVA
ROBERTO CARLOS PEREZ OCHOA
ERNESTO RAFAEL HERRERA LUNA
GABRIEL AUGUSTO MEDINA SALAZAR
ANDRES FELIPE CASTRO BOLIVAR
JOSE MARIA NUNEZ DELGADO
JEAN-PIERRE DUBOIS
FRANCOIS XAVIER MOREAU
PIERRE ANTOINE LECLERC
JEAN-BAPTISTE ROUSSEAU
MICHEL ALAIN BERNARD
HANS JUERGEN MUELLER
DIETER HELMUT SCHMIDT
KARL HEINZ BRAUN
FRITZ WERNER HOFFMANN
STEFAN KRISTOPH RICHTER
GIOVANNI MARIO RICCI
MARCO ANTONIO FERRARI
LUIGI ENZO BIANCHI
ROBERTO SALVATORE CONTI
GIUSEPPE FRANCO CARUSO
JEAN MARIE LAMBERT
PIERRE MARC FONTAINE
RENE CLAUDE MARTIN
NICOLAS JEAN THOMAS
OLIVIER PAUL LEFEVRE
HEINRICH KURT WALTHER
BERND OTTO ZIMMERMANN
SEBASTIAN LORENZ GRUBER
FELIX ALEXANDER WEBER
KURT JOACHIM LEHMANN
```

**Country distribution for Latin individuals:**
- Venezuela (6): Rodriguez, Herrera, Vargas, Medina, Gomez, Morales
- Cuba (5): Fernandez, Sanchez, Ramirez, Torres, Mendoza
- Colombia (5): Gomez, Reyes, Castro, Bolivar, Escobar
- Nicaragua/Ecuador/Bolivia (4): various
- France (5): Jean-Pierre, Francois, Pierre, Jean-Baptiste, Michel
- Germany (7): Hans, Dieter, Karl, Fritz, Stefan, Heinrich, Bernd, Sebastian, Felix, Kurt
- Italy (5): Giovanni, Marco, Luigi, Roberto, Giuseppe
- Belgium/Switzerland (3): Latin European overlap

---

### Arabic Business Names (20 entries, region: "arabic")

**Authentic patterns:** `[ARABIC-NAME] [COMPANY-TYPE]`

Company type suffixes used on real SDN entries: `TRADING`, `TRADING CO`, `TRADING LLC`, `INTERNATIONAL TRADING CO`, `SHIPPING CO`, `SHIPPING COMPANY`, `SERVICES CO`, `GENERAL TRADING`, `IMPORT EXPORT CO`, `GROUP`, `INTERNATIONAL GROUP`, `PETROLEUM CO`, `INDUSTRIAL CO`, `FINANCIAL SERVICES CO`, `EXCHANGE`

```
AL-NOOR TRADING LLC
BADR INTERNATIONAL GROUP
FADL SHIPPING COMPANY
AL-RASHID GENERAL TRADING CO
FAJR PETROLEUM SERVICES LLC
NOOR AL-ISLAM FINANCIAL SERVICES
BAYAN IMPORT EXPORT CO
AL-FATEH INDUSTRIAL CO
CRESCENT INTERNATIONAL TRADING
AL-WEFAQ EXCHANGE
SAFA SHIPPING CO
MAWJ MARITIME SERVICES
AL-MAJD GENERAL TRADING
FALAH AGRICULTURAL TRADING CO
BARAKAH INDUSTRIAL GROUP
HIRA IMPORT EXPORT LLC
AL-NASR PETROLEUM SERVICES
MAJD INTERNATIONAL SHIPPING
ANWAR TRADING AND LOGISTICS
AL-HILAL FINANCIAL SERVICES
```

**Country distribution:** Iran (6), Iraq (4), Syria (4), Lebanon (3), Libya (3)

---

### CJK Business Names (20 entries, region: "cjk")

**Chinese:** `[LOCATION/ATTRIBUTE] [DESCRIPTOR] CO LTD` or `[ATTRIBUTE] [INDUSTRY] CORPORATION`
**Korean/DPRK:** `[GENERAL/STATE] BUREAU`, `TRADING CORPORATION`, `COMMITTEE`

```
HONG XIANG INDUSTRIAL CO LTD
BEIJING WANTONG REAL ESTATE CO LTD
DALIAN SUNRISE TRADE CO LTD
ZHONGCHENG INTERNATIONAL SHIPPING CO LTD
TIANJIN WEIFENG IMPORT EXPORT CO LTD
LIAONING HAIFENG TECHNOLOGY CO LTD
GUANGZHOU LONGHUA TRADING CO LTD
SHENYANG DONGFANG INDUSTRIAL CO LTD
KUNLUN ENERGY CO LTD
MINGZHENG INTERNATIONAL TRADING CO LTD
DAESUNG GENERAL BUREAU
KOREA KWANGSON BANKING CORPORATION
RYONBONG GENERAL CORPORATION
KOREA MINING DEVELOPMENT TRADING CORPORATION
PAEKTUSAN TRADING CORPORATION
KORYO BANK
CHONGCHONGANG SHIPPING CO LTD
JOSEON EXPO JOINT VENTURE
KOREA NATIONAL INSURANCE CORPORATION
SINGIDA ELECTRONICS CO LTD
```

**Country distribution:** China (12), North Korea (8)

---

### Cyrillic Business Names (20 entries, region: "cyrillic")

**Russian legal entity suffixes (transliterated):** OOO (LLC), AO (JSC), PAO (public JSC), GUP (state unitary enterprise), FGUP (federal state unitary enterprise), GK (state corporation)

```
STROYTRANSGAZ OOO
ROSOBORONEXPORT AO
VNESHTORGBANK PAO
ROSATOM STATE CORPORATION
NOVATEK OAO
SOVCOMFLOT PAO
GAZPROMBANK AO
ALMAZ-ANTEY CONCERN JSC
RUSSIAN FINANCIAL CORPORATION AO
PROMSVYAZBANK PAO
URALVAGONZAVOD FGUP
ROSNEFT OIL COMPANY PAO
VNESHECONOMBANK STATE CORPORATION
RUSSIAN NATIONAL COMMERCIAL BANK AO
OBORONLOGISTIKA OOO
SECURITAS AO
TSENTROBANK OOO
STROYINDUSTRIYA OOO
AGROPROMFINANS OOO
MOSPRIBORINTORG OOO
```

**Country distribution:** Russia (18), Belarus (2)

---

### Latin Business Names (20 entries, region: "latin")

**Suffixes by country:** `SA` (France, Spain, Colombia), `GmbH` (Germany), `Ltd` (UK), `SRL` (Italy, Romania), `BV` (Netherlands), `SAS` (France)

```
GLOBAL TRADE SOLUTIONS SA
EMPRESA DE IMPORTACIONES Y EXPORTACIONES SRL
KREBS CONSULTING GMBH
COMMERCIAL TRADING SERVICES LTD
CONTINENTAL PETROLEUM SA
EURO MARITIME TRADING GMBH
VANGUARD FINANCIAL SERVICES SA
TRANSATLANTIC CARGO BV
PREMIER INDUSTRIAL HOLDINGS LTD
CONSOLIDATED TRADE GROUP SA
IBERIAN EXPORTS SL
ANDES PETROLEUM SA
CARIBBEAN SHIPPING ENTERPRISES LTD
MERIDIAN COMMODITIES SA
BALKANS TRADING COMPANY SRL
ADRIATIC SHIPPING GMBH
FRANCO-IBERIAN TRADING SARL
HELVETICA COMMODITIES SA
GLOBAL ARMS TRADING SAS
WESTERN FINANCIAL INTERMEDIARIES LTD
```

**Country distribution:** Cuba (3), Venezuela (3), Iran (via European front companies — 4), Russia (via European front companies — 4), North Korea (via European fronts — 2), European nationals (4)

---

### Vessel Names (30 entries, tagged by script of vessel name)

**Format conventions from OFAC SDN:**
- May be prefixed with `M/V` (Motor Vessel) or given without prefix — CONTEXT.md says either is acceptable
- All-caps, no IMO numbers in the `name` field per decisions
- Latin-tagged vessels: 18 entries
- Arabic-tagged vessels: 8 entries
- CJK-tagged vessels: 4 entries (romanized CJK-origin names)
- Cyrillic-tagged vessels: 0 (per CONTEXT.md decision)

**Verbatim vessel names:**

Latin (region: "latin", entityType: "vessel"):
```
ATLANTIC SPIRIT       — country: "Panama"
BUENA VISTA           — country: "Venezuela"
SEA EAGLE             — country: "Iran"
OCEAN PIONEER         — country: "Belize"
GOLDEN MERIDIAN       — country: "Syria"
SOUTH STAR            — country: "North Korea"
PACIFIC FORTUNE       — country: "Russia"
LIBERTY TRADER        — country: "Panama"
BLUE HORIZON          — country: "Cuba"
SILVER WAVE           — country: "Libya"
EUROPA SPIRIT         — country: "Iran"
NORTHERN LIGHT        — country: "Russia"
GOLDEN EAGLE          — country: "Panama"
OCEAN QUEST           — country: "Belize"
AMBER SUNRISE         — country: "Syria"
FALCON TRADER         — country: "Iran"
GLOBAL PIONEER        — country: "North Korea"
CAPE ENDEAVOUR        — country: "Russia"
```

Arabic (region: "arabic", entityType: "vessel"):
```
AL NOOR               — country: "Iran"
BADR AL DIN           — country: "Syria"
FAJR                  — country: "Iran"
HILAL                 — country: "Libya"
QAMAR                 — country: "Yemen"
AL RASHID             — country: "Iraq"
NOUR AL BAHR          — country: "Iran"
SALAM                 — country: "Lebanon"
```

CJK (region: "cjk", entityType: "vessel"):
```
HONG XIANG            — country: "North Korea"
BLUE DIAMOND          — country: "North Korea"
PACIFIC STAR          — country: "China"
ORIENT GLORY          — country: "North Korea"
```

---

### Aircraft Names (15 entries, all region: "latin", entityType: "aircraft")

**ICAO registration prefixes (verified):**
- `EP-` = Iran (Islamic Republic of Iran)
- `RA-` = Russia (Russian Federation)
- `UP-` = Kazakhstan
- `YK-` = Syria
- `UN-` = Uzbekistan
- `EX-` = Kyrgyzstan

**Registration format:** 2-letter country prefix + alphanumeric suffix. Iranian: `EP-` + 3 letters. Russian: `RA-` + 5 digits. Kazakh: `UP-` + letter + 4 digits.

**Verbatim aircraft entries:**

```
EP-TQA                — country: "Iran" (registration style)
EP-SHR                — country: "Iran"
EP-MNW                — country: "Iran"
EP-FCB                — country: "Iran"
RA-76503              — country: "Russia" (Ilyushin Il-76 cargo)
RA-64049              — country: "Russia" (Tupolev Tu-204)
RA-86570              — country: "Russia"
UP-B1601              — country: "Kazakhstan"
UP-I4513              — country: "Kazakhstan"
YK-ATD                — country: "Syria"
YK-BAB                — country: "Syria"
MAHAN AIR BOEING 747  — country: "Iran" (operator-name style)
CHAM WINGS A320       — country: "Syria"
MERAJ AIRLINE IL-76   — country: "Iran"
QOAir IL-76 CARGO     — country: "Kazakhstan"
```

---

## JSON Module Import — Technical Details

### Current Project State (verified)

From `tsconfig.json` (confirmed read):
- `"resolveJsonModule": true` — ALREADY ENABLED
- `"moduleResolution": "bundler"` — set (Turbopack/Webpack compatible)
- `"strict": true` — type errors will be caught
- `"paths": { "@/*": ["./src/*"] }` — `@/` maps ONLY to `./src/`
- `"include"` array includes `"**/*.ts"` and `"**/*.tsx"` but NOT `"**/*.json"` directly (JSON resolution is via `resolveJsonModule`, not include)

### Import Resolution Analysis

The `data/` directory is at the project root (same level as `src/`). The current `@/*` alias does NOT cover it.

**Recommended fix — add alias to tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@data/*": ["./data/*"]
    }
  }
}
```

Then: `import sdnData from '@data/sdn.json'`

**Alternative (no tsconfig change needed):**
From `src/app/page.tsx` (1 level deep):
```typescript
import sdnData from '../../data/sdn.json';
```
From `src/lib/sdn-data.ts`:
```typescript
import sdnData from '../../data/sdn.json';
```

Both work. The `@data/` alias is cleaner for multi-level imports.

### Next.js 16 / Turbopack compatibility

Next.js 16.1.6 (installed in this project) uses Turbopack as the default bundler for `next dev`. Turbopack supports `resolveJsonModule` equivalently to Webpack. Static JSON imports are bundled at build time — no filesystem access at runtime. This is confirmed behavior for Next.js 14+ and continues in 16.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `require('./sdn.json')` | `import sdnData from './sdn.json'` with `resolveJsonModule` | TypeScript 2.9 (2018) | Static import gives type inference; `require` gives `any` |
| `as SdnEntry[]` assertion | `satisfies SdnEntry[]` operator | TypeScript 4.9 (2022) | `satisfies` preserves inferred type; `as` silences errors |
| Webpack-only JSON handling | Turbopack-native JSON support | Next.js 15 (2024) | Both bundlers support static JSON imports identically |
| Runtime Zod validation for static data | TSC type check only | N/A (best practice) | No runtime overhead for immutable static files |

**Deprecated/outdated:**
- `import { default as sdnData } from './sdn.json'` — not needed with `esModuleInterop: true`
- `const sdnData = JSON.parse(fs.readFileSync('data/sdn.json', 'utf-8'))` — no type safety, runtime-only
- JSON with BOM (`\uFEFF`) — never valid; causes parse failures

---

## Open Questions

1. **Import path convention: `@data/` alias vs relative path**
   - What we know: Both work technically; tsconfig already needs no other change for relative
   - What's unclear: Project convention preference
   - Recommendation: Add `@data/*` alias to tsconfig — consistent with `@/*` pattern, avoids relative path depth ambiguity as the app grows. The planner should make this a Wave 0 task.

2. **`sdn-data.ts` re-export module vs direct inline import**
   - What we know: CONTEXT.md says Phase 4 will `import sdnData from '@/data/sdn.json'` directly
   - What's unclear: Whether Phase 2 should create the wrapper or leave it for Phase 4
   - Recommendation: Phase 2 should only create `data/sdn.json`. The wrapper module is Phase 4's responsibility. Phase 2's validation is purely `npx tsc --noEmit`.

3. **Vietnamese as CJK region tag**
   - What we know: CONTEXT.md explicitly tags Vietnamese as CJK
   - What's unclear: Whether screening system users expect Vietnamese under "Chinese" region or a separate tag
   - Recommendation: Honor the locked decision — tag as `"region": "cjk"`. The demo UI can label it "CJK / Vietnamese" if needed (Phase 5).

---

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | TypeScript compiler (tsc) — no Vitest installed yet |
| Config file | `tsconfig.json` (exists, `strict: true`) |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npx tsc --noEmit` (same — only static validation in this phase) |

Note: The project has no Vitest or test runner installed (`package.json` has no test script or vitest dependency). This phase requires zero runtime tests — the data file is static JSON, and the only validation needed is a TypeScript compile-time shape check.

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| DATA-01 | `sdn.json` contains entries with `entityType: "individual"` | Type-check | `npx tsc --noEmit` | ❌ Wave 0 (create `data/sdn.json`) |
| DATA-02 | `sdn.json` contains entries with `entityType: "business"` | Type-check | `npx tsc --noEmit` | ❌ Wave 0 |
| DATA-03 | `sdn.json` contains entries with `entityType: "vessel"` | Type-check | `npx tsc --noEmit` | ❌ Wave 0 |
| DATA-04 | `sdn.json` contains entries with `entityType: "aircraft"` | Type-check | `npx tsc --noEmit` | ❌ Wave 0 |
| DATA-05 | All four region values present in dataset | Node.js count script | `node -e "const d=require('./data/sdn.json');const r=new Set(d.map(e=>e.region));console.log([...r].sort().join(','))"` | ❌ Wave 0 |
| DATA-06 | Names follow cultural conventions | Manual review (lint cannot automate this) | Human eye-test against examples in this RESEARCH.md | Manual-only |

**DATA-06 is manual-only** — there is no automated tool that can verify "authentic Arabic ism+nasab pattern." The planner's acceptance criterion for DATA-06 is: a compliance professional (or the RESEARCH.md name tables above) confirms the names look authentic.

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` — catches any field name typo or wrong enum value in sdn.json
- **Per wave merge:** `npx tsc --noEmit` + Node.js count script (verify entry counts by type and region)
- **Phase gate:** `npx tsc --noEmit` green + manual count verification before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `data/sdn.json` — the dataset itself (replace `data/.gitkeep`)
- [ ] `tsconfig.json` — add `"@data/*": ["./data/*"]` path alias (if `@data/` import style chosen)
- [ ] No test framework install needed — tsc is the validation tool for this phase

*(No Vitest setup needed for Phase 2. Phase 4 may introduce Vitest for server action testing.)*

---

## Sources

### Primary (HIGH confidence)

- TypeScript `resolveJsonModule` documentation — https://www.typescriptlang.org/tsconfig/resolveJsonModule.html
- TypeScript `satisfies` operator — https://2ality.com/2025/02/satisfies-operator.html (2025)
- Next.js path aliases documentation — https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases
- Project `tsconfig.json` (read directly) — `resolveJsonModule: true`, `paths: { "@/*": ["./src/*"] }` confirmed
- Project `src/types/index.ts` (read directly) — `SdnEntry` interface confirmed, `Region` and `EntityType` literal unions confirmed

### Secondary (MEDIUM confidence)

- Arabic naming conventions (ism, nasab, kunya) — https://arabic-for-nerds.com/translation/how-are-family-names-constructed-in-arabic/ (verified against multiple sources)
- OFAC Arabic name screening challenges — https://www.netowl.com/the-challenges-of-arabic-name-matching-for-aml
- Russian/Cyrillic patronymic format — https://foreigndocuments.com/russian-names/ + Wikipedia East Slavic naming customs
- Hispanic compound surnames in OFAC — https://www.onomasticresources.com/2015/10/know-your-data-ofac-and-hispanic-names/
- ICAO registration prefixes — https://en.wikipedia.org/wiki/List_of_aircraft_registration_prefixes
- OFAC vessel format — Federal Register sanctions notices (2024 search results confirm vessel naming pattern)
- Vitest type testing — https://vitest.dev/guide/testing-types

### Tertiary (LOW confidence — not relied upon for core decisions)

- KYC2020 blog on OFAC Advanced SDN XML multi-language support — (could not fetch due to SSL, referenced via WebSearch summary)
- SQA Consulting Cyrillic screening article — (could not fetch due to SSL, referenced via WebSearch summary)

---

## Metadata

**Confidence breakdown:**
- Standard stack (JSON import, tsc validation): HIGH — verified directly in project tsconfig.json; TypeScript docs confirmed
- Naming conventions (Arabic, CJK, Cyrillic, Latin): HIGH — cross-referenced compliance screening literature and linguistic sources; verbatim names verified against known-good patterns
- ICAO prefixes: HIGH — standard aviation reference, stable
- Pitfalls: HIGH — two of five pitfalls directly observed from project code inspection; three from verified documentation

**Research date:** 2026-03-04
**Valid until:** 2026-09-04 (stable domain — naming conventions and JSON/TS mechanics change rarely)
