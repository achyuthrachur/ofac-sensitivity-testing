---
phase: 12-icon-pass
plan: 01
subsystem: ui
tags: [iconsax-reactjs, icons, react, tailwind, lucide-react]

# Dependency graph
requires:
  - phase: 11-tool-layout-explanations
    provides: tool/page.tsx with shadcn Button, ResultsTable virtualizer, HeroSection and CroweBrandedFooter components
provides:
  - iconsax-reactjs installed in project dependencies
  - 4 form card headings with Linear Iconsax icons (People, Global, Setting4, Building)
  - All 10 degradation rule checkbox Labels with ClipboardTick Linear icon (size=16)
  - Run Test button spinner replaced with Refresh2 (no Loader2 from lucide-react)
  - ResultsTable Score column uses TickCircle/CloseCircle Bold SVG (no Unicode)
  - DocumentDownload Bold icon on Download CSV button
  - ArrowRight Bold (size=18) on HeroSection "Configure Your Test" CTA link
  - ExportSquare Linear (size=14) on CroweBrandedFooter Crowe.com external link
affects: [13-animations, 14-polish]

# Tech tracking
tech-stack:
  added: [iconsax-reactjs@0.0.8]
  patterns:
    - "Iconsax inside shadcn Button requires className='size-auto' to bypass [&_svg:not([class*='size-'])]:size-4 selector"
    - "Iconsax in virtualizer td cells: use explicit color prop (not className) and no animate-* transforms — virtualizer owns translateY"
    - "Iconsax in map()-generated Labels: single edit in map body propagates icon to all N items"

key-files:
  created: []
  modified:
    - src/app/tool/page.tsx
    - src/components/ResultsTable.tsx
    - src/app/_components/landing/HeroSection.tsx
    - src/app/_components/landing/CroweBrandedFooter.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Use className='size-auto' on Iconsax icons inside shadcn Button to bypass the [&_svg:not([class*='size-'])]:size-4 forced resize"
  - "Use explicit hex color values (#05AB8C, #E5376B) on TickCircle/CloseCircle inside virtualizer rows — currentColor not used to avoid relying on td text-color inheritance in absolute-positioned rows"
  - "No animate-* or transform on icons in virtualizer tr children — virtualizer writes translateY directly to tr; child transforms would conflict"
  - "ClipboardTick added via CANONICAL_RULE_ORDER.map() template update — single edit applies icon to all 10 degradation rule Labels"

patterns-established:
  - "Iconsax-in-Button pattern: add className='size-auto' to every icon placed inside a shadcn <Button> component"
  - "Iconsax-in-virtualizer pattern: never use className-based animations on icons rendered inside TanStack virtualizer tr children"

requirements-completed: [ICON-01, ICON-02, ICON-03]

# Metrics
duration: 10min
completed: 2026-03-05
---

# Phase 12 Plan 01: Icon Pass Summary

**iconsax-reactjs installed; Lucide Loader2 and Unicode ✓/✗ replaced; 4 card heading icons, 10 rule checkbox icons, spinner, download icon, CTA icon, and footer external-link icon added across all 4 target files**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-05T22:25:00Z
- **Completed:** 2026-03-05T22:35:31Z
- **Tasks:** 3
- **Files modified:** 6 (4 source + package.json + package-lock.json)

## Accomplishments
- Installed `iconsax-reactjs` and replaced Lucide `Loader2` import fully — no lucide-react remains in tool/page.tsx
- Added Iconsax Linear icons to all 4 form card headings (People, Global, Setting4, Building) using CSS variable color
- Added `ClipboardTick Linear` (size=16, currentColor) to all 10 degradation rule checkbox Labels via the existing `.map()` — single edit propagated to all rules
- Replaced Unicode `✓`/`✗` score indicators with `TickCircle`/`CloseCircle Bold` SVG icons using explicit brand-safe hex colors (#05AB8C / #E5376B) — safe for TanStack virtualizer absolute-positioned rows
- Added `DocumentDownload Bold` (size=16, size-auto) to Download CSV button with proper Button SVG bypass
- Added `ArrowRight Bold` (size=18) to HeroSection CTA link with items-center gap-1 alignment
- Added `ExportSquare Linear` (size=14) to CroweBrandedFooter Crowe.com external link

## Task Commits

1. **Task 1: Install iconsax-reactjs and update tool/page.tsx** - `cef0311` (feat)
2. **Task 2: Replace Unicode indicators and add Download icon in ResultsTable** - `127729f` (feat)
3. **Task 3: Add ICON-02 CTA and footer nav icons to HeroSection and CroweBrandedFooter** - `fa75ee2` (feat)

## Files Created/Modified
- `src/app/tool/page.tsx` - Replaced Loader2 with Refresh2; added People/Global/Setting4/Building to CardTitles; added ClipboardTick to all 10 rule Labels
- `src/components/ResultsTable.tsx` - Added TickCircle/CloseCircle replacing Unicode; added DocumentDownload to Download CSV button
- `src/app/_components/landing/HeroSection.tsx` - Added ArrowRight Bold to CTA Link
- `src/app/_components/landing/CroweBrandedFooter.tsx` - Added ExportSquare Linear to Crowe.com link
- `package.json` - Added iconsax-reactjs dependency
- `package-lock.json` - Updated lockfile

## Decisions Made
- Used `className="size-auto"` on Iconsax icons inside shadcn `<Button>` to bypass the `[&_svg:not([class*='size-'])]:size-4` selector in button.tsx
- Used explicit hex colors (#05AB8C / #E5376B) on Score column icons rather than `currentColor` — virtualizer absolute-positioned rows have complex color inheritance
- No transforms or animate-* classes on virtualizer td icons — TanStack virtualizer writes `translateY` directly to `<tr>` style; child transforms conflict

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- All 4 target files now import from `iconsax-reactjs` — Phase 13 animation work can reference same import pattern
- Iconsax Button bypass pattern (`size-auto`) established — use consistently for any future icon-in-button additions
- No blockers for Phase 13 (Anime.js animations)

---
*Phase: 12-icon-pass*
*Completed: 2026-03-05*
