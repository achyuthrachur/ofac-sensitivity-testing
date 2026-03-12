# Playwright Exploration and Fix Plan

## Purpose

Use Playwright to inspect the live behavior of the OFAC demo site and then drive a fix pass for two specific UX problems:

1. The simulation experience shows degradation progression, but it does not clearly communicate the time frame over which names are degrading.
2. The screening workspace shows a count such as `50 names loaded`, but it does not expose a useful preview of the loaded names.

This document is for an execution agent. The agent must use Playwright to inspect the product before changing code.

---

## Required Reading Before Work

Read these files first:

- `WORKFLOW-CODEX.md`
- `WORKFLOW-OFAC-PROJECT.md`
- `WORKFLOW-OFAC-ELEMENT-PROCUREMENT.md`
- `HANDOFF.md`
- `src/app/tool/page.tsx`
- `src/components/simulation/SimulationPane.tsx`
- `src/components/simulation/SimulationChart.tsx`
- `src/components/screening/InputPanel.tsx`
- `src/components/screening/ScreeningResultsPane.tsx`
- `src/components/screening/ScreeningNameList.tsx`

If major UI or visualization decisions are required, interview the user before implementing them.

---

## Known Current State

### Simulation tab

Current implementation details:

- `SimulationChart.tsx` renders the X-axis as `Snapshot`.
- The tooltip currently says `Snapshot {label}`.
- `SimulationPane.tsx` talks about performance changing "over time" and "evasion velocity", but the chart does not translate snapshots into a real or demo-friendly time frame.
- The recalibration input is also keyed to snapshot index, not to a visible time unit.

Current UX risk:

- A user can tell that the chart progresses through stages, but not what those stages mean in elapsed time.
- This weakens the demo because the story is "how names degrade over time" rather than "how names degrade over numbered snapshots."

### Screening tab

Current implementation details:

- `InputPanel.tsx` shows a summary badge like `50 names loaded`.
- It does not show the actual names in that loaded list.
- The detailed list only becomes visible later in `ScreeningResultsPane.tsx`, after screening has been run.

Current UX risk:

- A user cannot quickly confirm what was loaded before running the screening process.
- This makes the input stage feel opaque and reduces trust in the data being used for the demo.

---

## Playwright Goals

Use Playwright to answer these questions with screenshots and notes:

1. On the Simulation tab, what exactly would a first-time user think the X-axis means?
2. Does the chart visually imply time, or only sequence?
3. Does the tooltip help explain the timeline, or does it reinforce ambiguity?
4. Is the recalibration interaction understandable without knowing what a snapshot represents?
5. On the Screening tab, after names are loaded, can a user verify the loaded list before clicking `Run Screening`?
6. Is the `names loaded` badge useful as-is, or does it need to become a count-plus-preview control?
7. What is the lowest-risk UI change that makes both areas understandable without adding clutter?

---

## Playwright Exploration Tasks

### 1. Start the app

Run the local app and confirm `/tool` loads.

Use Playwright against the local environment, not only against production.

### 2. Simulation investigation

Using Playwright:

1. Open `/tool`.
2. Switch to `Simulation`.
3. Capture a full screenshot of the default simulation state before running.
4. Run the simulation.
5. Capture a full screenshot of the rendered chart.
6. Hover multiple chart points and capture tooltip screenshots.
7. Click several chart points and inspect whether the selected state becomes clearer.
8. Enter a recalibration point and capture the resulting state.
9. Record exactly what the chart is communicating today:
   - axis label
   - tooltip label
   - legend wording
   - any text around the chart that implies time or cadence

### 3. Screening investigation

Using Playwright:

1. Open `/tool`.
2. Switch to `Screening Mode`.
3. Use the existing preloaded list if it is already present, or load names through the available input path.
4. Capture the state where the UI shows only the count badge, such as `50 names loaded`.
5. Verify whether there is any pre-run way to inspect the loaded names.
6. If there is no such preview, capture the empty gap where that affordance should likely exist.
7. Run screening and compare the post-run list experience to the pre-run input experience.
8. Record whether the existing post-run queue can inform the pre-run preview design.

### 4. Deliver an evidence-backed diagnosis

After Playwright exploration, write down:

- what is confusing
- what is missing
- what the user sees
- what the code currently does
- what should change

Do not jump straight to code.

---

## Required Deliverables

Create or update these artifacts before implementing:

### 1. `HANDOFF.md`

Add:

- commands run
- screenshots captured
- exact confusion points found in Playwright
- implementation recommendation
- any UI decisions that require user confirmation

### 2. `PLAYWRIGHT-FINDINGS.md`

Create this file at the repo root if it does not exist.

It must include:

- route tested
- user flow tested
- screenshots captured
- simulation findings
- screening findings
- implementation recommendation
- open questions for the user

### 3. Implementation plan section

In `PLAYWRIGHT-FINDINGS.md`, include a plan with:

- issue
- file(s) to edit
- exact change
- risk level
- whether user interview is required

---

## Expected Fix Direction

This is the expected direction unless Playwright proves otherwise.

### A. Simulation time-frame clarity

Likely fix target:

- `src/components/simulation/SimulationPane.tsx`
- `src/components/simulation/SimulationChart.tsx`

Likely solution shape:

- convert the simulation story from pure `snapshot index` language into an explicit time model
- expose the cadence clearly in chart labels, tooltip copy, and nearby explanatory text
- make the recalibration control align with the same visible time unit

Examples of acceptable outcomes:

- `Snapshot 4` becomes `Month 4`
- tooltip shows both `Snapshot 4` and `Month 4` if the simulation model still depends on snapshots internally
- surrounding text explains the cadence, for example:
  - one snapshot equals one month
  - one snapshot equals one quarter
  - one snapshot equals one review cycle

If multiple time models are visually reasonable, stop and interview the user before choosing one.

### B. Loaded-name preview

Likely fix target:

- `src/components/screening/InputPanel.tsx`

Likely solution shape:

- keep the count badge
- add a compact preview surface that shows a slice of loaded names before screening runs
- include an affordance for:
  - first few names
  - total count
  - optionally expand/collapse

Minimum acceptable outcome:

- user can see at least a preview of the loaded names before clicking `Run Screening`

Preferred outcome:

- a small, polished preview card under the input area showing:
  - first N loaded names
  - count summary
  - overflow message like `+42 more`

If the preview treatment requires a meaningful visual design choice, interview the user first.

---

## Implementation Rules

1. Use Playwright before changing code.
2. Do not guess about chart clarity without seeing the rendered state.
3. Keep deterministic engineering autonomous.
4. Interview the user before any major visualization framing choice or new UI component treatment.
5. Update `HANDOFF.md` before compacting.
6. After implementation, run:
   - `npm run build`
   - `npm run test` if touched files affect tests or type-driven expectations

---

## Acceptance Criteria

The work is complete when all of the following are true:

1. The Simulation tab clearly communicates elapsed time or review cadence, not just snapshot sequence.
2. A user can understand what a selected chart point represents in time.
3. The recalibration control uses the same visible framing as the chart.
4. The Screening tab shows a useful preview of the loaded names before the screening run starts.
5. The preview does not require the user to run screening just to verify input.
6. The implementation builds successfully.
7. Playwright findings are documented in `PLAYWRIGHT-FINDINGS.md`.

---

## Suggested Execution Order

1. Read the required files.
2. Run Playwright exploration.
3. Write `PLAYWRIGHT-FINDINGS.md`.
4. Decide whether user interview is needed for visualization framing or preview treatment.
5. Implement the fixes.
6. Run verification.
7. Update `HANDOFF.md`.

