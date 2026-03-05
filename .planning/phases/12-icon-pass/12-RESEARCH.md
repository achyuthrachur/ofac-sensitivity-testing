# Phase 12: Icon Pass - Research

**Researched:** 2026-03-05
**Domain:** Iconsax icon library integration — replacing Lucide icons and Unicode symbols with Iconsax components across the OFAC tool and landing page
**Confidence:** HIGH (package internals inspected directly via npm pack; component API confirmed from dist/index.d.ts and CJS source; icon name inventory confirmed from package file listing)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ICON-01 | Form section headings and rule checkboxes use Iconsax Linear icons (People, Global, Setting4, Building) | All four icon names confirmed in `iconsax-reactjs` package. Linear is the default variant. Cards in tool/page.tsx are the target locations. |
| ICON-02 | CTA buttons and navigation use Iconsax Bold icons (ArrowRight, DocumentDownload, ExternalLink equivalent) | `ArrowRight` and `DocumentDownload` confirmed. No `ExternalLink` exists — use `ExportSquare` (arrow-from-box semantic). Bold variant confirmed in API. |
| ICON-03 | Results table match/no-match indicators use Iconsax TickCircle/CloseCircle replacing Unicode characters | Unicode `✓`/`✗` confirmed at `ResultsTable.tsx` line 170. `TickCircle` and `CloseCircle` confirmed in package. SVG inside `<td>` with `position:absolute` virtualizer rows — render as inline-block, animate opacity only. |
| ICON-04 | Landing page How It Works and Stats sections use Iconsax TwoTone feature icons | HowItWorksSection.tsx uses number badges (1/2/3) — replace with TwoTone icons. FeatureStatsSection.tsx has no icons currently. TwoTone variant confirmed in API. |

</phase_requirements>

---

## Summary

Phase 12 replaces all non-Iconsax icons in the application with `iconsax-reactjs`, the React 19-compatible fork of the original `iconsax-react`. The original `iconsax-react` package uses `defaultProps` (removed in React 19) and is unmaintained since 2021. The previously documented `iconsax-react-19` fork has been removed from npm. The correct package to use is `iconsax-reactjs` (published April 2025, version 0.0.8, by erfan-ee), which uses JavaScript destructuring defaults internally — no `defaultProps` dependency, fully React 19 compatible.

All required icon names are confirmed present in the package: `People`, `Global`, `Setting4`, `Building`, `ArrowRight`, `DocumentDownload`, `TickCircle`, `CloseCircle`, `Refresh`, `Refresh2`. There is no `ExternalLink` icon — the semantic equivalent is `ExportSquare` (an arrow pointing out of a box).

The existing codebase has exactly two icon integration points to replace: (1) `Loader2` from `lucide-react` in `tool/page.tsx` used as a loading spinner on the Run Test button, and (2) Unicode `✓`/`✗` characters inline in the score column of `ResultsTable.tsx`. The landing page sections have no current icons — icons will be added as net new additions to HowItWorksSection and FeatureStatsSection. The shadcn `button.tsx` in this project already uses the smarter `[&_svg:not([class*='size-'])]:size-4` selector, which means icons that have an explicit `className` containing a size will NOT be overridden — patch strategy changes accordingly.

**Primary recommendation:** Install `iconsax-reactjs`, replace `Loader2` with `Refresh2` in the Run Test button, replace Unicode indicators in `ResultsTable`, add section-heading icons to the tool form cards, and add TwoTone feature icons to the landing page How It Works steps. Do not remove `lucide-react` until after all replacements are verified working.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| iconsax-reactjs | 0.0.8 | Crowe-brand icon set — 1000 icons × 6 styles | React 19 compatible (no defaultProps); CLAUDE.md approved icon library; package published April 2025 with `react: '*'` peer dep; confirmed no `prop-types` dependency |

### NOT to Install

| Package | Why |
|---------|-----|
| iconsax-react | Original — uses `defaultProps`, broken on React 19; unmaintained since 2021 |
| iconsax-react-19 | Removed from npm registry (was version 1.2.5; no longer available as of research date) |

### Installation

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install iconsax-reactjs
```

No `--legacy-peer-deps` needed — peer dep is `react: '*'`.

Keep `lucide-react` installed during the pass. Remove only after all icons are replaced and verified.

---

## Architecture Patterns

### Import Pattern

```tsx
// Import from iconsax-reactjs, NOT iconsax-react (original) or iconsax-react-19 (removed)
import { ArrowRight, TickCircle, CloseCircle, Refresh2 } from 'iconsax-reactjs';

// Props: variant, color, size (all optional — defaults built into JS destructuring)
// Defaults: variant='Linear', color='currentColor', size='24'
<ArrowRight variant="Bold" size={20} color="currentColor" />
<TickCircle variant="Linear" size={16} color="var(--crowe-teal-core)" />
```

### TypeScript Props Interface (confirmed from dist/index.d.ts)

```typescript
interface IconProps extends SVGAttributes<SVGElement> {
  variant?: 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone';
  color?: string;
  size?: string | number;
}
```

All three props are optional. Defaults baked into the component via JS destructuring (not `defaultProps`), making them React 19 safe even without explicit prop passing.

### Style Variant Guide

| Variant | Use Case | Crowe Context |
|---------|----------|---------------|
| `Linear` | Body/nav icons, form section headers, labels | Default for all form UI icons (ICON-01) |
| `Bold` | CTAs, active states, primary action buttons | Run Test button, Download CSV, CTA links (ICON-02) |
| `TwoTone` | Feature highlights, landing page sections | How It Works steps, Stats section (ICON-04) |
| `Bulk` | Dashboards, secondary filled icons | Not used in this phase |
| `Outline` | Secondary buttons, medium-weight icons | Not used in this phase |
| `Broken` | Decorative accents | Not used in this phase |

### Recommended Project Structure (no changes needed)

All icons are imported inline at point of use. No wrapper component needed for this phase — icon usage is localized to 4 files.

---

## Icon Inventory: All Required Icons Confirmed

### ICON-01: Form Section Heading Icons (tool/page.tsx)

| Card | Icon Name | Component | Variant |
|------|-----------|-----------|---------|
| Entity Counts | People | `People` | Linear |
| Linguistic Regions | Global | `Global` | Linear |
| Degradation Rules | Setting4 | `Setting4` | Linear |
| Client Name | Building | `Building` | Linear |

All four confirmed present in `iconsax-reactjs` package (verified from package file listing).

### ICON-02: CTA / Navigation Icons

| Location | Purpose | Icon Name | Component | Note |
|----------|---------|-----------|-----------|------|
| Run Test button (loading state) | Spinner/loading | Refresh2 | `Refresh2` | Replaces `Loader2` from lucide-react. Apply CSS animation: `animate-spin` class. |
| Download CSV button | Download | DocumentDownload | `DocumentDownload` | Confirmed in package |
| Hero CTA "Configure Your Test" | Arrow right | ArrowRight | `ArrowRight` | Bold variant; inside `<Link>` not `<Button>` |
| Footer nav links | External link | ExportSquare | `ExportSquare` | No `ExternalLink` in iconsax — `ExportSquare` is the semantic equivalent (arrow out of box) |

### ICON-03: Results Table Indicators (ResultsTable.tsx)

Current code at line 170:
```tsx
{Math.round(row.similarityScore * 100)}% {row.caught ? '✓' : '✗'}
```

Replace with:
```tsx
{Math.round(row.similarityScore * 100)}%{' '}
{row.caught
  ? <TickCircle variant="Linear" size={14} color="var(--crowe-teal-core)" className="inline-block align-middle" />
  : <CloseCircle variant="Linear" size={14} color="var(--crowe-coral-core)" className="inline-block align-middle" />
}
```

**Critical:** The `<td>` containing these icons is inside a `position:absolute` virtual row. Do NOT add `translateY` animation to these icons or their `<td>`. Inline rendering only.

### ICON-04: Landing Page Icons

**HowItWorksSection.tsx** — Replace number badges (1, 2, 3) with TwoTone icons:

| Step | Concept | Suggested Icon | Component |
|------|---------|----------------|-----------|
| 1 — Configure | Settings/gear | `Setting4` | TwoTone |
| 2 — Run | Refresh/execute | `Refresh` | TwoTone |
| 3 — Export | Document download | `DocumentDownload` | TwoTone |

**FeatureStatsSection.tsx** — Add small TwoTone icons above each stat label:

| Stat | Icon | Component |
|------|------|-----------|
| 285 SDN Entries | Document text | `Document` | TwoTone |
| 10 Rules | Setting4 | `Setting4` | TwoTone |
| 4 Regions | Global | `Global` | TwoTone |
| 53ms Processing | Refresh2 | `Refresh2` | TwoTone |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading spinner | Custom SVG animation or CSS border-spinner | `Refresh2` with `animate-spin` | Consistent icon set; single import |
| Match/no-match indicators | Unicode characters or emoji | `TickCircle` / `CloseCircle` | Accessible, scalable, Crowe-brand teal/coral colors |
| Custom SVG icons for landing page | Inline SVG paths | `iconsax-reactjs` TwoTone components | Already sized, colored, and styled correctly |

**Key insight:** The Iconsax library already renders clean `<svg>` elements with correct `viewBox`, `width`, `height`, and `fill`/`stroke` — no SVG boilerplate needed.

---

## Common Pitfalls

### Pitfall 1: Installing the Wrong Package

**What goes wrong:** `npm install iconsax-react` installs the broken 2021 package. Icons render with no `size` or `color` because React 19 removed `defaultProps`.

**How to avoid:** Always install `iconsax-reactjs` (note the `js` suffix). Import from `'iconsax-reactjs'`, not `'iconsax-react'`.

**Warning signs:** Icons render as 24px black squares (the SVG viewBox size without scaling). `DevTools > Elements` shows no `width` or `height` attributes on the `<svg>`.

### Pitfall 2: Button SVG Size Override — PARTIALLY MITIGATED by Newer shadcn

**What goes wrong:** Prior research documented `[&_svg]:size-4` on button.tsx forcing all SVGs to 16px.

**What this project actually has:** `[&_svg:not([class*='size-'])]:size-4` — a smarter selector that only applies to SVGs without an explicit size class. This means if you add `className="size-5"` directly to an Iconsax component, the button selector will NOT override it.

**Implication:** No button.tsx patch is strictly required. However, note that Iconsax components set `width` and `height` via the `size` prop as SVG attributes, not via Tailwind classes. The button's CSS selector targets SVGs without a `size-*` class. Because Iconsax does not add a `size-*` class, the `[&_svg:not([class*='size-'])]:size-4` rule WILL still apply inside buttons.

**Correct fix:** Add `className="size-auto"` to every Iconsax icon placed inside a `<Button>` to bypass the button selector. Example:
```tsx
<Button>
  <DocumentDownload variant="Bold" size={16} className="size-auto" />
  Download CSV
</Button>
```

This is less invasive than patching button.tsx but must be applied consistently to every icon-in-button usage.

**Alternative:** Still patch button.tsx to add `size-auto` as the default SVG behavior — removes the need for per-icon `className`.

### Pitfall 3: Spinner Animation — `animate-spin` Class Conflict with Iconsax SVG

**What goes wrong:** `Loader2` from Lucide works with `animate-spin` because it's a circular stroke. `Refresh2` from Iconsax is also circular but the animation axis may look different. The `animate-spin` class applies `transform: rotate(360deg)` continuously — works on any element.

**How to avoid:** Use `<Refresh2 className="animate-spin" size={16} color="currentColor" />` directly. Confirm visually in dev that the spin direction looks correct (Refresh2 arrows point counter-clockwise — the `animate-spin` clockwise rotation should match user expectation).

**Alternative:** If spin direction looks wrong, use `className="animate-[spin_1s_linear_infinite_reverse]"` for reverse spin.

### Pitfall 4: TwoTone Icons on Dark Indigo Background

**What goes wrong:** TwoTone icons use `opacity: 0.4` on the secondary path, which is designed for light backgrounds. On the dark `bg-crowe-indigo-dark` background in `FeatureStatsSection`, a TwoTone icon with `color="white"` will show the primary path at full opacity and the secondary path at 40% opacity — which may look dim.

**How to avoid:** On dark backgrounds, use `Bold` variant instead of `TwoTone` for maximum contrast. Alternatively use `color="var(--crowe-amber-core)"` for TwoTone icons on indigo backgrounds — the amber color at 40% opacity still reads clearly.

**For HowItWorksSection** (white card on off-white background): TwoTone with `color="var(--crowe-indigo-dark)"` works correctly.

**For FeatureStatsSection** (indigo dark background): Use `Bold` variant with `color="var(--crowe-amber-core)"` for best contrast.

### Pitfall 5: Icons in Virtual Table Rows — No Transform Animation

**What goes wrong:** Attempting to animate `TickCircle`/`CloseCircle` icons with `translateY` or `opacity` transitions on individual `<td>` elements conflicts with the TanStack virtualizer's `position:absolute; transform: translateY(Xpx)` on each `<tr>`.

**How to avoid:** Render `TickCircle`/`CloseCircle` as static, non-animated elements. Use only `color` and `size` props. If a transition is desired on the indicator column, use CSS `transition: color 150ms ease` on the `<td>` only — opacity and transform are off limits.

### Pitfall 6: `ExternalLink` Does Not Exist

**What goes wrong:** Importing `ExternalLink` from `iconsax-reactjs` throws a TypeScript error because that exact name does not exist in the library.

**How to avoid:** Use `ExportSquare` as the semantic equivalent. It renders an arrow pointing out of a square box — the standard "open in new tab" affordance.

---

## Code Examples

### Installing and Basic Import

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install iconsax-reactjs
```

```tsx
// Correct import (iconsax-reactjs, not iconsax-react)
import { People, Global, Setting4, Building } from 'iconsax-reactjs';
import { ArrowRight, DocumentDownload, ExportSquare } from 'iconsax-reactjs';
import { TickCircle, CloseCircle } from 'iconsax-reactjs';
import { Refresh2 } from 'iconsax-reactjs';
```

### Form Card Header with Linear Icon (ICON-01)

```tsx
// In tool/page.tsx — add icon to CardTitle
import { People } from 'iconsax-reactjs';

<CardTitle className="flex items-center gap-2">
  <People variant="Linear" size={18} color="var(--crowe-indigo-dark)" />
  Entity Counts
</CardTitle>
```

### Run Test Button Spinner Replacement (ICON-02)

```tsx
// Replace: <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// With:
import { Refresh2 } from 'iconsax-reactjs';

{isPending ? (
  <>
    <Refresh2 size={16} color="currentColor" className="animate-spin size-auto" />
    Running...
  </>
) : (
  'Run Test'
)}
```

### Download CSV Button with Icon (ICON-02)

```tsx
import { DocumentDownload } from 'iconsax-reactjs';

<Button variant="outline" size="sm" onClick={handleDownload} disabled={rows.length === 0}>
  <DocumentDownload variant="Bold" size={16} color="currentColor" className="size-auto" />
  Download CSV
</Button>
```

### Results Table Score Column — Iconsax Indicators (ICON-03)

```tsx
import { TickCircle, CloseCircle } from 'iconsax-reactjs';

// In the score <td>:
<td
  style={{ width: COL_WIDTHS[5].width, flexShrink: 0 }}
  className={`px-3 py-2 text-sm font-mono flex items-center gap-1 ${
    row.caught ? 'text-crowe-teal' : 'text-crowe-coral'
  }`}
>
  {Math.round(row.similarityScore * 100)}%
  {row.caught
    ? <TickCircle variant="Linear" size={14} color="var(--crowe-teal-core)" />
    : <CloseCircle variant="Linear" size={14} color="var(--crowe-coral-core)" />
  }
</td>
```

### HowItWorksSection — TwoTone Step Icons (ICON-04)

```tsx
import { Setting4, Refresh, DocumentDownload } from 'iconsax-reactjs';

const STEP_ICONS = [Setting4, Refresh, DocumentDownload];

// Replace the number badge with icon:
<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-crowe-amber/10 mb-4">
  {React.createElement(STEP_ICONS[step.number - 1], {
    variant: 'TwoTone',
    size: 28,
    color: 'var(--crowe-indigo-dark)',
  })}
</div>
```

### FeatureStatsSection — Bold Icons on Dark Background (ICON-04)

```tsx
import { Document, Setting4, Global, Refresh2 } from 'iconsax-reactjs';

const STAT_ICONS = [Document, Setting4, Global, Refresh2];

// Add above each stat number:
{React.createElement(STAT_ICONS[index], {
  variant: 'Bold',
  size: 32,
  color: 'var(--crowe-amber-core)',
})}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `iconsax-react` with `defaultProps` | `iconsax-reactjs` with JS destructuring defaults | React 19 compatible; same API surface |
| `iconsax-react-19` fork | Removed from npm — do not use | Use `iconsax-reactjs` instead |
| Lucide icons for all UI | Lucide only for Loader2 (being replaced) | After phase: 0 Lucide icons in production |
| Unicode ✓/✗ characters | Iconsax TickCircle/CloseCircle | Scalable SVG, correct brand colors |

**Deprecated/outdated:**
- `iconsax-react` (v0.0.8, 2021): React 19 broken, uses `defaultProps` and `prop-types`
- `iconsax-react-19` (v1.2.5): Removed from npm registry
- `Loader2` from `lucide-react`: Replace with `Refresh2` from `iconsax-reactjs`
- Unicode `✓`/`✗` in `ResultsTable.tsx`: Replace with `TickCircle`/`CloseCircle`

---

## Open Questions

1. **Spinner direction of Refresh2**
   - What we know: `Refresh2` is a circular arrow icon; `animate-spin` rotates clockwise
   - What's unclear: Whether clockwise spin matches the visual expectation for a "loading" state
   - Recommendation: Verify in dev; use `animate-[spin_1s_linear_infinite_reverse]` if rotation direction looks wrong

2. **Icon alignment in virtual table `<td>`**
   - What we know: Virtual rows use `display: flex` on `<tr>`; `<td>` content is block-level
   - What's unclear: Whether inline `TickCircle`/`CloseCircle` SVG elements align correctly with the score text without additional flex/inline-flex on the `<td>`
   - Recommendation: Add `flex items-center gap-1` to the score `<td>` className to ensure correct vertical alignment

3. **HowItWorksSection icon choice for step 3 (Export)**
   - What we know: `DocumentDownload` exists in the package
   - What's unclear: Whether `DocumentDownload` or `ExportSquare` better represents the "export CSV" concept visually
   - Recommendation: Use `DocumentDownload` — it's more directly semantically linked to file download

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vite.config.ts` (or root vitest config) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ICON-01 | Form section heading icons render without error | Visual (no unit test appropriate) | `npm run build` — TypeScript compile validates imports | N/A — build gate |
| ICON-02 | CTA buttons render correct icon variants | Visual (no unit test appropriate) | `npm run build` — TypeScript compile validates import names | N/A — build gate |
| ICON-03 | TickCircle/CloseCircle replace Unicode characters | Manual visual | `npm run build` + visual inspection | N/A |
| ICON-04 | Landing page feature icons render | Visual | `npm run build` + visual inspection | N/A |

**Note:** Icon rendering is inherently visual. The primary automated gate is `npm run build` (TypeScript compilation catches wrong import names or missing exports). Visual inspection at `localhost:3000` confirms correct variant, size, and color.

### Sampling Rate

- **Per task commit:** `npm run build` — verifies TypeScript and import correctness
- **Per wave merge:** `npm run build && npm test` — full suite
- **Phase gate:** Build green + visual pass before `/gsd:verify-work`

### Wave 0 Gaps

None — no new test files are needed. The existing test suite does not cover visual rendering, and that is appropriate for icon integration work.

---

## Complete Icon Name Reference (Confirmed in iconsax-reactjs 0.0.8)

Verified by direct inspection of the package tarball file listing:

| Component Name | Available | Notes |
|----------------|-----------|-------|
| `People` | YES | Person/group icon |
| `Global` | YES | Earth/globe icon |
| `Setting4` | YES | Gear icon variant 4 |
| `Building` | YES | Office building |
| `Building3` | YES | Alternative building |
| `Building4` | YES | Alternative building |
| `Buildings` | YES | Multiple buildings |
| `ArrowRight` | YES | Right arrow |
| `ArrowRight2` | YES | Alternative style |
| `DocumentDownload` | YES | Download file icon |
| `ExportSquare` | YES | External link equivalent (arrow out of box) |
| `TickCircle` | YES | Check mark in circle |
| `CloseCircle` | YES | X mark in circle |
| `Refresh` | YES | Refresh/reload icon |
| `Refresh2` | YES | Alternative refresh (circular) |
| `RefreshCircle` | YES | Circular refresh |
| `Document` | YES | Plain document |
| `ExternalDrive` | YES | Note: this is a storage device icon, NOT external link |

**NOT in the library:**
- `ExternalLink` — use `ExportSquare` instead

---

## Sources

### Primary (HIGH confidence)
- Direct package inspection — `NODE_TLS_REJECT_UNAUTHORIZED=0 npm pack iconsax-reactjs` + `tar -tf` listing — all icon names verified
- `package/dist/index.d.ts` from `iconsax-reactjs-0.0.8.tgz` — `IconProps` interface confirmed: `variant`, `color`, `size` types
- `package/dist/cjs/ArrowRight.js` from `iconsax-reactjs-0.0.8.tgz` — JS destructuring defaults confirmed (React 19 compatible, no `defaultProps`)
- `npm info iconsax-reactjs` — version 0.0.8, published 2025-04-13, peerDependencies `{ react: '*' }`, no `prop-types` dependency
- `npm info iconsax-react` — version 0.0.8, `prop-types: ^15.7.2` dependency (confirming React 19 issue via `defaultProps`)
- Codebase inspection `src/app/tool/page.tsx` line 29 — `import { Loader2 } from 'lucide-react'` confirmed
- Codebase inspection `src/components/ResultsTable.tsx` line 170 — Unicode `✓`/`✗` confirmed
- Codebase inspection `src/components/ui/button.tsx` line 8 — actual selector is `[&_svg:not([class*='size-'])]:size-4`, NOT `[&_svg]:size-4`

### Secondary (MEDIUM confidence)
- WebSearch: `iconsax-react-19` confirmed removed from npm registry (Socket.dev and libraries.io references still exist but package is not available)
- WebSearch: `iconsax-react` GitHub issue #18 — React 19 `defaultProps` removal breakage confirmed

### Tertiary (LOW confidence)
- WebSearch: `iconsax-reactjs` described as React 19-compatible — LOW confidence from search summary alone, but elevated to HIGH by direct package source inspection

---

## Metadata

**Confidence breakdown:**
- Package identity (`iconsax-reactjs` vs others): HIGH — npm info + source inspection
- Icon name inventory: HIGH — direct package file listing
- React 19 compatibility: HIGH — confirmed via source code (JS destructuring, no defaultProps)
- button.tsx patch strategy: HIGH — confirmed actual selector from file read
- TwoTone on dark background behavior: MEDIUM — based on understanding of SVG opacity rendering
- Spinner direction of Refresh2: LOW — needs visual confirmation in dev

**Research date:** 2026-03-05
**Valid until:** 2026-06-05 (stable package; no active release cadence on iconsax-reactjs)
