# Requirements: OFAC Sensitivity Testing Tool

**Defined:** 2026-03-05
**Core Value:** A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep — and a client can see results in real time.

## v2.0 Requirements

Requirements for the v2.0 Production Face milestone. Each maps to roadmap phases.

### Landing Page

- [ ] **LAND-01**: User can view a landing page at "/" with a hero section and primary CTA button that navigates to the tool
- [ ] **LAND-02**: User can read a "How It Works" 3-step methodology section explaining configure → run → export
- [ ] **LAND-03**: User can view a features/stats section showing real engine numbers (285 entries, 10 rules, ~53ms, 4 regions)
- [ ] **LAND-04**: User can see a Crowe-branded footer with navigation links

### Explanations

- [ ] **EXPL-01**: User can open a tooltip on each of the 10 degradation rules to read a plain-English description of what the rule does
- [ ] **EXPL-02**: User can read static helper text on entity count inputs and region checkboxes explaining what each parameter means
- [ ] **EXPL-03**: User can see an elevated catch-rate stat card with score interpretation legend in the results view (replaces buried summary line)
- [ ] **EXPL-04**: User can read a methodology explanation on the landing "How It Works" section that educates clients before they see the form

### Animation

- [ ] **ANIM-01**: Landing page sections animate in with scroll-triggered reveals as the user scrolls down
- [ ] **ANIM-02**: Parameter form sections at /tool stagger in on page load
- [ ] **ANIM-03**: Landing stats count up with a number animation when scrolled into view
- [ ] **ANIM-04**: CTA buttons have an amber glow on hover; cards lift on hover

### Icon Pass

- [ ] **ICON-01**: Form section headings and rule checkboxes use Iconsax Linear icons
- [ ] **ICON-02**: CTA buttons and navigation use Iconsax Bold icons (arrow, download, external link)
- [ ] **ICON-03**: Results table match/no-match indicators use Iconsax TickCircle/CloseCircle replacing Unicode characters
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
| LAND-01 | Phase 10 | Pending |
| LAND-02 | Phase 10 | Pending |
| LAND-03 | Phase 10 | Pending |
| LAND-04 | Phase 10 | Pending |
| EXPL-01 | Phase 11 | Pending |
| EXPL-02 | Phase 11 | Pending |
| EXPL-03 | Phase 11 | Pending |
| EXPL-04 | Phase 10 | Pending |
| ANIM-01 | Phase 13 | Pending |
| ANIM-02 | Phase 13 | Pending |
| ANIM-03 | Phase 13 | Pending |
| ANIM-04 | Phase 13 | Pending |
| ICON-01 | Phase 12 | Pending |
| ICON-02 | Phase 12 | Pending |
| ICON-03 | Phase 12 | Pending |
| ICON-04 | Phase 12 | Pending |
| UIPOL-01 | Phase 14 | Pending |
| UIPOL-02 | Phase 14 | Pending |
| UIPOL-03 | Phase 14 | Pending |
| UIPOL-04 | Phase 14 | Pending |

**Coverage:**
- v2.0 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 — roadmap created, traceability confirmed*
