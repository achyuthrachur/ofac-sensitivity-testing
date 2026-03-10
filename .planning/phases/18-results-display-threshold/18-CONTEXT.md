# Phase 18: Results Display + Threshold - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

After a screening run completes, the user sees a color-coded split-pane results view where every name has a tier badge, clicking any row opens a detail card in the right pane, and dragging the threshold slider re-tiers all results client-side within 200ms without re-running the scoring engine. The "What would OFAC see?" toggle locks the threshold to 0.85.

This phase does NOT include: dashboard aggregate metrics (Phase 19), Cost of Miss calculator (Phase 19), CSV/PDF export (Phase 20).

</domain>

<decisions>
## Implementation Decisions

### Screening tab layout transition
- InputPanel collapses to a single-line header bar when results load: "📄 342 names loaded — [Change]"
- Run Screening button lives at the bottom of the expanded InputPanel — same UX pattern as "Run Test" in Sensitivity Test tab
- Clicking Run Screening triggers the worker call and collapses InputPanel to the header bar
- BenchmarkPanel (Phase 15 artifact) is removed and replaced by the results experience
- Results area uses a 40/60 split: left pane (40%) = scrollable name list with tier badges; right pane (60%) = detail card
- Before any row is clicked: right pane shows an instructional placeholder — "Select a name from the list to view match details" with a subtle icon

### Tier color scheme
- Traffic-light palette — universally understood by compliance professionals:
  - EXACT:  red      #DC2626
  - HIGH:   orange   #EA580C
  - MEDIUM: amber    #F5A800  (Crowe Amber — bridges brand to risk language)
  - LOW:    sky blue #0075C9  (Crowe Blue)
  - CLEAR:  teal     #05AB8C  (Crowe Teal)
- Tier badges are colored pill badges (rounded, filled background, white text) — e.g. "HIGH" in orange
- Selected row in the name list gets a light Crowe Indigo tint background (bg-crowe-indigo-dark/8)
- Name list rows show: name + tier pill badge only — match score lives in the detail card

### Threshold slider
- Lives in a sticky results header bar above the split pane — always visible regardless of scroll
- Range: 0.50–0.99, step 0.01; default: 0.80 (the MEDIUM tier floor)
- As slider moves, live tier counts update inline: "█ 3 EXACT  █ 12 HIGH  █ 44 MED  █ 88 LOW  █ 195 CLEAR" — each count uses its tier color
- "What would OFAC see?" is a button that snaps the slider to 0.85 and disables (locks) it — shows a lock icon and an "Unlock threshold" affordance to restore
- Locking shows "🔒 Locked at OFAC benchmark (0.85)" next to the disabled slider

### Detail card
- Recommended action string appears as a prominent colored callout block at the top of the card, colored by the effective tier
- Below the callout: data fields in a clean vertical list
- When name-length penalty applies (effectiveTier ≠ riskTier), both tiers are shown: "Raw: MEDIUM / Effective: HIGH (⚠ name-length penalty applied)"
- Hardcoded recommended action strings per effective tier:
  - EXACT:  "Block transaction and file SAR."
  - HIGH:   "Escalate for manual review before clearing."
  - MEDIUM: "Flag for enhanced due diligence."
  - LOW:    "Log and monitor — no immediate action required."
  - CLEAR:  "No match — clear to proceed."

### Claude's Discretion
- Exact spacing and typography within the detail card fields
- Loading/running state indicator while the worker is executing
- Hover states on name list rows (cursor, subtle bg change)
- Animation for InputPanel collapse transition (height animate or instant)
- Whether to virtualize the name list (TanStack Virtual) — should use it for 10k-name runs; Claude decides threshold

</decisions>

<specifics>
## Specific Ideas

- The header bar collapse pattern mirrors a standard "confirm + proceed" flow: configure → run → results fill the view, input summarized above
- Compliance framing: the callout block makes the action instruction the first visible thing — consultants presenting to clients see the recommendation before the raw data

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/tool/page.tsx` ('use client'): owns `activeNames: string[]` state and `InputPanel` wiring; Phase 18 adds `matchResults: MatchResult[]` state and wires the worker `screenNames()` call here
- `src/components/screening/InputPanel.tsx`: `onNamesLoaded(names)` + `currentCount` props — no changes needed; Phase 18 wraps it with the collapse logic
- `src/components/screening/BenchmarkPanel.tsx`: Phase 15 artifact — remove and replace with results UX in Phase 18
- `src/types/screening.ts`: `MatchResult`, `RiskTier`, `RISK_TIER_VALUES`, `TIER_THRESHOLDS`, `ScreeningWorkerApi` — all fully typed and available
- `shadcn/ui` Tabs, Card, Button, Slider, Checkbox — established component patterns throughout the tool
- `SpotlightCard` — available if Phase 18 wants it for the detail card surface

### Established Patterns
- v3.0 isolation: all new screening components go in `src/components/screening/` — never modify `ResultsTable.tsx`
- `'use client'` on `tool/page.tsx` — screening state lives here; pure server components not applicable for results
- TanStack Virtual used in `ResultsTable` for 1050px-wide table with explicit px widths on th/td — `ScreeningResultsTable` (or `ScreeningNameList`) should use same virtualizer pattern for 10k-name lists
- Web Worker + Comlink already wired in `BenchmarkPanel` — Phase 18 moves the worker call into `tool/page.tsx` for the production `screenNames()` call

### Integration Points
- `tool/page.tsx`: add `matchResults: MatchResult[]` state; add `isScreening: boolean` state; wire `screenNames(activeNames, sdnData)` worker call on Run Screening click
- New `src/components/screening/ScreeningResultsPane.tsx` — the full results UI (collapsed InputPanel header, threshold header, split pane)
- New `src/components/screening/ScreeningNameList.tsx` — virtualized left pane; receives `matchResults`, `threshold`, selected row state
- New `src/components/screening/MatchDetailCard.tsx` — right pane; receives selected `MatchResult | null`
- `src/types/screening.ts` may need a `RECOMMENDED_ACTIONS` constant mapping `RiskTier → string` for the hardcoded action strings

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-results-display-threshold*
*Context gathered: 2026-03-10*
