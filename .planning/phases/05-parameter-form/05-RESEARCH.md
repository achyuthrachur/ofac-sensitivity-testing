# Phase 5: Parameter Form - Research

**Researched:** 2026-03-04
**Domain:** Next.js 15 App Router client component — React state + server action integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Four cards stacked vertically: Entity Counts, Linguistic Regions, Degradation Rules, Client Name
- Page width: centered, `max-w-2xl` (~672px)
- Entity count inputs: 2-column grid (Individual | Business on row 1, Vessel | Aircraft on row 2)
- Region checkboxes: 2-column grid (Arabic | Chinese on row 1, Russian/Cyrillic | Latin/European on row 2)
- Rule checkboxes: 2-column grid (5 rules per column), with "Select All" toggle above the grid
- Submit button: in the Client Name card footer (last card, bottom of form)
- All 10 degradation rules: pre-checked on load
- All 4 linguistic regions: pre-checked on load
- Entity counts: 10 for each type on load
- Client name: empty with placeholder `e.g. Acme Financial Corp`
- "Select All" checkbox reflects true (all rules checked) on initial render
- Loading: button disabled + spinner + label changes to `Running…` while `runTest` is pending — via `useActionState` / `startTransition`
- Form stays interactive and re-runnable after a completed run (no page refresh)
- On success (`ok: true`): show placeholder `{N} results generated` below the form
- On failure (`ok: false`): red destructive alert banner inside the Client Name card, just above the Submit button
- Error banner persists until the user re-submits
- No client-side inline field validation — server error banner only (Zod handles all validation)
- "Select All" controlled checkbox with indeterminate state when only some rules selected
- Entity count inputs use `max={MAX_ENTITY_COUNT}` (500) from `src/lib/constants.ts`
- `CANONICAL_RULE_ORDER` from `@/lib/rules` is the source of truth for rule order
- `RULE_LABELS` from `@/lib/rules` provides human-readable labels

### Claude's Discretion
- Exact Tailwind classes and spacing within each card
- Whether to use `useActionState` or manual `useState` + `startTransition` for the pending state (both valid; choose whichever is simpler)
- Spinner implementation (inline SVG or a simple CSS animation)
- Exact placeholder wording for the post-submit count display

### Deferred Ideas (OUT OF SCOPE)
- Client-side inline field validation (per-field error messages) — Phase 7 polish
- Full-page loading overlay
- Toast notifications
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORM-01 | User can set sample count per entity type (Individual, Business, Vessel, Aircraft — 0–500 each) | `<input type="number" min={0} max={MAX_ENTITY_COUNT}>` via shadcn `Input`; state held as `entityCounts` object in component |
| FORM-02 | User can select one or more linguistic regions to include | Checkbox group for `REGION_VALUES` keys; state held as `Region[]`; all 4 pre-checked |
| FORM-03 | User can select degradation rules via checkboxes with "Select All" option | Checkbox per `CANONICAL_RULE_ORDER` entry; Select All with indeterminate state via Radix `CheckboxPrimitive.Root checked="indeterminate"` |
| FORM-04 | User can enter a client name used to label the output CSV | shadcn `Input` text field; passed as `clientName` in `RunParams`; empty initial state |
</phase_requirements>

---

## Summary

Phase 5 builds the entire interactive UI of the application in a single file: `src/app/page.tsx`. Because the page needs `useState` and either `useActionState` or `startTransition`, it must be a `'use client'` component. All the hard backend work (Zod validation, engine orchestration, Jaro-Winkler scoring) is already done in the `runTest` server action from Phase 4. Phase 5 is purely a React state management and rendering problem.

The form is decomposed into four shadcn `Card` components with predetermined layouts. No new npm dependencies are required — all shadcn components (`Card`, `Button`, `Input`, `Checkbox`, `Label`) are already installed and present in `src/components/ui/`. The one subtle technical challenge is the "Select All" checkbox with indeterminate state: Radix UI's `CheckboxPrimitive` accepts `checked="indeterminate"` as a valid value and renders the dash indicator, but the shadcn `Checkbox` wrapper does not apply a visual indicator for the indeterminate state by default — the indicator must be added.

The page must hold `rows: ResultRow[]` in local state for Phase 6 to mount its results table into the same page component without a refactor. The `ActionResult` discriminated union (`ok: true | false`) drives both the success count display and the error banner through straightforward conditional rendering.

**Primary recommendation:** Use `useActionState` with a `formAction` wrapper for the cleanest App Router pattern. If `useActionState` introduces complexity (e.g. form serialization), fall back to manual `useState` + `startTransition` with a `handleSubmit` async function that builds the `RunParams` object from local state and calls `runTest` directly. The manual approach is actually simpler here because `RunParams` is a typed object, not a `FormData` payload.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | `useState`, `useActionState`, `startTransition` | Already installed; App Router requires React 19 |
| Next.js | 16.1.6 | App Router, server actions, `'use client'` boundary | Project framework |
| shadcn/ui | 3.8.5 | `Card`, `Button`, `Input`, `Checkbox`, `Label` | Already installed; all needed components present |
| Radix UI | 1.4.3 | `CheckboxPrimitive.Root checked="indeterminate"` | shadcn's underlying primitive; indeterminate state needed for Select All |
| Tailwind CSS | v4 | Utility classes for layout and spacing | Project styling system |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@/types` | — | `RunParams`, `ActionResult`, `ResultRow`, `REGION_VALUES`, `ENTITY_TYPE_VALUES` | Import for all form state types |
| `@/lib/rules` | — | `CANONICAL_RULE_ORDER`, `RULE_LABELS` | Drive the rule checkbox list |
| `@/lib/constants` | — | `MAX_ENTITY_COUNT` | Set `max` attribute on number inputs |
| `@/app/actions/runTest` | — | `runTest(params: unknown): Promise<ActionResult>` | Called on form submit |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useActionState` | `useState` + `startTransition` | `useActionState` ties well to `<form action={...}>` but requires serializing state to `FormData`; manual `useState` + `startTransition` is more natural with a typed `RunParams` object — recommend manual approach |
| Inline SVG spinner | CSS `animate-spin` + Lucide `Loader2` | `Loader2` from `lucide-react` (already installed) is the simplest option; no extra markup |
| Custom error banner component | Inline `<div>` with destructive colors | Inline `<div className="... bg-destructive/10 text-destructive ...">` is sufficient; no need to extract |

**Installation:** No new packages needed. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── page.tsx          # Phase 5 output — entire form lives here
│   ├── layout.tsx        # Update metadata title
│   └── globals.css       # Unchanged
├── components/
│   └── ui/               # All needed shadcn components already present
├── lib/
│   ├── rules/index.ts    # CANONICAL_RULE_ORDER, RULE_LABELS
│   ├── constants.ts      # MAX_ENTITY_COUNT
│   └── sampler.ts        # (not touched in Phase 5)
└── types/index.ts        # RunParams, ActionResult, ResultRow, REGION_VALUES, ENTITY_TYPE_VALUES
```

### Pattern 1: Manual useState + startTransition (Recommended)

**What:** Component holds all form state as typed `useState` values. On submit, wraps `runTest` call in `startTransition` to get the `isPending` boolean for the loading state. `ActionResult` is stored in state and drives conditional rendering.

**When to use:** When the server action accepts a typed object (not `FormData`). Avoids the complexity of serializing `RunParams` through a `<form>` element.

**Example:**
```typescript
// src/app/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { runTest } from '@/app/actions/runTest';
import type { ActionResult, ResultRow, RunParams, Region } from '@/types';
import { REGION_VALUES, ENTITY_TYPE_VALUES } from '@/types';
import { CANONICAL_RULE_ORDER, RULE_LABELS } from '@/lib/rules';
import { MAX_ENTITY_COUNT } from '@/lib/constants';
// ... shadcn imports

export default function Home() {
  // Form state
  const [entityCounts, setEntityCounts] = useState({
    individual: 10, business: 10, vessel: 10, aircraft: 10,
  });
  const [regions, setRegions] = useState<Region[]>([
    REGION_VALUES.arabic, REGION_VALUES.cjk,
    REGION_VALUES.cyrillic, REGION_VALUES.latin,
  ]);
  const [ruleIds, setRuleIds] = useState<string[]>([...CANONICAL_RULE_ORDER]);
  const [clientName, setClientName] = useState('');

  // Async/result state
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  // Phase 6 rows — kept here so Phase 6 can read it without refactor
  const rows: ResultRow[] = result?.ok ? result.rows : [];

  const handleSubmit = () => {
    const params: RunParams = { entityCounts, regions, ruleIds, clientName };
    startTransition(async () => {
      const actionResult = await runTest(params);
      setResult(actionResult);
    });
  };

  // ... render
}
```

### Pattern 2: Select All Checkbox with Indeterminate State

**What:** The "Select All" checkbox needs three visual states: checked (all rules selected), unchecked (no rules selected), indeterminate (some rules selected). Radix UI's `CheckboxPrimitive.Root` accepts `checked="indeterminate"` for the third state.

**Key insight:** The shadcn `Checkbox` component wraps `CheckboxPrimitive.Root` and passes all props through via `...props`. The `checked` prop accepts `boolean | 'indeterminate'` because Radix types it as `CheckedState`. This means the shadcn `Checkbox` component supports indeterminate out of the box — pass `checked={selectAllState}` where `selectAllState` is `true | false | 'indeterminate'`.

**Visual gap:** The shadcn `Checkbox` component only renders `<CheckIcon>` inside `CheckboxPrimitive.Indicator`. When `checked="indeterminate"`, `CheckboxPrimitive.Indicator` renders (it renders for both checked and indeterminate), but `CheckIcon` shows regardless. To show a dash for indeterminate, replace `CheckIcon` with a conditional — or use a `MinusIcon` from `lucide-react` conditionally rendered. The simplest approach: use an `<svg>` that renders a dash when in indeterminate state by checking the data attribute `data-[state=indeterminate]` via Tailwind.

**Example:**
```typescript
// Derive Select All state from ruleIds
type CheckedState = boolean | 'indeterminate';

function getSelectAllState(ruleIds: string[]): CheckedState {
  if (ruleIds.length === 0) return false;
  if (ruleIds.length === CANONICAL_RULE_ORDER.length) return true;
  return 'indeterminate';
}

// Toggle handler
function handleSelectAll(checked: CheckedState) {
  if (checked === true || checked === 'indeterminate') {
    // When currently all-checked, uncheck all; when indeterminate, check all
    setRuleIds(checked === true ? [] : [...CANONICAL_RULE_ORDER]);
  } else {
    setRuleIds([...CANONICAL_RULE_ORDER]);
  }
}

// In JSX — use Radix directly for indeterminate support clarity
// OR use shadcn Checkbox (it accepts checked="indeterminate" via props passthrough)
<Checkbox
  checked={getSelectAllState(ruleIds)}
  onCheckedChange={handleSelectAll}
/>
```

**Correct Select All toggle logic (from CONTEXT.md specifics):**
- When fully checked → uncheck all
- When indeterminate → check all
- When unchecked → check all

### Pattern 3: Number Input with Controlled Value

**What:** `<input type="number">` paired with shadcn `Input`. The value must stay as a number in state, but `onChange` delivers a string. Parse at the boundary.

**Example:**
```typescript
<Input
  type="number"
  min={0}
  max={MAX_ENTITY_COUNT}
  value={entityCounts.individual}
  onChange={(e) => {
    const val = parseInt(e.target.value, 10);
    setEntityCounts(prev => ({
      ...prev,
      individual: Number.isNaN(val) ? 0 : Math.min(val, MAX_ENTITY_COUNT),
    }));
  }}
/>
```

**Pitfall:** Don't clamp on every keystroke in a way that prevents typing intermediate values (e.g., deleting to empty). Consider allowing the empty string in a `string`-typed state and parsing only on submit. However since Zod validates server-side and the input has `min`/`max` HTML attributes, browser validation provides UX feedback without custom clamping logic.

### Pattern 4: startTransition Async in React 19

**What:** React 19 allows `startTransition` to wrap async functions directly. The `isPending` state is true for the entire async duration.

**Important:** `runTest` is a Next.js Server Action. In a `'use client'` component, it can be imported directly from `@/app/actions/runTest` and called as a regular async function. Next.js handles the RPC boundary transparently.

**Example:**
```typescript
const [isPending, startTransition] = useTransition();

// Call server action inside startTransition
startTransition(async () => {
  const result = await runTest(params);
  setResult(result);
});
```

### Anti-Patterns to Avoid

- **Default export from shadcn component files:** All shadcn components use named exports. `page.tsx` uses default export (Next.js convention). This is the one exception — don't add a named export to `page.tsx`.
- **Hardcoding rule order:** Never hardcode `['space-removal', 'char-substitution', ...]` in the form. Always iterate `CANONICAL_RULE_ORDER`.
- **Parsing entity count as float:** Use `parseInt(val, 10)` not `parseFloat`. Zod validates `.int()` server-side; sending a float causes a validation error.
- **Setting `rows` in a separate `useEffect`:** Extract `rows` directly from the `result` state in the render — no effect needed. `const rows = result?.ok ? result.rows : []`.
- **Calling `runTest` outside `startTransition`:** Without `startTransition`, `isPending` will never be true and the button won't disable during the run.
- **`useActionState` with `<form action>`:** `useActionState` is designed for form submissions via `FormData`. `runTest` accepts `RunParams` (a typed object). Using `useActionState` would require serializing all state into `FormData` and re-parsing it, which is more complex than the manual `useState` + `startTransition` pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Checkbox indeterminate state | Custom tri-state checkbox from scratch | `Radix UI CheckboxPrimitive.Root checked="indeterminate"` (already in shadcn `Checkbox`) | Radix handles ARIA `aria-checked="mixed"`, keyboard navigation, and indicator rendering |
| Form field layout | Custom CSS grid | Tailwind `grid grid-cols-2 gap-4` | Already in the project; consistent with rest of codebase |
| Spinner/loading indicator | Custom animation | `Loader2` from `lucide-react` with `className="animate-spin"` | `lucide-react` is already installed (used in `checkbox.tsx`); `animate-spin` is built into Tailwind |
| Error message container | Custom alert component | Inline `<div>` with `bg-destructive/10 border border-destructive/20 text-destructive` tokens | Sufficient for a single error string; shadcn `Alert` is available but adds a new component install |
| `RunParams` type construction | Inline object literal without type reference | `const params: RunParams = { ... }` | TypeScript catches mismatches at compile time |

**Key insight:** Every UI primitive needed for this form already exists in the codebase. No new `npx shadcn add` commands are required. The only "new" pattern is composing existing components into a working form.

---

## Common Pitfalls

### Pitfall 1: Checkbox `onCheckedChange` vs `onChange`

**What goes wrong:** Using `onChange` on a `<Checkbox>` component (which is a `button` under Radix) does not fire when the checkbox is toggled. The correct prop is `onCheckedChange`.

**Why it happens:** Radix `CheckboxPrimitive.Root` renders as a `<button>`, not an `<input type="checkbox">`. It fires `onCheckedChange(checked: CheckedState)`.

**How to avoid:** Always use `onCheckedChange` on the shadcn `Checkbox` component.

**Warning signs:** Handler never fires, no TypeScript error (because `onChange` is valid on a div/button prop but silently does nothing for checkbox semantics).

### Pitfall 2: `checked` Prop Type for Indeterminate

**What goes wrong:** TypeScript error when passing `'indeterminate'` to the shadcn `Checkbox` `checked` prop if the type is inferred as `boolean`.

**Why it happens:** The `checked` prop from Radix is typed as `CheckedState = boolean | 'indeterminate'`. If your state variable is typed as `boolean`, TypeScript rejects the string.

**How to avoid:** Type the Select All state as `boolean | 'indeterminate'` explicitly:
```typescript
const [selectAll, setSelectAll] = useState<boolean | 'indeterminate'>(true);
```
Or derive it inline from `ruleIds.length` as shown in the Pattern 2 example above.

### Pitfall 3: Vitest Config Does Not Include `.tsx` Test Files

**What goes wrong:** Test files placed in `src/**/__tests__/**/*.test.tsx` are not picked up by the existing Vitest config.

**Why it happens:** `vitest.config.ts` currently uses `include: ['src/**/__tests__/**/*.test.ts']` — note `.ts` extension only, not `.tsx`.

**How to avoid:** Phase 5 tests should be written as `.test.ts` files that test logic, not React components. Use the integration test pattern already established (import and call functions, assert results). Full React component testing (RTL) would require `jsdom` environment and is out of scope for v1. Alternatively, if component tests are added, update the `include` glob to `['src/**/__tests__/**/*.test.{ts,tsx}']`.

**Decision for this phase:** Keep all tests as `.test.ts` files testing extractable logic (form state derivations, Select All state computation). This avoids the need to add `@testing-library/react` or change the Vitest environment from `node` to `jsdom`.

### Pitfall 4: Server Action Import in Client Component

**What goes wrong:** ESLint or TypeScript error when importing from `@/app/actions/runTest` in a client component, or the server action gets bundled into the client bundle.

**Why it happens:** Next.js App Router enforces a server/client boundary. However, importing a `'use server'` function into a `'use client'` component is explicitly supported — Next.js replaces the function with a client-side RPC stub automatically. No special handling needed.

**How to avoid:** Just import directly: `import { runTest } from '@/app/actions/runTest'`. Next.js handles the rest. The function call goes over the network to the server — `await runTest(params)` will make an HTTP POST request internally.

### Pitfall 5: `startTransition` with Async in Older React

**What goes wrong:** In React 18, `startTransition` does not accept async functions. The `isPending` state does not track async operations.

**Why it happens:** Async support in `startTransition` was added in React 19.

**How to avoid:** The project uses React 19.2.3 (confirmed in `package.json`). `startTransition(async () => { ... })` works correctly. No workaround needed.

### Pitfall 6: Entity Count Input — Empty String Edge Case

**What goes wrong:** If the user clears a number input field, `e.target.value` is `''`. `parseInt('', 10)` returns `NaN`. Storing `NaN` in state causes React rendering issues and will fail Zod's `.int()` validation.

**Why it happens:** HTML `<input type="number">` returns an empty string when the field is blank — not `0`.

**How to avoid:** Guard with `Number.isNaN(val) ? 0 : val` in the onChange handler. This coerces blank to 0, which is a valid entity count per the schema.

### Pitfall 7: Metadata Title Still Reads "Create Next App"

**What goes wrong:** The browser tab shows "Create Next App" — looks unprofessional in a live demo.

**Why it happens:** `layout.tsx` has the default Next.js scaffold title and description.

**How to avoid:** Update `metadata` in `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'OFAC Sensitivity Testing — Crowe',
  description: 'Synthetic OFAC name degradation testing for AML screening demonstrations.',
};
```
This is `layout.tsx` which is a server component — no `'use client'` issues.

---

## Code Examples

Verified patterns from existing codebase and Next.js 15 / React 19 documentation:

### Complete Page Component Skeleton
```typescript
// src/app/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { runTest } from '@/app/actions/runTest';
import type { ActionResult, ResultRow, RunParams, Region } from '@/types';
import { REGION_VALUES } from '@/types';
import { CANONICAL_RULE_ORDER, RULE_LABELS } from '@/lib/rules';
import { MAX_ENTITY_COUNT } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Select All state derivation — pure function, easily testable
type CheckedState = boolean | 'indeterminate';
function deriveSelectAllState(selected: string[]): CheckedState {
  if (selected.length === 0) return false;
  if (selected.length === CANONICAL_RULE_ORDER.length) return true;
  return 'indeterminate';
}

const REGION_LABELS: Record<string, string> = {
  [REGION_VALUES.arabic]: 'Arabic',
  [REGION_VALUES.cjk]: 'Chinese',
  [REGION_VALUES.cyrillic]: 'Russian/Cyrillic',
  [REGION_VALUES.latin]: 'Latin/European',
};

const ENTITY_LABELS: Record<string, string> = {
  individual: 'Individual',
  business: 'Business',
  vessel: 'Vessel',
  aircraft: 'Aircraft',
};

export default function Home() {
  const [entityCounts, setEntityCounts] = useState({
    individual: 10, business: 10, vessel: 10, aircraft: 10,
  });
  const [regions, setRegions] = useState<Region[]>([
    REGION_VALUES.arabic, REGION_VALUES.cjk,
    REGION_VALUES.cyrillic, REGION_VALUES.latin,
  ]);
  const [ruleIds, setRuleIds] = useState<string[]>([...CANONICAL_RULE_ORDER]);
  const [clientName, setClientName] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const rows: ResultRow[] = result?.ok ? result.rows : [];

  const handleSubmit = () => {
    const params: RunParams = { entityCounts, regions, ruleIds, clientName };
    startTransition(async () => {
      const actionResult = await runTest(params);
      setResult(actionResult);
    });
  };

  const handleSelectAll = (checked: CheckedState) => {
    setRuleIds(checked === true ? [] : [...CANONICAL_RULE_ORDER]);
  };

  // ... render: 4 Cards + success placeholder + error banner
}
```

### Region Checkbox Toggle
```typescript
// Toggle a region in/out of the selected array
const toggleRegion = (region: Region) => {
  setRegions(prev =>
    prev.includes(region)
      ? prev.filter(r => r !== region)
      : [...prev, region]
  );
};
```

### Rule Checkbox Toggle
```typescript
// Toggle a single rule id
const toggleRule = (ruleId: string) => {
  setRuleIds(prev =>
    prev.includes(ruleId)
      ? prev.filter(r => r !== ruleId)
      : [...prev, ruleId]
  );
};
```

### Error Banner (inside Client Name card)
```typescript
{result && !result.ok && (
  <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
    {result.error}
  </div>
)}
```

### Success Placeholder (below form)
```typescript
{result?.ok && (
  <p className="text-center text-sm text-muted-foreground">
    {rows.length} results generated
  </p>
)}
```

### Submit Button with Loading State
```typescript
<Button
  type="button"
  onClick={handleSubmit}
  disabled={isPending}
  className="w-full"
>
  {isPending ? (
    <>
      <Loader2 className="animate-spin" />
      Running...
    </>
  ) : (
    'Run Test'
  )}
</Button>
```

### Number Input for Entity Count
```typescript
<Input
  id="count-individual"
  type="number"
  min={0}
  max={MAX_ENTITY_COUNT}
  value={entityCounts.individual}
  onChange={(e) => {
    const val = parseInt(e.target.value, 10);
    setEntityCounts(prev => ({
      ...prev,
      individual: Number.isNaN(val) ? 0 : val,
    }));
  }}
  disabled={isPending}
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormStatus` for pending detection | `useTransition` + `startTransition(async)` | React 19 (2024) | `startTransition` async support means no need for a nested `<form>` with `useFormStatus`; works directly with typed object calls |
| `useActionState(action, initialState)` bound to `<form>` | Manual `useState` + `startTransition` when action takes typed objects | React 19 / Next.js 15 | `useActionState` is optimal for `FormData`-based actions; for typed object actions, manual state management is cleaner |
| Radix standalone packages (`@radix-ui/react-checkbox`) | `radix-ui` unified package | 2024 | Project already uses `radix-ui` monorepo package; import as `import { Checkbox as CheckboxPrimitive } from 'radix-ui'` |

**Deprecated/outdated:**
- `useFormStatus` from `react-dom`: Still valid but only works inside a `<form>` element with a form action. Not needed here.
- `useState` + manual boolean flag for loading: Superseded by `useTransition` which integrates with React's concurrent rendering.

---

## Open Questions

1. **Should `useActionState` be used instead of manual `useState` + `startTransition`?**
   - What we know: Both work. `useActionState` is the idiomatic Next.js 15 App Router pattern for form actions. Manual `useState` + `startTransition` is simpler when the action accepts a typed object rather than `FormData`.
   - What's unclear: Whether the CONTEXT.md mention of `useActionState` is a preference or a requirement. CONTEXT.md says "both valid; choose whichever is simpler."
   - Recommendation: Use manual `useState` + `startTransition`. `runTest(params: unknown)` is already typed as a function call, not a form action. Building a `FormData` serializer for no reason adds code.

2. **Vitest environment for component tests**
   - What we know: Current vitest config uses `environment: 'node'`. React component rendering requires `jsdom`.
   - What's unclear: Whether integration-style tests (import logic functions, test pure derivations) are sufficient for FORM-01 through FORM-04, or if the planner wants component rendering tests.
   - Recommendation: Test pure logic functions (deriveSelectAllState, toggleRegion, handleSubmit result shape) in `.test.ts` files with the existing `node` environment. Do not add `@testing-library/react` or `jsdom` in this phase — that is Phase 7 scope if needed.

---

## Validation Architecture

`workflow.nyquist_validation: true` — this section is required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (exists at project root) |
| Quick run command | `npm run test -- --reporter=verbose src/app/__tests__/` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | Entity count state accepts valid integers 0–500, coerces NaN to 0 | unit (pure logic) | `npm run test -- src/app/__tests__/paramForm.test.ts` | Wave 0 |
| FORM-02 | Region toggle adds/removes from array; all 4 pre-selected on init | unit (pure logic) | `npm run test -- src/app/__tests__/paramForm.test.ts` | Wave 0 |
| FORM-03 | Rule toggle works; Select All derives correct CheckedState (true/false/indeterminate) | unit (pure logic) | `npm run test -- src/app/__tests__/paramForm.test.ts` | Wave 0 |
| FORM-04 | clientName string passed through to RunParams unchanged | unit (pure logic) | `npm run test -- src/app/__tests__/paramForm.test.ts` | Wave 0 |

**Note on test strategy:** Because the Vitest environment is `node` (no DOM), component rendering tests are not feasible without installing `jsdom` and `@testing-library/react`. Instead, all testable logic is extracted into pure helper functions that can be tested directly:

- `deriveSelectAllState(ruleIds: string[]): CheckedState` — covers FORM-03
- `toggleRegion(current: Region[], target: Region): Region[]` — covers FORM-02
- `toggleRule(current: string[], target: string): string[]` — covers FORM-03
- `parseEntityCount(raw: string): number` — covers FORM-01
- `buildRunParams(entityCounts, regions, ruleIds, clientName): RunParams` — covers all four

These functions are either inlined in `page.tsx` or extracted to `src/lib/formUtils.ts` if the planner prefers a separate module.

### Sampling Rate
- **Per task commit:** `npm run test -- src/app/__tests__/paramForm.test.ts`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/__tests__/paramForm.test.ts` — covers FORM-01, FORM-02, FORM-03, FORM-04 via pure helper function tests
- [ ] Update `vitest.config.ts` coverage `include` to add `src/app/page.tsx` or `src/lib/formUtils.ts` if helpers are extracted

*(No new framework install needed — existing Vitest 4 + node environment handles pure function tests.)*

---

## Sources

### Primary (HIGH confidence)
- Direct read of `src/types/index.ts` — `RunParams`, `ActionResult`, `ResultRow`, `Region`, `REGION_VALUES`, `ENTITY_TYPE_VALUES` exact shapes
- Direct read of `src/app/actions/runTest.ts` — server action signature `runTest(params: unknown): Promise<ActionResult>`, confirmed `'use server'` directive
- Direct read of `src/lib/rules/index.ts` — `CANONICAL_RULE_ORDER` (10 entries), `RULE_LABELS` (Record<RuleId, string>)
- Direct read of `src/lib/constants.ts` — `MAX_ENTITY_COUNT = 500`
- Direct read of `src/components/ui/checkbox.tsx` — `CheckboxPrimitive.Root` from `radix-ui`, props passthrough confirmed
- Direct read of `src/components/ui/card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` named exports confirmed
- Direct read of `src/components/ui/button.tsx` — `Button` with `disabled` prop support confirmed
- Direct read of `src/components/ui/input.tsx` — `Input` is a standard `<input>` wrapper, supports `type="number"`, `min`, `max`
- Direct read of `vitest.config.ts` — `environment: 'node'`, `include: ['src/**/__tests__/**/*.test.ts']`
- Direct read of `package.json` — React 19.2.3, Next.js 16.1.6, Vitest 4.0.18, lucide-react installed

### Secondary (MEDIUM confidence)
- React 19 `startTransition` async support — documented in React 19 release notes; confirmed by project's React version
- Next.js App Router server action import in client components — standard Next.js 15 pattern, documented officially

### Tertiary (LOW confidence)
- None — all findings verified against actual project files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all components verified by direct file reads; no speculation
- Architecture: HIGH — `RunParams` interface, `ActionResult` discriminated union, and all component APIs confirmed by source
- Pitfalls: HIGH — indeterminate checkbox, async startTransition, server action import all verified against actual versions in use
- Test strategy: MEDIUM — node-environment constraint means component rendering is not tested; pure logic extraction is a workaround, not ideal, but consistent with existing Phase 3/4 test patterns

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable dependencies; no fast-moving packages at risk of breaking changes)
