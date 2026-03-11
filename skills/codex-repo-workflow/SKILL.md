---
name: codex-repo-workflow
description: Operate Codex inside this repo using the canonical workflow stack. Use when starting or resuming work in this project, when handling HANDOFF.md, when deciding which workflow docs are authoritative, or when replacing legacy workflow instructions with the canonical repo-local process.
---

# Codex Repo Workflow

Read `WORKFLOW-CODEX.md` first.

Then:
1. Read `HANDOFF.md` if it exists.
2. Read `WORKFLOW-OFAC-PROJECT.md`.
3. Read `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md` if the task includes UI, motion, onboarding, visual hierarchy, or user-supplied components.

Use this skill to keep the repo workflow self-contained.

## Rules

- Treat `WORKFLOW-CODEX.md` as the canonical workflow contract.
- Treat old workflow docs as compatibility-only unless they explicitly say otherwise.
- Maintain `HANDOFF.md` for multi-step tasks.
- Auto-compact when context gets crowded.
- Resume from `HANDOFF.md` instead of rediscovering the repo from scratch.
- Do not depend on missing external skill paths.

## HANDOFF Requirements

Ensure `HANDOFF.md` includes:
- current phase or task state
- canonical docs read
- repo-local skills loaded
- completed work
- files changed
- commands run and outcomes
- blockers
- confirmed UI and motion decisions
- exact next action

## Verification

For workflow changes:
- verify that referenced files exist
- verify that compatibility docs point back to canonical docs
- verify that no canonical doc points to missing paths
