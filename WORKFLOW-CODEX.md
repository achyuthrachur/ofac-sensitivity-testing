# WORKFLOW-CODEX

## Purpose

This is the canonical workflow contract for Codex in this repo.

Read this file first.

Then read:
1. `HANDOFF.md` if it exists
2. `WORKFLOW-OFAC-PROJECT.md`
3. `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md` when the task includes visual work, redesign, motion, onboarding, or user-supplied UI elements

If an older workflow file conflicts with this file, this file wins.

---

## Canonical Precedence

Use this precedence order:
1. repo truth
2. explicit user instruction
3. `WORKFLOW-CODEX.md`
4. `WORKFLOW-OFAC-PROJECT.md`
5. `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`
6. repo-local skills in `skills/`
7. compatibility or legacy docs

Older files are compatibility-only unless they explicitly state otherwise.

---

## Required Startup Sequence

At the start of any Codex task in this repo:
1. read `WORKFLOW-CODEX.md`
2. read `HANDOFF.md` if present
3. read `WORKFLOW-OFAC-PROJECT.md`
4. read the relevant repo-local skills under `skills/`
5. if the task is visual, motion-related, onboarding-related, or component-related, read `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`
6. inspect the specific repo files needed for the task

Do not start from older prompts or stale instructions unless they are explicitly referenced as artifacts.

---

## Repo-Local Skill Pack

The authoritative repo-local skills are:
- `skills/codex-repo-workflow/SKILL.md`
- `skills/ofac-project-execution/SKILL.md`
- `skills/ofac-visual-element-procurement/SKILL.md`
- `skills/ofac-crowe-ui-adaptation/SKILL.md`

If a task matches one of these, use it.

Do not depend on missing external skill-path references.

---

## Default Operating Rules

- Keep deterministic engineering work autonomous.
- Keep high-judgment visual and motion work user-approved.
- Maintain `HANDOFF.md` continuously for multi-step or multi-phase work.
- Auto-compact aggressively when context gets crowded.
- Resume from `HANDOFF.md` instead of rediscovering context.
- Do not silently ship generic UI.
- Do not source external UI components on the user's behalf unless explicitly asked.

---

## Visual and Motion Rule

When the task affects product feel, hierarchy, onboarding, narrative framing, motion, or component selection:
- inspect current UI first
- identify the exact element need
- ask the user before major visual direction changes
- if the user is sourcing components, switch into element-procurement mode

Element-procurement mode means:
- Codex identifies the element needed
- Codex states requirements and integration constraints
- the user selects and brings back the actual component
- Codex adapts it to the repo and Crowe brand

Do not suggest `npx` commands, slugs, or source libraries unless the user explicitly asks for suggestions.

---

## Verification Rules

For implementation work:
- run the appropriate repo checks
- prefer `npm run build`
- run `npm run test` when behavior, types, exported constants, or reusable UI logic changes
- run `npm run lint` when appropriate, but document unrelated pre-existing failures instead of sprawling

For workflow-only documentation changes:
- verify referenced files actually exist
- verify compatibility docs point at the canonical stack
- verify no canonical doc points to missing paths

---

## Handoff Rules

`HANDOFF.md` must include:
- current phase or task state
- canonical docs read
- repo-local skills loaded
- completed work
- files changed
- commands run and outcomes
- blockers
- UI and motion decisions confirmed by the user
- exact next action

Before compacting:
1. update `HANDOFF.md`
2. record the current decision state
3. record the next exact action

---

## Compatibility Entry Points

These files may still exist, but they are not canonical:
- `CLAUDE.md`
- `CURSOR-AUDIT-PROMPT.md`
- `CODEX-GLOBAL-DEVELOPMENT-INSTRUCTIONS.md`
- `CODEX-MVP-IMPLEMENTATION-INSTRUCTIONS.md`
- `CODEX-OFAC-VISUAL-SOURCING-INSTRUCTIONS.md`
- `UX-FIXES-FRESH-SESSION.md`
- `OFAC-UI-SOURCING-LIST.md`
- `OFAC-UI-INSTALL-COMMANDS.md`

They should point back to the canonical workflow or be treated as archived artifacts.

---

## Success Condition

The workflow is being followed correctly when:
- Codex starts from the canonical stack
- repo-local skills exist and are usable
- visual work uses element-procurement mode
- older workflow files are no longer treated as peers
