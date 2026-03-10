# CLAUDE.md — OFAC Sensitivity Testing
> Project-level overrides only. Global standards in parent CLAUDE.md and .claude/skills/.

## PROJECT
- **Live URL:** https://ofac-sensitivity-testing.vercel.app
- **Repo:** https://github.com/achyuthrachur/ofac-sensitivity-testing
- **Stack:** Next.js 16 · TypeScript strict · Tailwind v4 · shadcn/ui · Anime.js v4 · motion v12 · iconsax-reactjs
- **Brand:** Crowe — load `.claude/skills/branding/SKILL.md` for all UI work

## KEY TECHNICAL FACTS
- `data/sdn.json` imported via `@data/*` tsconfig alias
- `CANONICAL_RULE_ORDER` is authoritative execution sequence — never reorder
- TanStack virtualizer requires explicit px width on every `<th>` and `<td>`
- `NODE_TLS_REJECT_UNAUTHORIZED=0` required for Vercel CLI + shadcn CLI on Crowe network
- Tailwind v4: color tokens must be in `@theme` inline block (not just `:root`)
- Anime.js v4: use `onEnterForward` (not `onEnter`) for play-once scroll reveals
- motion v12 (`motion/react`) — not framer-motion
- `next/font/google` removed — Crowe TLS proxy blocks googleapis.com at build time

## CURRENT STATE
- v2.0 shipped (landing page, tool layout, icons, animations, React Bits UI)
- v3.0 Screening Engine in progress — see `.planning/ROADMAP.md` for phase status
- Phases 15–18 complete. Next: Phase 19 (Dashboard + Cost of Miss)

## KICKOFF PROMPT
```
Read .planning/ROADMAP.md and .planning/PROJECT.md before writing any code.
Load .claude/skills/frontend/SKILL.md and .claude/skills/branding/SKILL.md.

Current work: v3.0 Screening Engine — Phase 19 (Dashboard + Cost of Miss).
Read the Phase 19 section of ROADMAP.md in full.
Build what's listed. Verify all success criteria pass before stopping.

Do NOT spawn subagents. Do NOT rewrite entire files for small changes.
Run npm run build after every significant change.
```

## AGENT RULES
- Do NOT spawn subagents unless explicitly instructed
- Do NOT rewrite entire files — make targeted edits
- Run `npm run build` after every change to catch TypeScript errors early
