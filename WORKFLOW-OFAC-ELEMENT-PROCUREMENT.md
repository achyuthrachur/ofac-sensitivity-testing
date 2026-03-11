# WORKFLOW-OFAC-ELEMENT-PROCUREMENT

## Purpose

This file defines the required workflow for OFAC visual work when the user is the sourcing layer.

Codex identifies the exact UI element needed.
The user finds the specific component.
Codex then adapts and integrates the user-supplied component.

This is the canonical replacement for source-suggestion workflows in this repo.

---

## Non-Negotiable Rule

Codex must not source components on the user's behalf unless the user explicitly asks.

That means Codex must not proactively provide:
- source-library suggestions
- component slugs
- preview URLs
- `npx` commands
- browsing recommendations

Codex may only provide those if the user explicitly requests them.

---

## Required Workflow

1. Inspect the current OFAC site
2. Segment the site into major visual surfaces
3. Identify weak or generic surfaces
4. Translate each weak surface into an exact element request
5. Write `OFAC-UI-ELEMENT-REQUEST-LIST.md`
6. Wait for the user to bring back the chosen component
7. Only after that, integrate and Crowe-adapt the component

Do not skip the element-request step.

---

## Required Site Surfaces

At minimum, inspect and evaluate:
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

## What Codex Must Ask the User

Codex should ask the user about:
- desired ambition level for each surface
- whether a surface should feel restrained, premium, or demo-forward
- whether motion should be light, medium, or stronger
- whether a surface should communicate trust, education, conversion, or product sophistication

Codex should not stop at vague style questions.
Codex should translate the discussion into exact element needs.

---

## Required Output File

Create and maintain:
- `OFAC-UI-ELEMENT-REQUEST-LIST.md`

This is a single master list.
It is not grouped by source library.
It is not a sourcing suggestion sheet.

Each entry must include:
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

### Example Entry

```md
## Element: Landing Hero Background Treatment
- Surface: `/`
- Current weakness: hero feels visually flat and too conventional
- UX job: create atmosphere and perceived sophistication without reducing readability
- Visual role: premium background layer behind hero headline and CTA
- Required behavior: support readable foreground text and preserve CTA emphasis
- Motion expectations: subtle ambient movement or depth only
- Crowe constraints: indigo/amber-led, no generic SaaS gradient look
- Integration note: should wrap or sit behind the existing hero structure
- Priority: high
- Status: awaiting user-supplied component
```

---

## Integration Rules After User Returns a Component

Once the user supplies a component, Codex must:
- validate that it fits the requested element need
- adapt all palette usage to Crowe standards
- remove demo-snippet defaults
- align spacing, typography, contrast, and motion with the product
- integrate it cleanly into the existing route/component structure

Codex must treat sourced UI as raw material, not final design.

---

## Handoff Rules

`HANDOFF.md` must record:
- which surfaces have been translated into element requests
- which elements are still awaiting user-supplied components
- which elements have approved supplied components
- which areas remain custom by design
- exact next requested element or next integration step

---

## Success Condition

This workflow is complete only when:
- `OFAC-UI-ELEMENT-REQUEST-LIST.md` exists
- the required surfaces have been translated into exact element requests
- Codex is waiting for user-supplied components before integration

