# Requirements: OFAC Sensitivity Testing Tool

**Defined:** 2026-03-03
**Core Value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.

---

## v1 Requirements

### Parameter Form

- [ ] **FORM-01**: User can set sample count per entity type (Individual, Business, Vessel, Aircraft — 0–500 each)
- [ ] **FORM-02**: User can select one or more linguistic regions to include (Arabic, Chinese, Russian/Cyrillic, Latin/European)
- [ ] **FORM-03**: User can select degradation rules to apply via checkboxes with a "Select All" option
- [ ] **FORM-04**: User can enter a client name used to label the output CSV
- [ ] **FORM-05**: Form shows a loading state while results are generating and disables the submit button to prevent duplicate submissions

### Synthetic Dataset

- [x] **DATA-01**: App includes built-in synthetic SDN names for Individual entity type
- [x] **DATA-02**: App includes built-in synthetic SDN names for Business/Organization entity type
- [x] **DATA-03**: App includes built-in synthetic SDN names for Vessel entity type
- [x] **DATA-04**: App includes built-in synthetic SDN names for Aircraft entity type
- [x] **DATA-05**: Synthetic names span Arabic, Chinese, Russian/Cyrillic, and Latin/European linguistic regions
- [x] **DATA-06**: Synthetic names follow culturally authentic naming conventions per region (ism+nasab for Arabic, surname-first for Chinese, etc.)

### Degradation Rules

- [x] **RULE-01**: User can apply space removal / insertion (`AL QAEDA` → `ALQAEDA` or `A L Q A E D A`)
- [x] **RULE-02**: User can apply character substitution — OCR/leet variants (`O`→`0`, `I`→`1`, `S`→`5`, `A`→`@`)
- [x] **RULE-03**: User can apply diacritic removal / addition (`Müller` → `Muller`, `Jose` → `José`)
- [x] **RULE-04**: User can apply word reordering (`Kim Jong Un` → `Jong Un Kim`)
- [x] **RULE-05**: User can apply abbreviation (compress tokens by dropping vowels: `Mohammed` → `Mhd`)
- [ ] **RULE-06**: User can apply truncation (drop trailing name tokens)
- [ ] **RULE-07**: User can apply phonetic / transliteration variants (`Osama` → `Usama`, `Qaddafi` → `Gaddafi`)
- [ ] **RULE-08**: User can apply punctuation insertion / removal (`Al-Qaeda` → `Al Qaeda` → `AlQaeda`)
- [ ] **RULE-09**: User can apply prefix / suffix removal (`Mr. John Smith Jr.` → `John Smith`)
- [ ] **RULE-10**: User can apply nickname / alias substitution (`Mohammed` → `Mohamed` / `Muhammad` / `Mohamad`)

### Results Display

- [ ] **RSLT-01**: Results display in a table showing Original Name, Entity Type, Linguistic Region, Degraded Variant, and Rule Applied
- [ ] **RSLT-02**: Results table shows a Jaro-Winkler similarity score for each original → degraded name pair
- [ ] **RSLT-03**: Results page shows a catch-rate summary stat (e.g., "X of Y degraded variants would be caught at 85% match threshold")
- [ ] **RSLT-04**: Results table remains usable and responsive with thousands of rows (virtualized rendering)

### Export

- [ ] **EXPO-01**: User can download all results as a CSV file
- [ ] **EXPO-02**: CSV file uses UTF-8 encoding with BOM so non-Latin characters display correctly in Excel
- [ ] **EXPO-03**: CSV filename includes the client name entered in the parameter form

---

## v2 Requirements

### Advanced Analysis

- **ANAL-01**: Interactive match threshold slider that live-updates which degraded variants are "caught" vs "missed"
- **ANAL-02**: Compound / chained degradations (apply multiple rules simultaneously to show compounding evasion)
- **ANAL-03**: Per-rule catch-rate breakdown table
- **ANAL-04**: Rule severity / risk rating labels (High/Medium/Low based on real-world evasion frequency)

### Output Enhancements

- **OUTP-01**: Exportable PDF summary slide auto-generated from results (browser print-to-PDF as interim workaround)
- **OUTP-02**: Annotation / notes column (consultant adds notes before CSV export)

### Configuration

- **CONF-01**: Configurable match threshold parameter (default 85%, adjustable)
- **CONF-02**: Save and restore form configuration across browser sessions

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real OFAC SDN list integration | Legal/security risk in a demo context; synthetic data sufficient; "synthetic" labeled in UI |
| Actual sanctions screening engine | Demo tool only — never positioned as a replacement for a real screening system |
| User authentication / accounts | No sensitive data; adds friction with zero demo value |
| ML/AI name matching model | Months-long project; turns demo into a product |
| Multi-language UI (i18n) | English-only audience; UTF-8 data handling is separate from UI language |
| Async job queue / background processing | Not needed for a demo of up to 2,000 names |
| Database persistence of session data | Creates data governance obligations; CSV is the persistence mechanism |
| Mobile-responsive design | Desktop-first for demo context |
| Webhook / API integration with screening vendors | Requires vendor agreements, security review, complex auth |

---

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FORM-01 | Phase 5 | Pending |
| FORM-02 | Phase 5 | Pending |
| FORM-03 | Phase 5 | Pending |
| FORM-04 | Phase 5 | Pending |
| FORM-05 | Phase 4 | Pending |
| DATA-01 | Phase 2 | Complete |
| DATA-02 | Phase 2 | Complete |
| DATA-03 | Phase 2 | Complete |
| DATA-04 | Phase 2 | Complete |
| DATA-05 | Phase 2 | Complete |
| DATA-06 | Phase 2 | Complete |
| RULE-01 | Phase 3 | Complete |
| RULE-02 | Phase 3 | Complete |
| RULE-03 | Phase 3 | Complete |
| RULE-04 | Phase 3 | Complete |
| RULE-05 | Phase 3 | Complete |
| RULE-06 | Phase 3 | Pending |
| RULE-07 | Phase 3 | Pending |
| RULE-08 | Phase 3 | Pending |
| RULE-09 | Phase 3 | Pending |
| RULE-10 | Phase 3 | Pending |
| RSLT-01 | Phase 6 | Pending |
| RSLT-02 | Phase 6 | Pending |
| RSLT-03 | Phase 6 | Pending |
| RSLT-04 | Phase 6 | Pending |
| EXPO-01 | Phase 6 | Pending |
| EXPO-02 | Phase 6 | Pending |
| EXPO-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 — traceability filled after roadmap creation*
