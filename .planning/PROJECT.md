# OFAC Sensitivity Testing Tool

## What This Is

A Next.js web application that replaces an RPA pipeline (UiPath/Power Automate/SharePoint/Outlook) for Crowe's OFAC sanctions screening sensitivity testing workflow. Crowe consultants configure parameters via a form, the app samples synthetic SDN names and applies degradation transformations, and outputs a results table with CSV download — all in one browser session. Designed for client-facing demonstrations of Crowe's screening methodology.

## Core Value

A consultant can run a live OFAC sensitivity testing demonstration from a single URL with zero file prep, no SharePoint, no email — and a client can see results in real time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can configure entity type sample counts (Individual, Business, Vessel, Aircraft — 0–500 each)
- [ ] User can select linguistic/regional families to include (Arabic, Chinese, Russian, etc.)
- [ ] User can select which degradation rules to apply (with Select All option)
- [ ] User can enter a client name (used in output labeling)
- [ ] App samples from synthetic OFAC SDN dataset based on entity type counts and linguistic filters
- [ ] App applies selected degradation transformations to sampled names
- [ ] Results display in-app as a table showing original name vs. degraded variant(s)
- [ ] User can download results as CSV
- [ ] App is deployed to Vercel and accessible via URL

### Out of Scope

- Real OFAC SDN list integration — synthetic data only for demo safety and compliance
- Authentication/access control — public demo tool for now
- Excel (.xlsx) output — CSV is sufficient for demo purposes
- Mobile-responsive design — desktop-first for demo context
- Saving/loading sessions — stateless per-run
- The RPA pipeline (SharePoint, Power Automate, Outlook emails, UiPath bots) — fully replaced

## Context

**Original system**: A UiPath/Power Automate RPA bot that chains Microsoft Forms → SharePoint file exchange → a Python script → Outlook email delivery. The Python script contains the core degradation logic (string transformations) and reads substitution tables from Excel files.

**What we're replacing it with**: A Next.js app (React frontend + TypeScript API routes) deployed to Vercel. The degradation engine is reimplemented in TypeScript. Substitution lookup tables (character substitutions, region-to-linguistic-family mappings) are reconstructed from OFAC/sanctions domain knowledge — the original Excel files are not available.

**Degradation rules to implement** (from the original Python script):
- Remove spaces / Add spaces between characters
- Word order swap (e.g., `SMITH, JOHN` → `JOHN SMITH`)
- Character substitution (`O` → `0`, `I` → `1`, `A` → `@`, etc.)
- Regional/phonetic letter substitution (per linguistic family)
- Add/remove diacritics (`José` → `Jose`)
- Abbreviation (drop vowels, compress tokens)
- Truncation (drop tokens)
- Prefix/suffix removal (`Mr.`, `Jr.`, etc.)

**Synthetic dataset**: A built-in JSON dataset of realistic but fictional sanctioned names, covering all four entity types (Individual, Business, Vessel, Aircraft) and major linguistic regions (Arabic, Chinese, Cyrillic/Russian, Latin/European, etc.).

**Branding**: Crowe branded. Design language is defined in `C:\Users\RachurA\OneDrive - Crowe LLP\VS Code Programming Projects\CLAUDE.md`. UI polish is a dedicated later phase — functional implementation first.

## Constraints

- **Deployment**: Vercel — must work as a Vercel-hosted Next.js app
- **Tech stack**: Next.js (App Router), TypeScript, React — no separate backend service
- **Data**: Synthetic OFAC data only — no real SDN names or API calls to OFAC
- **Output**: CSV download (not Excel)
- **Timeline**: Demo-ready first, production-hardened later

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over separate Python backend | Single Vercel deployment, degradation logic is all string transforms easily done in TS | — Pending |
| Synthetic data only | Client-facing demo needs no compliance concerns from showing real sanctioned names | — Pending |
| Reconstruct substitution tables | Original Excel files unavailable; domain knowledge sufficient for demo accuracy | — Pending |
| CSV output over Excel | Simpler implementation, sufficient for demo; Excel adds complexity without value now | — Pending |

---
*Last updated: 2026-03-03 after initialization*
