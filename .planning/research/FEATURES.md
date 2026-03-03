# Feature Landscape

**Domain:** OFAC Sensitivity Testing / Watchlist Screening Quality Demo Tool
**Researched:** 2026-03-03
**Confidence:** HIGH on core domain knowledge (OFAC/sanctions compliance is well-established); MEDIUM on competitor feature sets.

---

## Table Stakes

Features that MUST be present or the demo fails / looks unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Name input (synthetic SDN library) | Clients need a starting name set; pre-loaded synthetic names remove setup friction | Medium | Built-in JSON dataset spanning entity types and linguistic regions |
| Entity type + count selection | The RPA workflow supports Individual/Business/Vessel/Aircraft 0–500; clients expect this control | Low | Number inputs per entity type |
| Linguistic region selection | Different regions require different degradation rules; clients want to scope by region | Low | Checkboxes for Arabic, Chinese, Russian/Cyrillic, Latin, etc. |
| Degradation rule selection UI | The whole point is choosing WHICH obfuscation techniques to test | Medium | Checkbox list with plain-English descriptions + "Select All" |
| Side-by-side results table | Original vs. degraded name is the core visual deliverable | Low | Columns: Original Name, Entity Type, Region, Degraded Variant, Rule Applied |
| CSV download | Clients take this away from the session; compliance analysts live in spreadsheets | Low | UTF-8 with BOM for Excel compatibility |
| Coverage of all core degradation rule categories | Missing major categories makes the tool look incomplete | High | See degradation categories below |
| Plain-English rule labels | Compliance officers are not technologists; each rule needs a description | Low | Tooltips or inline descriptions |
| Professional, clean UI | Client-facing demo reflects on Crowe's brand | Medium | Crowe branding (design phase deferred) |
| UTF-8 / non-Latin script support | SDN list contains Arabic, Cyrillic, Chinese names; must not crash | Medium | UTF-8 throughout; rules are no-ops when not applicable to a script |
| Deterministic output | Same inputs → same outputs; non-deterministic demos erode trust | Low | Seeded RNG or stable sort |

---

## Degradation Rule Categories (Table Stakes)

| Rule Category | Example | Complexity | Notes |
|---------------|---------|------------|-------|
| Space removal / insertion | "AL QAEDA" → "ALQAEDA" / "A L Q A E D A" | Low | Most common evasion technique |
| Character substitution (visual/OCR) | "O" → "0", "I" → "1", "S" → "5", "A" → "@" | Low | Leet-speak variants; documented in sanctions evasion |
| Diacritic removal / addition | "Müller" → "Muller", "Jose" → "José" | Medium | Requires Unicode normalization (NFC/NFD) |
| Abbreviation | "Mohammed" → "Mhd", "Abdul" → "Abd" | Medium | Common in Arabic name transliteration |
| Truncation | "Abdulrahman" → "Abdul" | Low | Prefix/suffix truncation |
| Word reordering | "Kim Jong Un" → "Jong Un Kim" | Low | East Asian and Arabic naming conventions |
| Phonetic / transliteration variant | "Osama" → "Usama", "Qaddafi" → "Gaddafi" | High | Use curated lookup table for v1 (top 30 variants) |
| Nickname / common alias substitution | "Mohammed" → "Mohamed" / "Muhammad" / "Mohamad" | Medium | Lookup table of high-frequency SDN name components |
| Punctuation insertion / removal | "Al-Qaeda" → "Al Qaeda" → "AlQaeda" | Low | Hyphen, period, apostrophe variants |
| Prefix/suffix removal | "Mr. John Smith Jr." → "John Smith" | Low | Title and generational suffix handling |

---

## Differentiators

Features that would impress compliance-specialist clients and demonstrate Crowe's depth.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Jaro-Winkler match score column | Shows HOW CLOSE a degraded name still is; lets clients see numeric sensitivity threshold problems | High | Requires string similarity library; very compelling |
| "Catch rate" summary stat | "X of Y degradations would be caught at 85% threshold" — benchmark number for regulators | High | Requires scoring as prerequisite |
| Compound / chained degradations | Apply multiple rules simultaneously to show compounding evasion complexity | Medium | Powerful for sophisticated evasion scenarios |
| Rule severity / risk rating | Label each rule High/Medium/Low risk based on real evasion case frequency | Low | Editorial content; requires Crowe domain expertise |
| Interactive threshold slider | Slider adjusts "catch" vs "miss" cutoff with live-updating results | High | Requires scoring as prerequisite |
| Client name labeling | Embed client name in output file name / header | Low | Simple personalization; makes demo feel custom |
| Annotation / notes column | Consultant adds note to any row before CSV export | Low | UX enhancement; makes output a working document |
| Exportable PDF summary slide | Auto-generate one-page exhibit with key stats + sample table | High | Use browser print-to-PDF as v1 workaround |

---

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real SDN list integration | Legal/security risk; PII handling; client firewall issues | Synthetic data only; note "synthetic data" prominently in UI |
| Actual screening (running client names through a model) | This is a demo tool, not a screening engine; creates false assurance | Scope strictly to "show degradation techniques" |
| User authentication | Adds friction with zero value in v1 demo context | Stateless app; no auth |
| ML/AI name matching model | Months-long project; turns demo into a product | Rule-based degradation; optionally add edit distance scoring as differentiator |
| Multi-language UI / i18n | Primary audience is English-speaking Crowe consultants | English-only UI; UTF-8 data handling for name characters |
| Bulk async job queue | Not needed for a demo of 50–200 names | Synchronous processing; show progress indicator |
| Database persistence of session data | Creates data governance obligations for Crowe | In-memory processing; CSV is the persistence mechanism |

---

## Feature Dependencies

```
Synthetic SDN name library → Entity type + linguistic region selection
Degradation rule selection → Results table (rules determine what appears)
Results table → CSV download (export of table data)
Jaro-Winkler scoring → Match score column
Jaro-Winkler scoring → Catch rate summary stat
Jaro-Winkler scoring → Interactive threshold slider
Match score column → Interactive threshold slider
Catch rate summary stat → Threshold slider
Compound degradations → Results table (adds "Rules Applied" column)
```

---

## MVP Recommendation

### v1 — Demo-Ready

1. Synthetic SDN name library (pre-loaded, covers all entity types and regions)
2. Parameter form: entity type counts + linguistic regions + degradation rule selection + client name
3. All 10 degradation rule categories with plain-English descriptions
4. Side-by-side results table (Original / Rule Applied / Degraded Variant)
5. CSV download (UTF-8 BOM, Excel-safe)
6. Deterministic output

### v2 — Elevate the Conversation

7. Jaro-Winkler match score column
8. Compound / chained degradation rules
9. Catch rate summary stat with configurable threshold
10. Rule severity / risk ratings

### Defer Indefinitely

- PDF export slide (use browser print-to-PDF as workaround)
- Interactive threshold slider (needs scoring as prerequisite)
- Screening system profile selector (requires vendor threshold research)

---

## Phonetics Implementation Note

Phonetic variants are the most complex rule. Soundex/Metaphone are English-optimized and perform poorly on Arabic/Cyrillic. **v1 approach:** a manually curated lookup table of the 20–30 most common variant spellings for high-frequency SDN name components (Mohammed variants, Osama/Usama, Qaddafi/Gaddafi/Kadafi, etc.). This covers 80% of client questions with 20% of the complexity.
