---
name: ofac-visual-element-procurement
description: Define exact UI element needs for OFAC visual work when the user is the sourcing layer. Use when redesigning, differentiating, or upgrading OFAC UI, motion, onboarding, navigation, results, guide surfaces, or any other visual area where Codex must specify the needed element and wait for the user to supply the component.
---

# OFAC Visual Element Procurement

Read:
1. `WORKFLOW-CODEX.md`
2. `WORKFLOW-OFAC-PROJECT.md`
3. `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`
4. `HANDOFF.md` if present

## Core Rule

Codex identifies element needs.
The user sources components.
Codex does not proactively source components.

## Do Not Provide Unless Asked

- source-library suggestions
- named slugs
- preview URLs
- install commands
- browsing instructions

## Required Output

Create and maintain `OFAC-UI-ELEMENT-REQUEST-LIST.md`.

Each element entry must include:
- element name
- target surface
- current weakness
- exact UX job
- visual role
- required behavior
- motion expectations
- Crowe constraints
- integration note
- priority
- status: `awaiting user-supplied component`

## Required Surfaces

At minimum evaluate:
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

## Handoff

Record in `HANDOFF.md`:
- which elements are requested
- which elements are awaiting user-supplied components
- which elements remain custom by design
- the exact next requested element or integration step
