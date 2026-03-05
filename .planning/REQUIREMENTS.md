# Requirements: OFAC Sensitivity Testing Tool

**Defined:** 2026-03-05
**Core Value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.

## v2.0 Requirements

Requirements for the v2.0 Production Face milestone. Each maps to roadmap phases.

### Landing Page

- [x] **LAND-01**: User can view a landing page at "/" with a hero section and primary CTA button that navigates to the tool
- [x] **LAND-02**: User can read a "How It Works" 3-step methodology section explaining configure → run → export
- [x] **LAND-03**: User can view a features/stats section showing real engine numbers (285 entries, 10 rules, ~53ms, 4 regions)
- [x] **LAND-04**: User can see a Crowe-branded footer with navigation links

### Tool Layout

- [x] **LAYOUT-01**: User can configure test parameters in a left panel while the right panel displays engine documentation
- [x] **LAYOUT-02**: Right panel shows full engine explanation (all 10 rules, scoring methodology, dataset info) before a test is run
- [x] **LAYOUT-03**: Right panel switches to results table after running a test, with an Explanation tab to return to engine docs
- [x] **TABLE-01**: Results table rows extend to the right border of the table with no horizontal gap on the right side

### Explanations

- [x] **EXPL-01**: Right panel documents all 10 degradation rules with plain-English descriptions and how each transforms a name
- [x] **EXPL-02**: Right panel explains how the synthetic SDN dataset is constructed, what entity types and regions mean, and how sampling works
- [x] **EXPL-03**: Right panel explains Jaro-Winkler scoring — what the score means, what catch rate represents, and how to interpret results
- [x] **EXPL-04**: User can read a methodology explanation on the landing "How It Works" section that educates clients before they see the form

### Animation

- [ ] **ANIM-01**: Landing page sections animate in with scroll-triggered reveals as the user scrolls down
- [ ] **ANIM-02**: Parameter form sections at /tool stagger in on page load
- [ ] **ANIM-03**: Landing stats count up with a number animation when scrolled into view
- [ ] **ANIM-04**: CTA buttons have an amber glow on hover; cards lift on hover

### Icon Pass

- [x] **ICON-01**: Form section headings and rule checkboxes use Iconsax Linear icons
- [x] **ICON-02**: CTA buttons and navigation use Iconsax Bold icons (arrow, download, external link)
- [x] **ICON-03**: Results table match/no-match indicators use Iconsax TickCircle/CloseCircle replacing Unicode characters
- [ ] **ICON-04**: Landing page How It Works and Stats sections use Iconsax TwoTone feature icons

### Premium UI

- [ ] **UIPOL-01**: Landing hero headline uses React Bits BlurText or 21st.dev animated headline component
- [ ] **UIPOL-02**: Landing features/stats section uses React Bits TiltCard or 21st.dev premium card variant
- [ ] **UIPOL-03**: Primary CTA button uses an animated amber glow treatment
- [ ] **UIPOL-04**: Parameter form sections use SpotlightCard or premium card treatment

## Future Requirements

### Accessibility

- **A11Y-01**: Animations respect `prefers-reduced-motion` — all Anime.js animations disabled when OS setting is on
- **A11Y-02**: All Iconsax icons include `aria-label` or are marked `aria-hidden` with adjacent visible label

### Content

- **CONT-01**: Landing page copy is reviewed and approved by Crowe marketing
- **CONT-02**: Degradation rule descriptions are reviewed by OFAC compliance domain expert

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile-responsive landing page | Desktop-first for demo context — established in v1.0 |
| Real OFAC SDN list integration | Synthetic data only — compliance constraint |
| Video/animated demo embed | Overhead not justified for internal demo tool |
| Dark mode | Not part of Crowe brand guidelines for this tool |
| Multi-language support | English-only for Crowe US demo context |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 10 | Complete |
| LAND-02 | Phase 10 | Complete |
| LAND-03 | Phase 10 | Complete |
| LAND-04 | Phase 10 | Complete |
| LAYOUT-01 | Phase 11 | Complete |
| LAYOUT-02 | Phase 11 | Complete |
| LAYOUT-03 | Phase 11 | Complete |
| TABLE-01 | Phase 11 | Complete |
| EXPL-01 | Phase 11 | Complete |
| EXPL-02 | Phase 11 | Complete |
| EXPL-03 | Phase 11 | Complete |
| EXPL-04 | Phase 10 | Complete |
| ANIM-01 | Phase 13 | Pending |
| ANIM-02 | Phase 13 | Pending |
| ANIM-03 | Phase 13 | Pending |
| ANIM-04 | Phase 13 | Pending |
| ICON-01 | Phase 12 | Complete |
| ICON-02 | Phase 12 | Complete |
| ICON-03 | Phase 12 | Complete |
| ICON-04 | Phase 12 | Pending |
| UIPOL-01 | Phase 14 | Pending |
| UIPOL-02 | Phase 14 | Pending |
| UIPOL-03 | Phase 14 | Pending |
| UIPOL-04 | Phase 14 | Pending |

**Coverage:**
- v2.0 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 — roadmap created, traceability confirmed*
