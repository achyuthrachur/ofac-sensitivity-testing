---
name: ofac-project-execution
description: Execute work in the OFAC Sensitivity Testing repo using project-specific constraints. Use for implementation, documentation, verification, or planning work that affects the OFAC product surfaces, build/test workflow, Crowe quality bar, or project-specific guardrails.
---

# OFAC Project Execution

Read:
1. `WORKFLOW-CODEX.md`
2. `WORKFLOW-OFAC-PROJECT.md`
3. `HANDOFF.md` if present

## Project Rules

- Treat this repo as a Crowe-branded product, not a generic demo.
- Keep deterministic engineering work autonomous.
- Require user approval for major visual, motion, onboarding, hierarchy, and narrative decisions.
- Do not silently preserve generic UI as the default solution.
- Do not fabricate missing brand assets.
- Do not change core screening or simulation logic unless explicitly asked.

## Visual Work

If the task is visual:
- also load `skills/ofac-visual-element-procurement/SKILL.md`
- also load `skills/ofac-crowe-ui-adaptation/SKILL.md`

## Verification

For implementation work:
- run `npm run build`
- run `npm run test` when behavior, shared UI logic, or exported constants change
- run `npm run lint` when appropriate and document unrelated failures instead of sprawling

## Active Project Artifacts

Use as active:
- `HANDOFF.md`
- `DIAGNOSIS.md`
- `OFAC-UI-ELEMENT-REQUEST-LIST.md`

Treat as historical or compatibility-only:
- `UX-FIXES-FRESH-SESSION.md`
- `OFAC-UI-SOURCING-LIST.md`
- `OFAC-UI-INSTALL-COMMANDS.md`
