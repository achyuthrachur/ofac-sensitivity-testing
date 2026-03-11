# OFAC UI Element Request List

Canonical visual procurement artifact for this repo.

Use this file when Codex needs to tell the user what UI element is needed.

Do not use this file to suggest source libraries, slugs, or `npx` commands.

## Element: Global Navigation Shell
- Surface: `src/components/nav/SiteNav.tsx`
- Current weakness: the current sticky header is competent but generic and still relies on a text-only wordmark treatment
- UX job: establish trust and product polish immediately
- Visual role: high-craft navigation shell that frames the whole product
- Required behavior: clear active-state feedback, responsive layout, and room for the official Crowe logo asset later
- Motion expectations: subtle state travel and hover emphasis only
- Crowe constraints: indigo-led, restrained, professional, no novelty glow language
- Integration note: should remain compatible with `ViewportGate` and the current route structure
- Priority: high
- Status: awaiting user-supplied component

## Element: Landing Hero Background Treatment
- Surface: `src/app/_components/landing/HeroSection.tsx`
- Current weakness: the hero reads as a standard centered SaaS header with limited atmosphere
- UX job: create immediate sophistication and product specificity without hurting readability
- Visual role: premium background layer and compositional anchor behind the hero content
- Required behavior: preserve strong headline contrast and CTA legibility
- Motion expectations: subtle ambient motion or depth only
- Crowe constraints: indigo/amber-led, no generic gradient wash, no purple bias
- Integration note: should sit behind or wrap the existing hero composition cleanly
- Priority: high
- Status: awaiting user-supplied component

## Element: Landing Workflow Story Module
- Surface: `src/app/_components/landing/HowItWorksSection.tsx`
- Current weakness: the current three-step surface still feels like a feature grid rather than a product story
- UX job: show progression from sensitivity testing to screening to simulation
- Visual role: narrative workflow surface
- Required behavior: ordered sequence must remain obvious at a glance
- Motion expectations: directional reveal cues that reinforce progression
- Crowe constraints: readable, executive, and structured rather than playful
- Integration note: should support the current three-step product framing
- Priority: high
- Status: awaiting user-supplied component

## Element: Landing Proof and Stats Surface
- Surface: `src/app/_components/landing/FeatureStatsSection.tsx`
- Current weakness: the metrics are readable but still feel like isolated counters rather than a cohesive proof surface
- UX job: strengthen credibility and proof density
- Visual role: premium proof module
- Required behavior: support numeric emphasis, short labels, and supporting context
- Motion expectations: restrained count-up or hover-depth only where it improves scanability
- Crowe constraints: dark indigo framing, controlled amber emphasis, no rainbow metric palette
- Integration note: should preserve the current metric content while improving presentation
- Priority: medium
- Status: awaiting user-supplied component

## Element: Tool Left Rail Onboarding Module
- Surface: `src/app/tool/page.tsx`
- Current weakness: the starter checklist is useful but still reads like a generic alert block
- UX job: orient first-time users immediately and make the left rail feel intentionally guided
- Visual role: premium onboarding module
- Required behavior: support short steps, quick scanability, and a clear recommended flow
- Motion expectations: subtle staged emphasis or progress indication only
- Crowe constraints: concise, professional, and advisory rather than playful
- Integration note: must fit beneath the left-rail header without disrupting the tool controls
- Priority: high
- Status: awaiting user-supplied component

## Element: Tool Top Educational Banner
- Surface: `src/components/education/OnboardingBanner.tsx`
- Current weakness: the banner is functional but visually plain and detached from the rest of the tool hierarchy
- UX job: deliver quick educational context without feeling like a generic app announcement strip
- Visual role: premium advisory banner
- Required behavior: clear dismiss action, compact copy, and low-friction scanning
- Motion expectations: quiet entrance and dismissal only
- Crowe constraints: dark, restrained, professional, not marketing-like
- Integration note: must remain lightweight above the tool tabs
- Priority: medium
- Status: awaiting user-supplied component

## Element: Tool Workflow Progression Tabs
- Surface: `src/app/tool/page.tsx`
- Current weakness: the tabs are usable but still look like standard product tabs instead of a guided workflow
- UX job: reinforce the sequence across Sensitivity Test, Screening Mode, and Simulation
- Visual role: premium stepped navigation treatment
- Required behavior: support active state, sequence cues, and low-friction switching
- Motion expectations: active-state transitions that clarify state change without slowing use
- Crowe constraints: compact, executive, sequence-led, not flashy segmented control styling
- Integration note: must work inside the existing top-of-tool tab shell
- Priority: high
- Status: awaiting user-supplied component

## Element: Tool Results Progression Band
- Surface: `src/app/tool/page.tsx`
- Current weakness: current cross-tab CTA panels are helpful but visually lightweight
- UX job: convert completed work in one mode into a confident next-step recommendation
- Visual role: workflow progression module
- Required behavior: support brief advisory copy and one clear action
- Motion expectations: appearance and hover cues only
- Crowe constraints: advisory tone, amber as action accent, no sales-banner feel
- Integration note: should be reusable at the bottom of completed result states
- Priority: medium
- Status: awaiting user-supplied component

## Element: Methodology Explainer Surface
- Surface: `src/components/EngineExplanationPanel.tsx`
- Current weakness: the copy is clearer now, but the surrounding shell still feels like ordinary documentation
- UX job: make methodology feel like a polished executive explainer
- Visual role: long-form trust-building explainer surface
- Required behavior: support section grouping, readable measure, and selective emphasis
- Motion expectations: section reveal or light emphasis only
- Crowe constraints: calm, trust-oriented, no marketing theatrics
- Integration note: must preserve current methodology content architecture
- Priority: medium
- Status: awaiting user-supplied component

## Element: Screening Input Workspace Shell
- Surface: `src/components/screening/InputPanel.tsx`
- Current weakness: the upload and paste area is useful but visually conventional for a primary workflow entry point
- UX job: make name loading feel clear, premium, and operationally trustworthy
- Visual role: structured input workspace shell
- Required behavior: support file upload, paste input, state feedback, and strong hierarchy
- Motion expectations: focus, drag, and loaded-state feedback only
- Crowe constraints: whitespace and hierarchy over novelty, explicit accessibility, no playful consumer upload styling
- Integration note: must preserve the dual upload-or-paste model
- Priority: high
- Status: awaiting user-supplied component

## Element: Screening Results Analyst Shell
- Surface: `src/components/screening/ScreeningResultsPane.tsx`
- Current weakness: the results view is functionally strong but still assembled from standard dashboard pieces
- UX job: improve scanability and perceived sophistication across threshold controls, summary, list-detail inspection, and export actions
- Visual role: analyst workstation shell
- Required behavior: support dense information, fast scanning, and list-detail focus
- Motion expectations: state transitions should orient threshold changes and result selection
- Crowe constraints: dense but readable, semantic risk colors preserved, no decorative dashboard chrome
- Integration note: must retain existing results logic and threshold behavior
- Priority: high
- Status: awaiting user-supplied component

## Element: Simulation Insight Shell
- Surface: `src/components/simulation/SimulationPane.tsx`
- Current weakness: the simulation flow is clear but visually conservative across presets, chart framing, and detail pairing
- UX job: make simulation feel like a premium insight surface while preserving analyst confidence
- Visual role: controls-plus-insight shell
- Required behavior: support preset selection, chart focus, snapshot inspection, and recalibration context
- Motion expectations: controlled transitions between presets, snapshots, and markers
- Crowe constraints: data clarity first, restrained motion, no visual competition with the chart
- Integration note: must preserve the current chart/table/detail structure
- Priority: high
- Status: awaiting user-supplied component

## Element: Guide Sidebar Navigation Treatment
- Surface: `src/app/guide/_components/GuideSidebar.tsx`
- Current weakness: the sidebar nav is useful but visually plain for a long-form explainer experience
- UX job: make guide navigation feel like a polished reference system
- Visual role: anchored long-form navigation shell
- Required behavior: support strong active-state feedback and easy scanning of section structure
- Motion expectations: subtle active-state tracking and hover response only
- Crowe constraints: quiet, structured, not app-like or playful
- Integration note: must stay compatible with anchor-based guide navigation
- Priority: medium
- Status: awaiting user-supplied component

## Element: Guide Editorial Callout System
- Surface: `src/app/guide/page.tsx` and guide section files
- Current weakness: the guide reads better than before but still lacks a strong editorial pacing system
- UX job: improve story rhythm, emphasis, and sectional pacing across long-form content
- Visual role: editorial callout and section framing system
- Required behavior: support examples, emphasis blocks, and sectional transitions without bloating the page
- Motion expectations: light reveal wrappers or anchor transitions only
- Crowe constraints: restrained editorial tone, disciplined typography, no loud content-marketing styling
- Integration note: should work across all guide sections, not just one page block
- Priority: medium
- Status: awaiting user-supplied component

## Element: Help Drawer Reference Surface
- Surface: `src/components/help/HelpDrawer.tsx`
- Current weakness: the drawer is useful but feels utilitarian rather than polished
- UX job: make in-app help feel deliberate, trustworthy, and easy to scan
- Visual role: embedded reference panel shell
- Required behavior: support glossary, quick links, and compact informational sections
- Motion expectations: calm drawer entry and section emphasis only
- Crowe constraints: dark, advisory, structured, no gimmick overlay behavior
- Integration note: should preserve the current help model and quick-link logic
- Priority: medium
- Status: awaiting user-supplied component

## Element: Shared Empty-State System
- Surface: `src/components/states/*`
- Current weakness: current empty states are clean but generic
- UX job: turn waiting states into branded guidance moments
- Visual role: compact reusable empty-state pattern
- Required behavior: support icon, short message, optional action, and route-specific guidance
- Motion expectations: minimal fade or icon-depth behavior only
- Crowe constraints: text-forward, compact, useful, no illustration-heavy consumer style
- Integration note: should be reusable across sensitivity, screening, and simulation flows
- Priority: low
- Status: awaiting user-supplied component

## Element: Shared Reveal Wrapper System
- Surface: landing animation shells and future guide/tool reveal surfaces
- Current weakness: motion exists in pockets, but the product lacks a unified reveal system
- UX job: establish a consistent product-wide motion language
- Visual role: shared motion wrapper system
- Required behavior: support staged section entry, restrained stagger, and hierarchy reinforcement
- Motion expectations: this is the motion system, so it must be subtle, reusable, and consistent
- Crowe constraints: trust-supporting motion only, no novelty-first animation
- Integration note: should be reusable across landing, tool, and guide without changing product semantics
- Priority: medium
- Status: awaiting user-supplied component
