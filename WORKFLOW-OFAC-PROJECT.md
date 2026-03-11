# WORKFLOW-OFAC-PROJECT

## Purpose

This file defines how Codex should operate on the OFAC Sensitivity Testing repo specifically.

It is project-specific and should be read after `WORKFLOW-CODEX.md`.

---

## Product Framing

Treat this repo as a Crowe-branded product experience, not a generic demo.

Primary product surfaces:
- landing page `/`
- tool page `/tool`
- guide page `/guide`

Primary goals:
- clarity
- trust
- premium decision-support feel
- brand consistency
- purposeful motion
- non-generic UI

---

## Project Truth Files

Use these as active project artifacts:
- `HANDOFF.md`
- `DIAGNOSIS.md`
- `OFAC-UI-ELEMENT-REQUEST-LIST.md`

Use these as historical or compatibility artifacts only:
- `UX-FIXES-FRESH-SESSION.md`
- `OFAC-UI-SOURCING-LIST.md`
- `OFAC-UI-INSTALL-COMMANDS.md`

---

## Execution Rules

Codex must:
- read the canonical workflow docs first
- read `HANDOFF.md` before resuming work
- operate phase-by-phase on large tasks
- keep deterministic engineering work autonomous
- require user approval for major visual, motion, onboarding, hierarchy, and narrative decisions
- aggressively maintain `HANDOFF.md`
- compact when context gets tight
- verify with build/test/lint as appropriate

Codex must not:
- silently preserve generic UI because it is already implemented
- silently source components on the user's behalf
- invent missing brand assets
- follow missing skill paths

---

## Repo-Local Skills to Load

For normal project work, load:
- `skills/codex-repo-workflow/SKILL.md`
- `skills/ofac-project-execution/SKILL.md`

For visual or UI adaptation work, also load:
- `skills/ofac-visual-element-procurement/SKILL.md`
- `skills/ofac-crowe-ui-adaptation/SKILL.md`

---

## Engineering Guardrails

- `CANONICAL_RULE_ORDER` remains authoritative
- do not modify core screening or simulation engine behavior unless the user explicitly asks
- do not fabricate the Crowe logo assets if they are still missing
- do not expand visual work into uncontrolled redesign without user-approved direction

---

## Visual Quality Bar

For this project, generic UI is unacceptable.

Codex should favor:
- intentional composition
- clear hierarchy
- strong spacing
- premium but restrained motion
- surfaces that feel specific to this product

Codex should avoid:
- default alert-box onboarding
- plain stacked cards as the final design language
- weak or absent motion on key storytelling surfaces
- source-library demo styling left unadapted

---

## Element-Procurement Rule

When the user is sourcing components:
- Codex identifies the element need
- Codex writes the requirement
- the user finds the actual component
- Codex integrates and adapts it afterward

Codex must not browse for components, suggest slugs, or propose install commands unless the user asks for that explicitly.

Use `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md` for that mode.

---

## Required Surface Coverage for Visual Work

When visual work is in scope, Codex must evaluate at least:
- nav
- landing hero
- landing background treatment
- workflow/story surface
- proof/stats surface
- tool left rail
- onboarding module
- tab/progression treatment
- results CTA/progression surface
- methodology surface
- screening input surface
- screening results surface
- simulation surface
- guide sidebar
- guide content modules
- empty states
- help/drawer
- shared motion language

---

## Validation Rules

For workflow changes:
- verify all referenced files exist
- verify adapter docs point to canonical docs
- verify `CLAUDE.md` contains no broken skill-path references

For project implementation:
- run `npm run build`
- run `npm run test` when behavior or shared UI logic changes
- run `npm run lint` when appropriate and record unrelated failures instead of sprawling

---

## Success Condition

This project workflow is correct when:
- Codex starts from canonical docs
- the repo-local skills are sufficient to operate without missing external skill paths
- visual work stops at element requests until the user supplies components
- runtime work preserves Crowe adaptation and product-specific quality
