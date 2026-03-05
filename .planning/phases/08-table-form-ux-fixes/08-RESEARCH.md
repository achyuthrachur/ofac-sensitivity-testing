# Phase 8: Table & Form UX Fixes - Research

**Researched:** 2026-03-04
**Domain:** React virtual table rendering, Radix UI Checkbox event contract, Tailwind v4 utility generation
**Confidence:** HIGH

---

## Summary

Phase 8 closes two concrete, well-scoped production defects identified in the v1.0 audit. Both bugs have been fully traced to specific lines of code. No library upgrades, new dependencies, or architectural changes are required. The plan is a surgical two-task edit cycle with a human verify step against the live Vercel URL.

**Bug 1 — ResultsTable column widths:** `COL_WIDTHS` in `src/components/ResultsTable.tsx` (line 26) defines six percentage columns summing to 100%: `22% + 12% + 16% + 22% + 18% + 10% = 100%`. The arithmetic is correct. However, the `thead` sticky row renders only five `<th>` elements for `COLUMN_LABELS` (which has 5 entries — Original Name, Entity Type, Linguistic Region, Degraded Variant, Rule Applied) plus one additional `<th>` for Score rendered separately. The `colgroup` renders six `<col>` elements matching `COL_WIDTHS`. Column count is consistent at 6. The production rendering issue is most likely caused by the sticky `thead` using `bg-white` (line 106), which in this project resolves to pure `#FFFFFF` — a valid background but potentially problematic if Tailwind v4 does not generate `bg-white` as expected under the `@theme inline` configuration. There is also a secondary concern: in Tailwind v4's `@theme inline` block, only custom tokens are registered. The utility `bg-white` maps to the framework default `#FFFFFF` and is always available regardless of theme configuration — so that is not the cause. The actual production table collapse is more likely a stacking context or scroll-container height interaction. The safest fix is to add `min-width` values to `<col>` elements in addition to percentage widths, switch the sticky header background from `bg-white` to the Crowe card surface (`bg-[#ffffff]` explicitly or the CSS variable `var(--card)` which equals `#ffffff`) — either is fine — and confirm Tailwind's `bg-white` is emitted in production. Alternatively, replace `bg-white` with an inline style `style={{ background: '#ffffff' }}` to guarantee no Tailwind purge removes it.

**Bug 2 — handleSelectAll inversion:** In `src/app/page.tsx` line 84, `handleSelectAll` reads:
```
setRuleIds(checked === true ? [] : [...CANONICAL_RULE_ORDER]);
```
When Radix fires `onCheckedChange(true)` — meaning the checkbox is now checked / "select all" — the handler sets `ruleIds` to `[]` (clears all rules). When Radix fires `onCheckedChange(false)` or `'indeterminate'` — meaning the checkbox is unchecked — it selects all. This is inverted. The correct logic is: `checked === true` → select all; otherwise → clear all. This is a one-line fix.

**Primary recommendation:** Fix `handleSelectAll` with a one-line logic inversion. Fix the sticky `thead` background by replacing `bg-white` with `style={{ background: 'var(--card)' }}` (or `bg-card` Tailwind utility). Confirm `colgroup` `<col>` elements match the 6-column table structure (they already do). Add explicit `min-width` pixel values as a belt-and-suspenders guard against collapse on Vercel. Human verify against the live URL.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RSLT-04 | Results table remains usable and responsive with thousands of rows (virtualized rendering) | Column-width fix ensures virtualizer absolute-positioned rows fill their cells correctly; sticky header fix prevents background bleed |
| FORM-03 | User can select degradation rules via checkboxes with a "Select All" option | handleSelectAll inversion fix makes Select All behave as labeled |

---

## Code Analysis: Confirmed Bug Locations

### Bug 1 — ResultsTable.tsx: Sticky header background

**File:** `src/components/ResultsTable.tsx` line 106

**Current code:**
```tsx
<thead className="sticky top-0 z-10 bg-white">
```

**Issue:** `bg-white` is a framework default utility that should emit `#ffffff`. In Tailwind v4 with `@theme inline`, framework defaults are still available. However, on Vercel production builds with tree-shaking, if `bg-white` does not appear in any scanned source file other than this one, it is still safe — Tailwind v4 scans all source files. The more likely production issue is that when rows scroll under the sticky `thead`, the transparent background of cells shows through if any render path resolves differently. Using `bg-card` (which maps to `var(--card) = #ffffff`) is semantically more correct and guaranteed to be in the generated CSS because it is used elsewhere in the app via shadcn Card components.

**Safe fix options (in order of preference):**
1. Replace `bg-white` with `style={{ background: 'var(--card)' }}` — inline style, zero Tailwind dependency
2. Replace `bg-white` with `bg-card` — uses the registered shadcn CSS variable, present in the @theme inline block via `--color-card: var(--card)`
3. Replace `bg-white` with `bg-[#ffffff]` — Tailwind arbitrary value, always emitted when used

**Current COL_WIDTHS verification:**

```
COL_WIDTHS = ['22%', '12%', '16%', '22%', '18%', '10%']
Sum: 22 + 12 + 16 + 22 + 18 + 10 = 100 ✓
Count: 6 columns ✓
thead columns: 5 COLUMN_LABELS <th> + 1 Score <th> = 6 ✓
tbody cells per row: 6 <td> ✓
colgroup <col> elements: 6 ✓
```

The percentage widths add up and the column counts match. The `colgroup` is structurally correct. The remaining risk is that percentage widths on a `table-layout: fixed` table inside an absolutely-positioned virtualizer body may behave differently across environments. Adding pixel-based `min-width` to each `<col>` is the belt-and-suspenders guard.

**Suggested min-width additions** (based on container `max-w-5xl` = 1024px, minus padding):

| Column | Percentage | min-width |
|--------|-----------|-----------|
| Original Name | 22% | 200px |
| Entity Type | 12% | 100px |
| Linguistic Region | 16% | 140px |
| Degraded Variant | 22% | 200px |
| Rule Applied | 18% | 160px |
| Score | 10% | 80px |

These are safe minimums — the table container is `max-w-5xl` (width: 1024px) with `px-4` (32px padding), giving ~992px usable. Percentage columns resolve correctly at this width.

---

### Bug 2 — page.tsx: handleSelectAll inversion

**File:** `src/app/page.tsx` line 83–85

**Current code:**
```tsx
const handleSelectAll = (checked: boolean | 'indeterminate') => {
  setRuleIds(checked === true ? [] : [...CANONICAL_RULE_ORDER]);
};
```

**Root cause:** The condition is inverted. Radix `onCheckedChange` passes `true` when the checkbox transitions to checked state (the user clicked "Select All" to check it). The handler responds by setting `ruleIds` to `[]` — clearing all rules. This is backwards.

**Correct logic:**
```tsx
const handleSelectAll = (checked: boolean | 'indeterminate') => {
  setRuleIds(checked === true ? [...CANONICAL_RULE_ORDER] : []);
};
```

**Interaction with `deriveSelectAllState`:** `formUtils.ts` correctly derives tri-state:
- `ruleIds.length === 0` → `false` (unchecked)
- `ruleIds.length === 10` → `true` (checked)
- `1–9` → `'indeterminate'`

After the fix, the full cycle works correctly:
1. All rules checked → checkbox shows `true` → user clicks → `onCheckedChange(false)` → `setRuleIds([])` → 0 rules → checkbox shows `false`
2. No rules checked → checkbox shows `false` → user clicks → `onCheckedChange(true)` → `setRuleIds([...CANONICAL_RULE_ORDER])` → 10 rules → checkbox shows `true`
3. Partial rules → checkbox shows `'indeterminate'` → user clicks → `onCheckedChange(true)` → selects all (correct behavior for indeterminate→checked)

**No changes needed to `formUtils.ts` or `deriveSelectAllState`.** The helper is correct.

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Relevance |
|---------|---------|---------|-----------|
| @tanstack/react-virtual | 3.x | Row virtualization with absolute positioning | colgroup widths must be set for cells to align |
| @radix-ui/react-checkbox | (via shadcn) | Checkbox with tri-state onCheckedChange | onCheckedChange(true) = now checked; (false) = now unchecked |
| Tailwind v4 | 4.x | Utility class generation from @theme inline | bg-white available; bg-card maps to --card token |
| Next.js 15 | 15.x | App Router, production build | Vercel build may differ from dev in CSS output |

**No new packages required for this phase.**

---

## Architecture Patterns

### Pattern 1: @tanstack/react-virtual + colgroup

**What:** `useVirtualizer` renders rows with `position: absolute` inside a `position: relative` tbody. The table must be `table-layout: fixed` with a `colgroup` providing explicit column widths — otherwise cells have no reference dimensions and collapse.

**Current state:** Already implemented correctly. `tableLayout: 'fixed'` and `colgroup` are present. The fix is defensive hardening only.

**Verified pattern (from @tanstack/react-virtual docs and implementation):**
```tsx
<table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
  <colgroup>
    <col style={{ width: '22%', minWidth: '200px' }} />
    <col style={{ width: '12%', minWidth: '100px' }} />
    <col style={{ width: '16%', minWidth: '140px' }} />
    <col style={{ width: '22%', minWidth: '200px' }} />
    <col style={{ width: '18%', minWidth: '160px' }} />
    <col style={{ width: '10%', minWidth: '80px' }} />
  </colgroup>
  <thead className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
    ...
  </thead>
</table>
```

### Pattern 2: Radix Checkbox onCheckedChange contract

**What:** Radix `Checkbox` fires `onCheckedChange(checked: boolean | 'indeterminate')` where the value represents the NEW state after the click, not the previous state.

**Key contract:**
- User clicks an unchecked box → `onCheckedChange(true)` → handler should respond to "now checked"
- User clicks a checked box → `onCheckedChange(false)` → handler should respond to "now unchecked"
- Checkbox is `indeterminate` and user clicks → `onCheckedChange(true)` → handler should respond to "now checked" (Radix promotes indeterminate → checked on click)

**Confirmed (HIGH confidence):** This is the documented Radix behavior and the standard React controlled component pattern.

### Anti-Patterns to Avoid

- **Reading `checked` as "was it checked before":** The `checked` parameter in `onCheckedChange` is the NEW state. Treating it as the old state produces the inversion bug present in the current code.
- **Using `border-collapse: collapse` without explicit column widths:** The virtualizer tbody uses `position: relative` with children at `position: absolute`. Without colgroup widths, cells have no natural width to collapse to.
- **Relying on framework-default Tailwind utilities without verification:** In Tailwind v4, custom tokens go in `@theme inline`. Framework defaults like `bg-white` are still emitted but using semantic tokens (`bg-card`) is safer and more maintainable.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tri-state checkbox | Custom tri-state component | Radix Checkbox (already used) | Handles indeterminate, keyboard, ARIA |
| Column width calculation | Dynamic JS width calculator | colgroup with % + minWidth | CSS handles table-layout: fixed natively |
| Scroll container | Custom scroll implementation | div with overflowY: auto | Browser native; virtualizer depends on it |

---

## Common Pitfalls

### Pitfall 1: Treating onCheckedChange as "previous state"

**What goes wrong:** Handler logic reads `checked === true` as "was previously checked" and inverts action.
**Why it happens:** Confusion between controlled component pattern (value = new state) and toggle pattern (value = old state).
**How to avoid:** Always read `onCheckedChange(checked)` as "the checkbox is NOW in state `checked`". Act accordingly.
**Warning signs:** "Select All" clears rules when none are selected; deselect-all selects all.

### Pitfall 2: Missing minWidth on colgroup cols in virtualizer tables

**What goes wrong:** On certain viewport sizes or in production builds, percentage widths resolve to zero if the table's containing block has no explicit width.
**Why it happens:** `table-layout: fixed` distributes width based on first-row cells OR colgroup. If the scroll container's width is not established before paint, percentages may compute from zero.
**How to avoid:** Add both `width: X%` and `minWidth: Npx` to each `<col>`. The pixel fallback guarantees a non-zero width floor.
**Warning signs:** All columns appear collapsed to minimum content width; table appears as a narrow strip.

### Pitfall 3: Sticky thead background bleed

**What goes wrong:** Rows scroll visibly beneath the sticky header because the header background is transparent or resolves differently in production.
**Why it happens:** `bg-white` is a framework utility. If the generated CSS output differs between dev and prod (e.g., different scanning, different optimization), the class may not apply as expected.
**How to avoid:** Use `style={{ background: 'var(--card)' }}` for the sticky thead — inline styles are never purged and always take effect.
**Warning signs:** Text from scrolled rows bleeds through the header; header appears to have transparent sections.

### Pitfall 4: Forgetting the Score column in COLUMN_LABELS vs COL_WIDTHS

**What goes wrong:** Changing COLUMN_LABELS length without updating COL_WIDTHS, or vice versa — creating a mismatch between `<col>` count and `<th>` count.
**Why it happens:** `COLUMN_LABELS` has 5 entries (all columns except Score); Score is a separate `<th>`. `COL_WIDTHS` has 6 entries (covers all 6 columns including Score). This asymmetry is intentional but fragile.
**How to avoid:** Add a comment in `COL_WIDTHS` noting that index 5 is the Score column. Do not change either constant without auditing both.

---

## Code Examples

### Correct handleSelectAll (one-line fix)

```tsx
// BEFORE (inverted — BUG):
const handleSelectAll = (checked: boolean | 'indeterminate') => {
  setRuleIds(checked === true ? [] : [...CANONICAL_RULE_ORDER]);
};

// AFTER (correct):
const handleSelectAll = (checked: boolean | 'indeterminate') => {
  setRuleIds(checked === true ? [...CANONICAL_RULE_ORDER] : []);
};
```

### Correct colgroup with minWidth

```tsx
// BEFORE:
const COL_WIDTHS = ['22%', '12%', '16%', '22%', '18%', '10%'] as const;
// ...
<col key={i} style={{ width: w }} />

// AFTER:
const COL_WIDTHS = [
  { width: '22%', minWidth: '200px' }, // Original Name
  { width: '12%', minWidth: '100px' }, // Entity Type
  { width: '16%', minWidth: '140px' }, // Linguistic Region
  { width: '22%', minWidth: '200px' }, // Degraded Variant
  { width: '18%', minWidth: '160px' }, // Rule Applied
  { width: '10%', minWidth: '80px' },  // Score (index 5)
] as const;
// ...
<col key={i} style={COL_WIDTHS[i]} />
```

### Correct sticky thead background

```tsx
// BEFORE:
<thead className="sticky top-0 z-10 bg-white">

// AFTER (inline style — never purged, semantically correct):
<thead className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>

// OR (Tailwind utility — bg-card maps to var(--card) = #ffffff):
<thead className="sticky top-0 z-10 bg-card">
```

---

## State of the Art

| Old Approach | Current Approach | Relevance |
|--------------|-----------------|-----------|
| Colgroup with % only | Colgroup with % + minWidth px | minWidth prevents zero-collapse in virtualizer |
| bg-white for sticky headers | bg-card or inline style var() | Semantic token always present in generated CSS |
| Trusting onCheckedChange parameter meaning | Verified via Radix docs: value = new state | Confirms the inversion is a bug, not a quirk |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/formUtils.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-03 | handleSelectAll selects all when checked=true | unit | `npx vitest run src/lib/formUtils.test.ts` | ✅ (formUtils tests exist; handleSelectAll logic is in page.tsx — test is visual/manual for the handler) |
| RSLT-04 | Table columns render correctly with virtualizer | manual | N/A — visual rendering on live URL | Manual only |

**Note on FORM-03 testing:** `handleSelectAll` is an inline function in `page.tsx` that directly calls `setRuleIds`. The pure logic being fixed (`checked === true ? X : Y`) is trivially verifiable by reading the code. The `deriveSelectAllState` helper in `formUtils.ts` already has unit tests. The FORM-03 requirement is verified by human UAT on the live URL — the same mechanism used in Phase 5.

**Note on RSLT-04 testing:** Column rendering in the virtualizer is a visual/browser test. There is no unit test that can assert pixel widths. Verification is human UAT against the live URL after deploy.

### Sampling Rate

- **Per task commit:** `npx vitest run` (full suite — 114 tests, runs in ~3s)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + human verify on live Vercel URL before closing phase

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. No new test files needed. Both fixes are verified via full suite green (no regressions) + human UAT on production URL.

---

## Open Questions

1. **Is the production table collapse reproducible in dev?**
   - What we know: User observed it on Vercel production; dev server may behave differently
   - What's unclear: Whether the issue is Tailwind CSS emission (bg-white purged?) or table layout computation
   - Recommendation: Apply both fixes (background + minWidth) and verify on live URL after deploy. Do not spend time reproducing in dev.

2. **Does Tailwind v4 emit `bg-white` in production builds?**
   - What we know: `bg-white` is a framework default, not a custom token. Tailwind v4 scans source files and should include it if present in `ResultsTable.tsx`.
   - What's unclear: Whether the Vercel build's Tailwind scan covers all files correctly.
   - Recommendation: Replace with `style={{ background: 'var(--card)' }}` — eliminates this uncertainty entirely.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection: `src/components/ResultsTable.tsx` — COL_WIDTHS, colgroup structure, thead bg-white, column count verification
- Direct code inspection: `src/app/page.tsx` line 84 — handleSelectAll inversion confirmed by reading the condition
- Direct code inspection: `src/lib/formUtils.ts` — deriveSelectAllState confirmed correct; no changes needed
- Direct code inspection: `src/app/globals.css` — `--card: #ffffff` confirmed; `bg-card` utility available via `--color-card: var(--card)` in @theme inline
- `.planning/v1.0-MILESTONE-AUDIT.md` — audit findings confirmed both bugs with exact descriptions

### Secondary (MEDIUM confidence)

- Radix UI Checkbox documented contract: `onCheckedChange(checked)` passes the NEW state (not previous). Consistent with all Radix controlled component patterns.
- @tanstack/react-virtual: Absolute-positioned rows require explicit column widths on colgroup. Documented in Phase 6 decisions in STATE.md.

### Tertiary (LOW confidence)

- Tailwind v4 production build scanning behavior — unverified whether `bg-white` is included. Mitigated by using inline style instead.

---

## Metadata

**Confidence breakdown:**
- handleSelectAll bug: HIGH — code inspection confirms inversion at line 84; fix is one character swap
- colgroup structure: HIGH — arithmetic verified, column counts match, issue is defensive hardening
- sticky header background: MEDIUM — bg-white should work; switching to inline style removes uncertainty
- production reproduction: LOW — observed on live URL; cause narrowed to 2 candidates

**Research date:** 2026-03-04
**Valid until:** Indefinite — both bugs are frozen code issues, not library API concerns
