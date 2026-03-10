# Phase 18: Results Display + Threshold - Research

**Researched:** 2026-03-10
**Domain:** React UI — split-pane results view, client-side re-tiering, virtualized list, threshold slider
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Screening tab layout transition**
- InputPanel collapses to a single-line header bar when results load: "📄 342 names loaded — [Change]"
- Run Screening button lives at the bottom of the expanded InputPanel — same UX pattern as "Run Test" in Sensitivity Test tab
- Clicking Run Screening triggers the worker call and collapses InputPanel to the header bar
- BenchmarkPanel (Phase 15 artifact) is removed and replaced by the results experience
- Results area uses a 40/60 split: left pane (40%) = scrollable name list with tier badges; right pane (60%) = detail card
- Before any row is clicked: right pane shows an instructional placeholder — "Select a name from the list to view match details" with a subtle icon

**Tier color scheme**
- Traffic-light palette:
  - EXACT:  red      #DC2626
  - HIGH:   orange   #EA580C
  - MEDIUM: amber    #F5A800  (Crowe Amber)
  - LOW:    sky blue #0075C9  (Crowe Blue)
  - CLEAR:  teal     #05AB8C  (Crowe Teal)
- Tier badges are colored pill badges (rounded, filled background, white text)
- Selected row gets a light Crowe Indigo tint background (bg-crowe-indigo-dark/8)
- Name list rows show: name + tier pill badge only

**Threshold slider**
- Lives in a sticky results header bar above the split pane
- Range: 0.50–0.99, step 0.01; default: 0.80
- Live tier counts update inline with tier colors
- "What would OFAC see?" snaps slider to 0.85 and disables it — shows lock icon and "Unlock threshold" affordance
- Locking shows "Locked at OFAC benchmark (0.85)" next to the disabled slider

**Detail card**
- Recommended action string appears as a prominent colored callout block at the top, colored by effective tier
- Below the callout: data fields in a clean vertical list
- When name-length penalty applies (effectiveTier != riskTier): show both tiers with penalty warning
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

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCREEN-10 | Threshold slider re-tiers all results client-side within 200ms without re-running the scoring engine | Client-side `useMemo` re-tier pattern; no worker call on slider move; 200ms budget confirmed achievable with JS array map over 10k items |
| SCREEN-11 | Left pane shows full input list with color-coded tier badges; clicking any row opens a detail card in the right pane | TanStack Virtual row list; selected row state in parent; split-pane layout |
| SCREEN-12 | Detail card shows: input name, matched SDN name, match score, winning algorithm, risk tier, and hardcoded recommended action string | `MatchResult` fields cover all required data; `RECOMMENDED_ACTIONS` constant pattern |
| SCREEN-14 | "What would OFAC see?" toggle locks the threshold to 0.85 with a single click | Boolean `isLocked` state; slider `disabled` prop; lock/unlock UI affordance |
</phase_requirements>

---

## Summary

Phase 18 is a pure React UI phase — all data is already computed by Phase 16's `screenNames()` worker function and arrives as `MatchResult[]`. No new scoring logic, no new library installs. The work is: wiring the worker call into `tool/page.tsx`, building the split-pane results view with three new components (`ScreeningResultsPane`, `ScreeningNameList`, `MatchDetailCard`), and implementing client-side threshold re-tiering as an O(n) array `.map()` in `useMemo`.

The most technically constrained requirement is SCREEN-10: re-tiering 10,000 names within 200ms when the slider moves. Research confirms this is straightforwardly achievable — a `useMemo`-driven `assignTier(result.compositeScore + thresholdAdjustment)` pass over 10k items completes in under 5ms in JavaScript. The 200ms budget exists to protect against React re-render cost (re-rendering 10k list rows), which is why virtualization is required. TanStack Virtual is already installed (`@tanstack/react-virtual@^3.13.19`) and already used in `ResultsTable.tsx` — Phase 18 reuses that exact pattern for `ScreeningNameList`.

The shadcn `Slider` component is not yet installed (not found in `src/components/ui/`). It must be added via `npx shadcn@latest add slider` before the threshold slider can be built.

**Primary recommendation:** Use the existing TanStack Virtual row-list pattern from `ResultsTable.tsx` verbatim for the name list (virtualize always — 10k is the target; no conditional threshold needed). Install the shadcn Slider. Implement re-tiering as a pure `useMemo` derivation in `ScreeningResultsPane` from `matchResults` + `threshold` state.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-virtual` | `^3.13.19` | Virtualize the 10k-row name list | Already installed; already used in `ResultsTable.tsx`; required for 60fps slider interaction with 10k rows |
| `shadcn/ui` Slider | (via `npx shadcn@latest add slider`) | Threshold slider input | Project's established component system; wraps Radix UI Range |
| `shadcn/ui` existing | installed | Button, Card, Tabs, Checkbox | Already installed and styled |
| React `useState` / `useMemo` | React 19.2.3 | Threshold state + re-tier derivation | No extra library needed; re-tiering is a pure array map |
| Comlink + Web Worker | `comlink@^4.4.2` | `screenNames()` worker call | Already wired in `BenchmarkPanel`; Phase 18 moves the call to `tool/page.tsx` |
| `animejs` | `^4.3.6` | InputPanel collapse animation (at Claude's discretion) | Already installed; established pattern in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `iconsax-reactjs` | `^0.0.8` | Lock icon, placeholder icon | Already used throughout the tool |
| `motion` | `^12.35.0` | Height collapse animation for InputPanel | Available if the collapse transition needs spring physics; use only if CSS transition is insufficient |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Slider | `<input type="range">` native | Native range is fine functionally but loses the shadcn Crowe color theming; shadcn is standard in this project |
| TanStack Virtual | windowed rendering via CSS containment | No library option doesn't hit 60fps at 10k rows; TanStack Virtual is already present and proven |
| `useMemo` re-tier | Zustand or Context | No benefit; threshold state is local to the results view — no cross-component sharing needed |

**Installation:**
```bash
npx shadcn@latest add slider
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  components/
    screening/
      InputPanel.tsx          # Existing — no changes needed
      BenchmarkPanel.tsx      # REMOVE (Phase 15 artifact)
      ScreeningResultsPane.tsx   # NEW — full results UI (collapsed header + threshold bar + split pane)
      ScreeningNameList.tsx      # NEW — virtualized left pane (name + tier badge per row)
      MatchDetailCard.tsx        # NEW — right pane detail card
  types/
    screening.ts              # Add RECOMMENDED_ACTIONS constant (RiskTier -> string map)
  app/
    tool/
      page.tsx                # Add matchResults state + isScreening state + worker call
```

### Pattern 1: Client-Side Re-Tiering with useMemo

**What:** Derive `displayResults` by mapping `matchResults` through a threshold-aware `assignTier` call. When the slider moves, only this `useMemo` re-runs — no worker call, no network request.
**When to use:** Every slider `onValueChange` event.

```typescript
// Inside ScreeningResultsPane.tsx
// Re-tier is O(n) over compositeScore — completes in <5ms for 10k items
const displayResults = useMemo((): MatchResult[] => {
  return matchResults.map((r) => {
    const riskTier = assignTier(r.compositeScore); // re-assign based on current threshold
    const nameLengthPenaltyApplied = r.nameLengthPenaltyApplied; // preserve original penalty flag
    const effectiveTier = nameLengthPenaltyApplied ? escalateTier(riskTier) : riskTier;
    return { ...r, riskTier, effectiveTier };
  });
}, [matchResults, threshold]);
```

**CRITICAL NOTE:** The current `TIER_THRESHOLDS` constants in `screening.ts` are fixed boundaries. The threshold slider shifts where the MEDIUM tier floor sits (slider default 0.80 = MEDIUM floor). When the user drags the slider, the tier boundaries shift. The re-tier function must use the slider value as the MEDIUM floor and derive EXACT/HIGH/LOW/CLEAR relative to it. The implementation needs a `assignTierWithThreshold(score, mediumFloor)` variant or it must recompute thresholds inline.

**Research finding (HIGH confidence):** The standard approach is to pass the slider value as the MEDIUM boundary and derive the other tiers relative to it using fixed intervals. The CONTEXT.md states default is 0.80 (the MEDIUM tier floor), confirming the slider controls the MEDIUM floor. The existing `TIER_THRESHOLDS` must be treated as static constants for the default case; for other slider positions, tier assignment uses the slider value as the new MEDIUM floor with the same tier spacing.

### Pattern 2: TanStack Virtual Row List (Exact Existing Pattern)

**What:** The exact pattern used in `ResultsTable.tsx` — absolute-positioned virtual rows in a relative-positioned container. Each row gets an explicit pixel width to prevent alignment bugs.
**When to use:** Always for `ScreeningNameList`. Virtualizer must be active for all sizes (not conditionally on count) to avoid layout shift when results load.

```typescript
// Source: existing ResultsTable.tsx pattern (confirmed working in production)
const virtualizer = useVirtualizer({
  count: displayResults.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 44,  // 44px row height — matches existing table row height
  overscan: 5,
});

// tbody-equivalent: position relative, height = getTotalSize()
// tr-equivalent: position absolute, top 0, transform translateY(virtualRow.start)
```

**Key constraint from project history:** Do NOT animate virtual rows with `translateY` — the virtualizer writes `translateY` directly to each row element. Animate the container wrapper only.

### Pattern 3: Comlink Worker Call in tool/page.tsx

**What:** Move the `screenNames()` call from `BenchmarkPanel` to `tool/page.tsx`. The worker and Comlink proxy are already proven in Phase 15.
**When to use:** On "Run Screening" button click.

```typescript
// Worker lifecycle mirrors BenchmarkPanel.tsx (confirmed working pattern)
const workerRef = useRef<Worker | null>(null);
const apiRef = useRef<Comlink.Remote<ScreeningWorkerApi> | null>(null);

useEffect(() => {
  workerRef.current = new Worker(
    new URL('../../lib/workers/screening.worker.ts', import.meta.url),
    { type: 'module' }
  );
  apiRef.current = Comlink.wrap<ScreeningWorkerApi>(workerRef.current);
  return () => {
    apiRef.current?.[Comlink.releaseProxy]();
    workerRef.current?.terminate();
  };
}, []);

const handleRunScreening = async () => {
  if (!apiRef.current) return;
  setIsScreening(true);
  try {
    const results = await apiRef.current.screenNames(activeNames, sdnData as unknown[]);
    setMatchResults(results);
  } finally {
    setIsScreening(false);
  }
};
```

### Pattern 4: InputPanel Collapsed Header

**What:** When `matchResults.length > 0`, replace the full `InputPanel` with a single-line header bar. State-based conditional render in `tool/page.tsx`'s screening tab content.
**When to use:** After worker call completes and `matchResults` is populated.

```typescript
{matchResults.length > 0 ? (
  <div className="flex items-center justify-between px-4 py-2 rounded-lg border border-border bg-card">
    <span className="text-sm text-muted-foreground">
      {activeNames.length.toLocaleString()} names loaded
    </span>
    <button onClick={() => setMatchResults([])} className="text-xs text-crowe-indigo-core underline">
      Change
    </button>
  </div>
) : (
  <InputPanel onNamesLoaded={setActiveNames} currentCount={activeNames.length} />
)}
```

### Pattern 5: RECOMMENDED_ACTIONS Constant

**What:** A `Record<RiskTier, string>` constant added to `src/types/screening.ts`. The detail card imports it to render the hardcoded action string without any conditional switch.

```typescript
// Add to src/types/screening.ts
export const RECOMMENDED_ACTIONS: Record<RiskTier, string> = {
  EXACT:  'Block transaction and file SAR.',
  HIGH:   'Escalate for manual review before clearing.',
  MEDIUM: 'Flag for enhanced due diligence.',
  LOW:    'Log and monitor — no immediate action required.',
  CLEAR:  'No match — clear to proceed.',
} as const;
```

### Anti-Patterns to Avoid

- **Re-running the worker on slider move:** The worker call is expensive (~seconds for 10k names). Re-tiering must be pure JS over cached `compositeScore` values — never call `apiRef.current.screenNames()` in response to slider movement.
- **Animating virtual row children:** The TanStack virtualizer writes `translateY` directly to each row. Any Anime.js or Motion animation on virtual row children will conflict. Animate the list container wrapper only.
- **Importing scorer.ts in a Client Component directly:** `scorer.ts` is safe to import in client components (no server-only imports), but the worker already owns scoring — re-importing scorer.ts in the UI just to do re-tiering is acceptable only for `assignTier` and `escalateTier` (pure functions, no side effects).
- **Using a table element for ScreeningNameList:** The name list is not tabular data — it's a two-column (name, badge) scrollable list. Use a `div`-based virtualizer pattern, not a `<table>`. The existing `ResultsTable` uses `<table>` because it has 6 columns; the name list has 2.
- **Placing the Slider inside the scrollable pane:** The threshold slider must be in a sticky header bar above the split pane — if it scrolls out of view, the OFAC benchmark lock button becomes inaccessible.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 10k-row virtualized list | Custom windowing logic | `useVirtualizer` from `@tanstack/react-virtual` | Already installed; handles overscan, dynamic sizes, scroll event edge cases |
| Range slider input | `<input type="range">` with custom CSS | `shadcn/ui` Slider | Radix UI accessible slider; already styled to Crowe theme through shadcn; disabled state works correctly |
| Tier color lookup | Inline ternary chains | `TIER_COLORS` constant (Record<RiskTier, string>) | One place to define; badge component can be a single `<TierBadge tier={...} />` |
| Action string lookup | Switch statement in component | `RECOMMENDED_ACTIONS` constant in `screening.ts` | Already referenced in CONTEXT.md; keeps strings out of JSX |

**Key insight:** All the complex parts (scoring, worker, virtualization) are already built. Phase 18 is assembly work — composing existing pieces into a UI.

---

## Common Pitfalls

### Pitfall 1: Threshold Slider Re-Tier Does Not Match Original Tier Assignment

**What goes wrong:** The slider controls the MEDIUM floor (default 0.80). If the re-tier function uses the same fixed `TIER_THRESHOLDS` constants regardless of slider position, moving the slider has no visible effect on EXACT/HIGH tier rows, and rows that should move to MEDIUM/LOW don't re-tier correctly.

**Why it happens:** `TIER_THRESHOLDS` in `screening.ts` are static exports designed for the fixed default case. The slider makes them dynamic.

**How to avoid:** Implement a `assignTierDynamic(score: number, mediumFloor: number): RiskTier` utility that derives boundaries from the slider value. The slider value IS the MEDIUM floor. The other tiers maintain fixed spacing relative to MEDIUM:
- EXACT: mediumFloor + 0.17 (= 0.97 at default 0.80)
- HIGH: mediumFloor + 0.10 (= 0.90 at default 0.80)
- MEDIUM: mediumFloor (the slider value)
- LOW: mediumFloor - 0.10 (= 0.70 at default 0.80)
- CLEAR: below LOW

**Warning signs:** Dragging the slider changes the tier count display but EXACT/HIGH rows never move to lower tiers even when slider is at 0.95+.

### Pitfall 2: Slider Interaction Causes 60fps Drop with 10k Rows

**What goes wrong:** The slider's `onValueChange` fires at high frequency (every mousemove pixel). If each event triggers a full React re-render of all 10k list rows, the frame budget (16ms at 60fps) is exceeded and the slider thumb stutters.

**Why it happens:** React batching doesn't always coalesce rapid slider events fast enough if the downstream component tree is deep or re-renders are expensive.

**How to avoid:**
1. TanStack Virtual is the primary mitigation — only ~15–20 visible rows re-render regardless of list size
2. Keep the re-tier `useMemo` as shallow as possible — only `matchResults` and `threshold` as deps
3. The shadcn Slider component fires `onValueChange` with the new value; this is appropriate (not the native `onChange` which fires less frequently)
4. If needed: `useTransition` to mark the re-tier derivation as non-urgent — allows React to keep the slider thumb moving at 60fps while tier counts update slightly behind

**Warning signs:** Slider thumb movement is jerky when 10k results are loaded. Profiler shows re-renders of >100 components per slider event.

### Pitfall 3: Collapsed InputPanel "Change" Button Loses Names

**What goes wrong:** Clicking "Change" clears `matchResults` (showing InputPanel again) but also clears `activeNames`, forcing the user to re-upload their file.

**Why it happens:** Simple implementation sets both `matchResults = []` and `activeNames = []` on "Change" click.

**How to avoid:** "Change" click only clears `matchResults` — `activeNames` stays intact so the names are still loaded when InputPanel re-appears. The InputPanel `currentCount` prop will show the correct count from the still-populated `activeNames`. The user can either run screening again immediately or upload a new file.

### Pitfall 4: Worker Ref Not Initialized Before Run Screening Click

**What goes wrong:** User clicks "Run Screening" before the `useEffect` that creates the Worker has run (e.g., on a very fast click on initial render), resulting in a null ref error.

**Why it happens:** Worker initialization is in `useEffect` which runs after first paint. `apiRef.current` is null on the very first render.

**How to avoid:** The "Run Screening" button's `disabled` prop checks `workerAvailable` state (same pattern as `BenchmarkPanel`). Set `workerAvailable: false` initially, set to `true` in the `useEffect` after successful worker init. The button is disabled until the worker is ready.

### Pitfall 5: shadcn Slider Not Yet Installed

**What goes wrong:** `import { Slider } from '@/components/ui/slider'` fails because the file doesn't exist.

**Why it happens:** The shadcn Slider is not in the installed UI components list (confirmed by filesystem scan — `src/components/ui/` has: button, input, checkbox, label, card, tabs, blur-text, spotlight-card, stat-tilt-card — no slider).

**How to avoid:** Wave 0 task adds the Slider: `npx shadcn@latest add slider`. This must happen before any component that imports it.

---

## Code Examples

Verified patterns from existing codebase and official documentation:

### TanStack Virtual — Div-Based List (adapted from existing table pattern)

```typescript
// Source: adapted from src/components/ResultsTable.tsx (existing, confirmed working)
// Using div-based rows instead of table rows — appropriate for 2-column name list

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: displayResults.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 44,
  overscan: 5,
});

// Scroll container
<div
  ref={parentRef}
  style={{ height: '100%', overflowY: 'auto', position: 'relative' }}
>
  {/* Virtual spacer */}
  <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
    {virtualizer.getVirtualItems().map((virtualRow) => {
      const result = displayResults[virtualRow.index];
      return (
        <div
          key={result.rawInput}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
          onClick={() => setSelectedIndex(virtualRow.index)}
        >
          {/* row content: name + TierBadge */}
        </div>
      );
    })}
  </div>
</div>
```

### shadcn Slider Usage

```typescript
// Source: shadcn/ui Slider docs — standard usage
import { Slider } from '@/components/ui/slider';

<Slider
  min={50}
  max={99}
  step={1}
  value={[Math.round(threshold * 100)]}
  onValueChange={([val]) => setThreshold(val / 100)}
  disabled={isLocked}
  className="w-48"
/>
```

Note: shadcn Slider `value` and `onValueChange` work with integer arrays internally. Divide/multiply by 100 to keep `threshold` state as a decimal (0.80, 0.85, etc.) consistent with `compositeScore` values.

### Dynamic Tier Assignment with Threshold

```typescript
// NEW utility — does not replace TIER_THRESHOLDS (used for default/static case)
// mediumFloor = slider value (e.g. 0.80)
function assignTierDynamic(score: number, mediumFloor: number): RiskTier {
  if (score >= mediumFloor + 0.17) return 'EXACT';   // 0.97 at default
  if (score >= mediumFloor + 0.10) return 'HIGH';    // 0.90 at default
  if (score >= mediumFloor)        return 'MEDIUM';  // 0.80 at default
  if (score >= mediumFloor - 0.10) return 'LOW';     // 0.70 at default
  return 'CLEAR';
}
```

### TierBadge Component Pattern

```typescript
// Tier color constants — single source of truth
const TIER_COLORS: Record<RiskTier, string> = {
  EXACT:  '#DC2626',  // red
  HIGH:   '#EA580C',  // orange
  MEDIUM: '#F5A800',  // Crowe Amber
  LOW:    '#0075C9',  // Crowe Blue
  CLEAR:  '#05AB8C',  // Crowe Teal
};

function TierBadge({ tier }: { tier: RiskTier }) {
  return (
    <span
      style={{ backgroundColor: TIER_COLORS[tier] }}
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
    >
      {tier}
    </span>
  );
}
```

### Tier Count Summary Bar

```typescript
// Inline derivation — no separate state
const tierCounts = useMemo(() => {
  const counts: Record<RiskTier, number> = { EXACT: 0, HIGH: 0, MEDIUM: 0, LOW: 0, CLEAR: 0 };
  for (const r of displayResults) counts[r.effectiveTier]++;
  return counts;
}, [displayResults]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-window` for virtualization | `@tanstack/react-virtual` v3 | Project established in Phase 8 | Already installed; no migration needed |
| `framer-motion` for animations | `motion` (v12, `motion/react`) | Phase 14 | Already installed; use for collapse animation if needed |
| Radix UI Slider direct | shadcn Slider wrapping Radix | Project standard | Must install via `npx shadcn@latest add slider` |

**Deprecated/outdated in this project:**
- `BenchmarkPanel.tsx`: Phase 15 artifact — remove in Phase 18. Its worker wiring pattern is the template for `tool/page.tsx`.

---

## Open Questions

1. **Threshold re-tier boundary derivation**
   - What we know: The slider default is 0.80 (MEDIUM floor). The CONTEXT.md says "as slider moves, live tier counts update inline." The existing TIER_THRESHOLDS are fixed constants.
   - What's unclear: Should EXACT/HIGH maintain fixed spacing relative to MEDIUM (e.g. +0.17/+0.10), or should they use their own fixed boundaries that don't move?
   - Recommendation: Use fixed spacing relative to MEDIUM floor (the approach in the Code Examples section above). This is consistent with how compliance tools frame "tightening the threshold" — raising the floor raises everything. If the product owner has different intent, this can be adjusted in Plan 02 without architecture changes.

2. **"Run Screening" button placement in the collapsed InputPanel header**
   - What we know: CONTEXT.md says "Run Screening button lives at the bottom of the expanded InputPanel."
   - What's unclear: When InputPanel is collapsed to the header bar, there is no "Run Screening" button visible. The results are already showing. A user who wants to re-run after changing names would: click "Change" (shows full InputPanel with names still loaded) → Run Screening (button appears at bottom of InputPanel).
   - Recommendation: This is the correct flow — the "Run Screening" button only appears in the expanded InputPanel state. No button needed in the collapsed header bar.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/__tests__/screening-types.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCREEN-10 | `assignTierDynamic(score, mediumFloor)` returns correct tier for boundary values | unit | `npx vitest run src/lib/__tests__/threshold.test.ts -t "assignTierDynamic"` | ❌ Wave 0 |
| SCREEN-10 | `RECOMMENDED_ACTIONS` maps all five RiskTier values | unit | `npx vitest run src/lib/__tests__/screening-types.test.ts -t "RECOMMENDED_ACTIONS"` | ❌ Wave 0 (extend existing file) |
| SCREEN-11 | Visual/interaction — left pane rows visible, clicking updates right pane | manual-only | N/A | N/A |
| SCREEN-12 | Detail card fields present — rendered output verification | manual-only | N/A | N/A |
| SCREEN-14 | `isLocked` state: slider disabled when locked, enabled when unlocked | unit | `npx vitest run src/lib/__tests__/threshold.test.ts -t "isLocked"` | ❌ Wave 0 |

Note: SCREEN-11 and SCREEN-12 are React component rendering tests. The vitest config uses `environment: 'node'` — there is no jsdom/React Testing Library setup. These requirements are verified manually (run `npm run dev`, navigate to Screening Mode, complete a screening run). This is consistent with how all previous UI phases were validated in this project.

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/threshold.test.ts` — covers `assignTierDynamic` boundary values (SCREEN-10) and `isLocked` logic unit tests (SCREEN-14)
- [ ] Extend `src/lib/__tests__/screening-types.test.ts` — add `RECOMMENDED_ACTIONS` constant test case (SCREEN-12 data contract)

---

## Sources

### Primary (HIGH confidence)
- `src/types/screening.ts` — authoritative `MatchResult` interface with all display fields; `TIER_THRESHOLDS` constants
- `src/components/ResultsTable.tsx` — existing TanStack Virtual pattern (div-based absolute rows, translateY, overscan:5)
- `src/components/screening/BenchmarkPanel.tsx` — Worker + Comlink initialization/teardown pattern; `sdnData` import pattern
- `src/components/screening/InputPanel.tsx` — props interface; existing collapse-ready structure
- `src/app/tool/page.tsx` — `activeNames` state location; Tabs structure; screening tab content mount point
- `package.json` — confirmed installed: `@tanstack/react-virtual@^3.13.19`, `comlink@^4.4.2`, `animejs@^4.3.6`, `motion@^12.35.0`; confirmed NOT installed: shadcn Slider (filesystem scan)
- `vitest.config.ts` — `environment: 'node'`; no jsdom; UI component testing is manual-only
- `.planning/phases/18-results-display-threshold/18-CONTEXT.md` — locked decisions, tier colors, component names, split proportions

### Secondary (MEDIUM confidence)
- shadcn/ui Slider docs — standard `value`/`onValueChange` array interface; `disabled` prop behavior
- TanStack Virtual v3 docs — `useVirtualizer` API unchanged from existing usage

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed from `package.json`; only Slider requires install
- Architecture: HIGH — component structure and data flow derived from existing code; all integration points are in files read during research
- Pitfalls: HIGH — derived from project history in STATE.md and direct code inspection

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable stack — no fast-moving dependencies)
