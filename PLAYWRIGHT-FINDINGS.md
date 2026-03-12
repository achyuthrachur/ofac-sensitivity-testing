# Playwright Findings

## Route Tested
- `/tool`

## User Flows Tested
- Simulation tab: default state, run state, tooltip hover, chart-point selection, recalibration input
- Screening tab: pre-run loaded-list state, post-run results state

## Commands Run
- `npm run dev -- --port 3001`
- Playwright Chromium exploration against `http://127.0.0.1:3001/tool`

## Screenshots Captured
- `.playwright-artifacts/ofac-exploration/simulation-default.png`
- `.playwright-artifacts/ofac-exploration/simulation-after-run.png`
- `.playwright-artifacts/ofac-exploration/simulation-tooltip.png`
- `.playwright-artifacts/ofac-exploration/simulation-recalibration.png`
- `.playwright-artifacts/ofac-exploration/screening-pre-run.png`
- `.playwright-artifacts/ofac-exploration/screening-post-run.png`

## Simulation Findings
- The feature language says "over time" and "catch-rate decay", but the visible chart still frames the horizontal progression as `Snapshot`.
- The chart summary says `Baseline preset across 30 snapshots`, which reinforces sequence rather than elapsed time.
- The tooltip says `Snapshot 17`, not a demo-friendly cadence label, so a first-time user learns sequence only.
- The recalibration control says `Mark the snapshot where the model would be tuned again`, which keeps the same ambiguity.
- Clicking a point updates the waterfall header to `Snapshot N - Entity Breakdown`, so the selected state is functional but still snapshot-bound.
- The visible story is understandable as staged degradation, but not as elapsed time. This weakens the demo narrative.

## Screening Findings
- Pre-run state shows only the badge `50 names loaded` and the `Run Screening` button.
- No loaded names are visible before the run. The first preloaded client name is not present in the DOM text before screening.
- There is no compact queue, preview card, or expand/collapse affordance in the input workspace before screening starts.
- After running, the results surface immediately exposes a usable queue in the left pane, including real names and a `Change names` affordance.
- The post-run queue provides a clear design reference for the missing pre-run preview: the product already supports queue-oriented review once screening finishes.

## What The User Sees
- Simulation:
  - a chart with `Snapshot` as the cadence language
  - a tooltip that reports `Snapshot N`
  - a recalibration input tied to snapshot numbers
- Screening:
  - a count badge showing how many names are loaded
  - no pre-run way to verify which names those are
  - a much richer queue only after screening completes

## What The Code Currently Does
- [SimulationPane.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/SimulationPane.tsx) uses snapshot-index language in headings, helper text, and recalibration copy.
- [SimulationChart.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/SimulationChart.tsx) labels the X-axis as `Snapshot` and the tooltip as `Snapshot {label}`.
- [engine.ts](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/lib/simulation/engine.ts) models pure snapshot indices, not a visible time unit.
- [InputPanel.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/screening/InputPanel.tsx) exposes the loaded-name count but not a preview of the names.
- [ScreeningResultsPane.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/screening/ScreeningResultsPane.tsx) and [ScreeningNameList.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/screening/ScreeningNameList.tsx) show the queue only after the screening run.

## Implementation Recommendation
- Screening can be fixed immediately with a low-risk UI addition in [InputPanel.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/screening/InputPanel.tsx):
  - keep the count badge
  - add a compact preview card showing the first few loaded names
  - add overflow text such as `+42 more`
  - keep it presentation-only and avoid changing screening logic
- Simulation should be reframed around one explicit visible cadence across:
  - chart axis
  - tooltip
  - summary copy
  - recalibration control
  - selected snapshot detail label

## User Decision
- Visible Simulation cadence confirmed as `Review cycle`

## Implementation Plan

### Issue
- Simulation progression is sequence-only, not time-framed.

### Files To Edit
- [SimulationPane.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/SimulationPane.tsx)
- [SimulationChart.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/SimulationChart.tsx)
- Possibly [WaterfallTable.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/WaterfallTable.tsx) if the selected-detail header should mirror the same visible unit

### Exact Change
- Introduce one visible cadence label and use it consistently for axis copy, tooltip copy, recalibration copy, and selected detail text while leaving the engine snapshot indices intact internally.

### Risk Level
- Medium

### User Interview Required
- No longer required; user confirmed `Review cycle`

### Issue
- Screening input does not let the user verify loaded names before clicking `Run Screening`.

### Files To Edit
- [InputPanel.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/screening/InputPanel.tsx)
- Possibly [page.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/app/tool/page.tsx) only if extra props are needed

### Exact Change
- Add a compact loaded-name preview surface under the import workspace that shows the first few names, the total count, and overflow text. Keep the count badge and avoid changing screening logic.

### Risk Level
- Low

### User Interview Required
- No

## Implementation Outcome
- Implemented a pre-run loaded-name preview in [InputPanel.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/screening/InputPanel.tsx) and wired the loaded list from [page.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/app/tool/page.tsx).
- Implemented `Review cycle` framing across [SimulationPane.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/SimulationPane.tsx), [SimulationChart.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/SimulationChart.tsx), [WaterfallTable.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/components/simulation/WaterfallTable.tsx), and [display.ts](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/lib/simulation/display.ts).
- Updated the Simulation guide card copy in [page.tsx](C:/Users/RachurA/AI%20Coding%20Projects/OFAC%20Sensitivity%20Testing/src/app/tool/page.tsx) so the supporting instructions match the visible framing.

## Verification
- Playwright exploration artifacts: `.playwright-artifacts/ofac-exploration/`
- Playwright verification artifacts: `.playwright-artifacts/ofac-verification/`
- Verified in Chromium:
  - Simulation tooltip shows `Review cycle 18`
  - chart click updates the detail header to `Review cycle 18 - Entity Breakdown`
  - recalibration copy uses review-cycle framing
  - Screening pre-run preview shows loaded names before the run
- `npm run lint` passed
- `npm run test` passed
- `npm run build` passed
