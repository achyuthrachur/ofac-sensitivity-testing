# HANDOFF.md

## Current phase
Workflow overhaul complete / canonical stack established and verified

## Canonical docs read
- `WORKFLOW-CODEX.md`
- `WORKFLOW-OFAC-PROJECT.md`
- `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`

## Repo-local skills loaded
- `skills/codex-repo-workflow/SKILL.md`
- `skills/ofac-project-execution/SKILL.md`
- `skills/ofac-visual-element-procurement/SKILL.md`
- `skills/ofac-crowe-ui-adaptation/SKILL.md`

## Completed work
- created the canonical Codex-first workflow stack
- created repo-local skills so the workflow is self-contained
- rewrote `CLAUDE.md` as a compatibility adapter pointing to the canonical docs and local skills
- rewrote `CURSOR-AUDIT-PROMPT.md` as a compatibility adapter
- converted older Codex workflow docs into explicit legacy files
- created `OFAC-UI-ELEMENT-REQUEST-LIST.md` as the canonical visual procurement artifact
- marked `OFAC-UI-SOURCING-LIST.md` and `OFAC-UI-INSTALL-COMMANDS.md` as legacy artifacts

## Files changed
- `WORKFLOW-CODEX.md`
- `WORKFLOW-OFAC-PROJECT.md`
- `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`
- `skills/codex-repo-workflow/SKILL.md`
- `skills/ofac-project-execution/SKILL.md`
- `skills/ofac-visual-element-procurement/SKILL.md`
- `skills/ofac-crowe-ui-adaptation/SKILL.md`
- `CLAUDE.md`
- `CURSOR-AUDIT-PROMPT.md`
- `CODEX-GLOBAL-DEVELOPMENT-INSTRUCTIONS.md`
- `CODEX-MVP-IMPLEMENTATION-INSTRUCTIONS.md`
- `CODEX-OFAC-VISUAL-SOURCING-INSTRUCTIONS.md`
- `UX-FIXES-FRESH-SESSION.md`
- `OFAC-UI-ELEMENT-REQUEST-LIST.md`
- `OFAC-UI-SOURCING-LIST.md`
- `OFAC-UI-INSTALL-COMMANDS.md`
- `HANDOFF.md`

## Commands run and outcomes
- `git status --short`
  - confirmed unrelated runtime changes existed and were left untouched
- `Get-Content` on current workflow docs and sourcing artifacts
  - used to ground the rewrite in the actual repo state
- file existence verification
  - confirmed canonical docs, canonical element list, and all repo-local skills exist
- reference verification via `rg`
  - confirmed the canonical stack no longer contains active missing skill-path references
  - confirmed the canonical stack only mentions slugs or `npx` commands as prohibitions, not as default workflow instructions

## Blockers
- none for the workflow rewrite itself
- unrelated runtime changes remain in the workspace and were intentionally left untouched

## UI and motion decisions confirmed by the user
- Codex should not source components by default
- Codex should identify exact element needs and wait for user-supplied components
- the canonical visual procurement artifact should be a master element-request list

## Exact next action
If work resumes, use the new canonical stack for all future repo tasks:
1. `WORKFLOW-CODEX.md`
2. `WORKFLOW-OFAC-PROJECT.md`
3. `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md` when visual work is in scope
4. the repo-local skills under `skills/`
