# OFAC Sensitivity Testing Tool

## What This Is

A Next.js web application that replaces Crowe's RPA pipeline (UiPath/Power Automate/SharePoint/Outlook) for OFAC sanctions screening sensitivity testing. Consultants configure parameters via a form, the app samples a built-in synthetic SDN dataset and applies 10 degradation transformations, and outputs a virtualized results table with Jaro-Winkler catch-rate scoring and UTF-8 BOM CSV download — all in one browser session at a single Vercel URL. The app now includes a full marketing landing page, contextual engine documentation, a complete icon and animation pass, and premium React Bits UI components.

## Current Milestone: v3.0 Screening Engine

**Goal:** Transform the tool from a degradation demonstration into an actual OFAC screening engine with two new operational modes: Screening Mode (screen real name lists against the SDN dataset with tiered compliance framing) and Longitudinal Simulation Mode (simulate how catch rates evolve as evasion tactics escalate over time).

**Target features:**
- Screening Mode — CSV/Excel/paste input, 5-tier threshold scoring, multi-algorithm matching (JW + Double Metaphone + Token Sort), threshold slider, FP/FN dashboard, Cost of Miss calculator, PDF compliance memo export
- Longitudinal Simulation Mode — per-update snapshot model, catch rate chart with 3 threshold bands + evasion tier markers, waterfall decomposition table, detection lag metric, recovery line simulation

## Core Value

A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep, no SharePoint, no email — and a client can see results in real time.

## Current State (v2.0 — shipped 2026-03-06)

- **Live URL:** https://ofac-sensitivity-testing.vercel.app
- **GitHub:** https://github.com/achyuthrachur/ofac-sensitivity-testing
- **Stack:** Next.js 16 · TypeScript strict · Tailwind v4 · shadcn/ui · Vitest 4 · Anime.js v4 · motion v12 · iconsax-reactjs
- **Dataset:** 285 synthetic SDN entries — Individual (160), Business (80), Vessel (30), Aircraft (15) — spanning Arabic, CJK, Cyrillic, Latin regions
- **Rules:** 10 degradation rules — space removal, char substitution, diacritics, word reorder, abbreviation, truncation, phonetic, punctuation, prefix/suffix, alias
- **Performance:** Worst-case 500 names × 10 rules in ~53ms (well under Vercel Hobby 10s timeout)
- **Tests:** 57+ Vitest unit/integration tests, all green
- **Source:** ~3,517 TypeScript/TSX LOC across 36 source files

## Requirements

### Validated (v1.0)

- ✓ User can configure entity type sample counts (Individual, Business, Vessel, Aircraft — 0–500 each) — v1.0
- ✓ User can select linguistic/regional families to include (Arabic, Chinese, Russian, Latin/European) — v1.0
- ✓ User can select which degradation rules to apply (with Select All toggle) — v1.0
- ✓ User can enter a client name (used in CSV filename) — v1.0
- ✓ App samples from synthetic OFAC SDN dataset based on entity type counts and linguistic filters — v1.0
- ✓ App applies selected degradation transformations to sampled names — v1.0
- ✓ Results display in virtualized table with original name, entity type, region, degraded variant, rule applied, Jaro-Winkler score — v1.0
- ✓ User can download results as UTF-8 BOM CSV with client name in filename — v1.0
- ✓ App deployed to Vercel and accessible via URL — v1.0

### Validated (v2.0)

- ✓ Landing page at "/" — Hero + CTA, How It Works (3-step), Features/stats, Crowe-branded footer — v2.0
- ✓ Engine explanation panel — all 10 rules, Jaro-Winkler scoring, dataset construction documented in right panel — v2.0
- ✓ Two-panel tool layout — fixed-width configurator left, scrollable docs/results right — v2.0
- ✓ Full Iconsax icon pass — Linear (form), Bold (CTA/nav), TwoTone (landing features), TickCircle/CloseCircle (results) — v2.0
- ✓ Anime.js animation pass — scroll-triggered reveals, 80ms form stagger, count-up stats, CTA amber breathing glow, hover lift — v2.0
- ✓ Premium React Bits UI — BlurText hero headline (word-by-word), StatTiltCard stats depth, always-on CTA amber glow, SpotlightCard form cards — v2.0

### Active (v3.0)

- [ ] Screening Mode: CSV/Excel/paste input (up to 10,000 names) screened against SDN dataset
- [ ] Screening Mode: 5-tier threshold scoring (EXACT/HIGH/MEDIUM/LOW/CLEAR) with configurable threshold slider
- [ ] Screening Mode: Multi-algorithm scoring (Jaro-Winkler + Double Metaphone + Token Sort Ratio)
- [ ] Screening Mode: FP/FN counters + Cost of Miss calculator
- [ ] Screening Mode: PDF compliance memo export (Crowe header, full match schema)
- [ ] Longitudinal Simulation: Per-update snapshot model with 3 velocity presets
- [ ] Longitudinal Simulation: Catch rate chart with 3 threshold bands + evasion tier markers
- [ ] Longitudinal Simulation: Waterfall decomposition table + detection lag metric per entity

### Out of Scope

- Real OFAC SDN list integration — synthetic data only for demo safety and compliance
- Authentication/access control — public demo tool
- Excel (.xlsx) output — CSV is sufficient
- Mobile-responsive design — desktop-first for demo context
- Saving/loading sessions — stateless per-run
- The RPA pipeline (SharePoint, Power Automate, Outlook emails, UiPath bots) — fully replaced

## Context

**Original system:** UiPath/Power Automate RPA bot — Microsoft Forms → SharePoint file exchange → Python script → Outlook email delivery.

**What was built:** Next.js app (App Router) with TypeScript degradation engine, built-in synthetic dataset, Zod-validated server action, full parameter form, virtualized results table, Crowe-branded UI, marketing landing page, engine documentation panel, icon pass, animation pass, and premium React Bits components.

**Key technical facts:**
- `data/sdn.json` imported via `@data/*` tsconfig alias — flat `SdnEntry[]` array
- `ruleMap` uses `Record<RuleId, RuleFunction>` — TypeScript enforces all 10 IDs present at compile time
- `CANONICAL_RULE_ORDER` is authoritative execution sequence — deterministic output regardless of UI checkbox order
- TanStack virtualizer requires explicit px width on every `<th>` and `<td>` — `colgroup` does not propagate to `position:absolute` rows
- Crowe TLS proxy blocks `googleapis.com` at build time — `next/font/google` removed, plain CSS font stack used
- Tailwind v4 requires color tokens in `@theme` inline block (not just `:root`) for `bg-crowe-*` utility generation
- AnimationShell pattern: thin `'use client'` wrapper around Server Component children using `createScope({ root: rootRef }) + revert()` on unmount
- Anime.js v4: `onEnterForward` (not `onEnter`) for play-once scroll reveals; named imports only
- motion v12 (`motion/react`): required by React Bits BlurText + StatTiltCard; not framer-motion
- Stock React Bits TiltedCard is image-only — custom `StatTiltCard` built using `useMotionValue`/`useSpring` pattern

## Constraints

- **Deployment:** Vercel — must work as a Vercel-hosted Next.js app
- **Tech stack:** Next.js (App Router), TypeScript, React — no separate backend service
- **Data:** Synthetic OFAC data only — no real SDN names or API calls to OFAC
- **Output:** CSV download (not Excel)
- **Network:** `NODE_TLS_REJECT_UNAUTHORIZED=0` required for Vercel CLI and shadcn CLI on Crowe corporate network

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over separate Python backend | Single Vercel deployment; degradation logic is all string transforms easily done in TS | ✓ Good — ~53ms worst-case, clean deployment |
| Synthetic data only | Client-facing demo needs no compliance concerns from real sanctioned names | ✓ Good — domain reviewer approved authenticity |
| Reconstruct substitution tables | Original Excel files unavailable; domain knowledge sufficient | ✓ Good — all 10 rules verified |
| CSV over Excel | Simpler implementation, sufficient for demo | ✓ Good — UTF-8 BOM handles non-Latin chars in Excel |
| Tailwind v4 (not downgraded) | create-next-app pulled v4; shadcn/ui v3.8.5 compatible | ✓ Good — no issues |
| colgroup → explicit px per th/td | colgroup doesn't propagate to position:absolute virtual rows | ✓ Good — fixed production column misalignment |
| Remove next/font/google | Crowe TLS proxy blocks googleapis.com at build time | ✓ Good — plain CSS stack works fine |
| @theme inline for Crowe tokens | Tailwind v4 requires @theme for utility class generation | ✓ Good — bg-crowe-* classes generated correctly |
| AnimationShell pattern (v2.0) | Server Components can't use useEffect; thin 'use client' wrapper keeps section as Server Component | ✓ Good — clean separation, revert() prevents leaks |
| Anime.js onEnterForward (v2.0) | onEnter fires bidirectionally; onEnterForward fires only on downward scroll | ✓ Good — play-once scroll reveals work correctly |
| motion v12 not framer-motion (v2.0) | React Bits registry declares motion@^12 dependency; framer-motion is legacy | ✓ Good — React 19 compatible |
| Custom StatTiltCard (v2.0) | Stock React Bits TiltedCard is image-only (figure/motion.img); need children wrapper | ✓ Good — useMotionValue/useSpring pattern extracted cleanly |

---
*Last updated: 2026-03-06 — v3.0 Screening Engine milestone started*
