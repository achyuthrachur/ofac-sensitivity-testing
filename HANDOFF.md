# HANDOFF.md
> Written by Claude Code at the end of each session.
> Read at the start of the next session to resume without re-explaining context.
> Delete contents after reading — keep this file lean.

---

## STATUS
Phase 19 — Dashboard + Cost of Miss. Phases 18 + 18.1–18.4 complete and committed.
Build is green. 8 styling fixes are pending commit (see below).

## WHAT WAS JUST COMPLETED
- Phases 18.1–18.4 fully built and committed (nav, education layer, empty states, help drawer)
- All 9 21st.dev components installed in src/components/ui/
- SiteNav, TermTooltip, SectionCallout, TierLegend, OnboardingBanner, HelpDrawer, HelpFab all wired
- ScreeningDashboard (tier counts, avg score, FP/FN) already built + wired into ScreeningResultsPane
- CostOfMissCalculator already built at src/components/shared/CostOfMissCalculator.tsx
- CostOfMissCalculator already rendered in ScreeningResultsPane right pane

## WHAT TO DO NEXT

### Step 1 — Commit 8 pending style fixes (5 minutes)
These are light-mode style corrections sitting uncommitted in the working tree:
```
src/components/education/OnboardingBanner.tsx
src/components/education/SectionCallout.tsx
src/components/education/TermTooltip.tsx
src/components/education/TierLegend.tsx
src/components/screening/ScreeningProgressBar.tsx
src/components/states/EmptyResultsState.tsx
src/components/states/EmptyScreeningState.tsx
src/components/states/EmptySimulationState.tsx
```
Commit message: `chore(ux): fix light-mode styles on education + state components`

### Step 2 — Verify Phase 19 is already complete
Both Phase 19 deliverables were built ahead of schedule:
- ScreeningDashboard: `src/components/screening/ScreeningDashboard.tsx` — DONE
- CostOfMissCalculator: `src/components/shared/CostOfMissCalculator.tsx` — DONE

Check the 3 Phase 19 success criteria from ROADMAP.md:
1. Dashboard shows total, per-tier counts, avg score, FP/FN — updates on threshold change ← verify
2. Entering a transaction value shows penalty (value × 4.0) as currency ← verify
3. CostOfMissCalculator is ONE shared component in both Screening and Simulation ← check SimulationPane

**Action:** Read `src/components/simulation/SimulationPane.tsx`. If CostOfMissCalculator is not
rendered there, add `<CostOfMissCalculator />` to it. Then mark Phase 19 complete in ROADMAP.md.

### Step 3 — Phase 20 (Export)
exportCsv() and exportPdf() may already be implemented in src/lib/exportUtils.ts.
Check that file before building anything new. CSV and PDF buttons already exist in
ScreeningResultsPane header bar. Verify they work end-to-end before calling Phase 20 done.

## OPEN QUESTIONS / BLOCKERS
- Confirm CostOfMissCalculator is wired into SimulationPane (likely missing — wasn't checked)
- 3 installed 21st.dev components are unused (animated-tooltip, floating-action-menu,
  tubelight-navbar) — this is intentional, custom implementations are used instead. Do NOT
  remove or replace them.

## FILES MOST RECENTLY TOUCHED
- src/components/screening/ScreeningResultsPane.tsx
- src/components/screening/ScreeningDashboard.tsx
- src/components/shared/CostOfMissCalculator.tsx
- src/components/simulation/SimulationPane.tsx (check this — may need CostOfMissCalculator)
- src/app/tool/page.tsx

## COMMANDS TO VERIFY CURRENT STATE
```
npm run build
```
(Build passes clean as of this handoff. No test suite failures known.)
