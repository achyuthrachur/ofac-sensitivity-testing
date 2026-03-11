# CLAUDE.md

Compatibility adapter for Claude-oriented sessions.

This file is not the canonical workflow authority.

## Canonical Docs

Read these first:
1. `WORKFLOW-CODEX.md`
2. `HANDOFF.md` if it exists
3. `WORKFLOW-OFAC-PROJECT.md`
4. `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md` for visual or component work

## Repo-Local Skills

Use these real repo-local skills:
- `skills/codex-repo-workflow/SKILL.md`
- `skills/ofac-project-execution/SKILL.md`
- `skills/ofac-visual-element-procurement/SKILL.md`
- `skills/ofac-crowe-ui-adaptation/SKILL.md`

## Project Notes

- Stack: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui, Anime.js v4, motion v12, iconsax-reactjs
- `data/sdn.json` is imported via `@data/*`
- `CANONICAL_RULE_ORDER` remains authoritative
- TanStack virtualizer still needs explicit pixel widths on table cells
- Tailwind v4 tokens belong in the `@theme` inline block
- motion is `motion/react`, not `framer-motion`, unless a specific sourced component truly requires otherwise

## Compatibility Rules

- Do not treat older workflow docs as peers to the canonical workflow stack.
- Use `HANDOFF.md` for resume state.
- Keep deterministic engineering autonomous.
- Ask before major visual, motion, onboarding, hierarchy, or narrative changes.
- For OFAC visual work, use element-procurement mode: identify the element needed, then wait for the user to supply the chosen component.
