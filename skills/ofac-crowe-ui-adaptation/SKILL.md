---
name: ofac-crowe-ui-adaptation
description: Adapt user-supplied UI components into the OFAC repo with Crowe branding, product-specific hierarchy, and restrained motion. Use after the user provides a component for a requested element, or when reworking existing UI so it no longer feels like an untouched library demo.
---

# OFAC Crowe UI Adaptation

Read:
1. `WORKFLOW-CODEX.md`
2. `WORKFLOW-OFAC-PROJECT.md`
3. `HANDOFF.md` if present

## Purpose

Treat sourced UI as raw material.

Do not leave any supplied component looking like an untouched demo snippet.

## Adaptation Rules

- Replace non-Crowe palette values.
- Align typography, spacing, contrast, and shadows with the product.
- Remove gimmicks that do not fit a premium Crowe decision-support experience.
- Keep motion purposeful and restrained unless the user explicitly approves a more expressive treatment.
- Preserve usability and readability over novelty.

## Integration Rules

- Fit the component into the existing route/component structure cleanly.
- Preserve product-specific semantics and copy tone.
- Avoid introducing unnecessary new dependencies or visual systems.
- Validate that the supplied component actually satisfies the requested element need before integrating it.

## Verification

After adaptation:
- run build/test checks appropriate to the touched code
- confirm the component now feels product-specific, not library-generic
- record adaptation outcomes in `HANDOFF.md`
