# HANDOFF.md

## Current phase
Screening layout cleanup complete / spacing and scroll issues reproduced and fixed

## Canonical docs read
- `WORKFLOW-CODEX.md`
- `WORKFLOW-OFAC-PROJECT.md`
- `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`
- `PLAYWRIGHT-OFAC-EXPLORATION-PLAN.md`

## Repo-local skills loaded
- `skills/codex-repo-workflow/SKILL.md`
- `skills/ofac-project-execution/SKILL.md`
- `skills/ofac-visual-element-procurement/SKILL.md`
- `skills/ofac-crowe-ui-adaptation/SKILL.md`
- external session skills: `qa`, `architecture`

## Completed work
- read the Playwright exploration plan plus the current Simulation and Screening implementation files
- started a local dev server and ran Playwright Chromium exploration against `/tool`
- captured Simulation evidence for default state, run state, tooltip state, chart-point selection, and recalibration state
- captured Screening evidence for pre-run loaded-list state and post-run queue state
- created `PLAYWRIGHT-FINDINGS.md` with findings, recommended fix direction, and the implementation plan
- implemented the low-risk Screening fix by adding a pre-run loaded-name preview to the input workspace
- verified in Playwright that the preview is visible before the run and that loaded names are now inspectable pre-run
- confirmed the user-selected Simulation cadence as `Review cycle`
- implemented the Simulation framing updates across chart, tooltip, recalibration copy, and selected-detail surfaces
- verified in Playwright that the tooltip and selected-detail header now use `Review cycle`
- ran `npm run lint`, `npm run test`, and `npm run build` successfully
- reproduced the Screening-mode regression at a `1440x900` viewport:
  - the active Screening tab content exceeded the panel height
  - wheel scroll affected the window instead of the active tab panel
  - the `Run Screening` CTA started below the viewport and was effectively trapped
- cleaned up the Screening pre-run layout so the loaded-name preview sits beside the import surface on wide screens instead of pushing the CTA down
- changed the Screening tab container to scroll internally, so the user can reach the preview and CTA within the active tab
- replaced the blank CTA row with a clearer `Queue ready for screening` action surface
- verified in Playwright that the tab now scrolls internally and the `Run Screening` button becomes reachable after wheel scroll
- upgraded the loaded synthetic-name preview from wrapped chips to a readable list-style queue with row numbering, a synthetic-demo source pill, and an explicit `View all 50 names` state
- verified in Playwright that the expanded preview contains the full synthetic queue, including the final loaded name

## Files changed
- `PLAYWRIGHT-FINDINGS.md`
- `HANDOFF.md`
- `src/components/screening/InputPanel.tsx`
- `src/app/tool/page.tsx`
- `src/components/simulation/SimulationPane.tsx`
- `src/components/simulation/SimulationChart.tsx`
- `src/components/simulation/WaterfallTable.tsx`
- `src/lib/simulation/display.ts`
- `src/components/screening/InputPanel.tsx`
- `src/app/tool/page.tsx`

## Commands run and outcomes
- `Get-Content PLAYWRIGHT-OFAC-EXPLORATION-PLAN.md`
  - confirmed the execution requirements and required deliverables
- `Get-Content` on workflow docs, repo-local skills, and the active Simulation / Screening components
  - grounded the plan in the current codebase before browser work
- `npm run dev -- --port 3001`
  - local dev server started successfully for Playwright exploration
- Playwright Chromium exploration on `http://127.0.0.1:3001/tool`
  - screenshots saved under `.playwright-artifacts/ofac-exploration/`
  - JSON notes saved to `.playwright-artifacts/ofac-exploration/findings.json`
- key evidence captured:
  - Simulation still uses `Snapshot` framing in chart, tooltip, and recalibration copy
  - Screening pre-run state shows only `50 names loaded` with no list preview
  - Screening post-run state exposes a result queue that can inform the preview design
- targeted Playwright re-check after the Screening fix
  - confirmed `Loaded queue preview` is visible before the run
  - confirmed a real preloaded name is present in the pre-run DOM text
  - screenshot saved to `.playwright-artifacts/ofac-exploration/screening-pre-run-after-fix.png`
- user cadence confirmation
  - `Review cycle` selected for the Simulation framing
- final Playwright verification
  - verification artifacts saved under `.playwright-artifacts/ofac-verification/`
  - confirmed tooltip text `Review cycle 18`
  - confirmed selected detail header `Review cycle 18 - Entity Breakdown`
- screening layout debug run
  - artifacts saved under `.playwright-artifacts/screening-layout-debug/`
  - failing-state metrics showed `tabScrollHeight > tabClientHeight` with `tabScrollTop = 0` and window scroll changing instead of tab scroll
  - fixed-state metrics showed `tabScrollTop = 121` after wheel input, proving the active tab now handles scroll correctly
- screening preview polish run
  - artifacts saved under `.playwright-artifacts/screening-polish/`
  - confirmed the collapsed preview shows the first synthetic names in a readable table-style list
  - confirmed the expanded `View all 50 names` state contains the full loaded queue, including `ATLANTIC SPIRIT MARITIME`
- `npm run lint`
  - passed
- `npm run test`
  - passed
- `npm run build`
  - passed

## Blockers
- none for this pass

## UI and motion decisions confirmed by the user
- Codex should not source components by default
- Codex should identify exact element needs and wait for user-supplied components
- the canonical visual procurement artifact should be a master element-request list

## Exact next action
1. review the worktree and decide whether to keep or prune the Playwright artifact/log files before committing
2. if UX cleanup continues, inspect `/tool` at additional desktop heights and tighten any remaining crowded surfaces using the same browser-first workflow
