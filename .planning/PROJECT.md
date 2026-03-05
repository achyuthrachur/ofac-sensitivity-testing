# OFAC Sensitivity Testing Tool

## What This Is

A Next.js web application that replaces Crowe's RPA pipeline (UiPath/Power Automate/SharePoint/Outlook) for OFAC sanctions screening sensitivity testing. Consultants configure parameters via a form, the app samples a built-in synthetic SDN dataset and applies 10 degradation transformations, and outputs a virtualized results table with Jaro-Winkler catch-rate scoring and UTF-8 BOM CSV download — all in one browser session at a single Vercel URL.

## Core Value

A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep, no SharePoint, no email — and a client can see results in real time.

## Current Milestone: v2.0 Production Face

**Goal:** Transform the tool into a production-ready web app with a landing page, contextual explanations throughout, and a full premium animation and icon pass.

**Target features:**
- Landing page — Hero + CTA, How It Works (3-step), Features/stats, Crowe-branded footer
- Inline form explanations — entity types, regions, rules, score interpretation
- Results context — catch-rate guidance, score interpretation in results view
- Full animation pass — Anime.js scroll reveals, stagger entrances, hover micro-interactions
- Iconsax icon pass — replace all generic UI icons
- Premium UI components — React Bits / 21st.dev cards, buttons, hero elements

## Current State (v1.0 — shipped 2026-03-05)

- **Live URL:** https://ofac-sensitivity-testing.vercel.app
- **GitHub:** https://github.com/achyuthrachur/ofac-sensitivity-testing
- **Stack:** Next.js 15 · TypeScript strict · Tailwind v4 · shadcn/ui · Vitest 4
- **Dataset:** 285 synthetic SDN entries — Individual (160), Business (80), Vessel (30), Aircraft (15) — spanning Arabic, CJK, Cyrillic, Latin regions
- **Rules:** 10 degradation rules — space removal, char substitution, diacritics, word reorder, abbreviation, truncation, phonetic, punctuation, prefix/suffix, alias
- **Performance:** Worst-case 500 names × 10 rules in ~53ms (well under Vercel Hobby 10s timeout)
- **Tests:** 57+ Vitest unit/integration tests, all green

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

### Active (v2.0)

- [ ] Landing page — Hero + CTA, How It Works, Features/stats, Crowe-branded footer
- [ ] Inline form explanations — contextual guidance for entity types, regions, and degradation rules
- [ ] Results context — score interpretation panel and catch-rate guidance in results view
- [ ] Full animation pass — Anime.js scroll reveals, stagger entrances, hover micro-interactions
- [ ] Iconsax icon pass — replace all generic UI icons throughout the app
- [ ] Premium UI components — React Bits / 21st.dev cards, buttons, hero elements

### Out of Scope

- Real OFAC SDN list integration — synthetic data only for demo safety and compliance
- Authentication/access control — public demo tool
- Excel (.xlsx) output — CSV is sufficient
- Mobile-responsive design — desktop-first for demo context
- Saving/loading sessions — stateless per-run
- The RPA pipeline (SharePoint, Power Automate, Outlook emails, UiPath bots) — fully replaced

## Context

**Original system:** UiPath/Power Automate RPA bot — Microsoft Forms → SharePoint file exchange → Python script → Outlook email delivery.

**What was built:** Next.js app (App Router) with TypeScript degradation engine, built-in synthetic dataset, Zod-validated server action, full parameter form, virtualized results table, Crowe-branded UI.

**Key technical facts:**
- `data/sdn.json` imported via `@data/*` tsconfig alias — flat `SdnEntry[]` array
- `ruleMap` uses `Record<RuleId, RuleFunction>` — TypeScript enforces all 10 IDs present at compile time
- `CANONICAL_RULE_ORDER` is authoritative execution sequence — deterministic output regardless of UI checkbox order
- TanStack virtualizer requires explicit px width on every `<th>` and `<td>` — `colgroup` does not propagate to `position:absolute` rows
- Crowe TLS proxy blocks `googleapis.com` at build time — `next/font/google` removed, plain CSS font stack used
- Tailwind v4 requires color tokens in `@theme` inline block (not just `:root`) for `bg-crowe-*` utility generation

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

---
*Last updated: 2026-03-05 after v2.0 milestone started*
