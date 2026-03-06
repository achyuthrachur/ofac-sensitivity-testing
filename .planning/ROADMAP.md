# Roadmap: OFAC Sensitivity Testing Tool

## Milestones

- ✅ **v1.0 MVP** — Phases 1–9 (shipped 2026-03-05)
- 🚧 **v2.0 Production Face** — Phases 10–14 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–9) — SHIPPED 2026-03-05</summary>

- [x] Phase 1: Foundation (2/2 plans) — completed 2026-03-04
- [x] Phase 2: Synthetic Dataset (3/3 plans) — completed 2026-03-04
- [x] Phase 3: Transformation Engine (3/3 plans) — completed 2026-03-04
- [x] Phase 4: Server Action (1/1 plan) — completed 2026-03-04
- [x] Phase 5: Parameter Form (2/2 plans) — completed 2026-03-04
- [x] Phase 6: Results Table and CSV Export (2/2 plans) — completed 2026-03-04
- [x] Phase 7: Polish and Deployment (2/2 plans) — completed 2026-03-05
- [x] Phase 8: Table & Form UX Fixes (1/1 plan) — completed 2026-03-05 (gap closure)
- [x] Phase 9: Verification Coverage (1/1 plan) — completed 2026-03-05 (gap closure)

Full phase details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v2.0 Production Face (In Progress)

**Milestone Goal:** Transform the tool into a production-ready web app with a landing page, contextual explanations throughout, and a full premium animation and icon pass.

- [x] **Phase 10: Landing Page** - Route restructuring + complete static landing page at "/" (completed 2026-03-05)
- [x] **Phase 11: Tool Layout + Explanations** - Two-panel layout (configurator left, engine docs right), table row fix, full engine explanation panel with rules/scoring/methodology (completed 2026-03-05)
- [x] **Phase 12: Icon Pass** - Full Iconsax replacement throughout form, results, and landing (completed 2026-03-05)
- [ ] **Phase 13: Animation Pass** - Anime.js scroll reveals, stagger entrances, count-up numbers, hover effects
- [ ] **Phase 14: Premium UI** - React Bits / 21st.dev hero elements, animated CTA button, SpotlightCard form sections

## Phase Details

### Phase 10: Landing Page
**Goal**: Users can arrive at "/" and understand what the tool does before navigating to it — the tool lives at "/tool" and the landing page is the entry point
**Depends on**: Phase 9 (v1.0 complete)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, EXPL-04
**Success Criteria** (what must be TRUE):
  1. User visits "/" and sees a hero section with a headline and a "Configure Your Test" CTA button that navigates to "/tool"
  2. User can read a "How It Works" 3-step section that explains Configure → Run → Export with methodology context before touching the form
  3. User can see a stats section displaying real engine numbers: 285 SDN entries, 10 rules, 4 regions, ~53ms processing
  4. User can see a Crowe-branded footer with navigation links at the bottom of the landing page
  5. Existing tool functionality is accessible at "/tool" with no regressions — `next build` passes
**Plans**: 2 plans

Plans:
- [ ] 10-01-PLAN.md — Route restructuring: move tool to /tool, create tool/layout.tsx, remove footer from root layout
- [ ] 10-02-PLAN.md — Landing page static content: HeroSection, HowItWorksSection, FeatureStatsSection, CroweBrandedFooter

### Phase 11: Tool Layout + Explanations
**Goal**: The tool page has a two-panel layout — configurator on the left, engine documentation on the right — and users understand what every rule, score, and parameter means without asking
**Depends on**: Phase 10
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, TABLE-01, EXPL-01, EXPL-02, EXPL-03
**Success Criteria** (what must be TRUE):
  1. User sees a left panel with all configuration controls (entity counts, regions, rules, client name, run button) and a right panel for engine docs/results
  2. Right panel shows full engine documentation before running — all 10 rules with plain-English descriptions, dataset explanation, scoring methodology
  3. After running, right panel switches to results table; user can click an Explanation tab to return to engine docs
  4. Results table rows extend to the right border with no horizontal gap
  5. Catch-rate score is prominently explained in context — user knows what a 97% score means without guessing
**Plans**: 2 plans

Plans:
- [ ] 11-01-PLAN.md — Install shadcn Tabs + fix ResultsTable scroll container width (TABLE-01) + two-panel layout restructure (LAYOUT-01)
- [ ] 11-02-PLAN.md — EngineExplanationPanel content (EXPL-01/02/03) + Tabs wiring (LAYOUT-02/03) + visual checkpoint

### Phase 12: Icon Pass
**Goal**: Every icon in the application uses Iconsax with the correct style variant — no Lucide icons or Unicode symbols remain
**Depends on**: Phase 11
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04
**Success Criteria** (what must be TRUE):
  1. Form section headings and rule checkboxes display Iconsax Linear icons (People, Global, Setting4, Building)
  2. CTA buttons and navigation use Iconsax Bold icons (ArrowRight, DocumentDownload, ExternalLink)
  3. Results table match/no-match indicators show Iconsax TickCircle (green) and CloseCircle (coral) instead of Unicode characters
  4. Landing page How It Works steps and stats section use Iconsax TwoTone feature icons
**Plans**: 2 plans

Plans:
- [ ] 12-01-PLAN.md — Install iconsax-reactjs + form heading icons (ICON-01) + Refresh2 spinner + Download icon (ICON-02) + TickCircle/CloseCircle results table (ICON-03)
- [ ] 12-02-PLAN.md — HowItWorksSection TwoTone step icons + FeatureStatsSection Bold amber icons + visual checkpoint (ICON-04)

### Phase 13: Animation Pass
**Goal**: The landing page and tool form feel alive — sections reveal on scroll, cards stagger in on load, stats count up, and interactive elements respond with motion
**Depends on**: Phase 12
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04
**Success Criteria** (what must be TRUE):
  1. Landing page sections (How It Works, Stats, Features) animate into view with scroll-triggered reveals as the user scrolls down
  2. The 4 parameter form cards at "/tool" stagger in sequentially on page load with an 80ms delay between cards
  3. The stats numbers on the landing page count up with a number animation when the stats section scrolls into view
  4. CTA buttons show an amber glow on hover; feature cards lift with a shadow on hover
**Plans**: TBD

### Phase 14: Premium UI
**Goal**: The landing page and form look premium — React Bits and 21st.dev components replace plain static elements for a polished Crowe brand presentation
**Depends on**: Phase 13
**Requirements**: UIPOL-01, UIPOL-02, UIPOL-03, UIPOL-04
**Success Criteria** (what must be TRUE):
  1. Landing hero headline renders with an animated text entrance (BlurText or equivalent) — text reveals character-by-character or word-by-word on page load
  2. Landing features/stats section cards use TiltCard or a premium 21st.dev card variant with hover depth effect
  3. Primary CTA button carries a persistent amber glow treatment that draws the eye as the dominant action
  4. Parameter form section cards use SpotlightCard or a premium card treatment — a light follows the cursor across the card surface
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 10 → 11 → 12 → 13 → 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-03-04 |
| 2. Synthetic Dataset | v1.0 | 3/3 | Complete | 2026-03-04 |
| 3. Transformation Engine | v1.0 | 3/3 | Complete | 2026-03-04 |
| 4. Server Action | v1.0 | 1/1 | Complete | 2026-03-04 |
| 5. Parameter Form | v1.0 | 2/2 | Complete | 2026-03-04 |
| 6. Results Table and CSV Export | v1.0 | 2/2 | Complete | 2026-03-04 |
| 7. Polish and Deployment | v1.0 | 2/2 | Complete | 2026-03-05 |
| 8. Table & Form UX Fixes | v1.0 | 1/1 | Complete | 2026-03-05 |
| 9. Verification Coverage | v1.0 | 1/1 | Complete | 2026-03-05 |
| 10. Landing Page | v2.0 | 2/2 | Complete | 2026-03-05 |
| 11. Tool Layout + Explanations | v2.0 | Complete    | 2026-03-05 | 2026-03-05 |
| 12. Icon Pass | 2/2 | Complete    | 2026-03-06 | - |
| 13. Animation Pass | v2.0 | 0/TBD | Not started | - |
| 14. Premium UI | v2.0 | 0/TBD | Not started | - |
